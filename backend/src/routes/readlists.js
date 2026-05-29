import { Router } from 'express';
import { query } from '../db/index.js';

export const readlistsRouter = Router();

// GET /api/readlists — list all, with bookIds array
readlistsRouter.get('/', async (req, res, next) => {
  try {
    const { rows } = await query(`
      SELECT r.*,
        COALESCE(
          ARRAY_AGG(rb.book_id ORDER BY rb.position) FILTER (WHERE rb.book_id IS NOT NULL),
          '{}'
        ) AS "bookIds"
      FROM readlists r
      LEFT JOIN readlist_books rb ON rb.readlist_id = r.id
      GROUP BY r.id
      ORDER BY r.saves DESC
    `);
    res.json(rows);
  } catch (err) { next(err); }
});

// GET /api/readlists/:id — single readlist with full book objects
readlistsRouter.get('/:id', async (req, res, next) => {
  try {
    const { rows: [list] } = await query('SELECT * FROM readlists WHERE id = $1', [req.params.id]);
    if (!list) return res.status(404).json({ error: 'Not found' });

    const { rows: books } = await query(`
      SELECT b.* FROM books b
      JOIN readlist_books rb ON rb.book_id = b.id
      WHERE rb.readlist_id = $1
      ORDER BY rb.position
    `, [req.params.id]);

    res.json({ ...list, books, bookIds: books.map(b => b.id) });
  } catch (err) { next(err); }
});

// POST /api/readlists — create a new readlist (AI-generated)
readlistsRouter.post('/', async (req, res, next) => {
  try {
    const { id, title, sub, pitch, accent = '#2849A3', curator = 'ReadMe AI', ai = true, bookIds = [] } = req.body;
    if (!title) return res.status(400).json({ error: 'title is required' });

    const listId = id || `gen-${Date.now()}`;
    await query(
      'INSERT INTO readlists (id, title, sub, pitch, accent, curator, ai, saves) VALUES ($1,$2,$3,$4,$5,$6,$7,0)',
      [listId, title, sub, pitch, accent, curator, ai]
    );

    for (let i = 0; i < bookIds.length; i++) {
      await query(
        'INSERT INTO readlist_books (readlist_id, book_id, position) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING',
        [listId, bookIds[i], i]
      );
    }

    const { rows: [created] } = await query('SELECT * FROM readlists WHERE id = $1', [listId]);
    res.status(201).json({ ...created, bookIds });
  } catch (err) { next(err); }
});

// DELETE /api/readlists/:id
readlistsRouter.delete('/:id', async (req, res, next) => {
  try {
    await query('DELETE FROM readlist_books WHERE readlist_id = $1', [req.params.id]);
    await query('DELETE FROM readlists WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// PATCH /api/readlists/:id/save — increment saves count
readlistsRouter.patch('/:id/save', async (req, res, next) => {
  try {
    const { rows: [updated] } = await query(
      'UPDATE readlists SET saves = saves + 1 WHERE id = $1 RETURNING saves',
      [req.params.id]
    );
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json({ saves: updated.saves });
  } catch (err) { next(err); }
});
