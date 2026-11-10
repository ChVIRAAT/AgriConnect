import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { all } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { MyListings, type ManagedCrop } from "@/components/dashboard/MyListings";
import {
  InquiriesPanel,
  MySentInquiries,
  type ListingInquiry,
  type ConsumerInquiry,
} from "@/components/dashboard/InquiriesPanel";
import { OrdersPanel, type ManagedOrder } from "@/components/dashboard/OrdersPanel";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage your crops and buyer inquiries on AgriConnect.",
};

export const dynamic = "force-dynamic";

async function loadOrders(userId: number, role: "farmer" | "consumer"): Promise<ManagedOrder[]> {
  const ownerColumn = role === "farmer" ? "farmer_id" : "consumer_id";
  const orders = await all<Omit<ManagedOrder, "history">>(
    `SELECT o.id, o.crop_id, c.title AS crop_title, c.unit, o.quantity,
            o.unit_price, o.total_price, o.customer_name, o.customer_phone,
            o.message, o.status, o.created_at, o.updated_at,
            o.farmer_id, o.consumer_id, f.name AS farmer_name, u.name AS consumer_name
     FROM orders o
     JOIN crops c ON c.id = o.crop_id
     JOIN users f ON f.id = o.farmer_id
     JOIN users u ON u.id = o.consumer_id
     WHERE o.${ownerColumn} = ? ORDER BY o.created_at DESC, o.id DESC`,
    [userId]
  );
  if (orders.length === 0) return [];

  const history = await all<ManagedOrder["history"][number]>(
    `SELECT id, order_id, status, note, created_at
     FROM order_status_history
     WHERE order_id IN (${orders.map(() => "?").join(",")})
     ORDER BY created_at, id`,
    orders.map((order) => order.id)
  );
  return orders.map((order) => ({
    ...order,
    history: history.filter((event) => event.order_id === order.id),
  }));
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const greeting = `Namaste, ${user.name.split(" ")[0]}! 🙏`;

  if (user.role === "consumer") {
    const [inquiries, orders] = await Promise.all([
      all<ConsumerInquiry>(
        `SELECT i.id, i.crop_id, c.title AS crop_title, c.price, c.unit, i.quantity, i.status,
                i.message, i.farmer_response, i.responded_at, i.created_at,
                u.name AS farmer_name, u.avatar AS farmer_avatar
         FROM inquiries i JOIN crops c ON c.id = i.crop_id JOIN users u ON u.id = i.farmer_id
         WHERE i.consumer_id = ? ORDER BY i.created_at DESC, i.id DESC`,
        [user.id]
      ),
      loadOrders(user.id, "consumer"),
    ]);

    return (
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <header className="rise mb-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-forest-200 bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-forest-700">
            <span aria-hidden>👨‍🌾</span> Consumer dashboard
          </span>
          <h1 className="mt-3 font-display text-4xl font-black text-forest-900">{greeting}</h1>
          <p className="mt-2 text-sm leading-relaxed text-soil-600">
            Your messages to farmers live here. When they reply, they call you directly — no
            middleman in between. <Link href="/crops" className="font-bold text-leaf-600 hover:underline">Ready to find something fresh? →</Link>
          </p>
        </header>
        <div className="space-y-8">
          <OrdersPanel orders={orders} role="consumer" />
          <MySentInquiries inquiries={inquiries} />
        </div>
      </div>
    );
  }

  // Farmer dashboard
  const crops = await all<ManagedCrop & { inquiries: number }>(
    `SELECT c.id, c.title, c.category, c.description, c.price, c.unit, c.quantity,
            c.harvest_date, c.location, c.organic, c.is_active,
            (SELECT COUNT(*) FROM inquiries i WHERE i.crop_id = c.id) AS inquiries
     FROM crops c WHERE c.farmer_id = ? ORDER BY c.created_at DESC, c.id DESC`,
    [user.id]
  );

  const [inquiries, orders] = await Promise.all([
    all<ListingInquiry>(
      `SELECT i.id, c.title AS crop_title, i.name, i.phone, i.email, i.message,
              i.quantity, i.status, i.farmer_response, i.responded_at, i.created_at
       FROM inquiries i JOIN crops c ON c.id = i.crop_id
       WHERE i.farmer_id = ? ORDER BY i.created_at DESC, i.id DESC`,
      [user.id]
    ),
    loadOrders(user.id, "farmer"),
  ]);

  const liveCount = crops.filter((c) => c.is_active === 1).length;
  const newCount = inquiries.filter((i) => i.status === "new").length;
  const hasLocation = Boolean(user.location);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="rise mb-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-forest-200 bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-forest-700">
          <span aria-hidden>🧑‍🌾</span> Farmer dashboard · {liveCount} live listing{liveCount === 1 ? "" : "s"} · {newCount} new {newCount === 1 ? "inquiry" : "inquiries"}
        </span>
        <h1 className="mt-3 font-display text-4xl font-black text-forest-900">{greeting}</h1>
        <p className="mt-2 text-sm leading-relaxed text-soil-600">
          List your harvest, keep your listings fresh and call buyers back — they&apos;re waiting
          with real demand, {user.farm_name ? `from ${user.farm_name}` : "from your farm"}.
        </p>
      </header>

      {!hasLocation && (
        <div className="mb-8 rounded-3xl border border-gold-200 bg-gold-50 p-5 text-sm leading-relaxed text-gold-800">
          <span aria-hidden className="mr-1.5">📍</span>
          Your farm location hasn&apos;t been set, so new listings will default to &quot;India&quot;.
          Mention your village/district in each listing description, or re-register to update your
          profile location.
        </div>
      )}

      <div className="space-y-8">
        <MyListings crops={crops} farmLocation={user.location} />
        <OrdersPanel orders={orders} role="farmer" />
        <InquiriesPanel inquiries={inquiries} />
      </div>
    </div>
  );
}
