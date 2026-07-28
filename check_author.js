import 'dotenv/config';
import { query } from './config/dbconfig.js';

(async () => {
  try {
    const email = 'test.ps@example.com';
    const res = await query('SELECT id, name, email, bio, created_at FROM authors WHERE email = $1', [email]);
    console.log('FOUND:', res.rows);
    process.exit(0);
  } catch (err) {
    console.error('ERROR:', err.message);
    process.exit(1);
  }
})();
