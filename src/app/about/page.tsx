// src/app/about/page.tsx
// The About page (linked from the sidebar's About item): a full, standalone
// route — not inside the calculator shell — describing the project and its
// current status. Static-export friendly: a server component with next/link
// (basePath-safe) and the app's own design tokens, theme-aware via the
// semantic --color-* variables. Data (the model roster) comes from the same
// MODEL_CATALOG the picker uses, so it never drifts.

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { HCBadge } from "@/components/calculator/HCBadge";
import { MODEL_CATALOG } from "@/components/calculator/modelCatalog";

export const metadata: Metadata = {
  title: "About · Hello Calc",
  description:
    "Hello Calc emulates 21 classic HP calculators over one shared TypeScript math engine, plus a keyboard-first native mode.",
};

const MODEL_COUNT = MODEL_CATALOG.reduce(
  (n, g) => n + g.models.filter((m) => m.id !== "native").length,
  0,
);

/** The engine's headline capabilities, grouped for the capability grid. */
const CAPABILITIES: { title: string; body: string }[] = [
  {
    title: "One exact value tower",
    body: "Every model computes on a single math.js instance configured to BigNumber (40-digit precision), so 0.1 + 0.2 is exactly 0.3 — no IEEE-754 drift. Finance builds on decimal.js for the same reason.",
  },
  {
    title: "Two stack machines",
    body: "A fixed 4-level RPN stack (X / Y / Z / T + LAST X) drives the classics through the HP-16C; a dynamic RPL object stack drives the 28C through the 50g with typed objects, directories and softkey menus.",
  },
  {
    title: "Keystroke programming",
    body: "Record-and-run programs with labels, GTO / GSB, conditional skips, ISG / DSE loops and an operation budget — reused by SOLVE and numeric integration.",
  },
  {
    title: "Complex, matrices & solvers",
    body: "Complex arithmetic, matrix algebra (determinant, inverse, transpose, RREF, LU / QR / SVD / eigenvalues), a numeric root finder and definite integration.",
  },
  {
    title: "Units & dimensions",
    body: "First-class unit quantities: 5 cm + 2 in auto-converts to 10.08 cm, and dimensionally inconsistent operations report a clear error instead of a silent NaN.",
  },
  {
    title: "Tiered symbolic CAS",
    body: "A light Nerdamer tier (differentiate, integrate, factor, solve) loads on demand; a heavy Pyodide + SymPy tier (limits, series, partial fractions, Laplace transforms) streams in only when an advanced-CAS key is pressed.",
  },
  {
    title: "Plotting",
    body: "2D function and polar plots, statistical scatter / bar / histogram charts, and projected 3D wireframes — sampled in the engine and drawn by a lazily-loaded grapher.",
  },
  {
    title: "Finance & statistics",
    body: "Full TVM (solve any variable), amortization, cash-flow NPV / IRR, bond pricing, depreciation, descriptive statistics, curve fitting and probability distributions.",
  },
];

const PRINCIPLES: { title: string; body: string }[] = [
  {
    title: "The integrated machine",
    body: "Nameplate, LCD and keyboard are one bezel that reflows across five page templates from phone to desktop — never a floating keypad.",
  },
  {
    title: "Real keyboard proportions",
    body: "Each keyboard's aspect ratio derives from its actual key grid and scales uniformly, so nothing is distorted or clipped at any size.",
  },
  {
    title: "Paper, not pixels",
    body: "History prints as a calculator tape; the stack and variables are notebook notes — each individually toggleable and placed by the active layout.",
  },
  {
    title: "Type, don't tap",
    body: "Per-model physical-keyboard maps with a visible key echo and a cheat sheet, so the whole machine is reachable without the mouse.",
  },
];

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 font-mono text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
      {children}
    </h2>
  );
}

export default function AboutPage() {
  return (
    <div className="min-h-full bg-background text-foreground">
      {/* header — maker's mark left, return-to-calculator right */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-5 py-3">
          <div className="flex items-center gap-2.5">
            <HCBadge className="size-6 shrink-0" />
            <span className="font-sans text-sm font-bold tracking-[0.14em] text-foreground uppercase">
              Hello·Calc
            </span>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[13px] font-semibold text-foreground transition-colors hover:bg-muted"
          >
            <ArrowLeft className="size-4" />
            Back to calculator
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-10 sm:py-14">
        {/* hero */}
        <section className="mb-14">
          {/* pink stays decorative (dot/border); the words use foreground for contrast */}
          <span className="inline-flex items-center gap-2 rounded-full border border-hc-pink/40 bg-hc-pink/10 px-3 py-1 font-mono text-[11px] font-semibold tracking-[0.08em] text-foreground">
            <span className="size-1.5 rounded-full bg-hc-pink" />
            v1.0 · all 23 build phases complete
          </span>
          <h1 className="mt-5 font-sans text-4xl font-black tracking-tight text-foreground sm:text-5xl">
            Hello Calc
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            A faithful emulator of {MODEL_COUNT} classic HP calculators — from the
            HP-35 (1972) to the HP Prime (2013) — built over one shared TypeScript
            math engine, plus a keyboard-first native mode that exposes the whole
            engine directly.
          </p>
        </section>

        {/* what it is */}
        <section className="mb-14">
          <SectionHeading>What it is</SectionHeading>
          <div className="space-y-4 text-[15px] leading-relaxed text-foreground/90">
            <p>
              Every machine is a pixel-honest faceplate driven by the real
              key-to-function data for that model, so pressing a key does exactly
              what the hardware did. Underneath, all {MODEL_COUNT} models — and the
              native mode — run on the <strong>same engine</strong>: a single exact
              value tower, two stack machines, and feature modules for units, the
              symbolic CAS, plotting, finance and statistics.
            </p>
            <p>
              It runs entirely in your browser as a static site — no server, no
              account. Your session (stack, memory, variables, history and the
              active model) autosaves locally and exports as a versioned JSON file
              you can re-import anywhere.
            </p>
          </div>
        </section>

        {/* status */}
        <section className="mb-14">
          <SectionHeading>Current status</SectionHeading>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { n: String(MODEL_COUNT), label: "models emulated" },
              { n: "0", label: "inert keys" },
              { n: "2", label: "stack machines" },
              { n: "3", label: "CAS tiers" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-border bg-card px-4 py-4 text-center"
              >
                <div className="font-sans text-3xl font-black text-foreground">{s.n}</div>
                <div className="mt-1 font-mono text-[10px] tracking-[0.1em] text-muted-foreground uppercase">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[15px] leading-relaxed text-foreground/90">
            Every model is <strong>fully wired</strong>: no key remains inert, and
            each machine is guarded by an automated coverage check that fails the
            build if any function is left unimplemented. The whole project is backed
            by 400+ unit tests and an end-to-end Playwright suite that must pass
            before any change ships.
          </p>
        </section>

        {/* capabilities */}
        <section className="mb-14">
          <SectionHeading>The engine</SectionHeading>
          <div className="grid gap-3 sm:grid-cols-2">
            {CAPABILITIES.map((c) => (
              <div key={c.title} className="rounded-xl border border-border bg-card p-4">
                <h3 className="font-sans text-sm font-bold text-foreground">{c.title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                  {c.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* the fleet */}
        <section className="mb-14">
          <SectionHeading>The fleet</SectionHeading>
          <div className="space-y-5">
            {MODEL_CATALOG.map((group) => (
              <div key={group.family}>
                <h3 className="mb-2 font-mono text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                  {group.family}
                </h3>
                <ul className="flex flex-wrap gap-2">
                  {group.models.map((m) => (
                    <li
                      key={m.id}
                      className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5"
                    >
                      <span className="font-sans text-[13px] font-semibold text-foreground">
                        {m.label}
                      </span>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {m.year}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* design principles */}
        <section className="mb-14">
          <SectionHeading>Design principles</SectionHeading>
          <dl className="space-y-4">
            {PRINCIPLES.map((p) => (
              <div key={p.title} className="border-l-2 border-hc-pink/50 pl-4">
                <dt className="font-sans text-sm font-bold text-foreground">{p.title}</dt>
                <dd className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                  {p.body}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* built with */}
        <section className="mb-4">
          <SectionHeading>Built with</SectionHeading>
          <ul className="flex flex-wrap gap-2">
            {[
              "Next.js",
              "TypeScript",
              "math.js / BigNumber",
              "decimal.js",
              "Tailwind CSS",
              "shadcn · Base UI",
              "KaTeX",
              "CodeMirror",
              "Nerdamer",
              "Pyodide · SymPy",
              "function-plot",
              "Vitest",
              "Playwright",
            ].map((t) => (
              <li
                key={t}
                className="rounded-md border border-border bg-muted/40 px-2.5 py-1 font-mono text-[11px] text-muted-foreground"
              >
                {t}
              </li>
            ))}
          </ul>
          <a
            href="https://github.com/ChristineTham/hellocalc"
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-lg border border-border px-3.5 py-2 text-[13px] font-semibold text-foreground transition-colors hover:bg-muted"
          >
            <ExternalLink className="size-4" />
            View the source on GitHub
          </a>
        </section>

        <footer className="mt-12 border-t border-border pt-6 text-[12px] text-muted-foreground">
          <p>
            Hello Calc is an independent tribute to a line of remarkable machines. It
            carries no manufacturer marks and is not affiliated with, endorsed by, or
            connected to Hewlett-Packard or HP Inc. Model names are used only to
            identify the calculators emulated.
          </p>
        </footer>
      </main>
    </div>
  );
}
