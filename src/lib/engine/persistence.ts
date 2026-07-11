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
import type { RplObj } from "./rpl/object";
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

/** Recursive codec for RPL objects (P12). `{t:"bn"}` doubles as the real
 * object, so pre-P12 saves (plain number stacks) decode unchanged. */
export type TaggedObj =
  | TaggedValue
  | { t: "cpx"; re: number; im: number }
  | { t: "str"; v: string }
  | { t: "name"; v: string }
  | { t: "alg"; v: string }
  | { t: "prog"; v: string }
  | { t: "bin"; v: string }
  | { t: "list"; items: TaggedObj[] }
  | { t: "arr"; rows: number[][]; vec: boolean };

export function encodeObj(o: RplObj): TaggedObj {
  switch (o.k) {
    case "real":
      return { t: "bn", v: o.v.toString() };
    case "cpx":
      return { t: "cpx", re: o.re, im: o.im };
    case "str":
      return { t: "str", v: o.v };
    case "name":
      return { t: "name", v: o.v };
    case "alg":
      return { t: "alg", v: o.src };
    case "prog":
      return { t: "prog", v: o.body };
    case "bin":
      return { t: "bin", v: o.v.toString() };
    case "list":
      return { t: "list", items: o.items.map(encodeObj) };
    case "arr":
      return { t: "arr", rows: o.rows.map((r) => [...r]), vec: o.vec };
  }
}

export function decodeObj(t: TaggedObj): RplObj {
  switch (t.t) {
    case "bn":
      return { k: "real", v: bn(t.v) };
    case "cpx":
      return { k: "cpx", re: t.re, im: t.im };
    case "str":
      return { k: "str", v: t.v };
    case "name":
      return { k: "name", v: t.v };
    case "alg":
      return { k: "alg", src: t.v };
    case "prog":
      return { k: "prog", body: t.v };
    case "bin":
      return { k: "bin", v: BigInt(t.v) };
    case "list":
      return { k: "list", items: t.items.map(decodeObj) };
    case "arr":
      return { k: "arr", rows: t.rows.map((r) => [...r]), vec: t.vec };
  }
}

interface SerializedRpn {
  x: TaggedValue;
  y: TaggedValue;
  z: TaggedValue;
  t: TaggedValue;
  lastX: TaggedValue;
  mem: TaggedValue;
  /** optional for v1 forward-compat: pre-P2 saves have no registers/Σ */
  regs?: TaggedValue[];
  regsS?: TaggedValue[];
  iReg?: TaggedValue;
  sum?: {
    n: TaggedValue;
    x: TaggedValue;
    x2: TaggedValue;
    y: TaggedValue;
    y2?: TaggedValue;
    xy?: TaggedValue;
  };
  fin?: {
    n: TaggedValue;
    i: TaggedValue;
    pv: TaggedValue;
    pmt: TaggedValue;
    fv: TaggedValue;
    beg: boolean;
    dmy: boolean;
    cfs: { amt: string; count: number }[];
  };
  prgm?: PrgmState;
  alpha?: string;
  rng?: number;
  cpx?: boolean;
  imag?: { x: TaggedValue; y: TaggedValue; z: TaggedValue; t: TaggedValue };
  mats?: Record<string, number[][]>;
  matResult?: string;
  int?: {
    on: boolean;
    base: 2 | 8 | 10 | 16;
    ws: number;
    comp: "1S" | "2S" | "UNSGN";
    carry: boolean;
    oor: boolean;
  };
  userOn?: boolean;
  userAsn?: Record<string, string>;
  entry: string | null;
  lift: boolean;
  angle: Angle;
  disp: DisplayFormat;
  hist: HistEntry[];
}

interface SerializedRpl {
  stack: TaggedObj[];
  entry: string | null;
  angle: Angle;
  disp: DisplayFormat;
  hist: HistEntry[];
  /** P12 additions — optional so pre-P12 saves stay valid */
  vars?: Record<string, TaggedObj>;
  base?: 2 | 8 | 10 | 16;
  ws?: number;
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
      regsS: rpn.regsS.map(encodeValue),
      iReg: encodeValue(rpn.iReg),
      sum: {
        n: encodeValue(rpn.sum.n),
        x: encodeValue(rpn.sum.x),
        x2: encodeValue(rpn.sum.x2),
        y: encodeValue(rpn.sum.y),
        y2: encodeValue(rpn.sum.y2),
        xy: encodeValue(rpn.sum.xy),
      },
      fin: {
        n: encodeValue(rpn.fin.n),
        i: encodeValue(rpn.fin.i),
        pv: encodeValue(rpn.fin.pv),
        pmt: encodeValue(rpn.fin.pmt),
        fv: encodeValue(rpn.fin.fv),
        beg: rpn.fin.beg,
        dmy: rpn.fin.dmy,
        cfs: rpn.fin.cfs.map((c) => ({ ...c })),
      },
      prgm: { ...rpn.prgm, steps: [...rpn.prgm.steps] },
      alpha: rpn.alpha,
      rng: rpn.rng,
      cpx: rpn.cpx,
      imag: {
        x: encodeValue(rpn.imag.x),
        y: encodeValue(rpn.imag.y),
        z: encodeValue(rpn.imag.z),
        t: encodeValue(rpn.imag.t),
      },
      mats: Object.fromEntries(
        Object.entries(rpn.mats).map(([k, m]) => [k, m.map((r) => [...r])]),
      ),
      matResult: rpn.matResult,
      int: { ...rpn.int },
      userOn: rpn.userOn,
      userAsn: { ...rpn.userAsn },
      entry: rpn.entry,
      lift: rpn.lift,
      angle: rpn.angle,
      disp: { ...rpn.disp },
      hist: rpn.hist.map((h) => ({ ...h })),
    },
    rpl: {
      stack: rpl.stack.map(encodeObj),
      entry: rpl.entry,
      angle: rpl.angle,
      disp: { ...rpl.disp },
      hist: rpl.hist.map((h) => ({ ...h })),
      vars: Object.fromEntries(Object.entries(rpl.vars).map(([k, v]) => [k, encodeObj(v)])),
      base: rpl.base,
      ws: rpl.ws,
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
    regsS: state.rpn.regsS ? state.rpn.regsS.map(decodeValue) : fresh.regsS,
    iReg: state.rpn.iReg ? decodeValue(state.rpn.iReg) : fresh.iReg,
    sum: state.rpn.sum
      ? {
          n: decodeValue(state.rpn.sum.n),
          x: decodeValue(state.rpn.sum.x),
          x2: decodeValue(state.rpn.sum.x2),
          y: decodeValue(state.rpn.sum.y),
          y2: state.rpn.sum.y2 ? decodeValue(state.rpn.sum.y2) : fresh.sum.y2,
          xy: state.rpn.sum.xy ? decodeValue(state.rpn.sum.xy) : fresh.sum.xy,
        }
      : fresh.sum,
    fin: state.rpn.fin
      ? {
          n: decodeValue(state.rpn.fin.n),
          i: decodeValue(state.rpn.fin.i),
          pv: decodeValue(state.rpn.fin.pv),
          pmt: decodeValue(state.rpn.fin.pmt),
          fv: decodeValue(state.rpn.fin.fv),
          beg: state.rpn.fin.beg,
          dmy: state.rpn.fin.dmy,
          cfs: state.rpn.fin.cfs.map((c) => ({ ...c })),
        }
      : fresh.fin,
    prgm: state.rpn.prgm
      ? { ...state.rpn.prgm, steps: [...state.rpn.prgm.steps] }
      : fresh.prgm,
    alpha: state.rpn.alpha ?? "",
    rng: state.rpn.rng ?? 12345,
    cpx: state.rpn.cpx ?? false,
    imag: state.rpn.imag
      ? {
          x: decodeValue(state.rpn.imag.x),
          y: decodeValue(state.rpn.imag.y),
          z: decodeValue(state.rpn.imag.z),
          t: decodeValue(state.rpn.imag.t),
        }
      : fresh.imag,
    mats: state.rpn.mats
      ? Object.fromEntries(Object.entries(state.rpn.mats).map(([k, m]) => [k, m.map((r) => [...r])]))
      : {},
    matResult: state.rpn.matResult ?? "C",
    int: state.rpn.int ? { ...state.rpn.int } : fresh.int,
    userOn: state.rpn.userOn ?? false,
    userAsn: state.rpn.userAsn ? { ...state.rpn.userAsn } : {},
    entry: state.rpn.entry,
    lift: state.rpn.lift,
    angle: state.rpn.angle,
    disp: { ...state.rpn.disp },
    hist: state.rpn.hist.map((h) => ({ ...h })),
  };
  const freshR = createRpl();
  const rpl: RplEngine = {
    ...freshR,
    stack: state.rpl.stack.map(decodeObj),
    entry: state.rpl.entry,
    angle: state.rpl.angle,
    disp: { ...state.rpl.disp },
    hist: state.rpl.hist.map((h) => ({ ...h })),
    vars: state.rpl.vars
      ? Object.fromEntries(Object.entries(state.rpl.vars).map(([k, v]) => [k, decodeObj(v)]))
      : freshR.vars,
    base: state.rpl.base ?? freshR.base,
    ws: state.rpl.ws ?? freshR.ws,
  };
  return { rpn, rpl, activeModel: state.activeModel };
}

// ---- parsing / migration -----------------------------------------------------

const isTagged = (v: unknown): v is TaggedValue =>
  typeof v === "object" &&
  v !== null &&
  (v as TaggedValue).t === "bn" &&
  typeof (v as TaggedValue).v === "string";

function isTaggedObj(v: unknown): v is TaggedObj {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Partial<TaggedObj> & { t?: string };
  switch (o.t) {
    case "bn":
    case "str":
    case "name":
    case "alg":
    case "prog":
    case "bin":
      return typeof (o as { v?: unknown }).v === "string";
    case "cpx": {
      const c = o as { re?: unknown; im?: unknown };
      return typeof c.re === "number" && typeof c.im === "number";
    }
    case "list": {
      const l = o as { items?: unknown };
      return Array.isArray(l.items) && l.items.every(isTaggedObj);
    }
    case "arr": {
      const a = o as { rows?: unknown; vec?: unknown };
      return (
        Array.isArray(a.rows) &&
        a.rows.every((r) => Array.isArray(r) && r.every((n) => typeof n === "number")) &&
        typeof a.vec === "boolean"
      );
    }
    default:
      return false;
  }
}

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
    (s.regsS === undefined || (Array.isArray(s.regsS) && s.regsS.every(isTagged))) &&
    (s.iReg === undefined || isTagged(s.iReg)) &&
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
    s.stack.every(isTaggedObj) &&
    (s.vars === undefined ||
      (typeof s.vars === "object" &&
        s.vars !== null &&
        Object.values(s.vars).every(isTaggedObj))) &&
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
