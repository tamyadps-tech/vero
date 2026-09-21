import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getProfessionalIdFromAccessToken } from "@/lib/professional-session";
import { readAccessToken } from "@/lib/read-session-token";
import { ensureContactId, addTask } from "@/lib/professional-crm";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_TITLE_LENGTH = 200;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const { contactId, clientId, title, dueDate } = (body ?? {}) as {
    contactId?: unknown;
    clientId?: unknown;
    title?: unknown;
    dueDate?: unknown;
  };

  if (typeof contactId !== "string" && typeof clientId !== "string") {
    return NextResponse.json({ error: "Informe contactId ou clientId." }, { status: 400 });
  }
  if (typeof title !== "string" || title.trim().length === 0 || title.length > MAX_TITLE_LENGTH) {
    return NextResponse.json({ error: "Informe um título válido pra tarefa." }, { status: 400 });
  }
  if (dueDate !== undefined && dueDate !== null && (typeof dueDate !== "string" || !DATE_RE.test(dueDate))) {
    return NextResponse.json({ error: "Data inválida (use AAAA-MM-DD)." }, { status: 400 });
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

  const ok = await addTask(
    resolvedContactId,
    title.trim(),
    typeof dueDate === "string" ? dueDate : null
  );
  if (!ok) {
    return NextResponse.json({ error: "Não foi possível criar a tarefa agora." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, contactId: resolvedContactId });
}
