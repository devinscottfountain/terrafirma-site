// site.js: the opening shot. An East Austin dirt lot seen from ~170 m up, built out as a 2.5 day timelapse
// (clear, dig, haul, gravel, rebar, pour, columns, cores, deck forms), then main.js pulls the camera off to orbit.
// Units are metres. Local origin = lot centre, +x east, -z north. The group sits far from the solar system.
// The ground is one camera-following quad whose shader paints the neighbourhood procedurally and fades into the
// real Earth colour + NASA night-lights maps at altitude, so the hand-off to the globe in main.js matches.

import { createMachines } from './machines.js';
export const AUSTIN = { lat: 30.250453, lon: -97.719913 }; // a real 2019 dirt site by Lady Bird Lake, East Austin
// the lot's long axis runs 17 deg south of east, so the local frame is turned to it; the photo stays north-up
export const SITE_ROT = 17 * Math.PI / 180;
const OHALF = 400; // the orthophoto covers 800 x 800 m around the lot

// integer hash that gives the same answer in JS doubles and GLSL floats (all intermediates stay under 2^24)
const H = n => { const a = ((n % 1009) + 1009) % 1009; return ((a * a * 7 + a * 31 + 13) % 1009) / 1009; };
const CX = 180, CZ = 140, SLOT = 164 / 11, D = 4; // block grid, house slot width, pit depth
const hwX = k => (((k % 4) + 4) % 4 === 0 ? 11 : 6.5), hwZ = m => (((m % 5) + 5) % 5 === 0 ? 11 : 6.5); // street half widths; every 4th/5th is an arterial

// shared GLSL: hash, layout and noise (mirrors the JS above)
const GL = /* glsl */ `
float Hh(float n){ float a=mod(n,1009.); return mod(a*a*7.+a*31.+13.,1009.)/1009.; }
float hwX(float k){ return mod(k,4.)==0.?11.:6.5; } float hwZ(float m){ return mod(m,5.)==0.?11.:6.5; }
float h21(vec2 p){ p=fract(p*vec2(443.897,441.423)); p+=dot(p,p.yx+19.19); return fract((p.x+p.y)*p.x); }
float vn(vec2 x){ vec2 i=floor(x),f=fract(x); f=f*f*(3.-2.*f); return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y); }
float fb(vec2 p){ float v=0.,a=.5; for(int i=0;i<4;i++){ v+=a*vn(p); p*=2.03; a*=.5; } return v; }
float sdBox(vec2 p, vec2 c, vec2 h){ vec2 q=abs(p-c)-h; return length(max(q,0.))+min(max(q.x,q.y),0.); }
float cov(float d, float w){ return clamp(0.5-d/max(w,1e-3),0.,1.); }   // anti-aliased coverage of a signed distance
vec4 cubicW(float v){ float v2=v*v, v3=v2*v; return vec4(1.-3.*v+3.*v2-v3, 4.-6.*v2+3.*v3, 1.+3.*v+3.*v2-3.*v3, v3)/6.; }
float bicubicR(sampler2D t, vec2 uv, vec2 res){   // B-spline from 4 bilinear taps: low-res maps stay round up close
  uv=uv*res-.5; vec2 f=fract(uv); uv-=f; vec4 xc=cubicW(f.x), yc=cubicW(f.y);
  vec4 c=uv.xxyy+vec2(-.5,1.5).xyxy, sw=vec4(xc.xz+xc.yw, yc.xz+yc.yw), o=(c+vec4(xc.yw,yc.yw)/sw)/res.xxyy;
  float a=texture2D(t,o.xz).r, b=texture2D(t,o.yz).r, d=texture2D(t,o.xw).r, e=texture2D(t,o.yw).r;
  return mix(mix(e,d,sw.x/(sw.x+sw.y)), mix(b,a,sw.x/(sw.x+sw.y)), sw.z/(sw.z+sw.w)); }
`;


// photo frame: local metres (x east-ish, z south-ish, turned SITE_ROT) -> geographic metres (x east, z south) -> uv
const ORTHO = /* glsl */ `
vec2 toGeo(vec2 p){ return vec2(p.x*uRot.x-p.y*uRot.y, p.x*uRot.y+p.y*uRot.x); }
float orthoW(vec2 g){ vec2 a=abs(g); return uOrthoOn*(1.-smoothstep(${OHALF - 90}.,${OHALF - 4}.,max(a.x,a.y))); }
vec3 ortho(vec2 g){ return texture2D(tOrtho,vec2(g.x/${2 * OHALF}.+.5,.5-g.y/${2 * OHALF}.)).rgb; }
// round feathers, never square: each photo hands over to the next one out well inside its own edge
float circW(vec2 g, float hf){ return 1.-smoothstep(.55*hf,.95*hf,length(g)); }
vec4 photoLayers(vec2 g){
  float wc=uOrthoCOn*circW(g,40000.), wb=uOrthoBOn*circW(g,4000.), wa=uOrthoOn*circW(g,${OHALF}.);
  vec3 c=texture2D(tOrthoC,vec2(g.x/80000.+.5,.5-g.y/80000.)).rgb;
  c=mix(c,texture2D(tOrthoB,vec2(g.x/8000.+.5,.5-g.y/8000.)).rgb,wb); c=mix(c,ortho(g),wa);
  return vec4(c,max(wc,max(wb,wa))); }
// night over the photo: sodium/LED lamps dropped on the photo's own asphalt (dark, unsaturated pixels), one candidate per 18 m cell
vec3 orthoNight(vec2 g, float w){
  vec2 c=floor(g/18.), j=vec2(h21(c),h21(c+7.3))*.7+.15, dp=(fract(g/18.)-j)*18.;
  vec3 s=ortho((c+j)*18.); float lum=dot(s,vec3(.3,.5,.2)), sat=max(s.r,max(s.g,s.b))-min(s.r,min(s.g,s.b));
  float road=smoothstep(.2,.1,lum)*smoothstep(.015,.04,lum)*(1.-smoothstep(.03,.07,sat))*step(.2,h21(c+3.1));
  float r=max(.7,w), d=length(dp);
  vec3 lamp=mix(vec3(1.,.62,.28),vec3(.95,.95,1.),step(.7,h21(c+9.)));
  // warm windows: bright-roof pixels near a lamp glow faintly
  return lamp*road*(smoothstep(r,0.,d)*1.6*.49/(r*r)+.05*smoothstep(10.,0.,d));
}`;

// micro relief from the photo itself: darker = lower (ruts, tracks, puddled cuts), plus fine clods, as a bump on the shading normal
const BUMP = k => /* glsl */ `{
  vec2 bp=vLoc.xz; float bw=max(length(fwidth(bp)),1e-3), fade=1.-smoothstep(.15,.9,bw);   // only where it can resolve
  if(fade>0.){
    float e=.18; vec2 ex=vec2(e,0.), ez=vec2(0.,e);
    #define BH(q) (dot(ortho(toGeo(q)),vec3(.3,.5,.2))*.9*uOrthoOn+fb((q)*1.6)*.1+vn((q)*6.)*.025)
    float gx=(BH(bp+ex)-BH(bp-ex))/(2.*e), gz=(BH(bp+ez)-BH(bp-ez))/(2.*e);
    #undef BH
    normal=normalize(normal+(viewMatrix*vec4(-gx,0.,-gz,0.)).xyz*${k}*fade);
  } }`;

export function createSite({ THREE, scene, renderer, sunLight, hemi, ORIGIN, earthU, orthoUrl }) {
  const group = new THREE.Group(); group.position.copy(ORIGIN); group.visible = false; scene.add(group);
  const U = { uG: { value: 0 }, uNight: { value: 0 }, uT: { value: 0 }, uWork: { value: 0 }, uSunL: { value: new THREE.Vector3(0, 1, 0) },
    uOrigin: { value: ORIGIN.clone() }, tMap: earthU.tMap, tLights: earthU.tLights, uLL: { value: new THREE.Vector2(AUSTIN.lat, AUSTIN.lon) },
    uDig: { value: 0 }, uPile: { value: 0 }, uBack: { value: 0 }, uClear: { value: 0 }, uProg: { value: 0 },
    tOrtho: { value: null }, uOrthoOn: { value: 0 }, tOrthoB: { value: null }, uOrthoBOn: { value: 0 }, tOrthoC: { value: null }, uOrthoCOn: { value: 0 }, uRot: { value: new THREE.Vector2(Math.cos(SITE_ROT), Math.sin(SITE_ROT)) } };
  // real orthophoto: TxGIO StratMap 2019, 6 inch, Jan 2019 (public domain). Until it loads the procedural ground stands in.
  { const d = new THREE.DataTexture(new Uint8Array([90, 80, 66, 255]), 1, 1); d.needsUpdate = true; U.tOrtho.value = d; }
  // three nested photos, all north-up on the same centre: 800 m (6 in), 8 km (StratMap 2019 resampled ~4 m), 80 km (NAIP 2022 resampled ~40 m)
  { const d = new THREE.DataTexture(new Uint8Array([70, 72, 60, 255]), 1, 1); d.needsUpdate = true; U.tOrthoB.value = d; U.tOrthoC.value = d; }
  const ld = new THREE.TextureLoader(); ld.setCrossOrigin('anonymous');
  // load -> decode off the main thread -> upload -> swap, so the first frame that samples a photo never stalls on it.
  // Resolves true once swapped in, false if it failed (CORS, 404): the procedural ground just stays.
  const loadInto = (url, tex, on) => new Promise(res => {
    if (!url) return res(false);
    ld.load(url, t => {
      const img = t.image, dec = img && img.decode ? Promise.race([img.decode().catch(() => {}), new Promise(r => setTimeout(r, 400))]) : Promise.resolve(); // decode can stall in a background tab: cap it
      dec.then(() => {
        t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.needsUpdate = true;
        if (renderer && renderer.initTexture) try { renderer.initTexture(t); } catch (e) { /* first draw uploads it instead */ }
        U[tex].value = t; U[on].value = 1; res(true);
      });
    }, undefined, () => res(false));
  });
  const [oA, oB, oC] = [].concat(orthoUrl || []);
  const ready = loadInto(oA, 'tOrtho', 'uOrthoOn'); // the 800 m lot photo: the opening frame waits on this one (main.js races it)
  const readyAll = Promise.all([ready, loadInto(oB, 'tOrthoB', 'uOrthoBOn'), loadInto(oC, 'tOrthoC', 'uOrthoCOn')]);
  let patchN = 0;
  const patch = (mat, vHead, vBody, fHead, fColor, fRough, fEmit, normalFn, fNormal) => {
    const key = 'tfsite' + patchN++; mat.customProgramCacheKey = () => key; // each patched material needs its own program
    mat.onBeforeCompile = sh => {
      Object.assign(sh.uniforms, U);
      sh.vertexShader = 'uniform vec3 uOrigin; uniform float uDig,uPile,uBack; varying vec3 vLoc;\n' + GL + vHead + '\n' + sh.vertexShader;
      if (normalFn) sh.vertexShader = sh.vertexShader.replace('#include <beginnormal_vertex>', normalFn);
      sh.vertexShader = sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n' + vBody + '\nvLoc=(modelMatrix*vec4(transformed,1.)).xyz-uOrigin;');
      sh.fragmentShader = 'uniform float uG,uNight,uT,uWork,uClear,uProg,uOrthoOn,uOrthoBOn,uOrthoCOn; uniform vec3 uSunL; uniform sampler2D tMap,tLights,tOrtho,tOrthoB,tOrthoC; uniform vec2 uLL,uRot; varying vec3 vLoc;\n' + GL + ORTHO + fHead + '\n' + sh.fragmentShader
        .replace('#include <color_fragment>', '#include <color_fragment>\n' + fColor)
        .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\n' + fRough)
        .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n' + fEmit)
        .replace('#include <normal_fragment_maps>', '#include <normal_fragment_maps>\n' + (fNormal || ''));
    };
    return mat;
  };

  // ---------------------------------------------------------------- ground: the neighbourhood, the city, then the real Earth maps
  const GROUND = /* glsl */ `
  vec3 SOD=vec3(1.,.58,.24);
  vec2 llUv(vec2 p){ float lat=uLL.x-p.y/110574., lon=uLL.y+p.x/(111320.*cos(radians(uLL.x))); return vec2((lon+180.)/360.,(lat+90.)/180.); }
  // one house slot: returns roof coverage and fills colour/height; painted only outside the 3D ring
  float house(vec2 lc, float ci, float cj, float row, out vec3 roof, out float ht, out vec2 porch, out float pool, out vec2 poolC, float w){
    float s=floor((lc.x+82.)/${SLOT.toFixed(6)}); roof=vec3(0.); ht=0.; pool=0.; porch=vec2(1e5); poolC=vec2(1e5);
    if(s<0.||s>10.) return 0.;
    float n=ci*157.+cj*311.+row*71.+s*13.+500.;
    if(Hh(n)>0.92) return 0.;
    float cx=-82.+(s+.5)*${SLOT.toFixed(6)}, front=row<.5? -70.+hwZ(cj-1.) : 70.-hwZ(cj), dir=row<.5?1.:-1.;
    float hw=4.5+Hh(n+1.)*1.75, hd=5.+Hh(n+2.)*2., set=7.+Hh(n+3.)*3.;
    vec2 c=vec2(cx, front+dir*(set+hd));
    float r=Hh(n+7.); roof=r<.55?vec3(.045+Hh(n+9.)*.03):r<.8?vec3(.26,.27,.28):vec3(.07,.05,.035);
    ht=Hh(n+8.)<.35?8.5:6.;
    porch=vec2(cx, front+dir*(set-1.));
    if(Hh(n+5.)<.28){ pool=1.; poolC=vec2(cx+(Hh(n+6.)-.5)*4., c.y+dir*(hd+6.5)); }
    return cov(sdBox(lc,c,vec2(hw,hd)),w);
  }
  void groundShade(vec2 p, float w, out vec3 alb, out float rough, out vec3 emit){
    vec2 G=toGeo(p);   // geographic metres from the site (x east, z south): real landmarks are placed in this frame
    vec2 uv=llUv(G);
    vec3 M=texture2D(tMap,uv).rgb;
    float li=clamp((bicubicR(tLights,uv,vec2(2048.,1024.))-.10)/.8,0.,1.), lg=max(textureLod(tLights,uv,3.).r-.07,0.);
    vec3 macroL=SOD*(pow(li,1.35)*2.6+lg*lg*.9);
    alb=M; rough=1.; emit=macroL*uNight;
    if(w>400.) return;
    // ---------------- night city LOD (w ~1..360 m/px): energy-conserving lights whose area mean is macroL.
    // Every component below is normalised to an area mean of 1, so S averages to 1 and Lc to macroL at any w;
    // dots and lines get wider and dimmer as the pixel grows (gaussian sigma >= pixel) and fade to their mean once
    // they would overlap their neighbours. Everything converges to exactly macroL by w=360.
    float mL=dot(macroL,vec3(.3,.5,.2));
    float dens=smoothstep(.02,1.3,mL);                    // 0 rural .. 1 core, from the real lights map
    float sg0=.75*w;                                       // pixel footprint as a gaussian sigma
    vec3 LED=vec3(.62,1.14,3.), LEDm=vec3(.7)+.3*LED;      // white LED relative to sodium (same luminance), and the 70/30 mix
    // each component has area mean 1; its weight drops once it has faded to its mean, so the energy moves to whatever is
    // still resolved at this w (sum of weights renormalised -> the mean stays 1, but the frame isn't a flat haze)
    vec3 S=vec3(.04); float W=.04;                         // unresolved sky glow
    // jittered point lights at three nested scales: houses/lots (45 m), blocks of shops (260 m), malls/campuses (1.5 km)
    for(int i=0;i<3;i++){
      float fi=float(i), c=i==0?45.:i==1?260.:1500., r=i==0?4.:i==1?12.:45., a=i==0?.30:i==1?.21:.10;
      float pr=i==0?mix(.12,.9,dens):i==1?mix(.08,.75,dens):mix(.05,.6,dens);
      vec2 cid=floor(p/c), dc=p-(cid+.2+.6*vec2(h21(cid+fi*17.3),h21(cid.yx+fi*5.1+.7)))*c;
      float hs=h21(cid*1.37+fi*3.9+.11), bb=fract(hs*37.17), b=.3+1.4*bb*bb;
      float sg=max(r,sg0), dotv=step(hs,pr)*b*exp(-dot(dc,dc)/(sg*sg))*r*r/(sg*sg);
      float mean=pr*.7667*3.1416*r*r/(c*c), f=smoothstep(.07*c,.18*c,sg);
      vec3 tint=(i==2||fract(hs*91.7)<.7?vec3(1.):LED)/LEDm;
      a*=(1.-.92*f)*(i==0?1.:i==1?smoothstep(.7,3.,w):smoothstep(5.,20.,w));   // big clusters only once they read as points
      S+=a*mix(dotv/mean*tint,vec3(1.),f); W+=a;
    }
    // residential streets on the real block grid: streetlights every 36 m, uneven per block edge, some edges dark
    vec2 uS=p/vec2(${CX}.,${CZ}.), dS=abs(fract(uS)-.5)*vec2(${CX}.,${CZ}.);
    float hS=3., sgS=max(hS,sg0), sa=max(1.5,sg0);
    float gX=h21(vec2(floor(uS.x),floor(uS.y+.5))+.37), gZ=h21(vec2(floor(uS.x+.5),floor(uS.y))+5.71);
    float segX=step(.18,gX)*(.4+1.2*fract(gX*13.1)), segZ=step(.18,gZ)*(.4+1.2*fract(gZ*13.1));
    float ddX=mod(p.y,36.)-18., ddZ=mod(p.x,36.)-18., fa=smoothstep(4.,9.,sa), dn=36.*1.5/(1.7725*sa);
    float dotX=mix(exp(-ddX*ddX/(sa*sa))*dn,1.,fa), dotZ=mix(exp(-ddZ*ddZ/(sa*sa))*dn,1.,fa);
    float Lst=(exp(-dS.x*dS.x/(sgS*sgS))*segX*dotX+exp(-dS.y*dS.y/(sgS*sgS))*segZ*dotZ)*hS/sgS;
    float mSt=1.7725*hS*(1./${CX}.+1./${CZ}.)*.82;
    float fS=smoothstep(.05*${CZ}.,.13*${CZ}.,sgS), aS=.14*(1.-.92*fS); S+=aS*mix(Lst/mSt,1.,fS); W+=aS;
    // arterials: a noise-warped ~1.25 km grid plus a sparser diagonal family, broken into uneven lit segments
    vec2 q=p+420.*(vec2(vn(p*.0007+1.3),vn(p*.0007+7.9))-.5);
    vec2 uA=q/vec2(1290.,1210.)+vec2(.31,.17), dA=abs(fract(uA)-.5)*vec2(1290.,1210.);
    float uD=dot(q,vec2(.82,.57))/2900.+.4, dD=abs(fract(uD)-.5)*2900.;
    float aX=h21(vec2(floor(uA.x),floor(uA.y*1.7))+2.3), aZ=h21(vec2(floor(uA.x*1.7),floor(uA.y))+8.9), aD=h21(vec2(floor(uD),floor(dot(q,vec2(-.57,.82))/1800.))+4.4);
    aX=step(.15,aX)*(.5+fract(aX*7.3)); aZ=step(.15,aZ)*(.5+fract(aZ*7.3)); aD=step(.4,aD)*(.5+fract(aD*7.3));
    aX*=smoothstep(.15,.6,vn(vec2(q.y/2100.,floor(uA.x)*3.1))); aZ*=smoothstep(.15,.6,vn(vec2(q.x/2100.,floor(uA.y)*3.1+40.))); // lit stretches come and go
    float hA=9., sgA=max(hA,sg0);
    float LA=(exp(-dA.x*dA.x/(sgA*sgA))*aX+exp(-dA.y*dA.y/(sgA*sgA))*aZ+exp(-dD*dD/(sgA*sgA))*aD)*hA/sgA;
    float mA=1.7725*hA*((1./1290.+1./1210.)*.85*.6+.6/2900.);
    float fA=smoothstep(.1*1250.,.24*1250.,sgA), aA=.15*(1.-.85*fA); S+=aA*mix(LA/mA,1.,fA); W+=aA;
    // freeways: I-35 (matches the detail layer), MoPac, US-183, SH-71, US-290; packed headlights, brightest per metre
    float hH=24., sgH=max(hH,sg0);
    float h1=abs(G.x+1700.+40.*sin(G.y/900.)), h2=abs(p.x+7900.+500.*sin(p.y/3100.+1.)),
          h3=abs(dot(p-vec2(2600.,0.),vec2(.876,.482))+150.*sin(dot(p,vec2(-.482,.876))/2000.)),
          h4=abs(p.y-7200.-300.*sin(p.x/2600.)), h5=abs(p.y+5600.+200.*sin(p.x/1900.));
    float LH=(exp(-h1*h1/(sgH*sgH))*1.3+exp(-h2*h2/(sgH*sgH))+exp(-h3*h3/(sgH*sgH))+exp(-h4*h4/(sgH*sgH))+exp(-h5*h5/(sgH*sgH))*.8)*hH/sgH;
    S+=.06*LH/(1.7725*hH/5000.); W+=.06; S/=W;
    // organic occupancy: lit clusters and dark pockets (mean ~1), Lady Bird Lake + greenbelt dark
    float oc=(.15+.85*smoothstep(.33,.6,fb(p*.0006+3.7))*(.4+1.2*vn(p*.0023+9.1)))/.57;
    float drN=abs(dot(G-vec2(0.,330.),vec2(.438,.899))+40.*sin(G.x/900.));   // Lady Bird Lake: ~300 m wide, running ENE just south of the site
    oc*=mix(.08,1.,smoothstep(150.,330.,drN));
    oc*=mix(1.,.2+1.6*smoothstep(.32,.62,fb(p*.00011+11.3)),1.-dens);   // ragged suburban edge instead of the map's round blob (mean ~1)
    // exposure-friendly gain: mid altitudes sit a bit under the map's mean (no brighter than macroL), reaching it by w~300
    float gL=smoothstep(1.1,5.77,log(w));
    vec3 Lc=macroL*mix(S*oc,vec3(1.),smoothstep(200.,360.,w))*mix(.12,1.,gL*gL);
    // a thin string of lights along the freeways out past the city edge (fades with the rest)
    Lc+=SOD*.05*LH*(1.-dens)*(1.-smoothstep(25000.,45000.,length(p)))*(1.-smoothstep(200.,360.,w))*mix(.12,1.,gL*gL);
    emit=Lc*uNight;
    if(w>8.) return;   // albedo/roughness below are fully the map's beyond w=8, so skip the detail layer
    // ---------------- detail layer
    float ci=floor(p.x/${CX}.+.5), cj=floor(p.y/${CZ}.+.5);
    vec2 lc=p-vec2(ci*${CX}.,cj*${CZ}.);
    float kx=lc.x>0.?ci:ci-1., kz=lc.y>0.?cj:cj-1.;
    float dX=${CX / 2}.-abs(lc.x), dZ=${CZ / 2}.-abs(lc.y);          // distance to the street centrelines
    float hx=hwX(kx), hz=hwZ(kz);
    float nz=fb(p*.05), nz2=vn(p*.6);
    vec3 lawn=mix(vec3(.085,.11,.04),vec3(.17,.15,.075),smoothstep(.45,.75,nz))*(.85+.3*nz2);
    vec3 col=lawn; float rgh=1.; vec3 L=vec3(0.);
    float city=1.-smoothstep(14000.,22000.,length(G-vec2(-2300.,-600.)));
    // river (Lady Bird Lake) + greenbelt, I-35, downtown
    float dr=abs(dot(G-vec2(0.,330.),vec2(.438,.899))+40.*sin(G.x/900.));
    float park=1.-smoothstep(230.,320.,dr), water=cov(dr-150.,w);
    float dHwy=abs(G.x+1700.+40.*sin(G.y/900.));
    float down=1.-smoothstep(1100.,1500.,length(G-vec2(-2300.,-600.)));
    bool in3D=false; // the orthophoto now owns the near neighbourhood
    // blocks
    if(city>.01&&park<.99&&dHwy>40.){
      float hh=Hh(ci*157.+cj*311.);
      bool comm=(hh<.16||down>.5)&&!(ci==0.&&cj==0.);
      if(ci==0.&&cj==0.){ col=vec3(.42,.36,.27)*(.8+.4*nz); }
      else if(comm){
        // big flat roof + parking with stall lines
        float bw=40.+hh*120., bd=30.+Hh(floor(hh*999.))*30.; vec2 bc=vec2(-15.,-10.);
        float b=cov(sdBox(lc,bc,vec2(bw*.5,bd)),w);
        float stall=step(.9,fract(lc.x/2.7))*(1.-smoothstep(.3,1.2,w));
        vec3 park2=vec3(.04)+stall*.25;
        col=mix(park2,in3D?park2:vec3(.5,.5,.48)*(.9+.1*nz2),b);
        L+=vec3(1.,.9,.75)*.35*smoothstep(.6,.05,length(fract(lc/22.)-.5)*22.)*step(.5,h21(floor(lc/22.)+hh))*(1.-b);
        L+=vec3(1.,.8,.55)*.35*b*step(.6,Hh(floor(lc.x/6.)+floor(lc.y/6.)*13.+hh*500.));
        if(down>.5){ col=mix(col,vec3(.18,.19,.21),b); L+=vec3(1.,.82,.6)*1.4*b*step(.45,h21(floor(lc*.25)+hh)); }
      } else {
        float row=lc.y<0.?0.:1.;
        vec3 roof; float ht; vec2 porch,poolC; float pool;
        float hcov=house(lc,ci,cj,row,roof,ht,porch,pool,poolC,w);
        // drive + front walk
        float s=floor((lc.x+82.)/${SLOT.toFixed(6)}), cxs=-82.+(s+.5)*${SLOT.toFixed(6)};
        float drv=cov(sdBox(lc,vec2(cxs+3.,row<.5?-58.:58.),vec2(1.6,8.)),w)*step(0.,s)*step(s,10.);
        col=mix(col,vec3(.3,.29,.27),drv);
        if(pool>.5){ float pc=cov(sdBox(lc,poolC,vec2(3.6,1.9)),w), deck=cov(sdBox(lc,poolC,vec2(4.8,3.)),w);
          col=mix(col,vec3(.36,.34,.31),deck); col=mix(col,vec3(.03,.28,.36),pc); L+=vec3(.1,.35,.45)*pc*.25; }
        // fake shadow of the painted roof (offset away from the sun)
        vec2 so=-uSunL.xz/max(uSunL.y,.15)*ht;
        vec3 r2; float h2; vec2 p2,q2; float pl2;
        float shd=house(lc-so,ci,cj,row,r2,h2,p2,pl2,q2,w);
        if(!in3D){ col*=1.-.55*shd*smoothstep(0.,.2,uSunL.y); col=mix(col,roof*(.9+.2*nz2),hcov); }
        L+=vec3(1.,.7,.4)*1.6*smoothstep(1.4,.3,length(lc-porch))*step(.25,Hh(ci*7.+cj*13.+s+row*3.));
        // backyard trees, painted outside the 3D ring
        if(!in3D) for(int k=0;k<3;k++){
          float n=ci*157.+cj*311.+row*71.+s*13.+500.+float(k);
          if(Hh(n+10.)<.6){ vec2 tc=vec2(cxs+(Hh(n+20.)-.5)*12., (row<.5?-1.:1.)*(Hh(n+30.)*45.+12.)); float tr=3.+Hh(n+40.)*4.;
            float tt=cov(length(lc-tc)-tr*(.85+.25*vn(lc*.5)),w), ts=cov(length(lc-tc-so*.8)-tr,w);
            col*=1.-.5*ts*smoothstep(0.,.2,uSunL.y); col=mix(col,vec3(.03,.055,.02)*(.8+.4*nz2),tt); }
        }
      }
      // streets: asphalt, sidewalks, lane paint
      float road=cov(min(dX-hx+2.2,dZ-hz+2.2),w), walk=cov(min(dX-hx,dZ-hz),w);
      col=mix(col,vec3(.31,.3,.28),walk); col=mix(col,vec3(.035,.035,.038)*(.85+.3*nz2),road);
      float lw=1.-smoothstep(.15,.6,w);
      float art=step(10.,max(dX<hx?hx:0.,dZ<hz?hz:0.));
      float cl=dX<dZ?dX:dZ, along=dX<dZ?lc.y:lc.x;
      col+=road*lw*art*vec3(.45,.33,.05)*cov(abs(cl-.25)-.08,w*.5);
      col+=road*lw*vec3(.4)*cov(abs(cl-(art>.5?4.:0.))-.08,w*.5)*step(.5,fract(along/12.))*(art>.5?1.:.0);
      // streetlights every 36 m on the sidewalk
      float sl=smoothstep(.9,.1,length(vec2(cl-(dX<dZ?hx:hz)+1.,mod(along,36.)-18.)));
      L+=vec3(1.,.66,.32)*sl*1.6+vec3(1.,.6,.3)*.05*smoothstep(10.,0.,length(vec2(cl-(dX<dZ?hx:hz)+1.,mod(along,36.)-18.)))*road;
      // traffic: long-exposure trails at night, jittery timelapse cars by day
      float lane=cl-1.9-(art>.5?1.8:0.), frm=floor(uT*9.);
      float trail=cov(abs(fract(cl/3.6)-.5)*3.6-.35,w)*road*step(cl,hx-2.2);
      float flow=smoothstep(.3,.8,vn(vec2(along*.02-uT*3.*sign(lc.x+lc.y),cl)))*(art>.5?1.:.15)*min(1.,.6/w);
      L+=mix(vec3(1.,.15,.06),vec3(1.,.95,.8),step(0.,dX<dZ?lc.x:lc.y))*trail*flow*1.4;
      float slot=floor(along/9.), ln=floor(cl/3.6);
      float car=step(art>.5?.55:.88,h21(vec2(slot,ln+frm*.37)))*cov(sdBox(vec2(mod(along,9.)-4.5,fract(cl/3.6)*3.6-1.8),vec2(0.),vec2(2.2,.9)),w)*road*step(cl,hx-2.5);
      float cc=h21(vec2(slot,ln+3.)); vec3 paint=cc<.3?vec3(.7):cc<.5?vec3(.35):cc<.7?vec3(.025):cc<.8?vec3(.15,.16,.18):cc<.9?vec3(.35,.03,.02):vec3(.03,.07,.2);
      col=mix(col,paint,car*(1.-uNight));
    }
    // highway: 10 lanes, packed trails
    if(dHwy<40.){ float lanes=cov(dHwy-36.,w); col=mix(col,vec3(.05),lanes); col=mix(col,vec3(.3),cov(abs(dHwy-18.)-.6,w));
      float tr=cov(abs(fract(dHwy/3.6)-.5)*3.6-.4,w)*lanes; L+=mix(vec3(1.,.15,.06),vec3(1.,.95,.8),step(0.,G.x+1700.))*tr*smoothstep(.2,.7,vn(vec2(p.y*.01-uT*4.,dHwy)))*1.6*min(1.,.6/w); }
    col=mix(col,mix(vec3(.04,.08,.03),vec3(.02,.04,.015),nz2),park*(1.-water)); col=mix(col,vec3(.012,.035,.035),water);
    // rural beyond the city: field patchwork
    if(city<.99){ vec2 fc=floor(p/vec2(420.,300.)); vec3 fld=mix(vec3(.16,.14,.08),vec3(.08,.1,.04),h21(fc))*(.85+.3*nz); col=mix(fld,col,city); L*=city; }
    // detail -> night city LOD
    vec3 Ln=mix(L*city,Lc,smoothstep(.8,2.5,w));
    alb=mix(col,M,smoothstep(1.5,8.,w));
    emit=Ln*uNight;
    rough=mix(rgh,1.,smoothstep(1.5,8.,w));
  }`;
  const groundMat = patch(new THREE.MeshStandardMaterial({ roughness: 1, metalness: 0, polygonOffset: true, polygonOffsetFactor: 2, polygonOffsetUnits: 2 }),
    '', '', GROUND + '\nvec3 gA; float gR; vec3 gE;',
    'if(abs(vLoc.x)<74.8&&abs(vLoc.z)<54.8) discard; // the lot mesh owns this patch (the pit goes below the ground plane)\n  float gw=max(length(fwidth(vLoc.xz)),1e-3); groundShade(vLoc.xz,gw,gA,gR,gE);\n  { vec2 gq=toGeo(vLoc.xz); vec4 ph=photoLayers(gq); if(ph.a>0.){ gA=mix(gA,ph.rgb,ph.a); gR=mix(gR,.95,ph.a); }\n    float ow=uOrthoOn*circW(gq,400.); if(ow>0.) gE=mix(gE,orthoNight(gq,gw)*uNight,ow*(1.-smoothstep(1.,3.,gw))); }\n  diffuseColor.rgb=gA;',
    'roughnessFactor=gR;',
    'totalEmissiveRadiance+=gE;', null, BUMP(0.35));
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), groundMat);
  ground.position.y = -0.06; ground.receiveShadow = true; ground.frustumCulled = false; group.add(ground);

  // ---------------------------------------------------------------- the lot: displaced dirt, the pit, the slab painted bay by bay
  const PIT = /* glsl */ `
  float pitH(vec2 p){
    vec2 q=abs(p)-vec2(32.,20.); float dr=max(q.x,q.y);
    float m=1.-smoothstep(-3.,0.,dr);
    float xf=-32.+uDig*76.;                             // the dig face sweeps west to east
    float f=smoothstep(xf,xf-7.,p.x);
    float h=-${D}.*m*f;
    // haul ramp up the east side
    float rx=clamp((p.x-30.)/22.,0.,1.), rm=(1.-smoothstep(4.5,7.,abs(p.y)))*step(29.,p.x)*step(p.x,52.);
    h=min(h,-${D}.*(1.-rx)*rm*smoothstep(.55,.9,uDig)*(1.-uBack));
    // ground topography outside the dig: gentle swales, a few windrows from grading, all easing to 0 at the lot edge
    float edge=(1.-smoothstep(62.,74.,abs(p.x)))*(1.-smoothstep(42.,54.,abs(p.y)));
    float topo=(fb(p*.022+3.)-.47)*1.6+(vn(p*.11)-.5)*.35+smoothstep(.55,1.,sin(p.y*.42+fb(p*.05)*4.))*.22;
    h+=topo*edge*(1.-m*f);
    // spoil pile
    float r=length((p-vec2(-52.,-38.))*vec2(1.,1.3));
    h+=uPile*7.*exp(-r*r/160.)*(.8+.4*vn(p*.15));
    return h;
  }`;
  const lotMat = patch(new THREE.MeshStandardMaterial({ roughness: 1, metalness: 0 }),
    PIT, 'transformed.y+=pitH(position.xz);', /* glsl */ `
    float bayOf(vec2 p){ return floor((p.x+32.)/16.)*2.+(p.y<0.?0.:1.); }
    float pourT(float b){ return .47+b*.028; }
    vec3 lA; float lR; vec3 lE;`, /* glsl */ `
    vec2 p=vLoc.xz; float w=max(length(fwidth(p)),1e-3);
    float nz=fb(p*.08), n2=vn(p*1.3), n3=vn(vec2(p.x*.9,p.y*.12)+7.);
    vec3 grass=mix(vec3(.09,.115,.04),vec3(.18,.16,.08),smoothstep(.4,.75,nz))*(.85+.3*n2);
    vec3 dirt=mix(vec3(.36,.3,.22),vec3(.46,.41,.33),smoothstep(.35,.65,nz))*(.9+.18*n2)*(1.-.14*smoothstep(.5,.75,n3));   // tracked clay over caliche, with tyre streaks   // tracked clay over caliche
    float cleared=smoothstep(.05,0.,nz-uClear*1.25+.1);
    vec3 col=mix(grass,dirt,cleared);
    { vec2 gq=toGeo(p); col=mix(col,ortho(gq)*(.95+.1*n2),orthoW(gq)); }   // the real lot from the 2019 flight
    float y=vLoc.y; float cut=smoothstep(-.3,-1.2,y);
    // fresh cut: the photo's own dirt, paler and drier (exposed caliche), streaked by bucket teeth, darker down the walls
    vec3 cal=vec3(.6,.56,.47)*(.85+.2*n2);
    { vec2 gq=toGeo(p); float ow=orthoW(gq); vec3 ph=ortho(gq+vec2(7.,3.)); float l=dot(ph,vec3(.3,.5,.2));
      vec3 photoCut=mix(vec3(l),ph,.55)*vec3(1.3,1.24,1.12)*(.8+.35*vn(vec2(p.x*2.5,p.y*.35)))*(.85+.25*n2);
      cal=mix(cal,photoCut,ow); }
    float wall=smoothstep(.2,.7,1.-abs(normalize(cross(dFdx(vLoc),dFdy(vLoc))).y));
    col=mix(col,cal*(1.-.3*wall),cut);
    // gate pad + haul road gravel
    float pad=step(55.,p.x)*step(abs(p.y),24.); col=mix(col,vec3(.33,.32,.3)*(.85+.25*n2),pad*cleared);
    float rough=1.; vec3 E=vec3(0.);
    // pit floor: gravel -> rebar -> concrete (wet, then cured), bay by bay
    if(abs(p.x)<31.&&abs(p.y)<19.&&y<-${D - 0.4}){
      float b=bayOf(p), tp=pourT(b), tg=tp-.11, tr=tp-.05;
      if(uProg>tg){ col=mix(col,vec3(.34,.33,.31)*(.8+.35*vn(p*3.)),smoothstep(tg,tg+.012,uProg)); }
      if(uProg>tr){ float lw=1.-smoothstep(.06,.25,w); vec2 g=abs(fract(p/.6)-.5);
        float bar=max(cov(g.x-.06,w),cov(g.y-.06,w)); col=mix(col,vec3(.22,.09,.04),smoothstep(tr,tr+.01,uProg)*mix(.45,bar,lw)); }
      if(uProg>tp){ float k=smoothstep(tp,tp+.008,uProg), cure=smoothstep(tp+.01,tp+.07,uProg);
        vec3 conc=mix(vec3(.1,.1,.1),vec3(.42,.41,.38)*(.9+.15*vn(p*.4)),cure);
        col=mix(col,conc,k); rough=mix(rough,mix(.25,.85,cure),k);
        vec2 jn=abs(fract((p+vec2(32.,0.))/vec2(16.,19.))-.5)*vec2(16.,19.);           // construction joints
        col*=1.-.5*k*max(cov(abs(jn.x-8.)-.06,w),cov(abs(p.y)-.06,w)); }
    }
    // pools of work light at night
    vec2 LT[4]; LT[0]=vec2(-60.,-42.); LT[1]=vec2(60.,-42.); LT[2]=vec2(-60.,42.); LT[3]=vec2(20.,30.);
    for(int i=0;i<4;i++){ float d=length(p-LT[i]); E+=col*vec3(1.,.93,.8)*.25*exp(-d*d/700.)*uWork; }
    lA=col; lR=rough; lE=E;
    diffuseColor.rgb=lA;`, 'roughnessFactor=lR;', 'totalEmissiveRadiance+=lE;',
    /* glsl */ `vec3 objectNormal; { float e=.6; vec2 p=position.xz;
      objectNormal=normalize(vec3(-(pitH(p+vec2(e,0.))-pitH(p-vec2(e,0.)))/(2.*e),1.,-(pitH(p+vec2(0.,e))-pitH(p-vec2(0.,e)))/(2.*e))); }
    #ifdef USE_TANGENT
      vec3 objectTangent = vec3( tangent.xyz );
    #endif`, BUMP(0.9));
  const lot = new THREE.Mesh(new THREE.PlaneGeometry(150, 110, 150, 110).rotateX(-Math.PI / 2), lotMat);
  lot.receiveShadow = true; group.add(lot);

  // ---------------------------------------------------------------- materials
  const M = (c, r = 0.7, m = 0, e) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m, ...(e ? { emissive: e } : {}) });
  const mats = { yel: M(0xf0b20a, 0.5, 0.1), dark: M(0x1c1c1c, 0.85), glass: M(0x16222c, 0.15, 0.4), white: M(0xe9e6df, 0.55), conc: M(0xb7b2a8, 0.9),
    grey: M(0x7d7b77, 0.6, 0.3), orange: M(0xe8641c, 0.5), blue: M(0x2a5aa8, 0.6), ply: M(0xc0773a, 0.8), rust: M(0x7a3b1c, 0.9), green: M(0x22382a, 0.9),
    lamp: new THREE.MeshBasicMaterial({ color: 0xffffff }), drum: M(0xd8d4cc, 0.4, 0.3) };
  const box = (w, h, d, mat, x = 0, y = 0, z = 0, parent) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; (parent || group).add(m); return m; };
  const cyl = (r, l, mat, x, y, z, parent, axis = 'z') => { const g = new THREE.CylinderGeometry(r, r, l, 14); axis === 'z' ? g.rotateX(Math.PI / 2) : axis === 'x' ? g.rotateZ(Math.PI / 2) : 0; const m = new THREE.Mesh(g, mat); m.position.set(x, y, z); m.castShadow = true; parent.add(m); return m; };
  const tmpM = new THREE.Matrix4(), tq = new THREE.Quaternion(), tv = new THREE.Vector3(), ts = new THREE.Vector3(), YA = new THREE.Vector3(0, 1, 0), HIDE = new THREE.Vector3(1e-4, 1e-4, 1e-4);
  const sstep = (x, a, b) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

  // (the near neighbourhood is the real orthophoto now; 3D houses/trees removed)

  // ---------------------------------------------------------------- the lot before work: live oaks that get cleared
  const oaks = []; // the real lot is already cleared
  const oak = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), M(0x1f3314, 0.95), oaks.length); oak.castShadow = oak.receiveShadow = true; group.add(oak);

  // perimeter fence with two gates on the east side
  {
    const segs = [];
    for (let x = -75; x < 75; x += 3) segs.push([x + 1.5, -55, 0], [x + 1.5, 55, 0]);
    for (let z = -55; z < 55; z += 3) { segs.push([-75, z + 1.5, 1]); if (!((z > -32 && z < -6) || (z > 18 && z < 42))) segs.push([75, z + 1.5, 1]); }
    const f = new THREE.InstancedMesh(new THREE.BoxGeometry(3, 1.8, 0.08).translate(0, 0.9, 0), mats.green, segs.length);
    segs.forEach(([x, z, r], i) => { tmpM.compose(tv.set(x, 0, z), tq.setFromAxisAngle(YA, r ? Math.PI / 2 : 0), ts.set(1, 1, 1)); f.setMatrixAt(i, tmpM); });
    f.castShadow = true; group.add(f);
  }
  const workLights = [new THREE.PointLight(0xfff0d8, 0, 90, 1.6), new THREE.PointLight(0xfff0d8, 0, 90, 1.6)];
  workLights[0].position.set(-30, 14, -10); workLights[1].position.set(30, 14, 10); workLights.forEach(l => group.add(l));

  // ---------------------------------------------------------------- machines, crew, light towers, site furniture (machines.js: CAT 336s, tri-axle dumps, D6, boom pump, mixers, flat-top crane)
  const { exA, exB, trucks, dozer, pump, mixers, crane, crew, towers } = createMachines({ THREE, group, D });
  const NW = 44;
  // building: 40 columns, two cores, then the first deck's forms
  const COLS = []; for (let x = -28; x <= 28; x += 8) for (let z = -16; z <= 16; z += 8) COLS.push([x, z]);
  const colMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(0.75, 1, 0.75).translate(0, 0.5, 0), mats.conc, COLS.length); colMesh.castShadow = colMesh.receiveShadow = true; group.add(colMesh);
  const cores = [[-12, -4, 8, 6], [14, 5, 6, 6]].map(([x, z, w, d]) => { const m = box(w, 1, d, mats.conc, x, -D, z); m.geometry.translate(0, 0.5, 0); return m; });
  const DECK = []; for (let x = -28; x < 28; x += 8) for (let z = -18; z < 18; z += 9) DECK.push([x + 4, z + 4.5]);
  const deck = new THREE.InstancedMesh(new THREE.BoxGeometry(7.8, 0.35, 8.8), mats.ply, DECK.length); deck.castShadow = deck.receiveShadow = true; group.add(deck);
  // ---------------------------------------------------------------- clock: 2.6 days of Austin late October, work only in daylight
  const H0 = 7.5, HSPAN = 63, LAT = THREE.MathUtils.degToRad(AUSTIN.lat), DEC = THREE.MathUtils.degToRad(-13);
  const workHrs = h => { const d = Math.floor(h / 24), hd = h - d * 24; return d * 11 + Math.min(11, Math.max(0, hd - 7)); };
  const W_END = workHrs(H0 + HSPAN), W0 = workHrs(H0);
  const sunL = new THREE.Vector3(), skyC = new THREE.Color(), gndC = new THREE.Color();
  // path helpers
  const lerpPath = (pts, u, out) => { const n = pts.length - 1, f = Math.min(n - 1e-6, Math.max(0, u * n)), i = Math.floor(f), k = f - i; out.set(pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k, 0, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k); return Math.atan2(-(pts[i + 1][1] - pts[i][1]), pts[i + 1][0] - pts[i][0]); };
  const LOOP = [[86, -420], [86, -30], [74, -24], [40, -25.5], [-20, -25.5], [-44, -25.5], [-50, 0], [-44, 25.5], [-10, 25.5], [40, 25.5], [74, 30], [86, 36], [86, 420]];
  const sd = new THREE.Vector3(), X1 = new THREE.Vector3(1, 0, 0);
  const seg = (m, a, b) => { sd.subVectors(b, a); const L = sd.length(); m.position.copy(a).add(b).multiplyScalar(0.5); m.scale.set(L, 1, 1); m.quaternion.setFromUnitVectors(X1, sd.normalize()); };
  const A = new THREE.Vector3(), B = new THREE.Vector3(), C = new THREE.Vector3();

  function update({ g, t }) {
    const hour = g < 0.86 ? H0 + (g / 0.86) * 60.5 : 68 + (g - 0.86) / 0.14 * 3, hd = ((hour % 24) + 24) % 24; // timelapse ends at 20:00 so the whole pull out is night
    const prog = g, wt = g * 33; // round-the-clock job: progress and the machine clock never stop, night shifts run under the light towers
    const working = 1;
    // sun: hour angle from solar noon (~13:00 CDT)
    const Ha = THREE.MathUtils.degToRad((hd - 13.1) * 15), sinE = Math.sin(LAT) * Math.sin(DEC) + Math.cos(LAT) * Math.cos(DEC) * Math.cos(Ha);
    const el = Math.asin(sinE), az = Math.atan2(-Math.sin(Ha), Math.tan(DEC) * Math.cos(LAT) - Math.sin(LAT) * Math.cos(Ha));
    sunL.set(Math.cos(el) * Math.sin(az), Math.sin(el), -Math.cos(el) * Math.cos(az));
    const day = sstep(sinE, -0.1, 0.12), night = 1 - day, low = 1 - sstep(sinE, 0.05, 0.5);
    U.uSunL.value.copy(sunL); U.uNight.value = sstep(-sinE, -0.02, 0.12); U.uT.value = t + g * 40; U.uG.value = g; U.uProg.value = prog;
    U.uWork.value = U.uNight.value * (prog > 0.05 ? 1 : 0);
    sunLight.color.setRGB(1, 0.93 - low * 0.25, 0.85 - low * 0.45); sunLight.intensity = 3.2 * sstep(sinE, -0.02, 0.1);
    sunLight.position.copy(ORIGIN).addScaledVector(sunL.y > 0 ? sunL : tv.set(sunL.x, 0.05, sunL.z).normalize(), 400); sunLight.target.position.copy(ORIGIN);
    hemi.color.copy(skyC.setRGB(0.42, 0.58, 1.0).lerp(gndC.setRGB(0.06, 0.07, 0.12), night)); hemi.groundColor.setRGB(0.42 * day + 0.02, 0.34 * day + 0.02, 0.24 * day + 0.03);
    hemi.intensity = 0.6 + 0.95 * day; // a little moonlight so the photo neighbourhood never goes fully black
    workLights.forEach(l => (l.intensity = 140 * U.uWork.value)); towers.forEach(h => (h.visible = U.uWork.value > 0.05));
    U.uClear.value = sstep(prog, 0.0, 0.07);
    U.uDig.value = sstep(prog, 0.07, 0.36); U.uPile.value = sstep(prog, 0.08, 0.24) * (1 - sstep(prog, 0.3, 0.46)) * 0.9 + 0.1 * sstep(prog, 0.3, 0.46);
    U.uBack.value = sstep(prog, 0.8, 0.93);
    // oaks come down in the first hours
    oaks.forEach(([x, z, r], i) => { const k = 1 - sstep(prog, 0.005 + i * 0.004, 0.02 + i * 0.004); tmpM.compose(tv.set(x, r * 0.55 + 1.6, z), tq.setFromAxisAngle(YA, i), k > 0.01 ? ts.set(r * k, r * 0.55 * k, r * k) : HIDE); oak.setMatrixAt(i, tmpM); });
    oak.instanceMatrix.needsUpdate = true;
    // excavators: dig, swing, dump, swing back; they ride the dig face
    const digOn = prog > 0.06 && prog < 0.42, xf = -32 + U.uDig.value * 76;
    [[exA, -13, -1], [exB, 13, 1]].forEach(([e, z, s], i) => {
      e.g.visible = digOn || (i === 1 && prog > 0.8 && prog < 0.95);
      const ph = (wt * 1.9 + i * 0.37) % 1, sw = sstep(ph, 0.35, 0.55) * (1 - sstep(ph, 0.7, 0.95));
      e.up.rotation.y = sw * s * 1.9;
      e.boom.rotation.z = THREE.MathUtils.lerp(0.35 - sstep(ph, 0, 0.3) * 0.55, 0.62, sw);
      e.stick.rotation.z = -THREE.MathUtils.lerp(1.05 + sstep(ph, 0.05, 0.33) * 0.9, 0.9 - sstep(ph, 0.55, 0.68) * 0.5, sw);
      const ex = i === 1 && prog > 0.8 ? 40 : Math.min(26, Math.max(-28, xf - 6));
      e.g.position.set(ex, i === 1 && prog > 0.8 ? -1 : -D * sstep(prog, 0.07, 0.12), z); e.g.rotation.y = 0;
    });
    // haul trucks loop through the gates; loaded on the way out
    trucks.forEach((tr, i) => {
      const u = ((wt * 0.16 + i / trucks.length) % 1); tr.g.visible = prog > 0.07 && prog < 0.46;
      const yaw = lerpPath(LOOP, u, tr.g.position); tr.g.rotation.y = yaw; tr.load.visible = u > 0.5;
    });
    // dozer: strips the lot, grades the pit floor, then fine grades the yard
    { const ph = (wt * 0.9) % 1, tri = Math.abs(ph * 2 - 1); let x, z, y = 0, on = true;
      if (prog < 0.1) { x = -60 + tri * 110; z = -40 + Math.floor(wt * 0.9 % 4) * 20; }
      else if (prog > 0.3 && prog < 0.44) { x = -26 + tri * 52; z = -12 + Math.floor(wt * 0.9 % 3) * 12; y = -D; }
      else if (prog > 0.86) { x = -60 + tri * 40; z = 40; }
      else on = false;
      dozer.visible = on; if (on) { dozer.position.set(x, y, z); dozer.rotation.y = ph < 0.5 ? 0 : Math.PI; } }
    // pours: pump parks on the north edge opposite the active bay, two mixers queue behind it
    const bay = Math.min(7, Math.max(0, Math.floor((prog - 0.47) / 0.028 + 0.5))), pouring = prog > 0.455 && prog < 0.69;
    pump.g.visible = pouring; mixers.forEach(m => (m.g.visible = pouring));
    if (pouring) {
      const bx = -32 + Math.floor(bay / 2) * 16 + 8, bz = bay % 2 ? 9.5 : -9.5;
      pump.g.position.set(bx, 0, -29); A.set(bx, 3.2, -29); C.set(bx + Math.sin(wt * 5) * 3, -D + 3.5, bz + Math.cos(wt * 4) * 2); B.copy(A).lerp(C, 0.45); B.y = 16;
      seg(pump.s1, A, B); seg(pump.s2, B, C); seg(pump.hose, C, tv.copy(C).setY(-D + 0.2));
      [pump.s1, pump.s2, pump.hose].forEach(m => (m.visible = true));
      mixers.forEach((m, i) => { m.g.position.set(bx + 12 + i * 11, 0, -29); m.d.rotation.x = t * 3 + i; });
    } else [pump.s1, pump.s2, pump.hose].forEach(m => (m.visible = false));
    // crane: mast climbs in, then the jib swings between picks
    { const up = sstep(prog, 0.4, 0.47), Hm = 40 * up + 0.01; crane.g.visible = up > 0.01; crane.mast.scale.y = Hm; crane.top.position.y = Hm;
      crane.top.visible = up > 0.95; const sw = wt * 0.7; crane.top.rotation.y = Math.sin(sw) * 1.6 + Math.sin(sw * 2.3) * 0.7;
      const tr = 12 + (Math.sin(wt * 1.3) * 0.5 + 0.5) * 36, drop = 10 + (Math.sin(wt * 2.1) * 0.5 + 0.5) * 22; crane.trolley.position.x = tr;
      crane.line.scale.y = drop; crane.line.position.y = -0.8 - drop / 2; crane.hook.position.y = -1.2 - drop; }
    // structure: columns per bay after the slab cures, cores climbing, deck forms on the west half
    COLS.forEach(([x, z], i) => { const b = Math.floor((x + 32) / 16) * 2 + (z < 0 ? 0 : 1), k = sstep(prog, 0.47 + b * 0.028 + 0.07, 0.47 + b * 0.028 + 0.12);
      tmpM.compose(tv.set(x, -D, z), tq.identity(), k > 0.01 ? ts.set(1, 3.6 * k, 1) : HIDE); colMesh.setMatrixAt(i, tmpM); });
    colMesh.instanceMatrix.needsUpdate = true;
    cores.forEach((m, i) => { const k = sstep(prog, 0.56 + i * 0.03, 0.98); m.visible = k > 0.01; m.scale.y = Math.max(0.01, 13 * k); });
    DECK.forEach(([x, z], i) => { const k = sstep(prog, 0.8 + (x + 28) / 56 * 0.15 + (i % 4) * 0.01, 0.84 + (x + 28) / 56 * 0.15 + (i % 4) * 0.01);
      tmpM.compose(tv.set(x, -0.25, z), tq.identity(), k > 0.5 ? ts.set(1, 1, 1) : HIDE); deck.setMatrixAt(i, tmpM); });
    deck.instanceMatrix.needsUpdate = true;
    // crew: clusters on the active bay, spotters by the excavators, a few by the trailer; positions jump per frame like a real timelapse
    const fr = Math.floor(wt * 14);
    for (let i = 0; i < NW; i++) {
      let x, z, y = 0; const r1 = H(i * 31 + fr), r2 = H(i * 17 + fr * 3 + 5);
      if (!working) { tmpM.compose(tv.set(0, 0, 0), tq.identity(), HIDE); crew.setMatrixAt(i, tmpM); continue; }
      if (i < 26 && prog > 0.38 && prog < 0.72) { const b = Math.min(7, bay + (i % 3 === 0 ? 1 : 0)); x = -32 + Math.floor(b / 2) * 16 + 2 + r1 * 12; z = (b % 2 ? 2 : -17) + r2 * 15; y = -D; }
      else if (i < 26 && prog >= 0.72) { const c = COLS[(i * 7 + fr) % COLS.length]; x = c[0] + (r1 - 0.5) * 3; z = c[1] + (r2 - 0.5) * 3; y = -D + (prog > 0.85 && x < 0 ? 3.75 : 0); }
      else if (i < 34 && digOn) { x = xf - 2 + r1 * 8; z = (i % 2 ? -1 : 1) * (20 + r2 * 4); }
      else { x = 40 + r1 * 25; z = -40 + r2 * 10; }
      tmpM.compose(tv.set(x, y, z), tq.setFromAxisAngle(YA, r1 * 6), ts.set(1, 1, 1)); crew.setMatrixAt(i, tmpM);
    }
    crew.instanceMatrix.needsUpdate = true;
    return { hour, prog, day: Math.floor(hour / 24) + 1, hd, sunL, night };
  }
  // clouds on the climb: six thin layers between 1.5 and 2.8 km, moonlit on top, lit orange from the city underneath.
  // Climbing through them hides the hand-over from the photos to the map; they thin out again before the globe takes over.
  const cloudU = { uFade: { value: 0 }, uT: { value: 0 }, uOrigin: U.uOrigin };
  const cloudMat = new THREE.ShaderMaterial({ uniforms: cloudU, transparent: true, depthWrite: false, side: THREE.DoubleSide,
    vertexShader: `uniform vec3 uOrigin; varying vec3 vL; varying float vD; void main(){ vec4 w=modelMatrix*vec4(position,1.); vL=w.xyz-uOrigin; vec4 mv=viewMatrix*w; vD=-mv.z; gl_Position=projectionMatrix*mv; }`,
    fragmentShader: GL + `uniform float uFade, uT; varying vec3 vL; varying float vD;
      void main(){
        vec2 p=vL.xz*.0011+vec2(vL.y*.0007,uT*.004);
        float c=fb(p)*.65+fb(p*3.1+7.)*.35;
        float cov=smoothstep(.36,.62,c), thick=smoothstep(.5,.85,c);
        // moonlit grey tops, thinner edges glowing sodium-orange from the city underneath
        vec3 col=mix(vec3(.11,.12,.15),vec3(.06,.065,.08),thick)+vec3(1.,.58,.24)*.22*(1.-thick)*cov;
        float a=cov*.62*uFade*smoothstep(80.,600.,vD);   // fade the slab right at the lens so it never pops
        gl_FragColor=vec4(col*a,a); }` });
  cloudMat.blending = THREE.CustomBlending; cloudMat.blendSrc = THREE.OneFactor; cloudMat.blendDst = THREE.OneMinusSrcAlphaFactor;
  const clouds = [1500, 1750, 2000, 2250, 2500, 2800].map(h => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), cloudMat); m.position.y = h; m.frustumCulled = false; m.renderOrder = 3; group.add(m); return m; });
  // ground quad follows the camera and scales with altitude so it always fills the frame
  function follow(camLocal, alt, cloudFade = 0, t = 0) {
    const s = Math.max(4000, alt * 12); ground.scale.set(s, 1, s); ground.position.x = camLocal.x; ground.position.z = camLocal.z;
    cloudU.uFade.value = cloudFade; cloudU.uT.value = t;
    clouds.forEach(m => { m.visible = cloudFade > 0.001; const cs = Math.max(20000, alt * 14); m.scale.set(cs, 1, cs); m.position.x = camLocal.x; m.position.z = camLocal.z; });
  }
  return { group, update, follow, uniforms: U, D, ready, readyAll };
}
