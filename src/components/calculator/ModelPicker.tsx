// src/components/calculator/ModelPicker.tsx
// A grouped, searchable model picker — one trigger opens a menu grouped by
// family with a search box, so it scales to 20+ models where a flat tab row
// cannot. Planned-but-unimplemented models are shown disabled. Replaces the old
// flat ModelSwitcher.
"use client";

import { useState } from "react";
import { ChevronsUpDown, Search } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { MODELS } from "./models";
import { MODEL_CATALOG, CATALOG_INDEX } from "./modelCatalog";

const isAvailable = (id: string) => id in MODELS || id === "native"; // P23: native mode is live

export interface ModelPickerProps {
  active: string;
  onSelect: (id: string) => void;
}

export function ModelPicker({ active, onSelect }: ModelPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const groups = MODEL_CATALOG.map((g) => ({
    family: g.family,
    models: g.models.filter(
      (m) =>
        !q ||
        m.label.toLowerCase().includes(q) ||
        g.family.toLowerCase().includes(q) ||
        m.year.includes(q),
    ),
  })).filter((g) => g.models.length > 0);

  const activeLabel = CATALOG_INDEX[active]?.label ?? active;

  const pick = (id: string) => {
    if (!isAvailable(id)) return;
    onSelect(id);
    setOpen(false);
    setQuery("");
  };

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setQuery("");
      }}
    >
      <PopoverTrigger
        aria-label="Select calculator model"
        className="inline-flex min-w-40 items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-1.5 font-mono text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        <span className="truncate">{activeLabel}</span>
        <ChevronsUpDown className="size-4 shrink-0 opacity-60" />
      </PopoverTrigger>

      <PopoverContent align="end" className="w-[min(20rem,90vw)] p-0">
        <div className="flex items-center gap-2 border-b border-border px-3 py-2">
          <Search className="size-4 shrink-0 opacity-50" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search models…"
            aria-label="Search models"
            className="h-8 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
          />
        </div>

        <ScrollArea className="max-h-[min(24rem,60vh)]">
          <div className="p-1">
            {groups.length === 0 && (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">No models found</p>
            )}
            {groups.map((g) => (
              <div key={g.family} role="group" aria-label={g.family} className="py-1">
                <div className="px-2 py-1 font-mono text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                  {g.family}
                </div>
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
                      onClick={() => pick(m.id)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                        selected && "bg-primary text-primary-foreground",
                        !selected && avail && "hover:bg-muted",
                        !avail && "cursor-not-allowed opacity-45",
                      )}
                    >
                      <span className="font-medium">{m.label}</span>
                      <span
                        className={cn(
                          "font-mono text-[11px]",
                          selected ? "text-primary-foreground/80" : "text-muted-foreground",
                        )}
                      >
                        {avail ? m.year : "soon"}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
