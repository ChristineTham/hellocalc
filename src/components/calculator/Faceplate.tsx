// src/components/calculator/Faceplate.tsx
// The calculator bezel: brand row + Display + Keyboard, wired to the engines.
// Voyager (HP-12C/HP-15C) and classic (HP-35) run on the shared 4-level RPN
// engine; RPL (HP-48G) runs on the dynamic-stack engine.
"use client";

import { Display } from "./Display";
import { Keyboard } from "./Keyboard";
import { ClassicKeyboard } from "./ClassicKeyboard";
import { RplKeyboard } from "./RplKeyboard";
import type { Model } from "./models";
import type { RpnCalculator } from "@/hooks/useRpnCalculator";
import type { RplCalculator } from "@/hooks/useRplCalculator";

export interface FaceplateProps {
  model: Model;
  rpn: RpnCalculator;
  rpl: RplCalculator;
}

export function Faceplate({ model, rpn, rpl }: FaceplateProps) {
  return (
    <div className="flex w-[34rem] max-w-none flex-col gap-4 rounded-[var(--radius-bezel)] border border-hp-bezel-border bg-hp-bezel p-5 shadow-2xl">
      <div className="flex items-end justify-between">
        <div className="flex flex-col leading-tight">
          <span className="font-sans text-[10px] font-bold tracking-[0.22em] text-hp-key-fg opacity-70">
            HEWLETT·PACKARD
          </span>
          <span className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground">
            {model.sub}
          </span>
        </div>
        <span className="font-sans text-2xl font-black tracking-tight text-hp-key-fg">
          {model.name}
        </span>
      </div>

      {model.family === "voyager" && (
        <>
          <Display
            state={rpn.state}
            family="voyager"
            showAngle={model.angle}
            showRegisters={model.id === "HP-12C"}
            renderLatex={rpn.renderLatex}
            fmt={rpn.fmt}
          />
          <Keyboard
            keys={model.keys}
            geometry={model.geometry}
            prefix={rpn.prefix}
            onArm={rpn.arm}
            onPress={rpn.press}
          />
        </>
      )}

      {model.family === "classic" && (
        <>
          <Display
            state={rpn.state}
            family="classic"
            renderLatex={rpn.renderLatex}
            fmt={rpn.fmt}
          />
          <ClassicKeyboard rows={model.rows} geometry={model.geometry} onPress={rpn.press} />
        </>
      )}

      {model.family === "rpl" && (
        <>
          <Display
            state={rpl.state}
            family="rpl"
            showAngle={model.angle}
            renderLatex={rpl.renderLatex}
            fmt={rpl.fmt}
          />
          <RplKeyboard
            rows={model.rows}
            geometry={model.geometry}
            prefix={rpl.prefix}
            onArm={rpl.arm}
            onPress={rpl.press}
          />
        </>
      )}
    </div>
  );
}
