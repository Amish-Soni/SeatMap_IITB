import React, { useState, useEffect } from 'react';
import { useSeatmap } from '../contexts/SeatmapContext';
import { seatColorGroup, GRP_COLORS, buildRowSeatIds } from '../utils/seatLayout';

export default function RandomPickModal({ onClose }) {
  const { hallConfig, roster, extraSeats } = useSeatmap();
  const [pick, setPick] = useState(null);

  useEffect(() => {
    pickRandom();
  }, []);

  const pickRandom = () => {
    if (!hallConfig) return;
    const eligible = [];
    
    hallConfig.columns.forEach((col, colIndex) => {
      hallConfig.rows.forEach(row => {
        buildRowSeatIds(row[col.key]).forEach(num => {
          const id = row.label + num;
          const entry = roster[id];
          if (entry && entry.name && !entry.doNotCall) eligible.push({ id, colIndex });
        });
        
        Object.keys(extraSeats)
          .filter(id => extraSeats[id].row === row.label && extraSeats[id].colKey === col.key)
          .forEach(exId => {
            const entry = roster[exId];
            if (entry && entry.name && !entry.doNotCall) eligible.push({ id: exId, colIndex });
          });
      });
    });

    if (eligible.length === 0) {
      setPick({ none: true });
      return;
    }

    const randomPick = eligible[Math.floor(Math.random() * eligible.length)];
    setPick(randomPick);
  };

  if (!pick) return null;

  if (pick.none) {
    return (
      <div className="modal-overlay open" onClick={(e) => e.target.className.includes('modal-overlay') && onClose()}>
        <div className="modal-card">
          <div className="modal-header grp-black">
            <span className="modal-close" onClick={onClose}>✕</span>
            <div className="modal-header-left"><h3>No eligible students</h3></div>
          </div>
          <div className="modal-body">
            <p style={{ color: 'var(--chalk-dim)', fontSize: '0.88rem' }}>
              There are no named seats available to pick from (or everyone eligible has "do not call" set).
            </p>
            <div className="modal-actions"><button className="btn active" onClick={onClose}>Close</button></div>
          </div>
        </div>
      </div>
    );
  }

  const id = pick.id;
  const isExtra = !!extraSeats[id];
  const entry = roster[id];
  const colName = hallConfig.columns[pick.colIndex].name;
  const seatLabel = isExtra ? `${extraSeats[id].row}+${extraSeats[id].order} (extra seat)` : id;
  
  let group = 'black';
  if (!isExtra) {
    const rowLabel = id[0];
    const row = hallConfig.rows.find(r => r.label === rowLabel);
    const seatIds = buildRowSeatIds(row[hallConfig.columns[pick.colIndex].key]);
    const num = parseInt(id.slice(1), 10);
    group = seatColorGroup(rowLabel, seatIds.indexOf(num) + 1);
  }

  const firstName = entry.name.trim().split(/\s+/)[0];

  return (
    <div className="modal-overlay open" onClick={(e) => e.target.className.includes('modal-overlay') && onClose()}>
      <div className="modal-card">
        <div className={`modal-header grp-${group}`}>
          <span className="modal-close" onClick={onClose}>✕</span>
          <div className="modal-header-left">
            <h3><span className="modal-dot" style={{ background: GRP_COLORS[group] }}></span>{firstName}</h3>
            <div className="modal-sub">{colName}</div>
          </div>
        </div>
        <div className="modal-body">
          <div className="modal-field"><label>Name</label><div className="value" style={{ textTransform: 'capitalize', fontSize: '1.15rem', fontWeight: 700 }}>{entry.name}</div></div>
          <div className="modal-field"><label>Roll No</label><div className={`value ${entry.rollNo ? '' : 'empty'}`}>{entry.rollNo ? entry.rollNo : '—'}</div></div>
          <div className="modal-field"><label>Seat</label><div className="value mono-code">{seatLabel}</div></div>
          <div className="modal-actions">
            <button className="btn" onClick={pickRandom}>🎲 Surprise Again</button>
            <button className="btn active" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}
