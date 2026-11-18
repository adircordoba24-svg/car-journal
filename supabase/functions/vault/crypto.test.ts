// Run: node --test supabase/functions/vault/crypto.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { decryptValue, encryptValue, importKey, isEncrypted, PREFIX } from "./crypto.ts";

const rawKey = () => btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))));
const A = "11111111-1111-1111-1111-111111111111|garage.plate";

test("round trip, Hebrew text", async () => {
  const k = await importKey(rawKey());
  const v = "12-345-67 הערה: חשבונית 4471";
  const c = await encryptValue(k, A, v);
  assert.ok(c.startsWith(PREFIX));
  assert.ok(!c.includes("12-345-67"));
  assert.equal(await decryptValue(k, A, c), v);
});

test("random IV: same value encrypts differently", async () => {
  const k = await importKey(rawKey());
  const a = await encryptValue(k, A, "x"), b = await encryptValue(k, A, "x");
  assert.notEqual(a, b);
  assert.notEqual(a.split(":")[2], b.split(":")[2]);
});

test("another user cannot decrypt (AAD)", async () => {
  const k = await importKey(rawKey());
  const c = await encryptValue(k, A, "secret");
  await assert.rejects(decryptValue(k, "22222222-2222-2222-2222-222222222222|garage.plate", c));
});

test("value moved to another field cannot decrypt (AAD)", async () => {
  const k = await importKey(rawKey());
  const c = await encryptValue(k, A, "secret");
  await assert.rejects(decryptValue(k, "11111111-1111-1111-1111-111111111111|fuel.note", c));
});

test("tampered ciphertext is rejected", async () => {
  const k = await importKey(rawKey());
  const c = await encryptValue(k, A, "secret");
  const last = c.at(-2) === "A" ? "B" : "A";
  await assert.rejects(decryptValue(k, A, c.slice(0, -2) + last + c.at(-1)));
});

test("wrong key is rejected", async () => {
  const c = await encryptValue(await importKey(rawKey()), A, "secret");
  await assert.rejects(decryptValue(await importKey(rawKey()), A, c));
});

test("legacy plaintext passes through for migration", async () => {
  const k = await importKey(rawKey());
  assert.equal(await decryptValue(k, A, "old note"), "old note");
  assert.equal(isEncrypted("old note"), false);
});

test("key must be 32 bytes", async () => {
  await assert.rejects(importKey(btoa("short")));
});
