// End-to-end checks of the app on a phone-sized screen, against a fake backend (tests/mock-supabase.js).
// Run:  python3 build.py && python3 tests/build-test-page.py && node tests/smoke.test.js
// Exits with code 1 if anything fails, so a broken version never goes live.
const { chromium, devices } = require("playwright");
const path = require("path");
const APP = "file://" + path.resolve(__dirname, "app.html");
const ADMIN = "file://" + path.resolve(__dirname, "admin.html");
const IMG = { name: "receipt.png", mimeType: "image/png", buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64") };
const PDF = { name: "policy.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF") };

let failed = 0, passed = 0;
const ok = (cond, name, extra) => { if (cond) { passed++; console.log("  ✓ " + name); } else { failed++; console.log("  ✗ " + name + (extra !== undefined ? "  → " + JSON.stringify(extra) : "")); } };

(async () => {
  const browser = await chromium.launch({ args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"] });
  const errors = [];
  async function page(hash = "#q", opts = {}) {
    const ctx = await browser.newContext({ ...devices["iPhone 13"], deviceScaleFactor: 1, colorScheme: opts.scheme || "dark", acceptDownloads: true });
    const p = await ctx.newPage();
    p.on("pageerror", (e) => errors.push(e.message));
    p.on("console", (m) => { if (m.type() === "error" && !/fonts|ERR_|Failed to fetch|net::/.test(m.text())) errors.push(m.text()); });
    if (opts.init) await p.addInitScript(opts.init);
    await p.goto((opts.url || APP) + hash);
    await p.waitForTimeout(opts.wait || 4300);
    return p;
  }
  // wait (up to 5 s) until a condition in the page is true; returns false instead of throwing
  const until = (p, fn, arg) => p.waitForFunction(fn, arg, { timeout: 5000 }).then(() => true, () => false);
  const overflow = (p) => p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);

  console.log("login");
  let p = await page("");
  await p.fill("#cjEmail", "me@example.com"); await p.fill("#cjPass", "wrong"); await p.click("#cjGo"); await p.waitForTimeout(300);
  ok((await p.textContent("#cjErr")).includes("לא נכונים"), "wrong password message");
  await p.click("#cjForgot"); await p.fill("#cjEmail", "me@example.com"); await p.click("#cjGo"); await p.waitForTimeout(300);
  ok((await p.textContent("#cjErr")).includes("קישור"), "forgot password sends a link");
  await p.click("#cjSwitch"); await p.click("#cjSwitch"); await p.fill("#cjEmail", "new@example.com"); await p.fill("#cjPass", "abcdefgh1"); await p.click("#cjGo"); await p.waitForTimeout(300);
  ok((await p.textContent("#cjErr")).includes("תנאי השימוש"), "signup requires consent");
  await p.context().close();

  console.log("new user: intro, license scan, car");
  p = await page("#new", { init: "window.__lic2=true" });
  for (let i = 0; i < 5; i++) { await p.click("#onbNext"); await p.waitForTimeout(350); }
  await p.setInputFiles("#oScanF", IMG); await p.waitForTimeout(1200);
  ok((await p.inputValue("#oMk")) === "טויוטה" && (await p.inputValue("#oY")) === "2021", "license scan fills the car");
  await p.fill("#oO", "52000"); await p.click("#onbCar button[type=submit]"); await p.waitForTimeout(300);
  await p.evaluate(() => document.querySelector(".onb input[value=basic]").click()); await p.click("#onbDone"); await p.waitForTimeout(1500);
  ok(!(await p.evaluate(() => !!document.querySelector(".onb"))), "onboarding closes");
  ok((await p.textContent("#subline")).includes("קורולה"), "home shows the new car");
  ok(await until(p, () => document.querySelector("#tour .tour-tip")), "a short tour starts after setup");
  for (let i = 0; i < 3; i++) { await p.click("[data-tour=n]"); await p.waitForTimeout(300); }
  ok(!(await p.$("#tour")), "tour can be finished");
  await p.context().close();

  console.log("everyday use");
  p = await page();
  for (const v of ["home", "fuel", "service", "expense", "reminder", "agents"]) { await p.click(`[data-nav="${v}"]`); await p.waitForTimeout(350); ok(!(await overflow(p)), `no sideways scroll: ${v}`); }
  await p.click('[data-nav="home"]'); await p.waitForTimeout(300);
  await p.click(".m-act.primary"); await p.waitForTimeout(300);
  await p.fill("#qfOdo", "30900"); await p.evaluate(() => (document.querySelector("#qfMore").open = true)); await p.fill("#qfT", "240"); await p.fill("#qfL", "30");
  await p.click("#qfSave");
  ok(await until(p, () => __rows.some((r) => r.collection === "fuel" && r.data.odo === 30900)), "quick fuel saves");

  // regression: closing the window while the agent reads a receipt used to throw
  await p.click(".m-act.primary"); await p.waitForTimeout(300);
  await p.setInputFiles("#qfFile", IMG); ok(await until(p, () => document.querySelector(".pump")), "fuel pump animation while reading"); await p.keyboard.press("Escape"); await p.waitForTimeout(1200);
  ok(!errors.some((e) => /qfT|qfMore/.test(e)), "closing quick fuel while reading is safe", errors);

  console.log("offline");
  await p.evaluate(() => { window.__offline = true; }); await p.context().setOffline(true);
  await p.click(".m-act.primary"); await p.waitForTimeout(300);
  await p.fill("#qfOdo", "31200"); await p.evaluate(() => (document.querySelector("#qfMore").open = true)); await p.fill("#qfT", "200"); await p.fill("#qfL", "25");
  await p.click("#qfSave"); await p.waitForTimeout(900);
  ok((await p.evaluate(() => document.querySelector("#banner").innerText)).includes("אין קליטה"), "offline banner");
  await p.evaluate(() => { window.__offline = false; }); await p.context().setOffline(false); await p.evaluate(() => window.dispatchEvent(new Event("online")));
  ok(await until(p, () => __rows.some((r) => r.collection === "fuel" && r.data.odo === 31200)), "queued change is sent when back online");

  console.log("undo and snooze");
  await p.click('[data-nav="fuel"]'); await p.waitForTimeout(400);
  const before = await p.evaluate(() => document.querySelectorAll("[data-act=del][data-col=fuel]").length);
  await p.evaluate(() => document.querySelector("[data-act=del][data-col=fuel]").click());
  ok(await until(p, (n) => document.querySelectorAll("[data-act=del][data-col=fuel]").length === n - 1, before), "delete is immediate");
  await p.click(".toast-act");
  ok(await until(p, (n) => document.querySelectorAll("[data-act=del][data-col=fuel]").length === n, before), "undo brings it back");
  await p.click('[data-nav="reminder"]'); await p.waitForTimeout(400);
  await p.evaluate(() => document.querySelector("[data-act=snooze]").click()); await p.waitForTimeout(300);
  await p.click('.snz button[data-v="7"]');
  ok(await until(p, () => document.querySelector("#view").innerText.includes("נדחה עד")), "snooze shows on the reminder");

  console.log("check done: clear feedback, history in service");
  await p.click('[data-nav="reminder"]'); await p.waitForTimeout(300);
  const ckRow = await p.$('.rrow:has([data-act=done][data-id="r2"])');
  await p.click('[data-act=done][data-id="r2"]');
  ok(await until(p, () => /בוצע היום/.test(document.querySelector("#toast").innerText) && /הפעם הבאה/.test(document.querySelector("#toast").innerText)), "done shows when the next time is", await p.textContent("#toast"));
  ok(await until(p, () => /בוצע היום/.test(document.querySelector('.rrow:has([data-id="r2"])').innerText)), "the row shows it was done today");
  await p.click('[data-nav="service"]'); await p.waitForTimeout(400);
  ok(/יומן הבדיקות/.test(await p.textContent("#view")) && (await p.evaluate(() => [...document.querySelectorAll(".feed .fitem")].some((x) => /בדיקת מפלס שמן/.test(x.innerText) && /בוצע/.test(x.innerText)))), "checks are listed in the service tab");
  await p.click('[data-nav="reminder"]'); await p.waitForTimeout(300);
  await p.click(".toast-act");
  ok(await until(p, () => !/בוצע היום/.test(document.querySelector('.rrow:has([data-id="r2"])').innerText)), "undo puts the check back");

  console.log("motion: odometer, health, countdown, swipe, celebration");
  await p.click('[data-nav="home"]'); await p.waitForTimeout(1600);
  ok(await p.evaluate(() => [...document.querySelectorAll(".odo-digits.roll .strip")].map((b) => b.style.getPropertyValue("--d")).join("") === String(Math.round(30400 > 0 ? document.querySelector(".odo-digits.roll").getAttribute("aria-label").replace(/\D/g, "") : 0)).padStart(6, "0")), "odometer rolls to the right number");
  ok(await p.evaluate(() => { const h = document.querySelector(".health .hr-num"); return h && +h.textContent >= 0 && +h.textContent <= 100; }), "car health score is shown");
  await p.click(".health"); await p.waitForTimeout(300);
  ok((await p.textContent("#mtitle")) === "מצב הרכב", "health explains the score"); await p.keyboard.press("Escape");
  const c1 = await p.evaluate(() => (document.querySelector("[data-cd] .cd-clock") || {}).textContent); await p.waitForTimeout(1300);
  const c2 = await p.evaluate(() => (document.querySelector("[data-cd] .cd-clock") || {}).textContent);
  ok(c1 && c2 && c1 !== c2, "countdown is live", [c1, c2]);
  await p.click('[data-nav="reminder"]'); await p.waitForTimeout(400);
  await p.evaluate(() => { const r = document.querySelector('.rrow:has([data-id="r3"])'); const b = r.getBoundingClientRect(); const mk = (x) => new Touch({ identifier: 1, target: r, clientX: x, clientY: b.top + 20 });
    r.dispatchEvent(new TouchEvent("touchstart", { bubbles: true, touches: [mk(100)] })); for (const x of [120, 150, 200, 240]) document.dispatchEvent(new TouchEvent("touchmove", { bubbles: true, touches: [mk(x)] })); document.dispatchEvent(new TouchEvent("touchend", { bubbles: true, touches: [] })); });
  ok(await until(p, () => /בוצע היום/.test(document.querySelector('.rrow:has([data-id="r3"])').innerText)), "swipe right marks done");
  await p.evaluate(() => { localStorage.setItem("cj-ms-km-car", "2"); });
  await p.click('[data-nav="home"]'); await p.waitForTimeout(400); await p.click(".m-odo"); await p.waitForTimeout(300); await p.fill("#oV", "40100"); await p.click("#f button[type=submit]");
  ok(await until(p, () => document.querySelector(".celebrate") && /40,000/.test(document.querySelector(".celebrate").innerText)), "crossing 10,000 km is celebrated");

  console.log("shake, pull to refresh, count-up");
  await p.waitForTimeout(4500); await p.click('[data-nav="home"]'); await p.waitForTimeout(300);
  await p.click(".m-odo"); await p.waitForTimeout(300); await p.fill("#oV", ""); await p.click("#f button[type=submit]");
  ok(await until(p, () => document.querySelector(".shake")), "an empty required field shakes"); await p.keyboard.press("Escape");
  await p.evaluate(() => { document.querySelector("#scroller").scrollTop = 0; const t = document.querySelector("#view"); const mk = (y) => new Touch({ identifier: 2, target: t, clientX: 200, clientY: y });
    t.dispatchEvent(new TouchEvent("touchstart", { bubbles: true, touches: [mk(120)] })); for (const y of [160, 220, 300, 380]) document.dispatchEvent(new TouchEvent("touchmove", { bubbles: true, touches: [mk(y)] })); document.dispatchEvent(new TouchEvent("touchend", { bubbles: true, touches: [] })); });
  ok(await until(p, () => /עודכן/.test(document.querySelector("#toast").innerText)), "pull down refreshes");

  console.log("help");
  await p.waitForTimeout(4500); await p.click('[data-nav="reminder"]'); await p.waitForTimeout(300);
  ok(!(await p.isVisible("[data-act=helpHere]")) && !(await p.isVisible("#acctBtn")), "header buttons only on the home screen");
  await p.click('[data-nav="home"]'); await p.waitForTimeout(300);
  await p.click("[data-act=helpHere]"); await p.waitForTimeout(300);
  ok((await p.textContent("#mtitle")) === "מסך הבית", "? explains the screen you're on");
  await p.keyboard.press("Escape");

  console.log("the agent does things");
  await p.click("[data-act=agentOpen]"); await p.waitForTimeout(400);
  await p.fill("#chatIn", "עשיתי איזון וכיוון פרונט ב־250 שקל"); await p.press("#chatIn", "Enter");
  ok(await until(p, () => __rows.some((r) => r.collection === "service" && r.data.title === "איזון וכיוון פרונט" && r.data.cost === 250)), "agent logs the service");
  ok(await until(p, () => /נרשם טיפול/.test(document.querySelector("#msgs").innerText) && /רשמתי/.test(document.querySelector("#msgs").innerText)), "agent says what it did");
  await p.click("[data-act=agUndo]");
  ok(await until(p, () => !__rows.some((r) => r.collection === "service" && r.data.title === "איזון וכיוון פרונט")), "agent action can be undone");
  await p.fill("#chatIn", "בדקתי היום שמן ואוויר"); await p.press("#chatIn", "Enter");
  ok(await until(p, () => __rows.filter((r) => r.collection === "reminder" && ["r2", "r3"].includes(r.id) && r.data.lastDate === new Date(Date.now() - new Date().getTimezoneOffset() * 6e4).toISOString().slice(0, 10)).length === 2), "agent marks checks done");
  ok(await until(p, () => __calls.some((c) => c[0] === "agent-result" && /הפעם הבאה/.test(c[1])) && (document.querySelector("#msgs").innerText.match(/רשמתי/g) || []).length >= 2 && !document.querySelector("#msgs .spin")), "agent is told when the next time is");
  await p.fill("#chatIn", "תעביר אותי לביטוח"); await p.press("#chatIn", "Enter");
  ok(await until(p, () => document.querySelector("[data-act=agtab][data-id=docs].on")), "agent opens the insurance screen");
  await p.click("[data-act=agtab][data-id=agents]"); await p.waitForTimeout(300);

  console.log("tickets and documents");
  await p.click('[data-nav="agents"]'); await p.waitForTimeout(300); await p.click("[data-act=agtab][data-id=tickets]"); await p.waitForTimeout(300);
  await p.click("[data-act=tkAdd]"); await p.waitForTimeout(300); await p.setInputFiles("#tkF", IMG); await p.waitForTimeout(1200);
  await p.click("#tk button[type=submit]"); await p.waitForTimeout(900);
  ok((await p.evaluate(() => document.querySelector(".pol h2").innerText)).startsWith("8"), "ticket points are counted");
  ok(await until(p, () => document.querySelector(".tkc-v") && /מספר הרכב בדוח תואם/.test(document.querySelector(".tkc-list").innerText)), "ticket check opens after saving");
  await p.click("#tkcOk"); await p.waitForTimeout(400);
  ok(await p.evaluate(() => __rows.some((r) => r.collection === "ticket" && r.data.reviewed === true && r.data.scanned)), "ticket marked as checked");
  await p.evaluate(() => { window.__badTicket = true; });
  await p.click("[data-act=tkAdd]"); await p.waitForTimeout(300); await p.setInputFiles("#tkF", IMG); await p.waitForTimeout(1200);
  await p.click("#tk button[type=submit]");
  ok(await until(p, () => document.querySelector(".tkc-v[data-s=bad]")), "flawed ticket is flagged");
  const bad = await p.evaluate(() => [...document.querySelectorAll(".tkc-i[data-s=bad]")].map((x) => x.innerText).join(" | "));
  ok(/לא תואם/.test(bad) && /סוג הרכב/.test(bad) && /התיישנה/.test(bad), "wrong plate, wrong make and late delivery are found", bad);
  ok(await p.evaluate(() => { const t = __rows.find((r) => r.collection === "ticket" && r.data.offenseDate === "2026-03-01"); return t && t.data.checkBad === 3 && t.data.cancelBy === "2026-10-20" && String(t.data.plateOnTicket).startsWith("enc:"); }), "check summary saved, plate on the ticket encrypted");
  await p.keyboard.press("Escape"); await p.evaluate(() => { window.__badTicket = false; });
  await p.waitForTimeout(300); await p.click("[data-act=tkPaid]");
  ok(await until(p, () => document.querySelector(".stampmark.paid.fresh")), "paid stamp lands on the ticket");
  await p.click("[data-act=agtab][data-id=docs]"); await p.waitForTimeout(300);
  await p.click("[data-act=docUp][data-type=insurance]"); await p.waitForTimeout(300); await p.setInputFiles("#duFile", PDF); await p.click("#duGo"); await p.waitForTimeout(2200);
  ok((await p.evaluate(() => document.querySelectorAll(".cov").length)) >= 3, "policy coverages are shown");
  ok(!(await overflow(p)), "no sideways scroll: documents");

  console.log("backup and restore");
  await p.click('[data-nav="home"]'); await p.waitForTimeout(300); await p.click("#acctBtn"); await p.waitForTimeout(300);
  const dl = p.waitForEvent("download"); await p.click("#acExport"); const file = await dl; const fp = await file.path();
  await p.keyboard.press("Escape");
  await p.evaluate(() => { window.__rows = window.__rows.filter((r) => r.collection !== "expense"); });
  await p.click('[data-nav="home"]'); await p.waitForTimeout(300); await p.click("#acctBtn"); await p.waitForTimeout(300); await p.click("[data-act=restore]"); await p.waitForTimeout(300);
  await p.setInputFiles("#rsF", fp); await until(p, () => !document.querySelector("#rsGo").disabled); await p.click("#rsGo");
  ok(await until(p, () => __rows.some((r) => r.collection === "expense")), "restore puts records back");
  await p.context().close();

  console.log("business account");
  p = await page("#q", { init: "window.__biz=true", scheme: "light" });
  for (const mk of ["קיה", "מאזדה"]) {
    await p.click("#carBtn"); await p.waitForTimeout(300); await p.click("#carAdd"); await p.waitForTimeout(300);
    await p.fill("#oMk", mk); await p.fill("#oMd", "3"); await p.fill("#oO", "1000"); await p.click("#onbCar button[type=submit]"); await p.waitForTimeout(300);
    await p.evaluate(() => document.querySelector(".onb input[value=basic]").click()); await p.click("#onbDone"); await p.waitForTimeout(1300);
  }
  ok((await p.textContent("#carBtn")).includes("3"), "fleet of 3 cars");
  await p.context().close();

  console.log("fleet dashboard");
  p = await page("#q", { init: "window.__fleet=true" });
  ok(await until(p, () => document.querySelectorAll(".fl-table tbody tr").length === 4), "fleet table shows every car");
  const att = await p.evaluate(() => [...document.querySelectorAll(".fl-item")].map((x) => x.innerText));
  ok(att.some((x) => x.includes("קיה") && x.includes("טסט")) && att.findIndex((x) => x.includes("עוד")) > att.findIndex((x) => x.includes("קיה")), "overdue items from all cars come first", att);
  ok((await p.evaluate(() => document.querySelector(".fl-kpis").innerText)).includes("4"), "fleet numbers");
  ok(!(await overflow(p)), "no sideways scroll: fleet");
  const dlx = p.waitForEvent("download"); await p.click("[data-act=flExport]"); const xf = await dlx;
  ok(/^fleet-.*\.xlsx$/.test(xf.suggestedFilename()) && require("fs").statSync(await xf.path()).size > 2000, "fleet export to Excel", xf.suggestedFilename());
  await p.click(".fl-item:nth-child(2)"); await p.waitForTimeout(400);
  ok((await p.textContent("#subline")).includes("קיה") && !(await p.$(".fl-kpis")), "tapping an item opens that car");
  await p.click("#carBtn"); await p.waitForTimeout(300); await p.click("#carFleet"); await p.waitForTimeout(400);
  ok(!!(await p.$(".fl-kpis")), "back to the whole fleet");

  console.log("import from Excel");
  const csv = "﻿מספר רישוי,יצרן,דגם,שנה,ק״מ,טסט עד,ביטוח עד,נהג\n5678901,יונדאי,i20,2021,40000,15/03/2027,2027-01-31,רונית\n23-456-78,קיה,פיקנטו,2020,61000,,,\n,פיג׳ו,208,2019,90000,01/12/2026,,\n";
  await p.click("[data-act=flImport]"); await p.waitForTimeout(300);
  await p.setInputFiles("#imF", { name: "cars.csv", mimeType: "text/csv", buffer: Buffer.from(csv) });
  ok(await until(p, () => /נמצאו 3 רכבים/.test(document.querySelector("#imOut").innerText)), "CSV: cars and columns found");
  ok((await p.textContent("#imGo")).includes("2"), "car already in the fleet is skipped");
  await p.click("#imGo");
  ok(await until(p, () => __rows.filter((r) => r.collection === "garage").length === 6), "imported cars are saved");
  const imp = await p.evaluate(() => { const g = __rows.find((r) => r.collection === "garage" && r.data.make === "יונדאי"); const rs = __rows.filter((r) => r.collection === "reminder" && r.data.carId === g.id); return { plate: String(g.data.plate).startsWith("enc:v1:") ? atob(g.data.plate.slice(7)) : g.data.plate, driver: g.data.driver, rem: rs.map((r) => r.data.docKey || r.data.kind).sort().join(","), test: (rs.find((r) => r.data.docKey === "test") || { data: {} }).data.lastDate }; });
  ok(imp.plate === "56-789-01" && imp.driver === "רונית" && imp.rem === "ins:import,service,test" && imp.test === "2026-03-15", "imported plate, driver, test and insurance", imp);
  // an .xlsx with real date cells, made with the same library the app uses
  const xb64 = await p.evaluate(async () => {
    await new Promise((r) => { const s = document.createElement("script"); s.src = "../vendor/write-excel-file.min.js"; s.onload = r; document.head.appendChild(s); });
    const blob = await writeXlsxFile([["רכב", "מס׳ רכב", "ק\"מ", "תוקף רישיון"], ["טויוטה יאריס", "1112223", 12000, { value: new Date(Date.UTC(2027, 4, 9)), type: Date, format: "dd/mm/yyyy" }]]).toBlob();
    const b = new Uint8Array(await blob.arrayBuffer()); let s = ""; b.forEach((x) => (s += String.fromCharCode(x))); return btoa(s);
  });
  await p.click("[data-act=flImport]"); await p.waitForTimeout(300);
  await p.setInputFiles("#imF", { name: "fleet.xlsx", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", buffer: Buffer.from(xb64, "base64") });
  ok(await until(p, () => /נמצאו 1 רכבים/.test(document.querySelector("#imOut").innerText)), "xlsx file is read");
  const row = await p.evaluate(() => document.querySelector(".im-row").innerText);
  ok(row.includes("טויוטה יאריס") && row.includes("11-122-23") && /טסט/.test(row), "xlsx columns and dates", row);
  await p.keyboard.press("Escape");
  // headers the app doesn't know: the agent maps the columns
  await p.click("[data-act=flImport]"); await p.waitForTimeout(300);
  await p.setInputFiles("#imF", { name: "x.csv", mimeType: "text/csv", buffer: Buffer.from("A,B,C,D,E\n7778889,רנו,קליאו,30000,2027-02-02\n") });
  ok(await until(p, () => /נמצאו 1 רכבים/.test(document.querySelector("#imOut").innerText) && document.querySelector(".im-row").innerText.includes("רנו")), "agent maps unknown columns");
  await p.keyboard.press("Escape");

  console.log("voice entry");
  await p.click('[data-act=flView][data-id="0"]'); await p.waitForTimeout(300);
  await p.click(".m-act[data-act=voice]"); await p.waitForTimeout(300);
  await p.click("#vEx button"); await p.click("#vGo");
  ok(await until(p, () => document.querySelector("#fT") && document.querySelector("#fT").value === "270" && document.querySelector("#fL").value === "38" && document.querySelector("#fOdo").value === "31200"), "spoken fuel fills the fuel form");
  await p.keyboard.press("Escape");
  await p.click("[data-act=quick]"); await p.waitForTimeout(300); await p.click(".qbtn[data-act=voice]"); await p.waitForTimeout(300);
  await p.fill("#vTxt", "החלפתי צמיגים ב־1600 שקל"); await p.click("#vGo");
  ok(await until(p, () => document.querySelector("#eA") && document.querySelector("#eA").value === "1600"), "spoken expense fills the expense form");
  await p.context().close();

  console.log("voice: recording and server transcription");
  p = await page("#q", { init: "window.__stt=true" });
  await p.click(".m-act[data-act=voice]"); await p.waitForTimeout(500);
  await p.click("#vMic");
  ok(await until(p, () => document.querySelector("#vMic.on")), "recording starts");
  await p.waitForTimeout(1500); await p.click("#vMic");
  ok(await until(p, () => document.querySelector("#fT") && document.querySelector("#fT").value === "270" && document.querySelector("#fOdo").value === "31200"), "recorded speech is transcribed and fills the fuel form");
  ok(await p.evaluate(() => __calls.some((c) => c[0] === "stt" && c[2])), "audio was sent for transcription");
  await p.context().close();

  console.log("admin screen");
  p = await page("#q", { url: ADMIN, wait: 1500 });
  ok((await p.evaluate(() => document.querySelectorAll(".kpi").length)) >= 4, "admin overview");
  await p.click('#tabs button[data-t="users"]'); await p.waitForTimeout(500);
  ok((await p.evaluate(() => document.querySelectorAll("tr[data-u]").length)) === 2, "admin users table");
  await p.click('#tabs button[data-t="costs"]'); await p.waitForTimeout(400);
  ok((await p.evaluate(() => document.querySelector("main").innerText)).includes("סריקות"), "admin costs");
  await p.click('#tabs button[data-t="backups"]'); await p.waitForTimeout(500);
  await p.click("#bkDrill");
  ok(await until(p, () => /שוחזר במלואו/.test(document.querySelector("#drillOut").innerText)), "restore drill from the admin screen");
  await p.click("#wTest");
  ok(await until(p, () => /נשלחה התראה/.test(document.querySelector("#bkSt").innerText)), "owner alert test");
  await p.context().close();

  ok(errors.length === 0, "no errors in the page", errors.slice(0, 5));
  await browser.close();
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
