const Car = require('../models/Car');

/**
 * POST /api/cars — create a car for the authenticated user.
 */
const createCar = async (req, res, next) => {
  // TODO
};

/**
 * GET /api/cars — list all cars belonging to the authenticated user.
 */
const getMyCars = async (req, res, next) => {
  // TODO
};

/**
 * GET /api/cars/:id — get a single car (must belong to the authenticated user).
 */
const getCarById = async (req, res, next) => {
  // TODO
};

/**
 * PUT /api/cars/:id — update a car (make, model, year, fuelType only).
 */
const updateCar = async (req, res, next) => {
  // TODO
};

/**
 * DELETE /api/cars/:id — delete a car.
 * Return 409 if any active bookings exist for this car.
 */
const deleteCar = async (req, res, next) => {
  // TODO
};

module.exports = { createCar, getMyCars, getCarById, updateCar, deleteCar };
