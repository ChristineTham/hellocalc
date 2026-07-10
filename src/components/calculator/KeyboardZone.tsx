// src/components/calculator/KeyboardZone.tsx
// The machine module (docs/responsive-layout.md §3.1, §13.1): bezel + nameplate
// strip + the family keyboard, wired to the active engine hooks. Absorbs the
// retired Faceplate minus the Display — the LCD is its own region now.
// Chrome heights here must match --calc-nameplate-h / --calc-bezel-pad, which
// the fitter subtracts so nameplate + A-ratio grid always fit the slot.
"use client";

import { Keyboard } from "./Keyboard";
import { ClassicKeyboard } from "./ClassicKeyboard";
import { RplKeyboard } from "./RplKeyboard";
import type { Model } from "./models";
import type { RpnCalculator } from "@/hooks/useRpnCalculator";
import type { RplCalculator } from "@/hooks/useRplCalculator";

export interface KeyboardZoneProps {
  model: Model;
  rpn: RpnCalculator;
  rpl: RplCalculator;
}

export function KeyboardZone({ model, rpn, rpl }: KeyboardZoneProps) {
  return (
    <div
      className="flex flex-col rounded-[var(--radius-bezel)] border border-hp-bezel-border bg-hp-bezel shadow-2xl"
      style={{ padding: "var(--calc-bezel-pad)" }}
    >
      {/* nameplate — the machine's badge (§13.5) */}
      <div
        className="flex items-end justify-between pb-2"
        style={{ blockSize: "var(--calc-nameplate-h)" }}
      >
        <div className="flex min-w-0 flex-col leading-tight">
          <span className="font-sans text-[10px] font-bold tracking-[0.22em] text-hp-key-fg opacity-70">
            HEWLETT·PACKARD
          </span>
          <span className="truncate font-mono text-[10px] tracking-[0.14em] text-muted-foreground">
            {model.sub}
          </span>
        </div>
        <span className="font-sans text-xl font-black tracking-tight text-hp-key-fg">
          {model.name}
        </span>
      </div>

      {model.family === "voyager" && (
        <Keyboard
          keys={model.keys}
          geometry={model.geometry}
          prefix={rpn.prefix}
          onArm={rpn.arm}
          onPress={rpn.press}
        />
      )}
      {model.family === "classic" && (
        <ClassicKeyboard rows={model.rows} geometry={model.geometry} onPress={rpn.press} />
      )}
      {model.family === "rpl" && (
        <RplKeyboard
          rows={model.rows}
          geometry={model.geometry}
          prefix={rpl.prefix}
          onArm={rpl.arm}
          onPress={rpl.press}
        />
      )}
    </div>
  );
}
