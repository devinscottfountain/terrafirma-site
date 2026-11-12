// solutions.js: TerraFirma homepage Solutions scene. One continuous jobsite seen three ways, chosen by the page's tabs (never
// by scroll), with a real camera flight between them:
//   Orchestration (mode 1) = the dig: a drone chase cam behind one excavator, an operator HUD, drag to dig (desktop).
//   Planning (mode 0)      = the blueprint: top down, the ground morphs to the design surface, contours, cut and fill.
//   Execution (mode 2)     = breadth: high and wide, three machines on three jobs, live paths, tags, data links.
// The ground is a procedural survey point cloud lit by a low sun; the dig edits a persistent height field that the dots
// and every machine read, so the hole stays for the page session and shows in all three views. No asset downloads.
import { SITE, hF, hD, createField, buildDots, buildContours, rectPoly } from './sol-terrain.js';
import { PALETTE, dotMaterial, lineMaterial, lineSet, motes, particles, skyMaterial, createPost } from './sol-fx.js';
import { createMachineKit } from './sol-machines.js';
import { createDig } from './sol-game.js';
import { createCrew } from './sol-crew.js';
import { createHud } from './sol-hud.js';

export { hF as hField };

const clamp01 = v => (v < 0 ? 0 : v > 1 ? 1 : v);
const lerp = (a, b, t) => a + (b - a) * t;
const easeIO = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const wrap = a => Math.atan2(Math.sin(a), Math.cos(a));
const DEG = Math.PI / 180;
const MSCALE = 1.4;      // machine scale (model metres -> world)
const FLIGHT = 1.4;      // s, camera flight between the three shots
const PR_MAX = 1.5;

// Words (client-facing) come from data-sol-* attributes on the section or the mount; these are only fallbacks.
const WORDS = {
  hint: ['hint', 'Drag to dig'],
  dig: ['tag-dig', 'Excavator 01'], haul: ['tag-haul', 'Loader 02'], grade: ['tag-grade', 'Roller 03'],
  auto: ['hud-auto', 'Autopilot'], manual: ['hud-manual', 'Manual'], swing: ['hud-swing', 'Swing'], reach: ['hud-reach', 'Reach'],
  depth: ['hud-depth', 'To grade'], load: ['hud-load', 'Load'], grade_: ['hud-grade', 'Grade'],
  cut: ['label-cut', 'Cut'], fill: ['label-fill', 'Fill'],
};

export function createSolutions({ THREE, host, root = host, quality = 'high', interactive = true, safe = null }) {
  const LOW = quality === 'low';
  const attr = n => root.getAttribute('data-sol-' + n) ?? host.getAttribute('data-sol-' + n);
  const words = {}; for (const k in WORDS) words[k] = attr(WORDS[k][0]) ?? WORDS[k][1];
  words.grade = words.grade_; const tagWords = { dig: attr('tag-dig') ?? WORDS.dig[1], haul: attr('tag-haul') ?? WORDS.haul[1], grade: attr('tag-grade') ?? WORDS.grade[1] };
  const css = getComputedStyle(root), pal = { ...PALETTE };
  for (const k in pal) { const v = css.getPropertyValue('--sol-' + k).trim(); if (/^#[0-9a-f]{6}$/i.test(v)) pal[k] = v; }
  const col = hex => new THREE.Color(hex);   // sRGB hex -> linear working colour

  // ------------------------------------------------------------------ renderer, canvas, HUD
  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, premultipliedAlpha: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0); renderer.autoClear = false; renderer.info.autoReset = false;
  let prCap = LOW ? 1 : Math.min(window.devicePixelRatio || 1, PR_MAX);
  renderer.setPixelRatio(prCap); renderer.setSize(1, 1, false);
  const canvas = renderer.domElement;
  canvas.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;display:block;pointer-events:none;touch-action:pan-y;-webkit-tap-highlight-color:transparent';
  if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
  host.appendChild(canvas);
  const hud = createHud(host, words, pal);
  const post = createPost(THREE, renderer, { low: LOW });

  const scene = new THREE.Scene(), skyScene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.5, 4000);
  let cw = 1, ch = 1;
  const RES = { value: new THREE.Vector2(1, 1) }, PRU = { value: 1 }, TU = { value: 0 };

  // ------------------------------------------------------------------ shared uniforms (dots, motes, particles, sky)
  const sun = new THREE.Vector3(...SITE.sunDir);
  const U = {
    uT: TU, uPx: { value: 1000 }, uPR: PRU, uSun: { value: sun }, uCamP: { value: new THREE.Vector3() },
    uDot: { value: col(pal.dot) }, uCut: { value: col(pal.cut) }, uFill: { value: col(pal.fill) }, uHaze: { value: col(pal.haze) },
    uAmb: { value: new THREE.Vector3(0.2, 0.22, 0.27) }, uSunC: { value: new THREE.Vector3(2.0, 1.42, 0.95) },
    uField: { value: null }, uFieldT: { value: null }, uMorph: { value: 0 }, uDensity: { value: 1 }, uMinS: { value: 0 }, uSizeK: { value: 0.3 }, uNear: { value: 2 }, uMaxPx: { value: 7 },
    uWA: { value: new THREE.Vector3(0, 1, 0) }, uWB: { value: new THREE.Vector3(0, 1, 0) },
    uPulse: { value: new THREE.Vector4(0, 0, -100, 0) }, uScan: { value: new THREE.Vector4(0, 0, -100, 0) }, uBucket: { value: new THREE.Vector4(0, 0, 3, 0) },
    uFog: { value: new THREE.Vector4(140, 1e4, 1, 0) }, uPit: { value: new THREE.Vector4(SITE.pit.x, SITE.pit.z, SITE.pit.hx, SITE.pit.hz) },
    uBoxA: { value: Array.from({ length: 6 }, () => new THREE.Vector4()) }, uBoxB: { value: Array.from({ length: 6 }, () => new THREE.Vector4()) },
    uMoteC: { value: new THREE.Vector4(0, 0, 0, 40) }, uMoteA: { value: 1 },
    uInvP: { value: new THREE.Matrix4() }, uCamW: { value: new THREE.Matrix4() }, uSkyA: { value: 1 },
  };

  // ------------------------------------------------------------------ ground: edit field + dot cloud
  const field = createField(THREE);
  U.uField.value = field.tex; U.uFieldT.value = field.uniform;
  const dots = buildDots(THREE, { low: LOW });
  const dotMat = dotMaterial(THREE, U);
  const points = new THREE.Points(dots.geo, dotMat); points.frustumCulled = false; points.renderOrder = 3; scene.add(points);
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), skyMaterial(THREE, U)); sky.frustumCulled = false; sky.material.blending = THREE.NoBlending; skyScene.add(sky);
  const mote = motes(THREE, LOW ? 260 : 700, U); mote.renderOrder = 7; scene.add(mote);
  const parts = particles(THREE, LOW ? 500 : 900, U); parts.pts.renderOrder = 6; scene.add(parts.pts);

  // ------------------------------------------------------------------ machines: one slot per job
  // TODO(Tim, Figma notes): the new vehicle replaces one of these. Each job has one slot: swap the factory here (and model the
  // new vehicle in sol-machines.js next to excavator / backhoe / roller). `dig` must keep the excavator rig API (setArm, tip,
  // bucket, boom); `haul` and `grade` only need root, setDrive, setOpacity.
  const kit = createMachineKit(THREE, { line: pal.accent });
  const SLOT = { dig: kit.excavator, haul: kit.backhoe, grade: kit.roller };
  const mk = fn => { const m = fn(); m.root.scale.setScalar(MSCALE); m.root.rotation.order = 'YXZ'; scene.add(m.root); m.setOpacity(1); return m; };
  const exc = mk(SLOT.dig), loader = mk(SLOT.haul), roller = mk(SLOT.grade);
  loader.setArm(0.9, -1.9, -1.0, 0);

  // ------------------------------------------------------------------ the dig and the crew
  let clockT = 0; const clock = () => clockT;
  const dig = createDig({ THREE, exc, field, camera, canvas, interactive, MSCALE, parts, clock });
  const crew = createCrew({ field, slot: { haul: loader, grade: roller }, parts, MSCALE });

  // ------------------------------------------------------------------ plan graphics (lines)
  const L = (color, width, maxSeg, opts) => { const s = lineSet(THREE, lineMaterial(THREE, RES, PRU, TU, color, { width, ...opts }), maxSeg); s.mesh.renderOrder = 4; scene.add(s.mesh); return s; };
  const contourSegs = buildContours({ step: LOW ? 1.2 : 0.8 });
  const contours = L(col(pal.accent), 1, contourSegs.length / 8);
  for (let i = 0, c = contourSegs, n = c.length / 8; i < n; i++) { const o = i * 8; contours.set(i, c[o], c[o + 1], c[o + 2], c[o + 3], c[o + 4], c[o + 5], c[o + 6], c[o + 6], c[o + 7]); }
  contours.commit(contourSegs.length / 8);
  const zCut = L(col(pal.cut), 1.4, 64), zFill = L(col(pal.fill), 1.4, 64), zAcc = L(col(pal.accent), 1, 220);
  const drapeY = (x, z) => hD(x, z) + 0.12;
  function polyline(set, i, pts, closed, t0 = 0, t1 = 1, k = 1, yFn = drapeY, sub = 6) {
    const n = pts.length - (closed ? 0 : 1); let L0 = 0; const lens = [];
    for (let a = 0; a < n; a++) { const p = pts[a], q = pts[(a + 1) % pts.length]; lens.push(Math.hypot(q[0] - p[0], q[1] - p[1])); L0 += lens[a]; }
    let acc = 0;
    for (let a = 0; a < n; a++) {
      const p = pts[a], q = pts[(a + 1) % pts.length];
      for (let s = 0; s < sub; s++) {
        const f0 = s / sub, f1 = (s + 1) / sub, x0 = lerp(p[0], q[0], f0), z0 = lerp(p[1], q[1], f0), x1 = lerp(p[0], q[0], f1), z1 = lerp(p[1], q[1], f1);
        set.set(i++, x0, yFn(x0, z0), z0, x1, yFn(x1, z1), z1, lerp(t0, t1, (acc + lens[a] * f0) / L0), lerp(t0, t1, (acc + lens[a] * f1) / L0), k);
      }
      acc += lens[a];
    }
    return i;
  }
  const handles = (set, i, pts, s = 0.7) => { for (const [x, z] of pts) i = polyline(set, i, [[x - s, z - s], [x + s, z - s], [x + s, z + s], [x - s, z + s]], true, 0, 0, 1.6, drapeY, 1); return i; };
  { // static plan zones: pit (cut), pad (fill), platform + road (accent), corner handles
    let i = polyline(zCut, 0, rectPoly(SITE.pit), true); i = handles(zCut, i, rectPoly(SITE.pit)); zCut.commit(i);
    i = polyline(zFill, 0, rectPoly(SITE.pad), true); i = handles(zFill, i, rectPoly(SITE.pad)); zFill.commit(i);
    const R = SITE.road, ux = R.bx - R.ax, uz = R.bz - R.az, ul = Math.hypot(ux, uz), nx = -uz / ul * R.hw, nz = ux / ul * R.hw;
    i = polyline(zAcc, 0, rectPoly(SITE.plat), true); i = handles(zAcc, i, rectPoly(SITE.plat));
    i = polyline(zAcc, i, [[R.ax + nx, R.az + nz], [R.bx + nx, R.bz + nz]], false, 0, 1, 0.4); i = polyline(zAcc, i, [[R.ax - nx, R.az - nz], [R.bx - nx, R.bz - nz]], false, 0, 1, 0.4);
    zAcc.commit(i); zAcc.base = i;
  }
  const foot = L(col(pal.accent), 1, 96);   // machine footprints + the excavator's reach circle (live)

  // ------------------------------------------------------------------ exec graphics: live paths + data links
  const pathL = L(col(pal.accent), 1.3, 400), pathR = L(col(pal.fill), 1.3, 200), pathE = L(col(pal.cut), 1.3, 64), links = L(col(pal.accent), 1, 3, { depthTest: false });
  const gY = (x, z) => field.ground(x, z) + 0.25;
  { let i = 0; for (const p of crew.paths()) i = polyline(pathL, i, p.pts, false, p.t0, p.t1, 1, gY, 1); pathL.commit(i); }
  { let i = 0; const n = crew.lanes.length; for (let k = 0; k < n; k++) { const a = crew.rollPath[k * 2], b = crew.rollPath[k * 2 + 1]; i = polyline(pathR, i, [a, b], false, k / n, (k + 1) / n, 1, gY, 12); } pathR.commit(i); }
  { const pts = []; for (let k = 0; k <= 24; k++) { const sw = lerp(0.5, SITE.pileSw, k / 24), a = SITE.E.yaw + sw; pts.push([SITE.E.x + Math.cos(a) * 7.8, SITE.E.z - Math.sin(a) * 7.8]); } polyline(pathE, 0, pts, false, 0, 1, 1, gY, 1); pathE.commit(24); }
  links.commit(3);
  const PATHS = [pathL, pathR, pathE];

  // ------------------------------------------------------------------ camera: three staged shots and flights between them
  // pose: look target (tx, ty, tz), yaw, pitch, dist, fov, sy = NDC y the target sits at (lens shift); plus the look of the
  // ground for that shot (fog, site fade, dot thinning, sizes, motes, sky). Flights blend every field.
  const LOOK = ['fogD', 'siteR', 'siteW', 'minS', 'sizeK', 'near', 'moteA', 'skyA', 'moteW', 'maxPx'];
  const pose = () => ({ tx: 0, ty: 0, tz: 0, yaw: 0, pitch: 0, dist: 50, fov: 30, sy: 0, fogD: 140, siteR: 1e4, siteW: 1, minS: 4, sizeK: 0.3, near: 2, moteA: 1, skyA: 1, moteW: 40, maxPx: 7 });
  const SHOT = {
    0: { pitch: 80 * DEG, fov: 14, fogD: 1e5, siteR: 62, siteW: 24, minS: 4.6, sizeK: 0.4, near: 0, moteA: 0, skyA: 0.15, moteW: 80, maxPx: 3.2 },
    1: { pitch: 33 * DEG, fov: 40, fogD: 170, siteR: 1e4, siteW: 1, minS: 3.6, sizeK: 0.3, near: 2.2, moteA: 1, skyA: 1, moteW: 44, maxPx: 6 },
    2: { pitch: 39 * DEG, fov: 30, fogD: 290, siteR: 1e4, siteW: 1, minS: 4.2, sizeK: 0.42, near: 0, moteA: 0.55, skyA: 0.85, moteW: 120, maxPx: 3.6 },
  };
  const SAFE = { top: 0.2, bottom: 0.3, ...(safe || {}) };
  const planC = { x: -1, z: -5 }, execC = { x: 2.5, z: -7.5 };
  const TUNE = { execYaw: 0.8, execK: 1.3, digYaw: 0.95, digAhead: 6.6, digK: 1.12 };
  const keyPlan = [], keyExec = [], keyDig = [];
  for (const P of [SITE.pit, SITE.pad, SITE.plat]) for (const [x, z] of rectPoly({ ...P, hx: P.hx + P.ws * 0.6, hz: P.hz + P.ws * 0.6 })) {
    keyPlan.push(new THREE.Vector3(x, hD(x, z), z));
    if (P !== SITE.plat) keyExec.push(new THREE.Vector3(x, hD(x, z), z), new THREE.Vector3(x, hD(x, z) + 4, z));   // exec frames the work; the platform sits at the edge
  }
  { const E = SITE.E;
    for (let a = 0; a < 12; a++) { const s = a / 12 * Math.PI * 2; keyDig.push(new THREE.Vector3(E.x + Math.cos(s) * 3.6, hF(E.x, E.z) + (a % 2 ? 5.2 : 0), E.z + Math.sin(s) * 3.6)); }
    for (const sw of [-0.5, 0, 0.5]) for (const r of [5, 11]) { const x = E.x + Math.cos(E.yaw + sw) * r, z = E.z - Math.sin(E.yaw + sw) * r; keyDig.push(new THREE.Vector3(x, hD(x, z), z)); }
    keyDig.push(new THREE.Vector3(SITE.pile.x, hF(SITE.pile.x, SITE.pile.z), SITE.pile.z), new THREE.Vector3(SITE.pile.x, hF(SITE.pile.x, SITE.pile.z) + 4, SITE.pile.z));
  }
  const fitCam = new THREE.PerspectiveCamera(30, 1, 0.5, 4000), fv = new THREE.Vector3();
  function aim(cam, c) {
    const asp = cw / ch;
    cam.fov = c.fov; cam.aspect = asp;
    const cp = Math.cos(c.pitch);
    cam.position.set(c.tx + c.dist * cp * Math.sin(c.yaw), c.ty + c.dist * Math.sin(c.pitch), c.tz + c.dist * cp * Math.cos(c.yaw));
    cam.near = Math.max(0.3, c.dist * 0.02); cam.far = c.dist * 4 + 1200;
    cam.up.set(0, 1, 0); if (c.pitch > 1.5) cam.up.set(-Math.sin(c.yaw), 0, -Math.cos(c.yaw));
    cam.updateProjectionMatrix();
    cam.projectionMatrix.elements[9] = -c.sy; cam.projectionMatrixInverse.copy(cam.projectionMatrix).invert();
    cam.lookAt(c.tx, c.ty, c.tz); cam.updateMatrixWorld();
  }
  // distance that keeps the key points inside the safe band (x within 92% of the width)
  function fit(c, pts) {
    const yT = 1 - 2 * SAFE.top, yB = 2 * SAFE.bottom - 1; c.sy = (yT + yB) / 2;
    for (let it = 0; it < 7; it++) {
      aim(fitCam, c); let k = 0.2;
      for (const p of pts) {
        fv.copy(p).project(fitCam); if (fv.z > 1) { k = Math.max(k, 2); continue; }
        k = Math.max(k, Math.abs(fv.x) / 0.92, fv.y > c.sy ? (fv.y - c.sy) / (yT - c.sy) : (c.sy - fv.y) / (c.sy - yB));
      }
      c.dist *= Math.pow(k, 0.85);
    }
    return c;
  }
  const base = { 0: null, 1: null, 2: null };
  function refit() {
    const asp = cw / ch;
    // plan: north up on wide hosts, turned a quarter on tall ones so the long axis runs down the screen
    const yaws = asp < 0.95 ? [-Math.PI / 2 + 0.06, 0.06] : [0.06, -Math.PI / 2 + 0.06];
    let best = null;
    for (const yaw of yaws) { const c = fit(Object.assign(pose(), SHOT[0], { tx: planC.x, ty: 0, tz: planC.z, yaw, dist: 300 }), keyPlan); if (!best || c.dist < best.dist * 0.97) best = c; }
    base[0] = best;
    // exec: across the diagonal the three jobs lie on (pit -> pad), looking into the low sun, so all three spread out.
    // Tall hosts look along that diagonal instead, so it runs up the screen.
    best = null;
    for (const yaw of asp < 0.95 ? [TUNE.execYaw - 1.2, TUNE.execYaw] : [TUNE.execYaw]) { const c = fit(Object.assign(pose(), SHOT[2], { tx: execC.x, ty: 0, tz: execC.z, yaw, dist: 150 }), keyExec); if (!best || c.dist < best.dist * 0.97) best = c; }
    base[2] = best; base[2].dist *= asp < 0.95 ? 1.15 : TUNE.execK;
    const E = SITE.E, fwd = E.yaw, tx = E.x + Math.cos(fwd) * TUNE.digAhead, tz = E.z - Math.sin(fwd) * TUNE.digAhead;
    // behind the cab and well off its right side, so the boom works in profile over the pit (camera yaw: +z looks down -z;
    // the machine faces (cos yaw, -sin yaw))
    const camYaw = Math.atan2(-Math.cos(fwd), Math.sin(fwd)) + TUNE.digYaw;
    const c1 = Object.assign(pose(), SHOT[1], { tx, ty: hF(tx, tz) + 0.6, tz, yaw: camYaw, dist: 18 });
    if (asp < 0.95) { c1.fov = 50; c1.pitch = 30 * DEG; }
    base[1] = fit(c1, keyDig); base[1].dist *= TUNE.digK;   // a little air around the machine: a drone feed, not a portrait
  }

  // live target pose for a mode (the dig shot breathes and follows the swing)
  const live = { 0: pose(), 1: pose(), 2: pose() };
  let follow = 0;
  function target(m, dt) {
    const o = Object.assign(live[m], base[m]);
    if (m === 1) {
      const T = dig.telemetry(tel);
      if (!dig.dragging) follow += (Math.max(-0.25, Math.min(0.25, T.swing * DEG * 0.22)) - follow) * (1 - Math.exp(-dt * 0.7));   // a gentle drift with the swing, frozen while dragging
      o.yaw += follow;
      o.yaw += Math.sin(clockT * 0.71) * 0.006 + Math.sin(clockT * 1.93 + 1) * 0.003;   // a little handheld life
      o.pitch += Math.sin(clockT * 1.13 + 2) * 0.004 + Math.sin(clockT * 2.7) * 0.0015;
      o.ty += Math.sin(clockT * 0.9) * 0.05;
    } else if (m === 2) {
      o.yaw += Math.sin(clockT * 0.05) * 0.06;   // a slow drift so the wide shot never sits dead
    } else {
      o.yaw += Math.sin(clockT * 0.04) * 0.012;
    }
    return o;
  }
  const cam = pose(), from = pose();
  let mode = 1, fl = null;   // fl: { t0, to, far } while flying
  const wFrom = new THREE.Vector3(0, 1, 0), wTo = new THREE.Vector3(0, 1, 0), wG = new THREE.Vector3(0, 1, 0);
  const modeVec = (m, v) => v.set(m === 0 ? 1 : 0, m === 1 ? 1 : 0, m === 2 ? 1 : 0);
  function blendPose(o, a, b, k, arc) {
    o.tx = lerp(a.tx, b.tx, k); o.ty = lerp(a.ty, b.ty, k); o.tz = lerp(a.tz, b.tz, k);
    o.yaw = a.yaw + wrap(b.yaw - a.yaw) * k; o.pitch = lerp(a.pitch, b.pitch, k);
    o.dist = Math.exp(lerp(Math.log(a.dist), Math.log(b.dist), k)) * (1 + arc * Math.sin(Math.PI * k));
    o.fov = lerp(a.fov, b.fov, k); o.sy = lerp(a.sy, b.sy, k);
    for (const n of LOOK) o[n] = n === 'siteR' || n === 'fogD' ? Math.exp(lerp(Math.log(a[n]), Math.log(b[n]), k)) : lerp(a[n], b[n], k);
    return o;
  }

  // ------------------------------------------------------------------ per frame
  const tel = { swing: 0, reach: 0, grade: 0, load: 0, auto: true, ground: 0 };
  const v3 = new THREE.Vector3(), v4 = new THREE.Vector3(), pin = new THREE.Vector3(), bend = new THREE.Vector3();
  let planT = 0, scanT = 3, lastPlanVis = false, hintA = 0;
  const tipXY = [0, 0], ANCH = [[0, 0, 0], [0, 0, 0], [0, 0, 0]], PH = [0, 0, 0];
  const LAB = [tagWords.dig, tagWords.haul, tagWords.grade], TCOL = [pal.cut, pal.accent, pal.fill];
  const hudState = { wDig: 0, wPlan: 0, wExec: 0, tip: [0, 0], tipOn: false, tel, safeTop: 0.2, safeBottom: 0.3, hint: 0, t: 0, tags: [{}, {}, {}], zones: [{}, {}] };
  const zoneVals = { cut: 0, fill: 0 }; let zoneAcc = 1, tagAcc = 1;
  const project = (x, y, z, out) => { v3.set(x, y, z).project(camera); out[0] = (v3.x + 1) / 2 * cw; out[1] = (1 - v3.y) / 2 * ch; return v3.z < 1; };
  function setBox(k, x, z, yaw, hx, hz, h, s) { U.uBoxA.value[k].set(x, z, Math.cos(yaw), Math.sin(yaw)); U.uBoxB.value[k].set(hx, hz, h, s); }
  const CORN = [-1, -1, 1, -1, 1, 1, -1, 1], RX = new Float32Array(4), RZ = new Float32Array(4);
  function rectFoot(set, i, x, z, yaw, hx, hz) {   // no allocation: four draped edges straight into the line set
    const c = Math.cos(yaw), s = Math.sin(yaw);
    for (let k = 0; k < 4; k++) { const lx = CORN[k * 2] * hx, lz = CORN[k * 2 + 1] * hz; RX[k] = x + lx * c + lz * s; RZ[k] = z - lx * s + lz * c; }
    for (let k = 0; k < 4; k++) { const a = k, b = (k + 1) & 3; set.set(i++, RX[a], drapeY(RX[a], RZ[a]), RZ[a], RX[b], drapeY(RX[b], RZ[b]), RZ[b], k / 4, (k + 1) / 4, 1); }
    return i;
  }

  function frame(dt) {
    clockT += dt; TU.value = clockT;
    // flight
    let k = 1;
    if (fl) { k = clamp01((clockT - fl.t0) / FLIGHT); if (k >= 1) { fl = null; wFrom.copy(wTo); } }
    // a fresh flight eases in and out; a retarget leaves at a moderate speed (Hermite, start slope 1.2) so the move never stops
    const ek = fl && fl.re ? (k * k * k - 2 * k * k + k) * 1.2 + (3 - 2 * k) * k * k : easeIO(k);
    const tp = target(mode, dt);
    if (fl) blendPose(cam, from, tp, ek, fl.arc); else Object.assign(cam, tp);
    wG.lerpVectors(wFrom, wTo, ek);
    const wP = wG.x, wD = wG.y, wE = wG.z;
    aim(camera, cam);

    // the world runs in every view
    dig.setArmed(mode === 1 && !fl);
    dig.update(dt, clockT);
    crew.update(dt, clockT);
    field.upload(dt);
    parts.flush();

    // machines right in front of the lens fade out (the chase cam looks across the haul road)
    { const dE = camera.position.distanceTo(exc.root.position), fade = m => m.setOpacity(lerp(1, clamp01((camera.position.distanceTo(m.root.position) - dE * 0.9) / (dE * 0.35)), wD));
      fade(loader); fade(roller); }

    // dots: look + transition pulse + idle scan + heat patch
    U.uCamP.value.copy(camera.position);
    U.uPx.value = ch * PRU.value / (2 * Math.tan(cam.fov * DEG / 2));
    U.uFog.value.set(cam.fogD, cam.siteR, cam.siteW, 0); U.uMinS.value = cam.minS; U.uSizeK.value = cam.sizeK; U.uNear.value = cam.near; U.uMaxPx.value = cam.maxPx;
    U.uMoteA.value = cam.moteA; U.uSkyA.value = cam.skyA; U.uMoteC.value.set(cam.tx, cam.ty, cam.tz, cam.moteW);
    if (fl) { U.uWA.value.copy(wFrom); U.uWB.value.copy(wTo); U.uPulse.value.set(fl.cx, fl.cz, ek * fl.R, Math.sin(Math.PI * k) * 0.9); }
    else { U.uWA.value.copy(wTo); U.uWB.value.copy(wTo); U.uPulse.value.set(0, 0, -100, 0); }
    scanT += dt; const sk = scanT / 4.2;
    if (sk < 1 && !fl) U.uScan.value.set(cam.tx, cam.tz, sk * (mode === 1 ? 60 : 110), (1 - sk) * (mode === 0 ? 0.35 : 0.55)); else U.uScan.value.w = 0;
    if (scanT > 8.5) scanT = 0;
    // planning: morph existing -> design and back, slowly; contours draw on when the view arrives
    if (mode === 0 && !lastPlanVis) planT = 0; lastPlanVis = mode === 0; planT += dt;
    const tri = 1 - Math.abs(((planT / 18) % 1) * 2 - 1);
    U.uMorph.value = mode === 0 ? 0.15 + 0.85 * clamp01((tri - 0.12) / 0.5) : U.uMorph.value * Math.exp(-dt * 2);
    const tip = dig.tip, near = 1 - clamp01((tel.ground - 1.2) / 3);
    U.uBucket.value.set(tip.x, tip.z, 3.4, wD * (0.35 + 0.65 * near));

    // machine shadows (boxes swept along the sun): excavator house + arm, loader, roller
    { const E = SITE.E, sw = tel.swing * DEG, a = E.yaw + sw;
      setBox(0, E.x - Math.cos(a) * 0.6, E.z + Math.sin(a) * 0.6, a, 3.1, 2.1, 4.3, 0.72);
      dig.arm(pin, bend); const mx = (pin.x + tip.x) / 2, mz = (pin.z + tip.z) / 2, len = Math.hypot(tip.x - pin.x, tip.z - pin.z) / 2;
      setBox(1, mx, mz, a, Math.max(0.5, len), 0.45, Math.max(1, (pin.y + bend.y) / 2 - field.ground(mx, mz) + 1.2), 0.6);
      const Lr = crew.L, Rr = crew.R;
      setBox(2, Lr.x + Math.cos(Lr.yaw) * 1.2, Lr.z - Math.sin(Lr.yaw) * 1.2, Lr.yaw, 4.2, 1.7, 4.0, 0.7);
      setBox(3, Rr.x + Math.cos(Rr.yaw) * 0.4, Rr.z - Math.sin(Rr.yaw) * 0.4, Rr.yaw, 3.4, 1.6, 4.2, 0.7);
    }

    // plan graphics
    const pv = clamp01((wP - 0.25) / 0.75), zv = Math.max(pv, clamp01((wE - 0.3) / 0.7) * 0.4);   // zones: full in plan, faint in exec
    contours.mat.uniforms.uOpacity.value = 0.42 * pv; contours.mat.uniforms.uReveal.value = mode === 0 ? clamp01((planT - 0.2) / 2.2) * 1.08 : 1.08;
    for (const z of [zCut, zFill]) z.mat.uniforms.uOpacity.value = 0.95 * zv;
    zAcc.mat.uniforms.uOpacity.value = 0.6 * zv;
    contours.mesh.visible = pv > 0.004; zCut.mesh.visible = zFill.mesh.visible = zAcc.mesh.visible = zv > 0.004;
    foot.mesh.visible = pv > 0.004 || wE > 0.004; foot.mat.uniforms.uOpacity.value = 0.7 * Math.max(pv, wE * 0.6);
    if (foot.mesh.visible) {
      const E = SITE.E, sw = tel.swing * DEG; let i = 0;
      i = rectFoot(foot, i, E.x, E.z, E.yaw, 2.6, 1.95); i = rectFoot(foot, i, E.x, E.z, E.yaw + sw, 2.1, 2.1);
      i = rectFoot(foot, i, crew.L.x + Math.cos(crew.L.yaw) * 1.5, crew.L.z - Math.sin(crew.L.yaw) * 1.5, crew.L.yaw, 4.6, 1.75);
      i = rectFoot(foot, i, crew.R.x + Math.cos(crew.R.yaw) * 0.4, crew.R.z - Math.sin(crew.R.yaw) * 0.4, crew.R.yaw, 3.6, 1.6);
      if (pv > 0.004) for (let s = 0; s < 36; s += 2) { const a0 = s / 36 * Math.PI * 2, a1 = (s + 1) / 36 * Math.PI * 2; foot.set(i++, E.x + Math.cos(a0) * 12, drapeY(E.x + Math.cos(a0) * 12, E.z + Math.sin(a0) * 12), E.z + Math.sin(a0) * 12, E.x + Math.cos(a1) * 12, drapeY(E.x + Math.cos(a1) * 12, E.z + Math.sin(a1) * 12), E.z + Math.sin(a1) * 12, 0, 1, 0.5); }
      foot.commit(i);
    }
    // exec graphics: live paths with a bright head where each machine is, data links pulsing between the machines
    const ev = clamp01((wE - 0.3) / 0.7);
    PH[0] = crew.L.t; PH[1] = crew.R.t; PH[2] = clamp01((tel.swing * DEG - 0.5) / (SITE.pileSw - 0.5));
    for (let j = 0; j < 3; j++) {
      const s = PATHS[j]; s.mesh.visible = ev > 0.004; s.mat.uniforms.uOpacity.value = ev; s.mat.uniforms.uFlow.value.set(0.25, 4, 0.5, 0.45); s.mat.uniforms.uHead.value.set(PH[j], 1.6, 0.25, 0.45);
    }
    links.mesh.visible = ev > 0.004;
    if (links.mesh.visible) {
      const A = ANCH, E = SITE.E;
      A[0][0] = E.x; A[0][1] = field.ground(E.x, E.z) + 7.5; A[0][2] = E.z;
      A[1][0] = crew.L.x; A[1][1] = field.ground(crew.L.x, crew.L.z) + 6.5; A[1][2] = crew.L.z;
      A[2][0] = crew.R.x; A[2][1] = field.ground(crew.R.x, crew.R.z) + 6; A[2][2] = crew.R.z;
      for (let j = 0; j < 3; j++) { const a = A[j], b = A[(j + 1) % 3]; links.set(j, a[0], a[1], a[2], b[0], b[1], b[2], j / 3, (j + 1) / 3, 1); }
      links.commit(3); links.mat.uniforms.uOpacity.value = 0.55 * ev; links.mat.uniforms.uFlow.value.set(0.45, 6, 1.6, 0.18);
      hudState.anchors = A;
    }

    // HUD state
    tagAcc += dt;
    hudState.wDig = wD * (fl ? 0 : 1) + (fl ? Math.max(0, wTo.y * (k - 0.75) * 4) : 0); hudState.wPlan = clamp01((wP - 0.6) / 0.4); hudState.wExec = clamp01((wE - 0.6) / 0.4);
    hudState.safeTop = SAFE.top; hudState.safeBottom = SAFE.bottom; hudState.t = clockT;
    hudState.tip = project(tip.x, tip.y, tip.z, tipXY) ? tipXY : null;
    const showHint = interactive && mode === 1 && !fl && !dig.hintGone;
    hintA += ((showHint ? 1 : 0) - hintA) * (1 - Math.exp(-dt * (showHint ? 2 : 5))); hudState.hint = hintA;
    if (hudState.wExec > 0.01 && hudState.anchors) {
      const A = hudState.anchors;
      for (let j = 0; j < 3; j++) { const T = hudState.tags[j]; T.p = T.p || [0, 0]; T.a = project(A[j][0], A[j][1], A[j][2], T.p) ? 1 : 0; T.label = LAB[j]; T.color = TCOL[j]; }
      if (tagAcc > 0.1) {   // the numbers tick at 10 Hz (fewer strings, and they stay readable)
        tagAcc = 0; const T = hudState.tags;
        T[0].value = Math.round(tel.load * 100) + '%'; T[1].value = (crew.L.speed * 3.6).toFixed(1) + ' km/h'; T[2].value = (crew.R.speed * 3.6).toFixed(1) + ' km/h';
      }
    }
    if (hudState.wPlan > 0.01) {
      zoneAcc += dt;
      if (zoneAcc > 0.5) { zoneAcc = 0; zoneVals.cut = avgDiff(SITE.pit, 1); zoneVals.fill = avgDiff(SITE.pad, -1); }
      const Z = hudState.zones; Z[0].p = Z[0].p || [0, 0]; Z[1].p = Z[1].p || [0, 0];
      Z[0].a = project(SITE.pit.x, hD(SITE.pit.x, SITE.pit.z), SITE.pit.z, Z[0].p) ? 1 : 0; Z[0].label = words.cut; Z[0].value = zoneVals.cut.toFixed(2) + ' m'; Z[0].color = pal.cut;
      Z[1].a = project(SITE.pad.x, hD(SITE.pad.x, SITE.pad.z), SITE.pad.z, Z[1].p) ? 1 : 0; Z[1].label = words.fill; Z[1].value = zoneVals.fill.toFixed(2) + ' m'; Z[1].color = pal.fill;
    }
    hud.draw(hudState);

    // sky and motes
    U.uInvP.value.copy(camera.projectionMatrixInverse); U.uCamW.value.copy(camera.matrixWorld);
    mote.visible = cam.moteA > 0.01 && gov.motes;
    governor(dt);
  }
  // mean remaining cut (sign 1) or fill (sign -1) over a zone, m
  function avgDiff(P, sign) {
    let s = 0, n = 0; const c = Math.cos(P.rot), si = Math.sin(P.rot);
    for (let a = -1; a <= 1.001; a += 0.25) for (let b = -1; b <= 1.001; b += 0.25) {
      const lx = a * P.hx * 0.85, lz = b * P.hz * 0.85, x = P.x + lx * c + lz * si, z = P.z - lx * si + lz * c;
      s += Math.max(0, sign * (field.ground(x, z) - hD(x, z))); n++;
    }
    return s / n;
  }

  // ------------------------------------------------------------------ adaptive quality (frame time -> DPR, dots, bloom, motes)
  // levels: 3 full, 2 lower DPR, 1 DPR 1 + 70% dots, 0 DPR .85 + 50% dots + no motes + no bloom
  const gov = { level: LOW ? 1 : 3, max: LOW ? 1 : 3, ema: 1 / 60, slow: 0, fast: 0, motes: true, real: false };
  function applyLevel() {
    const l = gov.level, dpr = Math.min(window.devicePixelRatio || 1, PR_MAX);
    const pr = LOW ? (l >= 1 ? 1 : 0.85) : l === 3 ? dpr : l === 2 ? Math.min(dpr, 1.25) : l === 1 ? 1 : 0.85;
    const dens = l >= 2 ? 1 : l === 1 ? (LOW ? 1 : 0.7) : 0.5;
    U.uDensity.value = dens; dots.geo.setDrawRange(0, Math.ceil(dots.N * dens));
    gov.motes = l > 0; post.bloomOn = l > 0;
    if (pr !== prCap) { prCap = pr; renderer.setPixelRatio(pr); setBuf(); }
  }
  function governor(dt) {
    if (!gov.real || dt <= 0 || dt > 0.25) return;
    gov.ema += (dt - gov.ema) * 0.08;
    if (gov.ema > 1 / 45) { gov.slow += dt; gov.fast = 0; } else if (gov.ema < 1 / 57) { gov.fast += dt; gov.slow = 0; } else { gov.slow = gov.fast = 0; }
    if (gov.slow > 1.5 && gov.level > 0) { gov.level--; gov.slow = 0; gov.ema = 1 / 60; applyLevel(); }
    else if (gov.fast > 6 && gov.level < gov.max) { gov.level++; gov.fast = 0; applyLevel(); }
  }

  // ------------------------------------------------------------------ size / visibility
  let alloc = false, freeT = 0;
  function setBuf() {
    if (alloc) renderer.setSize(cw, ch, false);
    const v = new THREE.Vector2(); renderer.getDrawingBufferSize(v); RES.value.copy(v);
    PRU.value = alloc ? v.x / cw : renderer.getPixelRatio();
    post.setSize(v.x, v.y);
    hud.resize(alloc ? cw : 1, alloc ? ch : 1, window.devicePixelRatio || 1);
  }
  function edges() { post.P.edge.set(0.07, Math.max(0.08, SAFE.top * 0.8), Math.max(0.08, SAFE.bottom * 0.45), 0); }
  function resize() {
    edges();
    cw = Math.max(1, host.clientWidth); ch = Math.max(1, host.clientHeight);
    camera.aspect = cw / ch; setBuf(); refit();
  }
  let running = false, raf = 0, last = 0;
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null; if (ro) ro.observe(host); else window.addEventListener('resize', resize);
  resize(); applyLevel();
  Object.assign(cam, base[1]);

  function draw() {
    renderer.info.reset();
    post.begin();
    renderer.render(skyScene, camera);
    renderer.render(scene, camera);
    post.end(clockT);
  }
  function loop(ts) {
    raf = requestAnimationFrame(loop);
    const dt = last ? (ts - last) / 1000 : 0.016; last = ts;
    gov.real = true; frame(Math.min(0.05, dt)); if (dt < 0.25) governor(0); draw();
  }
  function allocate() { clearTimeout(freeT); if (!alloc) { alloc = true; setBuf(); } }

  // pre-age the site (about 75 s of work, in small chunks off the critical path) so the first look already has a pit, a
  // pile, tracks and a part-filled pad. Nothing to download: ready resolves when this is done.
  const ready = (async () => {
    for (let c = 0; c < 5; c++) {
      for (let i = 0; i < 225; i++) { clockT += 1 / 15; dig.update(1 / 15, clockT); crew.update(1 / 15, clockT); }
      await new Promise(r => setTimeout(r, 0));
    }
    field.tex.needsUpdate = true;
  })();

  return {
    ready,
    // Safe insets (fractions of the host height) kept clear of the subject: top for the heading, bottom for the tabs.
    setSafe(o = {}) {
      const t = +o.top, b = +o.bottom;
      if (Number.isFinite(t)) SAFE.top = Math.min(0.45, Math.max(0, t));
      if (Number.isFinite(b)) SAFE.bottom = Math.min(0.6, Math.max(0, b));
      edges(); refit();
    },
    // kept for the old page contract; the framing now comes from setSafe
    setFrame() {},
    // Tab click: fly to mode i (0 plan, 1 dig, 2 exec) over FLIGHT s. A click mid-flight retargets from the current pose.
    // instant = jump (page not on screen).
    setMode(i, instant = false) {
      i = Math.max(0, Math.min(2, i | 0));
      if (i === mode && !instant && !fl) return;
      if (instant) { mode = i; fl = null; modeVec(i, wFrom); wTo.copy(wFrom); Object.assign(cam, target(i, 0)); return; }
      const re = !!fl;
      Object.assign(from, cam);
      wFrom.copy(wG); modeVec(i, wTo); mode = i;
      const b = base[i]; const far = Math.abs(Math.log(from.dist / b.dist));
      fl = { t0: clockT, arc: re ? 0 : Math.min(0.35, far * 0.12), cx: b.tx, cz: b.tz, R: 95, re };
      scanT = 99;
    },
    get mode() { return mode; },
    get flying() { return !!fl; },
    onTelemetry() { return () => {}; },
    onGame() { return () => {}; },
    resize,
    // start(true): the page drives frames through step(dt) (gsap.ticker); otherwise the scene runs its own rAF loop
    start(external = false) { allocate(); if (running) return; running = true; last = 0; if (!external) raf = requestAnimationFrame(loop); },
    step(dt) { if (running) { gov.real = true; frame(Math.min(0.05, dt)); draw(); } },
    stop() {
      running = false; cancelAnimationFrame(raf); hud.clear();
      clearTimeout(freeT); freeT = setTimeout(() => { if (!running && alloc) { alloc = false; renderer.setSize(1, 1, false); setBuf(); } }, 2500);
    },
    // test hook: n fixed steps of dt, then draw once (headless screenshots, no frame timing involved)
    renderNow(dt = 1 / 60, n = 1) { allocate(); gov.real = false; for (let i = 0; i < n; i++) frame(dt); draw(); },
    // compile every program now: all three looks, plan + exec lines, particles, motes, the sky and the post chain.
    // Hidden objects are made visible for one off-screen draw, then restored.
    warm() {
      const vis = []; scene.traverse(o => { vis.push([o, o.visible]); o.visible = true; });
      const bl = post.bloomOn; post.bloomOn = true;
      try {
        if (renderer.compile) { renderer.setRenderTarget(post.rt); renderer.compile(scene, camera); renderer.compile(skyScene, camera); }
        draw();
      } finally { for (const [o, v] of vis) o.visible = v; post.bloomOn = bl; }
      return null;
    },
    get canvas() { return canvas; },
    get stats() {
      const v = new THREE.Vector2(); renderer.getDrawingBufferSize(v);
      return { buffer: [v.x, v.y], pr: PRU.value, calls: renderer.info.render.calls, points: Math.ceil(dots.N * U.uDensity.value), dotsTotal: dots.N, programs: renderer.info.programs.length, level: gov.level, mode, flying: !!fl };
    },
    // QA: camera pose (position + forward), the dig, the crew and the field
    camState() { camera.getWorldDirection(v4); return { p: camera.position.toArray(), d: v4.toArray(), fov: camera.fov }; },
    qa: { dig, crew, field, SAFE, base, gov, hudState, renderer, project, SHOT, TUNE, U, refit() { refit(); }, govTick(dt) { gov.real = true; governor(dt); } },
    dispose() {
      this.stop(); clearTimeout(freeT); if (ro) ro.disconnect(); else window.removeEventListener('resize', resize);
      dig.dispose(); hud.dispose(); post.dispose(); field.dispose();
      scene.traverse(o => { if (o.geometry) o.geometry.dispose(); });
      mote.material.dispose(); parts.pts.material.dispose();
      for (const s of [contours, zCut, zFill, zAcc, foot, pathL, pathR, pathE, links]) s.mat.dispose();
      dotMat.dispose(); sky.geometry.dispose(); sky.material.dispose();
      for (const m of [exc, loader, roller]) m.dispose();
      kit.disposeAll();
      renderer.dispose(); canvas.remove();
    },
  };
}
