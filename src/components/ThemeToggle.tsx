// src/components/ThemeToggle.tsx
// Light / dark / system theme control. Writes the choice to localStorage under
// THEME_KEY and applies the `.dark` class on <html> — the same key + logic the
// no-FOUC inline script in layout.tsx reads on first paint, so there's no flash.
// "system" tracks prefers-color-scheme live. Static-export safe (no server).
"use client";

import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export const THEME_KEY = "hellocalc-theme";
export type Theme = "light" | "dark" | "system";

/** Resolve + apply a preference to the <html> class. Shared with the inline
 * script (kept in sync by hand — it's four lines). */
function apply(theme: Theme) {
  const dark =
    theme === "dark" ||
    (theme === "system" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

const OPTIONS: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");

  // hydrate the saved choice after mount (localStorage is browser-only)
  useEffect(() => {
    const saved = (localStorage.getItem(THEME_KEY) as Theme | null) ?? "system";
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-data sync on mount
    setTheme(saved);
  }, []);

  // keep "system" tracking the OS preference while selected
  useEffect(() => {
    if (theme !== "system" || typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => apply("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  const choose = (next: Theme) => {
    setTheme(next);
    localStorage.setItem(THEME_KEY, next);
    apply(next);
  };

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="inline-flex gap-0.5 rounded-lg border border-border bg-card p-0.5"
    >
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            onClick={() => choose(value)}
            className={cn(
              "inline-flex items-center justify-center rounded-md p-1.5 transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
          </button>
        );
      })}
    </div>
  );
}
