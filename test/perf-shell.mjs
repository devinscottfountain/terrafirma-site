// perf-shell.mjs: CPU-side measurements of the footer (test/careers.html) and the Mission scene (test/mission.html) in headless Chrome
// on software GL. Valid here: JS ms around the frame, GL call counts by kind, bytes uploaded, JS heap allocated per frame, draw calls,
// triangles, programs, texture / target sizes. NOT valid: GPU time. Usage: node test/perf-shell.mjs <footer|mission> [desktop|phone] [label]
import { launch, serve, ORIGIN } from './lib-route.mjs';
import fs from 'node:fs';

const which = process.argv[2] || 'footer', dev = process.argv[3] || 'desktop', label = process.argv[4] || 'run';
const N = +(process.env.FRAMES || 240);
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mozilla/5.0 AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const cfg = dev === 'phone' ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, userAgent: UA } : { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 };

const browser = await launch();
const ctx = await browser.newContext(cfg);
const page = await ctx.newPage();
const net = {}; await serve(page, net);
const errs = [];
page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.text().slice(0, 200)); });

// GL call counters on the prototype (toggle with window.__glc.on)
await page.addInitScript(() => {
  const c = window.__glc = { on: false, n: {}, bytes: 0, ctx: 0 };
  const P = WebGL2RenderingContext.prototype;
  const gc = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (t, ...a) { if (/webgl/.test(t)) c.ctx++; return gc.call(this, t, ...a); };
  for (const k of Object.getOwnPropertyNames(P)) {
    const d = Object.getOwnPropertyDescriptor(P, k); const f = d && d.value; if (typeof f !== 'function' || k === 'constructor' || k === 'getError') continue;
    P[k] = function (...a) {
      if (c.on) {
        c.n[k] = (c.n[k] || 0) + 1;
        if (k === 'bufferData' || k === 'bufferSubData') { const d = k === 'bufferData' ? a[1] : a[2]; c.bytes += k === 'bufferSubData' && a.length >= 5 ? a[4] * (d.BYTES_PER_ELEMENT || 1) : (d && d.byteLength) || (typeof d === 'number' ? d : 0); }   // ranged uploads count only their range
        else if (k === 'texImage2D' || k === 'texSubImage2D') { const w = a.length > 8 ? a[3] : 0, h = a.length > 8 ? a[4] : 0; c.bytes += w * h * 4; }
      }
      return f.apply(this, a);
    };
  }
});

async function heapProfile(fn) {
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('HeapProfiler.enable');
  await page.evaluate(() => window.gc && window.gc());
  await cdp.send('HeapProfiler.startSampling', { samplingInterval: 256, includeObjectsCollectedByMinorGC: true, includeObjectsCollectedByMajorGC: true });
  await fn();
  const { profile } = await cdp.send('HeapProfiler.stopSampling');
  let total = 0; const byFn = {};
  const walk = n => { const self = n.selfSize || 0; total += self; if (self) { const k = n.callFrame.functionName + ' ' + n.callFrame.url.split('/').slice(-2).join('/') + ':' + n.callFrame.lineNumber; byFn[k] = (byFn[k] || 0) + self; } (n.children || []).forEach(walk); };
  walk(profile.head);
  await cdp.detach();
  return { total, top: Object.entries(byFn).sort((a, b) => b[1] - a[1]).slice(0, 12) };
}

const out = { label, which, dev, errs };
if (which === 'footer') {
  await page.goto(`${ORIGIN}/test/careers.html${process.env.QS || ''}`, { waitUntil: 'load' });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForFunction(() => window.TFFooter && window.TFFooter.footer && window.TFFooter.footer.stats().stage === 1, null, { timeout: 180000 });
  await page.waitForTimeout(3000);   // textures stream in
  await page.evaluate(() => { const f = window.TFFooter.footer; f.stop(); f.setProgress(1); });
  await page.waitForTimeout(500);
  out.start = await page.evaluate(() => { const f = window.TFFooter.footer; return { quality: window.TFFooter.quality, stats: f.stats(), info: JSON.parse(JSON.stringify(f.renderer.info.memory)), canvas: [f.renderer.domElement.width, f.renderer.domElement.height], dpr: devicePixelRatio, gl: window.__glc.ctx }; });
  // timing: renderOnce(t) with a fixed scene clock sweep; the render call is timed separately from the rest of the frame
  const run = async n => page.evaluate(n => {
    const f = window.TFFooter.footer, r = f.renderer, rd = r.render.bind(r); let tr = 0, calls = 0; r.render = (a, b) => { const t0 = performance.now(); rd(a, b); tr += performance.now() - t0; calls++; };
    window.__glc.on = true; window.__glc.n = {}; window.__glc.bytes = 0;
    const t0 = performance.now(), ts = [];
    for (let i = 0; i < n; i++) { const a = performance.now(); f.renderOnce(10 + i / 60); ts.push(performance.now() - a); }
    const tot = performance.now() - t0; window.__glc.on = false; r.render = rd;
    ts.sort((a, b) => a - b);
    const i = f.renderer.info;
    return { frameMsMean: tot / n, frameMsMedian: ts[n >> 1], frameMsP90: ts[Math.floor(n * 0.9)], renderCallMsMean: tr / n, rendersPerFrame: calls / n, gl: Object.fromEntries(Object.entries(window.__glc.n).map(([k, v]) => [k, +(v / n).toFixed(2)]).filter(([, v]) => v >= 0.5).sort((a, b) => b[1] - a[1]).slice(0, 22)), uploadBytesPerFrame: window.__glc.bytes / n, stats: f.stats(), programs: i.programs.length, geometries: i.memory.geometries, textures: i.memory.textures };
  }, n);
  await run(30);   // warm
  out.timing = await run(N);
  out.alloc = await heapProfile(async () => { await page.evaluate(n => { const f = window.TFFooter.footer; for (let i = 0; i < n; i++) f.renderOnce(10 + i / 60); }, N); });
  out.alloc.perFrame = out.alloc.total / N;
  // scene graph size
  out.scene = await page.evaluate(() => {
    const f = window.TFFooter.footer; let meshes = 0, inst = 0, pts = 0, tr = 0, auto = 0, objs = 0; const mats = new Set();
    f.scene.traverse(o => { objs++; if (o.matrixAutoUpdate) auto++; if (o.isMesh) { meshes++; if (o.isInstancedMesh) inst++; const m = o.material; mats.add(m.uuid); } if (o.isPoints) pts++; });
    return { objs, meshes, instanced: inst, points: pts, materials: mats.size, matrixAutoUpdate: auto, shadowMap: f.renderer.shadowMap.enabled };
  });
  // targets: read the three render targets through their textures in renderer.properties is awkward; report canvas size and compute by hand in the doc
}
if (which === 'mission') {
  await page.goto(`${ORIGIN}/test/mission.html${process.env.QS || ''}`, { waitUntil: 'load' });
  await page.evaluate(() => document.querySelector('[data-mission]').scrollIntoView({ block: 'center' }));
  await page.waitForFunction(() => window.TFMission && window.TFMission.mission && window.TFMission.mission.stats.frames > 2, null, { timeout: 180000 });
  await page.waitForTimeout(2500);
  await page.evaluate(() => window.TFMission.mission.stop());
  out.start = await page.evaluate(() => { const m = window.TFMission.mission; return { quality: window.TFMission.quality, stats: JSON.parse(JSON.stringify(m.stats)), canvas: [m.renderer.domElement.width, m.renderer.domElement.height], mem: JSON.parse(JSON.stringify(m.renderer.info.memory)), glctx: window.__glc.ctx, attrs: m.renderer.getContext().getContextAttributes() }; });
  await page.evaluate(() => window.scrollBy(0, 1));
  // draw() is internal: drive it through capture-free renders by toggling start, so time the real tick via a rAF loop instead
  const run = async ms => page.evaluate(ms => new Promise(res => {
    const m = window.TFMission.mission, r = m.renderer, rd = r.render.bind(r); let tr = 0, calls = 0; r.render = (a, b) => { const t0 = performance.now(); rd(a, b); tr += performance.now() - t0; calls++; };
    window.__glc.on = true; window.__glc.n = {}; window.__glc.bytes = 0;
    const f0 = m.stats.frames; m.start(); const t0 = performance.now();
    setTimeout(() => { m.stop(); const t = performance.now() - t0, n = m.stats.frames - f0; window.__glc.on = false; r.render = rd;
      res({ frames: n, renderCallMsMean: tr / Math.max(1, calls), gl: Object.fromEntries(Object.entries(window.__glc.n).map(([k, v]) => [k, +(v / Math.max(1, n)).toFixed(2)]).filter(([, v]) => v >= 0.5).sort((a, b) => b[1] - a[1]).slice(0, 18)), uploadBytesPerFrame: window.__glc.bytes / Math.max(1, n), programs: r.info.programs.length, calls: r.info.render.calls, tris: r.info.render.triangles }); }, ms);
  }), ms);
  out.timing = await run(4000);
  out.alloc = await heapProfile(async () => { await run(4000); });
}
out.net = Object.entries(net).sort((a, b) => b[1] - a[1]).slice(0, 25);
out.netTotal = Object.values(net).reduce((a, b) => a + b, 0);
fs.mkdirSync(new URL('./out/', import.meta.url).pathname, { recursive: true });
fs.writeFileSync(new URL(`./out/perf-${which}-${dev}-${label}.json`, import.meta.url).pathname, JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
await browser.close();
