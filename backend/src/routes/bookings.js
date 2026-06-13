const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const {
  createBooking,
  getMyBookings,
  updateBookingStatus,
  getAllBookings,
} = require('../controllers/bookingController');

router.post('/', authenticate, createBooking);
router.get('/my', authenticate, getMyBookings);
router.get('/', authenticate, requireAdmin, getAllBookings);
router.put('/:id/status', authenticate, requireAdmin, updateBookingStatus);

module.exports = router;
