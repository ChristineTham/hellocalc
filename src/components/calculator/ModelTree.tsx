// src/components/calculator/ModelTree.tsx
// The model navigator: a selectable tree of calculators grouped by class/era,
// used as the sidebar's primary content (and inside the mobile nav sheet).
// Each class is a collapsible group; each model is a role="option" row so the
// group reads as a small listbox. A search box filters across labels, classes
// and years and auto-reveals matching groups. Replaces the old topbar gallery
// dialog — on desktop the tree IS the picker; on phones it rides the sheet.
"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { MODELS } from "./models";
import { MODEL_CATALOG } from "./modelCatalog";

const isAvailable = (id: string) => id in MODELS || id === "native"; // P23: native is live

export interface ModelTreeProps {
  active: string;
  onSelect: (id: string) => void;
  className?: string;
}

export function ModelTree({ active, onSelect, className }: ModelTreeProps) {
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const q = query.trim().toLowerCase();

  const groups = useMemo(
    () =>
      MODEL_CATALOG.map((g) => ({
        family: g.family,
        models: g.models.filter(
          (m) =>
            !q ||
            m.label.toLowerCase().includes(q) ||
            g.family.toLowerCase().includes(q) ||
            m.year.includes(q),
        ),
      })).filter((g) => g.models.length > 0),
    [q],
  );

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
      {/* search */}
      <div className="px-2 pb-2">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-2.5">
          <Search className="size-3.5 shrink-0 opacity-50" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search models…"
            aria-label="Search models"
            className="h-8 border-0 bg-transparent p-0 text-[13px] shadow-none focus-visible:ring-0"
          />
        </div>
      </div>

      {/* the tree */}
      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
        {groups.length === 0 ? (
          <p className="px-1 py-6 text-center text-[13px] text-muted-foreground">No models found</p>
        ) : (
          groups.map((g) => {
            // searching force-expands; otherwise honour the per-group toggle
            const open = q !== "" || !collapsed[g.family];
            return (
              <div key={g.family} className="mb-0.5">
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() =>
                    setCollapsed((c) => ({ ...c, [g.family]: !c[g.family] }))
                  }
                  className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 font-mono text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase transition-colors hover:bg-muted"
                >
                  <ChevronDown
                    className={cn(
                      "size-3.5 shrink-0 transition-transform",
                      !open && "-rotate-90",
                    )}
                  />
                  <span className="truncate">{g.family}</span>
                  <span className="ml-auto font-sans text-[10px] font-normal tracking-normal tabular-nums opacity-60">
                    {g.models.length}
                  </span>
                </button>

                {open && (
                  // options are DIRECT children of the listbox — a wrapping
                  // <li>/listitem is not an allowed listbox child (WCAG 1.3.1)
                  <div role="listbox" aria-label={g.family} className="mt-0.5 space-y-0.5 pl-3">
                    {g.models.map((m) => {
                      const avail = isAvailable(m.id);
                      const selected = m.id === active;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          role="option"
                          aria-label={m.label}
                          aria-selected={selected}
                          disabled={!avail}
                          onClick={() => avail && onSelect(m.id)}
                          className={cn(
                            // NO colour transition: the selected↔unselected swap
                            // crosses gold↔transparent AND dark↔light text at once,
                            // and a mid-transition blend dips below AA (the a11y
                            // guard scans the settled + transient state)
                            "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px]",
                            selected
                              ? "bg-primary font-semibold text-primary-foreground"
                              : "text-foreground hover:bg-muted",
                            !avail && "cursor-not-allowed opacity-45 hover:bg-transparent",
                          )}
                        >
                          <span className="truncate">{m.label}</span>
                          <span
                            className={cn(
                              // full opacity on the selected row — an /80 tint
                              // dips the 11px year below AA on the gold primary
                              "ml-auto font-mono text-[11px] tabular-nums",
                              selected ? "text-primary-foreground" : "text-muted-foreground",
                            )}
                          >
                            {avail ? m.year : "soon"}
                          </span>
                          {selected && <Check className="size-3.5 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
