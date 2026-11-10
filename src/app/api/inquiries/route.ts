import { NextResponse } from "next/server";
import { all, persistDatabase, run } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    let body: Record<string, unknown>;
    try {
      const parsed: unknown = await request.json();
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        return NextResponse.json({ error: "Invalid inquiry details." }, { status: 400 });
      }
      body = parsed as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "Invalid inquiry details." }, { status: 400 });
    }
    const cropId = Number(body.cropId);
    const name = String(body.name ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const email = String(body.email ?? "").trim() || null;
    const message = String(body.message ?? "").trim();
    const quantity = body.quantity == null || body.quantity === ""
      ? 1
      : Number(body.quantity);

    if (!Number.isSafeInteger(cropId) || cropId <= 0) {
      return NextResponse.json({ error: "Invalid crop." }, { status: 400 });
    }
    if (!name || !phone || !message) {
      return NextResponse.json({ error: "Name, phone and message are required." }, { status: 400 });
    }
    if (!Number.isSafeInteger(quantity) || quantity <= 0) {
      return NextResponse.json({ error: "Quantity must be a positive whole number." }, { status: 400 });
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const cropRows = await all<{ farmer_id: number }>("SELECT farmer_id FROM crops WHERE id = ?", [cropId]);
    if (cropRows.length === 0) {
      return NextResponse.json({ error: "This crop is no longer available." }, { status: 404 });
    }

    const user = await getCurrentUser();
    const now = new Date().toISOString();
    await run(
      `INSERT INTO inquiries (crop_id, consumer_id, farmer_id, name, phone, email, message, quantity, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'new', ?)`,
      [cropId, user?.id ?? null, cropRows[0].farmer_id, name, phone, email, message, quantity, now]
    );
    await persistDatabase();

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("inquiry create error", err);
    return NextResponse.json({ error: "Could not send the inquiry." }, { status: 500 });
  }
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please log in." }, { status: 401 });

  if (user.role === "farmer") {
    const rows = await all(
      `SELECT i.*, c.title AS crop_title, c.unit
       FROM inquiries i JOIN crops c ON c.id = i.crop_id
       WHERE i.farmer_id = ? ORDER BY i.created_at DESC, i.id DESC`,
      [user.id]
    );
    return NextResponse.json({ inquiries: rows });
  }

  const rows = await all(
    `SELECT i.*, c.title AS crop_title, c.price, c.unit, u.name AS farmer_name, u.avatar AS farmer_avatar
     FROM inquiries i JOIN crops c ON c.id = i.crop_id JOIN users u ON u.id = i.farmer_id
     WHERE i.consumer_id = ? ORDER BY i.created_at DESC, i.id DESC`,
    [user.id]
  );
  return NextResponse.json({ inquiries: rows });
}
