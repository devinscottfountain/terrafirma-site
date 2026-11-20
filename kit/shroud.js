// shroud.js: the TerraFirma ATLAS Cyber Shroud source mesh, fetched and parsed once per page and shared by every scene that
// mounts it (Solutions, the film's Austin yard, the Careers mission excavator). Real part (solutions/assets/cyber-shroud.glb,
// 122 KB, metres, Z-up as exported, meshopt compressed, 7 meshes = 7 MTL colours, about 19k triangles).
//
// loadShroud() -> Promise<{ parts: [{ color: [r, g, b] linear, pos: Float32Array }], size: [x, y, z] }>
//   pos: non-indexed triangle soup in a machine's frame (forward +x, up +y, right +z), turned as on the prototype hero excavator
//   (Devin's call: (x, y, z) -> (-x, z, y), the small vented end to the working end), footprint centred on x = z = 0, base at y = 0.
//   The promise is kept on window, so Home (Solutions + film) fetches and decodes the glb once even if two module copies run.
// lod(src, cell) -> the same shape, vertex clustered on a cell (m) grid: a cheap far copy for machines that are a few px tall.
import { ROOT } from '../root.js';

const KEY = '__tfShroud';
const URL_GLB = new URL('solutions/assets/cyber-shroud.glb', ROOT).href;

export function loadShroud() {
  if (window[KEY]) return window[KEY];
  const p = (async () => {
    const [{ GLTFLoader }, { MeshoptDecoder }] = await Promise.all([
      import('three/addons/loaders/GLTFLoader.js'), import('three/addons/libs/meshopt_decoder.module.js')]);
    const loader = new GLTFLoader(); loader.setMeshoptDecoder(MeshoptDecoder);
    const gltf = await loader.loadAsync(URL_GLB);
    gltf.scene.updateMatrixWorld(true);
    const parts = [], e = new Float32Array(16);
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9, z0 = 1e9, z1 = -1e9;
    gltf.scene.traverse(o => {
      if (!o.isMesh) return;
      const p = o.geometry.attributes.position, idx = o.geometry.index, n = idx ? idx.count : p.count, a = new Float32Array(n * 3);
      e.set(o.matrixWorld.elements);
      for (let i = 0; i < n; i++) {   // positions arrive quantized (int16 + a node scale): getX de-normalizes, matrixWorld scales
        const j = idx ? idx.getX(i) : i, x = p.getX(j), y = p.getY(j), z = p.getZ(j);
        const wx = e[0] * x + e[4] * y + e[8] * z + e[12], wy = e[1] * x + e[5] * y + e[9] * z + e[13], wz = e[2] * x + e[6] * y + e[10] * z + e[14];
        const X = -wx, Y = wz, Z = wy;   // Z-up to Y-up, half a turn about y
        a[i * 3] = X; a[i * 3 + 1] = Y; a[i * 3 + 2] = Z;
        if (X < x0) x0 = X; if (X > x1) x1 = X; if (Y < y0) y0 = Y; if (Y > y1) y1 = Y; if (Z < z0) z0 = Z; if (Z > z1) z1 = Z;
      }
      const c = o.material.color; parts.push({ color: [c.r, c.g, c.b], pos: a });
      o.geometry.dispose(); o.material.dispose();
    });
    if (!parts.length) throw new Error('cyber-shroud.glb: no meshes');
    const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    for (const { pos } of parts) for (let i = 0; i < pos.length; i += 3) { pos[i] -= cx; pos[i + 1] -= y0; pos[i + 2] -= cz; }
    return { parts, size: [x1 - x0, y1 - y0, z1 - z0] };
  })();
  window[KEY] = p;
  p.catch(() => { if (window[KEY] === p) delete window[KEY]; });   // a failed fetch may be retried by the next caller
  return p;
}

// vertex clustering per part: every vertex snaps to the mean of its grid cell, triangles that collapse are dropped. Cached per cell.
export function lod(src, cell) {
  const cache = src.lods || (src.lods = {});
  if (cache[cell]) return cache[cell];
  const parts = src.parts.map(({ color, pos }) => {
    const n = pos.length / 3, key = new Int32Array(n), map = new Map(), sum = [];
    for (let i = 0; i < n; i++) {
      const k = `${Math.floor(pos[i * 3] / cell)},${Math.floor(pos[i * 3 + 1] / cell)},${Math.floor(pos[i * 3 + 2] / cell)}`;
      let id = map.get(k); if (id === undefined) { id = map.size; map.set(k, id); sum.push(0, 0, 0, 0); }
      key[i] = id; sum[id * 4] += pos[i * 3]; sum[id * 4 + 1] += pos[i * 3 + 1]; sum[id * 4 + 2] += pos[i * 3 + 2]; sum[id * 4 + 3]++;
    }
    const out = [], seen = new Set();
    for (let t = 0; t < n; t += 3) {
      const a = key[t], b = key[t + 1], c = key[t + 2];
      if (a === b || b === c || a === c) continue;
      const m = Math.min(a, b, c), s = m === a ? `${a},${b},${c}` : m === b ? `${b},${c},${a}` : `${c},${a},${b}`;   // same winding = same key
      if (seen.has(s)) continue; seen.add(s);
      for (const v of [a, b, c]) { const w = sum[v * 4 + 3]; out.push(sum[v * 4] / w, sum[v * 4 + 1] / w, sum[v * 4 + 2] / w); }
    }
    return { color, pos: new Float32Array(out) };
  }).filter(p => p.pos.length);
  return (cache[cell] = { parts, size: src.size });
}
