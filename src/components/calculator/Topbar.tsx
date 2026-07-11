// src/components/calculator/Topbar.tsx
// The always-present top bar (docs/responsive-layout.md §3.1, §12.4):
// hamburger top-LEFT below lg (mirrors the persistent sidebar's position;
// opens the nav as a LEFT sheet), brand, then — right — the aux toggle below
// md (opens history/stack as a BOTTOM sheet, §12.4 thumb reach) and the
// model picker. Sheets are uncontrolled Base UI dialogs: Escape + backdrop
// dismiss for free.
"use client";

import { Menu, PanelBottom } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ModelPicker } from "./ModelPicker";

export interface TopbarProps {
  activeModel: string;
  onSelectModel: (id: string) => void;
  /** nav content (CalcNav) — hosted in the left sheet below lg */
  nav: React.ReactNode;
  /** aux content (AuxPanel) — hosted in the bottom sheet below md */
  aux: React.ReactNode;
}

export function Topbar({ activeModel, onSelectModel, nav, aux }: TopbarProps) {
  return (
    <header className="flex h-full items-center gap-3 border-b border-border px-3">
      {/* nav: hamburger → LEFT sheet (below lg; the sidebar replaces it at lg+) */}
      <Sheet>
        <SheetTrigger
          aria-label="Open navigation"
          className="inline-flex items-center rounded-lg border border-border bg-card p-2 text-muted-foreground transition-colors hover:bg-muted lg:hidden"
        >
          <Menu className="size-4" />
        </SheetTrigger>
        <SheetContent side="left" className="w-72 bg-background">
          {/* the Title provides the dialog's accessible name (aria-labelledby
              beats aria-label); the brand renders as plain chrome */}
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="px-4 pt-4 text-lg font-extrabold tracking-tight text-primary">
            Hello Calc
          </div>
          {nav}
        </SheetContent>
      </Sheet>

      <h1 className="min-w-0 flex-1 truncate text-xl font-extrabold tracking-tight text-primary">
        Hello Calc
      </h1>

      {/* aux: history/stack → BOTTOM sheet (below md the aux region is not inline) */}
      <Sheet>
        <SheetTrigger
          aria-label="Toggle history and stack"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted md:hidden"
        >
          <PanelBottom className="size-4" />
          Stack
        </SheetTrigger>
        <SheetContent
          side="bottom"
          aria-label="History and stack"
          showCloseButton={false}
          className="max-h-[70dvh] rounded-t-2xl bg-background pb-2"
        >
          {/* grab handle (§12.4) */}
          <div className="mx-auto mt-2 h-1 w-8 shrink-0 rounded-full bg-muted-foreground/30" />
          <SheetTitle className="sr-only">History and stack</SheetTitle>
          <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-1">{aux}</div>
        </SheetContent>
      </Sheet>

      <ModelPicker active={activeModel} onSelect={onSelectModel} />
    </header>
  );
}
