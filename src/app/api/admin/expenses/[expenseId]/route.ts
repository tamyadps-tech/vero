import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ expenseId: string }> }
) {
  const { expenseId } = await params;

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase ainda não está configurado." },
      { status: 503 }
    );
  }

  const { error } = await supabase.from("admin_expenses").delete().eq("id", expenseId);

  if (error) {
    console.error("[admin/expenses] delete failed:", error.message);
    return NextResponse.json(
      { error: "Não foi possível remover agora." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
