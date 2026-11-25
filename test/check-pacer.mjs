// check-pacer.mjs: env.js pacer(hz) on synthetic display rates with jitter: the rate it lets through and the spread of the frame intervals.
// Usage: node test/check-pacer.mjs
import { pacer } from '../env.js';
let seed = 3; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
let bad = 0;
for (const hz of [60, 30]) for (const disp of [60, 75, 90, 120, 144, 160, 240]) {
  const p = pacer(hz), T = 1000 / disp, out = []; let t = 5000;
  for (let i = 0; i < disp * 20; i++) { t = 5000 + i * T + (rnd() - 0.5) * T * 0.06; if (p(t)) out.push(t); }   // vsync grid with +-3% jitter (not a random walk)
  const iv = out.slice(1).map((v, i) => v - out[i]), rate = out.length / 20, mx = Math.max(...iv), mn = Math.min(...iv);
  // display slower than the cap: every frame passes; otherwise about hz, intervals within one display frame of the period
  const want = Math.min(hz, disp), ok = Math.abs(rate - want) <= want * 0.04 && mx <= 1000 / hz + T * 1.2 + 1;
  if (!ok) bad++;
  console.log(`cap ${hz} on ${String(disp).padStart(3)} Hz display: ${rate.toFixed(1)} fps through, intervals ${mn.toFixed(1)}..${mx.toFixed(1)} ms ${ok ? 'ok' : 'FAIL'}`);
}
console.log(bad ? 'check-pacer FAIL' : 'check-pacer ok'); process.exit(bad ? 1 : 0);
