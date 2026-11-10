"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function HeroSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        router.push(`/crops?q=${encodeURIComponent(q.trim())}`);
      }}
      className="mx-auto w-full max-w-xl"
      role="search"
    >
      <div className="flex items-center gap-2 rounded-full border border-forest-200 bg-white/95 p-2 pl-5 shadow-[0_18px_40px_-18px_rgba(36,89,63,0.45)] backdrop-blur">
        <span aria-hidden className="text-lg">🔍</span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          type="search"
          placeholder="Search for crops, vegetables, fruits or farmers..."
          className="min-w-0 flex-1 bg-transparent text-sm font-medium text-forest-900 outline-none placeholder:text-soil-400"
          aria-label="Search crops, vegetables, fruits or farmers"
        />
        <button
          type="submit"
          className="shrink-0 rounded-full bg-forest-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-forest-600/30 transition-all hover:-translate-y-0.5 hover:bg-forest-700"
        >
          Search
        </button>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs">
        <span className="font-semibold text-soil-500">Popular:</span>
        {["Tomatoes", "Mangoes", "Wheat", "Organic", "Ghee"].map((term) => (
          <button
            key={term}
            type="button"
            onClick={() => router.push(`/crops?q=${encodeURIComponent(term)}`)}
            className="rounded-full border border-forest-200 bg-white/80 px-3 py-1 font-semibold text-forest-700 transition-colors hover:border-leaf-400 hover:bg-leaf-50"
          >
            {term}
          </button>
        ))}
      </div>
    </form>
  );
}
