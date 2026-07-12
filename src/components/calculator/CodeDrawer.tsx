// src/components/calculator/CodeDrawer.tsx
// The RPL code editor drawer (RPL models only): a topbar button that opens a
// Dialog holding a CodeMirror editor — paste code from elsewhere, syntax
// highlighting, command completion — and runs it into the live stack through
// the same runLine() seam the native entry line uses. A compact stack preview
// shows the result without leaving the editor. The heavy editor is code-split
// behind the lazy CodeEditor, so opening the drawer is what pulls CodeMirror.
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Code2, Copy, Eraser, FileDown, Play } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CodeEditor, type CodeEditorHandle } from "./CodeEditor";
import { objToSrc } from "@/lib/engine/rpl/object";
import type { RplCalculator } from "@/hooks/useRplCalculator";
import { cn } from "@/lib/utils";

const CODE_KEY = "hellocalc-rpl-code";

const BTN =
  "inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 font-mono text-xs font-semibold text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-45";

/** RPL comments (`@ … ` to end of line) aren't part of the engine grammar —
 * strip them before the source reaches the parser. */
const stripComments = (src: string): string => src.replace(/@[^\n]*/g, "");

export function CodeDrawer({ rpl }: { rpl: RplCalculator }) {
  const editorRef = useRef<CodeEditorHandle>(null);
  const [code, setCode] = useState("");
  const [empty, setEmpty] = useState(true);

  // restore the last edited source (paste survives a reload)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(CODE_KEY) ?? "";
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-data sync on mount
    setCode(saved);
     
    setEmpty(saved.trim() === "");
  }, []);

  const onChange = useCallback((value: string) => {
    setEmpty(value.trim() === "");
    if (typeof window !== "undefined") window.localStorage.setItem(CODE_KEY, value);
  }, []);

  const runCode = () => {
    const src = editorRef.current?.getValue() ?? code;
    const clean = stripComments(src).trim();
    if (!clean) return;
    rpl.runLine(clean);
  };

  const clear = () => {
    editorRef.current?.setValue("");
    editorRef.current?.focus();
  };

  const copy = () => {
    const src = editorRef.current?.getValue() ?? code;
    if (src) void navigator.clipboard?.writeText(src);
  };

  const editTop = () => {
    const st = rpl.engine.stack;
    const top = st[st.length - 1];
    if (top) editorRef.current?.setValue(objToSrc(top));
  };

  // live stack preview (top levels, formatted) + any error from the last run
  const rows = rpl.state.rpl ?? [];
  const preview = rows.slice(Math.max(0, rows.length - 4)).reverse();
  const err = rpl.state.err;
  const hasStack = (rpl.engine.stack.length ?? 0) > 0;

  return (
    <Dialog>
      <DialogTrigger
        aria-label="Open code editor"
        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-2 text-muted-foreground transition-colors hover:bg-muted"
      >
        <Code2 className="size-4" />
        <span className="hidden text-[13px] font-semibold sm:inline">Code</span>
      </DialogTrigger>
      <DialogContent className="flex h-[80dvh] max-h-[80dvh] w-[calc(100%-2rem)] flex-col gap-3 sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="font-sans">RPL code editor</DialogTitle>
          <DialogDescription>
            Paste or write RPL, then Run to push the result onto the stack.
            Ctrl/⌘-Space completes commands; <code className="font-mono">@</code>{" "}
            starts a comment.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1">
          <CodeEditor ref={editorRef} initialDoc={code} onChange={onChange} />
        </div>

        {/* live stack preview / error from the last run */}
        <div
          data-slot="code-stack-preview"
          className="max-h-24 shrink-0 overflow-y-auto rounded-md border border-border bg-card/60 p-2 font-mono text-xs"
        >
          {err ? (
            <span className="text-destructive">Error: {err}</span>
          ) : preview.length === 0 ? (
            <span className="text-muted-foreground">— stack empty —</span>
          ) : (
            preview.map((v, i) => (
              <div key={i} className="flex items-baseline justify-between gap-3 py-0.5">
                <span className="text-muted-foreground">{preview.length - i}:</span>
                <span className="truncate text-right text-foreground">{v}</span>
              </div>
            ))
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={runCode} disabled={empty} className={cn(BTN, "border-terracotta/40 bg-terracotta/10 text-terracotta hover:bg-terracotta/20")}>
            <Play className="size-3.5" />
            Run
          </button>
          <button type="button" onClick={clear} disabled={empty} className={BTN}>
            <Eraser className="size-3.5" />
            Clear
          </button>
          <button type="button" onClick={copy} disabled={empty} className={BTN}>
            <Copy className="size-3.5" />
            Copy
          </button>
          <button type="button" onClick={editTop} disabled={!hasStack} className={BTN}>
            <FileDown className="size-3.5" />
            Edit L1
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
