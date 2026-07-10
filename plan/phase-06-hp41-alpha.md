# Phase 6 — Alphanumeric & named programs — HP-41C/CV

**Delivers:** HP-41C, HP-41CV · alphanumeric display, ALPHA mode/strings, XEQ named programs, USER key assignment, function catalog, expansion ports · **Era:** 1979–80 · **Builds on:** Phase 5 (+ Phase 3 program subsystem)

## Goal
Introduce the HP-41 subsystem: the first HP handheld with an **alphanumeric LCD** and
**named**, rather than purely positional, programs. This phase adds a **12-character display
model**, an **ALPHA register + string handling**, **name-addressed execution (`XEQ`)**,
**USER-mode key assignment (`ASN`)**, a browsable **function CATALOG**, and an
**expansion-port / module abstraction**. The 41CV is the 41C with more memory — same code,
larger default `SIZE`.

## Models delivered
- **HP-41C** (1979) — 12-char 14-segment alphanumeric LCD; ALPHA/USER/PRGM toggles; four I/O
  ports; ~64 registers by default. Faceplate per `hp/layouts/HP-41C-CV.md`, functions per
  `hp/functions/HP-41C-CV.md`.
- **HP-41CV** (1980) — identical faceplate and function set; five-times the built-in memory
  (~319 registers), no add-on quad module needed. Same adapter, larger memory config.

## Engine capabilities added
- **Alphanumeric display model:** a 12-character display buffer separate from the numeric X
  display; annunciators (USER, ALPHA, PRGM, RAD/GRAD, flags). Numeric values still render via
  the existing FIX/SCI/ENG formatter.
- **ALPHA register + strings (`AON`/`AOFF`, `CLA`, `ASTO`, `ARCL`, `AVIEW`, `ASHF`, `APPEND`):**
  a string value type usable by the engine; `ASTO`/`ARCL` bridge strings ↔ registers;
  `AVIEW` drives the display buffer.
- **Named programs / labels:** alpha labels (`LBL "NAME"`) and **`XEQ "NAME"`** name lookup
  layered over the Phase-3 program store; global `END`, `GTO "NAME"`, indirect `GTO IND`.
- **USER-mode key assignment (`ASN`):** a per-model keymap overlay stored in state; USER mode
  swaps assigned functions/programs onto keys (extends the Phase-5 adapter to accept an
  assignment overlay atop `hp/mapping`).
- **Function CATALOG (`CAT 1–3`):** enumerate programs / extension functions / built-ins from
  the model's function set for browse-and-run.
- **Loop/flag completeness:** `ISG`/`DSE` (skip-if-greater / skip-if-equal), user flags with
  `FS?`/`FC?`/`FS?C`/`FC?C`, `SIZE`, `CLRG`, register `ST+`/`ST-`/`ST*`/`ST/`.
- **Expansion-port abstraction:** a typed `Module` registry (ports 1–4) so later phases
  (Phase 11 time module, memory modules) plug in without touching core.

## PRD requirements covered
- **FR-PRG-2** — labels/GTO/tests/flags/loops (ISG/DSE)/subroutines on the HP-41 program model.
- **FR-PRG-4** — named programs and the assignment/catalog machinery that later grows into
  HP-48/50g directories/variables (first step here).
- Reinforces FR-PRG-1/3 (sandboxed interpreter), FR-STK-5 (string as a stack/register value),
  FR-MODEL-5 (alphanumeric display + annunciators).

## Key tasks
- **Engine:** string value type; ALPHA register + AVIEW/ASTO/ARCL/APPEND; name→label resolver
  for XEQ/GTO; ISG/DSE; FS?C/FC?C; SIZE/CLRG; register-arithmetic ops. Keep pure-TS.
- **Model adapter / data:** consume `hp/mapping/mapping.json` for HP-41 keyboard + gold shift;
  implement the USER-assignment overlay and CATALOG enumeration from `hp/functions/HP-41C-CV.md`;
  ALPHA keyboard mode maps each key to its ALPHA character (per layout's ALPHA column).
- **Faceplate / UI:** 12-char starburst LCD; ALPHA/USER/PRGM toggle row; ALPHA-mode keyboard
  overlay; ASN flow; CATALOG browser; four port slots (visual + module attach).
- **Tests:** engine unit tests + Playwright e2e (ALPHA entry, XEQ by name, ASN then USER key).

## New dependencies
None. Strings/labels build on math.js scope + the Phase-3 interpreter; module registry is
plain TS.

## Tests & acceptance (DoD)
- Engine unit tests incl. concrete HP reference examples:
  - `AON` type `HELLO` `ASTO 00` `CLA` `ARCL 00` `AVIEW` → display shows `HELLO`.
  - Program `LBL "SQ"` `X↑2` `RTN`; `XEQ "SQ"` on `7` → `49`.
  - `5 STO 00` `ISG 00` skips per counter-field semantics; `DSE` decrements/skips at equal.
- Faceplate e2e: enter ALPHA text; `ASN` a function to a key, toggle USER, press key → runs it;
  CATALOG 1 lists stored programs.
- Fidelity: keys/annunciators/ALPHA chars match `hp/layouts/HP-41C-CV.md` (SM-1).
- `pnpm lint`/`test`/`build`/`test:e2e` green.

## Notes / risks
- `GTO.`/`GTO..` are keyboard sequences (edit-pointer / new-program), not runnable functions —
  handle in the editor, not the interpreter.
- Several functions are "not programmable"/"not assignable" (SST, BST, CAT, ASN, DEL, PACK…);
  the interpreter and ASN overlay must honor those restrictions.
- The 41 ISG/DSE counter encoding (`ccccc.iiii` counter/increment/limit) differs from the 67's
  ISZ/DSZ — implement the 41 field format explicitly; don't reuse Phase-5 counters verbatim.
