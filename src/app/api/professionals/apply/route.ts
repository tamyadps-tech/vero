import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { isProfessionalCategory } from "@/lib/professional-categories";
import { isSessionFormat, type SessionFormat } from "@/lib/session-format";
import { validatePhotoFile, uploadProfessionalPhoto } from "@/lib/photo-upload";
import { parseJsonTagField } from "@/lib/tags";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /^https?:\/\/.+/i;

const MIN_PASSWORD_LENGTH = 8;

interface ApplyPayload {
  fullName: string;
  email: string;
  password: string;
  category: string;
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
  credentialDocumentUrl?: string;
  photo?: File;
}

function validate(body: unknown): { data: ApplyPayload } | { error: string } {
  if (typeof body !== "object" || body === null) {
    return { error: "Corpo inválido." };
  }
  const b = body as Record<string, unknown>;

  const fullName = typeof b.fullName === "string" ? b.fullName.trim() : "";
  if (fullName.length < 3) {
    return { error: "Informe seu nome completo." };
  }

  const email = typeof b.email === "string" ? b.email.trim() : "";
  if (!EMAIL_RE.test(email)) {
    return { error: "Informe um email válido." };
  }

  const password = typeof b.password === "string" ? b.password : "";
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { error: `A senha precisa ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.` };
  }

  if (!isProfessionalCategory(b.category)) {
    return { error: "Selecione uma categoria válida." };
  }

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

  const credentialDocumentUrl =
    typeof b.credentialDocumentUrl === "string" && b.credentialDocumentUrl.trim()
      ? b.credentialDocumentUrl.trim()
      : undefined;
  if (credentialDocumentUrl && !URL_RE.test(credentialDocumentUrl)) {
    return { error: "O link do documento precisa ser uma URL válida (http/https)." };
  }

  const photoResult = validatePhotoFile(b.photo);
  if ("error" in photoResult) {
    return { error: photoResult.error };
  }

  return {
    data: {
      fullName,
      email: email.toLowerCase(),
      password,
      category: b.category,
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
      credentialDocumentUrl,
      photo: photoResult.photo,
    },
  };
}

export async function POST(request: Request) {
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
    console.warn(
      "[professionals/apply] Supabase não configurado — candidatura não persistida:",
      result.data
    );
    return NextResponse.json(
      {
        error:
          "Cadastro ainda não está conectado ao banco de dados. Tente novamente em breve.",
      },
      { status: 503 }
    );
  }

  const { data } = result;

  const photoUrl = data.photo ? await uploadProfessionalPhoto(supabase, data.photo) : null;

  // Cria a conta de login (Supabase Auth) antes do registro do
  // profissional — email_confirm:true porque ainda não configuramos o
  // fluxo de confirmação por email da própria Supabase; o acesso real ao
  // painel já é controlado pelo vetting_status, não pela confirmação.
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: data.email,
    password: data.password,
    email_confirm: true,
  });

  if (authError || !authUser.user) {
    if (authError?.code === "email_exists") {
      return NextResponse.json(
        { error: "Já existe uma conta com esse email." },
        { status: 409 }
      );
    }
    console.error("[professionals/apply] Failed to create auth user:", authError?.message);
    return NextResponse.json(
      { error: "Não foi possível enviar agora. Tente novamente." },
      { status: 500 }
    );
  }

  const { error } = await supabase.from("professionals").insert({
    auth_user_id: authUser.user.id,
    full_name: data.fullName,
    email: data.email,
    category: data.category,
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
    credential_document_url: data.credentialDocumentUrl ?? null,
    photo_url: photoUrl,
  });

  if (error) {
    // Sem usuário de auth órfão: se o registro do profissional falhar,
    // desfaz a conta que acabou de ser criada.
    await supabase.auth.admin.deleteUser(authUser.user.id).catch(() => {});

    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Já existe uma candidatura com esse email." },
        { status: 409 }
      );
    }
    console.error("[professionals/apply] Supabase insert failed:", error.message);
    return NextResponse.json(
      { error: "Não foi possível enviar agora. Tente novamente." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
