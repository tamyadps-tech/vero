import { describe, it, expect } from "vitest";
import { contactsToCsv } from "./crm-csv";
import type { CrmContactSummary } from "./professional-crm";

function makeContact(overrides: Partial<CrmContactSummary> = {}): CrmContactSummary {
  return {
    id: "contact-1",
    clientId: "client-1",
    fullName: "Maria Silva",
    email: "maria@example.com",
    phone: "+5511999999999",
    stage: "cliente_ativo",
    tags: [],
    isLead: false,
    sessionCount: 3,
    lastSessionAt: "2026-01-15T10:00:00.000Z",
    totalPaidCents: 45000,
    engagementStatus: "ativo",
    ...overrides,
  };
}

describe("contactsToCsv", () => {
  it("includes the header row and one row per contact", () => {
    const csv = contactsToCsv([makeContact()]);
    const lines = csv.split("\n");
    expect(lines[0]).toContain("Nome,Email,Telefone");
    expect(lines).toHaveLength(2);
    expect(lines[1]).toContain("Maria Silva");
    expect(lines[1]).toContain("maria@example.com");
    expect(lines[1]).toContain("450,00");
  });

  it("quotes fields containing commas", () => {
    const csv = contactsToCsv([makeContact({ fullName: "Silva, Maria" })]);
    expect(csv).toContain('"Silva, Maria"');
  });

  it("escapes embedded quotes", () => {
    const csv = contactsToCsv([makeContact({ fullName: 'Maria "Mia" Silva' })]);
    expect(csv).toContain('"Maria ""Mia"" Silva"');
  });

  it("returns just the header when there are no contacts", () => {
    const csv = contactsToCsv([]);
    expect(csv.split("\n")).toHaveLength(1);
  });
});
