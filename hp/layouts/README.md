# HP Calculator Keyboard Layouts

Per-model keyboard layouts transcribed from the scanned owner's handbooks / user guides
in [`../manuals/`](../manuals/). Each file gives the display characteristics, shift-key
scheme and colors, stack/logic model, and a positional key grid (rows top→bottom, keys
left→right) with every key's primary legend and shifted functions.

These are **factual reference tables** extracted for emulator implementation — key
legends, positions, colors, and functions. For the full descriptive text, illustrations,
and worked examples, see the source manual cited at the top of each file.

## Index

| Model | Gen / family | Display | Shift scheme | Stack / logic | Layout | Manual |
|---|---|---|---|---|---|---|
| HP-35 | Classic (1972) | 15-digit red LED | none | RPN 4-level | [HP-35](HP-35.md) | [pdf](../manuals/HP-35.pdf) |
| HP-45 | Classic (1973) | red LED | `f` gold | RPN 4-level | [HP-45](HP-45.md) | [pdf](../manuals/HP-45.pdf) |
| HP-65 | Classic (1974) | red LED | `f`/`f⁻¹` gold, `g` blue | RPN 4-level; card reader | [HP-65](HP-65.md) | [pdf](../manuals/HP-65.pdf) |
| HP-25 | Woodstock (1975) | red LED | `f` gold, `g` blue | RPN 4-level | [HP-25](HP-25.md) | [pdf](../manuals/HP-25.pdf) |
| HP-67 | 1976 programmable | red LED | `f` gold, `g` blue, `h` black | RPN 4-level; card reader | [HP-67](HP-67.md) | [pdf](../manuals/HP-67.pdf) |
| HP-97 | Topcat desktop (1976) | red LED + thermal printer | `f` gold only | RPN 4-level; card reader | [HP-97](HP-97.md) | [pdf](../manuals/HP-97.pdf) |
| HP-41C/CV | HP-41 (1979/80) | 12-char alphanumeric LCD | gold shift; USER/ALPHA/PRGM modes | RPN 4-level; 4 ports | [HP-41C-CV](HP-41C-CV.md) | [pdf](../manuals/HP-41C-CV.pdf) |
| HP-41CX | HP-41 (1983) | 12-char alphanumeric LCD | gold shift; USER/ALPHA/PRGM | RPN 4-level; Time + Ext Fns | [HP-41CX](HP-41CX.md) | [pdf](../manuals/HP-41CX.pdf) |
| HP-11C | Voyager (1981) | 7-seg LCD | `f` gold (above), `g` blue (lower face) | RPN 4-level | [HP-11C](HP-11C.md) | [pdf](../manuals/HP-11C.pdf) |
| HP-12C | Voyager (1981) | 7-seg LCD | `f` gold, `g` blue | RPN 4-level; financial | [HP-12C](HP-12C.md) | [pdf](../manuals/HP-12C.pdf) |
| HP-15C | Voyager (1982) | 7-seg LCD | `f` gold, `g` blue | RPN 4-level; complex/matrix/SOLVE/∫ | [HP-15C](HP-15C.md) | [pdf](../manuals/HP-15C.pdf) |
| HP-16C | Voyager (1982) | 7-seg LCD | `f` gold, `g` blue | RPN 4-level; base/bitwise | [HP-16C](HP-16C.md) | [pdf](../manuals/HP-16C.pdf) |
| HP-28C | Clamshell RPL (1986) | dot-matrix LCD | single red shift; two keypads | RPL dynamic stack | [HP-28C](HP-28C.md) | [pdf](../manuals/HP-28C.pdf) |
| HP-28S | Clamshell RPL (1988) | dot-matrix LCD | single red shift; two keypads | RPL dynamic stack | [HP-28S](HP-28S.md) | [pdf](../manuals/HP-28S.pdf) |
| HP-42S | Pioneer (1988) | 2-line dot-matrix LCD | single gold/orange shift; menu softkeys | RPN 4-level | [HP-42S](HP-42S.md) | [pdf](../manuals/HP-42S.pdf) |
| HP-48SX | RPL graphing (1990) | dot-matrix LCD | orange left / blue right / white ALPHA | RPL dynamic stack; softkeys | [HP-48SX](HP-48SX.md) | [pdf](../manuals/HP-48SX.pdf) |
| HP-48G | RPL graphing (1993) | 131×64 dot-matrix LCD | purple left / green right / white ALPHA | RPL dynamic stack; softkeys | [HP-48G](HP-48G.md) | [pdf](../manuals/HP-48G.pdf) |
| HP-49G | RPL graphing (1999) | 131×64 dot-matrix LCD | left / right / ALPHA (colors not in scan) | RPL + CAS; softkeys | [HP-49G](HP-49G.md) | [pdf](../manuals/HP-49G.pdf) |
| HP-50g | RPL graphing (2006) | 131×80 dot-matrix LCD | white left / orange right / ALPHA | RPL + CAS (RPN/ALG); softkeys | [HP-50g](HP-50g.md) | [pdf](../manuals/HP-50g.pdf) |
| HP-35s | Modern scientific (2007) | 2-line dot-matrix LCD | yellow left / blue right; ALPHA | RPN 4-level (ALG selectable) | [HP-35s](HP-35s.md) | [pdf](../manuals/HP-35s.pdf) |
| HP Prime | Modern graphing (2013) | 320×240 color touchscreen | blue Shift / orange ALPHA | RPN / algebraic / textbook | [HP-Prime](HP-Prime.md) | [pdf](../manuals/HP-Prime.pdf) |

## Cross-model notes for the emulator

- **Shift color is model-family-specific.** Voyager = gold `f` / blue `g`. HP-41 = single
  gold. Clamshell (28C/28S) = single red. Pioneer (42S) = single gold/orange. RPL graphing
  families each differ (48SX orange/blue, 48G purple/green, 50g white/orange). The engine
  can be shared, but the **key faceplate rendering must be per-model.**
- **Stack model splits two ways.** Classic/Voyager/Pioneer + 35s = fixed 4-level RPN
  (X/Y/Z/T) + LAST X. RPL machines (28/48/49/50g) = dynamic unlimited object stack. See
  [../README.md](../README.md) for the ENTER/lift/drop semantics.
- **Legend caveats.** A handful of cells are marked `[?]` where the scan was illegible even
  at high zoom (two HP-Prime shift legends; some undocumented HP-48G top-row cells that the
  User's Guide never fully illustrates). HP-49G's monochrome scan does not convey shift-key
  colors. Everything else was transcribed cleanly and cross-checked against each manual's
  function summary.
- **Where the keyboard diagrams live** (for future re-extraction): most are in the first
  ~25 pages, BUT the Voyager reference grids are on dedicated back-of-manual pages
  (HP-15C at PDF p.299, HP-16C at p.139), and the HP-12C diagram is on the inside back
  cover (PDF p.251).
