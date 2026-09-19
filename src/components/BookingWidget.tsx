"use client";

import { useState } from "react";
import Link from "next/link";
import { trackBooking } from "@/lib/ad-tracking";

type Status = "picking" | "confirm" | "loading" | "success" | "error";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  weekday: "short",
  day: "2-digit",
  month: "short",
});
const timeFormatter = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
});

export function BookingWidget({
  professionalId,
  slotsIso,
  isLoggedIn,
}: {
  professionalId: string;
  slotsIso: string[];
  isLoggedIn: boolean;
}) {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("picking");
  const [message, setMessage] = useState("");

  async function handleConfirm() {
    if (!selectedSlot) return;
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/sessions/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ professionalId, slot: selectedSlot }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Não foi possível agendar agora.");
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      setStatus("success");
      trackBooking();
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível agendar agora. Tente novamente."
      );
    }
  }

  if (slotsIso.length === 0) {
    return (
      <p className="text-sm text-ink-soft">
        Sem horários disponíveis no momento. Volte em breve.
      </p>
    );
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-primary/30 bg-primary-light px-6 py-5 text-center">
        <p className="font-medium text-primary-dark">Sessão agendada!</p>
        <p className="mt-2 text-sm text-primary-dark">
          Acompanhe no seu{" "}
          <Link href="/c/dashboard" className="underline">
            painel
          </Link>
          .
        </p>
      </div>
    );
  }

  if (status === "confirm" || status === "loading" || status === "error") {
    const slotDate = selectedSlot ? new Date(selectedSlot) : null;
    return (
      <div className="space-y-4">
        {slotDate && (
          <p className="text-sm text-ink">
            Agendando para{" "}
            <strong>
              {dateFormatter.format(slotDate)} às {timeFormatter.format(slotDate)}
            </strong>
            .{" "}
            <button
              type="button"
              onClick={() => setStatus("picking")}
              className="text-primary hover:underline"
            >
              Trocar horário
            </button>
          </p>
        )}
        <button
          type="button"
          onClick={handleConfirm}
          disabled={status === "loading"}
          className="w-full rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-paper transition hover:bg-primary-dark disabled:opacity-60"
        >
          {status === "loading" ? "Agendando…" : "Confirmar agendamento"}
        </button>
        {status === "error" && (
          <p role="alert" className="text-sm text-accent-dark">
            {message}
          </p>
        )}
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-paper-alt/40 p-5 text-center">
        <p className="text-sm text-ink">
          Entre ou crie sua conta pra agendar uma sessão.
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/c/entrar"
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-paper transition hover:bg-primary-dark"
          >
            Entrar
          </Link>
          <Link href="/c/cadastrar" className="text-sm text-primary hover:underline">
            Criar conta
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {slotsIso.map((iso) => {
        const date = new Date(iso);
        return (
          <button
            key={iso}
            type="button"
            onClick={() => {
              setSelectedSlot(iso);
              setStatus("confirm");
            }}
            className="rounded-xl border border-border bg-paper px-4 py-2.5 text-left text-sm text-ink transition hover:border-primary"
          >
            {dateFormatter.format(date)} · {timeFormatter.format(date)}
          </button>
        );
      })}
    </div>
  );
}
