const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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

// Auth middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  try {
    req.userId = jwt.verify(token, process.env.JWT_SECRET).userId;
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// Public routes (no authentication required)
// Register
app.post('/auth/register', async (req, res) => {
  const { email, password } = req.body;
  const hash = await bcrypt.hash(password, 12);
  const { rows } = await pool.query(
    'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
    [email, hash]
  ).catch(() => res.status(400).json({ error: 'Email already exists' }) || { rows: [] });
  if (rows[0]) res.json({ token: sign(rows[0].id), user: rows[0] });
});

// Login
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash)))
    return res.status(401).json({ error: 'Invalid credentials' });
  res.json({ token: sign(user.id), user: { id: user.id, email: user.email } });
});

// Sync Clerk user to Neon DB after sign-up
app.post('/api/clerk-user', async (req, res) => {
  const { clerkId, email } = req.body;
  if (!clerkId || !email) return res.status(400).json({ error: 'clerkId and email are required' });
  try {
    const { rows } = await pool.query(
      'INSERT INTO users (clerk_id, email) VALUES ($1, $2) ON CONFLICT (clerk_id) DO UPDATE SET email = EXCLUDED.email RETURNING id, clerk_id, email',
      [clerkId, email]
    );
    res.json({ user: rows[0] || { clerkId, email, existing: true } });
  } catch (err) {
    console.error('Error creating clerk user:', err);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Save lifestyle scores to living_styles table
app.post('/api/preferences', async (req, res) => {
  const { clerkId, scores } = req.body;
  if (!clerkId || !scores) return res.status(400).json({ error: 'clerkId and scores are required' });

  try {
    const { rows: users } = await pool.query('SELECT id FROM users WHERE clerk_id = $1', [clerkId]);
    if (!users[0]) return res.status(404).json({ error: 'User not found' });
    const userId = users[0].id;

    await pool.query('DELETE FROM living_styles WHERE user_id = $1', [userId]);
    await pool.query(
      `INSERT INTO living_styles (user_id, clerk_id, sleep_schedule, cleanliness, noise_level, guests, pets)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [userId, clerkId, scores.sleepSchedule, scores.cleanliness, scores.noiseTolerance, scores.guestsFrequency, scores.pets || '']
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Error saving preferences:', err);
    res.status(500).json({ error: 'Failed to save preferences' });
  }
});

// All routes below this line require authentication
app.use(authenticate);

// Protected API routes
app.get('/api/me', async (req, res) => {
  const { rows } = await pool.query('SELECT id, email FROM users WHERE id = $1', [req.userId]);
  res.json(rows[0]);
});

app.listen(process.env.PORT, () => console.log(`Server on port ${process.env.PORT}`));