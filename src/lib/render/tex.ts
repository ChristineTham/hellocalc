// src/lib/render/tex.ts
// The unified LaTeX pipeline (P14, FR-IO-1/FR-IO-3, AGENTS §3): every stack
// object funnels through objToTex → KaTeX. Algebraics use the CAS provider's
// LaTeX emitter when loaded (FR-CAS-6) and a safe verbatim form before then;
// numeric and unit objects typeset without any CAS. Pure TS — the React seam
// (react-katex / katex.renderToString) does the actual rendering.

import type { DisplayFormat } from "@/lib/engine/format";
import { formatValue } from "@/lib/engine/format";
import type { RplObj } from "@/lib/engine/rpl/object";
import { getCas } from "@/lib/engine/cas/provider";

const escapeTex = (s: string): string =>
  s.replace(/[\\{}_^%$&#]/g, (c) => `\\${c === "\\" ? "backslash " : c}`);

/** LaTeX for one RPL object (empty string = nothing to typeset). */
export function objToTex(o: RplObj, disp: DisplayFormat, base: number): string {
  switch (o.k) {
    case "real":
      return formatValue(o.v, disp).replace(/e([+-]?\d+)/, "\\times10^{$1}");
    case "unit":
      return `${formatValue(o.mag, disp)}\\,\\mathrm{${o.u.replace(/µ/g, "\\mu ")}}`;
    case "alg": {
      const cas = getCas();
      if (cas) {
        try {
          return cas.toLatex(o.src);
        } catch {
          // fall through to the verbatim form on emitter failure
        }
      }
      return `\\texttt{${escapeTex(o.src)}}`;
    }
    case "cpx":
      return `(${o.re},\\,${o.im})`;
    case "bin":
      return `\\#\\,\\mathtt{${o.v.toString(base).toUpperCase()}}`;
    default:
      return "";
  }
}
