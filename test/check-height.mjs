// check-height.mjs: the footer height field (foot-model-kit.js height()) must stay bit-identical to the version at BASE (default 0b06303),
// since the ground, the colony and the film's ground matching all sample it. Compares the terrain grid rows, random points over the whole
// scene and the window edges (+-0 counts as equal). Also times both. Usage: node test/check-height.mjs [base-rev]
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), BASE = process.argv[2] || '0b06303';
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tf-height-'));
const src = execFileSync('git', ['show', `${BASE}:footer/foot-model-kit.js`], { cwd: ROOT, encoding: 'utf8' }).replace("'../kit/hero-model-kit.js'", JSON.stringify(pathToFileURL(path.join(ROOT, 'kit/hero-model-kit.js')).href));
fs.writeFileSync(path.join(tmp, 'old-kit.mjs'), src);
const OLD = await import(pathToFileURL(path.join(tmp, 'old-kit.mjs')).href), NEW = await import(pathToFileURL(path.join(ROOT, 'footer/foot-model-kit.js')).href);

let bad = 0, n = 0; const chk = (x, z) => { n++; const a = OLD.height(x, z), b = NEW.height(x, z); if (!(a === b)) { if (bad++ < 5) console.log('MISMATCH', x, z, a, b); } };
// the ground grid as buildTerrain lays it out (high tier)
{ const NZ = 220, NX = 200, K = 5.2, D0 = -16, D1 = 3400, A = (D1 - D0) / (Math.exp(K) - 1);
  for (let j = 0; j <= NZ; j++) { const d = D0 + A * (Math.exp(K * j / NZ) - 1), W = 46 + Math.max(d, 0) * 1.12; for (let i = 0; i <= NX; i++) chk(-W + 2 * W * i / NX, -d); } }
// random points: x over +-3000, z over -4000..+50
let s = 12345; const rnd = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
for (let i = 0; i < 300000; i++) chk((rnd() * 2 - 1) * 3000, -(rnd() * 4050 - 50));
// window edges, exactly and one ulp either side
for (const d of [20, 60, 120, 170, 210, 400, 600, 1250, 2100]) for (const e of [0, 1e-9, -1e-9, 1e-6, -1e-6]) for (const x of [0, 37.5, -260, 900]) chk(x, -(d + e));

const time = (H) => { const t0 = performance.now(); let acc = 0; for (let j = 0; j <= 220; j++) { const d = -16 + 18.9 * (Math.exp(5.2 * j / 220) - 1), W = 46 + Math.max(d, 0) * 1.12; for (let i = 0; i <= 200; i++) acc += H(-W + 2 * W * i / 200, -d); } return [performance.now() - t0, acc]; };
time(OLD.height); time(NEW.height);
const to = [], tn = []; for (let k = 0; k < 7; k++) { to.push(time(OLD.height)[0]); tn.push(time(NEW.height)[0]); }
const med = a => a.sort((p, q) => p - q)[a.length >> 1];
console.log(`checked ${n} points, ${bad} mismatches; ground grid (44k samples) old ${med(to).toFixed(1)} ms, new ${med(tn).toFixed(1)} ms`);
fs.rmSync(tmp, { recursive: true, force: true });
process.exit(bad ? 1 : 0);
