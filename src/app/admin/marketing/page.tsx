import { headers } from "next/headers";
import { AdminNav } from "@/components/admin/AdminNav";
import { MarketingIntegrationStatusCard } from "@/components/admin/MarketingIntegrationStatus";
import { MarketingTemplateCard } from "@/components/admin/MarketingTemplateCard";
import { MarketingCampaignSender } from "@/components/admin/MarketingCampaignSender";
import { WhatsAppCampaignSender } from "@/components/admin/WhatsAppCampaignSender";
import { getEmailMarketingStatus, getWhatsAppMarketingStatus } from "@/lib/marketing-integrations";
import { resolveCampaignTemplates } from "@/lib/marketing-campaign-templates";
import { getAdminTemplateOverrides } from "@/lib/admin-message-templates";
import { RECIPIENT_SEGMENTS } from "@/lib/marketing-recipients";

export const dynamic = "force-dynamic";

export default async function AdminMarketingPage() {
  const headersList = await headers();
  const siteUrl = `${headersList.get("x-forwarded-proto") ?? "https"}://${headersList.get("host") ?? "vero.app"}`;

  const emailStatus = getEmailMarketingStatus();
  const whatsappStatus = getWhatsAppMarketingStatus();
  const templateOverrides = await getAdminTemplateOverrides();
  const templates = resolveCampaignTemplates(siteUrl, templateOverrides);

  return (
    <>
      <AdminNav active="/admin/marketing" />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Marketing</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Ferramentas pra divulgar a própria Vero — não a agenda de um profissional
          específico. Nada aqui pede pra você sair da Vero ou abrir conta em outro lugar:
          o envio usa o Resend e o Twilio que já estão conectados no resto do app.
        </p>

        <section className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
            Email marketing
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            Modelos prontos pras 3 fases do funil: venda, acompanhamento e pós-venda.
          </p>
          <div className="mt-3">
            <MarketingIntegrationStatusCard
              status={emailStatus}
              envVarsHint="RESEND_API_KEY e RESEND_FROM"
            />
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {templates.map((template) => (
              <MarketingTemplateCard key={template.id} template={template} />
            ))}
          </div>

          <div className="mt-5">
            <MarketingCampaignSender templates={templates} segments={RECIPIENT_SEGMENTS} />
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
            WhatsApp em massa
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            Pra quem já topou receber mensagem — use os mesmos modelos, em versão curta.
          </p>
          <div className="mt-3">
            <MarketingIntegrationStatusCard
              status={whatsappStatus}
              envVarsHint="TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN e TWILIO_WHATSAPP_FROM"
            />
          </div>

          <div className="mt-5">
            <WhatsAppCampaignSender templates={templates} />
          </div>
        </section>
      </main>
    </>
  );
}
