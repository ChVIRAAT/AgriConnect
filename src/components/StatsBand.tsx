"use client";

import { useEffect, useRef, useState } from "react";

type Stats = { farmers: number; crops: number; categories: number; locations: number };

function useCountUp(target: number, start: boolean, duration = 1400): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, start, duration]);
  return value;
}

function StatCell({
  icon,
  value,
  label,
  start,
  suffix = "",
}: {
  icon: string;
  value: number;
  label: string;
  start: boolean;
  suffix?: string;
}) {
  const shown = useCountUp(value, start);
  return (
    <div className="flex flex-col items-center gap-1 rounded-3xl bg-white/10 px-4 py-5 text-center backdrop-blur-sm">
      <span aria-hidden className="text-2xl">{icon}</span>
      <span className="font-display text-3xl font-black text-white">
        {shown.toLocaleString("en-IN")}
        {suffix}
      </span>
      <span className="text-xs font-semibold uppercase tracking-widest text-leaf-200">{label}</span>
    </div>
  );
}

export function StatsBand({ stats }: { stats: Stats }) {
  const ref = useRef<HTMLDivElement>(null);
  const [start, setStart] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setStart(true);
          obs.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      <StatCell icon="🧑‍🌾" value={stats.farmers} label="Farmers" start={start} />
      <StatCell icon="🌾" value={stats.crops} label="Live Listings" start={start} />
      <StatCell icon="🧺" value={stats.categories} label="Categories" start={start} />
      <StatCell icon="📍" value={stats.locations} label="Farming Regions" start={start} />
    </div>
  );
}
