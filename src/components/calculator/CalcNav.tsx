// src/components/calculator/CalcNav.tsx
// Navigation content (docs/responsive-layout.md §3.1): settings, state
// import/export/reset (FR-STATE-4 — live since the Phase-1 persistence
// foundation), and About. ONE component, two hosts: the left nav Sheet below
// lg (Topbar hamburger) and the persistent sidebar aside at lg+ (§12.4 —
// same mental location at every size). Desk-plane styling (§13.1).
"use client";

import { useRef } from "react";
import Link from "next/link";
import {
  Download,
  Info,
  RotateCcw,
  Settings,
  Upload,
} from "lucide-react";
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
    <span className="ml-auto font-mono text-[9.5px] tracking-[0.14em] text-muted-foreground uppercase">
      soon
    </span>
  );
}

export interface CalcNavProps {
  className?: string;
  /** FR-STATE-4: export the workspace as a versioned JSON file. */
  onExport?: () => void;
  /** FR-STATE-4: import a previously exported state file. */
  onImportFile?: (file: File) => void;
  /** FR-STATE-1: reset engines + clear the autosaved session. */
  onReset?: () => void;
}

export function CalcNav({ className, onExport, onImportFile, onReset }: CalcNavProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const wired = Boolean(onExport || onImportFile || onReset);
  return (
    <nav className={cn("flex min-h-0 flex-1 flex-col overflow-y-auto p-2", className)}>
      <SectionLabel>Workspace</SectionLabel>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onImportFile?.(file);
          e.target.value = ""; // re-selecting the same file must re-fire
        }}
      />
      <button
        type="button"
        className={ITEM}
        disabled={!wired}
        onClick={() => fileRef.current?.click()}
      >
        <Upload className="size-4 shrink-0" />
        Import state
        {!wired && <Soon />}
      </button>
      <button type="button" className={ITEM} disabled={!wired} onClick={onExport}>
        <Download className="size-4 shrink-0" />
        Export state
        {!wired && <Soon />}
      </button>
      <button type="button" className={ITEM} disabled={!wired} onClick={onReset}>
        <RotateCcw className="size-4 shrink-0" />
        Reset state
        {!wired && <Soon />}
      </button>

      <SectionLabel>App</SectionLabel>
      <button type="button" className={ITEM} disabled>
        <Settings className="size-4 shrink-0" />
        Settings
        <Soon />
      </button>
      <Link href="/about" className={ITEM}>
        <Info className="size-4 shrink-0" />
        About
      </Link>
    </nav>
  );
}
