import { describe, it, expect, beforeEach } from "vitest";
import { POST } from "./route";

const VALID_BODY = {
  access_token: "token-abc",
  refresh_token: "refresh-abc",
  expires_in: 3600,
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

  it("rejects a missing access_token", async () => {
    const response = await POST(makeRequest({ ...VALID_BODY, access_token: undefined }));
    expect(response.status).toBe(400);
  });

  it("rejects a missing refresh_token", async () => {
    const response = await POST(makeRequest({ ...VALID_BODY, refresh_token: undefined }));
    expect(response.status).toBe(400);
  });

  it("rejects a non-numeric expires_in", async () => {
    const response = await POST(makeRequest({ ...VALID_BODY, expires_in: "3600" }));
    expect(response.status).toBe(400);
  });

  it("returns 503 when Supabase isn't configured yet", async () => {
    const response = await POST(makeRequest(VALID_BODY));
    expect(response.status).toBe(503);
  });
});
