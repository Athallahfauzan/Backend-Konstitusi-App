const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.get('/', async (req, res) => {
  const userId = req.params.id;

  try {
    const results = await db.query('SELECT * FROM Profile WHERE ProfileID = ?', [userId]);

    if (results.length > 0) {
      const userProfile = results[0];
      res.json({ userProfile });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/signup', async (req, res) => {
  const { Name, Email, Password } = req.body;

  try {
    const existingUser = await db.query('SELECT * FROM Profile WHERE Email = ?', [Email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Email is already registered' });
    }
    const hashedPassword = await bcrypt.hash(Password, 10);
    const result = await db.query('INSERT INTO Profile (Name, Email, Password) VALUES (?, ?, ?)', [Name, Email, hashedPassword]);
    const token = jwt.sign({ userId: result.insertId }, 'your-secret-key', { expiresIn: '1h' });

    res.json({ message: 'Signup successful', token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  const { Email, Password } = req.body;

  try {
    const results = await db.query('SELECT * FROM Profile WHERE Email = ?', [Email]);

    if (results.length > 0) {
      const profile = results[0];
      const passwordMatch = await bcrypt.compare(Password, profile.Password);

      if (passwordMatch) {
        const token = jwt.sign({ userId: profile.ProfileID }, 'your-secret-key', { expiresIn: '1h' });
        res.json({ message: 'Login successful', token });
      } else {
        res.status(401).json({ message: 'Login failed' });
      }
    } else {
      res.status(401).json({ message: 'Login failed' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
