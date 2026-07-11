"use client";

import { useState } from "react";
import { CalcShell } from "@/components/calculator/CalcShell";
import { MachineUnit } from "@/components/calculator/MachineUnit";
import { Display } from "@/components/calculator/Display";
import { AuxPanel } from "@/components/calculator/AuxPanel";
import { HistoryTape, StackNote, VarsNote } from "@/components/calculator/PaperAux";
import { Topbar } from "@/components/calculator/Topbar";
import { CalcNav } from "@/components/calculator/CalcNav";
import { CheatSheet } from "@/components/calculator/CheatSheet";
import { MODELS } from "@/components/calculator/models";
import { useRpnCalculator } from "@/hooks/useRpnCalculator";
import { useRplCalculator } from "@/hooks/useRplCalculator";
import { useHotkeys } from "@/hooks/useHotkeys";

export default function Home() {
  const [modelId, setModelId] = useState<string>("HP-12C");
  const model = MODELS[modelId];
  // Voyager + classic share one 4-level RPN engine; RPL (HP-48G) has its own.
  // Both stay mounted so state survives model switches (FR-MODEL retention).
  const rpn = useRpnCalculator();
  const rpl = useRplCalculator();
  const active = model.family === "rpl" ? rpl : rpn;
  const [cheatOpen, setCheatOpen] = useState(false);

  // Physical keyboard is a first-class input (§12.2, FR-UI-2): keystrokes
  // click the matching faceplate key; Escape disarms an armed prefix.
  useHotkeys({
    family: model.family,
    prefix: active.prefix,
    disarm: () =>
      model.family === "rpl"
        ? rpl.prefix !== "none" && rpl.arm(rpl.prefix)
        : rpn.prefix !== "none" && rpn.arm(rpn.prefix),
    openCheatsheet: () => setCheatOpen(true),
  });

  // Paper aux (§14.3) — rendered in the page's aux region AND in the machine's
  // side-variant bay; CSS shows exactly one per template (like the LCD's
  // line/mini dual render).
  const showRegisters = model.id === "HP-12C";
  const aux = (
    <AuxPanel
      state={active.state}
      family={model.family}
      fmt={active.fmt}
      showRegisters={showRegisters}
    />
  );

  return (
    <>
      <CalcShell
        model={model}
        topbar={
          <Topbar
            activeModel={modelId}
            onSelectModel={setModelId}
            tags={model.sub.split("·").map((t) => t.trim())}
            nav={<CalcNav />}
            panels={{
              // RPL glass owns its stack (§14.3 rev 3) — no paper stack panel
              stack:
                model.family !== "rpl" ? (
                  <StackNote state={active.state} family={model.family} fmt={active.fmt} />
                ) : undefined,
              tape: <HistoryTape hist={active.state.hist} />,
              vars:
                showRegisters || model.family === "rpl" ? (
                  <VarsNote state={active.state} family={model.family} />
                ) : undefined,
            }}
          />
        }
        sidebar={
          // persistent desk-panel nav at lg+ (§12.4; --calc-sidebar-w sizes the track)
          <div className="flex size-full flex-col border-r border-border bg-card/50">
            <CalcNav />
          </div>
        }
        machine={
          <MachineUnit
            model={model}
            rpn={rpn}
            rpl={rpl}
            lcd={
              <Display
                state={active.state}
                family={model.family}
                showAngle={model.angle}
                showRegisters={model.id === "HP-12C"}
                renderLatex={active.renderLatex}
                fmt={active.fmt}
              />
            }
            paper={
              <AuxPanel
                state={active.state}
                family={model.family}
                fmt={active.fmt}
                showRegisters={showRegisters}
                variant="bay"
              />
            }
          />
        }
        aux={aux}
      />
      <CheatSheet
        family={model.family}
        modelName={model.name}
        open={cheatOpen}
        onOpenChange={setCheatOpen}
      />
    </>
  );
}
