// src/components/calculator/SettingsDialog.tsx
// The Settings dialog: theme (light/dark/system) and workspace state actions
// (import / export / reset — FR-STATE-4). Opened from the sidebar footer's gear
// button. Consolidates what used to live loose in the sidebar nav.
"use client";

import { useRef } from "react";
import { Download, RotateCcw, Settings, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PrecisionControl } from "@/components/calculator/PrecisionControl";
import { cn } from "@/lib/utils";

const ITEM =
  "flex w-full items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2 text-left text-[13px] font-semibold text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-45";

export interface SettingsDialogProps {
  /** FR-STATE-4: export the workspace as a versioned JSON file. */
  onExport?: () => void;
  /** FR-STATE-4: import a previously exported state file. */
  onImportFile?: (file: File) => void;
  /** FR-STATE-1: reset engines + clear the autosaved session. */
  onReset?: () => void;
  /** trigger styling — the gear button in the sidebar footer / sheet */
  triggerClassName?: string;
}

export function SettingsDialog({
  onExport,
  onImportFile,
  onReset,
  triggerClassName,
}: SettingsDialogProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const wired = Boolean(onExport || onImportFile || onReset);

  return (
    <Dialog>
      <DialogTrigger
        aria-label="Settings"
        className={cn(
          "inline-flex items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] font-semibold text-foreground transition-colors hover:bg-muted",
          triggerClassName,
        )}
      >
        <Settings className="size-4 shrink-0" />
        Settings
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-sans">Settings</DialogTitle>
          <DialogDescription>Appearance and your saved workspace.</DialogDescription>
        </DialogHeader>

        <section className="space-y-2">
          <h3 className="font-mono text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            Appearance
          </h3>
          <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2">
            <span className="text-[13px] font-semibold text-foreground">Theme</span>
            <ThemeToggle />
          </div>
        </section>

        <section className="space-y-2">
          <h3 className="font-mono text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            Precision
          </h3>
          <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2">
            <span className="text-[13px] font-semibold text-foreground">
              Working digits
              <span className="ml-1 font-normal text-muted-foreground">(BigNumber tower)</span>
            </span>
            <PrecisionControl />
          </div>
        </section>

        <section className="space-y-2">
          <h3 className="font-mono text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            Workspace
          </h3>
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
          </button>
          <button type="button" className={ITEM} disabled={!wired} onClick={onExport}>
            <Download className="size-4 shrink-0" />
            Export state
          </button>
          <button type="button" className={ITEM} disabled={!wired} onClick={onReset}>
            <RotateCcw className="size-4 shrink-0" />
            Reset state
          </button>
        </section>
      </DialogContent>
    </Dialog>
  );
}
