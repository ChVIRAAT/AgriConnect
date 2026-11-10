"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export type ManagedCrop = {
  id: number;
  title: string;
  category: string;
  description: string;
  price: number;
  unit: string;
  quantity: number;
  harvest_date: string;
  location: string;
  organic: number;
  is_active: number;
  inquiries: number;
};

const CATEGORIES = ["Vegetables", "Fruits", "Grains", "Dairy", "Spices", "Other"];
const UNITS = ["kg", "dozen", "bunch", "litre", "piece", "egg"];

function formatDate(d: string): string {
  try {
    return new Date(d + "T00:00:00").toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return d;
  }
}

function CropForm({
  initial,
  busy,
  error,
  onSubmit,
  onCancel,
}: {
  initial?: ManagedCrop;
  busy: boolean;
  error: string;
  onSubmit: (fd: FormData) => void;
  onCancel?: () => void;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(new FormData(e.currentTarget));
      }}
      className="rounded-3xl border border-leaf-200 bg-leaf-50/60 p-5"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="text-xs font-bold uppercase tracking-wider text-soil-500">Crop title</span>
          <input
            name="title"
            required
            defaultValue={initial?.title}
            placeholder="e.g. Organic Tomatoes"
            className="mt-1 w-full rounded-xl border border-forest-200 bg-white px-3 py-2 text-sm outline-none focus:border-leaf-500 focus:ring-2 focus:ring-leaf-200"
          />
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-soil-500">Category</span>
          <select
            name="category"
            required
            defaultValue={initial?.category ?? "Vegetables"}
            className="mt-1 w-full rounded-xl border border-forest-200 bg-white px-3 py-2 text-sm outline-none focus:border-leaf-500"
          >
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wider text-soil-500">Price (₹)</span>
            <input
              name="price"
              required
              type="number"
              min={1}
              step="0.01"
              defaultValue={initial?.price}
              className="mt-1 w-full rounded-xl border border-forest-200 bg-white px-3 py-2 text-sm outline-none focus:border-leaf-500"
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wider text-soil-500">Unit</span>
            <select
              name="unit"
              defaultValue={initial?.unit ?? "kg"}
              className="mt-1 w-full rounded-xl border border-forest-200 bg-white px-3 py-2 text-sm outline-none focus:border-leaf-500"
            >
              {UNITS.map((u) => (
                <option key={u}>{u}</option>
              ))}
            </select>
          </label>
        </div>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-soil-500">Quantity available</span>
          <input
            name="quantity"
            required
            type="number"
            min={1}
            defaultValue={initial?.quantity}
            className="mt-1 w-full rounded-xl border border-forest-200 bg-white px-3 py-2 text-sm outline-none focus:border-leaf-500"
          />
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-soil-500">Harvest date</span>
          <input
            name="harvest_date"
            required
            type="date"
            defaultValue={initial?.harvest_date}
            className="mt-1 w-full rounded-xl border border-forest-200 bg-white px-3 py-2 text-sm outline-none focus:border-leaf-500"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-xs font-bold uppercase tracking-wider text-soil-500">Description</span>
          <textarea
            name="description"
            required
            rows={3}
            defaultValue={initial?.description}
            placeholder="Tell buyers how you grow it, when it was harvested, quality, packing..."
            className="mt-1 w-full resize-none rounded-xl border border-forest-200 bg-white px-3 py-2 text-sm outline-none focus:border-leaf-500 focus:ring-2 focus:ring-leaf-200"
          />
        </label>
        <label className="flex items-center gap-2 sm:col-span-2">
          <input type="checkbox" name="organic" value="1" defaultChecked={initial?.organic === 1} className="h-4 w-4 accent-[#478b26]" />
          <span className="text-sm font-semibold text-forest-800">🌿 This is an organic / chemical-free listing</span>
        </label>
      </div>
      {error && <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{error}</p>}
      <div className="mt-4 flex gap-2">
        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-forest-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-forest-600/25 transition-all hover:-translate-y-0.5 hover:bg-forest-700 disabled:translate-y-0 disabled:opacity-60"
        >
          {busy ? "Saving..." : initial ? "💾 Save changes" : "🌱 Publish listing"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-soil-200 px-5 py-2.5 text-sm font-bold text-soil-600 transition-colors hover:bg-soil-100"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export function MyListings({ crops, farmLocation }: { crops: ManagedCrop[]; farmLocation: string | null }) {
  const router = useRouter();
  const [mode, setMode] = useState<"idle" | "add" | "edit">("idle");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [busyId, setBusyId] = useState<number | 0>(0);
  const [error, setError] = useState("");

  async function sendCrop(payload: Record<string, unknown>, cropId: number | null) {
    setError("");
    const res = await fetch(cropId ? `/api/crops/${cropId}` : "/api/crops", {
      method: cropId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setMode("idle");
      setEditingId(null);
      router.refresh();
      return true;
    }
    try {
      const data = await res.json();
      setError(data?.error ?? "Something went wrong.");
    } catch {
      setError("Something went wrong.");
    }
    return false;
  }

  async function toggleActive(crop: ManagedCrop) {
    setBusyId(crop.id);
    await fetch(`/api/crops/${crop.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !(crop.is_active === 1) }),
    });
    setBusyId(0);
    router.refresh();
  }

  async function removeCrop(crop: ManagedCrop) {
    if (!window.confirm(`Mark "${crop.title}" as sold & remove it from the marketplace?`)) return;
    setBusyId(crop.id);
    await fetch(`/api/crops/${crop.id}`, { method: "DELETE" });
    setBusyId(0);
    router.refresh();
  }

  const active = crops.filter((c) => c.is_active === 1);
  const inactive = crops.filter((c) => c.is_active !== 1);

  return (
    <section className="rounded-[2rem] border border-forest-100 bg-white p-6 shadow-[0_10px_30px_-22px_rgba(36,89,63,0.5)] sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-black text-forest-900">My listings</h2>
          <p className="text-sm text-soil-500">
            {active.length} live on the marketplace · {inactive.length} sold or hidden
          </p>
        </div>
        {mode === "idle" && (
          <button
            onClick={() => {
              setMode("add");
              setError("");
            }}
            className="rounded-full bg-leaf-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-leaf-600/30 transition-all hover:-translate-y-0.5 hover:bg-leaf-700"
          >
            ＋ List a new crop
          </button>
        )}
      </div>

      {mode === "add" && (
        <div className="mt-5">
          <h3 className="mb-3 font-display text-lg font-bold text-forest-900">New harvest</h3>
          <CropForm
            busy={busyId === -1}
            error={error}
            onCancel={() => {
              setMode("idle");
              setError("");
            }}
            onSubmit={(fd) => {
              setBusyId(-1);
              sendCrop(
                {
                  title: fd.get("title"),
                  category: fd.get("category"),
                  description: fd.get("description"),
                  price: Number(fd.get("price")),
                  unit: fd.get("unit"),
                  quantity: Number(fd.get("quantity")),
                  harvest_date: fd.get("harvest_date"),
                  organic: fd.get("organic") === "1",
                },
                null
              ).then((ok) => setBusyId(0));
            }}
          />
        </div>
      )}

      <div className="mt-6 space-y-4">
        {crops.length === 0 && !crops.length && null}
        {crops.length === 0 && (
          <div className="rounded-3xl border border-dashed border-leaf-300 bg-leaf-50/40 p-10 text-center">
            <span aria-hidden className="text-4xl">🌾</span>
            <p className="mt-2 font-display text-lg font-bold text-forest-900">No listings yet</p>
            <p className="mt-1 text-sm text-soil-500">
              Post your first harvest — it takes under two minutes and reaches consumers directly.
            </p>
          </div>
        )}

        {[...active, ...inactive].map((crop) => (
          <div
            key={crop.id}
            className={`rounded-3xl border p-5 transition-colors ${
              crop.is_active === 1
                ? "border-forest-100 bg-[#faf7ef]"
                : "border-soil-200 bg-soil-50 opacity-80"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-lg font-bold text-forest-900">{crop.title}</h3>
                  <span className="rounded-full bg-forest-100 px-2.5 py-0.5 text-[11px] font-bold text-forest-700">{crop.category}</span>
                  {crop.organic === 1 && (
                    <span className="rounded-full bg-leaf-100 px-2.5 py-0.5 text-[11px] font-bold text-leaf-700">🌿 Organic</span>
                  )}
                  {crop.is_active === 1 ? (
                    <span className="rounded-full bg-gold-200 px-2.5 py-0.5 text-[11px] font-bold text-gold-800">● Live</span>
                  ) : (
                    <span className="rounded-full bg-soil-200 px-2.5 py-0.5 text-[11px] font-bold text-soil-700">Sold / hidden</span>
                  )}
                </div>
                <p className="mt-1.5 line-clamp-2 text-sm text-soil-600">{crop.description}</p>
                <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-forest-700">
                  <span>₹{crop.price} / {crop.unit}</span>
                  <span>📦 {crop.quantity.toLocaleString("en-IN")} {crop.unit} available</span>
                  <span>🗓️ Harvested {formatDate(crop.harvest_date)}</span>
                  {crop.location && <span>📍 {crop.location}</span>}
                  <span>📨 {crop.inquiries} {crop.inquiries === 1 ? "inquiry" : "inquiries"}</span>
                </p>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                <button
                  onClick={() => toggleActive(crop)}
                  disabled={busyId === crop.id}
                  className="rounded-full border border-forest-200 bg-white px-4 py-2 text-xs font-bold text-forest-700 transition-colors hover:bg-forest-600 hover:text-white disabled:opacity-50"
                >
                  {crop.is_active === 1 ? "Mark sold" : "Re-live"}
                </button>
                <button
                  onClick={() => {
                    setEditingId(crop.id);
                    setMode("edit");
                    setError("");
                  }}
                  className="rounded-full border border-forest-200 bg-white px-4 py-2 text-xs font-bold text-forest-700 transition-colors hover:bg-forest-100"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => removeCrop(crop)}
                  disabled={busyId === crop.id}
                  className="rounded-full border border-soil-200 bg-white px-4 py-2 text-xs font-bold text-soil-600 transition-colors hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>

            {mode === "edit" && editingId === crop.id && (
              <div className="mt-4">
                <CropForm
                  initial={crop}
                  busy={busyId === crop.id}
                  error={error}
                  onCancel={() => {
                    setMode("idle");
                    setEditingId(null);
                    setError("");
                  }}
                  onSubmit={(fd) => {
                    setBusyId(crop.id);
                    sendCrop(
                      {
                        title: fd.get("title"),
                        category: fd.get("category"),
                        description: fd.get("description"),
                        price: Number(fd.get("price")),
                        unit: fd.get("unit"),
                        quantity: Number(fd.get("quantity")),
                        harvest_date: fd.get("harvest_date"),
                      },
                      crop.id
                    ).then(() => setBusyId(0));
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {farmLocation === "TBD" && null}
    </section>
  );
}
