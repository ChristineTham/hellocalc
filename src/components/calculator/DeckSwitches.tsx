// src/components/calculator/DeckSwitches.tsx
// The HP-97's three slide switches, printed in the deck band below the LED and
// above the keyboard (hp/layouts/HP-97.md): OFF–ON (power), PRGM–RUN (mode),
// and TRACE MAN–NORM (print mode). Decorative faceplate detail — rendered in
// their real rest positions (ON / RUN / NORM); inert like the printing keys.
"use client";

/** One two-position slide switch: a track with the nub parked at `pos`. */
function Slide({
  caption,
  left,
  right,
  pos,
}: {
  caption: string;
  left: string;
  right: string;
  pos: "left" | "right";
}) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-1">
      <span className="font-mono text-[8px] font-semibold tracking-[0.12em] text-hp-key-fg/55 uppercase">
        {caption}
      </span>
      <div className="flex items-center gap-1">
        <span className="font-mono text-[8px] tracking-wide text-hp-key-fg/45 uppercase">
          {left}
        </span>
        {/* the switch track + parked nub */}
        <span className="relative inline-block h-2.5 w-6 rounded-full border border-black/50 bg-black/35 shadow-[inset_0_1px_1px_rgb(0_0_0/0.4)]">
          <span
            className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-hp-key shadow-[0_1px_1px_rgb(0_0_0/0.5)]"
            style={pos === "left" ? { left: "-1px" } : { right: "-1px" }}
          />
        </span>
        <span className="font-mono text-[8px] tracking-wide text-hp-key-fg/75 uppercase">
          {right}
        </span>
      </div>
    </div>
  );
}

export function DeckSwitches() {
  return (
    <div
      data-slot="deck-switches"
      aria-hidden
      className="flex items-center justify-around gap-2 px-2"
    >
      <Slide caption="Power" left="Off" right="On" pos="right" />
      <Slide caption="Mode" left="Prgm" right="Run" pos="right" />
      <Slide caption="Trace" left="Man" right="Norm" pos="right" />
    </div>
  );
}
