const pool = require('./db');

// Load .env only if not using Doppler
if (!process.env.DOPPLER_PROJECT) {
  require('dotenv').config();
}

const migrate = async () => {
  console.log('Running migrations...');

  try {
    // 1. Living style preferences - linked to "User"
    await pool.query(`
      CREATE TABLE IF NOT EXISTS living_styles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES "User"(id) ON DELETE CASCADE,
        sleep_schedule VARCHAR(50),
        cleanliness VARCHAR(50),
        noise_level VARCHAR(50),
        guests VARCHAR(50),
        pets VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Created living_styles table');

    // 2. Interests - linked to "User"
    await pool.query(`
      CREATE TABLE IF NOT EXISTS interests (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES "User"(id) ON DELETE CASCADE,
        interest VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Created interests table');

    // 3. Roommate Pairs (For your Chat Feature) - linked to "User"
    await pool.query(`
      CREATE TABLE IF NOT EXISTS roommate_pairs (
        id SERIAL PRIMARY KEY,
        user1_id INTEGER REFERENCES "User"(id) ON DELETE CASCADE,
        user2_id INTEGER REFERENCES "User"(id) ON DELETE CASCADE,
        status VARCHAR(50) DEFAULT 'guaranteed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Created roommate_pairs table');

    // 4. Private Messages - linked to "User"
    await pool.query(`
      CREATE TABLE IF NOT EXISTS private_messages (
        id SERIAL PRIMARY KEY,
        pair_id INTEGER REFERENCES roommate_pairs(id) ON DELETE CASCADE,
        sender_id INTEGER REFERENCES "User"(id) ON DELETE CASCADE,
        message_text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Created private_messages table');

    console.log('All migrations completed successfully and linked to the "User" table!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
  }
};

migrate();