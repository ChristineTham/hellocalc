# HP-41C-CV — Keyboard Layout

- **Display:** alphanumeric LCD, 12-character 14-segment (starburst) with annunciators (USER, ALPHA, PRGM, SHIFT, BAT, G, RAD, etc.); shows numbers and text
- **Prefix/shift keys:** gold shift key (blank gold key, filled-square symbol) selects the gold function printed ABOVE each key; toggle keys ON, USER, PRGM, ALPHA sit in a row just below the display
- **Logic / stack:** RPN 4-level (X Y Z T) + LAST X
- **Expansion:** four I/O ports (application/memory modules, card reader, printer, etc.)
- **Source:** HP-41C/41CV Owner's Handbook — "Normal Mode Keyboard" p.12 (printed "6b"), "USER Mode Keyboard" p.10 (printed "6"), "ALPHA Keyboard" p.11 (printed "6a") — hp/manuals/HP-41C-CV.pdf

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
- **Toggle-key row (below display, left→right):** ON, USER, PRGM, ALPHA (each toggles its state; ON also powers off). The gold shift key, ON, USER, PRGM, ALPHA cannot be reassigned in USER mode.
- **ENTER↑** is a double-width key occupying the two leftmost columns of row 4.
- **USER mode:** functions on reassigned keys become active (ASN assigns); unreassigned keys keep their normal function. USER annunciator lights.
- **ALPHA mode:** each key produces the blue ALPHA character shown at its lower-right (transcribed above). Gold-shifted ALPHA characters/functions (from the ALPHA Keyboard figure) are: row 1 → a b c d e (lowercase); row 2 → Σ % ≠ < >; row 3 → APPEND (⊢), ASTO, ARCL, BST; row 4 → ↑, Δ, S, CLA; row 5–8 gold gives the symbols −,7,8,9 / +,4,5,6 / *,1,2,3 / /,0,.,AVIEW.
- **Display self-test text** shown in figures: `***HP-41C***` (ALPHA annunciator on).
- Faceplate legend: "HEWLETT·PACKARD 41C".
- All key legends were legible; none marked [?].
