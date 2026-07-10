# HP-16C — Keyboard Layout

- **Display:** 7-segment LCD; up to 10 digits (8-digit window in Integer mode, scrollable with `<` / `>` / `WINDOW`). Base annunciator h / d / o / b at right; also C (carry), G (out-of-range), f, g, PRGM. Diagram shows `16C  h`.
- **Prefix/shift keys:** f = gold (above key), g = blue (lower key face)
- **Logic / stack:** RPN 4-level (X Y Z T) + LAST X
- **Source:** HP-16C Computer Scientist Owner's Handbook (Rev. D, 4/84), "The HP-16C Keyboard and Continuous Memory" reference page (PDF p.139) + Function Summary pp. 120–124 — hp/manuals/HP-16C.pdf

Legends within each cell are listed left → right, one per physical key, separated by ` · ` (position N in Primary / f / g refers to the same key). `—` = no legend on that key.

## Key grid (top row → bottom row, left → right)

| Row | Primary (white) | f-shift (gold) | g-shift (blue) | Notes |
|-----|-----------------|----------------|----------------|-------|
| 1 | A · B · C · D · E · F · 7 · 8 · 9 · ÷ | SL · SR · RL · RR · RLn · RRn · MASKL · MASKR · RMD · XOR | LJ · ASR · RLC · RRC · RLCn · RRCn · #B · ABS · DBLR · DBL÷ | A–F are hex digits (and program labels). Shift/rotate ops: SL/SR/RL/RR (± n, ± through-carry) |
| 2 | GSB · GTO · HEX · DEC · OCT · BIN · 4 · 5 · 6 · × | x≷(i) · x≷I · SHOW · SHOW · SHOW · SHOW · SB · CB · B? · AND | RTN · LBL · DSZ · ISZ · √x · 1/x · SF · CF · F? · DBL× | HEX/DEC/OCT/BIN set the number base; gold "SHOW" bracket spans those 4 keys (SHOW HEX/DEC/OCT/BIN). SB/CB/B? = set/clear/test bit |
| 3 | R/S · SST · R↓ · x≷y · BSP · ENTER · 1 · 2 · 3 · − | (i) · I · CLEAR PRGM · CLEAR REG · CLEAR PREFIX · WINDOW · 1'S · 2'S · UNSGN · NOT | P/R · BST · R↑ · PSE · CLx · LSTx · x≤y · x<0 · x>y · x>0 | ENTER is double-height (spans rows 3–4, position 6). Gold "CLEAR" bracket = PRGM/REG/PREFIX; gold "SET COMPL" bracket = 1'S/2'S/UNSGN. BSP = backspace |
| 4 | ON · f · g · STO · RCL · [ENTER↑] · 0 · . · CHS · + | — · — · — · WSIZE · FLOAT · — · MEM · STATUS · EEX · OR | — · — · — · < · > · — · x≠y · x≠0 · x=y · x=0 | Position 6 = lower half of the double-height ENTER key. g STO = `<`, g RCL = `>` (window scroll). f/g are the prefix keys; ON has no shifts |

## Notes
- Voyager convention: white = primary (press key), gold = f-shift (printed above key), blue = g-shift (printed on lower key face).
- Programmer's identity of the HP-16C: four number bases (HEX/DEC/OCT/BIN); 1's-complement / 2's-complement / Unsigned modes (`SET COMPL` = f 1 / f 2 / f 3); variable word size `WSIZE` (f STO, 1–64 bits); bitwise logic AND (f ×), OR (f +), XOR (f ÷), NOT (f −); bit ops set/clear/test SB/CB/B? (f 4/5/6) and #B bit-sum (g 7).
- Shift & rotate family (row 1): SL/SR (shift), RL/RR (rotate), RLn/RRn (rotate n), RLC/RRC (rotate through carry), RLCn/RRCn, ASR (arithmetic shift right), LJ (left-justify), MASKL/MASKR.
- Double-word arithmetic: DBL× (g ×), DBL÷ (g ÷), DBLR (g 9, double remainder); RMD (f 9) = remainder.
- Floating-point: `FLOAT` (f RCL) switches to Floating-Point Decimal mode; `WINDOW` (f ENTER) selects the 8-digit display segment.
- Conditional tests (program branching): g 1/2/3 = x≤y / x<0 / x>y; g 0/./CHS/+ = x≠y / x≠0 / x=y / x=0; flags SF/CF/F? (f/g on 4/5/6). `STATUS` (f .) shows complement mode, word size, flags.
- Index register `I` (f GTO) and indirect `(i)` (f R/S) for indirect addressing and loop control (DSZ/ISZ = g HEX / g DEC).
- Continuous Memory: 203 bytes total, initially all data-storage registers (R₀–R_F directly addressable; more via index register), auto-allocated to program memory in 7-line blocks. Index register R_I is not base-convertible.
