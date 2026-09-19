import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getProfessionalIdFromAccessToken } from "@/lib/professional-session";
import { readAccessToken } from "@/lib/read-session-token";

export async function PATCH(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const { monthlyRevenueGoalCents } = (body ?? {}) as { monthlyRevenueGoalCents?: unknown };

  // null limpa a meta (volta a não ter meta definida).
  let goalCents: number | null;
  if (monthlyRevenueGoalCents === null) {
    goalCents = null;
  } else if (
    typeof monthlyRevenueGoalCents === "number" &&
    Number.isFinite(monthlyRevenueGoalCents) &&
    Number.isInteger(monthlyRevenueGoalCents) &&
    monthlyRevenueGoalCents >= 0
  ) {
    goalCents = monthlyRevenueGoalCents;
  } else {
    return NextResponse.json({ error: "Informe uma meta válida." }, { status: 400 });
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

  const { error } = await supabase
    .from("professionals")
    .update({ monthly_revenue_goal_cents: goalCents })
    .eq("id", professionalId);

  if (error) {
    console.error("[professional/financial-goal] update failed:", error.message);
    return NextResponse.json({ error: "Não foi possível salvar agora." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
