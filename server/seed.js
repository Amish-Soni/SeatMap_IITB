require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const fs = require('fs');
const Hall = require('./models/Hall');
const Seat = require('./models/Seat');
const connectDB = require('./config/db');

// Original hardcoded config
const ROWS = [
  { label: 'A', c1: [11, 15], c2: [21, 28], c3: [31, 35] },
  { label: 'B', c1: [11, 16], c2: [21, 27], c3: [31, 36] },
  { label: 'C', c1: [11, 17], c2: [21, 28], c3: [31, 37] },
  { label: 'D', c1: [11, 18], c2: [21, 27], c3: [31, 38] },
  { label: 'E', c1: [11, 18], c2: [21, 28], c3: [31, 38] },
  { label: 'F', c1: [11, 19], c2: [21, 27], c3: [31, 39] },
  { label: 'G', c1: [11, 19], c2: [21, 28], c3: [31, 39] },
  { label: 'H', c1: [11, 19], c2: [21, 27], c3: [31, 39] },
  { label: 'I', c1: [11, 19], c2: [21, 28], c3: [31, 39] },
];
const COLUMNS = [
  { key: 'c1', name: 'LEFT', range: 'Seats 11–19' },
  { key: 'c2', name: 'MIDDLE', range: 'Seats 21–28' },
  { key: 'c3', name: 'RIGHT', range: 'Seats 31–39' },
];

function buildRowSeatIds(range) {
  const ids = [];
  for (let n = range[0]; n <= range[1]; n++) ids.push(n);
  return ids;
}

const ALL_VALID_SEATS = new Set();
ROWS.forEach(row => {
  COLUMNS.forEach(col => {
    buildRowSeatIds(row[col.key]).forEach(num => ALL_VALID_SEATS.add(row.label + num));
  });
});

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

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('Checking for existing LC-101 hall...');
    let hall = await Hall.findOne({ name: 'LC-101' });

    if (!hall) {
      console.log('Creating default hall LC-101...');
      hall = new Hall({
        name: 'LC-101',
        description: 'Main lecture hall',
        rows: ROWS,
        columns: COLUMNS,
        isDefault: true
      });
      await hall.save();
      console.log('Hall created.');
    } else {
      console.log('Hall LC-101 already exists. Checking seats...');
    }

    console.log('Reading students.csv...');
    let text = '';
    try {
      text = fs.readFileSync('../students.csv', 'utf8');
    } catch (e) {
      console.log('No students.csv found, skipping seed.');
      process.exit(0);
    }

    const rows = parseCSV(text);
    if (rows.length === 0) {
      console.log('CSV empty.');
      process.exit(0);
    }

    const first = rows[0].map(c => c.toLowerCase());
    const nameIdx = first.indexOf('name');
    const seatIdx = first.indexOf('seat');
    const rollIdx = first.findIndex(c => ['roll', 'rollno', 'roll no', 'roll number', 'roll_no'].includes(c));
    const dncIdx = first.findIndex(c => ['donotcall', 'do not call', 'dnc'].includes(c));
    const notesIdx = first.indexOf('notes');

    if (nameIdx === -1 || seatIdx === -1) {
      console.error('CSV missing Name or Seat headers.');
      process.exit(1);
    }

    console.log('Seeding seats...');
    let inserted = 0;
    
    for (let i = 1; i < rows.length; i++) {
      const cells = rows[i];
      if (cells.length <= Math.max(nameIdx, seatIdx)) continue;
      
      const name = cells[nameIdx];
      const seatId = cells[seatIdx].toUpperCase().replace(/\s+/g, '');
      
      if (!name || !seatId || !ALL_VALID_SEATS.has(seatId)) continue;
      
      const rollNo = rollIdx !== -1 && cells[rollIdx] ? cells[rollIdx].trim() : '';
      const notes = notesIdx !== -1 && cells[notesIdx] ? cells[notesIdx].trim() : '';
      const dncRaw = dncIdx !== -1 && cells[dncIdx] ? cells[dncIdx].trim().toLowerCase() : '';
      const doNotCall = ['yes', 'true', '1', 'y'].includes(dncRaw);

      await Seat.findOneAndUpdate(
        { hallId: hall._id, seatId },
        { name, rollNo, notes, doNotCall },
        { upsert: true }
      );
      inserted++;
    }

    console.log(`Successfully seeded ${inserted} seats.`);
    console.log('Seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

seedDatabase();
