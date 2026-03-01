const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { verifyToken } = require('@clerk/backend');
const cors = require('cors');
const path = require('path');
// Load .env only if not using Doppler (Doppler injects env vars directly)
if (!process.env.DOPPLER_PROJECT) {
  require('dotenv').config();
}
const pool = require('./db');

const app = express();
app.use(cors(), express.json());

// Serve static files from root directory
app.use(express.static(path.join(__dirname, '..')));

// Redirect common URLs to correct paths
app.get('/login', (_, res) => res.redirect(301, '/auth/login'));
app.get('/login.html', (_, res) => res.redirect(301, '/auth/login'));
app.get('/register', (_, res) => res.redirect(301, '/auth/register'));
app.get('/register.html', (_, res) => res.redirect(301, '/auth/register'));

const sign = (id) => jwt.sign({ userId: id }, process.env.JWT_SECRET, { expiresIn: '7d' });
const getBearerToken = (req) => {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');
  if (scheme === 'Bearer' && token) return token;
  return null;
};

const tryDevClerkDecode = async (token, req, next) => {
  try {
    const decoded = jwt.decode(token);
    const sub = decoded?.sub;
    const iss = decoded?.iss;
    const isClerkLikeUser = typeof sub === 'string' && sub.startsWith('user_');
    const isClerkIssuer = typeof iss === 'string' && iss.includes('clerk');
    if (!isClerkLikeUser || !isClerkIssuer) return false;

    if (process.env.NODE_ENV === 'production') return false;

    const { rows } = await pool.query(
      'SELECT id, email, "clerkId" FROM "User" WHERE "clerkId" = $1 LIMIT 1',
      [sub]
    );
    if (!rows[0]) {
      req.userId = null;
      req.clerkId = sub;
      req.user = null;
      next();
      return true;
    }
    req.userId = rows[0].id;
    req.clerkId = rows[0].clerkId;
    req.user = rows[0];
    next();
    return true;
  } catch (_) {
    return false;
  }
};

// Auth middleware
const authenticate = async (req, res, next) => {
  const token = getBearerToken(req);
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const looksLikeJwt = token.split('.').length === 3;

  // Clerk session tokens (verified)
  try {
    if (process.env.CLERK_SECRET_KEY || process.env.CLERK_JWT_KEY) {
      const payload = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY,
        jwtKey: process.env.CLERK_JWT_KEY
      });
      if (payload?.sub) {
        const { rows } = await pool.query(
          'SELECT id, email, "clerkId" FROM "User" WHERE "clerkId" = $1 LIMIT 1',
          [payload.sub]
        );
        if (!rows[0]) {
          req.userId = null;
          req.clerkId = payload.sub;
          req.user = null;
          return next();
        }
        req.userId = rows[0].id;
        req.clerkId = rows[0].clerkId;
        req.user = rows[0];
        return next();
      }
    }
  } catch (_) {
    // If Clerk verification fails in non-production, allow dev decode fallback.
    if (looksLikeJwt && (await tryDevClerkDecode(token, req, next))) return;
  }

  // Dev-only fallback when Clerk verification keys are not configured.
  if (looksLikeJwt && !process.env.CLERK_SECRET_KEY && !process.env.CLERK_JWT_KEY) {
    if (await tryDevClerkDecode(token, req, next)) return;
  }

  // Legacy JWT tokens from /auth/login
  try {
    if (!process.env.JWT_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId;
    const { rows } = await pool.query(
      'SELECT id, email, "clerkId" FROM "User" WHERE id = $1 LIMIT 1',
      [req.userId]
    );
    req.user = rows[0] || { id: req.userId };
    req.clerkId = rows[0]?.clerkId || null;
    return next();
  } catch (_) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

const requireDbUser = (req, res, next) => {
  if (!req.userId) return res.status(404).json({ error: 'User not synced in database' });
  return next();
};

const requirePairMembership = async (pairId, userId) => {
  const { rows } = await pool.query(
    `SELECT id FROM "roommatePairs"
     WHERE id = $1 AND ("user1Id" = $2 OR "user2Id" = $2)
     LIMIT 1`,
    [pairId, userId]
  );
  return Boolean(rows[0]);
};

// Public routes (no authentication required)
// Register
app.post('/auth/register', async (req, res) => {
  const { email, password } = req.body;
  const hash = await bcrypt.hash(password, 12);
  const { rows } = await pool.query(
    'INSERT INTO "User" (email, password_hash) VALUES ($1, $2) RETURNING id, email',
    [email, hash]
  ).catch(() => res.status(400).json({ error: 'Email already exists' }) || { rows: [] });
  if (rows[0]) res.json({ token: sign(rows[0].id), user: rows[0] });
});

// Login
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const { rows } = await pool.query('SELECT * FROM "User" WHERE email = $1', [email]);
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash)))
    return res.status(401).json({ error: 'Invalid credentials' });
  res.json({ token: sign(user.id), user: { id: user.id, email: user.email } });
});

// Sync Clerk user to Neon DB after sign-up
app.post('/api/clerk-user', authenticate, async (req, res) => {
  const { clerkId, email } = req.body;
  if (!clerkId || !email) return res.status(400).json({ error: 'clerkId and email are required' });
  if (req.clerkId && req.clerkId !== clerkId) return res.status(403).json({ error: 'Token/user mismatch' });
  try {
    const { rows } = await pool.query(
      `INSERT INTO "User" ("clerkId", email)
       VALUES ($1, $2)
       ON CONFLICT ("clerkId")
       DO UPDATE SET email = EXCLUDED.email
       RETURNING id, "clerkId", email`,
      [clerkId, email]
    );
    res.json({ user: rows[0] || { clerkId, email, existing: true } });
  } catch (err) {
    console.error('Error creating clerk user:', err);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Save lifestyle scores to livingStyles table
app.post('/api/preferences', authenticate, requireDbUser, async (req, res) => {
  const { scores } = req.body;
  if (!scores) return res.status(400).json({ error: 'scores are required' });

  try {
    const userId = req.userId;

    await pool.query('DELETE FROM "livingStyles" WHERE "userId" = $1', [userId]);
    await pool.query(
      `INSERT INTO "livingStyles" ("userId", "sleepSchedule", "cleanliness", "noiseLevel", "guests", "pets")
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, scores.sleepSchedule, scores.cleanliness, scores.noiseTolerance, scores.guestsFrequency, scores.pets || '']
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Error saving preferences:', err);
    res.status(500).json({ error: 'Failed to save preferences' });
  }
});

// Save user interests (hobbies, major, year, personality)
app.post('/api/interests', authenticate, requireDbUser, async (req, res) => {
  const { hobbies, major, year, personality } = req.body;

  try {
    const userId = req.userId;
    const normalizedHobbies = Array.isArray(hobbies)
      ? [...new Set(hobbies.map((h) => String(h).trim()).filter(Boolean))]
      : [];

    await pool.query('BEGIN');
    await pool.query('DELETE FROM "interests" WHERE "userId" = $1', [userId]);

    if (normalizedHobbies.length > 0) {
      await pool.query(
        `INSERT INTO "interests" ("userId", "interest")
         SELECT $1, hobby FROM unnest($2::text[]) AS hobby`,
        [userId, normalizedHobbies]
      );
    }

    // Works with a one-profile-per-user schema.
    await pool.query(
      `INSERT INTO "Profile" ("userId", "major", "year", "personality", "updatedAt")
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT ("userId")
       DO UPDATE SET
         "major" = EXCLUDED."major",
         "year" = EXCLUDED."year",
         "personality" = EXCLUDED."personality",
         "updatedAt" = NOW()`,
      [userId, major || '', year || '', personality || '']
    );

    await pool.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    try {
      await pool.query('ROLLBACK');
    } catch (_) {
      // ignore rollback errors
    }
    // Fallback path for Profile tables that don't yet have personality column
    try {
      await pool.query(
        `INSERT INTO "Profile" ("userId", "major", "year", "updatedAt")
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT ("userId")
         DO UPDATE SET
           "major" = EXCLUDED."major",
           "year" = EXCLUDED."year",
           "updatedAt" = NOW()`,
        [req.userId, major || '', year || '']
      );
      return res.json({ success: true, warning: 'Profile.personality column missing; hobbies saved.' });
    } catch (fallbackErr) {
      console.error('Error saving interests:', fallbackErr);
      return res.status(500).json({ error: 'Failed to save interests' });
    }
  }
});

// All routes below this line require authentication
app.use(authenticate);
app.use(requireDbUser);

// Protected API routes
app.get('/api/me', async (req, res) => {
  const { rows } = await pool.query('SELECT id, email, "clerkId" FROM "User" WHERE id = $1', [req.userId]);
  res.json(rows[0]);
});

// --- Roommate Chat API Routes ---

// 1. Get the current user's roommate pair
app.get('/api/my-roommate', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT rp.id as pairId, u.id as roommateId, u.email as roommateEmail
       FROM "roommatePairs" rp
       JOIN "User" u ON (u.id = rp.user1Id OR u.id = rp.user2Id)
       WHERE (rp.user1Id = $1 OR rp.user2Id = $1) 
         AND u.id != $1
         AND rp.status = 'guaranteed'`,
      [req.userId]
    );
    res.json({ roommate: rows[0] || null });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch roommate' });
  }
});

// 2. Fetch messages for a specific pair
app.get('/api/chat/:pairId', async (req, res) => {
  const pairId = Number.parseInt(req.params.pairId, 10);
  if (!Number.isInteger(pairId)) return res.status(400).json({ error: 'Invalid pairId' });
  try {
    const isMember = await requirePairMembership(pairId, req.userId);
    if (!isMember) return res.status(403).json({ error: 'Forbidden' });

    const { rows } = await pool.query(
      'SELECT id, "pairId", "senderId", "messageText", "createdAt" FROM "privateMessages" WHERE "pairId" = $1 ORDER BY "createdAt" ASC',
      [pairId]
    );
    res.json({ messages: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// 3. Send a new message
app.post('/api/chat/:pairId', async (req, res) => {
  const pairId = Number.parseInt(req.params.pairId, 10);
  const text = String(req.body?.text || '').trim();
  if (!Number.isInteger(pairId)) return res.status(400).json({ error: 'Invalid pairId' });
  if (!text) return res.status(400).json({ error: 'Message text is required' });
  if (text.length > 2000) return res.status(400).json({ error: 'Message too long' });
  try {
    const isMember = await requirePairMembership(pairId, req.userId);
    if (!isMember) return res.status(403).json({ error: 'Forbidden' });

    const { rows } = await pool.query(
      'INSERT INTO "privateMessages" ("pairId", "senderId", "messageText") VALUES ($1, $2, $3) RETURNING *',
      [pairId, req.userId, text]
    );
    res.json({ message: rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

const port = Number.parseInt(process.env.PORT, 10) || 3000;
app.listen(port, () => console.log(`Server on port ${port}`));
