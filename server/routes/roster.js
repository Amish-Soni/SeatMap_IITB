const express = require('express');
const router = express.Router({ mergeParams: true }); // Need mergeParams to get hallId from parent router
const Seat = require('../models/Seat');
const ExtraSeat = require('../models/ExtraSeat');

// Get all seats and extra seats for a hall
router.get('/', async (req, res) => {
  try {
    const hallId = req.params.hallId;
    const seats = await Seat.find({ hallId });
    const extraSeats = await ExtraSeat.find({ hallId });
    
    // Format to match frontend state expectations
    const roster = {};
    seats.forEach(s => {
      roster[s.seatId] = {
        name: s.name,
        rollNo: s.rollNo,
        notes: s.notes,
        doNotCall: s.doNotCall
      };
    });
    
    const extra = {};
    extraSeats.forEach(e => {
      extra[e.extraId] = {
        row: e.row,
        colKey: e.colKey,
        order: e.order
      };
    });

    res.json({ roster, extraSeats: extra });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add an extra seat
router.post('/extra', async (req, res) => {
  try {
    const hallId = req.params.hallId;
    const { extraId, row, colKey, order } = req.body;
    
    const extraSeat = new ExtraSeat({ hallId, extraId, row, colKey, order });
    await extraSeat.save();
    res.status(201).json(extraSeat);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Upsert a seat
router.put('/:seatId', async (req, res) => {
  try {
    const hallId = req.params.hallId;
    const seatId = req.params.seatId;
    const { name, rollNo, notes, doNotCall } = req.body;

    const seat = await Seat.findOneAndUpdate(
      { hallId, seatId },
      { name, rollNo, notes, doNotCall },
      { new: true, upsert: true }
    );
    res.json(seat);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a seat's data (and remove extra seat if applicable)
router.delete('/:seatId', async (req, res) => {
  try {
    const hallId = req.params.hallId;
    const seatId = req.params.seatId;
    
    await Seat.findOneAndDelete({ hallId, seatId });
    // Attempt to delete from ExtraSeat as well, in case it was an extra seat
    await ExtraSeat.findOneAndDelete({ hallId, extraId: seatId });
    
    res.json({ message: 'Seat data cleared' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Clear all roster names for a hall
router.delete('/', async (req, res) => {
  try {
    const hallId = req.params.hallId;
    await Seat.deleteMany({ hallId });
    await ExtraSeat.deleteMany({ hallId }); // Also clear extra seats to be consistent with original behavior
    res.json({ message: 'Roster cleared' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
