// D6.1 footer: GLSL for the Mars dusk. One sky model is shared by the sky dome, the environment map and the aerial
// perspective, so the haze on the ridge, the glass reflections and the sky are always the same light.
// Sky: dusty night base + twilight glow (azimuth-wide, thin, rises with the sun) + Henyey-Greenstein forward lobe
// (Mars dust scatters strongly forward; the small aureole runs a touch cooler, the broad band warm).
// Haze: exponential-height dust, optical depth integrated along the ray, inscatter = sky radiance toward the horizon.

// D6.1 shared film look: VERBATIM copy of CINE_GLSL in d5/post.js (ACES Hill fit + warm grade + grain). Change both or neither.
export const CINE_GLSL = /* glsl */ `
const mat3 cACI=mat3(.59719,.07600,.02840, .35458,.90834,.13383, .04823,.01566,.83777);
const mat3 cACO=mat3(1.60475,-.10208,-.00327, -.53108,1.10813,-.07276, -.07367,-.00605,1.07602);
vec3 cRRT(vec3 v){ vec3 a=v*(v+.0245786)-.000090537, b=v*(.983729*v+.4329510)+.238081; return a/b; }
// exposed scene-linear -> display-linear: a hair warm white balance, then ACES (Hill fit; three's ACESFilmic is this after its /0.6)
vec3 cineTone(vec3 c){ return clamp(cACO*cRRT(cACI*(c*vec3(1.025,1.,.96))),0.,1.); }
vec3 cineOETF(vec3 c){ c=max(c,0.); return mix(c*12.92, 1.055*pow(c,vec3(1./2.4))-.055, step(.0031308,c)); }
// display-encoded grade. Vibrance (rust ground and teal sky a touch richer, already-saturated plumes left alone),
// shadow toe lift (rich, not crushed; true black stays black), teal-leaning shadows, warm lifted highlights.
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
float cH12(vec2 p){ vec3 p3=fract(vec3(p.xyx)*.1031); p3+=dot(p3,p3.yzx+33.33); return fract((p3.x+p3.y)*p3.z); }
// light temporal grain on display values (strongest in the mids, like film) + a 1/255 dither so dark gradients never band
vec3 cineGrain(vec3 o, vec2 fc, float t, float amt){
  float g=cH12(fc+fract(t*7.31)*vec2(97.,57.))-.5, l=dot(o,vec3(.299,.587,.114));
  return o+g*amt*(.35+2.4*l*(1.-l))+(cH12(fc*1.37+13.)-.5)/255.;
}
`;

export const NOISE = /* glsl */ `
float fh(vec2 p){ p=fract(p*vec2(443.897,441.423)); p+=dot(p,p.yx+19.19); return fract((p.x+p.y)*p.x); }
float fvn(vec2 x){ vec2 i=floor(x),f=fract(x); f=f*f*(3.-2.*f);
  return mix(mix(fh(i),fh(i+vec2(1,0)),f.x),mix(fh(i+vec2(0,1)),fh(i+vec2(1,1)),f.x),f.y); }
float ffbm(vec2 p){ float v=0.,a=.5; for(int i=0;i<FBM_OCT;i++){ v+=a*fvn(p); p=p*2.07+vec2(5.3,1.7); a*=.5; } return v; }
`;

// uniforms: uSun (unit, world), uGlow (overall glow radiance), uLift (0..1 sunrise height), uStars, uTime
export const SKY = /* glsl */ `
uniform vec3 uSun; uniform float uGlow, uLift, uStars, uTime;
float hg(float c, float g){ float g2=g*g; return (1.-g2)/(12.566*pow(max(1.+g2-2.*g*c,1e-4),1.5)); }
vec3 skyRad(vec3 d, float stars){
  float h=d.y, hc=max(h,0.);
  vec2 dh=normalize(d.xz+vec2(1e-5)), sh=normalize(uSun.xz+vec2(1e-5));
  float az=acos(clamp(dot(dh,sh),-1.,1.));
  float cg=dot(d,uSun);
  // night base: dusty, a little brighter and browner at the horizon
  vec3 c=mix(vec3(.0085,.0046,.0030), vec3(.0011,.0010,.0016), pow(smoothstep(0.,.55,hc),.5));
  // twilight band: wide in azimuth, thin in elevation; grows taller and wider as the sun comes up
  float sw=.19+.07*uLift, H=.015+.01*uLift;
  float band=exp(-az*az/(sw*sw))*exp(-hc/H);
  float aur=exp(-az*az/(.008+.01*uLift))*exp(-hc/(H*.6));
  float fwd=hg(cg,.85)*exp(-hc/(H*1.4));
  vec3 warm=vec3(1.,.22,.05), amber=vec3(1.,.37,.1), core=vec3(1.,.5,.24);
  c+=uGlow*(warm*band*.32 + amber*aur*1.35 + core*fwd*.3);
  // the antisolar sky stays dark; a faint warm skirt runs the whole horizon
  c+=uGlow*vec3(.012,.004,.0015)*exp(-hc/.03);
  // below the horizon (only ever seen past the ridge): fade out
  c*=h<0. ? exp(h*24.) : 1.;
#ifdef STARS
  if(stars>0.){
    vec2 g=vec2(atan(d.z,d.x), asin(clamp(d.y,-1.,1.)))*190.; vec2 id=floor(g), f=fract(g)-.5;
    float r=fh(id+3.1);
    if(r>.993){ vec2 o=(vec2(fh(id+7.7),fh(id+1.3))-.5)*.6; float s=exp(-dot(f-o,f-o)*90.);
      c+=vec3(.75,.8,1.)*s*(r-.993)*12.*stars*smoothstep(.04,.35,h)*(1.-smoothstep(.0,1.,band*uGlow*4.)); }
  }
#endif
  return c;
}
`;

// fullscreen triangle in the scene, drawn last at the far plane (early-z skips the covered pixels)
export const SKY_VERT = /* glsl */ `
varying vec3 vDir;
void main(){
  vec2 p=position.xy;
  vec4 v=inverse(projectionMatrix)*vec4(p,1.,1.); v/=v.w;
  vDir=(inverse(viewMatrix)*vec4(v.xyz,0.)).xyz;
  gl_Position=vec4(p,1.,1.); gl_Position.z=gl_Position.w*.99999;
}`;
export const SKY_FRAG = /* glsl */ `
${NOISE}
${SKY}
varying vec3 vDir;
void main(){ gl_FragColor=vec4(skyRad(normalize(vDir),uStars),1.); }`;

// equirect bake of the sky (for the PMREM environment)
export const EQ_FRAG = /* glsl */ `
${NOISE}
${SKY}
varying vec2 vUv;
void main(){ float ph=(vUv.x-.5)*6.2831853, th=(vUv.y-.5)*3.1415927;
  vec3 d=vec3(cos(th)*cos(ph), sin(th), cos(th)*sin(ph));
  gl_FragColor=vec4(skyRad(d,0.),1.); }`;

export const FS_VERT = /* glsl */ `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`;

// aerial perspective + drifting dust on scene pixels (sky pixels already carry it)
export const ATMOS_FRAG = /* glsl */ `
${NOISE}
${SKY}
uniform sampler2D tColor, tDepth; uniform mat4 uInvProj, uCamWorld; uniform vec3 uCamPos;
uniform float uSigma, uHd, uDrift, uHazeK; uniform vec2 uWind;
varying vec2 vUv;
void main(){
  vec3 col=texture2D(tColor,vUv).rgb; float z=texture2D(tDepth,vUv).r;
  if(z>=.99999){ gl_FragColor=vec4(col,1.); return; }
  vec4 v=uInvProj*vec4(vUv*2.-1., z*2.-1., 1.); v/=v.w;
  vec3 w=(uCamWorld*vec4(v.xyz,1.)).xyz, r=w-uCamPos; float dist=length(r); vec3 d=r/dist;
  // optical depth through exp(-y/Hd) dust from the eye to the hit point
  float y0=uCamPos.y, dy=r.y, k=dy/uHd;
  float od=uSigma*dist*exp(-y0/uHd)*(abs(k)>1e-3 ? (1.-exp(-k))/k : 1.);
  // dust drift: density varies with a slowly advected 2D field sampled where the ray is most of its way
  vec2 q=(uCamPos.xz+d.xz*min(dist,900.)*.7)*.0045+uWind*uTime;
  od*=mix(1.,.55+.9*ffbm(q),uDrift);
  float T=exp(-od);
  vec3 ins=skyRad(normalize(vec3(d.x,max(d.y,.012),d.z)),0.)*uHazeK;
  gl_FragColor=vec4(col*T+ins*(1.-T),1.);
}`;

// bloom: soft-knee bright pass at half res, then separable Gaussian per mip (5 linear taps = 9-texel kernel)
export const PRE_FRAG = /* glsl */ `
uniform sampler2D tSrc; uniform vec2 uTexel; uniform float uThr, uKnee; varying vec2 vUv;
vec3 tap(vec2 o){ return texture2D(tSrc,vUv+o*uTexel).rgb; }
float lum(vec3 c){ return dot(c,vec3(.2126,.7152,.0722)); }
void main(){
  vec3 a=tap(vec2(-1,-1)), b=tap(vec2(1,-1)), c=tap(vec2(-1,1)), e=tap(vec2(1,1));
  // Karis average: no fireflies from single hot pixels
  float wa=1./(1.+lum(a)), wb=1./(1.+lum(b)), wc=1./(1.+lum(c)), we=1./(1.+lum(e));
  vec3 m=(a*wa+b*wb+c*wc+e*we)/(wa+wb+wc+we);
  float l=lum(m), s=clamp(l-uThr+uKnee,0.,2.*uKnee); s=s*s/(4.*uKnee+1e-5);
  gl_FragColor=vec4(m*max(s,l-uThr)/max(l,1e-4),1.);
}`;
export const BLUR_FRAG = /* glsl */ `
uniform sampler2D tSrc; uniform vec2 uDir; varying vec2 vUv;
void main(){
  vec3 c=texture2D(tSrc,vUv).rgb*.227027;
  c+=(texture2D(tSrc,vUv+uDir*1.3846154).rgb+texture2D(tSrc,vUv-uDir*1.3846154).rgb)*.3162162;
  c+=(texture2D(tSrc,vUv+uDir*3.2307692).rgb+texture2D(tSrc,vUv-uDir*3.2307692).rgb)*.0702703;
  gl_FragColor=vec4(c,1.);
}`;

// final: bloom, logo halo, exposure, shared tone + grade (CINE_GLSL, same as the Mars run), vignette (lower half held down
// for the type), sRGB, shared grain
export const FINAL_FRAG = /* glsl */ `
${CINE_GLSL}
uniform sampler2D tSrc, tB0, tB1, tB2, tB3, tB4; uniform vec4 uBw; uniform float uBw4, uBloom, uExp, uGrain, uTime, uVig, uLow, uTop;
uniform vec4 uLogo; uniform float uHalo; uniform vec3 uHaloC; uniform vec2 uRes;
varying vec2 vUv;
void main(){
  vec3 c=texture2D(tSrc,vUv).rgb;
  vec3 b=texture2D(tB0,vUv).rgb*uBw.x+texture2D(tB1,vUv).rgb*uBw.y+texture2D(tB2,vUv).rgb*uBw.z+texture2D(tB3,vUv).rgb*uBw.w;
#ifdef B5
  b+=texture2D(tB4,vUv).rgb*uBw4;
#endif
  c+=b*uBloom;
  // halo: a faint warm lift of the haze around the logotype (uLogo = centre xy, half size zw, in uv, y up)
  vec2 hq=(vUv-uLogo.xy)/max(uLogo.zw*vec2(1.25,2.2),vec2(1e-3));
  c+=uHaloC*uHalo*exp(-dot(hq,hq)*1.6);
  c=cineTone(c*uExp);
  // vignette: edges (Figma ellipses), the lower half held down for the logotype and links, top melts into the page
  float yt=1.-vUv.y; vec2 e=(vUv-vec2(.5,.56))*vec2(1.,1.25);
  float v=mix(1.,1.-uVig,smoothstep(.3,.95,length(e)*1.3));
  v*=mix(1.,1.-uLow,smoothstep(.33,.78,yt));
  v*=smoothstep(0.,uTop,yt);
  c*=v;
  vec3 o=cineGrade(cineOETF(c));
  gl_FragColor=vec4(clamp(cineGrain(o,gl_FragCoord.xy,uTime,uGrain),0.,1.),1.);
}`;
