// Cooperative slicing for the Solutions build. The scene is built in small tasks (about 6 ms each) that yield to the browser
// in between, so building it never holds the main thread long enough to drop a scrolled frame.
//   pacer.step()      yield once. Urgent: scheduler.yield() (or a MessageChannel hop): the rest of the build queues straight behind
//                     input. Polite (phones building ahead of the visitor): wait for an idle slot, and while the visitor is
//                     scrolling or touching, wait until 150 ms after the last scroll / touch / wheel event.
//   pacer.run(gen)    drive a generator, calling step() whenever more than `slice` ms have passed since the last yield.
//   pacer.polite      flip to false when the visitor nears the section: the build then finishes at normal priority.
let lastInput = -1e9;
const note = () => { lastInput = performance.now(); };
const EVENTS = ['scroll', 'touchstart', 'touchmove', 'wheel'];
// ?solslice=0 (QA): no yields at all, so the build is one task again; screenshots must match the sliced build exactly
const NO_SLICE = typeof location !== 'undefined' && new URLSearchParams(location.search).get('solslice') === '0';
const sleep = ms => new Promise(r => setTimeout(r, ms));

export function createPacer({ polite = false, slice = 6, quiet = 150 } = {}) {
  const ch = new MessageChannel();
  const hop = () => new Promise(r => { ch.port1.onmessage = () => r(); ch.port2.postMessage(0); });
  const idle = () => new Promise(r => (typeof requestIdleCallback === 'function' ? requestIdleCallback(() => r(), { timeout: 300 }) : setTimeout(r, 40)));
  let on = false;
  const attach = () => { if (on) return; on = true; for (const e of EVENTS) addEventListener(e, note, { passive: true, capture: true }); };
  const detach = () => { if (!on) return; on = false; for (const e of EVENTS) removeEventListener(e, note, { capture: true }); };
  const P = {
    slice,
    get polite() { return polite; },
    set polite(v) { polite = !!v; if (polite) attach(); else detach(); },
    async step() {
      if (NO_SLICE) return;
      if (!polite) { await (globalThis.scheduler?.yield ? globalThis.scheduler.yield() : hop()); return; }
      await idle(); await hop();   // the hop ends the idle callback's task: consecutive slices never merge into one long task
      while (polite && performance.now() - lastInput < quiet) await sleep(40);
    },
    async run(gen) {
      let t = performance.now(), r;
      while (!(r = gen.next()).done) { if (performance.now() - t > P.slice) { await P.step(); t = performance.now(); } }
      return r.value;
    },
    // run fn between yields (one stage of the build); the yield comes first so the caller's own task ends before the stage starts
    async stage(fn) { await P.step(); return fn(); },
    dispose() { detach(); ch.port1.close(); ch.port2.close(); },
  };
  if (polite) attach();
  return P;
}
