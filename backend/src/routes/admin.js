const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { getAdminStats } = require('../controllers/adminController');

router.get('/stats', authenticate, requireAdmin, getAdminStats);

module.exports = router;