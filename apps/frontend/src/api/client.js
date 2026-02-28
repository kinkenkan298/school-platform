const DEFAULT_BASE = "http://localhost:3001/api/v1";
const LS_KEY = "school.apiBaseUrl";

export function getApiBaseUrl() {
  // 1) env
  const env = import.meta?.env?.VITE_API_BASE_URL;
  if (env) return env;

  // 2) localStorage
  try {
    const v = localStorage.getItem(LS_KEY);
    if (v) return v;
  } catch {
    // ignore
  }

  // 3) default
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

export async function apiFetch(path, { method = "GET", params, body, headers, signal } = {}) {
  const base = getApiBaseUrl();
  const url = `${base}${path}${toQuery(params)}`;

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(headers || {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    signal,
  });

  const contentType = res.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await res.json() : null;

  if (!res.ok || (payload && payload.success === false)) {
    const err = new Error(payload?.message || res.statusText || "Request gagal");
    err.status = res.status;
    err.payload = payload;
    throw err;
  }

  return payload; // { success, message, data }
}