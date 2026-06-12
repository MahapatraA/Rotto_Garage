const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const {
  createBooking,
  getMyBookings,
  updateBookingStatus,
  getAllBookings,
} = require('../controllers/bookingController');

// TODO: wire up routes

module.exports = router;
