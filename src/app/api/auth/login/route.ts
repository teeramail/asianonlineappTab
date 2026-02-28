import { type NextRequest, NextResponse } from "next/server";

const VALID_EMAIL = "samuimarket1@gmail.com";
const VALID_PASSWORD = "84140";
const SESSION_COOKIE = "dashboard_session";
const SESSION_VALUE = "authenticated";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { email?: string; password?: string };

  if (body.email === VALID_EMAIL && body.password === VALID_PASSWORD) {
    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE, SESSION_VALUE, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return res;
  }

  return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
}
