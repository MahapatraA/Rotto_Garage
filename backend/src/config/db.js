const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.ROTTO_MONGO_URI);
    console.log(`[ROTTO] MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`[ROTTO] MongoDB connection error: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
