const pool = require('./db');

// Load .env only if not using Doppler
if (!process.env.DOPPLER_PROJECT) {
  require('dotenv').config();
}

const migrate = async () => {
  console.log('Running migrations...');

  try {
    // Users table (for custom auth - may not need if using Clerk only)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        clerk_id VARCHAR(255) UNIQUE,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Created users table');

    // Profiles table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        clerk_id VARCHAR(255),
        name VARCHAR(255),
        major VARCHAR(255),
        year VARCHAR(50),
        age INTEGER,
        bio TEXT,
        profile_image VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Created profiles table');

    // Living style preferences
    await pool.query(`
      CREATE TABLE IF NOT EXISTS living_styles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        clerk_id VARCHAR(255),
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

    // Interests
    await pool.query(`
      CREATE TABLE IF NOT EXISTS interests (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        clerk_id VARCHAR(255),
        interest VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Created interests table');

    // Housing preferences
    await pool.query(`
      CREATE TABLE IF NOT EXISTS housing_preferences (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        clerk_id VARCHAR(255),
        location VARCHAR(255),
        budget_min INTEGER,
        budget_max INTEGER,
        move_in_date DATE,
        lease_duration INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Created housing_preferences table');

    console.log('All migrations completed successfully!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
  }
};

migrate();
