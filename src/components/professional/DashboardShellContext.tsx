"use client";

import { createContext, useContext, useCallback, useState, type ReactNode } from "react";

interface DashboardShellState {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingCampaignClientIds: string[] | null;
  requestCampaignFor: (clientIds: string[]) => void;
  clearPendingCampaign: () => void;
}

const DashboardShellContext = createContext<DashboardShellState | null>(null);

/**
 * Estado compartilhado entre as abas do painel do profissional — hoje só
 * pra uma coisa: deixar o filtro do CRM abrir a aba Marketing já com os
 * clientes filtrados pré-selecionados, sem precisar re-selecionar tudo
 * de novo numa tela separada.
 */
export function DashboardShellProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [pendingCampaignClientIds, setPendingCampaignClientIds] = useState<string[] | null>(null);

  const requestCampaignFor = useCallback((clientIds: string[]) => {
    setPendingCampaignClientIds(clientIds);
    setActiveTab("marketing");
  }, []);

  const clearPendingCampaign = useCallback(() => {
    setPendingCampaignClientIds(null);
  }, []);

  return (
    <DashboardShellContext.Provider
      value={{
        activeTab,
        setActiveTab,
        pendingCampaignClientIds,
        requestCampaignFor,
        clearPendingCampaign,
      }}
    >
      {children}
    </DashboardShellContext.Provider>
  );
}

export function useDashboardShell() {
  const ctx = useContext(DashboardShellContext);
  if (!ctx) {
    throw new Error("useDashboardShell precisa estar dentro de um DashboardShellProvider");
  }
  return ctx;
}
