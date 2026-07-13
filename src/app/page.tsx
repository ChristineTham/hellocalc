"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CalcShell } from "@/components/calculator/CalcShell";
import { MachineUnit } from "@/components/calculator/MachineUnit";
import { Printer } from "@/components/calculator/Printer";
import { Display } from "@/components/calculator/Display";
import { PrimeScreen } from "@/components/calculator/PrimeScreen";
import { AuxPanel } from "@/components/calculator/AuxPanel";
import { HistoryTape, StackNote, VarsNote } from "@/components/calculator/PaperAux";
import { Topbar } from "@/components/calculator/Topbar";
import { SidebarNav } from "@/components/calculator/SidebarNav";
import { CheatSheet } from "@/components/calculator/CheatSheet";
import { MODELS, annunSet } from "@/components/calculator/models";
import { NativeSurface } from "@/components/calculator/NativeSurface";
import { CodeDrawer } from "@/components/calculator/CodeDrawer";
import { useRpnCalculator } from "@/hooks/useRpnCalculator";
import { useRplCalculator } from "@/hooks/useRplCalculator";
import { useHotkeys } from "@/hooks/useHotkeys";
import { parseState, restore, snapshot } from "@/lib/engine/persistence";
import { createRpn } from "@/lib/engine/rpn";
import { createRpl } from "@/lib/engine/rpl";
import {
  downloadStateFile,
  loadWorkspace,
  localStorageAdapter,
  readStateFile,
  saveWorkspace,
} from "@/lib/storage";

export default function Home() {
  // default to the HP-35s — the most modern RPN scientific that keeps the
  // classic keyboard-and-LCD look
  const [modelId, setModelId] = useState<string>("HP-35s");
  const isNative = modelId === "native";
  // native mode (P23) borrows the 48G's layout class for the shell templates;
  // the machine region renders the NativeSurface instead of a faceplate
  const model = MODELS[isNative ? "HP-48G" : modelId];
  // segment-display families (LED classics / Voyager LCD / HP-41) render a
  // single-line display like the real hardware
  const isSegment =
    model.family === "classic" || model.family === "voyager" || model.family === "hp41";
  // Voyager + classic share one 4-level RPN engine; RPL (HP-48G) has its own.
  // Both stay mounted so state survives model switches (FR-MODEL retention).
  const rpn = useRpnCalculator();
  const rpl = useRplCalculator();
  const active = isNative || model.family === "rpl" ? rpl : rpn;
  const [cheatOpen, setCheatOpen] = useState(false);

  // The menu-driven business machines (17B/17BII) wake into the MAIN menu, like
  // the real hardware — their six top-row keys are softkeys over FIN/BUS/SUM/
  // TIME/SOLVE. Clear first so a menu left by another Pioneer model doesn't stack.
  useEffect(() => {
    if (["HP-17B", "HP-17BII", "HP-18C", "HP-19B", "HP-19BII"].includes(modelId)) {
      rpn.press("Esc");
      rpn.press("MAIN");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- rpn.press is stable; wake only on model change
  }, [modelId]);
  // Faceplate slide-switch view state (classics/HP-97). Power lights/darkens the
  // LCD; Trace gates the HP-97 printer echo. The Mode switch drives the engine's
  // PRGM/RUN directly (no view state needed). Both default to their "on" rest.
  const [powered, setPowered] = useState(true);
  const [trace, setTrace] = useState(true);
  const hasPower = Boolean(model.switches?.some((sw) => sw.kind === "power"));
  const hasTrace = Boolean(model.switches?.some((sw) => sw.kind === "trace"));

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
      if (engines.activeModel in MODELS || engines.activeModel === "native") {
        // mount-only client-data sync: localStorage is unreadable during the
        // static prerender, so restoring here (post-hydration) is the pattern —
        // a one-shot set, not an effect-driven state loop
        // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot restore of the saved model on mount
        setModelId(engines.activeModel);
      }
    }
    hydrated.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- rpn/rpl.restore are stable useCallbacks; this restore runs once on mount
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
        if (engines.activeModel in MODELS || engines.activeModel === "native") setModelId(engines.activeModel);
      });
    },
    [rpn, rpl],
  );

  const onReset = useCallback(() => {
    localStorageAdapter.clear();
    rpn.restore(createRpn());
    rpl.restore(createRpl());
  }, [rpn, rpl]);

  // Named workspaces (FR-STATE-3): the whole session saved under a name, then
  // loaded back — same snapshot/restore codec as file export/import.
  const onSaveWorkspace = useCallback(
    (name: string) => {
      saveWorkspace(name, JSON.stringify(snapshot(rpn.engine, rpl.engine, modelId)));
    },
    [rpn.engine, rpl.engine, modelId],
  );
  const onLoadWorkspace = useCallback(
    (name: string) => {
      const json = loadWorkspace(name);
      const state = json ? parseState(json) : null;
      if (!state) return;
      const engines = restore(state);
      rpn.restore(engines.rpn);
      rpl.restore(engines.rpl);
      if (engines.activeModel in MODELS || engines.activeModel === "native")
        setModelId(engines.activeModel);
    },
    [rpn, rpl],
  );

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
  const showProgram = [
    "HP-65", "HP-25", "HP-67", "HP-97", "HP-41C-CV", "HP-41CX", "HP-12C", "HP-11C", "HP-15C", "HP-16C",
  ].includes(model.id);
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
            tags={(isNative ? "NATIVE · FULL ENGINE" : model.sub).split("·").map((t) => t.trim())}
            // the RPN⇄ALG-capable models offer an entry-mode toggle (FR-STK-4):
            // the modern scientific/graphing (35s/Prime), and the financials that
            // shipped both modes (12C, 12C Platinum, 17BII, 19BII)
            entryMode={
              !isNative &&
              ["HP-35s", "HP-Prime", "HP-12C", "HP-12C-Platinum", "HP-17BII", "HP-19BII"].includes(
                model.id,
              )
                ? { alg: Boolean(rpn.state.alg), onToggle: () => rpn.press("ALG") }
                : undefined
            }
            nav={
              <SidebarNav
                activeModel={modelId}
                onSelectModel={setModelId}
                onExport={onExport}
                onImportFile={onImportFile}
                onReset={onReset}
                onSaveWorkspace={onSaveWorkspace}
                onLoadWorkspace={onLoadWorkspace}
              />
            }
            panels={{
              // RPL glass owns its stack (§14.3 rev 3) — no paper stack panel
              stack:
                model.family !== "rpl" ? (
                  <StackNote state={active.state} family={model.family} fmt={active.fmt} />
                ) : undefined,
              // the tape doubles as the program editor in PRGM mode (P3): a
              // programmable model passes its prgm state + press() dispatch
              tape: (
                <HistoryTape
                  hist={active.state.hist}
                  prgm={showProgram ? active.state.prgm : undefined}
                  onKey={active.press}
                  onRecall={active.recall}
                />
              ),
              vars: (
                <VarsNote state={active.state} family={model.family} tvm={showRegisters} />
              ),
            }}
            // RPL machines get a paste-and-run code editor (syntax highlight +
            // command completion); the RPN faceplates don't take source text
            tools={active === rpl ? <CodeDrawer rpl={rpl} /> : undefined}
          />
        }
        sidebar={
          // persistent desk-panel nav at lg+ (§12.4; --calc-sidebar-w sizes the track)
          <div className="flex size-full flex-col border-r border-border bg-card">
            <SidebarNav
              activeModel={modelId}
              onSelectModel={setModelId}
              onExport={onExport}
              onImportFile={onImportFile}
              onReset={onReset}
              onSaveWorkspace={onSaveWorkspace}
              onLoadWorkspace={onLoadWorkspace}
            />
          </div>
        }
        machine={
          isNative ? (
            <NativeSurface rpl={rpl} />
          ) : (
          <MachineUnit
            model={model}
            rpn={rpn}
            rpl={rpl}
            powered={powered}
            onTogglePower={() => setPowered((p) => !p)}
            trace={trace}
            onToggleTrace={() => setTrace((t) => !t)}
            lcd={
              // the HP Prime is a COLOUR touchscreen — rendered natively (real
              // fonts + KaTeX math), not the pixel/dot-matrix LCD
              model.id === "HP-Prime" ? (
                <PrimeScreen
                  state={active.state}
                  fmt={active.fmt}
                  renderLatex={active.renderLatex}
                />
              ) : (
                <Display
                  state={active.state}
                  family={model.family}
                  annun={annunSet(model)}
                  showAngle={model.angle}
                  showRegisters={model.id === "HP-12C"}
                  // segment-display machines (classic LED / Voyager LCD / HP-41)
                  // are single-LINE like the real hardware: pin the line state and
                  // drop the stack echo (the 4-level stack lives in the aux panel).
                  // The chevron still lets the user expand to the multi-line view.
                  // Pioneer dot-matrix machines (42S/35s) also drop the in-glass
                  // echo in line mode so the hero number fills the glass without
                  // overflowing a keyboard-cramped LCD slot (the stack still lives
                  // in the aux panel; mini mode keeps the full multi-line stack).
                  showStack={isSegment || model.family === "pioneer" ? false : undefined}
                  // pioneers are 2-line-era displays — pin the short line state;
                  // RPL machines ARE their multi-line stack glass — pin mini
                  defaultMode={
                    isSegment || model.family === "pioneer"
                      ? "line"
                      : model.family === "rpl"
                        ? "mini"
                        : undefined
                  }
                  lcdAspect={model.lcdAspect}
                  renderLatex={active.renderLatex}
                  fmt={active.fmt}
                  // only models with a Power switch (classics) can be darkened
                  powered={hasPower ? powered : true}
                />
              )
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
            // the HP-97 desktop printer shares the top deck with the display;
            // the Trace switch gates the live echo (Man = no auto-print)
            printer={
              model.printer ? (
                <Printer hist={hasTrace && !trace ? [] : active.state.hist} />
              ) : undefined
            }
          />
          )
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
