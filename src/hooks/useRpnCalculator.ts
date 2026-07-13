// src/hooks/useRpnCalculator.ts
// React seam over the pure RPN engine (src/lib/engine/rpn.ts, BigNumber
// tower). Holds the engine (which now carries its own history + display
// format) and exposes what the faceplate needs: a display state, a key
// dispatcher, history recall, snapshot/restore for persistence, and the
// format.ts-backed formatter.
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import katex from "katex";
import {
  createRpn,
  dispatch,
  menu42Labels,
  pressSoft42,
  pushX,
  stepProgram,
  xval,
  type RpnEngine,
} from "@/lib/engine/rpn";
import { formatValue } from "@/lib/engine/format";
import { intFormat } from "@/lib/engine/integer";
import { bn, type Value } from "@/lib/engine/config";
import { solverVariables } from "@/lib/engine/business";
import { FIN_APPS } from "@/lib/engine/finapps";
import { LIST_APPS } from "@/lib/engine/listapps";
import type { RpnState } from "@/components/calculator/Display";

// f/g are the Voyager planes; h (HP-67 black) and fi (HP-65 f⁻¹ gold inverse)
// arrive with the classic programmables; alpha with the HP-41 (letters are
// promoted visually but inert until alpha entry lands). The engine never sees
// a prefix — keyboards resolve (key, prefix) → one function id before press().
export type Prefix = "none" | "f" | "g" | "h" | "fi" | "alpha";

export interface RpnCalculator {
  state: RpnState;
  prefix: Prefix;
  /** Dispatch a resolved function id (already prefix-resolved) to the engine. */
  press: (fn: string) => void;
  /** 42S softkey (P16): top-row key i resolves the active menu label. */
  soft: (i: number) => void;
  /** Toggle the armed f/g prefix. */
  arm: (p: Prefix) => void;
  /** Recall an exact history value into X (lifts the stack). */
  recall: (raw: string) => void;
  fmt: (v: Value, dec?: number) => string;
  renderLatex: (tex: string) => { __html: string };
  /** A keystroke program is running under the cooperative scheduler. */
  running: boolean;
  /** Halt a running program (R/S / any key also halts it). */
  stop: () => void;
  /** Persistence seam (FR-STATE-1/4). */
  engine: RpnEngine;
  restore: (engine: RpnEngine) => void;
}

// Cooperative program scheduler (FR-PRG-3 / NFR-9): a running program advances
// in bounded chunks on the main thread, yielding to the event loop between them
// so the UI keeps painting and input (a stopping R/S) is handled — no Web
// Worker, so the rich value tower never crosses a serialization boundary. A
// short program (≤ one chunk) still finishes synchronously inside the press.
const RUN_CHUNK = 500;
const RUN_HARD_CAP = 20_000_000; // auto-halt a truly runaway loop

/** Clone before mutating so the setState updater stays pure under StrictMode
 * (values are immutable BigNumbers; hist is replaced, never pushed in place). */
const clone = (e: RpnEngine): RpnEngine => ({
  ...e,
  disp: { ...e.disp },
  regs: [...e.regs],
  regsS: [...e.regsS],
  userAsn: { ...e.userAsn },
  fin: { ...e.fin, cfs: e.fin.cfs.map((c) => ({ ...c })) },
  imag: { ...e.imag },
  mats: { ...e.mats },
  int: { ...e.int },
  sum: { ...e.sum },
  prgm: { ...e.prgm, steps: [...e.prgm.steps], flags: [...e.prgm.flags], ret: [...e.prgm.ret] },
  pending: e.pending ? { ...e.pending } : null,
  menu: e.menu ? { ...e.menu } : null,
  menuStack: [...e.menuStack],
  custom42: [...e.custom42],
  pts: e.pts.map((pt) => [...pt] as [number, number]),
});

export function useRpnCalculator(): RpnCalculator {
  const [engine, setEngine] = useState<RpnEngine>(() => createRpn());
  const [prefix, setPrefix] = useState<Prefix>("none");

  const fmt = useCallback(
    (v: Value, d?: number) =>
      engine.int.on
        ? intFormat(v, engine.int) // the 16C's base display (P10)
        : formatValue(v, { mode: engine.disp.mode, digits: d ?? engine.disp.digits }),
    [engine.disp, engine.int],
  );

  // ── Cooperative program scheduler ────────────────────────────────────────
  // engineRef mirrors the latest engine so the empty-dep press() can read
  // prgm state without going stale; both refs are synced in effects (never
  // during render). StrictMode may double-invoke the updater, but each call
  // clones a fresh `prev` and advances by the same chunk, so stepping stays
  // idempotent.
  const engineRef = useRef(engine);
  useEffect(() => {
    engineRef.current = engine;
  });
  const runningRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const opsRef = useRef(0);
  const tickRef = useRef<(first: boolean) => void>(() => {});
  const [running, setRunning] = useState(false);

  const stop = useCallback(() => {
    runningRef.current = false;
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setRunning(false);
  }, []);

  const runTick = useCallback(
    (first: boolean) => {
      let more = false;
      setEngine((prev) => {
        const next = clone(prev);
        more = stepProgram(next, RUN_CHUNK, first);
        return next;
      });
      opsRef.current += RUN_CHUNK;
      if (more && runningRef.current && opsRef.current < RUN_HARD_CAP) {
        timerRef.current = setTimeout(() => tickRef.current(false), 0);
      } else {
        if (more) {
          // ran off the hard cap — a runaway loop; surface the error
          setEngine((prev) => {
            const next = clone(prev);
            next.error = "Error";
            next.prgm.pc = 0;
            return next;
          });
        }
        stop();
      }
    },
    [stop],
  );
  useEffect(() => {
    tickRef.current = runTick;
  }, [runTick]);

  const startRun = useCallback(() => {
    runningRef.current = true;
    opsRef.current = 0;
    setRunning(true);
    runTick(true); // first chunk runs now — short programs finish here
  }, [runTick]);

  // clear a pending tick if the component unmounts mid-run
  useEffect(() => stop, [stop]);

  const press = useCallback(
    (fn: string) => {
      // While a program runs, ANY key halts it (R/S is the canonical stop) and
      // the key is swallowed — the calc's run/stop model, and it also prevents
      // a stray press from racing the scheduler's setEngine.
      if (runningRef.current) {
        stop();
        return;
      }
      if (fn === "R/S") {
        const e = engineRef.current;
        if (!e.error && e.prgm.mode === "RUN" && e.prgm.steps.length > 0) {
          startRun();
          return;
        }
      }
      setEngine((prev) => {
        const next = clone(prev);
        dispatch(next, fn);
        return next;
      });
      // ALPHA is a latched MODE on the 41/Prime (unlike one-shot f/g): it stays
      // armed while α characters are typed and drops on any other dispatch
      setPrefix((p) => (p === "alpha" && fn.startsWith("α") ? p : "none"));
    },
    [startRun, stop],
  );

  const soft = useCallback(
    (i: number) => {
      if (runningRef.current) {
        stop();
        return;
      }
      setEngine((prev) => {
        const next = clone(prev);
        pressSoft42(next, i);
        return next;
      });
      setPrefix("none");
    },
    [stop],
  );

  const recall = useCallback(
    (raw: string) => {
      if (runningRef.current) {
        stop();
        return;
      }
      setEngine((prev) => {
        const next = clone(prev);
        pushX(next, bn(raw));
        return next;
      });
    },
    [stop],
  );

  const arm = useCallback((p: Prefix) => {
    setPrefix((cur) => (cur === p ? "none" : p));
  }, []);

  const restore = useCallback(
    (next: RpnEngine) => {
      stop();
      setEngine(next);
      setPrefix("none");
    },
    [stop],
  );

  const state = useMemo<RpnState>(() => {
    // registers note (§14 rev 5): M + the nonzero R0–R9 + Σn, formatted
    const registers: { name: string; value: string }[] = [];
    if (!engine.mem.isZero()) registers.push({ name: "M", value: fmt(engine.mem) });
    engine.regs.forEach((r, i) => {
      if (!r.isZero()) registers.push({ name: `R${i}`, value: fmt(r) });
    });
    if (!engine.iReg.isZero()) registers.push({ name: "I", value: fmt(engine.iReg) });
    for (const [name, m] of Object.entries(engine.mats)) {
      registers.push({ name: `MAT ${name}`, value: `${m.length}×${m[0]?.length ?? 0}` });
    }
    if (!engine.sum.n.isZero()) registers.push({ name: "Σn", value: fmt(engine.sum.n, 0) });
    return {
      T: engine.t,
      Z: engine.z,
      Y: engine.y,
      X: xval(engine),
      lastX: engine.lastX,
      entry: engine.entry,
      dec: engine.disp.digits,
      ang: engine.angle,
      prefix,
      latex: fmt(xval(engine)),
      err: engine.error ?? undefined,
      alpha: engine.alpha,
      intBase: engine.int.on
        ? { 16: "HEX", 10: "DEC", 8: "OCT", 2: "BIN" }[engine.int.base]
        : undefined,
      imX: engine.cpx && !engine.imag.x.isZero() ? fmt(engine.imag.x) : undefined,
      beg: engine.fin.beg,
      reg: {
        n: fmt(engine.fin.n),
        i: fmt(engine.fin.i),
        PV: fmt(engine.fin.pv),
        PMT: fmt(engine.fin.pmt),
        FV: fmt(engine.fin.fv),
      },
      registers,
      // the equation SOLVER (17B family / 27S / 35s): the active equation and
      // its variables + stored values — the "variable menu" panel
      solver: engine.solver
        ? {
            eq: engine.solver.eq,
            vars: (solverVariables(engine.solver.eq) ?? []).map((name) => ({
              name,
              value:
                engine.solver!.vars[name] !== undefined
                  ? fmt(bn(engine.solver!.vars[name]))
                  : "—",
            })),
          }
        : undefined,
      eqEntry: engine.eqEntry ? engine.alpha : undefined,
      // the active list app (CFLO cash flows / SUM statistics) + its items
      list: engine.list
        ? {
            title: LIST_APPS[engine.list.name]?.title ?? engine.list.name,
            items: engine.list.items.map((v) => fmt(bn(v))),
          }
        : undefined,
      // the active menu-driven financial app (ICNV/BOND/DEPRC/BS) + its stored
      // variables — the app's variable panel (like TVM, but per app)
      app: engine.app
        ? {
            title: FIN_APPS[engine.app.name]?.title ?? engine.app.name,
            vars: (FIN_APPS[engine.app.name]?.vars ?? []).map((name) => ({
              name,
              value:
                engine.app!.vars[name] !== undefined ? fmt(bn(engine.app!.vars[name])) : "—",
            })),
          }
        : undefined,
      prgm: {
        mode: engine.prgm.mode,
        pc: engine.prgm.pc,
        steps: [...engine.prgm.steps],
      },
      // the 42S menu row (P16): labels ride the top key row + the glass
      menu: engine.menu
        ? {
            name: engine.menu.name,
            // "@" marks a nested menu internally; the glass shows the bare name
            labels: menu42Labels(engine).map((l) => l.replace(/^@/, "")),
            page: engine.menu.page,
            pages: 1,
          }
        : undefined,
      hist: engine.hist.map((h) => ({ op: h.op, v: fmt(bn(h.raw)), raw: h.raw })),
      running,
      alg: engine.alg,
    };
  }, [engine, prefix, fmt, running]);

  // Math output is always typeset (AGENTS §3): KaTeX renders synchronously at
  // first render — no post-mount flash. katex.min.css is imported in layout.tsx.
  const renderLatex = useCallback(
    (tex: string) => ({ __html: katex.renderToString(tex, { throwOnError: false }) }),
    [],
  );

  return {
    state,
    prefix,
    press,
    soft,
    arm,
    recall,
    fmt,
    renderLatex,
    running,
    stop,
    engine,
    restore,
  };
}
