// perf-build.mjs: how long buildFooterScene (the footer's boot long task) takes in headless Chrome. CPU only. node test/perf-build.mjs [runs]
import { launch, serve, ORIGIN } from './lib-route.mjs';
const runs = +(process.argv[2] || 6);
const b = await launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const page = await ctx.newPage(); await serve(page, {});
await page.goto(ORIGIN + '/test/careers.html?foot=0', { waitUntil: 'load' });
const r = await page.evaluate(async runs => {
  const THREE = await import('three'), m = await import('/footer/foot-model.js'), out = { high: [], low: [] };
  for (let i = 0; i < runs; i++) for (const q of ['high', 'low']) { const t0 = performance.now(); const s = m.buildFooterScene({ THREE, quality: q }); out[q].push(performance.now() - t0); s.dispose(); }
  return out;
}, runs);
const med = a => a.slice(1).sort((p, q) => p - q)[(a.length - 1) >> 1];   // first run is the cold one
console.log('buildFooterScene ms: high median', med(r.high).toFixed(0), 'runs', r.high.map(v => v.toFixed(0)).join(' '), '| low median', med(r.low).toFixed(0), 'runs', r.low.map(v => v.toFixed(0)).join(' '));
await b.close();
