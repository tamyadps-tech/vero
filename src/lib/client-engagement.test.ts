import { describe, it, expect } from "vitest";
import { computeEngagementStatus } from "./client-engagement";

const now = new Date("2026-09-14T12:00:00Z");

describe("computeEngagementStatus", () => {
  it("is always ativo when there's an upcoming session, regardless of history", () => {
    expect(
      computeEngagementStatus({
        lastSessionAt: "2020-01-01T12:00:00Z",
        hasUpcomingSession: true,
        now,
      })
    ).toBe("ativo");
  });

  it("is inativo when there's no session at all", () => {
    expect(
      computeEngagementStatus({ lastSessionAt: null, hasUpcomingSession: false, now })
    ).toBe("inativo");
  });

  it("is ativo within 60 days of the last session", () => {
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86_400_000).toISOString();
    expect(
      computeEngagementStatus({
        lastSessionAt: thirtyDaysAgo,
        hasUpcomingSession: false,
        now,
      })
    ).toBe("ativo");
  });

  it("is em_risco between 60 and 120 days since the last session", () => {
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 86_400_000).toISOString();
    expect(
      computeEngagementStatus({
        lastSessionAt: ninetyDaysAgo,
        hasUpcomingSession: false,
        now,
      })
    ).toBe("em_risco");
  });

  it("is inativo after 120 days since the last session", () => {
    const longAgo = new Date(now.getTime() - 200 * 86_400_000).toISOString();
    expect(
      computeEngagementStatus({ lastSessionAt: longAgo, hasUpcomingSession: false, now })
    ).toBe("inativo");
  });

  it("treats exactly 60 days as still ativo (boundary)", () => {
    const exactly60 = new Date(now.getTime() - 60 * 86_400_000).toISOString();
    expect(
      computeEngagementStatus({
        lastSessionAt: exactly60,
        hasUpcomingSession: false,
        now,
      })
    ).toBe("ativo");
  });

  it("treats exactly 120 days as still em_risco (boundary)", () => {
    const exactly120 = new Date(now.getTime() - 120 * 86_400_000).toISOString();
    expect(
      computeEngagementStatus({
        lastSessionAt: exactly120,
        hasUpcomingSession: false,
        now,
      })
    ).toBe("em_risco");
  });
});
