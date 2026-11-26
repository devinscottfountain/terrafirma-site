// perf-sol.mjs: Solutions scene CPU / upload / allocation numbers in headless Chrome (software GL: JS time and counts only, never GPU time).
//   node test/perf-sol.mjs <label> [--phone|--desktop] [--tab=orchestration|planning|execution] [--frames=240] [--scroll] [--profile] [--q=low|high] [--level=N]
// Prints one JSON line and writes test/out/perf-<label>.json. Counters wrap the WebGL2 context: bytes per frame by call type.
import { chromium } from '/opt/npm-tools/node_modules/playwright/index.mjs';
import fs from 'node:fs';
import { serve, ORIGIN } from './lib/serve.mjs';
const A = process.argv.slice(2), label = A.find(a => !a.startsWith('--')) || 'run', has = k => A.includes('--' + k), opt = (k, d) => (A.find(a => a.startsWith('--' + k + '=')) || '').split('=')[1] ?? d;
const phone = !has('desktop'), tabs = (opt('tab', '') ? [opt('tab')] : ['orchestration', 'planning', 'execution']), frames = +opt('frames', 240), extra = opt('q', '') ? '&q=' + opt('q') : '';
const OUT = new URL('./out/', import.meta.url).pathname; fs.mkdirSync(OUT, { recursive: true });
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mobile/15E148 Safari/604.1)'.replace('iPhone OS 17_5 like Mobile', 'iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile');
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-precise-memory-info', '--js-flags=--expose-gc'] });
const ctx = await browser.newContext(phone ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, userAgent: UA } : { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
await serve(ctx);
const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
await page.addInitScript(() => {
  { const r = window.requestAnimationFrame.bind(window); window.requestAnimationFrame = f => (f.name === 'loop' ? 0 : r(f)); }   // the scene's own rAF loop never runs (frames are stepped by hand below)
  const H = window.__hist = {}; const C = window.__gl = { bufferData: [0, 0], bufferSubData: [0, 0], texImage2D: [0, 0], texSubImage2D: [0, 0], draws: 0, ro: 0, io: 0, measure: 0 };
  const P = WebGL2RenderingContext.prototype, wrap = (name, f) => { const o = P[name]; P[name] = function (...a) { f(a); return o.apply(this, a); }; };
  const len = v => (v == null ? 0 : typeof v === 'number' ? v : v.byteLength != null ? v.byteLength : 0);
  wrap('bufferData', a => { C.bufferData[0]++; C.bufferData[1] += len(a[1]); });
  wrap('bufferSubData', a => { C.bufferSubData[0]++; let b = len(a[2]); if (typeof a[4] === 'number' && a[4] > 0) b = a[4] * (a[2].BYTES_PER_ELEMENT || 1); C.bufferSubData[1] += b; H[b] = (H[b] || 0) + 1; });
  wrap('texImage2D', a => { C.texImage2D[0]++; const l = a[a.length - 1]; C.texImage2D[1] += l && l.byteLength != null ? l.byteLength : (a[3] | 0) * (a[4] | 0) * 4; });
  wrap('texSubImage2D', a => { C.texSubImage2D[0]++; const l = a[a.length - 1]; C.texSubImage2D[1] += l && l.byteLength != null ? l.byteLength : (a[4] | 0) * (a[5] | 0) * 4; });
  for (const n of ['drawArrays', 'drawElements', 'drawArraysInstanced', 'drawElementsInstanced']) wrap(n, () => { C.draws++; });
  const RO = window.ResizeObserver; window.ResizeObserver = class extends RO { constructor(cb) { super((...a) => { C.ro++; cb(...a); }); } };
  const IO = window.IntersectionObserver; window.IntersectionObserver = class extends IO { constructor(cb, o) { super((...a) => { C.io++; cb(...a); }, o); } };
  const mt = CanvasRenderingContext2D.prototype.measureText; CanvasRenderingContext2D.prototype.measureText = function (s) { C.measure++; return mt.call(this, s); };
  const ft = CanvasRenderingContext2D.prototype.fillText; window.__text = 0; CanvasRenderingContext2D.prototype.fillText = function (...a) { window.__text++; return ft.apply(this, a); };
  const cr = CanvasRenderingContext2D.prototype.clearRect; window.__clr = 0; CanvasRenderingContext2D.prototype.clearRect = function (...a) { if (a[2] > 100) window.__clr++; return cr.apply(this, a); };
});
await page.goto(`${ORIGIN}/test/home.html?qa&demo=0${phone ? '&layout=phone' : ''}${extra}`, { waitUntil: 'load' });
await page.waitForFunction(() => window.TFSolutions && window.TFSolutions.sol, null, { timeout: 180000 });
await page.evaluate(() => { const g = window.TFSolutions.sol.qa.gov; Object.defineProperty(g, 'real', { get: () => false, set() {} }); return window.TFSolutions.sol.ready; });   // software GL: keep the governor out of it
if (opt('level', '') !== '') await page.evaluate(l => window.TFSolutions.sol.qa.setLevel(+l), opt('level'));
await page.evaluate(() => document.getElementById('solutions-stage').scrollIntoView({ block: 'center' }));
await page.waitForTimeout(1500);
const cdp = await ctx.newCDPSession(page);
const R = { label, phone, errs };
R.info = await page.evaluate(() => { const s = window.TFSolutions.sol; s.stop(); s.renderNow(1 / 60, 5); const st = s.stats; return { quality: window.TFSolutions.quality, buffer: st.buffer, pr: st.pr, points: st.points, programs: st.programs, level: st.level, hudCanvas: [s.qa.hud.canvas.width, s.qa.hud.canvas.height] }; });
for (const tab of tabs) {
  await page.evaluate(t => document.querySelector(`button[data-tab="${t}"]`).click(), tab);
  await page.evaluate(() => { const s = window.TFSolutions.sol; s.renderNow(1 / 60, 240); });   // let the flight land
  const r = await page.evaluate(async ({ frames, scroll }) => {
    const s = window.TFSolutions.sol, C = window.__gl, a = [], d = [];
    s.start(true); gc();
    const z = () => { for (const k of ['bufferData', 'bufferSubData', 'texImage2D', 'texSubImage2D']) C[k] = [0, 0]; C.draws = 0; C.ro = 0; C.io = 0; C.measure = 0; window.__text = 0; window.__clr = 0; for (const k in window.__hist) delete window.__hist[k]; };
    for (let i = 0; i < 30; i++) s.step(1 / 60);
    z(); const sy0 = window.scrollY, t0 = performance.now();
    for (let i = 0; i < frames; i++) { if (scroll) window.scrollBy(0, (i & 1) ? 2 : -2); const q = performance.now(); s.step(1 / 60); a.push(performance.now() - q); }
    const hist = Object.entries(window.__hist).sort((x, y) => y[0] * y[1] - x[0] * x[1]).slice(0, 8).map(([b, n]) => `${b} B x ${(n / frames).toFixed(2)}/frame`), snap = JSON.parse(JSON.stringify(C)), text = window.__text, clr = window.__clr;
    a.sort((x, y) => x - y);
    return { median: +a[a.length >> 1].toFixed(2), p90: +a[(a.length * 0.9) | 0].toFixed(2), mean: +(a.reduce((x, y) => x + y, 0) / a.length).toFixed(2), per: { bufferData: snap.bufferData.map(v => +(v / frames).toFixed(1)), bufferSubData: snap.bufferSubData.map(v => +(v / frames).toFixed(1)), texImage2D: snap.texImage2D.map(v => +(v / frames).toFixed(2)), texSubImage2D: snap.texSubImage2D.map(v => +(v / frames).toFixed(2)), draws: +(snap.draws / frames).toFixed(1), measureText: +(snap.measure / frames).toFixed(2), fillText: +(text / frames).toFixed(2), hudClears: +(clr / frames).toFixed(2), ro: snap.ro, io: snap.io }, stats: s.stats, hist };
  }, { frames, scroll: has('scroll') });
  // allocation: heap growth over N frames with no GC (scavenges inside the window make this a lower bound)
  const alloc = await page.evaluate(async () => { const s = window.TFSolutions.sol; gc(); gc(); return 0; });
  const h0 = (await cdp.send('Runtime.getHeapUsage')).usedSize;
  await page.evaluate(() => { const s = window.TFSolutions.sol; for (let i = 0; i < 90; i++) s.step(1 / 60); });
  const h1 = (await cdp.send('Runtime.getHeapUsage')).usedSize;
  r.allocPerFrameKB = +((h1 - h0) / 90 / 1024).toFixed(2);
  if (has('profile')) {
    await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval: 200 }); await cdp.send('Profiler.start');
    await page.evaluate(() => { const s = window.TFSolutions.sol; for (let i = 0; i < 300; i++) s.step(1 / 60); });
    const { profile } = await cdp.send('Profiler.stop'); const self = new Map(), dt = profile.timeDeltas, ids = profile.samples, byId = new Map(profile.nodes.map(n => [n.id, n]));
    for (let i = 0; i < ids.length; i++) { const n = byId.get(ids[i]), k = n.callFrame.functionName + ' ' + n.callFrame.url.split('/').slice(-2).join('/') + ':' + n.callFrame.lineNumber; self.set(k, (self.get(k) || 0) + (dt[i] || 0)); }
    r.top = [...self.entries()].sort((x, y) => y[1] - x[1]).slice(0, 18).map(([k, v]) => `${(v / 300 / 1000).toFixed(3)} ms/frame  ${k}`);
  }
  R[tab] = r; await page.evaluate(() => window.TFSolutions.sol.stop());
}
await browser.close();
fs.writeFileSync(`${OUT}perf-${label}.json`, JSON.stringify(R, null, 1)); console.log(JSON.stringify(R, null, 1));
