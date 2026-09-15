"use client";

import { useState } from "react";
import type { Exercise } from "@/lib/exercises";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });

type Detail = { answers: string[]; created_at: string } | null;

export function ExerciseListItem({
  clientId,
  exercise,
  initialReleased,
  latest,
}: {
  clientId: string;
  exercise: Exercise;
  initialReleased: boolean;
  latest?: { createdAt: string };
}) {
  const [released, setReleased] = useState(initialReleased);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [detail, setDetail] = useState<Detail>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  async function toggle() {
    const next = !released;
    setSending(true);
    setError("");
    try {
      const response = await fetch(`/api/professional/clients/${clientId}/exercises`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateSlug: exercise.slug, released: next }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Não foi possível atualizar agora.");
      }
      setReleased(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível atualizar agora.");
    } finally {
      setSending(false);
    }
  }

  async function toggleExpand() {
    if (!latest) return;
    const next = !expanded;
    setExpanded(next);
    if (next && !detail) {
      setLoadingDetail(true);
      try {
        const response = await fetch(
          `/api/professional/clients/${clientId}/exercises?templateSlug=${exercise.slug}`
        );
        const data = await response.json().catch(() => ({}));
        if (response.ok) setDetail(data.response ?? null);
      } finally {
        setLoadingDetail(false);
      }
    }
  }

  const status = latest
    ? `Respondido em ${dateFormatter.format(new Date(latest.createdAt))}`
    : released
      ? "Enviado — aguardando resposta do cliente"
      : "Não enviado";

  return (
    <div className="rounded-xl border border-border p-3 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-medium text-ink">{exercise.name}</p>
          <p className="text-xs text-ink-soft">{status}</p>
        </div>
        <div className="flex items-center gap-2">
          {latest && (
            <button
              type="button"
              onClick={toggleExpand}
              className="text-xs font-medium text-primary hover:underline"
            >
              {expanded ? "Ocultar respostas" : "Ver respostas"}
            </button>
          )}
          <button
            type="button"
            onClick={toggle}
            disabled={sending}
            aria-pressed={released}
            className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition disabled:opacity-60 ${
              released ? "bg-primary-light text-primary-dark" : "bg-paper-alt text-ink-soft hover:text-ink"
            }`}
          >
            {released ? "✓ Enviado" : "Enviar"}
          </button>
        </div>
      </div>
      {error && (
        <p role="alert" className="mt-1.5 text-xs text-accent-dark">
          {error}
        </p>
      )}
      {expanded && (
        <div className="mt-3 space-y-3 border-t border-border pt-3">
          {loadingDetail ? (
            <p className="text-xs text-ink-soft">Carregando…</p>
          ) : detail ? (
            exercise.prompts.map((prompt, index) => (
              <div key={prompt.id} className="text-sm">
                <p className="text-ink-soft">{prompt.label}</p>
                <p className="whitespace-pre-line font-medium text-ink">
                  {detail.answers[index] || "—"}
                </p>
              </div>
            ))
          ) : (
            <p className="text-xs text-ink-soft">Não foi possível carregar as respostas.</p>
          )}
        </div>
      )}
    </div>
  );
}
