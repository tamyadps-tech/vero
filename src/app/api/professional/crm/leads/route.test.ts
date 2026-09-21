import { describe, it, expect, beforeEach } from "vitest";
import { POST } from "./route";

const VALID_BODY = { fullName: "Maria Souza", email: "maria@example.com" };

function makeRequest(body: Record<string, unknown>) {
  return new Request("http://localhost/api/professional/crm/leads", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("POST /api/professional/crm/leads", () => {
  beforeEach(() => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it("rejects a short name", async () => {
    const response = await POST(makeRequest({ ...VALID_BODY, fullName: "M" }));
    expect(response.status).toBe(400);
  });

  it("rejects an invalid email", async () => {
    const response = await POST(makeRequest({ ...VALID_BODY, email: "not-an-email" }));
    expect(response.status).toBe(400);
  });

  it("returns 503 when Supabase isn't configured yet", async () => {
    const response = await POST(makeRequest(VALID_BODY));
    expect(response.status).toBe(503);
  });
});
