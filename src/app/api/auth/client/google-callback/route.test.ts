import { describe, it, expect, beforeEach } from "vitest";
import { POST } from "./route";

const VALID_BODY = {
  code: "code-abc",
  codeVerifier: "verifier-abc",
};

function makeRequest(body: Record<string, unknown>) {
  return new Request("http://localhost/api/auth/client/google-callback", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/client/google-callback", () => {
  beforeEach(() => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.SUPABASE_ANON_KEY;
  });

  it("rejects a missing code", async () => {
    const response = await POST(makeRequest({ ...VALID_BODY, code: undefined }));
    expect(response.status).toBe(400);
  });

  it("rejects a missing codeVerifier", async () => {
    const response = await POST(makeRequest({ ...VALID_BODY, codeVerifier: undefined }));
    expect(response.status).toBe(400);
  });

  it("returns 503 when Supabase isn't configured yet", async () => {
    const response = await POST(makeRequest(VALID_BODY));
    expect(response.status).toBe(503);
  });
});
