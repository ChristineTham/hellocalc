// src/lib/rpl/editorLang.ts
// The RPL language for the code editor: a lightweight StreamLanguage tokenizer
// (commands, numbers, strings, names, comments, program/list/array delimiters),
// a theme-aware HighlightStyle wired to the app's colour tokens, and a
// command-completion source over the whole RPL vocabulary. Imports CodeMirror
// at module scope, so it MUST only be pulled in behind the editor's dynamic
// import (never at app-init) to keep it out of the initial bundle (NFR-3).

import { autocompletion, type CompletionContext, type CompletionResult } from "@codemirror/autocomplete";
import { HighlightStyle, StreamLanguage, syntaxHighlighting } from "@codemirror/language";
import type { Extension } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { tags as t } from "@lezer/highlight";
import { RPL_COMMANDS, RPL_COMMAND_SET } from "./keywords";

const DELIMS = "«»{}[]()'\"@";
const isDelim = (c: string) => DELIMS.includes(c);
const NUM = /^[+-]?(\d+\.?\d*|\.\d+)([Ee][+-]?\d+)?/;
const WORD = /^[^\s«»{}[\]()'"@]+/;

/** Per-token style names, mapped to highlight tags by `tokenTable` below. */
const rplStream = StreamLanguage.define<Record<string, never>>({
  token(stream) {
    if (stream.eatSpace()) return null;
    const c = stream.peek() ?? "";

    if (c === "@") {
      stream.skipToEnd(); // RPL line comment (48/49/50g)
      return "cmt";
    }
    if (c === '"' || c === "'") {
      // "…" strings and '…' names / algebraics
      stream.next();
      let prev = "";
      while (!stream.eol()) {
        const ch = stream.next() ?? "";
        if (ch === c) break;
        prev = ch;
      }
      void prev;
      return c === '"' ? "str" : "name";
    }
    if (isDelim(c)) {
      stream.next();
      return "brk";
    }
    if (c === "#") {
      stream.next();
      stream.eatSpace();
      stream.match(/^[0-9A-Fa-f]+[hodb]?/);
      return "num";
    }
    if (stream.match(NUM)) return "num";

    const m = stream.match(WORD) as RegExpMatchArray | null;
    if (m) return RPL_COMMAND_SET.has(m[0]) ? "cmd" : "name";
    stream.next(); // never stall
    return null;
  },
  tokenTable: {
    cmd: t.keyword,
    name: t.variableName,
    num: t.number,
    str: t.string,
    brk: t.bracket,
    cmt: t.lineComment,
  },
});

/** Colours ride the app's semantic tokens, so the editor flips with the theme. */
const rplHighlight = HighlightStyle.define([
  { tag: t.keyword, color: "var(--color-terracotta)", fontWeight: "600" },
  { tag: t.number, color: "var(--color-salvia)" },
  { tag: t.string, color: "var(--color-hc-pink)" },
  { tag: t.variableName, color: "var(--color-foreground)" },
  { tag: t.bracket, color: "var(--color-muted-foreground)", fontWeight: "600" },
  { tag: t.lineComment, color: "var(--color-muted-foreground)", fontStyle: "italic" },
]);

/** Complete the command word under the cursor from the RPL vocabulary. */
function rplCompletions(ctx: CompletionContext): CompletionResult | null {
  const word = ctx.matchBefore(/[^\s«»{}[\]()'"@]+/);
  if (!word || (word.from === word.to && !ctx.explicit)) return null;
  const prefix = word.text.toUpperCase();
  const options = RPL_COMMANDS.filter((c) => c.toUpperCase().startsWith(prefix)).map(
    (label) => ({ label, type: "keyword" }),
  );
  if (!options.length) return null;
  return { from: word.from, options, validFor: /^[^\s«»{}[\]()'"@]*$/ };
}

/** A neutral, theme-aware editor chrome (transparent — inherits the page). */
const rplTheme = EditorView.theme({
  "&": { backgroundColor: "transparent", fontSize: "13px", height: "100%" },
  ".cm-content": { fontFamily: "var(--font-mono)", caretColor: "var(--color-foreground)" },
  ".cm-scroller": { fontFamily: "var(--font-mono)", lineHeight: "1.6" },
  "&.cm-focused": { outline: "none" },
  ".cm-gutters": {
    backgroundColor: "transparent",
    border: "none",
    color: "color-mix(in oklab, var(--color-muted-foreground) 70%, transparent)",
  },
  ".cm-activeLineGutter": { backgroundColor: "transparent" },
  ".cm-activeLine": {
    backgroundColor: "color-mix(in oklab, var(--color-muted) 45%, transparent)",
  },
  "&.cm-focused .cm-cursor": { borderLeftColor: "var(--color-foreground)" },
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection": {
    backgroundColor: "color-mix(in oklab, var(--color-terracotta) 25%, transparent)",
  },
  ".cm-tooltip": {
    backgroundColor: "var(--color-popover)",
    color: "var(--color-popover-foreground)",
    border: "1px solid var(--color-border)",
    borderRadius: "8px",
  },
  ".cm-tooltip-autocomplete ul li[aria-selected]": {
    backgroundColor: "color-mix(in oklab, var(--color-terracotta) 22%, transparent)",
    color: "var(--color-foreground)",
  },
});

/** The full RPL editing bundle: language + highlight + completion + theme. */
export function rplExtensions(): Extension[] {
  return [
    rplStream,
    syntaxHighlighting(rplHighlight),
    autocompletion({ override: [rplCompletions], activateOnTyping: true }),
    rplTheme,
    EditorView.lineWrapping,
  ];
}
