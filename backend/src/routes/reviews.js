import { Router } from 'express';
import { query } from '../db/index.js';

export const reviewsRouter = Router();

// All review routes operate on a user_id passed in the X-User-Id header.
// This is a placeholder until real auth is added — swap the header lookup
// for a JWT decode/session when you wire up authentication.
function getUserId(req) {
  return req.headers['x-user-id'] || null;
}

// GET /api/reviews — all reviews for this user
reviewsRouter.get('/', async (req, res, next) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'X-User-Id header required' });

    const { rows } = await query(
      `SELECT r.*, b.title, b.author
       FROM user_reviews r
       JOIN books b ON b.id = r.book_id
       WHERE r.user_id = $1
       ORDER BY r.updated_at DESC`,
      [userId]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// PUT /api/reviews/:bookId — upsert a review
reviewsRouter.put('/:bookId', async (req, res, next) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'X-User-Id header required' });

    const { rating, body } = req.body;
    if (rating == null || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'rating must be 1–5' });
    }

    const { rows: [review] } = await query(
      `INSERT INTO user_reviews (user_id, book_id, rating, body)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, book_id) DO UPDATE
         SET rating = EXCLUDED.rating,
             body   = EXCLUDED.body,
             updated_at = NOW()
       RETURNING *`,
      [userId, req.params.bookId, rating, body || null]
    );
    res.json(review);
  } catch (err) { next(err); }
});

// DELETE /api/reviews/:bookId
reviewsRouter.delete('/:bookId', async (req, res, next) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'X-User-Id header required' });

    await query('DELETE FROM user_reviews WHERE user_id=$1 AND book_id=$2', [userId, req.params.bookId]);
    res.status(204).end();
  } catch (err) { next(err); }
});

// ── Shelf routes (reads / saved / reading) ────────────────────────────────

// GET /api/reviews/shelf — return the user's full shelf state in one call
reviewsRouter.get('/shelf', async (req, res, next) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'X-User-Id header required' });

    const [readsResult, savedResult, readingResult, reviewsResult] = await Promise.all([
      query('SELECT book_id FROM user_reads   WHERE user_id=$1', [userId]),
      query('SELECT book_id FROM user_saved   WHERE user_id=$1', [userId]),
      query('SELECT book_id, page, started_at FROM user_reading WHERE user_id=$1', [userId]),
      query('SELECT book_id, rating, body     FROM user_reviews WHERE user_id=$1', [userId]),
    ]);

    res.json({
      readIds:  readsResult.rows.map(r => r.book_id),
      savedIds: savedResult.rows.map(r => r.book_id),
      reading:  Object.fromEntries(readingResult.rows.map(r => [r.book_id, { page: r.page, started: r.started_at }])),
      reviews:  Object.fromEntries(reviewsResult.rows.map(r => [r.book_id, { rating: r.rating, text: r.body }])),
    });
  } catch (err) { next(err); }
});

// POST /api/reviews/shelf/reads/:bookId  — mark read
reviewsRouter.post('/shelf/reads/:bookId', async (req, res, next) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'X-User-Id header required' });
    await query('INSERT INTO user_reads (user_id, book_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [userId, req.params.bookId]);
    await query('DELETE FROM user_reading WHERE user_id=$1 AND book_id=$2', [userId, req.params.bookId]);
    res.status(204).end();
  } catch (err) { next(err); }
});

// DELETE /api/reviews/shelf/reads/:bookId — un-mark read
reviewsRouter.delete('/shelf/reads/:bookId', async (req, res, next) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'X-User-Id header required' });
    await query('DELETE FROM user_reads WHERE user_id=$1 AND book_id=$2', [userId, req.params.bookId]);
    res.status(204).end();
  } catch (err) { next(err); }
});

// PUT /api/reviews/shelf/reading/:bookId — update page progress
reviewsRouter.put('/shelf/reading/:bookId', async (req, res, next) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'X-User-Id header required' });
    const { page } = req.body;
    await query(
      `INSERT INTO user_reading (user_id, book_id, page) VALUES ($1,$2,$3)
       ON CONFLICT (user_id, book_id) DO UPDATE SET page=$3, updated_at=NOW()`,
      [userId, req.params.bookId, page ?? 0]
    );
    res.status(204).end();
  } catch (err) { next(err); }
});
