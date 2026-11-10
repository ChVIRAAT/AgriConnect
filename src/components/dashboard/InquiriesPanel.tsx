"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export type ListingInquiry = {
  id: number;
  crop_title: string;
  name: string;
  phone: string;
  email: string | null;
  message: string;
  quantity: number;
  status: "new" | "contacted" | "closed";
  created_at: string;
};

const STATUS_STYLES: Record<ListingInquiry["status"], string> = {
  new: "bg-gold-200 text-gold-800",
  contacted: "bg-leaf-100 text-leaf-700",
  closed: "bg-soil-200 text-soil-700",
};

function timeAgo(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.round(diff / 60000);
    if (mins < 60) return `${Math.max(1, mins)} min ago`;
    const hrs = Math.round(mins / 60);
    if (hrs < 24) return `${hrs} hr${hrs === 1 ? "" : "s"} ago`;
    const days = Math.round(hrs / 24);
    return `${days} day${days === 1 ? "" : "s"} ago`;
  } catch {
    return "";
  }
}

export function InquiriesPanel({ inquiries }: { inquiries: ListingInquiry[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState(0);

  async function setStatus(inq: ListingInquiry, status: ListingInquiry["status"]) {
    setBusyId(inq.id);
    await fetch(`/api/inquiries/${inq.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setBusyId(0);
    router.refresh();
  }

  const fresh = inquiries.filter((i) => i.status === "new").length;

  return (
    <section className="rounded-[2rem] border border-forest-100 bg-white p-6 shadow-[0_10px_30px_-22px_rgba(36,89,63,0.5)] sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-black text-forest-900">Buyer inquiries</h2>
          <p className="text-sm text-soil-500">
            {inquiries.length} total · {fresh} waiting for your reply
          </p>
        </div>
        {fresh > 0 && (
          <span className="pulse-soft inline-flex items-center gap-1.5 rounded-full bg-gold-200 px-3 py-1 text-xs font-bold text-gold-800">
            <span aria-hidden>🔔</span> {fresh} new
          </span>
        )}
      </div>

      {inquiries.length === 0 ? (
        <div className="mt-4 rounded-3xl border border-dashed border-leaf-300 bg-leaf-50/40 p-10 text-center">
          <span aria-hidden className="text-4xl">📭</span>
          <p className="mt-2 font-display text-lg font-bold text-forest-900">No inquiries yet</p>
          <p className="mt-1 text-sm text-soil-500">
            When a buyer messages you about a crop, it lands here — with their phone number to
            call straight back.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {inquiries.map((inq) => (
            <div
              key={inq.id}
              className={`rounded-3xl border p-5 ${
                inq.status === "new" ? "border-gold-200 bg-gold-50/50" : "border-forest-100 bg-[#faf7ef]"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${STATUS_STYLES[inq.status]}`}>
                      {inq.status}
                    </span>
                    <p className="font-display text-base font-bold text-forest-900">{inq.name}</p>
                    <span className="text-xs text-soil-400">· {timeAgo(inq.created_at)}</span>
                  </div>
                  <p className="mt-1 text-xs font-semibold text-leaf-700">
                    🧺 Wants {inq.quantity.toLocaleString("en-IN")} · {inq.crop_title}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-soil-700">“{inq.message}”</p>
                  <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-forest-700">
                    <a href={`tel:${inq.phone.replace(/\s+/g, "")}`} className="underline decoration-gold-300 decoration-2 underline-offset-2 hover:text-forest-900">
                      📞 {inq.phone}
                    </a>
                    {inq.email && <span>✉️ {inq.email}</span>}
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  {inq.status === "new" && (
                    <>
                      <button
                        onClick={() => setStatus(inq, "contacted")}
                        disabled={busyId === inq.id}
                        className="rounded-full border border-leaf-400 bg-white px-4 py-2 text-xs font-bold text-leaf-700 transition-colors hover:bg-leaf-500 hover:text-white disabled:opacity-50"
                      >
                        📞 Mark contacted
                      </button>
                      <button
                        onClick={() => setStatus(inq, "closed")}
                        disabled={busyId === inq.id}
                        className="rounded-full border border-soil-200 bg-white px-4 py-2 text-xs font-bold text-soil-600 transition-colors hover:bg-soil-100 disabled:opacity-50"
                      >
                        Close
                      </button>
                    </>
                  )}
                  {inq.status === "contacted" && (
                    <button
                      onClick={() => setStatus(inq, "closed")}
                      disabled={busyId === inq.id}
                      className="rounded-full border border-soil-200 bg-white px-4 py-2 text-xs font-bold text-soil-600 transition-colors hover:bg-soil-100 disabled:opacity-50"
                    >
                      Close
                    </button>
                  )}
                  {inq.status === "closed" && (
                    <button
                      onClick={() => setStatus(inq, "contacted")}
                      disabled={busyId === inq.id}
                      className="rounded-full border border-soil-200 bg-white px-4 py-2 text-xs font-bold text-soil-600 transition-colors hover:bg-soil-100 disabled:opacity-50"
                    >
                      Reopen
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export type ConsumerInquiry = ListingInquiry & {
  price: number;
  unit: string;
  farmer_name: string;
  farmer_avatar: string;
};

export function MySentInquiries({ inquiries }: { inquiries: ConsumerInquiry[] }) {
  return (
    <section className="rounded-[2rem] border border-forest-100 bg-white p-6 shadow-[0_10px_30px_-22px_rgba(36,89,63,0.5)] sm:p-8">
      <div>
        <h2 className="font-display text-2xl font-black text-forest-900">My inquiries</h2>
        <p className="text-sm text-soil-500">
          {inquiries.length} sent to farmers · they&apos;ll call the phone number you gave
        </p>
      </div>

      {inquiries.length === 0 ? (
        <div className="mt-4 rounded-3xl border border-dashed border-leaf-300 bg-leaf-50/40 p-10 text-center">
          <span aria-hidden className="text-4xl">🧺</span>
          <p className="mt-2 font-display text-lg font-bold text-forest-900">Nothing here yet</p>
          <p className="mt-1 text-sm text-soil-500">
            Find a crop you love and send the farmer a message — most reply the same day.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {inquiries.map((inq) => (
            <div key={inq.id} className="rounded-3xl border border-forest-100 bg-[#faf7ef] p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${STATUS_STYLES[inq.status]}`}>
                  {inq.status === "new" ? "waiting for farmer" : inq.status}
                </span>
                <p className="font-display text-base font-bold text-forest-900">{inq.crop_title}</p>
                <span className="text-xs text-soil-400">· {timeAgo(inq.created_at)}</span>
              </div>
              <p className="mt-1 text-xs font-semibold text-leaf-700">
                {inq.farmer_avatar} {inq.farmer_name} · ₹{inq.price} / {inq.unit} · wanted {inq.quantity.toLocaleString("en-IN")}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-soil-700">“{inq.message}”</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
