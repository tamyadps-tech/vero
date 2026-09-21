"use client";

import { useState } from "react";
import type { SubscriptionPlanId } from "@/lib/subscription-plans";

export function SubscriptionCheckoutButton({
  plan,
  label,
  className,
}: {
  plan: SubscriptionPlanId;
  label: string;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/professional/subscription/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error ?? "Não foi possível iniciar o checkout agora.");
      }
      if (data.switched) {
        window.location.reload();
        return;
      }
      window.location.href = data.checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível iniciar o checkout agora.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button type="button" onClick={handleClick} disabled={loading} className={className}>
        {loading ? "Abrindo checkout…" : label}
      </button>
      {error && (
        <p role="alert" className="mt-1.5 text-xs text-accent-dark">
          {error}
        </p>
      )}
    </div>
  );
}
