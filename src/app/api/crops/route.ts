import { NextResponse } from "next/server";
import { all, persistDatabase, run } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { listCrops } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const crops = await listCrops({
    q: url.searchParams.get("q") ?? undefined,
    category: url.searchParams.get("category") ?? undefined,
    organic: url.searchParams.get("organic") === "1",
    location: url.searchParams.get("location") ?? undefined,
    sort: url.searchParams.get("sort") ?? undefined,
    farmerId: url.searchParams.get("farmerId")
      ? Number(url.searchParams.get("farmerId"))
      : undefined,
  });
  return NextResponse.json({ crops });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "farmer") {
    return NextResponse.json({ error: "Only farmer accounts can list crops." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const title = String(body.title ?? "").trim();
    const category = String(body.category ?? "").trim();
    const description = String(body.description ?? "").trim();
    const price = Number(body.price);
    const unit = String(body.unit ?? "kg").trim() || "kg";
    const quantity = Number(body.quantity);
    const harvestDate = String(body.harvest_date ?? "").trim();
    const organic = body.organic ? 1 : 0;

    if (!title || !category || !description) {
      return NextResponse.json({ error: "Title, category and description are required." }, { status: 400 });
    }
    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json({ error: "Price must be a positive number." }, { status: 400 });
    }
    if (!Number.isFinite(quantity) || quantity <= 0) {
      return NextResponse.json({ error: "Quantity must be a positive number." }, { status: 400 });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(harvestDate)) {
      return NextResponse.json({ error: "Harvest date must be a valid date." }, { status: 400 });
    }

    const now = new Date().toISOString();
    await run(
      `INSERT INTO crops (farmer_id, title, category, description, price, unit, quantity, harvest_date, location, organic, is_active, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
      [user.id, title, category, description, price, unit, quantity, harvestDate, user.location ?? "India", organic, now]
    );
    await persistDatabase();

    const created = await all<{ id: number }>(
      "SELECT id FROM crops WHERE farmer_id = ? ORDER BY id DESC LIMIT 1",
      [user.id]
    );
    return NextResponse.json({ ok: true, id: created[0]?.id });
  } catch (err) {
    console.error("crop create error", err);
    return NextResponse.json({ error: "Could not create the listing." }, { status: 500 });
  }
}
