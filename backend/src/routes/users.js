import { Router } from 'express';
import { query } from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';

export const usersRouter = Router();

// POST /api/users/me — upsert user on sign-in
usersRouter.post('/me', requireAuth, async (req, res, next) => {
  try {
    const { name, email, avatar_url } = req.body;
    const { rows } = await query(
      `INSERT INTO clerk_users (id, name, email, avatar_url)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, email=EXCLUDED.email, avatar_url=EXCLUDED.avatar_url
       RETURNING *`,
      [req.userId, name || '', email || '', avatar_url || '']
    );
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// GET /api/users/me — fetch saved profile
usersRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM clerk_users WHERE id = $1', [req.userId]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// PATCH /api/users/me — save bio + tag interests
usersRouter.patch('/me', requireAuth, async (req, res, next) => {
  try {
    const { bio, tag_interests } = req.body;
    const { rows } = await query(
      `UPDATE clerk_users
       SET bio = COALESCE($2, bio), tag_interests = COALESCE($3, tag_interests)
       WHERE id = $1 RETURNING *`,
      [req.userId, bio ?? null, tag_interests ?? null]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});
