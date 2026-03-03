const DEFAULT_BASE = "/api/v1";
const LS_KEY = "school.apiBaseUrl";

export function getApiBaseUrl() {
  // 1) env
  const env = import.meta?.env?.VITE_API_BASE_URL;
  if (env) return env;

  // 2) localStorage override (dari halaman environments)
  try {
    const v = localStorage.getItem(LS_KEY);
    if (v) return v;
  } catch {
    // ignore
  }

  // 3) default (proxy)
  return DEFAULT_BASE;
}

export function setApiBaseUrl(url) {
  try {
    localStorage.setItem(LS_KEY, url);
  } catch {
    // ignore
  }
}

function toQuery(params) {
  const sp = new URLSearchParams();
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    sp.set(k, String(v));
  });
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

function humanFetchError(url, base) {
  return [
    "Gagal menghubungi API.",
    `URL: ${url}`,
    `Base URL: ${base}`,
    "",
    "Kalau kamu pakai root dev (turbo):",
    "1) Pastikan backend benar-benar jalan (tidak crash loop).",
    "2) Pastikan proxy Vite aktif (vite.config.js) dan backend listen di target proxy (default 3001).",
  ].join("\n");
}

export async function apiFetch(path, { method = "GET", params, body, headers, signal } = {}) {
  const base = getApiBaseUrl();
  const url = `${base}${path}${toQuery(params)}`;

  let res;
  try {
    res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(headers || {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (e) {
    const err = new Error(humanFetchError(url, base));
    err.cause = e;
    throw err;
  }

  const contentType = res.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await res.json() : null;

  if (!res.ok || (payload && payload.success === false)) {
    const err = new Error(payload?.message || res.statusText || "Request gagal");
    err.status = res.status;
    err.payload = payload;
    err.url = url;
    throw err;
  }

  return payload;
}