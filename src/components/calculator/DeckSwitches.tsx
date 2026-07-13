// src/components/calculator/DeckSwitches.tsx
// The faceplate's slide switches, printed above the keyboard on the real units
// (power / mode / trace). Driven by each model's `switches` spec — the HP-97
// desk unit carries three (Power / Mode / Trace); the classic programmables
// carry power + a W/PRGM–RUN (65/67) or PRGM–RUN (25) mode switch; the HP-35/45
// carry the power switch alone. Interactive: each nub slides on click and drives
// real state — power blanks the LCD, mode toggles PRGM/RUN program entry, trace
// gates the printer echo.
"use client";

import { cn } from "@/lib/utils";
import type { SwitchSpec } from "./models";

export interface SwitchState {
  /** program-entry mode, for the Mode switch (undefined on non-programmables) */
  mode?: "RUN" | "PRGM";
  onToggleMode?: () => void;
  /** LCD power, for the Power switch */
  power: boolean;
  onTogglePower: () => void;
  /** printer echo (HP-97), for the Trace switch */
  trace: boolean;
  onToggleTrace: () => void;
}

/** Resolve a switch's LIVE nub position + toggle handler from the deck state.
 * `right` is the powered/normal end (On · Run · Norm); `left` is the other. */
function wire(
  spec: SwitchSpec,
  st: SwitchState,
): { pos: "left" | "right"; onToggle?: () => void; stateLabel: string } {
  switch (spec.kind) {
    case "power":
      return {
        pos: st.power ? "right" : "left",
        onToggle: st.onTogglePower,
        stateLabel: st.power ? spec.right : spec.left,
      };
    case "mode": {
      // no program mode wired ⇒ leave at its rest position, inert
      if (!st.mode || !st.onToggleMode)
        return { pos: spec.pos, stateLabel: spec.pos === "right" ? spec.right : spec.left };
      return {
        pos: st.mode === "RUN" ? "right" : "left",
        onToggle: st.onToggleMode,
        stateLabel: st.mode === "RUN" ? spec.right : spec.left,
      };
    }
    case "trace":
      return {
        pos: st.trace ? "right" : "left",
        onToggle: st.onToggleTrace,
        stateLabel: st.trace ? spec.right : spec.left,
      };
  }
}

/** One two-position slide switch: a clickable track with the nub at `pos`. */
function Slide({ spec, st }: { spec: SwitchSpec; st: SwitchState }) {
  const { pos, onToggle, stateLabel } = wire(spec, st);
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={!onToggle}
      aria-label={`${spec.caption}: ${stateLabel}`}
      className="flex min-w-0 cursor-pointer flex-col items-center gap-1 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hp-key-fg disabled:cursor-default"
    >
      <span className="font-mono text-[8px] font-semibold tracking-[0.12em] text-hp-key-fg/85 uppercase">
        {spec.caption}
      </span>
      <div className="flex items-center gap-1">
        <span
          className={cn(
            "font-mono text-[8px] tracking-wide uppercase",
            pos === "left" ? "text-hp-key-fg" : "text-hp-key-fg/75",
          )}
        >
          {spec.left}
        </span>
        {/* the switch track + nub, parked at the live position */}
        <span className="relative inline-block h-2.5 w-6 rounded-full border border-black/50 bg-black/35 shadow-[inset_0_1px_1px_rgb(0_0_0/0.4)]">
          <span
            className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-hp-key shadow-[0_1px_1px_rgb(0_0_0/0.5)] transition-[left,right] duration-150"
            style={pos === "left" ? { left: "-1px" } : { right: "-1px" }}
          />
        </span>
        <span
          className={cn(
            "font-mono text-[8px] tracking-wide uppercase",
            pos === "right" ? "text-hp-key-fg" : "text-hp-key-fg/75",
          )}
        >
          {spec.right}
        </span>
      </div>
    </button>
  );
}

export function DeckSwitches({
  switches,
  state,
}: {
  switches: SwitchSpec[];
  state: SwitchState;
}) {
  return (
    <div data-slot="deck-switches" className="flex items-center justify-around gap-2 px-2">
      {switches.map((s) => (
        <Slide key={s.caption} spec={s} st={state} />
      ))}
    </div>
  );
}
