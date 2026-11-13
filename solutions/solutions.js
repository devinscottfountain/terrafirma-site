// solutions.js: TerraFirma homepage Solutions scene. One continuous jobsite seen three ways, chosen by the page's tabs (never
// by scroll), with a real camera flight between them:
//   Orchestration (mode 1) = the dig: a drone chase cam behind one excavator, an operator HUD, click to dig and click to
//                            drop (desktop); it drives to the spot when it has to and the camera follows.
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
const TOPO_A = 0.2;      // contour strength in Planning without a [data-sol-topo] element (was .42 before #41)

// Words (client-facing) come from data-sol-* attributes on the section or the mount; these are only fallbacks.
const WORDS = {
  hint: ['hint', 'Click to dig'], hintDrop: ['hint-drop', 'Click to drop'],
  dig: ['tag-dig', 'Excavator 01'], haul: ['tag-haul', 'Dozer 02'], grade: ['tag-grade', 'Compactor 03'],
  auto: ['hud-auto', 'Autopilot'], manual: ['hud-manual', 'Manual'], swing: ['hud-swing', 'Swing'], reach: ['hud-reach', 'Reach'],
  depth: ['hud-depth', 'To grade'], load: ['hud-load', 'Load'], grade_: ['hud-grade', 'Grade'],
  cut: ['label-cut', 'Cut'], fill: ['label-fill', 'Fill'],
};

// Working zones as ground polygons [[x, z], ...] (dig, haul, grade): the excavator's drive zone grown by its house radius,
// the hull of every dozer footprint along its push line, and the compactor's lanes grown by its footprint.
// Built once; the plan view draws them and QA checks they never overlap.
const rectPts = (x, z, yaw, hx, hz, off = 0) => {
  const c = Math.cos(yaw), s = Math.sin(yaw); x += c * off; z -= s * off;
  return [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) => [x + a * hx * c + b * hz * s, z - a * hx * s + b * hz * c]);
};
function hull(P) {   // monotone chain convex hull
  P = P.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), lo = [], up = [];
  for (const p of P) { while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
  for (let i = P.length - 1; i >= 0; i--) { const p = P[i]; while (up.length > 1 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}
export function machineZones(crew) {
  const F = SITE.FOOT, Z = SITE.digZone, hr = Math.hypot(F.house.hx, F.house.hz);
  const dig = rectPts(Z.x, Z.z, Z.rot, Z.hx + hr, Z.hz + hr);
  const pts = [], add = (x, z, yaw) => pts.push(...rectPts(x, z, yaw, F.haul.hx, F.haul.hz, F.haul.off));
  for (const V of crew.VAR) {
    let prev = null;
    for (const g of V) {
      const P = g.p; let first = true;
      for (let s = 0; s <= P.len + 0.01; s += 0.5) {
        const a = P.at(s), yaw = g.dir > 0 ? Math.atan2(-a.dz, a.dx) : Math.atan2(a.dz, -a.dx);
        if (first && prev != null) for (let k = 1; k < 8; k++) { const y = prev + Math.atan2(Math.sin(yaw - prev), Math.cos(yaw - prev)) * k / 8; add(a.x, a.z, y); }   // pivot between legs
        add(a.x, a.z, yaw); prev = yaw; first = false;
      }
    }
  }
  const haul = hull(pts);
  const P = SITE.pad, R = crew.roll, c = Math.cos(P.rot), s = Math.sin(P.rot);
  const lx0 = R.x0 - F.grade.hx + F.grade.off, lx1 = R.x1 + F.grade.hx + F.grade.off, lzh = R.zh + F.grade.hz, mx = (lx0 + lx1) / 2;
  const grade = rectPts(P.x + mx * c, P.z - mx * s, P.rot, (lx1 - lx0) / 2, lzh);
  return [dig, haul, grade];
}

// Topographic map (#41): the contour art lives in Webflow, an inline SVG inside [data-sol-topo] in the section (written by
// solutions/tools/topo-svg.mjs, world metres: SVG x = x, SVG y = z). Its viewBox maps onto the 100 m site square, so swapped
// art still lands on the site. Each line is draped on the design surface. Returns segments in the buildContours layout
// [x0, y0, z0, x1, y1, z1, t, major], or null (no element, no paths) so the caller falls back to the built-in contours.
const TOPO_HALF = 50, TOPO_SUB = 1.2;   // m: half the site square, longest draped piece
export function topoFromSvg(el) {
  const svg = el && el.querySelector('svg'), vb = svg && (svg.getAttribute('viewBox') || '').trim().split(/[\s,]+/).map(Number);
  if (!vb || vb.length !== 4 || !(vb[2] > 0 && vb[3] > 0)) return null;
  const k = (TOPO_HALF * 2) / Math.max(vb[2], vb[3]), cx = SITE.centre.x, cz = SITE.centre.z;
  const ox = cx - (vb[0] + vb[2] / 2) * k, oz = cz - (vb[1] + vb[3] / 2) * k, out = [];
  for (const p of svg.querySelectorAll('path')) {
    const major = p.closest('[data-major]') ? 1 : 0, tok = (p.getAttribute('d') || '').match(/[a-df-z]|-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi) || [];
    let i = 0, cmd = '', x = 0, z = 0, sx = 0, sz = 0;
    const seg = (nx, nz) => {   // one straight piece in SVG units, cut so it follows the ground
      const ax = ox + x * k, az = oz + z * k, bx = ox + nx * k, bz = oz + nz * k, n = Math.max(1, Math.ceil(Math.hypot(bx - ax, bz - az) / TOPO_SUB));
      for (let q = 0; q < n; q++) {
        const x0 = lerp(ax, bx, q / n), z0 = lerp(az, bz, q / n), x1 = lerp(ax, bx, (q + 1) / n), z1 = lerp(az, bz, (q + 1) / n);
        const t = Math.min(1, Math.hypot((x0 + x1) / 2 - cx, (z0 + z1) / 2 - cz) / (TOPO_HALF * 1.2));
        out.push(x0, hD(x0, z0) + 0.05, z0, x1, hD(x1, z1) + 0.05, z1, t, major);
      }
      x = nx; z = nz;
    };
    while (i < tok.length) {
      if (/[a-z]/i.test(tok[i])) cmd = tok[i++];
      const C = cmd.toUpperCase(), r = cmd !== C, n = () => +tok[i++];
      if (C === 'Z') { seg(sx, sz); cmd = ''; continue; }
      if (!C || i >= tok.length) break;
      if (C === 'M') { const a = n(), b = n(); x = r ? x + a : a; z = r ? z + b : b; sx = x; sz = z; cmd = r ? 'l' : 'L'; }
      else if (C === 'L' || C === 'T') { const a = n(), b = n(); seg(r ? x + a : a, r ? z + b : b); }
      else if (C === 'H') { const a = n(); seg(r ? x + a : a, z); }
      else if (C === 'V') { const a = n(); seg(x, r ? z + a : a); }
      else { // curves and arcs: straight to the end point (the generator writes straight lines only)
        const m = C === 'C' ? 6 : C === 'S' || C === 'Q' ? 4 : C === 'A' ? 7 : 0; if (!m) break;
        i += m - 2; const a = n(), b = n(); seg(r ? x + a : a, r ? z + b : b);
      }
    }
  }
  return out.length ? out : null;
}

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
    uAmb: { value: new THREE.Vector3(0.2, 0.22, 0.27) }, uSunC: { value: new THREE.Vector3(2.4, 1.7, 1.12) },
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
  // Slots (Tim's Figma "New Vehicles", 23099:9765): the dozer took the haul job (it replaced the backhoe loader stand-in) and
  // the padfoot compactor the grade job (it replaced the roller stand-in). To swap a model in later, change the factory here
  // and model it in sol-machines.js (the old backhoe and roller are still in the kit). `dig` must keep the excavator rig API
  // (setArm, tip, bucket, boom); `haul` and `grade` only need root, setDrive, setOpacity; the crew also drives setBlade /
  // setRipper (haul) and setSteer (grade) when a model has them.
  const kit = createMachineKit(THREE, { line: pal.accent });
  const SLOT = { dig: kit.excavator, haul: kit.dozer, grade: kit.compactor };
  const mk = fn => { const m = fn(); m.root.scale.setScalar(MSCALE); m.root.rotation.order = 'YXZ'; scene.add(m.root); m.setOpacity(1); return m; };
  const exc = mk(SLOT.dig), loader = mk(SLOT.haul), roller = mk(SLOT.grade);   // loader / roller: the haul and grade slots

  // ------------------------------------------------------------------ the dig and the crew
  let clockT = 0; const clock = () => clockT;
  const dig = createDig({ THREE, exc, field, camera, canvas, interactive, MSCALE, parts, clock });
  const crew = createCrew({ field, slot: { haul: loader, grade: roller }, parts, MSCALE });

  // ------------------------------------------------------------------ plan graphics (lines)
  const L = (color, width, maxSeg, opts) => { const s = lineSet(THREE, lineMaterial(THREE, RES, PRU, TU, color, { width, ...opts }), maxSeg); s.mesh.renderOrder = 4; scene.add(s.mesh); return s; };
  // topographic map: art from the Webflow element when there is one (that element is hidden while the canvas lives, it is
  // the source and the no-3D fallback), else the built-in contours. Strength: the element's CSS opacity (see readTopoA()).
  const topoEl = root.querySelector('[data-sol-topo]'), topoVis = topoEl ? topoEl.style.visibility : '';
  const contourSegs = topoFromSvg(topoEl) || buildContours({ step: LOW ? 1.2 : 0.8 });
  if (topoEl) topoEl.style.visibility = 'hidden';
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
  // a dashed closed outline (0.8 m dashes), draped on the design surface
  function dashed(set, i, pts) {
    for (let a = 0; a < pts.length; a++) {
      const p = pts[a], q = pts[(a + 1) % pts.length], L0 = Math.hypot(q[0] - p[0], q[1] - p[1]), n = Math.max(1, Math.round(L0 / 1.6));
      for (let k = 0; k < n; k++) {
        const f0 = k / n, f1 = (k + 0.5) / n, x0 = lerp(p[0], q[0], f0), z0 = lerp(p[1], q[1], f0), x1 = lerp(p[0], q[0], f1), z1 = lerp(p[1], q[1], f1);
        set.set(i++, x0, drapeY(x0, z0), z0, x1, drapeY(x1, z1), z1, 0, 0, 0.6);
      }
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
  const foot = L(col(pal.accent), 1, 96);   // machine footprints (live)
  // working zones (plan): where each machine's body goes. They never overlap (see SITE in sol-terrain.js).
  const ZONES = machineZones(crew);
  const zoneL = [L(col(pal.cut), 1, 120), L(col(pal.accent), 1, 120), L(col(pal.fill), 1, 120)];
  ZONES.forEach((z, j) => zoneL[j].commit(dashed(zoneL[j], 0, z)));

  // ------------------------------------------------------------------ exec graphics: live paths + data links
  const pathL = L(col(pal.accent), 1.3, 400), pathR = L(col(pal.fill), 1.3, 200), pathE = L(col(pal.cut), 1.3, 64), links = L(col(pal.accent), 1, 3, { depthTest: false });
  const gY = (x, z) => field.ground(x, z) + 0.25;
  { let i = 0; for (const p of crew.paths()) i = polyline(pathL, i, p.pts, false, p.t0, p.t1, 1, gY, 1); pathL.commit(i); }
  { let i = 0; const n = crew.lanes.length; for (let k = 0; k < n; k++) { const a = crew.rollPath[k * 2], b = crew.rollPath[k * 2 + 1]; i = polyline(pathR, i, [a, b], false, k / n, (k + 1) / n, 1, gY, 12); } pathR.commit(i); }
  { const pts = []; for (let k = 0; k <= 24; k++) { const sw = lerp(0.5, SITE.pileSw, k / 24), a = SITE.E.yaw + sw, r = lerp(8.4, SITE.pileR, k / 24); pts.push([SITE.E.x + Math.cos(a) * r, SITE.E.z - Math.sin(a) * r]); } polyline(pathE, 0, pts, false, 0, 1, 1, gY, 1); pathE.commit(24); }
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
  const TUNE = { execYaw: 0.8, execK: 1.0, digYaw: 0.95, digAhead: 6.6, digK: 1.22 };
  const keyPlan = [], keyExec = [], keyDig = [];
  for (const P of [SITE.pit, SITE.pad, SITE.plat]) for (const [x, z] of rectPoly({ ...P, hx: P.hx + P.ws * 0.6, hz: P.hz + P.ws * 0.6 })) keyPlan.push(new THREE.Vector3(x, hD(x, z), z));
  for (const Zn of ZONES) for (const [x, z] of Zn) keyPlan.push(new THREE.Vector3(x, hD(x, z), z));   // the machine zones too
  // exec frames the three machines' work: the pit and the pile (excavator), the dozer's zone, the compactor's zone
  const pitM = rectPoly({ ...SITE.pit, hx: SITE.pit.hx + 2, hz: SITE.pit.hz + 2 }), excM = [0, 1, 2, 3, 4, 5].map(k => [SITE.E.x + Math.cos(k * 1.047) * 4, SITE.E.z + Math.sin(k * 1.047) * 4]);
  for (const [x, z] of [...pitM, ...excM, [SITE.pile.x, SITE.pile.z], ...ZONES[1], ...ZONES[2]]) keyExec.push(new THREE.Vector3(x, hD(x, z), z), new THREE.Vector3(x, hD(x, z) + 4, z));
  const mid = K => { let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9; for (const v of K) { x0 = Math.min(x0, v.x); x1 = Math.max(x1, v.x); z0 = Math.min(z0, v.z); z1 = Math.max(z1, v.z); } return { x: (x0 + x1) / 2, z: (z0 + z1) / 2 }; };
  const planC = mid(keyPlan), execC = mid(keyExec);
  { const E = SITE.E;
    for (let a = 0; a < 12; a++) { const s = a / 12 * Math.PI * 2; keyDig.push(new THREE.Vector3(E.x + Math.cos(s) * 3.6, hF(E.x, E.z) + (a % 2 ? 5.2 : 0), E.z + Math.sin(s) * 3.6)); }
    for (const sw of [-0.5, 0, 0.5]) for (const r of [5, 11]) { const x = E.x + Math.cos(E.yaw + sw) * r, z = E.z - Math.sin(E.yaw + sw) * r; keyDig.push(new THREE.Vector3(x, hD(x, z), z)); }
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

  // live target pose for a mode (the dig shot breathes, drifts with the swing, and follows the machine when it drives)
  const live = { 0: pose(), 1: pose(), 2: pose() };
  let follow = 0;
  const foc = { x: 0, z: 0, ok: false }, focW = { x: 0, z: 0 }, sv = [0, 1, 2, 3].map(() => new THREE.Vector3());
  let zoom = 1;
  // where the chase cam looks: ahead of the cab at home (the base shot); with a visitor driving, between the machine and
  // the spot it is working, so both stay in frame
  function focusGoal(out) {
    const B = dig.body, O = dig.op;
    if (dig.user && O.on) { let dx = O.x - B.x, dz = O.z - B.z; const d = Math.hypot(dx, dz), k = d > 0.01 ? Math.min(d * 0.6, TUNE.digAhead) / d : 0; out.x = B.x + dx * k; out.z = B.z + dz * k; return out; }
    if (dig.user) return out;   // idle under a visitor: stay put
    out.x = B.x + Math.cos(SITE.E.yaw) * TUNE.digAhead; out.z = B.z - Math.sin(SITE.E.yaw) * TUNE.digAhead; return out;
  }
  function target(m, dt) {
    const o = Object.assign(live[m], base[m]);
    if (m === 1) {
      const T = dig.telemetry(tel);
      if (!foc.ok) { focW.x = o.tx; focW.z = o.tz; focusGoal(focW); foc.x = focW.x; foc.z = focW.z; foc.ok = true; }
      focusGoal(focW); const kf = 1 - Math.exp(-dt * 1.1); foc.x += (focW.x - foc.x) * kf; foc.z += (focW.z - foc.z) * kf;
      const bx = o.tx, bz = o.tz; o.tx = foc.x; o.tz = foc.z; o.ty += (hF(foc.x, foc.z) - hF(bx, bz)) * 0.6;
      // soft fit: the boom elbow, the teeth, the cab top and the click marker stay inside the safe band; the shot eases out
      // when one would leave it and back in when there is room again (measured on last frame's camera)
      if (!fl && mode === 1) {
        const yT = 1 - 2 * SAFE.top - 0.03, yB = 2 * SAFE.bottom - 1 + 0.03; let ex = -1;
        exc.stick.getWorldPosition(sv[0]); sv[1].copy(dig.tip); sv[2].set(dig.body.x, field.ground(dig.body.x, dig.body.z) + 4.6, dig.body.z);
        const M = dig.marks[0]; sv[3].set(M.x, field.ground(M.x, M.z), M.z); const nP = M.on && M.out < M.t0 ? 4 : 3;
        for (let q = 0; q < nP; q++) { fv.copy(sv[q]).project(camera); if (fv.z < 1) ex = Math.max(ex, fv.y - yT, yB - fv.y, Math.abs(fv.x) - 0.94); }
        const zg = ex > 0 ? Math.min(1.5, zoom * (1 + ex * 0.8)) : ex < -0.12 ? 1 : zoom;
        zoom += (zg - zoom) * (1 - Math.exp(-dt * (zg > zoom ? 2.5 : 0.6)));
      }
      o.dist *= zoom;
      const fg = dig.user ? 0 : Math.max(-0.25, Math.min(0.25, T.swing * DEG * 0.22));   // a gentle drift with the autopilot's swing
      follow += (fg - follow) * (1 - Math.exp(-dt * 0.7));
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
  const MRK = 28, GHOST = 18;   // points per marker ring, per ghost path
  const hudState = { wDig: 0, wPlan: 0, wExec: 0, tip: [0, 0], tipOn: false, tel, safeTop: 0.2, safeBottom: 0.3, hint: 0, hintText: words.hint, t: 0, tags: [{}, {}, {}], zones: [{}, {}],
    // click markers (ring on the ground, projected) and the ghost path while it drives; mbox: machine screen boxes (tags avoid them)
    marks: [0, 1].map(() => ({ a: 0, kind: 'dig', queued: false, pop: 1, n: 0, pts: new Float32Array(MRK * 2), c: [0, 0] })),
    ghost: { a: 0, n: 0, pts: new Float32Array(GHOST * 2), foot: new Float32Array(8), footOn: false },
    mbox: [new Float32Array(4), new Float32Array(4), new Float32Array(4)] };
  const MRK_R = 1.6, pp = [0, 0], EXC_BOX = { hx: 3, hz: 3, off: 0 };
  // project the click markers and the ghost path (no allocation: straight into the preallocated arrays)
  function digMarks(dt) {
    for (let j = 0; j < 2; j++) {
      const M = dig.marks[j], H = hudState.marks[j];
      const fade = M.out > M.t0 ? clamp01(1 - (clockT - M.out) / 0.6) : 1;
      H.a = M.on ? fade : 0; H.kind = M.kind; H.queued = j === 1; H.pop = 1 + 0.6 * Math.exp(-(clockT - M.t0) * 9); H.n = 0;
      if (H.a < 0.01) continue;
      const R = MRK_R * H.pop * (H.queued ? 0.8 : 1);
      for (let q = 0; q < MRK; q++) {
        const a = q / MRK * Math.PI * 2, x = M.x + Math.cos(a) * R, z = M.z + Math.sin(a) * R;
        if (!project(x, field.ground(x, z) + 0.08, z, pp)) { H.n = 0; break; }
        H.pts[q * 2] = pp[0]; H.pts[q * 2 + 1] = pp[1]; H.n = q + 1;
      }
      if (project(M.x, field.ground(M.x, M.z) + 0.08, M.z, pp)) { H.c[0] = pp[0]; H.c[1] = pp[1]; } else H.n = 0;
    }
    const G = hudState.ghost, D = dig.drv, B = dig.body;
    G.a += ((dig.driving && dig.user ? 1 : 0) - G.a) * (1 - Math.exp(-dt * 6)); G.n = 0; G.footOn = false;
    if (G.a < 0.01) return;
    for (let q = 0; q < GHOST; q++) {
      const f = q / (GHOST - 1), x = lerp(B.x, D.x, f), z = lerp(B.z, D.z, f);
      if (!project(x, field.ground(x, z) + 0.1, z, pp)) break;
      G.pts[q * 2] = pp[0]; G.pts[q * 2 + 1] = pp[1]; G.n = q + 1;
    }
    // where it will stop: its footprint, facing the way it travels
    const yaw = Math.atan2(-(D.z - D.z0), D.x - D.x0) + (D.rev ? Math.PI : 0), c = Math.cos(yaw), s = Math.sin(yaw), F = SITE.FOOT.dig;
    G.footOn = true;
    for (let q = 0; q < 4; q++) {
      const lx = CORN[q * 2] * F.hx, lz = CORN[q * 2 + 1] * F.hz, x = D.x + lx * c + lz * s, z = D.z - lx * s + lz * c;
      if (!project(x, field.ground(x, z) + 0.1, z, pp)) { G.footOn = false; break; }
      G.foot[q * 2] = pp[0]; G.foot[q * 2 + 1] = pp[1];
    }
  }
  // screen box of a machine: its footprint at the ground and h m up
  function machineBox(out, x, z, yaw, F, h) {
    const c = Math.cos(yaw), s = Math.sin(yaw), ox = x + c * (F.off || 0), oz = z - s * (F.off || 0);
    out[0] = out[1] = 1e9; out[2] = out[3] = -1e9;
    for (let q = 0; q < 8; q++) {
      const lx = CORN[(q & 3) * 2] * F.hx, lz = CORN[(q & 3) * 2 + 1] * F.hz, px = ox + lx * c + lz * s, pz = oz - lx * s + lz * c;
      if (!project(px, field.ground(px, pz) + (q > 3 ? h : 0), pz, pp)) continue;
      out[0] = Math.min(out[0], pp[0]); out[1] = Math.min(out[1], pp[1]); out[2] = Math.max(out[2], pp[0]); out[3] = Math.max(out[3], pp[1]);
    }
  }
  function growBox(out, q) {
    if (!project(q.x, q.y + 0.6, q.z, pp)) return;
    out[0] = Math.min(out[0], pp[0] - 14); out[1] = Math.min(out[1], pp[1] - 14); out[2] = Math.max(out[2], pp[0] + 14); out[3] = Math.max(out[3], pp[1] + 14);
  }
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

    // machine shadows (boxes swept along the sun): excavator house + arm, dozer, compactor
    { const E = dig.body, sw = tel.swing * DEG, a = E.yaw + sw;
      setBox(0, E.x - Math.cos(a) * 0.6, E.z + Math.sin(a) * 0.6, a, 3.1, 2.1, 4.3, 0.72);
      dig.arm(pin, bend); const mx = (pin.x + tip.x) / 2, mz = (pin.z + tip.z) / 2, len = Math.hypot(tip.x - pin.x, tip.z - pin.z) / 2;
      setBox(1, mx, mz, a, Math.max(0.5, len), 0.45, Math.max(1, (pin.y + bend.y) / 2 - field.ground(mx, mz) + 1.2), 0.6);
      const Lr = crew.L, Rr = crew.R;
      setBox(2, Lr.x + Math.cos(Lr.yaw) * 0.4, Lr.z - Math.sin(Lr.yaw) * 0.4, Lr.yaw, 5.0, 2.6, 5.4, 0.7);
      setBox(3, Rr.x - Math.cos(Rr.yaw) * 0.6, Rr.z + Math.sin(Rr.yaw) * 0.6, Rr.yaw, 3.6, 1.6, 4.2, 0.7);
    }

    // plan graphics
    const pv = clamp01((wP - 0.25) / 0.75), zv = Math.max(pv, clamp01((wE - 0.3) / 0.7) * 0.4);   // zones: full in plan, faint in exec
    contours.mat.uniforms.uOpacity.value = topoA * pv; contours.mat.uniforms.uReveal.value = mode === 0 ? clamp01((planT - 0.2) / 2.2) * 1.08 : 1.08;
    for (const z of [zCut, zFill]) z.mat.uniforms.uOpacity.value = 0.95 * zv;
    zAcc.mat.uniforms.uOpacity.value = 0.6 * pv;   // platform + road: plan only (in exec it would sit up by the heading)
    contours.mesh.visible = pv > 0.004; zCut.mesh.visible = zFill.mesh.visible = zAcc.mesh.visible = zv > 0.004;
    for (const z of zoneL) { z.mesh.visible = pv > 0.004; z.mat.uniforms.uOpacity.value = 0.75 * pv; }
    foot.mesh.visible = pv > 0.004 || wE > 0.004; foot.mat.uniforms.uOpacity.value = 0.7 * Math.max(pv, wE * 0.6);
    if (foot.mesh.visible) {
      const E = dig.body, sw = tel.swing * DEG, F = SITE.FOOT; let i = 0;
      i = rectFoot(foot, i, E.x, E.z, E.yaw, F.dig.hx, F.dig.hz); i = rectFoot(foot, i, E.x, E.z, E.yaw + sw, F.house.hx, F.house.hz);
      i = rectFoot(foot, i, crew.L.x + Math.cos(crew.L.yaw) * F.haul.off, crew.L.z - Math.sin(crew.L.yaw) * F.haul.off, crew.L.yaw, F.haul.hx, F.haul.hz);
      i = rectFoot(foot, i, crew.R.x + Math.cos(crew.R.yaw) * F.grade.off, crew.R.z - Math.sin(crew.R.yaw) * F.grade.off, crew.R.yaw, F.grade.hx, F.grade.hz);
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
      const A = ANCH, E = dig.body;
      A[0][0] = E.x; A[0][1] = field.ground(E.x, E.z) + 7.5; A[0][2] = E.z;
      A[1][0] = crew.L.x; A[1][1] = field.ground(crew.L.x, crew.L.z) + 6.6; A[1][2] = crew.L.z;
      A[2][0] = crew.R.x - Math.cos(crew.R.yaw) * 1.0; A[2][1] = field.ground(crew.R.x, crew.R.z) + 6.2; A[2][2] = crew.R.z + Math.sin(crew.R.yaw) * 1.0;
      for (let j = 0; j < 3; j++) { const a = A[j], b = A[(j + 1) % 3]; links.set(j, a[0], a[1], a[2], b[0], b[1], b[2], j / 3, (j + 1) / 3, 1); }
      links.commit(3); links.mat.uniforms.uOpacity.value = 0.55 * ev; links.mat.uniforms.uFlow.value.set(0.45, 6, 1.6, 0.18);
      hudState.anchors = A;
    }

    // HUD state
    tagAcc += dt;
    hudState.wDig = wD * (fl ? 0 : 1) + (fl ? Math.max(0, wTo.y * (k - 0.75) * 4) : 0); hudState.wPlan = clamp01((wP - 0.6) / 0.4); hudState.wExec = clamp01((wE - 0.6) / 0.4);
    hudState.safeTop = SAFE.top; hudState.safeBottom = SAFE.bottom; hudState.t = clockT;
    hudState.tip = project(tip.x, tip.y, tip.z, tipXY) ? tipXY : null;
    // hint: what a click does next ("Click to dig" / "Click to drop"). It stays up the whole time the dig view is on (busy
    // or not, #43); a change of text swaps in place. It only fades with the tab change.
    const want = interactive && mode === 1 && !fl ? dig.hint : '';
    if (want) hudState.hintText = want === 'drop' ? words.hintDrop : words.hint;
    hintA += ((want ? 1 : 0) - hintA) * (1 - Math.exp(-dt * (want ? 3 : 8))); hudState.hint = hintA;
    // the readout (Autopilot / Manual + telemetry) is always on in the dig view too; only its values change (sol-hud.js)
    if (hudState.wDig > 0.01) digMarks(dt);
    if (hudState.wExec > 0.01 && hudState.anchors) {
      const A = hudState.anchors;
      for (let j = 0; j < 3; j++) { const T = hudState.tags[j]; T.p = T.p || [0, 0]; T.a = project(A[j][0], A[j][1], A[j][2], T.p) ? 1 : 0; T.label = LAB[j]; T.color = TCOL[j]; }
      const F = SITE.FOOT, MB = hudState.mbox;
      machineBox(MB[0], dig.body.x, dig.body.z, dig.body.yaw, EXC_BOX, 9.5);   // the excavator box is tall: its boom stands up to ~9 m
      growBox(MB[0], dig.tip); growBox(MB[0], exc.stick.getWorldPosition(v4));   // and reaches out: tags keep off the arm
      machineBox(MB[1], crew.L.x, crew.L.z, crew.L.yaw, F.haul, 6.0); machineBox(MB[2], crew.R.x, crew.R.z, crew.R.yaw, F.grade, 4.6);
      if (tagAcc > 0.1) {   // the numbers tick at 10 Hz (fewer strings, and they stay readable)
        tagAcc = 0; const T = hudState.tags;
        T[0].value = Math.round(tel.load * 100) + '%'; T[1].value = (Math.abs(crew.L.speed) * 3.6).toFixed(1) + ' km/h'; T[2].value = (crew.R.speed * 3.6).toFixed(1) + ' km/h';
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
  // contour strength: the [data-sol-topo] element's computed opacity (a Fountwind opacity class in the Designer, so it can
  // change per breakpoint), else TOPO_A. Read on every resize, never per frame.
  let topoA = TOPO_A;
  function readTopoA() { const v = topoEl ? parseFloat(getComputedStyle(topoEl).opacity) : NaN; topoA = Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : TOPO_A; }
  function resize() {
    edges(); readTopoA();
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
    qa: { dig, crew, field, SAFE, base, gov, hudState, hud, renderer, project, SHOT, TUNE, U, ZONES, refit() { refit(); }, govTick(dt) { gov.real = true; governor(dt); } },
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
      if (topoEl) topoEl.style.visibility = topoVis;   // the 2D art shows again (no-3D fallback)
    },
  };
}
