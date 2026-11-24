// Car Journal: a calendar feed (iCalendar) the user subscribes to once in Google / Apple calendar.
// GET ?t=<secret token>  -> test, insurance, service and other reminders, and ticket deadlines, as all-day events.
// The calendar app re-reads it on its own, so changes in the app show up there too.
function serviceKey(): string {
  const l = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"); if (l) return l;
  try { const k = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}"); return k.default ?? Object.values(k)[0] ?? ""; } catch { return ""; }
}
const URL_ = Deno.env.get("SUPABASE_URL")!, SK = serviceKey();
const rest = (p: string) => fetch(`${URL_}/rest/v1/${p}`, { headers: { apikey: SK, Authorization: `Bearer ${SK}` } }).then((r) => r.json());
const APP = "https://adircordoba24-svg.github.io/car-journal/";
const num = (v: any) => { const x = typeof v === "number" ? v : parseFloat(String(v ?? "").replace(/[^\d.\-]/g, "")); return isFinite(x) ? x : null; };
const todayIL = () => new Date(Date.now() + 2 * 3600e3).toISOString().slice(0, 10);
const addDays = (d: string, k: number) => { const x = new Date(d + "T12:00:00Z"); x.setUTCDate(x.getUTCDate() + Math.round(k)); return x.toISOString().slice(0, 10); };
const daysBetween = (a: string, b: string) => Math.round((Date.parse(b + "T12:00:00Z") - Date.parse(a + "T12:00:00Z")) / 864e5);
const esc = (s: string) => String(s || "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
const fold = (line: string) => { const out: string[] = []; let s = line; while (new TextEncoder().encode(s).length > 72) { let i = 60; while (new TextEncoder().encode(s.slice(0, i)).length > 72) i--; out.push(s.slice(0, i)); s = " " + s.slice(i); } out.push(s); return out.join("\r\n"); };
const ymd = (d: string) => d.replace(/-/g, "");

function carDue(car: any, recs: any) {
  let odo = num(car.odometer) || 0;
  const pts = [...recs.fuel, ...recs.service].filter((r: any) => num(r.odo) && r.date).sort((a: any, b: any) => (a.date < b.date ? -1 : 1));
  for (const r of pts) if (num(r.odo)! > odo) odo = num(r.odo)!;
  const t = todayIL(), cut = addDays(t, -240), rec = pts.filter((p: any) => p.date >= cut), use = rec.length >= 2 ? rec : pts;
  let kpd = 40; if (use.length >= 2) { const d = daysBetween(use[0].date, use[use.length - 1].date); if (d > 0) kpd = Math.max(5, (num(use[use.length - 1].odo)! - num(use[0].odo)!) / d); }
  const out: { id: string; date: string; title: string; note: string }[] = [];
  for (const r of recs.reminder) {
    if (r.kind === "check") continue; // routine checks every two weeks would flood the calendar
    const c: string[] = [];
    if (num(r.intervalDays) && r.lastDate) c.push(addDays(r.lastDate, num(r.intervalDays)!));
    if (num(r.intervalKm)) { const left = (num(r.lastKm) || 0) + num(r.intervalKm)! - odo; c.push(addDays(t, Math.max(-3650, left / kpd))); }
    const due = c.sort()[0]; if (!due) continue;
    out.push({ id: r.id, date: due < t ? t : due, title: r.title || "תזכורת", note: num(r.intervalKm) ? `לפי ק״מ: מוערך לפי נסיעה של כ־${Math.round(kpd)} ק״מ ביום` : "" });
  }
  return out;
}

Deno.serve(async (req) => {
  const t = new URL(req.url).searchParams.get("t") || "";
  if (!/^[0-9a-f]{20,64}$/.test(t)) return new Response("not found", { status: 404 });
  const row = (await rest(`cal_tokens?token=eq.${t}&select=user_id`))[0];
  if (!row) return new Response("not found", { status: 404 });
  const docs = await rest(`docs?user_id=eq.${row.user_id}&collection=in.(garage,fuel,service,reminder,ticket)&select=collection,id,data`);
  const of = (c: string) => docs.filter((d: any) => d.collection === c).map((d: any) => ({ id: d.id, ...d.data }));
  const cars = of("garage").filter((c: any) => !c.example);
  const events: { uid: string; date: string; title: string; desc: string }[] = [];
  const multi = cars.length > 1;
  for (const c of cars) {
    const mine = (col: string) => of(col).filter((r: any) => (r.carId || "car") === c.id);
    const name = c.nickname || [c.make, c.model].filter(Boolean).join(" ") || "הרכב";
    for (const e of carDue(c, { fuel: mine("fuel"), service: mine("service"), reminder: mine("reminder") }))
      events.push({ uid: `rem-${e.id}`, date: e.date, title: `${e.title}${multi ? " · " + name : ""}`, desc: [`יומן הרכב · ${name}`, e.note].filter(Boolean).join("\n") });
  }
  // shared deadlines: driver license, refresher course
  for (const r of of("reminder").filter((r: any) => r.carId === "*" && !String(r.docKey || "").startsWith("tk:")))
    if (r.lastDate && num(r.intervalDays)) events.push({ uid: `rem-${r.id}`, date: addDays(r.lastDate, num(r.intervalDays)!), title: r.title || "תזכורת", desc: "יומן הרכב" });
  // tickets: last day to ask for cancellation, and to pay
  for (const k of of("ticket").filter((k: any) => (k.status || "open") === "open")) {
    const base = k.serviceDate || k.offenseDate; const what = k.description || "דוח";
    if (k.cancelBy || k.serviceDate) events.push({ uid: `tkc-${k.id}`, date: k.cancelBy || addDays(k.serviceDate, 30), title: `מועד אחרון לבקשת ביטול: ${what}`, desc: "יומן הרכב · אחרי המועד אפשר רק לשלם או לבקש להישפט" });
    if (k.dueDate || base) events.push({ uid: `tkp-${k.id}`, date: k.dueDate || addDays(base, 90), title: `תשלום דוח: ${what}`, desc: "יומן הרכב · אחרי המועד נוספים 50% פיגורים" });
  }
  const stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Car Journal//HE", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", "X-WR-CALNAME:יומן הרכב", "X-WR-TIMEZONE:Asia/Jerusalem", "REFRESH-INTERVAL;VALUE=DURATION:PT6H", "X-PUBLISHED-TTL:PT6H"];
  for (const e of events) {
    lines.push("BEGIN:VEVENT", `UID:${e.uid}@car-journal`, `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${ymd(e.date)}`, `DTEND;VALUE=DATE:${ymd(addDays(e.date, 1))}`,
      fold(`SUMMARY:${esc(e.title)}`), fold(`DESCRIPTION:${esc(e.desc)}`), `URL:${APP}`, "TRANSP:TRANSPARENT",
      "BEGIN:VALARM", "ACTION:DISPLAY", fold(`DESCRIPTION:${esc(e.title)}`), "TRIGGER:-P2D", "END:VALARM", "END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return new Response(lines.join("\r\n") + "\r\n", { headers: { "Content-Type": "text/calendar; charset=utf-8", "Cache-Control": "max-age=1800", "Access-Control-Allow-Origin": "*" } });
});
