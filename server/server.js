require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const hallRoutes = require('./routes/halls');
const rosterRoutes = require('./routes/roster');
const attendanceRoutes = require('./routes/attendance');
const importRoutes = require('./routes/import');

app.use('/api/halls', hallRoutes);
app.use('/api/halls/:hallId/roster', rosterRoutes);
app.use('/api/halls/:hallId/attendance', attendanceRoutes);
app.use('/api/halls/:hallId/import', importRoutes);

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
