// check-haul.mjs: the dig excavator and its haul trucks, headless (plain node, no WebGL, no DOM): node test/check-haul.mjs [minutes]
// Runs the real sim (sol-game.js, sol-haul.js, sol-crew.js on the real height field and machine kit) at 30 Hz through:
//   auto     the autopilot alone
//   zones    a visitor drawing random zones (polygons and boxes, anywhere a click can land) every 30 to 110 s, several seeds
//   phone    the phone demo (no pointer: it draws its own zones)
//   intro    the desktop intro once, then random zones
// and measures every frame, from the models' own geometry:
//   1. clearance truck <-> excavator (tracks box, and the house at its real swing, counterweight included), truck <-> truck,
//      truck <-> dozer and roller (their footprints), truck <-> the dig zone being worked: all must stay > 0 (min reported)
//   2. the arm over a truck (3D): every sampled point of the boom, stick, links and bucket outline above a truck's footprint is above
//      its metal (rails, front wall, cab with the shroud): min clearance reported, must be > 0
//   3. no NaN anywhere (bodies, arm, trucks); the bucket linkage closes and every cylinder stroke stays in range (excKinematics)
//   4. the bucket outside a bite never goes into the ground (min clearance of its outline, reported)
//   5. motion: the tracks counter-rotate on every turn on the spot; swing speed and acceleration inside the servo limits; pass cycle
//   6. trucks: loads hauled, passes per load, longest hold-up, excavator waiting time
// Exits non-zero on any failure.
import * as THREE from 'three';
import { SITE, createField, hF } from '../solutions/sol-terrain.js';
import { createMachineKit, excKinematics, HAUL } from '../solutions/sol-machines.js';
import { createDig } from '../solutions/sol-game.js';
import { createCrew } from '../solutions/sol-crew.js';
import { createHaul, unitBoxes, polyDist, boxPts, inPoly } from '../solutions/sol-haul.js';
import { machineZones } from '../solutions/solutions.js';
import { seedRand, rand } from '../solutions/sol-rand.js';
globalThis.window = globalThis.window || { addEventListener() {}, removeEventListener() {}, scrollY: 0 };

const MIN = +(process.argv[2] || 5), DT = 1 / 30, MS = 1.4, LOG = process.env.LOG || '';
let fails = 0;
const ok = (c, msg) => { if (!c) { fails++; if (fails < 40) console.log('FAIL', msg); } };
const f2 = v => (Number.isFinite(v) ? v.toFixed(2) : String(v));

function world(seed, { interactive = true, intro = false } = {}) {
  seedRand(seed);
  const field = createField(THREE);
  const kit = createMachineKit(THREE, { line: 0xffffff });
  const mk = m => { m.root.scale.setScalar(MS); m.root.rotation.order = 'YXZ'; m.setOpacity(1); return m; };
  const exc = mk(kit.excavator()), dozer = mk(kit.dozer()), roller = mk(kit.compactor()), trucks = [mk(kit.hauler()), mk(kit.hauler())];
  const parts = { emit() {}, flush() {} };
  const crew = createCrew({ field, slot: { haul: dozer, grade: roller }, parts, MSCALE: MS });
  const Z = machineZones(crew);
  const haul = createHaul({ trucks, field, parts, MSCALE: MS, statics: [Z[1], Z[2]], THREE });
  let clockT = 0; const clock = () => clockT;
  const canvas = { style: {}, getBoundingClientRect: () => ({ left: 0, top: 0, width: 1440, height: 900 }), addEventListener() {}, removeEventListener() {} };
  const camera = new THREE.PerspectiveCamera(40, 1.6, 0.5, 4000); camera.position.set(30, 30, -20); camera.lookAt(0, 0, 6); camera.updateMatrixWorld();
  const dig = createDig({ THREE, exc, field, camera, canvas, interactive, MSCALE: MS, parts, clock, haul, intro: intro ? { on: true, done() {} } : null });
  dig.setArmed(true, true);
  return { field, exc, dozer, roller, trucks, crew, haul, dig, step(dt) { clockT += dt; dig.update(dt, clockT); crew.update(dt, clockT); haul.update(dt, clockT); }, get t() { return clockT; } };
}

// ------------------------------------------------------------------ geometry of the excavator, from the model
// house footprint (model, turret frame): deck, counterweight outline, tool box; the hull of it, scaled and posed each frame
const HOUSE = (() => {
  const P = [[-2.55, -1.45], [1.45, -1.45], [1.45, 1.45], [-2.55, 1.45], [-1.9, -1.42], [-1.9, 1.42], [-2.35, 1.35], [-2.7, 1.0], [-2.85, 0.5], [-2.9, 0], [-2.85, -0.5], [-2.7, -1.0], [-2.35, -1.35]];
  P.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), lo = [], up = [];
  for (const p of P) { while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
  for (let i = P.length - 1; i >= 0; i--) { const p = P[i]; while (up.length > 1 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
  return lo.slice(0, -1).concat(up.slice(0, -1));
})();
const TRK = { hx: (1.85 + 0.62) * MS, hz: (1.28 + 0.36) * MS };   // tracks: idler + shoe, gauge + half shoe
const housePoly = new Float64Array(HOUSE.length * 2), trkPoly = new Float64Array(8);
function excPolys(W) {
  const B = W.dig.body, yaw = B.yaw + W.dig.qa.cur.sw, c = Math.cos(yaw), s = Math.sin(yaw);
  HOUSE.forEach(([x, z], i) => { const X = x * MS, Zz = z * MS; housePoly[i * 2] = B.x + X * c + Zz * s; housePoly[i * 2 + 1] = B.z - X * s + Zz * c; });
  boxPts(B.x, B.z, B.yaw, -TRK.hx, TRK.hx, TRK.hz, trkPoly);
}
// the dozer's and roller's footprints (SITE.FOOT, as the plan view draws them)
const footPoly = (x, z, yaw, F, out) => { const c = Math.cos(yaw), s = Math.sin(yaw), ox = x + c * (F.off || 0), oz = z - s * (F.off || 0); return boxPts(ox, oz, yaw, -F.hx, F.hx, F.hz, out); };
const dzPoly = new Float64Array(8), rlPoly = new Float64Array(8), tb = new Float64Array(16), tb2 = new Float64Array(16);
// arm sample points (world): boom, stick, bucket outline (its corners at both sides), the hydraulics' pins
const V = new THREE.Vector3(), BKO = [[0, 0], [0.45, 0.22], [0.95, 0], [1.25, -0.45], [1.35, -1.05], [1.38, -1.25], [1.0, -1.0], [0.55, -0.68]];
function armPts(W, out) {
  const e = W.exc; let n = 0;
  e.root.updateMatrixWorld(true);
  const push = (o, x, y, z) => { V.set(x, y, z); o.localToWorld(V); out[n * 3] = V.x; out[n * 3 + 1] = V.y; out[n * 3 + 2] = V.z; n++; };
  for (let k = 0; k <= 6; k++) for (const z of [-0.3, 0.3]) push(e.boom, -0.25 + 6.0 * k / 6, k === 3 ? 0.85 : 0.2, z);
  for (let k = 0; k <= 4; k++) for (const z of [-0.2, 0.2]) push(e.stick, -0.95 + 3.9 * k / 4, k < 2 ? 0.6 : 0.12, z);
  for (const [x, y] of BKO) for (const z of [-0.6, 0.6]) push(e.bucket, x, y, z);
  return n;
}
const AP = new Float64Array(200 * 3), IM = new THREE.Matrix4();
// a truck unit's top over its own local x (model): tractor: cab and shroud over the cab, the hood ahead; trailer: rails, front wall lip
const topOf = (unit, lx) => unit === 0 ? (lx > -1.3 && lx < 0.25 ? HAUL.top.tractor : 2.2) : (lx > HAUL.bed.x1 - 0.1 ? HAUL.top.trailer : HAUL.bed.rail + 0.1);

function measure(W, S) {
  const D = W.haul.D, T = W.haul.trucks, dig = W.dig;
  excPolys(W);
  footPoly(W.crew.L.x, W.crew.L.z, W.crew.L.yaw, SITE.FOOT.haul, dzPoly); footPoly(W.crew.R.x, W.crew.R.z, W.crew.R.yaw, SITE.FOOT.grade, rlPoly);
  const J = dig.job, zone = J.on && !J.done && J.n > 2 ? Float64Array.from({ length: J.n * 2 }, (_, i) => (i & 1 ? J.z[i >> 1] : J.x[i >> 1])) : null;
  const na = armPts(W, AP);
  for (let i = 0; i < T.length; i++) {
    const t = T[i]; unitBoxes(D, t.p, tb, 0);
    for (let u = 0; u < 2; u++) {
      const U = u ? tb.subarray(8) : tb;
      { const e = Math.min(polyDist(U, 4, trkPoly, 4), polyDist(U, 4, housePoly, HOUSE.length)); if (e < S.exc) { S.exc = e; if (e < 0.3 && process.env.EXCDBG) console.log('    EXC', e.toFixed(2), W.t.toFixed(1), W.dig.qa.stepName, 'truck', i, t.st, t.p.fx.toFixed(1), t.p.fz.toFixed(1), 'v', t.v.toFixed(2), 'body', W.dig.body.x.toFixed(1), W.dig.body.z.toFixed(1)); } }
      S.dozer = Math.min(S.dozer, polyDist(U, 4, dzPoly, 4)); S.roller = Math.min(S.roller, polyDist(U, 4, rlPoly, 4));
      if (zone) { const zd = polyDist(U, 4, zone, J.n); if (zd <= 0 && S.zone > 0 && process.env.ZDBG) console.log('    ZONEHIT', W.t.toFixed(1), 'truck', i, t.st, t.p.fx.toFixed(1), t.p.fz.toFixed(1), 'job', W.dig.job.on, W.dig.job.done, 'step', W.dig.qa.stepName, 'zone', Array.from(J.x.subarray(0, J.n)).map((x, k) => x.toFixed(1) + ',' + J.z[k].toFixed(1)).join(' ')); S.zone = Math.min(S.zone, zd); }
      for (let j = i + 1; j < T.length; j++) { unitBoxes(D, T[j].p, tb2, 0); S.truck = Math.min(S.truck, polyDist(U, 4, tb2, 4), polyDist(U, 4, tb2.subarray(8), 4)); }
    }
    // 3D: arm points over this truck's footprint (grown 0.2 m) against its top, in each unit's own frame (as it really sits: pitched, rolled)
    for (let u = 0; u < 2; u++) {
      const node = u ? t.m.trailer : t.m.tractor; node.updateMatrixWorld(true); IM.copy(node.matrixWorld).invert();
      const B = u ? HAUL.box.trailer : HAUL.box.tractor;
      for (let k = 0; k < na; k++) {
        V.set(AP[k * 3], AP[k * 3 + 1], AP[k * 3 + 2]).applyMatrix4(IM);
        if (V.x < B[0] - 0.2 || V.x > B[1] + 0.2 || Math.abs(V.z) > B[2] + 0.2) continue;
        if (u === 1 && t.bedA > 0.01) continue;   // tipping, far from the excavator
        const c = (V.y - topOf(u, V.x)) * MS;
        if (c < S.arm) { S.arm = c; S.armAt = W.dig.qa.stepName + '/' + t.st + (k >= na - BKO.length * 2 ? '/bucket' : k >= 14 ? '/stick' : '/boom'); S.armT = W.t; } S.armN++;
      }
    }
    for (const v of [t.p.fx, t.p.fz, t.p.yf, t.p.yr]) if (!Number.isFinite(v)) S.nan++;
  }
  // arm and body numbers
  const B = dig.body, cur = dig.qa.cur, A = dig.qa.ARM;
  for (const v of [B.x, B.z, B.yaw, cur.sw, cur.r, cur.y, cur.ph, A.a1, A.a2, A.a3, dig.tip.x, dig.tip.y, dig.tip.z]) if (!Number.isFinite(v)) S.nan++;
  const K = excKinematics(A.a1, A.a2, A.a3); if (!K.ok) S.link++;
  // bucket outline vs ground outside a bite (the teeth and the bucket body may be in the ground while it digs)
  // (a bite step: teeth may be in the ground. The frame a curl hands over counts too: the step ended inside that frame's update)
  const isBite = q => q === 'lower' || q === 'drag' || q === 'curl', st = dig.qa.stepName, bite = isBite(st) || isBite(S.prevSt); S.prevSt = st;
  for (let k = na - BKO.length * 2; k < na; k++) {
    const gy = W.field.ground(AP[k * 3], AP[k * 3 + 2]), c = AP[k * 3 + 1] - gy;
    if (!bite) { if (c < S.gnd) { S.gnd = c; S.gndAt = st; } }
  }
  // the hinge (stick end) never below the ground
  { const k = 0; V.set(0, 0, 0); dig.qa && W.exc.bucket.localToWorld(V); const c = V.y - W.field.ground(V.x, V.z); if (c < S.hinge) { S.hinge = c; S.hingeAt = st; } }
}

function run(name, seed, opts, script) {
  const W = world(seed, opts);
  const S = { name, armAt: '', steps: {}, exc: 1e9, truck: 1e9, dozer: 1e9, roller: 1e9, zone: 1e9, arm: 1e9, armN: 0, nan: 0, link: 0, gnd: 1e9, gndAt: '', hinge: 1e9, hingeAt: '',
    pivots: 0, pivotBad: 0, swMax: 0, swAcc: 0, dumps: [], loads: 0, passes: [], hold: 0, holdMax: 0, block: 0, zones: 0, zonesDone: 0, replans: 0, frames: 0, cpu: 0 };
  const N = Math.round(MIN * 60 / DT);
  let pdl = W.dig.body.dl, pdr = W.dig.body.dr, pyaw = W.dig.body.yaw, pvs = 0, pst = '', holdT = 0;
  const tipped = W.haul.trucks.map(() => 0);
  for (let f = 0; f < N; f++) {
    if (script) script(W, f * DT, S);
    const c0 = performance.now(); W.step(DT); S.cpu += performance.now() - c0; S.frames++;
    measure(W, S);
    const B = W.dig.body, dl = B.dl - pdl, dr = B.dr - pdr, dyaw = Math.atan2(Math.sin(B.yaw - pyaw), Math.cos(B.yaw - pyaw));
    if (Math.abs(dyaw) > 1e-4 && Math.abs(dl + dr) < 1e-4) { S.pivots++; if (!(dl * dr < 0)) S.pivotBad++; }   // turning on the spot: the tracks must run opposite ways
    pdl = B.dl; pdr = B.dr; pyaw = B.yaw;
    const vs = W.dig.qa.vel.sw; S.swMax = Math.max(S.swMax, Math.abs(vs)); if (!(vs === 0 && Math.abs(pvs) < 0.05)) S.swAcc = Math.max(S.swAcc, Math.abs(vs - pvs) / DT); pvs = vs;   // (a settle from under 0.05 rad/s to rest is one step)
    const st = W.dig.qa.stepName; S.steps[st] = (S.steps[st] || 0) + DT;
    if (st === 'dump' && pst !== 'dump') S.dumps.push(W.t);
    if (W.dig.site.bay && !W.dig.site.cast) S.bayT = (S.bayT || 0) + DT;   // time with a bay to load into (a visitor's zones may leave no room for one)
    if (st === 'cast' && pst !== 'cast') S.casts = (S.casts || 0) + 1;
    if (process.env.HDBG && st === 'hold' && holdT === 0) S.hctx = W.t.toFixed(1) + ' ' + JSON.stringify(W.haul.locks) + ' next ' + !!W.haul.next + ' | ' + W.haul.trucks.map(t => t.st + (t.full ? ' FULL' : '') + ' p' + t.passes + ' ver' + t.ver + (t.legs && t.li < t.legs.length ? ' moving' : '') + ' blk' + t.block.toFixed(1)).join(' | ');
    if (process.env.HDBG && st !== 'hold' && holdT > 4) console.log('    HOLD', holdT.toFixed(1), 's at', S.hctx, ' -> trucks now', W.haul.trucks.map(t => t.st).join(','), 'step', st);
    if ((pst === 'drive' || pst === 'home') && st !== pst) S.arrT = W.t;
    for (const t of W.haul.trucks) { if (t.full && !t.wasFull) S.fullT = W.t; t.wasFull = t.full; }
    if (st === 'hold' && holdT === 0) S.hcat = W.t - (S.arrT ?? -1e9) < 40 ? 'arrive' : W.t - (S.fullT ?? -1e9) < 40 ? 'swap' : 'other';
    if (st === 'hold') { holdT += DT; S.hold += DT; } else if (holdT) { S.holdMax = Math.max(S.holdMax, holdT); (S.holds = S.holds || []).push(holdT); (S.hc = S.hc || []).push(S.hcat); holdT = 0; }
    if (LOG && LOG === name + ':' + seed && st === 'clear' && S.waitT > 8 && Math.abs(S.waitT % 10 - 0) < DT * 0.99) console.log('    CLEARWAIT', W.t.toFixed(1), JSON.stringify(W.haul.locks), 'next', !!W.haul.next, W.haul.trucks.map(t => t.st + '@' + t.p.fx.toFixed(1) + ',' + t.p.fz.toFixed(1) + (t.corrSafe ? ' safe' : '') + (t.legs && t.li < t.legs.length ? ' moving' : '') + ' v' + t.v.toFixed(1) + ' blk' + t.block.toFixed(1)).join(' | '), 'armOver', W.dig.qa.stepName);
    if (process.env.DUMPAT && LOG === name + ':' + seed && Math.abs(W.t - +process.env.DUMPAT) < DT / 2) { const H = W.haul, q = W.dig.qa; console.log('    DUMP', W.t.toFixed(1), q.stepName, 'corridorClear', H.corridorClear(), 'sw', q.cur.sw.toFixed(2), 'tg', q.tg.sw.toFixed(2), JSON.stringify(H.locks), 'park', JSON.stringify(W.dig.site.park), H.trucks.map(t => t.st + ' ver' + t.ver + ' full' + t.full + ' retry' + t.retry.toFixed(1) + ' stuck' + (t.stuck || 0) + ' kick' + !!t.kick).join(' | ')); }
    if (process.env.TRK && LOG === name + ':' + seed) { const [a, b] = process.env.TRK.split(',').map(Number); if (W.t >= a && W.t <= b && Math.abs(W.t * 2 - Math.round(W.t * 2)) < DT) console.log('    TRK', W.t.toFixed(1), W.dig.qa.stepName, 'sw', W.dig.qa.cur.sw.toFixed(2), 'y', W.dig.qa.cur.y.toFixed(1), W.haul.trucks.map(t => t.st + '@' + t.p.fx.toFixed(1) + ',' + t.p.fz.toFixed(1) + ' v' + t.v.toFixed(1) + ' blk' + t.block.toFixed(1)).join(' | ')); }
    if (process.env.CDBG && (pst === 'clear' || pst === 'plan') && st !== pst && S.waitT > 3) console.log('    WAITED', pst, S.waitT.toFixed(1), 's until', W.t.toFixed(1), '->', st, JSON.stringify(W.haul.locks), W.haul.trucks.map(t => t.st + '@' + t.p.fx.toFixed(1) + ',' + t.p.fz.toFixed(1) + (t.legs && t.li < t.legs.length ? ' moving' : '')).join(' | '), 'body', W.dig.body.x.toFixed(1), W.dig.body.z.toFixed(1));
    if (st === 'clear' || st === 'plan') { S.waitT = (S.waitT || 0) + DT; S.waitMax = Math.max(S.waitMax || 0, S.waitT); } else S.waitT = 0;   // stuck planning or waiting for the way to clear
    if (process.env.WHYAT && LOG === name + ':' + seed && Math.abs(W.t - +process.env.WHYAT) < DT / 2) { const H = W.haul; for (const t of H.trucks) if (t.legs && t.li < t.legs.length) { const L = t.legs[t.li], P = L.pts, n = P.length / 3, k0 = Math.round(t.s / 0.25); console.log('    WHY truck', t.id, t.st, 'blk', t.block.toFixed(1), JSON.stringify(H.qa.why(t.p, [{ rev: L.rev, pts: P.slice(k0 * 3, Math.min(n, k0 + 16) * 3) }], t)), 'arm', JSON.stringify(H.qa.arm), 'dig', W.dig.qa.stepName, 'tip y', W.dig.tip.y.toFixed(2)); } }
    if (LOG && LOG === name + ':' + seed) { if (st !== pst) console.log('   ', W.t.toFixed(1), 'dig', st, JSON.stringify(W.dig.qa.bayWhy()), 'load', W.dig.qa.load.toFixed(2), 'bay', !!W.dig.site.bay, 'body', W.dig.body.x.toFixed(1), W.dig.body.z.toFixed(1)); W.haul.trucks.forEach((k, i) => { if (k.st !== (S.tst || [])[i]) console.log('   ', W.t.toFixed(1), '  truck', i, k.st, k.p.fx.toFixed(1), k.p.fz.toFixed(1)); }); S.tst = W.haul.trucks.map(k => k.st); }
    pst = st;
    W.haul.trucks.forEach((t, i) => { S.block = Math.max(S.block, t.block); if (t.st === 'tip' && tipped[i] === 0) { tipped[i] = 1; S.loads++; S.passes.push(+t.drop.toFixed(2)); } if (t.st !== 'tip') tipped[i] = 0; });
  }
  S.replans = W.haul.trucks.reduce((a, t) => a + (t.replans || 0), 0);
  const cyc = []; for (let i = 1; i < S.dumps.length; i++) cyc.push(S.dumps[i] - S.dumps[i - 1]);
  cyc.sort((a, b) => a - b);
  S.cycle = cyc.length ? [cyc[0], cyc[cyc.length >> 1], cyc[cyc.length - 1]] : [];
  console.log(`${name.padEnd(9)} seed ${String(seed).padStart(3)}: clearance (m) excavator ${f2(S.exc)}  truck-truck ${f2(S.truck)}  dozer ${f2(S.dozer)}  roller ${f2(S.roller)}  zone ${S.zone > 1e8 ? '-' : f2(S.zone)}  arm-over-truck ${S.armN ? f2(S.arm) : '-'} (${S.armN} pts, ${S.armAt}${S.arm < 0.05 ? ' at ' + (S.armT || 0).toFixed(1) + ' s' : ''})`);
  console.log(`          NaN ${S.nan}  linkage/stroke ${S.link}  bucket-ground ${f2(S.gnd)} (${S.gndAt})  hinge-ground ${f2(S.hinge)} (${S.hingeAt})  pivots ${S.pivots} (tracks not counter-rotating ${S.pivotBad})  swing max ${f2(S.swMax)} rad/s, acc ${f2(S.swAcc)}`);
  console.log(`          loads hauled ${S.loads} (passes ${S.passes.join(' ')})  pass cycle s min/median/max ${S.cycle.map(v => v.toFixed(1)).join(' / ')}  holding a full bucket ${(100 * S.hold / (S.frames * DT)).toFixed(0)}% (longest ${S.holdMax.toFixed(1)} s)  truck hold-up max ${S.block.toFixed(1)} s, plan/clear max ${(S.waitMax || 0).toFixed(1)} s, replans ${S.replans}  zones ${S.zones}/${S.zonesDone}  sim ${(S.cpu / S.frames).toFixed(2)} ms/frame`);
  if (LOG === name + ':' + seed) { console.log('    locks', JSON.stringify(W.haul.locks)); for (const t of W.haul.trucks) { const H = W.haul, sc = H.clear(t.p, t), bp = H.backIn(t.p, H.tipBay, t), ap = H.bay && H.approach(t.p, H.bay, t, false, null, 140), pu = H.bay && H.bay.pull && H.plan(t.p, H.bay.pull, t, { tail: 6, maxLen: 110 }), lv = H.plan(t.p, H.tipPull, t, { tail: 6, maxLen: 110 }), es = H.approach(t.p, H.tipBay, t, false, null, 120);
      const o = H.trucks.find(q => q !== t), sv = H.trucks.slice(); H.trucks.length = 0; H.trucks.push(t); const ap2 = H.bay && H.approach(t.p, H.bay, t, false, null, 140), es2 = H.approach(t.p, H.tipBay, t, false, null, 120); H.trucks.length = 0; H.trucks.push(...sv);
      if (t.st === 'queue' && H.bay && H.bay.toPull) { const sp = H.qa.samePose(t.p, H.tipPose), sl = !!H.qa.simLegs(t.p, H.bay.toPull, t); const sv2 = H.trucks.slice(); H.trucks.length = 0; H.trucks.push(t); const sl2 = !!H.qa.simLegs(t.p, H.bay.toPull, t); H.trucks.length = 0; H.trucks.push(...sv2); const o2 = H.trucks.find(q => q !== t); console.log('    queue: samePose', sp, 'cached toPull clears', sl, 'alone', sl2, 'other at', o2.p.fx.toFixed(2), o2.p.fz.toFixed(2), o2.p.yf.toFixed(3), o2.p.yr.toFixed(3), 'tipPull', H.tipPull.fx.toFixed(2), H.tipPull.fz.toFixed(2), H.tipPull.yf.toFixed(3), 'bay.stage', H.bay.stage); }
      if (t.block > 0) { const L = t.legs[t.li], P = L.pts, n = P.length / 3, k0 = Math.round(t.s / 0.25); const look = { ...t.p }; for (let k = k0 + 1; k <= Math.min(n - 1, k0 + 10); k++) H.qa.follow(look, P[k * 3], P[k * 3 + 1], P[k * 3 + 2], L.rev); console.log('    blocked: why', JSON.stringify(H.qa.why(t.p, [{ rev: L.rev, pts: P.slice((k0) * 3, Math.min(n, k0 + 12) * 3) }], t)), 'clear look', H.clear(look, t, false).toFixed(2), 'arm', JSON.stringify(H.qa.arm)); }
      console.log('    truck', t.id, t.st, 'ver', t.ver, 'clear', sc.toFixed(2), 'backIn tip', !!bp, 'approach bay', !!ap, '(alone', !!ap2, ') to pull', !!pu, 'leave', !!lv, 'escape', !!es, '(alone', !!es2, ')', 'bay.stage', H.bay && H.bay.stage, 'at', t.p.fx.toFixed(1), t.p.fz.toFixed(1), 'ex', W.dig.body.x.toFixed(1), W.dig.body.z.toFixed(1)); } }
  { const H = (S.holds || []).slice().sort((a, b) => a - b), q = f => H.length ? H[Math.min(H.length - 1, Math.floor(f * H.length))] : 0;
    S.holdStats = { n: H.length, med: q(0.5), p90: q(0.9), max: H.length ? H[H.length - 1] : 0, pct: 100 * S.hold / (S.frames * DT) };
    console.log(`          side-casts ${S.casts || 0}, holds ${H.length}: median ${S.holdStats.med.toFixed(1)} s, p90 ${S.holdStats.p90.toFixed(1)} s, max ${S.holdStats.max.toFixed(1)} s, ${S.holdStats.pct.toFixed(0)}% of the time`); ALLH.push([name, H, S.hold, S.frames * DT, (S.holds || []).map((h, i) => [h, S.hc[i]]), S.casts || 0, S.dumps.length, (S.steps.plan || 0) + (S.steps.clear || 0)]); if (0) ALLH.push([name, H, S.hold, S.frames * DT, (S.holds || []).map((h, i) => [h, S.hc[i]])]); }
  if (process.env.STEPS) console.log('          steps', Object.entries(S.steps).map(([k, v]) => k + ' ' + v.toFixed(0)).join(', '), ' trucks', W.haul.trucks.map(t => t.st).join(' '));
  ok(S.exc > 0, name + ': truck touches the excavator ' + S.exc); ok(S.truck > 0, name + ': trucks touch ' + S.truck); ok(S.dozer > 0, name + ': truck touches the dozer'); ok(S.roller > 0, name + ': truck touches the roller');
  ok(S.zone > 0, name + ': truck in the zone ' + S.zone); ok(S.arm > 0, name + ': arm through a truck ' + S.arm); ok(!S.nan, name + ': NaN'); ok(!S.link, name + ': linkage / stroke out of range');
  ok(S.gnd > -0.05, name + ': bucket in the ground outside a bite ' + S.gnd + ' ' + S.gndAt); ok(S.hinge > -0.05, name + ': hinge in the ground ' + S.hinge + ' ' + S.hingeAt); ok(!S.pivotBad, name + ': tracks not counter-rotating on a turn');
  ok(S.loads >= 1 || (S.bayT || 0) < 300, name + ': no truck load hauled (' + (S.bayT || 0).toFixed(0) + ' s with a bay)'); ok((S.waitMax || 0) < 60, name + ': stuck in plan / clear for ' + (S.waitMax || 0).toFixed(1) + ' s'); ok(S.swMax <= 0.851 && S.swAcc <= 0.63, name + ': swing faster than the servo limits ' + S.swMax + ' ' + S.swAcc);
  return S;
}

// a visitor's zone: a polygon (3 to 6 corners) or a box, anywhere a click could go, corners through the real click clamp
function randomZone(W, S) {
  const d = W.dig, Zr = SITE.digZone;
  const cx = Zr.x + (rand() - 0.5) * 2 * (Zr.hx + 8), cz = Zr.z + (rand() - 0.5) * 2 * (Zr.hz + 8);
  if (rand() < 0.3) { d.qa.box(cx - 2 - rand() * 3, cz - 2 - rand() * 2, cx + 2 + rand() * 3, cz + 2 + rand() * 2); }
  else {
    const n = 3 + Math.floor(rand() * 4), r = 2 + rand() * 3.5, a0 = rand() * 6.28;
    for (let i = 0; i < n; i++) { const a = a0 + i / n * 6.28 + (rand() - 0.5) * 0.4; d.qa.corner(cx + Math.cos(a) * r * (0.7 + rand() * 0.5), cz + Math.sin(a) * r * (0.7 + rand() * 0.5)); }
    d.qa.close();
  }
  S.zones++; if (d.job.on && !d.job.done) S.zonesDone++;
  if (LOG) console.log('    ZONE', W.t.toFixed(1), d.job.on && !d.job.done ? 'closed' : 'dropped', Array.from(d.job.x.subarray(0, d.job.n)).map((x, i) => x.toFixed(1) + ',' + d.job.z[i].toFixed(1)).join(' '));
}

const ALLH = [];
console.log(`check-haul: ${MIN} min of sim time per run, 30 Hz`);
run('auto', 1, {});
for (const seed of (process.env.SEEDS || '2,3,4,5,6,7').split(',').map(Number)) {   // SEEDS=10,11,12 for more
  let next = 4;
  run('zones', seed, {}, (W, t, S) => { if (t >= next) { randomZone(W, S); next = t + 30 + rand() * 80; } });
}
{ // a zone with no bay that suits it (in front, toward the bay's side), drawn with a full bucket: dug with side-casts, then random zones
  let first = true, next = 0;
  run('nobay', 2, {}, (W, t, S) => {
    if (first && t >= 10 && W.dig.qa.load > 1) { first = false; W.dig.qa.forceUser(true); for (const [x, z] of [[-3.0, 12.0], [0.7, 16.7], [0.9, 18.1], [-3.8, 13.2]]) W.dig.qa.corner(x, z); W.dig.qa.close(); S.zones++; next = t + 120; }
    else if (!first && t >= next) { randomZone(W, S); next = t + 30 + rand() * 80; }
  });
}
run('phone', 8, { interactive: false });
{ let next = 70; run('intro', 9, { intro: true }, (W, t, S) => { if (t >= next) { randomZone(W, S); next = t + 40 + rand() * 60; } }); }
{ // pooled hold stats per kind of run
  for (const kind of ['auto', 'zones', 'nobay', 'phone', 'intro']) {
    const R = ALLH.filter(r => r[0] === kind); if (!R.length) continue;
    const H = R.flatMap(r => r[1]).sort((a, b) => a - b), q = f => H.length ? H[Math.min(H.length - 1, Math.floor(f * H.length))] : 0, tot = R.reduce((a, r) => a + r[2], 0), T = R.reduce((a, r) => a + r[3], 0);
    for (const c of ['arrive', 'swap', 'other']) { const X = R.flatMap(r => r[4]).filter(h => h[1] === c).map(h => h[0]).sort((a, b) => a - b); if (X.length) console.log(`       ${kind.padEnd(6)} ${c.padEnd(6)} n ${X.length}: median ${X[Math.floor(X.length / 2)].toFixed(1)} s, p90 ${X[Math.min(X.length - 1, Math.floor(0.9 * X.length))].toFixed(1)} s, max ${X[X.length - 1].toFixed(1)} s`); }
    console.log(`pooled ${kind.padEnd(6)} holds ${H.length}: median ${q(0.5).toFixed(1)} s, p90 ${q(0.9).toFixed(1)} s, max ${(H[H.length - 1] || 0).toFixed(1)} s, ${(100 * tot / T).toFixed(1)}% of the time, side-casts ${R.reduce((a, r) => a + r[5], 0)} of ${R.reduce((a, r) => a + r[6], 0)} buckets (${(R.reduce((a, r) => a + r[6], 0) / T * 60).toFixed(2)} a minute), planning or waiting for the way ${(100 * R.reduce((a, r) => a + r[7], 0) / T).toFixed(1)}% of the time`);
  }
}
console.log(fails ? `\n${fails} FAILURES` : '\nALL OK');
process.exit(fails ? 1 : 0);
