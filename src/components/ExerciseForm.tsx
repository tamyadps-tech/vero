"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { getExercise } from "@/lib/exercises";

export function ExerciseForm({
  templateSlug,
  onClose,
}: {
  templateSlug: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const exercise = getExercise(templateSlug);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  if (!exercise) return null;
  const hasAnyAnswer = exercise.prompts.some((p) => (answers[p.id] ?? "").trim().length > 0);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!exercise || !hasAnyAnswer) return;
    setStatus("loading");
    setMessage("");

    try {
      const orderedAnswers = exercise.prompts.map((p) => answers[p.id] ?? "");
      const response = await fetch("/api/exercises/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateSlug, answers: orderedAnswers }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Não foi possível enviar agora.");
      }

      setStatus("success");
      router.refresh();
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Não foi possível enviar agora."
      );
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-xl border border-primary/30 bg-primary-light p-5 text-center">
        <p className="font-medium text-primary-dark">Respostas enviadas.</p>
        <p className="mt-1 text-xs text-primary-dark/80">
          Seu profissional já tem acesso ao que você escreveu.
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
      <p className="text-sm leading-relaxed text-ink-soft whitespace-pre-line">
        {exercise.instructions}
      </p>

      <div className="mt-4 divide-y divide-border">
        {exercise.prompts.map((prompt) => (
          <div key={prompt.id} className="py-3 first:pt-0 last:pb-0">
            <label htmlFor={`exercise-${prompt.id}`} className="mb-1.5 block text-sm text-ink">
              {prompt.label}
            </label>
            <textarea
              id={`exercise-${prompt.id}`}
              value={answers[prompt.id] ?? ""}
              onChange={(event) =>
                setAnswers((prev) => ({ ...prev, [prompt.id]: event.target.value }))
              }
              placeholder={prompt.placeholder}
              rows={3}
              className="w-full rounded-lg border border-border bg-paper px-3 py-2 text-sm text-ink outline-none transition focus:border-primary"
            />
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="submit"
          disabled={!hasAnyAnswer || status === "loading"}
          className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-paper transition hover:bg-primary-dark disabled:opacity-60"
        >
          {status === "loading" ? "Enviando…" : "Enviar"}
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
