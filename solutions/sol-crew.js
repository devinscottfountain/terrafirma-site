// sol-crew.js: the rest of the jobsite crew, running whatever the camera shows. The dozer pushes spoil from the excavator's
// pile onto the near end of the fill pad (approach, blade down, push, blade up, reverse); the compactor works the far end of
// the pad in lanes, pulling it to the design level, steering on its articulation at each lane change. Both read the ground
// from the edit field and write back to it (the blade's bite and spill, track and drum marks).
// Machine slots: `slot.haul` and `slot.grade` are filled by solutions.js from the machine kit (see the TODO there). Rig calls
// that a slot's model does not have (setBlade, setRipper, setSteer) are skipped, so any model with root, setDrive and
// setOpacity still runs the loops.
import { SITE, hD } from './sol-terrain.js';

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const ease = t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

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
const padW = (lx, lz) => { const P = SITE.pad, c = Math.cos(P.rot), s = Math.sin(P.rot); return [P.x + lx * c + lz * s, P.z - lx * s + lz * c]; };

// Dozer geometry (world m): the blade's cutting edge is BL ahead of the machine origin
const BL = 3.76 * 1.4, BACK = 3.2;   // blade edge ahead of the origin; how far it backs off the pile between pushes
const LIFT = { carry: 0.16, travel: 0.11, cut: -0.015 };   // blade lift (rad): raised for reverse, approach height, biting

export function createCrew({ field, slot, parts, MSCALE }) {
  // ------------------------------------------------------------------ dozer: one straight push line, pile to pad
  // The line is laid out in SITE.push (sol-terrain.js): tangent to a 15 m circle round the excavator at the pile, so the
  // dozer's body stays clear of it the whole cycle. Origin positions along the line: S (start, backed off), B (blade on the
  // pile), T (blade at the pad edge).
  const K = SITE.push, ux = K.ux, uz = K.uz, yawD = Math.atan2(-uz, ux);
  const S = [K.bx - ux * (BL + BACK), K.bz - uz * (BL + BACK)], B = [K.bx - ux * BL, K.bz - uz * BL], T = [K.tx - ux * BL, K.tz - uz * BL];
  const lenSB = BACK, lenST = BACK + K.len;
  const route = poly([S, T]);
  // legs, kept in the old shape (dir, p) so the zone hull and path lines read them as before
  const VAR = [[{ dir: 1, p: route, t0: 0 }, { dir: -1, p: poly([T, S]), t0: lenST }]]; VAR[0].total = lenST * 2;
  const L = { m: slot.haul, x: S[0], z: S[1], yaw: yawD, s: 0, phase: 'approach', wait: 0.6, carry: 0, t: 0, speed: 0, lift: LIFT.carry, tilt: 0, dist: 0, spill: 0, drive: 0 };
  const pileHit = [K.bx - (K.bx - SITE.E.x) / 15 * 1.6, K.bz - (K.bz - SITE.E.z) / 15 * 1.6];   // inner half of the blade, over the pile's outer flank

  // ------------------------------------------------------------------ compactor lanes on the pad (pad local frame)
  // forward along +x, reverse back stepping over to the next lane. The drum is DRUM ahead of the hitch (the
  // model's origin), the rear axle AXLE behind it.
  const DRUM = 1.55 * MSCALE, AXLE = 1.45 * MSCALE;
  const lanes = [-3.8, -1.9, 0, 1.9, 3.8], D0 = 7.4, D1 = 12.4;   // D0..D1: drum travel (pad local x), far end only
  const R = { m: slot.grade, lane: 0, dirL: 1, pass: 0, d: D0, x: 0, z: 0, yaw: SITE.pad.rot, speed: 0, t: 0, art: 0, drive: 0,
  };
  const rollPath = []; for (let i = 0; i < lanes.length; i++) { const a = padW(D0 - DRUM, lanes[i]), b = padW(D1 - DRUM, lanes[i]); rollPath.push(...(i % 2 ? [b, a] : [a, b])); }

  const ground = (x, z) => field.ground(x, z);
  function seat(M, x, z, yaw, e = 1.8, w = e) {
    const fx = Math.cos(yaw), fz = -Math.sin(yaw);
    const gF = ground(x + fx * e, z + fz * e), gB = ground(x - fx * e, z - fz * e), gR = ground(x - fz * w, z + fx * w), gL = ground(x + fz * w, z - fx * w);
    const r = M.root; r.position.set(x, (gF + gB + gR + gL) / 4 - 0.05, z);
    r.rotation.set(-Math.atan((gR - gL) / (2 * w)) * 0.8, yaw, Math.atan((gF - gB) / (2 * e)) * 0.8);
  }
  function marks(x, z, yaw, half, amt, r = 0.42) {
    const fx = Math.cos(yaw), fz = -Math.sin(yaw);
    field.mark(x - fz * half, z + fx * half, r, amt); field.mark(x + fz * half, z - fx * half, r, amt);
  }
  const approach = (cur, tgt, rate, dt) => cur + clamp(tgt - cur, -rate * dt, rate * dt);

  // dozing cycle: approach (blade comes down onto the pile), push (blade bites, the load boils in front of it, a little spills
  // off the wings), lift (blade up at the pad edge, the load stays), reverse (back to the start), settle
  // along the line toward s1, easing out at the end; returns true on arrival
  function goTo(dt, s1, vmax, acc) {
    const dir = Math.sign(s1 - L.s), rem = Math.abs(s1 - L.s);
    L.speed = Math.min(vmax, Math.abs(L.speed) + dt * acc, Math.sqrt(Math.max(0.02, rem) * 2 * acc) + 0.1);
    const ds = Math.min(rem, L.speed * dt); L.s += dir * ds; L.drive += dir * ds; L.speed *= dir;
    return rem - ds < 0.005;
  }
  function stepDozer(dt, t) {
    if (L.wait > 0) { L.wait -= dt; L.speed = 0; }
    else if (L.phase === 'approach') {
      L.lift = approach(L.lift, L.s > lenSB - 1.6 ? LIFT.cut : LIFT.travel, 0.18, dt);
      if (goTo(dt, lenSB, 1.3, 1.2)) { L.phase = 'push'; L.carry = field.take(pileHit[0], pileHit[1], 3.2, 7) + 1.5; }
    } else if (L.phase === 'push') {
      L.lift = approach(L.lift, LIFT.cut, 0.2, dt); L.tilt = Math.sin(t * 0.9) * 0.025;   // the operator trims the tilt
      if (goTo(dt, lenST, 1.45, 0.8)) { L.phase = 'lift'; L.wait = 0.5; }
      const fx = Math.cos(L.yaw), fz = -Math.sin(L.yaw), bx = L.x + fx * BL, bz = L.z + fz * BL, gy = ground(bx, bz);
      L.spill += dt;
      if (L.spill > 0.4 && L.carry > 0.4) {   // windrows off both wings, and the load rolling in front of the blade
        L.spill = 0; const sx = -fz * 3.6, sz = fx * 3.6, v = Math.min(L.carry * 0.02, 0.08);
        field.raise(bx - fx * 0.6 + sx, bz - fz * 0.6 + sz, 0.9, v); field.raise(bx - fx * 0.6 - sx, bz - fz * 0.6 - sz, 0.9, v); L.carry -= 2 * v;
      }
      if (Math.random() < 0.55) { const q = (Math.random() - 0.5) * 6.2; parts.emit(t, bx + fx * 0.5 - fz * q, gy + 0.3 + Math.random() * 1.2, bz + fz * 0.5 + fx * q, fx * 1.6 + (Math.random() - 0.5), 0.8 + Math.random() * 1.2, fz * 1.6 + (Math.random() - 0.5), 1.0, gy, 1); }
      if (Math.random() < 0.12) parts.emit(t, bx, gy + 0.6, bz, (Math.random() - 0.5) * 0.8, 0.4, (Math.random() - 0.5) * 0.8, 2.4, -99, 0);
    } else if (L.phase === 'lift') {   // drop the load at the pad edge, blade up
      if (L.carry > 0) { const fx = Math.cos(L.yaw), fz = -Math.sin(L.yaw), bx = L.x + fx * (BL + 1.2), bz = L.z + fz * (BL + 1.2); field.raise(bx, bz, 3.0, L.carry); field.relax(bx, bz, 4, 2); L.carry = 0; }
      L.lift = approach(L.lift, LIFT.carry, 0.35, dt); L.tilt = approach(L.tilt, 0, 0.1, dt);
      if (L.lift >= LIFT.carry - 1e-4) { L.phase = 'reverse'; L.wait = 0.4; }
    } else if (L.phase === 'reverse') {
      if (goTo(dt, 0, 2.6, 1.4)) { L.phase = 'approach'; L.wait = 0.8; }
    }
    const p = route.at(L.s); L.x = p.x; L.z = p.z; L.yaw = yawD;
    if (Math.abs(L.speed) > 0.05) marks(L.x, L.z, L.yaw, 1.79, dt * 1.1, 0.55);
    L.t = L.s / lenST;   // path head: where the blade is along the line (out and back)
  }

  // compactor: the hitch runs the lane (straight forward; an S curve onto the next lane while backing, level at both ends so
  // the passes join smoothly). Heading follows the path; the articulation is the path's curvature over the wheelbase,
  // clamped to the machine's +/- 34 degrees and eased, split about the hitch (front one way, rear the other).
  const ART = 0.6, WB = DRUM + AXLE;
  function stepCompactor(dt) {
    const fwd = R.pass === 0, v = fwd ? 2.0 : 1.8, span = D1 - D0, goal = fwd ? D1 : D0, rem = Math.abs(goal - R.d);
    R.speed = Math.min(v, R.speed + dt * 1.2, Math.sqrt(rem * 2 * 1.0) + 0.12);
    const ds = R.speed * dt; R.d += fwd ? ds : -ds;   // R.d: where the drum would be on a straight machine (pad local x)
    const z0 = lanes[R.lane]; let lz = z0, slope = 0, curv = 0;
    if (!fwd) {
      const dz = lanes[clamp(R.lane + R.dirL, 0, lanes.length - 1)] - z0, k = clamp((D1 - R.d) / span, 0, 1);
      lz = z0 + dz * ease(k); slope = -dz * (k < 0.5 ? 4 * k : 4 * (1 - k)) / span; curv = (k < 0.5 ? 4 : -4) * dz / (span * span);
    }
    const tgt = clamp(-curv * WB, -ART, ART); R.art += (tgt - R.art) * (1 - Math.exp(-dt / 0.35));
    const ph = Math.atan(slope), pf = ph - R.art / 2, pr = ph + R.art / 2, hx = R.d - DRUM, P = SITE.pad, c = Math.cos(P.rot), s = Math.sin(P.rot);
    R.x = P.x + hx * c + lz * s; R.z = P.z - hx * s + lz * c;
    R.yaw = P.rot - pr;   // rear frame heading (world); the front frame is at P.rot - pf
    const dlx = hx + Math.cos(pf) * DRUM, dlz = lz + Math.sin(pf) * DRUM, alx = hx - Math.cos(pr) * AXLE, alz = lz - Math.sin(pr) * AXLE;
    const dx = P.x + dlx * c + dlz * s, dz = P.z - dlx * s + dlz * c, axw = P.x + alx * c + alz * s, azw = P.z - alx * s + alz * c;   // drum, rear axle (world)
    field.flatten(dx, dz, 1.7, hD, 0.35 * dt, 0.025 * dt);   // knocks mounds down, barely raises
    if (R.speed > 0.2) { marks(dx, dz, P.rot - pf, 0.9, dt * 0.25); marks(axw, azw, R.yaw, 1.34, dt * 0.2, 0.35); }
    if ((fwd && R.d >= D1) || (!fwd && R.d <= D0)) {
      R.speed = 0;
      if (!fwd) { R.lane += R.dirL; if (R.lane <= 0 || R.lane >= lanes.length - 1) { R.lane = clamp(R.lane, 0, lanes.length - 1); R.dirL *= -1; } }
      R.pass ^= 1;
    }
    const f = clamp((R.d - D0) / span, 0, 1); R.t = (R.lane + (R.lane % 2 ? 1 - f : f)) / lanes.length;   // matches the drawn lanes
    R.drive += (fwd ? 1 : -1) * ds;
  }

  const api = {
    L, R, get legs() { return VAR[0]; }, VAR, total: VAR[0].total, rollPath, lanes,
    roll: { x0: D0 - DRUM, x1: D1 - DRUM, zh: Math.max(...lanes.map(Math.abs)) },
    update(dt, t) {
      stepDozer(dt, t); stepCompactor(dt);
      const D = L.m, C = R.m;
      seat(D, L.x, L.z, L.yaw, 2.4, 1.6); D.setDrive(L.drive / MSCALE);
      if (D.setBlade) D.setBlade(L.lift, L.tilt);
      seat(C, R.x, R.z, R.yaw, 1.8, 1.0); C.setDrive(R.drive / MSCALE);
      if (C.setSteer) C.setSteer(R.art);
    },
    // dozer route as one polyline (blade edge positions, for the path line), t = 0..1 out along it
    paths() { return [{ pts: [[S[0] + ux * BL, S[1] + uz * BL], [T[0] + ux * BL, T[1] + uz * BL]], t0: 0, t1: 1 }]; },
  };
  return api;
}
