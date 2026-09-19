"use client";

import { useState } from "react";

export function SubscriptionPortalButton({ className }: { className?: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/professional/subscription/portal", { method: "POST" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error ?? "Não foi possível abrir o portal agora.");
      }
      window.location.href = data.portalUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível abrir o portal agora.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button type="button" onClick={handleClick} disabled={loading} className={className}>
        {loading ? "Abrindo…" : "Gerenciar assinatura"}
      </button>
      {error && (
        <p role="alert" className="mt-1.5 text-xs text-accent-dark">
          {error}
        </p>
      )}
    </div>
  );
}
