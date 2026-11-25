// check-arm.mjs: excavator arm checks, plain node (npm ci first, then: node test/check-arm.mjs). Exits non-zero on any failure.
// 1. each cylinder over its whole limit range: length inside [Lmin, Lmax], monotone, no NaN, limits really at Lmin / Lmax
// 2. the bucket 4-bar: link lengths hold (drift < 0.5 %), one branch only, joint continuous (no flip), over a coarse 3D grid too
// 3. cylinder build sizes: the rod stays inside its barrel and never leaves it over the whole stroke
// 4. the game envelope through the same solver the game runs (solveArm): how often each clamp engages, worst tip / bucket angle error
// 5. a headless excavator(): the dynamic hydraulics buffers hold no NaN at several poses
import * as THREE from 'three';
import { createMachineKit, excKinematics, excFK, EXC_LIMITS as L, EXC_PIN as P, EXC_HYD as H } from '../solutions/sol-machines.js';
import { solveArm, ARMK } from '../solutions/sol-game.js';

let fails = 0;
const ok = (c, msg) => { if (!c) { fails++; console.log('FAIL', msg); } };
const lin = (a, b, n) => Array.from({ length: n + 1 }, (_, i) => a + (b - a) * i / n);
const f = (v, d = 3) => (Number.isFinite(v) ? v.toFixed(d) : String(v));
const TOL = 1e-6;
console.log('EXC_LIMITS (rad): a1 [' + L.a1.map(v => f(v)) + ']  a2 [' + L.a2.map(v => f(v)) + ']  a3 [' + L.a3.map(v => f(v)) + ']');
console.log('range deg: a1 ' + f((L.a1[1] - L.a1[0]) * 180 / Math.PI, 1) + '  a2 ' + f((L.a2[1] - L.a2[0]) * 180 / Math.PI, 1) + '  a3 ' + f((L.a3[1] - L.a3[0]) * 180 / Math.PI, 1));
console.log('cylinder   stroke   Lmin   Lmax');
for (const k of ['boom', 'stick', 'bucket']) console.log(k.padEnd(9), f(L.strokes[k]).padStart(8), f(L.lmin[k]).padStart(6), f(L.lmax[k]).padStart(6));

// 1. per cylinder sweeps (60+ steps) over each axis, the other two at 3 settings
const N = 120, ax = [['boom', 'a1', 'boomCyl', 1], ['stick', 'a2', 'stickCyl', -1], ['bucket', 'a3', 'bucketCyl', -1]];
for (const [k, an, ck, dir] of ax) {
  const at = a => excKinematics(an === 'a1' ? a : 0.2, an === 'a2' ? a : -1.5, an === 'a3' ? a : -0.3);
  let mn = 1e9, mx = -1e9, prev = null, mono = true;
  for (const a of lin(L[an][0], L[an][1], N)) {
    const r = at(a), v = r[ck];
    ok(Number.isFinite(v), k + ' NaN at ' + a); mn = Math.min(mn, v); mx = Math.max(mx, v);
    ok(v >= L.lmin[k] - TOL && v <= L.lmax[k] + TOL, k + ' length ' + v + ' outside [Lmin, Lmax] at ' + an + '=' + a);
    ok(r.ok, k + ' kinematics not ok at ' + an + '=' + a);
    if (prev !== null && (v - prev) * dir < -1e-12) mono = false; prev = v;
  }
  ok(mono, k + ' length not monotone over its limit range');
  ok(Math.abs(mn - L.lmin[k]) < TOL && Math.abs(mx - L.lmax[k]) < TOL, k + ' limits are not exactly at Lmin / Lmax: ' + mn + ' ' + mx);
  console.log(k.padEnd(7), 'sweep over ' + an + ': min ' + f(mn, 6) + ' max ' + f(mx, 6) + ' (' + N + ' steps, monotone ' + mono + ')');
}
// a3 limits depend on the linkage only: the bucket cylinder (on the stick) must not change with a1, a2
{ let d = 0; for (const a1 of lin(L.a1[0], L.a1[1], 6)) for (const a2 of lin(L.a2[0], L.a2[1], 6)) for (const a3 of lin(L.a3[0], L.a3[1], 6)) d = Math.max(d, Math.abs(excKinematics(a1, a2, a3).bucketCyl - excKinematics(0, 0, a3).bucketCyl)); ok(d < 1e-9, 'bucket cylinder depends on a1 / a2: ' + d); console.log('bucket cylinder independent of a1, a2: max diff ' + d.toExponential(1)); }

// 2. 4-bar: closure, branch, continuity (fine a3 sweep for a coarse a1 x a2 grid) and a coarse full 3D grid
{
  let drift = 0, jump = 0, n = 0, side = 0, bad = 0;
  for (const a1 of lin(L.a1[0], L.a1[1], 8)) for (const a2 of lin(L.a2[0], L.a2[1], 8)) {
    let pj = null;
    for (const a3 of lin(L.a3[0], L.a3[1], 400)) {
      const r = excKinematics(a1, a2, a3), o = excFK(a1, a2, a3, {});
      drift = Math.max(drift, Math.abs(r.links.idler - P.LI) / P.LI, Math.abs(r.links.power - P.LP) / P.LP);
      const j = r.links.joint; if (pj) jump = Math.max(jump, Math.hypot(j[0] - pj[0], j[1] - pj[1])); pj = j;
      const cr = (o.fx - o.gx) * (o.jy - o.gy) - (o.fy - o.gy) * (o.jx - o.gx);   // which side of G->F the joint is on
      if (side === 0) side = Math.sign(cr); if (Math.sign(cr) !== side) bad++;
      if (!r.ok) bad++; n++;
    }
  }
  const stepA3 = (L.a3[1] - L.a3[0]) / 400;
  ok(drift < 0.005, '4-bar link drift ' + drift); ok(bad === 0, 'branch flips / not ok: ' + bad); ok(jump < 0.55 * 2.5 * stepA3, 'joint jump ' + jump);
  console.log('4-bar: ' + n + ' poses, link length drift ' + drift.toExponential(1) + ' (limit 5e-3), branch flips ' + bad + ', largest joint step ' + f(jump, 4) + ' m per ' + f(stepA3, 4) + ' rad');
  let g = 0, gb = 0;
  for (const a1 of lin(L.a1[0], L.a1[1], 12)) for (const a2 of lin(L.a2[0], L.a2[1], 12)) for (const a3 of lin(L.a3[0], L.a3[1], 12)) { g++; if (!excKinematics(a1, a2, a3).ok) gb++; }
  ok(gb === 0, '3D grid poses not ok: ' + gb); console.log('3D grid ' + g + ' poses over the limit box: not ok ' + gb);
}
// the joint must also stay put when asked a3 slightly outside: it must never NaN (setArm can be handed anything)
{ let nan = 0; for (const a of lin(-4, 4, 200)) { const r = excKinematics(0.3, -1.4, a); if (![r.boomCyl, r.stickCyl, r.bucketCyl, r.links.joint[0], r.links.joint[1]].every(Number.isFinite)) nan++; } ok(nan === 0, 'NaN outside the limits'); console.log('a3 swept -4..4 (outside the limits too): NaN ' + nan); }

// 3. cylinder build: barrel lb = Lmin - lip, rod lr = Lmin - dead. The rod end (piston) sits at L - lr from the base.
for (const k of ['boom', 'stick', 'bucket']) {
  const lb = L.lmin[k] - H.lip, lr = L.lmin[k] - H.dead, pMin = L.lmin[k] - lr, pMax = L.lmax[k] - lr;
  ok(L.lmin[k] > L.strokes[k] + H.dead + H.lip + H.guide, k + ' Lmin too short for stroke + dead length');
  ok(pMin >= H.dead - TOL, k + ' rod pokes out the back of the barrel'); ok(pMax <= lb - H.guide + TOL, k + ' rod leaves the barrel at full stroke');
  ok(lb >= L.lmin[k] - H.lip - TOL && lb < L.lmin[k], k + ' barrel must end short of the rod pin');
  console.log(k.padEnd(7), 'barrel ' + f(lb, 2) + ' rod ' + f(lr, 2) + ' piston travels ' + f(pMin, 2) + ' -> ' + f(pMax, 2) + ' inside barrel ' + f(lb, 2) + ' (guide ' + H.guide + '), Lmin - stroke - dead = ' + f(L.lmin[k] - L.strokes[k] - H.dead, 2));
}

// 4. game envelope. MSCALE is 1.4 in solutions.js. Heights are relative to the root (rootY = ground - 0.1); the pit floor is 2.3 m under grade,
// a dig may go 0.45 under that; carry / dump at ground + 2.6 .. 2.9. The "ideal" arm has only the geometric reach limit (|a2| in [0, pi]).
const MS = 1.4, { PH, RMIN, RMAX, ZFAR, PIN_X, PIN_Y, BL, SL, TX, TY } = ARMK;
const IDEAL = { a1: [-9, 9], a2: [-Math.PI, 0], a3: [-9, 9] };
const o1 = {}, o2 = {}, at = (v, lim) => Math.abs(v - lim[0]) < 1e-9 || Math.abs(v - lim[1]) < 1e-9;
// where the teeth really are for solved angles (root frame, model m)
const tipOf = o => { const q = excFK(o.a1, o.a2, o.a3, {}), t = o.a1 + o.a2 + o.a3, c = Math.cos(t), s = Math.sin(t); return [q.hx + TX * c - TY * s, q.hy + (PIN_Y - P.P0[1]) + TX * s + TY * c]; };
const sets = [   // what the step machine asks: reach (open, hovering), dig + drag (dig..full, near the pit floor), curl / swing carry, dump
  ['reach open', lin(RMIN, ZFAR + 1.3, 20), lin(-2.0, 1.6, 18), [PH.open]],
  ['dig..full', lin(RMIN, ZFAR, 17), lin(-2.8, 0.4, 16), [PH.dig, ...[0.25, 0.5, 0.75].map(k => PH.dig + (PH.full - PH.dig) * k), PH.full]],
  ['carry', lin(RMIN, RMAX, 31), lin(2.0, 3.1, 6), [PH.carry]],
  ['dump', lin(RMIN, RMAX, 31), lin(2.0, 3.1, 6), [PH.dump]],
];
const LEGACY = { a1: [-0.95, 1.25], a2: [-2.8, -0.3], a3: [-2.7, 1.3] };   // the old magic numbers, for comparison only
console.log('\ngame envelope: r world ' + RMIN + '..' + RMAX + ' m, tip heights m world rel root, MSCALE ' + MS + ', PH ' + JSON.stringify(PH));
console.log('a1 / a2 / a3: % of cells with that joint on a hydraulic limit. tip err: extra miss of the teeth caused by the limits (vs. plain reach). pe: bucket angle really reached');
console.log('set          cells    a1     a2     a3   worst tip err m model (world)   pe range (asked)   [same, old magic limits: tip err]');
const pe = {};
for (const [name, rs, ys, phs] of sets) {
  let n = 0, c1 = 0, c2 = 0, c3 = 0, wt = 0, wl = 0, pmin = 9, pmax = -9;
  for (const r of rs) for (const y of ys) for (const ph of phs) {
    const xr = r / MS, yr = y / MS; solveArm(xr, yr, ph, o1); solveArm(xr, yr, ph, o2, IDEAL); n++;
    const o3 = solveArm(xr, yr, ph, {}, LEGACY), t3 = tipOf(o3);
    if (at(o1.a1, L.a1)) c1++; if (at(o1.a2, L.a2)) c2++; if (Math.abs(o1.pe - ph) > 1e-9) c3++;
    const t1 = tipOf(o1), t2 = tipOf(o2), e1 = Math.hypot(t1[0] - xr, t1[1] - yr), e2 = Math.hypot(t2[0] - xr, t2[1] - yr);
    wt = Math.max(wt, Math.max(0, e1 - e2)); wl = Math.max(wl, Math.max(0, Math.hypot(t3[0] - xr, t3[1] - yr) - e2));
    pmin = Math.min(pmin, o1.pe); pmax = Math.max(pmax, o1.pe);
    ok(Number.isFinite(o1.a1 + o1.a2 + o1.a3), 'solveArm NaN');
    ok(!(o1.a1 < L.a1[0] - 1e-9 || o1.a1 > L.a1[1] + 1e-9 || o1.a2 < L.a2[0] - 1e-9 || o1.a2 > L.a2[1] + 1e-9 || o1.a3 < L.a3[0] - 1e-9 || o1.a3 > L.a3[1] + 1e-9), 'solveArm outside the limits');
    ok(excKinematics(o1.a1, o1.a2, o1.a3).ok, 'solveArm pose not ok in the cylinder model');
  }
  pe[name] = [pmin, pmax];
  const pc = v => (v / n * 100).toFixed(1).padStart(5) + '%';
  console.log(name.padEnd(12), String(n).padStart(5), pc(c1), pc(c2), pc(c3), '   ' + f(wt, 3) + ' (' + f(wt * MS, 3) + ')'.padEnd(8), '  ' + f(pmin, 2) + '..' + f(pmax, 2) + ' (' + f(phs[0], 2) + ')'.padEnd(8), '  [' + f(wl, 3) + ']');
}
// the game logic keys on the commanded angle (dig fills while ph < -0.6, the load pours while ph > -0.75): the drawn bucket must agree
ok(pe['dig..full'][1] < -0.6, 'dig / drag bucket opens past the fill threshold: ' + pe['dig..full'][1]);
ok(pe.carry[1] < -0.75, 'carried bucket would pour: ' + pe.carry[1]);
ok(pe.dump[0] > -0.75, 'dumping bucket not open enough to pour: ' + pe.dump[0]);

// 5. headless excavator: the hydraulics buffers
{
  const e = createMachineKit(THREE).excavator();
  let hyd = null; e.turret.traverse(o => { if (o.isMesh && o.parent === e.turret && o.geometry.attributes.position.usage === THREE.DynamicDrawUsage) hyd = o; });
  ok(!!hyd, 'no dynamic hydraulics mesh on the turret');
  const poses = [[0.2, -1.5, -0.3], [L.a1[0], L.a2[0], L.a3[0]], [L.a1[1], L.a2[1], L.a3[1]], [L.a1[0], L.a2[1], L.a3[1]], [0.4, -1.2, 0.5], [0.4, -1.2, 0.5], [-0.3, -2.2, -1.0]];
  let bad = 0; const sp = hyd.geometry.boundingSphere;
  for (const [a1, a2, a3] of poses) {
    e.setArm(a1, a2, a3, 0.3);
    for (const g of [hyd.geometry, hyd.parent.children.find(o => o.isLineSegments && o.geometry.attributes.position.usage === THREE.DynamicDrawUsage).geometry]) {
      const a = g.attributes.position.array; for (let i = 0; i < a.length; i++) if (!Number.isFinite(a[i])) bad++;
      for (let i = 0; i < a.length; i += 3) if (Math.hypot(a[i] - sp.center.x, a[i + 1] - sp.center.y, a[i + 2] - sp.center.z) > sp.radius) { bad++; break; }
    }
  }
  ok(bad === 0, 'bad values in the hydraulics buffers: ' + bad);
  let tris = 0, calls = 0; e.root.traverse(o => { if (o.isMesh) { tris += o.geometry.attributes.position.count / 3; calls++; } if (o.isLineSegments) calls++; });
  console.log('\nheadless excavator(): ' + poses.length + ' poses, NaN / out-of-sphere values ' + bad + ', solid tris ' + tris + ', draw calls ' + calls);
  e.dispose();
}
console.log(fails ? '\nFAILED (' + fails + ')' : '\nALL OK');
process.exit(fails ? 1 : 0);
