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
    const results = await db.query('SELECT * FROM OrderDetails');
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/', [
  check('OrderID').isInt(),
  check('ProductID').isInt(),
  check('Quantity').isInt(),
  check('Subtotal').isNumeric(),
], validateInput, withTransaction, async (req, res) => {
  const { OrderID, ProductID, Quantity, Subtotal } = req.body;
  const orderDetail = { OrderID, ProductID, Quantity, Subtotal };

  try {
    const result = await db.query('INSERT INTO OrderDetails SET ?', orderDetail);
    res.json({ message: 'Order detail added successfully', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/:id', withTransaction, async (req, res) => {
  try {
    const orderDetailId = req.params.id;
    await db.query('DELETE FROM OrderDetails WHERE OrderDetailID = ?', orderDetailId);
    res.json({ message: 'Order detail deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
