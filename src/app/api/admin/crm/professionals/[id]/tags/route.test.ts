import { describe, it, expect, beforeEach } from "vitest";
import { PATCH } from "./route";

function makeRequest(body: Record<string, unknown>) {
  return new Request("http://localhost/api/admin/crm/professionals/abc/tags", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

function makeParams() {
  return { params: Promise.resolve({ id: "abc" }) };
}

describe("PATCH /api/admin/crm/professionals/[id]/tags", () => {
  beforeEach(() => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it("rejects a non-array tags field", async () => {
    const response = await PATCH(makeRequest({ tags: "prioridade" }), makeParams());
    expect(response.status).toBe(400);
  });

  it("rejects more than 10 tags", async () => {
    const response = await PATCH(
      makeRequest({ tags: Array.from({ length: 11 }, (_, i) => `tag${i}`) }),
      makeParams()
    );
    expect(response.status).toBe(400);
  });

  it("returns 503 when Supabase isn't configured yet", async () => {
    const response = await PATCH(makeRequest({ tags: ["prioridade"] }), makeParams());
    expect(response.status).toBe(503);
  });
});
