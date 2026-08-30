const mongoose = require('mongoose');

const extraSeatSchema = new mongoose.Schema({
  hallId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hall',
    required: true,
    index: true,
  },
  extraId: {
    type: String,
    required: true,
  },
  row: {
    type: String,
    required: true,
  },
  colKey: {
    type: String,
    required: true,
  },
  order: {
    type: Number,
    required: true,
  },
});

extraSeatSchema.index({ hallId: 1, extraId: 1 }, { unique: true });

module.exports = mongoose.model('ExtraSeat', extraSeatSchema);
