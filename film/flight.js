// flight.js: the space camera, one move from the Earth frame (S = -1) to the entry swap (CA), and the bodies it passes.
// Pure math on THREE (no DOM), so node can test it as shipped. film.js owns rendering; austin.js lands on C0 with this
// camera's velocity, aim and aim rate at S = -1.
//
// createFlight({ THREE }) -> { toSun, EARTH, MARS, C0, L0, P1, H2, EN1, ENP, LCA, PN, QN, CA, E0, E1, MOON_R, layout(L),
//                              spaceCam(S, pos, look, up), moonAt(S, out), marsFar(S), marsQ(t, q), drift(S, pos, v) }
//   layout({ S, yE, y1 })   S = scroll -> film clock map, yE its S = -1 px, y1 any px past CA. Places the speed curve (authored in
//                           units per px) on this layout, so every layout hands off and lands at the same px speeds. Call it first.
//   spaceCam(S, pos, look, up) fills position, look point and up vector (up optional, always world up), returns the fov (deg)
//   moonAt(S, out)          Moon centre, a pure function of S
//   marsFar(S)              apparent distance factor for Mars (>= 1): far off it renders further down its own sight line, so it
//                           rises as a star and grows into the disc (same screen position, only the size changes)
//   marsQ(t, q)             Mars mesh orientation: a fixed tilt (so the entry crosses mid latitudes, not the cap) and a slow spin on t (s)
//   drift(S, pos, v)        trims the mouse / handheld offset v: smaller close to Earth, and kept in the move's plane so it adds no yaw
//                           or roll where the move has none (the Earth pass, and S 0 to CA)
//
// The move lives in two vertical planes: the Earth pass in PN's plane (through Earth's centre and the copy frame), the title, the
// SpaceX hold and the entry in QN's plane (through Mars's centre and the title frame). Inside a vertical plane with world up the
// camera only pitches: no yaw, no roll. The cruise between them swings from one plane to the other, far from both planets.
import { herm, smoother, clamp01 } from './util.js';

export const CA = 0.46, E0 = 0.40, E1 = 0.60;

export function createFlight({ THREE }) {
  const v3 = (x, y, z) => new THREE.Vector3(x, y, z), DEG = Math.PI / 180, Y = v3(0, 1, 0);
  // ---------- tuning ----------
  const RMIN = 11.25, PSI2 = -52, R2 = 17.5, PSI3 = -22, R3 = 11.8, PSIX = 18, RX = 11.45; // the pass, polar in its plane (air shell top 11)
  const SC = -0.7, VC = 0.018, FOVC = 54;                // closest approach: clock, speed (units/px), lens
  const HK = 1.3, DIPC = Math.acos(10 / RMIN); // the aim follows half the change of the horizon's dip, so the last of the descent never whips it
  const EPS = 12, SA1 = -0.745, SM0 = -0.725, SM1 = -0.66, SL1 = -0.45;  // look: deg above the horizon ahead, horizon by SA1, onto Mars over SM0..SM1
  const SF0 = -0.8, SF1 = -0.16;                                     // Mars far factor starts easing while it is still hidden (so the lens opening never shrinks it)
  const EPITCH = 25, EALT = 0.65;                         // entry: deg under the local horizontal at the swap, radius 6 + EALT
  const MTILT = -35 * DEG, MSPIN = 0.19, TSPIN = 0.002; // Mars mesh tilt (about the title sight line), spin (rad, rad/s)
  const MOONA = v3(-0.6543, 0.2642, -0.7086), MOONB = v3(0.5744, -0.4358, -0.6929), MOONW = 2;
  const toSun = v3(-1, 0.22, -0.55).normalize(), EARTH = v3(0, 0, 0);
  const upP = v3(0, 1, 0).addScaledVector(toSun, -toSun.y).normalize();
  const C0 = EARTH.clone().addScaledVector(toSun, -23).addScaledVector(upP, 10.4);   // Earth's night side, sun about to crest the limb
  const L0 = C0.clone().addScaledVector(toSun, 60).addScaledVector(upP, -9);
  // hand-off velocity, units per px of scroll: Austin's sideways swing (unchanged) plus 0.020 outward from the lot, the most the
  // Austin landing takes without a speed bump. Outward, so the distance to the lot never dips and no correction term is needed.
  const V0 = v3(1.06681e-2, 2.61300e-3, 2.18856e-2), T0 = V0.clone().normalize(), V0PX = V0.length();
  // the copy frame ("After solving earthmoving"): the pull out settles here, whole Earth centred, sun just behind the top limb
  const P1 = v3(25.216, 6.526, 17.498);
  // the Earth pass plane: vertical, through Earth's centre and P1. pe = the copy frame's aim, pu its screen up, PN its screen right.
  const pe = P1.clone().negate().normalize(), PN = pe.clone().cross(Y).normalize(), pu = PN.clone().cross(pe);
  const polar = (psi, r) => v3().addScaledVector(pe, r * Math.sin(psi * DEG)).addScaledVector(pu, r * Math.cos(psi * DEG)); // psi deg from the top (pu) toward pe; P1 sits at -90
  const dirP = (a, o = v3()) => o.set(0, 0, 0).addScaledVector(pe, Math.cos(a * DEG)).addScaledVector(pu, Math.sin(a * DEG)); // in the plane, a deg above pe
  const angP = d => Math.atan2(d.dot(pu), d.dot(pe)) / DEG;                                                   // inverse of dirP
  // Mars: far ahead in the pass plane, AM deg under pe. From the copy frame it hides behind Earth; it rises over the horizon ahead
  // as the camera comes over the top. The title and SpaceX frames are the same offsets from it as before.
  const AM = -18, DM = 480, MARS = dirP(AM).multiplyScalar(DM), M = (x, y, z) => v3(x, y, z).add(MARS);
  // the Mars plane: vertical, through Mars's centre and the title frame. Title, hold and entry all sit in it, so from S 0 to CA
  // the camera pitches only (zero roll) and screen up stays world up.
  const TOFF = v3(70, 20, 100), qh = v3(TOFF.x, 0, TOFF.z).normalize(), QN = TOFF.clone().cross(Y).normalize();
  const qOff = (d, el) => qh.clone().multiplyScalar(d * Math.cos(el * DEG)).addScaledVector(Y, d * Math.sin(el * DEG)).add(MARS); // d out, el deg up
  const TT = M(70, 20, 100), K16 = qOff(49.5, 10.6), H2 = qOff(41.67, 11.8);  // title (unchanged offset), then a steady creep in and up over the disc
  // entry line: straight from the SpaceX hold (H2) over the TOP of the disc to the swap, 0.65 above the surface, aim PITCH under the
  // local horizontal (the colony camera's own pitch just after the swap). It stays in the Mars plane, so the radial at the entry
  // point is screen up already: the horizon is level all the way down with world up, nothing rolls.
  const h = H2.clone().sub(MARS), hl = h.length(); h.normalize();
  const PITCH = EPITCH * DEG, sP = Math.sin(PITCH), nUp = Y.clone().addScaledVector(h, -h.y).normalize();
  const EN1 = v3(), ENP = v3(), LCA = v3();
  { // solve h . EN1 = x so the line through ENP at the entry pitch passes H2 (bisection, once)
    const g = x => { EN1.copy(h).multiplyScalar(x).addScaledVector(nUp, Math.sqrt(1 - x * x)); LCA.copy(h).multiplyScalar(hl).addScaledVector(EN1, -(6 + EALT)); return LCA.dot(EN1) / LCA.length() - sP; };
    let lo = -0.95, hi = 0.95; for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (g(m) < 0) lo = m; else hi = m; } g((lo + hi) / 2);
    LCA.normalize().negate(); ENP.copy(MARS).addScaledVector(EN1, 6 + EALT);
  }
  const LINE = H2.distanceTo(ENP), EP0 = H2.clone().addScaledVector(LCA, 0.55 * LINE); // the entry window opens 55% down the line
  // Mars mesh: tilted about the title sight line (an in-frame turn of the globe, same face to the camera) so the entry line crosses
  // mid northern latitudes, not the cap. Spins only on the clock (TSPIN rad/s), never with scroll.
  const TILT = new THREE.Quaternion().setFromAxisAngle(TOFF.clone().normalize(), MTILT);
  const marsQ = (t, q) => q.setFromAxisAngle(Y, MSPIN + t * TSPIN).premultiply(TILT);

  // ---------- path: keys at uniform curve t, chord-scaled Hermite (no overshoot on short legs), G1 through every key ----------
  // [S at the key or null (the clock decides), position, tangent or null (bisector)]. Pass keys are polar (psi, r) in the pass plane.
  const PC = polar(0, RMIN);                                        // closest approach, straight over the top
  const PX = polar(PSIX, RX), DX = MARS.clone().sub(PX).normalize(); // leaving the skim, already heading for Mars
  const KC = MARS.clone().addScaledVector(MARS.clone().negate().normalize().lerp(TOFF.clone().normalize(), 0.62).normalize(), 270); // cruise: swinging round onto the title side
  const inPlane = (t, n) => t.addScaledVector(n, -t.dot(n)).normalize();
  // the copy frame's tangent is the one the hand-off leg was built with (unchanged, so Austin's landing is bit for bit the same);
  // the camera is near still there (0.0022 units/px), and P1B, 1.5 units on, is already in the pass plane
  const TP1 = v3(-0.13013639750678707, 0.25775939419840249, 0.95740514556086864);
  const K2 = polar(PSI2, R2), P1B = P1.clone().addScaledVector(inPlane(TP1.clone(), PN).add(K2.clone().sub(P1).normalize()).normalize(), 1.5);
  const KEYS = [
    [-1.00, C0, T0],                                               // the hand-off (Austin lands here)
    [-0.90, P1, TP1],                                              // the copy frame: near still, still drifting the way it arrived
    [null, P1B, null],                                             // a short ease into the pass plane (the hand-off leg stays as shipped)
    [null, K2, null],                                              // pushing in, over the top limb
    [null, polar(PSI3, R3), null],                                 // low over the day side
    [null, PC, pe.clone()],                                        // closest approach, level
    [null, PX, DX],                                                // climbing out, Mars ahead
    [null, PX.clone().addScaledVector(DX, 70), DX],                // away from Earth, still in the pass plane
    [null, KC, null],                                              // cruise
    [0.00, TT, null],                                              // title frame
    [0.16, K16, null],
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
  inPlane(TK[2], PN);                                               // the pass runs inside its plane from P1B
  inPlane(TK[9], QN);                                               // and the title frame inside the Mars plane: zero roll from S 0
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
  // a push in that eases off over the top (perceived speed grows as the ground gets close), out and one cruise easing onto the
  // title; slow through the holds, then one run down the entry line that eases as it meets the air.
  // Authored in px (the S map's own rate triples inside some beats). Anchors: [S, path key, speed (units/px), accel (units/px^2)].
  // Per leg the speed is the cubic through the two anchors plus a smooth bump (30 x^2 (1 - x)^2) sized so the leg covers exactly
  // its path length: speed and acceleration are set at every anchor, nothing steps anywhere. Integrated in closed form.
  const CLK = [[-1.00, 0, V0PX, -3e-5], [-0.90, 1, 0.0022, 0], [SC, 5, VC, 0], [0.00, 9, 0.075, -4e-5], [0.16, 10, 0.012, -1e-5], [0.34, 11, 0.006, 0], [E0, 12, 0.11, -1e-4], [CA, 13, 0.04, -1e-4]];
  const NC = CLK.length, cy = new Float64Array(NC), cA = new Float64Array(NC);
  let Sy = null, yLo = 0, yHi = 1;
  const yOf = s => { let lo = yLo, hi = yHi; for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (Sy(m) < s) lo = m; else hi = m; } return (lo + hi) / 2; };
  function layout({ S, yE, y1 }) {
    Sy = S; yLo = yE; yHi = y1;
    for (let i = 0; i < NC; i++) cy[i] = CLK[i][0] <= -1 ? yE : yOf(CLK[i][0]);
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

  // ---------- aim ----------
  // hand-off leg (S -1 to -0.9): look point L0 -> Earth's centre, flat at both ends (unchanged).
  const lk = [0, 1, 2].map(c => herm([-1, -0.9], [L0.getComponent(c), EARTH.getComponent(c)], [0, 0]));
  // the pass: an angle in the pass plane (pitch only). Earth's centre -> EPS deg above the horizon ahead (Earth fills the bottom of
  // the frame and rolls under) -> Mars once it has risen. Look distance follows the subject, so focus lands on the horizon.
  const wA = S => smoother(clamp01((S + 0.9) / (SA1 + 0.9))), wM = S => smoother(clamp01((S - SM0) / (SM1 - SM0))), wL = S => smoother(clamp01((S - SM0) / (SL1 - SM0)));
  const LB0 = 0.34, LB1 = E0 - 0.005; // aim slides from the planet's centre onto the entry line as the hold lets go
  // ---------- lens ----------
  const fovP = herm([-1, -0.9, SC, -0.5, -0.25, 0, 0.16, 0.34, E0, CA], [38, 48, FOVC, 38, 31, 30, 30, 32, 42, 52], [0, 0, null, null, null, null, null, null, null, null]);

  // ---------- Moon: a circular orbit on the scroll clock ----------
  const MOON_R = 31.26, mA = MOONA, mB = MOONB, MW = MOONW; // orbit basis, rad per unit S
  const moonAt = (S, out) => {
    const u = S + 1, g = u < 0.08 ? u * u / 0.16 : u - 0.04, a = MW * (g - 0.06);   // eases in from rest at the hand-off; a = 0 at the copy frame
    return out.copy(mA).multiplyScalar(MOON_R * Math.cos(a)).addScaledVector(mB, MOON_R * Math.sin(a)).add(EARTH);
  };
  // ---------- Mars far: x16 down its own sight line until it has risen over the horizon, back to true by S -0.3 ----------
  const marsFar = S => 1 + 15 * (1 - smoother(clamp01((S - SF0) / (SF1 - SF0))));

  // ---------- drift: mouse + handheld offset, trimmed ----------
  const dPass = S => smoother(clamp01((S + 0.9) / 0.04)) * (1 - smoother(clamp01((S - SM1) / 0.06))), dHold = S => smoother(clamp01((S + 0.06) / 0.06));
  function drift(S, pos, v) {
    const alt = pos.length() - 10; v.multiplyScalar(clamp01((alt - 1) / 6));         // none at the air shell top (1 above the surface): it can never push the lens into it
    const a = dPass(S), b = dHold(S);
    if (a > 0) v.addScaledVector(PN, -a * v.dot(PN)); if (b > 0) v.addScaledVector(QN, -b * v.dot(QN));
    return v;
  }

  const tl = v3(), td = v3();
  function spaceCam(Sx, pos, look, up) {
    const S = Math.min(Math.max(Sx, -1), CA);
    const y = S <= -1 ? cy[0] : S >= CA ? cy[NC - 1] : yOf(S), d = dist(y);
    path.getPoint(path.getUtoTmapping(0, Math.max(0, Math.min(lens[lens.length - 1], d))), pos);
    if (S <= -0.9) look.set(lk[0](S), lk[1](S), lk[2](S));
    else if (S >= SL1) look.copy(MARS);
    else { // pitch in the pass plane, then straight at Mars
      const a = wA(S), m = wM(S), r = pos.length(), d0 = Math.log(r + (Math.sqrt(Math.max(0, r * r - 100)) - r) * a), l = wL(S);
      const ld = Math.exp(d0 + (Math.log(MARS.distanceTo(pos)) - d0) * l); // look distance (the focus): in log, a slow pull from the horizon to Mars
      if (S >= SM1) look.copy(MARS).sub(pos).normalize().multiplyScalar(ld).add(pos);
      else {
        const psi = Math.atan2(pos.dot(pe), pos.dot(pu)) / DEG;
        const hor = -psi - (HK * Math.acos(Math.min(1, 10 / r)) + (1 - HK) * DIPC) / DEG + EPS, phE = angP(td.copy(pos).negate()), phM = angP(td.copy(MARS).sub(pos));
        look.copy(pos).add(dirP((phE + (hor - phE) * a) * (1 - m) + phM * m, td).multiplyScalar(ld));
      }
    }
    const w = smoother(clamp01((S - LB0) / (LB1 - LB0)));
    if (w > 0) look.lerp(tl.copy(pos).addScaledVector(LCA, 40), w);   // exactly along the line from E0 on, so the descent never turns
    if (up) up.set(0, 1, 0);                                          // world up throughout: every turn is a pitch in a vertical plane
    return fovP(S);
  }

  return { toSun, EARTH, MARS, C0, L0, P1, H2, EN1, ENP, LCA, PN, QN, CA, E0, E1, MOON_R, layout, spaceCam, moonAt, marsFar, marsQ, drift };
}
