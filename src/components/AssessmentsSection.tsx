"use client";

import { useState } from "react";
import { ASSESSMENT_TEMPLATES } from "@/lib/assessments";
import { AssessmentForm } from "@/components/AssessmentForm";
import type { ClientAssessmentResponse } from "@/lib/client-progress";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });

export function AssessmentsSection({
  responses,
  releasedSlugs,
}: {
  responses: ClientAssessmentResponse[];
  releasedSlugs: string[];
}) {
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const released = new Set(releasedSlugs);

  return (
    <div className="space-y-4">
      {ASSESSMENT_TEMPLATES.map((template) => {
        const history = responses
          .filter((r) => r.template_slug === template.slug)
          .slice(0, 5);
        const isReleased = released.has(template.slug);

        return (
          <div
            key={template.slug}
            className="rounded-2xl border border-border bg-paper-alt/40 p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-ink">{template.name}</h3>
                <p className="text-xs text-ink-soft">{template.description}</p>
              </div>
              {isReleased ? (
                openSlug !== template.slug && (
                  <button
                    type="button"
                    onClick={() => setOpenSlug(template.slug)}
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
                    {dateFormatter.format(new Date(r.created_at))}: {r.score} ({r.severity})
                  </span>
                ))}
              </div>
            )}

            {openSlug === template.slug && (
              <div className="mt-3">
                <AssessmentForm
                  templateSlug={template.slug}
                  onClose={() => setOpenSlug(null)}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
