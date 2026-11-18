// Car Journal: permanently deletes the signed-in user's account, records and receipts.
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  const url = Deno.env.get("SUPABASE_URL")!;
  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return json({ error: "unauthorized" }, 401);
  const who = await fetch(`${url}/auth/v1/user`, { headers: { Authorization: `Bearer ${token}`, apikey: Deno.env.get("SUPABASE_ANON_KEY") ?? "" } });
  if (!who.ok) return json({ error: "unauthorized" }, 401);
  const user = await who.json().catch(() => null);
  if (!user || !user.id) return json({ error: "unauthorized" }, 401);
  const body = await req.json().catch(() => ({}));
  if (body.confirm !== "DELETE") return json({ error: "not_confirmed" }, 400);
  const sk = serviceKey();
  const h = { apikey: sk, Authorization: `Bearer ${sk}`, "Content-Type": "application/json" };

  // 1. receipts in storage (folder named after the user id)
  let removed = 0;
  for (let round = 0; round < 20; round++) {
    const list = await fetch(`${url}/storage/v1/object/list/receipts`, { method: "POST", headers: h, body: JSON.stringify({ prefix: user.id, limit: 1000, offset: 0 }) });
    const items = list.ok ? await list.json() : [];
    const paths = (Array.isArray(items) ? items : []).filter((o: any) => o && o.name).map((o: any) => `${user.id}/${o.name}`);
    if (!paths.length) break;
    const del = await fetch(`${url}/storage/v1/object/receipts`, { method: "DELETE", headers: h, body: JSON.stringify({ prefixes: paths }) });
    if (!del.ok) return json({ error: "storage_delete_failed" }, 500);
    removed += paths.length;
  }
  // 2. the user; records and AI usage are removed with it (on delete cascade)
  const del = await fetch(`${url}/auth/v1/admin/users/${user.id}`, { method: "DELETE", headers: h });
  if (!del.ok) return json({ error: "user_delete_failed", status: del.status }, 500);
  return json({ ok: true, receipts_removed: removed });
});
