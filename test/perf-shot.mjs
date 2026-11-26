// perf-shot.mjs: deterministic Solutions screenshots (seeded Math.random, fixed dt steps) for before / after pixel diffs.
//   node test/perf-shot.mjs <label> [--phone|--desktop] [--q=high|low]   -> test/out/shot-<label>/<vp>-<tab>-<n>.png ; compare with: python3 test/lib/pixdiff.py <dirA> <dirB>
import { chromium } from '/opt/npm-tools/node_modules/playwright/index.mjs';
import fs from 'node:fs';
import { serve, ORIGIN } from './lib/serve.mjs';
const A = process.argv.slice(2), label = A.find(a => !a.startsWith('--')) || 'run', has = k => A.includes('--' + k), opt = (k, d) => (A.find(a => a.startsWith('--' + k + '=')) || '').split('=')[1] ?? d;
const phone = !has('desktop'), extra = opt('q', '') ? '&q=' + opt('q') : '';
const dir = new URL(`./out/shot-${label}/`, import.meta.url).pathname; fs.mkdirSync(dir, { recursive: true });
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const ctx = await browser.newContext(phone ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, userAgent: UA } : { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
await serve(ctx, { det: true });
const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(e.message));
await page.addInitScript(() => { { const r = window.requestAnimationFrame.bind(window); window.requestAnimationFrame = f => (f.name === 'loop' ? 0 : r(f)); }   // the scene's own rAF loop never runs: the sim only advances through renderNow
  let a = 0x9e3779b9; Math.random = () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; });
await page.goto(`${ORIGIN}/test/home.html?qa&demo=0${phone ? '&layout=phone' : ''}${extra}`, { waitUntil: 'load' });
await page.waitForFunction(() => window.TFSolutions && window.TFSolutions.sol, null, { timeout: 180000 });
await page.evaluate(() => { const g = window.TFSolutions.sol.qa.gov; Object.defineProperty(g, 'real', { get: () => false, set() {} }); const s = window.TFSolutions.sol; s.stop(); return s.ready; });
await page.evaluate(async () => { await window.TFSolutions.sol.qa.loadShroud(); });   // the shroud loads on idle (high tier): load it now so snapshots are deterministic
await page.evaluate(() => document.getElementById('solutions-stage').scrollIntoView({ block: 'center' }));
const snap = () => page.evaluate(() => { const s = window.TFSolutions.sol, gl = s.canvas, hud = s.qa.hud.canvas, W = gl.width, H = gl.height, o = document.createElement('canvas'); o.width = W; o.height = H;
  const g = o.getContext('2d'); g.fillStyle = '#000'; g.fillRect(0, 0, W, H); g.drawImage(gl, 0, 0, W, H); g.drawImage(hud, 0, 0, W, H); return o.toDataURL('image/png'); });
// the draw call and the snapshot must share a task (no preserveDrawingBuffer)
const run = async (tab, n, name, pre) => { const url = await page.evaluate(({ tab, n, pre }) => { if (tab) document.querySelector(`button[data-tab="${tab}"]`).click(); const s = window.TFSolutions.sol; if (pre) eval(pre); s.renderNow(1 / 60, n);
  const gl = s.canvas, hud = s.qa.hud.canvas, W = gl.width, H = gl.height, o = document.createElement('canvas'); o.width = W; o.height = H; const g = o.getContext('2d'); g.fillStyle = '#000'; g.fillRect(0, 0, W, H); g.drawImage(gl, 0, 0, W, H); g.drawImage(hud, 0, 0, W, H); return o.toDataURL('image/png'); }, { tab, n, pre });
  fs.writeFileSync(`${dir}${name}.png`, Buffer.from(url.split(',')[1], 'base64')); };
const vp = phone ? 'ph' : 'dk';
for (const tab of ['orchestration', 'planning', 'execution']) { await run(tab, 300, `${vp}-${tab}-0`); await run(null, 97, `${vp}-${tab}-1`); await run(null, 211, `${vp}-${tab}-2`); }
if (!phone) { await run('orchestration', 5, `${vp}-zone-0`, "const d = s.qa.dig; for (const [x, z] of [[-7, 3], [-3, 3], [-3, 7], [-7, 7]]) d.qa.corner(x, z); d.qa.close();"); await run(null, 400, `${vp}-zone-1`); await run(null, 400, `${vp}-zone-2`); await run('planning', 300, `${vp}-zone-3`); }
await browser.close(); console.log(label, 'done', errs.length ? errs : 'no page errors');
