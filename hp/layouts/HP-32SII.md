# HP-32SII — Keyboard Layout

- **Display:** single-line 12-character dot-matrix LCD (also shows single-line menus and an annunciator/menu-pointer row); adjustable contrast
- **Prefix/shift keys:** two shifts — **left-shift** (orange, annunciator ⤺) prints the function in orange above-left of each key; **right-shift** (blue, annunciator ⤻) prints the function in blue above-right (menu names on a dark background). No separate ALPHA key — letters A–Z (and `i`) are typed directly from lettered keys when the `A..Z` annunciator is on.
- **Logic / stack:** RPN 4-level (X Y Z T) + LAST X (adds algebraic-style equation entry, but the stack is RPN)
- **Source:** HP 32SII Owner's Manual, Edition 5 (1994) — hp/manuals/HP-32SII.pdf. **This manual contains NO labelled keyboard photo/diagram.** Primary legends are taken from the identical Pioneer chassis of the HP-32S (hp/manuals/HP-32S.pdf p. 2); each shifted function's **shift colour (orange `L` / blue `R`) is verified from the Operation Index** (PDF pp. 345–359), the "HP 32SII Menus" table (pp. 21–22) and the conversion pages (pp. 73–75); the Alpha-Keys figure (p. 18) confirms the √x key carries orange `x²` and the blue `PARTS` menu. **Physical key *positions* of functions that are new on the 32SII (not present on the 32S) are inferred and marked `[?]`.**

## Key grid (top row → bottom row, left → right)

Columns: **Primary** = face legend · **L-shift** = orange (above-left) · **R-shift** = blue (above-right) · **Letter** = variable/label letter at lower-right. `[?]` = position inferred (not shown in this manual).

| Row | Primary | L-shift (orange) | R-shift (blue) | Letter | Notes |
|-----|---------|------------------|----------------|--------|-------|
| 1 | √x | x² | PARTS | A | PARTS = parts-of-numbers menu (per Alpha-Keys figure) |
| 1 | eˣ | 10ˣ | — | B | |
| 1 | LN | LOG | — | C | |
| 1 | yˣ | ˣ√y | % | D | |
| 1 | 1/x | x! | %CHG | E | x! verified as "left-shifted 1/x" |
| 1 | Σ+ | Σ− | — | — | rightmost column; no letter |
| 2 | STO | CMPLX | — | G | (letter F not silkscreened — as on the 32S) |
| 2 | RCL | — | π | H | |
| 2 | R↓ | HYP | R↑ | I | |
| 2 | SIN | ASIN | — | J | |
| 2 | COS | ACOS | — | K | |
| 2 | TAN | ATAN | — | L | |
| 3 | ENTER | LAST x | — | M | wide key |
| 3 | x⇄y | — | x<> _var_ | N | printed x≷y |
| 3 | +/− | MODES | — | O | |
| 3 | E | DISP | — | P | exponent entry (EEX) |
| 3 | ← | CLEAR | SCRL `[?]` | — | backspace |
| 4 | XEQ | GTO | — | — | |
| 4 | 7 | →θ,r `[?]` | →y,x `[?]` | Q | rect↔polar (32S P↔RECT key) |
| 4 | 8 | →HR `[?]` | →HMS `[?]` | R | hours↔H.MMSS (32S H↔HMS key) |
| 4 | 9 | →DEG `[?]` | →RAD `[?]` | S | degrees↔radians (32S D↔RAD key) |
| 4 | ÷ | BASE | — | — | |
| 5 | ▼ `[?]` | ▲ `[?]` | — | — | left-column scroll area; ↑/↓ are left-shifted (positions uncertain) |
| 5 | 4 | LBL | RTN | T | 32S LBL/RTN key |
| 5 | 5 | ISG `[?]` | DSE `[?]` | U | 32S LOOP key |
| 5 | 6 | — `[?]` | FLAGS | V | 32S FLAGS key |
| 5 | × | x?y | x?0 | — | 32S TESTS key (now two test menus) |
| 6 | ◄ / ► (shift) | — | — | — | the orange & blue shift keys (bottom-left; exact split `[?]`) |
| 6 | 1 | ∫ `[?]` | SOLVE `[?]` | W | 32S SOLVE/∫ key |
| 6 | 2 | FN= `[?]` | EQN `[?]` | X | 32S STAT key (repurposed on the 32SII) |
| 6 | 3 | — `[?]` | PROB | Y | 32S PROB key |
| 6 | − | MEM | — | — | |
| 7 | C | — | OFF | — | ON printed below C; OFF blue (either shift works) |
| 7 | 0 | INPUT | — | Z | |
| 7 | . | FDISP `[?]` | SHOW | i | radix / index register i |
| 7 | R/S | PRGM | PSE `[?]` | (i) | run/stop; (i) = indirect via i |
| 7 | + | — | VIEW | — | |

### Shifted functions confirmed present but whose key position is NOT documented in this manual

The Operation Index fixes each of these functions' **shift colour** but not its physical key (no keyboard diagram exists in the manual). They are **not yet placed** in the grid above; do not treat their row/column as known:

- **Eight unit conversions** (new on the 32SII), as four orange/blue pairs sharing a key each: `→kg`(L)/`→lb`(R), `→°C`(L)/`→°F`(R), `→cm`(L)/`→in`(R), `→l`(L)/`→gal`(R).
- **Statistics menus** (blue right-shift): `x̄,ȳ`, `s,σ`, `L.R.`, `SUMS`.
- **/c** (L, fraction denominator), **RND** (L, round).

## Notes
- **Pioneer-series two-shift RPN scientific** (1991). Same physical chassis as the HP-32S/HP-42S; the single gold shift of the 32S is replaced by an orange left-shift and a blue right-shift, so most keys now carry three functions.
- **14 menus** live on 12 menu keys (a name on a dark background above the key): PARTS, PROB, L.R., x̄,ȳ, s,σ, SUMS, BASE, FLAGS, x?y, x?0, MEM, MODES, DISP, CLEAR. The × key carries two menus (x?y orange, x?0 blue). Menus display along the single line; the top keys act as softkeys; `C`/`←` cancel.
- **Stack:** classic 4-level RPN (X, Y, Z, T) with a LAST X register; R↓ rolls down, R↑ (blue) rolls up, x⇄y exchanges X and Y.
- **New vs HP-32S:** blue right-shift, algebraic-style **equation entry** (EQN, `(` `)`, SOLVE/∫ over stored equations), **fraction display** (FDISP, /c), and the eight metric/temperature unit conversions.
- **`[?]` cells** mark legends whose *shift colour and existence are confirmed from the manual's Operation Index* but whose *physical key position was inferred* from the shared 32S chassis (the Edition-5 manual has no labelled keyboard). They should be verified against a photographed 32SII faceplate before being treated as authoritative.
