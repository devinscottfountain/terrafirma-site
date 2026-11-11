// sol-game.js: the "little game" for Mission Control. Click the lidar terrain to drop zone
// vertices (drag a handle to move it); a live edge follows the cursor and a snap ring shows on the first point
// when it will close the zone (click it, or double-click). The excavator turns, drives into reach and digs:
// zone points sink, the spoil pile grows where it dumps. Runs a demo dig on its own until someone plays.
// Pointer input is armed once control is the target mode; clicks made while the camera is still tilting in are
// queued and replayed when it lands (`active`). Wheel is never captured. The framing is locked while in control:
// the camera never chases the machine. reset() returns everything to a fresh demo (called when control is left).
// on(fn) reports user actions: { type: 'point' | 'close' | 'dig' | 'done', points }.

const clamp01 = v => (v < 0 ? 0 : v > 1 ? 1 : v);
const io2 = t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const in2 = t => t * t, out2 = t => 1 - (1 - t) * (1 - t);
const io3 = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const MAXV = 16, SEG = 20;

export function createGame({ THREE, scene, canvas, camera, exc, grid, hField, MSCALE, mkLine, mkHandles, segBuffers }) {
  const { NX, NZ, SP, X0, Z0, gx, gz, aCut, aZone, cutAttr, zoneAttr } = grid;
  const HOME = { x: -4, z: 4 };
  const pos = { x: HOME.x, z: HOME.z }; let yaw = 0.35;
  const ARM = { a1: 0.22, a2: -1.5, a3: -0.35, sw: 0 }, REST = { a1: 0.22, a2: -1.5, a3: -0.35, sw: 0 }; // rest: bucket low
  const DIG = { a1: -0.12, a2: -1.0, a3: 0.25 };
  let amp = 1, speed = 0, state = 'IDLE', active = false, armed = false, vis = 0;
  let spd = 0, lastX = HOME.x, lastZ = HOME.z, lastYaw = yaw; // telemetry speed, from the machine's real motion
  const focus = new THREE.Vector3(HOME.x + 5, 0, HOME.z - 1), focusGoal = focus.clone();

  // reach: distance from machine origin to the teeth in dig pose
  exc.setArm(DIG.a1, DIG.a2, DIG.a3, 0); exc.root.position.set(0, 0, 0); exc.root.rotation.set(0, 0, 0); exc.root.updateMatrixWorld(true);
  const tv = new THREE.Vector3(); exc.tip.getWorldPosition(tv); const REACH = tv.x;
  exc.setArm(REST.a1, REST.a2, REST.a3, 0);

  // bucket load: a few dirt points that ride in the bucket
  const lp = new Float32Array(120 * 3); for (let k = 0; k < 120; k++) { lp[k * 3] = 0.45 + Math.random() * 0.8; lp[k * 3 + 1] = -0.7 + Math.random() * 0.75; lp[k * 3 + 2] = (Math.random() - 0.5) * 1.0; }
  const loadGeo = new THREE.BufferGeometry(); loadGeo.setAttribute('position', new THREE.BufferAttribute(lp, 3));
  const loadMat = new THREE.PointsMaterial({ size: 0.12, color: 0xd9f2ff, transparent: true, opacity: 0, depthWrite: false });
  const load = new THREE.Points(loadGeo, loadMat); load.renderOrder = 3; exc.bucket.add(load);

  // ------------------------------------------------------------------ zone visuals (preallocated)
  // edges: 1 px cyan screen-space quads draped on the terrain; handles: 6 px cyan dots (+ snap ring); fill .35
  const vx = new Float32Array(MAXV), vz = new Float32Array(MAXV); let nv = 0, closed = false;
  const lineMat = mkLine(0x97ddfb, 1), handleMat = mkHandles(0x6cc0e6, 6, { round: true, ring: 14, depthTest: false });
  const fillMat = new THREE.MeshBasicMaterial({ color: 0x6cc0e6, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide });
  const ZS = segBuffers(THREE, (MAXV + 1) * SEG, 3);
  const zLine = new THREE.Mesh(ZS.geo, lineMat); zLine.frustumCulled = false; zLine.renderOrder = 5; ZS.geo.setDrawRange(0, 0);
  const hp = new Float32Array((MAXV + 1) * 3), hk = new Float32Array(MAXV + 1), hGeo = new THREE.BufferGeometry();
  hGeo.setAttribute('position', new THREE.BufferAttribute(hp, 3).setUsage(THREE.DynamicDrawUsage));
  hGeo.setAttribute('aKind', new THREE.BufferAttribute(hk, 1).setUsage(THREE.DynamicDrawUsage)); hGeo.setDrawRange(0, 0);
  const handles = new THREE.Points(hGeo, handleMat); handles.frustumCulled = false; handles.renderOrder = 6;
  let fill = null;
  const grp = new THREE.Group(); grp.add(zLine, handles); scene.add(grp);
  const fns = [], emit = (type) => { const e = { type, points: nv }; for (const f of fns.slice()) f(e); };
  const api = { focus, home: HOME, blocked: null, zoneVis: 0, fillVis: 0, on(fn) { fns.push(fn); return () => { const k = fns.indexOf(fn); if (k >= 0) fns.splice(k, 1); }; } };
  let fillA = 0, fillTarget = 0;
  let hov = null, snap = false; // cursor on the terrain while placing; snap: it would close the zone

  const Y = (x, z) => hField(x, z) * amp + 0.18;
  const writeZone = () => {
    let n = 0;
    const seg = (ax, az, bx, bz) => {
      for (let k = 0; k < SEG; k++) {
        const f0 = k / SEG, f1 = (k + 1) / SEG, x0 = ax + (bx - ax) * f0, z0 = az + (bz - az) * f0, x1 = ax + (bx - ax) * f1, z1 = az + (bz - az) * f1;
        const y0 = Y(x0, z0), y1 = Y(x1, z1), v = n * 12;
        ZS.pos[v] = x0; ZS.pos[v + 1] = y0; ZS.pos[v + 2] = z0; ZS.pos[v + 3] = x0; ZS.pos[v + 4] = y0; ZS.pos[v + 5] = z0;
        ZS.pos[v + 6] = x1; ZS.pos[v + 7] = y1; ZS.pos[v + 8] = z1; ZS.pos[v + 9] = x1; ZS.pos[v + 10] = y1; ZS.pos[v + 11] = z1;
        ZS.oth[v] = x1; ZS.oth[v + 1] = y1; ZS.oth[v + 2] = z1; ZS.oth[v + 3] = x1; ZS.oth[v + 4] = y1; ZS.oth[v + 5] = z1;
        ZS.oth[v + 6] = x0; ZS.oth[v + 7] = y0; ZS.oth[v + 8] = z0; ZS.oth[v + 9] = x0; ZS.oth[v + 10] = y0; ZS.oth[v + 11] = z0;
        n++;
      }
    };
    for (let i = 0; i + 1 < nv; i++) seg(vx[i], vz[i], vx[i + 1], vz[i + 1]);
    if (closed && nv > 2) seg(vx[nv - 1], vz[nv - 1], vx[0], vz[0]);
    else if (nv && hov && active) seg(vx[nv - 1], vz[nv - 1], snap ? vx[0] : hov.x, snap ? vz[0] : hov.z); // live edge to the cursor
    ZS.geo.setDrawRange(0, n * 6); ZS.geo.attributes.position.needsUpdate = true; ZS.geo.attributes.aOther.needsUpdate = true;
    for (let i = 0; i < nv; i++) { hp[i * 3] = vx[i]; hp[i * 3 + 1] = Y(vx[i], vz[i]); hp[i * 3 + 2] = vz[i]; hk[i] = 0; }
    let nh = nv;
    if (snap && !closed && nv > 2) { hp[nh * 3] = vx[0]; hp[nh * 3 + 1] = Y(vx[0], vz[0]); hp[nh * 3 + 2] = vz[0]; hk[nh] = 1; nh++; }
    hGeo.setDrawRange(0, nh); hGeo.attributes.position.needsUpdate = true; hGeo.attributes.aKind.needsUpdate = true;
  };

  const inPoly = (x, z) => { let c = false; for (let i = 0, j = nv - 1; i < nv; j = i++) { if ((vz[i] > z) !== (vz[j] > z) && x < ((vx[j] - vx[i]) * (z - vz[i])) / (vz[j] - vz[i]) + vx[i]) c = !c; } return c; };
  let zoneIdx = new Int32Array(0);
  const touched = new Uint8Array(grid.N); let touchedList = [];
  const touch = i => { if (!touched[i]) { touched[i] = 1; touchedList.push(i); } };

  const closeZone = () => {
    if (nv < 3 || closed) return closed;
    closed = true; writeZone();
    let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9; for (let i = 0; i < nv; i++) { x0 = Math.min(x0, vx[i]); x1 = Math.max(x1, vx[i]); z0 = Math.min(z0, vz[i]); z1 = Math.max(z1, vz[i]); }
    const i0 = Math.max(0, Math.floor((x0 - X0) / SP)), i1 = Math.min(NX - 1, Math.ceil((x1 - X0) / SP)), j0 = Math.max(0, Math.floor((z0 - Z0) / SP)), j1 = Math.min(NZ - 1, Math.ceil((z1 - Z0) / SP));
    const idx = [], inside = new Uint8Array((i1 - i0 + 1) * (j1 - j0 + 1)), W = j1 - j0 + 1;
    for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) { const k = i * NZ + j; if (inPoly(gx[k], gz[k])) { idx.push(k); aZone[k * 2 + 1] = 1; inside[(i - i0) * W + (j - j0)] = 1; } }
    zoneIdx = Int32Array.from(idx); zoneAttr.needsUpdate = true;
    // draped fill from the lattice cells fully inside the zone
    const fp = [];
    for (let i = i0; i < i1; i++) for (let j = j0; j < j1; j++) {
      const a = (i - i0) * W + (j - j0); if (!(inside[a] && inside[a + 1] && inside[a + W] && inside[a + W + 1])) continue;
      const P = (ii, jj) => { const x = X0 + ii * SP, z = Z0 + jj * SP; return [x, hField(x, z), z]; };
      const p00 = P(i, j), p01 = P(i, j + 1), p10 = P(i + 1, j), p11 = P(i + 1, j + 1);
      fp.push(...p00, ...p01, ...p10, ...p10, ...p01, ...p11);
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(fp, 3));
    fill = new THREE.Mesh(g, fillMat); fill.renderOrder = 4; fill.position.y = 0.08; fill.frustumCulled = false; grp.add(fill);
    fillA = 0; fillTarget = 1; flash = 0.5; snap = false; hov = null;
    return true;
  };
  const clearZone = () => {
    for (let k = 0; k < zoneIdx.length; k++) aZone[zoneIdx[k] * 2 + 1] = 0;
    zoneIdx = new Int32Array(0); zoneAttr.needsUpdate = true;
    nv = 0; closed = false; writeZone();
    if (fill) { grp.remove(fill); fill.geometry.dispose(); fill = null; }
    fillA = fillTarget = 0;
    // ease every changed point back to ground
    if (touchedList.length) {
      const idx = Int32Array.from(touchedList), delta = new Float32Array(idx.length);
      for (let k = 0; k < idx.length; k++) { delta[k] = -aCut[idx[k]]; touched[idx[k]] = 0; }
      touchedList = []; shape(idx, delta, 0.9);
    }
  };
  const addVert = (x, z) => {
    if (nv >= MAXV) return;
    if (nv && Math.hypot(x - vx[nv - 1], z - vz[nv - 1]) < 1.2) return;
    vx[nv] = x; vz[nv] = z; nv++; writeZone();
  };

  // ------------------------------------------------------------------ point height tweens (batched)
  const batches = [];
  function shape(idx, delta, dur) {
    const from = new Float32Array(idx.length); for (let k = 0; k < idx.length; k++) { from[k] = aCut[idx[k]]; touch(idx[k]); }
    batches.push({ idx, from, delta, t: 0, d: dur });
  }
  const runBatches = dt => {
    if (!batches.length) return;
    for (let b = batches.length - 1; b >= 0; b--) {
      const B = batches[b]; B.t = Math.min(B.d, B.t + dt); const k = out2(B.t / B.d);
      for (let i = 0; i < B.idx.length; i++) aCut[B.idx[i]] = B.from[i] + B.delta[i] * k;
      if (B.t >= B.d) batches.splice(b, 1);
    }
    cutAttr.needsUpdate = true;
  };
  const wp = new THREE.Vector3();
  function carve(depth) {
    exc.tip.getWorldPosition(wp); const R = 7, idx = [], delta = [];
    for (let k = 0; k < zoneIdx.length; k++) {
      const i = zoneIdx[k], d = Math.hypot(gx[i] - wp.x, gz[i] - wp.z), f = Math.max(0, 1 - d / R);
      const add = depth * f * f * 1.6 + depth * 0.18;
      if (aCut[i] < 2.8) { idx.push(i); delta.push(Math.min(add, 2.8 - aCut[i])); }
    }
    shape(Int32Array.from(idx), Float32Array.from(delta), 0.7);
  }
  function dump() {
    exc.tip.getWorldPosition(wp); const R = 5.5, idx = [], delta = [];
    const i0 = Math.max(0, Math.floor((wp.x - R - X0) / SP)), i1 = Math.min(NX - 1, Math.ceil((wp.x + R - X0) / SP));
    const j0 = Math.max(0, Math.floor((wp.z - R - Z0) / SP)), j1 = Math.min(NZ - 1, Math.ceil((wp.z + R - Z0) / SP));
    for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) {
      const k = i * NZ + j; if (aZone[k * 2 + 1]) continue;
      const d = Math.hypot(gx[k] - wp.x, gz[k] - wp.z); if (d > R) continue;
      idx.push(k); delta.push(-(Math.cos((d / R) * Math.PI) + 1) * 0.45);
    }
    shape(Int32Array.from(idx), Float32Array.from(delta), 0.9);
  }

  // ------------------------------------------------------------------ job runner (sequential steps)
  let steps = null, si = 0, st = 0, started = false, onDone = null, flash = 0, jobOn = false;
  const run = (list, done, job = true) => { steps = list; si = 0; st = 0; started = false; onDone = done; jobOn = job; };
  const armTo = (to, d, ease = io2) => { const from = {}; return { d, s() { for (const k in to) from[k] = ARM[k]; }, u(k) { const e = ease(k); for (const k2 in to) ARM[k2] = from[k2] + ((typeof to[k2] === 'function' ? to[k2]() : to[k2]) - from[k2]) * e; } }; };
  const call = fn => ({ d: 0, s: fn });
  const tickJob = dt => {
    while (steps && si < steps.length) {
      const S = steps[si];
      if (!started) { started = true; S.s && S.s(); }
      st += dt; dt = 0;
      const k = S.d > 0 ? Math.min(1, st / S.d) : 1;
      S.u && S.u(k);
      if (k < 1) return;
      S.e && S.e(); si++; st = 0; started = false;
    }
    if (steps) { steps = null; jobOn = false; const d = onDone; onDone = null; d && d(); }
  };
  const busy = () => jobOn;
  const stopJob = () => { steps = null; onDone = null; speed = 0; run([armTo({ ...REST }, 0.8)], null, false); loadMat.opacity = 0; load.position.y = 0; state = 'IDLE'; };

  let DUMP = 1.55;
  function runJob() {
    if (busy() || !zoneIdx.length) return;
    let cx = 0, cz = 0; for (let i = 0; i < nv; i++) { cx += vx[i]; cz += vz[i]; } cx /= nv; cz /= nv;
    const dx = cx - pos.x, dz = cz - pos.z, dist = Math.hypot(dx, dz) || 1;
    const ty = Math.atan2(-dz, dx), dYaw = Math.atan2(Math.sin(ty - yaw), Math.cos(ty - yaw)), y0 = yaw;
    const sd = Math.min(REACH, Math.max(REACH * 0.6, dist)); // stand off at reach; a zone already in reach needs no drive
    const tx = cx - (dx / dist) * sd, tz = cz - (dz / dist) * sd;
    const sx = pos.x, sz = pos.z, travel = Math.hypot(tx - sx, tz - sz);
    // dump toward the camera side so the pile shows
    const cdx = camera.position.x - cx, cdz = camera.position.z - cz;
    DUMP = (Math.cos(ty + 1.55) * cdx - Math.sin(ty + 1.55) * cdz) > 0 ? 1.55 : -1.55;
    state = 'EN ROUTE';
    const list = [
      { d: Math.max(0.8, 0.4 + Math.abs(dYaw) * 0.5), s() { const f = {}; for (const k of ['a1', 'a2']) f[k] = ARM[k]; this.f = f; }, u(k) { const e = io2(k); yaw = y0 + dYaw * e; ARM.a1 = this.f.a1 + (0.75 - this.f.a1) * e; ARM.a2 = this.f.a2 + (-1.7 - this.f.a2) * e; exc.drive(Math.abs(dYaw) * 0.02); } },
      { d: travel > 0.3 ? Math.max(0.6, travel / 6) : 0, u(k) { const e = io2(k); const nx = sx + (tx - sx) * e, nz = sz + (tz - sz) * e; const m = Math.hypot(nx - pos.x, nz - pos.z); pos.x = nx; pos.z = nz; exc.drive(m / MSCALE); speed = travel > 0.5 ? 1 : 0; } },
      call(() => { speed = 0; state = 'DIGGING'; fillTarget = 0.55; }),
    ];
    [0, -0.2, 0.2, -0.1, 0.12].forEach((sw, k) => list.push(
      armTo({ a1: DIG.a1 - k * 0.04, a2: DIG.a2, a3: DIG.a3, sw }, 0.9),
      call(() => carve(0.55 + k * 0.08)),
      armTo({ a3: -1.3, a2: -1.25 }, 0.5, in2),
      { d: 0.2, u(q) { loadMat.opacity = q; } },
      armTo({ a1: 0.65, a2: -1.45 }, 0.7, out2),
      armTo({ sw: () => DUMP }, 0.8),
      armTo({ a3: 0.7 }, 0.35, out2),
      call(dump),
      { d: 0.45, u(q) { load.position.y = -3 * in2(q); loadMat.opacity = 1 - q; }, e() { load.position.y = 0; } },
      armTo({ sw: 0, a3: -0.6 }, 0.75),
    ));
    const mine = user; if (mine) emit('dig');
    run(list, () => { speed = 0; state = 'IDLE'; idleT = 0; fillTarget = 1; if (mine) emit('done'); });
  }

  // demo zones relative to the machine's home, in front of it and low on screen (clear of the hint under the tabs
  // and of the HUD cards); cycles until someone plays
  const DEMOS = [[[3, 4], [9, 3], [10, 8], [4, 9]], [[4, 1], [9, 1], [10, 6], [5, 6]], [[-1, 6], [5, 6], [6, 11], [0, 11]]];
  let user = false, demoK = 0, idleT = 0, ctrlT = 0;
  const demo = () => { clearZone(); for (const [x, z] of DEMOS[demoK++ % DEMOS.length]) addVert(HOME.x + x, HOME.z + z); closeZone(); runJob(); };

  // ------------------------------------------------------------------ picking + pointer
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hit = new THREE.Vector3(), sp = new THREE.Vector3();
  const pick = e => {
    const r = canvas.getBoundingClientRect(); ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ndc, camera);
    plane.constant = 0;
    for (let k = 0; k < 5; k++) { if (!ray.ray.intersectPlane(plane, hit)) return null; plane.constant = -hField(hit.x, hit.z) * amp; }
    return Math.abs(hit.x) < -X0 - 3 && Math.abs(hit.z) < -Z0 - 3 ? hit : null;
  };
  const screenOf = (x, z, e) => { const r = canvas.getBoundingClientRect(); sp.set(x, hField(x, z) * amp + 0.18, z).project(camera); return Math.hypot((sp.x + 1) / 2 * r.width + r.left - e.clientX, (1 - sp.y) / 2 * r.height + r.top - e.clientY); };
  let drag = -1, downX = 0, downY = 0, moved = false;
  const queue = []; // clicks made while the camera was still tilting in
  const isBlocked = e => !!(api.blocked && api.blocked(e.clientX, e.clientY));
  const onDown = e => {
    if (!armed) return; downX = e.clientX; downY = e.clientY; moved = false; drag = -1;
    if (!active) return;
    if (!closed && !busy()) for (let i = 0; i < nv; i++) if (screenOf(vx[i], vz[i], e) < 14) { drag = i; try { canvas.setPointerCapture(e.pointerId); } catch (_) {} break; }
  };
  const hover = e => {
    if (!active || closed || !nv || busy()) { if (hov || snap) { hov = null; snap = false; writeZone(); } return; }
    const p = isBlocked(e) ? null : pick(e); hov = p ? { x: p.x, z: p.z } : null;
    snap = nv > 2 && drag < 0 && screenOf(vx[0], vz[0], e) < 14;
    writeZone();
  };
  const onMoveC = e => {
    if (Math.hypot(e.clientX - downX, e.clientY - downY) > 5) moved = true;
    if (drag >= 0 && active && !isBlocked(e)) { const p = pick(e); if (p) { vx[drag] = p.x; vz[drag] = p.z; } }
    hover(e);
  };
  const onLeave = () => { if (hov || snap) { hov = null; snap = false; writeZone(); } };
  const onUp = () => { drag = -1; }; // a press on a handle without movement still counts as a click
  const click = e => {
    if (isBlocked(e)) return; // never outside the frame
    const p = pick(e); if (!p) return;
    user = true;
    if (busy() || closed) { stopJob(); clearZone(); }
    if (nv >= 3 && (screenOf(vx[0], vz[0], e) < 22 || Math.hypot(p.x - vx[0], p.z - vz[0]) < 2.5)) { if (closeZone()) { emit('close'); runJob(); } return; }
    const n0 = nv; addVert(p.x, p.z); if (nv > n0) emit('point');
    hover(e);
  };
  const onClick = e => {
    if (!armed || moved) return;
    if (!active) { if (queue.length < 8 && !isBlocked(e)) { queue.push({ clientX: e.clientX, clientY: e.clientY }); user = true; } return; }
    click(e);
  };
  const onDbl = () => { if (!active) return; user = true; if (!busy() && closeZone()) { emit('close'); runJob(); } };
  canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMoveC); canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointerleave', onLeave);
  canvas.addEventListener('click', onClick); canvas.addEventListener('dblclick', onDbl);

  // ------------------------------------------------------------------ per frame
  api.update = (dt, o) => {
    const wasActive = active, wasArmed = armed; armed = !!(o.armed || o.active); active = o.active; vis = o.vis;
    if (armed !== wasArmed) { canvas.style.pointerEvents = armed ? 'auto' : 'none'; canvas.style.cursor = armed ? 'crosshair' : ''; if (!armed) queue.length = 0; }
    if (active !== wasActive && !active) onLeave();
    const ampChanged = Math.abs(o.amp - amp) > 1e-4; amp = o.amp;
    grp.visible = vis > 0.004; exc.setOpacity(vis);
    focus.lerp(focusGoal, 1 - Math.exp(-dt * 1.2));
    if (vis <= 0.004) { ctrlT = 0; return; }
    ctrlT += dt;
    tickJob(dt); runBatches(dt);
    // the camera has landed: replay clicks made on the way in, in the final view
    if (active && queue.length) { const q = queue.splice(0); for (const e of q) click(e); }
    if (ampChanged && nv) writeZone();
    if (fill) { fillA += (fillTarget - fillA) * (1 - Math.exp(-dt * 3)); fill.scale.y = amp; } else fillA = 0;
    flash = Math.max(0, flash - dt);
    api.fillVis = fillA; api.zoneVis = nv ? 1 : 0;
    lineMat.uniforms.uOpacity.value = vis * api.zoneVis; handleMat.uniforms.uOpacity.value = vis * api.zoneVis;
    fillMat.opacity = vis * (0.35 * fillA + flash * 0.3); // brief brighten when a zone closes
    // demo when nobody has played
    if (active && !user && !api.noDemo && !busy()) { idleT += dt; if ((!closed && ctrlT > 1.2 && demoK === 0) || (closed && idleT > 5)) demo(); }
    // machine on the ground
    const h = hField(pos.x, pos.z) * amp, e = 1.6;
    const dx = (hField(pos.x + e, pos.z) - hField(pos.x - e, pos.z)) * amp / (2 * e), dz = (hField(pos.x, pos.z + e) - hField(pos.x, pos.z - e)) * amp / (2 * e);
    const fx = Math.cos(yaw), fz = -Math.sin(yaw);
    const pitch = Math.atan(dx * fx + dz * fz) * 0.55, roll = Math.atan(dx * -fz + dz * fx) * 0.55; // the tracks bridge the waves
    const r = exc.root; r.position.set(pos.x, h - 0.15, pos.z); r.rotation.y = yaw; r.rotation.z = pitch + (speed > 0 ? Math.sin(performance.now() / 90) * 0.01 : 0); r.rotation.x = -roll;
    api.roll = roll; api.pitch = pitch;
    exc.setArm(ARM.a1, ARM.a2, ARM.a3, ARM.sw);
    // speed: ground travel plus track speed while turning in place (track gauge ~1.3 m), smoothed
    if (dt > 0) {
      const dy = Math.atan2(Math.sin(yaw - lastYaw), Math.cos(yaw - lastYaw));
      const v = (Math.hypot(pos.x - lastX, pos.z - lastZ) + Math.abs(dy) * 1.28 * MSCALE) / MSCALE / dt;
      spd += (Math.min(v, 12) - spd) * (1 - Math.exp(-dt * 5));
    }
    lastX = pos.x; lastZ = pos.z; lastYaw = yaw;
  };
  api.telemetry = out => {
    const R2D = 180 / Math.PI, yd = Math.atan2(Math.sin(yaw), Math.cos(yaw)) * R2D, rd = (api.roll || 0) * R2D + (speed > 0 ? Math.sin(performance.now() / 120) * 0.4 : 0);
    let dug = 0; for (let k = 0; k < zoneIdx.length; k += 7) dug = Math.max(dug, aCut[zoneIdx[k]]);
    out.height = +(412 + (hField(pos.x, pos.z) * amp - dug) * 3.28).toFixed(2);
    out.yaw = +yd.toFixed(2); out.roll = +rd.toFixed(2); out.body = +(ARM.sw * R2D).toFixed(2);
    out.speed = +(spd < 0.05 ? 0 : spd * 0.4).toFixed(1); out.state = state; out.blade = Math.max(-1, Math.min(1, rd / 12));
    return out;
  };
  Object.defineProperty(api, 'drawing', { get: () => nv > 0 && !closed });
  api.pos = pos; // machine ground position (the camera aims at the terrain under it)
  api.debug = () => ({ nv, closed, jobOn, user, active, state, demoK });
  api.demo = demo; api.clear = () => { stopJob(); clearZone(); };
  // back to a fresh demo: no zone, no dug points, machine home and at rest (the camera eases back to its focus)
  api.reset = () => {
    steps = null; onDone = null; jobOn = false; batches.length = 0; queue.length = 0;
    clearZone(); batches.length = 0;
    for (const i of touchedList) { aCut[i] = 0; touched[i] = 0; } touchedList = []; cutAttr.needsUpdate = true;
    pos.x = lastX = HOME.x; pos.z = lastZ = HOME.z; yaw = lastYaw = 0.35; Object.assign(ARM, REST);
    loadMat.opacity = 0; load.position.y = 0; speed = 0; spd = 0; state = 'IDLE';
    user = false; demoK = 0; idleT = 0; ctrlT = 0; flash = 0; hov = null; snap = false; drag = -1;
    focusGoal.set(HOME.x + 5, 0, HOME.z - 1);
  };
  Object.defineProperty(api, 'user', { get: () => user });
  api.dispose = () => {
    canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMoveC); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointerleave', onLeave);
    canvas.removeEventListener('click', onClick); canvas.removeEventListener('dblclick', onDbl);
    loadGeo.dispose(); loadMat.dispose(); ZS.geo.dispose(); hGeo.dispose(); if (fill) fill.geometry.dispose();
    lineMat.dispose(); handleMat.dispose(); fillMat.dispose(); fns.length = 0;
  };
  return api;
}
