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
    ".cj-login .switch{background:none;border:0;color:var(--accent);font-size:14px;padding:6px}" +
    ".cj-login .consent{display:flex;gap:8px;align-items:flex-start;text-align:start;font-size:13px;color:var(--muted);line-height:1.5}" +
    ".cj-login .consent input{width:18px;height:18px;margin-top:2px;accent-color:var(--accent);flex:none}" +
    ".cj-login .cj-captcha:empty{display:none}.cj-login .cj-captcha{display:flex;justify-content:center}" +
    ".cj-login a{color:var(--accent)}.cj-login .legal{font-size:12px;color:var(--faint)}.cj-login .ok{color:var(--ok);font-size:14px}";
  document.head.appendChild(css);

  var HEB = {
    "Invalid login credentials": "המייל או הסיסמה לא נכונים",
    "User already registered": "כבר יש חשבון עם המייל הזה. נסה להיכנס",
    "Password should be at least 6 characters.": "הסיסמה צריכה לפחות 8 תווים",
    "New password should be different from the old password.": "הסיסמה החדשה צריכה להיות שונה מהקודמת",
    "Signups not allowed for this instance": "ההרשמה סגורה. היכנס עם החשבון הקיים",
    "Email not confirmed": "צריך לאשר את המייל לפני הכניסה"
  };
  /* CAPTCHA (Cloudflare Turnstile): turned on only when CJ_CONFIG.turnstileSiteKey is set */
  function captcha(box) {
    var key = C.turnstileSiteKey, wid = null, tok = null, waiters = [];
    if (!key) return { on: false, token: function () { return Promise.resolve(null); }, reset: function () {} };
    function render() {
      wid = window.turnstile.render(box, { sitekey: key, language: "he", appearance: "interaction-only",
        callback: function (t) { tok = t; waiters.splice(0).forEach(function (w) { w(t); }); },
        "expired-callback": function () { tok = null; }, "error-callback": function () { tok = null; } });
    }
    if (window.turnstile) render();
    else {
      window.cjTurnstileReady = render;
      var sc = document.createElement("script");
      sc.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=cjTurnstileReady";
      sc.async = true; document.head.appendChild(sc);
    }
    return {
      on: true,
      token: function () { return tok ? Promise.resolve(tok) : new Promise(function (res) { waiters.push(res); setTimeout(function () { res(null); }, 15000); }); },
      reset: function () { tok = null; try { if (wid !== null) window.turnstile.reset(wid); } catch (e) {} }
    };
  }
  function showLogin(done) {
    if (!document.body) { document.addEventListener("DOMContentLoaded", function () { showLogin(done); }); return; }
    var mode = "in";
    var el = document.createElement("div");
    el.className = "cj-login";
    el.innerHTML =
      '<form novalidate><img src="icons/emblem.png" alt=""><h1>יומן הרכב</h1><p id="cjSub">כניסה לחשבון שלך</p>' +
      '<div class="field"><label for="cjEmail">מייל</label><input type="text" id="cjEmail" inputmode="email" autocomplete="email" dir="ltr"></div>' +
      '<div class="field"><label for="cjPass">סיסמה</label><input type="password" id="cjPass" autocomplete="current-password" dir="ltr" style="width:100%;background:var(--bg);border:1px solid var(--line);border-radius:10px;padding:11px 12px;font-size:16px;min-height:46px"></div>' +
      '<label class="consent" id="cjConsentRow" hidden><input type="checkbox" id="cjConsent"><span>קראתי ואני מסכים ל<a href="terms.html" target="_blank" rel="noopener">תנאי השימוש</a> ול<a href="privacy.html" target="_blank" rel="noopener">מדיניות הפרטיות</a></span></label>' +
      '<div id="cjCaptcha" class="cj-captcha"></div>' +
      '<div class="err" id="cjErr" role="alert"></div>' +
      '<button class="btn primary block" type="submit" id="cjGo">כניסה</button>' +
      '<button class="switch" type="button" id="cjForgot">שכחתי סיסמה</button>' +
      '<button class="switch" type="button" id="cjSwitch">פעם ראשונה? יצירת חשבון</button>' +
      '<div class="legal"><a href="privacy.html" target="_blank" rel="noopener">מדיניות פרטיות</a> · <a href="terms.html" target="_blank" rel="noopener">תנאי שימוש</a></div></form>';
    document.body.appendChild(el);
    var f = el.querySelector("form"), err = el.querySelector("#cjErr"), go = el.querySelector("#cjGo");
    var passRow = el.querySelector("#cjPass").closest(".field"), consentRow = el.querySelector("#cjConsentRow");
    var forgotBtn = el.querySelector("#cjForgot"), switchBtn = el.querySelector("#cjSwitch");
    var cap = captcha(el.querySelector("#cjCaptcha"));
    function setMode(m) {
      mode = m; err.className = "err"; err.textContent = "";
      go.textContent = m === "in" ? "כניסה" : m === "up" ? "יצירת חשבון" : "שליחת קישור לאיפוס";
      el.querySelector("#cjSub").textContent = m === "in" ? "כניסה לחשבון שלך" : m === "up" ? "בחר מייל וסיסמה (לפחות 8 תווים)" : "נשלח אליך קישור לבחירת סיסמה חדשה";
      el.querySelector("#cjPass").autocomplete = m === "up" ? "new-password" : "current-password";
      passRow.hidden = m === "reset"; consentRow.hidden = m !== "up"; forgotBtn.hidden = m !== "in";
      switchBtn.textContent = m === "in" ? "פעם ראשונה? יצירת חשבון" : "חזרה לכניסה";
    }
    switchBtn.onclick = function () { setMode(mode === "in" ? "up" : "in"); };
    forgotBtn.onclick = function () { setMode("reset"); };
    f.onsubmit = async function (e) {
      e.preventDefault();
      var email = el.querySelector("#cjEmail").value.trim(), password = el.querySelector("#cjPass").value;
      err.className = "err";
      if (mode === "reset") {
        if (!/^\S+@\S+\.\S+$/.test(email)) { err.textContent = "צריך כתובת מייל תקינה"; return; }
        go.disabled = true;
        var rt = await cap.token();
        if (cap.on && !rt) { go.disabled = false; err.textContent = "צריך להשלים את בדיקת האבטחה"; return; }
        var rr = await sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname, captchaToken: rt || undefined });
        go.disabled = false; cap.reset();
        if (rr.error && /rate|429/i.test(String(rr.error.message || rr.error.status))) { err.textContent = "נשלחו יותר מדי בקשות. נסה שוב בעוד כמה דקות."; return; }
        err.className = "ok"; err.textContent = "אם המייל רשום אצלנו, נשלח אליו קישור לאיפוס הסיסמה.";
        return;
      }
      if (!email || !password) { err.textContent = "צריך מייל וסיסמה"; return; }
      if (mode === "up" && password.length < 8) { err.textContent = "הסיסמה צריכה לפחות 8 תווים"; return; }
      if (mode === "up" && !el.querySelector("#cjConsent").checked) { err.textContent = "צריך לאשר את תנאי השימוש ומדיניות הפרטיות"; return; }
      go.disabled = true; err.textContent = "";
      var ct = await cap.token();
      if (cap.on && !ct) { go.disabled = false; err.textContent = "צריך להשלים את בדיקת האבטחה"; return; }
      try {
        var res = mode === "in"
          ? await sb.auth.signInWithPassword({ email: email, password: password, options: { captchaToken: ct || undefined } })
          : await sb.auth.signUp({ email: email, password: password, options: { captchaToken: ct || undefined, emailRedirectTo: location.origin + location.pathname, data: { terms_accepted_at: new Date().toISOString() } } });
        if (res.error) throw res.error;
        if (!res.data.session) { err.textContent = "נשלח אליך מייל לאישור. אשר אותו ואז היכנס."; go.disabled = false; return; }
        uid = res.data.session.user.id;
        el.remove(); done();
      } catch (x) {
        err.textContent = HEB[x && x.message] || (/captcha/i.test(String(x && x.message)) ? "בדיקת האבטחה נכשלה. נסה שוב." : "הכניסה לא הצליחה. בדוק את הפרטים ונסה שוב.");
        go.disabled = false; cap.reset();
      }
    };
  }
  var ready = new Promise(function (res) {
    sb.auth.getSession().then(function (r) {
      var s = r.data && r.data.session;
      if (s) { uid = s.user.id; res(); } else showLogin(res);
    });
  });
  function showNewPassword() {
    if (!document.body) { document.addEventListener("DOMContentLoaded", showNewPassword); return; }
    if (document.querySelector(".cj-login")) return;
    var el = document.createElement("div");
    el.className = "cj-login"; el.style.zIndex = "120";
    el.innerHTML = '<form novalidate><img src="icons/emblem.png" alt=""><h1>סיסמה חדשה</h1><p>בחר סיסמה חדשה לחשבון שלך</p>' +
      '<div class="field"><label for="cjNew">סיסמה חדשה (לפחות 8 תווים)</label><input type="password" id="cjNew" autocomplete="new-password" dir="ltr" style="width:100%;background:var(--bg);border:1px solid var(--line);border-radius:10px;padding:11px 12px;font-size:16px;min-height:46px"></div>' +
      '<div class="err" id="cjNErr" role="alert"></div><button class="btn primary block" type="submit" id="cjNGo">שמירת הסיסמה</button></form>';
    document.body.appendChild(el);
    el.querySelector("form").onsubmit = async function (e) {
      e.preventDefault();
      var p = el.querySelector("#cjNew").value, er = el.querySelector("#cjNErr"), b = el.querySelector("#cjNGo");
      if (p.length < 8) { er.textContent = "הסיסמה צריכה לפחות 8 תווים"; return; }
      b.disabled = true;
      var r = await sb.auth.updateUser({ password: p });
      if (r.error) { er.textContent = HEB[r.error.message] || "השמירה לא הצליחה. נסה שוב."; b.disabled = false; return; }
      try { history.replaceState(null, "", location.pathname); } catch (x) {}
      el.remove();
    };
  }
  sb.auth.onAuthStateChange(function (ev, s) {
    if (s) uid = s.user.id;
    if (ev === "PASSWORD_RECOVERY") showNewPassword();
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
  // Long receipts (e.g. a full Yellow invoice screenshot) are cut into overlapping parts,
  // so small lines like the liters stay readable instead of shrinking to fit one image.
  async function toImages(blob) {
    var max = 1568;
    try {
      var bmp = await createImageBitmap(blob);
      var w = bmp.width, h = bmp.height, tiles = [];
      var tileH = h / w > 1.8 ? Math.round(w * 1.4) : h;
      var step = Math.round(tileH * 0.9), n = Math.min(4, Math.max(1, Math.ceil((h - tileH) / step) + 1));
      if (n > 1) step = Math.round((h - tileH) / (n - 1));
      for (var i = 0; i < n; i++) {
        var y = n === 1 ? 0 : Math.min(h - tileH, i * step), th = Math.min(tileH, h);
        var k = Math.min(1, max / Math.max(w, th));
        var cv = document.createElement("canvas");
        cv.width = Math.round(w * k); cv.height = Math.round(th * k);
        var ctx = cv.getContext("2d"); ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, cv.width, cv.height);
        ctx.drawImage(bmp, 0, y, w, th, 0, 0, cv.width, cv.height);
        tiles.push({ media_type: "image/jpeg", data: cv.toDataURL("image/jpeg", 0.92).split(",")[1] });
      }
      return tiles;
    } catch (e) {
      var b64 = await new Promise(function (res, rej) { var fr = new FileReader(); fr.onload = function () { res(String(fr.result).split(",")[1]); }; fr.onerror = rej; fr.readAsDataURL(blob); });
      return [{ media_type: blob.type || "image/jpeg", data: b64 }];
    }
  }
  async function callClaude(tier, messages, extra) {
    var r = await sb.functions.invoke("claude", { body: Object.assign({ tier: tier, messages: messages }, extra) });
    if (r.error) {
      var code = "error", msg = String(r.error.message || r.error);
      try {
        var j = r.error.context && r.error.context.json ? await r.error.context.json() : null;
        if (j && j.error === "missing_api_key") code = "missing_api_key";
        else if (j && j.error === "quota_exceeded") { code = "quota_exceeded"; msg = j.kind || ""; }
        else if (j && j.error && j.error.type === "rate_limit_error") code = "rate_limited";
        else if (j && j.error && j.error.type === "overloaded_error") code = "rate_limited";
        if (j && j.error && j.error.message) msg = j.error.message;
      } catch (e) {}
      throw { code: code, message: msg, kind: code === "quota_exceeded" ? msg : undefined };
    }
    if (window.cjAccount) window.cjAccount._quota = null;
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
        var xs = await toImages(imgs[i]);
        xs.forEach(function (x) { parts.push({ type: "image", source: { type: "base64", media_type: x.media_type, data: x.data } }); });
      }
      var extraNote = parts.length > imgs.length ? "\n(התמונה ארוכה ולכן חולקה ל־" + parts.length + " חלקים חופפים של אותו מסמך, לפי הסדר מלמעלה למטה.)" : "";
      parts.push({ type: "text", text: last.content + extraNote });
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

  /* ---------- account ---------- */
  window.cjAccount = {
    _quota: null,
    quota: async function () {
      if (window.cjAccount._quota) return window.cjAccount._quota;
      var r = await sb.rpc("ai_quota");
      if (r.error) throw r.error;
      window.cjAccount._quota = r.data; return r.data;
    },
    exportData: async function () {
      var r = await sb.from("docs").select("collection,id,data,updated_at");
      if (r.error) throw r.error;
      var byCol = {};
      r.data.forEach(function (x) { (byCol[x.collection] = byCol[x.collection] || []).push(x); });
      for (var c in byCol) await decryptRows(c, byCol[c]);  // the export holds readable values, not ciphertext
      var out ={ app: "יומן הרכב", exportedAt: new Date().toISOString(), email: window.cjAccount._email || null, records: {} };
      r.data.forEach(function (x) { (out.records[x.collection] = out.records[x.collection] || []).push(Object.assign({ id: x.id, updated_at: x.updated_at }, x.data)); });
      var blob = new Blob([JSON.stringify(out, null, 2)], { type: "application/json" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob); a.download = "car-journal-" + new Date().toISOString().slice(0, 10) + ".json";
      document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 4000);
      return r.data.length;
    },
    deleteAccount: async function () {
      var r = await sb.functions.invoke("delete-account", { body: { confirm: "DELETE" } });
      if (r.error) throw r.error;
      try { await sb.auth.signOut(); } catch (e) {}
      try { localStorage.removeItem("cj-auth"); } catch (e) {}
      location.reload();
    },
    signOut: function () { sb.auth.signOut(); }
  };
  sb.auth.getSession().then(function (r) { var s = r.data && r.data.session; if (s) window.cjAccount._email = s.user.email; });
  sb.auth.onAuthStateChange(function (ev, s) { if (s) window.cjAccount._email = s.user.email; });

  /* ---------- phone notifications ---------- */
  function b64u(s) { var p = "=".repeat((4 - s.length % 4) % 4), b = atob((s + p).replace(/-/g, "+").replace(/_/g, "/")); var a = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) a[i] = b.charCodeAt(i); return a; }
  function standalone() { return (window.matchMedia && matchMedia("(display-mode: standalone)").matches) || navigator.standalone === true; }
  var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  window.cjPush = {
    // "ok" | "need-install" (iPhone: add to home screen first) | "unsupported" | "denied"
    support: function () {
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) return isIOS && !standalone() ? "need-install" : "unsupported";
      if (Notification.permission === "denied") return "denied";
      return "ok";
    },
    status: async function () {
      try { var reg = await navigator.serviceWorker.getRegistration(); var s = reg && await reg.pushManager.getSubscription(); return !!s; } catch (e) { return false; }
    },
    enable: async function () {
      var perm = await Notification.requestPermission();
      if (perm !== "granted") throw { code: "denied" };
      var reg = await navigator.serviceWorker.register("sw.js"); await navigator.serviceWorker.ready;
      var k = await sb.functions.invoke("push", { body: { action: "key" } });
      if (k.error || !k.data || !k.data.publicKey) throw { code: "server" };
      var sub = await reg.pushManager.getSubscription();
      if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64u(k.data.publicKey) });
      var j = sub.toJSON();
      var r = await sb.from("push_subs").upsert({ endpoint: j.endpoint, user_id: uid, p256dh: j.keys.p256dh, auth: j.keys.auth, ua: navigator.userAgent.slice(0, 300) });
      if (r.error) throw { code: "server" };
      await sb.functions.invoke("push", { body: { action: "test" } });
      return true;
    },
    disable: async function () {
      var reg = await navigator.serviceWorker.getRegistration(); var sub = reg && await reg.pushManager.getSubscription();
      if (sub) { await sb.from("push_subs").delete().eq("endpoint", sub.endpoint); await sub.unsubscribe(); }
      return true;
    }
  };

  /* ---------- error monitoring: what breaks for users lands in client_errors ---------- */
  var VER = "2026.11.21", sentErr = 0, seen = {};
  function report(msg, src, stack) {
    try {
      msg = String(msg || "").slice(0, 2000);
      if (!uid || !msg || sentErr >= 20 || seen[msg]) return;
      if (/ResizeObserver loop|Script error\.?$|turnstile/i.test(msg)) return;
      seen[msg] = 1; sentErr++;
      sb.from("client_errors").insert({ user_id: uid, msg: msg, src: String(src || location.hash || "").slice(0, 500), stack: String(stack || "").slice(0, 4000), ua: navigator.userAgent.slice(0, 300), ver: VER }).then(function () {}, function () {});
    } catch (e) {}
  }
  window.addEventListener("error", function (e) { report(e.message, (e.filename || "") + ":" + (e.lineno || ""), e.error && e.error.stack); });
  window.addEventListener("unhandledrejection", function (e) { var r = e.reason || {}; report(r.message || r.code || String(r), "promise", r.stack); });
  window.cjReport = report;

  /* ---------- beta feedback ---------- */
  window.cjFeedback = async function (kind, body) {
    var r = await sb.from("feedback").insert({ user_id: uid, kind: kind, body: String(body).slice(0, 3000), ua: navigator.userAgent.slice(0, 300), ver: VER });
    if (r.error) throw { code: /feedback_limit/.test(r.error.message) ? "limit" : "error" };
    return true;
  };
  window.cjVersion = VER;

  window.claude = {
    use: async function (name) {
      if (name === "db") { await ready; return db; }
      if (name === "assets") { await ready; return assets; }
      if (name === "sample") { await ready; return sample; }
      return null;
    }
  };
})();
