// D6.1 footer texture streamer. Mars dusk settlement. Files in ./assets/tex/ (see CREDITS.md); the dome_glass smudge
// map was copied in from the prototype's d6 set, so every file lives under this tree. Placeholders are bound at build time so programs are final,
// then swap refs as roles land (one GPU upload per frame, failures resolve null, never blocks the first frame).
// Each role set: { map, normalMap, roughnessMap, aoMap, metalnessMap, texScale } (ORM: R ao, G rough, B metal).
// texScale = metres per UV repeat (number or [u, v]). Roles:
//   regolith       dark red dusty ground, fine pebbles (texScale 4). Scan.
//   mars_rock      boulders / ridge rock, dusty red-brown basalt (texScale 3, box or triplanar UV). Scan.
//   dome_glass     { roughnessMap, dirtMap } same texture: R = dust/smudge mask, G = roughness (texScale 1.5)
//   dome_frame     off-white painted strut metal, dust + fine scratches (texScale 0.5)
//   foliage        dense leaf canopy for the greenery inside the dome (texScale 0.6)
//   habitat_panel  off-white cladding, 2 x 2 panels per tile with seams, rivets, dust runs down v (texScale [2, 2])
//   stainless      Starship stainless, brushed along u, one circumferential weld at v 0.5 (texScale [1, 1.8]: u around, v up)
//   rover_paint    white rover paint, chips to primer / alloy, dust (texScale 1)
//   dusk_sky       { map (equirect), envMap (PMREM), intensity } warm dusk glow at -Z just under the ridge, near-black zenith.
//                  HDR on high, LDR on low. Bind envPlaceholder() as scene.environment first: same PMREM size, no recompile.
// Low tier ships a 512 subset: regolith, mars_rock, dome_glass, foliage (c), habitat_panel (c), stainless (n), dusk_sky.
// Roles missing on a tier stay on their placeholders (flat material look).

export const TEX_ROLES = ['regolith', 'mars_rock', 'dome_glass', 'dome_frame', 'foliage', 'habitat_panel', 'stainless', 'rover_paint', 'dusk_sky'];

// [texScale, high {c, n, o}, low {c, n, o} | null], paths relative to footer/assets/tex/
const M = {
  regolith: [4, { c: '1k/regolith_c', n: '1k/regolith_n', o: '512/regolith_orm' }, { c: '512/regolith_c', n: '512/regolith_n', o: '256/regolith_orm' }],
  mars_rock: [3, { c: '1k/mars_rock_c', n: '1k/mars_rock_n', o: '512/mars_rock_orm' }, { c: '512/mars_rock_c', n: '512/mars_rock_n' }],
  dome_glass: [1.5, { o: '512/glass_smudge_orm' }, { o: '512/glass_smudge_orm' }],
  dome_frame: [0.5, { c: '256/dome_frame_c', n: '512/dome_frame_n', o: '256/dome_frame_orm' }, null],
  foliage: [0.6, { c: '512/foliage_c', n: '512/foliage_n', o: '256/foliage_orm' }, { c: '256/foliage_c' }],
  habitat_panel: [[2, 2], { c: '512/habitat_panel_c', n: '512/habitat_panel_n', o: '512/habitat_panel_orm' }, { c: '256/habitat_panel_c' }],
  stainless: [[1, 1.8], { c: '512/stainless_c', n: '512/stainless_n', o: '256/stainless_orm' }, { n: '256/stainless_n' }],
  rover_paint: [1, { c: '512/rover_paint_c', n: '512/rover_paint_n', o: '256/rover_paint_orm' }, null],
};
const SKY = { hdr: 'dusk_sky.hdr', ldr: '256/dusk_sky_ldr.webp', ldrScale: 2 }; // LDR stores linear * 0.5
const SKY_W = 256, SKY_H = 128; // every sky source is this size, so all PMREMs share one cubeUV layout

export function texFiles(quality = 'high') {
  const lo = quality === 'low', out = [];
  for (const r of TEX_ROLES) {
    if (r === 'dusk_sky') { out.push(lo ? SKY.ldr : SKY.hdr); continue; }
    const s = M[r][lo ? 2 : 1]; if (!s) continue;
    for (const k of ['c', 'n', 'o']) if (s[k]) out.push(s[k] + '.webp');
  }
  return out;
}

// 1x1 placeholders for material slots (white map / ORM, flat normal). Bind at build time, swap refs later.
const PH = new WeakMap();
export function placeholders(THREE) {
  let p = PH.get(THREE); if (p) return p;
  const mk = (r, g, b, srgb) => { const t = new THREE.DataTexture(new Uint8Array([r, g, b, 255]), 1, 1); t.wrapS = t.wrapT = THREE.RepeatWrapping; if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.needsUpdate = true; return t; };
  const w = mk(255, 255, 255);
  p = { map: mk(255, 255, 255, true), normalMap: mk(128, 128, 255), roughnessMap: w, aoMap: w, metalnessMap: w, dirtMap: mk(0, 255, 0) };
  PH.set(THREE, p); return p;
}

// Placeholder environment: flat dark warm PMREM with the same cubeUV size as dusk_sky, so swapping
// scene.environment (or material.envMap) to the real one is a ref swap. Caller disposes it.
export function envPlaceholder(THREE, renderer, rgb = [0.03, 0.016, 0.009]) {
  const d = new Float32Array(SKY_W * SKY_H * 4);
  for (let i = 0; i < SKY_W * SKY_H; i++) { d[i * 4] = rgb[0]; d[i * 4 + 1] = rgb[1]; d[i * 4 + 2] = rgb[2]; d[i * 4 + 3] = 1; }
  const t = new THREE.DataTexture(d, SKY_W, SKY_H, THREE.RGBAFormat, THREE.FloatType);
  t.mapping = THREE.EquirectangularReflectionMapping; t.needsUpdate = true;
  const g = new THREE.PMREMGenerator(renderer); const rt = g.fromEquirectangular(t); g.dispose(); t.dispose();
  return rt.texture;
}

export function loadFooterTextures({ THREE, renderer, quality = 'high', base, roles = TEX_ROLES } = {}) {
  const lo = quality === 'low';
  const want = TEX_ROLES.filter(r => roles.includes(r));
  // base = the footer/ dir (per CONTRACT) or the tex dir itself
  let root = String(base || new URL('./', import.meta.url)); if (!root.endsWith('/')) root += '/';
  if (!/assets\/tex\/$/.test(root)) root += 'assets/tex/';
  const url = rel => new URL(rel, root).href;
  const sets = new Map(), listeners = new Set(), owned = [];
  let disposed = false;
  const maxAniso = renderer?.capabilities?.getMaxAnisotropy?.() || 1;
  const aniso = Math.min(lo ? 4 : 8, maxAniso);

  // one upload (or PMREM build) per frame; timer fallback when rAF is throttled (hidden tab)
  const queue = []; let pumping = false;
  const nextFrame = () => new Promise(res => { let done = false; const go = () => { if (!done) { done = true; res(); } };
    if (typeof requestAnimationFrame === 'function') requestAnimationFrame(go); setTimeout(go, 100); });
  const upload = job => new Promise((res, rej) => { queue.push({ job, res, rej }); pump(); });
  async function pump() {
    if (pumping) return; pumping = true;
    while (queue.length) {
      await nextFrame();
      const q = queue.shift();
      if (disposed) { q.res(null); continue; }
      try { q.res(q.job()); } catch (e) { q.rej(e); }
    }
    pumping = false;
  }

  // bounded parallel fetch + decode
  let active = 0; const waiting = [];
  const slot = () => active < 4 ? (active++, Promise.resolve()) : new Promise(r => waiting.push(r));
  const release = () => { const n = waiting.shift(); if (n) n(); else active--; };
  const loader = new THREE.TextureLoader(); loader.setCrossOrigin('anonymous');

  async function loadImageTex(file, srgb) {
    await slot();
    let tex;
    try {
      tex = await new Promise((res, rej) => loader.load(url(file), res, undefined, () => rej(new Error('tex 404 ' + file))));
      if (tex.image?.decode) await tex.image.decode().catch(() => {});
    } finally { release(); }
    if (disposed) { tex.dispose(); return null; }
    tex.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.anisotropy = aniso;
    tex.generateMipmaps = true; tex.minFilter = THREE.LinearMipmapLinearFilter; tex.magFilter = THREE.LinearFilter;
    tex.name = file; tex.needsUpdate = true;
    return upload(() => { renderer?.initTexture?.(tex); owned.push(tex); return tex; });
  }

  function publish(role, set) {
    sets.set(role, set);
    for (const fn of listeners) { try { fn(role, set); } catch (e) { console.warn('foot-tex listener', e); } }
  }

  async function loadRole(role) {
    const def = M[role], s = def[lo ? 2 : 1];
    if (!s) return null;
    const [c, n, o] = await Promise.all([
      s.c ? loadImageTex(s.c + '.webp', true).catch(warn) : null,
      s.n ? loadImageTex(s.n + '.webp', false).catch(warn) : null,
      s.o ? loadImageTex(s.o + '.webp', false).catch(warn) : null,
    ]);
    if (!c && !n && !o) return null;
    const set = role === 'dome_glass' ? { roughnessMap: o, dirtMap: o } : { map: c, normalMap: n, roughnessMap: o, aoMap: o, metalnessMap: o };
    for (const k in set) if (!set[k]) delete set[k];
    set.texScale = def[0];
    return set;
  }

  async function loadSky() {
    let tex = null, intensity = 1;
    if (!lo) {
      try {
        await slot();
        try {
          const { RGBELoader } = await import('three/addons/loaders/RGBELoader.js');
          tex = await new RGBELoader().setDataType(THREE.HalfFloatType).loadAsync(url(SKY.hdr));
        } finally { release(); }
      } catch (e) { warn(e); }
    }
    if (!tex) { tex = await loadImageTex(SKY.ldr, true).catch(warn); intensity = SKY.ldrScale; }
    if (!tex || disposed) return null;
    tex.mapping = THREE.EquirectangularReflectionMapping;
    if (!owned.includes(tex)) owned.push(tex);
    const envMap = renderer ? await upload(() => {
      const g = new THREE.PMREMGenerator(renderer); const rt = g.fromEquirectangular(tex); g.dispose(); owned.push(rt); return rt.texture;
    }).catch(warn) : null;
    const set = { map: tex, intensity, texScale: 1 }; if (envMap) set.envMap = envMap;
    return set;
  }

  function warn(e) { if (!disposed) console.warn('foot-tex:', e?.message || e); return null; }

  // sky first: reflections on glass / stainless matter most at a glance
  const order = [...want].sort((a, b) => (b === 'dusk_sky') - (a === 'dusk_sky'));
  const jobs = order.map(role => (role === 'dusk_sky' ? loadSky() : loadRole(role))
    .catch(warn).then(set => { if (set && !disposed) publish(role, set); return set; }));
  const inTier = role => role === 'dusk_sky' || !!M[role][lo ? 2 : 1];
  const ready = Promise.all(jobs).then(r => ({
    loaded: order.filter((_, i) => r[i]),
    failed: order.filter((role, i) => !r[i] && inTier(role)),
    skipped: TEX_ROLES.filter(role => !want.includes(role) || !inTier(role)),
  }));

  return {
    ready,
    roles: want,
    get: role => sets.get(role) || null,
    // fn(role, set) runs as each role lands (and now for those already in); reapply idempotently
    onReady(fn) {
      listeners.add(fn);
      if (sets.size) queueMicrotask(() => { for (const [r, s] of sets) if (listeners.has(fn)) fn(r, s); });
      return () => listeners.delete(fn);
    },
    files: () => texFiles(quality),
    dispose() { disposed = true; listeners.clear(); for (const t of owned) t.dispose?.(); owned.length = 0; sets.clear(); },
  };
}
