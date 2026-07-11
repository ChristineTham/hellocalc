// src/components/calculator/Topbar.tsx
// The always-present top bar (docs/responsive-layout.md §14.2, §12.4):
// hamburger top-LEFT below lg (mirrors the persistent sidebar's position;
// opens the nav as a LEFT sheet), brand, then — right — INDIVIDUAL toggles
// for each paper component (§14.3: tape / stack / vars, below md where the
// aux region is sheet-hosted) and the model picker. Sheets are uncontrolled
// Base UI dialogs: Escape + backdrop dismiss for free.
"use client";

import { Layers, ListOrdered, Menu, Receipt, Sigma } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ModelPicker } from "./ModelPicker";
import { HCBadge } from "./HCBadge";

export interface TopbarProps {
  activeModel: string;
  onSelectModel: (id: string) => void;
  /** the model's mode tags (RPN, FINANCIAL…) — worn as topbar badges so the
      machine's nameplate stays authentic (§14 rev 7) */
  tags?: string[];
  /** nav content (CalcNav) — hosted in the left sheet below lg */
  nav: React.ReactNode;
  /** the paper components (§14.3), each behind its own toggle below md;
      stack is absent for RPL models — their glass owns the stack */
  panels: {
    stack?: React.ReactNode;
    tape: React.ReactNode;
    vars?: React.ReactNode;
    /** keystroke program note (P3) — programmable models only */
    prgm?: React.ReactNode;
  };
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

export function Topbar({ activeModel, onSelectModel, tags, nav, panels }: TopbarProps) {
  return (
    <header className="flex h-full items-center gap-2 border-b border-border px-3">
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

      {/* the brand yields its room to the panel chips on phones (§14.4) —
          the nav sheet still carries the full wordmark */}
      <HCBadge className="h-6 w-6 shrink-0" />
      <h1 className="hidden min-w-0 truncate text-xl font-extrabold tracking-tight text-primary sm:block">
        Hello Calc
      </h1>

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
      {panels.prgm && (
        <PanelSheet
          label="Toggle program"
          title="Program"
          icon={<ListOrdered className="size-4" />}
        >
          {panels.prgm}
        </PanelSheet>
      )}
      <PanelSheet
        label="Toggle history tape"
        title="History tape"
        icon={<Receipt className="size-4" />}
      >
        {panels.tape}
      </PanelSheet>

      <ModelPicker active={activeModel} onSelect={onSelectModel} />
    </header>
  );
}
