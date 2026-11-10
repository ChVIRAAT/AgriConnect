export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5 select-none">
      <svg
        width="42"
        height="42"
        viewBox="0 0 64 64"
        fill="none"
        aria-hidden
        className="shrink-0 drop-shadow-sm"
      >
        {/* Network / connection node behind */}
        <circle cx="32" cy="32" r="30" fill="url(#agri-ring)" opacity="0.14" />
        <path
          d="M32 56c0-9 0-16 0-22"
          stroke="#24593f"
          strokeWidth="3.4"
          strokeLinecap="round"
        />
        {/* Crop leaves along the stem */}
        <path
          d="M32 40c-7-1.5-10-6-10.5-11 6 .5 9.8 3.6 10.5 8.4"
          fill="#5fae33"
        />
        <path
          d="M32 47c7-1.5 10-6 10.5-11-6 .5-9.8 3.6-10.5 8.4"
          fill="#3a8a64"
        />
        {/* Top leaf */}
        <path
          d="M32 34c-1.5-8 2-13.5 8.5-16.5.8 7.8-2.4 13.4-8.5 16.5z"
          fill="#7fc754"
        />
        {/* Connection nodes on the stem */}
        <circle cx="32" cy="24" r="2.6" fill="#f5b32a" />
        <circle cx="32" cy="40" r="2.2" fill="#f5b32a" opacity="0.85" />
        <circle cx="32" cy="50" r="2.2" fill="#a97c4c" />
        {/* Ground line — soil */}
        <path
          d="M20 56.5h24"
          stroke="#a97c4c"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="agri-ring" x1="0" y1="0" x2="64" y2="64">
            <stop offset="0" stopColor="#7fc754" />
            <stop offset="0.6" stopColor="#2d6f50" />
            <stop offset="1" stopColor="#a97c4c" />
          </linearGradient>
        </defs>
      </svg>
      <span className="leading-none">
        <span className="block font-display text-xl font-bold tracking-tight text-forest-800">
          Agri<span className="text-leaf-600">Connect</span>
        </span>
        {!compact && (
          <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.22em] text-soil-500">
            Farm to Consumer
          </span>
        )}
      </span>
    </span>
  );
}
