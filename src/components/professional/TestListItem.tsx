"use client";

import { useState } from "react";
import {
  getResponseOptions,
  getDimensionBreakdown,
  scoreAssessment,
  CATEGORY_LABELS,
  type AssessmentTemplate,
} from "@/lib/assessments";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });

type Detail = { answers: number[]; score: number; severity: string; created_at: string } | null;

export function TestListItem({
  clientId,
  template,
  initialReleased,
  latest,
}: {
  clientId: string;
  template: AssessmentTemplate;
  initialReleased: boolean;
  latest?: { score: number; severity: string; createdAt: string };
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
      const response = await fetch(`/api/professional/clients/${clientId}/assessments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateSlug: template.slug, released: next }),
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
          `/api/professional/clients/${clientId}/assessments?templateSlug=${template.slug}`
        );
        const data = await response.json().catch(() => ({}));
        if (response.ok) setDetail(data.response ?? null);
      } finally {
        setLoadingDetail(false);
      }
    }
  }

  const status = latest
    ? `Respondido em ${dateFormatter.format(new Date(latest.createdAt))} — ${latest.score} (${latest.severity})`
    : released
      ? "Enviado — aguardando resposta do cliente"
      : "Não enviado";

  const options = getResponseOptions(template.responseType);

  return (
    <div className="rounded-xl border border-border p-3 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="font-medium text-ink">{template.name}</p>
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
                template.category === "coaching"
                  ? "bg-primary-light text-primary-dark"
                  : "bg-accent-light text-accent-dark"
              }`}
            >
              {CATEGORY_LABELS[template.category]}
            </span>
          </div>
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
        <div className="mt-3 space-y-2 border-t border-border pt-3">
          {loadingDetail ? (
            <p className="text-xs text-ink-soft">Carregando…</p>
          ) : detail ? (
            <>
              <div className="mb-3 rounded-lg bg-paper-alt p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  Orientação
                </p>
                <p className="mt-1 text-sm text-ink">
                  {scoreAssessment(template, detail.answers).guidance}
                </p>
              </div>
              {template.dimensions && (
                <div className="mb-3 space-y-1.5">
                  {getDimensionBreakdown(template, detail.answers).map((dimension) => (
                    <div key={dimension.key}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-ink">{dimension.label}</span>
                        <span className="text-ink-soft">
                          {dimension.total}/{dimension.maxTotal}
                        </span>
                      </div>
                      <div className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-paper-alt">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{
                            width: `${(dimension.total / dimension.maxTotal) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {template.questions.map((question, index) => (
                <div key={question.id} className="text-sm">
                  <p className="text-ink-soft">{question.text}</p>
                  <p className="font-medium text-ink">
                    {options.find((o) => o.value === detail.answers[index])?.label ?? "—"}
                  </p>
                </div>
              ))}
            </>
          ) : (
            <p className="text-xs text-ink-soft">Não foi possível carregar as respostas.</p>
          )}
        </div>
      )}
    </div>
  );
}
