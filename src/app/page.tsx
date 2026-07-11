"use client";

import { useState } from "react";
import { CalcShell } from "@/components/calculator/CalcShell";
import { KeyboardFitter } from "@/components/calculator/KeyboardFitter";
import { KeyboardZone } from "@/components/calculator/KeyboardZone";
import { LcdRegion } from "@/components/calculator/LcdRegion";
import { Display } from "@/components/calculator/Display";
import { AuxPanel } from "@/components/calculator/AuxPanel";
import { Topbar } from "@/components/calculator/Topbar";
import { CalcNav } from "@/components/calculator/CalcNav";
import { MODELS } from "@/components/calculator/models";
import { useRpnCalculator } from "@/hooks/useRpnCalculator";
import { useRplCalculator } from "@/hooks/useRplCalculator";

export default function Home() {
  const [modelId, setModelId] = useState<string>("HP-12C");
  const model = MODELS[modelId];
  // Voyager + classic share one 4-level RPN engine; RPL (HP-48G) has its own.
  // Both stay mounted so state survives model switches (FR-MODEL retention).
  const rpn = useRpnCalculator();
  const rpl = useRplCalculator();
  const active = model.family === "rpl" ? rpl : rpn;

  const aux = <AuxPanel state={active.state} family={model.family} fmt={active.fmt} />;

  return (
    <CalcShell
      model={model}
      topbar={
        <Topbar
          activeModel={modelId}
          onSelectModel={setModelId}
          nav={<CalcNav />}
          aux={aux}
        />
      }
      sidebar={
        // persistent desk-panel nav at lg+ (§12.4; --calc-sidebar-w sizes the track)
        <div className="flex size-full flex-col border-r border-border bg-card/50">
          <CalcNav />
        </div>
      }
      lcd={
        <LcdRegion>
          <Display
            state={active.state}
            family={model.family}
            showAngle={model.angle}
            showRegisters={model.id === "HP-12C"}
            renderLatex={active.renderLatex}
            fmt={active.fmt}
          />
        </LcdRegion>
      }
      keyboard={
        <KeyboardFitter>
          <KeyboardZone model={model} rpn={rpn} rpl={rpl} />
        </KeyboardFitter>
      }
      aux={aux}
    />
  );
}
