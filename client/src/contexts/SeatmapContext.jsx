import React, { createContext, useContext, useState, useEffect } from 'react';
import { seatmapApi } from '../api/seatmapApi';

const SeatmapContext = createContext();

export function useSeatmap() {
  return useContext(SeatmapContext);
}

export function SeatmapProvider({ children }) {
  const [halls, setHalls] = useState([]);
  const [activeHallId, setActiveHallId] = useState(null);
  const [hallConfig, setHallConfig] = useState(null);
  const [roster, setRoster] = useState({});
  const [extraSeats, setExtraSeats] = useState({});
  const [attendance, setAttendance] = useState({});
  
  const [mode, setMode] = useState('roster'); // 'roster' | 'attendance'
  const [activeCol, setActiveCol] = useState(0);
  const [mirrored, setMirrored] = useState(true);
  const [editUnlocked, setEditUnlocked] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initial load
  useEffect(() => {
    loadHalls();
  }, []);

  const loadHalls = async () => {
    try {
      setLoading(true);
      const data = await seatmapApi.fetchHalls();
      setHalls(data);
      if (data.length > 0) {
        const defaultHall = data.find(h => h.isDefault) || data[0];
        await switchHall(defaultHall._id);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load halls');
      setLoading(false);
    }
  };

  const switchHall = async (hallId) => {
    try {
      setLoading(true);
      const hallData = await seatmapApi.fetchHall(hallId);
      setHallConfig({ rows: hallData.rows, columns: hallData.columns, name: hallData.name, _id: hallData._id, isDefault: hallData.isDefault, description: hallData.description });
      setActiveHallId(hallId);
      
      const rosterData = await seatmapApi.fetchRoster(hallId);
      setRoster(rosterData.roster);
      setExtraSeats(rosterData.extraSeats);
      
      const attendanceData = await seatmapApi.fetchAttendance(hallId);
      setAttendance(attendanceData);
      
      setActiveCol(0); // reset active col
      setSearchQuery(''); // reset search
      
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to switch hall');
      setLoading(false);
    }
  };

  const refreshRoster = async () => {
    if (!activeHallId) return;
    const rosterData = await seatmapApi.fetchRoster(activeHallId);
    setRoster(rosterData.roster);
    setExtraSeats(rosterData.extraSeats);
  };
  
  const refreshAttendance = async (date) => {
    if (!activeHallId) return;
    const data = await seatmapApi.fetchAttendance(activeHallId, date);
    setAttendance(data);
  };

  const value = {
    halls,
    activeHallId,
    hallConfig,
    roster,
    extraSeats,
    attendance,
    mode,
    activeCol,
    mirrored,
    editUnlocked,
    searchQuery,
    loading,
    error,
    
    setMode,
    setActiveCol,
    setMirrored,
    setEditUnlocked,
    setSearchQuery,
    
    loadHalls,
    switchHall,
    refreshRoster,
    refreshAttendance,
  };

  return (
    <SeatmapContext.Provider value={value}>
      {children}
    </SeatmapContext.Provider>
  );
}
