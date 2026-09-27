"use client";

import type { ReactNode } from "react";
import { useDashboardShell } from "@/components/professional/DashboardShellContext";

const TABS = [
  { key: "dashboard", label: "Dashboard" },
  { key: "agendaMkt", label: "Agenda & mkt" },
  { key: "financeiro", label: "Financeiro" },
  { key: "crm", label: "Clientes" },
  { key: "testes", label: "Testes" },
  { key: "exercicios", label: "Exercícios" },
  { key: "metodo", label: "Método" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function isTabKey(value: string): value is TabKey {
  return TABS.some((tab) => tab.key === value);
}

export function DashboardTabs(props: Record<TabKey, ReactNode>) {
  const { activeTab, setActiveTab } = useDashboardShell();
  const active: TabKey = isTabKey(activeTab) ? activeTab : "dashboard";

  return (
    <div className="mt-8">
      <div role="tablist" className="flex gap-1 overflow-x-auto border-b border-border">
        {TABS.map((tab) => {
          const isActive = active === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.key)}
              className={`shrink-0 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "border-primary text-primary-dark"
                  : "border-transparent text-ink-soft hover:text-ink"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div key={active} className="mt-6 animate-fade-in-up motion-reduce:animate-none">
        {props[active]}
      </div>
    </div>
  );
}
