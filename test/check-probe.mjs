// check-probe.mjs: how many WebGL2 contexts a page creates before and after its scenes boot (probes are created and lost at once).
// Usage: node test/check-probe.mjs [page, default film-foot.html?q=high] [withfoot]
import { launch, serve, ORIGIN } from './lib-route.mjs';
const url = process.argv[2] || '/test/film-foot.html?q=high';
const b = await launch(), ctx = await b.newContext({ viewport: { width: 1280, height: 800 } }), page = await ctx.newPage(); await serve(page, {});
await page.addInitScript(() => {
  window.__ctx = []; const gc = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (t, ...a) { const r = gc.call(this, t, ...a); if (/webgl/.test(t)) { const e = { t: Math.round(performance.now()), lost: false }; window.__ctx.push(e); const x = r && r.getExtension && r.getExtension('WEBGL_lose_context'); if (x) { const l = x.loseContext.bind(x); x.loseContext = () => { e.lost = true; return l(); }; } } return r; };
});
page.on('pageerror', e => console.log('PAGEERROR', e.message));
// ?withfoot: the Home page also loads careers.js for the footer, so add a footer host and that entry to a page that only has home3d.js
if (process.argv[3] === 'withfoot') await page.addInitScript(() => document.addEventListener('DOMContentLoaded', () => {
  const f = document.createElement('footer'); f.setAttribute('data-foot', ''); f.style.cssText = 'position:relative;height:400px'; f.innerHTML = '<div data-foot-canvas style="position:absolute;inset:0"></div>'; document.body.appendChild(f);
  const s = document.createElement('script'); s.type = 'module'; s.src = '/careers.js'; document.body.appendChild(s);
}));
await page.goto(ORIGIN + url, { waitUntil: 'load' });
await page.waitForTimeout(6000);
console.log(JSON.stringify(await page.evaluate(() => ({ contexts: window.__ctx.length, probes: window.__ctx.filter(c => c.lost).length, live: window.__ctx.filter(c => !c.lost).length, gl2: window.__tfGL2 }))));
await b.close();
