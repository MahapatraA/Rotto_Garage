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

router.use(authenticate);

router.route('/').post(createCar).get(getMyCars);
router.route('/:id').get(getCarById).put(updateCar).delete(deleteCar);

module.exports = router;
