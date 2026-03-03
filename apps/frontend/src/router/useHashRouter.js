import { useEffect, useMemo, useState } from "react";

function normalizePath(p) {
  if (!p) return "/";
  if (!p.startsWith("/")) return `/${p}`;
  return p;
}

function getHashPath() {
  // contoh: #/akun -> "/akun"
  const h = window.location.hash || "";
  const raw = h.startsWith("#") ? h.slice(1) : h;
  return normalizePath(raw || "/");
}

export function useHashRouter() {
  const [path, setPath] = useState(() => {
    if (typeof window === "undefined") return "/";
    return getHashPath();
  });

  useEffect(() => {
    const onChange = () => setPath(getHashPath());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  const navigate = useMemo(() => {
    return (to) => {
      const next = normalizePath(to);
      window.location.hash = next; // otomatis memicu hashchange
    };
  }, []);

  return { path, navigate };
}