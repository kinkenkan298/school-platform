import { toNumber } from "./numbers.js";

export function formatIDR(value) {
  const n = toNumber(value);
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 2,
  }).format(n);
}

export function formatDate(value) {
  if (!value) return "-";
  // value bisa "2025-01-02" atau ISO
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(d);
}