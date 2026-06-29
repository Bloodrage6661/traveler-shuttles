import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY!);
}
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
const DRIVER_EMAIL = process.env.DRIVER_EMAIL ?? "";

const BRAND = {
  green: "#1B4D2E",
  blue: "#1B3A6B",
  gold: "#C9A84C",
  dark: "#0F2B1A",
};

function layout(body: string) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Inter,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;">
        <tr>
          <td style="background:linear-gradient(135deg,${BRAND.dark},${BRAND.green});padding:28px 32px;">
            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">
              Traveler Shuttles &amp; Tours
            </h1>
          </td>
        </tr>
        <tr><td style="padding:32px;">${body}</td></tr>
        <tr>
          <td style="background:#f9f9f9;padding:20px 32px;border-top:1px solid #e5e5e5;">
            <p style="margin:0;font-size:12px;color:#999;">© 2026 Traveler Shuttles and Tours. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function row(label: string, value: string) {
  return `<tr>
    <td style="padding:6px 0;font-size:14px;color:#666;width:140px;">${label}</td>
    <td style="padding:6px 0;font-size:14px;color:#1a1a1a;font-weight:500;">${value}</td>
  </tr>`;
}

export async function sendDriverNotification(booking: {
  id: string;
  confirmToken: string;
  clientName: string;
  clientEmail: string;
  clientCell: string;
  pickupAddress: string;
  dropoffAddress: string;
  distanceKm: number;
  passengers: number;
  tripType: string;
  customerTier: string;
  pricingBand: string;
  fareZar: number | null;
  preferredDate: string | null;
  preferredTimeWindow: string | null;
}) {
  if (!DRIVER_EMAIL) return;

  const ref = booking.id.slice(0, 8).toUpperCase();
  const fare = booking.fareZar ? `R ${booking.fareZar.toLocaleString("en-ZA")}` : "Custom quote required";
  const date = booking.preferredDate ?? "Not specified";
  const window = booking.preferredTimeWindow ?? "Not specified";

  const acceptUrl  = `${BASE_URL}/api/confirm/${booking.confirmToken}?action=accept`;
  const declineUrl = `${BASE_URL}/api/confirm/${booking.confirmToken}?action=decline`;

  const body = `
    <h2 style="margin:0 0 4px;font-size:20px;color:${BRAND.dark};">New Booking Request</h2>
    <p style="margin:0 0 24px;color:#666;font-size:14px;">Reference: <strong>#${ref}</strong></p>
    <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:24px;">
      ${row("Client", booking.clientName)}
      ${row("Email", booking.clientEmail)}
      ${row("Cell", booking.clientCell)}
      ${row("Pickup", booking.pickupAddress)}
      ${row("Drop-off", booking.dropoffAddress)}
      ${row("Distance", `${booking.distanceKm} km`)}
      ${row("Passengers", String(booking.passengers))}
      ${row("Trip type", booking.tripType.replace(/_/g, " "))}
      ${row("Customer type", booking.customerTier)}
      ${row("Fare", fare)}
      ${row("Date", date)}
      ${row("Time window", window)}
    </table>
    <table cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding-right:12px;">
          <a href="${acceptUrl}" style="display:inline-block;background:${BRAND.green};color:#fff;font-weight:700;padding:14px 28px;border-radius:8px;text-decoration:none;font-size:15px;">
            ✓ Accept Booking
          </a>
        </td>
        <td>
          <a href="${declineUrl}" style="display:inline-block;background:#dc2626;color:#fff;font-weight:700;padding:14px 28px;border-radius:8px;text-decoration:none;font-size:15px;">
            ✕ Decline
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:20px 0 0;font-size:12px;color:#999;">These links are single-use. Clicking one will update the booking and notify the client automatically.</p>
  `;

  await getResend().emails.send({
    from: "Traveler Shuttles <onboarding@resend.dev>",
    to: DRIVER_EMAIL,
    subject: `New booking request #${ref} — ${booking.clientName}`,
    html: layout(body),
  });
}

export async function sendClientPending(booking: {
  id: string;
  clientName: string;
  clientEmail: string;
  preferredDate: string | null;
}) {
  const ref = booking.id.slice(0, 8).toUpperCase();

  const body = `
    <h2 style="margin:0 0 4px;font-size:20px;color:${BRAND.dark};">Booking Received</h2>
    <p style="margin:0 0 24px;color:#666;font-size:14px;">Your reference number is <strong>#${ref}</strong></p>
    <p style="font-size:15px;color:#333;line-height:1.6;">
      Hi ${booking.clientName.split(" ")[0]},<br><br>
      Thank you for your booking request. We've received your details and the driver will confirm your transfer shortly.
      You'll receive a confirmation email as soon as it's accepted.
    </p>
    ${booking.preferredDate ? `<p style="font-size:14px;color:#666;">Requested date: <strong>${booking.preferredDate}</strong></p>` : ""}
    <p style="font-size:14px;color:#666;margin-top:24px;">
      Questions? Reply to this email or contact us directly.
    </p>
  `;

  await getResend().emails.send({
    from: "Traveler Shuttles <onboarding@resend.dev>",
    to: booking.clientEmail,
    subject: `Booking received #${ref} — awaiting confirmation`,
    html: layout(body),
  });
}

export async function sendClientConfirmed(booking: {
  id: string;
  clientName: string;
  clientEmail: string;
  pickupAddress: string;
  dropoffAddress: string;
  passengers: number;
  fareZar: number | null;
  preferredDate: string | null;
  preferredTimeWindow: string | null;
}) {
  const ref = booking.id.slice(0, 8).toUpperCase();
  const fare = booking.fareZar ? `R ${booking.fareZar.toLocaleString("en-ZA")}` : "To be confirmed";
  const windowLabels: Record<string, string> = {
    morning: "Morning (6am–10am)",
    midday: "Midday (10am–2pm)",
    afternoon: "Afternoon (2pm–6pm)",
    evening: "Evening (6pm–10pm)",
  };

  const body = `
    <h2 style="margin:0 0 4px;font-size:20px;color:${BRAND.dark};">Booking Confirmed!</h2>
    <p style="margin:0 0 24px;color:#666;font-size:14px;">Reference: <strong>#${ref}</strong></p>
    <p style="font-size:15px;color:#333;line-height:1.6;">
      Hi ${booking.clientName.split(" ")[0]},<br><br>
      Great news — your transfer has been confirmed. See your booking summary below.
    </p>
    <table cellpadding="0" cellspacing="0" style="width:100%;margin:20px 0;background:#f9f9f9;border-radius:8px;padding:16px;">
      ${row("Pickup", booking.pickupAddress)}
      ${row("Drop-off", booking.dropoffAddress)}
      ${row("Passengers", String(booking.passengers))}
      ${row("Date", booking.preferredDate ?? "TBC")}
      ${row("Time window", booking.preferredTimeWindow ? windowLabels[booking.preferredTimeWindow] : "TBC")}
      ${row("Fare", fare)}
    </table>
    <p style="font-size:14px;color:#666;">
      The driver will contact you closer to the time to confirm exact pickup details.
      Please have your booking reference <strong>#${ref}</strong> ready.
    </p>
  `;

  await getResend().emails.send({
    from: "Traveler Shuttles <onboarding@resend.dev>",
    to: booking.clientEmail,
    subject: `Transfer confirmed #${ref} — Traveler Shuttles`,
    html: layout(body),
  });
}

export async function sendClientDeclined(booking: {
  id: string;
  clientName: string;
  clientEmail: string;
}) {
  const ref = booking.id.slice(0, 8).toUpperCase();

  const body = `
    <h2 style="margin:0 0 4px;font-size:20px;color:${BRAND.dark};">Booking Update</h2>
    <p style="font-size:15px;color:#333;line-height:1.6;">
      Hi ${booking.clientName.split(" ")[0]},<br><br>
      Unfortunately we're unable to accommodate your transfer request (#${ref}) at this time.
      This may be due to availability constraints on the requested date.
    </p>
    <p style="font-size:14px;color:#666;">
      Please <a href="${BASE_URL}/book" style="color:${BRAND.blue};">submit a new request</a> with an alternative date,
      or contact us directly and we'll do our best to assist.
    </p>
  `;

  await getResend().emails.send({
    from: "Traveler Shuttles <onboarding@resend.dev>",
    to: booking.clientEmail,
    subject: `Booking update #${ref}`,
    html: layout(body),
  });
}
