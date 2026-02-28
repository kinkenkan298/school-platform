import { apiFetch } from "./client.js";

export const LaporanAPI = {
  bukuBesar: (params) => apiFetch("/laporan/buku-besar", { params }),
  labaRugi: (params) => apiFetch("/laporan/laba-rugi", { params }),
  neraca: (params) => apiFetch("/laporan/neraca", { params }),
  arusKas: (params) => apiFetch("/laporan/arus-kas", { params }),
};