// dial.js: dev-only look panel for the scroll film. mount.js imports it only when the page URL has ?grade; visitors never load it.
// Panel: DialKit's plain JS adapter (dialkit/vanilla, no React, no runtime deps), from jsDelivr, pinned. If it will not load or mount,
// lil-gui loads the same way instead (?grade=lil forces it). Both write film.tune, the object look.json.js seeds.
//
// mountDial({ film, section, prefer }) -> Promise<{ lib, destroy }>
//   film     the createFilm api (tune, look, state, yOfClock, freeze)
//   section  the film track (scrub target)
//   prefer   'lil' to skip DialKit
// State persists in sessionStorage (KEY). Escape hides and shows the panel. Copy JSON: clipboard + console, paste into look.json.js.

const DK_VER = '2.2.0', LIL_VER = '0.21.0';
const DK = `https://cdn.jsdelivr.net/npm/dialkit@${DK_VER}/dist/vanilla/`;
const LIL = `https://cdn.jsdelivr.net/npm/lil-gui@${LIL_VER}/dist/lil-gui.esm.min.js`;
const KEY = 'tf-film-dial';

// ranges [min, max, step]; defaults come from look.json.js
const R = {
  grade: { exposure: [-2, 2, 0.01], contrast: [0.5, 1.5, 0.01], saturation: [0, 2, 0.01], warmth: [-1, 1, 0.01], tint: [-1, 1, 0.01], lift: [-0.2, 0.2, 0.005], gamma: [0.5, 2, 0.01], gain: [0.5, 1.5, 0.01] },
  lens: { bloomStrength: [0, 2, 0.01], bloomThreshold: [0, 4, 0.01], vignette: [0, 1, 0.01], grain: [0, 0.15, 0.001] },
  beat: { exposure: [-1.5, 1.5, 0.01], warmth: [-1, 1, 0.01] }
};
const BEATS = ['austin', 'space', 'marsOrbit', 'colony'];
const CLOCK = [-2, 1.12, 0.001]; // -2..-1 the Austin leg, then the film clock S

const q = v => Math.round(v * 1e5) / 1e5; // clean numbers: identity stays exactly identity, JSON stays readable
const num = v => typeof v === 'number' && Number.isFinite(v);
const clampR = (v, r) => Math.min(r[1], Math.max(r[0], v));

// copy the look fields of src into dst (same shape as look.json.js), numbers only, clamped to the dial ranges
function assignLook(dst, src) {
  if (!src) return dst;
  for (const k in dst.grade) if (num(src.grade?.[k])) dst.grade[k] = q(clampR(src.grade[k], R.grade[k]));
  for (const k in dst.lens) if (num(src.lens?.[k])) dst.lens[k] = q(clampR(src.lens[k], R.lens[k]));
  for (const b of BEATS) for (const k in dst.beats[b]) if (num(src.beats?.[b]?.[k])) dst.beats[b][k] = q(clampR(src.beats[b][k], R.beat[k]));
  return dst;
}
const lookOf = t => ({ grade: { ...t.grade }, lens: { ...t.lens }, beats: Object.fromEntries(BEATS.map(b => [b, { ...t.beats[b] }])) });

function load() { try { const s = sessionStorage.getItem(KEY); return s ? JSON.parse(s) : null; } catch (_) { return null; } }
function save(film) { try { sessionStorage.setItem(KEY, JSON.stringify({ ...lookOf(film.tune), freeze: film.freeze })); } catch (_) { /* private mode, quota: the panel still works */ } }
function forget() { try { sessionStorage.removeItem(KEY); } catch (_) { /* ignore */ } }

function css(href) {
  return new Promise((res, rej) => {
    const l = Object.assign(document.createElement('link'), { rel: 'stylesheet', href, crossOrigin: 'anonymous' });
    l.onload = () => res(l); l.onerror = () => { l.remove(); rej(new Error('css ' + href)); };
    document.head.appendChild(l);
  });
}

async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; } catch (_) { /* no permission or no focus: old path */ }
  try {
    const t = Object.assign(document.createElement('textarea'), { value: text }); t.style.cssText = 'position:fixed;left:-9999px;top:0';
    document.body.appendChild(t); t.select(); const ok = document.execCommand('copy'); t.remove(); return ok;
  } catch (_) { return false; }
}

export async function mountDial({ film, section, prefer = '' }) {
  const tune = film.tune, LOOK = film.look;
  const saved = load();
  assignLook(tune, saved);
  if (saved && typeof saved.freeze === 'boolean') film.freeze = saved.freeze;

  // fixed layer above the film: transparent to the pointer except over the panel and the readout, so the page scrolls as usual
  const box = document.createElement('div');
  box.dataset.dialkitIgnore = ''; box.dataset.lenisPrevent = ''; // no capture thumbnails of the panel; wheel over the panel scrolls the panel, not Lenis
  box.style.cssText = 'position:fixed;top:0;left:0;width:0;height:0;z-index:2147483000;pointer-events:none';
  const style = document.createElement('style');
  style.textContent = '[data-tf-dial] .dialkit-panel,[data-tf-dial] .lil-gui,[data-tf-dial] .tf-dial-ro{pointer-events:auto}' +
    '[data-tf-dial] .tf-dial-ro{position:fixed;left:16px;bottom:16px;padding:8px 12px;border-radius:8px;background:rgba(20,20,20,.82);color:#e8e8e8;font:500 12px/16px ui-monospace,monospace;white-space:pre}' +
    '[data-tf-dial] .lil-gui.lil-root{position:fixed;top:16px;right:16px;max-height:calc(100vh - 32px);overflow:auto}';
  box.setAttribute('data-tf-dial', '');
  const ro = document.createElement('div'); ro.className = 'tf-dial-ro';
  box.append(style, ro); document.body.appendChild(box);

  // read-only readout: film clock, scroll px, fps (4 Hz; fps from this page's rAF)
  let frames = 0, fps = 0, fT = performance.now(), raf = 0, note = '', noteT = 0;
  const count = now => { frames++; if (now - fT >= 500) { fps = frames * 1000 / (now - fT); frames = 0; fT = now; } raf = requestAnimationFrame(count); };
  raf = requestAnimationFrame(count);
  const readout = () => {
    const s = film.state, a = s.s < 1 ? `Austin s ${s.s.toFixed(3)}` : `S ${s.S.toFixed(3)}`;
    ro.textContent = `${a}  ${s.beat}\nscroll ${Math.round(s.y)} px  ${fps.toFixed(fps < 10 ? 1 : 0)} fps${film.freeze ? '  frozen' : ''}${note && performance.now() - noteT < 2500 ? '\n' + note : ''}`;
  };
  const roTimer = setInterval(readout, 250);

  // scrub: drives the page scroll, so Lenis, the DOM copy and the film stay in step
  const clockNow = () => { const s = film.state; return s.s < 1 ? -2 + s.s : s.S; };
  let lastClock = Math.round(clockNow() * 1000) / 1000;
  function scrubTo(v) {
    if (Math.abs(v - lastClock) < 5e-4) return; lastClock = v;
    const y = section.getBoundingClientRect().top + scrollY + film.yOfClock(v);
    if (window.lenis) window.lenis.scrollTo(y, { immediate: true }); else window.scrollTo(0, y);
  }
  const flash = msg => { note = msg; noteT = performance.now(); readout(); };
  function copyJSON() {
    const json = JSON.stringify(lookOf(tune), null, 2);
    console.log('TerraFirma film look (paste over the object in film/look.json.js):\n' + json);
    copyText(json).then(ok => flash(ok ? 'JSON copied (also in the console)' : 'clipboard blocked: JSON is in the console'));
    return json;
  }

  let impl = null;
  if (prefer !== 'lil') {
    try { impl = await mountDialKit(); } catch (err) { console.warn('TerraFirma dial: DialKit did not load, using lil-gui.', err); impl = null; }
  }
  if (!impl) impl = await mountLil();

  const onKey = e => {
    if (e.key !== 'Escape' || e.defaultPrevented) return;
    const t = e.target; if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    box.style.display = box.style.display === 'none' ? '' : 'none';
  };
  addEventListener('keydown', onKey);
  readout();
  const api = {
    lib: impl.lib, copyJSON,
    set(path, val) { impl.set(path, val); }, // same paths as the panel: 'grade.exposure', 'perBeat.colony.warmth', 'cameraDebug.filmClock'
    reset() { impl.reset(); },
    destroy() { removeEventListener('keydown', onKey); clearInterval(roTimer); cancelAnimationFrame(raf); try { impl.destroy(); } catch (_) { /* best effort */ } box.remove(); }
  };
  window.TFDial = api; // console access: TFDial.copyJSON()
  return api;

  // ---------- shared write path: a panel snapshot { grade, lens, perBeat, cameraDebug } -> film.tune
  function take(v) {
    assignLook(tune, { grade: v.grade, lens: v.lens, beats: v.perBeat });
    if (v.cameraDebug) { film.freeze = !!v.cameraDebug.freezeTimelapse; if (num(v.cameraDebug.filmClock)) scrubTo(v.cameraDebug.filmClock); }
    save(film);
  }
  function resetLook() { assignLook(tune, LOOK); film.freeze = false; forget(); flash('reset to look.json.js'); }

  // ---------- DialKit (vanilla adapter): one root in the fixed layer, one panel
  async function mountDialKit() {
    const link = await css(DK + 'styles.css');
    let root = null, kit = null;
    try {
      const DKm = await import(DK + 'index.js');
      const sl = (v, r) => [v, r[0], r[1], r[2]];
      const beat = b => ({ _collapsed: true, exposure: sl(tune.beats[b].exposure, R.beat.exposure), warmth: sl(tune.beats[b].warmth, R.beat.warmth) });
      const cfg = {
        copyJson: { type: 'action', label: 'Copy JSON' },
        reset: { type: 'action', label: 'Reset' },
        grade: Object.fromEntries(Object.keys(R.grade).map(k => [k, sl(tune.grade[k], R.grade[k])])),
        lens: Object.fromEntries(Object.keys(R.lens).map(k => [k, sl(tune.lens[k], R.lens[k])])),
        perBeat: { _collapsed: true, ...Object.fromEntries(BEATS.map(b => [b, beat(b)])) },
        cameraDebug: { filmClock: [lastClock, CLOCK[0], CLOCK[1], CLOCK[2]], freezeTimelapse: film.freeze }
      };
      root = DKm.createDialRoot({ target: box, position: 'top-right', theme: 'dark', versions: 'menu', productionEnabled: true });
      kit = DKm.createDialKit('Film look', cfg, {
        id: 'tf-film-look',
        onAction(path) {
          if (path === 'copyJson') copyJSON();
          if (path === 'reset') { resetLook(); kit.setValues({ grade: { ...tune.grade }, lens: { ...tune.lens }, perBeat: lookOf(tune).beats, cameraDebug: { freezeTimelapse: false } }); }
        }
      });
      kit.subscribe(take);
      if (!box.querySelector('.dialkit-panel')) throw new Error('DialKit mounted no panel');
      return { lib: `dialkit@${DK_VER} (vanilla)`, set: (path, val) => kit.setValue(path, val), reset() { resetLook(); kit.setValues({ grade: { ...tune.grade }, lens: { ...tune.lens }, perBeat: lookOf(tune).beats, cameraDebug: { freezeTimelapse: false } }); }, destroy() { kit.destroy(); root.destroy(); link.remove(); } };
    } catch (err) { try { kit && kit.destroy(); root && root.destroy(); } catch (_) { /* ignore */ } link.remove(); throw err; }
  }

  // ---------- lil-gui fallback: same folders and controls, bound to a mirror of the panel snapshot
  async function mountLil() {
    const { GUI } = await import(LIL);
    const v = { grade: { ...tune.grade }, lens: { ...tune.lens }, perBeat: lookOf(tune).beats, cameraDebug: { filmClock: lastClock, freezeTimelapse: film.freeze } };
    const gui = new GUI({ title: 'Film look', container: box, width: 280 });
    const push = () => take(v), cs = [];
    const words = k => k.replace(/([A-Z])/g, ' $1').toLowerCase();
    const add = (f, o, k, r, name) => cs.push(f.add(o, k, r[0], r[1], r[2]).name(name || words(k)).onChange(push));
    const fg = gui.addFolder('Grade'); for (const k in R.grade) add(fg, v.grade, k, R.grade[k]);
    const fl = gui.addFolder('Lens'); for (const k in R.lens) add(fl, v.lens, k, R.lens[k]);
    const fb = gui.addFolder('Per beat'); for (const b of BEATS) { const f = fb.addFolder(words(b)); for (const k in R.beat) add(f, v.perBeat[b], k, R.beat[k]); f.close(); }
    fb.close();
    const fc = gui.addFolder('Camera debug');
    add(fc, v.cameraDebug, 'filmClock', CLOCK, 'film clock'); cs.push(fc.add(v.cameraDebug, 'freezeTimelapse').name('freeze timelapse').onChange(push));
    const reset = () => { resetLook(); Object.assign(v.grade, tune.grade); Object.assign(v.lens, tune.lens); for (const b of BEATS) Object.assign(v.perBeat[b], tune.beats[b]); v.cameraDebug.freezeTimelapse = false; cs.forEach(c => c.updateDisplay()); };
    gui.add({ copyJSON }, 'copyJSON').name('Copy JSON'); gui.add({ reset }, 'reset').name('Reset');
    const set = (path, val) => { const ks = path.split('.'), o = ks.slice(0, -1).reduce((a, k) => a[k], v); o[ks[ks.length - 1]] = val; cs.forEach(c => c.updateDisplay()); push(); };
    return { lib: `lil-gui@${LIL_VER}`, set, reset, destroy() { gui.destroy(); } };
  }
}
