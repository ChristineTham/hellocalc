# HP-41CX — Function Set

- **Access:** keyboard, gold-shift, and XEQ by name (ALPHA); USER-assignable keys; extra functions also via CATALOG/Alarm/Stopwatch/Text-editor keyboards
- **Approx. count:** 210
- **Source:** HP-41CX Owner's Manual Vol. 1, "Function Index" pp.146-147 (page refs also point to Vol. 2 Function Tables) — hp/manuals/HP-41CX.pdf

The CX includes the entire HP-41C/CV function set (see HP-41C-CV.md) plus the built-in Time module, Extended Functions/Extended Memory, alarms, a stopwatch, and a text editor. Shared functions are catalogued here for completeness; CX-only additions are grouped in the last five categories and flagged in the Notes.

## Arithmetic & General Math

| Function | Access | Description |
|----------|--------|-------------|
| + | key | add Y and X |
| - | key | subtract X from Y |
| × | key | multiply Y by X |
| ÷ | key | divide Y by X |
| 1/X | key | reciprocal of X |
| ABS | XEQ | absolute value of X |
| CHS | key | change sign of X |
| FACT | XEQ | factorial of X |
| INT | XEQ | integer portion of X |
| FRC | XEQ | fractional portion of X |
| MOD | XEQ | remainder of Y divided by X |
| RND | XEQ | round X to current display precision |
| SIGN | XEQ | sign of X (-1, 0, or 1) |
| X↑2 | gold (x²) | square of X |
| SQRT | key (√x) | square root of X |
| Y↑X | gold (y^x) | Y raised to the X power |
| PI | gold (π) | enter the constant pi |
| % | gold | X percent of Y |
| %CH | XEQ | percent change from Y to X |

## Logarithms & Exponentials

| Function | Access | Description |
|----------|--------|-------------|
| LN | key | natural logarithm of X |
| LN1+X | XEQ | natural log of (1+X), accurate near zero |
| LOG | key | common (base-10) logarithm of X |
| 10↑X | gold (10^x) | 10 raised to the X |
| E↑X | gold (e^x) | e raised to the X |
| E↑X-1 | XEQ | e^X minus 1, accurate near zero |

## Trigonometry & Angle

| Function | Access | Description |
|----------|--------|-------------|
| SIN | key | sine of X |
| COS | key | cosine of X |
| TAN | key | tangent of X |
| ASIN | gold (SIN⁻¹) | arc sine |
| ACOS | gold (COS⁻¹) | arc cosine |
| ATAN | gold (TAN⁻¹) | arc tangent |
| DEG | XEQ | select degrees angular mode |
| RAD | XEQ | select radians angular mode |
| GRAD | XEQ | select grads angular mode |
| D-R | XEQ | convert degrees to radians |
| R-D | XEQ | convert radians to degrees |

## Coordinate, HMS & Base Conversions

| Function | Access | Description |
|----------|--------|-------------|
| P-R | gold (P→R) | polar to rectangular conversion |
| R-P | gold (R→P) | rectangular to polar conversion |
| HMS | XEQ | decimal hours to hours.minutes-seconds |
| HR | XEQ | hours.minutes-seconds to decimal hours |
| HMS+ | XEQ | add two H.MMSS time values |
| HMS- | XEQ | subtract two H.MMSS time values |
| DEC | XEQ | octal to decimal conversion |
| OCT | XEQ | decimal to octal conversion |

## Stack Manipulation

| Function | Access | Description |
|----------|--------|-------------|
| ENTER↑ | key | copy X into Y and lift the stack |
| X<>Y | key (x≷y) | exchange X and Y |
| RDN | key (R↓) | roll the stack down |
| R↑ | XEQ | roll the stack up |
| X<> | XEQ | exchange X with a register (nn/indirect) |
| LASTX | gold | recall the LAST X value |
| CLX | gold (CLx) | clear the X register to zero |
| CLST | XEQ | clear the automatic stack |
| EEX | key | enter an exponent |

## Storage, Recall & Register Arithmetic

| Function | Access | Description |
|----------|--------|-------------|
| STO | key | store X into a register (nn/stack/indirect) |
| RCL | key | recall a register into X |
| ST+ | XEQ | add X to a register |
| ST- | XEQ | subtract X from a register |
| ST* | XEQ | multiply a register by X |
| ST/ | XEQ | divide a register by X |
| VIEW | gold | display a register's contents |
| CLRG | XEQ | clear all data registers |
| CLRGX | XEQ | clear a block of registers specified by X |
| REGMOVE | XEQ | copy a block of registers to another block |
| REGSWAP | XEQ | swap two blocks of registers |
| SIZE | XEQ | allocate the number of data registers |
| SIZE? | XEQ | recall the current register allocation |
| PSIZE | XEQ | set register allocation under program control |
| ΣREG | XEQ | set the first statistics register |
| ΣREG? | XEQ | recall the first statistics register number |

## Statistics

| Function | Access | Description |
|----------|--------|-------------|
| Σ+ | key | accumulate a statistics data point |
| Σ- | gold | remove a statistics data point |
| CLΣ | gold | clear the statistics registers |
| MEAN | XEQ | mean of accumulated data |
| SDEV | XEQ | standard deviation of accumulated data |

## Flags

| Function | Access | Description |
|----------|--------|-------------|
| SF | gold | set a flag (nn/indirect) |
| CF | gold | clear a flag (nn/indirect) |
| FS? | gold | test whether a flag is set |
| FC? | XEQ | test whether a flag is clear |
| FS?C | XEQ | test flag set, then clear it |
| FC?C | XEQ | test flag clear, then clear it |
| RCLFLAG | XEQ | recall flags 0-43 state into X |
| STOFLAG | XEQ | restore flag states from X |
| X<>F | XEQ | exchange X with the flag byte |

## Conditional Tests

| Function | Access | Description |
|----------|--------|-------------|
| X=0? | gold | skip next line unless X = 0 |
| X≠0? | XEQ | skip next line unless X ≠ 0 |
| X<0? | XEQ | skip next line unless X < 0 |
| X≤0? | XEQ | skip next line unless X ≤ 0 |
| X>0? | XEQ | skip next line unless X > 0 |
| X=Y? | gold | skip next line unless X = Y |
| X≠Y? | XEQ | skip next line unless X ≠ Y |
| X<Y? | XEQ | skip next line unless X < Y |
| X≤Y? | gold | skip next line unless X ≤ Y |
| X>Y? | gold | skip next line unless X > Y |
| X=NN? | XEQ | skip unless X equals register NN |
| X≠NN? | XEQ | skip unless X differs from register NN |
| X<NN? | XEQ | skip unless X less than register NN |
| X≤NN? | XEQ | skip unless X ≤ register NN |
| X>NN? | XEQ | skip unless X greater than register NN |
| X≥NN? | XEQ | skip unless X ≥ register NN |

## Program Control & Branching

| Function | Access | Description |
|----------|--------|-------------|
| XEQ | key | execute a program or function by label/name |
| GTO | gold | branch to a label (nn/name/indirect) |
| GTO. | key seq | move edit pointer to a line or label |
| GTO.. | key seq | clear pointer, start a new program |
| LBL | gold | define a program label |
| RTN | gold | return from a subroutine |
| END | XEQ | mark the end of a program |
| ISG | gold | increment counter, skip if greater |
| DSE | XEQ | decrement counter, skip if equal |
| R/S | key | run or stop a program |
| STOP | key (R/S) | stop program execution |
| SST | key | single-step through a program |
| BST | gold | back-step through a program |
| PSE | XEQ | pause about one second during a program |
| PROMPT | XEQ | show ALPHA and halt for input |
| DEL | XEQ | delete program-memory lines |
| CLP | XEQ | clear a named program |
| PCLPS | XEQ | delete a program and all following it |
| PACK | XEQ | pack program memory |
| COPY | XEQ | copy a named program into memory |
| PASN | XEQ | assign a function to a key under program control |

## ALPHA & String

| Function | Access | Description |
|----------|--------|-------------|
| AON | XEQ | turn ALPHA mode on |
| AOFF | XEQ | turn ALPHA mode off |
| CLA | XEQ | clear the ALPHA register |
| ARCL | XEQ | recall a register's value into ALPHA |
| ASTO | XEQ | store ALPHA characters into a register |
| AVIEW | XEQ | display the ALPHA register |
| ASHF | XEQ | shift ALPHA register left six characters |
| APPEND | key (⊢) | append text to ALPHA without clearing |
| ALENG | XEQ | length of the ALPHA string |
| ANUM | XEQ | extract the first number in ALPHA into X |
| AROT | XEQ | rotate the ALPHA string by X characters |
| ATOX | XEQ | remove first ALPHA char, put its code in X |
| XTOA | XEQ | append the character with code X to ALPHA |
| POSA | XEQ | find a character/substring in ALPHA, return position |

## Display, Format & Modes

| Function | Access | Description |
|----------|--------|-------------|
| FIX | gold | fixed-point display with n decimals |
| SCI | gold | scientific notation with n digits |
| ENG | gold | engineering notation with n digits |
| CLD | XEQ | clear the display |

## Catalog, Assignment & System

| Function | Access | Description |
|----------|--------|-------------|
| CAT | gold (CATALOG) | list a catalog (functions, programs, extended memory, etc.) |
| ASN | gold | assign a function to a USER key |
| CLKEYS | XEQ | clear all USER-key assignments |
| GETKEY | XEQ | wait for a keypress and return its key code |
| GETKEYX | XEQ | like GETKEY but with a timeout |
| ON | key | power the calculator on or off |
| OFF | XEQ | power the calculator off |
| BEEP | gold | sound the standard beep |
| TONE | XEQ | sound one of ten tones |
| ADV | XEQ | advance printer paper (if printer present) |

## Time & Clock [CX]

| Function | Access | Description |
|----------|--------|-------------|
| CLOCK | XEQ | display the running clock |
| CLKT | XEQ | set clock display to show time only |
| CLKTD | XEQ | set clock display to show time and date |
| CLK12 | XEQ | select 12-hour clock format |
| CLK24 | XEQ | select 24-hour clock format |
| MDY | XEQ | select month/day/year date format |
| DMY | XEQ | select day/month/year date format |
| SETDATE | XEQ | set the clock's date |
| SETIME | XEQ | set the clock's time |
| CORRECT | XEQ | adjust the running clock to the X value |
| T+X | XEQ | adjust the clock time by X |
| TIME | XEQ | recall the current time into X |
| DATE | XEQ | recall the current date into X |
| DATE+ | XEQ | add a number of days to a date |
| DDAYS | XEQ | number of days between two dates |
| DOW | XEQ | day of the week for a date |
| ADATE | XEQ | append the date to ALPHA |
| ATIME | XEQ | append the time to ALPHA |
| ATIME24 | XEQ | append the time (24-hour) to ALPHA |

## Alarms [CX]

| Function | Access | Description |
|----------|--------|-------------|
| XYZALM | XEQ | set an alarm from X/Y/Z (time, date, interval) plus ALPHA message |
| ALMCAT | XEQ | enter the alarm catalog |
| ALMNOW | XEQ | activate due alarms immediately |
| RCLALM | XEQ | recall an alarm's data |
| CLALMA | XEQ | clear the alarm matching the ALPHA message |
| CLALMX | XEQ | clear the alarm matching X (time) |
| CLRALMS | XEQ | clear all alarms |
| RCLAF | XEQ | recall the alarm flags |
| SETAF | XEQ | set the alarm flags |

## Stopwatch [CX]

| Function | Access | Description |
|----------|--------|-------------|
| SW | XEQ | enter/display the stopwatch |
| RUNSW | XEQ | start the stopwatch running |
| STOPSW | XEQ | stop the stopwatch |
| SETSW | XEQ | set the stopwatch to the X value |
| RCLSW | XEQ | recall the stopwatch value into X |
| SWPT | XEQ | set the stopwatch split-register pointer |

## Extended Memory, Files & Text Editor [CX]

| Function | Access | Description |
|----------|--------|-------------|
| EMDIR | XEQ | list the extended-memory directory |
| EMDIRX | XEQ | step through directory entries via X |
| EMROOM | XEQ | registers free in extended memory |
| ASROOM | XEQ | report register room available |
| CRFLD | XEQ | create a data file in extended memory |
| CRFLAS | XEQ | create an ASCII file in extended memory |
| PURFL | XEQ | purge (delete) a file |
| CLFL | XEQ | clear a file's contents |
| FLSIZE | XEQ | size of the current file in registers |
| RESZFL | XEQ | resize the current file |
| SEEKPT | XEQ | set the file pointer to a record/character |
| SEEKPTA | XEQ | search a file for ALPHA and set the pointer |
| RCLPT | XEQ | recall the current file pointer |
| RCLPTA | XEQ | recall the pointer of a named file |
| POSFL | XEQ | find ALPHA text in a file, return its position |
| SAVEAS | XEQ | write ALPHA text into an ASCII file record |
| SAVEP | XEQ | write a program to a file |
| SAVER | XEQ | write data registers to a file |
| SAVERX | XEQ | write registers to a file using X control |
| SAVEX | XEQ | write the X value to a file |
| GETAS | XEQ | read ASCII-file text into ALPHA |
| GETP | XEQ | read a program from a file into memory |
| GETR | XEQ | read data registers from a file |
| GETRX | XEQ | read registers from a file using X control |
| GETREC | XEQ | read the current file record |
| GETSUB | XEQ | read a subroutine/program from a file |
| GETX | XEQ | read one value from a file into X |
| APPCHR | XEQ | append characters to the current ASCII file |
| APPREC | XEQ | append a new record to the ASCII file |
| ARCLREC | XEQ | recall the current record into ALPHA |
| INSCHR | XEQ | insert characters into the current record |
| INSREC | XEQ | insert a new record |
| DELCHR | XEQ | delete characters from the current record |
| DELREC | XEQ | delete the current record |
| ED | XEQ | enter the text editor |

## Notes
- **CX adds over the HP-41C/CV** roughly 90 functions: the Time & Clock, Alarms, and Stopwatch groups (built-in Time module), the Extended Memory/Files/Text-editor group (built-in Extended Functions & Extended Memory), plus REGMOVE, REGSWAP, CLRGX, SIZE?, PSIZE, ΣREG?, RCLFLAG, STOFLAG, X<>F, PASN, PCLPS, CLKEYS, GETKEY, GETKEYX, ALENG, ANUM, AROT, ATOX, XTOA, POSA, R↑, and the X↔register test group (X=NN? … X≥NN?).
- The physical keyboard/faceplate is identical to the HP-41C/CV; all CX-only functions are reached by name (XEQ) or through the extra CATALOG/Alarm/Stopwatch/Text-editor keyboards, not new keys.
- The index (Vol. 1) lists each function's Alpha (display) name and, where one exists, its keyboard/gold legend; keyboard legends are shown in parentheses above.
- Full per-function detail lives in Vol. 2 (not in this PDF); a few Extended-Memory/file descriptions above (e.g. ASROOM, GETAS, GETRX) are concise inferences from the index page references and the file section.
- All function names in the index were legible; none marked [?].
</content>
