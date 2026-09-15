import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { GET } from "./route";

function makeRequest(authorization?: string) {
  const headers = new Headers();
  if (authorization) headers.set("authorization", authorization);
  return new Request("http://localhost/api/cron/session-reminders", { headers });
}

describe("GET /api/cron/session-reminders", () => {
  beforeEach(() => {
    delete process.env.CRON_SECRET;
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  afterEach(() => {
    delete process.env.CRON_SECRET;
  });

  it("rejects a request without CRON_SECRET configured", async () => {
    const response = await GET(makeRequest("Bearer anything"));
    expect(response.status).toBe(401);
  });

  it("rejects a request with the wrong secret", async () => {
    process.env.CRON_SECRET = "correct-secret";
    const response = await GET(makeRequest("Bearer wrong-secret"));
    expect(response.status).toBe(401);
  });

  it("returns 503 when Supabase isn't configured yet", async () => {
    process.env.CRON_SECRET = "correct-secret";
    const response = await GET(makeRequest("Bearer correct-secret"));
    expect(response.status).toBe(503);
  });
});
