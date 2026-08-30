const mongoose = require('mongoose');

const hallSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  rows: [
    {
      _id: false,
      label: { type: String, required: true },
      c1: { type: [Number], required: true },
      c2: { type: [Number], required: true },
      c3: { type: [Number], required: true },
    },
  ],
  columns: [
    {
      _id: false,
      key: { type: String, required: true },
      name: { type: String, required: true },
      range: { type: String, required: true },
    },
  ],
  isDefault: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model('Hall', hallSchema);
