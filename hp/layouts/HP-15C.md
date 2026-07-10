# HP-15C — Keyboard Layout

- **Display:** 7-segment LCD; 10-digit mantissa with sign + 2-digit exponent (FIX / SCI / ENG). Diagram shows `1.234567-15`.
- **Prefix/shift keys:** f = gold (above key), g = blue (lower key face)
- **Logic / stack:** RPN 4-level (X Y Z T) + LAST X (a parallel imaginary stack appears in Complex mode)
- **Source:** HP-15C Owner's Handbook (Rev. G, Nov 1985), "The HP-15C Keyboard and Continuous Memory" reference page (PDF p.299) + Function/Programming Summary pp. 272–280 — hp/manuals/HP-15C.pdf

Legends within each cell are listed left → right, one per physical key, separated by ` · ` (position N in Primary / f / g refers to the same key). `—` = no legend on that key.

## Key grid (top row → bottom row, left → right)

| Row | Primary (white) | f-shift (gold) | g-shift (blue) | Notes |
|-----|-----------------|----------------|----------------|-------|
| 1 | √x · eˣ · 10ˣ · yˣ · 1/x · CHS · 7 · 8 · 9 · ÷ | A · B · C · D · E · MATRIX · FIX · SCI · ENG · SOLVE | x² · LN · LOG · % · Δ% · ABS · DEG · RAD · GRD · x≤y | A–E (gold) are program labels / matrix names; USER mode swaps them with the white functions on these 5 keys |
| 2 | SST · GTO · SIN · COS · TAN · EEX · 4 · 5 · 6 · × | LBL · HYP · DIM · (i) · I · RESULT · x≷ · DSE · ISG · ∫ˣy | BST · HYP⁻¹ · SIN⁻¹ · COS⁻¹ · TAN⁻¹ · π · SF · CF · F? · x=0 | f×=∫ (numerical integration); (i)=indirect index reg, I=index reg; x≷=x-exchange any register |
| 3 | R/S · GSB · R↓ · x≷y · ← · ENTER · 1 · 2 · 3 · − | PSE · CLEAR Σ · CLEAR PRGM · CLEAR REG · CLEAR PREFIX · RAN# · →R · →H.MS · →RAD · Re≷Im | P/R · RTN · R↑ · RND · CLx · LSTx · →P · →H · →DEG · TEST | ENTER is a double-height key (spans rows 3–4, position 6). Gold "CLEAR" bracket groups Σ/PRGM/REG/PREFIX. ← = backspace |
| 4 | ON · f · g · STO · RCL · [ENTER↑] · 0 · . · Σ+ · + | — · — · — · FRAC · USER · — · x! · ŷ,r · L.R. · Py,x | — · — · — · INT · MEM · — · x̄ · s · Σ− · Cy,x | Position 6 = lower half of the double-height ENTER key. f/g are the gold/blue prefix keys themselves; ON has no shifts |

## Notes
- Voyager convention: white = primary (press key), gold = f-shift (printed above key), blue = g-shift (printed on lower key face).
- Advanced-math identity of the HP-15C: complex numbers (SF 8 / g 8 activates Complex mode via the `I`/`(i)` keys and `Re≷Im`), matrices (`MATRIX`, `RESULT`, `DIM`, matrix names A–E), root finder `SOLVE` (f ÷), and numerical integration `∫ˣy` (f ×).
- Trig-mode keys: DEG (g 7), RAD (g 8), GRD (g 9). Hyperbolic via HYP (f GTO) / HYP⁻¹ (g GTO).
- Conditional tests: g ÷ = x≤y, g × = x=0; further tests via `TEST n` (g −).
- Statistics on bottom-right cluster: Σ+ / Σ− (g Σ+), mean x̄ (g 0), std dev s (g .), linear regression L.R. (f Σ+), linear estimate/correlation ŷ,r (f .), permutations Py,x (f +), combinations Cy,x (g +), factorial x! (f 0).
- Index register `I` (f TAN) and indirect `(i)` (f COS) drive indirect addressing, loop control (ISG/DSE), and complex-number entry.
- Continuous Memory: R₀–R₁₉ data storage by default; common pool R₂₀–R₆₅ shared by matrices, imaginary stack, SOLVE/∫, and program lines (7 bytes/register). Reallocate with `DIM (i)`.
