import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getProfessionalIdFromAccessToken } from "@/lib/professional-session";
import { readAccessToken } from "@/lib/read-session-token";
import { ensureContactId, updateContact, CRM_STAGES, type CrmStage } from "@/lib/professional-crm";

const MAX_TAGS = 10;
const MAX_TAG_LENGTH = 30;

export async function PATCH(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const { contactId, clientId, stage, tags, fullName, phone } = (body ?? {}) as {
    contactId?: unknown;
    clientId?: unknown;
    stage?: unknown;
    tags?: unknown;
    fullName?: unknown;
    phone?: unknown;
  };

  if (typeof contactId !== "string" && typeof clientId !== "string") {
    return NextResponse.json({ error: "Informe contactId ou clientId." }, { status: 400 });
  }

  if (stage !== undefined && !CRM_STAGES.includes(stage as CrmStage)) {
    return NextResponse.json({ error: "Estágio inválido." }, { status: 400 });
  }

  let cleanedTags: string[] | undefined;
  if (tags !== undefined) {
    if (
      !Array.isArray(tags) ||
      tags.length > MAX_TAGS ||
      tags.some((t) => typeof t !== "string" || t.trim().length === 0 || t.length > MAX_TAG_LENGTH)
    ) {
      return NextResponse.json({ error: "Tags inválidas (máx. 10, até 30 caracteres cada)." }, { status: 400 });
    }
    cleanedTags = Array.from(new Set(tags.map((t) => t.trim())));
  }

  if (fullName !== undefined && (typeof fullName !== "string" || fullName.trim().length < 2)) {
    return NextResponse.json({ error: "Nome inválido." }, { status: 400 });
  }
  if (phone !== undefined && phone !== null && typeof phone !== "string") {
    return NextResponse.json({ error: "Telefone inválido." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase ainda não está configurado." }, { status: 503 });
  }

  const accessToken = await readAccessToken("professional");
  const professionalId = await getProfessionalIdFromAccessToken(accessToken);
  if (!professionalId) {
    return NextResponse.json({ error: "Faça login novamente." }, { status: 401 });
  }

  const resolvedContactId = await ensureContactId(professionalId, {
    contactId: typeof contactId === "string" ? contactId : undefined,
    clientId: typeof clientId === "string" ? clientId : undefined,
  });
  if (!resolvedContactId) {
    return NextResponse.json({ error: "Contato não encontrado." }, { status: 404 });
  }

  const ok = await updateContact(professionalId, resolvedContactId, {
    stage: stage as CrmStage | undefined,
    tags: cleanedTags,
    fullName: typeof fullName === "string" ? fullName.trim() : undefined,
    phone: phone === null ? null : typeof phone === "string" ? phone.trim() : undefined,
  });

  if (!ok) {
    return NextResponse.json({ error: "Não foi possível salvar agora." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, contactId: resolvedContactId });
}
