import { describe, it, expect, beforeEach } from "vitest";
import { POST } from "./route";

const VALID_BODY = {
  accessToken: "access-abc",
  refreshToken: "refresh-abc",
  expiresIn: 3600,
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

  it("rejects a missing accessToken", async () => {
    const response = await POST(makeRequest({ ...VALID_BODY, accessToken: undefined }));
    expect(response.status).toBe(400);
  });

  it("rejects a missing refreshToken", async () => {
    const response = await POST(makeRequest({ ...VALID_BODY, refreshToken: undefined }));
    expect(response.status).toBe(400);
  });

  it("returns 503 when Supabase isn't configured yet", async () => {
    const response = await POST(makeRequest(VALID_BODY));
    expect(response.status).toBe(503);
  });
});
