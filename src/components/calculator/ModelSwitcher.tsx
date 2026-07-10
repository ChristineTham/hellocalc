// src/components/calculator/ModelSwitcher.tsx
// Top-bar switcher between emulated models. State (stack/memory) is retained by
// the shared engine across switches. For now only the Voyager models (HP-12C /
// HP-15C) are fully driven; the list expands as families are wired.
"use client";

import { cn } from "@/lib/utils";
import { MODELS } from "./models";

export interface ModelSwitcherProps {
  active: string;
  ids: readonly string[];
  onSelect: (id: string) => void;
}

export function ModelSwitcher({ active, ids, onSelect }: ModelSwitcherProps) {
  return (
    <div
      role="tablist"
      aria-label="Calculator model"
      className="inline-flex gap-1 rounded-lg border border-border bg-card p-1"
    >
      {ids.map((id) => {
        const m = MODELS[id];
        const selected = id === active;
        return (
          <button
            key={id}
            role="tab"
            aria-selected={selected}
            onClick={() => onSelect(id)}
            className={cn(
              "rounded-md px-3 py-1.5 font-mono text-xs font-semibold tracking-wide transition-colors",
              selected
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {m.name}
          </button>
        );
      })}
    </div>
  );
}
