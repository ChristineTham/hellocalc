// src/components/calculator/CheatSheet.tsx
// The `?` keyboard-shortcut cheat-sheet (docs/responsive-layout.md §12.2,
// FR-UI-2): generated from the same hotkey map the dispatcher uses — no drift.
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cheatsheetRows } from "@/lib/hotkeys";
import type { Family } from "./models";

export interface CheatSheetProps {
  family: Family;
  modelName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CheatSheet({ family, modelName, open, onOpenChange }: CheatSheetProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
          <DialogDescription>
            Type on your keyboard — the {modelName} presses its own keys.
          </DialogDescription>
        </DialogHeader>
        <table className="w-full text-[13px]">
          <tbody>
            {cheatsheetRows(family).map((row) => (
              <tr key={row.keys} className="border-b border-border last:border-0">
                <td className="py-1.5 pr-4 font-mono text-[12px] font-semibold whitespace-nowrap text-foreground">
                  {row.keys}
                </td>
                <td className="py-1.5 text-muted-foreground">{row.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DialogContent>
    </Dialog>
  );
}
