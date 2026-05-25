import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { pool } from './index.js';

const __dir = dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(join(__dir, 'schema.sql'), 'utf8');

const client = await pool.connect();
try {
  await client.query(sql);
  console.log('✓ Schema applied');
} finally {
  client.release();
  await pool.end();
}
