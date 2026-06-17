# Pomp Op Sahat — Design System

The visual language of the app, extracted so it can be read by humans and by
**Claude Design** (`/design-sync`).

## Contents

- **`tokens.js`** — design tokens (single source of truth):
  - `color` / `T` — warm editorial palette (stone & cream paper, forest + gold
    accents, semantic settled/warn/danger/absorbed states, two hairline weights)
  - `font` — `display` (Playfair Display serif) and `body` (Jost)
  - `fontWeight`, `fontSize`, `letterSpacing`, `lineHeight` — the type scale
  - `space` — spacing scale (px)
  - `border`, `motion`
  - `formatRupiah(n)` — `44783427 → "Rp44.783.427"`
- **`components.jsx`** — reusable primitives, all prop-driven and inline-styled
  (the app uses no CSS framework):
  - `Eyebrow` · `Heading` · `Card` · `StatCard` · `Badge` · `Divider`
    · `Button` · `ProgressBar` · `Money`
- **`index.js`** — barrel export.

## Usage

```jsx
import { T, Card, StatCard, Heading, Money } from "./design-system";

<Heading size={34}>Rekonsiliasi Rekening Bersama</Heading>
<StatCard label="Saldo Kas" value={<Money value={44783427} />} sub="Bank Jago" color={T.settled} />
```

## Sync with Claude Design

From a local Claude Code that has the Claude Design plugin installed:

```bash
cd path/to/pomp-op-sahat
claude
/design-sync
```

It reads the tokens and components above directly.

## Principles

- Editorial, paper-like, generous whitespace; thin hairline rules, not boxes.
- Serif (Playfair) for headings and all monetary figures; Jost for UI text.
- Color carries meaning — forest = brand/primary, gold = "you"/highlight,
  settled/warn/danger/abs = financial states.
