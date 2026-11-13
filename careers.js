// TerraFirma careers page: mounts the 3D footer into the Webflow footer.
// Load with <script type="module"> after an importmap for "three" (0.160.0) and "three/addons/".
//
// DOM contract (built in Webflow):
//   [data-foot]         footer root (position: relative; overflow: hidden)
//   [data-foot-canvas]  absolute mount that holds the poster <img>; the WebGL canvas is added inside it
//   [data-foot-logo]    wrapper around the logotype svg (the halo and glow sit behind its rect)
// Anything that goes wrong leaves the poster in place.
//
// Also mounts the Mission section (Earth, Mars and a Starship on an SVG arc) when [data-mission] exists:
//   [data-mission]               section root (position: relative; overflow: hidden)
//   [data-mission-canvas]        absolute inset-0 empty mount; the transparent WebGL canvas is added inside it
//   [data-mission-earth|mars]    square boxes holding a poster <img>; each sphere renders exactly over its box
//   [data-mission-arc] path[data-mission-path]   the rocket's arc, left to right
//   img[data-mission-billboard]  the static 2D rocket on the arc: fallback for the 3D ship, fades out with the posters
// Posters fade out once the first real frame is drawn. Switches: ?mission=0 keeps the posters.

import * as stage from './stage.js';

const BASE = new URL('./footer/', import.meta.url).href;   // footer modules and textures, pinned with this file's SHA
const FADE_MS = 600;
const qs = new URLSearchParams(location.search);

const root = document.querySelector('[data-foot]');
const mount = root && (root.querySelector('[data-foot-canvas]') || root);
const logoEl = root && root.querySelector('[data-foot-logo]');
const poster = mount && mount.querySelector('img');

// ---------------------------------------------------------------- bail conditions (poster stays)
let gl2Probe;   // one probe context for the footer and the mission
function hasWebGL2() {
  if (gl2Probe !== undefined) return gl2Probe;
  return gl2Probe = probeWebGL2();
}
function probeWebGL2() {
  try {
    const gl = document.createElement('canvas').getContext('webgl2');
    gl?.getExtension('WEBGL_lose_context')?.loseContext();   // free the probe context right away
    return !!gl;
  } catch (_) { return false; }
}
const bail = !root || qs.get('foot') === '0' || matchMedia('(prefers-reduced-motion: reduce)').matches || !hasWebGL2();

// ---------------------------------------------------------------- quality tier
function pickQuality() {
  const q = qs.get('q');
  if (q === 'low' || q === 'high') return q;
  const coarse = matchMedia('(pointer: coarse)').matches && innerWidth < 820;
  const weak = navigator.hardwareConcurrency != null && navigator.hardwareConcurrency <= 2;
  const saveData = !!navigator.connection?.saveData;
  return coarse || weak || saveData ? 'low' : 'high';
}

// homepage: the film's canvas sits right above the footer and shares the GPU through the hand-off (stage.js). There the footer
// renders at a lighter pixel ratio while both are on screen, takes turns with the film, and melts its top into the seam colour.
// Pages with the footer only (Careers, legal) never set any of it.
const FILM_PAGE = !!document.querySelector('section[data-three="film"]');
const OVERLAP_PR = 1.25;
const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

if (!bail) {
  let footer = null, booted = false, dead = false, ready = false, visible = false;
  let cur = 0, target = 0, lastTick = 0, firstSnap = true, docTop = 0, docH = 0;
  const cleanups = [];
  const quality = pickQuality();

  const scrollY = () => (window.lenis && typeof window.lenis.scroll === 'number' ? window.lenis.scroll : window.scrollY);

  // ---------------------------------------------------------------- footer geometry and progress
  // p = 0 when the footer top meets the viewport bottom, 1 when its bottom meets the viewport bottom
  // (that is "fully in view" for a footer shorter than the viewport, and the end of the scroll-in for a taller one).
  function measureDoc() { const r = root.getBoundingClientRect(); docTop = r.top + window.scrollY; docH = r.height; }
  function targetProgress() {
    const vh = innerHeight;
    let top, h;
    if (window.lenis) { top = docTop - scrollY(); h = docH; }   // Lenis: its own (animated) scroll, cached layout
    else { const r = root.getBoundingClientRect(); top = r.top; h = r.height; }
    return h > 0 ? Math.min(1, Math.max(0, (vh - top) / h)) : 0;
  }

  function logoRect() {
    if (!footer || !logoEl) return;
    const r = logoEl.getBoundingClientRect(), m = mount.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) footer.setLogoRect({ x: r.left - m.left, y: r.top - m.top, w: r.width, h: r.height });
  }
  function onResize() { measureDoc(); if (!footer) return; footer.resize(); logoRect(); }

  // ---------------------------------------------------------------- tick (gsap.ticker when present, else rAF)
  let raf = 0, gsapTick = null;
  // how much of the viewport the footer covers, and how much the seam shows (full while a fair share of the film is still above)
  function coverage() {
    const vh = innerHeight || 1;
    let top, h;
    if (window.lenis) { top = docTop - scrollY(); h = docH; } else { const r = root.getBoundingClientRect(); top = r.top; h = r.height; }
    return Math.max(0, Math.min(vh, top + h) - Math.max(0, top)) / vh;
  }
  const seamK = () => sstep(0, 0.15, stage.vis('film'));
  function overlapState() {
    if (!FILM_PAGE || !footer) return;
    stage.report('foot', visible ? coverage() : 0);
    footer.setSeam(seamK());
    footer.capPixelRatio(stage.vis('film') > 0 ? OVERLAP_PR : null);   // lifted once the film is gone (applied on a quiet frame)
  }
  function tick() {
    if (!footer || !ready || !visible) return;
    const now = performance.now(), dt = lastTick ? Math.min(0.1, (now - lastTick) / 1000) : 1 / 60; lastTick = now;
    overlapState();
    target = targetProgress();
    if (firstSnap) { cur = target; firstSnap = false; }   // arriving by anchor jump: no long sunrise from 0
    else cur += (target - cur) * (1 - Math.exp(-dt * 8));   // frame-rate independent lerp
    footer.setProgress(cur);
  }
  function startTick() {
    if (gsapTick || raf) return;
    lastTick = 0;
    if (window.gsap?.ticker) { gsapTick = tick; window.gsap.ticker.add(gsapTick); }
    else { const loop = () => { raf = requestAnimationFrame(loop); tick(); }; raf = requestAnimationFrame(loop); }
  }
  function stopTick() {
    if (gsapTick) { window.gsap.ticker.remove(gsapTick); gsapTick = null; }
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
  }
  // render only while the footer is on screen
  function sync() {
    if (!footer || !ready) return;
    if (visible) { overlapState(); footer.start(); startTick(); }
    else { footer.stop(); stopTick(); if (FILM_PAGE) stage.report('foot', 0); }
  }

  // ---------------------------------------------------------------- failure: dispose, keep the poster
  function fail(err) {
    if (dead) return;
    dead = true; ready = false;
    console.warn('TerraFirma footer: falling back to the poster.', err);
    stopTick();
    if (FILM_PAGE) { stage.report('foot', 0); stage.seam(null); }
    for (const fn of cleanups.splice(0)) { try { fn(); } catch (_) { /* best effort */ } }
    try { footer?.dispose(); } catch (_) { /* best effort */ }
    footer = null; window.TFFooter = undefined;
    if (poster) poster.style.visibility = '';
  }

  // ---------------------------------------------------------------- boot (lazy)
  async function boot() {
    if (booted || dead) return;
    booted = true;
    try {
      const [THREE, mod] = await Promise.all([import('three'), import('./footer/footer3d.js')]);
      if (dead) return;
      footer = mod.createFooter({ THREE, host: mount, quality, base: BASE,   // adds its own absolute-fill canvas to the mount
        ...(FILM_PAGE ? { gate: () => stage.turn('foot'), prCap: OVERLAP_PR } : {}) });   // homepage: warmed at the overlap ratio
      window.TFFooter = { footer, quality };   // QA only
      const cv = footer.renderer.domElement;
      Object.assign(cv.style, { opacity: '0', transition: `opacity ${FADE_MS}ms ease`, zIndex: '1', pointerEvents: 'none' });   // above the poster, never blocks clicks
      cv.addEventListener('webglcontextlost', e => { e.preventDefault(); fail(new Error('webgl context lost')); });

      // layout hooks
      measureDoc();
      const ro = new ResizeObserver(onResize);
      ro.observe(root); ro.observe(document.body);   // body catches layout shifts above the footer (images, pinned sections)
      cleanups.push(() => ro.disconnect());
      document.fonts?.ready.then(() => { if (!dead) { measureDoc(); logoRect(); } });
      addEventListener('load', onResize); cleanups.push(() => removeEventListener('load', onResize));

      // mouse-only pointer parallax
      const onMove = e => { if (e.pointerType === 'mouse' && footer) footer.setPointer(e.clientX / innerWidth * 2 - 1, e.clientY / innerHeight * 2 - 1); };
      addEventListener('pointermove', onMove, { passive: true }); cleanups.push(() => removeEventListener('pointermove', onMove));

      // visibility gate for start() / stop()
      const io = new IntersectionObserver(es => { visible = es[es.length - 1].isIntersecting; sync(); });
      io.observe(root); cleanups.push(() => io.disconnect());

      if (!(await footer.ready)) { if (!dead) fail(new Error('footer disposed before ready')); return; }
      if (dead) return;
      ready = true;
      // homepage: the film fades its lower edge into this, the footer's sky just above the horizon, weighted like the footer's own top
      if (FILM_PAGE) stage.seam(() => { const k = footer && !dead ? seamK() : 0; return k > 0 ? footer.seamColor().map(v => v * k) : null; });
      logoRect();
      tick();   // seed the first progress value (no-op until visible)
      sync();
      // crossfade: canvas 0 -> 1 over FADE_MS, then hide the poster
      void cv.offsetWidth;
      cv.style.opacity = '1';
      setTimeout(() => { if (!dead && poster) poster.style.visibility = 'hidden'; }, FADE_MS + 50);
    } catch (err) { fail(err); }
  }

  // ---------------------------------------------------------------- lazy trigger: within 2 viewports, or idle after load
  // Both paths wait two frames and an idle slot so the footer never competes with first paint.
  const idle = (fn, timeout) => (typeof requestIdleCallback === 'function' ? requestIdleCallback(fn, { timeout }) : setTimeout(fn, 200));
  const schedule = () => requestAnimationFrame(() => requestAnimationFrame(() => idle(boot, 1000)));
  const near = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { near.disconnect(); schedule(); } }, { rootMargin: `${innerHeight * 2}px 0px` });
  near.observe(root);
  if (document.readyState === 'complete') idle(boot, 3000);
  else addEventListener('load', () => idle(boot, 3000), { once: true });
}

// =================================================================================================
// Mission section
// =================================================================================================
const mRoot = document.querySelector('[data-mission]');
const mBail = !mRoot || qs.get('mission') === '0' || matchMedia('(prefers-reduced-motion: reduce)').matches || !hasWebGL2();

if (!mBail) {
  const MBASE = new URL('./mission/', import.meta.url).href;
  const posters = [...mRoot.querySelectorAll('[data-mission-earth] img, [data-mission-mars] img, [data-mission-billboard]')];
  let mission = null, mBooted = false, mDead = false;
  const quality = pickQuality();
  const mCleanups = [];

  // failure: dispose, bring the posters back
  function mFail(err) {
    if (mDead) return;
    mDead = true;
    console.warn('TerraFirma mission: falling back to the posters.', err);
    for (const fn of mCleanups.splice(0)) { try { fn(); } catch (_) { /* best effort */ } }
    try { mission?.dispose(); } catch (_) { /* best effort */ }
    mission = null; window.TFMission = undefined;
    for (const img of posters) { img.style.transition = 'none'; img.style.opacity = ''; img.style.visibility = ''; }
  }

  async function mBoot() {
    if (mBooted || mDead) return;
    mBooted = true;
    try {
      const [THREE, mod] = await Promise.all([import('three'), import('./mission/mission3d.js')]);
      if (mDead) return;
      mission = mod.createMission({ THREE, section: mRoot, quality, base: MBASE + 'assets/' });   // adds its own absolute-fill canvas to the mount
      window.TFMission = { mission, quality };   // QA only
      const cv = mission.canvas;
      Object.assign(cv.style, { opacity: '0', transition: `opacity ${FADE_MS}ms ease`, zIndex: '1', pointerEvents: 'none' });
      cv.addEventListener('webglcontextlost', e => { e.preventDefault(); mFail(new Error('webgl context lost')); });
      if (!(await mission.ready)) { if (!mDead) mFail(new Error('mission disposed before ready')); return; }
      if (mDead) return;
      mission.start();   // renders only while the section is on screen
      // crossfade: canvas 0 -> 1 and posters 1 -> 0 over FADE_MS
      for (const img of posters) img.style.transition = `opacity ${FADE_MS}ms ease`;
      void cv.offsetWidth;
      cv.style.opacity = '1';
      for (const img of posters) img.style.opacity = '0';
    } catch (err) { mFail(err); }
  }

  // lazy trigger: within 2 viewports, or idle after load (same pattern as the footer)
  const mIdle = (fn, timeout) => (typeof requestIdleCallback === 'function' ? requestIdleCallback(fn, { timeout }) : setTimeout(fn, 200));
  const mSchedule = () => requestAnimationFrame(() => requestAnimationFrame(() => mIdle(mBoot, 1000)));
  const mNear = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { mNear.disconnect(); mSchedule(); } }, { rootMargin: `${innerHeight * 2}px 0px` });
  mNear.observe(mRoot);
  if (document.readyState === 'complete') mIdle(mBoot, 3000);
  else addEventListener('load', () => mIdle(mBoot, 3000), { once: true });
}
