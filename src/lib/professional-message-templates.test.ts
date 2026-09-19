import { describe, it, expect, beforeEach } from "vitest";
import {
  getProfessionalTemplateOverrides,
  saveProfessionalTemplateOverride,
  resetProfessionalTemplateOverride,
} from "./professional-message-templates";

describe("professional-message-templates", () => {
  beforeEach(() => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it("returns no overrides when Supabase isn't configured yet", async () => {
    expect(await getProfessionalTemplateOverrides("prof-1")).toEqual({});
  });

  it("fails gracefully to save/reset when Supabase isn't configured yet", async () => {
    expect(
      await saveProfessionalTemplateOverride("prof-1", "convite", {
        emailSubject: "x",
        emailBodyText: "y",
        whatsapp: "z",
      })
    ).toEqual({ ok: false });
    expect(await resetProfessionalTemplateOverride("prof-1", "convite")).toEqual({ ok: false });
  });
});
