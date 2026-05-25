import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { query, pool } from '../db/index.js';

export const adminRouter = Router();

const SHAPES = ['split','circle','arrow','stripe','dot','wave','serif','stack','block'];
const PALETTES = [
  { bg:'#F4ECD8', ink:'#1A1A1A', accent:'#2849A3' },
  { bg:'#2849A3', ink:'#F4ECD8', accent:'#F4ECD8' },
  { bg:'#C75A3A', ink:'#F4ECD8', accent:'#F4ECD8' },
  { bg:'#1A1A1A', ink:'#F4ECD8', accent:'#2849A3' },
  { bg:'#6B7C32', ink:'#F4ECD8', accent:'#F4ECD8' },
  { bg:'#DCC9A4', ink:'#1A1A1A', accent:'#2849A3' },
];

function strHash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
function makeCover(key) {
  const h = strHash(key);
  return { shape: SHAPES[h % SHAPES.length], ...PALETTES[(h >> 3) % PALETTES.length] };
}

// Search OL for a book by title+author and import it into the DB
async function importFromOL(title, author) {
  try {
    const q = encodeURIComponent(`${title} ${author}`);
    const r = await fetch(
      `https://openlibrary.org/search.json?q=${q}&limit=3&fields=key,title,author_name,first_publish_year,number_of_pages_median,cover_i,subject`,
      { signal: AbortSignal.timeout(7000) }
    );
    if (!r.ok) return null;
    const { docs = [] } = await r.json();
    if (!docs.length) return null;

    // Skip study guides, SparkNotes, etc.
    const JUNK = ['sparknote', 'study guide', 'cliffs note', 'cliff note', 'bookrags', 'summary and analysis', 'graphic novel adaptation'];
    const clean = docs.filter(d => d.title && !JUNK.some(j => d.title.toLowerCase().includes(j)));
    if (!clean.length) return null;

    // Prefer a result whose title roughly matches
    const lc = title.toLowerCase();
    const doc = clean.find(d => d.title?.toLowerCase().includes(lc.split(':')[0].trim())) || clean[0];
    if (!doc?.key || !doc.title) return null;

    const { rows: existing } = await query('SELECT * FROM books WHERE ol_key = $1', [doc.key]);
    if (existing.length) return existing[0];

    const id = 'ol_' + doc.key.replace(/\W+/g, '_').replace(/^_+|_+$/g, '');
    const cover = makeCover(doc.key);
    const tags = (doc.subject || []).slice(0, 5);

    const { rows } = await query(
      `INSERT INTO books (id, title, author, year, pages, tags, cover, ol_key)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (id) DO UPDATE SET title=$2
       RETURNING *`,
      [id, doc.title, doc.author_name?.[0] || author,
       doc.first_publish_year || null, doc.number_of_pages_median || null,
       tags, JSON.stringify(cover), doc.key]
    );
    return rows[0];
  } catch { return null; }
}

const ACCENTS = {
  r_classics:      '#1A1A1A',
  r_comingofage:   '#2849A3',
  r_romcom:        '#C75A3A',
  r_scifi:         '#6B7C32',
  r_international: '#DCC9A4',
};

// POST /api/admin/refresh-readlists
// 1. Claude picks popular books by name for each category
// 2. Each book is searched on OpenLibrary and imported into the DB
// 3. Readlists are updated in the DB
// Protected by Authorization: Bearer <ADMIN_SECRET>
// Set up a free weekly cron at cron-job.org to call this after deployment.
adminRouter.post('/refresh-readlists', async (req, res, next) => {
  try {
    const secret = process.env.ADMIN_SECRET;
    if (!secret || req.headers.authorization !== `Bearer ${secret}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const anthropic = new Anthropic();
    const msg = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `You curate editorial readlists for a literary book app. Pick 5 popular, well-known books per category. Choose titles easily found in OpenLibrary. Return only valid JSON, no other text:

[
  {
    "id": "r_classics",
    "title": "Classics Everyone Should Read",
    "pitch": "1-2 punchy sentences about why to read these",
    "books": [{"title": "...", "author": "..."}, ...]
  },
  {
    "id": "r_comingofage",
    "title": "Coming of Age",
    "pitch": "...",
    "books": [{"title": "Harry Potter and the Sorcerer's Stone", "author": "J.K. Rowling"}, {"title": "The Perks of Being a Wallflower", "author": "Stephen Chbosky"}, ...]
  },
  {
    "id": "r_romcom",
    "title": "Rom-Com Inspired",
    "pitch": "...",
    "books": [...]
  },
  {
    "id": "r_scifi",
    "title": "Sci-Fi",
    "pitch": "...",
    "books": [...]
  },
  {
    "id": "r_international",
    "title": "Most Popular International",
    "pitch": "...",
    "books": [...]
  }
]

Guidelines per category:
- Classics: To Kill a Mockingbird, 1984, Pride and Prejudice, Charlotte's Web, The Great Gatsby, etc.
- Coming of Age: Harry Potter, Perks of Being a Wallflower, The Catcher in the Rye, Little Women, etc.
- Rom-Com: Beach Read, People We Meet on Vacation, The Hating Game, etc. (fun contemporary romance)
- Sci-Fi: mix of Dune, Ender's Game, The Hitchhiker's Guide, modern hits
- International: Elena Ferrante, Haruki Murakami, Gabriel García Márquez, Chimamanda Ngozi Adichie, etc.`,
      }],
    });

    const text = msg.content[0].text;
    const match = text.match(/\[[\s\S]+\]/);
    if (!match) return res.status(500).json({ error: 'Claude returned no JSON array' });

    const lists = JSON.parse(match[0]);

    // Import each book from OL sequentially (polite rate limiting)
    const enriched = [];
    for (const list of lists) {
      const imported = [];
      for (const book of list.books) {
        const row = await importFromOL(book.title, book.author);
        if (row) imported.push(row);
        await new Promise(r => setTimeout(r, 250));
      }
      enriched.push({ ...list, imported });
    }

    // Update readlists in DB
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const list of enriched) {
        const totalPages = list.imported.reduce((s, b) => s + (b.pages || 0), 0);
        const sub = `${list.imported.length} books${totalPages ? ' · ' + totalPages.toLocaleString() + ' pages' : ''}`;

        await client.query(
          `INSERT INTO readlists (id, title, sub, pitch, accent, curator, ai, saves)
           VALUES ($1,$2,$3,$4,$5,'ReadMe Editorial',false,0)
           ON CONFLICT (id) DO UPDATE SET title=$2, sub=$3, pitch=$4`,
          [list.id, list.title, sub, list.pitch, ACCENTS[list.id] || '#2849A3']
        );
        await client.query('DELETE FROM readlist_books WHERE readlist_id = $1', [list.id]);
        for (let i = 0; i < list.imported.length; i++) {
          await client.query(
            'INSERT INTO readlist_books (readlist_id, book_id, position) VALUES ($1,$2,$3)',
            [list.id, list.imported[i].id, i]
          );
        }
      }
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }

    res.json({
      ok: true,
      lists: enriched.map(l => ({
        id: l.id,
        title: l.title,
        books: l.imported.map(b => b.title),
      })),
    });
  } catch (err) { next(err); }
});
