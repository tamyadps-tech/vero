import { ShareProfileLink } from "@/components/professional/ShareProfileLink";
import { SendMessageForm } from "@/components/professional/SendMessageForm";
import type { ProfessionalClient } from "@/lib/professional-clients";

export function MarketingTabPanel({
  publicProfileUrl,
  clients,
}: {
  publicProfileUrl: string;
  clients: ProfessionalClient[] | null;
}) {
  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
          Divulgação
        </h2>
        <p className="mt-1 text-sm text-ink-soft">
          Esse é o link do seu perfil público na Vero. Compartilhe nas suas redes,
          WhatsApp ou bio do Instagram pra atrair novos clientes.
        </p>
        <div className="mt-4 rounded-2xl border border-border bg-paper-alt/40 p-5">
          <ShareProfileLink url={publicProfileUrl} />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
          Mensagens
        </h2>
        <p className="mt-1 text-sm text-ink-soft">
          Mande um recado por email pra um ou mais clientes — avisos de
          horário novo, reengajamento de quem está sumido, promoções.
        </p>
        <div className="mt-4 rounded-2xl border border-border bg-paper-alt/40 p-5">
          {clients === null ? (
            <p className="text-sm text-ink-soft">Supabase ainda não está configurado.</p>
          ) : (
            <SendMessageForm
              clients={clients.map((c) => ({
                id: c.id,
                full_name: c.full_name,
                email: c.email,
              }))}
            />
          )}
        </div>
      </section>
    </div>
  );
}
