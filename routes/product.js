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
    const results = await db.query('SELECT * FROM Product');
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to retrieve products.' });
  }
});

router.post('/', [
  check('Name').notEmpty().withMessage('Name cannot be empty.'),
  check('Description').notEmpty().withMessage('Description cannot be empty.'),
  check('Price').isNumeric().withMessage('Price must be a numeric value.'),
  check('CategoryID').isInt().withMessage('CategoryID must be an integer.'),
], validateInput, withTransaction, async (req, res) => {
  const { Name, Description, Price, CategoryID } = req.body;
  const product = { Name, Description, Price, CategoryID };

  try {
    const result = await db.query('INSERT INTO Product SET ?', product);
    const productId = result.insertId;
    res.json({ message: 'Product added successfully', id: productId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to add product.' });
  }
});

router.put('/:id', [
  check('Name').notEmpty().withMessage('Name cannot be empty.'),
  check('Description').notEmpty().withMessage('Description cannot be empty.'),
  check('Price').isNumeric().withMessage('Price must be a numeric value.'),
  check('CategoryID').isInt().withMessage('CategoryID must be an integer.'),
], validateInput, withTransaction, async (req, res) => {
  const { Name, Description, Price, CategoryID } = req.body;
  const productId = req.params.id;

  try {
    await db.query('UPDATE Product SET Name = ?, Description = ?, Price = ?, CategoryID = ? WHERE ProductID = ?', [Name, Description, Price, CategoryID, productId]);
    res.json({ message: 'Product updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update product.' });
  }
});

router.delete('/:id', withTransaction, async (req, res) => {
  const productId = req.params.id;

  try {
    await db.query('DELETE FROM Product WHERE ProductID = ?', productId);
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete product.' });
  }
});

module.exports = router;
