// Car Journal: holds the API key and calls Claude, with a monthly quota per user.
// Sonnet 5.5 for receipts and chat, Opus 5.5 for planning, analysis and reading insurance documents.
const MODELS: Record<string, string> = { sonnet: "claude-sonnet-5-5", opus: "claude-opus-5-5" };
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
function kindOf(body: any): string {
  const msgs = Array.isArray(body.messages) ? body.messages : [];
  const has = (t: string) => msgs.some((m: any) => Array.isArray(m.content) && m.content.some((p: any) => p && p.type === t));
  if (has("document") || body.purpose === "document") return "analysis"; // insurance policy / vehicle license
  if (has("image")) return "receipt";
  if (Array.isArray(body.tools) && body.tools.length) return "chat";
  if (body.tier === "opus") return "analysis";
  return "chat";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  const url = Deno.env.get("SUPABASE_URL")!;
  // only a signed-in user of this project may use the key
  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return json({ error: "unauthorized" }, 401);
  const who = await fetch(`${url}/auth/v1/user`, { headers: { Authorization: `Bearer ${token}`, apikey: Deno.env.get("SUPABASE_ANON_KEY") ?? "" } });
  if (!who.ok) return json({ error: "unauthorized" }, 401);
  const user = await who.json().catch(() => null);
  if (!user || !user.id) return json({ error: "unauthorized" }, 401);
  const key = Deno.env.get("ANTHROPIC_API_KEY");
  if (!key) return json({ error: "missing_api_key" }, 500);
  let body: any;
  try { body = await req.json(); } catch { return json({ error: "bad_json" }, 400); }
  if (!Array.isArray(body.messages) || !body.messages.length) return json({ error: "bad_request" }, 400);

  // monthly quota, counted on the server
  const kind = kindOf(body);
  const sk = serviceKey();
  const q = await fetch(`${url}/rest/v1/rpc/ai_consume`, {
    method: "POST",
    headers: { apikey: sk, Authorization: `Bearer ${sk}`, "Content-Type": "application/json" },
    body: JSON.stringify({ p_user: user.id, p_kind: kind }),
  });
  if (!q.ok) {
    const t = await q.text();
    if (t.includes("quota_exceeded")) return json({ error: "quota_exceeded", kind }, 429);
    return json({ error: "quota_check_failed" }, 500);
  }
  const remaining = await q.json().catch(() => null);

  const model = MODELS[body.tier] ?? MODELS.sonnet;
  const payload: Record<string, unknown> = { model, max_tokens: Math.min(Number(body.max_tokens) || 1500, body.tier === "opus" ? 8000 : 3000), messages: body.messages };
  if (typeof body.system === "string") payload.system = body.system;
  if (Array.isArray(body.tools) && body.tools.length) payload.tools = body.tools.slice(0, 12);
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  const text = await r.text();
  return new Response(text, {
    status: r.status,
    headers: { ...CORS, "Content-Type": "application/json", "X-Quota-Kind": kind, "X-Quota-Remaining": String(remaining ?? "") },
  });
});
