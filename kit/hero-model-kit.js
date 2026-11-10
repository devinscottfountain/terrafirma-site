// D6 hero modelling kit: merge helpers, world-scale box UVs, rounded shapes, profile sweeps, and the texture binder
// every hero model module uses for applyHeroTextures (role -> material maps, no-op until a role is loaded).

// merge any mix of indexed / non-indexed geometries into one non-indexed geometry (position, normal, uv)
export function mergeAll(THREE, geos) {
  const flat = geos.map(g => g.index ? g.toNonIndexed() : g);
  const n = flat.reduce((s, g) => s + g.attributes.position.count, 0), P = new Float32Array(n * 3), N = new Float32Array(n * 3), UV = new Float32Array(n * 2);
  let o = 0;
  for (const g of flat) { P.set(g.attributes.position.array, o * 3); N.set(g.attributes.normal.array, o * 3); if (g.attributes.uv) UV.set(g.attributes.uv.array, o * 2); o += g.attributes.position.count; }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(P, 3)); out.setAttribute('normal', new THREE.BufferAttribute(N, 3)); out.setAttribute('uv', new THREE.BufferAttribute(UV, 2));
  return out;
}

// box projection UVs in metres / s (1 UV unit = s metres), chosen per face by the dominant normal axis
export function boxUV(THREE, geo, s = 1, off = [0, 0, 0]) {
  const g = geo.index ? geo.toNonIndexed() : geo;
  const p = g.attributes.position, n = g.attributes.normal, uv = new Float32Array(p.count * 2);
  for (let i = 0; i < p.count; i += 3) {
    let nx = 0, ny = 0, nz = 0; for (let k = 0; k < 3; k++) { nx += n.getX(i + k); ny += n.getY(i + k); nz += n.getZ(i + k); }
    const ax = Math.abs(nx), ay = Math.abs(ny), az = Math.abs(nz);
    for (let k = i; k < i + 3; k++) {
      const x = p.getX(k) + off[0], y = p.getY(k) + off[1], z = p.getZ(k) + off[2];
      let u, v; if (ay >= ax && ay >= az) { u = x; v = z; } else if (ax >= az) { u = z; v = y; } else { u = x; v = y; }
      uv[k * 2] = u / s; uv[k * 2 + 1] = v / s;
    }
  }
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); g.userData.texScale = s;
  return g;
}

// rounded rectangle shape centred on the origin
export function rrect(THREE, w, h, r, cx = 0, cy = 0) {
  const s = new THREE.Shape(), x0 = cx - w / 2, y0 = cy - h / 2; r = Math.min(r, w / 2, h / 2);
  s.moveTo(x0 + r, y0); s.lineTo(x0 + w - r, y0); s.quadraticCurveTo(x0 + w, y0, x0 + w, y0 + r);
  s.lineTo(x0 + w, y0 + h - r); s.quadraticCurveTo(x0 + w, y0 + h, x0 + w - r, y0 + h);
  s.lineTo(x0 + r, y0 + h); s.quadraticCurveTo(x0, y0 + h, x0, y0 + h - r);
  s.lineTo(x0, y0 + r); s.quadraticCurveTo(x0, y0, x0 + r, y0);
  return s;
}

// extrude along +z, centred on z (bevel adds to depth and outline), curveSegments kept low for budget
export function extrude(THREE, shape, depth, bevel = 0, seg = 1, curve = 4) {
  return new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: bevel > 0, bevelSize: bevel, bevelThickness: bevel, bevelSegments: seg, curveSegments: curve }).translate(0, 0, -depth / 2);
}

// split a geometry with groups (ExtrudeGeometry: 0 caps, 1 sides) into one non-indexed geometry per group
export function splitGroups(THREE, geo) {
  const g = geo.index ? geo.toNonIndexed() : geo, out = [];
  for (const gr of g.groups.length ? g.groups : [{ start: 0, count: g.attributes.position.count, materialIndex: 0 }]) {
    const o = new THREE.BufferGeometry();
    for (const a of ['position', 'normal', 'uv']) { const s = g.attributes[a]; if (!s) continue; o.setAttribute(a, new THREE.BufferAttribute(s.array.slice(gr.start * s.itemSize, (gr.start + gr.count) * s.itemSize), s.itemSize)); }
    (out[gr.materialIndex] ||= []).push(o);
  }
  return out.map(a => a && (a.length > 1 ? mergeAll(THREE, a) : a[0]));
}

// sweep a closed 2D profile (x across, y up in profile space) along a straight segment a -> b; up hint keeps it upright
export function sweep(THREE, shape, a, b, up = [0, 1, 0], curve = 3) {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), len = A.distanceTo(B);
  const g = new THREE.ExtrudeGeometry(shape, { depth: len, bevelEnabled: false, curveSegments: curve });
  const z = B.clone().sub(A).normalize(), x = new THREE.Vector3(...up).cross(z).normalize(), y = z.clone().cross(x);
  return g.applyMatrix4(new THREE.Matrix4().makeBasis(x, y, z).setPosition(A));
}

// texture binder: bind(material, role, opts) now, apply(tex) whenever textures stream in.
// With THREE, every bound slot gets a 1x1 placeholder at bind time (white map / ORM, flat normal), so the program is final
// from the first frame and streaming only swaps texture refs: no needsUpdate, no recompile, no re-upload.
const PH = new WeakMap();
export function placeholders(THREE) {
  let p = PH.get(THREE); if (p) return p;
  const mk = (r, g, b, srgb) => { const t = new THREE.DataTexture(new Uint8Array([r, g, b, 255]), 1, 1); t.wrapS = t.wrapT = THREE.RepeatWrapping; if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.needsUpdate = true; return t; };
  p = { map: mk(255, 255, 255, true), normalMap: mk(128, 128, 255), roughnessMap: mk(255, 255, 255), aoMap: mk(255, 255, 255), metalnessMap: mk(255, 255, 255) };
  PH.set(THREE, p); return p;
}
export function texBinder(THREE) {
  const list = [];
  const MAPS = ['map', 'normalMap', 'roughnessMap', 'aoMap'];
  const ph = THREE ? placeholders(THREE) : null;
  function apply(tex) {
    if (!tex || typeof tex.get !== 'function') return;
    for (const b of list) {
      const set = tex.get(b.role); if (!set) continue;
      if (b.custom) { b.custom(set); continue; }
      let changed = false;
      for (const k of b.maps || MAPS) {
        const t = set[k]; if (!t || b.mat[k] === t) continue;
        b.mat[k] = t; changed = true;   // streamer uploads with RepeatWrapping already: a ref swap, nothing else
        if (k === 'map' && b.color !== undefined) b.mat.color.set(b.color);
        if (k === 'normalMap' && b.normalScale) b.mat.normalScale.set(b.normalScale, b.normalScale);
        if (k === 'roughnessMap' && b.roughness !== undefined) b.mat.roughness = b.roughness;
        if (k === 'aoMap') b.mat.aoMapIntensity = b.ao ?? 0.8;
      }
      if (changed) { if (!ph) b.mat.needsUpdate = true; b.onApply?.(set); } // no placeholders: the program has to change
    }
  }
  function bind(mat, role, o = {}) {
    list.push({ mat, role, ...o });
    if (mat && ph) for (const k of o.maps || MAPS) if (!mat[k]) mat[k] = ph[k];
    return mat;
  }
  return { bind, apply, list };
}
