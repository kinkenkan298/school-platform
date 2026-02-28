import { apiFetch } from "./client.js";

export const AkunAPI = {
  list: (params) => apiFetch("/akun", { params }),
  detail: (id) => apiFetch(`/akun/${id}`),
  create: (data) => apiFetch("/akun", { method: "POST", body: data }),
  update: (id, data) => apiFetch(`/akun/${id}`, { method: "PUT", body: data }),
  remove: (id) => apiFetch(`/akun/${id}`, { method: "DELETE" }),
};