import React, { useState } from 'react';
// Tambahkan import UI agar senada dengan halaman lain
import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import Input from "../../components/ui/Input.jsx";

// --- LOGIKA ASLI KAMU (TIDAK DIUBAH) ---
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

// --- KOMPONEN UI UNTUK HALAMAN ENVIRONMENTS (SUDAH DIPERBARUI) ---
const EnvironmentsPage = () => {
  const [inputUrl, setInputUrl] = useState(getApiBaseUrl());
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault(); // Mencegah reload bawaan form
    setApiBaseUrl(inputUrl);
    setIsSaved(true);
    
    // Tampilkan pesan sukses sebentar, lalu reload
    setTimeout(() => {
      window.location.reload(); 
    }, 1000);
  };

  return (
    <div className="space-y-6 p-4 md:p-6 bg-slate-50 min-h-screen">
      <Card className="bg-white border border-slate-200 shadow-sm rounded-xl p-6">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Pengaturan API (Environments)</h2>
        <p className="mt-1 text-sm text-slate-500">
          Gunakan halaman ini untuk mengubah alamat (URL) koneksi Frontend ke Backend secara dinamis.
        </p>
      </Card>

      <Card className="bg-white border border-slate-200 shadow-sm rounded-xl p-6 max-w-2xl">
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Base URL Saat Ini
            </label>
            <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 font-mono text-sm shadow-inner">
              {getApiBaseUrl()}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Ganti Base URL
            </label>
            <Input 
              type="text" 
              value={inputUrl} 
              onChange={(e) => setInputUrl(e.target.value)} 
              placeholder="Contoh: /v1/api atau http://localhost:3001/api/v1"
              className="w-full border-slate-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg shadow-sm font-mono text-sm"
            />
            <div className="mt-3 text-xs text-slate-500 space-y-1">
              <p><strong>Tips:</strong></p>
              <ul className="list-disc list-inside pl-4">
                <li>Gunakan <code className="bg-slate-100 px-1 rounded text-slate-700">/v1/api</code> jika menggunakan proxy Vite.</li>
                <li>Gunakan <code className="bg-slate-100 px-1 rounded text-slate-700">http://localhost:3001/v1/api</code> jika bypass proxy.</li>
              </ul>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center gap-4">
            <Button 
              type="submit" 
              variant="primary" 
              className="!bg-blue-600 hover:!bg-blue-700 !text-white !px-6 !py-2.5 !rounded-lg font-semibold shadow-md border-none transition-all"
            >
              Simpan Konfigurasi
            </Button>
            
            {isSaved && (
              <span className="text-sm font-medium text-emerald-600 animate-pulse flex items-center gap-1">
                <span>✓</span> Tersimpan! Memuat ulang...
              </span>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
};

// --- EXPORT DEFAULT AGAR APP.JSX TIDAK ERROR ---
export default EnvironmentsPage;