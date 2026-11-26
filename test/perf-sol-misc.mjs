// perf-sol-misc.mjs: one-off costs on the phone profile (JS ms only): refit / setSafe, resize, a governor level change, stop -> 2.7 s -> start (the free and re-allocate path).
import { chromium } from '/opt/npm-tools/node_modules/playwright/index.mjs';
import { serve, ORIGIN } from './lib/serve.mjs';
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, userAgent: UA }); await serve(ctx);
const page = await ctx.newPage(); page.on('pageerror', e => console.log('PAGEERR', e.message));
await page.addInitScript(() => { const r = window.requestAnimationFrame.bind(window); window.requestAnimationFrame = f => (f.name === 'loop' ? 0 : r(f));
  window.__gl = { buf: 0, tex: 0, alloc: 0 }; const P = WebGL2RenderingContext.prototype; for (const [n, k] of [['renderbufferStorage', 'alloc'], ['renderbufferStorageMultisample', 'alloc'], ['texStorage2D', 'alloc'], ['bufferData', 'buf']]) { const o = P[n]; P[n] = function (...a) { window.__gl[k]++; return o.apply(this, a); }; } });
await page.goto(`${ORIGIN}/test/home.html?qa&demo=0&layout=phone`, { waitUntil: 'load' });
await page.waitForFunction(() => window.TFSolutions && window.TFSolutions.sol, null, { timeout: 180000 });
await page.waitForFunction(() => window.TFSolutions.warmed !== false, null, { timeout: 180000 });   // the off-screen warm-up (all programs, one hidden draw) has finished (builds without the flag: undefined)
await page.waitForTimeout(3000);   // settle: fonts, load, the first layout passes and (older builds) the idle warm-up, so every build starts the shots from the same state
await page.evaluate(() => { const g = window.TFSolutions.sol.qa.gov; Object.defineProperty(g, 'real', { get: () => false, set() {} }); return window.TFSolutions.sol.ready; });
await page.evaluate(() => document.getElementById('solutions-stage').scrollIntoView({ block: 'center' }));
const R = await page.evaluate(async () => {
  const s = window.TFSolutions.sol, q = s.qa, out = {}, T = (n, f) => { const a = []; for (let i = 0; i < n; i++) { const t = performance.now(); f(i); a.push(performance.now() - t); } a.sort((x, y) => x - y); return { median: +a[a.length >> 1].toFixed(3), max: +a[a.length - 1].toFixed(3) }; };
  s.stop(); s.renderNow(1 / 60, 5);
  out.refit = T(60, () => q.refit());
  out.setSafe = T(60, i => s.setSafe({ top: 0.2, bottom: 0.3 + (i % 2) * 0.01 }));
  out.resizeFn = T(10, () => s.resize());
  out.setLevel_1_to_2_to_1 = T(6, i => q.setLevel(i % 2 ? 1 : 2));
  const g0 = { ...window.__gl }; s.stop(); await new Promise(r => setTimeout(r, 2800)); const g1 = { ...window.__gl };
  const t = performance.now(); s.start(true); out.startAfterFree = +(performance.now() - t).toFixed(2); const t2 = performance.now(); s.step(1 / 60); out.firstStepAfterFree = +(performance.now() - t2).toFixed(2);
  out.glAllocOnFree = g1.alloc - g0.alloc; out.glAllocOnStart = window.__gl.alloc - g1.alloc; out.hudCanvas = [q.hud.canvas.width, q.hud.canvas.height];
  return out; });
console.log(JSON.stringify(R, null, 1)); await browser.close();
