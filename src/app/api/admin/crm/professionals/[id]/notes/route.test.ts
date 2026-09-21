import { describe, it, expect, beforeEach } from "vitest";
import { POST } from "./route";

function makeRequest(body: Record<string, unknown>) {
  return new Request("http://localhost/api/admin/crm/professionals/abc/notes", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

function makeParams() {
  return { params: Promise.resolve({ id: "abc" }) };
}

describe("POST /api/admin/crm/professionals/[id]/notes", () => {
  beforeEach(() => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it("rejects a blank note", async () => {
    const response = await POST(makeRequest({ body: "   " }), makeParams());
    expect(response.status).toBe(400);
  });

  it("returns 503 when Supabase isn't configured yet", async () => {
    const response = await POST(makeRequest({ body: "Ligou hoje." }), makeParams());
    expect(response.status).toBe(503);
  });
});
