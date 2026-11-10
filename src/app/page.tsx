import Link from "next/link";
import { FarmScene } from "@/components/FarmScene";
import { FloatingLeaves, Reveal } from "@/components/Motion";
import { HeroSearch } from "@/components/HeroSearch";
import { CropCard } from "@/components/CropCard";
import { StatsBand } from "@/components/StatsBand";
import { categoriesWithCounts, featuredCrops, platformStats, topFarmers } from "@/lib/data";

const CATEGORY_CARDS = [
  { emoji: "🧑‍🌾", title: "Meet the Farmers", blurb: "Real families, real farms — browse profiles and reach out directly.", href: "/farmers", ring: "from-leaf-200 to-forest-200" },
  { emoji: "🥕", title: "Fresh Vegetables", blurb: "Picked at dawn, on your table by evening. Palak, tomatoes, methi & more.", href: "/crops?category=Vegetables", ring: "from-leaf-100 to-gold-100" },
  { emoji: "🌾", title: "Wheat & Rice", blurb: "Golden Sharbati, aged Basmati and heritage paddy straight from the mandi fields.", href: "/crops?category=Grains", ring: "from-gold-100 to-soil-100" },
  { emoji: "🥭", title: "Fruits & Orchards", blurb: "Tree-ripened mangoes, grapes, strawberries and coconuts — never gas-forced.", href: "/crops?category=Fruits", ring: "from-gold-100 to-leaf-100" },
  { emoji: "🐄", title: "Cow & Dairy Farms", blurb: "A2 milk, bilona ghee and free-range eggs from happy, grazed herds.", href: "/crops?category=Dairy", ring: "from-soil-100 to-leaf-100" },
  { emoji: "🌿", title: "Fields & Spice Gardens", blurb: "Pepper, cardamom and coffee from misty hill fields and paddy deltas.", href: "/crops?category=Spices", ring: "from-forest-100 to-leaf-200" },
];

const STEPS = [
  { icon: "🔎", title: "Discover", text: "Search live listings by crop, price, region or organic preference." },
  { icon: "🤝", title: "Connect", text: "See the farmer behind every crop and send a direct inquiry — no commissions." },
  { icon: "🚜", title: "Receive", text: "Agree on price & delivery with the farmer and enjoy produce that wasn't picked weeks ago." },
];

const TESTIMONIALS = [
  {
    quote: "I stopped selling to the mandi agent who paid me whatever he felt like. On AgriConnect, families in the city pay me a fair price and even call to say the grapes were sweet.",
    name: "Ramesh Patil", role: "Grape & onion farmer, Nashik", avatar: "🌾",
  },
  {
    quote: "The spinach still smelled of soil when I got it. My kids can taste the difference — and I know exactly which farm it came from.",
    name: "Priya Menon", role: "Home cook, Bengaluru", avatar: "👩",
  },
  {
    quote: "I run a 40-seat restaurant and my entire grain supply now comes from two farmers I met here. Costs down 18%, quality up.",
    name: "Arjun Kapoor", role: "Restaurant owner, Delhi", avatar: "👨",
  },
];

const MARQUEE = ["🍅", "🥭", "🌾", "🥬", "🥕", "🌿", "🥛", "🐄", "🚜", "🌽", "🍓", "🍇", "🧅", "🥔", "🍌", "🥥", "🌶️", "🫚"];

export default async function HomePage() {
  const [crops, cats, stats, farmers] = await Promise.all([
    featuredCrops(6),
    categoriesWithCounts(),
    platformStats(),
    topFarmers(4),
  ]);
  const countFor = (name: string) => cats.find((c) => c.category === name)?.count ?? 0;

  return (
    <div className="overflow-x-clip">
      {/* ================= HERO ================= */}
      <section className="relative isolate min-h-[92vh] overflow-hidden pb-40 pt-14 sm:pb-52">
        <FarmScene />
        <FloatingLeaves count={8} />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rise mx-auto max-w-3xl text-center">
            <span className="pulse-soft inline-flex items-center gap-2 rounded-full border border-forest-200 bg-white/80 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-forest-700 shadow-sm">
              <span aria-hidden>🌱</span> Zero middlemen · Zero commission
            </span>

            <h1 className="text-balance mt-6 font-display text-4xl font-black leading-[1.08] text-forest-900 sm:text-6xl lg:text-[4.4rem]">
              From Our Farms{" "}
              <span className="relative inline-block">
                <span className="relative z-10">Directly</span>
                <svg aria-hidden className="absolute -bottom-2 left-0 w-full text-gold-300" height="12" viewBox="0 0 200 12" preserveAspectRatio="none">
                  <path d="M2 9C50 3 150 3 198 9" stroke="currentColor" strokeWidth="5" strokeLinecap="round" fill="none" />
                </svg>
              </span>{" "}
              to Your Home
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-soil-700 sm:text-lg">
              Connect directly with farmers, discover fresh crops, compare prices, and buy
              directly from the source.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/crops"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-forest-600 px-8 py-4 text-base font-bold text-white shadow-xl shadow-forest-600/30 transition-all hover:-translate-y-1 hover:bg-forest-700 sm:w-auto"
              >
                <span aria-hidden>🥬</span> Explore Fresh Crops
                <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <Link
                href="/register?role=farmer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold-300 px-8 py-4 text-base font-bold text-soil-900 shadow-xl shadow-gold-300/40 transition-all hover:-translate-y-1 hover:bg-gold-400 sm:w-auto"
              >
                <span aria-hidden>🚜</span> Sell Your Crops
              </Link>
            </div>

            <div className="mt-10">
              <HeroSearch />
            </div>
          </div>
        </div>
      </section>

      {/* ================= MARQUEE ================= */}
      <section aria-hidden className="relative z-10 -mt-24 border-y border-forest-100 bg-white/70 py-3 backdrop-blur">
        <div className="flex overflow-hidden">
          <div className="marquee-track flex shrink-0 items-center gap-8 pr-8 text-2xl">
            {[...MARQUEE, ...MARQUEE].map((m, i) => (
              <span key={i} className="sway" style={{ animationDelay: `${(i % 9) * 0.4}s` }}>{m}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CATEGORY CARDS ================= */}
      <section className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <Reveal>
          <p className="text-center text-xs font-bold uppercase tracking-[0.25em] text-leaf-600">The AgriConnect world</p>
          <h2 className="text-balance mt-2 text-center font-display text-3xl font-black text-forest-900 sm:text-4xl">
            Explore the harvest, field by field
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORY_CARDS.map((card, i) => (
            <Reveal key={card.title} delay={i * 80}>
              <Link
                href={card.href}
                className="card-lift group flex h-full flex-col rounded-3xl border border-forest-100 bg-white p-6 shadow-[0_10px_30px_-20px_rgba(36,89,63,0.5)]"
              >
                <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${card.ring} text-3xl shadow-inner transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110`} aria-hidden>
                  {card.emoji}
                </div>
                <h3 className="mt-4 font-display text-xl font-bold text-forest-900">{card.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-soil-600">{card.blurb}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-leaf-600">
                  {card.href.includes("category=") ? `${countFor(card.href.split("category=")[1])} live listings` : "Browse the community"}
                  <span aria-hidden className="transition-transform group-hover:translate-x-1.5">→</span>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ================= STATS ================= */}
      <section className="relative overflow-hidden bg-forest-800 py-14">
        <FloatingLeaves count={6} />
        <div aria-hidden className="absolute -left-10 top-1/2 -translate-y-1/2 text-[9rem] opacity-10">🚜</div>
        <div aria-hidden className="absolute -right-8 top-1/2 -translate-y-1/2 text-[8rem] opacity-10">🐄</div>
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <StatsBand stats={stats} />
          </Reveal>
        </div>
      </section>

      {/* ================= FEATURED CROPS ================= */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-leaf-600">Fresh this week</p>
              <h2 className="text-balance mt-2 font-display text-3xl font-black text-forest-900 sm:text-4xl">
                Straight from the soil
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-soil-600">
                Every listing is maintained by the farmer themselves — price, quantity and harvest
                date you can trust.
              </p>
            </div>
            <Link href="/crops" className="shrink-0 rounded-full border-2 border-forest-600 px-5 py-2.5 text-sm font-bold text-forest-700 transition-colors hover:bg-forest-600 hover:text-white">
              View all crops →
            </Link>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {crops.map((crop, i) => (
            <Reveal key={crop.id} delay={(i % 3) * 90}>
              <CropCard crop={crop} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#faf7ef] via-leaf-50 to-[#faf7ef] py-20">
        <div aria-hidden className="absolute inset-x-0 top-6 mx-auto hidden max-w-3xl justify-between px-10 md:flex">
          {[0, 1, 2].map((i) => (
            <span key={i} className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed border-leaf-400 bg-white font-display text-lg font-black text-leaf-600 shadow-sm">
              {i + 1}
            </span>
          ))}
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <p className="text-center text-xs font-bold uppercase tracking-[0.25em] text-leaf-600">How it works</p>
            <h2 className="text-balance mt-2 text-center font-display text-3xl font-black text-forest-900 sm:text-4xl">
              Three steps from field to thali
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <Reveal key={s.title} delay={i * 110}>
                <div className="card-lift relative h-full rounded-3xl border border-forest-100 bg-white p-7 text-center shadow-[0_10px_30px_-20px_rgba(36,89,63,0.5)]">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-leaf-400 to-forest-600 text-3xl shadow-lg shadow-forest-600/25" aria-hidden>
                    {s.icon}
                  </div>
                  <h3 className="mt-4 font-display text-xl font-bold text-forest-900">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-soil-600">{s.text}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={150}>
            <div className="mx-auto mt-10 max-w-3xl rounded-3xl border border-gold-200 bg-gold-50 p-6 text-center">
              <p className="text-sm leading-relaxed text-soil-700">
                <span aria-hidden className="mr-1.5">🧑‍🌾</span>
                <strong className="text-forest-800">Are you a farmer?</strong> List your harvest in
                under two minutes, set your own price, and answer buyers on your phone —{" "}
                <Link href="/register?role=farmer" className="font-bold text-leaf-600 underline decoration-gold-300 decoration-2 underline-offset-2 hover:text-leaf-700">
                  join as a farmer →
                </Link>
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= TOP FARMERS ================= */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-leaf-600">Farmer community</p>
              <h2 className="text-balance mt-2 font-display text-3xl font-black text-forest-900 sm:text-4xl">
                The hands that feed us
              </h2>
            </div>
            <Link href="/farmers" className="shrink-0 rounded-full border-2 border-forest-600 px-5 py-2.5 text-sm font-bold text-forest-700 transition-colors hover:bg-forest-600 hover:text-white">
              All farmers →
            </Link>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {farmers.map((f, i) => (
            <Reveal key={f.id} delay={i * 80}>
              <Link href={`/farmers/${f.id}`} className="card-lift group flex h-full flex-col items-center rounded-3xl border border-forest-100 bg-white p-6 text-center shadow-[0_10px_30px_-20px_rgba(36,89,63,0.5)]">
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-leaf-100 to-gold-100 text-4xl shadow-inner transition-transform duration-500 group-hover:scale-110" aria-hidden>
                  {f.avatar}
                </span>
                <h3 className="mt-4 font-display text-lg font-bold text-forest-900">{f.name}</h3>
                {f.farm_name && <p className="text-xs font-semibold text-leaf-600">{f.farm_name}</p>}
                <p className="mt-1 text-xs text-soil-500">📍 {f.location}</p>
                <span className="mt-3 rounded-full bg-forest-50 px-3 py-1 text-[11px] font-bold text-forest-700">
                  {f.listings} live listing{f.listings === 1 ? "" : "s"}
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ================= TESTIMONIALS ================= */}
      <section className="relative overflow-hidden bg-soil-100 py-20">
        <div aria-hidden className="absolute -top-6 left-6 text-6xl opacity-20 sway">🌾</div>
        <div aria-hidden className="absolute bottom-4 right-10 text-6xl opacity-20 sway" style={{ animationDelay: "1.4s" }}>🍃</div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <p className="text-center text-xs font-bold uppercase tracking-[0.25em] text-soil-500">Voices from the community</p>
            <h2 className="text-balance mt-2 text-center font-display text-3xl font-black text-forest-900 sm:text-4xl">
              Trusted on both sides of the fence
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} delay={i * 100}>
                <figure className="card-lift flex h-full flex-col rounded-3xl border border-soil-200 bg-white p-7 shadow-[0_10px_30px_-20px_rgba(51,35,23,0.45)]">
                  <span aria-hidden className="font-display text-5xl leading-none text-gold-400">“</span>
                  <blockquote className="mt-2 flex-1 text-sm leading-relaxed text-soil-700">{t.quote}</blockquote>
                  <figcaption className="mt-5 flex items-center gap-3 border-t border-soil-100 pt-4">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-leaf-50 text-xl" aria-hidden>{t.avatar}</span>
                    <div>
                      <p className="text-sm font-bold text-forest-800">{t.name}</p>
                      <p className="text-xs text-soil-500">{t.role}</p>
                    </div>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="relative mx-auto mt-20 max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-forest-800 px-6 py-14 text-center shadow-2xl sm:px-12">
            <div aria-hidden className="absolute inset-0 opacity-15">
              <div className="absolute -left-6 bottom-0 text-[10rem]">🌾</div>
              <div className="absolute -right-4 bottom-0 text-[9rem]">🥬</div>
              <div className="absolute left-1/3 top-2 text-7xl">🍅</div>
              <div className="absolute right-1/4 top-4 text-6xl">🥭</div>
            </div>
            <h2 className="relative text-balance font-display text-3xl font-black text-white sm:text-4xl">
              Skip the middleman. Taste the difference.
            </h2>
            <p className="relative mx-auto mt-3 max-w-xl text-sm leading-relaxed text-leaf-100">
              Join thousands of farmers and families trading freshness directly — free forever for
              farmers, always.
            </p>
            <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/register?role=farmer" className="w-full rounded-full bg-gold-300 px-8 py-3.5 text-base font-bold text-soil-900 shadow-lg transition-all hover:-translate-y-1 hover:bg-gold-400 sm:w-auto">
                🚜 List My Harvest
              </Link>
              <Link href="/crops" className="w-full rounded-full bg-white/10 px-8 py-3.5 text-base font-bold text-white ring-2 ring-white/40 transition-all hover:-translate-y-1 hover:bg-white/20 sm:w-auto">
                🥬 Browse the Mandi
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
