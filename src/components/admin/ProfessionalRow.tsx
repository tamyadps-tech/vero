"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CATEGORY_LABELS } from "@/lib/professional-categories";
import { SESSION_FORMAT_LABELS } from "@/lib/session-format";
import type { AdminProfessional } from "@/lib/admin-professionals";

const STATUS_STYLES: Record<AdminProfessional["vetting_status"], string> = {
  pendente: "bg-accent-light text-accent-dark",
  aprovado: "bg-primary-light text-primary-dark",
  rejeitado: "bg-paper-alt text-ink-soft",
};

const STATUS_LABELS: Record<AdminProfessional["vetting_status"], string> = {
  pendente: "Pendente",
  aprovado: "Aprovado",
  rejeitado: "Rejeitado",
};

const meetingDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

/** "2026-06-17T14:00" pro valor de um <input type="datetime-local">. */
function toDatetimeLocal(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function ProfessionalRow({
  professional,
}: {
  professional: AdminProfessional;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [editingMeeting, setEditingMeeting] = useState(false);
  const [meetingAt, setMeetingAt] = useState(
    toDatetimeLocal(professional.verification_meeting_at)
  );
  const [meetingNotes, setMeetingNotes] = useState(
    professional.verification_meeting_notes ?? ""
  );

  async function updateStatus(action: "aprovar" | "rejeitar") {
    setPending(true);
    setError("");
    try {
      const response = await fetch(
        `/api/admin/professionals/${professional.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        }
      );
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Não foi possível atualizar agora.");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setPending(false);
    }
  }

  async function saveMeeting() {
    if (!meetingAt) {
      setError("Escolha uma data e horário pra reunião.");
      return;
    }
    setPending(true);
    setError("");
    try {
      const response = await fetch(
        `/api/admin/professionals/${professional.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "agendar_reuniao",
            scheduledAt: new Date(meetingAt).toISOString(),
            notes: meetingNotes,
          }),
        }
      );
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Não foi possível salvar agora.");
      }
      setEditingMeeting(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-paper p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/profissionais/${professional.id}`}
              className="font-semibold text-ink hover:underline"
            >
              {professional.full_name}
            </Link>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[professional.vetting_status]}`}
            >
              {STATUS_LABELS[professional.vetting_status]}
            </span>
          </div>
          <p className="text-sm text-ink-soft">
            {CATEGORY_LABELS[professional.category]} · {professional.email} ·{" "}
            {formatPrice(professional.price_cents)}/sessão ·{" "}
            {professional.years_experience} anos de experiência
          </p>
          <p className="text-sm text-ink-soft">
            {SESSION_FORMAT_LABELS[professional.session_format]}
            {professional.location_city &&
              ` · ${professional.location_city}/${professional.location_state}`}
          </p>
        </div>
        {professional.vetting_status === "pendente" && (
          <div className="flex gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={() => updateStatus("aprovar")}
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-paper transition hover:bg-primary-dark disabled:opacity-60"
            >
              Aprovar
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => updateStatus("rejeitar")}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-ink-soft transition hover:text-accent-dark disabled:opacity-60"
            >
              Rejeitar
            </button>
          </div>
        )}
      </div>

      <p className="mt-3 text-sm leading-relaxed text-ink-soft">
        {professional.bio}
      </p>

      {professional.personality && (
        <p className="mt-2 text-sm italic text-ink-soft">
          &ldquo;{professional.personality}&rdquo;
        </p>
      )}

      {professional.specialties.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {professional.specialties.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-primary-light px-2.5 py-0.5 text-xs text-primary-dark"
            >
              {tag}
            </span>
          ))}
          {professional.methods.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-accent-light px-2.5 py-0.5 text-xs text-accent-dark"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {professional.credential_document_url && (
        <a
          href={professional.credential_document_url}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-block text-sm text-primary hover:underline"
        >
          Ver documento de credencial →
        </a>
      )}

      {professional.vetting_status === "pendente" && (
        <div className="mt-3 rounded-xl border border-border bg-paper-alt/40 p-3">
          {!editingMeeting ? (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-ink-soft">
                {professional.verification_meeting_at ? (
                  <>
                    Reunião de verificação:{" "}
                    <span className="font-medium text-ink">
                      {meetingDateFormatter.format(
                        new Date(professional.verification_meeting_at)
                      )}
                    </span>
                    {professional.verification_meeting_notes &&
                      ` — ${professional.verification_meeting_notes}`}
                  </>
                ) : (
                  "Nenhuma reunião de verificação marcada ainda."
                )}
              </p>
              <button
                type="button"
                onClick={() => setEditingMeeting(true)}
                className="text-xs font-medium text-primary hover:underline"
              >
                {professional.verification_meeting_at ? "Editar" : "Marcar reunião"}
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-end gap-2">
              <div>
                <label
                  className="mb-1 block text-xs font-medium text-ink"
                  htmlFor={`meeting-at-${professional.id}`}
                >
                  Data e horário
                </label>
                <input
                  id={`meeting-at-${professional.id}`}
                  type="datetime-local"
                  value={meetingAt}
                  onChange={(event) => setMeetingAt(event.target.value)}
                  className="rounded-lg border border-border bg-paper px-2.5 py-1.5 text-xs text-ink"
                />
              </div>
              <div className="min-w-40 flex-1">
                <label
                  className="mb-1 block text-xs font-medium text-ink"
                  htmlFor={`meeting-notes-${professional.id}`}
                >
                  Notas (opcional)
                </label>
                <input
                  id={`meeting-notes-${professional.id}`}
                  value={meetingNotes}
                  onChange={(event) => setMeetingNotes(event.target.value)}
                  placeholder="Link da call, observações..."
                  className="w-full rounded-lg border border-border bg-paper px-2.5 py-1.5 text-xs text-ink"
                />
              </div>
              <button
                type="button"
                disabled={pending}
                onClick={saveMeeting}
                className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-paper transition hover:bg-primary-dark disabled:opacity-60"
              >
                Salvar
              </button>
              <button
                type="button"
                onClick={() => setEditingMeeting(false)}
                className="text-xs text-ink-soft hover:text-ink"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      )}

      {error && (
        <p role="alert" className="mt-2 text-sm text-accent-dark">
          {error}
        </p>
      )}
    </div>
  );
}
