const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { verifyToken } = require('@clerk/backend');
const cors = require('cors');
const path = require('path');
if (!process.env.DOPPLER_PROJECT) {
  require('dotenv').config();
}
const pool = require('./db');

const app = express();
app.use(cors(), express.json());

app.use(express.static(path.join(__dirname, '..')));

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
    if (typeof sub !== 'string' || !sub.startsWith('user_')) return false;
    if (typeof iss !== 'string' || !iss.includes('clerk')) return false;
    if (process.env.NODE_ENV === 'production') return false;

    const { rows } = await pool.query(
      'SELECT id, email, clerk_id FROM users WHERE clerk_id = $1 LIMIT 1',
      [sub]
    );
    if (!rows[0]) {
      req.userId = null;
      req.clerkId = sub;
      req.user = null;
    } else {
      req.userId = rows[0].id;
      req.clerkId = rows[0].clerk_id;
      req.user = rows[0];
    }
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
          'SELECT id, email, clerk_id FROM users WHERE clerk_id = $1 LIMIT 1',
          [payload.sub]
        );
        if (!rows[0]) {
          req.userId = null;
          req.clerkId = payload.sub;
          req.user = null;
          return next();
        }
        req.userId = rows[0].id;
        req.clerkId = rows[0].clerk_id;
        req.user = rows[0];
        return next();
      }
    }
  } catch (_) {
    if (looksLikeJwt && (await tryDevClerkDecode(token, req, next))) return;
  }

  // Dev-only fallback
  if (looksLikeJwt && !process.env.CLERK_SECRET_KEY && !process.env.CLERK_JWT_KEY) {
    if (await tryDevClerkDecode(token, req, next)) return;
  }

  // Legacy JWT tokens
  try {
    if (!process.env.JWT_SECRET) return res.status(401).json({ error: 'Unauthorized' });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId;
    const { rows } = await pool.query(
      'SELECT id, email, clerk_id FROM users WHERE id = $1 LIMIT 1',
      [req.userId]
    );
    req.user = rows[0] || { id: req.userId };
    req.clerkId = rows[0]?.clerk_id || null;
    return next();
  } catch (_) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

const requireDbUser = (req, res, next) => {
  if (!req.userId) return res.status(404).json({ error: 'User not synced in database' });
  return next();
};

// --- Public routes ---

app.post('/auth/register', async (req, res) => {
  const { email, password } = req.body;
  const hash = await bcrypt.hash(password, 12);
  const { rows } = await pool.query(
    'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
    [email, hash]
  ).catch(() => res.status(400).json({ error: 'Email already exists' }) || { rows: [] });
  if (rows[0]) res.json({ token: sign(rows[0].id), user: rows[0] });
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash)))
    return res.status(401).json({ error: 'Invalid credentials' });
  res.json({ token: sign(user.id), user: { id: user.id, email: user.email } });
});

// Sync clerk user with NeonDB
app.post('/api/clerk-user', authenticate, async (req, res) => {

  // Extract Clerk user ID and email from the request body
  const { clerkId, email } = req.body;

  // If either clerkId or email is missing, return a 400 Bad Request
  if (!clerkId || !email) {
    return res.status(400).json({ error: 'clerkId and email are required' });
  }

  // Ensure the authenticated token's clerkId matches the clerkId being sent
  if (req.clerkId && req.clerkId !== clerkId) {
    return res.status(403).json({ error: 'Token/user mismatch' });
  }

  try {

    // Insert the user into the database
    const { rows } = await pool.query(
      `INSERT INTO users (clerk_id, email)
       VALUES ($1, $2)
       ON CONFLICT (clerk_id)
       DO UPDATE SET email = EXCLUDED.email
       RETURNING id, clerk_id, email`,
      [clerkId, email]
    );

    // Return the created or updated user record
    res.json({ user: rows[0] });

  } catch (err) {

    // write error to console
    console.error('Error creating clerk user:', err);

    // Return error response
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Save dealbreakers
app.post('/api/dealbreakers', authenticate, requireDbUser, async (req, res) => {
  const { smoking, pets, budgetMin, budgetMax, moveInDate, coopCycle, leaseLength, genderPref, roomType } = req.body;
  try {
    await pool.query(
      `INSERT INTO dealbreakers ("userId", smoking, pets, "budgetMin", "budgetMax",
        "moveInDate", "coopCycle", "leaseLength", "genderPref", "roomType")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT ("userId")
       DO UPDATE SET
         smoking = EXCLUDED.smoking,
         pets = EXCLUDED.pets,
         "budgetMin" = EXCLUDED."budgetMin",
         "budgetMax" = EXCLUDED."budgetMax",
         "moveInDate" = EXCLUDED."moveInDate",
         "coopCycle" = EXCLUDED."coopCycle",
         "leaseLength" = EXCLUDED."leaseLength",
         "genderPref" = EXCLUDED."genderPref",
         "roomType" = EXCLUDED."roomType",
         "updatedAt" = NOW()`,
      [
        req.userId,
        smoking || '',
        pets || '',
        budgetMin ? parseInt(budgetMin, 10) : null,
        budgetMax ? parseInt(budgetMax, 10) : null,
        moveInDate || null,
        coopCycle || '',
        leaseLength ? parseInt(leaseLength, 10) : null,
        genderPref || '',
        roomType || ''
      ]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Error saving dealbreakers:', err);
    res.status(500).json({ error: 'Failed to save dealbreakers' });
  }
});

// Save scores (1-5 lifestyle ratings)
app.post('/api/scores', authenticate, requireDbUser, async (req, res) => {
  const { cleanliness, sleepSchedule, noiseTolerance, guestsFrequency,
          cookingHabits, timeAtHome, temperaturePref, gymInterest, mediaInterest } = req.body;
  try {
    await pool.query(
      `INSERT INTO scores ("userId", cleanliness, "sleepSchedule", "noiseTolerance", "guestsFrequency",
        "cookingHabits", "timeAtHome", "temperaturePref", "gymInterest", "mediaInterest")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT ("userId")
       DO UPDATE SET
         cleanliness = EXCLUDED.cleanliness,
         "sleepSchedule" = EXCLUDED."sleepSchedule",
         "noiseTolerance" = EXCLUDED."noiseTolerance",
         "guestsFrequency" = EXCLUDED."guestsFrequency",
         "cookingHabits" = EXCLUDED."cookingHabits",
         "timeAtHome" = EXCLUDED."timeAtHome",
         "temperaturePref" = EXCLUDED."temperaturePref",
         "gymInterest" = EXCLUDED."gymInterest",
         "mediaInterest" = EXCLUDED."mediaInterest",
         "updatedAt" = NOW()`,
      [
        req.userId,
        parseInt(cleanliness, 10) || null,
        parseInt(sleepSchedule, 10) || null,
        parseInt(noiseTolerance, 10) || null,
        parseInt(guestsFrequency, 10) || null,
        parseInt(cookingHabits, 10) || null,
        parseInt(timeAtHome, 10) || null,
        parseInt(temperaturePref, 10) || null,
        parseInt(gymInterest, 10) || null,
        parseInt(mediaInterest, 10) || null
      ]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Error saving scores:', err);
    res.status(500).json({ error: 'Failed to save scores' });
  }
});

// Save interests (major, year, personality, hobbies)
app.post('/api/interests', authenticate, requireDbUser, async (req, res) => {
  const { major, year, personality, hobbies } = req.body;
  try {
    const hobbiesArr = Array.isArray(hobbies)
      ? [...new Set(hobbies.map(h => String(h).trim()).filter(Boolean))]
      : [];
    await pool.query(
      `INSERT INTO interests ("userId", major, year, personality, hobbies)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT ("userId")
       DO UPDATE SET
         major = EXCLUDED.major,
         year = EXCLUDED.year,
         personality = EXCLUDED.personality,
         hobbies = EXCLUDED.hobbies,
         "updatedAt" = NOW()`,
      [req.userId, major || '', year || '', personality || '', hobbiesArr]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Error saving interests:', err);
    res.status(500).json({ error: 'Failed to save interests' });
  }
});

// Get full profile (dealbreakers + scores + interests) for current user
app.get('/api/profile', authenticate, requireDbUser, async (req, res) => {
  try {
    const [dealRes, scoresRes, interestsRes] = await Promise.all([
      pool.query('SELECT * FROM dealbreakers WHERE "userId" = $1 LIMIT 1', [req.userId]),
      pool.query('SELECT * FROM scores WHERE "userId" = $1 LIMIT 1', [req.userId]),
      pool.query('SELECT * FROM interests WHERE "userId" = $1 LIMIT 1', [req.userId])
    ]);
    res.json({
      dealbreakers: dealRes.rows[0] || null,
      scores: scoresRes.rows[0] || null,
      interests: interestsRes.rows[0] || null
    });
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// --- Protected routes (all below require auth) ---
app.use(authenticate);
app.use(requireDbUser);

app.get('/api/me', async (req, res) => {
  const { rows } = await pool.query('SELECT id, email, clerk_id FROM users WHERE id = $1', [req.userId]);
  res.json(rows[0]);
});

const port = Number.parseInt(process.env.PORT, 10) || 3000;
app.listen(port, () => console.log(`Server on port ${port}`));
