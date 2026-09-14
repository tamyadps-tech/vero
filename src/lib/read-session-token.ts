import { cookies } from "next/headers";
import { sessionCookieNames, type ActorRole } from "@/lib/auth-session";

/** Lê o access token da sessão (Server Component ou Route Handler). */
export async function readAccessToken(role: ActorRole): Promise<string | undefined> {
  const store = await cookies();
  return store.get(sessionCookieNames(role).access)?.value;
}
