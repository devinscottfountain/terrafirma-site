// Film post stack (from the D5 prototype). The cine chain is always on; the legacy D5 chain is still built underneath it (see README, open issues).
// Chain: ScenePass(+depth) -> HDR FX [contact AO -> long-exposure trails -> camera motion blur] -> Bokeh DOF -> Bloom -> AutoExposure+ToneMap -> SMAA -> Lens (CA, vignette, grain, barrel)
// All look parameters (bloom, bokeh, lens) match d5.current.js.
// cine (D6.1, opt-in per call: createPost({..., cine: true})): a separate film chain, see CINE below. Without it every pass,
// program and pixel is the D5/D6 stack, unchanged.
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';
import { Pass, FullScreenQuad } from 'three/addons/postprocessing/Pass.js';

const FS_VERT = `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`;

export function createPost({ THREE, renderer, scene, cam, cine = true, low = false }) {
  const pr = renderer.getPixelRatio(), size = renderer.getSize(new THREE.Vector2());
  const W = Math.max(1, Math.floor(size.x * pr)), H = Math.max(1, Math.floor(size.y * pr));

  // ---------------------------------------------------------------- tunables (live objects, change any time)
  const motion = {
    enabled: true,
    shutter: 0.6,     // fraction of the 60fps frame the virtual shutter stays open (0.5 = 180 degree shutter)
    maxLen: 0.035,    // max blur length, as a fraction of screen height
    minPx: 0.35,      // below this estimated on-screen motion (px/frame) the pass switches off entirely
    cutDist: 400,     // camera jump (world units) or
    cutAngle: 0.7,    // rotation jump (rad) in one frame counts as a cut: no blur that frame
    active: false     // read only: was blur applied this frame
  };
  const auto = {
    enabled: true,
    min: 0.55, max: 1.35,
    ref: -2.4,        // ln of the average luminance that maps to the base exposure (renderer.toneMappingExposure)
    strength: 0.5,    // 0 = fixed exposure, 1 = full inverse-luminance. 0.5 is a gentle "eye" response
    rateToBright: 2.4,// 1/s, exposure falling because the view got brighter (pupil closes quickly)
    rateToDark: 0.7,  // 1/s, exposure rising because the view got darker (slow dark adaptation)
    linear: 1,        // metering blend: 0 = geometric mean (ignores small highlights), 1 = RMS luminance (bright areas weigh more, so a sun in frame pulls exposure down)
    lumMin: 0.03,     // per-sample floor: black space reads as one steady value instead of dragging the mean to -inf
    lumMax: 24        // per-sample luminance clamp so a blown-out sun core cannot dominate the mean
  };
  const trails = {    // long-exposure object trails: HDR history, reprojected by camera motion through depth
    enabled: false,
    amount: 0.65,     // history weight per 60fps frame (time-constant corrected for other frame rates). 0 = off, 0.9 = very long smears
    clamp: 0.15,      // neighbourhood clamp strength while the camera is still (rises to 1 during fast camera moves). 1 = TAA-strict, kills trails
    depthTol: 0.06,   // log2 depth mismatch (~4%) above which history counts as disoccluded, when the camera itself moved
    cutAngle: 0.5,    // camera rotation (rad) in one frame that resets the history; resetMotion() and motion.cutDist also reset it
    active: false     // read only
  };
  const ao = {        // contact AO, half-res SAO from depth, applied to HDR colour before DOF/bloom
    enabled: false,
    radius: 0.03,     // sample radius as a fraction of view distance (0.03 = 9 m at 300 m, 4.5 m at 150 m), i.e. a constant screen size at any scale
    intensity: 1.0,   // 0 = none, 1 = default, 2 = heavy
    bias: 0.12,       // cosine bias: ignores near-coplanar samples (keeps flat terrain clean)
    maxPx: 48,        // cap on the screen-space radius in full-res pixels (cost/cache guard)
    debug: false,     // true shows the AO term alone (grey) instead of the lit frame
    active: false     // read only
  };

  // ---------------------------------------------------------------- composer
  const composer = new EffectComposer(renderer);

  // 1. scene pass. Renders into a private HDR target that owns a depth texture when motion blur is active,
  //    otherwise straight into the composer buffer (no extra copy, no extra memory traffic).
  class ScenePass extends Pass {
    constructor() {
      super(); this.needsSwap = false; this.useRT = false; this.jx = 0; this.jy = 0; // jx/jy: TAA sub-pixel jitter (cine only), px
      this.rt = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, depthTexture: new THREE.DepthTexture(W, H) });
    }
    render(r, write, read) {
      const old = r.autoClear; r.autoClear = false;
      r.setRenderTarget(this.useRT ? this.rt : read);
      r.clear(true, true, true);
      if (this.jx || this.jy) { // offset the projection for this draw only (unjittered matrices everywhere else)
        const e = cam.projectionMatrix.elements, x = e[8], y = e[9], t = this.rt;
        e[8] += 2 * this.jx / t.width; e[9] += 2 * this.jy / t.height;
        try { r.render(scene, cam); } finally { e[8] = x; e[9] = y; }
      } else r.render(scene, cam);
      r.autoClear = old;
    }
    setSize(w, h) { this.rt.setSize(w, h); this.rt.depthTexture.image.width = w; this.rt.depthTexture.image.height = h; }
  }
  const scenePass = new ScenePass();
  composer.addPass(scenePass);

  // 2. HDR FX on the scene colour + depth, in this order, each stage optional:
  //    a. contact AO (half-res SAO from depth, bilateral blur, depth-aware upsample, multiplies HDR colour)
  //    b. temporal trails (long-exposure accumulation, history reprojected by camera motion through depth)
  //    c. camera motion blur (depth reprojection with last frame's view-projection, blur along the screen delta)
  //    The whole pass, and the scene pass's private depth target, switch off when none of them is active.
  const DEPTH_GLSL = `
    uniform float near; uniform float far;
    float viewZ(float d){ return (near*far)/((far-near)*d-far); } // perspective depth -> view z (negative)`;
  const IGN = `float ign(vec2 p){ return fract(52.9829189*fract(dot(p,vec2(0.06711056,0.00583715)))); }`; // interleaved gradient noise
  class HDRFXPass extends Pass {
    constructor() {
      super();
      this.blur = false; this.histOk = false; this.histVP = new THREE.Matrix4(); this.histRel = new THREE.Matrix4(); this.invVP = new THREE.Matrix4();
      this.w = W; this.h = H; this.hist = null; this.tmp = null; this.aoA = null; this.aoB = null;
      const mat = (uniforms, fs) => new THREE.ShaderMaterial({ uniforms, vertexShader: FS_VERT, depthTest: false, depthWrite: false, fragmentShader: fs });
      // c. camera motion blur (unchanged maths; colour input is whatever the earlier stages produced)
      this.u = { tColor: { value: null }, tDepth: { value: null }, invVP: { value: new THREE.Matrix4() }, prevVP: { value: new THREE.Matrix4() },
        scale: { value: 0.5 }, maxLen: { value: 0.035 }, res: { value: new THREE.Vector2(W, H) } };
      this.mBlur = mat(this.u, `
        uniform sampler2D tColor; uniform sampler2D tDepth; uniform mat4 invVP; uniform mat4 prevVP; uniform float scale; uniform float maxLen; uniform vec2 res; varying vec2 vUv;
        ${IGN}
        void main(){
          vec4 c0=texture2D(tColor,vUv);
          float d=texture2D(tDepth,vUv).x;
          vec4 w=invVP*vec4(vUv*2.-1.,d*2.-1.,1.); w/=w.w;      // world position of this pixel
          vec4 pc=prevVP*w;                                       // where it was last frame
          if(pc.w<=1e-4){ gl_FragColor=vec4(c0.rgb,1.); return; }
          vec2 v=(vUv-pc.xy/pc.w*.5-.5)*scale;                    // uv delta over the shutter interval
          vec2 vp=v*res; float lp=length(vp), cap=maxLen*res.y;
          if(lp>cap){ v*=cap/lp; lp=cap; }
          if(lp<0.6){ gl_FragColor=vec4(c0.rgb,1.); return; }     // sub-pixel: pass through
          float j=ign(gl_FragCoord.xy);
          float n=clamp(ceil(lp*.5),12.,32.);                     // taps grow with blur length (~2 px apart) so long swells stay smooth
          vec3 acc=vec3(0.);
          for(int i=0;i<32;i++){ if(float(i)>=n) break; float tt=(float(i)+j)/n-.5; acc+=texture2D(tColor,vUv+v*tt).rgb; }
          gl_FragColor=vec4(acc/n,1.); }`);
      this.mCopy = mat({ tColor: { value: null } }, `uniform sampler2D tColor; varying vec2 vUv; void main(){ gl_FragColor=vec4(texture2D(tColor,vUv).rgb,1.); }`);

      // b. trails: out = mix(current, reprojected history, w). History alpha holds log2(view distance) of the frame that wrote it,
      //    so a disocclusion test is possible without a second depth target.
      this.uT = { tColor: { value: null }, tDepth: { value: null }, tHist: { value: null }, invVP: { value: null }, histVP: { value: null },
        res: { value: new THREE.Vector2(W, H) }, near: { value: 1 }, far: { value: 1000 }, w: { value: 0.65 }, clampK: { value: 0.15 }, tol: { value: 0.06 }, valid: { value: 0 } };
      this.mTrail = mat(this.uT, `
        uniform sampler2D tColor; uniform sampler2D tDepth; uniform sampler2D tHist; uniform mat4 invVP; uniform mat4 histVP; uniform vec2 res;
        uniform float w, clampK, tol, valid; varying vec2 vUv;
        ${DEPTH_GLSL}
        vec3 histCR(vec2 uv){ // 5-tap Catmull-Rom: resampling the history every frame with bilinear would soften static detail while the camera creeps
          vec2 sp=uv*res, tp=floor(sp-.5)+.5, f=sp-tp;
          vec2 w0=f*(-.5+f*(1.-.5*f)), w1=1.+f*f*(-2.5+1.5*f), w2=f*(.5+f*(2.-1.5*f)), w3=f*f*(-.5+.5*f);
          vec2 w12=w1+w2, t12=(tp+w2/w12)/res, t0=(tp-1.)/res, t3=(tp+2.)/res;
          vec3 s=texture2D(tHist,vec2(t12.x,t0.y)).rgb*(w12.x*w0.y)+texture2D(tHist,vec2(t0.x,t12.y)).rgb*(w0.x*w12.y)+texture2D(tHist,t12).rgb*(w12.x*w12.y)
                +texture2D(tHist,vec2(t3.x,t12.y)).rgb*(w3.x*w12.y)+texture2D(tHist,vec2(t12.x,t3.y)).rgb*(w12.x*w3.y);
          return max(s/(w12.x*w0.y+w0.x*w12.y+w12.x*w12.y+w3.x*w12.y+w12.x*w3.y),vec3(0.)); }
        void main(){
          vec3 c=texture2D(tColor,vUv).rgb;
          float d=texture2D(tDepth,vUv).x;
          float zl=log2(max(-viewZ(d),1e-4));
          vec4 wp=invVP*vec4(vUv*2.-1.,d*2.-1.,1.); wp/=wp.w;     // world position of this pixel
          vec4 pc=histVP*wp;                                      // where the history camera saw it
          vec2 puv=pc.xy/max(pc.w,1e-6)*.5+.5;
          if(valid<.5 || pc.w<=1e-4 || any(lessThan(puv,vec2(0.))) || any(greaterThan(puv,vec2(1.)))){ gl_FragColor=vec4(c,zl); return; } // off-screen / reset
          vec3 h=histCR(puv);
          float hz=texelFetch(tHist,ivec2(clamp(puv*res,vec2(0.),res-1.)),0).a;  // log2 distance stored with the history
          float dz=abs(hz-log2(pc.w));                                           // vs where this surface should have been
          float mpx=length((vUv-puv)*res);                                       // camera-induced motion, px
          float camMove=smoothstep(.75,4.,mpx);
          // a depth mismatch with a still camera is a moving object (keep it: that is the trail); with a moving camera it is a disocclusion (drop it)
          float disocc=smoothstep(tol,tol*4.,dz)*camMove;
          // lenient neighbourhood clamp: a widened min/max box, applied only partly while the camera creeps, fully during fast camera moves
          vec2 t=1./res;
          vec3 a1=texture2D(tColor,vUv+vec2(t.x,0.)).rgb, a2=texture2D(tColor,vUv-vec2(t.x,0.)).rgb, a3=texture2D(tColor,vUv+vec2(0.,t.y)).rgb, a4=texture2D(tColor,vUv-vec2(0.,t.y)).rgb;
          vec3 mn=min(c,min(min(a1,a2),min(a3,a4))), mx=max(c,max(max(a1,a2),max(a3,a4)));
          vec3 ext=(mx-mn)*.5+.03*max(dot(mx,vec3(.2126,.7152,.0722)),.02);
          h=mix(h,clamp(h,mn-ext,mx+ext),mix(clampK,1.,camMove));
          gl_FragColor=vec4(mix(c,h,w*(1.-disocc)),zl); }`);

      // a. contact AO. Raw pass runs at half res and reads full-res depth with texelFetch; .x = AO, .y = view distance for the bilateral steps.
      this.uAO = { tDepth: { value: null }, res: { value: new THREE.Vector2(W, H) }, near: { value: 1 }, far: { value: 1000 }, pInv: { value: new THREE.Vector2(1, 1) },
        projScale: { value: 500 }, radius: { value: 0.02 }, intensity: { value: 1 }, bias: { value: 0.12 }, maxPx: { value: 48 } };
      this.mAO = mat(this.uAO, `
        uniform sampler2D tDepth; uniform vec2 res; uniform vec2 pInv; uniform float projScale, radius, intensity, bias, maxPx; varying vec2 vUv;
        ${DEPTH_GLSL}
        ${IGN}
        vec3 vpos(ivec2 p){ p=clamp(p,ivec2(0),ivec2(res)-1); float z=viewZ(texelFetch(tDepth,p,0).x); return vec3(((vec2(p)+.5)/res*2.-1.)*pInv*(-z),z); }
        void main(){
          ivec2 ip=ivec2(gl_FragCoord.xy)*2;
          float d=texelFetch(tDepth,ip,0).x;
          if(d>=.999999){ gl_FragColor=vec4(1.,6e4,0.,1.); return; }          // sky / cleared
          vec3 P=vpos(ip);
          vec3 x1=vpos(ip+ivec2(1,0))-P, x0=P-vpos(ip-ivec2(1,0)), y1=vpos(ip+ivec2(0,1))-P, y0=P-vpos(ip-ivec2(0,1));
          vec3 N=normalize(cross(abs(x1.z)<abs(x0.z)?x1:x0, abs(y1.z)<abs(y0.z)?y1:y0)); // normal from the smoother side: no halos at silhouettes
          float rPx=min(radius*projScale,maxPx);                // radius is a fraction of view distance, so its screen size is constant
          float R=rPx/projScale*(-P.z), R2=R*R;
          if(rPx<1.){ gl_FragColor=vec4(1.,-P.z,0.,1.); return; }
          float j=ign(gl_FragCoord.xy)*6.2831853, occ=0.;
          for(int i=0;i<12;i++){
            float a=(float(i)+.5)/12., ang=a*7.*6.2831853+j;   // 7-turn spiral, per-pixel rotation
            vec3 v=vpos(ip+ivec2(vec2(cos(ang),sin(ang))*a*rPx))-P;
            float vv=dot(v,v);
            occ+=max(0.,1.-vv/R2)*max(0.,dot(v,N)*inversesqrt(vv+1e-4*R2)-bias); }
          gl_FragColor=vec4(clamp(1.-intensity*occ/3.,0.,1.),-P.z,0.,1.); }`);
      this.uAOB = { tAO: { value: null }, dir: { value: new THREE.Vector2(1, 0) }, hres: { value: new THREE.Vector2(W >> 1, H >> 1) } };
      this.mAOBlur = mat(this.uAOB, `
        uniform sampler2D tAO; uniform vec2 dir; uniform vec2 hres; varying vec2 vUv;
        void main(){
          ivec2 p=ivec2(gl_FragCoord.xy), mx=ivec2(hres)-1; vec2 c=texelFetch(tAO,p,0).xy; float s=c.x, ws=1., k=1./(.03*c.y);
          for(int i=-4;i<=4;i++){ if(i==0) continue;
            vec2 t=texelFetch(tAO,clamp(p+ivec2(dir)*i,ivec2(0),mx),0).xy;
            float wt=exp(-float(i*i)*.125)*max(0.,1.-abs(t.y-c.y)*k); s+=t.x*wt; ws+=wt; }
          gl_FragColor=vec4(s/ws,c.y,0.,1.); }`);
      this.uAOC = { tColor: { value: null }, tDepth: { value: null }, tAO: { value: null }, hres: { value: new THREE.Vector2(W >> 1, H >> 1) }, near: { value: 1 }, far: { value: 1000 }, dbg: { value: 0 } };
      this.mAOComp = mat(this.uAOC, `
        uniform sampler2D tColor; uniform sampler2D tDepth; uniform sampler2D tAO; uniform vec2 hres; uniform float dbg; varying vec2 vUv;
        ${DEPTH_GLSL}
        void main(){
          vec4 c=texture2D(tColor,vUv); float d=texture2D(tDepth,vUv).x;
          if(d>=.999999){ gl_FragColor=vec4(c.rgb,1.); return; }
          float z=-viewZ(d), k=1./(.03*z);
          vec2 hp=vUv*hres-.5, f=fract(hp); ivec2 b=ivec2(floor(hp)), mx=ivec2(hres)-1;
          float s=0., ws=1e-4;                                    // joint bilateral upsample: bilinear weights x depth similarity
          for(int y=0;y<2;y++) for(int x=0;x<2;x++){
            vec2 t=texelFetch(tAO,clamp(b+ivec2(x,y),ivec2(0),mx),0).xy;
            float wt=(x==0?1.-f.x:f.x)*(y==0?1.-f.y:f.y)*max(1e-3,1.-abs(t.y-z)*k); s+=t.x*wt; ws+=wt; }
          gl_FragColor=vec4(dbg>.5 ? vec3(.6*s/ws) : c.rgb*(s/ws),1.); }`);
      this.fsQuad = new FullScreenQuad(this.mCopy);
      // cine only: TAA (jittered scene + reprojected HDR history). Shares the trails' history targets and matrices; the two
      // never run together. direct: leave the result in its own target (outTex) instead of copying it to the composer buffer.
      this.taa = false; this.direct = false; this.outTex = null; this.mTaa = null;
    }
    draw(r, m, target) { this.fsQuad.material = m; r.setRenderTarget(target); this.fsQuad.render(r); }
    alloc() {
      const mk = (w, h, filt) => new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType, depthBuffer: false, minFilter: filt, magFilter: filt });
      const hw = Math.max(1, this.w >> 1), hh = Math.max(1, this.h >> 1);
      if ((trails.enabled || this.taa) && !this.hist) { this.hist = [mk(this.w, this.h, THREE.LinearFilter), mk(this.w, this.h, THREE.LinearFilter)]; this.histOk = false; }
      if (ao.enabled && !this.aoA) { this.aoA = mk(hw, hh, THREE.NearestFilter); this.aoB = mk(hw, hh, THREE.NearestFilter); }
      if (ao.enabled && (trails.enabled || this.taa || this.blur) && !this.tmp) this.tmp = mk(this.w, this.h, THREE.LinearFilter);
    }
    render(r, write) {
      this.alloc();
      const depth = scenePass.rt.depthTexture; let src = scenePass.rt.texture, done = false;
      const near = cam.near, far = cam.far, last = !trails.enabled && !this.taa && !this.blur;
      this.outTex = write ? write.texture : null;
      if (ao.enabled) {
        const P = cam.projectionMatrix.elements;
        this.uAO.tDepth.value = depth; this.uAO.near.value = near; this.uAO.far.value = far;
        this.uAO.pInv.value.set(1 / P[0], 1 / P[5]); this.uAO.projScale.value = 0.5 * this.h * P[5];
        this.uAO.radius.value = ao.radius; this.uAO.intensity.value = ao.intensity; this.uAO.bias.value = ao.bias; this.uAO.maxPx.value = ao.maxPx;
        this.draw(r, this.mAO, this.aoA);
        this.uAOB.tAO.value = this.aoA.texture; this.uAOB.dir.value.set(1, 0); this.draw(r, this.mAOBlur, this.aoB);
        this.uAOB.tAO.value = this.aoB.texture; this.uAOB.dir.value.set(0, 1); this.draw(r, this.mAOBlur, this.aoA);
        const c = this.uAOC; c.tColor.value = src; c.tDepth.value = depth; c.tAO.value = this.aoA.texture; c.near.value = near; c.far.value = far; c.dbg.value = ao.debug ? 1 : 0;
        this.draw(r, this.mAOComp, last ? write : this.tmp);
        if (last) done = true; else src = this.tmp.texture;
      }
      if (trails.enabled) {
        const u = this.uT, h0 = this.hist[0], h1 = this.hist[1];
        u.tColor.value = src; u.tDepth.value = depth; u.tHist.value = h0.texture; u.invVP.value = this.invVP; u.histVP.value = this.histRel;
        u.near.value = near; u.far.value = far; u.valid.value = this.histOk ? 1 : 0;
        u.w.value = Math.pow(THREE.MathUtils.clamp(trails.amount, 0, 0.98), THREE.MathUtils.clamp(lastDt * 60, 0.25, 4)); // same time constant at any frame rate
        u.clampK.value = trails.clamp; u.tol.value = trails.depthTol;
        this.draw(r, this.mTrail, h1);
        this.hist[0] = h1; this.hist[1] = h0; this.histVP.copy(curVP); this.histOk = true;
        src = h1.texture;
      } else if (this.taa) {
        const u = this.mTaa.uniforms, h0 = this.hist[0], h1 = this.hist[1];
        u.tColor.value = src; u.tDepth.value = depth; u.tHist.value = h0.texture; u.invVP.value = this.invVP; u.histVP.value = this.histRel;
        u.valid.value = this.histOk ? 1 : 0;
        this.draw(r, this.mTaa, h1);
        this.hist[0] = h1; this.hist[1] = h0; this.histVP.copy(curVP); this.histOk = true;
        src = h1.texture;
      }
      if (this.blur) { this.u.tColor.value = src; this.u.tDepth.value = depth; this.draw(r, this.mBlur, write); }
      else if (!done && this.direct) this.outTex = src;
      else if (!done) { this.mCopy.uniforms.tColor.value = src; this.draw(r, this.mCopy, write); }
    }
    setSize(w, h) {
      this.w = w; this.h = h; this.u.res.value.set(w, h); this.uT.res.value.set(w, h); this.uAO.res.value.set(w, h);
      const hw = Math.max(1, w >> 1), hh = Math.max(1, h >> 1); this.uAOB.hres.value.set(hw, hh); this.uAOC.hres.value.set(hw, hh);
      for (const t of [this.tmp, ...(this.hist || [])]) t && t.setSize(w, h);
      for (const t of [this.aoA, this.aoB]) t && t.setSize(hw, hh);
      if (this.mTaa) this.mTaa.uniforms.res.value.set(w, h);
      this.histOk = false;
    }
    dispose() { for (const t of [this.tmp, this.aoA, this.aoB, ...(this.hist || [])]) t && t.dispose(); this.hist = this.tmp = this.aoA = this.aoB = null; }
  }
  const mbPass = new HDRFXPass(); mbPass.enabled = false;
  composer.addPass(mbPass);

  // 3. DOF + bloom, parameters unchanged from d5.current.js
  //    DOF reads the scene pass's own depth texture instead of re-rendering the scene with a depth override
  //    (that doubled the draw cost and missed vertex displacement on the terrain and habs).
  const dof = new BokehPass(scene, cam, { focus: 30, aperture: 0.0001, maxblur: 0.002 });
  dof.materialBokeh.defines.DEPTH_PACKING = 0; dof.materialBokeh.needsUpdate = true; // raw depth texture, not RGBA-packed
  dof.renderTargetDepth.dispose();
  dof.render = function (r, write, read) {
    const u = this.uniforms;
    u.tColor.value = mbPass.enabled ? read.texture : scenePass.rt.texture; // FX pass off: scene colour is still in the private RT
    u.tDepth.value = scenePass.rt.depthTexture; u.nearClip.value = cam.near; u.farClip.value = cam.far;
    r.setRenderTarget(this.renderToScreen ? null : write); this.fsQuad.render(r);
  };
  dof.setSize = function (w, h) { this.uniforms.aspect.value = w / h; };
  composer.addPass(dof);
  // composer.addPass/setSize hand every pass drawing-buffer pixels, so bloom has always run at device size; keep that look
  // cine: its own half-res Gaussian bloom (below); main.js keeps writing bloom.strength, so a stand-in object takes it
  const bloom = cine ? { strength: 0.6, radius: 0.5, threshold: 0.72, separableBlurMaterials: [] } : new UnrealBloomPass(new THREE.Vector2(W, H), 0.8, 0.5, 0.72);
  if (!cine) composer.addPass(bloom);

  // 4. auto exposure + tone map, entirely on the GPU (no readback, no stall).
  //    HDR frame -> 64x64 weighted log-luminance -> 8x8 -> 1x1 mean -> adapt (ping-pong 1x1 float state) -> tone map reads the state texture.
  class ExposureTonePass extends Pass {
    constructor() {
      super();
      const rt = (w, type) => new THREE.WebGLRenderTarget(w, w, { type, depthBuffer: false, magFilter: THREE.NearestFilter, minFilter: THREE.NearestFilter });
      this.t64 = rt(64, THREE.HalfFloatType); this.t8 = rt(8, THREE.HalfFloatType); this.t1 = rt(1, THREE.HalfFloatType);
      this.sA = rt(1, THREE.FloatType); this.sB = rt(1, THREE.FloatType); // exposure state, float so slow drifts do not stall on half precision
      this.first = true; this.snap = true;
      this.mDown = new THREE.ShaderMaterial({ uniforms: { tSrc: { value: null }, lumMax: { value: 24 }, lumMin: { value: 0.03 } }, vertexShader: FS_VERT, depthTest: false, fragmentShader: `
        uniform sampler2D tSrc; uniform float lumMax; uniform float lumMin; varying vec2 vUv;
        void main(){ vec2 base=floor(gl_FragCoord.xy)/64.; vec3 acc=vec3(0.);
          for(int y=0;y<4;y++) for(int x=0;x<4;x++){
            vec2 uv=base+(vec2(float(x),float(y))+.5)/256.;
            vec3 c=texture2D(tSrc,uv).rgb; float l=clamp(dot(c,vec3(.2126,.7152,.0722)),lumMin,lumMax);
            float k=length(uv-.5)*2.; float wt=mix(1.,.35,smoothstep(.2,1.1,k)); // centre-weighted metering
            acc+=vec3(log(l)*wt,wt,l*l*wt); }
          gl_FragColor=vec4(acc/16.,1.); }` });
      this.mReduce = new THREE.ShaderMaterial({ uniforms: { tSrc: { value: null } }, vertexShader: FS_VERT, depthTest: false, fragmentShader: `
        uniform sampler2D tSrc; varying vec2 vUv;
        void main(){ ivec2 b=ivec2(gl_FragCoord.xy)*8; vec3 acc=vec3(0.);
          for(int y=0;y<8;y++) for(int x=0;x<8;x++) acc+=texelFetch(tSrc,b+ivec2(x,y),0).rgb;
          gl_FragColor=vec4(acc/64.,1.); }` });
      this.mAdapt = new THREE.ShaderMaterial({ uniforms: { tAvg: { value: null }, tPrev: { value: null }, dt: { value: 0.016 }, base: { value: 1.05 }, ref: { value: -3.2 }, strength: { value: 0.5 },
        eMin: { value: 0.55 }, eMax: { value: 1.35 }, up: { value: 2.4 }, down: { value: 0.7 }, snap: { value: 1 }, on: { value: 1 }, lin: { value: 1 } }, vertexShader: FS_VERT, depthTest: false, fragmentShader: `
        uniform sampler2D tAvg; uniform sampler2D tPrev; uniform float dt, base, ref, strength, eMin, eMax, up, down, snap, on, lin; varying vec2 vUv;
        void main(){ vec3 m=texelFetch(tAvg,ivec2(0),0).rgb; float lnL=mix(m.x/max(m.y,1e-4),0.5*log(max(m.z/max(m.y,1e-4),1e-6)),lin);
          float target=on>.5 ? clamp(base*exp(-(lnL-ref)*strength),eMin,eMax) : base;
          float prev=texelFetch(tPrev,ivec2(0),0).r; float lp=log(max(prev,1e-3)), lt=log(target);
          float rate=lt<lp ? up : down;                                  // brighter view: fast, darker view: slow
          float e=snap>.5 ? target : exp(mix(lp,lt,1.-exp(-dt*rate)));
          gl_FragColor=vec4(e,lnL,0.,1.); }` });
      // tone map: OutputPass equivalent, but exposure comes from the state texture instead of a uniform
      this.mTone = new THREE.RawShaderMaterial({ uniforms: { tDiffuse: { value: null }, tExp: { value: null }, toneMappingExposure: { value: 1 } },
        vertexShader: `precision highp float; uniform mat4 modelViewMatrix; uniform mat4 projectionMatrix; attribute vec3 position; attribute vec2 uv; varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
        fragmentShader: `precision highp float; uniform sampler2D tDiffuse; uniform sampler2D tExp;
        #include <tonemapping_pars_fragment>
        #include <colorspace_pars_fragment>
        varying vec2 vUv;
        void main(){ gl_FragColor=texture2D(tDiffuse,vUv);
          gl_FragColor.rgb*=texture2D(tExp,vec2(.5)).r;  // auto exposure (toneMappingExposure uniform stays 1)
          #ifdef LINEAR_TONE_MAPPING
            gl_FragColor.rgb=LinearToneMapping(gl_FragColor.rgb);
          #elif defined(REINHARD_TONE_MAPPING)
            gl_FragColor.rgb=ReinhardToneMapping(gl_FragColor.rgb);
          #elif defined(CINEON_TONE_MAPPING)
            gl_FragColor.rgb=OptimizedCineonToneMapping(gl_FragColor.rgb);
          #elif defined(ACES_FILMIC_TONE_MAPPING)
            gl_FragColor.rgb=ACESFilmicToneMapping(gl_FragColor.rgb);
          #elif defined(AGX_TONE_MAPPING)
            gl_FragColor.rgb=AgXToneMapping(gl_FragColor.rgb);
          #endif
          #ifdef SRGB_TRANSFER
            gl_FragColor=sRGBTransferOETF(gl_FragColor);
          #endif
        }` });
      this.fsQuad = new FullScreenQuad(this.mDown); this.dt = 1 / 60; this._cs = null; this._tm = null;
    }
    pass(r, mat, target) { this.fsQuad.material = mat; r.setRenderTarget(target); this.fsQuad.render(r); }
    render(r, write, read) {
      // keep tone-map defines in sync with the renderer, like OutputPass does
      if (this._cs !== r.outputColorSpace || this._tm !== r.toneMapping) {
        this._cs = r.outputColorSpace; this._tm = r.toneMapping; const d = {};
        if (THREE.ColorManagement.getTransfer(this._cs) === THREE.SRGBTransfer) d.SRGB_TRANSFER = '';
        const k = { [THREE.LinearToneMapping]: 'LINEAR_TONE_MAPPING', [THREE.ReinhardToneMapping]: 'REINHARD_TONE_MAPPING', [THREE.CineonToneMapping]: 'CINEON_TONE_MAPPING', [THREE.ACESFilmicToneMapping]: 'ACES_FILMIC_TONE_MAPPING', [THREE.AgXToneMapping]: 'AGX_TONE_MAPPING' }[this._tm];
        if (k) d[k] = ''; this.mTone.defines = d; this.mTone.needsUpdate = true;
      }
      if (auto.enabled) { // measure + adapt (about 0.1ms: 64x64 + 8x8 + 1x1 draws)
        this.mDown.uniforms.tSrc.value = read.texture; this.mDown.uniforms.lumMax.value = auto.lumMax; this.mDown.uniforms.lumMin.value = auto.lumMin;
        this.pass(r, this.mDown, this.t64);
        this.mReduce.uniforms.tSrc.value = this.t64.texture; this.pass(r, this.mReduce, this.t8);
        this.mReduce.uniforms.tSrc.value = this.t8.texture; this.pass(r, this.mReduce, this.t1);
      }
      const u = this.mAdapt.uniforms;
      u.tAvg.value = this.t1.texture; u.tPrev.value = this.sA.texture; u.dt.value = Math.min(this.dt, 0.1); u.base.value = r.toneMappingExposure;
      u.ref.value = auto.ref; u.strength.value = auto.strength; u.eMin.value = auto.min; u.eMax.value = auto.max; u.up.value = auto.rateToBright; u.down.value = auto.rateToDark;
      u.lin.value = auto.linear; u.snap.value = this.snap ? 1 : 0; u.on.value = auto.enabled ? 1 : 0; this.snap = false;
      this.pass(r, this.mAdapt, this.sB); const s = this.sA; this.sA = this.sB; this.sB = s;
      this.mTone.uniforms.tDiffuse.value = read.texture; this.mTone.uniforms.tExp.value = this.sA.texture;
      this.pass(r, this.mTone, this.renderToScreen ? null : write);
    }
  }
  const tonePass = new ExposureTonePass();
  composer.addPass(tonePass);

  // 5. SMAA on the tone-mapped LDR image (edge detection needs display-referred values), before grain so the grain stays crisp
  const smaa = new SMAAPass(W, H);
  composer.addPass(smaa);

  // 6. lens: identical to d5.current.js
  const lens = new ShaderPass({
    uniforms: { tDiffuse: { value: null }, ca: { value: 0.012 }, time: { value: 0 }, grain: { value: 0.045 }, res: { value: new THREE.Vector2(W, H) } }, // grain cells = CSS pixels (the original film look)
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `uniform sampler2D tDiffuse; uniform float ca; uniform float time; uniform float grain; uniform vec2 res; varying vec2 vUv;
    void main(){
      vec2 c=vUv-.5; float r2=dot(c,c);
      vec2 uv=.5+c*(1.-0.035*r2);              // barrel, pulls the corners in a touch
      vec2 o=c*r2*ca;                           // fringing grows toward the edges, zero at center
      vec3 col=vec3(texture2D(tDiffuse,uv+o).r, texture2D(tDiffuse,uv).g, texture2D(tDiffuse,uv-o).b);
      col*=mix(1.,smoothstep(0.75,0.12,r2*1.6),0.55); // vignette
      float n=fract(sin(dot(floor(vUv*res)+fract(time*7.31)*91.7,vec2(12.9898,78.233)))*43758.5453);
      col+=(n-.5)*grain*(1.-dot(col,vec3(.33))*0.6); // grain sits mostly in the shadows, like film
      gl_FragColor=vec4(col,1.); }`
  });
  if (!cine) composer.addPass(lens);
  const C = cine ? createCine({ THREE, renderer, cam, composer, scenePass, mbPass, dof, tonePass, smaa, bloom, FS_VERT, low }) : null;

  // ---------------------------------------------------------------- per-frame state (no allocations)
  const curVP = new THREE.Matrix4(), prevVP = new THREE.Matrix4(), invRel = new THREE.Matrix4(), toCam = new THREE.Matrix4(), _t = new THREE.Matrix4(), _o = new THREE.Vector3(), lastPos = new THREE.Vector3(), lastQuat = new THREE.Quaternion();
  let have = false, lastDt = 1 / 60, resetNext = false, bufW = W;

  function setSize(w, h) {
    renderer.setSize(w, h); cam.aspect = w / h; cam.updateProjectionMatrix();
    const p = renderer.getPixelRatio(); bufW = Math.max(1, Math.floor(w * p));
    composer.setSize(w, h); lens.uniforms.res.value.set(w, h); resetNext = true;
    if (C) C.setSize();
  }

  function update({ dt = 1 / 60, t = 0, ca, focus, aperture, maxblur } = {}) {
    lastDt = Math.max(dt, 1e-4); tonePass.dt = lastDt;
    if (focus !== undefined) dof.uniforms.focus.value = focus;
    if (aperture !== undefined) dof.uniforms.aperture.value = aperture;
    if (maxblur !== undefined) dof.uniforms.maxblur.value = maxblur;
    if (ca !== undefined) lens.uniforms.ca.value = ca;
    lens.uniforms.time.value = t;
    if (C) C.time = t;
    const taaOn = !!C && C.taaOn() && !trails.enabled;

    // camera motion estimate -> decide whether blur runs this frame
    cam.updateMatrixWorld(); curVP.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse);
    // camera-relative reprojection: the site sits ~40 km from the origin, so absolute world matrices in float32 smear static detail.
    // invRel: NDC -> (world - camPos); X * toCam: (world - camPos) -> X's clip space. Built in JS doubles.
    _o.setFromMatrixPosition(cam.matrixWorld); toCam.makeTranslation(_o.x, _o.y, _o.z);
    invRel.copy(curVP).invert().premultiply(_t.makeTranslation(-_o.x, -_o.y, -_o.z));
    let on = false;
    const dp = have ? cam.position.distanceTo(lastPos) : 0, ang = have ? lastQuat.angleTo(cam.quaternion) : 0;
    if (have && !resetNext && motion.enabled) {
      const f = Math.min(Math.max(focus === undefined ? dof.uniforms.focus.value : focus, 3), 60); // near-field parallax proxy
      const fovR = cam.fov * Math.PI / 180, px = (ang + dp / f) / fovR * H;
      const scale = THREE.MathUtils.clamp(motion.shutter * (1 / 60) / lastDt, 0.15, 2);
      if (dp < motion.cutDist && ang < motion.cutAngle && px * scale > motion.minPx) {
        on = true; const u = mbPass.u; u.prevVP.value.multiplyMatrices(prevVP, toCam); u.invVP.value.copy(invRel); u.scale.value = scale; u.maxLen.value = motion.maxLen;
      }
    }
    // trails: history is invalid after a reset, a detected cut, a resize, or while the feature is off
    // (cine TAA shares the history: same rules)
    const hist = trails.enabled || taaOn;
    if (!hist || !have || resetNext || dp >= motion.cutDist || ang >= Math.min(motion.cutAngle, trails.cutAngle)) mbPass.histOk = false;
    if (hist) { mbPass.invVP.copy(invRel); mbPass.histRel.multiplyMatrices(mbPass.histVP, toCam); }
    else if (mbPass.hist) { mbPass.hist.forEach(t => t.dispose()); mbPass.hist = null; } // free ~2 full-res HDR buffers while off
    if (!ao.enabled && mbPass.aoA) { mbPass.aoA.dispose(); mbPass.aoB.dispose(); mbPass.aoA = mbPass.aoB = null; }
    if (!ao.enabled && mbPass.tmp) { mbPass.tmp.dispose(); mbPass.tmp = null; }
    mbPass.blur = on; mbPass.taa = taaOn;
    const fx = on || trails.enabled || ao.enabled || taaOn;   // depth target + FX pass only when something needs them
    motion.active = on; trails.active = trails.enabled; ao.active = ao.enabled;
    // DOF taps reach 0.4 * maxblur of the width; under half a pixel the pass is invisible, so skip it
    const dofOn = 0.4 * dof.uniforms.maxblur.value * bufW >= 0.5;
    mbPass.enabled = fx; dof.enabled = dofOn; scenePass.useRT = fx || dofOn || !!C;
    if (C) C.jitter(taaOn);
    prevVP.copy(curVP); lastPos.copy(cam.position); lastQuat.copy(cam.quaternion); have = true; resetNext = false;
  }

  function render() { if (C) C.render(); else composer.render(lastDt); }

  // boot hook: run the whole chain twice with every stage forced on (blur + optional AO/trails, then the plain copy path)
  // so all pass programs compile now instead of on the frame that first needs them. The scene pass is skipped (the
  // output is garbage; call it while the canvas is hidden). History and exposure restart clean afterwards.
  function warm({ fx = true } = {}) {
    if (C) { // cine: every stage and every quality level's programs, one forced pass each
      const keep = [scenePass.enabled, mbPass.enabled, mbPass.blur, mbPass.taa, dof.enabled, trails.enabled, ao.enabled];
      try {
        scenePass.enabled = false; mbPass.enabled = true; dof.enabled = true; trails.enabled = false; ao.enabled = fx;
        mbPass.blur = true; mbPass.taa = true; C.render(true, 0);
        mbPass.blur = false; mbPass.taa = false; ao.enabled = false; C.render(true, 1);
      } finally {
        [scenePass.enabled, mbPass.enabled, mbPass.blur, mbPass.taa, dof.enabled, trails.enabled, ao.enabled] = keep;
        mbPass.histOk = false; tonePass.snap = true; resetNext = true;
      }
      return;
    }
    const keep = [scenePass.enabled, scenePass.useRT, mbPass.enabled, mbPass.blur, dof.enabled, trails.enabled, ao.enabled];
    try {
      scenePass.enabled = false; scenePass.useRT = true; mbPass.enabled = true; dof.enabled = true;
      mbPass.blur = true; trails.enabled = ao.enabled = fx; composer.render(1 / 60);
      mbPass.blur = false; trails.enabled = ao.enabled = false; composer.render(1 / 60);
    } finally {
      [scenePass.enabled, scenePass.useRT, mbPass.enabled, mbPass.blur, dof.enabled, trails.enabled, ao.enabled] = keep;
      mbPass.histOk = false; tonePass.snap = true; resetNext = true;
    }
  }

  // debug / QA: synchronous readback (stalls the GPU, never call in production)
  const _px = new Float32Array(4);
  function getExposure() { renderer.readRenderTargetPixels(tonePass.sA, 0, 0, 1, 1, _px); return { exposure: _px[0], lnLum: _px[1] }; }

  return {
    composer, dof, lens, bloom, smaa, setSize, update, render, warm,
    motion, auto, trails, ao,
    resetMotion() { resetNext = true; },          // call on hard cuts if you know about them (big jumps are also auto-detected)
    snapExposure() { tonePass.snap = true; },     // jump exposure to target next frame (no adaptation)
    getExposure,
    // cine only (D6.1): live lens knobs, look tunables, quality ladder 0..3 (see createCine)
    cine: !!C, fx: C ? C.fx : null, look: C ? C.look : null, lensFrame: C ? o => C.lensFrame(o) : () => {}, scrim: C ? (...a) => C.scrim(...a) : () => {},
    setQuality: C ? l => C.setQuality(l) : () => {}, setPostQuality: C ? l => C.setQuality(l) : () => {}, getQuality: () => (C ? C.level : -1),
    gpuTimes: C ? () => C.gpuTimes() : () => null
  };
}

// ================================================================ CINE (D6.1 film chain, opt-in)
// One look for the Mars run and the footer: ACES (Hill fit) + a warm grade, half-res Gaussian bloom, anamorphic streaks
// on the hottest lights only, mild vignette, light temporal grain, no chromatic aberration. The grade GLSL is shared
// verbatim with d61/foot-glsl.js (CINE_GLSL there): change both or neither.
// Chain: scene (jittered at q3) -> [AO, TAA | trails, motion blur] -> DOF -> bloom + streak (half / quarter res)
//        -> exposure + bloom/streak/dirt/flash composite + tone + grade (one pass) -> SMAA (q2) -> lens: heat shimmer,
//        FXAA (q1), vignette, grain, dither (one pass) -> canvas.
// Quality ladder (setQuality / setPostQuality): 3 TAA, bloom from half res, 5 mips, streak | 2 SMAA, same bloom |
//        1 FXAA, bloom from quarter res, 4 mips, streak | 0 no AA, quarter res, 3 mips, no streak. Level changes only
//        resize or skip passes: every program is compiled by warm().
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

const CINE_LIVE = new Set();
// governor hook: applies to every live cine post (0 = cheapest .. 3 = best)
export function setPostQuality(level) { for (const c of CINE_LIVE) c.setQuality(level); }

function createCine({ THREE, renderer, cam, composer, scenePass, mbPass, dof, tonePass, smaa, bloom, FS_VERT, low = false }) {
  const HF = THREE.HalfFloatType, LIN = THREE.LinearFilter;
  const mk = () => new THREE.WebGLRenderTarget(1, 1, { type: HF, depthBuffer: false, minFilter: LIN, magFilter: LIN, generateMipmaps: false });
  const fsq = new FullScreenQuad(null);
  const mat = (frag, uniforms) => new THREE.ShaderMaterial({ uniforms, vertexShader: FS_VERT, fragmentShader: frag, depthTest: false, depthWrite: false });
  const draw = (m, target) => { fsq.material = m; renderer.setRenderTarget(target); fsq.render(renderer); };

  // live knobs (per frame, from main.js) and look tunables
  const fx = { flash: 0, heat: 0, heatAt: null, dirt: 0, streak: 1, bloom: 0 };
  const look = {
    bloom: 0.5,        // x bloom.strength (main.js writes 0.6 .. 0.9)
    threshold: 1.0, knee: 0.6,   // bloom soft knee on scene-linear HDR (pre exposure)
    streakThr: 6,      // streaks only above this (see CINEMA-NOTES: hero lights >= 10, everything else <= 3)
    streak: 0,         // anamorphic streak gain: OFF for launch (unverified on the real plume); 0.2 was the tested look. Programs stay warmed
    streakTint: new THREE.Color(0.86, 0.92, 1.0),
    vignette: 0.3, grain: 0.04,
    taaStill: 0.9, taaMove: 0.7   // history weight, camera still / moving fast
  };
  const QL = [
    { aa: 0, div: 2, lv: 3, streak: false },
    { aa: 1, div: 2, lv: 4, streak: true },
    { aa: 2, div: 1, lv: 5, streak: true },
    { aa: 3, div: 1, lv: 5, streak: true }
  ];
  const BW = [0.46, 0.3, 0.15, 0.06, 0.03];
  let level = -1, Q = QL[3], explicit = false, frame = 0;

  // ---------------------------------------------------------------- bloom + streak (half / quarter res)
  const rtPre = mk(), rtT = [], rtL = [], rtS = [mk(), mk()];
  for (let i = 0; i < 5; i++) { rtT.push(mk()); rtL.push(mk()); }
  const mPre = mat(`
    uniform sampler2D tSrc; uniform vec2 uTexel; uniform float uThr, uKnee; varying vec2 vUv;
    vec3 tap(vec2 o){ vec3 c=texture2D(tSrc,vUv+o*uTexel).rgb; return any(isnan(c)) ? vec3(0.) : min(c,vec3(6e4)); }
    float lum(vec3 c){ return dot(c,vec3(.2126,.7152,.0722)); }
    void main(){
      vec3 a=tap(vec2(-1,-1)), b=tap(vec2(1,-1)), c=tap(vec2(-1,1)), e=tap(vec2(1,1));
      float wa=1./(1.+lum(a)), wb=1./(1.+lum(b)), wc=1./(1.+lum(c)), we=1./(1.+lum(e));   // Karis average: no fireflies
      vec3 m=(a*wa+b*wb+c*wc+e*we)/(wa+wb+wc+we);
      float l=lum(m), s=clamp(l-uThr+uKnee,0.,2.*uKnee); s=s*s/(4.*uKnee+1e-5);
      gl_FragColor=vec4(m*max(s,l-uThr)/max(l,1e-4),1.); }`,
    { tSrc: { value: null }, uTexel: { value: new THREE.Vector2() }, uThr: { value: 1 }, uKnee: { value: 0.6 } });
  const mBlur = mat(`
    uniform sampler2D tSrc; uniform vec2 uDir; varying vec2 vUv;
    void main(){
      vec3 c=texture2D(tSrc,vUv).rgb*.227027;
      c+=(texture2D(tSrc,vUv+uDir*1.3846154).rgb+texture2D(tSrc,vUv-uDir*1.3846154).rgb)*.3162162;
      c+=(texture2D(tSrc,vUv+uDir*3.2307692).rgb+texture2D(tSrc,vUv-uDir*3.2307692).rgb)*.0702703;
      gl_FragColor=vec4(c,1.); }`, { tSrc: { value: null }, uDir: { value: new THREE.Vector2() } });
  // streak: 2x4 pre-texel box of the bloom prefilter, a second, much higher threshold, then 3 long horizontal passes
  const mSDown = mat(`
    uniform sampler2D tSrc; uniform vec2 uTexel; uniform float uThr; varying vec2 vUv;
    void main(){
      vec3 c=(texture2D(tSrc,vUv+vec2(-.5,-1.)*uTexel).rgb+texture2D(tSrc,vUv+vec2(.5,-1.)*uTexel).rgb
             +texture2D(tSrc,vUv+vec2(-.5,1.)*uTexel).rgb+texture2D(tSrc,vUv+vec2(.5,1.)*uTexel).rgb)*.25;
      float l=dot(c,vec3(.2126,.7152,.0722));
      gl_FragColor=vec4(c*max(l-uThr,0.)/max(l,1e-4),1.); }`, { tSrc: { value: null }, uTexel: { value: new THREE.Vector2() }, uThr: { value: 6 } });
  const mSBlur = mat(`
    uniform sampler2D tSrc; uniform float uStep; uniform float uTx; varying vec2 vUv;
    void main(){ vec3 c=texture2D(tSrc,vUv).rgb; float ws=1.;
      for(int i=1;i<=6;i++){ float w=exp(-float(i)*.42); vec2 o=vec2(float(i)*uStep*uTx,0.);
        c+=(texture2D(tSrc,vUv+o).rgb+texture2D(tSrc,vUv-o).rgb)*w; ws+=2.*w; }
      gl_FragColor=vec4(c/ws,1.); }`, { tSrc: { value: null }, uStep: { value: 1 }, uTx: { value: 1 } });

  // ---------------------------------------------------------------- TAA resolve (HDR, before DOF / bloom)
  mbPass.mTaa = mat(`
    uniform sampler2D tColor; uniform sampler2D tDepth; uniform sampler2D tHist; uniform mat4 invVP; uniform mat4 histVP; uniform vec2 res;
    uniform float valid, wStill, wMove; varying vec2 vUv;
    vec3 yc(vec3 c){ return vec3(dot(c,vec3(.25,.5,.25)), dot(c,vec3(.5,0.,-.5)), dot(c,vec3(-.25,.5,-.25))); }
    vec3 rgb(vec3 y){ return vec3(y.x+y.y-y.z, y.x+y.z, y.x-y.y-y.z); }
    vec3 san(vec3 c){ return any(isnan(c)) ? vec3(0.) : min(c,vec3(6e4)); }
    vec3 histCR(vec2 uv){ // 5-tap Catmull-Rom: keeps static detail sharp under constant resampling
      vec2 sp=uv*res, tp=floor(sp-.5)+.5, f=sp-tp;
      vec2 w0=f*(-.5+f*(1.-.5*f)), w1=1.+f*f*(-2.5+1.5*f), w2=f*(.5+f*(2.-1.5*f)), w3=f*f*(-.5+.5*f);
      vec2 w12=w1+w2, t12=(tp+w2/w12)/res, t0=(tp-1.)/res, t3=(tp+2.)/res;
      vec3 s=texture2D(tHist,vec2(t12.x,t0.y)).rgb*(w12.x*w0.y)+texture2D(tHist,vec2(t0.x,t12.y)).rgb*(w0.x*w12.y)+texture2D(tHist,t12).rgb*(w12.x*w12.y)
            +texture2D(tHist,vec2(t3.x,t12.y)).rgb*(w3.x*w12.y)+texture2D(tHist,vec2(t12.x,t3.y)).rgb*(w12.x*w3.y);
      return max(s/(w12.x*w0.y+w0.x*w12.y+w12.x*w12.y+w3.x*w12.y+w12.x*w3.y),vec3(0.)); }
    void main(){
      vec2 t=1./res; vec3 c=san(texture2D(tColor,vUv).rgb);
      if(valid<.5){ gl_FragColor=vec4(c,1.); return; }
      // 3x3 neighbourhood stats in YCoCg (tone-compressed so a hot plume pixel cannot widen the box) + nearest depth of the cross
      vec3 m1=vec3(0.), m2=vec3(0.); float d=1.;
      for(int y=-1;y<=1;y++) for(int x=-1;x<=1;x++){
        vec2 o=vec2(float(x),float(y))*t; vec3 s=san(texture2D(tColor,vUv+o).rgb); s=yc(s/(1.+dot(s,vec3(.2126,.7152,.0722))));
        m1+=s; m2+=s*s; if(x==0||y==0) d=min(d,texture2D(tDepth,vUv+o).x); }
      vec4 wp=invVP*vec4(vUv*2.-1.,d*2.-1.,1.); wp/=wp.w; vec4 pc=histVP*wp;
      vec2 puv=pc.xy/max(pc.w,1e-6)*.5+.5;
      if(pc.w<=1e-4 || any(lessThan(puv,vec2(0.))) || any(greaterThan(puv,vec2(1.)))){ gl_FragColor=vec4(c,1.); return; }
      vec3 h=histCR(puv); float hl=dot(h,vec3(.2126,.7152,.0722)); vec3 hy=yc(h/(1.+hl));
      vec3 mu=m1/9., sg=sqrt(max(m2/9.-mu*mu,0.));
      vec3 lo=mu-sg*1.1, hi=mu+sg*1.1;
      // clip toward the mean (variance clipping): stale history from moving objects / disocclusions is pulled in, not kept
      vec3 dv=hy-mu, ex=max(abs(dv)/max(hi-mu,vec3(1e-5)),vec3(1.)); hy=mu+dv/max(ex.x,max(ex.y,ex.z));
      h=rgb(hy); h=h/max(1.-dot(h,vec3(.2126,.7152,.0722)),1e-3);   // back to HDR (inverse of the compression)
      float mpx=length((vUv-puv)*res), w=mix(wStill,wMove,smoothstep(.5,6.,mpx));
      float wc=(1.-w)/(1.+dot(c,vec3(.2126,.7152,.0722))), wh=w/(1.+dot(h,vec3(.2126,.7152,.0722)));
      gl_FragColor=vec4(max((c*wc+h*wh)/(wc+wh),vec3(0.)),1.); }`,
    { tColor: { value: null }, tDepth: { value: null }, tHist: { value: null }, invVP: { value: null }, histVP: { value: null },
      res: { value: new THREE.Vector2(1, 1) }, valid: { value: 0 }, wStill: { value: 0.9 }, wMove: { value: 0.7 } });
  mbPass.direct = true;

  // ---------------------------------------------------------------- tone: exposure state + bloom/streak/dirt/flash + ACES + grade
  const dirt = dirtTexture(THREE);
  const toneU = { tDiffuse: { value: null }, tExp: { value: null }, tB0: { value: rtL[0].texture }, tB1: { value: rtL[1].texture }, tB2: { value: rtL[2].texture },
    tB3: { value: rtL[3].texture }, tB4: { value: rtL[4].texture }, tS: { value: rtS[1].texture }, tDirt: { value: dirt },
    uBw: { value: new THREE.Vector4() }, uBw4: { value: 0 }, uBloom: { value: 0.3 }, uStreak: { value: 0 }, uSTint: { value: look.streakTint },
    uFlash: { value: 0 }, uDirt: { value: 0 } };
  tonePass.mTone = mat(`
    uniform sampler2D tDiffuse, tExp, tB0, tB1, tB2, tB3, tB4, tS, tDirt; uniform vec4 uBw; uniform float uBw4, uBloom, uStreak, uFlash, uDirt; uniform vec3 uSTint;
    varying vec2 vUv;
    ${CINE_GLSL}
    void main(){
      vec3 c=texture2D(tDiffuse,vUv).rgb; c=any(isnan(c)) ? vec3(0.) : min(c,vec3(6e4));
      vec3 b=texture2D(tB0,vUv).rgb*uBw.x+texture2D(tB1,vUv).rgb*uBw.y+texture2D(tB2,vUv).rgb*uBw.z+texture2D(tB3,vUv).rgb*uBw.w+texture2D(tB4,vUv).rgb*uBw4;
      float f2=uFlash*uFlash;
      c+=b*(uBloom+2.5*uFlash);                                       // the flash is the lens flooding: bloom swells first
      c+=texture2D(tS,vUv).rgb*uSTint*uStreak;
      if(uDirt>0.) c+=texture2D(tDirt,vUv).rgb*(texture2D(tB2,vUv).rgb*.3+texture2D(tB3,vUv).rgb+texture2D(tB4,vUv).rgb)*uDirt*1.6;
      c+=f2*vec3(1.,.72,.5)*.9;                                       // warm wash in HDR: the tone curve rolls it to cream, never flat orange
      float e=texture2D(tExp,vec2(.5)).r*(1.+1.6*f2);
      vec3 o=cineGrade(cineOETF(cineTone(c*e/.6)));
      gl_FragColor=vec4(o,1.); }`, toneU);

  // ---------------------------------------------------------------- lens: heat shimmer, FXAA, vignette, grain, dither
  const lensU = { tDiffuse: { value: null }, res: { value: new THREE.Vector2(1, 1) }, time: { value: 0 }, grain: { value: look.grain }, vig: { value: look.vignette },
    heat: { value: 0 }, heatAt: { value: new THREE.Vector2(0.5, 0.5) }, heatLocal: { value: 0 }, fxaa: { value: 0 },
    scrim: { value: new THREE.Vector4(0.5, 0.5, 1, 1) }, scrimK: { value: 0 } }; // soft burn behind on-screen copy: centre uv (y up), radii uv, depth
  const mLens = mat(`
    uniform sampler2D tDiffuse; uniform vec2 res, heatAt; uniform vec4 scrim; uniform float time, grain, vig, heat, heatLocal, fxaa, scrimK; varying vec2 vUv;
    ${CINE_GLSL}
    float vh(vec2 p){ return cH12(p*1.17+.31); }
    float vn(vec2 x){ vec2 i=floor(x),f=fract(x); f=f*f*(3.-2.*f); return mix(mix(vh(i),vh(i+vec2(1,0)),f.x),mix(vh(i+vec2(0,1)),vh(i+vec2(1,1)),f.x),f.y); }
    float lu(vec3 c){ return dot(c,vec3(.299,.587,.114)); }
    vec3 fx3(vec2 uv){ // FXAA (console variant): 5 taps, edge-directed blur, rejects when it leaves the local range
      vec2 px=1./res; vec3 nw=texture2D(tDiffuse,uv+vec2(-.5,-.5)*px).rgb, ne=texture2D(tDiffuse,uv+vec2(.5,-.5)*px).rgb,
        sw=texture2D(tDiffuse,uv+vec2(-.5,.5)*px).rgb, se=texture2D(tDiffuse,uv+vec2(.5,.5)*px).rgb, m=texture2D(tDiffuse,uv).rgb;
      float a=lu(nw), b=lu(ne), c=lu(sw), d=lu(se), l=lu(m), lmin=min(l,min(min(a,b),min(c,d))), lmax=max(l,max(max(a,b),max(c,d)));
      if(lmax-lmin<max(.0312,lmax*.125)) return m;
      vec2 dir=vec2(-((a+b)-(c+d)),(a+c)-(b+d));
      float rd=max((a+b+c+d)*.03125,1./128.); dir=clamp(dir/(min(abs(dir.x),abs(dir.y))+rd),-8.,8.)*px;
      vec3 A=.5*(texture2D(tDiffuse,uv-dir*.1667).rgb+texture2D(tDiffuse,uv+dir*.1667).rgb);
      vec3 B=A*.5+.25*(texture2D(tDiffuse,uv-dir*.5).rgb+texture2D(tDiffuse,uv+dir*.5).rgb);
      float lb=lu(B); return (lb<lmin||lb>lmax) ? A : B; }
    void main(){
      vec2 uv=vUv;
      if(heat>0.){ // refraction through hot air: two octaves of drifting noise, rising; entry = edge weighted, local = around heatAt
        float asp=res.x/res.y; vec2 q=vec2(uv.x*asp,uv.y);
        vec2 n=vec2(vn(q*6.+vec2(0.,-time*1.6)),vn(q*6.+vec2(5.2,3.-time*1.3)))-.5;
        n+=.5*(vec2(vn(q*15.+vec2(1.,-time*3.1)),vn(q*15.+vec2(9.,-time*2.7)))-.5);
        vec2 dq=(uv-heatAt)*vec2(asp,1.);
        float w=heatLocal>.5 ? exp(-dot(dq,dq)*30.)*smoothstep(-.06,.06,uv.y-heatAt.y) : .3+.7*smoothstep(.15,.75,length((uv-.5)*vec2(asp,1.)));
        uv+=n*heat*w*vec2(.0035,.006); }
      vec3 col=fxaa>.5 ? fx3(uv) : texture2D(tDiffuse,uv).rgb;
      vec2 c=vUv-.5; float r2=dot(c,c);
      col*=mix(1.,smoothstep(.75,.12,r2*1.6),vig);
      if(scrimK>0.){ vec2 q=(vUv-scrim.xy)/scrim.zw; col*=1.-scrimK*exp(-dot(q,q)); } // a printer's burn under the copy, never a box
      gl_FragColor=vec4(clamp(cineGrain(col,gl_FragCoord.xy,time,grain),0.,1.),1.); }`, lensU);

  // ---------------------------------------------------------------- sizing + quality
  let w = 1, h = 1, bw = 1, bh = 1;
  function setSize() {
    w = composer.renderTarget1.width; h = composer.renderTarget1.height; lensU.res.value.set(w, h);
    bw = Math.max(1, w >> Q.div); bh = Math.max(1, h >> Q.div);
    rtPre.setSize(bw, bh); mPre.uniforms.uTexel.value.set(0.5 * (1 << Q.div) / w, 0.5 * (1 << Q.div) / h); // 4 taps at source-texel corners of the 2^div block
    let sw = bw, sh = bh;
    for (let i = 0; i < 5; i++) { const dw = Math.max(1, i ? sw >> 1 : sw), dh = Math.max(1, i ? sh >> 1 : sh); rtT[i].setSize(dw, dh); rtL[i].setSize(dw, dh); sw = dw; sh = dh; }
    const stw = Math.max(1, bw >> 1), sth = Math.max(1, bh >> 2);
    rtS[0].setSize(stw, sth); rtS[1].setSize(stw, sth);
    mSDown.uniforms.uTexel.value.set(1 / bw, 1 / bh);
    let tot = 0; for (let i = 0; i < Q.lv; i++) tot += BW[i];
    const k = i => (i < Q.lv ? BW[i] / tot : 0);
    toneU.uBw.value.set(k(0), k(1), k(2), k(3)); toneU.uBw4.value = k(4);
    mbPass.histOk = false;
  }
  function setQuality(l) {
    explicit = true; l = Math.max(0, Math.min(3, Math.round(+l || 0)));
    if (l === level) return; level = l; Q = QL[l]; api.level = l; setSize();
    if (Q.aa !== 3 && mbPass.hist) { mbPass.hist.forEach(t => t.dispose()); mbPass.hist = null; mbPass.histOk = false; } // free 2 full-res HDR buffers
  }

  // ---------------------------------------------------------------- GPU timing (debug: EXT_disjoint_timer_query_webgl2, if exposed)
  const gl = renderer.getContext(), tq = gl.getExtension && gl.getExtension('EXT_disjoint_timer_query_webgl2');
  const times = {}, pend = [];
  let profiling = false;
  const tBeg = name => { if (!profiling || !tq) return null; const q = gl.createQuery(); gl.beginQuery(tq.TIME_ELAPSED_EXT, q); return [name, q]; };
  const tEnd = e => { if (!e) return; gl.endQuery(tq.TIME_ELAPSED_EXT); pend.push(e); };
  function poll() {
    if (!tq) return;
    const dis = gl.getParameter(tq.GPU_DISJOINT_EXT);
    for (let i = pend.length - 1; i >= 0; i--) {
      const [n, q] = pend[i]; if (!gl.getQueryParameter(q, gl.QUERY_RESULT_AVAILABLE)) continue;
      if (!dis) { const ms = gl.getQueryParameter(q, gl.QUERY_RESULT) / 1e6; times[n] = times[n] == null ? ms : times[n] * 0.9 + ms * 0.1; }
      gl.deleteQuery(q); pend.splice(i, 1);
    }
  }

  // ---------------------------------------------------------------- per frame
  const T1 = () => composer.renderTarget1, T2 = () => composer.renderTarget2;
  const other = tex => (tex === T1().texture ? T2() : T1());
  const fakeRead = { texture: null };
  const halton = (i, b) => { let f = 1, r = 0; while (i > 0) { f /= b; r += f * (i % b); i = Math.floor(i / b); } return r; };
  function jitter(on) {
    if (!on) { scenePass.jx = scenePass.jy = 0; return; }
    const i = (frame % 8) + 1; scenePass.jx = halton(i, 2) - 0.5; scenePass.jy = halton(i, 3) - 0.5;
  }
  function render(force = false, warmStep = 0) {
    if (level < 0) setQuality(low ? 1 : 3), explicit = false;
    frame++; poll();
    const r = renderer, q = force ? (warmStep ? { aa: 1, lv: 5, streak: true } : { aa: 2, lv: 5, streak: true }) : Q;
    let e = tBeg('scene');
    if (scenePass.enabled) { scenePass.useRT = true; scenePass.render(r); }
    tEnd(e);
    let cur = scenePass.rt.texture;
    // HDR FX (AO, TAA, motion blur): output stays in its own target when nothing follows (no copy)
    e = tBeg('hdrfx');
    if (mbPass.enabled) { const u = mbPass.mTaa.uniforms; u.wStill.value = look.taaStill; u.wMove.value = look.taaMove; mbPass.render(r, T1()); cur = mbPass.outTex || T1().texture; }
    tEnd(e);
    e = tBeg('dof');
    if (dof.enabled) {
      const u = dof.uniforms, tg = other(cur); u.tColor.value = cur; u.tDepth.value = scenePass.rt.depthTexture; u.nearClip.value = cam.near; u.farClip.value = cam.far;
      r.setRenderTarget(tg); dof.fsQuad.render(r); cur = tg.texture;
    }
    tEnd(e);
    // bloom chain (+ streak), half or quarter res
    e = tBeg('bloom');
    mPre.uniforms.tSrc.value = cur; mPre.uniforms.uThr.value = look.threshold; mPre.uniforms.uKnee.value = look.knee; draw(mPre, rtPre);
    for (let i = 0; i < q.lv; i++) {
      const tw = rtT[i].width, th = rtT[i].height;
      mBlur.uniforms.tSrc.value = i ? rtL[i - 1].texture : rtPre.texture; mBlur.uniforms.uDir.value.set(1 / tw, 0); draw(mBlur, rtT[i]);
      mBlur.uniforms.tSrc.value = rtT[i].texture; mBlur.uniforms.uDir.value.set(0, 1 / th); draw(mBlur, rtL[i]);
    }
    const sOn = q.streak && (force || (fx.streak > 0 && look.streak > 0));
    if (sOn) {
      mSDown.uniforms.tSrc.value = rtPre.texture; mSDown.uniforms.uThr.value = Math.max(0, look.streakThr - look.threshold); draw(mSDown, rtS[1]);
      const tx = 1 / rtS[0].width; mSBlur.uniforms.uTx.value = tx;
      mSBlur.uniforms.tSrc.value = rtS[1].texture; mSBlur.uniforms.uStep.value = 1; draw(mSBlur, rtS[0]);
      mSBlur.uniforms.tSrc.value = rtS[0].texture; mSBlur.uniforms.uStep.value = 4; draw(mSBlur, rtS[1]);
      mSBlur.uniforms.tSrc.value = rtS[1].texture; mSBlur.uniforms.uStep.value = 16; draw(mSBlur, rtS[0]);
      toneU.tS.value = rtS[0].texture;
    }
    tEnd(e);
    // tone (exposure state is updated inside tonePass)
    e = tBeg('tone');
    const bl = bloom.strength;
    toneU.uBloom.value = look.bloom * bl * (1 + fx.bloom); toneU.uStreak.value = sOn ? look.streak * fx.streak : 0;
    toneU.uFlash.value = force ? 0.5 : Math.min(1, Math.max(0, fx.flash)); toneU.uDirt.value = force ? 1 : Math.max(0, fx.dirt);
    let X = other(cur); fakeRead.texture = cur; tonePass.render(r, X, fakeRead); cur = X.texture;
    tEnd(e);
    e = tBeg('aa');
    if (q.aa === 2) { const Y = other(cur); smaa.renderToScreen = false; smaa.render(r, Y, X); cur = Y.texture; }
    tEnd(e);
    e = tBeg('lens');
    lensU.tDiffuse.value = cur; lensU.time.value = api.time; lensU.fxaa.value = q.aa === 1 ? 1 : 0;
    lensU.grain.value = look.grain; lensU.vig.value = look.vignette;
    const ht = force ? 0.5 : Math.max(0, fx.heat); lensU.heat.value = ht;
    if (fx.heatAt) { lensU.heatAt.value.set(fx.heatAt[0], fx.heatAt[1]); lensU.heatLocal.value = 1; } else lensU.heatLocal.value = 0;
    draw(mLens, null);
    tEnd(e);
  }

  const api = {
    fx, look, level, time: 0,
    taaOn: () => (level < 0 ? !low : Q.aa === 3),
    jitter, render, setSize, setQuality,
    profile(on = true) { profiling = !!on && !!tq; return profiling; },
    // scrim(cx, cy, rx, ry, k): darken a soft ellipse (uv, y up) by up to k behind copy that sits over a busy frame; k 0 = off
    scrim(cx, cy, rx, ry, k) { lensU.scrim.value.set(cx, cy, Math.max(1e-3, rx), Math.max(1e-3, ry)); lensU.scrimK.value = Math.max(0, k); },
    // one call per frame from main.js sets every lens knob from the story clocks (curves live here, with the look):
    // entry e 0..1 (p .40-.60, swap at e .30), gR = rockets' colony clock (ignite .80, liftoff .83), plume = [u, v] screen uv of
    // the engines (y up) or null. Anything not passed counts as outside its window.
    lensFrame({ entry = -1, gR = -1, plume = null } = {}) {
      const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); }, g = (x, c, w) => Math.exp(-(((x - c) / w) ** 2));
      const inE = entry > 0 && entry < 1 ? 1 : 0, e = entry;
      // entry: plasma shimmer from the frame edges in, the lens floods at the swap (covers the cut), dirt catches it
      const eHeat = inE * 0.9 * ss(0.05, 0.22, e) * (1 - ss(0.42, 0.62, e)), eFlash = inE * 0.85 * g(e, 0.30, 0.045);
      const eDirt = inE * 0.7 * ss(0.16, 0.30, e) * (1 - ss(0.30, 0.52, e)), eBloom = inE * 0.6 * ss(0.1, 0.3, e) * (1 - ss(0.3, 0.55, e));
      // launch: heat haze over the engines, a short flare at liftoff, dirt lit by the plume, streaks a touch hotter
      const L = gR >= 0.78 ? ss(0.79, 0.83, gR) : 0, lFlash = gR >= 0.78 ? 0.25 * g(gR, 0.835, 0.012) : 0;
      fx.heat = Math.max(eHeat, plume ? 0.55 * L : 0); fx.heatAt = eHeat >= 0.55 * L || !plume ? null : [plume[0], plume[1]];
      fx.flash = Math.max(eFlash, lFlash); fx.dirt = Math.max(eDirt, 0.45 * L); fx.bloom = Math.max(eBloom, 0.25 * L); fx.streak = 1 + 0.3 * L;
    },
    gpuTimes() { profiling = !!tq; const o = {}; let s = 0; for (const k in times) { o[k] = +times[k].toFixed(3); s += times[k]; } o.total = +s.toFixed(3); o.supported = !!tq; return o; }
  };
  setSize(); CINE_LIVE.add(api);
  return api;
}

// lens dirt: soft dust blobs + a few faint aperture rings, drawn once (lit only by the bloom, so invisible until a hot light hits it)
function dirtTexture(THREE) {
  if (typeof document === 'undefined') return null;
  const cv = document.createElement('canvas'); cv.width = 512; cv.height = 288;
  const g = cv.getContext('2d'); let s = 7; const R = () => (s = (s * 16807) % 2147483647) / 2147483647;
  g.fillStyle = '#000'; g.fillRect(0, 0, 512, 288); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 90; i++) {
    const x = R() * 512, y = R() * 288, r = 3 + R() * R() * 46, a = 0.03 + R() * 0.09, gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, `rgba(255,238,214,${a})`); gr.addColorStop(0.6, `rgba(255,232,206,${a * 0.45})`); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 6.2832); g.fill();
  }
  g.lineWidth = 2;
  for (let i = 0; i < 7; i++) {
    const x = R() * 512, y = R() * 288, r = 14 + R() * 30, a = 0.05 + R() * 0.05; g.strokeStyle = `rgba(255,236,220,${a})`; g.beginPath();
    for (let k = 0; k <= 6; k++) { const t = k / 6 * 6.2832 + 0.3; g[k ? 'lineTo' : 'moveTo'](x + r * Math.cos(t), y + r * Math.sin(t)); } g.stroke();
  }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.NoColorSpace; return t;
}
