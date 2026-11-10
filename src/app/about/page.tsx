import type { Metadata } from "next";
import Link from "next/link";
import { Reveal, FloatingLeaves } from "@/components/Motion";
import { FarmScene } from "@/components/FarmScene";

export const metadata: Metadata = {
  title: "About & How It Works",
  description:
    "How AgriConnect connects farmers directly with consumers — no middlemen, no commission, fair prices and fresher food for everyone.",
};

const BELIEFS = [
  {
    icon: "🧑‍🌾",
    title: "Farmers deserve the full price",
    text: "When a tomato passes through four hands before reaching your kitchen, the farmer who watered it for 90 days is paid the least. We remove every hand in between — buyers transact with the farmer directly.",
  },
  {
    icon: "🥬",
    title: "Freshness is measured in hours, not days",
    text: "Produce sold on AgriConnect is often in the soil the morning you message about it. No cold-storage weeks, no ripening chemicals, no re-labelling — just harvest dates you can verify.",
  },
  {
    icon: "🤝",
    title: "Trust is built in the open",
    text: "Every listing shows a real farm, a real location and a real phone number. You can call the farmer, visit the farm, and build a relationship that lasts beyond a single purchase.",
  },
  {
    icon: "🌾",
    title: "Free for farmers, always",
    text: "Listing crops on AgriConnect costs nothing — no subscription, no commission, no lock-in. If it doesn't help a farmer earn more, it doesn't belong on the platform.",
  },
];

const FLOW = [
  {
    step: "1",
    icon: "🌱",
    title: "The farmer lists the harvest",
    text: "In under two minutes a farmer posts their crop with price per kilo, available quantity, harvest date, farm location and phone number. They control the price completely — no mandi agent sets it for them.",
  },
  {
    step: "2",
    icon: "🔎",
    title: "The buyer browses & compares",
    text: "Consumers, families and restaurants search by crop, category, region or organic preference. Prices are side by side, harvest dates are visible, and every listing links to the farmer's profile.",
  },
  {
    step: "3",
    icon: "📨",
    title: "Direct inquiry, zero commission",
    text: "The buyer sends an inquiry with quantity and message straight to the farmer's dashboard and can call the farmer directly. Nobody takes a cut of the deal — not us, not anyone.",
  },
  {
    step: "4",
    icon: "🛻",
    title: "They agree & the harvest travels",
    text: "Farmer and buyer settle delivery, payment and price between themselves — cash, UPI, pickup, van delivery, weekly subscription, whatever suits them both. The platform stays out of the way.",
  },
];

const VALUE_PAIRS = [
  {
    for: "For Farmers",
    icon: "🧑‍🌾",
    accent: "from-leaf-100 to-forest-100",
    points: [
      "Set your own price — and keep 100% of it",
      "List unlimited crops free, forever",
      "Answer buyers on your own phone",
      "Repeat customers: restaurants & families that reorder every week",
    ],
  },
  {
    for: "For Consumers",
    icon: "👨‍👩‍👧",
    accent: "from-gold-100 to-leaf-50",
    points: [
      "Freshness measured in hours, not weeks",
      "Prices that skip three middlemen",
      "Know the farm, the family, and the soil your food grew in",
      "Compare by crop, price, region and organic status",
    ],
  },
];

const FAQS = [
  {
    q: "Does AgriConnect take a commission on sales?",
    a: "No. Farmers and buyers settle payment directly between themselves. The platform never touches money and charges neither side anything.",
  },
  {
    q: "Who can list crops?",
    a: "Any farmer or farming household — one-acre kitchen gardens to hundred-acre estates. Register with the role Farmer and you can post with quantity, price, harvest date and location immediately.",
  },
  {
    q: "Can I buy without an account?",
    a: "Yes — browse everything as a guest. Logging in as a consumer makes inquiries faster, because farmers can reply to your inquiries directly from their dashboard.",
  },
  {
    q: "What if a listing is out of date?",
    a: "Farmers manage their own listings on their dashboard and can deactivate a crop the moment it's sold. Harvest dates help you see at a glance how fresh a listing is.",
  },
];

export default function AboutPage() {
  return (
    <div className="overflow-x-clip">
      {/* ------------------ HERO ------------------ */}
      <section className="relative isolate overflow-hidden py-20 sm:py-24">
        <FarmScene />
        <FloatingLeaves count={5} />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <span className="rise inline-flex items-center gap-2 rounded-full border border-forest-200 bg-white/80 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-forest-700 shadow-sm">
            <span aria-hidden>🌱</span> Our story & mission
          </span>
          <h1 className="rise text-balance mt-5 font-display text-4xl font-black leading-tight text-forest-900 sm:text-5xl">
            Why we built the digital mandi that
            <span className="relative inline-block ml-2">
              <span className="relative z-10">pays farmers fully</span>
              <svg aria-hidden className="absolute -bottom-1.5 left-0 w-full text-gold-300" height="10" viewBox="0 0 220 10" preserveAspectRatio="none">
                <path d="M2 7C60 2 160 2 218 7" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none" />
              </svg>
            </span>
          </h1>
          <p className="rise mx-auto mt-5 max-w-2xl text-base leading-relaxed text-soil-700 sm:text-lg">
            AgriConnect was built around one stubborn idea: the person who grows your food should
            keep more of what you pay for it — and you should eat food that was still on the plant
            this week.
          </p>
        </div>
      </section>

      {/* ------------------ WHAT WE BELIEVE ------------------ */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <p className="text-center text-xs font-bold uppercase tracking-[0.25em] text-leaf-600">What we believe</p>
          <h2 className="text-balance mt-2 text-center font-display text-3xl font-black text-forest-900 sm:text-4xl">
            Four roots, one tree
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {BELIEFS.map((b, i) => (
            <Reveal key={b.title} delay={i * 90}>
              <div className="card-lift flex h-full gap-4 rounded-3xl border border-forest-100 bg-white p-6 shadow-[0_10px_30px_-20px_rgba(36,89,63,0.5)]">
                <span
                  aria-hidden
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-leaf-100 to-gold-100 text-2xl shadow-inner"
                >
                  {b.icon}
                </span>
                <div>
                  <h3 className="font-display text-lg font-bold text-forest-900">{b.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-soil-600">{b.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ------------------ HOW IT WORKS FLOW ------------------ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#faf7ef] via-leaf-50 to-[#faf7ef] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <p className="text-center text-xs font-bold uppercase tracking-[0.25em] text-leaf-600">How it works</p>
            <h2 className="text-balance mt-2 text-center font-display text-3xl font-black text-forest-900 sm:text-4xl">
              From field to thali in four steps
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FLOW.map((f, i) => (
              <Reveal key={f.step} delay={i * 100}>
                <div className="card-lift relative h-full rounded-3xl border border-forest-100 bg-white p-6 shadow-[0_10px_30px_-20px_rgba(36,89,63,0.5)]">
                  <span
                    className="absolute -top-4 left-6 flex h-9 w-9 items-center justify-center rounded-full bg-forest-600 font-display text-base font-black text-white shadow-lg shadow-forest-600/30"
                    aria-hidden
                  >
                    {f.step}
                  </span>
                  <div className="mt-3 text-3xl" aria-hidden>{f.icon}</div>
                  <h3 className="mt-2 font-display text-lg font-bold text-forest-900">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-soil-600">{f.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={150}>
            <div className="mx-auto mt-12 grid max-w-5xl gap-5 sm:grid-cols-2">
              {VALUE_PAIRS.map((v) => (
                <div key={v.for} className="rounded-3xl border border-forest-100 bg-white p-6 shadow-[0_10px_30px_-20px_rgba(36,89,63,0.5)]">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${v.accent} text-2xl shadow-inner`} aria-hidden>
                    {v.icon}
                  </div>
                  <h3 className="mt-3 font-display text-xl font-bold text-forest-900">{v.for}</h3>
                  <ul className="mt-3 space-y-2 text-sm text-soil-600">
                    {v.points.map((p) => (
                      <li key={p} className="flex gap-2">
                        <span className="mt-0.5 shrink-0 text-leaf-600" aria-hidden>✔</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ------------------ FAQ ------------------ */}
      <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <Reveal>
          <p className="text-center text-xs font-bold uppercase tracking-[0.25em] text-leaf-600">Common questions</p>
          <h2 className="text-balance mt-2 text-center font-display text-3xl font-black text-forest-900 sm:text-4xl">
            The honest answers
          </h2>
        </Reveal>
        <div className="mt-10 space-y-4">
          {FAQS.map((f, i) => (
            <Reveal key={f.q} delay={i * 70}>
              <details className="group card-lift rounded-3xl border border-forest-100 bg-white p-6 shadow-[0_10px_30px_-22px_rgba(36,89,63,0.5)]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-bold text-forest-900 [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-forest-50 text-forest-700 transition-transform group-open:rotate-45" aria-hidden>
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-soil-600">{f.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ------------------ CTA ------------------ */}
      <section className="mx-auto max-w-7xl px-4 pb-6 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-forest-800 px-6 py-12 text-center shadow-2xl sm:px-12">
            <div aria-hidden className="absolute inset-0 opacity-15">
              <div className="absolute -left-4 bottom-0 text-[9rem]">🌾</div>
              <div className="absolute right-4 bottom-0 text-[8rem]">🥬</div>
              <div className="absolute left-1/3 top-2 text-6xl">🐄</div>
            </div>
            <h2 className="relative text-balance font-display text-3xl font-black text-white sm:text-4xl">
              Ready to skip the middleman?
            </h2>
            <p className="relative mx-auto mt-3 max-w-xl text-sm leading-relaxed text-leaf-100">
              Whether you grow it or you eat it — join the thousands already trading freshness
              directly.
            </p>
            <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/register?role=farmer"
                className="w-full rounded-full bg-gold-300 px-8 py-3.5 text-base font-bold text-soil-900 shadow-lg transition-all hover:-translate-y-1 hover:bg-gold-400 sm:w-auto"
              >
                🚜 Join as a farmer
              </Link>
              <Link
                href="/crops"
                className="w-full rounded-full bg-white/10 px-8 py-3.5 text-base font-bold text-white ring-2 ring-white/40 transition-all hover:-translate-y-1 hover:bg-white/20 sm:w-auto"
              >
                🥬 Browse fresh crops
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
