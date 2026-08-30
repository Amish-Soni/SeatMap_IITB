import React, { useState } from 'react';
import { useSeatmap } from '../contexts/SeatmapContext';
import { seatmapApi } from '../api/seatmapApi';

export default function HallSelector() {
  const { halls, activeHallId, switchHall, loadHalls } = useSeatmap();
  const [isCreating, setIsCreating] = useState(false);
  const [newHallName, setNewHallName] = useState('');

  const handleSelectChange = (e) => {
    const id = e.target.value;
    if (id) {
      switchHall(id);
    }
  };

  const handleCreate = async () => {
    if (!newHallName.trim()) return;
    try {
      await seatmapApi.createHall({
        name: newHallName,
        description: '',
        cloneFromId: activeHallId // Simple cloning for now
      });
      setNewHallName('');
      setIsCreating(false);
      await loadHalls();
    } catch (err) {
      alert('Failed to create hall: ' + err.message);
    }
  };

  const handleDelete = async () => {
    if (!activeHallId) return;
    const hall = halls.find(h => h._id === activeHallId);
    if (!window.confirm(`Are you sure you want to delete ${hall?.name}? All data will be lost.`)) return;
    try {
      await seatmapApi.deleteHall(activeHallId);
      await loadHalls();
    } catch (err) {
      alert('Failed to delete hall: ' + err.message);
    }
  };

  return (
    <div className="hall-selector">
      <span>Layout: </span>
      <select value={activeHallId || ''} onChange={handleSelectChange}>
        {halls.map(hall => (
          <option key={hall._id} value={hall._id}>{hall.name}</option>
        ))}
      </select>
      
      {!isCreating ? (
        <button className="btn" onClick={() => setIsCreating(true)} title="Create a new hall layout">➕ New</button>
      ) : (
        <div style={{ display: 'flex', gap: '4px' }}>
          <input 
            type="text" 
            placeholder="Hall name" 
            value={newHallName}
            onChange={(e) => setNewHallName(e.target.value)}
            style={{ 
              background: 'var(--bg-deep)', 
              color: 'var(--chalk)', 
              border: '1px solid var(--empty-border)', 
              padding: '4px 8px', 
              borderRadius: '4px' 
            }}
          />
          <button className="btn active" onClick={handleCreate}>Save</button>
          <button className="btn" onClick={() => setIsCreating(false)}>Cancel</button>
        </div>
      )}
      
      {halls.length > 1 && (
        <button className="btn danger" onClick={handleDelete} title="Delete current hall">🗑️ Delete</button>
      )}
    </div>
  );
}
