"use client";

import type { CSSProperties } from "react";

type CloudSpec = { top: string; scale: number; duration: string; delay: string; opacity: number };

const CLOUDS: CloudSpec[] = [
  { top: "6%", scale: 1, duration: "75s", delay: "0s", opacity: 0.9 },
  { top: "16%", scale: 0.62, duration: "95s", delay: "-30s", opacity: 0.65 },
  { top: "27%", scale: 0.8, duration: "85s", delay: "-60s", opacity: 0.75 },
];

function Cloud({ scale, opacity }: { scale: number; opacity: number }) {
  return (
    <svg width={150 * scale} height={46 * scale} viewBox="0 0 150 46" fill="none" opacity={opacity}>
      <ellipse cx="45" cy="30" rx="42" ry="15" fill="#ffffff" />
      <ellipse cx="85" cy="24" rx="32" ry="17" fill="#ffffff" />
      <ellipse cx="115" cy="32" rx="30" ry="12" fill="#ffffff" />
      <ellipse cx="65" cy="18" rx="24" ry="13" fill="#ffffff" />
    </svg>
  );
}

function Tree({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg width="52" height="70" viewBox="0 0 52 70" fill="none" className={className} style={style}>
      <rect x="24" y="42" width="5" height="24" rx="2" fill="#6c4a30" />
      <circle cx="26" cy="28" r="20" fill="#2d6f50" />
      <circle cx="14" cy="34" r="12" fill="#3a8a64" />
      <circle cx="39" cy="35" r="11" fill="#3a8a64" />
      <circle cx="26" cy="14" r="12" fill="#5aa682" />
    </svg>
  );
}

function Cow({ className = "" }: { className?: string }) {
  return (
    <svg width="46" height="32" viewBox="0 0 46 32" fill="none" className={className}>
      <ellipse cx="18" cy="24" rx="14" ry="7.5" fill="#f7f3ea" stroke="#c9b99a" strokeWidth="1" />
      <path d="M8 17c3-6 10-9 17-8 5 .7 8 3 9 6" fill="#f7f3ea" />
      <circle cx="6.5" cy="17" r="5" fill="#f7f3ea" stroke="#c9b99a" />
      <ellipse cx="4.5" cy="19.5" rx="2.6" ry="2" fill="#e8a9a0" />
      <circle cx="6" cy="15.6" r="1" fill="#332317" />
      <rect x="9" y="27" width="3" height="5" rx="1.2" fill="#d9cbb0" />
      <rect x="15" y="27.5" width="3" height="4.5" rx="1.2" fill="#d9cbb0" />
      <rect x="23" y="27.5" width="3" height="4.5" rx="1.2" fill="#d9cbb0" />
      <rect x="28" y="27" width="3" height="5" rx="1.2" fill="#d9cbb0" />
      <path d="M30 20c4-1 6-4 6-7" stroke="#c9b99a" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M40 11.5c2-1.5 4-1 4.6.8-1.4 1.6-3.4 1.7-4.6-.8z" fill="#a97c4c" />
    </svg>
  );
}

function FarmerSitting() {
  return (
    <svg width="34" height="40" viewBox="0 0 34 40" fill="none">
      <circle cx="14" cy="8" r="5" fill="#b97a56" />
      <path d="M9 7c1-4 9-4.5 10.5-.5l-2 .8C15 5.6 11 5.6 9 7z" fill="#24593f" />
      <rect x="12" y="12.6" width="5" height="10" rx="2" fill="#f5b32a" />
      <path d="M12.5 22h9l6 10-3.6 1.8-4.4-6h-8z" fill="#2d6f50" />
      <path d="M21 22l5.5-4.5 2 2.4L24 24z" fill="#f5b32a" />
      <rect x="8.5" y="30" width="4" height="9" rx="1.6" fill="#24593f" />
      <rect x="19" y="30" width="4" height="9" rx="1.6" fill="#24593f" />
    </svg>
  );
}

function Sprout({ delay }: { delay: string }) {
  return (
    <svg width="20" height="22" viewBox="0 0 20 22" fill="none" className="sway" style={{ animationDelay: delay }}>
      <path d="M10 21V11" stroke="#478b26" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 13C6.5 12.4 4.6 9.8 4.4 6.5 7.7 6.8 9.6 9 10 12.4" fill="#5fae33" />
      <path d="M10 11c3.4-.5 5.3-2.8 5.6-6C12.4 5.3 10.5 7.7 10 10.4" fill="#7fc754" />
    </svg>
  );
}

function WheatBunch({ className = "" }: { className?: string }) {
  return (
    <svg width="30" height="42" viewBox="0 0 30 42" fill="none" className={className}>
      <path d="M15 40V18" stroke="#c27409" strokeWidth="2.2" strokeLinecap="round" />
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i} transform={`translate(0 ${22 - i * 4})`}>
          <ellipse cx="10.5" cy="0" rx="2.6" ry="4.4" fill="#f8ca52" transform="rotate(-28 10.5 0)" />
          <ellipse cx="19.5" cy="0" rx="2.6" ry="4.4" fill="#f5b32a" transform="rotate(28 19.5 0)" />
        </g>
      ))}
      <ellipse cx="15" cy="8" rx="2.6" ry="4.6" fill="#f8ca52" />
    </svg>
  );
}

function Barn() {
  return (
    <svg width="64" height="46" viewBox="0 0 64 46" fill="none">
      <path d="M6 44V20L32 6l26 14v24H6z" fill="#a97c4c" />
      <path d="M6 20L32 6l26 14v5L32 11 6 25v-5z" fill="#8a613c" />
      <path d="M24 44V30a8 8 0 0 1 16 0v14H24z" fill="#6c4a30" />
      <path d="M32 30v14M25.5 36h13" stroke="#f2e9dc" strokeWidth="2" />
      <rect x="9" y="27" width="7" height="7" rx="1" fill="#f8ca52" opacity="0.85" />
      <rect x="48" y="27" width="7" height="7" rx="1" fill="#f8ca52" opacity="0.85" />
    </svg>
  );
}

function Tractor({ className = "" }: { className?: string }) {
  return (
    <svg width="44" height="32" viewBox="0 0 44 32" fill="none" className={className}>
      <rect x="10" y="12" width="16" height="8" rx="2" fill="#c27409" />
      <rect x="14" y="4" width="9" height="9" rx="2" fill="#9a530b" />
      <rect x="24" y="8" width="8" height="12" rx="2" fill="#c27409" />
      <circle cx="13" cy="24" r="6.5" fill="#332317" />
      <circle cx="13" cy="24" r="2.6" fill="#d1b48c" />
      <circle cx="32" cy="25" r="5" fill="#332317" />
      <circle cx="32" cy="25" r="2" fill="#d1b48c" />
      <path d="M27 11h3" stroke="#332317" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function WaterTank() {
  return (
    <svg width="34" height="44" viewBox="0 0 34 44" fill="none">
      <ellipse cx="17" cy="8" rx="12" ry="4.5" fill="#5aa682" />
      <path d="M5 8v10c0 2.6 5.4 4.6 12 4.6s12-2 12-4.6V8" fill="#3a8a64" />
      <path d="M5 13c0 2.6 5.4 4.6 12 4.6S29 15.6 29 13" stroke="#2d6f50" strokeWidth="1.4" />
      <path d="M9 22l-3 18M25 22l3 18M17 23v17" stroke="#8a613c" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M17 15v6" stroke="#a5dd86" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="2 2.4" />
    </svg>
  );
}

function FieldRow({ style, tone }: { style?: CSSProperties; tone: string }) {
  return (
    <svg width="100%" height="26" viewBox="0 0 400 26" preserveAspectRatio="none" style={style}>
      <path d="M0 24C70 14 150 8 200 8s130 6 200 16v2H0v-2z" fill={tone} />
    </svg>
  );
}

/**
 * Layered animated farm landscape: sky with drifting clouds, sun, distant
 * hills, trees, barn, tractor, grazing cow, working farmer, irrigation tank,
 * swaying crop rows and floating wheat — all pure inline SVG.
 */
export function FarmScene() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Sky */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#eaf4ec] via-[#f6f1e3] to-[#faf7ef]" />

      {/* Sun */}
      <div className="absolute right-[9%] top-[7%] h-24 w-24 rounded-full bg-gradient-to-br from-gold-200 via-gold-300 to-gold-400 opacity-80 blur-[1px]" />
      <div className="absolute right-[10.5%] top-[8.5%] h-[4.5rem] w-[4.5rem] rounded-full bg-gold-300/60 blur-2xl" />

      {/* Drifting clouds */}
      {CLOUDS.map((c, i) => (
        <div
          key={i}
          className="cloud"
          style={{ top: c.top, animationDuration: c.duration, animationDelay: c.delay, transform: `scale(${c.scale})`, opacity: c.opacity }}
        >
          <Cloud scale={1} opacity={1} />
        </div>
      ))}

      {/* Distant hills */}
      <svg className="absolute bottom-[26%] left-0 w-full" height="90" viewBox="0 0 1440 90" preserveAspectRatio="none">
        <path d="M0 90V55C180 18 340 8 520 30c150 18 260 40 420 34 190-7 340-40 500-52v78H0z" fill="#bfd8c2" opacity="0.8" />
      </svg>
      <svg className="absolute bottom-[24%] left-0 w-full" height="70" viewBox="0 0 1440 70" preserveAspectRatio="none">
        <path d="M0 70V40C220 8 430 4 640 22c210 18 400 30 800 12v36H0z" fill="#9cc4a4" opacity="0.9" />
      </svg>

      {/* Field base */}
      <div className="absolute bottom-0 left-0 h-[27%] w-full bg-gradient-to-b from-leaf-300 via-leaf-400 to-leaf-500" />

      {/* Crop rows receding */}
      <div className="absolute bottom-[6%] left-0 w-full opacity-90">
        <FieldRow tone="#478b26" />
      </div>
      <div className="absolute bottom-[12%] left-0 w-full opacity-80">
        <FieldRow tone="#5fae33" />
      </div>
      <div className="absolute bottom-[18%] left-0 w-full opacity-70">
        <FieldRow tone="#7fc754" />
      </div>

      {/* Barn with smoke */}
      <div className="absolute bottom-[24%] left-[6%] hidden sm:block">
        <Barn />
        <div className="relative">
          <span className="smoke absolute -top-2 left-1/2 h-3 w-3 rounded-full bg-white/70 blur-[2px]" />
          <span className="smoke absolute -top-1 left-1/2 h-2.5 w-2.5 rounded-full bg-white/60 blur-[2px]" style={{ animationDelay: "1.6s" }} />
        </div>
      </div>

      {/* Trees */}
      <Tree className="absolute bottom-[27%] left-[20%] hidden md:block" style={{ transform: "scale(1.1)" }} />
      <Tree className="absolute bottom-[40%] left-[64%] hidden lg:block" style={{ transform: "scale(0.8)", opacity: 0.8 }} />
      <Tree className="absolute bottom-[28%] right-[8%]" style={{ transform: "scale(0.95)" }} />

      {/* Irrigation tank + water drops */}
      <div className="absolute bottom-[25%] left-[42%] hidden lg:block">
        <WaterTank />
        <span className="drop absolute -bottom-1 right-1 text-sky-500 text-[11px]" style={{ animationDelay: "0s" }}>💧</span>
        <span className="drop absolute -bottom-1 right-4 text-sky-500 text-[9px]" style={{ animationDelay: "1.2s" }}>💧</span>
      </div>

      {/* Tractor */}
      <Tractor className="absolute bottom-[8%] left-[30%] hidden md:block graze" />

      {/* Grazing cow */}
      <Cow className="absolute bottom-[7.5%] right-[24%] graze hidden sm:block" />

      {/* Working farmer */}
      <div className="absolute bottom-[8%] right-[14%] hidden sm:block">
        <FarmerSitting />
      </div>

      {/* Sprouts along the foreground row */}
      <div className="absolute bottom-[3%] left-0 flex w-full items-end justify-between px-6 opacity-95">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <Sprout key={i} delay={`${i * 0.7}s`} />
        ))}
      </div>

      {/* Wheat bunches in the corners */}
      <WheatBunch className="absolute bottom-[2%] left-[3%] opacity-90 hidden md:block sway" />
      <WheatBunch className="absolute bottom-[3%] right-[3%] opacity-90 hidden md:block sway" />
    </div>
  );
}
