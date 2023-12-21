const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');

// Endpoint untuk melakukan login admin
router.post('/adminlogin', async (req, res) => {
  const { Username, Password } = req.body;

  try {
    // Cari admin berdasarkan username
    const results = await db.query('SELECT * FROM AdminLogin WHERE Username = ?', [Username]);

    if (results.length > 0) {
      const admin = results[0];
      const passwordMatch = await bcrypt.compare(Password, admin.Password);

      if (passwordMatch) {
        res.json({ message: 'Admin login successful', admin });
      } else {
        res.status(401).json({ message: 'Admin login failed' });
      }
    } else {
      res.status(401).json({ message: 'Admin login failed' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
