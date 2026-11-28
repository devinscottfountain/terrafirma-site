// sol-haul.js: the haul trucks that the dig excavator loads (two articulated haulers, CAT 745 class, see HAUL in sol-machines.js).
// One loading bay beside the excavator: the truck backs in with its body toward the excavator, outside the tracks and the counterweight's
// tail swing, and the bucket loads it over the tail. Full (NPASS passes), it drives off, backs onto the tip head, tips (the body rises,
// the load slides out onto a heap) and comes back round to the queue, where the second truck has been waiting to swap in.
// Everything is planned, not scripted: every path is a Dubins curve (minimum turning radius of an articulated truck at 45 degrees) for
// the reference axle (the front axle driving forward, the bogie reversing), the second unit follows on its own (tractrix), and a plan is
// only taken when its whole swept footprint (both units, every 0.5 m) clears the excavator (tracks plus the tail swing circle), the dig
// zone, the dozer's and the roller's working zones and the other truck. A truck that would come too close to anything while driving stops.
// World units (metres), the scene's xz plane; headings are yaws (forward = (cos yaw, -sin yaw)), as everywhere in the scene.
import { SITE, hF } from './sol-terrain.js';
import { HAUL } from './sol-machines.js';
import { rand } from './sol-rand.js';

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const wrap = a => Math.atan2(Math.sin(a), Math.cos(a));
const TAU = Math.PI * 2, mod2pi = a => a - TAU * Math.floor(a / TAU);
export const NPASS = 5;          // bucket passes to fill a truck
const EXC_R = 4.25;              // m: one circle holds the excavator's tracks at any heading and its house at any swing (tail swing 4.1)
const M_EXC = 1.0, M_ZONE = 1.4, M_STATIC = 0.8, M_TRUCK = 1.2;   // m: clearances a plan keeps (excavator, dig zone, dozer / roller zones, the other truck)
const SPEED = { haul: 5, near: 3.4, rev: 2.4, acc: 1.2, dec: 1.5 };   // m/s, m/s2
const PAUSE = 0.7;               // s: stop at a cusp (gear change)
const STEP = 0.25;               // m: path sampling
export let DBG = null; export const setDbg = v => { DBG = v; };   // QA: why bays were refused

// ------------------------------------------------------------------ geometry (xz plane, plain numbers, no allocation in the hot calls)
// box corners into out[0..7]: a unit frame at (x, z) facing yaw, extents a0..a1 along it and +/- w across
export function boxPts(x, z, yaw, a0, a1, w, out, o = 0) {
  const fx = Math.cos(yaw), fz = -Math.sin(yaw), rx = -fz, rz = fx;
  out[o] = x + fx * a0 - rx * w; out[o + 1] = z + fz * a0 - rz * w; out[o + 2] = x + fx * a1 - rx * w; out[o + 3] = z + fz * a1 - rz * w;
  out[o + 4] = x + fx * a1 + rx * w; out[o + 5] = z + fz * a1 + rz * w; out[o + 6] = x + fx * a0 + rx * w; out[o + 7] = z + fz * a0 + rz * w;
  return out;
}
export function inPoly(P, n, x, z) {
  let c = false;
  for (let i = 0, j = n - 1; i < n; j = i++) { const zi = P[i * 2 + 1], zj = P[j * 2 + 1]; if ((zi > z) !== (zj > z) && x < (P[j * 2] - P[i * 2]) * (z - zi) / (zj - zi) + P[i * 2]) c = !c; }
  return c;
}
function segD2(ax, az, bx, bz, px, pz) {   // squared distance point to segment
  const ex = bx - ax, ez = bz - az, l = ex * ex + ez * ez, t = l ? clamp(((px - ax) * ex + (pz - az) * ez) / l, 0, 1) : 0, dx = ax + ex * t - px, dz = az + ez * t - pz;
  return dx * dx + dz * dz;
}
function segX(ax, az, bx, bz, cx, cz, dx, dz) {   // do two segments cross
  const d1 = (bx - ax) * (cz - az) - (bz - az) * (cx - ax), d2 = (bx - ax) * (dz - az) - (bz - az) * (dx - ax);
  const d3 = (dx - cx) * (az - cz) - (dz - cz) * (ax - cx), d4 = (dx - cx) * (bz - cz) - (dz - cz) * (bx - cx);
  return d1 * d2 < 0 && d3 * d4 < 0;
}
// distance between two polygons (0 when they overlap or touch); any shape, n vertices each
export function polyDist(A, na, B, nb) {
  for (let i = 0; i < na; i++) if (inPoly(B, nb, A[i * 2], A[i * 2 + 1])) return 0;
  for (let i = 0; i < nb; i++) if (inPoly(A, na, B[i * 2], B[i * 2 + 1])) return 0;
  let d = 1e18;
  for (let i = 0, j = na - 1; i < na; j = i++) {
    const ax = A[j * 2], az = A[j * 2 + 1], bx = A[i * 2], bz = A[i * 2 + 1];
    for (let k = 0, l = nb - 1; k < nb; l = k++) {
      const cx = B[l * 2], cz = B[l * 2 + 1], dx = B[k * 2], dz = B[k * 2 + 1];
      if (segX(ax, az, bx, bz, cx, cz, dx, dz)) return 0;
      d = Math.min(d, segD2(ax, az, bx, bz, cx, cz), segD2(ax, az, bx, bz, dx, dz), segD2(cx, cz, dx, dz, ax, az), segD2(cx, cz, dx, dz, bx, bz));
    }
  }
  return Math.sqrt(d);
}
// distance from a circle to a polygon (negative inside)
export function circDist(cx, cz, r, P, n) {
  let d = 1e18; for (let i = 0, j = n - 1; i < n; j = i++) d = Math.min(d, segD2(P[j * 2], P[j * 2 + 1], P[i * 2], P[i * 2 + 1], cx, cz));
  d = Math.sqrt(d); return (inPoly(P, n, cx, cz) ? -d : d) - r;
}
// distance from a polygon to a segment grown by r (a capsule): the excavator's drive corridor
export function capDist(ax, az, bx, bz, r, P, n) {
  let d = 1e18;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const px = P[j * 2], pz = P[j * 2 + 1], qx = P[i * 2], qz = P[i * 2 + 1];
    if (segX(ax, az, bx, bz, px, pz, qx, qz)) return -r;
    d = Math.min(d, segD2(ax, az, bx, bz, px, pz), segD2(px, pz, qx, qz, ax, az), segD2(px, pz, qx, qz, bx, bz));
  }
  if (inPoly(P, n, ax, az)) return -r;
  return Math.sqrt(d) - r;
}
const bound = (P, n, o) => { let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9; for (let i = 0; i < n; i++) { x0 = Math.min(x0, P[i * 2]); x1 = Math.max(x1, P[i * 2]); z0 = Math.min(z0, P[i * 2 + 1]); z1 = Math.max(z1, P[i * 2 + 1]); } Object.assign(o, { x0, x1, z0, z1, x: (x0 + x1) / 2, z: (z0 + z1) / 2, r: Math.hypot(x1 - x0, z1 - z0) / 2 }); return o; };

// ------------------------------------------------------------------ Dubins curves (shortest forward paths with a turning radius)
// In math axes (x, y = -z, heading = yaw counter-clockwise), as published (Shkel and Lumelsky). Returns the candidates, shortest first:
// [{ len, w: 'LSL' ..., t, p, q }] (t, p, q normalised by rho).
const WORDS = ['LSL', 'RSR', 'LSR', 'RSL', 'RLR', 'LRL'];
export function dubins(x0, z0, y0, x1, z1, y1, rho) {
  const dx = x1 - x0, dy = -(z1 - z0), D = Math.hypot(dx, dy), d = D / rho, th = mod2pi(Math.atan2(dy, dx));
  const a = mod2pi(y0 - th), b = mod2pi(y1 - th), sa = Math.sin(a), sb = Math.sin(b), ca = Math.cos(a), cb = Math.cos(b), cab = Math.cos(a - b), out = [];
  for (const w of WORDS) {
    let t, p, q, ps, tmp;
    if (w === 'LSL') { ps = 2 + d * d - 2 * cab + 2 * d * (sa - sb); if (ps < 0) continue; tmp = Math.atan2(cb - ca, d + sa - sb); t = mod2pi(tmp - a); p = Math.sqrt(ps); q = mod2pi(b - tmp); }
    else if (w === 'RSR') { ps = 2 + d * d - 2 * cab + 2 * d * (sb - sa); if (ps < 0) continue; tmp = Math.atan2(ca - cb, d - sa + sb); t = mod2pi(a - tmp); p = Math.sqrt(ps); q = mod2pi(tmp - b); }
    else if (w === 'LSR') { ps = -2 + d * d + 2 * cab + 2 * d * (sa + sb); if (ps < 0) continue; p = Math.sqrt(ps); tmp = Math.atan2(-ca - cb, d + sa + sb) - Math.atan2(-2, p); t = mod2pi(tmp - a); q = mod2pi(tmp - b); }
    else if (w === 'RSL') { ps = -2 + d * d + 2 * cab - 2 * d * (sa + sb); if (ps < 0) continue; p = Math.sqrt(ps); tmp = Math.atan2(ca + cb, d - sa - sb) - Math.atan2(2, p); t = mod2pi(a - tmp); q = mod2pi(b - tmp); }
    else if (w === 'RLR') { tmp = (6 - d * d + 2 * cab + 2 * d * (sa - sb)) / 8; if (Math.abs(tmp) > 1) continue; const ph = Math.atan2(ca - cb, d - sa + sb); p = mod2pi(TAU - Math.acos(tmp)); t = mod2pi(a - ph + p / 2); q = mod2pi(a - b - t + p); }
    else { tmp = (6 - d * d + 2 * cab + 2 * d * (sb - sa)) / 8; if (Math.abs(tmp) > 1) continue; const ph = Math.atan2(ca - cb, d + sa - sb); p = mod2pi(TAU - Math.acos(tmp)); t = mod2pi(-a - ph + p / 2); q = mod2pi(b - a - t + p); }
    out.push({ len: (t + p + q) * rho, w, t, p, q });
  }
  return out.sort((u, v) => u.len - v.len);
}
// sample a Dubins word from a start pose every STEP m (then `tail` m straight on): Float32Array [x, z, yaw] per point
export function dubinsPts(x0, z0, y0, c, rho, tail = 0) {
  const segs = [[c.w[0], c.t * rho], [c.w[1], c.p * rho], [c.w[2], c.q * rho], ['S', tail]];
  const L = c.len + tail, n = Math.max(2, Math.ceil(L / STEP) + 1), out = new Float32Array(n * 3);
  for (let k = 0; k < n; k++) {
    let s = Math.min(L, k * L / (n - 1)), x = x0, y = -z0, h = y0;
    for (const [ty, sl] of segs) {
      const u = Math.min(s, sl); s -= u;
      if (ty === 'S') { x += Math.cos(h) * u; y += Math.sin(h) * u; }
      else { const sg = ty === 'L' ? 1 : -1, h1 = h + sg * u / rho; x += sg * rho * (Math.sin(h1) - Math.sin(h)); y += sg * rho * (-Math.cos(h1) + Math.cos(h)); h = h1; }
      if (s <= 0) break;
    }
    out[k * 3] = x; out[k * 3 + 1] = -y; out[k * 3 + 2] = wrap(h);
  }
  return out;
}
// a straight run between two points (yaw of the motion)
function linePts(x0, z0, x1, z1) {
  const L = Math.hypot(x1 - x0, z1 - z0), n = Math.max(2, Math.ceil(L / STEP) + 1), out = new Float32Array(n * 3), y = Math.atan2(-(z1 - z0), x1 - x0);
  for (let k = 0; k < n; k++) { const f = k / (n - 1); out[k * 3] = x0 + (x1 - x0) * f; out[k * 3 + 1] = z0 + (z1 - z0) * f; out[k * 3 + 2] = y; }
  return out;
}

// ------------------------------------------------------------------ the truck as two units (world m)
export function haulDims(MS) {
  const H = HAUL, b = H.box;
  return { LF: H.lf * MS, LR: H.lr * MS, T: [b.tractor[0] * MS, b.tractor[1] * MS, b.tractor[2] * MS], R: [b.trailer[0] * MS, b.trailer[1] * MS, b.trailer[2] * MS],
    rhoF: 12.2, rhoB: 11, art: 50 * Math.PI / 180,   // Dubins radii with slack over the 45 degree steady turn (front axle 11.4 m, bogie 9.9 m)
    bedC: ((H.bed.x0 + H.bed.x1) / 2 + H.lr) * MS,   // bed centre ahead of the bogie
    tail: (H.box.trailer[0] + H.lr) * MS,            // tail behind the bogie (negative)
    railY: (H.bed.rail + 0.1) * MS, floorY: H.bed.floor * MS, topT: H.top.tractor * MS, topR: H.top.trailer * MS };
}
// pose: front axle (fx, fz), tractor yaw yf, trailer yaw yr. Units: tractor origin at the front axle, trailer origin at the pin.
export const pinOf = (D, p) => [p.fx - Math.cos(p.yf) * D.LF, p.fz + Math.sin(p.yf) * D.LF];
export function unitBoxes(D, p, out, m = 0) {   // tractor corners into out[0..7], trailer corners into out[8..15], grown by m
  const hx = p.fx - Math.cos(p.yf) * D.LF, hz = p.fz + Math.sin(p.yf) * D.LF;
  boxPts(p.fx, p.fz, p.yf, D.T[0] - m, D.T[1] + m, D.T[2] + m, out, 0);
  boxPts(hx, hz, p.yr, D.R[0] - m, D.R[1] + m, D.R[2] + m, out, 8);
  return out;
}
// move the reference along a path point: forward = the front axle is on (x, z) heading y, the trailer follows the pin (tractrix);
// reverse = the bogie is on (x, z) with the motion heading y, the tractor follows the pin. Returns the distances the front axle and the
// bogie moved (signed), for the wheels.
const mv = [0, 0];
export function follow(D, p, x, z, y, rev) {
  const hx0 = p.fx - Math.cos(p.yf) * D.LF, hz0 = p.fz + Math.sin(p.yf) * D.LF, bx0 = hx0 - Math.cos(p.yr) * D.LR, bz0 = hz0 + Math.sin(p.yr) * D.LR;
  if (!rev) {
    mv[0] = Math.hypot(x - p.fx, z - p.fz); p.fx = x; p.fz = z; p.yf = y;
    const hx = x - Math.cos(y) * D.LF, hz = z + Math.sin(y) * D.LF, dx = hx - bx0, dz = hz - bz0, l = Math.hypot(dx, dz) || 1;
    p.yr = Math.atan2(-dz, dx); const bx = hx - dx / l * D.LR, bz = hz - dz / l * D.LR; mv[1] = Math.hypot(bx - bx0, bz - bz0);
  } else {
    const yr = wrap(y + Math.PI); mv[1] = -Math.hypot(x - bx0, z - bz0); p.yr = yr;
    const hx = x + Math.cos(yr) * D.LR, hz = z - Math.sin(yr) * D.LR, fx0 = p.fx, fz0 = p.fz, dx = fx0 - hx, dz = fz0 - hz, l = Math.hypot(dx, dz) || 1;
    p.yf = Math.atan2(-dz, dx); p.fx = hx + dx / l * D.LF; p.fz = hz + dz / l * D.LF; mv[0] = -Math.hypot(p.fx - fx0, p.fz - fz0);
  }
  return mv;
}
export const bogieOf = (D, p) => { const [hx, hz] = pinOf(D, p); return [hx - Math.cos(p.yr) * D.LR, hz + Math.sin(p.yr) * D.LR]; };

// ------------------------------------------------------------------ the haul
// trucks: hauler models (sol-machines.js); statics: [[x, z], ...] polygons the trucks keep off (the dozer's and the roller's zones)
export function createHaul({ trucks: models, field, parts, MSCALE, statics = [], THREE = null }) {
  const D = haulDims(MSCALE), MS = MSCALE;
  const ST = statics.map(p => { const a = new Float64Array(p.length * 2); p.forEach(([x, z], i) => { a[i * 2] = x; a[i * 2 + 1] = z; }); return { P: a, n: p.length, b: bound(a, p.length, {}) }; });
  // anchors (front axle poses): Q the queue, where a truck waits for the bay; TIP the tip head (bogie pose, body toward the heap)
  const A = HAUL_SITE;
  // the world the planner sees: the excavator (circle), its zone (polygon), the other trucks
  const ex = { x: SITE.E.x, z: SITE.E.z, on: true };
  const zone = { P: new Float64Array(24), n: 0, b: { x: 0, z: 0, r: 0, x0: 0, x1: 0, z0: 0, z1: 0 } };
  const corr = { on: false, ax: 0, az: 0, bx: 0, bz: 0, r: 0, arm: false, pa: 0, qa: 0, pb: 0, qb: 0 };   // the excavator's drive corridor while it moves (trucks keep out of it)
  const arm = { on: false, ax: 0, az: 0, bx: 0, bz: 0, y: 0 };   // the arm seen from above (swing centre to past the bucket) and its lowest point (world y)
  const bx = new Float64Array(16), bo = new Float64Array(16);
  let extraM = 0, skipT = null, ahead = false;   // ahead: planning for the next bay while the excavator moves (its way is kept clear)   // skipT: a truck pulling away that a plan may follow (pathFree with follow checks it instead)   // m: more room round the other truck (planning a bay's way out round a truck that will only stop near its planned pose)

  // clearance of a truck pose against everything but `self` (m; negative = overlap). mode: which margins to apply
  function clear(p, self, m = true) {
    unitBoxes(D, p, bx, 0);
    let d = 1e9;
    for (let u = 0; u < 2; u++) {
      const U = u ? bx.subarray(8) : bx;
      if (ex.on) d = Math.min(d, circDist(ex.x, ex.z, EXC_R, U, 4) - (m ? M_EXC : 0));
      const ux0 = Math.min(U[0], U[2], U[4], U[6]), ux1 = Math.max(U[0], U[2], U[4], U[6]), uz0 = Math.min(U[1], U[3], U[5], U[7]), uz1 = Math.max(U[1], U[3], U[5], U[7]);
      const far = (b, mm) => ux0 > b.x1 + mm || ux1 < b.x0 - mm || uz0 > b.z1 + mm || uz1 < b.z0 - mm;   // boxes apart by more than mm: no need to measure
      if (zone.n > 2 && !far(zone.b, M_ZONE + 2)) d = Math.min(d, polyDist(U, 4, zone.P, zone.n) - (m ? M_ZONE : 0));
      for (const S of ST) if (!far(S.b, M_STATIC + 2)) d = Math.min(d, polyDist(U, 4, S.P, S.n) - (m ? M_STATIC : 0));
      if (m && ahead && corr.on && corrD(U) < 0) d = Math.min(d, -0.1);   // (planning ahead while the excavator moves: never into its way)
      // a moving truck never passes under the arm while the arm is lower than the truck (a parked one is never planned under it)
      if (!m && arm.on && self && arm.y < (field ? field.ground((U[0] + U[4]) / 2, (U[1] + U[5]) / 2) : 0) + (u ? D.topR : D.topT) + 0.5) d = Math.min(d, capDist(arm.ax, arm.az, arm.bx, arm.bz, 1.1, U, 4) + 0.6);
      for (const t of T) {
        if (t === self || t === skipT) continue;
        unitBoxes(D, t.p, bo, 0);
        d = Math.min(d, polyDist(U, 4, bo, 4) - (m ? M_TRUCK + extraM : 0), polyDist(U, 4, bo.subarray(8), 4) - (m ? M_TRUCK + extraM : 0));
      }
    }
    return d;
  }
  // run legs from a pose (a copy), checking every 0.5 m: articulation inside the limit and clearance >= 0. Returns the end pose or null.
  function simLegs(p0, legs, self, ignoreZone = false) {
    const p = { ...p0 }; let acc = 0;
    const zn = zone.n; if (ignoreZone) zone.n = 0;
    try {
      for (const L of legs) {
        const P = L.pts, n = P.length / 3;
        for (let k = 1; k < n; k++) {
          follow(D, p, P[k * 3], P[k * 3 + 1], P[k * 3 + 2], L.rev); acc += STEP;
          if (Math.abs(wrap(p.yf - p.yr)) > D.art) return null;
          if (acc >= 0.5 || k === n - 1) { acc = 0; if (clear(p, self) < 0) return null; }
        }
      }
    } finally { zone.n = zn; }
    return p;
  }
  // a forward leg from pose p to the front axle pose (x, z, y), ending with a straight run of `tail` m (the trailer lines up): the
  // shortest Dubins word whose run clears. Then (rev) a reverse leg for the bogie into (bx, bz) with the body heading by (the bogie
  // follows a Dubins word too). Returns { legs, end } or null.
  function plan(p, goal, self, opts = {}) {
    const tail = opts.tail ?? 8, out = [];
    const fx = goal.fx - Math.cos(goal.yf) * tail, fz = goal.fz + Math.sin(goal.yf) * tail;
    let best = null;
    for (const c of dubins(p.fx, p.fz, p.yf, fx, fz, goal.yf, D.rhoF)) {
      if (c.len > (opts.maxLen || 160)) break;
      if (c.len <= (opts.from || 0)) continue;   // (the shorter ones were tried already)
      const L = { rev: false, pts: dubinsPts(p.fx, p.fz, p.yf, c, D.rhoF, tail) };
      const e = simLegs(p, [L], self, opts.ignoreZone);
      if (!e) continue;
      best = { legs: [L], end: e }; break;
    }
    if (!best) return null;
    if (!opts.back) return best;
    // reverse: the bogie from where the forward leg left it into the bay, the motion heading opposite to the body
    const [b0x, b0z] = bogieOf(D, best.end), B = opts.back;
    for (const c of dubins(b0x, b0z, wrap(best.end.yr + Math.PI), B.x, B.z, wrap(B.y + Math.PI), D.rhoB)) {
      if (c.len > 40) break;
      const L = { rev: true, pts: dubinsPts(b0x, b0z, wrap(best.end.yr + Math.PI), c, D.rhoB, 0) };
      const e = simLegs(best.end, [L], self, opts.ignoreZone);
      if (!e) continue;
      out.push(...best.legs, L); return { legs: out, end: e };
    }
    return null;
  }

  // ------------------------------------------------------------------ pull-up points: drive past, then back in
  // A bay (or the tip head) is a bogie pose (bx, bz) with the body heading yr (cab away from where it backs). The truck drives forward to a
  // pull-up point, stops, and backs in: straight along the axis, or round an arc (a third, a half or two thirds of a turn) when it pulls
  // up across the axis, which is how a driver usually does it. The arc's bogie radius is the reverse Dubins radius, so the reverse leg
  // that is planned from where the truck really stopped comes out the same.
  function pullUps(bay) {
    const out = [], R = D.rhoB + 0.6, h = bay.yr, ux = Math.cos(h), uz = -Math.sin(h);
    for (const [th, ls] of [[Math.PI / 2, 9], [Math.PI / 3, 9], [2 * Math.PI / 3, 9]]) for (const s of [1, -1]) {
      // walk outward from the bay: ls m straight, then the arc to heading h + s th, then 3 m straight
      let x = bay.bx + ux * ls, z = bay.bz + uz * ls, y = h; const n = 24;
      for (let k = 0; k < n; k++) { const y1 = h + s * th * (k + 0.5) / n; x += Math.cos(y1) * R * th / n; z -= Math.sin(y1) * R * th / n; }
      y = wrap(h + s * th); x += Math.cos(y) * 3; z -= Math.sin(y) * 3;
      out.push({ fx: x + Math.cos(y) * (D.LR + D.LF), fz: z - Math.sin(y) * (D.LR + D.LF), yf: y, c: th === Math.PI / 2 ? 0 : 1, rl: ls + R * th + 3 });
    }
    for (const a of [13, 16]) { const x = bay.bx + ux * a, z = bay.bz + uz * a; out.push({ fx: x + ux * (D.LR + D.LF), fz: z + uz * (D.LR + D.LF), yf: h, c: 2, rl: a }); }
    return out.sort((u, v) => u.c - v.c);
  }
  // the way in: forward to the best pull-up that clears, then (unless split) back in. -> { legs, end, pull } or null
  function* approachG(p, bay, self, split = false, gone = null, maxLen = 160, accept = null) {
    // shortest first: the forward Dubins length to each pull-up (a lower bound) plus the length of the back-in it sets up
    const G = pullUps(bay);
    for (const g of G) { const fx = g.fx - Math.cos(g.yf) * 12, fz = g.fz + Math.sin(g.yf) * 12, d = dubins(p.fx, p.fz, p.yf, fx, fz, g.yf, D.rhoF)[0]; g.L = (d ? d.len : 1e9) + g.rl + g.c * 4; }
    G.sort((u, v) => u.L - v.L);
    for (const g of G) {
      if (g.L > Math.min(1e8, maxLen + 60)) break;
      const f = plan(p, g, self, { tail: 12, maxLen });
      if (!f) { yield; continue; }
      const gi = gone ? T.indexOf(gone) : -1; if (gi >= 0) T.splice(gi, 1);
      const r = backIn(f.end, bay, self);   // a pull-up is only good if the truck can back in from it (once the bay is empty)
      if (gi >= 0) T.splice(gi, 0, gone);
      if (!r) { yield; continue; }
      if (accept && !accept(f, r)) { yield; continue; }
      if (split) return { ...f, pull: g, back: r };
      return { legs: [...f.legs, ...r.legs], end: r.end, pull: g };
    }
    return null;
  }
  const drainG = g => { let r; while (!(r = g.next()).done); return r.value; };
  const approach = (...a) => drainG(approachG(...a));
  // from wherever it stopped, the bogie back into the bay (reverse Dubins, motion heading opposite to the body)
  function backIn(p, bay, self) {
    // the last LS m straight back along the bay's axis, so the tractor has lined up behind the body when it stops
    const LS = bay.ls ?? 9, [b0x, b0z] = bogieOf(D, p), y0 = wrap(p.yr + Math.PI), ux = Math.cos(bay.yr), uz = -Math.sin(bay.yr), qx = bay.bx + ux * LS, qz = bay.bz + uz * LS;
    for (const c of dubins(b0x, b0z, y0, qx, qz, wrap(bay.yr + Math.PI), D.rhoB)) {
      if (c.len > 60) break;
      const L = { rev: true, pts: dubinsPts(b0x, b0z, y0, c, D.rhoB, LS) };
      const e = simLegs(p, [L], self);
      if (e) return { legs: [L], end: e };
    }
    return null;
  }
  const tipBay = { bx: HAUL_SITE.TIP.x, bz: HAUL_SITE.TIP.z, yr: HAUL_SITE.TIP.y, ls: TIP_LS };
  const poseAt = b => ({ fx: b.bx + Math.cos(b.yr) * (D.LR + D.LF), fz: b.bz - Math.sin(b.yr) * (D.LR + D.LF), yf: b.yr, yr: b.yr });
  const tipPose = poseAt(tipBay);
  let tipPull = null;   // the tip head's home pull-up (cab north, the trucks come up from the home bay); tipPulls: all of them
  const tipPulls = [];
  // the pull-up a truck at p would use: the cheapest (forward Dubins to it plus its reverse back onto the tip head, reversing counted
  // slower) whose run clears. -> { r, g } or null. from: only words longer than that (a loop, when nothing short clears)
  const pc = [];
  function toTip(p, self, maxLen = 80, from = 0) {
    pc.length = 0;
    for (const g of tipPulls) { const fx = g.fx - Math.cos(g.yf) * OUT_TAIL, fz = g.fz + Math.sin(g.yf) * OUT_TAIL, d = dubins(p.fx, p.fz, p.yf, fx, fz, g.yf, D.rhoF)[0]; g.L = (d ? d.len : 1e9) + g.rl * 1.6; pc.push(g); }
    pc.sort((u, v) => u.L - v.L);
    let n = 0;
    for (const g of pc) { if (g.L > 1e8 || ++n > 4) break; const r = plan(p, g, self, { tail: OUT_TAIL, maxLen, from }); if (r) return { r, g }; }
    return null;
  }

  // ------------------------------------------------------------------ the bay (loading spot) for an excavator position
  // The truck stands radial, body toward the excavator: bogie at rB from the swing centre on the bearing `brg` (world yaw), cab away.
  // Candidates: bearings 82 to 135 degrees either side of the dig bearing, two radii, a little skew; ranked by how natural the swing is
  // (about 105 degrees; the left side first: on the dig camera that is the open ground) and kept only when the truck standing there clears
  // everything and both its way in (from the tip head, where the empty truck waits) and out (to the tip head's pull-up) clear too, with a
  // truck parked at the other end each time. Cheap tests first.
  const bayPose = (x, z, brg, rB, skew) => { const y = wrap(brg + skew), bxw = x + Math.cos(brg) * rB, bzw = z - Math.sin(brg) * rB;
    return { fx: bxw + Math.cos(y) * (D.LR + D.LF), fz: bzw - Math.sin(y) * (D.LR + D.LF), yf: y, yr: y, bx: bxw, bz: bzw, brg, rB }; };
  const SW = [105, 120, 92, 135, 82].flatMap(a => [a, -a]).map(a => a * Math.PI / 180);
  const ghost = { p: { fx: 0, fz: 0, yf: 0, yr: 0 } };   // a parked truck the planner pretends is there
  // a generator: one candidate checked per step (the caller runs a step or two per frame: a fixed amount of work, so the sim stays
  // deterministic), the bay (or null) as its value. keep: the bay in use, tried first if it still works from here.
  function* findBayG(x, z, digYaw, keep = null, accept = null) {
    const cand = [];
    if (keep && bayOk(keep, x, z, digYaw) && (!accept || accept(keep))) {
      // the bay in use still works from here (a short move): kept as it is, its ways in and out stand, so the truck in it (or on its
      // way) need not move. Only that it still stands clear of the excavator there and of the zone is checked.
      const exo = { x: ex.x, z: ex.z, on: ex.on }, sv = T.slice(); let ok = false;
      ex.x = x; ex.z = z; ex.on = true; T.length = 0; try { ok = clear(keep, null) >= 0; } finally { ex.x = exo.x; ex.z = exo.z; ex.on = exo.on; T.length = 0; T.push(...sv); }
      if (ok) return keep;
    }
    for (const sw of SW) for (const rB of [8.5, 9.3]) for (const sk of [0, 0.14, -0.14]) {
      const P = bayPose(x, z, digYaw + sw, rB, sk);
      P.c = Math.abs(Math.abs(sw) - 1.83) + (sw < 0 ? 0.25 : 0) + Math.abs(sk) * 0.8 + (rB - 8.5) * 0.15; cand.push(P);
    }
    cand.sort((a, b) => a.c - b.c);
    let tried = 0;
    for (const P of cand) {
      if (accept && !accept(P)) continue;
      const r = yield* evalBayG(P, x, z, digYaw);
      if (r === 0) continue;   // did not even stand clear: cheap, no step spent
      if (r) return r;
      if (++tried >= 6) break;
      yield;
    }
    return null;
  }
  function* evalBayG(P, x, z, digYaw) {   // -> the bay, null (no way in or out), 0 (it does not stand clear)
    const exo = { x: ex.x, z: ex.z, on: ex.on }, sv = T.slice();
    const enter = () => { ex.x = x; ex.z = z; ex.on = true; T.length = 0; }, leave = () => { ex.x = exo.x; ex.z = exo.z; ex.on = exo.on; T.length = 0; T.push(...sv); };
    // (every step leaves the world as it found it: the trucks run between the steps; a step sets up its ghosts and plans without yielding
    // in between, since each resume starts from a clean world)
    function* stepG(fn) { const g = fn(); for (;;) { enter(); let r; try { r = g.next(); } finally { leave(); } if (r.done) return r.value; yield; } }
    let r0 = 0; enter(); try { r0 = clear(P, null); } finally { leave(); }
    if (r0 < 0) { if (DBG) DBG.push(['stand', P.brg, P.rB, r0]); return 0; }
    // in: from the tip head to the bay's pull-up and back in, the other truck waiting at the tip's pull-up. First with a truck loading in
    // the bay too (then the next one can come up and wait there while it loads), else without (the next one waits on the tip head).
    const g0 = { p: { ...P } }, gt = { p: { ...tipPull, yr: tipPull.yf } }, gq = { p: { ...tipPose } };
    // a pull-up the next truck can wait at while this one loads: the loaded one's way out clears it (with a metre to spare: the trucks
    // stop within a few cm of their planned poses), and so does a truck backing onto the tip head
    const sv2 = [];
    const stageable = f => {
      sv2.length = 0; sv2.push(...T); T.length = 0;
      try {
        T.push(gq, { p: { ...f.end } }); extraM = 1; const o = toTip(P, null, 70); extraM = 0; if (!o) return false;
        T.length = 0; T.push({ p: { ...f.end } }); return !!backIn({ ...o.g, yr: o.g.yf }, tipBay, null);
      } finally { extraM = 0; T.length = 0; T.push(...sv2); }
    };
    let stageOK = true, inP = yield* stepG(function* () { T.push(gt, g0); return yield* approachG(tipPose, P, null, true, g0, 75, stageable); });
    if (!inP) { stageOK = false; inP = yield* stepG(function* () { T.push(gt); return yield* approachG(tipPose, P, null, true, null, 75); }); }
    if (!inP) { if (DBG) DBG.push(['in', P.brg, P.rB]); return null; }
    // out: to the tip's pull-up, the other truck on the tip head
    const outP = yield* stepG(function* () { T.push(gq); return toTip(P, null, 70); });
    if (!outP) { if (DBG) DBG.push(['out', P.brg, P.rB]); return null; }
    return { ...P, x, z, digYaw, toPull: inP.legs, pull: inP.pull, pullEnd: inP.end, back: inP.back.legs, stage: stageOK };
  }
  const findBay = (...a) => { const g = findBayG(...a); let r; while (!(r = g.next()).done); return r.value; };
  function bayOk(P, x, z, digYaw) {   // a bay still good from a new excavator position (same pose, new swing)
    const d = Math.hypot(P.bx - x, P.bz - z), brg = Math.atan2(-(P.bz - z), P.bx - x), sw = Math.abs(wrap(brg - digYaw));
    return d > 7.8 && d < 10.2 && sw > 1.3 && sw < 2.45 && Math.abs(wrap(P.yr - brg)) < 0.45;
  }

  // ------------------------------------------------------------------ trucks
  const NU = 13, NW = 7, B = HAUL.bed;   // the heap's grid in the body (along, across)
  const rv = THREE ? new THREE.Vector3() : null;
  const T = models.map((m, i) => {
    const t = { id: i, m, st: 'queue', p: { fx: 0, fz: 0, yf: 0, yr: 0 }, legs: null, li: 0, s: 0, v: 0, pause: 0, df: 0, dr: 0, passes: 0, vol: 0, full: false,
      bedA: 0, tipT: 0, retry: 0, bay: null, ver: -1, block: 0, heap: null, drop: 0, wait: 0 };
    if (THREE) t.heap = makeHeap(THREE, m, i);
    return t;
  });
  // the loaded material in the body: a low-poly mound over the floor (bed-local grid), grown by every pass where the bucket opened,
  // with an angle of repose, crowned a little over the rails when full. No physics. Fill: the bucket heap's material kind (same
  // program); edges: the truck's own line material.
  function makeHeap(THREE, m, i) {
    const pos = new Float32Array(NU * NW * 3), idx = [], edg = [];
    for (let b = 0; b < NW; b++) for (let a = 0; a < NU; a++) { const k = (b * NU + a) * 3; pos[k] = B.x0 + 0.08 + (B.x1 - B.x0 - 0.16) * a / (NU - 1) - HAUL.hinge[0]; pos[k + 1] = B.floor - HAUL.hinge[1]; pos[k + 2] = (b / (NW - 1) - 0.5) * 2 * (B.z - 0.06); }
    for (let b = 0; b + 1 < NW; b++) for (let a = 0; a + 1 < NU; a++) { const k = b * NU + a; idx.push(k, k + NU, k + 1, k + 1, k + NU, k + NU + 1); if (b > 0) edg.push(k, k + 1); if (a > 0) edg.push(k, k + NU); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage)); g.setIndex(idx); g.computeBoundingSphere(); g.boundingSphere.radius += 2;
    const e = new THREE.BufferGeometry(); e.setAttribute('position', g.attributes.position); e.setIndex(edg); e.boundingSphere = g.boundingSphere.clone();
    const mat = new THREE.MeshBasicMaterial({ color: 0x9a7452, transparent: true, opacity: 1 });
    const grp = new THREE.Group(); grp.visible = false;
    grp.add(Object.assign(new THREE.Mesh(g, mat), { renderOrder: 3 }), Object.assign(new THREE.LineSegments(e, m.line), { renderOrder: 3 }));
    m.bed.add(grp);
    return { grp, g, e, mat, h: new Float32Array(NU * NW), cur: new Float32Array(NU * NW), live: false };
  }
  const hMax = (a, b) => { const u = a / (NU - 1), w = b / (NW - 1), cu = Math.sin(Math.PI * Math.min(1, u * 1.15)), cw = Math.sin(Math.PI * w); return (B.rail - B.floor) * (0.55 + 0.45 * Math.min(1, cw * 2)) + 0.5 * Math.pow(cu * cw, 0.6); };
  // a pass lands at bed-local (lx, lz) (model m): a mound, then the slopes relax (angle of repose), capped by the body's shape
  function heapAdd(t, lx, lz, k) {
    const Hh = t.heap; if (!Hh) return;
    const amp = 0.62 * k, sg = 1.25;
    for (let b = 0; b < NW; b++) for (let a = 0; a < NU; a++) {
      const x = B.x0 + (B.x1 - B.x0) * a / (NU - 1), z = (b / (NW - 1) - 0.5) * 2 * B.z, d2 = (x - lx) * (x - lx) + (z - lz) * (z - lz);
      Hh.h[b * NU + a] += amp * Math.exp(-d2 / (sg * sg));
    }
    const dxu = (B.x1 - B.x0) / (NU - 1), dzw = 2 * B.z / (NW - 1);
    for (let it = 0; it < 12; it++) for (let b = 0; b < NW; b++) for (let a = 0; a < NU; a++) {
      const k0 = b * NU + a;
      if (a + 1 < NU) { const k1 = k0 + 1, dh = Hh.h[k0] - Hh.h[k1], lim = 0.75 * dxu; if (Math.abs(dh) > lim) { const mm = (Math.abs(dh) - lim) * 0.25 * Math.sign(dh); Hh.h[k0] -= mm; Hh.h[k1] += mm; } }
      if (b + 1 < NW) { const k1 = k0 + NU, dh = Hh.h[k0] - Hh.h[k1], lim = 0.75 * dzw; if (Math.abs(dh) > lim) { const mm = (Math.abs(dh) - lim) * 0.25 * Math.sign(dh); Hh.h[k0] -= mm; Hh.h[k1] += mm; } }
    }
    for (let b = 0; b < NW; b++) for (let a = 0; a < NU; a++) Hh.h[b * NU + a] = Math.min(Hh.h[b * NU + a], hMax(a, b));
    Hh.live = true;
  }
  // ease the shown heap toward the load (the material settles in about a second); the body tipping drains it toward the tail
  function heapTick(t, dt) {
    const Hh = t.heap; if (!Hh || !Hh.live) return;
    const k = 1 - Math.exp(-dt * 3.2), pos = Hh.g.attributes.position.array; let any = false, top = 0;
    for (let i = 0; i < NU * NW; i++) { const d = Hh.h[i] - Hh.cur[i]; if (Math.abs(d) > 1e-4) { Hh.cur[i] += d * k; any = true; } else Hh.cur[i] = Hh.h[i]; top = Math.max(top, Hh.cur[i]); }
    if (any) { for (let i = 0; i < NU * NW; i++) pos[i * 3 + 1] = B.floor - HAUL.hinge[1] + 0.02 + Hh.cur[i]; Hh.g.attributes.position.needsUpdate = true; }
    Hh.grp.visible = top > 0.02; if (!any && top <= 0.02) Hh.live = false;
  }

  // ------------------------------------------------------------------ the bay in use
  let bay = null, bayVer = 0, lock = -1, tipLock = -1, stage = -1, nextBay = null;   // nextBay: the bay the excavator is moving to (a truck may stage for it meanwhile)   // lock: the truck in (or coming into) the bay; tipLock: the one on (or backing onto) the tip head
  let armIn = () => false;   // the dig tells us when its bucket is over a truck (a truck never moves under it)
  // a move's sweep: both units' boxes every metre along all its legs (from the pose it starts in); t.sweepK: how far along it is
  function sweepOf(p0, legs) {
    const p = { ...p0 }, out = []; let acc = 1;
    for (const L of legs) { const P = L.pts, n = P.length / 3; for (let k = 1; k < n; k++) { follow(D, p, P[k * 3], P[k * 3 + 1], P[k * 3 + 2], L.rev); acc += STEP; if (acc >= 1 || k === n - 1) { acc = 0; out.push(unitBoxes(D, p, new Float64Array(16), 0)); } } }
    return out;
  }
  const bb = (B, o) => { let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9; for (let i = 0; i < 16; i += 2) { x0 = Math.min(x0, B[i]); x1 = Math.max(x1, B[i]); z0 = Math.min(z0, B[i + 1]); z1 = Math.max(z1, B[i + 1]); } o[0] = x0; o[1] = x1; o[2] = z0; o[3] = z1; return o; };
  const ba = [0, 0, 0, 0], bc = [0, 0, 0, 0];
  // would a move with this sweep come within the trucks' margin of where another moving truck still has to go? (two moves at once only
  // when their paths never meet, so neither ever has to stop for the other)
  // follow: t sets off behind a truck that is pulling away (the next truck backing into the bay as the full one drives out of it): a
  // place on o's way is no conflict when o is sure to have left it well before t can get there (o at its own pace from where it is,
  // counted slow; t at its top speed from rest, counted fast). The look-ahead in drive() still stops t if o ever stalls.
  const tOut = (o, d) => { const v0 = Math.max(0, o.v), a = SPEED.acc, vm = 2.4, d1 = Math.max(0, (vm * vm - v0 * v0) / (2 * a));
    return Math.max(0, o.pause) + (v0 >= vm ? d / vm : d <= d1 ? (Math.sqrt(v0 * v0 + 2 * a * d) - v0) / a : (vm - v0) / a + (d - d1) / vm); };
  const tRev = d => { const d1 = SPEED.rev * SPEED.rev / (2 * SPEED.acc); return PAUSE * 0.5 + (d <= d1 ? Math.sqrt(2 * d / SPEED.acc) : SPEED.rev / SPEED.acc + (d - d1) / SPEED.rev); };   // s: the soonest t can have reversed d m from rest
  const leader = t => { for (const o of T) if (o !== t && !atEnd(o) && o.sweep && !o.legs[o.li].rev && o.li === o.legs.length - 1) return o; return null; };
  function pathFree(t, sweep, follow = false) {
    for (const o of T) {
      if (o === t || atEnd(o) || !o.sweep) continue;
      const lead = follow && !o.legs[o.li].rev && o.li === o.legs.length - 1;   // (o driving forward on its last leg: it only goes away)
      for (let j = Math.max(0, o.sweepK - 1); j < o.sweep.length; j++) {
        const Bo = o.sweep[j]; bb(Bo, bc);
        const gone = lead ? tOut(o, Math.max(0, j - o.sweepK + 2)) * 1.2 + 1.0 : 1e9;   // s: by then o has left this place
        for (let i = 0; i < sweep.length; i++) {
          if (tRev(i) > gone) break;   // t cannot be anywhere near this far along by then
          const Bt = sweep[i];
          bb(Bt, ba); if (ba[0] > bc[1] + M_TRUCK || ba[1] < bc[0] - M_TRUCK || ba[2] > bc[3] + M_TRUCK || ba[3] < bc[2] - M_TRUCK) continue;
          if (Math.min(polyDist(Bt, 4, Bo, 4), polyDist(Bt, 4, Bo.subarray(8), 4), polyDist(Bt.subarray(8), 4, Bo, 4), polyDist(Bt.subarray(8), 4, Bo.subarray(8), 4)) < M_TRUCK) return false;
        }
      }
    }
    return true;
  }
  // take a planned move if its path stays clear of the other truck's remaining one
  // a move is only taken when its whole sweep stays clear of the other truck: where it stands (the plan was checked against that) and,
  // if it is moving, everywhere it still has to go. So two moves at once never meet, and neither ever waits on the other half way.
  let mover = -1;
  function take(t, r, follow = false) {
    const sw = sweepOf(t.p, r.legs); if (!pathFree(t, sw, follow)) return false;
    t.sweep = sw; t.sweepK = 0; t.sd = 0; setLegs(t, r); mover = t.id; return true;
  }
  const canMove = () => true;
  function setLegs(t, r) { t.legs = r.legs; t.li = 0; t.s = 0; t.pause = PAUSE * 0.5; }
  const atEnd = t => !t.legs || t.li >= t.legs.length;
  // move along the legs: speed limited by the leg's end (it stops at every cusp) and by the leg kind; stops short when the next few
  // metres would come too close to anything
  const look = { fx: 0, fz: 0, yf: 0, yr: 0 };
  function drive(t, dt) {
    if (atEnd(t)) { t.v = 0; return; }
    if (t.pause > 0) { t.pause -= dt; t.v = 0; return; }
    const L = t.legs[t.li], P = L.pts, n = P.length / 3, len = (n - 1) * STEP, rem = len - t.s;
    const near = t.st === 'in' || t.st === 'stage' ? SPEED.near : SPEED.haul, vmax = L.rev ? SPEED.rev : t.full ? near * 0.85 : near;
    let vt = Math.min(vmax, Math.sqrt(2 * SPEED.dec * Math.max(0, rem)) + 0.05);
    // look ahead (the stopping distance and 2 m more): would it come too close? (the plan cleared the parked world; this keeps it
    // clear of anything that moved since: the other truck, the excavator)
    const ahead = t.v * t.v / (2 * SPEED.dec) + 2, k1 = Math.min(n - 1, Math.round((t.s + ahead) / STEP));
    Object.assign(look, t.p); const kk = Math.min(n - 1, Math.max(0, Math.round(t.s / STEP)));
    for (let k = kk + 1; k <= k1; k++) follow(D, look, P[k * 3], P[k * 3 + 1], P[k * 3 + 2], L.rev);
    const c = clear(look, t, false);
    if (c < 0.6 && clear(t.p, t, false) >= c - 1e-6) { vt = 0; t.block += dt; } else t.block = 0;
    if (t.block > 3 && t.retry <= 0) { t.retry = 1; replan(t); }   // held up (something new in its way, a zone drawn across its path): round it
    t.v = vt > t.v ? Math.min(vt, t.v + SPEED.acc * dt) : Math.max(vt, t.v - SPEED.dec * 1.5 * dt);
    if (t.v <= 1e-3 && vt === 0) return;
    const s1 = Math.min(len, t.s + t.v * dt);
    // step the reference point by point (the trailer needs small steps)
    let k = Math.floor(t.s / STEP) + 1;
    for (; k * STEP <= s1 + 1e-6 && k < n; k++) { const m = follow(D, t.p, P[k * 3], P[k * 3 + 1], P[k * 3 + 2], L.rev); t.df += m[0]; t.dr += m[1]; t.sd = (t.sd || 0) + STEP; }
    t.sweepK = Math.floor((t.sd || 0) / 1.0);
    t.s = s1;
    if (t.s >= len - 1e-4) { t.li++; t.s = 0; t.v = 0; t.pause = t.li < t.legs.length ? PAUSE : 0; }
  }

  // ------------------------------------------------------------------ per truck state machine
  // The tip head is also the queue: an empty truck waits there. One cycle:
  //   queue (on the tip head) -> stage (forward to the bay's pull-up, and wait there while the other truck loads) -> in (back into the
  //   bay) -> load (NPASS passes) -> out (forward to the tip head's pull-up) -> wait (for the tip head) -> back (onto it) -> tip (body up,
  //   the load slides out, body down) -> queue
  // Locks: one truck staged, one in (or backing into) the bay, one on (or backing onto) the tip head. A move starts only when its whole
  // path clears the other truck where it stands, and the other one only ever moves away. A bay that moves (the excavator went to dig
  // elsewhere) sends a parked truck round again, unless it is the same bay; a truck in the excavator's drive corridor leaves it.
  // the excavator's move: a capsule for its body along the way, and a circle the arm sweeps at each end (it turns on the spot there)
  const ARM_SWEEP = 8.2;
  // The arm is held on one world bearing while the excavator travels (the house turns against the tracks): it sweeps a band along the
  // way, a capsule along the path set half the arm's length out that way. With no bearing given: full circles at both ends.
  const inCorr = (m) => {
    for (let u = 0; u < 2; u++) {
      const B = u ? bx.subarray(8) : bx;
      if (capDist(corr.ax, corr.az, corr.bx, corr.bz, corr.r + m, B, 4) < 0) return true;
      if (corr.arm) { if (capDist(corr.pa, corr.qa, corr.pb, corr.qb, ARM_SWEEP / 2 + 0.6 + m, B, 4) < 0) return true; }
      else if (circDist(corr.ax, corr.az, ARM_SWEEP + m, B, 4) < 0 || circDist(corr.bx, corr.bz, ARM_SWEEP + m, B, 4) < 0) return true;
    }
    return false;
  };
  const corrD = U => capDist(corr.ax, corr.az, corr.bx, corr.bz, corr.r + 0.8, U, 4) < 0 || (corr.arm ? capDist(corr.pa, corr.qa, corr.pb, corr.qb, ARM_SWEEP / 2 + 1.4, U, 4) < 0 : circDist(corr.ax, corr.az, ARM_SWEEP + 0.8, U, 4) < 0 || circDist(corr.bx, corr.bz, ARM_SWEEP + 0.8, U, 4) < 0) ? -1 : 1;
  const hitsCorr = t => { if (!corr.on) return false; unitBoxes(D, t.p, bx, 0); return inCorr(0.5); };
  const samePose = (p, q) => Math.hypot(p.fx - q.fx, p.fz - q.fz) < 0.03 && Math.abs(wrap(p.yf - q.yf)) < 0.004 && Math.abs(wrap(p.yr - q.yr)) < 0.004;
  // into a bay close by (the excavator moved a little and its bay with it): straight back in from where it stands, else a short pull
  // forward along its own heading and back in from there. -> a move, or null (then the long way round, by a pull-up)
  function shortIn(t, B) {
    if (Math.hypot(t.p.fx - B.fx, t.p.fz - B.fz) > 24) return null;
    const r = backIn(t.p, B, t); if (r) return r;
    for (const d of [8, 13, 18]) {
      const g = { fx: t.p.fx + Math.cos(t.p.yf) * d, fz: t.p.fz - Math.sin(t.p.yf) * d, yf: t.p.yf };
      const f = plan(t.p, g, t, { tail: 0, maxLen: d + 6, back: { x: B.bx, z: B.bz, y: B.yr } }); if (f) return f;
    }
    return null;
  }
  function escape(t) {   // the usual ways out are blocked by the other truck waiting: round onto the tip head by another pull-up, if it is free
    if (tipLock >= 0) return false;
    const r = backIn(t.p, tipBay, t) || approach(t.p, tipBay, t, false, null, 120);   // straight back onto it if it can, else round to a pull-up
    if (r && take(t, r)) { tipLock = t.id; t.st = 'back'; if (lock === t.id) lock = -1; if (stage === t.id) stage = -1; t.esc = 0; return true; }
    return false;
  }
  function leave(t) {   // forward to a pull-up of the tip head (a loop only when nothing shorter clears; else it waits and tries again)
    const o = toTip(t.p, t) || toTip(t.p, t, 130, 80);   // (else round a loop)
    if (o && take(t, o.r)) { t.pullT = o.g; t.st = 'out'; if (lock === t.id) lock = -1; if (stage === t.id) stage = -1; if (tipLock === t.id) tipLock = -1; return true; }
    return false;
  }
  function replan(t) {   // held up on the way (a zone drawn across its path, the arm low over it): a new way to the same place, else another one
    let r = null, st = t.st;
    if (t.st === 'stage' && bay) r = approach(t.p, bay, t, true, null, 140);
    else if (t.st === 'in' && bay) r = backIn(t.p, bay, t) || approach(t.p, bay, t, false, null, 140);
    else if (t.st === 'out') { const o = toTip(t.p, t); if (o) { r = o.r; t.pullT = o.g; } }
    else if (t.st === 'back') r = backIn(t.p, tipBay, t) || approach(t.p, tipBay, t, false, null, 140);
    if (!r && tipLock < 0 && t.st !== 'back') { r = backIn(t.p, tipBay, t) || approach(t.p, tipBay, t, false, null, 140); if (r) { st = 'back'; tipLock = t.id; if (lock === t.id) lock = -1; if (stage === t.id) stage = -1; } }   // round by the tip head
    if (r && take(t, r)) { t.st = st; t.block = 0; t.replans = (t.replans || 0) + 1; }
  }
  // settle onto a planned pose when it has stopped within a few cm of it
  function snap(t, q) { if (q && Math.hypot(t.p.fx - q.fx, t.p.fz - q.fz) < 0.3 && Math.abs(wrap(t.p.yf - q.yf)) < 0.06 && Math.abs(wrap(t.p.yr - (q.yr ?? q.yf))) < 0.06) place(t, q); }
  function stepTruck(t, dt, clk) {
    t.retry -= dt;
    if (mover === t.id && atEnd(t) && t.pause <= 0) mover = -1;
    if (!canMove(t) && t.st !== 'tip') { if (t.st === 'stage' || t.st === 'in' || t.st === 'out' || t.st === 'back') drive(t, dt); return; }
    if (t.kick && atEnd(t) && t.retry <= 0) {   // asked to make way: off to the tip's pull-up, or from there onto the tip head
      t.retry = 0.5; t.kicks = (t.kicks || 0) + 1;
      const atPull = t.st === 'wait';
      if ((!atPull && leave(t)) || escape(t) || t.kicks > 20) { t.kick = false; t.kicks = 0; }
      if (t.st === 'out' || t.st === 'back') { if (t.st === 'out' && tipLock === t.id) tipLock = -1; return; }
    }
    switch (t.st) {
      case 'queue':
        if (!bay && corr.on && nextBay && nextBay.pull && t.retry <= 0 && !T.some(o => o !== t && (o.st === 'stage' || o.st === 'in' || o.st === 'out' || (o.st === 'staged' && o.bay === nextBay)))) {   // the excavator is on its way to a new bay: up to its pull-up now
          t.retry = 0.5; ahead = true; let r = null; try { r = plan(t.p, nextBay.pull, t, { tail: 12, maxLen: 110 }); } finally { ahead = false; }
          if (r && take(t, r)) { t.bay = nextBay; t.ver = -2; t.st = 'stage'; if (tipLock === t.id) tipLock = -1; }
          break;
        }
        // up to the bay's pull-up, unless the truck in the bay is about to leave (or is leaving, or is still backing in): their paths cross
        if (bay && stage < 0 && !corr.on && t.retry <= 0 && !T.some(o => o !== t && (o.st === 'out' || o.st === 'in' || (o.st === 'load' && (o.full || o.ver !== bayVer || !bay.stage))))) {
          t.retry = 0.5;
          // the bay's own way in (planned with it, from the tip head) when it is standing there, else a fresh plan
          let r = null;
          // (always to the bay's own pull-up: the way out of the bay was planned round a truck waiting exactly there)
          if (bay.toPull && samePose(t.p, tipPose) && simLegs(t.p, bay.toPull, t)) r = { legs: bay.toPull };
          else if (bay.pull) r = plan(t.p, bay.pull, t, { tail: 12, maxLen: 110 });
          if (r && take(t, r)) { stage = t.id; t.bay = bay; t.ver = bayVer; t.st = 'stage'; if (tipLock === t.id) tipLock = -1; }
          else if (lock < 0 && !T.some(o => o !== t && o.st === 'load')) {   // nobody in the bay: any way in will do
            const a = approach(t.p, bay, t, false, null, 140);
            if (a && take(t, a)) { lock = t.id; t.bay = bay; t.ver = bayVer; t.st = 'in'; if (tipLock === t.id) tipLock = -1; }
          }
        }
        break;
      case 'stage':
        if (atEnd(t)) { t.st = 'staged'; if (t.ver === bayVer && bay && bay.pullEnd) snap(t, bay.pullEnd); }
        break;
      case 'staged':
        if (t.ver !== bayVer && bay && t.bay && Math.hypot(bay.bx - t.bay.bx, bay.bz - t.bay.bz) < 0.3 && Math.abs(wrap(bay.yr - t.bay.yr)) < 0.05) { t.ver = bayVer; if (bay.stage) stage = t.id; }   // the same bay again
        if (hitsCorr(t)) { if (t.retry <= 0) { t.retry = 0.5; if (!leave(t) && (t.esc = (t.esc || 0) + 0.5) > 4) escape(t); } break; }
        if (!bay && corr.on && nextBay && nextBay.pull && t.bay !== nextBay && t.retry <= 0 && !T.some(o => o !== t && (o.st === 'stage' || o.st === 'in' || o.st === 'out' || (o.st === 'staged' && o.bay === nextBay)))) {   // waiting for a bay the excavator has left: on to the next one's pull-up
          t.retry = 0.5; ahead = true; let r = null; try { r = plan(t.p, nextBay.pull, t, { tail: 12, maxLen: 110 }); } finally { ahead = false; }
          if (r && take(t, r)) { t.bay = nextBay; t.ver = -2; t.st = 'stage'; }
          break;
        }
        if (t.ver !== bayVer) {   // the bay moved: to the new one's pull-up (when there is one)
          if (bay && !corr.on && t.retry <= 0 && !T.some(o => o !== t && (o.st === 'in' || o.st === 'out'))) {
            t.retry = 0.5;
            // the new bay is free: straight in (forward to its pull-up, back in); else up to its pull-up to wait; else round again
            if (lock < 0) { const r = shortIn(t, bay) || approach(t.p, bay, t, false, null, 120); if (r && take(t, r)) { lock = t.id; stage = -1; t.bay = bay; t.ver = bayVer; t.st = 'in'; break; } }
            const r = bay.stage && bay.pull && plan(t.p, bay.pull, t, { tail: 12, maxLen: 110 });
            if (r && take(t, r)) { t.bay = bay; t.ver = bayVer; t.st = 'stage'; }
            else if (!leave(t) && (t.esc = (t.esc || 0) + 0.5) > 2) escape(t);   // round again (by the tip head)
          }
          break;
        }
        if (T.some(o => o !== t && o.st === 'load' && o.stuck > 5) && t.retry <= 0) { t.retry = 0.5; leave(t); break; }   // the full one cannot get past: go round
        if (lock < 0 && !corr.on && t.retry <= 0) {
          t.retry = 0.4;
          let r = null;
          skipT = leader(t);   // (the full one driving out of the bay: back in behind it as it goes)
          try { if (bay.back && bay.pullEnd && samePose(t.p, bay.pullEnd)) { if (simLegs(t.p, bay.back, t)) r = { legs: bay.back }; } else r = backIn(t.p, bay, t); } finally { skipT = null; }
          if (r && take(t, r, true)) { lock = t.id; stage = -1; t.st = 'in'; }
        }
        break;
      case 'in':
        if (atEnd(t)) { t.st = 'load'; t.wait = 0; snap(t, t.bay); }
        break;
      case 'load': {
        t.wait += dt;
        const same = bay && Math.hypot(bay.bx - t.bay.bx, bay.bz - t.bay.bz) < 0.3 && Math.abs(wrap(bay.yr - t.bay.yr)) < 0.05;
        if (same) t.ver = bayVer;
        const moved = t.ver !== bayVer;
        // leave when full, or when the bay moved and it is in the way of the excavator's drive (or the new bay is somewhere else)
        if (moved && bay && !t.full && !corr.on && t.retry <= 0 && (lock < 0 || lock === t.id) && !T.some(o => o !== t && (o.st === 'in' || o.st === 'stage' || o.st === 'out')) && !armIn()) {
          t.retry = 0.5; const r = shortIn(t, bay) || approach(t.p, bay, t, false, null, 120);   // the bay moved: to the new one (it keeps its load), the short way if it is close
          if (r && take(t, r)) { lock = t.id; t.bay = bay; t.ver = bayVer; t.st = 'in'; break; }
        }
        const go = (t.full || (moved && bay && t.retry <= -3) || hitsCorr(t)) && !armIn() && !T.some(o => o !== t && o.st === 'stage');   // never across a truck on its way up
        if (go && t.retry <= 0) {
          t.retry = 0.5;
          if (!leave(t)) {
            t.stuck = (t.stuck || 0) + 0.5; if (t.stuck > 8) escape(t);
            if (t.stuck > 3) for (const o of T) if (o !== t && atEnd(o) && (o.st === 'queue' || o.st === 'wait' || o.st === 'staged')) o.kick = true;   // a truck parked in the way of the way out is asked to move
          } else t.stuck = 0;
        }
        break;
      }
      case 'out':
        if (atEnd(t)) { t.st = 'wait'; if (t.pullT) snap(t, { ...t.pullT, yr: t.pullT.yf }); }
        break;
      case 'wait':   // at the tip head's pull-up: back on when the tip head is free (an empty one may go straight to a free bay)
        if (t.vol <= 0 && !t.passes && bay && lock < 0 && stage < 0 && !corr.on && t.retry <= 0 && !T.some(o => o !== t && (o.st === 'load' || o.st === 'in' || o.st === 'out' || o.st === 'stage'))) {
          t.retry = 0.5; const a = approach(t.p, bay, t, false, null, 140);
          if (a && take(t, a)) { lock = t.id; t.bay = bay; t.ver = bayVer; t.st = 'in'; break; }
        }
        if (tipLock < 0 && t.retry <= 0) {
          t.retry = 0.5; const r = backIn(t.p, tipBay, t);
          if (r && take(t, r)) { tipLock = t.id; t.st = 'back'; }
        }
        break;
      case 'back':
        if (atEnd(t)) { t.st = t.vol > 0 || t.passes > 0 ? 'tip' : 'queue'; t.tipT = 0; snap(t, tipPose); }
        break;
      case 'tip': {   // body up (3.5 s), the load slides out over the tail once it passes about 20 degrees, hold, body down (3 s)
        t.tipT += dt; const up = Math.min(1, t.tipT / 3.5), dn = Math.max(0, (t.tipT - 6.2) / 3);
        const e = x => x * x * (3 - 2 * x); t.bedA = HAUL.tip * (e(up) - e(Math.min(1, dn)));
        if (t.bedA > 0.35 && (t.vol > 0 || t.heap?.live)) {
          const out = Math.min(t.vol, dt * 4.5); t.vol -= out;
          const [bxw, bzw] = bogieOf(D, t.p), c = Math.cos(t.p.yr), s = Math.sin(t.p.yr), tx = bxw + c * (D.tail - 2.2), tz = bzw - s * (D.tail - 2.2);
          if (field && out > 0) { if (!t.taken) { t.taken = true; field.take(tx, tz, 4.5, t.load0 * 0.9); } field.raise(tx, tz, 2.6, out); field.relax(tx, tz, 4, 1); }
          if (parts && t.vol > 0.05) { const g = field ? field.ground(tx, tz) : 0; for (let q = 0; q < 2; q++) parts.emit(clk, tx + c * 1.4 + (rand() - 0.5) * 2.4, g + 1.0 + rand() * 1.6, tz - s * 1.4 + (rand() - 0.5) * 2.4, -c * 1.2 + (rand() - 0.5), -0.8, s * 1.2 + (rand() - 0.5), 1.4, g + 0.05, 1); }
          const Hh = t.heap; if (Hh) { for (let i = 0; i < NU * NW; i++) Hh.h[i] *= Math.exp(-dt * 1.4); Hh.live = true; }
        }
        if (t.tipT > 9.3) { t.bedA = 0; t.vol = 0; t.passes = 0; t.drop = 0; t.full = false; t.taken = false; if (t.heap) { t.heap.h.fill(0); t.heap.live = true; } t.st = 'queue'; t.retry = 0.8; }
        break;
      }
    }
    if (t.st === 'stage' || t.st === 'in' || t.st === 'out' || t.st === 'back') drive(t, dt); else t.v = 0;
  }

  // ------------------------------------------------------------------ the model on the ground
  const seat = (t) => {
    const M = t.m, p = t.p, g = field ? field.ground : hF;
    const [hx, hz] = pinOf(D, p), [bxw, bzw] = bogieOf(D, p);
    const W = HAUL.tz * MS, fr = (x, z, y) => [x - Math.sin(y) * W, z - Math.cos(y) * W, x + Math.sin(y) * W, z + Math.cos(y) * W];
    const gF = g(p.fx, p.fz), gH = g(hx, hz), gB = g(bxw, bzw), [lx, lz, rx, rz] = fr(p.fx, p.fz, p.yf), [lbx, lbz, rbx, rbz] = fr(bxw, bzw, p.yr);
    const tr = M.tractor, tl = M.trailer;
    tr.position.set(p.fx / MS, gF / MS, p.fz / MS); tr.rotation.order = 'YXZ'; tr.rotation.set(-Math.atan((g(rx, rz) - g(lx, lz)) / (2 * W)) * 0.8, p.yf, Math.atan((gF - gH) / D.LF) * 0.9);
    tl.position.set(hx / MS, gH / MS, hz / MS); tl.rotation.order = 'YXZ'; tl.rotation.set(-Math.atan((g(rbx, rbz) - g(lbx, lbz)) / (2 * W)) * 0.8, p.yr, Math.atan((gH - gB) / D.LR) * 0.9);
    M.setRoll(t.df / MS, t.dr / MS); M.setBed(t.bedA);
    if (M.root && M.root.updateMatrixWorld) M.root.updateMatrixWorld(true);
  };

  // ------------------------------------------------------------------ start: truck 0 in the bay with a part load, truck 1 waiting
  function place(t, pose) { Object.assign(t.p, { fx: pose.fx, fz: pose.fz, yf: pose.yf, yr: pose.yr ?? pose.yf }); }

  const api = {
    trucks: T, D, NPASS, anchors: A,
    get tipPull() { return tipPull; }, tipPulls,
    get locks() { return { lock, tipLock, stage, bayVer, corr: corr.on, bay: !!bay, armIn: armIn() }; },
    qa: { why(p0, legs, self) {   // QA: where and why a run fails
        const p = { ...p0 }; let k0 = 0;
        for (const L of legs) { const P = L.pts, n = P.length / 3; for (let k = 1; k < n; k++) { follow(D, p, P[k * 3], P[k * 3 + 1], P[k * 3 + 2], L.rev); k0++;
          const art = Math.abs(wrap(p.yf - p.yr)); if (art > D.art) return { k: k0, art };
          const c = clear(p, self); if (c < 0) { const sv = T.slice(); T.length = 0; const c0 = clear(p, self); T.push(...sv); const exo = ex.on; ex.on = false; const c1 = clear(p, self); ex.on = exo; return { k: k0, at: [p.fx.toFixed(1), p.fz.toFixed(1)], c: c.toFixed(2), noTrucks: c0.toFixed(2), noExc: c1.toFixed(2) }; } } }
        return null; },
      dubins, dubinsPts, simLegs: (...a) => simLegs(...a), follow: (p, x, z, y, rev) => follow(D, p, x, z, y, rev), get arm() { return arm; }, samePose: (...a) => samePose(...a), sweepOf: (...a) => sweepOf(...a), pathFree: (...a) => pathFree(...a), toTip: (...a) => toTip(...a) },
    // the excavator's position, the dig zone (flat [x, z, ...], n corners), and its drive corridor (a capsule) while it moves
    setExcavator(x, z) { ex.x = x; ex.z = z; },
    setZone(X, Z, n) { zone.n = n; for (let i = 0; i < n; i++) { zone.P[i * 2] = X[i]; zone.P[i * 2 + 1] = Z[i]; } if (n > 2) bound(zone.P, n, zone.b); },
    // aw: the arm's world bearing for the whole move (null: not known, full circles at both ends)
    setCorridor(on, ax = 0, az = 0, bx2 = 0, bz2 = 0, aw = null) {
      corr.on = on; corr.ax = ax; corr.az = az; corr.bx = bx2; corr.bz = bz2; corr.r = EXC_R + M_EXC; corr.arm = on && aw != null;
      if (corr.arm) { const h = ARM_SWEEP / 2, c = Math.cos(aw) * h, sn = -Math.sin(aw) * h; corr.pa = ax + c; corr.qa = az + sn; corr.pb = bx2 + c; corr.qb = bz2 + sn; }
    },
    setArmIn(fn) { armIn = fn; },
    setArm(on, ax = 0, az = 0, bx2 = 0, bz2 = 0, y = 0) { arm.on = on; arm.ax = ax; arm.az = az; arm.bx = bx2; arm.bz = bz2; arm.y = y; },
    findBay, findBayG, plan, approach, backIn, clear,
    // clearance of a pose against the site alone (the excavator, its zone, the dozer and the roller), not the trucks
    staticClear(p) { const sv = T.slice(); T.length = 0; try { return clear(p, null); } finally { T.push(...sv); } },
    // how close a truck standing at pose p comes to (x, z)
    nearR(p, x, z) { unitBoxes(D, p, bx, 0); return Math.max(0, Math.min(circDist(x, z, 0, bx, 4), circDist(x, z, 0, bx.subarray(8), 4))); },
    // does a zone polygon come within m of a truck (where it stands)?
    zoneHitsTrucks(X, Z, n, m) {
      const P = new Float64Array(n * 2); for (let i = 0; i < n; i++) { P[i * 2] = X[i]; P[i * 2 + 1] = Z[i]; }
      for (const t of T) {
        unitBoxes(D, t.p, bx, 0); if (polyDist(P, n, bx, 4) < m || polyDist(P, n, bx.subarray(8), 4) < m) return true;
        if (!atEnd(t) && t.v > 0.05) { const L = t.legs[t.li], Q = L.pts, nq = Q.length / 3, k1 = Math.min(nq - 1, Math.round((t.s + t.v * t.v / (2 * SPEED.dec) + 3) / STEP)); Object.assign(look, t.p);   // (and where a moving one will stop)
          for (let k = Math.max(0, Math.round(t.s / STEP)) + 1; k <= k1; k++) { follow(D, look, Q[k * 3], Q[k * 3 + 1], Q[k * 3 + 2], L.rev); if ((k & 7) === 0 || k === k1) { unitBoxes(D, look, bx, 0); if (polyDist(P, n, bx, 4) < m || polyDist(P, n, bx.subarray(8), 4) < m) return true; } } }
      }
      return false;
    },
    // the bearings (world yaw) a truck standing at pose p covers seen from (x, z), grown by m: [lo, hi] around `mid`
    sector(p, x, z, m, out) {
      unitBoxes(D, p, bx, m); const mid = Math.atan2(-(bx[1] + bx[13] - 2 * z) / 2, (bx[0] + bx[12] - 2 * x) / 2); let lo = 0, hi = 0;
      for (let i = 0; i < 8; i++) { const a = wrap(Math.atan2(-(bx[i * 2 + 1] - z), bx[i * 2] - x) - mid); lo = Math.min(lo, a); hi = Math.max(hi, a); }
      out[0] = mid + lo; out[1] = mid + hi; out[2] = mid; return out;
    },
    // is the ground point (x, z) within m of a truck (where it stands, or the bay it is coming into)?
    near(x, z, m) {
      for (const t of T) {
        unitBoxes(D, t.p, bx, m); if (inPoly(bx, 4, x, z) || inPoly(bx.subarray(8), 4, x, z)) return true;
        // a truck on the move: where it will be once it has stopped (a zone drawn there could not stop it short of it)
        if (!atEnd(t) && t.v > 0.05) { const L = t.legs[t.li], P = L.pts, n = P.length / 3, k1 = Math.min(n - 1, Math.round((t.s + t.v * t.v / (2 * SPEED.dec) + 3) / STEP)); Object.assign(look, t.p);
          for (let k = Math.max(0, Math.round(t.s / STEP)) + 1; k <= k1; k++) { follow(D, look, P[k * 3], P[k * 3 + 1], P[k * 3 + 2], L.rev); if ((k & 7) === 0 || k === k1) { unitBoxes(D, look, bx, m); if (inPoly(bx, 4, x, z) || inPoly(bx.subarray(8), 4, x, z)) return true; } } }
      }
      if (bay) { unitBoxes(D, bay, bx, m); if (inPoly(bx, 4, x, z) || inPoly(bx.subarray(8), 4, x, z)) return true; }
      return false;
    }, get tipPose() { return tipPose; }, get tipPull() { return tipPull; }, tipBay,
    get bay() { return bay; },
    // a new bay (or null while the excavator chooses where to go)
    setNext(b) { nextBay = b && b.pull ? b : null; },
    setBay(b) { if (b) nextBay = null; if (b === bay) return; if (b && bay && Math.hypot(b.bx - bay.bx, b.bz - bay.bz) < 0.05 && Math.abs(wrap(b.yr - bay.yr)) < 0.01) return; bay = b; bayVer++; stage = -1; },   // (the same bay again: kept, the truck in it stays)
    // boot: the first truck already stands in the excavator's first bay (the section opens on a load going in, not on an empty bay)
    startIn(b) {
      const t = T[0]; if (!t || t.st !== 'queue' || lock >= 0 || b !== bay) return false;
      const sv = { ...t.p }; place(t, b); if (clear(t.p, t) < 0) { place(t, sv); return false; }
      t.st = 'load'; t.wait = 0; t.bay = b; t.ver = bayVer; t.legs = null; t.v = 0; lock = t.id; tipLock = -1; seat(t); return true;
    },   // a staged truck waited for the old bay: it re-routes itself, the stage is free
    // the truck standing in the bay, ready to load (null otherwise)
    get ready() { for (const t of T) if (t.st === 'load' && t.ver === bayVer && bay && !t.full && t.wait > 0.4) return t; return null; },
    // a truck in the bay or on its way in (the excavator keeps its bucket off that side)
    // a truck lined up for this bay (staging, staged or backing in): it will be here soon
    get queued() { for (const t of T) if ((t.st === 'stage' || t.st === 'staged' || t.st === 'in') && t.ver === bayVer) return t; return null; },
    // metres a truck still has to go on its current move (0: parked)
    left(t) { if (!t.legs) return 0; let d = 0; for (let i = t.li; i < t.legs.length; i++) d += (t.legs[i].pts.length / 3 - 1) * STEP; return Math.max(0, d - t.s); },
    get coming() { for (const t of T) if (t.st === 'in' || (t.st === 'load' && t.ver === bayVer)) return t; return null; },
    // can the excavator drive the corridor now (no truck in it)?
    corridorClear() {
      if (!corr.on) return true;
      for (const t of T) {
        unitBoxes(D, t.p, bx, 0); if (inCorr((t.st === 'in' || t.st === 'out') ? 8 : 0)) return false;   // (and none on the move near it)
        if (t.st === 'in' && t.bay) { unitBoxes(D, t.bay, bx, 0); if (inCorr(0.5)) return false; }   // (nor backing into a bay in its way)
      }
      return true;
    },
    // world bed geometry of a truck: centre, axis, rail top (y), the floor, and where pass k should land (nearest to the excavator first)
    bed(t, o) {
      const [bxw, bzw] = bogieOf(D, t.p), c = Math.cos(t.p.yr), s = Math.sin(t.p.yr), g = field ? field.ground(bxw + c * D.bedC, bzw - s * D.bedC) : 0;
      o.x = bxw + c * D.bedC; o.z = bzw - s * D.bedC; o.ux = c; o.uz = -s; o.rail = g + D.railY; o.floor = g + D.floorY;
      // the rails as the trailer really sits (pitched and rolled on the ground): the highest of their four ends
      if (THREE && t.m.trailer.matrixWorld) { let hi = -1e9; for (const x of [B.x0 - 0.3, B.x1 + 0.1]) for (const z of [-B.z - 0.1, B.z + 0.1]) { rv.set(x, B.rail + 0.1, z); t.m.trailer.localToWorld(rv); hi = Math.max(hi, rv.y); } o.rail = hi; }
      o.len = (B.x1 - B.x0) * MS; o.w = B.z * MS; o.top = g + D.topR;
      // the heap's top under the drop point (model to world)
      return o;
    },
    // the heap's highest point (world y) over the bed, for the bucket's clearance
    heapTop(t) { let m = 0; const Hh = t.heap; if (Hh) for (let i = 0; i < NU * NW; i++) m = Math.max(m, Hh.h[i]); else m = t.passes / NPASS * (B.rail - B.floor); return m * MS; },
    // a pass: vol world m3 (what the bucket held), opened over world (x, z)
    deposit(t, vol, x, z, k = 1) {
      const [bxw, bzw] = bogieOf(D, t.p), c = Math.cos(t.p.yr), s = Math.sin(t.p.yr), dx = x - bxw, dz = z - bzw;
      const lx = (dx * c - dz * s) / MS - HAUL.lr, lz = (dx * s + dz * c) / MS;   // into the trailer frame (origin at the pin)
      heapAdd(t, clamp(lx, B.x0 + 0.6, B.x1 - 0.6), clamp(lz, -B.z + 0.5, B.z - 0.5), k);
      t.vol += vol; t.load0 = t.vol; t.drop += k; t.passes++;
      if (t.drop >= NPASS - 0.05) t.full = true;
    },
    update(dt, clk) {
      const order = T.length > 1 && T[1].st === 'load' ? [T[1], T[0]] : T;   // the truck in the bay first: it is the one that has to get out
      for (const t of order) stepTruck(t, dt, clk);
      for (const t of T) { heapTick(t, dt); seat(t); }
    },
    // truck footprints (tractor and trailer corners, flat) for the plan view and the checks
    boxes(t, out, m = 0) { return unitBoxes(D, t.p, out, m); },
    // QA: put the trucks back at the start
    reset(homeBay) {
      bay = homeBay; bayVer++; lock = -1; tipLock = -1; stage = -1; mover = -1;
      const t0 = T[0]; place(t0, homeBay); t0.st = 'load'; t0.bay = homeBay; t0.ver = bayVer; t0.legs = null; t0.wait = 1; lock = 0;
      if (T[1]) { place(T[1], tipPose); T[1].st = 'queue'; T[1].legs = null; tipLock = 1; T[1].retry = 4; }
      for (const t of T) { t.v = 0; t.bedA = 0; seat(t); }
    },
    dispose() { for (const t of T) if (t.heap) { t.heap.g.dispose(); t.heap.e.dispose(); t.heap.mat.dispose(); t.heap.grp.removeFromParent(); } },
  };
  // start: one truck on the tip head (it heads for the bay as soon as the excavator has one), the other at the tip's pull-up (it backs on
  // when the first has gone)
  // the tip head's pull-ups: TIP_LS m out along its axis, a turn round (right: north, left: south) and TIP_S m on, so a loaded truck
  // backs round onto the tip head in about 20 to 35 m. The first (cab north, north-west of the tip head) is the home bay's; the
  // others serve bays elsewhere (a truck takes the cheapest it can reach, see toTip).
  for (const [sg, yEnd] of [[1, -Math.PI / 2], [1, -Math.PI / 2 + 0.45], [1, -Math.PI / 2 - 0.5], [-1, Math.PI / 2], [-1, Math.PI / 2 + 0.6]]) for (const S of [TIP_S, TIP_S + 8]) {
    const R = D.rhoB + 0.6, h = tipBay.yr, th = sg > 0 ? mod2pi(yEnd - h) : mod2pi(h - yEnd), n = 24;   // th: the turn from the tip's axis
    let x = tipBay.bx + Math.cos(h) * TIP_LS, z = tipBay.bz - Math.sin(h) * TIP_LS;
    for (let k = 0; k < n; k++) { const y1 = h + sg * th * (k + 0.5) / n; x += Math.cos(y1) * R * th / n; z -= Math.sin(y1) * R * th / n; }
    const y = wrap(h + sg * th); x += Math.cos(y) * S; z -= Math.sin(y) * S;
    tipPulls.push({ fx: x + Math.cos(y) * (D.LR + D.LF), fz: z - Math.sin(y) * (D.LR + D.LF), yf: y, rl: TIP_LS + R * th + S });
  }
  tipPull = tipPulls[0];
  if (T[0]) { place(T[0], tipPose); T[0].st = 'queue'; tipLock = 0; }
  if (T[1]) { place(T[1], { ...tipPull, yr: tipPull.yf }); T[1].st = 'wait'; T[1].pullT = tipPull; }
  for (const t of T) seat(t);
  return api;
}

// the haul road anchors (world m, front axle poses [x, z, yaw]; the tip head as a bogie pose). Out past the excavator to the north-east:
// the queue on the way in, the tip head on gentle ground east of the site (the heap lands behind the tail), clear of the dozer's push line
// and the roller's pad.
export const HAUL_SITE = { TIP: SITE.tip };   // tip head (and queue): the bogie here, cab west-north-west, the heap behind the tail (SITE.tip, sol-terrain.js)
let TIP_LS = 4, TIP_S = 10, OUT_TAIL = 6;   // m: the straight run back onto the tip head, on past the turn to its pull-up, and into the pull-up
export const setTipQA = (ls, s3, ot = OUT_TAIL) => { TIP_LS = ls; TIP_S = s3; OUT_TAIL = ot; };   // QA: try other pull-ups
