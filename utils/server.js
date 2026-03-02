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

// Sync Clerk user to DB
app.post('/api/clerk-user', authenticate, async (req, res) => {
  const { clerkId, email } = req.body;
  if (!clerkId || !email) return res.status(400).json({ error: 'clerkId and email are required' });
  if (req.clerkId && req.clerkId !== clerkId) return res.status(403).json({ error: 'Token/user mismatch' });
  try {
    const { rows } = await pool.query(
      `INSERT INTO users (clerk_id, email)
       VALUES ($1, $2)
       ON CONFLICT (clerk_id)
       DO UPDATE SET email = EXCLUDED.email
       RETURNING id, clerk_id, email`,
      [clerkId, email]
    );
    res.json({ user: rows[0] });
  } catch (err) {
    console.error('Error creating clerk user:', err);
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

// --- Protected routes (all below require auth) ---
app.use(authenticate);
app.use(requireDbUser);

app.get('/api/me', async (req, res) => {
  const { rows } = await pool.query('SELECT id, email, clerk_id FROM users WHERE id = $1', [req.userId]);
  res.json(rows[0]);
});

const port = Number.parseInt(process.env.PORT, 10) || 3000;
app.listen(port, () => console.log(`Server on port ${port}`));
