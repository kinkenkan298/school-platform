import { apiFetch } from "./client.js";

export const JurnalAPI = {
  // GET /jurnal?status&periodeId&dari&sampai (semua opsional sesuai .bru)
  list: (params) => apiFetch("/jurnal", { params }),

  // GET /jurnal/:id
  detail: (id) => apiFetch(`/jurnal/${id}`),

  // POST /jurnal
  create: (data) => apiFetch("/jurnal", { method: "POST", body: data }),

  // PUT /jurnal/:id
  update: (id, data) => apiFetch(`/jurnal/${id}`, { method: "PUT", body: data }),

  // PATCH /jurnal/:id/posting
  posting: (id) => apiFetch(`/jurnal/${id}/posting`, { method: "PATCH" }),

  // PATCH /jurnal/:id/batal
  batal: (id, alasanBatal) =>
    apiFetch(`/jurnal/${id}/batal`, { method: "PATCH", body: { alasanBatal } }),

  // DELETE /jurnal/:id
  remove: (id) => apiFetch(`/jurnal/${id}`, { method: "DELETE" }),
};