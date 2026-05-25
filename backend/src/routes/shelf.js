import { Router } from 'express';
import { query } from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';

export const shelfRouter = Router();

// GET /api/me/shelf
shelfRouter.get('/shelf', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM user_books WHERE user_id = $1', [req.userId]);
    res.json(rows);
  } catch (err) { next(err); }
});

// PUT /api/me/shelf/:bookId — full upsert of one book's state
shelfRouter.put('/shelf/:bookId', requireAuth, async (req, res, next) => {
  try {
    const {
      is_read = false, is_saved = false,
      reading_page = null, reading_started = null,
      review_rating = null, review_text = null,
    } = req.body;
    const { rows } = await query(
      `INSERT INTO user_books
         (user_id, book_id, is_read, is_saved, reading_page, reading_started, review_rating, review_text, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())
       ON CONFLICT (user_id, book_id) DO UPDATE SET
         is_read = EXCLUDED.is_read,
         is_saved = EXCLUDED.is_saved,
         reading_page = EXCLUDED.reading_page,
         reading_started = EXCLUDED.reading_started,
         review_rating = EXCLUDED.review_rating,
         review_text = EXCLUDED.review_text,
         updated_at = NOW()
       RETURNING *`,
      [req.userId, req.params.bookId, is_read, is_saved, reading_page, reading_started, review_rating, review_text]
    );
    res.json(rows[0]);
  } catch (err) { next(err); }
});
