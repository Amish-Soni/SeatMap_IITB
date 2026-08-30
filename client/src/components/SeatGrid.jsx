import React from 'react';
import { useSeatmap } from '../contexts/SeatmapContext';
import { seatmapApi } from '../api/seatmapApi';
import Seat from './Seat';
import { buildRowSeatIds } from '../utils/seatLayout';

export default function SeatGrid({ onSeatClick }) {
  const { 
    activeHallId, hallConfig, activeCol, extraSeats, 
    mirrored, editUnlocked, mode, refreshRoster 
  } = useSeatmap();

  if (!hallConfig || !hallConfig.rows || !hallConfig.columns) return null;

  const colKey = hallConfig.columns[activeCol].key;
  const orderedRows = mirrored ? [...hallConfig.rows].reverse() : hallConfig.rows;

  const handleAddExtraSeat = async (rowLabel, colKey) => {
    if (!activeHallId) return;
    const extraIds = Object.keys(extraSeats)
      .filter(id => extraSeats[id].row === rowLabel && extraSeats[id].colKey === colKey);
    const order = extraIds.length + 1;
    const extraId = `${rowLabel}_${colKey}_ex_${Date.now()}`;
    
    try {
      await seatmapApi.addExtraSeat(activeHallId, { extraId, row: rowLabel, colKey, order });
      await refreshRoster();
      // Optional: automatically open modal for the new seat?
      // onSeatClick(extraId);
    } catch (err) {
      alert('Failed to add extra seat: ' + err.message);
    }
  };

  return (
    <div className={`hall ${mirrored ? 'mirrored' : ''}`} id="hall">
      <div id="podiumBlock">
        <div className="podium">PODIUM — FACING CLASS</div>
        <div className="podium-note">Row A is closest to podium · Row I is farthest</div>
      </div>
      
      <div id="grid" className="grid-container">
        {orderedRows.map(row => {
          const seatIds = buildRowSeatIds(row[colKey]);
          const rowExtraSeats = Object.keys(extraSeats)
            .filter(id => extraSeats[id].row === row.label && extraSeats[id].colKey === colKey)
            .sort((a, b) => extraSeats[a].order - extraSeats[b].order);

          return (
            <div className="row" key={row.label}>
              <div className="row-label">{row.label}</div>
              
              <div className="seat-group">
                {seatIds.map((num, idx) => (
                  <Seat 
                    key={row.label + num}
                    id={row.label + num}
                    isExtra={false}
                    rowLabel={row.label}
                    num={num}
                    seatIndex={idx}
                    rowWidth={seatIds.length}
                    onSeatClick={onSeatClick}
                  />
                ))}
                
                {rowExtraSeats.map(exId => (
                  <Seat 
                    key={exId}
                    id={exId}
                    isExtra={true}
                    rowLabel={row.label}
                    order={extraSeats[exId].order}
                    onSeatClick={onSeatClick}
                  />
                ))}
                
                {(editUnlocked && mode === 'roster') && (
                  <div 
                    className="add-seat-btn" 
                    title="Add an extra seat to this row"
                    onClick={() => handleAddExtraSeat(row.label, colKey)}
                  >
                    +
                  </div>
                )}
              </div>
              
              <div className="row-label row-label-right">{row.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
