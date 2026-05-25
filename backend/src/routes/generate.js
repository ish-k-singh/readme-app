import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { query } from '../db/index.js';

export const generateRouter = Router();

const client = new Anthropic();

// POST /api/generate
// Body: { vibe, moods[], genres[], length, count, readIds[] }
// Returns: { title, pitch, books: [{ id, title, author, why, ...book }] }
generateRouter.post('/', async (req, res, next) => {
  try {
    const { vibe, moods = [], genres = [], length, count = 6, readIds = [] } = req.body;

    if (!vibe && !moods.length) {
      return res.status(400).json({ error: 'Provide at least a vibe or a mood.' });
    }

    // Load catalog from DB
    const { rows: catalog } = await query('SELECT * FROM books ORDER BY id');

    const available = catalog.filter(b => !readIds.includes(b.id));
    const alreadyRead = catalog.filter(b => readIds.includes(b.id));

    // Build a compact catalog summary for the prompt
    const catalogLines = available.map(b =>
      `- ${b.id}: "${b.title}" by ${b.author} (${b.year}, ${b.pages}pp) [${b.tags.join(', ')}]`
    ).join('\n');

    const readLines = alreadyRead.length
      ? alreadyRead.map(b => `- "${b.title}" by ${b.author} [${b.tags.join(', ')}]`).join('\n')
      : '(none yet)';

    const prompt = `You are a literary curator for ReadMe, a book app. Generate a personalised readlist.

USER REQUEST
Vibe: ${vibe || '(not specified)'}
Mood(s): ${moods.join(', ') || '(not specified)'}
Genre preference: ${genres.join(', ') || 'any'}
Book length: ${length || 'any'}
Number of books: ${count}

BOOKS ALREADY READ (do not include these):
${readLines}

AVAILABLE CATALOG:
${catalogLines}

TASK
Select exactly ${count} books from the catalog that best match the user's request. Do NOT include books already read.

Return a JSON object with this exact shape:
{
  "title": "<punchy readlist name, 2-5 words>",
  "pitch": "<2-sentence hook, 50-80 words, written like editorial copy>",
  "books": [
    {
      "id": "<book id from catalog>",
      "why": "<one vivid sentence explaining why THIS book fits THIS user's vibe, max 25 words>"
    }
  ]
}

Rules:
- Respond with ONLY the JSON object, no markdown fences, no preamble.
- The "why" for each book must feel personal to the user's vibe, not generic.
- Order books so the readlist flows well as a journey.
- If the catalog has too few matches, pick the closest alternatives.`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: 'You are a literary curator. Always respond with valid JSON only, no prose, no markdown.',
      messages: [{ role: 'user', content: prompt }],
    });

    let parsed;
    try {
      const text = message.content[0].type === 'text' ? message.content[0].text : '';
      parsed = JSON.parse(text.trim());
    } catch {
      return res.status(502).json({ error: 'Model returned invalid JSON. Try again.' });
    }

    // Merge full book data from DB into the AI-selected list
    const bookMap = Object.fromEntries(catalog.map(b => [b.id, b]));
    const enriched = (parsed.books || [])
      .filter(sel => bookMap[sel.id])
      .map(sel => ({ ...bookMap[sel.id], why: sel.why }));

    res.json({
      title: parsed.title,
      pitch: parsed.pitch,
      books: enriched,
    });
  } catch (err) { next(err); }
});
