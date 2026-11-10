import Link from "next/link";
import type { Crop } from "@/lib/data";

const CATEGORY_EMOJI: Record<string, string> = {
  Vegetables: "🥕",
  Fruits: "🥭",
  Grains: "🌾",
  Spices: "🌿",
  Dairy: "🥛",
};

export function CategoryIcon({ category }: { category: string }) {
  return <span aria-hidden>{CATEGORY_EMOJI[category] ?? "🌱"}</span>;
}

export function CropCard({ crop, delay = 0 }: { crop: Crop; delay?: number }) {
  const harvested = new Date(crop.harvest_date);
  const harvestedLabel = harvested.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });

  return (
    <article
      className="card-lift group flex h-full flex-col overflow-hidden rounded-3xl border border-forest-100 bg-white shadow-[0_10px_30px_-18px_rgba(36,89,63,0.4)]"
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Banner */}
      <div className="relative h-36 overflow-hidden bg-gradient-to-br from-forest-100 via-leaf-100 to-gold-50">
        <div className="absolute inset-0 flex items-center justify-center text-6xl transition-transform duration-500 group-hover:scale-110" aria-hidden>
          {CATEGORY_EMOJI[crop.category] ?? "🌱"}
        </div>
        {/* decorative field rows */}
        <svg aria-hidden className="absolute bottom-0 left-0 w-full text-white/40" height="26" viewBox="0 0 400 26" preserveAspectRatio="none">
          <path d="M0 24C70 14 150 8 200 8s130 6 200 16v2H0v-2z" fill="currentColor" />
        </svg>
        {crop.organic === 1 && (
          <span className="absolute left-3 top-3 rounded-full bg-leaf-600 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow">
            🌿 Organic
          </span>
        )}
        <span className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-forest-700 shadow">
          {crop.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-bold leading-snug text-forest-900">
          {crop.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-soil-600">
          {crop.description}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-soil-500">
          <span className="inline-flex items-center gap-1" title="Harvest date">
            🗓️ Harvested {harvestedLabel}
          </span>
          <span className="inline-flex items-center gap-1">
            📦 {crop.quantity.toLocaleString("en-IN")} {crop.unit} available
          </span>
        </div>

        <div className="mt-3 flex items-center gap-2 rounded-2xl bg-forest-50 px-3 py-2">
          <span aria-hidden className="text-lg">{crop.farmer_avatar}</span>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-xs font-bold text-forest-800">{crop.farmer_name}</p>
            <p className="truncate text-[11px] text-soil-500">{crop.location}</p>
          </div>
        </div>

        <div className="mt-4 flex items-end justify-between gap-2 pt-1">
          <div className="leading-none">
            <span className="font-display text-2xl font-black text-forest-700">₹{crop.price}</span>
            <span className="ml-1 text-xs font-semibold text-soil-500">/ {crop.unit}</span>
          </div>
          <Link
            href={`/crops/${crop.id}`}
            className="rounded-full bg-forest-600 px-4 py-2 text-sm font-bold text-white shadow-md shadow-forest-600/25 transition-all hover:-translate-y-0.5 hover:bg-forest-700"
          >
            View & Contact
          </Link>
        </div>
      </div>
    </article>
  );
}
