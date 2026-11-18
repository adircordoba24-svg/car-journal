/* יומן הרכב: חיבור ל-Supabase.
   מספק לאפליקציה את אותו ממשק שהיא מקבלת בתוך Claude (db, assets, sample),
   כך שאותו קוד עובד גם בתוך Claude וגם כאפליקציה עצמאית. */
(function () {
  "use strict";
  var C = window.CJ_CONFIG || {};
  var sb = window.supabase.createClient(C.url, C.anonKey, {
    auth: { persistSession: true, autoRefreshToken: true, storageKey: "cj-auth" }
  });
  window.cjSB = sb;
  var uid = null;

  /* ---------- כניסה ---------- */
  var css = document.createElement("style");
  css.textContent =
    ".cj-login{position:fixed;inset:0;z-index:90;display:grid;place-items:center;background:var(--bg);" +
    "padding:max(16px,env(safe-area-inset-top)) max(16px,env(safe-area-inset-right)) max(16px,env(safe-area-inset-bottom)) max(16px,env(safe-area-inset-left))}" +
    ".cj-login form{width:min(380px,100%);display:flex;flex-direction:column;gap:14px;text-align:center}" +
    ".cj-login img{width:96px;height:96px;border-radius:26px;margin:0 auto 4px;box-shadow:0 0 0 1px var(--line)}" +
    ".cj-login h1{font-family:var(--f-display);font-size:34px;margin:0}" +
    ".cj-login p{margin:0;color:var(--muted);font-size:14px}" +
    ".cj-login .field{text-align:start}" +
    ".cj-login .err{color:var(--crit);font-size:14px;min-height:1.4em}" +
    ".cj-login .switch{background:none;border:0;color:var(--accent);font-size:14px;padding:6px}";
  document.head.appendChild(css);

  var HEB = {
    "Invalid login credentials": "המייל או הסיסמה לא נכונים",
    "User already registered": "כבר יש חשבון עם המייל הזה. נסה להיכנס",
    "Signups not allowed for this instance": "ההרשמה סגורה. היכנס עם החשבון הקיים",
    "Email not confirmed": "צריך לאשר את המייל לפני הכניסה"
  };
  function showLogin(done) {
    if (!document.body) { document.addEventListener("DOMContentLoaded", function () { showLogin(done); }); return; }
    var mode = "in";
    var el = document.createElement("div");
    el.className = "cj-login";
    el.innerHTML =
      '<form novalidate><img src="icons/emblem.png" alt=""><h1>יומן הרכב</h1><p id="cjSub">כניסה לחשבון שלך</p>' +
      '<div class="field"><label for="cjEmail">מייל</label><input type="text" id="cjEmail" inputmode="email" autocomplete="email" dir="ltr"></div>' +
      '<div class="field"><label for="cjPass">סיסמה</label><input type="password" id="cjPass" autocomplete="current-password" dir="ltr" style="width:100%;background:var(--bg);border:1px solid var(--line);border-radius:10px;padding:11px 12px;font-size:16px;min-height:46px"></div>' +
      '<div class="err" id="cjErr" role="alert"></div>' +
      '<button class="btn primary block" type="submit" id="cjGo">כניסה</button>' +
      '<button class="switch" type="button" id="cjSwitch">פעם ראשונה? יצירת חשבון</button></form>';
    document.body.appendChild(el);
    var f = el.querySelector("form"), err = el.querySelector("#cjErr"), go = el.querySelector("#cjGo");
    el.querySelector("#cjSwitch").onclick = function () {
      mode = mode === "in" ? "up" : "in";
      go.textContent = mode === "in" ? "כניסה" : "יצירת חשבון";
      el.querySelector("#cjSub").textContent = mode === "in" ? "כניסה לחשבון שלך" : "בחר מייל וסיסמה (לפחות 8 תווים)";
      el.querySelector("#cjPass").autocomplete = mode === "in" ? "current-password" : "new-password";
      this.textContent = mode === "in" ? "פעם ראשונה? יצירת חשבון" : "כבר יש לי חשבון";
      err.textContent = "";
    };
    f.onsubmit = async function (e) {
      e.preventDefault();
      var email = el.querySelector("#cjEmail").value.trim(), password = el.querySelector("#cjPass").value;
      if (!email || !password) { err.textContent = "צריך מייל וסיסמה"; return; }
      if (mode === "up" && password.length < 8) { err.textContent = "הסיסמה צריכה לפחות 8 תווים"; return; }
      go.disabled = true; err.textContent = "";
      try {
        var res = mode === "in"
          ? await sb.auth.signInWithPassword({ email: email, password: password })
          : await sb.auth.signUp({ email: email, password: password });
        if (res.error) throw res.error;
        if (!res.data.session) { err.textContent = "נשלח אליך מייל לאישור. אשר אותו ואז היכנס."; go.disabled = false; return; }
        uid = res.data.session.user.id;
        el.remove(); done();
      } catch (x) {
        err.textContent = HEB[x && x.message] || "הכניסה לא הצליחה. בדוק את הפרטים ונסה שוב.";
        go.disabled = false;
      }
    };
  }
  var ready = new Promise(function (res) {
    sb.auth.getSession().then(function (r) {
      var s = r.data && r.data.session;
      if (s) { uid = s.user.id; res(); } else showLogin(res);
    });
  });
  sb.auth.onAuthStateChange(function (ev, s) {
    if (s) uid = s.user.id;
    if (ev === "SIGNED_OUT") location.reload();
  });
  window.cjSignOut = function () { sb.auth.signOut(); };

  /* ---------- נתונים ---------- */
  var cache = {}, listeners = {};
  function rid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
  function snap(c) {
    var rows = cache[c] || [];
    var meta = { fromCache: false, hasPendingWrites: false };
    return {
      docs: rows.map(function (r) { return { id: r.id, exists: true, data: function () { return r.data; }, metadata: meta }; }),
      size: rows.length, empty: !rows.length, docChanges: function () { return []; }, metadata: meta
    };
  }
  function emit(c) { (listeners[c] || []).forEach(function (f) { try { f(snap(c)); } catch (e) { console.error(e); } }); }
  /* ---------- הצפנת שדות רגישים ----------
     מספר הרישוי וכל ההערות נשמרים מוצפנים (AES-256-GCM). המפתח נמצא רק בשרת, בפונקציה vault.
     ערך ישן שלא הוצפן נקרא כרגיל ומוצפן בשמירה הבאה. אם vault לא זמין, לא נשמר כלום בטקסט גלוי. */
  var ENC = "enc:v1:";
  var SENSITIVE = { garage: ["plate", "note"] };
  function fieldsOf(c) { return SENSITIVE[c] || ["note"]; }
  async function vault(op, items) {
    if (!items.length) return [];
    var r = await sb.functions.invoke("vault", { body: { op: op, items: items } });
    if (r.error || !r.data || !Array.isArray(r.data.items)) throw { code: "vault_unavailable", message: "vault_unavailable" };
    return r.data.items;
  }
  async function encryptDoc(c, d) {
    var out = Object.assign({}, d), keys = [], items = [];
    fieldsOf(c).forEach(function (f) {
      var v = out[f];
      if (typeof v === "string" && v !== "" && v.indexOf(ENC) !== 0) { keys.push(f); items.push({ f: c + "." + f, v: v }); }
    });
    var res = await vault("enc", items);
    keys.forEach(function (f, i) { out[f] = res[i]; });
    return out;
  }
  async function decryptRows(c, rows) {
    var refs = [], items = [], legacy = [];
    rows.forEach(function (row) {
      var d = row.data = Object.assign({}, row.data), plain = false;
      fieldsOf(c).forEach(function (f) {
        var v = d[f];
        if (typeof v !== "string" || v === "") return;
        if (v.indexOf(ENC) === 0) { refs.push([d, f]); items.push({ f: c + "." + f, v: v }); }
        else plain = true;
      });
      if (plain) legacy.push(row);
    });
    var res = await vault("dec", items);
    refs.forEach(function (ref, i) { ref[0][ref[1]] = res[i]; });
    return legacy;
  }
  async function load(c) {
    var r = await sb.from("docs").select("id,data").eq("collection", c);
    if (r.error) throw r.error;
    var rows = r.data.map(function (x) { return { id: x.id, data: x.data }; });
    var legacy = await decryptRows(c, rows);
    cache[c] = rows;
    emit(c);
    for (var i = 0; i < legacy.length; i++) {
      try { await upsert(c, legacy[i].id, legacy[i].data); } catch (e) { /* retried on next load */ }
    }
  }
  function setLocal(c, id, d) {
    var arr = cache[c] = cache[c] || [];
    var i = arr.findIndex(function (x) { return x.id === id; });
    if (i >= 0) arr[i] = { id: id, data: d }; else arr.push({ id: id, data: d });
    emit(c);
  }
  async function upsert(c, id, d) {
    var stored = await encryptDoc(c, d);
    var r = await sb.from("docs").upsert(
      { id: id, collection: c, data: stored, user_id: uid, updated_at: new Date().toISOString() },
      { onConflict: "user_id,collection,id" });
    if (r.error) throw r.error;
  }
  function merge(a, b) {
    var o = Object.assign({}, a);
    Object.keys(b).forEach(function (k) {
      var v = b[k];
      if (v && typeof v === "object" && !Array.isArray(v) && a && a[k] && typeof a[k] === "object" && !Array.isArray(a[k])) o[k] = merge(a[k], v);
      else o[k] = v;
    });
    return o;
  }
  function plain(d) { return JSON.parse(JSON.stringify(d)); }
  function docRef(c, id) {
    return {
      id: id, path: c + "/" + id,
      get: async function () {
        var r = (cache[c] || []).find(function (x) { return x.id === id; });
        return { id: id, exists: !!r, data: function () { return r && r.data; }, metadata: {} };
      },
      set: async function (d) { var v = plain(d); setLocal(c, id, v); await upsert(c, id, v); },
      update: async function (d) {
        var cur = (cache[c] || []).find(function (x) { return x.id === id; });
        if (!cur) throw { code: "invalid_argument", message: "missing document" };
        var v = merge(cur.data, plain(d)); setLocal(c, id, v); await upsert(c, id, v);
      },
      delete: async function () {
        cache[c] = (cache[c] || []).filter(function (x) { return x.id !== id; }); emit(c);
        var r = await sb.from("docs").delete().eq("collection", c).eq("id", id);
        if (r.error) throw r.error;
      },
      onSnapshot: function () { return function () {}; }
    };
  }
  function collection(c) {
    var q = {
      path: c,
      onSnapshot: function (next, onErr) {
        (listeners[c] = listeners[c] || []).push(next);
        load(c).catch(function (e) { console.error(e); if (onErr) onErr({ code: "unavailable", message: String(e && e.message || e) }); });
        return function () { listeners[c] = (listeners[c] || []).filter(function (f) { return f !== next; }); };
      },
      doc: function (id) { return docRef(c, id || rid()); },
      add: async function (d) { var id = rid(); await docRef(c, id).set(d); return docRef(c, id); },
      get: async function () { return snap(c); }
    };
    q.where = q.orderBy = q.limit = function () { return q; };
    return q;
  }
  var db = { collection: collection, doc: function (p) { var s = p.split("/"); return docRef(s[0], s[1]); } };
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible" && uid) Object.keys(listeners).forEach(function (c) { load(c).catch(function () {}); });
  });

  /* ---------- קבלות ---------- */
  var urls = {};
  async function signed(path) {
    var hit = urls[path];
    if (hit && hit.exp > Date.now()) return hit.url;
    var r = await sb.storage.from("receipts").createSignedUrl(path, 3600);
    if (r.error) throw r.error;
    urls[path] = { url: r.data.signedUrl, exp: Date.now() + 50 * 60e3 };
    return r.data.signedUrl;
  }
  var pending = {};
  window.__rcptUrl = function (id) {
    var hit = urls[id];
    if (hit && hit.exp > Date.now()) return hit.url;
    if (!pending[id]) {
      pending[id] = true;
      signed(id).then(function () { delete pending[id]; if (window.__rcptRefresh) window.__rcptRefresh(); })
        .catch(function () { delete pending[id]; });
    }
    return "";
  };
  window.__rcptUrlAsync = signed;
  var assets = {
    upload: async function (blob) {
      var ext = ((blob.type || "").split("/")[1] || "bin").replace("jpeg", "jpg").replace(/[^a-z0-9]/g, "");
      var path = uid + "/" + Date.now() + "-" + Math.random().toString(36).slice(2, 8) + "." + ext;
      var r = await sb.storage.from("receipts").upload(path, blob, { contentType: blob.type || "application/octet-stream" });
      if (r.error) throw r.error;
      return { id: path, url: "", contentType: blob.type, sizeBytes: blob.size };
    },
    list: async function () { return { assets: [], usage: {} }; },
    delete: async function (id) { await sb.storage.from("receipts").remove([id]); }
  };

  /* ---------- Claude ---------- */
  async function toImage(blob) {
    var max = 1568;
    try {
      var bmp = await createImageBitmap(blob);
      var k = Math.min(1, max / Math.max(bmp.width, bmp.height));
      var cv = document.createElement("canvas");
      cv.width = Math.round(bmp.width * k); cv.height = Math.round(bmp.height * k);
      cv.getContext("2d").drawImage(bmp, 0, 0, cv.width, cv.height);
      var url = cv.toDataURL("image/jpeg", 0.9);
      return { media_type: "image/jpeg", data: url.split(",")[1] };
    } catch (e) {
      var b64 = await new Promise(function (res, rej) { var fr = new FileReader(); fr.onload = function () { res(String(fr.result).split(",")[1]); }; fr.onerror = rej; fr.readAsDataURL(blob); });
      return { media_type: blob.type || "image/jpeg", data: b64 };
    }
  }
  async function callClaude(tier, messages, extra) {
    var r = await sb.functions.invoke("claude", { body: Object.assign({ tier: tier, messages: messages }, extra) });
    if (r.error) {
      var code = "error", msg = String(r.error.message || r.error);
      try {
        var j = r.error.context && r.error.context.json ? await r.error.context.json() : null;
        if (j && j.error === "missing_api_key") code = "missing_api_key";
        else if (j && j.error && j.error.type === "rate_limit_error") code = "rate_limited";
        else if (j && j.error && j.error.type === "overloaded_error") code = "rate_limited";
        if (j && j.error && j.error.message) msg = j.error.message;
      } catch (e) {}
      throw { code: code, message: msg };
    }
    return r.data;
  }
  async function buildMessages(input, images) {
    var msgs = typeof input === "string"
      ? [{ role: "user", content: input }]
      : input.map(function (m) { return { role: m.role, content: m.content }; });
    var imgs = images ? [].concat(images instanceof FileList ? Array.from(images) : images) : [];
    if (imgs.length) {
      var last = msgs[msgs.length - 1], parts = [];
      for (var i = 0; i < imgs.length; i++) {
        var x = await toImage(imgs[i]);
        parts.push({ type: "image", source: { type: "base64", media_type: x.media_type, data: x.data } });
      }
      parts.push({ type: "text", text: last.content });
      last.content = parts;
    }
    return msgs;
  }
  async function sample(input, opts) {
    opts = opts || {};
    var tier = opts.modelTier === "complex" ? "opus" : "sonnet";
    var messages = await buildMessages(input, opts.images);
    var defs = opts.tools || [];
    var tools = defs.map(function (t) { return { name: t.name, description: t.description || "", input_schema: t.inputSchema || { type: "object", properties: {} } }; });
    for (var round = 0; round < 8; round++) {
      if (opts.signal && opts.signal.aborted) throw { code: "cancelled", message: "cancelled" };
      var r = await callClaude(tier, messages, { system: opts.system, tools: tools, max_tokens: opts.maxTokens || 1600 });
      var text = (r.content || []).filter(function (b) { return b.type === "text"; }).map(function (b) { return b.text; }).join("");
      if (r.stop_reason === "tool_use") {
        messages.push({ role: "assistant", content: r.content });
        var results = [];
        var uses = r.content.filter(function (b) { return b.type === "tool_use"; });
        for (var i = 0; i < uses.length; i++) {
          var u = uses[i], def = defs.find(function (t) { return t.name === u.name; }), out, isErr = false;
          try { out = def ? await def.execute(u.input || {}) : "unknown tool"; if (!def) isErr = true; }
          catch (e) { out = String(e && e.message || e); isErr = true; }
          results.push({ type: "tool_result", tool_use_id: u.id, content: typeof out === "string" ? out : JSON.stringify(out), is_error: isErr });
        }
        messages.push({ role: "user", content: results });
        continue;
      }
      if (opts.onText) { try { opts.onText({ text: text, delta: text }); } catch (e) {} }
      return { text: text, truncated: r.stop_reason === "max_tokens", modelTierApplied: tier === "opus" ? "complex" : "default" };
    }
    throw { code: "error", message: "too many tool rounds" };
  }
  sample.json = async function (input, opts) {
    var r = await sample(input, Object.assign({}, opts, { system: "Respond with a single valid JSON value only. No prose and no code fences.", maxTokens: 2500 }));
    var t = r.text.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
    try { return JSON.parse(t); }
    catch (e) { var m = t.match(/[\[{][\s\S]*[\]}]/); if (m) return JSON.parse(m[0]); throw { code: "invalid_json", message: "bad json" }; }
  };
  sample.limits = async function () { return { images: { maxCount: 5, mediaTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"] } }; };

  window.claude = {
    use: async function (name) {
      if (name === "db") { await ready; return db; }
      if (name === "assets") { await ready; return assets; }
      if (name === "sample") { await ready; return sample; }
      return null;
    }
  };
})();
