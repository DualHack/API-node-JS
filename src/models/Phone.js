const mongoose = require('mongoose');

const phoneSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    reports: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    riskLevel: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'LOW',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Phone', phoneSchema);
