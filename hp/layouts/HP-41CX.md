# HP-41CX — Keyboard Layout

- **Display:** alphanumeric LCD, 12-character 14-segment (starburst) with annunciators (USER, ALPHA, PRGM, SHIFT, BAT, G, RAD, etc.); shows numbers and text
- **Prefix/shift keys:** gold shift key (blank gold key, filled-square symbol) selects the gold function printed ABOVE each key; four toggle keys ON, USER, PRGM, ALPHA sit in a row just below the display
- **Logic / stack:** RPN 4-level (X Y Z T) + LAST X
- **Expansion:** four I/O ports (application/memory modules, card reader, printer, etc.)
- **Source:** HP-41CX Owner's Manual, Volume 1 — Section 1 "Using the Keyboard": "The Alpha Keyboard" p.25; Normal keyboard described pp.14–16 (physical faceplate identical to HP-41C/CV) — hp/manuals/HP-41CX.pdf

## Key grid (top row → bottom row, left → right)

| Row | Primary legend | Gold-shift function | ALPHA char | Notes |
|-----|----------------|---------------------|------------|-------|
| 1 | Σ+ | Σ− | A | |
| 1 | 1/x | y^x | B | |
| 1 | √x | x² | C | |
| 1 | LOG | 10^x | D | |
| 1 | LN | e^x | E | |
| 2 | x≷y | CLΣ | F | |
| 2 | R↓ | % | G | |
| 2 | SIN | SIN⁻¹ | H | |
| 2 | COS | COS⁻¹ | I | |
| 2 | TAN | TAN⁻¹ | J | |
| 3 | (gold shift) | — | — | blank gold prefix key; not reassignable |
| 3 | XEQ | ASN | K | |
| 3 | STO | LBL | L | |
| 3 | RCL | GTO | M | |
| 3 | SST | BST | — | no ALPHA character (stays SST) |
| 4 | ENTER↑ | CATALOG | N | double-width key |
| 4 | CHS | ISG | O | |
| 4 | EEX | RTN | P | |
| 4 | ← | CL x/A | — | backspace / clear; no ALPHA character |
| 5 | − | x=y? | Q | |
| 5 | 7 | SF | R | |
| 5 | 8 | CF | S | |
| 5 | 9 | FS? | T | |
| 6 | + | x≤y? | U | |
| 6 | 4 | BEEP | V | |
| 6 | 5 | P→R | W | |
| 6 | 6 | R→P | X | |
| 7 | × | x>y? | Y | |
| 7 | 1 | FIX | Z | |
| 7 | 2 | SCI | = | ALPHA-mode shift of this key gives "=" |
| 7 | 3 | ENG | ? | |
| 8 | ÷ | x=0? | : | |
| 8 | 0 | π | SPACE | |
| 8 | • | LASTx | , | |
| 8 | R/S | VIEW | — | no ALPHA character |

## Notes
- **HP-41CX vs HP-41C/CV:** the physical keyboard/faceplate is identical (same 35 keys, same primary/gold/ALPHA legends). CX differences are internal — the Time module and Extended Functions/Memory are built in, plus six "keyboards" (Normal, User, Alpha, Alarm Catalog, Stopwatch, Text Editor). Those extra functions are reached via XEQ/catalogs, not new physical keys. Grid above transcribed from the CX Alpha Keyboard figure (p.25) and matches the CV Normal-mode faceplate.
- **Toggle-key row (below display, left→right):** ON, USER, PRGM, ALPHA. Manual calls these the four "toggle keys": power on/off, User keyboard, Program mode, Alpha keyboard. Shift/ON/USER/PRGM/ALPHA cannot be reassigned.
- **ENTER↑** is a double-width key occupying the two leftmost columns of row 4.
- **ALPHA mode:** each key produces the blue ALPHA character at its lower-right (transcribed above). Gold-shifted ALPHA characters/functions (from p.25 figure) are: row 1 → a b c d e (lowercase); row 2 → Σ % ≠ < >; row 3 → APPEND (⊢), ASTO, ARCL, BST; row 4 → ↑, Δ, S, CLA; row 5–8 gold gives −,7,8,9 / +,4,5,6 / *,1,2,3 / /,0,.,AVIEW.
- **Display self-test text** shown in figure: `***HP-41CX***` (ALPHA annunciator on).
- Faceplate legend: "HEWLETT PACKARD 41CX".
- All key legends were legible; none marked [?].
