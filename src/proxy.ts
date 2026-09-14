import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sessionCookieNames, type ActorRole } from "@/lib/auth-session";

/**
 * Proteção mínima do /admin enquanto não existe um sistema de login de
 * verdade pra equipe. HTTP Basic Auth com credenciais em variáveis de
 * ambiente — suficiente para "só eu e minha equipe" nesta fase.
 */
function checkAdminAuth(request: NextRequest): NextResponse {
  const user = process.env.ADMIN_USER;
  const password = process.env.ADMIN_PASSWORD;

  if (!user || !password) {
    return new NextResponse(
      "Admin não configurado: defina ADMIN_USER e ADMIN_PASSWORD.",
      { status: 503 }
    );
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Basic ")) {
    const decoded = atob(authHeader.slice(6));
    const separatorIndex = decoded.indexOf(":");
    const suppliedUser = decoded.slice(0, separatorIndex);
    const suppliedPassword = decoded.slice(separatorIndex + 1);
    if (suppliedUser === user && suppliedPassword === password) {
      return NextResponse.next();
    }
  }

  return new NextResponse("Autenticação necessária.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Vero Admin"' },
  });
}

/**
 * Valida a sessão (Supabase Auth) de profissional/cliente a partir dos
 * cookies. Se o access token expirou mas o refresh token ainda é válido,
 * renova e já grava os cookies novos na resposta — assim quem visita uma
 * página protegida nunca "cai" da sessão só porque passou 1 hora.
 */
async function checkActorSession(
  request: NextRequest,
  role: ActorRole,
  response: NextResponse
): Promise<boolean> {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!url || !anonKey) return false;

  const { access, refresh } = sessionCookieNames(role);
  const accessToken = request.cookies.get(access)?.value;
  const refreshToken = request.cookies.get(refresh)?.value;

  const supabase = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  if (accessToken) {
    const { data, error } = await supabase.auth.getUser(accessToken);
    if (!error && data.user) return true;
  }

  if (refreshToken) {
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });
    if (!error && data.session) {
      response.cookies.set(access, data.session.access_token, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: data.session.expires_in,
      });
      response.cookies.set(refresh, data.session.refresh_token, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
      return true;
    }
  }

  return false;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    return checkAdminAuth(request);
  }

  if (pathname.startsWith("/p/dashboard")) {
    const response = NextResponse.next();
    const authenticated = await checkActorSession(request, "professional", response);
    if (!authenticated) {
      return NextResponse.redirect(new URL("/p/entrar", request.url));
    }
    return response;
  }

  if (pathname.startsWith("/c/dashboard")) {
    const response = NextResponse.next();
    const authenticated = await checkActorSession(request, "client", response);
    if (!authenticated) {
      return NextResponse.redirect(new URL("/c/entrar", request.url));
    }
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/p/dashboard/:path*",
    "/c/dashboard/:path*",
  ],
};
