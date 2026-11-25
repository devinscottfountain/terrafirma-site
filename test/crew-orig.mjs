// crew-orig.mjs: the ORIGINAL inline machine + crew code of film/site.js, read out of git and run headless (stubs for the meshes), so
// test/check-crew.mjs and the screenshot scripts can measure the "before" with the code that shipped. ORIG_REF defaults to the commit
// before the keep-out fix.
import * as THREE from 'three';
import { execSync } from 'node:child_process';
import { NW, D, H } from '../film/yard.js';

export const ORIG_REF = process.env.ORIG_REF || '5c387eb';
const sstep = (x, a, b) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const src = execSync(`git show ${ORIG_REF}:film/site.js`, { cwd: new URL('..', import.meta.url).pathname, maxBuffer: 1e8 }).toString().split('\n');
const lineOf = s => { const i = src.findIndex(l => l.includes(s)); if (i < 0) throw new Error('marker not found: ' + s); return i; };
const slice = (a, b) => src.slice(lineOf(a), lineOf(b)).join('\n');
export function makeOriginal() {
  const helpers = slice('const EX_CYCLE', 'const sd = new THREE.Vector3'), machines = slice('// excavators: dig', '// pours: pump'), crewSrc = slice('// crew: clusters', 'crew.instanceMatrix.needsUpdate');
  const COLS = []; for (let x = -28; x <= 28; x += 8) for (let z = -16; z <= 16; z += 8) COLS.push([x, z]);
  const grp = () => { const g = new THREE.Group(); g.up = new THREE.Group(); g.boom = new THREE.Group(); g.stick = new THREE.Group(); return { g, up: g.up, boom: g.boom, stick: g.stick }; };
  const exA = grp(), exB = grp(), trucks = [0, 1, 2, 3].map(() => ({ g: new THREE.Group(), load: {} })), dozer = new THREE.Group();
  const out = new Float64Array(NW * 4), U = { uDig: { value: 0 } }, tmpM = new THREE.Matrix4();
  const crew = { setMatrixAt: (i, m) => { const e = m.elements; out[i * 4] = e[12]; out[i * 4 + 1] = e[13]; out[i * 4 + 2] = e[14]; out[i * 4 + 3] = Math.atan2(-e[8], e[0]); }, instanceMatrix: {} };
  const make = new Function('THREE', 'D', 'H', 'NW', 'COLS', 'U', 'exA', 'exB', 'trucks', 'dozer', 'crew', 'sstep', 'tmpM', 'tv', 'tq', 'ts', 'YA',
    `${helpers}\n const crewS = Array.from({ length: NW }, () => ({ x: 0, y: 0, z: 0, yaw: 0 })); let crewT = -1, crewG = -1;
     return { machines(t, prog) { ${machines} return { digOn, xf }; },
       crew(t, prog, bay, digOn, xf) { const g = prog; ${crewSrc} }, reset() { crewT = -1; crewG = -1; } };`);
  const o = make(THREE, D, H, NW, COLS, U, exA, exB, trucks, dozer, crew, sstep, tmpM, new THREE.Vector3(), new THREE.Quaternion(), new THREE.Vector3(), new THREE.Vector3(0, 1, 0));
  return {
    out, exA, exB, trucks, dozer, reset: o.reset,
    step(t, prog) { U.uDig.value = sstep(prog, 0.07, 0.36); const { digOn, xf } = o.machines(t, prog); const bay = Math.min(7, Math.max(0, Math.floor((prog - 0.47) / 0.028 + 0.5))); o.crew(t, prog, bay, digOn, xf); }
  };
}

