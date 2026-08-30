import React, { useState, useRef } from 'react';
import './App.css';
import { useSeatmap } from './contexts/SeatmapContext';
import { seatmapApi } from './api/seatmapApi';
import { parseCSV } from './utils/csvParser';

import Header from './components/Header';
import HallSelector from './components/HallSelector';
import Controls from './components/Controls';
import Tabs from './components/Tabs';
import SearchBanner from './components/SearchBanner';
import ImportSummary from './components/ImportSummary';
import SeatGrid from './components/SeatGrid';
import Legend from './components/Legend';
import Footer from './components/Footer';
import SeatModal from './components/SeatModal';
import RandomPickModal from './components/RandomPickModal';

function SeatmapApp() {
  const { 
    activeHallId, hallConfig, loading, error, 
    mode, attendance, refreshAttendance, refreshRoster
  } = useSeatmap();
  
  const [selectedSeatId, setSelectedSeatId] = useState(null);
  const [showRandomPick, setShowRandomPick] = useState(false);
  const [importSummary, setImportSummary] = useState(null);
  
  const fileInputRef = useRef(null);

  const handleSeatClick = async (id) => {
    if (mode === 'attendance') {
      const cur = attendance[id];
      const next = cur === 'present' ? 'absent' : cur === 'absent' ? null : 'present';
      
      const date = new Date().toISOString().slice(0, 10);
      try {
        await seatmapApi.toggleAttendance(activeHallId, id, date, next);
        await refreshAttendance();
      } catch (err) {
        alert('Failed to update attendance: ' + err.message);
      }
      return;
    }
    
    setSelectedSeatId(id);
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !activeHallId) return;
    
    const formData = new FormData();
    formData.append('csvFile', file);
    
    try {
      const result = await seatmapApi.importCSV(activeHallId, formData);
      setImportSummary({
        mainMsg: `Imported ${result.imported} new name(s)${result.updated ? `, updated ${result.updated} existing seat(s)` : ''}.`,
        invalidSeats: result.invalidSeats,
        blankRows: result.blankRows
      });
      await refreshRoster();
    } catch (err) {
      alert('Import failed: ' + err.message);
    }
    
    e.target.value = '';
  };

  if (loading && !hallConfig) return <div style={{ color: 'var(--chalk)', textAlign: 'center', marginTop: '50px' }}>Loading...</div>;
  if (error) return <div style={{ color: 'var(--absent)', textAlign: 'center', marginTop: '50px' }}>{error}</div>;

  return (
    <div className="wrap">
      <Header />
      <HallSelector />
      
      {hallConfig && (
        <>
          <Controls 
            onOpenRandomPick={() => setShowRandomPick(true)} 
            onOpenImport={handleImportClick} 
          />
          <input 
            type="file" 
            ref={fileInputRef} 
            accept=".csv,text/csv" 
            style={{ display: 'none' }} 
            onChange={handleFileChange} 
          />
          
          <Tabs />
          <SearchBanner />
          <ImportSummary summary={importSummary} onClose={() => setImportSummary(null)} />
          
          <h2 id="printHeading" className="print-only">
            {hallConfig.name} — Seat Mapping
          </h2>
          
          <SeatGrid onSeatClick={handleSeatClick} />
          
          <Legend />
          <Footer />
        </>
      )}

      {selectedSeatId && (
        <SeatModal seatId={selectedSeatId} onClose={() => setSelectedSeatId(null)} />
      )}
      
      {showRandomPick && (
        <RandomPickModal onClose={() => setShowRandomPick(false)} />
      )}
    </div>
  );
}

export default SeatmapApp;
