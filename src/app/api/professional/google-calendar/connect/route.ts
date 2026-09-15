import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getProfessionalIdFromAccessToken } from "@/lib/professional-session";
import { readAccessToken } from "@/lib/read-session-token";
import { getGoogleCalendarAuthUrl } from "@/lib/google-calendar";

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const redirectUri = `${origin}/api/professional/google-calendar/callback`;
  const state = randomUUID();

  // Confere a configuração antes da sessão: sem isso, nem vale a pena
  // checar login — a integração não está disponível de qualquer jeito.
  const authUrl = getGoogleCalendarAuthUrl(state, redirectUri);
  if (!authUrl) {
    return NextResponse.json(
      { error: "Integração com Google Calendar ainda não está configurada." },
      { status: 503 }
    );
  }

  const accessToken = await readAccessToken("professional");
  const professionalId = await getProfessionalIdFromAccessToken(accessToken);
  if (!professionalId) {
    return NextResponse.redirect(new URL("/p/entrar", request.url));
  }

  const response = NextResponse.redirect(authUrl);
  response.cookies.set("vero_gcal_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return response;
}
