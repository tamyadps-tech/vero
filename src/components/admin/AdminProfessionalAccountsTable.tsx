"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { AdminProfessionalAccount } from "@/lib/admin-professional-crm";
import { SUBSCRIPTION_PLANS } from "@/lib/subscription-plans";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });

const VETTING_LABELS: Record<string, string> = {
  pendente: "Pendente",
  aprovado: "Aprovado",
  rejeitado: "Rejeitado",
};

const SUBSCRIPTION_STATUS_LABELS: Record<string, string> = {
  ativa: "Ativa",
  inadimplente: "Inadimplente",
  cancelada: "Cancelada",
};

export function AdminProfessionalAccountsTable({ accounts }: { accounts: AdminProfessionalAccount[] }) {
  const [planFilter, setPlanFilter] = useState<string>("todos");
  const [vettingFilter, setVettingFilter] = useState<string>("todos");

  const filtered = useMemo(() => {
    return accounts.filter((a) => {
      if (planFilter === "sem_plano" && a.subscriptionPlan) return false;
      if (planFilter !== "todos" && planFilter !== "sem_plano" && a.subscriptionPlan !== planFilter) {
        return false;
      }
      if (vettingFilter !== "todos" && a.vettingStatus !== vettingFilter) return false;
      return true;
    });
  }, [accounts, planFilter, vettingFilter]);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          className="rounded-lg border border-border bg-paper px-3 py-1.5 text-xs text-ink"
        >
          <option value="todos">Todos os planos</option>
          <option value="sem_plano">Sem plano</option>
          {SUBSCRIPTION_PLANS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <select
          value={vettingFilter}
          onChange={(e) => setVettingFilter(e.target.value)}
          className="rounded-lg border border-border bg-paper px-3 py-1.5 text-xs text-ink"
        >
          <option value="todos">Todos os status de vetting</option>
          <option value="pendente">Pendente</option>
          <option value="aprovado">Aprovado</option>
          <option value="rejeitado">Rejeitado</option>
        </select>
      </div>

      {accounts.length === 0 ? (
        <p className="mt-4 text-sm text-ink-soft">Nenhum profissional cadastrado ainda.</p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-paper-alt/60 text-xs uppercase tracking-wide text-ink-soft">
              <tr>
                <th className="px-4 py-3">Profissional</th>
                <th className="px-4 py-3">Vetting</th>
                <th className="px-4 py-3">Plano</th>
                <th className="px-4 py-3">Tags</th>
                <th className="px-4 py-3">Notas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((account) => (
                <tr key={account.id}>
                  <td className="px-4 py-3">
                    <Link href={`/admin/crm/${account.id}`} className="text-primary hover:underline">
                      {account.fullName}
                    </Link>
                    <p className="text-xs text-ink-soft">{account.email}</p>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{VETTING_LABELS[account.vettingStatus]}</td>
                  <td className="px-4 py-3 text-ink-soft">
                    {account.subscriptionPlan
                      ? `${SUBSCRIPTION_PLANS.find((p) => p.id === account.subscriptionPlan)?.name} (${
                          SUBSCRIPTION_STATUS_LABELS[account.subscriptionStatus ?? ""] ?? "—"
                        })`
                      : "Sem plano"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {account.tags.length === 0 ? (
                        <span className="text-xs text-ink-soft">—</span>
                      ) : (
                        account.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-paper-alt px-2 py-0.5 text-[11px] text-ink-soft"
                          >
                            {tag}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">
                    {account.notesCount > 0
                      ? `${account.notesCount} · última em ${dateFormatter.format(new Date(account.lastNoteAt!))}`
                      : "—"}
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
