const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { register, login, getMe } = require('../controllers/authController');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', authenticate, getMe);

module.exports = router;
