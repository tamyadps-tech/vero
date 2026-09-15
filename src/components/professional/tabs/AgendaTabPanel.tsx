import { AvailabilityManager } from "@/components/admin/AvailabilityManager";
import { AgendaCalendar } from "@/components/professional/tabs/AgendaCalendar";
import { GoogleCalendarConnect } from "@/components/professional/GoogleCalendarConnect";
import type { AdminAvailabilitySlot } from "@/lib/booking";
import type { AdminSession } from "@/lib/admin-sessions";

export function AgendaTabPanel({
  professionalId,
  slots,
  sessions,
  googleCalendarEmail,
}: {
  professionalId: string;
  slots: AdminAvailabilitySlot[] | null;
  sessions: AdminSession[] | null;
  googleCalendarEmail: string | null;
}) {
  const now = new Date();

  return (
    <div className="space-y-10">
      <GoogleCalendarConnect connectedEmail={googleCalendarEmail} />

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
          Sessões
        </h2>
        <p className="mt-1 text-sm text-ink-soft">
          Navegue por dia, semana ou mês. Registre tópicos, tarefa e a
          próxima sessão — o cliente vê isso no próprio painel. Reenvie a
          confirmação por email quando precisar.
        </p>
        <div className="mt-4">
          {sessions === null ? (
            <p className="text-sm text-ink-soft">Supabase ainda não está configurado.</p>
          ) : (
            <AgendaCalendar sessions={sessions} todayIso={now.toISOString()} />
          )}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
          Disponibilidade semanal
        </h2>
        <p className="mt-1 text-sm text-ink-soft">
          Cada horário se repete toda semana até você removê-lo.
        </p>
        <div className="mt-4 rounded-2xl border border-border bg-paper-alt/40 p-5">
          {slots === null ? (
            <p className="text-sm text-ink-soft">Supabase ainda não está configurado.</p>
          ) : (
            <AvailabilityManager professionalId={professionalId} slots={slots} own />
          )}
        </div>
      </section>
    </div>
  );
}
