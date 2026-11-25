// check-gov.mjs: the film governor against synthetic frame timestamps quantised like Firefox's performance.now()
// (1 ms default, 16.67 ms and 100 ms with privacy.resistFingerprinting), at 60 / 120 / 30 Hz with a few dropped frames.
// Usage: node test/check-gov.mjs [path to an older perf.js to compare, default the shipped one only]
import { createGovernor } from '../film/perf.js';
const oldPath = process.argv[2];
const OLD = oldPath ? (await import(new URL(oldPath, 'file://' + process.cwd() + '/')).catch(() => import(oldPath))).createGovernor : null;
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
// frames at period T (ms) with +-jitter, `drops` random frames take two periods; stamps floored to q (q = 0: exact)
function stamps(T, q, secs, drops, jit = +(process.env.JIT || 0.4)) {
  const out = []; let t = 1000 + rnd() * 17, n = Math.round(secs * 1000 / T); const drop = new Set(); for (let i = 0; i < drops; i++) drop.add(60 + Math.floor(rnd() * (n - 80)));
  for (let i = 0; i < n; i++) { t += T * (drop.has(i) ? 2 : 1); const s = t + (rnd() - 0.5) * 2 * jit; out.push(q ? Math.floor(s / q) * q : s); }
  return out;
}
function run(make, T, q, drops, opts = {}) {
  const levels = []; const g = make({ high: true, apply: (_, lv) => levels.push(lv), ...opts });
  const ts = stamps(T, q, 40, drops); let prev = ts[0];
  for (let i = 1; i < ts.length; i++) { g.frame(ts[i] - prev); prev = ts[i]; }
  return { final: g.level, steps: levels.length - 1, min: Math.min(...levels) };
}
const rows = []; let bad = 0;
// healthy GPU: the governor must not step down (60 and 120 Hz; 30 Hz is a real 30 fps page, judged below)
for (const [name, T] of [['60 Hz', 1000 / 60], ['120 Hz', 1000 / 120]]) for (const q of [0, 1, 1000 / 60, 100]) {
  const drops = q === 100 ? 0 : 3, n = run(createGovernor, T, q, drops), o = OLD ? run(OLD, T, q, drops) : null;
  // expect: top level held; at q = 100 the new code holds (unjudgeable), the old one has no such rule
  const ok = n.min === 5; if (!ok) bad++;
  rows.push([name, q ? q.toFixed(2) + ' ms' : 'exact', drops + ' drops', 'new min level ' + n.min + (ok ? ' ok' : ' FAIL'), o ? 'old min level ' + o.min + (o.min === 5 ? ' ok' : ' MISJUDGED') : '']);
}
// slow GPU, no timer queries (Firefox): a vsync-locked ~30 fps page, tight cadence. The old capOK:true stops after one step; capOK:false walks down
for (const q of [0, 1]) {
  const T = 1000 / 30, n = run(createGovernor, T, q, 0, { capOK: () => false, start: null }), o = OLD ? run(OLD, T, q, 0, { capOK: () => true }) : null;
  const ok = n.min <= 1; if (!ok) bad++;
  rows.push(['30 fps GPU-bound', q ? q + ' ms' : 'exact', '0 drops', 'new (capOK off) min level ' + n.min + (ok ? ' ok' : ' FAIL'), o ? 'old (capOK on) min level ' + o.min + (o.min >= 3 ? ' STUCK' : '') : '']);
}
for (const r of rows) console.log(r.join(' | '));
console.log(bad ? 'FAIL ' + bad : 'check-gov ok');
process.exit(bad ? 1 : 0);
