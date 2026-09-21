"use client";

import { useMemo, useState } from "react";
import type { AdminClientDirectoryRow } from "@/lib/admin-clients";

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });

export function AdminClientDirectory({ rows }: { rows: AdminClientDirectoryRow[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (row) =>
        row.fullName.toLowerCase().includes(q) ||
        row.email.toLowerCase().includes(q) ||
        row.professionalNames.some((name) => name.toLowerCase().includes(q))
    );
  }, [rows, query]);

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar por nome, email ou profissional…"
        className="w-full max-w-sm rounded-xl border border-border bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink-soft/70 focus:border-primary focus:outline-none"
      />
      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-ink-soft">Nenhum cliente com sessão registrada ainda.</p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-paper-alt/60 text-xs uppercase tracking-wide text-ink-soft">
              <tr>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Profissionais</th>
                <th className="px-4 py-3">Sessões</th>
                <th className="px-4 py-3">LTV</th>
                <th className="px-4 py-3">Última sessão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-3">
                    <p className="text-ink">{row.fullName}</p>
                    <p className="text-xs text-ink-soft">{row.email}</p>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{row.professionalNames.join(", ")}</td>
                  <td className="px-4 py-3 text-ink-soft">{row.sessionCount}</td>
                  <td className="px-4 py-3 text-ink-soft">{formatPrice(row.totalPaidCents)}</td>
                  <td className="px-4 py-3 text-ink-soft">
                    {row.lastSessionAt ? dateFormatter.format(new Date(row.lastSessionAt)) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
