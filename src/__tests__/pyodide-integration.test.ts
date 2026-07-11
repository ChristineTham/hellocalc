import { describe, it, expect } from "vitest";

// OPT-IN integration test for the heavy CAS tier (P19): downloads the
// Pyodide WASM + sympy wheel from the CDN (~multi-MB, minutes on first
// run). Excluded from the normal gate — run with:  PYODIDE_IT=1 pnpm test
describe.skipIf(!process.env.PYODIDE_IT)("pyodide heavy CAS (opt-in, network)", () => {
  it("SymPy answers: diff, limit, partfrac", async () => {
    const { loadPyodideProvider } = await import("@/lib/engine/cas/pyodide-provider");
    const cas = await loadPyodideProvider();
    expect(cas.diff("X^2", "X")).toBe("2*X");
    expect(cas.limit("SIN(X)/X", "X", "0")).toBe("1");
    expect(cas.partfrac("1/(X^2+X)", "X")).toContain("1/X");
  }, 600_000);
});
