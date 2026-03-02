const pool = require('./db');

if (!process.env.DOPPLER_PROJECT) {
  require('dotenv').config();
}

const migrate = async () => {
  console.log('Running migrations...');
  try {
    await pool.query('CREATE EXTENSION IF NOT EXISTS pgcrypto');

    // users — core accounts table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        clerk_id VARCHAR(255) UNIQUE,
        password_hash TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('  users ✓');

    // dealbreakers — one row per user
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "dealbreakers" (
        id SERIAL PRIMARY KEY,
        "userId" TEXT UNIQUE NOT NULL,
        "smoking" VARCHAR(50),
        "pets" VARCHAR(50),
        "budgetMin" INTEGER,
        "budgetMax" INTEGER,
        "moveInDate" DATE,
        "coopCycle" VARCHAR(50),
        "leaseLength" INTEGER,
        "genderPref" VARCHAR(50),
        "roomType" VARCHAR(50),
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('  dealbreakers ✓');

    // scores — one row per user, all 1-5 lifestyle ratings
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "scores" (
        id SERIAL PRIMARY KEY,
        "userId" TEXT UNIQUE NOT NULL,
        "cleanliness" INTEGER,
        "sleepSchedule" INTEGER,
        "noiseTolerance" INTEGER,
        "guestsFrequency" INTEGER,
        "cookingHabits" INTEGER,
        "timeAtHome" INTEGER,
        "temperaturePref" INTEGER,
        "gymInterest" INTEGER,
        "mediaInterest" INTEGER,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('  scores ✓');

    // interests — major, year, personality, hobbies (stored as comma-separated or jsonb)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "interests" (
        id SERIAL PRIMARY KEY,
        "userId" TEXT UNIQUE NOT NULL,
        "major" TEXT,
        "year" VARCHAR(20),
        "personality" VARCHAR(20),
        "hobbies" TEXT[],
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('  interests ✓');

    // indexes
    await pool.query('CREATE INDEX IF NOT EXISTS "idx_dealbreakers_userId" ON "dealbreakers" ("userId")');
    await pool.query('CREATE INDEX IF NOT EXISTS "idx_scores_userId" ON "scores" ("userId")');
    await pool.query('CREATE INDEX IF NOT EXISTS "idx_interests_userId" ON "interests" ("userId")');

    console.log('Migration complete.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
  }
};

migrate();
