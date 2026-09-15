"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  getAssessmentTemplate,
  getResponseOptions,
  getDimensionBreakdown,
} from "@/lib/assessments";

export function AssessmentForm({
  templateSlug,
  onClose,
}: {
  templateSlug: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const template = getAssessmentTemplate(templateSlug);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<{
    score: number;
    maxScore: number;
    severity: string;
    orderedAnswers: number[];
  } | null>(null);

  if (!template) return null;
  const options = getResponseOptions(template.responseType);
  const answeredCount = template.questions.filter((q) => answers[q.id] !== undefined).length;
  const allAnswered = answeredCount === template.questions.length;
  const progressPct = Math.round((answeredCount / template.questions.length) * 100);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!template || !allAnswered) return;
    setStatus("loading");
    setMessage("");

    try {
      const orderedAnswers = template.questions.map((q) => answers[q.id]);
      const response = await fetch("/api/assessments/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateSlug, answers: orderedAnswers }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Não foi possível enviar agora.");
      }

      setResult({
        score: data.score,
        maxScore: data.maxScore,
        severity: data.severity,
        orderedAnswers,
      });
      setStatus("success");
      router.refresh();
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Não foi possível enviar agora."
      );
    }
  }

  if (status === "success" && result) {
    const breakdown = template.dimensions
      ? getDimensionBreakdown(template, result.orderedAnswers)
      : [];
    const scorePct = Math.round((result.score / result.maxScore) * 100);

    return (
      <div className="rounded-xl border border-primary/30 bg-primary-light p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">
          Seu resultado — {template.name}
        </p>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-semibold text-primary-dark">{result.score}</span>
          <span className="text-sm text-primary-dark/70">/ {result.maxScore}</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-paper/60">
          <div
            className="h-full rounded-full bg-primary-dark transition-[width]"
            style={{ width: `${scorePct}%` }}
          />
        </div>
        <p className="mt-2 inline-block rounded-full bg-paper px-3 py-1 text-sm font-medium text-primary-dark">
          {result.severity}
        </p>

        {breakdown.length > 0 && (
          <div className="mt-4 space-y-2 border-t border-primary/20 pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">
              Detalhamento por dimensão
            </p>
            {breakdown.map((dimension) => (
              <div key={dimension.key}>
                <div className="flex items-center justify-between text-xs text-primary-dark">
                  <span>{dimension.label}</span>
                  <span>
                    {dimension.total}/{dimension.maxTotal}
                  </span>
                </div>
                <div className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-paper/60">
                  <div
                    className="h-full rounded-full bg-primary-dark"
                    style={{ width: `${(dimension.total / dimension.maxTotal) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="mt-4 border-t border-primary/20 pt-3 text-xs text-primary-dark/80">
          Seu profissional já tem acesso a esse resultado e vai conversar
          sobre ele com você na próxima sessão.
        </p>

        <button
          type="button"
          onClick={onClose}
          className="mt-3 text-xs font-medium text-primary-dark underline"
        >
          Fechar
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-paper p-4">
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-ink-soft">
          <span>
            {answeredCount} de {template.questions.length} respondidas
          </span>
          <span>{progressPct}%</span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-paper-alt">
          <div
            className="h-full rounded-full bg-primary transition-[width]"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div className="divide-y divide-border">
        {template.questions.map((question) => (
          <div key={question.id} className="py-3 first:pt-0 last:pb-0">
            <p className="mb-2 text-sm text-ink">{question.text}</p>
            <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={question.text}>
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={answers[question.id] === option.value}
                  onClick={() =>
                    setAnswers((prev) => ({ ...prev, [question.id]: option.value }))
                  }
                  className={`rounded-lg border px-2.5 py-1 text-xs transition ${
                    answers[question.id] === option.value
                      ? "border-primary bg-primary-light text-primary-dark"
                      : "border-border text-ink-soft hover:border-primary/40"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="submit"
          disabled={!allAnswered || status === "loading"}
          className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-paper transition hover:bg-primary-dark disabled:opacity-60"
        >
          {status === "loading" ? "Enviando…" : "Ver resultado"}
        </button>
        <button type="button" onClick={onClose} className="text-xs text-ink-soft">
          Cancelar
        </button>
      </div>
      {status === "error" && (
        <p role="alert" className="mt-2 text-xs text-accent-dark">
          {message}
        </p>
      )}
    </form>
  );
}
