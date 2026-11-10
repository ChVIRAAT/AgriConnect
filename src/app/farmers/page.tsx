import type { Metadata } from "next";
import Link from "next/link";
import { FloatingLeaves, Reveal } from "@/components/Motion";
import { listFarmers } from "@/lib/data";

export const metadata: Metadata = { title: "Farmers" };
export const dynamic = "force-dynamic";

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function FarmersPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : undefined;
  const farmers = await listFarmers(q);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-[2rem] border border-forest-100 bg-gradient-to-br from-leaf-50 via-white to-gold-50 px-6 py-10 text-center sm:px-10">
        <FloatingLeaves count={6} />
        <div aria-hidden className="absolute -left-3 bottom-0 text-6xl opacity-15 sway">🐄</div>
        <div aria-hidden className="absolute -right-2 top-2 text-5xl opacity-15 sway" style={{ animationDelay: "1.2s" }}>🚜</div>
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-leaf-600">The AgriConnect community</p>
          <h1 className="text-balance mt-2 font-display text-3xl font-black text-forest-900 sm:text-4xl">
            Meet the farmers behind your food
          </h1>
          <form action="/farmers" className="mx-auto mt-6 flex max-w-md items-center gap-2 rounded-full border border-forest-200 bg-white p-1.5 pl-4 shadow-sm">
            <span aria-hidden>🔍</span>
            <input
              name="q"
              defaultValue={q}
              type="search"
              placeholder="Search by name, farm or region..."
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-soil-400"
              aria-label="Search farmers"
            />
            <button className="rounded-full bg-forest-600 px-4 py-2 text-xs font-bold text-white hover:bg-forest-700">
              Search
            </button>
          </form>
        </Reveal>
      </div>

      <p className="mt-8 text-sm font-semibold text-soil-500">
        {farmers.length} farmer{farmers.length === 1 ? "" : "s"} across India
      </p>

      {farmers.length === 0 ? (
        <div className="mt-4 flex h-56 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-forest-200 bg-white/60 text-center">
          <span aria-hidden className="text-5xl">🧑‍🌾</span>
          <p className="mt-3 font-display text-lg font-bold text-forest-900">No farmers found</p>
          <p className="mt-1 text-sm text-soil-500">Try a different name, farm or region.</p>
        </div>
      ) : (
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {farmers.map((f, i) => (
            <Reveal key={f.id} delay={(i % 3) * 80}>
              <Link
                href={`/farmers/${f.id}`}
                className="card-lift group flex h-full flex-col rounded-3xl border border-forest-100 bg-white p-6 shadow-[0_10px_30px_-20px_rgba(36,89,63,0.5)]"
              >
                <div className="flex items-center gap-4">
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-leaf-100 to-gold-100 text-3xl shadow-inner transition-transform duration-500 group-hover:scale-110" aria-hidden>
                    {f.avatar}
                  </span>
                  <div className="min-w-0">
                    <h2 className="truncate font-display text-lg font-bold text-forest-900">{f.name}</h2>
                    {f.farm_name && <p className="truncate text-xs font-semibold text-leaf-600">{f.farm_name}</p>}
                    <p className="mt-0.5 truncate text-xs text-soil-500">📍 {f.location}</p>
                  </div>
                </div>
                <p className="mt-4 line-clamp-2 flex-1 text-sm leading-relaxed text-soil-600">{f.bio}</p>
                <div className="mt-4 flex items-center justify-between border-t border-forest-50 pt-4">
                  <span className="rounded-full bg-forest-50 px-3 py-1 text-[11px] font-bold text-forest-700">
                    🌾 {f.listings} live listing{f.listings === 1 ? "" : "s"}
                  </span>
                  <span className="inline-flex items-center gap-1 text-sm font-bold text-leaf-600">
                    View farm <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
