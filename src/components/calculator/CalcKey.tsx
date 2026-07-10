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
export const calcKeyVariants = cva(
  "relative flex min-h-11 select-none items-center justify-center rounded-[var(--radius-key)] font-legend font-bold leading-none shadow-[0_2px_0_var(--color-hp-key-border),0_3px_5px_rgb(0_0_0/0.35)] transition-transform duration-[50ms] outline-none active:translate-y-0.5 focus-visible:brightness-110",
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
        f && "pt-2.5",
        g && "pb-2",
        className,
      )}
      style={gridStyle}
      {...props}
    >
      {f && (
        <span
          className={cn(
            "pointer-events-none absolute inset-x-0 top-1 text-center text-[8.5px] font-bold leading-none text-hp-shift-f transition-all",
            fHot
              ? "-translate-y-px [text-shadow:0_0_7px_var(--color-hp-shift-f)]"
              : "opacity-90",
          )}
        >
          {f}
        </span>
      )}
      <span className="z-10 text-[15px] leading-none">
        {tone === "f" ? "f" : tone === "g" ? "g" : primary}
      </span>
      {g && (
        <span
          className={cn(
            "pointer-events-none absolute inset-x-0 bottom-0.5 text-center text-[8.5px] font-bold leading-none text-hp-shift-g transition-all",
            gHot
              ? "translate-y-px [text-shadow:0_0_7px_var(--color-hp-shift-g)]"
              : "opacity-90",
          )}
        >
          {g}
        </span>
      )}
    </ButtonPrimitive>
  );
}
