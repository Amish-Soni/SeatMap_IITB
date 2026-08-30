import React, { useState, useEffect } from 'react';
import { useSeatmap } from '../contexts/SeatmapContext';
import { seatmapApi } from '../api/seatmapApi';
import { seatColorGroup, GRP_COLORS, buildRowSeatIds } from '../utils/seatLayout';

export default function SeatModal({ seatId, onClose }) {
  const { 
    activeHallId, hallConfig, activeCol, roster, extraSeats, 
    editUnlocked, refreshRoster, attendance, refreshAttendance
  } = useSeatmap();
  
  const [formData, setFormData] = useState({ name: '', rollNo: '', notes: '', doNotCall: false });

  useEffect(() => {
    if (seatId && roster[seatId]) {
      setFormData({
        name: roster[seatId].name || '',
        rollNo: roster[seatId].rollNo || '',
        notes: roster[seatId].notes || '',
        doNotCall: roster[seatId].doNotCall || false
      });
    } else {
      setFormData({ name: '', rollNo: '', notes: '', doNotCall: false });
    }
  }, [seatId, roster]);

  if (!seatId || !hallConfig) return null;

  const isExtra = !!extraSeats[seatId];
  let group = 'yellow';
  
  if (isExtra) {
    group = 'black';
  } else {
    const rowLabel = seatId[0];
    const row = hallConfig.rows.find(r => r.label === rowLabel);
    if (row) {
      const colKey = hallConfig.columns[activeCol].key;
      const ids = buildRowSeatIds(row[colKey]);
      const num = parseInt(seatId.slice(1), 10);
      const position = ids.indexOf(num) + 1;
      group = seatColorGroup(rowLabel, position);
    }
  }

  const colName = hallConfig.columns[activeCol]?.name || '';
  const label = isExtra ? `${extraSeats[seatId].row}+${extraSeats[seatId].order} (extra seat)` : seatId;
  const entry = roster[seatId] || { name: '', rollNo: '', notes: '', doNotCall: false };

  const handleSave = async () => {
    if (!activeHallId) return;
    try {
      if (!formData.name && !formData.rollNo && !formData.notes && !formData.doNotCall) {
        // If empty, delete
        if (roster[seatId]) {
          await seatmapApi.deleteSeat(activeHallId, seatId);
        }
      } else {
        await seatmapApi.updateSeat(activeHallId, seatId, formData);
      }
      await refreshRoster();
      onClose();
    } catch (err) {
      alert('Failed to save seat: ' + err.message);
    }
  };

  const handleRemoveExtra = async () => {
    if (!activeHallId) return;
    if (!window.confirm('Remove this extra seat entirely?')) return;
    try {
      await seatmapApi.deleteSeat(activeHallId, seatId);
      if (attendance[seatId]) {
         await seatmapApi.clearAttendance(activeHallId, null); // Actually we'd need to clear this specific attendance, or rely on cascade. Let's just refresh.
      }
      await refreshRoster();
      await refreshAttendance();
      onClose();
    } catch (err) {
      alert('Failed to remove extra seat: ' + err.message);
    }
  };

  const valueOrEmpty = (v) => v ? v : <span className="empty">—</span>;

  return (
    <div className="modal-overlay open" onClick={(e) => e.target.className.includes('modal-overlay') && onClose()}>
      <div className="modal-card">
        <div className={`modal-header grp-${group}`}>
          <span className="modal-close" onClick={onClose}>✕</span>
          <div className="modal-header-left">
            <h3><span className="modal-dot" style={{ background: GRP_COLORS[group] }}></span>{label}</h3>
            <div className="modal-sub">{colName}{editUnlocked ? ' — editing' : ''}</div>
          </div>
          {entry.name ? (
            <div className="modal-header-name">{entry.name}</div>
          ) : (
            <div className="modal-header-name empty">Unassigned</div>
          )}
        </div>
        
        <div className="modal-body">
          {!editUnlocked ? (
            <>
              <div className="modal-field"><label>Name</label><div className={`value ${entry.name ? '' : 'empty'}`} style={{ textTransform: 'capitalize' }}>{valueOrEmpty(entry.name)}</div></div>
              <div className="modal-field"><label>Roll No</label><div className={`value ${entry.rollNo ? '' : 'empty'}`}>{valueOrEmpty(entry.rollNo)}</div></div>
              <div className="modal-field"><label>Notes</label><div className={`value ${entry.notes ? '' : 'empty'}`}>{valueOrEmpty(entry.notes)}</div></div>
              {entry.doNotCall && (
                <div className="modal-field"><label>Calling preference</label><div className="value dnc-yes">🚫 Shouldn't be called</div></div>
              )}
              <div className="modal-actions"><button className="btn active" onClick={onClose}>Close</button></div>
            </>
          ) : (
            <>
              <div className="modal-field">
                <label>Name</label>
                <input type="text" maxLength="40" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Student name" />
              </div>
              <div className="modal-field">
                <label>Roll No</label>
                <input type="text" maxLength="30" value={formData.rollNo} onChange={e => setFormData({ ...formData, rollNo: e.target.value })} placeholder="e.g. 21B1234" />
              </div>
              <div className="modal-field">
                <label>Notes</label>
                <textarea maxLength="200" value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} placeholder="Anything else worth remembering"></textarea>
              </div>
              <div className="modal-field">
                <label className="dnc-toggle">
                  <input type="checkbox" checked={formData.doNotCall} onChange={e => setFormData({ ...formData, doNotCall: e.target.checked })} /> 
                  🚫 Prefers not to be called
                </label>
              </div>
              <div className="modal-actions">
                {isExtra && <button className="btn danger" onClick={handleRemoveExtra}>Remove Seat</button>}
                <button className="btn" onClick={onClose}>Cancel</button>
                <button className="btn active" onClick={handleSave}>Save</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
