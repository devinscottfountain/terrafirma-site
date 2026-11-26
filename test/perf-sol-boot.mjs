// perf-sol-boot.mjs: long tasks (> 50 ms) from page load to "scene visible", with the cause of each, for the Solutions boot.
//   node test/perf-sol-boot.mjs <label> [--phone|--desktop] [--gate] [--scenario=scroll|wait|none] [--throttle=4] [--speed=1500]
// scroll: load, then at once scroll to the section at --speed px/s; wait: load, idle 5 s, then scroll; none: no scroll (a visitor who never scrolls).
// --gate defines window.tfGate (a stub that records the progress values) as the Home head does on a capable desktop.
// Causes come from a CDP CPU profile (1 ms sampling): per task, self time by the nearest page-script frame (file:function).
// Software GL: JS / main thread only. Writes test/out/boot-<label>.json and prints it.
import { chromium } from '/opt/npm-tools/node_modules/playwright/index.mjs';
import fs from 'node:fs';
import { serve, ORIGIN } from './lib/serve.mjs';
const A = process.argv.slice(2), label = A.find(a => !a.startsWith('--')) || 'run', has = k => A.includes('--' + k), opt = (k, d) => (A.find(a => a.startsWith('--' + k + '=')) || '').split('=')[1] ?? d;
const phone = !has('desktop'), gate = has('gate'), scenario = opt('scenario', 'scroll'), thr = +opt('throttle', 1), speed = +opt('speed', 1500), extra = opt('q', '') ? '&q=' + opt('q') : '';
const OUT = new URL('./out/', import.meta.url).pathname; fs.mkdirSync(OUT, { recursive: true });
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const ctx = await browser.newContext(phone ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, userAgent: UA } : { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
await serve(ctx);
const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
await page.addInitScript(({ gate }) => {
  window.__lt = []; new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push([e.startTime, e.duration]); }).observe({ type: 'longtask', buffered: true });
  window.__gateLog = [];
  if (gate) window.tfGate = { set(n, p) { window.__gateLog.push([+performance.now().toFixed(0), n, p]); }, get() { return 0; } };
  window.__vis = 0;   // time the scene became visible (canvas opacity 1)
  const poll = setInterval(() => { const c = window.TFSolutions && window.TFSolutions.sol && window.TFSolutions.sol.canvas; if (c && c.style.opacity === '1') { window.__vis = performance.now(); window.__progAtVis = window.TFSolutions.sol.qa.renderer.info.programs.length; window.__progNamesVis = window.TFSolutions.sol.qa.renderer.info.programs.map(p => p.id + ':' + String(p.cacheKey).slice(0, 160)); clearInterval(poll); } }, 20);
}, { gate });
const cdp = await ctx.newCDPSession(page);
await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval: 1000 });
if (thr > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: thr });
await cdp.send('Profiler.start');
const nowAtStart = await page.evaluate(() => performance.now());
await page.goto(`${ORIGIN}/test/home.html?qa&demo=0${phone ? '&layout=phone' : ''}${extra}`, { waitUntil: 'load' });
const loadedAt = await page.evaluate(() => performance.now());
if (scenario === 'wait') await page.waitForTimeout(5000 * Math.max(1, thr / 2));
let scroll = null;
if (scenario !== 'none') scroll = await page.evaluate(async ({ speed }) => {
  const el = document.getElementById('solutions'); const target = el.getBoundingClientRect().top + scrollY - 0.1 * innerHeight, t0 = performance.now(), from = scrollY;
  await new Promise(res => { const f = () => { const d = (performance.now() - t0) / 1000 * speed; scrollTo(0, Math.min(target, from + d)); if (from + d >= target) res(); else requestAnimationFrame(f); }; requestAnimationFrame(f); });
  return [t0, performance.now()];
}, { speed });
// wait for the scene: visible, then the warm-up finished (stub or a quiet 3 s)
await page.waitForFunction(() => window.__vis > 0, null, { timeout: 240000, polling: 100 }).catch(() => {});
await page.waitForTimeout(3000 * Math.max(1, thr / 2));
const info = await page.evaluate(async () => {
  const s = window.TFSolutions && window.TFSolutions.sol; if (!s) return { built: false, vis: window.__vis, gateLog: window.__gateLog, lt: window.__lt };
  const q = s.qa, prog = () => q.renderer.info.programs.length, p0 = prog(), out = {};
  s.stop(); const per = {};
  for (const tab of ['orchestration', 'planning', 'execution', 'orchestration']) { document.querySelector(`button[data-tab="${tab}"]`).click(); s.renderNow(1 / 60, 20); await new Promise(r => setTimeout(r, 50)); per[tab] = prog(); }
  return { built: true, progAtVis: window.__progAtVis, namesVis: window.__progNamesVis, namesEnd: q.renderer.info.programs.map(p => p.id + ':' + String(p.cacheKey).slice(0, 160)), vis: window.__vis, gateLog: window.__gateLog, lt: window.__lt, programsBefore: p0, programsAfterTabs: per };
});
const prof = (await cdp.send('Profiler.stop')).profile;
// profile clock -> performance.now(): the profile starts at nowAtStart (+- a few ms)
const t0p = prof.startTime / 1000, off = nowAtStart - t0p;
const byId = new Map(prof.nodes.map(n => [n.id, n])), parent = new Map(); for (const n of prof.nodes) for (const c of n.children || []) parent.set(c, n.id);
const deep = has('deep'), lab = id => { if (deep) { const f = byId.get(id).callFrame; return (f.url || '').split('/').pop() + ':' + (f.functionName || '(anon)') + ':' + f.lineNumber; } for (let k = id; k != null; k = parent.get(k)) { const f = byId.get(k).callFrame, u = f.url || ''; if (u.startsWith(ORIGIN) && !/three\.module\.js|\/three\//.test(u)) return u.replace(ORIGIN + '/', '') + ':' + (f.functionName || '(anon)'); } const f = byId.get(id).callFrame; return '(' + (f.functionName || 'native') + ')'; };
let tt = prof.startTime; const samples = prof.samples.map((id, i) => { tt += prof.timeDeltas[i]; return [tt / 1000 + off, id]; });
const tasks = (info.lt || []).filter(([, d]) => d > 50).map(([s, d]) => {
  const h = {}; let prev = null; for (const [t, id] of samples) { if (t < s || t > s + d) continue; const L = lab(id); h[L] = (h[L] || 0) + 1; }
  const top = Object.entries(h).sort((a, b) => b[1] - a[1]).slice(0, deep ? 12 : 3).map(([k, v]) => `${k} ${v} ms`);
  return { start: Math.round(s), dur: Math.round(d), cause: top };
});
const res = { label, phone, gate, scenario, throttle: thr, errs, loadMs: Math.round(loadedAt), scrollWindow: scroll && scroll.map(Math.round), sceneVisibleMs: info.vis ? Math.round(info.vis) : null, built: info.built,
  longTasksOver50: tasks, nLong: tasks.length, maxTask: tasks.reduce((m, t) => Math.max(m, t.dur), 0), gateLog: info.gateLog, programsAtReveal: info.progAtVis, namesVis: info.namesVis, namesEnd: info.namesEnd, programsBefore: info.programsBefore, programsAfterTabs: info.programsAfterTabs };
fs.writeFileSync(`${OUT}boot-${label}.json`, JSON.stringify(res, null, 1)); console.log(JSON.stringify(res, null, 1));
await browser.close();
