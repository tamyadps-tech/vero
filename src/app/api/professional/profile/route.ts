import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getProfessionalIdFromAccessToken } from "@/lib/professional-session";
import { readAccessToken } from "@/lib/read-session-token";
import { isSessionFormat, type SessionFormat } from "@/lib/session-format";
import { parseJsonTagField } from "@/lib/tags";
import { validatePhotoFile, uploadProfessionalPhoto } from "@/lib/photo-upload";

const URL_RE = /^https?:\/\/.+/i;

interface ProfilePayload {
  bio: string;
  yearsExperience: number;
  specialties: string[];
  methods: string[];
  personality?: string;
  sessionFormat: SessionFormat;
  locationCity?: string;
  locationState?: string;
  locationAddress?: string;
  priceCents: number;
  instagramUrl?: string;
  whatsappUrl?: string;
  websiteUrl?: string;
  photo?: File;
}

function validateUrlField(value: unknown, label: string): { value?: string } | { error: string } {
  if (typeof value !== "string" || !value.trim()) return {};
  const trimmed = value.trim();
  if (!URL_RE.test(trimmed)) {
    return { error: `O link de ${label} precisa ser uma URL válida (http/https).` };
  }
  return { value: trimmed };
}

function validate(body: unknown): { data: ProfilePayload } | { error: string } {
  if (typeof body !== "object" || body === null) {
    return { error: "Corpo inválido." };
  }
  const b = body as Record<string, unknown>;

  const bio = typeof b.bio === "string" ? b.bio.trim() : "";
  if (bio.length < 20) {
    return { error: "Conte um pouco mais sobre sua experiência (mín. 20 caracteres)." };
  }

  const yearsExperience =
    typeof b.yearsExperience === "string" ? Math.round(Number(b.yearsExperience)) : NaN;
  if (!Number.isFinite(yearsExperience) || yearsExperience < 0 || yearsExperience > 60) {
    return { error: "Informe os anos de experiência (0 a 60)." };
  }

  const specialties = parseJsonTagField(b.specialties);
  if (!specialties || specialties.length === 0) {
    return { error: "Informe ao menos uma especialidade." };
  }

  const methods = parseJsonTagField(b.methods);
  if (!methods) {
    return { error: "Métodos inválidos." };
  }

  const personality =
    typeof b.personality === "string" && b.personality.trim()
      ? b.personality.trim().slice(0, 300)
      : undefined;

  if (!isSessionFormat(b.sessionFormat)) {
    return { error: "Selecione um formato de atendimento válido." };
  }
  const sessionFormat = b.sessionFormat;

  let locationCity: string | undefined;
  let locationState: string | undefined;
  let locationAddress: string | undefined;
  if (sessionFormat !== "online") {
    locationCity = typeof b.locationCity === "string" ? b.locationCity.trim() : "";
    locationState = typeof b.locationState === "string" ? b.locationState.trim() : "";
    if (!locationCity || !locationState) {
      return {
        error: "Informe cidade e estado do ponto de atendimento presencial.",
      };
    }
    locationAddress =
      typeof b.locationAddress === "string" && b.locationAddress.trim()
        ? b.locationAddress.trim()
        : undefined;
  }

  const priceCents =
    typeof b.priceCents === "string" ? Math.round(Number(b.priceCents)) : NaN;
  if (!Number.isFinite(priceCents) || priceCents < 0) {
    return { error: "Informe um preço de sessão válido." };
  }

  const instagramResult = validateUrlField(b.instagramUrl, "Instagram");
  if ("error" in instagramResult) return { error: instagramResult.error };

  const whatsappResult = validateUrlField(b.whatsappUrl, "WhatsApp");
  if ("error" in whatsappResult) return { error: whatsappResult.error };

  const websiteResult = validateUrlField(b.websiteUrl, "site");
  if ("error" in websiteResult) return { error: websiteResult.error };

  const photoResult = validatePhotoFile(b.photo);
  if ("error" in photoResult) return { error: photoResult.error };

  return {
    data: {
      bio,
      yearsExperience,
      specialties,
      methods,
      personality,
      sessionFormat,
      locationCity,
      locationState,
      locationAddress,
      priceCents,
      instagramUrl: instagramResult.value,
      whatsappUrl: whatsappResult.value,
      websiteUrl: websiteResult.value,
      photo: photoResult.photo,
    },
  };
}

export async function PATCH(request: Request) {
  let body: FormData;
  try {
    body = await request.formData();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const result = validate(Object.fromEntries(body.entries()));
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase ainda não está configurado." },
      { status: 503 }
    );
  }

  const accessToken = await readAccessToken("professional");
  const professionalId = await getProfessionalIdFromAccessToken(accessToken);
  if (!professionalId) {
    return NextResponse.json({ error: "Faça login novamente." }, { status: 401 });
  }

  const { data } = result;
  const photoUrl = data.photo ? await uploadProfessionalPhoto(supabase, data.photo) : undefined;

  const { error } = await supabase
    .from("professionals")
    .update({
      bio: data.bio,
      years_experience: data.yearsExperience,
      specialties: data.specialties,
      methods: data.methods,
      personality: data.personality ?? null,
      session_format: data.sessionFormat,
      location_city: data.locationCity ?? null,
      location_state: data.locationState ?? null,
      location_address: data.locationAddress ?? null,
      price_cents: data.priceCents,
      instagram_url: data.instagramUrl ?? null,
      whatsapp_url: data.whatsappUrl ?? null,
      website_url: data.websiteUrl ?? null,
      ...(photoUrl ? { photo_url: photoUrl } : {}),
    })
    .eq("id", professionalId);

  if (error) {
    console.error("[professional/profile] Update failed:", error.message);
    return NextResponse.json(
      { error: "Não foi possível salvar agora. Tente novamente." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, photoUrl });
}
