import { CRM_STAGE_LABELS, type CrmContactSummary } from "@/lib/professional-crm";

function csvField(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function formatPrice(cents: number) {
  return (cents / 100).toFixed(2).replace(".", ",");
}

const CSV_HEADER = [
  "Nome",
  "Email",
  "Telefone",
  "Estágio",
  "Tags",
  "É lead",
  "Sessões",
  "LTV (R$)",
  "Última sessão",
  "Engajamento",
];

/** Puro — sem I/O, fácil de testar. Usado pela rota de exportação do CRM. */
export function contactsToCsv(contacts: CrmContactSummary[]): string {
  const rows = contacts.map((c) =>
    [
      c.fullName,
      c.email,
      c.phone ?? "",
      CRM_STAGE_LABELS[c.stage],
      c.tags.join("; "),
      c.isLead ? "sim" : "não",
      String(c.sessionCount),
      formatPrice(c.totalPaidCents),
      c.lastSessionAt ? c.lastSessionAt.slice(0, 10) : "",
      c.engagementStatus ?? "",
    ]
      .map(csvField)
      .join(",")
  );

  return [CSV_HEADER.join(","), ...rows].join("\n");
}
