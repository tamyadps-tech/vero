import { describe, it, expect, beforeEach } from "vitest";
import { PATCH } from "./route";

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/admin/professionals/abc", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

describe("PATCH /api/admin/professionals/[id]", () => {
  beforeEach(() => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it("rejects an invalid action", async () => {
    const response = await PATCH(makeRequest({ action: "deletar" }), {
      params: Promise.resolve({ id: "abc" }),
    });
    expect(response.status).toBe(400);
  });

  it("returns 503 when Supabase isn't configured yet", async () => {
    const response = await PATCH(makeRequest({ action: "aprovar" }), {
      params: Promise.resolve({ id: "abc" }),
    });
    expect(response.status).toBe(503);
  });

  it("rejects an invalid meeting date", async () => {
    const response = await PATCH(
      makeRequest({ action: "agendar_reuniao", scheduledAt: "not-a-date" }),
      { params: Promise.resolve({ id: "abc" }) }
    );
    expect(response.status).toBe(400);
  });

  it("returns 503 for a valid meeting request when Supabase isn't configured yet", async () => {
    const response = await PATCH(
      makeRequest({ action: "agendar_reuniao", scheduledAt: "2026-06-17T14:00:00.000Z" }),
      { params: Promise.resolve({ id: "abc" }) }
    );
    expect(response.status).toBe(503);
  });
});
