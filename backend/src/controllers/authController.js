const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * POST /api/auth/register
 * Public — creates a new user account.
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Name, email, and password are required',
        },
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: { code: 'EMAIL_EXISTS', message: 'An account with this email already exists' },
      });
    }

    const user = await User.create({ name, email, password });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, name: user.name },
      process.env.ROTTO_JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      data: { token, user },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/login
 * Public — returns a JWT on valid credentials.
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Email and password are required' },
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
      });
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
      });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, name: user.name },
      process.env.ROTTO_JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: { token, user },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/me
 * Protected — returns the currently authenticated user.
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User not found' },
      });
    }
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe };
