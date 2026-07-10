// src/components/calculator/ClassicKeyboard.tsx
// HP-35 (classic) keyboard: shiftless, irregular row widths, `arc` acts as an
// inverse-trig prefix. Runs on the shared 4-level RPN engine (rpn.ts).
"use client";

import { useState } from "react";
import { CalcKey } from "./CalcKey";
import type { ClassicKey } from "./models";

const toneFor = (cat: ClassicKey["cat"], legend: string) => {
  if (legend.startsWith("ENTER")) return "enter" as const;
  if (cat === "beige") return "beige" as const;
  if (cat === "blue") return "arith" as const; // operators / mode keys
  return "key" as const; // black math functions
};

const ARC: Record<string, string> = { SIN: "SIN⁻¹", COS: "COS⁻¹", TAN: "TAN⁻¹" };

export interface ClassicKeyboardProps {
  rows: ClassicKey[][];
  onPress: (fn: string) => void;
}

export function ClassicKeyboard({ rows, onPress }: ClassicKeyboardProps) {
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

  return (
    <div className="flex flex-col gap-1.5">
      {rows.map((row, ri) => (
        <div key={ri} className="flex gap-1.5">
          {row.map((k, ki) => (
            <CalcKey
              key={ki}
              aria-label={k.legend}
              primary={k.legend}
              tone={toneFor(k.cat, k.legend)}
              className={cnFlex(k.flex)}
              armed={k.fn === "arc" && arc ? "f" : "none"}
              onClick={() => handle(k)}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

const cnFlex = (flex?: number) => (flex && flex > 1 ? "flex-[2]" : "flex-1");
