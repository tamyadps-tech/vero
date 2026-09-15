import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getUpcomingSlots, type AvailabilityRule } from "@/lib/availability";
import { getGoogleCalendarAccessToken, listBusyIntervals } from "@/lib/google-calendar";

export interface AdminAvailabilitySlot {
  id: string;
  weekday: number;
  start_time: string;
}

/** Mesmo default de `sessions.duration_minutes` (migration 0003). */
export const SESSION_DURATION_MINUTES = 50;
const GOOGLE_CALENDAR_LOOKAHEAD_DAYS = 14;

function overlapsAnyInterval(
  start: Date,
  end: Date,
  intervals: { start: string; end: string }[]
): boolean {
  return intervals.some(
    (interval) => start < new Date(interval.end) && end > new Date(interval.start)
  );
}

/** Retorna null quando o Supabase ainda não está configurado. */
export async function listAvailabilitySlots(
  professionalId: string
): Promise<AdminAvailabilitySlot[] | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("availability_slots")
    .select("id, weekday, start_time")
    .eq("professional_id", professionalId)
    .order("weekday", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) {
    console.error("[booking] Failed to list availability slots:", error.message);
    return [];
  }
  return data;
}

/** Retorna null quando o Supabase ainda não está configurado. */
export async function getUpcomingSlotsForProfessional(
  professionalId: string
): Promise<Date[] | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const [
    { data: rules, error: rulesError },
    { data: sessions, error: sessionsError },
    { data: professional },
  ] = await Promise.all([
    supabase
      .from("availability_slots")
      .select("weekday, start_time")
      .eq("professional_id", professionalId),
    supabase
      .from("sessions")
      .select("scheduled_at")
      .eq("professional_id", professionalId)
      .eq("status", "agendada"),
    supabase
      .from("professionals")
      .select("google_calendar_refresh_token")
      .eq("id", professionalId)
      .maybeSingle(),
  ]);

  if (rulesError || sessionsError) {
    console.error(
      "[booking] Failed to compute upcoming slots:",
      rulesError?.message ?? sessionsError?.message
    );
    return [];
  }

  const availabilityRules: AvailabilityRule[] = (rules ?? []).map((r) => ({
    weekday: r.weekday,
    // Postgres `time` volta como "HH:MM:SS" — corta pra "HH:MM".
    startTime: r.start_time.slice(0, 5),
  }));

  const slots = getUpcomingSlots({
    rules: availabilityRules,
    bookedSessions: (sessions ?? []).map((s) => ({ scheduledAt: s.scheduled_at })),
  });

  // Além dos horários já ocupados no Vero, exclui o que já está ocupado
  // no Google Calendar do profissional, se ele tiver conectado. Falha
  // na chamada ao Google não derruba o agendamento — só não filtra.
  const refreshToken = professional?.google_calendar_refresh_token;
  if (!refreshToken || slots.length === 0) return slots;

  const accessToken = await getGoogleCalendarAccessToken(refreshToken);
  if (!accessToken) return slots;

  const now = new Date();
  const lookahead = new Date(
    now.getTime() + GOOGLE_CALENDAR_LOOKAHEAD_DAYS * 24 * 60 * 60 * 1000
  );
  const busyIntervals = await listBusyIntervals(
    accessToken,
    now.toISOString(),
    lookahead.toISOString()
  );
  if (busyIntervals.length === 0) return slots;

  return slots.filter((slot) => {
    const slotEnd = new Date(slot.getTime() + SESSION_DURATION_MINUTES * 60 * 1000);
    return !overlapsAnyInterval(slot, slotEnd, busyIntervals);
  });
}
