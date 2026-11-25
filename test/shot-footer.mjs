// shot-footer.mjs: a repeatable footer still (scene clock fixed, progress fixed, environment baked, textures in) for before / after diffs.
// Usage: node test/shot-footer.mjs <label> [p] [t]; writes test/out/footer-<label>-p<p>.png. Compare with test/diff-png.py.
import { launch, serve, ORIGIN } from './lib-route.mjs';
import fs from 'node:fs';
const label = process.argv[2] || 'run', P = process.argv[3] || '0.7', T = process.argv[4] || '25';
const b = await launch(), ctx = await b.newContext({ viewport: { width: 960, height: 640 }, deviceScaleFactor: 1 }), page = await ctx.newPage(); await serve(page, {});
const errs = []; page.on('pageerror', e => errs.push(e.message));
await page.goto(`${ORIGIN}/test/careers.html?q=high&dpr=1`, { waitUntil: 'load' });
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForFunction(() => window.TFFooter && window.TFFooter.footer.stats().stage === 1, null, { timeout: 180000 });
// textures stream in one upload per frame: wait until the texture count has been steady for 6 s
for (let last = -1, since = Date.now(); Date.now() - since < 6000;) { await page.waitForTimeout(1000); const n = await page.evaluate(() => window.TFFooter.footer.renderer.info.memory.textures); if (n !== last) { last = n; since = Date.now(); } }
await page.waitForFunction(() => window.TFFooter.footer.renderer.info.memory.textures >= 45, null, { timeout: 120000 });   // all 8 roles (incl. the rock set) are in
await page.waitForTimeout(3000);
await page.evaluate(p => { const f = window.TFFooter.footer; f.stop(); f.setProgress(+p); f.setProgress = () => {}; }, P);   // the page's own tick would keep easing progress toward its scroll position
await page.waitForTimeout(300);
await page.evaluate(t => window.TFFooter.footer.renderOnce(+t), T);   // bakes the environment for this progress
await page.waitForTimeout(300);
const url = await page.evaluate(t => { const f = window.TFFooter.footer; f.renderOnce(+t); return f.renderer.domElement.toDataURL('image/png'); }, T);
fs.mkdirSync(new URL('./out/', import.meta.url).pathname, { recursive: true });
fs.writeFileSync(new URL(`./out/footer-${label}-p${P}.png`, import.meta.url).pathname, Buffer.from(url.split(',')[1], 'base64'));
console.log('shot', label, 'p', P, 'errors', errs.length ? errs : 'none'); await b.close();
