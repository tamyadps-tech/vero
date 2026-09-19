import { describe, it, expect, beforeEach } from "vitest";
import { PATCH, DELETE } from "./route";

function makePatchRequest(body: unknown) {
  return new Request("http://localhost/api/admin/marketing/templates/convite", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

const VALID_BODY = {
  emailSubject: "Assunto",
  emailBodyText: "Corpo do email",
  whatsapp: "Texto do WhatsApp",
};

describe("PATCH /api/admin/marketing/templates/[templateId]", () => {
  beforeEach(() => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it("rejects an invalid template id", async () => {
    const response = await PATCH(makePatchRequest(VALID_BODY), {
      params: Promise.resolve({ templateId: "nao-existe" }),
    });
    expect(response.status).toBe(400);
  });

  it("rejects an empty subject", async () => {
    const response = await PATCH(makePatchRequest({ ...VALID_BODY, emailSubject: "" }), {
      params: Promise.resolve({ templateId: "convite" }),
    });
    expect(response.status).toBe(400);
  });

  it("returns 503 when Supabase isn't configured yet", async () => {
    const response = await PATCH(makePatchRequest(VALID_BODY), {
      params: Promise.resolve({ templateId: "convite" }),
    });
    expect(response.status).toBe(503);
  });
});

describe("DELETE /api/admin/marketing/templates/[templateId]", () => {
  beforeEach(() => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it("rejects an invalid template id", async () => {
    const response = await DELETE(
      new Request("http://localhost/api/admin/marketing/templates/nao-existe", {
        method: "DELETE",
      }),
      { params: Promise.resolve({ templateId: "nao-existe" }) }
    );
    expect(response.status).toBe(400);
  });

  it("returns 503 when Supabase isn't configured yet", async () => {
    const response = await DELETE(
      new Request("http://localhost/api/admin/marketing/templates/convite", { method: "DELETE" }),
      { params: Promise.resolve({ templateId: "convite" }) }
    );
    expect(response.status).toBe(503);
  });
});
