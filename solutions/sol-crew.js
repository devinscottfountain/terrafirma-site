// sol-crew.js: the rest of the jobsite crew, running whatever the camera shows. The loader hauls spoil from the excavator's
// pile to the fill pad (drive in, scoop, reverse, haul, dump, reverse); the roller compacts the pad in lanes, pulling it
// to the design level. Both read the ground from the edit field and write back to it (scoops, dumps, wheel marks).
// Machine slots: `slot.haul` and `slot.grade` are filled by solutions.js from the machine kit (see the TODO there).
import { SITE, hD } from './sol-terrain.js';

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const ease = t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const wrap = a => Math.atan2(Math.sin(a), Math.cos(a));

// polyline with arc length; at(s) -> {x, z, dx, dz}
function poly(pts) {
  const L = [0]; for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const o = { x: 0, z: 0, dx: 1, dz: 0 };
  return {
    pts, len: L[L.length - 1], L,
    at(s) {
      s = clamp(s, 0, L[L.length - 1]); let i = 1; while (i < L.length - 1 && L[i] < s) i++;
      const a = pts[i - 1], b = pts[i], seg = L[i] - L[i - 1] || 1, k = (s - L[i - 1]) / seg;
      o.x = a[0] + (b[0] - a[0]) * k; o.z = a[1] + (b[1] - a[1]) * k; o.dx = (b[0] - a[0]) / seg; o.dz = (b[1] - a[1]) / seg; return o;
    },
  };
}
// smooth a polyline with Chaikin corner cutting
function smooth(p, n = 3) { for (let k = 0; k < n; k++) { const q = [p[0]]; for (let i = 0; i < p.length - 1; i++) { const a = p[i], b = p[i + 1]; q.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25], [a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]); } q.push(p[p.length - 1]); p = q; } return p; }
const padW = (lx, lz) => { const P = SITE.pad, c = Math.cos(P.rot), s = Math.sin(P.rot); return [P.x + lx * c + lz * s, P.z - lx * s + lz * c]; };

export function createCrew({ field, slot, parts, MSCALE }) {
  // Loader: it scoops the far side of the excavator's pile (coming in from the north, so its body never gets near the
  // excavator), K-turns, hauls down the road and dumps on the near end of the pad, on one of three lanes in turn so the
  // fill spreads. The roller only works the far end of the pad: the two keep at least 1.5 machine lengths apart.
  const pile = SITE.pile, u = [0.419, -0.908];
  const at = (p, d, k) => [p[0] + d[0] * k, p[1] + d[1] * k];
  const PL = [pile.x, pile.z], S = at(PL, u, 7.4), P0 = at(PL, u, 11.5), Y = at(PL, u, 15);
  const R1 = [P0[0] - 3.4, P0[1] - 2.0], M = [P0[0], P0[1] + 2.0];
  const DUMP_X = -18, LANES_D = [0, -2.4, 2.4];   // loader origin at the dump (pad local x; the bucket is 6 m ahead), three lanes
  // legs: dir 1 forward, -1 reverse (heading opposite the motion); act at the end
  const variant = lz => {
    const D = padW(DUMP_X, lz), A = padW(DUMP_X - 5, lz), Q1 = padW(DUMP_X - 3.4, lz);
    return [
      { dir: 1, pts: [Y, P0, S], act: 'scoop' },                                        // in to the pile, nose first
      { dir: -1, pts: [S, P0, R1] },                                                    // back out, swinging the tail west
      { dir: 1, pts: [R1, M, A, D], act: 'dump' },                                      // down the road onto the pad
      { dir: -1, pts: [D, Q1, [Y[0] + 0.2, Y[1] + 5.4], [Y[0] - 0.3, Y[1] + 2.9], Y] }, // back off the pad round to the pile line
    ];
  };
  const VAR = LANES_D.map(lz => variant(lz).map(d => ({ ...d, p: poly(smooth(d.pts, 2)) })));
  for (const V of VAR) { let t = 0; for (const g of V) { g.t0 = t; t += g.p.len; } V.total = t; }
  let vi = 0, legs = VAR[0];
  const total = VAR[0].total;
  const L = { m: slot.haul, x: Y[0], z: Y[1], yaw: 0, leg: 0, s: 0, wait: 0, carry: 0, t: 0, speed: 0, dumpLeft: 0, jit: 0 };
  { const a = legs[0].p.at(0); L.yaw = Math.atan2(-a.dz, a.dx); }

  // roller lanes on the pad (pad local frame): forward along +x, reverse back on the same lane, step over
  const lanes = [-3.8, -1.9, 0, 1.9, 3.8], DR = 2.5, D0 = 5.7, D1 = 12;   // DR: drum ahead of the origin; D0..D1: drum travel (pad local x), m (far end only)
  const R = { m: slot.grade, lane: 0, dirL: 1, pass: 0, d: D0, x: 0, z: 0, yaw: SITE.pad.rot, speed: 0, t: 0 };
  const rollPath = []; for (let i = 0; i < lanes.length; i++) { const a = padW(D0 - DR, lanes[i]), b = padW(D1 - DR, lanes[i]); rollPath.push(...(i % 2 ? [b, a] : [a, b])); }

  const ground = (x, z) => field.ground(x, z);
  function seat(M, x, z, yaw, e = 1.8) {
    const fx = Math.cos(yaw), fz = -Math.sin(yaw);
    const gF = ground(x + fx * e, z + fz * e), gB = ground(x - fx * e, z - fz * e), gR = ground(x - fz * e, z + fx * e), gL = ground(x + fz * e, z - fx * e);
    const r = M.root; r.position.set(x, (gF + gB + gR + gL) / 4 - 0.05, z);
    r.rotation.set(-Math.atan((gR - gL) / (2 * e)) * 0.8, yaw, Math.atan((gF - gB) / (2 * e)) * 0.8);
  }
  function marks(x, z, yaw, half, amt) {
    const fx = Math.cos(yaw), fz = -Math.sin(yaw);
    field.mark(x - fz * half, z + fx * half, 0.42, amt); field.mark(x + fz * half, z - fx * half, 0.42, amt);
  }

  function stepLoader(dt, t) {
    const g = legs[L.leg];
    if (L.wait > 0) {
      L.wait -= dt; L.speed = 0;
      if (L.dumpLeft > 0) { // pour the load out of the front bucket over the wait
        const fx = Math.cos(L.yaw), fz = -Math.sin(L.yaw), bx = L.x + fx * 6.0, bz = L.z + fz * 6.0, gy = ground(bx, bz);
        const dv = Math.min(L.dumpLeft, dt * 3.2); L.dumpLeft -= dv; field.raise(bx, bz, 2.4, dv); field.relax(bx, bz, 3.5, 1);
        for (let i = 0; i < 3; i++) parts.emit(t, bx + (Math.random() - 0.5) * 2.6, gy + 1.4, bz + (Math.random() - 0.5) * 2.6, (Math.random() - 0.5), -0.6, (Math.random() - 0.5), 1.4, gy, 1);
        if (Math.random() < 0.3) parts.emit(t, bx, gy + 0.4, bz, (Math.random() - 0.5) * 0.8, 0.4, (Math.random() - 0.5) * 0.8, 2.6, -99, 0);
      }
      return;
    }
    const a = g.p.at(L.s), want = g.dir > 0 ? Math.atan2(-a.dz, a.dx) : Math.atan2(a.dz, -a.dx);
    const dy = wrap(want - L.yaw), turn = 1.3 * dt;
    L.yaw += clamp(dy, -turn, turn);
    if (Math.abs(dy) > 0.35) { L.speed = 0; return; }   // line up first, then roll
    const vmax = g.dir > 0 ? 4.4 : 3.0, rem = g.p.len - L.s;
    L.speed = Math.min(vmax, L.speed + dt * 2.5, Math.sqrt(Math.max(0.05, rem) * 2 * 2.2) + 0.2);
    L.s += L.speed * dt;
    const b = g.p.at(L.s); L.x = b.x; L.z = b.z;
    marks(L.x - Math.cos(L.yaw) * 1.4, L.z + Math.sin(L.yaw) * 1.4, L.yaw, 1.0, dt * 0.9);
    if (L.s >= g.p.len - 0.01) {
      if (g.act === 'scoop') { const fx = Math.cos(L.yaw), fz = -Math.sin(L.yaw); L.carry = field.take(L.x + fx * 6.0, L.z + fz * 6.0, 2.8, 3.4) + 0.6; L.wait = 1.6; }
      if (g.act === 'dump') { L.dumpLeft = L.carry; L.carry = 0; L.wait = 1.8; }
      L.leg = (L.leg + 1) % legs.length; L.s = 0;
      if (L.leg === 0) { vi = (vi + 1) % VAR.length; legs = VAR[vi]; }   // next dump lane
    }
    L.t = (g.t0 + Math.min(L.s, g.p.len)) / legs.total;
  }
  function stepRoller(dt, t) {
    const dirX = R.pass === 0 ? 1 : -1, v = R.pass === 0 ? 2.4 : 2.0;
    const goal = R.pass === 0 ? D1 : D0, rem = Math.abs(goal - R.d), span = D1 - D0;
    R.speed = Math.min(v, R.speed + dt * 1.5, Math.sqrt(rem * 2 * 1.2) + 0.15);
    R.d += dirX * R.speed * dt;
    let lz = lanes[R.lane];
    if (R.pass === 1) { const nx = lanes[clamp(R.lane + R.dirL, 0, lanes.length - 1)], k = clamp((D1 - R.d) / span, 0, 1); lz += (nx - lz) * ease(clamp((k - 0.5) / 0.5, 0, 1)); }
    const [dx, dz] = padW(R.d, lz); R.x = dx - Math.cos(R.yaw) * DR; R.z = dz + Math.sin(R.yaw) * DR;
    field.flatten(dx, dz, 1.7, hD, 0.35 * dt, 0.025 * dt);   // knocks mounds down, barely raises
    if (R.speed > 0.2) marks(R.x, R.z, R.yaw, 0.95, dt * 0.25);
    if ((R.pass === 0 && R.d >= D1) || (R.pass === 1 && R.d <= D0)) {
      R.speed = 0;
      if (R.pass === 1) { R.lane += R.dirL; if (R.lane <= 0 || R.lane >= lanes.length - 1) { R.lane = clamp(R.lane, 0, lanes.length - 1); R.dirL *= -1; } }
      R.pass ^= 1;
    }
    const f = clamp((R.d - D0) / span, 0, 1); R.t = (R.lane + (R.lane % 2 ? 1 - f : f)) / lanes.length;   // matches the drawn lanes
    R.drive = (R.drive || 0) + dirX * R.speed * dt;
  }

  const api = {
    L, R, get legs() { return legs; }, VAR, total, rollPath, lanes, roll: { x0: D0 - DR, x1: D1 - DR, zh: Math.max(...lanes.map(Math.abs)) },
    update(dt, t) {
      stepLoader(dt, t); stepRoller(dt, t);
      seat(L.m, L.x, L.z, L.yaw, 2.0); L.m.setDrive((L.dist = (L.dist || 0) + L.speed * dt * (legs[L.leg].dir || 1)) / MSCALE);
      seat(R.m, R.x, R.z, R.yaw, 2.0); R.m.setDrive(R.drive / MSCALE);
    },
    // loader route as one polyline per leg (for the path lines), t = 0..1 along the whole loop
    paths() { const V = VAR[0]; return V.map(g => ({ pts: g.p.pts, t0: g.t0 / V.total, t1: (g.t0 + g.p.len) / V.total })); },
  };
  return api;
}
