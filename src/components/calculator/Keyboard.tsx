// src/components/calculator/Keyboard.tsx
// Renders a Voyager (HP-12C / HP-15C) key grid from the model data and dispatches
// prefix-resolved function ids to the engine. The key data itself is generated
// from hp/mapping/mapping.json (see models.generated.ts).
"use client";

import { CalcKey } from "./CalcKey";
import type { VoyagerKey } from "./models";
import type { Prefix } from "@/hooks/useRpnCalculator";

const toneFor = (kind: VoyagerKey["kind"]) => {
  switch (kind) {
    case "arith":
      return "arith" as const;
    case "enter":
      return "enter" as const;
    case "pf":
      return "f" as const;
    case "pg":
      return "g" as const;
    case "on":
      return "on" as const;
    default:
      return "key" as const;
  }
};

export interface KeyboardProps {
  keys: VoyagerKey[];
  prefix: Prefix;
  onArm: (p: Prefix) => void;
  onPress: (fn: string) => void;
}

export function Keyboard({ keys, prefix, onArm, onPress }: KeyboardProps) {
  const handle = (k: VoyagerKey) => {
    if (k.kind === "pf") return onArm("f");
    if (k.kind === "pg") return onArm("g");
    const fn =
      prefix === "f" ? k.f || k.primary : prefix === "g" ? k.g || k.primary : k.primary;
    onPress(fn);
  };

  return (
    <div
      className="grid gap-1.5"
      style={{
        gridTemplateColumns: "repeat(10, minmax(0, 1fr))",
        gridTemplateRows: "repeat(4, minmax(2.75rem, 1fr))",
      }}
    >
      {keys.map((k) => (
        <CalcKey
          key={`${k.col}-${k.row}`}
          aria-label={k.primary || "key"}
          primary={k.primary}
          f={k.f || undefined}
          g={k.g || undefined}
          col={k.col}
          row={k.row}
          rowSpan={k.rowSpan}
          armed={prefix}
          tone={toneFor(k.kind)}
          onClick={() => handle(k)}
        />
      ))}
    </div>
  );
}
