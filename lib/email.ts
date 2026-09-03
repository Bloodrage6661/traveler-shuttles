import { Resend } from "resend";
import { formatPickupTime } from "./time";
import { buildBookingIcs, googleCalendarLink, type InviteBooking } from "./calendar-invite";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY!);
}
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
// DRIVER_EMAIL accepts one address or a comma-separated list — every address gets the booking email.
const DRIVER_EMAILS = (process.env.DRIVER_EMAIL ?? "")
  .split(",")
  .map((e) => e.trim())
  .filter(Boolean);

// The calendar account that confirmed-trip invites are sent to (so they land on
// that account's calendar). Falls back to the driver emails if unset.
const CALENDAR_EMAILS = (process.env.CALENDAR_INVITE_EMAIL ?? "")
  .split(",")
  .map((e) => e.trim())
  .filter(Boolean);

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
  flightNumber?: string | null;
}) {
  if (DRIVER_EMAILS.length === 0) return;

  const ref = booking.id.slice(0, 8).toUpperCase();
  const fare = booking.fareZar ? `R ${booking.fareZar.toLocaleString("en-ZA")}` : "Custom quote required";
  const date = booking.preferredDate ?? "Not specified";
  const pickupTimeLabel = formatPickupTime(booking.preferredTimeWindow);

  const adminUrl   = `${BASE_URL}/admin?booking=${booking.id}`;
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
      ${booking.flightNumber ? row("Flight number", booking.flightNumber) : ""}
      ${row("Customer type", booking.customerTier)}
      ${row("Estimated fare", fare)}
      ${row("Date", date)}
      ${row("Pickup time", pickupTimeLabel)}
    </table>
    <table cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding-right:12px;">
          <a href="${adminUrl}" style="display:inline-block;background:${BRAND.green};color:#fff;font-weight:700;padding:14px 28px;border-radius:8px;text-decoration:none;font-size:15px;">
            → Set Final Price &amp; Confirm
          </a>
        </td>
        <td>
          <a href="${declineUrl}" style="display:inline-block;background:#dc2626;color:#fff;font-weight:700;padding:14px 28px;border-radius:8px;text-decoration:none;font-size:15px;">
            ✕ Decline
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:20px 0 0;font-size:12px;color:#999;">Open the admin panel to enter the final price and confirm — the client is only charged and notified once you confirm. The estimated fare above is a guide. Decline is single-use.</p>
  `;

  await getResend().emails.send({
    from: "Traveler Shuttles <noreply@travelershuttlesandtours.co.za>",
    to: DRIVER_EMAILS,
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
      Any fare shown was an estimate — we'll confirm the final price in your confirmation email as soon as your booking is accepted.
    </p>
    ${booking.preferredDate ? `<p style="font-size:14px;color:#666;">Requested date: <strong>${booking.preferredDate}</strong></p>` : ""}
    <p style="font-size:14px;color:#666;margin-top:24px;">
      Questions? Reply to this email or contact us directly.
    </p>
  `;

  await getResend().emails.send({
    from: "Traveler Shuttles <noreply@travelershuttlesandtours.co.za>",
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
      ${row("Pickup time", formatPickupTime(booking.preferredTimeWindow))}
      ${row("Fare", fare)}
    </table>
    <p style="font-size:14px;color:#666;">
      The driver will contact you closer to the time to confirm exact pickup details.
      Please have your booking reference <strong>#${ref}</strong> ready.
    </p>
  `;

  await getResend().emails.send({
    from: "Traveler Shuttles <noreply@travelershuttlesandtours.co.za>",
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
    from: "Traveler Shuttles <noreply@travelershuttlesandtours.co.za>",
    to: booking.clientEmail,
    subject: `Booking update #${ref}`,
    html: layout(body),
  });
}

// Sends the driver(s) a calendar invite (.ics) for a confirmed trip, plus an
// "Add to Google Calendar" button. With Gmail set to auto-add invitations, the
// event lands on the driver's calendar automatically. No Google Cloud needed.
export async function sendDriverCalendarInvite(booking: InviteBooking) {
  const recipients = CALENDAR_EMAILS.length > 0 ? CALENDAR_EMAILS : DRIVER_EMAILS;
  if (recipients.length === 0) return;
  const ics = buildBookingIcs(booking, recipients);
  if (!ics) return;

  const ref = booking.id.slice(0, 8).toUpperCase();
  const gcal = googleCalendarLink(booking);
  const when = `${booking.preferredDate ?? "TBC"} · ${formatPickupTime(booking.preferredTimeWindow)}`;

  const body = `
    <h2 style="margin:0 0 4px;font-size:20px;color:${BRAND.dark};">Trip Confirmed — Add to Calendar</h2>
    <p style="margin:0 0 20px;color:#666;font-size:14px;">Reference: <strong>#${ref}</strong></p>
    <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:20px;">
      ${row("Client", booking.clientName)}
      ${booking.clientCell ? row("Cell", booking.clientCell) : ""}
      ${row("Pickup", booking.pickupAddress)}
      ${row("Drop-off", booking.dropoffAddress)}
      ${row("When", when)}
      ${row("Passengers", String(booking.passengers))}
    </table>
    <p style="font-size:14px;color:#333;line-height:1.6;">
      The calendar invite is attached. If your Google Calendar is set to
      <strong>automatically add invitations</strong>, this trip is already on your calendar.
      Otherwise, tap the button below.
    </p>
    ${gcal ? `<table cellpadding="0" cellspacing="0" style="margin-top:12px;"><tr><td>
      <a href="${gcal}" style="display:inline-block;background:${BRAND.blue};color:#fff;font-weight:700;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px;">
        📅 Add to Google Calendar
      </a>
    </td></tr></table>` : ""}
  `;

  await getResend().emails.send({
    from: "Traveler Shuttles <noreply@travelershuttlesandtours.co.za>",
    to: recipients,
    subject: `Confirmed trip #${ref} — ${booking.clientName} (${booking.preferredDate ?? "TBC"})`,
    html: layout(body),
    attachments: [
      {
        filename: `trip-${ref}.ics`,
        content: Buffer.from(ics, "utf-8"),
        contentType: "text/calendar; method=REQUEST; charset=UTF-8",
      },
    ],
  });
}

// Contact-form enquiry — delivered to the business inbox(es). Reply-To is set to
// the enquirer so a reply goes straight back to them.
export async function sendEnquiry(enquiry: {
  name: string;
  email: string;
  phone?: string;
  message: string;
}) {
  if (DRIVER_EMAILS.length === 0) return;

  const body = `
    <h2 style="margin:0 0 4px;font-size:20px;color:${BRAND.dark};">New Website Enquiry</h2>
    <p style="margin:0 0 20px;color:#666;font-size:14px;">Submitted via the contact form.</p>
    <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:20px;">
      ${row("Name", enquiry.name)}
      ${row("Email", enquiry.email)}
      ${enquiry.phone ? row("Phone", enquiry.phone) : ""}
    </table>
    <p style="font-size:13px;color:#999;margin:0 0 6px;">Message</p>
    <p style="font-size:15px;color:#333;line-height:1.6;white-space:pre-wrap;background:#f9f9f9;border-radius:8px;padding:14px;">${enquiry.message.replace(/</g, "&lt;")}</p>
  `;

  await getResend().emails.send({
    from: "Traveler Shuttles <noreply@travelershuttlesandtours.co.za>",
    to: DRIVER_EMAILS,
    replyTo: enquiry.email,
    subject: `Website enquiry — ${enquiry.name}`,
    html: layout(body),
  });
}
