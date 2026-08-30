export const GRP_COLORS = {
  yellow: 'var(--grp-yellow)',
  red: 'var(--grp-red)',
  blue: 'var(--grp-blue)',
  green: 'var(--grp-green)',
  black: 'var(--grp-black)',
};

export function buildRowSeatIds(range) {
  const ids = [];
  for (let n = range[0]; n <= range[1]; n++) ids.push(n);
  return ids;
}

export function seatColorGroup(rowLabel, position) {
  const rowIdx = rowLabel.charCodeAt(0) - 65;
  const isOddRow = rowIdx % 2 === 0;
  if (isOddRow) return position % 2 === 1 ? 'yellow' : 'red';
  return position % 2 === 1 ? 'blue' : 'green';
}

export function getAllValidSeats(rows, columns) {
  const validSeats = new Set();
  if (!rows || !columns) return validSeats;
  rows.forEach(row => {
    columns.forEach(col => {
      buildRowSeatIds(row[col.key]).forEach(num => validSeats.add(row.label + num));
    });
  });
  return validSeats;
}

export function allSeatIdsInColumn(rows, columns, colIndex, extraSeats) {
  if (!rows || !columns || !columns[colIndex]) return [];
  const colKey = columns[colIndex].key;
  const ids = [];
  
  rows.forEach(row => {
    buildRowSeatIds(row[colKey]).forEach(num => ids.push(row.label + num));
    
    // Add extra seats for this row/col
    Object.keys(extraSeats)
      .filter(id => extraSeats[id].row === row.label && extraSeats[id].colKey === colKey)
      .sort((a, b) => extraSeats[a].order - extraSeats[b].order)
      .forEach(exId => ids.push(exId));
  });
  
  return ids;
}
