// src/components/calculator/RplKeyboard.tsx
// HP-48G (RPL) keyboard: 6-wide function rows over a 5-wide number block, with
// left-shift (purple) / right-shift (green) / ALPHA legends and a dynamic stack.
// Drives the RPL engine (rpl.ts). Menu/application keys render but are inert
// until later milestones.
"use client";

import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cn } from "@/lib/utils";
import type { RplKey } from "./models";
import {
  rowUnitsOf,
  subgridColumns,
  subgridSpan,
  type KeyboardGeometry,
} from "@/lib/layout/keyboardGeometry";
import type { RplPrefix } from "@/hooks/useRplCalculator";

const bgFor = (kind: RplKey["kind"]) => {
  switch (kind) {
    case "enter":
      return "bg-hp-enter text-hp-enter-fg";
    case "arith":
      return "bg-hp-op text-hp-op-fg";
    case "ls":
      return "bg-hp-shift-ls text-white";
    case "rs":
      return "bg-hp-shift-rs text-white";
    case "on":
      return "bg-hp-key text-destructive";
    default:
      return "bg-hp-key text-hp-key-fg";
  }
};

function resolve(k: RplKey, prefix: RplPrefix): string {
  if (prefix === "ls") return k.ls || k.p;
  if (prefix === "rs") return k.rs || k.p;
  if (prefix === "alpha") return ""; // letters aren't dispatched on the numeric stack yet
  if (k.kind === "bksp") return "DROP";
  return k.p;
}

export interface RplKeyboardProps {
  rows: RplKey[][];
  geometry: KeyboardGeometry;
  prefix: RplPrefix;
  onArm: (p: RplPrefix) => void;
  onPress: (fn: string) => void;
}

export function RplKeyboard({ rows, geometry, prefix, onArm, onPress }: RplKeyboardProps) {
  const handle = (k: RplKey) => {
    if (k.kind === "ls") return onArm("ls");
    if (k.kind === "rs") return onArm("rs");
    if (k.kind === "alpha") return onArm("alpha");
    const fn = resolve(k, prefix);
    if (fn) onPress(fn);
  };

  // Dual-pitch grid (§4.4 caveat): the 48G's 5-key digit rows span the SAME
  // width as its 6-key function rows — digit keys are genuinely wider. Model
  // it with an lcm-of-row-widths subcolumn grid (48G: lcm(6,5)=30) so every
  // row fills exactly and key heights stay a uniform 1fr — the fix for the
  // old flex layout that stretched keys ~1.9× too wide.
  const rowUnits = rowUnitsOf(rows);
  const subcols = subgridColumns(rowUnits);

  return (
    <div
      data-slot="keyboard"
      className="grid w-full gap-1"
      style={{
        aspectRatio: String(geometry.aspect),
        gridTemplateColumns: `repeat(${subcols}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${rows.length}, minmax(0, 1fr))`,
      }}
    >
      {rows.map((row, ri) =>
        row.map((k, ki) => {
          const spanCols = subgridSpan(k, rowUnits[ri], subcols);
          return (
            <ButtonPrimitive
              key={`${ri}-${ki}`}
              aria-label={k.p || (k.kind === "soft" ? "menu" : "key")}
              data-kind={k.kind}
              onClick={() => handle(k)}
              style={{ gridColumn: `span ${spanCols} / span ${spanCols}` }}
              className={cn(
                "relative flex select-none flex-col items-center justify-center rounded-[var(--radius-key)] px-0.5 pt-2 font-legend text-key-primary font-bold leading-none shadow-[0_2px_0_var(--color-hp-key-border),0_3px_5px_var(--color-shadow-warm)] outline-none transition-transform duration-[50ms] active:translate-y-0.5 focus-visible:ring-2 focus-visible:ring-terracotta",
                bgFor(k.kind),
              )}
            >
              {/* left-shift (purple) / right-shift (green) legends — armed
                  prefix shifts the plane (§12.3): armed side glows, the other
                  side and the primaries dim */}
              {(k.ls || k.rs) && (
                <span
                  className={cn(
                    // `key-shift` auto-hides at narrow module widths except
                    // while a shift is armed (globals.css @container kbdmod)
                    "key-shift pointer-events-none absolute inset-x-1 top-0.5 flex justify-between text-key-shift leading-none font-semibold",
                    (prefix === "ls" || prefix === "rs") && "key-hot",
                  )}
                >
                  <span
                    className={cn(
                      "text-hp-shift-ls transition-all",
                      prefix === "ls"
                        ? "[text-shadow:0_0_7px_var(--color-hp-shift-ls)]"
                        : prefix !== "none" && "opacity-30",
                    )}
                  >
                    {k.ls}
                  </span>
                  <span
                    className={cn(
                      "text-hp-shift-rs transition-all",
                      prefix === "rs"
                        ? "[text-shadow:0_0_7px_var(--color-hp-shift-rs)]"
                        : prefix !== "none" && "opacity-30",
                    )}
                  >
                    {k.rs}
                  </span>
                </span>
              )}
              <span
                className={cn(
                  "z-10 transition-opacity",
                  prefix !== "none" &&
                    prefix !== "alpha" &&
                    !["ls", "rs", "alpha", "on"].includes(k.kind) &&
                    "opacity-40",
                )}
              >
                {k.p}
              </span>
              {k.al && (
                <span
                  className={cn(
                    "key-shift pointer-events-none absolute right-1 bottom-0.5 text-key-shift leading-none text-hp-key-fg transition-all",
                    prefix === "alpha" ? "key-hot opacity-100 font-bold" : "opacity-45",
                  )}
                >
                  {k.al}
                </span>
              )}
            </ButtonPrimitive>
          );
        }),
      )}
    </div>
  );
}
