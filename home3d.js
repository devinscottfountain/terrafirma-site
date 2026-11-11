// TerraFirma homepage 3D: mounts the Solutions scene (dot grid, machines, dig game) into the Webflow section.
// Load with <script type="module"> after an importmap for "three" (0.160.0).
//
// DOM contract (built in Webflow, see README):
//   section[data-three="solutions"]#solutions   position: relative; overflow: hidden
//   [data-three-mount="solutions"]              absolute inset-0 empty div, aria-hidden; the canvas is added inside it
//   [data-solutions-spacer]                     the box the 3D action is framed into (between the heading and the tabs)
//   [data-tabs="solutions"] [data-tab]          owned by the page script, which dispatches window "tf:solutions"
//                                               with detail.mode = 'orchestration' | 'planning' | 'execution'
// The canvas only listens to tf:solutions; it never owns the tabs. Mode changes only on a tab click (no scroll scrubbing).
// Anything that goes wrong leaves the section as it is (no canvas). Switches: ?sol=0 bails, ?q=low|high forces a tier,
// ?qa exposes window.TFSolutions.

const qs = new URLSearchParams(location.search);
const MODES = { planning: 0, orchestration: 1, execution: 2 };   // -> scene mode index (0 plan, 1 control, 2 exec)
const FADE_MS = 600;

const root = document.querySelector('section[data-three="solutions"]');
const mount = root && root.querySelector('[data-three-mount="solutions"]');
const spacer = root && root.querySelector('[data-solutions-spacer]');

// ---------------------------------------------------------------- bail conditions (section stays as is)
function hasWebGL2() {
  try {
    const gl = document.createElement('canvas').getContext('webgl2');
    gl?.getExtension('WEBGL_lose_context')?.loseContext();   // free the probe context right away
    return !!gl;
  } catch (_) { return false; }
}
const bail = !root || !mount || qs.get('sol') === '0' || matchMedia('(prefers-reduced-motion: reduce)').matches || !hasWebGL2();

// ---------------------------------------------------------------- quality tier (same logic as careers.js)
function pickQuality() {
  const q = qs.get('q');
  if (q === 'low' || q === 'high') return q;
  const coarse = matchMedia('(pointer: coarse)').matches && innerWidth < 820;
  const weak = navigator.hardwareConcurrency != null && navigator.hardwareConcurrency <= 2;
  const saveData = !!navigator.connection?.saveData;
  return coarse || weak || saveData ? 'low' : 'high';
}

if (!bail) {
  let sol = null, booted = false, dead = false, ready = false, visible = false;
  let wantMode = MODES.orchestration;   // default tab; the page script's first tf:solutions event overrides it
  let gsapTick = null, lastTick = 0;
  const cleanups = [];
  const quality = pickQuality();

  // The page script fires tf:solutions on load, possibly before this module is evaluated: read the active tab as a fallback.
  const sel = root.querySelector('[data-tabs="solutions"] [data-tab][aria-selected="true"], [data-tabs="solutions"] [data-tab].w--current');
  if (sel && sel.dataset.tab in MODES) wantMode = MODES[sel.dataset.tab];

  // tab clicks: remember the mode now, apply it when the scene exists (instant while off screen, tweened while visible)
  const onMode = e => {
    const m = MODES[e?.detail?.mode];
    if (m == null) return;
    wantMode = m;
    if (sol && ready) sol.setMode(m, !visible);
  };
  window.addEventListener('tf:solutions', onMode);
  cleanups.push(() => window.removeEventListener('tf:solutions', onMode));

  // ---------------------------------------------------------------- frame: the spacer's rect relative to the mount
  // If the spacer collapses (0 height under 992 px), the action is framed from the spacer's top to the bottom of the section.
  function frame() {
    if (!sol) return;
    const m = mount.getBoundingClientRect(), s = spacer ? spacer.getBoundingClientRect() : null;
    if (!s) { sol.setFrame({ top: 0, bottom: m.height, dotTop: 0 }); return; }
    const top = s.top - m.top, bottom = s.height >= 120 ? s.bottom - m.top : m.height;
    sol.setFrame({ top, bottom, dotTop: Math.max(0, top - 24) });
  }

  // ---------------------------------------------------------------- tick (gsap.ticker when present, else the scene's own rAF)
  function tick() {
    const now = performance.now(), dt = lastTick ? (now - lastTick) / 1000 : 1 / 60; lastTick = now;
    sol?.step(dt);
  }
  function sync() {
    if (!sol || !ready) return;
    if (visible) {
      frame();   // layout may have moved while the section was off screen
      const ext = !!window.gsap?.ticker;
      sol.start(ext);
      if (ext && !gsapTick) { lastTick = 0; gsapTick = tick; window.gsap.ticker.add(gsapTick); }
    } else {
      sol.stop();
      if (gsapTick) { window.gsap.ticker.remove(gsapTick); gsapTick = null; }
    }
  }

  // ---------------------------------------------------------------- failure: dispose, leave the section as it was
  function fail(err) {
    if (dead) return;
    dead = true; ready = false;
    console.warn('TerraFirma solutions: leaving the section without 3D.', err);
    if (gsapTick) { window.gsap?.ticker.remove(gsapTick); gsapTick = null; }
    for (const fn of cleanups.splice(0)) { try { fn(); } catch (_) { /* best effort */ } }
    try { sol?.dispose(); } catch (_) { /* best effort */ }
    sol = null; if (window.TFSolutions) window.TFSolutions = undefined;
  }

  // ---------------------------------------------------------------- boot (lazy)
  async function boot() {
    if (booted || dead) return;
    booted = true;
    try {
      const [THREE, mod] = await Promise.all([import('three'), import('./solutions/solutions.js')]);
      if (dead) return;
      sol = mod.createSolutions({ THREE, host: mount, quality });   // adds its own absolute-fill canvas to the mount
      const cv = sol.canvas;
      Object.assign(cv.style, { opacity: '0', transition: `opacity ${FADE_MS}ms ease` });   // pointer-events stay owned by the dig game
      cv.addEventListener('webglcontextlost', e => { e.preventDefault(); fail(new Error('webgl context lost')); });
      if (qs.has('qa')) window.TFSolutions = { sol, quality, get mode() { return sol?.mode; } };

      sol.setMode(wantMode, true);
      frame();
      const ro = new ResizeObserver(frame);
      ro.observe(root); ro.observe(mount); if (spacer) ro.observe(spacer);
      cleanups.push(() => ro.disconnect());
      document.fonts?.ready.then(() => { if (!dead) frame(); });
      addEventListener('load', frame); cleanups.push(() => removeEventListener('load', frame));

      // render only while the section is on screen (with a margin so the first frame is already drawn on arrival)
      const io = new IntersectionObserver(es => { visible = es[es.length - 1].isIntersecting; sync(); }, { rootMargin: `${Math.round(innerHeight * 0.25)}px 0px` });
      io.observe(root); cleanups.push(() => io.disconnect());

      await sol.ready;
      if (dead) return;
      ready = true;
      sol.setMode(wantMode, true);   // a tab click that landed during the import
      sync();
      void cv.offsetWidth;
      cv.style.opacity = '1';
      // compile every program off screen before the section is visible, so no mode compiles mid-scroll
      const idle = typeof requestIdleCallback === 'function' ? requestIdleCallback : fn => setTimeout(fn, 200);
      idle(() => { if (!dead) Promise.resolve(sol.warm()).catch(() => { /* warm is best effort */ }); }, { timeout: 2000 });
    } catch (err) { fail(err); }
  }

  // lazy trigger: only when the section is within ~1.5 viewports
  const near = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { near.disconnect(); boot(); } }, { rootMargin: `${Math.round(innerHeight * 1.5)}px 0px` });
  near.observe(root);
}
