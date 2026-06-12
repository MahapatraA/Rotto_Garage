require('dotenv').config();
const express = require('express');
const cors = require('cors');

const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');
const { requestLogger } = require('./middleware/logger');

const authRoutes = require('./routes/auth');
const carRoutes = require('./routes/cars');
const bookingRoutes = require('./routes/bookings');

const app = express();

connectDB();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());
app.use(requestLogger);

app.use(errorHandler);

app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/bookings', bookingRoutes);

app.get('/api/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date() } });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: `Route ${req.method} ${req.path} not found` },
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[ROTTO] Server running on http://localhost:${PORT}`);
});

module.exports = app;
