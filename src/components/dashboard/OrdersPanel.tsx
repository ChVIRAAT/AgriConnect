"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export type OrderHistoryItem = {
  id: number;
  order_id: number;
  status: "pending" | "accepted" | "rejected" | "completed" | "cancelled";
  note: string | null;
  created_at: string;
};

export type ManagedOrder = {
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
  status: OrderHistoryItem["status"];
  created_at: string;
  updated_at: string;
  farmer_id: number;
  consumer_id: number;
  farmer_name: string;
  consumer_name: string;
  history: OrderHistoryItem[];
};

const STATUS_STYLE: Record<ManagedOrder["status"], string> = {
  pending: "bg-gold-200 text-gold-800",
  accepted: "bg-leaf-100 text-leaf-700",
  rejected: "bg-red-100 text-red-700",
  completed: "bg-forest-100 text-forest-700",
  cancelled: "bg-soil-200 text-soil-700",
};

const ACTIONS: Record<"farmer" | "consumer", Array<{ action: string; label: string }>> = {
  farmer: [
    { action: "accept", label: "Accept order" },
    { action: "reject", label: "Decline" },
    { action: "complete", label: "Mark complete" },
  ],
  consumer: [{ action: "cancel", label: "Cancel request" }],
};

export function OrdersPanel({
  orders,
  role,
}: {
  orders: ManagedOrder[];
  role: "farmer" | "consumer";
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState(0);
  const [error, setError] = useState("");

  async function updateOrder(orderId: number, action: string) {
    setBusyId(orderId);
    setError("");
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error ?? "Could not update the order.");
      router.refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not update the order.");
    } finally {
      setBusyId(0);
    }
  }

  return (
    <section className="rounded-[2rem] border border-forest-100 bg-white p-6 shadow-[0_10px_30px_-22px_rgba(36,89,63,0.5)] sm:p-8">
      <div>
        <h2 className="font-display text-2xl font-black text-forest-900">
          {role === "farmer" ? "Customer orders" : "My orders"}
        </h2>
        <p className="text-sm text-soil-500">
          Payment and delivery are arranged directly; AgriConnect does not collect payment.
        </p>
      </div>
      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-2.5 text-xs font-semibold text-red-700">{error}</p>}
      {orders.length === 0 ? (
        <div className="mt-4 rounded-3xl border border-dashed border-leaf-300 bg-leaf-50/40 p-8 text-center">
          <p className="font-display text-lg font-bold text-forest-900">No orders yet</p>
          <p className="mt-1 text-sm text-soil-500">
            {role === "farmer" ? "Customer order requests will appear here." : "Order requests you place will appear here."}
          </p>
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {orders.map((order) => {
            const availableActions = ACTIONS[role].filter(({ action }) =>
              action === "accept" || action === "reject"
                ? role === "farmer" && order.status === "pending"
                : action === "complete"
                  ? role === "farmer" && order.status === "accepted"
                  : role === "consumer" && order.status === "pending"
            );
            return (
              <article key={order.id} className="rounded-3xl border border-forest-100 bg-[#faf7ef] p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase ${STATUS_STYLE[order.status]}`}>
                      {order.status}
                    </span>
                    <h3 className="mt-2 font-display text-lg font-bold text-forest-900">
                      {order.crop_title} · {order.quantity.toLocaleString("en-IN")} {order.unit}
                    </h3>
                    <p className="mt-1 text-sm font-semibold text-forest-700">
                      ₹{order.unit_price} / {order.unit} · Total ₹{order.total_price}
                    </p>
                    <p className="mt-1 text-xs text-soil-600">
                      {role === "farmer" ? `Customer: ${order.customer_name} · ${order.customer_phone}` : `Farmer: ${order.farmer_name}`}
                    </p>
                    {order.message && <p className="mt-2 text-sm text-soil-700">“{order.message}”</p>}
                  </div>
                  {availableActions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {availableActions.map(({ action, label }) => (
                        <button
                          key={action}
                          type="button"
                          disabled={busyId === order.id}
                          onClick={() => updateOrder(order.id, action)}
                          className={`rounded-full px-4 py-2 text-xs font-bold disabled:opacity-50 ${
                            action === "reject" || action === "cancel"
                              ? "border border-soil-200 bg-white text-soil-700"
                              : "bg-forest-600 text-white"
                          }`}
                        >
                          {busyId === order.id ? "Saving..." : label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <ol aria-label={`Order ${order.id} status history`} className="mt-4 space-y-2 border-l-2 border-leaf-200 pl-4">
                  {order.history.map((event) => (
                    <li key={event.id} className="text-xs text-soil-600">
                      <strong className="capitalize text-forest-800">{event.status}</strong>
                      {event.note && ` · ${event.note}`}
                      <span className="ml-1">{new Date(event.created_at).toLocaleString("en-IN")}</span>
                    </li>
                  ))}
                </ol>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
