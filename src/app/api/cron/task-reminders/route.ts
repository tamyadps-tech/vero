import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { sendEmail } from "@/lib/email";
import { taskReminderEmail, type TaskReminderItem } from "@/lib/email-templates";

type TaskRow = {
  id: string;
  title: string;
  due_date: string;
  contact: {
    full_name: string;
    professional: { full_name: string; email: string } | null;
  } | null;
};

/**
 * Roda uma vez por dia (ver vercel.json) e manda um resumo por email das
 * tarefas de follow-up do CRM que estão atrasadas ou vencem hoje. Sem
 * dedupe proposital: é um lembrete diário que deve insistir até a
 * tarefa ser concluída ou removida, não um alerta único.
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

  const todayStr = new Date().toISOString().slice(0, 10);

  const { data: taskRows, error } = await supabase
    .from("professional_contact_tasks")
    .select(
      "id, title, due_date, contact:professional_contacts!inner(full_name, professional:professionals(full_name, email))"
    )
    .eq("done", false)
    .not("due_date", "is", null)
    .lte("due_date", todayStr);

  if (error) {
    console.error("[cron/task-reminders] Failed to list tasks:", error.message);
    return NextResponse.json({ error: "Não foi possível buscar tarefas." }, { status: 500 });
  }

  const byProfessional = new Map<
    string,
    { professionalName: string; tasks: TaskReminderItem[] }
  >();

  for (const row of (taskRows ?? []) as unknown as TaskRow[]) {
    const professional = row.contact?.professional;
    if (!professional || !row.contact) continue;

    const entry = byProfessional.get(professional.email) ?? {
      professionalName: professional.full_name,
      tasks: [],
    };
    entry.tasks.push({
      contactName: row.contact.full_name,
      title: row.title,
      dueDate: row.due_date,
      overdue: row.due_date < todayStr,
    });
    byProfessional.set(professional.email, entry);
  }

  const origin = new URL(request.url).origin;
  const dashboardUrl = `${origin}/p/dashboard`;

  let sent = 0;
  for (const [email, entry] of byProfessional) {
    const { subject, html } = taskReminderEmail({
      professionalName: entry.professionalName,
      tasks: entry.tasks,
      dashboardUrl,
    });
    const result = await sendEmail({ to: email, subject, html });
    if (result.sent) sent += 1;
  }

  return NextResponse.json({ ok: true, professionals: byProfessional.size, sent });
}
