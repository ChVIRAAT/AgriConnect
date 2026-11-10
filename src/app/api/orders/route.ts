import { NextResponse } from "next/server";
import { all, getDatabase } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

type OrderStatus = "pending" | "accepted" | "rejected" | "completed" | "cancelled";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please log in." }, { status: 401 });

  const ownershipColumn = user.role === "farmer" ? "farmer_id" : "consumer_id";
  const orders = await all<{
    id: number;
    crop_id: number;
    crop_title: string;
    unit: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    customer_name: string;
    customer_phone: string;
    message: string | null;
    status: OrderStatus;
    created_at: string;
    updated_at: string;
    farmer_id: number;
    consumer_id: number;
    farmer_name: string;
    consumer_name: string;
  }>(
    `SELECT o.id, o.crop_id, c.title AS crop_title, c.unit, o.quantity,
            o.unit_price, o.total_price, o.customer_name, o.customer_phone,
            o.message, o.status, o.created_at, o.updated_at,
            o.farmer_id, o.consumer_id, f.name AS farmer_name, u.name AS consumer_name
     FROM orders o
     JOIN crops c ON c.id = o.crop_id
     JOIN users f ON f.id = o.farmer_id
     JOIN users u ON u.id = o.consumer_id
     WHERE o.${ownershipColumn} = ?
     ORDER BY o.created_at DESC, o.id DESC`,
    [user.id]
  );
  const history =
    orders.length === 0
      ? []
      : await all<{
          id: number;
          order_id: number;
          status: OrderStatus;
          note: string | null;
          created_at: string;
        }>(
          `SELECT id, order_id, status, note, created_at
           FROM order_status_history
           WHERE order_id IN (${orders.map(() => "?").join(",")})
           ORDER BY created_at, id`,
          orders.map((order) => order.id)
        );

  return NextResponse.json({
    orders: orders.map((order) => ({
      ...order,
      history: history.filter((event) => event.order_id === order.id),
    })),
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "consumer") {
    return NextResponse.json({ error: "Only customer accounts can place orders." }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await request.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return NextResponse.json({ error: "Invalid order details." }, { status: 400 });
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid order details." }, { status: 400 });
  }

  const cropId = Number(body.cropId);
  const quantity = Number(body.quantity);
  const customerName =
    typeof body.customerName === "string" ? body.customerName.trim() : user.name;
  const customerPhone =
    typeof body.customerPhone === "string" ? body.customerPhone.trim() : user.phone ?? "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!Number.isSafeInteger(cropId) || cropId <= 0) {
    return NextResponse.json({ error: "Choose a valid crop." }, { status: 400 });
  }
  if (!Number.isSafeInteger(quantity) || quantity <= 0) {
    return NextResponse.json({ error: "Order quantity must be a positive whole number." }, { status: 400 });
  }
  if (!customerName || customerName.length > 100 || !customerPhone || customerPhone.length > 40) {
    return NextResponse.json({ error: "Enter a valid contact name and phone number." }, { status: 400 });
  }
  if (message.length > 1000) {
    return NextResponse.json({ error: "Order note must be 1,000 characters or fewer." }, { status: 400 });
  }

  const database = await getDatabase();
  const transaction = await database.transaction("write");
  try {
    const cropResult = await transaction.execute({
      sql: `SELECT farmer_id, price, quantity, unit, is_active
            FROM crops WHERE id = ?`,
      args: [cropId],
    });
    const crop = cropResult.rows[0];
    if (!crop || Number(crop.is_active) !== 1) {
      await transaction.rollback();
      return NextResponse.json({ error: "This crop is no longer available." }, { status: 404 });
    }
    if (quantity > Number(crop.quantity)) {
      await transaction.rollback();
      return NextResponse.json(
        { error: `Only ${Number(crop.quantity).toLocaleString("en-IN")} ${String(crop.unit)} available.` },
        { status: 409 }
      );
    }

    const unitPrice = Number(crop.price);
    const totalPrice = Math.round(unitPrice * quantity * 100) / 100;
    if (!Number.isFinite(unitPrice) || unitPrice <= 0 || !Number.isFinite(totalPrice)) {
      await transaction.rollback();
      return NextResponse.json({ error: "This crop has an invalid price and cannot be ordered." }, { status: 409 });
    }
    const now = new Date().toISOString();
    const inserted = await transaction.execute({
      sql: `INSERT INTO orders
              (crop_id, consumer_id, farmer_id, quantity, unit_price, total_price,
               customer_name, customer_phone, message, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
      args: [
        cropId,
        user.id,
        Number(crop.farmer_id),
        quantity,
        unitPrice,
        totalPrice,
        customerName,
        customerPhone,
        message || null,
        now,
        now,
      ],
    });
    const orderId = Number(inserted.lastInsertRowid);
    await transaction.execute({
      sql: `INSERT INTO order_status_history (order_id, status, note, changed_by, created_at)
            VALUES (?, 'pending', ?, ?, ?)`,
      args: [orderId, "Order request sent to the farmer.", user.id, now],
    });
    await transaction.commit();

    return NextResponse.json({ ok: true, orderId, status: "pending", totalPrice }, { status: 201 });
  } catch (error) {
    await transaction.rollback();
    console.error("order create error", error);
    return NextResponse.json({ error: "Could not place the order request." }, { status: 500 });
  } finally {
    transaction.close();
  }
}
