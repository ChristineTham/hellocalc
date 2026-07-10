"use client";

import { useState } from "react";
import { PanelRight } from "lucide-react";
import { CalcShell } from "@/components/calculator/CalcShell";
import { KeyboardFitter } from "@/components/calculator/KeyboardFitter";
import { KeyboardZone } from "@/components/calculator/KeyboardZone";
import { LcdRegion } from "@/components/calculator/LcdRegion";
import { Display, StackPanel } from "@/components/calculator/Display";
import { ModelPicker } from "@/components/calculator/ModelPicker";
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
  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <>
      <CalcShell
        model={model}
        topbar={
          <header className="flex h-full items-center justify-between gap-3 border-b border-border px-4">
            <h1 className="min-w-0 truncate text-xl font-extrabold tracking-tight text-primary">
              Hello Calc
            </h1>
            <div className="flex items-center gap-2">
              {/* below md the aux region is drawer-hosted (§3.2) */}
              <button
                type="button"
                onClick={() => setPanelOpen((o) => !o)}
                aria-label="Toggle history and stack"
                aria-pressed={panelOpen}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted md:hidden"
              >
                <PanelRight className="size-4" />
                Stack
              </button>
              <ModelPicker active={modelId} onSelect={setModelId} />
            </div>
          </header>
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
        aux={
          <StackPanel
            state={active.state}
            family={model.family}
            fmt={active.fmt}
            className="size-full min-w-0 max-w-none"
          />
        }
      />

      {/* below md: history/stack as a drawer (replaced by a bottom Sheet in Step 4) */}
      {panelOpen && (
        <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-label="History and stack">
          <button
            type="button"
            aria-label="Close panel backdrop"
            onClick={() => setPanelOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <div className="absolute inset-y-0 right-0 w-[min(20rem,85vw)] p-3">
            <StackPanel
              state={active.state}
              family={model.family}
              fmt={active.fmt}
              className="h-full"
              onClose={() => setPanelOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
