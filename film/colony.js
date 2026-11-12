// colony.js: the Jezero Base timelapse world (terrain, sky, city, domes, cranes, rockets, colony life), built lazily.
// createColony(env) returns { group, populate, step, ensure, api, sun, night, rockets }.
// populate() is a generator that yields between its heavy chunks: step() it in idle time, or ensure() runs it to the end.
// build(g, t) (on api, once populated) lays the city out for build clock g (0..1; the ships land first, then the city, see ARRIVE).
import { createMarsEnv, createHabitatAssets, colonyLayout } from './habitat.js';
import { createColonyLife } from './machines.js';
import { easeOut, sstep } from './util.js';
import { JEZ_GROUND_GLSL } from './sky.js';

export const COL = { x: 0, y: -6000, z: 0 };   // far below the solar system, inside its own sky dome
export const ARRIVE = 0.1, ROCK_SITES = { land: [[55, -150], [15, -168]], build: [-25, -100] };

// cheap value noise + fbm for the terrain and sky shaders
const NOISE = `
float h3(vec3 p){p=fract(p*0.3183099+.1);p*=17.0;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float n3(vec3 x){vec3 i=floor(x);vec3 f=fract(x);f=f*f*(3.0-2.0*f);
return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),
mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n3(p);p*=2.03;a*=.5;}return v;}`;

// env: { THREE, renderer, scene, cam, planets, sunLight, ambient, hemi, files: { dtm, hiBump, ctxBump }, HIGH, lateRockets(rockets) }
export function createColony({ THREE, renderer, scene, cam, planets, sunLight, ambient, hemi, files, HIGH, lateRockets }) {
const COLV = new THREE.Vector3(COL.x, COL.y, COL.z); // COL (module level) is plain numbers, COLV the Vector3
const colony = new THREE.Group(); colony.position.copy(COLV); colony.visible = false; scene.add(colony);
// sun shadow: orthographic box fitted around the colony (radius ~350 plus the solar farm). The map is wider than tall because a low sun
// squashes the ground disc along the light's up axis; build() resizes the vertical extent with the sun elevation every frame.
sunLight.castShadow = true;
{ const sh = sunLight.shadow, c = sh.camera; sh.mapSize.set(HIGH ? 4096 : 2048, HIGH ? 2048 : 1024); sh.bias = -0.0005; sh.normalBias = 0.35; c.left = -390; c.right = 390; c.near = 60; c.far = 1300; }
scene.fog = new THREE.Fog(0x000000, 1e8, 1e9); // parked far away outside the colony so nothing recompiles
const rnd = (() => { let a = 7; return () => ((a = (a * 16807) % 2147483647) / 2147483647); })(); // seeded so the city is identical every load
const colSun = new THREE.Vector3(); let colNight = 0; // colony sun direction + night, written by build(), read by the film loop
let colonyAPI = null;               // { build(g, t), cranes, rockets } once populated
// rockets.js + the footer's Starship hull builder load in the background and are normally ready long before the colony is built
let rockMod = null; const rockP = Promise.all([import('./rockets.js'), import('../footer/foot-model-starship.js'), import('../footer/foot-model-kit.js')])
  .then(([r, s, k]) => (rockMod = { createRockets: r.createRockets, foot: { buildStarships: s.buildStarships, mergeAll: k.mergeAll } })).catch(e => console.warn('film rockets:', e));
// Jezero maps: fetched at boot idle (loadMaps), uploaded on arrival, then each switch fades in over MAP_FADE ms instead of popping
const terrU = { tDtm: { value: null }, tHi: { value: null }, tCtx: { value: null }, uOn: { value: new THREE.Vector3(0, 0, 0) }, uHB0: { value: 0 }, tMars: planets.mars.material.uniforms.tMap };
// the sky dome's own uniforms (sun, air amount, ambient, origin): the terrain's far band shades with them (see JF below)
const air = (planets.air && planets.air.uniforms.dome) || { uSun: { value: new THREE.Vector3(0, 1, 0) }, uK: { value: 1 }, uAmb: { value: 1 }, uOrigin: { value: COLV.clone() } };
const mapAt = [0, 0, 0], MAP_FADE = 500; // performance.now() each map arrived (dtm, hi bump, ctx bump), 0 until then
{ const px = (r, g, b) => { const d = new THREE.DataTexture(new Uint8Array([r, g, b, 255]), 1, 1); d.needsUpdate = true; return d; };
  terrU.tDtm.value = px(128, 0, 0); terrU.tHi.value = px(128, 128, 128); terrU.tCtx.value = px(128, 128, 128); }
// hB(vec2(0.)) once, on the CPU, from the 4 DTM texels the shader's dtmBil blends at uv (.5,.5) on the CTX half (f = .5 there).
// The texels are read back from the GPU texture byte-exact, so this matches the shader without decoding the PNG twice.
function readHB0(tex) {
  const rt = new THREE.WebGLRenderTarget(4, 1, { depthBuffer: false, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, generateMipmaps: false });
  const m = new THREE.ShaderMaterial({ uniforms: { tDtm: { value: tex } }, toneMapped: false, depthTest: false, depthWrite: false,
    vertexShader: 'void main(){ gl_Position=vec4(position.xy,0.,1.); }',
    fragmentShader: `uniform sampler2D tDtm; void main(){ float k=floor(gl_FragCoord.x); vec2 o=vec2(mod(k,2.),floor(k*.5));
      vec2 uv=(vec2(255.5)+o)/512.; gl_FragColor=texture2D(tDtm,vec2(uv.x*.5+.5,uv.y)); }` });
  const q = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), m), sc = new THREE.Scene(); q.frustumCulled = false; sc.add(q);
  const px = new Uint8Array(16), prev = renderer.getRenderTarget();
  renderer.setRenderTarget(rt); renderer.render(sc, cam); renderer.readRenderTargetPixels(rt, 0, 0, 4, 1, px); renderer.setRenderTarget(prev);
  rt.dispose(); m.dispose(); q.geometry.dispose();
  const h = k => (px[k * 4] * 256 + px[k * 4 + 1]) / 65535, v = ((h(0) + h(1)) / 2 + (h(2) + h(3)) / 2) / 2;
  return -2664.712 + 352.3924 * v;
}
let mapsP = null;
function loadMaps() {
  if (mapsP) return mapsP;
  const ld = new THREE.TextureLoader(); ld.setCrossOrigin('anonymous');
  const aniso = renderer.capabilities.getMaxAnisotropy(), up = t => { try { renderer.initTexture(t); } catch (e) { /* first draw uploads it */ } };
  const get = (url, i, cfg) => new Promise(res => { if (!url) return res(); ld.load(url, t => { cfg(t); up(t); mapAt[i] = performance.now(); res(); }, undefined, () => res()); });
  return (mapsP = Promise.all([
    get(files.dtm, 0, t => { t.colorSpace = THREE.NoColorSpace; t.magFilter = t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; t.flipY = true; terrU.tDtm.value = t; terrU.uHB0.value = readHB0(t); }),
    get(files.hiBump, 1, t => { t.colorSpace = THREE.NoColorSpace; t.anisotropy = aniso; terrU.tHi.value = t; }),
    get(files.ctxBump, 2, t => { t.colorSpace = THREE.NoColorSpace; t.anisotropy = aniso; terrU.tCtx.value = t; })
  ]));
}
const fadeMaps = () => { const now = performance.now(), f = a => (a ? sstep(now - a, 0, MAP_FADE) : 0); terrU.uOn.value.set(f(mapAt[0]), f(mapAt[1]), f(mapAt[2])); };
function* populateColony() {
loadMaps(); // normally already started at boot idle
// terrain: the real floor of Jezero Crater, 2 km east of the delta front (18.4455 N, 77.4635 E).
// Shape: USGS Mars 2020 HiRISE 1 m DTM (inner 1.6 km) blended into the CTX 20 m DTM (12 km), both packed as 16-bit RG.
// Light: HiRISE 25 cm / CTX 6 m orbital images used ONLY as bump (they are greyscale). Colour: the colour Mars map at Jezero
// plus procedural regolith (butterscotch fines, rust, dark basaltic sand, pale bedrock on steep faces).
// The city sits on a graded pad that eases back into the real ground.
const TERR_GL = /* glsl */ `
uniform sampler2D tDtm, tHi, tCtx, tMars; uniform vec3 uOn; uniform float uHB0; // uHB0 = hB(vec2(0.)), read back once after the DTM loads
// 16-bit heights live in R (hi byte) and G (lo byte); filter by hand so the bytes never blend across a carry
float dtmTap(vec2 uv, float side){ vec2 t=vec2(uv.x*.5+side*.5, uv.y); vec4 c=texture2D(tDtm,t); return (c.r*255.*256.+c.g*255.)/65535.; }
float dtmBil(vec2 uv, float side){ vec2 p=uv*512.-.5, f=fract(p), i=floor(p);
  float a=dtmTap((i+vec2(.5,.5))/512.,side), b=dtmTap((i+vec2(1.5,.5))/512.,side), c=dtmTap((i+vec2(.5,1.5))/512.,side), d=dtmTap((i+vec2(1.5,1.5))/512.,side);
  return mix(mix(a,b,f.x),mix(c,d,f.x),f.y); }
float hA(vec2 p){ return -2621.547+62.5074*dtmBil(vec2(p.x/1600.+.5,.5-p.y/1600.),0.); }   // HiRISE DTM, metres (areoid)
float hB(vec2 p){ return -2664.712+352.3924*dtmBil(vec2(p.x/12000.+.5,.5-p.y/12000.),1.); } // CTX DTM
float terrH(vec2 p){
  float b=hB(p), a=hA(p), wa=1.-smoothstep(560.,780.,max(abs(p.x),abs(p.y)));
  float h=mix(b,a,wa)-uHB0;
  float d=length(p);
  return uOn.x*h*smoothstep(330.,620.,d)            // the city's graded pad eases back into the real ground
    *(1.-smoothstep(JF0,JF1,d));                      // and the far band flattens onto the sky dome's ground (no step at the mesh edge)
}`;
// the far band: from JF0 to JF1 metres out the terrain's height fades to 0 and its colour to the sky dome's own ground (sky.js
// jezLit + jezAir, same uniforms), so the 9 km square mesh meets the dome with no seam: before this its edge showed as a box
const JF = 'const float JF0=3300., JF1=4400.;\n';
{
  // the grid is written straight into typed arrays in XZ (same vertex order and winding as PlaneGeometry + rotateX(-PI/2)).
  // Position only: the shader rebuilds the normal from the DTM (beginnormal_vertex is replaced) and the material samples no uv.
  const N = HIGH ? 420 : 210, N1 = N + 1, S = 9000, step = S / N, pos = new Float32Array(N1 * N1 * 3), idx = new Uint32Array(N * N * 6);
  for (let iz = 0, k = 0; iz < N1; iz++) { const z = -S / 2 + iz * step; for (let ix = 0; ix < N1; ix++, k += 3) { pos[k] = -S / 2 + ix * step; pos[k + 2] = z; } }
  for (let iz = 0, k = 0; iz < N; iz++) for (let ix = 0; ix < N; ix++, k += 6) {
    const a = ix + N1 * iz, b = a + N1, c = b + 1, d = a + 1;
    idx[k] = a; idx[k + 1] = b; idx[k + 2] = d; idx[k + 3] = b; idx[k + 4] = c; idx[k + 5] = d;
  }
  const g = new THREE.BufferGeometry(); g.setIndex(new THREE.BufferAttribute(idx, 1)); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), S * 0.7072); g.boundingBox = new THREE.Box3(new THREE.Vector3(-S / 2, 0, -S / 2), new THREE.Vector3(S / 2, 0, S / 2));
  const mat = new THREE.MeshStandardMaterial({ roughness: 0.95, metalness: 0 });
  mat.customProgramCacheKey = () => 'jezeroTerrain';
  mat.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, terrU);
    Object.assign(sh.uniforms, { uJSun: air.uSun, uJK: air.uK, uJAmb: air.uAmb, uJOrigin: air.uOrigin });
    sh.vertexShader = JF + TERR_GL + '\nvarying vec3 vTP; varying vec3 vTN;\n' + sh.vertexShader
      .replace('#include <beginnormal_vertex>', `vec3 objectNormal; { vec2 p=position.xz; float e=8.;
          objectNormal=normalize(vec3(-(terrH(p+vec2(e,0.))-terrH(p-vec2(e,0.)))/(2.*e),1.,-(terrH(p+vec2(0.,e))-terrH(p-vec2(0.,e)))/(2.*e))); vTN=objectNormal; }
        #ifdef USE_TANGENT
          vec3 objectTangent = vec3( tangent.xyz );
        #endif`)
      .replace('#include <begin_vertex>', '#include <begin_vertex>\ntransformed.y+=terrH(position.xz)-dot(position.xz,position.xz)/(2.*3389500.); vTP=transformed;'); // curvature: the dome ground is the planet sphere
    sh.fragmentShader = JF + TERR_GL + '\nvarying vec3 vTP; varying vec3 vTN;\nuniform vec3 uJSun, uJOrigin; uniform float uJK, uJAmb;\n' + NOISE + JEZ_GROUND_GLSL + `
      // greyscale orbital images -> height for shading only
      float bumpL(vec2 p){ float a=uOn.y*(1.-smoothstep(640.,790.,max(abs(p.x),abs(p.y)))), b=uOn.z*(1.-smoothstep(5000.,5900.,max(abs(p.x),abs(p.y))));
        float hb=texture2D(tCtx,vec2(p.x/12000.+.5,.5-p.y/12000.)).r, ha=texture2D(tHi,vec2(p.x/1600.+.5,.5-p.y/1600.)).r;
        return mix(.5,mix(hb,ha,a),max(a,b)); }
      // fbm with each octave faded to its mean once it nears a pixel (fw = base-octave cycles per pixel): no far shimmer
      float fbmBL(vec3 p, float fw){ float v=0.,a=.5; for(int i=0;i<5;i++){ float k=1.-smoothstep(.3,.6,fw); v+=a*(k>0.? mix(.5,n3(p),k) : .5); p*=2.03; fw*=2.03; a*=.5; } return v; }
      vec3 tA; float tR;
    ` + sh.fragmentShader
      .replace('#include <color_fragment>', `#include <color_fragment>
        { vec2 p=vTP.xz; float d=length(p);
          // colour: the colour map's own hue for Jezero (sampled wide so it's a tint, not pixels), then regolith variety on top
          vec3 hue=textureLod(tMars,vec2((77.46+180.)/360.,(18.45+90.)/180.),5.).rgb;
          float n1=fbm(vec3(p*.004,1.)), n2=fbm(vec3(p*.03,7.)), n3=fbmBL(vec3(p*.35,3.),max(length(fwidth(p)),1e-3)*.35);
          vec3 fines=vec3(.62,.38,.22), rust=vec3(.45,.21,.11), sand=vec3(.16,.11,.09), bed=vec3(.7,.55,.42);
          vec3 c=mix(fines,rust,smoothstep(.35,.7,n1));
          c=mix(c,sand,smoothstep(.62,.8,n2)*.75);                        // dark basaltic sand drifts
          float slope=1.-vTN.y; c=mix(c,bed,smoothstep(.05,.25,slope)*.6);  // steep faces expose paler bedrock
          c*=.85+.3*n3; c=mix(c,c*hue/max(dot(hue,vec3(.33)),.05)*.42,.35);
          c=mix(c*1.08+.02,c,smoothstep(240.,300.,d));                     // the graded pad reads a touch paler, compacted
          tA=c*.85; tR=mix(.9,1.,n3);
          diffuseColor.rgb=tA; }`)
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor=tR;')
      .replace('#include <dithering_fragment>', `#include <dithering_fragment>
        { float fwJ=max(length(fwidth(vTP.xz)),1.), wJ=smoothstep(JF0,JF1,length(vTP.xz));   // fwidth in uniform flow
          if(wJ>0.){ vec3 ro=cameraPosition-uJOrigin, dv=vTP-ro, sJ=normalize(uJSun); float dJ=length(dv);
            gl_FragColor.rgb=mix(gl_FragColor.rgb,jezAir(jezLit(vec3(vTP.x,0.,vTP.z),fwJ,sJ,uJAmb),ro,dv/dJ,0.,dJ,sJ,uJK),wJ); } }`)
      .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
        { vec2 p=vTP.xz; float w=max(length(fwidth(p)),1e-3), e=max(.3,w*.7);
          float gx=(bumpL(p+vec2(e,0.))-bumpL(p-vec2(e,0.)))/(2.*e), gz=(bumpL(p+vec2(0.,e))-bumpL(p-vec2(0.,e)))/(2.*e);
          float k=mix(9.,2.5,smoothstep(1.,6.,w));                          // metres of relief per unit brightness, gentler when far
          // pebbles + wind ripples up close
          float fade=1.-smoothstep(.15,.8,w);
          if(fade>.001){ float r=sin(dot(p,vec2(.9,.43))*2.6+fbm(vec3(p*.2,2.))*6.)*.5+.5;
            gx+=fade*(fbm(vec3(p*3.,5.))-.5)*.6+fade*r*.08; gz+=fade*(fbm(vec3(p*3.+9.,5.))-.5)*.6; }
          normal=normalize(normal+(viewMatrix*vec4(-gx*k*.1,0.,-gz*k*.1,0.)).xyz); }`);
  };
  const terrain = new THREE.Mesh(g, mat);
  terrain.receiveShadow = true; colony.add(terrain);
}

// sky: butterscotch by day, Mars' blue halo around the sun at dusk, stars at night
const skyU = { sunDir: { value: new THREE.Vector3() }, night: { value: 0 } };
const colSky = new THREE.Mesh(new THREE.SphereGeometry(7000, 48, 24), new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false, fog: false, uniforms: skyU,
  vertexShader: `varying vec3 vD; void main(){ vD=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
  fragmentShader: `uniform vec3 sunDir; uniform float night; varying vec3 vD; ${NOISE}
  void main(){ float e=clamp(vD.y,0.,1.), sd=max(dot(vD,sunDir),0.);
    vec3 dayC=mix(vec3(0.78,0.54,0.36),vec3(0.36,0.22,0.15),pow(e,0.6));
    vec3 duskC=mix(vec3(0.2,0.14,0.13),vec3(0.015,0.015,0.03),pow(e,0.45));
    vec3 c=mix(dayC,duskC,night)+vec3(0.3,0.5,0.9)*pow(sd,22.)*(0.2+night*0.55)+vec3(0.5,0.6,0.8)*pow(sd,160.)*0.6;
    c+=vec3(0.9)*step(0.9975,h3(floor(vD*500.)))*smoothstep(0.5,1.,night)*smoothstep(0.05,0.3,e);
    gl_FragColor=vec4(c,1.); }`
})); colony.add(colSky);

yield; // terrain + sky are in

// city plan: ring roads + 8 avenues + glass corridors from the hub dome to 4 outer domes
const RINGS = [62, 132, 204], AVE = 8, DOMES = [[0, 0, 20, 0.02]], TUBES = [];
for (let k = 0; k < 4; k++) { const a = Math.PI / 8 + k * Math.PI / 2; DOMES.push([Math.cos(a) * 96, Math.sin(a) * 96, 15, 0.26 + k * 0.08]); TUBES.push(a); }
const angD = (a, b) => Math.abs(((a - b) % (Math.PI * 2) + Math.PI * 3) % (Math.PI * 2) - Math.PI);
const habs = [], fabs = [];
for (let r = 34; r < 238; r += 14) {
  let a = r * 0.11;
  while (a < r * 0.11 + Math.PI * 2 - 0.05) {
    const rd = Math.min(6.6, 2.6 + rnd() * 3.2 + 5 * Math.exp(-r / 70)), x = Math.cos(a) * r, z = Math.sin(a) * r;
    const nearAve = [...Array(AVE)].some((_, k) => angD(a, k * Math.PI / 4) * r < rd + 4);
    const nearTube = r < 86 && TUBES.some(t => angD(a, t) * r < rd + 3.5);
    const clear = !(nearAve || nearTube || RINGS.some(R => Math.abs(r - R) < rd + 3.5) || DOMES.some(([dx, dz, dr]) => Math.hypot(x - dx, z - dz) < dr + rd + 3));
    if (clear && rnd() > 0.1) {
      const bt = 0.06 + (r / 238) * 0.58 + rnd() * 0.08;
      if (r > 175 && rnd() < 0.28) fabs.push({ x, z, w: 8 + rnd() * 4, d: 5, h: 2.5 + rnd() * 2.5, rot: a, bt }); // low fab sheds on the industrial ring
      else habs.push({ x, z, r: rd, ys: 0.72 + rnd() * 0.35, rot: rnd() * 6.28, bt, seed: rnd() * 50 });
    }
    a += (2 * rd + 2.6) / r;
  }
}

const winU = { night: { value: 0 } };
// habitat.js: real geodesic struts, mirror/bronze glass panels with a Mars sky env map, airlocks, antennas, vaulted hangars, big domes with interiors
const marsEnv = createMarsEnv({ THREE, renderer });
yield; // PMREM env done
const HAB = createHabitatAssets({ THREE, renderer, envMap: marsEnv, frameDetail: 'low' });
yield; // habitat geometry + materials done
// colours drawn in the original order (same rnd() stream), then instances are laid out by build threshold so each frame
// draws only the started prefix (mesh.count) instead of paying vertex work for hidden ones. habs/fabs keep their order for everything else.
habs.forEach(l => (l.col = new THREE.Color().setHSL(0.08, 0.06 + rnd() * 0.06, 0.72 + rnd() * 0.16)));
fabs.forEach(l => (l.col = new THREE.Color().setHSL(0.07, 0.08, 0.55 + rnd() * 0.15)));
const byBt = (a, b) => a.bt - b.bt, habAll = [...habs].sort(byBt), fabI = [...fabs].sort(byBt); // stable sort
// low tier: every other hab in build order is dropped, so the city keeps its full extent at half the instances
if (!HIGH) habAll.forEach((l, i) => (l.skip = i % 2 === 1));
habAll.forEach(l => { // keep the landing spots and the build pad clear of habs
  if (ROCK_SITES.land.some(([x, z]) => Math.hypot(l.x - x, l.z - z) < l.r + 16) || Math.hypot(l.x - ROCK_SITES.build[0], l.z - ROCK_SITES.build[1]) < l.r + 30) l.skip = true; });
const habI = habAll.filter(l => !l.skip);
const shell = new THREE.InstancedMesh(HAB.habShellGeo, HAB.habShellMat, habI.length); shell.customDepthMaterial = HAB.habShellDepthMat;
const habGlass = new THREE.InstancedMesh(HAB.habGlassGeo, HAB.habGlassMat, habI.length); habGlass.receiveShadow = true; // same matrices as shell (glass/opaque split is hashed from position)
const frame = new THREE.InstancedMesh(HAB.habFrameGeo, HAB.habFrameMat, habI.length); frame.receiveShadow = true; frame.castShadow = false; // the shell silhouette already casts the dome
const ringPad = new THREE.InstancedMesh(HAB.ringPadGeo, HAB.ringPadMat, habI.length);
const skirt = new THREE.InstancedMesh(HAB.skirtGeo, HAB.skirtMat, habI.length);
const sheds = new THREE.InstancedMesh(HAB.shedGeo, HAB.shedMat, fabs.length); sheds.customDepthMaterial = HAB.shedDepthMat;
habI.forEach((l, i) => shell.setColorAt(i, l.col)); fabI.forEach((l, i) => sheds.setColorAt(i, l.col));
// instances outside .count are never drawn, so give each mesh a fixed bound instead of one computed from whatever prefix exists first
const bnd = r => new THREE.Sphere(new THREE.Vector3(0, 10, 0), r);
[shell, habGlass, frame, ringPad, skirt, sheds].forEach(m => (m.boundingSphere = bnd(270)));
yield; // instanced city meshes allocated
colony.add(shell, habGlass, frame, ringPad, skirt, sheds);
// shadows: shell/ringPad/sheds cast + receive; shell and sheds use customDepthMaterials that match their per-instance vertex toggles.
// The frame does not cast (the shell silhouette covers it). Instances past .count are not drawn and cast nothing.
shell.castShadow = shell.receiveShadow = ringPad.castShadow = ringPad.receiveShadow = sheds.castShadow = sheds.receiveShadow = true;

// streetlights crawl outward along every road; red beacons blink on the crowns of the big domes
const lp = [], lb = [];
const roadLines = [];
RINGS.forEach(R => { const pts = []; for (let i = 0; i <= 200; i++) { const a = i / 200 * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * R, 0.4, Math.sin(a) * R)); if (i % 2 === 0) for (const o of [-2.6, 2.6]) { lp.push(Math.cos(a) * (R + o), 1.6, Math.sin(a) * (R + o)); lb.push(0.04 + R / 236 * 0.55 + (i / 200) * 0.08); } } roadLines.push([pts, 0.02 + R / 236 * 0.55]); });
for (let k = 0; k < AVE; k++) { const a = k * Math.PI / 4, pts = [new THREE.Vector3(Math.cos(a) * 20, 0.4, Math.sin(a) * 20), new THREE.Vector3(Math.cos(a) * 250, 0.4, Math.sin(a) * 250)]; roadLines.push([pts, 0.0]); for (let r = 24; r < 250; r += 4) for (const o of [-3, 3]) { lp.push(Math.cos(a) * r + Math.cos(a + 1.5708) * o, 1.6, Math.sin(a) * r + Math.sin(a + 1.5708) * o); lb.push(0.02 + (r / 250) * 0.62); } }
const roads = roadLines.map(([pts, bt]) => { const m = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0xffb070, transparent: true, opacity: 0 })); m.userData.bt = bt; colony.add(m); return m; });
const lightU = { g: { value: 0 }, night: { value: 0 }, t: { value: 0 } };
const ptsMat = (vs, fs) => new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: lightU, vertexShader: vs, fragmentShader: fs });
const DOT = `varying vec3 vC; varying float vA; void main(){ float d=length(gl_PointCoord-.5); gl_FragColor=vec4(vC*vA*smoothstep(.5,.05,d)*2.4,1.); }`;
{
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(lp, 3)); g.setAttribute('bt', new THREE.Float32BufferAttribute(lb, 1));
  colony.add(new THREE.Points(g, ptsMat(`attribute float bt; uniform float g; uniform float night; varying vec3 vC; varying float vA; void main(){ vec4 mv=modelViewMatrix*vec4(position,1.); vC=vec3(1.,0.66,0.3); vA=smoothstep(bt,bt+0.025,g)*(0.15+0.85*night); gl_PointSize=clamp(520./-mv.z,1.2,6.); gl_Position=projectionMatrix*mv; }`, DOT)));
}
{
  const p = [], s = []; habs.filter(l => l.r > 5).forEach(l => { const k = rnd(); if (!l.skip) { p.push(l.x, l.r * l.ys + 0.6, l.z); s.push(l.bt + 0.16, k); } }); // rnd() drawn for every hab so the stream is tier-independent
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); g.setAttribute('bs', new THREE.Float32BufferAttribute(s, 2));
  colony.add(new THREE.Points(g, ptsMat(`attribute vec2 bs; uniform float g; uniform float t; uniform float night; varying vec3 vC; varying float vA; void main(){ vec4 mv=modelViewMatrix*vec4(position,1.); vC=vec3(1.,0.12,0.06); vA=step(bs.x,g)*step(0.55,fract(t*0.7+bs.y))*(0.3+0.7*night)*1.6; gl_PointSize=clamp(900./-mv.z,2.,9.); gl_Position=projectionMatrix*mv; }`, DOT)));
}
// domes: amber lattice rises first, then the glass skins over and glows warm from inside at night
const domeG = new THREE.SphereGeometry(1, 32, 14, 0, Math.PI * 2, 0, Math.PI / 2);
const domes = DOMES.map(([x, z, r, bt]) => {
  const g = HAB.bigDome(); g.position.set(x, 0, z); g.scale.setScalar(r); colony.add(g);
  return { g, lattice: g.getObjectByName('lattice'), glass: g.getObjectByName('glass'), glow: g.getObjectByName('glow'), bt };
});
// pressurized corridors: glass tubes that extrude out from the hub to each dome
const tubes = TUBES.map((a, i) => { const g = new THREE.Group(); g.position.set(Math.cos(a) * 19, 2.6, Math.sin(a) * 19); g.rotation.y = -a; const ribs = new THREE.Mesh(HAB.ribGeo, HAB.ribMat); ribs.castShadow = ribs.receiveShadow = true; g.add(new THREE.Mesh(HAB.tubeGeo, HAB.tubeMat), ribs); colony.add(g); return { g, bt: 0.12 + i * 0.07 }; });
// solar farm: rows of tilted panels tiling in on the west flats
const panels = [];
for (let r = 262; r < 345; r += 4.2) for (let a = 0.25; a < 1.35; a += 3.2 / r) panels.push({ x: Math.cos(a) * r, z: Math.sin(a) * r, bt: 0.22 + (r - 262) / 83 * 0.22 + (a - 0.25) * 0.12 });
panels.sort(byBt); // nothing else depends on panel order
const panel = new THREE.InstancedMesh(new THREE.BoxGeometry(3, 0.1, 2.2).translate(0, 1.2, 0), new THREE.MeshStandardMaterial({ color: 0x16243c, metalness: 0.85, roughness: 0.22, emissive: 0x050a14 }), panels.length);
panel.castShadow = panel.receiveShadow = true; panel.boundingSphere = bnd(360); colony.add(panel);
yield; // lights, domes, tubes, solar farm

// tower cranes: show up just ahead of the build front, swing like a timelapse, then pack up
const craneMat = new THREE.MeshStandardMaterial({ color: 0xf0a35a, emissive: 0x3a1a00, roughness: 0.6 });
const craneLots = habs.filter(l => l.r > 4.2 && !l.skip);
const cranes = craneLots.filter((l, i) => i % Math.max(1, Math.floor(craneLots.length / 20)) === 3).slice(0, 20).map((l, i) => {
  const g = new THREE.Group(); g.position.set(l.x + l.r + 2, 0, l.z + 2); const H = Math.max(22, l.r * l.ys + 16);
  const mast = new THREE.Mesh(new THREE.BoxGeometry(1, H, 1).translate(0, H / 2, 0), craneMat);
  const jib = new THREE.Group(); jib.position.y = H;
  jib.add(new THREE.Mesh(new THREE.BoxGeometry(30, 0.8, 0.8).translate(8, 0, 0), craneMat), new THREE.Mesh(new THREE.BoxGeometry(3, 2.2, 2).translate(-6, -0.8, 0), craneMat), new THREE.Mesh(new THREE.BoxGeometry(0.08, 10, 0.08).translate(18, -5, 0), craneMat));
  g.add(mast, jib); g.traverse(o => { if (o.isMesh) o.castShadow = true; }); colony.add(g); return { g, jib, bt: l.bt, ph: i * 1.7 };
});

let rockets = null;
const mkRockets = (light = true) => (rockets = rockMod.createRockets({ THREE, foot: rockMod.foot, colony, envMap: marsEnv, high: HIGH, sites: ROCK_SITES, light })); // late load: no PointLight, so the warmed colony programs stay valid
yield; // cranes
if (rockMod) mkRockets(); else rockP.then(() => { if (rockMod) { mkRockets(false); lateRockets(rockets); } }); // normally loaded long before the colony is built
yield; // rockets
// colony life (machines.js): rovers, suited figures, graded roads + lamp pools, comms masts; replaces the 1 px roads and the traffic dots
const life = createColonyLife({ THREE, colony, layout: colonyLayout({ high: HIGH, rockets: true }), envMap: marsEnv, high: HIGH, arrive: ARRIVE, hideLines: roads, solar: panel });
let lastG = -1;
const mtx = new THREE.Matrix4(), q4 = new THREE.Quaternion(), yAx = new THREE.Vector3(0, 1, 0), v3 = new THREE.Vector3(), s3 = new THREE.Vector3(), q0 = new THREE.Quaternion();
const skyCol = new THREE.Color(), dayH = new THREE.Color(0.78, 0.54, 0.36), duskH = new THREE.Color(0.2, 0.14, 0.13);
const qPanel = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0.5)); // panels tilt toward the low western sun
const started = (list, g) => { let n = 0; while (n < list.length && list[n].bt < g) n++; return n; }; // easeOut(x) > 0 exactly when bt < g
// returns true when the build state (and so the shadow casters and sun) changed this frame
function buildColony(g, t) {
  fadeMaps();
  const gR = g; g = Math.max(0, (g - ARRIVE) / (1 - ARRIVE)); // rockets: the ships land first, the city build (and its day) runs on the rest
  const night = colNight = sstep(g, 0.35, 0.95), el = THREE.MathUtils.lerp(0.34, -0.05, sstep(g, 0.05, 1));
  colSky.visible = false; // the atmosphere owner's sky dome (planets.air) replaces this one
  colSun.set(-Math.cos(el), Math.sin(el), -Math.cos(el) * 0.22).normalize();
  // shadow camera: sit 600 units out along the sun, look at the colony centre; vertical half-extent = projected ground disc + tallest caster (cranes, domes)
  { const c = sunLight.shadow.camera, V = 390 * Math.max(colSun.y, 0.06) + 80; sunLight.target.position.copy(COLV); sunLight.position.copy(COLV).addScaledVector(colSun, 600);
    if (c.top !== V) { c.top = V; c.bottom = -V; c.updateProjectionMatrix(); } }
  skyU.sunDir.value.copy(colSun); skyU.night.value = night; lightU.g.value = g; lightU.night.value = night; lightU.t.value = t; winU.night.value = night; HAB.night.value = night;
  scene.fog.color.copy(skyCol.copy(dayH).lerp(duskH, night)); scene.fog.near = 500; scene.fog.far = 4200; // haze out to the delta front ~2 km west
  sunLight.intensity = THREE.MathUtils.lerp(2.2, 0.1, night); ambient.intensity = THREE.MathUtils.lerp(0.5, 0.1, night); hemi.intensity = THREE.MathUtils.lerp(1.5, 0.12, night);
  hemi.color.copy(skyCol); if (planets.air && planets.air.hemi) planets.air.hemi(hemi.color); HAB.tubeMat.emissiveIntensity = night * 0.35;
  if (rockets) rockets.update(gR, t, night); life.update(g, t, night, gR);
  cranes.forEach(c => { c.jib.rotation.y = c.ph + g * 46 + t * 0.15; });
  if (Math.abs(gR - lastG) < 1e-4) return false; lastG = gR;
  // lists are sorted by bt, so the started instances are a prefix: draw count = how many have begun each stage
  const nPad = started(habI, g), nFrame = started(habI, g - 0.02), nShell = started(habI, g - 0.07);
  for (let i = 0; i < nPad; i++) {
    const l = habI[i];
    // pad pours, struts rise, panels skin up from the base
    const k0 = easeOut((g - l.bt) / 0.03), s = easeOut((g - l.bt - 0.02) / 0.06), f = easeOut((g - l.bt - 0.07) / 0.08);
    q4.setFromAxisAngle(yAx, l.rot);
    mtx.compose(v3.set(l.x, 0, l.z), q4, s3.set(l.r, k0, l.r)); ringPad.setMatrixAt(i, mtx); skirt.setMatrixAt(i, mtx);
    if (i < nFrame) { mtx.compose(v3.set(l.x, 0.45, l.z), q4, s3.set(l.r * 1.015, l.r * l.ys * s * 1.015, l.r * 1.015)); frame.setMatrixAt(i, mtx); }
    if (i < nShell) { mtx.compose(v3.set(l.x, 0.45, l.z), q4, s3.set(l.r, l.r * l.ys * f, l.r)); shell.setMatrixAt(i, mtx); habGlass.setMatrixAt(i, mtx); }
  }
  ringPad.count = skirt.count = nPad; frame.count = nFrame; shell.count = habGlass.count = nShell;
  const nShed = started(fabI, g - 0.04);
  for (let i = 0; i < nShed; i++) { const l = fabI[i], f = easeOut((g - l.bt - 0.04) / 0.07); q4.setFromAxisAngle(yAx, -l.rot); mtx.compose(v3.set(l.x, 0, l.z), q4, s3.set(l.w, l.h * f, l.d)); sheds.setMatrixAt(i, mtx); }
  sheds.count = nShed;
  shell.instanceMatrix.needsUpdate = habGlass.instanceMatrix.needsUpdate = frame.instanceMatrix.needsUpdate = ringPad.instanceMatrix.needsUpdate = skirt.instanceMatrix.needsUpdate = sheds.instanceMatrix.needsUpdate = true;
  const nPanel = started(panels, g);
  for (let i = 0; i < nPanel; i++) { const p = panels[i], k = easeOut((g - p.bt) / 0.04); mtx.compose(v3.set(p.x, 0, p.z), qPanel, s3.set(1, k, 1)); panel.setMatrixAt(i, mtx); }
  panel.count = nPanel; panel.instanceMatrix.needsUpdate = true;
  roads.forEach(m => (m.material.opacity = sstep(g, m.userData.bt, m.userData.bt + 0.06) * (0.15 + 0.85 * night)));
  domes.forEach(d => {
    const s = easeOut((g - d.bt) / 0.1), gl = sstep(g, d.bt + 0.1, d.bt + 0.18);
    d.lattice.scale.set(1, Math.max(0.001, s), 1);
    d.g.visible = s > 0; // nothing of a dome (its planted floor included) before it starts
    d.glass.material.opacity = gl * 0.28; d.glow.material.opacity = gl * night * 0.28;
  });
  tubes.forEach(tb => { const k = easeOut((g - tb.bt) / 0.08); tb.g.scale.set(Math.max(0.001, k * 62), 1, 1); tb.g.visible = k > 0; });
  cranes.forEach(c => { const v = Math.min(easeOut((g - c.bt + 0.08) / 0.04), 1 - easeOut((g - c.bt - 0.2) / 0.04)); c.g.scale.set(1, Math.max(0.001, v), 1); c.g.visible = v > 0.01; });
  return true;
}
colonyAPI = { build: buildColony, cranes, get rockets() { return rockets; } };
} // populateColony
let colonyGen = null;
// one chunk of the build; true once the colony is fully populated
function step() { if (colonyAPI) return true; colonyGen = colonyGen || populateColony(); return colonyGen.next().done; }
function ensure() { while (!step()); }   // synchronous: the colony is about to render
return { group: colony, step, ensure, loadMaps, rockReady: rockP, get api() { return colonyAPI; }, get sun() { return colSun; }, get night() { return colNight; }, get done() { return !!colonyAPI; } };
} // createColony
