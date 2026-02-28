const pool = require('./db');

if (!process.env.DOPPLER_PROJECT) {
  require('dotenv').config();
}

async function fixDatabase() {
  try {
    console.log("Starting database cleanup...");

    // Drop tables that were linked to the wrong 'users' table
    await pool.query('DROP TABLE IF EXISTS private_messages CASCADE');
    await pool.query('DROP TABLE IF EXISTS roommate_pairs CASCADE');
    await pool.query('DROP TABLE IF EXISTS profiles CASCADE');
    await pool.query('DROP TABLE IF EXISTS living_styles CASCADE');
    await pool.query('DROP TABLE IF EXISTS interests CASCADE');
    await pool.query('DROP TABLE IF EXISTS housing_preferences CASCADE');
    
    // Drop the incorrect lowercase users table
    await pool.query('DROP TABLE IF EXISTS users CASCADE');

    console.log("✅ Cleanup complete. Incorrect tables removed.");
  } catch (err) {
    console.error("❌ Error during cleanup:", err.message);
  } finally {
    await pool.end();
  }
}

fixDatabase();