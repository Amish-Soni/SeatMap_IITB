import React from 'react';

export default function Legend() {
  return (
    <>
      <div className="legend">
        <span><i className="swatch" style={{ background: 'var(--empty)', border: '1px solid var(--empty-border)' }}></i>Empty seat</span>
        <span><i className="swatch" style={{ background: 'var(--wood)' }}></i>Named seat (tinted by its color group)</span>
        <span><i className="swatch" style={{ background: 'var(--present)' }}></i>Present (attendance mode)</span>
        <span><i className="swatch" style={{ background: 'var(--absent)' }}></i>Absent (attendance mode)</span>
      </div>
      <div className="legend" style={{ marginTop: '6px' }}>
        <span><i className="swatch" style={{ background: 'var(--grp-yellow)', borderRadius: '50%' }}></i>Rows A/C/E/G/I — odd seat</span>
        <span><i className="swatch" style={{ background: 'var(--grp-red)', borderRadius: '50%' }}></i>Rows A/C/E/G/I — even seat</span>
        <span><i className="swatch" style={{ background: 'var(--grp-blue)', borderRadius: '50%' }}></i>Rows B/D/F/H — odd seat</span>
        <span><i className="swatch" style={{ background: 'var(--grp-green)', borderRadius: '50%' }}></i>Rows B/D/F/H — even seat</span>
        <span><i className="swatch" style={{ background: 'var(--grp-black)', borderRadius: '50%' }}></i>Extra / overflow seat</span>
      </div>
    </>
  );
}
