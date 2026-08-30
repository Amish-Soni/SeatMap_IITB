import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { SeatmapProvider } from './contexts/SeatmapContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SeatmapProvider>
      <App />
    </SeatmapProvider>
  </React.StrictMode>,
)
