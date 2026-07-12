// src/components/calculator/CodeEditor.tsx
// A CodeMirror 6 editor for RPL source, wired for the code drawer (paste,
// syntax highlighting, command completion, undo). CodeMirror and the RPL
// language are DYNAMICALLY imported inside the mount effect, so the editor
// bundle is code-split out of the initial load (NFR-3, same pattern as the
// plot/CAS tiers). The view is uncontrolled — edits flow out through
// onChange; the imperative handle lets the drawer read/replace the doc.
"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import type { EditorView } from "@codemirror/view";

export interface CodeEditorHandle {
  getValue: () => string;
  setValue: (doc: string) => void;
  focus: () => void;
}

export const CodeEditor = forwardRef<
  CodeEditorHandle,
  { initialDoc?: string; onChange?: (value: string) => void }
>(function CodeEditor({ initialDoc = "", onChange }, ref) {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const docRef = useRef(initialDoc); // value even before CM finishes loading
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useImperativeHandle(ref, () => ({
    getValue: () => viewRef.current?.state.doc.toString() ?? docRef.current,
    setValue: (doc: string) => {
      docRef.current = doc;
      const view = viewRef.current;
      if (view) {
        view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: doc } });
      }
      onChangeRef.current?.(doc);
    },
    focus: () => viewRef.current?.focus(),
  }));

  useEffect(() => {
    let disposed = false;
    void Promise.all([import("codemirror"), import("@codemirror/view")]).then(
      async ([{ basicSetup, EditorView }, view]) => {
        const { rplExtensions } = await import("@/lib/rpl/editorLang");
        const host = hostRef.current;
        if (disposed || !host) return;
        const editor = new EditorView({
          doc: docRef.current,
          parent: host,
          extensions: [
            basicSetup,
            ...rplExtensions(),
            view.EditorView.updateListener.of((u) => {
              if (u.docChanged) {
                docRef.current = u.state.doc.toString();
                onChangeRef.current?.(docRef.current);
              }
            }),
          ],
        });
        viewRef.current = editor;
        editor.focus();
      },
    );
    return () => {
      disposed = true;
      viewRef.current?.destroy();
      viewRef.current = null;
    };
     
  }, []);

  return (
    <div
      ref={hostRef}
      data-slot="code-editor"
      className="h-full overflow-auto rounded-md border border-border bg-background/60"
    />
  );
});
