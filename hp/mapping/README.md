# Master Key → Function Mapping

A single normalized mapping across **all 21 models**, joining each model's keyboard
layout to its function catalogue and the source manual. This is the implementation
reference: for any model, any physical key, and any prefix state, it gives the function
invoked, a short description, and where it's documented.

## Files

| File | Format | Use |
|---|---|---|
| [`mapping.csv`](mapping.csv) | long-form CSV, one row per press-mapping (2,323 rows) | grep/diff/spreadsheet; load into any language |
| [`mapping.json`](mapping.json) | nested by model → keys → presses | load directly in the emulator |
| [`build_mapping.py`](build_mapping.py) | generator script | regenerate both outputs after editing sources |
| this README | — | schema + caveats |

Regenerate both outputs from the source `.md` files:

```
cd hp && python3 mapping/build_mapping.py
```

It reads `layouts/*.md` + `functions/*.md` and rewrites `mapping.csv` and `mapping.json`.
Edit a layout or function file and re-run to refresh the mapping.

## CSV schema (`mapping.csv`)

One row = one **keystroke resolution** (a physical key pressed in a given prefix state).

| Column | Meaning |
|---|---|
| `model` | e.g. `HP-15C` |
| `keypad` | for two-keypad models (HP-28C/28S): `Left keypad` / `Right keypad`; else empty |
| `row` | physical keyboard row (top→bottom) as printed in the layout |
| `physical_key` | the key's primary (unshifted) legend — identifies the physical key |
| `access` | prefix state: `none`, `f`, `g`, `h`, `left`, `right`, `alpha`, `shift` |
| `prefix_color` | shift-key color for that prefix (`gold`, `blue`, `black`, `orange`, `purple`, `green`, `yellow`, `white`, `red`) where known |
| `function` | the function/command invoked by (physical_key + access) |
| `description` | concise paraphrased description (joined from the function catalogue; blank if no match — see caveats) |
| `keyboard_printed_page` | **printed** page(s) of the keyboard diagram / key description |
| `keyboard_pdf_page` | **PDF** page(s) of the keyboard diagram (as counted in the scanned file) |
| `function_printed_pages` | **printed** page(s) of the function index/summary where the function is listed |
| `function_pdf_pages` | **PDF** page(s) of the function index/summary |
| `manual_pdf` | path to the source PDF under `hp/manuals/` |

Page references are split into **printed** (the number printed on the paper page) and
**PDF** (the page number inside the scanned file) because the two differ by a cover/
front-matter offset in every manual — the emulator's citation UI can show whichever the
reader needs. A field is empty when the source cited only the other numbering.

**Keystroke reading:** a row with `physical_key=SIN, access=g, function=SIN⁻¹` means
**press `g` then `SIN`** to get arc-sine. `access=none` is the direct (unshifted) press.

## JSON schema (`mapping.json`)

```jsonc
{
  "HP-15C": {
    "keyboard_source":       "…full Source line from the layout file…",
    "function_source":       "…full Source line from the function catalogue…",
    "manual_pdf":            "hp/manuals/HP-15C.pdf",
    "keyboard_printed_page": "272–280",
    "keyboard_pdf_page":     "299",
    "function_printed_pages":"272–278; 278–280",
    "function_pdf_pages":    "",
    "keys": [
      {
        "row": "2",
        "keypad": null,
        "primary": "SIN",
        "presses": [
          { "access": "none", "prefix": "",  "function": "SIN",    "description": "sine of x" },
          { "access": "f",    "prefix": "f", "color": "gold", "function": "DIM",  "description": "dimension a named matrix (A–E, or via I)" },
          { "access": "g",    "prefix": "g", "color": "blue", "function": "SIN⁻¹","description": "arc sine of x" }
        ]
      }
    ]
  }
}
```

For the emulator: iterate `keys` to build the faceplate (each key's position + primary +
per-prefix labels), and use `presses[].function` to dispatch to the shared engine.

## Coverage

2,323 press-mappings across 21 models; **61% carry a description** (exact join 1,150 +
alias-normalized 34 + auto-filled digit/prefix keys 235). Every model resolved cleanly,
including the `·`-packed HP-15C/16C grids, the two-keypad HP-28C/28S, and the HP-45/65
`primary→shifted` arrow notation (HP-65's grid was normalized to standard f/g columns).
The remaining blanks are concentrated in the RPL/graphing models (48/49/50g/Prime), whose
menu and cursor keys have no single catalogue function — expected, not a gap.

## Caveats — read before relying on a field

1. **Page references are section-level, not per-function.** The manuals document
   functions in index/summary *tables* and a keyboard *diagram*, not one page per key.
   So the `keyboard_*` pages = where the keyboard is drawn/described, and the
   `function_*` pages = the function-index section for that model. Each is split into
   **printed** vs **PDF** numbering (they differ by a front-matter offset). All are
   best-effort parses of the layout / catalogue `Source:` lines; the **full source
   strings are preserved verbatim** in the JSON (`keyboard_source`, `function_source`) as
   the authoritative citation — check them when exact pages matter. Rendered-page tokens
   (`pNNN`) may land in the printed field.
2. **`description` is ~61% populated by join.** It's filled when the layout's function
   legend matches a name in the function catalogue after normalization (whitespace,
   Unicode super/subscripts like `⁻¹ ² ˣ`, and a symbol-alias table `√→sqrt`, `π→pi`,
   `×→*`, `÷→/`, …), plus auto-descriptions for digit/decimal/prefix keys. Remaining
   blanks are spelling/typography differences (menu-label vs command-name) or menu-only
   keys. When blank, the authoritative description is in
   [`../functions/<MODEL>.md`](../functions/) — the CSV is a join view, not a replacement.
3. **`function` for a prefixed press is the shifted legend itself** (that legend *is* the
   function name in HP manuals). A few cells are the prefix/mode keys themselves
   (`f`, `g`, `ON`, `USER`) — these are modifiers, not engine functions.
4. **RPL/graphing models (28/48/49/50g/Prime)** expose far more commands via menus than
   there are physical keys. This mapping covers the **physical keyboard** (primary + shift
   + ALPHA per key). The full command sets — including menu-only and CAS commands — live in
   [`../functions/`](../functions/); they are not all reachable by a single keystroke.
5. **A handful of `[?]`/inferred cells** from the layout stage (illegible scans) propagate
   here; they were dropped from press rows rather than guessed.

## Provenance

Derived mechanically from [`../layouts/`](../layouts/) (physical key grids) and
[`../functions/`](../functions/) (function catalogues), which were transcribed from the
manuals in [`../manuals/`](../manuals/). Factual reference data (key positions, legends,
function names, paraphrased descriptions, and manual citations) — not a reproduction of
manual text or artwork.
