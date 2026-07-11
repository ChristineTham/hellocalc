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
        h: "bg-hp-key text-hp-key-fg ring-1 ring-inset ring-hp-key-border", // black prefix key (HP-67)
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
  /** blue g-shift legend, rendered bottom (left when h is present) */
  g?: string;
  /** black h-shift legend (HP-67 key front), rendered bottom-right */
  h?: string;
  /** which prefix is currently armed — promotes the matching legend */
  armed?: "none" | "f" | "g" | "h";
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
  h,
  armed = "none",
  col,
  row,
  rowSpan = 1,
  style,
  ...props
}: CalcKeyProps) {
  const fHot = armed === "f" && !!f;
  const gHot = armed === "g" && !!g;
  const hHot = armed === "h" && !!h;
  const hot = fHot || gHot || hHot;
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
        calcKeyVariants({ tone, active: hot }),
        hot && (fHot ? "ring-hp-shift-f" : gHot ? "ring-hp-shift-g" : "ring-hp-key-fg"),
        className,
      )}
      style={gridStyle}
      {...props}
    >
      {/* §12.3 rev 6 — PROMOTION: while a prefix is armed, the shifted
          function takes the PRIMARY slot (big, in its shift colour), so every
          key literally shows what it will do. The promoted plane's small row
          empties (its word moved down); the other planes dim. Keys without a
          function for the armed prefix keep their dimmed primary — that is
          what they still execute. */}
      {/* row 1 — gold f plane */}
      <span
        className={cn(
          "key-shift pointer-events-none row-start-1 text-center text-key-shift text-hp-shift-f transition-all",
          armed !== "none" && armed !== "f" ? "opacity-25" : "opacity-90",
        )}
      >
        {fHot ? null : f}
      </span>
      {/* row 2 — primary legend (or the promoted shifted function) */}
      <span
        className={cn(
          "row-start-2 self-center text-center transition-opacity",
          hot
            ? cn(
                "text-key-promoted font-bold tracking-tight whitespace-nowrap",
                fHot ? "text-hp-shift-f" : gHot ? "text-hp-shift-g" : "text-hp-key-fg",
              )
            : cn(
                "text-key-primary",
                armed !== "none" && tone !== "f" && tone !== "g" && tone !== "h" && "opacity-40",
              ),
        )}
      >
        {fHot ? f : gHot ? g : hHot ? h : primary}
      </span>
      {/* row 3 — blue g plane (left) + black h plane (right, HP-67 key front) */}
      <span className="pointer-events-none row-start-3 flex items-baseline justify-center gap-1.5">
        <span
          className={cn(
            "key-shift text-center text-key-shift text-hp-shift-g transition-all",
            armed !== "none" && armed !== "g" ? "opacity-25" : "opacity-90",
          )}
        >
          {gHot ? null : g}
        </span>
        {h && (
          <span
            className={cn(
              "key-shift text-center text-key-shift text-hp-key-fg transition-all",
              armed !== "none" && armed !== "h" ? "opacity-25" : "opacity-70",
            )}
          >
            {hHot ? null : h}
          </span>
        )}
      </span>
    </ButtonPrimitive>
  );
}
