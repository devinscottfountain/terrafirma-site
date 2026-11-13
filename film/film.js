// film.js: the homepage scroll film on one canvas. Austin lot, one day dawn to dusk, one continuous pull out to the whole Earth (Moon orbiting),
// Mars rising over its limb, out to Mars -> "One day on Mars" title -> SpaceX lines -> atmospheric entry -> Jezero colony timelapse, rockets, launch.
// Ported from the prototype's d5/main.js with the D5 intro (text, button, veil, scroll lock, Moon stop) and every flag branch removed.
//
// createFilm({ THREE, host, section, scenes, sol, quality, files }) -> { ready, canvas, renderer, start, stop, step, resize, snap, dispose, state }
//   host     the sticky mount (the canvas is added inside it)
//   section  the film track: its height is the scroll distance of the whole film
//   scenes   { austin, earth, title, reind, colony, launch } text scene elements (read for layout only, never written)
//   sol      { root, value } optional SOL readout elements (opacity on root, number into value)
//   files    resolved asset urls: { tex: {...}, stars, milky, ortho: [3], jezero: { dtm, hiBump, ctxBump } }
// Scroll -> film: every scene anchor is read from the DOM, so any scene height works (see README for the recommended ones).
import { createPost } from './post.js';
import { createSky } from './sky.js';
import { createPlanets } from './planets.js';
import { createSite, AUSTIN, SITE_ROT } from './site.js';
import { createAustinCam, sunAt, exposureAt } from './austin.js';
import { createAircraft } from './aircraft.js';
import { createFlight, CA, E0, E1, portraitFov, portraitLift } from './flight.js';
import { createColony, COL, ARRIVE, ROCK_SITES } from './colony.js';
import { clamp01, sstep, smoother, pchip, pmap, arcClock, lerp } from './util.js';
import LOOK from './look.json.js';
import { createGovernor } from './perf.js';
import { footerView } from '../footer/footer3d.js';
import { toFooter } from '../footer/foot-model-plan.js';
import { height as footHeight } from '../footer/foot-model-kit.js';

// CA = 0.46 the entry swap (everything past it is the Jezero timelapse), E0..E1 = 0.40..0.60 the atmospheric entry window (flight.js)
// title disc radius / viewport height (phones; MM_R_WIDE from 768 wide, 25% larger); WORD_GAP: the title words' inner edges off the disc, per
// disc radius (48 px at 1440x900); the SpaceX hold ramps in, holds, ramps out (clock S): out by E0, so the entry line is clean; held disc growth per unit S
const MM_R = 0.14, MM_R_WIDE = 0.175, WORD_GAP = 48 / 157.5, B2 = [0.04, 0.12, 0.32, 0.40], HOLD_CREEP = 0.3;
const P_END = 1.12;                  // film clock at the end of the track (the launch has cleared the frame)
// past the end the launch keeps going on real time while the CTA rises over the canvas: the launch clock runs on at OVER_RATE (g/s,
// eased in and out), up to OVER_MAX, and rewinds just as smoothly when the page scrolls back into the track
const OVER_RATE = 0.03, OVER_MAX = 0.4, OVER_TAU = 0.6;
const SOL_S0 = -0.02;                // film clock where the SOL readout starts to fade in (its count starts there too)
// per beat look offsets blend on S: Austin -> space over the first beat of space, space -> Mars orbit as the disc grows, Mars orbit -> colony across the swap flash (CA)
const BEAT_X = [[-1, -0.9], [-0.3, -0.1], [0.43, 0.49]];
const beatVal = (B, k, a, b, c) => lerp(lerp(lerp(B.austin[k], B.space[k], a), B.marsOrbit[k], b), B.colony[k], c);

export function createFilm({ THREE, host, section, scenes, sol, quality, files }) {
  const HIGH = quality === 'high';
  // phones (low tier on a touch screen): pixel ratio up to 2, so a 3x screen is not upscaled from 1x. Same programs and post level as
  // the rest of the low tier; the governor's levels map to PHONE_PR there and it steps down from 2 when frames run long
  const tq0 = new URLSearchParams(location.search).get('touch');
  const PHONE = !HIGH && (tq0 ? tq0 === '1' : matchMedia('(pointer: coarse)').matches);
  const PHONE_PR = [0.75, 1, 1.25, 1.5, 1.75, 2], PR_MAX = HIGH ? 1.5 : PHONE ? 2 : 1;
  const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, PR_MAX));
  let W = Math.max(1, host.clientWidth), H = Math.max(1, host.clientHeight);
  renderer.setSize(W, H, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false; // shadows render only when the loop asks (site: every frame it matters, colony: on build changes)
  const canvas = renderer.domElement;
  Object.assign(canvas.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', display: 'block' });
  host.insertBefore(canvas, host.firstChild);   // behind the SOL readout
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x010103);
  const cam = new THREE.PerspectiveCamera(42, W / H, 0.1, 9000);
  const post = createPost({ THREE, renderer, scene, cam, low: !HIGH }), { bloom } = post;
  // the look: grade, lens and per beat offsets (look.json.js). One live object; the ?grade panel writes the same one
  const tune = JSON.parse(JSON.stringify(LOOK));
  let freeze = false; // dial: hold the film clock (machines, crew, strobes, grain); scroll still drives the film
  const launchExp = () => { const r = mode === 'colony' && colonyW.api && colonyW.api.rockets; return r ? r.launch.exp : 0; };
  const cranesUp = () => { const c = colonyW.api.cranes; for (let i = 0; i < c.length; i++) if (c[i].g.visible) return true; return false; };
  function applyTune() {
    const G = tune.grade, L = tune.lens, B = tune.beats, X = BEAT_X, look = post.look, gr = post.grade;
    if (look) { look.bloom = L.bloomStrength; look.threshold = L.bloomThreshold; look.vignette = L.vignette; look.grain = L.grain; }
    if (!gr) return;
    const a = sstep(S, X[0][0], X[0][1]), b = sstep(S, X[1][0], X[1][1]), c = sstep(S, X[2][0], X[2][1]);
    const w = G.warmth + beatVal(B, 'warmth', a, b, c), t = G.tint;
    gr.expK = 2 ** (G.exposure + beatVal(B, 'exposure', a, b, c) - 0.55 * launchExp()); // the plume pulls the exposure down, it recovers as the ship climbs
    if (w === 0 && t === 0) gr.wr = gr.wg = gr.wb = 1;
    else { const r = 2 ** (0.25 * w), g = 2 ** (-0.2 * t), bl = 2 ** (-0.25 * w), n = 1 / (0.2126 * r + 0.7152 * g + 0.0722 * bl); gr.wr = r * n; gr.wg = g * n; gr.wb = bl * n; } // warm/cool on red-blue, tint on green-magenta, luminance kept
    gr.contrast = G.contrast; gr.saturation = G.saturation; gr.lift = G.lift; gr.gamma = G.gamma; gr.gain = G.gain;
  }
  // adaptive quality (perf.js): pixel ratio, post level, trails, shadow size and refresh, launch particles. Applied by uniforms and
  // target sizes only; it holds still through the planet-to-colony flash (E0 .. 0.52) unless frames collapse
  let trailsOK = true, partKeep = 1;
  const gov = createGovernor({ high: HIGH, top: PHONE ? PHONE_PR.length - 1 : null, hold: () => S > E0 && S < 0.52, holdUp: () => overlap, capOK: () => TOUCH.on, apply: (q, lv) => {
    const pr = Math.min(devicePixelRatio || 1, PR_MAX, PHONE ? PHONE_PR[lv] : q.pr);
    if (renderer.getPixelRatio() !== pr) { renderer.setPixelRatio(pr); post.setSize(W, H); post.resetMotion(); }
    post.setQuality(HIGH ? q.post : Math.min(q.post, 1));
    trailsOK = q.trails; shadowEvery = q.every; partKeep = q.keep;
    const sh = sunLight.shadow, sx = HIGH ? q.shadow : Math.min(q.shadow, 2048);
    if (sh.mapSize.x !== sx) { sh.mapSize.set(sx, sx / 2); if (sh.map) { sh.map.dispose(); sh.map = null; } forceShadow = true; } // new size, same programs
    const r = colonyW.api && colonyW.api.rockets; if (r && r.setKeep) r.setKeep(partKeep);
  } });
  // UnrealBloom's blurs use sigma = kernel radius, so a lone bright pixel blooms into a soft square. A proper Gaussian keeps the glow round.
  (bloom.separableBlurMaterials || []).forEach(m => { const c = m.uniforms.gaussianCoefficients?.value; if (!c) return; const n = c.length, sg = n / 2.6; for (let i = 0; i < n; i++) c[i] = 0.39894 * Math.exp(-0.5 * i * i / (sg * sg)) / sg; });

  // ---------- the solar system and the space camera (flight.js): Earth at the origin, Mars ~480 out beyond its top as seen on the copy frame ----------
  const flight = createFlight({ THREE }), { toSun, EARTH, MARS, C0, L0 } = flight;
  const planets = createPlanets({ THREE, scene, renderer, toSun, EARTH, MOON: flight.moonAt(-1, new THREE.Vector3()), MARS, files: files.tex });
  planets.moon.material.uniforms.uRelief.value = 0.35; planets.mars.material.uniforms.uRelief.value = 0.4; // relief is synthesized, keep it a whisper so the real maps lead
  let sky = null;
  const skyP = createSky({ THREE, scene, starsUrl: files.stars, milkyUrl: files.milky, milkyWayIntensity: 0.14 }).then(s => { sky = s; }).catch(() => {});

  const sunLight = new THREE.DirectionalLight(0xfff1dc, 2.4); sunLight.position.copy(toSun).multiplyScalar(100);
  const ambient = new THREE.AmbientLight(0x223044, 0.35);
  const hemi = new THREE.HemisphereLight(0xffc896, 0x5a2a14, 1.4); hemi.intensity = 0; // sky bounce shared by the Austin site and the colony (one light, so materials never recompile)
  scene.add(sunLight, sunLight.target, ambient, hemi);

  // ---------- Jezero Base (built lazily, in idle time once Mars is on approach) ----------
  const colonyW = createColony({ THREE, renderer, scene, cam, planets, sunLight, ambient, hemi, files: files.jezero, HIGH,
    lateRockets: r => inWorld('colony', () => compileIn(r.group)),
    lodPath: () => { const o = []; for (let i = 0; i <= 48; i++) { const v = new THREE.Vector3(), q = 0.6 + (P_END - 0.6) * i / 48; cPosC.getPoint(cPosU(q), v); endPos(q, v, true); o.push(v.sub(COLV)); } return o; } }); // dome LOD (colony.js), the hand-off move included
  const colonyGroup = colonyW.group;
  const COLV = new THREE.Vector3(COL.x, COL.y, COL.z);

  // sun sprite (the post chain draws the anamorphic streaks)
  const radialTex = stops => { const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'), g = x.createRadialGradient(128, 128, 0, 128, 128, 128); stops.forEach(([o, s]) => g.addColorStop(o, s)); x.fillStyle = g; x.fillRect(0, 0, 256, 256); return new THREE.CanvasTexture(c); };
  const sunCore = new THREE.Sprite(new THREE.SpriteMaterial({ map: radialTex([[0, 'rgba(255,255,255,1)'], [0.12, 'rgba(255,236,200,0.9)'], [0.35, 'rgba(255,170,80,0.25)'], [1, 'rgba(0,0,0,0)']]), color: 0xffffff, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false }));
  scene.add(sunCore);

  const cut = () => post.resetMotion(); // hard cut: no motion blur or TAA/trail history across it

  // ---------- Austin: the opening lot, then a powers-of-ten pull out to the Earth frame below (camera in austin.js) ----------
  const SITE0 = new THREE.Vector3(0, 40000, 0);
  const site = createSite({ THREE, scene, renderer, sunLight, hemi, ORIGIN: SITE0, earthU: planets.earth.material.uniforms, orthoUrl: files.ortho });
  const aircraft = createAircraft({ THREE, parent: site.group, high: HIGH }); // night traffic: nav lights only, lives (and compiles) with the site set
  const EARTH_SPIN = 0.012, U_PER_M = 10 / 6371000; // Earth radius is 10 units
  const latR = THREE.MathUtils.degToRad(AUSTIN.lat), lonU = (AUSTIN.lon + 180) / 360;
  const austinLocal = new THREE.Vector3(-Math.cos(2 * Math.PI * lonU) * Math.cos(latR), Math.sin(latR), Math.sin(2 * Math.PI * lonU) * Math.cos(latR));
  // park Austin on the night side right under the Earth frame: same azimuth as C0, so the pull out lands with the city just below centre
  const SPIN_LAND = Math.atan2(austinLocal.z, austinLocal.x) - Math.atan2(C0.z, C0.x);
  const AUS = austinLocal.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), SPIN_LAND).multiplyScalar(10), AUSn = AUS.clone().normalize();

  // ---------- camera: one move, Earth frame -> whole Earth (copy) -> over the top of Earth, Mars rising ahead -> title -> SpaceX hold -> down the entry line.
  // Position, aim, up and lens all live in flight.js on the film clock; the Moon orbits on it too.
  const spaceCam = flight.spaceCam;
  const austin = createAustinCam({ THREE, SITE_ROT, AUS, U_PER_M, C0, L0, spaceCam }), AC = { pos: new THREE.Vector3(), look: new THREE.Vector3(), up: new THREE.Vector3() };
  const LAMH = austin.LAMH, LAM1 = austin.LAM1, sunO = {};
  // the camera where its distance from the lot is D (bisect on its ln distance, up to the world swap): the aircraft are placed from it
  const acO = { pos: new THREE.Vector3(), look: new THREE.Vector3(), up: new THREE.Vector3() };
  const camAtDist = (D, out) => { const l = Math.log(D); let lo = austin.k.yA, hi = austin.k.yH; for (let i = 0; i < 50; i++) { const m = (lo + hi) / 2; austin.at(m, acO); if (acO.lam < l) lo = m; else hi = m; } return austin.at((lo + hi) / 2, out); };

  // ---------- colony camera: descent onto Jezero, a slow push round the ships and the build pad, then the tilt up after the ship ----------
  const C_PIV = [15, 0, -135], cAt = (R, a, h) => [C_PIV[0] + R * Math.sin(a * Math.PI / 180), h, C_PIV[2] + R * Math.cos(a * Math.PI / 180)];
  const CSH = [
    [CA, [2200, 2600, 900], [-3200, 0, -200], 50],   // just under the swap, in the haze; heading west along the axis, ~25 deg down: rim + delta ahead
    [0.52, [1400, 1500, 700], [-1400, 0, -300], 48],  // haze clearing: Jezero and the delta from altitude, the site low in frame
    [0.57, [750, 700, 550], [-250, 0, -250], 46],     // terrain resolving, the ships' plumes below
    [0.62, cAt(600, 28, 260), [15, 30, -135], 42],    // settle: ships down, the city starts
    [0.72, cAt(500, 32, 190), [15, 34, -135], 40],
    [0.80, cAt(420, 24, 130), [10, 38, -130], 40],
    [0.88, cAt(350, 15, 80), [-5, 44, -125], 42],     // the stacked ship on the pad, parked ships beside it
    [1.0, cAt(450, 13, 85), [-15, 52, -118], 45],     // lift-off: a slow pull back and up so the climb and the city share the frame
    [1.12, cAt(600, 14, 115), [-20, 60, -115], 50]    // the last frame: the ship high on its column, the city below
  ].map(([p, a, b, f]) => ({ p, pos: new THREE.Vector3(...a).add(COLV), look: new THREE.Vector3(...b).add(COLV), fov: f }));
  const cPosC = new THREE.CatmullRomCurve3(CSH.map(k => k.pos), false, 'centripetal'), cLookC = new THREE.CatmullRomCurve3(CSH.map(k => k.look), false, 'centripetal');
  // position and aim each run on their own arc-length clock (like spaceCam): same keys at the same S, no speed step at any key
  // the end keys ease to a stop (zero speed, zero lens change) where the track ends, so nothing steps when the clock stops there
  const CP = CSH.map(k => k.p), cPosU = arcClock(cPosC, CP, undefined, 0), cLookU = arcClock(cLookC, CP, undefined, 0), cFov = pchip(CP, CSH.map(k => k.fov), undefined, 0);
  // scroll -> the colony's build clock gR (rockets.js table: land 0-0.064, ARRIVE 0.1, ignite 0.8, liftoff 0.83, 1.0 ~230 m up)
  const gOf = (() => { const f = pchip([0.49, 0.62, 0.88, 0.9, 1.12], [0, 0.1, 0.8, 0.83, 1]); return p => (p <= 0.49 ? 0 : p >= 1.12 ? 1 : clamp01(f(p))); })();
  const LIFT_G = 0.83, rockW = new THREE.Vector3(), rockL = new THREE.Vector3(), padW = new THREE.Vector3(ROCK_SITES.build[0], 0, ROCK_SITES.build[1]).add(COLV), padD = new THREE.Vector3();
  // the ship's mid-body (world) at launch clock g: rockets.launch.pos when rockets.js gives it, else its published climb over the pad
  function shipAt(g, out) {
    const r = colonyW.api && colonyW.api.rockets, L = r && r.launch;
    if (L && L.pos) return out.copy(L.pos);
    const k = Math.max(0, g - LIFT_G), y = 4800 * k * k * (1 + 4 * k), d = 0.00025 * y * y; return out.set(ROCK_SITES.build[0] - 0.952 * d, 26 + y, ROCK_SITES.build[1] - 0.305 * d).add(COLV);
  }
  const elev = v => Math.asin(THREE.MathUtils.clamp(v.y / Math.max(1e-6, v.length()), -1, 1)), angD = a => Math.atan2(Math.sin(a), Math.cos(a));
  // q: the path clock (held at P_END past the track), gL: the launch clock (runs on past it)
  function colCam(p, outPos, outLook, gL) {
    const q = Math.min(Math.max(p, CA), P_END);
    cPosC.getPoint(cPosU(q), outPos); cLookC.getPoint(cLookU(q), outLook);
    // portrait: open the lens part way (flight.portraitFov): the colony and the launch framed taller rather than wider
    const f = portraitFov(q, cFov(q), cam.aspect);
    // launch: from lift-off the aim tilts up after the ship, a beat behind it, but only as far as keeps the pad in frame: the ship
    // climbs into the top third with its column under it and the city along the bottom. Past that the ship leaves the top.
    const k = sstep(gL, LIFT_G + 0.002, LIFT_G + 0.045);
    if (k > 0) {
      const hv = THREE.MathUtils.degToRad(f / 2), d0 = rockW.copy(outLook).sub(outPos), dist = d0.length();
      shipAt(gL, rockL).sub(outPos);
      const e0 = elev(d0), es = elev(rockL), ep = elev(padD.copy(padW).sub(outPos));
      const hold = 0.3 + 1.1 * sstep(over, 0, OVER_MAX * 0.6); // past the track the pad may sink into the CTA as the aim follows the ship up
      const pitch = lerp(e0, Math.min(Math.max(e0, es - 0.5 * hv), ep + hold * hv), k);
      const a0 = Math.atan2(d0.x, d0.z), yaw = a0 + angD(Math.atan2(rockL.x, rockL.z) - a0) * 0.55 * k;
      outLook.set(Math.cos(pitch) * Math.sin(yaw), Math.sin(pitch), Math.cos(pitch) * Math.cos(yaw)).multiplyScalar(dist).add(outPos);
    }
    return f;
  }

  // ---------- the hand-off to the 3D footer: after lift-off the camera comes down and round onto the footer's opening camera ----------
  // The footer (footer3d.js) shows this colony from the ground: foot-model-plan.js places the same plan there, mirrored and turned. One
  // turn about the hub (no mirror; the plan's own symmetry keeps the rings, avenues and outer domes in place) maps its hub and build pad
  // back onto ours, so its eye, aim and lens have a place here. The film ends on that camera, framing the strip of sky right above the
  // footer's frame: the film section ends where the footer starts, so as the page scrolls on the two canvases join into one picture.
  // The move runs over END_S (zero speed at both ends, still from the end of the track on); the launch carries on in that frame.
  const footEl = document.querySelector('[data-foot-canvas]') || document.querySelector('[data-foot]');
  // move windows (S): the orbit (from just before lift-off), the descent, the aim onto the ship (colony lens kept, so the city stays along
  // the bottom), then the last tilt and zoom onto the footer's aim and lens as the ship climbs away; the ship's place up the frame while
  // the aim follows it; the sun's elevation at the end (rad)
  const END_S = [0.86, P_END], END_Y = [0.98, P_END], END_A = [0.86, 0.95], END_Q = [1.0, P_END], SHIP_Y = 0.5, END_SUN_EL = -0.3;
  const FOOT = footEl ? (() => {
    const hub = toFooter(0, 0), pad = toFooter(ROCK_SITES.build[0], ROCK_SITES.build[1]);
    const th = Math.atan2(pad[1] - hub[1], pad[0] - hub[0]) - Math.atan2(ROCK_SITES.build[1], ROCK_SITES.build[0]), c = Math.cos(th), sn = Math.sin(th);
    const dy = -footHeight(hub[0], hub[1]); // footer y -> ours: the footer's ground at its hub is our ground (y 0)
    const toCol = (x, y, z, out) => { const X = x - hub[0], Z = z - hub[1]; return out.set(X * c + Z * sn, y + dy, -X * sn + Z * c).add(COLV); };
    const v = footerView(16, 9), F = { toCol, eye: toCol(...v.eye, new THREE.Vector3()), look: new THREE.Vector3(), q: new THREE.Quaternion(), c: 0, e: 1, ok: false };
    const sx = Math.sin(v.sunAz), sz = -Math.cos(v.sunAz); F.sunAz = Math.atan2(-sx * sn + sz * c, sx * c + sz * sn); // the footer's glow, our azimuth
    F.rE = Math.hypot(F.eye.x - COLV.x, F.eye.z - COLV.z); F.aE = Math.atan2(F.eye.z - COLV.z, F.eye.x - COLV.x);
    return F;
  })() : null;
  const endK = (S, w, any = false) => (FOOT && (any || FOOT.ok) ? q5(S, w[0], w[1]) : 0); // any: the footer's size not known yet (the dome LOD path)
  // the footer's lens and aim for its current size: the window is the strip above its frame, in tangent units of its camera
  const mE = new THREE.Matrix4(), Y_UP = new THREE.Vector3(0, 1, 0);
  function measureFoot() {
    if (!FOOT) return;
    const fw = footEl.clientWidth, fh = footEl.clientHeight; FOOT.ok = fw > 0 && fh > 0; if (!FOOT.ok) return;
    const v = footerView(fw, fh), t = Math.tan(v.vfov * Math.PI / 360);
    FOOT.toCol(...v.look, FOOT.look); mE.lookAt(FOOT.eye, FOOT.look, Y_UP); FOOT.q.setFromRotationMatrix(mE);
    FOOT.e = 2 * t * H / fh; FOOT.c = t + FOOT.e / 2; // vertical extent and centre of the strip (its bottom is the footer's top row)
  }
  // position: round the hub and down onto the footer's eye (polar, so the arc stays clear of the city), on top of the colony path
  function endPos(S, out, any = false) {
    const w = endK(S, END_S, any); if (w <= 0) return out;
    const dx = out.x - COLV.x, dz = out.z - COLV.z, a0 = Math.atan2(dz, dx), r = lerp(Math.hypot(dx, dz), FOOT.rE, w), a = a0 + angD(FOOT.aE - a0) * w;
    return out.set(COLV.x + r * Math.cos(a), lerp(out.y, FOOT.eye.y, endK(S, END_Y, any)), COLV.z + r * Math.sin(a));
  }
  // the camera through the move: position, aim (slerp onto the footer's) and lens (the colony lens, portrait lift included, onto the strip)
  const qShip = new THREE.Quaternion(), shipV = new THREE.Vector3();
  function endCam(S, fov) {
    const wA = endK(S, END_A), wQ = endK(S, END_Q);
    endPos(S, pos); cam.position.copy(pos);
    const e0 = 2 * Math.tan(fov * Math.PI / 360), c = lerp(lerp(-portraitLift(S, cam.aspect) * e0, 0, wA), FOOT.c, wQ), e = e0 ** (1 - wQ) * FOOT.e ** wQ;
    // follow: level, centred on the ship across, SHIP_Y up the window (whatever the window is doing), so the climb reads through the move
    shipAt(gL, shipV).sub(pos); const ph = elev(shipV) - Math.atan(c - e / 2 + SHIP_Y * e), ya = Math.atan2(shipV.x, shipV.z);
    shipV.set(Math.cos(ph) * Math.sin(ya), Math.sin(ph), Math.cos(ph) * Math.cos(ya)).add(pos); mE.lookAt(pos, shipV, Y_UP); qShip.setFromRotationMatrix(mE);
    cam.quaternion.slerp(qShip, wA).slerp(FOOT.q, wQ);
    setWindow(c, e);
    setClip(THREE.MathUtils.clamp((pos.y - COL.y) * 0.08, 0.1, 30), 9000);
  }
  // the sky: the dusk glow comes round behind the footer's (over the orbit), then the sun goes on down through the last tilt, so the
  // strip of sky the film ends on is the footer's night sky
  function endSun(S) {
    const w = endK(S, END_S); if (w <= 0) return;
    const sv = colonyW.sun, el = lerp(Math.asin(THREE.MathUtils.clamp(sv.y, -1, 1)), END_SUN_EL, endK(S, END_Q)), a0 = Math.atan2(sv.z, sv.x), a = a0 + angD(FOOT.sunAz - a0) * w;
    sv.set(Math.cos(el) * Math.cos(a), Math.sin(el), Math.cos(el) * Math.sin(a));
  }
  // the lens as a window in tangent units (vertical extent e, centre c; square pixels): a view offset on a symmetric frustum
  function setWindow(c, e) {
    const T = Math.abs(c) + e / 2, k = 2 * T / e, fw = W * k, fh = H * k;
    cam.fov = 2 * Math.atan(T) * 180 / Math.PI;
    cam.setViewOffset(fw, fh, (fw - W) / 2, (T - c - e / 2) * H / e, W, H); framed = true;
  }

  // ---------- Mars look: a key light fixed in camera space (front, left, a little high), so whatever the path does the disc reads full and lit ----------
  const LIT_DIR = new THREE.Vector3(-0.78, 0.42, 0.46).normalize(), litL = new THREE.Vector3(), litQ = new THREE.Quaternion();
  const halo = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShaderMaterial({
    uniforms: { uR: { value: 6 }, uL2: { value: new THREE.Vector2(LIT_DIR.x, LIT_DIR.y).normalize() }, uI: { value: 1.5 } },
    vertexShader: 'varying vec2 vQ; void main(){ vQ = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
    fragmentShader: `uniform float uR, uI; uniform vec2 uL2; varying vec2 vQ;
    void main(){ float q = length(vQ), d = max(q / uR - 1., 0.); vec2 dir = vQ / max(q, 1e-4);
      float side = smoothstep(-0.6, 1., dot(dir, uL2));
      // a thin dusty atmosphere hugging the limb (Mars' dust haze tops out ~1% of its radius up), much stronger on the lit side:
      // a narrow warm rim, not a soft disc. The inner term sits over the geometric edge so the limb never reads as a cut-out
      float g = exp(-d * 120.) * 0.75 + exp(-d * 34.) * 0.16 + exp(-d * 9.) * 0.012;
      float edge = 1. - smoothstep(11., 15., max(abs(vQ.x), abs(vQ.y))); // fade before the plane's edge: its square never shows on black
      gl_FragColor = vec4(vec3(1.0, 0.56, 0.28) * g * side * side * uI * edge, 0.); }`,
    transparent: true, depthWrite: false, blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor
  }));
  { const u = planets.marsAtmo.material.uniforms; u.uBetaR.value.multiplyScalar(0.25); u.uSunCol.value.set(1, 0.86, 0.66); u.uK.value = 15; } // dust only, warm: no blue haze over the far side
  halo.position.copy(MARS); halo.renderOrder = 3; halo.frustumCulled = false; scene.add(halo);
  function litMars(t, S) {
    flight.marsQ(t, planets.mars.quaternion); // fixed tilt + a slow spin on the clock only: nothing turns with scroll
    litL.copy(LIT_DIR).applyQuaternion(cam.quaternion);
    planets.marsAtmo.material.uniforms.uSun.value.copy(litL);
    litQ.copy(planets.mars.quaternion).invert(); planets.mars.material.uniforms.uSun.value.copy(litL).applyQuaternion(litQ);
    const d = cam.position.distanceTo(marsV); halo.quaternion.copy(cam.quaternion); halo.material.uniforms.uR.value = 6 / Math.sqrt(Math.max(0.05, 1 - 36 / (d * d)));
  }
  // Mars far off: drawn further down its own sight line (flight.marsFar), so it keeps its place on screen but starts sub-pixel.
  // A warm star of fixed pixel size carries it until the disc has a few pixels, then fades. Earth hides both by depth, so it
  // rises over the limb (through the air shell, which dims it on the way) instead of popping in.
  const starU = { uPx: { value: 1 }, uI: { value: 0 } };
  const marsStar = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(new Float32Array(3), 3)), new THREE.ShaderMaterial({
    uniforms: starU,
    vertexShader: 'uniform float uPx; void main(){ gl_PointSize = uPx; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
    fragmentShader: `uniform float uI; void main(){ vec2 q = gl_PointCoord * 2. - 1.; float r2 = dot(q, q); if (r2 > 1.) discard;
      gl_FragColor = vec4(vec3(1.0, 0.52, 0.3) * (exp(-r2 * 10.) + exp(-r2 * 3.) * 0.1) * uI, 1.); }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
  }));
  marsStar.frustumCulled = false; marsStar.renderOrder = 1; scene.add(marsStar);
  const marsV = MARS.clone(), marsShown = [planets.mars, planets.marsAtmo, halo];
  function placeMars(S, on) {
    const f = on ? flight.marsFar(S) : 1;
    marsV.copy(MARS).sub(cam.position).multiplyScalar(f).add(cam.position);
    planets.mars.position.copy(marsV); planets.marsAtmo.position.copy(marsV); planets.marsAtmo.material.uniforms.uCenter.value.copy(marsV);
    halo.position.copy(marsV); marsStar.position.copy(marsV);
    const rpx = 6 / marsV.distanceTo(cam.position) * H / 2 / Math.tan(cam.fov * Math.PI / 360); // disc radius, px
    const k = on ? 1 - sstep(rpx, 1.2, 4) : 0;
    for (const m of marsShown) m.visible = on && rpx > 0.9;
    marsStar.visible = k > 0.001; starU.uI.value = 5 * k; starU.uPx.value = 9 * renderer.getPixelRatio();
    return rpx;
  }
  const spaceMeshes = [planets.earth, planets.clouds, planets.moon, planets.mars, planets.earthAtmo, planets.marsAtmo, halo, marsStar];
  const earthSide = [planets.earth, planets.clouds, planets.moon, planets.earthAtmo];

  // ================================================================ layout: scene anchors from the DOM -> scroll positions
  // y = scroll offset into the film track (0 when the track top meets the viewport top). Yt(k, dv) = the y at which the viewport centre
  // sits dv viewports below the centre of scene k's text (so text-bound beats follow the copy wherever Webflow lays it out);
  // Ys(k, a) = the y at which the viewport centre sits at fraction a down scene k's box (for the beats with no copy).
  let LAY = null;
  const rectOf = el => el.getBoundingClientRect();
  function measure() {
    W = Math.max(1, host.clientWidth); H = Math.max(1, host.clientHeight);
    const sr = rectOf(section), vh = H, sc = {};
    for (const k in scenes) {
      if (!scenes[k]) continue;
      const r = rectOf(scenes[k]), te = scenes[k].firstElementChild, tr = te ? rectOf(te) : r;
      sc[k] = { top: r.top - sr.top, h: r.height, tc: (tr.top + tr.bottom) / 2 - sr.top };
    }
    const Yt = (k, dv = 0) => sc[k].tc - vh / 2 + dv * vh, Ys = (k, a) => sc[k].top + a * sc[k].h - vh / 2;
    const yEnd = Math.max(1, sr.height - vh);
    // the film clock S: -1 at the Earth frame, 0 with the title centred, 0.26 SpaceX centred, P_END at the end of the track
    // the pass (0.7 vh), the cruise and the arrival (0.5 vh) share the scroll from the copy centred to the title centred. Under IREF
    // viewports (a short title scene) they scale down: the pass least (it leaves the near still copy frame, so squeezing it steps the
    // speed), then the arrival (it carries the title framing), the cruise most (fast and far out, it takes it smoothly). At the
    // recommended heights nothing moves. flight.js then plays the same move in S faster, not a different one.
    // portrait phones: the Earth copy runs the full width, so the copy frame lands with it in the lower part (EDV viewports under the
    // centre) and the whole Earth above it (flight.portraitLift); the Earth beat's anchors move together
    const EDV = W < 768 && H > W ? -0.12 : 0;
    const IREF = 1.9, Iv = (Yt('title', 0) - Yt('earth', EDV)) / vh, cK = Math.min(1, Iv / IREF), cA = cK ** 0.6;
    const cP = Math.max(0, Math.min(Math.sqrt(cK), (Iv - 0.5 * cA - 0.15 * cK) / 0.7)); // the cruise always keeps 0.15 of the room
    const keys = [
      [Yt('earth', EDV - 0.6), -1.0], [Yt('earth', EDV), -0.9], [Yt('earth', EDV + 0.7 * cP), -0.64], [Yt('title', -0.5 * cA), -0.15], [Yt('title', 0), 0.0], [Yt('reind', 0), 0.26],
      [Ys('colony', 0), 0.62], [Ys('colony', 1), 0.9], [yEnd, P_END]
    ];
    for (let i = 1; i < keys.length; i++) if (keys[i][0] <= keys[i - 1][0] + 1) keys[i][0] = keys[i - 1][0] + 1; // always increasing, whatever the heights
    LAY = { vh, yEnd, S: pmap(keys), sc }; // monotone C1 through the keys: text-anchored beats land exactly, no speed step at any key
    { let lo = keys[0][0], hi = yEnd; for (let i = 0; i < 50; i++) { const m = (lo + hi) / 2; if (LAY.S(m) < SOL_S0) lo = m; else hi = m; } LAY.ySol = (lo + hi) / 2; } // SOL starts where it fades in
    flight.layout({ S: LAY.S, yE: keys[0][0], y1: yEnd, vh }); // the space camera's speed curve is authored in px: place it on this layout
    // the Austin leg: from the scene's first frame on screen (its top at the viewport bottom) to the Earth frame (S = -1),
    // anchored on the H2 (centred, then near the top edge). Kept in order whatever the heights.
    const aK = [sc.austin.top - vh, Yt('austin', 0), Yt('austin', 0.5), keys[0][0]];
    for (let i = aK.length - 2; i >= 0; i--) if (aK[i] >= aK[i + 1] - 1) aK[i] = aK[i + 1] - Math.max(1, 0.25 * vh);
    austin.layout({ yA: aK[0], yT: aK[1], yX: aK[2], yE: aK[3], S: LAY.S });
    aircraft.layout(camAtDist, W / H);
    measureTitle(); measureBeat(); measureEdge(); measureFoot();
  }
  // the section after the film: its background colour (computed style, display sRGB) is what the canvas's lower edge fades into
  function measureEdge() {
    let el = section.nextElementSibling;
    while (el && (el.offsetHeight === 0 || getComputedStyle(el).display === 'none')) el = el.nextElementSibling;
    const rgba = n => { const m = n && getComputedStyle(n).backgroundColor.match(/[\d.]+/g); return m && (m.length < 4 || +m[3] > 0.5) ? m : null; };
    let c = null; for (let n = el, i = 0; n && !c && i < 3; n = n.firstElementChild, i++) c = rgba(n); // a transparent wrapper: try its first child
    for (let n = section.parentElement; n && !c; n = n.parentElement) c = rgba(n);                     // then whatever it sits on
    c = c || [0, 0, 0]; edge.el = el; edge.col[0] = c[0] / 255; edge.col[1] = c[1] / 255; edge.col[2] = c[2] / 255;
  }
  // title: the two [data-split] words flank the planet (transform on the spans). Row layout: the planet sits in the gap between them and
  // the words are pulled in until each inner edge is WORD_GAP disc radii off the disc (never pushed out: a narrow gap takes a smaller
  // disc). Column layout: the words are moved apart or together vertically to the same gap. Phones keep their own stacked framing.
  let tG = null;
  const AIR = () => (W < 768 ? 24 : 40);
  function measureTitle() {
    tG = null;
    const el = scenes.title, Ls = el && el.querySelector('[data-split="left"]'), Rs = el && el.querySelector('[data-split="right"]'); if (!Ls || !Rs) return;
    const h2 = Ls.parentElement; Ls.style.transform = Rs.style.transform = '';
    const tb = rectOf(h2), a = rectOf(Ls), c = rectOf(Rs), rowMode = Math.abs((a.top + a.bottom) / 2 - (c.top + c.bottom) / 2) < a.height * 0.5;
    const wide = W >= 768, rMax = (wide ? MM_R_WIDE : MM_R) * H;
    if (rowMode) {
      const gap = c.left - a.right;
      let r;
      if (wide) {
        r = Math.max(0.05 * H, Math.min(rMax, gap / 2 / (1 + WORD_GAP)));
        const dx = Math.max(0, gap / 2 - r * (1 + WORD_GAP)); // pull each word in by this much
        Ls.style.transform = `translate3d(${dx}px,0,0)`; Rs.style.transform = `translate3d(${-dx}px,0,0)`;
      } else r = Math.max(0.05 * H, Math.min(rMax, (gap / 2 - AIR()) / 1.08));
      tG = { Ls, Rs, h2, x: (a.right + c.left) / 2 - tb.left, y: ((a.top + a.bottom + c.top + c.bottom) / 4) - tb.top, r };
    } else {
      const r = Math.min(rMax, 0.4 * W), clear = wide ? r * (1 + WORD_GAP) : r * 1.08 + AIR(), gap = c.top - a.bottom, dy = wide ? clear - gap / 2 : Math.max(0, clear - gap / 2);
      Ls.style.transform = `translate3d(0,${-dy}px,0)`; Rs.style.transform = `translate3d(0,${dy}px,0)`;
      tG = { Ls, Rs, h2, x: ((a.left + a.right) / 2 + (c.left + c.right) / 2) / 2 - tb.left, y: (a.bottom + c.top) / 2 - tb.top, r };
    }
  }
  // SpaceX hold: the copy sits left, so Mars goes in the free space to its right (centred when there is none)
  let bT = null;
  function measureBeat() {
    bT = null; const p = scenes.reind && scenes.reind.firstElementChild; if (!p) return;
    const rg = document.createRange(); rg.selectNodeContents(p); let right = 0;
    for (const r of rg.getClientRects()) if (r.width > 1) right = Math.max(right, r.right);
    const mr = rectOf(host), free = W - (right - mr.left), r0 = Math.min(0.21 * H, 0.4 * W);
    if (W >= 768 && free > 2.2 * r0) { const r = Math.min(r0, (free / 2 - 24) / 1.08); bT = { x: (right - mr.left) + free / 2, y: H / 2, r }; }
    else { // narrow: above the copy as it sits centred at S 0.26 (1.19 = halo 1.08 x the hold's creep), 4% clear of the top edge.
      // Never under the title disc as it hands over (a shrinking target backs the camera off against its push in: on a short landscape
      // phone the speed went through zero); a short screen takes the room from the gaps (12 px to the copy, the disc kept in frame)
      const ph = rectOf(p).height, air = H < 500 ? 12 : 24, span = H / 2 - ph / 2 - 24 - 0.04 * H, rTi = tG ? tG.r * (1 + HOLD_CREEP * B2[1]) : 0;
      const r = Math.max(0.05 * H, Math.min(r0, 0.16 * H, span / 2.38), Math.min(rTi, (W >= 768 ? 0.2 : 0.16) * H)); // tablets: the larger title disc (MM_R_WIDE) still fits
      bT = { x: W / 2, y: Math.max(1.12 * r, Math.min(0.3 * H, H / 2 - ph / 2 - air - 1.19 * r)), r };
    }
  }

  // ---------- state, per frame ----------
  let ys = 0, ysV = 0, S = -1, s = 0, mode = 'site', lastMode = '', visible = false, snapNext = true, running = false, ext = false, raf = 0, lastT = 0;
  let tEl = 0; // film clock (s): advanced by step(dt) whoever drives it, so grain, shimmer, drift and blinkers run under gsap.ticker too
  let siteInfo = null, siteDist = 0, shadowFrame = 0, forceShadow = true, booted = false, dead = false;
  let over = 0, overV = 0, gS = 0, gL = 0; // launch overrun past the track end (g), its rate; the scroll and launch colony clocks
  let shadowEvery = 1;                        // colony shadow refresh while something casting moves: every Nth frame (governor)
  let overlap = false, seamCol = null;        // the footer canvas is on screen too (stage.js); its seam colour for the lower edge
  const OVERLAP_SHADOW = 3;                   // while overlapping: the launch light's shadow redraws at most every 3rd film frame
  const edge = { k: 0, col: [0, 0, 0], el: null }; // CTA hand-off: how far the next section has risen, its background (display rgb 0..1)
  const shakeV = new THREE.Vector3(), shakeR = new THREE.Vector3(), shakeU = new THREE.Vector3();
  const mouse = { x: 0, y: 0 }, ms = { x: 0, y: 0 };
  // touch screens (coarse primary pointer): the film clock follows the scroll through a short spring (frame()). ?touch=0|1 forces it
  const TOUCH_T = 0.05, tq = new URLSearchParams(location.search).get('touch'), touchMq = matchMedia('(pointer: coarse)');
  const TOUCH = { on: tq ? tq === '1' : touchMq.matches }; let tV = 0;
  const onTouchMq = () => { if (!tq) { TOUCH.on = touchMq.matches; tV = 0; } };
  touchMq.addEventListener?.('change', onTouchMq);
  const onMove = e => { mouse.x = e.clientX / innerWidth - 0.5; mouse.y = e.clientY / innerHeight - 0.5; };
  addEventListener('mousemove', onMove, { passive: true });
  const pos = new THREE.Vector3(), look = new THREE.Vector3(), tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3(), tmp3 = new THREE.Vector3();
  const camUp = new THREE.Vector3(0, 1, 0), mcv = new THREE.Vector3();
  const COLOR_SPACE_SUN = new THREE.Color(0xfff1dc);
  const setClip = (n, f) => { if (cam.near !== n || cam.far !== f) { cam.near = n; cam.far = f; cam.updateProjectionMatrix(); } };
  const siteArg = { g: 0, t: 0 }, acArg = { lam: 0, t: 0, sinE: 1, proj: 1, pr: 1 }, planetArg = { t: 0, intro: 1, camPos: pos, spin: 0, hole: AUSn }, postArg = { dt: 0, t: 0, focus: 0, aperture: 0, maxblur: 0, ca: 0 };
  const moonP = new THREE.Vector3(), dofK = { k: 0, mb: 0 };
  // light rig + shadow box per set
  function rig(inSite) {
    const c = sunLight.shadow.camera;
    sunLight.shadow.normalBias = inSite ? 0.1 : 0.35; // crisper contact shadows under tracks and tyres on the lot
    if (inSite) { c.left = -160; c.right = 160; c.top = 80; c.bottom = -80; c.near = 50; c.far = 900; ambient.intensity = 0.03; }
    else { c.left = -390; c.right = 390; c.near = 60; c.far = 1300; sunLight.color.copy(COLOR_SPACE_SUN); }
    c.updateProjectionMatrix();
  }

  // planet framing: while the title is up Mars sits in the gap between its words; on the SpaceX hold it sits beside the copy.
  // Size = moving the camera along its line to Mars (same lens, look and phase); position = a view offset on the projection.
  let framed = false;
  // quintic ramps (zero speed and acceleration at both ends): on a short title to SpaceX scroll a smoothstep start stepped the camera speed
  const q5 = (x, a, b) => smoother(clamp01((x - a) / (b - a)));
  function frameMars(inSpace, lift) {
    const k1 = inSpace && tG ? q5(S, -0.15, -0.02) * (1 - q5(S, 0.04, 0.12)) : 0;
    const k2 = inSpace && bT ? q5(S, B2[0], B2[1]) * (1 - q5(S, B2[2], B2[3])) : 0;
    const clear = () => { if (lift) { cam.setViewOffset(W, H, 0, lift * H, W, H); framed = true; } else if (framed) { framed = false; cam.clearViewOffset(); } };
    if (k1 <= 0 && k2 <= 0) return clear();
    const th = Math.tan(cam.fov * Math.PI / 360);
    cam.updateMatrixWorld(); mcv.copy(MARS).applyMatrix4(cam.matrixWorldInverse); const d = mcv.length();
    if (mcv.z > -6.2 || d < 6.2) return clear();
    const nx = mcv.x / -mcv.z / (th * cam.aspect), ny = mcv.y / -mcv.z / th, px = W / 2 + nx * W / 2, py = H / 2 - ny * H / 2; // natural screen position of the centre
    let rT = Math.tan(Math.asin(6.05 / d)) / th * H / 2, tx = px, ty = py - lift * H;
    // the planet holds the viewport centre while the title scrolls past it: the words flank it exactly when the title is centred (S = 0)
    const creep = 1 + HOLD_CREEP * S; // the held disc keeps growing slowly (exact title size at S = 0): a steady creep in, never frozen
    if (k1 > 0 && k2 > 0) {
      // the title and SpaceX targets hand over to each other directly. Through a nested blend the natural size leaked in at up to a
      // quarter weight: on a tall lens (narrow) or under the larger title disc (wide) that is smaller than both targets, so the disc dipped
      const kk = Math.min(1, k1 + k2), w2 = k2 / (k1 + k2), tb = rectOf(tG.h2), mr = rectOf(host);
      rT = lerp(rT, lerp(tG.r, bT.r, w2) * creep, kk); tx = lerp(tx, lerp(tb.left - mr.left + tG.x, bT.x, w2), kk); ty = lerp(ty, lerp(H / 2, bT.y, w2), kk);
    } else {
      // narrow: as the hold lets go onto the entry, the disc never drops under its held size (the natural size there can be a little
      // smaller on a tall lens; by the end of the ramp it is far larger, so nothing steps)
      if (W < 992 && k2 > 0 && S > B2[2]) { const h = bT.r * creep, d = rT - h; rT = 0.5 * (rT + h + Math.sqrt(d * d + 0.01 * h * h * k2)); } // smooth max, sharpening to a plain max as the ramp ends (natural is far larger there)
      if (k1 > 0) { const tb = rectOf(tG.h2), mr = rectOf(host); rT = lerp(rT, tG.r * creep, k1); tx = lerp(tx, tb.left - mr.left + tG.x, k1); ty = lerp(ty, H / 2, k1); }
      if (k2 > 0) { rT = lerp(rT, bT.r * creep, k2); tx = lerp(tx, bT.x, k2); ty = lerp(ty, bT.y, k2); }
    }
    { // always rescale (f is 1 where the natural size already matches): a size threshold here made a one-px jump in the hold
      const f = Math.max(6.6 / d, 6.05 / Math.sin(Math.atan(rT * 2 * th / H)) / d);
      pos.sub(MARS).multiplyScalar(f).add(MARS); cam.position.sub(MARS).multiplyScalar(f).add(MARS); cam.updateMatrixWorld();
    }
    cam.setViewOffset(W, H, -(tx - px), -(ty - py), W, H); framed = true;
  }
  // entry: e runs 0..1 over S 0.40..0.60 (the swap to Jezero is at e 0.30 = CA); planets.entry draws the heat glow and the haze
  const entryCtx = { inCol: false, cam, t: 0, dt: 0, alt: 0, fog: scene.fog, e: 0 };
  function entryFrame(inCol, t, dt) {
    const e = clamp01((S - E0) / (E1 - E0));
    entryCtx.inCol = inCol; entryCtx.sunDir = colonyW.sun; entryCtx.night = colonyW.night; entryCtx.t = t; entryCtx.dt = dt; entryCtx.e = e; entryCtx.fog = scene.fog;
    entryCtx.alt = inCol ? cam.position.y - COL.y : cam.position.distanceTo(MARS);
    planets.entry(e, entryCtx);
  }
  // lens grade from the story clocks, then the rockets' own suggestions on top while the colony is up
  const plumeUV = [0, 0], lensArg = { entry: -1, gR: -1, plume: null };
  function lensCine(inCol) {
    const r = inCol && colonyW.api && colonyW.api.rockets, L = r && r.launch, gR = inCol ? gL : -1;
    lensArg.entry = S > E0 && S < E1 ? (S - E0) / (E1 - E0) : -1; lensArg.gR = gR; lensArg.plume = null;
    if (L && L.base && gR >= 0.78) { tmp3.copy(L.base).project(cam); if (tmp3.z < 1) { plumeUV[0] = tmp3.x * 0.5 + 0.5; plumeUV[1] = tmp3.y * 0.5 + 0.5; lensArg.plume = plumeUV; } }
    post.lensFrame(lensArg);
    const fx = L && L.fx, P = post.fx;
    if (fx && P) { if (fx.flash > P.flash) P.flash = fx.flash; if (fx.heat > P.heat) P.heat = fx.heat; if (fx.bloom > P.bloom) P.bloom = fx.bloom; }
  }

  // ---------- SOL readout: data-sol-from -> data-sol-to (1 -> 206), linear in scroll from its fade in to the last px of the track ----------
  // out through the atmospheric entry; past the end it fades as the track scrolls away. The page script draws the bar from the number.
  let solTxt = '', solOp = '';
  const solFrom = sol && sol.root ? +sol.root.dataset.solFrom || 1 : 1, solTo = sol && sol.root ? +sol.root.dataset.solTo || 206 : 206;
  function solFrame() {
    if (!sol || !sol.root) return;
    const entry = sstep(S, 0.40, 0.43) * (1 - sstep(S, 0.57, 0.61)), past = sstep(ys, LAY.yEnd, LAY.yEnd + 0.25 * LAY.vh);
    const op = sstep(S, SOL_S0, 0.06) * (1 - entry) * (1 - past);
    const o = op.toFixed(3); if (o !== solOp) { solOp = o; sol.root.style.opacity = o; sol.root.style.visibility = op > 0.005 ? '' : 'hidden'; }
    const k = clamp01((ys - LAY.ySol) / Math.max(1, LAY.yEnd - 1 - LAY.ySol)); // scroll, not S (S runs at a different rate in every beat); the end within 1 px (scroll px are whole, the track end is not)
    const v = String(solFrom + Math.floor((solTo - solFrom) * k + 1e-6)).padStart(4, '0'); // floor: the last value only on the last px
    if (v !== solTxt && sol.value) { solTxt = v; sol.value.textContent = v; }
  }

  // ================================================================ the frame
  let lastEvt = -1, lastBeat = '';
  const evtDetail = { p: 0, beat: '' }, filmEvt = new CustomEvent('tf:film', { detail: evtDetail }); // one event, re-dispatched: no per-frame garbage
  const beatOf = () => (S < -0.55 ? (s < 1 ? 'austin' : 'earth') : S < 0.12 ? 'mars-title' : S < 0.42 ? 'reindustrialize' : S < 0.88 ? 'colony' : 'launch');
  function frame(dt) {
    if (!LAY) measure();
    const t = tEl;
    const yT = -rectOf(section).top;                       // target scroll position in the track
    // a jump of more than 2 viewports (anchor link, scroll rail, resize) is a cut: land on it and drop every velocity history
    if (snapNext || Math.abs(yT - ys) > 2 * LAY.vh) { ys = yT; ysV = 0; tV = 0; snapNext = false; cut(); }
    else {
      const y0 = ys;
      if (TOUCH.on) {
        // touch: Lenis leaves touch scrolling native (syncTouch off), and a phone's scroll position reaches the page unevenly (momentum,
        // a busy main thread). A short critically damped follow (settles in ~0.12 s) evens it out; at rest it lands exactly on the scroll
        const w = 2 / TOUCH_T, x = w * dt, e = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x), c = ys - yT, tv = (tV + w * c) * dt;
        tV = (tV - w * tv) * e; ys = yT + (c + tv) * e;
        if (Math.abs(ys - yT) < 0.5 && Math.abs(tV) < 20) { ys = yT; tV = 0; }
      }
      else if (window.lenis) ys = yT;                      // Lenis already smooths the page: the picture is locked to the copy
      else ys += (yT - ys) * (1 - Math.exp(-dt / 0.05));    // no Lenis: one light pole (tau 50 ms) takes the edge off wheel notches
      ysV = dt > 0 ? (ys - y0) / dt : 0;                   // film scroll speed, px/s (state.v, for QA)
    }
    ms.x += (mouse.x - ms.x) * dt * 2; ms.y += (mouse.y - ms.y) * dt * 2;
    austin.at(ys, AC); s = AC.s; S = Math.min(P_END, Math.max(-1, LAY.S(ys)));
    if (s < 1) S = -1;
    const introOn = s < 1, lam = AC.lam;
    mode = introOn ? AC.world : (S >= CA ? 'colony' : 'space');
    // the launch clock: scroll until the track ends, then real time while the CTA rises over the canvas (never mid-track: the
    // overrun only counts once the scroll clock is in its last stretch, so scrolling back up rewinds it with the scroll)
    { const atEnd = ys >= LAY.yEnd - 2, tgt = atEnd ? OVER_RATE : over > 0 ? -2.5 * OVER_RATE : 0;
      overV += (tgt - overV) * (1 - Math.exp(-dt / OVER_TAU)); over = Math.min(OVER_MAX, Math.max(0, over + overV * dt)); if (over <= 0 && overV < 0) overV = 0;
      gS = gOf(S); gL = gS + over * sstep(gS, 0.95, 1); }
    // the next section rising over the canvas: 0 until the last 0.3 viewport of the track, 1 by the time its top edge shows
    edge.k = sstep(ys - LAY.yEnd, -0.3 * LAY.vh, 0);
    // lazy world loads: Moon as the pull begins. Mars maps, Jezero maps and the colony build start at boot idle (bootIdle);
    // these calls are only fallbacks (all idempotent), and ensure() only does work if the idle build has not finished by the swap
    if (s > 0.6) planets.loadDeferred('moon');
    if (S > -0.9) planets.loadDeferred('mars');
    if (mode === 'colony') colonyW.ensure(); else if (S > 0.3) scheduleColony();
    const inCol = mode === 'colony', inSite = mode === 'site';
    const live = introOn ? 0 : sstep(S, -1.0, -0.92); // mouse drift + handheld fade in once the pull out lands
    let fov = 46, focus = 30;
    camUp.set(0, 1, 0);
    if (inSite) {
      // the lot: one continuous drift up and back (austin.js), tilting to straight down and north-up by the world swap
      const dist = AC.dist, md = 1 - AC.upk;
      tmp.copy(AC.pos); tmp.x += ms.x * 3 * md; tmp.z += ms.y * 2 * md; // mouse drift, gone once straight down
      pos.copy(tmp).add(SITE0); look.copy(AC.look).add(SITE0); camUp.copy(AC.up);
      fov = AC.fov; focus = dist; siteDist = dist;
      setClip(Math.max(0.3, dist * 0.004), dist * 8 + 3000);
      siteArg.g = AC.g; siteArg.hour = AC.hour; siteArg.t = t; siteInfo = site.update(siteArg);
      { const pr = renderer.getPixelRatio(); acArg.lam = lam; acArg.t = t; acArg.sinE = siteInfo.sinE; acArg.pr = pr; acArg.proj = H * pr / (2 * Math.tan(THREE.MathUtils.degToRad(fov) / 2)); aircraft.update(acArg); }
      site.follow(tmp, dist); scene.fog.near = 1e8; scene.fog.far = 1e9;
      hemi.intensity *= 1 - sstep(lam, Math.log(3e3), Math.log(60e3)); // moonlight on the photos dies away so the ground meets the black night side of the globe
      // long-exposure trails only after dark (work lights, street traffic); by day the machines read clean
      const nt = siteInfo.night; post.trails.enabled = HIGH && trailsOK && nt > 0.02; post.trails.amount = 0.65 * nt;
    } else if (mode === 'globe') {
      // straight up off Austin, swinging round onto the Earth frame (C0) with spaceCam's speed (austin.js)
      pos.copy(AC.pos); look.copy(AC.look); fov = AC.fov; focus = AC.dist * U_PER_M;
      setClip(Math.min(0.1, Math.max(0.0005, focus * 0.04)), 9000);
    } else if (inCol) {
      fov = colCam(S, pos, look, gL); pos.x += ms.x * 8 * live; pos.y -= ms.y * 5 * live; focus = pos.distanceTo(look);
      // launch: focus rides the ship once it climbs (the aim point is in empty sky), and the camera takes the ignition: a shake that
      // decays as the ship climbs away (two octaves on the film clock, scaled by distance so it reads the same at any lens)
      const L = colonyW.api && colonyW.api.rockets && colonyW.api.rockets.launch;
      if (L && L.burn > 0.004) {
        focus = lerp(focus, pos.distanceTo(L.pos), sstep(gL, LIFT_G, LIFT_G + 0.03));
        const A = L.shake * pos.distanceTo(look) * 0.0022;
        if (A > 1e-4) { shakeV.copy(look).sub(pos).normalize(); shakeR.crossVectors(shakeV, camUp).normalize(); shakeU.crossVectors(shakeR, shakeV);
          const a = Math.sin(t * 31) * 0.6 + Math.sin(t * 57 + 1.7) * 0.4, b = Math.sin(t * 37 + 0.6) * 0.6 + Math.sin(t * 71 + 2.9) * 0.4;
          look.addScaledVector(shakeR, a * A).addScaledVector(shakeU, b * A); }
      }
      // near plane rides the camera height: at 0.1 the depth buffer had ~10 cm steps at 400 m, so hab floors, gardens and pads z-fought
      setClip(THREE.MathUtils.clamp((pos.y - COL.y) * 0.08, 0.1, 30), 9000);
    } else {
      fov = spaceCam(S, pos, look, camUp); // position, aim, up and lens on the film clock (flight.js)
      // portrait: open the lens, ramped in off the hand-off (Austin lands at 38): the whole Earth on the copy frame, Mars on taller (flight.js)
      fov = portraitFov(S, fov, cam.aspect);
      focus = lerp(pos.distanceTo(AUS), pos.distanceTo(look), sstep(S, -1, -0.92)); // from the globe leg's focus (the city) onto the aim point
      setClip(0.1, 12000); // far enough for Mars down its sight line (marsFar)
    }
    if (!inSite) post.trails.enabled = false;
    // camera motion blur opens up through the fast part of the rise
    { const swell = introOn ? sstep(lam, Math.log(450), Math.log(3600)) * (1 - sstep(lam, 14, 15.9)) : 0; post.motion.shutter = 0.6 + 2.4 * swell; post.motion.maxLen = 0.035 + 0.11 * swell; }
    // exposure: on the Austin beat a fixed curve of sun elevation and altitude (austin.js), written straight into the exposure state
    // every frame (no metering, no adaptation: no pumping while scrubbing, no drift when the scroll stops). Auto exposure from S = -1.
    post.auto.enabled = !introOn;
    if (introOn) { renderer.toneMappingExposure = exposureAt(sunAt(AC.hour, sunO).sinE, lam); post.snapExposure(); }
    else { renderer.toneMappingExposure = 1.05; post.auto.min = 0.55; }
    // per-set switches: what is in the world, which light rig, shadow box
    if (mode !== lastMode) {
      site.group.visible = inSite; colonyGroup.visible = inCol;
      const sp = !inSite && !inCol; spaceMeshes.forEach(m => (m.visible = sp));
      rig(inSite);
      post.motion.cutDist = mode === 'site' || mode === 'globe' ? 1e12 : 400;
      post.ao.enabled = inSite && HIGH; // contact shadows, only on the job site (trails are set per frame above)
      if ((lastMode === 'site' && mode === 'globe') || lastMode === '') post.resetMotion();
      lastMode = mode; forceShadow = true; // never show a shadow map left over from another set
      // the shadow pass runs before render() sets up this frame's lights, and depth program keys hold the light counts:
      // set them now from the new set's lights, or the first shadow frame compiles depth programs keyed on the old set's
      renderer.compile(NOOP, cam, scene);
    }
    if (mode === 'space') { const near = S > -0.12; for (const m of earthSide) m.visible = !near; } // Earth is behind us once Mars is ahead
    const sunDir = inCol ? colonyW.sun : toSun;
    const built = inCol && colonyW.api.build(gS, t, gL);
    if (inCol) endSun(S);
    if (inCol) { const r = colonyW.api.rockets; if (r && r.setKeep && r.keep !== partKeep) { r.keep = partKeep; r.setKeep(partKeep); } } // late rockets take the governor's particle share
    if (mode !== 'site' && mode !== 'globe') entryFrame(inCol, t, dt);
    if (!inCol && !inSite) { scene.fog.near = 1e8; scene.fog.far = 1e9; sunLight.intensity = 2.4; ambient.intensity = 0.35; hemi.intensity = 0; }
    // shadow policy (autoUpdate is off). Site: machines move every frame, so redraw while the sun is up and the lot is close enough.
    // Colony: the build state and sun only change with g; between changes only the crane jibs move, so every 3rd frame is enough.
    shadowFrame++;
    if (inSite) { if (forceShadow || (sunLight.intensity > 0.01 && (siteDist < 2500 || shadowFrame % 10 === 0))) { renderer.shadowMap.needsUpdate = true; forceShadow = false; } }
    else if (inCol) {
      // overlapping the footer (the launch past the track end, mostly under the fade): the plume light moves every frame, so its
      // shadow would redraw every frame. A few frames' lag is invisible there; a forced redraw (new set, new size) still goes now.
      const every = overlap ? Math.max(shadowEvery, OVERLAP_SHADOW) : shadowEvery;
      if (forceShadow || ((built || cranesUp()) && shadowFrame % every === 0) || (!overlap && built)) { renderer.shadowMap.needsUpdate = true; forceShadow = false; }
    }
    else { sunLight.target.position.set(0, 0, 0); sunLight.position.copy(sunDir).multiplyScalar(100); }
    // operator layer: only a faint handheld drift
    const dist = pos.distanceTo(look);
    if (!introOn) {
      tmp.set(Math.sin(t * 0.21) * 0.6 + Math.sin(t * 0.53 + 1.3) * 0.25, Math.sin(t * 0.17 + 2.1) * 0.5 + Math.sin(t * 0.41) * 0.2, Math.sin(t * 0.13 + 4) * 0.4).multiplyScalar(dist * 0.002 * live);
      // space: mouse drift too, trimmed by flight.js (none at the skim, and in the move's plane where it only pitches)
      if (mode === 'space') { tmp.x += ms.x * 2.2 * live; tmp.y -= ms.y * 1.4 * live; flight.drift(S, pos, tmp); }
      pos.add(tmp);
    }
    cam.up.copy(camUp);
    if (Math.abs(cam.fov - fov) > 0.0005) { cam.fov = fov; cam.updateProjectionMatrix(); } // fine enough that slow zooms never step
    cam.position.copy(pos); cam.lookAt(look);
    if (inCol && endK(S, END_S) > 0) { endCam(S, fov); focus = lerp(focus, pos.distanceTo(shipAt(gL, tmp2)), endK(S, END_S)); } // the hand-off move onto the footer's camera (owns the lens shift); focus on the ship from there
    else frameMars(mode === 'space', mode === 'globe' || mode === 'site' ? 0 : portraitLift(S, cam.aspect)); // portrait lens shift (flight.js), Mars framing on top
    if (!inSite && !inCol) placeMars(S, mode === 'space'); // behind Earth through the globe leg anyway: hidden there
    // Earth: parked on Austin through the pull out, then it turns a little as we leave it; the Moon orbits with the scroll (flight.js)
    planetArg.t = t; planetArg.spin = SPIN_LAND - t * EARTH_SPIN + (introOn ? 0 : (S + 1) * 0.5); planets.update(planetArg);
    if ((mode === 'space' || mode === 'globe') && S < -0.12) planets.moon.position.copy(flight.moonAt(S, moonP));
    if (mode === 'space') litMars(t, S);
    planets.mars.material.uniforms.uDomes.value = 1 - sstep(pos.distanceTo(MARS), 14, 30); // the night-side dome lights are sub-pixel from far out and read as specks
    if (sky) { sky.update(pos); sky.group.visible = !inCol && !inSite; }
    // sun: off on the ground, cresting the limb as the pull out lands
    const f2 = mode === 'globe' ? clamp01((lam - LAMH) / (LAM1 - LAMH)) : 1;
    sunCore.visible = !inSite;
    sunCore.position.copy(pos).addScaledVector(sunDir, 1600);
    const facing = Math.max(0, tmp.copy(look).sub(pos).normalize().dot(sunDir));
    const flare = sstep(f2, 0.55, 1) * (0.25 + facing * 0.9) * (inCol ? 0.22 * (1 - sstep(colonyW.sun.y, 0.02, -0.04)) : 0); // the Mars key light is behind the lens: no sun in frame there
    sunCore.scale.setScalar(260 * flare + 40); sunCore.material.opacity = Math.min(1, flare * 1.3);
    bloom.strength = 0.6 + flare * 0.3;
    // focus: deep on the lot and the globe, opening over the first beat of space, shallower only very close to a subject (under 4
    // units: the skim's horizon is ~5 out and stays deep, so Earth never reads as a miniature), onto the colony's
    // lens by the swap. All ramps (in S and focus distance), so nothing steps. kA = aperture x focus (the blur depth scale).
    { const near = 1 - sstep(focus, 2, 4), w = introOn ? 0 : sstep(S, -1, -0.92), wc = inCol ? 1 : sstep(S, E0, CA);
      const deep = inCol ? sstep(gL, LIFT_G - 0.01, LIFT_G + 0.03) : 0; // the launch is shot deep: the ship and the city both read
      const kA = lerp(lerp(0.0004, 0.003 + 0.017 * near, w), lerp(0.006, 0.0022, deep), wc), mb = lerp(lerp(0.0008, 0.0018 + 0.0032 * near, w), lerp(0.0042, 0.0024, deep), wc);
      postArg.dt = dt; postArg.t = t; postArg.focus = focus; postArg.aperture = kA / focus; postArg.maxblur = HIGH ? mb : 0; postArg.ca = 0.012; dofK.k = kA; dofK.mb = mb; }
    lensCine(inCol);
    // the Austin H2 sits over the lot: a soft burn behind it while it is on screen (read from its box, nothing added to the DOM)
    if (inSite && scenes.austin && scenes.austin.firstElementChild) {
      const r = rectOf(scenes.austin.firstElementChild), mr = rectOf(host), on = r.bottom > mr.top && r.top < mr.bottom;
      post.scrim(((r.left + r.right) / 2 - mr.left) / W, 1 - ((r.top + r.bottom) / 2 - mr.top) / H, 0.66 * r.width / W + 0.05, 0.8 * r.height / H + 0.07, on ? 0.45 * (1 - AC.upk) : 0);
    } else post.scrim(0.5, 0.5, 1, 1, 0);
    applyTune();
    // the CTA rises out of the launch glow: the lower edge fades into the footer scene's seam colour (stage.js) when there is one,
    // else into the next section's background. The warm haze above the fade carries the smoke across the seam.
    // landing on the footer's camera, the film ends on the sky above the footer's frame: no warm haze there, the two skies meet, and the
    // fade only has to melt night sky into night sky: a shorter band keeps the ship clear of it on phones
    const eK = inCol ? endK(S, END_S) : 0;
    post.edge(edge.k, seamCol || edge.col, lerp(Math.max(0.3, 160 / H), Math.max(0.15, 120 / H), eK), inCol ? (seamCol ? 0.42 : 0.3) * edge.k * sstep(gL, LIFT_G, LIFT_G + 0.05) * (1 - eK) : 0);
    post.update(postArg);
    solFrame();
    post.render();
    // progress event, only when it moves
    const p = clamp01(ys / LAY.yEnd), q = Math.round(p * 1e4), beat = beatOf();
    if (q !== lastEvt || beat !== lastBeat) { lastEvt = q; lastBeat = beat; evtDetail.p = p; evtDetail.beat = beat; window.dispatchEvent(filmEvt); }
  }

  // ================================================================ lazy colony build + warm-up
  const ric = window.requestIdleCallback ? (f, timeout = 700) => requestIdleCallback(f, { timeout }) : f => setTimeout(f, 120);
  const BUILD_WAIT = 300; // ms an idle build slot may wait on a busy main thread before it runs anyway, so the build always lands well before the swap
  let colonyIdle = false;
  // from boot: one small chunk per idle slot that has room for it (or once the slot times out, so it always finishes), then the
  // colony's programs compile off-screen. No scroll-speed gate: the colony is minutes of scroll away, a chunk now beats a build at the swap.
  function scheduleColony() {
    if (colonyIdle || colonyW.done) return; colonyIdle = true;
    const tick = dl => {
      if (dead) return;
      if (dl && !dl.didTimeout && dl.timeRemaining && dl.timeRemaining() < 8) return ric(tick, BUILD_WAIT); // slot too short for a chunk: wait for a roomier one
      if (!colonyW.step()) ric(tick, BUILD_WAIT); else ric(warmColony, BUILD_WAIT);
    };
    ric(tick, BUILD_WAIT);
  }
  // boot idle: start every download the later beats need (decoded + uploaded on arrival), then the colony build
  function bootIdle() { if (dead) return; planets.loadDeferred('mars'); colonyW.loadMaps(); scheduleColony(); }
  const rtWarm = new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType }); // the scene pass also draws into a half-float target, so program keys match
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const PARALLEL = renderer.extensions.has('KHR_parallel_shader_compile'), NOOP = new THREE.Object3D();
  const compileIn = root => PARALLEL ? renderer.compileAsync(root, cam, scene) : (renderer.compile(root, cam, scene), Promise.resolve());
  const spaceRoots = () => [...spaceMeshes, sunCore, ...(sky ? [sky.group] : []), ...planets.entryRoots()];
  // run fn with exactly one world shown, as the loop shows it in that mode. Only site.group holds lights, so its visibility sets the light count in the program keys.
  function inWorld(w, fn) {
    const roots = [site.group, colonyGroup, ...spaceRoots()], vis = roots.map(o => o.visible), rt = renderer.getRenderTarget();
    site.group.visible = w === 'site'; colonyGroup.visible = w === 'colony'; for (const o of spaceRoots()) o.visible = w === 'space';
    renderer.setRenderTarget(rtWarm);
    try { return fn(); } finally {
      roots.forEach((o, i) => (o.visible = vis[i])); renderer.setRenderTarget(rt);
      renderer.compile(NOOP, cam, scene); // light state back to the live set: a warm-up must not leave its world's light counts for the next shadow pass
    }
  }
  // one draw of a world into the 4x4 target with every object in it shown and nothing culled
  function throwaway(w) {
    const touched = [], prevMode = lastMode;
    inWorld(w, () => {
      if (w === 'colony') colonyW.api.build(0, 0); // first, so the forced visibility below is what draws (build(0) hides unbuilt domes, ships, life)
      for (const r of w === 'site' ? [site.group] : w === 'colony' ? [colonyGroup, ...planets.entryRoots()] : spaceRoots())
        r.traverse(o => { touched.push([o, o.visible, o.frustumCulled]); o.visible = true; o.frustumCulled = false; });
      try {
        rig(w === 'site');
        // render() draws the shadow map before it sets up this frame's lights, and depth program keys include the light counts: set them first
        renderer.compile(NOOP, cam, scene);
        renderer.shadowMap.needsUpdate = w !== 'space'; // nothing casts in space
        renderer.render(scene, cam);
      } finally { for (const [o, v, f] of touched) { o.visible = v; o.frustumCulled = f; } }
    });
    if (prevMode) rig(prevMode === 'site'); // put the visible set's light rig back; lastMode is kept, so its TAA history and motion state survive
    forceShadow = true; // the loop redraws its own shadow map on its next frame
  }
  async function precompile() {
    const jobs = [];
    await skyP;
    inWorld('site', () => jobs.push(compileIn(site.group)));
    inWorld('space', () => { for (const o of spaceRoots()) jobs.push(compileIn(o)); });
    await Promise.race([Promise.all(jobs), wait(1500)]);
    throwaway('site'); throwaway('space');
    post.warm({ fx: HIGH }); // AO + trails only ever run on the high tier (and only on the lot)
  }
  async function warmColony() {
    if (dead) return;
    let job; inWorld('colony', () => {
      // build(0) hides most of the city, the ships and the life; queue every program with everything shown
      colonyW.api.build(0, 0); const vis = []; for (const r of [colonyGroup, ...planets.entryRoots()]) r.traverse(o => { vis.push([o, o.visible]); o.visible = true; });
      try { job = Promise.all([compileIn(colonyGroup), ...planets.entryRoots().map(compileIn)]); } finally { for (const [o, v] of vis) o.visible = v; }
    });
    await Promise.race([job, wait(1500)]);
    await new Promise(r => ric(r, BUILD_WAIT)); // the throwaway draw (shadow + depth programs, first uploads) also waits for an idle slot
    if (!dead && lastMode !== 'colony') throwaway('colony');
  }

  // ================================================================ lifecycle
  const readyP = Promise.all([planets.ready, site.ready, skyP]).then(() => precompile()).then(() => { booted = true; ric(bootIdle); });
  let ro = null;
  function resize() {
    W = Math.max(1, host.clientWidth); H = Math.max(1, host.clientHeight);
    renderer.setSize(W, H, false); post.setSize(W, H); cam.aspect = W / H; cam.updateProjectionMatrix();
    LAY = null; if (framed) { framed = false; cam.clearViewOffset(); }
    gov.reset();
  }
  ro = new ResizeObserver(() => { resize(); }); ro.observe(host); ro.observe(section); if (footEl) ro.observe(footEl); // the footer's size sets the end lens
  document.fonts?.ready.then(() => { LAY = null; });
  const relayout = () => { LAY = null; };
  addEventListener('load', relayout);
  function step(dt) {
    if (!running || !booted || dead) return;
    dt = Math.max(0, dt || 0); if (!freeze) tEl += Math.min(dt, 1 / 15); // a long stall (tab switch, GC) never jumps the clock
    gov.frame(dt * 1000 / (overlap ? 2 : 1)); // overlapping, the film draws every other vsync by design: judge it on its share
    frame(Math.min(0.05, dt));
  }
  let drive = null; // start(false, fn): the own rAF loop calls fn() (the mount's tick) instead of step(dt)
  const loop = now => { raf = requestAnimationFrame(loop); if (drive) { drive(); return; } const dt = lastT ? (now - lastT) / 1000 : 1 / 60; lastT = now; step(dt); };
  const api = {
    ready: readyP, canvas, renderer, post, scene, cam, aircraft, flight, perf: gov,
    // start(true): the page drives frames through step(dt) (gsap.ticker); otherwise the film runs its own rAF loop
    start(external = false, fn = null) { if (running) return; running = true; ext = external; drive = fn; snapNext = true; lastT = 0; if (!external) raf = requestAnimationFrame(loop); }, // the clock resumes where it stopped
    stop() { running = false; if (raf) { cancelAnimationFrame(raf); raf = 0; } },
    step, resize, relayout,
    // overlap: the footer canvas is on screen as well (frames alternate): the governor may not step up, the launch shadow refreshes less
    setOverlap(on) { overlap = !!on; },
    // seam: display rgb (0..1) the lower edge fades into, from the footer scene; null falls back to the next section's background
    setSeam(c) { seamCol = c && c.length >= 3 ? c : null; },
    snap() { snapNext = true; },
    tune, look: LOOK, // the live look object and its shipped defaults (look.json.js)
    get freeze() { return freeze; }, set freeze(v) { freeze = !!v; },
    // track px for a film clock value v: -2..-1 runs the Austin leg (first frame to the Earth frame), -1..P_END is S (dial scrub)
    yOfClock(v) { if (!LAY) measure(); const k = austin.k; return v <= -1 ? lerp(k.yA, k.yE, clamp01(v + 2)) : this.yOf(Math.min(v, P_END)); },
    setClock(v) { tEl = v; }, // QA: set the film clock (grain, machines, strobes) for repeatable frames
    yOf(St) { if (!LAY) measure(); let lo = 0, hi = LAY.yEnd; for (let i = 0; i < 50; i++) { const m = (lo + hi) / 2; if (LAY.S(m) < St) lo = m; else hi = m; } return (lo + hi) / 2; }, // QA: track px where the film clock reaches St
    get state() { return { y: ys, v: ysV, t: tEl, s, S, mode, beat: beatOf(), colonyDone: colonyW.done, programs: renderer.info.programs.length, layout: LAY && { yEnd: LAY.yEnd, vh: LAY.vh }, touch: TOUCH.on, yT: LAY ? -rectOf(section).top : 0,
      dof: { k: dofK.k, maxblur: dofK.mb, focus: postArg.focus }, g: +gS.toFixed(4), gL: +gL.toFixed(4), over: +over.toFixed(4), edge: +edge.k.toFixed(3), end: +endK(S, END_S).toFixed(4), overlap, seam: seamCol && seamCol.map(v => +v.toFixed(3)), perf: { level: gov.level, ceil: gov.ceil, p90: gov.state.p90, steps: gov.state.steps, pr: renderer.getPixelRatio(), post: post.getQuality(), shadow: sunLight.shadow.mapSize.x, every: shadowEvery, keep: partKeep }, mars: { star: marsStar.visible ? +starU.uI.value.toFixed(3) : 0, disc: planets.mars.visible },
      site: s < 1 ? { hour: +AC.hour.toFixed(2), g: +AC.g.toFixed(3), dist: Math.round(AC.dist), world: AC.world, exp: +renderer.toneMappingExposure.toFixed(3) } : null }; },
    dispose() {
      dead = true; this.stop(); ro && ro.disconnect(); removeEventListener('mousemove', onMove); touchMq.removeEventListener?.('change', onTouchMq); removeEventListener('load', relayout);
      for (const k of ['Ls', 'Rs']) if (tG && tG[k]) tG[k].style.transform = '';
      aircraft.dispose();
      scene.traverse(o => { if (o.geometry) o.geometry.dispose(); });
      renderer.dispose(); canvas.remove();
    }
  };
  return api;
}
