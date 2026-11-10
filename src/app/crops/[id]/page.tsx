import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CropCard } from "@/components/CropCard";
import { FloatingLeaves, Reveal } from "@/components/Motion";
import { InquiryForm } from "@/components/InquiryForm";
import { getCrop, relatedCrops } from "@/lib/data";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const crop = await getCrop(Number(id));
  return { title: crop ? `${crop.title} — ${crop.farmer_name}` : "Crop" };
}

export default async function CropDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const crop = await getCrop(Number(id));
  if (!crop) notFound();

  const [user, related] = await Promise.all([getCurrentUser(), relatedCrops(crop)]);
  const harvest = new Date(crop.harvest_date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const isFarmerOwner = user?.id === crop.farmer_id;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-xs font-semibold text-soil-500" aria-label="Breadcrumb">
        <Link href="/crops" className="hover:text-leaf-600">Browse Crops</Link>
        <span aria-hidden>/</span>
        <span className="text-forest-700">{crop.category}</span>
        <span aria-hidden>/</span>
        <span className="text-forest-900">{crop.title}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        {/* Main column */}
        <div>
          <div className="relative overflow-hidden rounded-[2rem] border border-forest-100 bg-gradient-to-br from-forest-100 via-leaf-100 to-gold-50 p-8 sm:p-12">
            <FloatingLeaves count={6} />
            <div aria-hidden className="absolute -right-4 -top-4 text-[10rem] opacity-90 select-none">
              {crop.category === "Vegetables" ? "🥕" : crop.category === "Fruits" ? "🥭" : crop.category === "Grains" ? "🌾" : crop.category === "Dairy" ? "🥛" : "🌿"}
            </div>
            <div className="relative">
              {crop.organic === 1 && (
                <span className="mb-3 inline-block rounded-full bg-leaf-600 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow">🌿 Certified Organic</span>
              )}
              <h1 className="text-balance font-display text-3xl font-black text-forest-900 sm:text-4xl">{crop.title}</h1>
              <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-bold text-forest-700">
                <span aria-hidden>📍</span> {crop.location}
              </p>
            </div>
          </div>

          <Reveal className="mt-6">
            <div className="rounded-3xl border border-forest-100 bg-white p-6 sm:p-8">
              <h2 className="font-display text-lg font-bold text-forest-900">About this harvest</h2>
              <p className="mt-3 text-sm leading-relaxed text-soil-700">{crop.description}</p>

              <dl className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-forest-50 p-4">
                  <dt className="text-[11px] font-bold uppercase tracking-wider text-soil-500">Harvest date</dt>
                  <dd className="mt-1 text-sm font-bold text-forest-800">🗓️ {harvest}</dd>
                </div>
                <div className="rounded-2xl bg-forest-50 p-4">
                  <dt className="text-[11px] font-bold uppercase tracking-wider text-soil-500">Available quantity</dt>
                  <dd className="mt-1 text-sm font-bold text-forest-800">📦 {crop.quantity.toLocaleString("en-IN")} {crop.unit}</dd>
                </div>
                <div className="rounded-2xl bg-forest-50 p-4">
                  <dt className="text-[11px] font-bold uppercase tracking-wider text-soil-500">Price</dt>
                  <dd className="mt-1 text-sm font-bold text-forest-800">₹{crop.price} / {crop.unit}</dd>
                </div>
                <div className="rounded-2xl bg-forest-50 p-4">
                  <dt className="text-[11px] font-bold uppercase tracking-wider text-soil-500">Category</dt>
                  <dd className="mt-1 text-sm font-bold text-forest-800">{crop.category}</dd>
                </div>
              </dl>
            </div>
          </Reveal>
        </div>

        {/* Side column */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-forest-100 bg-white p-6 shadow-[0_10px_30px_-22px_rgba(36,89,63,0.5)]">
            <div className="flex items-center gap-4">
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-leaf-100 to-gold-100 text-3xl" aria-hidden>
                {crop.farmer_avatar}
              </span>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-soil-500">Grown by</p>
                <Link href={`/farmers/${crop.farmer_id}`} className="font-display text-lg font-bold text-forest-900 hover:text-leaf-600">
                  {crop.farmer_name}
                </Link>
                {crop.farm_name && <p className="text-xs font-semibold text-leaf-600">{crop.farm_name}</p>}
              </div>
            </div>
            {crop.farmer_bio && (
              <p className="mt-4 border-t border-forest-50 pt-4 text-xs leading-relaxed text-soil-600">{crop.farmer_bio}</p>
            )}
            <Link
              href={`/farmers/${crop.farmer_id}`}
              className="mt-4 block rounded-full border-2 border-forest-200 py-2.5 text-center text-sm font-bold text-forest-700 transition-colors hover:border-forest-600 hover:bg-forest-600 hover:text-white"
            >
              View farm profile →
            </Link>
          </div>

          <div className="rounded-3xl border border-gold-200 bg-gradient-to-br from-gold-50 to-white p-6 text-center shadow-[0_10px_30px_-22px_rgba(194,116,9,0.5)]">
            <p className="text-[11px] font-bold uppercase tracking-wider text-soil-500">Farmer&apos;s price</p>
            <p className="mt-1 font-display text-4xl font-black text-forest-800">
              ₹{crop.price}
              <span className="ml-1 text-sm font-semibold text-soil-500">/ {crop.unit}</span>
            </p>
            <p className="mt-2 text-[11px] font-semibold text-leaf-700">
              ✅ Zero platform commission — 100% to the farmer
            </p>
          </div>

          {isFarmerOwner ? (
            <div className="rounded-3xl border border-leaf-200 bg-leaf-50 p-6 text-center">
              <p className="text-sm font-semibold text-forest-800">This is your listing 🌱</p>
              <Link href="/dashboard" className="mt-3 inline-block rounded-full bg-forest-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-forest-700">
                Manage it on your dashboard
              </Link>
            </div>
          ) : user?.role === "farmer" ? (
            <div className="rounded-3xl border border-forest-100 bg-white p-6 text-center">
              <p className="text-sm leading-relaxed text-soil-600">
                You&apos;re signed in as a farmer — log in with a consumer account to contact{" "}
                {crop.farmer_name.split(" ")[0]}.
              </p>
            </div>
          ) : (
            <InquiryForm
              cropId={crop.id}
              isLoggedIn={user?.role === "consumer"}
              consumerName={user?.role === "consumer" ? user.name : ""}
              consumerPhone={user?.role === "consumer" ? user.phone ?? "" : ""}
              consumerEmail={user?.role === "consumer" ? user.email : ""}
            />
          )}
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-2xl font-black text-forest-900">More from the fields</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <CropCard key={r.id} crop={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
