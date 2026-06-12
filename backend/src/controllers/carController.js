const Car = require('../models/Car');

/**
 * POST /api/cars — create a car for the authenticated user.
 */
const createCar = async (req, res, next) => {
  // TODO
  try {
    const { make, model, year, registrationNumber, fuelType } = req.body;

    if (!make || !model || !year || !registrationNumber || !fuelType) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'make, model, year, registrationNumber, and fuelType are required',
        },
      });
    }

    const existing = await Car.findOne({ registrationNumber: registrationNumber.toUpperCase() });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: { code: 'REGISTRATION_EXISTS', message: 'A car with this registration number already exists' },
      });
    }

    const car = await Car.create({
      userId: req.user.id,
      make,
      model,
      year: Number(year),
      registrationNumber,
      fuelType,
    });

    res.status(201).json({ success: true, data: car });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/cars — list all cars belonging to the authenticated user.
 */
const getMyCars = async (req, res, next) => {
  // TODO

    try {
    const cars = await Car.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, data: cars });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/cars/:id — get a single car (must belong to the authenticated user).
 */
const getCarById = async (req, res, next) => {
  // TODO
  try {
    const car = await Car.findOne({ _id: req.params.id, userId: req.user.id });
    if (!car) {
      return res.status(404).json({
        success: false,
        error: { code: 'CAR_NOT_FOUND', message: 'Car not found or does not belong to you' },
      });
    }
    res.json({ success: true, data: car });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/cars/:id — update a car (make, model, year, fuelType only).
 */
const updateCar = async (req, res, next) => {
  // TODO
  try {
    const { make, model, year, fuelType } = req.body;

    const car = await Car.findOne({ _id: req.params.id, userId: req.user.id });
    if (!car) {
      return res.status(404).json({
        success: false,
        error: { code: 'CAR_NOT_FOUND', message: 'Car not found or does not belong to you' },
      });
    }

    if (make)    car.make     = make;
    if (model)   car.model    = model;
    if (year)    car.year     = Number(year);
    if (fuelType) car.fuelType = fuelType;

    await car.save();
    res.json({ success: true, data: car });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/cars/:id — delete a car.
 * Return 409 if any active bookings exist for this car.
 */
const deleteCar = async (req, res, next) => {
  // TODO

  try {
    const car = await Car.findOne({ _id: req.params.id, userId: req.user.id });
    if (!car) {
      return res.status(404).json({
        success: false,
        error: { code: 'CAR_NOT_FOUND', message: 'Car not found or does not belong to you' },
      });
    }

    const activeBooking = await Booking.findOne({
      carId: req.params.id,
      status: { $in: ['pending', 'confirmed', 'in-progress'] },
    });
    if (activeBooking) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'ACTIVE_BOOKINGS_EXIST',
          message: 'Cannot delete a car with active bookings. Cancel them first.',
        },
      });
    }

    await car.deleteOne();
    res.json({ success: true, data: { message: 'Car deleted successfully' } });
  } catch (err) {
    next(err);
  }
};

module.exports = { createCar, getMyCars, getCarById, updateCar, deleteCar };
