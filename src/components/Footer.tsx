import Link from "next/link";
import { Logo } from "./Logo";

const CATEGORY_LINKS = [
  { href: "/crops?category=Vegetables", label: "Vegetables" },
  { href: "/crops?category=Fruits", label: "Fruits" },
  { href: "/crops?category=Grains", label: "Grains & Rice" },
  { href: "/crops?category=Spices", label: "Spices" },
  { href: "/crops?category=Dairy", label: "Dairy & Eggs" },
];

const QUICK_LINKS = [
  { href: "/crops", label: "Browse Crops" },
  { href: "/farmers", label: "Farmer Directory" },
  { href: "/register?role=farmer", label: "Sell Your Crops" },
  { href: "/about", label: "How It Works" },
];

export function Footer() {
  return (
    <footer className="relative mt-24 bg-forest-900 text-forest-100">
      {/* top wave */}
      <svg
        aria-hidden
        className="absolute -top-[38px] left-0 h-[40px] w-full text-forest-900"
        viewBox="0 0 1440 40"
        preserveAspectRatio="none"
      >
        <path d="M0 40V22C240 2 480 0 720 10c240 10 480 22 720 6v22H0z" fill="currentColor" />
      </svg>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="rounded-2xl bg-white/95 px-3 py-2.5 inline-block">
            <Logo />
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-forest-200">
            A fair digital mandi that connects farmers directly with consumers — no middlemen,
            better prices, fresher food.
          </p>
          <div className="mt-5 flex gap-2 text-xl" aria-hidden>
            <span title="Wheat">🌾</span>
            <span title="Leaf">🍃</span>
            <span title="Tomato">🍅</span>
            <span title="Cow">🐄</span>
            <span title="Tractor">🚜</span>
          </div>
        </div>

        <div>
          <h3 className="font-display text-base font-bold text-white">Shop by Category</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {CATEGORY_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-forest-200 transition-colors hover:text-gold-300">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-base font-bold text-white">Quick Links</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {QUICK_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-forest-200 transition-colors hover:text-gold-300">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-base font-bold text-white">Reach the Fields</h3>
          <ul className="mt-4 space-y-3 text-sm text-forest-200">
            <li className="flex items-start gap-2.5">
              <span aria-hidden>📍</span>
              <span>AgriConnect Foundation, Green Park Road, Bengaluru 560001</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span aria-hidden>📞</span>
              <span>1800-AGRI-FARM (toll free, 6 AM – 10 PM)</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span aria-hidden>✉️</span>
              <span>hello@agriconnect.farm</span>
            </li>
          </ul>
          <div className="mt-5 rounded-2xl border border-forest-700 bg-forest-800/60 p-4 text-xs leading-relaxed text-forest-200">
            <span aria-hidden className="mr-1.5">🌱</span>
            Every purchase on AgriConnect pays the farmer directly. We charge farmers nothing to
            list.
          </div>
        </div>
      </div>

      <div className="border-t border-forest-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-forest-300 sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} AgriConnect · Farm to Consumer. Grown with 🌾 in India.</p>
          <p className="flex items-center gap-1.5" aria-hidden>
            <span>🌽</span> <span>🍅</span> <span>🥭</span> <span>🌾</span> <span>🐄</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
