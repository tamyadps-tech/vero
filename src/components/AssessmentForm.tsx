"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { getAssessmentTemplate, getResponseOptions } from "@/lib/assessments";

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
  const [result, setResult] = useState<{ score: number; severity: string } | null>(null);

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

      setResult({ score: data.score, severity: data.severity });
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
    return (
      <div className="rounded-xl border border-primary/30 bg-primary-light p-4 text-center">
        <p className="font-medium text-primary-dark">
          Resultado: {result.score}/
          {template.responseType === "scale0to10" ? 10 : template.questions.length * 3} —{" "}
          {result.severity}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-2 text-xs text-primary-dark underline"
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
