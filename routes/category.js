const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const db = require('../db');

const validateInput = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const withTransaction = async (req, res, next) => {
  try {
    await db.beginTransaction();
    await next();
    await db.commit();
  } catch (err) {
    await db.rollback();
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

router.get('/', async (req, res) => {
  try {
    const results = await db.query('SELECT * FROM Category');
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/', [
  check('CategoryName').notEmpty(),
], validateInput, withTransaction, async (req, res) => {
  const { CategoryName } = req.body;
  const category = { CategoryName };

  try {
    const result = await db.query('INSERT INTO Category SET ?', category);
    res.json({ message: 'Category added successfully', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/category/:id', [
  check('CategoryName').notEmpty(),
], validateInput, withTransaction, async (req, res) => {
  const { CategoryName } = req.body;
  const categoryId = req.params.id;

  try {
    await db.query('UPDATE Category SET CategoryName = ? WHERE CategoryID = ?', [CategoryName, categoryId]);
    res.json({ message: 'Category updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/category/:id', withTransaction, async (req, res) => {
  try {
    const categoryId = req.params.id;
    await db.query('DELETE FROM Category WHERE CategoryID = ?', categoryId);
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
