// Car Journal: speech to text for voice entry.
// The phone records a short clip; this turns it into Hebrew text with OpenAI's transcription model.
// Needs the secret OPENAI_API_KEY (set by the owner in Supabase → Edge Functions → Secrets). Without it, {ready:false}.
// Signed-in users only; each clip counts as one advisor message (kind "chat") in the monthly quota.
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
const MODEL = "gpt-4o-mini-transcribe";
const USD_PER_MIN = 0.003;
const PROMPT = "רישום ביומן רכב: תדלוק, ליטרים, שקלים, קילומטראז׳, טיפול, מוסך, צמיגים, חניה, ביטוח, טסט, כביש 6, שטיפה.";

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
  let body: any;
  try { body = await req.json(); } catch { return json({ error: "bad_json" }, 400); }
  const key = Deno.env.get("OPENAI_API_KEY");
  if (body.ping) return json({ ready: !!key });
  if (!key) return json({ error: "missing_key", ready: false }, 200);
  if (typeof body.audio !== "string" || !body.audio) return json({ error: "bad_request" }, 400);
  const bytes = Uint8Array.from(atob(body.audio), (c) => c.charCodeAt(0));
  if (bytes.length > 4_000_000) return json({ error: "too_long" }, 413);

  const sk = serviceKey();
  const q = await fetch(`${url}/rest/v1/rpc/ai_consume`, {
    method: "POST", headers: { apikey: sk, Authorization: `Bearer ${sk}`, "Content-Type": "application/json" },
    body: JSON.stringify({ p_user: user.id, p_kind: "chat" }),
  });
  if (!q.ok) { const t = await q.text(); return json({ error: t.includes("quota_exceeded") ? "quota_exceeded" : "quota_check_failed", kind: "chat" }, t.includes("quota_exceeded") ? 429 : 500); }

  const type = String(body.type || "audio/webm").split(";")[0];
  const ext = /mp4|m4a|aac/.test(type) ? "m4a" : /ogg/.test(type) ? "ogg" : /wav/.test(type) ? "wav" : /mpeg|mp3/.test(type) ? "mp3" : "webm";
  const fd = new FormData();
  fd.append("file", new Blob([bytes], { type }), `clip.${ext}`);
  fd.append("model", MODEL);
  fd.append("language", "he");
  fd.append("prompt", PROMPT);
  fd.append("response_format", "json");
  const r = await fetch("https://api.openai.com/v1/audio/transcriptions", { method: "POST", headers: { Authorization: `Bearer ${key}` }, body: fd });
  const out = await r.json().catch(() => ({}));
  try {
    const secs = Math.max(1, Math.min(120, Number(body.seconds) || 5));
    await fetch(`${url}/rest/v1/ai_calls`, { method: "POST", headers: { apikey: sk, Authorization: `Bearer ${sk}`, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({ user_id: user.id, kind: "voice", model: MODEL, input_tokens: out?.usage?.input_tokens || 0, output_tokens: out?.usage?.output_tokens || 0, cache_read_tokens: 0, cost_usd: r.ok ? secs / 60 * USD_PER_MIN : 0, status: r.status }) });
  } catch (_) { /* logging never blocks the answer */ }
  if (!r.ok) { console.error("openai", r.status, JSON.stringify(out).slice(0, 300)); return json({ error: "stt_failed", status: r.status }, 502); }
  return json({ text: String(out.text || "").trim() });
});
