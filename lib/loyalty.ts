import { getSupabaseAdmin } from "@/lib/supabase";
import { LOYALTY_EVERY } from "@/lib/loyalty-rule";

/** True when this customer's next booking is a half-price loyalty trip. Server-side only. */
export async function loyaltyEligible(email: unknown, excludeId?: string): Promise<boolean> {
  if (typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email.trim())) return false;
  // Case-insensitive exact match: escape LIKE wildcards in the address.
  const pattern = email.trim().replace(/[\\%_]/g, (c) => "\\" + c);
  let q = getSupabaseAdmin()
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .ilike("client_email", pattern)
    .eq("status", "confirmed");
  if (excludeId) q = q.neq("id", excludeId);
  const { count, error } = await q;
  if (error || count == null) return false;
  return (count + 1) % LOYALTY_EVERY === 0;
}
