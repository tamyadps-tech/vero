"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LogoutButton({
  role,
  redirectTo,
}: {
  role: "professional" | "client";
  redirectTo: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleLogout() {
    setPending(true);
    try {
      await fetch(`/api/auth/${role}/logout`, { method: "POST" });
    } finally {
      router.push(redirectTo);
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={pending}
      className="text-xs font-medium text-ink-soft hover:text-ink disabled:opacity-60"
    >
      {pending ? "Saindo…" : "Sair"}
    </button>
  );
}
