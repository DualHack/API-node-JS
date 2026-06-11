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
    riskScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    lastReportedAt: {
      type: Date,
    },
    trend: {
      type: String,
      enum: ['INCREASING', 'STABLE', 'DECREASING'],
      default: 'STABLE',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Phone', phoneSchema);
