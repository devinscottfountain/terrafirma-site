// sol-fx.js: materials and passes for the Solutions scene: the dot cloud shader, screen-space lines, dust motes, GPU dirt
// particles, the sky haze behind everything, and a small post chain (bloom, the film's warm grade, vignette, grain, soft
// canvas edges). Every program here is compiled by warm() in solutions.js.
import { H_GLSL, D_GLSL, SITE } from './sol-terrain.js';

// Palette (display sRGB hex). The host can override any of these with CSS custom properties of the same name
// (--sol-dot, --sol-cut, --sol-fill, --sol-haze, --sol-accent). Warm site palette, no red/green.
export const PALETTE = { dot: '#ddd2c2', cut: '#e8772f', fill: '#77b4bf', haze: '#b97a4e', accent: '#f4e4c8' };

// The film's grade (copy of CINE_GLSL in film/post.js: ACES Hill fit, warm balance, toe lift, teal shadows, warm highlights).
const CINE = /* glsl */ `
const mat3 cACI=mat3(.59719,.07600,.02840, .35458,.90834,.13383, .04823,.01566,.83777);
const mat3 cACO=mat3(1.60475,-.10208,-.00327, -.53108,1.10813,-.07276, -.07367,-.00605,1.07602);
vec3 cRRT(vec3 v){ vec3 a=v*(v+.0245786)-.000090537, b=v*(.983729*v+.4329510)+.238081; return a/b; }
vec3 cineTone(vec3 c){ return clamp(cACO*cRRT(cACI*(c*vec3(1.025,1.,.96))),0.,1.); }
vec3 cineOETF(vec3 c){ c=max(c,0.); return mix(c*12.92, 1.055*pow(c,vec3(1./2.4))-.055, step(.0031308,c)); }
vec3 cineGrade(vec3 o){
  float l=dot(o,vec3(.2126,.7152,.0722));
  float mx=max(o.r,max(o.g,o.b)), mn=min(o.r,min(o.g,o.b)), s=(mx-mn)/max(mx,1e-4);
  o=max(mix(vec3(l),o,1.05+.14*(1.-s)),0.);
  vec3 u=1.-clamp(o,0.,1.); o+=.16*o*u*u*u*u;
  float sh=6.*l*(1.-l)*(1.-l)*(1.-l);
  o+=sh*vec3(-.010,.003,.012);
  o+=smoothstep(.5,1.,l)*vec3(.022,.008,-.014);
  return clamp(o,0.,1.);
}
float cH12(vec2 p){ vec3 p3=fract(vec3(p.xyx)*.1031); p3+=dot(p3,p3.yzx+33.33); return fract((p3.x+p3.y)*p3.z); }`;

export const FS_VERT = /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }`;

// ------------------------------------------------------------------ dot cloud
// Mode weights are vec3(plan, dig, exec) (same order as the scene's mode index). uWA is the look ahead of a transition
// pulse, uWB behind it; at rest both are equal.
export function dotMaterial(THREE, U) {
  return new THREE.ShaderMaterial({
    uniforms: U, transparent: true, depthWrite: false,
    vertexShader: /* glsl */ `
      attribute vec4 aD;
      uniform sampler2D uField; uniform vec4 uFieldT;
      uniform float uT, uMorph, uDensity, uMinS, uPx, uPR, uSizeK, uNear, uMaxPx;
      uniform vec3 uWA, uWB, uSun, uCamP, uDot, uCut, uFill, uHaze, uAmb, uSunC;
      uniform vec4 uPulse, uScan, uBucket, uFog, uPit, uBoxA[6], uBoxB[6];
      varying vec4 vC;
      ${H_GLSL}
      ${D_GLSL}
      // field: bilinear (R delta, G marks) plus its xz gradient
      vec4 fieldAt(vec2 p, out vec2 grad){
        vec2 u = (p - uFieldT.xy) / uFieldT.z - .5; grad = vec2(0.);
        if (u.x < 0. || u.y < 0. || u.x > uFieldT.w - 1.01 || u.y > uFieldT.w - 1.01) return vec4(0.);
        ivec2 i = ivec2(u); vec2 f = u - vec2(i);
        vec2 a = texelFetch(uField, i, 0).rg, b = texelFetch(uField, i + ivec2(1, 0), 0).rg, c = texelFetch(uField, i + ivec2(0, 1), 0).rg, d = texelFetch(uField, i + ivec2(1, 1), 0).rg;
        grad = vec2(mix(b.r - a.r, d.r - c.r, f.y), mix(c.r - a.r, d.r - b.r, f.x)) / uFieldT.z;
        return vec4(mix(mix(a, b, f.x), mix(c, d, f.x), f.y), 0., 0.);
      }
      // nearest texel of the dig delta (shadow marching only)
      float fieldNear(vec2 p){
        vec2 u = (p - uFieldT.xy) / uFieldT.z;
        if (u.x < 0. || u.y < 0. || u.x > uFieldT.w - 1. || u.y > uFieldT.w - 1.) return 0.;
        return texelFetch(uField, ivec2(u), 0).r;
      }
      void main(){
        vec2 p = position.xz; float rank = aD.y;
        if (rank > uDensity) { gl_Position = vec4(2., 2., 2., 1.); gl_PointSize = 0.; return; }
        vec2 fg; vec4 fd = fieldAt(p, fg);
        float h0 = hF(p), hE = h0 + fd.x - fd.y*.05, hDs = hD(p, h0), cf = hE - hDs;
        // slope of the existing ground, and its long soft shadows (march toward the low sun)
        float e = max(.25, aD.x*.5);
        vec2 aG = vec2(hF(p + vec2(e, 0.)) - h0, hF(p + vec2(0., e)) - h0) / e;
        vec2 sd = normalize(uSun.xz); float tanE = uSun.y / length(uSun.xz), tsh = 0.;
        for (int k = 0; k < 7; k++) {   // relief shadows, the dug pit included (its sun-side wall shades the floor)
          float d = 2.*pow(1.62, float(k)); vec2 q = p + sd*d;
          float o = hF(q) + fieldNear(q) - (hE + d*tanE); tsh = max(tsh, clamp(o / (.25 + d*.05), 0., 1.));
        }
        if (fd.x < -.05) { float d = .9; vec2 q = p + sd*d; tsh = max(tsh, clamp((h0 + fieldNear(q) - (hE + d*tanE)) / .3, 0., 1.)); }
        // transition: the new look spreads out behind the pulse front, the pulse itself is a lifted bright ring
        float dp = distance(p, uPulse.xy), front = 1. - smoothstep(uPulse.z - 3., uPulse.z + 1., dp);
        vec3 w = mix(uWA, uWB, front);
        float ring = exp(-pow((dp - uPulse.z) / 2.2, 2.))*uPulse.w;
        float ds = distance(p, uScan.xy), scan = exp(-pow((ds - uScan.z) / 1.6, 2.))*uScan.w;
        float h = mix(hE, hDs, uMorph*w.x) + ring*.35 + scan*.12;
        vec4 mv = modelViewMatrix*vec4(p.x, h, p.y, 1.);
        gl_Position = projectionMatrix*mv;
        // light: analytic + dug gradient, sun, terrain self-shadow, machine shadows (boxes swept along the sun)
        vec2 g = aG + fg;
        vec3 n = normalize(vec3(-g.x, 1., -g.y));
        float lam = clamp(dot(n, uSun)*.85 + .22, 0., 1.), sh = 1. - tsh*.85;   // half-lambert: grazing sun still reads the relief
        for (int k = 0; k < 6; k++) {
          vec4 A = uBoxA[k], B = uBoxB[k]; if (B.w <= 0.) continue;
          vec2 q = p - A.xy; q = vec2(q.x*A.z - q.y*A.w, q.x*A.w + q.y*A.z);
          vec2 dl = vec2(sd.x*A.z - sd.y*A.w, sd.x*A.w + sd.y*A.z), inv = 1. / (abs(dl) + 1e-4)*sign(dl + 1e-6);
          vec2 t0 = (-B.xy - q)*inv, t1 = (B.xy - q)*inv, tn = min(t0, t1), tx = max(t0, t1);
          float ta = max(max(tn.x, tn.y), 0.), tb = min(tx.x, tx.y), L = B.z / tanE;
          if (tb > ta && ta < L) sh *= 1. - B.w*(1. - smoothstep(L*.55, L, ta));
        }
        float ht = smoothstep(-3., 9., h);
        vec3 alb = uDot*mix(.72, 1.12, ht);
        vec3 lit = alb*(uAmb*(.55 + .45*n.y) + uSunC*lam*sh);
        lit *= 1. - fd.y*.35;
        // fresh work: cut soil darker and richer, dumped soil paler (the edit field's sign)
        lit *= mix(vec3(1.), vec3(1.2, 1.12, 1.02), smoothstep(.05, .8, fd.x));   // dumped soil reads paler
        // dig: lit ground plus the cut/fill heat patch under the bucket
        float bp = (1. - smoothstep(uBucket.z*.45, uBucket.z, distance(p, uBucket.xy)))*uBucket.w;
        vec2 pq = abs(p - uPit.xy) - uPit.zw; float pz = (1. - smoothstep(0., 2.5, max(pq.x, pq.y)))*.8*w.y;   // the whole pit (a bit fainter than under the bucket)
        bp = max(bp, pz);
        float amt = smoothstep(.04, 1.3, abs(cf)), atG = 1. - smoothstep(.06, .22, abs(cf));
        vec3 heat = cf > 0. ? uCut : uFill;
        vec3 cDig = mix(lit, heat*(1.9 + 1.1*lam), bp*amt) + bp*atG*vec3(1.6, 1.5, 1.3);
        // plan: calm, near flat light, the whole site in cut and fill, design contours echoed in the dots
        float cl = fract(h / 1.0), con = 1. - smoothstep(0., .06, min(cl, 1. - cl));
        vec3 cPlan = alb*(.32 + .26*lam) + mix(vec3(0.), (cf > 0. ? uCut : uFill)*1.7, smoothstep(.06, 1.3, abs(cf))) + alb*con*.14;
        // exec: lit ground, a touch brighter so the whole site reads
        vec3 cExec = lit*1.18;
        // as built: ground the machines have dug reads as a bright fresh scan in the survey views
        float asb = smoothstep(.08, .6, -fd.x);
        cPlan = mix(cPlan, vec3(1., .93, .8)*.9, asb*.75); cExec += vec3(1., .9, .72)*asb*.5;
        // survey cues: dug walls and pile flanks outline themselves (field slope), faint elevation bands
        float edge = smoothstep(.35, 1.1, length(fg)), bl = fract(h / .5), band = 1. - smoothstep(0., .1, min(bl, 1. - bl));
        vec3 cue = vec3(1., .86, .66);
        cDig += cue*(edge*.66 + band*.08); cExec += cue*(edge*.5 + band*.2);
        vec3 col = cPlan*w.x + cDig*w.y + cExec*w.z;
        col += vec3(1., .82, .62)*(ring*1.8 + scan*.55);
        // haze: distance from the camera, plus a site radius fade (plan and exec)
        float dist = length(mv.xyz), fogA = exp(-pow(dist / uFog.x, 2.));
        float site = 1. - smoothstep(uFog.y - uFog.z, uFog.y, distance(p, vec2(${SITE.centre.x.toFixed(1)}, ${SITE.centre.z.toFixed(1)})));
        col = mix(uHaze*.55, col, .2 + .8*fogA);
        // even density on screen: each dot knows the world spacing that lands uMinS px apart at its distance; finer rings
        // are thinned to it (by their random) and drawn at that size, coarser ones keep their own spacing
        float sT = uMinS*uPR*dist / uPx, keep = clamp(aD.x*aD.x / max(sT*sT, 1e-8), 0., 1.);
        float a = (.74 + .26*aD.w)*(.14 + .86*fogA)*site*(1. - smoothstep(keep*.75, keep + 1e-4, aD.w));
        a *= smoothstep(uNear, uNear*2.5, dist);
        float ps = max(aD.x, sT)*uSizeK*(1. + ring*.9 + scan*.3)*uPx / max(.1, -mv.z);
        if (ps < 1.1*uPR) { a *= ps / (1.1*uPR); ps = 1.1*uPR; }
        ps = min(ps, uMaxPx*uPR);
        vC = vec4(col, a);
        gl_PointSize = a < .004 ? 0. : ps;
      }`,
    fragmentShader: /* glsl */ `
      varying vec4 vC;
      void main(){
        float d = length(gl_PointCoord - .5), a = vC.a*smoothstep(.5, .2, d);
        if (a < .003) discard;
        gl_FragColor = vec4(vC.rgb, a);
      }`,
  });
}

// ------------------------------------------------------------------ screen-space lines
// Quads per segment widened in screen space. aSE.x = side, aSE.y = end. aT: 0..1 along the line set (reveal, flow, head),
// aK: brightness of the segment. One program for every line set.
const LINE_VS = /* glsl */ `
  vec2 lineOff(vec2 ps, vec2 qs, vec2 se, float w, out float vD){
    vec2 d = se.y > .5 ? ps - qs : qs - ps; float L = length(d); d = L > 1e-5 ? d / L : vec2(1., 0.);
    float hw = w*.5 + 1.; vD = se.x*hw;
    return vec2(-d.y, d.x)*se.x*hw + d*(se.y > .5 ? 1. : -1.)*w*.5;
  }`;
export function lineMaterial(THREE, RES, PRU, T, color, { width = 1, depthTest = true } = {}) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(color) }, uW: { value: width }, uOpacity: { value: 0 }, uReveal: { value: 1 },
      uFlow: { value: new THREE.Vector4(0, 1, 0, 1) }, uHead: { value: new THREE.Vector4(-1, 0, 0.08, 0) }, uRes: RES, uPR: PRU, uT: T,
    },
    transparent: true, depthWrite: false, depthTest, side: THREE.DoubleSide,
    vertexShader: /* glsl */ `
      attribute vec3 aOther; attribute vec2 aSE; attribute float aT, aK; uniform vec2 uRes; uniform float uW, uPR; varying float vD, vT, vK;
      ${LINE_VS}
      void main(){
        vec4 p = projectionMatrix*modelViewMatrix*vec4(position, 1.), q = projectionMatrix*modelViewMatrix*vec4(aOther, 1.);
        vec2 h = uRes*.5; float d;
        vec2 o = lineOff(p.xy / p.w*h, q.xy / q.w*h, aSE, uW*uPR*(.75 + .5*aK), d); vD = d; vT = aT; vK = aK;
        p.xy += o / h*p.w; gl_Position = p;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uW, uPR, uOpacity, uReveal, uT; uniform vec4 uFlow, uHead; varying float vD, vT, vK;
      void main(){
        float a = clamp(uW*uPR*(.75 + .5*vK)*.5 + .5 - abs(vD), 0., 1.)*uOpacity;
        a *= 1. - smoothstep(uReveal - .06, uReveal, vT);
        // flow: pulses travelling along t (x speed, y count, z strength, w base level)
        float fl = fract(vT*uFlow.y - uT*uFlow.x), pulse = smoothstep(.75, 1., fl)*uFlow.z;
        // head: a bright head at uHead.x with a fading trail behind it (y strength, z trail length, w ahead level)
        float dh = uHead.x - vT, trail = dh >= 0. ? (1. - smoothstep(0., uHead.z, dh)) : uHead.w;
        float b = (.45 + .55*vK)*(uFlow.w + pulse) + trail*uHead.y;
        a *= min(1., b + .15);
        if (a < .004) discard;
        gl_FragColor = vec4(uColor*max(1., b*1.6), a);
      }`,
  });
}
// a set of segments with preallocated buffers: set(i, ax, ay, az, bx, by, bz, ta, tb, k), then commit(count)
export function lineSet(THREE, mat, maxSeg) {
  const pos = new Float32Array(maxSeg * 12), oth = new Float32Array(maxSeg * 12), se = new Float32Array(maxSeg * 8);
  const tt = new Float32Array(maxSeg * 4), kk = new Float32Array(maxSeg * 4), idx = new Uint32Array(maxSeg * 6);
  for (let i = 0; i < maxSeg; i++) { const v = i * 4; se.set([-1, 0, 1, 0, -1, 1, 1, 1], v * 2); idx.set([v, v + 1, v + 2, v + 2, v + 1, v + 3], i * 6); }
  const geo = new THREE.BufferGeometry();
  const A = (a, n) => new THREE.BufferAttribute(a, n).setUsage(THREE.DynamicDrawUsage);
  geo.setAttribute('position', A(pos, 3)); geo.setAttribute('aOther', A(oth, 3)); geo.setAttribute('aSE', new THREE.BufferAttribute(se, 2));
  geo.setAttribute('aT', A(tt, 1)); geo.setAttribute('aK', A(kk, 1)); geo.setIndex(new THREE.BufferAttribute(idx, 1));
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e5); geo.setDrawRange(0, 0);
  const mesh = new THREE.Mesh(geo, mat); mesh.frustumCulled = false;
  return {
    mesh, geo, mat, max: maxSeg,
    set(i, ax, ay, az, bx, by, bz, ta, tb, k = 1) {
      const v = i * 12;
      for (let c = 0; c < 4; c++) {
        const e = c >> 1, o = v + c * 3;
        pos[o] = e ? bx : ax; pos[o + 1] = e ? by : ay; pos[o + 2] = e ? bz : az;
        oth[o] = e ? ax : bx; oth[o + 1] = e ? ay : by; oth[o + 2] = e ? az : bz;
        tt[i * 4 + c] = e ? tb : ta; kk[i * 4 + c] = k;
      }
    },
    commit(n) { geo.setDrawRange(0, n * 6); for (const k of ['position', 'aOther', 'aT', 'aK']) geo.attributes[k].needsUpdate = true; },
  };
}

// ------------------------------------------------------------------ dust motes (drifting in a box around the view target)
export function motes(THREE, n, U) {
  const pos = new Float32Array(n * 3), sd = new Float32Array(n);
  let s = 3; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < n; i++) { pos[i * 3] = r(); pos[i * 3 + 1] = r(); pos[i * 3 + 2] = r(); sd[i] = r(); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('aS', new THREE.BufferAttribute(sd, 1));
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e5);
  const mat = new THREE.ShaderMaterial({
    uniforms: U, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      attribute float aS; uniform vec4 uMoteC; uniform float uT, uPx, uPR, uMoteA; uniform vec3 uSun, uCamP; varying float vA;
      void main(){
        vec3 box = vec3(uMoteC.w, uMoteC.w*.22, uMoteC.w);
        vec3 drift = vec3(.55, .04 + .05*sin(uT*.3 + aS*6.), .3)*uT + vec3(sin(uT*.21 + aS*9.), sin(uT*.17 + aS*5.)*.5, cos(uT*.19 + aS*7.))*.8;
        vec3 w = mod(position*box + drift - uMoteC.xyz + box*.5, box) - box*.5 + uMoteC.xyz;
        w.y += box.y*.5 - 1.;
        vec4 mv = modelViewMatrix*vec4(w, 1.); gl_Position = projectionMatrix*mv;
        vec3 v = normalize(w - uCamP);
        float ph = .35 + 2.2*pow(max(dot(v, uSun), 0.), 6.);
        vec3 e = abs((w - uMoteC.xyz) / (box*.5));
        float edge = (1. - smoothstep(.7, 1., max(e.x, e.z)))*(1. - smoothstep(.6, 1., e.y));
        vA = uMoteA*ph*edge*(.4 + .6*aS)*smoothstep(1., 4., -mv.z);
        gl_PointSize = clamp(.07*uPx / max(.1, -mv.z), 1., 5.)*uPR;
      }`,
    fragmentShader: /* glsl */ `
      varying float vA; uniform vec3 uSunC;
      void main(){ float d = length(gl_PointCoord - .5), a = vA*smoothstep(.5, 0., d); if (a < .003) discard; gl_FragColor = vec4(vec3(1., .78, .55)*a, a*.6); }`,
  });
  const pts = new THREE.Points(geo, mat); pts.frustumCulled = false;
  return pts;
}

// ------------------------------------------------------------------ dirt particles (GPU ballistic, CPU only writes spawns)
export function particles(THREE, n, U) {
  const p0 = new Float32Array(n * 3), v0 = new Float32Array(n * 3), tl = new Float32Array(n * 4);
  for (let i = 0; i < n; i++) tl[i * 4] = -100;
  const geo = new THREE.BufferGeometry();
  const D = (a, k) => new THREE.BufferAttribute(a, k).setUsage(THREE.DynamicDrawUsage);
  geo.setAttribute('position', D(p0, 3)); geo.setAttribute('aV', D(v0, 3)); geo.setAttribute('aTL', D(tl, 4));
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e5);
  const mat = new THREE.ShaderMaterial({
    uniforms: U, transparent: true, depthWrite: false,
    vertexShader: /* glsl */ `
      attribute vec3 aV; attribute vec4 aTL; uniform float uT, uPx, uPR; uniform vec3 uDot, uSunC, uAmb; varying vec4 vC;
      void main(){
        float t = uT - aTL.x;
        if (t < 0. || t > aTL.y) { gl_Position = vec4(2., 2., 2., 1.); gl_PointSize = 0.; return; }
        vec3 p = position + aV*t + vec3(0., -9.8*.5*t*t, 0.)*aTL.w;
        p.y = max(p.y, aTL.z);
        vec4 mv = modelViewMatrix*vec4(p, 1.); gl_Position = projectionMatrix*mv;
        float landed = step(p.y, aTL.z + .01), life = t / aTL.y;
        float dust = 1. - aTL.w;  // aTL.w = 0: a dust puff (no gravity, grows and fades)
        vC = vec4(uDot*(uAmb + uSunC*.8)*(1. + dust*.3), (1. - smoothstep(.6, 1., life))*(1. - landed*.6)*(.9 - dust*.78)*(dust > .5 ? smoothstep(0., .15, life) : 1.));
        gl_PointSize = clamp((.07 + dust*.3*life)*uPx / max(.1, -mv.z), 1., 14.)*uPR;
      }`,
    fragmentShader: /* glsl */ `
      varying vec4 vC;
      void main(){ float d = length(gl_PointCoord - .5), a = vC.a*smoothstep(.5, .15, d); if (a < .003) discard; gl_FragColor = vec4(vC.rgb, a); }`,
  });
  const pts = new THREE.Points(geo, mat); pts.frustumCulled = false;
  let head = 0, dirty = false;
  return {
    pts,
    // gravity 1 = a clod, 0 = a dust puff; ground = the y it lands on
    emit(t, x, y, z, vx, vy, vz, life, ground, gravity = 1) {
      const i = head; head = (head + 1) % n;
      p0[i * 3] = x; p0[i * 3 + 1] = y; p0[i * 3 + 2] = z; v0[i * 3] = vx; v0[i * 3 + 1] = vy; v0[i * 3 + 2] = vz;
      tl[i * 4] = t; tl[i * 4 + 1] = life; tl[i * 4 + 2] = ground; tl[i * 4 + 3] = gravity; dirty = true;
    },
    flush() { if (!dirty) return; dirty = false; for (const k of ['position', 'aV', 'aTL']) geo.attributes[k].needsUpdate = true; },
  };
}

// ------------------------------------------------------------------ sky haze (drawn first, behind the scene)
export function skyMaterial(THREE, U) {
  return new THREE.ShaderMaterial({
    uniforms: U, depthTest: false, depthWrite: false, transparent: true,
    vertexShader: /* glsl */ `varying vec2 vN; void main(){ vN = position.xy; gl_Position = vec4(position.xy, 1., 1.); }`,
    fragmentShader: /* glsl */ `
      uniform mat4 uInvP, uCamW; uniform vec3 uSun, uHaze, uSunC; uniform float uSkyA; varying vec2 vN;
      void main(){
        vec4 v = uInvP*vec4(vN, 1., 1.); vec3 d = normalize((uCamW*vec4(v.xyz / v.w, 0.)).xyz);
        float hz = exp(-abs(d.y - .02)*9.), below = exp(-max(-d.y, 0.)*5.);
        float sun = pow(max(dot(d, normalize(uSun)), 0.), 10.), core = pow(max(dot(d, normalize(uSun)), 0.), 220.);
        vec3 c = uHaze*(hz*.32 + below*.05) + uSunC*(sun*.22*hz + core*.5);
        c *= uSkyA;
        gl_FragColor = vec4(c, clamp(max(c.r, max(c.g, c.b))*1.2, 0., 1.));
      }`,
  });
}

// ------------------------------------------------------------------ post: scene RT -> bloom (1/4 res) -> grade + edges
export function createPost(THREE, renderer, { low = false } = {}) {
  const rt = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: low ? 0 : 4 });
  const bA = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType }), bB = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType });
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), tri = new THREE.BufferGeometry();
  tri.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3)); tri.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 2, 0, 0, 2], 2));
  const quad = new THREE.Mesh(tri); quad.frustumCulled = false;
  const mat = (uniforms, fs) => new THREE.ShaderMaterial({ uniforms, vertexShader: FS_VERT, fragmentShader: fs, depthTest: false, depthWrite: false });
  const mDown = mat({ tIn: { value: null }, uTexel: { value: new THREE.Vector2() }, uThr: { value: 0.55 } }, /* glsl */ `
    uniform sampler2D tIn; uniform vec2 uTexel; uniform float uThr; varying vec2 vUv;
    void main(){
      vec3 c = .25*(texture2D(tIn, vUv + uTexel*vec2(-1., -1.)).rgb + texture2D(tIn, vUv + uTexel*vec2(1., -1.)).rgb + texture2D(tIn, vUv + uTexel*vec2(-1., 1.)).rgb + texture2D(tIn, vUv + uTexel*vec2(1., 1.)).rgb);
      float l = max(c.r, max(c.g, c.b)); gl_FragColor = vec4(c*smoothstep(uThr*.5, uThr*1.6, l), 1.);
    }`);
  const mBlur = mat({ tIn: { value: null }, uDir: { value: new THREE.Vector2() } }, /* glsl */ `
    uniform sampler2D tIn; uniform vec2 uDir; varying vec2 vUv;
    void main(){
      vec3 c = texture2D(tIn, vUv).rgb*.227;
      c += (texture2D(tIn, vUv + uDir*1.385).rgb + texture2D(tIn, vUv - uDir*1.385).rgb)*.316;
      c += (texture2D(tIn, vUv + uDir*3.231).rgb + texture2D(tIn, vUv - uDir*3.231).rgb)*.070;
      gl_FragColor = vec4(c, 1.);
    }`);
  const P = { bloom: low ? 0.5 : 0.65, exposure: 1.12, vignette: 0.3, grain: 0.04, edge: new THREE.Vector4(0.07, 0.16, 0.16, 0) };
  const mComp = mat({ tScene: { value: rt.texture }, tBloom: { value: bA.texture }, uBloom: { value: P.bloom }, uExp: { value: 1 }, uVig: { value: 0.3 }, uGrain: { value: 0.04 }, uT: { value: 0 }, uEdge: { value: P.edge } }, /* glsl */ `
    uniform sampler2D tScene, tBloom; uniform float uBloom, uExp, uVig, uGrain, uT; uniform vec4 uEdge; varying vec2 vUv;
    ${CINE}
    void main(){
      vec4 s = texture2D(tScene, vUv); vec3 b = texture2D(tBloom, vUv).rgb*uBloom;
      vec3 c = cineGrade(cineOETF(cineTone((s.rgb + b)*uExp)));
      float a = clamp(s.a + dot(b, vec3(.3, .5, .2))*1.4, 0., 1.);
      vec2 q = vUv - .5; c *= mix(1., smoothstep(.95, .15, dot(q, q)*2.2), uVig);
      float g = cH12(gl_FragCoord.xy + fract(uT*7.31)*vec2(97., 57.)) - .5, l = dot(c, vec3(.299, .587, .114));
      c += g*uGrain*(.35 + 2.4*l*(1. - l))*a;
      float m = smoothstep(0., uEdge.x, vUv.x)*smoothstep(0., uEdge.x, 1. - vUv.x)*smoothstep(0., uEdge.z, vUv.y)*smoothstep(0., uEdge.y, 1. - vUv.y);
      c = max(c, 0.)*m; a *= m;
      gl_FragColor = vec4(c, max(a, max(c.r, max(c.g, c.b))));
    }`);
  let w = 1, h = 1, bloomOn = true;
  function setSize(W, H) {
    w = Math.max(1, W); h = Math.max(1, H); rt.setSize(w, h);
    const bw = Math.max(1, Math.round(w / 4)), bh = Math.max(1, Math.round(h / 4)); bA.setSize(bw, bh); bB.setSize(bw, bh);
    mDown.uniforms.uTexel.value.set(1 / w, 1 / h);
  }
  function pass(m, target) { quad.material = m; renderer.setRenderTarget(target); renderer.render(quad, cam); }
  return {
    rt, P,
    setSize,
    set bloomOn(v) { bloomOn = v; }, get bloomOn() { return bloomOn; },
    // render the scene in, then out to the canvas
    begin() { renderer.setRenderTarget(rt); renderer.setClearColor(0x000000, 0); renderer.clear(true, true, true); },
    end(t) {
      if (bloomOn) {
        mDown.uniforms.tIn.value = rt.texture; pass(mDown, bA);
        const bw = bA.width, bh = bA.height;
        mBlur.uniforms.tIn.value = bA.texture; mBlur.uniforms.uDir.value.set(1 / bw, 0); pass(mBlur, bB);
        mBlur.uniforms.tIn.value = bB.texture; mBlur.uniforms.uDir.value.set(0, 1 / bh); pass(mBlur, bA);
      }
      const u = mComp.uniforms; u.uBloom.value = bloomOn ? P.bloom : 0; u.uExp.value = P.exposure; u.uVig.value = P.vignette; u.uGrain.value = P.grain; u.uT.value = t;
      pass(mComp, null);
    },
    dispose() { rt.dispose(); bA.dispose(); bB.dispose(); tri.dispose(); mDown.dispose(); mBlur.dispose(); mComp.dispose(); },
  };
}
