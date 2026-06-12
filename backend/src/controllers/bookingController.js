const Booking = require('../models/Booking');
const Car = require('../models/Car');

/**
 * POST /api/bookings
 * Protected — create a service booking.
 */
const createBooking = async (req, res, next) => {
  try {
    const { carId, serviceType, scheduledDate, notes, estimatedCost } = req.body;

    if (!carId || !serviceType || !scheduledDate) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'carId, serviceType, and scheduledDate are required',
        },
      });
    }

    const car = await Car.findOne({ _id: carId, userId: req.user.id });
    if (!car) {
      return res.status(404).json({
        success: false,
        error: { code: 'CAR_NOT_FOUND', message: 'Car not found or does not belong to you' },
      });
    }

    const conflict = await Booking.findOne({
      carId,
      scheduledDate: new Date(scheduledDate),
      status: { $in: ['pending', 'confirmed', 'in-progress'] },
    });
    if (conflict) {
      return res.status(409).json({
        success: false,
        error: { code: 'BOOKING_CONFLICT', message: 'This car already has a booking on that date' },
      });
    }

    const booking = await Booking.create({
      userId: req.user.id,
      carId,
      serviceType,
      scheduledDate: new Date(scheduledDate),
      notes,
      estimatedCost: estimatedCost || 0,
    });

    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/bookings/my
 * Protected — paginated list of the current user's bookings.
 * Query params: page (default 1), limit (default 10)
 */
const getMyBookings = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = page * limit;

    const [bookings, total] = await Promise.all([
      Booking.find({ userId: req.user.id })
        .populate('carId')
        .populate('userId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Booking.countDocuments({ userId: req.user.id }),
    ]);

    res.json({
      success: true,
      data: bookings,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/bookings/:id/status
 * Protected (admin) — update a booking's status.
 * Valid transitions:
 *   pending → confirmed | cancelled
 *   confirmed → in-progress | cancelled
 *   in-progress → completed | cancelled
 */
const updateBookingStatus = async (req, res, next) => {
  // TODO
};

/**
 * GET /api/bookings
 * Protected (admin) — all bookings with optional filters.
 * Query params: status, serviceType, page, limit
 */
const getAllBookings = async (req, res, next) => {
  // TODO
};

module.exports = {
  createBooking,
  getMyBookings,
  updateBookingStatus,
  getAllBookings,
};
