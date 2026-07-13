// src/components/calculator/PrecisionControl.tsx
// User-selectable working precision for the BigNumber value tower (FR-NUM-1).
// A segmented control that reconfigures math.js at runtime and persists the
// choice to localStorage; restored on mount (browser-only, so no prerender
// mismatch). The display FIX/SCI digit count is separate — this is the
// engine's INTERNAL precision (how many significant digits it computes with).
"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { DEFAULT_PRECISION, setPrecision } from "@/lib/engine/config";

export const PRECISION_KEY = "hellocalc-precision";
const OPTIONS = [12, 24, 40, 64, 100] as const;

function readSaved(): number {
  const raw = Number(localStorage.getItem(PRECISION_KEY));
  return OPTIONS.includes(raw as (typeof OPTIONS)[number]) ? raw : DEFAULT_PRECISION;
}

export function PrecisionControl() {
  const [digits, setDigits] = useState<number>(DEFAULT_PRECISION);

  useEffect(() => {
    const saved = readSaved();
    setPrecision(saved);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-data sync on mount
    setDigits(saved);
  }, []);

  const choose = (n: number) => {
    setDigits(n);
    setPrecision(n);
    localStorage.setItem(PRECISION_KEY, String(n));
  };

  return (
    <div
      role="radiogroup"
      aria-label="Working precision (significant digits)"
      className="inline-flex overflow-hidden rounded-lg border border-border"
    >
      {OPTIONS.map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={digits === n}
          aria-label={`${n} digits`}
          onClick={() => choose(n)}
          className={cn(
            "px-2.5 py-1 font-mono text-[12px] font-semibold transition-colors",
            digits === n
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:bg-muted",
          )}
        >
          {n}
        </button>
      ))}
    </div>
  );
}
