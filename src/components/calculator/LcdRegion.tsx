// src/components/calculator/LcdRegion.tsx
// The LCD region (docs/responsive-layout.md §5): fills its grid cell (the
// shell's [data-region="lcd"] establishes the @container/lcd size context)
// and hosts Display. Step 3 adds the container-driven line↔mini default and
// the data-lcd-force override here; for now it centres and caps the glass.
"use client";

export function LcdRegion({ children }: { children: React.ReactNode }) {
  return <div className="lcd-region mx-auto w-full max-w-2xl">{children}</div>;
}
