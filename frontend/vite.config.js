import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 👉 change this if your ngrok URL changes
const ngrokHost = 'relapsing-disprove-maroon.ngrok-free.dev'

export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173,

    // // ✅ IMPORTANT: allow ngrok host
      allowedHosts: [
       ngrokHost
     ],

    proxy: {
      // Laravel API
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },

      // Laravel Sanctum
      '/sanctum': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },

      // Laravel Reverb (WebSockets) - Commenté pour le local, décommentez pour ngrok
      /*
      '/app': {
        target: 'http://localhost:8080',
        ws: true,
      },
      */
    },
  },
})