# HP-20b — Keyboard Layout

- **Display:** two-line dot-matrix LCD. The upper line shows a menu label / prompt / operator, the lower line shows the number being entered or the result. Contrast is adjustable. Annunciator area (top-right of the glass): `◄` (more-menu cursor) · `INPUT` · `BEG` · `RAD` · `360` · `RPN`, plus a `=` indicator. (Legend item 16, "Annunciator display area".)
- **Prefix/shift keys:** a single **secondary-function** key — a blank teal key at the far left of the bottom digit block (row 6, col 1). It is not a hold-down shift: press and release it, then press the target key; the down-arrow annunciator shows while it is armed. Each key's **secondary function is printed in blue on the bevel/lower face** of the key. In the manual the shift key is written as a leading `:` in keystroke sequences.
- **Logic / stack:** selectable **entry mode** via the Mode menu — **Chain** (default), **Algebraic** (operator precedence), and **RPN** (4-level stack + LAST number). In RPN the four stack levels are 1–4; `INPUT` (or `=`) pushes/duplicates, `(` performs roll-down, `)` performs swap; the `RPN` annunciator lights. In Chain/Algebraic the `(` `)` keys are ordinary parentheses and results carry through the entry line with `=` and LAST (`:` `=`/ANS).
- **Source:** *HP 20b Business Consultant Financial Calculator User's Guide* — "HP 20b Business Consultant Keyboard" faceplate photo + Keyboard Map Legend, p.6 (PDF p.6); "Key Presses and the Secondary Function Key", p.11; entry-mode & RPN-stack sections, pp.16–22 — hp/manuals/HP-20b.pdf

## Key grid (top row → bottom row, left → right)

Columns: **Primary** = white legend on the key top · **Shift** = blue legend on the key bevel (reached via the teal secondary key). Rows 1–2 are six keys wide; rows 3–7 are five keys wide (`INPUT` in row 3 is a double-width key). The four arithmetic operators `÷ × − +` run down the right-hand column of rows 4–7.

| Row | Primary | Shift (blue) | Notes |
|-----|---------|--------------|-------|
| 1 | N | ×P/YR | number of payments/periods; shift ×P/YR multiplies entry by P/YR and stores as N |
| 1 | I/YR | IConv | nominal annual interest rate; shift = Interest Conversion menu (Nom.%, Eff.%, C/YR) |
| 1 | PV | Beg | present value; shift Beg = payments at beginning of period |
| 1 | PMT | P/YR | periodic payment; shift = set payments per year (P/YR) |
| 1 | FV | End | future value; shift End = payments at end of period |
| 1 | Amort | Depr | Amortization menu; shift = Depreciation menu |
| 2 | CshFl | Data | Cash Flow list entry; shift = Data (statistics data-entry) menu |
| 2 | IRR | Stats | Internal Rate of Return menu; shift = Statistics results menu |
| 2 | NPV | BrkEv | Net Present Value menu; shift = Break-even menu |
| 2 | Bond | Date | Bond menu; shift = Date Calculation menu |
| 2 | % | % calc | percent (of / add / subtract); shift = Percent-Calculation (%calc) menu |
| 2 | RCL | STO | recall a memory/variable; shift = store (STO) |
| 3 | INPUT | Memory | enter value into current menu item / RPN push+duplicate; shift = Memory menu (Mem 0–9) — double-width key |
| 3 | ( | Mode | open parenthesis; in RPN rolls the stack **down** (small ↓ on the key); shift = Mode menu (settings) |
| 3 | ) | — | close parenthesis; in RPN **swaps** stack levels 1↔2 (small swap symbol on the key); no shift function |
| 3 | +/− | EEX | change sign; shift EEX = enter exponent (×10ⁿ, −499…+499) |
| 3 | ← | Reset | backspace / clear entry digit; shift = Reset menu |
| 4 | ▲ | INS | scroll up / previous menu item; shift = Insert (in a list) |
| 4 | 7 | SIN | shift = sine |
| 4 | 8 | COS | shift = cosine |
| 4 | 9 | TAN | shift = tangent |
| 4 | ÷ | Math | divide; shift = Math menu (Trig, Hyperbolic, Probability, PI) |
| 5 | ▼ | DEL | scroll down / next menu item; shift = Delete (in a list) |
| 5 | 4 | LN | shift = natural logarithm |
| 5 | 5 | eˣ | shift = natural exponential |
| 5 | 6 | x² | shift = square |
| 5 | × | √ | multiply; shift = square root |
| 6 | ■ (secondary key) | — | the blank teal secondary/shift key itself (no legend) |
| 6 | 1 | RAND | shift = random number 0<x<1 |
| 6 | 2 | ! | shift = factorial / Gamma |
| 6 | 3 | yˣ | shift = y to the x power |
| 6 | − | 1/x | subtract; shift = reciprocal |
| 7 | ON/CE | OFF | on / clear entry; shift = off |
| 7 | 0 | nPr | shift = permutations of n taken r |
| 7 | . | nCr | radix; shift = combinations of n taken r |
| 7 | = | ANS | evaluate (Chain/Alg) or enter/execute (RPN); shift = last answer / LAST number |
| 7 | + | RND | add; shift = round x to display format |

## Notes
- **Grid:** 7 rows. Rows 1–2 are 6 keys wide (the TVM row and the finance-menu row); rows 3–7 are 5 keys wide. The digit block (7-8-9 / 4-5-6 / 1-2-3 / 0-.-=) sits in columns 2–4 of rows 4–7; the arithmetic operators `÷ × − +` occupy the right-hand column of rows 4–7; the cursor keys `▲`/`▼`, the teal secondary key, and `ON/CE` fill the left-hand column of rows 4–7.
- **Single blue secondary key.** One blank teal key arms the blue (secondary) legend printed on each key's bevel; press-and-release, then press the target key. Blue legends: ×P/YR, IConv, Beg, P/YR, End, Depr, Data, Stats, BrkEv, Date, % calc, STO, Memory, Mode, EEX, Reset, INS, SIN, COS, TAN, Math, DEL, LN, eˣ, x², √, RAND, !, yˣ, 1/x, OFF, nPr, nCr, ANS, RND.
- **Three entry modes.** Set in the Mode menu (shift-`(`): **Chain** (left-to-right, the factory default), **Algebraic** (× ÷ before + −; powers and nCr/nPr highest), and **RPN** (numbers first, then operator; 4-level stack). In RPN the `(` and `)` keys become stack roll-down / swap, and `<`/`>` (the ▲/▼ menu keys) roll the stack down/up when no menu is open.
- **Menu-driven finance.** Most features live in nested menus opened by a key or shift-key: TVM (the five direct keys N, I/YR, PV, PMT, FV), Amort, Depr, IConv, CshFl, IRR, NPV, Bond, Date, BrkEv, %calc, Data, Stats, Math, Memory, Mode, Reset. Inside a menu, `▲`/`▼` scroll items, `INPUT` stores a typed value into the shown item, `=` solves the shown (unknown) item, and `ON/CE` exits.
- **TVM direct keys double as store/recall targets.** `STO`+TVM key stores; `RCL`+TVM key recalls without solving.
- **Uncertain cells:** none. All primary and secondary legends were read from the p.6 faceplate photo (rendered at 6×) and cross-checked against the manual's function tables. The `(`/`)` in-RPN roll-down/swap glyphs are confirmed in the text (pp.21–22), not guessed.
