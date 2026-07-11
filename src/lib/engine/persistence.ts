// src/lib/engine/persistence.ts
// State persistence foundation (architecture §9, FR-STATE-1/4): ONE
// serializable EngineState tree with a tagged value codec (BigNumber now;
// later phases add complex/matrix/unit tags) and a schema version so files
// survive upgrades. Pure TS — no DOM. The localStorage adapter and file
// download/upload live in src/lib/storage.ts (browser side); this module
// only defines the codec, the snapshot/restore pair, and the adapter seam.

import { bn, type Value } from "./config";
import { createRpn, type Angle, type HistEntry, type PrgmState, type RpnEngine } from "./rpn";
import { createRpl, type RplEngine } from "./rpl";
import type { DisplayFormat } from "./format";

export const STATE_VERSION = 1 as const;

/** Tagged value codec — BigNumbers travel as exact decimal strings. Later
 * phases extend the union (complex, matrix, unit, …) without breaking v1. */
export interface TaggedValue {
  t: "bn";
  v: string;
}

export const encodeValue = (v: Value): TaggedValue => ({ t: "bn", v: v.toString() });
export const decodeValue = (t: TaggedValue): Value => bn(t.v);

interface SerializedRpn {
  x: TaggedValue;
  y: TaggedValue;
  z: TaggedValue;
  t: TaggedValue;
  lastX: TaggedValue;
  mem: TaggedValue;
  /** optional for v1 forward-compat: pre-P2 saves have no registers/Σ */
  regs?: TaggedValue[];
  sum?: { n: TaggedValue; x: TaggedValue; x2: TaggedValue; y: TaggedValue };
  prgm?: PrgmState;
  entry: string | null;
  lift: boolean;
  angle: Angle;
  disp: DisplayFormat;
  hist: HistEntry[];
}

interface SerializedRpl {
  stack: TaggedValue[];
  entry: string | null;
  angle: Angle;
  disp: DisplayFormat;
  hist: HistEntry[];
}

export interface EngineStateV1 {
  version: typeof STATE_VERSION;
  /** shared session state (per architecture §9 `shared`) */
  activeModel: string;
  rpn: SerializedRpn;
  rpl: SerializedRpl;
}

export function snapshot(
  rpn: RpnEngine,
  rpl: RplEngine,
  activeModel: string,
): EngineStateV1 {
  return {
    version: STATE_VERSION,
    activeModel,
    rpn: {
      x: encodeValue(rpn.x),
      y: encodeValue(rpn.y),
      z: encodeValue(rpn.z),
      t: encodeValue(rpn.t),
      lastX: encodeValue(rpn.lastX),
      mem: encodeValue(rpn.mem),
      regs: rpn.regs.map(encodeValue),
      sum: {
        n: encodeValue(rpn.sum.n),
        x: encodeValue(rpn.sum.x),
        x2: encodeValue(rpn.sum.x2),
        y: encodeValue(rpn.sum.y),
      },
      prgm: { ...rpn.prgm, steps: [...rpn.prgm.steps] },
      entry: rpn.entry,
      lift: rpn.lift,
      angle: rpn.angle,
      disp: { ...rpn.disp },
      hist: rpn.hist.map((h) => ({ ...h })),
    },
    rpl: {
      stack: rpl.stack.map(encodeValue),
      entry: rpl.entry,
      angle: rpl.angle,
      disp: { ...rpl.disp },
      hist: rpl.hist.map((h) => ({ ...h })),
    },
  };
}

export function restore(state: EngineStateV1): {
  rpn: RpnEngine;
  rpl: RplEngine;
  activeModel: string;
} {
  const fresh = createRpn();
  const rpn: RpnEngine = {
    ...fresh,
    x: decodeValue(state.rpn.x),
    y: decodeValue(state.rpn.y),
    z: decodeValue(state.rpn.z),
    t: decodeValue(state.rpn.t),
    lastX: decodeValue(state.rpn.lastX),
    mem: decodeValue(state.rpn.mem),
    regs: state.rpn.regs ? state.rpn.regs.map(decodeValue) : fresh.regs,
    sum: state.rpn.sum
      ? {
          n: decodeValue(state.rpn.sum.n),
          x: decodeValue(state.rpn.sum.x),
          x2: decodeValue(state.rpn.sum.x2),
          y: decodeValue(state.rpn.sum.y),
        }
      : fresh.sum,
    prgm: state.rpn.prgm
      ? { ...state.rpn.prgm, steps: [...state.rpn.prgm.steps] }
      : fresh.prgm,
    entry: state.rpn.entry,
    lift: state.rpn.lift,
    angle: state.rpn.angle,
    disp: { ...state.rpn.disp },
    hist: state.rpn.hist.map((h) => ({ ...h })),
  };
  const rpl: RplEngine = {
    ...createRpl(),
    stack: state.rpl.stack.map(decodeValue),
    entry: state.rpl.entry,
    angle: state.rpl.angle,
    disp: { ...state.rpl.disp },
    hist: state.rpl.hist.map((h) => ({ ...h })),
  };
  return { rpn, rpl, activeModel: state.activeModel };
}

// ---- parsing / migration -----------------------------------------------------

const isTagged = (v: unknown): v is TaggedValue =>
  typeof v === "object" &&
  v !== null &&
  (v as TaggedValue).t === "bn" &&
  typeof (v as TaggedValue).v === "string";

const ANGLES: readonly string[] = ["DEG", "RAD", "GRD"];

function isSerializedRpn(v: unknown): v is SerializedRpn {
  if (typeof v !== "object" || v === null) return false;
  const s = v as Partial<SerializedRpn>;
  return (
    isTagged(s.x) &&
    isTagged(s.y) &&
    isTagged(s.z) &&
    isTagged(s.t) &&
    isTagged(s.lastX) &&
    isTagged(s.mem) &&
    (s.regs === undefined || (Array.isArray(s.regs) && s.regs.every(isTagged))) &&
    (s.sum === undefined ||
      (isTagged(s.sum?.n) && isTagged(s.sum?.x) && isTagged(s.sum?.x2) && isTagged(s.sum?.y))) &&
    (s.prgm === undefined ||
      (typeof s.prgm === "object" &&
        s.prgm !== null &&
        Array.isArray(s.prgm.steps) &&
        s.prgm.steps.every((st) => typeof st === "string") &&
        (s.prgm.mode === "RUN" || s.prgm.mode === "PRGM"))) &&
    (s.entry === null || typeof s.entry === "string") &&
    typeof s.lift === "boolean" &&
    typeof s.angle === "string" &&
    ANGLES.includes(s.angle) &&
    Array.isArray(s.hist)
  );
}

function isSerializedRpl(v: unknown): v is SerializedRpl {
  if (typeof v !== "object" || v === null) return false;
  const s = v as Partial<SerializedRpl>;
  return (
    Array.isArray(s.stack) &&
    s.stack.every(isTagged) &&
    (s.entry === null || typeof s.entry === "string") &&
    typeof s.angle === "string" &&
    ANGLES.includes(s.angle) &&
    Array.isArray(s.hist)
  );
}

/**
 * Parse a persisted/imported JSON string to a validated EngineState, or null
 * (graceful degrade — the caller starts fresh rather than crashing on a
 * corrupt file or an unknown future version). Version migrations chain here
 * as the schema evolves; v1 is the only shape today.
 */
export function parseState(json: string): EngineStateV1 | null {
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    return null;
  }
  if (typeof raw !== "object" || raw === null) return null;
  const s = raw as Partial<EngineStateV1>;
  if (s.version !== STATE_VERSION) return null; // future: migrate older versions
  if (typeof s.activeModel !== "string") return null;
  if (!isSerializedRpn(s.rpn) || !isSerializedRpl(s.rpl)) return null;
  // decode must not throw on hand-edited value strings
  try {
    restore(s as EngineStateV1);
  } catch {
    return null;
  }
  return s as EngineStateV1;
}

// ---- storage seam --------------------------------------------------------------

/** Where a serialized state lives — localStorage in the app (src/lib/storage.ts),
 * memory in tests. The engine never touches the DOM. */
export interface StorageAdapter {
  load(): string | null;
  save(value: string): void;
  clear(): void;
}

export function memoryAdapter(): StorageAdapter {
  let store: string | null = null;
  return {
    load: () => store,
    save: (v) => {
      store = v;
    },
    clear: () => {
      store = null;
    },
  };
}
