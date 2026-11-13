// perf.js: the film's adaptive quality governor (ported and slimmed from the prototype's d61/perf.js). It watches the film's own frame
// times while the film renders and steps quality down when frames miss 60 fps, back up with hysteresis when they hold it.
// Ladder, cheapest first. Stepping down from the top: pixel ratio, then post (TAA -> SMAA -> FXAA with quarter-res bloom),
// then the long-exposure trails, then the shadow map size and refresh rate, then the launch particle counts.
// Nothing here ever compiles a shader: every post level, the trails and both shadow sizes run on programs warmed at boot
// (post.warm), and the rest are uniforms, render target sizes or the film's own refresh policy.
//
// createGovernor({ high, apply, hold, holdUp }) -> { frame(dtMs), level, ceil, state, pin(level|null), reset() }
//   apply(q, level): push a ladder entry into the film (film.js). hold(): true while stepping must wait (the planet-to-colony flash)
//   holdUp(): true while stepping up must wait (the footer canvas shares the GPU: frames alternate, so the film's intervals are not its own)
//   Switches: ?perf=off (fixed at the top), ?perf=0..5 pins a level, ?perf=log logs every change.
export const LADDER = [
  { pr: 0.75, post: 0, trails: false, shadow: 1024, every: 3, keep: 0.4 },
  { pr: 1.0, post: 1, trails: false, shadow: 2048, every: 2, keep: 0.6 },
  { pr: 1.0, post: 2, trails: true, shadow: 2048, every: 1, keep: 1 },
  { pr: 1.0, post: 3, trails: true, shadow: 4096, every: 1, keep: 1 },
  { pr: 1.25, post: 3, trails: true, shadow: 4096, every: 1, keep: 1 },
  { pr: 1.5, post: 3, trails: true, shadow: 4096, every: 1, keep: 1 },
];
const TOP = LADDER.length - 1;
const MISS = 20, HITCH = 250;          // ms: over MISS missed 60 fps; over HITCH it is a one-off (compile, GC, tab switch), not throughput
const WIN = 40, COOL = 1500, UP_HOLD = 4000, PROBATION = 15000, CEIL_LIFE = 60000, ARRIVE = 600, EMERG = 33;

export function createGovernor({ high = true, apply, hold = () => false, holdUp = () => false } = {}) {
  const qs = typeof location !== 'undefined' ? new URLSearchParams(location.search) : new URLSearchParams();
  const P = qs.get('perf'), LOG = P === 'log', OFF = P === 'off', PIN = /^[0-5]$/.test(P || '') ? +P : null;
  const cap = high ? TOP : 2;          // low tier: never above pixel ratio 1 / SMAA (film.js keeps its post at FXAA there)
  let level = PIN ?? cap, ceil = cap, clock = 0, since = 0, cool = 0, upT = 0, lastUp = -1e9, ceilT = 0, applied = -1;
  const dts = new Float32Array(WIN), srt = new Float32Array(WIN); let n = 0, head = 0, misses = 0, recent = 0, stalls = 0;
  const state = { level, ceil, p90: 0, steps: 0 };
  const log = (...a) => { if (LOG) console.log('[film perf]', ...a); };
  function set(lv, why) {
    lv = Math.max(0, Math.min(ceil, lv)); if (lv === level) return;
    if (lv < level && clock - lastUp < PROBATION) { ceil = level - 1; ceilT = clock; lastUp = -1e9; log('ceiling', ceil); } // dropped soon after a step up: that level is off the table for a minute (one ceiling per failed step up, no cascade)
    if (lv > level) lastUp = clock;
    level = lv; cool = clock + COOL; upT = 0; n = 0; head = 0; misses = 0; recent = 0; state.steps++; log('level', lv, why);
    push();
  }
  function push() { if (applied === level) return; applied = level; state.level = level; state.ceil = ceil; apply(LADDER[level], level); }
  // dtMs: the interval since the last film frame, in ms (the film's own clock, so tests can feed it)
  function frame(dtMs) {
    if (applied < 0) push();
    if (OFF || PIN != null) return;
    clock += Math.min(dtMs, 100);
    if (dtMs > HITCH) { since = clock; if (++stalls >= 8 && level > 0) { stalls = 0; set(level - 1, 'sustained stalls'); } return; } // one stall is a hitch; eight in a row is throughput
    stalls = 0;
    if (clock - since < ARRIVE) return;                               // arrival frames say nothing about throughput
    if (n === WIN) { const o = dts[head]; if (o > MISS) misses--; if (o > EMERG) recent--; } else n++;
    dts[head] = dtMs; head = (head + 1) % WIN; if (dtMs > MISS) misses++; if (dtMs > EMERG) recent++;
    if (n < WIN) return;
    srt.set(dts); srt.sort(); const p90 = srt[Math.floor(WIN * 0.9)]; state.p90 = +p90.toFixed(1);
    // emergency: most of the window far over budget, even inside the flash
    if (recent > WIN * 0.6 && level > 0) { set(level - 1, 'emergency p90 ' + p90.toFixed(1)); return; }
    if (ceil < cap && clock - ceilT > CEIL_LIFE) { ceil = cap; state.ceil = ceil; log('ceiling lifted'); }
    if (clock < cool || hold()) return;
    if (p90 > MISS || misses > WIN * 0.12) { set(level - 1, 'p90 ' + p90.toFixed(1) + ' misses ' + misses); return; }
    // headroom: clean, vsync-locked frames for UP_HOLD -> try one level up (probation catches a level that cannot hold)
    if (level < ceil && misses === 0 && p90 < 17.6 && !holdUp()) { if (!upT) upT = clock; else if (clock - upT > UP_HOLD) set(level + 1, 'headroom p90 ' + p90.toFixed(1)); }
    else upT = 0;
  }
  return {
    frame, LADDER,
    get level() { return level; }, get ceil() { return ceil; }, get state() { return state; },
    pin(lv) { if (lv == null) return; ceil = cap; set(Math.max(0, Math.min(cap, lv)), 'pinned'); },
    reset() { n = 0; head = 0; misses = 0; recent = 0; since = clock; }   // e.g. after a resize: the window measured something else
  };
}
