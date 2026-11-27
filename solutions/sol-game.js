// sol-game.js: the dig. One excavator on the jobsite, run like a remote operator runs it: the bucket follows targets
// (swing, reach, height, bucket angle) through hydraulic servos (speed and acceleration limits per function, so every move eases in
// and out) and an IK arm, and the machine travels on its tracks (they counter-rotate to turn on the spot, each leaves its marks).
// Where the teeth go below the ground the edit field is carved and the bucket fills. Every load goes into a haul truck
// (sol-haul.js): the truck backs into the bay beside the excavator, body toward it, and the excavator swings the full bucket over the
// tail, lowers it over the body and opens it; the material lands as a heap in the body. No truck in the bay: the excavator waits with
// the bucket full and up, swung short of the bay, like an operator does. The bucket never passes low over a truck (it is held at the
// bay's edge until it is high enough), never sweeps through the ground, and the excavator never drives while a truck is in its way.
// Desktop: draw a dig zone. Each click on the ground places a corner (a live edge follows the cursor); a click on the first
// corner (a snap ring shows), a double-click or Enter closes it, Escape cancels it. Corners can be dragged while drawing. Or press
// and drag a box (mouse or pen): the box is the zone, released it starts. Ground the machine cannot reach, or that a truck needs,
// shows a blocked cursor; a corner there lands on the nearest good ground.
// Closing the zone hands the machine over: it picks a working spot clear of the zone where a truck can also stand beside it, waits
// for the trucks to clear its path, drives there, digs the zone out pass by pass down to ZDEPTH below the existing ground (only inside
// the zone) and loads the trucks. A new zone can be drawn while it works; closing it replaces the old one. Escape with no zone in
// progress stops the dig. A press that moves more than a few px is a drag or a scroll and never places a corner.
// Nobody drawing: an autopilot dig loop from home. It runs on arrival, and takes back over IDLE s after the last input
// once the zone is dug (or the dig was stopped).
// Desktop intro: the first time the dig view is showing and in view (once per tab session, never under reduced motion, never
// during the tab flight) the phone demo's draw runs ONCE by itself with a cream cursor sprite that glides corner to corner, clicks
// each one (press ring) and clicks the first to close; the machine then digs that demo zone (a demo job, healed back afterwards, so
// the visitor's ground is not pre-dug) and the visitor has the controls at once (the hint shows). The first pointerdown (or Esc)
// on the stage cancels it: a half-drawn demo zone is cleared, a demo dig stops, curls its bite and the cut heals back while the
// visitor draws; that same click then starts their own zone. Pointer movement alone never cancels it, wheel and scroll never do.
// Wheel and vertical touch pan are never captured (no wheel listener, touch-action: pan-y, nothing is ever prevented; a
// corner drag or a box drag only takes the pointer for a mouse or a pen). Phones: no listeners at all; a demo draws zones by itself
// while the dig view is showing (corners at a human pace, live edge, snap ring), digs each one out like a visitor's zone,
// then fades it, heals the ground back and picks a new spot in the pit (see demoTick).
import { SITE, hF, hD } from './sol-terrain.js';
import { EXC_LIMITS } from './sol-machines.js';
import { rand } from './sol-rand.js';

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const wrap = a => Math.atan2(Math.sin(a), Math.cos(a));
export const IDLE = 8;   // s with no input (and the zone dug or stopped) before the autopilot takes back over
const CAP = 1.9;         // bucket capacity, m3
const PEN = 0.6;         // how deep one pass bites, m
const OVER = 0.45;       // how far below grade a visitor's dig may go, m
// absolute bucket angles (model): open (reaching out), dig (teeth enter about 25 degrees off vertical, toward the machine), full
// (curled at the end of the drag), carry (curled shut, mouth up), dump (open over the truck)
const PH = { open: -0.5, dig: -1.27, full: -1.95, carry: -2.55, dump: 0.05 };
// arm geometry (model units, see sol-machines.js): turret at y 1.11, boom pin at (0.95, 1.0) on it, boom 5.7, stick 2.9,
// teeth at (1.38, -1.25) in the bucket frame
const PIN_X = 0.95, PIN_Y = 2.11, BL = 5.7, SL = 2.9, TX = 1.38, TY = -1.25;
const RMIN = 5, RMAX = 11.2, RWORK = 7.6;   // reach band for a target from the turret, and how far from a target it parks, m
// travel (CAT 336 class at this scale): top speed m/s, acceleration m/s2, turn rate on the spot rad/s and its acceleration
const VMAX = 1.6, ACC = 0.7, YAWR = 0.42, YACC = 0.55;
const TRACK = 1.79;                         // track centre offset from the machine axis, m
// the servos: [top speed, acceleration] per function (swing rad/s, reach and height m/s, bucket rad/s). A loaded swing tops out at LOADED of it.
const SV = { sw: [0.85, 0.62], r: [2.4, 3.0], y: [2.4, 3.2], ph: [1.6, 4.2] }, LOADED = 0.85;
const HOLD_CAST = 15;                      // s: a full bucket waits this long for a truck, then goes on the ground beside the machine
const CLR = 0.4;                            // m: what the bucket keeps over the ground (outside a bite) and over a truck's rails or load
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
const TRUCK_M = 1.5;    // m: zone corners keep this far from a truck (where it stands, or the bay it is coming into)
export const ARMK = { PH, PIN_X, PIN_Y, BL, SL, TX, TY, RMIN, RMAX, ZFAR };   // for test/check-arm.mjs
const SMAX = 600;       // sample points that track what is left to dig
// the phone demo
const DEMO = { first: 1.4, corner: [0.6, 0.9], snap: 0.45, cap: 70, hold: 1.2, heal: 2.4, rest: 0.8, depth: 0.5 };
// the desktop intro: the same run at a pace a person can follow (wait: s in view first; first: cursor glide to corner one)
const INTRO = { wait: 0.9, first: 1.1, corner: [0.95, 1.3], snap: 0.7, grace: 1.5 };
const PATCH = 2.2;      // ?dig=click: half size of the patch a click digs, m
// spots in the pit (pit-local x, z, m) the demo cycles through, each with a little jitter: the south half, between the
// machine and the dig camera, so the zone reads in front of the arm instead of under it
const DSPOT = [[-2.2, -2.6], [0.8, -2.2], [-0.6, -3.0], [1.6, -1.4], [-2.6, -1.2]];
// the bucket's outline in its own frame (model), from the hinge: lip, back, teeth, heel. The guards keep every one of them clear.
const BKP = [[0, 0], [0.45, 0.22], [0.95, 0], [1.25, -0.45], [1.35, -1.05], [1.38, -1.25], [1.0, -1.0], [0.55, -0.68], [0.18, -0.32]];

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

export function createDig({ THREE, exc, field, camera, canvas, interactive, MSCALE, parts, clock, haul = null, intro: introCfg = null, gesture: gestureCfg = '' }) {
  const MS = MSCALE, E = SITE.E, Z = SITE.digZone, home = { x: E.x, z: E.z, yaw: E.yaw };
  const body = { x: E.x, z: E.z, yaw: E.yaw, speed: 0, yawV: 0, dist: 0, dl: 0, dr: 0 };
  const cur = { sw: 0, r: 7, y: 2, ph: PH.carry }, tg = { ...cur }, vel = { sw: 0, r: 0, y: 0, ph: 0 };
  const ARM = { a1: 0.2, a2: -1.5, a3: -0.3, pe: PH.carry };
  const dumpAt = { x: 0, z: 0, on: false };   // where a ground dump lands (no truck kit only): fixed when the dump starts
  let load = 0, user = false, everClicked = false, lastInput = -1e9, doneT = -1e9, relaxT = 0, poured = 0;
  const tip = new THREE.Vector3();
  let rootY = 0;
  const ground = (x, z) => field.ground(x, z);
  const along = (sw, r, out) => { const a = body.yaw + sw; out.x = body.x + Math.cos(a) * r; out.z = body.z - Math.sin(a) * r; return out; };
  const tmp = { x: 0, z: 0 }, pk = { x: 0, z: 0 };

  // ------------------------------------------------------------------ zones: the one being drawn, and the one being dug
  // draw: corners so far, the cursor (hov) and whether a click there closes it (snap); ver bumps on every change; box: a box drag in progress
  const draw = { n: 0, x: new Float32Array(MAXV), z: new Float32Array(MAXV), hov: false, hx: 0, hz: 0, snap: false, drag: -1, ver: 0, box: false };
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
  const lp = new Float32Array(90 * 3); for (let k = 0; k < 90; k++) { lp[k * 3] = 0.45 + rand() * 0.8; lp[k * 3 + 1] = -0.7 + rand() * 0.7; lp[k * 3 + 2] = (rand() - 0.5) * 1.0; }
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
  // and off the ground a truck stands on (or the bay it is coming into): out to the nearest point TRUCK_M clear, a few tries
  function offTrucks(p) {
    if (!haul || !haul.near(p.x, p.z, TRUCK_M)) return false;
    for (let r = 0.75; r < 14; r += 0.75) for (let k = 0; k < 16; k++) {
      const a = k / 16 * Math.PI * 2, x = p.x + Math.cos(a) * r, z = p.z + Math.sin(a) * r;
      if (haul.near(x, z, TRUCK_M + 0.05)) continue;
      const q = { x, z }; if (reachable(q)) continue;
      p.x = x; p.z = z; return true;
    }
    return true;
  }
  // can a corner go here as it is (no clamp)?
  const diggable = (x, z) => { const q = { x, z }; return !reachable(q) && !(haul && haul.near(x, z, TRUCK_M)); };

  // ------------------------------------------------------------------ ops: one at a time (dig a bite, or load the truck)
  // step: idle | home | plan | clear | drive | reach | lower | drag | curl | hold | swing | spot | dump | back
  const op = { on: false, kind: 'dig', x: 0, z: 0, user: false, zone: false, passes: 0, took: 0 };
  const queued = { on: false, kind: 'dig', x: 0, z: 0 };   // kept for the HUD contract (no queue since the zone)
  const drv = { x: 0, z: 0, rev: false, yaw: 0, final: false, x0: 0, z0: 0 };   // drive goal, reverse, optional final heading
  // markers for the HUD: [0] the bite or the drop in progress. t0: when it was placed (pop), out: when it ended (fade)
  const marks = [{ on: false, kind: 'dig', x: 0, z: 0, t0: -9, out: -9, clamped: false }, { on: false, kind: 'dig', x: 0, z: 0, t0: -9, out: -9, clamped: false }];
  let step = 'idle', stepT = 0, dragR0 = 0;
  function go(s) { step = s; stepT = 0; }
  const mark = (kind, x, z) => Object.assign(marks[0], { on: true, kind, x, z, t0: clock(), out: -9, clamped: false });

  // ------------------------------------------------------------------ the site: where the excavator works from, and its truck bay
  // bay: the truck bay in use (sol-haul.js findBay) for where the excavator stands. A move (to a zone, or home) is planned first: each
  // working spot it could use, best first, gets a bay worked out (a few candidates per frame, a fixed amount of work), the first spot
  // with a bay wins. Then the trucks clear its path (it waits), then it drives, and the new bay goes to the trucks on arrival.
  let booted = false;   // the first home bay found: the first truck starts in it
  const site = { bay: null, homeBay: null, homeGen: null, cands: [], ci: 0, gen: null, park: null, next: null, wait: 0, fail: 0, holdTry: 0, spins: 0, cast: false, first: null };
  if (haul) { site.homeGen = haul.findBayG(home.x, home.z, home.yaw); haul.setArmIn(() => armOverTruck(0.25)); }
  // is the zone's middle well off the bearing of a bay seen from (x, z)? (else the bites there would all be refused)
  const zsec = [0, 0, 0];
  function zoneOffBay(P, x, z) {
    if (!(job.on && !job.done && job.n > 2)) return true;
    haul.sector(P, x, z, 0.8, zsec); const b = Math.atan2(-(job.cz - z), job.cx - x), d = wrap(b - zsec[0]);
    return !(d >= -0.5 && d <= zsec[1] - zsec[0] + 0.5);
  }
  const atHome = () => Math.hypot(body.x - home.x, body.z - home.z) < 0.3 && Math.abs(wrap(body.yaw - home.yaw)) < 0.04;
  // a working spot for a zone bite: inside digZone, in reach with room for the drag, the machine clear of the zone; best first
  function parks(x, z) {
    const a0 = Math.atan2(body.z - z, body.x - x), q = pk, out = [];
    for (const da of [0, 0.35, -0.35, 0.7, -0.7, 1.05, -1.05, 1.4, -1.4, 1.75, -1.75, 2.1, -2.1, 2.6, -2.6, Math.PI])
      for (const r of [RWORK, 6.8, 8.2]) {
        inZone(x + Math.cos(a0 + da) * r, z + Math.sin(a0 + da) * r, q);
        const d = Math.hypot(x - q.x, z - q.z); if (d < ZNEAR || d > ZFAR) continue;
        if (inJob(q.x, q.z) || edgeDist(job.x, job.z, job.n, q.x, q.z) < 4.6) continue;   // 4.6: the house's tail swing and a little
        if (out.some(o => Math.hypot(o.x - q.x, o.z - q.z) < 0.6)) continue;
        out.push({ x: q.x, z: q.z, yaw: Math.atan2(-(job.n > 2 ? job.cz : z) + q.z, (job.n > 2 ? job.cx : x) - q.x), c: Math.hypot(q.x - body.x, q.z - body.z) + Math.abs(da) * 0.6 });
      }
    return out.sort((a, b) => a.c - b.c);
  }
  // move to work on (x, z) (or home): plan, then clear, then drive
  function relocate(x, z, toHome = false) {
    if (toHome) site.cands = [{ x: home.x, z: home.z, yaw: home.yaw, home: true }];
    else {
      const here = { x: body.x, z: body.z, yaw: Math.atan2(-(z - body.z), x - body.x), here: true }, d = Math.hypot(x - body.x, z - body.z);
      const ok = op.kind === 'load' ? !inJob(body.x, body.z) : d >= ZNEAR && d <= ZFAR && !inJob(body.x, body.z) && !(job.n > 2 && edgeDist(job.x, job.z, job.n, body.x, body.z) < 4.6);
      site.cands = (ok ? [here] : []).concat(parks(x, z).slice(0, 5));
    }
    site.first = site.cands[0] || null;   // (where it would work from with no bay at all)
    // a zone that keeps sending it round (plans, but no bite from any of them): give the zone up
    if (++site.spins > 3 && job.on && !job.done) { site.spins = 0; job.done = true; job.doneT = clock(); job.ver++; haul.setZone(job.x, job.z, 0); op.on = false; endOp(); return; }
    site.ci = 0; site.gen = null; site.fail = 0; site.cast = false; go('plan');
  }
  // is the bay in use still good with today's zone (a truck there clears it)? Does the excavator need a new one from here?
  const bayGood = () => {
    if (!site.bay || haul.staticClear(site.bay) < 0) return false;
    if (!(job.on && !job.done && job.n > 2)) return true;
    return zoneOffBay(site.bay, body.x, body.z);   // and the zone's middle well off the bay's bearing (the bites there would all be refused)
  };

  function startOp(kind, x, z, isUser, zone = false) {
    op.on = true; op.kind = kind; op.x = x; op.z = z; op.user = isUser; op.zone = zone; op.passes = 0; op.took = 0;
    if (kind === 'load') {
      if (haul && site.cast) { go('hold'); return; }
      if (haul && job.on && !job.done && !bayGood()) { relocate(job.cx, job.cz); return; }   // the zone took the bay's ground (or its bearing): a new bay first
      go(haul && haul.ready ? 'swing' : 'hold'); return;
    }
    const d = Math.hypot(x - body.x, z - body.z), zd = zone;
    const inReach = d >= (zd ? ZNEAR : RMIN) && d <= (zd ? ZFAR : RMAX) && !(zone && inJob(body.x, body.z));
    if (inReach && (!haul || !zone || bayGood() || site.cast)) { go('reach'); return; }
    if (!haul) { if (zone && job.n > 2 && parks(x, z)[0]) { const p = parks(x, z)[0]; driveTo(p.x, p.z, p.yaw); go('drive'); return; } go('reach'); return; }
    relocate(x, z);
  }
  function driveTo(x, z, yaw) {
    drv.x = x; drv.z = z; drv.x0 = body.x; drv.z0 = body.z; drv.final = yaw != null; drv.yaw = yaw ?? 0;
    const want = Math.atan2(-(z - body.z), x - body.x), d = Math.hypot(x - body.x, z - body.z);
    drv.rev = d < 9 && Math.abs(wrap(want - body.yaw)) > 2.0;   // short hops behind it: back up instead of turning round
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
      if (here && anyArc(Math.atan2(-(z - body.z), x - body.x) - body.yaw, 0.3)) continue;   // never a bite under a truck's bearing
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
    if (load > CAP * 0.15) { startOp('load', 0, 0, true, op.zone || (job.on && !job.done)); return; }
    if (job.on && !job.done) {
      // the last few % are slivers along the edge: call it dug
      if (zoneStats().k < 0.97 && nextBite(pick0)) { mark('dig', pick0.x, pick0.z); startOp('dig', pick0.x, pick0.z, true, true); return; }
      job.done = true; job.doneT = clock(); job.ver++;
    }
    go('idle');
  }

  // ------------------------------------------------------------------ autopilot: dig a bite in the pit, load the truck
  let prevSw = 0;
  function pickSpot(out) {
    let bs = -1e9, bsw = 0, br = 7.5;
    for (let sw = -0.6; sw <= 0.601; sw += 0.15) for (const r of [7.0, 8.2, 9.4, 10.4]) {
      along(sw, r - 1, tmp); const cut = ground(tmp.x, tmp.z) - hD(tmp.x, tmp.z);
      const s = cut - Math.abs(sw - prevSw) * 0.25 + rand() * 0.15;
      if (s > bs) { bs = s; bsw = sw; br = r; }
    }
    if (bs < 0.12) { bsw = (rand() - 0.5) * 0.9; br = 7 + rand() * 3.2; }   // all at grade: keep trimming
    prevSw = bsw; along(bsw, br - 1.3, out); return out;
  }
  const pick0 = { x: 0, z: 0 };
  function autopilot() {
    if (!atHome() || (haul && site.bay !== site.homeBay && site.homeBay)) { relocate(home.x, home.z, true); return; }
    if (load > CAP * 0.15) startOp('load', 0, 0, false);
    else { pickSpot(pick0); startOp('dig', pick0.x, pick0.z, false); }
  }

  // ------------------------------------------------------------------ drawing a zone (all clicks are already in reach)
  // clamp a corner: into reachable ground, off the trucks, and within ZEXT of the first corner; true if it had to move
  function clampCorner(p, i = draw.n) {
    let c = reachable(p);
    if (i > 0 && draw.n > 0) { const dx = p.x - draw.x[0], dz = p.z - draw.z[0], d = Math.hypot(dx, dz); if (d > ZEXT) { p.x = draw.x[0] + dx / d * ZEXT; p.z = draw.z[0] + dz / d * ZEXT; c = true; } }
    if (offTrucks(p)) c = true;
    return c;
  }
  function addCorner(x, z) {
    const t = clock(); lastInput = t; everClicked = true;
    if (draw.n && Math.hypot(x - draw.x[draw.n - 1], z - draw.z[draw.n - 1]) < GAP) return;
    if (draw.n > 2 && Math.hypot(x - draw.x[0], z - draw.z[0]) < GAP) { closeZone(); return; }
    draw.x[draw.n] = x; draw.z[draw.n] = z; draw.n++; draw.ver++;
    if (draw.n >= MAXV) closeZone();
  }
  function cancelDraw() { if (!draw.n) return; draw.n = 0; draw.drag = -1; draw.snap = false; draw.box = false; draw.ver++; }
  // a closed zone may not take in a truck (corners keep clear of them, but an edge can still cross one): it shrinks about its
  // centre until it is clear, else it is dropped
  function shrinkOffTrucks(n, cx, cz) {
    if (!haul) return true;
    for (let it = 0; it < 8; it++) {
      if (!haul.zoneHitsTrucks(draw.x, draw.z, n, TRUCK_M)) return true;
      for (let i = 0; i < n; i++) { draw.x[i] = cx + (draw.x[i] - cx) * 0.85; draw.z[i] = cz + (draw.z[i] - cz) * 0.85; }
    }
    return !haul.zoneHitsTrucks(draw.x, draw.z, n, TRUCK_M);
  }
  // close the zone being drawn: it becomes the job (replacing any zone in progress) and the machine is handed over
  function closeZone() {
    const n = draw.n; if (n < 3) return false;
    let cx0 = 0, cz0 = 0; for (let i = 0; i < n; i++) { cx0 += draw.x[i] / n; cz0 += draw.z[i] / n; }
    if (!shrinkOffTrucks(n, cx0, cz0)) { cancelDraw(); return false; }
    let A = 0, cx = 0, cz = 0, x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9;
    for (let i = 0, j = n - 1; i < n; j = i++) {
      A += draw.x[j] * draw.z[i] - draw.x[i] * draw.z[j]; cx += draw.x[i] / n; cz += draw.z[i] / n;
      x0 = Math.min(x0, draw.x[i]); x1 = Math.max(x1, draw.x[i]); z0 = Math.min(z0, draw.z[i]); z1 = Math.max(z1, draw.z[i]);
    }
    A = Math.abs(A) / 2; draw.snap = false; draw.drag = -1; draw.box = false;
    if (A < ZAREA) { cancelDraw(); return false; }   // a sliver: nothing to dig
    job.n = n; job.x.set(draw.x.subarray(0, n)); job.z.set(draw.z.subarray(0, n)); job.cx = cx; job.cz = cz; job.area = A; job.demo = !interactive || (intro.on && intro.ctl);   // the phone demo's zone, and the intro's (the visitor's first press ends the intro before any real close)
    // samples on a grid, inset from the edges (the bucket's radius keeps the cut inside anyway)
    const cell = Math.max(0.7, Math.sqrt(A / SMAX) * 1.05); job.cell = cell; job.ns = 0; job.dead.fill(0);
    for (let pass = 0; pass < 2 && !job.ns; pass++)
      for (let x = x0 + cell / 2; x < x1; x += cell) for (let z = z0 + cell / 2; z < z1; z += cell) {
        if (job.ns >= SMAX || !inPoly(job.x, job.z, n, x, z) || (!pass && edgeDist(job.x, job.z, n, x, z) < 0.35)) continue;
        job.sx[job.ns] = x; job.sz[job.ns] = z; job.ns++;
      }
    job.vol0 = 0; for (let i = 0; i < job.ns; i++) job.vol0 += Math.max(0, ground(job.sx[i], job.sz[i]) - zfloor(job.sx[i], job.sz[i])) * cell * cell;
    job.on = true; job.done = false; site.spins = 0; site.cast = false; job.lx = body.x; job.lz = body.z; job.ver++;
    if (haul) haul.setZone(job.x, job.z, job.n);
    draw.n = 0; draw.ver++;
    lastInput = clock(); handOver();
    return true;
  }
  // the machine takes up the new zone: a loaded autopilot takes its load to the truck first; a visitor's bite already on its way
  // is re-aimed; a bite, a load or a move in progress finishes and the next op comes from the new zone
  function handOver() {
    const was = user; user = true;
    if (!was) { queued.on = false; marks[1].on = false; }
    if (step === 'plan' || step === 'clear') { op.on = false; op.user = true; endOp(); return; }   // re-plan for the new zone
    if (!op.on) { op.user = true; endOp(); return; }
    op.user = true;
    if (op.kind === 'dig' && load < CAP * 0.05 && (step === 'drive' || step === 'reach')) {
      if (step === 'drive') { haul && haul.setCorridor(false); }
      op.on = false; endOp();
    }
  }
  // Escape while it digs: the zone stops at once (a bite on its way is dropped, a bite in the ground is curled up and loaded)
  function stopJob() {
    if (!job.on || job.done) return; job.done = true; job.doneT = clock(); job.ver++; lastInput = clock();
    if (!op.on || op.kind !== 'dig' || !op.user) return;
    if (load < CAP * 0.15 && (step === 'reach' || step === 'lower' || step === 'plan' || step === 'clear')) { op.on = false; endOp(); }
    else if (step === 'lower' || step === 'drag') go('curl');
  }

  // ------------------------------------------------------------------ the trucks, seen from the turret
  // the bearings (relative to the tracks) each truck in reach covers, how close it comes, and how high it is; the bucket is only ever
  // over a truck high up. arcs[0] is the bay (the truck in it, or coming into it, or just the empty bay), the rest any other truck in reach.
  const sec = [0, 0, 0], arcs = [0, 1, 2].map(() => ({ on: false, lo: 0, hi: 0, rMin: 0, top: 0 }));
  let arcF = -1, frameN = 0;
  const bedI = { x: 0, z: 0, ux: 0, uz: 0, rail: 0, floor: 0, len: 0, w: 0, top: 0 };
  function arcOf(A, p, T) {
    haul.sector(p, body.x, body.z, 0.8, sec);
    A.on = true; A.lo = wrap(sec[0] - body.yaw); A.hi = A.lo + (sec[1] - sec[0]); A.rMin = haul.nearR(p, body.x, body.z) - 0.8;
    if (T) { haul.bed(T, bedI); A.top = Math.max(bedI.rail, bedI.floor + haul.heapTop(T)); if (T.bedA > 0.01) A.top += 6; } else A.top = ground(p.bx ?? body.x, p.bz ?? body.z) + haul.D.railY + 0.6;
  }
  function trucksArcs() {   // worked out once a frame
    if (arcF === frameN) return arcs; arcF = frameN;
    for (const A of arcs) A.on = false;
    if (!haul) return arcs;
    const C = haul.coming; let k = 1;
    if (C) arcOf(arcs[0], C.p, C); else if (site.bay) arcOf(arcs[0], site.bay, null);
    for (const T of haul.trucks) {
      if (T === C || k >= arcs.length) continue;
      if (haul.nearR(T.p, body.x, body.z) > RMAX + 2.5) continue;
      arcOf(arcs[k++], T.p, T);
    }
    if (C) haul.bed(C, bedI);
    return arcs;
  }
  const bayArc = () => trucksArcs()[0];
  const inArc = (sw, S, m = 0) => { const d = wrap(sw - S.lo); return d >= -m && d <= S.hi - S.lo + m; };
  const anyArc = (sw, m = 0) => { for (const A of trucksArcs()) if (A.on && inArc(sw, A, m)) return A; return null; };
  // is the bucket over a truck right now (the truck in the bay will not move then)?
  function armOverTruck(m = 0) { for (const A of trucksArcs()) if (A.on && inArc(cur.sw, A, m) && cur.r + 1.6 >= A.rMin - m) return true; return false; }

  // ------------------------------------------------------------------ the step machine (visitor and autopilot alike)
  const near = (e = 1) => Math.abs(wrap(cur.sw - tg.sw)) < 0.04 * e && Math.abs(cur.r - tg.r) < 0.25 * e && Math.abs(cur.y - tg.y) < 0.25 * e && Math.abs(cur.ph - tg.ph) < 0.12 * e;
  function aimAt(x, z, extra = 0) {
    const dx = x - body.x, dz = z - body.z;
    tg.sw = wrap(Math.atan2(-dz, dx) - body.yaw); tg.r = clamp(Math.hypot(dx, dz) + extra, RMIN, RMAX);
  }
  function tuck() { // arm in for travel and waiting: boom low and forward, bucket curled; a load is kept up
    tg.sw = step === 'drive' || step === 'home' || step === 'clear' || Math.abs(cur.sw) < 0.6 || load < CAP * 0.15 ? 0 : cur.sw; tg.r = 6;   // travel: the arm straight ahead along(tg.sw, tg.r, tmp); tg.y = ground(tmp.x, tmp.z) + (load > CAP * 0.15 ? 2.9 : 2.5); tg.ph = PH.carry;
  }
  // the hinge (stick end) at (r, y): the tip target that puts it there with the bucket at its current angle
  function hingeTo(r, y) { const c = Math.cos(ARM.pe), s = Math.sin(ARM.pe); tg.r = r + (TX * c - TY * s) * MS; tg.y = y + (TX * s + TY * c) * MS; }
  // the drop point for this pass: along the body from near the tail, spread over the passes, in reach
  const drop = { x: 0, z: 0, r: 0, sw: 0 };
  // side-cast: where a full bucket goes when no truck comes for HOLD_CAST s. Away from the bay, off any truck, out of the zone
  const cast = { sw: 0, r: 7.6, on: false };
  function castSpot() {
    const B = site.bay, b0 = B ? wrap(Math.atan2(-(B.bz - body.z), B.bx - body.x) - body.yaw) : 0;
    for (const d of [Math.PI, 2.3, -2.3, 1.7, -1.7]) {
      const sw = wrap(b0 + d); along(sw, cast.r, tmp);
      if (anyArc(sw, 0.5) || inJob(tmp.x, tmp.z) || (haul && haul.near(tmp.x, tmp.z, 4)) || reachable(tmp)) continue;
      cast.sw = sw; return true;
    }
    return false;
  }
  const DROPS = [-1.6, 0.2, -0.6, 1.2, -0.2, 0.7];
  function dropPoint(T) {
    haul.bed(T, bedI); const k = DROPS[Math.round(T.drop || 0) % DROPS.length];
    let x = bedI.x + bedI.ux * k, z = bedI.z + bedI.uz * k, d = Math.hypot(x - body.x, z - body.z);
    if (d > 9.6) { x -= bedI.ux * (d - 9.6); z -= bedI.uz * (d - 9.6); d = 9.6; }
    if (d < 7) { x += bedI.ux * (7 - d); z += bedI.uz * (7 - d); d = 7; }
    drop.x = x; drop.z = z; drop.r = Math.hypot(x - body.x, z - body.z); drop.sw = wrap(Math.atan2(-(z - body.z), x - body.x) - body.yaw);
    return drop;
  }
  // how high the hinge has to be for the open bucket to clear the load (and the rails) by CLR
  const hingeOver = top => top + CLR + 0.15 - (TX * Math.sin(PH.dump) + TY * Math.cos(PH.dump)) * MS;
  // travel: turn on the spot (the tracks counter-rotate) toward the goal, then drive, steering by track speed on the way; a final
  // heading turns it on the spot again. Speeds and turn rates ramp. Returns true on arrival.
  function travel(dt) {
    const dx = drv.x - body.x, dz = drv.z - body.z, d = Math.hypot(dx, dz);
    let wantV = 0, wantW = 0;
    if (d > 0.12) {
      let want = Math.atan2(-dz, dx); if (drv.rev) want = wrap(want + Math.PI);
      const e = wrap(want - body.yaw), s = drv.rev ? -1 : 1;
      if (Math.abs(e) > 0.22 && Math.abs(body.speed) < 0.08) { wantW = Math.sign(e) * Math.min(YAWR, Math.sqrt(2 * YACC * Math.abs(e)) * 0.9); }   // turn on the spot first
      else { wantW = clamp(e * 1.1, -YAWR * 0.5, YAWR * 0.5); wantV = s * Math.min(VMAX * (drv.rev ? 0.7 : 1), Math.sqrt(2 * ACC * d) * 0.9 + 0.05) * (Math.abs(e) > 0.22 ? 0 : 1); }
    } else if (drv.final) {
      const e = wrap(drv.yaw - body.yaw);
      if (Math.abs(e) > 0.008 || Math.abs(body.yawV) > 0.01) wantW = Math.sign(e) * Math.min(YAWR, Math.sqrt(2 * YACC * Math.abs(e)) * 0.9);
    }
    body.speed += clamp(wantV - body.speed, -ACC * 1.5 * dt, ACC * dt);
    body.yawV += clamp(wantW - body.yawV, -YACC * dt, YACC * dt);
    const ds = body.speed * dt, dy = body.yawV * dt;
    body.yaw = wrap(body.yaw + dy); body.x += Math.cos(body.yaw) * ds; body.z -= Math.sin(body.yaw) * ds;
    body.dist += ds; body.dl += ds - dy * TRACK; body.dr += ds + dy * TRACK;   // left track (the -z side) slows in a left turn, runs back on the spot
    if (Math.abs(ds) > 1e-5 || Math.abs(dy) > 1e-5) trackMarks(Math.abs(ds - dy * TRACK), Math.abs(ds + dy * TRACK));
    const done = d <= 0.12 && Math.abs(body.speed) < 0.02 && (!drv.final || (Math.abs(wrap(drv.yaw - body.yaw)) <= 0.008 && Math.abs(body.yawV) < 0.01));
    if (done) { body.speed = 0; body.yawV = 0; if (drv.final) { const e = wrap(drv.yaw - body.yaw); body.yaw = drv.yaw; body.dl -= e * TRACK; body.dr += e * TRACK; } }   // the last hair of the turn, on the tracks too
    return done;
  }
  function trackMarks(ml, mr) {
    const fx = Math.cos(body.yaw), fz = -Math.sin(body.yaw);
    if (ml > 1e-5) field.mark(body.x + fz * TRACK, body.z - fx * TRACK, 0.5, Math.min(0.06, ml * 0.7));
    if (mr > 1e-5) field.mark(body.x - fz * TRACK, body.z + fx * TRACK, 0.5, Math.min(0.06, mr * 0.7));
  }
  // hold a full bucket while no truck is ready: up and curled, over the dig side (the trucks never come over the zone or the pit, so a
  // bucket held there is never in a truck's way), high enough to clear a truck's cab; then the swing to the truck when it is in
  function holdPose() {
    tg.ph = PH.carry; tg.r = 6.6;
    tg.sw = op.user && job.n > 2 ? wrap(Math.atan2(-(job.cz - body.z), job.cx - body.x) - body.yaw) : prevSw * 0.5;
    if (anyArc(tg.sw, 0.3)) tg.sw = cur.sw;   // (never over a truck)
    along(tg.sw, tg.r, tmp); tg.y = Math.max(ground(tmp.x, tmp.z) + 3.4, haul ? ground(body.x, body.z) + haul.D.topT + CLR + 0.4 - lowest(PH.carry) : 0);
  }
  function run(dt) {
    stepT += dt;
    if (haul && step !== 'clear' && step !== 'drive' && step !== 'home') {
      haul.setCorridor(false);   // the corridor only stands while it is about to drive or driving
      if (step !== 'plan' && haul.bay !== site.bay) haul.setBay(site.bay);   // a move given up half way: the bay where it stands is still good
    }
    const auto = !op.user;
    switch (step) {
      case 'idle':
        if (load > CAP * 0.15) tuck(); else if (stepT > 0.4) { tg.ph = PH.open; }
        break;
      case 'plan': {   // where to work from, and a bay for the truck there (a candidate or two per frame)
        if (load > CAP * 0.15) holdPose(); else tuck();
        for (let k = 0; k < 6 && step === 'plan'; k++) {   // a few planner steps a frame (each is one candidate pull-up or path: a few ms)
          if (!site.gen) {
            if (site.ci >= site.cands.length) { planFailed(); break; }
            const c = site.cands[site.ci], homeOK = c.home && site.homeBay && haul.staticClear(site.homeBay) >= 0 && zoneOffBay(site.homeBay, c.x, c.z);   // (the home bay, unless today's zone took its ground)
            site.gen = homeOK ? null : haul.findBayG(c.x, c.z, c.yaw, site.bay, P => zoneOffBay(P, c.x, c.z));
            if (!site.gen) { site.park = c; site.next = site.homeBay; go('clear'); break; }
          }
          const r = site.gen.next();
          if (r.done) { site.gen = null; if (r.value) { site.park = site.cands[site.ci]; site.next = r.value; if (site.park.home && !(job.on && !job.done)) site.homeBay = r.value; go('clear'); } else site.ci++; }
        }
        break;
      }
      case 'clear': {   // the trucks out of the way, then drive (or, staying put, the new bay is set at once)
        if (load > CAP * 0.15) holdPose(); else tuck();
        for (const T of haul.trucks) if ((T.st === 'out' || T.st === 'in') && haul.nearR(T.p, body.x, body.z) < 10) { tg.sw = cur.sw; tg.y = Math.max(tg.y, cur.y); break; }   // never swing at a truck on the move beside it
        const P = site.park, stay = Math.hypot(P.x - body.x, P.z - body.z) < 0.3 && Math.abs(wrap(P.yaw - body.yaw)) < 0.05;
        if (stay) { haul.setCorridor(false); haul.setBay(site.next); site.bay = haul.bay; site.holdTry = 0; if (site.bay) site.cast = false; afterMove(); break; }
        haul.setBay(null); haul.setCorridor(true, body.x, body.z, P.x, P.z);
        if (Math.abs(wrap(cur.sw - tg.sw)) < 0.3 && haul.corridorClear() && !armOverTruck(0.05)) { driveTo(P.x, P.z, P.yaw); go(P.home ? 'home' : 'drive'); }
        break;
      }
      case 'home': case 'drive':
        tuck(); if (load > CAP * 0.15) tg.y = Math.max(tg.y, cur.y);
        if (stepT > 0.25 && travel(dt)) {
          if (haul) { haul.setCorridor(false); haul.setBay(site.next); site.bay = haul.bay; site.holdTry = 0; if (site.bay) site.cast = false; }
          afterMove();
        }
        break;
      case 'reach': {
        aimAt(op.x, op.z, 1.3); along(tg.sw, tg.r, tmp); tg.y = ground(tmp.x, tmp.z) + 1.3; tg.ph = PH.open;
        if ((near(1.5) && stepT > 0.3) || stepT > 6) { site.spins = 0; go('lower'); } break;
      }
      case 'lower': tg.y = digY(tg.sw, tg.r); tg.ph = PH.dig; if ((near() && stepT > 0.2) || stepT > 2) { dragR0 = tg.r; op.took = 0; go('drag'); } break;
      case 'drag': {   // pull in along the cut, the bucket curling as it fills
        const k = Math.min(1, stepT / 3.0), cap = capNow();
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
      case 'curl': {   // curl shut and break out: the boom lifts as the bucket closes
        tg.ph = PH.carry; along(tg.sw, tg.r, tmp); const k = Math.min(1, stepT / 1.5);
        tg.y = Math.max(cur.y, ground(tmp.x, tmp.z) + 0.4 + 1.6 * k);
        if (stepT > 1.6) endOp(); break;
      }
      case 'hold':   // a full bucket and no truck in the bay: wait, up and ready
        holdPose();
        // the bay no longer takes a truck (a zone over it): find one (once per hold; toward the zone, else from home)
        if (haul && site.cast) { if (stepT > 0.3 && castSpot()) go('cast'); break; }   // no bay for this zone: every load goes beside the machine
        if (haul && stepT > 0.5 && !site.holdTry && !bayGood()) { site.holdTry = 1; if (job.on && !job.done) relocate(job.cx, job.cz); else relocate(0, 0, true); break; }
        // no truck on its way for a long while: side-cast it on the ground (as an operator would) and get on with the dig
        if (haul && stepT > (haul.queued ? HOLD_CAST * 1.3 : HOLD_CAST) && (!haul.coming || haul.coming.full || stepT > HOLD_CAST * 3) && castSpot()) { go('cast'); break; }
        if (haul && haul.ready && stepT > 0.3) go('swing');
        else if (!haul && stepT > 0.2) { go('dump'); }
        break;
      case 'cast': {   // swing out to the side-cast spot, low over the ground, then open
        tg.sw = cast.sw; tg.ph = PH.carry; along(cast.sw, cast.r, tmp); tg.r = cast.r; tg.y = ground(tmp.x, tmp.z) + 2.4;
        if (anyArc(cur.sw, 0.2) || anyArc(tg.sw, 0.3)) { tg.y = Math.max(tg.y, cur.y); }
        if ((near(1.5) && stepT > 0.3) || stepT > 4) { along(cur.sw, cur.r, tmp); dumpAt.x = tmp.x; dumpAt.z = tmp.z; dumpAt.on = true; cast.on = true; go('dump'); }
        break;
      }
      case 'swing': {   // boom up and swing together, the bucket held over the truck's rails before it crosses them
        const T = haul && haul.ready; if (!T) { go('hold'); break; }
        const D = dropPoint(T), top = Math.max(bayArc().top, bedI.floor + haul.heapTop(T));
        tg.sw = D.sw; tg.ph = PH.carry; hingeTo(D.r - 0.5, hingeOver(top) + 0.5);
        if (Math.abs(wrap(cur.sw - tg.sw)) < 0.05 && Math.abs(vel.sw) < 0.12) go('spot');
        break;
      }
      case 'spot': {   // settle over the drop point, just high enough
        const T = haul.ready; if (!T) { go('hold'); break; }
        const D = dropPoint(T), top = Math.max(bayArc().top, bedI.floor + haul.heapTop(T));
        tg.sw = D.sw; tg.ph = PH.carry; hingeTo(D.r - 0.5, hingeOver(top));
        if ((near(1.2) && stepT > 0.25) || stepT > 2.5) { dumpAt.x = D.x; dumpAt.z = D.z; dumpAt.on = true; go('dump'); }
        break;
      }
      case 'dump': {   // open over the body; a shake at the end empties it
        tg.ph = PH.dump + (stepT > 1.3 && stepT < 1.9 ? Math.sin((stepT - 1.3) * 26) * 0.12 : 0);
        if (haul && haul.ready && !cast.on) { const top = Math.max(bayArc().top, bedI.floor + haul.heapTop(haul.ready)); hingeTo(drop.r - 0.5, hingeOver(top)); }
        if ((load <= 0.001 && stepT > 1.9) || stepT > 3.8) go('back');
        break;
      }
      case 'back': {   // up out of the body, swing back toward the dig, lowering once clear of the truck
        tg.ph = PH.open; const S = bayArc();
        const over = S.on && inArc(cur.sw, S, 0.15);
        tg.sw = wrap(prevSw * (op.user ? 0 : 1) + (op.user && job.n > 2 ? wrap(Math.atan2(-(job.cz - body.z), job.cx - body.x) - body.yaw) : 0));
        for (const A of trucksArcs()) if (A.on && inArc(tg.sw, A, 0.2)) { const mid = (A.lo + A.hi) / 2; tg.sw = wrap(wrap(tg.sw - mid) < 0 ? A.lo - 0.35 : A.hi + 0.35); }   // never back over a truck
        if (over) tg.y = Math.max(cur.y, S.top + 1.6); else { tg.r = 7; along(cur.sw, 7, tmp); tg.y = ground(tmp.x, tmp.z) + 2.2; }
        if (!over && stepT > 0.4) endOp();
        break;
      }
    }
  }
  function afterMove() {   // arrived (or the bay is set without moving): carry on with the op
    if (!op.on) { go('idle'); return; }
    if (op.kind === 'load' || load > CAP * 0.15) { op.kind = 'load'; go(haul && haul.ready ? 'swing' : 'hold'); return; }
    if (op.zone && job.on && !job.done) { if (nextBite(pick0, true) || nextBite(pick0)) { op.x = pick0.x; op.z = pick0.z; mark('dig', op.x, op.z); } }
    const d = Math.hypot(op.x - body.x, op.z - body.z);
    if (d < (op.zone ? ZNEAR : RMIN) || d > (op.zone ? ZFAR : RMAX)) { op.on = false; endOp(); return; }
    go('reach');
  }
  function planFailed() {   // no working spot with a truck bay for this zone: try to dig it from home; else dig it with no truck (side-cast)
    site.gen = null;
    if (job.on && !job.done && !site.fail) { site.fail = 1; site.cands = [{ x: home.x, z: home.z, yaw: home.yaw, home: true }]; site.ci = 0; return; }
    if (job.on && !job.done && site.first) { site.cast = true; site.park = site.first; site.next = null; go('clear'); return; }   // the visitor's zone is never dropped for want of a bay
    if (job.on && !job.done) { job.done = true; job.doneT = clock(); job.ver++; if (haul) haul.setZone(job.x, job.z, 0); }   // dropped: its ground is the trucks' again
    op.on = false; endOp();
  }

  // ------------------------------------------------------------------ servos + guards + IK
  // ground guard: outside a bite no point of the bucket comes within CLR of the ground (inside one, the hinge stays out of it); truck
  // guard: over a truck (its bearing and range, grown a little) the whole bucket stays CLR over its rails or its load. Both look a
  // fraction of a second ahead, so the arm rises before it gets there; and a swing that would carry a low bucket over a truck
  // waits at the edge of the truck's bearing until the boom has it high enough.
  const gq = { x: 0, z: 0 }, LAT = [0, -0.55, 0.55];
  function bucketFloor(sw, r, pe, bite) {   // lowest tip height (world y) that keeps the bucket clear at (sw, r) with angle pe
    const c = Math.cos(pe), s = Math.sin(pe), a = body.yaw + sw, lx = -Math.sin(a), lz = -Math.cos(a); let f = -1e9;
    for (let i = 0; i < BKP.length; i++) {
      if (bite && i) continue;   // in a bite only the hinge (point 0) has to stay out of the ground
      const px = BKP[i][0] - TX, py = BKP[i][1] - TY, dx = (px * c - py * s) * MS, dy = (px * s + py * c) * MS;
      along(sw, r + dx, gq);
      for (const w of LAT) { const g = ground(gq.x + lx * w * MS, gq.z + lz * w * MS); f = Math.max(f, g + (bite ? 0.12 : CLR) - dy); }
    }
    return f;
  }
  function lowest(pe) { const c = Math.cos(pe), s = Math.sin(pe); let m = 1e9; for (const [bx, by] of BKP) m = Math.min(m, ((bx - TX) * s + (by - TY) * c) * MS); return m; }
  function guard(dt) {
    const bite = step === 'lower' || step === 'drag' || step === 'curl';
    const la = 0.45, swA = cur.sw + vel.sw * la, rA = cur.r + vel.r * la;
    const peA = ARM.pe + clamp(tg.ph - ARM.pe, -0.5, 0.5);   // the bucket on its way open (or shut): its back swings down first
    let f = Math.max(bucketFloor(cur.sw, cur.r, ARM.pe, bite), bucketFloor(swA, rA, ARM.pe, bite), bucketFloor(cur.sw, cur.r, peA, bite), bucketFloor(tg.sw, tg.r, tg.ph, bite && step !== 'curl'));
    // a truck: over its bearing (and out as far as it is), the bucket's lowest point stays CLR over its top
    for (const S of trucksArcs()) {
      if (!S.on) continue;
      const need = S.top + CLR - Math.min(lowest(ARM.pe), lowest(tg.ph));
      const inNow = inArc(cur.sw, S, 0.1) && cur.r + 1.6 >= S.rMin, inSoon = inArc(swA, S, 0.1) && rA + 1.6 >= S.rMin;
      if (inNow || inSoon) f = Math.max(f, need);
      // the swing waits at the edge of the truck's bearing while the bucket is still too low to cross
      if (!inNow && cur.y < need - 0.05 && Math.max(cur.r, tg.r) + 1.6 >= S.rMin) {
        const dir = Math.sign(wrap(tg.sw - cur.sw)), edge = wrap(dir > 0 ? S.lo - 0.12 : S.hi + 0.12), gap = wrap(edge - cur.sw) * dir;
        if (dir && gap > 0 && wrap(tg.sw - edge) * dir > 0) { tg.sw = wrap(edge - dir * 0.02); tg.y = Math.max(tg.y, need + 0.2); }   // hold at the edge (the servo brakes onto it) while the boom lifts
      }
    }
    if (tg.y < f) tg.y = f;
    if (cur.y < f) cur.y += Math.min(f - cur.y, dt * 3.5);   // never sink: the arm lifts out on its own if the ground rose under it
  }
  // after the IK: where the bucket really is, in the world (the joints may have stopped short of the target, and the machine sits tilted
  // on the ground). Any point of it in the ground (outside a bite; inside one, the hinge) lifts the tip target by that much and the arm
  // is solved again, so what is drawn never cuts the ground; over a truck, the same against its top.
  const wp = new THREE.Vector3(), BKW = []; for (const [x, y] of BKP) for (const z of [-0.62, 0, 0.62]) BKW.push([x, y, z]);
  function settle() {
    const bite = step === 'lower' || step === 'drag' || step === 'curl';
    for (let it = 0; it < 3; it++) {
      exc.root.updateMatrixWorld(true);
      let lift = 0;
      const A = trucksArcs(), over = A.filter(S => S.on && inArc(cur.sw, S, 0.14));
      for (let i = 0; i < BKW.length; i++) {
        if (bite && i > 2) continue;   // a bite: the hinge only (the first three are the hinge, across the bucket)
        wp.set(BKW[i][0], BKW[i][1], BKW[i][2]); exc.bucket.localToWorld(wp);
        lift = Math.max(lift, ground(wp.x, wp.z) + (bite ? 0.1 : 0.08) - wp.y);
        for (const S of over) if (Math.hypot(wp.x - body.x, wp.z - body.z) >= S.rMin - 0.3) lift = Math.max(lift, S.top + 0.08 - wp.y);
      }
      if (lift <= 1e-3) return;
      cur.y += lift * 1.05 + 0.01; tg.y = Math.max(tg.y, cur.y); if (vel.y < 0) vel.y = 0; ik();
    }
  }
  function servo(dt) {
    const loaded = load > CAP * 0.15;
    for (const k in SV) {
      const vm = SV[k][0] * (k === 'sw' && loaded ? LOADED : 1), am = SV[k][1];
      const e = k === 'sw' ? wrap(tg[k] - cur[k]) : tg[k] - cur[k];
      const vd = Math.sign(e) * Math.min(vm, Math.sqrt(2 * am * Math.abs(e)) * 0.95);
      vel[k] += clamp(vd - vel[k], -am * dt, am * dt);
      let d = vel[k] * dt; if (Math.abs(d) > Math.abs(e) && d * e > 0 && Math.abs(vel[k]) <= am * dt * 1.01) { d = e; vel[k] = 0; }   // settle (a slow arrival only: a fast one brakes on)
      cur[k] += d;
    }
    cur.sw = wrap(cur.sw);
  }
  function ik() {
    // tip target in the turret plane, model units, relative to the root
    solveArm(cur.r / MS, (cur.y - rootY) / MS, cur.ph, ARM);
    exc.setArm(ARM.a1, ARM.a2, ARM.a3, cur.sw);
  }

  // ------------------------------------------------------------------ ground contact: carve, fill, and the load into the truck
  // the floor under the teeth: in a zone op only the zone is cut (down to its floor); otherwise grade - OVER
  const floorFn = (x, z) => (op.zone ? (inJob(x, z) ? zfloor(x, z) : 1e9) : hD(x, z) - OVER);
  let emitAcc = 0;
  function contact(dt, t) {
    exc.root.updateMatrixWorld(true); exc.tip.getWorldPosition(tip);
    const g = ground(tip.x, tip.z), cap = capNow();
    if (tip.y < g - 0.02 && load < cap && cur.ph < -0.6 && (step === 'lower' || step === 'drag' || step === 'curl')) {
      const rem = field.lower(tip.x, tip.z, op.zone ? ZR : 0.85, tip.y, floorFn, Math.min(cap - load, cap * dt * 0.62));   // fills over ~1.6 s of drag
      load += rem; op.took += rem; emitAcc += rem * 30 / (op.zone ? ZK : 1);
      while (emitAcc > 1) { // clods spill over the lip, dust puffs off the cut
        emitAcc -= 1; const a = rand() * 6.283, sp = 0.6 + rand() * 1.4;
        parts.emit(t, tip.x, g + 0.1, tip.z, Math.cos(a) * sp, 1.5 + rand() * 2.2, Math.sin(a) * sp, 1.2, g - 0.05, 1);
        if (rand() < 0.35) parts.emit(t, tip.x + (rand() - 0.5), g + 0.2, tip.z + (rand() - 0.5), (rand() - 0.5) * 0.6, 0.3, (rand() - 0.5) * 0.6, 2.2, -99, 0);
      }
    }
    // the bucket opens: over the truck the load pours into its body (counted as a pass when the bucket is empty); with no truck
    // kit it falls on the ground under the teeth (the old spoil pile behaviour)
    if (cur.ph > -0.95 && load > 0 && step === 'dump') {
      const T = !cast.on && haul && haul.ready, dv = Math.min(load, cap * dt * 1.25); load -= dv;
      if (T) {
        poured += dv; const fy = bedI.floor + haul.heapTop(T) * 0.7, n = 2 + Math.round(dv * 50);
        for (let i = 0; i < n; i++) parts.emit(t, tip.x + (rand() - 0.5) * 1.1, tip.y + rand() * 0.4, tip.z + (rand() - 0.5) * 1.1, (rand() - 0.5) * 1.0, -0.5 - rand() * 1.5, (rand() - 0.5) * 1.0, 1.5, fy, 1);
        if (rand() < 0.4) parts.emit(t, tip.x, fy + 0.4, tip.z, (rand() - 0.5) * 0.8, 0.35, (rand() - 0.5) * 0.8, 2.6, -99, 0);
        if (load <= 0.001) { haul.deposit(T, poured, dumpAt.x, dumpAt.z, clamp(poured / cap, 0.3, 1)); poured = 0; load = 0; }
      } else {
        if (!dumpAt.on) { dumpAt.x = tip.x; dumpAt.z = tip.z; dumpAt.on = true; }
        field.raise(dumpAt.x, dumpAt.z, 1.7, dv); relaxT = 1.2;
        const n = 2 + Math.round(dv * 60);
        for (let i = 0; i < n; i++) parts.emit(t, tip.x + (rand() - 0.5) * 1.1, tip.y + rand() * 0.4, tip.z + (rand() - 0.5) * 1.1, (rand() - 0.5) * 1.2, -0.5 - rand() * 1.5, (rand() - 0.5) * 1.2, 1.6, g + 0.05, 1);
      }
    }
    if (load <= 0 && !poured) { dumpAt.on = false; if (step !== 'dump') cast.on = false; }
    if (relaxT > 0) { relaxT -= dt; field.relax(dumpAt.x, dumpAt.z, 3.2, 2); }
    const f = clamp(load / cap, 0, 1); loadMat.opacity = clamp(f * 1.6, 0, 1); loadPts.scale.setScalar(0.6 + 0.4 * f);
    heap.visible = f > 0.02; if (heap.visible) { const e = Math.sqrt(f); heap.scale.set(0.75 + 0.25 * e, 0.15 + 0.85 * e, 0.8 + 0.2 * e); }
  }

  // ------------------------------------------------------------------ body on the ground
  function seat() {
    const x = body.x, z = body.z, e = 1.8, fx = Math.cos(body.yaw), fz = -Math.sin(body.yaw);
    const gF = ground(x + fx * e, z + fz * e), gB = ground(x - fx * e, z - fz * e), gR = ground(x - fz * e, z + fx * e), gL = ground(x + fz * e, z - fx * e);
    rootY = (gF + gB + gR + gL) / 4 - 0.1;
    const r = exc.root; r.position.set(x, rootY, z); r.rotation.set(-Math.atan((gR - gL) / (2 * e)) * 0.7, body.yaw, Math.atan((gF - gB) / (2 * e)) * 0.7);
    if (exc.setTracks) exc.setTracks(body.dl / MS, body.dr / MS); else exc.setDrive(body.dist / MS);
  }

  // ------------------------------------------------------------------ the phone demo (no pointer: it draws zones itself)
  // phase: wait (nothing drawn) | draw (corners going down, a cursor gliding along the live edge) | dig (the zone is the
  // machine's job, exactly like a visitor's) | hold (dug: the tag shows 100%) | heal (outline fades, the ground eases back
  // to how it was) -> wait. A new zone only starts while the dig view is showing.
  let shown = false;
  const demo = { phase: 'wait', t: -DEMO.first + DEMO.rest, n: 0, k: 0, x: new Float32Array(6), z: new Float32Array(6), T: 0.75, spot: Math.floor(rand() * DSPOT.length), cycles: 0,
    sp: new Float32Array(24), ns: 0, bx0: 0, bz0: 0, bx1: 0, bz1: 0, cx: 0, cz: 0 };
  // the desktop intro: on while it may still run, ctl while it holds the controls (hint hidden), view: the section is in view,
  // a/x/z/press: the cursor sprite (alpha, world point, clock time of the last press) for the HUD
  const gesture = interactive && gestureCfg === 'click' ? gestureCfg : '';   // ?dig=click (flag only); a box drag is always on
  const intro = { on: !!(interactive && introCfg && introCfg.on && !gesture), ctl: false, view: true, a: 0, x: 0, z: 0, press: -9, out: 3.5 };
  intro.ctl = intro.on;
  const introEnd = () => { if (intro.ctl) { intro.ctl = false; if (introCfg.done) introCfg.done(); } };   // handed over (or cancelled): once
  // the intro's spot: the farthest one from the machine that is still in comfortable reach (never a corner behind the tracks)
  function farSpot() {
    const P = SITE.pit, c = Math.cos(P.rot), s = Math.sin(P.rot); let bi = 0, bd = -1;
    for (let i = 0; i < DSPOT.length; i++) { const d = Math.hypot(P.x + DSPOT[i][0] * c + DSPOT[i][1] * s - body.x, P.z - DSPOT[i][0] * s + DSPOT[i][1] * c - body.z); if (d <= 9.6 && d > bd) { bd = d; bi = i; } }
    return bi;
  }
  // a quad near a pit spot, jittered, every corner clamped into reach (the same clamp as a visitor's click)
  function demoPlan() {
    const P = SITE.pit, c = Math.cos(P.rot), s = Math.sin(P.rot), S = DSPOT[demo.spot = intro.on ? farSpot() : (demo.spot + 1 + (rand() < 0.3 ? 1 : 0)) % DSPOT.length];
    const lx = S[0] + (rand() - 0.5) * 1.2, lz = S[1] + (rand() - 0.5) * 1.2, cx = P.x + lx * c + lz * s, cz = P.z - lx * s + lz * c;
    // the desktop stage is wide: a bigger patch reads
    const jit = intro.on ? 0.3 : 0.7, sz = intro.on ? 1.35 : 1, hx = (1.9 + rand() * 0.6) * sz, hz = (1.4 + rand() * 0.5) * sz, r = (rand() - 0.5) * 1.0, rc = Math.cos(r), rs = Math.sin(r);
    const n = 4, rot = Math.floor(rand() * 4);   // start on any corner, always the same way round
    for (let i = 0; i < n; i++) {
      const q = (i + rot) % 4, a = q === 0 || q === 3 ? -1 : 1, b = q < 2 ? -1 : 1;
      const ax = a * hx + (rand() - 0.5) * jit, az = b * hz + (rand() - 0.5) * jit;
      const p = { x: cx + ax * rc + az * rs, z: cz - ax * rs + az * rc };
      if (intro.on) { const bx = p.x - body.x, bz = p.z - body.z, bd = Math.hypot(bx, bz); if (bd < 4.8) { p.x = body.x + bx / bd * 4.8; p.z = body.z + bz / bd * 4.8; } }   // the intro keeps clear of the tracks
      reachable(p); offTrucks(p);
      if (i) { const dx = p.x - demo.x[0], dz = p.z - demo.z[0], d = Math.hypot(dx, dz); if (d > ZEXT) { p.x = demo.x[0] + dx / d * ZEXT; p.z = demo.z[0] + dz / d * ZEXT; } }
      demo.x[i] = p.x; demo.z[i] = p.z;
    }
    demo.n = n; demo.k = 0; demo.cx = cx; demo.cz = cz;
  }
  const ease = k => k * k * (3 - 2 * k);
  function demoBox() {   // the demo zone's bounds (what heals back)
    let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9; for (let i = 0; i < job.n; i++) { x0 = Math.min(x0, job.x[i]); x1 = Math.max(x1, job.x[i]); z0 = Math.min(z0, job.z[i]); z1 = Math.max(z1, job.z[i]); }
    demo.bx0 = x0; demo.bx1 = x1; demo.bz0 = z0; demo.bz1 = z1;
  }
  function demoTick(dt, t) {
    const D = demo, I = intro, P = I.on ? INTRO : DEMO; D.t += dt;
    switch (D.phase) {
      case 'wait': {
        const ready = shown && (!I.on || I.view);
        if (I.on && !ready) D.t = 0;   // the intro waits until the dig view is showing and in view
        if (ready && D.t > (I.on ? INTRO.wait : DEMO.rest)) { demoPlan(); D.phase = 'draw'; D.t = 0; D.T = I.on ? INTRO.first : DEMO.corner[0] + rand() * (DEMO.corner[1] - DEMO.corner[0]); }
        break;
      }
      case 'draw': {
        if (!shown || (I.on && !I.view)) { cancelDraw(); draw.hov = false; D.phase = 'wait'; D.t = 0; break; }   // the tab changed / scrolled away mid-draw: start over when it is back
        const last = D.k >= D.n, nx = last ? D.x[0] : D.x[D.k], nz = last ? D.z[0] : D.z[D.k];
        if (D.k > 0) { // the cursor glides from the last corner to the next (to the first one to close), the live edge with it
          const px = D.x[D.k - 1], pz = D.z[D.k - 1], g = ease(Math.min(1, D.t / ((last ? P.snap + 0.3 : D.T) * 0.8)));
          draw.hx = px + (nx - px) * g; draw.hz = pz + (nz - pz) * g; draw.hov = true; draw.snap = last && g > 0.98; draw.ver++;
          I.x = draw.hx; I.z = draw.hz;   // the sprite rides the live edge's own path
        } else { const g = ease(Math.min(1, D.t / (D.T * 0.85))); I.x = D.cx + (nx - D.cx) * g; I.z = D.cz + (nz - D.cz) * g; }   // to the first corner from the middle of the patch
        if (last) { if (D.t > P.snap + 0.65) { draw.hov = false; field.keep(); D.ns = 0; I.press = t; if (closeZone()) { D.phase = 'dig'; D.t = 0; introEnd(); } else { D.phase = 'wait'; D.t = 0; } } }
        else if (D.t > D.T) { // the next corner goes down
          const n0 = draw.n; I.press = t; addCorner(nx, nz); D.k++; D.t = 0; D.T = P.corner[0] + rand() * (P.corner[1] - P.corner[0]);
          if (job.on && !job.done && !draw.n) { D.phase = 'dig'; D.t = 0; introEnd(); }   // it closed on the first corner by itself
          else if (draw.n === n0) { cancelDraw(); D.phase = 'wait'; }   // a corner refused (too close): try another zone
        }
        break;
      }
      case 'dig':
        if (!job.done && D.t > DEMO.cap) stopJob();   // a zone never drags on: wrap it up
        if (job.done && !op.on) { D.phase = 'hold'; D.t = 0; }
        break;
      case 'hold':
        if (D.t > DEMO.hold) { D.phase = 'heal'; D.t = 0; job.on = false; job.ver++; if (haul) haul.setZone(job.x, job.z, 0); marks[0].out = Math.min(marks[0].out, t); demoBox(); }
        break;
      case 'heal': { // the outline fades while the cut eases back; t < 0: a bite still landing
        if (D.t < 0) break;
        const a = 1 - Math.exp(-dt * 2.6);
        field.heal(D.bx0, D.bz0, D.bx1, D.bz1, 2.4, a);
        if (D.t > DEMO.heal) { D.phase = I.on ? 'off' : 'wait'; D.t = 0; D.cycles++; job.demo = false; if (I.on) I.on = false; }
        break;
      }
    }
  }
  // the visitor took over (first pointerdown or Esc on the stage) while the intro runs. Still drawing: the half-drawn zone is
  // cleared, nothing else was touched. Already digging (handed over): the dig stops where it is (the bite in the bucket curls
  // and goes to the truck), the outline fades and the cut heals back on its own clock, so their own zone starts on clean ground.
  function introCancel() {
    const D = demo, I = intro;
    if (!I.on) return;
    if (I.ctl) { if (D.phase === 'draw') { cancelDraw(); draw.hov = false; } D.phase = 'off'; I.on = false; I.out = 14; introEnd(); return; }   // a cancel drops the sprite at once
    if (D.phase === 'dig' || D.phase === 'hold') {
      demoBox(); stopJob(); job.on = false; job.ver++; if (haul) haul.setZone(job.x, job.z, 0); marks[0].out = Math.min(marks[0].out, clock());
      D.phase = 'heal'; D.t = -INTRO.grace;
    }
  }

  // ------------------------------------------------------------------ pointer (desktop only): click = press + release within CLICK_PX
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), hit = new THREE.Vector3(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), sp = new THREE.Vector3();
  let armed = false, downId = -1, downX = 0, downY = 0, moved = 0, downScroll = 0;
  const P0 = { x: 0, z: 0 };
  // where the pointer is over the ground (for the reticle): ok = a click here digs here as it is, blocked = it would be moved
  const hover = { on: false, x: 0, y: 0, z: 0, ok: false, ver: 0 };
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
  let cursorNow = '';
  const setCursor = c => { if (c !== cursorNow) { cursorNow = c; canvas.style.cursor = c; } };
  // the cursor while drawing: where a click would put the next corner (clamped), and whether it would close the zone; and the reticle:
  // over diggable ground a crosshair, over ground it cannot dig as it is (out of reach, a truck's) a blocked cursor
  function onHover(e) {
    if (intro.ctl) return;   // the intro owns the live edge until it hands over
    const p = armed ? pick(e) : null;
    if (p && draw.drag < 0 && !draw.box) { hover.on = true; hover.x = p.x; hover.y = p.y; hover.z = p.z; hover.ok = diggable(p.x, p.z); }
    else hover.on = false;
    hover.ver++;
    setCursor(!armed ? '' : draw.drag >= 0 || draw.box ? 'crosshair' : !hover.on ? '' : hover.ok || (draw.n > 2 && screenD(draw.x[0], draw.z[0], e) < SNAP_PX) ? 'crosshair' : 'not-allowed');
    if (gesture) return;   // a one-gesture mode has no live edge to show
    if (!armed || !draw.n || draw.box) { if (draw.hov || draw.snap) { draw.hov = draw.snap = false; draw.ver++; } return; }
    draw.snap = draw.drag < 0 && draw.n > 2 && screenD(draw.x[0], draw.z[0], e) < SNAP_PX;
    if (p && draw.drag < 0) { P0.x = p.x; P0.z = p.z; clampCorner(P0); draw.hx = P0.x; draw.hz = P0.z; }
    draw.hov = !!p && draw.drag < 0; draw.ver++;
  }
  // a box between two ground points, its sides along the camera's view on the ground (it reads as a box on screen); corners clamped
  // like a click's. ?dig=click (flag only) makes a click dig a square patch instead.
  const setC = (i, x, z) => { P0.x = x; P0.z = z; clampCorner(P0, i); draw.x[i] = P0.x; draw.z[i] = P0.z; };
  const cv = new THREE.Vector3();
  function rect(ax, az, bx, bz) {
    camera.getWorldDirection(cv); let fx = cv.x, fz = cv.z; const l = Math.hypot(fx, fz) || 1; fx /= l; fz /= l; const rx = -fz, rz = fx;
    const du = (bx - ax) * rx + (bz - az) * rz, dv = (bx - ax) * fx + (bz - az) * fz;
    draw.n = 0; setC(0, ax, az); draw.n = 1; setC(1, ax + rx * du, az + rz * du); draw.n = 2; setC(2, bx, bz); draw.n = 3; setC(3, ax + fx * dv, az + fz * dv); draw.n = 4; draw.ver++;
  }
  const dragA = { on: false, x: 0, z: 0 };
  const onDown = e => {
    if (!armed || !e.isPrimary) return;
    if (intro.on) introCancel();   // any press on the stage takes the controls from the intro, and the same click then goes on as the visitor's
    if (e.button !== 0) return;
    downId = e.pointerId; downX = e.clientX; downY = e.clientY; moved = 0; downScroll = window.scrollY;
    if (draw.n && e.pointerType !== 'touch') { // a corner under a mouse or a pen: grab it (touch never grabs, it scrolls)
      for (let i = 0; i < draw.n; i++) if (screenD(draw.x[i], draw.z[i], e) < HANDLE_PX) { draw.drag = i; try { canvas.setPointerCapture(e.pointerId); } catch (_) { /* fine */ } break; }
    }
    // no zone being drawn: a mouse or pen press on the ground may become a box drag
    if (!draw.n && draw.drag < 0 && e.pointerType !== 'touch' && !gesture) { const p = pick(e); if (p) { dragA.on = true; dragA.x = p.x; dragA.z = p.z; } }
  };
  const onMove = e => {
    if (intro.ctl) return;   // moving the mouse never cancels the intro (only a press does), and never fights its live edge
    if (e.pointerId === downId) moved = Math.max(moved, Math.hypot(e.clientX - downX, e.clientY - downY));
    if (dragA.on && e.pointerId === downId && moved > CLICK_PX && Math.abs(window.scrollY - downScroll) <= 2) {
      if (!draw.box) { draw.box = true; try { canvas.setPointerCapture(e.pointerId); } catch (_) { /* fine */ } }
      const p = pick(e); if (p) { rect(dragA.x, dragA.z, p.x, p.z); lastInput = clock(); }
      onHover(e); return;
    }
    if (draw.drag >= 0 && e.pointerId === downId && moved > CLICK_PX) {
      const p = pick(e);
      if (p) { const i = draw.drag; P0.x = p.x; P0.z = p.z; clampCorner(P0, i); draw.x[i] = P0.x; draw.z[i] = P0.z; draw.ver++; lastInput = clock(); }
    }
    onHover(e);
  };
  const onUp = e => {
    if (e.pointerId !== downId) return; downId = -1;
    moved = Math.max(moved, Math.hypot(e.clientX - downX, e.clientY - downY));
    if (dragA.on) {
      dragA.on = false;
      if (draw.box) { draw.box = false; try { canvas.releasePointerCapture(e.pointerId); } catch (_) { /* fine */ } if (draw.n === 4 && Math.abs(window.scrollY - downScroll) <= 2) closeZone(); else cancelDraw(); onHover(e); return; }
    }
    const dragged = draw.drag >= 0 && moved > CLICK_PX; draw.drag = -1;
    if (!armed || dragged || moved > CLICK_PX || Math.abs(window.scrollY - downScroll) > 2) { onHover(e); return; }   // a drag or a scroll
    // a click: on the first corner closes the zone; anywhere else on the ground places a corner
    if (gesture === 'click') { const p = pick(e); if (p) { rect(p.x - PATCH, p.z - PATCH, p.x + PATCH, p.z + PATCH); lastInput = clock(); closeZone(); } return; }
    if (draw.n > 2 && screenD(draw.x[0], draw.z[0], e) < SNAP_PX) closeZone();
    else { const p = pick(e); if (p) { P0.x = p.x; P0.z = p.z; clampCorner(P0); addCorner(P0.x, P0.z); } }
    onHover(e);
  };
  const onCancel = () => { downId = -1; draw.drag = -1; if (dragA.on) { dragA.on = false; if (draw.box) { draw.box = false; cancelDraw(); } } };
  const onLeave = () => { if (draw.hov || draw.snap) { draw.hov = draw.snap = false; draw.ver++; } hover.on = false; hover.ver++; };
  const onDbl = () => { if (armed && draw.n > 2 && !draw.box) closeZone(); };
  // Escape cancels the zone being drawn, or (with none) stops the dig; Enter closes it. Never prevented, never in a field.
  const onKey = e => {
    if (!armed || e.defaultPrevented || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target?.tagName || '') || e.target?.isContentEditable) return;
    if (intro.ctl && (e.key === 'Escape' || e.key === 'Enter')) { introCancel(); return; }   // the intro is only ever cancelled, never closed by a key
    if (e.key === 'Escape') { if (draw.n) { cancelDraw(); dragA.on = false; } else stopJob(); }
    else if (e.key === 'Enter' && draw.n > 2 && !draw.box) closeZone();
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
    get step() { return user ? 'user:' + step : step; }, home, body, op, queued, marks, drv, IDLE, RMAX, site, hover,
    draw, job, zoneStats, MAXV, demo, intro, gesture,
    // what the next click does: 'zone' (start a zone) | 'point' (add a corner) | 'close' (a corner, or close on the first) | 'box'
    // (release to start the box being dragged) ('' without a pointer)
    get hint() { if (!interactive || intro.ctl) return ''; if (gesture) return 'zone'; if (draw.box) return 'box'; return draw.n ? (draw.n > 2 ? 'close' : 'point') : 'zone'; },
    get drawing() { return draw.n > 0; },
    get driving() { return step === 'drive' || step === 'home'; },
    // armed: the dig view has landed and this is a desktop pointer; the canvas only takes pointer events then.
    // Leaving the dig view drops a zone that was still being drawn (the one being dug carries on).
    setArmed(a, inView = true) {
      shown = !!a; intro.view = inView;
      a = !!(a && interactive); if (a === armed) return; armed = a;
      canvas.style.pointerEvents = a ? 'auto' : 'none'; setCursor(a ? 'crosshair' : '');
      if (!a) { downId = -1; dragA.on = false; draw.box = false; cancelDraw(); onLeave(); }
    },
    update(dt, t) {
      if (!interactive || intro.on) demoTick(dt, t);   // the phone demo, or the desktop intro (once)
      // the cursor sprite: in while the intro draws, out at the handover (or a cancel)
      if (intro.a > 0 || intro.ctl) { const on = intro.ctl && demo.phase === 'draw'; intro.a += ((on ? 1 : 0) - intro.a) * (1 - Math.exp(-dt * (on ? 6 : intro.out))); if (!on && intro.a < 0.004) intro.a = 0; }   // out: a slow fade after the closing click (the press ring plays), a quick one on a cancel
      // the home bay is worked out at the start, a candidate per frame
      if (site.homeGen) { const r = site.homeGen.next(); if (r.done) { site.homeGen = null; site.homeBay = r.value; if (r.value && atHome() && !site.bay && step !== 'plan' && step !== 'clear') { site.bay = r.value; haul.setBay(site.bay); if (!booted) haul.startIn(site.bay); } booted = true; } }
      // back to the autopilot once the zone is dug (or stopped) and nothing has happened for IDLE s
      if (interactive && user && !op.on && !(job.on && !job.done) && t - Math.max(lastInput, doneT) > IDLE) {
        user = false; marks[0].out = Math.min(marks[0].out, t); if (job.on) { job.on = false; job.ver++; if (haul) haul.setZone(job.x, job.z, 0); }
      }
      if (!user && !op.on && (step === 'idle')) autopilot();
      if (haul) haul.setExcavator(body.x, body.z);
      frameN++; run(dt);
      seat(); guard(dt); servo(dt); ik(); settle(); contact(dt, t); if (relaxT > 0 || step === 'dump') settle();   // (the ground under it may have just moved)
      if (haul) { const a = body.yaw + cur.sw, r = cur.r + 1.6; exc.stick.getWorldPosition(wp); const ys = wp.y; haul.setArm(true, body.x, body.z, body.x + Math.cos(a) * r, body.z - Math.sin(a) * r, Math.min(tip.y - 0.4, ys)); }
    },
    // world points of the arm for shadows and the HUD: boom pin, stick end, teeth
    arm(outPin, outEnd) { exc.boom.getWorldPosition(outPin); exc.bucket.getWorldPosition(outEnd); },
    telemetry(out) {
      out.swing = cur.sw * 180 / Math.PI; out.reach = cur.r; out.grade = tip.y - hD(tip.x, tip.z); out.load = load / capNow(); out.auto = !user || !interactive || job.demo;   // the phone demo and the desktop intro read Autopilot
      out.ground = tip.y - ground(tip.x, tip.z);
      return out;
    },
    // test hooks: corner(x, z) runs the same path as a click on the ground there (clamp included); close() / cancel() /
    // stop() as the snap click, Escape (drawing) and Escape (digging); box(ax, az, bx, bz) as a box drag released
    qa: { cur, tg, vel, ARM, bayWhy: () => site.bay && { sc: haul.staticClear(site.bay), off: zoneOffBay(site.bay, body.x, body.z), same: site.bay === haul.bay }, get load() { return load; }, set load(v) { load = v; }, get stepName() { return step; }, zfloor, diggable, bayArc, lowest,
      introCancel: () => introCancel(),
      corner(x, z) { const p = { x, z }, c = clampCorner(p); addCorner(p.x, p.z); return [p.x, p.z, c]; },
      box(ax, az, bx, bz) { rect(ax, az, bx, bz); return closeZone(); },
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
