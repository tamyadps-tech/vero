import { describe, it, expect, beforeEach } from "vitest";
import { POST, GET } from "./route";

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/professional/clients/client-1/assessments", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

function makeGetRequest(templateSlug: string) {
  return new Request(
    `http://localhost/api/professional/clients/client-1/assessments?templateSlug=${templateSlug}`
  );
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

describe("GET /api/professional/clients/[clientId]/assessments", () => {
  beforeEach(() => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it("rejects an unknown template", async () => {
    const response = await GET(makeGetRequest("nao-existe"), params);
    expect(response.status).toBe(400);
  });

  it("returns 503 when Supabase isn't configured yet", async () => {
    const response = await GET(makeGetRequest("phq9"), params);
    expect(response.status).toBe(503);
  });
});
