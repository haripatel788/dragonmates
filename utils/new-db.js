const pool = require('./db');

if (!process.env.DOPPLER_PROJECT) {
  require('dotenv').config();
}

const migrate = async () => {
  console.log('Running migrations...');
  try {
    // 1. livingStyles Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "livingStyles" (
        id SERIAL PRIMARY KEY,
        userId TEXT REFERENCES "User"(id) ON DELETE CASCADE,
        sleepSchedule VARCHAR(50),
        cleanliness VARCHAR(50),
        noiseLevel VARCHAR(50),
        guests VARCHAR(50),
        pets VARCHAR(50),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Created livingStyles table');

    // 2. interests Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "interests" (
        id SERIAL PRIMARY KEY,
        userId TEXT REFERENCES "User"(id) ON DELETE CASCADE,
        interest VARCHAR(255) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Created interests table');

    // 3. roommatePairs Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "roommatePairs" (
        id SERIAL PRIMARY KEY,
        user1Id TEXT REFERENCES "User"(id) ON DELETE CASCADE,
        user2Id TEXT REFERENCES "User"(id) ON DELETE CASCADE,
        status VARCHAR(50) DEFAULT 'guaranteed',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Created roommatePairs table');

    // 4. privateMessages Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "privateMessages" (
        id SERIAL PRIMARY KEY,
        pairId INTEGER REFERENCES "roommatePairs"(id) ON DELETE CASCADE,
        senderId TEXT REFERENCES "User"(id) ON DELETE CASCADE,
        messageText TEXT NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Created privateMessages table');

    console.log('All migrations completed successfully!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
  }
};

migrate();