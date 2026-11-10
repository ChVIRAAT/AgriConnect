import { NextResponse } from "next/server";
import { all, persistDatabase, run } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

async function requireOwnedCrop(cropId: number, userId: number) {
  const rows = await all<{ id: number; farmer_id: number }>("SELECT id, farmer_id FROM crops WHERE id = ?", [cropId]);
  if (rows.length === 0) return { error: "Listing not found.", status: 404 as const };
  if (rows[0].farmer_id !== userId) return { error: "You can only manage your own listings.", status: 403 as const };
  return { crop: rows[0] };
}

export async function PATCH(request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user || user.role !== "farmer") {
    return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  }
  const { id } = await params;
  const cropId = Number(id);
  if (!Number.isSafeInteger(cropId) || cropId <= 0) {
    return NextResponse.json({ error: "Invalid listing ID." }, { status: 400 });
  }
  const owned = await requireOwnedCrop(cropId, user.id);
  if ("error" in owned) return NextResponse.json({ error: owned.error }, { status: owned.status });

  try {
    let body: Record<string, unknown>;
    try {
      const parsed: unknown = await request.json();
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        return NextResponse.json({ error: "Invalid listing details." }, { status: 400 });
      }
      body = parsed as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "Invalid listing details." }, { status: 400 });
    }

    if (typeof body.is_active === "boolean") {
      await run("UPDATE crops SET is_active = ? WHERE id = ?", [body.is_active ? 1 : 0, cropId]);
      await persistDatabase();
      return NextResponse.json({ ok: true });
    }

    const title = String(body.title ?? "").trim();
    const category = String(body.category ?? "").trim();
    const description = String(body.description ?? "").trim();
    const price = Number(body.price);
    const unit = String(body.unit ?? "kg").trim() || "kg";
    const quantity = Number(body.quantity);
    const harvestDate = String(body.harvest_date ?? "").trim();

    if (!title || !category || !description) {
      return NextResponse.json({ error: "Title, category and description are required." }, { status: 400 });
    }
    if (!Number.isFinite(price) || price <= 0 || !Number.isSafeInteger(quantity) || quantity <= 0) {
      return NextResponse.json({ error: "Price and quantity must be positive; quantity must be a whole number." }, { status: 400 });
    }
    const harvest = new Date(`${harvestDate}T00:00:00.000Z`);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(harvestDate) ||
      Number.isNaN(harvest.getTime()) ||
      harvest.toISOString().slice(0, 10) !== harvestDate
    ) {
      return NextResponse.json({ error: "Harvest date must be a valid date." }, { status: 400 });
    }

    await run(
      `UPDATE crops SET title = ?, category = ?, description = ?, price = ?, unit = ?, quantity = ?, harvest_date = ?
       WHERE id = ?`,
      [title, category, description, price, unit, quantity, harvestDate, cropId]
    );
    await persistDatabase();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("crop update error", err);
    return NextResponse.json({ error: "Could not update the listing." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user || user.role !== "farmer") {
    return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  }
  const { id } = await params;
  const cropId = Number(id);
  if (!Number.isSafeInteger(cropId) || cropId <= 0) {
    return NextResponse.json({ error: "Invalid listing ID." }, { status: 400 });
  }
  const owned = await requireOwnedCrop(cropId, user.id);
  if ("error" in owned) return NextResponse.json({ error: owned.error }, { status: owned.status });

  try {
    await run("UPDATE crops SET is_active = 0 WHERE id = ?", [cropId]);
    await persistDatabase();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("crop delete error", err);
    return NextResponse.json({ error: "Could not delete the listing." }, { status: 500 });
  }
}
