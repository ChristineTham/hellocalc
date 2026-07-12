// src/components/calculator/Topbar.tsx
// The always-present top bar (docs/responsive-layout.md §14.2, §12.4):
// hamburger top-LEFT below lg (mirrors the persistent sidebar's position;
// opens the nav as a LEFT sheet), brand, the current-model nameplate, then —
// right — INDIVIDUAL toggles for each paper component (§14.3: tape / stack /
// vars, below md where the aux region is sheet-hosted). Model SELECTION now
// lives in the nav's model tree (sidebar at lg+, sheet below), so the topbar
// only NAMES the active machine. Sheets are uncontrolled Base UI dialogs:
// Escape + backdrop dismiss for free.
"use client";

import { useState } from "react";
import { Layers, Menu, Receipt, Sigma } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { HCBadge } from "./HCBadge";
import { CATALOG_INDEX } from "./modelCatalog";

export interface TopbarProps {
  activeModel: string;
  /** the model's mode tags (RPN, FINANCIAL…) — worn as topbar badges so the
      machine's nameplate stays authentic (§14 rev 7) */
  tags?: string[];
  /** nav content (SidebarNav) — hosted in the left sheet below lg */
  nav: React.ReactNode;
  /** the paper components (§14.3), each behind its own toggle below md;
      stack is absent for RPL models — their glass owns the stack */
  panels: {
    stack?: React.ReactNode;
    /** history tape — doubles as the program editor in PRGM mode (P3) */
    tape: React.ReactNode;
    vars?: React.ReactNode;
  };
  /** model-scoped tools rendered at the right end (e.g. the RPL code editor) */
  tools?: React.ReactNode;
}

const CHIP =
  "inline-flex items-center rounded-lg border border-border bg-card p-2 text-muted-foreground transition-colors hover:bg-muted md:hidden";

/** A paper panel behind its own bottom-sheet toggle (§14.3). */
function PanelSheet({
  label,
  title,
  icon,
  children,
}: {
  label: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Sheet>
      <SheetTrigger aria-label={label} className={CHIP}>
        {icon}
      </SheetTrigger>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="max-h-[70dvh] rounded-t-2xl bg-background pb-3"
      >
        {/* grab handle (§12.4) */}
        <div className="mx-auto mt-2 h-1 w-8 shrink-0 rounded-full bg-muted-foreground/30" />
        <SheetTitle className="sr-only">{title}</SheetTitle>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-1">{children}</div>
      </SheetContent>
    </Sheet>
  );
}

export function Topbar({ activeModel, tags, nav, panels, tools }: TopbarProps) {
  const modelLabel = CATALOG_INDEX[activeModel]?.label ?? activeModel;
  // controlled so picking a model in the mobile tree dismisses the sheet
  // (the persistent lg+ sidebar hosts the same nav and never uses this)
  const [navOpen, setNavOpen] = useState(false);
  return (
    <header className="flex h-full items-center gap-2 border-b border-border px-3">
      {/* nav: hamburger → LEFT sheet (below lg; the sidebar replaces it at lg+) */}
      <Sheet open={navOpen} onOpenChange={setNavOpen}>
        <SheetTrigger
          aria-label="Open navigation"
          className="inline-flex items-center rounded-lg border border-border bg-card p-2 text-muted-foreground transition-colors hover:bg-muted lg:hidden"
        >
          <Menu className="size-4" />
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-72 bg-background p-0"
          // picking a model from the tree dismisses the sheet (a model option
          // click bubbles here); Settings/About don't close it from within
          onClick={(e) => {
            if (e.target instanceof HTMLElement && e.target.closest('[role="option"]'))
              setNavOpen(false);
          }}
        >
          {/* the Title provides the dialog's accessible name (aria-labelledby
              beats aria-label); SidebarNav draws its own brand + model tree */}
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          {nav}
        </SheetContent>
      </Sheet>

      {/* the brand yields its room to the panel chips on phones (§14.4) —
          the nav sheet still carries the full wordmark */}
      <HCBadge className="h-6 w-6 shrink-0" />
      <h1 className="hidden min-w-0 truncate text-xl font-extrabold tracking-tight text-primary sm:block">
        Hello Calc
      </h1>

      {/* current-model nameplate — selection happens in the nav's model tree */}
      <span className="ml-1 min-w-0 truncate rounded-lg border border-border bg-card px-2.5 py-1 text-sm font-semibold text-foreground">
        {modelLabel}
      </span>

      {/* mode badges — the tags the nameplate used to wear (§14 rev 7) */}
      <div className="hidden min-w-0 items-center gap-1.5 pl-1 md:flex">
        {(tags ?? []).map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-border bg-card px-2 py-0.5 font-mono text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase"
          >
            {tag}
          </span>
        ))}
      </div>
      <div aria-hidden className="flex-1" />

      {/* individual paper-panel toggles (§14.3) — sheet-hosted below md */}
      {panels.stack && (
        <PanelSheet label="Toggle stack" title="Stack" icon={<Layers className="size-4" />}>
          {panels.stack}
        </PanelSheet>
      )}
      {panels.vars && (
        <PanelSheet
          label="Toggle variables"
          title="Variables"
          icon={<Sigma className="size-4" />}
        >
          {panels.vars}
        </PanelSheet>
      )}
      <PanelSheet
        label="Toggle history tape"
        title="History tape"
        icon={<Receipt className="size-4" />}
      >
        {panels.tape}
      </PanelSheet>

      {tools}
    </header>
  );
}
