// check-mission.mjs: Mission scene stills and resize behaviour in headless Chrome (software GL). Usage: node test/check-mission.mjs <label> [desktop|phone]
// Writes test/out/mission-<dev>-<label>.png (a repeatable still: renderAt(12.5), the rocket snapped to the scroll) and prints how many
// canvas resizes (renderer.setSize) and path samplings (getPointAtLength) a body-only resize costs. Compare PNGs with test/diff-png.py.
import { launch, serve, ORIGIN } from './lib-route.mjs';
import fs from 'node:fs';

const label = process.argv[2] || 'run', dev = process.argv[3] || 'desktop';
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const cfg = dev === 'phone' ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, userAgent: UA } : { viewport: { width: 1440, height: 960 }, deviceScaleFactor: 2 };
const browser = await launch(), ctx = await browser.newContext(cfg), page = await ctx.newPage(); await serve(page, {});
const errs = []; page.on('pageerror', e => errs.push(e.message));
await page.addInitScript(() => {
  window.__n = { setSize: 0, sample: 0, widthSet: 0 };
  const g = SVGPathElement.prototype.getPointAtLength; SVGPathElement.prototype.getPointAtLength = function (l) { window.__n.sample++; return g.call(this, l); };
  const d = Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype, 'width'); Object.defineProperty(HTMLCanvasElement.prototype, 'width', { get() { return d.get.call(this); }, set(v) { window.__n.widthSet++; d.set.call(this, v); } });
});
await page.goto(`${ORIGIN}/test/mission.html?q=${dev === 'phone' ? 'low' : 'high'}`, { waitUntil: 'load' });
await page.evaluate(() => document.querySelector('[data-mission]').scrollIntoView({ block: 'center' }));
await page.waitForFunction(() => window.TFMission && window.TFMission.mission.stats.frames > 2 && window.TFMission.mission.stats.running, null, { timeout: 180000 });
await page.waitForTimeout(1500);
await page.evaluate(() => window.TFMission.mission.stop());
// a body-only resize: the spacer below the section grows, the section and the canvas keep their size
const before = await page.evaluate(() => ({ ...window.__n }));
await page.evaluate(() => { const s = document.querySelector('.spacer2'); s.style.height = (s.offsetHeight + 40) + 'px'; });
await page.waitForTimeout(600);
const after1 = await page.evaluate(() => ({ ...window.__n }));
await page.evaluate(() => { const s = document.querySelector('.spacer2'); s.style.height = (s.offsetHeight + 40) + 'px'; });
await page.waitForTimeout(600);
const after2 = await page.evaluate(() => ({ ...window.__n }));
// repeatable still
const png = await page.evaluate(() => {
  const m = window.TFMission.mission; m.renderAt(12.5);
  const r = m.capture({}); if (!r) return null;
  const c = document.createElement('canvas'); c.width = r.w; c.height = r.h; const x = c.getContext('2d'), im = x.createImageData(r.w, r.h);
  for (let y = 0; y < r.h; y++) im.data.set(r.data.subarray((r.h - 1 - y) * r.w * 4, (r.h - y) * r.w * 4), y * r.w * 4);   // un-flip
  x.putImageData(im, 0, 0); return { url: c.toDataURL('image/png'), w: r.w, h: r.h, stats: JSON.parse(JSON.stringify(m.stats)) };
});
fs.mkdirSync(new URL('./out/', import.meta.url).pathname, { recursive: true });
if (png) fs.writeFileSync(new URL(`./out/mission-${dev}-${label}.png`, import.meta.url).pathname, Buffer.from(png.url.split(',')[1], 'base64'));
console.log(JSON.stringify({ label, dev, errs, png: png && { w: png.w, h: png.h, rocket: png.stats.rocket }, firstSizing: before, afterBodyResize1: after1, afterBodyResize2: after2 }));
await browser.close();
