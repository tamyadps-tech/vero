"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteLeadButton({ contactId }: { contactId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!window.confirm("Remover este contato? Essa ação não pode ser desfeita.")) return;
    setLoading(true);
    const response = await fetch(`/api/professional/crm/leads/${contactId}`, { method: "DELETE" });
    if (response.ok) {
      router.push("/p/dashboard");
      router.refresh();
    } else {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="shrink-0 rounded-xl border border-border px-4 py-2 text-sm text-ink-soft transition hover:border-accent-dark hover:text-accent-dark disabled:opacity-60"
    >
      {loading ? "Removendo…" : "Remover contato"}
    </button>
  );
}
