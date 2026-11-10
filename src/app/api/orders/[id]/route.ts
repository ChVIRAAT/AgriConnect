import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };
type OrderStatus = "pending" | "accepted" | "rejected" | "completed" | "cancelled";

const TRANSITIONS: Record<string, OrderStatus> = {
  accept: "accepted",
  reject: "rejected",
  complete: "completed",
  cancel: "cancelled",
};

export async function PATCH(request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please log in." }, { status: 401 });

  const { id } = await params;
  const orderId = Number(id);
  if (!Number.isSafeInteger(orderId) || orderId <= 0) {
    return NextResponse.json({ error: "Invalid order ID." }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await request.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return NextResponse.json({ error: "Invalid order update." }, { status: 400 });
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid order update." }, { status: 400 });
  }

  const action = body.action;
  const nextStatus = typeof action === "string" ? TRANSITIONS[action] : undefined;
  if (!nextStatus) return NextResponse.json({ error: "Invalid order action." }, { status: 400 });

  const database = await getDatabase();
  const transaction = await database.transaction("write");
  try {
    const result = await transaction.execute({
      sql: "SELECT id, crop_id, consumer_id, farmer_id, quantity, status FROM orders WHERE id = ?",
      args: [orderId],
    });
    const order = result.rows[0];
    if (!order) {
      await transaction.rollback();
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    const isFarmer = user.role === "farmer" && Number(order.farmer_id) === user.id;
    const isConsumer = user.role === "consumer" && Number(order.consumer_id) === user.id;
    if (!isFarmer && !isConsumer) {
      await transaction.rollback();
      return NextResponse.json({ error: "You cannot manage this order." }, { status: 403 });
    }

    const currentStatus = String(order.status);
    const allowed =
      (isFarmer && currentStatus === "pending" && (action === "accept" || action === "reject")) ||
      (isFarmer && currentStatus === "accepted" && action === "complete") ||
      (isConsumer && currentStatus === "pending" && action === "cancel");
    if (!allowed) {
      await transaction.rollback();
      return NextResponse.json(
        { error: "This action is not available for the current order status." },
        { status: 409 }
      );
    }

    if (action === "accept") {
      const stock = await transaction.execute({
        sql: `UPDATE crops SET quantity = quantity - ?
              WHERE id = ? AND is_active = 1 AND quantity >= ?`,
        args: [Number(order.quantity), Number(order.crop_id), Number(order.quantity)],
      });
      if (Number(stock.rowsAffected) !== 1) {
        await transaction.rollback();
        return NextResponse.json(
          { error: "There is not enough active stock to accept this order." },
          { status: 409 }
        );
      }
    }

    const now = new Date().toISOString();
    const changed = await transaction.execute({
      sql: "UPDATE orders SET status = ?, updated_at = ? WHERE id = ? AND status = ?",
      args: [nextStatus, now, orderId, currentStatus],
    });
    if (Number(changed.rowsAffected) !== 1) {
      await transaction.rollback();
      return NextResponse.json({ error: "The order status changed; refresh and try again." }, { status: 409 });
    }

    const notes: Record<string, string> = {
      accept: "Farmer accepted the order. The requested stock is now committed.",
      reject: "Farmer declined the order.",
      complete: "Farmer marked the order complete.",
      cancel: "Customer cancelled the pending order.",
    };
    await transaction.execute({
      sql: `INSERT INTO order_status_history (order_id, status, note, changed_by, created_at)
            VALUES (?, ?, ?, ?, ?)`,
      args: [orderId, nextStatus, notes[String(action)], user.id, now],
    });
    await transaction.commit();

    return NextResponse.json({ ok: true, status: nextStatus });
  } catch (error) {
    await transaction.rollback();
    console.error("order update error", error);
    return NextResponse.json({ error: "Could not update the order." }, { status: 500 });
  } finally {
    transaction.close();
  }
}
