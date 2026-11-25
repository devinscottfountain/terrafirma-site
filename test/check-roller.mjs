// check-roller.mjs: headless checks for the CS56B-class smooth drum compactor in solutions/sol-machines.js.
// node test/check-roller.mjs [path-to-sol-machines.js]   (pass /tmp/sol-machines-before.mjs to measure the padfoot model it replaced)
import * as THREE from 'three';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const file = process.argv[2] ? pathToFileURL(path.resolve(process.argv[2])).href : new URL('../solutions/sol-machines.js', import.meta.url).href;
const { createMachineKit } = await import(file);
const kit = createMachineKit(THREE);
const m = kit.compactor();
let fails = 0;
const ok = (c, msg) => { console.log((c ? 'PASS ' : 'FAIL ') + msg); if (!c) fails++; };
m.root.updateMatrixWorld(true);

// every mesh / line node: world-space vertices
const nodes = [];
m.root.traverse(o => { if (o.isMesh || o.isLineSegments) nodes.push(o); });
const names = ['yoke', 'drum', 'chassis', 'tyres'];
const meshes = nodes.filter(o => o.isMesh), lines = nodes.filter(o => o.isLineSegments);
const bb = new THREE.Box3(), v = new THREE.Vector3();
const world = (o, fn) => { const p = o.geometry.attributes.position; for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i).applyMatrix4(o.matrixWorld); fn(v, i); } };
let nan = 0, tris = 0, edgeSegs = 0; const triBy = [], edgeBy = [];
for (const o of nodes) {
  const p = o.geometry.attributes.position.array; for (const x of p) if (!Number.isFinite(x)) nan++;
  if (o.isMesh) { tris += p.length / 9; triBy.push(p.length / 9); } else { edgeSegs += p.length / 6; edgeBy.push(p.length / 6); }
}
ok(nan === 0, 'no NaN in any geometry (' + nodes.length + ' geometries)');
console.log('nodes (meshes):', meshes.length, 'line sets:', lines.length);
console.log('solid tris per node [yoke, drum, chassis, tyres]:', triBy.join(', '), ' total:', tris);
console.log('edge segments per node:', edgeBy.join(', '), ' total:', edgeSegs);
if (!process.argv[2]) {
  // bounding box of everything; mirrors are the chassis boxes with the max |z| above the body width, checked separately
  for (const o of meshes) world(o, p => bb.expandByPoint(p));
  console.log('bbox min', bb.min.toArray().map(x => +x.toFixed(3)).join(' '), ' max', bb.max.toArray().map(x => +x.toFixed(3)).join(' '));
  const len = bb.max.x - bb.min.x, wid = bb.max.z - bb.min.z, hei = bb.max.y - bb.min.y;
  const within = (a, b) => Math.abs(a - b) / b <= 0.03;
  ok(within(len, 5.86), 'length ' + len.toFixed(3) + ' within 3% of 5.86');
  ok(within(wid, 2.30), 'width ' + wid.toFixed(3) + ' within 3% of 2.30 (all parts incl. mirrors)');
  ok(within(hei, 3.11), 'height ' + hei.toFixed(3) + ' within 3% of 3.11');
  ok(Math.abs(bb.min.y) < 0.01, 'ground at y=0: lowest point ' + bb.min.y.toFixed(4));
  // lowest point of drum and tyres; need the node transforms, so find them by their position in the hierarchy
  const lowOf = idx => { let lo = 1e9; world(meshes[idx], p => { lo = Math.min(lo, p.y); }); return lo; };
  const yok = 0, dru = 1, cha = 2, tyr = 3;
  // node order: the factory adds yoke, drum, chassis, tyres in that order
  const loD = lowOf(dru), loT = lowOf(tyr);
  ok(Math.abs(loD) < 0.01, 'drum lowest point y=' + loD.toFixed(4));
  ok(Math.abs(loT) < 0.01, 'tyres lowest point y=' + loT.toFixed(4));
  ok(Math.abs(m.lf + m.lr - 2.90) < 1e-9, 'lf + lr = ' + (m.lf + m.lr) + ' (lf ' + m.lf + ', lr ' + m.lr + ')');
  // roof: max y of the chassis (cab roof is its highest part)
  let top = -1e9, rx0 = 1e9, rx1 = -1e9, rz0 = 1e9, rz1 = -1e9;
  world(meshes[cha], p => { top = Math.max(top, p.y); });
  world(meshes[cha], p => { if (p.y > top - 1e-4) { rx0 = Math.min(rx0, p.x); rx1 = Math.max(rx1, p.x); rz0 = Math.min(rz0, p.z); rz1 = Math.max(rz1, p.z); } });
  console.log('ROOF', JSON.stringify(m.ROOF), ' measured top y', top.toFixed(4), 'x', rx0.toFixed(3), rx1.toFixed(3), 'z', rz0.toFixed(3), rz1.toFixed(3));
  ok(Math.abs(m.ROOF.y - top) < 1e-3, 'ROOF.y equals the top of the cab roof');
  ok(Math.abs(m.ROOF.x - (rx0 + rx1) / 2) < 5e-3 && Math.abs(m.ROOF.len - (rx1 - rx0)) < 5e-3 && Math.abs(m.ROOF.z - (rz0 + rz1) / 2) < 5e-3 && Math.abs(m.ROOF.wid - (rz1 - rz0)) < 5e-3, 'ROOF x/z/len/wid match the roof slab');
  // drum radial extent about its axis (drum node origin)
  const dn = meshes[dru], ctr = new THREE.Vector3().setFromMatrixPosition(dn.parent.matrixWorld);
  let rmax = 0, rzmax = 0; const dp = dn.geometry.attributes.position;
  for (let i = 0; i < dp.count; i++) { v.fromBufferAttribute(dp, i); rmax = Math.max(rmax, Math.hypot(v.x, v.y)); rzmax = Math.max(rzmax, Math.abs(v.z)); }
  ok(rmax <= 0.767 + 0.035 + 1e-6, 'drum max radial distance ' + rmax.toFixed(4) + ' <= 0.802');
  console.log('drum centre (world)', ctr.toArray().map(x => +x.toFixed(3)).join(' '), ' half width', rzmax.toFixed(3), ' (2.134/2 = 1.067)');
  // closed solids point outward: signed volume of every node's triangle soup > 0
  meshes.forEach((o, i) => { const p = o.geometry.attributes.position.array; let vol = 0; for (let j = 0; j < p.length; j += 9) { const a = [p[j], p[j + 1], p[j + 2]], b = [p[j + 3], p[j + 4], p[j + 5]], c = [p[j + 6], p[j + 7], p[j + 8]]; vol += (a[0] * (b[1] * c[2] - b[2] * c[1]) - a[1] * (b[0] * c[2] - b[2] * c[0]) + a[2] * (b[0] * c[1] - b[1] * c[0])) / 6; } ok(vol > 0, names[i] + ' signed volume ' + vol.toFixed(3) + ' > 0 (outward faces)'); });
  // rolling: drive 1 m turns the drum and tyres by -1/r, and the drum stays on the ground
  m.setDrive(1); m.root.updateMatrixWorld(true);
  let lo2 = 1e9; world(meshes[dru], p => { lo2 = Math.min(lo2, p.y); }); ok(Math.abs(lo2) < 0.01, 'drum still on the ground after setDrive(1): ' + lo2.toFixed(4));
  m.setSteer(0.3); m.root.updateMatrixWorld(true); m.setSteer(0);
  // interface
  for (const k of ['root', 'body', 'kind', 'front', 'lf', 'lr', 'ROOF', 'setDrive', 'setSteer', 'setArm', 'setOpacity', 'mount', 'unmount', 'dispose']) ok(k in m, 'interface has ' + k);
  ok(m.kind === 'compactor', 'kind compactor');
}
m.dispose(); kit.disposeAll();
console.log(fails ? fails + ' FAILED' : 'ALL OK'); process.exit(fails ? 1 : 0);
