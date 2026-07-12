// src/components/calculator/SidebarNav.tsx
// The primary navigation: brand, the selectable MODEL TREE (grouped by class),
// and a footer with Settings + About. ONE component, two hosts — the persistent
// sidebar aside at lg+ and the left hamburger sheet below lg (§12.4). Replaces
// the old CalcNav (state actions moved into the Settings dialog) and the topbar
// gallery picker (the tree is the picker now).
"use client";

import Link from "next/link";
import { Info } from "lucide-react";
import { HCBadge } from "./HCBadge";
import { ModelTree } from "./ModelTree";
import { SettingsDialog } from "./SettingsDialog";

export interface SidebarNavProps {
  activeModel: string;
  onSelectModel: (id: string) => void;
  onExport?: () => void;
  onImportFile?: (file: File) => void;
  onReset?: () => void;
  /** the brand header renders in the sidebar; the sheet host draws its own */
  showBrand?: boolean;
}

export function SidebarNav({
  activeModel,
  onSelectModel,
  onExport,
  onImportFile,
  onReset,
  showBrand = true,
}: SidebarNavProps) {
  return (
    <nav aria-label="Models" className="flex min-h-0 flex-1 flex-col">
      {showBrand && (
        <div className="flex items-center gap-2.5 px-3 py-3">
          <HCBadge className="size-6 shrink-0" />
          <span className="font-sans text-sm font-bold tracking-[0.14em] text-foreground uppercase">
            Hello·Calc
          </span>
        </div>
      )}

      <ModelTree active={activeModel} onSelect={onSelectModel} />

      <div className="flex items-center justify-between gap-1 border-t border-border p-2">
        <SettingsDialog
          onExport={onExport}
          onImportFile={onImportFile}
          onReset={onReset}
        />
        <Link
          href="/about"
          className="inline-flex items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] font-semibold text-foreground transition-colors hover:bg-muted"
        >
          <Info className="size-4 shrink-0" />
          About
        </Link>
      </div>
    </nav>
  );
}
