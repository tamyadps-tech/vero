import { describe, it, expect, beforeEach } from "vitest";
import { POST } from "./route";

function makeRequest(body: Record<string, unknown>) {
  return new Request("http://localhost/api/professional/crm/tasks", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("POST /api/professional/crm/tasks", () => {
  beforeEach(() => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it("rejects a blank title", async () => {
    const response = await POST(makeRequest({ contactId: "abc", title: "" }));
    expect(response.status).toBe(400);
  });

  it("rejects a malformed due date", async () => {
    const response = await POST(
      makeRequest({ contactId: "abc", title: "Ligar de volta", dueDate: "30/09/2026" })
    );
    expect(response.status).toBe(400);
  });

  it("returns 503 when Supabase isn't configured yet", async () => {
    const response = await POST(makeRequest({ contactId: "abc", title: "Ligar de volta" }));
    expect(response.status).toBe(503);
  });
});
