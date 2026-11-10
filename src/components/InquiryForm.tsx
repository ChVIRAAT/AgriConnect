"use client";

import { useState } from "react";

export function InquiryForm({
  cropId,
  isLoggedIn,
  consumerName,
  consumerPhone,
  consumerEmail,
}: {
  cropId: number;
  isLoggedIn: boolean;
  consumerName?: string;
  consumerPhone?: string;
  consumerEmail?: string;
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    const fd = new FormData(e.currentTarget);
    const payload = {
      cropId,
      name: fd.get("name"),
      phone: fd.get("phone"),
      email: fd.get("email"),
      message: fd.get("message"),
      quantity: fd.get("quantity"),
    };
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setStatus("sent");
      } else {
        let msg = "Could not send your inquiry. Please try again.";
        try {
          const data = await res.json();
          if (data?.error) msg = data.error;
        } catch {
          msg = "The inquiry could not be processed. Please try again.";
        }
        setError(msg);
        setStatus("error");
      }
    } catch {
      setError("Could not reach AgriConnect. Check your connection and try again.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-3xl border border-leaf-200 bg-leaf-50 p-6 text-center">
        <span aria-hidden className="text-4xl">📨</span>
        <h3 className="mt-2 font-display text-lg font-bold text-forest-900">Inquiry sent!</h3>
        <p className="mt-1 text-sm text-soil-600">
          The farmer will contact you on the phone number you provided. No middleman — just you
          and the farm.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-3xl border border-forest-100 bg-white p-6 shadow-[0_10px_30px_-22px_rgba(36,89,63,0.5)]">
      <h3 className="font-display text-lg font-bold text-forest-900">Contact the farmer directly</h3>
      <p className="mt-1 text-xs leading-relaxed text-soil-500">
        No commission, no platform fees. Your message goes straight to {""}
        <strong className="text-forest-700">the farmer&apos;s dashboard</strong> and phone.
      </p>

      {!isLoggedIn && (
        <p className="mt-4 rounded-2xl bg-gold-50 px-4 py-3 text-xs font-semibold text-gold-800">
          Tip: <a href="/login" className="underline">log in</a> first so the farmer can reply to
          you faster.
        </p>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-soil-500">Your name</span>
          <input
            name="name"
            required
            defaultValue={consumerName}
            className="mt-1 w-full rounded-xl border border-forest-200 bg-forest-50 px-3 py-2 text-sm outline-none focus:border-leaf-500 focus:ring-2 focus:ring-leaf-200"
          />
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-soil-500">Phone</span>
          <input
            name="phone"
            required
            type="tel"
            defaultValue={consumerPhone}
            placeholder="+91 ..."
            className="mt-1 w-full rounded-xl border border-forest-200 bg-forest-50 px-3 py-2 text-sm outline-none focus:border-leaf-500 focus:ring-2 focus:ring-leaf-200"
          />
        </label>
      </div>

      <label className="mt-3 block">
        <span className="text-xs font-bold uppercase tracking-wider text-soil-500">Email (optional)</span>
        <input
          name="email"
          type="email"
          defaultValue={consumerEmail}
          className="mt-1 w-full rounded-xl border border-forest-200 bg-forest-50 px-3 py-2 text-sm outline-none focus:border-leaf-500"
        />
      </label>

      <div className="mt-3 grid gap-3 sm:grid-cols-[130px_1fr]">
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-soil-500">Qty needed</span>
          <input
            name="quantity"
            type="number"
            min={1}
            defaultValue={10}
            className="mt-1 w-full rounded-xl border border-forest-200 bg-forest-50 px-3 py-2 text-sm outline-none focus:border-leaf-500"
          />
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-soil-500">Message</span>
          <textarea
            name="message"
            required
            rows={3}
            placeholder="Namaste! I'd like to buy..."
            className="mt-1 w-full resize-none rounded-xl border border-forest-200 bg-forest-50 px-3 py-2 text-sm outline-none focus:border-leaf-500 focus:ring-2 focus:ring-leaf-200"
          />
        </label>
      </div>

      {status === "error" && (
        <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{error}</p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-4 w-full rounded-full bg-forest-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-forest-600/25 transition-all hover:-translate-y-0.5 hover:bg-forest-700 disabled:translate-y-0 disabled:opacity-60"
      >
        {status === "sending" ? "Sending..." : "📨 Send inquiry to farmer"}
      </button>
    </form>
  );
}
