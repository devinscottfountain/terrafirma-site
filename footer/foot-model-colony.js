// D6.1 footer colony: the timelapse city seen from its edge at dusk (plan: foot-model-plan.js). Hub + outer geodesic glass
// domes with planted interiors (foot-model-plants.js) and grow lamps, ribbed glass corridors, fab sheds on the outer
// ring, masts and a parked pressurised rover. All merged per material through the bucket B.
import { makePlanter } from './foot-model-plants.js';
import { TS, rng, fbm, height, geodesic, soup, boxUV, rrect, extrude, smoothNormals } from './foot-model-kit.js';

export function buildColony({ THREE, B, M, high, plan }) {
  const r = rng(77), V3 = THREE.Vector3;
  const gy = (x, z) => height(x, z);
  const geoCache = new Map(); const geo = f => geoCache.get(f) || geoCache.set(f, geodesic(THREE, f)).get(f);
  const domes = [];

  // ---------------------------------------------------------------- geodesic dome: struts, inset panels, base ring, vestibule
  function dome(cx, cz, R, freq, { glass = true, green = glass, ry = 0, vest = true } = {}) {
    const { faces, verts, edges } = geo(freq), y0 = gy(cx, cz) - 0.15, w = Math.max(0.12, R * 0.012), dep = w * 1.3;
    const tr = new THREE.Matrix4().makeRotationY(ry).setPosition(cx, y0 + 0.9, cz);
    // struts: 4-sided prisms along each chord
    const S = [];
    const a = new V3(), b = new V3(), n = new V3(), sd = new V3(), t = new V3();
    const quad = (p0, p1, p2, p3) => { for (const q of [p0, p1, p2, p0, p2, p3]) S.push(q.x, q.y, q.z); };
    for (const [i, j] of edges) {
      a.copy(verts[i]).multiplyScalar(R); b.copy(verts[j]).multiplyScalar(R);
      n.copy(a).add(b).normalize(); t.subVectors(b, a); sd.crossVectors(t, n).normalize().multiplyScalar(w / 2);
      const o = n.clone().multiplyScalar(dep * 0.35), ii = n.clone().multiplyScalar(-dep * 0.65);
      const A0 = a.clone().add(sd).add(o), A1 = a.clone().sub(sd).add(o), B0 = b.clone().add(sd).add(o), B1 = b.clone().sub(sd).add(o);
      const A2 = a.clone().sub(sd).add(ii), A3 = a.clone().add(sd).add(ii), B2 = b.clone().sub(sd).add(ii), B3 = b.clone().add(sd).add(ii);
      quad(A0, B0, B1, A1); quad(A1, B1, B2, A2); quad(A3, B3, B0, A0); if (high) quad(A2, B2, B3, A3);
    }
    const sg = soup(THREE, S); sg.applyMatrix4(tr); B.P(M.frame, boxUV(THREE, sg, TS.dome_frame));
    // hubs (high only)
    if (high && R > 8) for (const v of verts) { if (v.y < -1e-3) continue; B.P(M.frame, boxUV(THREE, new THREE.OctahedronGeometry(w * 1.1).translate(v.x * R, v.y * R, v.z * R).applyMatrix4(tr), TS.dome_frame)); }
    // panels: each face inset toward its centroid, sitting just inside the strut faces
    const G = [], O = [];
    for (const f of faces) {
      const c = f.c.clone().multiplyScalar(R), L = f.v[0].distanceTo(f.v[1]) * R, k = 1 - 1.6 * w / L;
      const P = f.v.map(v => c.clone().add(v.clone().multiplyScalar(R).sub(c).multiplyScalar(k)).multiplyScalar(0.997));
      const isGlass = glass && !(f.c.y < 0.12 && r() < 0.5);
      for (const p of P) (isGlass ? G : O).push(p.x, p.y, p.z);
    }
    if (G.length) { const g = soup(THREE, G); g.applyMatrix4(tr); B.P(M.glass, boxUV(THREE, g, TS.dome_glass)); }
    if (O.length) { const g = soup(THREE, O); g.applyMatrix4(tr); B.P(M.hab, boxUV(THREE, g, TS.habitat_panel)); }
    // base ring wall + vestibule toward camera
    const segs = high ? 48 : 24;
    B.P(M.hab, boxUV(THREE, new THREE.CylinderGeometry(R * 1.01, R * 1.03, 1.1, segs, 1, true).translate(0, -0.45, 0).applyMatrix4(tr), TS.habitat_panel));
    if (vest) {
      const vw = Math.min(4, R * 0.28), vh = Math.min(3.2, R * 0.24), vl = Math.min(6, R * 0.35);
      const vs = new THREE.Shape(); vs.moveTo(-vw / 2, 0); vs.lineTo(vw / 2, 0); vs.lineTo(vw / 2, vh * 0.6); vs.quadraticCurveTo(vw / 2, vh, 0, vh); vs.quadraticCurveTo(-vw / 2, vh, -vw / 2, vh * 0.6); vs.closePath();
      const vg = extrude(THREE, vs, vl, 0, 1, 4).translate(0, -0.9, R * 0.98 + vl / 2 - 1.2).applyMatrix4(tr);
      B.P(M.hab, boxUV(THREE, vg, TS.habitat_panel));
      B.P(M.window, new THREE.BoxGeometry(vw * 0.42, vh * 0.55, 0.4).translate(0, vh * 0.3 - 0.9, R * 0.98 + vl - 1.2 + 0.08).applyMatrix4(tr));   // stands 0.28 m proud: no z-fight at 300 m
    }
    if (green) planting(cx, y0 + 0.9, cz, R);
    domes.push({ x: cx, y: y0, z: cz, R });
  }

  // ---------------------------------------------------------------- planted interior
  const planter = makePlanter({ THREE, B, M, high });
  function planting(cx, y0, cz, R) {
    B.P(M.soil, new THREE.CircleGeometry(R * 0.98, high ? 40 : 20).rotateX(-Math.PI / 2).translate(cx, y0 + 0.25, cz));
    const roof = rr => Math.sqrt(Math.max(0, R * R - rr * rr)) * 0.9;
    planter.plant(cx, y0 + 0.25, cz, R);
    // grow lamps: warm clusters hung under the frame
    const nl = Math.max(2, Math.round(R / 5));
    for (let i = 0; i < nl; i++) { const a = r() * Math.PI * 2, rr = r() * R * 0.55, h = roof(rr) * (0.7 + r() * 0.15);
      B.P(M.lamp, new THREE.SphereGeometry(0.22 + R * 0.008, 6, 4).translate(cx + Math.cos(a) * rr, y0 + h, cz + Math.sin(a) * rr)); }
  }

  // boxy unit with rounded vertical edges, roof kit, window band
  function unit(cx, cz, w, h, d, { win = 5, ry = 0, kit = true } = {}) {
    const y = Math.min(gy(cx - w / 2, cz), gy(cx + w / 2, cz)) + 0.5, tr = new THREE.Matrix4().makeRotationY(ry).setPosition(cx, y, cz), T = g => g.applyMatrix4(tr);
    B.P(M.hab, boxUV(THREE, T(extrude(THREE, rrect(THREE, w, d, Math.min(1.4, d * 0.25)), h, 0, 1, 3).rotateX(-Math.PI / 2).translate(0, h / 2, 0)), TS.habitat_panel));
    B.P(M.frame, boxUV(THREE, T(new THREE.BoxGeometry(w - 0.6, 0.5, d - 0.6).translate(0, -0.25, 0)), TS.dome_frame));
    B.P(M.dark, T(new THREE.BoxGeometry(w + 0.3, 0.14, d + 0.3).translate(0, h * 0.62, 0)));             // seam band, 0.15 m proud
    if (kit) for (let i = 0; i < 3; i++) B.P(M.frame, boxUV(THREE, T(new THREE.BoxGeometry(1 + r() * 1.6, 0.6 + r() * 0.8, 1 + r()).translate((r() - 0.5) * (w - 3), h + 0.4, (r() - 0.5) * (d - 3))), TS.dome_frame));
    for (let i = 0; i < win; i++) { const wx = -w / 2 + w * (i + 0.5) / win, lit = r() < 0.65;
      B.P(lit ? M.window : M.dark, T(new THREE.BoxGeometry(1.1, 0.6, 0.5).translate(wx, h * 0.45, d / 2))); }   // half sunk, 0.25 m proud
  }
  // glass corridor (timelapse): white tube on the ground line, ribs every 3 m, lit window strip along the camera side
  function corridor([x0, z0], [x1, z1]) {
    const L = Math.hypot(x1 - x0, z1 - z0), a = Math.atan2(-(z1 - z0), x1 - x0), R = plan.tubeR, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    const y = Math.min(gy(x0, z0), gy(x1, z1), gy(cx, cz)) + plan.tubeY - 0.6, tr = new THREE.Matrix4().makeRotationY(a).setPosition(cx, y, cz), T = g => g.applyMatrix4(tr);
    B.P(M.hab, boxUV(THREE, T(new THREE.CylinderGeometry(R, R, L, high ? 20 : 12, 1, true).rotateZ(Math.PI / 2)), TS.habitat_panel));
    const nr = Math.round(L / 3);
    for (let i = 0; i <= nr; i++) B.P(M.frame, boxUV(THREE, T(new THREE.CylinderGeometry(R + 0.16, R + 0.16, 0.35, high ? 20 : 12, 1, true).rotateZ(Math.PI / 2).translate(-L / 2 + L * i / nr, 0, 0)), TS.dome_frame));
    for (const s of [-1, 1]) B.P(M.window, T(new THREE.BoxGeometry(L - 2, 0.32, 0.3).translate(0, 0.3, s * (R - 0.05))));
    B.P(M.frame, boxUV(THREE, T(new THREE.BoxGeometry(L, 0.8, R * 1.6).translate(0, -R + 0.1, 0)), TS.dome_frame));
  }
  function mast(x, z, h) {
    const y = gy(x, z);
    B.P(M.frame, boxUV(THREE, new THREE.CylinderGeometry(0.12, 0.2, h, 6, 1, true).translate(x, y + h / 2, z), TS.dome_frame));
    B.P(M.frame, boxUV(THREE, new THREE.CylinderGeometry(0.9, 0.2, 0.4, 10).rotateZ(0.6).translate(x + 0.4, y + h * 0.82, z), TS.dome_frame));
    B.P(M.beacon, new THREE.SphereGeometry(0.22, 6, 4).translate(x, y + h + 0.2, z));
  }
  // ---------------------------------------------------------------- layout: the timelapse city plan (foot-model-plan.js)
  // hub dome + four outer domes on glass corridors; the small hab domes, streetlights, rovers and figures are in foot-model-life.js
  const view = d => Math.abs(Math.atan2(d.x, -d.z)) < 0.36;              // planted only where the lens can see in
  plan.domes.forEach((d, i) => dome(d.x, d.z, d.R, d.hub ? (high ? 6 : 4) : (high ? 4 : 2), { green: view(d) && (high || i < 2) }));
  for (const t of plan.tubes) corridor(t.from, t.to);
  for (const f of plan.fabs) unit(f.x, f.z, f.w, f.h, f.d, { win: 3, ry: f.ry, kit: false });
  const hub = plan.domes[0];
  mast(hub.x + hub.R + 6, hub.z + 4, 16); mast(hub.x - hub.R - 4, hub.z + 10, 11); mast(plan.build[0] + 22, plan.build[1] - 6, 12);

  // ---------------------------------------------------------------- pressurised rover, parked on the outer ring road's verge
  const rover = (() => { const [x, z] = plan.ring(211, 3.3), [x2, z2] = plan.ring(211, 3.32); return { x, z, ry: Math.atan2(-(z2 - z), x2 - x) + 0.25 }; })();   // parked on the outer ring's verge
  { const y = gy(rover.x, rover.z), tr = new THREE.Matrix4().makeRotationY(rover.ry).setPosition(rover.x, y, rover.z), T = g => g.applyMatrix4(tr), V2 = THREE.Vector2;
    const side = new THREE.Shape([[-2.8, 0.75], [2.4, 0.75], [2.95, 1.05], [3.0, 1.6], [2.55, 2.35], [-2.5, 2.45], [-2.85, 2.2]].map(p => new V2(...p)));
    B.P(M.rover, boxUV(THREE, T(extrude(THREE, side, 2.3, high ? 0.08 : 0, 1)), TS.rover_paint));
    B.P(M.dark, T(extrude(THREE, new THREE.Shape([[2.48, 1.6], [2.9, 1.62], [2.5, 2.3], [1.4, 2.36], [1.4, 1.6]].map(p => new V2(...p))), 2.7, 0)));   // canopy glass, clears the body bevel
    B.P(M.dark, T(new THREE.BoxGeometry(5.2, 0.3, 2.2).translate(-0.1, 0.62, 0)));                               // chassis
    for (const wx of [-2, 0, 2]) for (const s of [-1, 1]) B.P(M.dark, T(new THREE.CylinderGeometry(0.58, 0.58, 0.45, 12).rotateX(Math.PI / 2).translate(wx, 0.58, s * 1.32)));
    B.P(M.solar, T(new THREE.BoxGeometry(3.4, 0.06, 2.0).translate(-0.9, 2.55, 0)));
    B.P(M.frame, T(new THREE.CylinderGeometry(0.05, 0.05, 1.2, 5).translate(-2.2, 3.0, 0.7)));
    B.P(M.frame, T(new THREE.BoxGeometry(0.3, 0.22, 0.3).translate(-2.2, 3.65, 0.7)));
    for (const s of [-1, 1]) B.P(M.lamp, T(new THREE.BoxGeometry(0.06, 0.12, 0.3).translate(3.0, 1.25, s * 0.85)));
    B.P(M.beacon, T(new THREE.SphereGeometry(0.1, 6, 4).translate(-2.2, 3.85, 0.7)));
  }

  planter.flush();
  return { domes, rover, big: domes[0] };
}
