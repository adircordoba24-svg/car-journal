// Visual checks: every main screen, on a small phone, a large phone, a tablet and a computer, in dark and light.
// For each one it looks at the rendered page and fails on: sideways scrolling, things sticking out of the screen,
// text that overlaps other text, text cut off without "…", text too faint to read (contrast), and buttons too small to tap.
// Screenshots of everything are saved to tests/shots/ (CI keeps them for download).
// Run:  python3 build.py && python3 tests/build-test-page.py && node tests/visual.test.js
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");
const APP = "file://" + path.resolve(__dirname, "app.html");
const SHOTS = path.resolve(__dirname, "shots");
fs.mkdirSync(SHOTS, { recursive: true });

const SIZES = [
  ["se", { width: 320, height: 640, isMobile: true, hasTouch: true }],
  ["phone", { width: 390, height: 844, isMobile: true, hasTouch: true }],
  ["tablet", { width: 768, height: 1024, isMobile: true, hasTouch: true }],
  ["desktop", { width: 1280, height: 860 }],
];
const THEMES = ["dark", "light"];
const ONLY = process.argv[2]; // optional: run one screen by name

// the checks run inside the page
function inspect(rootSel) {
  const root = document.querySelector(rootSel) || document.body;
  const vw = innerWidth, out = [];
  const vis = (el) => { const r = el.getBoundingClientRect(); if (r.width < 1 || r.height < 1) return false; const dt = el.closest("details:not([open])"); if (dt && !el.closest("summary")) return false; for (let e = el; e; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.display === "none" || cs.visibility === "hidden" || +cs.opacity === 0) return false; } return true; };
  const inScroller = (el) => { for (let e = el.parentElement; e && e !== document.body; e = e.parentElement) { const ox = getComputedStyle(e).overflowX; if (ox === "auto" || ox === "scroll") return true; } return false; };
  const name = (el) => (el.id ? "#" + el.id : el.tagName.toLowerCase() + (el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\s+/).slice(0, 2).join(".") : "")) + ' "' + (el.innerText || el.getAttribute("aria-label") || "").trim().replace(/\s+/g, " ").slice(0, 30) + '"';
  if (document.documentElement.scrollWidth > vw + 1) out.push(["sideways-scroll", document.documentElement.scrollWidth + "px"]);
  // leaf elements that show text
  const texts = [...root.querySelectorAll("*")].filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) && vis(el) && !el.closest("svg,option,select,textarea,.sr,[aria-hidden=true]"));
  for (const el of root.querySelectorAll("*")) {
    if (!vis(el) || el.closest("svg") || inScroller(el)) continue;
    const r = el.getBoundingClientRect();
    if (r.right > vw + 1 || r.left < -1) { const cs = getComputedStyle(el); if (cs.position !== "fixed" && !el.closest(".splash,.toast")) out.push(["off-screen", name(el), Math.round(r.left) + "→" + Math.round(r.right)]); }
  }
  // text cut off (no ellipsis)
  for (const el of texts) {
    const cs = getComputedStyle(el);
    if ((cs.overflowX === "hidden" || cs.overflow === "hidden") && cs.textOverflow !== "ellipsis" && el.scrollWidth > el.clientWidth + 2) out.push(["text-cut", name(el)]);
  }
  // overlapping text: measure the text itself, not the box around it
  const boxes = texts.map((el) => { const rg = document.createRange(); let r = null; for (const n of el.childNodes) if (n.nodeType === 3 && n.textContent.trim()) { rg.selectNodeContents(n); for (const b of rg.getClientRects()) { if (b.width < 1) continue; r = r ? { l: Math.min(r.l, b.left), t: Math.min(r.t, b.top), r: Math.max(r.r, b.right), b: Math.max(r.b, b.bottom) } : { l: b.left, t: b.top, r: b.right, b: b.bottom }; } } return r && { el, ...r }; }).filter(Boolean);
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
    const a = boxes[i], b = boxes[j];
    if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
    const ox = Math.min(a.r, b.r) - Math.max(a.l, b.l), oy = Math.min(a.b, b.b) - Math.max(a.t, b.t);
    if (ox > 3 && oy > 4) out.push(["overlap", name(a.el), name(b.el)]);
  }
  // contrast
  const rgb = (s) => { const m = s.match(/[\d.]+/g); return m ? m.map(Number) : [0, 0, 0, 0]; };
  const lum = ([r, g, b]) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const blend = (top, bot) => { const a = top[3] == null ? 1 : top[3]; return [0, 1, 2].map((i) => top[i] * a + bot[i] * (1 - a)).concat(1); };
  for (const el of texts) {
    if (el.closest("[disabled],.splash,.plate,.mock,.phone,.odo-digits .lead")) continue; // the odometer's leading zeros are dimmed on purpose
    const layers = []; let img = false;
    for (let e = el; e; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.backgroundImage !== "none") { img = true; break; } const c = rgb(cs.backgroundColor); if ((c[3] == null ? 1 : c[3]) > 0) { layers.push(c); if ((c[3] == null ? 1 : c[3]) >= 1) break; } }
    if (img) continue;
    let bg = rgb(getComputedStyle(document.body).backgroundColor);
    for (let k = layers.length - 1; k >= 0; k--) bg = blend(layers[k], bg);
    const cs = getComputedStyle(el); let fg = rgb(cs.color); fg = blend(fg, bg);
    const L1 = lum(fg), L2 = lum(bg), ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
    const px = parseFloat(cs.fontSize), bold = +cs.fontWeight >= 600, large = px >= 24 || (px >= 18.6 && bold);
    if (ratio < (large ? 3 : 4.5)) out.push(["contrast", name(el), ratio.toFixed(2)]);
  }
  // tap targets
  for (const el of root.querySelectorAll("button,a[href],input:not([type=hidden]),select,[role=tab]")) {
    if (!vis(el) || el.closest(".linkbtn,p,.small") || el.classList.contains("linkbtn")) continue;
    const t = el.closest("label") || el; const r = t.getBoundingClientRect();
    if (r.width < 24 || r.height < 24) out.push(["small-target", name(el), Math.round(r.width) + "×" + Math.round(r.height)]);
  }
  return out;
}

const SCREENS = [
  ["home", "#q", async (p) => {}],
  ["fuel", "#q", async (p) => p.click('[data-nav="fuel"]')],
  ["service", "#q", async (p) => p.click('[data-nav="service"]')],
  ["expense", "#q", async (p) => p.click('[data-nav="expense"]')],
  ["reminder", "#q", async (p) => p.click('[data-nav="reminder"]')],
  ["agents", "#q", async (p) => p.click('[data-nav="agents"]')],
  ["documents", "#q", async (p) => { await p.click('[data-nav="agents"]'); await p.waitForTimeout(300); await p.click("[data-act=agtab][data-id=docs]"); }],
  ["tickets", "#q", async (p) => { await p.click('[data-nav="agents"]'); await p.waitForTimeout(300); await p.click("[data-act=agtab][data-id=tickets]"); }],
  ["ticket-check", "#q", async (p) => {
    await p.click('[data-nav="agents"]'); await p.waitForTimeout(300); await p.click("[data-act=agtab][data-id=tickets]"); await p.waitForTimeout(300);
    await p.click("[data-act=tkAdd]"); await p.waitForTimeout(300);
    await p.setInputFiles("#tkF", { name: "t.png", mimeType: "image/png", buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64") });
    await p.waitForTimeout(1200); await p.click("#tk button[type=submit]");
    await p.waitForFunction(() => document.querySelector(".tkc-v"), null, { timeout: 5000 });
  }, ".sheet", "window.__badTicket=true"],
  ["help-points", "#q", async (p) => { await p.click('[data-nav="agents"]'); await p.waitForTimeout(300); await p.click("[data-act=agtab][data-id=tickets]"); await p.waitForTimeout(300); await p.click('.eyebrow [data-act=help][data-id=points]'); }, ".sheet"],
  ["help-home", "#q", async (p) => p.click("[data-act=helpHere]"), ".sheet"],
  ["checks-done", "#q", async (p) => { await p.click('[data-nav="service"]'); await p.waitForTimeout(300); await p.click('.rrow [data-act=done][data-id="r2"]'); await p.waitForTimeout(500); }],
  ["quick-sheet", "#q", async (p) => p.click("[data-act=quick]"), ".sheet"],
  ["voice-sheet", "#q", async (p) => { await p.click("[data-act=quick]"); await p.waitForTimeout(250); await p.click(".qbtn[data-act=voice]"); }, ".sheet"],
  ["account-sheet", "#q", async (p) => p.click("#acctBtn"), ".sheet"],
  ["fleet", "#q", async (p) => {}, "#view", "window.__fleet=true"],
  ["fleet-cars", "#q", async (p) => p.click("#carBtn"), ".sheet", "window.__fleet=true"],
  ["fleet-import", "#q", async (p) => {
    await p.click("[data-act=flImport]"); await p.waitForTimeout(250);
    await p.setInputFiles("#imF", { name: "cars.csv", mimeType: "text/csv", buffer: Buffer.from("מספר רישוי,יצרן,דגם,ק״מ,טסט עד,נהג\n5678901,יונדאי,i20,40000,15/03/2027,רונית לוי\n6789012,פולקסווגן,גולף,73000,2027-01-31,\n") });
    await p.waitForFunction(() => /נמצאו/.test(document.querySelector("#imOut").innerText), null, { timeout: 5000 });
  }, ".sheet", "window.__fleet=true"],
];

async function runCombo(browser, sname, size, theme, log, errors) {
  let failed = 0, checked = 0;
  const ctx = await browser.newContext({ viewport: { width: size.width, height: size.height }, isMobile: !!size.isMobile, hasTouch: !!size.hasTouch, deviceScaleFactor: 1, colorScheme: theme, reducedMotion: "reduce" });
  for (const [name, hash, act, rootSel, init] of SCREENS) {
    if (ONLY && name !== ONLY) continue;
    const p = await ctx.newPage();
    p.on("pageerror", (e) => errors.push(name + ": " + e.message));
    if (init) await p.addInitScript(init);
    await p.goto(APP + hash);
    await p.waitForFunction(() => document.querySelector("#view .card,#view .kpis"), null, { timeout: 15000 }).catch(() => {});
    await p.evaluate(() => { const s = document.getElementById("splash"); if (s) s.remove(); });
    await p.waitForTimeout(500);
    try { await act(p); } catch (e) { failed++; log.push(`  ✗ ${name} · ${sname} · ${theme}: could not open (${e.message.split("\n")[0]})`); await p.close(); continue; }
    await p.waitForTimeout(600);
    const problems = await p.evaluate(inspect, rootSel || "#view");
    await p.screenshot({ path: path.join(SHOTS, `${name}-${sname}-${theme}.png`) });
    checked++;
    const uniq = [...new Map(problems.map((x) => [x.join("|"), x])).values()];
    if (uniq.length) { failed++; log.push(`  ✗ ${name} · ${sname} · ${theme}`); uniq.slice(0, 12).forEach((x) => log.push("      " + x.join("  "))); if (uniq.length > 12) log.push(`      …and ${uniq.length - 12} more`); }
    else log.push(`  ✓ ${name} · ${sname} · ${theme}`);
    await p.close();
  }
  await ctx.close();
  return { failed, checked };
}

(async () => {
  const browser = await chromium.launch();
  const errors = [], jobs = [];
  for (const [sname, size] of SIZES) for (const theme of THEMES) jobs.push([sname, size, theme]);
  let failed = 0, checked = 0;
  for (let i = 0; i < jobs.length; i += 4) {
    const batch = jobs.slice(i, i + 4).map(async ([sname, size, theme]) => { const log = []; const r = await runCombo(browser, sname, size, theme, log, errors); return { r, log }; });
    for (const { r, log } of await Promise.all(batch)) { failed += r.failed; checked += r.checked; log.forEach((l) => console.log(l)); }
  }
  if (errors.length) { failed++; console.log("  ✗ errors in the page", errors.slice(0, 5)); }
  await browser.close();
  console.log(`\n${checked} screens checked, ${failed} with problems. Screenshots: tests/shots/`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
