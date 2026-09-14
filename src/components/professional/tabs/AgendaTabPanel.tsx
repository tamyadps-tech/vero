import { AvailabilityManager } from "@/components/admin/AvailabilityManager";
import { SessionRow } from "@/components/admin/SessionRow";
import type { AdminAvailabilitySlot } from "@/lib/booking";
import type { AdminSession } from "@/lib/admin-sessions";

export function AgendaTabPanel({
  professionalId,
  slots,
  sessions,
}: {
  professionalId: string;
  slots: AdminAvailabilitySlot[] | null;
  sessions: AdminSession[] | null;
}) {
  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
          Disponibilidade semanal
        </h2>
        <p className="mt-1 text-sm text-ink-soft">
          Cada horário se repete toda semana até você removê-lo. Visão de
          calendário (dia/semana/mês) e envio automático de confirmação
          chegam numa próxima versão.
        </p>
        <div className="mt-4 rounded-2xl border border-border bg-paper-alt/40 p-5">
          {slots === null ? (
            <p className="text-sm text-ink-soft">Supabase ainda não está configurado.</p>
          ) : (
            <AvailabilityManager professionalId={professionalId} slots={slots} own />
          )}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
          Sessões e prontuário
        </h2>
        <p className="mt-1 text-sm text-ink-soft">
          Registre tópicos, tarefa e a próxima sessão. O cliente vê isso no
          próprio painel.
        </p>
        <div className="mt-4 space-y-3">
          {sessions === null ? (
            <p className="text-sm text-ink-soft">Supabase ainda não está configurado.</p>
          ) : sessions.length === 0 ? (
            <p className="text-sm text-ink-soft">Nenhuma sessão ainda.</p>
          ) : (
            sessions.map((session) => <SessionRow key={session.id} session={session} own />)
          )}
        </div>
      </section>
    </div>
  );
}
