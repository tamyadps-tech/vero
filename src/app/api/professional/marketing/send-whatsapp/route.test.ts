import { describe, it, expect, beforeEach } from "vitest";
import { POST } from "./route";

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/professional/marketing/send-whatsapp", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("POST /api/professional/marketing/send-whatsapp", () => {
  beforeEach(() => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it("rejects an invalid template id", async () => {
    const response = await POST(
      makeRequest({ templateId: "nao-existe", manualPhones: ["+5511999999999"] })
    );
    expect(response.status).toBe(400);
  });

  it("rejects when neither clientIds nor manualPhones are given", async () => {
    const response = await POST(makeRequest({ templateId: "convite", manualPhones: [] }));
    expect(response.status).toBe(400);
  });

  it("returns 503 when Supabase isn't configured yet", async () => {
    const response = await POST(
      makeRequest({ templateId: "convite", manualPhones: ["+5511999999999"] })
    );
    expect(response.status).toBe(503);
  });
});
