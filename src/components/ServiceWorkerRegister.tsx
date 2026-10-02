"use client";

import { useEffect } from "react";

/**
 * Registra o service worker só em produção — em dev ele atrapalharia o
 * hot reload do Next, e o SW não traz nenhum ganho local mesmo.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Instalável como app depende do manifest, não do SW — falha aqui
      // não precisa travar nada nem avisar o usuário.
    });
  }, []);

  return null;
}
