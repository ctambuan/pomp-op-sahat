#!/usr/bin/env node
// One-off, READ-ONLY size reader. No PUT/PATCH/writes, no deploy.
// Mirrors SizeTab logic: key `size.{Name_With_Underscores}` -> REST path /size/{key}.json
// Values are stored JSON-stringified by sSet, so the .json endpoint returns a quoted string.

const DATABASE_URL =
  "https://pomp-op-sahat-46e0d-default-rtdb.asia-southeast1.firebasedatabase.app";

// ALL_PAX (23) — copied verbatim from src/App.jsx
const ALL_PAX = [
  {name:"Christine Tambunan",hh:"HH1"},{name:"Agustianto Batubara",hh:"HH1"},{name:"Alexander Batubara",hh:"HH1"},
  {name:"Agustinus Tambunan",hh:"HH2"},{name:"Linda Napitupulu",hh:"HH2"},{name:"Adolf Tambunan",hh:"HH2"},{name:"Intan Tambunan",hh:"HH2"},
  {name:"Monang Panjaitan",hh:"HH3"},{name:"Rohana Tambunan",hh:"HH3"},{name:"Nhaomy Panjaitan",hh:"HH3"},
  {name:"Gerard Sahat",hh:"HH4"},{name:"Diana Pardede",hh:"HH4"},{name:"Ferdiana Sondang",hh:"HH4"},
  {name:"Ronald Daniel",hh:"HH4"},{name:"Ivana Panjaitan",hh:"HH4"},{name:"Leandro Ratu",hh:"HH4"},
  {name:"Rany Yamemia",hh:"HH4"},{name:"Arlo Ratu",hh:"HH4"},{name:"Alora Ratu",hh:"HH4"},{name:"Lusiana",hh:"HH4"},
  {name:"Mariana Tambunan",hh:"HH5"},{name:"Olive Tambunan",hh:"HH5"},{name:"Nadia Tambunan",hh:"HH5"},
];

const keyFor  = (name) => name.replace(/\s+/g, "_");
const urlFor  = (name) => `${DATABASE_URL}/size/${encodeURIComponent(keyFor(name))}.json`;

// REST GET returns the stored value. sSet stored JSON.stringify(rec), so the value
// itself is a JSON string -> after res.json() we get a string -> parse once more.
async function fetchSize(name) {
  const res = await fetch(urlFor(name));
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${name}`);
  const raw = await res.json(); // null | string | (object, if ever stored unstringified)
  if (raw == null) return { name, rec: null };
  let rec = raw;
  if (typeof raw === "string") {
    try { rec = JSON.parse(raw); } catch { rec = { _unparsed: raw }; }
  }
  return { name, rec };
}

function pad(s, w) { s = String(s ?? ""); return s.length >= w ? s.slice(0, w) : s + " ".repeat(w - s.length); }

(async () => {
  const results = await Promise.all(ALL_PAX.map(p => fetchSize(p.name)));
  const byName = Object.fromEntries(results.map(r => [r.name, r.rec]));

  const cols = [
    ["PARTICIPANT", 22], ["HH", 4], ["BAJU", 6], ["CELANA", 7], ["TOPI", 6],
    ["SEPATU", 7], ["FILLED BY", 20], ["SUBMITTED AT (timestamp)", 26], ["STATUS", 8],
  ];
  const header = cols.map(([t, w]) => pad(t, w)).join(" | ");
  console.log(header);
  console.log("-".repeat(header.length));

  let filled = 0;
  const missing = [];
  for (const p of ALL_PAX) {
    const r = byName[p.name];
    if (!r) {
      missing.push(p.name);
      console.log([
        pad(p.name, 22), pad(p.hh, 4), pad("—", 6), pad("—", 7), pad("—", 6),
        pad("—", 7), pad("—", 20), pad("—", 26), pad("MISSING", 8),
      ].join(" | "));
    } else {
      filled++;
      console.log([
        pad(p.name, 22), pad(p.hh, 4), pad(r.baju, 6), pad(r.celana, 7), pad(r.topi, 6),
        pad(r.sepatu, 7), pad(r.filledBy, 20), pad(r.submittedAt, 26), pad("OK", 8),
      ].join(" | "));
    }
  }

  console.log("-".repeat(header.length));
  console.log(`\nTotal: ${ALL_PAX.length}  |  Submitted: ${filled}  |  Missing: ${missing.length}`);
  if (missing.length) console.log(`Missing (${missing.length}): ${missing.join(", ")}`);
})().catch(e => { console.error("FATAL:", e); process.exit(1); });
