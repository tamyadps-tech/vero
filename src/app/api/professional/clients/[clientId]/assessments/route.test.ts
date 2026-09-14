import { describe, it, expect, beforeEach } from "vitest";
import { POST } from "./route";

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/professional/clients/client-1/assessments", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

const params = { params: Promise.resolve({ clientId: "client-1" }) };

describe("POST /api/professional/clients/[clientId]/assessments", () => {
  beforeEach(() => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it("rejects an unknown template", async () => {
    const response = await POST(
      makeRequest({ templateSlug: "nao-existe", released: true }),
      params
    );
    expect(response.status).toBe(400);
  });

  it("rejects a non-boolean released flag", async () => {
    const response = await POST(
      makeRequest({ templateSlug: "phq9", released: "sim" }),
      params
    );
    expect(response.status).toBe(400);
  });

  it("returns 503 when Supabase isn't configured yet", async () => {
    const response = await POST(
      makeRequest({ templateSlug: "phq9", released: true }),
      params
    );
    expect(response.status).toBe(503);
  });
});
