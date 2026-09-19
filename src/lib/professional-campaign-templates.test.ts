import { describe, it, expect } from "vitest";
import {
  PROFESSIONAL_CAMPAIGN_TEMPLATE_META,
  DEFAULT_PROFESSIONAL_TEMPLATE_CONTENT,
  resolveProfessionalCampaignTemplates,
  renderProfessionalTemplate,
  getProfessionalCampaignTemplateMeta,
  isProfessionalCampaignTemplateId,
} from "./professional-campaign-templates";

describe("professional-campaign-templates", () => {
  it("has the three expected templates", () => {
    expect(PROFESSIONAL_CAMPAIGN_TEMPLATE_META.map((t) => t.id)).toEqual([
      "convite",
      "reengajamento",
      "cuidado",
    ]);
  });

  it("resolves default templates with the profile link appended", () => {
    const profileUrl = "https://vero.app/profissionais/123";
    const resolved = resolveProfessionalCampaignTemplates(profileUrl);
    expect(resolved).toHaveLength(3);
    for (const template of resolved) {
      expect(template.email.html).toContain(profileUrl);
      expect(template.whatsapp).toContain(profileUrl);
    }
  });

  it("uses an override's content instead of the default when provided", () => {
    const profileUrl = "https://vero.app/x";
    const resolved = resolveProfessionalCampaignTemplates(profileUrl, {
      convite: {
        emailSubject: "Assunto customizado",
        emailBodyText: "Texto customizado.",
        whatsapp: "Whats customizado",
      },
    });
    const convite = resolved.find((t) => t.id === "convite")!;
    expect(convite.email.subject).toBe("Assunto customizado");
    expect(convite.email.html).toContain("Texto customizado.");
    expect(convite.whatsapp).toContain("Whats customizado");

    // Os outros dois continuam com o conteúdo padrão.
    const cuidado = resolved.find((t) => t.id === "cuidado")!;
    expect(cuidado.email.subject).toBe(DEFAULT_PROFESSIONAL_TEMPLATE_CONTENT.cuidado.emailSubject);
  });

  it("escapes HTML in edited content (no injection via a custom template)", () => {
    const rendered = renderProfessionalTemplate(
      PROFESSIONAL_CAMPAIGN_TEMPLATE_META[0],
      {
        emailSubject: "Oi",
        emailBodyText: '<img src=x onerror="alert(1)">',
        whatsapp: "Oi",
      },
      "https://vero.app/x"
    );
    expect(rendered.email.html).not.toContain("<img src=x");
  });

  it("looks up template metadata by id", () => {
    expect(getProfessionalCampaignTemplateMeta("convite")?.label).toBe("Convite pra agendar");
    expect(getProfessionalCampaignTemplateMeta("inexistente")).toBeUndefined();
  });

  it("validates a template id", () => {
    expect(isProfessionalCampaignTemplateId("convite")).toBe(true);
    expect(isProfessionalCampaignTemplateId("nao-existe")).toBe(false);
  });
});
