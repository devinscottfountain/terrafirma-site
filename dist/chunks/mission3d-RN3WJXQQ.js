import{b as mt,d as pt}from"./chunk-TAKKMMN3.js";import{a as ut}from"./chunk-4CI7YULG.js";import{a as Ve}from"./chunk-4C5RVMER.js";import{a as lt,b as ct}from"./chunk-M5U4GD3X.js";import{d as rt,f as nt,g as Pe,h as st}from"./chunk-SKKE744E.js";import{a as it}from"./chunk-FCTCDFK5.js";var dt=`
uniform float uQ;
varying vec2 vQ;
void main(){ vQ = (uv - 0.5) * 2.0 * uQ; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,ft=`
uniform mat3 uRot; uniform vec3 uSun; uniform float uSunI, uExp, uGlow;
varying vec2 vQ;
const float PI = 3.14159265;
float hash13(vec3 p){ p = fract(p * 0.3183099 + .1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float vnoise(vec3 x){ vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash13(i), hash13(i + vec3(1,0,0)), f.x), mix(hash13(i + vec3(0,1,0)), hash13(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(hash13(i + vec3(0,0,1)), hash13(i + vec3(1,0,1)), f.x), mix(hash13(i + vec3(0,1,1)), hash13(i + vec3(1,1,1)), f.x), f.y), f.z); }
float fbm3(vec3 p){ float v = 0., a = .5; for(int i = 0; i < 3; i++){ v += a * vnoise(p); p *= 2.07; a *= .5; } return v; }
// object-space direction on the unit sphere -> three.js SphereGeometry uv
vec2 dirToUv(vec3 p){ return vec2(fract(atan(p.z, -p.x) / (2. * PI)), 0.5 + asin(clamp(p.y, -1., 1.)) / PI); }
void sphFrame(vec3 p, out vec3 e, out vec3 n){ vec3 c = cross(vec3(0,1,0), p); e = length(c) < 1e-4 ? vec3(0,0,1) : normalize(c); n = cross(p, e); }
vec3 perturb(vec3 p, vec3 nt, float k){ vec3 e, n; sphFrame(p, e, n); nt.xy *= k; return normalize(e * nt.x + n * nt.y + p * max(nt.z, 0.05)); }
// sunlight colour after the air column at sun cosine mu (Kasten-Young airmass), tau = zenith optical depth per channel
vec3 sunTrans(float mu, vec3 tau){ float el = degrees(asin(clamp(mu, -1., 1.))); el = max(el, 0.3);
  float am = 1. / (sin(radians(el)) + 0.50572 * pow(el + 6.07995, -1.6364)); return exp(-tau * am); }
vec3 aces(vec3 x){ return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0., 1.); }
vec3 oetf(vec3 c){ return mix(c * 12.92, 1.055 * pow(c, vec3(1. / 2.4)) - 0.055, step(0.0031308, c)); }
// world-facing sphere point for a disc coordinate (clamped just inside the limb), rotated into object space
vec3 dirAt(vec2 qq){ float l = length(qq); if (l > 0.9995) qq *= 0.9995 / l; return uRot * vec3(qq, sqrt(1. - dot(qq, qq))); }
// premultiplied, tone mapped output from linear surface radiance (already scaled by coverage) and linear atmosphere glow
vec4 pack(vec3 surf, float cov, vec3 glow){
  vec3 o = oetf(aces(surf * uExp)) + oetf(aces(glow * uExp));
  float a = clamp(max(cov, max(o.r, max(o.g, o.b))), 0., 1.);
  return vec4(min(o, vec3(a)), a);
}
`,vt=`
  vec2 q = vQ; float r = length(q);
  vec2 dqx = dFdx(q), dqy = dFdy(q);
  float fw = max(length(vec2(dFdx(r), dFdy(r))), 1e-4);
  float cov = clamp((1. - r) / fw + 0.5, 0., 1.);
  vec2 qn = r > 1. ? q / r : q;                    // outside the disc: the tangent point of the grazing ray
  float z = sqrt(max(1. - dot(qn, qn), 0.));
  vec3 p = uRot * vec3(qn, z), L = normalize(uSun);
  float mu = dot(p, L);
  vec2 uv = dirToUv(p);
  vec2 gx = dirToUv(dirAt(q + dqx)) - uv, gy = dirToUv(dirAt(q + dqy)) - uv;
  gx.x -= floor(gx.x + .5); gy.x -= floor(gy.x + .5);
  gx = clamp(gx, vec2(-0.006), vec2(0.006)); gy = clamp(gy, vec2(-0.006), vec2(0.006));
`,ht=`
uniform sampler2D tMap, tNorm, tClouds;
uniform float uCloudOff, uCloudH; uniform vec2 uCloudRot;
${ft}
void main(){
${vt}
  vec3 col = vec3(0.);
  if (cov > 0.) {
    vec3 alb = textureGrad(tMap, uv, gx, gy).rgb;
    float ocean = 1. - smoothstep(0.004, 0.02, max(alb.r, alb.g));
    vec3 seaAlb = max(alb, vec3(0.010, 0.036, 0.100)) + vec3(0., 0.01, 0.03) * smoothstep(0., 0.2, alb.b);
    vec3 base = mix(alb, seaAlb, ocean);
    vec3 N = p;
    #ifdef HAS_NORM
    N = perturb(p, textureGrad(tNorm, uv, gx, gy).rgb * 2. - 1., 0.8 * (1. - ocean));
    #endif
    float dens = 0., shadow = 1., cover = 0.; vec3 Nc = p;
    #ifdef HAS_CLOUDS
    vec2 cuv = vec2(uv.x + uCloudOff, uv.y);
    float d0 = textureGrad(tClouds, cuv, gx, gy).r;
    float dx = textureGrad(tClouds, cuv + vec2(1. / 1024., 0.), gx, gy).r, dy = textureGrad(tClouds, cuv + vec2(0., 1. / 512.), gx, gy).r;
    vec3 pc = vec3(p.x * uCloudRot.x - p.z * uCloudRot.y, p.y, p.x * uCloudRot.y + p.z * uCloudRot.x);   // noise rides with the deck, not the ground
    float nz = fbm3(pc * 26.) - 0.5;
    cover = d0;
    dens = smoothstep(0.06, 0.78, clamp(d0 + nz * 0.55 * smoothstep(0.03, 0.4, d0) * (1.1 - d0), 0., 1.));
    vec3 e, n; sphFrame(p, e, n);
    Nc = normalize(p - (e * (dx - d0) + n * (dy - d0)) * 3.);
    float mus = max(mu, 0.12);
    vec2 uq = dirToUv(normalize(p + L * (uCloudH / mus))); uq.x += uCloudOff;
    float sh = textureLod(tClouds, uq, 2.2).r;
    shadow = 1. - 0.6 * smoothstep(0.15, 0.85, sh) * smoothstep(0., 0.25, mu + 0.05);
    #endif
    vec3 sunCol = sunTrans(mu, vec3(0.034, 0.075, 0.175));
    float gate = smoothstep(-0.30, 0.10, mu);                                  // soft terminator (sun is frontal, so it sits off screen)
    float NL = clamp((dot(N, L) + 0.25) / 1.25, 0., 1.) * gate;                // wrapped diffuse: gentle limb darkening
    col = base * sunCol * NL * uSunI * shadow;
    col += base * vec3(0.10, 0.17, 0.34) * 0.55 * smoothstep(-0.12, 0.6, mu);                       // blue sky fill, day side
    col += vec3(0.95, 0.42, 0.22) * 0.04 * exp(-pow((mu + 0.015) / 0.07, 2.)) * (0.35 + 0.65 * (1. - ocean * 0.5)); // twilight band
    // Fresnel sky reflection toward the limb (no sun glint)
    float F = 0.02 + 0.98 * pow(1. - z, 5.);
    col += ocean * vec3(0.10, 0.20, 0.42) * F * 1.4 * smoothstep(-0.2, 0.5, mu);
    #ifdef HAS_CLOUDS
    vec3 cloudCol = vec3(0.93, 0.95, 0.98) * sunCol * max(dot(Nc, L), 0.) * smoothstep(-0.03, 0.1, mu) * uSunI * mix(1., 0.78, dens);
    cloudCol += vec3(0.10, 0.17, 0.34) * 0.5 * smoothstep(-0.12, 0.6, mu);
    cloudCol += vec3(0.95, 0.5, 0.3) * 0.04 * exp(-pow((mu + 0.01) / 0.08, 2.)) * dens;
    col = mix(col, cloudCol, dens * 0.96);
    #endif
    col += vec3(0.02, 0.03, 0.06) * 0.025 + base * vec3(0.03, 0.05, 0.10) * 0.05;                                                      // whisper of earthshine on the night side
    // limb: haze over the disc, thin and blue, brighter on the lit side
    col = mix(col, col * 0.7, smoothstep(0.55, 1., 1. - z) * smoothstep(-0.2, 0.3, mu) * 0.4);
  }
  // atmosphere: thin blue-white rim, e-folds in ~4 px outside the limb, a short haze inside it
  float H0 = 0.011;
  float lim = r > 1. ? exp(-(r - 1.) / H0) : exp(-z / 0.16);
  float lit = smoothstep(-0.50, 0.10, mu);
  vec3 rimC = mix(vec3(0.20, 0.46, 1.0), vec3(0.72, 0.88, 1.0), smoothstep(0.3, 1., lim));
  vec3 glow = rimC * lim * lit * 0.85 + vec3(1., 0.45, 0.2) * lim * exp(-pow(mu / 0.09, 2.)) * 0.16;
  glow *= uGlow * (r < 1. ? 0.55 : 1.);
  if (cov <= 0. && max(glow.r, max(glow.g, glow.b)) < 0.002) discard;
  gl_FragColor = pack(col * cov, cov, glow);
}`,xt=`
uniform sampler2D tMap, tNorm; uniform float uRelief, uBump;
${ft}
float lumA(vec2 uv, vec2 gx, vec2 gy){ return dot(textureGrad(tMap, uv, gx, gy).rgb, vec3(.35, .5, .15)); }
void main(){
${vt}
  vec3 col = vec3(0.);
  if (cov > 0.) {
    vec3 alb = textureGrad(tMap, uv, gx, gy).rgb;
    vec3 blur = textureGrad(tMap, uv, gx * 6., gy * 6.).rgb;
    float slant = 1. - z;
    alb = max(alb + (alb - blur) * 0.55 * (1. - smoothstep(0.5, 0.85, slant)), 0.);   // crater rims, chasma walls, dune fields
    vec2 fwu = max(abs(gx), abs(gy));
    vec2 st = clamp(fwu * 1.2, vec2(1. / 2048., 1. / 1024.), vec2(0.004));
    float hx = lumA(uv + vec2(st.x, 0.), gx, gy) - lumA(uv - vec2(st.x, 0.), gx, gy), hy = lumA(uv + vec2(0., st.y), gx, gy) - lumA(uv - vec2(0., st.y), gx, gy);
    vec3 nt = vec3(0., 0., 1.);
    #ifdef HAS_NORM
    nt = textureGrad(tNorm, uv, gx, gy).rgb * 2. - 1.;
    #endif
    nt.xy *= uRelief;
    nt.xy -= vec2(hx, hy) * uBump * (1.5 / 4096.) / st.x;      // gradient per texel, so relief holds at every zoom
    vec3 N = perturb(p, normalize(nt), 1.);
    // ice: the map's own caps (bright, unsaturated), edge broken up
    float lat = asin(clamp(p.y, -1., 1.)), mx = max(alb.r, max(alb.g, alb.b)), sat = (mx - min(alb.b, min(alb.r, alb.g))) / max(mx, 1e-3);
    float ice = smoothstep(0.62, 0.85, mx) * (1. - smoothstep(0.18, 0.42, sat));
    ice = max(ice, smoothstep(1.39, 1.45, abs(lat) + (fbm3(p * 22.) - 0.5) * 0.07)) * smoothstep(1.05, 1.25, abs(lat));
    vec3 rust = pow(alb, vec3(1.22)) * 1.32; float l = dot(rust, vec3(.3, .55, .15));
    rust = max(mix(vec3(l), rust, 1.0), 0.) * vec3(1.0, 0.93, 0.74);                  // butterscotch rust
    vec3 A = mix(rust, vec3(0.80, 0.78, 0.76) * (0.7 + 0.2 * l), ice * 0.85);
    vec3 sunCol = sunTrans(mu, vec3(0.05, 0.085, 0.15));
    float gate = smoothstep(-0.20, 0.15, mu);                                            // soft terminator (frontal sun keeps it off screen)
    float m0 = max(dot(N, L) + 0.25, 0.) / 1.25 * gate, m1 = max(z, 0.05);                // wrapped diffuse: gentle limb darkening
    float val = mix(m0, 2. * m0 / (m0 + m1), 0.12);
    col = A * sunCol * val * uSunI;
    col += A * vec3(0.95, 0.60, 0.36) * 0.03 * smoothstep(-0.05, 0.6, mu);               // dust fill, day side only
    col += vec3(0.95, 0.45, 0.22) * 0.016 * exp(-pow((mu - 0.01) / 0.07, 2.));          // thin warm twilight band
    col += A * vec3(0.5, 0.3, 0.25) * 0.004 * (1. - smoothstep(-0.2, 0.05, mu));         // whisper of night so the dark side keeps shape
    float hz = clamp(pow(slant, 5.) * 0.45 + pow(slant, 16.) * 0.5, 0., 0.7);           // thin dust column grows as 1/cos toward the edge
    vec3 haze = vec3(1.0, 0.70, 0.46) * 0.55 * uSunI * sunCol * smoothstep(-0.06, 0.45, mu);
    col = mix(col, haze, hz * smoothstep(-0.1, 0.2, mu));
  }
  // atmosphere rim: thin and dusty, lit side only, falls off in ~3 px
  float H0 = 0.0075;
  float lim = r > 1. ? exp(-(r - 1.) / H0) : exp(-z / 0.10);
  float lit = smoothstep(-0.40, 0.10, mu);
  vec3 glow = mix(vec3(1.0, 0.52, 0.26), vec3(1.0, 0.72, 0.46), smoothstep(0.4, 1., lim)) * lim * lit * 0.42;
  glow *= uGlow * (r < 1. ? 0.6 : 1.);
  if (cov <= 0. && max(glow.r, max(glow.g, glow.b)) < 0.002) discard;
  gl_FragColor = pack(col * cov, cov, glow);
}`,gt=`
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,wt=`
uniform float uT, uA;
varying vec2 vUv;
void main(){
  float v = 1. - vUv.y, x = (vUv.x - .5) * 2.;           // v: 0 at the nozzle, 1 at the tip
  float n = .5 * sin(uT * 37. + v * 9.) + .5 * sin(uT * 23. - v * 14. + 1.7);
  float w = max(mix(.64, .07, pow(v, .85)) * (1. + .10 * n * v), 1e-3);
  float d = abs(x) / w;
  float body = smoothstep(1., .12, d), fall = pow(1. - v, 1.7);
  float core = smoothstep(.6, 0., d) * smoothstep(.5, 0., v);
  float I = (body * fall * .8 + core * 1.1) * (.9 + .1 * n);
  vec3 c = mix(vec3(1., .40, .10), vec3(1., .86, .58), clamp(core * 1.3 + fall * .3 - v * .2, 0., 1.)) * I * uA;
  gl_FragColor = vec4(c, max(c.r, max(c.g, c.b)));
}`,yt="varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }",bt=`
varying vec3 vD; uniform vec3 uL;
void main(){
  vec3 d = normalize(vD); float k = max(dot(d, uL), 0.);
  vec3 c = vec3(0.02, 0.024, 0.04);
  c += vec3(1.0, 0.86, 0.68) * (pow(k, 28.) * 10. + pow(k, 4.) * 0.55);                      // key
  c += vec3(0.45, 0.60, 1.0) * pow(max(dot(d, normalize(vec3(0.7, 0.3, -0.5))), 0.), 5.) * 1.8; // cool rim from behind
  c += vec3(0.95, 0.52, 0.26) * smoothstep(0.1, -0.9, d.y) * 0.45;                           // warm bounce from below
  c += vec3(0.62, 0.68, 0.8) * smoothstep(-0.2, 1., d.y) * 0.5;                               // top
  gl_FragColor = vec4(c, 1.);
}`;var De={boom:.12,stick:-.2,bucket:-1.9},Be=.72;function Mt({THREE:e,envMap:S=null,high:X=!0}){let G=new e.Group,{ex:w,materials:W,Kit:Q,T:Z,shapeOf:ke,extrude:C}=pt({THREE:e,group:G,envMap:S,grime:{dirt:.22,rust:.35},transparent:!0});W.metal.envMapIntensity=1.6,W.paint.envMapIntensity=.6,W.glass.envMapIntensity=1.4,w.boom.rotation.z=De.boom,w.stick.rotation.z=De.stick,w.bucket.rotation.z=De.bucket;let u=X?20:12,x=Q(1.1,.15),Fe=14276304,f=2368546,L=3880497,y=.5,b=1.98,s=-4.7,J=-2.55,le=-1.95,ce=r=>new e.LatheGeometry(r.map(([i,p])=>new e.Vector2(i,p)),u).rotateZ(-Math.PI/2),g=[[.001,s-.2],[.24,s-.2],[.36,s-.08],[y,s+.04],[y,J],[y*.93,J+.18],[y*.78,J+.34],[y*.55,J+.47],[y*.28,le-.04],[.001,le]],q=[[.16,s-.2],[.22,s-.38],[.29,s-.64],[.38,s-.94],[.4,s-.92],[.31,s-.62],[.24,s-.36],[.2,s-.18]],T=[];for(let r of[-1,1]){let i=r*Be,p=Z(0,b,i);x.add("metal",Fe,ce(g),p,{dirt:.08}),x.add("metal",L,ce(q),p,{dirt:.1,rust:.25}),x.add("glow",16757596,new e.CircleGeometry(.17,10),Z(s-.3,b,i,0,-Math.PI/2,0));for(let A of[-2.75,-3.3])x.rod("rough",f,[A-.07,b,i],[A+.07,b,i],y+.025,u,{dirt:.3}),x.B("paint",f,A-.12,1.36,i-.24,A+.12,b-y*.7,i+.24,{dirt:.4});x.rod("rough",f,[s+.35,b,i],[s+.42,b,i],y+.012,u,{dirt:.2});let l=C(ke([[0,0],[.62,0],[.42,.34],[.12,.34]]),.04,.008);x.add("paint",f,l.clone(),Z(s+.02,b+y-.02,i),{dirt:.2}),x.add("paint",f,l,Z(s+.02,b,i+r*(y-.02),r*Math.PI/2,0,0),{dirt:.2}),T.push(new e.Vector3(s-.93,b+1.1,i))}x.bar("rough",f,[-3.02,b-.12,-Be],[-3.02,b-.12,Be],.18,{dirt:.3}),x.build(w.up),G.updateMatrixWorld(!0);let ve=new e.Matrix4().makeTranslation(...w.roof.at).premultiply(w.up.matrixWorld),ue=new Map;G.traverse(r=>{if(r.isMesh){let i=r.geometry.clone().applyMatrix4(r.matrixWorld);(ue.get(r.material)||ue.set(r.material,[]).get(r.material)).push(i),r.geometry.dispose()}});let k=new e.Group,he=new Map,xe=0;for(let[r,i]of ue){let p=Ve(i);i.forEach(A=>A.dispose()),xe+=p.attributes.position.count/3;let l=new e.Mesh(p,r);l.frustumCulled=!1,l.renderOrder=2,k.add(l),he.set(r,l)}let j=new e.Box3().setFromObject(k),O=j.getCenter(new e.Vector3);k.traverse(r=>{r.isMesh&&(r.geometry.translate(-O.x,-O.y,-O.z),r.geometry.computeBoundingSphere())});for(let r of T)r.sub(O);ve.premultiply(new e.Matrix4().makeTranslation(-O.x,-O.y,-O.z));let ge=Object.values(W),me=!1,H=null;function N(){return H||(H=lt().then(r=>{if(me)return 0;let i=mt(e,ct(r,.04),{dirt:.06}),p=0;for(let l in i){let A=he.get(W[l]),U=i[l].applyMatrix4(ve);if(A){let pe=A.geometry;A.geometry=Ve([pe,U]),pe.dispose(),p+=U.attributes.position.count/3}U.dispose()}return p}))}return{model:k,mats:ge,nozzles:T,tris:xe,length:j.max.x-j.min.x,height:j.max.y-j.min.y,addShroud:N,dispose(){me=!0,k.traverse(r=>{r.isMesh&&r.geometry.dispose()});for(let r of ge)r.dispose()}}}var At=.12,ze={color:{high:"earth-2048.webp",low:"earth-1024.webp"},clouds:"earth-clouds-1024.webp",normal:"earth-n-1024.webp"},We={color:{high:"mars-2048.webp",low:"mars-1024.webp"},normal:"mars-n-1024.webp"},kt={earth:.345,mars:.346},Dt={period:360,tilt:.22,lean:.14,front:kt.earth,sun:[.42,.16,.89]},Bt={period:450,tilt:-.3,lean:.14,front:kt.mars,sun:[-.4,.18,.9]},St=[-.55,.28,.79],ie=.04,qe=.96,Ct=.15,Wt=.85,B=192,Ft=e=>Math.min(1,Math.max(0,e)),zt=(e,S,X)=>{let G=Ft((X-e)/(S-e));return G*G*(3-2*G)},qt=()=>new Promise(e=>typeof requestAnimationFrame=="function"?requestAnimationFrame(()=>e()):setTimeout(e,0));function Et({THREE:e,section:S,quality:X="high",base:G}={}){let w=X!=="low",W=new URL(String(G||new URL("mission/assets/",it).href).replace(/\/?$/,"/"),location.href).href,Q=S.querySelector("[data-mission-canvas]")||S,Z=S.querySelector("[data-mission-earth]"),ke=S.querySelector("[data-mission-mars]"),C=S.querySelector("path[data-mission-path]"),u=new e.WebGLRenderer({alpha:!0,premultipliedAlpha:!0,antialias:w&&rt!==0,powerPreference:"high-performance",stencil:!1});u.setClearColor(0,0),u.toneMapping=e.ACESFilmicToneMapping,u.toneMappingExposure=1;let x=u.domElement;Object.assign(x.style,{position:"absolute",left:"0",top:"0",width:"100%",height:"100%",display:"block",pointerEvents:"none"}),Q.appendChild(x);let Fe=Math.min(w?1.5:1,nt),f=new e.OrthographicCamera(0,1,1,0,-1e3,1e3);f.position.z=500;let L=new e.Scene,y=new e.PlaneGeometry(1,1),b={transparent:!0,depthTest:!1,depthWrite:!1,blending:e.CustomBlending,blendEquation:e.AddEquation,blendSrc:e.OneFactor,blendDst:e.OneMinusSrcAlphaFactor},s=(t,a,n)=>{let c=new e.DataTexture(new Uint8Array([t,a,n,255]),1,1);return c.needsUpdate=!0,c},J=new e.Vector3(...St).normalize(),le={...w?{HAS_NORM:""}:{}},ce=t=>({uQ:{value:1+2*At},uRot:{value:new e.Matrix3},uSun:{value:new e.Vector3},uSunI:{value:1},uExp:{value:1},uGlow:{value:1},...t}),g=ce({tMap:{value:s(10,30,70)},tNorm:{value:s(128,128,255)},tClouds:{value:s(0,0,0)},uCloudOff:{value:0},uCloudH:{value:.0085},uCloudRot:{value:new e.Vector2(1,0)}});g.uSunI.value=3.3,g.uExp.value=.62;let q=ce({tMap:{value:s(150,70,40)},tNorm:{value:s(128,128,255)},uRelief:{value:1.25},uBump:{value:11}});q.uSunI.value=2.2,q.uExp.value=.62;let T=(t,a,n,c)=>{let d=new e.Mesh(y,new e.ShaderMaterial({vertexShader:dt,fragmentShader:t,uniforms:a,defines:n,...b}));return d.frustumCulled=!1,d.renderOrder=c,L.add(d),d},ve=T(ht,g,{...le,...w?{HAS_CLOUDS:""}:{}},1),ue=T(xt,q,le,1),k=[{mesh:ve,u:g,cfg:Dt,cx:0,cy:0,r:0,q:new e.Quaternion,qt:new e.Quaternion},{mesh:ue,u:q,cfg:Bt,cx:0,cy:0,r:0,q:new e.Quaternion,qt:new e.Quaternion}],he=new e.Vector3(1,0,0),xe=new e.Vector3(0,1,0),j=new e.Vector3(0,0,1),O=new e.Quaternion,ge=new e.Quaternion,me=new e.Matrix4;for(let t of k)t.qt.setFromAxisAngle(j,t.cfg.tilt).multiply(O.setFromAxisAngle(he,t.cfg.lean));let H=Gt();L.environment=H.texture;let N=Mt({THREE:e,envMap:H.texture,high:w}),r=N.model,i=N.mats,p=new e.Group;p.add(r),p.rotation.set(.4,.25,0);let l=new e.Group;l.add(p),l.position.z=50,l.visible=!1,L.add(l);let A=new e.DirectionalLight(16770760,2.4);A.position.copy(J).multiplyScalar(100),L.add(A);let U={uT:{value:0},uA:{value:0}},pe=new e.PlaneGeometry(1,1).translate(0,-.5,0),Qe=new e.ShaderMaterial({vertexShader:gt,fragmentShader:wt,uniforms:U,transparent:!0,depthTest:!1,depthWrite:!1,blending:e.CustomBlending,blendEquation:e.AddEquation,blendSrc:e.OneFactor,blendDst:e.OneFactor,blendSrcAlpha:e.OneFactor,blendDstAlpha:e.OneFactor}),E=N.nozzles.map(()=>{let t=new e.Mesh(pe,Qe);return t.frustumCulled=!1,t.renderOrder=3,t.rotation.z=-Math.PI/2,l.add(t),t}),de=new e.Vector3,je=0;function Gt(){let t=new e.Scene,a=new e.SphereGeometry(10,32,16),n=new e.ShaderMaterial({vertexShader:yt,fragmentShader:bt,uniforms:{uL:{value:new e.Vector3(...St).normalize()}},side:e.BackSide,depthWrite:!1});t.add(new e.Mesh(a,n));let c=new e.PMREMGenerator(u),d=c.fromScene(t,.02,.1,100);return c.dispose(),a.dispose(),n.dispose(),d}let Y=1,I=1,Ye=0,Ke=1,Ge=100,P=new Float32Array(B+1),V=new Float32Array(B+1),K=!1,Re=!1,$e=0,Xe=0,Ze=0,Lt=new Float64Array(7),Le=0,Oe=-1,v={quality:X,programs:0,calls:0,triangles:0,frames:0,dpr:1,w:0,h:0,p:0,visible:!1,running:!1,earth:{cx:0,cy:0,r:0},mars:{cx:0,cy:0,r:0},rocket:{x:0,y:0,angle:0,t:0,target:0,alpha:0,len:0},pathOK:!1};function we(){let t=Q.getBoundingClientRect();Y=Math.max(1,Q.clientWidth||t.width),I=Math.max(1,Q.clientHeight||t.height),Ye=t.top+window.scrollY,Ke=I;let a=Math.min(window.devicePixelRatio||1,Fe);(a!==$e||Y!==Xe||I!==Ze)&&(u.setPixelRatio(a),u.setSize(Y,I,!1),$e=a,Xe=Y,Ze=I),f.left=0,f.right=Y,f.top=I,f.bottom=0,f.updateProjectionMatrix(),v.dpr=a,v.w=Y,v.h=I;let n=(o,M,m)=>{if(!M){o.mesh.visible=!1;return}let _=M.getBoundingClientRect();o.r=_.width/2,o.cx=_.left-t.left+o.r,o.cy=_.top-t.top+_.height/2,o.mesh.visible=o.r>0,o.mesh.position.set(o.cx,I-o.cy,0),o.mesh.scale.setScalar(2*o.r*(1+2*At)),m.cx=o.cx,m.cy=o.cy,m.r=o.r};if(n(k[0],Z,v.earth),n(k[1],ke,v.mars),K=!1,C){let o=C.getScreenCTM(),M=C.getTotalLength(),m=Lt;if(o&&M>0&&Re&&m[0]===o.a&&m[1]===o.b&&m[2]===o.c&&m[3]===o.d&&m[4]===o.e-t.left&&m[5]===o.f-t.top&&m[6]===M)K=!0;else if(o&&M>0){m[0]=o.a,m[1]=o.b,m[2]=o.c,m[3]=o.d,m[4]=o.e-t.left,m[5]=o.f-t.top,m[6]=M,Re=!0;let _=Math.hypot(o.a,o.b)||1;Le=M,Oe=-1,C.style.vectorEffect="none",C.style.strokeWidth=String(1/_),C.style.strokeDasharray=M+" "+M;for(let $=0;$<=B;$++){let se=C.getPointAtLength(M*$/B);P[$]=o.a*se.x+o.c*se.y+o.e-t.left,V[$]=o.b*se.x+o.d*se.y+o.f-t.top}K=!0}}v.pathOK=K,Ge=Math.min(110,Math.max(48,Y*.068));let c=Ge/N.length;p.scale.setScalar(c),p.updateMatrix();let d=de.set(1,0,0).transformDirection(p.matrix),re=-Math.PI/2+Math.atan2(d.y,d.x),h=0;for(let o=0;o<E.length;o++)de.copy(N.nozzles[o]).applyMatrix4(p.matrix),E[o].position.set(de.x+.15*c,de.y,10+o),E[o].scale.set(c*2.8,c*9,1),E[o].rotation.z=re,h=Math.max(h,-de.x);let ne=0;for(let o=0;o<B;o++)ne+=Math.hypot(P[o+1]-P[o],V[o+1]-V[o]);je=K&&ne>0?h/ne:0,v.rocket.len=Ge}let Ot=()=>window.lenis&&typeof window.lenis.scroll=="number"?window.lenis.scroll:window.scrollY,ee=v.rocket,R=0,ye=0,Ne=!0,D=0,be=0,Qt=new e.Vector3;function Nt(t){let a=window.innerHeight,n=Ft((Ot()+a-Ye)/(a+Ke));v.p=n,ye=ie+(n-Ct)/(Wt-Ct)*(qe-ie),Ne?(R=ye,Ne=!1):R+=(ye-R)*(1-Math.exp(-t*6));let c=Math.min(qe,Math.max(ie,R)),d=zt(ie-.1,ie,R)*(1-zt(qe,qe+.1,R));if(ee.t=c,ee.target=ye,ee.alpha=d,K&&Le){let F=R>ie-.1?Math.max(0,c-je):0;Math.abs(F-Oe)>1e-4&&(C.style.strokeDashoffset=String(Le*(1-F)),Oe=F)}if(l.visible=d>.004&&K,!l.visible)return;let re=c*B,h=Math.min(B-1,Math.floor(re)),ne=re-h,o=P[h]+(P[h+1]-P[h])*ne,M=V[h]+(V[h+1]-V[h])*ne,m=Math.max(0,h-2),_=Math.min(B,h+3),$=P[_]-P[m],se=-(V[_]-V[m]),at=Math.atan2(se,$);ee.x=o,ee.y=M,ee.angle=at,l.position.set(o,I-M,50),l.rotation.z=at;for(let F of i)F.opacity=d;U.uA.value=d*(.92+.08*Math.sin(D*41)),U.uT.value=D;let Vt=p.scale.x*9;for(let F=0;F<E.length;F++)E[F].scale.y=Vt*(1+.07*Math.sin(D*29+F*1.7)*Math.sin(D*11.3+F))}function Je(){for(let a of k){let n=(.25-a.cfg.front)*Math.PI*2+D*Math.PI*2/a.cfg.period;a.q.copy(a.qt).multiply(ge.setFromAxisAngle(xe,n)),me.makeRotationFromQuaternion(a.q);let c=a.u.uRot.value.setFromMatrix4(me).transpose();a.u.uSun.value.set(...a.cfg.sun).normalize().applyMatrix3(c)}g.uCloudOff.value=-D*.0025;let t=-g.uCloudOff.value*Math.PI*2;g.uCloudRot.value.set(Math.cos(t),Math.sin(t))}let Me=!1,Ie=!1,te=!1,z=!1,oe=0,ae=null,Te=Pe?st(Pe):null;function _e(t){D+=t,Je(),Nt(t),u.render(L,f);let a=u.info;v.programs=a.programs?a.programs.length:0,v.calls=a.render.calls,v.triangles=a.render.triangles,v.frames++}function He(){if(z||!te)return;let t=performance.now();if(Te&&!Te(t))return;let a=be?Math.min(.1,(t-be)/1e3):1/60;be=t,_e(a)}function Ee(){oe=requestAnimationFrame(Ee),He()}function fe(){let t=Me&&Ie&&te&&!z;if(v.running=t,t){if(ae||oe)return;be=0,window.gsap?.ticker?(ae=He,window.gsap.ticker.add(ae)):oe=requestAnimationFrame(Ee)}else ae&&(window.gsap.ticker.remove(ae),ae=null),oe&&(cancelAnimationFrame(oe),oe=0)}let et=new IntersectionObserver(t=>{Ie=t[t.length-1].isIntersecting,v.visible=Ie,fe()},{rootMargin:"120px 0px"});et.observe(S);let Ae=new ResizeObserver(()=>{z||we()});Ae.observe(S),Ae.observe(Q),Ae.observe(document.body);let Se=()=>{z||we()};addEventListener("load",Se),document.fonts?.ready.then(Se);for(let t of S.querySelectorAll("img"))t.complete||t.addEventListener("load",Se,{once:!0});let It=Math.min(8,u.capabilities.getMaxAnisotropy()),_t=(t,a)=>ut(e,new URL(t,W).href,{flipY:!0,colorSpace:a?e.SRGBColorSpace:e.NoColorSpace}).then(n=>(n.anisotropy=It,n.wrapS=e.RepeatWrapping,n.needsUpdate=!0,n),()=>{throw new Error("mission texture failed: "+t)}),Ce=w?"high":"low",Ue=w?[[g.tMap,ze.color[Ce],!0],[q.tMap,We.color[Ce],!0],[g.tNorm,ze.normal,!1],[q.tNorm,We.normal,!1],[g.tClouds,ze.clouds,!1]]:[[g.tMap,ze.color[Ce],!0],[q.tMap,We.color[Ce],!0]],tt=[],ot=(async()=>{we();let t=await Promise.all(Ue.map(([,a,n])=>_t(a,n)));if(z)return t.forEach(a=>a.dispose()),!1;for(let a=0;a<Ue.length;a++)u.initTexture(t[a]),Ue[a][0].value=t[a],tt.push(t[a]),await qt();if(z)return!1;Je(),l.visible=!0;for(let a of i)a.opacity=1;return U.uA.value=1,await u.compileAsync(L,f),z||(_e(0),await qt(),z)?!1:(te=!0,fe(),N.addShroud().catch(a=>console.warn("TerraFirma mission: no shroud.",a)),!0)})();ot.catch(()=>{});function Ut({glow:t=!0,noShip:a=!1}={}){if(!te)return null;let n=u.getContext(),c=n.drawingBufferWidth,d=n.drawingBufferHeight;g.uGlow.value=q.uGlow.value=t?1:0;let re=l.visible;a&&(l.visible=!1),u.render(L,f),l.visible=re;let h=new Uint8Array(c*d*4);return n.readPixels(0,0,c,d,n.RGBA,n.UNSIGNED_BYTE,h),g.uGlow.value=q.uGlow.value=1,{w:c,h:d,data:h}}function Pt(){if(!z){z=!0,te=!1,Me=!1,fe(),et.disconnect(),Ae.disconnect(),removeEventListener("load",Se),y.dispose(),pe.dispose();for(let t of k)t.mesh.material.dispose();Qe.dispose(),N.dispose();for(let t of tt)t.dispose();if(H.dispose(),u.dispose(),u.forceContextLoss(),x.remove(),C)for(let t of["vectorEffect","strokeWidth","strokeDasharray","strokeDashoffset"])C.style[t]=""}}return{ready:ot,canvas:x,renderer:u,stats:v,capture:Ut,dispose:Pt,start(){Me=!0,fe()},stop(){Me=!1,fe()},resize(){z||we()},renderAt(t=0){te&&!z&&(D=+t||0,Ne=!0,_e(0))}}}export{Dt as EARTH,kt as INITIAL_ROTATION,Bt as MARS,Et as createMission};
