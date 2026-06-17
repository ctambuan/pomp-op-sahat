// Core UI components for the Pomp Op Sahat design language.
// Prop-driven, inline-styled (the app uses no CSS framework). These are the
// reusable primitives Claude Design catalogs via `/design-sync`.

import { color as C, font, fontWeight } from "./tokens.js";

// Small uppercase, letter-spaced label placed above a section. */
export const Eyebrow = ({ children, color = C.muted, style }) => (
  <p style={{ fontSize: 16, letterSpacing: "2.5px", textTransform: "uppercase", color, ...style }}>
    {children}
  </p>
);

// Serif display heading (Playfair). Use `as` to set the element (h1/h2/h3).
export const Heading = ({ children, size = 34, color = C.ink, weight = fontWeight.regular, as: Tag = "h2", style }) => (
  <Tag style={{ fontFamily: font.display, fontSize: size, fontWeight: weight, color, lineHeight: 1.1, margin: 0, ...style }}>
    {children}
  </Tag>
);

// Padded surface block (cream by default). */
export const Card = ({ children, padding = "32px 28px", background = C.cream, style }) => (
  <div style={{ background, padding, ...style }}>{children}</div>
);

// Metric tile: eyebrow label, large serif value, optional sub-caption. */
export const StatCard = ({ label, value, sub, color = C.ink, style }) => (
  <Card style={style}>
    <Eyebrow style={{ marginBottom: 16 }}>{label}</Eyebrow>
    <p style={{ fontFamily: font.display, fontSize: 26, fontWeight: fontWeight.regular, color, lineHeight: 1, marginBottom: 8 }}>
      {value}
    </p>
    {sub && <p style={{ fontSize: 17, color: C.muted }}>{sub}</p>}
  </Card>
);

// Small pill / tag. `variant`: "outline" (default) or "solid". */
export const Badge = ({ children, color = C.gold, variant = "outline", style }) => {
  const base = { fontSize: 15, letterSpacing: "2px", textTransform: "uppercase", padding: "2px 8px", display: "inline-block" };
  const skin = variant === "solid" ? { background: color, color: "#fff" } : { color, border: `1px solid ${color}` };
  return <span style={{ ...base, ...skin, ...style }}>{children}</span>;
};

// Hairline divider. `strong` uses the heavier line color. */
export const Divider = ({ strong = false, style }) => (
  <div style={{ height: 1, background: strong ? C.lineD : C.line, ...style }} />
);

// Button. `variant`: "primary" (filled forest) or "secondary" (outline). */
export const Button = ({ children, onClick, variant = "primary", type = "button", style }) => {
  const base = { cursor: "pointer", fontSize: 15, letterSpacing: "2px", textTransform: "uppercase", padding: "10px 16px", fontFamily: font.body };
  const skin = variant === "primary"
    ? { background: C.forest, color: "#fff", border: "none", fontWeight: fontWeight.medium }
    : { background: "none", color: C.muted, border: `1px solid ${C.lineD}` };
  return <button type={type} onClick={onClick} style={{ ...base, ...skin, ...style }}>{children}</button>;
};

// Thin progress bar; `value` is 0–100. */
export const ProgressBar = ({ value = 0, color = C.forest, track = C.line, style }) => (
  <div style={{ height: 1, background: track, position: "relative", ...style }}>
    <div style={{ position: "absolute", top: 0, left: 0, height: 2, width: `${Math.min(100, Math.max(0, value))}%`, background: color, marginTop: "-0.5px", transition: "width 1s ease" }} />
  </div>
);

// Currency figure in the serif face. `signed` adds +/−; `masked` hides it. */
export const Money = ({ value = 0, signed = false, masked = false, mask = "••••••", color = C.ink, style }) => {
  if (masked) return <span style={{ fontFamily: font.display, color, ...style }}>{"Rp" + mask}</span>;
  const sign = signed ? (value > 0 ? "+" : value < 0 ? "−" : "") : "";
  return (
    <span style={{ fontFamily: font.display, color, ...style }}>
      {sign}Rp{Math.abs(Number(value)).toLocaleString("id-ID")}
    </span>
  );
};
