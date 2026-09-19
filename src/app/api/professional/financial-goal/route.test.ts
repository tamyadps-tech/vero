import { describe, it, expect, beforeEach } from "vitest";
import { PATCH } from "./route";

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/professional/financial-goal", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

describe("PATCH /api/professional/financial-goal", () => {
  beforeEach(() => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it("rejects a negative goal", async () => {
    const response = await PATCH(makeRequest({ monthlyRevenueGoalCents: -100 }));
    expect(response.status).toBe(400);
  });

  it("rejects a non-integer goal", async () => {
    const response = await PATCH(makeRequest({ monthlyRevenueGoalCents: 100.5 }));
    expect(response.status).toBe(400);
  });

  it("accepts null to clear the goal, still gated by Supabase config", async () => {
    const response = await PATCH(makeRequest({ monthlyRevenueGoalCents: null }));
    expect(response.status).toBe(503);
  });

  it("returns 503 when Supabase isn't configured yet", async () => {
    const response = await PATCH(makeRequest({ monthlyRevenueGoalCents: 300000 }));
    expect(response.status).toBe(503);
  });
});
