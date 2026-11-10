import type { Metadata } from "next";
import { Suspense } from "react";
import { CropFilters } from "@/components/CropFilters";
import { CropCard } from "@/components/CropCard";
import { FloatingLeaves, Reveal } from "@/components/Motion";
import { listCrops, locations, type CropFilters as Filters } from "@/lib/data";

export const metadata: Metadata = { title: "Browse Crops" };

type SP = Promise<Record<string, string | string[] | undefined>>;

function one(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export default async function CropsPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const filters: Filters = {
    q: one(sp.q),
    category: one(sp.category),
    organic: one(sp.organic) === "1",
    location: one(sp.location),
    sort: one(sp.sort),
  };

  const [crops, locs] = await Promise.all([listCrops(filters), locations()]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="relative overflow-hidden rounded-[2rem] border border-forest-100 bg-gradient-to-br from-leaf-50 via-white to-gold-50 px-6 py-10 text-center sm:px-10">
        <FloatingLeaves count={6} />
        <div aria-hidden className="absolute -left-3 bottom-0 text-6xl opacity-15 sway">🌾</div>
        <div aria-hidden className="absolute -right-2 top-2 text-5xl opacity-15 sway" style={{ animationDelay: "1.2s" }}>🥕</div>
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-leaf-600">The living mandi</p>
          <h1 className="text-balance mt-2 font-display text-3xl font-black text-forest-900 sm:text-4xl">
            Fresh crops, listed by the farmers themselves
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-soil-600">
            {crops.length} live listing{crops.length === 1 ? "" : "s"} today — every price is set by
            the grower, and every rupee goes to them.
          </p>
        </Reveal>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[300px_1fr]">
        <Suspense fallback={<div className="h-96 rounded-3xl bg-white/60" />}>
          <CropFilters locations={locs} />
        </Suspense>

        <section aria-label="Crop listings">
          {crops.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-forest-200 bg-white/60 text-center">
              <span aria-hidden className="text-5xl">🍂</span>
              <h2 className="mt-3 font-display text-xl font-bold text-forest-900">
                No crops match this season&apos;s search
              </h2>
              <p className="mt-1 max-w-sm text-sm text-soil-500">
                Try clearing a filter — or check back after the next harvest.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {crops.map((crop, i) => (
                <Reveal key={crop.id} delay={(i % 3) * 70}>
                  <CropCard crop={crop} />
                </Reveal>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
