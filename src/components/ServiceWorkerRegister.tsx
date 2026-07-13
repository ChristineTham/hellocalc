// src/components/ServiceWorkerRegister.tsx
// Registers the offline service worker (NFR-2). Production only — a SW in dev
// would cache stale HMR assets. Base-path aware so it works under /hellocalc
// on GitHub Pages. Renders nothing.
"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    const base = process.env.NODE_ENV === "production" ? "/hellocalc" : "";
    navigator.serviceWorker.register(`${base}/sw.js`).catch(() => {
      /* registration is best-effort — the app works fine without it */
    });
  }, []);
  return null;
}
