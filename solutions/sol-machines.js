// sol-machines.js: procedural wireframe construction machines for the Solutions section (excavator, backhoe loader,
// single-drum padfoot roller). Hidden-line look: a black solid with polygonOffset hides back edges, an
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
    const arrs = [];
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
      build() {
        let n = 0; for (const a of arrs) n += a.length;
        const pos = new Float32Array(n); let o = 0; for (const a of arrs) { pos.set(a, o); o += a.length; }
        const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const edges = new THREE.EdgesGeometry(geo, EDGE_DEG);
        geo.computeBoundingSphere();
        return { geo, edges };
      },
    };
    return P;
  }

  // tyre with V tread lugs, rim and hub; axis along z, centred at origin
  function wheel(P, r, w, { lugs = 22, rim = 0.6, side = 1, lugD = 0.07 } = {}) {
    P.cyl(r, w, 0, 0, 0, 32);
    P.cyl(r * 0.92, 0.02, 0, 0, side * (w / 2 + 0.005), 32); // sidewall bead line
    P.cyl(r * rim, 0.04, 0, 0, side * (w / 2 + 0.01), 24); // rim face
    P.cyl(r * rim * 0.45, 0.12, 0, 0, side * (w / 2 + 0.05), 16); // hub
    for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2, rr = r * rim * 0.72; P.cyl(0.035, 0.06, Math.cos(a) * rr, Math.sin(a) * rr, side * (w / 2 + 0.04), 6); } // lug nuts
    for (let k = 0; k < lugs; k++) {
      const a = (k / lugs) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a), rr = r + lugD / 2 - 0.01;
      for (const h of [-1, 1]) { // chevron: two lugs leaning opposite ways
        const zc = h * w * 0.24;
        const g = new THREE.BoxGeometry(0.11, lugD, w * 0.46);
        g.rotateX(h * 0.42); g.rotateZ(a - Math.PI / 2); g.translate(c * rr, s * rr, zc); P.add(g);
      }
    }
    return P;
  }

  // ------------------------------------------------------------------ track loop with moving shoes (per instance)
  function makeTrack(L, R, w, zcs, yc, pitchWanted = 0.21) {
    const Pm = 2 * L + 2 * Math.PI * R, n = Math.round(Pm / pitchWanted), pitch = Pm / n;
    // shoe = plate + grouser rib, local x along tangent, y outward
    const shoe = new THREE.BoxGeometry(pitch * 0.82, 0.07, w).toNonIndexed(); shoe.translate(0, 0.035, 0);
    const rib = new THREE.BoxGeometry(0.05, 0.06, w).toNonIndexed(); rib.translate(0, 0.095, 0);
    const solidLocal = new Float32Array([...shoe.attributes.position.array, ...rib.attributes.position.array]);
    const eg1 = new THREE.EdgesGeometry(shoe), eg2 = new THREE.EdgesGeometry(rib);
    const edgeLocal = new Float32Array([...eg1.attributes.position.array, ...eg2.attributes.position.array]);
    shoe.dispose(); rib.dispose(); eg1.dispose(); eg2.dispose();
    const nz = zcs.length, sCnt = solidLocal.length / 3, eCnt = edgeLocal.length / 3;
    const sPos = new Float32Array(n * nz * sCnt * 3), ePos = new Float32Array(n * nz * eCnt * 3);
    const sGeo = new THREE.BufferGeometry(), eGeo = new THREE.BufferGeometry();
    sGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3).setUsage(THREE.DynamicDrawUsage));
    eGeo.setAttribute('position', new THREE.BufferAttribute(ePos, 3).setUsage(THREE.DynamicDrawUsage));
    const pt = [0, 0, 0, 0];
    const at = s => { // -> x, y, normal x, normal y
      s = ((s % Pm) + Pm) % Pm;
      if (s < L) { pt[0] = -L / 2 + s; pt[1] = R; pt[2] = 0; pt[3] = 1; return pt; }
      s -= L; if (s < Math.PI * R) { const t = s / R; pt[2] = Math.sin(t); pt[3] = Math.cos(t); pt[0] = L / 2 + R * pt[2]; pt[1] = R * pt[3]; return pt; }
      s -= Math.PI * R; if (s < L) { pt[0] = L / 2 - s; pt[1] = -R; pt[2] = 0; pt[3] = -1; return pt; }
      s -= L; const t = s / R; pt[2] = -Math.sin(t); pt[3] = -Math.cos(t); pt[0] = -L / 2 + R * pt[2]; pt[1] = R * pt[3]; return pt;
    };
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
        const p = at(k * pitch + off), px = p[0], py = p[1], nx = p[2], ny = p[3];
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
    return { geo: sGeo, edges: eGeo, update, dispose() { sGeo.dispose(); eGeo.dispose(); } };
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
    const track = makeTrack(TL, TR + 0.02, TW + 0.06, [-TZ, TZ], TY);
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

  function disposeAll() {
    for (const T of [excT, bhT, rlT]) if (T) for (const k in T) if (T[k] && T[k].geo) { T[k].geo.dispose(); T[k].edges.dispose(); }
    excT = bhT = rlT = null;
  }

  return { excavator, backhoe, roller, disposeAll, clip };
}
