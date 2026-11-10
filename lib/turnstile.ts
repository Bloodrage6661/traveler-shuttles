// Cloudflare Turnstile server check. Passes when Turnstile isn't configured.
export async function verifyTurnstile(token: unknown, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (typeof token !== "string" || !token || token.length > 2048) return false;
  try {
    const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      signal: AbortSignal.timeout(10_000),
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
    });
    if (!r.ok) return false;
    const v: { success?: boolean; hostname?: string } = await r.json();
    const hosts = new Set((process.env.TURNSTILE_HOSTNAMES ?? "").split(",").map((h) => h.trim()).filter(Boolean));
    return !!v.success && (hosts.size === 0 || (!!v.hostname && hosts.has(v.hostname)));
  } catch {
    return false;
  }
}
