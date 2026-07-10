"use client";

import { useState } from "react";
import { Faceplate } from "@/components/calculator/Faceplate";
import { StackPanel } from "@/components/calculator/Display";
import { ModelSwitcher } from "@/components/calculator/ModelSwitcher";
import { MODELS, MODEL_ORDER } from "@/components/calculator/models";
import { useRpnCalculator } from "@/hooks/useRpnCalculator";
import { useRplCalculator } from "@/hooks/useRplCalculator";

export default function Home() {
  const [modelId, setModelId] = useState<string>("HP-12C");
  const model = MODELS[modelId];
  // Voyager + classic share one 4-level RPN engine (state survives switching
  // between them); RPL (HP-48G) has its own dynamic-stack engine.
  const rpn = useRpnCalculator();
  const rpl = useRplCalculator();
  const active = model.family === "rpl" ? rpl : rpn;

  return (
    <main className="flex min-h-screen flex-col items-center gap-6 bg-background p-4 text-foreground sm:p-8">
      <header className="flex w-full max-w-5xl flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-primary">
            Hello Calc
          </h1>
          <p className="text-sm text-muted-foreground">
            HP calculator emulator · shared math engine
          </p>
        </div>
        <ModelSwitcher active={modelId} ids={MODEL_ORDER} onSelect={setModelId} />
      </header>

      <div className="flex w-full max-w-5xl flex-col items-start justify-center gap-6 lg:flex-row">
        <Faceplate model={model} rpn={rpn} rpl={rpl} />
        <StackPanel state={active.state} family={model.family} fmt={active.fmt} />
      </div>

      <footer className="text-center text-xs text-muted-foreground">
        Powered by fixed 4-level RPN and dynamic RPL stack engines
      </footer>
    </main>
  );
}
