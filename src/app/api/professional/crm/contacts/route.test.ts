import { describe, it, expect, beforeEach } from "vitest";
import { PATCH } from "./route";

function makeRequest(body: Record<string, unknown>) {
  return new Request("http://localhost/api/professional/crm/contacts", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

describe("PATCH /api/professional/crm/contacts", () => {
  beforeEach(() => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it("rejects a body without contactId or clientId", async () => {
    const response = await PATCH(makeRequest({ stage: "lead" }));
    expect(response.status).toBe(400);
  });

  it("rejects an invalid stage", async () => {
    const response = await PATCH(makeRequest({ contactId: "abc", stage: "vip" }));
    expect(response.status).toBe(400);
  });

  it("rejects more than 10 tags", async () => {
    const response = await PATCH(
      makeRequest({ contactId: "abc", tags: Array.from({ length: 11 }, (_, i) => `tag${i}`) })
    );
    expect(response.status).toBe(400);
  });

  it("returns 503 when Supabase isn't configured yet", async () => {
    const response = await PATCH(makeRequest({ contactId: "abc", stage: "contatado" }));
    expect(response.status).toBe(503);
  });
});
