// Car Journal: nightly database backup.
// Every table that holds user data is exported to a gzipped JSON file in the private "backups" bucket.
// Called by the nightly cron (x-cron-token) or by an admin from the admin screen. Keeps the last 14 days.
// Receipt and document files themselves stay in the "receipts" bucket and are not copied here.
// action "drill": a restore drill. Downloads the newest backup, opens it, compares it with the live tables,
// restores the docs into the scratch table restore_drill, checks them against the live data, and empties it again.
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-token",
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
const TABLES = ["docs", "account_plans", "ai_usage", "ai_overrides", "ai_calls", "feedback", "client_errors", "push_subs", "push_sent", "app_admins"];
const KEEP_DAYS = 14;

async function allRows(table: string) {
  const out: unknown[] = [];
  for (let from = 0; from < 500000; from += 1000) {
    const r = await rest(`${table}?select=*`, { headers: { Range: `${from}-${from + 999}`, "Range-Unit": "items" } });
    if (!r.ok) throw new Error(`${table}: ${r.status}`);
    const rows = await r.json();
    out.push(...rows);
    if (rows.length < 1000) break;
  }
  return out;
}
async function isAllowed(req: Request) {
  const cfg = await (await rest("push_config?id=eq.1&select=cron_token")).json();
  const tok = req.headers.get("x-cron-token");
  if (tok && cfg[0] && tok === cfg[0].cron_token) return true;
  const jwt = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!jwt || jwt === SK) return false;
  const r = await fetch(`${URL_}/rest/v1/rpc/is_admin`, { method: "POST", headers: { apikey: Deno.env.get("SUPABASE_ANON_KEY") ?? "", Authorization: `Bearer ${jwt}`, "Content-Type": "application/json" }, body: "{}" });
  return r.ok && (await r.json()) === true;
}

async function drill() {
  const t0 = Date.now();
  const list = await (await fetch(`${URL_}/storage/v1/object/list/backups`, { method: "POST", headers: H, body: JSON.stringify({ prefix: "", limit: 1000, sortBy: { column: "created_at", order: "desc" } }) })).json();
  const newest = (Array.isArray(list) ? list : []).filter((o: any) => /\.json\.gz$/.test(o.name || ""))[0];
  if (!newest) return { ok: false, step: "find", error: "no backup files" };
  const f = await fetch(`${URL_}/storage/v1/object/backups/${newest.name}`, { headers: { apikey: SK, Authorization: `Bearer ${SK}` } });
  if (!f.ok) return { ok: false, step: "download", status: f.status };
  const text = await new Response(f.body!.pipeThrough(new DecompressionStream("gzip"))).text();
  let dump: any; try { dump = JSON.parse(text); } catch { return { ok: false, step: "open", error: "not valid JSON" }; }
  const tables: Record<string, { backup: number; live: number }> = {};
  for (const t of TABLES) {
    const r = await rest(`${t}?select=*`, { method: "HEAD", headers: { Prefer: "count=exact", Range: "0-0" } });
    const live = Number((r.headers.get("content-range") || "*/0").split("/")[1]) || 0;
    tables[t] = { backup: (dump.tables?.[t] || []).length, live };
  }
  // restore the docs into the scratch table, then compare with the live rows
  const docs = (dump.tables?.docs || []) as any[];
  await rest("restore_drill?collection=not.is.null", { method: "DELETE" });
  for (let i = 0; i < docs.length; i += 500) {
    const part = docs.slice(i, i + 500).map((d) => ({ collection: d.collection, id: d.id, user_id: d.user_id, data: d.data }));
    const r = await rest("restore_drill", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify(part) });
    if (!r.ok) return { ok: false, step: "restore", status: r.status, error: (await r.text()).slice(0, 200) };
  }
  const restored = await (await rest("restore_drill?select=collection,id,data")).json();
  const live = await (await rest("docs?select=collection,id,data")).json();
  const key = (d: any) => d.collection + "/" + d.id;
  const liveMap = new Map(live.map((d: any) => [key(d), JSON.stringify(d.data)]));
  let same = 0, changedSince = 0, missingNow = 0;
  for (const d of restored) { const l = liveMap.get(key(d)); if (l === undefined) missingNow++; else if (l === JSON.stringify(d.data)) same++; else changedSince++; }
  await rest("restore_drill?collection=not.is.null", { method: "DELETE" });
  const createdAt = dump.createdAt || newest.created_at;
  return { ok: restored.length === docs.length, file: newest.name, createdAt, ageHours: Math.round((Date.now() - Date.parse(createdAt)) / 36e5),
    restored: restored.length, sameAsLive: same, changedSince, deletedSince: missingNow, addedSince: Math.max(0, live.length - (restored.length - missingNow)), tables, users: (dump.tables?.users || []).length, ms: Date.now() - t0 };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  if (!(await isAllowed(req))) return json({ error: "unauthorized" }, 401);
  const reqBody = await req.json().catch(() => ({}));
  if (reqBody.action === "drill") { try { return json(await drill()); } catch (e) { return json({ ok: false, step: "error", error: String(e) }, 500); } }
  const started = Date.now();
  const dump: Record<string, unknown> = { app: "car-journal", createdAt: new Date().toISOString(), tables: {} };
  const counts: Record<string, number> = {};
  for (const t of TABLES) {
    try { const rows = await allRows(t); (dump.tables as any)[t] = rows; counts[t] = rows.length; }
    catch (e) { counts[t] = -1; console.error(String(e)); }
  }
  // users (id, email, dates) so the backup can be matched back to accounts
  try {
    const users: unknown[] = [];
    for (let page = 1; page < 50; page++) {
      const r = await fetch(`${URL_}/auth/v1/admin/users?page=${page}&per_page=200`, { headers: H });
      const j = await r.json(); const list = (j.users || []).map((u: any) => ({ id: u.id, email: u.email, created_at: u.created_at, last_sign_in_at: u.last_sign_in_at }));
      users.push(...list); if (list.length < 200) break;
    }
    (dump.tables as any).users = users; counts.users = users.length;
  } catch (e) { counts.users = -1; }

  const body = new Blob([JSON.stringify(dump)]).stream().pipeThrough(new CompressionStream("gzip"));
  const gz = new Uint8Array(await new Response(body).arrayBuffer());
  const stamp = new Date(Date.now() + 2 * 3600e3).toISOString().slice(0, 16).replace("T", "_").replace(":", "-");
  const name = `db-${stamp}.json.gz`;
  const up = await fetch(`${URL_}/storage/v1/object/backups/${name}`, { method: "POST", headers: { apikey: SK, Authorization: `Bearer ${SK}`, "Content-Type": "application/gzip", "x-upsert": "true" }, body: gz });
  if (!up.ok) return json({ error: "upload_failed", status: up.status }, 500);

  // keep the last KEEP_DAYS days
  let removed = 0;
  try {
    const list = await (await fetch(`${URL_}/storage/v1/object/list/backups`, { method: "POST", headers: H, body: JSON.stringify({ prefix: "", limit: 1000, sortBy: { column: "created_at", order: "asc" } }) })).json();
    const cutoff = Date.now() - KEEP_DAYS * 864e5;
    const old = (Array.isArray(list) ? list : []).filter((o: any) => o.name && o.created_at && Date.parse(o.created_at) < cutoff).map((o: any) => o.name);
    if (old.length) { await fetch(`${URL_}/storage/v1/object/backups`, { method: "DELETE", headers: H, body: JSON.stringify({ prefixes: old }) }); removed = old.length; }
  } catch (_) { /* cleanup is best effort */ }
  return json({ ok: true, file: name, bytes: gz.length, counts, removed, ms: Date.now() - started });
});
