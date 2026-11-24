// Car Journal: official Ministry of Transport open data (data.gov.il), for signed-in users.
//   {action:"car", plate}  -> the registry record (make, model, year, fuel, color, test valid until…) and recalls:
//                              open recalls for this exact vehicle, and recalls published for the model and build years.
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...CORS, "Content-Type": "application/json" } });
const API = "https://data.gov.il/api/3/action/datastore_search";
const REGISTRY = "053cea08-09bc-40ec-8f7a-156f0677aff3";      // private and commercial vehicles
const OPEN_RECALLS = "36bf1404-0be4-49d2-82dc-2f1ead4a8b93";  // vehicles with a recall not done (6+ months after the letter)
const MODEL_RECALLS = "2c33523f-87aa-44ec-a736-edbb0a82975e"; // every recall by make, model and build dates

async function ds(resource: string, params: Record<string, string>) {
  const u = new URL(API); u.searchParams.set("resource_id", resource);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  const r = await fetch(u, { headers: { "User-Agent": "car-journal/1.0" } });
  if (!r.ok) throw new Error("gov " + r.status);
  const j = await r.json();
  if (!j.success) throw new Error("gov failed");
  return j.result.records as any[];
}
const norm = (s: string) => String(s || "").toUpperCase().replace(/[^A-Z0-9א-ת]/g, "");
const fmtPlate = (d: string) => d.length === 7 ? `${d.slice(0, 2)}-${d.slice(2, 5)}-${d.slice(5)}` : d.length === 8 ? `${d.slice(0, 3)}-${d.slice(3, 5)}-${d.slice(5)}` : d;

async function lookup(plate: string) {
  const d = String(plate || "").replace(/\D/g, "");
  if (d.length < 5 || d.length > 8) return { error: "bad_plate" };
  const [rec] = await ds(REGISTRY, { filters: JSON.stringify({ mispar_rechev: Number(d) }), limit: "1" });
  const out: any = { plate: fmtPlate(d), found: !!rec, recalls: [] };
  if (rec) {
    out.car = {
      make: String(rec.tozeret_nm || "").trim(), model: String(rec.kinuy_mishari || rec.degem_nm || "").trim(), trim: rec.ramat_gimur || "",
      year: rec.shnat_yitzur || null, fuel: rec.sug_delek_nm || "", color: rec.tzeva_rechev || "", ownership: rec.baalut || "",
      testValidUntil: rec.tokef_dt || "", lastTest: rec.mivchan_acharon_dt || "", onRoad: rec.moed_aliya_lakvish || "",
      tiresFront: rec.zmig_kidmi || "", tiresRear: rec.zmig_ahori || "", modelCode: rec.degem_nm || "",
    };
  }
  // open recalls for this exact vehicle
  try {
    const open = await ds(OPEN_RECALLS, { filters: JSON.stringify({ MISPAR_RECHEV: Number(d) }), limit: "20" });
    for (const r of open) out.recalls.push({ id: String(r.RECALL_ID), exact: true, type: r.SUG_RECALL, area: r.SUG_TAKALA, desc: r.TEUR_TAKALA, opened: r.TAARICH_PTICHA });
  } catch (_) { /* best effort */ }
  // recalls published for the model and the build years
  if (rec && (rec.kinuy_mishari || rec.degem_nm)) {
    try {
      const name = String(rec.kinuy_mishari || "").trim();
      const list = name ? await ds(MODEL_RECALLS, { q: name, limit: "60" }) : [];
      const y = Number(rec.shnat_yitzur) || 0;
      for (const r of list) {
        const models = String(r.DEGEM || "").split(/[,/]/).map(norm).filter(Boolean);
        if (!models.some((m) => m === norm(name) || (norm(name).length >= 4 && (m.includes(norm(name)) || norm(name).includes(m))))) continue;
        const b0 = Number(String(r.BUILD_BEGIN_A || "").slice(0, 4)) || 0, b1 = Number(String(r.BUILD_END_A || "").slice(0, 4)) || 9999;
        if (y && (y < b0 - 1 || y > b1)) continue;
        if (out.recalls.some((x: any) => x.id === String(r.RECALL_ID))) { const x = out.recalls.find((z: any) => z.id === String(r.RECALL_ID)); Object.assign(x, { fix: r.OFEN_TIKUN, importer: r.YEVUAN_TEUR, phone: r.TELEPHONE, website: r.WEBSITE }); continue; }
        out.recalls.push({ id: String(r.RECALL_ID), exact: false, type: r.SUG_RECALL, area: r.SUG_TAKALA, desc: r.TEUR_TAKALA, year: r.SHNAT_RECALL, fix: r.OFEN_TIKUN, importer: r.YEVUAN_TEUR, phone: r.TELEPHONE, website: r.WEBSITE, built: `${r.BUILD_BEGIN_A || ""} – ${r.BUILD_END_A || ""}` });
      }
    } catch (_) { /* best effort */ }
  }
  out.recalls.sort((a: any, b: any) => Number(b.exact) - Number(a.exact) || String(b.opened || b.year || "").localeCompare(String(a.opened || a.year || "")));
  return out;
}

// signed-in users, or the server's own scheduled jobs (x-cron-token)
async function allowed(req: Request) {
  const URL_ = Deno.env.get("SUPABASE_URL")!;
  const cron = req.headers.get("x-cron-token");
  if (cron) {
    const l = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || (() => { try { const k = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}"); return k.default ?? Object.values(k)[0] ?? ""; } catch { return ""; } })();
    const cfg = (await (await fetch(`${URL_}/rest/v1/push_config?id=eq.1&select=cron_token`, { headers: { apikey: l, Authorization: `Bearer ${l}` } })).json())[0];
    return !!cfg && cron === cfg.cron_token;
  }
  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return false;
  const who = await fetch(`${URL_}/auth/v1/user`, { headers: { Authorization: `Bearer ${token}`, apikey: Deno.env.get("SUPABASE_ANON_KEY") ?? "" } });
  return who.ok;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  if (!(await allowed(req))) return json({ error: "unauthorized" }, 401);
  const body = await req.json().catch(() => ({}));
  if (body.action === "car") { try { return json(await lookup(body.plate)); } catch (e) { return json({ error: "gov_unavailable", detail: String(e) }, 502); } }
  return json({ error: "bad_action" }, 400);
});
