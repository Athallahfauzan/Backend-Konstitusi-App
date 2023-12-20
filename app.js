const express = require('express');
const http = require('http');
const fs = require('fs');
const path = require('path');

const app = express();

// Middleware untuk membaca data JSON dan formulir
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const adminloginRoutes = require('./routes/adminlogin');
const bookingRoutes = require('./routes/booking');
const categoryRoutes = require('./routes/category');
const loginRoutes = require('./routes/login');
const orderdetailsRoutes = require('./routes/orderDetails');
const ordertableRoutes = require('./routes/ordertable');
const paymentRoutes = require('./routes/payment');
const productRoutes = require('./routes/product');
const profileRoutes = require('./routes/profile');
const ratingsRoutes = require('./routes/ratings');
const indexRoutes = require('./routes/index');

// Use routes
app.use('/adminlogin', adminloginRoutes);
app.use('/booking', bookingRoutes);
app.use('/category', categoryRoutes);
app.use('/login', loginRoutes);
app.use('/orderdetails', orderdetailsRoutes);
app.use('/ordertable', ordertableRoutes);
app.use('/payment', paymentRoutes);
app.use('/product', productRoutes);
app.use('/profile', profileRoutes);
app.use('/ratings', ratingsRoutes);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Middleware untuk menangani kesalahan
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: `Internal server error: ${err.message}` });
});

// Start server
const PORT = process.env.PORT || 4000;
const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
