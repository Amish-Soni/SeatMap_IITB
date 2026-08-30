const express = require('express');
const router = express.Router({ mergeParams: true });
const Attendance = require('../models/Attendance');

// Get attendance for a date
router.get('/', async (req, res) => {
  try {
    const hallId = req.params.hallId;
    const date = req.query.date || new Date().toISOString().slice(0, 10);
    
    const records = await Attendance.find({ hallId, date });
    
    const attendanceMap = {};
    records.forEach(r => {
      attendanceMap[r.seatId] = r.status;
    });
    
    res.json(attendanceMap);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update attendance for a seat
router.put('/:seatId', async (req, res) => {
  try {
    const hallId = req.params.hallId;
    const seatId = req.params.seatId;
    const { date, status } = req.body;
    
    if (!status) {
      await Attendance.findOneAndDelete({ hallId, seatId, date });
      return res.json({ message: 'Attendance removed' });
    }

    const record = await Attendance.findOneAndUpdate(
      { hallId, seatId, date },
      { status },
      { new: true, upsert: true }
    );
    res.json(record);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Clear attendance for a date
router.delete('/', async (req, res) => {
  try {
    const hallId = req.params.hallId;
    const date = req.query.date || new Date().toISOString().slice(0, 10);
    
    await Attendance.deleteMany({ hallId, date });
    res.json({ message: 'Attendance cleared for ' + date });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
