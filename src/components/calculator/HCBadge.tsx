// src/components/calculator/HCBadge.tsx
// The Hello Calc maker's mark (§14 rev 7): a rounded square badge with
// italic lowercase "hc" — in the SPIRIT of the vintage calculator-era badge,
// but our own: pink, not blue, and no HP marks anywhere (trademark-safe).
"use client";

export function HCBadge({ className }: { className?: string }) {
  return (
    <svg
      data-slot="hc-badge"
      viewBox="0 0 24 24"
      role="img"
      aria-label="Hello Calc"
      className={className}
    >
      <rect x="0.5" y="0.5" width="23" height="23" rx="5.5" fill="var(--color-hc-pink)" />
      {/* subtle top highlight — machine plane finish (§13) */}
      <rect
        x="1.5"
        y="1.5"
        width="21"
        height="10"
        rx="4.5"
        fill="rgb(255 255 255 / 0.14)"
      />
      <text
        x="12"
        y="16.5"
        textAnchor="middle"
        fontFamily="var(--font-sans)"
        fontStyle="italic"
        fontWeight="800"
        fontSize="13"
        letterSpacing="-0.5"
        fill="#fdfcf9"
      >
        hc
      </text>
    </svg>
  );
}
