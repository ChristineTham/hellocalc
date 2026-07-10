# Phase 13 — Units & dimensional analysis

**Delivers:** capability retrofit (HP-28C onward) · math.js units integrated into the value tower · **Era:** 1986 · **Builds on:** Phase 12 (RPL object stack) — retrofits the 28C, and every later RPL/Prime model that ships a UNITS system

## Goal
Add a **unit quantity** as a first-class value in the shared engine so `5 cm + 2 inches`
parses, auto-converts, and computes — and so dimensionally incompatible operations fail with a
clear error. This is a **capability retrofit, not a new model**: it wires math.js's built-in
dimensional tracking into the Phase-12 value tower and RPL object stack, then exposes it through
the **HP-28C UNITS catalog** (`hp/functions/HP-28C.md` notes UNITS is an interactive catalog,
not fixed command rows) and the `CONVERT` key. The same unit quantity type is reused by every
later model that has a units library (HP-28S, HP-48SX/G, HP-49G, HP-50g, HP Prime).

## Models delivered
- **None (retrofit).** No new faceplate ships this phase. The capability lands on the **HP-28C**
  UNITS catalog + `CONVERT` (keyboard, shift-`,`) delivered in Phase 12, and is carried forward
  by later RPL/Prime models. Faceplate/functions unchanged from `hp/layouts/HP-28C.md` /
  `hp/functions/HP-28C.md`; this phase only lights up the UNITS/CONVERT affordances already drawn.

## Engine capabilities added
Built on the Phase-12 object stack and the math.js core (already configured to `BigNumber`,
architecture §4.4 — math.js units are the default, js-quantities the fallback):
- **Unit-quantity value type** in the value tower (`src/lib/engine/units.ts`) wrapping math.js
  `Unit` over `BigNumber` magnitudes, so unit arithmetic keeps arbitrary precision. Registered as
  an RPL object type alongside real/complex/string/list/array (Phase 12, FR-STK-5).
- **Unit-aware parse/eval:** the parser accepts `5 cm`, `2 inch`, `9.81 m/s^2`; `+`/`−` auto-convert
  compatible operands (result in the left operand's unit), `×`/`÷`/`^` compose/derive units.
- **Conversion ops:** `CONVERT` (convert a quantity to a target unit), `→UNIT` (attach units to a
  number), `UBASE` (reduce to SI base units), `UFACT` (factor a unit out of a quantity), `UVAL`
  (strip the unit, return the number). Wired to the 28C UNITS catalog + the `CONVERT` key.
- **Dimensional-compatibility errors:** incompatible add/subtract/convert (e.g. `m + s`) throw a
  typed `DimensionError` surfaced as a calculator error, never a silent NaN.
- **Units catalog** (`src/lib/engine/units-catalog.ts`) — SI base + prefixes, imperial length/mass/
  volume, and common derived units (force, energy, power, pressure), organized to mirror the 28C
  UNITS submenus (LENG, AREA, VOL, TIME, MASS, FORCE, ENRG, POWR, PRESS, TEMP, ELEC, ANGL, LIGHT).
- **User-defined units** (FR-UNIT-4, C-priority): allow a named quantity to register as a unit
  alias in the session scope; kept minimal this phase, extended when the 48/50g unit library lands.

## PRD requirements covered
- **FR-UNIT-1 (M)** — parse & compute unit quantities; `5 cm + 2 inches` auto-converts.
- **FR-UNIT-2 (M)** — reject dimensionally incompatible operations with a clear error.
- **FR-UNIT-3 (S)** — unit-conversion command + a catalog of SI / imperial / common derived units.
- **FR-UNIT-4 (C)** — user-defined units (minimal seam this phase).
- Reinforces **FR-STK-5** (unit quantities are valid stack objects) and **FR-STATE-1** (unit
  quantities serialize into persisted stack/variable state).

## Key tasks
- **Engine:** `units.ts` unit-quantity type over math.js `Unit`+`BigNumber`; unit-aware operators
  in the eval path; `CONVERT`/`→UNIT`/`UBASE`/`UFACT`/`UVAL` ops; `DimensionError`; `units-catalog.ts`.
- **Model adapter / data:** expose the 28C UNITS catalog + `CONVERT` from `hp/functions/HP-28C.md`
  via `hp/mapping/mapping.json`; map catalog softkeys to unit constructors (no hand-authored maps).
- **Faceplate / UI:** activate the UNITS catalog menu and the KaTeX display of quantities
  (e.g. `5\,\mathrm{cm}`); annunciate the active unit menu. No new keycaps.
- **Tests:** unit-arithmetic + conversion + dimensional-error unit tests; UNITS-catalog e2e on 28C.

## New dependencies
None — math.js units are already in the eager core (architecture §5). `js-quantities` stays a
documented fallback only, added later if math.js unit coverage proves insufficient (not now).

## Tests & acceptance (DoD)
- Engine unit tests incl. concrete reference examples:
  - `5 cm + 2 inches` → `10.08 cm` (auto-convert to left operand's unit; exact on BigNumber).
  - `CONVERT` of `100 km/h` to `m/s` → `27.7\overline{7}… m/s`; `UBASE` of `1 N` → `kg·m/s²`.
  - `3 m + 4 s` throws `DimensionError` (surfaced as a clear calculator error, not NaN).
- Faceplate/UI e2e: on the 28C, open UNITS, build `5_cm`, add `2_in`, verify the KaTeX result and
  that an incompatible conversion shows the error line.
- `pnpm lint` / `pnpm test` / `pnpm build` / `pnpm test:e2e` green; UNITS/CONVERT affordances match
  `hp/layouts/HP-28C.md`.

## Notes / risks
- HP `_`-unit syntax (`5_cm`) differs from math.js's `5 cm`; normalize at the parse boundary so the
  faceplate reads HP-native while the engine speaks math.js.
- Temperature is affine (offset) — `°C`↔`°F` conversion vs `ΔK` arithmetic must follow math.js's
  distinction; cover both in tests.
- Keep magnitudes on `BigNumber` end-to-end; a stray IEEE coercion inside a unit op would break the
  precision guarantee (architecture §4.1).
