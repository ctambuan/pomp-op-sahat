// Design tokens — single source of truth for the Pomp Op Sahat visual language.
// Restyled to follow Metronic 8 (demo1): Inter typography, light-gray canvas,
// white elevated rounded cards, and the Metronic accent palette.
// Consumed by the app (src/App.jsx) and by Claude Design via `/design-sync`.

// ── Color (Metronic 8 palette) ─────────────────────────────────────────────
// Keys are kept stable so the app keeps working; only values changed.
export const color = {
  stone:    "#f5f8fa", // page canvas (Metronic body bg)
  cream:    "#ffffff", // card / surface
  white:    "#ffffff",
  ink:      "#181c32", // Gray-900 — headings / primary text
  mid:      "#5e6278", // Gray-700 — body text
  muted:    "#a1a5b7", // Gray-500 — labels / captions
  ghost:    "#b5b9c9", // Gray-400 — faint text / empty values
  forest:   "#009ef7", // Primary (Metronic blue) — brand / active
  forestL:  "#0095e8", // primary hover/darker
  gold:     "#ffc700", // Warning (amber) — "you" / highlight
  goldL:    "#f1bc00",
  settled:  "#50cd89", settledBg:"#e8fff3", // Success — positive / paid
  warn:     "#f6c000", warnBg:   "#fff8dd", // Warning — caution / refund
  danger:   "#f1416c", dangerBg: "#fff5f8", // Danger — negative / unpaid
  abs:      "#7239ea", absBg:    "#f8f5ff", // Info (purple) — absorbed / neutral
  line:     "#eff2f5", // Gray-200 — hairline / divider
  lineD:    "#e1e3ea", // Gray-300 — stronger border
};

// Back-compat alias: the app refers to the flat palette as `T`.
export const T = color;

// ── Typography (Inter) ─────────────────────────────────────────────────────
const INTER = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
export const font = {
  display: INTER, // headings & figures (Metronic uses Inter throughout)
  body:    INTER, // UI text
};

export const fontWeight = { light: 400, regular: 400, medium: 500, semibold: 600, bold: 700 };

// Type scale in px (the values used throughout the app).
export const fontSize = {
  xs: 15, sm: 16, base: 17, md: 18, lg: 19, xl: 20,
  "2xl": 21, "3xl": 23, "4xl": 24, "5xl": 26, "6xl": 34, "7xl": 42,
};

export const letterSpacing = {
  tight: "-0.3px", normal: "0", wide: "1px", wider: "1.5px", widest: "2px",
};

export const lineHeight = { none: 1, tight: 1.15, snug: 1.4, normal: 1.6 };

// ── Spacing (px) ────────────────────────────────────────────────────────────
export const space = {
  xs: 6, sm: 8, md: 12, lg: 16, xl: 20, "2xl": 24, "3xl": 32, "4xl": 48, "5xl": 56, "6xl": 64,
};

// ── Radius, borders, elevation, motion ──────────────────────────────────────
export const radius = { sm: 6, md: 8, lg: 12, xl: 16, pill: 999 };

export const border = {
  hairline:       `1px solid ${color.line}`,
  hairlineStrong: `1px solid ${color.lineD}`,
};

// Soft Metronic-style card shadow.
export const shadow = {
  card: "0 0 30px 0 rgba(33,46,77,0.06)",
  cardHover: "0 0 40px 0 rgba(33,46,77,0.10)",
};

export const motion = { fadeUp: "fadeUp 0.6s ease forwards" };

// ── Utilities ───────────────────────────────────────────────────────────────
// Indonesian Rupiah, e.g. 44783427 → "Rp44.783.427".
export const formatRupiah = (n) => "Rp" + Math.abs(Number(n)).toLocaleString("id-ID");

export const tokens = { color, font, fontWeight, fontSize, letterSpacing, lineHeight, space, radius, border, shadow, motion };
export default tokens;
