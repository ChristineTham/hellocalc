// src/components/calculator/ModelPicker.tsx
// The model picker: the trigger shows the current calculator; clicking it opens
// a Dialog "gallery" — an opaque, scrollable grid of model cards grouped by era
// with a search box on top. A Dialog (not a Popover) gives a solid backdrop and
// an opaque panel, and the grid scrolls with a plain overflow container — the
// two defects the old Popover+ScrollArea version had (a stuck ~0.22 opacity and
// an unbounded viewport that never scrolled). Scales cleanly to the 21-model
// fleet and goes full-width on phones.
"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setQuery("");
      }}
    >
      <DialogTrigger
        aria-label="Select calculator model"
        className="inline-flex min-w-40 items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-1.5 font-mono text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        <span className="truncate">{activeLabel}</span>
        <ChevronsUpDown className="size-4 shrink-0 opacity-60" />
      </DialogTrigger>

      <DialogContent className="flex max-h-[85dvh] w-[calc(100%-2rem)] flex-col gap-0 p-0 sm:max-w-2xl">
        <DialogHeader className="gap-3 border-b border-border p-4">
          <DialogTitle className="font-sans">Choose a calculator</DialogTitle>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3">
            <Search className="size-4 shrink-0 opacity-50" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search models…"
              aria-label="Search models"
              className="h-9 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
            />
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {groups.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">No models found</p>
          ) : (
            groups.map((g) => (
              <section key={g.family} className="mb-5 last:mb-0">
                <h3 className="mb-2 font-mono text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                  {g.family}
                </h3>
                {/* option roles need a listbox ancestor — one PER family, so
                    the heading stays outside the listbox subtree */}
                <div
                  role="listbox"
                  aria-label={g.family}
                  className="grid grid-cols-2 gap-2 sm:grid-cols-3"
                >
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
                          "relative flex flex-col items-start gap-0.5 rounded-xl border p-3 text-left transition-colors",
                          selected
                            ? "border-terracotta/50 bg-terracotta/10 ring-1 ring-terracotta/30"
                            : "border-border bg-card hover:border-terracotta/40 hover:bg-muted",
                          !avail && "cursor-not-allowed opacity-45 hover:border-border hover:bg-card",
                        )}
                      >
                        {selected && (
                          <Check className="absolute top-2.5 right-2.5 size-4 text-terracotta" />
                        )}
                        <span className="font-sans text-sm font-bold text-foreground">
                          {m.label}
                        </span>
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {avail ? m.year : "soon"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
