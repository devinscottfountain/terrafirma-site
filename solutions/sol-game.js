// sol-game.js: the dig. One excavator on the jobsite, driven like a remote operator drives it: the bucket follows targets
// (swing, reach, height, bucket angle) through hydraulic-feeling servos and an IK arm. Where the teeth go below the ground
// the edit field is carved and the bucket fills; when the bucket opens the load falls as particles and piles up (angle of
// repose). Nobody touching it: an autopilot dig loop (reach, lower, drag in, curl, swing, dump). Desktop: press and drag
// on the canvas to dig where the pointer is, release to curl; press and drag again to carry, release to dump. Any drag
// takes over smoothly (same servos), the autopilot resumes a few seconds after the last touch.
// Wheel and vertical touch pan are never captured (no wheel listener, touch-action: pan-y). Phones: no listeners at all.
import { SITE, hD } from './sol-terrain.js';

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const IDLE = 4;          // s without a touch before the autopilot takes back over
const CAP = 1.9;         // bucket capacity, m3
const PEN = 0.6;         // how deep one pass bites, m
const OVER = 0.45;       // how far below grade a manual dig may go, m
const PH = { open: -0.5, dig: -0.95, full: -1.95, carry: -2.55, dump: 0.2 };   // absolute bucket angles (model)
// arm geometry (model units, see sol-machines.js): turret at y 1.11, boom pin at (0.95, 1.0) on it, boom 5.7, stick 2.9,
// teeth at (1.38, -1.25) in the bucket frame
const PIN_X = 0.95, PIN_Y = 2.11, BL = 5.7, SL = 2.9, TX = 1.38, TY = -1.25;

export function createDig({ THREE, exc, field, camera, canvas, interactive, MSCALE, parts, clock }) {
  const E = SITE.E, home = { x: E.x, z: E.z };
  const cur = { sw: 0, r: 7, y: 2, ph: PH.carry }, tg = { ...cur };
  const ARM = { a1: 0.2, a2: -1.5, a3: -0.3 };
  const dumpAt = { x: 0, z: 0, on: false };   // where the load lands: fixed when the dump starts, so it piles where you let go
  let load = 0, user = false, dragging = false, carryDrag = false, lastTouch = -1e9, touched = false, dumping = 0, relaxT = 0;
  const tip = new THREE.Vector3();
  let rootY = 0, bodyPitch = 0, bodyRoll = 0;
  const ground = (x, z) => field.ground(x, z);
  const along = (sw, r, out) => { const a = E.yaw + sw; out.x = E.x + Math.cos(a) * r; out.z = E.z - Math.sin(a) * r; return out; };
  const tmp = { x: 0, z: 0 };
  // where a bite at (sw, r) bottoms out: one pass deep, never under grade (autopilot) or grade - OVER (manual)
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

  // ------------------------------------------------------------------ autopilot (a small step machine on the same targets)
  let step = 'reach', stepT = 0, spot = { sw: 0, r: 7.5 }, prevSw = 0, dragR0 = 0;
  function pickSpot() {
    let best = null, bs = -1e9;
    for (let sw = -0.6; sw <= 0.601; sw += 0.15) for (const r of [7.0, 8.2, 9.4, 10.6]) {
      along(sw, r - 1, tmp); const cut = ground(tmp.x, tmp.z) - hD(tmp.x, tmp.z);
      const s = cut - Math.abs(sw - prevSw) * 0.25 + Math.random() * 0.15;
      if (s > bs) { bs = s; best = { sw, r }; }
    }
    if (bs < 0.12) best = { sw: (Math.random() - 0.5) * 0.9, r: 7 + Math.random() * 3.2 };   // all at grade: keep trimming
    prevSw = best.sw; return best;
  }
  const near = (e = 1) => Math.abs(cur.sw - tg.sw) < 0.04 * e && Math.abs(cur.r - tg.r) < 0.25 * e && Math.abs(cur.y - tg.y) < 0.25 * e && Math.abs(cur.ph - tg.ph) < 0.12 * e;
  function go(s) { step = s; stepT = 0; if (s === 'reach') spot = pickSpot(); }
  function auto(dt) {
    stepT += dt;
    switch (step) {
      case 'reach': {
        tg.sw = spot.sw; tg.r = spot.r + 1.3; along(tg.sw, tg.r, tmp); tg.y = ground(tmp.x, tmp.z) + 1.3; tg.ph = PH.open;
        if ((near(1.5) && stepT > 0.3) || stepT > 3.5) go('lower'); break;
      }
      case 'lower': tg.y = digY(tg.sw, tg.r); tg.ph = PH.dig; if ((near() && stepT > 0.2) || stepT > 1.2) { dragR0 = tg.r; go('drag'); } break;
      case 'drag': {
        const k = Math.min(1, stepT / 1.9);
        tg.r = dragR0 - Math.min(3.2, dragR0 - 5.2) * k; tg.y = digY(tg.sw, tg.r); tg.ph = PH.dig + (PH.full - PH.dig) * k;
        if (k >= 1 || load >= CAP) go('curl'); break;
      }
      case 'curl': tg.ph = PH.carry; along(tg.sw, tg.r, tmp); tg.y = Math.max(cur.y, ground(tmp.x, tmp.z) + 2.6); if (stepT > 0.9) go('swing'); break;
      case 'swing': {
        tg.sw = SITE.pileSw + Math.sin(clock() * 0.37) * 0.08; tg.r = SITE.pileR + Math.sin(clock() * 0.23) * 0.6;
        along(tg.sw, tg.r, tmp); tg.y = ground(tmp.x, tmp.z) + 2.6; tg.ph = PH.carry;
        if ((near(2) && stepT > 0.4) || stepT > 3.5) go('dump'); break;
      }
      case 'dump': if (stepT === dt) { dumpAt.x = tip.x; dumpAt.z = tip.z; dumpAt.on = true; } tg.ph = PH.dump; if ((load <= 0.001 && stepT > 0.7) || stepT > 3) go('back'); break;
      case 'back': tg.ph = PH.open; if (stepT > 0.35) go('reach'); break;
    }
  }
  // the autopilot picks up from wherever the user left the arm
  function resume() { go(load > CAP * 0.15 ? 'swing' : 'reach'); }

  // ------------------------------------------------------------------ servos + IK
  const RATE = { sw: 1.05, r: 5, y: 4.5, ph: 2.6 };
  function servo(dt) {
    for (const k in RATE) { const d = tg[k] - cur[k], m = RATE[k] * dt; cur[k] += clamp(d * Math.min(1, dt * 5), -m, m); }
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
      const dv = Math.min(load, CAP * dt * 1.4); load -= dv; dumping = 0.8;
      field.raise(dumpAt.x, dumpAt.z, 1.7, dv); relaxT = 1.2;
      const n = 2 + Math.round(dv * 60);
      for (let i = 0; i < n; i++) parts.emit(t, tip.x + (Math.random() - 0.5) * 1.1, tip.y + Math.random() * 0.4, tip.z + (Math.random() - 0.5) * 1.1, (Math.random() - 0.5) * 1.2, -0.5 - Math.random() * 1.5, (Math.random() - 0.5) * 1.2, 1.6, g + 0.05, 1);
      if (Math.random() < 0.5) parts.emit(t, tip.x, g + 0.3, tip.z, (Math.random() - 0.5) * 0.8, 0.35, (Math.random() - 0.5) * 0.8, 2.6, -99, 0);
    }
    if (load <= 0) dumpAt.on = false;
    if (relaxT > 0) { relaxT -= dt; field.relax(dumpAt.on ? dumpAt.x : tip.x, dumpAt.on ? dumpAt.z : tip.z, 3.2, 2); }
    dumping = Math.max(0, dumping - dt);
    loadMat.opacity = clamp(load / CAP * 1.6, 0, 1); loadPts.scale.setScalar(0.6 + 0.4 * clamp(load / CAP, 0, 1));
  }

  function spill(t) {
    const g = ground(tip.x, tip.z); field.raise(tip.x, tip.z, 1.7, load); relaxT = 1.2;
    for (let i = 0; i < 40; i++) parts.emit(t, tip.x + (Math.random() - 0.5) * 1.1, tip.y, tip.z + (Math.random() - 0.5) * 1.1, (Math.random() - 0.5) * 1.4, -Math.random() * 1.5, (Math.random() - 0.5) * 1.4, 1.5, g + 0.05, 1);
    load = 0;
  }

  // ------------------------------------------------------------------ body on the ground (it stays home; tracks never move)
  function seat() {
    const x = home.x, z = home.z, e = 1.8, fx = Math.cos(E.yaw), fz = -Math.sin(E.yaw);
    const gF = ground(x + fx * e, z + fz * e), gB = ground(x - fx * e, z - fz * e), gR = ground(x - fz * e, z + fx * e), gL = ground(x + fz * e, z - fx * e);
    rootY = (gF + gB + gR + gL) / 4 - 0.1;
    bodyPitch = Math.atan((gF - gB) / (2 * e)) * 0.7; bodyRoll = Math.atan((gR - gL) / (2 * e)) * 0.7;
    const r = exc.root; r.position.set(x, rootY, z); r.rotation.set(-bodyRoll, E.yaw, bodyPitch);
  }

  // ------------------------------------------------------------------ pointer (desktop only)
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), hit = new THREE.Vector3(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  let armed = false, hintGone = false;
  function pick(e) {
    const r = canvas.getBoundingClientRect(); ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera); plane.constant = -rootY;
    for (let k = 0; k < 5; k++) { if (!ray.ray.intersectPlane(plane, hit)) return null; plane.constant = -ground(hit.x, hit.z); }
    return hit;
  }
  function aimAt(p) {
    const dx = p.x - E.x, dz = p.z - E.z;
    let sw = Math.atan2(-dz, dx) - E.yaw; sw = Math.atan2(Math.sin(sw), Math.cos(sw));
    tg.sw = clamp(sw, -2.2, 2.2); tg.r = clamp(Math.hypot(dx, dz), 4.6, 11.2);
  }
  function drive() {
    if (carryDrag) { along(tg.sw, tg.r, tmp); tg.y = ground(tmp.x, tmp.z) + 2.6; tg.ph = PH.carry; return; }
    if (load >= CAP * 0.98) { carryDrag = true; return drive(); }   // full: it curls on its own
    tg.y = digY(tg.sw, tg.r, true); tg.ph = PH.dig + (PH.full - PH.dig) * clamp(load / CAP, 0, 1);
  }
  const onDown = e => {
    if (!armed || e.button !== 0 || e.pointerType === 'touch') return;
    const p = pick(e); if (!p) return;
    // taking over from the autopilot always starts a dig: whatever it was carrying drops where the bucket is
    if (!user && load > 0) spill(clock());
    dragging = true; user = true; touched = true; lastTouch = clock(); carryDrag = load > CAP * 0.15;
    try { canvas.setPointerCapture(e.pointerId); } catch (_) { /* fine */ }
    aimAt(p); drive(); canvas.style.cursor = 'grabbing';
  };
  const onMove = e => {
    if (!dragging) return; lastTouch = clock(); hintGone = true;
    const p = pick(e); if (p) { aimAt(p); drive(); }
  };
  const onUp = () => {
    if (!dragging) return; dragging = false; lastTouch = clock(); canvas.style.cursor = armed ? 'grab' : '';
    if (carryDrag) { tg.ph = PH.dump; carryDrag = false; dumpAt.x = tip.x; dumpAt.z = tip.z; dumpAt.on = true; return; }   // release a load: it lands right here
    along(tg.sw, tg.r, tmp); tg.y = ground(tmp.x, tmp.z) + 2.6; tg.ph = load > CAP * 0.15 ? PH.carry : PH.open;   // release a dig: curl, lift
  };
  if (interactive) {
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp); canvas.addEventListener('lostpointercapture', onUp);
  }

  // ------------------------------------------------------------------ per frame
  const api = {
    get tip() { return tip; }, get load() { return load / CAP; }, get user() { return user; }, get dragging() { return dragging; },
    get touched() { return touched; }, get hintGone() { return hintGone; }, get step() { return user ? 'user' : step; }, home,
    // armed: the dig view has landed and this is a desktop pointer; the canvas only takes pointer events then
    setArmed(a) {
      a = !!(a && interactive); if (a === armed) return; armed = a;
      canvas.style.pointerEvents = a ? 'auto' : 'none'; canvas.style.cursor = a ? 'grab' : '';
      if (!a && dragging) onUp();
    },
    update(dt, t) {
      if (user && !dragging && load <= 0.001 && tg.ph > -0.6 && t - lastTouch > 0.6) tg.ph = PH.open;   // emptied: close up again
      if (user && !dragging && t - lastTouch > IDLE) { user = false; resume(); }
      if (!user) auto(dt);
      seat(); servo(dt); ik(); contact(dt, t);
    },
    // world points of the arm for shadows and the HUD: boom pin, stick end, teeth
    arm(outPin, outEnd) { exc.boom.getWorldPosition(outPin); exc.bucket.getWorldPosition(outEnd); },
    telemetry(out) {
      out.swing = cur.sw * 180 / Math.PI; out.reach = cur.r; out.grade = tip.y - hD(tip.x, tip.z); out.load = load / CAP; out.auto = !user;
      out.ground = tip.y - ground(tip.x, tip.z);
      return out;
    },
    // test hooks
    qa: { cur, tg, get load() { return load; }, set load(v) { load = v; }, forceUser(v) { user = !!v; lastTouch = clock(); } },
    dispose() {
      canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); canvas.removeEventListener('lostpointercapture', onUp);
      loadGeo.dispose(); loadMat.dispose();
    },
  };
  // start mid-cycle with a fresh bite so the first frame already has the arm in the pit
  seat(); spot = pickSpot(); cur.sw = tg.sw = spot.sw; cur.r = tg.r = spot.r + 1.3; along(cur.sw, cur.r, tmp); cur.y = tg.y = ground(tmp.x, tmp.z) + 1.2; cur.ph = tg.ph = PH.open; ik(); go('lower');
  return api;
}
