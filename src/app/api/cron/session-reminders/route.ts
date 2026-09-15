import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { sessionReminderWhatsApp } from "@/lib/whatsapp-templates";

const REMINDER_WINDOW_HOURS = 36;

/**
 * Roda uma vez por dia (ver vercel.json) e manda lembrete de WhatsApp
 * pras sessões agendadas nas próximas ~36h que ainda não receberam
 * lembrete — janela larga o bastante pra um cron diário nunca deixar
 * passar uma sessão de "amanhã", sem nunca mandar duas vezes
 * (`reminder_sent_at`).
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase ainda não está configurado." },
      { status: 503 }
    );
  }

  const now = new Date();
  const windowEnd = new Date(now.getTime() + REMINDER_WINDOW_HOURS * 60 * 60 * 1000);

  const { data: sessions, error } = await supabase
    .from("sessions")
    .select(
      "id, scheduled_at, professional:professionals(full_name), client:clients(full_name, phone_number)"
    )
    .eq("status", "agendada")
    .is("reminder_sent_at", null)
    .gte("scheduled_at", now.toISOString())
    .lte("scheduled_at", windowEnd.toISOString());

  if (error) {
    console.error("[cron/session-reminders] Failed to list sessions:", error.message);
    return NextResponse.json({ error: "Não foi possível buscar sessões." }, { status: 500 });
  }

  let sent = 0;
  for (const row of sessions ?? []) {
    const client = row.client as unknown as
      | { full_name: string; phone_number: string | null }
      | undefined;
    const professional = row.professional as unknown as { full_name: string } | undefined;
    if (!client || !professional) continue;

    const result = await sendWhatsAppMessage(
      client.phone_number,
      sessionReminderWhatsApp({
        clientName: client.full_name,
        professionalName: professional.full_name,
        scheduledAt: row.scheduled_at,
      })
    );

    // Marca como "lembrado" mesmo sem telefone/Twilio configurado — não
    // adianta reprocessar a mesma sessão todo dia até a janela passar.
    await supabase
      .from("sessions")
      .update({ reminder_sent_at: now.toISOString() })
      .eq("id", row.id);

    if (result.sent) sent += 1;
  }

  return NextResponse.json({ ok: true, checked: sessions?.length ?? 0, sent });
}
