// D6.1 footer: Mars dusk settlement (Figma 22951:8878), procedural, real scale in metres.
// Frame: the compositor's eye is (0, 1.7, 0) looking down -z, ground under it is y = 0. Settlement pad ~280..450 m out,
// ~6.8 m below the eye; ridge line 1.3..2.1 km out. Big glass dome left of centre, hab row across the middle, two
// Starships standing right (nearer one taller in frame), a third far left against the ridge, rover in front of the row.
//
// Texture roles read from tex.get(role) (d61/foot-tex.js). Geometry UVs are baked in metres / TS[role]; if a set arrives
// with a different texScale the UVs are rescaled once.
//   regolith       ground grid (map, normal, ORM)             mars_rock      scattered rocks + foreground boulders
//   dome_glass     glass panels: roughnessMap + dirtMap (dust raises alpha and warms the tint)
//   dome_frame     struts, hubs, ribs, saddles, masts, roof kit   foliage    (role unused: leaf cards use a procedural cutout atlas)
//   habitat_panel  cylinders, units, opaque domes, vestibules, pads   stainless  Starships + tank farm
//   rover_paint    rover body
// Untextured: soil, dark (heat tiles, tyres, canopy, skirts), solar, pad, emissive window / lamp / beacon.
//
// buildFooterScene({ THREE, quality }) -> { root, lights, applyTextures(tex), update(t), anchors, stats, dispose }
import { TS, buckets } from './foot-model-kit.js';
import { texBinder, placeholders } from '../kit/hero-model-kit.js';
import { buildTerrain } from './foot-model-terrain.js';
import { buildColony } from './foot-model-colony.js';
import { leafAtlas } from './foot-model-plants.js';
import { buildStarships, buildPadTower } from './foot-model-starship.js';
import { footerPlan } from './foot-model-plan.js';
import { buildLife } from './foot-model-life.js';

export const FOOT_ROLES = ['regolith', 'mars_rock', 'dome_glass', 'dome_frame', 'foliage', 'habitat_panel', 'stainless', 'rover_paint'];

export function buildFooterScene({ THREE, quality = 'high' } = {}) {
  const high = quality !== 'low';
  const root = new THREE.Group(); root.name = 'd61-footer-model';
  const S = (o, role) => { const m = new THREE.MeshStandardMaterial(o); m.userData.texScale = TS[role] || 1; m.userData.role = role; return m; };
  const HDR = (r, g, b) => new THREE.MeshBasicMaterial({ color: new THREE.Color(r, g, b), fog: false });

  const M = {
    regolith: S({ color: 0x7a4128, roughness: 0.96, vertexColors: true }, 'regolith'),
    rock: S({ color: 0x4e2c1f, roughness: 0.9 }, 'mars_rock'),
    glass: S({ color: 0xdfe6ea, roughness: 0.06, metalness: 0.1, transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide, envMapIntensity: 1.6 }, 'dome_glass'),
    frame: S({ color: 0xd9d5cd, roughness: 0.5, metalness: 0.35 }, 'dome_frame'),
    foliage: S({ color: 0xffffff, roughness: 0.7, vertexColors: true, alphaTest: 0.5, side: THREE.DoubleSide }, 'foliage'),   // leaf cards, cutout
    soil: S({ color: 0x24170f, roughness: 1 }),
    hab: S({ color: 0xcdc8bf, roughness: 0.62, metalness: 0.05 }, 'habitat_panel'),
    stainless: S({ color: 0xc8cbcf, roughness: 0.3, metalness: 1, envMapIntensity: 1.4 }, 'stainless'),
    flap: S({ color: 0x9a9da2, roughness: 0.36, metalness: 1, envMapIntensity: 1.2 }, 'stainless'),
    rover: S({ color: 0xe4e1da, roughness: 0.48 }, 'rover_paint'),
    dark: S({ color: 0x121315, roughness: 0.55, metalness: 0.2 }),
    solar: S({ color: 0x0e1828, roughness: 0.22, metalness: 0.7 }),
    pad: S({ color: 0x4d4642, roughness: 0.95 }),
    tower: S({ color: 0xc0682e, roughness: 0.62, metalness: 0.15, emissive: 0x1c0a03 }),   // timelapse crane orange, a touch of self-light so it never goes black
    window: Object.assign(HDR(1.9, 1.2, 0.6), { polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 }),
    lamp: HDR(3.6, 2.1, 0.9),
    beacon: HDR(5, 0.5, 0.25),
  };

  // glass: Fresnel lifts alpha toward grazing angles (reflective rims, clear centres); dust mask adds haze
  const black = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1); black.needsUpdate = true;
  const glassU = { uDust: { value: black }, uDustK: { value: 0.35 } };
  M.glass.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, glassU);
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform sampler2D uDust; uniform float uDustK;')
      .replace('#include <opaque_fragment>', `{ float fr = pow(1.0 - abs(dot(normalize(vViewPosition), normal)), 3.0);
        float du = texture2D(uDust, vMapUv).r * uDustK;
        outgoingLight = mix(outgoingLight, vec3(0.42, 0.24, 0.14) * (totalDiffuse + 0.02), du * 0.6);
        diffuseColor.a = clamp(mix(diffuseColor.a, 0.9, fr) + du * 0.35, 0.0, 1.0); }
      #include <opaque_fragment>`);
  };
  M.glass.customProgramCacheKey = () => 'd61-glass';
  // steel: the side facing us mirrors the dark sky behind the camera, so add the soft dusk-dome fill a real hull picks up
  // (cool grey, brighter toward the top) and a warm grazing rim from the glow. Shadow side reads dim steel, never black.
  const steelU = { uFill: { value: new THREE.Color(0.055, 0.05, 0.05) }, uRim: { value: new THREE.Color(0.5, 0.26, 0.11) } };
  for (const m of [M.stainless, M.flap]) {
    m.onBeforeCompile = sh => {
      Object.assign(sh.uniforms, steelU);
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform vec3 uFill; uniform vec3 uRim;')
        .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
          { vec3 wn = inverseTransformDirection(normal, viewMatrix); float g = 1.0 - abs(dot(normal, normalize(vViewPosition)));
            totalEmissiveRadiance += diffuseColor.rgb * (uFill * (0.7 + 0.5 * clamp(wn.y, 0.0, 1.0)) + uRim * pow(g, 4.0)); }`);
    };
    m.customProgramCacheKey = () => 'd61-steel';
  }
  // foliage: leaves between us and the glow transmit it (strongest at grazing), plus a faint grow-light fill
  const leafU = { uBack: { value: new THREE.Color(0.55, 0.42, 0.12) } };
  M.foliage.map = leafAtlas(THREE);
  // cards carry crown normals: keep them on both faces (no back-face flip) so lobes shade as one volume
  const nfb = THREE.ShaderChunk.normal_fragment_begin.replace('normal *= faceDirection;', '');
  M.foliage.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, leafU);
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform vec3 uBack;').replace('#include <normal_fragment_begin>', nfb)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        float tl = clamp(-dot(normal, normalize(vViewPosition)), 0.0, 1.0); totalEmissiveRadiance += uBack * diffuseColor.rgb * (0.12 + 1.1 * tl * tl + 0.4 * pow(1.0 - abs(dot(normal, normalize(vViewPosition))), 3.0));`);
  };
  M.foliage.customProgramCacheKey = () => 'd61-foliage';
  M.glass.map = placeholders(THREE).map; // white 1x1: gives the glass shader vMapUv for the dust mask

  // ---------------------------------------------------------------- build
  const B = buckets(THREE);
  const terrain = buildTerrain({ THREE, group: root, M, high });
  const plan = footerPlan({ high });
  const colony = buildColony({ THREE, B, M, high, plan });
  // the two ships that landed first stay parked; the first ship built on the pad has launched, so a second one stands there now
  const ships = buildStarships({ THREE, B, M, high, ships: [
    { x: plan.land[0][0], z: plan.land[0][1], ry: 0.14 },
    { x: plan.land[1][0], z: plan.land[1][1], ry: -0.5 },
    { x: plan.build[0], z: plan.build[1], ry: 0.3, pad: plan.padR - 1.5 },
  ] });
  const tower = buildPadTower({ THREE, B, M, high, x: plan.tower[0], z: plan.tower[1], ship: plan.build });
  const merged = B.flush(root, 'colony');
  const life = buildLife({ THREE, root, plan, high, lamps: tower.lamps });
  for (const m of merged) if (m.material === M.glass) m.renderOrder = 2;

  // ---------------------------------------------------------------- lights: warm fill inside the big dome (compositor owns key + sky)
  const lights = [];
  if (high) {
    const d = colony.big, pl = new THREE.PointLight(0xffa860, 260, d.R * 1.8, 2);
    pl.position.set(d.x, d.y + d.R * 0.55, d.z + d.R * 0.15); pl.userData.role = 'domeGlow'; lights.push(pl); root.add(pl);
  }

  // ---------------------------------------------------------------- textures
  const tb = texBinder(THREE), meshesBy = new Map();
  root.traverse(o => { if (o.isMesh) { const k = o.material; (meshesBy.get(k) || meshesBy.set(k, []).get(k)).push(o); } });
  const rescaled = new Set();
  const fitUV = (mat, set) => { // rebake UVs if the set's texScale differs from the one we baked at
    const ts = set.texScale; if (ts == null) return;
    const [su, sv] = Array.isArray(ts) ? ts : [ts, ts], b = mat.userData.texScale; if (Math.abs(su - b) < 1e-6 && Math.abs(sv - b) < 1e-6) return;
    for (const m of meshesBy.get(mat) || []) { const g = m.geometry; if (rescaled.has(g)) continue; rescaled.add(g);
      const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * b / su, uv.getY(i) * b / sv); uv.needsUpdate = true; }
  };
  const bind = (mat, role, o = {}) => tb.bind(mat, role, { ...o, onApply: set => fitUV(mat, set) });
  bind(M.regolith, 'regolith', { color: 0xc8b0a4, normalScale: 0.9 });
  bind(M.rock, 'mars_rock', { color: 0xb09888, normalScale: 1 });
  bind(M.frame, 'dome_frame', { color: 0xffffff, normalScale: 0.5 });
  // foliage: leaf cards use the procedural atlas (leafAtlas), not the tiling foliage role
  bind(M.hab, 'habitat_panel', { color: 0xffffff, normalScale: 0.5 });
  bind(M.stainless, 'stainless', { color: 0xffffff, maps: ['normalMap', 'roughnessMap'], normalScale: 0.3, roughness: 1 });
  bind(M.flap, 'stainless', { maps: ['normalMap', 'roughnessMap'], normalScale: 0.3, roughness: 1.1 });
  bind(M.rover, 'rover_paint', { color: 0xffffff, normalScale: 0.4 });
  tb.bind(M.glass, 'dome_glass', { maps: ['roughnessMap'], custom: set => {
    if (set.roughnessMap && M.glass.roughnessMap !== set.roughnessMap) { M.glass.roughnessMap = set.roughnessMap; M.glass.roughness = 1; fitUV(M.glass, set); }
    if (set.dirtMap) glassU.uDust.value = set.dirtMap; } });
  M.stainless.metalnessMap = M.flap.metalnessMap = null; // ORM blue channel unused: steel is metal everywhere

  // ---------------------------------------------------------------- per frame: beacons blink, leaves breathe with the glow
  const beacon = M.beacon.color.clone();
  function update(t) {
    const ph = (t * 0.7) % 1; M.beacon.color.copy(beacon).multiplyScalar(ph < 0.07 ? 1 : 0.08);
    leafU.uBack.value.setRGB(0.55, 0.42, 0.12).multiplyScalar(1 + 0.06 * Math.sin(t * 0.6));
    life.update(t);
  }

  // stats
  let tris = 0, calls = 0, inst = 0; root.traverse(o => { if (o.isPoints) calls++; if (!o.isMesh) return; if (o.isInstancedMesh) inst += o.count; calls += o.material.transparent && o.material.side === THREE.DoubleSide ? 2 : 1;
    const g = o.geometry, n = (g.index ? g.index.count : g.attributes.position.count) / 3; tris += n * (o.isInstancedMesh ? o.count : 1); });

  return {
    root, lights, update,
    applyTextures(tex) { tb.apply(tex); },
    anchors: { steel: steelU, domes: colony.domes, rover: colony.rover, ships, tower, glass: M.glass, foliage: leafU.uBack, lights: life.lightsU, habs: life.habU },
    materials: M, plan, stats: { tris: Math.round(tris), drawCalls: calls, instances: inst, layout: plan.src, habs: plan.habs.length },
    dispose() { root.traverse(o => o.isMesh && o.geometry.dispose()); terrain.dispose(); life.dispose(); M.foliage.map?.dispose(); Object.values(M).forEach(m => m.dispose()); black.dispose(); },
  };
}
