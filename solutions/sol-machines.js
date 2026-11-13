// sol-machines.js: procedural wireframe construction machines for the Solutions section: excavator, crawler dozer and
// padfoot compactor (the designer's vehicles), plus the earlier backhoe loader and roller stand-ins kept as spare slots. Hidden-line look: a black solid with polygonOffset hides back edges, an
// EdgesGeometry overlay draws the white line art. Geometry is built once per machine type and shared by
// every instance; only track shoes are per instance (they move along the track loop when driving).
// Units are metres; forward is +x, up is +y, right is +z.

const EDGE_DEG = 26;

// opts.line: line art colour (any THREE.Color input), opts.solid: the hidden-line occluder colour
export function createMachineKit(THREE, { line = 0xffffff, solid = 0x000000 } = {}) {
  const LINE = new THREE.Color(line), SOLID = new THREE.Color(solid);
  const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), V = new THREE.Vector3(), S1 = new THREE.Vector3(1, 1, 1);
  const UP = new THREE.Vector3(0, 1, 0), A = new THREE.Vector3(), B = new THREE.Vector3(), D = new THREE.Vector3();

  // a part collects triangle soup, then becomes one solid + one edge geometry
  function part() {
    const arrs = [], segs = [];
    const P = {
      add(g, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) {
        E.set(rx, ry, rz); Q.setFromEuler(E); V.set(x, y, z); M.compose(V, Q, S1);
        return P.addM(g, M);
      },
      addM(g, m) {
        const n = g.index ? g.toNonIndexed() : g;
        n.applyMatrix4(m); arrs.push(n.attributes.position.array.slice());
        if (n !== g) n.dispose(); g.dispose(); return P;
      },
      box(w, h, d, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) { return P.add(new THREE.BoxGeometry(w, h, d), x, y, z, rx, ry, rz); },
      bx(x0, y0, z0, x1, y1, z1) { return P.box(Math.abs(x1 - x0), Math.abs(y1 - y0), Math.abs(z1 - z0), (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); },
      // cylinder, axis 'x' | 'y' | 'z'
      cyl(r, len, x, y, z, seg = 20, axis = 'z', r2 = r, open = false) {
        const g = new THREE.CylinderGeometry(r2, r, len, seg, 1, open);
        return P.add(g, x, y, z, axis === 'z' ? Math.PI / 2 : 0, 0, axis === 'x' ? -Math.PI / 2 : 0);
      },
      // round rod between two points
      rod(a, b, r, seg = 8) {
        A.fromArray(a); B.fromArray(b); D.subVectors(B, A); const L = D.length(); D.normalize();
        Q.setFromUnitVectors(UP, D); V.addVectors(A, B).multiplyScalar(0.5); M.compose(V, Q, S1);
        return P.addM(new THREE.CylinderGeometry(r, r, L, seg, 1), M);
      },
      // square bar between two points, t across, t2 the other way (bar lies flat in the plane with normal +z when possible)
      bar(a, b, t, t2 = t) {
        A.fromArray(a); B.fromArray(b); D.subVectors(B, A); const L = D.length();
        const yaw = Math.atan2(-D.z, D.x), pitch = Math.atan2(D.y, Math.hypot(D.x, D.z));
        E.set(0, yaw, pitch, 'YZX'); Q.setFromEuler(E); V.addVectors(A, B).multiplyScalar(0.5); M.compose(V, Q, S1); E.order = 'XYZ';
        return P.addM(new THREE.BoxGeometry(L, t, t2), M);
      },
      // side profile in XY extruded along z from z0 to z0 + depth
      ext(pts, depth, z0 = 0, curve = 6) {
        const sh = new THREE.Shape(pts.map(p => new THREE.Vector2(p[0], p[1])));
        const g = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: false, curveSegments: curve });
        return P.add(g, 0, 0, z0);
      },
      // shape helper with arcs: shape built by a callback
      extShape(build, depth, z0 = 0, curve = 10) {
        const sh = new THREE.Shape(); build(sh);
        return P.add(new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: false, curveSegments: curve }), 0, 0, z0);
      },
      // plan view outline (x, z) extruded up from y0 by h
      extUp(pts, h, y0 = 0) {
        const sh = new THREE.Shape(pts.map(p => new THREE.Vector2(p[0], -p[1])));
        const g = new THREE.ExtrudeGeometry(sh, { depth: h, bevelEnabled: false, curveSegments: 8 });
        g.rotateX(-Math.PI / 2); return P.add(g, 0, y0, 0);
      },
      // drawn detail: a polyline that is only line art (grid on a blade face, grille bars, panel breaks), m = optional Matrix4
      line(pts, m = null) {
        for (let i = 0; i + 1 < pts.length; i++) for (const q of [pts[i], pts[i + 1]]) {
          V.set(q[0], q[1], q[2]); if (m) V.applyMatrix4(m); segs.push(V.x, V.y, V.z);
        }
        return P;
      },
      build() {
        let n = 0; for (const a of arrs) n += a.length;
        const pos = new Float32Array(n); let o = 0; for (const a of arrs) { pos.set(a, o); o += a.length; }
        const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        let edges = new THREE.EdgesGeometry(geo, EDGE_DEG);
        if (segs.length) { // merge the drawn lines into the same edge geometry (one draw call)
          const ea = edges.attributes.position.array, all = new Float32Array(ea.length + segs.length);
          all.set(ea); all.set(segs, ea.length); edges.dispose();
          edges = new THREE.BufferGeometry(); edges.setAttribute('position', new THREE.BufferAttribute(all, 3));
        }
        geo.computeBoundingSphere(); edges.computeBoundingSphere();
        return { geo, edges };
      },
    };
    return P;
  }

  // tyre with V tread lugs, rim and hub; axis along z, centred at origin
  // z0: axle offset along z, so two tyres on one axle can share one node
  function wheel(P, r, w, { lugs = 22, rim = 0.6, side = 1, lugD = 0.07, z0 = 0, lugW = 0.11, lugA = 0.42 } = {}) {
    P.cyl(r, w, 0, 0, z0, 32);
    P.cyl(r * 0.92, 0.02, 0, 0, z0 + side * (w / 2 + 0.005), 32); // sidewall bead line
    P.cyl(r * rim, 0.04, 0, 0, z0 + side * (w / 2 + 0.01), 24); // rim face
    P.cyl(r * rim * 0.45, 0.12, 0, 0, z0 + side * (w / 2 + 0.05), 16); // hub
    for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2, rr = r * rim * 0.72; P.cyl(0.035, 0.06, Math.cos(a) * rr, Math.sin(a) * rr, z0 + side * (w / 2 + 0.04), 6); } // lug nuts
    for (let k = 0; k < lugs; k++) {
      const a = (k / lugs) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a), rr = r + lugD / 2 - 0.01;
      for (const h of [-1, 1]) { // chevron: two lugs leaning opposite ways
        const zc = z0 + h * w * 0.24;
        const g = new THREE.BoxGeometry(lugW, lugD, w * 0.46);
        g.rotateX(h * lugA); g.rotateZ(a - Math.PI / 2); g.translate(c * rr, s * rr, zc); P.add(g);
      }
    }
    return P;
  }

  // ------------------------------------------------------------------ track loop with moving shoes (per instance)
  // belt: the pitch line round a convex set of wheels [[x, y, r], ...] listed clockwise (top run first, going +x).
  // at(s) -> [x, y, normal x, normal y], s = arc length; no allocation.
  function belt(C) {
    const n = C.length, T = [], P = [];   // tangent runs, then pieces: line or arc
    for (let i = 0; i < n; i++) {
      const a = C[i], b = C[(i + 1) % n], dx = b[0] - a[0], dy = b[1] - a[1], D = Math.hypot(dx, dy), ux = dx / D, uy = dy / D;
      const k = (a[2] - b[2]) / D, q = Math.sqrt(1 - k * k), nx = k * ux - q * uy, ny = k * uy + q * ux;   // outward normal of the run
      T.push({ ax: a[0] + a[2] * nx, ay: a[1] + a[2] * ny, bx: b[0] + b[2] * nx, by: b[1] + b[2] * ny, nx, ny });
    }
    let len = 0;
    for (let i = 0; i < n; i++) {
      const t = T[i], L = Math.hypot(t.bx - t.ax, t.by - t.ay); P.push({ arc: false, s0: len, L, t }); len += L;
      const c = C[(i + 1) % n], u = T[(i + 1) % n], th0 = Math.atan2(t.ny, t.nx);
      let sw = th0 - Math.atan2(u.ny, u.nx); while (sw < 0) sw += Math.PI * 2; while (sw >= Math.PI * 2) sw -= Math.PI * 2;
      P.push({ arc: true, s0: len, L: sw * c[2], c, th0 }); len += sw * c[2];
    }
    const pt = [0, 0, 0, 0];
    return {
      len,
      at(s) {
        s = ((s % len) + len) % len; let i = 0; while (i < P.length - 1 && s >= P[i].s0 + P[i].L) i++;
        const p = P[i], u = s - p.s0;
        if (!p.arc) { const k = p.L > 0 ? u / p.L : 0, t = p.t; pt[0] = t.ax + (t.bx - t.ax) * k; pt[1] = t.ay + (t.by - t.ay) * k; pt[2] = t.nx; pt[3] = t.ny; }
        else { const th = p.th0 - u / p.c[2]; pt[2] = Math.cos(th); pt[3] = Math.sin(th); pt[0] = p.c[0] + p.c[2] * pt[2]; pt[1] = p.c[1] + p.c[2] * pt[3]; }
        return pt;
      },
    };
  }
  // shoes along a belt path (both sides), local x along the tangent, y outward. rib: grouser height
  function makeTrack(path, w, zcs, yc, pitchWanted = 0.21, rib = 0.06) {
    const Pm = path.len, n = Math.round(Pm / pitchWanted), pitch = Pm / n;
    const shoe = new THREE.BoxGeometry(pitch * 0.82, 0.07, w).toNonIndexed(); shoe.translate(0, 0.035, 0);
    const rb = new THREE.BoxGeometry(0.05, rib, w).toNonIndexed(); rb.translate(0, 0.065 + rib / 2, 0);
    const solidLocal = new Float32Array([...shoe.attributes.position.array, ...rb.attributes.position.array]);
    const eg1 = new THREE.EdgesGeometry(shoe), eg2 = new THREE.EdgesGeometry(rb);
    const edgeLocal = new Float32Array([...eg1.attributes.position.array, ...eg2.attributes.position.array]);
    shoe.dispose(); rb.dispose(); eg1.dispose(); eg2.dispose();
    const nz = zcs.length, sCnt = solidLocal.length / 3, eCnt = edgeLocal.length / 3;
    const sPos = new Float32Array(n * nz * sCnt * 3), ePos = new Float32Array(n * nz * eCnt * 3);
    const sGeo = new THREE.BufferGeometry(), eGeo = new THREE.BufferGeometry();
    sGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3).setUsage(THREE.DynamicDrawUsage));
    eGeo.setAttribute('position', new THREE.BufferAttribute(ePos, 3).setUsage(THREE.DynamicDrawUsage));
    const write = (out, local, cnt, base, px, py, nx, ny, zc) => {
      const tx = ny, ty = -nx; // tangent
      for (let v = 0; v < cnt; v++) {
        const lx = local[v * 3], ly = local[v * 3 + 1], lz = local[v * 3 + 2], o = (base + v) * 3;
        out[o] = px + lx * tx + ly * nx; out[o + 1] = yc + py + lx * ty + ly * ny; out[o + 2] = zc + lz;
      }
    };
    let last = NaN;
    const update = off => {
      if (off === last) return; last = off;
      for (let k = 0; k < n; k++) {
        const p = path.at(k * pitch + off), px = p[0], py = p[1], nx = p[2], ny = p[3];
        for (let j = 0; j < nz; j++) {
          const idx = k * nz + j;
          write(sPos, solidLocal, sCnt, idx * sCnt, px, py, nx, ny, zcs[j]);
          write(ePos, edgeLocal, eCnt, idx * eCnt, px, py, nx, ny, zcs[j]);
        }
      }
      sGeo.attributes.position.needsUpdate = true; eGeo.attributes.position.needsUpdate = true;
    };
    update(0); sGeo.computeBoundingSphere(); eGeo.computeBoundingSphere();
    sGeo.boundingSphere.radius += 1; eGeo.boundingSphere.radius += 1;
    return { geo: sGeo, edges: eGeo, update, shoes: n * nz, dispose() { sGeo.dispose(); eGeo.dispose(); } };
  }

  // ------------------------------------------------------------------ materials per instance
  // clip: every machine fades out above a screen line (x = its y in drawing-buffer px from the bottom, y = soft px),
  // so nothing shows through the page heading
  const clip = { value: new THREE.Vector2(1e5, 1) };
  const clipped = (mat, solid) => {
    mat.onBeforeCompile = sh => {
      sh.uniforms.uClip = clip;
      sh.fragmentShader = 'uniform vec2 uClip;\n' + sh.fragmentShader.replace(/}\s*$/, solid
        ? '  if (gl_FragCoord.y > uClip.x - uClip.y*.5) discard;\n}'
        : '  gl_FragColor.a *= clamp((uClip.x - gl_FragCoord.y) / uClip.y, 0., 1.);\n}');
    };
    mat.customProgramCacheKey = () => (solid ? 'mclipS' : 'mclipL');
    return mat;
  };
  function mats() {
    const solid = clipped(new THREE.MeshBasicMaterial({ color: SOLID, polygonOffset: true, polygonOffsetFactor: 1.5, polygonOffsetUnits: 2 }), true);
    const line = clipped(new THREE.LineBasicMaterial({ color: LINE, transparent: true, opacity: 0.92 }), false);
    return { solid, line };
  }
  const node = (tpl, m) => {
    const g = new THREE.Group();
    if (tpl) {
      const mesh = new THREE.Mesh(tpl.geo, m.solid); mesh.renderOrder = 1; g.add(mesh);
      const ls = new THREE.LineSegments(tpl.edges, m.line); ls.renderOrder = 2; g.add(ls);
    }
    return g;
  };
  // the black hidden-line occluder fades with the wireframe: no fill and no depth while a machine is mostly faded,
  // so a machine crossfading in never darkens or cuts the zones under it
  const opacityFn = (root, m) => o => {
    root.visible = o > 0.004;
    m.line.opacity = 0.92 * o;
    const so = Math.min(1, Math.max(0, (o - 0.8) / 0.2)), tr = so < 0.999; // occluder clears first: no black silhouette left behind
    if (m.solid.transparent !== tr) { m.solid.transparent = tr; m.solid.needsUpdate = true; }
    m.solid.opacity = so * so * so; m.solid.depthWrite = so > 0.9; m.solid.colorWrite = so > 0.004;
  };

  // ================================================================== EXCAVATOR (36 t class)
  const TL = 3.7, TR = 0.46, TW = 0.6, TZ = 1.28, TY = 0.53;
  let excT = null;
  function excTemplate() {
    if (excT) return excT;
    // undercarriage
    const u = part();
    for (const s of [-1, 1]) {
      const zc = s * TZ;
      u.extShape(sh => { sh.moveTo(-TL / 2, -TR + 0.06); sh.lineTo(TL / 2, -TR + 0.06); sh.absarc(TL / 2, 0, TR - 0.06, -Math.PI / 2, Math.PI / 2, false); sh.lineTo(-TL / 2, TR - 0.06); sh.absarc(-TL / 2, 0, TR - 0.06, Math.PI / 2, Math.PI * 1.5, false); }, TW * 0.7, zc - TW * 0.35, 12);
      for (const x of [-TL / 2, TL / 2]) { u.cyl(0.4, TW * 0.9, x, 0, zc, 24); u.cyl(0.16, TW + 0.12, x, 0, zc, 16); } // idler, sprocket, hubs
      for (let k = 0; k < 7; k++) u.cyl(0.13, TW * 0.8, -1.35 + k * 0.45, -0.3, zc, 12); // bottom rollers
      for (const x of [-0.7, 0.7]) u.cyl(0.09, TW * 0.5, x, 0.36, zc, 10); // carrier rollers
      for (let k = 0; k < 4; k++) u.bx(-1.25 + k * 0.7, -0.22, zc + s * (TW * 0.35), -0.95 + k * 0.7, 0.18, zc + s * (TW * 0.35 + 0.03)); // frame windows
      u.bx(-TL / 2 + 0.1, 0.32, zc - 0.32, TL / 2 - 0.1, 0.38, zc + 0.32); // track guard
    }
    u.bx(-1.0, 0.0, -TZ + 0.3, 1.0, 0.42, TZ - 0.3); // car body
    u.cyl(1.0, 0.16, 0, 0.5, 0, 28, 'y'); // swing bearing
    const under = u.build();
    for (const k in under) under[k].translate(0, TY, 0);

    // upper structure, origin at swing centre top of bearing
    const t = part();
    t.bx(-2.55, 0, -1.45, 1.45, 0.28, 1.45); // deck
    t.extUp([[-1.9, -1.42], [-1.9, 1.42], [-2.35, 1.35], [-2.7, 1.0], [-2.85, 0.5], [-2.9, 0], [-2.85, -0.5], [-2.7, -1.0], [-2.35, -1.35]], 1.0, 0.28); // counterweight
    t.bx(-2.4, 1.28, -1.3, -1.95, 1.3, 1.3);
    t.bx(-1.9, 0.28, -0.4, -0.15, 1.15, 1.4); // engine hood
    t.bx(-1.85, 1.15, -0.35, -0.2, 1.22, 1.35);
    for (let k = 0; k < 7; k++) t.bx(-1.75 + k * 0.2, 1.22, 0.55, -1.65 + k * 0.2, 1.25, 1.25); // grille slats
    t.bx(-1.9, 0.28, -1.45, -0.15, 0.95, -0.42); // pump compartment
    t.bx(0.15, 0.28, 0.75, 1.42, 0.95, 1.45); // tool box
    for (let k = 0; k < 3; k++) t.bx(0.3 + k * 0.38, 0.95, 0.85, 0.55 + k * 0.38, 0.97, 1.35);
    t.rod([-1.2, 1.15, -0.15], [-1.2, 1.9, -0.15], 0.08, 10); t.cyl(0.11, 0.08, -1.2, 1.9, -0.15, 10, 'y'); // exhaust
    for (const z of [1.38, -0.38]) { t.rod([-1.85, 1.15, z], [-1.85, 1.55, z], 0.025, 6); t.rod([-0.3, 1.15, z], [-0.3, 1.55, z], 0.025, 6); t.rod([-1.85, 1.55, z], [-0.3, 1.55, z], 0.025, 6); } // rails
    // cab: frame posts, roof, panes as thin plates so the window frames read
    const cx0 = -0.1, cx1 = 1.4, cz0 = -1.45, cz1 = -0.5, cy0 = 0.28, cy1 = 2.05;
    t.bx(cx0, cy0, cz0, cx1, 0.75, cz1);
    t.bx(cx0 - 0.03, cy1, cz0 - 0.03, cx1 + 0.05, cy1 + 0.1, cz1 + 0.03);
    for (const [x, z] of [[cx0, cz0], [cx1, cz0], [cx0, cz1], [cx1, cz1], [0.65, cz0]]) t.bx(x - 0.04, 0.75, z - 0.04, x + 0.04, cy1, z + 0.04);
    t.box(0.03, cy1 - 0.85, (cz1 - cz0) - 0.15, cx1 - 0.02, (0.8 + cy1) / 2, (cz0 + cz1) / 2, 0, 0, 0.08); // windscreen
    for (const [a, b] of [[cx0 + 0.06, 0.6], [0.7, cx1 - 0.06]]) { t.bx(a, 0.8, cz0 - 0.02, b, cy1 - 0.06, cz0 - 0.01); t.bx(a, 0.8, cz1 + 0.01, b, cy1 - 0.06, cz1 + 0.02); }
    t.bx(cx0 - 0.02, 0.8, cz0 + 0.06, cx0 - 0.01, cy1 - 0.06, cz1 - 0.06);
    t.bx(0.2, 1.3, cz0 - 0.03, 0.62, 1.32, cz0 - 0.02); // door handle bar
    t.rod([0.3, cy1 + 0.1, -1.0], [0.3, cy1 + 0.55, -1.0], 0.02, 6); t.cyl(0.08, 0.04, 0.3, cy1 + 0.57, -1.0, 12, 'y'); // GNSS mast
    t.rod([-1.5, 1.28, 0.9], [-1.5, 2.0, 0.9], 0.02, 6); t.cyl(0.1, 0.05, -1.5, 2.02, 0.9, 12, 'y');
    t.box(0.12, 0.12, 0.12, 0.3, cy1 + 0.16, -0.65); // beacon
    for (const z of [-0.05, 0.45]) t.ext([[0.2, 0.28], [1.25, 0.28], [1.2, 1.25], [0.75, 1.35]], 0.12, z - 0.06); // boom foot bracket
    t.cyl(0.13, 0.75, 0.95, 1.0, 0.2, 16);
    const upper = t.build();

    // boom: banana profile from pin (0,0) to tip (5.7,0)
    const b = part(); const BL = 5.7, BW = 0.5;
    b.ext([[-0.25, -0.2], [0.6, -0.3], [2.5, 0.15], [BL - 0.2, -0.25], [BL + 0.2, -0.1], [BL + 0.15, 0.25], [2.55, 0.85], [0.4, 0.38], [-0.25, 0.2]], BW, -BW / 2);
    for (const z of [-1, 1]) { // side lattice webs
      const zz = z * (BW / 2 + 0.012), lo = [[0.6, -0.15], [1.6, 0.0], [2.5, 0.25], [3.6, 0.05], [4.7, -0.12]], hi = [[1.1, 0.4], [2.05, 0.7], [3.05, 0.62], [4.15, 0.36], [5.2, 0.1]];
      for (let k = 0; k < lo.length; k++) { b.bar([lo[k][0], lo[k][1], zz], [hi[k][0], hi[k][1], zz], 0.06, 0.02); if (k + 1 < lo.length) b.bar([hi[k][0], hi[k][1], zz], [lo[k + 1][0], lo[k + 1][1], zz], 0.06, 0.02); }
    }
    for (const z of [-0.32, 0.32]) b.rod([0.9, -0.55, z], [2.4, -0.05, z], 0.09, 10); // boom cylinders
    b.rod([1.0, 0.55, 0], [BL - 0.1, 0.65, 0], 0.1, 10); b.rod([3.0, 0.75, 0], [BL + 0.25, 0.75, 0], 0.07, 8); // stick cylinder
    b.cyl(0.12, BW + 0.2, 0, 0, 0, 16); b.cyl(0.12, BW + 0.2, BL, 0, 0, 16);
    const boom = b.build();

    // stick
    const s = part(); const SL = 2.9, SW = 0.38;
    s.ext([[-0.55, 0.15], [-0.45, 0.55], [0.3, 0.32], [SL, 0.12], [SL + 0.1, -0.12], [SL - 0.4, -0.22], [0.2, -0.25], [-0.3, -0.12]], SW, -SW / 2);
    s.rod([0.2, 0.42, 0], [SL - 0.5, 0.3, 0], 0.07, 8); // bucket cylinder
    s.bar([0.4, -0.25, SW / 2 + 0.01], [SL - 0.4, -0.2, SW / 2 + 0.01], 0.05, 0.02); s.bar([0.4, -0.25, -SW / 2 - 0.01], [SL - 0.4, -0.2, -SW / 2 - 0.01], 0.05, 0.02);
    s.cyl(0.1, SW + 0.15, SL, 0, 0, 16);
    const stick = s.build();

    // bucket: shell profile, teeth, side cutters, ribs
    const k = part(); const BKW = 1.15;
    k.ext([[-0.05, 0.12], [0.45, 0.22], [0.95, 0.0], [1.25, -0.45], [1.35, -1.05], [1.0, -1.0], [0.55, -0.68], [0.18, -0.32], [-0.08, -0.08]], BKW, -BKW / 2);
    for (let i = 0; i < 5; i++) { const z = -BKW / 2 + 0.12 + i * ((BKW - 0.24) / 4); k.bar([1.3, -1.02, z], [1.42, -1.38, z], 0.1, 0.09); } // teeth
    for (const z of [-1, 1]) { k.bar([0.35, 0.18, z * 0.25], [0.15, 0.5, z * 0.25], 0.06, 0.06); k.bar([0.95, 0.02, z * (BKW / 2 + 0.02)], [1.3, -0.95, z * (BKW / 2 + 0.02)], 0.08, 0.03); }
    for (const [a, c] of [[[0.5, 0.21], [0.95, 0.02]], [[0.95, 0.02], [1.27, -0.48]], [[1.27, -0.48], [1.37, -1.0]]]) for (let i = -1; i <= 1; i++) k.bar([a[0], a[1] + 0.02, i * 0.32], [c[0] + 0.02, c[1] + 0.02, i * 0.32], 0.05, 0.05); // straps
    k.cyl(0.08, BKW + 0.1, 0, 0, 0, 16);
    const bucket = k.build();
    excT = { under, upper, boom, stick, bucket, BL, SL };
    return excT;
  }

  function excavator() {
    const T = excTemplate(), m = mats();
    const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
    body.add(node(T.under, m));
    const track = makeTrack(belt([[-TL / 2, 0, TR + 0.02], [TL / 2, 0, TR + 0.02]]), TW + 0.06, [-TZ, TZ], TY);
    const tm = new THREE.Mesh(track.geo, m.solid), tl = new THREE.LineSegments(track.edges, m.line); tm.renderOrder = 1; tl.renderOrder = 2; body.add(tm, tl);
    const turret = node(T.upper, m); turret.position.y = TY + 0.58; body.add(turret);
    const boom = node(T.boom, m); boom.position.set(0.95, 1.0, 0.2); turret.add(boom);
    const stick = node(T.stick, m); stick.position.set(T.BL, 0, 0); boom.add(stick);
    const bucket = node(T.bucket, m); bucket.position.set(T.SL, 0, 0); stick.add(bucket);
    const tip = new THREE.Object3D(); tip.position.set(1.38, -1.25, 0); bucket.add(tip);
    let trackOff = 0;
    return {
      root, body, turret, boom, stick, bucket, tip, kind: 'excavator',
      setArm(a1, a2, a3, sw) { turret.rotation.y = sw; boom.rotation.z = a1; stick.rotation.z = a2; bucket.rotation.z = a3; },
      drive(dist) { trackOff += dist; track.update(trackOff); },
      setDrive(d) { trackOff = d; track.update(d); },
      setOpacity: opacityFn(root, m),
      dispose() { track.dispose(); m.solid.dispose(); m.line.dispose(); },
    };
  }

  // ================================================================== BACKHOE LOADER
  let bhT = null;
  function bhTemplate() {
    if (bhT) return bhT;
    const RW = 0.82, FW = 0.56;
    const c = part();
    c.bx(-2.2, 0.55, -0.55, 2.3, 1.0, 0.55); // main frame rails
    c.bx(-2.6, 0.75, -1.15, -1.9, 1.15, 1.15); // rear frame / swing tower base
    c.bx(0.55, 0.95, -0.72, 2.45, 1.75, 0.72); // hood
    c.bx(0.6, 1.75, -0.65, 2.35, 1.82, 0.65);
    for (let k = 0; k < 6; k++) c.bx(2.45, 1.05 + k * 0.11, -0.55, 2.48, 1.1 + k * 0.11, 0.55); // grille
    c.bx(2.3, 0.6, -0.95, 2.6, 0.9, 0.95); // front axle / counterweight
    c.rod([1.2, 1.82, -0.35], [1.2, 2.45, -0.35], 0.07, 10); // exhaust
    c.rod([1.6, 1.82, 0.35], [1.6, 2.1, 0.35], 0.09, 10); // air intake
    // fenders over the rear tyres
    for (const z of [-1, 1]) c.extShape(sh => { sh.absarc(-1.0, RW, RW + 0.12, 0.05, Math.PI - 0.05, false); sh.absarc(-1.0, RW, RW + 0.04, Math.PI - 0.05, 0.05, true); }, 0.62, z * 1.0 - 0.31, 14);
    // cab (open ROPS look: posts, roof, rails)
    const x0 = -1.75, x1 = 0.55, z0 = -0.9, z1 = 0.9, y0 = 1.0, y1 = 2.85;
    c.bx(x0, y0, z0, x1, 1.45, z1); // cab floor tub
    c.bx(x0 - 0.1, y1, z0 - 0.08, x1 + 0.12, y1 + 0.12, z1 + 0.08); c.bx(x0, y1 + 0.12, z0 + 0.1, x1, y1 + 0.2, z1 - 0.1); // roof
    for (const [x, z] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) c.bx(x - 0.05, 1.45, z - 0.05, x + 0.05, y1, z + 0.05);
    for (const z of [z0, z1]) { c.bar([x0, 2.2, z], [x1, 2.2, z], 0.04, 0.04); c.bar([x0 + 1.1, 1.45, z], [x0 + 1.1, y1, z], 0.04, 0.04); }
    c.bar([x1, 1.95, z0], [x1, 1.95, z1], 0.04, 0.04); c.bar([x0, 1.95, z0], [x0, 1.95, z1], 0.04, 0.04);
    c.bx(-0.95, 1.45, -0.32, -0.45, 1.75, 0.32); c.bx(-0.95, 1.75, -0.32, -0.85, 2.3, 0.32); // seat
    c.rod([0.25, 1.45, 0], [0.05, 2.0, 0], 0.04, 6); c.cyl(0.2, 0.04, 0.05, 2.02, 0, 16, 'x'); // steering column + wheel
    c.box(0.12, 0.12, 0.12, -0.6, y1 + 0.27, 0.5); // beacon
    c.bx(-0.4, 0.75, z1 + 0.05, 0.1, 0.8, z1 + 0.35); c.bx(-0.4, 0.45, z1 + 0.05, 0.1, 0.5, z1 + 0.35); // steps
    // loader arms + bucket (static, slightly lifted)
    for (const z of [-1, 1]) {
      const zz = z * 1.02;
      c.ext([[-0.4, 1.55], [-0.2, 1.75], [1.6, 1.3], [3.3, 0.75], [3.35, 0.5], [3.1, 0.5], [1.5, 1.05], [-0.3, 1.35]], 0.12, zz - 0.06);
      c.rod([0.4, 1.0, zz * 0.9], [1.9, 1.15, zz * 0.9], 0.08, 10); // lift cylinder
      c.cyl(0.1, 0.2, -0.3, 1.5, zz, 14);
    }
    c.bar([2.4, 1.05, -1.02], [2.4, 1.05, 1.02], 0.12, 0.12); // cross tube
    // loader bucket
    const BWd = 2.4;
    c.ext([[3.15, 0.95], [3.55, 1.1], [3.7, 0.55], [4.1, 0.08], [3.4, 0.12], [3.15, 0.35]], BWd, -BWd / 2);
    for (let k = 0; k < 15; k++) { const z = -BWd / 2 + 0.1 + k * ((BWd - 0.2) / 14); c.bar([4.05, 0.08, z], [4.3, 0.04, z], 0.05, 0.06); } // teeth
    for (let k = -2; k <= 2; k++) c.bar([3.55, 1.1, k * 0.5], [3.7, 0.55, k * 0.5], 0.04, 0.04);
    // rear stabilisers
    for (const z of [-1, 1]) { c.bar([-2.4, 1.0, z * 0.95], [-2.75, 0.15, z * 1.55], 0.14, 0.14); c.bx(-3.0, 0.0, z * 1.55 - 0.25, -2.5, 0.08, z * 1.55 + 0.25); c.rod([-2.25, 1.35, z * 0.9], [-2.6, 0.6, z * 1.35], 0.06, 8); }
    c.bx(-2.95, 0.85, -0.35, -2.55, 1.6, 0.35); // swing tower
    c.cyl(0.12, 0.85, -2.9, 1.2, 0, 14, 'y');
    const chassis = c.build();

    const rw = part(); wheel(rw, RW, 0.6, { lugs: 20, rim: 0.58 }); const rearWheel = rw.build();
    const fw = part(); wheel(fw, FW, 0.42, { lugs: 16, rim: 0.6, lugD: 0.06 }); const frontWheel = fw.build();

    // backhoe: boom (curved), stick, bucket. Swing pivot at the tower, boom pivot at the pivot origin
    const bb = part(); const BL = 2.9;
    bb.ext([[-0.15, -0.18], [1.0, 0.2], [BL, -0.12], [BL + 0.12, 0.12], [1.05, 0.48], [-0.15, 0.18]], 0.3, -0.15);
    bb.rod([0.2, -0.45, 0], [1.35, 0.1, 0], 0.07, 8); bb.rod([0.7, 0.5, 0], [BL - 0.1, 0.25, 0], 0.06, 8);
    bb.cyl(0.08, 0.42, 0, 0, 0, 14); bb.cyl(0.08, 0.42, BL, 0, 0, 14);
    const hoeBoom = bb.build();
    const bs = part(); const HSL = 2.1;
    bs.ext([[-0.35, 0.2], [HSL, 0.08], [HSL, -0.08], [0, -0.16], [-0.35, -0.02]], 0.24, -0.12);
    bs.rod([-0.2, 0.25, 0], [HSL - 0.3, 0.18, 0], 0.05, 8);
    const hoeStick = bs.build();
    const bk = part();
    bk.ext([[0, 0.08], [0.35, 0.12], [0.62, -0.15], [0.66, -0.55], [0.4, -0.45], [0.1, -0.2]], 0.62, -0.31);
    for (let k = 0; k < 4; k++) { const z = -0.24 + k * 0.16; bk.bar([0.64, -0.52, z], [0.72, -0.72, z], 0.06, 0.05); }
    const hoeBucket = bk.build();
    bhT = { chassis, rearWheel, frontWheel, hoeBoom, hoeStick, hoeBucket, RW, FW, BL, HSL };
    return bhT;
  }

  function backhoe() {
    const T = bhTemplate(), m = mats();
    const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
    body.add(node(T.chassis, m));
    const wheels = [];
    for (const [x, z, tpl, r] of [[-1.0, -1.0, T.rearWheel, T.RW], [-1.0, 1.0, T.rearWheel, T.RW], [1.75, -0.98, T.frontWheel, T.FW], [1.75, 0.98, T.frontWheel, T.FW]]) {
      const w = node(tpl, m); w.position.set(x, r, z); if (z < 0) w.rotation.y = Math.PI; body.add(w); wheels.push({ w, r, flip: z < 0 ? -1 : 1 });
    }
    const swing = new THREE.Group(); swing.position.set(-2.95, 1.2, 0); body.add(swing);
    const boom = node(T.hoeBoom, m); swing.add(boom);
    const stick = node(T.hoeStick, m); stick.position.x = T.BL; boom.add(stick);
    const bucket = node(T.hoeBucket, m); bucket.position.x = T.HSL; stick.add(bucket);
    boom.rotation.order = 'YXZ'; boom.rotation.y = Math.PI; // boom points rearward, +z still lifts
    return {
      root, body, kind: 'backhoe',
      setArm(a1, a2, a3, sw) { swing.rotation.y = sw; boom.rotation.z = a1; stick.rotation.z = a2; bucket.rotation.z = a3; },
      setDrive(d) { for (const k of wheels) k.w.rotation.z = -d / k.r * k.flip; },
      setOpacity: opacityFn(root, m),
      dispose() { m.solid.dispose(); m.line.dispose(); },
    };
  }

  // ================================================================== SINGLE DRUM PADFOOT ROLLER
  let rlT = null;
  function rlTemplate() {
    if (rlT) return rlT;
    const DR = 0.78, DW = 2.1;
    const d = part();
    d.cyl(DR, DW, 0, 0, 0, 36);
    for (const z of [-1, 1]) { d.cyl(DR * 0.55, 0.05, 0, 0, z * (DW / 2 + 0.02), 24); d.cyl(0.18, 0.12, 0, 0, z * (DW / 2 + 0.06), 14); }
    // padfoot chevrons: rows across the width, staggered around the drum
    const rows = 6, ring = 16;
    for (let r = 0; r < rows; r++) {
      const z = -DW / 2 + 0.18 + r * ((DW - 0.36) / (rows - 1)), sh = (r % 2) * 0.5;
      for (let k = 0; k < ring; k++) { // tapered pad: wide at the drum, small on top
        const a = ((k + sh) / ring) * Math.PI * 2, g = new THREE.CylinderGeometry(0.07, 0.12, 0.14, 4, 1);
        g.rotateY(Math.PI / 4 + (r % 2 ? 0.35 : -0.35)); g.translate(0, DR + 0.06, 0); g.rotateZ(a); g.translate(0, 0, z); d.add(g);
      }
    }
    for (const z of [-1, 1]) d.cyl(DR + 0.02, 0.05, 0, 0, z * (DW / 2 - 0.03), 36); // drum edge rings
    const drum = d.build();

    const f = part(); // front frame (yoke) around the drum, origin at drum centre
    for (const z of [-1, 1]) {
      const zz = z * (DW / 2 + 0.16);
      f.ext([[-1.25, 0.0], [-1.0, -0.4], [0.45, -0.4], [0.6, 0.0], [0.35, 0.62], [-1.25, 0.95]], 0.12, zz - 0.06);
      for (let k = 0; k < 5; k++) f.cyl(0.03, 0.04, -0.6 + k * 0.3, 0.38, zz + z * 0.07, 6); // bolt row
      for (let k = 0; k < 4; k++) f.cyl(0.03, 0.04, 0.6, -0.1 + k * 0.12, zz + z * 0.07, 6);
    }
    f.bx(-1.3, 0.8, -DW / 2 - 0.22, -0.8, 1.05, DW / 2 + 0.22); // rear cross beam
    f.bar([0.3, 0.62, -DW / 2 - 0.16], [0.3, 0.62, DW / 2 + 0.16], 0.09, 0.09); // front tie bar
    f.bx(-1.3, -0.05, -0.5, -1.0, 0.75, 0.5); // hitch
    f.bar([0.95, -0.55, -DW / 2], [0.95, -0.55, DW / 2], 0.06, 0.06); f.bar([-0.95, -0.55, -DW / 2], [-0.95, -0.55, DW / 2], 0.06, 0.06); // scraper bars
    for (const z of [-0.8, 0.8]) f.box(0.14, 0.12, 0.2, -1.0, 1.12, z); // lamps
    const yoke = f.build();

    const c = part(); // rear chassis, origin at articulation joint on the ground
    const RWR = 0.78;
    c.bx(-2.9, 0.7, -0.75, -0.1, 1.15, 0.75); // frame
    c.bx(-3.0, 1.15, -0.8, -1.25, 1.95, 0.8); // engine hood
    c.ext([[-3.0, 1.95], [-1.25, 1.95], [-1.25, 2.05], [-2.85, 2.1]], 1.5, -0.75);
    for (let k = 0; k < 8; k++) c.bx(-3.02, 1.25 + k * 0.09, -0.6, -2.98, 1.3 + k * 0.09, 0.6); // rear grille
    for (let k = 0; k < 6; k++) c.bx(-2.85 + k * 0.25, 2.1, -0.55, -2.72 + k * 0.25, 2.13, 0.55); // hood louvres
    c.rod([-1.6, 2.05, 0.5], [-1.6, 2.6, 0.5], 0.06, 10);
    c.bx(-0.5, 0.6, -0.35, 0.05, 1.05, 0.35); // articulation
    c.cyl(0.12, 0.6, -0.1, 0.85, 0, 14, 'y');
    for (const z of [-1, 1]) c.rod([-0.8, 0.95, z * 0.45], [0.25, 0.85, z * 0.35], 0.06, 8); // steering cylinders
    // cab (enclosed, frames)
    const x0 = -1.25, x1 = 0.0, z0 = -0.8, z1 = 0.8, y0 = 1.15, y1 = 3.0;
    c.bx(x0, y0, z0, x1, 1.6, z1);
    c.bx(x0 - 0.1, y1, z0 - 0.1, x1 + 0.15, y1 + 0.12, z1 + 0.1);
    for (const [x, z] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) c.bx(x - 0.05, 1.6, z - 0.05, x + 0.05, y1, z + 0.05);
    for (const z of [z0, z1]) { c.bx(x0 + 0.08, 1.68, z - 0.01, x1 - 0.08, y1 - 0.08, z + 0.01); c.bar([x0 + 0.62, 1.6, z], [x0 + 0.62, y1, z], 0.04, 0.05); }
    c.bx(x1 - 0.01, 1.68, z0 + 0.08, x1 + 0.01, y1 - 0.08, z1 - 0.08);
    c.box(0.12, 0.14, 0.12, -0.6, y1 + 0.2, 0.0); c.box(0.4, 0.06, 0.06, -0.3, y1 + 0.16, 0.6); // beacon, light bar
    for (const z of [-1, 1]) { c.rod([0.1, y1 - 0.1, z * 0.78], [0.35, y1 - 0.35, z * 0.95], 0.02, 6); c.box(0.06, 0.22, 0.14, 0.38, y1 - 0.45, z * 0.97); } // mirrors
    c.bx(-0.3, 0.55, z1 + 0.02, 0.0, 0.6, z1 + 0.3); c.bx(-0.3, 0.95, z1 + 0.02, 0.0, 1.0, z1 + 0.3); // steps
    for (const z of [-1, 1]) c.extShape(sh => { sh.absarc(-1.9, RWR, RWR + 0.12, 0.15, Math.PI - 0.15, false); sh.absarc(-1.9, RWR, RWR + 0.05, Math.PI - 0.15, 0.15, true); }, 0.55, z * 0.95 - 0.275, 12);
    const chassis = c.build();
    const rw = part(); wheel(rw, RWR, 0.62, { lugs: 18, rim: 0.55, lugD: 0.09 }); const tyre = rw.build();
    rlT = { drum, yoke, chassis, tyre, DR, RWR, DW };
    return rlT;
  }

  function roller() {
    const T = rlTemplate(), m = mats();
    const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
    const front = new THREE.Group(); front.position.set(1.8, T.DR, 0); body.add(front);
    front.add(node(T.yoke, m));
    const drum = node(T.drum, m); front.add(drum);
    body.add(node(T.chassis, m));
    const tyres = [];
    for (const z of [-0.95, 0.95]) { const w = node(T.tyre, m); w.position.set(-1.9, T.RWR, z); if (z < 0) w.rotation.y = Math.PI; body.add(w); tyres.push({ w, flip: z < 0 ? -1 : 1 }); }
    return {
      root, body, kind: 'roller',
      setDrive(d) { drum.rotation.z = -d / T.DR; for (const t of tyres) t.w.rotation.z = -d / T.RWR * t.flip; },
      setArm() {},
      setOpacity: opacityFn(root, m),
      dispose() { m.solid.dispose(); m.line.dispose(); },
    };
  }

  // ================================================================== CRAWLER DOZER (D10 class, semi-U blade, single-shank ripper)
  // Published class figures used: track gauge 2.55, shoe 0.61, track on ground 3.6, high (elevated) sprocket, height to the
  // top of the ROPS 4.2, semi-U blade 4.94 wide x 2.12 high, overall length with blade and ripper about 8.8 (model metres).
  // Origin: middle of the track on the ground. The blade hangs off trunnions on the track frames; the ripper off the rear.
  const DZ = { gauge: 2.55, shoe: 0.61, trun: [0.2, 0.62], tilt: [3.2, 1.02], cylBase: [2.7, 3.62], cylEnd: [3.12, 1.88], rip: [-2.45, 1.0],
    wheels: [[-1.55, 1.95, 0.61], [1.95, 0.64, 0.49], [-1.85, 0.64, 0.49]] };   // sprocket, front idler, rear idler (pitch radius)
  const mb = t => [3.76 - 0.06 * t - 0.62 * Math.sin(Math.PI * 0.85 * t), 2.12 * t];   // moldboard face profile, t 0 (edge) .. 1 (top)
  let dzT = null;
  function dzTemplate() {
    if (dzT) return dzT;
    const c = part(), H = DZ.gauge / 2;
    // undercarriage, both sides
    for (const s of [-1, 1]) {
      const zc = s * H;
      c.ext([[-1.85, 0.3], [1.95, 0.3], [2.0, 0.78], [1.5, 0.98], [-1.45, 0.98], [-1.9, 0.72]], 0.34, zc - 0.17);   // roller frame
      for (const [x, y] of [[1.95, 0.64], [-1.85, 0.64]]) { c.cyl(0.46, 0.46, x, y, zc, 24); c.cyl(0.2, 0.56, x, y, zc, 14); }   // idlers
      c.cyl(0.58, 0.4, -1.55, 1.95, zc, 26); c.cyl(0.3, 0.5, -1.55, 1.95, zc, 16);   // elevated sprocket
      for (let k = 0; k < 11; k++) { const a = k / 11 * Math.PI * 2; c.box(0.14, 0.1, 0.42, -1.55 + Math.cos(a) * 0.6, 1.95 + Math.sin(a) * 0.6, zc, 0, 0, a); }   // sprocket segments
      c.cyl(0.44, 0.32, -1.55, 1.95, s * 0.9, 20);   // final drive
      for (let k = 0; k < 8; k++) c.cyl(0.15, 0.44, -1.32 + k * 0.4, 0.33, zc, 12);   // track rollers
      c.cyl(0.11, 0.3, 0.35, 1.72, zc, 10);   // carrier roller
      for (let k = 0; k < 4; k++) c.line([[-1.1 + k * 0.75, 0.38, zc + s * 0.175], [-1.1 + k * 0.75, 0.92, zc + s * 0.175]]);   // frame panel breaks
      c.bx(-0.95, 2.28, zc - s * 0.32, 0.15, 2.36, zc + s * 0.1);   // walkway beside the cab
      c.cyl(0.14, 0.2, DZ.trun[0], DZ.trun[1], s * 1.72, 12);   // blade trunnion
    }
    c.rod([-0.55, 0.9, -1.55], [-0.55, 0.9, 1.55], 0.1, 10);   // equaliser bar
    c.bx(-2.1, 0.55, -0.82, 2.25, 1.35, 0.82);   // main case
    c.bx(2.2, 0.62, -0.78, 2.78, 1.25, 0.78);    // crankcase guard
    // radiator guard with the grille (the dotted block on the drawing)
    c.bx(2.3, 1.25, -0.86, 2.78, 2.72, 0.86); c.bx(2.24, 2.72, -0.9, 2.84, 2.8, 0.9);
    for (let k = 0; k <= 16; k++) { const z = -0.74 + k * 0.0925; c.line([[2.79, 1.37, z], [2.79, 2.6, z]]); }
    for (let k = 0; k <= 12; k++) { const y = 1.37 + k * 0.1025; c.line([[2.79, y, -0.74], [2.79, y, 0.74]]); }
    for (const s of [-1, 1]) { c.bx(2.36, 2.3, s * 0.86, 2.78, 2.62, s * 1.12); c.ext([[2.32, 2.62], [2.82, 2.62], [2.82, 3.7], [2.58, 3.7]], 0.14, s * 1.17 - 0.07); }   // lift cylinder towers on the radiator sides (outboard of the cylinders)
    // engine hood with panel breaks and louvres
    c.ext([[0.12, 1.35], [2.3, 1.35], [2.3, 2.56], [0.45, 2.62], [0.12, 2.5]], 1.5, -0.75);
    for (const s of [-1, 1]) {
      const z = s * 0.755;
      for (const x of [0.75, 1.42, 2.0]) c.line([[x, 1.4, z], [x, 2.55, z]]);
      c.line([[0.15, 2.0, z], [2.28, 2.0, z]]);
      for (let k = 0; k < 6; k++) c.line([[1.5, 2.1 + k * 0.07, z], [1.95, 2.1 + k * 0.07, z]]);
    }
    for (const x of [0.75, 1.42, 2.0]) c.line([[x, 2.6, -0.75], [x, 2.6, 0.75]]);
    c.rod([1.05, 2.55, -0.28], [1.05, 3.55, -0.28], 0.09, 10); c.cyl(0.12, 0.06, 1.05, 3.57, -0.28, 12, 'y');   // exhaust stacks
    c.rod([1.05, 2.55, 0.12], [1.05, 3.4, 0.12], 0.08, 10); c.cyl(0.11, 0.06, 1.05, 3.42, 0.12, 12, 'y');
    c.rod([1.8, 2.55, 0.45], [1.8, 2.85, 0.45], 0.05, 8); c.cyl(0.17, 0.32, 1.8, 3.0, 0.45, 14, 'y');   // precleaner
    // operator station: base, cab, ROPS canopy
    c.bx(-1.55, 1.35, -0.95, 0.2, 2.35, 0.95);
    c.bx(-2.3, 1.3, -0.95, -1.55, 2.25, 0.95);   // fuel tank
    for (let k = 0; k < 3; k++) c.line([[-2.31, 1.55 + k * 0.25, -0.8], [-2.31, 1.55 + k * 0.25, 0.8]]);
    const x0 = -1.35, x1 = 0.05, z0 = -0.78, z1 = 0.78, y0 = 2.35, y1 = 3.62;
    c.bx(x0, y0, z0, x1, 2.72, z1);
    c.ext([[x0, 2.72], [x1, 2.72], [x1 + 0.08, 3.4], [x1 - 0.12, y1], [x0 + 0.1, y1], [x0, 3.45]], z1 - z0, z0);   // cab shell, chamfered top
    for (const z of [z0 - 0.005, z1 + 0.005]) {   // side glass: frame lines and the door pillar
      c.line([[x0 + 0.08, 2.8, z], [-0.62, 2.8, z], [-0.62, 3.5, z], [x0 + 0.12, 3.5, z], [x0 + 0.08, 2.8, z]]);
      c.line([[-0.5, 2.8, z], [x1 - 0.05, 2.8, z], [x1 + 0.0, 3.36, z], [x1 - 0.14, 3.5, z], [-0.5, 3.5, z], [-0.5, 2.8, z]]);
      c.line([[-0.42, 3.05, z], [-0.2, 3.05, z]]);   // door handle
    }
    c.line([[x1 + 0.09, 2.82, -0.66], [x1 + 0.09, 2.82, 0.66], [x1 + 0.09, 3.36, 0.66], [x1 + 0.09, 3.36, -0.66], [x1 + 0.09, 2.82, -0.66]]);   // windscreen
    for (const z of [-1, 1]) c.bx(x0 - 0.22, 2.3, z * 0.98 - 0.07, x0 - 0.08, 3.78, z * 0.98 + 0.07);   // ROPS posts behind the cab
    c.bx(x0 - 0.3, 3.76, -1.0, x1 + 0.22, 3.84, 1.0); c.bx(x0 - 0.22, 3.84, -0.92, x1 + 0.14, 4.2, 0.92);   // ROPS canopy
    for (let k = 1; k < 6; k++) c.line([[x0 - 0.22 + k * 0.27, 4.205, -0.92], [x0 - 0.22 + k * 0.27, 4.205, 0.92]]);
    for (const z of [-0.8, 0.8]) c.box(0.12, 0.1, 0.18, x1 + 0.26, 3.72, z);   // work lights
    c.box(0.12, 0.12, 0.12, -0.6, 4.27, 0.6);   // beacon
    // rear: ripper mount plates and drawbar
    for (const z of [-0.55, 0.55]) c.ext([[-2.15, 0.55], [-2.8, 0.55], [-2.8, 2.15], [-2.15, 2.3]], 0.12, z - 0.06);
    c.bx(-2.75, 0.6, -0.5, -2.3, 0.9, 0.5);
    const body = c.build();

    // blade: semi-U, curved face with its grid, wings, push arms, braces, rock guard. Built in place, then moved to the tilt pivot
    const b = part(), N = 12, TH = 0.11, xJ = 3.3, WA = 0.44, half = 1.5, wingW = 0.97;
    const band = (dx = 0) => { const pts = []; for (let i = 0; i <= N; i++) { const [x, y] = mb(i / N); pts.push([x - dx, y]); } for (let i = N; i >= 0; i--) { const [x, y] = mb(i / N); pts.push([x - dx - TH, y]); } return pts; };
    b.ext(band(), 2 * half, -half, 2);
    const wingM = s => new THREE.Matrix4().makeRotationY(s * WA).premultiply(new THREE.Matrix4().makeTranslation(xJ, 0, s * half));
    for (const s of [-1, 1]) {
      const g = new THREE.ExtrudeGeometry(new THREE.Shape(band(xJ).map(p => new THREE.Vector2(p[0], p[1]))), { depth: wingW, bevelEnabled: false });
      if (s < 0) g.translate(0, 0, -wingW);
      b.addM(g, wingM(s));
    }
    // face grid: lines across at even heights, lines up the curve at even widths
    const face = (t, z) => { const [x, y] = mb(t); return [x + 0.012, y, z]; }, faceW = (t, z) => { const [x, y] = mb(t); return [x - xJ + 0.012, y, z]; };
    for (let k = 1; k < 9; k++) {
      const t = k / 9; b.line([face(t, -half), face(t, half)]);
      for (const s of [-1, 1]) b.line([faceW(t, 0), faceW(t, s * wingW)], wingM(s));
    }
    for (let j = 1; j < 10; j++) { const z = -half + j * (2 * half / 10), pts = []; for (let i = 0; i <= N; i++) pts.push(face(i / N, z)); b.line(pts); }
    for (const s of [-1, 1]) for (let j = 1; j < 3; j++) { const pts = []; for (let i = 0; i <= N; i++) pts.push(faceW(i / N, s * j * wingW / 3)); b.line(pts, wingM(s)); }
    b.bx(3.62, 0.0, -half, 3.8, 0.1, half);   // cutting edge
    // back: box beams and ribs
    b.bx(3.05, 0.25, -1.45, 3.33, 0.65, 1.45); b.bx(2.85, 1.5, -1.4, 3.03, 1.85, 1.4);
    for (const z of [-1.2, -0.4, 0.4, 1.2]) b.bar([3.2, 0.6, z], [2.95, 1.55, z], 0.12, 0.08);
    // rock guard (the slatted fence on the top)
    b.bx(3.25, 2.12, -0.8, 3.37, 2.2, 0.8); b.bx(3.25, 2.44, -0.8, 3.37, 2.5, 0.8);   // between the lift cylinders
    for (const z of [-0.8, 0.8]) b.bx(3.26, 2.12, z - 0.04, 3.36, 2.5, z + 0.04);
    for (let k = 1; k < 13; k++) { const z = -0.8 + k * 0.123; b.line([[3.31, 2.2, z], [3.31, 2.44, z]]); }
    for (const s of [-1, 1]) {
      b.bar([DZ.trun[0], DZ.trun[1], s * 1.78], [3.1, 0.45, s * 1.48], 0.28, 0.18);   // push arm
      b.rod([1.6, 0.86, s * 1.7], [2.95, 1.72, s * 1.45], 0.07, 8);   // tilt brace
      b.bx(DZ.cylEnd[0] - 0.12, DZ.cylEnd[1] - 0.2, s * 0.99 - 0.16, DZ.cylEnd[0] + 0.12, DZ.cylEnd[1] + 0.14, s * 0.99 + 0.16);   // lift cylinder clevis on the blade top
    }
    const blade = b.build(); blade.geo.translate(-DZ.tilt[0], -DZ.tilt[1], 0); blade.edges.translate(-DZ.tilt[0], -DZ.tilt[1], 0);

    // lift cylinders: from the radiator brackets to the blade, drawn along +x from the base pin (rest length L0)
    const L0 = Math.hypot(DZ.cylEnd[0] - DZ.cylBase[0], DZ.cylEnd[1] - DZ.cylBase[1]), lc = part();
    for (const z of [-0.99, 0.99]) {   // barrel with end collars, chromed rod, eyes at both ends
      lc.rod([0.05, 0, z], [L0 * 0.6, 0, z], 0.13, 14); for (const f of [0.08, 0.3, 0.55]) lc.rod([L0 * f, 0, z], [L0 * (f + 0.04), 0, z], 0.16, 14);
      lc.rod([L0 * 0.55, 0, z], [L0 - 0.05, 0, z], 0.075, 10); lc.cyl(0.15, 0.24, 0, 0, z, 14); lc.cyl(0.12, 0.2, L0, 0, z, 12);
    }
    const liftCyl = lc.build();

    // ripper: an open parallelogram linkage (two side beams top and bottom), the two lift cylinders, a frame of cross tubes
    // and one shank with its tip; pivot at the lower link pin
    const r = part(), RZ = 0.62, xb = -4.05;
    for (const z of [-RZ, RZ]) {
      r.bar([-2.45, 1.0, z], [xb, 1.02, z], 0.2, 0.12); r.bar([-2.55, 2.02, z], [xb, 2.0, z], 0.16, 0.1);   // lower and upper beams
      r.bar([xb, 0.9, z], [xb - 0.1, 2.12, z], 0.14, 0.12);   // frame side post
      for (const [x, y] of [[-2.45, 1.0], [-2.55, 2.02], [xb, 1.02], [xb, 2.0]]) r.cyl(0.11, 0.2, x, y, z, 12);   // pins
      r.rod([-2.3, 2.42, z * 0.75], [-3.2, 2.32, z * 0.75], 0.12, 10); r.rod([-3.1, 2.33, z * 0.75], [xb + 0.05, 2.12, z * 0.75], 0.06, 8);   // cylinder: barrel, rod
      r.cyl(0.13, 0.16, -2.3, 2.42, z * 0.75, 12);
    }
    r.rod([xb, 1.02, -RZ - 0.1], [xb, 1.02, RZ + 0.1], 0.09, 12); r.rod([xb - 0.08, 2.08, -RZ - 0.1], [xb - 0.08, 2.08, RZ + 0.1], 0.08, 12);   // cross tubes
    r.bar([xb + 0.02, 1.05, -RZ], [xb - 0.06, 2.05, RZ], 0.08, 0.06); r.bar([xb + 0.02, 1.05, RZ], [xb - 0.06, 2.05, -RZ], 0.08, 0.06);   // frame bracing
    r.bx(xb - 0.32, 0.88, -0.14, xb + 0.02, 2.2, 0.14);   // shank pocket
    for (let k = 0; k < 4; k++) r.cyl(0.04, 0.32, xb - 0.15, 1.95 - k * 0.28, 0, 8);   // depth pin holes
    r.ext([[xb - 0.05, 2.45], [xb - 0.35, 2.45], [xb - 0.42, 0.85], [-4.72, 0.0], [-4.88, -0.3], [-4.6, -0.22], [xb - 0.1, 0.62]], 0.12, -0.06);   // shank
    r.ext([[-4.62, -0.2], [-4.92, -0.33], [-5.05, -0.52], [-4.85, -0.47], [-4.56, -0.3]], 0.16, -0.08);   // replaceable tip
    const ripper = r.build(); ripper.geo.translate(-DZ.rip[0], -DZ.rip[1], 0); ripper.edges.translate(-DZ.rip[0], -DZ.rip[1], 0);
    dzT = { body, blade, liftCyl, ripper, L0 };
    return dzT;
  }

  function dozer() {
    const T = dzTemplate(), m = mats();
    const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
    body.add(node(T.body, m));
    const track = makeTrack(belt(DZ.wheels), DZ.shoe + 0.02, [-DZ.gauge / 2, DZ.gauge / 2], 0, 0.26, 0.09);
    const tm = new THREE.Mesh(track.geo, m.solid), tl = new THREE.LineSegments(track.edges, m.line); tm.renderOrder = 1; tl.renderOrder = 2; body.add(tm, tl);
    const lift = new THREE.Group(); lift.position.set(DZ.trun[0], DZ.trun[1], 0); body.add(lift);
    const tilt = new THREE.Group(); tilt.position.set(DZ.tilt[0] - DZ.trun[0], DZ.tilt[1] - DZ.trun[1], 0); lift.add(tilt);
    tilt.add(node(T.blade, m));
    const cyl = node(T.liftCyl, m); cyl.position.set(DZ.cylBase[0], DZ.cylBase[1], 0); body.add(cyl);
    const rip = node(T.ripper, m); rip.position.set(DZ.rip[0], DZ.rip[1], 0); body.add(rip);
    const ex = DZ.cylEnd[0] - DZ.trun[0], ey = DZ.cylEnd[1] - DZ.trun[1];
    let trackOff = 0;
    const api = {
      root, body, kind: 'dozer', blade: tilt, ripper: rip,
      // lift: rad about the trunnions (+ raises the edge, 0 = edge on the ground), tilt: rad about the blade's centre line
      setBlade(a, t = 0) {
        lift.rotation.z = a; tilt.rotation.x = t;
        const c = Math.cos(a), s = Math.sin(a), px = DZ.trun[0] + ex * c - ey * s - DZ.cylBase[0], py = DZ.trun[1] + ex * s + ey * c - DZ.cylBase[1];
        cyl.rotation.z = Math.atan2(py, px); cyl.scale.x = Math.hypot(px, py) / T.L0;   // the cylinder follows the blade
      },
      setRipper(k) { rip.rotation.z = -0.2 * (1 - k); },   // k 0 = raised (travel), 1 = shank in the ground
      setDrive(d) { if (d !== trackOff) { trackOff = d; track.update(d); } },
      setArm() {},
      setOpacity: opacityFn(root, m),
      dispose() { track.dispose(); m.solid.dispose(); m.line.dispose(); },
    };
    api.setBlade(0.12); api.setRipper(0);
    return api;
  }

  // ================================================================== PADFOOT SOIL COMPACTOR (CP74 class, articulated, single drum)
  // Published class figures used: overall length about 6.1, width 2.42, height to the cab roof 3.1, wheelbase 3.0, drum
  // 2.13 wide, 1.36 shell + 0.1 pads (1.56 over the pads), rear tyres 23.1-26 (1.6 dia, 0.59 wide) with chevron tread.
  // Origin: the articulation hitch on the ground. The front frame (drum) steers about it; the rear frame carries cab and engine.
  const CP = { lf: 1.55, lr: 1.45, dr: 0.68, pad: 0.1, dw: 2.13, tr: 0.63, ty: 0.82, tw: 0.59, tz: 0.955 };   // tr: tyre carcass, ty: over the lugs
  let cpT = null;
  function cpTemplate() {
    if (cpT) return cpT;
    const R = CP.dr + CP.pad, HW = CP.dw / 2;
    // drum: shell, end rings, staggered rows of oblong pads
    const d = part();
    d.cyl(CP.dr, CP.dw, 0, 0, 0, 36);
    for (const z of [-1, 1]) { d.cyl(CP.dr * 0.5, 0.06, 0, 0, z * (HW + 0.03), 20); d.cyl(CP.dr + 0.03, 0.05, 0, 0, z * (HW - 0.03), 36); }
    const rows = 9, ring = 20;
    for (let r = 0; r < rows; r++) {
      const z = -HW + 0.14 + r * ((CP.dw - 0.28) / (rows - 1)), sh = (r % 2) * 0.5;
      for (let k = 0; k < ring; k++) {
        const a = ((k + sh) / ring) * Math.PI * 2, g = new THREE.BoxGeometry(0.17, CP.pad + 0.02, 0.12);
        g.translate(0, CP.dr + CP.pad / 2 - 0.01, 0); g.rotateZ(a); g.translate(0, 0, z); d.add(g);
      }
    }
    const drum = d.build();

    // front frame: box frame round the drum (side plates with bolt rings, front and rear cross members), hitch arms
    const f = part();
    for (const s of [-1, 1]) {
      const zz = s * (HW + 0.13);
      f.ext([[0.55, 0.32], [2.5, 0.32], [2.5, 1.12], [0.78, 1.12], [0.55, 0.98]], 0.1, zz - 0.05);
      f.cyl(0.34, 0.16, CP.lf, R, zz + s * 0.1, 20);   // vibrator / drive housing
      for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; f.cyl(0.03, 0.04, CP.lf + Math.cos(a) * 0.45, R + Math.sin(a) * 0.45, zz + s * 0.06, 6); }
      for (let k = 0; k < 5; k++) f.cyl(0.035, 0.04, 2.35, 0.45 + k * 0.15, zz + s * 0.06, 6);   // bolt column at the front
      for (const y of [0.55, 0.95]) f.cyl(0.035, 0.04, 0.72, y, zz + s * 0.06, 6);
      f.bar([0.62, 1.1, zz], [0.05, 0.98, s * 0.3], 0.18, 0.14);   // hitch arm
    }
    f.bx(2.5, 0.3, -HW - 0.28, 2.68, 0.78, HW + 0.28);   // front bumper bar
    f.bar([2.45, 1.08, -HW - 0.13], [2.45, 1.08, HW + 0.13], 0.1, 0.1);
    f.bx(0.48, 0.8, -HW - 0.18, 0.78, 1.15, HW + 0.18);   // rear cross member
    f.bar([2.45, 0.42, -HW], [2.45, 0.42, HW], 0.07, 0.07); f.bar([0.62, 0.42, -HW], [0.62, 0.42, HW], 0.07, 0.07);   // scrapers
    f.bx(-0.05, 0.75, -0.36, 0.35, 1.2, 0.36); f.cyl(0.1, 0.62, 0.05, 0.98, 0, 12, 'y');   // hitch knuckle
    for (const z of [-0.85, 0.85]) f.box(0.12, 0.12, 0.2, 2.5, 1.22, z);   // lamps
    const yoke = f.build();

    // rear frame: chassis, cab with ROPS, engine hood (mesh grilles on top), fenders, rear tray, steps
    const c = part();
    c.bx(-3.5, 0.55, -0.55, -0.1, 1.08, 0.55);
    c.bx(-0.55, 0.65, -0.34, -0.05, 1.22, 0.34);
    for (const z of [-1, 1]) c.rod([-0.85, 0.95, z * 0.45], [0.2, 0.9, z * 0.32], 0.06, 8);   // steering cylinders
    c.bx(-1.95, 1.08, -1.08, 0.05, 1.24, 1.08);   // platform
    // cab: tapered lower body (front face raked back), glass upper with sill, posts, panes and mullions, door frame
    const x0 = -1.75, x1 = -0.2, z0 = -0.82, z1 = 0.82, y0 = 1.24, ys = 1.92, y1 = 3.0;
    c.ext([[x0, y0], [x1 - 0.42, y0], [x1 - 0.05, ys], [x0, ys]], 1.44, -0.72);
    c.bx(x0 - 0.03, ys, z0 - 0.03, x1 + 0.03, ys + 0.06, z1 + 0.03);   // sill
    for (const [x, z] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) c.bx(x - 0.05, ys, z - 0.05, x + 0.05, y1, z + 0.05);
    for (const z of [z0, z1]) c.bx(x0 + 0.06, ys + 0.08, z - 0.01, x1 - 0.06, y1 - 0.06, z + 0.01);   // side glass
    c.bx(x1 - 0.01, ys + 0.08, z0 + 0.06, x1 + 0.01, y1 - 0.06, z1 - 0.06); c.bx(x0 - 0.01, ys + 0.08, z0 + 0.06, x0 + 0.01, y1 - 0.06, z1 - 0.06);
    for (const z of [z0 - 0.015, z1 + 0.015]) {
      const dx0 = -1.12, dx1 = -0.42;   // door: frame from the step up to the roof, handle, mullions either side
      c.line([[dx0, y0 + 0.06, z], [dx1, y0 + 0.06, z], [dx1, y1 - 0.05, z], [dx0, y1 - 0.05, z], [dx0, y0 + 0.06, z]]);
      c.line([[dx0 + 0.04, 2.4, z], [dx1 - 0.04, 2.4, z]]); c.line([[dx1 - 0.12, 1.75, z], [dx1 - 0.12, 1.62, z]]);
      c.line([[x0 + 0.06, 2.4, z], [dx0, 2.4, z]]); c.line([[dx1, 2.55, z], [x1 - 0.06, 2.55, z]]);
      for (let k = 0; k < 3; k++) c.line([[x0 + 0.08 + k * 0.1, 1.4, z], [x0 + 0.08 + k * 0.1, 1.8, z]]);   // louvre on the lower body
    }
    for (const x of [x0 - 0.015, x1 + 0.015]) { c.line([[x, ys + 0.1, 0], [x, y1 - 0.06, 0]]); c.line([[x, 2.5, z0 + 0.06], [x, 2.5, z1 - 0.06]]); }   // front and rear mullions
    c.bx(x0 - 0.1, y1, z0 - 0.12, x1 + 0.16, y1 + 0.13, z1 + 0.12);   // roof
    c.cyl(0.2, 0.08, -1.1, y1 + 0.17, 0.25, 16, 'y'); c.cyl(0.08, 0.1, -1.1, y1 + 0.26, 0.25, 10, 'y');   // roof unit (the round fitting on the drawing)
    c.box(0.12, 0.14, 0.12, -0.5, y1 + 0.2, -0.5);   // beacon
    for (const z of [-1, 1]) { c.rod([x1 + 0.05, y1 - 0.15, z * 0.8], [x1 + 0.35, y1 - 0.4, z * 0.98], 0.02, 6); c.box(0.06, 0.24, 0.14, x1 + 0.38, y1 - 0.52, z * 1.0); }   // mirrors
    for (const s of [-1, 1]) {   // ladder ahead of the tyre, up to the platform, with a grab rail
      const zl = s * 1.12;
      for (const x of [-0.58, -0.18]) c.rod([x, 0.32, zl], [x, 1.24, zl], 0.025, 6);
      for (let k = 0; k < 4; k++) c.bx(-0.58, 0.36 + k * 0.24, zl - 0.12, -0.18, 0.39 + k * 0.24, zl + 0.12);
      c.rod([-0.12, 1.24, zl], [-0.12, 2.1, s * 0.86], 0.022, 6);
    }
    // engine hood: tall behind the cab (top above the roof line), curving back over the engine and down a sloped rear,
    // dense mesh grilles on the top and the rear slope
    const HP = [[-3.8, 1.08], [-1.85, 1.08], [-1.85, 2.3], [-1.9, 2.72], [-2.02, 3.0], [-2.22, 3.18], [-2.5, 3.27], [-2.85, 3.25], [-3.18, 3.1], [-3.45, 2.85], [-3.66, 2.48], [-3.8, 2.02]];
    c.ext(HP, 1.36, -0.68);
    const meshPoly = (pts, nz, nu) => {   // lines along the profile and across it, just proud of the skin
      const L = [0]; for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
      const at = (u, z) => {
        const sL = u * L[L.length - 1]; let i = 1; while (i < L.length - 1 && L[i] < sL) i++;
        const p = pts[i - 1], q = pts[i], k = (sL - L[i - 1]) / (L[i] - L[i - 1]), dx = q[0] - p[0], dy = q[1] - p[1], d = Math.hypot(dx, dy);
        return [p[0] + dx * k + dy / d * 0.014, p[1] + dy * k - dx / d * 0.014, z];
      };
      for (let j = 0; j <= nz; j++) { const z = -0.56 + j * 1.12 / nz, row = []; for (let k = 0; k <= 16; k++) row.push(at(0.04 + 0.92 * k / 16, z)); c.line(row); }
      for (let k = 0; k <= nu; k++) { const u = 0.04 + 0.92 * k / nu; c.line([at(u, -0.56), at(u, 0.56)]); }
    };
    meshPoly(HP.slice(3, 8), 16, 16); meshPoly(HP.slice(8, 12), 16, 12);
    for (const s of [-1, 1]) {   // side panel: an inset line following the hood's outline
      const z = s * 0.685, cx = -2.85, cy = 2.1, ring = [];
      for (const [x, y] of HP.slice(2)) { const dx = cx - x, dy = cy - y, d = Math.hypot(dx, dy); ring.push([x + dx / d * 0.14, y + dy / d * 0.14, z]); }
      ring.push([-3.66, 1.2, z], [-1.98, 1.2, z], ring[0]); c.line(ring);
      c.line([[-2.75, 1.2, z], [-2.75, 3.08, z]]);
    }
    for (let k = 0; k < 6; k++) c.line([[-3.805, 1.2 + k * 0.12, -0.5], [-3.805, 1.2 + k * 0.12, 0.5]]);   // rear grille
    c.rod([-2.05, 3.0, 0.32], [-2.05, 3.32, 0.32], 0.05, 8); c.cyl(0.13, 0.08, -2.05, 3.36, 0.32, 12, 'y');   // air intake cap
    for (const z of [-1, 1]) c.extShape(sh => { sh.absarc(-1.45, CP.ty, CP.ty + 0.16, 0.2, Math.PI - 0.15, false); sh.absarc(-1.45, CP.ty, CP.ty + 0.1, Math.PI - 0.15, 0.2, true); }, 0.66, z * CP.tz - 0.33, 14);   // fenders
    // rear tray behind the tyres
    c.bx(-3.85, 0.55, -1.15, -3.55, 0.95, 1.15);
    for (const z of [-1, 1]) c.bx(-3.85, 0.85, z * 1.15 - 0.06, -2.55, 0.95, z * 1.15 + 0.06);
    const chassis = c.build();
    const t = part(); for (const s of [-1, 1]) wheel(t, CP.tr, CP.tw, { lugs: 20, rim: 0.62, lugD: 0.2, side: s, z0: s * CP.tz, lugW: 0.2, lugA: 0.62 });   // big chevron lugs
    const tyres = t.build();
    cpT = { drum, yoke, chassis, tyres };
    return cpT;
  }

  function compactor() {
    const T = cpTemplate(), m = mats(), R = CP.dr + CP.pad;
    const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
    const front = new THREE.Group(); body.add(front);   // steers about the hitch (origin)
    front.add(node(T.yoke, m));
    const drum = node(T.drum, m); drum.position.set(CP.lf, R, 0); front.add(drum);
    body.add(node(T.chassis, m));
    const tyres = node(T.tyres, m); tyres.position.set(-CP.lr, CP.ty, 0); body.add(tyres);
    return {
      root, body, kind: 'compactor', front, lf: CP.lf, lr: CP.lr,
      setDrive(d) { drum.rotation.z = -d / R; tyres.rotation.z = -d / CP.ty; },
      setSteer(a) { front.rotation.y = a; },   // articulation, rad (+ turns the drum to the machine's left)
      setArm() {},
      setOpacity: opacityFn(root, m),
      dispose() { m.solid.dispose(); m.line.dispose(); },
    };
  }

  function disposeAll() {
    for (const T of [excT, bhT, rlT, dzT, cpT]) if (T) for (const k in T) if (T[k] && T[k].geo) { T[k].geo.dispose(); T[k].edges.dispose(); }
    excT = bhT = rlT = dzT = cpT = null;
  }

  return { excavator, backhoe, roller, dozer, compactor, disposeAll, clip };
}
