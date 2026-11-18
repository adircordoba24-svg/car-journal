// Car Journal: encrypts and decrypts sensitive fields. The key (CJ_ENC_KEY) exists only here, as a function secret.
// Never logs values: no console output at all, and errors return short codes only.
import { decryptValue, encryptValue, importKey } from "./crypto.ts";

const ORIGINS = new Set(["https://adircordoba24-svg.github.io", "http://localhost:5500", "http://127.0.0.1:5500"]);
const FIELD = /^[a-z]{1,20}\.[a-zA-Z]{1,30}$/; // "collection.field"
const MAX_ITEMS = 500, MAX_LEN = 20000;

let keyP: Promise<CryptoKey> | null = null;
const getKey = () => {
  const k = Deno.env.get("CJ_ENC_KEY");
  if (!k) return null;
  return (keyP ??= importKey(k));
};

Deno.serve(async (req) => {
  const origin = req.headers.get("Origin") ?? "";
  const cors: Record<string, string> = {
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
    "Cache-Control": "no-store",
  };
  if (ORIGINS.has(origin)) cors["Access-Control-Allow-Origin"] = origin;
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return json({ error: "unauthorized" }, 401);
  const who = await fetch(`${Deno.env.get("SUPABASE_URL")}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${token}`, apikey: Deno.env.get("SUPABASE_ANON_KEY") ?? "" },
  });
  const user = who.ok ? await who.json().catch(() => null) : null;
  if (!user?.id) return json({ error: "unauthorized" }, 401);

  const keyPromise = getKey();
  if (!keyPromise) return json({ error: "missing_key" }, 500);

  let body: any;
  try { body = await req.json(); } catch { return json({ error: "bad_json" }, 400); }
  const op = body?.op, items = body?.items;
  if ((op !== "enc" && op !== "dec") || !Array.isArray(items) || items.length > MAX_ITEMS) return json({ error: "bad_request" }, 400);
  for (const it of items) {
    if (!it || typeof it.f !== "string" || !FIELD.test(it.f) || typeof it.v !== "string" || it.v.length > MAX_LEN) {
      return json({ error: "bad_request" }, 400);
    }
  }

  try {
    const key = await keyPromise;
    const out = await Promise.all(items.map((it: { f: string; v: string }) => {
      const aad = `${user.id}|${it.f}`;
      return op === "enc" ? encryptValue(key, aad, it.v) : decryptValue(key, aad, it.v);
    }));
    return json({ items: out });
  } catch {
    keyP = null;
    return json({ error: op === "enc" ? "encrypt_failed" : "decrypt_failed" }, 400);
  }
});
