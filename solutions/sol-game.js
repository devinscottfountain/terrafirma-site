// sol-game.js: the dig. One excavator on the jobsite, run like a remote operator runs it: the bucket follows targets
// (swing, reach, height, bucket angle) through hydraulic-feeling servos and an IK arm, and the machine can drive (pivot on
// its tracks, travel, leave track marks). Where the teeth go below the ground the edit field is carved and the bucket
// fills; when the bucket opens the load falls as particles and piles up (angle of repose).
// Desktop: click the ground to dig there (it drives to a working spot if it has to, swings and digs until the bucket is
// full), click again to drop the load there (drives if out of reach, swings, dumps). Clicks while it is busy retarget the
// move in progress or queue the next one. A press that moves more than a few px is a drag or a scroll and is ignored.
// Nobody clicking: an autopilot dig loop from home. It runs on arrival, and takes back over IDLE s after the last click
// once the machine has nothing left to do.
// Wheel and vertical touch pan are never captured (no wheel listener, touch-action: pan-y, nothing is ever prevented).
// Phones: no listeners at all, the autopilot plays.
import { SITE, hD } from './sol-terrain.js';

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const wrap = a => Math.atan2(Math.sin(a), Math.cos(a));
export const IDLE = 8;   // s with no click (and nothing queued) before the autopilot takes back over
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
  const tmp = { x: 0, z: 0 };
  // where a bite at (sw, r) bottoms out: one pass deep, never under grade (autopilot) or grade - OVER (visitor)
  function digY(sw, r, manual) {
    along(sw, r, tmp); const g = ground(tmp.x, tmp.z), gr = hD(tmp.x, tmp.z);
    if (g - gr < 0.1 && !manual) return gr - 0.02;   // at grade: a trim pass that barely skims
    return Math.max(g - PEN, gr - (manual ? OVER : 0.04));
  }

  // bucket load: a few dirt points that ride in the bucket
  const lp = new Float32Array(90 * 3); for (let k = 0; k < 90; k++) { lp[k * 3] = 0.45 + Math.random() * 0.8; lp[k * 3 + 1] = -0.7 + Math.random() * 0.7; lp[k * 3 + 2] = (Math.random() - 0.5) * 1.0; }
  const loadGeo = new THREE.BufferGeometry(); loadGeo.setAttribute('position', new THREE.BufferAttribute(lp, 3));
  const loadMat = new THREE.PointsMaterial({ size: 0.13, color: 0xe7c9a0, transparent: true, opacity: 0, depthWrite: false });
  const loadPts = new THREE.Points(loadGeo, loadMat); loadPts.renderOrder = 3; exc.bucket.add(loadPts);

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

  // ------------------------------------------------------------------ jobs: one op at a time (dig at a spot, or drop at a spot)
  // step: idle | drive | reach | lower | drag | curl | swing | dump | back | empty | home
  const op = { on: false, kind: 'dig', x: 0, z: 0, user: false, passes: 0 };
  const queued = { on: false, kind: 'dig', x: 0, z: 0 };
  const drv = { x: 0, z: 0, rev: false, yaw: 0, final: false, x0: 0, z0: 0 };   // drive goal, reverse, optional final heading
  // markers for the HUD: [0] the op in progress, [1] the queued one. t0: when it was placed (pop), out: when it ended (fade)
  const marks = [{ on: false, kind: 'dig', x: 0, z: 0, t0: -9, out: -9, clamped: false }, { on: false, kind: 'dig', x: 0, z: 0, t0: -9, out: -9, clamped: false }];
  let step = 'idle', stepT = 0, dragR0 = 0;
  function go(s) { step = s; stepT = 0; }

  // the machine parks RWORK short of the target on the line it is coming from, inside its zone
  function startOp(kind, x, z, isUser) {
    op.on = true; op.kind = kind; op.x = x; op.z = z; op.user = isUser; op.passes = 0;
    const dx = x - body.x, dz = z - body.z, d = Math.hypot(dx, dz);
    if (d >= RMIN && d <= RMAX) { go(kind === 'dig' ? 'reach' : 'swing'); return; }
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
  function endOp() {
    op.on = false; doneT = clock();
    if (op.user) marks[0].out = clock();
    if (queued.on) { // the queued click becomes the next op
      queued.on = false; marks[1].on = false;
      Object.assign(marks[0], { on: true, kind: queued.kind, x: queued.x, z: queued.z, t0: marks[1].t0, out: -9, clamped: marks[1].clamped });
      startOp(queued.kind, queued.x, queued.z, true);
    } else go('idle');
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

  // ------------------------------------------------------------------ a click on the ground (already clamped to reachable)
  function click(x, z, clamped) {
    const t = clock(); lastInput = t; everClicked = true;
    if (!user) { // taking over from the autopilot: whatever it carries is emptied where the bucket is, then the dig starts
      user = true; queued.on = false; marks[1].on = false;
      Object.assign(marks[0], { on: true, kind: 'dig', x, z, t0: t, out: -9, clamped });
      if (load > CAP * 0.15) { op.on = true; op.kind = 'dig'; op.x = x; op.z = z; op.user = true; op.passes = 0; dumpAt.on = false; go('empty'); }
      else startOp('dig', x, z, true);
      return;
    }
    const busyDig = op.on && op.kind === 'dig' && (step === 'empty' || ((step === 'drive' || step === 'reach') && load < CAP * 0.05));
    const busyDrop = op.on && op.kind === 'drop' && (step === 'drive' || step === 'swing');
    if (!op.on) { // ready: dig if the bucket is empty, drop if it carries a load
      const kind = load > CAP * 0.15 ? 'drop' : 'dig';
      Object.assign(marks[0], { on: true, kind, x, z, t0: t, out: -9, clamped }); startOp(kind, x, z, true);
    } else if (busyDig || busyDrop) { // still on its way: retarget the move in progress
      Object.assign(marks[0], { on: true, kind: op.kind, x, z, t0: t, out: -9, clamped });
      if (step === 'empty') { op.x = x; op.z = z; } else startOp(op.kind, x, z, true);
    } else { // working: queue the next move (a newer click replaces an older queued one)
      const kind = op.kind === 'dig' ? 'drop' : 'dig';
      queued.on = true; queued.kind = kind; queued.x = x; queued.z = z;
      Object.assign(marks[1], { on: true, kind, x, z, t0: t, out: -9, clamped });
    }
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
      case 'lower': tg.y = digY(tg.sw, tg.r, !auto); tg.ph = PH.dig; if ((near() && stepT > 0.2) || stepT > 1.2) { dragR0 = tg.r; go('drag'); } break;
      case 'drag': {
        const k = Math.min(1, stepT / 1.9);
        tg.r = Math.max(RMIN, dragR0 - 2.6 * k); tg.y = digY(tg.sw, tg.r, !auto); tg.ph = PH.dig + (PH.full - PH.dig) * k;
        if (load >= CAP * 0.98) go('curl');
        else if (k >= 1) { if (!auto && op.passes < 3) { op.passes++; go('reach'); } else go('curl'); }   // a visitor's dig goes on until the bucket is full
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
      case 'empty': // a visitor took over from a loaded autopilot: open up where it is, then dig
        if (!dumpAt.on) { dumpAt.x = tip.x; dumpAt.z = tip.z; dumpAt.on = true; }
        tg.ph = PH.dump; if ((load <= 0.001 && stepT > 0.5) || stepT > 2.5) startOp('dig', op.x, op.z, true);
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
    const xr = cur.r / MSCALE, yr = (cur.y - rootY) / MSCALE;
    const c = Math.cos(cur.ph), s = Math.sin(cur.ph);
    const px = xr - (TX * c - TY * s) - PIN_X, py = yr - (TX * s + TY * c) - PIN_Y;
    const d = clamp(Math.hypot(px, py), BL - SL + 0.4, BL + SL - 0.05);
    const c2 = clamp((d * d - BL * BL - SL * SL) / (2 * BL * SL), -1, 1);
    let a2 = -Math.acos(c2), a1 = Math.atan2(py, px) - Math.atan2(SL * Math.sin(a2), BL + SL * Math.cos(a2));
    a1 = clamp(a1, -0.95, 1.25); a2 = clamp(a2, -2.8, -0.3);
    ARM.a1 = a1; ARM.a2 = a2; ARM.a3 = clamp(cur.ph - a1 - a2, -2.7, 1.3);
    exc.setArm(ARM.a1, ARM.a2, ARM.a3, cur.sw);
  }

  // ------------------------------------------------------------------ ground contact: carve, fill, dump
  const floorFn = (x, z) => hD(x, z) - OVER;
  let emitAcc = 0;
  function contact(dt, t) {
    exc.root.updateMatrixWorld(true); exc.tip.getWorldPosition(tip);
    const g = ground(tip.x, tip.z);
    if (tip.y < g - 0.02 && load < CAP && cur.ph < -0.6) {
      const rem = field.lower(tip.x, tip.z, 0.85, tip.y, floorFn, Math.min(CAP - load, CAP * dt * 0.8));   // fills over ~1.3 s of drag
      load += rem; emitAcc += rem * 30;
      while (emitAcc > 1) { // clods spill over the lip, dust puffs off the cut
        emitAcc -= 1; const a = Math.random() * 6.283, sp = 0.6 + Math.random() * 1.4;
        parts.emit(t, tip.x, g + 0.1, tip.z, Math.cos(a) * sp, 1.5 + Math.random() * 2.2, Math.sin(a) * sp, 1.2, g - 0.05, 1);
        if (Math.random() < 0.35) parts.emit(t, tip.x + (Math.random() - 0.5), g + 0.2, tip.z + (Math.random() - 0.5), (Math.random() - 0.5) * 0.6, 0.3, (Math.random() - 0.5) * 0.6, 2.2, -99, 0);
      }
    }
    // the bucket opens: the load pours out under the teeth
    if (cur.ph > -0.75 && load > 0) {
      if (!dumpAt.on) { dumpAt.x = tip.x; dumpAt.z = tip.z; dumpAt.on = true; }
      const dv = Math.min(load, CAP * dt * 1.4); load -= dv;
      field.raise(dumpAt.x, dumpAt.z, 1.7, dv); relaxT = 1.2;
      const n = 2 + Math.round(dv * 60);
      for (let i = 0; i < n; i++) parts.emit(t, tip.x + (Math.random() - 0.5) * 1.1, tip.y + Math.random() * 0.4, tip.z + (Math.random() - 0.5) * 1.1, (Math.random() - 0.5) * 1.2, -0.5 - Math.random() * 1.5, (Math.random() - 0.5) * 1.2, 1.6, g + 0.05, 1);
      if (Math.random() < 0.5) parts.emit(t, tip.x, g + 0.3, tip.z, (Math.random() - 0.5) * 0.8, 0.35, (Math.random() - 0.5) * 0.8, 2.6, -99, 0);
    }
    if (load <= 0) dumpAt.on = false;
    if (relaxT > 0) { relaxT -= dt; field.relax(dumpAt.on ? dumpAt.x : tip.x, dumpAt.on ? dumpAt.z : tip.z, 3.2, 2); }
    loadMat.opacity = clamp(load / CAP * 1.6, 0, 1); loadPts.scale.setScalar(0.6 + 0.4 * clamp(load / CAP, 0, 1));
  }

  // ------------------------------------------------------------------ body on the ground
  function seat() {
    const x = body.x, z = body.z, e = 1.8, fx = Math.cos(body.yaw), fz = -Math.sin(body.yaw);
    const gF = ground(x + fx * e, z + fz * e), gB = ground(x - fx * e, z - fz * e), gR = ground(x - fz * e, z + fx * e), gL = ground(x + fz * e, z - fx * e);
    rootY = (gF + gB + gR + gL) / 4 - 0.1;
    const r = exc.root; r.position.set(x, rootY, z); r.rotation.set(-Math.atan((gR - gL) / (2 * e)) * 0.7, body.yaw, Math.atan((gF - gB) / (2 * e)) * 0.7);
    exc.setDrive(body.dist / MSCALE);
  }

  // ------------------------------------------------------------------ pointer (desktop only): click = press + release within CLICK_PX
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), hit = new THREE.Vector3(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  let armed = false, downId = -1, downX = 0, downY = 0, moved = 0, downScroll = 0;
  // the ground under a screen point; a ray that misses (above the horizon) runs out along its heading
  function pick(e) {
    const r = canvas.getBoundingClientRect(); ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera); plane.constant = -rootY;
    let ok = false;
    for (let k = 0; k < 5; k++) { if (!ray.ray.intersectPlane(plane, hit)) break; ok = true; plane.constant = -ground(hit.x, hit.z); }
    if (!ok) { const d = ray.ray.direction, l = Math.hypot(d.x, d.z) || 1; hit.set(camera.position.x + d.x / l * 80, 0, camera.position.z + d.z / l * 80); }
    return hit;
  }
  const onDown = e => {
    if (!armed || e.button !== 0 || !e.isPrimary) return;
    downId = e.pointerId; downX = e.clientX; downY = e.clientY; moved = 0; downScroll = window.scrollY;
  };
  const onMove = e => { if (e.pointerId === downId) moved = Math.max(moved, Math.hypot(e.clientX - downX, e.clientY - downY)); };
  const onUp = e => {
    if (e.pointerId !== downId) return; downId = -1;
    moved = Math.max(moved, Math.hypot(e.clientX - downX, e.clientY - downY));
    if (!armed || moved > CLICK_PX || Math.abs(window.scrollY - downScroll) > 2) return;   // a drag or a scroll
    const p = pick(e), c = reachable(p); click(p.x, p.z, c);
  };
  const onCancel = () => { downId = -1; };
  if (interactive) {
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onCancel);
  }

  // ------------------------------------------------------------------ per frame
  const api = {
    get tip() { return tip; }, get load() { return load / CAP; }, get user() { return user; }, get touched() { return everClicked; },
    get step() { return user ? 'user:' + step : step; }, home, body, op, queued, marks, drv, IDLE, RMAX,
    // what the hint should say: 'dig' | 'drop' | '' (busy, or no pointer)
    get hint() { if (!interactive) return ''; if (!user) return 'dig'; return op.on || queued.on ? '' : load > CAP * 0.15 ? 'drop' : 'dig'; },
    get driving() { return step === 'drive' || step === 'home'; },
    // armed: the dig view has landed and this is a desktop pointer; the canvas only takes pointer events then
    setArmed(a) {
      a = !!(a && interactive); if (a === armed) return; armed = a;
      canvas.style.pointerEvents = a ? 'auto' : 'none'; canvas.style.cursor = a ? 'crosshair' : '';
      if (!a) downId = -1;
    },
    update(dt, t) {
      if (user && !op.on && !queued.on && t - Math.max(lastInput, doneT) > IDLE) { user = false; marks[0].out = Math.min(marks[0].out, t); }   // back to the autopilot
      if (!user && !op.on && (step === 'idle')) autopilot();
      run(dt);
      seat(); servo(dt); ik(); contact(dt, t);
    },
    // world points of the arm for shadows and the HUD: boom pin, stick end, teeth
    arm(outPin, outEnd) { exc.boom.getWorldPosition(outPin); exc.bucket.getWorldPosition(outEnd); },
    telemetry(out) {
      out.swing = cur.sw * 180 / Math.PI; out.reach = cur.r; out.grade = tip.y - hD(tip.x, tip.z); out.load = load / CAP; out.auto = !user;
      out.ground = tip.y - ground(tip.x, tip.z);
      return out;
    },
    // test hooks: click(x, z) runs the same path as a real click (clamp included)
    qa: { cur, tg, get load() { return load; }, set load(v) { load = v; }, get stepName() { return step; },
      click(x, z) { const p = { x, z }, c = reachable(p); click(p.x, p.z, c); return [p.x, p.z, c]; },
      forceUser(v) { user = !!v; lastInput = clock(); } },
    dispose() {
      canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onCancel);
      loadGeo.dispose(); loadMat.dispose();
    },
  };
  // start mid-cycle with a fresh bite so the first frame already has the arm in the pit
  seat(); pickSpot(pick0); startOp('dig', pick0.x, pick0.z, false);
  aimAt(op.x, op.z, 1.3); cur.sw = tg.sw; cur.r = tg.r; along(cur.sw, cur.r, tmp); cur.y = tg.y = ground(tmp.x, tmp.z) + 1.2; cur.ph = tg.ph = PH.open; ik(); go('lower');
  return api;
}
