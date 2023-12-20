const express = require('express');
const router = express.Router(); // Use Router instead of app

// Endpoint untuk mendapatkan semua penilaian (ratings)
router.get('/', (req, res) => {
  db.query('SELECT * FROM Ratings', (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Endpoint untuk menambahkan penilaian (ratings) baru
router.post('/', (req, res) => {
  const { ProductID, ProfileID, Rating, Review } = req.body;
  const rating = { ProductID, ProfileID, Rating, Review };
  db.query('INSERT INTO Ratings SET ?', rating, (err, result) => {
    if (err) throw err;
    res.json({ message: 'Rating added successfully', id: result.insertId });
  });
});

// Endpoint untuk mengupdate penilaian (ratings)
router.put('/:id', (req, res) => {
  const { Rating, Review } = req.body;
  const ratingId = req.params.id;
  db.query('UPDATE Ratings SET Rating = ?, Review = ? WHERE RatingID = ?', [Rating, Review, ratingId], (err) => {
    if (err) throw err;
    res.json({ message: 'Rating updated successfully' });
  });
});

// Endpoint untuk menghapus penilaian (ratings)
router.delete('/:id', (req, res) => {
  const ratingId = req.params.id;
  db.query('DELETE FROM Ratings WHERE RatingID = ?', ratingId, (err) => {
    if (err) throw err;
    res.json({ message: 'Rating deleted successfully' });
  });
});

module.exports = router;
