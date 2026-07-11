// src/lib/engine/numtheory.ts
// The 49G ARITH (number theory) family (P19) — pure TS on bigint, no CAS
// required: gcd/lcm by Euclid, deterministic Miller–Rabin below 3.3e24
// (covers every exact integer the tower displays), prime stepping, trial-
// division factoring with an HONEST bound, and Euler's totient.

const B0 = BigInt(0);
const B1 = BigInt(1);
const B2 = BigInt(2);

export function gcdBig(a: bigint, b: bigint): bigint {
  let x = a < B0 ? -a : a;
  let y = b < B0 ? -b : b;
  while (y !== B0) [x, y] = [y, x % y];
  return x;
}

export const lcmBig = (a: bigint, b: bigint): bigint =>
  a === B0 || b === B0 ? B0 : ((a < B0 ? -a : a) / gcdBig(a, b)) * (b < B0 ? -b : b);

function powMod(base: bigint, exp: bigint, mod: bigint): bigint {
  let result = B1;
  let b = base % mod;
  let e = exp;
  while (e > B0) {
    if (e & B1) result = (result * b) % mod;
    b = (b * b) % mod;
    e >>= B1;
  }
  return result;
}

/** Deterministic Miller–Rabin for n < 3.3·10²⁴ (fixed witness set). */
export function isPrimeBig(n: bigint): boolean {
  if (n < B2) return false;
  for (const p of [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37]) {
    const bp = BigInt(p);
    if (n === bp) return true;
    if (n % bp === B0) return false;
  }
  let d = n - B1;
  let r = 0;
  while ((d & B1) === B0) {
    d >>= B1;
    r++;
  }
  for (const a of [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37]) {
    let x = powMod(BigInt(a), d, n);
    if (x === B1 || x === n - B1) continue;
    let composite = true;
    for (let i = 0; i < r - 1; i++) {
      x = (x * x) % n;
      if (x === n - B1) {
        composite = false;
        break;
      }
    }
    if (composite) return false;
  }
  return true;
}

export function nextPrimeBig(n: bigint): bigint {
  let c = n < B2 ? B2 : n + B1;
  if (c > B2 && (c & B1) === B0) c += B1;
  while (!isPrimeBig(c)) c += c === B2 ? B1 : B2;
  return c;
}

/** Trial-division factorization; null when a cofactor exceeds the bound
 * (the caller reports honestly rather than hanging — NFR-9). */
export function factorsBig(n: bigint, limit = 1_000_000): Map<bigint, number> | null {
  const out = new Map<bigint, number>();
  let m = n < B0 ? -n : n;
  if (m < B2) return out;
  for (let p = B2; p * p <= m && p <= BigInt(limit); p += p === B2 ? B1 : B2) {
    while (m % p === B0) {
      out.set(p, (out.get(p) ?? 0) + 1);
      m /= p;
    }
  }
  if (m > B1) {
    if (m > BigInt(limit) * BigInt(limit) && !isPrimeBig(m)) return null;
    out.set(m, (out.get(m) ?? 0) + 1);
  }
  return out;
}

/** Euler's totient via the factorization (same honest bound). */
export function totientBig(n: bigint): bigint | null {
  const f = factorsBig(n);
  if (f === null) return null;
  let phi = n < B0 ? -n : n;
  for (const p of f.keys()) phi = (phi / p) * (p - B1);
  return phi;
}
