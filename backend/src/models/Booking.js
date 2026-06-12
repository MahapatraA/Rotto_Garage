const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      ref: 'User',
      required: true,
    },
    carId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Car',
      required: true,
    },
    serviceType: {
      type: String,
      enum: ['oil-change', 'tire-rotation', 'brake-inspection', 'full-service', 'battery-check'],
      required: [true, 'Service type is required'],
    },
    scheduledDate: {
      type: Date,
      required: [true, 'Scheduled date is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    estimatedCost: {
      type: Number,
      default: 0,
      min: [0, 'Cost cannot be negative'],
    },
  },
  { timestamps: true }
);

bookingSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Booking', bookingSchema);
