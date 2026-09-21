"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

interface HashTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Fluxo implícito: o Supabase devolve o token pronto no fragmento (#) da
 * própria URL de callback, não um "code" pra trocar — ver o comentário
 * em getSupabaseBrowserClient sobre por que não usamos PKCE aqui.
 */
function readTokensFromHash(): HashTokens | null {
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  if (!accessToken || !refreshToken) return null;
  return { accessToken, refreshToken, expiresIn: Number(params.get("expires_in")) || 3600 };
}

export function GoogleCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const hashError = hashParams.get("error_description") || hashParams.get("error");
      if (hashError) {
        setError(`Não foi possível concluir o login com Google. (${hashError})`);
        return;
      }

      const tokens = readTokensFromHash();
      if (!tokens) {
        setError("Não foi possível concluir o login com Google. Tente novamente.");
        return;
      }

      const response = await fetch("/api/auth/client/google-callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: tokens.expiresIn,
        }),
      });
      if (cancelled) return;

      if (!response.ok) {
        const responseBody = await response.json().catch(() => ({}));
        console.error(
          "[GoogleCallbackClient] /api/auth/client/google-callback failed:",
          response.status,
          responseBody
        );
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
