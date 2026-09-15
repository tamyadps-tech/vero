"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function GoogleCalendarConnect({ connectedEmail }: { connectedEmail: string | null }) {
  const router = useRouter();
  const [disconnecting, setDisconnecting] = useState(false);
  const [error, setError] = useState("");

  async function handleDisconnect() {
    setDisconnecting(true);
    setError("");
    try {
      const response = await fetch("/api/professional/google-calendar/disconnect", {
        method: "POST",
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error ?? "Não foi possível desconectar agora.");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível desconectar agora.");
    } finally {
      setDisconnecting(false);
    }
  }

  return (
    <section>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
        Google Calendar
      </h2>
      <p className="mt-1 text-sm text-ink-soft">
        Conecte sua agenda do Google: o Vero bloqueia horários que já
        estão ocupados lá, e cria um evento automaticamente sempre que
        alguém agenda uma sessão com você.
      </p>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-paper-alt/40 p-5">
        {connectedEmail ? (
          <>
            <p className="text-sm text-ink">
              Conectado como <strong>{connectedEmail}</strong>
            </p>
            <button
              type="button"
              onClick={handleDisconnect}
              disabled={disconnecting}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-ink-soft transition hover:text-ink disabled:opacity-60"
            >
              {disconnecting ? "Desconectando…" : "Desconectar"}
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-ink-soft">Nenhuma agenda conectada ainda.</p>
            <a
              href="/api/professional/google-calendar/connect"
              className="whitespace-nowrap rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-paper transition hover:bg-primary-dark"
            >
              Conectar Google Calendar
            </a>
          </>
        )}
      </div>
      {error && (
        <p role="alert" className="mt-1.5 text-xs text-accent-dark">
          {error}
        </p>
      )}
    </section>
  );
}
