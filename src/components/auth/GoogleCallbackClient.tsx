"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

export function GoogleCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setError("Login com Google ainda não está configurado.");
        return;
      }

      const code = searchParams.get("code");
      if (!code) {
        setError("Não foi possível concluir o login com Google.");
        return;
      }

      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      if (cancelled) return;
      if (exchangeError || !data.session) {
        setError("Não foi possível concluir o login com Google.");
        return;
      }

      const response = await fetch("/api/auth/client/google-callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_in: data.session.expires_in,
        }),
      });
      if (cancelled) return;

      if (!response.ok) {
        const responseBody = await response.json().catch(() => ({}));
        setError(responseBody.error ?? "Não foi possível concluir o login com Google.");
        return;
      }

      router.replace(searchParams.get("redirectTo") || "/c/dashboard");
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  return (
    <div className="text-center">
      <p className="text-sm text-ink-soft">{error || "Entrando com Google…"}</p>
      {error && (
        <Link href="/c/entrar" className="mt-3 inline-block text-sm text-primary hover:underline">
          Voltar pro login
        </Link>
      )}
    </div>
  );
}
