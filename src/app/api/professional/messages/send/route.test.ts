import { describe, it, expect, beforeEach } from "vitest";
import { POST } from "./route";

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/professional/messages/send", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("POST /api/professional/messages/send", () => {
  beforeEach(() => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it("rejects an empty client list", async () => {
    const response = await POST(
      makeRequest({ token: "any-token", clientIds: [], subject: "Oi", message: "Olá!" })
    );
    expect(response.status).toBe(400);
  });

  it("rejects more than 50 recipients", async () => {
    const clientIds = Array.from({ length: 51 }, (_, i) => `client-${i}`);
    const response = await POST(
      makeRequest({ token: "any-token", clientIds, subject: "Oi", message: "Olá!" })
    );
    expect(response.status).toBe(400);
  });

  it("rejects an empty subject", async () => {
    const response = await POST(
      makeRequest({
        token: "any-token",
        clientIds: ["client-1"],
        subject: "",
        message: "Olá!",
      })
    );
    expect(response.status).toBe(400);
  });

  it("rejects an empty message", async () => {
    const response = await POST(
      makeRequest({
        token: "any-token",
        clientIds: ["client-1"],
        subject: "Oi",
        message: "",
      })
    );
    expect(response.status).toBe(400);
  });

  it("returns 503 when Supabase isn't configured yet", async () => {
    const response = await POST(
      makeRequest({
        token: "any-token",
        clientIds: ["client-1"],
        subject: "Novidade",
        message: "Tenho um horário novo essa semana!",
      })
    );
    expect(response.status).toBe(503);
  });
});
