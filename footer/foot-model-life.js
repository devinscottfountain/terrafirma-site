// D6.1 footer: the finished city's small stuff, as in the Jezero timelapse. Small geodesic hab domes (one instanced draw,
// struts drawn from barycentrics so they stay crisp and cheap, some panels lit warm from inside), the streetlights and
// lamps as soft additive points (one draw), rovers out on the ring road with headlights and a few suited figures (one
// instanced draw each). Everything animated is a pure function of t, so QA stills are repeatable.
import { geodesic, height, rng } from './foot-model-kit.js';

const TAU = Math.PI * 2;

export function buildLife({ THREE, root, plan, high, lamps = [] }) {
  const r = rng(404), V3 = THREE.Vector3, gy = height;
  const disposables = [], mats = [];

  // ---------------------------------------------------------------- hab domes: unit hemisphere + base ring, flat faces
  const { faces } = geodesic(THREE, 2), P = [], N = [], BC = [], F = [];
  const nrm = new V3(), e1 = new V3(), e2 = new V3();
  faces.forEach((f, i) => {
    e1.subVectors(f.v[1], f.v[0]); e2.subVectors(f.v[2], f.v[0]); nrm.crossVectors(e1, e2).normalize();
    f.v.forEach((v, k) => { P.push(v.x, v.y, v.z); N.push(nrm.x, nrm.y, nrm.z); BC.push(k === 0, k === 1, k === 2); F.push(i + 1); });
  });
  const RS = 14; // base ring wall, plain (bary 0 = frame colour)
  for (let i = 0; i < RS; i++) { const a0 = i / RS * TAU, a1 = (i + 1) / RS * TAU, c0 = Math.cos(a0), s0 = Math.sin(a0), c1 = Math.cos(a1), s1 = Math.sin(a1), am = (a0 + a1) / 2;
    for (const [x, y, z] of [[c0, -0.12, s0], [c1, -0.12, s1], [c1, 0.05, s1], [c0, -0.12, s0], [c1, 0.05, s1], [c0, 0.05, s0]]) { P.push(x * 1.02, y, z * 1.02); N.push(Math.cos(am), 0, Math.sin(am)); BC.push(0, 0, 0); F.push(0); } }
  const habGeo = new THREE.BufferGeometry();
  habGeo.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); habGeo.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
  habGeo.setAttribute('bary', new THREE.Float32BufferAttribute(BC, 3)); habGeo.setAttribute('fid', new THREE.Float32BufferAttribute(F, 1));
  disposables.push(habGeo);
  const habU = { uGlow: { value: new THREE.Color(0.95, 0.42, 0.12) } };
  const habMat = new THREE.MeshStandardMaterial({ color: 0xd8d2c8, roughness: 0.55, metalness: 0.1, side: THREE.DoubleSide });
  habMat.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, habU);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', `#include <common>
      attribute vec3 bary; attribute float fid; attribute float htype; varying vec3 vBary; varying float vLit, vFr;
      float hh(float n){ return fract(sin(n) * 43758.5453); }`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>
      vBary = bary; vFr = fid < 0.5 ? 1. : 0.;
      vec2 ip = vec2(instanceMatrix[3].x, instanceMatrix[3].z);
      float hab = hh(dot(ip, vec2(0.371, 0.913))), lit = hh(fid * 7.13 + hab * 91.7), y = position.y;
      // the timelapse's four dome types, at dusk: 0 mostly glass (scattered rooms lit), 1 skylight crown, 2 eye-level window
      // band, 3 mixed. Some habs are asleep (dark).
      float p = htype < 0.5 ? 0.16 : htype < 1.5 ? 0.5 * step(0.8, y) : htype < 2.5 ? 0.42 * step(0.12, y) * step(y, 0.5) : 0.12;
      vLit = fid < 0.5 || hab < 0.2 ? 0. : step(lit, p) * (0.5 + hh(fid + hab * 13.));`);
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform vec3 uGlow; varying vec3 vBary; varying float vLit, vFr;')
      .replace('#include <color_fragment>', `#include <color_fragment>
      float be = min(vBary.x, min(vBary.y, vBary.z)), bw = fwidth(be);
      float strut = max(vFr, 1. - smoothstep(0.07 - bw, 0.07 + bw, be));
      diffuseColor.rgb = mix(vec3(0.05, 0.045, 0.04), diffuseColor.rgb, strut);`)
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = mix(0.18, roughnessFactor, strut);')
      .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\ntotalEmissiveRadiance += uGlow * vLit * (1. - strut);');
  };
  habMat.customProgramCacheKey = () => 'd61-hab';
  mats.push(habMat);
  const habs = new THREE.InstancedMesh(habGeo, habMat, plan.habs.length);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s3 = new V3(), p3 = new V3(), Y = new V3(0, 1, 0), col = new THREE.Color();
  plan.habs.forEach((h, i) => {
    m4.compose(p3.set(h.x, gy(h.x, h.z) + 0.05, h.z), q.setFromAxisAngle(Y, h.ry), s3.set(h.r, h.r * h.ys, h.r)); habs.setMatrixAt(i, m4);
    habs.setColorAt(i, col.setHSL(0.08, 0.06 + h.seed * 0.06, 0.62 + h.seed * 0.16));   // seed is 0..1
  });
  habGeo.setAttribute('htype', new THREE.InstancedBufferAttribute(new Float32Array(plan.habs.map(h => h.type)), 1));
  habs.computeBoundingSphere(); habs.name = 'habs'; root.add(habs);

  // ---------------------------------------------------------------- rovers (instanced, vertex colour) + suited figures
  const part = (g, c) => { const n = g.index ? g.toNonIndexed() : g; const cc = new Float32Array(n.attributes.position.count * 3); for (let i = 0; i < cc.length; i += 3) cc.set(c, i); n.setAttribute('color', new THREE.BufferAttribute(cc, 3)); n.deleteAttribute('uv'); return n; };
  const merge = gs => { const out = new THREE.BufferGeometry(), keys = ['position', 'normal', 'color'];
    for (const k of keys) { const arr = new Float32Array(gs.reduce((a, g) => a + g.attributes[k].array.length, 0)); let o = 0; for (const g of gs) { arr.set(g.attributes[k].array, o); o += g.attributes[k].array.length; } out.setAttribute(k, new THREE.BufferAttribute(arr, 3)); }
    gs.forEach(g => g.dispose()); return out; };
  const paint = [0.86, 0.84, 0.8], dark = [0.06, 0.06, 0.065], solar = [0.05, 0.08, 0.14], suit = [0.82, 0.8, 0.76], visor = [0.25, 0.16, 0.06];
  const roverGeo = merge([
    part(new THREE.BoxGeometry(5.4, 1.5, 2.3).translate(-0.1, 1.55, 0), paint), part(new THREE.BoxGeometry(1.0, 0.8, 2.2).translate(2.55, 1.6, 0), dark),
    part(new THREE.BoxGeometry(5.2, 0.3, 2.2).translate(-0.1, 0.65, 0), dark), part(new THREE.BoxGeometry(3.2, 0.06, 2.0).translate(-0.9, 2.36, 0), solar),
    ...[-2, 0, 2].flatMap(wx => [-1, 1].map(s => part(new THREE.CylinderGeometry(0.55, 0.55, 0.42, 10).rotateX(Math.PI / 2).translate(wx, 0.55, s * 1.3), dark))),
  ]);
  const figGeo = merge([
    part(new THREE.BoxGeometry(0.22, 0.85, 0.24).translate(-0.13, 0.43, 0), suit), part(new THREE.BoxGeometry(0.22, 0.85, 0.24).translate(0.13, 0.43, 0), suit),
    part(new THREE.BoxGeometry(0.5, 0.62, 0.32).translate(0, 1.16, 0), suit), part(new THREE.BoxGeometry(0.42, 0.5, 0.22).translate(0, 1.2, -0.26), suit),
    part(new THREE.SphereGeometry(0.16, 8, 6).translate(0, 1.64, 0), suit), part(new THREE.BoxGeometry(0.2, 0.12, 0.06).translate(0, 1.65, 0.14), visor),
    part(new THREE.BoxGeometry(0.12, 0.6, 0.14).translate(-0.31, 1.12, 0), suit), part(new THREE.BoxGeometry(0.12, 0.6, 0.14).translate(0.31, 1.12, 0), suit),
  ]);
  disposables.push(roverGeo, figGeo);
  const bodyMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.55, metalness: 0.1 }); mats.push(bodyMat);
  // rovers: two parked (pad, ships), five driving the ring roads at walking-car pace. Continuous loops (no jumps on any
  // screen width); spaced so one is usually crossing the near arc of the outer ring, in front of the city.
  const ROV = [0, 1, 2].map(k => ({ R: 204 + 1.3, a0: 1.3 + k * TAU / 3, v: 3.5 })).concat([0, 1].map(k => ({ R: 132 - 1.3, a0: 5.44 + k * Math.PI, v: -2.8 })));
  const verge = (R, a, turn = 0) => { const [x, z] = plan.ring(R, a), [x2, z2] = plan.ring(R, a + 0.01); return [x, z, Math.atan2(-(z2 - z), x2 - x) + turn]; };
  const parked = [[plan.build[0] + 24, plan.build[1] + 14, 2.2], verge(212, 2.93, -0.3)];
  const rovers = new THREE.InstancedMesh(roverGeo, bodyMat, ROV.length + parked.length); rovers.name = 'rovers'; rovers.frustumCulled = false; root.add(rovers);
  parked.forEach(([x, z, ry], i) => { m4.compose(p3.set(x, gy(x, z) + 0.05, z), q.setFromAxisAngle(Y, ry), s3.set(1, 1, 1)); rovers.setMatrixAt(ROV.length + i, m4); });
  // figures: out on the outer ring's verge (in front of the lit habs, so they read as silhouettes): a pair by each parked
  // rover (colony.js parks one at ring 211 / 3.3), one at the pad apron, one walking the verge
  const FIG = [verge(214.2, 3.288, 1.2), verge(213.4, 3.296, -2), verge(214, 2.938, 0.6), verge(215, 2.921, 2.4), [plan.build[0] - 9, plan.build[1] + 14, 0.4], verge(216.5, 3.12)];
  const WALK = { i: 5, R: 216.5, a: [3.105, 3.15], T: 34 };
  const figs = new THREE.InstancedMesh(figGeo, bodyMat, FIG.length); figs.name = 'figures'; figs.frustumCulled = false; root.add(figs);
  FIG.forEach(([x, z, ry], i) => { m4.compose(p3.set(x, gy(x, z), z), q.setFromAxisAngle(Y, ry), s3.set(1, 1, 1)); figs.setMatrixAt(i, m4); });

  // ---------------------------------------------------------------- light points: static lamps + dynamic (rover lights, distant traffic)
  const LP = [], LC = [], LS = [];
  const add = (x, y, z, c, s) => { LP.push(x, y, z); LC.push(...c); LS.push(s); };
  const STREET = [1.0, 0.62, 0.28], LAMP = [1.0, 0.8, 0.55], HEAD = [1.0, 0.94, 0.82], TAIL = [1.0, 0.12, 0.05];
  for (const [x, z] of plan.street) add(x, gy(x, z) + 1.6, z, STREET.map(v => v * (0.75 + 0.5 * r())), 1);
  for (const [x, y, z] of lamps) add(x, y, z, LAMP, 1.4);
  const nStatic = LS.length;
  const TRAF = high ? 12 : 6, traffic = [];
  for (let i = 0; i < TRAF; i++) traffic.push({ R: plan.rings[1 + (i % 2)] + (i % 4 < 2 ? 1.2 : -1.2), a: r() * TAU, v: (r() < 0.5 ? -1 : 1) * (5 + r() * 4) });
  const dyn = ROV.length * 4 + TRAF;
  for (let i = 0; i < dyn; i++) add(0, -999, 0, [0, 0, 0], 1);
  const lg = new THREE.BufferGeometry();
  const lpos = new THREE.Float32BufferAttribute(LP, 3); lpos.setUsage(THREE.DynamicDrawUsage);
  const lcol = new THREE.Float32BufferAttribute(LC, 3); lcol.setUsage(THREE.DynamicDrawUsage);
  lg.setAttribute('position', lpos); lg.setAttribute('color', lcol); lg.setAttribute('size', new THREE.Float32BufferAttribute(LS, 1));
  disposables.push(lg);
  const ptU = { uPR: { value: 1 }, uK: { value: 1 } };
  const ptMat = new THREE.ShaderMaterial({
    uniforms: ptU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
    vertexShader: `attribute vec3 color; attribute float size; uniform float uPR; varying vec3 vC; varying float vA;
      void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.); float d = -mv.z;
        // a lamp is a fixed number of px wide (never subpixel, never shimmers); far ones fade instead of shrinking
        vA = smoothstep(1400., 250., d) * (0.55 + 0.45 * smoothstep(900., 150., d)); vC = color;
        gl_PointSize = clamp(size * 820. / d, 1.7, 6.) * uPR; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform float uK; varying vec3 vC; varying float vA; void main(){ float d = length(gl_PointCoord - .5);
      float k = smoothstep(.5, .0, d); gl_FragColor = vec4(vC * vA * uK * (k * k * 3.2 + k * 0.6), 1.); }`,
  });
  mats.push(ptMat);
  const pts = new THREE.Points(lg, ptMat); pts.frustumCulled = false; pts.renderOrder = 3; pts.name = 'lights';
  pts.onBeforeRender = rd => { ptU.uPR.value = rd.getPixelRatio(); };
  root.add(pts);

  // ---------------------------------------------------------------- per frame
  const fwd = new V3(), side = new V3();
  const setL = (k, x, y, z, c) => { lpos.setXYZ(nStatic + k, x, y, z); lcol.setXYZ(nStatic + k, c[0], c[1], c[2]); };
  function update(t) {
    ROV.forEach((v, i) => {
      const a = v.a0 + t * v.v / v.R;
      const [x, z] = plan.ring(v.R, a), [x2, z2] = plan.ring(v.R, a + Math.sign(v.v) * 0.01), y = gy(x, z) + 0.04;
      fwd.set(x2 - x, 0, z2 - z).normalize(); side.set(-fwd.z, 0, fwd.x);
      const ry = Math.atan2(-fwd.z, fwd.x);
      m4.compose(p3.set(x, y + 0.03 * Math.sin(t * 2.1 + i), z), q.setFromAxisAngle(Y, ry), s3.set(1, 1, 1)); rovers.setMatrixAt(i, m4);
      for (const [k, sd] of [[0, -0.8], [1, 0.8]]) setL(i * 4 + k, x + fwd.x * 3.05 + side.x * sd, y + 1.25, z + fwd.z * 3.05 + side.z * sd, HEAD.map(c => c * 1.6));
      for (const [k, sd] of [[2, -0.9], [3, 0.9]]) setL(i * 4 + k, x - fwd.x * 2.8 + side.x * sd, y + 1.2, z - fwd.z * 2.8 + side.z * sd, TAIL);
    });
    rovers.instanceMatrix.needsUpdate = true;
    traffic.forEach((c, k) => { const [x, z] = plan.ring(c.R, c.a + t * c.v / c.R); setL(ROV.length * 4 + k, x, gy(x, z) + 1, z, c.v > 0 ? HEAD : TAIL); });
    lpos.clearUpdateRanges?.(); lcol.clearUpdateRanges?.();
    lpos.addUpdateRange?.(nStatic * 3, dyn * 3); lcol.addUpdateRange?.(nStatic * 3, dyn * 3);
    lpos.needsUpdate = lcol.needsUpdate = true;
    // the walker: slow out-and-back along the dome front, turning at each end
    const ph = (t / WALK.T) % 1, w = ph < 0.5 ? ph * 2 : 2 - ph * 2, e = w * w * (3 - 2 * w), dir = ph < 0.5 ? 0 : Math.PI;
    const [x, z, ry] = verge(WALK.R, WALK.a[0] + (WALK.a[1] - WALK.a[0]) * e);
    // rotY(ry + pi/2) turns the figure's +z (visor) side onto the road tangent; out and back
    m4.compose(p3.set(x, gy(x, z) + 0.02 * Math.abs(Math.sin(t * 5.5)), z), q.setFromAxisAngle(Y, ry + Math.PI / 2 + dir), s3.set(1, 1, 1)); figs.setMatrixAt(WALK.i, m4);
    figs.instanceMatrix.needsUpdate = true;
  }
  update(0);

  let tris = habGeo.attributes.position.count / 3 * plan.habs.length + roverGeo.attributes.position.count / 3 * (ROV.length + parked.length) + figGeo.attributes.position.count / 3 * FIG.length;
  return {
    update, objects: { habs, rovers, figs, pts }, lightsU: ptU, habU,
    stats: { habs: plan.habs.length, lights: LS.length, tris: Math.round(tris) },
    dispose() { disposables.forEach(g => g.dispose()); mats.forEach(m => m.dispose()); },
  };
}
