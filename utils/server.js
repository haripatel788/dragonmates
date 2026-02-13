const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();

const app = express();
app.use(cors(), express.json());

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

// All routes below this line require authentication
app.use(authenticate);

// Protected routes
app.get('/me', async (req, res) => {
  const { rows } = await pool.query('SELECT id, email FROM users WHERE id = $1', [req.userId]);
  res.json(rows[0]);
});

app.listen(process.env.PORT, () => console.log(`Server on port ${process.env.PORT}`));