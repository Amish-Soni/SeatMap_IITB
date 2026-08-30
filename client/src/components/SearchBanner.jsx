import React from 'react';
import { useSeatmap } from '../contexts/SeatmapContext';
import { allSeatIdsInColumn } from '../utils/seatLayout';

export default function SearchBanner() {
  const { hallConfig, activeCol, setActiveCol, searchQuery, roster, extraSeats } = useSeatmap();

  if (!hallConfig || !hallConfig.columns) return null;
  const query = searchQuery.trim().toLowerCase();
  if (!query) return null;

  const matchCountForColumn = (colIndex) => {
    const ids = allSeatIdsInColumn(hallConfig.rows, hallConfig.columns, colIndex, extraSeats);
    return ids.filter(id => {
      const entry = roster[id];
      if (!entry) return false;
      return (entry.name && entry.name.toLowerCase().includes(query)) ||
             (entry.rollNo && entry.rollNo.toLowerCase().includes(query));
    }).length;
  };

  const otherMatches = hallConfig.columns
    .map((col, i) => ({ i, count: matchCountForColumn(i) }))
    .filter(c => c.i !== activeCol && c.count > 0);

  if (otherMatches.length === 0) return null;

  const names = otherMatches.map(c => `${hallConfig.columns[c.i].name} (${c.count})`).join(' · ');

  return (
    <div className="search-banner" style={{ display: 'block' }} onClick={() => setActiveCol(otherMatches[0].i)}>
      Also found in: {names} — click to jump
    </div>
  );
}
