// src/components/calculator/ClassicKeyboard.tsx
// Classic-era keyboards (HP-35/45/65/25/67): irregular row widths on the lcm
// subcolumn grid, with zero to three shift planes depending on the model —
// none (35, whose `arc` key is a local inverse-trig prefix), gold f (45),
// gold f + blue g (25), f + f⁻¹ + g (65), or f + g + black h (67). Runs on
// the shared 4-level RPN engine (rpn.ts); printed legends are normalized to
// engine ids at dispatch (lib/models/normalize.ts).
"use client";

import { useState } from "react";
import { CalcKey } from "./CalcKey";
import type { ClassicKey } from "./models";
import { INVERSE_OF, normalizeFn } from "@/lib/models/normalize";
import {
  rowUnitsOf,
  subgridColumns,
  subgridSpan,
  type KeyboardGeometry,
} from "@/lib/layout/keyboardGeometry";
import type { Prefix } from "@/hooks/useRpnCalculator";

const toneFor = (k: ClassicKey) => {
  if (k.kind === "pf" || k.kind === "pfi") return "f" as const; // gold prefix keys
  if (k.kind === "pg") return "g" as const; // blue prefix key
  if (k.kind === "ph") return "h" as const; // black prefix key (HP-67)
  if (k.legend.startsWith("ENTER")) return "enter" as const;
  if (k.cat === "beige") return "beige" as const;
  if (k.cat === "blue") return "arith" as const; // operators / mode keys
  return "key" as const; // black math functions
};

const ARC: Record<string, string> = { SIN: "SIN⁻¹", COS: "COS⁻¹", TAN: "TAN⁻¹" };

/** The f-plane word for the armed prefix: f⁻¹ resolves the gold inverse. */
const fWordFor = (k: ClassicKey, prefix: Prefix): string | undefined =>
  prefix === "fi" && k.f ? (INVERSE_OF[k.f] ?? k.f) : k.f;

export interface ClassicKeyboardProps {
  rows: ClassicKey[][];
  geometry: KeyboardGeometry;
  /** armed shift prefix from the RPN hook ("none" for the shiftless HP-35) */
  prefix?: Prefix;
  onArm?: (p: Prefix) => void;
  onPress: (fn: string) => void;
}

export function ClassicKeyboard({
  rows,
  geometry,
  prefix = "none",
  onArm,
  onPress,
}: ClassicKeyboardProps) {
  const [arc, setArc] = useState(false);

  const handle = (k: ClassicKey) => {
    if (k.kind === "pf") return onArm?.("f");
    if (k.kind === "pfi") return onArm?.("fi");
    if (k.kind === "pg") return onArm?.("g");
    if (k.kind === "ph") return onArm?.("h");
    if (k.fn === "arc") {
      setArc((v) => !v);
      return;
    }
    if (arc && ARC[k.fn]) {
      onPress(ARC[k.fn]);
      setArc(false);
      return;
    }
    const printed =
      prefix === "f" || prefix === "fi"
        ? fWordFor(k, prefix) || k.fn
        : prefix === "g"
          ? k.g || k.fn
          : prefix === "h"
            ? k.h || k.fn
            : k.fn;
    onPress(normalizeFn(printed));
    if (arc) setArc(false);
  };

  // Aspect-locked dual-pitch grid (§4.3–4.4): classic 4-key digit rows span
  // the same width as the 5-key function rows — digit keys are genuinely
  // wider on the real devices. lcm(5,4)=20 subcolumns make every row fill
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
          // §12.3 rev 6 promotion. HP-35 arc: while `arc` is armed the trig
          // keys show their inverse via the f slot (the 35 prints no shift
          // legends, so the small plane rows are empty either way). Shifted
          // classics promote the armed plane's word exactly like Voyagers;
          // f⁻¹ (65) promotes the INVERSE of each gold word.
          const arcTarget = arc && ARC[k.fn] ? ARC[k.fn] : undefined;
          const fLegend = arcTarget ?? fWordFor(k, prefix);
          const armed =
            arcTarget || (k.fn === "arc" && arc) || prefix === "f" || prefix === "fi"
              ? ("f" as const)
              : prefix === "g" || prefix === "h"
                ? prefix
                : ("none" as const);
          return (
            <CalcKey
              key={`${ri}-${ki}`}
              aria-label={k.legend || k.fn}
              primary={k.legend}
              tone={toneFor(k)}
              style={{ gridColumn: `span ${spanCols} / span ${spanCols}` }}
              f={fLegend}
              g={k.g}
              h={k.h}
              armed={armed}
              onClick={() => handle(k)}
            />
          );
        }),
      )}
    </div>
  );
}
