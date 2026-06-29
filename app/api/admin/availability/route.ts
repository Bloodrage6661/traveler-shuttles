import { NextRequest, NextResponse } from "next/server";
import { markUnavailable, markAvailable } from "@/lib/availability";
import { verifyAdminCookie } from "@/app/api/admin/login/route";

function auth(req: NextRequest) {
  return verifyAdminCookie(req.cookies.get("admin_session")?.value);
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { date, note } = await req.json();
  await markUnavailable(date, note);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { date } = await req.json();
  await markAvailable(date);
  return NextResponse.json({ ok: true });
}
