// TerraFirma homepage film: mounts the scroll film (Austin -> Earth -> Mars -> colony -> launch) into the Webflow film section.
// Imported lazily by home3d.js. Needs an importmap for "three" (0.160.0) and "three/addons/".
//
// DOM contract (built in Webflow, see README):
//   section[data-section="film"][data-three="film"]   position: relative; its height is the film's scroll track
//   [data-three-mount="film"]                          sticky, 100svh, overflow hidden; the canvas is added inside it
//   [data-sol] [data-sol-value]                        SOL readout (opacity on the root, the number into the value)
//   [data-scene="austin|earth|mars-title|reindustrialize|colony|launch"]   the text scenes, read for layout only
//   [data-split="left|right"] inside the mars-title heading: the words the planet sits between (the film sets a transform on them: pulled in
//                                                             beside the disc side by side, moved apart or together when stacked)
// Bails (the 2D text scenes stay, no canvas, no flag) on reduced motion, no WebGL2, ?film=0, or any error. While running it sets
// <html data-film3d="on"> (so the page's 2D script stands down), fires window "tf:film-ready", then "tf:film" { p, beat } as it moves.
// If it fails after setting the flag it removes it and fires "tf:film-fail". Switches: ?film=0, ?q=low|high, ?qa (window.TFFilm),
// ?grade (dev look panel, film/dial.js: only then is it fetched; ?grade=lil forces the lil-gui fallback).

import * as stage from '../stage.js';

const qs = new URLSearchParams(location.search);
const BASE = new URL('./', import.meta.url).href;       // film/ : modules and assets, pinned with this file's SHA
const FADE_MS = 700;

const root = document.querySelector('section[data-section="film"][data-three="film"]') || document.querySelector('section[data-three="film"]');
const mount = root && root.querySelector('[data-three-mount="film"]');
const scene = k => root && root.querySelector(`[data-scene="${k}"]`);
const scenes = root && { austin: scene('austin'), earth: scene('earth'), title: scene('mars-title'), reind: scene('reindustrialize'), colony: scene('colony'), launch: scene('launch') };

function hasWebGL2() {
  try {
    const gl = document.createElement('canvas').getContext('webgl2');
    gl?.getExtension('WEBGL_lose_context')?.loseContext();   // free the probe context right away
    return !!gl;
  } catch (_) { return false; }
}
function pickQuality() {
  const q = qs.get('q');
  if (q === 'low' || q === 'high') return q;
  // touch screen whose short side is phone or small tablet sized: the short side, so a phone held sideways (844 x 390) stays low
  const coarse = matchMedia('(pointer: coarse)').matches && Math.min(innerWidth, innerHeight, screen.width || 1e4, screen.height || 1e4) < 820;
  const weak = navigator.hardwareConcurrency != null && navigator.hardwareConcurrency <= 2;
  const saveData = !!navigator.connection?.saveData;
  return coarse || weak || saveData ? 'low' : 'high';
}
const missing = scenes && Object.keys(scenes).filter(k => !scenes[k]);
if (root && missing.length) console.warn('TerraFirma film: missing scenes', missing, '- leaving the 2D scenes.');
const bail = !root || !mount || missing.length || qs.get('film') === '0' || matchMedia('(prefers-reduced-motion: reduce)').matches || !hasWebGL2();

if (!bail) {
  const html = document.documentElement;
  let film = null, booted = false, dead = false, ready = false, visible = false, gsapTick = null, lastTick = 0, skipped = 0;
  const cleanups = [];
  const quality = pickQuality();
  html.dataset.film3d = 'on';   // as early as possible: the page's 2D script stands down

  // how much of the viewport the sticky canvas covers (the CTA and footer scroll up over it past the track end)
  function coverage() { const r = mount.getBoundingClientRect(), vh = innerHeight || 1; return Math.max(0, Math.min(vh, r.bottom) - Math.max(0, r.top)) / vh; }
  function tick() {
    const now = performance.now(), dt = lastTick ? (now - lastTick) / 1000 : 1 / 60; lastTick = now;
    if (!film) return;
    const v = coverage(); stage.report('film', v);
    if (v <= 0) { skipped += dt; film.setOverlap(false); return; }   // fully covered (the observer still calls a track whose edge only touches the viewport visible)
    const both = stage.overlap();
    film.setOverlap(both);
    film.setSeam(stage.seam());   // the footer's seam colour, null when there is no footer scene (then the section background)
    if (!stage.turn('film')) { skipped += dt; return; }   // the footer's frame: the film's clock catches up on its next one
    film.step(dt + skipped); skipped = 0;
  }
  function sync() {
    if (!film || !ready) return;
    if (visible) {
      const ext = !!window.gsap?.ticker;
      if (ext) film.start(true);
      else film.start(false, tick);   // no gsap: the film's own rAF loop still goes through tick (coverage, turns)
      if (ext && !gsapTick) { lastTick = 0; skipped = 0; gsapTick = tick; window.gsap.ticker.add(gsapTick); }
    } else {
      film.stop(); stage.report('film', 0); film.setOverlap(false);
      if (gsapTick) { window.gsap.ticker.remove(gsapTick); gsapTick = null; }
    }
  }
  function fail(err) {
    if (dead) return;
    dead = true; ready = false;
    console.warn('TerraFirma film: leaving the 2D scenes.', err);
    if (gsapTick) { window.gsap?.ticker.remove(gsapTick); gsapTick = null; }
    stage.report('film', 0);
    for (const fn of cleanups.splice(0)) { try { fn(); } catch (_) { /* best effort */ } }
    try { film?.dispose(); } catch (_) { /* best effort */ }
    film = null; if (window.TFFilm) window.TFFilm = undefined;
    delete html.dataset.film3d;
    window.dispatchEvent(new CustomEvent('tf:film-fail'));
  }

  // asset urls for this tier, from the manifest next to them (only files that exist are listed)
  async function resolveFiles() {
    const res = await fetch(new URL('assets/manifest.json', BASE)); if (!res.ok) throw new Error('film manifest ' + res.status);
    const t = (await res.json()).tiers[quality], u = rel => new URL('assets/' + rel, BASE).href;
    const tex = {}; for (const k in t.tex) tex[k] = u(t.tex[k]);
    const jezero = {}; for (const k in t.jezero) jezero[k] = u(t.jezero[k]);
    // large terrain and aerial maps are Webflow assets, named on the film section so the client owns them:
    //   data-film-ortho="<site 800 m> <8 km> <80 km>"   data-film-jezero-dtm / -hi-bump / -ctx-bump
    const d = root.dataset, list = s => (s || '').trim().split(/\s+/).filter(Boolean);
    const ortho = list(d.filmOrtho).length ? list(d.filmOrtho) : t.ortho.map(u);
    if (d.filmJezeroDtm) jezero.dtm = d.filmJezeroDtm;
    if (d.filmJezeroHiBump) jezero.hiBump = d.filmJezeroHiBump;
    if (d.filmJezeroCtxBump) jezero.ctxBump = d.filmJezeroCtxBump;
    return { tex, stars: u(t.stars), milky: u(t.milky), ortho, jezero };
  }

  async function boot() {
    if (booted || dead) return;
    booted = true;
    try {
      const [THREE, mod, files] = await Promise.all([import('three'), import('./film.js'), resolveFiles()]);
      if (dead) return;
      film = mod.createFilm({ THREE, host: mount, section: root, scenes, quality, files,
        sol: { root: mount.querySelector('[data-sol]'), value: mount.querySelector('[data-sol-value]') } });
      const cv = film.canvas;
      Object.assign(cv.style, { opacity: '0', transition: `opacity ${FADE_MS}ms ease` });
      cv.addEventListener('webglcontextlost', e => { e.preventDefault(); fail(new Error('webgl context lost')); });
      if (qs.has('qa')) window.TFFilm = { film, quality, get state() { return film?.state; } };
      const io = new IntersectionObserver(es => { visible = es[es.length - 1].isIntersecting; sync(); });   // render only while the track is on screen
      io.observe(root); cleanups.push(() => io.disconnect());
      await film.ready;
      if (dead) return;
      ready = true;
      sync();
      void cv.offsetWidth;
      cv.style.opacity = '1';
      window.dispatchEvent(new CustomEvent('tf:film-ready'));
      if (qs.has('grade')) import('./dial.js').then(m => m.mountDial({ film, section: root, prefer: qs.get('grade') }))
        .then(d => { if (dead) d.destroy(); else cleanups.push(() => d.destroy()); }).catch(err => console.warn('TerraFirma dial: no panel.', err));
    } catch (err) { fail(err); }
  }

  // lazy trigger: within ~1.5 viewports; two frames and an idle slot so the film never competes with first paint
  const idle = (fn, timeout) => (typeof requestIdleCallback === 'function' ? requestIdleCallback(fn, { timeout }) : setTimeout(fn, 200));
  const near = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { near.disconnect(); requestAnimationFrame(() => requestAnimationFrame(() => idle(boot, 1000))); } }, { rootMargin: `${Math.round(innerHeight * 1.5)}px 0px` });
  near.observe(root);
}
