// src/lib/engine/rpl/object.ts
// The RPL object tower (P12, FR-STK-5): a discriminated union of every value
// that may occupy a stack level on the 28/48/49/50g family. Reals live on the
// BigNumber tower (exact decimals); complexes and array elements are float64
// like the P9 modules (≥ the hardware's 12 digits — documented trade-off).
// Programs and algebraics are stored as SOURCE TEXT and re-tokenized on EVAL,
// which keeps them trivially serializable and display-faithful.

import { bn, type Value } from "../config";
import { formatValue, type DisplayFormat } from "../format";

export type RplObj =
  | { k: "real"; v: Value }
  | { k: "cpx"; re: number; im: number }
  | { k: "str"; v: string }
  | { k: "list"; items: RplObj[] }
  /** real array; vec=true renders/behaves as a vector `[ 1 2 3 ]` */
  | { k: "arr"; rows: number[][]; vec: boolean }
  | { k: "prog"; body: string } // text between « »
  | { k: "alg"; src: string } // text between ' '
  | { k: "name"; v: string }
  | { k: "bin"; v: bigint } // # binary integer (unsigned word)
  /** unit quantity (P13): exact magnitude + a math.js unit expression */
  | { k: "unit"; mag: Value; u: string };

export const real = (v: Value): RplObj => ({ k: "real", v });
export const realN = (n: number | string): RplObj => real(bn(n));
export const str = (v: string): RplObj => ({ k: "str", v });
export const name = (v: string): RplObj => ({ k: "name", v });

/** The 28C's TYPE numbers (Owner's Manual: 0 real … 10 binary). */
export function typeNumber(o: RplObj): number {
  switch (o.k) {
    case "real":
      return 0;
    case "cpx":
      return 1;
    case "str":
      return 2;
    case "arr":
      return 3; // complex matrices (type 4) are handled via CMUL/CDET/CINV on
    // real+imag array pairs (FR-MAT-4), not a distinct stack object type
    case "list":
      return 5;
    case "name":
      return 6; // locals (7) never rest on the stack
    case "prog":
      return 8;
    case "alg":
      return 9;
    case "bin":
      return 10;
    case "unit":
      return 13; // the HP-48 numbering for unit objects
  }
}

const BASE_SUFFIX: Record<number, string> = { 16: "h", 8: "o", 2: "b", 10: "d" };

/** Format one float array element / complex part per the display mode. */
const fmtF = (n: number, disp: DisplayFormat): string =>
  formatValue(bn(Number.isFinite(n) ? String(n) : "0"), disp);

/** Display form of an object (the glass and the stack note). */
export function formatObj(o: RplObj, disp: DisplayFormat, base: number): string {
  switch (o.k) {
    case "real":
      return formatValue(o.v, disp);
    case "cpx":
      return `(${fmtF(o.re, disp)}, ${fmtF(o.im, disp)})`;
    case "str":
      return `"${o.v}"`;
    case "name":
      return `'${o.v}'`;
    case "alg":
      return `'${o.src}'`;
    case "prog":
      return `« ${o.body} »`;
    case "list":
      return `{ ${o.items.map((i) => formatObj(i, disp, base)).join(" ")} }`;
    case "arr":
      return o.vec
        ? `[ ${o.rows[0].map((n) => fmtF(n, disp)).join(" ")} ]`
        : `[[ ${o.rows.map((r) => r.map((n) => fmtF(n, disp)).join(" ")).join(" ][ ")} ]]`;
    case "bin":
      return `# ${o.v.toString(base).toUpperCase()}${BASE_SUFFIX[base]}`;
    case "unit":
      return `${formatValue(o.mag, disp)}_${o.u}`;
  }
}

/** Source form — what EDIT puts back into the command line. Numbers print
 * exactly (the tower is decimal), so edit round-trips are lossless. */
export function objToSrc(o: RplObj): string {
  switch (o.k) {
    case "real":
      return o.v.toString().toUpperCase();
    case "cpx":
      return `(${o.re},${o.im})`;
    case "str":
      return `"${o.v}"`;
    case "name":
      return `'${o.v}'`;
    case "alg":
      return `'${o.src}'`;
    case "prog":
      return `« ${o.body} »`;
    case "list":
      return `{ ${o.items.map(objToSrc).join(" ")} }`;
    case "arr":
      return o.vec
        ? `[ ${o.rows[0].join(" ")} ]`
        : `[ ${o.rows.map((r) => `[ ${r.join(" ")} ]`).join(" ")} ]`;
    case "bin":
      return `# ${o.v.toString(16).toUpperCase()}h`;
    case "unit":
      return `${o.mag.toString().toUpperCase()}_${o.u}`;
  }
}

/** SAME — structural identity, the 28C's object-equality test. */
export function sameObj(a: RplObj, b: RplObj): boolean {
  if (a.k !== b.k) return false;
  switch (a.k) {
    case "real":
      return a.v.eq((b as { v: Value }).v);
    case "cpx": {
      const c = b as { re: number; im: number };
      return a.re === c.re && a.im === c.im;
    }
    case "str":
    case "name":
      return a.v === (b as { v: string }).v;
    case "alg":
      return a.src === (b as { src: string }).src;
    case "prog":
      return a.body === (b as { body: string }).body;
    case "bin":
      return a.v === (b as { v: bigint }).v;
    case "list": {
      const c = b as { items: RplObj[] };
      return (
        a.items.length === c.items.length &&
        a.items.every((it, i) => sameObj(it, c.items[i]))
      );
    }
    case "arr": {
      const c = b as { rows: number[][] };
      return (
        a.rows.length === c.rows.length &&
        a.rows.every(
          (r, i) => r.length === c.rows[i].length && r.every((n, j) => n === c.rows[i][j]),
        )
      );
    }
    case "unit": {
      const c = b as { mag: Value; u: string };
      return a.u === c.u && a.mag.eq(c.mag);
    }
  }
}

/** Truthiness for THEN/UNTIL/REPEAT/IFT — reals: nonzero; anything else errors
 * upstream (the callers narrow to real first). */
export const isTrue = (o: RplObj): boolean => o.k === "real" && !o.v.isZero();
