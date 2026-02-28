import { apiFetch } from "./client.js";

export const JurnalAPI = {
  list: (params) => apiFetch("/jurnal", { params }),
  detail: (id) => apiFetch(`/jurnal/${id}`),
  create: (data) => apiFetch("/jurnal", { method: "POST", body: data }),
  update: (id, data) => apiFetch(`/jurnal/${id}`, { method: "PUT", body: data }),
  posting: (id) => apiFetch(`/jurnal/${id}/posting`, { method: "PATCH" }),
  batal: (id, alasanBatal) =>
    apiFetch(`/jurnal/${id}/batal`, { method: "PATCH", body: { alasanBatal } }),
  remove: (id) => apiFetch(`/jurnal/${id}`, { method: "DELETE" }),
};