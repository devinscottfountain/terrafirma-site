// sol-terrain.js: the jobsite ground for the Solutions scene. One analytic height field (existing ground), one design
// surface (pads, pit, road), and one persistent edit field (dig delta + track marks) that the dots and the machines both
// read. The dot cloud is the ground: a survey point cloud, dense around the work and thinning to the horizon.
// World units are metres, y up. Keep the JS and GLSL height functions in sync (H_GLSL / hF).

const sstep = (a, b, v) => { const t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t); };

// ------------------------------------------------------------------ existing ground
export const H_GLSL = /* glsl */ `
float hF(vec2 p){
  float x = p.x, z = p.y, r = length(p);
  float h = 2.3*sin(x*.055 + .6)*cos(z*.047 - .3) + 1.2*sin(x*.12 + z*.085 + 1.1) + .45*sin(z*.29 - x*.16);
  float far = smoothstep(55., 190., r);
  h += far*(9. + 7.*sin(x*.021 + .8)*cos(z*.017 + .4) + 4.*sin((x + z)*.035));
  h += 5.*exp(-((x + 26.)*(x + 26.) + (z - 20.)*(z - 20.)) / 40.) + 4.*exp(-((x - 34.)*(x - 34.) + (z - 18.)*(z - 18.)) / 30.)
     + 3.5*exp(-((x + 14.)*(x + 14.) + (z + 30.)*(z + 30.)) / 55.);
  return h;
}`;
export function hF(x, z) {
  const r = Math.hypot(x, z);
  let h = 2.3 * Math.sin(x * 0.055 + 0.6) * Math.cos(z * 0.047 - 0.3) + 1.2 * Math.sin(x * 0.12 + z * 0.085 + 1.1) + 0.45 * Math.sin(z * 0.29 - x * 0.16);
  const far = sstep(55, 190, r);
  h += far * (9 + 7 * Math.sin(x * 0.021 + 0.8) * Math.cos(z * 0.017 + 0.4) + 4 * Math.sin((x + z) * 0.035));
  h += 5 * Math.exp(-((x + 26) * (x + 26) + (z - 20) * (z - 20)) / 40) + 4 * Math.exp(-((x - 34) * (x - 34) + (z - 18) * (z - 18)) / 30)
    + 3.5 * Math.exp(-((x + 14) * (x + 14) + (z + 30) * (z + 30)) / 55);
  return h;
}

// ------------------------------------------------------------------ site layout (one place)
// E: the dig excavator (home, heading). Pit: the cut it digs to grade. Pile: where it dumps (swing angle). Pad: the fill pad
// the loader feeds and the roller compacts. Plat: a building platform (part cut, part fill). Road: pit to pad.
const E = { x: 2, z: 6, yaw: Math.PI };
export const SITE = {
  E,
  pit: { x: -5.4, z: 5.4, hx: 4.4, hz: 5.0, rot: 0.06, ws: 2.4, cut: 2.3 },
  pad: { x: 27, z: -17, hx: 9, hz: 5.5, rot: 0.25, ws: 3.2, fill: 1.3 },
  plat: { x: -22, z: -15, hx: 10, hz: 7, rot: -0.2, ws: 3.2 },
  road: { ax: 1, az: -4.5, bx: 19.5, bz: -14.5, hw: 2.6, ws: 2.6 },
  pileSw: -1.45, pileR: 7.8,   // dump swing (rad, turret) and radius (m) from E
  dots: { x: -1.5, z: 3 },     // centre of the densest dots (the dig)
  field: { x: 4, z: -4, size: 64, n: 256 },
  sun: { az: Math.atan2(-0.62, -0.78), el: 13 * Math.PI / 180 },   // low sun to the west-north-west
};
SITE.pile = { x: E.x + Math.cos(E.yaw + SITE.pileSw) * SITE.pileR, z: E.z - Math.sin(E.yaw + SITE.pileSw) * SITE.pileR };
SITE.pit.level = hF(SITE.pit.x, SITE.pit.z) - SITE.pit.cut;
SITE.pad.level = hF(SITE.pad.x, SITE.pad.z) + SITE.pad.fill;
SITE.plat.level = hF(SITE.plat.x, SITE.plat.z);
SITE.road.la = hF(SITE.road.ax, SITE.road.az) - 0.4; SITE.road.lb = hF(SITE.road.bx, SITE.road.bz) + 0.2;
const S = SITE.sun; SITE.sunDir = [Math.cos(S.el) * Math.cos(S.az), Math.sin(S.el), Math.cos(S.el) * Math.sin(S.az)];

// ------------------------------------------------------------------ design surface (pads blended over the existing ground)
const f = v => (Math.abs(v) < 1e-6 ? '0.' : v.toFixed(4));
const rr = (P, name) => `{ vec2 q = p - vec2(${f(P.x)}, ${f(P.z)}); q = vec2(q.x*${f(Math.cos(P.rot))} - q.y*${f(Math.sin(P.rot))}, q.x*${f(Math.sin(P.rot))} + q.y*${f(Math.cos(P.rot))});
    q = abs(q) - vec2(${f(P.hx)}, ${f(P.hz)}); float sd = length(max(q, 0.)) + min(max(q.x, q.y), 0.);
    d = mix(d, ${name}, 1. - smoothstep(0., ${f(P.ws)}, sd)); }`;
const R = SITE.road;
export const D_GLSL = /* glsl */ `
float hD(vec2 p, float d){   // d: hF(p), already evaluated by the caller
  ${rr(SITE.plat, f(SITE.plat.level))}
  { vec2 ab = vec2(${f(R.bx - R.ax)}, ${f(R.bz - R.az)}); vec2 ap = p - vec2(${f(R.ax)}, ${f(R.az)});
    float t = clamp(dot(ap, ab) / dot(ab, ab), 0., 1.); float sd = length(ap - ab*t) - ${f(R.hw)};
    d = mix(d, mix(${f(R.la)}, ${f(R.lb)}, t), 1. - smoothstep(0., ${f(R.ws)}, sd)); }
  ${rr(SITE.pad, f(SITE.pad.level))}
  ${rr(SITE.pit, f(SITE.pit.level))}
  return d;
}`;
function rrMask(P, x, z) {
  let qx = x - P.x, qz = z - P.z; const c = Math.cos(P.rot), s = Math.sin(P.rot);
  const ux = Math.abs(qx * c - qz * s) - P.hx, uz = Math.abs(qx * s + qz * c) - P.hz;
  const sd = Math.hypot(Math.max(ux, 0), Math.max(uz, 0)) + Math.min(Math.max(ux, uz), 0);
  return 1 - sstep(0, P.ws, sd);
}
export function hD(x, z) {
  let d = hF(x, z);
  d += (SITE.plat.level - d) * rrMask(SITE.plat, x, z);
  const abx = R.bx - R.ax, abz = R.bz - R.az, apx = x - R.ax, apz = z - R.az;
  const t = Math.min(1, Math.max(0, (apx * abx + apz * abz) / (abx * abx + abz * abz)));
  const sd = Math.hypot(apx - abx * t, apz - abz * t) - R.hw;
  d += (R.la + (R.lb - R.la) * t - d) * (1 - sstep(0, R.ws, sd));
  d += (SITE.pad.level - d) * rrMask(SITE.pad, x, z);
  d += (SITE.pit.level - d) * rrMask(SITE.pit, x, z);
  return d;
}
// outline polygons for the plan graphics (world xz)
export function rectPoly(P) {
  const c = Math.cos(P.rot), s = Math.sin(P.rot), out = [];
  for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { const lx = a * P.hx, lz = b * P.hz; out.push([P.x + lx * c + lz * s, P.z - lx * s + lz * c]); }
  return out;
}

// ------------------------------------------------------------------ edit field: R = height delta (m), G = track marks (0..1)
export function createField(THREE) {
  const F = SITE.field, N = F.n, cell = F.size / N, ox = F.x - F.size / 2, oz = F.z - F.size / 2;
  const data = new Float32Array(N * N * 2), base = new Float32Array(N * N);
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) base[j * N + i] = hF(ox + (i + 0.5) * cell, oz + (j + 0.5) * cell);
  const tex = new THREE.DataTexture(data, N, N, THREE.RGFormat, THREE.FloatType);
  tex.minFilter = tex.magFilter = THREE.NearestFilter; tex.generateMipmaps = false; tex.needsUpdate = true;
  let dirty = false, upT = 0;
  const ci = x => (x - ox) / cell - 0.5, cj = z => (z - oz) / cell - 0.5;
  // bilinear sample of channel k
  function at(x, z, k = 0) {
    const u = ci(x), v = cj(z); if (u < 0 || v < 0 || u > N - 1.001 || v > N - 1.001) return 0;
    const i = u | 0, j = v | 0, fx = u - i, fz = v - j, o = (j * N + i) * 2 + k;
    return (data[o] * (1 - fx) + data[o + 2] * fx) * (1 - fz) + (data[o + N * 2] * (1 - fx) + data[o + N * 2 + 2] * fx) * fz;
  }
  const ground = (x, z) => hF(x, z) + at(x, z, 0);
  // texel window around (x, z) with radius r, callback(index, dist)
  function each(x, z, r, fn) {
    const i0 = Math.max(1, Math.floor(ci(x - r))), i1 = Math.min(N - 2, Math.ceil(ci(x + r))), j0 = Math.max(1, Math.floor(cj(z - r))), j1 = Math.min(N - 2, Math.ceil(cj(z + r)));
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      const wx = ox + (i + 0.5) * cell - x, wz = oz + (j + 0.5) * cell - z, d = Math.sqrt(wx * wx + wz * wz);
      if (d <= r) fn(j * N + i, d, i, j);
    }
  }
  const A = cell * cell;
  let floorFn = null, capV = 0, tipY = 0, removed = 0, rad = 1;
  const lowerFn = (k, d, i, j) => {
    const w = 1 - sstep(rad * 0.45, rad, d), g = base[k] + data[k * 2];
    let tgt = tipY + (1 - w) * 0.9;
    const fl = floorFn(ox + (i + 0.5) * cell, oz + (j + 0.5) * cell); if (tgt < fl) tgt = fl;
    if (g > tgt) { let cut = (g - tgt) * Math.min(1, w * 1.6); if (removed + cut * A > capV) cut = Math.max(0, (capV - removed) / A); data[k * 2] -= cut; removed += cut * A; }
  };
  // carve the ground under a bucket tip down to tipY (never below floor(x, z)), at most cap m3. Returns m3 removed.
  function lower(x, z, r, y, floor, cap) { floorFn = floor; capV = cap; tipY = y; removed = 0; rad = r; each(x, z, r, lowerFn); if (removed > 0) dirty = true; return removed; }
  let addV = 0, addR = 1, wsum = 0;
  const wFn = (k, d) => { wsum += Math.exp(-(d * d) / (addR * addR * 0.5)); };
  const addFn = (k, d) => { data[k * 2] += (addV / (wsum * A)) * Math.exp(-(d * d) / (addR * addR * 0.5)); };
  // deposit vol m3 as a soft mound of radius r
  function raise(x, z, r, vol) { if (vol <= 0) return; addR = r; addV = vol; wsum = 0; each(x, z, r, wFn); if (wsum > 0) { each(x, z, r, addFn); dirty = true; } }
  // angle of repose: move material downhill where a slope is steeper than maxSlope (local window, a few passes)
  function relax(x, z, r, passes = 2, maxSlope = 0.72) {
    const i0 = Math.max(1, Math.floor(ci(x - r))), i1 = Math.min(N - 2, Math.ceil(ci(x + r))), j0 = Math.max(1, Math.floor(cj(z - r))), j1 = Math.min(N - 2, Math.ceil(cj(z + r)));
    const lim = maxSlope * cell;
    for (let p = 0; p < passes; p++) for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      const k = j * N + i;
      for (let q = 0; q < 2; q++) {
        const n = q ? k + N : k + 1, h = base[k] + data[k * 2], hn = base[n] + data[n * 2], dh = h - hn;
        if (dh > lim) { const m = (dh - lim) * 0.25; data[k * 2] -= m; data[n * 2] += m; } else if (-dh > lim) { const m = (-dh - lim) * 0.25; data[k * 2] += m; data[n * 2] -= m; }
      }
    }
    dirty = true;
  }
  // remove up to vol m3 from a mound around (x, z) (the loader's scoop). Returns m3 taken.
  let tkTot = 0, tkK = 0, tkR = 1;
  const tkSum = k => { if (data[k * 2] > 0) tkTot += data[k * 2] * A; };
  const tkCut = (k, d) => { if (data[k * 2] > 0) data[k * 2] -= data[k * 2] * tkK * (1 - sstep(tkR * 0.6, tkR, d)); };
  function take(x, z, r, vol) {
    tkTot = 0; tkR = r; each(x, z, r, tkSum);
    if (tkTot <= 0) return 0; tkK = Math.min(1, vol / tkTot);
    each(x, z, r, tkCut); dirty = true; return Math.min(vol, tkTot);
  }
  // pull the ground toward lvl(x, z) under a footprint (roller drum): down at `down` m per call, up at `up`
  let flL = null, flR = 0, flD = 0, flU = 0;
  const flFn = (k, d, i, j) => { const g = base[k] + data[k * 2], t = flL(ox + (i + 0.5) * cell, oz + (j + 0.5) * cell) - g, w = 1 - sstep(flR * 0.6, flR, d); data[k * 2] += Math.max(-flD, Math.min(flU, t)) * w; data[k * 2 + 1] *= 1 - 0.5 * w; };
  function flatten(x, z, r, lvl, down, up) { flL = lvl; flR = r; flD = down; flU = up; each(x, z, r, flFn); dirty = true; }
  let mkA = 0;
  const mkFn = (k, d) => { const v = data[k * 2 + 1] + mkA * (1 - d / (mkR + 1e-6)); data[k * 2 + 1] = v > 1 ? 1 : v; };
  let mkR = 0.4;
  function mark(x, z, r, amt) { mkR = r; mkA = amt; each(x, z, r, mkFn); dirty = true; }
  // upload at most ~30 times a second, only when something changed
  function upload(dt) { upT += dt; if (dirty && upT > 1 / 30) { tex.needsUpdate = true; dirty = false; upT = 0; } }
  return { tex, data, N, cell, ox, oz, at, ground, lower, raise, relax, take, flatten, mark, upload, get dirty() { return dirty; },
    uniform: new THREE.Vector4(ox, oz, cell, N), dispose() { tex.dispose(); } };
}

// ------------------------------------------------------------------ the dot cloud geometry
// Rings of jittered grid points around SITE.dots: the radius doubles each ring while the spacing grows by G, so the dig
// is densest and the far ground thins toward the horizon. Ring edges cross-fade (no seams). The order is shuffled, so
// drawing fewer points (adaptive density) drops an even sample. Heights, slopes and terrain shadows are computed on the
// GPU from the same height field (the CPU only lays out x and z).
// Per point: position = (x, 0, z), aD = (spacing, rank 0..1, unused, random).
export function buildDots(THREE, { low = false } = {}) {
  const s0 = low ? 0.3 : 0.2, G = low ? 1.8 : 1.62, R0 = 14, LV = 6, cx = SITE.dots.x, cz = SITE.dots.z;
  let seed = 11; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  let cap = 1 << 16, X = new Float32Array(cap), Z = new Float32Array(cap), Sp = new Float32Array(cap), n = 0;
  const push = (x, z, s) => {
    if (n === cap) { cap *= 2; const g = a => { const b = new Float32Array(cap); b.set(a); return b; }; X = g(X); Z = g(Z); Sp = g(Sp); }
    X[n] = x; Z[n] = z; Sp[n] = s; n++;
  };
  for (let l = 0; l < LV; l++) {
    const s = s0 * Math.pow(G, l), Ro = R0 * (1 << l), Rp = R0 * (1 << Math.max(0, l - 1)), Ri = l ? Rp * 0.72 : 0, m = Math.ceil(Ro / s);
    for (let a = -m; a <= m; a++) for (let b = -m; b <= m; b++) {
      const x = cx + (a + (rnd() - 0.5) * 0.62) * s, z = cz + (b + (rnd() - 0.5) * 0.62) * s, r = Math.hypot(x - cx, z - cz), u = rnd();
      if (r > Ro || r < Ri) continue;
      if (l < LV - 1 && r > Ro * 0.72 && u < (r - Ro * 0.72) / (Ro * 0.28)) continue;   // fine ring fades out
      if (l > 0 && r < Rp && u > (r - Ri) / (Rp - Ri)) continue;                         // coarse ring fades in
      push(x, z, s);
    }
  }
  const ord = new Uint32Array(n); for (let i = 0; i < n; i++) ord[i] = i;
  for (let i = n - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)), t = ord[i]; ord[i] = ord[j]; ord[j] = t; }
  const pos = new Float32Array(n * 3), aD = new Float32Array(n * 4);
  for (let k = 0; k < n; k++) {
    const i = ord[k];
    pos[k * 3] = X[i]; pos[k * 3 + 2] = Z[i];
    aD[k * 4] = Sp[i]; aD[k * 4 + 1] = (k + 0.5) / n; aD[k * 4 + 3] = rnd();
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aD', new THREE.BufferAttribute(aD, 4));
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e5);
  return { geo, N: n };
}

// ------------------------------------------------------------------ design contours (marching squares, static)
// Returns segment endpoints [x0, y0, z0, x1, y1, z1, t, major] where t = 0..1 distance from the plan centre (draw-on order).
export function buildContours({ cx = 4, cz = -4, half = 46, step = 0.8, interval = 0.5 } = {}) {
  const n = Math.round((2 * half) / step) + 1, H = new Float32Array(n * n), X = i => cx - half + i * step, Z = j => cz - half + j * step;
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) H[j * n + i] = hD(X(i), Z(j));
  const out = []; let lo = 1e9, hi = -1e9; for (const v of H) { lo = Math.min(lo, v); hi = Math.max(hi, v); }
  const lerpP = (a, b, va, vb, L) => a + (b - a) * ((L - va) / (vb - va));
  for (let L = Math.ceil(lo / interval) * interval; L <= hi; L += interval) {
    const major = Math.abs(L / (interval * 4) - Math.round(L / (interval * 4))) < 1e-3 ? 1 : 0;
    for (let j = 0; j < n - 1; j++) for (let i = 0; i < n - 1; i++) {
      const a = H[j * n + i], b = H[j * n + i + 1], c = H[(j + 1) * n + i + 1], d = H[(j + 1) * n + i];
      const code = (a > L ? 1 : 0) | (b > L ? 2 : 0) | (c > L ? 4 : 0) | (d > L ? 8 : 0);
      if (code === 0 || code === 15) continue;
      const x0 = X(i), x1 = X(i + 1), z0 = Z(j), z1 = Z(j + 1);
      const e = [[lerpP(x0, x1, a, b, L), z0], [x1, lerpP(z0, z1, b, c, L)], [lerpP(x0, x1, d, c, L), z1], [x0, lerpP(z0, z1, a, d, L)]];
      const segs = { 1: [[3, 0]], 2: [[0, 1]], 3: [[3, 1]], 4: [[1, 2]], 5: [[3, 0], [1, 2]], 6: [[0, 2]], 7: [[3, 2]], 8: [[2, 3]], 9: [[0, 2]], 10: [[0, 1], [2, 3]], 11: [[1, 2]], 12: [[1, 3]], 13: [[0, 1]], 14: [[0, 3]] }[code];
      for (const [p, q] of segs) {
        const [ax, az] = e[p], [bx, bz] = e[q], t = Math.min(1, Math.hypot((ax + bx) / 2 - cx, (az + bz) / 2 - cz) / (half * 1.2));
        out.push(ax, L + 0.05, az, bx, L + 0.05, bz, t, major);
      }
    }
  }
  return out;
}
