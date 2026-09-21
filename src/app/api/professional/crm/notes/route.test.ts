import { describe, it, expect, beforeEach } from "vitest";
import { POST } from "./route";

function makeRequest(body: Record<string, unknown>) {
  return new Request("http://localhost/api/professional/crm/notes", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("POST /api/professional/crm/notes", () => {
  beforeEach(() => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it("rejects a blank note", async () => {
    const response = await POST(makeRequest({ contactId: "abc", body: "   " }));
    expect(response.status).toBe(400);
  });

  it("rejects a body without contactId or clientId", async () => {
    const response = await POST(makeRequest({ body: "Ligou hoje, remarcar semana que vem." }));
    expect(response.status).toBe(400);
  });

  it("returns 503 when Supabase isn't configured yet", async () => {
    const response = await POST(makeRequest({ contactId: "abc", body: "Ligou hoje." }));
    expect(response.status).toBe(503);
  });
});
