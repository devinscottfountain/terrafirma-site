// D6.1 footer modelling kit: seeded noise, the shared terrain height field, UV helpers in metres, a geodesic
// hemisphere and a per-material part bucket. Reuses the D6 merge / box UV / texture binder kit.
import { mergeAll, boxUV, rrect, extrude } from '../kit/hero-model-kit.js';
export { mergeAll, boxUV, rrect, extrude };

// metres per UV repeat, per role (matches d61/foot-tex.js). Geometry UVs are baked at these; applyTextures rescales if a set differs.
export const TS = { regolith: 4, mars_rock: 3, dome_glass: 1.5, dome_frame: 0.5, foliage: 0.6, habitat_panel: 2, stainless: 1, rover_paint: 1 };

export function rng(seed = 7) {
  return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// 2D value noise + fbm, deterministic
const h2 = (x, y) => { let n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return n - Math.floor(n); };
export function vnoise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = h2(xi, yi), b = h2(xi + 1, yi), c = h2(xi, yi + 1), d = h2(xi + 1, yi + 1);
  return (a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v) * 2 - 1;
}
export function fbm(x, y, o = 4) { let s = 0, a = 0.5, f = 1; for (let i = 0; i < o; i++) { s += a * vnoise(x * f, y * f); f *= 2.03; a *= 0.5; } return s; }
const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
export { ss as smoothstep };

// Layout (metres): the compositor's camera (eye 0, 1.7, 0) stands on a low rise near the origin looking down -z. Settlement pad 200..440 m out,
// ridge line rises 1.3..2.1 km out. Everything that sits on the ground samples this.
export const SITE = { z0: -200, z1: -440, x0: -260, x1: 260 };
export function height(x, z) { return rawHeight(x, z) - EYE_GROUND; }
function rawHeight(x, z) {
  const d = -z;
  const rise = 6.8 * (1 - ss(12, 150, d)) * (1 - 0.25 * ss(30, 90, Math.abs(x)));                        // the rise we stand on
  const mid = 1.6 * fbm(x / 70 + 3.1, z / 55) * ss(20, 60, d) * (1 - ss(260, 600, d))                      // gentle swales
            + 2.2 * Math.max(0, fbm(x / 140, z / 90 + 7) + 0.1) * ss(60, 120, d) * (1 - ss(170, 210, d));    // low dark bank before the pad
  const pad = ss(150, 210, d) * (1 - ss(470, 600, d)) * (1 - ss(260, 360, Math.abs(x)));                  // flatten the settlement pad
  const fine = (0.5 * fbm(x / 9, z / 9, 3) + 0.14 * fbm(x / 2.6 + 5, z / 2.6, 2)) * (1 - ss(150, 400, d));
  const far = 3.5 * fbm(x / 260 + 11, z / 260) * ss(400, 900, d);
  const rx = x / 520, ridge = ss(1250, 2100, d) * (40 + 26 * fbm(rx + 2.3, 0.5) + 11 * fbm(rx * 4.1 + 9, 1.7) + 4 * fbm(rx * 13, d / 300));
  return rise + (mid + fine) * (1 - 0.85 * pad) + far + ridge;
}
const EYE_GROUND = rawHeight(0, 0);   // ground under the compositor's eye (0, 1.7, 0) is y = 0

// cylindrical UVs in metres for a lathe / cylinder around +y (u around, v up)
export function cylUV(geo, R, s) {
  const p = geo.attributes.position, uv = geo.attributes.uv, src = uv.array.slice();
  for (let i = 0; i < p.count; i++) uv.setXY(i, src[i * 2] * Math.PI * 2 * R / s, p.getY(i) / s);
  geo.userData.texScale = s; return geo;
}

// part buckets: P(mat, geo) collects, flush(group) merges one mesh per material
export function buckets(THREE) {
  const parts = new Map();
  return {
    P(m, g) { (parts.get(m) || parts.set(m, []).get(m)).push(g); return g; },
    flush(group, tag) {
      const out = [];
      for (const [m, gs] of parts) {
        const g = mergeAll(THREE, gs); g.computeBoundingSphere();
        if (gs.some(x => x.attributes.color)) { // carry vertex colours (white where missing)
          const c = new Float32Array(g.attributes.position.count * 3); let o = 0;
          for (const x of gs) { const n = (x.index ? x.index.count : x.attributes.position.count), cc = x.attributes.color;
            if (cc) { const ng = x.index ? x.toNonIndexed() : x; c.set(ng.attributes.color.array, o * 3); } else c.fill(1, o * 3, (o + n) * 3); o += n; }
          g.setAttribute('color', new THREE.BufferAttribute(c, 3));
        }
        const mesh = new THREE.Mesh(g, m); mesh.userData.part = tag; mesh.userData.texScale = m.userData.texScale || 1;
        group.add(mesh); out.push(mesh);
      }
      parts.clear(); return out;
    }
  };
}

// vertex-up icosahedral hemisphere (even frequency gives an exact equator): faces (outward winding) + unique edges
export function geodesic(THREE, freq) {
  const V3 = THREE.Vector3, ico = new THREE.IcosahedronGeometry(1, freq - 1), t = (1 + Math.sqrt(5)) / 2;
  ico.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new V3(-1, t, 0).normalize(), new V3(0, 1, 0)));
  const p = ico.attributes.position, faces = [], vmap = new Map(), verts = [], edges = new Map();
  const vid = v => { const k = `${Math.round(v.x * 1e4)},${Math.round(v.y * 1e4)},${Math.round(v.z * 1e4)}`; let i = vmap.get(k); if (i === undefined) { i = verts.length; verts.push(v.clone()); vmap.set(k, i); } return i; };
  for (let i = 0; i < p.count; i += 3) {
    const f = [0, 1, 2].map(k => { const v = new V3().fromBufferAttribute(p, i + k); if (Math.abs(v.y) < 1e-4) v.y = 0; return v; });
    const c = f[0].clone().add(f[1]).add(f[2]).divideScalar(3); if (c.y <= 1e-4) continue;
    if (new V3().subVectors(f[1], f[0]).cross(new V3().subVectors(f[2], f[0])).dot(c) < 0) f.reverse();
    const ids = f.map(vid); faces.push({ v: f, c });
    for (let k = 0; k < 3; k++) { const a = ids[k], b = ids[(k + 1) % 3], ek = a < b ? a + '_' + b : b + '_' + a; if (!edges.has(ek)) edges.set(ek, [a, b]); }
  }
  ico.dispose(); return { faces, verts, edges: [...edges.values()] };
}

// raw triangle soup -> BufferGeometry (flat normals), optional per-vertex colour
export function soup(THREE, P, C) {
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
  if (C) g.setAttribute('color', new THREE.Float32BufferAttribute(C, 3));
  g.computeVertexNormals(); g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(P.length / 3 * 2), 2)); return g;
}

// smooth normals on a non-indexed geometry: average face normals over vertices that share a position
export function smoothNormals(geo) {
  geo.computeVertexNormals();
  const p = geo.attributes.position, n = geo.attributes.normal, acc = new Map(), key = i => `${Math.round(p.getX(i) * 1e3)},${Math.round(p.getY(i) * 1e3)},${Math.round(p.getZ(i) * 1e3)}`;
  for (let i = 0; i < p.count; i++) { const k = key(i), a = acc.get(k) || acc.set(k, [0, 0, 0]).get(k); a[0] += n.getX(i); a[1] += n.getY(i); a[2] += n.getZ(i); }
  for (let i = 0; i < p.count; i++) { const a = acc.get(key(i)), l = Math.hypot(a[0], a[1], a[2]) || 1; n.setXYZ(i, a[0] / l, a[1] / l, a[2] / l); }
  return geo;
}
