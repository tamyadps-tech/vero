import { ShareProfileLink } from "@/components/professional/ShareProfileLink";
import { SendMessageForm } from "@/components/professional/SendMessageForm";
import { ProfessionalCampaignComposer } from "@/components/professional/ProfessionalCampaignComposer";
import {
  resolveProfessionalCampaignTemplates,
  type ProfessionalCampaignTemplateId,
  type CampaignTemplateContent,
} from "@/lib/professional-campaign-templates";
import type { ProfessionalClient } from "@/lib/professional-clients";

export function MarketingTabPanel({
  publicProfileUrl,
  clients,
  templateOverrides,
}: {
  publicProfileUrl: string;
  clients: ProfessionalClient[] | null;
  templateOverrides: Partial<Record<ProfessionalCampaignTemplateId, CampaignTemplateContent>>;
}) {
  const campaignTemplates = resolveProfessionalCampaignTemplates(publicProfileUrl, templateOverrides);

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
          Campanhas
        </h2>
        <p className="mt-1 text-sm text-ink-soft">
          Modelos prontos de email e WhatsApp pra convidar, reengajar ou cuidar dos
          seus clientes — direto daqui, sem precisar sair da Vero nem abrir conta em
          outro lugar.
        </p>
        <div className="mt-4 rounded-2xl border border-dashed border-border bg-paper-alt/40 p-5 text-sm text-ink-soft">
          <p className="font-medium text-ink">Dicas de sucesso</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Personalize a mensagem antes de enviar — um toque pessoal aumenta a resposta.</li>
            <li>
              Não exagere na frequência: 1 mensagem de cuidado por mês pros clientes
              ativos, e reengajamento só pra quem sumiu de verdade.
            </li>
            <li>
              No WhatsApp, mande só pra quem já é seu cliente e autorizou receber
              mensagem — é o jeito certo de respeitar a LGPD e evitar bloqueio.
            </li>
            <li>Acompanhe aqui mesmo quem volta a agendar depois da campanha — é o sinal de que funcionou.</li>
          </ul>
        </div>
        <div className="mt-4">
          {clients === null ? (
            <p className="text-sm text-ink-soft">Supabase ainda não está configurado.</p>
          ) : (
            <ProfessionalCampaignComposer
              templates={campaignTemplates}
              clients={clients.map((c) => ({
                id: c.id,
                full_name: c.full_name,
                email: c.email,
                phone_number: c.phone_number,
              }))}
            />
          )}
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
