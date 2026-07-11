# Phase 13 — Units & dimensional analysis

**Delivers:** capability retrofit (HP-28C onward) · math.js units integrated into the value tower · **Era:** 1986 · **Builds on:** the live faceplate fleet + Phase 12 (RPL object stack) — retrofits the 28C, and every later RPL/Prime model that ships a UNITS system

## Goal
Add a **unit quantity** as a first-class value in the shared engine so `5 cm + 2 inches`
parses, auto-converts, and computes — and so dimensionally incompatible operations fail with a
clear error. This is a **capability retrofit, not a new model**: it wires math.js's built-in
dimensional tracking into the Phase-12 value tower and RPL object stack, then exposes it through
the **HP-28C UNITS catalog** (`hp/functions/HP-28C.md` notes UNITS is an interactive catalog,
not fixed command rows) and the `CONVERT` key — both already rendered, and inert, on the live
28C clamshell. The same unit quantity type is reused by every later model that has a units
library (HP-28S, HP-48SX/G, HP-49G, HP-50g, HP Prime).

## Models wired live
- **None new (retrofit).** The capability retrofits INTO the live **HP-28C** faceplate: the UNITS
  catalog + `CONVERT` (keyboard, shift-`,`) keys already render there (`hp/layouts/HP-28C.md`
  stays the fidelity reference), and later RPL/Prime models carry it forward. This phase lights
  up those inert affordances, completing the UNITS slice of `hp/functions/HP-28C.md`.

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
- **Wiring / UI:** activate the UNITS catalog menu (on the P12 softkey system) and the KaTeX
  display of quantities (e.g. `5\,\mathrm{cm}`); annunciate the active unit menu. No new keycaps.
- **Tests:** unit-arithmetic + conversion + dimensional-error unit tests; UNITS-catalog e2e on 28C.

## New dependencies
None — math.js units are already in the eager core (architecture §5). `js-quantities` stays a
documented fallback only, added later if math.js unit coverage proves insufficient (not now).

## Tests & acceptance (DoD)
- Engine unit tests incl. concrete reference examples:
  - `5 cm + 2 inches` → `10.08 cm` (auto-convert to left operand's unit; exact on BigNumber).
  - `CONVERT` of `100 km/h` to `m/s` → `27.7\overline{7}… m/s`; `UBASE` of `1 N` → `kg·m/s²`.
  - `3 m + 4 s` throws `DimensionError` (surfaced as a clear calculator error, not NaN).
- E2e on the live faceplate: on the 28C, open UNITS, build `5_cm`, add `2_in`, verify the KaTeX
  result and that an incompatible conversion shows the error line.
- **No 28C UNITS/CONVERT key remains inert** — every UNITS-catalog function in
  `hp/functions/HP-28C.md` resolves to an engine command.
- `pnpm lint` / `pnpm test` / `pnpm build` / `pnpm test:e2e` green; the existing UI suites
  (geometry, promotion, typing) stay green.

## Delivery notes (as shipped)
- Unit quantities are the RPL object `{ k: "unit", mag, u }` — exact BigNumber
  magnitude + a math.js unit EXPRESSION; `5_cm` normalizes at the parse
  boundary (src/lib/engine/rpl/parse.ts) and every op runs through
  `src/lib/engine/units.ts` (math.js dimensional tracking, BigNumber
  magnitudes end-to-end). TYPE reports 13, the HP-48 numbering.
- `+`/`−` keep the LEFT operand's unit; `×`/`÷` compose (dimensionless
  results collapse to reals); `^` raises; real×quantity scales; real+quantity
  throws — every incompatibility surfaces as the 28C's "Inconsistent Units"
  via a typed DimensionError, never NaN (FR-UNIT-2).
- CONVERT / →UNIT / UBASE / UVAL wired; **UFACT is simplified to full
  conversion** (true partial factoring deferred until the 48 unit library).
  Unit specs accept quantity, name, string, or quoted expression ('m/s^2'
  arrives as an algebraic — its source is the spec).
- The UNITS key opens a two-level catalog menu on the P12 softkey system
  (categories → units); a unit softkey ATTACHES on a real and CONVERTS on a
  quantity. Catalog names are math.js spellings (µm→um; cal/lm/lx/knot/nmi
  omitted until user-defined units land — FR-UNIT-4's `math.createUnit` seam
  is available but not yet wired to a keyboard affordance).
- Affine temperatures convert through math.js (degC↔degF verified); unit
  quantities serialize via the `{t:"unit"}` codec (FR-STATE-1); the KaTeX
  hero line typesets the top-of-stack quantity (AGENTS §3).

## Notes / risks
- HP `_`-unit syntax (`5_cm`) differs from math.js's `5 cm`; normalize at the parse boundary so the
  faceplate reads HP-native while the engine speaks math.js.
- Temperature is affine (offset) — `°C`↔`°F` conversion vs `ΔK` arithmetic must follow math.js's
  distinction; cover both in tests.
- Keep magnitudes on `BigNumber` end-to-end; a stray IEEE coercion inside a unit op would break the
  precision guarantee (architecture §4.1).
