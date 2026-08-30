const express = require('express');
const router = express.Router();
const Hall = require('../models/Hall');
const Seat = require('../models/Seat');
const Attendance = require('../models/Attendance');
const ExtraSeat = require('../models/ExtraSeat');

// Get all halls
router.get('/', async (req, res) => {
  try {
    const halls = await Hall.find().select('name isDefault description');
    res.json(halls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single hall with its configuration
router.get('/:id', async (req, res) => {
  try {
    const hall = await Hall.findById(req.params.id);
    if (!hall) return res.status(404).json({ message: 'Hall not found' });
    res.json(hall);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new hall
router.post('/', async (req, res) => {
  try {
    const { name, description, rows, columns, cloneFromId } = req.body;
    let hallData = { name, description };
    
    if (cloneFromId) {
      const sourceHall = await Hall.findById(cloneFromId);
      if (!sourceHall) return res.status(404).json({ message: 'Source hall to clone not found' });
      hallData.rows = sourceHall.rows;
      hallData.columns = sourceHall.columns;
    } else {
      hallData.rows = rows;
      hallData.columns = columns;
    }

    const hall = new Hall(hallData);
    const newHall = await hall.save();
    
    // If it's the first hall, make it default
    const count = await Hall.countDocuments();
    if (count === 1) {
      newHall.isDefault = true;
      await newHall.save();
    }
    
    res.status(201).json(newHall);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a hall and cascade delete its data
router.delete('/:id', async (req, res) => {
  try {
    const hallId = req.params.id;
    const hall = await Hall.findByIdAndDelete(hallId);
    if (!hall) return res.status(404).json({ message: 'Hall not found' });
    
    // Cascade delete
    await Seat.deleteMany({ hallId });
    await Attendance.deleteMany({ hallId });
    await ExtraSeat.deleteMany({ hallId });
    
    // If it was default, assign a new default if possible
    if (hall.isDefault) {
       const newDefault = await Hall.findOne();
       if (newDefault) {
         newDefault.isDefault = true;
         await newDefault.save();
       }
    }
    
    res.json({ message: 'Hall deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Set a hall as default
router.put('/:id/default', async (req, res) => {
  try {
    const hallId = req.params.id;
    await Hall.updateMany({}, { isDefault: false });
    const hall = await Hall.findByIdAndUpdate(hallId, { isDefault: true }, { new: true });
    res.json(hall);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
