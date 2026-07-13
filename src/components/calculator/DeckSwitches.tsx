// src/components/calculator/DeckSwitches.tsx
// The faceplate's slide switches, printed above the keyboard on the real units
// (power / mode / trace). Driven by each model's `switches` spec — the HP-97
// desk unit carries three (Power / Mode / Trace); the classic programmables
// carry power + a W/PRGM–RUN (65/67) or PRGM–RUN (25) mode switch; the HP-35/45
// carry the power switch alone. Decorative, rendered in their rest positions.
"use client";

import type { SwitchSpec } from "./models";

/** One two-position slide switch: a track with the nub parked at `pos`. */
function Slide({ caption, left, right, pos }: SwitchSpec) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-1">
      <span className="font-mono text-[8px] font-semibold tracking-[0.12em] text-hp-key-fg/85 uppercase">
        {caption}
      </span>
      <div className="flex items-center gap-1">
        <span className="font-mono text-[8px] tracking-wide text-hp-key-fg/75 uppercase">
          {left}
        </span>
        {/* the switch track + parked nub */}
        <span className="relative inline-block h-2.5 w-6 rounded-full border border-black/50 bg-black/35 shadow-[inset_0_1px_1px_rgb(0_0_0/0.4)]">
          <span
            className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-hp-key shadow-[0_1px_1px_rgb(0_0_0/0.5)]"
            style={pos === "left" ? { left: "-1px" } : { right: "-1px" }}
          />
        </span>
        <span className="font-mono text-[8px] tracking-wide text-hp-key-fg/90 uppercase">
          {right}
        </span>
      </div>
    </div>
  );
}

export function DeckSwitches({ switches }: { switches: SwitchSpec[] }) {
  return (
    <div
      data-slot="deck-switches"
      aria-hidden
      className="flex items-center justify-around gap-2 px-2"
    >
      {switches.map((s) => (
        <Slide key={s.caption} {...s} />
      ))}
    </div>
  );
}
