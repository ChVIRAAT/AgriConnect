import { NextResponse } from "next/server";
import { all, persistDatabase, run } from "@/lib/db";
import { hashPassword, newToken, verifyPassword } from "@/lib/auth";
import { createSession } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const rows = await all<{ id: number; password_hash: string }>(
      "SELECT id, password_hash FROM users WHERE email = ?",
      [email]
    );
    if (rows.length === 0) {
      return NextResponse.json({ error: "No account found with this email." }, { status: 401 });
    }
    const user = rows[0];
    let hash = user.password_hash;

    // Demo accounts created by the seeder accept the shared demo password,
    // then transparently upgrade to a real scrypt hash.
    if (hash.startsWith("$SEED$")) {
      if (password !== "farm123") {
        return NextResponse.json({ error: "Incorrect password for the demo account (try farm123)." }, { status: 401 });
      }
      hash = hashPassword(password);
      await run("UPDATE users SET password_hash = ? WHERE id = ?", [hash, user.id]);
    } else if (!verifyPassword(password, hash)) {
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
