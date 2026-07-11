# Phase 11 — HP-41CX

**Delivers:** HP-41CX · extended memory + file system, built-in time module (clock/date/alarms/stopwatch), extra register/flag functions · **Era:** 1983 · **Builds on:** Phase 6 (HP-41C/CV subsystem: alphanumeric display, ALPHA mode, XEQ-by-name, USER keys, catalog) — chronologically after the Voyagers (P8–P10)

## Goal
Deliver the HP-41CX by extending the Phase-6 HP-41 subsystem — not the value tower — with the
CX's three built-in modules: **Extended Functions/Extended Memory** (a register-backed file
system), the **Time module** (clock, calendar, alarms, stopwatch), and the extra register/flag
utility functions. The 41CX faceplate is already live (keyplate identical to the HP-41C/CV,
ALPHA promotion included), so almost everything is reached by `XEQ` name or the
CATALOG/Alarm/Stopwatch/Text-editor keyboards.

## Models wired live
- **HP-41CX** (1983) — top HP-41; adds Time module, Extended Functions/Memory, alarms, stopwatch,
  text editor over the 41CV. The faceplate is **already playable** (keyplate identical to the
  41C/CV, ALPHA promotion live) on the prototype engine; this phase completes its function set
  per `hp/functions/HP-41CX.md` (full 41C/CV set plus ~90 CX additions) so no key or XEQ name
  remains inert (fidelity reference: `hp/layouts/HP-41CX.md`).

## Engine capabilities added
Extends the HP-41 subsystem (P6) and adds a persistence-backed file layer:
- **Extended Memory & file system** (`src/lib/engine/hp41/extmem.ts`) — a directory of ASCII and
  data files over a register pool: `CRFLD`/`CRFLAS` (create), `PURFL`/`CLFL`, `EMDIR`/`EMDIRX`,
  `EMROOM`/`ASROOM`/`FLSIZE`/`RESZFL`; record/character pointer ops `SEEKPT`/`SEEKPTA`/`RCLPT`/
  `RCLPTA`/`POSFL`; read/write `SAVEX`/`GETX`, `SAVER`/`GETR`, `SAVERX`/`GETRX`, `SAVEP`/`GETP`/
  `GETSUB`, `SAVEAS`/`GETAS`, and ASCII-record editing (`APPREC`/`INSREC`/`DELREC`/`APPCHR`/
  `INSCHR`/`DELCHR`/`ARCLREC`/`GETREC`) plus the text editor `ED`.
- **Time module** (`src/lib/engine/hp41/time.ts`) — running `CLOCK` (12/24h, MDY/DMY), `TIME`/
  `DATE`, `SETIME`/`SETDATE`/`CORRECT`/`T+X`, date math `DATE+`/`DDAYS`/`DOW`, `ADATE`/`ATIME`;
  **alarms** `XYZALM`/`ALMCAT`/`ALMNOW`/`RCLALM`/`CLALMA`/`CLALMX`/`CLRALMS`/`RCLAF`/`SETAF`;
  **stopwatch** `SW`/`RUNSW`/`STOPSW`/`SETSW`/`RCLSW`/`SWPT`.
- **Extra register/flag utilities** — `REGMOVE`/`REGSWAP`/`CLRGX`, `SIZE?`/`PSIZE`, `ΣREG?`,
  `RCLFLAG`/`STOFLAG`/`X<>F`, the `X<>NN?`…`X≥NN?` register test group, `PASN`/`CLKEYS`,
  `GETKEY`/`GETKEYX`, and ALPHA-string ops `ALENG`/`ANUM`/`AROT`/`ATOX`/`XTOA`/`POSA`.

## PRD requirements covered
- **FR-PRG-4** — directories/variables for organizing programs and data (Extended Memory
  directory + file system, register-block move/swap).
- **FR-PRG-1/2** — the CX functions are recordable/runnable in the P3/P6 interpreter (XEQ by name,
  USER-key assignment via `PASN`/`ASN`).
- **FR-STATE-1/3** — Extended Memory, alarms, clock, and USER assignments persist across reloads
  (localStorage-backed) and belong to the saved workspace.
- **FR-MODEL-2/3/5** — CX functions dispatched via `mapping.json` (mostly XEQ-name, no new keys);
  only 41CX functions exposed; alphanumeric 12-char annunciator display.
- **NFR-5/10** — date-math correctness; all state local.

## Key tasks
- **Engine:** `hp41/extmem.ts` (file directory + record/pointer model over a register pool),
  `hp41/time.ts` (clock/calendar/alarm/stopwatch, deterministic clock source injectable for
  tests), register/flag utilities on the P6 HP-41 state; wire the `[CX]` groups from
  `hp/functions/HP-41CX.md` into the op registry.
- **Model adapter / data:** expose the full 41CX set (41C/CV base + CX additions) from
  `hp/functions/HP-41CX.md`; the faceplate mapping is the 41C/CV one (P6) — CX functions resolve
  by ALPHA name, not new keys.
- **Wiring / UI:** cover `hp/functions/HP-41CX.md` end-to-end on the live 41CX faceplate (CX
  functions resolve by ALPHA name — no new keys); new capability UI: CATALOG views for Extended
  Memory (CAT), the Alarm catalog (`ALMCAT`), stopwatch display, and the `ED` text editor.
- **Tests:** file create/write/read/seek/purge round-trips; `DDAYS`/`DOW`/`DATE+` date math;
  alarm set/recall/clear; register-block `REGMOVE`/`REGSWAP`; stopwatch split registers.

## New dependencies
None — Extended Memory is modeled over the existing register pool; the clock uses an injectable
time source (no new package).

## Tests & acceptance (DoD)
- Engine unit tests incl. HP reference examples: `CRFLAS` a file, `SAVEAS` "HELLO", `SEEKPT 0`,
  `GETAS` → "HELLO"; `DDAYS` between `4.152023` and `4.202023` (MDY) → `5`; `DOW` of a known date;
  `REGSWAP` two register blocks; alarm `XYZALM` then `RCLALM` round-trip.
- E2e on the live faceplate: `XEQ "EMDIR"` lists a created file; `XEQ "TIME"` pushes the (mocked)
  clock into X; `XEQ "SW"` / `RUNSW` / `STOPSW` shows a stopwatch value; USER-key assignment via
  `ASN` fires.
- **No HP-41CX key remains inert** — every function in `hp/functions/HP-41CX.md` resolves to an
  engine op (on-key or by ALPHA name).
- The existing UI suites (geometry, promotion, typing) stay green.
- `pnpm lint` / `pnpm test` / `pnpm build` / `pnpm test:e2e` green.

## Delivery notes (as shipped)
- Time module lands as the XEQ catalog (TIME → HH.MMSS, DATE, DOW, DDAYS,
  CLK12/24) on an injectable engine clock (`setClock`) — deterministic in
  tests, worker-safe, no direct Date use. XEQ resolves its catalog BEFORE
  the general id space, so CX names never collide with key ops (DATE).
- Extended memory (the XM file system) and alarms are deferred to the
  workspace/directory work (P20 territory) — XEQ of unimplemented names
  reports NONEXISTENT, the CX's own message.

## Notes / risks
- The CX faceplate is physically identical to the 41C/CV — fidelity is about the *function set*
  and CATALOG/editor keyboards, not new keys; keep dispatch data-driven from `hp/functions`.
- Alarms and the running clock imply a time source — inject it so tests are deterministic and the
  static export never depends on wall-clock timing at build time.
- Extended-Memory file semantics (records vs characters, ASCII vs data files) are subtle; a few
  index descriptions in `hp/functions/HP-41CX.md` are inferred — verify against the manual where
  behavior is load-bearing.
