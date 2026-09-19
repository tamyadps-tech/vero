import { describe, it, expect } from "vitest";
import { computeMarketingMetrics } from "./marketing-metrics";

const NOW = new Date("2026-09-20T12:00:00Z");

describe("computeMarketingMetrics", () => {
  it("computes CAC from marketing spend over new clients in the window", () => {
    const result = computeMarketingMetrics(
      [
        { totalPaidCents: 50000, firstSessionAt: "2026-09-05T10:00:00Z" },
        { totalPaidCents: 30000, firstSessionAt: "2026-09-10T10:00:00Z" },
        { totalPaidCents: 20000, firstSessionAt: "2026-07-01T10:00:00Z" }, // fora da janela
      ],
      [
        { amountCents: 20000, category: "Marketing", expenseDate: "2026-09-01" },
        { amountCents: 10000, category: "marketing digital", expenseDate: "2026-09-15" },
        { amountCents: 5000, category: "Aluguel", expenseDate: "2026-09-01" }, // não conta
      ],
      { windowDays: 30, now: NOW }
    );

    expect(result.marketingSpendCents).toBe(30000);
    expect(result.newClientsInWindow).toBe(2);
    expect(result.cacCents).toBe(15000);
  });

  it("returns null CAC when there are no new clients in the window (avoids division by zero)", () => {
    const result = computeMarketingMetrics(
      [{ totalPaidCents: 10000, firstSessionAt: "2026-01-01T10:00:00Z" }],
      [{ amountCents: 20000, category: "Marketing", expenseDate: "2026-09-01" }],
      { windowDays: 30, now: NOW }
    );

    expect(result.newClientsInWindow).toBe(0);
    expect(result.cacCents).toBeNull();
    expect(result.ltvToCacRatio).toBeNull();
  });

  it("computes average and total LTV across all clients regardless of window", () => {
    const result = computeMarketingMetrics(
      [
        { totalPaidCents: 10000, firstSessionAt: null },
        { totalPaidCents: 30000, firstSessionAt: null },
      ],
      [],
      { now: NOW }
    );

    expect(result.totalLtvCents).toBe(40000);
    expect(result.averageLtvCents).toBe(20000);
    expect(result.totalClients).toBe(2);
  });

  it("computes the LTV:CAC ratio when both are available", () => {
    const result = computeMarketingMetrics(
      [
        { totalPaidCents: 90000, firstSessionAt: "2026-09-05T10:00:00Z" },
        { totalPaidCents: 30000, firstSessionAt: "2026-09-10T10:00:00Z" },
      ],
      [{ amountCents: 20000, category: "Marketing", expenseDate: "2026-09-01" }],
      { windowDays: 30, now: NOW }
    );

    // averageLtv = 60000, cac = 10000 -> ratio = 6
    expect(result.ltvToCacRatio).toBe(6);
  });

  it("ignores expenses and clients outside the window, and category matching is case-insensitive", () => {
    const result = computeMarketingMetrics(
      [{ totalPaidCents: 10000, firstSessionAt: "2026-01-01T10:00:00Z" }],
      [{ amountCents: 5000, category: "MARKETING", expenseDate: "2026-01-01" }],
      { windowDays: 30, now: NOW }
    );

    expect(result.marketingSpendCents).toBe(0);
    expect(result.newClientsInWindow).toBe(0);
  });

  it("handles an empty client base without dividing by zero", () => {
    const result = computeMarketingMetrics([], [], { now: NOW });
    expect(result.averageLtvCents).toBe(0);
    expect(result.totalClients).toBe(0);
  });
});
