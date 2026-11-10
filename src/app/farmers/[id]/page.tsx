import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CropCard } from "@/components/CropCard";
import { FloatingLeaves, Reveal } from "@/components/Motion";
import { getFarmer, listCrops } from "@/lib/data";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const farmer = await getFarmer(Number(id));
  return { title: farmer ? `${farmer.name} — ${farmer.farm_name ?? "Farm"}` : "Farmer" };
}

export default async function FarmerProfilePage({ params }: { params: Params }) {
  const { id } = await params;
  const farmer = await getFarmer(Number(id));
  if (!farmer) notFound();

  const crops = await listCrops({ farmerId: farmer.id });
  const memberSince = new Date(farmer.created_at).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Profile hero */}
      <div className="relative overflow-hidden rounded-[2rem] border border-forest-100 bg-gradient-to-br from-forest-100 via-leaf-50 to-gold-50 p-8 sm:p-10">
        <FloatingLeaves count={6} />
        <div aria-hidden className="absolute -right-6 -top-8 text-[9rem] opacity-20 select-none">🧑‍🌾</div>
        <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          <span className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-white text-5xl shadow-lg" aria-hidden>
            {farmer.avatar}
          </span>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-leaf-600">Farmer profile</p>
            <h1 className="mt-1 font-display text-3xl font-black text-forest-900 sm:text-4xl">{farmer.name}</h1>
            {farmer.farm_name && (
              <p className="mt-1 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-forest-700">
                <span aria-hidden>🏡</span> {farmer.farm_name}
              </p>
            )}
            <p className="mt-2 text-sm font-semibold text-soil-600">
              📍 {farmer.location} · 🌱 Member since {memberSince}
            </p>
          </div>
        </div>
        {farmer.bio && (
          <p className="relative mt-6 max-w-3xl rounded-2xl bg-white/80 p-5 text-sm leading-relaxed text-soil-700 shadow-sm">
            {farmer.bio}
          </p>
        )}
      </div>

      {/* Listings */}
      <section className="mt-12">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-2xl font-black text-forest-900">
            {farmer.name.split(" ")[0]}&apos;s harvest
          </h2>
          <span className="rounded-full bg-forest-50 px-3 py-1 text-xs font-bold text-forest-700">
            {crops.length} listing{crops.length === 1 ? "" : "s"}
          </span>
        </div>

        {crops.length === 0 ? (
          <div className="mt-6 flex h-48 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-forest-200 bg-white/60 text-center">
            <span aria-hidden className="text-4xl">🌱</span>
            <p className="mt-2 font-display text-lg font-bold text-forest-900">
              Nothing listed this season yet
            </p>
            <p className="mt-1 text-sm text-soil-500">
              {farmer.name.split(" ")[0]} is probably busy in the fields — check back soon.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {crops.map((crop, i) => (
              <Reveal key={crop.id} delay={(i % 3) * 80}>
                <CropCard crop={crop} />
              </Reveal>
            ))}
          </div>
        )}
      </section>

      <div className="mt-14 rounded-3xl border border-gold-200 bg-gold-50 p-6 text-center">
        <p className="text-sm font-semibold text-soil-700">
          Want fresh produce from {farmer.name.split(" ")[0]}&apos;s farm?
        </p>
        <Link href="/crops" className="mt-3 inline-block rounded-full bg-forest-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-forest-600/25 transition-all hover:-translate-y-0.5 hover:bg-forest-700">
          Browse all live crops →
        </Link>
      </div>
    </div>
  );
}
