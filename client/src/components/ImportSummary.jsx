import React from 'react';

export default function ImportSummary({ summary, onClose }) {
  if (!summary) return null;

  return (
    <div className="import-summary" style={{ display: 'block' }}>
      <span className="close-x" onClick={onClose}>✕</span>
      <div><b>Import complete.</b> {summary.mainMsg}</div>
      {summary.invalidSeats && summary.invalidSeats.length > 0 && (
        <div className="warn-list">
          Seat number{summary.invalidSeats.length === 1 ? '' : 's'} not found in the layout: {summary.invalidSeats.join(', ')}
        </div>
      )}
      {summary.blankRows && summary.blankRows.length > 0 && (
        <div className="warn-list">
          Skipped incomplete row{summary.blankRows.length === 1 ? '' : 's'} (missing name or seat): line {summary.blankRows.join(', ')}
        </div>
      )}
    </div>
  );
}
