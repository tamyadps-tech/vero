"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * Lê o code_verifier que o supabase-js guardou no localStorage quando
 * `signInWithOAuth` foi chamado (fluxo PKCE).
 *
 * O SDK guarda esse verifier numa "slot" por tentativa de login —
 * `sb-<host>-auth-token-flow-<flowId>-code-verifier` — e passa esse mesmo
 * `flowId` de volta pra gente via `?sb_flow_id=...` na URL de callback.
 * Se a gente ignorar isso e ler sempre a chave fixa antiga
 * (`sb-<host>-auth-token-code-verifier`, que só reflete a tentativa mais
 * recente), qualquer segunda tentativa de login — clique duplo, usuário
 * que voltou e tentou de novo — sobrescreve o verifier da primeira, e a
 * troca do code falha com "code challenge does not match previously
 * saved code verifier" mesmo a tentativa certa tendo funcionado no
 * Google. Por isso lemos a slot do flow específico primeiro, com a chave
 * fixa só como fallback (compatibilidade com versões antigas do SDK).
 *
 * Lemos isso na mão (em vez de chamar `supabase.auth.exchangeCodeForSession`
 * no navegador) porque, nesse projeto, a troca do code direto no
 * navegador vem falhando com um erro de baixo nível do próprio Fetch API
 * do browser antes mesmo de qualquer requisição sair — a troca do code é
 * feita no servidor em vez disso (ver /api/auth/client/google-callback),
 * que já é o mesmo caminho comprovadamente funcional do login por senha.
 */
function readStoredCodeVerifier(flowId: string | null): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;
  try {
    const host = new URL(url).hostname.split(".")[0];
    const storageKey = `sb-${host}-auth-token`;
    const raw =
      (flowId && window.localStorage.getItem(`${storageKey}-flow-${flowId}-code-verifier`)) ||
      window.localStorage.getItem(`${storageKey}-code-verifier`);
    if (!raw) return null;
    return raw.split("/")[0] || null;
  } catch {
    return null;
  }
}

export function GoogleCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const code = searchParams.get("code");
      if (!code) {
        setError("Não foi possível concluir o login com Google.");
        return;
      }

      const codeVerifier = readStoredCodeVerifier(searchParams.get("sb_flow_id"));
      if (!codeVerifier) {
        setError(
          "Não foi possível concluir o login com Google (sessão de login expirou ou foi aberta em outra aba)."
        );
        return;
      }

      const response = await fetch("/api/auth/client/google-callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, codeVerifier }),
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
