-- ReadMe database schema
-- Run: psql $DATABASE_URL -f src/db/schema.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Books ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS books (
  id          TEXT PRIMARY KEY,                 -- e.g. 'b1'
  title       TEXT NOT NULL,
  author      TEXT NOT NULL,
  year        INTEGER,
  pages       INTEGER,
  tags        TEXT[]        DEFAULT '{}',
  why         TEXT,                             -- editorial blurb
  cover       JSONB         DEFAULT '{}',       -- { shape, bg, ink, accent }
  rating      NUMERIC(3,1)  DEFAULT 0,
  ol_key      TEXT,                             -- OpenLibrary key for future cover art
  created_at  TIMESTAMPTZ   DEFAULT NOW()
);

-- ── Readlists ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS readlists (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  sub         TEXT,
  pitch       TEXT,
  accent      TEXT          DEFAULT '#2849A3',
  curator     TEXT          DEFAULT 'ReadMe Editorial',
  ai          BOOLEAN       DEFAULT FALSE,
  saves       INTEGER       DEFAULT 0,
  created_at  TIMESTAMPTZ   DEFAULT NOW()
);

-- Ordered many-to-many between readlists and books
CREATE TABLE IF NOT EXISTS readlist_books (
  readlist_id  TEXT    REFERENCES readlists(id) ON DELETE CASCADE,
  book_id      TEXT    REFERENCES books(id)     ON DELETE CASCADE,
  position     INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (readlist_id, book_id)
);

-- ── Users ─────────────────────────────────────────────────────────────────
-- Single anonymous user for now; structure supports multi-user later.
CREATE TABLE IF NOT EXISTS users (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  handle      TEXT          UNIQUE,             -- 'jamie' etc.
  display_name TEXT,
  bio         TEXT,
  created_at  TIMESTAMPTZ   DEFAULT NOW()
);

-- ── User shelves ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_reads (
  user_id     UUID    REFERENCES users(id) ON DELETE CASCADE,
  book_id     TEXT    REFERENCES books(id) ON DELETE CASCADE,
  read_at     TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, book_id)
);

CREATE TABLE IF NOT EXISTS user_saved (
  user_id     UUID    REFERENCES users(id) ON DELETE CASCADE,
  book_id     TEXT    REFERENCES books(id) ON DELETE CASCADE,
  saved_at    TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, book_id)
);

CREATE TABLE IF NOT EXISTS user_reading (
  user_id     UUID    REFERENCES users(id) ON DELETE CASCADE,
  book_id     TEXT    REFERENCES books(id) ON DELETE CASCADE,
  page        INTEGER NOT NULL DEFAULT 0,
  started_at  DATE    DEFAULT CURRENT_DATE,
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, book_id)
);

CREATE TABLE IF NOT EXISTS user_reviews (
  user_id     UUID    REFERENCES users(id) ON DELETE CASCADE,
  book_id     TEXT    REFERENCES books(id) ON DELETE CASCADE,
  rating      SMALLINT CHECK (rating BETWEEN 1 AND 5),
  body        TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, book_id)
);

-- ── Indexes ────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_books_tags         ON books USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_readlist_books_pos ON readlist_books (readlist_id, position);
CREATE INDEX IF NOT EXISTS idx_user_reads_user    ON user_reads (user_id);
CREATE INDEX IF NOT EXISTS idx_user_reading_user  ON user_reading (user_id);
