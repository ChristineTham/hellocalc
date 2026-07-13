// src/components/calculator/modelCatalog.ts
// The full catalogue of emulated models, grouped by family and ordered roughly
// by era, for the model picker. This lists ALL planned models (21 + native) so
// the picker UI scales; availability is computed from MODELS (which faceplates
// are actually implemented yet). Mirrors docs/prd.md §5 and hp/layouts/README.md.

export interface CatalogModel {
  id: string; // must match a MODELS key once implemented
  label: string; // display name
  year: string; // release year (or "—")
}

export interface CatalogGroup {
  family: string;
  models: CatalogModel[];
}

export const MODEL_CATALOG: CatalogGroup[] = [
  {
    family: "Classic",
    models: [
      { id: "HP-35", label: "HP-35", year: "1972" },
      { id: "HP-45", label: "HP-45", year: "1973" },
      { id: "HP-65", label: "HP-65", year: "1974" },
    ],
  },
  {
    family: "Woodstock",
    models: [{ id: "HP-25", label: "HP-25", year: "1975" }],
  },
  {
    family: "Programmable / desktop",
    models: [
      { id: "HP-67", label: "HP-67", year: "1976" },
      { id: "HP-97", label: "HP-97", year: "1976" },
    ],
  },
  {
    family: "HP-41 series",
    models: [
      { id: "HP-41C-CV", label: "HP-41C/CV", year: "1979" },
      { id: "HP-41CX", label: "HP-41CX", year: "1983" },
    ],
  },
  {
    family: "Voyager",
    models: [
      { id: "HP-11C", label: "HP-11C", year: "1981" },
      { id: "HP-12C", label: "HP-12C", year: "1981" },
      { id: "HP-15C", label: "HP-15C", year: "1982" },
      { id: "HP-16C", label: "HP-16C", year: "1982" },
    ],
  },
  {
    family: "RPL clamshell",
    models: [
      { id: "HP-28C", label: "HP-28C", year: "1986" },
      { id: "HP-28S", label: "HP-28S", year: "1988" },
    ],
  },
  {
    family: "Pioneer",
    models: [
      { id: "HP-20S", label: "HP-20S", year: "1988" },
      { id: "HP-27S", label: "HP-27S", year: "1988" },
      { id: "HP-32S", label: "HP-32S", year: "1988" },
      { id: "HP-42S", label: "HP-42S", year: "1988" },
      { id: "HP-32SII", label: "HP-32SII", year: "1991" },
    ],
  },
  {
    family: "Business / financial",
    models: [
      { id: "HP-18C", label: "HP-18C", year: "1986" },
      { id: "HP-17B", label: "HP-17B", year: "1988" },
      { id: "HP-17BII", label: "HP-17BII", year: "1990" },
      { id: "HP-19B", label: "HP-19B", year: "1988" },
      { id: "HP-19BII", label: "HP-19BII", year: "1990" },
      { id: "HP-12C-Platinum", label: "HP-12C Platinum", year: "2003" },
      { id: "HP-10BII", label: "HP-10BII", year: "2001" },
      { id: "HP-20b", label: "HP-20b", year: "2008" },
      { id: "HP-30b", label: "HP-30b", year: "2010" },
    ],
  },
  {
    family: "RPL graphing",
    models: [
      { id: "HP-48SX", label: "HP-48SX", year: "1990" },
      { id: "HP-48G", label: "HP-48G", year: "1993" },
      { id: "HP-48GX", label: "HP-48GX", year: "1993" },
      { id: "HP-49G", label: "HP-49G", year: "1999" },
      { id: "HP-50g", label: "HP-50g", year: "2006" },
    ],
  },
  {
    family: "Modern",
    models: [
      { id: "HP-35s", label: "HP-35s", year: "2007" },
      { id: "HP-Prime", label: "HP Prime", year: "2013" },
    ],
  },
  {
    family: "Native",
    models: [{ id: "native", label: "Native mode", year: "—" }],
  },
];

/** Flat lookup: id → { label, year, family }. */
export const CATALOG_INDEX: Record<string, { label: string; year: string; family: string }> =
  Object.fromEntries(
    MODEL_CATALOG.flatMap((g) =>
      g.models.map((m) => [m.id, { label: m.label, year: m.year, family: g.family }]),
    ),
  );
