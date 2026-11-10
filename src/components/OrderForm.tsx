"use client";

import Link from "next/link";
import { useState } from "react";

export function OrderForm({
  cropId,
  cropTitle,
  price,
  unit,
  available,
  customerName,
  customerPhone,
}: {
  cropId: number;
  cropTitle: string;
  price: number;
  unit: string;
  available: number;
  customerName: string;
  customerPhone: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [placed, setPlaced] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cropId,
          quantity: Number(form.get("quantity")),
          customerName: form.get("customerName"),
          customerPhone: form.get("customerPhone"),
          message: form.get("message"),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error ?? "Could not place the order request.");
      setPlaced(true);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not place the order request.");
    } finally {
      setBusy(false);
    }
  }

  if (placed) {
    return (
      <div role="status" className="rounded-3xl border border-leaf-200 bg-leaf-50 p-6">
        <h3 className="font-display text-lg font-bold text-forest-900">Order request sent</h3>
        <p className="mt-2 text-sm leading-relaxed text-soil-700">
          {cropTitle} is awaiting the farmer&apos;s confirmation. No payment was taken; agree on
          payment and delivery directly with the farmer.
        </p>
        <Link href="/dashboard" className="mt-4 inline-block rounded-full bg-forest-600 px-5 py-2.5 text-sm font-bold text-white">
          Track your order →
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-3xl border border-leaf-200 bg-leaf-50/60 p-6">
      <h3 className="font-display text-lg font-bold text-forest-900">Request an order</h3>
      <p className="mt-1 text-xs leading-relaxed text-soil-600">
        ₹{price} / {unit} · {available.toLocaleString("en-IN")} {unit} available. Stock is
        committed only after the farmer accepts.
      </p>
      <label className="mt-4 block">
        <span className="text-xs font-bold uppercase tracking-wider text-soil-500">Quantity ({unit})</span>
        <input
          name="quantity"
          type="number"
          min={1}
          max={available}
          step={1}
          defaultValue={1}
          required
          className="mt-1 w-full rounded-xl border border-forest-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-leaf-500"
        />
      </label>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-soil-500">Your name</span>
          <input
            name="customerName"
            required
            maxLength={100}
            defaultValue={customerName}
            className="mt-1 w-full rounded-xl border border-forest-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-leaf-500"
          />
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-soil-500">Phone</span>
          <input
            name="customerPhone"
            type="tel"
            required
            maxLength={40}
            defaultValue={customerPhone}
            className="mt-1 w-full rounded-xl border border-forest-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-leaf-500"
          />
        </label>
      </div>
      <label className="mt-3 block">
        <span className="text-xs font-bold uppercase tracking-wider text-soil-500">Note for farmer (optional)</span>
        <textarea
          name="message"
          maxLength={1000}
          rows={2}
          placeholder="Delivery or pickup preferences"
          className="mt-1 w-full resize-y rounded-xl border border-forest-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-leaf-500"
        />
      </label>
      {error && <p role="alert" className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="mt-4 w-full rounded-full bg-leaf-600 px-6 py-3 text-sm font-bold text-white shadow-md transition-colors hover:bg-leaf-700 disabled:opacity-60"
      >
        {busy ? "Sending request..." : "Place order request"}
      </button>
      <p className="mt-2 text-center text-xs text-soil-500">No online payment is collected.</p>
    </form>
  );
}
