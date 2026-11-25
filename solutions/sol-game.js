// sol-game.js: the dig. One excavator on the jobsite, run like a remote operator runs it: the bucket follows targets
// (swing, reach, height, bucket angle) through hydraulic-feeling servos and an IK arm, and the machine can drive (pivot on
// its tracks, travel, leave track marks). Where the teeth go below the ground the edit field is carved and the bucket
// fills; when the bucket opens the load falls as particles and piles up (angle of repose).
// Desktop: draw a dig zone. Each click on the ground places a corner (a live edge follows the cursor); a click on the first
// corner (a snap ring shows), a double-click or Enter closes it, Escape cancels it. Corners can be dragged while drawing.
// Closing the zone hands the machine over: it drives to a working spot clear of the zone, digs it out pass by pass down to
// ZDEPTH below the existing ground (only inside the zone), and dumps each load on the spoil pile (or beside the zone when
// the pile is out of reach). A new zone can be drawn while it works; closing it replaces the old one. Escape with no zone
// in progress stops the dig. A press that moves more than a few px is a drag or a scroll and never places a corner.
// Nobody drawing: an autopilot dig loop from home. It runs on arrival, and takes back over IDLE s after the last input
// once the zone is dug (or the dig was stopped).
// Wheel and vertical touch pan are never captured (no wheel listener, touch-action: pan-y, nothing is ever prevented; a
// corner drag only takes the pointer for a mouse or a pen). Phones: no listeners at all; a demo draws zones by itself
// while the dig view is showing (corners at a human pace, live edge, snap ring), digs each one out like a visitor's zone,
// then fades it, heals the ground back and picks a new spot in the pit (see demoTick).
import { SITE, hF, hD } from './sol-terrain.js';
import { EXC_LIMITS } from './sol-machines.js';

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const wrap = a => Math.atan2(Math.sin(a), Math.cos(a));
export const IDLE = 8;   // s with no input (and the zone dug or stopped) before the autopilot takes back over
const CAP = 1.9;         // bucket capacity, m3
const PEN = 0.6;         // how deep one pass bites, m
const OVER = 0.45;       // how far below grade a visitor's dig may go, m
const PH = { open: -0.5, dig: -0.95, full: -1.95, carry: -2.55, dump: 0.2 };   // absolute bucket angles (model)
// arm geometry (model units, see sol-machines.js): turret at y 1.11, boom pin at (0.95, 1.0) on it, boom 5.7, stick 2.9,
// teeth at (1.38, -1.25) in the bucket frame
const PIN_X = 0.95, PIN_Y = 2.11, BL = 5.7, SL = 2.9, TX = 1.38, TY = -1.25;
const RMIN = 5, RMAX = 11.2, RWORK = 7.6;   // reach band for a target from the turret, and how far from a target it parks, m
const VMAX = 2.2, ACC = 1.3, PIVOT = 0.75;  // travel speed m/s, acceleration m/s2, pivot rate rad/s
const TRACK = 1.79;                         // track centre offset from the machine axis, m
const CLICK_PX = 6;                         // a press that moves further than this is a drag or a scroll, not a click
// the zone
const MAXV = 12;        // corners (the zone closes itself on the last one)
const SNAP_PX = 14;     // a click this close to the first corner closes the zone (the snap ring shows)
const HANDLE_PX = 10;   // grab radius of a corner while drawing (mouse / pen)
const GAP = 1.2;        // m, closest two consecutive corners
const ZEXT = 7.5;       // m, furthest a corner may sit from the first one (a zone stays diggable in about a minute)
const ZAREA = 3;        // m2, smallest zone that counts
const ZDEPTH = 0.8;     // m, a zone is dug this far below the existing ground (or to design grade where that is deeper)
const ZK = 2.4;         // a zone bite fills the bucket to ZK x CAP (game pace)
const ZR = 1.4, ZPEN = 0.75;    // m, carve radius and depth of one pass in a zone
const ZNEAR = RMIN + 1.4, ZFAR = 8.4;   // m, a zone bite's distance from the turret: room for the drag, and low reach
export const ARMK = { PH, PIN_X, PIN_Y, BL, SL, TX, TY, RMIN, RMAX, ZFAR };   // for test/check-arm.mjs
const SMAX = 600;       // sample points that track what is left to dig
// the phone demo
const DEMO = { first: 1.4, corner: [0.6, 0.9], snap: 0.45, cap: 45, hold: 1.2, heal: 2.4, rest: 0.8, depth: 0.5 };
// spots in the pit (pit-local x, z, m) the demo cycles through, each with a little jitter: the south half, between the
// machine and the dig camera, so the zone reads in front of the arm instead of under it
const DSPOT = [[-2.2, -2.6], [0.8, -2.2], [-0.6, -3.0], [1.6, -1.4], [-2.6, -1.2]];

// the arm solver (pure, no THREE): tip target (xr, yr) in the root's xy plane (model m) with absolute bucket angle ph -> a1, a2, a3 and the
// absolute bucket angle actually reached (ph: pe). Joint limits are the hydraulic ones (EXC_LIMITS): a2 is clamped through the law of
// cosines (the wrist stays on the stick's reachable annulus, on its bearing), a1 is clamped, and the bucket angle is clamped to what the
// linkage allows on top of the stick angle; the wrist is then solved again for the angle the bucket really has, so the teeth land on the
// target even when the bucket cannot reach the asked angle.
export function solveArm(xr, yr, ph, o, L = EXC_LIMITS) {
  let pe = ph, a1 = 0, a2 = 0;
  const k0 = Math.cos(L.a2[0]), k1 = Math.cos(L.a2[1]);
  for (let i = 0; i < 4; i++) {
    const c = Math.cos(pe), s = Math.sin(pe), px = xr - (TX * c - TY * s) - PIN_X, py = yr - (TX * s + TY * c) - PIN_Y;
    const c2 = clamp((px * px + py * py - BL * BL - SL * SL) / (2 * BL * SL), k0, k1);
    a2 = -Math.acos(c2); a1 = clamp(Math.atan2(py, px) - Math.atan2(SL * Math.sin(a2), BL + SL * Math.cos(a2)), L.a1[0], L.a1[1]);
    pe = clamp(ph, a1 + a2 + L.a3[0], a1 + a2 + L.a3[1]);
  }
  o.a1 = a1; o.a2 = a2; o.a3 = pe - a1 - a2; o.pe = pe;
  return o;
}

export function createDig({ THREE, exc, field, camera, canvas, interactive, MSCALE, parts, clock }) {
  const E = SITE.E, Z = SITE.digZone, home = { x: E.x, z: E.z, yaw: E.yaw };
  const body = { x: E.x, z: E.z, yaw: E.yaw, speed: 0, dist: 0 };
  const cur = { sw: 0, r: 7, y: 2, ph: PH.carry }, tg = { ...cur };
  const ARM = { a1: 0.2, a2: -1.5, a3: -0.3 };
  const dumpAt = { x: 0, z: 0, on: false };   // where the load lands: fixed when the dump starts
  let load = 0, user = false, everClicked = false, lastInput = -1e9, doneT = -1e9, relaxT = 0;
  const tip = new THREE.Vector3();
  let rootY = 0;
  const ground = (x, z) => field.ground(x, z);
  const along = (sw, r, out) => { const a = body.yaw + sw; out.x = body.x + Math.cos(a) * r; out.z = body.z - Math.sin(a) * r; return out; };
  const tmp = { x: 0, z: 0 }, pk = { x: 0, z: 0 };

  // ------------------------------------------------------------------ zones: the one being drawn, and the one being dug
  // draw: corners so far, the cursor (hov) and whether a click there closes it (snap); ver bumps on every change
  const draw = { n: 0, x: new Float32Array(MAXV), z: new Float32Array(MAXV), hov: false, hx: 0, hz: 0, snap: false, drag: -1, ver: 0 };
  // job: the closed zone, its samples (what is left to dig), the bite in progress; on: drawn + worked, done: nothing left
  const job = { on: false, done: false, demo: false, n: 0, x: new Float32Array(MAXV), z: new Float32Array(MAXV), cx: 0, cz: 0, area: 0, ver: 0, doneT: -9,
    ns: 0, cell: 1, sx: new Float32Array(SMAX), sz: new Float32Array(SMAX), dead: new Uint8Array(SMAX), vol0: 0, bi: -1, lx: 0, lz: 0 };
  function inPoly(X, Z, n, x, z) {
    let c = false;
    for (let i = 0, j = n - 1; i < n; j = i++) if ((Z[i] > z) !== (Z[j] > z) && x < (X[j] - X[i]) * (z - Z[i]) / (Z[j] - Z[i]) + X[i]) c = !c;
    return c;
  }
  function edgeDist(X, Z, n, x, z) {
    let d = 1e9;
    for (let i = 0, j = n - 1; i < n; j = i++) {
      const ax = X[j], az = Z[j], bx = X[i] - ax, bz = Z[i] - az, l = bx * bx + bz * bz, t = l ? clamp(((x - ax) * bx + (z - az) * bz) / l, 0, 1) : 0;
      d = Math.min(d, Math.hypot(x - ax - bx * t, z - az - bz * t));
    }
    return d;
  }
  const inJob = (x, z) => job.n > 2 && inPoly(job.x, job.z, job.n, x, z);
  // a demo zone goes DEMO.depth under the ground it had when it closed (healed back afterwards), so every cycle has work
  const zfloor = (x, z) => (job.demo ? field.kept(x, z) - DEMO.depth : Math.min(hD(x, z), hF(x, z) - ZDEPTH));
  const capNow = () => (op.zone ? CAP * ZK : CAP);

  // where a bite at (sw, r) bottoms out: one pass deep, never under grade (autopilot); in a zone, one zone pass, never under
  // the zone floor, and a skim outside it (only the zone is cut)
  function digY(sw, r) {
    along(sw, r, tmp); const g = ground(tmp.x, tmp.z);
    if (op.zone) return inJob(tmp.x, tmp.z) ? Math.max(g - ZPEN, zfloor(tmp.x, tmp.z) - 0.04) : g - 0.06;
    const gr = hD(tmp.x, tmp.z);
    if (g - gr < 0.1) return gr - 0.02;   // at grade: a trim pass that barely skims
    return Math.max(g - PEN, gr - 0.04);
  }

  // bucket load: a few dirt points that ride in the bucket
  const lp = new Float32Array(90 * 3); for (let k = 0; k < 90; k++) { lp[k * 3] = 0.45 + Math.random() * 0.8; lp[k * 3 + 1] = -0.7 + Math.random() * 0.7; lp[k * 3 + 2] = (Math.random() - 0.5) * 1.0; }
  const loadGeo = new THREE.BufferGeometry(); loadGeo.setAttribute('position', new THREE.BufferAttribute(lp, 3));
  const loadMat = new THREE.PointsMaterial({ size: 0.13, color: 0xe7c9a0, transparent: true, opacity: 0, depthWrite: false });
  const loadPts = new THREE.Points(loadGeo, loadMat); loadPts.renderOrder = 3; exc.bucket.add(loadPts);
  // and a static heap in the bucket mouth (no physics): a low-poly mound on the chord from the hinge to the teeth, crowning
  // past the lip as the load fills, draining as the bucket opens. Fill: the zone fill's material kind (MeshBasic, transparent:
  // the same program); edges: the bucket's own line material (same program, fades with the machine).
  const heap = new THREE.Group(), HL = Math.hypot(1.43, 0.97), HW = 1.0, NU = 7, NW = 5;
  heap.position.set(-0.08, -0.08, 0); heap.rotation.z = Math.atan2(-0.97, 1.43); heap.visible = false; exc.bucket.add(heap);
  { const pos = [], idx = [], edg = [];
    for (let b = 0; b < NW; b++) for (let a = 0; a < NU; a++) {
      const u = a / (NU - 1), w = b / (NW - 1), ru = Math.sin(Math.PI * u), rw = Math.sin(Math.PI * w);
      const h = 0.1 - 0.52 * Math.pow(ru, 0.8) * Math.pow(rw, 0.7) * (0.85 + 0.3 * Math.sin(a * 2.3 + b * 1.7) * ru * rw);   // local -y: out of the mouth
      pos.push((0.06 + 0.88 * u) * HL, h, (w - 0.5) * HW);
    }
    for (let b = 0; b + 1 < NW; b++) for (let a = 0; a + 1 < NU; a++) {
      const k = b * NU + a; idx.push(k, k + 1, k + NU, k + 1, k + NU + 1, k + NU);
      if (b > 0) edg.push(k, k + 1); if (a > 0) edg.push(k, k + NU);
    }
    const hg = new THREE.BufferGeometry(); hg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); hg.setIndex(idx);
    const eg = new THREE.BufferGeometry(); eg.setAttribute('position', hg.attributes.position); eg.setIndex(edg);
    const lineMat = exc.bucket.children.find(o => o.isLineSegments)?.material;
    heap.add(Object.assign(new THREE.Mesh(hg, new THREE.MeshBasicMaterial({ color: 0x9a7452, transparent: true, opacity: 1 })), { renderOrder: 3 }));
    if (lineMat) heap.add(Object.assign(new THREE.LineSegments(eg, lineMat), { renderOrder: 3 }));
    heap.userData.geos = [hg, eg];
  }

  // ------------------------------------------------------------------ reachable ground
  // the excavator's centre stays inside digZone (its working zone); a target is reachable within RMAX - .4 of that zone
  const zc = { x: 0, z: 0 };
  function inZone(x, z, out) {   // nearest point of the zone rectangle
    const c = Math.cos(Z.rot), s = Math.sin(Z.rot), dx = x - Z.x, dz = z - Z.z;
    const lx = clamp(dx * c - dz * s, -Z.hx, Z.hx), lz = clamp(dx * s + dz * c, -Z.hz, Z.hz);
    out.x = Z.x + lx * c + lz * s; out.z = Z.z - lx * s + lz * c; return out;
  }
  // clamp a clicked point to reachable ground; returns true if it had to move
  function reachable(p) {
    inZone(p.x, p.z, zc); const dx = p.x - zc.x, dz = p.z - zc.z, d = Math.hypot(dx, dz), R = RMAX - 0.4;
    if (d <= R) return false;
    p.x = zc.x + dx / d * R; p.z = zc.z + dz / d * R; return true;
  }

  // ------------------------------------------------------------------ ops: one at a time (dig at a spot, or drop at a spot)
  // step: idle | drive | reach | lower | drag | curl | swing | dump | back | empty | home
  const op = { on: false, kind: 'dig', x: 0, z: 0, user: false, zone: false, passes: 0, took: 0 };
  const queued = { on: false, kind: 'dig', x: 0, z: 0 };   // kept for the HUD contract (no queue since the zone)
  const drv = { x: 0, z: 0, rev: false, yaw: 0, final: false, x0: 0, z0: 0 };   // drive goal, reverse, optional final heading
  // markers for the HUD: [0] the bite or the drop in progress. t0: when it was placed (pop), out: when it ended (fade)
  const marks = [{ on: false, kind: 'dig', x: 0, z: 0, t0: -9, out: -9, clamped: false }, { on: false, kind: 'dig', x: 0, z: 0, t0: -9, out: -9, clamped: false }];
  let step = 'idle', stepT = 0, dragR0 = 0;
  function go(s) { step = s; stepT = 0; }
  const mark = (kind, x, z) => Object.assign(marks[0], { on: true, kind, x, z, t0: clock(), out: -9, clamped: false });

  // a working spot for a zone bite: inside digZone, in reach with room for the drag, the machine clear of the zone
  function park(x, z, out) {
    const a0 = Math.atan2(body.z - z, body.x - x), q = pk; let best = 1e9;
    for (const da of [0, 0.35, -0.35, 0.7, -0.7, 1.05, -1.05, 1.4, -1.4, 1.75, -1.75, 2.1, -2.1, 2.6, -2.6, Math.PI])
      for (const r of [RWORK, 6.8, 8.2]) {
        inZone(x + Math.cos(a0 + da) * r, z + Math.sin(a0 + da) * r, q);
        const d = Math.hypot(x - q.x, z - q.z); if (d < ZNEAR || d > ZFAR) continue;
        if (inJob(q.x, q.z) || edgeDist(job.x, job.z, job.n, q.x, q.z) < 3.3) continue;   // 3.3: its half diagonal
        const c = Math.hypot(q.x - body.x, q.z - body.z) + Math.abs(da) * 0.6;
        if (c < best) { best = c; out.x = q.x; out.z = q.z; }
      }
    return best < 1e9;
  }
  // the machine parks RWORK short of the target on the line it is coming from, inside its zone (a zone bite: clear of it)
  function startOp(kind, x, z, isUser, zone = false) {
    op.on = true; op.kind = kind; op.x = x; op.z = z; op.user = isUser; op.zone = zone; op.passes = 0; op.took = 0;
    const dx = x - body.x, dz = z - body.z, d = Math.hypot(dx, dz), zd = zone && kind === 'dig';
    if (d >= (zd ? ZNEAR : RMIN) && d <= (zd ? ZFAR : RMAX) && !(zone && inJob(body.x, body.z))) { go(kind === 'dig' ? 'reach' : 'swing'); return; }
    if (zone && job.n > 2 && park(x, z, tmp)) { driveTo(tmp.x, tmp.z, null); go('drive'); return; }
    const ux = d > 0.01 ? dx / d : Math.cos(body.yaw), uz = d > 0.01 ? dz / d : -Math.sin(body.yaw);
    inZone(x - ux * RWORK, z - uz * RWORK, tmp);
    let wd = Math.hypot(x - tmp.x, z - tmp.z);
    if (wd > RMAX || wd < RMIN) { inZone(x, z, tmp); wd = Math.hypot(x - tmp.x, z - tmp.z); }   // fall back to the nearest zone point
    if (wd < RMIN) { // the target is inside the zone right under it: back off along the approach line
      tmp.x = x - ux * RWORK; tmp.z = z - uz * RWORK; inZone(tmp.x, tmp.z, tmp);
    }
    driveTo(tmp.x, tmp.z, null); go('drive');
  }
  function driveTo(x, z, yaw) {
    drv.x = x; drv.z = z; drv.x0 = body.x; drv.z0 = body.z; drv.final = yaw != null; drv.yaw = yaw ?? 0;
    const want = Math.atan2(-(z - body.z), x - body.x), d = Math.hypot(x - body.x, z - body.z);
    drv.rev = d < 9 && Math.abs(wrap(want - body.yaw)) > 2.0;   // short hops behind it: back up instead of turning round
  }
  // where a visitor's load goes: the spoil pile when it is in reach, else the nearest spot to it that is in reach and clear
  // of the zone
  function dumpSpot(out) {
    const ok = (x, z) => { const d = Math.hypot(x - body.x, z - body.z); return d >= RMIN + 0.5 && d <= RMAX - 0.6 && !(job.n > 2 && (inJob(x, z) || edgeDist(job.x, job.z, job.n, x, z) < 2.2)); };
    const P = SITE.pile, t = clock(), px = P.x + Math.sin(t * 0.37) * 0.8, pz = P.z + Math.sin(t * 0.23) * 0.8;
    if (ok(px, pz)) { out.x = px; out.z = pz; return out; }
    let best = 1e9;
    for (let k = 0; k < 32; k++) for (const r of [8.6, 10]) {
      const a = k / 32 * Math.PI * 2, x = body.x + Math.cos(a) * r, z = body.z + Math.sin(a) * r;
      if (!ok(x, z)) continue; const c = Math.hypot(x - P.x, z - P.z); if (c < best) { best = c; out.x = x; out.z = z; }
    }
    if (best === 1e9) along(SITE.pileSw, SITE.pileR, out);
    return out;
  }
  // next bite of the zone: the sample with the most left to cut, favouring ones in reach from here (no drive) and close to
  // the last bite (it works across the zone instead of hopping). false: nothing left.
  function nextBite(out, noDrive = false) {
    let best = -1e9, bi = -1;
    for (let i = 0; i < job.ns; i++) {
      if (job.dead[i]) continue;
      const x = job.sx[i], z = job.sz[i], rem = ground(x, z) - zfloor(x, z); if (rem < 0.15) continue;
      const dB = Math.hypot(x - body.x, z - body.z), here = dB >= ZNEAR && dB <= ZFAR && !inJob(body.x, body.z);
      if (noDrive && !here) continue;
      const sc = rem + (here ? 0.5 : 0) - Math.hypot(x - job.lx, z - job.lz) * 0.04;
      if (sc > best) { best = sc; bi = i; }
    }
    if (bi < 0) return false;
    job.bi = bi; out.x = job.lx = job.sx[bi]; out.z = job.lz = job.sz[bi]; return true;
  }
  function markDead(i) { const x = job.sx[i], z = job.sz[i]; for (let k = 0; k < job.ns; k++) if (Math.hypot(job.sx[k] - x, job.sz[k] - z) < 1) job.dead[k] = 1; }
  function endOp() {
    op.on = false; doneT = clock();
    if (op.user) marks[0].out = clock();
    if (!user) { go('idle'); return; }
    if (load > CAP * 0.15) { dumpSpot(pick0); mark('drop', pick0.x, pick0.z); startOp('drop', pick0.x, pick0.z, true, op.zone || (job.on && !job.done)); return; }
    if (job.on && !job.done) {
      // the last few % are slivers along the edge: call it dug
      if (zoneStats().k < 0.97 && nextBite(pick0)) { mark('dig', pick0.x, pick0.z); startOp('dig', pick0.x, pick0.z, true, true); return; }
      job.done = true; job.doneT = clock(); job.ver++;
    }
    go('idle');
  }

  // ------------------------------------------------------------------ autopilot: dig a bite in the pit, dump it on the pile
  let prevSw = 0;
  function pickSpot(out) {
    let bs = -1e9, bsw = 0, br = 7.5;
    for (let sw = -0.6; sw <= 0.601; sw += 0.15) for (const r of [7.0, 8.2, 9.4, 10.4]) {
      along(sw, r - 1, tmp); const cut = ground(tmp.x, tmp.z) - hD(tmp.x, tmp.z);
      const s = cut - Math.abs(sw - prevSw) * 0.25 + Math.random() * 0.15;
      if (s > bs) { bs = s; bsw = sw; br = r; }
    }
    if (bs < 0.12) { bsw = (Math.random() - 0.5) * 0.9; br = 7 + Math.random() * 3.2; }   // all at grade: keep trimming
    prevSw = bsw; along(bsw, br - 1.3, out); return out;
  }
  const pick0 = { x: 0, z: 0 };
  function autopilot() {
    const away = Math.hypot(body.x - home.x, body.z - home.z) > 0.3 || Math.abs(wrap(body.yaw - home.yaw)) > 0.04;
    if (away) { driveTo(home.x, home.z, home.yaw); go('home'); return; }
    if (load > CAP * 0.15) {
      const t = clock(); along(SITE.pileSw + Math.sin(t * 0.37) * 0.08, SITE.pileR + Math.sin(t * 0.23) * 0.2, pick0);
      startOp('drop', pick0.x, pick0.z, false);
    } else { pickSpot(pick0); startOp('dig', pick0.x, pick0.z, false); }
  }

  // ------------------------------------------------------------------ drawing a zone (all clicks are already in reach)
  // clamp a corner: into reachable ground, and within ZEXT of the first corner; true if it had to move
  function clampCorner(p, i = draw.n) {
    let c = reachable(p);
    if (i > 0 && draw.n > 0) { const dx = p.x - draw.x[0], dz = p.z - draw.z[0], d = Math.hypot(dx, dz); if (d > ZEXT) { p.x = draw.x[0] + dx / d * ZEXT; p.z = draw.z[0] + dz / d * ZEXT; c = true; } }
    return c;
  }
  function addCorner(x, z) {
    const t = clock(); lastInput = t; everClicked = true;
    if (draw.n && Math.hypot(x - draw.x[draw.n - 1], z - draw.z[draw.n - 1]) < GAP) return;
    if (draw.n > 2 && Math.hypot(x - draw.x[0], z - draw.z[0]) < GAP) { closeZone(); return; }
    draw.x[draw.n] = x; draw.z[draw.n] = z; draw.n++; draw.ver++;
    if (draw.n >= MAXV) closeZone();
  }
  function cancelDraw() { if (!draw.n) return; draw.n = 0; draw.drag = -1; draw.snap = false; draw.ver++; }
  // close the zone being drawn: it becomes the job (replacing any zone in progress) and the machine is handed over
  function closeZone() {
    const n = draw.n; if (n < 3) return false;
    let A = 0, cx = 0, cz = 0, x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9;
    for (let i = 0, j = n - 1; i < n; j = i++) {
      A += draw.x[j] * draw.z[i] - draw.x[i] * draw.z[j]; cx += draw.x[i] / n; cz += draw.z[i] / n;
      x0 = Math.min(x0, draw.x[i]); x1 = Math.max(x1, draw.x[i]); z0 = Math.min(z0, draw.z[i]); z1 = Math.max(z1, draw.z[i]);
    }
    A = Math.abs(A) / 2; draw.snap = false; draw.drag = -1;
    if (A < ZAREA) { cancelDraw(); return false; }   // a sliver: nothing to dig
    job.n = n; job.x.set(draw.x.subarray(0, n)); job.z.set(draw.z.subarray(0, n)); job.cx = cx; job.cz = cz; job.area = A; job.demo = !interactive;
    // samples on a grid, inset from the edges (the bucket's radius keeps the cut inside anyway)
    const cell = Math.max(0.7, Math.sqrt(A / SMAX) * 1.05); job.cell = cell; job.ns = 0; job.dead.fill(0);
    for (let pass = 0; pass < 2 && !job.ns; pass++)
      for (let x = x0 + cell / 2; x < x1; x += cell) for (let z = z0 + cell / 2; z < z1; z += cell) {
        if (job.ns >= SMAX || !inPoly(job.x, job.z, n, x, z) || (!pass && edgeDist(job.x, job.z, n, x, z) < 0.35)) continue;
        job.sx[job.ns] = x; job.sz[job.ns] = z; job.ns++;
      }
    job.vol0 = 0; for (let i = 0; i < job.ns; i++) job.vol0 += Math.max(0, ground(job.sx[i], job.sz[i]) - zfloor(job.sx[i], job.sz[i])) * cell * cell;
    job.on = true; job.done = false; job.lx = body.x; job.lz = body.z; job.ver++;
    draw.n = 0; draw.ver++;
    lastInput = clock(); handOver();
    return true;
  }
  // the machine takes up the new zone: a loaded autopilot empties where it is first; a visitor's bite already on its way
  // is re-aimed; a bite or a drop in progress finishes and the next op comes from the new zone
  function handOver() {
    const was = user; user = true;
    if (!was) {
      queued.on = false; marks[1].on = false;
      if (load > CAP * 0.15) { op.on = true; op.kind = 'dig'; op.user = true; op.zone = false; dumpAt.on = false; go('empty'); return; }
      op.on = false; op.user = true; endOp(); return;
    }
    if (!op.on) { op.user = true; endOp(); return; }
    if (op.kind === 'dig' && load < CAP * 0.05 && (step === 'drive' || step === 'reach')) { op.on = false; op.user = true; endOp(); }
  }
  // Escape while it digs: the zone stops at once (a bite on its way is dropped, a bite in the ground is curled up and dumped)
  function stopJob() {
    if (!job.on || job.done) return; job.done = true; job.doneT = clock(); job.ver++; lastInput = clock();
    if (!op.on || op.kind !== 'dig' || !op.user) return;
    if (load < CAP * 0.15 && (step === 'drive' || step === 'reach' || step === 'lower')) { body.speed = 0; op.on = false; endOp(); }
    else if (step === 'lower' || step === 'drag') go('curl');
  }

  // ------------------------------------------------------------------ the step machine (visitor and autopilot alike)
  const near = (e = 1) => Math.abs(wrap(cur.sw - tg.sw)) < 0.04 * e && Math.abs(cur.r - tg.r) < 0.25 * e && Math.abs(cur.y - tg.y) < 0.25 * e && Math.abs(cur.ph - tg.ph) < 0.12 * e;
  function aimAt(x, z, extra = 0) {
    const dx = x - body.x, dz = z - body.z;
    tg.sw = wrap(Math.atan2(-dz, dx) - body.yaw); tg.r = clamp(Math.hypot(dx, dz) + extra, RMIN, RMAX);
  }
  function tuck() { // arm folded in for travel; keeps a load curled
    tg.sw = Math.abs(cur.sw) < 0.6 || load < CAP * 0.15 ? 0 : cur.sw; tg.r = 6; along(tg.sw, tg.r, tmp); tg.y = ground(tmp.x, tmp.z) + (load > CAP * 0.15 ? 2.9 : 2.4); tg.ph = PH.carry;
  }
  function travel(dt) { // pivot toward the goal, then roll; returns true on arrival (and on the final heading if one was asked)
    const dx = drv.x - body.x, dz = drv.z - body.z, d = Math.hypot(dx, dz);
    if (d > 0.15) {
      let want = Math.atan2(-dz, dx); if (drv.rev) want = wrap(want + Math.PI);
      const dy = wrap(want - body.yaw), turn = clamp(dy, -PIVOT * dt, PIVOT * dt);
      body.yaw = wrap(body.yaw + turn); body.dist += Math.abs(turn) * TRACK * 0.6;
      if (Math.abs(dy) > 0.12) { body.speed = Math.max(0, body.speed - ACC * 2 * dt); }   // pivot on the spot first
      else body.speed = Math.min(VMAX * (drv.rev ? 0.7 : 1), body.speed + ACC * dt, Math.sqrt(2 * ACC * d) + 0.1);
      const m = Math.min(d, body.speed * dt), s = drv.rev ? -1 : 1;
      body.x += Math.cos(body.yaw) * m * s; body.z -= Math.sin(body.yaw) * m * s; body.dist += m * s;
      if (body.speed > 0.05 || Math.abs(turn) > 1e-4) trackMarks(dt);
      return false;
    }
    body.speed = 0;
    if (drv.final) {
      const dy = wrap(drv.yaw - body.yaw); if (Math.abs(dy) > 0.01) { const turn = clamp(dy, -PIVOT * dt, PIVOT * dt); body.yaw = wrap(body.yaw + turn); body.dist += Math.abs(turn) * TRACK * 0.6; trackMarks(dt); return false; }
      body.yaw = drv.yaw;
    }
    return true;
  }
  function trackMarks(dt) {
    const fx = Math.cos(body.yaw), fz = -Math.sin(body.yaw);
    field.mark(body.x - fz * TRACK, body.z + fx * TRACK, 0.5, dt * 1.1); field.mark(body.x + fz * TRACK, body.z - fx * TRACK, 0.5, dt * 1.1);
  }
  function run(dt) {
    stepT += dt;
    const auto = !op.user;
    switch (step) {
      case 'idle':
        if (load > CAP * 0.15) tuck(); else if (stepT > 0.4) { tg.ph = PH.open; }
        break;
      case 'home': tuck(); if (travel(dt)) go('idle'); break;
      case 'drive': tuck(); if (stepT > 0.25 && travel(dt)) go(op.kind === 'dig' ? 'reach' : 'swing'); break;
      case 'reach': {
        aimAt(op.x, op.z, 1.3); along(tg.sw, tg.r, tmp); tg.y = ground(tmp.x, tmp.z) + 1.3; tg.ph = PH.open;
        if ((near(1.5) && stepT > 0.3) || stepT > 4) go('lower'); break;
      }
      case 'lower': tg.y = digY(tg.sw, tg.r); tg.ph = PH.dig; if ((near() && stepT > 0.2) || stepT > 1.2) { dragR0 = tg.r; op.took = 0; go('drag'); } break;
      case 'drag': {
        const k = Math.min(1, stepT / 1.9), cap = capNow();
        tg.r = Math.max(RMIN, dragR0 - 2.6 * k); tg.y = digY(tg.sw, tg.r); tg.ph = PH.dig + (PH.full - PH.dig) * k;
        if (load >= cap * 0.98) go('curl');
        else if (k >= 1) {
          if (op.zone && op.took < 0.04 && job.bi >= 0) markDead(job.bi);   // that spot will not cut: stop trying it
          // a zone bite goes on with the next spot in reach until the bucket is well filled (two more passes at most)
          if (op.zone && !auto && op.passes < 2 && load < cap * 0.6 && job.on && !job.done && nextBite(pick0, true)) { op.passes++; op.x = pick0.x; op.z = pick0.z; mark('dig', op.x, op.z); go('reach'); }
          else go('curl');
        }
        break;
      }
      case 'curl': tg.ph = PH.carry; along(tg.sw, tg.r, tmp); tg.y = Math.max(cur.y, ground(tmp.x, tmp.z) + 2.6); if (stepT > 0.9) endOp(); break;
      case 'swing': {
        aimAt(op.x, op.z); along(tg.sw, tg.r, tmp); tg.y = ground(tmp.x, tmp.z) + 2.6; tg.ph = PH.carry;
        if ((near(2) && stepT > 0.4) || stepT > 4) { dumpAt.x = auto ? tip.x : op.x; dumpAt.z = auto ? tip.z : op.z; dumpAt.on = true; go('dump'); }
        break;
      }
      case 'dump': tg.ph = PH.dump; if ((load <= 0.001 && stepT > 0.7) || stepT > 3) go('back'); break;
      case 'back': tg.ph = PH.open; if (stepT > 0.35) endOp(); break;
      case 'empty': // a visitor took over from a loaded autopilot: open up where it is, then take up the zone
        if (!dumpAt.on) { dumpAt.x = tip.x; dumpAt.z = tip.z; dumpAt.on = true; }
        tg.ph = PH.dump; if ((load <= 0.001 && stepT > 0.5) || stepT > 2.5) endOp();
        break;
    }
  }

  // ------------------------------------------------------------------ servos + IK
  const RATE = { sw: 1.05, r: 5, y: 4.5, ph: 2.6 };
  function servo(dt) {
    for (const k in RATE) {
      const d = k === 'sw' ? wrap(tg[k] - cur[k]) : tg[k] - cur[k], m = RATE[k] * dt;
      cur[k] += clamp(d * Math.min(1, dt * 5), -m, m);
    }
    cur.sw = wrap(cur.sw);
  }
  function ik() {
    // tip target in the turret plane, model units, relative to the root
    solveArm(cur.r / MSCALE, (cur.y - rootY) / MSCALE, cur.ph, ARM);
    exc.setArm(ARM.a1, ARM.a2, ARM.a3, cur.sw);
  }

  // ------------------------------------------------------------------ ground contact: carve, fill, dump
  // the floor under the teeth: in a zone op only the zone is cut (down to its floor); otherwise grade - OVER
  const floorFn = (x, z) => (op.zone ? (inJob(x, z) ? zfloor(x, z) : 1e9) : hD(x, z) - OVER);
  let emitAcc = 0;
  function contact(dt, t) {
    exc.root.updateMatrixWorld(true); exc.tip.getWorldPosition(tip);
    const g = ground(tip.x, tip.z), cap = capNow();
    if (tip.y < g - 0.02 && load < cap && cur.ph < -0.6) {
      const rem = field.lower(tip.x, tip.z, op.zone ? ZR : 0.85, tip.y, floorFn, Math.min(cap - load, cap * dt * 0.8));   // fills over ~1.3 s of drag
      load += rem; op.took += rem; emitAcc += rem * 30 / (op.zone ? ZK : 1);
      while (emitAcc > 1) { // clods spill over the lip, dust puffs off the cut
        emitAcc -= 1; const a = Math.random() * 6.283, sp = 0.6 + Math.random() * 1.4;
        parts.emit(t, tip.x, g + 0.1, tip.z, Math.cos(a) * sp, 1.5 + Math.random() * 2.2, Math.sin(a) * sp, 1.2, g - 0.05, 1);
        if (Math.random() < 0.35) parts.emit(t, tip.x + (Math.random() - 0.5), g + 0.2, tip.z + (Math.random() - 0.5), (Math.random() - 0.5) * 0.6, 0.3, (Math.random() - 0.5) * 0.6, 2.2, -99, 0);
      }
    }
    // the bucket opens: the load pours out under the teeth
    if (cur.ph > -0.75 && load > 0) {
      if (!dumpAt.on) { dumpAt.x = tip.x; dumpAt.z = tip.z; dumpAt.on = true; }
      const dv = Math.min(load, cap * dt * 1.4); load -= dv;
      field.raise(dumpAt.x, dumpAt.z, 1.7, dv); relaxT = 1.2; if (job.demo) demoSpoil(dumpAt.x, dumpAt.z);
      const n = 2 + Math.round(dv * 60);
      for (let i = 0; i < n; i++) parts.emit(t, tip.x + (Math.random() - 0.5) * 1.1, tip.y + Math.random() * 0.4, tip.z + (Math.random() - 0.5) * 1.1, (Math.random() - 0.5) * 1.2, -0.5 - Math.random() * 1.5, (Math.random() - 0.5) * 1.2, 1.6, g + 0.05, 1);
      if (Math.random() < 0.5) parts.emit(t, tip.x, g + 0.3, tip.z, (Math.random() - 0.5) * 0.8, 0.35, (Math.random() - 0.5) * 0.8, 2.6, -99, 0);
    }
    if (load <= 0) dumpAt.on = false;
    if (relaxT > 0) { relaxT -= dt; field.relax(dumpAt.on ? dumpAt.x : tip.x, dumpAt.on ? dumpAt.z : tip.z, 3.2, 2); }
    const f = clamp(load / cap, 0, 1); loadMat.opacity = clamp(f * 1.6, 0, 1); loadPts.scale.setScalar(0.6 + 0.4 * f);
    heap.visible = f > 0.02; if (heap.visible) { const e = Math.sqrt(f); heap.scale.set(0.75 + 0.25 * e, 0.15 + 0.85 * e, 0.8 + 0.2 * e); }
  }

  // ------------------------------------------------------------------ body on the ground
  function seat() {
    const x = body.x, z = body.z, e = 1.8, fx = Math.cos(body.yaw), fz = -Math.sin(body.yaw);
    const gF = ground(x + fx * e, z + fz * e), gB = ground(x - fx * e, z - fz * e), gR = ground(x - fz * e, z + fx * e), gL = ground(x + fz * e, z - fx * e);
    rootY = (gF + gB + gR + gL) / 4 - 0.1;
    const r = exc.root; r.position.set(x, rootY, z); r.rotation.set(-Math.atan((gR - gL) / (2 * e)) * 0.7, body.yaw, Math.atan((gF - gB) / (2 * e)) * 0.7);
    exc.setDrive(body.dist / MSCALE);
  }

  // ------------------------------------------------------------------ the phone demo (no pointer: it draws zones itself)
  // phase: wait (nothing drawn) | draw (corners going down, a cursor gliding along the live edge) | dig (the zone is the
  // machine's job, exactly like a visitor's) | hold (dug: the tag shows 100%) | heal (outline fades, the ground eases back
  // to how it was, spoil beside the zone too) -> wait. A new zone only starts while the dig view is showing.
  let shown = false;
  const demo = { phase: 'wait', t: -DEMO.first + DEMO.rest, n: 0, k: 0, x: new Float32Array(6), z: new Float32Array(6), T: 0.75, spot: Math.floor(Math.random() * DSPOT.length), cycles: 0,
    sp: new Float32Array(24), ns: 0, bx0: 0, bz0: 0, bx1: 0, bz1: 0 };
  // a quad near a pit spot, jittered, every corner clamped into reach (the same clamp as a visitor's click)
  function demoPlan() {
    const P = SITE.pit, c = Math.cos(P.rot), s = Math.sin(P.rot), S = DSPOT[demo.spot = (demo.spot + 1 + (Math.random() < 0.3 ? 1 : 0)) % DSPOT.length];
    const lx = S[0] + (Math.random() - 0.5) * 1.2, lz = S[1] + (Math.random() - 0.5) * 1.2, cx = P.x + lx * c + lz * s, cz = P.z - lx * s + lz * c;
    const hx = 1.9 + Math.random() * 0.6, hz = 1.4 + Math.random() * 0.5, r = (Math.random() - 0.5) * 1.0, rc = Math.cos(r), rs = Math.sin(r);
    const n = 4, rot = Math.floor(Math.random() * 4);   // start on any corner, always the same way round
    for (let i = 0; i < n; i++) {
      const q = (i + rot) % 4, a = q === 0 || q === 3 ? -1 : 1, b = q < 2 ? -1 : 1;
      const ax = a * hx + (Math.random() - 0.5) * 0.7, az = b * hz + (Math.random() - 0.5) * 0.7;
      const p = { x: cx + ax * rc + az * rs, z: cz - ax * rs + az * rc }; reachable(p);
      if (i) { const dx = p.x - demo.x[0], dz = p.z - demo.z[0], d = Math.hypot(dx, dz); if (d > ZEXT) { p.x = demo.x[0] + dx / d * ZEXT; p.z = demo.z[0] + dz / d * ZEXT; } }
      demo.x[i] = p.x; demo.z[i] = p.z;
    }
    demo.n = n; demo.k = 0;
  }
  function demoSpoil(x, z) {   // where a demo load landed (beside the zone when the pile is out of reach): healed afterwards
    if (Math.hypot(x - SITE.pile.x, z - SITE.pile.z) < 4.5) return;   // the pile is the dozer's: it takes it away
    for (let i = 0; i < demo.ns; i++) if (Math.hypot(demo.sp[i * 2] - x, demo.sp[i * 2 + 1] - z) < 1.2) return;
    if (demo.ns < 12) { demo.sp[demo.ns * 2] = x; demo.sp[demo.ns * 2 + 1] = z; demo.ns++; }
  }
  const ease = k => k * k * (3 - 2 * k);
  function demoTick(dt, t) {
    const D = demo; D.t += dt;
    switch (D.phase) {
      case 'wait':
        if (shown && D.t > DEMO.rest) { demoPlan(); D.phase = 'draw'; D.t = 0; D.T = DEMO.corner[0] + Math.random() * (DEMO.corner[1] - DEMO.corner[0]); }
        break;
      case 'draw': {
        if (!shown) { cancelDraw(); D.phase = 'wait'; D.t = 0; break; }   // the tab changed mid-draw: start over when it is back
        const last = D.k >= D.n, nx = last ? D.x[0] : D.x[D.k], nz = last ? D.z[0] : D.z[D.k];
        if (D.k > 0) { // the cursor glides from the last corner to the next (to the first one to close), the live edge with it
          const px = D.x[D.k - 1], pz = D.z[D.k - 1], g = ease(Math.min(1, D.t / ((last ? DEMO.snap + 0.3 : D.T) * 0.8)));
          draw.hx = px + (nx - px) * g; draw.hz = pz + (nz - pz) * g; draw.hov = true; draw.snap = last && g > 0.98; draw.ver++;
        }
        if (last) { if (D.t > DEMO.snap + 0.3 + 0.35) { draw.hov = false; field.keep(); D.ns = 0; if (closeZone()) { D.phase = 'dig'; D.t = 0; } else { D.phase = 'wait'; D.t = 0; } } }
        else if (D.t > D.T) { // the next corner goes down
          const n0 = draw.n; addCorner(nx, nz); D.k++; D.t = 0; D.T = DEMO.corner[0] + Math.random() * (DEMO.corner[1] - DEMO.corner[0]);
          if (job.on && !job.done && !draw.n) { D.phase = 'dig'; D.t = 0; }   // it closed on the first corner by itself
          else if (draw.n === n0) { cancelDraw(); D.phase = 'wait'; }   // a corner refused (too close): try another zone
        }
        break;
      }
      case 'dig':
        if (!job.done && D.t > DEMO.cap) stopJob();   // a zone never drags on: wrap it up
        if (job.done && !op.on) { D.phase = 'hold'; D.t = 0; }
        break;
      case 'hold':
        if (D.t > DEMO.hold) { D.phase = 'heal'; D.t = 0; job.on = false; job.ver++; marks[0].out = Math.min(marks[0].out, t);
          let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9; for (let i = 0; i < job.n; i++) { x0 = Math.min(x0, job.x[i]); x1 = Math.max(x1, job.x[i]); z0 = Math.min(z0, job.z[i]); z1 = Math.max(z1, job.z[i]); }
          D.bx0 = x0; D.bx1 = x1; D.bz0 = z0; D.bz1 = z1; }
        break;
      case 'heal': { // the outline fades while the cut and the spoil ease back (same pace for both)
        const a = 1 - Math.exp(-dt * 2.6);
        field.heal(D.bx0, D.bz0, D.bx1, D.bz1, 2.4, a);
        for (let i = 0; i < D.ns; i++) field.heal(D.sp[i * 2], D.sp[i * 2 + 1], D.sp[i * 2], D.sp[i * 2 + 1], 4.2, a);
        if (D.t > DEMO.heal) { D.phase = 'wait'; D.t = 0; D.cycles++; job.demo = false; }
        break;
      }
    }
  }

  // ------------------------------------------------------------------ pointer (desktop only): click = press + release within CLICK_PX
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), hit = new THREE.Vector3(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), sp = new THREE.Vector3();
  let armed = false, downId = -1, downX = 0, downY = 0, moved = 0, downScroll = 0;
  const P0 = { x: 0, z: 0 };
  // the ground under a screen point, or null when the ray misses it (above the horizon)
  function pick(e) {
    const r = canvas.getBoundingClientRect(); ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera); plane.constant = -rootY;
    let ok = false;
    for (let k = 0; k < 5; k++) { if (!ray.ray.intersectPlane(plane, hit)) break; ok = true; plane.constant = -ground(hit.x, hit.z); }
    return ok && hit.distanceTo(camera.position) < 400 ? hit : null;
  }
  // px between a ground point and the pointer
  function screenD(x, z, e) {
    const r = canvas.getBoundingClientRect(); sp.set(x, ground(x, z), z).project(camera);
    return Math.hypot((sp.x + 1) / 2 * r.width + r.left - e.clientX, (1 - sp.y) / 2 * r.height + r.top - e.clientY);
  }
  // the cursor while drawing: where a click would put the next corner (clamped), and whether it would close the zone
  function hover(e) {
    if (!armed || !draw.n) { if (draw.hov || draw.snap) { draw.hov = draw.snap = false; draw.ver++; } return; }
    const p = draw.drag < 0 && pick(e);
    draw.snap = draw.drag < 0 && draw.n > 2 && screenD(draw.x[0], draw.z[0], e) < SNAP_PX;
    if (p) { P0.x = p.x; P0.z = p.z; clampCorner(P0); draw.hx = P0.x; draw.hz = P0.z; }
    draw.hov = !!p; draw.ver++;
  }
  const onDown = e => {
    if (!armed || e.button !== 0 || !e.isPrimary) return;
    downId = e.pointerId; downX = e.clientX; downY = e.clientY; moved = 0; downScroll = window.scrollY;
    if (draw.n && e.pointerType !== 'touch') { // a corner under a mouse or a pen: grab it (touch never grabs, it scrolls)
      for (let i = 0; i < draw.n; i++) if (screenD(draw.x[i], draw.z[i], e) < HANDLE_PX) { draw.drag = i; try { canvas.setPointerCapture(e.pointerId); } catch (_) { /* fine */ } break; }
    }
  };
  const onMove = e => {
    if (e.pointerId === downId) moved = Math.max(moved, Math.hypot(e.clientX - downX, e.clientY - downY));
    if (draw.drag >= 0 && e.pointerId === downId && moved > CLICK_PX) {
      const p = pick(e);
      if (p) { const i = draw.drag; P0.x = p.x; P0.z = p.z; clampCorner(P0, i); draw.x[i] = P0.x; draw.z[i] = P0.z; draw.ver++; lastInput = clock(); }
    }
    hover(e);
  };
  const onUp = e => {
    if (e.pointerId !== downId) return; downId = -1;
    moved = Math.max(moved, Math.hypot(e.clientX - downX, e.clientY - downY));
    const dragged = draw.drag >= 0 && moved > CLICK_PX; draw.drag = -1;
    if (!armed || dragged || moved > CLICK_PX || Math.abs(window.scrollY - downScroll) > 2) { hover(e); return; }   // a drag or a scroll
    // a click: on the first corner closes the zone; anywhere else on the ground places a corner
    if (draw.n > 2 && screenD(draw.x[0], draw.z[0], e) < SNAP_PX) closeZone();
    else { const p = pick(e); if (p) { P0.x = p.x; P0.z = p.z; clampCorner(P0); addCorner(P0.x, P0.z); } }
    hover(e);
  };
  const onCancel = () => { downId = -1; draw.drag = -1; };
  const onLeave = () => { if (draw.hov || draw.snap) { draw.hov = draw.snap = false; draw.ver++; } };
  const onDbl = () => { if (armed && draw.n > 2) closeZone(); };
  // Escape cancels the zone being drawn, or (with none) stops the dig; Enter closes it. Never prevented, never in a field.
  const onKey = e => {
    if (!armed || e.defaultPrevented || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target?.tagName || '') || e.target?.isContentEditable) return;
    if (e.key === 'Escape') { if (draw.n) cancelDraw(); else stopJob(); }
    else if (e.key === 'Enter' && draw.n > 2) closeZone();
  };
  if (interactive) {
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onCancel);
    canvas.addEventListener('pointerleave', onLeave); canvas.addEventListener('dblclick', onDbl);
    window.addEventListener('keydown', onKey);
  }

  // ------------------------------------------------------------------ per frame
  // what is left to dig in the zone (m3) and the share dug, from the samples (call at a few Hz)
  const zs = { left: 0, dug: 0, k: 0 };
  function zoneStats() {
    let v = 0; for (let i = 0; i < job.ns; i++) v += Math.max(0, ground(job.sx[i], job.sz[i]) - zfloor(job.sx[i], job.sz[i]));
    zs.left = v * job.cell * job.cell; zs.dug = Math.max(0, job.vol0 - zs.left); zs.k = job.vol0 > 0 ? clamp(zs.dug / job.vol0, 0, 1) : 1;
    return zs;
  }
  const api = {
    get tip() { return tip; }, get load() { return load / capNow(); }, get user() { return user; }, get touched() { return everClicked; },
    get step() { return user ? 'user:' + step : step; }, home, body, op, queued, marks, drv, IDLE, RMAX,
    draw, job, zoneStats, MAXV, demo,
    // what the next click does: 'zone' (start a zone) | 'point' (add a corner) | 'close' (a corner, or close on the first)
    // ('' without a pointer)
    get hint() { if (!interactive) return ''; return draw.n ? (draw.n > 2 ? 'close' : 'point') : 'zone'; },
    get drawing() { return draw.n > 0; },
    get driving() { return step === 'drive' || step === 'home'; },
    // armed: the dig view has landed and this is a desktop pointer; the canvas only takes pointer events then.
    // Leaving the dig view drops a zone that was still being drawn (the one being dug carries on).
    setArmed(a) {
      shown = !!a;
      a = !!(a && interactive); if (a === armed) return; armed = a;
      canvas.style.pointerEvents = a ? 'auto' : 'none'; canvas.style.cursor = a ? 'crosshair' : '';
      if (!a) { downId = -1; cancelDraw(); onLeave(); }
    },
    update(dt, t) {
      // back to the autopilot once the zone is dug (or stopped) and nothing has happened for IDLE s
      if (!interactive) demoTick(dt, t);
      else if (user && !op.on && !(job.on && !job.done) && t - Math.max(lastInput, doneT) > IDLE) {
        user = false; marks[0].out = Math.min(marks[0].out, t); if (job.on) { job.on = false; job.ver++; }
      }
      if (!user && !op.on && (step === 'idle')) autopilot();
      run(dt);
      seat(); servo(dt); ik(); contact(dt, t);
    },
    // world points of the arm for shadows and the HUD: boom pin, stick end, teeth
    arm(outPin, outEnd) { exc.boom.getWorldPosition(outPin); exc.bucket.getWorldPosition(outEnd); },
    telemetry(out) {
      out.swing = cur.sw * 180 / Math.PI; out.reach = cur.r; out.grade = tip.y - hD(tip.x, tip.z); out.load = load / capNow(); out.auto = !user || !interactive;   // the phone demo reads Autopilot
      out.ground = tip.y - ground(tip.x, tip.z);
      return out;
    },
    // test hooks: corner(x, z) runs the same path as a click on the ground there (clamp included); close() / cancel() /
    // stop() as the snap click, Escape (drawing) and Escape (digging)
    qa: { cur, tg, get load() { return load; }, set load(v) { load = v; }, get stepName() { return step; }, zfloor,
      corner(x, z) { const p = { x, z }, c = clampCorner(p); addCorner(p.x, p.z); return [p.x, p.z, c]; },
      close: () => closeZone(), cancel: () => cancelDraw(), stop: () => stopJob(),
      forceUser(v) { user = !!v; lastInput = clock(); } },
    dispose() {
      canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onCancel);
      canvas.removeEventListener('pointerleave', onLeave); canvas.removeEventListener('dblclick', onDbl);
      window.removeEventListener('keydown', onKey);
      loadGeo.dispose(); loadMat.dispose(); heap.userData.geos.forEach(g => g.dispose()); heap.children[0].material.dispose();
    },
  };
  // start mid-cycle with a fresh bite so the first frame already has the arm in the pit
  seat(); pickSpot(pick0); startOp('dig', pick0.x, pick0.z, false);
  aimAt(op.x, op.z, 1.3); cur.sw = tg.sw; cur.r = tg.r; along(cur.sw, cur.r, tmp); cur.y = tg.y = ground(tmp.x, tmp.z) + 1.2; cur.ph = tg.ph = PH.open; ik(); go('lower');
  return api;
}
