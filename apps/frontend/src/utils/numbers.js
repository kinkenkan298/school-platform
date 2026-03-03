export function toNumber(v) {
  if (v === null || v === undefined || v === "") return 0;
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  const n = Number(String(v).replaceAll(",", ""));
  return Number.isFinite(n) ? n : 0;
}