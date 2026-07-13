# HP-18C — Function / Menu Map

- **Access:** menu-driven. The 6 softkeys select the MAIN-menu labels; each opens a sub-menu tree.
  Numeric functions live in the MATH menu; store/recall/percent/arithmetic are on the keyboard.
- **MAIN menu (6 labels):** **FIN · BUS · SUM · TIME · SOLVE · MATH**
- **Source:** HP-18C Business Consultant Owner's Manual, Appendix E "Menu Maps" (printed pp.201–205
  / PDF pp.203–207); chapter cross-refs per the table of contents — hp/manuals/HP-18C.pdf

Menu-map box conventions (Appendix E): a **rectangle** = variable used to store and/or calculate;
a **rounded box** = calculate/display only (cannot store); a **slanted box** = store only (cannot
calculate). Those distinctions are noted in the tables below where relevant.

## MAIN

| Item | Description |
|------|-------------|
| FIN | Financial: TVM, interest-rate conversions, cash flows |
| BUS | Business percentages: % change, % of total, markups |
| SUM | Running total / statistics on number lists |
| TIME | Clock, appointments/alarms, date arithmetic |
| SOLVE | Formula Solver — enter and solve your own formulas |
| MATH | Scientific math functions |

## FIN → TVM (Time Value of Money)

| Item | Kind | Description |
|------|------|-------------|
| N | store/calc | number of payments/periods |
| I%YR | store/calc | annual (nominal) interest rate |
| PV | store/calc | present value |
| PMT | store/calc | payment amount |
| FV | store/calc | future value |
| OTHER | submenu | opens payment-mode / amortization options |

### FIN → TVM → OTHER

| Item | Kind | Description |
|------|------|-------------|
| #P/Y | store | payments per year |
| BEG | mode | payments at beginning of period |
| END | mode | payments at end of period |
| AMRT | submenu | amortization |

### FIN → TVM → OTHER → AMRT (Amortization)

| Item | Kind | Description |
|------|------|-------------|
| #P | store/calc | number of payments to amortize |
| INT | calc | interest portion for the period |
| PRIN | calc | principal portion for the period |
| BAL | calc | remaining balance |
| NEXT | action | amortize the next block of payments |
| TABLE | action | print/produce an amortization table |

## FIN → ICONV (Interest-rate Conversions)

| Item | Description |
|------|-------------|
| EFFCT | periodic-compounding conversion submenu |
| CONT | continuous-compounding conversion submenu |

### FIN → ICONV → EFFCT

| Item | Kind | Description |
|------|------|-------------|
| NOM% | store/calc | nominal annual rate |
| EFF% | store/calc | effective annual rate |
| P | store-only | number of compounding periods per year |

### FIN → ICONV → CONT

| Item | Kind | Description |
|------|------|-------------|
| NOM% | store/calc | nominal annual rate (continuous) |
| EFF% | store/calc | effective annual rate (continuous) |

## FIN → CFLO (Cash Flows)

| Item | Description |
|------|-------------|
| CALC | compute results from the current cash-flow list |
| INSRT | insert a cash flow into the list |
| DELET | delete a cash flow from the list |
| NAME | name the current list |
| GET | switch lists (`*NEW` or a named list) |

### FIN → CFLO → CALC

| Item | Kind | Description |
|------|------|-------------|
| TOTAL | calc | sum of all cash flows |
| IRR% | calc | internal rate of return (%) |
| I% | store-only | periodic interest rate for NPV/NUS/NFV |
| NPV | calc | net present value |
| NUS | calc | net uniform series |
| NFV | calc | net future value |

### FIN → CFLO → GET

| Item | Description |
|------|-------------|
| *NEW | start a new (empty) list |
| (Names of Lists) | select an existing named list |

## BUS → %CHG (Percent Change)

| Item | Kind | Description |
|------|------|-------------|
| OLD | store/calc | base (old) value |
| NEW | store/calc | new value |
| %CH | store/calc | percent change |

## BUS → %TOTL (Percent of Total)

| Item | Kind | Description |
|------|------|-------------|
| TOTAL | store/calc | total value |
| PART | store/calc | part value |
| %T | store/calc | part as a percent of total |

## BUS → MU%C (Markup as % of Cost)

| Item | Kind | Description |
|------|------|-------------|
| COST | store/calc | cost |
| PRICE | store/calc | price |
| M%C | store/calc | markup as a percent of cost |

## BUS → MU%P (Markup as % of Price)

| Item | Kind | Description |
|------|------|-------------|
| COST | store/calc | cost |
| PRICE | store/calc | price |
| M%P | store/calc | markup as a percent of price |

## SUM (Running Total & Statistics)

| Item | Description |
|------|-------------|
| CALC | statistics on the current number list |
| INSRT | insert a number into the list |
| DELET | delete a number from the list |
| NAME | name the current list |
| GET | switch lists (`*NEW` or a named list) |

### SUM → CALC (page 1)

| Item | Kind | Description |
|------|------|-------------|
| TOTAL | calc | sum of the list |
| MEAN | calc | arithmetic mean |
| MEDN | calc | median |
| STDEV | calc | standard deviation |
| RANG | calc | range (max − min) |
| MORE | nav | next set of labels |

### SUM → CALC (page 2)

| Item | Kind | Description |
|------|------|-------------|
| MIN | calc | minimum value |
| MAX | calc | maximum value |
| SORT | action | sort the list |
| FRCST | submenu | curve fitting / forecasting |
| MORE | nav | previous set of labels |

### SUM → CALC → FRCST (Forecasting)

After selecting the X-variable list, choose a model, then use the variable menu:

| Item | Description |
|------|-------------|
| LIN | linear model |
| LOG | logarithmic model |
| EXP | exponential model |
| PWR | power model |
| XLIST | X-variable list |
| YLIST | Y-variable list |
| CORR | correlation coefficient |
| A | fitted coefficient a |
| B | fitted coefficient b |

## TIME → CALC (Date Arithmetic)

| Item | Kind | Description |
|------|------|-------------|
| DATE1 | store/calc | first date |
| DATE2 | store/calc | second date |
| DAYS | store/calc | number of days between dates |
| 360D | calc | days on a 360-day (30/360) basis |
| 365D | calc | days on a 365-day basis |
| TODAY | calc | today's date |

## TIME → APPT (Appointments / Alarms)

| Item | Description |
|------|-------------|
| APPT1…APPT6 | six appointment slots; each opens the appointment-detail menu below |

### TIME → APPT → APPTn

| Item | Kind | Description |
|------|------|-------------|
| DATE | store | appointment date |
| TIME | store | appointment time |
| A/PM | mode | AM/PM toggle |
| MSG | store | appointment message text |
| RPT | submenu | repeat interval |
| HELP | info | help/prompt |

### TIME → APPT → APPTn → RPT (Repeat)

| Item | Description |
|------|-------------|
| NONE | no repeat |
| MIN | repeat every n minutes |
| HR | repeat every n hours |
| DAY | repeat every n days |
| WEEK | repeat every n weeks |

## TIME → ADJST (Adjust Clock)

| Item | Description |
|------|-------------|
| +HR / −HR | adjust hours up/down |
| +MIN / −MIN | adjust minutes up/down |
| +SEC / −SEC | adjust seconds up/down |

## TIME → SET (Set Clock / Formats)

| Item | Kind | Description |
|------|------|-------------|
| DATE | store | set date |
| TIME | store | set time |
| A/PM | mode | AM/PM toggle |
| M/D | mode | month/day vs. day/month format |
| 12/24 | mode | 12- vs. 24-hour format |
| HELP | info | help/prompt |

## SOLVE (Formula Solver)

| Item | Description |
|------|-------------|
| CALC | display the custom variable menu for the current formula |
| EDIT | edit / view the current formula |
| DELET | delete the current formula and/or its user-variables |

`SOLVE → CALC` builds a **custom menu of the formula's user variables** (up to 6 labels per page,
with `MORE` to page through additional variables).

## MATH

| Item | Description |
|------|-------------|
| LOG | common (base-10) logarithm |
| 10^X | common antilogarithm |
| LN | natural logarithm |
| EXP | natural exponential (eˣ) |
| N! | factorial |
| PI | π constant |

## Keyboard / direct operations (not in the menu tree)

| Item | Access | Description |
|------|--------|-------------|
| + − × ÷ | keys | arithmetic operators (algebraic, in-line) |
| 1/x | shift+÷ | reciprocal |
| ^ | shift+× | raise to a power |
| √x | shift+− | square root |
| x² | shift++ | square |
| % | key | percent |
| +/− | key | change sign |
| E | shift++/− | enter power-of-ten exponent |
| ( ) | keys | parentheses for algebraic grouping |
| STO / RCL | keys | store / recall a value |
| DISP | key | set displayed decimal places / radix mark |
| PRNT / PRINTER | key / shift+PRNT | print value / open PRINTER menu |
| = / LAST | key / shift+= | evaluate the calculator line / recall last result |
| CLEAR | shift+◆ | clear the calculator line |
| CLEAR ALL | shift+INPUT | clear the history stack / display and memory |
| MAIN | shift+EXIT | return to the MAIN menu |
| EXIT | key | back up one menu level |
| INPUT | key | enter the calculator line into a calculation |
| ▲ / ▼ | keys | roll history stack / move the list pointer |
| ON | key | turn calculator on/off |

## Notes
- All six MAIN-menu labels and every Appendix-E menu-map label were legible; none required `[?]`.
- Box shapes in Appendix E encode variable usage (store/calc vs. calc-only vs. store-only); the
  "Kind" column above reflects those where the map showed a rounded (calc/display-only) or slanted
  (store-only) box.
- The HP-18C has **no CURRX (currency) menu** — the sixth MAIN label is **MATH**, not CURRX (CURRX
  was added on the later 17B/19B). There is likewise no dedicated UNITS menu.
- `GET` (in CFLO and SUM) lists `*NEW` plus the names of existing lists; `SOLVE → CALC` and the
  `FRCST` list selection produce context-dependent custom menus rather than fixed label rows.
