import { NextResponse } from "next/server";
import { all, persistDatabase, run } from "@/lib/db";
import { newToken, verifyPassword } from "@/lib/auth";
import { createSession } from "@/lib/session";

export async function POST(request: Request) {
  try {
    let body: Record<string, unknown>;
    try {
      const parsed: unknown = await request.json();
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        return NextResponse.json({ error: "Invalid login details." }, { status: 400 });
      }
      body = parsed as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "Invalid login details." }, { status: 400 });
    }

    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }
    if (email.length > 254 || password.length > 128) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const rows = await all<{ id: number; password_hash: string }>(
      "SELECT id, password_hash FROM users WHERE email = ?",
      [email]
    );
    if (rows.length === 0) {
      return NextResponse.json({ error: "No account found with this email." }, { status: 401 });
    }
    const user = rows[0];
    if (!verifyPassword(password, user.password_hash)) {
      return NextResponse.json({ error: "Incorrect password. Please try again." }, { status: 401 });
    }

    const token = newToken();
    await createSession(user.id, token);
    await persistDatabase();

    const roleRows = await all<{ role: string }>("SELECT role FROM users WHERE id = ?", [user.id]);
    return NextResponse.json({ ok: true, role: roleRows[0]?.role ?? "consumer" });
  } catch (err) {
    console.error("login error", err);
    return NextResponse.json({ error: "Login failed. Please try again." }, { status: 500 });
  }
}
