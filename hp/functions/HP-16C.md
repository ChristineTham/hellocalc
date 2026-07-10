# HP-16C — Function Set

- **Access:** direct keys; f = gold; g = blue
- **Approx. count:** 90
- **Source:** HP-16C Computer Scientist Owner's Handbook, Function Summary and Index pp. 120–124 — hp/manuals/HP-16C.pdf

## Base/Word-size

| Function | Access | Description |
|----------|--------|-------------|
| HEX | key | set hexadecimal number base |
| DEC | key | set decimal (integer) number base |
| OCT | key | set octal number base |
| BIN | key | set binary number base |
| SHOW HEX | f | briefly show X in hexadecimal |
| SHOW DEC | f | briefly show X in decimal |
| SHOW OCT | f | briefly show X in octal |
| SHOW BIN | f | briefly show X in binary |
| SET COMPL 1's | f | set 1's-complement mode |
| SET COMPL 2's | f | set 2's-complement mode |
| SET COMPL UNSGN | f | set unsigned mode |
| WSIZE | f | set the operating word size in bits (1–64) |
| FLOAT | f | switch to Floating-Point Decimal mode |
| WINDOW | f | display an 8-digit segment of X (0–7) |
| < | g | scroll the display one digit left |
| > | g | scroll the display one digit right |
| STATUS | f | briefly show complement mode, word size, flags |

## Bitwise Logic

| Function | Access | Description |
|----------|--------|-------------|
| AND | f | bitwise AND of X and Y |
| OR | f | bitwise OR of X and Y |
| XOR | f | bitwise exclusive-OR of X and Y |
| NOT | g | bitwise complement of X |

## Shift/Rotate

| Function | Access | Description |
|----------|--------|-------------|
| SL | f | shift X left one bit (bit out to carry) |
| SR | f | shift X right one bit (bit out to carry) |
| ASR | g | arithmetic shift right, replicating the sign bit |
| RL | f | rotate X left one bit |
| RR | f | rotate X right one bit |
| RLn | f | rotate X left n bits |
| RRn | f | rotate X right n bits |
| RLC | g | rotate X left through the carry |
| RRC | g | rotate X right through the carry |
| RLCn | g | rotate X left n bits through the carry |
| RRCn | g | rotate X right n bits through the carry |
| LJ | g | left-justify the word, bit count returned in X |

## Bit operations

| Function | Access | Description |
|----------|--------|-------------|
| SB | f | set the specified bit to 1 |
| CB | f | clear the specified bit to 0 |
| B? | g | test whether the specified bit is set |
| #B | g | count the number of set bits in X |
| MASKL | f | create a left-justified mask of set bits |
| MASKR | f | create a right-justified mask of set bits |

## Arithmetic

| Function | Access | Description |
|----------|--------|-------------|
| + | key | add y and x |
| − | key | subtract x from y |
| × | key | multiply y by x |
| ÷ | key | divide y by x |
| CHS | key | change sign / return the complement of x |
| √x | g | square root of x |
| 1/x | g | reciprocal (Floating-Point mode only) |
| RMD | f | remainder, \|y\| MOD \|x\| |
| ABS | g | absolute value of x |
| DBL× | g | double-word multiply, product in X and Y |
| DBL÷ | g | double-word divide of a double-word dividend |
| DBLR | g | double-word remainder |
| EEX | f | enter exponent (Floating-Point mode only) |

## Stack/Register

| Function | Access | Description |
|----------|--------|-------------|
| ENTER | key | copy X into Y and separate number entries |
| x≷y | key | exchange X and Y registers |
| R↓ | key | roll the stack down |
| R↑ | g | roll the stack up |
| CLx | g | clear the X-register to zero |
| BSP | key | backspace last digit, or clear X |
| LSTx | g | recall the number before the last operation |
| x≷I | f | exchange X with the index register R_I |
| x≷(i) | f | exchange X with the register R_I points to |

## Memory

| Function | Access | Description |
|----------|--------|-------------|
| STO | key | store X into a register (0–F, I, or (i)) |
| RCL | key | recall a register into X (0–F, I, or (i)) |
| CLEAR REG | f | clear all data storage registers |
| MEM | f | show free program lines and available registers |

## Index Register Control

| Function | Access | Description |
|----------|--------|-------------|
| I | f | index register R_I for indirect use and loop control |
| (i) | f | indirect operations addressing register R_I points to |
| DSZ | g | decrement R_I, skip next line if zero |
| ISZ | g | increment R_I, skip next line if zero |

## Flags & Tests

| Function | Access | Description |
|----------|--------|-------------|
| SF | g | set a designated flag (0–5) |
| CF | g | clear a designated flag (0–5) |
| F? | g | test whether a designated flag is set |
| x≤y | g | conditional test x ≤ y |
| x<0 | g | conditional test x < 0 |
| x>y | g | conditional test x > y |
| x>0 | g | conditional test x > 0 |
| x≠y | g | conditional test x ≠ y |
| x≠0 | g | conditional test x ≠ 0 |
| x=y | g | conditional test x = y |
| x=0 | g | conditional test x = 0 |

## Programming

| Function | Access | Description |
|----------|--------|-------------|
| P/R | key | toggle Program and Run modes |
| LBL | g | mark the start of a program (labels 0–F) |
| GSB | key | call a labeled subroutine |
| GTO | key | branch program execution to a label |
| GTO . nnn | key | position calculator to a program line number |
| RTN | g | return from subroutine or halt at line 000 |
| R/S | key | run or stop program execution |
| SST | key | single-step forward through program lines |
| BST | g | back-step through program lines |
| PSE | g | pause briefly showing X during a program |
| CLEAR PRGM | f | clear program memory / reset to line 000 |

## Display/Mode

| Function | Access | Description |
|----------|--------|-------------|
| ON | key | turn display on/off; reset Continuous Memory |
| CLEAR PREFIX | f | cancel a prefix; briefly show full mantissa |
| f | key | select gold function above a key |
| g | key | select blue function below a key |
| . | key | decimal point (Floating-Point mode only) |
| A–F | key | hexadecimal digits (also program labels) |

## Notes
- Access: primary functions are pressed directly; f (gold) and g (blue) select the shifted legend above/below each key.
- SHOW is a gold bracket over HEX/DEC/OCT/BIN; SET COMPL is a gold bracket over 1's/2's/UNSGN; CLEAR is a gold bracket over PRGM/REG/PREFIX.
- Bit numbering runs from 0 (least significant) up to word size − 1; word size 1–64 is set with WSIZE.
- √x, 1/x and EEX operate only in Floating-Point Decimal mode; in Integer mode ÷ and √x drop the fractional part.
- Conditional tests and flag tests skip one program line when the comparison is false (or the flag is clear).
- Continuous Memory: 203 bytes shared between data registers (R0–R_F directly addressable) and program lines, auto-allocated in 7-line blocks.
