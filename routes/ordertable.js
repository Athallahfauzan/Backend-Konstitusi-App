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
    const results = await db.query('SELECT * FROM OrderTable');
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/', [
  check('ProfileID').isInt(),
  check('OrderDate').isISO8601().toDate(),
  check('TotalAmount').isNumeric(),
  check('Type').notEmpty(),
  check('Status').notEmpty(),
], validateInput, withTransaction, async (req, res) => {
  const { ProfileID, OrderDate, TotalAmount, Type, Status } = req.body;
  const order = { ProfileID, OrderDate, TotalAmount, Type, Status };

  try {
    const result = await db.query('INSERT INTO OrderTable SET ?', order);
    
    res.json({ message: 'Order placed successfully', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/:id', [
  check('Status').notEmpty(),
], validateInput, withTransaction, async (req, res) => {
  const { Status } = req.body;
  const orderId = req.params.id;

  try {
    await db.query('UPDATE OrderTable SET Status = ? WHERE OrderID = ?', [Status, orderId]);
    res.json({ message: 'Order status updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/:id', withTransaction, async (req, res) => {
  const orderId = req.params.id;

  try {
    await db.query('DELETE FROM OrderTable WHERE OrderID = ?', orderId);
    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
