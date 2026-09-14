"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  PROFESSIONAL_CATEGORIES,
  CATEGORY_LABELS,
} from "@/lib/professional-categories";
import { SESSION_FORMATS, SESSION_FORMAT_LABELS } from "@/lib/session-format";

const fieldClass =
  "rounded-xl border border-border bg-paper px-4 py-2.5 text-sm text-ink focus:border-primary focus:outline-none";

export function ProfessionalFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") ?? "";

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/profissionais${params.toString() ? `?${params}` : ""}`);
  }

  return (
    <div>
      <div
        className="flex gap-2 overflow-x-auto pb-1"
        aria-label="Filtrar por categoria"
      >
        <button
          type="button"
          onClick={() => updateParam("category", "")}
          aria-pressed={activeCategory === ""}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
            activeCategory === ""
              ? "bg-primary text-paper"
              : "border border-border bg-paper text-ink-soft hover:text-ink"
          }`}
        >
          Todas
        </button>
        {PROFESSIONAL_CATEGORIES.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => updateParam("category", value)}
            aria-pressed={activeCategory === value}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
              activeCategory === value
                ? "bg-primary text-paper"
                : "border border-border bg-paper text-ink-soft hover:text-ink"
            }`}
          >
            {CATEGORY_LABELS[value]}
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-3">
        <input
          type="search"
          defaultValue={searchParams.get("q") ?? ""}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              updateParam("q", (event.target as HTMLInputElement).value);
            }
          }}
          placeholder="Buscar por nome ou especialidade…"
          aria-label="Buscar profissionais"
          className={`${fieldClass} flex-1 min-w-[200px]`}
        />
        <select
          value={searchParams.get("format") ?? ""}
          onChange={(event) => updateParam("format", event.target.value)}
          aria-label="Filtrar por formato de atendimento"
          className={fieldClass}
        >
          <option value="">Online ou presencial</option>
          {SESSION_FORMATS.map((value) => (
            <option key={value} value={value}>
              {SESSION_FORMAT_LABELS[value]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
