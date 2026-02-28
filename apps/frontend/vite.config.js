import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // <-- TAMBAHKAN INI

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // <-- TAMBAHKAN INI JUGA
  ],
  server: {
    port: 3000, // Memastikan port sesuai dengan script dev kamu
  }
})