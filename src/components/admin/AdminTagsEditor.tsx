"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminTagsEditor({ professionalId, tags }: { professionalId: string; tags: string[] }) {
  const router = useRouter();
  const [value, setValue] = useState(tags.join(", "));
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [message, setMessage] = useState("");

  async function save() {
    setStatus("saving");
    setMessage("");
    try {
      const response = await fetch(`/api/admin/crm/professionals/${professionalId}/tags`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tags: value
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error ?? "Não foi possível salvar agora.");
      setStatus("idle");
      router.refresh();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Não foi possível salvar agora.");
    }
  }

  return (
    <div>
      <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-soft">
        Tags (separadas por vírgula)
      </label>
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="ex: prioridade, plano premium, indicação"
          className="flex-1 rounded-xl border border-border bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink-soft/70 focus:border-primary focus:outline-none"
        />
        <button
          type="button"
          onClick={save}
          disabled={status === "saving"}
          className="shrink-0 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-paper transition hover:bg-primary-dark disabled:opacity-60"
        >
          {status === "saving" ? "Salvando…" : "Salvar"}
        </button>
      </div>
      {status === "error" && (
        <p role="alert" className="mt-1 text-xs text-accent-dark">
          {message}
        </p>
      )}
    </div>
  );
}
