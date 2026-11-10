import { NextResponse } from "next/server";
import { all, persistDatabase, run } from "@/lib/db";
import { hashPassword, newToken } from "@/lib/auth";
import { createSession } from "@/lib/session";

export async function POST(request: Request) {
  try {
    let body: Record<string, unknown>;
    try {
      const parsed: unknown = await request.json();
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        return NextResponse.json({ error: "Invalid registration details." }, { status: 400 });
      }
      body = parsed as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "Invalid registration details." }, { status: 400 });
    }

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const role = body.role;
    const farmName = typeof body.farm_name === "string" ? body.farm_name.trim() || null : null;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email and password are required." }, { status: 400 });
    }
    if (name.length > 100 || email.length > 254 || password.length > 128) {
      return NextResponse.json({ error: "Please shorten the supplied details." }, { status: 400 });
    }
    if (role !== "farmer" && role !== "consumer") {
      return NextResponse.json({ error: "Please choose a valid account type." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    if (role === "farmer" && !farmName) {
      return NextResponse.json({ error: "Farm name is required for farmer accounts." }, { status: 400 });
    }
    const phone = typeof body.phone === "string" ? body.phone.trim() || null : null;
    const location = typeof body.location === "string" ? body.location.trim() || null : null;
    const bio = typeof body.bio === "string" ? body.bio.trim() || null : null;
    const avatar = typeof body.avatar === "string" && body.avatar.trim()
      ? body.avatar.trim()
      : role === "farmer" ? "🧑‍🌾" : "🙂";

    const existing = await all("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const hash = hashPassword(password);
    const now = new Date().toISOString();
    await run(
      `INSERT INTO users (name, email, password_hash, role, phone, avatar, location, farm_name, bio, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, hash, role, phone, avatar, location, farmName, bio, now]
    );
    const created = await all<{ id: number }>("SELECT id FROM users WHERE email = ?", [email]);
    const userId = created[0]?.id;
    if (!userId) {
      throw new Error("The new account could not be loaded after registration.");
    }

    const token = newToken();
    await createSession(userId, token);
    await persistDatabase();

    return NextResponse.json({ ok: true, role });
  } catch (err) {
    if (err instanceof Error && err.message.includes("UNIQUE constraint failed: users.email")) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }
    console.error("register error", err);
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
  }
}
