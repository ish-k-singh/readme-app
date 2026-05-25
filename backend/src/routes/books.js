import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { query } from '../db/index.js';

export const booksRouter = Router();

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

// Maps raw OL subjects to clean display tags
const TAG_MAP = [
  ['science fiction', 'Sci-Fi'],
  ['dystopia', 'Dystopia'],
  ['fantasy', 'Fantasy'],
  ['mystery', 'Mystery'],
  ['thriller', 'Thriller'],
  ['horror', 'Horror'],
  ['romance', 'Romance'],
  ['historical fiction', 'Historical'],
  ['biography', 'Biography'],
  ['autobiography', 'Memoir'],
  ['memoir', 'Memoir'],
  ['self-help', 'Self-Help'],
  ['literary fiction', 'Literary'],
  ['coming of age', 'Coming-of-Age'],
  ['coming-of-age', 'Coming-of-Age'],
  ['short stories', 'Short Stories'],
  ['poetry', 'Poetry'],
  ['graphic novel', 'Graphic Novel'],
  ['young adult', 'YA'],
  ["children's", "Children's"],
  ['nonfiction', 'Nonfiction'],
  ['travel', 'Travel'],
  ['philosophy', 'Philosophy'],
  ['psychology', 'Psychology'],
  ['history', 'History'],
  ['nature', 'Nature'],
  ['humor', 'Humor'],
  ['satire', 'Satire'],
  ['family', 'Family'],
  ['friendship', 'Friendship'],
  ['war', 'War'],
  ['magic', 'Magical Realism'],
  ['magical realism', 'Magical Realism'],
  ['climate', 'Climate'],
  ['race', 'Race'],
  ['feminist', 'Feminist'],
  ['lgbtq', 'LGBTQ+'],
  ['queer', 'LGBTQ+'],
  ['immigrant', 'Immigrant'],
  ['class', 'Class'],
  ['addiction', 'Addiction'],
  ['grief', 'Grief'],
];

function normalizeTags(subjects = []) {
  const seen = new Set();
  const out = [];
  for (const s of subjects.slice(0, 50)) {
    const lower = s.toLowerCase();
    for (const [key, val] of TAG_MAP) {
      if (lower.includes(key) && !seen.has(val)) {
        seen.add(val);
        out.push(val);
        break;
      }
    }
    if (out.length >= 5) break;
  }
  // Fallback: if we got fewer than 3, pull short clean subjects
  if (out.length < 3) {
    for (const s of subjects.slice(0, 20)) {
      if (s.length < 28 && !/\d|,|–|-/.test(s) && !seen.has(s.toLowerCase())) {
        const clean = s.split(' ').map(w => w[0]?.toUpperCase() + w.slice(1)).join(' ');
        out.push(clean);
        seen.add(s.toLowerCase());
        if (out.length >= 5) break;
      }
    }
  }
  return out.slice(0, 5);
}

// NOTE: /search, /import, /:id/why must come before /:id

// GET /api/books/search?q= — proxy to OpenLibrary
booksRouter.get('/search', async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) return res.json([]);

    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(q.trim())}&limit=20&fields=key,title,author_name,first_publish_year,number_of_pages_median,isbn,cover_i,subject`;
    const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!r.ok) return res.json([]);

    const { docs = [] } = await r.json();
    const results = docs
      .filter(d => d.title && d.author_name?.length)
      .map(d => ({
        ol_key:  d.key,
        title:   d.title,
        author:  d.author_name[0],
        year:    d.first_publish_year || null,
        pages:   d.number_of_pages_median || null,
        cover_i: d.cover_i || null,
        isbn:    d.isbn?.[0] || null,
        tags:    normalizeTags(d.subject),
      }));

    res.json(results);
  } catch (err) { next(err); }
});

// POST /api/books/import — save an OpenLibrary book into the local catalog
booksRouter.post('/import', async (req, res, next) => {
  try {
    const { ol_key, title, author, year, pages, tags = [] } = req.body;
    if (!ol_key || !title) return res.status(400).json({ error: 'ol_key and title required' });

    const { rows: existing } = await query('SELECT * FROM books WHERE ol_key = $1', [ol_key]);
    if (existing.length) return res.json(existing[0]);

    const id = 'ol_' + ol_key.replace(/\W+/g, '_').replace(/^_+|_+$/g, '');
    const cover = makeCover(ol_key);
    const cleanTags = tags.length ? normalizeTags(tags) : [];

    const { rows } = await query(
      `INSERT INTO books (id, title, author, year, pages, tags, cover, ol_key)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (id) DO UPDATE SET title=$2
       RETURNING *`,
      [id, title, author, year || null, pages || null, cleanTags, JSON.stringify(cover), ol_key]
    );
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// POST /api/books/:id/why — generate and cache a "why read this" blurb
booksRouter.post('/:id/why', async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM books WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    const book = rows[0];

    if (book.why) return res.json({ why: book.why });

    const anthropic = new Anthropic();
    const msg = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 80,
      messages: [{
        role: 'user',
        content: `Write one evocative sentence (max 22 words) on why someone should read "${book.title}" by ${book.author}. Be specific. No quotes around your answer.`,
      }],
    });

    const why = msg.content[0].text.trim().replace(/^["']|["']$/g, '');
    await query('UPDATE books SET why = $1 WHERE id = $2', [why, book.id]);
    res.json({ why });
  } catch (err) { next(err); }
});

// GET /api/books — list all books, optional ?tag= or ?q= filter
booksRouter.get('/', async (req, res, next) => {
  try {
    const { tag, q } = req.query;
    let sql = 'SELECT * FROM books';
    const params = [];

    if (tag) {
      params.push(tag);
      sql += ` WHERE $${params.length} = ANY(tags)`;
    } else if (q) {
      params.push(`%${q.toLowerCase()}%`);
      sql += ` WHERE lower(title) LIKE $${params.length} OR lower(author) LIKE $${params.length}`;
    }

    sql += ' ORDER BY rating DESC';
    const { rows } = await query(sql, params);
    res.json(rows);
  } catch (err) { next(err); }
});

// GET /api/books/:id
booksRouter.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM books WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});
