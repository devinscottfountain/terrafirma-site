// TerraFirma D6.1 footer: a Mars dusk horizon behind the logotype. The modeller's settlement (foot-model-*.js) under an
// analytic twilight sky (foot-glsl.js) that also bakes the PMREM environment and drives the aerial perspective.
// Scroll (setProgress) runs a sunrise: the glow climbs and brightens behind the ridge, the haze warms, the glass and
// steel catch it. At rest: slow glow breathing, drifting dust, a faint halo behind the logotype.
// Chain: scene (HDR, MSAA) -> aerial perspective -> Gaussian bloom (mip chain) -> ACES, grade, vignette, grain -> canvas.
// Boot: environment baked, every program compiled async against the target it draws into, ready = first frame;
// textures stream in after ready as plain map swaps.
import { SKY_VERT, SKY_FRAG, EQ_FRAG, FS_VERT, ATMOS_FRAG, PRE_FRAG, BLUR_FRAG, FINAL_FRAG } from './foot-glsl.js';

const MODEL = './foot-model.js';                     // modeller entry (exports buildFooterScene); placeholder until it loads
const EYE = [0, 1.7, 0];
const HORIZON = 0.3;                                 // horizon height in frame, from the top
const VFOV = 30, HFOV_MIN = 40;                      // landscape lens; narrow screens widen to keep the settlement in frame
const PORTRAIT = { hfov: 30, horizon: 0.36 };       // phones: tighter crop on the settlement, horizon a touch lower
const SUN_AZ = -0.1;                                 // rad, glow centred just right of the big dome (Figma)
const SUN_EL = [-7.5, -1.6];                         // deg, p 0 -> 1: always below the ridge
const ENV_STEP = 0.03, ENV_MS = 120;                 // environment rebake: p delta and min interval
const LOGO = { x: 0.5, y: 0.595, w: 0.85, h: 0.267 }; // logotype box in the host (Figma 22952:8961), fractions, y from top

const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const ease = p => p * p * (3 - 2 * p);
const yieldTask = () => new Promise(r => setTimeout(r, 0));
const idle = fn => (typeof requestIdleCallback === 'function' ? requestIdleCallback(fn, { timeout: 1500 }) : setTimeout(fn, 200));
function noise1(seed) { // smooth 1D value noise, -1..1
  const h = i => { const s = Math.sin(i * 127.1 + seed * 311.7) * 43758.5453; return (s - Math.floor(s)) * 2 - 1; };
  return t => { const i = Math.floor(t), f = t - i, u = f * f * (3 - 2 * f); return h(i) * (1 - u) + h(i + 1) * u; };
}

export function createFooter({ THREE, host, quality = 'high', base, canvas: cvIn } = {}) {
  const canvas = cvIn || document.createElement('canvas');
  if (!cvIn) { canvas.className = 'd61-footer-canvas'; Object.assign(canvas.style, { position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', display: 'block' }); host.appendChild(canvas); }
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, depth: false, stencil: false, powerPreference: 'high-performance' });
  try {
    return build({ THREE, host, quality, base, canvas, cvIn, renderer });
  } catch (e) {
    try { renderer.dispose(); renderer.forceContextLoss?.(); } catch (_) { /* gone */ }
    if (!cvIn) canvas.remove();
    throw e;
  }
}

function build({ THREE, host, quality, base, canvas, cvIn, renderer }) {
  const HIGH = quality !== 'low';
  const DEBUG = typeof location !== 'undefined' && /[?&]debug(=|&|$)/.test(location.search);
  const V3 = THREE.Vector3;
  const baseURL = String(base || new URL('./', import.meta.url).href).replace(/\/?$/, '/');
  renderer.debug.checkShaderErrors = DEBUG;
  const DPR = Math.min(typeof devicePixelRatio === 'number' && devicePixelRatio > 0 ? devicePixelRatio : 1, 2);
  const prMax = Math.min(DPR, HIGH ? 1.5 : 1.25);
  let pr = prMax, prWant = pr;
  renderer.setPixelRatio(pr);
  renderer.toneMapping = THREE.NoToneMapping;        // tone mapping lives in the final pass
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.info.autoReset = false;
  let W = Math.max(1, host.clientWidth), H = Math.max(1, host.clientHeight);
  renderer.setSize(W, H, false);

  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(VFOV, W / H, 0.5, 6000);
  const sun = new V3();

  // ---------------------------------------------------------------- sky: shared uniforms (dome, env bake, haze)
  const skyU = { uSun: { value: sun }, uGlow: { value: 1 }, uLift: { value: 1 }, uStars: { value: HIGH ? 1 : 0 }, uTime: { value: 0 } };
  const skyDefs = { FBM_OCT: HIGH ? 3 : 2, ...(HIGH ? { STARS: '' } : {}) };
  const tri = new THREE.BufferGeometry();
  tri.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3));
  tri.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([0, 0, 2, 0, 0, 2]), 2));
  const skyMat = new THREE.ShaderMaterial({ uniforms: skyU, defines: skyDefs, vertexShader: SKY_VERT, fragmentShader: SKY_FRAG, depthWrite: false, fog: false });
  const skyMesh = new THREE.Mesh(tri, skyMat); skyMesh.frustumCulled = false; skyMesh.renderOrder = 1e6; scene.add(skyMesh);

  // ---------------------------------------------------------------- lights: twilight glow (key from behind = rim), sky / ground fill
  const glowLight = new THREE.DirectionalLight(0xff9a5c, 0); scene.add(glowLight, glowLight.target);
  const hemi = new THREE.HemisphereLight(0x3a2a2c, 0x1a0c06, 0.35); scene.add(hemi);
  const glowCol = new THREE.Color(1.0, 0.56, 0.3), glowColLow = new THREE.Color(1.0, 0.38, 0.16);

  // ---------------------------------------------------------------- content: modeller scene, or a placeholder ridge + boxes
  let content = null, root = null;
  function placeholder() {
    const g = new THREE.Group();
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(9000, 6000, 1, 1).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x3a1c10, roughness: 1 }));
    ground.position.z = -2900; g.add(ground);
    const N = 160, rg = new THREE.PlaneGeometry(7000, 200, N, 1), p = rg.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), top = p.getY(i) > 0; p.setY(i, top ? 45 + 30 * Math.sin(x * 0.0021) + 18 * Math.sin(x * 0.0067 + 1) : -20); }
    rg.computeVertexNormals();
    const ridge = new THREE.Mesh(rg, new THREE.MeshStandardMaterial({ color: 0x6a3018, roughness: 1 })); ridge.position.z = -2100; g.add(ridge);
    const glass = new THREE.MeshPhysicalMaterial({ color: 0x223322, roughness: 0.15, metalness: 0, clearcoat: 1 });
    const steel = new THREE.MeshStandardMaterial({ color: 0x9aa0a6, roughness: 0.3, metalness: 1 });
    const hab = new THREE.MeshStandardMaterial({ color: 0x8a8580, roughness: 0.6 });
    const dome = (r, x, z) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), glass); m.position.set(x, 0, z); g.add(m); };
    dome(22, -60, -320); dome(10, -170, -360); dome(9, 110, -330);
    for (let i = 0; i < 9; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(14, 7, 10), hab); m.position.set(-20 + i * 16, 3.5, -340); g.add(m); }
    for (const [x, z, h] of [[70, -360, 50], [125, -390, 50]]) { const m = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 4.5, h, 24), steel); m.position.set(x, h / 2, z); g.add(m); }
    return { root: g, applyTextures() {}, placeholder: true };
  }
  async function loadContent() {
    try {
      const mod = await import(MODEL);
      if (typeof mod.buildFooterScene === 'function') return mod.buildFooterScene({ THREE, quality: HIGH ? 'high' : 'low' });
    } catch (e) { if (DEBUG) console.warn('d61 footer: model not loaded, placeholder', e); }
    return placeholder();
  }
  // sunrise hooks on the modeller's anchors: greenery backlight and dome glass reflections rise with the glow
  let leafBase = null, glassEnv0 = 1, sunE = 0;
  function hooks() {
    const a = content?.anchors; if (!a) return;
    if (a.foliage?.value) { if (!content.update) a.foliage.value.copy(leafBase); a.foliage.value.multiplyScalar(0.3 + 0.7 * sunE); }
    if (a.glass) a.glass.envMapIntensity = glassEnv0 * (0.75 + 0.4 * sunE);
  }
  function mount(c) {
    content = c; root = c.root; scene.add(root);
    leafBase = c.anchors?.foliage?.value?.clone?.() ?? null; glassEnv0 = c.anchors?.glass?.envMapIntensity ?? 1;
    for (const l of c.lights || []) if (!l.parent) scene.add(l);
  }

  // ---------------------------------------------------------------- render targets
  const HF = THREE.HalfFloatType;
  const rtOpts = { type: HF, depthBuffer: false, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, generateMipmaps: false };
  const depthTex = new THREE.DepthTexture(1, 1); depthTex.type = THREE.UnsignedIntType;
  const rtScene = new THREE.WebGLRenderTarget(1, 1, { type: HF, samples: HIGH ? 4 : 2, depthBuffer: true, depthTexture: depthTex });
  const rtA = new THREE.WebGLRenderTarget(1, 1, rtOpts);
  const LV = HIGH ? 5 : 4;
  const rtPre = new THREE.WebGLRenderTarget(1, 1, rtOpts);
  const rtL = [], rtT = [];
  for (let i = 0; i < LV; i++) { rtL.push(new THREE.WebGLRenderTarget(1, 1, rtOpts)); rtT.push(new THREE.WebGLRenderTarget(1, 1, rtOpts)); }

  // ---------------------------------------------------------------- environment: the sky baked to equirect -> PMREM (rebaked as the sun moves)
  const eqRT = new THREE.WebGLRenderTarget(HIGH ? 256 : 128, HIGH ? 128 : 64, { ...rtOpts });
  eqRT.texture.mapping = THREE.EquirectangularReflectionMapping;
  const pmrem = new THREE.PMREMGenerator(renderer);
  let envRT = null, envP = -1, envT = 0;

  // ---------------------------------------------------------------- full-screen passes
  const fsCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const fs = new THREE.Mesh(tri); fs.frustumCulled = false;
  const fsScene = new THREE.Scene(); fsScene.add(fs);
  const fsMat = (frag, uniforms, defines = {}) => new THREE.ShaderMaterial({ uniforms, defines, vertexShader: FS_VERT, fragmentShader: frag, depthTest: false, depthWrite: false });
  const eqMat = fsMat(EQ_FRAG, skyU, skyDefs);
  const atmosU = { ...skyU, tColor: { value: rtScene.texture }, tDepth: { value: depthTex }, uInvProj: { value: new THREE.Matrix4() }, uCamWorld: { value: new THREE.Matrix4() }, uCamPos: { value: new V3() },
    uSigma: { value: 1 / 2600 }, uHd: { value: 900 }, uDrift: { value: HIGH ? 0.6 : 0.4 }, uHazeK: { value: 1 }, uWind: { value: new THREE.Vector2(0.04, 0.012) } };
  const atmosMat = fsMat(ATMOS_FRAG, atmosU, skyDefs);
  const preMat = fsMat(PRE_FRAG, { tSrc: { value: rtA.texture }, uTexel: { value: new THREE.Vector2() }, uThr: { value: 0.55 }, uKnee: { value: 0.35 } });
  const blurMats = [];
  for (let i = 0; i < LV * 2; i++) blurMats.push(fsMat(BLUR_FRAG, { tSrc: { value: null }, uDir: { value: new THREE.Vector2() } }));
  const finU = {
    tSrc: { value: rtA.texture }, tB0: { value: rtL[0].texture }, tB1: { value: rtL[1].texture }, tB2: { value: rtL[2].texture }, tB3: { value: rtL[3].texture }, tB4: { value: rtL[LV - 1].texture },
    uBw: { value: new THREE.Vector4(0.46, 0.3, 0.15, 0.06) }, uBw4: { value: 0.03 }, uBloom: { value: 0.5 }, uExp: { value: 1 }, uGrain: { value: HIGH ? 0.04 : 0.03 }, uTime: { value: 0 },
    uVig: { value: 0.75 }, uLow: { value: 0.82 }, uTop: { value: 0.1 }, uLogo: { value: new THREE.Vector4() }, uHalo: { value: 0 }, uHaloC: { value: new THREE.Color(0.06, 0.022, 0.009) }, uRes: { value: new THREE.Vector2() }
  };
  const finMat = fsMat(FINAL_FRAG, finU, LV > 4 ? { B5: '' } : {});
  function pass(mat, target) { fs.material = mat; renderer.setRenderTarget(target); renderer.render(fsScene, fsCam); }
  // post quality ladder (GRADE, shared with the Mars post): 3/2 every bloom mip, 1 one fewer, 0 three; weights renormalised so
  // the glow keeps its energy. Only skips passes: nothing compiles.
  const BW = [0.46, 0.3, 0.15, 0.06, 0.03];
  let bloomLv = LV, postQ = 3;
  function setPostQuality(l) {
    postQ = Math.max(0, Math.min(3, Math.round(+l || 0))); bloomLv = Math.min(LV, postQ >= 2 ? 5 : postQ === 1 ? 4 : 3);
    const ws = BW.slice(0, LV); ws[LV - 1] = BW.slice(LV - 1).reduce((a, b) => a + b, 0);   // low tier (4 mips) folds the 5th into the 4th, as before
    let tot = 0; for (let i = 0; i < bloomLv; i++) tot += ws[i];
    const k = i => (i < bloomLv ? ws[i] / tot : 0);
    finU.uBw.value.set(k(0), k(1), k(2), k(3)); finU.uBw4.value = LV > 4 ? k(4) : 0;
  }

  // ---------------------------------------------------------------- layout
  let logo = null;   // DOM rect of the logotype relative to the host (setLogoRect), else the Figma layout
  const lens = { vfov: VFOV, pitch: 0 };
  function setLogoU() {
    const r = logo ? { x: (logo.x + logo.w / 2) / W, y: (logo.y + logo.h / 2) / H, w: logo.w / W, h: logo.h / H } : LOGO;
    finU.uLogo.value.set(r.x, 1 - r.y, r.w / 2, r.h / 2);
  }
  function sizeTargets() {
    const w = Math.max(1, Math.round(W * pr)), h = Math.max(1, Math.round(H * pr));
    rtScene.setSize(w, h); rtA.setSize(w, h);
    let bw = Math.max(1, w >> 1), bh = Math.max(1, h >> 1);
    rtPre.setSize(bw, bh); preMat.uniforms.uTexel.value.set(0.5 / bw, 0.5 / bh);   // 4 taps at source-texel corners
    let sw = bw, sh = bh;
    for (let i = 0; i < LV; i++) {
      const dw = Math.max(1, i ? sw >> 1 : sw), dh = Math.max(1, i ? sh >> 1 : sh);
      rtT[i].setSize(dw, dh); rtL[i].setSize(dw, dh);
      blurMats[i * 2].uniforms.tSrc.value = i ? rtL[i - 1].texture : rtPre.texture; blurMats[i * 2].uniforms.uDir.value.set(1 / dw, 0);
      blurMats[i * 2 + 1].uniforms.tSrc.value = rtT[i].texture; blurMats[i * 2 + 1].uniforms.uDir.value.set(0, 1 / dh);
      sw = dw; sh = dh;
    }
    finU.uRes.value.set(w, h);
  }
  function layout() {
    const a = W / H, port = a < 0.85, hf = port ? PORTRAIT.hfov : HFOV_MIN;
    const hv = 2 * Math.atan(Math.tan(hf * Math.PI / 360) / a) * 180 / Math.PI;
    lens.vfov = Math.min(70, Math.max(VFOV, hv));
    // pitch down so the horizon (elevation 0) lands this far from the top
    lens.pitch = Math.atan((1 - 2 * (port ? PORTRAIT.horizon : HORIZON)) * Math.tan(lens.vfov * Math.PI / 360));
    finU.uTop.value = port ? 0.06 : 0.14;
    cam.fov = lens.vfov; cam.aspect = a; cam.updateProjectionMatrix();
    setLogoU();
  }

  // ---------------------------------------------------------------- camera: eye level, steady gaze, pointer parallax by translation
  // Cinematic drift: the scroll-in eases a short push toward the city (DOLLY.push m); at rest a slow lateral dolly
  // (two long incommensurate sines, so it never visibly loops) and a faint breathing push. Gaze stays parked, so the
  // horizon holds and only the foreground rocks slide against the city.
  let prog = 0, ptrX = 0, ptrY = 0, sx = 0, sy = 0, clock = 0;
  const nX = noise1(3), nY = noise1(7), nG = noise1(11), nH = noise1(17);
  const DOLLY = { push: 6, side: 0.8, sideT: [75, 113], breathe: 1.2, breatheT: 53 };   // m, s: near rocks drift ~5 px/s at 1440, the city well under 1
  const look = new V3(), eye = new V3();
  function pose(t) {
    sx += (ptrX - sx) * 0.05; sy += (ptrY - sy) * 0.05;
    const w = 2 * Math.PI, lat = DOLLY.side * (0.75 * Math.sin(w * t / DOLLY.sideT[0]) + 0.25 * Math.sin(w * t / DOLLY.sideT[1] + 1.3));
    const push = DOLLY.push * (1 - ease(prog)) - DOLLY.breathe * (0.5 - 0.5 * Math.cos(w * t / DOLLY.breatheT));
    eye.set(EYE[0] + lat + sx * 0.45 + 0.03 * nX(t * 0.13), EYE[1] - sy * 0.12 + 0.015 * nY(t * 0.17), EYE[2] + push);
    cam.position.copy(eye);
    look.set(eye.x * 0.6, eye.y - Math.tan(lens.pitch) * 1000, eye.z - 1000);   // gaze shifts less than the eye: parallax, horizon steady
    cam.lookAt(look);
    cam.updateMatrixWorld();
  }

  // ---------------------------------------------------------------- sunrise + shimmer state for a given p and time
  const tune = { glow: 1, haze: 1, sigma: 1, key: 1, bloom: 1, exposure: 1 };   // QA multipliers
  function light(p, t) {
    const e = ease(p), rest = sstep(0.82, 1, p); sunE = e;
    // at rest: the glow breathes (two incommensurate noises, a swell every 5 to 8 s), dust drifts through the haze
    const breath = 1 + rest * (0.17 * nG(t * 0.16) + 0.07 * nH(t * 0.41));
    const el = (SUN_EL[0] + (SUN_EL[1] - SUN_EL[0]) * e) * Math.PI / 180;
    sun.set(Math.sin(SUN_AZ) * Math.cos(el), Math.sin(el), -Math.cos(SUN_AZ) * Math.cos(el));
    const glow = (0.22 + 0.78 * e) * breath;
    skyU.uGlow.value = 1.35 * glow * tune.glow; skyU.uLift.value = e; skyU.uTime.value = t;
    skyU.uStars.value = HIGH ? 1 - 0.75 * e : 0;
    // key from the glow, just above the ridge: backlight, rims the glass, steel and the dome edges
    glowLight.position.set(Math.sin(SUN_AZ) * 1000, 150 + 80 * e, -Math.cos(SUN_AZ) * 1000);   // the bright sky patch, not the sun: high enough that the dusty ground does not mirror it
    glowLight.target.position.set(0, 0, 0);
    glowLight.color.copy(glowColLow).lerp(glowCol, e); glowLight.intensity = (0.08 + 0.5 * e * breath) * tune.key;
    hemi.intensity = 0.05 + 0.04 * e;
    // haze: denser and darker before the sun, warmer as it rises (the inscatter is the sky's own light)
    atmosU.uSigma.value = (1 / 3200) * (1.15 - 0.2 * e) * tune.sigma; atmosU.uHazeK.value = (0.32 + 0.16 * e) * tune.haze; atmosU.uDrift.value = (HIGH ? 0.9 : 0.7) * (0.4 + 0.6 * rest);
    finU.uExp.value = (0.82 + 0.06 * e) * tune.exposure;
    finU.uBloom.value = (0.16 + 0.16 * e) * tune.bloom;
    finU.uHalo.value = (0.25 + 0.75 * e) * (1 + 1.5 * (breath - 1));   // breathes with the glow
  }

  function bakeEnv(force) {
    const now = performance.now();
    if (!force && (Math.abs(prog - envP) < ENV_STEP || now - envT < ENV_MS)) return;
    envP = prog; envT = now;
    pass(eqMat, eqRT);
    envRT = pmrem.fromEquirectangular(eqRT.texture, envRT);
    scene.environment = envRT.texture;
  }

  // ---------------------------------------------------------------- per frame
  let lastT = 0, frames = 0, ftAcc = 0, ftN = 0, moveT = 0;
  function frame(now) {
    const t = now / 1000, dt = lastT ? Math.min(0.1, t - lastT) : 1 / 60; lastT = t; clock += dt;
    renderer.info.reset();
    pose(clock);
    light(prog, clock);
    content?.update?.(clock);
    hooks();
    bakeEnv(false);
    // scene (HDR, MSAA) -> aerial perspective
    renderer.setRenderTarget(rtScene); renderer.render(scene, cam);
    atmosU.uInvProj.value.copy(cam.projectionMatrixInverse); atmosU.uCamWorld.value.copy(cam.matrixWorld); atmosU.uCamPos.value.copy(cam.position);
    pass(atmosMat, rtA);
    // bloom
    pass(preMat, rtPre);
    for (let i = 0; i < bloomLv; i++) { pass(blurMats[i * 2], rtT[i]); pass(blurMats[i * 2 + 1], rtL[i]); }
    finU.uTime.value = clock;
    pass(finMat, null);
    // adaptive ratio (high): sustained slow frames drop the ratio a notch, applied while the scroll is idle
    if (HIGH && running) { ftAcc += dt; ftN++; if (ftN >= 90) { const avg = ftAcc / ftN; ftAcc = ftN = 0; if (avg > 1 / 45 && prWant > 1) prWant = Math.max(1, prWant - 0.25); } }
    if (prWant !== pr && now - moveT > 400) { pr = prWant; renderer.setPixelRatio(pr); renderer.setSize(W, H, false); sizeTargets(); }
    frames++;
  }

  // ---------------------------------------------------------------- async compile against the real targets
  function compileTo(target, obj, camera, targetScene = null) {
    const old = renderer.getRenderTarget(); renderer.setRenderTarget(target);
    try { if (!renderer.extensions.has('KHR_parallel_shader_compile')) { renderer.compile(obj, camera, targetScene); return Promise.resolve(); } return renderer.compileAsync(obj, camera, targetScene); } finally { renderer.setRenderTarget(old); }
  }
  function compileFS(mat, target) { const sc = new THREE.Scene(), m = new THREE.Mesh(tri, mat); m.frustumCulled = false; sc.add(m); return compileTo(target, sc, fsCam); }
  function compileAll() {
    return Promise.all([
      compileTo(rtScene, scene, cam),
      compileFS(atmosMat, rtA), compileFS(preMat, rtPre), compileFS(blurMats[0], rtT[0]), compileFS(finMat, null)
    ]);
  }

  // ---------------------------------------------------------------- textures stream in after ready
  let texApi = null, texQueued = false;
  function applyTextures() { if (texQueued) return; texQueued = true; setTimeout(applyNow, 30); }
  function applyNow() { texQueued = false; if (dead || !texApi) return; try { content?.applyTextures?.(texApi); } catch (e) { console.warn('d61 footer textures:', e); } }
  function startTextures() {
    import('./foot-tex.js').then(mod => {
      if (dead || !mod.loadFooterTextures) return;
      // dusk_sky is skipped: the environment is baked live from this sky, so reflections follow the sunrise
      const roles = (mod.TEX_ROLES || []).filter(r => r !== 'dusk_sky');
      texApi = mod.loadFooterTextures({ THREE, renderer, quality: HIGH ? 'high' : 'low', base: baseURL, ...(roles.length ? { roles } : {}) });
      if (texApi?.onReady) texApi.onReady(applyTextures); else texApi?.ready?.then(applyTextures);
    }).catch(() => { /* textures are optional */ });
  }

  // ---------------------------------------------------------------- loop + api
  let running = false, raf = 0, dead = false, visHidden = false;
  // nothing draws before ready: an early start() would compile every program synchronously on the main thread
  const loop = now => { if (!running) return; raf = requestAnimationFrame(loop); if (stage) frame(now); };
  const onVis = () => { visHidden = document.hidden; if (visHidden) cancelAnimationFrame(raf); else if (running) { lastT = 0; raf = requestAnimationFrame(loop); } };
  document.addEventListener('visibilitychange', onVis);
  function resize() {
    const w = Math.max(1, host.clientWidth), h = Math.max(1, host.clientHeight);
    if (w === W && h === H) return; // mobile URL bar resizes: re-setting the canvas size would clear it for a frame
    W = w; H = h;
    renderer.setSize(W, H, false); canvas.style.width = canvas.style.height = '100%';
    sizeTargets(); layout();
    if (!running && stage) frame(performance.now());
  }
  let stage = 0;
  sizeTargets(); layout();

  const t0 = performance.now(), timing = {};
  const ready = (async () => {
    const c = await loadContent();
    if (dead) { disposeContent(c); return false; }
    mount(c); timing.model = performance.now() - t0;
    pose(0); light(prog, 0); bakeEnv(true); timing.env = performance.now() - t0;
    try { await compileAll(); } catch (e) { if (DEBUG) console.warn('d61 footer compile:', e); }
    timing.compile = performance.now() - t0;
    if (dead) return false;
    await yieldTask(); if (dead) return false;
    frame(performance.now()); stage = 1;
    timing.ready = performance.now() - t0;
    idle(() => { if (!dead) startTextures(); });
    return true;
  })();

  function disposeContent(c) {
    c?.dispose?.();
    c?.root?.traverse(o => { o.geometry?.dispose(); for (const m of [].concat(o.material || [])) { for (const k in m) if (m[k]?.isTexture) m[k].dispose(); m.dispose(); } });
  }

  return {
    ready, renderer, scene, camera: cam,
    fx: { sky: skyU, atmos: atmosU, final: finU, glowLight, hemi, tune },   // look tunables (QA)
    setProgress(p) { const v = Math.min(1, Math.max(0, +p || 0)); if (v !== prog) { prog = v; moveT = performance.now(); } },
    setPointer(x, y) { ptrX = Math.max(-1, Math.min(1, +x || 0)); ptrY = Math.max(-1, Math.min(1, +y || 0)); },
    // optional: the logotype's box relative to the host (px), so the halo sits behind it; null restores the Figma layout
    setLogoRect(r) { logo = r ? { x: r.x ?? r.left, y: r.y ?? r.top, w: r.w ?? r.width, h: r.h ?? r.height } : null; setLogoU(); },
    start() { if (running || dead) return; running = true; lastT = 0; if (!visHidden) raf = requestAnimationFrame(loop); },
    stop() { running = false; cancelAnimationFrame(raf); },
    renderOnce(t) { if (dead || !stage) return; if (t != null) { clock = +t; lastT = 0; } frame(performance.now()); },   // t: scene clock in s (QA stills)
    setPostQuality, getPostQuality: () => postQ,
    setPixelRatio(v) { prWant = Math.max(0.5, Math.min(prMax, +v || prMax)); },   // perf governor cap; the loop applies it on a quiet frame
    resize,
    stats() { const i = renderer.info; return { calls: i.render.calls, triangles: i.render.triangles, pixelRatio: pr, dpr: DPR, frames, programs: i.programs?.length, stage, timing, placeholder: !!content?.placeholder }; },
    dispose() {
      if (dead) return;
      running = false; dead = true; cancelAnimationFrame(raf);
      document.removeEventListener('visibilitychange', onVis);
      try { texApi?.dispose?.(); } catch (_) { /* best effort */ }
      disposeContent(content);
      for (const m of [skyMat, eqMat, atmosMat, preMat, finMat, ...blurMats]) m.dispose();
      for (const r of [rtScene, rtA, rtPre, eqRT, ...rtL, ...rtT]) r.dispose();
      depthTex.dispose(); envRT?.dispose(); pmrem.dispose(); tri.dispose();
      scene.environment = null;
      renderer.dispose(); renderer.forceContextLoss?.();
      if (!cvIn) canvas.remove();
    }
  };
}
