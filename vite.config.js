import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'lanie-blocky-crew.ngrok-free.dev' // Masukkan alamat ngrok kamu di sini
    ]
  }
})
