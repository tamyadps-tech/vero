"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { CrmNote } from "@/lib/professional-crm";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });

export function ContactNotes({ linkId, notes }: { linkId: string; notes: CrmNote[] }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    setMessage("");
    try {
      const response = await fetch("/api/professional/crm/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(linkId.startsWith("c-") ? { clientId: linkId.slice(2) } : { contactId: linkId.slice(2) }),
          body,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error ?? "Não foi possível salvar a nota agora.");
      setBody("");
      setStatus("idle");
      router.refresh();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Não foi possível salvar a nota agora.");
    }
  }

  return (
    <section>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">Notas</h2>
      <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <textarea
          required
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Registre uma ligação, um combinado, uma observação..."
          rows={2}
          className="flex-1 rounded-xl border border-border bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink-soft/70 focus:border-primary focus:outline-none"
        />
        <button
          type="submit"
          disabled={status === "saving"}
          className="shrink-0 self-start rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-paper transition hover:bg-primary-dark disabled:opacity-60"
        >
          {status === "saving" ? "Salvando…" : "Adicionar"}
        </button>
      </form>
      {status === "error" && (
        <p role="alert" className="mt-1 text-xs text-accent-dark">
          {message}
        </p>
      )}
      <div className="mt-4 space-y-2">
        {notes.length === 0 ? (
          <p className="text-sm text-ink-soft">Nenhuma nota ainda.</p>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="rounded-xl border border-border bg-paper-alt/40 p-3 text-sm">
              <p className="text-ink">{note.body}</p>
              <p className="mt-1 text-xs text-ink-soft">{dateFormatter.format(new Date(note.createdAt))}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
