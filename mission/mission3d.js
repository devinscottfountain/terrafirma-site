// TerraFirma careers Mission section: Earth (left) and Mars (right) turning in real time, a Starship that follows the section's
// SVG arc between them as the page scrolls. Webflow owns everything 2D; this only draws into the transparent canvas.
//
// createMission({ THREE, section, quality, base }) -> { ready, start, stop, resize, dispose, stats, capture, canvas, renderer }
//
// DOM contract (see README): [data-mission] section, [data-mission-canvas] mount, [data-mission-earth] / [data-mission-mars] square
// boxes, path[data-mission-path] inside [data-mission-arc]. Camera: orthographic, 1 world unit = 1 css px, origin at the top-left
// of the mount, y up in world space (world y = height - css y). Planets are analytic quads (mission-glsl.js), so each disc is
// exactly its box. Rendering is gated by an IntersectionObserver; all programs compile before the first visible frame.
import { PLANET_VERT, EARTH_FRAG, MARS_FRAG, PLUME_VERT, PLUME_FRAG, ENV_VERT, ENV_FRAG } from './mission-glsl.js';
import { buildStarships } from '../footer/foot-model-starship.js';
import { buckets } from '../footer/foot-model-kit.js';

const MARGIN = 0.12;                       // quad bleed around the disc (radii fraction) for the atmosphere rim
// Texture slot (urls are relative to the assets base, or absolute). To swap in NASA Blue Marble later, change these lines only.
// Expected files: color 2048x1024 webp (high) and 1024x512 (low), equirectangular, lon 0 at the centre; clouds 1024x512 webp
// (greyscale cover); normal 1024x512 webp (tangent-space, optional, high tier only).
const EARTH_TEX = { color: { high: 'earth-2048.webp', low: 'earth-1024.webp' }, clouds: 'earth-clouds-1024.webp', normal: 'earth-n-1024.webp' };
const MARS_TEX = { color: { high: 'mars-2048.webp', low: 'mars-1024.webp' }, normal: 'mars-n-1024.webp' };

// Fixed start rotation: the uv.x (0..1, lon 0 at 0.5) that faces the camera at t=0. No randomness, so a still at t=0 is the first live frame.
export const INITIAL_ROTATION = { earth: 0.345, mars: 0.346 };
export const EARTH = { period: 360, tilt: 0.22, lean: 0.14, front: INITIAL_ROTATION.earth, sun: [0.42, 0.16, 0.89] };   // seconds per turn, axis tilt (z), lean toward us (x), start uv.x, sun
export const MARS = { period: 450, tilt: -0.30, lean: 0.14, front: INITIAL_ROTATION.mars, sun: [-0.40, 0.18, 0.90] };
// Each planet has its own sun: mostly frontal, offset toward the page centre and a little up, so the terminator falls on the off-screen side.
const SUN = [-0.55, 0.28, 0.79];           // ship key light and environment only: front-left, a little above
const T0 = 0.04, T1 = 0.96;                // rocket arc parameter limits
const P0 = 0.15, P1 = 0.85;                // section progress mapped onto T0..T1
const SAMPLES = 192;                       // path samples (cached in px on resize)

const clamp01 = x => Math.min(1, Math.max(0, x));
const sstep = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const nextFrame = () => new Promise(r => (typeof requestAnimationFrame === 'function' ? requestAnimationFrame(() => r()) : setTimeout(r, 0)));

export function createMission({ THREE, section, quality = 'high', base } = {}) {
  const high = quality !== 'low';
  const baseURL = new URL(String(base || new URL('./assets/', import.meta.url).href).replace(/\/?$/, '/'), location.href).href;
  const host = section.querySelector('[data-mission-canvas]') || section;
  const earthBox = section.querySelector('[data-mission-earth]'), marsBox = section.querySelector('[data-mission-mars]');
  const pathEl = section.querySelector('path[data-mission-path]');

  // ---------------------------------------------------------------- renderer, camera
  const renderer = new THREE.WebGLRenderer({ alpha: true, premultipliedAlpha: true, antialias: high, powerPreference: 'high-performance', stencil: false });
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;   // ship only; the planet shaders tone map themselves
  renderer.toneMappingExposure = 1;
  const canvas = renderer.domElement;
  Object.assign(canvas.style, { position: 'absolute', left: '0', top: '0', width: '100%', height: '100%', display: 'block', pointerEvents: 'none' });
  host.appendChild(canvas);
  const dprCap = high ? 1.5 : 1;
  const camera = new THREE.OrthographicCamera(0, 1, 1, 0, -1000, 1000);
  camera.position.z = 500;
  const scene = new THREE.Scene();

  // ---------------------------------------------------------------- planets
  const quadGeo = new THREE.PlaneGeometry(1, 1);
  const additive = { transparent: true, depthTest: false, depthWrite: false, blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor };
  const dot1 = (r, g, b) => { const t = new THREE.DataTexture(new Uint8Array([r, g, b, 255]), 1, 1); t.needsUpdate = true; return t; };
  const sunW = new THREE.Vector3(...SUN).normalize();   // ship key
  const defines = { ...(high ? { HAS_NORM: '' } : {}) };
  const mkUniforms = (extra) => ({ uQ: { value: 1 + 2 * MARGIN }, uRot: { value: new THREE.Matrix3() }, uSun: { value: new THREE.Vector3() }, uSunI: { value: 1 }, uExp: { value: 1 }, uGlow: { value: 1 }, ...extra });

  const earthU = mkUniforms({ tMap: { value: dot1(10, 30, 70) }, tNorm: { value: dot1(128, 128, 255) }, tClouds: { value: dot1(0, 0, 0) },
    uCloudOff: { value: 0 }, uCloudH: { value: 0.0085 }, uCloudRot: { value: new THREE.Vector2(1, 0) } });
  earthU.uSunI.value = 3.3; earthU.uExp.value = 0.62;
  const marsU = mkUniforms({ tMap: { value: dot1(150, 70, 40) }, tNorm: { value: dot1(128, 128, 255) }, uRelief: { value: 1.25 }, uBump: { value: 11 } });
  marsU.uSunI.value = 2.2; marsU.uExp.value = 0.62;

  const planet = (frag, uniforms, defs, order) => {
    const m = new THREE.Mesh(quadGeo, new THREE.ShaderMaterial({ vertexShader: PLANET_VERT, fragmentShader: frag, uniforms, defines: defs, ...additive }));
    m.frustumCulled = false; m.renderOrder = order; scene.add(m); return m;
  };
  const earth = planet(EARTH_FRAG, earthU, { ...defines, ...(high ? { HAS_CLOUDS: '' } : {}) }, 1);
  const mars = planet(MARS_FRAG, marsU, defines, 1);
  // state per planet: disc centre and radius in css px (section-relative), spin
  const pl = [
    { mesh: earth, u: earthU, cfg: EARTH, cx: 0, cy: 0, r: 0, q: new THREE.Quaternion(), qt: new THREE.Quaternion() },
    { mesh: mars, u: marsU, cfg: MARS, cx: 0, cy: 0, r: 0, q: new THREE.Quaternion(), qt: new THREE.Quaternion() },
  ];
  const AX = new THREE.Vector3(1, 0, 0), AY = new THREE.Vector3(0, 1, 0), AZ = new THREE.Vector3(0, 0, 1);
  const qa = new THREE.Quaternion(), qb = new THREE.Quaternion(), m4 = new THREE.Matrix4();
  for (const P of pl) P.qt.setFromAxisAngle(AZ, P.cfg.tilt).multiply(qa.setFromAxisAngle(AX, P.cfg.lean));   // fixed axis tilt

  // ---------------------------------------------------------------- Starship (footer model, one ship, uniform steel)
  const envRT = buildEnv();
  scene.environment = envRT.texture;
  const steel = new THREE.MeshStandardMaterial({ color: 0xe6e3de, roughness: 0.3, metalness: 1, envMapIntensity: 1.5, transparent: true });
  const flapM = new THREE.MeshStandardMaterial({ color: 0xd2cfca, roughness: 0.4, metalness: 0.85, envMapIntensity: 1.2, transparent: true });
  const darkM = new THREE.MeshStandardMaterial({ color: 0x1b1c1e, roughness: 0.5, metalness: 0.4, transparent: true });
  const dropM = new THREE.MeshBasicMaterial(), dropM2 = new THREE.MeshBasicMaterial();   // pad + beacon buckets, discarded below
  const shipMats = [steel, flapM, darkM];
  const shipModel = new THREE.Group();
  {
    const B = buckets(THREE);
    buildStarships({ THREE, B, M: { stainless: steel, flap: flapM, dark: darkM, pad: dropM, beacon: dropM2 }, high, ships: [{ x: 0, z: 0, ry: 0, lod: 0 }] });
    const parts = B.flush(shipModel, 'ship');
    for (const m of parts) if (m.material === dropM || m.material === dropM2) { shipModel.remove(m); m.geometry.dispose(); }
    // centre the hull on its own midpoint so the pivot sits mid-ship
    const box = new THREE.Box3().setFromObject(shipModel), c = box.getCenter(new THREE.Vector3());
    shipModel.traverse(o => { if (o.isMesh) { o.geometry.translate(-c.x, -c.y, -c.z); o.geometry.computeBoundingSphere(); o.frustumCulled = false; o.renderOrder = 2; } });
    shipModel.userData.h = box.max.y - box.min.y;
  }
  const shipRoll = new THREE.Group(); shipRoll.add(shipModel); shipRoll.rotation.y = 0.5;   // roll about the hull axis so the flaps read in 3D
  const ship = new THREE.Group(); ship.add(shipRoll); ship.position.z = 50; ship.visible = false; scene.add(ship);
  const key = new THREE.DirectionalLight(0xffe6c8, 2.4);
  key.position.copy(sunW).multiplyScalar(100); scene.add(key);

  const plumeU = { uT: { value: 0 }, uA: { value: 0 } };
  const plumeGeo = new THREE.PlaneGeometry(1, 1).translate(0, -0.5, 0);   // y 0..-1, top edge at the nozzle
  const plume = new THREE.Mesh(plumeGeo, new THREE.ShaderMaterial({ vertexShader: PLUME_VERT, fragmentShader: PLUME_FRAG, uniforms: plumeU,
    transparent: true, depthTest: false, depthWrite: false, blending: THREE.CustomBlending, blendEquation: THREE.AddEquation,
    blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor, blendSrcAlpha: THREE.OneFactor, blendDstAlpha: THREE.OneFactor }));
  plume.frustumCulled = false; plume.renderOrder = 3; ship.add(plume);

  // ---------------------------------------------------------------- environment (warm key front-left, cool rim, warm bounce)
  function buildEnv() {
    const sc = new THREE.Scene();
    const geo = new THREE.SphereGeometry(10, 32, 16);
    const mat = new THREE.ShaderMaterial({ vertexShader: ENV_VERT, fragmentShader: ENV_FRAG, uniforms: { uL: { value: new THREE.Vector3(...SUN).normalize() } }, side: THREE.BackSide, depthWrite: false });
    sc.add(new THREE.Mesh(geo, mat));
    const pm = new THREE.PMREMGenerator(renderer), rt = pm.fromScene(sc, 0.02, 0.1, 100);
    pm.dispose(); geo.dispose(); mat.dispose();
    return rt;
  }

  // ---------------------------------------------------------------- layout
  let W = 1, Hh = 1, docTop = 0, docH = 1, shipLen = 100;
  const px = new Float32Array(SAMPLES + 1), py = new Float32Array(SAMPLES + 1);   // path in section px (y down)
  let pathOK = false;
  let pathLen = 0, drawnLast = -1;                // arc length in svg user units, last drawn fraction written to the dash
  const stats = {
    quality, programs: 0, calls: 0, triangles: 0, frames: 0, dpr: 1, w: 0, h: 0, p: 0, visible: false, running: false,
    earth: { cx: 0, cy: 0, r: 0 }, mars: { cx: 0, cy: 0, r: 0 },
    rocket: { x: 0, y: 0, angle: 0, t: 0, target: 0, alpha: 0, len: 0 }, pathOK: false
  };

  function measure() {
    const hr = host.getBoundingClientRect();
    W = Math.max(1, host.clientWidth || hr.width); Hh = Math.max(1, host.clientHeight || hr.height);
    docTop = hr.top + window.scrollY; docH = Hh;
    const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
    renderer.setPixelRatio(dpr); renderer.setSize(W, Hh, false);
    camera.left = 0; camera.right = W; camera.top = Hh; camera.bottom = 0; camera.updateProjectionMatrix();
    stats.dpr = dpr; stats.w = W; stats.h = Hh;
    const place = (P, box, out) => {
      if (!box) { P.mesh.visible = false; return; }
      const r = box.getBoundingClientRect();
      P.r = r.width / 2; P.cx = r.left - hr.left + P.r; P.cy = r.top - hr.top + r.height / 2;
      P.mesh.visible = P.r > 0;
      P.mesh.position.set(P.cx, Hh - P.cy, 0);
      P.mesh.scale.setScalar(2 * P.r * (1 + 2 * MARGIN));
      out.cx = P.cx; out.cy = P.cy; out.r = P.r;
    };
    place(pl[0], earthBox, stats.earth); place(pl[1], marsBox, stats.mars);
    // path -> section px through the svg's current screen CTM (viewBox scaling included)
    pathOK = false;
    if (pathEl) {
      const ctm = pathEl.getScreenCTM(), len = pathEl.getTotalLength();
      if (ctm && len > 0) {
        // the trail draws on behind the ship with a dash in svg user units. Chrome measures dashes in screen px when the stroke is
        // non-scaling, so the stroke scales with the svg here and its width is set back to 1 css px by hand (the same look in every browser)
        const scale = Math.hypot(ctm.a, ctm.b) || 1;
        pathLen = len; drawnLast = -1;
        pathEl.style.vectorEffect = 'none';
        pathEl.style.strokeWidth = String(1 / scale);
        pathEl.style.strokeDasharray = len + ' ' + len;
        for (let i = 0; i <= SAMPLES; i++) {
          const pt = pathEl.getPointAtLength(len * i / SAMPLES);
          px[i] = ctm.a * pt.x + ctm.c * pt.y + ctm.e - hr.left; py[i] = ctm.b * pt.x + ctm.d * pt.y + ctm.f - hr.top;
        }
        pathOK = true;
      }
    }
    stats.pathOK = pathOK;
    shipLen = Math.min(75, Math.max(32, W * 0.045));   // half the earlier 64..150 (client ticket: the ship read too big)
    const s = shipLen / (shipModel.userData.h || 50.4);
    shipRoll.scale.setScalar(s);
    plume.scale.set(shipLen * 0.24, shipLen * 0.66, 1);
    plume.position.y = -shipLen / 2 + shipLen * 0.015;
    stats.rocket.len = shipLen;
  }

  // ---------------------------------------------------------------- scroll, rocket
  const scrollY = () => (window.lenis && typeof window.lenis.scroll === 'number' ? window.lenis.scroll : window.scrollY);
  const E = stats.rocket;
  let rawCur = 0, rawTarget = 0, snap = true, time = 0, lastNow = 0;
  const tmpV = new THREE.Vector3();

  function updateRocket(dt) {
    const vh = window.innerHeight;
    const p = clamp01((scrollY() + vh - docTop) / (vh + docH));
    stats.p = p;
    rawTarget = T0 + (p - P0) / (P1 - P0) * (T1 - T0);
    if (snap) { rawCur = rawTarget; snap = false; }
    else rawCur += (rawTarget - rawCur) * (1 - Math.exp(-dt * 6));
    const t = Math.min(T1, Math.max(T0, rawCur));
    const a = sstep(T0 - 0.1, T0, rawCur) * (1 - sstep(T1, T1 + 0.1, rawCur));   // fades in/out beyond the clamp, hidden at the extremes
    E.t = t; E.target = rawTarget; E.alpha = a;
    // trail: drawn from Earth up to the ship, empty until the ship starts to fade in, and it stays drawn after the ship leaves
    if (pathOK && pathLen) {
      const drawn = rawCur > T0 - 0.1 ? t : 0;
      if (Math.abs(drawn - drawnLast) > 1e-4) { pathEl.style.strokeDashoffset = String(pathLen * (1 - drawn)); drawnLast = drawn; }
    }
    ship.visible = a > 0.004 && pathOK;
    if (!ship.visible) return;
    const f = t * SAMPLES, i = Math.min(SAMPLES - 1, Math.floor(f)), k = f - i;
    const x = px[i] + (px[i + 1] - px[i]) * k, y = py[i] + (py[i + 1] - py[i]) * k;
    const i0 = Math.max(0, i - 2), i1 = Math.min(SAMPLES, i + 3);   // tangent over a short window: smooth, no jitter
    const tx = px[i1] - px[i0], ty = -(py[i1] - py[i0]);              // y up
    const ang = Math.atan2(ty, tx);
    E.x = x; E.y = y; E.angle = ang;
    ship.position.set(x, Hh - y, 50);
    ship.rotation.z = ang - Math.PI / 2;                              // model nose is +y
    for (const m of shipMats) m.opacity = a;
    plumeU.uA.value = a * (0.92 + 0.08 * Math.sin(time * 41));
    plumeU.uT.value = time;
    plume.scale.y = shipLen * 0.66 * (1 + 0.07 * Math.sin(time * 29) * Math.sin(time * 11.3));   // length flicker
  }

  function updatePlanets() {
    for (const P of pl) {
      const ang = (0.25 - P.cfg.front) * Math.PI * 2 + time * Math.PI * 2 / P.cfg.period;   // uv.x facing us starts at cfg.front, then decreases
      P.q.copy(P.qt).multiply(qb.setFromAxisAngle(AY, ang));
      m4.makeRotationFromQuaternion(P.q);
      const R = P.u.uRot.value.setFromMatrix4(m4).transpose();        // world -> object
      P.u.uSun.value.set(...P.cfg.sun).normalize().applyMatrix3(R);
    }
    earthU.uCloudOff.value = -time * 0.0025;                        // deck drifts ~30% faster than the ground (same direction)
    const ca = -earthU.uCloudOff.value * Math.PI * 2;
    earthU.uCloudRot.value.set(Math.cos(ca), Math.sin(ca));
  }

  // ---------------------------------------------------------------- loop
  let enabled = false, visible = false, isReady = false, dead = false, raf = 0, gsapTick = null;
  function draw(dt) {
    time += dt;
    updatePlanets(); updateRocket(dt);
    renderer.render(scene, camera);
    const info = renderer.info;
    stats.programs = info.programs ? info.programs.length : 0; stats.calls = info.render.calls; stats.triangles = info.render.triangles; stats.frames++;
  }
  function tick() {
    if (dead || !isReady) return;
    const now = performance.now(), dt = lastNow ? Math.min(0.1, (now - lastNow) / 1000) : 1 / 60; lastNow = now;
    draw(dt);
  }
  function loop() { raf = requestAnimationFrame(loop); tick(); }
  function sync() {
    const run = enabled && visible && isReady && !dead;
    stats.running = run;
    if (run) {
      if (gsapTick || raf) return;
      lastNow = 0;
      if (window.gsap?.ticker) { gsapTick = tick; window.gsap.ticker.add(gsapTick); } else raf = requestAnimationFrame(loop);
    } else {
      if (gsapTick) { window.gsap.ticker.remove(gsapTick); gsapTick = null; }
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
    }
  }
  const io = new IntersectionObserver(es => { visible = es[es.length - 1].isIntersecting; stats.visible = visible; sync(); }, { rootMargin: '120px 0px' });
  io.observe(section);
  const ro = new ResizeObserver(() => { if (!dead) measure(); });
  ro.observe(section); ro.observe(host); ro.observe(document.body);   // body catches shifts above the section (images, fonts, pinned sections)
  const onLoad = () => { if (!dead) measure(); };
  addEventListener('load', onLoad);
  document.fonts?.ready.then(onLoad);
  for (const img of section.querySelectorAll('img')) if (!img.complete) img.addEventListener('load', onLoad, { once: true });

  // ---------------------------------------------------------------- textures, compile, first frame
  const loader = new THREE.TextureLoader(); loader.setCrossOrigin('anonymous');
  const anis = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const fetchTex = (name, srgb) => new Promise((res, rej) => loader.load(new URL(name, baseURL).href, t => {
    const img = t.image, dec = img && img.decode ? Promise.race([img.decode().catch(() => {}), new Promise(r => setTimeout(r, 400))]) : Promise.resolve();
    dec.then(() => {
      t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace; t.anisotropy = anis; t.wrapS = THREE.RepeatWrapping; t.needsUpdate = true; res(t);
    });
  }, undefined, () => rej(new Error('mission texture failed: ' + name))));
  const tier = high ? 'high' : 'low';
  const files = high
    ? [[earthU.tMap, EARTH_TEX.color[tier], true], [marsU.tMap, MARS_TEX.color[tier], true], [earthU.tNorm, EARTH_TEX.normal, false], [marsU.tNorm, MARS_TEX.normal, false], [earthU.tClouds, EARTH_TEX.clouds, false]]
    : [[earthU.tMap, EARTH_TEX.color[tier], true], [marsU.tMap, MARS_TEX.color[tier], true]];
  const loaded = [];

  const ready = (async () => {
    measure();
    const texs = await Promise.all(files.map(([, name, srgb]) => fetchTex(name, srgb)));
    if (dead) { texs.forEach(t => t.dispose()); return false; }
    for (let i = 0; i < files.length; i++) {
      renderer.initTexture(texs[i]);                  // upload before the swap; one per frame so it never stalls a scroll
      files[i][0].value = texs[i]; loaded.push(texs[i]);
      await nextFrame();
    }
    if (dead) return false;
    // every program is compiled before the first visible frame (ship shown for the compile, hidden again after)
    updatePlanets(); ship.visible = true; for (const m of shipMats) m.opacity = 1; plumeU.uA.value = 1;
    await renderer.compileAsync(scene, camera);
    if (dead) return false;
    draw(0);                                          // the first real frame, hidden rocket included
    await nextFrame();
    if (dead) return false;
    isReady = true; sync();
    return true;
  })();
  ready.catch(() => {});

  // QA: render now and read the canvas back (RGBA, bottom-up, premultiplied). glow:false drops the atmosphere so the disc edge is exact.
  function capture({ glow = true, noShip = false } = {}) {
    if (!isReady) return null;
    const gl = renderer.getContext(), w = gl.drawingBufferWidth, h = gl.drawingBufferHeight;
    earthU.uGlow.value = marsU.uGlow.value = glow ? 1 : 0;
    const sv = ship.visible; if (noShip) ship.visible = false;
    renderer.render(scene, camera);
    ship.visible = sv;
    const data = new Uint8Array(w * h * 4); gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, data);
    earthU.uGlow.value = marsU.uGlow.value = 1;
    return { w, h, data };
  }

  function dispose() {
    if (dead) return;
    dead = true; isReady = false; enabled = false; sync();
    io.disconnect(); ro.disconnect(); removeEventListener('load', onLoad);
    quadGeo.dispose(); plumeGeo.dispose();
    for (const P of pl) P.mesh.material.dispose();
    plume.material.dispose();
    shipModel.traverse(o => { if (o.isMesh) o.geometry.dispose(); });
    for (const m of shipMats) m.dispose();
    for (const t of loaded) t.dispose();
    envRT.dispose();
    renderer.dispose(); renderer.forceContextLoss();
    canvas.remove();
    // the poster fallback shows the full authored line again
    if (pathEl) for (const k of ['vectorEffect', 'strokeWidth', 'strokeDasharray', 'strokeDashoffset']) pathEl.style[k] = '';
  }

  return {
    ready, canvas, renderer, stats, capture, dispose,
    start() { enabled = true; sync(); }, stop() { enabled = false; sync(); },
    resize() { if (!dead) measure(); },
  };
}
