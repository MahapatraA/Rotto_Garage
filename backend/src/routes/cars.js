const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  createCar,
  getMyCars,
  getCarById,
  updateCar,
  deleteCar,
} = require('../controllers/carController');

// TODO: wire up routes

module.exports = router;
