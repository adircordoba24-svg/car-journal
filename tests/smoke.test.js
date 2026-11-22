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
  const browser = await chromium.launch();
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
  for (let i = 0; i < 4; i++) { await p.click("#onbNext"); await p.waitForTimeout(350); }
  await p.setInputFiles("#oScanF", IMG); await p.waitForTimeout(1200);
  ok((await p.inputValue("#oMk")) === "טויוטה" && (await p.inputValue("#oY")) === "2021", "license scan fills the car");
  await p.fill("#oO", "52000"); await p.click("#onbCar button[type=submit]"); await p.waitForTimeout(300);
  await p.evaluate(() => document.querySelector(".onb input[value=basic]").click()); await p.click("#onbDone"); await p.waitForTimeout(1500);
  ok(!(await p.evaluate(() => !!document.querySelector(".onb"))), "onboarding closes");
  ok((await p.textContent("#subline")).includes("קורולה"), "home shows the new car");
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
  await p.setInputFiles("#qfFile", IMG); await p.keyboard.press("Escape"); await p.waitForTimeout(1200);
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

  console.log("tickets and documents");
  await p.click('[data-nav="agents"]'); await p.waitForTimeout(300); await p.click("[data-act=agtab][data-id=tickets]"); await p.waitForTimeout(300);
  await p.click("[data-act=tkAdd]"); await p.waitForTimeout(300); await p.setInputFiles("#tkF", IMG); await p.waitForTimeout(1200);
  await p.click("#tk button[type=submit]"); await p.waitForTimeout(900);
  ok((await p.evaluate(() => document.querySelector(".pol h2").innerText)).startsWith("8"), "ticket points are counted");
  await p.click("[data-act=agtab][data-id=docs]"); await p.waitForTimeout(300);
  await p.click("[data-act=docUp][data-type=insurance]"); await p.waitForTimeout(300); await p.setInputFiles("#duFile", PDF); await p.click("#duGo"); await p.waitForTimeout(2200);
  ok((await p.evaluate(() => document.querySelectorAll(".cov").length)) >= 3, "policy coverages are shown");
  ok(!(await overflow(p)), "no sideways scroll: documents");

  console.log("backup and restore");
  await p.click("#acctBtn"); await p.waitForTimeout(300);
  const dl = p.waitForEvent("download"); await p.click("#acExport"); const file = await dl; const fp = await file.path();
  await p.keyboard.press("Escape");
  await p.evaluate(() => { window.__rows = window.__rows.filter((r) => r.collection !== "expense"); });
  await p.click("#acctBtn"); await p.waitForTimeout(300); await p.click("[data-act=restore]"); await p.waitForTimeout(300);
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

  console.log("admin screen");
  p = await page("#q", { url: ADMIN, wait: 1500 });
  ok((await p.evaluate(() => document.querySelectorAll(".kpi").length)) >= 4, "admin overview");
  await p.click('#tabs button[data-t="users"]'); await p.waitForTimeout(500);
  ok((await p.evaluate(() => document.querySelectorAll("tr[data-u]").length)) === 2, "admin users table");
  await p.click('#tabs button[data-t="costs"]'); await p.waitForTimeout(400);
  ok((await p.evaluate(() => document.querySelector("main").innerText)).includes("סריקות"), "admin costs");
  await p.context().close();

  ok(errors.length === 0, "no errors in the page", errors.slice(0, 5));
  await browser.close();
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
