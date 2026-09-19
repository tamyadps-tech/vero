import { describe, it, expect, beforeEach } from "vitest";
import { POST } from "./route";

function makeRequest(body: Record<string, unknown>) {
  return new Request("http://localhost/api/professional/subscription/checkout", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("POST /api/professional/subscription/checkout", () => {
  beforeEach(() => {
    delete process.env.STRIPE_SECRET_KEY;
  });

  it("returns 503 when Stripe isn't configured yet", async () => {
    const response = await POST(makeRequest({ plan: "pro" }));
    expect(response.status).toBe(503);
  });

  it("rejects a plan that isn't basico/pro/premium", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_dummy";
    const response = await POST(makeRequest({ plan: "gold" }));
    expect(response.status).toBe(400);
  });
});
