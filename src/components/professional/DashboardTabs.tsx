"use client";

import { useState, type ReactNode } from "react";

const TABS = [
  { key: "dashboard", label: "Dashboard" },
  { key: "marketing", label: "Marketing" },
  { key: "financeiro", label: "Financeiro" },
  { key: "agenda", label: "Agenda" },
  { key: "crm", label: "Clientes" },
  { key: "testes", label: "Testes" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export function DashboardTabs(props: Record<TabKey, ReactNode>) {
  const [active, setActive] = useState<TabKey>("dashboard");

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
              onClick={() => setActive(tab.key)}
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
      <div className="mt-6">{props[active]}</div>
    </div>
  );
}
