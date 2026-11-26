import{d as Ut,f as It,g as Qe,h as Ot}from"./chunk-SKKE744E.js";import{a as Tt}from"./chunk-FCTCDFK5.js";var po=`
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
`,Xe=`
float fh(vec2 p){ p=fract(p*vec2(443.897,441.423)); p+=dot(p,p.yx+19.19); return fract((p.x+p.y)*p.x); }
float fvn(vec2 x){ vec2 i=floor(x),f=fract(x); f=f*f*(3.-2.*f);
  return mix(mix(fh(i),fh(i+vec2(1,0)),f.x),mix(fh(i+vec2(0,1)),fh(i+vec2(1,1)),f.x),f.y); }
float ffbm(vec2 p){ float v=0.,a=.5; for(int i=0;i<FBM_OCT;i++){ v+=a*fvn(p); p=p*2.07+vec2(5.3,1.7); a*=.5; } return v; }
`,Ze=`
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
`,Vt=`
varying vec3 vDir;
void main(){
  vec2 p=position.xy;
  vec4 v=inverse(projectionMatrix)*vec4(p,1.,1.); v/=v.w;
  vDir=(inverse(viewMatrix)*vec4(v.xyz,0.)).xyz;
  gl_Position=vec4(p,1.,1.); gl_Position.z=gl_Position.w*.99999;
}`,Wt=`
${Xe}
${Ze}
varying vec3 vDir;
void main(){ gl_FragColor=vec4(skyRad(normalize(vDir),uStars),1.); }`,qt=`
${Xe}
${Ze}
varying vec2 vUv;
void main(){ float ph=(vUv.x-.5)*6.2831853, th=(vUv.y-.5)*3.1415927;
  vec3 d=vec3(cos(th)*cos(ph), sin(th), cos(th)*sin(ph));
  gl_FragColor=vec4(skyRad(d,0.),1.); }`,Kt="varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }",Nt=`
${Xe}
${Ze}
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
}`,Rt=`
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
}`,Yt=`
uniform sampler2D tSrc; uniform vec2 uDir; varying vec2 vUv;
void main(){
  vec3 c=texture2D(tSrc,vUv).rgb*.227027;
  c+=(texture2D(tSrc,vUv+uDir*1.3846154).rgb+texture2D(tSrc,vUv-uDir*1.3846154).rgb)*.3162162;
  c+=(texture2D(tSrc,vUv+uDir*3.2307692).rgb+texture2D(tSrc,vUv-uDir*3.2307692).rgb)*.0702703;
  gl_FragColor=vec4(c,1.);
}`,$t=`
${po}
uniform sampler2D tSrc, tB0, tB1, tB2, tB3, tB4; uniform vec4 uBw; uniform float uBw4, uBloom, uExp, uGrain, uTime, uVig, uLow, uTop;
uniform vec4 uLogo; uniform float uHalo; uniform vec3 uHaloC; uniform vec2 uRes;
uniform float uSeam, uSeamH; uniform vec3 uSeamC;
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
  o=clamp(cineGrain(o,gl_FragCoord.xy,uTime,uGrain),0.,1.);
  // seam (homepage only, 0 elsewhere): under the film the top melts into the seam colour instead of black, the same display
  // colour the film's lower edge fades into, so the launch haze runs on into the dusk with no band between
  if(uSeam>0.){ float w=1.-smoothstep(0.,uSeamH,yt); o=mix(o,uSeamC,uSeam*w*w*(3.-2.*w)); }
  gl_FragColor=vec4(o,1.);
}`;var j=[0,1.7,0],He=.3,Ee=30,xo=40,et={hfov:30,horizon:.36},he=-.1,Je=[-7.5,-1.6],go=.03,wo=120,yo={x:.5,y:.595,w:.85,h:.267},$={push:6,side:.8,sideT:[75,113],breathe:1.2,breatheT:53},Mo=(t,l,p)=>{let i=Math.min(1,Math.max(0,(p-t)/(l-t)));return i*i*(3-2*i)},tt=t=>t*t*(3-2*t);function jt(t,l){let p=t/l,i=p<.85,u=i?et.hfov:xo,F=i?et.horizon:He,s=Math.min(70,Math.max(Ee,2*Math.atan(Math.tan(u*Math.PI/360)/p)*180/Math.PI));return{vfov:s,pitch:Math.atan((1-2*F)*Math.tan(s*Math.PI/360)),horizon:F,port:i}}function Ao(t,l,p=0){let i=jt(t,l),u=j[2]+$.push*(1-tt(p));return{eye:[j[0],j[1],u],look:[0,j[1]-Math.tan(i.pitch)*1e3,u-1e3],vfov:i.vfov,pitch:i.pitch,aspect:t/l,sunAz:he}}var So=()=>new Promise(t=>setTimeout(t,0)),bo=t=>typeof requestIdleCallback=="function"?requestIdleCallback(t,{timeout:1500}):setTimeout(t,200);function Fe(t){let l=p=>{let i=Math.sin(p*127.1+t*311.7)*43758.5453;return(i-Math.floor(i))*2-1};return p=>{let i=Math.floor(p),u=p-i,F=u*u*(3-2*u);return l(i)*(1-F)+l(i+1)*F}}function Go({THREE:t,host:l,quality:p="high",base:i,canvas:u,gate:F=null,prCap:s=null}={}){let A=u||document.createElement("canvas");u||(A.className="d61-footer-canvas",Object.assign(A.style,{position:"absolute",left:0,top:0,width:"100%",height:"100%",display:"block"}),l.appendChild(A));let Q=new t.WebGLRenderer({canvas:A,antialias:!1,alpha:!1,depth:!1,stencil:!1,powerPreference:"high-performance"});try{return zo({THREE:t,host:l,quality:p,base:i,canvas:A,cvIn:u,renderer:Q,gate:F,prCap:s})}catch(f){try{Q.dispose(),Q.forceContextLoss?.()}catch{}throw u||A.remove(),f}}function zo({THREE:t,host:l,quality:p,base:i,canvas:u,cvIn:F,renderer:s,gate:A,prCap:Q}){let f=p!=="low",ve=typeof location<"u"&&/[?&]debug(=|&|$)/.test(location.search),X=t.Vector3,Qt=String(i||new URL("footer/",Tt).href).replace(/\/?$/,"/");s.debug.checkShaderErrors=ve;let ot=Math.min(typeof devicePixelRatio=="number"&&devicePixelRatio>0?devicePixelRatio:1,2),me=Math.min(ot,f?1.5:1.25,It),ne=me,pe=Q>0?Q:1/0,de=()=>Math.max(.5,Math.min(me,ne,pe)),k=de();s.setPixelRatio(k),s.toneMapping=t.NoToneMapping,s.outputColorSpace=t.SRGBColorSpace,s.info.autoReset=!1;let g=Math.max(1,l.clientWidth),w=Math.max(1,l.clientHeight);s.setSize(g,w,!1);let b=new t.Scene,d=new t.PerspectiveCamera(Ee,g/w,.5,6e3),T=new X,z={uSun:{value:T},uGlow:{value:1},uLift:{value:1},uStars:{value:f?1:0},uTime:{value:0}},Ae={FBM_OCT:f?3:2,...f?{STARS:""}:{}},Z=new t.BufferGeometry;Z.setAttribute("position",new t.BufferAttribute(new Float32Array([-1,-1,0,3,-1,0,-1,3,0]),3)),Z.setAttribute("uv",new t.BufferAttribute(new Float32Array([0,0,2,0,0,2]),2));let at=new t.ShaderMaterial({uniforms:z,defines:Ae,vertexShader:Vt,fragmentShader:Wt,depthWrite:!1,fog:!1}),Ge=new t.Mesh(Z,at);Ge.frustumCulled=!1,Ge.renderOrder=1e6,b.add(Ge);let V=new t.DirectionalLight(16751196,0);b.add(V,V.target);let Be=new t.HemisphereLight(3811884,1707014,.35);b.add(Be);let Xt=new t.Color(1,.56,.3),Zt=new t.Color(1,.38,.16),W=null,nt=null;function Jt(){let e=new t.Group,o=new t.Mesh(new t.PlaneGeometry(9e3,6e3,1,1).rotateX(-Math.PI/2),new t.MeshStandardMaterial({color:3808272,roughness:1}));o.position.z=-2900,e.add(o);let a=160,n=new t.PlaneGeometry(7e3,200,a,1),r=n.attributes.position;for(let m=0;m<r.count;m++){let x=r.getX(m),P=r.getY(m)>0;r.setY(m,P?45+30*Math.sin(x*.0021)+18*Math.sin(x*.0067+1):-20)}n.computeVertexNormals();let v=new t.Mesh(n,new t.MeshStandardMaterial({color:6959128,roughness:1}));v.position.z=-2100,e.add(v);let c=new t.MeshPhysicalMaterial({color:2241314,roughness:.15,metalness:0,clearcoat:1}),S=new t.MeshStandardMaterial({color:10133670,roughness:.3,metalness:1}),O=new t.MeshStandardMaterial({color:9078144,roughness:.6}),Y=(m,x,P)=>{let D=new t.Mesh(new t.SphereGeometry(m,32,16,0,Math.PI*2,0,Math.PI/2),c);D.position.set(x,0,P),e.add(D)};Y(22,-60,-320),Y(10,-170,-360),Y(9,110,-330);for(let m=0;m<9;m++){let x=new t.Mesh(new t.BoxGeometry(14,7,10),O);x.position.set(-20+m*16,3.5,-340),e.add(x)}for(let[m,x,P]of[[70,-360,50],[125,-390,50]]){let D=new t.Mesh(new t.CylinderGeometry(4.5,4.5,P,24),S);D.position.set(m,P/2,x),e.add(D)}return{root:e,applyTextures(){},placeholder:!0}}async function Ht(){try{let e=await import("./foot-model-CUFJHQLA.js");if(typeof e.buildFooterScene=="function")return e.buildFooterScene({THREE:t,quality:f?"high":"low"})}catch(e){ve&&console.warn("d61 footer: model not loaded, placeholder",e)}return Jt()}let rt=null,st=1,De=0;function Et(){let e=W?.anchors;e&&(e.foliage?.value&&(W.update||e.foliage.value.copy(rt),e.foliage.value.multiplyScalar(.3+.7*De)),e.glass&&(e.glass.envMapIntensity=st*(.75+.4*De)))}function eo(e){W=e,nt=e.root,b.add(nt),rt=e.anchors?.foliage?.value?.clone?.()??null,st=e.anchors?.glass?.envMapIntensity??1;for(let o of e.lights||[])o.parent||b.add(o)}let it=t.HalfFloatType,re={type:it,depthBuffer:!1,minFilter:t.LinearFilter,magFilter:t.LinearFilter,generateMipmaps:!1},xe=new t.DepthTexture(1,1);xe.type=t.UnsignedIntType;let se=new t.WebGLRenderTarget(1,1,{type:it,samples:Ut??(f?4:2),depthBuffer:!0,depthTexture:xe}),J=new t.WebGLRenderTarget(1,1,re),y=f?5:4,ie=new t.WebGLRenderTarget(1,1,re),C=[],H=[];for(let e=0;e<y;e++)C.push(new t.WebGLRenderTarget(1,1,re)),H.push(new t.WebGLRenderTarget(1,1,re));let ge=new t.WebGLRenderTarget(f?256:128,f?128:64,{...re});ge.texture.mapping=t.EquirectangularReflectionMapping;let ct=new t.PMREMGenerator(s),we=null,lt=-1,ut=0,ft=new t.OrthographicCamera(-1,1,1,-1,0,1),ke=new t.Mesh(Z);ke.frustumCulled=!1;let ht=new t.Scene;ht.add(ke);let ce=(e,o,a={})=>new t.ShaderMaterial({uniforms:o,defines:a,vertexShader:Kt,fragmentShader:e,depthTest:!1,depthWrite:!1}),vt=ce(qt,z,Ae),_={...z,tColor:{value:se.texture},tDepth:{value:xe},uInvProj:{value:new t.Matrix4},uCamWorld:{value:new t.Matrix4},uCamPos:{value:new X},uSigma:{value:1/2600},uHd:{value:900},uDrift:{value:f?.6:.4},uHazeK:{value:1},uWind:{value:new t.Vector2(.04,.012)}},_e=ce(Nt,_,Ae),ye=ce(Rt,{tSrc:{value:J.texture},uTexel:{value:new t.Vector2},uThr:{value:.55},uKnee:{value:.35}}),G=[];for(let e=0;e<y*2;e++)G.push(ce(Yt,{tSrc:{value:null},uDir:{value:new t.Vector2}}));let h={tSrc:{value:J.texture},tB0:{value:C[0].texture},tB1:{value:C[1].texture},tB2:{value:C[2].texture},tB3:{value:C[3].texture},tB4:{value:C[y-1].texture},uBw:{value:new t.Vector4(.46,.3,.15,.06)},uBw4:{value:.03},uBloom:{value:.5},uExp:{value:1},uGrain:{value:f?.04:.03},uTime:{value:0},uVig:{value:.75},uLow:{value:.82},uTop:{value:.1},uLogo:{value:new t.Vector4},uHalo:{value:0},uHaloC:{value:new t.Color(.06,.022,.009)},uRes:{value:new t.Vector2},uSeam:{value:0},uSeamC:{value:new X},uSeamH:{value:He}},Ue=ce($t,h,y>4?{B5:""}:{});function E(e,o){ke.material=e,s.setRenderTarget(o),s.render(ht,ft)}let mt=[.46,.3,.15,.06,.03],Me=y,Se=3;function to(e){Se=Math.max(0,Math.min(3,Math.round(+e||0))),Me=Math.min(y,Se>=2?5:Se===1?4:3);let o=mt.slice(0,y);o[y-1]=mt.slice(y-1).reduce((r,v)=>r+v,0);let a=0;for(let r=0;r<Me;r++)a+=o[r];let n=r=>r<Me?o[r]/a:0;h.uBw.value.set(n(0),n(1),n(2),n(3)),h.uBw4.value=y>4?n(4):0}let U=null,I={vfov:Ee,pitch:0,top:.2};function pt(){let e=U?{x:(U.x+U.w/2)/g,y:(U.y+U.h/2)/w,w:U.w/g,h:U.h/w}:yo;h.uLogo.value.set(e.x,1-e.y,e.w/2,e.h/2)}function Ie(){let e=Math.max(1,Math.round(g*k)),o=Math.max(1,Math.round(w*k));se.setSize(e,o),J.setSize(e,o);let a=Math.max(1,e>>1),n=Math.max(1,o>>1);ie.setSize(a,n),ye.uniforms.uTexel.value.set(.5/a,.5/n);let r=a,v=n;for(let c=0;c<y;c++){let S=Math.max(1,c?r>>1:r),O=Math.max(1,c?v>>1:v);H[c].setSize(S,O),C[c].setSize(S,O),G[c*2].uniforms.tSrc.value=c?C[c-1].texture:ie.texture,G[c*2].uniforms.uDir.value.set(1/S,0),G[c*2+1].uniforms.tSrc.value=H[c].texture,G[c*2+1].uniforms.uDir.value.set(0,1/O),r=S,v=O}h.uRes.value.set(e,o)}function dt(){let e=g/w,o=jt(g,w),a=o.port;I.vfov=o.vfov,I.pitch=o.pitch,I.top=I.vfov*Math.PI/360-I.pitch,h.uTop.value=a?.06:.14,h.uSeamH.value=a?et.horizon:He,d.fov=I.vfov,d.aspect=e,d.updateProjectionMatrix(),pt()}let q=0,xt=0,gt=0,Oe=0,Te=0,ee=0,oo=Fe(3),ao=Fe(7),no=Fe(11),ro=Fe(17),wt=new X,le=new X;function yt(e){Oe+=(xt-Oe)*.05,Te+=(gt-Te)*.05;let o=2*Math.PI,a=$.side*(.75*Math.sin(o*e/$.sideT[0])+.25*Math.sin(o*e/$.sideT[1]+1.3)),n=$.push*(1-tt(q))-$.breathe*(.5-.5*Math.cos(o*e/$.breatheT));le.set(j[0]+a+Oe*.45+.03*oo(e*.13),j[1]-Te*.12+.015*ao(e*.17),j[2]+n),d.position.copy(le),wt.set(le.x*.6,le.y-Math.tan(I.pitch)*1e3,le.z-1e3),d.lookAt(wt),d.updateMatrixWorld()}let K={glow:1,haze:1,sigma:1,key:1,bloom:1,exposure:1};function Mt(e,o){let a=tt(e),n=Mo(.82,1,e);De=a;let r=1+n*(.17*no(o*.16)+.07*ro(o*.41)),v=(Je[0]+(Je[1]-Je[0])*a)*Math.PI/180;T.set(Math.sin(he)*Math.cos(v),Math.sin(v),-Math.cos(he)*Math.cos(v));let c=(.22+.78*a)*r;z.uGlow.value=1.35*c*K.glow,z.uLift.value=a,z.uTime.value=o,z.uStars.value=f?1-.75*a:0,V.position.set(Math.sin(he)*1e3,150+80*a,-Math.cos(he)*1e3),V.target.position.set(0,0,0),V.color.copy(Zt).lerp(Xt,a),V.intensity=(.08+.5*a*r)*K.key,Be.intensity=.05+.04*a,_.uSigma.value=1/3200*(1.15-.2*a)*K.sigma,_.uHazeK.value=(.32+.16*a)*K.haze,_.uDrift.value=(f?.9:.7)*(.4+.6*n),h.uExp.value=(.82+.06*a)*K.exposure,h.uBloom.value=(.16+.16*a)*K.bloom,h.uHalo.value=(.25+.75*a)*(1+1.5*(r-1))}let be=[0,0,0],St=new X,so=[.59719,.076,.0284,.35458,.90834,.13383,.04823,.01566,.83777],io=[1.60475,-.10208,-.00327,-.53108,1.10813,-.07276,-.07367,-.00605,1.07602],bt=(e,o,a,n,r)=>(r[0]=e[0]*o+e[3]*a+e[6]*n,r[1]=e[1]*o+e[4]*a+e[7]*n,r[2]=e[2]*o+e[5]*a+e[8]*n,r),Ve=e=>(e*(e+.0245786)-90537e-9)/(e*(.983729*e+.432951)+.238081),We=e=>(e=Math.max(0,Math.min(1,e)),e<=.0031308?e*12.92:1.055*e**(1/2.4)-.055),co=e=>(e=Math.min(1,Math.max(0,e)),e*e*(3-2*e));function lo(e,o){let a=z.uGlow.value,n=z.uLift.value,r=Math.max(e.y,0),v=Math.hypot(e.x,e.z)||1,c=Math.hypot(T.x,T.z)||1,S=Math.acos(Math.max(-1,Math.min(1,(e.x*T.x+e.z*T.z)/(v*c)))),O=e.dot(T),Y=Math.sqrt(co(r/.55)),m=.19+.07*n,x=.015+.01*n,P=Math.exp(-S*S/(m*m))*Math.exp(-r/x),D=Math.exp(-S*S/(.008+.01*n))*Math.exp(-r/(x*.6)),$e=(1-.7225)/(12.566*Math.max(1+.7225-1.7*O,1e-4)**1.5)*Math.exp(-r/(x*1.4)),je=Math.exp(-r/.03);o[0]+=.0085+(.0011-.0085)*Y+a*(P*.32+D*1.35+$e*.3+.012*je),o[1]+=.0046+(.001-.0046)*Y+a*(.22*P*.32+.37*D*1.35+.5*$e*.3+.004*je),o[2]+=.003+(.0016-.003)*Y+a*(.05*P*.32+.1*D*1.35+.24*$e*.3+.0015*je)}let N=[0,0,0],L=[0,0,0],ze=[0,0,0];function zt(){N[0]=N[1]=N[2]=0;let e=9,o=.9*I.top,a=Math.atan(Math.tan(d.fov*Math.PI/360)*d.aspect);for(let r=0;r<e;r++){let v=-a+2*a*r/(e-1);St.set(Math.sin(v)*Math.cos(o),Math.sin(o),-Math.cos(v)*Math.cos(o)),lo(St,N)}let n=h.uExp.value/e;return bt(so,N[0]*n*1.025,N[1]*n,N[2]*n*.96,L),L[0]=Ve(L[0]),L[1]=Ve(L[1]),L[2]=Ve(L[2]),bt(io,L[0],L[1],L[2],ze),be[0]=We(ze[0]),be[1]=We(ze[1]),be[2]=We(ze[2]),be}function Ct(e){let o=performance.now();!e&&(Math.abs(q-lt)<go||o-ut<wo)||(lt=q,ut=o,E(vt,ge),we=ct.fromEquirectangular(ge.texture,we),b.environment=we.texture)}let te=0,Lt=0,qe=0,Ce=0,Pt=0;function ue(e){let o=e/1e3,a=te?Math.min(.1,o-te):1/60;te=o,ee+=a,s.info.reset(),yt(ee),Mt(q,ee),W?.update?.(ee),Et(),Ct(!1),s.setRenderTarget(se),s.render(b,d),_.uInvProj.value.copy(d.projectionMatrixInverse),_.uCamWorld.value.copy(d.matrixWorld),_.uCamPos.value.copy(d.position),E(_e,J),E(ye,ie);for(let n=0;n<Me;n++)E(G[n*2],H[n]),E(G[n*2+1],C[n]);if(h.uTime.value=ee,h.uSeam.value>0){let n=zt();h.uSeamC.value.set(n[0],n[1],n[2])}if(E(Ue,null),f&&B&&(qe+=a/Bt,Ce++,Ce>=90)){let n=qe/Ce;qe=Ce=0,n>1/45&&ne>1&&(ne=Math.max(1,ne-.25))}de()!==k&&e-Pt>400&&Gt(),Lt++}function Ft(e,o,a,n=null){let r=s.getRenderTarget();s.setRenderTarget(e);try{return s.extensions.has("KHR_parallel_shader_compile")?s.compileAsync(o,a,n):(s.compile(o,a,n),Promise.resolve())}finally{s.setRenderTarget(r)}}function Le(e,o){let a=new t.Scene,n=new t.Mesh(Z,e);return n.frustumCulled=!1,a.add(n),Ft(o,a,ft)}function uo(){return Promise.all([Ft(se,b,d),Le(_e,J),Le(ye,ie),Le(G[0],H[0]),Le(Ue,null)])}let R=null,Ke=!1;function At(){Ke||(Ke=!0,setTimeout(fo,30))}function fo(){if(Ke=!1,!(M||!R))try{W?.applyTextures?.(R)}catch(e){console.warn("d61 footer textures:",e)}}function ho(){import("./foot-tex-PXDMWWA5.js").then(e=>{if(M||!e.loadFooterTextures)return;let o=(e.TEX_ROLES||[]).filter(a=>a!=="dusk_sky");R=e.loadFooterTextures({THREE:t,renderer:s,quality:f?"high":"low",base:Qt,...o.length?{roles:o}:{}}),R?.onReady?R.onReady(At):R?.ready?.then(At)}).catch(()=>{})}function Gt(){k=de(),s.setPixelRatio(k),s.setSize(g,w,!1),Ie()}let B=!1,oe=0,M=!1,Ne=!1,Bt=1,Re=!1,Dt=Qe?Ot(Qe):null,Ye=e=>{if(B&&(oe=requestAnimationFrame(Ye),!!ae)){if(A&&!A()){Re=!0;return}Dt&&!Dt(e)||(Bt=Re?2:1,Re=!1,ue(e))}},kt=()=>{Ne=document.hidden,Ne?cancelAnimationFrame(oe):B&&(te=0,oe=requestAnimationFrame(Ye))};document.addEventListener("visibilitychange",kt);function vo(){let e=Math.max(1,l.clientWidth),o=Math.max(1,l.clientHeight);e===g&&o===w||(g=e,w=o,s.setSize(g,w,!1),u.style.width=u.style.height="100%",Ie(),dt(),!B&&ae&&ue(performance.now()))}let ae=0;Ie(),dt();let Pe=performance.now(),fe={},mo=(async()=>{let e=await Ht();if(M)return _t(e),!1;eo(e),fe.model=performance.now()-Pe,yt(0),Mt(q,0),Ct(!0),fe.env=performance.now()-Pe;try{await uo()}catch(o){ve&&console.warn("d61 footer compile:",o)}return fe.compile=performance.now()-Pe,M||(await So(),M)?!1:(ue(performance.now()),ae=1,fe.ready=performance.now()-Pe,bo(()=>{M||ho()}),!0)})();function _t(e){e?.dispose?.(),e?.root?.traverse(o=>{o.geometry?.dispose();for(let a of[].concat(o.material||[])){for(let n in a)a[n]?.isTexture&&a[n].dispose();a.dispose()}})}return{ready:mo,renderer:s,scene:b,camera:d,fx:{sky:z,atmos:_,final:h,glowLight:V,hemi:Be,tune:K},setProgress(e){let o=Math.min(1,Math.max(0,+e||0));o!==q&&(q=o,Pt=performance.now())},setPointer(e,o){xt=Math.max(-1,Math.min(1,+e||0)),gt=Math.max(-1,Math.min(1,+o||0))},setLogoRect(e){U=e?{x:e.x??e.left,y:e.y??e.top,w:e.w??e.width,h:e.h??e.height}:null,pt()},start(){B||M||(B=!0,te=0,Ne||(oe=requestAnimationFrame(Ye)))},stop(){B=!1,cancelAnimationFrame(oe)},renderOnce(e){M||!ae||(e!=null&&(ee=+e,te=0),ue(performance.now()))},setPostQuality:to,getPostQuality:()=>Se,setPixelRatio(e){ne=Math.max(.5,Math.min(me,+e||me))},capPixelRatio(e){pe=e>0?e:1/0,!B&&ae&&!M&&de()!==k&&(Gt(),ue(performance.now()))},setSeam(e){h.uSeam.value=Math.max(0,Math.min(1,+e||0))},seamColor:()=>zt().slice(),resize:vo,stats(){let e=s.info;return{calls:e.render.calls,triangles:e.render.triangles,pixelRatio:k,prCap:pe===1/0?null:pe,seam:h.uSeam.value,dpr:ot,frames:Lt,programs:e.programs?.length,stage:ae,timing:fe,placeholder:!!W?.placeholder}},dispose(){if(!M){B=!1,M=!0,cancelAnimationFrame(oe),document.removeEventListener("visibilitychange",kt);try{R?.dispose?.()}catch{}_t(W);for(let e of[at,vt,_e,ye,Ue,...G])e.dispose();for(let e of[se,J,ie,ge,...C,...H])e.dispose();xe.dispose(),we?.dispose(),ct.dispose(),Z.dispose(),b.environment=null,s.dispose(),s.forceContextLoss?.(),F||u.remove()}}}}export{Ao as a,Go as b};
