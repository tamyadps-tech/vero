import { getSupabaseAnon } from "@/lib/supabase-anon";

type LoginResult =
  | { session: { access_token: string; refresh_token: string; expires_in: number } }
  | { error: "not_configured" | "invalid_credentials" };

export async function performLogin(email: string, password: string): Promise<LoginResult> {
  const anon = getSupabaseAnon();
  if (!anon) return { error: "not_configured" };

  const { data, error } = await anon.auth.signInWithPassword({ email, password });
  if (error || !data.session) {
    return { error: "invalid_credentials" };
  }

  return {
    session: {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_in: data.session.expires_in,
    },
  };
}
