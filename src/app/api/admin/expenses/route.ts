import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_DESCRIPTION_LENGTH = 200;
const MAX_CATEGORY_LENGTH = 60;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const { description, amountCents, kind, expenseDate, category } = (body ?? {}) as {
    description?: unknown;
    amountCents?: unknown;
    kind?: unknown;
    expenseDate?: unknown;
    category?: unknown;
  };

  const trimmedDescription = typeof description === "string" ? description.trim() : "";
  if (!trimmedDescription || trimmedDescription.length > MAX_DESCRIPTION_LENGTH) {
    return NextResponse.json({ error: "Informe uma descrição válida." }, { status: 400 });
  }

  if (kind !== "fixo" && kind !== "variavel") {
    return NextResponse.json(
      { error: "Informe se o custo é fixo (mensal) ou variável (por sessão)." },
      { status: 400 }
    );
  }

  if (
    typeof amountCents !== "number" ||
    !Number.isFinite(amountCents) ||
    !Number.isInteger(amountCents) ||
    amountCents < 0
  ) {
    return NextResponse.json({ error: "Informe um valor válido." }, { status: 400 });
  }

  if (typeof expenseDate !== "string" || !DATE_RE.test(expenseDate)) {
    return NextResponse.json({ error: "Informe uma data válida." }, { status: 400 });
  }

  const trimmedCategory =
    typeof category === "string" && category.trim() ? category.trim() : undefined;
  if (trimmedCategory && trimmedCategory.length > MAX_CATEGORY_LENGTH) {
    return NextResponse.json({ error: "Categoria muito longa." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase ainda não está configurado." },
      { status: 503 }
    );
  }

  const { error } = await supabase.from("admin_expenses").insert({
    description: trimmedDescription,
    amount_cents: amountCents,
    kind,
    expense_date: expenseDate,
    category: trimmedCategory ?? null,
  });

  if (error) {
    console.error("[admin/expenses] insert failed:", error.message);
    return NextResponse.json(
      { error: "Não foi possível salvar agora." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
