import React from 'react';
import { useSeatmap } from '../contexts/SeatmapContext';
import { allSeatIdsInColumn } from '../utils/seatLayout';

export default function Tabs() {
  const { hallConfig, activeCol, setActiveCol, searchQuery, roster, extraSeats } = useSeatmap();

  if (!hallConfig || !hallConfig.columns) return null;
  const query = searchQuery.trim().toLowerCase();

  const matchCountForColumn = (colIndex) => {
    if (!query) return 0;
    const ids = allSeatIdsInColumn(hallConfig.rows, hallConfig.columns, colIndex, extraSeats);
    return ids.filter(id => {
      const entry = roster[id];
      if (!entry) return false;
      return (entry.name && entry.name.toLowerCase().includes(query)) ||
             (entry.rollNo && entry.rollNo.toLowerCase().includes(query));
    }).length;
  };

  return (
    <div className="tabs">
      {hallConfig.columns.map((col, i) => {
        const count = matchCountForColumn(i);
        const isActive = i === activeCol;
        const hasMatch = count > 0;
        
        let className = 'tab';
        if (isActive) className += ' active';
        if (hasMatch && !isActive) className += ' has-match';

        return (
          <div 
            key={col.key}
            className={className}
            role="button"
            tabIndex={0}
            onClick={() => setActiveCol(i)}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setActiveCol(i); }}
          >
            {col.name}
            <span className="range">{col.range}</span>
            {(hasMatch && !isActive) && <span className="badge">{count}</span>}
          </div>
        );
      })}
    </div>
  );
}
