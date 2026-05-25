import express from 'express';
import cors from 'cors';
import { booksRouter } from './routes/books.js';
import { readlistsRouter } from './routes/readlists.js';
import { reviewsRouter } from './routes/reviews.js';
import { generateRouter } from './routes/generate.js';
import { adminRouter } from './routes/admin.js';
import { usersRouter } from './routes/users.js';
import { errorHandler } from './middleware/error.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: (origin, callback) => {
    // Allow any localhost/127.0.0.1 port in dev, or the configured production origin
    if (!origin || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) || origin === process.env.CORS_ORIGIN) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
app.use(express.json());

app.get('/health', (_, res) => res.json({ ok: true }));

app.use('/api/books', booksRouter);
app.use('/api/readlists', readlistsRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/generate', generateRouter);
app.use('/api/admin', adminRouter);
app.use('/api/users', usersRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`ReadMe API running on http://localhost:${PORT}`);
});
