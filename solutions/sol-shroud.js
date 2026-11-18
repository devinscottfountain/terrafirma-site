// sol-shroud.js: the TerraFirma ATLAS Cyber Shroud on the Solutions excavator's cab roof. Real part (assets/cyber-shroud.glb,
// metres, Z-up as exported, meshopt compressed), drawn in the scene's own look: the shared black occluder plus edge line
// art, a little brighter than the machine lines so it reads as the product. Seated on the roof slab, centred over the cab,
// true scale in the upper structure's space so it swings with the house. Turned exactly as on the hero excavator (Devin's
// call there: the small vented end faces the boom), i.e. model x runs to the back of the machine. Lazy: call it after the first frame; nothing here blocks ready, and it compiles no program
// (the solid and the line material share the machines' programs).
const EDGE_DEG = 34;   // crease angle for the line art: the outline, the panel breaks and the vent rows, not every facet

export async function attachShroud({ THREE, exc, url, color, k = 1, alive = () => true }) {
  const [{ GLTFLoader }, { MeshoptDecoder }] = await Promise.all([
    import('three/addons/loaders/GLTFLoader.js'), import('three/addons/libs/meshopt_decoder.module.js')]);
  const loader = new GLTFLoader(); loader.setMeshoptDecoder(MeshoptDecoder);
  const gltf = await loader.loadAsync(url);
  if (!alive()) { disposeScene(gltf.scene); return null; }
  gltf.scene.updateMatrixWorld(true);

  // one triangle soup, Z-up turned Y-up and half a turn about y so the small vented end faces the boom (+x):
  // (x, y, z) -> (-x, z, y), the hero model's placement (d6/hero-model-machines.js attachShroud)
  const chunks = []; let n = 0; const v = new THREE.Vector3();
  gltf.scene.traverse(o => {
    if (!o.isMesh) return;
    const p = o.geometry.attributes.position, idx = o.geometry.index, cnt = idx ? idx.count : p.count, a = new Float32Array(cnt * 3);
    for (let i = 0; i < cnt; i++) {   // positions arrive quantized (int16 + a node scale): getX de-normalizes, matrixWorld scales
      const j = idx ? idx.getX(i) : i; v.set(p.getX(j), p.getY(j), p.getZ(j)).applyMatrix4(o.matrixWorld);
      a[i * 3] = -v.x; a[i * 3 + 1] = v.z; a[i * 3 + 2] = v.y;
    }
    chunks.push(a); n += a.length;
  });
  disposeScene(gltf.scene);
  if (!n) return null;
  const pos = new Float32Array(n); let off = 0; for (const a of chunks) { pos.set(a, off); off += a.length; }

  // seat it: footprint centred on the roof, base on the roof slab
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.computeBoundingBox(); const b = geo.boundingBox, R = exc.ROOF;
  geo.translate(R.x - (b.min.x + b.max.x) / 2, R.y - b.min.y, R.z - (b.min.z + b.max.z) / 2);
  geo.computeBoundingSphere();
  const edges = new THREE.EdgesGeometry(geo, EDGE_DEG); edges.computeBoundingSphere();
  if (!alive()) { geo.dispose(); edges.dispose(); return null; }
  const group = exc.mount(geo, edges, color, k); group.name = 'cyber-shroud';
  group.userData.size = [b.max.x - b.min.x, b.max.y - b.min.y, b.max.z - b.min.z];
  return group;
}

function disposeScene(s) {
  s.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) [].concat(o.material).forEach(m => m.dispose()); });
}
