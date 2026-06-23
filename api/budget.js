// Vercel Serverless Function — /api/budget
//
// Membaca file Excel "Rekonsiliasi Rekening Bersama" dari Google Drive
// memakai service account (server-side, kredensial tidak pernah ke browser),
// lalu mengembalikan JSON tabel: Posisi Akhir per HH, Rincian Talangan,
// dan Buku Besar Historis. Tab "Dana" di front-end membaca endpoint ini,
// jadi begitu isi sheet berubah, website ikut ter-update otomatis.
//
// ENV yang dibutuhkan di Vercel:
//   GOOGLE_SERVICE_ACCOUNT_JSON  — isi file kunci service account (raw JSON
//                                  atau base64 dari JSON tsb).
//   BUDGET_SHEET_FILE_ID         — (opsional) ID file Drive. Default sudah diisi.
//
// Catatan: footnote / "Catatan & Asumsi" SENGAJA tidak ditarik — hanya tabel.

import { JWT } from "google-auth-library";
import * as XLSX from "xlsx";

const DEFAULT_FILE_ID = "184YSBGSNJmG15wjgizN_RkiLJCUY-h9w";
const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.readonly";

// "12,648,850" -> 12648850 · "(695,667)" -> -695667 · "-"/"—"/"" -> 0
const num = (v) => {
  if (v == null) return 0;
  if (typeof v === "number") return Math.round(v);
  let s = String(v).trim();
  if (s === "" || s === "-" || s === "—") return 0;
  const neg = /^\(.*\)$/.test(s);
  s = s.replace(/[()]/g, "").replace(/[^\d.-]/g, "");
  const n = parseFloat(s);
  if (!isFinite(n)) return 0;
  return neg ? -Math.abs(Math.round(n)) : Math.round(n);
};

const txt = (v) => (v == null ? "" : String(v).trim());

function readCredentials() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (raw) {
    let s = raw.trim();
    if (!s.startsWith("{")) {
      try { s = Buffer.from(s, "base64").toString("utf8"); } catch { /* ignore */ }
    }
    const creds = JSON.parse(s);
    if (creds.private_key) creds.private_key = creds.private_key.replace(/\\n/g, "\n");
    return { email: creds.client_email, key: creds.private_key };
  }
  // Alternatif: dua env terpisah
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let key = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  if (email && key) return { email, key: key.replace(/\\n/g, "\n") };
  return null;
}

async function downloadWorkbook(fileId) {
  const creds = readCredentials();
  if (!creds) { const e = new Error("not_configured"); e.code = "not_configured"; throw e; }
  const client = new JWT({ email: creds.email, key: creds.key, scopes: [DRIVE_SCOPE] });
  const { token } = await client.getAccessToken();
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&supportsAllDrives=true`;
  const resp = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!resp.ok) {
    const body = await resp.text().catch(() => "");
    const e = new Error(`drive_${resp.status}`);
    e.detail = body.slice(0, 300);
    throw e;
  }
  const buf = Buffer.from(await resp.arrayBuffer());
  return XLSX.read(buf, { type: "buffer" });
}

// Gabungkan semua sheet jadi satu array baris (array of cell-arrays).
function flatten(wb) {
  const rows = [];
  for (const name of wb.SheetNames) {
    const ws = wb.Sheets[name];
    const r = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: "" });
    rows.push(...r);
  }
  return rows;
}

const cellsText = (row) => row.map((c) => txt(c)).join(" ");
const findRow = (rows, re, from = 0) => {
  for (let i = from; i < rows.length; i++) if (re.test(cellsText(rows[i]))) return i;
  return -1;
};

function parse(wb) {
  const rows = flatten(wb);

  // --- asOf (header) ---
  let asOf = "";
  for (const row of rows) {
    const m = cellsText(row).match(/per\s+(\d{1,2}\s+[A-Za-zÀ-ÿ]+\s+\d{4})/u);
    if (m) { asOf = m[1]; break; }
  }

  // --- 1. Posisi Akhir per HH ---
  const reconRows = [];
  let net = null;
  const reconHdr = findRow(rows, /Kontribusi\s+Per\s+HH/i);
  if (reconHdr !== -1) {
    for (let i = reconHdr + 1; i < rows.length; i++) {
      const c0 = txt(rows[i][0]);
      if (!c0) continue;
      if (/Posisi\s+Akhir\s+positif/i.test(c0)) break; // legenda
      const hh = c0.match(/^(HH\d)\s*[—–-]\s*(.*)$/u);
      if (hh) {
        reconRows.push({
          code: hh[1],
          label: hh[2].trim(),
          kontribusi: num(rows[i][1]),
          biaya: num(rows[i][2]),
          talangan: num(rows[i][3]),
          kekurangan: num(rows[i][4]),
          posisiAkhir: num(rows[i][5]),
          status: txt(rows[i][6]),
        });
        continue;
      }
      if (/NET/i.test(c0)) {
        net = {
          kontribusi: num(rows[i][1]),
          biaya: num(rows[i][2]),
          talangan: num(rows[i][3]),
          kekurangan: num(rows[i][4]),
          posisiAkhir: num(rows[i][5]),
        };
        break;
      }
    }
  }

  // --- 2. Rincian Pembayaran Talangan ---
  const talanganRows = [];
  let talanganTotal = 0;
  const talHdr = findRow(rows, /Dibayar\s+oleh/i);
  if (talHdr !== -1) {
    for (let i = talHdr + 1; i < rows.length; i++) {
      const row = rows[i];
      const totalCell = row.findIndex((c) => /^total$/i.test(txt(c)));
      if (totalCell !== -1) { talanganTotal = num(row[3]); break; }
      if (/^CATATAN/i.test(txt(row[0]))) break;
      const item = txt(row[0]);
      if (!item) continue;
      talanganRows.push({
        item,
        dibayarOleh: txt(row[1]),
        beban: txt(row[2]),
        jumlah: num(row[3]),
        mekanisme: txt(row[4]),
      });
    }
  }

  // --- 3. Buku Besar Historis ---
  let ledgerSubtitle = "";
  const subRow = findRow(rows, /Rekening\s+kustodian/i);
  if (subRow !== -1) {
    const cell = rows[subRow].map(txt).find((c) => /Rekening\s+kustodian/i.test(c));
    if (cell) ledgerSubtitle = cell;
  }
  const ledgerRows = [];
  let totalMasuk = 0, totalKeluar = 0, saldoAkhir = 0;
  const ledHdr = findRow(rows, /Tanggal.*Keterangan/i);
  if (ledHdr !== -1) {
    for (let i = ledHdr + 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.some((c) => /^JUMLAH$/i.test(txt(c)))) {
        totalMasuk = num(row[3]); totalKeluar = num(row[4]); saldoAkhir = num(row[5]);
        break;
      }
      if (!/^\d{4}-\d{2}-\d{2}/.test(txt(row[0]))) continue;
      ledgerRows.push({
        tanggal: txt(row[0]),
        keterangan: txt(row[1]),
        kategori: txt(row[2]),
        masuk: num(row[3]),
        keluar: num(row[4]),
        saldo: num(row[5]),
        catatan: txt(row[6]),
      });
    }
  }
  if (!saldoAkhir && ledgerRows.length) saldoAkhir = ledgerRows[ledgerRows.length - 1].saldo;

  return {
    ok: true,
    asOf,
    recon: { rows: reconRows, net },
    talangan: { rows: talanganRows, total: talanganTotal },
    ledger: { subtitle: ledgerSubtitle, rows: ledgerRows, totalMasuk, totalKeluar, saldoAkhir },
  };
}

export default async function handler(req, res) {
  const fileId = process.env.BUDGET_SHEET_FILE_ID || DEFAULT_FILE_ID;
  try {
    const wb = await downloadWorkbook(fileId);
    const data = parse(wb);
    // Cache pendek di edge (30 dtk) supaya perubahan sheet cepat tampil,
    // dengan revalidasi latar 60 dtk. Tombol "Segarkan" di UI menambah
    // cache-buster + no-store untuk pengambilan langsung dari sheet.
    res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=60");
    res.status(200).json(data);
  } catch (err) {
    const code = err.code === "not_configured" ? 503 : 502;
    res.status(code).json({ ok: false, reason: err.code || err.message, detail: err.detail });
  }
}
