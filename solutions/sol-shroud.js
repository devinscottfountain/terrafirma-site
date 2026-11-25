// sol-shroud.js: the TerraFirma ATLAS Cyber Shroud on the cab roof of every Solutions machine (excavator, dozer, smooth drum roller). Real
// part (kit/shroud.js loads assets/cyber-shroud.glb once per page), drawn in the scene's own look: the shared black occluder plus
// edge line art, a little brighter than the machine lines so it reads as the product. One solid geometry and one edge geometry,
// built once and shared by every machine; each machine mounts it on its own roof (machine.ROOF, model metres, in the part that
// carries the cab: the excavator's swinging house, the dozer's and compactor's body) with its own line material, so it fades
// with that machine. Turned as on the hero excavator: the small vented end to the machine's working end. Lazy: call it after
// the first frame; nothing here blocks ready, and it compiles no program (solid and lines share the machines' programs).
import { loadShroud } from '../kit/shroud.js';

const EDGE_DEG = 34;   // crease angle for the line art: the outline, the panel breaks and the vent rows, not every facet

// -> { geo, edges, size, mount(machine, color, k) -> group, dispose() }
export async function buildShroud({ THREE, alive = () => true }) {
  const src = await loadShroud();
  if (!alive()) return null;
  let n = 0; for (const p of src.parts) n += p.pos.length;
  const pos = new Float32Array(n); let off = 0; for (const p of src.parts) { pos.set(p.pos, off); off += p.pos.length; }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.computeBoundingSphere();
  const edges = new THREE.EdgesGeometry(geo, EDGE_DEG); edges.computeBoundingSphere();
  return {
    geo, edges, size: src.size,
    // seated on the roof slab, footprint centred on it; R.s scales it down where a roof is much smaller than the part
    mount(m, color, k = 1) {
      const R = m.ROOF, g = m.mount(geo, edges, color, k); g.name = 'cyber-shroud';
      g.position.set(R.x, R.y, R.z); g.scale.setScalar(R.s || 1);
      return g;
    },
    dispose() { geo.dispose(); edges.dispose(); },
  };
}
