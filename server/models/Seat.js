const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  hallId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hall',
    required: true,
    index: true,
  },
  seatId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    default: '',
  },
  rollNo: {
    type: String,
    default: '',
  },
  notes: {
    type: String,
    default: '',
  },
  doNotCall: {
    type: Boolean,
    default: false,
  },
});

seatSchema.index({ hallId: 1, seatId: 1 }, { unique: true });

module.exports = mongoose.model('Seat', seatSchema);
