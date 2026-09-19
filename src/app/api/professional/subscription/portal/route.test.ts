import { describe, it, expect, beforeEach } from "vitest";
import { POST } from "./route";

function makeRequest() {
  return new Request("http://localhost/api/professional/subscription/portal", { method: "POST" });
}

describe("POST /api/professional/subscription/portal", () => {
  beforeEach(() => {
    delete process.env.STRIPE_SECRET_KEY;
  });

  it("returns 503 when Stripe isn't configured yet", async () => {
    const response = await POST(makeRequest());
    expect(response.status).toBe(503);
  });
});
