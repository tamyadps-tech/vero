import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getProfessionalIdFromAccessToken } from "@/lib/professional-session";
import { readAccessToken } from "@/lib/read-session-token";
import { getProfessionalCampaignTemplate } from "@/lib/professional-campaign-templates";
import { sendBulkWhatsAppMessages } from "@/lib/marketing-integrations";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const { templateId, phones } = (body ?? {}) as {
    templateId?: unknown;
    phones?: unknown;
  };

  const template = typeof templateId === "string" ? getProfessionalCampaignTemplate(templateId) : undefined;
  if (!template) {
    return NextResponse.json({ error: "Modelo de campanha inválido." }, { status: 400 });
  }

  const cleanedPhones = Array.isArray(phones)
    ? phones
        .filter((phone): phone is string => typeof phone === "string" && phone.trim().length > 0)
        .map((phone) => phone.trim())
    : [];

  if (cleanedPhones.length === 0) {
    return NextResponse.json(
      { error: "Informe ao menos um número de WhatsApp." },
      { status: 400 }
    );
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

  const { data: professional } = await supabase
    .from("professionals")
    .select("full_name")
    .eq("id", professionalId)
    .single();

  const origin = new URL(request.url).origin;
  const profileUrl = `${origin}/profissionais/${professionalId}`;
  const professionalName = professional?.full_name ?? "Seu profissional na Vero";
  const text = template.whatsapp(professionalName, profileUrl);

  const result = await sendBulkWhatsAppMessages(cleanedPhones, text);

  return NextResponse.json({ ok: true, recipientCount: cleanedPhones.length, ...result });
}
