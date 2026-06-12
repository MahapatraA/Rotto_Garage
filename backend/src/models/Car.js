const mongoose = require('mongoose');

const carSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    make: {
      type: String,
      required: [true, 'Make is required'],
      trim: true,
    },
    model: {
      type: String,
      required: [true, 'Model is required'],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
      min: [1990, 'Year must be 1990 or later'],
      max: [new Date().getFullYear() + 1, 'Invalid year'],
    },
    registrationNumber: {
      type: String,
      required: [true, 'Registration number is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    fuelType: {
      type: String,
      enum: ['petrol', 'diesel', 'electric', 'hybrid'],
      required: [true, 'Fuel type is required'],
    },
  },
  { timestamps: true }
);

carSchema.index({ userId: 1 });

module.exports = mongoose.model('Car', carSchema);
