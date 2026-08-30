const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
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
  date: {
    type: String,
    required: true, // Format: YYYY-MM-DD
  },
  status: {
    type: String,
    enum: ['present', 'absent'],
    required: true,
  },
});

attendanceSchema.index({ hallId: 1, seatId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
