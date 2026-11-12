// sky.js: real star catalog (HYG v4.1, mag <= 6.8) + Gaia Milky Way panorama, drawn at "infinity".
// Usage: const sky = await createSky({ THREE, scene, assetBase }); each frame: sky.update(camera.position)
//
// Frame conventions: stars.bin holds equatorial unit vectors stored in three.js axes
// (+Y = north celestial pole, +X = RA 0h, -Z = RA 6h). The Milky Way panorama is in galactic
// coordinates (l = 0 at image centre, l increasing to the left, b = +90 at the top); the shader
// converts a direction in the equatorial frame to (l, b). The whole sky is then rotated by
// `rotation` so the band lands where the shot wants it.

const R_SKY = 7000;

// Direction of the sun used by the opening shot (must match toSun in d5.current.js).
const TO_SUN = [-1, 0.22, -0.55];

// J2000 galactic frame expressed in the equatorial three.js axes (x, z, -y of the usual equatorial xyz).
function eq(raDeg, decDeg, V) {
  const ra = (raDeg * Math.PI) / 180, de = (decDeg * Math.PI) / 180;
  return new V(Math.cos(de) * Math.cos(ra), Math.sin(de), -Math.cos(de) * Math.sin(ra));
}

// Build the quaternion that carries the galactic frame onto a chosen world frame.
// gc: world direction of the galactic centre, n: world direction of the north galactic pole.
export function skyQuaternion(THREE, gc, n) {
  const V = THREE.Vector3;
  const Gc = eq(266.40499, -28.93617, V), Ngp = eq(192.85948, 27.12825, V);
  const Gy = new V().crossVectors(Ngp, Gc); // completes the right-handed (Gc, Gy, Ngp) triad
  const gcW = gc.clone().normalize(), nW = n.clone().sub(gcW.clone().multiplyScalar(n.dot(gcW))).normalize();
  const yW = new V().crossVectors(nW, gcW);
  const E = new THREE.Matrix4().makeBasis(Gc, Gy, Ngp), W = new THREE.Matrix4().makeBasis(gcW, yW, nW);
  const Rm = W.multiply(E.transpose()); // R = W * E^T
  return new THREE.Quaternion().setFromRotationMatrix(Rm);
}

// Default orientation for the opening shot: camera looks along toSun with the "up" of the d5 path.
// The galactic plane is tilted 30 degrees on screen and the bright core sits right of centre.
function defaultQuaternion(THREE) {
  const V = THREE.Vector3;
  const f = new V(...TO_SUN).normalize();
  const up = new V(0, 1, 0).addScaledVector(f, -f.y).normalize();
  const r = new V().crossVectors(f, up).normalize();
  const tilt = (30 * Math.PI) / 180, core = (72 * Math.PI) / 180;
  const t = r.clone().multiplyScalar(Math.cos(tilt)).addScaledVector(up, Math.sin(tilt)); // band direction on screen
  const nrm = new V().crossVectors(f, t).normalize(); // plane normal (pole side)
  const gc = f.clone().multiplyScalar(Math.cos(core)).addScaledVector(t, Math.sin(core));
  return skyQuaternion(THREE, gc, nrm);
}

// Blackbody colour from B-V (Ballesteros 2012) then Tanner Helland's Planckian approximation, all in GLSL.
const STAR_VERT = /* glsl */ `
attribute float aMag; attribute float aBV;
uniform float uPx; uniform float uGain;
varying vec3 vCol; varying float vI;
vec3 bb(float T){ // T in kelvin, returns sRGB 0..1
  float t = clamp(T, 1500., 15000.) / 100.;
  float r = t <= 66. ? 1. : clamp(1.292936 * pow(t - 60., -0.1332047), 0., 1.);
  float g = t <= 66. ? clamp(0.390082 * log(t) - 0.631841, 0., 1.) : clamp(1.129891 * pow(t - 60., -0.0755148), 0., 1.);
  float b = t >= 66. ? 1. : (t <= 19. ? 0. : clamp(0.543207 * log(t - 10.) - 1.196254, 0., 1.));
  return vec3(r, g, b);
}
void main(){
  float bv = clamp(aBV, -0.4, 2.0);
  float T = 4600. * (1. / (0.92 * bv + 1.7) + 1. / (0.92 * bv + 0.62));
  vec3 c = bb(T);
  c = mix(vec3(dot(c, vec3(0.299, 0.587, 0.114))), c, 0.72); // subtle saturation, like a real exposure
  c = pow(c, vec3(2.2));                                    // to linear
  c /= max(max(c.r, max(c.g, c.b)), 1e-3);
  // brightness: compressed magnitude scale so faint stars stay dim but visible, bright ones bloom
  float I = 0.42 * pow(10., -0.4 * 0.62 * (aMag - 6.8));
  vI = clamp(I, 0., 5.);
  vCol = c;
  // size: faint = 1px, brightest few hundred (mag < ~3.5) clearly bigger
  float s = 1. + 4.2 * pow(clamp((5.2 - aMag) / 6.6, 0., 1.), 1.5);
  gl_PointSize = s * uPx;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
}`;
const STAR_FRAG = /* glsl */ `
uniform float uGain; varying vec3 vCol; varying float vI;
void main(){
  float d = length(gl_PointCoord - 0.5) * 2.;
  float core = 1. - smoothstep(0., 1., d);     // round falloff (same curve as before, written with ordered edges)
  float a = core * core;
  if (a < 0.003) discard;
  gl_FragColor = vec4(vCol * vI * a * uGain, 1.);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

const MW_VERT = /* glsl */ `varying vec3 vDir; void main(){ vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`;
const MW_FRAG = /* glsl */ `
uniform sampler2D map; uniform vec3 gc; uniform vec3 gy; uniform vec3 ngp; uniform float uInt; uniform float uSat; uniform vec2 uTexel;
varying vec3 vDir;
void main(){
  vec3 d = normalize(vDir);                         // equatorial direction (sphere is in sky-local space)
  float l = atan(dot(d, gy), dot(d, gc));            // galactic longitude
  float b = asin(clamp(dot(d, ngp), -1., 1.));       // galactic latitude
  vec2 uv = vec2(0.5 - l / 6.28318530718, 0.5 + b / 3.14159265359);
  // 5-tap soften (the panorama is magnified ~2x at 1440px wide); sampler decodes sRGB to linear
  vec2 e = uTexel * 1.2;
  vec3 c = (texture2D(map, uv).rgb * 2. + texture2D(map, uv + vec2(e.x, 0.)).rgb + texture2D(map, uv - vec2(e.x, 0.)).rgb
          + texture2D(map, uv + vec2(0., e.y)).rgb + texture2D(map, uv - vec2(0., e.y)).rgb) / 6.;
  float y = dot(c, vec3(0.2126, 0.7152, 0.0722));
  c = mix(vec3(y), c, uSat);                         // slightly desaturated
  c = pow(c, vec3(1.15)) * uInt;                     // gentle toe so the dark sky stays dark
  gl_FragColor = vec4(c, 1.);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

// cine (D6.1): stars become >= 2 px gaussians with their flux kept (sub-pixel points shimmer as the camera moves), a faint layer of
// unresolved stars thickens toward the galactic plane (depth in the field), and the Milky Way band comes up a little.
const CINE_STAR_VERT = STAR_VERT.replace('gl_PointSize = s * uPx;', 'float ps = s * uPx, pw = max(ps, 2.2); vI *= (ps * ps) / (pw * pw) * 1.25; gl_PointSize = pw;');
const CINE_STAR_FRAG = STAR_FRAG.replace('float core = 1. - smoothstep(0., 1., d);     // round falloff (same curve as before, written with ordered edges)\n  float a = core * core;', 'float a = exp(-d * d * 4.5);');
const HAZE_VERT = /* glsl */ `
attribute float aI; uniform float uPx; varying float vI;
void main(){ vI = aI; gl_PointSize = 2.0 * uPx; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`;
const HAZE_FRAG = /* glsl */ `
varying float vI;
void main(){ float d = length(gl_PointCoord - 0.5) * 2.; float a = exp(-d * d * 3.); if (a < 0.01) discard;
  gl_FragColor = vec4(vec3(1., 0.93, 0.86) * vI * a, 1.);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

export async function createSky({
  THREE, scene, starsUrl, milkyUrl,
  rotation = null,          // THREE.Quaternion, THREE.Euler, or [x, y, z] radians; null = opening-shot default
  milkyWay = true,          // set false to skip the panorama
  milkyWayIntensity = 0.30, // linear gain on the panorama
  starGain = 1.0,           // global star brightness
  pixelRatio = null,        // defaults to min(devicePixelRatio, 2)
} = {}) {
  const CINE = true; // cinematic stars are the only look
  milkyWayIntensity *= 1.7;
  const V = THREE.Vector3;
  const group = new THREE.Group(); group.name = 'sky'; group.frustumCulled = false;
  if (rotation && rotation.isQuaternion) group.quaternion.copy(rotation);
  else if (rotation && rotation.isEuler) group.setRotationFromEuler(rotation);
  else if (Array.isArray(rotation)) group.rotation.set(rotation[0], rotation[1], rotation[2]);
  else group.quaternion.copy(defaultQuaternion(THREE));

  // ---- stars ----
  const buf = await (await fetch(starsUrl)).arrayBuffer();
  const f = new Float32Array(buf), n = f.length / 5;
  const pos = new Float32Array(n * 3), mag = new Float32Array(n), bv = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    pos[i * 3] = f[i * 5] * R_SKY; pos[i * 3 + 1] = f[i * 5 + 1] * R_SKY; pos[i * 3 + 2] = f[i * 5 + 2] * R_SKY;
    mag[i] = f[i * 5 + 3]; bv[i] = f[i * 5 + 4];
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('aMag', new THREE.BufferAttribute(mag, 1));
  g.setAttribute('aBV', new THREE.BufferAttribute(bv, 1));
  const starMat = new THREE.ShaderMaterial({
    vertexShader: CINE ? CINE_STAR_VERT : STAR_VERT, fragmentShader: CINE ? CINE_STAR_FRAG : STAR_FRAG,
    uniforms: { uPx: { value: pixelRatio || Math.min(window.devicePixelRatio || 1, 2) }, uGain: { value: starGain } },
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: true, fog: false,
  });
  const stars = new THREE.Points(g, starMat);
  stars.frustumCulled = false; stars.renderOrder = -9; stars.name = 'sky-stars';
  group.add(stars);

  // ---- cine: unresolved star haze, denser toward the galactic plane ----
  if (CINE) {
    const Ngp = eq(192.85948, 27.12825, V), N = 26000, hp = new Float32Array(N * 3), hi = new Float32Array(N), v = new V();
    let seed = 99; const rr = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0, k = 0; i < N; k++) {
      v.set(rr() * 2 - 1, rr() * 2 - 1, rr() * 2 - 1); const l = v.length(); if (l > 1 || l < 0.05) continue; v.divideScalar(l);
      const b = Math.abs(v.dot(Ngp)); if (rr() > 0.12 + 0.88 * Math.exp(-b * b / 0.02)) continue; // galactic latitude falloff
      hp[i * 3] = v.x * R_SKY * 0.995; hp[i * 3 + 1] = v.y * R_SKY * 0.995; hp[i * 3 + 2] = v.z * R_SKY * 0.995;
      hi[i] = 0.035 + 0.11 * Math.pow(rr(), 3); i++;
    }
    const hg = new THREE.BufferGeometry(); hg.setAttribute('position', new THREE.BufferAttribute(hp, 3)); hg.setAttribute('aI', new THREE.BufferAttribute(hi, 1));
    const haze = new THREE.Points(hg, new THREE.ShaderMaterial({ vertexShader: HAZE_VERT, fragmentShader: HAZE_FRAG,
      uniforms: { uPx: starMat.uniforms.uPx }, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: true, fog: false }));
    haze.frustumCulled = false; haze.renderOrder = -9; haze.name = 'sky-starhaze'; group.add(haze);
  }

  // ---- Milky Way ----
  let mw = null;
  if (milkyWay) {
    const tex = await new Promise((res, rej) => new THREE.TextureLoader().load(milkyUrl, res, undefined, rej)).catch(() => null);
    if (tex) {
      tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4; tex.wrapS = THREE.RepeatWrapping;
      const Ngp = eq(192.85948, 27.12825, V), Gc = eq(266.40499, -28.93617, V), Gy = new V().crossVectors(Ngp, Gc);
      const mat = new THREE.ShaderMaterial({
        vertexShader: MW_VERT, fragmentShader: MW_FRAG, side: THREE.BackSide,
        uniforms: { map: { value: tex }, gc: { value: Gc }, gy: { value: Gy }, ngp: { value: Ngp }, uInt: { value: milkyWayIntensity }, uSat: { value: 0.8 }, uTexel: { value: new THREE.Vector2(1 / tex.image.width, 1 / tex.image.height) } },
        depthWrite: false, depthTest: false, fog: false,
      });
      mw = new THREE.Mesh(new THREE.SphereGeometry(R_SKY * 0.99, 64, 32), mat);
      mw.frustumCulled = false; mw.renderOrder = -10; mw.name = 'sky-milkyway';
      group.add(mw);
    }
  }

  scene.add(group);
  // the group rides the camera so everything stays at infinity
  const update = (camPos) => { group.position.copy(camPos); };
  return { group, stars, milkyWay: mw, update, starCount: n, starMaterial: starMat };
}

// =============================================================================================
// D6.1 cine: Mars air. Shared sky model + Jezero far ground + the entry veil. Nothing here runs unless createMarsAir() is called
// (planets.js does that only for look 'lit' + cine). All output is linear HDR into the composer, like everything else.
// =============================================================================================

// Mars sky, physically motivated: dust (not gas) scatters, so the day sky is butterscotch, brightest low down; the forward lobe round
// the sun is whiter, with a tight BLUE aureole (fine dust scatters blue into small angles) that carries the sky at dusk; the antisolar
// side dies first; twilight is long (dust high in the column). k: amount of air above the viewer (0 space .. 1 surface).
export const MARS_SKY_GLSL = /* glsl */ `
vec3 marsSky(vec3 d, vec3 s, float k){
  float se = s.y, ca = dot(d, s), h = max(d.y, 0.), fw = max(ca, 0.);
  float day = smoothstep(-0.10, 0.12, se), twi = smoothstep(-0.32, 0.0, se);
  vec3 zen = vec3(0.34, 0.205, 0.13), hor = vec3(0.90, 0.62, 0.40);
  vec3 c = mix(hor, zen, smoothstep(0., 1., pow(h, 0.42)));
  c *= 0.68 + 0.55 * pow(fw, 4.) + 0.4 * pow(fw, 30.);                         // broad dusty forward lobe
  c *= mix(0.38 + 0.62 * smoothstep(-0.7, 0.7, ca), 1., smoothstep(0.08, 0.45, se)); // low sun: the far side of the sky goes first
  c *= mix(0.11 * twi, 1., day);
  c *= 0.75 + 0.25 * smoothstep(-0.3, 0.6, se);
  float aur = pow(fw, 90.) * 2.2 + pow(fw, 16.) * 0.45 + pow(fw, 5.) * 0.08;    // blue aureole
  c += vec3(0.30, 0.50, 0.98) * aur * twi * mix(0.95, 0.30, day) * (1. - 0.5 * smoothstep(0.3, 0.9, h));
  c += vec3(0.0022, 0.0028, 0.0055);                                             // night: deep blue black
  c *= mix(pow(k, 2.6), pow(k, 0.6), exp(-h * 7.));                              // thin air: zenith goes black first, a limb band hangs on
  return c;
}
float marsSunDisc(vec3 d, vec3 s){ return smoothstep(0.999992, 0.999996, dot(d, s)) + 0.04 * pow(max(dot(d, s), 0.), 3000.); }
`;

const AIR_NOISE = /* glsl */ `
float ah(vec2 p){ p = fract(p * vec2(443.897, 441.423)); p += dot(p, p.yx + 19.19); return fract((p.x + p.y) * p.x); }
float ah3(vec3 p){ p = fract(p * 0.3183099 + .1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float an(vec2 x){ vec2 i = floor(x), f = fract(x); f = f * f * (3. - 2. * f);
  return mix(mix(ah(i), ah(i + vec2(1, 0)), f.x), mix(ah(i + vec2(0, 1)), ah(i + vec2(1, 1)), f.x), f.y); }
// fbm with each octave faded to its mean as it nears the pixel footprint (fw = footprint in units of the base octave): no shimmer
float afbm(vec2 p, float fw){ float v = 0., a = .5; for (int i = 0; i < 5; i++){ float k = 1. - smoothstep(.25, .6, fw); v += a * mix(.5, an(p), k); p = p * 2.03 + 17.1; fw *= 2.03; a *= .5; } return v; }
`;

// Jezero from altitude, procedural (no download): 45 km crater (degraded, uneven rim, Neretva breach in the west), the western delta
// fan with its lobate front ending 2 km west of the colony, the inlet valley, small craters, dark floor sands. Metres, x east, z south,
// origin = the colony, height 0 = the colony's ground.
const JEZERO_GLSL = /* glsl */ `
const vec2 JC = vec2(6000., 6500.); const float JR = 22500.;
const vec2 JA = vec2(-14900., -1600.); const vec2 JAX = vec2(0.992, 0.123);   // delta apex at the inlet, fan axis toward the colony
float rimCrest(float az){ return 640. + 160. * sin(az * 3. + 1.) + 90. * sin(az * 7. + 2.3) - 520. * exp(-((az + 2.77) / 0.09) * ((az + 2.77) / 0.09)); }
float jezH(vec2 p, float fw, out vec3 alb){
  vec2 q = p - JC; float r = length(q) / JR, az = atan(q.y, q.x);
  float n1 = afbm(p / 7000., fw / 7000.), n2 = afbm(p / 900. + 3., fw / 900.);
  float rn = r + (n1 - 0.5) * 0.10;
  float crest = rimCrest(az);
  float h = rn < 1. ? mix(0., crest, pow(smoothstep(0.80, 1.0, rn), 1.6)) : crest * exp(-(rn - 1.) * 4.5) + 380. * (1. - exp(-(rn - 1.) * 4.5));
  // delta fan
  vec2 v = p - JA; float dA = length(v) / 13000., ph = atan(v.x * JAX.y - v.y * JAX.x, dot(v, JAX));
  float edge = 1. + (afbm(vec2(ph * 5., 2.), 0.) - 0.5) * 0.35 - 0.3 * (ph / 0.95) * (ph / 0.95);
  float fan = (1. - smoothstep(edge - 0.04, edge, dA)) * (1. - smoothstep(0.8, 1.1, abs(ph)));
  float fingers = (0.5 + 0.5 * sin(ph * 17. + n1 * 14. + n2 * 3.)) * smoothstep(0.2, 0.7, dA);
  h += fan * (95. * (1. - pow(dA, 1.8)) + 18. * fingers);
  // inlet valley, west of the apex
  float vx = p.x - JA.x, vz = JA.y + 1700. * sin(vx / 4200.) + 600. * sin(vx / 1300.);
  h -= (1. - smoothstep(350., 900., abs(p.y - vz))) * smoothstep(400., -2500., vx) * 140.;
  // small craters (two sizes)
  for (int s = 0; s < 2; s++){
    float sc = s == 0 ? 2600. : 650.; vec2 g = p / sc, gi = floor(g), gf = fract(g);
    for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++){
      vec2 o = vec2(i, j), rn2 = vec2(ah(gi + o), ah(gi + o + 7.3));
      float rad = 0.08 + 0.22 * pow(ah(gi + o + 3.1), 2.), on = step(s == 0 ? 0.82 : 0.7, ah(gi + o + 11.7));
      float d = length(o + rn2 * 0.6 + 0.2 - gf) / rad;
      h += on * sc * rad * 0.07 * ((d < 1. ? (d * d - 1.) : 0.) + 0.25 * exp(-((d - 1.) / 0.18) * ((d - 1.) / 0.18))) * (1. - smoothstep(0.3, 0.9, fw / sc * 4.));
    }
  }
  // colour: plains butterscotch fines, darker crater floor + dark sand, pale layered delta, bright bedrock on the rim
  vec3 fines = vec3(.62, .38, .22), floorC = vec3(.40, .27, .19), sand = vec3(.17, .12, .10), deltaC = vec3(.70, .50, .34), bed = vec3(.68, .52, .40);
  alb = rn < 0.97 ? floorC : fines;
  alb = mix(alb, fines, smoothstep(0.84, 1.0, rn) * 0.7);
  alb = mix(alb, sand, smoothstep(0.58, 0.78, afbm(p / 2300. + 9., fw / 2300.)) * 0.7 * (1. - fan));
  alb = mix(alb, deltaC * (0.85 + 0.3 * fingers), fan * 0.85);
  alb = mix(alb, bed, smoothstep(0.88, 1.0, rn) * (1. - smoothstep(1.0, 1.08, rn)) * 0.55);
  alb *= 0.82 + 0.36 * n2;
  return h;
}`;

const DOME_VERT = /* glsl */ `varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`;
const DOME_FRAG = /* glsl */ `
uniform vec3 uSun, uOrigin; uniform float uK, uNight, uT, uAmb;
varying vec3 vW;
${AIR_NOISE}
${MARS_SKY_GLSL}
${JEZERO_GLSL}
const float RM = 3389500.;
vec3 sunCol(float se){ float am = 1. / (max(se, 0.) + 0.06); return exp(-vec3(0.05, 0.085, 0.15) * am * 1.6) * smoothstep(-0.04, 0.05, se); }
// aerial perspective: dust scale height ~11 km, ~30 km visibility on the floor
vec2 aerial(float h0, float h1, float dist){ float H = 11000., b = 1. / 26000.; float a = exp(-max(h0, 0.) / H), c = exp(-max(h1, 0.) / H);
  float od = abs(h1 - h0) > 1. ? b * H * abs(a - c) * dist / abs(h1 - h0) : b * a * dist; return vec2(exp(-od), od); }
void main(){
  vec3 ro = cameraPosition - uOrigin, rd = normalize(vW - cameraPosition), S = normalize(uSun);
  vec3 sky = marsSky(rd, S, uK);
  // stars: one candidate per cell of a 3D grid on the unit sphere, drawn as a ~1.3 px gaussian (no sub-pixel shimmer)
  float px = max(length(fwidth(rd)), 1e-5);
  float vis = (1. - smoothstep(0.0, 0.25, dot(sky, vec3(.3, .55, .15)) * 40.));
  if (vis > 0.) { vec3 g = rd * 180., gi = floor(g); float hs = ah3(gi);
    if (hs > 0.8) { vec3 sp = (gi + 0.2 + 0.6 * vec3(ah3(gi + 1.7), ah3(gi + 3.1), ah3(gi + 5.3))) / 180.;
      float d = length(normalize(sp) - rd) / (px * 1.3), m = pow((hs - 0.8) / 0.2, 6.);
      sky += vec3(1., 0.95, 0.88) * exp(-d * d) * (0.03 + 2.4 * m) * vis; } }
  sky += vec3(1.0, 0.95, 0.86) * 60. * marsSunDisc(rd, S) * sunCol(S.y) * (1. - uNight * 0.6);
  vec3 col = sky;
  // ground: the planet sphere under the colony (true horizon dip), and the crater rim as a silhouette where it stands above the ray
  vec3 c0 = vec3(0., -RM, 0.), oc = ro - c0; float b = dot(oc, rd), disc = b * b - (dot(oc, oc) - RM * RM);
  float tg = disc > 0. ? -b - sqrt(disc) : -1.;
  vec2 rh = rd.xz / max(length(rd.xz), 1e-4); vec2 qo = ro.xz - JC;
  float bb = dot(qo, rh), cc = dot(qo, qo) - JR * JR, dd = bb * bb - cc;
  float dr = dd > 0. ? -bb + sqrt(dd) : -1.;                       // far crossing of the rim circle (we are inside the crater)
  float hit = 0.; vec3 gc = vec3(0.); float dist = 0., hgt = 0.;
  if (dr > 0.) {
    vec2 pc = ro.xz + rh * dr; float az = atan(pc.y - JC.y, pc.x - JC.x);
    float crest = rimCrest(az) + (afbm(pc / 2500., 0.) - 0.5) * 220. - dr * dr / (2. * RM);
    float tanR = rd.y / max(length(rd.xz), 1e-4), tanC = (crest - ro.y) / dr;
    if (tanR < tanC && (tg < 0. || tg * length(rd.xz) > dr)) {      // the inner wall of the far rim
      hit = 1.; dist = dr / max(length(rd.xz), 1e-4); hgt = ro.y + rd.y * dist;
      vec3 n = normalize(vec3(-(pc.x - JC.x) / JR * 0.8, 1., -(pc.y - JC.y) / JR * 0.8));
      float sh = 0.75 + 0.5 * afbm(vec2(az * 60., hgt / 90.), 0.);
      gc = vec3(.62, .46, .34) * sh * (max(dot(n, S), 0.) * sunCol(S.y) * 2.0 + vec3(.95, .6, .36) * 0.25 * uAmb);
    }
  }
  if (hit < 0.5 && tg > 0.) {
    vec3 P = ro + rd * tg; dist = tg; hgt = 0.;
    float inner = 1. - smoothstep(4150., 4400., max(abs(P.x), abs(P.z)));  // under the colony's own 9 km terrain: never seen, shade it flat
    if (inner > 0.999) { gc = vec3(.5, .32, .2) * (max(S.y, 0.) * sunCol(S.y) * 2.0 + vec3(.95, .6, .36) * 0.25 * uAmb); hit = 1.; }
  }
  if (hit < 0.5 && tg > 0.) {
    vec3 P = ro + rd * tg; dist = tg; hgt = 0.;
    float fw = max(length(fwidth(P.xz)), 1.);
    vec3 alb; float e = max(fw * 0.7, 25.);
    vec3 ax; float hx = jezH(P.xz + vec2(e, 0.), fw, ax), hz = jezH(P.xz + vec2(0., e), fw, ax), h0 = jezH(P.xz, fw, alb);
    vec3 n = normalize(vec3(-(hx - h0) / e, 1., -(hz - h0) / e));
    float NL = max(dot(n, S), 0.);
    float self = smoothstep(-0.02, 0.06, dot(n, S) - 0.0);
    gc = alb * (NL * self * sunCol(S.y) * 2.0 + vec3(.95, .6, .36) * 0.25 * uAmb * (0.6 + 0.4 * n.y));
    hit = 1.;
  }
  if (hit > 0.5) {
    vec2 ae = aerial(ro.y, hgt, dist);
    vec3 hz = marsSky(normalize(vec3(rd.x, 0.02, rd.z)), S, uK);    // the haze takes the horizon colour in that direction
    col = gc * ae.x + hz * (1. - ae.x);
  }
  gl_FragColor = vec4(col, 1.);
}`;

const VEIL_VERT = /* glsl */ `varying vec2 vS; void main(){ vS = position.xy; gl_Position = vec4(position.xy, 0., 1.); }`;
const VEIL_FRAG = /* glsl */ `
uniform float uE, uT, uAsp, uFlow; uniform vec3 uSky, uLit; uniform vec2 uSunS;
varying vec2 vS;
${AIR_NOISE}
float fb(vec2 p){ return afbm(p, 0.); }
void main(){
  float e = uE; vec2 s = vS * vec2(uAsp, 1.); float r = length(s), ang = atan(s.y, s.x), lr = log(max(r, 1e-3));
  // ---- heat: glow builds at the frame edges; the plasma streaks are cut to a trace (they read as a warp jump), the lens pass shimmers
  float heat = smoothstep(0.03, 0.20, e) * (1. - smoothstep(0.31, 0.40, e));
  float edge = smoothstep(0.62, 1.55, r);
  float fl = 0.8 + 0.2 * an(vec2(uT * 9., 3.)) + 0.15 * an(vec2(ang * 3., uT * 4.));
  float str = pow(an(vec2(ang * 46. / 6.2832 * 6.2832, lr * 2.2 - uFlow * 9.)), 5.) + 0.6 * pow(an(vec2(ang * 120. / 6.2832 * 6.2832 + 40., lr * 3. - uFlow * 13.)), 8.);
  vec3 plasma = mix(vec3(1.0, 0.34, 0.12), vec3(1.0, 0.50, 0.38), edge);         // hot orange, pinker where it is thinnest
  float hk = heat * heat;
  vec3 add = plasma * fl * (edge * edge * 0.9 * heat + str * edge * edge * 0.1 * hk);
  add += vec3(1.0, 0.45, 0.2) * hk * 0.06 * (1. - smoothstep(0., 0.9, r));        // faint shock-layer glow ahead
  // ---- haze: dust layers we fall through (infinite zoom, layers flow outward), heaviest at the swap, then they part
  float cover = smoothstep(0.15, 0.27, e) * (1. - smoothstep(0.36, 0.66, e));
  float a = 0.; vec3 hc = vec3(0.);
  if (cover > 0.) {
    for (int i = 0; i < 3; i++) {
      float ph = fract(uFlow * 0.9 + float(i) / 3.), w = sin(3.14159 * ph);
      vec2 u = s / (0.3 + ph * 1.5) + vec2(float(i) * 7.1, float(i) * 3.3);
      float d = fb(u * 2.6) + 0.35 * (fb(u * 9.) - 0.5), thr = mix(0.36, 0.86, smoothstep(0.30, 0.62, e));   // holes open as we drop
      float m = smoothstep(thr - 0.10, thr + 0.12, d) * w;
      float lit = 0.5 + (fb(u * 2.6 + uSunS * 0.05) - fb(u * 2.6 - uSunS * 0.05)) * 9.;  // billows lit from the sun side, shaded away from it
      float dens = smoothstep(thr, thr + 0.35, d);
      hc += mix(uSky * 0.42, uLit, clamp(lit, 0., 1.)) * (1. - 0.35 * dens) * m; a += m;
    }
    hc = mix(uSky * 0.5, hc / max(a, 1e-3), clamp(a * 1.3, 0., 1.)); a = clamp(a * 0.85, 0., 1.);   // gaps between billows: deeper haze
    float full = smoothstep(0.24, 0.27, e) * (1. - smoothstep(0.33, 0.38, e));     // swap window: fully covered
    a = mix(a, 1., full) * cover;
  }
  vec3 col = hc * a + add * (1. - 0.5 * a);
  gl_FragColor = vec4(col, a);
}`;

// createMarsAir({ THREE, origin }): { dome, veil, entry(e, ctx), roots(), hemi(color), horizon(color), state }
// origin: the colony origin in world space (main.js COL). See d61/CINEMA-NOTES.md for the handshake.
export function createMarsAir({ THREE, origin = new THREE.Vector3(0, -6000, 0) } = {}) {
  const sm = THREE.MathUtils.smoothstep, cl = v => Math.min(1, Math.max(0, v));
  const domeU = { uSun: { value: new THREE.Vector3(-0.9, 0.33, -0.2).normalize() }, uOrigin: { value: origin.clone() }, uK: { value: 1 }, uNight: { value: 0 }, uT: { value: 0 }, uAmb: { value: 1 } };
  const dome = new THREE.Mesh(new THREE.SphereGeometry(6000, 64, 32), new THREE.ShaderMaterial({
    vertexShader: DOME_VERT, fragmentShader: DOME_FRAG, uniforms: domeU, side: THREE.BackSide, depthWrite: false, depthTest: false, fog: false }));
  dome.frustumCulled = false; dome.renderOrder = -20; dome.visible = false; dome.name = 'mars-air-dome';
  const veilU = { uE: { value: 0 }, uT: { value: 0 }, uAsp: { value: 1 }, uFlow: { value: 0 }, uSky: { value: new THREE.Color(0.9, 0.6, 0.38) }, uLit: { value: new THREE.Color(1.2, 0.8, 0.5) }, uSunS: { value: new THREE.Vector2(-1, 0.4) } };
  const vg = new THREE.BufferGeometry(); vg.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3));
  const veil = new THREE.Mesh(vg, new THREE.ShaderMaterial({ vertexShader: VEIL_VERT, fragmentShader: VEIL_FRAG, uniforms: veilU, transparent: true, depthWrite: false, depthTest: false, fog: false,
    blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor }));
  veil.frustumCulled = false; veil.renderOrder = 999; veil.visible = false; veil.name = 'mars-air-veil';
  // CPU copy of the sky model for fog / hemisphere colours (same constants as MARS_SKY_GLSL, horizon direction only)
  const tc = new THREE.Color();
  const skyAt = (out, dir, s, k) => {
    const se = s.y, ca = dir.x * s.x + dir.y * s.y + dir.z * s.z, h = Math.max(dir.y, 0), fw = Math.max(ca, 0);
    const day = sm(se, -0.10, 0.12), twi = sm(se, -0.32, 0), m = sm(Math.pow(h, 0.42), 0, 1);
    out.setRGB(0.90 + (0.34 - 0.90) * m, 0.62 + (0.205 - 0.62) * m, 0.40 + (0.13 - 0.40) * m);
    let f = 0.68 + 0.55 * fw ** 4 + 0.4 * fw ** 30;
    f *= 0.38 + 0.62 * sm(ca, -0.7, 0.7) + (1 - (0.38 + 0.62 * sm(ca, -0.7, 0.7))) * sm(se, 0.08, 0.45);
    f *= 0.11 * twi + (1 - 0.11 * twi) * day; f *= 0.75 + 0.25 * sm(se, -0.3, 0.6);
    out.multiplyScalar(f);
    const aur = (fw ** 90 * 2.2 + fw ** 16 * 0.45 + fw ** 5 * 0.08) * twi * (0.95 + (0.30 - 0.95) * day);
    out.r += 0.30 * aur + 0.0022; out.g += 0.50 * aur + 0.0028; out.b += 0.98 * aur + 0.0055;
    const kk = Math.pow(k, 2.6) + (Math.pow(k, 0.6) - Math.pow(k, 2.6)) * Math.exp(-h * 7); out.multiplyScalar(kk);
    return out;
  };
  const hv = new THREE.Vector3(), s2 = new THREE.Vector3(), cf = new THREE.Vector3();
  // horizon colour averaged round the compass (fog has one colour), weighted a little toward where the camera looks
  const horizon = (out, s = domeU.uSun.value, k = domeU.uK.value, fwd = null) => {
    out.setRGB(0, 0, 0); let wsum = 0;
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; hv.set(Math.cos(a), 0.03, Math.sin(a)).normalize(); const w = fwd ? 1 + Math.max(0, hv.x * fwd.x + hv.z * fwd.z) * 2 : 1;
      skyAt(tc, hv, s, k); out.r += tc.r * w; out.g += tc.g * w; out.b += tc.b * w; wsum += w; }
    return out.multiplyScalar(1 / wsum);
  };
  const hemi = (out) => { hv.set(0, 1, 0); skyAt(out, hv, domeU.uSun.value, 1); horizon(tc); return out.lerp(tc, 0.5); };
  const state = { e: 0, flow: 0, prevE: 0 };
  function entry(e, ctx = {}) {
    e = cl(e); const { inCol = false, cam = null, t = 0, dt = 0, alt = 0, fog = null, sunDir = null, night = 0 } = ctx;
    state.flow += (dt || 0) * 0.12 + Math.abs(e - state.prevE) * 4; state.prevE = e; state.e = e;  // layers flow with scroll, and drift a little with time
    veilU.uE.value = e; veilU.uT.value = t; veilU.uFlow.value = state.flow;
    if (cam) veilU.uAsp.value = cam.aspect || 1;
    veil.visible = e > 0.005 && e < 0.7;
    if (sunDir) domeU.uSun.value.copy(sunDir).normalize();
    domeU.uNight.value = night; domeU.uT.value = t;
    domeU.uK.value = inCol ? 0.35 + 0.65 * sm(e, 0.30, 0.52) : 0;
    domeU.uAmb.value = 1 - 0.85 * night;
    dome.visible = !!inCol;
    if (cam && inCol) { dome.position.copy(cam.position); dome.updateMatrixWorld(); }
    // veil colours follow the sky we are falling into; sun side in screen space for the haze lighting
    horizon(veilU.uSky.value, domeU.uSun.value, 1);
    veilU.uSky.value.lerp(tc.setRGB(0.55, 0.22, 0.12), 1 - sm(e, 0.22, 0.4));        // before the swap the haze is plasma-lit
    veilU.uLit.value.copy(veilU.uSky.value).multiplyScalar(1.9);
    if (cam) { s2.copy(domeU.uSun.value).transformDirection(cam.matrixWorldInverse); veilU.uSunS.value.set(s2.x, s2.y).normalize(); }
    if (fog && inCol) {
      if (cam) cam.getWorldDirection(cf);
      horizon(fog.color, domeU.uSun.value, domeU.uK.value, cam ? cf : null);
      const a = Math.max(0, alt);
      const clear = sm(e, 0.45, 1);                                       // haze by altitude, settling to the colony's own values
      fog.near = 500 + a * 1.5 * (1 - clear * 0.5); fog.far = Math.max(4200, (4200 + a * 6) * (0.55 + 0.45 * clear));
    }
  }
  const roots = () => [veil, dome];
  return { dome, veil, entry, roots, hemi, horizon, skyAt, state, uniforms: { dome: domeU, veil: veilU } };
}
