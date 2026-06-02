# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # start dev server (Vite HMR on localhost:5173)
npm run build     # production build → dist/
npm run lint      # ESLint
npm run preview   # serve the dist/ build locally
```

There are no tests. No test runner is configured.

## Architecture

Single-page React app (Vite + Firebase Realtime Database). All application code lives in two files:

- **`src/App.jsx`** — the entire UI (~1150 lines). All data, components, and tab logic live here. There is no routing library; tabs are state-driven (`useState`).
- **`src/firebase.js`** — thin Firebase wrapper. Exports `sGet`, `sSet`, `sList` (async key/value helpers using dot-notation keys that map to `/`-separated Firebase paths), plus `onValue`, `ref`, `db` for the live Budget listener.

### Data model (all in App.jsx)

| Constant | Purpose |
|----------|---------|
| `ALL_PAX` | Master list of 23 participants with household (`hh`) assignments |
| `BUDGET_DEFAULT` | Static budget snapshot; live data merged from Firebase `budget/` node |
| `ITINERARY` | 4-day schedule; events may carry a `carAssignment` array for transport events |
| `RESTAURANTS` | F&B pre-order menus (Solaria, Ayom, Summer Palace) |
| `UPCOMING_FB` | F&B meals without pre-order forms |

### Household structure

`HH1`–`HH5`. `HH5` (`absorbed: true`) has costs absorbed by HH2+HH3+HH4; HH1 is explicitly excluded from HH5 cost-sharing. F&B is fully sponsored per household and never included in shared fund calculations.

### Firebase schema

```
budget/           ← merged over BUDGET_DEFAULT at runtime (onValue listener)
ledger/           ← transaction log array
lock.{restoId}    ← "true"/"false" order lock per restaurant
order.{restoId}.{Name_With_Underscores}  ← JSON order per participant
```

### Tab components

- **`BudgetTab`** — reads `budget/` and `ledger/` via `onValue`; coordinator-only rows visible to `COORDINATORS` list.
- **`ItineraryTab`** — purely static render of `ITINERARY`; renders `carAssignment` blocks for transport events.
- **`FoodOrderTab` / `RestaurantView`** — reads/writes orders via `sGet`/`sSet`/`sList`; coordinator can lock orders and export CSV.

### Versioning convention

Every material change to the Itinerary bumps the version label in `ItineraryTab` header (currently `Itinerary v20`). Increment this on any itinerary change.

### Styling

No CSS files. All styles are inline objects using the `T` theme token object defined at the top of `App.jsx`. Fonts: Playfair Display (headings) + Jost (body), loaded from Google Fonts in `GlobalStyles`.

## Deployment

Vercel is connected to this repo and auto-deploys on every push to `main`.
