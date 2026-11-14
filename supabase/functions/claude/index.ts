// Car Journal: holds the API key and calls Claude.
// Sonnet 5.5 for receipts and chat, Opus 5.5 for planning and analysis.
const MODELS: Record<string, string> = {
  sonnet: "claude-sonnet-5-5",
  opus: "claude-opus-5-5",
};
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  // only a signed-in user of this project may use the key
  const auth = req.headers.get("Authorization") ?? "";
  const token = auth.replace(/^Bearer\s+/i, "");
  if (!token) return json({ error: "unauthorized" }, 401);
  const who = await fetch(`${Deno.env.get("SUPABASE_URL")}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${token}`, apikey: Deno.env.get("SUPABASE_ANON_KEY") ?? "" },
  });
  if (!who.ok) return json({ error: "unauthorized" }, 401);
  const user = await who.json().catch(() => null);
  if (!user || !user.id) return json({ error: "unauthorized" }, 401);
  const key = Deno.env.get("ANTHROPIC_API_KEY");
  if (!key) return json({ error: "missing_api_key" }, 500);
  let body: any;
  try { body = await req.json(); } catch { return json({ error: "bad_json" }, 400); }
  const model = MODELS[body.tier] ?? MODELS.sonnet;
  const payload: Record<string, unknown> = {
    model,
    max_tokens: Math.min(Number(body.max_tokens) || 1500, 4000),
    messages: body.messages,
  };
  if (body.system) payload.system = body.system;
  if (Array.isArray(body.tools) && body.tools.length) payload.tools = body.tools;
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  const text = await r.text();
  return new Response(text, { status: r.status, headers: { ...CORS, "Content-Type": "application/json" } });
});
