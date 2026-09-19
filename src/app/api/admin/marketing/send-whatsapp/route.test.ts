import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { POST } from "./route";

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/admin/marketing/send-whatsapp", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("POST /api/admin/marketing/send-whatsapp", () => {
  beforeEach(() => {
    delete process.env.TWILIO_ACCOUNT_SID;
    delete process.env.TWILIO_AUTH_TOKEN;
    delete process.env.TWILIO_WHATSAPP_FROM;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("rejects an invalid template id", async () => {
    const response = await POST(
      makeRequest({ templateId: "nao-existe", phones: ["+5511999999999"] })
    );
    expect(response.status).toBe(400);
  });

  it("rejects an empty phone list", async () => {
    const response = await POST(makeRequest({ templateId: "convite", phones: [] }));
    expect(response.status).toBe(400);
  });

  it("returns a summary without failing the request when Twilio isn't configured", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(
      makeRequest({ templateId: "convite", phones: ["+5511999999999", "  "] })
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.recipientCount).toBe(1);
    expect(json.sent).toBe(0);
    expect(json.failed).toBe(1);
    expect(json.reasons).toEqual(["not_configured"]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("counts a non-E.164 number as invalid without calling Twilio", async () => {
    process.env.TWILIO_ACCOUNT_SID = "sid";
    process.env.TWILIO_AUTH_TOKEN = "token";
    process.env.TWILIO_WHATSAPP_FROM = "+5511999999999";
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(
      makeRequest({ templateId: "convite", phones: ["5511999999999"] })
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.failed).toBe(1);
    expect(json.reasons).toEqual(["invalid_phone_number"]);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
