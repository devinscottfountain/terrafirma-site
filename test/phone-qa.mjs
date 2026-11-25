// phone-qa.mjs: emulated iPhone runs of the Solutions test page (headless Chrome, software GL). node test/phone-qa.mjs <label> [port]
// Writes test/out/<label>-<vp>-<tab>.png per viewport and tab, and prints the ?qa stats plus CPU time of sol.step. Software GL timings
// are NOT GPU numbers: only buffer sizes, counts and the JS time of the frame (CPU side) mean anything here.
import { chromium } from '/opt/npm-tools/node_modules/playwright/index.mjs';
import fs from 'node:fs';
const label = process.argv[2] || 'run', port = process.argv[3] || '8731', extra = process.argv[4] || '', H = process.env.STAGE_H || '';
const OUT = new URL('./out/', import.meta.url).pathname; fs.mkdirSync(OUT, { recursive: true });
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const VPS = [['390x844', 390, 844, 3], ['375x667', 375, 667, 2]].filter(v => !process.env.VP || v[0] === process.env.VP);
const TABS = ['orchestration', 'planning', 'execution'];
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const report = {};
for (const [name, w, h, dsf] of VPS) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dsf, isMobile: true, hasTouch: true, userAgent: UA });
  const page = await ctx.newPage(); const TUNE = process.env.TUNE;
  await page.addInitScript(() => { window.__clr = 0; window.__minFont = 1e9; { const f = CanvasRenderingContext2D.prototype.fillText; CanvasRenderingContext2D.prototype.fillText = function (...a) { const m = /(\d+(?:\.\d+)?)px/.exec(this.font); if (m) window.__minFont = Math.min(window.__minFont, +m[1]); return f.apply(this, a); }; } const c = CanvasRenderingContext2D.prototype.clearRect; CanvasRenderingContext2D.prototype.clearRect = function (...a) { window.__clr++; return c.apply(this, a); }; });   // HUD redraws: one clearRect per redraw (the only 2D canvas)
  page.on('pageerror', e => console.log('PAGEERROR', e.message));
  await page.goto(`http://localhost:${port}/test/home.html?qa&layout=phone&demo=0${H ? '&h=' + H : ''}${extra}`, { waitUntil: 'load' });
  await page.waitForFunction(() => window.TFSolutions && window.TFSolutions.sol, null, { timeout: 120000 });
  await page.evaluate(() => { const g = window.TFSolutions.sol.qa.gov; Object.defineProperty(g, 'real', { get: () => false, set() {} }); return window.TFSolutions.sol.ready; });   // software GL is slow: keep the governor from reacting to it (its own behaviour is tested separately)
  if (TUNE) await page.evaluate(t => { const q = window.TFSolutions.sol.qa, o = JSON.parse(t); Object.assign(q.TUNE.ph, o.ph || {}); q.refit(); }, TUNE);
  await page.evaluate(() => document.getElementById('solutions-stage').scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(1500);
  // take over the clock: stop the scene's own loop, step by hand
  await page.evaluate(() => { const s = window.TFSolutions.sol; s.stop(); });
  const R = {}; const LV = process.env.LEVEL;
  for (const tab of TABS) {
    await page.evaluate(t => document.querySelector(`button[data-tab="${t}"]`).click(), tab);
    if (LV) await page.evaluate(l => window.TFSolutions.sol.qa.setLevel?.(+l), LV);
    // the drawing buffer is only valid in the task that drew it (no preserveDrawingBuffer): draw, then composite WebGL + HUD canvases right there
    const png = await page.evaluate(() => {
      const s = window.TFSolutions.sol; s.renderNow(1 / 30, 150);
      const gl = s.canvas, hud = s.qa.hud.canvas, W = hud.width, Hh = hud.height, o = document.createElement('canvas'); o.width = W; o.height = Hh;
      const g = o.getContext('2d'); g.fillStyle = '#000'; g.fillRect(0, 0, W, Hh); g.drawImage(gl, 0, 0, W, Hh); g.drawImage(hud, 0, 0, W, Hh);
      return { url: o.toDataURL('image/png'), st: JSON.parse(JSON.stringify(s.stats)) };
    });
    R[tab] = png.st; R[tab].minFontPx = await page.evaluate(() => { const v = window.__minFont; window.__minFont = 1e9; return v; }); R[tab].dots = await page.evaluate(() => window.TFSolutions.sol.qa.dotsInView?.() ?? null); fs.writeFileSync(`${OUT}${label}-${name}-${tab}.png`, Buffer.from(png.url.split(',')[1], 'base64'));
  }
  // CPU time of sol.step on the orchestration tab (JS only, GL commands are issued but not waited for)
  await page.evaluate(() => document.querySelector('button[data-tab="orchestration"]').click());
  if (!process.env.NOCPU) R.cpu = await page.evaluate(() => {
    const s = window.TFSolutions.sol, a = []; s.start(true); s.renderNow(1 / 30, 60);
    const d0 = window.__clr; for (let i = 0; i < 120; i++) { const t0 = performance.now(); s.step(1 / 60); a.push(performance.now() - t0); }
    const hud = (window.__clr - d0) / 2;   // redraws per second of scene time (120 steps of 1/60 s)
    a.sort((x, y) => x - y);
    return { median: +a[60].toFixed(2), p90: +a[108].toFixed(2), hudHz: hud };
  });
  R.dpr = dsf; R.vp = name; report[name] = R;
  await ctx.close();
}
await browser.close();
fs.writeFileSync(`${OUT}${label}.json`, JSON.stringify(report, null, 1));
console.log(JSON.stringify(report, null, 1));
