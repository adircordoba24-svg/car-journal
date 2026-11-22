// Car Journal: phone notifications (Web Push).
//   action "key"  (signed-in user)  -> the public VAPID key; the key pair is created here on first use
//   action "test" (signed-in user)  -> a test notification to the caller's devices
//   action "run"  (daily cron, x-cron-token) -> reminders that are due or overdue, one notification per car
import webpush from "npm:web-push@3.6.7";

const APP_URL = "https://adircordoba24-svg.github.io/car-journal/";
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });
function serviceKey(): string {
  const legacy = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (legacy) return legacy;
  try { const keys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}"); return keys.default ?? Object.values(keys)[0] ?? ""; } catch { return ""; }
}
const URL_ = Deno.env.get("SUPABASE_URL")!;
const SK = serviceKey();
const H = { apikey: SK, Authorization: `Bearer ${SK}`, "Content-Type": "application/json" };
const rest = (path: string, init: RequestInit = {}) => fetch(`${URL_}/rest/v1/${path}`, { ...init, headers: { ...H, ...(init.headers || {}) } });

async function config() {
  const r = await rest("push_config?id=eq.1&select=public_key,private_key,cron_token");
  const row = (await r.json())[0];
  if (!row.public_key || !row.private_key) {
    const k = webpush.generateVAPIDKeys();
    await rest("push_config?id=eq.1", { method: "PATCH", body: JSON.stringify({ public_key: k.publicKey, private_key: k.privateKey }) });
    row.public_key = k.publicKey; row.private_key = k.privateKey;
  }
  webpush.setVapidDetails(APP_URL, row.public_key, row.private_key);
  return row;
}
async function userFrom(req: Request) {
  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const who = await fetch(`${URL_}/auth/v1/user`, { headers: { Authorization: `Bearer ${token}`, apikey: Deno.env.get("SUPABASE_ANON_KEY") ?? "" } });
  if (!who.ok) return null;
  const u = await who.json().catch(() => null);
  return u && u.id ? u : null;
}
async function sendTo(userId: string, payload: object) {
  const r = await rest(`push_subs?user_id=eq.${userId}&select=endpoint,p256dh,auth`);
  const subs = await r.json();
  let sent = 0;
  for (const s of subs) {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, JSON.stringify(payload), { TTL: 60 * 60 * 12, urgency: "normal" });
      sent++;
    } catch (e: any) {
      if (e && (e.statusCode === 404 || e.statusCode === 410)) await rest(`push_subs?endpoint=eq.${encodeURIComponent(s.endpoint)}`, { method: "DELETE" });
      else console.error("push failed", e && e.statusCode, e && e.body);
    }
  }
  return sent;
}

/* ---- reminders, same rules as the app ---- */
const num = (v: any) => { const x = typeof v === "number" ? v : parseFloat(String(v ?? "").replace(/[^\d.\-]/g, "")); return isFinite(x) ? x : null; };
const todayIL = () => new Date(Date.now() + 2 * 3600e3).toISOString().slice(0, 10); // Israel date is close enough at 09:30
const addDays = (d: string, k: number) => { const x = new Date(d + "T12:00:00Z"); x.setUTCDate(x.getUTCDate() + Math.round(k)); return x.toISOString().slice(0, 10); };
const daysBetween = (a: string, b: string) => Math.round((Date.parse(b + "T12:00:00Z") - Date.parse(a + "T12:00:00Z")) / 864e5);
const fmtKm = (k: number) => Math.round(k).toLocaleString("en-US");

function dueItems(car: any, recs: any) {
  const t = todayIL();
  let odo = num(car.odometer) || 0;
  const pts = [...recs.fuel, ...recs.service].filter((r: any) => num(r.odo) && r.date);
  for (const r of pts) if (num(r.odo)! > odo) odo = num(r.odo)!;
  pts.sort((a: any, b: any) => (a.date < b.date ? -1 : 1));
  const cut = addDays(t, -240), rec = pts.filter((p: any) => p.date >= cut), use = rec.length >= 2 ? rec : pts;
  let kpd = 40;
  if (use.length >= 2) { const d = daysBetween(use[0].date, use[use.length - 1].date); if (d > 0) kpd = Math.max(5, (num(use[use.length - 1].odo)! - num(use[0].odo)!) / d); }
  const out: { key: string; line: string; over: boolean }[] = [];
  for (const r of recs.reminder) {
    let kmLeft: number | null = null, daysLeft: number | null = null;
    if (num(r.intervalKm)) kmLeft = (num(r.lastKm) || 0) + num(r.intervalKm)! - odo;
    if (num(r.intervalDays) && r.lastDate) daysLeft = daysBetween(t, addDays(r.lastDate, num(r.intervalDays)!));
    if (kmLeft === null && daysLeft === null) continue;
    const over = (kmLeft !== null && kmLeft <= 0) || (daysLeft !== null && daysLeft < 0);
    const isCheck = r.kind === "check";
    const due = over || (daysLeft !== null && daysLeft <= (isCheck ? 0 : 7)) || (!isCheck && kmLeft !== null && kmLeft <= 500);
    if (!due) continue;
    const kmBinding = kmLeft !== null && (daysLeft === null || kmLeft / kpd < daysLeft);
    let when: string;
    if (kmBinding) when = kmLeft! <= 0 ? `באיחור ${fmtKm(-kmLeft!)} ק״מ` : `עוד ${fmtKm(kmLeft!)} ק״מ`;
    else when = daysLeft! < 0 ? `באיחור ${-daysLeft!} ימים` : daysLeft === 0 ? "היום" : daysLeft === 1 ? "מחר" : `עוד ${daysLeft} ימים`;
    out.push({ key: `${r.carId || "car"}:${r.id}`, line: `${r.title || "תזכורת"}: ${when}`, over });
  }
  return out.sort((a, b) => Number(b.over) - Number(a.over));
}

async function runDaily() {
  const subs = await (await rest("push_subs?select=user_id")).json();
  const users = [...new Set(subs.map((s: any) => s.user_id))] as string[];
  const t = todayIL();
  let notified = 0;
  for (const uid of users) {
    const docs = await (await rest(`docs?user_id=eq.${uid}&collection=in.(garage,fuel,service,reminder)&select=collection,id,data`)).json();
    const sentRows = await (await rest(`push_sent?user_id=eq.${uid}&select=rem_key,sent_on`)).json();
    const sent = new Map(sentRows.map((r: any) => [r.rem_key, r.sent_on]));
    const cars = docs.filter((d: any) => d.collection === "garage" && !d.data.example);
    // reminders shared by all cars: driver license, refresher course, ticket payments
    const global = docs.filter((d: any) => d.collection === "reminder" && d.data.carId === "*").map((d: any) => ({ id: d.id, ...d.data }));
    if (global.length && cars.length) {
      const items = dueItems(cars[0].data, { fuel: [], service: [], reminder: global })
        .filter((x) => { const last = sent.get(x.key) as string | undefined; return !last || daysBetween(last, t) >= 3; });
      if (items.length) {
        const n = await sendTo(uid, { title: items.length === 1 ? "יומן הרכב: תזכורת" : `יומן הרכב: ${items.length} תזכורות`, body: items.slice(0, 4).map((x) => x.line).join("\n"), url: APP_URL + "#reminder", tag: "rem-global" });
        if (n) { notified++; await rest("push_sent", { method: "POST", headers: { Prefer: "resolution=merge-duplicates" }, body: JSON.stringify(items.map((x) => ({ user_id: uid, rem_key: x.key, sent_on: t }))) }); }
      }
    }
    for (const c of cars) {
      const mine = (col: string) => docs.filter((d: any) => d.collection === col && (d.data.carId || "car") === c.id).map((d: any) => ({ id: d.id, ...d.data }));
      const items = dueItems(c.data, { fuel: mine("fuel"), service: mine("service"), reminder: mine("reminder") })
        .filter((x) => { const last = sent.get(x.key) as string | undefined; return !last || daysBetween(last, t) >= 3; });
      if (!items.length) continue;
      const name = c.data.nickname || [c.data.make, c.data.model].filter(Boolean).join(" ") || "הרכב";
      const title = items.length === 1 ? `${name}: תזכורת` : `${name}: ${items.length} תזכורות`;
      const body = items.slice(0, 4).map((x) => x.line).join("\n") + (items.length > 4 ? `\nועוד ${items.length - 4}` : "");
      const n = await sendTo(uid, { title, body, url: APP_URL + "#reminder", tag: `rem-${c.id}`, car: c.id });
      if (n) {
        notified++;
        await rest("push_sent", { method: "POST", headers: { Prefer: "resolution=merge-duplicates" }, body: JSON.stringify(items.map((x) => ({ user_id: uid, rem_key: x.key, sent_on: t }))) });
      }
    }
  }
  return { users: users.length, notified };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  const body = await req.json().catch(() => ({}));
  const cfg = await config();
  if (body.action === "run") {
    if (!cfg.cron_token || req.headers.get("x-cron-token") !== cfg.cron_token) return json({ error: "unauthorized" }, 401);
    return json(await runDaily());
  }
  const user = await userFrom(req);
  if (!user) return json({ error: "unauthorized" }, 401);
  if (body.action === "key") return json({ publicKey: cfg.public_key });
  if (body.action === "test") {
    const n = await sendTo(user.id, { title: "יומן הרכב", body: "ההתראות פועלות. נזכיר לך כשטיפול, טסט או בדיקה מתקרבים.", url: APP_URL, tag: "test" });
    return json({ sent: n });
  }
  return json({ error: "bad_action" }, 400);
});
