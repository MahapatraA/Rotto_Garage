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

router.post('/', authenticate, createBooking);
router.get('/my', authenticate, getMyBookings);
router.put('/:id/status', authenticate, requireAdmin, updateBookingStatus);
router.get('/', authenticate, requireAdmin, getAllBookings);

module.exports = router;
