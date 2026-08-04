import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import type { UserConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/auth': {
        target: 'http://192.168.29.53:8000',
        changeOrigin: true,
      },
      '/user': {
        target: 'http://192.168.29.53:8000',
        changeOrigin: true,
      },
      '/catalog': {
        target: 'http://192.168.29.53:8000',
        changeOrigin: true,
      },
      '/bookings': {
        target: 'http://192.168.29.53:8000',
        changeOrigin: true,
      },
    },
  },
} satisfies UserConfig)

