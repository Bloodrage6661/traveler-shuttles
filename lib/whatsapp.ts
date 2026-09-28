// Business-initiated WhatsApp alert to the owner (Greg) via Meta's WhatsApp
// Cloud API. Business-initiated messages require a pre-approved template.
//
// Configure via env (all required, else this no-ops so email stays the fallback):
//   WHATSAPP_ACCESS_TOKEN     - permanent System User token
//   WHATSAPP_PHONE_NUMBER_ID  - the sender's phone number ID
//   WHATSAPP_TO               - recipient in E.164 without + (e.g. 27766432418)
//   WHATSAPP_TEMPLATE_NAME    - approved template name (3 body variables)
//   WHATSAPP_TEMPLATE_LANG    - template language code (default "en")
//
// Expected template body (3 variables), e.g.:
//   Traveler alert: {{1}}
//   {{2}}
//   Open the dashboard: {{3}}

const GRAPH_VERSION = "v21.0";

// Template variable values can't contain newlines/tabs or >4 consecutive spaces.
function cleanVar(s: string): string {
  return s.replace(/\s+/g, " ").trim().slice(0, 900) || "-";
}

/** Sends a 3-variable template alert. Best-effort: never throws. */
export async function sendWhatsAppAlert(line1: string, line2: string, url: string): Promise<void> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const to = process.env.WHATSAPP_TO;
  const template = process.env.WHATSAPP_TEMPLATE_NAME;
  const lang = process.env.WHATSAPP_TEMPLATE_LANG ?? "en";
  if (!token || !phoneId || !to || !template) return; // not configured yet

  try {
    const res = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${phoneId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      signal: AbortSignal.timeout(10_000),
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: template,
          language: { code: lang },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: cleanVar(line1) },
                { type: "text", text: cleanVar(line2) },
                { type: "text", text: cleanVar(url) },
              ],
            },
          ],
        },
      }),
    });
    if (!res.ok) {
      console.error("WhatsApp alert failed:", res.status, await res.text().catch(() => ""));
    }
  } catch (e) {
    console.error("WhatsApp alert error:", e);
  }
}
