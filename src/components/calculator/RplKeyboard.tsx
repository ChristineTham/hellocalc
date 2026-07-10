// src/components/calculator/RplKeyboard.tsx
// HP-48G (RPL) keyboard: 6-wide function rows over a 5-wide number block, with
// left-shift (purple) / right-shift (green) / ALPHA legends and a dynamic stack.
// Drives the RPL engine (rpl.ts). Menu/application keys render but are inert
// until later milestones.
"use client";

import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cn } from "@/lib/utils";
import type { RplKey } from "./models";
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
  prefix: RplPrefix;
  onArm: (p: RplPrefix) => void;
  onPress: (fn: string) => void;
}

export function RplKeyboard({ rows, prefix, onArm, onPress }: RplKeyboardProps) {
  const handle = (k: RplKey) => {
    if (k.kind === "ls") return onArm("ls");
    if (k.kind === "rs") return onArm("rs");
    if (k.kind === "alpha") return onArm("alpha");
    const fn = resolve(k, prefix);
    if (fn) onPress(fn);
  };

  return (
    <div className="flex flex-col gap-1">
      {rows.map((row, ri) => (
        <div key={ri} className="flex gap-1">
          {row.map((k, ki) => (
            <ButtonPrimitive
              key={ki}
              aria-label={k.p || (k.kind === "soft" ? "menu" : "key")}
              onClick={() => handle(k)}
              className={cn(
                "relative flex min-h-10 flex-1 select-none flex-col items-center justify-center rounded-[var(--radius-key)] px-0.5 pt-2 font-legend text-[13px] font-bold leading-none shadow-[0_2px_0_var(--color-hp-key-border)] outline-none transition-transform duration-[50ms] active:translate-y-0.5 focus-visible:brightness-110",
                bgFor(k.kind),
                k.w && k.w > 1 && "flex-[2]",
              )}
            >
              {/* left-shift (purple) / right-shift (green) legends */}
              {(k.ls || k.rs) && (
                <span className="pointer-events-none absolute inset-x-1 top-0.5 flex justify-between text-[7.5px] leading-none font-semibold">
                  <span className="text-hp-shift-ls">{k.ls}</span>
                  <span className="text-hp-shift-rs">{k.rs}</span>
                </span>
              )}
              <span className="z-10">{k.p}</span>
              {k.al && (
                <span className="pointer-events-none absolute right-1 bottom-0.5 text-[7px] leading-none text-hp-key-fg opacity-45">
                  {k.al}
                </span>
              )}
            </ButtonPrimitive>
          ))}
        </div>
      ))}
    </div>
  );
}
