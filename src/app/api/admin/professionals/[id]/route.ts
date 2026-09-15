import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { sendEmail } from "@/lib/email";
import { professionalApprovedEmail, professionalRejectedEmail } from "@/lib/email-templates";

const ACTION_TO_STATUS = {
  aprovar: "aprovado",
  rejeitar: "rejeitado",
} as const;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const { action, notes, scheduledAt } = (body ?? {}) as {
    action?: unknown;
    notes?: unknown;
    scheduledAt?: unknown;
  };

  if (action === "agendar_reuniao") {
    const date = typeof scheduledAt === "string" ? new Date(scheduledAt) : null;
    if (!date || Number.isNaN(date.getTime())) {
      return NextResponse.json({ error: "Data/hora inválida." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase ainda não está configurado." },
        { status: 503 }
      );
    }

    const meetingNotes = typeof notes === "string" && notes.trim() ? notes.trim() : null;

    const { error } = await supabase
      .from("professionals")
      .update({
        verification_meeting_at: date.toISOString(),
        verification_meeting_notes: meetingNotes,
      })
      .eq("id", id);

    if (error) {
      console.error("[admin/professionals] meeting update failed:", error.message);
      return NextResponse.json(
        { error: "Não foi possível salvar agora." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  }

  if (typeof action !== "string" || !(action in ACTION_TO_STATUS)) {
    return NextResponse.json(
      { error: "Ação inválida. Use 'aprovar', 'rejeitar' ou 'agendar_reuniao'." },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase ainda não está configurado." },
      { status: 503 }
    );
  }

  const notesValue = typeof notes === "string" ? notes : null;

  const { data: updated, error } = await supabase
    .from("professionals")
    .update({
      vetting_status: ACTION_TO_STATUS[action as keyof typeof ACTION_TO_STATUS],
      vetting_notes: notesValue,
    })
    .eq("id", id)
    .select("full_name, email")
    .single();

  if (error || !updated) {
    console.error("[admin/professionals] update failed:", error?.message);
    return NextResponse.json(
      { error: "Não foi possível atualizar agora." },
      { status: 500 }
    );
  }

  // Email é um bônus, não um bloqueio: a aprovação/rejeição já valeu.
  const origin = new URL(request.url).origin;
  if (action === "aprovar") {
    const { subject, html } = professionalApprovedEmail({
      professionalName: updated.full_name,
      dashboardUrl: `${origin}/p/entrar`,
    });
    await sendEmail({ to: updated.email, subject, html });
  } else {
    const { subject, html } = professionalRejectedEmail({
      professionalName: updated.full_name,
      notes: notesValue,
    });
    await sendEmail({ to: updated.email, subject, html });
  }

  return NextResponse.json({ ok: true });
}
