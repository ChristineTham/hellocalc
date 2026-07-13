// src/components/calculator/WorkspacesPanel.tsx
// Named workspaces (FR-STATE-3): save the whole session under a name, list the
// saved ones, load or delete them. The storage seam (localStorage under
// hellocalc-ws:) shipped in P15; this is its UI. Save/Load snapshot + restore
// the engines through the page (which owns the hooks); the list + delete live
// here since they only touch storage.
"use client";

import { useCallback, useEffect, useState } from "react";
import { FolderDown, Save, Trash2 } from "lucide-react";
import { deleteWorkspace, listWorkspaces } from "@/lib/storage";
import { cn } from "@/lib/utils";

export interface WorkspacesPanelProps {
  /** save the current session under `name` */
  onSave: (name: string) => void;
  /** restore a saved session by `name` (parses + restores the engines) */
  onLoad: (name: string) => void;
}

export function WorkspacesPanel({ onSave, onLoad }: WorkspacesPanelProps) {
  const [name, setName] = useState("");
  const [names, setNames] = useState<string[]>([]);

  // populate after mount (localStorage is browser-only)
  const refresh = useCallback(() => setNames(listWorkspaces()), []);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-data sync on mount
    setNames(listWorkspaces());
  }, []);

  const save = () => {
    const n = name.trim();
    if (!n) return;
    onSave(n);
    setName("");
    refresh();
  };
  const remove = (n: string) => {
    deleteWorkspace(n);
    refresh();
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          aria-label="Workspace name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && save()}
          placeholder="Name a workspace…"
          className="min-w-0 flex-1 rounded-lg border border-border bg-card px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        />
        <button
          type="button"
          onClick={save}
          disabled={!name.trim()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-[13px] font-semibold text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-45"
        >
          <Save className="size-4 shrink-0" />
          Save
        </button>
      </div>

      {names.length === 0 ? (
        <p className="px-1 text-[12px] text-muted-foreground">No saved workspaces yet.</p>
      ) : (
        <ul className="space-y-1">
          {names.map((n) => (
            <li
              key={n}
              className="flex items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-1.5"
            >
              <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-foreground">
                {n}
              </span>
              <button
                type="button"
                onClick={() => onLoad(n)}
                aria-label={`Load workspace ${n}`}
                className={cn(
                  "inline-flex items-center gap-1 rounded-md px-2 py-1 text-[12px] font-semibold",
                  "text-foreground transition-colors hover:bg-muted",
                )}
              >
                <FolderDown className="size-3.5 shrink-0" />
                Load
              </button>
              <button
                type="button"
                onClick={() => remove(n)}
                aria-label={`Delete workspace ${n}`}
                className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Trash2 className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
