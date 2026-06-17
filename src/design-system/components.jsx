// Core UI components for the Pomp Op Sahat design language (Metronic 8 feel).
// Prop-driven, inline-styled (the app uses no CSS framework). These are the
// reusable primitives Claude Design catalogs via `/design-sync`.

import { color as C, font, fontWeight, radius, shadow } from "./tokens.js";

// Small uppercase, letter-spaced label placed above a section.
export const Eyebrow = ({ children, color = C.muted, style }) => (
  <p style={{ fontSize: 13, fontWeight: fontWeight.semibold, letterSpacing: "1px", textTransform: "uppercase", color, ...style }}>
    {children}
  </p>
);

// Heading (Inter, semibold by default — Metronic style). `as` sets the element.
export const Heading = ({ children, size = 22, color = C.ink, weight = fontWeight.semibold, as: Tag = "h2", style }) => (
  <Tag style={{ fontFamily: font.display, fontSize: size, fontWeight: weight, color, lineHeight: 1.2, letterSpacing: "-0.3px", margin: 0, ...style }}>
    {children}
  </Tag>
);

// Elevated white rounded surface (Metronic card).
export const Card = ({ children, padding = "24px 28px", background = C.cream, style }) => (
  <div style={{ background, padding, borderRadius: radius.lg, boxShadow: shadow.card, ...style }}>{children}</div>
);

// KPI tile: eyebrow label, large bold value, optional sub-caption.
export const StatCard = ({ label, value, sub, color = C.ink, style }) => (
  <Card style={style}>
    <Eyebrow style={{ marginBottom: 12 }}>{label}</Eyebrow>
    <p style={{ fontFamily: font.display, fontSize: 28, fontWeight: fontWeight.bold, color, lineHeight: 1.1, marginBottom: 6, letterSpacing: "-0.5px" }}>
      {value}
    </p>
    {sub && <p style={{ fontSize: 14, color: C.muted, fontWeight: fontWeight.medium }}>{sub}</p>}
  </Card>
);

// Pill badge. `variant`: "light" (tinted bg, default), "solid", or "outline".
export const Badge = ({ children, color = C.forest, bg, variant = "light", style }) => {
  const base = { fontSize: 13, fontWeight: fontWeight.semibold, letterSpacing: "0", padding: "5px 10px", borderRadius: radius.sm, display: "inline-block", lineHeight: 1 };
  const skin =
    variant === "solid" ? { background: color, color: "#fff" } :
    variant === "outline" ? { color, border: `1px solid ${color}`, background: "transparent" } :
    { background: bg || "#f1faff", color };
  return <span style={{ ...base, ...skin, ...style }}>{children}</span>;
};

// Hairline divider. `strong` uses the heavier line color.
export const Divider = ({ strong = false, style }) => (
  <div style={{ height: 1, background: strong ? C.lineD : C.line, ...style }} />
);

// Button. `variant`: "primary" (filled), "secondary" (outline), "light" (tinted).
export const Button = ({ children, onClick, variant = "primary", type = "button", style }) => {
  const base = { cursor: "pointer", fontSize: 14, fontWeight: fontWeight.semibold, letterSpacing: "0", padding: "10px 18px", fontFamily: font.body, borderRadius: radius.md, transition: "all 0.15s ease" };
  const skin =
    variant === "primary" ? { background: C.forest, color: "#fff", border: "none" } :
    variant === "light" ? { background: "#f1faff", color: C.forest, border: "none" } :
    { background: "#fff", color: C.mid, border: `1px solid ${C.lineD}` };
  return <button type={type} onClick={onClick} style={{ ...base, ...skin, ...style }}>{children}</button>;
};

// Thin progress bar; `value` is 0–100.
export const ProgressBar = ({ value = 0, color = C.forest, track = C.line, height = 6, style }) => (
  <div style={{ height, background: track, borderRadius: radius.pill, position: "relative", overflow: "hidden", ...style }}>
    <div style={{ position: "absolute", top: 0, left: 0, height: "100%", width: `${Math.min(100, Math.max(0, value))}%`, background: color, borderRadius: radius.pill, transition: "width 1s ease" }} />
  </div>
);

// Currency figure (Inter, semibold). `signed` adds +/−; `masked` hides it.
export const Money = ({ value = 0, signed = false, masked = false, mask = "••••••", color = C.ink, style }) => {
  if (masked) return <span style={{ fontFamily: font.display, fontWeight: fontWeight.semibold, color, ...style }}>{"Rp" + mask}</span>;
  const sign = signed ? (value > 0 ? "+" : value < 0 ? "−" : "") : "";
  return (
    <span style={{ fontFamily: font.display, fontWeight: fontWeight.semibold, color, ...style }}>
      {sign}Rp{Math.abs(Number(value)).toLocaleString("id-ID")}
    </span>
  );
};
