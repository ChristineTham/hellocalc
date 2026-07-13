// src/components/calculator/NativeSurface.tsx
// Native mode (P23, FR-NATIVE-1..4): the keyboard-first surface over the
// FULL engine — no faceplate. A typed entry line (algebraic/RPL words, with
// command autocomplete) drives the shared RPL engine; the P12 glass shows
// stack + KaTeX + menus + plots; a slim strip covers stack work; the
// expression library (FR-EXP-4) and the notebook (FR-UI-4) persist locally.
"use client";

import { useEffect, useRef, useState } from "react";
import { Display } from "./Display";
import type { RplCalculator } from "@/hooks/useRplCalculator";
import { CATALOG_COMMANDS } from "@/lib/engine/rpl/menu";
import { evalNotebook, type BlockResult } from "@/lib/engine/notebook";
import { cn } from "@/lib/utils";

const LIB_KEY = "hellocalc-library";
const NB_KEY = "hellocalc-notebook";

interface LibEntry {
  name: string;
  src: string;
}

const loadJson = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};
const saveJson = (key: string, value: unknown): void => {
  if (typeof window !== "undefined") window.localStorage.setItem(key, JSON.stringify(value));
};

const STRIP = ["ENTER", "SWAP", "OVER", "DROP", "LAST", "CLEAR"] as const;

const BTN =
  "rounded-md border border-border bg-card px-2.5 py-1.5 font-mono text-xs font-semibold text-foreground transition-colors hover:bg-muted";

export function NativeSurface({ rpl }: { rpl: RplCalculator }) {
  const [line, setLine] = useState("");
  const [lib, setLib] = useState<LibEntry[]>([]);
  const [saveName, setSaveName] = useState("");
  const [blocks, setBlocks] = useState<string[]>([""]);
  const [results, setResults] = useState<BlockResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // localStorage is browser-only — hydrate after mount (same pattern as the
  // page-level persistence restore)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-data sync on mount
    setLib(loadJson<LibEntry[]>(LIB_KEY, []));
     
    setBlocks(loadJson<string[]>(NB_KEY, [""]));
  }, []);

  const run = (e: React.FormEvent) => {
    e.preventDefault();
    if (!line.trim()) return;
    rpl.runLine(line.trim());
    setLine("");
    inputRef.current?.focus();
  };

  const saveToLib = () => {
    if (!line.trim() || !saveName.trim()) return;
    const next = [...lib.filter((l) => l.name !== saveName.trim()), { name: saveName.trim(), src: line.trim() }];
    setLib(next);
    saveJson(LIB_KEY, next);
    setSaveName("");
  };

  const setBlock = (i: number, src: string) => {
    const next = blocks.map((b, j) => (j === i ? src : b));
    setBlocks(next);
    saveJson(NB_KEY, next);
  };

  return (
    <div
      data-slot="native-surface"
      className="flex w-full flex-col gap-3 rounded-[var(--radius-bezel)] border border-hp-bezel-border bg-hp-bezel p-3 shadow-[0_18px_36px_-14px_var(--color-shadow-warm)]"
    >
      {/* the engine glass: stack + KaTeX + menus + plots (P12/P14/P17) */}
      <Display
        state={rpl.state}
        family="rpl"
        annun={{ f: true, g: true, h: false, alpha: true, begEnd: false }}
        showAngle
        renderLatex={rpl.renderLatex}
        fmt={rpl.fmt}
      />

      {/* the typed entry line (FR-NATIVE-1) with command autocomplete */}
      <form onSubmit={run} className="flex gap-2">
        <input
          ref={inputRef}
          value={line}
          onChange={(e) => setLine(e.target.value)}
          list="native-commands"
          placeholder="Type an expression or RPL words — e.g.  2 3 +   or  'X^2' 'X' d/dx"
          aria-label="Native entry line"
          className="min-w-0 flex-1 rounded-md border border-border bg-background px-3 py-2 font-mono text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
        />
        <button type="submit" className={BTN} aria-label="Evaluate line">
          EVAL
        </button>
      </form>
      <datalist id="native-commands">
        {CATALOG_COMMANDS.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>

      {/* the slim RPN strip (FR-NATIVE-3) */}
      <div className="flex flex-wrap gap-1.5">
        {STRIP.map((k) => (
          <button key={k} type="button" className={BTN} onClick={() => rpl.press(k)}>
            {k}
          </button>
        ))}
      </div>

      {/* expression library (FR-EXP-4): save/name/recall */}
      <section data-slot="native-library" className="rounded-md border border-border bg-card/60 p-2">
        <div className="mb-1.5 flex items-center gap-2">
          <h2 className="font-mono text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            Library
          </h2>
          <input
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            placeholder="name…"
            aria-label="Library entry name"
            className="w-28 rounded border border-border bg-background px-2 py-0.5 font-mono text-xs"
          />
          <button type="button" className={BTN} onClick={saveToLib} aria-label="Save line to library">
            Save line
          </button>
        </div>
        {lib.length === 0 ? (
          <p className="text-xs text-muted-foreground">Nothing saved yet — name the current line and Save.</p>
        ) : (
          <ul className="flex flex-wrap gap-1.5">
            {lib.map((l) => (
              <li key={l.name} className="flex items-center gap-1">
                <button
                  type="button"
                  className={BTN}
                  title={l.src}
                  aria-label={`Insert ${l.name}`}
                  onClick={() => setLine((cur) => (cur ? `${cur} ${l.src}` : l.src))}
                >
                  {l.name}
                </button>
                <button
                  type="button"
                  aria-label={`Delete ${l.name}`}
                  className="text-xs text-muted-foreground hover:text-destructive"
                  onClick={() => {
                    const next = lib.filter((x) => x.name !== l.name);
                    setLib(next);
                    saveJson(LIB_KEY, next);
                  }}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* notebook (FR-UI-4): ordered blocks, shared scope, run-all */}
      <section data-slot="native-notebook" className="rounded-md border border-border bg-card/60 p-2">
        <div className="mb-1.5 flex items-center gap-2">
          <h2 className="font-mono text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            Notebook
          </h2>
          <button
            type="button"
            className={BTN}
            aria-label="Run all blocks"
            onClick={() => setResults(evalNotebook(blocks))}
          >
            Run all
          </button>
          <button
            type="button"
            className={BTN}
            aria-label="Add block"
            onClick={() => {
              const next = [...blocks, ""];
              setBlocks(next);
              saveJson(NB_KEY, next);
            }}
          >
            + Block
          </button>
        </div>
        <ol className="flex flex-col gap-1.5">
          {blocks.map((b, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="pt-1.5 font-mono text-[10px] text-muted-foreground">{i + 1}</span>
              <input
                value={b}
                onChange={(e) => setBlock(i, e.target.value)}
                aria-label={`Notebook block ${i + 1}`}
                className="min-w-0 flex-1 rounded border border-border bg-background px-2 py-1 font-mono text-xs"
              />
              <span
                className={cn(
                  "min-w-16 pt-1.5 text-right font-mono text-xs",
                  results[i]?.ok === false ? "text-destructive" : "text-foreground",
                )}
              >
                {results[i]?.text ?? ""}
              </span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
