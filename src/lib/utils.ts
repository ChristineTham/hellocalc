import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

// tailwind-merge only knows Tailwind's BUILT-IN font-size names (text-xs…9xl);
// it classifies unknown `text-*` classes as text-COLOR, so a custom size like
// `text-key-shift` colocated with a color like `text-hp-shift-f` gets silently
// DROPPED (same conflict group, last one wins). Register our @theme --text-*
// utilities (globals.css) as font-size classes so sizes and colors merge
// independently.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "key-primary",
            "key-shift",
            "hp-lcd-hero",
            "hp-lcd-value",
            "hp-lcd-stack",
            "hp-lcd-annun",
            "hp-lcd-reg",
          ],
        },
      ],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
