import { describe, it, expect } from "vitest";
import { getMonthProgress, projectMonthEnd, isInCurrentMonth } from "./financial-projection";

describe("getMonthProgress", () => {
  it("computes days elapsed and days in a 30-day month", () => {
    const progress = getMonthProgress(new Date("2026-09-10T12:00:00"));
    expect(progress.daysElapsed).toBe(10);
    expect(progress.daysInMonth).toBe(30);
  });

  it("computes days in February on a leap year", () => {
    const progress = getMonthProgress(new Date("2028-02-15T12:00:00"));
    expect(progress.daysInMonth).toBe(29);
  });
});

describe("projectMonthEnd", () => {
  it("scales realized value linearly to the full month", () => {
    // 10000 realizado em 10 dias, mês de 30 dias -> projeta 30000
    const result = projectMonthEnd(10000, { daysElapsed: 10, daysInMonth: 30 });
    expect(result).toBe(30000);
  });

  it("returns 0 when no days have elapsed (avoids division by zero)", () => {
    const result = projectMonthEnd(5000, { daysElapsed: 0, daysInMonth: 30 });
    expect(result).toBe(0);
  });

  it("projects the same value on the last day of the month", () => {
    const result = projectMonthEnd(45000, { daysElapsed: 30, daysInMonth: 30 });
    expect(result).toBe(45000);
  });
});

describe("isInCurrentMonth", () => {
  it("matches a date in the same month and year", () => {
    const now = new Date("2026-09-15T12:00:00");
    expect(isInCurrentMonth("2026-09-01T10:00:00", now)).toBe(true);
    expect(isInCurrentMonth("2026-09-30T23:59:00", now)).toBe(true);
  });

  it("rejects a date in a different month or year", () => {
    const now = new Date("2026-09-15T12:00:00");
    expect(isInCurrentMonth("2026-08-31T23:59:00", now)).toBe(false);
    expect(isInCurrentMonth("2025-09-15T12:00:00", now)).toBe(false);
  });
});
