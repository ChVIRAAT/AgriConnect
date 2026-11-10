import { NextResponse } from "next/server";
import { all, persistDatabase, run } from "@/lib/db";
import { hashPassword, newToken } from "@/lib/auth";
import { createSession } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    const role = body.role === "farmer" ? "farmer" : "consumer";
    const phone = String(body.phone ?? "").trim() || null;
    const location = String(body.location ?? "").trim() || null;
    const farmName = String(body.farm_name ?? "").trim() || null;
    const bio = String(body.bio ?? "").trim() || null;
    const avatar = String(body.avatar ?? "").trim() || (role === "farmer" ? "🧑‍🌾" : "🙂");

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email and password are required." }, { status: 400 });
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
    const userId = created[0].id;

    const token = newToken();
    await createSession(userId, token);
    await persistDatabase();

    return NextResponse.json({ ok: true, role });
  } catch (err) {
    console.error("register error", err);
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
  }
}
