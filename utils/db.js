const { Pool } = require('pg');

// Load .env only if not using Doppler
if (!process.env.DOPPLER_PROJECT) {
  require('dotenv').config();
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

module.exports = pool;