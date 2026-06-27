// Vercel Serverless Function — /api/whatsapp
//
// Mengirim pesan WhatsApp ke grup lewat Fonnte (https://fonnte.com).
// Token device disimpan SERVER-SIDE (tidak pernah sampai ke browser), sama
// seperti kredensial Google di /api/budget. Front-end (tab "Pesan WA") cukup
// POST { message } ke endpoint ini; target grup diambil dari ENV server,
// sehingga pengirim tidak bisa memilih nomor/grup sembarangan.
//
// ENV yang dibutuhkan di Vercel:
//   FONNTE_TOKEN     — token device dari dashboard Fonnte (wajib).
//   FONNTE_GROUP_ID  — ID grup tujuan default, mis. "120363012345678901@g.us"
//                      atau cukup angkanya. Lihat dashboard Fonnte → Group.
//
// Catatan: nomor/grup pengirim (yang scan QR di Fonnte) harus sudah menjadi
// anggota grup tersebut.

const FONNTE_URL = "https://api.fonnte.com/send";
const MAX_LEN = 4000; // batas aman panjang pesan

async function readBody(req) {
  // Vercel sudah mem-parse JSON bila Content-Type application/json.
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  // Fallback: baca stream mentah.
  const chunks = [];
  for await (const c of req) chunks.push(c);
  if (!chunks.length) return {};
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch { return {}; }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, reason: "method_not_allowed" });
  }

  const token = process.env.FONNTE_TOKEN;
  const target = process.env.FONNTE_GROUP_ID;
  if (!token || !target) {
    return res.status(503).json({ ok: false, reason: "not_configured" });
  }

  const body = await readBody(req);
  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message) return res.status(400).json({ ok: false, reason: "empty_message" });
  if (message.length > MAX_LEN) return res.status(400).json({ ok: false, reason: "message_too_long" });

  try {
    const form = new URLSearchParams();
    form.set("target", target);
    form.set("message", message);
    // Penting untuk grup: beri tahu Fonnte target adalah ID grup, bukan nomor.
    form.set("countryCode", "0");

    const resp = await fetch(FONNTE_URL, {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form.toString(),
    });

    let data = null;
    try { data = await resp.json(); } catch { /* respons non-JSON */ }

    // Fonnte balas { status: true/false, detail, id, process, ... }.
    if (resp.ok && data && data.status) {
      return res.status(200).json({ ok: true, id: data.id, detail: data.detail });
    }
    const reason = (data && (data.reason || data.detail)) || `fonnte_${resp.status}`;
    return res.status(502).json({ ok: false, reason });
  } catch (err) {
    return res.status(502).json({ ok: false, reason: err && err.message ? err.message : "network_error" });
  }
}
