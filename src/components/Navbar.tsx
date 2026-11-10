"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";

export type NavUser = {
  id: number;
  name: string;
  role: "farmer" | "consumer";
  avatar: string;
} | null;

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/crops", label: "Browse Crops" },
  { href: "/farmers", label: "Farmers" },
  { href: "/about", label: "About" },
];

export function Navbar({ user }: { user: NavUser }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-[#faf7ef]/90 shadow-[0_8px_30px_-12px_rgba(36,89,63,0.25)] backdrop-blur-md"
          : "bg-[#faf7ef]/60 backdrop-blur-sm"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="AgriConnect home">
          <Logo />
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => {
            const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-forest-600 text-white shadow-sm"
                    : "text-forest-800 hover:bg-forest-100"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              {user.role === "farmer" && (
                <Link
                  href="/dashboard"
                  className="rounded-full px-4 py-2 text-sm font-semibold text-forest-800 transition-colors hover:bg-forest-100"
                >
                  Dashboard
                </Link>
              )}
              <span className="flex items-center gap-2 rounded-full border border-forest-200 bg-white px-3 py-1.5 text-sm font-semibold text-forest-800 shadow-sm">
                <span aria-hidden>{user.avatar}</span>
                <span className="max-w-[9rem] truncate">{user.name.split(" ")[0]}</span>
              </span>
              <button
                onClick={logout}
                className="rounded-full px-3 py-2 text-sm font-semibold text-soil-600 transition-colors hover:bg-soil-100 hover:text-soil-800"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full px-4 py-2 text-sm font-semibold text-forest-800 transition-colors hover:bg-forest-100"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-leaf-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-leaf-600/30 transition-all hover:-translate-y-0.5 hover:bg-leaf-700"
              >
                Join Free
              </Link>
            </>
          )}
        </div>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-full border border-forest-200 bg-white text-forest-800 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </nav>

      {open && (
        <div className="border-t border-forest-100 bg-[#faf7ef]/95 px-4 pb-4 pt-2 backdrop-blur-md md:hidden">
          <div className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold ${
                  (l.href === "/" ? pathname === "/" : pathname.startsWith(l.href))
                    ? "bg-forest-600 text-white"
                    : "text-forest-800 hover:bg-forest-100"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2 border-t border-forest-100 pt-3">
            {user ? (
              <>
                {user.role === "farmer" && (
                  <Link href="/dashboard" className="flex-1 rounded-xl bg-forest-100 px-4 py-2.5 text-center text-sm font-bold text-forest-800">
                    Dashboard
                  </Link>
                )}
                <button onClick={logout} className="flex-1 rounded-xl border border-soil-200 px-4 py-2.5 text-sm font-bold text-soil-700">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="flex-1 rounded-xl border border-forest-200 px-4 py-2.5 text-center text-sm font-bold text-forest-800">
                  Login
                </Link>
                <Link href="/register" className="flex-1 rounded-xl bg-leaf-600 px-4 py-2.5 text-center text-sm font-bold text-white">
                  Join Free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
