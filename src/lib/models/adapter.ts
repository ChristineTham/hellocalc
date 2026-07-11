// src/lib/models/adapter.ts
// Model-adapter formalization (architecture §6, Phase 1): the verified
// (physical key, prefix) → function map for every model, imported from
// hp/mapping/mapping.json at build time, with a COVERAGE oracle so "no key
// on this model remains inert" (plan/README) is a checkable assertion, not
// a hope. Legends resolve through the same normalize seam the faceplates use.
//
// ⚠ mapping.json is ~420 KB. This module is meant for TESTS and build-time
// tooling (coverage reports, future codegen) — do NOT import it from app
// runtime code, or the whole map ships in the initial bundle (NFR-3). The
// live keyboards keep dispatching their authored/generated key data.

import mapping from "../../../hp/mapping/mapping.json";
import { MODEL_FN_OVERRIDES, normalizeFn } from "./normalize";

export interface MappedPress {
  access: string; // "none" | "f" | "g" | "h" | "arc" | model-specific shifts
  function: string; // the function id as printed/documented
}

export interface MappedKey {
  row: string;
  primary: string;
  presses: MappedPress[];
}

interface ModelMap {
  keys: MappedKey[];
}

const MAPPING: Record<string, ModelMap> = mapping;

export const mappedModels = (): string[] => Object.keys(MAPPING);

export function modelKeys(model: string): MappedKey[] {
  return MAPPING[model]?.keys ?? [];
}

/** Every (key, access) → canonical engine id for a model, deduplicated. */
export function modelFunctions(
  model: string,
): { key: string; access: string; fn: string }[] {
  const over = MODEL_FN_OVERRIDES[model] ?? {};
  return modelKeys(model).flatMap((k) =>
    k.presses
      .filter((p) => p.function && p.function !== "—")
      .map((p) => ({
        key: k.primary,
        access: p.access,
        fn:
          p.access === "alpha"
            ? `α${p.function === "SPACE" ? " " : p.function}` // α-append ids (P6)
            : (over[p.function] ?? normalizeFn(p.function)),
      })),
  );
}

/** Resolve one keystroke exactly as the machines do: (key, prefix) → id. */
export function resolveKey(
  model: string,
  primary: string,
  access = "none",
): string | null {
  const key = modelKeys(model).find((k) => k.primary === primary);
  const press = key?.presses.find((p) => p.access === access);
  if (!press || !press.function || press.function === "—") return null;
  const over = MODEL_FN_OVERRIDES[model] ?? {};
  return over[press.function] ?? normalizeFn(press.function);
}

/** Ids the KEYBOARD layer consumes (prefix/mode modifiers) — they never reach
 * the engine, so coverage must not count them as missing engine ops. */
const FACEPLATE_LOCAL = new Set([
  "arc", "f", "g", "h", "f⁻¹", "ALPHA", "α", "[gold shift key]",
  "ENTER (cont.)", "[ENTER↑]", // the tall ENTER's lower half in the mapping
  "ON",
  // RPL clamshell hardware keys (P12): the shift itself, the six blank
  // menu keys (dispatched by softkey index), and the cursor/mode rocker
  "(red shift)", "(menu key)", "◄▶ (mode key)",
  "■ (shift)", // the 42S/pioneer shift key print (P16)
  // the 48-series shift/alpha keys + blank spacers (P17)
  "◄ (left-shift key)", "► (right-shift key)", "α (ALPHA)", "(blank)",
  "← (left-shift key)", "→ (right-shift key)", // the 49G/50g arrow shifts (P19)
]);

/** Coverage report for the no-inert-keys DoD line: which of a model's mapped
 * functions the engine implements today (per the caller's probe). */
export function coverage(
  model: string,
  isImplemented: (fn: string) => boolean,
): { total: number; implemented: string[]; missing: string[] } {
  const fns = [
    ...new Set(modelFunctions(model).map((f) => f.fn)),
  ].filter((fn) => !FACEPLATE_LOCAL.has(fn));
  const implemented = fns.filter(isImplemented);
  const missing = fns.filter((fn) => !isImplemented(fn));
  return { total: fns.length, implemented, missing };
}
