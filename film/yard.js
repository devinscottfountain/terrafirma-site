// yard.js: the Austin yard as pure numbers (no THREE, no DOM): where every moving machine is on the film clock t and build progress g
// (prog), the keep-out zone each one carries, and the 44 crew. site.js copies the results onto the meshes; test/check-crew.mjs (crew) and
// test/check-yard.mjs (machine vs machine, on the real model extents) step the same functions in node. Units are metres, lot frame
// (+x east, -z north). Nothing here keeps state between calls: the same (t, prog)
// always gives the same machines and crew, whatever came before (scrub back, jump, resume).
//
// createYard() -> { M, Z, crew, machines(t, prog), crewStep(t, prog), zsd(row, x, z), nZ }
//   M     machine poses (plain objects, reused): ex[2] (x, y, z, slew, boom, stick, load, bayTruck), tr[4] (x, z, yaw, fill, bay), dz,
//         pump (bx, C hose point), mix[2], crane (slew, tr, drop), digOn, xf, bay, pouring, craneOn, up, trucksOn
//   Z     keep-out zones, Float64Array rows of ZS: [kind, cx, cz, fx, fz, hf, hb, hw, r, bound]. kind 1 disc (r), kind 2 oriented box (forward
//         unit vector f, extents ahead hf / behind hb / half width hw). Rows [0, nS) are fixed on t (move with g only), the rest ride t
//   crew  Float64Array 5 per worker: x, y, z, yaw, scale (scale 0 = hidden, see GATES)

export const NW = 44, D = 4;
// integer hash that gives the same answer in JS doubles and GLSL floats (all intermediates stay under 2^24)
export const H = n => { const a = ((n % 1009) + 1009) % 1009; return ((a * a * 7 + a * 31 + 13) % 1009) / 1009; };
const sstep = (x, a, b) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const lerp = (a, b, k) => a + (b - a) * k;
// ---------------------------------------------------------------- site plan (metres, lot frame). Every machine keeps to its own lane, bay or pad:
//   haul road  one-way loop: in at the north gate, west on the north lane (z -27), round the west end (radius 27 about (-40, 0)), east on
//              the south lane (z 27), out at the south gate. Both lanes pass 0.57 m outside the excavators' swing reach (13 + 12 = 25)
//   bays       each excavator loads from a bay lane 5.5 m inside the haul road (z -21.5 / 21.5): at a 90 deg swing the bucket is over
//              the bed and the truck's near side is 7.07 m off the slew axis (tail swing 3.5 m). Trucks 0 and 2 load at excavator A
//              (north), 1 and 3 at B (south). A truck changes onto its bay lane before the swing reach and back after it, so the
//              others pass it on the haul road; the timetable below keeps every lane change clear of passing trucks
//   dozer      works its own pad (stripping ahead of the dig, the north half of the pit floor, then the south yard), reversing
//              between pushes and stepping over one lane each pass
//   pours      pump and mixers on the north edge (z -29); the crane's hook stays south of its mast, clear of the pump boom
export const EX_CYCLE = 7;
const EX_Z = 13, LANE = 27, BAY = 21.5, OFF = LANE - BAY, WEND = -40, GX = 86, GR = 8;
export const R_SW = 12; // CAT 336 swing reach: arm + stick + bucket at their longest in the dig cycle (11.93 m measured) -> 12
// truck model extents (machines.js, forward +x): front 4.95, rear 4.84, half width 1.43. A truck is on its bay lane while within
// BAY_X of its excavator (front or rear 0.5 m outside the swing chord on that lane, sqrt(12^2 - 7.07^2) = 9.7), lane change LR m long
const BAY_X = 15.5, LR = 22, BAY_DX = 1.64; // bed centre 1.64 m behind the truck origin: under the bucket at a 90 deg swing
// excavator A at z -13 swings north (+slew) to load and south to cast, B the other way
const SLEW_LOAD = Math.PI / 2, SLEW_CAST = 1.9;

// the haul road as dense samples (DS m): position, heading, speed and drive time. Street 12 m/s, lot 4.5 m/s, 1.2 m/s^2 between
const DS = 0.25, V_LOT = 4.5, V_ST = 12, ACC = 1.2;
const road = (() => {
  const P = []; let sN = 0, sS = 0;
  const line = (x0, z0, x1, z1, v) => { const n = Math.max(1, Math.round(Math.hypot(x1 - x0, z1 - z0) / DS)); for (let i = 0; i < n; i++) P.push(x0 + (x1 - x0) * i / n, z0 + (z1 - z0) * i / n, v); };
  const arc = (cx, cz, r, a0, a1, v) => { const n = Math.max(1, Math.round(Math.abs(a1 - a0) * r / DS)); for (let i = 0; i < n; i++) { const a = a0 + (a1 - a0) * i / n; P.push(cx + Math.cos(a) * r, cz + Math.sin(a) * r, v); } };
  line(GX, -420, GX, -LANE - GR, V_ST); arc(GX - GR, -LANE - GR, GR, 0, Math.PI / 2, V_LOT);
  sN = P.length / 3; line(GX - GR, -LANE, WEND, -LANE, V_LOT); arc(WEND, 0, LANE, -Math.PI / 2, -1.5 * Math.PI, V_LOT);
  sS = P.length / 3; line(WEND, LANE, GX - GR, LANE, V_LOT); arc(GX - GR, LANE + GR, GR, -Math.PI / 2, 0, V_LOT); line(GX, LANE + GR, GX, 420, V_ST);
  P.push(GX, 420, V_ST);
  const n = P.length / 3, X = new Float64Array(n), Z = new Float64Array(n), V = new Float64Array(n), S = new Float64Array(n), T = new Float64Array(n), HX = new Float64Array(n), HZ = new Float64Array(n);
  for (let i = 0; i < n; i++) { X[i] = P[i * 3]; Z[i] = P[i * 3 + 1]; V[i] = P[i * 3 + 2]; if (i) S[i] = S[i - 1] + Math.hypot(X[i] - X[i - 1], Z[i] - Z[i - 1]); }
  for (let i = 1; i < n; i++) V[i] = Math.min(V[i], Math.sqrt(V[i - 1] ** 2 + 2 * ACC * (S[i] - S[i - 1])));       // speed up after the lot
  for (let i = n - 2; i >= 0; i--) V[i] = Math.min(V[i], Math.sqrt(V[i + 1] ** 2 + 2 * ACC * (S[i + 1] - S[i]))); // slow down before it
  for (let i = 1; i < n; i++) T[i] = T[i - 1] + 2 * (S[i] - S[i - 1]) / (V[i] + V[i - 1]);
  for (let i = 0; i < n; i++) { const a = Math.max(0, i - 1), b = Math.min(n - 1, i + 1), L = Math.hypot(X[b] - X[a], Z[b] - Z[a]); HX[i] = (X[b] - X[a]) / L; HZ[i] = (Z[b] - Z[a]) / L; }
  return { n, X, Z, V, S, T, HX, HZ, sN: S[sN], sS: S[sS], len: S[n - 1], T_DRIVE: T[n - 1] };
})();
// timetable: a truck stops in its bay for DW s (2 s braking, D0 s standing, 2 s pulling off); four trucks HW s apart. Passing a bay
// truck takes DW > HW + 14 (the follower is past its lane change before it pulls out) and the bay is free again for the next truck
// of the same excavator 2 HW after: DW < 2 HW - 6. P = drive time + DW, HW = P / 4
const BRAKE = 2, D0 = 66, DW = D0 + 2 * BRAKE;
export const TRUCK_P = road.T_DRIVE + DW, HW = TRUCK_P / 4;
if (!(DW > HW + 14 && DW < 2 * HW - 6)) console.warn('yard.js: truck timetable out of its window', { DW, HW });
// drive time at arc length s / arc length at drive time u (binary search on the samples)
const uAt = s => { const R = road; let lo = 0, hi = R.n - 1; s = Math.min(R.len, Math.max(0, s)); while (hi - lo > 1) { const m = (lo + hi) >> 1; if (R.S[m] <= s) lo = m; else hi = m; } const f = (s - R.S[lo]) / (R.S[hi] - R.S[lo]); return R.T[lo] + (R.T[hi] - R.T[lo]) * f; };
let rI = 0, rF = 0; // sample index and fraction of the last sAt / point lookup
const sAt = u => { const R = road; let lo = 0, hi = R.n - 1; u = Math.min(R.T_DRIVE, Math.max(0, u)); while (hi - lo > 1) { const m = (lo + hi) >> 1; if (R.T[m] <= u) lo = m; else hi = m; } rI = lo; rF = (u - R.T[lo]) / (R.T[hi] - R.T[lo]); return R.S[lo] + (R.S[hi] - R.S[lo]) * rF; };
// real time in a truck's cycle -> drive time: brake over 2 s into the bay at drive time ub, stand D0, pull off over 2 s
function warp(tau, ub) {
  const a = BRAKE, q0 = tau - (ub - a);
  if (q0 < 0) return tau;
  if (q0 < 2 * a) return ub - a + q0 - q0 * q0 / (4 * a);
  const q1 = tau - (ub + a + D0);
  if (q1 < 0) return ub;
  if (q1 < 2 * a) return ub + q1 * q1 / (4 * a);
  return tau - D0 - 2 * a;
}
const dwarp = (tau, ub) => { const a = BRAKE, q0 = tau - (ub - a); if (q0 < 0) return 1; if (q0 < 2 * a) return 1 - q0 / (2 * a); const q1 = tau - (ub + a + D0); if (q1 < 0) return 0; if (q1 < 2 * a) return q1 / (2 * a); return 1; };
const mod = (a, b) => ((a % b) + b) % b;
const dss = (x, a, b) => { const u = (x - a) / (b - a); return u <= 0 || u >= 1 ? 0 : 6 * u * (1 - u) / (b - a); }; // d/dx of sstep

// dozer passes: push along a lane (x0 -> x1), reverse on a slight diagonal to the next lane, lanes in ping-pong order. Writes o
const DZ_F = 2.2, DZ_R = 3.0, DZ_TURN = 1.2; // push / reverse speed (average, m/s), s to turn onto the new heading
const laneOf = (lanes, j) => { const N = lanes.length, per = 2 * N - 2, p = mod(j, per); return lanes[p < N ? p : per - p]; };
const revYaw = (lanes, j, L) => Math.atan2(-(laneOf(lanes, j) - laneOf(lanes, j + 1)), L); // reversing from lane j to j + 1, nose back up the push
function doze(t, lanes, x0, x1, o) {
  const L = x1 - x0, sp = lanes[1] - lanes[0], Tf = L / DZ_F, Tr = Math.hypot(L, sp) / DZ_R, Tp = Tf + Tr;
  const k = Math.floor(t / Tp), q = t - k * Tp, a = laneOf(lanes, k), b = laneOf(lanes, k + 1);
  if (q < Tf) { const u = q / Tf; o.x = x0 + L * sstep(u, 0, 1); o.z = a; o.yaw = revYaw(lanes, k - 1, L) * (1 - sstep(q, 0, DZ_TURN)); o.v = L * dss(u, 0, 1) / Tf; }
  else { const u = (q - Tf) / Tr, f = sstep(u, 0, 1); o.x = x1 - L * f; o.z = a + (b - a) * f; o.yaw = revYaw(lanes, k, L) * sstep(q - Tf, 0, DZ_TURN); o.v = Math.hypot(L, sp) * dss(u, 0, 1) / Tr; }
}
const PAD_STRIP = [-14, -7, 0, 7, 14], PAD_PIT = [-14.5, -9.5, -4.5], PAD_YARD = [27, 32, 37];
// pump: the hose sweeps the active bay (x offset from the pump, x amplitude, z centre; z amplitude 2). Bay 3 holds the crane mast
// (-4, 4): its sweep sits west of it with the boom 3 m clear. Bays 2 and 5 keep 2 m off the cores rising in them
const PUMP_W = 0.45, SLEW_W = 0.09;
const HOSE = [[0, 3, -9.5], [0, 3, 9.5], [4, 3, -12], [-2, 1.5, 9.5], [0, 3, -9.5], [-2, 3, 11], [0, 3, -9.5], [0, 3, 9.5]];

// keep-out sizes for the crew (m). Moving machines: footprint + MM all round + a travel buffer (BUF s of travel + 2 m) ahead; static
// ones: footprint + SM. Running excavators: the whole swing circle R_SW, whatever the arm is doing
const SM = 0.5, MM = 0.6, BUF = 2, BUF_T = 1; // trucks: 1 s of travel (their lanes keep away from every job)
// crew: spots sit >= SPOT_D outside every fixed zone, the final clamp puts every worker CLR_D outside all of them (one still closer
// than CREW_R, squeezed between two zones, is hidden for those frames)
const SPOT_D = 0.6, CLR_D = 0.35, CREW_R = 0.3, ZS = 10, ZMAX = 24; // a worker is 0.3 m in radius
// build-progress values where machines appear / vanish or the crew changes job or bay: the crew blink (scale to 0) across them so a
// spot never jumps in view. Hidden within +-GW0, fully back at +-GW1
const GATES = [0.06, 0.07, 0.1, 0.3, 0.404, 0.42, 0.44, 0.455, 0.46, 0.484, 0.512, 0.54, 0.568, 0.596, 0.624, 0.652, 0.69, 0.72, 0.8, 0.85, 0.86, 0.95];
const GW0 = 0.0008, GW1 = 0.0025;
// light towers (machines.js places the meshes from this list, site.js the work-light pools)
export const TOWERS = [[-60, -42], [60, -42], [-60, 42], [20, 33]];

export function createYard() {
  const ex = [0, 1].map(() => ({ on: false, x: 0, y: 0, z: 0, ph: 0, sw: 0, slew: 0, boom: 0, stick: 0, load: false, bayTruck: -1 })),
    tr = [0, 1, 2, 3].map(() => ({ on: false, x: 0, z: 0, yaw: 0, load: false, fill: 0, v: 0, bay: false })),
    mix = [0, 1].map(() => ({ x: 0, z: -29 }));
  const M = { ex, tr, mix, dz: { on: false, x: 0, y: 0, z: 0, yaw: 0, v: 0 }, pump: { on: false, bx: 0, z: -29, C: [0, 0, 0] }, crane: { slew: 0, tr: 0, drop: 0 },
    digOn: false, xf: 0, bay: 0, pouring: false, craneOn: false, up: 0, trucksOn: false };
  const Z = new Float64Array(ZMAX * ZS), crew = new Float64Array(NW * 5);
  let nZ = 0, nS = 0;
  const disc = (x, z, r) => { const o = nZ++ * ZS; Z[o] = 1; Z[o + 1] = x; Z[o + 2] = z; Z[o + 8] = Z[o + 9] = r; };
  // box at (x, z) turned yaw (three's rotation.y: forward = (cos, -sin)), local extents a ahead, b behind, w half width, grown by m
  const box = (x, z, yaw, a, b, w, m, buf = 0) => { const o = nZ++ * ZS; Z[o] = 2; Z[o + 1] = x; Z[o + 2] = z; Z[o + 3] = Math.cos(yaw); Z[o + 4] = -Math.sin(yaw); Z[o + 5] = a + m + buf; Z[o + 6] = b + m + buf; Z[o + 7] = w + m; Z[o + 9] = Math.hypot(Math.max(Z[o + 5], Z[o + 6]), Z[o + 7]); };
  // one-sided: the buffer only ahead (trucks); the dozer drives both ways in turn, so it gets it on both ends
  const boxF = (x, z, yaw, a, b, w, m, buf) => { box(x, z, yaw, a, b, w, m); Z[(nZ - 1) * ZS + 5] += buf; Z[(nZ - 1) * ZS + 9] = Math.hypot(Math.max(Z[(nZ - 1) * ZS + 5], Z[(nZ - 1) * ZS + 6]), Z[(nZ - 1) * ZS + 7]); };

  // per bay (0 north / A, 1 south / B): arc length of the stop, the lane change in (s0..s1) and back out (s2..s3), drive time at the stop
  const BQ = [new Float64Array(5), new Float64Array(5)];
  function bays(xe) {
    const sN = road.sN + (GX - GR), sS = road.sS - WEND; // arc length at lane x = 0, westbound north / eastbound south
    let b = BQ[0]; b[0] = sN - (xe - BAY_DX); b[2] = sN - (xe + BAY_X); b[1] = b[2] - LR; b[3] = sN - (xe - BAY_X); b[4] = b[3] + LR;
    b = BQ[1]; b[0] = sS + xe + BAY_DX; b[2] = sS + xe - BAY_X; b[1] = b[2] - LR; b[3] = sS + xe + BAY_X; b[4] = b[3] + LR;
  }
  // truck j's cycle time at real time t, and the drive time of its stop
  const tauOf = (j, t) => mod(t - j * HW, TRUCK_P);
  // is cycle c of excavator i (start tc) a loading cycle: one of its trucks stands in the bay for the whole cycle
  function loads(i, tc, ub) {
    if (!M.trucksOn) return -1;
    for (let j = i; j < 4; j += 2) { const tau = tauOf(j, tc); if (tau >= ub + BRAKE + 0.2 && tau + EX_CYCLE <= ub + BRAKE + D0 - 0.2) return j; }
    return -1;
  }
  const exOff = i => i * 0.37;

  // machine poses and keep-out zones for (t, prog). Everything is a closed form of (t, prog): no state between calls
  function machines(t, prog) {
    const digOn = prog > 0.06 && prog < 0.42, xf = -32 + sstep(prog, 0.07, 0.36) * 76;
    M.digOn = digOn; M.xf = xf; nZ = 0; M.trucksOn = prog > 0.07 && prog < 0.42;
    // fixed: office trailer (60 x 12 ft, doors and stairs on +z), light towers, dumpster
    box(52, -45, 0, 9.15, 9.15, 3.6, SM); box(62, 44, 0, 3.1, 3.1, 1.2, SM);
    for (let i = 0; i < TOWERS.length; i++) disc(TOWERS[i][0], TOWERS[i][1], 2.7 + SM);
    const up = sstep(prog, 0.4, 0.47); M.up = up; M.craneOn = up > 0.01; if (M.craneOn) box(-4, 4, 0, 3, 3, 3, SM); // tower crane footing
    // pours: pump parks on the north edge opposite the active bay, two mixers queue behind it
    const bay = Math.min(7, Math.max(0, Math.floor((prog - 0.47) / 0.028 + 0.5))), pouring = prog > 0.455 && prog < 0.69;
    M.bay = bay; M.pouring = pouring; M.pump.on = pouring;
    if (pouring) {
      const bx = -32 + Math.floor(bay / 2) * 16 + 8, hs = HOSE[bay]; M.pump.bx = bx;
      const C = M.pump.C; C[0] = bx + hs[0] + Math.sin(t * PUMP_W) * hs[1]; C[1] = -D + 3.5; C[2] = hs[2] + Math.cos(t * PUMP_W * 0.8) * 2; // hose over the bay
      box(bx, -29, 0, 6.5, 6.38, 4.9, SM); // chassis and the deployed outriggers (4.9 m out each side)
      for (let i = 0; i < 2; i++) { mix[i].x = bx + 12 + i * 11; mix[i].z = -29; box(mix[i].x, -29, 0, 5.05, 5.04, 1.43, SM); }
    }
    // crane: the jib slews over the south side only (the pump boom never comes south of z 12), hook >= 5.6 m above the ground
    { const sw = t * SLEW_W, K = M.crane; K.slew = -Math.PI / 2 + 0.5 * (Math.sin(sw) * 0.7 + Math.sin(sw * 2.3) * 0.3);
      K.tr = 12 + (Math.sin(t * 0.13) * 0.5 + 0.5) * 36; K.drop = 10 + (Math.sin(t * 0.21) * 0.5 + 0.5) * 20; }
    // excavators ride the dig face, which scroll moves; each digs east, then swings 90 deg out to the truck in its bay, or casts the
    // bucket 109 deg in when no truck stands there for the whole cycle
    const xe = Math.min(26, Math.max(-28, xf - 6)); bays(xe);
    const ubA = uAt(BQ[0][0]), ubB = uAt(BQ[1][0]);
    for (let i = 0; i < 2; i++) {
      const e = ex[i], late = i === 1 && prog > 0.8, cy = t / EX_CYCLE + exOff(i), c = Math.floor(cy), ph = cy - c;
      e.on = digOn || (i === 1 && prog > 0.8 && prog < 0.95); e.ph = ph; e.sw = sstep(ph, 0.35, 0.55) * (1 - sstep(ph, 0.7, 0.95));
      e.x = late ? 41 : xe; e.y = late ? -1 : -D * sstep(prog, 0.07, 0.12); e.z = i ? EX_Z : -EX_Z;
      const j = late ? -1 : loads(i, (c - exOff(i)) * EX_CYCLE, i ? ubB : ubA), sw = e.sw, s = i ? -1 : 1;
      e.load = j >= 0; e.bayTruck = -1;
      const boomD = 0.35 - sstep(ph, 0, 0.3) * 0.55, stickD = 1.05 + sstep(ph, 0.05, 0.33) * 0.9;
      if (e.load) { // boom up before the bucket reaches the truck (sw 0.4, 36 deg: B's trucks face east, so its arm crosses the cab end), stick open: the bucket clears the body by 0.3 m
        const k = sstep(sw, 0, 0.4); e.slew = sw * s * SLEW_LOAD; e.boom = lerp(boomD, 1.0, k); e.stick = -lerp(stickD, 0.6 - sstep(ph, 0.55, 0.68) * 0.25, k);
      } else { e.slew = -sw * s * SLEW_CAST; e.boom = lerp(boomD, 0.62, sw); e.stick = -lerp(stickD, 0.9 - sstep(ph, 0.55, 0.68) * 0.5, sw); }
      if (e.on) disc(e.x, e.z, R_SW);
    }
    nS = nZ;
    // haul trucks: the timetable above, on the haul road; on their bay lane near their own excavator
    for (let j = 0; j < 4; j++) {
      const T = tr[j], b = BQ[j % 2], ub = j % 2 ? ubB : ubA, tau = tauOf(j, t), u = warp(tau, ub), s = sAt(u), R = road, i0 = rI, i1 = Math.min(R.n - 1, i0 + 1), f = rF;
      T.on = M.trucksOn;
      const k = OFF * sstep(s, b[1], b[2]) * (1 - sstep(s, b[3], b[4])), dk = OFF * (dss(s, b[1], b[2]) * (1 - sstep(s, b[3], b[4])) - sstep(s, b[1], b[2]) * dss(s, b[3], b[4]));
      const hx = R.HX[i0] + (R.HX[i1] - R.HX[i0]) * f, hz = R.HZ[i0] + (R.HZ[i1] - R.HZ[i0]) * f, hl = Math.hypot(hx, hz) || 1, nx = hz / hl, nz = -hx / hl; // inside normal
      T.x = R.X[i0] + (R.X[i1] - R.X[i0]) * f + nx * k; T.z = R.Z[i0] + (R.Z[i1] - R.Z[i0]) * f + nz * k;
      T.yaw = Math.atan2(-(hz / hl + nz * dk), hx / hl + nx * dk);
      T.v = (R.V[i0] + (R.V[i1] - R.V[i0]) * f) * dwarp(tau, ub); T.bay = k > 0.01;
      // load: one heap, raised a step per bucket dumped (excavator cycles inside this truck's stand), full on the way out
      const w0 = ub + BRAKE, w1 = w0 + D0;
      if (tau < w0) T.fill = 0; else if (tau > w1) T.fill = 1;
      else { const i = j % 2, o = exOff(i), tw0 = t - (tau - w0), c0 = Math.ceil((tw0 + 0.2) / EX_CYCLE + o), c1 = Math.floor((tw0 + D0 - 0.2) / EX_CYCLE + o) - 1, cd = Math.floor(t / EX_CYCLE + o - 0.62);
        T.fill = c1 >= c0 ? Math.min(1, Math.max(0, (cd - c0 + 1) / (c1 - c0 + 1))) : 1; }
      T.load = T.fill > 0.01;
      if (T.bay && ex[j % 2].on) ex[j % 2].bayTruck = j;
      if (T.on) boxF(T.x, T.z, T.yaw, 4.95, 4.84, 1.43, MM, BUF_T * T.v + 1.5);
    }
    // dozer: strips the pad ahead of the dig, grades the north half of the pit floor, then fine grades the south yard
    const dz = M.dz; let on = true;
    if (prog < 0.1) { doze(t, PAD_STRIP, -3, 27, dz); dz.y = 0; }
    else if (prog > 0.3 && prog < 0.44) { doze(t, PAD_PIT, -26, 9, dz); dz.y = -D; }
    else if (prog > 0.86) { doze(t, PAD_YARD, -42, 6, dz); dz.y = 0; }
    else { on = false; dz.x = dz.z = dz.v = dz.y = dz.yaw = 0; }
    dz.on = on;
    if (on) box(dz.x, dz.z, dz.yaw, 2.92, 2.45, 1.76, MM, BUF * dz.v + 2); // blade 3.4 m wide, 5.4 m long; reverses at each lane end, so a buffer both ways
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
    else if (i < 34 && M.digOn) { // spotters: on the front arc of the swing circle of their excavator (odd: north one), 3 to 34 deg off its
      // dig line towards the pit centre: the bay lane and the trucks changing onto it are on the other side
      const e = ex[i % 2 ? 0 : 1], a = (e.z < 0 ? 1 : -1) * (0.05 + r1 * 0.55), r = R_SW + 1.5 + r2 * 3.5;
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
      // squeezed between two zones (a truck's travel buffer against a swing circle): stand down for those frames rather than overlap
      let sc = vis; for (let r = 0; r < nZ && sc > 0; r++) if (near(r, PX, PZ, CLR_D) && zsd(r, PX, PZ) < CREW_R) sc = 0;
      const o = i * 5; crew[o] = PX; crew[o + 1] = SA[1] + dy * u; crew[o + 2] = PZ; crew[o + 3] = yaw; crew[o + 4] = sc;
    }
  }
  return { M, Z, crew, machines, crewStep, zsd, get nZ() { return nZ; }, get nS() { return nS; } };
}
