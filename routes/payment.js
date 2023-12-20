const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const results = await db.query('SELECT * FROM Payment');
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const paymentId = req.params.id;
    const result = await db.query('SELECT * FROM Payment WHERE PaymentID = ?', paymentId);

    if (result.length > 0) {
      res.json(result[0]);
    } else {
      res.status(404).json({ message: 'Payment not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { Type, Status, Amount, OrderID } = req.body;
    const payment = { Type, Status, Amount, OrderID };
    const result = await db.query('INSERT INTO Payment SET ?', payment);
    res.json({ message: 'Payment added successfully', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { Status } = req.body;
    const paymentId = req.params.id;
    await db.query('UPDATE Payment SET Status = ? WHERE PaymentID = ?', [Status, paymentId]);
    res.json({ message: 'Payment status updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const paymentId = req.params.id;
    await db.query('DELETE FROM Payment WHERE PaymentID = ?', paymentId);
    res.json({ message: 'Payment deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
