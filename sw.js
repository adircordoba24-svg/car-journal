// יומן הרכב: מטמון לקבצי האפליקציה, כדי שתיפתח מהר גם בקליטה חלשה.
const CACHE = "cj-v4";
const SHELL = ["./", "index.html", "privacy.html", "terms.html", "manifest.webmanifest", "config.js", "supabase-shim.js", "vendor/supabase.js", "icons/emblem.png", "icons/apple-touch-icon.png"];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then((r) => { const cp = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, cp)); return r; })
      .catch(() => caches.match(e.request).then((r) => r || caches.match("index.html")))
  );
});

// התראות לטלפון
self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (x) { d = { body: e.data && e.data.text() }; }
  e.waitUntil(self.registration.showNotification(d.title || "יומן הרכב", {
    body: d.body || "", tag: d.tag || "cj", renotify: true, dir: "rtl", lang: "he",
    icon: "icons/icon-192.png", badge: "icons/favicon-32.png", data: { url: d.url || "./", car: d.car || null }
  }));
});
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const d = e.notification.data || {};
  const target = new URL(d.url || "./", self.registration.scope).href;
  e.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const c of all) {
      if (c.url.startsWith(self.registration.scope)) { c.postMessage({ type: "cj-open", url: target, car: d.car }); return c.focus(); }
    }
    const u = new URL(target); if (d.car) u.searchParams.set("car", d.car);
    return self.clients.openWindow(u.href);
  })());
});
