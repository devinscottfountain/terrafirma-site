// habitat.js: higher-fidelity Mars colony buildings for the Jezero Base timelapse in main.js.
// Everything is procedural (no image textures) and built in unit space so main.js can keep instancing with the
// matrices it already computes. Geodesic shells are a 4V icosahedral hemisphere (vertex-up, so the equator is exact):
// real strut + hub geometry, inset opaque panels and inset mirror-glass panels. Which panels are glass is decided
// per instance on the GPU (hash of the instance's x/z position), so one InstancedMesh pair gives four dome types:
// mostly glass, opaque with a skylight crown, opaque with a window band, mixed. Vestibules and antennas also toggle
// per instance by collapsing their vertices; matching customDepthMaterials keep the shadows honest.
//
//   import { createHabitatAssets, createMarsEnv } from './habitat.js';
//   const env = createMarsEnv({ THREE, renderer });
//   const A = createHabitatAssets({ THREE, renderer, envMap: env });
//   A.night.value = 0..1   // every night glow (glass, windows, lamps, dome interiors) reads this
//
// Units: 1 unit = 1 m once main.js applies its scale. Local up is +y.
//
// colonyLayout({ high, rockets }): the Jezero plan as plain data (same numbers and same seeded stream as main.js), for the
// D6.1 footer and the colony life in machines.js. See the API note in d61/CINEMA-NOTES.md.

// D6.1 cinematic look (staggered lights at dusk): on with D5_CFG.cine, or by default whenever 6.1's rockets flag is set.
// D5 and D6 never set either, so their programs and pixels are unchanged.
export const CINE = true; // the film is always the cinematic look

// ---------------------------------------------------------------------------------------------------------------
// city plan. Mirrors populateColony() in main.js: rings, 8 avenues, hub + 4 outer domes, glass corridors, hab lots
// (seed 7 Park-Miller, the stream main.js starts the colony with), fab sheds, the solar farm, the old pad, the rocket sites.
export function colonyLayout({ high = true, rockets = true } = {}) {
  const rnd = (() => { let a = 7; return () => ((a = (a * 16807) % 2147483647) / 2147483647); })();
  const RINGS = [62, 132, 204], AVE = 8, ROCK_SITES = { land: [[55, -150], [15, -168]], build: [-25, -100] };
  const domes = [{ x: 0, z: 0, r: 20, bt: 0.02, kind: 'hub' }], tubes = [];
  for (let k = 0; k < 4; k++) { const a = Math.PI / 8 + k * Math.PI / 2; domes.push({ x: Math.cos(a) * 96, z: Math.sin(a) * 96, r: 15, bt: 0.26 + k * 0.08, kind: 'outer' }); tubes.push({ a, r0: 19, len: 62, y: 2.6, radius: 2.4, bt: 0.12 + k * 0.07 }); }
  const angD = (a, b) => Math.abs(((a - b) % (Math.PI * 2) + Math.PI * 3) % (Math.PI * 2) - Math.PI);
  const habs = [], fabs = [];
  for (let r = 34; r < 238; r += 14) {
    let a = r * 0.11;
    while (a < r * 0.11 + Math.PI * 2 - 0.05) {
      const rd = Math.min(6.6, 2.6 + rnd() * 3.2 + 5 * Math.exp(-r / 70)), x = Math.cos(a) * r, z = Math.sin(a) * r;
      const nearAve = [...Array(AVE)].some((_, k) => angD(a, k * Math.PI / 4) * r < rd + 4);
      const nearTube = r < 86 && tubes.some(t => angD(a, t.a) * r < rd + 3.5);
      const clear = !(nearAve || nearTube || RINGS.some(R => Math.abs(r - R) < rd + 3.5) || domes.some(d => Math.hypot(x - d.x, z - d.z) < d.r + rd + 3));
      if (clear && rnd() > 0.1) {
        const bt = 0.06 + (r / 238) * 0.58 + rnd() * 0.08;
        if (r > 175 && rnd() < 0.28) fabs.push({ x, z, w: 8 + rnd() * 4, d: 5, h: 2.5 + rnd() * 2.5, rot: a, bt });
        else habs.push({ x, z, r: rd, ys: 0.72 + rnd() * 0.35, rot: rnd() * 6.28, bt, seed: rnd() * 50 });
      }
      a += (2 * rd + 2.6) / r;
    }
  }
  // the same skips main.js applies: every other hab in build order on the low tier, and the rocket zones kept clear
  const order = [...habs].sort((a, b) => a.bt - b.bt);
  if (!high) order.forEach((l, i) => (l.skip = i % 2 === 1));
  if (rockets) order.forEach(l => { if (ROCK_SITES.land.some(([x, z]) => Math.hypot(l.x - x, l.z - z) < l.r + 16) || Math.hypot(l.x - ROCK_SITES.build[0], l.z - ROCK_SITES.build[1]) < l.r + 30) l.skip = true; });
  // dome type per hab, the same hash the shell shader uses (0 mostly glass, 1 skylight crown, 2 window band, 3 mixed)
  const ih = (x, z) => { const s = Math.sin(x * 0.1271 + z * 0.3117 + 1.7) * 43758.5453; return s - Math.floor(s); };
  habs.forEach(l => { const h = ih(l.x, l.z); l.type = h < 0.26 ? 0 : h < 0.56 ? 1 : h < 0.8 ? 2 : 3; l.h = l.r * l.ys; });
  const solar = [];
  for (let r = 262; r < 345; r += 4.2) for (let a = 0.25; a < 1.35; a += 3.2 / r) solar.push({ x: Math.cos(a) * r, z: Math.sin(a) * r, bt: 0.22 + (r - 262) / 83 * 0.22 + (a - 0.25) * 0.12 });
  return {
    units: 'm, colony space (+y up); bt = build start in city progress 0..1',
    rings: RINGS.map(r => ({ r, bt: 0.02 + r / 236 * 0.55 })),
    avenues: [...Array(AVE)].map((_, k) => ({ a: k * Math.PI / 4, r0: 20, r1: 250, bt: 0 })),
    domes, tubes, habs: habs.filter(l => !l.skip), fabs, solar: { r0: 262, r1: 345, a0: 0.25, a1: 1.35, panel: [3, 2.2], tilt: 0.5, cells: solar },
    oldPad: { x: Math.cos(-0.55) * 300, z: Math.sin(-0.55) * 300, r: 26 },
    ships: ROCK_SITES.land.map(([x, z]) => ({ x, z })), buildPad: { x: ROCK_SITES.build[0], z: ROCK_SITES.build[1], r: 16.5, tower: { x: ROCK_SITES.build[0] - 12, z: ROCK_SITES.build[1] + 10 } },
  };
}

const HASH = /* glsl */ `
float habInstHash(){
#ifdef USE_INSTANCING
  vec2 t = instanceMatrix[3].xz;
#else
  vec2 t = modelMatrix[3].xz;
#endif
  return fract(sin(dot(t, vec2(0.1271, 0.3117)) + 1.7) * 43758.5453);
}
// four dome types: frac = share of panels that are glass, w = weights for the (crown, band, random) panel scores
void habType(float h, out float frac, out vec3 w){
  if (h < 0.26)      { frac = 0.80; w = vec3(0.50, 0.00, 0.50); } // mostly glass
  else if (h < 0.56) { frac = 0.15; w = vec3(0.85, 0.00, 0.15); } // opaque, skylight crown
  else if (h < 0.80) { frac = 0.22; w = vec3(0.10, 0.75, 0.15); } // opaque, eye-level window band
  else               { frac = 0.44; w = vec3(0.20, 0.20, 0.60); } // mixed
}
float habHasVest(float h){ return step(0.42, fract(h * 7.31)); }
float habHasAnt(float h){ return step(0.62, fract(h * 3.77)); }
`;
// CINE only: each hab (and each room in it) switches on at its own point in the dusk, warm, then all ride up together
const LIT = /* glsl */ `
float habLit(float h, float j){ float t0 = 0.03 + 0.6 * fract(h * 13.7 + j); return smoothstep(t0, t0 + 0.04, night) * (0.55 + 0.45 * night); }
`;
const LITF = CINE ? LIT : ''; // prepended to fragment shaders after their night uniform
// env reflections fade at night (the env map is a static golden-hour capture); hemi/ambient are dimmed by main.js
const ENV_NIGHT = /* glsl */ `#include <lights_fragment_maps>
  iblIrradiance *= 1. - 0.9 * night; radiance *= 1. - 0.9 * night;`;

// ---------------------------------------------------------------------------------------------------------------
// procedural Mars sky -> PMREM: butterscotch gradient, bright sun with the blue Martian halo, dusty horizon band
export function createMarsEnv({ THREE, renderer, sunDir, night = 0 }) {
  const sd = (sunDir ? sunDir.clone() : new THREE.Vector3(-0.95, 0.24, -0.21)).normalize();
  const scene = new THREE.Scene(), geo = new THREE.SphereGeometry(10, 64, 32);
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, uniforms: { sunDir: { value: sd }, night: { value: night } },
    vertexShader: `varying vec3 vD; void main(){ vD = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,
    fragmentShader: /* glsl */ `uniform vec3 sunDir; uniform float night; varying vec3 vD;
    void main(){
      vec3 d = normalize(vD); float e = d.y, eu = clamp(e, 0., 1.), sd = max(dot(d, sunDir), 0.);
      float az = max(dot(normalize(d.xz + 1e-5), normalize(sunDir.xz + 1e-5)), 0.);
      vec3 sky = mix(vec3(0.92, 0.58, 0.33), vec3(0.30, 0.17, 0.10), pow(eu, 0.55));
      sky += vec3(1.0, 0.62, 0.34) * exp(-eu * 13.) * (0.30 + 0.70 * az * az);     // dusty horizon, brightest under the sun
      sky += vec3(1.0, 0.72, 0.46) * pow(sd, 6.) * 0.55;                            // forward scatter
      sky += vec3(0.32, 0.55, 1.0) * pow(sd, 48.) * 1.8;                            // blue halo
      sky += vec3(1.0, 0.95, 0.88) * smoothstep(0.99955, 0.99985, sd) * 90.;       // sun disc
      vec3 gnd = mix(vec3(0.46, 0.24, 0.13), vec3(0.13, 0.065, 0.035), smoothstep(0., 0.3, -e));
      gnd += vec3(1., 0.62, 0.35) * exp(min(e, 0.) * 22.) * 0.25 * (0.4 + 0.6 * az);
      vec3 c = mix(gnd, sky, smoothstep(-0.01, 0.01, e));
      vec3 nsky = mix(vec3(0.06, 0.045, 0.05), vec3(0.008, 0.009, 0.016), pow(eu, 0.45)) + vec3(0.2, 0.35, 0.7) * pow(sd, 10.) * 0.12;
      c = mix(c, mix(vec3(0.01, 0.007, 0.005), nsky, smoothstep(-0.01, 0.01, e)), night);
      gl_FragColor = vec4(c, 1.);
    }`
  });
  scene.add(new THREE.Mesh(geo, mat));
  const pm = new THREE.PMREMGenerator(renderer), rt = pm.fromScene(scene, 0, 0.1, 100);
  pm.dispose(); geo.dispose(); mat.dispose();
  rt.texture.userData.renderTarget = rt; // dispose with texture.userData.renderTarget.dispose()
  return rt.texture;
}

// ---------------------------------------------------------------------------------------------------------------
export function createHabitatAssets({ THREE, renderer, envMap = null, frameDetail = 'high' } = {}) {
  const V3 = THREE.Vector3;
  const night = { value: 0 };
  const tris = {};
  const mats = [];

  // tiny non-indexed geometry builder with custom attributes
  function builder(spec) {
    const P = [], N = [], A = {}; for (const k in spec) A[k] = [];
    const e1 = new V3(), e2 = new V3(), fn = new V3();
    const push = (p, n, at, i) => {
      P.push(p.x, p.y, p.z); N.push(n.x, n.y, n.z);
      for (const k in spec) {
        const s = spec[k]; let v = at[k]; if (typeof v === 'function') v = v(p, n); if (v === undefined) v = s === 1 ? 0 : [0, 0, 0];
        if (s === 1) A[k].push(Array.isArray(v) ? v[i] : v);
        else { const a = Array.isArray(v[0]) ? v[i] : v; for (let j = 0; j < s; j++) A[k].push(a[j] || 0); }
      }
    };
    const B = {
      tri(a, b, c, at = {}, out = null, normals = null) {
        e1.subVectors(b, a); e2.subVectors(c, a); fn.crossVectors(e1, e2).normalize();
        let o = [0, 1, 2]; if (out && fn.dot(out) < 0) { o = [0, 2, 1]; fn.negate(); }
        const v = [a, b, c]; for (const i of o) push(v[i], normals ? normals[i] : fn, at, i);
      },
      quad(a, b, c, d, at = {}, out = null) { B.tri(a, b, c, at, out); B.tri(a, c, d, at, out); },
      box(cx, cy, cz, sx, sy, sz, at = {}, skipBottom = true) {
        const g = new THREE.BoxGeometry(sx, sy, sz); g.translate(cx, cy, cz); B.geo(g, at, skipBottom ? n => n.y < -0.5 : null); g.dispose();
      },
      geo(g, at = {}, skip = null, flat = false) { // append any BufferGeometry (positions/normals already transformed)
        const ng = g.index ? g.toNonIndexed() : g, p = ng.attributes.position, nn = ng.attributes.normal;
        const a = new V3(), b = new V3(), c = new V3(), na = new V3(), nb = new V3(), nc = new V3();
        for (let i = 0; i < p.count; i += 3) {
          a.fromBufferAttribute(p, i); b.fromBufferAttribute(p, i + 1); c.fromBufferAttribute(p, i + 2);
          na.fromBufferAttribute(nn, i); nb.fromBufferAttribute(nn, i + 1); nc.fromBufferAttribute(nn, i + 2);
          if (skip && skip(na.clone().add(nb).add(nc).normalize())) continue;
          if (flat) { e1.subVectors(b, a); e2.subVectors(c, a); fn.crossVectors(e1, e2).normalize(); push(a, fn, at, 0); push(b, fn, at, 1); push(c, fn, at, 2); }
          else { push(a, na, at, 0); push(b, nb, at, 1); push(c, nc, at, 2); }
        }
        if (ng !== g) ng.dispose();
      },
      build() {
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
        for (const k in spec) g.setAttribute(k, new THREE.Float32BufferAttribute(A[k], spec[k]));
        g.computeBoundingSphere(); g.computeBoundingBox(); return g;
      },
    };
    return B;
  }
  const triCount = g => (g.index ? g.index.count : g.attributes.position.count) / 3;
  const rng = (s => () => ((s = (s * 16807) % 2147483647) / 2147483647))(11);

  // vertex-up icosahedral hemisphere (even frequency -> exact equator)
  function geodesic(freq) {
    const ico = new THREE.IcosahedronGeometry(1, freq - 1), t = (1 + Math.sqrt(5)) / 2;
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
  // strut along a chord: trapezoid section (two slopes + flat top) or a 2-face roof for the low detail frame
  function strut(B, a, b, R, w, h1, h0, at, low = false) {
    const A = a.clone().multiplyScalar(R), Bv = b.clone().multiplyScalar(R);
    const d = Bv.clone().sub(A).normalize(), n0 = A.clone().add(Bv).normalize(), s = new V3().crossVectors(d, n0).normalize(), n = new V3().crossVectors(s, d).normalize();
    const pr = low ? [n.clone().multiplyScalar(-h0).addScaledVector(s, w), n.clone().multiplyScalar(h1), n.clone().multiplyScalar(-h0).addScaledVector(s, -w)]
      : [n.clone().multiplyScalar(-h0).addScaledVector(s, w), n.clone().multiplyScalar(h1).addScaledVector(s, w * 0.5), n.clone().multiplyScalar(h1).addScaledVector(s, -w * 0.5), n.clone().multiplyScalar(-h0).addScaledVector(s, -w)];
    for (let k = 0; k < pr.length - 1; k++) B.quad(A.clone().add(pr[k]), Bv.clone().add(pr[k]), Bv.clone().add(pr[k + 1]), A.clone().add(pr[k + 1]), at, pr[k].clone().add(pr[k + 1]));
  }
  function hub(B, v, R, size, height, at, sides = 4) {
    const n = v.clone().normalize(), c = n.clone().multiplyScalar(R - 0.004), t1 = new V3(0, 1, 0);
    if (Math.abs(n.y) > 0.9) t1.set(1, 0, 0); t1.cross(n).normalize(); const t2 = n.clone().cross(t1), apex = n.clone().multiplyScalar(R + height), ph = rng() * 6.28;
    const ring = [...Array(sides)].map((_, i) => { const a = ph + i / sides * Math.PI * 2; return c.clone().addScaledVector(t1, Math.cos(a) * size).addScaledVector(t2, Math.sin(a) * size); });
    for (let i = 0; i < sides; i++) B.tri(ring[i], ring[(i + 1) % sides], apex, at, n);
  }
  const jitterN = (n, amt) => n.clone().add(new V3(rng() - 0.5, rng() - 0.5, rng() - 0.5).multiplyScalar(amt)).normalize();
  const BARY = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];

  // shared material plumbing: every patched material gets its own program cache key
  function patch(mat, key, fn) {
    mat.onBeforeCompile = sh => { sh.uniforms.night = night; fn(sh);
      // cine: geometric specular AA (GRADE note) so far struts and glass facets stop sparkling
      if (CINE) sh.fragmentShader = sh.fragmentShader.replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
        { vec3 dnx = dFdx(normal), dny = dFdy(normal); float k = min(.18, 2. * max(dot(dnx, dnx), dot(dny, dny))); roughnessFactor = sqrt(roughnessFactor * roughnessFactor + k); }`); };
    mat.customProgramCacheKey = () => 'hab-' + key;
    mats.push(mat); return mat;
  }
  function depthMat(key, header, body) {
    const m = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking });
    m.onBeforeCompile = sh => { sh.vertexShader = header + HASH + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n' + body); };
    m.customProgramCacheKey = () => 'habdepth-' + key; return m;
  }

  // ============================== hab dome: shell + glass + frame ==============================
  const HG = geodesic(4);
  const SH_R = 0.995, PANEL_INSET = 0.9, FRAME_R = 0.985; // main.js overscales the frame by 1.015 -> struts land on R~1.0
  const panelSel = c => [1 - c.y, Math.min(1, Math.abs(c.y - 0.36) * 2.6), rng()];
  // panels shade with the sphere's own (radial) normal, so a dome reads round instead of faceted; the glass keeps a hint of panel
  // misalignment (each panel catches a slightly different patch of sky). Two LODs: far = one flat panel per face; near = each panel
  // split in four with its mid-edges pushed out to the sphere (a pillowed cushion), so silhouettes stay round up close.
  const shellB = builder({ sel: 3, bary: 3, kind: 1 }), glassB = builder({ sel: 3, bary: 3, kind: 1 });
  const shellBH = builder({ sel: 3, bary: 3, kind: 1 }), glassBH = builder({ sel: 3, bary: 3, kind: 1 });
  const radial = p => p.clone().normalize(), tilt = (n, t) => n.clone().addScaledVector(t, 1).normalize();
  const MIDB = [[0.5, 0.5, 0], [0, 0.5, 0.5], [0.5, 0, 0.5]];
  HG.faces.forEach(f => {
    const pts = f.v.map(p => f.c.clone().lerp(p, PANEL_INSET).multiplyScalar(SH_R)), sel = panelSel(f.c);
    const jt = jitterN(f.c.clone().normalize(), 0.03).sub(f.c.clone().normalize()); // this panel's small tilt, shared by both LODs
    shellB.tri(pts[0], pts[1], pts[2], { sel, bary: BARY, kind: 0 }, f.c, pts.map(radial));
    glassB.tri(pts[0], pts[1], pts[2], { sel, bary: BARY, kind: 0 }, f.c, pts.map(p => tilt(radial(p), jt)));
    // near LOD: corners + mid-edges (pushed out to the shell radius, the cushion), 4 triangles, barycentrics of the whole panel
    const m = [[0, 1], [1, 2], [0, 2]].map(([a, b]) => pts[a].clone().add(pts[b]).normalize().multiplyScalar(SH_R * 0.997));
    const sub = [[pts[0], m[0], m[2], [BARY[0], MIDB[0], MIDB[2]]], [m[0], pts[1], m[1], [MIDB[0], BARY[1], MIDB[1]]], [m[2], m[1], pts[2], [MIDB[2], MIDB[1], BARY[2]]], [m[0], m[1], m[2], [MIDB[0], MIDB[1], MIDB[2]]]];
    for (const [a, b, c, bc] of sub) {
      shellBH.tri(a, b, c, { sel, bary: bc, kind: 0 }, f.c, [a, b, c].map(radial));
      glassBH.tri(a, b, c, { sel, bary: bc, kind: 0 }, f.c, [a, b, c].map(p => tilt(radial(p), jt)));
    }
  });
  // airlock vestibule on +x (kept on ~58% of habs): rounded-top tunnel, end cap, hatch door, lit porthole
  for (const SB of [shellBH, shellB]) {
    const prof = [[0.2, 0]]; for (let i = 0; i <= 6; i++) { const a = i / 6 * Math.PI; prof.push([0.2 * Math.cos(a), 0.2 + 0.2 * Math.sin(a)]); } prof.push([-0.2, 0]);
    const x0 = 0.7, x1 = 1.2, P = (x, [z, y]) => new V3(x, y, z);
    for (let i = 0; i < prof.length - 1; i++) {
      const m = [(prof[i][0] + prof[i + 1][0]) / 2, (prof[i][1] + prof[i + 1][1]) / 2 - 0.15];
      SB.quad(P(x0, prof[i]), P(x1, prof[i]), P(x1, prof[i + 1]), P(x0, prof[i + 1]), { kind: 1, bary: [0.3, 0.3, 0.3] }, new V3(0, m[1], m[0]));
    }
    const cc = new V3(x1, 0.17, 0);
    for (let i = 0; i < prof.length; i++) SB.tri(cc, P(x1, prof[i]), P(x1, prof[(i + 1) % prof.length]), { kind: 1, bary: [0.3, 0.3, 0.3] }, new V3(1, 0, 0));
    SB.quad(new V3(x1 + 0.006, 0.02, 0.11), new V3(x1 + 0.006, 0.02, -0.11), new V3(x1 + 0.006, 0.31, -0.11), new V3(x1 + 0.006, 0.31, 0.11), { kind: 2, bary: [0.3, 0.3, 0.3] }, new V3(1, 0, 0));
    SB.quad(new V3(x1 + 0.01, 0.2, 0.05), new V3(x1 + 0.01, 0.2, -0.05), new V3(x1 + 0.01, 0.27, -0.05), new V3(x1 + 0.01, 0.27, 0.05), { kind: 3, bary: [0.3, 0.3, 0.3] }, new V3(1, 0, 0));
    // side porthole on the tunnel
    SB.quad(new V3(0.98, 0.18, 0.203), new V3(1.06, 0.18, 0.203), new V3(1.06, 0.26, 0.203), new V3(0.98, 0.26, 0.203), { kind: 3, bary: [0.3, 0.3, 0.3] }, new V3(0, 0, 1));
  }
  const habShellGeo = shellB.build(), habGlassGeo = glassB.build(), habShellGeoHi = shellBH.build(), habGlassGeoHi = glassBH.build();

  // frame: struts on every edge, hubs on every node, crown hatch, antenna mast + dish, door lamp
  const fB = builder({ kind: 1 }), fBF = builder({ kind: 1 }), low = frameDetail === 'low';
  HG.edges.forEach(([a, b]) => strut(fB, HG.verts[a], HG.verts[b], FRAME_R, 0.017, 0.019, 0.014, { kind: 0 }, low));
  HG.verts.forEach(v => hub(fB, v, FRAME_R, 0.03, 0.03, { kind: 1 }, low ? 3 : 4));
  for (const FB of [fBF, fB]) {
    const g = new THREE.CylinderGeometry(0.075, 0.085, 0.05, 8, 1, false); g.translate(0, FRAME_R + 0.02, 0); FB.geo(g, { kind: 4 }, n => n.y < -0.5, true); g.dispose();
    // antenna: mast + dish + beacon, off-crown
    const ax = 0.3, ay = Math.sqrt(1 - ax * ax) * FRAME_R;
    FB.box(ax, ay + 0.17, 0.05, 0.016, 0.36, 0.016, { kind: 2 });
    const dish = new THREE.ConeGeometry(0.09, 0.04, 9, 1, true); dish.rotateX(Math.PI); dish.rotateZ(-0.9); dish.translate(ax + 0.03, ay + 0.3, 0.05);
    FB.geo(dish, { kind: 2 }, null, true); dish.dispose();
    FB.box(ax, ay + 0.36, 0.05, 0.03, 0.03, 0.03, { kind: 3 });
    FB.box(1.2 / 1.015 + 0.012, 0.345 / 1.015, 0, 0.03, 0.025, 0.06, { kind: 5 }); // lamp above the airlock door (vestibule only)
  }
  const habFrameGeo = fB.build(), habFrameGeoFar = fBF.build(); // far: crown hatch, antenna, dish, beacon and lamp only

  // far LOD (no strut geometry): the struts are painted on the panels along their edges (barycentric distance), with coverage
  // averaged once a strut is under a pixel, so far domes keep their lattice without sparkle
  const RIB = `#ifdef HAB_FAR
      { float re = min(min(vBary.x, vBary.y), vBary.z), fw = max(fwidth(re), 1e-4), w0 = 0.046;
        float rib = mix(1. - smoothstep(w0 - .5 * fw, w0 + .5 * fw, re), min(1., 5.4 * w0), smoothstep(.6 * w0, 2.5 * w0, fw));
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(.55, .5, .44), rib * .85); habRib = rib; }
      #endif`;
  const mkShellMat = far => patch(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.55, metalness: 0.08, envMap, envMapIntensity: 0.45 }), far ? 'shell-far' : 'shell', sh => {
    sh.vertexShader = `attribute vec3 sel; attribute vec3 bary; attribute float kind; varying vec3 vSel; varying vec3 vBary; varying float vKind; varying float vIh; varying float vY; varying float vFrac;\n` + HASH +
      sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      float ih = habInstHash(), frac; vec3 hw; habType(ih, frac, hw);
      transformed *= kind < 0.5 ? step(frac, dot(hw, sel)) : habHasVest(ih);
      vSel = sel; vBary = bary; vKind = kind; vIh = ih; vY = position.y; vFrac = frac;`);
    sh.fragmentShader = (far ? '#define HAB_FAR\n' : '') + `uniform float night; varying vec3 vSel; varying vec3 vBary; varying float vKind; varying float vIh; varying float vY; varying float vFrac; float habRib = 0.;\n` + LITF + sh.fragmentShader
      .replace('#include <color_fragment>', `#include <color_fragment>
      float pr = fract(vSel.z * 17.3 + vIh * 5.1), edge = min(min(vBary.x, vBary.y), vBary.z), seam = smoothstep(0.012, 0.075, edge);
      float solar = vKind < 0.5 ? step(0.9, vSel.z) * step(vFrac, 0.3) * step(0.22, vY) * step(vY, 0.86) : 0.;
      float win = step(2.5, vKind);
      if (vKind < 0.5) {
        diffuseColor.rgb *= vec3(0.93 + 0.12 * pr, 0.92 + 0.1 * pr, 0.9 + 0.08 * fract(pr * 7.));  // per-panel tint variance
        vec3 cell = abs(fract(vBary * 5.) - 0.5);
        vec3 sc = vec3(0.06, 0.09, 0.17) + 0.05 * (1. - smoothstep(0.42, 0.48, max(max(cell.x, cell.y), cell.z)));
        diffuseColor.rgb = mix(diffuseColor.rgb, sc, solar);
        diffuseColor.rgb *= mix(0.42, 1., seam);                                                         // panel gasket groove
      } else if (vKind < 1.5) { diffuseColor.rgb *= 0.97; }
      else if (vKind < 2.5) { diffuseColor.rgb *= vec3(0.36, 0.34, 0.33); }
      else { diffuseColor.rgb = vec3(0.03, 0.035, 0.04); }
      diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(0.93, 0.66, 0.48), (1. - smoothstep(0.0, 0.32, vY)) * 0.55 * (1. - solar)); // regolith dust creeping up from the base
      if (vKind < 0.5) {
      ${RIB}
      }`)
      .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
      roughnessFactor = mix(roughnessFactor + 0.1 * (pr - 0.5), 0.22, max(solar, win));`)
      .replace('#include <metalnessmap_fragment>', `#include <metalnessmap_fragment>
      metalnessFactor = mix(metalnessFactor, 0.55, max(solar, win));`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
      totalEmissiveRadiance += vec3(1., 0.62, 0.3) * win * (0.15 + 2.6 * ${CINE ? 'habLit(vIh, 0.)' : 'night'});`)
      .replace('#include <lights_fragment_maps>', ENV_NIGHT);
  });
  const habShellMat = mkShellMat(false), habShellMatFar = mkShellMat(true);

  const mkGlassMat = far => patch(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.05, metalness: 0.92, envMap, envMapIntensity: 1.5 }), far ? 'glass-far' : 'glass', sh => {
    sh.vertexShader = `attribute vec3 sel; attribute vec3 bary; attribute float kind; varying vec3 vSel; varying vec3 vBary; varying float vIh; varying float vY;\n` + HASH +
      sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      float ih = habInstHash(), frac; vec3 hw; habType(ih, frac, hw);
      transformed *= 1. - step(frac, dot(hw, sel));
      vSel = sel; vBary = bary; vIh = ih; vY = position.y;`);
    sh.fragmentShader = (far ? '#define HAB_FAR\n' : '') + `uniform float night; varying vec3 vSel; varying vec3 vBary; varying float vIh; varying float vY; float habRib = 0.;\n` + LITF + sh.fragmentShader
      .replace('#include <color_fragment>', `#include <color_fragment>
      float pr = fract(vSel.z * 23.7 + vIh * 3.3), edge = min(min(vBary.x, vBary.y), vBary.z), mull = 1. - smoothstep(0.03, 0.07, edge);
      diffuseColor.rgb = mix(mix(vec3(0.30, 0.34, 0.39), vec3(0.42, 0.33, 0.24), step(0.62, pr)), vec3(0.2, 0.19, 0.18), mull);
      ${RIB}
      mull = max(mull, habRib);`)
      .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
      roughnessFactor = mix(roughnessFactor + 0.05 * pr, 0.55, mull);
      roughnessFactor = max(roughnessFactor, 0.05 + 0.25 * smoothstep(40., 300., length(vViewPosition))); // distance floor: far facets stop sparkling`)
      .replace('#include <metalnessmap_fragment>', `#include <metalnessmap_fragment>
      metalnessFactor = mix(metalnessFactor, 0.4, mull);`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
      float on = 0.45 + 0.55 * step(0.3, fract(vIh * 11.3)), lit = 0.35 + 0.65 * step(0.38, fract(pr * 5.7 + vIh));
      totalEmissiveRadiance += vec3(1., 0.56, 0.24) * ${CINE ? 'habLit(vIh, floor(pr * 4.) * 0.17)' : 'night'} * on * lit * (1. - mull) * (0.7 + 0.9 * (1. - vY)) * 1.7;`)
      .replace('#include <lights_fragment_maps>', ENV_NIGHT);
  });
  const habGlassMat = mkGlassMat(false), habGlassMatFar = mkGlassMat(true);
  habGlassMat.userData.night = night;

  const habFrameMat = patch(new THREE.MeshStandardMaterial({ color: 0xc2b9ad, roughness: 0.38, metalness: 0.55, envMap, envMapIntensity: 0.7 }), 'frame', sh => {
    sh.vertexShader = `attribute float kind; varying float vKind; varying float vHs;\n` + HASH + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      float ih = habInstHash();
      transformed *= kind > 1.5 && kind < 3.5 ? habHasAnt(ih) : (kind > 4.5 ? habHasVest(ih) : 1.);
      vKind = kind;
      #ifdef USE_INSTANCING
        vHs = length(instanceMatrix[0].xyz);
      #else
        vHs = length(modelMatrix[0].xyz);
      #endif`);
    sh.fragmentShader = `uniform float night; varying float vKind; varying float vHs;\n` + sh.fragmentShader
      .replace('#include <color_fragment>', `#include <color_fragment>
      float lamp = step(2.5, vKind) * (1. - step(3.5, vKind)) + step(4.5, vKind);
      diffuseColor.rgb *= vKind > 0.5 && vKind < 1.5 ? 0.62 : (vKind > 3.5 && vKind < 4.5 ? 0.5 : 1.);
      // struts/hubs narrower than a pixel: blend toward the shell's colour and finish so they stop shimmering
      float thin = (1. - clamp(0.034 * vHs / max(length(fwidth(vViewPosition)), 1e-5), 0., 1.)) * step(vKind, 1.5);
      diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.62, 0.58, 0.54), thin * 0.7);`)
      .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
      roughnessFactor = mix(roughnessFactor, 0.6, thin);`)
      .replace('#include <metalnessmap_fragment>', `#include <metalnessmap_fragment>
      metalnessFactor = mix(metalnessFactor, 0.1, thin);`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
      totalEmissiveRadiance += (vKind < 4. ? vec3(1., 0.15, 0.08) : vec3(1., 0.8, 0.55)) * lamp * (0.4 + 4. * night);`)
      .replace('#include <lights_fragment_maps>', ENV_NIGHT);
  });
  const habShellDepthMat = depthMat('shell', 'attribute float kind;\n', 'transformed *= kind < 0.5 ? 1. : habHasVest(habInstHash());');
  const habFrameDepthMat = depthMat('frame', 'attribute float kind;\n', 'float ih0 = habInstHash(); transformed *= kind > 1.5 && kind < 3.5 ? habHasAnt(ih0) : (kind > 4.5 ? habHasVest(ih0) : 1.);');

  // ============================== ring pad: sintered pad, curb, lumpy regolith berm, bollard lamps ==============================
  const ringPad = S => {
    const prof = [[0, 0.5, 0], [0.9, 0.5, 0], [1.0, 0.5, 1], [1.035, 0.47, 1], [1.08, 0.42, 2], [1.16, 0.29, 2], [1.24, 0.13, 2], [1.31, 0.03, 2], [1.37, 0, 3]];
    const pos = [], col = [], idx = [], h = (i, j, k) => { const s = Math.sin(i * 12.9898 + j * 78.233 + k * 37.719) * 43758.5453; return s - Math.floor(s); };
    for (let j = 0; j < prof.length; j++) for (let i = 0; i <= S; i++) {
      const ii = i % S, a = ii / S * Math.PI * 2, [r0, y0, t] = prof[j], lump = t === 2 ? (h(ii, j, 1) - 0.5) + 0.6 * (Math.sin(a * 3 + 1.3) * 0.5) : 0;
      const r = r0 + lump * 0.05, y = Math.max(0, y0 + (t === 2 ? (h(ii, j, 2) - 0.5) * 0.07 + lump * 0.03 : 0));
      pos.push(Math.cos(a) * r, y, Math.sin(a) * r);
      const n = h(ii, j, 3);
      const c = t === 0 ? [0.5 + n * 0.03, 0.42 + n * 0.03, 0.35 + n * 0.02] : t === 1 ? [0.36, 0.32, 0.28] : t === 2 ? [0.4 + n * 0.1, 0.18 + n * 0.05, 0.085 + n * 0.025] : [0.38, 0.17, 0.08];
      col.push(...c);
    }
    for (let j = 0; j < prof.length - 1; j++) for (let i = 0; i < S; i++) { const a = j * (S + 1) + i, b = a + S + 1; idx.push(a, a + 1, b, a + 1, b + 1, b); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setIndex(idx); g.computeVertexNormals();
    const ng = g.toNonIndexed(), B = builder({ color: 3, kind: 1 }), cA = ng.attributes.color, pA = ng.attributes.position, nA = ng.attributes.normal;
    const pa = new V3(), pb = new V3(), pc = new V3();
    for (let i = 0; i < pA.count; i += 3) {
      pa.fromBufferAttribute(pA, i); pb.fromBufferAttribute(pA, i + 1); pc.fromBufferAttribute(pA, i + 2);
      if (pa.distanceTo(pb) < 1e-6 || pb.distanceTo(pc) < 1e-6 || pa.distanceTo(pc) < 1e-6) continue; // centre fan degenerates
      B.tri(pa, pb, pc, { color: [0, 1, 2].map(k => [cA.getX(i + k), cA.getY(i + k), cA.getZ(i + k)]), kind: 0 }, null, [0, 1, 2].map(k => new V3().fromBufferAttribute(nA, i + k)));
    }
    g.dispose(); ng.dispose();
    for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2 + 0.26; B.box(Math.cos(a) * 1.0, 0.565, Math.sin(a) * 1.0, 0.03, 0.13, 0.03, { color: [0.25, 0.24, 0.23], kind: 1 }); }
    return B.build();
  };
  const ringPadGeo = ringPad(30), ringPadGeoFar = ringPad(14); // far LOD: the berm's lumps are under a pixel there
  const ringPadMat = patch(new THREE.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.95, metalness: 0 }), 'pad', sh => {
    sh.vertexShader = `attribute float kind; varying float vKind; varying float vPY;\n` + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      vKind = kind; vPY = position.y;`);
    sh.fragmentShader = `uniform float night; varying float vKind; varying float vPY;\n` + sh.fragmentShader.replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
      totalEmissiveRadiance += vec3(1., 0.72, 0.42) * step(0.5, vKind) * step(0.6, vPY) * (0.3 + 5. * night);`);
  });

  // ground contact shadow skirt: soft dark annulus just above the ground, instanced with the ring-pad matrices
  const skirtGeo = (() => {
    const S = 30, pos = [], al = [], idx = [], R = [[0.95, 0.62], [1.3, 0.38], [1.75, 0]];
    R.forEach(([r, a]) => { for (let i = 0; i <= S; i++) { const t = i / S * Math.PI * 2; pos.push(Math.cos(t) * r, 0.025, Math.sin(t) * r); al.push(a); } });
    for (let j = 0; j < R.length - 1; j++) for (let i = 0; i < S; i++) { const a = j * (S + 1) + i, b = a + S + 1; idx.push(a, a + 1, b, a + 1, b + 1, b); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('alpha', new THREE.Float32BufferAttribute(al, 1)); g.setIndex(idx); g.computeBoundingSphere(); return g;
  })();
  const skirtMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
    uniforms: { strength: { value: 0.75 } },
    vertexShader: `attribute float alpha; varying float vA; void main(){ vA = alpha;
      #ifdef USE_INSTANCING
        vec4 p = modelMatrix * instanceMatrix * vec4(position, 1.);
      #else
        vec4 p = modelMatrix * vec4(position, 1.);
      #endif
      gl_Position = projectionMatrix * viewMatrix * p; }`,
    fragmentShader: `uniform float strength; varying float vA; void main(){ gl_FragColor = vec4(0.06, 0.025, 0.012, vA * vA * strength); }`,
  });

  // ============================== fab sheds: vaulted hangar or boxy module, picked per instance ==============================
  // footprint x,z in [-0.5,0.5], y in [0,1]; main.js scales by (w, h, d) with w the long axis
  const shedGeo = (() => {
    const B = builder({ kind: 1, variant: 1 });
    // shared plinth
    B.box(0, 0.03, 0, 1.04, 0.06, 1.06, { kind: 6, variant: 0 });
    // --- vault (variant 1)
    const vy = 0.42, segs = 12, arc = [...Array(segs + 1)].map((_, i) => { const a = i / segs * Math.PI; return [0.5 * Math.cos(a), vy + 0.58 * Math.sin(a)]; });
    const W = (x, z, y) => new V3(x, y, z);
    for (const s of [-1, 1]) B.quad(W(-0.5, 0.5 * s, 0.06), W(0.5, 0.5 * s, 0.06), W(0.5, 0.5 * s, vy), W(-0.5, 0.5 * s, vy), { kind: 0, variant: 1 }, new V3(0, 0, s));
    for (let i = 0; i < segs; i++) {
      const [z0, y0] = arc[i], [z1, y1] = arc[i + 1], out = new V3(0, (y0 + y1) / 2 - vy, (z0 + z1) / 2);
      B.quad(W(-0.5, z0, y0), W(0.5, z0, y0), W(0.5, z1, y1), W(-0.5, z1, y1), { kind: 0, variant: 1 }, out);
    }
    for (const s of [-1, 1]) { // end walls: rectangle + arch fan
      B.quad(W(0.5 * s, -0.5, 0.06), W(0.5 * s, 0.5, 0.06), W(0.5 * s, 0.5, vy), W(0.5 * s, -0.5, vy), { kind: 0, variant: 1 }, new V3(s, 0, 0));
      for (let i = 0; i < segs; i++) B.tri(W(0.5 * s, 0, vy), W(0.5 * s, arc[i][0], arc[i][1]), W(0.5 * s, arc[i + 1][0], arc[i + 1][1]), { kind: 0, variant: 1 }, new V3(s, 0, 0));
    }
    B.quad(W(0.506, -0.32, 0.06), W(0.506, 0.32, 0.06), W(0.506, 0.32, 0.66), W(0.506, -0.32, 0.66), { kind: 1, variant: 1 }, new V3(1, 0, 0)); // hangar door
    B.box(0.51, 0.69, 0, 0.012, 0.03, 0.7, { kind: 3, variant: 1 });                                                                         // door header
    for (const s of [-1, 1]) B.quad(W(-0.44, 0.506 * s, 0.24), W(0.44, 0.506 * s, 0.24), W(0.44, 0.506 * s, 0.34), W(-0.44, 0.506 * s, 0.34), { kind: 2, variant: 1 }, new V3(0, 0, s));
    B.quad(W(0.2, 0.507, 0.06), W(0.3, 0.507, 0.06), W(0.3, 0.507, 0.22), W(0.2, 0.507, 0.22), { kind: 1, variant: 1 }, new V3(0, 0, 1)); // personnel door
    B.box(-0.22, 1.02, 0, 0.12, 0.06, 0.16, { kind: 3, variant: 1 }); B.box(0.12, 1.015, 0, 0.08, 0.05, 0.1, { kind: 3, variant: 1 });
    B.box(-0.38, 0.98, 0.12, 0.04, 0.09, 0.04, { kind: 3, variant: 1 });
    B.box(0.515, 0.74, 0, 0.012, 0.025, 0.06, { kind: 4, variant: 1 });
    // --- box module (variant 2)
    B.box(0, 0.43, 0, 1, 0.74, 1, { kind: 0, variant: 2 });
    for (const [x, z, sx, sz] of [[0, 0.49, 1, 0.025], [0, -0.49, 1, 0.025], [0.49, 0, 0.025, 1], [-0.49, 0, 0.025, 1]]) B.box(x, 0.83, z, sx, 0.06, sz, { kind: 0, variant: 2 });
    B.box(-0.25, 0.86, 0.1, 0.18, 0.12, 0.3, { kind: 3, variant: 2 }); B.box(0.05, 0.84, -0.18, 0.1, 0.08, 0.12, { kind: 3, variant: 2 });
    const sp = new THREE.PlaneGeometry(0.34, 0.5); sp.rotateX(-Math.PI / 2); sp.rotateZ(0.25); sp.translate(0.28, 0.86, 0.05); B.geo(sp, { kind: 5, variant: 2 }, null, true); sp.dispose();
    B.quad(W(0.504, -0.22, 0.06), W(0.504, 0.22, 0.06), W(0.504, 0.22, 0.56), W(0.504, -0.22, 0.56), { kind: 1, variant: 2 }, new V3(1, 0, 0));
    for (const s of [-1, 1]) B.quad(W(-0.45, 0.504 * s, 0.46), W(0.45, 0.504 * s, 0.46), W(0.45, 0.504 * s, 0.6), W(-0.45, 0.504 * s, 0.6), { kind: 2, variant: 2 }, new V3(0, 0, s));
    B.quad(W(-0.504, -0.4, 0.46), W(-0.504, 0.4, 0.46), W(-0.504, 0.4, 0.6), W(-0.504, -0.4, 0.6), { kind: 2, variant: 2 }, new V3(-1, 0, 0));
    B.box(0.512, 0.6, 0, 0.012, 0.025, 0.06, { kind: 4, variant: 2 });
    return B.build();
  })();
  const SHED_V = 'attribute float kind; attribute float variant;\n';
  const SHED_SEL = 'float shv = fract(habInstHash() * 5.7) < 0.55 ? 1. : 2.; transformed *= (variant < 0.5 || abs(variant - shv) < 0.5) ? 1. : 0.;';
  const shedMat = patch(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.62, metalness: 0.18, envMap, envMapIntensity: 0.5 }), 'shed', sh => {
    sh.vertexShader = SHED_V + `varying float vKind; varying vec3 vLP; varying vec3 vSc; varying vec3 vN0;\n` + HASH + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      ${SHED_SEL}
      vKind = kind; vLP = position; vN0 = normal;
      #ifdef USE_INSTANCING
        vSc = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz));
      #else
        vSc = vec3(length(modelMatrix[0].xyz), length(modelMatrix[1].xyz), length(modelMatrix[2].xyz));
      #endif`);
    sh.fragmentShader = `uniform float night; varying float vKind; varying vec3 vLP; varying vec3 vSc; varying vec3 vN0;\n` + LITF + sh.fragmentShader
      .replace('#include <color_fragment>', `#include <color_fragment>
      vec3 m = vLP * vSc; float ax = abs(vN0.x) > 0.5 ? m.z : m.x;
      float win = 0., lamp = 0., solar = 0.;
      if (vKind < 0.5) {
        diffuseColor.rgb *= 1. - 0.24 * (1. - smoothstep(0.015, 0.05, abs(fract(ax / 1.6) - 0.5) - 0.44));       // rib / panel seams
        diffuseColor.rgb *= 1. - 0.07 * (1. - smoothstep(0.004, 0.03, abs(fract(m.y / 0.9) - 0.5) - 0.46)) * step(abs(vN0.y), 0.5);
      } else if (vKind < 1.5) {
        diffuseColor.rgb *= 0.52 * (0.82 + 0.18 * smoothstep(0.06, 0.2, abs(fract(m.y / 0.3) - 0.5)));            // roller door slats
      } else if (vKind < 2.5) {
        float mu = step(0.44, abs(fract(m.x / 1.4) - 0.5)); win = 1. - mu;
        diffuseColor.rgb = mix(vec3(0.05, 0.055, 0.065), vec3(0.3), mu);
      } else if (vKind < 3.5) { diffuseColor.rgb *= 0.55; }
      else if (vKind < 4.5) { lamp = 1.; }
      else if (vKind < 5.5) { solar = 1.; diffuseColor.rgb = vec3(0.03, 0.045, 0.09); }
      else { diffuseColor.rgb *= vec3(0.42, 0.38, 0.34); }
      diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(0.92, 0.66, 0.48), (1. - smoothstep(0.1, 1.3, m.y)) * 0.6 * step(vKind, 1.5));`)
      .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
      roughnessFactor = mix(roughnessFactor, 0.15, max(win, solar));`)
      .replace('#include <metalnessmap_fragment>', `#include <metalnessmap_fragment>
      metalnessFactor = mix(metalnessFactor, 0.6, max(win, solar));`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
      float bay = step(0.3, fract(floor(m.x / 1.4) * 0.618 + vSc.x * 0.37));
      totalEmissiveRadiance += vec3(1., 0.66, 0.36) * win * ${CINE ? 'habLit(fract(vSc.x * 0.37 + vSc.y * 1.31), floor(m.x / 1.4) * 0.11)' : 'night'} * (0.4 + 1.8 * bay) + vec3(1., 0.85, 0.6) * lamp * (0.4 + 4. * night);`)
      .replace('#include <lights_fragment_maps>', ENV_NIGHT);
  });
  const shedDepthMat = depthMat('shed', SHED_V, SHED_SEL);

  // ============================== clear glass (big domes + corridors): mirror at grazing angles, see-through face-on ==============================
  function clearGlass(key, { remap = 0, baryMull = true, color = 0x8a96a2 } = {}) {
    return patch(new THREE.MeshStandardMaterial({ color, roughness: 0.035, metalness: 0.9, envMap, envMapIntensity: 1.4, transparent: true, depthWrite: false, emissive: 0xffffff, emissiveIntensity: 0 }), key, sh => {
      sh.vertexShader = (baryMull ? 'attribute vec3 bary; varying vec3 vBary;\n' : '') + `varying float vGY;\n` + (CINE ? 'varying float vOh;\n' + HASH : '') + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
        ${baryMull ? 'vBary = bary;' : ''} vGY = position.y;${CINE ? ' vOh = habInstHash();' : ''}`);
      sh.fragmentShader = (baryMull ? 'varying vec3 vBary;\n' : '') + `uniform float night; varying float vGY;\n` + (CINE ? 'varying float vOh;\n' : '') + LITF + sh.fragmentShader
        .replace('#include <color_fragment>', `#include <color_fragment>
        float mull = ${baryMull ? '1. - smoothstep(0.035, 0.08, min(min(vBary.x, vBary.y), vBary.z))' : '0.'};
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.16, 0.15, 0.14), mull);`)
        .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
        roughnessFactor = mix(roughnessFactor, 0.5, mull);`)
        .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        totalEmissiveRadiance = emissive * vec3(1., 0.6, 0.3) * (1. - mull);
        totalEmissiveRadiance += vec3(1., 0.58, 0.26) * ${CINE ? 'habLit(vOh, 0.31)' : 'night'} * 0.22 * (1. - mull) * (1.2 - vGY);`)
        .replace('#include <lights_fragment_maps>', ENV_NIGHT)
        .replace('#include <opaque_fragment>', `
        // the sun glint on near-mirror glass overflows half float (inf), which bloom/DOF smear into a hard square: cap it
        outgoingLight = min(outgoingLight, vec3(12.));
        float fr = pow(1. - clamp(abs(dot(normalize(vViewPosition), normal)), 0., 1.), 2.2);
        float lum = dot(outgoingLight, vec3(0.3, 0.59, 0.11));
        diffuseColor.a = ${remap ? `clamp(opacity / ${remap.toFixed(3)}, 0., 1.)` : 'opacity'} * clamp(max(max(mix(0.5, 1., fr), lum * 1.4), mull), 0., 1.);
        #include <opaque_fragment>`);
    });
  }

  // ============================== big domes ==============================
  const DG = geodesic(8);
  const bigLatticeGeo = (() => { const B = builder({ kind: 1 }); DG.edges.forEach(([a, b]) => strut(B, DG.verts[a], DG.verts[b], 1.0, 0.0042, 0.006, 0.005, { kind: 0 })); DG.verts.forEach(v => hub(B, v, 1.0, 0.009, 0.008, { kind: 1 }, 5)); return B.build(); })();
  const bigGlassGeo = (() => {
    const B = builder({ bary: 3 });
    DG.faces.forEach(f => { const pts = f.v.map(p => f.c.clone().lerp(p, 0.97).multiplyScalar(0.994)); const cn = f.c.clone().normalize(), jt = jitterN(cn, 0.02).sub(cn); B.tri(pts[0], pts[1], pts[2], { bary: BARY }, f.c, pts.map(p => p.clone().normalize().add(jt).normalize())); }); // radial normals: round, not faceted
    return B.build();
  })();
  const bigGlowGeo = new THREE.SphereGeometry(0.975, 28, 10, 0, Math.PI * 2, 0, Math.PI / 2);
  // interior: plaza floor, stepped planted terraces round a core tower, a ring of low lit blocks, trees
  const bigInteriorGeo = (() => {
    const B = builder({ color: 3, kind: 1 }), G = (g, at, flat = true) => { B.geo(g, at, n => n.y < -0.5, flat); g.dispose(); };
    { const g = new THREE.CircleGeometry(0.985, 40); g.rotateX(-Math.PI / 2); g.translate(0, 0.004, 0); G(g, { color: [0.5, 0.43, 0.36] }); }
    const tiers = [[0.62, 0.05], [0.48, 0.1], [0.34, 0.15]];
    tiers.forEach(([r, h]) => { const g = new THREE.CylinderGeometry(r, r * 1.02, h, 28); g.translate(0, h / 2, 0); G(g, { color: (p, n) => n.y > 0.5 ? [0.16 + rng() * 0.05, 0.22 + rng() * 0.05, 0.07] : [0.62, 0.57, 0.5] }); });
    { const g = new THREE.CylinderGeometry(0.065, 0.085, 0.6, 10); g.translate(0, 0.3, 0); G(g, { color: [0.82, 0.8, 0.76] }); }
    for (const y of [0.24, 0.36, 0.48]) { const g = new THREE.CylinderGeometry(0.083 - y * 0.03, 0.083 - y * 0.03, 0.035, 10, 1, true); g.translate(0, y, 0); G(g, { color: [0.05, 0.05, 0.06], kind: 1 }); }
    for (let k = 0; k < 7; k++) {
      const a = k / 7 * Math.PI * 2 + 0.3, r = 0.78 + (k % 2) * 0.06, h = 0.08 + (k % 3) * 0.05, cx = Math.cos(a) * r, cz = Math.sin(a) * r;
      const g = new THREE.BoxGeometry(0.11, h, 0.09); g.rotateY(-a); g.translate(cx, h / 2, cz); G(g, { color: [0.84, 0.82, 0.78] });
      const w = new THREE.BoxGeometry(0.114, 0.02, 0.094); w.rotateY(-a); w.translate(cx, h * 0.62, cz); G(w, { color: [0.05, 0.05, 0.06], kind: 1 });
    }
    for (let i = 0; i < 44; i++) {
      const t = i % 3, [r0, h0] = tiers[t], rr = (t === 2 ? 0.12 : tiers[t + 1][0] + 0.03) + rng() * (r0 - (t === 2 ? 0.16 : tiers[t + 1][0] + 0.06)), a = rng() * 6.28, s = 0.018 + rng() * 0.016;
      const g = new THREE.IcosahedronGeometry(s, 0); g.scale(1, 1.4, 1); g.translate(Math.cos(a) * rr, h0 + s * 1.2, Math.sin(a) * rr); const v = rng();
      B.geo(g, { color: [0.12 + v * 0.08, 0.2 + v * 0.08, 0.06] }, null, true); g.dispose();
    }
    return B.build();
  })();
  // foundation ring + berm at the dome footing
  const bigBaseGeo = (() => {
    const B = builder({ color: 3 });
    { const g = new THREE.CylinderGeometry(1.03, 1.03, 0.03, 64, 1, true); g.translate(0, 0.015, 0); B.geo(g, { color: [0.4, 0.36, 0.31] }); g.dispose(); }
    { const g = new THREE.RingGeometry(0.99, 1.03, 64); g.rotateX(-Math.PI / 2); g.translate(0, 0.03, 0); B.geo(g, { color: [0.48, 0.42, 0.35] }); g.dispose(); }
    { const g = new THREE.CylinderGeometry(1.035, 1.11, 0.026, 64, 1, true); g.translate(0, 0.013, 0); B.geo(g, { color: () => [0.42 + rng() * 0.06, 0.2 + rng() * 0.03, 0.09] }); g.dispose(); }
    return B.build();
  })();
  const latticeMat = patch(new THREE.MeshStandardMaterial({ color: 0xd8d0c4, roughness: 0.34, metalness: 0.6, envMap, envMapIntensity: 0.7 }), 'lattice', sh => {
    sh.vertexShader = `attribute float kind; varying float vKind;\n` + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      vKind = kind;`);
    sh.fragmentShader = `uniform float night; varying float vKind;\n` + sh.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
      diffuseColor.rgb *= vKind > 0.5 ? 0.6 : 1.;`).replace('#include <lights_fragment_maps>', ENV_NIGHT);
  });
  const interiorMat = patch(new THREE.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.85, metalness: 0.05 }), 'interior', sh => {
    sh.vertexShader = `attribute float kind; varying float vKind;${CINE ? ' varying float vOh;\n' + HASH : ''}\n` + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      vKind = kind;${CINE ? ' vOh = habInstHash();' : ''}`);
    sh.fragmentShader = `uniform float night; varying float vKind;${CINE ? ' varying float vOh;' : ''}\n` + LITF + sh.fragmentShader.replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
      totalEmissiveRadiance += vec3(1., 0.66, 0.36) * step(0.5, vKind) * (0.2 + 3.2 * ${CINE ? 'habLit(vOh, 0.31)' : 'night'});`);
  });
  const baseMat = new THREE.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.95 }); mats.push(baseMat);

  function bigDome() {
    const g = new THREE.Group(); g.name = 'bigDome';
    const lattice = new THREE.Mesh(bigLatticeGeo, latticeMat); lattice.name = 'lattice';
    lattice.castShadow = lattice.receiveShadow = true;
    lattice.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking }); // solid struts; main.js may still write .opacity (no effect)
    const interior = new THREE.Mesh(bigInteriorGeo, interiorMat); interior.name = 'interior'; interior.castShadow = interior.receiveShadow = true;
    const base = new THREE.Mesh(bigBaseGeo, baseMat); base.name = 'base'; base.receiveShadow = true;
    const skirt = new THREE.Mesh(skirtGeo, skirtMat); skirt.name = 'skirt'; skirt.scale.set(0.9, 1, 0.9); skirt.renderOrder = -1;
    lattice.add(interior, base, skirt); // rise with lattice.scale.y like the frame does

    const gm = clearGlass('bigglass', { remap: 0.28 });
    const glass = new THREE.Mesh(bigGlassGeo, gm); glass.name = 'glass'; glass.receiveShadow = true; glass.castShadow = true;
    const gDepth = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, alphaHash: true, opacity: 0, side: THREE.DoubleSide });
    glass.customDepthMaterial = gDepth;
    // main.js drives glass opacity 0..0.28; full mirror glass at 0.28, and a partial hashed shadow that grows with it
    let op = 0; Object.defineProperty(gm, 'opacity', { get: () => op, set: v => { op = v; gDepth.opacity = 0.45 * Math.min(1, Math.max(0, v / 0.28)); }, configurable: true });
    gm.opacity = 0;

    const glowMat = new THREE.MeshBasicMaterial({ color: 0xff9a50, transparent: true, opacity: 0, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false });
    glowMat.onBeforeCompile = CINE ? sh => {
      sh.uniforms.night = night;
      sh.vertexShader = 'varying float vGY; varying float vOh;\n' + HASH + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvGY = position.y; vOh = habInstHash();');
      sh.fragmentShader = 'uniform float night; varying float vGY; varying float vOh;\n' + LIT + sh.fragmentShader.replace('#include <color_fragment>', '#include <color_fragment>\ndiffuseColor.rgb *= 2.6 * (0.35 + 1.1 * (1. - vGY)) * habLit(vOh, 0.31) / max(night, 0.02);');
    } : sh => {
      sh.vertexShader = 'varying float vGY;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvGY = position.y;');
      sh.fragmentShader = 'varying float vGY;\n' + sh.fragmentShader.replace('#include <color_fragment>', '#include <color_fragment>\ndiffuseColor.rgb *= 2.6 * (0.35 + 1.1 * (1. - vGY));');
    };
    glowMat.customProgramCacheKey = () => 'hab-bigglow';
    const glow = new THREE.Mesh(bigGlowGeo, glowMat); glow.name = 'glow';
    g.add(lattice, glass, glow);
    return g;
  }

  // ============================== corridors ==============================
  const TS = 16;
  const tubeGeo = (() => { const g = new THREE.CylinderGeometry(2.4, 2.4, 1, TS, 1, true).rotateZ(Math.PI / 2).translate(0.5, 0, 0); const ng = g.toNonIndexed(); g.dispose(); ng.computeVertexNormals(); ng.computeBoundingSphere(); return ng; })();
  const tubeMat = clearGlass('tube', { baryMull: false, color: 0x7d8a96 });
  tubeMat.emissive.setRGB(1.6, 1.6, 1.6); // main.js sets emissiveIntensity = night * 0.35
  const ribGeo = (() => {
    const B = builder({ kind: 1 }), N = 16, X = 0.11 / 62, ang = k => k / TS * Math.PI * 2, P = (x, r, a) => new V3(x, r * Math.sin(a), r * Math.cos(a));
    for (let i = 0; i <= N; i++) {
      const x = Math.min(1 - X, Math.max(X, i / N)), ro = 2.53, ri = 2.41;
      for (let k = 0; k < TS; k++) {
        const a0 = ang(k), a1 = ang(k + 1), am = (a0 + a1) / 2, out = P(0, 1, am);
        B.quad(P(x - X, ro, a0), P(x + X, ro, a0), P(x + X, ro, a1), P(x - X, ro, a1), { kind: 0 }, out);
        B.quad(P(x - X, ri, a0), P(x + X, ri, a0), P(x + X, ri, a1), P(x - X, ri, a1), { kind: 0 }, out.clone().negate());
        for (const s of [-1, 1]) B.quad(P(x + s * X, ri, a0), P(x + s * X, ro, a0), P(x + s * X, ro, a1), P(x + s * X, ri, a1), { kind: 0 }, new V3(s, 0, 0));
      }
      if (i % 2 === 0 || i === N) for (const z of [-1.1, 1.1]) B.box(x, -2.52, z, X * 5, 0.16, 0.7, { kind: 3 }); // footings
    }
    B.box(0.5, -1.8, 0, 1, 0.12, 3.1, { kind: 1 });               // walkway deck
    for (const z of [-1.42, 1.42]) B.box(0.5, -1.72, z, 1, 0.04, 0.08, { kind: 2 }); // deck edge light strips
    for (const z of [-2.1, 2.1]) B.box(0.5, -1.05, z, 1, 0.08, 0.08, { kind: 0 });   // stringers
    return B.build();
  })();
  const ribMat = patch(new THREE.MeshStandardMaterial({ color: 0xd2cabe, roughness: 0.4, metalness: 0.55, envMap, envMapIntensity: 0.7 }), 'rib', sh => {
    sh.vertexShader = `attribute float kind; varying float vKind;\n` + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      vKind = kind;`);
    sh.fragmentShader = `uniform float night; varying float vKind;\n` + sh.fragmentShader
      .replace('#include <color_fragment>', `#include <color_fragment>
      diffuseColor.rgb *= vKind > 0.5 && vKind < 1.5 ? vec3(0.55, 0.5, 0.45) : (vKind > 2.5 ? vec3(0.45, 0.4, 0.36) : vec3(1.));`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
      totalEmissiveRadiance += vec3(1., 0.72, 0.45) * step(1.5, vKind) * (1. - step(2.5, vKind)) * (0.2 + 3. * night);`)
      .replace('#include <lights_fragment_maps>', ENV_NIGHT);
  });

  [habShellGeo, habGlassGeo, habShellGeoHi, habGlassGeoHi, habFrameGeo, habFrameGeoFar, ringPadGeo, ringPadGeoFar, skirtGeo, shedGeo, tubeGeo, ribGeo, bigLatticeGeo, bigGlassGeo, bigInteriorGeo, bigBaseGeo].forEach(g => g.computeBoundingSphere());
  Object.assign(tris, {
    habShell: triCount(habShellGeo), habGlass: triCount(habGlassGeo), habFrame: triCount(habFrameGeo), ringPad: triCount(ringPadGeo), skirt: triCount(skirtGeo),
    shed: triCount(shedGeo), tube: triCount(tubeGeo), rib: triCount(ribGeo),
    bigDome: { lattice: triCount(bigLatticeGeo), glass: triCount(bigGlassGeo), glow: triCount(bigGlowGeo), interior: triCount(bigInteriorGeo), base: triCount(bigBaseGeo) },
  });

  function setEnv(tex) { [...mats, tubeMat].forEach(m => { if ('envMap' in m && m !== baseMat && m !== ringPadMat && m !== interiorMat) { m.envMap = tex; m.needsUpdate = true; } }); }

  return {
    night, tris, setEnv,
    habShellGeo, habShellMat, habShellDepthMat, habShellGeoHi, habShellMatFar,
    habGlassGeo, habGlassMat, habGlassGeoHi, habGlassMatFar,
    habFrameGeo, habFrameMat, habFrameDepthMat, habFrameGeoFar,
    ringPadGeo, ringPadGeoFar, ringPadMat, skirtGeo, skirtMat,
    bigDome,
    shedGeo, shedMat, shedDepthMat,
    tubeGeo, tubeMat, ribGeo, ribMat,
  };
}
