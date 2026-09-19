import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { sendMetaPurchaseEvent } from "./meta-conversions-api";

describe("sendMetaPurchaseEvent", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_META_PIXEL_ID;
    delete process.env.META_CONVERSIONS_API_TOKEN;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.unstubAllGlobals();
  });

  it("does not call fetch and returns not_configured without the pixel/token", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await sendMetaPurchaseEvent({ amountCents: 10000 });

    expect(result).toEqual({ sent: false, reason: "not_configured" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends the Purchase event with the amount converted to reais", async () => {
    process.env.NEXT_PUBLIC_META_PIXEL_ID = "pixel123";
    process.env.META_CONVERSIONS_API_TOKEN = "token123";
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    const result = await sendMetaPurchaseEvent({ amountCents: 25000, eventId: "evt-1" });

    expect(result).toEqual({ sent: true });
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain("pixel123");
    expect(url).toContain("access_token=token123");
    const body = JSON.parse(options.body);
    expect(body.data[0]).toMatchObject({
      event_name: "Purchase",
      event_id: "evt-1",
      custom_data: { value: 250, currency: "BRL" },
    });
  });

  it("returns a failure reason when Meta responds with an error", async () => {
    process.env.NEXT_PUBLIC_META_PIXEL_ID = "pixel123";
    process.env.META_CONVERSIONS_API_TOKEN = "token123";
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 401, text: async () => "bad token" });
    vi.stubGlobal("fetch", fetchMock);

    const result = await sendMetaPurchaseEvent({ amountCents: 10000 });

    expect(result).toEqual({ sent: false, reason: "meta_401" });
  });
});
