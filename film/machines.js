// machines.js: procedural construction equipment for the Austin lot in site.js, built to read as real kit from a
// high oblique 130-400 m up. Real proportions (CAT 336, tri-axle dump, D6, 4-axle boom pump, tri-axle mixer,
// flat-top tower crane), colour breakup in vertex colours, and one shared "grime" shader that adds height-based
// dust, mottled dirt and rust in object space so it never crawls when a machine moves.
// Everything is merged per material per moving part, so the whole yard is a few dozen draw calls.
// Units are metres; forward of every vehicle is +x, right is +z, up is +y.
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const NOISE = /* glsl */ `
float mh3(vec3 p){ p=fract(p*.3183099+.1); p*=17.; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
float mn3(vec3 x){ vec3 i=floor(x),f=fract(x); f=f*f*(3.-2.*f);
  return mix(mix(mix(mh3(i),mh3(i+vec3(1,0,0)),f.x),mix(mh3(i+vec3(0,1,0)),mh3(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(mh3(i+vec3(0,0,1)),mh3(i+vec3(1,0,1)),f.x),mix(mh3(i+vec3(0,1,1)),mh3(i+vec3(1,1,1)),f.x),f.y),f.z); }
float mf3(vec3 p){ return .5*mn3(p)+.25*mn3(p*2.07+3.1)+.125*mn3(p*4.13+7.7)+.125*mn3(p*8.31+1.3); }
`;
// aG = (height above the machine's ground at rest, dirtiness 0..1, rust 0..1)
const GRIME = /* glsl */ `
  vec3 gq = vMObj;
  float gn1 = mf3(gq*1.35), gn2 = mn3(gq*vec3(5.,.9,5.)+2.3);
  float mDust = clamp(1. - vMG.x/1.5 + (gn1-.5)*1.1, 0., 1.);
  mDust = mDust*mDust*(3.-2.*mDust) * (.15 + .6*vMG.y);
  mDust = clamp(mDust + max(vMN.y,0.)*.28*vMG.y*smoothstep(.35,.7,gn1), 0., 1.);
  float mGr = smoothstep(.48,.86, mf3(gq*3.2+5.)) * (.2 + .8*vMG.y);
  float mRust = smoothstep(.58,.78, mf3(gq*4.6+11.)) * vMG.z;
  diffuseColor.rgb *= 1. - mGr*.5 - (gn2-.5)*.22*vMG.y;
  diffuseColor.rgb = mix(diffuseColor.rgb, uRust*(.65+.7*gn2), mRust);
  diffuseColor.rgb = mix(diffuseColor.rgb, uDust*(.7+.5*gn1), mDust*.8);
`;

export function createMachines({ THREE, group, D = 4 }) {
  const V3 = THREE.Vector3, Q = THREE.Quaternion;
  let seed = 1337;
  const rnd = () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  let TRIS = 0;

  // ------------------------------------------------------------ materials
  const env = (() => { // equirect sky for glass + steel: blue zenith, bright hazy horizon, warm dirt below
    const c = document.createElement('canvas'); c.width = 256; c.height = 128; const x = c.getContext('2d');
    const gr = x.createLinearGradient(0, 0, 0, 128);
    gr.addColorStop(0, '#3d6db5'); gr.addColorStop(0.3, '#7aa2d6'); gr.addColorStop(0.47, '#dfe8ef'); gr.addColorStop(0.5, '#f4f2ea');
    gr.addColorStop(0.52, '#8c7e69'); gr.addColorStop(1, '#3b332a'); x.fillStyle = gr; x.fillRect(0, 0, 256, 128);
    for (let i = 0; i < 24; i++) { const cx = rnd() * 256, cy = 18 + rnd() * 38, r = 6 + rnd() * 16, g = x.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, 'rgba(255,255,255,0.55)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(cx - r, cy - r, 2 * r, 2 * r); }
    const t = new THREE.CanvasTexture(c); t.mapping = THREE.EquirectangularReflectionMapping; t.colorSpace = THREE.SRGBColorSpace; return t;
  })();
  const dustC = new THREE.Color(0xa58f70), rustC = new THREE.Color(0x6a3418);
  const grime = (m, key) => {
    m.onBeforeCompile = sh => {
      sh.uniforms.uDust = { value: dustC }; sh.uniforms.uRust = { value: rustC };
      sh.vertexShader = 'attribute vec3 aG; varying vec3 vMG, vMObj, vMN;\n' + sh.vertexShader.replace('#include <begin_vertex>',
        '#include <begin_vertex>\nvMG = aG; vMN = normal; vMObj = position * vec3(length(modelMatrix[0].xyz), length(modelMatrix[1].xyz), length(modelMatrix[2].xyz));');
      sh.fragmentShader = 'uniform vec3 uDust, uRust; varying vec3 vMG, vMObj, vMN;\n' + NOISE + sh.fragmentShader
        .replace('#include <color_fragment>', '#include <color_fragment>\n' + GRIME)
        .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = clamp(roughnessFactor + mDust*.4 + mRust*.3 + mGr*.1, 0., 1.);')
        .replace('#include <metalnessmap_fragment>', '#include <metalnessmap_fragment>\nmetalnessFactor *= 1. - max(mDust, mRust);');
    };
    m.customProgramCacheKey = () => 'tfmach-' + key; return m;
  };
  const S = o => new THREE.MeshStandardMaterial({ vertexColors: true, ...o });
  const MAT = {
    paint: grime(S({ roughness: 0.46, metalness: 0, envMap: env, envMapIntensity: 0.35 }), 'paint'),
    rough: grime(S({ roughness: 0.93, metalness: 0 }), 'rough'),
    metal: grime(S({ roughness: 0.34, metalness: 0.85, envMap: env, envMapIntensity: 1 }), 'metal'),
    glass: S({ roughness: 0.06, metalness: 0.82, envMap: env, envMapIntensity: 1.25 }),
    glow: new THREE.MeshBasicMaterial({ vertexColors: true }),
  };

  // ------------------------------------------------------------ geometry kit: collect parts per material, bake colour + grime data, merge
  const T = (x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, s = 1) => new THREE.Matrix4().compose(new V3(x, y, z), new Q().setFromEuler(new THREE.Euler(rx, ry, rz)), typeof s === 'number' ? new V3(s, s, s) : new V3(...s));
  const tc = new THREE.Color(), YA = new V3(0, 1, 0);
  const Kit = (h0 = 0, dirt0 = 0.5) => {
    const L = {};
    const k = {
      add(kind, color, geo, m, o = {}) {
        const g = geo.index ? geo.toNonIndexed() : geo.clone(); if (m) g.applyMatrix4(m);
        for (const a of Object.keys(g.attributes)) if (a !== 'position' && a !== 'normal') g.deleteAttribute(a);
        const p = g.attributes.position, n = p.count, cA = new Float32Array(n * 3), gA = new Float32Array(n * 3);
        const base = new THREE.Color(color), j = 1 + (rnd() - 0.5) * 2 * (o.jit ?? 0.035), h = o.h ?? h0, dirt = o.dirt ?? dirt0, rust = o.rust ?? 0;
        for (let i = 0; i < n; i += 3) {
          let c = base;
          if (o.cf) { const r = o.cf((p.getX(i) + p.getX(i + 1) + p.getX(i + 2)) / 3, (p.getY(i) + p.getY(i + 1) + p.getY(i + 2)) / 3, (p.getZ(i) + p.getZ(i + 1) + p.getZ(i + 2)) / 3); c = r.isColor ? r : tc.set(r); }
          for (let v = i; v < i + 3; v++) {
            let cc = c; if (o.vf) { const r = o.vf(p.getX(v), p.getY(v), p.getZ(v)); cc = r.isColor ? r : tc.set(r); }
            cA[v * 3] = cc.r * j; cA[v * 3 + 1] = cc.g * j; cA[v * 3 + 2] = cc.b * j;
            gA[v * 3] = p.getY(v) + h; gA[v * 3 + 1] = dirt; gA[v * 3 + 2] = rust;
          }
        }
        g.setAttribute('color', new THREE.BufferAttribute(cA, 3)); g.setAttribute('aG', new THREE.BufferAttribute(gA, 3));
        (L[kind] ||= []).push(g); return k;
      },
      B(kind, color, x0, y0, z0, x1, y1, z1, o) { return k.add(kind, color, new THREE.BoxGeometry(Math.abs(x1 - x0), Math.abs(y1 - y0), Math.abs(z1 - z0)), T((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2), o); },
      // cylinder between two points
      rod(kind, color, a, b, r, seg = 8, o, r2) {
        const A = new V3(...a), Bv = new V3(...b), d = Bv.clone().sub(A), len = d.length();
        const m = new THREE.Matrix4().compose(A.clone().add(Bv).multiplyScalar(0.5), new Q().setFromUnitVectors(YA, d.normalize()), new V3(1, 1, 1));
        return k.add(kind, color, new THREE.CylinderGeometry(r2 ?? r, r, len, seg), m, o);
      },
      // square bar between two points
      bar(kind, color, a, b, t, o) {
        const A = new V3(...a), Bv = new V3(...b), d = Bv.clone().sub(A), len = d.length();
        const m = new THREE.Matrix4().compose(A.clone().add(Bv).multiplyScalar(0.5), new Q().setFromUnitVectors(YA, d.normalize()), new V3(1, 1, 1));
        return k.add(kind, color, new THREE.BoxGeometry(t, len, t), m, o);
      },
      geo(kind) { const g = mergeGeometries(L[kind]); TRIS += g.attributes.position.count / 3; return g; },
      build(parent) {
        const out = {};
        for (const kind in L) {
          const mesh = new THREE.Mesh(k.geo(kind), MAT[kind]);
          mesh.castShadow = kind !== 'glow'; mesh.receiveShadow = true; parent.add(mesh); out[kind] = mesh;
        }
        return out;
      },
    };
    return k;
  };
  const shapeOf = pts => new THREE.Shape(pts.map(p => new THREE.Vector2(p[0], p[1])));
  const extrude = (shape, depth, bevel = 0, curve = 6) => new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: bevel > 0, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 1, curveSegments: curve }).translate(0, 0, -depth / 2);
  const stadium = (len, r) => { const s = new THREE.Shape(), a = len / 2 - r; s.moveTo(-a, 0); s.lineTo(a, 0); s.absarc(a, r, r, -Math.PI / 2, Math.PI / 2, false); s.lineTo(-a, 2 * r); s.absarc(-a, r, r, Math.PI / 2, Math.PI * 1.5, false); return s; };
  const wheel = (k, x, y, z, r, w, rim = 0x8a8984, o = {}) => { // tyre + rim, axis along z, rim faces outward
    const s = Math.sign(z) || 1;
    k.rod('rough', 0x161514, [x, y, z - w / 2], [x, y, z + w / 2], r, 16, { dirt: 1, h: 0, ...o });
    k.rod('metal', rim, [x, y, z + s * (w / 2 - 0.02)], [x, y, z + s * (w / 2 + 0.012)], r * 0.6, 12, { dirt: 0.9, h: 0, rust: 0.3 });
    k.rod('metal', 0x3a3936, [x, y, z + s * (w / 2)], [x, y, z + s * (w / 2 + 0.05)], r * 0.22, 8, { dirt: 0.9, h: 0 });
  };

  // palette
  const CAT = 0xe2a50f, CATd = 0xc98f0c, BLK = 0x1d1d1c, DKG = 0x2b2b29, STEEL = 0x77746e, CHROME = 0xd2d2cf, GLS = 0x4a5a66, AMBER = 0xffa21a, RED = 0xff2a14;

  // ------------------------------------------------------------ CAT 336 excavator (11 m shipping length, 2.6 m gauge, 3.5 m tail swing)
  const excavator = () => {
    const g = new THREE.Group(); group.add(g);
    const ku = Kit(0, 1);
    for (const s of [-1, 1]) {
      const zc = s * 1.3;
      ku.add('rough', 0x232120, extrude(stadium(4.86, 0.49), 0.6, 0, 7), T(0, 0, zc), { dirt: 1, rust: 0.15 });
      for (let i = 0; i < 18; i++) { const x = -1.94 + i * 0.228; ku.B('rough', 0x3d3935, x - 0.035, 0.975, zc - 0.3, x + 0.035, 1.035, zc + 0.3, { dirt: 0.9, rust: 0.4 }); }
      for (const x of [-1.95, 1.95]) ku.rod('metal', 0x4b4843, [x, 0.49, zc + s * 0.29], [x, 0.49, zc + s * 0.34], 0.36, 12, { dirt: 1, rust: 0.4 });
      ku.B('rough', 0x2a2826, -1.5, 0.28, zc - s * 0.34, 1.5, 0.72, zc - s * 0.29, { dirt: 1 }); // inner track frame face
    }
    ku.B('rough', BLK, -1.15, 0.45, -1.0, 1.15, 1.0, 1.0, { dirt: 0.95 });
    ku.rod('metal', 0x2d2c2a, [0, 0.98, 0], [0, 1.1, 0], 1.02, 18, { dirt: 0.8 });
    ku.build(g);

    const up = new THREE.Group(); up.position.y = 1.1; g.add(up);
    const k = Kit(1.1, 0.55);
    k.B('rough', 0x222221, -2.45, 0, -1.49, 1.55, 0.26, 1.49, { dirt: 0.8 });
    // counterweight: black, rounded to the 3.45 m tail swing radius
    { const R = 3.45, pts = [[-2.42, -1.49]]; for (let i = 0; i <= 10; i++) { const z = -1.49 + i * 0.298; pts.push([-Math.sqrt(R * R - z * z), z]); } pts.push([-2.42, 1.49]);
      k.add('paint', 0x1b1b1a, extrude(shapeOf(pts), 1.12, 0.05).rotateX(-Math.PI / 2).translate(0, 0.25, 0), null, { dirt: 0.55, rust: 0.12 }); }
    // engine hood and pump compartment
    k.B('paint', CAT, -2.42, 0.26, -1.49, -0.36, 1.24, 1.49, { dirt: 0.5, rust: 0.05 });
    k.B('rough', 0x121212, -2.2, 1.24, 0.08, -1.2, 1.265, 1.32, { dirt: 0.4 }); // radiator grille
    k.B('rough', 0x121212, -1.05, 1.24, -1.32, -0.55, 1.265, -0.6, { dirt: 0.4 });
    for (let i = 0; i < 6; i++) k.B('paint', CATd, -2.2 + i * 0.18, 1.265, 0.1, -2.2 + i * 0.18 + 0.03, 1.275, 1.3); // grille slats
    k.rod('metal', 0x2a2826, [-1.7, 1.2, 0.6], [-1.7, 1.78, 0.6], 0.075, 8, { rust: 0.7, dirt: 0.3 }); // exhaust stack
    k.rod('paint', 0x151515, [-0.78, 1.2, 1.18], [-0.78, 1.55, 1.18], 0.11, 8);
    // handrails along both hood edges
    for (const z of [1.43, -1.43]) { const x0 = -2.3, x1 = z > 0 ? -0.45 : -0.55;
      k.bar('paint', CAT, [x0, 1.72, z], [x1, 1.72, z], 0.045);
      for (const x of [x0, (x0 + x1) / 2, x1]) k.bar('paint', CAT, [x, 1.24, z], [x, 1.74, z], 0.045); }
    // right front: tool box / fuel tank, anti-slip top, rail
    k.B('paint', CAT, -0.36, 0.26, 0.86, 1.55, 1.1, 1.49);
    k.B('rough', 0x30302e, -0.3, 1.1, 0.9, 1.5, 1.118, 1.45, { dirt: 0.8 });
    k.bar('paint', CAT, [-0.3, 1.58, 1.46], [1.5, 1.58, 1.46], 0.04); k.bar('paint', CAT, [1.5, 1.1, 1.46], [1.5, 1.6, 1.46], 0.04); k.bar('paint', CAT, [0.6, 1.1, 1.46], [0.6, 1.6, 1.46], 0.04);
    // boom foot bracket
    k.B('paint', CAT, 0.25, 0.26, 0.06, 1.55, 1.3, 0.18); k.B('paint', CAT, 0.25, 0.26, 0.72, 1.55, 1.3, 0.84);
    k.B('rough', 0x232323, 0.15, 0.26, 0.18, 1.55, 0.62, 0.72);
    // cab (left front): black frame, big glass, skylight, beacon
    k.B('paint', 0x1e1e1d, -0.36, 0.26, -1.49, 1.5, 0.86, -0.52, { dirt: 0.6 });
    k.B('glass', GLS, -0.33, 0.86, -1.47, 1.47, 1.96, -0.54);
    for (const x of [-0.31, 0.62, 1.45]) for (const z of [-1.445, -0.565]) k.B('paint', 0x1e1e1d, x - 0.045, 0.86, z - 0.045, x + 0.045, 1.96, z + 0.045);
    k.B('paint', 0x2c2c2a, -0.4, 1.96, -1.52, 1.53, 2.07, -0.49, { dirt: 0.35 });
    k.B('glass', GLS, 0.2, 2.07, -1.3, 1.25, 2.085, -0.71);
    k.rod('glow', AMBER, [-0.22, 2.07, -0.66], [-0.22, 2.21, -0.66], 0.07, 8);
    // mirrors on stalks
    k.bar('metal', 0x222222, [1.45, 1.1, 1.47], [1.62, 1.85, 1.62], 0.03); k.B('glass', 0x6f7f8a, 1.57, 1.72, 1.52, 1.64, 2.02, 1.78);
    k.bar('metal', 0x222222, [1.48, 1.4, -1.5], [1.66, 1.95, -1.64], 0.03); k.B('glass', 0x6f7f8a, 1.6, 1.85, -1.75, 1.67, 2.12, -1.52);
    k.build(up);

    // boom: banana profile, pivot at (1.1, 1.0, 0.45) in up space, tip pin at (6.4, 0, 0)
    const boom = new THREE.Group(); boom.position.set(1.1, 1.0, 0.45); up.add(boom);
    const kb = Kit(2.1, 0.45);
    kb.add('paint', CAT, extrude(shapeOf([[-0.42, -0.3], [-0.42, 0.28], [0.6, 0.64], [2.9, 1.4], [5.6, 0.52], [6.62, 0.26], [6.62, -0.26], [5.6, -0.2], [2.9, 0.56], [0.6, -0.24]]), 0.6, 0.035), null, { rust: 0.05 });
    kb.rod('metal', 0x3a3a38, [6.4, 0, -0.42], [6.4, 0, 0.42], 0.13, 10); kb.rod('metal', 0x3a3a38, [0, 0, -0.4], [0, 0, 0.4], 0.16, 10);
    for (const s of [-1, 1]) { // twin boom cylinders
      kb.rod('paint', 0x2a2a28, [0.12, -0.78, s * 0.42], [1.7, -0.07, s * 0.42], 0.12, 10);
      kb.rod('metal', CHROME, [1.7, -0.07, s * 0.42], [2.6, 0.4, s * 0.42], 0.065, 8, { dirt: 0.2 });
    }
    kb.rod('paint', 0x2a2a28, [2.4, 1.48, 0], [5.1, 1.07, 0], 0.12, 10); // stick cylinder
    kb.rod('metal', CHROME, [5.1, 1.07, 0], [6.8, 0.8, 0], 0.07, 8, { dirt: 0.2 });
    kb.B('paint', CAT, 2.25, 1.2, -0.16, 2.6, 1.6, 0.16);
    kb.bar('rough', 0x111111, [0.7, 0.72, 0.2], [2.8, 1.47, 0.2], 0.05); kb.bar('rough', 0x111111, [2.8, 1.47, 0.2], [6.0, 0.48, 0.2], 0.05); // hydraulic lines
    kb.build(boom);

    // stick (3.2 m) and bucket
    const stick = new THREE.Group(); stick.position.set(6.4, 0, 0); boom.add(stick);
    const ks = Kit(1.2, 0.8);
    ks.add('paint', CAT, extrude(shapeOf([[-0.88, 0.14], [-0.88, 0.56], [-0.2, 0.5], [3.32, 0.2], [3.32, -0.2], [0, -0.38]]), 0.46, 0.02), null, { rust: 0.1 });
    ks.rod('paint', 0x2a2a28, [-0.05, 0.64, 0], [1.75, 0.53, 0], 0.1, 10); ks.rod('metal', CHROME, [1.75, 0.53, 0], [2.85, 0.46, 0], 0.06, 8, { dirt: 0.3 });
    ks.B('rough', 0x2a2826, 2.75, 0.18, -0.22, 3.3, 0.52, 0.22, { rust: 0.4 });
    ks.rod('metal', 0x3a3a38, [3.2, 0, -0.32], [3.2, 0, 0.32], 0.1, 8, { rust: 0.4 });
    ks.build(stick);
    const bucket = new THREE.Group(); bucket.position.set(3.2, 0, 0); stick.add(bucket);
    const kk = Kit(0.9, 0.9);
    kk.add('paint', 0x2b2925, extrude(shapeOf([[-0.15, 0.25], [0.45, 0.42], [1.05, 0.3], [1.48, 0.0], [1.7, -0.45], [1.62, -0.62], [1.2, -0.55], [0.55, -0.34], [0.05, -0.1]]), 1.4, 0.02), null, { rust: 0.55 });
    kk.B('rough', 0x6a5640, 0.5, -0.4, -0.66, 1.5, -0.3, 0.66, { dirt: 1 }); // packed dirt in the mouth
    for (let i = 0; i < 5; i++) { const z = -0.56 + i * 0.28; kk.bar('metal', 0x8b857a, [1.62, -0.6, z], [1.84, -0.82, z], 0.1, { rust: 0.3 }); }
    kk.build(bucket);
    return { g, up, boom, stick, bucket };
  };

  // ------------------------------------------------------------ tri-axle dump truck (9.6 m), forward +x
  const TRUCK = [
    { cab: 0xe8e6e1, bed: 0x80868b, load: 0x6e5641 }, { cab: 0x8a1d18, bed: 0xb38a22, load: 0xa08b6c },
    { cab: 0x1d3557, bed: 0x2c2e31, load: 0x7a6248 }, { cab: 0xe8e6e1, bed: 0x93332a, load: 0x8f7a5c },
  ];
  const truck = i => {
    const P = TRUCK[i], g = new THREE.Group(); group.add(g);
    const k = Kit(0, 0.55);
    // chassis
    for (const z of [-0.45, 0.45]) k.B('rough', 0x161616, -4.65, 0.72, z - 0.06, 4.7, 1.0, z + 0.06, { dirt: 0.9 });
    k.B('metal', 0x1a1a1a, 4.7, 0.55, -1.24, 4.95, 0.95, 1.24, { dirt: 0.8 }); // bumper
    // hood (tapered) + grille + fenders
    k.add('paint', P.cab, extrude(shapeOf([[3.0, 1.0], [4.75, 1.0], [4.75, 1.92], [3.0, 2.12]]), 1.12, 0.04), null);
    k.B('metal', 0x2a2a2a, 4.74, 1.0, -0.52, 4.8, 1.9, 0.52); for (let j = 0; j < 7; j++) k.B('metal', 0xbcbcb8, 4.8, 1.05 + j * 0.12, -0.5, 4.82, 1.09 + j * 0.12, 0.5, { dirt: 0.3 });
    for (const z of [-1, 1]) { k.B('paint', 0x1d1d1c, 2.75, 1.0, z * 0.62, 4.15, 1.12, z * 1.26, { dirt: 0.8 }); k.B('glow', 0xfff4dc, 4.76, 1.2, z * 0.62 - 0.12, 4.78, 1.35, z * 0.62 + 0.12); }
    // cab
    k.B('paint', P.cab, 1.65, 1.0, -1.15, 3.02, 3.05, 1.15);
    k.B('glass', GLS, 3.0, 2.2, -1.0, 3.05, 2.85, 1.0); for (const z of [-1, 1]) k.B('glass', GLS, 1.95, 2.2, z * 1.15 - 0.03, 2.85, 2.85, z * 1.15 + 0.03);
    k.B('paint', P.cab, 1.6, 3.05, -1.12, 2.98, 3.12, 1.12); k.B('paint', 0x262626, 2.85, 2.86, -1.05, 3.12, 2.92, 1.05); // roof, visor
    for (let j = 0; j < 5; j++) k.B('glow', AMBER, 3.04, 2.93, -0.6 + j * 0.3 - 0.04, 3.1, 2.98, -0.6 + j * 0.3 + 0.04);
    for (const z of [-1, 1]) { // mirrors, stacks, fuel tanks, steps
      k.bar('metal', 0x333333, [2.95, 2.0, z * 1.15], [3.1, 2.4, z * 1.4], 0.03); k.B('glass', 0x6f7f8a, 3.0, 2.2, z * 1.38 - 0.05, 3.12, 2.65, z * 1.38 + 0.05);
      k.rod('metal', CHROME, [1.5, 1.1, z * 0.98], [1.5, 3.55, z * 0.98], 0.085, 10, { dirt: 0.15 });
      k.rod('metal', 0xb9bcbd, [1.4, 0.78, z * 0.95], [2.55, 0.78, z * 0.95], 0.31, 14, { dirt: 0.5 });
      k.B('metal', 0x5e5e5c, 2.6, 0.4, z * 0.98 - 0.15, 3.0, 1.0, z * 0.98 + 0.15);
    }
    // dump body: worn outside, filthy inside
    const x0 = -4.72, x1 = 1.45, y0 = 1.22, y1 = 2.72, W = 1.22, OUT = { rust: 0.6, dirt: 0.75 }, IN = 0x584a3b;
    k.B('rough', 0x1a1a1a, x0 + 0.2, 1.0, -0.55, x1, y0, 0.55, { dirt: 0.9 }); // subframe + hoist
    k.B('paint', P.bed, x0, y0, -W, x1, y0 + 0.1, W, OUT);
    k.B('rough', IN, x0 + 0.1, y0 + 0.1, -W + 0.08, x1 - 0.1, y0 + 0.13, W - 0.08, { dirt: 1, rust: 0.8 });
    for (const z of [-1, 1]) {
      k.B('paint', P.bed, x0, y0, z * W - 0.04, x1, y1, z * W + 0.04, OUT);
      k.B('rough', IN, x0 + 0.1, y0 + 0.1, z * (W - 0.06) - 0.02, x1 - 0.1, y1 - 0.05, z * (W - 0.06) + 0.02, { dirt: 1, rust: 0.8, h: -0.6 });
      k.B('paint', P.bed, x0, y1 - 0.02, z * W - 0.09, x1, y1 + 0.12, z * W + 0.09, OUT); // top rail
      for (let j = 0; j < 6; j++) { const x = x0 + 0.5 + j * 1.0; k.B('paint', P.bed, x - 0.05, y0 - 0.1, z * W - (z > 0 ? 0 : 0.08), x + 0.05, y1, z * W + (z > 0 ? 0.08 : 0), OUT); }
    }
    k.B('paint', P.bed, x1 - 0.08, y0, -W, x1, 3.05, W, OUT); k.B('rough', IN, x1 - 0.12, y0 + 0.1, -W + 0.08, x1 - 0.08, 2.95, W - 0.08, { dirt: 1, rust: 0.7, h: -0.6 });
    k.B('paint', P.bed, x1, 2.95, -W, 2.1, 3.04, W, OUT); // cab protector
    k.rod('rough', 0x1e2a1e, [x1 - 0.2, 3.02, -W], [x1 - 0.2, 3.02, W], 0.1, 8); // tarp roll
    k.B('paint', P.bed, x0 - 0.1, y0, -W - 0.05, x0, y1 + 0.18, W + 0.05, OUT); // tailgate
    k.B('rough', IN, x0, y0 + 0.1, -W + 0.08, x0 + 0.03, y1, W - 0.08, { dirt: 1, rust: 0.8, h: -0.6 });
    for (const z of [-1, 1]) { k.B('glow', RED, x0 - 0.12, 1.05, z * 1.0 - 0.1, x0 - 0.1, 1.15, z * 1.0 + 0.1); k.B('rough', 0x101010, -4.4, 0.25, z * 0.95 - 0.35, -4.36, 0.95, z * 0.95 + 0.35, { dirt: 1 }); } // tail lights, mud flaps
    // fenders over the tandem
    for (const z of [-1, 1]) k.B('paint', 0x1c1c1c, -4.3, 1.08, z * 0.62, -1.75, 1.15, z * 1.28, { dirt: 0.9 });
    // wheels: steer, lifted pusher, tandem duals
    for (const z of [-1, 1]) {
      wheel(k, 3.55, 0.53, z * 1.06, 0.53, 0.3);
      wheel(k, -0.6, 0.66, z * 1.0, 0.5, 0.28);
      for (const x of [-2.4, -3.75]) { wheel(k, x, 0.53, z * 1.1, 0.53, 0.28); k.rod('rough', 0x161514, [x, 0.53, z * 0.68], [x, 0.53, z * 0.94], 0.53, 16, { dirt: 1, h: 0 }); }
    }
    k.build(g);
    // load: heaped dirt, rough clods, top lighter where it dried
    const kl = Kit(0, 1), lg = new THREE.PlaneGeometry(5.9, 2.3, 22, 9).rotateX(-Math.PI / 2), lp = lg.attributes.position, cl = new THREE.Color(P.load), cd = cl.clone().multiplyScalar(0.62), tmp = new THREE.Color();
    const hgt = (x, z) => { const u = (x - (x0 + x1) / 2) / 2.95, w = z / 1.15, hump = Math.max(0, 1 - u * u * 0.85) * Math.max(0, 1 - w * w * 0.9); return 1.42 + 0.95 * hump + (Math.sin(x * 7.1 + z * 3.3) * Math.sin(z * 9.7 - x * 2.1)) * 0.07 + (rnd() - 0.5) * 0.06; };
    for (let j = 0; j < lp.count; j++) lp.setY(j, hgt(lp.getX(j) + (x0 + x1) / 2, lp.getZ(j)));
    lg.translate((x0 + x1) / 2, 0, 0); lg.computeVertexNormals();
    kl.add('rough', P.load, lg, null, { dirt: 0.25, cf: (x, y, z) => tmp.copy(cd).lerp(cl, Math.min(1, Math.max(0, (y - 1.5) / 0.9)) * (0.75 + rnd() * 0.25)) });
    for (let j = 0; j < 9; j++) { const x = x0 + 0.8 + rnd() * 4.6, z = (rnd() - 0.5) * 1.8; kl.add('rough', P.load, new THREE.IcosahedronGeometry(0.12 + rnd() * 0.12, 0), T(x, hgt(x, z), z, rnd(), rnd(), rnd()), { dirt: 0.3 }); }
    const lm = kl.build(g).rough;
    return { g, load: lm };
  };

  // ------------------------------------------------------------ CAT D6 dozer (5.3 m with blade, 3.4 m blade, 1.88 m gauge)
  const makeDozer = () => {
    const g = new THREE.Group(); group.add(g);
    const k = Kit(0, 0.6);
    for (const s of [-1, 1]) {
      const zc = s * 0.94;
      k.add('rough', 0x22201e, extrude(stadium(3.35, 0.45), 0.56, 0, 7), T(-0.2, 0, zc), { dirt: 1, rust: 0.15 });
      for (let i = 0; i < 12; i++) { const x = -1.42 + i * 0.22; k.B('rough', 0x3d3935, x - 0.035, 0.885, zc - 0.28, x + 0.035, 0.945, zc + 0.28, { dirt: 0.9, rust: 0.4 }); }
      k.rod('metal', 0x47443f, [-1.45, 0.62, zc + s * 0.27], [-1.45, 0.62, zc + s * 0.33], 0.42, 12, { dirt: 1, rust: 0.4 }); // sprocket
      k.B('paint', CAT, -1.75, 1.0, zc - 0.33 * s, 1.55, 1.07, zc + 0.3 * s, { dirt: 0.8 }); // fender
      k.B('rough', 0x2c2c2a, -1.6, 1.07, zc - 0.25, 1.4, 1.08, zc + 0.25, { dirt: 0.9 });
      k.bar('paint', CAT, [-0.15, 0.48, s * 1.28], [2.55, 0.42, s * 1.28], 0.2, { dirt: 0.9 }); // push arm
      k.rod('paint', CATd, [1.55, 1.65, s * 0.58], [2.15, 1.25, s * 0.6], 0.1, 8); k.rod('metal', CHROME, [2.15, 1.25, s * 0.6], [2.58, 0.98, s * 0.62], 0.055, 8, { dirt: 0.3 }); // lift cylinders
    }
    k.B('rough', 0x1a1a1a, -1.3, 0.35, -0.65, 1.6, 1.0, 0.65, { dirt: 1 });
    // engine hood and grille
    k.add('paint', CAT, extrude(shapeOf([[0.15, 0.95], [2.05, 0.95], [2.05, 1.95], [0.15, 2.12]]), 1.24, 0.03), null);
    k.B('rough', 0x111111, 2.06, 1.0, -0.5, 2.1, 1.9, 0.5, { dirt: 0.6 });
    for (const z of [-1, 1]) k.B('rough', 0x161616, 0.5, 1.25, z * 0.63 - 0.02, 1.6, 1.8, z * 0.63 + 0.02, { dirt: 0.5 });
    k.rod('metal', 0x2a2826, [1.25, 1.95, -0.32], [1.25, 2.62, -0.32], 0.07, 8, { rust: 0.7, dirt: 0.3 });
    k.rod('paint', 0x151515, [0.6, 2.0, 0.34], [0.6, 2.35, 0.34], 0.1, 8);
    // cab with ROPS
    k.B('paint', CAT, -1.55, 1.07, -0.82, 0.22, 1.85, 0.82);
    k.B('glass', GLS, -1.5, 1.85, -0.78, 0.18, 2.94, 0.78);
    for (const x of [-1.52, 0.18]) for (const z of [-0.79, 0.79]) k.B('paint', CAT, x - 0.05, 1.85, z - 0.05, x + 0.05, 2.95, z + 0.05);
    k.B('paint', CAT, -1.62, 2.94, -0.88, 0.3, 3.1, 0.88, { dirt: 0.4 });
    k.rod('glow', AMBER, [-1.35, 3.1, 0.62], [-1.35, 3.24, 0.62], 0.065, 8);
    for (const z of [-1, 1]) { k.bar('metal', 0x222222, [0.2, 2.3, z * 0.82], [0.35, 2.55, z * 0.98], 0.03); k.B('glass', 0x6f7f8a, 0.3, 2.45, z * 0.98 - 0.08, 0.38, 2.75, z * 0.98 + 0.08); }
    k.B('paint', CAT, -1.9, 1.0, -0.62, -1.55, 1.85, 0.62); // fuel tank
    // ripper
    k.B('paint', CATd, -2.45, 0.75, -0.75, -2.15, 1.0, 0.75, { dirt: 0.9 }); k.bar('paint', CATd, [-1.9, 0.6, 0], [-2.3, 0.85, 0], 0.18, { dirt: 0.9 });
    k.bar('metal', 0x3a3633, [-2.3, 0.85, 0], [-2.38, 0.05, 0], 0.12, { dirt: 1, rust: 0.6 });
    // blade: curved moldboard, worn cutting edge, end bits
    { const pts = [], n = 8; for (let i = 0; i <= n; i++) { const a = i / n, y = 0.05 + a * 1.3; pts.push([2.85 - Math.sin(a * Math.PI) * 0.28 - a * 0.05, y]); }
      for (let i = n; i >= 0; i--) { const [x, y] = pts[i]; pts.push([x - 0.12, y]); }
      k.add('paint', CAT, extrude(shapeOf(pts), 3.4, 0.02), null, { dirt: 0.95, rust: 0.2 }); }
    k.B('metal', 0x8d877c, 2.75, 0.02, -1.72, 2.92, 0.18, 1.72, { dirt: 0.9, rust: 0.35 });
    for (const z of [-1, 1]) k.B('paint', CATd, 2.45, 0.25, z * 1.7 - 0.06, 2.75, 1.25, z * 1.7 + 0.06, { dirt: 0.9 });
    k.build(g);
    return g;
  };

  // ------------------------------------------------------------ 4-axle boom pump (Putzmeister-ish 38 m), turret at the origin
  const makePump = () => {
    const g = new THREE.Group(); group.add(g);
    const k = Kit(0, 0.55), WH = 0xe9e7e2, PG = 0xd5d7d4;
    for (const z of [-0.45, 0.45]) k.B('rough', 0x161616, -6.0, 0.72, z - 0.07, 6.2, 1.02, z + 0.07, { dirt: 0.9 });
    // cab-over cab
    k.B('paint', WH, 4.15, 1.0, -1.24, 6.3, 3.3, 1.24);
    k.B('glass', GLS, 6.28, 2.15, -1.1, 6.34, 3.05, 1.1); for (const z of [-1, 1]) k.B('glass', GLS, 5.2, 2.15, z * 1.24 - 0.03, 6.15, 2.95, z * 1.24 + 0.03);
    k.B('metal', 0x2a2a2a, 6.3, 0.55, -1.24, 6.5, 1.0, 1.24); k.B('paint', 0x2a2a2a, 6.29, 1.1, -0.9, 6.33, 1.9, 0.9);
    for (let j = 0; j < 4; j++) k.B('glow', AMBER, 6.2, 3.3, -0.45 + j * 0.3 - 0.05, 6.3, 3.36, -0.45 + j * 0.3 + 0.05);
    for (const z of [-1, 1]) { k.bar('metal', 0x333333, [6.25, 2.3, z * 1.24], [6.45, 2.5, z * 1.45], 0.03); k.B('glass', 0x6f7f8a, 6.38, 2.25, z * 1.45 - 0.05, 6.5, 2.75, z * 1.45 + 0.05); }
    // turret pedestal + slew gear
    k.B('paint', PG, -1.1, 1.02, -1.2, 1.1, 2.0, 1.2, { dirt: 0.5 });
    k.rod('paint', PG, [0, 2.0, 0], [0, 2.9, 0], 0.62, 16); k.rod('metal', 0x555555, [0, 2.9, 0], [0, 3.05, 0], 0.68, 18);
    k.B('paint', PG, -0.55, 3.0, -0.5, 0.55, 3.45, 0.5);
    // pump unit, water tank, pipe racks, hopper
    k.B('paint', WH, -4.9, 1.02, -1.15, -1.25, 2.15, 1.15, { dirt: 0.55 });
    k.B('rough', 0x2f2f2f, -4.7, 2.15, -0.9, -1.5, 2.18, 0.9, { dirt: 0.8 });
    for (const z of [-1, 1]) for (let j = 0; j < 3; j++) k.rod('metal', 0x60605c, [-4.9, 1.4 + j * 0.16, z * 1.2], [0.9, 1.4 + j * 0.16, z * 1.2], 0.065, 8, { rust: 0.5 });
    k.add('paint', 0x9e9b94, extrude(shapeOf([[-6.2, 0.85], [-5.0, 0.85], [-4.9, 1.85], [-6.35, 1.85]]), 1.9, 0.03), null, { dirt: 0.9 });
    k.B('rough', 0x6a6762, -6.2, 1.85, -0.8, -5.0, 1.88, 0.8, { dirt: 0.6 }); // wet concrete in the hopper
    k.B('metal', 0x666660, -6.0, 1.88, -0.85, -5.05, 1.92, 0.85, { rust: 0.4 }); // grate
    // outriggers deployed on cribbing: front X-legs swing forward, rear swing out
    for (const z of [-1, 1]) {
      for (const [a, b] of [[[1.3, 1.45, z * 0.9], [3.9, 1.0, z * 4.3]], [[-3.1, 1.35, z * 0.9], [-4.3, 1.0, z * 4.4]]]) {
        k.bar('paint', WH, a, b, 0.32, { dirt: 0.5 });
        const L = Math.hypot(b[0] - a[0], b[2] - a[2]), dx = (b[0] - a[0]) / L, dz = (b[2] - a[2]) / L;
        for (let j = 0; j < 4; j++) { const t = 0.55 + j * 0.1; k.bar('paint', j % 2 ? WH : 0xc41f16, [a[0] + dx * L * t, a[1] + (b[1] - a[1]) * t + 0.17, a[2] + dz * L * t], [a[0] + dx * L * (t + 0.1), a[1] + (b[1] - a[1]) * (t + 0.1) + 0.17, a[2] + dz * L * (t + 0.1)], 0.04); }
        k.rod('paint', PG, [b[0], 1.05, b[2]], [b[0], 0.45, b[2]], 0.13, 8); k.rod('metal', CHROME, [b[0], 0.45, b[2]], [b[0], 0.32, b[2]], 0.08, 8);
        k.B('metal', 0x3a3a38, b[0] - 0.35, 0.29, b[2] - 0.35, b[0] + 0.35, 0.33, b[2] + 0.35, { dirt: 1 });
        for (let c = 0; c < 2; c++) for (let j = 0; j < 4; j++) { const o = (j - 1.5) * 0.24; c ? k.B('rough', 0x9a7a52, b[0] - 0.5, 0.15, b[2] + o - 0.1, b[0] + 0.5, 0.29, b[2] + o + 0.1, { dirt: 0.9 }) : k.B('rough', 0x8a6c48, b[0] + o - 0.1, 0, b[2] - 0.5, b[0] + o + 0.1, 0.15, b[2] + 0.5, { dirt: 1 }); }
      }
    }
    for (const z of [-1, 1]) {
      for (const x of [4.75, 3.25]) wheel(k, x, 0.53, z * 1.06, 0.53, 0.3);
      for (const x of [-2.9, -4.25]) { wheel(k, x, 0.53, z * 1.1, 0.53, 0.28); k.rod('rough', 0x161514, [x, 0.53, z * 0.68], [x, 0.53, z * 0.94], 0.53, 16, { dirt: 1, h: 0 }); }
      k.B('paint', 0x1c1c1c, -4.85, 1.08, z * 0.62, -2.3, 1.14, z * 1.28, { dirt: 0.9 });
      k.B('glow', RED, -6.08, 1.05, z * 1.0 - 0.1, -6.04, 1.15, z * 1.0 + 0.1);
    }
    k.build(g);
    // boom segments: unit length along +x, centred. site.js stretches x to the segment length
    const seg = (h0, h1, w0, w1, joints, tipElbow) => {
      const kk = Kit(14, 0.25), N = 6;
      for (let i = 0; i < N; i++) { const a = i / N, b = (i + 1) / N, h = h0 + (h1 - h0) * (a + b) / 2, w = w0 + (w1 - w0) * (a + b) / 2;
        kk.B('paint', 0xe4e3de, -0.5 + a, -h / 2, -w / 2, -0.5 + b, h / 2, w / 2); }
      kk.rod('paint', 0x2a2a2a, [-0.5, h0 / 2 + 0.09, w0 / 2 - 0.02], [0.5, h1 / 2 + 0.09, w1 / 2 - 0.02], 0.075, 8, { dirt: 0.6 }); // delivery line
      for (let j = 0; j < 8; j++) { const x = -0.45 + j * 0.125, h = h0 + (h1 - h0) * (x + 0.5); kk.B('paint', 0x3a3a3a, x - 0.004, -h / 2, -0.02, x + 0.004, h / 2 + 0.17, w0 / 2 + 0.05); }
      kk.rod('paint', 0x8f918d, [-0.47, -h0 / 2 - 0.12, 0], [-0.05, -h0 / 2 - 0.08, 0], 0.11, 8); kk.rod('metal', CHROME, [-0.05, -h0 / 2 - 0.08, 0], [0.2, -h0 / 2 - 0.02, 0], 0.06, 8);
      for (const x of joints) { const h = h0 + (h1 - h0) * (x + 0.5); kk.B('paint', 0x5b5d5a, x - 0.016, -h / 2 - 0.12, -w0 / 2 - 0.06, x + 0.016, h / 2 + 0.12, w0 / 2 + 0.06); }
      if (tipElbow) kk.B('paint', 0x2a2a2a, 0.47, -h1 / 2 - 0.2, -0.15, 0.5, h1 / 2, 0.15);
      const m = new THREE.Mesh(kk.geo('paint'), MAT.paint); m.castShadow = m.receiveShadow = true; group.add(m); return m;
    };
    const s1 = seg(0.78, 0.62, 0.52, 0.46, [-0.49, 0.49], false);
    const s2 = seg(0.6, 0.32, 0.44, 0.28, [-0.49, -0.16, 0.18], true);
    const kh = Kit(5, 0.6); kh.rod('rough', 0x121212, [-0.5, 0, 0], [0.5, 0, 0], 0.085, 8);
    const hose = new THREE.Mesh(kh.geo('rough'), MAT.rough); hose.castShadow = hose.receiveShadow = true; group.add(hose);
    return { g, s1, s2, hose };
  };

  // ------------------------------------------------------------ tri-axle drum mixer (10 m)
  const MIX = [{ cab: 0xe8e6e1, a: 0xe8e6e1, b: 0xb3261e }, { cab: 0xd7d3c6, a: 0xdedbd2, b: 0x1d4d8c }];
  const mixer = i => {
    const P = MIX[i], g = new THREE.Group(); group.add(g);
    const k = Kit(0, 0.55);
    for (const z of [-0.45, 0.45]) k.B('rough', 0x161616, -4.8, 0.72, z - 0.07, 4.85, 1.0, z + 0.07, { dirt: 0.9 });
    k.B('metal', 0x1a1a1a, 4.85, 0.55, -1.24, 5.05, 0.95, 1.24);
    k.add('paint', P.cab, extrude(shapeOf([[3.4, 1.0], [4.88, 1.0], [4.88, 1.9], [3.4, 2.1]]), 1.1, 0.04), null);
    k.B('metal', 0xbcbcb8, 4.88, 1.05, -0.5, 4.92, 1.85, 0.5, { dirt: 0.3 });
    k.B('paint', P.cab, 2.0, 1.0, -1.15, 3.42, 3.0, 1.15); k.B('paint', P.cab, 1.95, 3.0, -1.12, 3.4, 3.08, 1.12);
    k.B('glass', GLS, 3.4, 2.15, -1.0, 3.45, 2.8, 1.0); for (const z of [-1, 1]) k.B('glass', GLS, 2.3, 2.15, z * 1.15 - 0.03, 3.25, 2.8, z * 1.15 + 0.03);
    for (let j = 0; j < 5; j++) k.B('glow', AMBER, 3.38, 3.08, -0.6 + j * 0.3 - 0.04, 3.44, 3.13, -0.6 + j * 0.3 + 0.04);
    for (const z of [-1, 1]) {
      k.B('paint', 0x1d1d1c, 3.05, 1.0, z * 0.6, 4.35, 1.12, z * 1.26, { dirt: 0.8 });
      k.bar('metal', 0x333333, [3.35, 2.0, z * 1.15], [3.5, 2.4, z * 1.4], 0.03); k.B('glass', 0x6f7f8a, 3.4, 2.2, z * 1.38 - 0.05, 3.52, 2.65, z * 1.38 + 0.05);
      k.rod('metal', 0xb9bcbd, [1.75, 0.78, z * 0.95], [2.85, 0.78, z * 0.95], 0.3, 14, { dirt: 0.5 });
    }
    k.rod('metal', CHROME, [1.85, 1.1, 0.95], [1.85, 3.5, 0.95], 0.085, 10, { dirt: 0.15 });
    k.rod('paint', 0xdedcd6, [1.6, 1.05, -0.35], [1.6, 2.4, -0.35], 0.42, 14); // water tank
    // drum pedestals, rear stand, hopper, chute, ladder
    k.B('paint', 0x8c8e8b, 0.95, 1.0, -0.5, 1.25, 2.25, 0.5, { dirt: 0.7 });
    for (const z of [-0.75, 0.75]) k.bar('paint', 0x8c8e8b, [-3.65, 1.0, z], [-3.75, 2.75, z * 0.9], 0.16, { dirt: 0.8 });
    k.B('paint', 0x8c8e8b, -3.85, 2.6, -0.8, -3.6, 2.78, 0.8, { dirt: 0.8 });
    k.add('paint', 0x8e8b84, new THREE.CylinderGeometry(0.55, 0.28, 0.6, 10, 1, true), T(-4.05, 3.55, 0, 0, 0, 0.3), { dirt: 0.9, rust: 0.3 }); // charge hopper
    k.add('paint', 0x7f7c75, new THREE.BoxGeometry(1.3, 0.12, 0.45), T(-4.45, 2.35, 0, 0, 0, 0.55), { dirt: 1, rust: 0.4 }); // discharge chute
    for (const z of [0.35, 0.75]) k.add('paint', 0x7f7c75, new THREE.BoxGeometry(1.4, 0.12, 0.36), T(-4.6, 1.75, z, 0, 0, 1.1), { dirt: 1, rust: 0.4 }); // stowed chutes
    for (const z of [-0.85, -0.45]) k.bar('metal', 0x666660, [-4.85, 0.9, z], [-4.35, 3.9, z], 0.04);
    for (let j = 0; j < 7; j++) { const t = j / 6; k.bar('metal', 0x666660, [-4.85 + t * 0.5, 0.9 + t * 3.0, -0.85], [-4.85 + t * 0.5, 0.9 + t * 3.0, -0.45], 0.03); }
    for (const z of [-1, 1]) {
      wheel(k, 4.15, 0.53, z * 1.06, 0.53, 0.3);
      for (const x of [0.6, -0.4]) wheel(k, x, 0.53, z * 1.04, 0.5, 0.28);
      for (const x of [-2.55, -3.9]) { wheel(k, x, 0.53, z * 1.1, 0.53, 0.28); k.rod('rough', 0x161514, [x, 0.53, z * 0.68], [x, 0.53, z * 0.94], 0.53, 16, { dirt: 1, h: 0 }); }
      k.B('paint', 0x1c1c1c, -4.5, 1.08, z * 0.62, -1.95, 1.14, z * 1.28, { dirt: 0.9 });
      k.B('glow', RED, -4.85, 1.05, z * 1.0 - 0.1, -4.82, 1.15, z * 1.0 + 0.1);
    }
    k.build(g);
    // drum: lathe with a two-start helix painted on it so the spin reads; tilted rear-up inside a fixed group
    const tilt = new THREE.Group(); tilt.position.set(-1.25, 2.62, 0); tilt.rotation.z = -0.2; g.add(tilt);
    const d = new THREE.Group(); tilt.add(d);
    const kd = Kit(2.6, 0.45), prof = [[0.0, 2.5], [0.45, 2.48], [0.62, 2.3], [1.14, 1.25], [1.2, 0.9], [1.2, -0.25], [1.15, -0.6], [0.72, -1.95], [0.46, -2.42], [0.0, -2.44]], pts = [];
    for (let i = 0; i < prof.length - 1; i++) { const n = i === 0 || i === prof.length - 2 ? 1 : 5; for (let j = 0; j < n; j++) { const t = j / n; pts.push(new THREE.Vector2(prof[i][0] + (prof[i + 1][0] - prof[i][0]) * t, prof[i][1] + (prof[i + 1][1] - prof[i][1]) * t)); } }
    pts.push(new THREE.Vector2(...prof[prof.length - 1]));
    const lathe = new THREE.LatheGeometry(pts.reverse(), 56).rotateZ(-Math.PI / 2); // profile must run -y to +y for outward faces
    const ca = new THREE.Color(P.a), cb = new THREE.Color(P.b), cm = new THREE.Color();
    kd.add('paint', P.a, lathe, null, { vf: (x, y, z) => { const a = Math.atan2(z, y) / (Math.PI * 2), s = ((a * 2 + x * 0.32) % 1 + 1) % 1, e = Math.min(1, Math.max(0, (Math.min(s, 0.32 - s) + 0.02) / 0.04)); return cm.copy(ca).lerp(cb, s < 0.34 ? e : 0); }, rust: 0.05, jit: 0 });
    kd.add('rough', 0x8d8a83, new THREE.CylinderGeometry(0.47, 0.47, 0.05, 20).rotateZ(Math.PI / 2), T(-2.43, 0, 0), { dirt: 1 }); // crusted mouth
    kd.rod('metal', 0x55534f, [-0.52, 0, 0], [-0.4, 0, 0], 1.2, 32, { rust: 0.4 }); // roller ring
    for (let j = 0; j < 6; j++) { const a = j / 6 * Math.PI * 2; kd.bar('rough', 0x9b978f, [-2.0, Math.cos(a) * 0.86, Math.sin(a) * 0.86], [-1.2, Math.cos(a + 0.5) * 1.17, Math.sin(a + 0.5) * 1.17], 0.08, { dirt: 1 }); } // concrete drips
    kd.build(d);
    return { g, d };
  };

  // ------------------------------------------------------------ flat-top tower crane: lattice mast (shader), strut jib 52 m, counter-jib 15 m
  const makeCrane = () => {
    const g = new THREE.Group(); g.position.set(-4, -D, 4); group.add(g);
    const CY = 0xe8ae12;
    const kf = Kit(0, 0.8); kf.B('rough', 0x9b968c, -3, -0.4, -3, 3, 0.04, 3, { dirt: 0.8 }); for (const x of [-0.8, 0.8]) for (const z of [-0.8, 0.8]) kf.B('metal', 0x555552, x - 0.2, 0.04, z - 0.2, x + 0.2, 0.12, z + 0.2, { rust: 0.6 }); kf.build(g);
    // mast: 1 m tall unit (chords + panels), scaled on y by site.js. Panels draw their lattice from metres = local y * scale
    const km = Kit(12, 0.15); const HW = 0.8;
    for (const x of [-HW, HW]) for (const z of [-HW, HW]) km.B('paint', CY, x - 0.08, 0, z - 0.08, x + 0.08, 1, z + 0.08);
    const mast = new THREE.Mesh(km.geo('paint'), MAT.paint); mast.castShadow = mast.receiveShadow = true; g.add(mast);
    {
      const pos = [], nor = [], au = [], quad = (pa, pb, pc, pd, n, ua, ub) => { for (const [p, u] of [[pa, ua], [pb, ub], [pc, ub], [pa, ua], [pc, ub], [pd, ua]]) { pos.push(...p); nor.push(...n); au.push(u); } };
      quad([-HW, 0, HW], [HW, 0, HW], [HW, 1, HW], [-HW, 1, HW], [0, 0, 1], -HW, HW);
      quad([HW, 0, -HW], [-HW, 0, -HW], [-HW, 1, -HW], [HW, 1, -HW], [0, 0, -1], HW, -HW);
      quad([HW, 0, HW], [HW, 0, -HW], [HW, 1, -HW], [HW, 1, HW], [1, 0, 0], HW, -HW);
      quad([-HW, 0, -HW], [-HW, 0, HW], [-HW, 1, HW], [-HW, 1, -HW], [-1, 0, 0], -HW, HW);
      const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); pg.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); pg.setAttribute('aU', new THREE.Float32BufferAttribute(au, 1));
      TRIS += 8;
      const LAT = `float tfLat(vec2 q){ float Hb=1.9, W=${(2 * HW).toFixed(2)}; float y=mod(q.y,Hb), k=floor(q.y/Hb), s=mod(k,2.)<1.?1.:-1.;
        float ud=s*(-W*.5+W*y/Hb), dd=abs(q.x-ud)*Hb/length(vec2(W,Hb)), dh=min(y,Hb-y); float hw=max(.05, fwidth(q.y)*.6); return min(dd,dh)-hw; }`;
      const vs = sh => { sh.vertexShader = 'attribute float aU; varying vec2 vLat;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvLat = vec2(aU, position.y * length(modelMatrix[1].xyz));');
        sh.fragmentShader = 'varying vec2 vLat;\n' + LAT + '\n' + sh.fragmentShader.replace('void main() {', 'void main() {\n if (tfLat(vLat) > 0.) discard;'); };
      const pm = new THREE.MeshStandardMaterial({ color: CY, roughness: 0.5, side: THREE.DoubleSide }); pm.onBeforeCompile = vs; pm.customProgramCacheKey = () => 'tfmach-lat';
      const dm = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, side: THREE.DoubleSide }); dm.onBeforeCompile = vs; dm.customProgramCacheKey = () => 'tfmach-latd';
      const panels = new THREE.Mesh(pg, pm); panels.customDepthMaterial = dm; panels.castShadow = panels.receiveShadow = true; mast.add(panels);
    }
    const top = new THREE.Group(); g.add(top);
    const k = Kit(40, 0.12);
    k.rod('metal', 0x333333, [0, 0, 0], [0, 0.45, 0], 1.15, 20);
    k.B('paint', CY, -1.2, 0.45, -1.2, 1.2, 1.05, 1.2);
    // cab on the right side, glass front
    k.B('paint', 0xe9e8e3, 0.1, 0.3, -2.45, 2.2, 2.3, -1.25); k.B('glass', GLS, 2.2, 0.6, -2.38, 2.25, 2.1, -1.32); k.B('glass', GLS, 0.4, 0.6, -2.47, 2.0, 2.0, -2.43);
    // jib: triangular warren lattice, bottom chords z=+-0.75 at y=1.05, apex at y=2.65
    const J0 = 1.2, J1 = 53.4, yb = 1.05, yt = 2.65, zw = 0.75, bay = 2.05;
    for (const z of [-zw, zw]) k.B('paint', CY, J0, yb - 0.09, z - 0.09, J1, yb + 0.09, z + 0.09);
    k.B('paint', CY, J0, yt - 0.08, -0.08, J1 - 0.6, yt + 0.08, 0.08);
    const nb = Math.round((J1 - J0) / bay);
    for (let i = 0; i < nb; i++) {
      const xa = J0 + i * bay, xb = xa + bay, xm = xa + bay / 2;
      for (const z of [-zw, zw]) { k.bar('paint', CY, [xa, yb, z], [xm, yt, 0], 0.07); k.bar('paint', CY, [xm, yt, 0], [xb, yb, z], 0.07); }
      k.bar('paint', CY, [xa, yb, -zw], [xm, yb, zw], 0.06); k.bar('paint', CY, [xm, yb, zw], [xb, yb, -zw], 0.06);
    }
    k.B('paint', CY, J1 - 0.1, yb - 0.1, -zw - 0.1, J1 + 0.1, yb + 0.5, zw + 0.1); // tip frame
    k.B('glow', RED, J1 + 0.1, yb + 0.5, -0.08, J1 + 0.25, yb + 0.65, 0.08);
    // counter-jib: twin girders, walkway, winch, ballast slabs
    const C0 = -1.2, C1 = -15.2;
    for (const z of [-0.95, 0.95]) { k.B('paint', CY, C1, yb - 0.25, z - 0.12, C0, yb + 0.25, z + 0.12); k.bar('paint', CY, [C1 + 0.4, yb + 1.1, z], [C0, yb + 1.1, z], 0.04); for (let x = C1 + 0.4; x < C0; x += 2.5) k.bar('paint', CY, [x, yb + 0.25, z], [x, yb + 1.12, z], 0.04); }
    for (let x = C1 + 0.5; x < C0; x += 2) k.B('paint', CY, x - 0.08, yb - 0.15, -0.95, x + 0.08, yb + 0.1, 0.95);
    k.B('rough', 0x59605a, C1 + 0.4, yb + 0.25, -0.8, C0 - 0.2, yb + 0.29, 0.8, { dirt: 0.4 });
    k.B('paint', 0x5d6266, -7.8, yb + 0.29, -0.7, -5.6, yb + 1.3, 0.7, { dirt: 0.3 }); k.rod('metal', 0x8a8a86, [-6.7, yb + 0.8, -0.72], [-6.7, yb + 0.8, 0.72], 0.4, 14); // hoist winch
    k.B('paint', 0xdedcd5, -4.6, yb + 0.29, -0.6, -3.6, yb + 1.5, 0.6); // electrics
    for (let j = 0; j < 4; j++) { const x = C1 + 0.6 + j * 0.62; k.B('rough', 0xaaa59b, x - 0.27, yb - 2.6, -1.25, x + 0.27, yb + 0.25, 1.25, { dirt: 0.3, h: 30 }); }
    k.build(top);
    const trolley = new THREE.Group(); trolley.position.y = yb; top.add(trolley);
    const kt = Kit(40, 0.2);
    kt.B('paint', CY, -0.7, -0.35, -0.95, 0.7, -0.1, 0.95); for (const x of [-0.45, 0.45]) kt.rod('metal', 0x444444, [x, -0.6, -0.2], [x, -0.6, 0.2], 0.22, 10);
    kt.build(trolley); trolley.position.x = 20;
    const kln = Kit(20, 0); for (const x of [-0.12, 0.12]) kln.B('metal', 0x2d2d2d, x - 0.016, -0.5, -0.016, x + 0.016, 0.5, 0.016);
    const line = new THREE.Mesh(kln.geo('metal'), MAT.metal); line.castShadow = true; line.receiveShadow = true; trolley.add(line);
    const hook = new THREE.Group(); trolley.add(hook);
    const kh = Kit(10, 0.2);
    kh.B('paint', 0xf2b40f, -0.32, -0.45, -0.18, 0.32, 0.3, 0.18); for (let j = 0; j < 3; j++) kh.B('paint', 0x151515, -0.33, -0.4 + j * 0.25, -0.19, 0.33, -0.3 + j * 0.25, 0.19);
    kh.add('metal', 0x2e2e2e, new THREE.TorusGeometry(0.17, 0.05, 6, 10, Math.PI * 1.5), T(0, -0.7, 0, 0, 0, Math.PI * 0.25));
    kh.build(hook);
    line.scale.y = 10; line.position.y = -0.8 - 5; hook.position.y = -1.2 - 10;
    return { g, mast, top, trolley, line, hook };
  };

  // ------------------------------------------------------------ crew: 44 instances, hi-vis vest = instance colour, the rest from a per-instance hash
  const makeCrew = () => {
    const NW = 44, parts = [];
    const add = (geo, m, part) => { const g = (geo.index ? geo.toNonIndexed() : geo); if (m) g.applyMatrix4(m); for (const a of Object.keys(g.attributes)) if (a !== 'position' && a !== 'normal') g.deleteAttribute(a); g.setAttribute('aPart', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count).fill(part), 1)); parts.push(g); };
    const bx = (x0, y0, z0, x1, y1, z1, p, rz = 0) => add(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), T((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, 0, 0, rz), p);
    for (const s of [-1, 1]) { bx(-0.1, 0, s * 0.1 - 0.06, 0.17, 0.1, s * 0.1 + 0.06, 0); bx(-0.08, 0.1, s * 0.1 - 0.075, 0.08, 0.86, s * 0.1 + 0.075, 1); bx(-0.06, 0.86, s * 0.27 - 0.055, 0.06, 1.42, s * 0.27 + 0.055, 2, s * 0.08); }
    bx(-0.12, 0.84, -0.21, 0.12, 1.43, 0.21, 2); bx(-0.135, 0.9, -0.225, 0.135, 1.44, 0.225, 3);
    bx(-0.09, 1.44, -0.08, 0.1, 1.64, 0.08, 4);
    add(new THREE.SphereGeometry(0.135, 8, 3, 0, Math.PI * 2, 0, Math.PI / 2), T(0.005, 1.615, 0), 5);
    add(new THREE.CylinderGeometry(0.16, 0.16, 0.025, 8), T(0.03, 1.61, 0), 5);
    const geo = mergeGeometries(parts); TRIS += (geo.attributes.position.count / 3) * NW;
    const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.75 });
    mat.onBeforeCompile = sh => {
      sh.vertexShader = 'attribute float aPart; varying float vVest;\n' + sh.vertexShader.replace('#include <color_vertex>', `
        float ih = fract(sin(float(gl_InstanceID) * 12.9898 + 1.7) * 43758.5453), ih2 = fract(ih * 91.7 + .3), ih3 = fract(ih * 53.1 + .7);
        vec3 c; vVest = 0.;
        if (aPart < .5) c = vec3(.045, .03, .02);
        else if (aPart < 1.5) c = ih2 < .5 ? vec3(.05, .07, .13) : ih2 < .8 ? vec3(.26, .2, .12) : vec3(.04);
        else if (aPart < 2.5) c = ih3 < .35 ? vec3(.45) : ih3 < .65 ? vec3(.06, .1, .22) : ih3 < .85 ? vec3(.7, .3, .03) : vec3(.6, .8, .05);
        else if (aPart < 3.5) { c = instanceColor; vVest = 1.; }
        else if (aPart < 4.5) c = mix(vec3(.55, .34, .22), vec3(.16, .09, .05), ih2);
        else c = ih < .55 ? vec3(.92, .92, .9) : ih < .8 ? vec3(.95, .72, .02) : ih < .92 ? vec3(1., .3, .02) : vec3(.04, .18, .55);
        vColor = c;`);
      sh.fragmentShader = 'varying float vVest;\n' + sh.fragmentShader.replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\ntotalEmissiveRadiance += vColor * vVest * .3;');
    };
    mat.customProgramCacheKey = () => 'tfmach-crew';
    const crew = new THREE.InstancedMesh(geo, mat, NW);
    const vest = [0xff5a00, 0xc8ff1a, 0xff7a00, 0xd6ff2a];
    const m = new THREE.Matrix4();
    for (let i = 0; i < NW; i++) { crew.setColorAt(i, new THREE.Color(vest[i % 4])); crew.setMatrixAt(i, m.makeTranslation((i % 11) * 2 - 10, 0, Math.floor(i / 11) * 2)); }
    crew.castShadow = crew.receiveShadow = true; group.add(crew);
    return crew;
  };

  // ------------------------------------------------------------ light towers: towable generator, telescoping mast, 4 heads aimed at the lot
  const lampMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.6, 2.45, 2.2), side: THREE.DoubleSide });
  const tower = (x, z) => {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = Math.atan2(-(0 - z), 0 - x); group.add(g); // +x faces the lot centre
    const k = Kit(0, 0.6);
    k.add('paint', 0xe6a614, extrude(shapeOf([[-1.1, 0.45], [1.0, 0.45], [1.0, 1.55], [0.75, 1.75], [-1.1, 1.75]]), 1.3, 0.03), null);
    k.B('rough', 0x1a1a1a, -0.6, 1.2, -0.66, 0.4, 1.6, -0.64); k.B('rough', 0x1a1a1a, -0.6, 1.2, 0.64, 0.4, 1.6, 0.66);
    k.bar('paint', 0x2a2a2a, [1.0, 0.55, 0], [2.3, 0.4, 0], 0.1); k.B('metal', 0x333333, 2.25, 0.25, -0.08, 2.4, 0.45, 0.08);
    for (const s of [-1, 1]) { wheel(k, -0.1, 0.3, s * 0.78, 0.3, 0.18); for (const xx of [-1.0, 0.9]) { k.bar('paint', 0x2a2a2a, [xx, 0.6, s * 0.6], [xx, 0.6, s * 1.5], 0.08); k.bar('paint', 0x2a2a2a, [xx, 0.6, s * 1.5], [xx, 0.05, s * 1.5], 0.07); } }
    k.rod('glow', AMBER, [-0.9, 1.75, 0.5], [-0.9, 1.85, 0.5], 0.05, 6);
    k.B('metal', 0x9a9c9c, -0.75, 1.75, -0.1, -0.55, 4.5, 0.1, { dirt: 0.3 }); k.B('metal', 0xa6a8a8, -0.72, 4.5, -0.075, -0.58, 7.2, 0.075, { dirt: 0.2 }); k.B('metal', 0xb2b4b4, -0.7, 7.2, -0.05, -0.6, 9.4, 0.05, { dirt: 0.1 });
    k.B('metal', 0x555555, -0.7, 9.35, -0.85, -0.6, 9.45, 0.85);
    const kl = Kit(9, 0), heads = [];
    for (const [dy, dz] of [[0, -0.42], [0, 0.42], [0.55, -0.42], [0.55, 0.42]]) {
      const m = T(-0.45, 9.25 + dy, dz, 0, 0, -0.5);
      kl.add('paint', 0x2c2c2c, new THREE.BoxGeometry(0.22, 0.48, 0.38), m); heads.push(m);
    }
    kl.build(g); k.build(g);
    const lg = mergeGeometries(heads.map(m => new THREE.BoxGeometry(0.05, 0.5, 0.4).translate(0.11, 0, 0).applyMatrix4(m))); TRIS += lg.attributes.position.count / 3;
    const head = new THREE.Mesh(lg, lampMat); head.castShadow = false; g.add(head);
    return head;
  };

  // ------------------------------------------------------------ static furniture: office trailer, toilets, dumpster, rebar, form stock
  const furniture = () => {
    const k = Kit(0, 0.45);
    { // 60x12 ft office trailer at (52,-45), doors + stairs facing the lot (+z)
      const X = 52, Z = -45, L = 18.3, W = 3.66;
      k.B('rough', 0x55565a, X - L / 2 + 0.1, 0, Z - W / 2 + 0.05, X + L / 2 - 0.1, 0.62, Z + W / 2 - 0.05, { dirt: 0.9 });
      k.B('paint', 0xd9d5c8, X - L / 2, 0.62, Z - W / 2, X + L / 2, 3.3, Z + W / 2, { dirt: 0.6, rust: 0.05 });
      for (let i = 0; i < 15; i++) { const x = X - L / 2 + 0.6 + i * 1.22; k.B('paint', 0xe6e3da, x - 0.6, 3.3, Z - W / 2 - 0.06, x + 0.58, 3.4, Z + W / 2 + 0.06, { dirt: 0.35, jit: 0.06 }); k.B('paint', 0xc4c1b8, x + 0.58, 3.31, Z - W / 2, x + 0.61, 3.415, Z + W / 2, { dirt: 0.3 }); }
      for (const s of [-1, 1]) for (let i = 0; i < 6; i++) { const x = X - L / 2 + 1.6 + i * 3.0; k.B('paint', 0xf2f2ef, x - 0.68, 1.62, Z + s * W / 2 - 0.04, x + 0.68, 2.62, Z + s * W / 2 + 0.04); k.B('glass', GLS, x - 0.6, 1.7, Z + s * W / 2 - 0.06, x + 0.6, 2.55, Z + s * W / 2 + 0.06); }
      for (const dx of [-4.2, 5.4]) {
        const x = X + dx; k.B('paint', 0xb8b4aa, x - 0.48, 0.65, Z + W / 2, x + 0.48, 2.7, Z + W / 2 + 0.05);
        k.B('rough', 0x9c7d55, x - 0.9, 0.55, Z + W / 2 + 0.05, x + 0.9, 0.62, Z + W / 2 + 1.55, { dirt: 0.9 });
        for (let j = 0; j < 3; j++) k.B('rough', 0x9c7d55, x - 0.5, 0.14 + j * 0.15, Z + W / 2 + 1.55 + (2 - j) * 0.28, x + 0.5, 0.18 + j * 0.15, Z + W / 2 + 1.85 + (2 - j) * 0.28, { dirt: 0.9 });
        for (const s of [-1, 1]) k.bar('metal', 0x8a8a86, [x + s * 0.88, 1.6, Z + W / 2 + 0.1], [x + s * 0.88, 1.6, Z + W / 2 + 1.5], 0.04);
      }
      for (const s of [-1, 1]) k.B('paint', 0xcfc9b8, X + s * (L / 2 + 0.25), 1.6, Z - 0.5, X + s * (L / 2 + 0.01), 2.5, Z + 0.4); // wall AC units
      k.add('metal', 0x2a2a2a, extrude(shapeOf([[0, -0.9], [1.6, 0], [0, 0.9]]), 0.12, 0), T(X + L / 2, 0.45, Z, -Math.PI / 2, 0, 0)); // hitch
    }
    // porta-johns
    [0x1f4f9c, 0x1f4f9c, 0x2f6b40].forEach((c, i) => {
      const x = 66 + i * 1.5, z = -46;
      k.B('paint', c, x - 0.56, 0.05, z - 0.58, x + 0.56, 2.22, z + 0.58, { dirt: 0.55 }); k.B('rough', 0x1d1d1d, x - 0.6, 0, z - 0.62, x + 0.6, 0.08, z + 0.62);
      k.add('paint', 0xdedfd8, new THREE.CylinderGeometry(0.5, 0.78, 0.22, 4, 1).rotateY(Math.PI / 4), T(x, 2.32, z), { dirt: 0.4 });
      k.rod('rough', 0x161616, [x - 0.4, 2.0, z - 0.4], [x - 0.4, 2.6, z - 0.4], 0.04, 6);
      k.B('paint', 0xd5d5cf, x - 0.4, 0.15, z + 0.58, x + 0.4, 2.0, z + 0.6);
    });
    { // 30 yd roll-off dumpster at (62,44) with debris
      const X = 62, Z = 44, L = 6.2, W = 2.4, H = 1.75, DC = 0x3a5873, O = { rust: 0.85, dirt: 0.7 };
      k.B('paint', DC, X - L / 2, 0.15, Z - W / 2, X + L / 2, 0.3, Z + W / 2, O);
      for (const s of [-1, 1]) { k.B('paint', DC, X - L / 2, 0.15, Z + s * W / 2 - 0.05, X + L / 2, H, Z + s * W / 2 + 0.05, O); k.B('paint', DC, X + s * L / 2 - 0.05, 0.15, Z - W / 2, X + s * L / 2 + 0.05, H, Z + W / 2, O);
        k.B('paint', DC, X - L / 2, H - 0.06, Z + s * W / 2 - 0.1, X + L / 2, H + 0.06, Z + s * W / 2 + 0.1, O);
        for (let i = 0; i < 7; i++) { const x = X - L / 2 + 0.4 + i * 0.9; k.B('paint', DC, x - 0.06, 0.2, Z + s * (W / 2 + 0.04) - 0.05, x + 0.06, H, Z + s * (W / 2 + 0.04) + 0.05, O); }
        k.B('metal', 0x333333, X - L / 2, 0, Z + s * 0.55 - 0.1, X + L / 2 + 0.3, 0.16, Z + s * 0.55 + 0.1, { rust: 0.8, dirt: 1 }); }
      const deb = [0xc19a62, 0x8a6a40, 0x2a2a2a, 0x9a958c, 0xb5a585, 0x5a4a38, 0xd8d0be, 0x3d5a7a];
      for (let i = 0; i < 34; i++) { const w = 0.3 + rnd() * 1.3, d = 0.1 + rnd() * 0.6, h = 0.03 + rnd() * 0.2;
        k.add('rough', deb[Math.floor(rnd() * deb.length)], new THREE.BoxGeometry(w, h, d), T(X + (rnd() - 0.5) * (L - 1.2), 0.5 + rnd() * 0.95, Z + (rnd() - 0.5) * (W - 0.6), (rnd() - 0.5) * 0.8, rnd() * 3, (rnd() - 0.5) * 0.8), { dirt: 0.6 }); }
    }
    { // rebar: six 12 m bundles of #6/#8 bar on dunnage, rusty, colour-coded ends
      const tags = [0xd8d02a, 0xc23a2a, 0x2a7ad8, 0xd8d02a, 0x2aa04a, 0xc23a2a];
      for (const x of [-63, -59.5, -56, -52.5]) k.B('rough', 0x7a6044, x - 0.08, 0, 33.2, x + 0.08, 0.14, 43.2, { dirt: 0.9 });
      for (let i = 0; i < 6; i++) {
        const zc = 34 + i * 1.6, y0 = 0.14 + (i % 2) * 0.02;
        for (let l = 0; l < 3; l++) for (let b = 0; b < 17 - l * 2; b++) {
          const z = zc - 0.46 + b * 0.056 + l * 0.056, y = y0 + 0.028 + l * 0.048, sh = (rnd() - 0.5) * 0.4;
          k.add('rough', [0x7a3e1d, 0x6a3418, 0x8a4b26, 0x5e3a24][Math.floor(rnd() * 4)], new THREE.CylinderGeometry(0.028, 0.028, 12, 4, 1).rotateZ(Math.PI / 2), T(-58 + sh, y, z), { dirt: 0.5, rust: 0.6 });
        }
        k.B('paint', tags[i], -64.05, y0, zc - 0.55, -63.85, y0 + 0.11, zc + 0.55, { dirt: 0.3 });
        for (const x of [-61, -55]) k.B('metal', 0x444444, x - 0.03, y0, zc - 0.56, x + 0.03, y0 + 0.13, zc + 0.56, { rust: 0.6 });
      }
    }
    { // form stock: two plywood stacks, aluminium wall forms, a lumber bundle, each on dunnage
      for (let i = 0; i < 4; i++) {
        const x = -44 + i * 3, z = 44;
        for (const dz of [-0.9, 0.9]) k.B('rough', 0x6e5a40, x - 1.25, 0, z + dz - 0.08, x + 1.25, 0.12, z + dz + 0.08, { dirt: 0.9 });
        if (i < 2) {
          for (let j = 0; j < 8; j++) { const ox = (rnd() - 0.5) * 0.08, oz = (rnd() - 0.5) * 0.08, c = rnd() < 0.35 ? 0x9b958a : [0xb98a55, 0xae7f4b, 0xa47a4c][j % 3];
            for (const dx of [-0.62, 0.62]) k.B('rough', c, x + dx - 0.6 + ox, 0.12 + j * 0.115, z - 1.22 + oz, x + dx + 0.6 + ox, 0.12 + (j + 1) * 0.115, z + 1.22 + oz, { dirt: 0.5, jit: 0.08 }); }
          for (const dz of [-0.7, 0.7]) k.B('metal', 0x2a2a2a, x - 1.26, 0.12, z + dz - 0.02, x + 1.26, 1.06, z + dz + 0.02);
        } else if (i === 2) {
          for (let j = 0; j < 9; j++) { k.B('metal', 0xa9adb0, x - 1.2, 0.12 + j * 0.1, z - 1.0, x + 1.2, 0.2 + j * 0.1, z + 1.0, { dirt: 0.6, rust: 0.1 }); k.B('rough', 0x8d8a83, x - 1.12, 0.2 + j * 0.1, z - 0.92, x + 1.12, 0.21 + j * 0.1, z + 0.92, { dirt: 0.8 }); }
        } else {
          for (let j = 0; j < 6; j++) for (let b = 0; b < 12; b++) k.B('rough', [0xd2b07a, 0xc9a46a, 0xbf9a60][(j + b) % 3], x - 1.22, 0.12 + j * 0.09, z - 1.1 + b * 0.185, x + 1.22, 0.2 + j * 0.09, z - 1.1 + b * 0.185 + 0.17, { dirt: 0.4, jit: 0.05 });
          for (const dx of [-0.8, 0.8]) k.B('metal', 0x2a2a2a, x + dx - 0.02, 0.12, z - 1.13, x + dx + 0.02, 0.68, z + 1.13);
        }
      }
    }
    k.build(group);
  };

  const exA = excavator(), exB = excavator();
  exA.g.position.set(-20, 0, -13); exB.g.position.set(-10, 0, 13);
  const trucks = [0, 1, 2, 3].map(truck);
  const dozer = makeDozer();
  const pump = makePump();
  const mixers = [0, 1].map(mixer);
  const crane = makeCrane();
  const crew = makeCrew();
  const towers = [[-60, -42], [60, -42], [-60, 42], [20, 30]].map(([x, z]) => tower(x, z));
  furniture();
  return { exA, exB, trucks, dozer, pump, mixers, crane, crew, towers, tris: TRIS, materials: MAT };
}

// =====================================================================================================================
// Jezero colony life (D6.1): pressurised rovers on the avenues (headlights at dusk, dust trails), graded roads with lamp
// pools, comms masts, and a few tiny suited figures by the landed ships and the build pad. Silhouette scale only.
// createColonyLife({ THREE, colony, layout, envMap, high, arrive, hideLines, solar }) -> { group, update(g, t, night, gR), tris, draws }
//   layout: colonyLayout() from habitat.js; g = city build progress, gR = raw colony progress (ships land in gR < arrive).
//   Moving things never cast shadows (main.js only re-renders the shadow map when the build changes). One draw per kind.
export function createColonyLife({ THREE, colony, layout: L, envMap = null, high = true, arrive = 0.1, hideLines = null, solar = null }) {
  const V3 = THREE.Vector3, group = new THREE.Group(); group.name = 'colonyLife'; colony.add(group);
  let seed = 4242; const rnd = () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const sst = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const TAU = Math.PI * 2, RINGS = L.rings.map(r => r.r), ringBt = R => 0.02 + R / 236 * 0.55;
  const S1 = L.ships[0], SHIP_AVE = 3 * Math.PI / 2, SPUR = [[0, -160], [S1.x - 15, S1.z - 2]]; // the first road: hub -> avenue 270 deg -> spur to ship 1
  let TRIS = 0; const tri = g => (TRIS += (g.index ? g.index.count : g.attributes.position.count) / 3);
  const U = { uT: { value: 0 }, uG: { value: 0 }, uNight: { value: 0 }, uPx: { value: 800 }, uDay: { value: 1 } };
  const pxHook = (r, s, cam) => { const rt = r.getRenderTarget(), h = rt ? rt.height : r.getDrawingBufferSize(tmpV2).y; U.uPx.value = h * 0.5 * cam.projectionMatrix.elements[5]; };
  const tmpV2 = new THREE.Vector2();
  if (hideLines) hideLines.forEach(m => (m.visible = false)); // the graded roads below replace main.js's 1 px road lines
  if (solar) { // main.js's solar InstancedMesh (3 x 0.1 x 2.2 m boxes): swap in a panel finish, cells + bus lines + silver frame, same geometry and matrices
    const m = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.6, envMap, envMapIntensity: 1 });
    m.onBeforeCompile = sh => {
      Object.assign(sh.uniforms, U);
      sh.vertexShader = 'varying vec3 vSP;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvSP = position;');
      sh.fragmentShader = 'uniform float uNight; varying vec3 vSP;\n' + sh.fragmentShader
        .replace('#include <color_fragment>', `#include <color_fragment>
          vec2 c = vSP.xz / vec2(0.5, 0.55); vec2 f = abs(fract(c) - 0.5), w = fwidth(c);
          float grid = max(smoothstep(0.5 - w.x * 1.5, 0.5, f.x + 0.03), smoothstep(0.5 - w.y * 1.5, 0.5, f.y + 0.03)) * (1. - smoothstep(0.2, 0.45, max(w.x, w.y)));
          float frame = step(1.44, abs(vSP.x)) + step(1.04, abs(vSP.z)) + step(vSP.y, 1.17);
          diffuseColor.rgb = mix(mix(vec3(0.03, 0.05, 0.1), vec3(0.2, 0.22, 0.26), grid * 0.5), vec3(0.62, 0.62, 0.6), min(frame, 1.));`)
        .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = max(0.18, roughnessFactor);')
        .replace('#include <lights_fragment_maps>', '#include <lights_fragment_maps>\niblIrradiance *= 1. - 0.9 * uNight; radiance *= 1. - 0.9 * uNight;');
    };
    m.customProgramCacheKey = () => 'life-solar'; solar.material = m;
  }

  // ------------------------------------------------------------ paths: polylines resampled every metre, corners rounded
  function mkPath(pts, closed) {
    let P = [];
    for (let i = 0; i < pts.length - (closed ? 0 : 1); i++) { // split to <= 3 m so the rounding stays local to each corner
      const a = pts[i], b = pts[(i + 1) % pts.length], n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 3));
      for (let k = 0; k < n; k++) P.push([a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n]);
    }
    if (!closed) P.push(pts[pts.length - 1]);
    for (let it = 0; it < 3; it++) { // Chaikin
      const Q = []; const n = P.length;
      if (!closed) Q.push(P[0]);
      for (let i = 0; i < (closed ? n : n - 1); i++) { const a = P[i], b = P[(i + 1) % n]; Q.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25], [a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]); }
      if (!closed) Q.push(P[n - 1]); P = Q;
    }
    const cum = [0]; for (let i = 1; i < P.length + (closed ? 1 : 0); i++) { const a = P[i - 1], b = P[i % P.length]; cum.push(cum[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1])); }
    const len = cum[cum.length - 1], N = Math.max(2, Math.floor(len)), out = new Float32Array((N + 1) * 2);
    for (let k = 0, j = 0; k <= N; k++) { const s = k / N * len; while (j < cum.length - 2 && cum[j + 1] < s) j++; const f = (s - cum[j]) / Math.max(1e-6, cum[j + 1] - cum[j]), a = P[j % P.length], b = P[(j + 1) % P.length]; out[k * 2] = a[0] + (b[0] - a[0]) * f; out[k * 2 + 1] = a[1] + (b[1] - a[1]) * f; }
    return { P: out, N, len, closed, step: len / N };
  }
  const arc = (R, a0, a1) => { const n = Math.max(2, Math.ceil(Math.abs(a1 - a0) * R / 6)), o = []; for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; o.push([Math.cos(a) * R, Math.sin(a) * R]); } return o; };
  const ave = (a, r0, r1) => [[Math.cos(a) * r0, Math.sin(a) * r0], [Math.cos(a) * r1, Math.sin(a) * r1]];
  function at(path, s, o) { // position + tangent at arc length s
    const q = path.closed ? ((s % path.len) + path.len) % path.len : Math.min(path.len - 1e-3, Math.max(0, s)), u = q / path.step, i = Math.floor(u), f = u - i;
    const P = path.P, i1 = path.closed ? (i + 1) % (path.N + 1) : Math.min(i + 1, path.N), j0 = Math.max(0, i - 1), j1 = Math.min(path.N, i + 2);
    o.x = P[i * 2] + (P[i1 * 2] - P[i * 2]) * f; o.z = P[i * 2 + 1] + (P[i1 * 2 + 1] - P[i * 2 + 1]) * f;
    const tx = P[j1 * 2] - P[j0 * 2], tz = P[j1 * 2 + 1] - P[j0 * 2 + 1], tl = Math.hypot(tx, tz) || 1; o.tx = tx / tl; o.tz = tz / tl; return o;
  }

  // routes: sector loops between rings (the tube-free quadrants also use the inner ring), full ring laps, and two shuttles
  const routes = [];
  const Q4 = Math.PI / 4;
  for (let k = 0; k < 8; k++) {
    const a0 = k * Q4, a1 = a0 + Q4, tubeFree = k % 2 === 1, ri = tubeFree ? 62 : 132, ro = tubeFree ? 132 : 204;
    routes.push({ path: mkPath([...ave(a0, ri, ro), ...arc(ro, a0, a1), ...ave(a1, ro, ri).slice(0), ...arc(ri, a1, a0)], true), bt: ringBt(ro) + 0.01, w: 1 });
    if (k % 2 === 0) routes.push({ path: mkPath([...ave(a0, 132, 204), ...arc(204, a0, a1), ...ave(a1, 204, 132), ...arc(132, a1, a0)], true), bt: ringBt(204) + 0.01, w: 1 });
  }
  for (const R of [132, 204]) routes.push({ path: mkPath(arc(R, 0, TAU).slice(0, -1), true), bt: ringBt(R) + 0.02, w: 1.5 });
  const shipRun = { path: mkPath([[Math.cos(SHIP_AVE) * 24, Math.sin(SHIP_AVE) * 24], [0, -160], SPUR[1]], false), bt: -1, dwell: 26 };
  const farmRun = { path: mkPath(ave(Q4, 24, 248), false), bt: 0.3, dwell: 40 };
  const padRun = { path: mkPath([[0, -24], [0, -96], [-3.5, -101]], false), bt: 0.25, dwell: 30 }; // deliveries to the build pad's apron
  const NR = high ? 40 : 20, rovers = [];
  const loopR = routes, wsum = loopR.reduce((s, r) => s + r.w, 0);
  for (let i = 0; i < NR; i++) {
    let r;
    if (i < 3) r = shipRun; else if (i === 3 || i === 7) r = padRun; else if (i === 5) r = farmRun;
    else { let x = rnd() * wsum; r = loopR.find(q => (x -= q.w) < 0) || loopR[0]; }
    rovers.push({ r, s0: rnd() * 2000, v: 7.5 + rnd() * 3, dir: rnd() < 0.5 ? 1 : -1, bt: Math.max(0, r.bt) + rnd() * 0.06, h: rnd(), ship: r === shipRun, k: i });
  }
  rovers.forEach((v, i) => { if (v.ship) v.s0 = i * 0.33; }); // ship runs leave the hub one after another (cycle offset, see pose)

  // ------------------------------------------------------------ rover: pressurised cabin on a 6-wheel chassis, forward +x
  const part = (g, kind) => { const n = g.index ? g.toNonIndexed() : g; if (n !== g) g.dispose(); n.deleteAttribute('uv'); n.setAttribute('kind', new THREE.Float32BufferAttribute(new Float32Array(n.attributes.position.count).fill(kind), 1)); return n; };
  const roverGeo = (() => {
    const seg = high ? 14 : 9, G = [];
    G.push(part(new THREE.BoxGeometry(6.0, 0.42, 2.3).translate(0, 0.98, 0), 0));                                  // chassis
    const cab = new THREE.CapsuleGeometry(1.18, 3.3, 4, seg); cab.rotateZ(Math.PI / 2); cab.scale(1, 0.84, 1); cab.translate(-0.15, 2.2, 0); G.push(part(cab, 1));
    for (const x of [-2.15, 0, 2.15]) for (const z of [-1.32, 1.32]) {
      const w = new THREE.CylinderGeometry(0.6, 0.6, 0.5, seg); w.rotateX(Math.PI / 2); w.translate(x, 0.6, z); G.push(part(w, 2));
      const f = new THREE.BoxGeometry(1.5, 0.08, 0.62).translate(x, 1.28, z * 1.02); G.push(part(f, 0));                    // fenders
    }
    G.push(part(new THREE.BoxGeometry(2.6, 0.08, 1.7).translate(-0.7, 3.27, 0), 3));                                  // roof solar
    G.push(part(new THREE.BoxGeometry(0.16, 0.14, 1.5).translate(1.55, 3.2, 0), 4));                                  // roof light bar
    G.push(part(new THREE.BoxGeometry(0.05, 1.3, 0.05).translate(-1.9, 3.85, 0.62), 0));                              // whip mast
    G.push(part(new THREE.BoxGeometry(0.5, 0.9, 1.9).translate(-3.05, 1.95, 0), 1));                                  // rear suitport bulkhead
    for (const z of [-0.5, 0.5]) G.push(part(new THREE.CylinderGeometry(0.3, 0.3, 0.06, 10).rotateZ(Math.PI / 2).translate(-3.32, 2.05, z), 0)); // suitports
    for (const z of [-0.85, 0.85]) { G.push(part(new THREE.BoxGeometry(0.1, 0.16, 0.36).translate(3.02, 1.28, z), 4)); G.push(part(new THREE.BoxGeometry(0.1, 0.14, 0.3).translate(-3.02, 1.3, z * 1.15), 5)); }
    const g = mergeGeometries(G); G.forEach(x => x.dispose()); g.computeBoundingSphere(); return g;
  })();
  const roverMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5, metalness: 0.15, envMap, envMapIntensity: 0.6 });
  roverMat.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = 'attribute float kind; varying float vK; varying vec3 vLP;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvK = kind; vLP = position;');
    sh.fragmentShader = 'uniform float uNight; varying float vK; varying vec3 vLP;\n' + sh.fragmentShader
      .replace('#include <color_fragment>', `#include <color_fragment>
        float glassF = 0., lampF = 0., tailF = 0.;
        if (vK < 0.5) diffuseColor.rgb = vec3(0.16, 0.15, 0.14);
        else if (vK < 1.5) {
          vec3 c = vec3(0.86, 0.84, 0.8);
          c = mix(c, vec3(0.86, 0.36, 0.14), step(1.62, vLP.y) * step(vLP.y, 1.8));                       // coral stripe
          float side = step(2.32, vLP.y) * step(vLP.y, 2.68) * step(-1.7, vLP.x) * step(vLP.x, 1.5) * step(0.25, fract(vLP.x / 0.8));
          glassF = max(step(2.05, vLP.x) * step(2.0, vLP.y), side);                                         // wraparound nose glazing + cabin strip
          c = mix(c, vec3(0.04, 0.05, 0.06), glassF);
          c = mix(c, c * vec3(0.9, 0.68, 0.5), (1. - smoothstep(1.2, 1.9, vLP.y)) * 0.7);                   // regolith dust low on the hull
          diffuseColor.rgb = c;
        } else if (vK < 2.5) diffuseColor.rgb = mix(vec3(0.08, 0.075, 0.07), vec3(0.42, 0.4, 0.37), step(1.565, abs(vLP.z)) * step(abs(vLP.y - 0.6), 0.32)); // tyre, pale hub face
        else if (vK < 3.5) diffuseColor.rgb = vec3(0.04, 0.06, 0.11);
        else if (vK < 4.5) { lampF = 1.; diffuseColor.rgb = vec3(0.9); }
        else { tailF = 1.; diffuseColor.rgb = vec3(0.4, 0.04, 0.03); }`)
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, 0.08, max(glassF, step(2.5, vK) * step(vK, 3.5)));')
      .replace('#include <metalnessmap_fragment>', '#include <metalnessmap_fragment>\nmetalnessFactor = mix(metalnessFactor, 0.7, glassF);')
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        totalEmissiveRadiance += vec3(1., 0.9, 0.75) * lampF * (0.3 + 2.4 * uNight) + vec3(1., 0.08, 0.04) * tailF * (0.3 + 3. * uNight)
          + vec3(1., 0.6, 0.3) * glassF * uNight * 0.9 * step(vLP.x, 2.0);                                 // warm cabin through the side strip`)
      .replace('#include <lights_fragment_maps>', '#include <lights_fragment_maps>\niblIrradiance *= 1. - 0.9 * uNight; radiance *= 1. - 0.9 * uNight;');
  };
  roverMat.customProgramCacheKey = () => 'life-rover';
  const roverMesh = new THREE.InstancedMesh(roverGeo, roverMat, NR); roverMesh.receiveShadow = true; roverMesh.castShadow = false;
  roverMesh.boundingSphere = new THREE.Sphere(new V3(0, 0, 0), 420); roverMesh.frustumCulled = false; group.add(roverMesh); tri(roverGeo);

  // ground decal per rover: soft contact shadow under the hull + the headlight pool on the road ahead (premultiplied: glow adds, shadow darkens)
  const decalGeo = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2).translate(0.5, 0, 0).scale(26, 1, 14).translate(-5, 0.06, 0);
  const aOn = new THREE.InstancedBufferAttribute(new Float32Array(NR * 2), 2); decalGeo.setAttribute('aOn', aOn); aOn.setUsage(THREE.DynamicDrawUsage);
  const decalMat = new THREE.ShaderMaterial({
    uniforms: U, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4,
    blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor,
    vertexShader: `attribute vec2 aOn; varying vec2 vP; varying vec2 vOn; void main(){ vP = position.xz; vOn = aOn;
      gl_Position = projectionMatrix * viewMatrix * modelMatrix * instanceMatrix * vec4(position, 1.); }`,
    fragmentShader: `uniform float uDay; varying vec2 vP; varying vec2 vOn; void main(){
      float sh = (1. - smoothstep(0.55, 1.05, length(vP / vec2(3.7, 1.75)))) * (0.35 + 0.25 * uDay);
      float x = vP.x - 3.1, w = 0.9 + max(x, 0.) * 0.42, lat = abs(vP.y);
      float pool = step(0., x) * smoothstep(0., 1.5, x) * exp(-x / 5.) * (1. - smoothstep(w * 0.55, w, lat)) * (1. - smoothstep(14., 20., x));
      gl_FragColor = vec4(vec3(1., 0.86, 0.66) * pool * vOn.x * 0.5, sh * vOn.y); }`,
  });
  const decal = new THREE.InstancedMesh(decalGeo, decalMat, NR); decal.frustumCulled = false; decal.renderOrder = -1; group.add(decal);

  // ------------------------------------------------------------ suited figures: helmet, PLSS, legs swing in the shader
  const figGeo = (() => {
    const G = [], limb = (g, l) => { const n = part(g, 0); n.setAttribute('limb', new THREE.Float32BufferAttribute(new Float32Array(n.attributes.position.count).fill(l), 1)); return n; };
    for (const s of [-1, 1]) G.push(limb(new THREE.BoxGeometry(0.2, 0.86, 0.2).translate(0, -0.43, 0).translate(0, 0.9, s * 0.13), s));   // legs, pivot at the hip
    for (const s of [-1, 1]) G.push(limb(new THREE.BoxGeometry(0.15, 0.66, 0.15).translate(0, -0.33, 0).translate(0, 1.5, s * 0.3), -s * 0.7)); // arms swing against the legs
    G.push(limb(new THREE.BoxGeometry(0.34, 0.66, 0.48).translate(0, 1.24, 0), 0));                               // torso
    G.push(limb(new THREE.BoxGeometry(0.26, 0.6, 0.42).translate(-0.29, 1.3, 0), 0));                             // PLSS backpack
    G.push(limb(new THREE.IcosahedronGeometry(0.17, 1).translate(0.02, 1.72, 0), 2));                              // helmet
    const g = mergeGeometries(G); G.forEach(x => x.dispose()); return g;
  })();
  const NF = high ? 16 : 9, aWalk = new THREE.InstancedBufferAttribute(new Float32Array(NF * 2), 2); aWalk.setUsage(THREE.DynamicDrawUsage); figGeo.setAttribute('aWalk', aWalk);
  const figMat = new THREE.MeshStandardMaterial({ color: 0xe8e4dc, roughness: 0.75, metalness: 0 });
  figMat.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = 'uniform float uT; attribute float limb; attribute vec2 aWalk; varying float vLimb; varying float vFy;\n' + sh.vertexShader
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        vLimb = limb; vFy = position.y;
        if (abs(limb) > 0.5 && abs(limb) < 1.5) { float hip = abs(limb) > 0.9 ? 0.9 : 1.5; float sw = sin(uT * 7.5 + aWalk.x) * aWalk.y * sign(limb) * (abs(limb) > 0.9 ? 0.45 : 0.35);
          vec2 q = vec2(transformed.x, transformed.y - hip); transformed.xy = vec2(q.x * cos(sw) - q.y * sin(sw), q.x * sin(sw) + q.y * cos(sw) + hip); }
        transformed.y += abs(sin(uT * 7.5 + aWalk.x)) * aWalk.y * 0.04;`);
    sh.fragmentShader = 'uniform float uNight; varying float vLimb; varying float vFy;\n' + sh.fragmentShader
      .replace('#include <color_fragment>', `#include <color_fragment>
        diffuseColor.rgb *= vFy < 0.25 ? 0.45 : (vFy < 0.95 ? 0.86 : 1.);                                 // boots, dusty legs`);
  };
  figMat.customProgramCacheKey = () => 'life-fig';
  const figMesh = new THREE.InstancedMesh(figGeo, figMat, NF); figMesh.castShadow = false; figMesh.receiveShadow = true; figMesh.frustumCulled = false; group.add(figMesh); tri(figGeo);
  // scripts: ship crews walk out from the legs once the dust settles; the pad crew works the apron until the launch clears it
  // gR clock (rockets.js table, CINEMA-NOTES): pad pours 0.30, scaffold drops 0.71-0.76, ignition 0.80. Crew and pad deliveries clear by 0.77.
  const PAD_ON = 0.31, PAD_OFF = 0.77;
  const figs = [], [bp, tw] = [L.buildPad, L.buildPad.tower];
  L.ships.forEach((s, si) => { for (let k = 0; k < (high ? 4 : 2); k++) {
    const a = rnd() * TAU, a2 = a + (rnd() - 0.5) * 1.2, r0 = 6.5, r1 = 11 + rnd() * 9;
    figs.push({ A: [s.x + Math.cos(a) * r0, s.z + Math.sin(a) * r0], B: [s.x + Math.cos(a2) * r1, s.z + Math.sin(a2) * r1], v: 1 + rnd() * 0.4, dwell: 4 + rnd() * 10, ph: rnd() * 60,
      on: arrive + 0.012 + si * 0.02 + k * 0.006, off: 2, stand: k === 2 }); } });
  while (figs.length < NF) {
    let A, B, tries = 0;
    do { const a = rnd() * TAU, r = 19 + rnd() * 9, a2 = a + (rnd() - 0.5) * 0.8, r2 = 19 + rnd() * 9; A = [bp.x + Math.cos(a) * r, bp.z + Math.sin(a) * r]; B = [bp.x + Math.cos(a2) * r2, bp.z + Math.sin(a2) * r2]; }
    while (++tries < 20 && (Math.hypot(A[0] - tw.x, A[1] - tw.z) < 7 || Math.hypot(B[0] - tw.x, B[1] - tw.z) < 7 || A[0] > bp.x + 18 || B[0] > bp.x + 18)); // off the tower and off the avenue
    figs.push({ A, B, v: 0.9 + rnd() * 0.5, dwell: 3 + rnd() * 12, ph: rnd() * 60, on: PAD_ON + rnd() * 0.1, off: PAD_OFF - rnd() * 0.03, stand: rnd() < 0.3 });
  }
  figs.length = Math.min(figs.length, NF);

  // ------------------------------------------------------------ comms masts: red/white lattice towers with a dish, on clear ground
  const clearOf = (x, z, m) => L.habs.every(l => Math.hypot(l.x - x, l.z - z) > l.r + m) && L.fabs.every(f => Math.hypot(f.x - x, f.z - z) > Math.max(f.w, f.d) * 0.6 + m)
    && L.domes.every(d => Math.hypot(d.x - x, d.z - z) > d.r + m) && RINGS.every(R => Math.abs(Math.hypot(x, z) - R) > 6 + m * 0.3)
    && [...Array(8)].every((_, k) => { const a = k * Q4, r = x * Math.cos(a) + z * Math.sin(a); return r < 14 || Math.abs(-x * Math.sin(a) + z * Math.cos(a)) > 6; })
    && Math.hypot(x - bp.x, z - bp.z) > 34 && L.ships.every(s => Math.hypot(x - s.x, z - s.z) > 30);
  const masts = [];
  for (const [r, a, h] of [[30, 2.6, 34], [226, 0.62, 28], [222, 2.0, 30], [230, 3.6, 26], [218, 4.35, 30], [228, 5.4, 26], [140, 5.1, 24], [116, 1.2, 22]]) {
    for (let d = 0; d < 40; d++) { const aa = a + (d % 2 ? 1 : -1) * Math.ceil(d / 2) * 0.015, x = Math.cos(aa) * r, z = Math.sin(aa) * r; if (clearOf(x, z, 4)) { masts.push({ x, z, h, rot: rnd() * TAU, bt: 0.15 + r / 240 * 0.45 + rnd() * 0.05 }); break; } }
    if (!high && masts.length >= 5) break;
  }
  const mastGeo = (() => {
    const G = [], H = 1, legs = 3, bw = 0.07, top = 0.016, B = 0.055; // unit height, scaled per instance
    const P = (i, y) => { const a = i / legs * TAU, r = B + (top - B) * y; return new V3(Math.cos(a) * r, y, Math.sin(a) * r); };
    const bar = (p, q, w) => { const d = q.clone().sub(p), l = d.length(), g = new THREE.BoxGeometry(w, l, w); g.translate(0, l / 2, 0); g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new V3(0, 1, 0), d.normalize())); g.translate(p.x, p.y, p.z); return part(g, 0); };
    const N = high ? 9 : 6;
    for (let i = 0; i < legs; i++) { G.push(bar(P(i, 0), P(i, H), 0.006)); for (let k = 0; k < N; k++) G.push(bar(P(i, k / N), P((i + 1) % legs, (k + 1) / N), 0.0028)); }
    const dish = new THREE.SphereGeometry(0.05, high ? 12 : 8, 4, 0, TAU, 0, 0.9); dish.rotateZ(-1.2); dish.translate(0.03, 0.8, 0); G.push(part(dish, 1));
    G.push(part(new THREE.BoxGeometry(0.004, 0.18, 0.004).translate(0, 1.09, 0), 0));
    G.push(part(new THREE.BoxGeometry(0.03, 0.05, 0.03).translate(0.02, 0.62, 0.02), 1));                         // equipment box
    const g = mergeGeometries(G); G.forEach(x => x.dispose()); return g;
  })();
  const mastMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.55, metalness: 0.3, envMap, envMapIntensity: 0.5 });
  mastMat.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = 'attribute float kind; varying float vK; varying float vMy;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvK = kind; vMy = position.y;');
    sh.fragmentShader = 'uniform float uNight; varying float vK; varying float vMy;\n' + sh.fragmentShader
      .replace('#include <color_fragment>', `#include <color_fragment>
        diffuseColor.rgb = vK > 0.5 ? vec3(0.85, 0.83, 0.8) : mix(vec3(0.84, 0.82, 0.78), vec3(0.78, 0.26, 0.12), step(0.5, fract(vMy * 7.)));`)
      .replace('#include <lights_fragment_maps>', '#include <lights_fragment_maps>\niblIrradiance *= 1. - 0.9 * uNight; radiance *= 1. - 0.9 * uNight;');
  };
  mastMat.customProgramCacheKey = () => 'life-mast';
  const mastMesh = new THREE.InstancedMesh(mastGeo, mastMat, Math.max(1, masts.length)); mastMesh.castShadow = mastMesh.receiveShadow = true;
  mastMesh.boundingSphere = new THREE.Sphere(new V3(0, 10, 0), 300); group.add(mastMesh); tri(mastGeo);

  // ------------------------------------------------------------ graded roads: compacted lanes, tyre ruts, lamp pools (analytic, so overlaps match exactly)
  const roadGeo = (() => {
    const pos = [], idx = [], quad = (a, b, c, d) => { const o = pos.length / 3; pos.push(...a, ...b, ...c, ...d); idx.push(o, o + 1, o + 2, o, o + 2, o + 3); }, W = 4.2, Y = 0.035;
    for (const R of RINGS) { const n = 256; for (let i = 0; i < n; i++) { const a0 = i / n * TAU, a1 = (i + 1) / n * TAU, c0 = Math.cos(a0), s0 = Math.sin(a0), c1 = Math.cos(a1), s1 = Math.sin(a1);
      quad([c0 * (R - W), Y, s0 * (R - W)], [c1 * (R - W), Y, s1 * (R - W)], [c1 * (R + W), Y, s1 * (R + W)], [c0 * (R + W), Y, s0 * (R + W)]); } }
    const strip = (ax, az, bx, bz, n) => { const dx = bx - ax, dz = bz - az, l = Math.hypot(dx, dz), nx = -dz / l * W, nz = dx / l * W;
      for (let i = 0; i < n; i++) { const f0 = i / n, f1 = (i + 1) / n; quad([ax + dx * f0 - nx, Y, az + dz * f0 - nz], [ax + dx * f0 + nx, Y, az + dz * f0 + nz], [ax + dx * f1 + nx, Y, az + dz * f1 + nz], [ax + dx * f1 - nx, Y, az + dz * f1 - nz]); } };
    for (let k = 0; k < 8; k++) { const a = k * Q4; strip(Math.cos(a) * 19, Math.sin(a) * 19, Math.cos(a) * 252, Math.sin(a) * 252, 24); }
    strip(SPUR[0][0], SPUR[0][1], SPUR[1][0], SPUR[1][1], 6);
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); g.computeBoundingSphere(); return g;
  })();
  const roadMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.97, metalness: 0, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
  const RGL = /* glsl */ `
    uniform float uG, uNight; varying vec2 vRP;
    float segD(vec2 p, vec2 a, vec2 b){ vec2 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba) / dot(ba, ba), 0., 1.); return length(pa - ba * h); }
    // nearest road: d = |lateral offset|, build alpha, lamp pool
    void road(vec2 p, out float d, out float lat, out float built, out float pool){
      float r = length(p), an = atan(p.y, p.x); if (an < 0.) an += 6.2831853;
      d = 1e4; built = 0.; pool = 0.; lat = 0.;
      for (int i = 0; i < 3; i++) { float R = i == 0 ? 62. : (i == 1 ? 132. : 204.), l = r - R;
        if (abs(l) < d) { d = abs(l); lat = l; float bt = 0.02 + R / 236. * 0.55; built = smoothstep(bt, bt + 0.06, uG);
          float st = 6.2831853 / 100., ai = floor(an / st + 0.5), lb = 0.04 + R / 236. * 0.55 + ai / 100. * 0.08, al = (an - ai * st) * R;
          pool = smoothstep(lb, lb + 0.025, uG) * (exp(-(al * al + (l - 2.6) * (l - 2.6)) / 6.) + exp(-(al * al + (l + 2.6) * (l + 2.6)) / 6.)); } }
      for (int k = 0; k < 8; k++) { float a = float(k) * 0.78539816; vec2 u = vec2(cos(a), sin(a)); float al = dot(p, u), l = dot(p, vec2(-u.y, u.x));
        if (al > 19. && al < 252. && abs(l) < d) { d = abs(l); lat = l; built = (k == 6 ? smoothstep(0., 0.04, uG + 0.04) : smoothstep(al / 250. * 0.6 - 0.04, al / 250. * 0.6 + 0.01, uG)) * smoothstep(252., 242., al);
          float rk = 24. + 4. * clamp(floor((al - 24.) / 4. + 0.5), 0., 56.), lb = 0.02 + rk / 250. * 0.62, da = al - rk;
          pool = smoothstep(lb, lb + 0.025, uG) * (exp(-(da * da + (l - 3.) * (l - 3.)) / 6.) + exp(-(da * da + (l + 3.) * (l + 3.)) / 6.)); } }
      { float sd = segD(p, vec2(${SPUR[0][0].toFixed(1)}, ${SPUR[0][1].toFixed(1)}), vec2(${SPUR[1][0].toFixed(1)}, ${SPUR[1][1].toFixed(1)}));
        if (sd < d) { d = sd; lat = sd; built = smoothstep(0., 0.04, uG + 0.04) * smoothstep(0., 7., length(p - vec2(${SPUR[1][0].toFixed(1)}, ${SPUR[1][1].toFixed(1)}))); pool = 0.; } }
    }
`;
  roadMat.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = 'varying vec2 vRP;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvRP = position.xz;');
    sh.fragmentShader = RGL + sh.fragmentShader
      .replace('#include <color_fragment>', `#include <color_fragment>
        float rd, rl, rb, rp; road(vRP, rd, rl, rb, rp);
        float fw = max(fwidth(rl), 1e-3), al = abs(rl), rf = 1. - smoothstep(0.08, 0.5, fw);               // ruts fade before they alias
        float rut = 0.; for (int i = 0; i < 4; i++) { float c = float(i) < 2. ? 1.6 : -1.6, o = mod(float(i), 2.) < 0.5 ? 0.82 : -0.82; float q = (rl - c - o) / max(0.28, fw); rut += exp(-q * q); }
        float edge = 1. - smoothstep(3.0, 4.2, al);
        diffuseColor.rgb = mix(vec3(0.36, 0.22, 0.13), vec3(0.25, 0.15, 0.09), min(rut, 1.) * rf);
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.6, 0.42, 0.28), smoothstep(2.8, 3.6, al) * 0.5);   // pushed-up berm, paler
        diffuseColor.a = edge * rb * (0.42 + 0.22 * min(rut, 1.) * rf);
        float rPool = rp * edge;`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        totalEmissiveRadiance += vec3(1., 0.62, 0.3) * rPool * 0.09 * uNight * uNight;`);
  };
  roadMat.customProgramCacheKey = () => 'life-road';
  const roads = new THREE.Mesh(roadGeo, roadMat); roads.receiveShadow = true; roads.renderOrder = -2; group.add(roads); tri(roadGeo);

  // ------------------------------------------------------------ lights + dust: two point clouds, rewritten each frame
  const NL = NR * 5 + NF + masts.length * 2, lP = new Float32Array(NL * 3), lC = new Float32Array(NL * 4); // rgb + world size
  const lightGeo = new THREE.BufferGeometry(); lightGeo.setAttribute('position', new THREE.BufferAttribute(lP, 3).setUsage(THREE.DynamicDrawUsage)); lightGeo.setAttribute('aC', new THREE.BufferAttribute(lC, 4).setUsage(THREE.DynamicDrawUsage));
  const lightMat = new THREE.ShaderMaterial({ uniforms: U, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `uniform float uPx; attribute vec4 aC; varying vec3 vC; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.); vC = aC.rgb;
      float px = aC.w * uPx / max(-mv.z, 1.); vC *= min(1., px * px); gl_PointSize = clamp(px, 1.5, 28.); gl_Position = projectionMatrix * mv; if (dot(aC.rgb, vec3(1.)) < 1e-3) gl_Position = vec4(2., 2., 2., 1.); }`,
    fragmentShader: `varying vec3 vC; void main(){ float d = length(gl_PointCoord - .5) * 2.; gl_FragColor = vec4(vC * (exp(-d * d * 5.) + 0.35 * exp(-d * d * 1.2)) * (1. - smoothstep(0.85, 1., d)), 1.); }` });
  const lights = new THREE.Points(lightGeo, lightMat); lights.frustumCulled = false; lights.onBeforeRender = pxHook; group.add(lights);
  const K = high ? 12 : 7, ND = NR * K, dP = new Float32Array(ND * 3), dA = new Float32Array(ND * 2); // alpha, world size
  const dustGeo = new THREE.BufferGeometry(); dustGeo.setAttribute('position', new THREE.BufferAttribute(dP, 3).setUsage(THREE.DynamicDrawUsage)); dustGeo.setAttribute('aD', new THREE.BufferAttribute(dA, 2).setUsage(THREE.DynamicDrawUsage));
  const dustMat = new THREE.ShaderMaterial({ uniforms: U, transparent: true, depthWrite: false, blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor,
    vertexShader: `uniform float uPx; attribute vec2 aD; varying float vA; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.); float px = aD.y * uPx / max(-mv.z, 1.);
      vA = aD.x * min(1., px / 2.); gl_PointSize = clamp(px, 1., 64.); gl_Position = projectionMatrix * mv; if (aD.x < 1e-3) gl_Position = vec4(2., 2., 2., 1.); }`,
    fragmentShader: `uniform float uDay; varying float vA; void main(){ float d = length(gl_PointCoord - .5) * 2., a = vA * exp(-d * d * 2.6) * (1. - smoothstep(0.8, 1., d));
      gl_FragColor = vec4(vec3(0.74, 0.5, 0.32) * (0.12 + 0.88 * uDay) * a, a); }` });
  const dust = new THREE.Points(dustGeo, dustMat); dust.frustumCulled = false; dust.onBeforeRender = pxHook; dust.renderOrder = 2; group.add(dust);

  // ------------------------------------------------------------ per frame
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), yA = new V3(0, 1, 0), sc = new V3(), pv = new V3(), o = {}, o2 = {};
  function pose(v, T) { // -> { x, z, tx, tz (travel direction), moving }
    const p = v.r.path;
    if (p.closed) { at(p, v.s0 + v.dir * v.v * T, o); if (v.dir < 0) { o.tx = -o.tx; o.tz = -o.tz; } o.moving = 1; o.sb = v.s0 + v.dir * v.v * T; o.db = v.dir; return o; }
    const tr = p.len / v.v, C = 2 * tr + 2 * v.r.dwell, u = (((T + v.s0 * C) % C) + C) % C; let s, d = 1, mv = 1;
    if (u < tr) s = u * v.v; else if (u < tr + v.r.dwell) { s = p.len; mv = 0; } else if (u < 2 * tr + v.r.dwell) { s = p.len - (u - tr - v.r.dwell) * v.v; d = -1; } else { s = 0; mv = 0; d = -1; }
    at(p, s, o); if (d < 0) { o.tx = -o.tx; o.tz = -o.tz; } o.moving = mv; o.sb = s; o.db = d; return o;
  }
  const LANE = 1.7;
  function update(g, t, night, gR = g) {
    U.uT.value = t; U.uG.value = g; U.uNight.value = night; U.uDay.value = 1 - night;
    const T = t + g * 120, Tf = t + gR * 60; // timelapse clocks: scroll speeds the traffic up, walkers a little
    let li = 0; const L4 = (x, y, z, r, gg, b, s) => { lP[li * 3] = x; lP[li * 3 + 1] = y; lP[li * 3 + 2] = z; lC[li * 4] = r; lC[li * 4 + 1] = gg; lC[li * 4 + 2] = b; lC[li * 4 + 3] = s; li++; };
    rovers.forEach((v, i) => {
      const live = v.ship ? sst(arrive + 0.004 + v.k * 0.01, arrive + 0.02 + v.k * 0.01, gR) : v.r === padRun ? sst(PAD_ON, PAD_ON + 0.02, gR) * (1 - sst(PAD_OFF - 0.02, PAD_OFF, gR)) : sst(v.bt, v.bt + 0.02, g);
      const P = pose(v, T), hd = Math.atan2(P.tz, P.tx), rx = -P.tz, rz = P.tx, x = P.x + rx * LANE, z = P.z + rz * LANE;
      q.setFromAxisAngle(yA, -hd); m4.compose(pv.set(x, 0, z), q, sc.setScalar(Math.max(live, 1e-4))); roverMesh.setMatrixAt(i, m4); decal.setMatrixAt(i, m4);
      const head = sst(0.05 + v.h * 0.25, 0.14 + v.h * 0.25, night) * live; aOn.setXY(i, head, live);
      const fx = P.tx, fz = P.tz, hh = head * 1.8, tl = head * 0.9 * (P.moving ? 1 : 0.4);
      for (const s of [-0.85, 0.85]) { L4(x + fx * 3.15 + rx * s, 1.28, z + fz * 3.15 + rz * s, hh, hh * 0.9, hh * 0.75, 0.55); L4(x - fx * 3.15 + rx * s * 1.15, 1.3, z - fz * 3.15 + rz * s * 1.15, tl, tl * 0.08, tl * 0.05, 0.4); }
      const bk = live * (0.25 + 0.75 * night) * (Math.sin(t * 3 + i * 1.3) > 0.6 ? 1 : 0); L4(x - fx * 0.4, 3.45, z - fz * 0.4, bk, bk * 0.55, bk * 0.1, 0.3); // amber roof beacon
      // dust: puffs stream back along the road behind the wheels, rising and spreading as they age
      const ph = (T * 1.6 + v.h * 7) % 1, mvA = P.moving * live * (0.85 - 0.6 * night);
      for (let k = 0; k < K; k++) {
        const age = (k + ph) / K, s = P.sb - P.db * (3.6 + age * K * 2.4), j = i * K + k;
        at(v.r.path, s, o2); const side = ((k * 7 + i) % 3 - 1) * 0.9 * age, wx = age * age * 4;
        dP[j * 3] = o2.x + rx * (LANE + side) + wx; dP[j * 3 + 1] = 0.5 + age * 2.6; dP[j * 3 + 2] = o2.z + rz * (LANE + side) + wx * 0.4;
        dA[j * 2] = mvA * Math.sin(Math.PI * Math.min(1, age * 1.3)) * 0.34 * (1 - age); dA[j * 2 + 1] = 2.2 + age * 7;
      }
    });
    roverMesh.instanceMatrix.needsUpdate = decal.instanceMatrix.needsUpdate = true; aOn.needsUpdate = true;
    figs.forEach((f, i) => {
      const live = sst(f.on, f.on + 0.01, gR) * (1 - sst(f.off - 0.01, f.off, gR)), dx = f.B[0] - f.A[0], dz = f.B[1] - f.A[1], l = Math.hypot(dx, dz), tr = l / f.v;
      let x = f.A[0], z = f.A[1], hd = Math.atan2(dz, dx), w = 0;
      if (!f.stand) { const C = 2 * tr + 2 * f.dwell, u = (Tf + f.ph) % C;
        if (u < tr) { const k = u / tr; x += dx * k; z += dz * k; w = 1; } else if (u < tr + f.dwell) { x = f.B[0]; z = f.B[1]; hd += Math.PI; }
        else if (u < 2 * tr + f.dwell) { const k = 1 - (u - tr - f.dwell) / tr; x += dx * k; z += dz * k; hd += Math.PI; w = 1; } }
      else hd += Math.sin(Tf * 0.05 + f.ph) * 1.5;
      q.setFromAxisAngle(yA, -hd); m4.compose(pv.set(x, 0, z), q, sc.setScalar(Math.max(live, 1e-4))); figMesh.setMatrixAt(i, m4);
      aWalk.setXY(i, f.ph * 3.1, w);
      const hl = live * sst(0.2, 0.6, night) * 0.9; L4(x + Math.cos(hd) * 0.2, 1.72, z + Math.sin(hd) * 0.2, hl, hl * 0.92, hl * 0.8, 0.22); // helmet lamp
    });
    figMesh.instanceMatrix.needsUpdate = true; aWalk.needsUpdate = true;
    masts.forEach((m, i) => {
      const k = sst(m.bt, m.bt + 0.05, g); q.setFromAxisAngle(yA, m.rot); m4.compose(pv.set(m.x, 0, m.z), q, sc.set(m.h, Math.max(m.h * k, 1e-3), m.h)); mastMesh.setMatrixAt(i, m4);
      const b = k > 0.98 ? (0.35 + 0.65 * night) * (Math.sin(t * 2.2 + i) > 0.3 ? 1.6 : 0.05) : 0; L4(m.x, m.h * 1.18, m.z, b, b * 0.1, b * 0.06, 0.8); L4(m.x, m.h * 0.62, m.z, b * 0.5, b * 0.05, b * 0.03, 0.6);
    });
    if (!masts.length) mastMesh.setMatrixAt(0, m4.makeScale(0, 0, 0));
    mastMesh.instanceMatrix.needsUpdate = true;
    while (li < NL) L4(0, -50, 0, 0, 0, 0, 0);
    lightGeo.attributes.position.needsUpdate = lightGeo.attributes.aC.needsUpdate = true; dustGeo.attributes.position.needsUpdate = dustGeo.attributes.aD.needsUpdate = true;
  }
  update(0, 0, 0, 0);
  return { group, update, masts, tris: TRIS, draws: 7, counts: { rovers: NR, figures: figs.length, masts: masts.length } };
}
