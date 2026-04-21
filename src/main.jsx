import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Hapus import BrowserRouter di sini
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Jangan pakai BrowserRouter di sini kalau di App.jsx sudah ada */}
    <App />
  </StrictMode>
)