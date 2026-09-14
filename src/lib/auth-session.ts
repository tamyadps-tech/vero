import type { NextResponse } from "next/server";

export type ActorRole = "professional" | "client";

const REFRESH_MAX_AGE = 60 * 60 * 24 * 30; // 30 dias

export function sessionCookieNames(role: ActorRole) {
  return {
    access: `vero_${role}_at`,
    refresh: `vero_${role}_rt`,
  };
}

interface SessionTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

/** Grava os cookies httpOnly de sessão na resposta. */
export function setSessionCookies(
  response: NextResponse,
  role: ActorRole,
  session: SessionTokens
) {
  const { access, refresh } = sessionCookieNames(role);
  response.cookies.set(access, session.access_token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: session.expires_in,
  });
  response.cookies.set(refresh, session.refresh_token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: REFRESH_MAX_AGE,
  });
}

export function clearSessionCookies(response: NextResponse, role: ActorRole) {
  const { access, refresh } = sessionCookieNames(role);
  response.cookies.delete(access);
  response.cookies.delete(refresh);
}
