// yard.js: the Austin yard as pure numbers (no THREE, no DOM): where every moving machine is on the film clock t and build progress g
// (prog), the keep-out zone each one carries, and the 44 crew. site.js copies the results onto the meshes; test/check-crew.mjs steps the
// same functions in node. Units are metres, lot frame (+x east, -z north). Nothing here keeps state between calls: the same (t, prog)
// always gives the same machines and crew, whatever came before (scrub back, jump, resume).
//
// createYard() -> { M, Z, crew, machines(t, prog), crewStep(t, prog), zsd(row, x, z), nZ }
//   M     machine poses (plain objects, reused): ex[2], tr[4], dz, pump, mix[2], digOn, xf, bay, pouring, craneOn
//   Z     keep-out zones, Float64Array rows of ZS: [kind, cx, cz, fx, fz, hf, hb, hw, r, bound]. kind 1 disc (r), kind 2 oriented box (forward
//         unit vector f, extents ahead hf / behind hb / half width hw). Rows [0, nS) are fixed on t (move with g only), the rest ride t
//   crew  Float64Array 5 per worker: x, y, z, yaw, scale (scale 0 = hidden, see GATES)

export const NW = 44, D = 4;
// integer hash that gives the same answer in JS doubles and GLSL floats (all intermediates stay under 2^24)
export const H = n => { const a = ((n % 1009) + 1009) % 1009; return ((a * a * 7 + a * 31 + 13) % 1009) / 1009; };
const sstep = (x, a, b) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
// machine rates (real time): excavator dig-swing-dump cycle, dozer pass, pit pass
export const EX_CYCLE = 7, DOZE_P = 80, PIT_P = 40;
// haul loop by arc length, slow on the lot and fast on the street
const LOOP = [[86, -420], [86, -30], [74, -24], [40, -25.5], [-20, -25.5], [-44, -25.5], [-50, 0], [-44, 25.5], [-10, 25.5], [40, 25.5], [74, 30], [86, 36], [86, 420]];
const LSEG = LOOP.slice(1).map((p, i) => { const L = Math.hypot(p[0] - LOOP[i][0], p[1] - LOOP[i][1]), v = L > 200 ? 12 : 4.5; return { L, T: L / v, v }; });
export const LOOP_T = LSEG.reduce((a, s) => a + s.T, 0);

// keep-out sizes (m). Moving machines: footprint + MM all round + a travel buffer (BUF s of travel + 2 m) ahead; static ones: footprint + SM.
// CAT 336: the whole slew circle, tail 3.45 m, arm + stick + bucket reach 11.6 m at its longest in the dig cycle (+0.4) = 12 m
const SM = 0.5, MM = 0.6, BUF = 2, R_SW = 12;
// crew: spots sit >= SPOT_D outside every fixed zone, the final clamp keeps every worker >= CLR_D outside all of them
const SPOT_D = 0.6, CLR_D = 0.3, ZS = 10, ZMAX = 24;
// build-progress values where machines appear / vanish or the crew changes job or bay: the crew blink (scale to 0) across them so a
// spot never jumps in view. Hidden within +-GW0, fully back at +-GW1
const GATES = [0.06, 0.07, 0.1, 0.3, 0.404, 0.42, 0.44, 0.455, 0.46, 0.484, 0.512, 0.54, 0.568, 0.596, 0.624, 0.652, 0.69, 0.72, 0.8, 0.85, 0.86, 0.95];
const GW0 = 0.0008, GW1 = 0.0025;

export function createYard() {
  const ex = [0, 1].map(() => ({ on: false, x: 0, y: 0, z: 0, ph: 0, sw: 0 })), tr = [0, 1, 2, 3].map(() => ({ on: false, x: 0, z: 0, yaw: 0, load: false, v: 0 })),
    mix = [0, 1].map(() => ({ x: 0, z: -29 })), lo = { x: 0, z: 0, v: 0 };
  const M = { ex, tr, mix, dz: { on: false, x: 0, y: 0, z: 0, yaw: 0, v: 0 }, pump: { on: false, bx: 0 }, digOn: false, xf: 0, bay: 0, pouring: false, craneOn: false, up: 0 };
  const Z = new Float64Array(ZMAX * ZS), crew = new Float64Array(NW * 5);
  let nZ = 0, nS = 0;

  // u 0..1 of the loop's time -> lo.x / lo.z / lo.v, returns yaw
  function loopAt(u) {
    let k = u * LOOP_T, i = 0; while (i < LSEG.length - 1 && k > LSEG[i].T) { k -= LSEG[i].T; i++; }
    const f = Math.min(1, k / LSEG[i].T), a = LOOP[i], b = LOOP[i + 1];
    lo.x = a[0] + (b[0] - a[0]) * f; lo.z = a[1] + (b[1] - a[1]) * f; lo.v = LSEG[i].v; return Math.atan2(-(b[1] - a[1]), b[0] - a[0]);
  }
  const disc = (x, z, r) => { const o = nZ++ * ZS; Z[o] = 1; Z[o + 1] = x; Z[o + 2] = z; Z[o + 8] = Z[o + 9] = r; };
  // box at (x, z) turned yaw (three's rotation.y: forward = (cos, -sin)), local extents a ahead, b behind, w half width, grown by m
  const box = (x, z, yaw, a, b, w, m, buf = 0) => { const o = nZ++ * ZS; Z[o] = 2; Z[o + 1] = x; Z[o + 2] = z; Z[o + 3] = Math.cos(yaw); Z[o + 4] = -Math.sin(yaw); Z[o + 5] = a + m + buf; Z[o + 6] = b + m + buf; Z[o + 7] = w + m; Z[o + 9] = Math.hypot(Math.max(Z[o + 5], Z[o + 6]), Z[o + 7]); };
  // one-sided: the buffer only ahead (trucks); the dozer drives both ways in turn, so it gets it on both ends
  const boxF = (x, z, yaw, a, b, w, m, buf) => { box(x, z, yaw, a, b, w, m); Z[(nZ - 1) * ZS + 5] += buf; Z[(nZ - 1) * ZS + 9] = Math.hypot(Math.max(Z[(nZ - 1) * ZS + 5], Z[(nZ - 1) * ZS + 6]), Z[(nZ - 1) * ZS + 7]); };

  // machine poses and keep-out zones for (t, prog). Mirrors what site.js used to compute inline, so the film looks the same
  function machines(t, prog) {
    const digOn = prog > 0.06 && prog < 0.42, xf = -32 + sstep(prog, 0.07, 0.36) * 76;
    M.digOn = digOn; M.xf = xf; nZ = 0;
    // fixed: office trailer (60 x 12 ft, doors and stairs on +z), light towers, dumpster
    box(52, -45, 0, 9.15, 9.15, 3.6, SM); box(62, 44, 0, 3.1, 3.1, 1.2, SM);
    for (const [x, z] of [[-60, -42], [60, -42], [-60, 42], [20, 30]]) disc(x, z, 2.7 + SM);
    const up = sstep(prog, 0.4, 0.47); M.up = up; M.craneOn = up > 0.01; if (M.craneOn) box(-4, 4, 0, 3, 3, 3, SM); // tower crane footing
    // pours: pump parks on the north edge opposite the active bay, two mixers queue behind it
    const bay = Math.min(7, Math.max(0, Math.floor((prog - 0.47) / 0.028 + 0.5))), pouring = prog > 0.455 && prog < 0.69;
    M.bay = bay; M.pouring = pouring; M.pump.on = pouring;
    if (pouring) {
      const bx = -32 + Math.floor(bay / 2) * 16 + 8; M.pump.bx = bx;
      box(bx, -29, 0, 6.5, 6.4, 4.4, SM); // chassis and the deployed outriggers (4.4 m out each side)
      for (let i = 0; i < 2; i++) { mix[i].x = bx + 12 + i * 11; mix[i].z = -29; box(mix[i].x, -29, 0, 5.05, 4.85, 1.25, SM); }
    }
    // excavators ride the dig face, which scroll moves: the keep-out is the whole slew circle, whatever the arm is doing
    for (let i = 0; i < 2; i++) {
      const e = ex[i], late = i === 1 && prog > 0.8, ph = (t / EX_CYCLE + i * 0.37) % 1;
      e.on = digOn || (i === 1 && prog > 0.8 && prog < 0.95); e.ph = ph; e.sw = sstep(ph, 0.35, 0.55) * (1 - sstep(ph, 0.7, 0.95));
      e.x = late ? 40 : Math.min(26, Math.max(-28, xf - 6)); e.y = late ? -1 : -D * sstep(prog, 0.07, 0.12); e.z = i ? 13 : -13;
      if (e.on) disc(e.x, e.z, R_SW);
    }
    nS = nZ;
    // haul trucks loop through the gates; loaded on the way out. 9.65 x 2.5 m, origin at the cab-back, +x forward
    for (let i = 0; i < 4; i++) {
      const T = tr[i], u = (t / LOOP_T + i / 4) % 1; T.on = prog > 0.07 && prog < 0.46;
      T.yaw = loopAt(u); T.x = lo.x; T.z = lo.z; T.v = lo.v; T.load = u > 0.5;
      if (T.on) boxF(T.x, T.z, T.yaw, 4.95, 4.7, 1.25, MM, BUF * T.v + 2);
    }
    // dozer: strips the lot, grades the pit floor, then fine grades the yard (one pass per period, next lane each pass)
    const dz = M.dz; let x, z, y = 0, on = true, n, v;
    if (prog < 0.1) { n = t / DOZE_P; x = -60 + Math.abs((n % 1) * 2 - 1) * 110; z = -40 + (Math.floor(n) % 4) * 20; v = 2.75; }
    else if (prog > 0.3 && prog < 0.44) { n = t / PIT_P; x = -26 + Math.abs((n % 1) * 2 - 1) * 52; z = -12 + (Math.floor(n) % 3) * 12; y = -D; v = 2.6; }
    else if (prog > 0.86) { n = t / PIT_P; x = -60 + Math.abs((n % 1) * 2 - 1) * 40; z = 40; v = 2; }
    else { on = false; n = 0; x = z = v = 0; }
    dz.on = on; dz.x = x; dz.y = y; dz.z = z; dz.v = v; dz.yaw = n % 1 < 0.5 ? 0 : Math.PI;
    if (on) box(x, z, dz.yaw, 3, 3, 1.7, MM, BUF * v + 2); // blade 3.4 m wide, 5.3 m long; reverses at each lane end, so a buffer both ways
  }

  // signed distance (m) from (x, z) to zone row r: < 0 inside
  function zsd(r, x, z) {
    const o = r * ZS, dx = x - Z[o + 1], dz = z - Z[o + 2];
    if (Z[o] === 1) return Math.hypot(dx, dz) - Z[o + 8];
    const fx = Z[o + 3], fz = Z[o + 4], u = dx * fx + dz * fz, v = dz * fx - dx * fz;
    const qx = Math.max(-Z[o + 6] - u, u - Z[o + 5]), qy = Math.abs(v) - Z[o + 7];
    return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0);
  }
  const near = (r, x, z, d) => { const o = r * ZS, b = Z[o + 9] + d; return Math.abs(x - Z[o + 1]) < b && Math.abs(z - Z[o + 2]) < b; }; // cheap reject before the exact distance
  let PX = 0, PZ = 0;
  // moves (PX, PZ) out of zone row r to signed distance d (nearest way out)
  function zpush(r, d) {
    const o = r * ZS, dx = PX - Z[o + 1], dz = PZ - Z[o + 2];
    if (Z[o] === 1) { const L = Math.hypot(dx, dz), k = L > 1e-6 ? (Z[o + 8] + d) / L : 0; PX = Z[o + 1] + (L > 1e-6 ? dx * k : Z[o + 8] + d); PZ = Z[o + 2] + dz * k; return; }
    const fx = Z[o + 3], fz = Z[o + 4], hf = Z[o + 5], hb = Z[o + 6], hw = Z[o + 7], u = dx * fx + dz * fz, v = dz * fx - dx * fz;
    let nu, nv;
    if (u < -hb || u > hf || Math.abs(v) > hw) { // outside: along the normal from the nearest point of the box
      const cu = Math.min(hf, Math.max(-hb, u)), cv = Math.min(hw, Math.max(-hw, v)), L = Math.hypot(u - cu, v - cv) || 1;
      nu = cu + (u - cu) / L * d; nv = cv + (v - cv) / L * d;
    } else { // inside: out through the nearest face
      const a = hf - u, b = u + hb, c = hw - v, e = v + hw, m = Math.min(a, b, c, e);
      nu = u; nv = v; if (m === a) nu = hf + d; else if (m === b) nu = -hb - d; else if (m === c) nv = hw + d; else nv = -hw - d;
    }
    PX = Z[o + 1] + nu * fx - nv * fz; PZ = Z[o + 2] + nu * fz + nv * fx;
  }
  // out of every fixed zone (to d) / every zone (to d), a few passes so neighbouring zones settle
  function clearFixed(d) { for (let p = 0; p < 4; p++) { let hit = false; for (let r = 0; r < nS; r++) if (near(r, PX, PZ, d) && zsd(r, PX, PZ) < d) { zpush(r, d); hit = true; } if (!hit) break; } }
  function clearAll(d) { for (let p = 0; p < 6; p++) { let hit = false; for (let r = 0; r < nZ; r++) if (near(r, PX, PZ, d) && zsd(r, PX, PZ) < d) { zpush(r, d); hit = true; } if (!hit) break; } }

  // ---------------------------------------------------------------- crew
  // each worker holds a spot for 6 to 12 s, then walks to the next (1.3 to 5 m/s). Spot k is a pure function of (i, k, g); the walk
  // from spot k-1 to spot k starts at the segment start, so position is a closed form of (t, g). Jobs by build progress: spotters at the
  // edge of the excavators' swing circle (facing the machine), then crews on the active bay once the pit is graded, then on the columns;
  // the rest by the trailer. Spots are pushed out of every fixed zone; trucks and the dozer keep to lanes no job comes near
  const SA = new Float64Array(5), SB = new Float64Array(5); // spot: x, y, z, hold yaw
  const TR_X = 46, TR_Z = -33.25; // trailer cluster: z stays inside -36.5..-30, clear of the dozer's first lane (-40, edge -37.7) and the mixers' row
  function spot(i, k, prog, o) {
    const r1 = H(i * 31 + k * 7), r2 = H(i * 17 + k * 3 + 5);
    let x, z, y = 0, yaw = H(i * 29 + k * 11) * 6.2832;
    if (i < 26 && prog > 0.44 && prog < 0.72) { const b = Math.min(7, M.bay + (i % 3 === 0 ? 1 : 0)); x = -32 + Math.floor(b / 2) * 16 + 2 + r1 * 12; z = (b % 2 ? 2 : -17) + r2 * 15; y = -D; }
    else if (i < 26 && prog >= 0.72) { // walk the column grid as a snake so the next spot is a neighbour, never across the lot
      let n = ((i * 7 + k) % 78 + 78) % 78; if (n > 39) n = 78 - n; const xi = Math.floor(n / 5), zi = xi % 2 ? 4 - n % 5 : n % 5;
      x = -28 + xi * 8 + (r1 - 0.5) * 3; z = -16 + zi * 8 + (r2 - 0.5) * 3; y = -D + (prog > 0.85 && x < 0 ? 3.75 : 0);
    }
    else if (i < 34 && M.digOn) { // spotters: on the front arc of the swing circle of their excavator (odd: north one), within 35 deg of its dig line
      const e = ex[i % 2 ? 0 : 1], a = (r1 - 0.5) * 1.222, r = R_SW + 1.5 + r2 * 2;
      x = e.x + Math.cos(a) * r; z = e.z + Math.sin(a) * r; yaw = Math.atan2(-(e.z - z), e.x - x);
    }
    else { x = TR_X + (H(i * 5 + 9) - 0.5) * 13 + (r1 - 0.5) * 12 + 6.5; z = TR_Z + (r2 - 0.5) * 6.5; }
    PX = x; PZ = z; clearFixed(SPOT_D);
    o[0] = PX; o[1] = y; o[2] = PZ; o[3] = yaw;
  }
  const wrap = a => a - Math.round(a / 6.2832) * 6.2832;
  // crew visibility: scale 1, 0 within GW0 of a gate (all of them blink together; people are 1 to 3 px here)
  function gateK(prog) { let m = 1; for (let i = 0; i < GATES.length; i++) m = Math.min(m, sstep(Math.abs(prog - GATES[i]), GW0, GW1)); return m; }

  // walking route A -> B as a polyline in WX / WZ (WN points, WC cumulative length). Straight, unless the chord runs through a fixed zone:
  // then round the 8-gon that bounds that zone (1 m clear), the way round (clockwise or not) and the corners picked by shortest length
  // with both end legs clear of the zone. A and B are already out of the zone, so some way round always exists
  const WX = new Float64Array(12), WZ = new Float64Array(12), WC = new Float64Array(12), VX = new Float64Array(8), VZ = new Float64Array(8), visA = new Uint8Array(8), visB = new Uint8Array(8);
  let WN = 2;
  // does the segment come within th of zone row r? samples every 0.25 m (a graze is caught to within 0.13 m of th)
  function segNear(r, x0, z0, x1, z1, th) {
    const o = r * ZS, b = Z[o + 9] + th, cx = Z[o + 1], cz = Z[o + 2];
    if (Math.max(x0, x1) < cx - b || Math.min(x0, x1) > cx + b || Math.max(z0, z1) < cz - b || Math.min(z0, z1) > cz + b) return false;
    const n = Math.min(160, Math.ceil(Math.hypot(x1 - x0, z1 - z0) * 4));
    for (let s = 0; s <= n; s++) if (zsd(r, x0 + (x1 - x0) * s / n, z0 + (z1 - z0) * s / n) < th) return true;
    return false;
  }
  function route(ax, az, bx, bz) {
    WN = 2; WX[0] = ax; WZ[0] = az; WX[1] = bx; WZ[1] = bz;
    for (let r = 0; r < nS; r++) {
      if (!segNear(r, ax, az, bx, bz, 0.45)) continue;
      const o = r * ZS, cx = Z[o + 1], cz = Z[o + 2], Rp = ((Z[o] === 1 ? Z[o + 8] : Math.hypot(Math.max(Z[o + 5], Z[o + 6]), Z[o + 7])) + 1) / 0.9239, e = 2 * Rp * 0.3827;
      for (let j = 0; j < 8; j++) { const q = j * 0.7854 + 0.3927; VX[j] = cx + Math.cos(q) * Rp; VZ[j] = cz + Math.sin(q) * Rp; visA[j] = segNear(r, ax, az, VX[j], VZ[j], 0.45) ? 0 : 1; visB[j] = segNear(r, VX[j], VZ[j], bx, bz, 0.45) ? 0 : 1; }
      let best = 1e9, ba = -1, bb = 0, bd = 1;
      for (let a = 0; a < 8; a++) if (visA[a]) for (let b = 0; b < 8; b++) if (visB[b]) for (let d = -1; d <= 1; d += 2) {
        const c = d > 0 ? (b - a + 8) % 8 : (a - b + 8) % 8, L = Math.hypot(VX[a] - ax, VZ[a] - az) + c * e + Math.hypot(bx - VX[b], bz - VZ[b]);
        if (L < best) { best = L; ba = a; bb = b; bd = d; }
      }
      if (ba < 0) return;
      let n = 1, j = ba; WX[0] = ax; WZ[0] = az;
      for (;;) { WX[n] = VX[j]; WZ[n] = VZ[j]; n++; if (j === bb) break; j = (j + bd + 8) % 8; }
      WX[n] = bx; WZ[n] = bz; WN = n + 1; return;
    }
  }

  function crewStep(t, prog) {
    const vis = gateK(prog);
    for (let i = 0; i < NW; i++) {
      const dur = 6 + 6 * H(i * 13 + 3), off = H(i * 7 + 1), k = Math.floor(t / dur + off), ts = (t / dur + off - k) * dur; // seconds into this spot's segment
      spot(i, k - 1, prog, SA); spot(i, k, prog, SB);
      route(SA[0], SA[2], SB[0], SB[2]);
      WC[0] = 0; for (let j = 1; j < WN; j++) WC[j] = WC[j - 1] + Math.hypot(WX[j] - WX[j - 1], WZ[j] - WZ[j - 1]);
      const dy = SB[1] - SA[1], L = Math.hypot(WC[WN - 1], dy);
      const v = Math.min(5, Math.max(1.3, L / (0.7 * dur))), Tw = L > 0.02 ? Math.min(L / v, 0.95 * dur) : 0, u = Tw > 0 ? Math.min(1, ts / Tw) : 1, s = u * WC[WN - 1];
      let j = 1; while (j < WN - 1 && WC[j] < s) j++; // leg j-1 -> j holds distance s
      const ll = WC[j] - WC[j - 1], q = ll > 1e-9 ? (s - WC[j - 1]) / ll : 1, hx = WX[j] - WX[j - 1], hz = WZ[j] - WZ[j - 1];
      // facing: the leg's heading while walking, the spot's facing once there; a short turn at each end
      let yaw = Tw > 0 ? Math.atan2(-hz, hx) : SB[3];
      if (Tw > 0 && ts < 0.5) yaw += wrap(SA[3] - yaw) * (1 - sstep(ts, 0, 0.5));
      if (ts > Tw) yaw += wrap(SB[3] - yaw) * sstep(ts - Tw, 0, 0.8);
      PX = WX[j - 1] + hx * q; PZ = WZ[j - 1] + hz * q; clearAll(CLR_D);
      const o = i * 5; crew[o] = PX; crew[o + 1] = SA[1] + dy * u; crew[o + 2] = PZ; crew[o + 3] = yaw; crew[o + 4] = vis;
    }
  }
  return { M, Z, crew, machines, crewStep, zsd, get nZ() { return nZ; }, get nS() { return nS; } };
}
