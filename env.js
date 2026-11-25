// env.js: browser switches, read once at module load (zero cost per frame). Query flags for bisecting on a real machine:
//   ?ff=1|0   force the Firefox path on or off (default: Gecko UA; Firefox for iOS reports FxiOS and is excluded)
//   ?gov=0    adaptive governors off, fixed at the start tier (film and Solutions); ?gov=log logs every tier change and the measured interval
//   ?msaa=0|2|4   MSAA samples on the Solutions and footer scene targets (default: unchanged, 4 high / 2 low)
//   ?post=0..3    film post level ceiling (0 = FXAA, 3 = TAA); on Solutions ?post=0 turns the bloom off
//   ?dpr=N    pixel ratio ceiling for every canvas (film, Solutions, footer)
//   ?hz=N     frame rate ceiling for the footer and the Mission scene (default: the display rate). ?hz=60 on a 120 / 144 / 160 Hz display
//             halves their GPU work; both move well under a pixel per frame at rest. Use pacer(HZ) in a loop to honour it.
// (?perf=off|0..5|log still works on the film governor; ?film=0 ?sol=0 ?foot=0 switch a scene off, e.g. ?sol=0&foot=0 leaves one live context.)
const qs = new URLSearchParams(typeof location !== 'undefined' ? location.search : '');
const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
const num = (k, lo, hi) => { const v = qs.get(k); if (v == null || v === '') return null; const n = +v; return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : null; };
const ff = qs.get('ff');
export const FF = ff === '1' ? true : ff === '0' ? false : /Firefox\//.test(ua) && !/FxiOS/.test(ua);
const g = qs.get('gov');
export const GOV_OFF = g === '0', GOV_LOG = g === 'log';
export const MSAA = (() => { const n = num('msaa', 0, 4); return n == null ? null : n >= 4 ? 4 : n >= 2 ? 2 : 0; })();   // null = the scene's own default
export const POST_MAX = num('post', 0, 3);                                                                              // null = no ceiling
export const DPR_MAX = num('dpr', 0.5, 4) ?? Infinity;
export const HZ = num('hz', 15, 240);   // null = the display rate
// pacer(hz) -> ts => bool: true when a frame is due at about hz, spread evenly whatever the display rate (144 Hz gives ~72 + 72 skipped
// frames at hz 72, not a beat of 7 and 14 ms steps): a slot clock that advances by one period per frame drawn and never falls behind.
export function pacer(hz) {
  const period = 1000 / hz; let next = 0;
  return ts => {
    if (ts < next - period * 0.15) return false;   // a vsync that lands up to 15% early is still on time (60 Hz jitter on a 60 cap)
    next = next && ts - next < period * 2 ? next + period : ts + period;
    return true;
  };
}
