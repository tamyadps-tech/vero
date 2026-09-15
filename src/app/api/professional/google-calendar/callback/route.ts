import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getProfessionalIdFromAccessToken } from "@/lib/professional-session";
import { readAccessToken } from "@/lib/read-session-token";
import { exchangeGoogleCalendarCode } from "@/lib/google-calendar";

export async function GET(request: Request) {
  const accessToken = await readAccessToken("professional");
  const professionalId = await getProfessionalIdFromAccessToken(accessToken);
  if (!professionalId) {
    return NextResponse.redirect(new URL("/p/entrar", request.url));
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  const cookieStore = await cookies();
  const savedState = cookieStore.get("vero_gcal_state")?.value;

  const errorRedirect = new URL("/p/dashboard?gcal=erro", request.url);

  if (!code || !state || !savedState || state !== savedState) {
    return NextResponse.redirect(errorRedirect);
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.redirect(errorRedirect);
  }

  const origin = new URL(request.url).origin;
  const redirectUri = `${origin}/api/professional/google-calendar/callback`;
  const result = await exchangeGoogleCalendarCode(code, redirectUri);
  if (!result) {
    return NextResponse.redirect(errorRedirect);
  }

  const { error } = await supabase
    .from("professionals")
    .update({
      google_calendar_refresh_token: result.refreshToken,
      google_calendar_email: result.email,
    })
    .eq("id", professionalId);

  if (error) {
    console.error("[google-calendar/callback] Failed to save tokens:", error.message);
    return NextResponse.redirect(errorRedirect);
  }

  const response = NextResponse.redirect(new URL("/p/dashboard?gcal=conectado", request.url));
  response.cookies.delete("vero_gcal_state");
  return response;
}
