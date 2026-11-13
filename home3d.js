// TerraFirma homepage 3D: mounts the Solutions scene (one jobsite, three camera shots, the dig) into the Webflow section.
// Load with <script type="module"> after an importmap for "three" (0.160.0).
//
// DOM contract (built in Webflow, see README):
//   section[data-three="solutions"]#solutions   position: relative; overflow: hidden
//   [data-three-mount="solutions"]              absolute inset-0 empty div, aria-hidden; the canvas is added inside it
//   [data-solutions-spacer]                     still observed for layout changes (the framing now uses the safe insets)
//   [data-sol-topo]                             optional: the topographic map art (inline SVG) and its strength (CSS opacity)
//   [data-tabs="solutions"] [data-tab]          owned by the page script, which dispatches window "tf:solutions"
//                                               with detail.mode = 'orchestration' | 'planning' | 'execution'
//   data-sol-safe-top / data-sol-safe-bottom    on the section or mount: fractions of its height kept clear of the subject
//                                               (heading on top, tabs at the bottom). Defaults .2 and .3. CSS custom
//                                               properties --sol-safe-top / --sol-safe-bottom on the section win (per breakpoint).
//   data-sol-*                                  every word drawn in the canvas (hint, tags, HUD labels), see README
// The canvas only listens to tf:solutions; it never owns the tabs. Mode changes only on a tab click (no scroll scrubbing).
// Phones (coarse pointer or a viewport under 768 px): same scene, lighter, the dig plays itself, nothing is captured.
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

// phones: no pointer handling at all (the page scroll must never be captured), the dig runs on autopilot
const phone = matchMedia('(pointer: coarse)').matches || innerWidth < 768;
const SAFE_DEF = { top: 0.2, bottom: 0.3 };
// Safe insets: CSS custom property --sol-safe-top / --sol-safe-bottom on the section (can change per breakpoint), else the
// data-sol-safe-top / data-sol-safe-bottom attribute, else the default. Read again on every resize.
function safeInsets() {
  const cs = getComputedStyle(root);
  const read = n => {
    let v = parseFloat(cs.getPropertyValue('--sol-safe-' + n));
    if (!Number.isFinite(v)) v = parseFloat(root.getAttribute('data-sol-safe-' + n) ?? mount.getAttribute('data-sol-safe-' + n));
    return Number.isFinite(v) ? v : SAFE_DEF[n];
  };
  return { top: read('top'), bottom: read('bottom') };
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

  // ---------------------------------------------------------------- frame: safe insets (read again on every layout change)
  function frame() { if (sol) sol.setSafe(safeInsets()); }

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
      sol = mod.createSolutions({ THREE, host: mount, root, quality: phone && !qs.get('q') ? 'low' : quality, interactive: !phone, safe: safeInsets() });   // adds its canvases to the mount
      const cv = sol.canvas;
      Object.assign(cv.style, { opacity: '0', transition: `opacity ${FADE_MS}ms ease` });   // pointer-events stay owned by the dig game
      cv.addEventListener('webglcontextlost', e => { e.preventDefault(); fail(new Error('webgl context lost')); });
      if (qs.has('qa')) window.TFSolutions = { sol, quality: phone && !qs.get('q') ? 'low' : quality, phone, get mode() { return sol?.mode; } };

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

// ---------------------------------------------------------------- the scroll film (Austin -> Earth -> Mars -> colony -> launch)
// Its own page integration lives in film/mount.js (DOM contract, bail rules, lazy trigger). Loaded only when the film section exists.
if (document.querySelector('section[data-three="film"]')) import('./film/mount.js').catch(err => console.warn('TerraFirma film: not loaded.', err));
