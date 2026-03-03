import { apiFetch } from "./client.js";

export const PeriodeAPI = {
  list: () => apiFetch("/periode"),
  detail: (id) => apiFetch(`/periode/${id}`),
  create: (data) => apiFetch("/periode", { method: "POST", body: data }),
  tutup: (id) => apiFetch(`/periode/${id}/tutup`, { method: "PATCH" }),
};