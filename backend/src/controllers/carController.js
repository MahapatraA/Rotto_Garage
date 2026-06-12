const Car = require('../models/Car');
const Booking = require('../models/Booking');

const carNotFound = (res) =>
  res.status(404).json({
    success: false,
    error: { code: 'CAR_NOT_FOUND', message: 'Car not found or does not belong to you' },
  });

const createCar = async (req, res, next) => {
  try {
    const { make, model, year, registrationNumber, fuelType } = req.body;

    if (!make || !model || !year || !registrationNumber || !fuelType) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Make, model, year, registration number, and fuel type are required',
        },
      });
    }

    const car = await Car.create({
      userId: req.user.id,
      make,
      model,
      year,
      registrationNumber,
      fuelType,
    });

    return res.status(201).json({ success: true, data: car });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'REGISTRATION_EXISTS',
          message: 'A car with this registration number already exists',
        },
      });
    }
    return next(err);
  }
};

const getMyCars = async (req, res, next) => {
  try {
    const cars = await Car.find({ userId: req.user.id }).sort({ createdAt: -1 });
    return res.json({ success: true, data: cars });
  } catch (err) {
    return next(err);
  }
};

const getCarById = async (req, res, next) => {
  try {
    const car = await Car.findOne({ _id: req.params.id, userId: req.user.id });
    if (!car) return carNotFound(res);

    return res.json({ success: true, data: car });
  } catch (err) {
    if (err.name === 'CastError') return carNotFound(res);
    return next(err);
  }
};

const updateCar = async (req, res, next) => {
  try {
    const allowedFields = ['make', 'model', 'year', 'fuelType'];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'At least one of make, model, year, or fuelType is required',
        },
      });
    }

    const car = await Car.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      updates,
      { new: true, runValidators: true }
    );

    if (!car) return carNotFound(res);
    return res.json({ success: true, data: car });
  } catch (err) {
    if (err.name === 'CastError') return carNotFound(res);
    return next(err);
  }
};

const deleteCar = async (req, res, next) => {
  try {
    const car = await Car.findOne({ _id: req.params.id, userId: req.user.id });
    if (!car) return carNotFound(res);

    const activeBooking = await Booking.exists({
      carId: car._id,
      status: { $in: ['pending', 'confirmed', 'in-progress'] },
    });

    if (activeBooking) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'ACTIVE_BOOKINGS_EXIST',
          message: 'This car cannot be deleted while it has active bookings',
        },
      });
    }

    await car.deleteOne();
    return res.json({ success: true, data: { id: car._id } });
  } catch (err) {
    if (err.name === 'CastError') return carNotFound(res);
    return next(err);
  }
};

module.exports = { createCar, getMyCars, getCarById, updateCar, deleteCar };
