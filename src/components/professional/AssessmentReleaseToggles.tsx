"use client";

import { useState } from "react";
import { ASSESSMENT_TEMPLATES } from "@/lib/assessments";
import type { ClientLatestAssessment } from "@/lib/professional-clients";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });

export function AssessmentReleaseToggles({
  clientId,
  releasedSlugs,
  latestAssessments,
}: {
  clientId: string;
  releasedSlugs: string[];
  latestAssessments: ClientLatestAssessment[];
}) {
  const [released, setReleased] = useState(new Set(releasedSlugs));
  const [loadingSlug, setLoadingSlug] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function toggle(slug: string) {
    const nextReleased = !released.has(slug);
    setLoadingSlug(slug);
    setError("");
    try {
      const response = await fetch(`/api/professional/clients/${clientId}/assessments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateSlug: slug, released: nextReleased }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Não foi possível atualizar agora.");
      }
      setReleased((prev) => {
        const next = new Set(prev);
        if (nextReleased) next.add(slug);
        else next.delete(slug);
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível atualizar agora.");
    } finally {
      setLoadingSlug(null);
    }
  }

  return (
    <div className="mt-2 w-full space-y-1.5">
      {ASSESSMENT_TEMPLATES.map((template) => {
        const isReleased = released.has(template.slug);
        const latest = latestAssessments.find((a) => a.templateSlug === template.slug);
        return (
          <div
            key={template.slug}
            className="flex flex-wrap items-center justify-between gap-2 text-xs"
          >
            <button
              type="button"
              onClick={() => toggle(template.slug)}
              disabled={loadingSlug === template.slug}
              aria-pressed={isReleased}
              className={`rounded-full px-2.5 py-1 font-medium transition disabled:opacity-60 ${
                isReleased
                  ? "bg-primary-light text-primary-dark"
                  : "bg-paper-alt text-ink-soft hover:text-ink"
              }`}
            >
              {isReleased ? "✓ Liberado" : "Liberar"} · {template.name.split(" — ")[0]}
            </button>
            {latest && (
              <span className="text-ink-soft" title={dateFormatter.format(new Date(latest.createdAt))}>
                {latest.score} ({latest.severity})
              </span>
            )}
          </div>
        );
      })}
      {error && (
        <p role="alert" className="text-xs text-accent-dark">
          {error}
        </p>
      )}
    </div>
  );
}
