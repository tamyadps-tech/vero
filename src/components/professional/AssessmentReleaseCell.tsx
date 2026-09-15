"use client";

import { useState } from "react";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });

export function AssessmentReleaseCell({
  clientId,
  templateSlug,
  initialReleased,
  latest,
}: {
  clientId: string;
  templateSlug: string;
  initialReleased: boolean;
  latest?: { score: number; severity: string; createdAt: string };
}) {
  const [released, setReleased] = useState(initialReleased);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function toggle() {
    const next = !released;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/professional/clients/${clientId}/assessments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateSlug, released: next }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Não foi possível atualizar agora.");
      }
      setReleased(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível atualizar agora.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={toggle}
        disabled={loading}
        aria-pressed={released}
        className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium transition disabled:opacity-60 ${
          released ? "bg-primary-light text-primary-dark" : "bg-paper-alt text-ink-soft hover:text-ink"
        }`}
      >
        {released ? "✓ Liberado" : "Liberar"}
      </button>
      {latest && (
        <span
          className="text-xs text-ink-soft"
          title={dateFormatter.format(new Date(latest.createdAt))}
        >
          {latest.score} ({latest.severity})
        </span>
      )}
      {error && (
        <span role="alert" className="text-xs text-accent-dark">
          {error}
        </span>
      )}
    </div>
  );
}
