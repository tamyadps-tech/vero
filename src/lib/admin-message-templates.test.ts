import { describe, it, expect, beforeEach } from "vitest";
import {
  getAdminTemplateOverrides,
  saveAdminTemplateOverride,
  resetAdminTemplateOverride,
} from "./admin-message-templates";

describe("admin-message-templates", () => {
  beforeEach(() => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it("returns no overrides when Supabase isn't configured yet", async () => {
    expect(await getAdminTemplateOverrides()).toEqual({});
  });

  it("fails gracefully to save/reset when Supabase isn't configured yet", async () => {
    expect(
      await saveAdminTemplateOverride("convite", {
        emailSubject: "x",
        emailBodyText: "y",
        whatsapp: "z",
      })
    ).toEqual({ ok: false });
    expect(await resetAdminTemplateOverride("convite")).toEqual({ ok: false });
  });
});
