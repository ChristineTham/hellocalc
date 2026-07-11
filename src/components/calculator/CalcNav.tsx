// src/components/calculator/CalcNav.tsx
// Navigation content (docs/responsive-layout.md §3.1): settings, state
// import/export/reset (FR-STATE-4 entry points — enabled when the persistence
// phase lands), and About. ONE component, two hosts: the left nav Sheet below
// lg (Topbar hamburger) and the persistent sidebar aside at lg+ (§12.4 —
// same mental location at every size). Desk-plane styling (§13.1).
"use client";

import {
  Download,
  Info,
  RotateCcw,
  Settings,
  Upload,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const ITEM =
  "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-semibold text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-45";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-2.5 pt-4 pb-1.5 font-mono text-[10.5px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
      {children}
    </div>
  );
}

function Soon() {
  return (
    <span className="ml-auto font-mono text-[9.5px] tracking-[0.14em] text-muted-foreground/70 uppercase">
      soon
    </span>
  );
}

export function CalcNav({ className }: { className?: string }) {
  return (
    <nav className={cn("flex min-h-0 flex-1 flex-col overflow-y-auto p-2", className)}>
      <SectionLabel>Workspace</SectionLabel>
      {/* FR-STATE-4 entry points — wired when the persistence phase lands */}
      <button type="button" className={ITEM} disabled>
        <Upload className="size-4 shrink-0" />
        Import state
        <Soon />
      </button>
      <button type="button" className={ITEM} disabled>
        <Download className="size-4 shrink-0" />
        Export state
        <Soon />
      </button>
      <button type="button" className={ITEM} disabled>
        <RotateCcw className="size-4 shrink-0" />
        Reset state
        <Soon />
      </button>

      <SectionLabel>App</SectionLabel>
      <button type="button" className={ITEM} disabled>
        <Settings className="size-4 shrink-0" />
        Settings
        <Soon />
      </button>
      <Dialog>
        <DialogTrigger className={ITEM}>
          <Info className="size-4 shrink-0" />
          About
        </DialogTrigger>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Hello Calc</DialogTitle>
            <DialogDescription>
              An HP calculator emulator — one shared math engine, faithful
              per-model keyboards. The keyboard always keeps the real
              machine&apos;s proportions; the display and panels adapt to your
              screen.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1 font-mono text-[11px] text-muted-foreground">
            <p>HP-35 · HP-12C · HP-15C · HP-48G — more on the way.</p>
            <p>
              Built with Next.js, math.js and KaTeX ·{" "}
              <a
                className="underline underline-offset-2 hover:text-foreground"
                href="https://github.com/ChristineTham/hellocalc"
                target="_blank"
                rel="noreferrer"
              >
                source
              </a>
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </nav>
  );
}
