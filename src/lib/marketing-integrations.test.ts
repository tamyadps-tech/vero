import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getEmailMarketingStatus,
  getWhatsAppMarketingStatus,
  sendBulkMarketingEmail,
  sendBulkWhatsAppMessages,
} from "./marketing-integrations";

describe("marketing-integrations", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    delete process.env.RESEND_API_KEY;
    delete process.env.RESEND_FROM;
    delete process.env.TWILIO_ACCOUNT_SID;
    delete process.env.TWILIO_AUTH_TOKEN;
    delete process.env.TWILIO_WHATSAPP_FROM;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.unstubAllGlobals();
  });

  it("reports email marketing as not configured without env vars", () => {
    const status = getEmailMarketingStatus();
    expect(status.configured).toBe(false);
    expect(status.missing).toEqual(["RESEND_API_KEY", "RESEND_FROM"]);
    expect(status.provider).toBe("Resend");
  });

  it("reports WhatsApp marketing as not configured without env vars", () => {
    const status = getWhatsAppMarketingStatus();
    expect(status.configured).toBe(false);
    expect(status.missing).toEqual([
      "TWILIO_ACCOUNT_SID",
      "TWILIO_AUTH_TOKEN",
      "TWILIO_WHATSAPP_FROM",
    ]);
    expect(status.provider).toBe("Twilio");
  });

  it("reports configured once env vars are set", () => {
    process.env.RESEND_API_KEY = "key";
    process.env.RESEND_FROM = "contato@vero.app";
    expect(getEmailMarketingStatus().configured).toBe(true);

    process.env.TWILIO_ACCOUNT_SID = "sid";
    process.env.TWILIO_AUTH_TOKEN = "token";
    process.env.TWILIO_WHATSAPP_FROM = "+5511999999999";
    expect(getWhatsAppMarketingStatus().configured).toBe(true);
  });

  it("does not call fetch and returns not_configured when Resend isn't set up", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await sendBulkMarketingEmail(["lead@example.com"], {
      subject: "Oi",
      html: "<p>Oi</p>",
    });

    expect(result).toEqual({ sent: 0, failed: 1, reasons: ["not_configured"] });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends via Resend when configured and aggregates sent/failed", async () => {
    process.env.RESEND_API_KEY = "key";
    process.env.RESEND_FROM = "contato@vero.app";
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: false, status: 400, text: async () => "bad" });
    vi.stubGlobal("fetch", fetchMock);

    const result = await sendBulkMarketingEmail(["a@example.com", "b@example.com"], {
      subject: "Oi",
      html: "<p>Oi</p>",
    });

    expect(result).toEqual({ sent: 1, failed: 1, reasons: ["resend_400"] });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.resend.com/emails",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("rejects a phone number outside E.164 without calling Twilio", async () => {
    process.env.TWILIO_ACCOUNT_SID = "sid";
    process.env.TWILIO_AUTH_TOKEN = "token";
    process.env.TWILIO_WHATSAPP_FROM = "+5511999999999";
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await sendBulkWhatsAppMessages(["5511999999999"], "Oi");

    expect(result).toEqual({ sent: 0, failed: 1, reasons: ["invalid_phone_number"] });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends via Twilio when configured and phone is valid E.164", async () => {
    process.env.TWILIO_ACCOUNT_SID = "sid";
    process.env.TWILIO_AUTH_TOKEN = "token";
    process.env.TWILIO_WHATSAPP_FROM = "+5511999999999";
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    const result = await sendBulkWhatsAppMessages(["+5511988888888"], "Oi");

    expect(result).toEqual({ sent: 1, failed: 0, reasons: [] });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("api.twilio.com"),
      expect.objectContaining({ method: "POST" })
    );
  });
});
