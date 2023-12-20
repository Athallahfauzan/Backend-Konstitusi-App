const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const results = await db.query('SELECT * FROM Booking');
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { NomorTable, ProfileID, OrderID } = req.body;

    if (!NomorTable || !ProfileID || !OrderID) {
      return res.status(400).json({ error: 'Invalid data. Please provide NomorTable, ProfileID, and OrderID' });
    }

    const booking = { NomorTable, ProfileID, OrderID };
    const result = await db.query('INSERT INTO Booking SET ?', booking);
    res.json({ message: 'Booking created successfully', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: `Internal server error: ${err.message}` });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const bookingId = req.params.id;
    await db.query('DELETE FROM Booking WHERE BookID = ?', bookingId);
    res.json({ message: 'Booking deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: `Internal server error: ${err.message}` });
  }
});

module.exports = router;
