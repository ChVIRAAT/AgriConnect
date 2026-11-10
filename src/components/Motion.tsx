"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/** Fades + slides children in when they enter the viewport. */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            obs.disconnect();
          }
        });
      },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "revealed" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

type FloaterSpec = {
  emoji: string;
  left: string;
  delay: string;
  duration: string;
  size: string;
  opacity: string;
};

const LEAF_SETS: FloaterSpec[] = [
  { emoji: "🍃", left: "4%", delay: "0s", duration: "17s", size: "20px", opacity: "0.7" },
  { emoji: "🌾", left: "12%", delay: "3s", duration: "21s", size: "24px", opacity: "0.65" },
  { emoji: "🍂", left: "22%", delay: "7s", duration: "19s", size: "18px", opacity: "0.6" },
  { emoji: "🌿", left: "33%", delay: "1.5s", duration: "23s", size: "22px", opacity: "0.7" },
  { emoji: "🍃", left: "47%", delay: "9s", duration: "18s", size: "17px", opacity: "0.55" },
  { emoji: "🌾", left: "58%", delay: "5s", duration: "24s", size: "23px", opacity: "0.6" },
  { emoji: "🍂", left: "69%", delay: "11s", duration: "20s", size: "19px", opacity: "0.65" },
  { emoji: "🌿", left: "78%", delay: "2.5s", duration: "22s", size: "21px", opacity: "0.6" },
  { emoji: "🍃", left: "88%", delay: "8s", duration: "18s", size: "18px", opacity: "0.7" },
  { emoji: "🌾", left: "94%", delay: "13s", duration: "25s", size: "22px", opacity: "0.55" },
];

/** Gentle floating leaves / wheat overlay, absolutely positioned inside a relative parent. */
export function FloatingLeaves({ count = 10 }: { count?: number }) {
  const specs = LEAF_SETS.slice(0, count);
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {specs.map((spec, i) => (
        <span
          key={i}
          className="floating-leaf"
          style={{
            left: spec.left,
            fontSize: spec.size,
            opacity: spec.opacity,
            animationDelay: spec.delay,
            animationDuration: spec.duration,
          }}
        >
          {spec.emoji}
        </span>
      ))}
    </div>
  );
}
