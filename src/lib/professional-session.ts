import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getSupabaseAnon } from "@/lib/supabase-anon";
import type { ProfessionalCategory } from "@/lib/professional-categories";
import type { SessionFormat } from "@/lib/session-format";

export interface ProfessionalAccount {
  id: string;
  full_name: string;
  email: string;
  category: ProfessionalCategory;
  bio: string;
  years_experience: number;
  specialties: string[];
  methods: string[];
  personality: string | null;
  session_format: SessionFormat;
  location_city: string | null;
  location_state: string | null;
  location_address: string | null;
  price_cents: number;
  photo_url: string | null;
  portfolio_photo_urls: string[];
  instagram_url: string | null;
  whatsapp_url: string | null;
  website_url: string | null;
  vetting_status: "pendente" | "aprovado" | "rejeitado";
  vetting_notes: string | null;
}

const ACCOUNT_COLUMNS =
  "id, full_name, email, category, bio, years_experience, specialties, methods, personality, session_format, location_city, location_state, location_address, price_cents, photo_url, portfolio_photo_urls, instagram_url, whatsapp_url, website_url, vetting_status, vetting_notes";

/**
 * Resolve o profissional logado a partir do access token da sessão
 * (Supabase Auth). Retorna null se o token for inválido/expirado ou se
 * não houver profissional vinculado a esse usuário.
 */
export async function getProfessionalFromAccessToken(
  accessToken: string | undefined
): Promise<ProfessionalAccount | null> {
  if (!accessToken) return null;

  const anon = getSupabaseAnon();
  const admin = getSupabaseAdmin();
  if (!anon || !admin) return null;

  const { data: userData, error } = await anon.auth.getUser(accessToken);
  if (error || !userData.user) return null;

  const { data } = await admin
    .from("professionals")
    .select(ACCOUNT_COLUMNS)
    .eq("auth_user_id", userData.user.id)
    .maybeSingle();

  return data ?? null;
}

/**
 * Resolve só o id do profissional logado. Usado pelas rotas de API pra
 * nunca confiar num professionalId vindo do corpo da requisição — a
 * identidade vem sempre da sessão.
 */
export async function getProfessionalIdFromAccessToken(
  accessToken: string | undefined
): Promise<string | null> {
  const professional = await getProfessionalFromAccessToken(accessToken);
  return professional?.id ?? null;
}
