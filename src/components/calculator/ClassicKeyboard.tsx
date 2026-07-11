// src/components/calculator/ClassicKeyboard.tsx
// HP-35 (classic) keyboard: shiftless, irregular row widths, `arc` acts as an
// inverse-trig prefix. Runs on the shared 4-level RPN engine (rpn.ts).
"use client";

import { useState } from "react";
import { CalcKey } from "./CalcKey";
import type { ClassicKey } from "./models";
import {
  rowUnitsOf,
  subgridColumns,
  subgridSpan,
  type KeyboardGeometry,
} from "@/lib/layout/keyboardGeometry";

const toneFor = (cat: ClassicKey["cat"], legend: string) => {
  if (legend.startsWith("ENTER")) return "enter" as const;
  if (cat === "beige") return "beige" as const;
  if (cat === "blue") return "arith" as const; // operators / mode keys
  return "key" as const; // black math functions
};

const ARC: Record<string, string> = { SIN: "SIN⁻¹", COS: "COS⁻¹", TAN: "TAN⁻¹" };

export interface ClassicKeyboardProps {
  rows: ClassicKey[][];
  geometry: KeyboardGeometry;
  onPress: (fn: string) => void;
}

export function ClassicKeyboard({ rows, geometry, onPress }: ClassicKeyboardProps) {
  const [arc, setArc] = useState(false);

  const handle = (k: ClassicKey) => {
    if (k.fn === "arc") {
      setArc((v) => !v);
      return;
    }
    if (arc && ARC[k.fn]) {
      onPress(ARC[k.fn]);
      setArc(false);
      return;
    }
    onPress(k.fn);
    if (arc) setArc(false);
  };

  // Aspect-locked dual-pitch grid (§4.3–4.4): the HP-35's 4-key digit rows
  // span the same width as its 5-key function rows — digit keys are genuinely
  // wider on the real device. lcm(5,4)=20 subcolumns make every row fill
  // exactly (auto-flow stays row-major; a plain 5-col grid would let keys
  // from the next row float up into the shortfall).
  const rowUnits = rowUnitsOf(rows);
  const subcols = subgridColumns(rowUnits);

  return (
    <div
      data-slot="keyboard"
      className="grid w-full gap-1.5"
      style={{
        aspectRatio: String(geometry.aspect),
        gridTemplateColumns: `repeat(${subcols}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${geometry.rows}, minmax(0, 1fr))`,
      }}
    >
      {rows.map((row, ri) =>
        row.map((k, ki) => {
          const spanCols = subgridSpan(k, rowUnits[ri], subcols);
          // §12.3 rev 6 — arc promotion: while `arc` is armed, the trig keys
          // show their inverse (SIN⁻¹…) in the primary slot via CalcKey's
          // f-promotion; the 35 prints no shift legends, so the small plane
          // rows stay empty either way.
          const arcTarget = arc && ARC[k.fn] ? ARC[k.fn] : undefined;
          return (
            <CalcKey
              key={`${ri}-${ki}`}
              aria-label={k.legend}
              primary={k.legend}
              tone={toneFor(k.cat, k.legend)}
              style={{ gridColumn: `span ${spanCols} / span ${spanCols}` }}
              f={arcTarget}
              armed={arcTarget || (k.fn === "arc" && arc) ? "f" : "none"}
              onClick={() => handle(k)}
            />
          );
        }),
      )}
    </div>
  );
}
