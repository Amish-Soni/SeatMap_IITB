# SeatMap IITB (MERN Stack)

A lecture hall seat mapping and attendance tracking application, migrated from a static HTML file to the MERN stack (MongoDB Atlas, Express, React, Node.js).

## Features
- **Multiple Layouts**: Create, switch, and manage multiple hall layouts
- **Roster Management**: Manage student names, roll numbers, notes, and DNC (Do Not Call) status
- **Attendance**: Track and export daily attendance
- **Import/Export**: Import from CSV and export to JSON
- **Random Picker**: Randomly call on eligible students

## Prerequisites
- Node.js (v18+)
- MongoDB Atlas free cluster (or local MongoDB)

## Setup

1. **Install Dependencies**
   ```bash
   npm run install-all
   ```

2. **Environment Variables**
   Open the `.env` file in the root directory and replace the `MONGO_URI` placeholder with your actual MongoDB Atlas connection string.
   ```
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0...
   PORT=5000
   ```

3. **Seed Database** (First time only)
   This will create a default "LC-101" hall and import students from `students.csv`.
   ```bash
   npm run seed
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```
   The backend runs on `http://localhost:5000` and the React frontend on `http://localhost:5173`.