// src/lib/engine/units-catalog.ts
// The UNITS catalog (P13, FR-UNIT-3), organized to mirror the HP-28C UNITS
// submenus (hp/functions/HP-28C.md: an interactive catalog, not fixed command
// rows). Every name is a math.js-valid unit expression — a unit test walks
// the whole catalog through math.unit() so this stays true. Names the 28C
// prints but math.js lacks (µm, cal, lm, lx, knot) use the math.js spelling
// or are omitted; user-defined units (FR-UNIT-4) can fill gaps later via
// math.createUnit.

export const UNIT_CATEGORIES = [
  "LENG", "AREA", "VOL", "TIME", "SPEED", "MASS", "FORCE",
  "ENRG", "POWR", "PRESS", "TEMP", "ELEC", "ANGL", "LIGHT",
] as const;

export const UNIT_MENUS: Record<string, string[]> = {
  LENG: ["m", "cm", "mm", "km", "um", "in", "ft", "yd", "mi"],
  AREA: ["m^2", "cm^2", "km^2", "in^2", "ft^2", "acre", "hectare"],
  VOL: ["m^3", "cm^3", "l", "ml", "gal", "qt", "pt", "cup", "floz"],
  TIME: ["s", "ms", "min", "h", "day", "week", "year"],
  SPEED: ["m/s", "km/h", "mi/h", "ft/s"],
  MASS: ["kg", "g", "mg", "lb", "oz", "ton", "tonne", "grain"],
  FORCE: ["N", "dyn", "lbf", "kip"],
  ENRG: ["J", "erg", "BTU", "Wh", "kWh", "eV"],
  POWR: ["W", "kW", "MW", "hp"],
  PRESS: ["Pa", "kPa", "bar", "atm", "mmHg", "psi", "torr"],
  TEMP: ["K", "degC", "degF", "degR"],
  ELEC: ["A", "V", "ohm", "C", "F", "H", "S", "Wb", "T"],
  ANGL: ["deg", "rad", "grad", "arcsec", "arcmin", "cycle"],
  LIGHT: ["cd"],
};
