import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    proxy: {
      // 1. Vite akan mencegat semua request frontend yang menuju '/api/v1'
      "/api/v1": {
        target: "http://localhost:3001",
        changeOrigin: true,
        // 2. Trik Ajaib: Vite diam-diam mengubah '/api/v1' menjadi '/v1/api' 
        // sebelum mengirimkannya ke backend PostgreSQL kamu
        rewrite: (path) => path.replace(/^\/api\/v1/, '/v1/api')
      },
    },
  },
});