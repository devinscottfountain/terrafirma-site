// check-life.mjs: footer life.update (rovers, traffic lights, walker) must write the same buffers as the version at BASE (default 0b06303)
// for any scene time, and allocate nothing per call. Compares the light point buffers and the rover / figure instance matrices byte for byte.
// Usage: node test/check-life.mjs [base-rev]
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as THREE from 'three';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), BASE = process.argv[2] || '0b06303';
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tf-life-')), U = f => JSON.stringify(pathToFileURL(path.join(ROOT, f)).href);
const old = execFileSync('git', ['show', `${BASE}:footer/foot-model-life.js`], { cwd: ROOT, encoding: 'utf8' }).replace("'./foot-model-kit.js'", U('footer/foot-model-kit.js'));
fs.writeFileSync(path.join(tmp, 'old-life.mjs'), old);
const OLD = await import(pathToFileURL(path.join(tmp, 'old-life.mjs')).href), NEW = await import(pathToFileURL(path.join(ROOT, 'footer/foot-model-life.js')).href);
const { footerPlan } = await import(pathToFileURL(path.join(ROOT, 'footer/foot-model-plan.js')).href);

let bad = 0;
for (const high of [true, false]) {
  const plan = footerPlan({ high });
  const lamps = [[10, 5, -300], [20, 6, -310]];
  const a = OLD.buildLife({ THREE, root: new THREE.Group(), plan, high, lamps }), b = NEW.buildLife({ THREE, root: new THREE.Group(), plan, high, lamps });
  const same = (x, y) => x.length === y.length && x.every((v, i) => Object.is(v, y[i]) || v === y[i]);
  for (let k = 0; k < 4000; k++) {
    const t = k < 2000 ? k * 0.37 : 1e5 * Math.sin(k) ** 2;   // dense in the first 12 min, then arbitrary long-running clocks
    a.update(t); b.update(t);
    const bufs = o => [o.objects.pts.geometry.attributes.position.array, o.objects.pts.geometry.attributes.color.array, o.objects.rovers.instanceMatrix.array, o.objects.figs.instanceMatrix.array];
    const A = bufs(a), B = bufs(b);
    for (let i = 0; i < A.length; i++) if (!same(A[i], B[i])) { if (bad++ < 3) console.log('MISMATCH tier', high ? 'high' : 'low', 't', t, 'buffer', i); }
  }
  // allocation per call: heap delta over many updates (gc exposed with --expose-gc, else skipped)
  if (global.gc) {
    const run = (o, n) => { global.gc(); const h0 = process.memoryUsage().heapUsed; for (let i = 0; i < n; i++) o.update(i * 0.016); return (process.memoryUsage().heapUsed - h0) / n; };
    run(a, 2000); run(b, 2000);
    console.log(`tier ${high ? 'high' : 'low'}: old ${run(a, 20000).toFixed(0)} B/update, new ${run(b, 20000).toFixed(0)} B/update (heapUsed delta, node)`);
  }
}
console.log(bad ? 'check-life FAIL ' + bad : 'check-life ok');
fs.rmSync(tmp, { recursive: true, force: true });
process.exit(bad ? 1 : 0);
