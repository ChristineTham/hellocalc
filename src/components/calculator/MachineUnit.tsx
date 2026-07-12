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
import { HCBadge } from "./HCBadge";
import type { Model } from "./models";
import type { RpnCalculator } from "@/hooks/useRpnCalculator";
import type { RplCalculator } from "@/hooks/useRplCalculator";
import { cn } from "@/lib/utils";

/** Nameplate model number — bare, as the real machines print it ("12C", not
 * "HP-12C"); no third-party marks on the device face (§14 rev 7). */
export function nameplateModel(name: string): string {
  return name.replace(/^HP-?/i, "");
}

export interface MachineUnitProps {
  model: Model;
  rpn: RpnCalculator;
  rpl: RplCalculator;
  /** the Display element (line/mini logic lives inside it) */
  lcd: React.ReactNode;
  /** paper aux (tape + notes) for the side variant's below-LCD bay (§14.3) */
  paper?: React.ReactNode;
}

/** CSSProperties + the per-model shift-palette vars (§14 — RPL siblings).
 * NOTE: the app's `@theme inline` compiles utilities to the RAW --hp-* vars
 * (one level inlined), so per-machine overrides must target --hp-shift-*,
 * not --color-hp-shift-*. */
type MachineStyle = React.CSSProperties &
  Partial<
    Record<
      | "--hp-shift-ls"
      | "--hp-shift-rs"
      | "--hp-shift-ls-fg"
      | "--hp-shift-rs-fg"
      | "--hp-shift-ls-text"
      | "--hp-shift-rs-text",
      string
    >
  >;

/** A sibling KEY var → its AA LEGEND-text var: var(--hp-shift-ls-sx) →
 * var(--hp-shift-ls-sx-text). Keeps the per-model override to one source. */
const textVar = (keyVar: string): string => keyVar.replace(/\)\s*$/, "-text)");

export function MachineUnit({ model, rpn, rpl, lcd, paper }: MachineUnitProps) {
  const badgeName = nameplateModel(model.name);
  // Re-theme every ls/rs surface inside the bezel (keys, legends, gradients)
  // by overriding the colour tokens at the machine root — the 48SX prints
  // orange/blue, the 49G green/red, the 50g white/orange.
  const style: MachineStyle | undefined = model.shift
    ? {
        "--hp-shift-ls": model.shift.ls,
        "--hp-shift-rs": model.shift.rs,
        // the AA legend-text colour tracks the same per-model palette (a11y)
        "--hp-shift-ls-text": textVar(model.shift.ls),
        "--hp-shift-rs-text": textVar(model.shift.rs),
        ...(model.shift.lsFg ? { "--hp-shift-ls-fg": model.shift.lsFg } : {}),
        ...(model.shift.rsFg ? { "--hp-shift-rs-fg": model.shift.rsFg } : {}),
      }
    : undefined;
  return (
    <div
      data-slot="machine"
      data-family={model.family}
      style={style}
      className={cn(
        // machine plane (§13.1): the elevated instrument under warm light
        "machine rounded-[var(--radius-bezel)] border border-hp-bezel-border bg-hp-bezel shadow-[0_18px_36px_-14px_var(--color-shadow-warm)]",
        // Voyager silver trim line (§13.2)
        model.family === "voyager" &&
          "shadow-[inset_0_1px_0_rgb(255_255_255/0.5),inset_0_0_0_1px_rgb(255_255_255/0.22),0_18px_36px_-14px_var(--color-shadow-warm)]",
      )}
    >
      {/* nameplate — authentic to the family (§14 rev 7): maker's mark +
          wordmark left, BARE model number right (the real units print "12C",
          not "HP-12C"); classics centre a single line below the keys; the
          sub-labels (RPN · FINANCIAL…) live in the topbar as badges now. */}
      {model.family === "classic" ? (
        <div
          data-slot="machine-np"
          className="machine-np flex items-center justify-center gap-2"
          style={{ blockSize: "var(--calc-nameplate-h)" }}
        >
          <span className="font-sans text-[11px] font-bold tracking-[0.24em] text-hp-key-fg opacity-70">
            HELLO·CALC
          </span>
          <span className="font-sans text-[11px] font-bold tracking-[0.24em] text-hp-key-fg">
            {badgeName}
          </span>
        </div>
      ) : (
        <div
          data-slot="machine-np"
          className="machine-np flex items-end justify-between"
          style={{ blockSize: "var(--calc-nameplate-h)" }}
        >
          <div className="flex min-w-0 items-center gap-2">
            <HCBadge className="h-5 w-5 shrink-0" />
            <span className="truncate font-sans text-[10px] font-bold tracking-[0.22em] text-hp-key-fg opacity-70">
              HELLO·CALC
            </span>
          </div>
          <span className="font-sans text-xl font-black tracking-tight text-hp-key-fg">
            {badgeName}
          </span>
        </div>
      )}

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
            modelId={model.id}
            prefix={rpn.prefix}
            onArm={rpn.arm}
            onPress={rpn.press}
          />
        )}
        {(model.family === "classic" ||
          model.family === "hp41" ||
          model.family === "pioneer") && (
          <ClassicKeyboard
            rows={model.rows}
            geometry={model.geometry}
            prefix={rpn.prefix}
            // the 42S menu protocol (P16) applies to the pioneer line only
            menuLabels={model.family === "pioneer" ? rpn.state.menu?.labels : undefined}
            onArm={rpn.arm}
            onPress={rpn.press}
            onSoft={model.family === "pioneer" ? rpn.soft : undefined}
          />
        )}
        {model.family === "rpl" && (
          <RplKeyboard
            rows={model.rows}
            geometry={model.geometry}
            prefix={rpl.prefix}
            menuLabels={rpl.state.menu?.labels}
            onArm={rpl.arm}
            onPress={rpl.press}
            onSoft={rpl.soft}
          />
        )}
      </div>
    </div>
  );
}
