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
      // fg is a token so per-model palettes stay legible (the 50g's white
      // left-shift key carries dark ink)
      return "bg-hp-shift-ls text-hp-shift-ls-fg";
    case "rs":
      return "bg-hp-shift-rs text-hp-shift-rs-fg";
    case "on":
      return "bg-hp-key text-destructive";
    default:
      return "bg-hp-key text-hp-key-fg";
  }
};

function resolve(k: RplKey, prefix: RplPrefix): string {
  if (prefix === "ls") return k.ls || k.p;
  if (prefix === "rs") return k.rs || k.p;
  // the α plane types the key's letter (P17): α-ids append to the command line
  if (prefix === "alpha") return k.al ? `α${k.al}` : "";
  if (k.kind === "bksp") return "DROP";
  return k.p;
}

export interface RplKeyboardProps {
  rows: RplKey[][];
  geometry: KeyboardGeometry;
  prefix: RplPrefix;
  /** active softkey MENU labels (P12) — shown on and dispatched by the
   * blank soft keys, in order */
  menuLabels?: string[];
  onArm: (p: RplPrefix) => void;
  onPress: (fn: string) => void;
  /** softkey press by index (P12) — resolved against the engine's menu */
  onSoft?: (i: number) => void;
}

export function RplKeyboard({
  rows,
  geometry,
  prefix,
  menuLabels,
  onArm,
  onPress,
  onSoft,
}: RplKeyboardProps) {
  // soft keys number 0..n in row-major order (the 28C's 6 under the glass)
  let softSeq = 0;
  const softIndex = new Map<RplKey, number>();
  for (const row of rows)
    for (const k of row) if (k.kind === "soft") softIndex.set(k, softSeq++);

  const handle = (k: RplKey) => {
    if (k.kind === "ls") return onArm("ls");
    if (k.kind === "rs") return onArm("rs");
    if (k.kind === "alpha") return onArm("alpha");
    if (k.kind === "soft") {
      // shifted soft keys keep their editing functions (INS/DEL/cursor)
      const shifted = prefix === "ls" ? k.ls : prefix === "rs" ? k.rs : "";
      if (shifted) return onPress(shifted);
      return onSoft?.(softIndex.get(k) ?? 0);
    }
    const fn = resolve(k, prefix);
    if (fn) onPress(fn);
  };

  // §12.3 rev 6 — promotion: while a shift (or alpha) is armed, the shifted
  // function / alpha letter takes the key's PRIMARY slot in its colour.
  const promotedOf = (k: RplKey): string =>
    prefix === "ls" ? k.ls : prefix === "rs" ? k.rs : prefix === "alpha" ? k.al : "";

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
          // bare-plate spacer (49G/50g cursor-diamond corners): consumes its
          // grid slots but renders no key
          if (k.kind === "gap") {
            return (
              <div
                key={`${ri}-${ki}`}
                aria-hidden
                style={{ gridColumn: `span ${spanCols} / span ${spanCols}` }}
              />
            );
          }
          const promoted = promotedOf(k);
          return (
            <ButtonPrimitive
              key={`${ri}-${ki}`}
              aria-label={
                k.p ||
                (k.kind === "soft"
                  ? `menu ${(softIndex.get(k) ?? 0) + 1}${
                      menuLabels?.[softIndex.get(k) ?? 0]
                        ? `: ${menuLabels[softIndex.get(k) ?? 0]}`
                        : ""
                    }`
                  : "key")
              }
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
                  side and the primaries dim. When both shifts share one word
                  (CST → MODES/MODES) it prints ONCE, spanning both colours —
                  as on the real 48G. */}
              {k.ls && k.ls === k.rs && !promoted ? (
                <span className="key-shift-row-center pointer-events-none absolute inset-x-1 top-0.5 text-key-shift leading-none font-semibold">
                  <span
                    className={cn(
                      "bg-gradient-to-r from-hp-shift-ls to-hp-shift-rs bg-clip-text text-transparent transition-opacity",
                      prefix === "alpha" && "opacity-30",
                    )}
                  >
                    {k.ls}
                  </span>
                </span>
              ) : (k.ls || k.rs) && (
                <span className="key-shift-row pointer-events-none absolute inset-x-1 top-0.5 text-key-shift leading-none font-semibold">
                  {/* the armed side's word is PROMOTED to the primary slot —
                      its small copy empties; the other side dims */}
                  <span
                    className={cn(
                      "text-hp-shift-ls transition-all",
                      prefix !== "none" && "opacity-30",
                    )}
                  >
                    {prefix === "ls" ? null : k.ls}
                  </span>
                  <span
                    className={cn(
                      "text-hp-shift-rs transition-all",
                      prefix !== "none" && "opacity-30",
                    )}
                  >
                    {prefix === "rs" ? null : k.rs}
                  </span>
                </span>
              )}
              <span
                className={cn(
                  "z-10 transition-opacity",
                  promoted
                    ? cn(
                        "text-key-promoted font-bold tracking-tight whitespace-nowrap",
                        prefix === "ls"
                          ? "text-hp-shift-ls"
                          : prefix === "rs"
                            ? "text-hp-shift-rs"
                            : "text-hp-key-fg",
                      )
                    : prefix !== "none" &&
                        !["ls", "rs", "alpha", "on"].includes(k.kind) &&
                        "opacity-40",
                  k.kind === "soft" && !promoted && "text-[0.85em] tracking-tight",
                )}
              >
                {promoted ||
                  (k.kind === "soft" && menuLabels
                    ? menuLabels[softIndex.get(k) ?? 0] || k.p
                    : k.p)}
              </span>
              {k.al && (
                <span className="key-shift pointer-events-none absolute right-1 bottom-0.5 text-key-shift leading-none text-hp-key-fg opacity-45 transition-all">
                  {prefix === "alpha" ? null : k.al}
                </span>
              )}
            </ButtonPrimitive>
          );
        }),
      )}
    </div>
  );
}
