import { apiFetch } from "./client.js";

export const LaporanAPI = {
  // GET /laporan/buku-besar?akunId&dari&sampai
  bukuBesar: (params) => apiFetch("/laporan/buku-besar", { params }),

  // GET /laporan/laba-rugi?dari&sampai
  labaRugi: (params) => apiFetch("/laporan/laba-rugi", { params }),

  // GET /laporan/neraca?sampai
  neraca: (params) => apiFetch("/laporan/neraca", { params }),

  // GET /laporan/arus-kas?dari&sampai
  arusKas: (params) => apiFetch("/laporan/arus-kas", { params }),
};