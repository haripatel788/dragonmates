const pool = require('./db');

// Load .env only if not using Doppler
if (!process.env.DOPPLER_PROJECT) {
  require('dotenv').config();
}

const migrate = async () => {
  console.log('Running schema sanity migrations...');
  try {
    await pool.query('CREATE EXTENSION IF NOT EXISTS pgcrypto');

    // 1) livingStyles
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "livingStyles" (
        id SERIAL PRIMARY KEY,
        "userId" TEXT UNIQUE,
        "sleepSchedule" VARCHAR(50),
        "cleanliness" VARCHAR(50),
        "noiseLevel" VARCHAR(50),
        "guests" VARCHAR(50),
        "pets" VARCHAR(50),
        "cookingHabits" VARCHAR(50),
        "timeAtHome" VARCHAR(50),
        "temperaturePref" VARCHAR(50),
        "gymInterest" VARCHAR(50),
        "mediaInterest" VARCHAR(50),
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    // Add columns if they don't exist (for existing databases)
    const newLivingCols = ['cookingHabits', 'timeAtHome', 'temperaturePref', 'gymInterest', 'mediaInterest'];
    for (const col of newLivingCols) {
      await pool.query(`ALTER TABLE "livingStyles" ADD COLUMN IF NOT EXISTS "${col}" VARCHAR(50)`);
    }
    console.log('Ensured livingStyles table');

    // 1b) dealbreakers
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "dealbreakers" (
        id SERIAL PRIMARY KEY,
        "userId" TEXT UNIQUE,
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
    console.log('Ensured dealbreakers table');

    // 2) interests
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "interests" (
        id SERIAL PRIMARY KEY,
        "userId" TEXT,
        "interest" VARCHAR(255) NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Ensured interests table');

    // 3) Profile
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "Profile" (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "userId" TEXT UNIQUE,
        "major" TEXT,
        "year" TEXT,
        "personality" TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Ensured Profile table');

    // 4) roommatePairs
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "roommatePairs" (
        id SERIAL PRIMARY KEY,
        "user1Id" TEXT,
        "user2Id" TEXT,
        "status" VARCHAR(50) DEFAULT 'guaranteed',
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Ensured roommatePairs table');

    // 5) privateMessages
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "privateMessages" (
        id SERIAL PRIMARY KEY,
        "pairId" INTEGER,
        "senderId" TEXT,
        "messageText" TEXT NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Ensured privateMessages table');

    // Common performance indexes for workflow paths in this repo
    await pool.query('CREATE INDEX IF NOT EXISTS "idx_user_clerkId" ON "User" ("clerkId")');
    await pool.query('CREATE INDEX IF NOT EXISTS "idx_livingStyles_userId" ON "livingStyles" ("userId")');
    await pool.query('CREATE INDEX IF NOT EXISTS "idx_dealbreakers_userId" ON "dealbreakers" ("userId")');
    await pool.query('CREATE INDEX IF NOT EXISTS "idx_interests_userId" ON "interests" ("userId")');
    await pool.query('CREATE INDEX IF NOT EXISTS "idx_profile_userId" ON "Profile" ("userId")');
    await pool.query('CREATE INDEX IF NOT EXISTS "idx_roommatePairs_user1Id" ON "roommatePairs" ("user1Id")');
    await pool.query('CREATE INDEX IF NOT EXISTS "idx_roommatePairs_user2Id" ON "roommatePairs" ("user2Id")');
    await pool.query('CREATE INDEX IF NOT EXISTS "idx_privateMessages_pair_created" ON "privateMessages" ("pairId", "createdAt")');

    console.log('Schema sanity migration completed.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
  }
};

migrate();
