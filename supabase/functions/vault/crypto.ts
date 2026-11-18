// Car Journal: field encryption. AES-256-GCM, random 12-byte IV per value.
// Stored format: enc:v1:<base64 iv>:<base64 ciphertext+tag>
// AAD = "<user id>|<field>", so a value only decrypts for the same user and field.
export const PREFIX = "enc:v1:";

const enc = new TextEncoder();
const dec = new TextDecoder();
const b64 = (u: Uint8Array) => btoa(String.fromCharCode(...u));
const unb64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

export async function importKey(base64Key: string): Promise<CryptoKey> {
  const raw = unb64(base64Key.trim());
  if (raw.length !== 32) throw new Error("bad_key_length");
  return crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

export const isEncrypted = (v: unknown) => typeof v === "string" && v.startsWith(PREFIX);

export async function encryptValue(key: CryptoKey, aad: string, plain: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv, additionalData: enc.encode(aad) }, key, enc.encode(plain)),
  );
  return PREFIX + b64(iv) + ":" + b64(ct);
}

export async function decryptValue(key: CryptoKey, aad: string, stored: string): Promise<string> {
  if (!isEncrypted(stored)) return stored; // legacy plaintext, migrated on next save
  const [ivB, ctB] = stored.slice(PREFIX.length).split(":");
  if (!ivB || !ctB) throw new Error("bad_format");
  const pt = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: unb64(ivB), additionalData: enc.encode(aad) }, key, unb64(ctB),
  );
  return dec.decode(pt);
}
