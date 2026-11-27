// check-yard.mjs: machine vs machine (and crew vs machine) clearance on the Austin yard, plain node (npm ci first, then:
// node test/check-yard.mjs). Builds the real yard models (film/machines.js, no WebGL) and poses them exactly as film/site.js does from
// film/yard.js, then over the whole Austin range (build progress g 0..1) and the film clock t, on a (t, g) grid, forward and backward
// plays at several scroll rates and random jumps, measures:
//   footprints   every machine's ground footprint from its real model extents (oriented box in its own frame; excavators: track frame
//                box + the house's tail swing disc), static furniture (trailer, toilets, dumpster, rebar, form stock, light towers)
//   work discs   each running excavator's swing reach (its arm's longest reach over the dig cycle): no other machine inside it, except
//                the truck it is loading while that truck stands in its bay
//   3D           the arm (boom, stick, bucket), the pump boom and hose and the crane's hook line as oriented boxes / segments against
//                every machine's 3D box (so the bucket over the bay truck has to clear the body)
//   crew         every visible worker (0.3 m radius) outside every footprint and work disc
// YARD=<path> checks another copy of yard.js (the before numbers: the committed one at the previous ref, see AUSTIN_REF below).
// Prints the worst pairs and frames; WORST=<file> writes the worst frames as JSON (for the still harness). Exits non-zero on overlap.
import * as THREE from 'three';
import { execSync } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createMachines } from '../film/machines.js';

const ROOT = new URL('..', import.meta.url).pathname;
// before: yard.js and site.js as committed at REF, read from git into a scratch dir
const REF = process.env.REF || '';
let yardURL = new URL('../film/yard.js', import.meta.url).href, siteSrc = null;
if (REF) {
  const dir = mkdtempSync(join(tmpdir(), 'yard-'));
  writeFileSync(join(dir, 'yard.mjs'), execSync(`git show ${REF}:film/yard.js`, { cwd: ROOT, maxBuffer: 1e8 }));
  yardURL = pathToFileURL(join(dir, 'yard.mjs')).href;
}
const YM_ = await import(yardURL), { createYard, NW } = YM_;
const QUICK = !!process.env.QUICK, CREW_R = 0.3, FPS = 30, FAR = 4; // pairs further apart than FAR m are skipped (they cannot set the minimum)
const sstep = (x, a, b) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const lerp = (a, b, k) => a + (b - a) * k;

// ---------------------------------------------------------------- the real models (no WebGL needed: geometry only)
const group = new THREE.Group();
const TW = YM_.TOWERS || [[-60, -42], [60, -42], [-60, 42], [20, 30]]; // before: the light towers where they stood
const R = createMachines({ THREE, group, D: 4, envMap: new THREE.Texture(), towers: TW });
// box of a group's own meshes (not its child groups) in that group's frame
function ownBox(g, deep = false) {
  const b = new THREE.Box3(), m = new THREE.Matrix4(), inv = new THREE.Matrix4();
  g.updateMatrixWorld(true); inv.copy(g.matrixWorld).invert();
  const visit = o => { for (const c of o.children) { if (c.isMesh) { c.geometry.computeBoundingBox(); b.union(c.geometry.boundingBox.clone().applyMatrix4(m.multiplyMatrices(inv, c.matrixWorld))); } else if (deep) visit(c); } };
  visit(g); return b;
}
// largest horizontal distance of any vertex of g's own meshes from g's y axis (the slew axis)
function ownRadius(g) {
  let r = 0; const v = new THREE.Vector3(), inv = new THREE.Matrix4(); g.updateMatrixWorld(true); inv.copy(g.matrixWorld).invert();
  for (const c of g.children) if (c.isMesh) { const p = c.geometry.attributes.position, m = new THREE.Matrix4().multiplyMatrices(inv, c.matrixWorld); for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i).applyMatrix4(m); r = Math.max(r, Math.hypot(v.x, v.z)); } }
  return r;
}
const exs = [R.exA, R.exB];
for (const e of exs) { e.g.position.set(0, 0, 0); e.g.rotation.set(0, 0, 0); }
const EXT = {
  truck: R.trucks.map(t => { t.g.position.set(0, 0, 0); t.g.rotation.set(0, 0, 0); return ownBox(t.g, true); }),
  dozer: (R.dozer.position.set(0, 0, 0), R.dozer.rotation.set(0, 0, 0), ownBox(R.dozer, true)),
  pump: (R.pump.g.position.set(0, 0, 0), ownBox(R.pump.g, true)),
  mixer: R.mixers.map(m => { m.g.position.set(0, 0, 0); return ownBox(m.g, true); }),
  exLow: ownBox(R.exA.g), exHouse: ownBox(R.exA.up), exTail: ownRadius(R.exA.up),
  boom: ownBox(R.exA.boom), stick: ownBox(R.exA.stick), bucket: ownBox(R.exA.bucket),
  seg1: ownBox({ children: [R.pump.s1], updateMatrixWorld() {}, matrixWorld: new THREE.Matrix4() }), seg2: ownBox({ children: [R.pump.s2], updateMatrixWorld() {}, matrixWorld: new THREE.Matrix4() }),
};
// the crane's footing slab (6 x 6 m) and mast (1.6 m + chords) in the crane frame
EXT.craneFoot = new THREE.Box3(new THREE.Vector3(-3, -0.4, -3), new THREE.Vector3(3, 0.2, 3));
// light towers: generator + outriggers + hitch, in the tower frame
const towerBox = (() => { const g = R.towers[0].parent; const p = g.position.clone(), r = g.rotation.y; g.position.set(0, 0, 0); g.rotation.set(0, 0, 0); const b = ownBox(g, true); b.max.y = 2; g.position.copy(p); g.rotation.y = r; return { b, list: R.towers.map(h => [h.parent.position.x, h.parent.position.z, h.parent.rotation.y]) }; })();
// static furniture from machines.js furniture() (axis aligned, world): trailer + stairs, toilets, dumpster, rebar, form stock
const STATIC = [
  ['office trailer', 52 - 9.15, -45 - 1.83, 52 + 9.15, -45 + 1.83 + 2.45], ['toilets', 65.4, -46.62, 70.6, -45.38],
  ['dumpster', 62 - 3.15, 44 - 1.35, 62 + 3.45, 44 + 1.35], ['rebar', -64.05, 33.2, -51.95, 43.3], ['form stock', -45.3, 42.78, -31.75, 45.22],
];
const fmt = (b) => `${b.min.x.toFixed(2)}..${b.max.x.toFixed(2)} x ${b.min.z.toFixed(2)}..${b.max.z.toFixed(2)} y ${b.min.y.toFixed(2)}..${b.max.y.toFixed(2)}`;
console.log('model extents (own frame, m):');
console.log('  truck      ', fmt(EXT.truck[0])); console.log('  dozer      ', fmt(EXT.dozer)); console.log('  pump       ', fmt(EXT.pump)); console.log('  mixer      ', fmt(EXT.mixer[0]));
console.log('  CAT 336 lower', fmt(EXT.exLow), ' house', fmt(EXT.exHouse), ' tail swing r', EXT.exTail.toFixed(2));
console.log('  light tower', fmt(towerBox.b));

// ---------------------------------------------------------------- 2D convex shapes: { poly: Float64Array(8) } or { disc: [cx, cz, r] }
class Shape { constructor() { this.p = new Float64Array(8); this.kind = 0; this.cx = 0; this.cz = 0; this.r = 0; this.name = ''; this.owner = -1; this.y0 = 0; this.y1 = 0; } }
const POOL = Array.from({ length: 200 }, () => new Shape()); let nS = 0;
function obb(name, owner, x, z, yaw, b, y = 0, grow = 0) {
  const s = POOL[nS++]; s.kind = 1; s.name = name; s.owner = owner; s.y0 = y + b.min.y; s.y1 = y + b.max.y;
  const c = Math.cos(yaw), sn = Math.sin(yaw), xs = [b.min.x - grow, b.max.x + grow, b.max.x + grow, b.min.x - grow], zs = [b.min.z - grow, b.min.z - grow, b.max.z + grow, b.max.z + grow];
  // three's rotation.y: local (u, v) -> world (x + u cos + v sin, z - u sin + v cos)
  for (let i = 0; i < 4; i++) { s.p[i * 2] = x + xs[i] * c + zs[i] * sn; s.p[i * 2 + 1] = z - xs[i] * sn + zs[i] * c; }
  let mx = 0, mz = 0; for (let i = 0; i < 4; i++) { mx += s.p[i * 2] / 4; mz += s.p[i * 2 + 1] / 4; } s.bx = mx; s.bz = mz; s.br = 0; for (let i = 0; i < 4; i++) s.br = Math.max(s.br, Math.hypot(s.p[i * 2] - mx, s.p[i * 2 + 1] - mz));
  s.cx = x; s.cz = z; return s;
}
function aabb(name, owner, x0, z0, x1, z1) { return obb(name, owner, 0, 0, 0, new THREE.Box3(new THREE.Vector3(x0, 0, z0), new THREE.Vector3(x1, 3, z1))); }
function disc(name, owner, x, z, r, y0 = 0, y1 = 3) { const s = POOL[nS++]; s.kind = 2; s.bx = x; s.bz = z; s.br = r; s.name = name; s.owner = owner; s.cx = x; s.cz = z; s.r = r; s.y0 = y0; s.y1 = y1; return s; }
// signed distance from point to convex poly (ccw or cw)
function sdPoly(p, x, z) {
  let inside = true, d = Infinity, sgn = 0;
  for (let i = 0; i < 4; i++) {
    const ax = p[i * 2], az = p[i * 2 + 1], bx = p[(i + 1) % 4 * 2], bz = p[(i + 1) % 4 * 2 + 1], ex = bx - ax, ez = bz - az;
    const t = Math.max(0, Math.min(1, ((x - ax) * ex + (z - az) * ez) / (ex * ex + ez * ez)));
    d = Math.min(d, Math.hypot(x - ax - ex * t, z - az - ez * t));
    const cr = ex * (z - az) - ez * (x - ax); if (sgn === 0) sgn = Math.sign(cr) || 1; else if (Math.sign(cr) && Math.sign(cr) !== sgn) inside = false;
  }
  return inside ? -d : d;
}
// polygon vs polygon: SAT penetration (negative) or the gap (positive)
function polyPoly(a, b) {
  let maxGap = -Infinity;
  for (const [P, Q] of [[a, b], [b, a]]) for (let i = 0; i < 4; i++) {
    const ex = P[(i + 1) % 4 * 2] - P[i * 2], ez = P[(i + 1) % 4 * 2 + 1] - P[i * 2 + 1], L = Math.hypot(ex, ez), nx = -ez / L, nz = ex / L;
    let a0 = Infinity, a1 = -Infinity, b0 = Infinity, b1 = -Infinity;
    for (let k = 0; k < 4; k++) { const u = P[k * 2] * nx + P[k * 2 + 1] * nz, w = Q[k * 2] * nx + Q[k * 2 + 1] * nz; a0 = Math.min(a0, u); a1 = Math.max(a1, u); b0 = Math.min(b0, w); b1 = Math.max(b1, w); }
    maxGap = Math.max(maxGap, Math.max(b0 - a1, a0 - b1));
  }
  if (maxGap < 0) return maxGap;
  let d = Infinity; for (let k = 0; k < 4; k++) { d = Math.min(d, sdPoly(b, a[k * 2], a[k * 2 + 1]), sdPoly(a, b[k * 2], b[k * 2 + 1])); }
  return d;
}
function dist2(a, b) {
  if (a.kind === 2 && b.kind === 2) return Math.hypot(a.cx - b.cx, a.cz - b.cz) - a.r - b.r;
  if (a.kind === 2) return sdPoly(b.p, a.cx, a.cz) - a.r;
  if (b.kind === 2) return sdPoly(a.p, b.cx, b.cz) - b.r;
  return polyPoly(a.p, b.p);
}
// ---------------------------------------------------------------- 3D oriented boxes: centre, 3 axes, half sizes (SAT gap: < 0 overlap)
class OBB3 { constructor() { this.c = new THREE.Vector3(); this.a = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]; this.h = [0, 0, 0]; this.name = ''; this.owner = -1; } }
const B3 = Array.from({ length: 160 }, () => new OBB3()); let nB = 0;
const tv = new THREE.Vector3(), tq = new THREE.Quaternion(), tsc = new THREE.Vector3(), tm = new THREE.Matrix4();
function obb3(name, owner, box, mw) { // box in an object's frame, mw its matrixWorld (may carry scale)
  const o = B3[nB++]; o.name = name; o.owner = owner;
  mw.decompose(tv, tq, tsc); box.getCenter(o.c).applyMatrix4(mw);
  for (let i = 0; i < 3; i++) { o.a[i].set(i === 0 ? 1 : 0, i === 1 ? 1 : 0, i === 2 ? 1 : 0).applyQuaternion(tq); }
  o.h[0] = (box.max.x - box.min.x) / 2 * Math.abs(tsc.x); o.r = 0; o.h[1] = (box.max.y - box.min.y) / 2 * Math.abs(tsc.y); o.h[2] = (box.max.z - box.min.z) / 2 * Math.abs(tsc.z);
  o.r = Math.hypot(o.h[0], o.h[1], o.h[2]); return o;
}
const ax = new THREE.Vector3(), dv = new THREE.Vector3();
function gap3(A, B) {
  dv.subVectors(B.c, A.c); let best = -Infinity;
  const test = (n) => { const L = n.length(); if (L < 1e-9) return; n.multiplyScalar(1 / L); let ra = 0, rb = 0; for (let i = 0; i < 3; i++) { ra += A.h[i] * Math.abs(A.a[i].dot(n)); rb += B.h[i] * Math.abs(B.a[i].dot(n)); } best = Math.max(best, Math.abs(dv.dot(n)) - ra - rb); };
  for (let i = 0; i < 3; i++) { test(ax.copy(A.a[i])); test(ax.copy(B.a[i])); }
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) test(ax.crossVectors(A.a[i], B.a[j]));
  return best;
}
const boxOf = (x0, y0, z0, x1, y1, z1) => new THREE.Box3(new THREE.Vector3(x0, y0, z0), new THREE.Vector3(x1, y1, z1));
const ID = new THREE.Matrix4();

// ---------------------------------------------------------------- one frame: pose as site.js, collect shapes
const Y = createYard(), M = Y.M, D = 4;
const PUMP_W = 0.45, SLEW_W = 0.09;
const A = new THREE.Vector3(), Bv = new THREE.Vector3(), C = new THREE.Vector3(), sd = new THREE.Vector3(), X1 = new THREE.Vector3(1, 0, 0);
const seg = (m, a, b) => { sd.subVectors(b, a); const L = sd.length(); m.position.copy(a).add(b).multiplyScalar(0.5); m.scale.set(L, 1, 1); m.quaternion.setFromUnitVectors(X1, sd.normalize()); };
// longest reach of the arm (xz from the slew axis) over the poses used, measured per frame from the posed bucket box corners
const corner = new THREE.Vector3();
function reachOf(e) { let r = 0; for (const part of [[e.bucket, EXT.bucket], [e.stick, EXT.stick], [e.boom, EXT.boom]]) { part[0].updateMatrixWorld(true); const inv = tm.copy(e.up.matrixWorld).invert(); for (let k = 0; k < 8; k++) { corner.set(k & 1 ? part[1].max.x : part[1].min.x, k & 2 ? part[1].max.y : part[1].min.y, k & 4 ? part[1].max.z : part[1].min.z).applyMatrix4(part[0].matrixWorld).applyMatrix4(inv); r = Math.max(r, Math.hypot(corner.x, corner.z)); } } return r; }
const R_WORK = 12; // the swing reach kept clear of other machines (the yard's own figure; measured max reach printed below)
let maxReach = 0, lowBucketOverTruck = Infinity;
const NAMES = [];
const info = { exOn: [false, false], bay: [-1, -1] };
function frame(t, g) {
  nS = 0; nB = 0;
  Y.machines(t, g);
  // excavators
  for (let i = 0; i < 2; i++) {
    const m = M.ex[i], e = exs[i]; info.exOn[i] = m.on; info.bay[i] = m.bayTruck === undefined ? -1 : m.bayTruck;
    if (!m.on) continue;
    if (m.slew !== undefined) { e.up.rotation.y = m.slew; e.boom.rotation.z = m.boom; e.stick.rotation.z = m.stick; }
    else { const s = i ? 1 : -1, ph = m.ph, sw = m.sw; e.up.rotation.y = sw * s * 1.9; e.boom.rotation.z = lerp(0.35 - sstep(ph, 0, 0.3) * 0.55, 0.62, sw); e.stick.rotation.z = -lerp(1.05 + sstep(ph, 0.05, 0.33) * 0.9, 0.9 - sstep(ph, 0.55, 0.68) * 0.5, sw); }
    e.g.position.set(m.x, m.y, m.z); e.g.rotation.y = m.yaw || 0; e.g.updateMatrixWorld(true);
    obb('excavator ' + 'AB'[i] + ' tracks', 10 + i, m.x, m.z, m.yaw || 0, EXT.exLow, m.y);
    disc('excavator ' + 'AB'[i] + ' tail swing', 10 + i, m.x, m.z, EXT.exTail, m.y + 1.1, m.y + 2.4);
    disc('excavator ' + 'AB'[i] + ' work disc', 20 + i, m.x, m.z, R_WORK, m.y, m.y + 12);
    obb3('excavator ' + 'AB'[i] + ' house', 10 + i, EXT.exHouse, e.up.matrixWorld); obb3('excavator ' + 'AB'[i] + ' tracks', 10 + i, EXT.exLow, e.g.matrixWorld);
    obb3('excavator ' + 'AB'[i] + ' boom', 30 + i, EXT.boom, e.boom.matrixWorld); obb3('excavator ' + 'AB'[i] + ' stick', 30 + i, EXT.stick, e.stick.matrixWorld); obb3('excavator ' + 'AB'[i] + ' bucket', 30 + i, EXT.bucket, e.bucket.matrixWorld);
    maxReach = Math.max(maxReach, reachOf(e));
  }
  for (let i = 0; i < 4; i++) { const m = M.tr[i]; if (!m.on) continue; obb('truck ' + i, 40 + i, m.x, m.z, m.yaw, EXT.truck[i]); tm.compose(tv.set(m.x, 0, m.z), tq.setFromAxisAngle(THREE.Object3D.DEFAULT_UP, m.yaw), tsc.set(1, 1, 1)); obb3('truck ' + i, 40 + i, EXT.truck[i], tm); }
  { const m = M.dz; if (m.on) { obb('dozer', 50, m.x, m.z, m.yaw, EXT.dozer, m.y); tm.compose(tv.set(m.x, m.y, m.z), tq.setFromAxisAngle(THREE.Object3D.DEFAULT_UP, m.yaw), tsc.set(1, 1, 1)); obb3('dozer', 50, EXT.dozer, tm); } }
  if (M.pouring) {
    const bx = M.pump.bx, pz = M.pump.z !== undefined ? M.pump.z : -29, bay = M.bay, bz = bay % 2 ? 9.5 : -9.5;
    obb('pump', 60, bx, pz, 0, EXT.pump); tm.makeTranslation(bx, 0, pz); obb3('pump', 60, EXT.pump, tm);
    if (M.pump.C) { A.set(bx, 3.2, pz); C.set(M.pump.C[0], M.pump.C[1], M.pump.C[2]); } else { A.set(bx, 3.2, -29); C.set(bx + Math.sin(t * PUMP_W) * 3, -D + 3.5, bz + Math.cos(t * PUMP_W * 0.8) * 2); }
    Bv.copy(A).lerp(C, 0.45); Bv.y = 16;
    seg(R.pump.s1, A, Bv); seg(R.pump.s2, Bv, C); R.pump.s1.updateMatrixWorld(true); R.pump.s2.updateMatrixWorld(true);
    obb3('pump boom 1', 61, EXT.seg1, R.pump.s1.matrixWorld); obb3('pump boom 2', 61, EXT.seg2, R.pump.s2.matrixWorld);
    tm.makeTranslation(C.x, (C.y + (-D + 0.2)) / 2, C.z); obb3('pump hose', 61, boxOf(-0.1, -(C.y + D - 0.2) / 2, -0.1, 0.1, (C.y + D - 0.2) / 2, 0.1), tm);
    for (let i = 0; i < 2; i++) { const x = M.mix[i].x, z = M.mix[i].z, yaw = M.mix[i].yaw || 0; obb('mixer ' + i, 70 + i, x, z, yaw, EXT.mixer[i]); tm.compose(tv.set(x, 0, z), tq.setFromAxisAngle(THREE.Object3D.DEFAULT_UP, yaw), tsc.set(1, 1, 1)); obb3('mixer ' + i, 70 + i, EXT.mixer[i], tm); }
  }
  // crane: footing + mast from 0.4, the hook line once the top is on (site.js)
  { const up = sstep(g, 0.4, 0.47);
    if (up > 0.01) { obb('crane footing', 80, -4, 4, 0, EXT.craneFoot); tm.makeTranslation(-4, -D, 4); obb3('crane mast', 80, boxOf(-0.9, 0, -0.9, 0.9, 40 * up, 0.9), tm); }
    if (up > 0.95) {
      const Hm = 40 * up + 0.01, slew = M.crane && M.crane.slew !== undefined ? M.crane.slew : Math.sin(t * SLEW_W) * 1.6 + Math.sin(t * SLEW_W * 2.3) * 0.7;
      const tr = M.crane && M.crane.tr !== undefined ? M.crane.tr : 12 + (Math.sin(t * 0.13) * 0.5 + 0.5) * 36, drop = M.crane && M.crane.drop !== undefined ? M.crane.drop : 10 + (Math.sin(t * 0.21) * 0.5 + 0.5) * 22;
      const hx = -4 + Math.cos(slew) * tr, hz = 4 - Math.sin(slew) * tr, ytop = -D + Hm + 1.05 - 0.8, ybot = -D + Hm + 1.05 - 1.2 - drop - 0.25;
      tm.makeTranslation(hx, (ytop + ybot) / 2, hz); obb3('crane hook line', 81, boxOf(-0.25, -(ytop - ybot) / 2, -0.25, 0.25, (ytop - ybot) / 2, 0.25), tm);
    }
  }
  // static furniture and light towers
  for (const [n, x0, z0, x1, z1] of STATIC) aabb(n, 90, x0, z0, x1, z1);
  for (const [x, z, r] of towerBox.list) obb('light tower', 91, x, z, r, towerBox.b);
  // the building as site.js grows it: columns per bay after the slab cures, two cores
  for (const [x, z] of COLS) { const b = Math.floor((x + 32) / 16) * 2 + (z < 0 ? 0 : 1), k = sstep(g, 0.47 + b * 0.028 + 0.07, 0.47 + b * 0.028 + 0.12); if (k <= 0.01) continue;
    obb('column', 92, x, z, 0, COLB, -D); tm.makeTranslation(x, -D, z); obb3('column', 92, boxOf(-0.375, 0, -0.375, 0.375, 3.6 * k, 0.375), tm); }
  for (let i = 0; i < 2; i++) { const [x, z, w, d] = CORES[i], k = sstep(g, 0.56 + i * 0.03, 0.98); if (k <= 0.01) continue;
    obb('core', 92, x, z, 0, boxOf(-w / 2, 0, -d / 2, w / 2, 1, d / 2), -D); tm.makeTranslation(x, -D, z); obb3('core', 92, boxOf(-w / 2, 0, -d / 2, w / 2, Math.max(0.01, 13 * k), d / 2), tm); }
}
const COLS = []; for (let x = -28; x <= 28; x += 8) for (let z = -16; z <= 16; z += 8) COLS.push([x, z]);
const COLB = new THREE.Box3(new THREE.Vector3(-0.375, 0, -0.375), new THREE.Vector3(0.375, 3.6, 0.375)), CORES = [[-12, -4, 8, 6], [14, 5, 6, 6]];
const nStaticFrom = () => { let k = 0; for (let i = 0; i < nS; i++) if (POOL[i].owner >= 90) { k = i; break; } return k; };

// ---------------------------------------------------------------- pair rules
// 2D: every footprint pair of different machines; work disc vs every footprint of another machine, except the excavator's bay truck
// 3D: arm / pump boom / hook line vs every 3D box of another machine (the bay truck included: the bucket has to clear it)
const isWork = s => s.owner === 20 || s.owner === 21, machineOf = o => (o >= 10 && o < 12) || (o >= 20 && o < 22) || (o >= 30 && o < 32) ? 'ex' + (o % 10) : o >= 60 && o < 62 ? 'pump' : o >= 80 && o < 82 ? 'crane' : 'o' + o;
const exemptWork = (w, s) => { const i = w.owner - 20; return info.bay[i] >= 0 && s.owner === 40 + info.bay[i]; };
class Stat { constructor(name) { this.name = name; this.frames = 0; this.bad = 0; this.min = Infinity; this.at = null; this.pairs = {}; this.worst = []; } }
const S2 = new Stat('machine footprints (2D)'), SW = new Stat('work discs (2D)'), S3 = new Stat('3D (arm, pump boom, hook)'), SC = new Stat('crew vs footprints + work discs');
function rec(S, d, a, b, t, g) {
  if (d < S.min) { S.min = d; S.at = { t: +t.toFixed(3), g: +g.toFixed(4), a, b, d: +d.toFixed(3) }; }
  if (d < 0) { const k = a < b ? a + ' / ' + b : b + ' / ' + a; S.pairs[k] = (S.pairs[k] || 0) + 1; S.worst.push({ t: +t.toFixed(3), g: +g.toFixed(4), a, b, d: +d.toFixed(3) }); if (S.worst.length > 4000) { S.worst.sort((p, q) => p.d - q.d); S.worst.length = 400; } }
}
function check(t, g, crewToo) {
  frame(t, g);
  let bad2 = false, badW = false, bad3 = false, badC = false;
  for (let i = 0; i < nS; i++) for (let j = i + 1; j < nS; j++) {
    const a = POOL[i], b = POOL[j]; if (machineOf(a.owner) === machineOf(b.owner)) continue;
    if (a.owner >= 90 && b.owner >= 90) continue;
    if (Math.hypot(a.bx - b.bx, a.bz - b.bz) - a.br - b.br > FAR) continue; // broad phase: far apart
    const wa = isWork(a), wb = isWork(b);
    if (wa && wb) { const d = dist2(a, b); rec(SW, d, a.name, b.name, t, g); badW ||= d < 0; continue; }
    if (wa || wb) { const w = wa ? a : b, s = wa ? b : a; if (exemptWork(w, s)) continue; const d = dist2(w, s); rec(SW, d, w.name, s.name, t, g); badW ||= d < 0; continue; }
    const d = dist2(a, b); rec(S2, d, a.name, b.name, t, g); bad2 ||= d < 0;
  }
  for (let i = 0; i < nB; i++) for (let j = i + 1; j < nB; j++) {
    const a = B3[i], b = B3[j]; if (machineOf(a.owner) === machineOf(b.owner)) continue;
    const art = o => (o >= 30 && o < 32) || o === 61 || o === 81; if (!art(a.owner) && !art(b.owner)) continue; // body vs body is the 2D check
    if (a.c.distanceTo(b.c) - a.r - b.r > FAR) continue;
    const d = gap3(a, b); rec(S3, d, a.name, b.name, t, g); bad3 ||= d < 0;
    if ((a.owner >= 30 && a.owner < 32 && b.owner >= 40 && b.owner < 44) || (b.owner >= 30 && b.owner < 32 && a.owner >= 40 && a.owner < 44)) lowBucketOverTruck = Math.min(lowBucketOverTruck, d);
  }
  S2.frames++; SW.frames++; S3.frames++; if (bad2) S2.bad++; if (badW) SW.bad++; if (bad3) S3.bad++;
  if (crewToo) {
    Y.crewStep(t, g); const cw = Y.crew; let any = false;
    for (let k = 0; k < NW; k++) {
      if (cw[k * 5 + 4] < 0.02) continue; const x = cw[k * 5], z = cw[k * 5 + 2];
      for (let i = 0; i < nS; i++) { const s = POOL[i]; if (s.owner >= 90 || Math.hypot(x - s.bx, z - s.bz) - s.br > FAR) continue; const d = (s.kind === 2 ? Math.hypot(x - s.cx, z - s.cz) - s.r : sdPoly(s.p, x, z)) - CREW_R; rec(SC, d, 'crew ' + k, s.name, t, g); any ||= d < 0; }
    }
    SC.frames++; if (any) SC.bad++;
  }
  return bad2 || badW || bad3;
}
const line = s => console.log(`  ${s.name.padEnd(34)} frames ${String(s.frames).padStart(8)}  with overlap ${String(s.bad).padStart(7)}  min clearance ${s.min.toFixed(3).padStart(8)} m  at ${JSON.stringify(s.at)}`);

// ---------------------------------------------------------------- PROBE=g,g,...: for each build progress, the film clock t (0..600 s, 0.05 s
// steps) with the deepest physical overlap (footprints or 3D), and that pair (for the stills); prints the clearance when there is none
if (process.env.PROBE) {
  for (const g of process.env.PROBE.split(',').map(Number)) {
    let best = { d: Infinity };
    for (let t = 0; t < 600; t += 0.05) { const m0 = [S2, SW, S3].map(s => s.min); for (const s of [S2, SW, S3]) s.min = Infinity; check(t, g, false); for (const s of [S2, SW, S3]) { if (s !== SW && s.min < best.d) best = { d: s.min, t: +t.toFixed(2), a: s.at.a, b: s.at.b, kind: s.name }; s.min = Math.min(s.min, m0[[S2, SW, S3].indexOf(s)]); } }
    console.log('PROBE', g, JSON.stringify(best));
  }
  process.exit(0);
}
// ---------------------------------------------------------------- runs
const t0 = Date.now();
// 1. grid: g in 0.0005 steps, t over 0..T at 1/4 s (1/30 s every 20th g), crew every 4th g
{
  const NG = QUICK ? 400 : 2000, T = QUICK ? 300 : 440; // 440 s: two truck timetable periods (214.9 s)
  for (let gi = 0; gi <= NG; gi++) { const g = gi / NG, dt = gi % 20 === 0 ? 1 / FPS : 0.25; for (let t = 0.5; t < T; t += dt) check(t, g, gi % 4 === 0); }
}
// 2. plays: t and g advance together (30 fps), forward and backward, slow to fast scroll
for (const rate of [0.004, 0.01, 0.03, 0.1]) for (const back of [false, true]) { const n = Math.round(FPS / rate); for (let k = 0; k <= n; k++) check(3.1 + k / FPS + (back ? 500 : 0), back ? 1 - k / n : k / n, true); }
// 3. jumps: independent (t, g) pairs (a cut lands anywhere)
{ let s = 4242; const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); for (let k = 0; k < (QUICK ? 30000 : 200000); k++) check(rnd() * 1200, rnd(), true); }
console.log(`\n${REF ? 'BEFORE (' + REF + ')' : 'AFTER (working tree)'}: ${((Date.now() - t0) / 1000).toFixed(0)} s, arm reach measured ${maxReach.toFixed(2)} m (work disc ${R_WORK} m), bucket vs truck 3D min gap ${lowBucketOverTruck.toFixed(3)} m`);
for (const s of [S2, SW, S3, SC]) {
  line(s);
  const ps = Object.entries(s.pairs).sort((a, b) => b[1] - a[1]); for (const [k, n] of ps.slice(0, 14)) console.log(`      ${String(n).padStart(7)}  ${k}`);
}
if (process.env.WORST) {
  const all = [...S2.worst, ...SW.worst, ...S3.worst].sort((a, b) => a.d - b.d);
  // one per pair kind, worst first
  const seen = new Set(), pick = []; for (const w of all) { const k = [w.a, w.b].sort().join('/').replace(/\d/g, ''); if (seen.has(k)) continue; seen.add(k); pick.push(w); }
  writeFileSync(process.env.WORST, JSON.stringify({ worst: pick.slice(0, 24), all: all.slice(0, 200) }, null, 1));
}
const fails = S2.bad + SW.bad + S3.bad + SC.bad;
console.log(fails ? `\nFAIL: ${S2.bad} / ${SW.bad} / ${S3.bad} / ${SC.bad} frames with an overlap (footprints / work discs / 3D / crew)` : '\nall clear');
process.exit(fails ? 1 : 0);
