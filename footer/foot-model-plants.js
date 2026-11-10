// D6.1 footer greenhouse planting: real trunks and branches (bark, merged) and alpha-tested leaf cards (one merged
// mesh, one draw call). Species: tall broadleaf trees (branching, many leaf-cluster lobes), palms and tree ferns
// (arching frond strips), shrubs and ground cover. Card normals point out of each crown so lobes shade as volumes,
// and vertex colour carries tint x crown-depth occlusion, so the backlight breaks into dappled bright and dark.
import { rng } from './foot-model-kit.js';

// leaf atlas: left half a broadleaf cluster, right half a frond (rib along v). RGB = leaf albedo, A = cutout.
export function leafAtlas(THREE) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 256; const x = c.getContext('2d'), f = rng(5);
  const leaf = (px, py, len, wid, ang, l) => {
    x.save(); x.translate(px, py); x.rotate(ang);
    x.fillStyle = `hsl(${88 + f() * 30}, ${42 + f() * 22}%, ${l}%)`;
    x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(wid, len * 0.45, 0, len); x.quadraticCurveTo(-wid, len * 0.45, 0, 0); x.fill();
    x.strokeStyle = `hsla(80, 40%, ${l + 12}%, 0.6)`; x.lineWidth = 1; x.beginPath(); x.moveTo(0, 1); x.lineTo(0, len * 0.9); x.stroke();
    x.restore();
  };
  // cluster: twigs then ~70 leaves, darker toward the middle (self shadow), lighter at the rim
  x.strokeStyle = '#3b2a1a'; x.lineWidth = 3;
  for (let i = 0; i < 7; i++) { const a = f() * 6.283; x.beginPath(); x.moveTo(128, 128); x.lineTo(128 + Math.cos(a) * 90, 128 + Math.sin(a) * 90); x.stroke(); }
  for (let i = 0; i < 70; i++) { const a = f() * 6.283, rr = 20 + Math.sqrt(f()) * 85, px = 128 + Math.cos(a) * rr, py = 128 + Math.sin(a) * rr;
    leaf(px, py, 26 + f() * 18, 9 + f() * 6, a - Math.PI / 2 + (f() - 0.5) * 1.2, 22 + rr / 110 * 26 + f() * 8); }
  // frond: rib up the cell, paired leaflets angled forward, tapering to the tip
  x.strokeStyle = '#4c5a26'; x.lineWidth = 4; x.beginPath(); x.moveTo(384, 252); x.quadraticCurveTo(388, 120, 384, 6); x.stroke();
  for (let i = 0; i < 30; i++) { const t = i / 29, py = 246 - t * 236, L = 110 * Math.sin(Math.PI * (0.12 + 0.86 * t)) * (1 - 0.35 * t) + 8;
    for (const s of [-1, 1]) leaf(384, py, L, 5 + 3 * (1 - t), s * (Math.PI / 2 + 0.55) + Math.PI, 26 + f() * 18); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; t.generateMipmaps = true;
  return t;
}

export function makePlanter({ THREE, B, M, high, seed = 91 }) {
  const r = rng(seed), V3 = THREE.Vector3, U = { cluster: [0, 0.5], frond: [0.5, 1] };
  const P = [], N = [], UV = [], C = [];
  const push = (p, n, u, v, c) => { P.push(p.x, p.y, p.z); N.push(n.x, n.y, n.z); UV.push(u, v); C.push(c[0], c[1], c[2]); };
  // one quad: centre, half axes a (u) and b (v), normal n, uv rect, colour
  const quad = (o, a, b, n, [u0, u1], c) => {
    const p00 = o.clone().sub(a).sub(b), p10 = o.clone().add(a).sub(b), p11 = o.clone().add(a).add(b), p01 = o.clone().sub(a).add(b);
    for (const [p, u, v] of [[p00, u0, 0], [p10, u1, 0], [p11, u1, 1], [p00, u0, 0], [p11, u1, 1], [p01, u0, 1]]) push(p, n, u, v, c);
  };
  const randDir = () => { const z = r() * 2 - 1, a = r() * 6.283, s = Math.sqrt(1 - z * z); return new V3(Math.cos(a) * s, z, Math.sin(a) * s); };
  const tint = (base, k) => base.map((v, i) => v * k * (0.88 + r() * 0.24) * (i === 2 ? 0.9 + r() * 0.2 : 1));

  // leaf-cluster lobe: cards spread through an ellipsoid, biased to its surface, normals out of the lobe
  function lobe(c, rad, n, base, sz, squash = 0.75) {
    for (let i = 0; i < n; i++) {
      const d = randDir(), k = 0.45 + 0.55 * Math.pow(r(), 0.45), p = c.clone().add(new V3(d.x * rad * k, d.y * rad * k * squash, d.z * rad * k));
      const nn = d.clone().multiplyScalar(0.85).add(randDir().multiplyScalar(0.35)).normalize();
      const a = new V3().crossVectors(nn, Math.abs(nn.y) > 0.9 ? new V3(1, 0, 0) : new V3(0, 1, 0)).normalize(), b = new V3().crossVectors(nn, a);
      const ang = r() * 6.283, s = sz * (0.75 + r() * 0.5), aa = a.clone().multiplyScalar(Math.cos(ang)).addScaledVector(b, Math.sin(ang)).multiplyScalar(s), bb = nn.clone().cross(aa);
      const occ = 0.35 + 0.65 * k * (0.6 + 0.4 * Math.max(0, d.y + 0.3)); // inner and underside cards darker
      quad(p, aa, bb, nn, U.cluster, tint(base, occ));
    }
  }
  // arching frond strip: rises from the crown then droops, segments follow the curve, flat side up
  function frond(base0, dir, len, wid, droop, colour) {
    const segs = high ? 5 : 3, side = new V3().crossVectors(dir, new V3(0, 1, 0)).normalize();
    let p = base0.clone(); const pts = [p.clone()];
    for (let i = 1; i <= segs; i++) { const t = i / segs; p = base0.clone().addScaledVector(dir, len * t).add(new V3(0, len * (0.35 * t - droop * t * t), 0)); pts.push(p.clone()); }
    for (let i = 0; i < segs; i++) {
      const a = pts[i], b = pts[i + 1], w0 = wid * Math.sin(Math.PI * (0.15 + 0.8 * i / segs)), w1 = wid * Math.sin(Math.PI * (0.15 + 0.8 * (i + 1) / segs));
      const tng = b.clone().sub(a).normalize(), n = new V3().crossVectors(side, tng).normalize(); if (n.y < 0) n.negate();
      const v0 = i / segs, v1 = (i + 1) / segs, [u0, u1] = U.frond, c = tint(colour, 0.75 + 0.35 * (i / segs));
      const A0 = a.clone().addScaledVector(side, -w0), A1 = a.clone().addScaledVector(side, w0), B0 = b.clone().addScaledVector(side, -w1), B1 = b.clone().addScaledVector(side, w1);
      for (const [q, u, v] of [[A0, u0, v0], [A1, u1, v0], [B1, u1, v1], [A0, u0, v0], [B1, u1, v1], [B0, u0, v1]]) push(q, n, u, v, c);
    }
  }
  // tapered bark segment a -> b
  const limb = (a, b, r0, r1, seg = 6) => {
    const len = a.distanceTo(b), g = new THREE.CylinderGeometry(r1, r0, len, seg, 1, true);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new V3(0, 1, 0), b.clone().sub(a).normalize())).translate((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
    B.P(M.soil, g);   // bark shares the dark soil material: no extra draw call
  };

  const GREENS = [[0.34, 0.56, 0.2], [0.42, 0.6, 0.18], [0.28, 0.5, 0.26], [0.5, 0.58, 0.2], [0.3, 0.46, 0.18]];
  const dens = high ? 1.5 : 0.55;

  function broadleaf(x, y, z, H) {
    const base = GREENS[Math.floor(r() * GREENS.length)], trunkH = H * (0.38 + r() * 0.12), top = new V3(x + (r() - 0.5) * 0.6, y + trunkH, z + (r() - 0.5) * 0.6);
    limb(new V3(x, y, z), top, 0.22 + H * 0.012, 0.13, high ? 7 : 5);
    const nb = 3 + Math.floor(r() * 3), crownR = H * 0.32;
    lobe(top.clone().add(new V3(0, H * 0.42, 0)), crownR * 0.7, Math.round(46 * dens), base, 1.1 + H * 0.03);   // crown top
    for (let i = 0; i < nb; i++) {
      const a = i / nb * 6.283 + r() * 0.8, out = crownR * (0.55 + r() * 0.45), up = H * (0.2 + r() * 0.3);
      const end = top.clone().add(new V3(Math.cos(a) * out, up, Math.sin(a) * out)), mid = top.clone().lerp(end, 0.5).add(new V3(0, up * 0.15, 0));
      limb(top, mid, 0.12, 0.08, 5); limb(mid, end, 0.08, 0.04, 4);
      lobe(end, crownR * (0.45 + r() * 0.25), Math.round((28 + r() * 16) * dens), base, 0.9 + H * 0.03);
    }
  }
  function palm(x, y, z, H, fern = false) {
    const lean = new V3((r() - 0.5) * 0.35, 1, (r() - 0.5) * 0.35).normalize(), segs = high ? 5 : 3, col = fern ? [0.3, 0.5, 0.16] : [0.44, 0.56, 0.2];
    let a = new V3(x, y, z);
    for (let i = 1; i <= segs; i++) { const b = new V3(x, y, z).addScaledVector(lean, H * i / segs); b.x += lean.x * H * 0.15 * (i / segs) ** 2;
      limb(a, b, fern ? 0.28 : 0.2, fern ? 0.24 : 0.16, 6); a = b; }
    const nf = Math.round((fern ? 14 : 12) * (high ? 1 : 0.6));
    for (let i = 0; i < nf; i++) { const ang = i / nf * 6.283 + r() * 0.3, d = new V3(Math.cos(ang), 0, Math.sin(ang));
      frond(a.clone().add(new V3(0, 0.1, 0)), d, (fern ? 2.4 : 3.6) * (0.8 + r() * 0.4), fern ? 0.55 : 0.7, fern ? 0.55 : 0.85, col); }
  }
  function shrub(x, y, z, s) {
    const base = GREENS[Math.floor(r() * GREENS.length)].map(v => v * 0.9);
    lobe(new V3(x, y + s * 0.45, z), s, Math.round(16 * s * dens + 4), base, 0.55 + s * 0.15, 0.6);
  }
  function cover(x, y, z, rad) { // low ground cover: flat-ish small cards
    const n = Math.round(rad * rad * 3 * dens + 3), base = [0.3, 0.48, 0.18];
    for (let i = 0; i < n; i++) { const a = r() * 6.283, rr = Math.sqrt(r()) * rad, p = new V3(x + Math.cos(a) * rr, y + 0.12 + r() * 0.15, z + Math.sin(a) * rr);
      const nn = new V3((r() - 0.5) * 0.6, 1, (r() - 0.5) * 0.6).normalize(), aa = new V3().crossVectors(nn, new V3(1, 0, 0)).normalize().multiplyScalar(0.35 + r() * 0.2), bb = nn.clone().cross(aa);
      quad(p, aa, bb, nn, U.cluster, tint(base, 0.6 + r() * 0.3)); }
  }

  // plant one dome interior. y0 = floor level, R = dome radius
  function plant(cx, y0, cz, R) {
    const roof = rr => Math.sqrt(Math.max(0, R * R - rr * rr)) * 0.88, at = (rr, a) => [cx + Math.cos(a) * rr, cz + Math.sin(a) * rr];
    const big = R > 12, nTree = big ? (high ? 7 : 4) : (high ? 3 : 2), nPalm = big ? (high ? 5 : 3) : 1, nFern = big ? (high ? 4 : 2) : 1;
    for (let i = 0; i < nTree; i++) { const rr = R * (0.12 + 0.55 * r()), a = r() * 6.283, [x, z] = at(rr, a); broadleaf(x, y0, z, Math.min(roof(rr) * 0.92, R * (0.45 + r() * 0.35))); }
    for (let i = 0; i < nPalm; i++) { const rr = R * (0.2 + 0.55 * r()), a = r() * 6.283, [x, z] = at(rr, a); palm(x, y0, z, Math.min(roof(rr) - 3, R * (0.35 + r() * 0.3))); }
    for (let i = 0; i < nFern; i++) { const rr = R * (0.3 + 0.55 * r()), a = r() * 6.283, [x, z] = at(rr, a); palm(x, y0, z, 1.2 + r() * 1.6, true); }
    const nS = Math.round(R * (high ? 2.2 : 1));
    for (let i = 0; i < nS; i++) { const rr = R * Math.sqrt(r()) * 0.9, [x, z] = at(rr, r() * 6.283); shrub(x, y0, z, 0.6 + r() * 1.1); }
    const nC = Math.round(R * (high ? 1.4 : 0.6));
    for (let i = 0; i < nC; i++) { const rr = R * Math.sqrt(r()) * 0.92, [x, z] = at(rr, r() * 6.283); cover(x, y0, z, 0.8 + r() * 1.4); }
  }

  // all cards as one geometry, into the foliage bucket (merged with nothing else: one draw call)
  function flush() {
    if (!P.length) return 0;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(UV, 2)); g.setAttribute('color', new THREE.Float32BufferAttribute(C, 3));
    B.P(M.foliage, g); return P.length / 9;
  }
  return { plant, flush };
}
