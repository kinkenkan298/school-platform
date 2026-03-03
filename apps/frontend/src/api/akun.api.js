import { apiFetch } from "./client.js";

export const TIPE_AKUN = ["ASET", "LIABILITAS", "EKUITAS", "PENDAPATAN", "BEBAN"];

function dedupeById(list) {
  const m = new Map();
  for (const item of list || []) {
    if (item && item.id) m.set(item.id, item);
  }
  return Array.from(m.values());
}

export const AkunAPI = {
  // Berdasarkan .bru kamu, query tipe dipakai (contoh: /akun?tipe=ASET)
  list: (params) => apiFetch("/akun", { params }),

  // Aman untuk kebutuhan dropdown (jurnal/laporan) jika backend mewajibkan tipe.
  listAll: async (params = {}) => {
    const results = await Promise.all(
      TIPE_AKUN.map((tipe) => apiFetch("/akun", { params: { ...params, tipe } }))
    );

    const combined = results.flatMap((r) => r.data || []);
    return {
      success: true,
      message: "Berhasil mengambil data akun",
      data: dedupeById(combined),
    };
  },

  detail: (id) => apiFetch(`/akun/${id}`),
  create: (data) => apiFetch("/akun", { method: "POST", body: data }),
  update: (id, data) => apiFetch(`/akun/${id}`, { method: "PUT", body: data }),
  remove: (id) => apiFetch(`/akun/${id}`, { method: "DELETE" }),
};