// austin.js: the Austin beat camera and its story clocks. One continuous pull-back: a slow drift up and back off the lot from the
// first frame, accelerating into the rise, then a sideways swing onto the Earth frame (C0) that hands over to spaceCam at S = -1
// with matching position, velocity, look direction and look turn rate (C1). Pure math on THREE, so node can test it as shipped.
//
// createAustinCam({ THREE, SITE_ROT, AUS, U_PER_M, C0, L0, spaceCam }) -> { layout(L), at(y, out), k }
//   layout({ yA, yT, yX, yE, S })   scroll anchors (px into the film track): yA the scene's first frame on screen, yT the H2 centred,
//                                   yX the H2 near the top edge, yE the Earth frame (S = -1); S = the film's scroll -> S map
//   at(y, out)                      fills out: { world: 'site' | 'globe', pos, look, up, fov, lam, dist, s, g, hour }
//                                   site: metres in the lot frame (y up, origin = lot centre); globe: Earth units (world)
// Hand-off at S = -1: pos = C0, look direction = normalize(L0 - C0), up = (0, 1, 0), fov = 38, velocity = spaceCam's own at S = -1
// (flight.js leaves outward from the lot, so the distance to it never dips).
import { pchip, smoother, clamp01 } from './util.js';

export function createAustinCam({ THREE, SITE_ROT, AUS, U_PER_M, C0, L0, spaceCam }) {
  const FOV = 38, PITCH0 = 56, TZ = -10;                            // opening lens, tilt (deg from level) and aim offset (m, north): lot sits low, H2 over the calmer houses
  const D_A = 125, D_T = 170, D_X = 290, D_M = 40000;                // metres from the lot: first frame, H2 centred, H2 leaving, mid rise
  const LAMH = Math.log(650e3), LAM1 = Math.log(C0.distanceTo(AUS) / U_PER_M), LAM_P = LAMH; // world swap, Earth frame; the tilt lands straight down exactly at the swap
  const AUSn = AUS.clone().normalize(), negN = AUSn.clone().negate(), bE = C0.clone().sub(AUS).normalize(), D1 = C0.distanceTo(AUS);
  const v = () => new THREE.Vector3(), q = new THREE.Quaternion(), qI = new THREE.Quaternion();
  const a0 = v(), a1 = v(), a2 = v(), lk = v(), P = v(), T1 = v(), tL = v(), vr = v();
  const k = {};                                                    // layout results, read by film.js and the QA script
  let lamF = null, hourF = null, gF = null, L = null;

  // y at which a monotone f reaches the value w (bisection)
  const solve = (f, w, lo, hi) => { for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (f(m) < w) lo = m; else hi = m; } return (lo + hi) / 2; };

  function layout(lay) {
    L = lay; const { yA, yT, yX, yE, S } = L;
    // spaceCam's velocity at S = -1 in units per px of scroll (second order one-sided difference)
    const h = 0.5, dSdy = (-3 * S(yE) + 4 * S(yE + h) - S(yE + 2 * h)) / (2 * h);
    spaceCam(-1, a0, lk); spaceCam(S(yE + h), a1, lk); spaceCam(S(yE + 2 * h), a2, lk);
    const v0 = a0.clone().multiplyScalar(-3).addScaledVector(a1, 4).addScaledVector(a2, -1).divideScalar(2 * h);
    const r0 = v0.dot(bE), r = Math.max(r0, 1e-6);                // outward speed at the hand-off (spaceCam's own; the floor only guards a bad key)
    k.dSdy = dSdy; k.v0 = v0.length(); k.r0 = r0; k.r = r;
    // distance from the lot, ln metres: slow drift while the H2 is up, accelerating into the rise, then easing so the outward speed
    // at S = -1 is exactly r (the swing round onto the Earth frame carries the rest of the speed)
    // keys: first frame, H2 centred, H2 leaving, mid rise, then two keys that spread the landing on the Earth frame distance
    const yM = yX + 0.46 * (yE - yX), yN = yX + 0.64 * (yE - yX), yQ = yX + 0.82 * (yE - yX), lamE = r / D1, dLast = 0.4 / (yE - yQ);
    lamF = pchip([yA, yT, yX, yM, yN, yQ, yE], [D_A, D_T, D_X, D_M].map(Math.log).concat(LAM1 - 1.4, LAM1 - 0.4, LAM1), 0.7, lamE / dLast); // 0.7: already drifting on the first frame
    k.yH = solve(lamF, LAMH, yA, yE);                              // the world swap: site set -> globe
    vr.copy(v0).addScaledVector(bE, -r0);                          // tangential part (units/px)
    T1.copy(vr).multiplyScalar((yE - k.yH) / D1);                  // direction tangent at the end of the globe leg, per unit of its parameter
    const yL = l => solve(lamF, Math.log(l), yA, yE);
    // sun: one day, dawn on the first frame to full night before the city lights matter. Hours, Austin late October (CDT).
    hourF = pchip([yA, yT, yX, yL(1600), yL(7000), yL(40e3)], [7.9, 10.2, 13.4, 17.9, 18.95, 19.6], undefined, 0);
    // build progress: what exists. Keeps going through the rise until the lot is a few pixels.
    gF = pchip([yA, yT, yX, yL(1600), yL(30e3)], [0.0, 0.3, 0.52, 0.8, 1], undefined, 0);
    Object.assign(k, { yA, yT, yX, yM, yE, LAMH, LAM1, lamA: lamF(yA), yNight: yL(40e3), yG1: yL(30e3) });
  }

  function at(y, o) {
    const { yA, yE } = L, yc = Math.min(Math.max(y, yA), yE);
    const lam = lamF(yc), D = Math.exp(lam);
    o.lam = lam; o.s = clamp01((y - yA) / (yE - yA)); o.fov = FOV;
    o.hour = hourF(yc); o.g = Math.min(1, gF(yc));                 // both hold their last key past it
    if (yc < k.yH) {
      // the lot set: tilt from oblique to straight down and turn north-up while the distance grows
      const up = smoother(clamp01((lam - k.lamA) / (LAM_P - k.lamA)));
      const a = THREE.MathUtils.lerp(-0.08 + 0.16 * (yc - yA) / (yE - yA), SITE_ROT, up), p = THREE.MathUtils.degToRad(PITCH0 + (90 - PITCH0) * up); // up stays the heading, so straight down is never degenerate
      o.look.set(0, 0, TZ * (1 - up));
      o.pos.set(Math.sin(a) * Math.cos(p), Math.sin(p), Math.cos(a) * Math.cos(p)).multiplyScalar(D).add(o.look);
      o.up.set(-Math.sin(a), 0, -Math.cos(a));                     // screen-up = heading, north once straight down (the globe leg keeps it)
      o.world = 'site'; o.dist = o.pos.length(); o.upk = up;
      return o;
    }
    // the globe: straight up off Austin, swinging round onto the Earth frame. Direction = normalised cubic Hermite from AUSn (rest)
    // to bE (tangent T1), so it leaves the vertical gently and arrives with spaceCam's sideways speed.
    const f = clamp01((yc - k.yH) / (yE - k.yH)), f2 = f * f, f3 = f2 * f;
    P.copy(AUSn).multiplyScalar(2 * f3 - 3 * f2 + 1).addScaledVector(bE, 3 * f2 - 2 * f3).addScaledVector(T1, f3 - f2).normalize();
    o.pos.copy(AUS).addScaledVector(P, D * U_PER_M);
    // look: straight down, turning onto L0; from f 0.91 it is exactly spaceCam's aim at S = -1 (towards L0), so the turn rate matches
    tL.copy(L0).sub(o.pos).normalize(); q.setFromUnitVectors(negN, tL); qI.identity().slerp(q, smoother(Math.min(1, f * 1.1)));
    o.look.copy(negN).applyQuaternion(qI).multiplyScalar(D * U_PER_M).add(o.pos);
    o.up.set(0, 1, 0); o.world = 'globe'; o.dist = D; o.upk = 1;
    return o;
  }

  return { layout, at, k, LAMH, LAM1 };
}

// sun over the lot at a local hour (CDT), Austin late October: hour angle from solar noon (~13:06), declination -13 deg.
// Returns sin(elevation), elevation and azimuth (rad), and the unit direction to the sun in the lot frame (x east, y up, z south).
const LAT = 30.250453 * Math.PI / 180, DEC = -13 * Math.PI / 180;
export function sunAt(hour, o = {}) {
  const Ha = (hour - 13.1) * 15 * Math.PI / 180, sinE = Math.sin(LAT) * Math.sin(DEC) + Math.cos(LAT) * Math.cos(DEC) * Math.cos(Ha);
  const el = Math.asin(sinE), az = Math.atan2(-Math.sin(Ha), Math.tan(DEC) * Math.cos(LAT) - Math.sin(LAT) * Math.cos(Ha));
  o.sinE = sinE; o.el = el; o.az = az; o.x = Math.cos(el) * Math.sin(az); o.y = sinE; o.z = -Math.cos(el) * Math.cos(az);
  return o;
}

// exposure for the Austin beat: a fixed curve of sun elevation and altitude, never metered, so scrubbing cannot pump it and it
// cannot drift once the scroll stops. Opens up for the low sun at dawn and dusk and for the night lot, stops down while the lit
// city fills the frame, and lands on EARTH_EXP, the value auto exposure holds on the Earth frame, so the hand-off does not drift.
export const EARTH_EXP = 0.79; // measured: auto exposure settles at 0.784 to 0.788 on the Earth frame (S -0.995, low and high tier)
const ss = (x, a, b) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const LN = Math.log;
export function exposureAt(sinE, lam) {
  const sun = 1 + 0.3 * (1 - ss(sinE, 0.02, 0.45));                                     // 1.3 at the horizon and after dark, 1 by mid morning
  const city = 1 - 0.78 * ss(lam, LN(2e3), LN(4e4));                                    // a whole lit city in frame: stop down
  return 1.05 * sun * city + (EARTH_EXP - 1.05 * sun * city) * ss(lam, LN(2e6), LN(9e6)); // and ease onto the orbit value as the limb comes in
}
