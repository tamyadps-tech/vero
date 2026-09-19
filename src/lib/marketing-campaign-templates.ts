import { shell, button, textToParagraphsHtml } from "@/lib/email-templates";
import type { CampaignTemplateContent } from "@/lib/professional-campaign-templates";

/**
 * Modelos prontos de campanha pra divulgar a própria Vero — texto
 * original, escrito pra essa plataforma (não adaptado de terceiros).
 * Cada modelo cobre um momento do funil: atrair (venda), engajar quem
 * ainda não decidiu (acompanhamento) e cuidar de quem já está dentro
 * (pós-venda). Editável pelo admin, ver admin-message-templates.ts.
 */

export type CampaignTemplateId = "convite" | "acompanhamento" | "pos-venda";

export interface CampaignTemplateMeta {
  id: CampaignTemplateId;
  label: string;
  stage: "Venda" | "Acompanhamento" | "Pós-venda";
  description: string;
}

export const CAMPAIGN_TEMPLATE_META: CampaignTemplateMeta[] = [
  {
    id: "convite",
    label: "Convite pra conhecer a Vero",
    stage: "Venda",
    description:
      "Pra quem está na lista de espera ou ainda não decidiu — apresenta a Vero e convida a se cadastrar.",
  },
  {
    id: "acompanhamento",
    label: "Acompanhamento de quem ainda não terminou o cadastro",
    stage: "Acompanhamento",
    description:
      "Pra quem começou a se interessar (entrou na lista de espera, começou o cadastro) mas ainda não virou usuário ativo.",
  },
  {
    id: "pos-venda",
    label: "Pós-venda: cuidado com quem já está na Vero",
    stage: "Pós-venda",
    description:
      "Pra profissionais/clientes já ativos — reforça vínculo, lembra de recursos úteis e demonstra cuidado real (não é só venda).",
  },
];

export const DEFAULT_CAMPAIGN_TEMPLATE_CONTENT: Record<CampaignTemplateId, CampaignTemplateContent> = {
  convite: {
    emailSubject: "Um espaço pra organizar seu cuidado",
    emailBodyText:
      "A Vero nasceu pra tirar a bagunça de planilha e post-it de quem cuida de gente — agenda, prontuário, autoavaliação e pagamento, tudo junto. Se você trabalha com saúde mental ou bem-estar, leva poucos minutos pra montar seu perfil e começar a receber clientes. Se você busca apoio, é rápido encontrar alguém com quem conversar.",
    whatsapp: "Oi! A Vero organiza agenda, prontuário e pagamento num só lugar pra quem cuida de gente. Dá uma olhada:",
  },
  acompanhamento: {
    emailSubject: "Ainda dá tempo de continuar",
    emailBodyText:
      "Vimos que você chegou a conhecer a Vero mas ainda não deu o próximo passo — e queremos ajudar com o que estiver faltando. Tem alguma dúvida sobre como funciona, os valores ou o processo de aprovação? É só responder este email que a gente ajuda pessoalmente.",
    whatsapp: "Oi! Vimos que você começou a conhecer a Vero mas ainda não finalizou. Alguma dúvida? É só responder aqui:",
  },
  "pos-venda": {
    emailSubject: "Como está sendo usar a Vero?",
    emailBodyText:
      "Queríamos saber de verdade como está sendo a experiência até aqui. Usar uma ferramenta nova no dia a dia tem seus altos e baixos, e a gente quer que a Vero esteja ajudando, não atrapalhando. Alguma sugestão ou dificuldade? Responde este email.",
    whatsapp: "Oi! Como está sendo usar a Vero? Qualquer coisa, é só chamar por aqui:",
  },
};

export interface ResolvedCampaignTemplate {
  id: CampaignTemplateId;
  label: string;
  stage: CampaignTemplateMeta["stage"];
  description: string;
  content: CampaignTemplateContent;
  email: { subject: string; html: string };
  whatsapp: string;
}

export function renderCampaignTemplate(
  meta: CampaignTemplateMeta,
  content: CampaignTemplateContent,
  siteUrl: string
): ResolvedCampaignTemplate {
  const body = `
    ${textToParagraphsHtml(content.emailBodyText)}
    <p style="margin:24px 0;">${button(siteUrl, "Conhecer a Vero")}</p>
  `;
  return {
    id: meta.id,
    label: meta.label,
    stage: meta.stage,
    description: meta.description,
    content,
    email: {
      subject: content.emailSubject,
      html: shell(content.emailSubject, body),
    },
    whatsapp: `${content.whatsapp} ${siteUrl}`,
  };
}

export function resolveCampaignTemplates(
  siteUrl: string,
  overrides?: Partial<Record<CampaignTemplateId, CampaignTemplateContent>>
): ResolvedCampaignTemplate[] {
  return CAMPAIGN_TEMPLATE_META.map((meta) =>
    renderCampaignTemplate(meta, overrides?.[meta.id] ?? DEFAULT_CAMPAIGN_TEMPLATE_CONTENT[meta.id], siteUrl)
  );
}

export function getCampaignTemplateMeta(id: string): CampaignTemplateMeta | undefined {
  return CAMPAIGN_TEMPLATE_META.find((meta) => meta.id === id);
}

export function isCampaignTemplateId(id: string): id is CampaignTemplateId {
  return id in DEFAULT_CAMPAIGN_TEMPLATE_CONTENT;
}
