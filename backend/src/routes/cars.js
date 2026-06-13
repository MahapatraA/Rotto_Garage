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

router.post('/', authenticate, createCar);
router.get('/', authenticate, getMyCars);
router.get('/:id', authenticate, getCarById);
router.put('/:id', authenticate, updateCar);
router.delete('/:id', authenticate, deleteCar);

module.exports = router;
