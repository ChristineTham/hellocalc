# Phase 12 — RPL foundation & HP-28C

**Delivers:** HP-28C · dynamic unlimited object stack, RPL object types + evaluator, softkey menu system wired into the live clamshell · **Era:** 1986 · **Builds on:** the live faceplate fleet + prior phases (value tower P1, complex/matrix P9, integer/base P10, stats P8) — introduces the second stack model

## Goal
Introduce the **RPL stack model** — the engine's second stack machine alongside the fixed
4-level RPN of P1 — and make the live HP-28C behave like a 28C. The clamshell already renders
and is playable (merged two-half rows, `docs/responsive-layout.md` §14.5); this phase implements
the RPL object types, command set, and evaluator, and wires the softkey menu system (driven by
the `hp/` menu data) into that faceplate. Units and the light symbolic CAS that the 28C also
has are deliberately split out to **Phase 13** (units) and **Phase 14** (light CAS).

## Models wired live
- **HP-28C** (1986) — first RPL clamshell; the faceplate is already playable (left alpha/menu +
  right numeric halves, single red shift, dot-matrix RPL glass; `hp/layouts/HP-28C.md` stays the
  fidelity reference). This phase completes function coverage per `hp/functions/HP-28C.md`
  (RPL scope minus units/CAS, which arrive in P13/P14).

## Engine capabilities added
Formalizes architecture §6's dynamic stack and adds the RPL layer under `src/lib/engine/rpl/`:
- **Dynamic unlimited object stack** (`rpl/stack.ts`) — levels 1..n where `ENTER` pushes to level 1
  (the prototype `src/lib/engine/rpl.ts` already does this on JS numbers — port onto the value
  tower / object stack with reference tests); the model adapter selects it (vs the P1 4-level
  stack) per active model. State retained on model switch where compatible (FR-STATE-2).
- **RPL object types** (`rpl/object.ts`) — a discriminated union: real, complex (reuse P9), string,
  list, array/matrix (reuse P9), program `«…»`, algebraic `'…'`, and name; `TYPE` returns the type
  number. Objects can occupy any stack level (FR-STK-5).
- **RPL command set** — stack ops `DUP`/`DUP2`/`DUPN`/`DROP`/`DROP2`/`DROPN`/`SWAP`/`ROT`/`OVER`/
  `PICK`/`ROLL`/`ROLLD`/`DEPTH` (the prototype already dispatches `DUP`/`DROP`/`SWAP`/`CLEAR` +
  the arithmetic/trig set on JS numbers — port onto the object stack with reference tests);
  structure ops `→LIST`/`LIST→`/`GET`/`PUT`/`GETI`/`PUTI`/`SUB`/`SIZE`, `→ARRY`/`ARRY→`, `OBJ→`
  equivalents, and string ops `→STR`/`STR→`/`CHR`/`NUM`/`POS`.
- **RPL evaluator** (`rpl/eval.ts`) — `EVAL` executes programs/names/algebraics; the branch/loop
  constructs (`IF/THEN/ELSE/END`, `START/FOR/NEXT/STEP`, `DO/UNTIL`, `WHILE/REPEAT`, `IFT`/`IFTE`)
  run in the P3 sandboxed Web-Worker interpreter with step/time limits (NFR-9). `STO`/`RCL`/`PURGE`
  over named variables; `LAST`/`UNDO` argument recovery.
- **Softkey menu system** (`rpl/menu.ts`) — the 6-label menu row driven from the `hp/` menu map;
  a red-shift + letter key opens a menu (ARRAY, BINARY, STACK, STORE, TEST, REAL, LOGS, …); labels
  resolve to RPL commands, filling the glass's reserved label row and waking the inert soft keys.

## PRD requirements covered
- **FR-STK-2** — RPL-style dynamic unlimited object stack for the 28/48/49/50g family.
- **FR-STK-5** — stack objects may be any engine value (number, complex, matrix, string, list,
  program, algebraic, name).
- **FR-MODEL-1/2/3/4/5** — faithful clamshell faceplate; key+shift+softkey dispatch via `mapping.json`;
  only 28C functions exposed; runtime model switch with retained compatible state; menu-label row +
  annunciators.
- **FR-EXP-2** — named variables / session scope (RPL `STO`/`RCL`/`PURGE`).
- **FR-PRG-1/2/3** — RPL user programs `«…»` recorded/edited/run in the sandboxed interpreter.

## Key tasks
- **Engine:** `rpl/stack.ts` (dynamic stack), `rpl/object.ts` (typed object union + `TYPE`),
  `rpl/eval.ts` (evaluator + branch/loop on the P3 worker), `rpl/menu.ts` (menu resolution);
  RPL command registry (STACK/LIST/ARRAY/STRING/REAL/BINARY/COMPLEX from `hp/functions/HP-28C.md`,
  excluding UNITS→P13 and ALGEBRA/CAS→P14).
- **Model adapter / data:** teach the adapter to pick the RPL stack for RPL-family models,
  superseding the prototype `rpl.ts` dispatch; expose the 28C command set from
  `hp/functions/HP-28C.md`; drive the softkey menus from the menu map.
- **Wiring / UI:** the softkey MENU system — populate the reserved menu-label row on the RPL glass
  and make the 6 soft keys context-sensitive; menu navigation. Board, stack glass, and red-shift
  promotion are already live; the §14.5 stacked-halves phone refinement is optional polish.
- **Tests:** stack ops (DUP/ROLL/PICK/DEPTH), `→LIST`/`LIST→`, `OBJ→`, program `«…»` EVAL,
  branch/loop constructs, menu label→command resolution.

## New dependencies
None — RPL is built on the existing value tower and the P3 Web-Worker interpreter; no new package.

## Tests & acceptance (DoD)
- Engine unit tests incl. HP reference examples: `1 2 3 DEPTH` → `3`; `1 2 3 ROT` → `2 3 1`;
  `1 2 3 →LIST` (n=3) → `{ 1 2 3 }`, then `LIST→` restores `1 2 3` + count; `« 1 + » 4 SWAP EVAL`
  → `5`; a `1 5 FOR i i NEXT` loop leaves `1 2 3 4 5`.
- E2e on the live faceplate: on the clamshell, red-shift `G` opens the STACK menu; softkey `DUP`
  duplicates level 1; entering `'X+1'` (algebraic) and `4 'X' STO EVAL` pushes `5`; model-switch
  to a Voyager and back retains the stack where compatible.
- **No HP-28C key remains inert** — every function in `hp/functions/HP-28C.md` resolves to an
  engine command (UNITS and ALGEBRA/CAS keys excepted until P13/P14).
- `pnpm lint` / `pnpm test` / `pnpm build` / `pnpm test:e2e` green; the existing UI suites
  (geometry, promotion, typing) stay green.

## Notes / risks
- This is the second stack machine — keep the adapter's stack-mode selection clean so Voyager
  (4-level) and RPL (dynamic) models coexist and state migrates sensibly on switch (FR-STATE-2).
- Algebraic objects `'…'` are *entered and stored* here but only fully *evaluated symbolically*
  once the light CAS lands in P14; scope the 28C's ALGEBRA/CAS and UNITS menus out to P14/P13 to
  keep this phase bounded (README notes the split).
- The softkey menu system introduced here is reused by the 42S (P16) and 48/49/50g (P17–P20) —
  design `rpl/menu.ts` to be model-agnostic from the start.
