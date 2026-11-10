"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const AVATAR_CHOICES = ["🧑‍🌾", "🌾", "🥬", "🥭", "🚜", "🐄", "🍅", "🌿", "👩", "👨", "🙂", "🧕"];

export function LoginForm() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "busy">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("busy");
    setError("");
    try {
      const fd = new FormData(e.currentTarget);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: fd.get("email"), password: fd.get("password") }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        router.push(data.role === "farmer" ? "/dashboard" : "/crops");
        router.refresh();
      } else {
        setError(data.error ?? "Login failed.");
        setStatus("idle");
      }
    } catch {
      setError("Could not reach AgriConnect. Check your connection and try again.");
      setStatus("idle");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block">
        <span className="text-xs font-bold uppercase tracking-wider text-soil-500">Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="mt-1 w-full rounded-xl border border-forest-200 bg-forest-50 px-4 py-3 text-sm outline-none focus:border-leaf-500 focus:ring-2 focus:ring-leaf-200"
        />
      </label>
      <label className="block">
        <span className="text-xs font-bold uppercase tracking-wider text-soil-500">Password</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="mt-1 w-full rounded-xl border border-forest-200 bg-forest-50 px-4 py-3 text-sm outline-none focus:border-leaf-500 focus:ring-2 focus:ring-leaf-200"
        />
      </label>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-2.5 text-xs font-semibold text-red-700">{error}</p>
      )}

      <button
        disabled={status === "busy"}
        className="w-full rounded-full bg-forest-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-forest-600/25 transition-all hover:-translate-y-0.5 hover:bg-forest-700 disabled:opacity-60"
      >
        {status === "busy" ? "Signing in..." : "🌱 Sign in"}
      </button>

      <p className="text-center text-xs text-soil-500">
        New to AgriConnect?{" "}
        <Link href="/register" className="font-bold text-leaf-600 hover:underline">
          Create a free account
        </Link>
      </p>

      <div className="rounded-2xl border border-gold-200 bg-gold-50 p-4 text-xs leading-relaxed text-gold-900">
        <p className="font-bold">🎁 Try the demo accounts:</p>
        <button
          type="button"
          onClick={() => {
            const form = document.querySelector<HTMLFormElement>("form");
            if (form) {
              (form.elements.namedItem("email") as HTMLInputElement).value = "ramesh@agriconnect.farm";
              (form.elements.namedItem("password") as HTMLInputElement).value = "farm123";
            }
          }}
          className="mt-2 block w-full rounded-lg bg-white px-3 py-2 text-left font-semibold shadow-sm hover:bg-gold-100"
        >
          🧑‍🌾 Farmer demo — ramesh@agriconnect.farm / farm123
        </button>
        <button
          type="button"
          onClick={() => {
            const form = document.querySelector<HTMLFormElement>("form");
            if (form) {
              (form.elements.namedItem("email") as HTMLInputElement).value = "priya@example.com";
              (form.elements.namedItem("password") as HTMLInputElement).value = "farm123";
            }
          }}
          className="mt-1.5 block w-full rounded-lg bg-white px-3 py-2 text-left font-semibold shadow-sm hover:bg-gold-100"
        >
          👩 Consumer demo — priya@example.com / farm123
        </button>
      </div>
    </form>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [role, setRole] = useState<"consumer" | "farmer">(
    params.get("role") === "farmer" ? "farmer" : "consumer"
  );
  const [avatar, setAvatar] = useState("🧑‍🌾");
  const [status, setStatus] = useState<"idle" | "busy">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("busy");
    setError("");
    try {
      const fd = new FormData(e.currentTarget);
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          email: fd.get("email"),
          password: fd.get("password"),
          phone: fd.get("phone"),
          location: fd.get("location"),
          role,
          avatar,
          farm_name: fd.get("farm_name"),
          bio: fd.get("bio"),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        router.push(role === "farmer" ? "/dashboard" : "/crops");
        router.refresh();
      } else {
        setError(data.error ?? "Registration failed.");
        setStatus("idle");
      }
    } catch {
      setError("Could not reach AgriConnect. Check your connection and try again.");
      setStatus("idle");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Role toggle */}
      <div className="grid grid-cols-2 gap-2 rounded-2xl border border-forest-100 bg-forest-50 p-2">
        {(["consumer", "farmer"] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => {
              setRole(r);
              setAvatar(r === "farmer" ? "🧑‍🌾" : "🙂");
            }}
            className={`rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
              role === r ? "bg-forest-600 text-white shadow-md" : "text-forest-700 hover:bg-forest-100"
            }`}
          >
            {r === "farmer" ? "🚜 I'm a Farmer" : "🛒 I'm a Consumer"}
          </button>
        ))}
      </div>

      <label className="block">
        <span className="text-xs font-bold uppercase tracking-wider text-soil-500">Full name</span>
        <input
          name="name"
          required
          className="mt-1 w-full rounded-xl border border-forest-200 bg-forest-50 px-4 py-3 text-sm outline-none focus:border-leaf-500 focus:ring-2 focus:ring-leaf-200"
        />
      </label>

      {role === "farmer" && (
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-soil-500">Farm name</span>
          <input
            name="farm_name"
            required
            placeholder="e.g. Sunrise Valley Farm"
            className="mt-1 w-full rounded-xl border border-forest-200 bg-forest-50 px-4 py-3 text-sm outline-none focus:border-leaf-500 focus:ring-2 focus:ring-leaf-200"
          />
        </label>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-soil-500">Email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-1 w-full rounded-xl border border-forest-200 bg-forest-50 px-4 py-3 text-sm outline-none focus:border-leaf-500"
          />
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-soil-500">Password</span>
          <input
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            placeholder="6+ characters"
            className="mt-1 w-full rounded-xl border border-forest-200 bg-forest-50 px-4 py-3 text-sm outline-none focus:border-leaf-500"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-soil-500">Phone</span>
          <input
            name="phone"
            type="tel"
            placeholder="+91 ..."
            className="mt-1 w-full rounded-xl border border-forest-200 bg-forest-50 px-4 py-3 text-sm outline-none focus:border-leaf-500"
          />
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-soil-500">
            {role === "farmer" ? "Farm location" : "Your city"}
          </span>
          <input
            name="location"
            placeholder={role === "farmer" ? "e.g. Nashik, Maharashtra" : "e.g. Bengaluru"}
            className="mt-1 w-full rounded-xl border border-forest-200 bg-forest-50 px-4 py-3 text-sm outline-none focus:border-leaf-500"
          />
        </label>
      </div>

      <label className="block">
        <span className="text-xs font-bold uppercase tracking-wider text-soil-500">
          {role === "farmer" ? "About your farm" : "A little about you"} (optional)
        </span>
        <textarea
          name="bio"
          rows={2}
          placeholder={role === "farmer" ? "What do you grow? Tell buyers your story..." : "What are you looking for?"}
          className="mt-1 w-full resize-none rounded-xl border border-forest-200 bg-forest-50 px-4 py-3 text-sm outline-none focus:border-leaf-500"
        />
      </label>

      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-soil-500">Pick an avatar</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {AVATAR_CHOICES.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setAvatar(a)}
              className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl transition-all ${
                avatar === a ? "bg-forest-600 shadow-md ring-2 ring-leaf-300" : "bg-forest-50 hover:bg-forest-100"
              }`}
              aria-label={`Choose avatar ${a}`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-2.5 text-xs font-semibold text-red-700">{error}</p>
      )}

      <button
        disabled={status === "busy"}
        className="w-full rounded-full bg-leaf-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-leaf-600/25 transition-all hover:-translate-y-0.5 hover:bg-leaf-700 disabled:opacity-60"
      >
        {status === "busy" ? "Creating account..." : role === "farmer" ? "🚜 Start selling — free forever" : "🛒 Create my account"}
      </button>

      <p className="text-center text-xs text-soil-500">
        Already have an account?{" "}
        <Link href="/login" className="font-bold text-leaf-600 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
