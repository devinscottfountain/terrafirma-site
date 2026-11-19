// Careers mission "future excavator": the film's solid CAT 336 (film/machines.js, same kit, materials and grime shader) with a pair
// of stainless boosters saddled on the counterweight, posed for flight (boom and stick reaching forward, bucket curled).
//
// buildRocketExcavator({ THREE, envMap, high }) -> { model, mats, nozzles, length, tris, addShroud, dispose }
//   model: Group centred on its bounding box, metres, forward +x, up +y, right +z (the camera sees the right side)
//   mats: every material (all transparent-capable, fade with .opacity), nozzles: nozzle exit points in model space,
//   length: bounding box length along x (m). Everything is merged per material: 5 draw calls for the whole machine.
//   addShroud(): Promise, hangs the TerraFirma ATLAS Cyber Shroud on the cab roof as on the film's yard excavators (same seat, the
//   film's solid look) by merging it into the model's own paint / metal / glass meshes: no draw call and no program. Lazy: call it
//   after the first frame. At 48 to 110 px of ship it is a light block on the cab, so it is clustered to 4 cm (~1.7k triangles).
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { createExcavator, shroudSolid } from '../film/machines.js';
import { loadShroud, lod } from '../kit/shroud.js';

// flight pose (radians, film rig: boom pivot on the upper, stick on the boom tip, bucket on the stick)
export const POSE = { boom: 0.12, stick: -0.2, bucket: -1.9 };
const BZ = 0.72;                                // booster centre offset from the machine centreline (m)

export function buildRocketExcavator({ THREE, envMap = null, high = true }) {
  const tmp = new THREE.Group();
  // space look: about a fifth of the film's dirt, light rust, steel picks up more of the room
  const { ex, materials: MAT, Kit, T, shapeOf, extrude } = createExcavator({ THREE, group: tmp, envMap, grime: { dirt: 0.22, rust: 0.35 }, transparent: true });
  MAT.metal.envMapIntensity = 1.6; MAT.paint.envMapIntensity = 0.6; MAT.glass.envMapIntensity = 1.4;
  ex.boom.rotation.z = POSE.boom; ex.stick.rotation.z = POSE.stick; ex.bucket.rotation.z = POSE.bucket;

  // ---------------------------------------------------------------- boosters, in the upper's space (counterweight top y 1.37, rear x -3.37 at |z| 0.72)
  const seg = high ? 20 : 12, k = Kit(1.1, 0.15);
  const STAIN = 0xd9d6d0, DARK = 0x242422, BELL = 0x3b3631;
  const R = 0.5, CY = 1.98;                    // booster radius, axis height
  const x0 = -4.7, x1 = -2.55, xn = -1.95;      // tail, nose shoulder, nose tip
  // lathe profile is (radius, axial); built along +y, laid along +x
  const lathe = (pts) => new THREE.LatheGeometry(pts.map(([r, a]) => new THREE.Vector2(r, a)), seg).rotateZ(-Math.PI / 2);
  const body = [[0.001, x0 - 0.2], [0.24, x0 - 0.2], [0.36, x0 - 0.08], [R, x0 + 0.04], [R, x1], [R * 0.93, x1 + 0.18], [R * 0.78, x1 + 0.34], [R * 0.55, x1 + 0.47], [R * 0.28, xn - 0.04], [0.001, xn]];
  // bell: inner wall from the throat down to the lip, outer wall back up (a real shell open at the exit; this order keeps both faces outward)
  const bell = [[0.16, x0 - 0.2], [0.22, x0 - 0.38], [0.29, x0 - 0.64], [0.38, x0 - 0.94], [0.4, x0 - 0.92], [0.31, x0 - 0.62], [0.24, x0 - 0.36], [0.2, x0 - 0.18]];
  const nozzles = [];
  for (const s of [-1, 1]) {
    const z = s * BZ, at = T(0, CY, z);
    k.add('metal', STAIN, lathe(body), at, { dirt: 0.08 });
    k.add('metal', BELL, lathe(bell), at, { dirt: 0.1, rust: 0.25 });
    k.add('glow', 0xffb35c, new THREE.CircleGeometry(0.17, 10), T(x0 - 0.3, CY, z, 0, -Math.PI / 2, 0));   // hot throat, faces aft
    for (const x of [-2.75, -3.3]) {
      k.rod('rough', DARK, [x - 0.07, CY, z], [x + 0.07, CY, z], R + 0.025, seg, { dirt: 0.3 });           // clamp band
      k.B('paint', DARK, x - 0.12, 1.36, z - 0.24, x + 0.12, CY - R * 0.7, z + 0.24, { dirt: 0.4 });       // saddle on the counterweight
    }
    k.rod('rough', DARK, [x0 + 0.35, CY, z], [x0 + 0.42, CY, z], R + 0.012, seg, { dirt: 0.2 });                  // aft ring
    // fins: outboard and top, small trapezoids at the tail
    const fin = extrude(shapeOf([[0, 0], [0.62, 0], [0.42, 0.34], [0.12, 0.34]]), 0.04, 0.008);
    k.add('paint', DARK, fin.clone(), T(x0 + 0.02, CY + R - 0.02, z), { dirt: 0.2 });
    k.add('paint', DARK, fin, T(x0 + 0.02, CY, z + s * (R - 0.02), s * Math.PI / 2, 0, 0), { dirt: 0.2 });
    nozzles.push(new THREE.Vector3(x0 - 0.93, CY + 1.1, z));   // + the upper's y offset
  }
  k.bar('rough', DARK, [-3.02, CY - 0.12, -BZ], [-3.02, CY - 0.12, BZ], 0.18, { dirt: 0.3 });               // cross beam tying the pair
  k.build(ex.up);

  // ---------------------------------------------------------------- bake the pose and merge per material
  tmp.updateMatrixWorld(true);
  const roofM = new THREE.Matrix4().makeTranslation(...ex.roof.at).premultiply(ex.up.matrixWorld);   // shroud seat, model space (before centring)
  const by = new Map();
  tmp.traverse(o => { if (o.isMesh) { const g = o.geometry.clone().applyMatrix4(o.matrixWorld); (by.get(o.material) || by.set(o.material, []).get(o.material)).push(g); o.geometry.dispose(); } });
  const model = new THREE.Group(), byMat = new Map();
  let tris = 0;
  for (const [m, gs] of by) {
    const g = mergeGeometries(gs); gs.forEach(x => x.dispose());
    tris += g.attributes.position.count / 3;
    const mesh = new THREE.Mesh(g, m); mesh.frustumCulled = false; mesh.renderOrder = 2; model.add(mesh); byMat.set(m, mesh);
  }
  // centre on the bounding box so the pivot sits mid-machine
  const box = new THREE.Box3().setFromObject(model), c = box.getCenter(new THREE.Vector3());
  model.traverse(o => { if (o.isMesh) { o.geometry.translate(-c.x, -c.y, -c.z); o.geometry.computeBoundingSphere(); } });
  for (const n of nozzles) n.sub(c);
  roofM.premultiply(new THREE.Matrix4().makeTranslation(-c.x, -c.y, -c.z));
  const mats = Object.values(MAT);
  let dead = false, shroudP = null;
  function addShroud() {
    return shroudP || (shroudP = loadShroud().then(src => {
      if (dead) return 0;
      const kinds = shroudSolid(THREE, lod(src, 0.04), { dirt: 0.06 });
      let n = 0;
      for (const kind in kinds) {
        const mesh = byMat.get(MAT[kind]), add = kinds[kind].applyMatrix4(roofM);
        if (mesh) { const old = mesh.geometry; mesh.geometry = mergeGeometries([old, add]); old.dispose(); n += add.attributes.position.count / 3; }
        add.dispose();
      }
      return n;
    }));
  }
  return {
    model, mats, nozzles, tris, length: box.max.x - box.min.x, height: box.max.y - box.min.y, addShroud,
    dispose() { dead = true; model.traverse(o => { if (o.isMesh) o.geometry.dispose(); }); for (const m of mats) m.dispose(); },
  };
}
