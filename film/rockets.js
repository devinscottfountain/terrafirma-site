// rockets.js: Starships for the Jezero timelapse. Two ships land early (plume, billowing dust, ground splash) and stay parked; a third
// is craned onto a pad band by band (hoist, slew, lower; weld sparks at night) and LAUNCHES near the end: ignition chug on the
// hold-down, a layered engine plume (hot core with shock diamonds, body, turbulent envelope) whose core blooms and streaks, a ground
// cloud that billows out from the pad lit warm by the plume, a climb with real acceleration that pitches downrange and leaves a smoke
// column, and the plume taking over the shadow light so long shadows flick across the colony. Hull geometry and the steel look
// come from the footer (foot-model-starship.js), so the film's ships and the footer's are one material.
// Everything is driven by the colony clock g (deterministic, scroll); t only adds flicker and turbulence. g may run past 1 (the
// film keeps the ascent going on real time after the track ends): only the launch reads it there.
// createRockets({ THREE, foot, colony, envMap, high, sites, light }) -> { update(g, t, night), group, launch, flares, T, FLARE_LAYER, setKeep }
//   foot: { buildStarships, mergeAll, steel: { STEEL_FLAT, steelUniforms, steelShader } }; sites: { land: [[x, z], ...], build: [x, z] } (colony m)
//   light (default true): one warm PointLight in the colony group, always visible (intensity 0 when idle) so the light count never
//   changes after the colony warm-up. Pass false if the colony programs were already compiled without it.
//   launch: { pos, base, top (world), y (m), ignite, burn (0..1), tau, fx, light: { pos (colony), k, i }, shake, exp } for the camera,
//   the grade and the shadow light; flares: [{ pos, color, i }] for the grade.

const sst = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const cl01 = x => Math.min(1, Math.max(0, x)), eo = x => 1 - Math.pow(1 - cl01(x), 3);
const hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const noise = x => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return hash(i) * (1 - u) + hash(i + 1) * u; };
// arrival: [start, touchdown] per ship; both down, engines cut and dust settled by ~0.1 (the colony build holds until ARRIVE 0.1)
const LAND = [[0.0, 0.045], [0.018, 0.064]], DROP = 520;
const BANDS = [0, 10.2, 18.9, 27.5, 34.7, 52.2];
// master timeline (colony clock g). Climb: y = climb * tau^2 * (1 + jerk * tau), tau = g - lift (thrust to weight grows as it burns)
const T0 = { pad: 0.3, tower: [0.32, 0.38], lifts: [0.4, 0.45, 0.5, 0.55, 0.6], liftLen: 0.04, flaps: [0.655, 0.695], scaf: [0.71, 0.76],
  ignite: 0.8, lift: 0.83, climb: 4800, jerk: 4, drift: 0.00025, gMax: 1.4 };
export const FLARE_LAYER = 5; // plume meshes + engine glows are also on this layer (post can render it alone for a bright-source mask)
export const climbY = (tau, T = T0) => (tau > 0 ? T.climb * tau * tau * (1 + T.jerk * tau) : 0);

// shared noise for the plume, splash and cloud shaders
const PNOISE = `float pH(vec3 p){ p=fract(p*.3183099+.1); p*=17.; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
float pN(vec3 x){ vec3 i=floor(x), f=fract(x); f=f*f*(3.-2.*f);
  return mix(mix(mix(pH(i),pH(i+vec3(1,0,0)),f.x),mix(pH(i+vec3(0,1,0)),pH(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(pH(i+vec3(0,0,1)),pH(i+vec3(1,0,1)),f.x),mix(pH(i+vec3(0,1,1)),pH(i+vec3(1,1,1)),f.x),f.y),f.z); }`;

export function createRockets({ THREE, foot, colony, envMap, high, sites, light = true }) {
  const T = T0;
  const group = new THREE.Group(); colony.add(group);
  // ---------- ship parts from the footer builder: one ship at the origin, sorted into hull / flaps ----------
  const steelK = {}, flapK = {}, darkK = {}, padK = {}, beaconK = {}, calls = [];
  const out = foot.buildStarships({ THREE, B: { P: (m, g) => calls.push([m, g]) }, M: { stainless: steelK, flap: flapK, dark: darkK, pad: padK, beacon: beaconK }, high, ships: [{ x: 0, z: 0, lod: 1 }] });
  const base = out[0].y, hull = [], flaps = [], bb = new THREE.Box3();
  for (const [m, g] of calls) {
    if (m === padK || m === beaconK) { g.dispose(); continue; }
    g.translate(0, -base, 0); g.computeBoundingBox(); bb.copy(g.boundingBox);
    // uniform stainless all round: a half-lathe heat-tile shell (tall and lopsided) is dropped whatever bucket it arrives in
    const asym = Math.max(Math.abs(bb.min.x + bb.max.x), Math.abs(bb.min.z + bb.max.z));
    if (bb.max.y - bb.min.y > 20 && asym > 2) { g.dispose(); continue; }
    if (m === darkK) { hull.push(g); continue; }
    if (m === flapK) { flaps.push(g); continue; }
    const rad = Math.max(-bb.min.x, bb.max.x, -bb.min.z, bb.max.z), h = bb.max.y - bb.min.y;
    (rad > 4.8 && h > 1 && bb.max.y > 0.5 ? flaps : hull).push(g);
  }
  const merge = gs => { const g = foot.mergeAll(THREE, gs); let y0 = Infinity; const p = g.attributes.position; for (let i = 0; i < p.count; i++) y0 = Math.min(y0, p.getY(i)); g.userData.y0 = y0; return g; };
  const hullG = merge(hull), flapG = merge(flaps);
  const FEET = -hullG.userData.y0; // lift so the leg pads touch y = 0
  [hullG, flapG].forEach(g => { g.translate(0, FEET, 0); g.computeBoundingSphere(); });
  [...hull, ...flaps].forEach(g => g.dispose());

  // steel: the footer's Starship material (foot-model-starship.js STEEL_FLAT + steelShader), so film and footer ships are one look
  const SF = foot.steel, steelU = SF.steelUniforms(THREE);
  const steel = SF.steelShader(new THREE.MeshStandardMaterial({ ...SF.STEEL_FLAT.stainless, envMap }), steelU);
  const flapSteel = SF.steelShader(new THREE.MeshStandardMaterial({ ...SF.STEEL_FLAT.flap, envMap }), steelU);
  const orange = new THREE.MeshStandardMaterial({ color: 0xf0a35a, emissive: 0x3a1a00, roughness: 0.6 });
  const concrete = new THREE.MeshStandardMaterial({ color: 0x8a8078, roughness: 0.9 });
  const flareTag = o => { o.layers.enable(FLARE_LAYER); o.userData.flare = true; o.frustumCulled = false; return o; };

  // ---------- shared VFX pieces ----------
  // plume layer: an open lathe (radius 1 at its widest, nozzle at y 0, tail at y -1), additive. One program for every layer; the
  // layers differ by uniforms only. uK: x = how much the face-on centre outweighs the rim, y = fade along the length,
  // z = turbulence (noise scrolling down the plume), w = colour shift + noise seed. uH: HDR hot spot at the nozzle, uD: shock diamonds.
  const plumeMat = new THREE.ShaderMaterial({
    uniforms: { uI: { value: 0 }, uT: { value: 0 }, uN: { value: 5 }, uD: { value: 0 }, uH: { value: 0 }, uLen: { value: 40 }, uK: { value: new THREE.Vector4(2.5, 1.4, 0, 0) } },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    vertexShader: 'varying float vY; varying vec2 vD; varying vec3 vN, vV; void main(){ vY = -position.y; vD = position.xz; vec4 mv = modelViewMatrix * vec4(position, 1.); vN = normalMatrix * normal; vV = -mv.xyz; gl_Position = projectionMatrix * mv; }',
    fragmentShader: `uniform float uI, uT, uN, uD, uH, uLen; uniform vec4 uK; varying float vY; varying vec2 vD; varying vec3 vN, vV;
      ${PNOISE}
      void main(){ float f = abs(dot(normalize(vN), normalize(vV))), body = pow(f, uK.x), y = vY; vec2 d = normalize(vD + 1e-5);
        // turbulence: gas leaving the nozzle, two octaves stretched along the plume and scrolling down it (more as it expands)
        float n = pN(vec3(d * 1.7 + uK.w * 7., y * uLen * .08 - uT * 9.)) * .65 + pN(vec3(d * 4.3, y * uLen * .25 - uT * 23.)) * .35;
        float turb = mix(1., .3 + 1.4 * n, uK.z * smoothstep(0., .45, y));
        vec3 c = mix(vec3(1., .97, .93), vec3(1., .7, .38), smoothstep(0., .25 + .25 * uK.w, y)); c = mix(c, vec3(.9, .34, .12), smoothstep(.35, 1., y));
        float a = pow(max(1. - y, 0.), uK.y) * smoothstep(0., .03, y + .005) * (.15 + .85 * body) * turb;
        float dia = pow(.5 + .5 * cos(y * uN * 6.2832), 14.) * (1. - smoothstep(.04, .5, y)) * body * uD;
        float hot = exp(-y * 18.) * body * body * uH;
        gl_FragColor = vec4((c * a * 2.2 + vec3(1., .9, .96) * dia * 2. + vec3(1., .95, .88) * hot) * uI, 1.); }`
  });
  // under-expanded in the thin air: necks at the nozzle, balloons out, then thins
  const prof = []; for (let i = 0; i <= 18; i++) { const v = i / 18; prof.push(new THREE.Vector2(Math.max(0.02, (0.42 + 0.58 * sst(0, 0.35, v)) * (1 - 0.3 * v * v)), -v)); }
  const plumeG = new THREE.LatheGeometry(prof, high ? 32 : 20);
  const glowTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.25, 'rgba(255,190,120,0.6)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
  const glowMat = () => new THREE.SpriteMaterial({ map: glowTex, color: 0xffc08a, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true });
  const mkLayer = () => { const m = flareTag(new THREE.Mesh(plumeG, plumeMat.clone())); m.renderOrder = 3; m.visible = false; group.add(m); return m; }; // over the smoke
  const mkPlume = () => { const m = mkLayer(), s = flareTag(new THREE.Sprite(glowMat())); s.renderOrder = 3; s.visible = false; group.add(s); return { m, s }; };
  // ground splash: the exhaust fanning out across the pad while the engines are low, broken into rays by scrolling noise
  const splashMat = new THREE.ShaderMaterial({
    uniforms: { uI: { value: 0 }, uT: { value: 0 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4,
    vertexShader: 'varying vec2 vP; void main(){ vP = position.xz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
    fragmentShader: `uniform float uI, uT; varying vec2 vP; ${PNOISE}
      void main(){ float r = length(vP); vec2 d = vP / max(r, 1e-4);
        float rays = .35 + 1.3 * pN(vec3(d * 5., r * 4. - uT * 5.)) * pN(vec3(d * 11. + 3., r * 2. - uT * 3.));
        float fall = (exp(-r * 5.) * 1.6 + exp(-r * 2.2) * .5) * (1. - smoothstep(.55, 1., r));
        vec3 c = mix(vec3(1., .86, .62), vec3(1., .42, .14), smoothstep(0., .5, r));
        gl_FragColor = vec4(c * fall * mix(1., rays, smoothstep(.04, .25, r)) * uI, 1.); }`
  });
  const sGeo = new THREE.PlaneGeometry(2, 2).rotateX(-Math.PI / 2);
  const mkSplash = (x, z) => { const m = new THREE.Mesh(sGeo, splashMat.clone()); m.position.set(x, 1.3, z); m.frustumCulled = false; m.renderOrder = 1; m.visible = false; group.add(m); return m; };
  // one warm light for every burn (whichever is active), present from the start so program keys never change
  const fire = light ? new THREE.PointLight(0xffa25a, 0, 2600, 2) : null; if (fire) group.add(fire); // physical falloff: the plume lights its surroundings, not the plain

  // ---------- arrival: two parked ships, instanced ----------
  const landSteel = new THREE.InstancedMesh(hullG, steel, LAND.length), landDark = new THREE.InstancedMesh(flapG, flapSteel, LAND.length);
  [landSteel, landDark].forEach(m => { m.castShadow = m.receiveShadow = true; m.frustumCulled = false; group.add(m); });
  const mtx = new THREE.Matrix4(), v = new THREE.Vector3(), one = new THREE.Vector3(1, 1, 1);
  const yaw = sites.land.map((s, i) => new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0.6 + i * 1.9));
  const plumes = sites.land.map(() => mkPlume());
  const landGlow = sites.land.map(([x, z]) => mkSplash(x, z));

  // ---------- landing dust: one GPU point cloud, one emitter per landing, each driven by a vec4 from the JS side ----------
  // uE[i] = (front radius m, billow height m, opacity, plume glow); per particle d = (emitter, angle, radial seed, height seed)
  const NL = high ? 130 : 56, nD = NL * 2, dA = new Float32Array(nD * 4);
  for (let i = 0; i < nD; i++) { const e = i < NL ? 0 : 1; dA.set([e, hash(i * 3.1) * 6.2832, hash(i * 7.7 + 1), hash(i * 5.3 + 2)], i * 4); }
  const dG = new THREE.BufferGeometry(); dG.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(nD * 3), 3)); dG.setAttribute('d', new THREE.BufferAttribute(dA, 4));
  const [bx, bz] = sites.build, B = new THREE.Vector3(bx, 0, bz);
  const dU = { uE: { value: [new THREE.Vector4(), new THREE.Vector4()] }, uC: { value: [new THREE.Vector3(sites.land[0][0], 0, sites.land[0][1]), new THREE.Vector3(sites.land[1][0], 0, sites.land[1][1])] },
    uNight: { value: 0 }, uT: { value: 0 }, uVH: { value: 1100 } };
  const dust = new THREE.Points(dG, new THREE.ShaderMaterial({
    uniforms: dU, transparent: true, depthWrite: false,
    vertexShader: `attribute vec4 d; uniform vec4 uE[2]; uniform vec3 uC[2]; uniform float uT, uVH; varying float vA, vH, vR;
      void main(){ int i = int(d.x + .5); vec4 E = i == 0 ? uE[0] : uE[1]; vec3 c = i == 0 ? uC[0] : uC[1];
        float core = step(.82, d.w), rr = mix(mix(.22, 1., pow(d.z, .45)), .08 + .25 * d.z, core), r = E.x * rr + 4.;
        float a = d.y + .25 * sin(uT * .15 + d.z * 9.) * (1. - rr);
        float h = 1. + E.y * mix(d.w * (.35 + .65 * (1. - rr * rr)), 1.2 + 1.6 * (d.w - .82) * 5.5, core);
        vec4 mv = modelViewMatrix * vec4(c + vec3(cos(a) * r, h, sin(a) * r), 1.);
        vA = E.z * (.55 + .45 * d.z) * (E.x > 0. ? 1. : 0.); vH = E.w * exp(-r / 90. - h / 60.); vR = d.z;
        float s = (7. + .06 * E.x + .45 * E.y) * (.6 + .8 * d.w);
        gl_PointSize = vA > .002 ? clamp(s * uVH / -mv.z, 1., 256.) : 0.; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform float uNight; varying float vA, vH, vR;
      void main(){ vec2 q = gl_PointCoord - .5; float r = length(q), lump = .8 + .2 * sin(q.x * 13. + vR * 40.) * sin(q.y * 11. - vR * 23.);
        vec3 col = vec3(.74, .5, .35) * (1. - .82 * uNight) + vec3(1., .55, .25) * vH * .9;
        gl_FragColor = vec4(col, vA * pow((1. - smoothstep(0., .5, r)), 1.5) * lump); }`
  }));
  dust.frustumCulled = false; group.add(dust);
  const vh2 = new THREE.Vector2();
  const pxScale = (r, cam, U) => { r.getDrawingBufferSize(vh2); U.uVH.value = vh2.y * 0.5 * cam.projectionMatrix.elements[5]; }; // metres -> px at 1 m
  dust.onBeforeRender = (r, s, cam) => pxScale(r, cam, dU);

  // ---------- build site: pad, crane tower with a slewing jib, scaffold, the ship stacked band by band ----------
  const clipU = () => ({ value: new THREE.Vector2(-1, -1) });
  const clipMat = (base, U, depth) => {
    const clip = s => { s.uniforms.uBand = U;
      s.vertexShader = s.vertexShader.replace('#include <common>', '#include <common>\nvarying float vLY;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvLY = position.y;');
      s.fragmentShader = s.fragmentShader.replace('#include <common>', '#include <common>\nuniform vec2 uBand; varying float vLY;').replace('void main() {', 'void main() {\nif (vLY < uBand.x || vLY > uBand.y) discard;'); };
    if (depth) { const m = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking }); m.onBeforeCompile = clip; m.customProgramCacheKey = () => 'd5clip-d'; return m; }
    const m = SF.steelShader(base.clone(), steelU, clip, 'd5clip-steel'); m.side = THREE.DoubleSide; return m; // open band tops show the inside wall
  };
  const band = (geo, mat) => { const U = clipU(), m = new THREE.Mesh(geo, clipMat(mat, U)); m.customDepthMaterial = clipMat(null, U, true); m.castShadow = m.receiveShadow = true; m.position.copy(B); m.userData.U = U; group.add(m); return m; };
  const stackS = band(hullG, steel), liftS = band(hullG, steel);
  const steels = [steel, flapSteel, stackS.material, liftS.material]; steels.forEach(m => (m.userData.env = m.envMapIntensity));
  const flapM = new THREE.Mesh(flapG, flapSteel); flapM.position.copy(B); flapM.castShadow = flapM.receiveShadow = true; group.add(flapM);
  const pad = new THREE.Mesh(new THREE.CylinderGeometry(15, 16.5, 1.2, high ? 40 : 24).translate(0, 0.6, 0), concrete); pad.position.copy(B); pad.receiveShadow = pad.castShadow = true; group.add(pad);
  // scorch: the pad blackens under the engines after liftoff (the footer's second ship stands on it)
  const scorch = new THREE.Mesh(new THREE.CircleGeometry(15, high ? 40 : 24).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x050302, map: glowTex, transparent: true, depthWrite: false, opacity: 0 }));
  scorch.position.set(bx, 1.23, bz); group.add(scorch);
  // tower: lattice of thin boxes, behind-left of the ship as the late camera sees it; it stays for the next ship
  const box = (w, h, d, x, y, z) => new THREE.BoxGeometry(w, h, d).translate(x, y, z), TH = 74;
  const tw = []; for (const sx of [-3, 3]) for (const sz of [-3, 3]) tw.push(box(0.7, TH, 0.7, sx, TH / 2, sz));
  for (let y = 4; y < TH; y += 6) { tw.push(box(6.7, 0.35, 0.35, 0, y, -3), box(6.7, 0.35, 0.35, 0, y, 3), box(0.35, 0.35, 6.7, -3, y, 0), box(0.35, 0.35, 6.7, 3, y, 0)); }
  const towerG = foot.mergeAll(THREE, tw); tw.forEach(g => g.dispose());
  const tower = new THREE.Mesh(towerG, orange); tower.castShadow = true; tower.position.set(bx - 12, 0, bz + 10); group.add(tower);
  const tx = tower.position.x, tz = tower.position.z;
  const toShip = Math.atan2(-(bz - tz), bx - tx), reach = Math.hypot(bx - tx, bz - tz), SLEW = -1.05; // bands are staged on the ground SLEW rad round from the pad
  const jib = new THREE.Group(); jib.position.set(tx, TH, tz); group.add(jib);
  const jibM = new THREE.Mesh(foot.mergeAll(THREE, [box(reach + 8, 1.2, 1.2, (reach + 8) / 2 - 2, 1, 0), box(5, 2.6, 2.4, -5, 0.6, 0), box(1.6, 3, 1.6, 0, 2.5, 0)]), orange); jibM.castShadow = true; jib.add(jibM);
  const cable = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1, 0.15).translate(0, -0.5, 0), orange); cable.position.set(reach, 0.5, 0); jib.add(cable);
  const sc = []; for (const sx of [-6.5, 6.5]) for (const sz of [-6.5, 6.5]) sc.push(box(0.3, 52, 0.3, sx, 26, sz));
  for (let y = 3; y < 52; y += 6.5) sc.push(box(13.3, 0.25, 0.25, 0, y, -6.5), box(13.3, 0.25, 0.25, 0, y, 6.5), box(0.25, 0.25, 13.3, -6.5, y, 0), box(0.25, 0.25, 13.3, 6.5, y, 0), box(13, 0.12, 2.2, 0, y - 0.1, -5.4));
  const scaf = new THREE.Mesh(foot.mergeAll(THREE, sc), orange); sc.forEach(g => g.dispose()); scaf.position.copy(B); scaf.castShadow = true; group.add(scaf);
  // work lights: warm points round the pad and up the tower, they carry the stack at night
  const lp = []; for (let i = 0; i < 8; i++) { const a = i / 8 * 6.2832; lp.push(bx + Math.cos(a) * 15.5, 1.6, bz + Math.sin(a) * 15.5); }
  for (let y = 12; y < TH; y += 15) lp.push(tx + 3.4, y, tz - 3.4);
  const lG = new THREE.BufferGeometry(); lG.setAttribute('position', new THREE.Float32BufferAttribute(lp, 3));
  const lU = { uOn: { value: 0 } };
  const lights = new THREE.Points(lG, new THREE.ShaderMaterial({ uniforms: lU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: 'uniform float uOn; varying float vA; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.); vA = uOn; gl_PointSize = uOn > 0. ? clamp(2600. / -mv.z, 2., 9.) : 0.; gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'varying float vA; void main(){ float d = length(gl_PointCoord - .5); gl_FragColor = vec4(vec3(1., .86, .66) * vA * smoothstep(.5, .05, d) * 2.2, 1.); }' }));
  lights.frustumCulled = false; group.add(lights);
  // weld sparks: three arcs on the newest seam, sparks falling off them (first 3 points are the arcs themselves)
  const NS = high ? 180 : 72, sA = new Float32Array(NS * 4);
  for (let i = 0; i < NS; i++) sA.set([i % 3, hash(i * 1.37 + 9), hash(i * 2.71 + 4), i < 3 ? 1 : 0], i * 4);
  const sG = new THREE.BufferGeometry(); sG.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(NS * 3), 3)); sG.setAttribute('s', new THREE.BufferAttribute(sA, 4));
  const sU = { uOn: { value: 0 }, uT: { value: 0 }, uY: { value: 0 }, uC: { value: B.clone() } };
  const sparks = new THREE.Points(sG, new THREE.ShaderMaterial({ uniforms: sU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `attribute vec4 s; uniform float uOn, uT, uY; uniform vec3 uC; varying float vA;
      void main(){ float a = s.x * 2.094 + .6 + .15 * sin(uT * .7 + s.x), fl = fract(uT * 1.6 + s.y), l = fl * .9;
        vec3 o = vec3(cos(a), 0., sin(a)), p = uC + o * 4.7 + vec3(0., uY, 0.);
        vec3 tg = vec3(-o.z, 0., o.x) * (s.z - .5) * 5.;
        if (s.w < .5) p += (o * (1.5 + 4. * s.z) + tg) * l + vec3(0., 2.5 * s.y - 9.8 * l * l, 0.);
        float fk = .55 + .45 * sin(uT * 53. + s.x * 7.) * sin(uT * 31. + s.x);
        vA = uOn * (s.w > .5 ? fk : (1. - fl)); vec4 mv = modelViewMatrix * vec4(p, 1.);
        gl_PointSize = vA > .01 ? clamp((s.w > .5 ? 9000. : 1300.) / -mv.z, 1.5, s.w > .5 ? 26. : 3.) : 0.; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: 'varying float vA; void main(){ float d = length(gl_PointCoord - .5); gl_FragColor = vec4(mix(vec3(1., .62, .3), vec3(1., .95, .9), vA) * vA * (1. - smoothstep(0., .5, d)) * 3., 1.); }' }));
  sparks.frustumCulled = false; group.add(sparks);


  // ---------- launch: core (with the nozzle glow, the flare source), body and envelope layers, ground splash, pad cloud, smoke column ----------
  const LC = mkPlume(), LB = mkLayer(), LE = mkLayer();
  LC.s.material.color.setRGB(6, 4, 2.5); // HDR: the brightest light in the film and the only one over the streak threshold (post look.streakThr 6)
  const padSplash = mkSplash(bx, bz);
  const DR = new THREE.Vector3(-1, 0, -0.32).normalize(), tiltAx = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), DR).normalize();
  const yMax = climbY(T.gMax - T.lift, T);
  // smoke column: particles strung along the climb; each appears when the ship passes its height (tauAt inverts the climb)
  const NC = high ? 1100 : 380, cA = new Float32Array(NC * 4);
  for (let i = 0; i < NC; i++) cA.set([(i + hash(i * 4.1)) / NC, hash(i * 9.3) * 6.2832, hash(i * 3.7 + 5), Math.sqrt(hash(i * 6.1 + 7))], i * 4);
  const cG = new THREE.BufferGeometry(); cG.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(NC * 3), 3)); cG.setAttribute('c', new THREE.BufferAttribute(cA, 4));
  const cU = { uTau: { value: -1 }, uK: { value: T.climb }, uJ: { value: T.jerk }, uYM: { value: yMax }, uDR: { value: DR.clone().multiplyScalar(T.drift) }, uBase: { value: B.clone() }, uShip: { value: new THREE.Vector3() },
    uBurn: { value: 0 }, uNight: { value: 0 }, uVH: { value: 1100 }, uKeep: { value: 1 } };
  const column = new THREE.Points(cG, new THREE.ShaderMaterial({
    uniforms: cU, transparent: true, depthWrite: false,
    vertexShader: `attribute vec4 c; uniform float uTau, uK, uJ, uYM, uBurn, uVH, uKeep; uniform vec3 uDR, uBase, uShip; varying float vA, vHot, vY, vS;
      float tauAt(float y){ float t = sqrt(y / uK); for (int i = 0; i < 3; i++) { float f = uK * t * t * (1. + uJ * t) - y, df = uK * (2. * t + 3. * uJ * t * t); t -= f / max(df, 1e-3); } return max(t, 0.); }
      void main(){ float y = uYM * pow(c.x, 1.8), age = uTau - tauAt(y);
        vec3 p = uBase + vec3(0., y, 0.) + uDR * y * y;
        float low = 1. - smoothstep(0., 60., y), spread = (3. + 6. * (1. - exp(-age * 90.)) + 120. * sqrt(max(age, 0.)) * (.4 + c.z)) * (1. + .6 * low);
        p += vec3(cos(c.y), 0., sin(c.y)) * spread * c.w + vec3(.35, 0., 1.) * max(age, 0.) * 260. * smoothstep(0., 500., y);
        p.y += max(age, 0.) * (40. * low + 30.) * c.z;
        vec4 mv = modelViewMatrix * vec4(p, 1.);
        vA = age > 0. ? .42 * smoothstep(0., .012, age) * mix(1., .55, c.x) * (1. - .35 * smoothstep(.08, .2, age)) * (1. - .55 * low) * step(fract(c.y * 3.71), uKeep) : 0.;
        vHot = uBurn * exp(-distance(p, uShip) / 45.); vY = y; vS = c.z;
        gl_PointSize = vA > .002 ? clamp((5. + spread * 1.25) * uVH / -mv.z, 1., 256.) : 0.; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform float uNight; varying float vA, vHot, vY, vS;
      void main(){ vec2 q = gl_PointCoord - .5; float r = length(q), lump = .78 + .22 * sin(q.x * 12. + vS * 50.) * sin(q.y * 10. - vS * 31.);
        vec3 col = mix(vec3(.66, .55, .48), vec3(.17, .15, .18), uNight) + vec3(1., .56, .32) * .8 * smoothstep(150., 900., vY) * uNight + vec3(1., .6, .3) * vHot * 1.6;
        gl_FragColor = vec4(col, vA * pow((1. - smoothstep(0., .5, r)), 1.4) * lump); }`
  }));
  column.frustumCulled = false; column.visible = false; group.add(column);
  column.onBeforeRender = (r, s, cam) => pxScale(r, cam, cU);
  // pad cloud: exhaust and regolith thrown out along the ground from ignition, billowing fast then slowing; hugs the ground, the core
  // over the pad rises. Lit by the sky and, warm, by the plume (inverse square from the engines). Per particle c = (azimuth, radial,
  // height, size) seeds; uAge = g since ignition. uKeep < 1 drops a share of the particles (governor), uniform only.
  const NB = high ? 2400 : 800, bA = new Float32Array(NB * 4);
  for (let i = 0; i < NB; i++) bA.set([hash(i * 2.3 + 0.7) * 6.2832, hash(i * 5.9 + 3), hash(i * 8.1 + 11), hash(i * 3.3 + 17)], i * 4);
  const bG = new THREE.BufferGeometry(); bG.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(NB * 3), 3)); bG.setAttribute('c', new THREE.BufferAttribute(bA, 4));
  const bU = { uAge: { value: -1 }, uT: { value: 0 }, uNight: { value: 0 }, uVH: { value: 1100 }, uKeep: { value: 1 }, uC: { value: B.clone() }, uFire: { value: new THREE.Vector3() }, uFireI: { value: 0 } };
  const cloud = new THREE.Points(bG, new THREE.ShaderMaterial({
    uniforms: bU, transparent: true, depthWrite: false,
    vertexShader: `attribute vec4 c; uniform float uAge, uT, uVH, uKeep, uFireI; uniform vec3 uC, uFire; varying float vA, vHot, vS, vH;
      void main(){ float a = uAge - c.y * .012, on = step(0., a) * step(fract(c.x * 7.13 + c.w * 3.7), uKeep), aa = max(a, 0.);
        float k = 1. - exp(-aa * 10.);
        float r = 6. + (26. + 190. * pow(c.y, .8)) * k, ang = c.x + .06 * sin(uT * .13 + c.w * 21.) * k;
        float h = 2. + pow(c.z, 1.6) * (8. + 46. * k) * (1.1 - .6 * c.y) * (.6 + .8 * fract(c.w * 5.3)) + aa * 70. * c.z * (1. - c.y) * (1. - c.y); // lumpy top, not a cap
        vec3 p = uC + vec3(cos(ang) * r, h, sin(ang) * r) + vec3(sin(uT * .21 + c.w * 13.), 0., cos(uT * .17 + c.z * 11.)) * 3. * k;
        vec4 mv = modelViewMatrix * vec4(p, 1.);
        float s = (4. + 18. * k + 16. * c.w * c.w) * (.6 + .7 * k); // small puffs early, a few big ones later
        vA = on * .3 * smoothstep(0., .006, a) * (1. - .6 * smoothstep(.1, .5, a)) * (1. - .5 * c.y);
        float d = distance(p, uFire); vHot = uFireI / (1. + d * d / 1600.); vS = c.w; vH = h;
        gl_PointSize = vA > .002 ? clamp(s * uVH / -mv.z, 1., 300.) : 0.; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform float uNight; varying float vA, vHot, vS, vH;
      void main(){ vec2 q = gl_PointCoord - .5; float r = length(q), lump = .75 + .25 * sin(q.x * 11. + vS * 40.) * sin(q.y * 9. - vS * 23.);
        vec3 amb = mix(vec3(.62, .45, .33), vec3(.12, .09, .085), uNight) * (.75 + .25 * smoothstep(0., 30., vH));
        gl_FragColor = vec4((amb + vec3(1., .55, .26) * vHot) * (.6 + .6 * vS), vA * pow(1. - smoothstep(0., .5, r), 1.6) * lump); }` // per puff shade: billows, not cotton
  }));
  cloud.frustumCulled = false; cloud.visible = false; cloud.renderOrder = 2; group.add(cloud);
  cloud.onBeforeRender = (r, s, cam) => pxScale(r, cam, bU);

  // ---------- API for the camera, the grade and the shadow light ----------
  // launch.pos = mid-body (world), base = engines, top = nose; fx = suggested post.fx values (flash, heat, bloom);
  // light = the plume as the shadow light (colony space, k = how much it takes over from the sun, i = its strength);
  // shake (0..1) and exp (0..1, the plume's share of the frame's light) for the camera
  const launch = { pos: new THREE.Vector3(), base: new THREE.Vector3(), top: new THREE.Vector3(), y: 0, ignite: 0, burn: 0, tau: 0, fx: { flash: 0, heat: 0, bloom: 0 },
    light: { pos: new THREE.Vector3(), k: 0, i: 0 }, shake: 0, exp: 0 };
  const flares = [0, 1, 2].map(() => ({ pos: new THREE.Vector3(), color: new THREE.Color(0xffc08a), i: 0 })); // [launch, landing 0, landing 1]
  const shipQ = new THREE.Quaternion(), shipP = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0), tmp = new THREE.Vector3(), axis = new THREE.Vector3(), noz = new THREE.Vector3();
  const fireP = new THREE.Vector3(); const toWorld = (out, p) => out.copy(p).applyMatrix4(group.matrixWorld);
  const rides = [null, null]; // the stacked ship's meshes (set below), moved with the launch transform

  // crane cycle for band k at lift phase c (0..1): hoist off the staging spot, slew over the pad, lower onto the stack
  const cs = { k: -1, c: 0, s: 0 };
  const crane = g => {
    const L = T.lifts; cs.k = -1; cs.c = 0; cs.s = 0;
    for (let i = 0; i < L.length; i++) {
      if (g >= L[i] && g < L[i] + T.liftLen) { cs.k = i; cs.c = (g - L[i]) / T.liftLen; cs.s = sst(0.3, 0.68, cs.c); break; }
      if (g >= L[i] + T.liftLen && (i === L.length - 1 || g < L[i + 1])) { cs.s = 1 - sst(0, 1, (g - L[i] - T.liftLen) / Math.max(0.004, (i < L.length - 1 ? L[i + 1] : L[i] + 0.06) - L[i] - T.liftLen)); break; }
    }
    return cs;
  };
  const LK = [new THREE.Vector4(2.6, 1.1, 0.12, 0), new THREE.Vector4(1.5, 1.4, 0.55, 0.35), new THREE.Vector4(0.9, 1.9, 1, 0.8)]; // core, body, envelope

  // one plume layer on the nozzle, along the ship's axis
  const layer = (m, k, t, w, len, I) => { m.position.copy(noz); m.quaternion.copy(shipQ); m.scale.set(w, Math.max(0.5, len), w);
    const U = m.material.uniforms; U.uI.value = I; U.uT.value = t + k * 1.7; U.uLen.value = len; U.uK.value.copy(LK[k]); return U; };

  let lastG = -1;
  function update(g, t, night) {
    group.updateMatrixWorld();
    // arrival: tail-first descent on a burn that eases to the ground, dust billows at touchdown and settles, engines cut a beat later
    let fireI = 0;
    for (let i = 0; i < LAND.length; i++) {
      const x = sites.land[i][0], z = sites.land[i][1];
      const g0 = LAND[i][0], g1 = LAND[i][1], e = cl01((g - g0) / (g1 - g0)), y = DROP * Math.pow(1 - e, 2.2), here = g >= g0;
      mtx.compose(v.set(x, here ? y : -999, z), yaw[i], one); landSteel.setMatrixAt(i, mtx); landDark.setMatrixAt(i, mtx);
      const burn = here ? 1 - sst(g1, g1 + 0.012, g) : 0, flick = 0.88 + 0.12 * noise(t * 19 + i * 7), P = plumes[i], near = 1 - sst(0, 10, y);
      const len = (14 + 26 * sst(0, 120, y) + 10 * near) * burn * flick;
      P.m.visible = P.s.visible = burn > 0.01;
      P.m.position.set(x, y + 1.2, z); P.m.quaternion.identity(); P.m.scale.set(3.4 + 2.6 * near, Math.max(0.01, Math.min(len, y + 6)), 3.4 + 2.6 * near);
      const U = P.m.material.uniforms; U.uI.value = burn; U.uT.value = t + i * 3; U.uN.value = 4; U.uD.value = 0.7 * burn; U.uH.value = 10; U.uLen.value = len; U.uK.value.copy(LK[1]);
      P.s.position.set(x, y + 0.5, z); P.s.scale.setScalar(26 * burn * flick); P.s.material.opacity = burn * 0.9;
      // ground: the exhaust fans out under the engines as the ship comes down, a short flash at touchdown
      const flash = Math.exp(-Math.pow((g - g1) / 0.0035, 2)), gl = landGlow[i], gu = gl.material.uniforms;
      gu.uI.value = burn * sst(140, 0, y) * 0.8 * flick + flash * 1.4; gu.uT.value = t; gl.scale.setScalar(26 + 30 * flash + 10 * near); gl.visible = gu.uI.value > 0.003;
      const ph = cl01((g - (g1 - 0.022)) / 0.09);
      dU.uE.value[i].set(ph > 0 && ph < 1 ? 8 + 78 * Math.pow(ph, 0.5) : 0, 24 * Math.pow(ph, 0.6) * (1 - 0.65 * sst(0.45, 1, ph)), 0.34 * sst(0, 0.06, ph) * Math.pow(1 - ph, 1.2), burn * near);
      const fl = flares[i + 1]; fl.pos.set(x, y + 0.5, z).applyMatrix4(group.matrixWorld); fl.i = burn * flick;
      if (burn * flick > fireI) { fireI = burn * flick; fireP.set(x, y - 3, z); }
    }
    landSteel.instanceMatrix.needsUpdate = landDark.instanceMatrix.needsUpdate = true;
    for (let i = 0; i < steels.length; i++) steels[i].envMapIntensity = steels[i].userData.env * (1 - 0.9 * night); // the env map is a golden-hour capture (as habitat.js ENV_NIGHT)
    dU.uNight.value = cU.uNight.value = bU.uNight.value = night; dU.uT.value = sU.uT.value = bU.uT.value = t;
    dust.visible = dU.uE.value[0].z > 0.002 || dU.uE.value[1].z > 0.002;

    // launch: hold-down chug at ignition, then a climb with real acceleration that pitches downrange (a gravity turn)
    const tau = Math.max(0, g - T.lift), y = climbY(tau, T), ig = sst(T.ignite, T.ignite + 0.006, g);
    const chug = g < T.lift ? (0.5 + 0.5 * noise(t * 23)) * (0.35 + 0.65 * sst(T.lift - 0.014, T.lift, g)) : 1;
    const burn = ig * chug, flick = 0.9 + 0.1 * noise(t * 31 + 3);
    shipP.set(bx, y, bz).addScaledVector(DR, T.drift * y * y); shipQ.setFromAxisAngle(tiltAx, Math.atan(2 * T.drift * y));
    axis.copy(up).applyQuaternion(shipQ);
    launch.y = y; launch.tau = tau; launch.ignite = ig; launch.burn = burn;
    toWorld(launch.base, shipP); toWorld(launch.pos, tmp.copy(axis).multiplyScalar(26).add(shipP)); toWorld(launch.top, tmp.copy(axis).multiplyScalar(52).add(shipP));
    const lowF = Math.exp(-y / 140), fx = launch.fx, lift = sst(T.lift - 0.004, T.lift + 0.01, g);
    fx.flash = 0.55 * Math.exp(-Math.pow((g - T.lift) / 0.006, 2)) + (g < T.lift ? 0.12 * burn : 0); fx.heat = 0.6 * burn * lowF; fx.bloom = 0.35 * burn * lowF;
    launch.shake = ig * (0.45 + 0.55 * lift) * Math.exp(-y / 260) * (0.75 + 0.25 * chug);
    launch.exp = burn * (0.6 + 0.4 * lift) * Math.exp(-y / 500);
    const on = burn > 0.004;
    LC.m.visible = LC.s.visible = LB.visible = LE.visible = on;
    if (on) {
      const hi = 1 + y / 600, hiC = 1 + y / 2500; // the plume balloons as the air thins; the core much less
      const L = (22 + 46 * lift) * hi * flick * (0.55 + 0.45 * chug), Lc = Math.min(L, y + 10 + 6 * (1 - lift)); // never through the pad
      noz.copy(shipP).addScaledVector(axis, 0.4);
      let U = layer(LC.m, 0, t, 2.3 * hiC, Math.min(L * 0.4, Lc), burn * 1.3); U.uN.value = 6; U.uD.value = burn; U.uH.value = 30;
      U = layer(LB, 1, t, 5 * hi, Lc, 0.5 * burn); U.uD.value = 0; U.uH.value = 0;
      U = layer(LE, 2, t, 10 * hi * (0.65 + 0.35 * lift), Lc * 1.4, 0.14 * burn); U.uD.value = 0; U.uH.value = 0;
      LC.s.position.copy(noz).addScaledVector(axis, -3); LC.s.scale.setScalar((18 + 18 * lift) * hiC * burn * flick); LC.s.material.opacity = Math.min(1, burn * 1.1);
    }
    if (fire) { const li = 7e4 * burn * flick, ll = 1.2e4 * fireI; if (li > ll) { fire.position.copy(shipP); fire.position.y -= 6; fire.intensity = li; } else { fire.position.copy(fireP); fire.intensity = ll; } }
    const fl0 = flares[0]; toWorld(fl0.pos, LC.s.position); fl0.i = on ? burn * flick : 0;
    // the exhaust hits the pad while the ship is low, then lifts off it
    const su = padSplash.material.uniforms; su.uI.value = burn * flick * Math.exp(-y / 45) * 1.4; su.uT.value = t;
    padSplash.scale.setScalar(18 + 34 * sst(0, 50, y)); padSplash.visible = su.uI.value > 0.003;
    // the cloud: age from ignition, lit by the engines (warm, strongest while they sit on the pad)
    bU.uAge.value = g >= T.ignite ? g - T.ignite : -1; cloud.visible = g >= T.ignite;
    bU.uFire.value.copy(shipP).addScaledVector(axis, -5); bU.uFireI.value = 1.8 * burn * flick * (0.3 + 0.7 * Math.exp(-y / 120));
    cU.uTau.value = g >= T.lift ? tau : -1; cU.uBurn.value = burn; cU.uShip.value.copy(shipP); column.visible = g > T.lift;
    // the plume takes over the shadow light while it is low: long shadows thrown away from the pad, flickering with the burn
    launch.light.pos.copy(shipP).addScaledVector(axis, -6); launch.light.k = burn * (1 - sst(150, 1400, y)); launch.light.i = burn * flick;

    // crane slews the band over while it is in the air, drifts before the first lift
    crane(g);
    jib.rotation.y = toShip + SLEW * (1 - cs.s) + (g < T.lifts[0] ? 0.3 * Math.sin(g * 40 + t * 0.12) : 0);
    // weld: arcs on the seam the last band landed on, until the next lift
    let weld = 0, seam = 0;
    for (let i = 1; i < T.lifts.length; i++) { const e = T.lifts[i] + T.liftLen, nx = i < T.lifts.length - 1 ? T.lifts[i + 1] : e + 0.03; if (g > e - 0.006 && g < nx) { weld = sst(e - 0.006, e, g) * (1 - sst(nx - 0.004, nx, g)); seam = BANDS[i]; } }
    sU.uOn.value = weld * (0.35 + 0.65 * night); sU.uY.value = seam; sparks.visible = weld > 0.01;
    lU.uOn.value = sst(T.pad, T.pad + 0.03, g) * (0.25 + 0.75 * night); // pad lights stay on through the launch
    if (Math.abs(g - lastG) < 1e-6) return; lastG = g;
    pad.scale.set(1, Math.max(0.001, eo((g - T.pad) / 0.03)), 1); pad.visible = g > T.pad;
    scorch.visible = g > T.lift; scorch.material.opacity = 0.75 * sst(T.lift, T.lift + 0.03, g);
    const tk = eo((g - T.tower[0]) / (T.tower[1] - T.tower[0])); tower.scale.set(1, Math.max(0.001, tk), 1); tower.visible = tk > 0; jib.visible = tk >= 1;
    // stack: bands up to the last landed one; the band in the air rides the hook
    let top = BANDS[0];
    for (let i = 0; i < T.lifts.length; i++) if (g >= T.lifts[i] + T.liftLen) top = BANDS[i + 1];
    const cut = top + (top > 0 ? 0.001 : -10); // the first band includes the legs below y 0
    stackS.userData.U.value.set(-10, cut); stackS.visible = top > 0;
    const k = cs.k;
    if (k >= 0) {
      const c = cs.c, clear = top + 7 - BANDS[k]; // band bottom 7 m over the stack while it swings
      const off = c < 0.3 ? -BANDS[k] + (clear + BANDS[k]) * sst(0, 0.3, c) : c < 0.7 ? clear : clear * (1 - sst(0.7, 1, c));
      const a = toShip + SLEW * (1 - cs.s), sway = 0.35 * Math.sin(t * 1.1) * sst(0.25, 0.4, c) * (1 - sst(0.8, 1, c));
      liftS.userData.U.value.set(k ? BANDS[k] : -10, BANDS[k + 1]); liftS.position.set(tx + Math.cos(a) * reach + sway, off, tz - Math.sin(a) * reach);
      cable.visible = true; cable.scale.y = Math.max(0.1, TH + 0.5 - (BANDS[k + 1] + off) - 0.6);
    } else { cable.visible = jib.visible; cable.scale.y = 18; }
    liftS.visible = k >= 0;
    const fk = sst(T.flaps[0], T.flaps[1], g); flapM.visible = fk > 0; flapM.scale.set(0.6 + 0.4 * fk, 1, 0.6 + 0.4 * fk);
    const drop = sst(T.scaf[0], T.scaf[1], g);
    scaf.visible = g > T.lifts[0] && drop < 1; scaf.scale.set(1, Math.max(0.001, Math.min(1, (top + 5) / 52) * (1 - drop)), 1);
    // the stacked ship rides the launch transform
    rides[0] = stackS; rides[1] = flapM;
    for (let i = 0; i < 2; i++) { rides[i].position.copy(shipP); rides[i].quaternion.copy(shipQ); }
  }
  // governor: share of the launch particles drawn (uniforms only, no recompile)
  const setKeep = k => { bU.uKeep.value = cU.uKeep.value = Math.max(0.2, Math.min(1, k)); };
  return { update, group, launch, flares, T, FLARE_LAYER, setKeep };
}
