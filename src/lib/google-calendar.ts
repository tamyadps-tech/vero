const SCOPE = "https://www.googleapis.com/auth/calendar.events";
const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";
const FREEBUSY_URL = "https://www.googleapis.com/calendar/v3/freeBusy";
const EVENTS_URL = "https://www.googleapis.com/calendar/v3/calendars/primary/events";

function getCredentials(): { clientId: string; clientSecret: string } | null {
  const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;
  return { clientId, clientSecret };
}

/** Retorna null se GOOGLE_CALENDAR_CLIENT_ID não estiver configurado. */
export function getGoogleCalendarAuthUrl(state: string, redirectUri: string): string | null {
  const credentials = getCredentials();
  if (!credentials) return null;

  const params = new URLSearchParams({
    client_id: credentials.clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPE,
    access_type: "offline",
    prompt: "consent",
    state,
  });
  return `${AUTH_URL}?${params.toString()}`;
}

/** Troca o code do OAuth pelo refresh token + email da conta conectada. Retorna null se falhar. */
export async function exchangeGoogleCalendarCode(
  code: string,
  redirectUri: string
): Promise<{ refreshToken: string; email: string } | null> {
  const credentials = getCredentials();
  if (!credentials) return null;

  try {
    const tokenResponse = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: credentials.clientId,
        client_secret: credentials.clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
    if (!tokenResponse.ok) {
      console.error("[google-calendar] Token exchange failed:", await tokenResponse.text());
      return null;
    }
    const tokenData = (await tokenResponse.json()) as {
      access_token: string;
      refresh_token?: string;
    };
    if (!tokenData.refresh_token) {
      // Sem refresh_token — provavelmente a conta já tinha autorizado antes
      // sem "prompt=consent" ter efeito. Quem chamou deve orientar o
      // profissional a desconectar no Google e tentar de novo.
      return null;
    }

    const userInfoResponse = await fetch(USERINFO_URL, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userInfo = (await userInfoResponse.json().catch(() => ({}))) as { email?: string };

    return { refreshToken: tokenData.refresh_token, email: userInfo.email ?? "" };
  } catch (error) {
    console.error("[google-calendar] Failed to exchange code:", error);
    return null;
  }
}

/** Pede um access token novo a partir do refresh token salvo. Retorna null se falhar. */
export async function getGoogleCalendarAccessToken(
  refreshToken: string
): Promise<string | null> {
  const credentials = getCredentials();
  if (!credentials) return null;

  try {
    const response = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        client_id: credentials.clientId,
        client_secret: credentials.clientSecret,
        grant_type: "refresh_token",
      }),
    });
    if (!response.ok) {
      console.error("[google-calendar] Failed to refresh access token:", await response.text());
      return null;
    }
    const data = (await response.json()) as { access_token: string };
    return data.access_token;
  } catch (error) {
    console.error("[google-calendar] Failed to refresh access token:", error);
    return null;
  }
}

export interface BusyInterval {
  start: string;
  end: string;
}

/** Blocos ocupados na agenda principal do profissional, entre timeMin e timeMax. */
export async function listBusyIntervals(
  accessToken: string,
  timeMinIso: string,
  timeMaxIso: string
): Promise<BusyInterval[]> {
  try {
    const response = await fetch(FREEBUSY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        timeMin: timeMinIso,
        timeMax: timeMaxIso,
        items: [{ id: "primary" }],
      }),
    });
    if (!response.ok) {
      console.error("[google-calendar] freeBusy query failed:", await response.text());
      return [];
    }
    const data = (await response.json()) as {
      calendars?: { primary?: { busy?: BusyInterval[] } };
    };
    return data.calendars?.primary?.busy ?? [];
  } catch (error) {
    console.error("[google-calendar] Failed to query freeBusy:", error);
    return [];
  }
}

/** Cria um evento na agenda principal do profissional. Best-effort: nunca lança. */
export async function createGoogleCalendarEvent(
  accessToken: string,
  { summary, description, startIso, endIso }: {
    summary: string;
    description: string;
    startIso: string;
    endIso: string;
  }
): Promise<{ created: boolean }> {
  try {
    const response = await fetch(EVENTS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary,
        description,
        start: { dateTime: startIso },
        end: { dateTime: endIso },
      }),
    });
    if (!response.ok) {
      console.error("[google-calendar] Failed to create event:", await response.text());
      return { created: false };
    }
    return { created: true };
  } catch (error) {
    console.error("[google-calendar] Failed to create event:", error);
    return { created: false };
  }
}
