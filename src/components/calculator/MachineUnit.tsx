// src/components/calculator/MachineUnit.tsx
// The integrated machine (docs/responsive-layout.md §14.1): ONE bezel holding
// nameplate + LCD + keyboard — the calculator anatomy — with four internal
// grid areas (np / lcd / aux / kbd) that pure CSS reflows between the
// `stack` variant (nameplate → LCD → keys, the default) and the `side`
// variant (nameplate+LCD left, keys right, paper aux tucked below the LCD)
// on short viewports. Same DOM, no JS branching. Replaces the split
// KeyboardZone + LcdRegion pair that broke the calculator illusion.
"use client";

import { Keyboard } from "./Keyboard";
import { ClassicKeyboard } from "./ClassicKeyboard";
import { RplKeyboard } from "./RplKeyboard";
import type { Model } from "./models";
import type { RpnCalculator } from "@/hooks/useRpnCalculator";
import type { RplCalculator } from "@/hooks/useRplCalculator";
import { cn } from "@/lib/utils";

export interface MachineUnitProps {
  model: Model;
  rpn: RpnCalculator;
  rpl: RplCalculator;
  /** the Display element (line/mini logic lives inside it) */
  lcd: React.ReactNode;
  /** paper aux (tape + notes) for the side variant's below-LCD bay (§14.3) */
  paper?: React.ReactNode;
}

export function MachineUnit({ model, rpn, rpl, lcd, paper }: MachineUnitProps) {
  return (
    <div
      data-slot="machine"
      className={cn(
        // machine plane (§13.1): the elevated instrument under warm light
        "machine rounded-[var(--radius-bezel)] border border-hp-bezel-border bg-hp-bezel shadow-[0_18px_36px_-14px_var(--color-shadow-warm)]",
        // Voyager silver trim line (§13.2)
        model.family === "voyager" &&
          "shadow-[inset_0_1px_0_rgb(255_255_255/0.5),inset_0_0_0_1px_rgb(255_255_255/0.22),0_18px_36px_-14px_var(--color-shadow-warm)]",
      )}
    >
      {/* nameplate — the machine's badge (§13.5) */}
      <div
        data-slot="machine-np"
        className="machine-np flex items-end justify-between"
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

      {/* the glass, inside the machine (line ↔ mini via @container/lcd) */}
      <div data-slot="machine-lcd" className="machine-lcd">
        {lcd}
      </div>

      {/* paper bay — visible only in the side variant (§14.3) */}
      <div data-slot="machine-aux" className="machine-aux">
        {paper}
      </div>

      {/* the keyboard, aspect-locked (§4) */}
      <div data-slot="machine-kbd" className="machine-kbd">
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
    </div>
  );
}
