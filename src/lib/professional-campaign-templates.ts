import { shell, button, textToParagraphsHtml } from "@/lib/email-templates";

/**
 * Modelos de campanha pro profissional mandar pros PRÓPRIOS clientes.
 * Cada modelo tem um "conteúdo" editável (assunto, texto do email, texto
 * do WhatsApp) — o profissional pode personalizar sem mexer em código,
 * ver professional-message-templates.ts pra como a edição é persistida.
 * O link pro perfil é sempre adicionado automaticamente na hora de
 * enviar, então quem edita não precisa se preocupar com isso.
 */

export type ProfessionalCampaignTemplateId = "convite" | "reengajamento" | "cuidado";

export interface CampaignTemplateContent {
  emailSubject: string;
  /** Texto puro (sem HTML) — vira parágrafos automaticamente ao enviar. */
  emailBodyText: string;
  /** Texto puro — o link do perfil é adicionado no fim automaticamente. */
  whatsapp: string;
}

export interface ProfessionalCampaignTemplateMeta {
  id: ProfessionalCampaignTemplateId;
  label: string;
  goal: string;
}

export const PROFESSIONAL_CAMPAIGN_TEMPLATE_META: ProfessionalCampaignTemplateMeta[] = [
  {
    id: "convite",
    label: "Convite pra agendar",
    goal: "Atrair quem ainda não marcou sessão nenhuma, ou convidar indicações.",
  },
  {
    id: "reengajamento",
    label: "Reengajamento de quem sumiu",
    goal: "Pra clientes que já vieram antes mas não voltam há um tempo.",
  },
  {
    id: "cuidado",
    label: "Cuidado com quem já é cliente ativo",
    goal: "Pra quem já está em acompanhamento — reforça vínculo, não é venda.",
  },
];

export const DEFAULT_PROFESSIONAL_TEMPLATE_CONTENT: Record<
  ProfessionalCampaignTemplateId,
  CampaignTemplateContent
> = {
  convite: {
    emailSubject: "Tenho um horário pra você essa semana",
    emailBodyText:
      "Separei um tempo na agenda e lembrei de você. Se fizer sentido marcarmos uma conversa, dá uma olhada nos horários e escolha o que encaixar melhor na sua rotina.",
    whatsapp: "Oi! Separei um horário essa semana — se quiser marcar, escolha o dia que funciona pra você:",
  },
  reengajamento: {
    emailSubject: "Faz tempo que a gente não se fala",
    emailBodyText:
      "Fiquei pensando em você e percebi que já faz um tempo desde nossa última conversa. Se fizer sentido retomar, os horários continuam abertos — sem pressa, no seu tempo.",
    whatsapp: "Oi! Faz tempo que a gente não se fala — se quiser retomar, os horários continuam abertos, sem pressa:",
  },
  cuidado: {
    emailSubject: "Só passando pra saber como você está",
    emailBodyText:
      "Entre uma sessão e outra, queria só deixar um recado: estou pensando em você. Se precisar de alguma coisa antes do nosso próximo encontro, é só chamar.",
    whatsapp: "Oi! Só passando pra saber como você está — qualquer coisa antes da nossa próxima sessão, me chama.",
  },
};

export interface ResolvedProfessionalCampaignTemplate {
  id: ProfessionalCampaignTemplateId;
  label: string;
  goal: string;
  content: CampaignTemplateContent;
  email: { subject: string; html: string };
  whatsapp: string;
}

/** Junta o conteúdo (padrão ou editado) com o link do perfil, pronto pra enviar. */
export function renderProfessionalTemplate(
  meta: ProfessionalCampaignTemplateMeta,
  content: CampaignTemplateContent,
  profileUrl: string
): ResolvedProfessionalCampaignTemplate {
  const body = `
    ${textToParagraphsHtml(content.emailBodyText)}
    <p style="margin:24px 0;">${button(profileUrl, "Ver horários e agendar")}</p>
  `;
  return {
    id: meta.id,
    label: meta.label,
    goal: meta.goal,
    content,
    email: {
      subject: content.emailSubject,
      html: shell(content.emailSubject, body),
    },
    whatsapp: `${content.whatsapp} ${profileUrl}`,
  };
}

export function resolveProfessionalCampaignTemplates(
  profileUrl: string,
  overrides?: Partial<Record<ProfessionalCampaignTemplateId, CampaignTemplateContent>>
): ResolvedProfessionalCampaignTemplate[] {
  return PROFESSIONAL_CAMPAIGN_TEMPLATE_META.map((meta) =>
    renderProfessionalTemplate(
      meta,
      overrides?.[meta.id] ?? DEFAULT_PROFESSIONAL_TEMPLATE_CONTENT[meta.id],
      profileUrl
    )
  );
}

export function getProfessionalCampaignTemplateMeta(
  id: string
): ProfessionalCampaignTemplateMeta | undefined {
  return PROFESSIONAL_CAMPAIGN_TEMPLATE_META.find((meta) => meta.id === id);
}

export function isProfessionalCampaignTemplateId(
  id: string
): id is ProfessionalCampaignTemplateId {
  return id in DEFAULT_PROFESSIONAL_TEMPLATE_CONTENT;
}
