const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema({
  CompanyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  startTime: {
    type: String, // Example: "09:00"
    required: true,
  },
  endTime: {
    type: String, // Example: "17:00"
    required: true,
  },
  weekOff : {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Indexes for performance
shiftSchema.index({ name: 1 });
shiftSchema.index({ isActive: 1 });
shiftSchema.index({ CompanyId: 1 });

module.exports = mongoose.model('Shift', shiftSchema);
