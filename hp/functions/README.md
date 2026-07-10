# HP Calculator Function Sets

Per-model catalogues of the built-in functions/commands each calculator supports,
extracted from the function-summary / operation-index pages of the scanned manuals in
[`../manuals/`](../manuals/). Each file lists functions grouped by category, with the
exact legend/name, how it's accessed (direct key, shift prefix, menu, or command name),
and a **concise paraphrased description** of what it does.

These are **factual reference tables** for emulator implementation — function names and
short summaries of behaviour. For full semantics, argument details, and worked examples,
consult the source manual cited at the top of each file. Cross-reference the physical
keys in [`../layouts/`](../layouts/).

## Index

| Model | Functions/commands | Source in manual | File |
|---|---:|---|---|
| HP-35 | ~24 | Operating Manual §1 | [HP-35](HP-35.md) |
| HP-45 | ~46 | Keyboard Summary & Index | [HP-45](HP-45.md) |
| HP-65 | ~70 | §2–4 + key figures | [HP-65](HP-65.md) |
| HP-25 | ~66 | Function Key Index pp.5–6 | [HP-25](HP-25.md) |
| HP-67 | ~95 | Function/Programming Key Index pp.8–13 | [HP-67](HP-67.md) |
| HP-97 | ~96 | Function/Programming Key Index pp.9–13 | [HP-97](HP-97.md) |
| HP-41C/CV | ~118 | Function Index pp.271–275 | [HP-41C-CV](HP-41C-CV.md) |
| HP-41CX | ~210 | Function Index pp.146–147 (+ CX Time/XFn additions) | [HP-41CX](HP-41CX.md) |
| HP-11C | ~92 | Function & Programming Key Index pp.245–250 | [HP-11C](HP-11C.md) |
| HP-12C | ~78 | Function & Programming Key Index pp.231–237 | [HP-12C](HP-12C.md) |
| HP-15C | ~105 | Function/Programming Summary pp.272–280 | [HP-15C](HP-15C.md) |
| HP-16C | ~90 | Function Summary pp.120–124 | [HP-16C](HP-16C.md) |
| HP-28C | ~304 | Menu Map pp.219–239 | [HP-28C](HP-28C.md) |
| HP-28S | ~311 | Menu Map pp.307–326 + Key Index | [HP-28S](HP-28S.md) |
| HP-42S | ~277 | Operation Index pp.310–335 | [HP-42S](HP-42S.md) |
| HP-48SX | ~230 | per-menu command tables (Owner's Manual) | [HP-48SX](HP-48SX.md) |
| HP-48G | ~300 (of ~450 ROM) | Appendix G Operation Index | [HP-48G](HP-48G.md) |
| HP-49G | ~330 | Advanced User's Guide (+ 50g cross-ref for CAS) | [HP-49G](HP-49G.md) |
| HP-50g | ~340 | Appendix N Index + command chapters | [HP-50g](HP-50g.md) |
| HP-35s | ~205 | Operation Index G-1..G-17 (incl. 41 constants) | [HP-35s](HP-35s.md) |
| HP Prime | ~290 | Functions & Commands chapter + menus | [HP-Prime](HP-Prime.md) |

*Counts are approximate legend/command tallies (digit keys 0–9 collapsed). The RPL/CAS
machines (28/48/49/50g/Prime) expose the largest sets; where a full ROM command
dictionary runs to many hundreds, the catalogue covers the documented built-in set and
notes any deliberate omissions (interactive/editor-only operations, exhaustive CAS
`Catlg` lists).*

## How the function surface evolves (for a shared engine)

- **Classic/Woodstock (35→25):** fixed scientific set — arithmetic, trig, log/exp, a few
  registers and (from the 45) statistics and conversions. No programming until the 65/25.
- **Programmables (65, 67/97, 41):** add labels, branches, tests, flags, subroutines. The
  **HP-41** is the inflection point — alphanumeric, named functions via `XEQ`, USER-mode
  key assignment, and a huge extensible catalogue (the **41CX** roughly doubles the 41C/CV
  set with Time, Extended Memory/Functions).
- **Voyager (11C/12C/15C/16C):** four specialised fixed sets on the same body — general
  scientific/programmable (11C), financial (12C), advanced scientific with complex/matrix/
  SOLVE/∫ (15C), and computer-science base/bitwise (16C).
- **RPL (28→50g):** object stack + hundreds of menu commands spanning symbolic algebra,
  calculus, matrices, lists, units, statistics, plotting, and full programming; the
  **49G/50g** add a CAS.
- **Modern (35s, Prime):** the 35s is a large fixed RPN/algebraic scientific set (with a
  physical-constants menu and equation solver); the **Prime** is a CAS graphing machine
  with distinct Home (numeric) and CAS (symbolic) command sets plus the HP PPL programming
  language.

The unified hellocalc engine can implement the superset; each emulated model then exposes
only its own catalogue (and its own keyboard from [`../layouts/`](../layouts/)).
