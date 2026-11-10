// D6.1 footer: SpaceX-style Starships standing on pads. 9 m bare stainless all round (no tile side), ogive nose,
// forward + aft flaps in a slightly darker steel (M.flap, falls back to M.stainless), aerocovers, short legs, engine skirt, nose beacon. Real scale (50 m).
import { TS, height, cylUV, boxUV, extrude } from './foot-model-kit.js';

const R = 4.5;
// lathe profile (radius, y) from the aft skirt to the nose tip; y measured from the bottom of the tank skirt
const PROF = [[3.7, 0], [4.5, 0.7], [4.5, 33], [4.44, 35.5], [4.25, 38.5], [3.9, 41.5], [3.35, 44.3], [2.6, 46.6], [1.75, 48.4], [0.9, 49.6], [0.25, 50.25], [0, 50.4]];

export function buildStarships({ THREE, B, M, high, ships }) {
  const seg = high ? 44 : 22, V2 = THREE.Vector2, LIFT = 1.7;
  const pts = PROF.map(([r, y]) => new V2(r, y));

  // template parts in ship space (y up, tile half faces -z, flaps on +-x), cloned per ship
  const body = cylUV(new THREE.LatheGeometry(pts, seg), R, TS.stainless).toNonIndexed();

  // flaps: trapezoids in the (radial, y) plane, extruded thin, root on the hull
  const rHull = y => { for (let i = 1; i < PROF.length; i++) { const [r0, y0] = PROF[i - 1], [r1, y1] = PROF[i]; if (y <= y1) return r0 + (r1 - r0) * (y - y0) / (y1 - y0); } return 0; };
  // flaps: trapezoids in the (radial, y) plane, root edge sunk into the hull line, extruded thin
  const flap = (y0, y1, ty0, ty1, span, th) => {
    const s = new THREE.Shape([new V2(rHull(y0) - 0.2, y0), new V2(rHull(y0) + span, ty0), new V2(rHull(y1) + span * 0.92, ty1), new V2(rHull(y1) - 0.2, y1)]);
    return extrude(THREE, s, th, high ? 0.06 : 0, 1);
  };
  const aft = flap(1.2, 12.5, 2.8, 9.4, 4.4, 0.42), fwd = flap(37.6, 45.8, 39.2, 44.8, 3.1, 0.36);
  const cover = (y0, y1, rr) => new THREE.BoxGeometry(0.9, y1 - y0, 1.5).translate(rr + 0.3, (y0 + y1) / 2, 0);
  const steelParts = [], flapParts = [], darkParts = [];
  for (const s of [1, -1]) {
    const m = new THREE.Matrix4().makeRotationY(s > 0 ? 0 : Math.PI);
    flapParts.push(boxUV(THREE, aft.clone().applyMatrix4(m), TS.stainless), boxUV(THREE, fwd.clone().applyMatrix4(m), TS.stainless),
      boxUV(THREE, cover(0.8, 13, R - 0.2).applyMatrix4(m), TS.stainless), boxUV(THREE, cover(37.6, 45.2, rHull(41.5) - 0.35).applyMatrix4(m), TS.stainless));
  }
  // weld / ring frames and the header tank band
  for (const y of [8.5, 17.2, 25.8, 33]) steelParts.push(cylUV(new THREE.CylinderGeometry(R + 0.16, R + 0.16, 0.22, seg, 1, true).translate(0, y, 0), R, TS.stainless).toNonIndexed());
  darkParts.push(new THREE.CylinderGeometry(3.75, 4.0, 1.2, seg, 1, true).translate(0, -0.3, 0).toNonIndexed());
  // legs
  const legs = [];
  for (let k = 0; k < 6; k++) {
    const a = k / 6 * Math.PI * 2 + 0.26, c = Math.cos(a), sn = Math.sin(a);
    legs.push(new THREE.CylinderGeometry(0.22, 0.28, 2.2, 6).rotateZ(0.42).rotateY(-a).translate(c * 4.25, -0.75, sn * 4.25).toNonIndexed());
    legs.push(new THREE.BoxGeometry(1.1, 0.18, 1.1).rotateY(-a).translate(c * 4.7, -1.62, sn * 4.7).toNonIndexed());
  }

  const out = [];
  for (const s of ships) {
    const lod = s.lod ?? (high ? 1 : 0);
    // base: lowest ground under the footprint, pad slab fills the gap
    let gy = Infinity; for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; gy = Math.min(gy, height(s.x + Math.cos(a) * 12, s.z + Math.sin(a) * 12)); }
    gy = Math.min(gy, height(s.x, s.z));
    const tr = new THREE.Matrix4().makeRotationY(s.ry || 0).premultiply(new THREE.Matrix4().makeScale(s.k || 1, s.k || 1, s.k || 1)).setPosition(s.x, gy + 0.6 + LIFT, s.z);
    const T = g => g.clone().applyMatrix4(tr);
    B.P(M.stainless, T(body)); steelParts.forEach(g => B.P(M.stainless, T(g))); flapParts.forEach(g => B.P(M.flap || M.stainless, T(g)));
    darkParts.forEach(g => B.P(M.dark, T(g))); if (lod) legs.forEach(g => B.P(M.stainless, T(g)));
    const pr = s.pad || 11;
    B.P(M.pad, boxUV(THREE, new THREE.CylinderGeometry(pr, pr + 1, 2.4, high ? 32 : 16).translate(s.x, gy - 0.6, s.z), TS.habitat_panel));
    B.P(M.beacon, new THREE.SphereGeometry(0.35, 8, 6).translate(0, 50.6, 0).applyMatrix4(tr));
    out.push({ x: s.x, z: s.z, y: gy + 0.6 + LIFT, top: gy + 0.6 + LIFT + 50.4 * (s.k || 1) });
  }
  [body, aft, fwd, ...steelParts, ...flapParts, ...darkParts, ...legs].forEach(g => g.dispose());
  return out;
}

// the build pad's crane tower (as in the Jezero timelapse): square lattice, X-braced bays, a slewing jib over the ship and a
// counter-jib with its ballast. Merged into M.tower; returns work-lamp positions (for the light points) and the beacon tip.
export function buildPadTower({ THREE, B, M, high, x, z, ship, H = 57 }) {
  const gy = height(x, z), parts = [], box = (w, h, d, px, py, pz) => parts.push(new THREE.BoxGeometry(w, h, d).translate(px, py, pz));
  const W = 3, leg = 0.7, bay = 6, br = 0.28;
  for (const sx of [-W, W]) for (const sz of [-W, W]) box(leg, H, leg, sx, H / 2, sz);
  // bays: rings + one diagonal per face (alternating), the diagonals are what make it read as a lattice
  const diag = (ax, az, bx, bz, y0, y1) => { const a = new THREE.Vector3(ax, y0, az), b = new THREE.Vector3(bx, y1, bz), L = a.distanceTo(b);
    parts.push(new THREE.BoxGeometry(br, L, br).applyMatrix4(new THREE.Matrix4().lookAt(a, b, new THREE.Vector3(0, 0, 1)).multiply(new THREE.Matrix4().makeRotationX(Math.PI / 2))).translate((ax + bx) / 2, (y0 + y1) / 2, (az + bz) / 2)); };
  for (let y = 2, i = 0; y < H - 1; y += bay, i++) {
    box(2 * W, br, br, 0, y, -W); box(2 * W, br, br, 0, y, W); box(br, br, 2 * W, -W, y, 0); box(br, br, 2 * W, W, y, 0);
    if (!high && i % 2) continue;
    const f = i % 2 ? 1 : -1, y1 = Math.min(H - 1, y + bay);
    diag(-W * f, -W, W * f, -W, y, y1); diag(W * f, W, -W * f, W, y, y1); diag(-W, W * f, -W, -W * f, y, y1); diag(W, -W * f, W, W * f, y, y1);
  }
  // jib toward the ship, counter-jib behind with ballast, cab and a short hook line
  const a = Math.atan2(-(ship[1] - z), ship[0] - x), reach = Math.hypot(ship[0] - x, ship[1] - z) + 4;
  const top = [];
  top.push(new THREE.BoxGeometry(reach + 2, 1.4, 1.4).translate(reach / 2, 0, 0), new THREE.BoxGeometry(14, 1.2, 1.2).translate(-7, 0, 0),
    new THREE.BoxGeometry(4, 3, 2.6).translate(-12.5, -0.8, 0), new THREE.BoxGeometry(2.2, 2.4, 2.2).translate(1, -1.6, 1.8),
    new THREE.BoxGeometry(1.2, 6, 1.2).translate(0, 3.6, 0), new THREE.BoxGeometry(0.12, 9, 0.12).translate(reach - 6, -4.5, 0));
  const jm = new THREE.Matrix4().makeRotationY(a).setPosition(0, H + 0.7, 0);
  for (const g of top) parts.push(g.applyMatrix4(jm));
  const tr = new THREE.Matrix4().setPosition(x, gy - 0.2, z);
  for (const g of parts) B.P(M.tower, boxUV(THREE, g.applyMatrix4(tr), TS.dome_frame));
  B.P(M.beacon, new THREE.SphereGeometry(0.4, 8, 6).translate(x, gy + H + 7, z));
  const lamps = []; for (let y = 10; y < H; y += 12) lamps.push([x + W + 0.5, gy + y, z + W + 0.5]);
  for (let i = 0; i < 3; i++) lamps.push([x + Math.cos(-a) * (8 + i * (reach - 10) / 2), gy + H - 0.2, z + Math.sin(-a) * (8 + i * (reach - 10) / 2)]);
  return { lamps, top: gy + H };
}
