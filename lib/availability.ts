import { getSupabaseAdmin } from "./supabase";

export async function getUnavailableDates(month: string): Promise<string[]> {
  const [year, mon] = month.split("-").map(Number);
  const from = `${year}-${String(mon).padStart(2, "0")}-01`;
  const to   = `${year}-${String(mon).padStart(2, "0")}-31`;

  const { data } = await getSupabaseAdmin()
    .from("unavailable_dates")
    .select("date")
    .gte("date", from)
    .lte("date", to);

  return (data ?? []).map((r: { date: string }) => r.date);
}

export async function markUnavailable(date: string, note?: string) {
  await getSupabaseAdmin()
    .from("unavailable_dates")
    .upsert({ date, note: note ?? null });
}

export async function markAvailable(date: string) {
  await getSupabaseAdmin()
    .from("unavailable_dates")
    .delete()
    .eq("date", date);
}
