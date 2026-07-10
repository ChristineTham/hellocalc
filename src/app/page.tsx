"use client";

import { useState } from "react";
import { PanelRight } from "lucide-react";
import { Faceplate } from "@/components/calculator/Faceplate";
import { StackPanel } from "@/components/calculator/Display";
import { AutoScale } from "@/components/calculator/AutoScale";
import { ModelPicker } from "@/components/calculator/ModelPicker";
import { MODELS } from "@/components/calculator/models";
import { useRpnCalculator } from "@/hooks/useRpnCalculator";
import { useRplCalculator } from "@/hooks/useRplCalculator";

export default function Home() {
  const [modelId, setModelId] = useState<string>("HP-12C");
  const model = MODELS[modelId];
  // Voyager + classic share one 4-level RPN engine; RPL (HP-48G) has its own.
  const rpn = useRpnCalculator();
  const rpl = useRplCalculator();
  const active = model.family === "rpl" ? rpl : rpn;
  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-background text-foreground">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="min-w-0">
          <h1 className="text-xl font-extrabold tracking-tight text-primary">Hello Calc</h1>
          <p className="hidden text-xs text-muted-foreground sm:block">
            HP calculator emulator · shared math engine
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPanelOpen((o) => !o)}
            aria-label="Toggle history and stack"
            aria-pressed={panelOpen}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted lg:hidden"
          >
            <PanelRight className="size-4" />
            Stack
          </button>
          <ModelPicker active={modelId} onSelect={setModelId} />
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-3 p-3 lg:flex-row">
        {/* faceplate scales (uniformly — aspect ratio preserved) to fill the
            available area. The AutoScale box is absolutely positioned so the flex
            parent shrinks freely (an in-flow wide child would trigger flexbox
            min-content and refuse to shrink, defeating the scale). */}
        <div className="relative min-h-0 min-w-0 flex-1">
          <AutoScale className="absolute inset-0" maxScale={3}>
            <Faceplate model={model} rpn={rpn} rpl={rpl} />
          </AutoScale>
        </div>

        {/* large screens: history/stack rail beside the faceplate. On small
            screens it's a drawer (below). */}
        <StackPanel
          state={active.state}
          family={model.family}
          fmt={active.fmt}
          className="hidden lg:flex lg:flex-1 lg:max-w-xl"
        />
      </div>

      {/* mobile: history/stack as a slide-over drawer */}
      {panelOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-label="History and stack">
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
    </main>
  );
}
