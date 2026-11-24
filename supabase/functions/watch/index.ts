// Car Journal: alerts the owner (admins) when errors or AI costs jump.
// Hourly cron (x-cron-token). Sends a phone notification to every admin who turned notifications on.
//   errors: 5+ errors in the last hour and 3x the usual hourly rate          (at most once per 6 hours)
//   costs:  AI cost in the last 24h above $2, or 3x the usual day and > $0.5 (at most once per day)
//   abuse:  one user made 40+ AI calls in the last hour                       (at most once per 6 hours)
//   failures: 5+ failed AI calls in the last hour (e.g. the API key or credit ran out)
// action "test" (admin JWT) sends a sample alert.
import webpush from "npm:web-push@3.6.7";
const APP_URL = "https://adircordoba24-svg.github.io/car-journal/admin.html";
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-token", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...CORS, "Content-Type": "application/json" } });
function serviceKey(): string {
  const legacy = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"); if (legacy) return legacy;
  try { const k = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}"); return k.default ?? Object.values(k)[0] ?? ""; } catch { return ""; }
}
const URL_ = Deno.env.get("SUPABASE_URL")!, SK = serviceKey();
const H = { apikey: SK, Authorization: `Bearer ${SK}`, "Content-Type": "application/json" };
const rest = (p: string, i: RequestInit = {}) => fetch(`${URL_}/rest/v1/${p}`, { ...i, headers: { ...H, ...(i.headers || {}) } });

async function notifyAdmins(title: string, body: string) {
  const cfg = (await (await rest("push_config?id=eq.1&select=public_key,private_key")).json())[0];
  webpush.setVapidDetails("https://adircordoba24-svg.github.io/car-journal/", cfg.public_key, cfg.private_key);
  const admins = (await (await rest("app_admins?select=user_id")).json()).map((a: any) => a.user_id);
  if (!admins.length) return 0;
  const subs = await (await rest(`push_subs?user_id=in.(${admins.join(",")})&select=endpoint,p256dh,auth`)).json();
  let n = 0;
  for (const s of subs) {
    try { await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, JSON.stringify({ title, body, url: APP_URL, tag: "watch" }), { TTL: 3600 * 6, urgency: "high" }); n++; }
    catch (e: any) { console.error("push", e && e.statusCode); }
  }
  return n;
}
async function recentlySent(key: string, hours: number) {
  const r = await (await rest(`watch_alerts?key=eq.${key}&select=sent_at`)).json();
  return r[0] && Date.now() - Date.parse(r[0].sent_at) < hours * 3600e3;
}
const mark = (key: string) => rest("watch_alerts", { method: "POST", headers: { Prefer: "resolution=merge-duplicates" }, body: JSON.stringify({ key, sent_at: new Date().toISOString() }) });

async function isAllowed(req: Request) {
  const tok = req.headers.get("x-cron-token");
  const cfg = (await (await rest("push_config?id=eq.1&select=cron_token")).json())[0];
  if (tok && cfg && tok === cfg.cron_token) return "cron";
  const jwt = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!jwt || jwt === SK) return null;
  const r = await fetch(`${URL_}/rest/v1/rpc/is_admin`, { method: "POST", headers: { apikey: Deno.env.get("SUPABASE_ANON_KEY") ?? "", Authorization: `Bearer ${jwt}`, "Content-Type": "application/json" }, body: "{}" });
  return r.ok && (await r.json()) === true ? "admin" : null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  const who = await isAllowed(req);
  if (!who) return json({ error: "unauthorized" }, 401);
  const body = await req.json().catch(() => ({}));
  if (body.action === "test") return json({ sent: await notifyAdmins("יומן הרכב · בדיקת התראות", "ככה תיראה התראה כשיש קפיצה בשגיאות או בעלויות.") });

  const st = await (await rest("rpc/watch_status", { method: "POST", body: "{}" })).json();
  const alerts: { key: string; hours: number; title: string; body: string }[] = [];
  const e1 = +st.errors_1h || 0, eBase = +st.errors_per_hour_7d || 0;
  if (e1 >= 5 && e1 >= 3 * Math.max(eBase, 0.5))
    alerts.push({ key: "errors", hours: 6, title: `יומן הרכב: ${e1} שגיאות בשעה האחרונה`, body: `${st.errors_users_1h} משתמשים נפגעו (בדרך כלל ${eBase} בשעה). הנפוצה: ${String(st.top_error || "").slice(0, 90)}` });
  const c24 = +st.cost_24h || 0, cBase = +st.cost_per_day_14d || 0;
  if (c24 > 2 || (c24 > 0.5 && c24 >= 3 * Math.max(cBase, 0.05)))
    alerts.push({ key: "cost", hours: 24, title: `יומן הרכב: עלות AI קפצה ל־$${c24.toFixed(2)} ביממה`, body: `בדרך כלל $${cBase.toFixed(2)} ביום (≈ ₪${(c24 * 3.7).toFixed(0)}). פרטים במסך המנהל, בלשונית עלויות.` });
  if ((+st.calls_1h_top || 0) >= 40)
    alerts.push({ key: "abuse", hours: 6, title: "יומן הרכב: שימוש חריג בסוכן", body: `משתמש אחד ביצע ${st.calls_1h_top} פניות ל־AI בשעה האחרונה. כדאי לבדוק במסך המנהל.` });
  if ((+st.failed_ai_1h || 0) >= 5)
    alerts.push({ key: "aifail", hours: 6, title: "יומן הרכב: הסוכן נכשל שוב ושוב", body: `${st.failed_ai_1h} פניות נכשלו בשעה האחרונה. ייתכן שנגמר הקרדיט או שהמפתח לא תקין.` });

  const sent: string[] = [];
  for (const a of alerts) {
    if (await recentlySent(a.key, a.hours)) continue;
    if (await notifyAdmins(a.title, a.body)) { await mark(a.key); sent.push(a.key); }
  }
  return json({ status: st, alerts: alerts.map((a) => a.key), sent });
});
