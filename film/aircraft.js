// aircraft.js: night traffic over Austin on the pull-back. Navigation lights only, no airframe: per aircraft red (left
// wingtip), green (right wingtip), steady white tail, double-flash white strobes on both wingtips, a red rotating beacon top and
// belly, and landing lights on the two arrivals low over the city. One THREE.Points, one ShaderMaterial, nothing per frame.
//
// createAircraft({ THREE, parent, high }) -> { points, layout(camAt, aspect), update(o), fleet, dispose }
//   parent           the Austin site group (lot frame, metres, y up): the points live in it, so they show and compile with it
//   layout(camAt, a) camAt(D, out) fills out { pos, look, up, fov } with the camera where its distance from the lot is D;
//                    the close passes are placed from it, so they land on the same frame whatever the scene heights
//   update(o)        o = { lam, t, sinE, proj, pr }: camera ln distance (the scroll clock), film clock (s), sun sin(elevation),
//                    drawing buffer px per unit tan (H * pixelRatio / (2 tan(fov / 2))), pixel ratio. Returns the overall light level.
//   fleet            per aircraft { pos, fwd, a, spec }: centre and heading in the lot frame, visibility (QA reads it)
// Where an aircraft is = a function of lam (scroll) + a bounded drift on t (wraps along track, fading over the wrap), so a
// close pass always happens at the same altitude and scrubbing back replays it; strobes and beacons run on t only.

const LN = Math.log;
const ss = (x, a, b) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const ROT = 17 * Math.PI / 180; // site.js SITE_ROT: lot frame = geographic turned by this
const geo = (e, s, out) => out.set(e * Math.cos(ROT) + s * Math.sin(ROT), 0, -e * Math.sin(ROT) + s * Math.cos(ROT)); // geo metres (east, south) -> lot frame

// the fleet. Each is placed from the camera where its distance from the lot is D: on the ray through screen NDC (nx, ny), at range
// r (the close passes) or where that ray meets altitude alt (the rest). Heading: turn = deg from the screen's right edge laid
// flat (+ towards screen top), or hdg = true heading (deg). v = metres along track per unit of lam (camera ln distance, i.e.
// scroll). drift = +/- metres along track on the film clock over T s. ABIA is ~6 km south-east of the lot, runways 17/35: the
// two low ones with landing lights are on the arrival flow for 17, the third low one is a departure off 35.
export const FLEET = [
  { D: 3900, nx: -0.34, ny: 0.30, r: 260, turn: 240, v: 3200, span: 36, drift: 50, T: 7.5 },          // close pass 1: down the left third
  { D: 6800, nx: 0.34, ny: 0.0, r: 420, turn: -70, v: 3200, span: 60, drift: 50, T: 8.5 },            // close pass 2: down the right third, widebody
  { D: 5000, nx: 0.5, ny: 0.55, alt: 1600, hdg: 172, v: 1800, span: 36, land: true, drift: 300, T: 14 },  // arrival
  { D: 7000, nx: 0.75, ny: 0.8, alt: 2300, hdg: 175, v: 1800, span: 34, land: true, drift: 300, T: 16 },  // arrival behind it
  { D: 4500, nx: -0.6, ny: -0.5, alt: 2000, hdg: 352, v: 2000, span: 36, drift: 300, T: 15, hi: true },  // departure, northbound
  { D: 14e3, nx: -0.5, ny: 0.4, alt: 9500, hdg: 62, v: 3000, span: 60, drift: 300, T: 13, hi: true },    // overflight, north-east
  { D: 18e3, nx: 0.45, ny: -0.3, alt: 11300, hdg: 258, v: 3200, span: 64, drift: 300, T: 12, hi: true }, // overflight, westbound
  { D: 11e3, nx: -0.2, ny: 0.6, alt: 7200, hdg: 128, v: 2600, span: 36, drift: 300, T: 15, hi: true }    // inbound from the north-west
];

// lights in the body frame (x right, y up, z forward), as a share of span: wingtips swept back, tail ~ half a span aft
// kind: 0 red nav, 1 green nav, 2 tail white, 3 strobe, 4 beacon, 5 landing
const LIGHTS = [[-0.5, 0, -0.12, 0], [0.5, 0, -0.12, 1], [0, 0.03, -0.52, 2], [-0.5, 0, -0.135, 3], [0.5, 0, -0.135, 3], [0, 0.07, 0.02, 4], [0, -0.06, 0.06, 4]];
const LAND = [[-0.11, -0.04, 0.14, 5], [0.11, -0.04, 0.14, 5]];

const VS = /* glsl */ `
uniform vec3 uC[8]; uniform vec3 uF[8]; uniform float uA[8]; uniform float uPh[8];
uniform float uT, uProj, uMin, uMax;
attribute float aId; attribute float aKind; attribute vec3 aOff;
varying vec3 vCol; varying float vK;
void main(){
  int i=int(aId+.5); vec3 f=uF[i], r=normalize(cross(f,vec3(0.,1.,0.))), u=cross(r,f);
  vec3 p=uC[i]+r*aOff.x+u*aOff.y+f*aOff.z;
  vec4 mv=modelViewMatrix*vec4(p,1.); gl_Position=projectionMatrix*mv;
  float d=max(-mv.z,1.), k=aKind, ph=uPh[i], t=uT;
  // sector visibility, as the real lamps: red front-left 110 deg, green front-right, white tail aft 140 deg; from well above or below all show
  vec3 toC=normalize(-mv.xyz), fV=normalize(mat3(modelViewMatrix)*f), rV=normalize(mat3(modelViewMatrix)*r), uV=normalize(mat3(modelViewMatrix)*u);
  float fd=dot(toC,fV), rd=dot(toC,rV), top=smoothstep(.35,.85,abs(dot(toC,uV)));
  vec3 c; float I, R;
  if(k<.5){ c=vec3(1.,.07,.035); I=20.; R=5.; I*=mix(smoothstep(.1,-.15,rd)*smoothstep(-.55,-.25,fd),1.,top); }
  else if(k<1.5){ c=vec3(.12,1.,.42); I=20.; R=5.; I*=mix(smoothstep(-.1,.15,rd)*smoothstep(-.55,-.25,fd),1.,top); }
  else if(k<2.5){ c=vec3(1.,.94,.84); I=12.; R=4.; I*=mix(smoothstep(-.2,-.45,fd),1.,top); }
  else if(k<3.5){ // anti-collision strobes: two ~50 ms flashes 140 ms apart, once per ~1.1 s cycle, each aircraft on its own phase
    float P=1.05+.25*fract(ph*7.3), s=fract(t/P+ph)*P;
    float fl=ss2(s,0.,.012)*(1.-ss2(s,.04,.06))+ss2(s,.14,.152)*(1.-ss2(s,.18,.2));
    c=vec3(.88,.94,1.); I=160.*fl; R=8.;
  } else if(k<4.5){ // rotating beacon: a soft pulse a little under 1 Hz, belly a quarter turn behind the top
    float b=.5+.5*cos(6.2831853*(t*(.9+.15*fract(ph*3.1))+ph+step(aOff.y,0.)*.25)); b=b*b*b*b*b*b;
    c=vec3(1.,.09,.03); I=40.*b; R=6.;
  } else { c=vec3(1.,.93,.8); I=80.*(.12+.88*smoothstep(.1,.85,fd)); R=9.; } // landing lights: forward beams, a glow off-axis
  float sz=R*uProj/d;                                  // glow diameter in px at this range
  gl_PointSize=clamp(sz,uMin,uMax); vK=smoothstep(1.5,5.,sz/uMin);   // vK: 0 = a point at the minimum size, 1 = resolved (core + halo)
  I*=uA[i]*sqrt(min(1.,sz/uMin));                      // once it is held at the minimum size, dim with range instead (it reads as a point)
  vCol=c*I;
  if(I<1e-3) gl_Position=vec4(2.,2.,2.,1.);           // off: clipped before rasterising
}`;
// smoothstep that tolerates a == b in the strobe edges
const SS2 = 'float ss2(float x,float a,float b){ return clamp((x-a)/max(b-a,1e-4),0.,1.); }\n';

const FS = /* glsl */ `
varying vec3 vCol; varying float vK;
void main(){
  vec2 q=gl_PointCoord*2.-1.; float d2=dot(q,q); if(d2>1.) discard;
  float g=mix(exp(-d2*2.5)*(1.-d2),exp(-d2*40.)+.12*exp(-d2*6.)*(1.-d2),vK); // a soft dot when it is a point; hot core + halo up close
  gl_FragColor=vec4(vCol*g,1.);
}`;

export function createAircraft({ THREE, parent, high = true }) {
  const fleetSpec = high ? FLEET : FLEET.filter(s => !s.hi); // low tier: the two passes + the two arrivals
  const N = fleetSpec.length, ids = [], kinds = [], offs = [];
  fleetSpec.forEach((s, i) => {
    for (const [x, y, z, k] of s.land ? LIGHTS.concat(LAND) : LIGHTS) { ids.push(i); kinds.push(k); offs.push(x * s.span, y * s.span, z * s.span); }
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(ids.length * 3), 3)); // unused: the shader places every light
  g.setAttribute('aId', new THREE.BufferAttribute(new Float32Array(ids), 1));
  g.setAttribute('aKind', new THREE.BufferAttribute(new Float32Array(kinds), 1));
  g.setAttribute('aOff', new THREE.BufferAttribute(new Float32Array(offs), 3));
  const V = () => new THREE.Vector3();
  const U = { uC: { value: Array.from({ length: 8 }, V) }, uF: { value: Array.from({ length: 8 }, () => new THREE.Vector3(0, 0, -1)) },
    uA: { value: new Array(8).fill(0) }, uPh: { value: fleetSpec.map((s, i) => (i * 0.618034) % 1).concat(new Array(8 - N).fill(0)) },
    uT: { value: 0 }, uProj: { value: 1000 }, uMin: { value: 2 }, uMax: { value: 72 } };
  const mat = new THREE.ShaderMaterial({ uniforms: U, vertexShader: VS.replace('void main(){', SS2 + 'void main(){'), fragmentShader: FS,
    transparent: true, depthWrite: false, depthTest: true, blending: THREE.AdditiveBlending, fog: false });
  const points = new THREE.Points(g, mat);
  points.frustumCulled = false; points.renderOrder = 2; points.name = 'aircraft';
  parent.add(points);

  // per aircraft: reference point P0 at lam0, heading; filled by layout()
  const fleet = fleetSpec.map((spec, i) => ({ spec, i, p0: V(), fwd: new THREE.Vector3(0, 0, -1), lam0: LN(spec.D), pos: V(), a: 0 }));
  const cs = { pos: V(), look: V(), up: V(), fov: 38 }, fw = V(), rt = V(), up = V(), ray = V(), tmp = V();
  const hdgVec = (deg, out) => { const h = deg * Math.PI / 180; return geo(Math.sin(h), -Math.cos(h), out).normalize(); }; // true heading -> lot frame

  function layout(camAt, aspect) {
    for (const f of fleet) {
      const s = f.spec; camAt(s.D, cs);
      fw.copy(cs.look).sub(cs.pos).normalize(); rt.crossVectors(fw, cs.up).normalize(); up.crossVectors(rt, fw);
      const ty = Math.tan(cs.fov * Math.PI / 360), tx = ty * aspect;
      ray.copy(fw).addScaledVector(rt, s.nx * tx).addScaledVector(up, s.ny * ty).normalize();
      f.p0.copy(cs.pos).addScaledVector(ray, s.r != null ? s.r : (s.alt - cs.pos.y) / ray.y); // the ray always points down here
      if (s.hdg != null) hdgVec(s.hdg, f.fwd);
      else { // the screen's right edge laid flat on the ground, turned by s.turn towards the screen's top
        const a = s.turn * Math.PI / 180; tmp.copy(up).setY(0).normalize();
        f.fwd.copy(rt).setY(0).normalize().multiplyScalar(Math.cos(a)).addScaledVector(tmp, Math.sin(a)).normalize();
      }
    }
  }

  // centre at (lam, t): along track by scroll, plus the film clock drift (a sawtooth over T s, faded over the wrap)
  function place(f, lam, t) {
    const s = f.spec, w = ((t / s.T + U.uPh.value[f.i] * 3.7) % 1 + 1) % 1;
    f.pos.copy(f.p0).addScaledVector(f.fwd, s.v * (lam - f.lam0) + s.drift * (2 * w - 1));
    return ss(w, 0, 0.07) * (1 - ss(w, 0.93, 1));
  }

  let level = 0;
  function update({ lam, t, sinE, proj, pr = 1 }) {
    // after dusk only, gone well before the world swap (650 km): nothing on the globe leg to pop
    level = ss(-sinE, -0.035, 0.03) * (1 - ss(lam, LN(60e3), LN(250e3)));
    points.visible = level > 0.001;
    if (!points.visible) { for (const f of fleet) f.a = 0; return level; }
    U.uT.value = t; U.uProj.value = proj; U.uMin.value = 3 * pr; U.uMax.value = 96 * pr; // ~3 CSS px floor at any pixel ratio
    fleet.forEach((f, i) => { f.a = level * place(f, lam, t); U.uC.value[i].copy(f.pos); U.uF.value[i].copy(f.fwd); U.uA.value[i] = f.a; });
    return level;
  }

  // QA/node: centre of aircraft i at (lam, t) without touching the uniforms
  function at(i, lam, t, out) { const f = fleet[i], a = place(f, lam, t); out.copy(f.pos); return a; }

  function dispose() { parent.remove(points); g.dispose(); mat.dispose(); }
  return { points, layout, update, at, fleet, dispose };
}
