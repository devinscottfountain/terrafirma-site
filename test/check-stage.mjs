// check-stage.mjs: stage.js alternation (film / footer take turns while both are on screen) against synthetic frames, comparing the version
// at BASE (default 0b06303) with the shipped one. Frames are 60 Hz; document.timeline.currentTime is quantised like Firefox with
// resistFingerprinting (1 ms normal, 16.67 ms and 100 ms with it). Expect strict alternation (each scene draws every other frame) in all cases.
// Usage: node test/check-stage.mjs [base-rev]
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), BASE = process.argv[2] || '0b06303';
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tf-stage-'));
fs.writeFileSync(path.join(tmp, 'old-stage.mjs'), execFileSync('git', ['show', `${BASE}:stage.js`], { cwd: ROOT, encoding: 'utf8' }));
let T = 0, Q = 1; globalThis.document = { timeline: { get currentTime() { return Q > 1 ? Math.floor(T / Q) * Q : T; } } };   // no window: each module copy keeps its own state
const mk = async (file, tag) => import(pathToFileURL(file).href + '?' + tag);
let bad = 0;
const rows = [];
for (const [name, file] of [['old', path.join(tmp, 'old-stage.mjs')], ['new', path.join(ROOT, 'stage.js')]]) {
  for (const q of [1, 1000 / 60, 100]) for (const order of [['film', 'foot'], ['foot', 'film']]) {
    const st = await mk(file, `${name}-${q}-${order[0]}`); Q = q; T = 0;
    st.report('film', 0.6); st.report('foot', 0.4);
    const n = 600, runs = { film: [], foot: [] }, last = { film: null, foot: null }, count = { film: 0, foot: 0 }, both = { n: 0 }, none = { n: 0 };
    for (let f = 0; f < n; f++) {
      T = 1000 + f * 1000 / 60; const got = {};
      for (const nm of order) { got[nm] = st.turn(nm); if (got[nm]) count[nm]++; }
      if (got.film && got.foot) both.n++; if (!got.film && !got.foot) none.n++;
      for (const nm of order) { if (last[nm] === got[nm]) runs[nm][runs[nm].length - 1]++; else { runs[nm].push(1); last[nm] = got[nm]; } }
    }
    const longest = Math.max(...runs.film, ...runs.foot);
    const ok = name === 'old' ? true : both.n === 0 && none.n === 0 && longest === 1;
    if (!ok) bad++;
    rows.push(`${name} q=${q.toFixed(1).padStart(6)} ms order=${order.join('>').padEnd(9)} film ${count.film} foot ${count.foot} of ${n} frames; both-in-one-frame ${both.n}, neither ${none.n}, longest run ${longest}${name === 'new' ? (ok ? ' ok' : ' FAIL') : ''}`);
  }
}
// the opt-in policies: ?stage=area (coverage-weighted, a quarter at least) and ?stage=off (everyone draws)
for (const [pol, vf, vo, want] of [['area', 0.9, 0.1, (c, n) => c.film > n * 0.65 && c.foot >= n * 0.2 && c.both === 0 && c.none === 0], ['area', 0.5, 0.5, (c, n) => Math.abs(c.film - c.foot) <= 2 && c.both === 0], ['off', 0.5, 0.5, (c, n) => c.film === n && c.foot === n]]) {
  globalThis.location = { search: '?stage=' + pol };
  const st = await mk(path.join(ROOT, 'stage.js'), 'pol-' + pol + vf); Q = 1; T = 0; st.report('film', vf); st.report('foot', vo);
  const n = 600, c = { film: 0, foot: 0, both: 0, none: 0 };
  for (let f = 0; f < n; f++) { T = 1000 + f * 1000 / 60; const a = st.turn('film'), b = st.turn('foot'); c.film += a; c.foot += b; if (a && b) c.both++; if (!a && !b) c.none++; }
  const ok = want(c, n); if (!ok) bad++;
  rows.push(`policy ${pol} film ${vf} foot ${vo}: film ${c.film} foot ${c.foot} of ${n}, both ${c.both}, neither ${c.none} ${ok ? 'ok' : 'FAIL'}`);
}
delete globalThis.location;
console.log(rows.join('\n')); console.log(bad ? 'check-stage FAIL' : 'check-stage ok');
fs.rmSync(tmp, { recursive: true, force: true }); process.exit(bad ? 1 : 0);
