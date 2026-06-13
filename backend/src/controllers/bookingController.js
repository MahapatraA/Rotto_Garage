const Booking = require('../models/Booking');
const Car = require('../models/Car');

const parsePagination = (query) => {
  const parsedPage = Number.parseInt(query.page, 10);
  const parsedLimit = Number.parseInt(query.limit, 10);
  const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const limit =
    Number.isInteger(parsedLimit) && parsedLimit > 0 ? Math.min(parsedLimit, 100) : 10;

  return { page, limit, skip: (page - 1) * limit };
};

const bookingNotFound = (res) =>
  res.status(404).json({
    success: false,
    error: { code: 'BOOKING_NOT_FOUND', message: 'Booking not found' },
  });

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

    const date = new Date(scheduledDate);
    if (Number.isNaN(date.getTime())) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'scheduledDate must be a valid date' },
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
      scheduledDate: date,
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
      scheduledDate: date,
      notes,
      estimatedCost: estimatedCost ?? 0,
    });

    return res.status(201).json({ success: true, data: booking });
  } catch (err) {
    return next(err);
  }
};

const getMyBookings = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);

    const [bookings, total] = await Promise.all([
      Booking.find({ userId: req.user.id })
        .populate('carId')
        .populate('userId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Booking.countDocuments({ userId: req.user.id }),
    ]);

    return res.json({
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
    return next(err);
  }
};

const updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const transitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['in-progress', 'cancelled'],
      'in-progress': ['completed', 'cancelled'],
      completed: [],
      cancelled: [],
    };

    if (!status) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Status is required' },
      });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) return bookingNotFound(res);

    if (!transitions[booking.status].includes(status)) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'INVALID_STATUS_TRANSITION',
          message: `Cannot change booking status from ${booking.status} to ${status}`,
        },
      });
    }

    booking.status = status;
    await booking.save();
    await booking.populate(['carId', 'userId']);

    return res.json({ success: true, data: booking });
  } catch (err) {
    if (err.name === 'CastError') return bookingNotFound(res);
    return next(err);
  }
};

const getAllBookings = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const filters = {};

    if (req.query.status) filters.status = req.query.status;
    if (req.query.serviceType) filters.serviceType = req.query.serviceType;

    const [bookings, total] = await Promise.all([
      Booking.find(filters)
        .populate('carId')
        .populate('userId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Booking.countDocuments(filters),
    ]);

    return res.json({
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
    return next(err);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  updateBookingStatus,
  getAllBookings,
};
