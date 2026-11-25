// check-phone-gov.mjs: the phone quality governor on synthetic frame times (headless Chrome, no real rendering involved): node test/check-phone-gov.mjs [port]
// 1 clean 60 Hz climbs 1 -> 2 once; 2 a steady 30 Hz cadence (iOS Low Power Mode) costs at most one step and never climbs; 3 real load steps down and does not flap;
// 4 a failed step up puts a ceiling on the ladder (one failed climb, then no climb for a minute). Exits non-zero on failure.
import { chromium } from '/opt/npm-tools/node_modules/playwright/index.mjs';
const port = process.argv[2] || '8731';
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
const page = await ctx.newPage(); page.on('pageerror', e => console.log('PAGEERR', e.message));
await page.goto(`http://localhost:${port}/test/home.html?qa&layout=phone&demo=0`, { waitUntil: 'load' });
await page.waitForFunction(() => window.TFSolutions && window.TFSolutions.sol, null, { timeout: 120000 });
const res = await page.evaluate(async () => {
  const s = window.TFSolutions.sol, q = s.qa; await s.ready; s.stop();
  const run = (sec, f, ph = 0) => { const lv = []; const n = Math.round(sec * 60); let t = 0; for (let i = 0; i < n; i++) { const dt = f(i, t); t += dt; q.govTick(dt); if (i % 30 === 0) lv.push(q.gov.level); } return { level: q.gov.level, trace: lv.join(''), steps: q.gov.steps, ceil: q.gov.ceil, capped: q.gov.capped }; };
  const out = {};
  q.setLevel(1); q.gov.steps = 0;
  out.clean = run(20, () => 1 / 60);                                            // expect level 2 after ~6 s, one step
  q.setLevel(1); q.gov.steps = 0; q.gov.ceil = 2; q.gov.ema = 1 / 60;
  out.cap30 = run(40, () => 1 / 30);                                            // a steady 30 Hz: no climb, at most one step down (level 1 -> 0 is that step)
  q.setLevel(2); q.gov.steps = 0; q.gov.ema = 1 / 60;
  out.cap30From2 = run(40, () => 1 / 30);                                       // from the top: one step to 1, then it holds
  q.setLevel(2); q.gov.steps = 0; q.gov.ema = 1 / 60; q.gov.capped = false;
  out.load = run(30, (i) => 0.026 + 0.012 * Math.sin(i));                       // ~26-38 ms with jitter: real load, steps down to 0 and stays
  q.setLevel(1); q.gov.steps = 0; q.gov.ema = 1 / 60; q.gov.ceil = 2;
  // 8 s clean (climbs to 2), then heavy for 4 s (drops within 15 s of the climb: ceiling), then clean for 40 s (must not climb again before the ceiling expires)
  const a = run(8, () => 1 / 60), b = run(4, () => 0.03), c = run(40, () => 1 / 60);
  out.flap = { a: a.level, b: b.level, c: c.level, ceil: c.ceil, steps: c.steps, trace: c.trace };
  return out;
});
console.log(JSON.stringify(res, null, 1));
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log('FAIL', m); } };
ok(res.clean.level === 2 && res.clean.steps === 1, 'clean 60 Hz climbs once to 2');
ok(res.cap30.steps <= 1 && res.cap30.level <= 1, '30 Hz from 1: no climb, one step at most');
ok(res.cap30From2.level === 1 && res.cap30From2.steps === 1, '30 Hz from 2: exactly one step down, then holds');
ok(res.load.level === 0, 'real load steps to 0');
ok(res.flap.a === 2 && res.flap.b < 2 && res.flap.steps <= 3, 'failed climb: ' + JSON.stringify(res.flap));
console.log(fails ? 'FAILED' : 'ok'); await browser.close(); process.exit(fails ? 1 : 0);
