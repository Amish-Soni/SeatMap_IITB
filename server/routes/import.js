const express = require('express');
const router = express.Router({ mergeParams: true });
const multer = require('multer');
const fs = require('fs');
const Seat = require('../models/Seat');
const Hall = require('../models/Hall');
const Attendance = require('../models/Attendance');

const upload = multer({ dest: 'uploads/' });

function parseCSV(text) {
  const lines = text.split(/\r\n|\n|\r/).filter(l => l.trim().length > 0);
  return lines.map(line => {
    const cells = [];
    let cur = '', inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"') { if (line[i + 1] === '"') { cur += '"'; i++; } else inQuotes = false; }
        else cur += ch;
      } else {
        if (ch === '"') inQuotes = true;
        else if (ch === ',') { cells.push(cur); cur = ''; }
        else cur += ch;
      }
    }
    cells.push(cur);
    return cells.map(c => c.trim());
  });
}

function buildValidSeatsMap(hall) {
  const validSeats = new Set();
  hall.rows.forEach(row => {
    hall.columns.forEach(col => {
      row[col.key].forEach(num => validSeats.add(row.label + num));
    });
  });
  return validSeats;
}

// Import CSV
router.post('/csv', upload.single('csvFile'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  try {
    const hallId = req.params.hallId;
    const hall = await Hall.findById(hallId);
    if (!hall) throw new Error('Hall not found');

    const validSeats = buildValidSeatsMap(hall);
    const text = fs.readFileSync(req.file.path, 'utf8');
    const rows = parseCSV(text);
    
    fs.unlinkSync(req.file.path); // clean up
    
    if (rows.length === 0) return res.json({ imported: 0, updated: 0, invalidSeats: [], blankRows: [] });

    let nameIdx = 0, seatIdx = 1, rollIdx = -1;
    const first = rows[0].map(c => c.toLowerCase());
    const nameHeaderIdx = first.indexOf('name');
    const seatHeaderIdx = first.indexOf('seat');
    const rollHeaderIdx = first.findIndex(c => ['roll', 'rollno', 'roll no', 'roll number', 'roll_no'].includes(c));
    
    let startRow = 0;
    if (nameHeaderIdx !== -1 && seatHeaderIdx !== -1) {
      nameIdx = nameHeaderIdx; seatIdx = seatHeaderIdx; startRow = 1;
      if (rollHeaderIdx !== -1) rollIdx = rollHeaderIdx;
    }

    let imported = 0, updated = 0;
    const invalidSeats = [];
    const blankRows = [];
    
    // Process in batches or one by one
    for (let i = startRow; i < rows.length; i++) {
      const cells = rows[i];
      if (cells.length <= Math.max(nameIdx, seatIdx)) { blankRows.push(i + 1); continue; }
      const name = cells[nameIdx];
      const seatId = cells[seatIdx].toUpperCase().replace(/\s+/g, '');
      const rollNo = rollIdx !== -1 && cells[rollIdx] ? cells[rollIdx].trim() : '';
      
      if (!name || !seatId) { blankRows.push(i + 1); continue; }
      if (!validSeats.has(seatId)) { invalidSeats.push(seatId); continue; }
      
      const existing = await Seat.findOne({ hallId, seatId });
      if (existing) updated++; else imported++;
      
      await Seat.findOneAndUpdate(
        { hallId, seatId },
        { 
          name, 
          rollNo: rollNo || (existing && existing.rollNo) || '',
          notes: (existing && existing.notes) || '',
          doNotCall: !!(existing && existing.doNotCall)
        },
        { upsert: true }
      );
    }
    
    res.json({ imported, updated, invalidSeats, blankRows });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: err.message });
  }
});

// Export JSON
router.get('/json', async (req, res) => {
  try {
    const hallId = req.params.hallId;
    const date = req.query.date || new Date().toISOString().slice(0, 10);
    
    const hall = await Hall.findById(hallId);
    if (!hall) return res.status(404).json({ message: 'Hall not found' });
    
    const seats = await Seat.find({ hallId });
    const attendance = await Attendance.find({ hallId, date });
    
    const attMap = {};
    attendance.forEach(a => attMap[a.seatId] = a.status);
    
    const data = [];
    // Reconstruct full map based on hall config
    hall.rows.forEach(row => {
      hall.columns.forEach(col => {
        row[col.key].forEach(num => {
          const id = row.label + num;
          const seatData = seats.find(s => s.seatId === id);
          data.push({
            seat: id,
            column: col.name,
            row: row.label,
            isExtra: false,
            name: seatData ? seatData.name : null,
            rollNo: seatData ? seatData.rollNo : null,
            notes: seatData ? seatData.notes : null,
            doNotCall: seatData ? seatData.doNotCall : false,
            attendance: attMap[id] || 'not marked'
          });
        });
      });
    });
    
    // Also export extra seats
    const ExtraSeat = require('../models/ExtraSeat');
    const extraSeats = await ExtraSeat.find({ hallId });
    extraSeats.forEach(ex => {
      const seatData = seats.find(s => s.seatId === ex.extraId);
      data.push({
        seat: `${ex.row}+${ex.order}`,
        column: hall.columns.find(c => c.key === ex.colKey)?.name || 'Unknown',
        row: ex.row,
        isExtra: true,
        name: seatData ? seatData.name : null,
        rollNo: seatData ? seatData.rollNo : null,
        notes: seatData ? seatData.notes : null,
        doNotCall: seatData ? seatData.doNotCall : false,
        attendance: attMap[ex.extraId] || 'not marked'
      });
    });
    
    res.json({ hall: hall.name, date, seats: data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
