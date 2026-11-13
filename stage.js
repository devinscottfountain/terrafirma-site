// stage.js: a tiny coordinator for the page's WebGL canvases (the film and the 3D footer on the homepage).
// Each loop reports how much of the viewport its canvas covers. While two or more cover part of it, they take turns:
// one canvas renders per animation frame (film on even frames, footer on odd), so the GPU never presents two full
// frames in one vsync. The footer also publishes its seam colour (the colour the film's lower edge fades into).
// State lives on window.__tfStage, so two copies of this file (different SHAs) still share it. A page with one canvas
// (Careers, legal: the footer only) never overlaps and nothing changes there.
//
// report(name, vis)   vis: fraction of the viewport height this canvas covers right now (0 when stopped or off screen)
// turn(name)          true when this canvas may render in this animation frame
// vis(name)           the last reported coverage, 0 when unknown or stale
// overlap()           true while two or more canvases are on screen
// seam(src|null)      footer: publish its seam colour, a function returning display rgb 0..1 (already weighted) or null;
//                     seam() reads it now, null when there is none

const ORDER = ['film', 'foot'];      // turn order: film on even frames, footer on odd
const STALE = 10000;                 // ms: a safety net only (every stop path reports 0); long enough for a very slow frame
const S = (typeof window !== 'undefined' && (window.__tfStage || (window.__tfStage = { c: {}, n: 0, f: -1, seam: null }))) || { c: {}, n: 0, f: -1, seam: null };

const now = () => performance.now();
// one id per animation frame: document.timeline's time is fixed for the whole frame (every rAF callback and the gsap ticker see it)
const frameId = () => (typeof document !== 'undefined' && document.timeline && document.timeline.currentTime != null ? document.timeline.currentTime : Math.floor(now() / 4));

function live(name) { const e = S.c[name]; return e && e.v > 0 && now() - e.t < STALE ? e.v : 0; }
function onScreen() { const o = []; for (const k of ORDER) if (live(k) > 0) o.push(k); return o; }

export function report(name, vis) { const e = S.c[name] || (S.c[name] = { v: 0, t: 0 }); e.v = Math.max(0, Math.min(1, +vis || 0)); e.t = now(); }
export function vis(name) { return live(name); }
export function overlap() { return onScreen().length > 1; }
export function turn(name) {
  const on = onScreen();
  if (on.length < 2) return true;
  const f = frameId(); if (f !== S.f) { S.f = f; S.n++; }
  const i = on.indexOf(name);
  return i < 0 || S.n % on.length === i;
}
export function seam(src) {
  if (src !== undefined) { S.seam = typeof src === 'function' ? src : null; return; }
  try { return S.seam ? S.seam() : null; } catch (_) { return null; }
}
