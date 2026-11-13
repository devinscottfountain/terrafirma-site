// topo-svg.mjs: writes the Solutions design contours as one plan-view SVG for the Webflow embed in [data-sol-topo].
// Units are world metres: SVG x = world x, SVG y = world z (the plan view's north-up framing). The 3D reads this SVG back
// from the page and drapes every line on the design surface, so the art lives in Webflow and the canvas only draws it.
// Usage: node solutions/tools/topo-svg.mjs [tolerance_m] > topo.svg   (run again if the design surface in sol-terrain.js changes)
import { SITE, buildContours } from '../sol-terrain.js';

const TOL = parseFloat(process.argv[2] || '0.1');   // simplify tolerance, m
const HALF = 50, cx = SITE.centre.x, cz = SITE.centre.z;
const segs = buildContours({ step: 0.8 });

// chain the marching-squares segments into polylines per level (shared cell edges give identical end points)
const key = (x, z) => Math.round(x * 1e4) + ',' + Math.round(z * 1e4);
const byLevel = new Map();
for (let i = 0; i < segs.length; i += 8) {
  const L = segs[i + 1].toFixed(3);
  if (!byLevel.has(L)) byLevel.set(L, { major: segs[i + 7], list: [] });
  byLevel.get(L).list.push([segs[i], segs[i + 2], segs[i + 3], segs[i + 5]]);
}
function chain(list) {
  const ends = new Map(), used = new Uint8Array(list.length), out = [];
  const add = (k, i) => { if (!ends.has(k)) ends.set(k, []); ends.get(k).push(i); };
  list.forEach((s, i) => { add(key(s[0], s[1]), i); add(key(s[2], s[3]), i); });
  const next = (x, z) => { for (const i of ends.get(key(x, z)) || []) if (!used[i]) return i; return -1; };
  for (let i = 0; i < list.length; i++) {
    if (used[i]) continue;
    used[i] = 1; const s = list[i], pts = [[s[0], s[1]], [s[2], s[3]]];
    for (const dir of [1, -1]) {   // grow from the tail, then from the head
      for (;;) {
        const [x, z] = dir > 0 ? pts[pts.length - 1] : pts[0], j = next(x, z);
        if (j < 0) break;
        used[j] = 1; const t = list[j], far = key(t[0], t[1]) === key(x, z) ? [t[2], t[3]] : [t[0], t[1]];
        dir > 0 ? pts.push(far) : pts.unshift(far);
      }
    }
    out.push(pts);
  }
  return out;
}
function rdp(P, tol) {   // Ramer-Douglas-Peucker (a closed ring measures from its start point)
  if (P.length < 3) return P;
  const [ax, az] = P[0], [bx, bz] = P[P.length - 1], dx = bx - ax, dz = bz - az, L = Math.hypot(dx, dz);
  let best = -1, bi = 0;
  for (let i = 1; i < P.length - 1; i++) {
    const d = L > 1e-6 ? Math.abs((P[i][0] - ax) * dz - (P[i][1] - az) * dx) / L : Math.hypot(P[i][0] - ax, P[i][1] - az);
    if (d > best) { best = d; bi = i; }
  }
  if (best <= tol) return [P[0], P[P.length - 1]];
  return rdp(P.slice(0, bi + 1), tol).slice(0, -1).concat(rdp(P.slice(bi), tol));
}
const r1 = v => Math.round(v * 10) / 10, f = v => String(r1(v)).replace(/^(-?)0\./, '$1.');
function pathD(pts) {   // absolute move, then relative lines at 0.1 m
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`, px = r1(pts[0][0]), pz = r1(pts[0][1]);
  for (let i = 1; i < pts.length; i++) {
    const x = r1(pts[i][0]), z = r1(pts[i][1]), dx = r1(x - px), dz = r1(z - pz);
    if (!dx && !dz) continue;
    d += `l${f(dx)}${dz < 0 ? '' : ' '}${f(dz)}`; px = x; pz = z;
  }
  return d;
}
let minor = '', major = '';
for (const { major: mj, list } of byLevel.values()) {
  for (const pts of chain(list)) { const s = rdp(pts, TOL); if (s.length < 2) continue; if (mj) major += pathD(s); else minor += pathD(s); }
}
const vb = `${cx - HALF} ${cz - HALF} ${HALF * 2} ${HALF * 2}`;
process.stdout.write(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" preserveAspectRatio="xMidYMid slice" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="position:absolute;inset:0;width:100%;height:100%"><path d="${minor}" stroke-width="1" vector-effect="non-scaling-stroke"/><path data-major="" d="${major}" stroke-width="1.5" vector-effect="non-scaling-stroke"/></svg>\n`);
