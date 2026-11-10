"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const CATEGORIES = ["All", "Vegetables", "Fruits", "Grains", "Spices", "Dairy"];
const SORTS = [
  { value: "recent", label: "Most recent" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name", label: "Name A–Z" },
];

export function CropFilters({ locations }: { locations: string[] }) {
  const router = useRouter();
  const params = useSearchParams();

  const setParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (!value || value === "All" || value === "recent") next.delete(key);
      else next.set(key, value);
      router.push(`/crops?${next.toString()}`, { scroll: false });
    },
    [params, router]
  );

  const category = params.get("category") ?? "All";
  const organic = params.get("organic") === "1";
  const sort = params.get("sort") ?? "recent";
  const location = params.get("location") ?? "All";
  const q = params.get("q") ?? "";

  return (
    <aside className="rounded-3xl border border-forest-100 bg-white p-5 shadow-[0_10px_30px_-22px_rgba(36,89,63,0.5)] lg:sticky lg:top-24">
      <h2 className="font-display text-lg font-bold text-forest-900">Refine the mandi</h2>

      <label className="mt-4 block">
        <span className="text-xs font-bold uppercase tracking-wider text-soil-500">Search</span>
        <input
          defaultValue={q}
          key={q}
          type="search"
          placeholder="Try 'mango' or 'ghee'..."
          className="mt-1.5 w-full rounded-xl border border-forest-200 bg-forest-50 px-3 py-2 text-sm font-medium outline-none transition focus:border-leaf-500 focus:ring-2 focus:ring-leaf-200"
          onKeyDown={(e) => {
            if (e.key === "Enter") setParam("q", (e.target as HTMLInputElement).value);
          }}
          onBlur={(e) => setParam("q", e.target.value)}
        />
      </label>

      <div className="mt-5">
        <span className="text-xs font-bold uppercase tracking-wider text-soil-500">Category</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setParam("category", c)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                category === c
                  ? "bg-forest-600 text-white shadow-md shadow-forest-600/25"
                  : "border border-forest-200 bg-white text-forest-700 hover:border-leaf-400 hover:bg-leaf-50"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <span className="text-xs font-bold uppercase tracking-wider text-soil-500">Region</span>
        <select
          value={location}
          onChange={(e) => setParam("location", e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-forest-200 bg-forest-50 px-3 py-2 text-sm font-medium outline-none focus:border-leaf-500"
        >
          <option value="All">All regions</option>
          {locations.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-5">
        <span className="text-xs font-bold uppercase tracking-wider text-soil-500">Sort by</span>
        <select
          value={sort}
          onChange={(e) => setParam("sort", e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-forest-200 bg-forest-50 px-3 py-2 text-sm font-medium outline-none focus:border-leaf-500"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <label className="mt-5 flex cursor-pointer items-center justify-between rounded-2xl border border-leaf-200 bg-leaf-50 px-4 py-3">
        <span className="text-sm font-bold text-forest-800">🌿 Organic only</span>
        <input
          type="checkbox"
          checked={organic}
          onChange={(e) => setParam("organic", e.target.checked ? "1" : "")}
          className="h-5 w-5 accent-leaf-600"
        />
      </label>

      <button
        onClick={() => router.push("/crops", { scroll: false })}
        className="mt-5 w-full rounded-xl border border-soil-200 bg-soil-50 px-4 py-2.5 text-sm font-bold text-soil-700 transition-colors hover:bg-soil-100"
      >
        Reset filters
      </button>
    </aside>
  );
}
