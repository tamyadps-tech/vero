import { describe, it, expect, beforeEach } from "vitest";
import { POST } from "./route";

const VALID_BODY = {
  description: "Assinatura Supabase",
  amountCents: 12500,
  kind: "fixo",
  expenseDate: "2026-09-01",
};

function makeRequest(body: Record<string, unknown>) {
  return new Request("http://localhost/api/admin/expenses", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("POST /api/admin/expenses", () => {
  beforeEach(() => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it("rejects an empty description", async () => {
    const response = await POST(makeRequest({ ...VALID_BODY, description: "  " }));
    expect(response.status).toBe(400);
  });

  it("rejects a kind that isn't 'fixo' or 'variavel'", async () => {
    const response = await POST(makeRequest({ ...VALID_BODY, kind: "outro" }));
    expect(response.status).toBe(400);
  });

  it("rejects a negative amount", async () => {
    const response = await POST(makeRequest({ ...VALID_BODY, amountCents: -100 }));
    expect(response.status).toBe(400);
  });

  it("rejects a malformed date", async () => {
    const response = await POST(makeRequest({ ...VALID_BODY, expenseDate: "01/09/2026" }));
    expect(response.status).toBe(400);
  });

  it("returns 503 when Supabase isn't configured yet", async () => {
    const response = await POST(makeRequest(VALID_BODY));
    expect(response.status).toBe(503);
  });
});
