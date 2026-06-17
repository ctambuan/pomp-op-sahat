// Design tokens — single source of truth for the Pomp Op Sahat visual language.
// Consumed by the app (src/App.jsx) and by Claude Design via `/design-sync`.

// ── Color ────────────────────────────────────────────────────────────────
// Warm editorial palette: stone/cream paper, forest + gold accents, semantic
// settled/warn/danger/absorbed states, and two hairline weights.
export const color = {
  stone:    "#f3ede4", // app background
  cream:    "#faf7f2", // card / surface
  white:    "#ffffff",
  ink:      "#1a1512", // primary text
  mid:      "#5c5048", // secondary text
  muted:    "#9c8e82", // labels / captions
  ghost:    "#c8bdb4", // faint text / empty values
  forest:   "#243d30", // primary brand
  forestL:  "#3a5c49",
  gold:     "#9a7a40", // accent ("you", highlights)
  goldL:    "#c4a870",
  settled:  "#2c5038", settledBg:"#edf4ef", // positive / paid
  warn:     "#6b4c1e", warnBg:   "#f9f2e8", // caution / refund
  danger:   "#7a2e20", dangerBg: "#f8efed", // negative / unpaid
  abs:      "#3a4a6a", absBg:    "#eef0f6", // absorbed / neutral-info
  line:     "#e0d5c8", // hairline divider
  lineD:    "#ccc0b0", // stronger hairline
};

// Back-compat alias: the app refers to the flat palette as `T`.
export const T = color;

// ── Typography ──────────────────────────────────────────────────────────
export const font = {
  display: "'Playfair Display', Georgia, serif", // serif headings & figures
  body:    "'Jost', sans-serif",                 // UI text
};

export const fontWeight = { light: 300, regular: 400, medium: 500, semibold: 600 };

// Type scale in px (the values used throughout the app).
export const fontSize = {
  xs: 15, sm: 16, base: 17, md: 18, lg: 19, xl: 20,
  "2xl": 21, "3xl": 23, "4xl": 24, "5xl": 26, "6xl": 34, "7xl": 42,
};

export const letterSpacing = {
  tight: "-0.5px", normal: "0", wide: "1.5px", wider: "2px", widest: "3px",
};

export const lineHeight = { none: 1, tight: 1.1, snug: 1.4, normal: 1.7 };

// ── Spacing (px) ──────────────────────────────────────────────────────────
export const space = {
  xs: 6, sm: 8, md: 12, lg: 16, xl: 20, "2xl": 24, "3xl": 32, "4xl": 48, "5xl": 56, "6xl": 64,
};

// ── Borders & motion ──────────────────────────────────────────────────────
export const border = {
  hairline:       `1px solid ${color.line}`,
  hairlineStrong: `1px solid ${color.lineD}`,
};

export const motion = { fadeUp: "fadeUp 0.6s ease forwards" };

// ── Utilities ───────────────────────────────────────────────────────────
// Indonesian Rupiah, e.g. 44783427 → "Rp44.783.427".
export const formatRupiah = (n) => "Rp" + Math.abs(Number(n)).toLocaleString("id-ID");

export const tokens = { color, font, fontWeight, fontSize, letterSpacing, lineHeight, space, border, motion };
export default tokens;
