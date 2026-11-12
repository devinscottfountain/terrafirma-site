// flight.js: the space camera, one move from the Earth frame (S = -1) to the entry swap (CA), and the bodies it passes.
// Pure math on THREE (no DOM), so node can test it as shipped. film.js owns rendering; austin.js lands on C0 with this
// camera's velocity, aim and aim rate at S = -1.
//
// createFlight({ THREE }) -> { toSun, EARTH, MARS, C0, L0, P1, H2, EN1, ENP, LCA, CA, E0, E1, MOON_R, layout(L), spaceCam(S, pos, look, up),
//                              moonAt(S, out), marsFar(S) }
//   layout({ S, yE, y1 })   S = scroll -> film clock map, yE its S = -1 px, y1 any px past CA. Places the speed curve (authored in
//                           units per px) on this layout, so every layout hands off and lands at the same px speeds. Call it first.
//   spaceCam(S, pos, look, up) fills position, look point and up vector (up optional), returns the fov (deg)
//   moonAt(S, out)          Moon centre, a pure function of S
//   marsFar(S)              apparent distance factor for Mars (>= 1): far off it renders further down its own sight line, so it
//                           rises as a star and grows into the disc (same screen position, only the size changes)
import { herm, smoother, clamp01 } from './util.js';

export const CA = 0.46, E0 = 0.40, E1 = 0.60;

export function createFlight({ THREE }) {
  const v3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const toSun = v3(-1, 0.22, -0.55).normalize(), EARTH = v3(0, 0, 0);
  const upP = v3(0, 1, 0).addScaledVector(toSun, -toSun.y).normalize();
  const C0 = EARTH.clone().addScaledVector(toSun, -23).addScaledVector(upP, 10.4);   // Earth's night side, sun about to crest the limb
  const L0 = C0.clone().addScaledVector(toSun, 60).addScaledVector(upP, -9);
  // hand-off velocity, units per px of scroll: Austin's sideways swing (unchanged) plus 0.020 outward from the lot, the most the
  // Austin landing takes without a speed bump. Outward, so the distance to the lot never dips and no correction term is needed.
  const V0 = v3(1.06681e-2, 2.61300e-3, 2.18856e-2), T0 = V0.clone().normalize(), V0PX = V0.length();
  // the copy frame ("After solving earthmoving"): the pull out settles here, whole Earth centred, sun just behind the top limb
  const P1 = v3(25.216, 6.526, 17.498);
  // Mars sits just behind Earth's upper left limb as seen from P1, ~570 units out. Only its position moved from the prototype:
  // the title and SpaceX frames below are the same offsets from it, so they frame the planet (and the stars) exactly as before.
  const MARS = v3(-533.698, -61.117, -189.964), M = (x, y, z) => v3(x, y, z).add(MARS);
  // entry line: straight from the SpaceX hold (H2) to the swap, skimming the top of the air (0.65 above the surface, aim 14.6 deg
  // under the local horizontal). The line's plane holds Mars's centre, so the horizon stays level all the way down with up = EN1.
  // The plane is turned TILT about the hold's sight line so the entry point sits near 30 N (a vertical plane would put it over the
  // polar cap); the up vector settles from world up onto it across the SpaceX hold (UP0..UP1), long before the entry.
  const H2 = M(21, 6, 36), h = H2.clone().sub(MARS), hl = h.length(); h.normalize();
  const PITCH = Math.atan2(2.6, 10), sP = Math.sin(PITCH), TILT = 1.05;
  const nUp = v3(0, 1, 0).addScaledVector(h, -h.y).normalize(), nT = h.clone().cross(nUp);
  const nP = nUp.clone().multiplyScalar(Math.cos(TILT)).addScaledVector(nT, Math.sin(TILT));
  const EN1 = v3(), ENP = v3(), LCA = v3();
  { // solve h . EN1 = x so the line through ENP at the entry pitch passes H2 (bisection, once)
    const g = x => { EN1.copy(h).multiplyScalar(x).addScaledVector(nP, Math.sqrt(1 - x * x)); LCA.copy(h).multiplyScalar(hl).addScaledVector(EN1, -6.65); return LCA.dot(EN1) / LCA.length() - sP; };
    let lo = 0.05, hi = 0.95; for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (g(m) < 0) lo = m; else hi = m; } g((lo + hi) / 2);
    LCA.normalize().negate(); ENP.copy(MARS).addScaledVector(EN1, 6.65);
  }
  const UP0 = 0.12, UP1 = 0.34;
  const LINE = H2.distanceTo(ENP), EP0 = H2.clone().addScaledVector(LCA, 0.55 * LINE); // the entry window opens 55% down the line (~21 out)

  // ---------- path: keys at uniform curve t, chord-scaled Hermite (no overshoot on short legs), G1 through every key ----------
  // [S at the key or null (the clock decides), position, tangent or null (bisector)]
  const left = v3(), fwd = P1.clone().negate().normalize();
  { const r = fwd.clone().cross(v3(0, 1, 0)).normalize(), u = r.clone().cross(fwd); left.copy(r).multiplyScalar(Math.cos(2.79)).addScaledVector(u, Math.sin(2.79)); } // 160 deg: toward the limb Mars hides behind
  const KEYS = [
    [-1.00, C0, T0],                                               // the hand-off (Austin lands here)
    [-0.90, P1, null],                                             // the copy frame: near still
    [null, P1.clone().addScaledVector(left, 10).addScaledVector(fwd, 2), null],   // truck toward the limb: Mars crests, Earth slides down right
    [null, P1.clone().addScaledVector(left, 24).addScaledVector(fwd, 44), null],  // past Earth, heading out
    [null, v3(-200, -20, -60), null],                              // cruise, bowing toward the side the title is shot from
    [0.00, M(70, 20, 100), null],                                  // title frame
    [0.16, M(30, 10, 38), null],
    [0.34, H2, LCA],                                               // the SpaceX hold lets go straight down the entry line
    [E0, EP0, LCA],
    [CA, ENP, LCA]                                                 // the swap to Jezero
  ];
  const NK = KEYS.length, PK = KEYS.map(k => k[1]), TK = [];
  for (let i = 0; i < NK; i++) {
    if (KEYS[i][2]) { TK.push(KEYS[i][2].clone()); continue; }
    const a = i > 0 ? PK[i].clone().sub(PK[i - 1]).normalize() : v3(), b = i < NK - 1 ? PK[i + 1].clone().sub(PK[i]).normalize() : v3();
    TK.push(a.add(b).normalize());
  }
  const segL = PK.slice(0, -1).map((p, i) => p.distanceTo(PK[i + 1]));
  const path = new THREE.Curve();
  path.getPoint = (t, out = new THREE.Vector3()) => {
    const f = Math.min(Math.max(t, 0), 1) * (NK - 1), i = Math.min(NK - 2, Math.floor(f)), u = f - i, u2 = u * u, u3 = u2 * u, L = segL[i];
    return out.copy(PK[i]).multiplyScalar(2 * u3 - 3 * u2 + 1).addScaledVector(TK[i], (u3 - 2 * u2 + u) * L)
      .addScaledVector(PK[i + 1], 3 * u2 - 2 * u3).addScaledVector(TK[i + 1], (u3 - u2) * L);
  };
  path.arcLengthDivisions = (NK - 1) * 800; // every key on a division boundary: the arc table never straddles a tangent change
  const lens = path.getLengths(), arcAt = t => { const f = t * (lens.length - 1), i = Math.floor(f); return i >= lens.length - 1 ? lens[lens.length - 1] : lens[i] + (lens[i + 1] - lens[i]) * (f - i); };
  const keyArc = PK.map((p, i) => arcAt(i / (NK - 1)));

  // ---------- clock: scroll px -> distance along the path. One speed curve: the Austin hand-off speed easing onto the copy frame,
  // away from Earth, one cruise, easing onto the title; slow through the holds, then one run down the entry line that eases
  // as it meets the air.
  // Authored in px (the S map's own rate triples inside some beats). Anchors: [S, path key, speed (units/px), accel (units/px^2)].
  // Per leg the speed is the cubic through the two anchors plus a smooth bump (30 x^2 (1 - x)^2) sized so the leg covers exactly
  // its path length: speed and acceleration are set at every anchor, nothing steps anywhere. Integrated in closed form.
  const CLK = [[-1.00, 0, V0PX, -3e-5], [-0.90, 1, 0.0022, 0], [0.00, 5, 0.075, -4e-5], [0.16, 6, 0.012, -1e-5], [0.34, 7, 0.006, 0], [E0, 8, 0.11, -1e-4], [CA, 9, 0.04, -1e-4]];
  const NC = CLK.length, cy = new Float64Array(NC), cA = new Float64Array(NC);
  let Sy = null, yLo = 0, yHi = 1, yU0 = 0, yU1 = 1;
  const yOf = s => { let lo = yLo, hi = yHi; for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (Sy(m) < s) lo = m; else hi = m; } return (lo + hi) / 2; };
  function layout({ S, yE, y1 }) {
    Sy = S; yLo = yE; yHi = y1;
    for (let i = 0; i < NC; i++) cy[i] = CLK[i][0] <= -1 ? yE : yOf(CLK[i][0]);
    yU0 = yOf(UP0); yU1 = yOf(UP1);
    for (let i = 0; i < NC - 1; i++) { // bump amplitude: what the cubic alone leaves of the leg's length
      const D = cy[i + 1] - cy[i], va = CLK[i][2], vb = CLK[i + 1][2], sa = CLK[i][3] * D, sb = CLK[i + 1][3] * D;
      cA[i] = (keyArc[CLK[i + 1][1]] - keyArc[CLK[i][1]]) / D - ((va + vb) / 2 + (sa - sb) / 12);
    }
  }
  function dist(y) { // distance along the path at scroll px y
    if (y <= cy[0]) return 0; if (y >= cy[NC - 1]) return keyArc[CLK[NC - 1][1]];
    let i = 0; while (y > cy[i + 1]) i++;
    const D = cy[i + 1] - cy[i], x = (y - cy[i]) / D, x2 = x * x, x3 = x2 * x, x4 = x3 * x;
    const va = CLK[i][2], vb = CLK[i + 1][2], sa = CLK[i][3] * D, sb = CLK[i + 1][3] * D;
    const I = va * (x - x3 + x4 / 2) + sa * (x2 / 2 - 2 * x3 / 3 + x4 / 4) + vb * (x3 - x4 / 2) + sb * (x4 / 4 - x3 / 3) + cA[i] * x3 * (10 - 15 * x + 6 * x2);
    return keyArc[CLK[i][1]] + D * I;
  }

  // ---------- aim: a look point per key (pchip-like C1, flat where the subject holds), then the entry blend onto the line ----------
  // [S, look point, slope or null]. Zero slope on the copy frame: aim and position both settle there.
  const LK = [[-1.00, L0, 0], [-0.90, EARTH, 0], [-0.78, EARTH.clone().lerp(MARS, 0.06), null], [-0.55, MARS, 0], [0.34, MARS, 0]];
  const lk = [0, 1, 2].map(c => herm(LK.map(k => k[0]), LK.map(k => k[1].getComponent(c)), LK.map(k => k[2])));
  const LB0 = 0.34, LB1 = E0 - 0.005; // aim slides from the planet's centre onto the entry line (8.5 deg) as the hold lets go
  // ---------- lens ----------
  const fovP = herm([-1, -0.9, -0.62, -0.25, 0, 0.16, 0.34, E0, CA], [38, 48, 40, 31, 30, 30, 32, 42, 52], [0, 0, null, null, null, null, null, null, null]);

  // ---------- Moon: a circular orbit on the scroll clock, upper right of Earth in the copy frame, moving up and away ----------
  const MOON_R = 31.26, mA = v3(-0.1755, 0.4376, -0.8819), mB = v3(-0.2196, 0.8558, 0.4683), MW = 1.15; // orbit basis, rad per unit S
  const moonAt = (S, out) => {
    const u = S + 1, g = u < 0.08 ? u * u / 0.16 : u - 0.04, a = MW * (g - 0.06);   // eases in from rest at the hand-off; a = 0 at the copy frame
    return out.copy(mA).multiplyScalar(MOON_R * Math.cos(a)).addScaledVector(mB, MOON_R * Math.sin(a)).add(EARTH);
  };
  // ---------- Mars far: x16 down its own sight line until the crest is past, back to true by S -0.3 ----------
  const marsFar = S => 1 + 15 * (1 - smoother(clamp01((S + 0.84) / 0.54)));

  const tl = v3();
  function spaceCam(Sx, pos, look, up) {
    const S = Math.min(Math.max(Sx, -1), CA);
    const y = S <= -1 ? cy[0] : S >= CA ? cy[NC - 1] : yOf(S), d = dist(y);
    path.getPoint(path.getUtoTmapping(0, Math.max(0, Math.min(lens[lens.length - 1], d))), pos);
    look.set(lk[0](S), lk[1](S), lk[2](S));
    const w = smoother(clamp01((S - LB0) / (LB1 - LB0)));
    if (w > 0) look.lerp(tl.copy(pos).addScaledVector(LCA, 40), w);   // exactly along the line from E0 on, so the descent never turns
    if (up) { const k = smoother(clamp01((y - yU0) / (yU1 - yU0))); up.set(0, 1, 0).lerp(EN1, k).normalize(); } // world up, settling onto the entry plane's up (even in px)
    return fovP(S);
  }

  return { toSun, EARTH, MARS, C0, L0, P1, H2, EN1, ENP, LCA, CA, E0, E1, MOON_R, layout, spaceCam, moonAt, marsFar };
}
