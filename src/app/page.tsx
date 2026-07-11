"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CalcShell } from "@/components/calculator/CalcShell";
import { MachineUnit } from "@/components/calculator/MachineUnit";
import { Display } from "@/components/calculator/Display";
import { AuxPanel } from "@/components/calculator/AuxPanel";
import { HistoryTape, ProgramNote, StackNote, VarsNote } from "@/components/calculator/PaperAux";
import { Topbar } from "@/components/calculator/Topbar";
import { CalcNav } from "@/components/calculator/CalcNav";
import { CheatSheet } from "@/components/calculator/CheatSheet";
import { MODELS } from "@/components/calculator/models";
import { useRpnCalculator } from "@/hooks/useRpnCalculator";
import { useRplCalculator } from "@/hooks/useRplCalculator";
import { useHotkeys } from "@/hooks/useHotkeys";
import { parseState, restore, snapshot } from "@/lib/engine/persistence";
import { createRpn } from "@/lib/engine/rpn";
import { createRpl } from "@/lib/engine/rpl";
import { downloadStateFile, localStorageAdapter, readStateFile } from "@/lib/storage";

export default function Home() {
  const [modelId, setModelId] = useState<string>("HP-12C");
  const model = MODELS[modelId];
  // Voyager + classic share one 4-level RPN engine; RPL (HP-48G) has its own.
  // Both stay mounted so state survives model switches (FR-MODEL retention).
  const rpn = useRpnCalculator();
  const rpl = useRplCalculator();
  const active = model.family === "rpl" ? rpl : rpn;
  const [cheatOpen, setCheatOpen] = useState(false);

  // ── Persistence (FR-STATE-1/4, architecture §9) ─────────────────────────
  // Restore AFTER mount (not in the state initializer): the static export
  // prerenders fresh-state HTML, so reading localStorage during the first
  // render would be a hydration mismatch.
  const hydrated = useRef(false);
  useEffect(() => {
    const saved = localStorageAdapter.load();
    const state = saved ? parseState(saved) : null;
    if (state) {
      const engines = restore(state);
      rpn.restore(engines.rpn);
      rpl.restore(engines.rpl);
      if (engines.activeModel in MODELS) {
        // mount-only client-data sync: localStorage is unreadable during the
        // static prerender, so restoring here (post-hydration) is the pattern —
        // a one-shot set, not an effect-driven state loop
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setModelId(engines.activeModel);
      }
    }
    hydrated.current = true;
    // rpn.restore / rpl.restore are stable useCallbacks; run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Autosave the session on every engine/model change (cheap: ~1 KB JSON).
  // Skipped until the initial restore has run, so a fresh mount can't
  // overwrite a saved session with empty state.
  useEffect(() => {
    if (!hydrated.current) return;
    localStorageAdapter.save(JSON.stringify(snapshot(rpn.engine, rpl.engine, modelId)));
  }, [rpn.engine, rpl.engine, modelId]);

  const onExport = useCallback(() => {
    downloadStateFile(JSON.stringify(snapshot(rpn.engine, rpl.engine, modelId), null, 2));
  }, [rpn.engine, rpl.engine, modelId]);

  const onImportFile = useCallback(
    (file: File) => {
      void readStateFile(file).then((json) => {
        const state = parseState(json);
        if (!state) {
          // graceful degrade (FR-STATE-4): a corrupt/foreign file changes nothing
          window.alert("Not a valid Hello Calc state file.");
          return;
        }
        const engines = restore(state);
        rpn.restore(engines.rpn);
        rpl.restore(engines.rpl);
        if (engines.activeModel in MODELS) setModelId(engines.activeModel);
      });
    },
    [rpn, rpl],
  );

  const onReset = useCallback(() => {
    localStorageAdapter.clear();
    rpn.restore(createRpn());
    rpl.restore(createRpl());
  }, [rpn, rpl]);

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
  // keystroke-programmable models grow the program note (P3: the 65; later
  // phases add their models as the subsystem reaches them)
  const showProgram = ["HP-65", "HP-25", "HP-67", "HP-97"].includes(model.id);
  const aux = (
    <AuxPanel
      state={active.state}
      family={model.family}
      fmt={active.fmt}
      showRegisters={showRegisters}
      showProgram={showProgram}
      onKey={active.press}
      onRecall={active.recall}
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
            nav={<CalcNav onExport={onExport} onImportFile={onImportFile} onReset={onReset} />}
            panels={{
              // RPL glass owns its stack (§14.3 rev 3) — no paper stack panel
              stack:
                model.family !== "rpl" ? (
                  <StackNote state={active.state} family={model.family} fmt={active.fmt} />
                ) : undefined,
              tape: <HistoryTape hist={active.state.hist} onRecall={active.recall} />,
              vars: (
                <VarsNote state={active.state} family={model.family} tvm={showRegisters} />
              ),
              prgm: showProgram ? (
                <ProgramNote state={active.state} onKey={active.press} />
              ) : undefined,
            }}
          />
        }
        sidebar={
          // persistent desk-panel nav at lg+ (§12.4; --calc-sidebar-w sizes the track)
          <div className="flex size-full flex-col border-r border-border bg-card/50">
            <CalcNav onExport={onExport} onImportFile={onImportFile} onReset={onReset} />
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
                lcdAspect={model.lcdAspect}
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
                onRecall={active.recall}
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
