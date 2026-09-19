import { describe, it, expect } from "vitest";
import {
  CAMPAIGN_TEMPLATE_META,
  DEFAULT_CAMPAIGN_TEMPLATE_CONTENT,
  resolveCampaignTemplates,
  getCampaignTemplateMeta,
  isCampaignTemplateId,
} from "./marketing-campaign-templates";

describe("marketing-campaign-templates", () => {
  it("has exactly the three requested stages", () => {
    expect(CAMPAIGN_TEMPLATE_META.map((t) => t.stage)).toEqual([
      "Venda",
      "Acompanhamento",
      "Pós-venda",
    ]);
  });

  it("every template renders a non-empty subject, html and whatsapp text with the site URL", () => {
    const siteUrl = "https://vero.app";
    const resolved = resolveCampaignTemplates(siteUrl);
    for (const template of resolved) {
      expect(template.email.subject.length).toBeGreaterThan(0);
      expect(template.email.html).toContain(siteUrl);
      expect(template.whatsapp).toContain(siteUrl);
    }
  });

  it("uses an override's content instead of the default when provided", () => {
    const resolved = resolveCampaignTemplates("https://vero.app", {
      convite: {
        emailSubject: "Assunto customizado",
        emailBodyText: "Texto customizado.",
        whatsapp: "Whats customizado",
      },
    });
    const convite = resolved.find((t) => t.id === "convite")!;
    expect(convite.email.subject).toBe("Assunto customizado");

    const posVenda = resolved.find((t) => t.id === "pos-venda")!;
    expect(posVenda.email.subject).toBe(DEFAULT_CAMPAIGN_TEMPLATE_CONTENT["pos-venda"].emailSubject);
  });

  it("looks up template metadata by id", () => {
    expect(getCampaignTemplateMeta("convite")?.label).toBe("Convite pra conhecer a Vero");
    expect(getCampaignTemplateMeta("inexistente")).toBeUndefined();
  });

  it("validates a template id", () => {
    expect(isCampaignTemplateId("pos-venda")).toBe(true);
    expect(isCampaignTemplateId("nao-existe")).toBe(false);
  });
});
