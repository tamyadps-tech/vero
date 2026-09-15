import { describe, it, expect, beforeEach } from "vitest";
import { DELETE } from "./route";

function makeRequest() {
  return new Request("http://localhost/api/professional/expenses/abc", {
    method: "DELETE",
  });
}

describe("DELETE /api/professional/expenses/[expenseId]", () => {
  beforeEach(() => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it("returns 503 when Supabase isn't configured yet", async () => {
    const response = await DELETE(makeRequest(), { params: Promise.resolve({ expenseId: "abc" }) });
    expect(response.status).toBe(503);
  });
});
