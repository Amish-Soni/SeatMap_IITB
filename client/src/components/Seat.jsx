import React from 'react';
import { useSeatmap } from '../contexts/SeatmapContext';
import { seatColorGroup, GRP_COLORS } from '../utils/seatLayout';

export default function Seat({ id, isExtra, rowLabel, num, seatIndex, rowWidth, order, onSeatClick }) {
  const { roster, attendance, mode, searchQuery } = useSeatmap();
  
  const entry = roster[id];
  const filled = !!(entry && (entry.name || entry.rollNo || entry.notes || entry.doNotCall));
  const isDnc = !!(entry && entry.doNotCall);
  const status = attendance[id];
  
  const group = isExtra ? 'black' : seatColorGroup(rowLabel, seatIndex + 1);
  const label = isExtra ? `${rowLabel}+${order}` : id;
  const name = entry?.name || '';
  const firstName = name ? name.trim().split(/\s+/)[0] : '';
  
  let className = `seat grp-${group}`;
  if (isExtra) className += ' extra';
  if (filled) className += ' filled';
  if (mode === 'attendance' && status) className += ` ${status}`;
  if (isDnc) className += ' dnc';
  
  // Search spotlight logic
  if (searchQuery.trim()) {
    const query = searchQuery.trim().toLowerCase();
    const match = (entry?.name && entry.name.toLowerCase().includes(query)) || 
                  (entry?.rollNo && entry.rollNo.toLowerCase().includes(query));
    if (match) className += ' spotlight';
    else className += ' dim';
  }

  // Row curve logic (for non-extra seats)
  let transform = 'none';
  if (!isExtra && rowWidth > 0) {
    const center = (rowWidth - 1) / 2;
    const t = center > 0 ? (seatIndex - center) / center : 0;
    transform = `translateY(${-6 * (1 - t * t)}px)`;
  }

  return (
    <div 
      className={className} 
      data-id={id} 
      style={{ transform }}
      onClick={() => onSeatClick(id)}
    >
      {!filled && <span className="grp-dot" style={{ background: GRP_COLORS[group] }}></span>}
      <span className="seat-name">{firstName ? firstName : '—'}</span>
      <span className="seat-num mono-code">{label}</span>
      {isDnc && <span className="dnc-cross">✕</span>}
    </div>
  );
}
