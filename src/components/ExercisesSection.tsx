"use client";

import { useState } from "react";
import { EXERCISES } from "@/lib/exercises";
import { ExerciseForm } from "@/components/ExerciseForm";
import type { ClientExerciseResponse } from "@/lib/client-progress";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });

export function ExercisesSection({
  responses,
  releasedSlugs,
}: {
  responses: ClientExerciseResponse[];
  releasedSlugs: string[];
}) {
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const released = new Set(releasedSlugs);

  return (
    <div className="space-y-4">
      {EXERCISES.map((exercise) => {
        const history = responses.filter((r) => r.template_slug === exercise.slug).slice(0, 5);
        const isReleased = released.has(exercise.slug);

        return (
          <div
            key={exercise.slug}
            className="rounded-2xl border border-border bg-paper-alt/40 p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-ink">{exercise.name}</h3>
                <p className="mt-0.5 text-xs text-ink-soft">{exercise.description}</p>
              </div>
              {isReleased ? (
                openSlug !== exercise.slug && (
                  <button
                    type="button"
                    onClick={() => setOpenSlug(exercise.slug)}
                    className="whitespace-nowrap rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-paper transition hover:bg-primary-dark"
                  >
                    Fazer agora
                  </button>
                )
              ) : (
                <span className="whitespace-nowrap rounded-lg bg-paper px-3 py-1.5 text-xs font-medium text-ink-soft">
                  Aguardando liberação
                </span>
              )}
            </div>

            {history.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {history.map((r) => (
                  <span
                    key={r.id}
                    className="rounded-full bg-paper px-2.5 py-0.5 text-xs text-ink-soft"
                  >
                    Respondido em {dateFormatter.format(new Date(r.created_at))}
                  </span>
                ))}
              </div>
            )}

            {openSlug === exercise.slug && (
              <div className="mt-3">
                <ExerciseForm templateSlug={exercise.slug} onClose={() => setOpenSlug(null)} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
