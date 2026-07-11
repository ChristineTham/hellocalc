// src/components/calculator/CalcKey.tsx
// A single faceplate key, wired to the --hp-* design tokens from globals.css.
// Mirrors ui/button.tsx conventions: Base UI Button primitive + cva + cn().
// The Tailwind colour utilities here (bg-hp-key, text-hp-shift-f, …) resolve to
// the @theme --color-hp-* entries in globals.css.
"use client";

import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/** Base face styling by key role. Legends are layered as absolute children. */
// No min-height floor: key height comes from the keyboard's aspect-locked
// equal-1fr row tracks (docs/responsive-layout.md §4.3) — a floor would fight
// the uniform pitch when the block scales down. The key face is a 3-row grid
// (f-shift / primary / g-shift) so the legend planes can NEVER overlap, at any
// pitch — absolute overlays collided at phone key heights (§13.5).
export const calcKeyVariants = cva(
  "relative grid select-none grid-rows-[auto_1fr_auto] rounded-[var(--radius-key)] px-0.5 py-0.5 font-legend font-bold leading-none shadow-[0_2px_0_var(--color-hp-key-border),0_3px_5px_var(--color-shadow-warm)] transition-transform duration-[50ms] outline-none active:translate-y-0.5 focus-visible:ring-2 focus-visible:ring-terracotta",
  {
    variants: {
      tone: {
        key: "bg-hp-key text-hp-key-fg",
        arith: "bg-hp-op text-hp-op-fg",
        enter: "bg-hp-enter text-hp-enter-fg",
        f: "bg-hp-shift-f text-hp-shift-f-fg", // gold prefix key
        g: "bg-hp-shift-g text-white", // blue prefix key
        ls: "bg-hp-shift-ls text-white", // RPL left-shift (purple)
        rs: "bg-hp-shift-rs text-white", // RPL right-shift (green)
        on: "bg-hp-key text-destructive",
        beige: "bg-hp-op text-hp-key-fg", // HP-35 digit keys
      },
      active: { true: "ring-2", false: "" },
    },
    defaultVariants: { tone: "key", active: false },
  },
);

export interface CalcKeyProps
  extends ButtonPrimitive.Props,
    VariantProps<typeof calcKeyVariants> {
  /** primary legend (white, centered) */
  primary: string;
  /** gold f-shift legend, rendered top-center */
  f?: string;
  /** blue g-shift legend, rendered bottom-center */
  g?: string;
  /** which prefix is currently armed — lifts + glows the matching legend */
  armed?: "none" | "f" | "g";
  /** grid placement for Voyager 4x10 layouts */
  col?: number;
  row?: number;
  rowSpan?: number;
}

export function CalcKey({
  className,
  tone,
  primary,
  f,
  g,
  armed = "none",
  col,
  row,
  rowSpan = 1,
  style,
  ...props
}: CalcKeyProps) {
  const fHot = armed === "f" && !!f;
  const gHot = armed === "g" && !!g;
  const gridStyle =
    col != null && row != null
      ? {
          gridColumn: String(col),
          gridRow: rowSpan > 1 ? `${row} / span ${rowSpan}` : String(row),
          ...style,
        }
      : style;

  return (
    <ButtonPrimitive
      data-slot="calc-key"
      className={cn(
        calcKeyVariants({ tone, active: fHot || gHot }),
        (fHot || gHot) && (fHot ? "ring-hp-shift-f" : "ring-hp-shift-g"),
        className,
      )}
      style={gridStyle}
      {...props}
    >
      {/* row 1 — gold f plane. `key-shift` auto-hides at narrow module widths
          (globals.css @container kbdmod) except when armed (`key-hot`).
          Arming a prefix shifts the whole plane (§12.3): the armed legends go
          full, everything else dims — one glance answers "what will this key
          do right now". */}
      <span
        className={cn(
          "key-shift pointer-events-none row-start-1 text-center text-key-shift text-hp-shift-f transition-all",
          fHot
            ? "key-hot [text-shadow:0_0_7px_var(--color-hp-shift-f)]"
            : armed === "g"
              ? "opacity-25"
              : "opacity-90",
        )}
      >
        {f}
      </span>
      {/* row 2 — primary legend, optically centred in the remaining face */}
      <span
        className={cn(
          "row-start-2 self-center text-center text-key-primary transition-opacity",
          armed !== "none" && tone !== "f" && tone !== "g" && "opacity-40",
        )}
      >
        {tone === "f" ? "f" : tone === "g" ? "g" : primary}
      </span>
      {/* row 3 — blue g plane */}
      <span
        className={cn(
          "key-shift pointer-events-none row-start-3 text-center text-key-shift text-hp-shift-g transition-all",
          gHot
            ? "key-hot [text-shadow:0_0_7px_var(--color-hp-shift-g)]"
            : armed === "f"
              ? "opacity-25"
              : "opacity-90",
        )}
      >
        {g}
      </span>
    </ButtonPrimitive>
  );
}
