import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getProfessionalIdFromAccessToken } from "@/lib/professional-session";
import { readAccessToken } from "@/lib/read-session-token";
import { listProfessionalContacts } from "@/lib/professional-crm";
import { contactsToCsv } from "@/lib/crm-csv";

export async function GET() {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase ainda não está configurado." }, { status: 503 });
  }

  const accessToken = await readAccessToken("professional");
  const professionalId = await getProfessionalIdFromAccessToken(accessToken);
  if (!professionalId) {
    return NextResponse.json({ error: "Faça login novamente." }, { status: 401 });
  }

  const contacts = await listProfessionalContacts(professionalId);
  const csv = contactsToCsv(contacts ?? []);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="crm-vero.csv"',
    },
  });
}
