import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // Proxied by Vite in dev
});

export const seatmapApi = {
  // Halls
  fetchHalls: () => api.get('/halls').then(res => res.data),
  fetchHall: (id) => api.get(`/halls/${id}`).then(res => res.data),
  createHall: (data) => api.post('/halls', data).then(res => res.data),
  deleteHall: (id) => api.delete(`/halls/${id}`).then(res => res.data),
  setDefaultHall: (id) => api.put(`/halls/${id}/default`).then(res => res.data),
  
  // Roster
  fetchRoster: (hallId) => api.get(`/halls/${hallId}/roster`).then(res => res.data),
  updateSeat: (hallId, seatId, data) => api.put(`/halls/${hallId}/roster/${seatId}`, data).then(res => res.data),
  deleteSeat: (hallId, seatId) => api.delete(`/halls/${hallId}/roster/${seatId}`).then(res => res.data),
  clearAllNames: (hallId) => api.delete(`/halls/${hallId}/roster`).then(res => res.data),
  addExtraSeat: (hallId, data) => api.post(`/halls/${hallId}/roster/extra`, data).then(res => res.data),
  
  // Attendance
  fetchAttendance: (hallId, date) => api.get(`/halls/${hallId}/attendance${date ? `?date=${date}` : ''}`).then(res => res.data),
  toggleAttendance: (hallId, seatId, date, status) => api.put(`/halls/${hallId}/attendance/${seatId}`, { date, status }).then(res => res.data),
  clearAttendance: (hallId, date) => api.delete(`/halls/${hallId}/attendance${date ? `?date=${date}` : ''}`).then(res => res.data),
  
  // Import/Export
  importCSV: (hallId, formData) => api.post(`/halls/${hallId}/import/csv`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(res => res.data),
  exportJSONUrl: (hallId, date) => `/api/halls/${hallId}/import/json${date ? `?date=${date}` : ''}`, // Used for direct download link
};
