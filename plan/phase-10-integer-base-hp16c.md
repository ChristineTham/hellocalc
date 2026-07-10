# Phase 10 — Integer & base arithmetic — HP-16C

**Delivers:** HP-16C · integer-mode arithmetic with word size, multi-base display, complement modes, bitwise/shift/rotate/bit ops · **Era:** 1982 · **Builds on:** Phase 9 (Voyager scientific-programmable faceplate) — plus stack machine (P1) and programmability (P3–P6)

## Goal
Deliver the HP-16C "Computer Scientist" by adding an **integer arithmetic mode** to the engine:
a bounded-word integer value type with configurable word size (1–64 bits), HEX/DEC/OCT/BIN
bases, three complement modes, and the full computer-science operation set (bitwise, shifts,
rotates, bit manipulation, masks) with carry/overflow flags — plus a Floating-Point mode that
falls back to the existing BigNumber tower.

## Models delivered
- **HP-16C** (1982) — Voyager computer-scientist calculator; f-gold/g-blue; toggles between
  Integer mode (HEX/DEC/OCT/BIN) and Floating-Point Decimal mode. Faceplate per
  `hp/layouts/HP-16C.md`, functions per `hp/functions/HP-16C.md`.

## Engine capabilities added
Extends architecture §3 value tower with a new integer domain (feature module
`src/lib/engine/integer.ts`):
- **Integer value type** — a signed/unsigned bounded integer (`BigInt`-backed) parameterized by
  **word size** (`WSIZE`, 1–64 bits) and **complement mode** (`SET COMPL 1's` / `2's` / `UNSGN`),
  with wrap-around and sign interpretation per mode.
- **Bases** — `HEX`/`DEC`/`OCT`/`BIN` set the active display base; `SHOW HEX/DEC/OCT/BIN` briefly
  render X in another base; A–F act as hex digits. `FLOAT` switches to Floating-Point Decimal mode
  (reuses the P1 BigNumber tower); `R→B`/`B→R`-style crossing between integer and float domains.
- **Bitwise logic** — `AND`, `OR`, `XOR`, `NOT`.
- **Shifts & rotates** — `SL`/`SR`, `ASR` (arithmetic), `RL`/`RR`, `RLn`/`RRn`, `RLC`/`RRC`
  (through carry), `RLCn`/`RRCn`, `LJ` (left-justify + bit count).
- **Bit operations** — `SB`/`CB`/`B?` (set/clear/test bit), `#B` (population count),
  `MASKL`/`MASKR` (left/right-justified masks).
- **Integer arithmetic** — `+ − × ÷` with truncation, `RMD` (remainder), double-word `DBL×`/`DBL÷`/
  `DBLR`, `CHS` returning the complement; **carry (C) and out-of-range (G) flags** maintained by
  each op and shown as annunciators.
- **Windowed display** — 8-digit window over long words, scrollable with `<`/`>`/`WINDOW`.

## PRD requirements covered
- **FR-NUM (integer/base extension)** — integer arithmetic mode with word size, HEX/DEC/OCT/BIN
  bases, and complement modes, complementing the BigNumber (FR-NUM-1) and IEEE (FR-NUM-2) types.
- **FR-NUM-5** — exact integers where the model supports them (bounded-word `BigInt`).
- **FR-NUM-7** — base/window display formats specific to Integer mode.
- **FR-MODEL-1/2/3/5** — faithful HP-16C faceplate; key+prefix dispatch via `mapping.json`; only
  HP-16C functions exposed; base annunciators (h/d/o/b), C/G carry/overflow, windowed LCD.
- **FR-PRG-1/2** — the computer-science ops are programmable via the existing P3 interpreter
  (LBL 0–F, GTO/GSB, `x≤y`/`x=0`/… tests, `DSZ`/`ISZ` on R_I).
- **NFR-5** — bit-exact results at each word size.

## Key tasks
- **Engine:** `integer.ts` (bounded `BigInt` value, word-size/complement config, base
  formatting, carry/overflow flags); op registry entries for bitwise/shift/rotate/bit/mask/
  double-word; `STATUS` reporting complement mode + word size + flags; float↔integer crossing.
- **Model adapter / data:** expose HP-16C set from `hp/functions/HP-16C.md`; map the `SHOW`,
  `SET COMPL`, and `CLEAR` gold brackets, `WSIZE`, `WINDOW`, `<`/`>` via `mapping.json`.
- **Faceplate / UI:** HP-16C faceplate from `hp/layouts/HP-16C.md`; base + C/G annunciators;
  windowed/scrollable integer display; A–F hex-digit keys.
- **Tests:** word-size wrap, 1's/2's/unsigned interpretation, every bitwise/shift/rotate op,
  masks, `#B`, double-word multiply/divide, carry/overflow propagation.

## New dependencies
None — bounded-word integers use native `BigInt`; no new package (architecture §5).

## Tests & acceptance (DoD)
- Engine unit tests incl. HP reference examples: `8 [WSIZE]`, `HEX`, `FF [ENTER] 01 +` → `00`
  with carry set; `2's` complement `CHS` of `1` in an 8-bit word → `FF`; `SL` of `0x80` sets
  carry; `MASKR 4` → `0x0F`; `#B` of `0xFF` → `8`.
- Faceplate e2e: `f WSIZE 8`, `BIN`, key `1010`, `f AND` with `1100` → `1000`; base toggle
  HEX→DEC updates the same X; `WINDOW`/`>` scrolls a 64-bit word.
- `pnpm lint` / `pnpm test` / `pnpm build` / `pnpm test:e2e` green; fidelity vs `hp/layouts/HP-16C.md`.

## Notes / risks
- Sign interpretation differs across the three complement modes — centralize it in `integer.ts`
  and test each mode's boundary (most-negative value, all-ones) explicitly.
- `√x`, `1/x`, `EEX`, and `.` operate only in Floating-Point mode; guard them out in Integer mode
  and route to the P1 tower when `FLOAT` is active.
- Continuous Memory shares 203 bytes between registers and program lines (7-line blocks) — model
  the auto-allocation (`MEM`) as on the real device.
