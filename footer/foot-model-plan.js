// D6.1 footer: the Jezero timelapse city, placed in the footer frame so the footer shows the same colony from ground level.
// Source: mirrorLayout() below (a copy of the prototype's d5/habitat.js colonyLayout; this repo has no d5 dependency).
// footerPlan() -> everything in footer space (eye at the origin, looking down -z), culled to what the lens can see.

// where the colony sits in the footer frame: hub left of centre ~430 m out, the plan mirrored and turned so the near outer
// dome sits between the hub and the pad, the pad ship stands clear and the two parked ships fall right of it
export const PLACE = { x: -82, z: -420, rot: 75 * Math.PI / 180, mirror: -1 };

export function toFooter(x, z) {
  const c = Math.cos(PLACE.rot), s = Math.sin(PLACE.rot); x *= PLACE.mirror;
  return [PLACE.x + x * c - z * s, PLACE.z + x * s + z * c];
}

const angD = (a, b) => Math.abs(((a - b) % (Math.PI * 2) + Math.PI * 3) % (Math.PI * 2) - Math.PI);

// the timelapse plan rebuilt locally: a line-for-line copy of colonyLayout() in the prototype's d5/habitat.js (same
// Park-Miller seed 7 stream, same draw order, same skip rules), trimmed to the fields the footer reads. The random draws
// must stay in this exact order or every lot moves. Solar farm and old pad are not used here.
function mirrorLayout(high) {
  const rnd = (() => { let a = 7; return () => ((a = (a * 16807) % 2147483647) / 2147483647); })();
  const RINGS = [62, 132, 204], AVE = 8, ROCK_SITES = { land: [[55, -150], [15, -168]], build: [-25, -100] };
  const domes = [{ x: 0, z: 0, r: 20, kind: 'hub' }], tubes = [];
  for (let k = 0; k < 4; k++) { const a = Math.PI / 8 + k * Math.PI / 2; domes.push({ x: Math.cos(a) * 96, z: Math.sin(a) * 96, r: 15, kind: 'outer' }); tubes.push({ a, r0: 19, len: 62, y: 2.6, radius: 2.4 }); }
  const habs = [], fabs = [];
  for (let r = 34; r < 238; r += 14) {
    let a = r * 0.11;
    while (a < r * 0.11 + Math.PI * 2 - 0.05) {
      const rd = Math.min(6.6, 2.6 + rnd() * 3.2 + 5 * Math.exp(-r / 70)), x = Math.cos(a) * r, z = Math.sin(a) * r;
      const nearAve = [...Array(AVE)].some((_, k) => angD(a, k * Math.PI / 4) * r < rd + 4);
      const nearTube = r < 86 && tubes.some(t => angD(a, t.a) * r < rd + 3.5);
      const clear = !(nearAve || nearTube || RINGS.some(R => Math.abs(r - R) < rd + 3.5) || domes.some(d => Math.hypot(x - d.x, z - d.z) < d.r + rd + 3));
      if (clear && rnd() > 0.1) {
        const bt = 0.06 + (r / 238) * 0.58 + rnd() * 0.08;   // build time: only the draw and the low-tier ordering matter here
        if (r > 175 && rnd() < 0.28) fabs.push({ x, z, w: 8 + rnd() * 4, d: 5, h: 2.5 + rnd() * 2.5, rot: a, bt });
        else habs.push({ x, z, r: rd, ys: 0.72 + rnd() * 0.35, rot: rnd() * 6.28, bt, seed: rnd() * 50 });
      }
      a += (2 * rd + 2.6) / r;
    }
  }
  // every other hab in build order on the low tier, and the rocket zones kept clear
  const order = [...habs].sort((a, b) => a.bt - b.bt);
  if (!high) order.forEach((l, i) => (l.skip = i % 2 === 1));
  order.forEach(l => { if (ROCK_SITES.land.some(([x, z]) => Math.hypot(l.x - x, l.z - z) < l.r + 16) || Math.hypot(l.x - ROCK_SITES.build[0], l.z - ROCK_SITES.build[1]) < l.r + 30) l.skip = true; });
  // dome type per hab, the same hash the shell shader uses (0 mostly glass, 1 skylight crown, 2 window band, 3 mixed)
  const ih = (x, z) => { const s = Math.sin(x * 0.1271 + z * 0.3117 + 1.7) * 43758.5453; return s - Math.floor(s); };
  habs.forEach(l => { const h = ih(l.x, l.z); l.type = h < 0.26 ? 0 : h < 0.56 ? 1 : h < 0.8 ? 2 : 3; });
  return { rings: RINGS.map(r => ({ r })), avenues: [...Array(AVE)].map((_, k) => ({ a: k * Math.PI / 4, r0: 20, r1: 250 })), domes, tubes,
    habs: habs.filter(l => !l.skip), fabs, ships: ROCK_SITES.land.map(([x, z]) => ({ x, z })), buildPad: { x: ROCK_SITES.build[0], z: ROCK_SITES.build[1], r: 16.5 } };
}

export function footerPlan({ high = true } = {}) {
  const src = 'mirror', L = mirrorLayout(high);
  const T = toFooter;
  const near = 232, view = 0.72;    // keep: further than this (the outer ring road runs ~225 m out, in front of the city), within this half-angle (rad)
  const seen = (x, z, pad = 0, nr = near) => -z > nr - pad && Math.abs(Math.atan2(x, -z)) < view;
  const domes = L.domes.map(d => { const [x, z] = T(d.x, d.z); return { x, z, R: d.r, hub: d.kind === 'hub', cx: d.x, cz: d.z }; });
  const habs = [], fabs = [];
  for (const h of L.habs) { const [x, z] = T(h.x, h.z); if (seen(x, z, h.r)) habs.push({ x, z, r: h.r, ys: h.ys, ry: h.rot, seed: (h.seed % 1 + h.seed / 50) % 1, type: h.type ?? 0 }); }
  for (const f of L.fabs) { const [x, z] = T(f.x, f.z); if (seen(x, z, f.w) && Math.hypot(x, z) > 300) fabs.push({ x, z, w: f.w, d: f.d, h: f.h, ry: Math.PI / 2 - Math.atan2(z - PLACE.z, x - PLACE.x) }); }

  // streetlights: both kerbs of every ring and avenue (timelapse spacing, a little sparser at ground level)
  const street = [], rings = L.rings.map(r => r.r);
  for (const R of rings) for (let i = 0; i < 260; i++) { const a = i / 260 * Math.PI * 2; for (const o of [-2.6, 2.6]) { const [x, z] = T(Math.cos(a) * (R + o), Math.sin(a) * (R + o)); if (seen(x, z, 0, 180)) street.push([x, z]); } }
  for (const av of L.avenues) { const a = av.a; for (let rr = av.r0 + 4; rr < av.r1; rr += 6) for (const o of [-3, 3]) {
    const cx = Math.cos(a) * rr + Math.cos(a + 1.5708) * o, cz = Math.sin(a) * rr + Math.sin(a + 1.5708) * o, [x, z] = T(cx, cz);
    if (seen(x, z, 0, 180) && !domes.some(d => Math.hypot(cx - d.cx, cz - d.cz) < d.R + 1)) street.push([x, z]); } }

  const tubes = L.tubes.map(t => ({ from: T(Math.cos(t.a) * t.r0, Math.sin(t.a) * t.r0), to: T(Math.cos(t.a) * (t.r0 + t.len), Math.sin(t.a) * (t.r0 + t.len)) }));
  const tube0 = L.tubes[0] || { radius: 2.4, y: 2.6 }, build = T(L.buildPad.x, L.buildPad.z);
  return {
    src, center: T(0, 0), rings, tubeR: tube0.radius, tubeY: tube0.y,
    domes, tubes, habs, fabs, street,
    land: L.ships.map(s => T(s.x, s.z)), build, padR: L.buildPad.r,
    tower: [build[0] - 17, build[1] - 4],     // beside the pad on the lens's left (the timelapse offset would stand it in front of the ship)
    ring: (R, a) => T(Math.cos(a) * R, Math.sin(a) * R),   // a point on a ring road (colony angle), footer space
  };
}
