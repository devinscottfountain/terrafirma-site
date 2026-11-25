// check-crew.mjs: crew vs machine keep-out zones over the whole Austin range, plain node (no WebGL, no DOM): node test/check-crew.mjs
// Steps film/yard.js (the pure crew + machine + keep-out math site.js runs) and, for the before number, the ORIGINAL inline crew code
// read from git (ORIG_REF, default the commit before the fix), both against the same zones (the machine paths are the same code; the
// check proves it by running the original machine block too). Exits non-zero on any failure of the new code.
//   1. overlap: min signed distance crew <-> every keep-out zone > 0 in every sampled frame (visible crew; hidden = scale ~0 at a gate)
//      over a (t, g) grid, forward + backward plays at several scroll rates, and random jumps
//   2. no NaN
//   3. speed: at fixed g (film clock only) and during plays, no crew faster than the run cap
//   4. determinism: the same (t, g) gives bit-identical crew whatever was stepped before
//   5. zones: the machine block of the original code gives the same machine poses as yard.js
import * as THREE from 'three';
import { execSync } from 'node:child_process';
import { createYard, NW } from '../film/yard.js';
import { makeOriginal, ORIG_REF } from './crew-orig.mjs';

const NOORIG = !!process.env.NOORIG; // skip the slow original replays (the before numbers)
const WALK_CAP = 5.05, VIS = 0.02, FPS = 30, DT = 1 / FPS;
let fails = 0;
const ok = (c, msg) => { if (!c) { fails++; console.log('FAIL', msg); } };
const f = (v, d = 2) => (Number.isFinite(v) ? v.toFixed(d) : String(v));
const sstep = (x, a, b) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

// ---------------------------------------------------------------- measuring
const Y = createYard(), O = makeOriginal();
const Zr = () => Y.nZ;
// min signed distance from the visible crew in `pos` (stride, offset 0/2 = x/z) to every zone; returns { d, w, zr }
let wD = 0, wI = -1, wZ = -1;
function clearance(pos, stride, scaleAt) {
  let m = Infinity; wI = wZ = -1;
  for (let i = 0; i < NW; i++) {
    if (scaleAt && pos[i * stride + scaleAt] < VIS) continue;
    const x = pos[i * stride], z = pos[i * stride + 2];
    for (let r = 0; r < Y.nZ; r++) { const d = Y.zsd(r, x, z); if (d < m) { m = d; wI = i; wZ = r; } }
  }
  return m;
}
const nameOfZone = (() => { const M = Y.M; return r => { // names by row order of machines()
  const o = r * 10, kind = Y.Z[o], x = Y.Z[o + 1], z = Y.Z[o + 2];
  for (let i = 0; i < 2; i++) if (kind === 1 && Math.abs(x - M.ex[i].x) < 1e-9 && Math.abs(z - M.ex[i].z) < 1e-9 && M.ex[i].on && Y.Z[o + 8] > 10) return 'excavator ' + 'AB'[i];
  for (let i = 0; i < 4; i++) if (kind === 2 && Math.abs(x - M.tr[i].x) < 1e-9 && Math.abs(z - M.tr[i].z) < 1e-9) return 'truck ' + i;
  if (kind === 2 && M.dz.on && Math.abs(x - M.dz.x) < 1e-9 && Math.abs(z - M.dz.z) < 1e-9) return 'dozer';
  if (kind === 2 && M.pump.on && Math.abs(z + 29) < 1e-9) return Math.abs(x - M.pump.bx) < 1e-9 ? 'pump' : 'mixer';
  return kind === 1 ? 'light tower' : 'static box';
}; })();

class Stat {
  constructor(name) { this.name = name; this.frames = 0; this.over = 0; this.min = Infinity; this.at = null; this.nan = 0; this.maxV = 0; this.vAt = null; this.hidden = 0; this.byZone = {}; }
  add(d, t, g, i, r) {
    this.frames++; if (!(d > 0)) { this.over++; const n = nameOfZone(r); this.byZone[n] = (this.byZone[n] || 0) + 1; }
    if (d < this.min) { this.min = d; this.at = { t: +t.toFixed(3), g: +g.toFixed(4), worker: i, zone: nameOfZone(r) }; }
  }
}
const line = s => console.log(`  ${s.name.padEnd(30)} frames ${String(s.frames).padStart(8)}  overlapping ${String(s.over).padStart(7)}  min clearance ${f(s.min, 3).padStart(8)} m  at ${JSON.stringify(s.at)}${Object.keys(s.byZone).length ? '  zones ' + JSON.stringify(s.byZone) : ''}`);

// frame sources: crew positions for (t, g) from the new code / the original (stateful: replay history)
const newFrame = (t, g) => { Y.machines(t, g); Y.crewStep(t, g); return Y.crew; };
const origFrame = (t, g) => { Y.machines(t, g); O.step(t, g); return O.out; };

// ---------------------------------------------------------------- 5. machine poses: original inline block vs yard.js
{
  let worst = 0;
  for (let k = 0; k < 4000; k++) {
    const t = k * 0.37, g = (k * 0.00731) % 1; Y.machines(t, g); O.step(t, g); const M = Y.M;
    const pairs = [[O.exA.g, M.ex[0]], [O.exB.g, M.ex[1]]];
    for (const [gr, e] of pairs) { ok(gr.visible === e.on, `excavator visible at t=${t} g=${g}`); if (e.on) worst = Math.max(worst, Math.abs(gr.position.x - e.x), Math.abs(gr.position.y - e.y), Math.abs(gr.position.z - e.z)); }
    for (let i = 0; i < 4; i++) { const tr = O.trucks[i].g; ok(tr.visible === M.tr[i].on, 'truck visible'); if (tr.visible) worst = Math.max(worst, Math.abs(tr.position.x - M.tr[i].x), Math.abs(tr.position.z - M.tr[i].z), Math.abs(tr.rotation.y - M.tr[i].yaw)); }
    ok(O.dozer.visible === M.dz.on, 'dozer visible'); if (O.dozer.visible) worst = Math.max(worst, Math.abs(O.dozer.position.x - M.dz.x), Math.abs(O.dozer.position.z - M.dz.z), Math.abs(O.dozer.position.y - M.dz.y), Math.abs(O.dozer.rotation.y - M.dz.yaw));
  }
  ok(worst < 1e-9, `machine poses differ from the original block by ${worst}`);
  console.log(`machine poses (original inline block vs yard.js, 4000 frames): worst difference ${worst.toExponential(2)} m`);
}

// ---------------------------------------------------------------- plays: t and g advance together, like the film
// g(t) = g0 + rate * t for forward, mirrored for backward; `orig` replays the stateful original from a cold start
function play(frameFn, name, rate, back, orig) {
  const S = new Stat(name); let prev = null, prevPos = new Float64Array(NW * 5), pt = 0, pg = 0, hid = 0;
  const stride = orig ? 4 : 5, sc = orig ? 0 : 4, T = 1 / rate, n = Math.round(T * FPS);
  if (orig) O.reset();
  for (let k = 0; k <= n; k++) {
    const t = k * DT + 1.37, g = back ? 1 - k / n : k / n, pos = frameFn(t, g);
    let bad = false; for (let i = 0; i < NW * stride; i++) if (!Number.isFinite(pos[i])) { bad = true; break; }
    if (bad) { S.nan++; continue; }
    const d = clearance(pos, stride, sc); if (d < Infinity) S.add(d, t, g, wI, wZ);
    if (prev) for (let i = 0; i < NW; i++) {
      if (sc && (pos[i * stride + sc] < VIS || prevPos[i * stride + sc] < VIS)) { hid++; continue; }
      const sp = Math.hypot(pos[i * stride] - prevPos[i * stride], pos[i * stride + 1] - prevPos[i * stride + 1], pos[i * stride + 2] - prevPos[i * stride + 2]) / (t - pt);
      if (sp > S.maxV) { S.maxV = sp; S.vAt = { t: +t.toFixed(2), g: +g.toFixed(4), worker: i }; }
    }
    prevPos.set(pos); prev = true; pt = t; pg = g;
  }
  S.hidden = hid; return S;
}

console.log(`\nBEFORE: original crew code (${ORIG_REF}) vs keep-out zones, plays (t and g advance together, 30 fps)`);
const RATES = [0.004, 0.01, 0.03];
const beforePlays = [];
for (const r of RATES) if (!NOORIG) for (const back of [false, true]) { const s = play(origFrame, `orig g-rate ${r}/s ${back ? 'back' : 'fwd'}`, r, back, true); beforePlays.push(s); line(s); }
// settled grid: at fixed g, run 40 s of film clock (cold start at each g) and count frames
function gridOrig() {
  const S = new Stat('orig fixed-g settled'); let maxV = 0;
  for (let gi = 0; gi <= 200; gi++) { const g = gi / 200; O.reset(); for (let k = 0; k < 40 * FPS; k++) { const t = 1.37 + k * DT, pos = origFrame(t, g); if (k < 8 * FPS) continue; const d = clearance(pos, 4, 0); S.add(d, t, g, wI, wZ); } }
  return S;
}
if (!NOORIG) line(gridOrig());

console.log(`\nAFTER: yard.js crew vs the same zones`);
const afterPlays = [];
for (const r of RATES) for (const back of [false, true]) { const s = play(newFrame, `new  g-rate ${r}/s ${back ? 'back' : 'fwd'}`, r, back, false); afterPlays.push(s); line(s); }

// 1. grid: every build progress the scroll can produce (0..1 in 0.0005 steps) x film clock over 1 s steps of 1/30 s through 3 periods of
// the longest hold (12 s) plus walk, offset so every worker passes several segment starts
{
  const S = new Stat('new (t, g) grid'); let nan = 0, vis = 0, hid = 0;
  const NG = 1000, TT = 36 * FPS;
  for (let gi = 0; gi <= NG; gi++) {
    const g = gi / NG; for (let k = 0; k < TT; k += (gi % 10 === 0 ? 1 : 7)) {
      const t = 0.5 + k * DT, pos = newFrame(t, g);
      let bad = false; for (let i = 0; i < NW * 5; i++) if (!Number.isFinite(pos[i])) { bad = true; break; }
      if (bad) { nan++; continue; }
      const d = clearance(pos, 5, 4); if (d < Infinity) { vis++; S.add(d, t, g, wI, wZ); } else hid++;
    }
  }
  line(S); console.log(`  (hidden frames at gates, not counted: ${hid})`); ok(S.over === 0, 'grid: a crew worker is inside a keep-out zone'); ok(nan === 0, 'grid: NaN');
}
// random jumps: independent (t, g) pairs, history-free
{
  const S = new Stat('new random jumps'); let s = 12345; const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (let k = 0; k < 200000; k++) { const t = rnd() * 600, g = rnd(), pos = newFrame(t, g); const d = clearance(pos, 5, 4); if (d < Infinity) S.add(d, t, g, wI, wZ); }
  line(S); ok(S.over === 0, 'random jumps: a crew worker is inside a keep-out zone');
}
for (const s of afterPlays) { ok(s.over === 0, `${s.name}: overlap in ${s.over} frames`); ok(s.nan === 0, `${s.name}: NaN`); }

// 3. speed
console.log('\nSPEED (m/s, cap ' + WALK_CAP + ')');
{
  // fixed g, film clock only: this is crew walking, nothing else moves them
  let mx = 0, at = null;
  for (let gi = 0; gi <= 500; gi++) {
    const g = gi / 500; let prev = new Float64Array(NW * 5), have = false;
    for (let k = 0; k < 40 * FPS; k++) {
      const t = 0.5 + k * DT, pos = newFrame(t, g);
      if (have) for (let i = 0; i < NW; i++) { if (pos[i * 5 + 4] < VIS) continue; const sp = Math.hypot(pos[i * 5] - prev[i * 5], pos[i * 5 + 1] - prev[i * 5 + 1], pos[i * 5 + 2] - prev[i * 5 + 2]) / DT; if (sp > mx) { mx = sp; at = { t: +t.toFixed(2), g, worker: i }; } }
      prev.set(pos); have = true;
    }
  }
  console.log(`  new, fixed g, film clock only (501 g values x 40 s): max ${f(mx)} at ${JSON.stringify(at)}`); ok(mx <= WALK_CAP, `fixed-g crew speed ${mx} over the cap`);
  const mo = Math.max(0, ...beforePlays.map(s => s.maxV)); console.log(`  original, plays: max ${f(mo)}   new, plays: ${afterPlays.map(s => s.name.replace('new  g-rate ', '') + ' ' + f(s.maxV)).join(' | ')}`);
  // plays move g as well, and excavator spotters ride the dig face (scroll moves it): the cap applies at the nominal 0.004/s, beyond that the crew keeps the machine's pace
  for (const s of afterPlays.filter(s => s.name.includes('0.004'))) ok(s.maxV <= WALK_CAP, `${s.name}: speed ${s.maxV} over the cap at ${JSON.stringify(s.vAt)}`);
}

// 4. determinism: same (t, g) after any other history
{
  let s = 777; const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296), a = new Float64Array(NW * 5);
  let diff = 0;
  for (let k = 0; k < 3000; k++) { const t = rnd() * 300, g = rnd(); a.set(newFrame(t, g)); for (let j = 0; j < 7; j++) newFrame(rnd() * 300, rnd()); const b = newFrame(t, g); for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) diff++; }
  console.log(`\nDETERMINISM: 3000 (t, g) pairs re-evaluated after 7 other frames: ${diff} differing values`); ok(diff === 0, 'determinism');
}

// frame-path cost: 10,000 calls of the crew update
{
  const N = 10000; let tt = 0;
  for (let k = 0; k < 500; k++) newFrame(k * 0.033, 0.2);
  let t0 = process.hrtime.bigint(); for (let k = 0; k < N; k++) { Y.machines(k * 0.033, 0.05 + (k % 90) * 0.01); Y.crewStep(k * 0.033, 0.05 + (k % 90) * 0.01); } const dN = Number(process.hrtime.bigint() - t0) / 1e6;
  for (let k = 0; k < 500; k++) origFrame(k * 0.033, 0.2);
  t0 = process.hrtime.bigint(); for (let k = 0; k < N; k++) { const g = 0.05 + (k % 90) * 0.01; O.step(k * 0.033, g); } const dO = Number(process.hrtime.bigint() - t0) / 1e6;
  console.log(`\nCOST: ${N} frames of machines + crew: new ${f(dN, 1)} ms (${f(dN / N * 1000, 1)} us/frame, includes zones), original inline machines + crew ${f(dO, 1)} ms (${f(dO / N * 1000, 1)} us/frame; THREE objects, no zones)`);
}
console.log(fails ? `\n${fails} FAILED` : '\nall checks passed');
process.exit(fails ? 1 : 0);
