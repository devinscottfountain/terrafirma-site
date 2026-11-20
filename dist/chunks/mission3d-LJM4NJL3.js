import{b as tt,d as ot}from"./chunk-TAKKMMN3.js";import{a as Ie}from"./chunk-4C5RVMER.js";import{a as Ee,b as et}from"./chunk-M5U4GD3X.js";import{a as He}from"./chunk-FCTCDFK5.js";var at=`
uniform float uQ;
varying vec2 vQ;
void main(){ vQ = (uv - 0.5) * 2.0 * uQ; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,nt=`
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
`,rt=`
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
`,st=`
uniform sampler2D tMap, tNorm, tClouds;
uniform float uCloudOff, uCloudH; uniform vec2 uCloudRot;
${nt}
void main(){
${rt}
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
}`,it=`
uniform sampler2D tMap, tNorm; uniform float uRelief, uBump;
${nt}
float lumA(vec2 uv, vec2 gx, vec2 gy){ return dot(textureGrad(tMap, uv, gx, gy).rgb, vec3(.35, .5, .15)); }
void main(){
${rt}
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
}`,lt=`
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,ct=`
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
}`,ut="varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }",mt=`
varying vec3 vD; uniform vec3 uL;
void main(){
  vec3 d = normalize(vD); float k = max(dot(d, uL), 0.);
  vec3 c = vec3(0.02, 0.024, 0.04);
  c += vec3(1.0, 0.86, 0.68) * (pow(k, 28.) * 10. + pow(k, 4.) * 0.55);                      // key
  c += vec3(0.45, 0.60, 1.0) * pow(max(dot(d, normalize(vec3(0.7, 0.3, -0.5))), 0.), 5.) * 1.8; // cool rim from behind
  c += vec3(0.95, 0.52, 0.26) * smoothstep(0.1, -0.9, d.y) * 0.45;                           // warm bounce from below
  c += vec3(0.62, 0.68, 0.8) * smoothstep(-0.2, 1., d.y) * 0.5;                               // top
  gl_FragColor = vec4(c, 1.);
}`;var Ue={boom:.12,stick:-.2,bucket:-1.9},_e=.72;function dt({THREE:e,envMap:A=null,high:R=!0}){let L=new e.Group,{ex:g,materials:Q,Kit:W,T:X,shapeOf:qe,extrude:S}=ot({THREE:e,group:L,envMap:A,grime:{dirt:.22,rust:.35},transparent:!0});Q.metal.envMapIntensity=1.6,Q.paint.envMapIntensity=.6,Q.glass.envMapIntensity=1.4,g.boom.rotation.z=Ue.boom,g.stick.rotation.z=Ue.stick,g.bucket.rotation.z=Ue.bucket;let m=R?20:12,h=W(1.1,.15),ke=14276304,f=2368546,O=3880497,w=.5,y=1.98,s=-4.7,Z=-2.55,re=-1.95,se=n=>new e.LatheGeometry(n.map(([i,d])=>new e.Vector2(i,d)),m).rotateZ(-Math.PI/2),x=[[.001,s-.2],[.24,s-.2],[.36,s-.08],[w,s+.04],[w,Z],[w*.93,Z+.18],[w*.78,Z+.34],[w*.55,Z+.47],[w*.28,re-.04],[.001,re]],C=[[.16,s-.2],[.22,s-.38],[.29,s-.64],[.38,s-.94],[.4,s-.92],[.31,s-.62],[.24,s-.36],[.2,s-.18]],J=[];for(let n of[-1,1]){let i=n*_e,d=X(0,y,i);h.add("metal",ke,se(x),d,{dirt:.08}),h.add("metal",O,se(C),d,{dirt:.1,rust:.25}),h.add("glow",16757596,new e.CircleGeometry(.17,10),X(s-.3,y,i,0,-Math.PI/2,0));for(let b of[-2.75,-3.3])h.rod("rough",f,[b-.07,y,i],[b+.07,y,i],w+.025,m,{dirt:.3}),h.B("paint",f,b-.12,1.36,i-.24,b+.12,y-w*.7,i+.24,{dirt:.4});h.rod("rough",f,[s+.35,y,i],[s+.42,y,i],w+.012,m,{dirt:.2});let l=S(qe([[0,0],[.62,0],[.42,.34],[.12,.34]]),.04,.008);h.add("paint",f,l.clone(),X(s+.02,y+w-.02,i),{dirt:.2}),h.add("paint",f,l,X(s+.02,y,i+n*(w-.02),n*Math.PI/2,0,0),{dirt:.2}),J.push(new e.Vector3(s-.93,y+1.1,i))}h.bar("rough",f,[-3.02,y-.12,-_e],[-3.02,y-.12,_e],.18,{dirt:.3}),h.build(g.up),L.updateMatrixWorld(!0);let fe=new e.Matrix4().makeTranslation(...g.roof.at).premultiply(g.up.matrixWorld),ie=new Map;L.traverse(n=>{if(n.isMesh){let i=n.geometry.clone().applyMatrix4(n.matrixWorld);(ie.get(n.material)||ie.set(n.material,[]).get(n.material)).push(i),n.geometry.dispose()}});let z=new e.Group,ve=new Map,he=0;for(let[n,i]of ie){let d=Ie(i);i.forEach(b=>b.dispose()),he+=d.attributes.position.count/3;let l=new e.Mesh(d,n);l.frustumCulled=!1,l.renderOrder=2,z.add(l),ve.set(n,l)}let j=new e.Box3().setFromObject(z),N=j.getCenter(new e.Vector3);z.traverse(n=>{n.isMesh&&(n.geometry.translate(-N.x,-N.y,-N.z),n.geometry.computeBoundingSphere())});for(let n of J)n.sub(N);fe.premultiply(new e.Matrix4().makeTranslation(-N.x,-N.y,-N.z));let xe=Object.values(Q),le=!1,T=null;function I(){return T||(T=Ee().then(n=>{if(le)return 0;let i=tt(e,et(n,.04),{dirt:.06}),d=0;for(let l in i){let b=ve.get(Q[l]),U=i[l].applyMatrix4(fe);if(b){let ce=b.geometry;b.geometry=Ie([ce,U]),ce.dispose(),d+=U.attributes.position.count/3}U.dispose()}return d}))}return{model:z,mats:xe,nozzles:J,tris:he,length:j.max.x-j.min.x,height:j.max.y-j.min.y,addShroud:I,dispose(){le=!0,z.traverse(n=>{n.isMesh&&n.geometry.dispose()});for(let n of xe)n.dispose()}}}var pt=.12,Ce={color:{high:"earth-2048.webp",low:"earth-1024.webp"},clouds:"earth-clouds-1024.webp",normal:"earth-n-1024.webp"},Pe={color:{high:"mars-2048.webp",low:"mars-1024.webp"},normal:"mars-n-1024.webp"},gt={earth:.345,mars:.346},Ft={period:360,tilt:.22,lean:.14,front:gt.earth,sun:[.42,.16,.89]},Gt={period:450,tilt:-.3,lean:.14,front:gt.mars,sun:[-.4,.18,.9]},ft=[-.55,.28,.79],ne=.04,ze=.96,vt=.15,Lt=.85,B=192,wt=e=>Math.min(1,Math.max(0,e)),ht=(e,A,R)=>{let L=wt((R-e)/(A-e));return L*L*(3-2*L)},xt=()=>new Promise(e=>typeof requestAnimationFrame=="function"?requestAnimationFrame(()=>e()):setTimeout(e,0));function Qt({THREE:e,section:A,quality:R="high",base:L}={}){let g=R!=="low",Q=new URL(String(L||new URL("mission/assets/",He).href).replace(/\/?$/,"/"),location.href).href,W=A.querySelector("[data-mission-canvas]")||A,X=A.querySelector("[data-mission-earth]"),qe=A.querySelector("[data-mission-mars]"),S=A.querySelector("path[data-mission-path]"),m=new e.WebGLRenderer({alpha:!0,premultipliedAlpha:!0,antialias:g,powerPreference:"high-performance",stencil:!1});m.setClearColor(0,0),m.toneMapping=e.ACESFilmicToneMapping,m.toneMappingExposure=1;let h=m.domElement;Object.assign(h.style,{position:"absolute",left:"0",top:"0",width:"100%",height:"100%",display:"block",pointerEvents:"none"}),W.appendChild(h);let ke=g?1.5:1,f=new e.OrthographicCamera(0,1,1,0,-1e3,1e3);f.position.z=500;let O=new e.Scene,w=new e.PlaneGeometry(1,1),y={transparent:!0,depthTest:!1,depthWrite:!1,blending:e.CustomBlending,blendEquation:e.AddEquation,blendSrc:e.OneFactor,blendDst:e.OneMinusSrcAlphaFactor},s=(t,o,c)=>{let u=new e.DataTexture(new Uint8Array([t,o,c,255]),1,1);return u.needsUpdate=!0,u},Z=new e.Vector3(...ft).normalize(),re={...g?{HAS_NORM:""}:{}},se=t=>({uQ:{value:1+2*pt},uRot:{value:new e.Matrix3},uSun:{value:new e.Vector3},uSunI:{value:1},uExp:{value:1},uGlow:{value:1},...t}),x=se({tMap:{value:s(10,30,70)},tNorm:{value:s(128,128,255)},tClouds:{value:s(0,0,0)},uCloudOff:{value:0},uCloudH:{value:.0085},uCloudRot:{value:new e.Vector2(1,0)}});x.uSunI.value=3.3,x.uExp.value=.62;let C=se({tMap:{value:s(150,70,40)},tNorm:{value:s(128,128,255)},uRelief:{value:1.25},uBump:{value:11}});C.uSunI.value=2.2,C.uExp.value=.62;let J=(t,o,c,u)=>{let r=new e.Mesh(w,new e.ShaderMaterial({vertexShader:at,fragmentShader:t,uniforms:o,defines:c,...y}));return r.frustumCulled=!1,r.renderOrder=u,O.add(r),r},fe=J(st,x,{...re,...g?{HAS_CLOUDS:""}:{}},1),ie=J(it,C,re,1),z=[{mesh:fe,u:x,cfg:Ft,cx:0,cy:0,r:0,q:new e.Quaternion,qt:new e.Quaternion},{mesh:ie,u:C,cfg:Gt,cx:0,cy:0,r:0,q:new e.Quaternion,qt:new e.Quaternion}],ve=new e.Vector3(1,0,0),he=new e.Vector3(0,1,0),j=new e.Vector3(0,0,1),N=new e.Quaternion,xe=new e.Quaternion,le=new e.Matrix4;for(let t of z)t.qt.setFromAxisAngle(j,t.cfg.tilt).multiply(N.setFromAxisAngle(ve,t.cfg.lean));let T=yt();O.environment=T.texture;let I=dt({THREE:e,envMap:T.texture,high:g}),n=I.model,i=I.mats,d=new e.Group;d.add(n),d.rotation.set(.4,.25,0);let l=new e.Group;l.add(d),l.position.z=50,l.visible=!1,O.add(l);let b=new e.DirectionalLight(16770760,2.4);b.position.copy(Z).multiplyScalar(100),O.add(b);let U={uT:{value:0},uA:{value:0}},ce=new e.PlaneGeometry(1,1).translate(0,-.5,0),Ve=new e.ShaderMaterial({vertexShader:lt,fragmentShader:ct,uniforms:U,transparent:!0,depthTest:!1,depthWrite:!1,blending:e.CustomBlending,blendEquation:e.AddEquation,blendSrc:e.OneFactor,blendDst:e.OneFactor,blendSrcAlpha:e.OneFactor,blendDstAlpha:e.OneFactor}),H=I.nozzles.map(()=>{let t=new e.Mesh(ce,Ve);return t.frustumCulled=!1,t.renderOrder=3,t.rotation.z=-Math.PI/2,l.add(t),t}),ue=new e.Vector3,De=0;function yt(){let t=new e.Scene,o=new e.SphereGeometry(10,32,16),c=new e.ShaderMaterial({vertexShader:ut,fragmentShader:mt,uniforms:{uL:{value:new e.Vector3(...ft).normalize()}},side:e.BackSide,depthWrite:!1});t.add(new e.Mesh(o,c));let u=new e.PMREMGenerator(m),r=u.fromScene(t,.02,.1,100);return u.dispose(),o.dispose(),c.dispose(),r}let me=1,Y=1,Be=0,Qe=1,Fe=100,_=new Float32Array(B+1),P=new Float32Array(B+1),E=!1,Ge=0,Le=-1,v={quality:R,programs:0,calls:0,triangles:0,frames:0,dpr:1,w:0,h:0,p:0,visible:!1,running:!1,earth:{cx:0,cy:0,r:0},mars:{cx:0,cy:0,r:0},rocket:{x:0,y:0,angle:0,t:0,target:0,alpha:0,len:0},pathOK:!1};function ge(){let t=W.getBoundingClientRect();me=Math.max(1,W.clientWidth||t.width),Y=Math.max(1,W.clientHeight||t.height),Be=t.top+window.scrollY,Qe=Y;let o=Math.min(window.devicePixelRatio||1,ke);m.setPixelRatio(o),m.setSize(me,Y,!1),f.left=0,f.right=me,f.top=Y,f.bottom=0,f.updateProjectionMatrix(),v.dpr=o,v.w=me,v.h=Y;let c=(a,k,D)=>{if(!k){a.mesh.visible=!1;return}let M=k.getBoundingClientRect();a.r=M.width/2,a.cx=M.left-t.left+a.r,a.cy=M.top-t.top+M.height/2,a.mesh.visible=a.r>0,a.mesh.position.set(a.cx,Y-a.cy,0),a.mesh.scale.setScalar(2*a.r*(1+2*pt)),D.cx=a.cx,D.cy=a.cy,D.r=a.r};if(c(z[0],X,v.earth),c(z[1],qe,v.mars),E=!1,S){let a=S.getScreenCTM(),k=S.getTotalLength();if(a&&k>0){let D=Math.hypot(a.a,a.b)||1;Ge=k,Le=-1,S.style.vectorEffect="none",S.style.strokeWidth=String(1/D),S.style.strokeDasharray=k+" "+k;for(let M=0;M<=B;M++){let ae=S.getPointAtLength(k*M/B);_[M]=a.a*ae.x+a.c*ae.y+a.e-t.left,P[M]=a.b*ae.x+a.d*ae.y+a.f-t.top}E=!0}}v.pathOK=E,Fe=Math.min(110,Math.max(48,me*.068));let u=Fe/I.length;d.scale.setScalar(u),d.updateMatrix();let r=ue.set(1,0,0).transformDirection(d.matrix),G=-Math.PI/2+Math.atan2(r.y,r.x),p=0;for(let a=0;a<H.length;a++)ue.copy(I.nozzles[a]).applyMatrix4(d.matrix),H[a].position.set(ue.x+.15*u,ue.y,10+a),H[a].scale.set(u*2.8,u*9,1),H[a].rotation.z=G,p=Math.max(p,-ue.x);let V=0;for(let a=0;a<B;a++)V+=Math.hypot(_[a+1]-_[a],P[a+1]-P[a]);De=E&&V>0?p/V:0,v.rocket.len=Fe}let bt=()=>window.lenis&&typeof window.lenis.scroll=="number"?window.lenis.scroll:window.scrollY,ee=v.rocket,K=0,we=0,We=!0,$=0,ye=0,Ot=new e.Vector3;function Mt(t){let o=window.innerHeight,c=wt((bt()+o-Be)/(o+Qe));v.p=c,we=ne+(c-vt)/(Lt-vt)*(ze-ne),We?(K=we,We=!1):K+=(we-K)*(1-Math.exp(-t*6));let u=Math.min(ze,Math.max(ne,K)),r=ht(ne-.1,ne,K)*(1-ht(ze,ze+.1,K));if(ee.t=u,ee.target=we,ee.alpha=r,E&&Ge){let F=K>ne-.1?Math.max(0,u-De):0;Math.abs(F-Le)>1e-4&&(S.style.strokeDashoffset=String(Ge*(1-F)),Le=F)}if(l.visible=r>.004&&E,!l.visible)return;let G=u*B,p=Math.min(B-1,Math.floor(G)),V=G-p,a=_[p]+(_[p+1]-_[p])*V,k=P[p]+(P[p+1]-P[p])*V,D=Math.max(0,p-2),M=Math.min(B,p+3),ae=_[M]-_[D],qt=-(P[M]-P[D]),Te=Math.atan2(qt,ae);ee.x=a,ee.y=k,ee.angle=Te,l.position.set(a,Y-k,50),l.rotation.z=Te;for(let F of i)F.opacity=r;U.uA.value=r*(.92+.08*Math.sin($*41)),U.uT.value=$;let kt=d.scale.x*9;for(let F=0;F<H.length;F++)H[F].scale.y=kt*(1+.07*Math.sin($*29+F*1.7)*Math.sin($*11.3+F))}function je(){for(let o of z){let c=(.25-o.cfg.front)*Math.PI*2+$*Math.PI*2/o.cfg.period;o.q.copy(o.qt).multiply(xe.setFromAxisAngle(he,c)),le.makeRotationFromQuaternion(o.q);let u=o.u.uRot.value.setFromMatrix4(le).transpose();o.u.uSun.value.set(...o.cfg.sun).normalize().applyMatrix3(u)}x.uCloudOff.value=-$*.0025;let t=-x.uCloudOff.value*Math.PI*2;x.uCloudRot.value.set(Math.cos(t),Math.sin(t))}let be=!1,Oe=!1,de=!1,q=!1,te=0,oe=null;function Ye(t){$+=t,je(),Mt(t),m.render(O,f);let o=m.info;v.programs=o.programs?o.programs.length:0,v.calls=o.render.calls,v.triangles=o.render.triangles,v.frames++}function Ke(){if(q||!de)return;let t=performance.now(),o=ye?Math.min(.1,(t-ye)/1e3):1/60;ye=t,Ye(o)}function $e(){te=requestAnimationFrame($e),Ke()}function pe(){let t=be&&Oe&&de&&!q;if(v.running=t,t){if(oe||te)return;ye=0,window.gsap?.ticker?(oe=Ke,window.gsap.ticker.add(oe)):te=requestAnimationFrame($e)}else oe&&(window.gsap.ticker.remove(oe),oe=null),te&&(cancelAnimationFrame(te),te=0)}let Re=new IntersectionObserver(t=>{Oe=t[t.length-1].isIntersecting,v.visible=Oe,pe()},{rootMargin:"120px 0px"});Re.observe(A);let Me=new ResizeObserver(()=>{q||ge()});Me.observe(A),Me.observe(W),Me.observe(document.body);let Ae=()=>{q||ge()};addEventListener("load",Ae),document.fonts?.ready.then(Ae);for(let t of A.querySelectorAll("img"))t.complete||t.addEventListener("load",Ae,{once:!0});let Xe=new e.TextureLoader;Xe.setCrossOrigin("anonymous");let At=Math.min(8,m.capabilities.getMaxAnisotropy()),St=(t,o)=>new Promise((c,u)=>Xe.load(new URL(t,Q).href,r=>{let G=r.image;(G&&G.decode?Promise.race([G.decode().catch(()=>{}),new Promise(V=>setTimeout(V,400))]):Promise.resolve()).then(()=>{r.colorSpace=o?e.SRGBColorSpace:e.NoColorSpace,r.anisotropy=At,r.wrapS=e.RepeatWrapping,r.needsUpdate=!0,c(r)})},void 0,()=>u(new Error("mission texture failed: "+t)))),Se=g?"high":"low",Ne=g?[[x.tMap,Ce.color[Se],!0],[C.tMap,Pe.color[Se],!0],[x.tNorm,Ce.normal,!1],[C.tNorm,Pe.normal,!1],[x.tClouds,Ce.clouds,!1]]:[[x.tMap,Ce.color[Se],!0],[C.tMap,Pe.color[Se],!0]],Ze=[],Je=(async()=>{ge();let t=await Promise.all(Ne.map(([,o,c])=>St(o,c)));if(q)return t.forEach(o=>o.dispose()),!1;for(let o=0;o<Ne.length;o++)m.initTexture(t[o]),Ne[o][0].value=t[o],Ze.push(t[o]),await xt();if(q)return!1;je(),l.visible=!0;for(let o of i)o.opacity=1;return U.uA.value=1,await m.compileAsync(O,f),q||(Ye(0),await xt(),q)?!1:(de=!0,pe(),I.addShroud().catch(o=>console.warn("TerraFirma mission: no shroud.",o)),!0)})();Je.catch(()=>{});function Ct({glow:t=!0,noShip:o=!1}={}){if(!de)return null;let c=m.getContext(),u=c.drawingBufferWidth,r=c.drawingBufferHeight;x.uGlow.value=C.uGlow.value=t?1:0;let G=l.visible;o&&(l.visible=!1),m.render(O,f),l.visible=G;let p=new Uint8Array(u*r*4);return c.readPixels(0,0,u,r,c.RGBA,c.UNSIGNED_BYTE,p),x.uGlow.value=C.uGlow.value=1,{w:u,h:r,data:p}}function zt(){if(!q){q=!0,de=!1,be=!1,pe(),Re.disconnect(),Me.disconnect(),removeEventListener("load",Ae),w.dispose(),ce.dispose();for(let t of z)t.mesh.material.dispose();Ve.dispose(),I.dispose();for(let t of Ze)t.dispose();if(T.dispose(),m.dispose(),m.forceContextLoss(),h.remove(),S)for(let t of["vectorEffect","strokeWidth","strokeDasharray","strokeDashoffset"])S.style[t]=""}}return{ready:Je,canvas:h,renderer:m,stats:v,capture:Ct,dispose:zt,start(){be=!0,pe()},stop(){be=!1,pe()},resize(){q||ge()}}}export{Ft as EARTH,gt as INITIAL_ROTATION,Gt as MARS,Qt as createMission};
