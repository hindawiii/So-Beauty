/**
 * Color Utilities for Converting Hex to OKLCH & Generating Brand Palettes
 */

export interface GeneratedColorPalette {
  hex: string;
  oklch: string;
  softOklch: string;
  deepOklch: string;
  contrastText: "#ffffff" | "#0f172a";
}

/**
 * Basic sRGB to linear RGB conversion
 */
function sRgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/**
 * Converts a hex string (#ffffff or #fff) to OKLCH string approximation
 */
export function hexToOklch(hex: string): string {
  let cleanHex = hex.replace("#", "").trim();
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split("")
      .map((c) => c + c)
      .join("");
  }

  if (cleanHex.length !== 6) {
    return "oklch(0.48 0.08 300)";
  }

  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  const lr = sRgbToLinear(r);
  const lg = sRgbToLinear(g);
  const lb = sRgbToLinear(b);

  // LMS cone response
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);

  // OKLab coordinates
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bVal = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;

  // OKLCH coordinates
  const C = Math.sqrt(a * a + bVal * bVal);
  let h = (Math.atan2(bVal, a) * 180) / Math.PI;
  if (h < 0) h += 360;

  return `oklch(${L.toFixed(2)} ${C.toFixed(3)} ${Math.round(h)})`;
}

/**
 * Generates a full harmonious palette (Base, Soft Tint, Deep Accent, Contrast Text) from any Hex
 */
export function generatePaletteFromHex(hex: string): GeneratedColorPalette {
  const oklch = hexToOklch(hex);

  // Parse numbers out of oklch(L C H)
  const match = oklch.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/);
  let l = 0.48;
  let c = 0.08;
  let h = 300;

  if (match) {
    l = parseFloat(match[1]);
    c = parseFloat(match[2]);
    h = parseFloat(match[3]);
  }

  // Soft background tint: High lightness (0.96 - 0.97), subtle chroma (0.025 - 0.035)
  const softOklch = `oklch(0.965 ${Math.min(c, 0.04).toFixed(3)} ${Math.round(h)})`;

  // Deep dark variant for headers/accents
  const deepOklch = `oklch(0.220 ${Math.min(c, 0.08).toFixed(3)} ${Math.round(h)})`;

  // Contrast text decision (WCAG friendly)
  const contrastText = l > 0.65 ? "#0f172a" : "#ffffff";

  return {
    hex,
    oklch,
    softOklch,
    deepOklch,
    contrastText,
  };
}
