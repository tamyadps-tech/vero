"use client";

import { useState } from "react";

interface ClientOption {
  id: string;
  full_name: string;
  email: string;
}

export function SendMessageForm({ clients }: { clients: ClientOption[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ sent: number; total: number } | null>(null);

  function toggleClient(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) =>
      prev.size === clients.length ? new Set() : new Set(clients.map((c) => c.id))
    );
  }

  async function send() {
    setPending(true);
    setError("");
    setResult(null);
    try {
      const response = await fetch("/api/professional/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientIds: Array.from(selected),
          subject,
          message,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error ?? "Não foi possível enviar agora.");
      }
      setResult({ sent: data.sent, total: data.total });
      setSubject("");
      setMessage("");
      setSelected(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setPending(false);
    }
  }

  if (clients.length === 0) {
    return (
      <p className="text-sm text-ink-soft">
        Você ainda não tem clientes pra enviar mensagem.
      </p>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-ink">
          Destinatários ({selected.size} de {clients.length})
        </p>
        <button
          type="button"
          onClick={toggleAll}
          className="text-xs font-medium text-primary hover:underline"
        >
          {selected.size === clients.length ? "Desmarcar todos" : "Selecionar todos"}
        </button>
      </div>
      <div className="mt-2 max-h-40 space-y-1.5 overflow-y-auto rounded-xl border border-border bg-paper p-3">
        {clients.map((client) => (
          <label key={client.id} className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={selected.has(client.id)}
              onChange={() => toggleClient(client.id)}
              className="h-4 w-4 rounded border-border"
            />
            {client.full_name}
            <span className="text-xs text-ink-soft">{client.email}</span>
          </label>
        ))}
      </div>

      <div className="mt-4">
        <label className="mb-1 block text-xs font-medium text-ink">Assunto</label>
        <input
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          placeholder="Novo horário disponível essa semana"
          className="w-full rounded-lg border border-border bg-paper px-3 py-2 text-sm text-ink"
        />
      </div>
      <div className="mt-3">
        <label className="mb-1 block text-xs font-medium text-ink">Mensagem</label>
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={4}
          placeholder="Oi! Passando pra avisar que abri horários novos essa semana..."
          className="w-full rounded-lg border border-border bg-paper px-3 py-2 text-sm text-ink"
        />
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          disabled={pending || selected.size === 0 || !subject.trim() || !message.trim()}
          onClick={send}
          className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-paper transition hover:bg-primary-dark disabled:opacity-60"
        >
          {pending ? "Enviando…" : "Enviar mensagem"}
        </button>
        {result && (
          <span className="text-xs text-primary-dark">
            Enviado pra {result.sent} de {result.total}.
          </span>
        )}
        {error && (
          <span role="alert" className="text-xs text-accent-dark">
            {error}
          </span>
        )}
      </div>
    </div>
  );
}
