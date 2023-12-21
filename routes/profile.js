const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');

const validateInput = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const withTransaction = async (req, res, next) => {
  const connection = await db.beginTransaction();
  try {
    await next();
    await db.commit(connection);
  } catch (err) {
    await db.rollback(connection);
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
l
router.get('/', async (req, res) => {
  try {
    const results = await db.query('SELECT * FROM Profile');
    res.json({ profiles: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch profiles' });
  }
});

router.post('/', [
  check('Name').notEmpty(),
  check('ContactInfo').notEmpty(),
  check('Email').isEmail(),
  check('Password').isLength({ min: 6 }),
  check('Address').notEmpty(),
], validateInput, withTransaction, async (req, res) => {
  const { Name, ContactInfo, Email, Password, Address } = req.body;
  const hashedPassword = await bcrypt.hash(Password, 10);
  const profile = { Name, ContactInfo, Email, Password: hashedPassword, Address };

  try {
    const result = await db.query('INSERT INTO Profile SET ?', profile);
    const profileId = result.insertId;
    res.json({ message: 'Profile added successfully', profileId });
  } catch (err) {
    console.error(err);

    // Check if the error is due to a duplicate entry
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Email address is already in use' });
    }

    res.status(500).json({ message: 'Failed to add profile' });
  }
});

router.put('/:id', [
  check('Name').notEmpty(),
  check('ContactInfo').notEmpty(),
  check('Email').isEmail(),
  check('Password').isLength({ min: 6 }),
  check('Address').notEmpty(),
], validateInput, withTransaction, async (req, res) => {
  const { Name, ContactInfo, Email, Password, Address } = req.body;
  const profileId = req.params.id;
  const hashedPassword = await bcrypt.hash(Password, 10);

  try {
    await db.query('UPDATE Profile SET Name = ?, ContactInfo = ?, Email = ?, Password = ?, Address = ? WHERE ProfileID = ?', [Name, ContactInfo, Email, hashedPassword, Address, profileId]);
    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

router.delete('/:id', withTransaction, async (req, res) => {
  const profileId = req.params.id;

  try {
    await db.query('DELETE FROM Profile WHERE ProfileID = ?', profileId);
    res.json({ message: 'Profile deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete profile' });
  }
});

module.exports = router;
