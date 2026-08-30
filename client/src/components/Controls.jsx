import React, { useRef } from 'react';
import { useSeatmap } from '../contexts/SeatmapContext';
import { seatmapApi } from '../api/seatmapApi';
import { allSeatIdsInColumn } from '../utils/seatLayout';

export default function Controls({ onOpenRandomPick, onOpenImport }) {
  const {
    activeHallId, hallConfig, roster, extraSeats, attendance,
    mode, setMode, editUnlocked, setEditUnlocked,
    searchQuery, setSearchQuery, mirrored, setMirrored, activeCol,
    refreshRoster, refreshAttendance
  } = useSeatmap();

  const handleClearAttendance = async () => {
    if (!activeHallId) return;
    if (!window.confirm("Reset today's attendance marks?")) return;
    try {
      await seatmapApi.clearAttendance(activeHallId);
      await refreshAttendance();
    } catch (err) {
      alert('Error clearing attendance: ' + err.message);
    }
  };

  const handleClearRoster = async () => {
    if (!activeHallId || !editUnlocked) return;
    if (!window.confirm('This will remove every student name and extra data from every seat in this hall. Continue?')) return;
    try {
      await seatmapApi.clearAllNames(activeHallId);
      await refreshRoster();
    } catch (err) {
      alert('Error clearing roster: ' + err.message);
    }
  };
  
  const handleExport = () => {
    if (!activeHallId) return;
    const date = new Date().toISOString().slice(0, 10);
    const url = seatmapApi.exportJSONUrl(activeHallId, date);
    window.location.href = url; // trigger download
  };

  const handlePrint = () => {
    window.print();
  };
  
  // Calculate stats
  const allSeatIds = allSeatIdsInColumn(hallConfig?.rows, hallConfig?.columns, activeCol, extraSeats);
  const statTotal = allSeatIds.length;
  const statFilled = allSeatIds.filter(id => {
    const entry = roster[id];
    return !!(entry && (entry.name || entry.rollNo || entry.notes || entry.doNotCall));
  }).length;
  
  const statPresent = Object.values(attendance).filter(s => s === 'present').length;
  const statAbsent = Object.values(attendance).filter(s => s === 'absent').length;

  return (
    <>
      <div className="controls">
        <input 
          type="text" 
          placeholder="Search name or roll no…" 
          autoComplete="off"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <button className={`btn ${mode === 'roster' ? 'active' : ''}`} onClick={() => setMode('roster')}>📋 Roster Mode</button>
        <button className={`btn ${mode === 'attendance' ? 'active' : ''}`} onClick={() => setMode('attendance')}>✅ Attendance Mode</button>
        <button className={`btn lock ${editUnlocked ? 'unlocked' : ''}`} onClick={() => setEditUnlocked(!editUnlocked)}>
          {editUnlocked ? '🔓 Editing Unlocked' : '🔒 Editing Locked'}
        </button>
        <button className="btn active" onClick={onOpenRandomPick}>🎲 Surprise</button>
      </div>
      <div className="controls">
        <button className="btn" onClick={onOpenImport} disabled={!editUnlocked}>⬆️ Import CSV</button>
        <button className="btn" onClick={handleExport}>⬇️ Export JSON</button>
        <button className={`btn ${mirrored ? 'active' : ''}`} onClick={() => setMirrored(!mirrored)}>🔄 Mirror Layout</button>
        <button className="btn" onClick={handlePrint}>🖨️ Print</button>
        <button className="btn" onClick={handleClearAttendance}>Reset Today's Attendance</button>
        <button className="btn danger" onClick={handleClearRoster} disabled={!editUnlocked}>Clear All Names</button>
      </div>
      <div className="controls" style={{ marginBottom: 0 }}>
        <div className="stats">
          <span>Seats filled this column: <b>{statFilled}</b>/<b>{statTotal}</b></span>
          {mode === 'attendance' && (
            <span id="attendanceStat">Present: <b>{statPresent}</b> · Absent: <b>{statAbsent}</b></span>
          )}
        </div>
      </div>
    </>
  );
}
