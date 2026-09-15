import { describe, it, expect, beforeEach } from "vitest";
import { PATCH } from "./route";

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/client/profile", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

describe("PATCH /api/client/profile", () => {
  beforeEach(() => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it("rejects a name that's too short", async () => {
    const response = await PATCH(makeRequest({ fullName: "Jo" }));
    expect(response.status).toBe(400);
  });

  it("rejects a new password that's too short", async () => {
    const response = await PATCH(
      makeRequest({ currentPassword: "senha1234", newPassword: "123" })
    );
    expect(response.status).toBe(400);
  });

  it("rejects a password change without the current password", async () => {
    const response = await PATCH(makeRequest({ newPassword: "novasenha123" }));
    expect(response.status).toBe(400);
  });

  it("rejects an invalid phone number", async () => {
    const response = await PATCH(makeRequest({ phoneNumber: "11999998888" }));
    expect(response.status).toBe(400);
  });

  it("returns 503 when Supabase isn't configured yet", async () => {
    const response = await PATCH(makeRequest({ fullName: "Maria Silva" }));
    expect(response.status).toBe(503);
  });
});
