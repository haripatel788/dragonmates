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
app.post('/api/clerk-user', async (req, res) => {
  const { clerkId, email } = req.body;
  if (!clerkId || !email) return res.status(400).json({ error: 'clerkId and email are required' });
  try {
    const { rows } = await pool.query(
      'INSERT INTO "User" (clerkId, email) VALUES ($1, $2) ON CONFLICT (clerkId) DO UPDATE SET email = EXCLUDED.email RETURNING id, clerkId, email',
      [clerkId, email]
    );
    res.json({ user: rows[0] || { clerkId, email, existing: true } });
  } catch (err) {
    console.error('Error creating clerk user:', err);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Save lifestyle scores to livingStyles table
app.post('/api/preferences', async (req, res) => {
  const { clerkId, scores } = req.body;
  if (!clerkId || !scores) return res.status(400).json({ error: 'clerkId and scores are required' });

  try {
    const { rows: users } = await pool.query('SELECT id FROM "User" WHERE clerkId = $1', [clerkId]);
    if (!users[0]) return res.status(404).json({ error: 'User not found' });
    const userId = users[0].id;

    // Updated to match your livingStyles table and camelCase columns
    await pool.query('DELETE FROM "livingStyles" WHERE userId = $1', [userId]);
    await pool.query(
      `INSERT INTO "livingStyles" (userId, sleepSchedule, cleanliness, noiseLevel, guests, pets)
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
app.post('/api/interests', async (req, res) => {
  const { clerkId, hobbies, major, year, personality } = req.body;
  if (!clerkId) return res.status(400).json({ error: 'clerkId is required' });

  try {
    const { rows: users } = await pool.query('SELECT id FROM users WHERE clerk_id = $1', [clerkId]);
    if (!users[0]) return res.status(404).json({ error: 'User not found' });
    const userId = users[0].id;

    // Replace existing interests
    await pool.query('DELETE FROM interests WHERE user_id = $1', [userId]);

    // Insert each hobby as a separate interest row
    if (hobbies && hobbies.length > 0) {
      const values = hobbies.map((_, i) => `($1, $2, $${i + 3})`).join(', ');
      await pool.query(
        `INSERT INTO interests (user_id, clerk_id, interest) VALUES ${values}`,
        [userId, clerkId, ...hobbies]
      );
    }

    // Update or insert profile with major, year, personality
    const { rows: existing } = await pool.query('SELECT id FROM profiles WHERE user_id = $1', [userId]);
    if (existing[0]) {
      await pool.query(
        `UPDATE profiles SET major = $1, year = $2, updated_at = CURRENT_TIMESTAMP WHERE user_id = $3`,
        [major || '', year || '', userId]
      );
    } else {
      await pool.query(
        `INSERT INTO profiles (user_id, clerk_id, major, year) VALUES ($1, $2, $3, $4)`,
        [userId, clerkId, major || '', year || '']
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Error saving interests:', err);
    res.status(500).json({ error: 'Failed to save interests' });
  }
});

// All routes below this line require authentication
app.use(authenticate);

// Protected API routes
app.get('/api/me', async (req, res) => {
  const { rows } = await pool.query('SELECT id, email FROM "User" WHERE id = $1', [req.userId]);
  res.json(rows[0]);
});

// --- Roommate Chat API Routes ---

// Get the user's guaranteed roommate match from roomatePairs
app.get('/api/my-roommate', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT rp.id as pairId, rp.status, 
              u.id as roommateId, u.email as roommateEmail
       FROM "roomatePairs" rp
       JOIN "User" u ON (u.id = rp.user1Id OR u.id = rp.user2Id)
       WHERE (rp.user1Id = $1 OR rp.user2Id = $1) 
         AND u.id != $1
         AND rp.status = 'guaranteed'`,
      [req.userId]
    );
    
    if (rows.length === 0) return res.json({ roommate: null });
    res.json({ roommate: rows[0] });
  } catch (err) {
    console.error('Error fetching roommate:', err);
    res.status(500).json({ error: 'Failed to fetch roommate' });
  }
});

// Fetch message history from privateMessages
app.get('/api/chat/:pairId', async (req, res) => {
  const { pairId } = req.params;
  try {
    const pairCheck = await pool.query(
      'SELECT * FROM "roomatePairs" WHERE id = $1 AND (user1Id = $2 OR user2Id = $2)',
      [pairId, req.userId]
    );
    if (pairCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Unauthorized to view this chat' });
    }

    const { rows } = await pool.query(
      'SELECT * FROM "privateMessages" WHERE pairId = $1 ORDER BY createdAt ASC',
      [pairId]
    );
    res.json({ messages: rows });
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send a new message to privateMessages
app.post('/api/chat/:pairId', async (req, res) => {
  const { pairId } = req.params;
  const { text } = req.body;
  
  if (!text) return res.status(400).json({ error: 'Message text is required' });

  try {
    const pairCheck = await pool.query(
      'SELECT * FROM "roomatePairs" WHERE id = $1 AND (user1Id = $2 OR user2Id = $2)',
      [pairId, req.userId]
    );
    if (pairCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Unauthorized to send messages here' });
    }

    const { rows } = await pool.query(
      'INSERT INTO "privateMessages" (pairId, senderId, messageText) VALUES ($1, $2, $3) RETURNING *',
      [pairId, req.userId, text]
    );
    res.json({ message: rows[0] });
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

app.listen(process.env.PORT, () => console.log(`Server on port ${process.env.PORT}`));