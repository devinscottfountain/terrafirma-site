import{a as yr}from"./chunk-76JC7EWI.js";import{a as wr}from"./chunk-LM5OH3CR.js";import{a as gn,b as xn,c as bn,e as yn}from"./chunk-TAKKMMN3.js";import{a as xa}from"./chunk-4CI7YULG.js";import"./chunk-4C5RVMER.js";import{a as vn,b as pn}from"./chunk-M5U4GD3X.js";import{a as xr,b as dn,c as Oo,e as br,f as mn}from"./chunk-SKKE744E.js";import"./chunk-FCTCDFK5.js";import{m as wn}from"./chunk-IPFIGNCI.js";import{Clock as Xs,HalfFloatType as Ks,NoBlending as Ys,Vector2 as An,WebGLRenderTarget as Qs}from"three";var Fo={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`};import{ShaderMaterial as Sn,UniformsUtils as qs}from"three";import{BufferGeometry as Is,Float32BufferAttribute as Mn,OrthographicCamera as Gs,Mesh as Ts}from"three";var qt=class{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}},Ws=new Gs(-1,1,1,-1,0,1),Mr=class extends Is{constructor(){super(),this.setAttribute("position",new Mn([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new Mn([0,2,0,0,2,0],2))}},js=new Mr,Zt=class{constructor(t){this._mesh=new Ts(js,t)}dispose(){this._mesh.geometry.dispose()}render(t){t.render(this._mesh,Ws)}get material(){return this._mesh.material}set material(t){this._mesh.material=t}};var Wa=class extends qt{constructor(t,r){super(),this.textureID=r!==void 0?r:"tDiffuse",t instanceof Sn?(this.uniforms=t.uniforms,this.material=t):t&&(this.uniforms=qs.clone(t.uniforms),this.material=new Sn({name:t.name!==void 0?t.name:"unspecified",defines:Object.assign({},t.defines),uniforms:this.uniforms,vertexShader:t.vertexShader,fragmentShader:t.fragmentShader})),this.fsQuad=new Zt(this.material)}render(t,r,u){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=u.texture),this.fsQuad.material=this.material,this.renderToScreen?(t.setRenderTarget(null),this.fsQuad.render(t)):(t.setRenderTarget(r),this.clear&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),this.fsQuad.render(t))}dispose(){this.material.dispose(),this.fsQuad.dispose()}};var io=class extends qt{constructor(t,r){super(),this.scene=t,this.camera=r,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(t,r,u){let a=t.getContext(),n=t.state;n.buffers.color.setMask(!1),n.buffers.depth.setMask(!1),n.buffers.color.setLocked(!0),n.buffers.depth.setLocked(!0);let L,x;this.inverse?(L=0,x=1):(L=1,x=0),n.buffers.stencil.setTest(!0),n.buffers.stencil.setOp(a.REPLACE,a.REPLACE,a.REPLACE),n.buffers.stencil.setFunc(a.ALWAYS,L,4294967295),n.buffers.stencil.setClear(x),n.buffers.stencil.setLocked(!0),t.setRenderTarget(u),this.clear&&t.clear(),t.render(this.scene,this.camera),t.setRenderTarget(r),this.clear&&t.clear(),t.render(this.scene,this.camera),n.buffers.color.setLocked(!1),n.buffers.depth.setLocked(!1),n.buffers.color.setMask(!0),n.buffers.depth.setMask(!0),n.buffers.stencil.setLocked(!1),n.buffers.stencil.setFunc(a.EQUAL,1,4294967295),n.buffers.stencil.setOp(a.KEEP,a.KEEP,a.KEEP),n.buffers.stencil.setLocked(!0)}},Bo=class extends qt{constructor(){super(),this.needsSwap=!1}render(t){t.state.buffers.stencil.setLocked(!1),t.state.buffers.stencil.setTest(!1)}};var Vo=class{constructor(t,r){if(this.renderer=t,this._pixelRatio=t.getPixelRatio(),r===void 0){let u=t.getSize(new An);this._width=u.width,this._height=u.height,r=new Qs(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:Ks}),r.texture.name="EffectComposer.rt1"}else this._width=r.width,this._height=r.height;this.renderTarget1=r,this.renderTarget2=r.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new Wa(Fo),this.copyPass.material.blending=Ys,this.clock=new Xs}swapBuffers(){let t=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=t}addPass(t){this.passes.push(t),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(t,r){this.passes.splice(r,0,t),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(t){let r=this.passes.indexOf(t);r!==-1&&this.passes.splice(r,1)}isLastEnabledPass(t){for(let r=t+1;r<this.passes.length;r++)if(this.passes[r].enabled)return!1;return!0}render(t){t===void 0&&(t=this.clock.getDelta());let r=this.renderer.getRenderTarget(),u=!1;for(let a=0,n=this.passes.length;a<n;a++){let L=this.passes[a];if(L.enabled!==!1){if(L.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(a),L.render(this.renderer,this.writeBuffer,this.readBuffer,t,u),L.needsSwap){if(u){let x=this.renderer.getContext(),k=this.renderer.state.buffers.stencil;k.setFunc(x.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,t),k.setFunc(x.EQUAL,1,4294967295)}this.swapBuffers()}io!==void 0&&(L instanceof io?u=!0:L instanceof Bo&&(u=!1))}}this.renderer.setRenderTarget(r)}reset(t){if(t===void 0){let r=this.renderer.getSize(new An);this._pixelRatio=this.renderer.getPixelRatio(),this._width=r.width,this._height=r.height,t=this.renderTarget1.clone(),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=t,this.renderTarget2=t.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(t,r){this._width=t,this._height=r;let u=this._width*this._pixelRatio,a=this._height*this._pixelRatio;this.renderTarget1.setSize(u,a),this.renderTarget2.setSize(u,a);for(let n=0;n<this.passes.length;n++)this.passes[n].setSize(u,a)}setPixelRatio(t){this._pixelRatio=t,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}};import{AdditiveBlending as Js,Color as Dn,HalfFloatType as Sr,MeshBasicMaterial as Rs,ShaderMaterial as Uo,UniformsUtils as zn,Vector2 as ba,Vector3 as lo,WebGLRenderTarget as Ar}from"three";import{Color as Zs}from"three";var Cn={name:"LuminosityHighPassShader",shaderID:"luminosityHighPass",uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new Zs(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			vec3 luma = vec3( 0.299, 0.587, 0.114 );

			float v = dot( texel.xyz, luma );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`};var ja=class e extends qt{constructor(t,r,u,a){super(),this.strength=r!==void 0?r:1,this.radius=u,this.threshold=a,this.resolution=t!==void 0?new ba(t.x,t.y):new ba(256,256),this.clearColor=new Dn(0,0,0),this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let n=Math.round(this.resolution.x/2),L=Math.round(this.resolution.y/2);this.renderTargetBright=new Ar(n,L,{type:Sr}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let z=0;z<this.nMips;z++){let T=new Ar(n,L,{type:Sr});T.texture.name="UnrealBloomPass.h"+z,T.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(T);let W=new Ar(n,L,{type:Sr});W.texture.name="UnrealBloomPass.v"+z,W.texture.generateMipmaps=!1,this.renderTargetsVertical.push(W),n=Math.round(n/2),L=Math.round(L/2)}let x=Cn;this.highPassUniforms=zn.clone(x.uniforms),this.highPassUniforms.luminosityThreshold.value=a,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new Uo({uniforms:this.highPassUniforms,vertexShader:x.vertexShader,fragmentShader:x.fragmentShader}),this.separableBlurMaterials=[];let k=[3,5,7,9,11];n=Math.round(this.resolution.x/2),L=Math.round(this.resolution.y/2);for(let z=0;z<this.nMips;z++)this.separableBlurMaterials.push(this.getSeperableBlurMaterial(k[z])),this.separableBlurMaterials[z].uniforms.invSize.value=new ba(1/n,1/L),n=Math.round(n/2),L=Math.round(L/2);this.compositeMaterial=this.getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=r,this.compositeMaterial.uniforms.bloomRadius.value=.1;let S=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=S,this.bloomTintColors=[new lo(1,1,1),new lo(1,1,1),new lo(1,1,1),new lo(1,1,1),new lo(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors;let B=Fo;this.copyUniforms=zn.clone(B.uniforms),this.blendMaterial=new Uo({uniforms:this.copyUniforms,vertexShader:B.vertexShader,fragmentShader:B.fragmentShader,blending:Js,depthTest:!1,depthWrite:!1,transparent:!0}),this.enabled=!0,this.needsSwap=!1,this._oldClearColor=new Dn,this.oldClearAlpha=1,this.basic=new Rs,this.fsQuad=new Zt(null)}dispose(){for(let t=0;t<this.renderTargetsHorizontal.length;t++)this.renderTargetsHorizontal[t].dispose();for(let t=0;t<this.renderTargetsVertical.length;t++)this.renderTargetsVertical[t].dispose();this.renderTargetBright.dispose();for(let t=0;t<this.separableBlurMaterials.length;t++)this.separableBlurMaterials[t].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this.basic.dispose(),this.fsQuad.dispose()}setSize(t,r){let u=Math.round(t/2),a=Math.round(r/2);this.renderTargetBright.setSize(u,a);for(let n=0;n<this.nMips;n++)this.renderTargetsHorizontal[n].setSize(u,a),this.renderTargetsVertical[n].setSize(u,a),this.separableBlurMaterials[n].uniforms.invSize.value=new ba(1/u,1/a),u=Math.round(u/2),a=Math.round(a/2)}render(t,r,u,a,n){t.getClearColor(this._oldClearColor),this.oldClearAlpha=t.getClearAlpha();let L=t.autoClear;t.autoClear=!1,t.setClearColor(this.clearColor,0),n&&t.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this.fsQuad.material=this.basic,this.basic.map=u.texture,t.setRenderTarget(null),t.clear(),this.fsQuad.render(t)),this.highPassUniforms.tDiffuse.value=u.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this.fsQuad.material=this.materialHighPassFilter,t.setRenderTarget(this.renderTargetBright),t.clear(),this.fsQuad.render(t);let x=this.renderTargetBright;for(let k=0;k<this.nMips;k++)this.fsQuad.material=this.separableBlurMaterials[k],this.separableBlurMaterials[k].uniforms.colorTexture.value=x.texture,this.separableBlurMaterials[k].uniforms.direction.value=e.BlurDirectionX,t.setRenderTarget(this.renderTargetsHorizontal[k]),t.clear(),this.fsQuad.render(t),this.separableBlurMaterials[k].uniforms.colorTexture.value=this.renderTargetsHorizontal[k].texture,this.separableBlurMaterials[k].uniforms.direction.value=e.BlurDirectionY,t.setRenderTarget(this.renderTargetsVertical[k]),t.clear(),this.fsQuad.render(t),x=this.renderTargetsVertical[k];this.fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,t.setRenderTarget(this.renderTargetsHorizontal[0]),t.clear(),this.fsQuad.render(t),this.fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,n&&t.state.buffers.stencil.setTest(!0),this.renderToScreen?(t.setRenderTarget(null),this.fsQuad.render(t)):(t.setRenderTarget(u),this.fsQuad.render(t)),t.setClearColor(this._oldClearColor,this.oldClearAlpha),t.autoClear=L}getSeperableBlurMaterial(t){let r=[];for(let u=0;u<t;u++)r.push(.39894*Math.exp(-.5*u*u/(t*t))/t);return new Uo({defines:{KERNEL_RADIUS:t},uniforms:{colorTexture:{value:null},invSize:{value:new ba(.5,.5)},direction:{value:new ba(.5,.5)},gaussianCoefficients:{value:r}},vertexShader:`varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,fragmentShader:`#include <common>
				varying vec2 vUv;
				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float gaussianCoefficients[KERNEL_RADIUS];

				void main() {
					float weightSum = gaussianCoefficients[0];
					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * weightSum;
					for( int i = 1; i < KERNEL_RADIUS; i ++ ) {
						float x = float(i);
						float w = gaussianCoefficients[i];
						vec2 uvOffset = direction * invSize * x;
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += (sample1 + sample2) * w;
						weightSum += 2.0 * w;
					}
					gl_FragColor = vec4(diffuseSum/weightSum, 1.0);
				}`})}getCompositeMaterial(t){return new Uo({defines:{NUM_MIPS:t},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,fragmentShader:`varying vec2 vUv;
				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor(const in float factor) {
					float mirrorFactor = 1.2 - factor;
					return mix(factor, mirrorFactor, bloomRadius);
				}

				void main() {
					gl_FragColor = bloomStrength * ( lerpBloomFactor(bloomFactors[0]) * vec4(bloomTintColors[0], 1.0) * texture2D(blurTexture1, vUv) +
						lerpBloomFactor(bloomFactors[1]) * vec4(bloomTintColors[1], 1.0) * texture2D(blurTexture2, vUv) +
						lerpBloomFactor(bloomFactors[2]) * vec4(bloomTintColors[2], 1.0) * texture2D(blurTexture3, vUv) +
						lerpBloomFactor(bloomFactors[3]) * vec4(bloomTintColors[3], 1.0) * texture2D(blurTexture4, vUv) +
						lerpBloomFactor(bloomFactors[4]) * vec4(bloomTintColors[4], 1.0) * texture2D(blurTexture5, vUv) );
				}`})}};ja.BlurDirectionX=new ba(1,0);ja.BlurDirectionY=new ba(0,1);import{Color as _s,HalfFloatType as Hs,MeshDepthMaterial as Es,NearestFilter as Pn,NoBlending as $s,RGBADepthPacking as ei,ShaderMaterial as ti,UniformsUtils as ai,WebGLRenderTarget as oi}from"three";var No={name:"BokehShader",defines:{DEPTH_PACKING:1,PERSPECTIVE_CAMERA:1},uniforms:{tColor:{value:null},tDepth:{value:null},focus:{value:1},aspect:{value:1},aperture:{value:.025},maxblur:{value:.01},nearClip:{value:1},farClip:{value:1e3}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		#include <common>

		varying vec2 vUv;

		uniform sampler2D tColor;
		uniform sampler2D tDepth;

		uniform float maxblur; // max blur amount
		uniform float aperture; // aperture - bigger values for shallower depth of field

		uniform float nearClip;
		uniform float farClip;

		uniform float focus;
		uniform float aspect;

		#include <packing>

		float getDepth( const in vec2 screenPosition ) {
			#if DEPTH_PACKING == 1
			return unpackRGBAToDepth( texture2D( tDepth, screenPosition ) );
			#else
			return texture2D( tDepth, screenPosition ).x;
			#endif
		}

		float getViewZ( const in float depth ) {
			#if PERSPECTIVE_CAMERA == 1
			return perspectiveDepthToViewZ( depth, nearClip, farClip );
			#else
			return orthographicDepthToViewZ( depth, nearClip, farClip );
			#endif
		}


		void main() {

			vec2 aspectcorrect = vec2( 1.0, aspect );

			float viewZ = getViewZ( getDepth( vUv ) );

			float factor = ( focus + viewZ ); // viewZ is <= 0, so this is a difference equation

			vec2 dofblur = vec2 ( clamp( factor * aperture, -maxblur, maxblur ) );

			vec2 dofblur9 = dofblur * 0.9;
			vec2 dofblur7 = dofblur * 0.7;
			vec2 dofblur4 = dofblur * 0.4;

			vec4 col = vec4( 0.0 );

			col += texture2D( tColor, vUv.xy );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.0,   0.4  ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.15,  0.37 ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.29,  0.29 ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.37,  0.15 ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.40,  0.0  ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.37, -0.15 ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.29, -0.29 ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.15, -0.37 ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.0,  -0.4  ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.15,  0.37 ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.29,  0.29 ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.37,  0.15 ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.4,   0.0  ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.37, -0.15 ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.29, -0.29 ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.15, -0.37 ) * aspectcorrect ) * dofblur );

			col += texture2D( tColor, vUv.xy + ( vec2(  0.15,  0.37 ) * aspectcorrect ) * dofblur9 );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.37,  0.15 ) * aspectcorrect ) * dofblur9 );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.37, -0.15 ) * aspectcorrect ) * dofblur9 );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.15, -0.37 ) * aspectcorrect ) * dofblur9 );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.15,  0.37 ) * aspectcorrect ) * dofblur9 );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.37,  0.15 ) * aspectcorrect ) * dofblur9 );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.37, -0.15 ) * aspectcorrect ) * dofblur9 );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.15, -0.37 ) * aspectcorrect ) * dofblur9 );

			col += texture2D( tColor, vUv.xy + ( vec2(  0.29,  0.29 ) * aspectcorrect ) * dofblur7 );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.40,  0.0  ) * aspectcorrect ) * dofblur7 );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.29, -0.29 ) * aspectcorrect ) * dofblur7 );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.0,  -0.4  ) * aspectcorrect ) * dofblur7 );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.29,  0.29 ) * aspectcorrect ) * dofblur7 );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.4,   0.0  ) * aspectcorrect ) * dofblur7 );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.29, -0.29 ) * aspectcorrect ) * dofblur7 );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.0,   0.4  ) * aspectcorrect ) * dofblur7 );

			col += texture2D( tColor, vUv.xy + ( vec2(  0.29,  0.29 ) * aspectcorrect ) * dofblur4 );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.4,   0.0  ) * aspectcorrect ) * dofblur4 );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.29, -0.29 ) * aspectcorrect ) * dofblur4 );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.0,  -0.4  ) * aspectcorrect ) * dofblur4 );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.29,  0.29 ) * aspectcorrect ) * dofblur4 );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.4,   0.0  ) * aspectcorrect ) * dofblur4 );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.29, -0.29 ) * aspectcorrect ) * dofblur4 );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.0,   0.4  ) * aspectcorrect ) * dofblur4 );

			gl_FragColor = col / 41.0;
			gl_FragColor.a = 1.0;

		}`};var Io=class extends qt{constructor(t,r,u){super(),this.scene=t,this.camera=r;let a=u.focus!==void 0?u.focus:1,n=u.aperture!==void 0?u.aperture:.025,L=u.maxblur!==void 0?u.maxblur:1;this.renderTargetDepth=new oi(1,1,{minFilter:Pn,magFilter:Pn,type:Hs}),this.renderTargetDepth.texture.name="BokehPass.depth",this.materialDepth=new Es,this.materialDepth.depthPacking=ei,this.materialDepth.blending=$s;let x=No,k=ai.clone(x.uniforms);k.tDepth.value=this.renderTargetDepth.texture,k.focus.value=a,k.aspect.value=r.aspect,k.aperture.value=n,k.maxblur.value=L,k.nearClip.value=r.near,k.farClip.value=r.far,this.materialBokeh=new ti({defines:Object.assign({},x.defines),uniforms:k,vertexShader:x.vertexShader,fragmentShader:x.fragmentShader}),this.uniforms=k,this.fsQuad=new Zt(this.materialBokeh),this._oldClearColor=new _s}render(t,r,u){this.scene.overrideMaterial=this.materialDepth,t.getClearColor(this._oldClearColor);let a=t.getClearAlpha(),n=t.autoClear;t.autoClear=!1,t.setClearColor(16777215),t.setClearAlpha(1),t.setRenderTarget(this.renderTargetDepth),t.clear(),t.render(this.scene,this.camera),this.uniforms.tColor.value=u.texture,this.uniforms.nearClip.value=this.camera.near,this.uniforms.farClip.value=this.camera.far,this.renderToScreen?(t.setRenderTarget(null),this.fsQuad.render(t)):(t.setRenderTarget(r),t.clear(),this.fsQuad.render(t)),this.scene.overrideMaterial=null,t.setClearColor(this._oldClearColor),t.setClearAlpha(a),t.autoClear=n}setSize(t,r){this.materialBokeh.uniforms.aspect.value=t/r,this.renderTargetDepth.setSize(t,r)}dispose(){this.renderTargetDepth.dispose(),this.materialDepth.dispose(),this.materialBokeh.dispose(),this.fsQuad.dispose()}};import{HalfFloatType as Ln,LinearFilter as ri,NearestFilter as kn,ShaderMaterial as Dr,Texture as On,UniformsUtils as zr,WebGLRenderTarget as Fn}from"three";import{Vector2 as Cr}from"three";var co={name:"SMAAEdgesShader",defines:{SMAA_THRESHOLD:"0.1"},uniforms:{tDiffuse:{value:null},resolution:{value:new Cr(1/1024,1/512)}},vertexShader:`

		uniform vec2 resolution;

		varying vec2 vUv;
		varying vec4 vOffset[ 3 ];

		void SMAAEdgeDetectionVS( vec2 texcoord ) {
			vOffset[ 0 ] = texcoord.xyxy + resolution.xyxy * vec4( -1.0, 0.0, 0.0,  1.0 ); // WebGL port note: Changed sign in W component
			vOffset[ 1 ] = texcoord.xyxy + resolution.xyxy * vec4(  1.0, 0.0, 0.0, -1.0 ); // WebGL port note: Changed sign in W component
			vOffset[ 2 ] = texcoord.xyxy + resolution.xyxy * vec4( -2.0, 0.0, 0.0,  2.0 ); // WebGL port note: Changed sign in W component
		}

		void main() {

			vUv = uv;

			SMAAEdgeDetectionVS( vUv );

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;

		varying vec2 vUv;
		varying vec4 vOffset[ 3 ];

		vec4 SMAAColorEdgeDetectionPS( vec2 texcoord, vec4 offset[3], sampler2D colorTex ) {
			vec2 threshold = vec2( SMAA_THRESHOLD, SMAA_THRESHOLD );

			// Calculate color deltas:
			vec4 delta;
			vec3 C = texture2D( colorTex, texcoord ).rgb;

			vec3 Cleft = texture2D( colorTex, offset[0].xy ).rgb;
			vec3 t = abs( C - Cleft );
			delta.x = max( max( t.r, t.g ), t.b );

			vec3 Ctop = texture2D( colorTex, offset[0].zw ).rgb;
			t = abs( C - Ctop );
			delta.y = max( max( t.r, t.g ), t.b );

			// We do the usual threshold:
			vec2 edges = step( threshold, delta.xy );

			// Then discard if there is no edge:
			if ( dot( edges, vec2( 1.0, 1.0 ) ) == 0.0 )
				discard;

			// Calculate right and bottom deltas:
			vec3 Cright = texture2D( colorTex, offset[1].xy ).rgb;
			t = abs( C - Cright );
			delta.z = max( max( t.r, t.g ), t.b );

			vec3 Cbottom  = texture2D( colorTex, offset[1].zw ).rgb;
			t = abs( C - Cbottom );
			delta.w = max( max( t.r, t.g ), t.b );

			// Calculate the maximum delta in the direct neighborhood:
			float maxDelta = max( max( max( delta.x, delta.y ), delta.z ), delta.w );

			// Calculate left-left and top-top deltas:
			vec3 Cleftleft  = texture2D( colorTex, offset[2].xy ).rgb;
			t = abs( C - Cleftleft );
			delta.z = max( max( t.r, t.g ), t.b );

			vec3 Ctoptop = texture2D( colorTex, offset[2].zw ).rgb;
			t = abs( C - Ctoptop );
			delta.w = max( max( t.r, t.g ), t.b );

			// Calculate the final maximum delta:
			maxDelta = max( max( maxDelta, delta.z ), delta.w );

			// Local contrast adaptation in action:
			edges.xy *= step( 0.5 * maxDelta, delta.xy );

			return vec4( edges, 0.0, 0.0 );
		}

		void main() {

			gl_FragColor = SMAAColorEdgeDetectionPS( vUv, vOffset, tDiffuse );

		}`},uo={name:"SMAAWeightsShader",defines:{SMAA_MAX_SEARCH_STEPS:"8",SMAA_AREATEX_MAX_DISTANCE:"16",SMAA_AREATEX_PIXEL_SIZE:"( 1.0 / vec2( 160.0, 560.0 ) )",SMAA_AREATEX_SUBTEX_SIZE:"( 1.0 / 7.0 )"},uniforms:{tDiffuse:{value:null},tArea:{value:null},tSearch:{value:null},resolution:{value:new Cr(1/1024,1/512)}},vertexShader:`

		uniform vec2 resolution;

		varying vec2 vUv;
		varying vec4 vOffset[ 3 ];
		varying vec2 vPixcoord;

		void SMAABlendingWeightCalculationVS( vec2 texcoord ) {
			vPixcoord = texcoord / resolution;

			// We will use these offsets for the searches later on (see @PSEUDO_GATHER4):
			vOffset[ 0 ] = texcoord.xyxy + resolution.xyxy * vec4( -0.25, 0.125, 1.25, 0.125 ); // WebGL port note: Changed sign in Y and W components
			vOffset[ 1 ] = texcoord.xyxy + resolution.xyxy * vec4( -0.125, 0.25, -0.125, -1.25 ); // WebGL port note: Changed sign in Y and W components

			// And these for the searches, they indicate the ends of the loops:
			vOffset[ 2 ] = vec4( vOffset[ 0 ].xz, vOffset[ 1 ].yw ) + vec4( -2.0, 2.0, -2.0, 2.0 ) * resolution.xxyy * float( SMAA_MAX_SEARCH_STEPS );

		}

		void main() {

			vUv = uv;

			SMAABlendingWeightCalculationVS( vUv );

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		#define SMAASampleLevelZeroOffset( tex, coord, offset ) texture2D( tex, coord + float( offset ) * resolution, 0.0 )

		uniform sampler2D tDiffuse;
		uniform sampler2D tArea;
		uniform sampler2D tSearch;
		uniform vec2 resolution;

		varying vec2 vUv;
		varying vec4 vOffset[3];
		varying vec2 vPixcoord;

		#if __VERSION__ == 100
		vec2 round( vec2 x ) {
			return sign( x ) * floor( abs( x ) + 0.5 );
		}
		#endif

		float SMAASearchLength( sampler2D searchTex, vec2 e, float bias, float scale ) {
			// Not required if searchTex accesses are set to point:
			// float2 SEARCH_TEX_PIXEL_SIZE = 1.0 / float2(66.0, 33.0);
			// e = float2(bias, 0.0) + 0.5 * SEARCH_TEX_PIXEL_SIZE +
			//     e * float2(scale, 1.0) * float2(64.0, 32.0) * SEARCH_TEX_PIXEL_SIZE;
			e.r = bias + e.r * scale;
			return 255.0 * texture2D( searchTex, e, 0.0 ).r;
		}

		float SMAASearchXLeft( sampler2D edgesTex, sampler2D searchTex, vec2 texcoord, float end ) {
			/**
				* @PSEUDO_GATHER4
				* This texcoord has been offset by (-0.25, -0.125) in the vertex shader to
				* sample between edge, thus fetching four edges in a row.
				* Sampling with different offsets in each direction allows to disambiguate
				* which edges are active from the four fetched ones.
				*/
			vec2 e = vec2( 0.0, 1.0 );

			for ( int i = 0; i < SMAA_MAX_SEARCH_STEPS; i ++ ) { // WebGL port note: Changed while to for
				e = texture2D( edgesTex, texcoord, 0.0 ).rg;
				texcoord -= vec2( 2.0, 0.0 ) * resolution;
				if ( ! ( texcoord.x > end && e.g > 0.8281 && e.r == 0.0 ) ) break;
			}

			// We correct the previous (-0.25, -0.125) offset we applied:
			texcoord.x += 0.25 * resolution.x;

			// The searches are bias by 1, so adjust the coords accordingly:
			texcoord.x += resolution.x;

			// Disambiguate the length added by the last step:
			texcoord.x += 2.0 * resolution.x; // Undo last step
			texcoord.x -= resolution.x * SMAASearchLength(searchTex, e, 0.0, 0.5);

			return texcoord.x;
		}

		float SMAASearchXRight( sampler2D edgesTex, sampler2D searchTex, vec2 texcoord, float end ) {
			vec2 e = vec2( 0.0, 1.0 );

			for ( int i = 0; i < SMAA_MAX_SEARCH_STEPS; i ++ ) { // WebGL port note: Changed while to for
				e = texture2D( edgesTex, texcoord, 0.0 ).rg;
				texcoord += vec2( 2.0, 0.0 ) * resolution;
				if ( ! ( texcoord.x < end && e.g > 0.8281 && e.r == 0.0 ) ) break;
			}

			texcoord.x -= 0.25 * resolution.x;
			texcoord.x -= resolution.x;
			texcoord.x -= 2.0 * resolution.x;
			texcoord.x += resolution.x * SMAASearchLength( searchTex, e, 0.5, 0.5 );

			return texcoord.x;
		}

		float SMAASearchYUp( sampler2D edgesTex, sampler2D searchTex, vec2 texcoord, float end ) {
			vec2 e = vec2( 1.0, 0.0 );

			for ( int i = 0; i < SMAA_MAX_SEARCH_STEPS; i ++ ) { // WebGL port note: Changed while to for
				e = texture2D( edgesTex, texcoord, 0.0 ).rg;
				texcoord += vec2( 0.0, 2.0 ) * resolution; // WebGL port note: Changed sign
				if ( ! ( texcoord.y > end && e.r > 0.8281 && e.g == 0.0 ) ) break;
			}

			texcoord.y -= 0.25 * resolution.y; // WebGL port note: Changed sign
			texcoord.y -= resolution.y; // WebGL port note: Changed sign
			texcoord.y -= 2.0 * resolution.y; // WebGL port note: Changed sign
			texcoord.y += resolution.y * SMAASearchLength( searchTex, e.gr, 0.0, 0.5 ); // WebGL port note: Changed sign

			return texcoord.y;
		}

		float SMAASearchYDown( sampler2D edgesTex, sampler2D searchTex, vec2 texcoord, float end ) {
			vec2 e = vec2( 1.0, 0.0 );

			for ( int i = 0; i < SMAA_MAX_SEARCH_STEPS; i ++ ) { // WebGL port note: Changed while to for
				e = texture2D( edgesTex, texcoord, 0.0 ).rg;
				texcoord -= vec2( 0.0, 2.0 ) * resolution; // WebGL port note: Changed sign
				if ( ! ( texcoord.y < end && e.r > 0.8281 && e.g == 0.0 ) ) break;
			}

			texcoord.y += 0.25 * resolution.y; // WebGL port note: Changed sign
			texcoord.y += resolution.y; // WebGL port note: Changed sign
			texcoord.y += 2.0 * resolution.y; // WebGL port note: Changed sign
			texcoord.y -= resolution.y * SMAASearchLength( searchTex, e.gr, 0.5, 0.5 ); // WebGL port note: Changed sign

			return texcoord.y;
		}

		vec2 SMAAArea( sampler2D areaTex, vec2 dist, float e1, float e2, float offset ) {
			// Rounding prevents precision errors of bilinear filtering:
			vec2 texcoord = float( SMAA_AREATEX_MAX_DISTANCE ) * round( 4.0 * vec2( e1, e2 ) ) + dist;

			// We do a scale and bias for mapping to texel space:
			texcoord = SMAA_AREATEX_PIXEL_SIZE * texcoord + ( 0.5 * SMAA_AREATEX_PIXEL_SIZE );

			// Move to proper place, according to the subpixel offset:
			texcoord.y += SMAA_AREATEX_SUBTEX_SIZE * offset;

			return texture2D( areaTex, texcoord, 0.0 ).rg;
		}

		vec4 SMAABlendingWeightCalculationPS( vec2 texcoord, vec2 pixcoord, vec4 offset[ 3 ], sampler2D edgesTex, sampler2D areaTex, sampler2D searchTex, ivec4 subsampleIndices ) {
			vec4 weights = vec4( 0.0, 0.0, 0.0, 0.0 );

			vec2 e = texture2D( edgesTex, texcoord ).rg;

			if ( e.g > 0.0 ) { // Edge at north
				vec2 d;

				// Find the distance to the left:
				vec2 coords;
				coords.x = SMAASearchXLeft( edgesTex, searchTex, offset[ 0 ].xy, offset[ 2 ].x );
				coords.y = offset[ 1 ].y; // offset[1].y = texcoord.y - 0.25 * resolution.y (@CROSSING_OFFSET)
				d.x = coords.x;

				// Now fetch the left crossing edges, two at a time using bilinear
				// filtering. Sampling at -0.25 (see @CROSSING_OFFSET) enables to
				// discern what value each edge has:
				float e1 = texture2D( edgesTex, coords, 0.0 ).r;

				// Find the distance to the right:
				coords.x = SMAASearchXRight( edgesTex, searchTex, offset[ 0 ].zw, offset[ 2 ].y );
				d.y = coords.x;

				// We want the distances to be in pixel units (doing this here allow to
				// better interleave arithmetic and memory accesses):
				d = d / resolution.x - pixcoord.x;

				// SMAAArea below needs a sqrt, as the areas texture is compressed
				// quadratically:
				vec2 sqrt_d = sqrt( abs( d ) );

				// Fetch the right crossing edges:
				coords.y -= 1.0 * resolution.y; // WebGL port note: Added
				float e2 = SMAASampleLevelZeroOffset( edgesTex, coords, ivec2( 1, 0 ) ).r;

				// Ok, we know how this pattern looks like, now it is time for getting
				// the actual area:
				weights.rg = SMAAArea( areaTex, sqrt_d, e1, e2, float( subsampleIndices.y ) );
			}

			if ( e.r > 0.0 ) { // Edge at west
				vec2 d;

				// Find the distance to the top:
				vec2 coords;

				coords.y = SMAASearchYUp( edgesTex, searchTex, offset[ 1 ].xy, offset[ 2 ].z );
				coords.x = offset[ 0 ].x; // offset[1].x = texcoord.x - 0.25 * resolution.x;
				d.x = coords.y;

				// Fetch the top crossing edges:
				float e1 = texture2D( edgesTex, coords, 0.0 ).g;

				// Find the distance to the bottom:
				coords.y = SMAASearchYDown( edgesTex, searchTex, offset[ 1 ].zw, offset[ 2 ].w );
				d.y = coords.y;

				// We want the distances to be in pixel units:
				d = d / resolution.y - pixcoord.y;

				// SMAAArea below needs a sqrt, as the areas texture is compressed
				// quadratically:
				vec2 sqrt_d = sqrt( abs( d ) );

				// Fetch the bottom crossing edges:
				coords.y -= 1.0 * resolution.y; // WebGL port note: Added
				float e2 = SMAASampleLevelZeroOffset( edgesTex, coords, ivec2( 0, 1 ) ).g;

				// Get the area for this direction:
				weights.ba = SMAAArea( areaTex, sqrt_d, e1, e2, float( subsampleIndices.x ) );
			}

			return weights;
		}

		void main() {

			gl_FragColor = SMAABlendingWeightCalculationPS( vUv, vPixcoord, vOffset, tDiffuse, tArea, tSearch, ivec4( 0.0 ) );

		}`},Go={name:"SMAABlendShader",uniforms:{tDiffuse:{value:null},tColor:{value:null},resolution:{value:new Cr(1/1024,1/512)}},vertexShader:`

		uniform vec2 resolution;

		varying vec2 vUv;
		varying vec4 vOffset[ 2 ];

		void SMAANeighborhoodBlendingVS( vec2 texcoord ) {
			vOffset[ 0 ] = texcoord.xyxy + resolution.xyxy * vec4( -1.0, 0.0, 0.0, 1.0 ); // WebGL port note: Changed sign in W component
			vOffset[ 1 ] = texcoord.xyxy + resolution.xyxy * vec4( 1.0, 0.0, 0.0, -1.0 ); // WebGL port note: Changed sign in W component
		}

		void main() {

			vUv = uv;

			SMAANeighborhoodBlendingVS( vUv );

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform sampler2D tColor;
		uniform vec2 resolution;

		varying vec2 vUv;
		varying vec4 vOffset[ 2 ];

		vec4 SMAANeighborhoodBlendingPS( vec2 texcoord, vec4 offset[ 2 ], sampler2D colorTex, sampler2D blendTex ) {
			// Fetch the blending weights for current pixel:
			vec4 a;
			a.xz = texture2D( blendTex, texcoord ).xz;
			a.y = texture2D( blendTex, offset[ 1 ].zw ).g;
			a.w = texture2D( blendTex, offset[ 1 ].xy ).a;

			// Is there any blending weight with a value greater than 0.0?
			if ( dot(a, vec4( 1.0, 1.0, 1.0, 1.0 )) < 1e-5 ) {
				return texture2D( colorTex, texcoord, 0.0 );
			} else {
				// Up to 4 lines can be crossing a pixel (one through each edge). We
				// favor blending by choosing the line with the maximum weight for each
				// direction:
				vec2 offset;
				offset.x = a.a > a.b ? a.a : -a.b; // left vs. right
				offset.y = a.g > a.r ? -a.g : a.r; // top vs. bottom // WebGL port note: Changed signs

				// Then we go in the direction that has the maximum weight:
				if ( abs( offset.x ) > abs( offset.y )) { // horizontal vs. vertical
					offset.y = 0.0;
				} else {
					offset.x = 0.0;
				}

				// Fetch the opposite color and lerp by hand:
				vec4 C = texture2D( colorTex, texcoord, 0.0 );
				texcoord += sign( offset ) * resolution;
				vec4 Cop = texture2D( colorTex, texcoord, 0.0 );
				float s = abs( offset.x ) > abs( offset.y ) ? abs( offset.x ) : abs( offset.y );

				// WebGL port note: Added gamma correction
				C.xyz = pow(C.xyz, vec3(2.2));
				Cop.xyz = pow(Cop.xyz, vec3(2.2));
				vec4 mixed = mix(C, Cop, s);
				mixed.xyz = pow(mixed.xyz, vec3(1.0 / 2.2));

				return mixed;
			}
		}

		void main() {

			gl_FragColor = SMAANeighborhoodBlendingPS( vUv, vOffset, tColor, tDiffuse );

		}`};var To=class extends qt{constructor(t,r){super(),this.edgesRT=new Fn(t,r,{depthBuffer:!1,type:Ln}),this.edgesRT.texture.name="SMAAPass.edges",this.weightsRT=new Fn(t,r,{depthBuffer:!1,type:Ln}),this.weightsRT.texture.name="SMAAPass.weights";let u=this,a=new Image;a.src=this.getAreaTexture(),a.onload=function(){u.areaTexture.needsUpdate=!0},this.areaTexture=new On,this.areaTexture.name="SMAAPass.area",this.areaTexture.image=a,this.areaTexture.minFilter=ri,this.areaTexture.generateMipmaps=!1,this.areaTexture.flipY=!1;let n=new Image;n.src=this.getSearchTexture(),n.onload=function(){u.searchTexture.needsUpdate=!0},this.searchTexture=new On,this.searchTexture.name="SMAAPass.search",this.searchTexture.image=n,this.searchTexture.magFilter=kn,this.searchTexture.minFilter=kn,this.searchTexture.generateMipmaps=!1,this.searchTexture.flipY=!1,this.uniformsEdges=zr.clone(co.uniforms),this.uniformsEdges.resolution.value.set(1/t,1/r),this.materialEdges=new Dr({defines:Object.assign({},co.defines),uniforms:this.uniformsEdges,vertexShader:co.vertexShader,fragmentShader:co.fragmentShader}),this.uniformsWeights=zr.clone(uo.uniforms),this.uniformsWeights.resolution.value.set(1/t,1/r),this.uniformsWeights.tDiffuse.value=this.edgesRT.texture,this.uniformsWeights.tArea.value=this.areaTexture,this.uniformsWeights.tSearch.value=this.searchTexture,this.materialWeights=new Dr({defines:Object.assign({},uo.defines),uniforms:this.uniformsWeights,vertexShader:uo.vertexShader,fragmentShader:uo.fragmentShader}),this.uniformsBlend=zr.clone(Go.uniforms),this.uniformsBlend.resolution.value.set(1/t,1/r),this.uniformsBlend.tDiffuse.value=this.weightsRT.texture,this.materialBlend=new Dr({uniforms:this.uniformsBlend,vertexShader:Go.vertexShader,fragmentShader:Go.fragmentShader}),this.fsQuad=new Zt(null)}render(t,r,u){this.uniformsEdges.tDiffuse.value=u.texture,this.fsQuad.material=this.materialEdges,t.setRenderTarget(this.edgesRT),this.clear&&t.clear(),this.fsQuad.render(t),this.fsQuad.material=this.materialWeights,t.setRenderTarget(this.weightsRT),this.clear&&t.clear(),this.fsQuad.render(t),this.uniformsBlend.tColor.value=u.texture,this.fsQuad.material=this.materialBlend,this.renderToScreen?(t.setRenderTarget(null),this.fsQuad.render(t)):(t.setRenderTarget(r),this.clear&&t.clear(),this.fsQuad.render(t))}setSize(t,r){this.edgesRT.setSize(t,r),this.weightsRT.setSize(t,r),this.materialEdges.uniforms.resolution.value.set(1/t,1/r),this.materialWeights.uniforms.resolution.value.set(1/t,1/r),this.materialBlend.uniforms.resolution.value.set(1/t,1/r)}getAreaTexture(){return"data:image/png;base64,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"}getSearchTexture(){return"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAAAhCAAAAABIXyLAAAAAOElEQVRIx2NgGAWjYBSMglEwEICREYRgFBZBqDCSLA2MGPUIVQETE9iNUAqLR5gIeoQKRgwXjwAAGn4AtaFeYLEAAAAASUVORK5CYII="}dispose(){this.edgesRT.dispose(),this.weightsRT.dispose(),this.areaTexture.dispose(),this.searchTexture.dispose(),this.materialEdges.dispose(),this.materialWeights.dispose(),this.materialBlend.dispose(),this.fsQuad.dispose()}};var fo="varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }";function Bn({THREE:e,renderer:t,scene:r,cam:u,cine:a=!0,low:n=!1}){let L=t.getPixelRatio(),x=t.getSize(new e.Vector2),k=Math.max(1,Math.floor(x.x*L)),S=Math.max(1,Math.floor(x.y*L)),B={enabled:!0,shutter:.6,maxLen:.035,minPx:.35,cutDist:400,cutAngle:.7,active:!1},z={enabled:!0,min:.55,max:1.35,ref:-2.4,strength:.5,rateToBright:2.4,rateToDark:.7,linear:1,lumMin:.03,lumMax:24},T={enabled:!1,amount:.65,clamp:.15,depthTol:.06,cutAngle:.5,active:!1},W={enabled:!1,radius:.03,intensity:1,bias:.12,maxPx:48,debug:!1,active:!1},l=new URLSearchParams(location.search).get("hdr")==="rg11b10",N=D=>(l&&(D.texture.internalFormat="R11F_G11F_B10F"),D);if(l){let D=t.getContext(),h=D.texImage2D;D.texImage2D=function(){return arguments.length>=9&&arguments[2]===D.R11F_G11F_B10F&&arguments[6]===D.RGBA&&(arguments[6]=D.RGB),h.apply(D,arguments)}}let U=new Vo(t);N(U.renderTarget1),N(U.renderTarget2),U.renderTarget1.depthBuffer=U.renderTarget2.depthBuffer=!1;class R extends qt{constructor(){super(),this.needsSwap=!1,this.useRT=!1,this.jx=0,this.jy=0,this.rt=N(new e.WebGLRenderTarget(k,S,{type:e.HalfFloatType,depthTexture:new e.DepthTexture(k,S)}))}render(h,$,O){let Y=h.autoClear;if(h.autoClear=!1,h.setRenderTarget(this.useRT?this.rt:O),h.clear(!0,!0,!0),this.jx||this.jy){let ae=u.projectionMatrix.elements,fe=ae[8],Ge=ae[9],rt=this.rt;ae[8]+=2*this.jx/rt.width,ae[9]+=2*this.jy/rt.height;try{h.render(r,u)}finally{ae[8]=fe,ae[9]=Ge}}else h.render(r,u);h.autoClear=Y}setSize(h,$){this.rt.setSize(h,$),this.rt.depthTexture.image.width=h,this.rt.depthTexture.image.height=$}}let Z=new R;U.addPass(Z);let ie=`
    uniform float near; uniform float far;
    float viewZ(float d){ return (near*far)/((far-near)*d-far); } // perspective depth -> view z (negative)`,Le="float ign(vec2 p){ return fract(52.9829189*fract(dot(p,vec2(0.06711056,0.00583715)))); }";class me extends qt{constructor(){super(),this.blur=!1,this.histOk=!1,this.histVP=new e.Matrix4,this.histRel=new e.Matrix4,this.invVP=new e.Matrix4,this.w=k,this.h=S,this.hist=null,this.tmp=null,this.aoA=null,this.aoB=null;let h=($,O)=>new e.ShaderMaterial({uniforms:$,vertexShader:fo,depthTest:!1,depthWrite:!1,fragmentShader:O});this.u={tColor:{value:null},tDepth:{value:null},invVP:{value:new e.Matrix4},prevVP:{value:new e.Matrix4},scale:{value:.5},maxLen:{value:.035},res:{value:new e.Vector2(k,S)}},this.mBlur=h(this.u,`
        uniform sampler2D tColor; uniform sampler2D tDepth; uniform mat4 invVP; uniform mat4 prevVP; uniform float scale; uniform float maxLen; uniform vec2 res; varying vec2 vUv;
        ${Le}
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
          gl_FragColor=vec4(acc/n,1.); }`),this.mCopy=h({tColor:{value:null}},"uniform sampler2D tColor; varying vec2 vUv; void main(){ gl_FragColor=vec4(texture2D(tColor,vUv).rgb,1.); }"),this.uT={tColor:{value:null},tDepth:{value:null},tHist:{value:null},invVP:{value:null},histVP:{value:null},res:{value:new e.Vector2(k,S)},near:{value:1},far:{value:1e3},w:{value:.65},clampK:{value:.15},tol:{value:.06},valid:{value:0}},this.mTrail=h(this.uT,`
        uniform sampler2D tColor; uniform sampler2D tDepth; uniform sampler2D tHist; uniform mat4 invVP; uniform mat4 histVP; uniform vec2 res;
        uniform float w, clampK, tol, valid; varying vec2 vUv;
        ${ie}
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
          gl_FragColor=vec4(mix(c,h,w*(1.-disocc)),zl); }`),this.uAO={tDepth:{value:null},res:{value:new e.Vector2(k,S)},near:{value:1},far:{value:1e3},pInv:{value:new e.Vector2(1,1)},projScale:{value:500},radius:{value:.02},intensity:{value:1},bias:{value:.12},maxPx:{value:48}},this.mAO=h(this.uAO,`
        uniform sampler2D tDepth; uniform vec2 res; uniform vec2 pInv; uniform float projScale, radius, intensity, bias, maxPx; varying vec2 vUv;
        ${ie}
        ${Le}
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
          gl_FragColor=vec4(clamp(1.-intensity*occ/3.,0.,1.),-P.z,0.,1.); }`),this.uAOB={tAO:{value:null},dir:{value:new e.Vector2(1,0)},hres:{value:new e.Vector2(k>>1,S>>1)}},this.mAOBlur=h(this.uAOB,`
        uniform sampler2D tAO; uniform vec2 dir; uniform vec2 hres; varying vec2 vUv;
        void main(){
          ivec2 p=ivec2(gl_FragCoord.xy), mx=ivec2(hres)-1; vec2 c=texelFetch(tAO,p,0).xy; float s=c.x, ws=1., k=1./(.03*c.y);
          for(int i=-4;i<=4;i++){ if(i==0) continue;
            vec2 t=texelFetch(tAO,clamp(p+ivec2(dir)*i,ivec2(0),mx),0).xy;
            float wt=exp(-float(i*i)*.125)*max(0.,1.-abs(t.y-c.y)*k); s+=t.x*wt; ws+=wt; }
          gl_FragColor=vec4(s/ws,c.y,0.,1.); }`),this.uAOC={tColor:{value:null},tDepth:{value:null},tAO:{value:null},hres:{value:new e.Vector2(k>>1,S>>1)},near:{value:1},far:{value:1e3},dbg:{value:0}},this.mAOComp=h(this.uAOC,`
        uniform sampler2D tColor; uniform sampler2D tDepth; uniform sampler2D tAO; uniform vec2 hres; uniform float dbg; varying vec2 vUv;
        ${ie}
        void main(){
          vec4 c=texture2D(tColor,vUv); float d=texture2D(tDepth,vUv).x;
          if(d>=.999999){ gl_FragColor=vec4(c.rgb,1.); return; }
          float z=-viewZ(d), k=1./(.03*z);
          vec2 hp=vUv*hres-.5, f=fract(hp); ivec2 b=ivec2(floor(hp)), mx=ivec2(hres)-1;
          float s=0., ws=1e-4;                                    // joint bilateral upsample: bilinear weights x depth similarity
          for(int y=0;y<2;y++) for(int x=0;x<2;x++){
            vec2 t=texelFetch(tAO,clamp(b+ivec2(x,y),ivec2(0),mx),0).xy;
            float wt=(x==0?1.-f.x:f.x)*(y==0?1.-f.y:f.y)*max(1e-3,1.-abs(t.y-z)*k); s+=t.x*wt; ws+=wt; }
          gl_FragColor=vec4(dbg>.5 ? vec3(.6*s/ws) : c.rgb*(s/ws),1.); }`),this.fsQuad=new Zt(this.mCopy),this.taa=!1,this.direct=!1,this.outTex=null,this.mTaa=null}draw(h,$,O){this.fsQuad.material=$,h.setRenderTarget(O),this.fsQuad.render(h)}alloc(){let h=(Y,ae,fe,Ge=!0)=>{let rt=new e.WebGLRenderTarget(Y,ae,{type:e.HalfFloatType,depthBuffer:!1,minFilter:fe,magFilter:fe});return Ge?N(rt):rt},$=Math.max(1,this.w>>1),O=Math.max(1,this.h>>1);(T.enabled||this.taa)&&!this.hist&&(this.hist=[h(this.w,this.h,e.LinearFilter),h(this.w,this.h,e.LinearFilter)],this.histOk=!1),W.enabled&&!this.aoA&&(this.aoA=h($,O,e.NearestFilter,!1),this.aoB=h($,O,e.NearestFilter,!1)),W.enabled&&(T.enabled||this.taa||this.blur)&&!this.tmp&&(this.tmp=h(this.w,this.h,e.LinearFilter))}render(h,$){this.alloc();let O=Z.rt.depthTexture,Y=Z.rt.texture,ae=!1,fe=u.near,Ge=u.far,rt=!T.enabled&&!this.taa&&!this.blur;if(this.outTex=$?$.texture:null,W.enabled){let Oe=u.projectionMatrix.elements;this.uAO.tDepth.value=O,this.uAO.near.value=fe,this.uAO.far.value=Ge,this.uAO.pInv.value.set(1/Oe[0],1/Oe[5]),this.uAO.projScale.value=.5*this.h*Oe[5],this.uAO.radius.value=W.radius,this.uAO.intensity.value=W.intensity,this.uAO.bias.value=W.bias,this.uAO.maxPx.value=W.maxPx,this.draw(h,this.mAO,this.aoA),this.uAOB.tAO.value=this.aoA.texture,this.uAOB.dir.value.set(1,0),this.draw(h,this.mAOBlur,this.aoB),this.uAOB.tAO.value=this.aoB.texture,this.uAOB.dir.value.set(0,1),this.draw(h,this.mAOBlur,this.aoA);let Ue=this.uAOC;Ue.tColor.value=Y,Ue.tDepth.value=O,Ue.tAO.value=this.aoA.texture,Ue.near.value=fe,Ue.far.value=Ge,Ue.dbg.value=W.debug?1:0,this.draw(h,this.mAOComp,rt?$:this.tmp),rt?ae=!0:Y=this.tmp.texture}if(T.enabled){let Oe=this.uT,Ue=this.hist[0],Xe=this.hist[1];Oe.tColor.value=Y,Oe.tDepth.value=O,Oe.tHist.value=Ue.texture,Oe.invVP.value=this.invVP,Oe.histVP.value=this.histRel,Oe.near.value=fe,Oe.far.value=Ge,Oe.valid.value=this.histOk?1:0,Oe.w.value=Math.pow(e.MathUtils.clamp(T.amount,0,.98),e.MathUtils.clamp(C*60,.25,4)),Oe.clampK.value=T.clamp,Oe.tol.value=T.depthTol,this.draw(h,this.mTrail,Xe),this.hist[0]=Xe,this.hist[1]=Ue,this.histVP.copy(H),this.histOk=!0,Y=Xe.texture}else if(this.taa){let Oe=this.mTaa.uniforms,Ue=this.hist[0],Xe=this.hist[1];Oe.tColor.value=Y,Oe.tDepth.value=O,Oe.tHist.value=Ue.texture,Oe.invVP.value=this.invVP,Oe.histVP.value=this.histRel,Oe.valid.value=this.histOk?1:0,this.draw(h,this.mTaa,Xe),this.hist[0]=Xe,this.hist[1]=Ue,this.histVP.copy(H),this.histOk=!0,Y=Xe.texture}this.blur?(this.u.tColor.value=Y,this.u.tDepth.value=O,this.draw(h,this.mBlur,$)):!ae&&this.direct?this.outTex=Y:ae||(this.mCopy.uniforms.tColor.value=Y,this.draw(h,this.mCopy,$))}setSize(h,$){this.w=h,this.h=$,this.u.res.value.set(h,$),this.uT.res.value.set(h,$),this.uAO.res.value.set(h,$);let O=Math.max(1,h>>1),Y=Math.max(1,$>>1);this.uAOB.hres.value.set(O,Y),this.uAOC.hres.value.set(O,Y);for(let ae of[this.tmp,...this.hist||[]])ae&&ae.setSize(h,$);for(let ae of[this.aoA,this.aoB])ae&&ae.setSize(O,Y);this.mTaa&&this.mTaa.uniforms.res.value.set(h,$),this.histOk=!1}dispose(){for(let h of[this.tmp,this.aoA,this.aoB,...this.hist||[]])h&&h.dispose();this.hist=this.tmp=this.aoA=this.aoB=null}}let X=new me;X.enabled=!1,U.addPass(X);let re=new Io(r,u,{focus:30,aperture:1e-4,maxblur:.002});re.materialBokeh.defines.DEPTH_PACKING=0,re.materialBokeh.needsUpdate=!0,re.renderTargetDepth.dispose(),re.render=function(D,h,$){let O=this.uniforms;O.tColor.value=X.enabled?$.texture:Z.rt.texture,O.tDepth.value=Z.rt.depthTexture,O.nearClip.value=u.near,O.farClip.value=u.far,D.setRenderTarget(this.renderToScreen?null:h),this.fsQuad.render(D)},re.setSize=function(D,h){this.uniforms.aspect.value=D/h},U.addPass(re);let We=a?{strength:.6,radius:.5,threshold:.72,separableBlurMaterials:[]}:new ja(new e.Vector2(k,S),.8,.5,.72);a||U.addPass(We);class xe extends qt{constructor(){super();let h=($,O)=>new e.WebGLRenderTarget($,$,{type:O,depthBuffer:!1,magFilter:e.NearestFilter,minFilter:e.NearestFilter});this.t64=h(64,e.HalfFloatType),this.t8=h(8,e.HalfFloatType),this.t1=h(1,e.HalfFloatType),this.sA=h(1,e.FloatType),this.sB=h(1,e.FloatType),this.first=!0,this.snap=!0,this.mDown=new e.ShaderMaterial({uniforms:{tSrc:{value:null},lumMax:{value:24},lumMin:{value:.03}},vertexShader:fo,depthTest:!1,fragmentShader:`
        uniform sampler2D tSrc; uniform float lumMax; uniform float lumMin; varying vec2 vUv;
        void main(){ vec2 base=floor(gl_FragCoord.xy)/64.; vec3 acc=vec3(0.);
          for(int y=0;y<4;y++) for(int x=0;x<4;x++){
            vec2 uv=base+(vec2(float(x),float(y))+.5)/256.;
            vec3 c=texture2D(tSrc,uv).rgb; float l=clamp(dot(c,vec3(.2126,.7152,.0722)),lumMin,lumMax);
            float k=length(uv-.5)*2.; float wt=mix(1.,.35,smoothstep(.2,1.1,k)); // centre-weighted metering
            acc+=vec3(log(l)*wt,wt,l*l*wt); }
          gl_FragColor=vec4(acc/16.,1.); }`}),this.mReduce=new e.ShaderMaterial({uniforms:{tSrc:{value:null}},vertexShader:fo,depthTest:!1,fragmentShader:`
        uniform sampler2D tSrc; varying vec2 vUv;
        void main(){ ivec2 b=ivec2(gl_FragCoord.xy)*8; vec3 acc=vec3(0.);
          for(int y=0;y<8;y++) for(int x=0;x<8;x++) acc+=texelFetch(tSrc,b+ivec2(x,y),0).rgb;
          gl_FragColor=vec4(acc/64.,1.); }`}),this.mAdapt=new e.ShaderMaterial({uniforms:{tAvg:{value:null},tPrev:{value:null},dt:{value:.016},base:{value:1.05},ref:{value:-3.2},strength:{value:.5},eMin:{value:.55},eMax:{value:1.35},up:{value:2.4},down:{value:.7},snap:{value:1},on:{value:1},lin:{value:1}},vertexShader:fo,depthTest:!1,fragmentShader:`
        uniform sampler2D tAvg; uniform sampler2D tPrev; uniform float dt, base, ref, strength, eMin, eMax, up, down, snap, on, lin; varying vec2 vUv;
        void main(){ vec3 m=texelFetch(tAvg,ivec2(0),0).rgb; float lnL=mix(m.x/max(m.y,1e-4),0.5*log(max(m.z/max(m.y,1e-4),1e-6)),lin);
          float target=on>.5 ? clamp(base*exp(-(lnL-ref)*strength),eMin,eMax) : base;
          float prev=texelFetch(tPrev,ivec2(0),0).r; float lp=log(max(prev,1e-3)), lt=log(target);
          float rate=lt<lp ? up : down;                                  // brighter view: fast, darker view: slow
          float e=snap>.5 ? target : exp(mix(lp,lt,1.-exp(-dt*rate)));
          gl_FragColor=vec4(e,lnL,0.,1.); }`}),this.mTone=new e.RawShaderMaterial({uniforms:{tDiffuse:{value:null},tExp:{value:null},toneMappingExposure:{value:1}},vertexShader:"precision highp float; uniform mat4 modelViewMatrix; uniform mat4 projectionMatrix; attribute vec3 position; attribute vec2 uv; varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }",fragmentShader:`precision highp float; uniform sampler2D tDiffuse; uniform sampler2D tExp;
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
        }`}),this.fsQuad=new Zt(this.mDown),this.dt=1/60,this._cs=null,this._tm=null}pass(h,$,O){this.fsQuad.material=$,h.setRenderTarget(O),this.fsQuad.render(h)}render(h,$,O){if(this._cs!==h.outputColorSpace||this._tm!==h.toneMapping){this._cs=h.outputColorSpace,this._tm=h.toneMapping;let fe={};e.ColorManagement.getTransfer(this._cs)===e.SRGBTransfer&&(fe.SRGB_TRANSFER="");let Ge={[e.LinearToneMapping]:"LINEAR_TONE_MAPPING",[e.ReinhardToneMapping]:"REINHARD_TONE_MAPPING",[e.CineonToneMapping]:"CINEON_TONE_MAPPING",[e.ACESFilmicToneMapping]:"ACES_FILMIC_TONE_MAPPING",[e.AgXToneMapping]:"AGX_TONE_MAPPING"}[this._tm];Ge&&(fe[Ge]=""),this.mTone.defines=fe,this.mTone.needsUpdate=!0}z.enabled&&(this.mDown.uniforms.tSrc.value=O.texture,this.mDown.uniforms.lumMax.value=z.lumMax,this.mDown.uniforms.lumMin.value=z.lumMin,this.pass(h,this.mDown,this.t64),this.mReduce.uniforms.tSrc.value=this.t64.texture,this.pass(h,this.mReduce,this.t8),this.mReduce.uniforms.tSrc.value=this.t8.texture,this.pass(h,this.mReduce,this.t1));let Y=this.mAdapt.uniforms;Y.tAvg.value=this.t1.texture,Y.tPrev.value=this.sA.texture,Y.dt.value=Math.min(this.dt,.1),Y.base.value=h.toneMappingExposure,Y.ref.value=z.ref,Y.strength.value=z.strength,Y.eMin.value=z.min,Y.eMax.value=z.max,Y.up.value=z.rateToBright,Y.down.value=z.rateToDark,Y.lin.value=z.linear,Y.snap.value=this.snap?1:0,Y.on.value=z.enabled?1:0,this.snap=!1,this.pass(h,this.mAdapt,this.sB);let ae=this.sA;this.sA=this.sB,this.sB=ae,this.mTone.uniforms.tDiffuse.value=O.texture,this.mTone.uniforms.tExp.value=this.sA.texture,this.pass(h,this.merge?this.mMerge:this.mTone,this.merge||this.renderToScreen?null:$)}}let Me=new xe;U.addPass(Me);let le=new To(k,S);U.addPass(le);let ce=new Wa({uniforms:{tDiffuse:{value:null},ca:{value:.012},time:{value:0},grain:{value:.045},res:{value:new e.Vector2(k,S)}},vertexShader:"varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }",fragmentShader:`uniform sampler2D tDiffuse; uniform float ca; uniform float time; uniform float grain; uniform vec2 res; varying vec2 vUv;
    void main(){
      vec2 c=vUv-.5; float r2=dot(c,c);
      vec2 uv=.5+c*(1.-0.035*r2);              // barrel, pulls the corners in a touch
      vec2 o=c*r2*ca;                           // fringing grows toward the edges, zero at center
      vec3 col=vec3(texture2D(tDiffuse,uv+o).r, texture2D(tDiffuse,uv).g, texture2D(tDiffuse,uv-o).b);
      col*=mix(1.,smoothstep(0.75,0.12,r2*1.6),0.55); // vignette
      float n=fract(sin(dot(floor(vUv*res)+fract(time*7.31)*91.7,vec2(12.9898,78.233)))*43758.5453);
      col+=(n-.5)*grain*(1.-dot(col,vec3(.33))*0.6); // grain sits mostly in the shadows, like film
      gl_FragColor=vec4(col,1.); }`});a||U.addPass(ce);let P=a?si({THREE:e,renderer:t,cam:u,composer:U,scenePass:Z,mbPass:X,dof:re,tonePass:Me,smaa:le,bloom:We,FS_VERT:fo,low:n,hdr:N}):null,H=new e.Matrix4,Se=new e.Matrix4,pe=new e.Matrix4,we=new e.Matrix4,Ce=new e.Matrix4,ue=new e.Vector3,De=new e.Vector3,Be=new e.Quaternion,_e=1,ee=new URLSearchParams(location.search).get("postpr")!=="0",V=!1,C=1/60,A=!1,b=k;function j(D,h){t.setSize(D,h),u.aspect=D/h,u.updateProjectionMatrix();let $=t.getPixelRatio();b=Math.max(1,Math.floor(D*$)),ee&&U.setPixelRatio($),U.setSize(D,h),ce.uniforms.res.value.set(D,h),A=!0,P&&P.setSize()}function te({dt:D=1/60,t:h=0,ca:$,focus:O,aperture:Y,maxblur:ae}={}){C=Math.max(D,1e-4),Me.dt=C,O!==void 0&&(re.uniforms.focus.value=O),Y!==void 0&&(re.uniforms.aperture.value=Y),ae!==void 0&&(re.uniforms.maxblur.value=ae),$!==void 0&&(ce.uniforms.ca.value=$),ce.uniforms.time.value=h,P&&(P.time=h);let fe=!!P&&P.taaOn()&&!T.enabled;u.updateMatrixWorld(),H.multiplyMatrices(u.projectionMatrix,u.matrixWorldInverse),ue.setFromMatrixPosition(u.matrixWorld),we.makeTranslation(ue.x,ue.y,ue.z),pe.copy(H).invert().premultiply(Ce.makeTranslation(-ue.x,-ue.y,-ue.z));let Ge=!1,rt=V?u.position.distanceTo(De):0,Oe=V?Be.angleTo(u.quaternion):0;if(V&&!A&&B.enabled){let xt=Math.min(Math.max(O===void 0?re.uniforms.focus.value:O,3),60),Nt=u.fov*Math.PI/180,Bt=(Oe+rt/xt)/Nt*S,jt=e.MathUtils.clamp(B.shutter*(1/60)/C,.15,2);if(rt<B.cutDist&&Oe<B.cutAngle&&Bt*jt>B.minPx){Ge=!0;let wt=X.u;wt.prevVP.value.multiplyMatrices(Se,we),wt.invVP.value.copy(pe),wt.scale.value=jt,wt.maxLen.value=B.maxLen}}let Ue=T.enabled||fe;(!Ue||!V||A||rt>=B.cutDist||Oe>=Math.min(B.cutAngle,T.cutAngle))&&(X.histOk=!1),Ue?(X.invVP.copy(pe),X.histRel.multiplyMatrices(X.histVP,we)):X.hist&&(X.hist.forEach(xt=>xt.dispose()),X.hist=null),!W.enabled&&X.aoA&&(X.aoA.dispose(),X.aoB.dispose(),X.aoA=X.aoB=null),!W.enabled&&X.tmp&&(X.tmp.dispose(),X.tmp=null),X.blur=Ge,X.taa=fe;let Xe=Ge||T.enabled||W.enabled||fe;B.active=Ge,T.active=T.enabled,W.active=W.enabled;let zt=.4*re.uniforms.maxblur.value*b>=_e;X.enabled=Xe,re.enabled=zt,Z.useRT=Xe||zt||!!P,P&&P.jitter(fe),Se.copy(H),De.copy(u.position),Be.copy(u.quaternion),V=!0,A=!1}function w(){P?P.render():U.render(C)}function J({fx:D=!0}={}){if(P){let $=[Z.enabled,X.enabled,X.blur,X.taa,re.enabled,T.enabled,W.enabled];try{Z.enabled=!1,X.enabled=!0,re.enabled=!0,T.enabled=!1,W.enabled=D,X.blur=!0,X.taa=!0,P.render(!0,0),X.blur=!1,X.taa=!1,W.enabled=!1,T.enabled=D,P.render(!0,1)}finally{[Z.enabled,X.enabled,X.blur,X.taa,re.enabled,T.enabled,W.enabled]=$,X.histOk=!1,Me.snap=!0,A=!0}return}let h=[Z.enabled,Z.useRT,X.enabled,X.blur,re.enabled,T.enabled,W.enabled];try{Z.enabled=!1,Z.useRT=!0,X.enabled=!0,re.enabled=!0,X.blur=!0,T.enabled=W.enabled=D,U.render(1/60),X.blur=!1,T.enabled=W.enabled=!1,U.render(1/60)}finally{[Z.enabled,Z.useRT,X.enabled,X.blur,re.enabled,T.enabled,W.enabled]=h,X.histOk=!1,Me.snap=!0,A=!0}}let _=new Float32Array(4);function K(){return t.readRenderTargetPixels(Me.sA,0,0,1,1,_),{exposure:_[0],lnLum:_[1]}}return{composer:U,dof:re,lens:ce,bloom:We,smaa:le,setSize:j,update:te,render:w,warm:J,motion:B,auto:z,trails:T,ao:W,resetMotion(){A=!0},snapExposure(){Me.snap=!0},getExposure:K,cine:!!P,fx:P?P.fx:null,look:P?P.look:null,grade:P?P.grade:null,lensFrame:P?D=>P.lensFrame(D):()=>{},scrim:P?(D,h,$,O,Y)=>P.scrim(D,h,$,O,Y):()=>{},edge:P?(D,h,$,O)=>P.edge(D,h,$,O):()=>{},setDofHalf:P?D=>P.setDofHalf(D):()=>{},setQuality:P?D=>P.setQuality(D):()=>{},setPostQuality:P?D=>P.setQuality(D):()=>{},getQuality:()=>P?P.level:-1,get toneMerge(){return P?P.toneMerge:!1},set toneMerge(D){P&&(P.toneMerge=D)},get frame(){return P?P.frame:0},set frame(D){P&&(P.frame=D)},gpuTimes:P?()=>P.gpuTimes():()=>null}}var Pr=`
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
`,ni=new Set;function si({THREE:e,renderer:t,cam:r,composer:u,scenePass:a,mbPass:n,dof:L,tonePass:x,smaa:k,bloom:S,FS_VERT:B,low:z=!1,hdr:T=W=>W}){let W=e.HalfFloatType,l=e.LinearFilter,N=(de=!0)=>{let Ne=new e.WebGLRenderTarget(1,1,{type:W,depthBuffer:!1,minFilter:l,magFilter:l,generateMipmaps:!1});return de?T(Ne):Ne},U=new Zt(null),R=(de,Ne)=>new e.ShaderMaterial({uniforms:Ne,vertexShader:B,fragmentShader:de,depthTest:!1,depthWrite:!1}),Z=(de,Ne)=>{U.material=de,t.setRenderTarget(Ne),U.render(t)},ie={flash:0,heat:0,heatAt:null,dirt:0,streak:1,streakAdd:0,bloom:0},Le={bloom:.5,threshold:1,knee:.6,streakThr:6,streak:0,streakTint:new e.Color(.86,.92,1),vignette:.3,grain:.04,taaStill:.9,taaMove:.7},me={expK:1,wr:1,wg:1,wb:1,contrast:1,saturation:1,lift:0,gamma:1,gain:1},X=[{aa:0,div:2,lv:3,streak:!1},{aa:1,div:2,lv:4,streak:!0},{aa:2,div:1,lv:5,streak:!0},{aa:3,div:1,lv:5,streak:!0}],re=[.46,.3,.15,.06,.03],We=-1,xe=X[3],Me=!1,le=0,ce=N(!1),P=!1;L.uniforms.uW={value:1};let H=new e.ShaderMaterial({uniforms:L.uniforms,defines:{...L.materialBokeh.defines},vertexShader:B,depthTest:!1,depthWrite:!1,fragmentShader:No.fragmentShader.replace("uniform float aspect;","uniform float aspect; uniform float uW;").replace(/gl_FragColor = col \/ 41\.0;\s*gl_FragColor\.a = 1\.0;/,"gl_FragColor = vec4( col.rgb / 41.0, clamp( dofblur.x * 0.4 * uW / 1.5, 0.0, 1.0 ) );")}),Se=new e.ShaderMaterial({uniforms:{tSharp:{value:null},tBlur:{value:null}},vertexShader:B,depthTest:!1,depthWrite:!1,fragmentShader:"uniform sampler2D tSharp, tBlur; varying vec2 vUv; void main(){ vec4 b = texture2D(tBlur, vUv); gl_FragColor = vec4(mix(texture2D(tSharp, vUv).rgb, b.rgb, b.a), 1.); }"}),pe=N(),we=[],Ce=[],ue=[N(),N()];for(let de=0;de<5;de++)we.push(N()),Ce.push(N());let De=R(`
    uniform sampler2D tSrc; uniform vec2 uTexel; uniform float uThr, uKnee; varying vec2 vUv;
    vec3 tap(vec2 o){ vec3 c=texture2D(tSrc,vUv+o*uTexel).rgb; return any(isnan(c)) ? vec3(0.) : min(c,vec3(6e4)); }
    float lum(vec3 c){ return dot(c,vec3(.2126,.7152,.0722)); }
    void main(){
      vec3 a=tap(vec2(-1,-1)), b=tap(vec2(1,-1)), c=tap(vec2(-1,1)), e=tap(vec2(1,1));
      float wa=1./(1.+lum(a)), wb=1./(1.+lum(b)), wc=1./(1.+lum(c)), we=1./(1.+lum(e));   // Karis average: no fireflies
      vec3 m=(a*wa+b*wb+c*wc+e*we)/(wa+wb+wc+we);
      float l=lum(m), s=clamp(l-uThr+uKnee,0.,2.*uKnee); s=s*s/(4.*uKnee+1e-5);
      gl_FragColor=vec4(m*max(s,l-uThr)/max(l,1e-4),1.); }`,{tSrc:{value:null},uTexel:{value:new e.Vector2},uThr:{value:1},uKnee:{value:.6}}),Be=R(`
    uniform sampler2D tSrc; uniform vec2 uDir; varying vec2 vUv;
    void main(){
      vec3 c=texture2D(tSrc,vUv).rgb*.227027;
      c+=(texture2D(tSrc,vUv+uDir*1.3846154).rgb+texture2D(tSrc,vUv-uDir*1.3846154).rgb)*.3162162;
      c+=(texture2D(tSrc,vUv+uDir*3.2307692).rgb+texture2D(tSrc,vUv-uDir*3.2307692).rgb)*.0702703;
      gl_FragColor=vec4(c,1.); }`,{tSrc:{value:null},uDir:{value:new e.Vector2}}),_e=R(`
    uniform sampler2D tSrc; uniform vec2 uTexel; uniform float uThr; varying vec2 vUv;
    void main(){
      vec3 c=(texture2D(tSrc,vUv+vec2(-.5,-1.)*uTexel).rgb+texture2D(tSrc,vUv+vec2(.5,-1.)*uTexel).rgb
             +texture2D(tSrc,vUv+vec2(-.5,1.)*uTexel).rgb+texture2D(tSrc,vUv+vec2(.5,1.)*uTexel).rgb)*.25;
      float l=dot(c,vec3(.2126,.7152,.0722));
      gl_FragColor=vec4(c*max(l-uThr,0.)/max(l,1e-4),1.); }`,{tSrc:{value:null},uTexel:{value:new e.Vector2},uThr:{value:6}}),ee=R(`
    uniform sampler2D tSrc; uniform float uStep; uniform float uTx; varying vec2 vUv;
    void main(){ vec3 c=texture2D(tSrc,vUv).rgb; float ws=1.;
      for(int i=1;i<=6;i++){ float w=exp(-float(i)*.42); vec2 o=vec2(float(i)*uStep*uTx,0.);
        c+=(texture2D(tSrc,vUv+o).rgb+texture2D(tSrc,vUv-o).rgb)*w; ws+=2.*w; }
      gl_FragColor=vec4(c/ws,1.); }`,{tSrc:{value:null},uStep:{value:1},uTx:{value:1}});n.mTaa=R(`
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
      gl_FragColor=vec4(max((c*wc+h*wh)/(wc+wh),vec3(0.)),1.); }`,{tColor:{value:null},tDepth:{value:null},tHist:{value:null},invVP:{value:null},histVP:{value:null},res:{value:new e.Vector2(1,1)},valid:{value:0},wStill:{value:.9},wMove:{value:.7}}),n.direct=!0;let V=ii(e),C={tDiffuse:{value:null},tExp:{value:null},tB0:{value:Ce[0].texture},tB1:{value:Ce[1].texture},tB2:{value:Ce[2].texture},tB3:{value:Ce[3].texture},tB4:{value:Ce[4].texture},tS:{value:ue[1].texture},tDirt:{value:V},uBw:{value:new e.Vector4},uBw4:{value:0},uBloom:{value:.3},uStreak:{value:0},uSTint:{value:Le.streakTint},uFlash:{value:0},uDirt:{value:0},uDial:{value:0},uExpK:{value:1},uWB:{value:new e.Vector3(1,1,1)},uCon:{value:1},uSat:{value:1},uLift:{value:0},uGam:{value:1},uGain:{value:1}},A=`uniform sampler2D tDiffuse, tExp, tB0, tB1, tB2, tB3, tB4, tS, tDirt; uniform vec4 uBw; uniform float uBw4, uBloom, uStreak, uFlash, uDirt; uniform vec3 uSTint;
    uniform float uDial, uExpK, uCon, uSat, uLift, uGam, uGain; uniform vec3 uWB;`,b=`
    // dial grade on display values: lift raises the blacks, gain scales, uGam = 1/gamma, contrast about mid grey, then saturation
    vec3 dialGrade(vec3 o){
      o=max((o+uLift*(1.-o))*uGain,0.);
      o=pow(o,vec3(uGam));
      o=max((o-.46)*uCon+.46,0.);
      float l=dot(o,vec3(.2126,.7152,.0722)); o=max(mix(vec3(l),o,uSat),0.);
      return clamp(o,0.,1.); }
    vec3 toneAt(vec2 uv){
      vec3 c=texture2D(tDiffuse,uv).rgb; c=any(isnan(c)) ? vec3(0.) : min(c,vec3(6e4));
      vec3 b=texture2D(tB0,uv).rgb*uBw.x+texture2D(tB1,uv).rgb*uBw.y+texture2D(tB2,uv).rgb*uBw.z+texture2D(tB3,uv).rgb*uBw.w+texture2D(tB4,uv).rgb*uBw4;
      float f2=uFlash*uFlash;
      c+=b*(uBloom+2.5*uFlash);                                       // the flash is the lens flooding: bloom swells first
      c+=texture2D(tS,uv).rgb*uSTint*uStreak;
      if(uDirt>0.) c+=texture2D(tDirt,uv).rgb*(texture2D(tB2,uv).rgb*.3+texture2D(tB3,uv).rgb+texture2D(tB4,uv).rgb)*uDirt*1.6;
      c+=f2*vec3(1.,.72,.5)*.9;                                       // warm wash in HDR: the tone curve rolls it to cream, never flat orange
      float e=texture2D(tExp,vec2(.5)).r*(1.+1.6*f2);
      if(uDial>.5){ e*=uExpK; c*=uWB; }                              // dial exposure and white balance (scene linear)
      vec3 o=cineGrade(cineOETF(cineTone(c*e/.6)));
      if(uDial>.5) o=dialGrade(o);
      return o; }`;x.mTone=R(`
    ${A}
    varying vec2 vUv;
    ${Pr}
    ${b}
    void main(){ gl_FragColor=vec4(toneAt(vUv),1.); }`,C);let j={tDiffuse:{value:null},res:{value:new e.Vector2(1,1)},time:{value:0},grain:{value:Le.grain},vig:{value:Le.vignette},heat:{value:0},heatAt:{value:new e.Vector2(.5,.5)},heatLocal:{value:0},fxaa:{value:0},scrim:{value:new e.Vector4(.5,.5,1,1)},scrimK:{value:0},edgeC:{value:new e.Vector3},edgeK:{value:0},edgeH:{value:.3},edgeG:{value:0}},te="uniform vec4 scrim; uniform vec3 edgeC; uniform float time, grain, vig, scrimK, edgeK, edgeH, edgeG;",w=`
    float vh(vec2 p){ return cH12(p*1.17+.31); }
    vec3 lensFinish(vec3 col){
      vec2 c=vUv-.5; float r2=dot(c,c);
      col*=mix(1.,smoothstep(.75,.12,r2*1.6),vig);
      if(scrimK>0.){ vec2 q=(vUv-scrim.xy)/scrim.zw; col*=1.-scrimK*exp(-dot(q,q)); } // a printer's burn under the copy, never a box
      float ey=vUv.y/edgeH;
      col+=edgeG*vec3(1.,.6,.32)*exp(-(ey-.8)*(ey-.8)*2.5);                   // warm haze rising off the bottom of the frame, just above the fade
      col=clamp(cineGrain(col,gl_FragCoord.xy,time,grain),0.,1.);
      if(edgeK>0.){ float m=1.-smoothstep(0.,1.,ey); col=mix(col,edgeC,edgeK*m*m*(3.-2.*m)); } // after the grain: the last rows are the next section's colour exactly
      return col; }`,J=R(`
    uniform sampler2D tDiffuse; uniform vec2 res, heatAt; uniform float heat, heatLocal, fxaa; ${te} varying vec2 vUv;
    ${Pr}
    ${w}
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
      gl_FragColor=vec4(lensFinish(col),1.); }`,j),_=new URLSearchParams(location.search).get("tonemerge")!=="0";x.mMerge=R(`
    ${A} ${te} varying vec2 vUv;
    ${Pr}
    ${b}
    ${w}
    void main(){ gl_FragColor=vec4(lensFinish(toneAt(vUv)),1.); }`,Object.assign({},j,C)),x.merge=!1;let K=1,D=1,h=1,$=1;function O(){K=u.renderTarget1.width,D=u.renderTarget1.height,j.res.value.set(K,D),h=Math.max(1,K>>xe.div),$=Math.max(1,D>>xe.div),ce.setSize(Math.max(1,K>>1),Math.max(1,D>>1)),pe.setSize(h,$),De.uniforms.uTexel.value.set(.5*(1<<xe.div)/K,.5*(1<<xe.div)/D);let de=h,Ne=$;for(let s=0;s<5;s++){let d=Math.max(1,s?de>>1:de),v=Math.max(1,s?Ne>>1:Ne);we[s].setSize(d,v),Ce[s].setSize(d,v),de=d,Ne=v}let et=Math.max(1,h>>1),Ze=Math.max(1,$>>2);ue[0].setSize(et,Ze),ue[1].setSize(et,Ze),_e.uniforms.uTexel.value.set(1/h,1/$);let He=0;for(let s=0;s<xe.lv;s++)He+=re[s];let Ee=s=>s<xe.lv?re[s]/He:0;C.uBw.value.set(Ee(0),Ee(1),Ee(2),Ee(3)),C.uBw4.value=Ee(4),n.histOk=!1}function Y(de){Me=!0,de=Math.max(0,Math.min(3,Math.round(+de||0))),de!==We&&(We=de,xe=X[de],Mt.level=de,O(),xe.aa!==3&&n.hist&&(n.hist.forEach(Ne=>Ne.dispose()),n.hist=null,n.histOk=!1))}let ae=t.getContext(),fe=ae.getExtension&&ae.getExtension("EXT_disjoint_timer_query_webgl2"),Ge={},rt=[],Oe=!1,Ue=de=>{if(!Oe||!fe)return null;let Ne=ae.createQuery();return ae.beginQuery(fe.TIME_ELAPSED_EXT,Ne),[de,Ne]},Xe=de=>{de&&(ae.endQuery(fe.TIME_ELAPSED_EXT),rt.push(de))};function zt(){if(!fe||!rt.length)return;let de=ae.getParameter(fe.GPU_DISJOINT_EXT);for(let Ne=rt.length-1;Ne>=0;Ne--){let[et,Ze]=rt[Ne];if(ae.getQueryParameter(Ze,ae.QUERY_RESULT_AVAILABLE)){if(!de){let He=ae.getQueryParameter(Ze,ae.QUERY_RESULT)/1e6;Ge[et]=Ge[et]==null?He:Ge[et]*.9+He*.1}ae.deleteQuery(Ze),rt.splice(Ne,1)}}}let xt=()=>u.renderTarget1,Nt=()=>u.renderTarget2,Bt=de=>de===xt().texture?Nt():xt(),jt={texture:null},wt=(de,Ne)=>{let et=1,Ze=0;for(;de>0;)et/=Ne,Ze+=et*(de%Ne),de=Math.floor(de/Ne);return Ze};function ct(de){if(!de){a.jx=a.jy=0;return}let Ne=le%8+1;a.jx=wt(Ne,2)-.5,a.jy=wt(Ne,3)-.5}function Ot(de=!1,Ne=0){We<0&&(Y(z?1:3),Me=!1),le++,zt();let et=t,Ze=de?Ne?{aa:1,lv:5,streak:!0}:{aa:2,lv:5,streak:!0}:xe,He=Ue("scene");a.enabled&&(a.useRT=!0,a.render(et)),Xe(He);let Ee=a.rt.texture;if(He=Ue("hdrfx"),n.enabled){let E=n.mTaa.uniforms;E.wStill.value=Le.taaStill,E.wMove.value=Le.taaMove,n.render(et,xt()),Ee=n.outTex||xt().texture}if(Xe(He),He=Ue("dof"),L.enabled){let E=L.uniforms,I=Bt(Ee);E.tColor.value=Ee,E.tDepth.value=a.rt.depthTexture,E.nearClip.value=r.near,E.farClip.value=r.far,(P||de)&&(E.uW.value=K,Z(H,ce),Se.uniforms.tSharp.value=Ee,Se.uniforms.tBlur.value=ce.texture,Z(Se,I)),(!P||de)&&(et.setRenderTarget(I),L.fsQuad.render(et)),Ee=I.texture}Xe(He),He=Ue("bloom"),De.uniforms.tSrc.value=Ee,De.uniforms.uThr.value=Le.threshold,De.uniforms.uKnee.value=Le.knee,Z(De,pe);for(let E=0;E<Ze.lv;E++){let I=we[E].width,Q=we[E].height;Be.uniforms.tSrc.value=E?Ce[E-1].texture:pe.texture,Be.uniforms.uDir.value.set(1/I,0),Z(Be,we[E]),Be.uniforms.tSrc.value=we[E].texture,Be.uniforms.uDir.value.set(0,1/Q),Z(Be,Ce[E])}let s=Le.streak+ie.streakAdd,d=Ze.streak&&(de||ie.streak>0&&s>0);if(d){_e.uniforms.tSrc.value=pe.texture,_e.uniforms.uThr.value=Math.max(0,Le.streakThr-Le.threshold),Z(_e,ue[1]);let E=1/ue[0].width;ee.uniforms.uTx.value=E,ee.uniforms.tSrc.value=ue[1].texture,ee.uniforms.uStep.value=1,Z(ee,ue[0]),ee.uniforms.tSrc.value=ue[0].texture,ee.uniforms.uStep.value=4,Z(ee,ue[1]),ee.uniforms.tSrc.value=ue[1].texture,ee.uniforms.uStep.value=16,Z(ee,ue[0]),C.tS.value=ue[0].texture}Xe(He);let v=de?.5:Math.max(0,ie.heat),m=_&&!de&&v<=0&&(Ze.aa===0||Ze.aa===3);j.time.value=Mt.time,j.fxaa.value=Ze.aa===1?1:0,j.grain.value=Le.grain,j.vig.value=Le.vignette,j.heat.value=v,ie.heatAt?(j.heatAt.value.set(ie.heatAt[0],ie.heatAt[1]),j.heatLocal.value=1):j.heatLocal.value=0,He=Ue("tone");let c=S.strength;C.uBloom.value=Le.bloom*c*(1+ie.bloom),C.uStreak.value=d?s*ie.streak:0,C.uFlash.value=de?.5:Math.min(1,Math.max(0,ie.flash)),C.uDirt.value=de?1:Math.max(0,ie.dirt);let M=me,f=M.expK!==1||M.wr!==1||M.wg!==1||M.wb!==1||M.contrast!==1||M.saturation!==1||M.lift!==0||M.gamma!==1||M.gain!==1;C.uDial.value=f?1:0,f&&(C.uExpK.value=M.expK,C.uWB.value.set(M.wr,M.wg,M.wb),C.uCon.value=M.contrast,C.uSat.value=M.saturation,C.uLift.value=M.lift,C.uGam.value=1/Math.max(.05,M.gamma),C.uGain.value=M.gain),x.merge=m;let F=Bt(Ee);if(jt.texture=Ee,x.render(et,F,jt),Ee=F.texture,Xe(He),!m){if(He=Ue("aa"),Ze.aa===2){let E=Bt(Ee);k.renderToScreen=!1,k.render(et,E,F),Ee=E.texture}Xe(He),He=Ue("lens"),j.tDiffuse.value=Ee,Z(J,null),de&&Z(x.mMerge,null),Xe(He)}}let Mt={fx:ie,look:Le,grade:me,level:We,time:0,taaOn:()=>We<0?!z:xe.aa===3,get toneMerge(){return _},set toneMerge(de){_=!!de},get frame(){return le},set frame(de){le=de|0},jitter:ct,render:Ot,setSize:O,setQuality:Y,setDofHalf(de){P=!!de},profile(de=!0){return Oe=!!de&&!!fe,Oe},scrim(de,Ne,et,Ze,He){j.scrim.value.set(de,Ne,Math.max(.001,et),Math.max(.001,Ze)),j.scrimK.value=Math.max(0,He)},edge(de,Ne,et,Ze){j.edgeK.value=Math.max(0,Math.min(1,de)),j.edgeC.value.set(Ne[0],Ne[1],Ne[2]),j.edgeH.value=Math.max(.05,et),j.edgeG.value=Math.max(0,Ze)},lensFrame({entry:de=-1,gR:Ne=-1,plume:et=null}={}){let Ze=(F,E,I)=>{let Q=Math.min(1,Math.max(0,(I-F)/(E-F)));return Q*Q*(3-2*Q)},He=(F,E,I)=>Math.exp(-(((F-E)/I)**2)),Ee=de>0&&de<1?1:0,s=de,d=Ee*.9*Ze(.05,.22,s)*(1-Ze(.42,.62,s)),v=Ee*.85*He(s,.3,.045),m=Ee*.7*Ze(.16,.3,s)*(1-Ze(.3,.52,s)),c=Ee*.6*Ze(.1,.3,s)*(1-Ze(.3,.55,s)),M=Ne>=.78?Ze(.79,.83,Ne):0,f=Ne>=.78?.25*He(Ne,.835,.012):0;ie.heat=Math.max(d,et?.55*M:0),ie.heatAt=d>=.55*M||!et?null:[et[0],et[1]],ie.flash=Math.max(v,f),ie.dirt=Math.max(m,.45*M),ie.bloom=Math.max(c,.25*M),ie.streak=1+.3*M,ie.streakAdd=.3*M},gpuTimes(){Oe=!!fe;let de={},Ne=0;for(let et in Ge)de[et]=+Ge[et].toFixed(3),Ne+=Ge[et];return de.total=+Ne.toFixed(3),de.supported=!!fe,de}};return O(),ni.add(Mt),Mt}function ii(e){if(typeof document>"u")return null;let t=document.createElement("canvas");t.width=512,t.height=288;let r=t.getContext("2d"),u=7,a=()=>(u=u*16807%2147483647)/2147483647;r.fillStyle="#000",r.fillRect(0,0,512,288),r.globalCompositeOperation="lighter";for(let L=0;L<90;L++){let x=a()*512,k=a()*288,S=3+a()*a()*46,B=.03+a()*.09,z=r.createRadialGradient(x,k,0,x,k,S);z.addColorStop(0,`rgba(255,238,214,${B})`),z.addColorStop(.6,`rgba(255,232,206,${B*.45})`),z.addColorStop(1,"rgba(0,0,0,0)"),r.fillStyle=z,r.beginPath(),r.arc(x,k,S,0,6.2832),r.fill()}r.lineWidth=2;for(let L=0;L<7;L++){let x=a()*512,k=a()*288,S=14+a()*30,B=.05+a()*.05;r.strokeStyle=`rgba(255,236,220,${B})`,r.beginPath();for(let z=0;z<=6;z++){let T=z/6*6.2832+.3;r[z?"lineTo":"moveTo"](x+S*Math.cos(T),k+S*Math.sin(T))}r.stroke()}let n=new e.CanvasTexture(t);return n.colorSpace=e.NoColorSpace,n}var Ba=7e3,li=[-1,.22,-.55];function ho(e,t,r){let u=e*Math.PI/180,a=t*Math.PI/180;return new r(Math.cos(a)*Math.cos(u),Math.sin(a),-Math.cos(a)*Math.sin(u))}function ci(e,t,r){let u=e.Vector3,a=ho(266.40499,-28.93617,u),n=ho(192.85948,27.12825,u),L=new u().crossVectors(n,a),x=t.clone().normalize(),k=r.clone().sub(x.clone().multiplyScalar(r.dot(x))).normalize(),S=new u().crossVectors(k,x),B=new e.Matrix4().makeBasis(a,L,n),T=new e.Matrix4().makeBasis(x,S,k).multiply(B.transpose());return new e.Quaternion().setFromRotationMatrix(T)}function ui(e){let t=e.Vector3,r=new t(...li).normalize(),u=new t(0,1,0).addScaledVector(r,-r.y).normalize(),a=new t().crossVectors(r,u).normalize(),n=30*Math.PI/180,L=72*Math.PI/180,x=a.clone().multiplyScalar(Math.cos(n)).addScaledVector(u,Math.sin(n)),k=new t().crossVectors(r,x).normalize(),S=r.clone().multiplyScalar(Math.cos(L)).addScaledVector(x,Math.sin(L));return ci(e,S,k)}var fi=`
attribute float aMag; attribute float aBV;
uniform float uPx; uniform float uGain;
varying vec3 vCol; varying float vI;
vec3 bb(float T){ // T in kelvin, returns sRGB 0..1
  float t = clamp(T, 1500., 15000.) / 100.;
  float r = t <= 66. ? 1. : clamp(1.292936 * pow(t - 60., -0.1332047), 0., 1.);
  float g = t <= 66. ? clamp(0.390082 * log(t) - 0.631841, 0., 1.) : clamp(1.129891 * pow(t - 60., -0.0755148), 0., 1.);
  float b = t >= 66. ? 1. : (t <= 19. ? 0. : clamp(0.543207 * log(t - 10.) - 1.196254, 0., 1.));
  return vec3(r, g, b);
}
void main(){
  float bv = clamp(aBV, -0.4, 2.0);
  float T = 4600. * (1. / (0.92 * bv + 1.7) + 1. / (0.92 * bv + 0.62));
  vec3 c = bb(T);
  c = mix(vec3(dot(c, vec3(0.299, 0.587, 0.114))), c, 0.72); // subtle saturation, like a real exposure
  c = pow(c, vec3(2.2));                                    // to linear
  c /= max(max(c.r, max(c.g, c.b)), 1e-3);
  // brightness: compressed magnitude scale so faint stars stay dim but visible, bright ones bloom
  float I = 0.42 * pow(10., -0.4 * 0.62 * (aMag - 6.8));
  vI = clamp(I, 0., 5.);
  vCol = c;
  // size: faint = 1px, brightest few hundred (mag < ~3.5) clearly bigger
  float s = 1. + 4.2 * pow(clamp((5.2 - aMag) / 6.6, 0., 1.), 1.5);
  gl_PointSize = s * uPx;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
}`,hi=`
uniform float uGain; varying vec3 vCol; varying float vI;
void main(){
  float d = length(gl_PointCoord - 0.5) * 2.;
  float core = 1. - smoothstep(0., 1., d);     // round falloff (same curve as before, written with ordered edges)
  float a = core * core;
  if (a < 0.003) discard;
  gl_FragColor = vec4(vCol * vI * a * uGain, 1.);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`,di="varying vec3 vDir; void main(){ vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }",mi=`
uniform sampler2D map; uniform vec3 gc; uniform vec3 gy; uniform vec3 ngp; uniform float uInt; uniform float uSat; uniform vec2 uTexel;
varying vec3 vDir;
void main(){
  vec3 d = normalize(vDir);                         // equatorial direction (sphere is in sky-local space)
  float l = atan(dot(d, gy), dot(d, gc));            // galactic longitude
  float b = asin(clamp(dot(d, ngp), -1., 1.));       // galactic latitude
  vec2 uv = vec2(0.5 - l / 6.28318530718, 0.5 + b / 3.14159265359);
  // 5-tap soften (the panorama is magnified ~2x at 1440px wide); sampler decodes sRGB to linear
  vec2 e = uTexel * 1.2;
  vec3 c = (texture2D(map, uv).rgb * 2. + texture2D(map, uv + vec2(e.x, 0.)).rgb + texture2D(map, uv - vec2(e.x, 0.)).rgb
          + texture2D(map, uv + vec2(0., e.y)).rgb + texture2D(map, uv - vec2(0., e.y)).rgb) / 6.;
  float y = dot(c, vec3(0.2126, 0.7152, 0.0722));
  c = mix(vec3(y), c, uSat);                         // slightly desaturated
  c = pow(c, vec3(1.15)) * uInt;                     // gentle toe so the dark sky stays dark
  gl_FragColor = vec4(c, 1.);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`,vi=fi.replace("gl_PointSize = s * uPx;","float ps = s * uPx, pw = max(ps, 2.2); vI *= (ps * ps) / (pw * pw) * 1.25; gl_PointSize = pw;"),pi=hi.replace(`float core = 1. - smoothstep(0., 1., d);     // round falloff (same curve as before, written with ordered edges)
  float a = core * core;`,"float a = exp(-d * d * 4.5);"),gi=`
attribute float aI; uniform float uPx; varying float vI;
void main(){ vI = aI; gl_PointSize = 2.0 * uPx; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,xi=`
varying float vI;
void main(){ float d = length(gl_PointCoord - 0.5) * 2.; float a = exp(-d * d * 3.); if (a < 0.01) discard;
  gl_FragColor = vec4(vec3(1., 0.93, 0.86) * vI * a, 1.);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;async function Vn({THREE:e,scene:t,starsUrl:r,milkyUrl:u,rotation:a=null,milkyWay:n=!0,milkyWayIntensity:L=.3,starGain:x=1,pixelRatio:k=null}={}){L*=1.7;let B=e.Vector3,z=new e.Group;z.name="sky",z.frustumCulled=!1,a&&a.isQuaternion?z.quaternion.copy(a):a&&a.isEuler?z.setRotationFromEuler(a):Array.isArray(a)?z.rotation.set(a[0],a[1],a[2]):z.quaternion.copy(ui(e));let T=await(await fetch(r)).arrayBuffer(),W=new Float32Array(T),l=W.length/5,N=new Float32Array(l*3),U=new Float32Array(l),R=new Float32Array(l);for(let re=0;re<l;re++)N[re*3]=W[re*5]*Ba,N[re*3+1]=W[re*5+1]*Ba,N[re*3+2]=W[re*5+2]*Ba,U[re]=W[re*5+3],R[re]=W[re*5+4];let Z=new e.BufferGeometry;Z.setAttribute("position",new e.BufferAttribute(N,3)),Z.setAttribute("aMag",new e.BufferAttribute(U,1)),Z.setAttribute("aBV",new e.BufferAttribute(R,1));let ie=new e.ShaderMaterial({vertexShader:vi,fragmentShader:pi,uniforms:{uPx:{value:k||Math.min(window.devicePixelRatio||1,2)},uGain:{value:x}},transparent:!0,blending:e.AdditiveBlending,depthWrite:!1,depthTest:!0,fog:!1}),Le=new e.Points(Z,ie);Le.frustumCulled=!1,Le.renderOrder=-9,Le.name="sky-stars",z.add(Le);{let re=ho(192.85948,27.12825,B),We=26e3,xe=new Float32Array(We*3),Me=new Float32Array(We),le=new B,ce=99,P=()=>(ce=ce*16807%2147483647)/2147483647;for(let pe=0,we=0;pe<We;we++){le.set(P()*2-1,P()*2-1,P()*2-1);let Ce=le.length();if(Ce>1||Ce<.05)continue;le.divideScalar(Ce);let ue=Math.abs(le.dot(re));P()>.12+.88*Math.exp(-ue*ue/.02)||(xe[pe*3]=le.x*Ba*.995,xe[pe*3+1]=le.y*Ba*.995,xe[pe*3+2]=le.z*Ba*.995,Me[pe]=.035+.11*Math.pow(P(),3),pe++)}let H=new e.BufferGeometry;H.setAttribute("position",new e.BufferAttribute(xe,3)),H.setAttribute("aI",new e.BufferAttribute(Me,1));let Se=new e.Points(H,new e.ShaderMaterial({vertexShader:gi,fragmentShader:xi,uniforms:{uPx:ie.uniforms.uPx},transparent:!0,blending:e.AdditiveBlending,depthWrite:!1,depthTest:!0,fog:!1}));Se.frustumCulled=!1,Se.renderOrder=-9,Se.name="sky-starhaze",z.add(Se)}let me=null;if(n){let re=await xa(e,u,{flipY:!0}).catch(()=>null);if(re){re.colorSpace=e.SRGBColorSpace,re.anisotropy=4,re.wrapS=e.RepeatWrapping;let We=ho(192.85948,27.12825,B),xe=ho(266.40499,-28.93617,B),Me=new B().crossVectors(We,xe),le=new e.ShaderMaterial({vertexShader:di,fragmentShader:mi,side:e.BackSide,uniforms:{map:{value:re},gc:{value:xe},gy:{value:Me},ngp:{value:We},uInt:{value:L},uSat:{value:.8},uTexel:{value:new e.Vector2(1/re.image.width,1/re.image.height)}},depthWrite:!1,depthTest:!1,fog:!1});me=new e.Mesh(new e.SphereGeometry(Ba*.99,64,32),le),me.frustumCulled=!1,me.renderOrder=-10,me.name="sky-milkyway",z.add(me)}}return t.add(z),{group:z,stars:Le,milkyWay:me,update:re=>{z.position.copy(re)},starCount:l,starMaterial:ie}}var bi=`
vec3 marsSky(vec3 d, vec3 s, float k){
  float se = s.y, ca = dot(d, s), h = max(d.y, 0.), fw = max(ca, 0.);
  float day = smoothstep(-0.10, 0.12, se), twi = smoothstep(-0.32, 0.0, se);
  vec3 zen = vec3(0.34, 0.205, 0.13), hor = vec3(0.90, 0.62, 0.40);
  vec3 c = mix(hor, zen, smoothstep(0., 1., pow(h, 0.42)));
  c *= 0.68 + 0.55 * pow(fw, 4.) + 0.4 * pow(fw, 30.);                         // broad dusty forward lobe
  c *= mix(0.38 + 0.62 * smoothstep(-0.7, 0.7, ca), 1., smoothstep(0.08, 0.45, se)); // low sun: the far side of the sky goes first
  c *= mix(0.11 * twi, 1., day);
  c *= 0.75 + 0.25 * smoothstep(-0.3, 0.6, se);
  float aur = pow(fw, 90.) * 2.2 + pow(fw, 16.) * 0.45 + pow(fw, 5.) * 0.08;    // blue aureole
  c += vec3(0.30, 0.50, 0.98) * aur * twi * mix(0.95, 0.30, day) * (1. - 0.5 * smoothstep(0.3, 0.9, h));
  c += vec3(0.0022, 0.0028, 0.0055);                                             // night: deep blue black
  c *= mix(pow(k, 2.6), pow(k, 0.6), exp(-h * 7.));                              // thin air: zenith goes black first, a limb band hangs on
  return c;
}
float marsSunDisc(vec3 d, vec3 s){ return smoothstep(0.999992, 0.999996, dot(d, s)) + 0.04 * pow(max(dot(d, s), 0.), 3000.); }
`,Un=`
float ah(vec2 p){ p = fract(p * vec2(443.897, 441.423)); p += dot(p, p.yx + 19.19); return fract((p.x + p.y) * p.x); }
float ah3(vec3 p){ p = fract(p * 0.3183099 + .1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float an(vec2 x){ vec2 i = floor(x), f = fract(x); f = f * f * (3. - 2. * f);
  return mix(mix(ah(i), ah(i + vec2(1, 0)), f.x), mix(ah(i + vec2(0, 1)), ah(i + vec2(1, 1)), f.x), f.y); }
// fbm with each octave faded to its mean as it nears the pixel footprint (fw = footprint in units of the base octave): no shimmer
float afbm(vec2 p, float fw){ float v = 0., a = .5; for (int i = 0; i < 5; i++){ float k = 1. - smoothstep(.25, .6, fw); v += a * mix(.5, an(p), k); p = p * 2.03 + 17.1; fw *= 2.03; a *= .5; } return v; }
`,yi=`
const vec2 JC = vec2(6000., 6500.); const float JR = 22500.;
const vec2 JA = vec2(-14900., -1600.); const vec2 JAX = vec2(0.992, 0.123);   // delta apex at the inlet, fan axis toward the colony
float rimCrest(float az){ return 640. + 160. * sin(az * 3. + 1.) + 90. * sin(az * 7. + 2.3) - 520. * exp(-((az + 2.77) / 0.09) * ((az + 2.77) / 0.09)); }
float jezH(vec2 p, float fw, out vec3 alb){
  vec2 q = p - JC; float r = length(q) / JR, az = atan(q.y, q.x);
  float n1 = afbm(p / 7000., fw / 7000.), n2 = afbm(p / 900. + 3., fw / 900.);
  float rn = r + (n1 - 0.5) * 0.10;
  float crest = rimCrest(az);
  float h = rn < 1. ? mix(0., crest, pow(smoothstep(0.80, 1.0, rn), 1.6)) : crest * exp(-(rn - 1.) * 4.5) + 380. * (1. - exp(-(rn - 1.) * 4.5));
  // delta fan
  vec2 v = p - JA; float dA = length(v) / 13000., ph = atan(v.x * JAX.y - v.y * JAX.x, dot(v, JAX));
  float edge = 1. + (afbm(vec2(ph * 5., 2.), 0.) - 0.5) * 0.35 - 0.3 * (ph / 0.95) * (ph / 0.95);
  float fan = (1. - smoothstep(edge - 0.04, edge, dA)) * (1. - smoothstep(0.8, 1.1, abs(ph)));
  float fingers = (0.5 + 0.5 * sin(ph * 17. + n1 * 14. + n2 * 3.)) * smoothstep(0.2, 0.7, dA);
  h += fan * (95. * (1. - pow(dA, 1.8)) + 18. * fingers);
  // inlet valley, west of the apex
  float vx = p.x - JA.x, vz = JA.y + 1700. * sin(vx / 4200.) + 600. * sin(vx / 1300.);
  h -= (1. - smoothstep(350., 900., abs(p.y - vz))) * smoothstep(400., -2500., vx) * 140.;
  // small craters (two sizes)
  for (int s = 0; s < 2; s++){
    float sc = s == 0 ? 2600. : 650.; vec2 g = p / sc, gi = floor(g), gf = fract(g);
    for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++){
      vec2 o = vec2(i, j), rn2 = vec2(ah(gi + o), ah(gi + o + 7.3));
      float rad = 0.08 + 0.22 * pow(ah(gi + o + 3.1), 2.), on = step(s == 0 ? 0.82 : 0.7, ah(gi + o + 11.7));
      float d = length(o + rn2 * 0.6 + 0.2 - gf) / rad;
      h += on * sc * rad * 0.07 * ((d < 1. ? (d * d - 1.) : 0.) + 0.25 * exp(-((d - 1.) / 0.18) * ((d - 1.) / 0.18))) * (1. - smoothstep(0.3, 0.9, fw / sc * 4.));
    }
  }
  // colour: plains butterscotch fines, darker crater floor + dark sand, pale layered delta, bright bedrock on the rim
  vec3 fines = vec3(.62, .38, .22), floorC = vec3(.40, .27, .19), sand = vec3(.17, .12, .10), deltaC = vec3(.70, .50, .34), bed = vec3(.68, .52, .40);
  alb = rn < 0.97 ? floorC : fines;
  alb = mix(alb, fines, smoothstep(0.84, 1.0, rn) * 0.7);
  alb = mix(alb, sand, smoothstep(0.58, 0.78, afbm(p / 2300. + 9., fw / 2300.)) * 0.7 * (1. - fan));
  alb = mix(alb, deltaC * (0.85 + 0.3 * fingers), fan * 0.85);
  alb = mix(alb, bed, smoothstep(0.88, 1.0, rn) * (1. - smoothstep(1.0, 1.08, rn)) * 0.55);
  alb *= 0.82 + 0.36 * n2;
  return h;
}`,wi="varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }",Lr=`
${Un}
${bi}
${yi}
const float RM = 3389500.;
vec3 sunCol(float se){ float am = 1. / (max(se, 0.) + 0.06); return exp(-vec3(0.05, 0.085, 0.15) * am * 1.6) * smoothstep(-0.04, 0.05, se); }
// aerial perspective: dust scale height ~11 km, ~30 km visibility on the floor
vec2 aerial(float h0, float h1, float dist){ float H = 11000., b = 1. / 26000.; float a = exp(-max(h0, 0.) / H), c = exp(-max(h1, 0.) / H);
  float od = abs(h1 - h0) > 1. ? b * H * abs(a - c) * dist / abs(h1 - h0) : b * a * dist; return vec2(exp(-od), od); }
// lit procedural ground at P (colony coords, height 0), fw = its pixel footprint (fwidth, taken by the caller in uniform flow)
vec3 jezLit(vec3 P, float fw, vec3 S, float amb){
  vec3 alb; float e = max(fw * 0.7, 25.);
  vec3 ax; float hx = jezH(P.xz + vec2(e, 0.), fw, ax), hz = jezH(P.xz + vec2(0., e), fw, ax), h0 = jezH(P.xz, fw, alb);
  vec3 n = normalize(vec3(-(hx - h0) / e, 1., -(hz - h0) / e));
  float NL = max(dot(n, S), 0.);
  float self = smoothstep(-0.02, 0.06, dot(n, S) - 0.0);
  return alb * (NL * self * sunCol(S.y) * 2.0 + vec3(.95, .6, .36) * 0.25 * amb * (0.6 + 0.4 * n.y));
}
// one haze for the colony's terrain mesh and the dome's floor beyond it: the scene's linear fog (capped at HCAP) or the aerial haze,
// whichever is more, at the same slant distance, so the haze never thins outward across the mesh edge (that read as a bright seam)
const float HCAP = 0.62;
float jezHaze(float d, float h0, float fn, float ff){ return max(min(clamp((d - fn) / max(ff - fn, 1.), 0., 1.), HCAP), 1. - aerial(h0, 0., d).x); }
vec3 jezHazeCol(vec3 rd, vec3 S, float k){ return marsSky(normalize(vec3(rd.x, 0.02, rd.z)), S, k); }
// aerial haze over a ground colour seen from ro along rd: the haze takes the horizon colour in that direction
vec3 jezAir(vec3 gc, vec3 ro, vec3 rd, float hgt, float dist, vec3 S, float k){
  vec2 ae = aerial(ro.y, hgt, dist);
  return gc * ae.x + marsSky(normalize(vec3(rd.x, 0.02, rd.z)), S, k) * (1. - ae.x);
}`,Mi=`
uniform vec3 uSun, uOrigin; uniform float uK, uNight, uT, uAmb, uFogN, uFogF;
varying vec3 vW;
${Lr}
void main(){
  vec3 ro = cameraPosition - uOrigin, rd = normalize(vW - cameraPosition), S = normalize(uSun);
  vec3 sky = marsSky(rd, S, uK);
  // stars: one candidate per cell of a 3D grid on the unit sphere, drawn as a ~1.3 px gaussian (no sub-pixel shimmer)
  float px = max(length(fwidth(rd)), 1e-5);
  float vis = (1. - smoothstep(0.0, 0.25, dot(sky, vec3(.3, .55, .15)) * 40.));
  if (vis > 0.) { vec3 g = rd * 180., gi = floor(g); float hs = ah3(gi);
    if (hs > 0.8) { vec3 sp = (gi + 0.2 + 0.6 * vec3(ah3(gi + 1.7), ah3(gi + 3.1), ah3(gi + 5.3))) / 180.;
      float d = length(normalize(sp) - rd) / (px * 1.3), m = pow((hs - 0.8) / 0.2, 6.);
      sky += vec3(1., 0.95, 0.88) * exp(-d * d) * (0.03 + 2.4 * m) * vis; } }
  sky += vec3(1.0, 0.95, 0.86) * 60. * marsSunDisc(rd, S) * sunCol(S.y) * (1. - uNight * 0.6);
  vec3 col = sky;
  // ground: the planet sphere under the colony (true horizon dip), and the crater rim as a silhouette where it stands above the ray
  vec3 c0 = vec3(0., -RM, 0.), oc = ro - c0; float b = dot(oc, rd), disc = b * b - (dot(oc, oc) - RM * RM);
  float tg = disc > 0. ? -b - sqrt(disc) : -1.;
  vec2 rh = rd.xz / max(length(rd.xz), 1e-4); vec2 qo = ro.xz - JC;
  float bb = dot(qo, rh), cc = dot(qo, qo) - JR * JR, dd = bb * bb - cc;
  float dr = dd > 0. ? -bb + sqrt(dd) : -1.;                       // far crossing of the rim circle (we are inside the crater)
  float hit = 0.; vec3 gc = vec3(0.); float dist = 0., hgt = 0.;
  if (dr > 0.) {
    vec2 pc = ro.xz + rh * dr; float az = atan(pc.y - JC.y, pc.x - JC.x);
    float crest = rimCrest(az) + (afbm(pc / 2500., 0.) - 0.5) * 220. - dr * dr / (2. * RM);
    float tanR = rd.y / max(length(rd.xz), 1e-4), tanC = (crest - ro.y) / dr;
    if (tanR < tanC && (tg < 0. || tg * length(rd.xz) > dr)) {      // the inner wall of the far rim
      hit = 1.; dist = dr / max(length(rd.xz), 1e-4); hgt = ro.y + rd.y * dist;
      vec3 n = normalize(vec3(-(pc.x - JC.x) / JR * 0.8, 1., -(pc.y - JC.y) / JR * 0.8));
      float sh = 0.75 + 0.5 * afbm(vec2(az * 60., hgt / 90.), 0.);
      gc = vec3(.62, .46, .34) * sh * (max(dot(n, S), 0.) * sunCol(S.y) * 2.0 + vec3(.95, .6, .36) * 0.25 * uAmb);
    }
  }
  if (hit < 0.5 && tg > 0.) {
    vec3 P = ro + rd * tg; dist = tg; hgt = 0.;
    float inner = 1. - smoothstep(4150., 4400., max(abs(P.x), abs(P.z)));  // under the colony's own 9 km terrain: never seen, shade it flat
    if (inner > 0.999) { gc = vec3(.5, .32, .2) * (max(S.y, 0.) * sunCol(S.y) * 2.0 + vec3(.95, .6, .36) * 0.25 * uAmb); hit = 1.; }
  }
  if (hit < 0.5 && tg > 0.) {
    vec3 P = ro + rd * tg; dist = tg; hgt = 0.;
    gc = jezLit(P, max(length(fwidth(P.xz)), 1.), S, uAmb);
    hit = 1.;
  }
  if (hit > 0.5) col = hgt > 0. ? jezAir(gc, ro, rd, hgt, dist, S, uK) : mix(gc, jezHazeCol(rd, S, uK), jezHaze(dist, ro.y, uFogN, uFogF)); // floor: the terrain mesh's haze
  gl_FragColor = vec4(col, 1.);
}`,Si="varying vec2 vS; void main(){ vS = position.xy; gl_Position = vec4(position.xy, 0., 1.); }",Ai=`
uniform float uE, uT, uAsp, uFlow; uniform vec3 uSky, uLit; uniform vec2 uSunS;
varying vec2 vS;
${Un}
float fb(vec2 p){ return afbm(p, 0.); }
void main(){
  float e = uE; vec2 s = vS * vec2(uAsp, 1.); float r = length(s), ang = atan(s.y, s.x), lr = log(max(r, 1e-3));
  // ---- heat: glow builds at the frame edges; the plasma streaks are cut to a trace (they read as a warp jump), the lens pass shimmers
  float heat = smoothstep(0.03, 0.20, e) * (1. - smoothstep(0.31, 0.40, e));
  float edge = smoothstep(0.62, 1.55, r);
  float fl = 0.8 + 0.2 * an(vec2(uT * 9., 3.)) + 0.15 * an(vec2(ang * 3., uT * 4.));
  float str = pow(an(vec2(ang * 46. / 6.2832 * 6.2832, lr * 2.2 - uFlow * 9.)), 5.) + 0.6 * pow(an(vec2(ang * 120. / 6.2832 * 6.2832 + 40., lr * 3. - uFlow * 13.)), 8.);
  vec3 plasma = mix(vec3(1.0, 0.34, 0.12), vec3(1.0, 0.50, 0.38), edge);         // hot orange, pinker where it is thinnest
  float hk = heat * heat;
  vec3 add = plasma * fl * (edge * edge * 0.9 * heat + str * edge * edge * 0.1 * hk);
  add += vec3(1.0, 0.45, 0.2) * hk * 0.06 * (1. - smoothstep(0., 0.9, r));        // faint shock-layer glow ahead
  // ---- haze: dust layers we fall through (infinite zoom, layers flow outward), heaviest at the swap, then they part
  float cover = smoothstep(0.15, 0.27, e) * (1. - smoothstep(0.36, 0.66, e));
  float a = 0.; vec3 hc = vec3(0.);
  if (cover > 0.) {
    for (int i = 0; i < 3; i++) {
      float ph = fract(uFlow * 0.9 + float(i) / 3.), w = sin(3.14159 * ph);
      vec2 u = s / (0.3 + ph * 1.5) + vec2(float(i) * 7.1, float(i) * 3.3);
      float d = fb(u * 2.6) + 0.35 * (fb(u * 9.) - 0.5), thr = mix(0.36, 0.86, smoothstep(0.30, 0.62, e));   // holes open as we drop
      float m = smoothstep(thr - 0.10, thr + 0.12, d) * w;
      float lit = 0.5 + (fb(u * 2.6 + uSunS * 0.05) - fb(u * 2.6 - uSunS * 0.05)) * 9.;  // billows lit from the sun side, shaded away from it
      float dens = smoothstep(thr, thr + 0.35, d);
      hc += mix(uSky * 0.42, uLit, clamp(lit, 0., 1.)) * (1. - 0.35 * dens) * m; a += m;
    }
    hc = mix(uSky * 0.5, hc / max(a, 1e-3), clamp(a * 1.3, 0., 1.)); a = clamp(a * 0.85, 0., 1.);   // gaps between billows: deeper haze
    float full = smoothstep(0.24, 0.27, e) * (1. - smoothstep(0.33, 0.38, e));     // swap window: fully covered
    a = mix(a, 1., full) * cover;
  }
  vec3 col = hc * a + add * (1. - 0.5 * a);
  gl_FragColor = vec4(col, a);
}`;function Nn({THREE:e,origin:t=new e.Vector3(0,-6e3,0)}={}){let r=e.MathUtils.smoothstep,u=ie=>Math.min(1,Math.max(0,ie)),a={uSun:{value:new e.Vector3(-.9,.33,-.2).normalize()},uOrigin:{value:t.clone()},uK:{value:1},uNight:{value:0},uT:{value:0},uAmb:{value:1},uFogN:{value:500},uFogF:{value:4200}},n=new e.Mesh(new e.SphereGeometry(6e3,64,32),new e.ShaderMaterial({vertexShader:wi,fragmentShader:Mi,uniforms:a,side:e.BackSide,depthWrite:!1,depthTest:!1,fog:!1}));n.frustumCulled=!1,n.renderOrder=-20,n.visible=!1,n.name="mars-air-dome";let L={uE:{value:0},uT:{value:0},uAsp:{value:1},uFlow:{value:0},uSky:{value:new e.Color(.9,.6,.38)},uLit:{value:new e.Color(1.2,.8,.5)},uSunS:{value:new e.Vector2(-1,.4)}},x=new e.BufferGeometry;x.setAttribute("position",new e.BufferAttribute(new Float32Array([-1,-1,0,3,-1,0,-1,3,0]),3));let k=new e.Mesh(x,new e.ShaderMaterial({vertexShader:Si,fragmentShader:Ai,uniforms:L,transparent:!0,depthWrite:!1,depthTest:!1,fog:!1,blending:e.CustomBlending,blendEquation:e.AddEquation,blendSrc:e.OneFactor,blendDst:e.OneMinusSrcAlphaFactor}));k.frustumCulled=!1,k.renderOrder=999,k.visible=!1,k.name="mars-air-veil";let S=new e.Color,B=(ie,Le,me,X)=>{let re=me.y,We=Le.x*me.x+Le.y*me.y+Le.z*me.z,xe=Math.max(Le.y,0),Me=Math.max(We,0),le=r(re,-.1,.12),ce=r(re,-.32,0),P=r(Math.pow(xe,.42),0,1);ie.setRGB(.9+(.34-.9)*P,.62+(.205-.62)*P,.4+(.13-.4)*P);let H=.68+.55*Me**4+.4*Me**30;H*=.38+.62*r(We,-.7,.7)+(1-(.38+.62*r(We,-.7,.7)))*r(re,.08,.45),H*=.11*ce+(1-.11*ce)*le,H*=.75+.25*r(re,-.3,.6),ie.multiplyScalar(H);let Se=(Me**90*2.2+Me**16*.45+Me**5*.08)*ce*(.95+(.3-.95)*le);ie.r+=.3*Se+.0022,ie.g+=.5*Se+.0028,ie.b+=.98*Se+.0055;let pe=Math.pow(X,2.6)+(Math.pow(X,.6)-Math.pow(X,2.6))*Math.exp(-xe*7);return ie.multiplyScalar(pe),ie},z=new e.Vector3,T=new e.Vector3,W=new e.Vector3,l=(ie,Le=a.uSun.value,me=a.uK.value,X=null)=>{ie.setRGB(0,0,0);let re=0;for(let We=0;We<8;We++){let xe=We/8*Math.PI*2;z.set(Math.cos(xe),.03,Math.sin(xe)).normalize();let Me=X?1+Math.max(0,z.x*X.x+z.z*X.z)*2:1;B(S,z,Le,me),ie.r+=S.r*Me,ie.g+=S.g*Me,ie.b+=S.b*Me,re+=Me}return ie.multiplyScalar(1/re)},N=ie=>(z.set(0,1,0),B(ie,z,a.uSun.value,1),l(S),ie.lerp(S,.5)),U={e:0,flow:0,prevE:0};function R(ie,Le={}){ie=u(ie);let{inCol:me=!1,cam:X=null,t:re=0,dt:We=0,alt:xe=0,fog:Me=null,sunDir:le=null,night:ce=0}=Le;if(U.flow+=(We||0)*.12+Math.abs(ie-U.prevE)*4,U.prevE=ie,U.e=ie,L.uE.value=ie,L.uT.value=re,L.uFlow.value=U.flow,X&&(L.uAsp.value=X.aspect||1),k.visible=ie>.005&&ie<.7,le&&a.uSun.value.copy(le).normalize(),a.uNight.value=ce,a.uT.value=re,a.uK.value=me?.35+.65*r(ie,.3,.52):0,a.uAmb.value=1-.85*ce,n.visible=!!me,X&&me&&(n.position.copy(X.position),n.updateMatrixWorld()),l(L.uSky.value,a.uSun.value,1),L.uSky.value.lerp(S.setRGB(.55,.22,.12),1-r(ie,.22,.4)),L.uLit.value.copy(L.uSky.value).multiplyScalar(1.9),X&&(T.copy(a.uSun.value).transformDirection(X.matrixWorldInverse),L.uSunS.value.set(T.x,T.y).normalize()),Me&&me){X&&X.getWorldDirection(W),l(Me.color,a.uSun.value,a.uK.value,X?W:null);let P=Math.max(0,xe),H=r(ie,.45,1);Me.near=500+P*1.5*(1-H*.5),Me.far=Math.max(4200,(4200+P*6)*(.55+.45*H)),a.uFogN.value=Me.near,a.uFogF.value=Me.far}}return{dome:n,veil:k,entry:R,roots:()=>[k,n],hemi:N,horizon:l,skyAt:B,state:U,uniforms:{dome:a,veil:L}}}var mo=`
const float PI = 3.14159265;
float hash12(vec2 p){ p = fract(p * vec2(443.897, 441.423)); p += dot(p, p.yx + 19.19); return fract((p.x + p.y) * p.x); }
float hash13(vec3 p){ p = fract(p * 0.3183099 + .1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float vnoise(vec3 x){ vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash13(i), hash13(i + vec3(1,0,0)), f.x), mix(hash13(i + vec3(0,1,0)), hash13(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(hash13(i + vec3(0,0,1)), hash13(i + vec3(1,0,1)), f.x), mix(hash13(i + vec3(0,1,1)), hash13(i + vec3(1,1,1)), f.x), f.y), f.z); }
float fbm3(vec3 p){ float v = 0., a = .5; for(int i = 0; i < 3; i++){ v += a * vnoise(p); p *= 2.07; a *= .5; } return v; }
vec4 cubicW(float v){ float v2=v*v, v3=v2*v; return vec4(1.-3.*v+3.*v2-v3, 4.-6.*v2+3.*v3, 1.+3.*v+3.*v2-3.*v3, v3)/6.; }
float bicubicR(sampler2D t, vec2 uv, vec2 res){   // B-spline from 4 bilinear taps: low-res maps stay round up close
  uv=uv*res-.5; vec2 f=fract(uv); uv-=f; vec4 xc=cubicW(f.x), yc=cubicW(f.y);
  vec4 c=uv.xxyy+vec2(-.5,1.5).xyxy, sw=vec4(xc.xz+xc.yw, yc.xz+yc.yw), o=(c+vec4(xc.yw,yc.yw)/sw)/res.xxyy;
  float a=texture2D(t,o.xz).r, b=texture2D(t,o.yz).r, d=texture2D(t,o.xw).r, e=texture2D(t,o.yw).r;
  return mix(mix(e,d,sw.x/(sw.x+sw.y)), mix(b,a,sw.x/(sw.x+sw.y)), sw.z/(sw.z+sw.w)); }
// direction on the unit sphere -> three.js SphereGeometry uv
vec2 dirToUv(vec3 p){ return vec2(fract(atan(p.z, -p.x) / (2. * PI)), 0.5 + asin(clamp(p.y, -1., 1.)) / PI); }
// tangent frame on the sphere in object space (east = +u, north = +v)
void sphFrame(vec3 p, out vec3 e, out vec3 n){ vec3 c = cross(vec3(0,1,0), p); e = length(c) < 1e-4 ? vec3(0,0,1) : normalize(c); n = cross(p, e); }
// apply a tangent-space (OpenGL style) normal sample to the sphere normal p
vec3 perturb(vec3 p, vec3 nt, float k){ vec3 e, n; sphFrame(p, e, n); nt.xy *= k; return normalize(e * nt.x + n * nt.y + p * max(nt.z, 0.05)); }
// sunlight colour after the air column at sun cosine mu (Kasten-Young airmass), tau = zenith optical depth per channel
vec3 sunTrans(float mu, vec3 tau){ float el = degrees(asin(clamp(mu, -1., 1.))); el = max(el, 0.3);
  float am = 1. / (sin(radians(el)) + 0.50572 * pow(el + 6.07995, -1.6364)); return exp(-tau * am); }
`,Wo=`
varying vec3 vP; varying vec2 vUv; varying vec3 vV;
void main(){
  vP = position; vUv = uv;
  mat3 M = mat3(modelMatrix); vec4 w = modelMatrix * vec4(position, 1.);
  vV = transpose(M) * (cameraPosition - w.xyz);           // view vector in object space (meshes only rotate)
  gl_Position = projectionMatrix * viewMatrix * w;
}`,Ci=`
uniform sampler2D tMap, tSpec, tNorm, tLights, tClouds;
uniform vec3 uSun; uniform float uGrow, uCloudOff, uCloudH, uSunI;
varying vec3 vP; varying vec2 vUv; varying vec3 vV;
${mo}
void main(){
  vec3 p = normalize(vP), V = normalize(vV), L = normalize(uSun);
  float mu = dot(p, L);
  vec3 alb = texture2D(tMap, vUv).rgb;
  float ocean = smoothstep(0.35, 0.7, texture2D(tSpec, vUv).r);
  // the source map paints the sea near-black; lift it to a physical deep blue, keep shallows/ice from the map
  vec3 seaAlb = max(alb, vec3(0.010, 0.036, 0.100)) + vec3(0.0, 0.01, 0.03) * smoothstep(0.0, 0.2, alb.b);
  vec3 base = mix(alb, seaAlb, ocean);

  // relief: normal map on land only, fades toward the poles' texture pinch
  vec3 nt = texture2D(tNorm, vUv).rgb * 2. - 1.;
  vec3 N = perturb(p, nt, 0.8 * (1. - ocean));

  // cloud cover straight above (dims night lights) and cloud shadow: sample the cloud map where the sun ray crosses the cloud deck
  float cover = texture2D(tClouds, vec2(fract(vUv.x + uCloudOff), vUv.y)).r;
  float mus = max(mu, 0.12);
  vec3 q = normalize(p + L * (uCloudH / mus));              // cloud deck point on the way to the sun (radii units)
  vec2 uq = dirToUv(q); uq.x = fract(uq.x + uCloudOff);
  float sh = textureLod(tClouds, uq, 2.2).r;                // lod keeps it soft and avoids the atan seam
  float shadow = 1. - 0.62 * smoothstep(0.15, 0.85, sh) * smoothstep(0.0, 0.25, mu + 0.05);

  // sunlight through the atmosphere: orange/red toward the terminator
  vec3 sunCol = sunTrans(mu, vec3(0.034, 0.075, 0.175));
  float NL = max(dot(N, L), 0.);
  NL *= smoothstep(-0.02, 0.07, mu);                       // geometric terminator so relief cannot leak light onto the night side
  vec3 col = base * sunCol * NL * uSunI * shadow;
  // blue Rayleigh sky fill on the day side, and the pink/orange twilight band at the terminator
  col += base * vec3(0.10, 0.17, 0.34) * 0.55 * smoothstep(-0.12, 0.6, mu);
  col += vec3(0.95, 0.42, 0.22) * 0.050 * exp(-pow((mu + 0.015) / 0.075, 2.)) * (0.35 + 0.65 * (1. - ocean * 0.5));

  // ocean: tight sun glint + broad sheen, plus Fresnel sky reflection toward the limb
  vec3 H = normalize(L + V); float nh = max(dot(normalize(p), H), 0.), vh = max(dot(V, H), 0.);
  float F = 0.02 + 0.98 * pow(1. - max(dot(p, V), 0.), 5.);
  float glint = pow(nh, 2400.) * 70. + pow(nh, 420.) * 6. + pow(nh, 90.) * 0.12;
  float lit = smoothstep(0.0, 0.12, mu);
  float gl = glint * (0.35 + 1.6 * F); gl /= 1. + gl / 8.;   // soft cap: at grazing the Fresnel boost made the glint a white sun disc on the skim
  col += ocean * lit * (1. - smoothstep(0.1, 0.8, cover)) * vec3(1.0, 0.93, 0.82) * sunCol * gl;
  col += ocean * vec3(0.10, 0.20, 0.42) * F * 1.4 * smoothstep(-0.2, 0.5, mu);

  // night lights: real NASA map, warm sodium, switched on region by region as 'uGrow' rises
  float night = 1. - smoothstep(-0.14, 0.06, mu);
  float li = clamp((bicubicR(tLights, vUv, vec2(2048., 1024.)) - 0.10) / 0.8, 0., 1.);   // bicubic: the 2k map stays round on the close pull out   // the source map has a dim continental haze; keep only lamps
  float lg = max(textureLod(tLights, vUv, 3.0).r - 0.07, 0.);               // bleed for the glow around cities
  float dCell = hash12(floor(vUv * vec2(72., 36.)) + 3.1);  // ~5 degree regions pop on in random order
  float dTex = hash12(floor(vUv * vec2(2048., 1024.)));     // individual lamps trail behind their region
  float onAt = dCell * 0.72 + dTex * 0.28;
  float on = smoothstep(onAt, onAt + 0.06, uGrow * 1.08);
  vec3 sodium = vec3(1.0, 0.58, 0.24);
  vec3 lights = sodium * (pow(li, 1.35) * 2.6 + lg * lg * 0.9) * on;
  col += lights * night * (1. - 0.82 * smoothstep(0.1, 0.8, cover));

  gl_FragColor = vec4(col, 1.);
}`,Di=`
uniform sampler2D tClouds; uniform vec3 uSun; uniform float uSunI; uniform sampler2D tLights; uniform vec4 uHole;
varying vec3 vP; varying vec2 vUv; varying vec3 vV;
${mo}
void main(){
  vec3 p = normalize(vP), V = normalize(vV), L = normalize(uSun);
  float mu = dot(p, L);
  // B-spline taps (density and its slope): bilinear texels read as hard squares once the camera skims the deck
  vec2 res = vec2(textureSize(tClouds, 0)), px = 1. / res;
  float d0 = bicubicR(tClouds, vUv, res);
  float dx = bicubicR(tClouds, vUv + vec2(px.x, 0.), res), dy = bicubicR(tClouds, vUv + vec2(0., px.y), res);
  // fine detail so the 2k map holds up in close shots; only inside existing cloud
  float nz = fbm3(p * 26.) - 0.5;
  float dens = clamp(d0 + nz * 0.55 * smoothstep(0.03, 0.4, d0) * (1.1 - d0), 0., 1.);
  dens = smoothstep(0.06, 0.78, dens);
  dens *= 1. - uHole.w * (1. - smoothstep(0.07, 0.16, length(p - uHole.xyz)));   // clear night over the opening site
  // puffiness: treat density as height, light the bumps
  vec3 e, n; sphFrame(p, e, n);
  vec3 N = normalize(p - (e * (dx - d0) + n * (dy - d0)) * 14.);
  float NL = max(dot(N, L), 0.) * smoothstep(-0.03, 0.1, mu);
  vec3 sunCol = sunTrans(mu, vec3(0.034, 0.075, 0.175));
  float NV = max(dot(p, V), 0.);
  // thick cloud: lit tops, shaded cores; thin cloud forward-scatters a little light past the terminator
  vec3 col = vec3(0.93, 0.95, 0.98) * sunCol * NL * uSunI * mix(1., 0.78, dens);
  col += vec3(0.10, 0.17, 0.34) * 0.55 * smoothstep(-0.12, 0.6, mu) * 0.9;
  col += vec3(0.95, 0.5, 0.3) * 0.05 * exp(-pow((mu + 0.01) / 0.08, 2.)) * dens;
  // faint city glow under the deck on the night side
  float night = 1. - smoothstep(-0.14, 0.06, mu);
  col += vec3(1.0, 0.58, 0.24) * max(textureLod(tLights, vUv, 3.0).r - 0.07, 0.) * 0.9 * night * dens;
  float a = dens * (1. + 0.5 * (1. - NV));
  gl_FragColor = vec4(col, clamp(a, 0., 1.) * 0.97);
}`,zi=`
uniform sampler2D tMap, tNorm; uniform vec3 uSun; uniform float uSunI, uAlbedo, uRelief;
varying vec3 vP; varying vec2 vUv; varying vec3 vV;
${mo}
void main(){
  vec3 p = normalize(vP), V = normalize(vV), L = normalize(uSun);
  float mu = dot(p, L);
  vec3 alb = texture2D(tMap, vUv).rgb;
  alb = pow(alb, vec3(1.25)) * uAlbedo;                      // the map is contrast-stretched; pull toward real lunar albedo
  vec3 N = perturb(p, texture2D(tNorm, vUv).rgb * 2. - 1., uRelief);
  float m0 = max(dot(N, L), 0.) * smoothstep(-0.04, 0.05, mu), m1 = max(dot(N, V), 0.04);
  float ls = 2. * m0 / (m0 + m1);                            // regolith is nearly flat-lit to the limb until the sun gets low
  float val = mix(m0, ls, 0.55);
  vec3 col = alb * val * uSunI;
  col += alb * vec3(0.35, 0.45, 0.7) * 0.004;               // earthshine
  gl_FragColor = vec4(col, 1.);
}`,Pi=`
uniform sampler2D tMap, tNorm; uniform vec3 uSun; uniform float uSunI, uRelief, uDomes, uBump, uR;
varying vec3 vP; varying vec2 vUv; varying vec3 vV;
${mo}
float lumA(vec2 uv){ return dot(texture2D(tMap, uv).rgb, vec3(.35, .5, .15)); }
void main(){
  vec3 c = vP + vV, rd = normalize(-vV);                      // object-space camera and view ray
  float b = dot(c, rd), q = sqrt(max(dot(c, c) - b * b, 0.)); // closest approach of the ray to the centre
  float fw = max(fwidth(q), 1e-5), cov = clamp(0.5 - (q - uR) / fw, 0., 1.);
  if (cov <= 0.) discard;
  float th = -b - sqrt(max(uR * uR - q * q, 0.));
  vec3 p = normalize(c + rd * th);                           // hit point (or the tangent point on the limb pixel)
  vec3 V = -rd, L = normalize(uSun);
  float mu = dot(p, L);
  vec2 uv = dirToUv(p);
  // derivatives from the smooth uv of the mesh (the atan seam would blow up dFdx of uv)
  vec2 gx = dFdx(vUv), gy = dFdy(vUv); gx.x = clamp(gx.x, -.004, .004); gy.x = clamp(gy.x, -.004, .004);
  // the mesh's uv derivatives miss the foreshortening of the true sphere: toward the limb a pixel spans far more map, so widen
  // the footprint by 1/cos (a mip bias at grazing angles). Without it the albedo and bump alias into sparkle on the edge.
  float slant = 1. - max(dot(p, -rd), 0.), fsh = mix(1., 1. / max(1. - slant, 0.06), 0.85);
  gx *= fsh; gy *= fsh;
  vec3 alb = textureGrad(tMap, uv, gx, gy).rgb;
  vec3 blur = textureGrad(tMap, uv, gx * 6., gy * 6.).rgb;
  alb = max(alb + (alb - blur) * 0.55 * (1. - smoothstep(0.5, 0.85, slant)), 0.); // local contrast: crater rims, chasma walls, dune fields (eased off toward the foreshortened limb)
  vec2 fwu = max(abs(gx), abs(gy));
  vec2 st = clamp(fwu * 1.2, vec2(1. / 4096., 1. / 2048.), vec2(0.004));
  float hx = lumA(uv + vec2(st.x, 0.)) - lumA(uv - vec2(st.x, 0.)), hy = lumA(uv + vec2(0., st.y)) - lumA(uv - vec2(0., st.y));
  vec3 nt = textureGrad(tNorm, uv, gx, gy).rgb * 2. - 1.; nt.xy *= uRelief;
  nt.xy -= vec2(hx, hy) * uBump * (1.5 / 4096.) / st.x;
  // sub-texel regolith: only where a map texel covers several pixels; fades out before it can alias
  float tex = 4096. * max(fwu.x, fwu.y * 2.), dk = 1. - smoothstep(0.35, 0.9, tex);
  if (dk > 0.) { float n = fbm3(p * 900.) - 0.5; alb *= 1. + n * 0.22 * dk; nt.xy += vec2(fbm3(p * 700. + 3.) - .5, fbm3(p * 700. + 9.) - .5) * 0.5 * dk; }
  vec3 N = perturb(p, normalize(nt), 1.);
  // ice: the map's own caps (bright, unsaturated), edge broken up so it is not a smooth band
  float lat = asin(clamp(p.y, -1., 1.)), mx = max(alb.r, max(alb.g, alb.b)), sat = (mx - min(alb.b, min(alb.r, alb.g))) / max(mx, 1e-3);
  float ice = smoothstep(0.62, 0.85, mx) * (1. - smoothstep(0.18, 0.42, sat));
  ice = max(ice, smoothstep(1.39, 1.45, abs(lat) + (fbm3(p * 22.) - 0.5) * 0.07));
  ice *= smoothstep(1.05, 1.25, abs(lat));
  vec3 rust = pow(alb, vec3(1.22)) * 1.32; float l = dot(rust, vec3(.3, .55, .15));
  rust = max(mix(vec3(l), rust, 1.18), 0.) * vec3(1.0, 0.92, 0.70);   // rich butterscotch rust, a touch more saturated than lit
  vec3 frost = vec3(0.80, 0.78, 0.76) * (0.7 + 0.2 * l);
  vec3 A = mix(rust, frost, ice * 0.85);                     // subtle: a pale cap, not a white sticker
  vec3 sunCol = sunTrans(mu, vec3(0.05, 0.085, 0.15));
  // terminator: Lambert with a few degrees of penumbra (the sun's disc + a little dust forward-scatter), then near black
  float gate = smoothstep(-0.035, 0.09, mu);
  float m0 = max(dot(N, L) + 0.04, 0.) / 1.04 * gate, m1 = max(dot(p, V), 0.05);
  float val = mix(m0, 2. * m0 / (m0 + m1), 0.12);
  vec3 col = A * sunCol * val * uSunI;
  col += A * vec3(0.95, 0.60, 0.36) * 0.03 * smoothstep(-0.05, 0.6, mu);           // dust fill, day side only
  col += vec3(0.95, 0.45, 0.22) * 0.016 * exp(-((mu - 0.01) / 0.07) * ((mu - 0.01) / 0.07));         // thin warm twilight band on the terminator
  col += A * vec3(0.5, 0.3, 0.25) * 0.004 * (1. - smoothstep(-0.2, 0.05, mu));       // whisper of night so the dark side still has shape
  // limb haze: optical depth of a thin dust layer grows as 1/cos toward the edge; brighter on the lit side, a faint blue forward lobe
  float hz = clamp(pow(slant, 6.) * 0.3 + pow(slant, 18.) * 0.35, 0., 0.5);
  float lit = smoothstep(-0.06, 0.45, mu);
  vec3 haze = vec3(1.0, 0.62, 0.38) * 0.5 * uSunI * sunCol * lit;   // butterscotch dust, lit by the same sun (warm, not cream)
  col = mix(col, haze, hz * smoothstep(-0.1, 0.2, mu));
  col += vec3(1.0, 0.66, 0.4) * pow(slant, 14.) * smoothstep(0.1, 0.7, mu) * 0.32 * uSunI;   // lit limb: a thin warm line that the halo rim continues
  float dome = smoothstep(0.9, 0.97, vnoise(p * 380.)) * smoothstep(0.62, 0.72, fbm3(p * 4.) * 1.35);
  col += vec3(1., 0.68, 0.3) * dome * (1. - smoothstep(-0.12, 0.05, mu)) * 2.4 * uDomes;
  gl_FragColor = vec4(col * cov, cov);                       // premultiplied: the AA'd limb blends over the stars
}`,Li=`
varying vec3 vN; varying vec3 vO;
void main(){ vN = normal; vO = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,ki=`
uniform vec3 uSun; uniform float uSunI, uA;
varying vec3 vN; varying vec3 vO;
${mo}
void main(){
  vec3 N = normalize(vN), L = normalize(uSun);
  float n = fbm3(vO * 9.);
  vec3 alb = vec3(0.075, 0.064, 0.056) * (0.8 + 0.4 * n);
  float m0 = max(dot(N, L), 0.);
  vec3 col = alb * m0 * uSunI * 2.2 + alb * 0.02;
  gl_FragColor = vec4(col * uA, uA);
}`,Oi=`
varying vec3 vW;
void main(){ vec4 w = modelMatrix * vec4(position, 1.); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,In=`
uniform vec3 uCenter, uSun, uBetaR, uBetaM, uBetaMe, uG, uSunCol;
uniform float uRp, uRa, uHr, uHm, uK;
varying vec3 vW;
const float PI = 3.14159265;
float dens(float h, float H){ return exp(-max(h, 0.) / H); }
void main(){
  vec3 ro = cameraPosition - uCenter, rd = normalize(vW - cameraPosition);
  float b = dot(ro, rd), cA = dot(ro, ro) - uRa * uRa, dA = b * b - cA;
  if (dA <= 0.) discard;
  float sA = sqrt(dA), t0 = max(-b - sA, 0.), t1 = -b + sA;
  float cP = dot(ro, ro) - uRp * uRp, dP = b * b - cP;
  if (dP > 0.) { float th = -b - sqrt(dP); if (th > 0.) t1 = min(t1, th); }   // stop at the ground
  if (t1 <= t0) discard;
  float tmin = clamp(-b, t0, t1), LA = tmin - t0, LB = t1 - tmin;
  float mu = dot(rd, uSun);
  vec3 phR = vec3(3. / (16. * PI) * (1. + mu * mu));
  vec3 g = uG; vec3 phM = (1. - g * g) / (4. * PI * pow(1. + g * g - 2. * g * mu, vec3(1.5)));
  float jit = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
  vec3 odV = vec3(0.), sR = vec3(0.), sM = vec3(0.);
  float dsh = 0.3 * uHr;
  for (int k = 0; k < 16; k++) {
    float ta, tb;
    if (k < 8) { int i = 7 - k; float s0 = float(i) / 8., s1 = float(i + 1) / 8.; ta = tmin - LA * s1 * s1 * s1; tb = tmin - LA * s0 * s0 * s0; }
    else       { int i = k - 8; float s0 = float(i) / 8., s1 = float(i + 1) / 8.; ta = tmin + LB * s0 * s0 * s0; tb = tmin + LB * s1 * s1 * s1; }
    float dt = tb - ta; if (dt <= 0.) continue;
    vec3 pos = ro + rd * (0.5 * (ta + tb) + (jit - 0.5) * 0.7 * dt);   // dither the sample inside its slot to hide banding
    float h = length(pos) - uRp;
    float dR = dens(h, uHr) * dt, dM = dens(h, uHm) * dt;
    odV += uBetaR * dR + uBetaMe * dM;
    // sunlight reaching this sample: shadow of the planet, then optical depth up to the top of the atmosphere
    float pl = dot(pos, uSun);
    float perp = length(pos - uSun * pl);
    float lit = pl > 0. ? 1. : smoothstep(uRp - dsh, uRp + dsh, perp);
    if (lit <= 0.) continue;
    float cL = dot(pos, pos) - uRa * uRa, tl = -pl + sqrt(max(pl * pl - cL, 0.));
    float stp = tl / 3.; vec3 odL = vec3(0.);
    for (int j = 0; j < 3; j++) { vec3 q = pos + uSun * (stp * (float(j) + .5)); float hq = length(q) - uRp;
      odL += uBetaR * dens(hq, uHr) * stp + uBetaMe * dens(hq, uHm) * stp; }
    vec3 att = exp(-(odV + odL)) * lit;
    sR += dR * att; sM += dM * att;
  }
  vec3 col = uSunCol * (sR * uBetaR * phR + sM * uBetaM * phM) * uK;
  float tr = dot(exp(-odV), vec3(0.3333));
  gl_FragColor = vec4(col, clamp(1. - tr, 0., 1.) * 0.85);   // premultiplied: also dims the ground seen through a long slant path
}`;function Gn({THREE:e,scene:t,renderer:r,toSun:u,EARTH:a,MOON:n,MARS:L,files:x}){let z=Math.min(8,r.capabilities.getMaxAnisotropy()),T=[],W={moon:[],mars:[]},l={},N=(w,J,_,K)=>{let D=new e.DataTexture(new Uint8Array([w,J,_,255]),1,1);return D.colorSpace=K?e.SRGBColorSpace:e.NoColorSpace,D.needsUpdate=!0,D},U=(w,J)=>xa(e,w,{flipY:!0,colorSpace:J?e.SRGBColorSpace:e.NoColorSpace}).then(_=>(_.anisotropy=z,_.wrapS=e.RepeatWrapping,_.needsUpdate=!0,_),()=>null),R=w=>{if(w&&r&&r.initTexture)try{r.initTexture(w)}catch{}},Z=(w,J,_,K)=>{let D={value:_},h=x[w];if(!h)return D;let $=O=>{O&&(R(O),D.value=O)};return K?W[K].push(()=>U(h,J).then(O=>({t:O,swap:$}))):T.push(U(h,J).then($)),D},ie=()=>new Promise(w=>typeof requestAnimationFrame=="function"?requestAnimationFrame(()=>w()):setTimeout(w,0));function Le(w){return l[w]?l[w]:l[w]=Promise.all(W[w].map(J=>J())).then(async J=>{for(let{t:_,swap:K}of J)_&&(K(_),await ie())})}let me=()=>({value:new e.Vector3().copy(u)}),X={tMap:Z("earth",!0,N(10,30,70,!0)),tSpec:Z("earthSpec",!1,N(255,255,255)),tNorm:Z("earthNorm",!1,N(128,128,255)),tLights:Z("earthLights",!1,N(0,0,0)),tClouds:Z("clouds",!1,N(0,0,0)),uSun:me(),uGrow:{value:.03},uCloudOff:{value:0},uCloudH:{value:.0085},uSunI:{value:3.3}},re=new e.Mesh(new e.SphereGeometry(10,192,96),new e.ShaderMaterial({vertexShader:Wo,fragmentShader:Ci,uniforms:X}));re.position.copy(a),t.add(re);let We={tClouds:X.tClouds,tLights:X.tLights,uSun:me(),uSunI:X.uSunI,uHole:{value:new e.Vector4(0,1,0,0)}},xe=new e.Mesh(new e.SphereGeometry(10*1.0085,160,80),new e.ShaderMaterial({vertexShader:Wo,fragmentShader:Di,uniforms:We,transparent:!0,depthWrite:!1}));xe.position.copy(a),xe.renderOrder=1,t.add(xe);let Me={tMap:Z("moon",!0,N(150,150,150,!0),"moon"),tNorm:Z("moonNorm",!1,N(128,128,255),"moon"),uSun:me(),uSunI:{value:3.3},uAlbedo:{value:.3},uRelief:{value:1.35}},le=new e.Mesh(new e.SphereGeometry(2.7,128,64),new e.ShaderMaterial({vertexShader:Wo,fragmentShader:zi,uniforms:Me}));le.position.copy(n),t.add(le);let ce={tMap:Z("mars",!0,N(150,70,40,!0),"mars"),tNorm:Z("marsNorm",!1,N(128,128,255),"mars"),uSun:me(),uSunI:{value:2.2},uRelief:{value:1.25},uDomes:{value:1}};ce.uBump={value:11},ce.uR={value:6};let P=new e.Mesh(new e.SphereGeometry(6*1.015,192,96),new e.ShaderMaterial({vertexShader:Wo,fragmentShader:Pi,uniforms:ce,transparent:!0,blending:e.CustomBlending,blendEquation:e.AddEquation,blendSrc:e.OneFactor,blendDst:e.OneMinusSrcAlphaFactor}));P.position.copy(L),t.add(P),P.renderOrder=1;let H=null;{let w=new e.IcosahedronGeometry(1,4),J=w.attributes.position,_=new e.Vector3,K=(Ue,Xe,zt)=>{let xt=Math.sin(Ue*12.9898+Xe*78.233+zt*37.719)*43758.5453;return xt-Math.floor(xt)};for(let Ue=0;Ue<J.count;Ue++){_.fromBufferAttribute(J,Ue);let Xe=1+.1*Math.sin(_.x*3.1+1)*Math.cos(_.y*2.3)+.06*Math.sin(_.z*5.3+_.x*2);Xe-=.22*Math.exp(-_.distanceToSquared({x:.85,y:.25,z:.46})/.09),Xe-=.05*K(Math.round(_.x*6),Math.round(_.y*6),Math.round(_.z*6)),_.multiplyScalar(Xe),_.x*=1.25,_.z*=.88,J.setXYZ(Ue,_.x,_.y,_.z)}w.computeVertexNormals();let D={uSun:{value:new e.Vector3(1,0,0)},uSunI:ce.uSunI,uA:{value:1}};H=new e.Mesh(w,new e.ShaderMaterial({vertexShader:Li,fragmentShader:ki,uniforms:D,transparent:!0,blending:e.CustomBlending,blendEquation:e.AddEquation,blendSrc:e.OneFactor,blendDst:e.OneMinusSrcAlphaFactor})),H.frustumCulled=!1,H.renderOrder=1,H.matrixAutoUpdate=!1,P.add(H);let h=new e.Vector3(30,10,38).normalize(),$=new e.Vector3(0,1,0).addScaledVector(h,-h.y).normalize(),O=new e.Vector3().crossVectors($,h),Y=$.clone().multiplyScalar(.85).addScaledVector(O,.55).normalize(),ae=new e.Quaternion,fe=new e.Vector3,Ge=new e.Vector3,rt=new e.Euler,Oe=new e.Quaternion;H.alpha=1,H.size=.12,H.orbit=1.75*6,H.phase=null,H.onBeforeRender=(Ue,Xe,zt)=>{let xt=H.phase??.3+.18*Math.sin(Se*.011);Ge.copy(Y).multiplyScalar(Math.cos(xt)).addScaledVector(h,Math.sin(xt)).multiplyScalar(H.orbit).add(P.position),rt.set(.3,Se*.05,.2),ae.setFromEuler(rt),H.matrixWorld.compose(Ge,ae,fe.setScalar(H.size)),Oe.copy(ae).invert(),D.uSun.value.copy(ce.uSun.value).applyQuaternion(P.quaternion).applyQuaternion(Oe);let Nt=zt.position.distanceTo(P.position);D.uA.value=H.alpha*e.MathUtils.smoothstep(Nt,13,20)}}let Se=0,pe=(w,J,_)=>{let K={uCenter:{value:w.clone()},uSun:{value:new e.Vector3().copy(u)},uRp:{value:J},uRa:{value:J*_.top},uBetaR:{value:new e.Vector3(..._.bR).divideScalar(J)},uBetaM:{value:new e.Vector3(..._.bM).divideScalar(J)},uBetaMe:{value:new e.Vector3(..._.bMe).divideScalar(J)},uG:{value:new e.Vector3(..._.g)},uSunCol:{value:new e.Vector3(..._.sun)},uHr:{value:_.Hr*J},uHm:{value:_.Hm*J},uK:{value:_.k}},D=new e.Mesh(new e.SphereGeometry(J*_.top,128,64),new e.ShaderMaterial({vertexShader:Oi,fragmentShader:_.frag||In,uniforms:K,transparent:!0,depthWrite:!1,blending:e.CustomBlending,blendEquation:e.AddEquation,blendSrc:e.OneFactor,blendDst:e.OneMinusSrcAlphaFactor}));return D.position.copy(w),D.renderOrder=2,t.add(D),D},we=pe(a,10,{top:1.1,Hr:.0085,Hm:.0034,bR:[8,19,48],bM:[24,24,24],bMe:[27,27,27],g:[.8,.8,.8],sun:[1,.97,.92],k:15}),Ce=pe(L,6,{top:1.07,Hr:.0075,Hm:.012,bR:[3,7,18],bM:[5,3.4,1.8],bMe:[6,5,4.4],g:[.55,.72,.9],sun:[1,.95,.88],k:12,frag:In.replace("clamp(1. - tr, 0., 1.) * 0.85","clamp(1. - tr, 0., 1.) * 0.25")}),ue=[we,Ce],De=new e.Quaternion,Be=new e.Vector3,_e=(w,J)=>{De.copy(w.quaternion).invert(),J.value.copy(u).applyQuaternion(De)},ee=.012,V=.0158,C=new e.Quaternion,A=new e.Vector3;function b({t:w=0,intro:J=1,camPos:_,spin:K=0,hole:D}={}){if(re.rotation.y=K+w*ee,xe.rotation.y=K+w*V,D&&(xe.updateMatrixWorld(),C.copy(xe.quaternion).invert(),A.copy(D).applyQuaternion(C),We.uHole.value.set(A.x,A.y,A.z,1)),le.rotation.y=w*.01,P.rotation.y=w*.02,Se=w,_e(re,X.uSun),_e(xe,We.uSun),_e(le,Me.uSun),_e(P,ce.uSun),X.uCloudOff.value=(re.rotation.y-xe.rotation.y)/(2*Math.PI),X.uGrow.value=.03+.97*J,_)for(let h of ue){let O=Be.copy(_).sub(h.position).length()<h.material.uniforms.uRa.value*1.002?e.BackSide:e.FrontSide;h.material.side!==O&&(h.material.side=O,h.material.needsUpdate=!0)}}let j=null;return j=Nn({THREE:e}),t.add(j.dome,j.veil),{earth:re,moon:le,mars:P,clouds:xe,earthAtmo:we,marsAtmo:Ce,phobos:H,air:j,entry:j?(w,J)=>j.entry(w,J):void 0,entryRoots:j?j.roots:void 0,ready:Promise.all(T),loadDeferred:Le,update:b}}var Lt=e=>Math.min(1,Math.max(0,e)),mt=(e,t,r)=>e<=t?0:e>=r?1:(e=(e-t)/(r-t),e*e*(3-2*e)),aa=e=>1-Math.pow(1-Lt(e),3),Kt=e=>e*e*e*(e*(e*6-15)+10),gt=(e,t,r)=>e+(t-e)*r;function da(e,t,r,u){let a=e.length,n=[],L=[],x=new Array(a);if(a===2){let S=(t[1]-t[0])/(e[1]-e[0]||1);return B=>B>=e[1]?t[1]:t[0]+S*(B-e[0])}for(let S=0;S<a-1;S++)n[S]=e[S+1]-e[S],L[S]=(t[S+1]-t[S])/n[S];for(let S=1;S<a-1;S++)if(L[S-1]*L[S]<=0)x[S]=0;else{let B=2*n[S]+n[S-1],z=n[S]+2*n[S-1];x[S]=(B+z)/(B/L[S-1]+z/L[S])}let k=(S,B,z,T)=>{let W=((2*S+B)*z-S*T)/(S+B);return Math.sign(W)!==Math.sign(z)?W=0:Math.sign(z)!==Math.sign(T)&&Math.abs(W)>3*Math.abs(z)&&(W=3*z),W};return x[0]=r!==void 0?r*L[0]:k(n[0],n[1],L[0],L[1]),x[a-1]=u!==void 0?u*L[a-2]:k(n[a-2],n[a-3],L[a-2],L[a-3]),S=>{if(S<=e[0])return t[0]+x[0]*(S-e[0]);if(S>=e[a-1])return t[a-1];let B=0;for(;S>e[B+1];)B++;let z=(S-e[B])/n[B],T=z*z,W=T*z;return(2*W-3*T+1)*t[B]+(W-2*T+z)*n[B]*x[B]+(-2*W+3*T)*t[B+1]+(W-T)*n[B]*x[B+1]}}function kr(e,t,r){let u=e.length,a=[],n=[],L=r?r.slice():new Array(u).fill(null);for(let x=0;x<u-1;x++)a[x]=e[x+1]-e[x],n[x]=(t[x+1]-t[x])/a[x];for(let x=0;x<u;x++)if(L[x]==null){if(x===0||x===u-1){L[x]=0;continue}if(n[x-1]*n[x]<=0)L[x]=0;else{let k=2*a[x]+a[x-1],S=a[x]+2*a[x-1];L[x]=(k+S)/(k/n[x-1]+S/n[x])}}return x=>{if(x<=e[0])return t[0];if(x>=e[u-1])return t[u-1];let k=0;for(;x>e[k+1];)k++;let S=(x-e[k])/a[k],B=S*S,z=B*S;return(2*z-3*B+1)*t[k]+(z-2*B+S)*a[k]*L[k]+(-2*z+3*B)*t[k+1]+(z-B)*a[k]*L[k+1]}}function jo(e){return da(e.map(t=>t[0]),e.map(t=>t[1]))}function Or(e,t,r,u){e.arcLengthDivisions=Math.max(e.arcLengthDivisions,4e3),e.needsUpdate=!0;let a=e.getLengths(),n=t.length,L=a[a.length-1],x=S=>{let B=S*(a.length-1),z=Math.floor(B);return z>=a.length-1?L:a[z]+(a[z+1]-a[z])*(B-z)},k=da(t,t.map((S,B)=>x(B/(n-1))),r,u);return S=>e.getUtoTmapping(0,Math.min(L,Math.max(0,k(S))))}function qo(e,t,r,u,a,n){let L=e.shadow.camera,x=e.shadow.mapSize,k=(L.right-L.left)/x.x,S=(L.top-L.bottom)/x.y;a.set(0,1,0).cross(r).normalize(),n.copy(r).cross(a);let B=t.dot(a),z=t.dot(n);e.target.position.copy(t).addScaledVector(a,Math.round(B/k)*k-B).addScaledVector(n,Math.round(z/S)*S-z),e.position.copy(e.target.position).addScaledVector(r,u)}function Tn({THREE:e,SITE_ROT:t,AUS:r,U_PER_M:u,C0:a,L0:n,spaceCam:L}){let l=Math.log(65e4),N=Math.log(a.distanceTo(r)/u),U=l,R=r.clone().normalize(),Z=R.clone().negate(),ie=a.clone().sub(r).normalize(),Le=a.distanceTo(r),me=()=>new e.Vector3,X=new e.Quaternion,re=new e.Quaternion,We=me(),xe=me(),Me=me(),le=me(),ce=me(),P=me(),H=me(),Se=me(),pe={},we=null,Ce=null,ue=null,De=null,Be=(V,C,A,b)=>{for(let j=0;j<60;j++){let te=(A+b)/2;V(te)<C?A=te:b=te}return(A+b)/2};function _e(V){De=V;let{yA:C,yT:A,yX:b,yE:j,S:te}=De,w=.5,J=(-3*te(j)+4*te(j+w)-te(j+2*w))/(2*w);L(-1,We,le),L(te(j+w),xe,le),L(te(j+2*w),Me,le);let _=We.clone().multiplyScalar(-3).addScaledVector(xe,4).addScaledVector(Me,-1).divideScalar(2*w),K=_.dot(ie),D=Math.max(K,1e-6);pe.dSdy=J,pe.v0=_.length(),pe.r0=K,pe.r=D;let h=b+.46*(j-b),$=b+.64*(j-b),O=b+.82*(j-b),Y=D/Le,ae=.4/(j-O);we=da([C,A,b,h,$,O,j],[125,170,290,4e4].map(Math.log).concat(N-1.4,N-.4,N),.7,Y/ae),pe.yH=Be(we,l,C,j),Se.copy(_).addScaledVector(ie,-K),P.copy(Se).multiplyScalar((j-pe.yH)/Le);let fe=Ge=>Be(we,Math.log(Ge),C,j);Ce=da([C,A,b,fe(1600),fe(7e3),fe(4e4)],[7.9,10.2,13.4,17.9,18.95,19.6],void 0,0),ue=da([C,A,b,fe(1600),fe(3e4)],[0,.3,.52,.8,1],void 0,0),Object.assign(pe,{yA:C,yT:A,yX:b,yM:h,yE:j,LAMH:l,LAM1:N,lamA:we(C),yNight:fe(4e4),yG1:fe(3e4)})}function ee(V,C){let{yA:A,yE:b}=De,j=Math.min(Math.max(V,A),b),te=we(j),w=Math.exp(te);if(C.lam=te,C.s=Lt((V-A)/(b-A)),C.fov=38,C.hour=Ce(j),C.g=Math.min(1,ue(j)),j<pe.yH){let D=Kt(Lt((te-pe.lamA)/(U-pe.lamA))),h=e.MathUtils.lerp(-.08+.16*(j-A)/(b-A),t,D),$=e.MathUtils.degToRad(56+34*D);return C.look.set(0,0,-10*(1-D)),C.pos.set(Math.sin(h)*Math.cos($),Math.sin($),Math.cos(h)*Math.cos($)).multiplyScalar(w).add(C.look),C.up.set(-Math.sin(h),0,-Math.cos(h)),C.world="site",C.dist=C.pos.length(),C.upk=D,C}let J=Lt((j-pe.yH)/(b-pe.yH)),_=J*J,K=_*J;return ce.copy(R).multiplyScalar(2*K-3*_+1).addScaledVector(ie,3*_-2*K).addScaledVector(P,K-_).normalize(),C.pos.copy(r).addScaledVector(ce,w*u),H.copy(n).sub(C.pos).normalize(),X.setFromUnitVectors(Z,H),re.identity().slerp(X,Kt(Math.min(1,J*1.1))),C.look.copy(Z).applyQuaternion(re).multiplyScalar(w*u).add(C.pos),C.up.set(0,1,0),C.world="globe",C.dist=w,C.upk=1,C}return{layout:_e,at:ee,k:pe,LAMH:l,LAM1:N}}var Xo=30.250453*Math.PI/180,Fr=-13*Math.PI/180;function Qo(e,t={}){let r=(e-13.1)*15*Math.PI/180,u=Math.sin(Xo)*Math.sin(Fr)+Math.cos(Xo)*Math.cos(Fr)*Math.cos(r),a=Math.asin(u),n=Math.atan2(-Math.sin(r),Math.tan(Fr)*Math.cos(Xo)-Math.sin(Xo)*Math.cos(r));return t.sinE=u,t.el=a,t.az=n,t.x=Math.cos(a)*Math.sin(n),t.y=u,t.z=-Math.cos(a)*Math.cos(n),t}var Fi=.79,Ko=(e,t,r)=>{let u=Math.min(1,Math.max(0,(e-t)/(r-t)));return u*u*(3-2*u)},Yo=Math.log;function Wn(e,t){let r=1+.3*(1-Ko(e,.02,.45)),u=Ko(-e,-.02,.12),a=1-.78*Ko(t,Yo(2e3),Yo(4e4))*u,n=1+.66*Math.exp(-(((e-.0115)/(e>.0115?.016:.0135))**2)),L=1.05*r*a*n;return L+(Fi-L)*Ko(t,Yo(2e6),Yo(9e6))}var qa=e=>{let t=(e%1009+1009)%1009;return(t*t*7+t*31+13)%1009/1009},ya=(e,t,r)=>{let u=Math.min(1,Math.max(0,(e-t)/(r-t)));return u*u*(3-2*u)};var vo=[[86,-420],[86,-30],[74,-24],[40,-25.5],[-20,-25.5],[-44,-25.5],[-50,0],[-44,25.5],[-10,25.5],[40,25.5],[74,30],[86,36],[86,420]],Ka=vo.slice(1).map((e,t)=>{let r=Math.hypot(e[0]-vo[t][0],e[1]-vo[t][1]),u=r>200?12:4.5;return{L:r,T:r/u,v:u}}),jn=Ka.reduce((e,t)=>e+t.T,0),Xa=.5,qn=.6,Xn=2,Kn=12,Bi=.6,Vi=.3,Rt=10,Ui=24,Yn=[.06,.07,.1,.3,.404,.42,.44,.455,.46,.484,.512,.54,.568,.596,.624,.652,.69,.72,.8,.85,.86,.95],Ni=8e-4,Ii=.0025;function Qn(){let e=[0,1].map(()=>({on:!1,x:0,y:0,z:0,ph:0,sw:0})),t=[0,1,2,3].map(()=>({on:!1,x:0,z:0,yaw:0,load:!1,v:0})),r=[0,1].map(()=>({x:0,z:-29})),u={x:0,z:0,v:0},a={ex:e,tr:t,mix:r,dz:{on:!1,x:0,y:0,z:0,yaw:0,v:0},pump:{on:!1,bx:0},digOn:!1,xf:0,bay:0,pouring:!1,craneOn:!1,up:0},n=new Float64Array(Ui*Rt),L=new Float64Array(220),x=0,k=0;function S(ee){let V=ee*jn,C=0;for(;C<Ka.length-1&&V>Ka[C].T;)V-=Ka[C].T,C++;let A=Math.min(1,V/Ka[C].T),b=vo[C],j=vo[C+1];return u.x=b[0]+(j[0]-b[0])*A,u.z=b[1]+(j[1]-b[1])*A,u.v=Ka[C].v,Math.atan2(-(j[1]-b[1]),j[0]-b[0])}let B=(ee,V,C)=>{let A=x++*Rt;n[A]=1,n[A+1]=ee,n[A+2]=V,n[A+8]=n[A+9]=C},z=(ee,V,C,A,b,j,te,w=0)=>{let J=x++*Rt;n[J]=2,n[J+1]=ee,n[J+2]=V,n[J+3]=Math.cos(C),n[J+4]=-Math.sin(C),n[J+5]=A+te+w,n[J+6]=b+te+w,n[J+7]=j+te,n[J+9]=Math.hypot(Math.max(n[J+5],n[J+6]),n[J+7])},T=(ee,V,C,A,b,j,te,w)=>{z(ee,V,C,A,b,j,te),n[(x-1)*Rt+5]+=w,n[(x-1)*Rt+9]=Math.hypot(Math.max(n[(x-1)*Rt+5],n[(x-1)*Rt+6]),n[(x-1)*Rt+7])};function W(ee,V){let C=V>.06&&V<.42,A=-32+ya(V,.07,.36)*76;a.digOn=C,a.xf=A,x=0,z(52,-45,0,9.15,9.15,3.6,Xa),z(62,44,0,3.1,3.1,1.2,Xa);for(let[O,Y]of[[-60,-42],[60,-42],[-60,42],[20,30]])B(O,Y,2.7+Xa);let b=ya(V,.4,.47);a.up=b,a.craneOn=b>.01,a.craneOn&&z(-4,4,0,3,3,3,Xa);let j=Math.min(7,Math.max(0,Math.floor((V-.47)/.028+.5))),te=V>.455&&V<.69;if(a.bay=j,a.pouring=te,a.pump.on=te,te){let O=-32+Math.floor(j/2)*16+8;a.pump.bx=O,z(O,-29,0,6.5,6.4,4.4,Xa);for(let Y=0;Y<2;Y++)r[Y].x=O+12+Y*11,r[Y].z=-29,z(r[Y].x,-29,0,5.05,4.85,1.25,Xa)}for(let O=0;O<2;O++){let Y=e[O],ae=O===1&&V>.8,fe=(ee/7+O*.37)%1;Y.on=C||O===1&&V>.8&&V<.95,Y.ph=fe,Y.sw=ya(fe,.35,.55)*(1-ya(fe,.7,.95)),Y.x=ae?40:Math.min(26,Math.max(-28,A-6)),Y.y=ae?-1:-4*ya(V,.07,.12),Y.z=O?13:-13,Y.on&&B(Y.x,Y.z,Kn)}k=x;for(let O=0;O<4;O++){let Y=t[O],ae=(ee/jn+O/4)%1;Y.on=V>.07&&V<.46,Y.yaw=S(ae),Y.x=u.x,Y.z=u.z,Y.v=u.v,Y.load=ae>.5,Y.on&&T(Y.x,Y.z,Y.yaw,4.95,4.7,1.25,qn,Xn*Y.v+2)}let w=a.dz,J,_,K=0,D=!0,h,$;V<.1?(h=ee/80,J=-60+Math.abs(h%1*2-1)*110,_=-40+Math.floor(h)%4*20,$=2.75):V>.3&&V<.44?(h=ee/40,J=-26+Math.abs(h%1*2-1)*52,_=-12+Math.floor(h)%3*12,K=-4,$=2.6):V>.86?(h=ee/40,J=-60+Math.abs(h%1*2-1)*40,_=40,$=2):(D=!1,h=0,J=_=$=0),w.on=D,w.x=J,w.y=K,w.z=_,w.v=$,w.yaw=h%1<.5?0:Math.PI,D&&z(J,_,w.yaw,3,3,1.7,qn,Xn*$+2)}function l(ee,V,C){let A=ee*Rt,b=V-n[A+1],j=C-n[A+2];if(n[A]===1)return Math.hypot(b,j)-n[A+8];let te=n[A+3],w=n[A+4],J=b*te+j*w,_=j*te-b*w,K=Math.max(-n[A+6]-J,J-n[A+5]),D=Math.abs(_)-n[A+7];return Math.hypot(Math.max(K,0),Math.max(D,0))+Math.min(Math.max(K,D),0)}let N=(ee,V,C,A)=>{let b=ee*Rt,j=n[b+9]+A;return Math.abs(V-n[b+1])<j&&Math.abs(C-n[b+2])<j},U=0,R=0;function Z(ee,V){let C=ee*Rt,A=U-n[C+1],b=R-n[C+2];if(n[C]===1){let O=Math.hypot(A,b),Y=O>1e-6?(n[C+8]+V)/O:0;U=n[C+1]+(O>1e-6?A*Y:n[C+8]+V),R=n[C+2]+b*Y;return}let j=n[C+3],te=n[C+4],w=n[C+5],J=n[C+6],_=n[C+7],K=A*j+b*te,D=b*j-A*te,h,$;if(K<-J||K>w||Math.abs(D)>_){let O=Math.min(w,Math.max(-J,K)),Y=Math.min(_,Math.max(-_,D)),ae=Math.hypot(K-O,D-Y)||1;h=O+(K-O)/ae*V,$=Y+(D-Y)/ae*V}else{let O=w-K,Y=K+J,ae=_-D,fe=D+_,Ge=Math.min(O,Y,ae,fe);h=K,$=D,Ge===O?h=w+V:Ge===Y?h=-J-V:Ge===ae?$=_+V:$=-_-V}U=n[C+1]+h*j-$*te,R=n[C+2]+h*te+$*j}function ie(ee){for(let V=0;V<4;V++){let C=!1;for(let A=0;A<k;A++)N(A,U,R,ee)&&l(A,U,R)<ee&&(Z(A,ee),C=!0);if(!C)break}}function Le(ee){for(let V=0;V<6;V++){let C=!1;for(let A=0;A<x;A++)N(A,U,R,ee)&&l(A,U,R)<ee&&(Z(A,ee),C=!0);if(!C)break}}let me=new Float64Array(5),X=new Float64Array(5),re=46,We=-33.25;function xe(ee,V,C,A){let b=qa(ee*31+V*7),j=qa(ee*17+V*3+5),te,w,J=0,_=qa(ee*29+V*11)*6.2832;if(ee<26&&C>.44&&C<.72){let K=Math.min(7,a.bay+(ee%3===0?1:0));te=-32+Math.floor(K/2)*16+2+b*12,w=(K%2?2:-17)+j*15,J=-4}else if(ee<26&&C>=.72){let K=((ee*7+V)%78+78)%78;K>39&&(K=78-K);let D=Math.floor(K/5),h=D%2?4-K%5:K%5;te=-28+D*8+(b-.5)*3,w=-16+h*8+(j-.5)*3,J=-4+(C>.85&&te<0?3.75:0)}else if(ee<34&&a.digOn){let K=e[ee%2?0:1],D=(b-.5)*1.222,h=Kn+1.5+j*2;te=K.x+Math.cos(D)*h,w=K.z+Math.sin(D)*h,_=Math.atan2(-(K.z-w),K.x-te)}else te=re+(qa(ee*5+9)-.5)*13+(b-.5)*12+6.5,w=We+(j-.5)*6.5;U=te,R=w,ie(Bi),A[0]=U,A[1]=J,A[2]=R,A[3]=_}let Me=ee=>ee-Math.round(ee/6.2832)*6.2832;function le(ee){let V=1;for(let C=0;C<Yn.length;C++)V=Math.min(V,ya(Math.abs(ee-Yn[C]),Ni,Ii));return V}let ce=new Float64Array(12),P=new Float64Array(12),H=new Float64Array(12),Se=new Float64Array(8),pe=new Float64Array(8),we=new Uint8Array(8),Ce=new Uint8Array(8),ue=2;function De(ee,V,C,A,b,j){let te=ee*Rt,w=n[te+9]+j,J=n[te+1],_=n[te+2];if(Math.max(V,A)<J-w||Math.min(V,A)>J+w||Math.max(C,b)<_-w||Math.min(C,b)>_+w)return!1;let K=Math.min(160,Math.ceil(Math.hypot(A-V,b-C)*4));for(let D=0;D<=K;D++)if(l(ee,V+(A-V)*D/K,C+(b-C)*D/K)<j)return!0;return!1}function Be(ee,V,C,A){ue=2,ce[0]=ee,P[0]=V,ce[1]=C,P[1]=A;for(let b=0;b<k;b++){if(!De(b,ee,V,C,A,.45))continue;let j=b*Rt,te=n[j+1],w=n[j+2],J=((n[j]===1?n[j+8]:Math.hypot(Math.max(n[j+5],n[j+6]),n[j+7]))+1)/.9239,_=2*J*.3827;for(let ae=0;ae<8;ae++){let fe=ae*.7854+.3927;Se[ae]=te+Math.cos(fe)*J,pe[ae]=w+Math.sin(fe)*J,we[ae]=De(b,ee,V,Se[ae],pe[ae],.45)?0:1,Ce[ae]=De(b,Se[ae],pe[ae],C,A,.45)?0:1}let K=1e9,D=-1,h=0,$=1;for(let ae=0;ae<8;ae++)if(we[ae]){for(let fe=0;fe<8;fe++)if(Ce[fe])for(let Ge=-1;Ge<=1;Ge+=2){let rt=Ge>0?(fe-ae+8)%8:(ae-fe+8)%8,Oe=Math.hypot(Se[ae]-ee,pe[ae]-V)+rt*_+Math.hypot(C-Se[fe],A-pe[fe]);Oe<K&&(K=Oe,D=ae,h=fe,$=Ge)}}if(D<0)return;let O=1,Y=D;for(ce[0]=ee,P[0]=V;ce[O]=Se[Y],P[O]=pe[Y],O++,Y!==h;)Y=(Y+$+8)%8;ce[O]=C,P[O]=A,ue=O+1;return}}function _e(ee,V){let C=le(V);for(let A=0;A<44;A++){let b=6+6*qa(A*13+3),j=qa(A*7+1),te=Math.floor(ee/b+j),w=(ee/b+j-te)*b;xe(A,te-1,V,me),xe(A,te,V,X),Be(me[0],me[2],X[0],X[2]),H[0]=0;for(let Ue=1;Ue<ue;Ue++)H[Ue]=H[Ue-1]+Math.hypot(ce[Ue]-ce[Ue-1],P[Ue]-P[Ue-1]);let J=X[1]-me[1],_=Math.hypot(H[ue-1],J),K=Math.min(5,Math.max(1.3,_/(.7*b))),D=_>.02?Math.min(_/K,.95*b):0,h=D>0?Math.min(1,w/D):1,$=h*H[ue-1],O=1;for(;O<ue-1&&H[O]<$;)O++;let Y=H[O]-H[O-1],ae=Y>1e-9?($-H[O-1])/Y:1,fe=ce[O]-ce[O-1],Ge=P[O]-P[O-1],rt=D>0?Math.atan2(-Ge,fe):X[3];D>0&&w<.5&&(rt+=Me(me[3]-rt)*(1-ya(w,0,.5))),w>D&&(rt+=Me(X[3]-rt)*ya(w-D,0,.8)),U=ce[O-1]+fe*ae,R=P[O-1]+Ge*ae,Le(Vi);let Oe=A*5;L[Oe]=U,L[Oe+1]=me[1]+J*h,L[Oe+2]=R,L[Oe+3]=rt,L[Oe+4]=C}}return{M:a,Z:n,crew:L,machines:W,crewStep:_e,zsd:l,get nZ(){return x},get nS(){return k}}}var go={lat:30.250453,lon:-97.719913},Jo=17*Math.PI/180,po=400,Ya=180,wa=140,Zo=164/11,ma=4;var Zn=`
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
`,Ti=e=>`
vec2 toGeo(vec2 p){ return vec2(p.x*uRot.x-p.y*uRot.y, p.x*uRot.y+p.y*uRot.x); }
float orthoW(vec2 g){ vec2 a=abs(g); return uOrthoOn*(1.-smoothstep(${po-90}.,${po-4}.,max(a.x,a.y))); }
vec3 ortho(vec2 g){ vec3 c=texture2D(tOrtho,vec2(g.x/${2*po}.+.5,.5-g.y/${2*po}.)).rgb;
  vec3 l=texture2D(tOrthoL,vec2(g.x/${2*e}.+.5,.5-g.y/${2*e}.)).rgb; vec2 a=abs(g);
  return mix(c,l,uOrthoLOn*(1.-smoothstep(${(e*.85).toFixed(1)},${e-2}.,max(a.x,a.y)))); }
// round feathers, never square: each photo hands over to the next one out well inside its own edge
float circW(vec2 g, float hf){ return 1.-smoothstep(.55*hf,.95*hf,length(g)); }
vec4 photoLayers(vec2 g){
  float wc=uOrthoCOn*circW(g,40000.), wb=uOrthoBOn*circW(g,4000.), wa=uOrthoOn*circW(g,${po}.);
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
}`,Jn=e=>`{
  vec2 bp=vLoc.xz; float bw=max(length(fwidth(bp)),1e-3), fade=1.-smoothstep(.15,.9,bw);   // only where it can resolve
  if(fade>0.){
    float e=.18; vec2 ex=vec2(e,0.), ez=vec2(0.,e);
    #define BH(q) (dot(ortho(toGeo(q)),vec3(.3,.5,.2))*.9*uOrthoOn+fb((q)*1.6)*.1+vn((q)*6.)*.025)
    float gx=(BH(bp+ex)-BH(bp-ex))/(2.*e), gz=(BH(bp+ez)-BH(bp-ez))/(2.*e);
    #undef BH
    normal=normalize(normal+(viewMatrix*vec4(-gx,0.,-gz,0.)).xyz*${e}*fade);
  } }`;function Rn({THREE:e,scene:t,renderer:r,sunLight:u,hemi:a,ORIGIN:n,earthU:L,ortho:x={}}){let k=x.lotHalf||200,S=Ti(k),B=new e.Group;B.position.copy(n),B.visible=!1,t.add(B);let z={uG:{value:0},uNight:{value:0},uT:{value:0},uWork:{value:0},uSunL:{value:new e.Vector3(0,1,0)},uOrigin:{value:n.clone()},tMap:L.tMap,tLights:L.tLights,uLL:{value:new e.Vector2(go.lat,go.lon)},uDig:{value:0},uPile:{value:0},uBack:{value:0},uClear:{value:0},uProg:{value:0},tOrtho:{value:null},uOrthoOn:{value:0},tOrthoL:{value:null},uOrthoLOn:{value:0},tOrthoB:{value:null},uOrthoBOn:{value:0},tOrthoC:{value:null},uOrthoCOn:{value:0},uRot:{value:new e.Vector2(Math.cos(Jo),Math.sin(Jo))}};{let v=new e.DataTexture(new Uint8Array([90,80,66,255]),1,1);v.needsUpdate=!0,z.tOrtho.value=v,z.tOrthoL.value=v}{let v=new e.DataTexture(new Uint8Array([70,72,60,255]),1,1);v.needsUpdate=!0,z.tOrthoB.value=v,z.tOrthoC.value=v}let T={},W=500,l=(v,m,c,M=!1)=>v?xa(e,v,{flipY:!0,colorSpace:e.SRGBColorSpace}).then(f=>{if(f.anisotropy=8,f.needsUpdate=!0,r&&r.initTexture)try{r.initTexture(f)}catch{}return z[m].value=f,M?T[c]=performance.now():z[c].value=1,!0},()=>!1):Promise.resolve(!1),N=Promise.all([l(x.lot,"tOrthoL","uOrthoLOn"),l(x.site,"tOrtho","uOrthoOn")]),U=Promise.all([N,l(x.km8,"tOrthoB","uOrthoBOn",!0),l(x.km80,"tOrthoC","uOrthoCOn",!0)]),R=0,Z=(v,m,c,M,f,F,E,I,Q)=>{let ye="tfsite"+R++;return v.customProgramCacheKey=()=>ye,v.onBeforeCompile=Qe=>{Object.assign(Qe.uniforms,z),Qe.vertexShader=`uniform vec3 uOrigin; uniform float uDig,uPile,uBack; varying vec3 vLoc;
`+Zn+m+`
`+Qe.vertexShader,I&&(Qe.vertexShader=Qe.vertexShader.replace("#include <beginnormal_vertex>",I)),Qe.vertexShader=Qe.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
`+c+`
vLoc=(modelMatrix*vec4(transformed,1.)).xyz-uOrigin;`),Qe.fragmentShader=`uniform float uG,uNight,uT,uWork,uClear,uProg,uOrthoOn,uOrthoLOn,uOrthoBOn,uOrthoCOn; uniform vec3 uSunL; uniform sampler2D tMap,tLights,tOrtho,tOrthoL,tOrthoB,tOrthoC; uniform vec2 uLL,uRot; varying vec3 vLoc;
`+Zn+S+M+`
`+Qe.fragmentShader.replace("#include <color_fragment>",`#include <color_fragment>
`+f).replace("#include <roughnessmap_fragment>",`#include <roughnessmap_fragment>
`+F).replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>
`+E).replace("#include <normal_fragment_maps>",`#include <normal_fragment_maps>
`+(Q||""))},v},ie=`
  vec3 SOD=vec3(1.,.58,.24);
  vec2 llUv(vec2 p){ float lat=uLL.x-p.y/110574., lon=uLL.y+p.x/(111320.*cos(radians(uLL.x))); return vec2((lon+180.)/360.,(lat+90.)/180.); }
  // one house slot: returns roof coverage and fills colour/height; painted only outside the 3D ring
  float house(vec2 lc, float ci, float cj, float row, out vec3 roof, out float ht, out vec2 porch, out float pool, out vec2 poolC, float w){
    float s=floor((lc.x+82.)/${Zo.toFixed(6)}); roof=vec3(0.); ht=0.; pool=0.; porch=vec2(1e5); poolC=vec2(1e5);
    if(s<0.||s>10.) return 0.;
    float n=ci*157.+cj*311.+row*71.+s*13.+500.;
    if(Hh(n)>0.92) return 0.;
    float cx=-82.+(s+.5)*${Zo.toFixed(6)}, front=row<.5? -70.+hwZ(cj-1.) : 70.-hwZ(cj), dir=row<.5?1.:-1.;
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
    vec2 uS=p/vec2(${Ya}.,${wa}.), dS=abs(fract(uS)-.5)*vec2(${Ya}.,${wa}.);
    float hS=3., sgS=max(hS,sg0), sa=max(1.5,sg0);
    float gX=h21(vec2(floor(uS.x),floor(uS.y+.5))+.37), gZ=h21(vec2(floor(uS.x+.5),floor(uS.y))+5.71);
    float segX=step(.18,gX)*(.4+1.2*fract(gX*13.1)), segZ=step(.18,gZ)*(.4+1.2*fract(gZ*13.1));
    float ddX=mod(p.y,36.)-18., ddZ=mod(p.x,36.)-18., fa=smoothstep(4.,9.,sa), dn=36.*1.5/(1.7725*sa);
    float dotX=mix(exp(-ddX*ddX/(sa*sa))*dn,1.,fa), dotZ=mix(exp(-ddZ*ddZ/(sa*sa))*dn,1.,fa);
    float Lst=(exp(-dS.x*dS.x/(sgS*sgS))*segX*dotX+exp(-dS.y*dS.y/(sgS*sgS))*segZ*dotZ)*hS/sgS;
    float mSt=1.7725*hS*(1./${Ya}.+1./${wa}.)*.82;
    float fS=smoothstep(.05*${wa}.,.13*${wa}.,sgS), aS=.14*(1.-.92*fS); S+=aS*mix(Lst/mSt,1.,fS); W+=aS;
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
    float ci=floor(p.x/${Ya}.+.5), cj=floor(p.y/${wa}.+.5);
    vec2 lc=p-vec2(ci*${Ya}.,cj*${wa}.);
    float kx=lc.x>0.?ci:ci-1., kz=lc.y>0.?cj:cj-1.;
    float dX=${Ya/2}.-abs(lc.x), dZ=${wa/2}.-abs(lc.y);          // distance to the street centrelines
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
        float s=floor((lc.x+82.)/${Zo.toFixed(6)}), cxs=-82.+(s+.5)*${Zo.toFixed(6)};
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
      // traffic: long-exposure trails at night, moving cars by day
      float lane=cl-1.9-(art>.5?1.8:0.);
      float trail=cov(abs(fract(cl/3.6)-.5)*3.6-.35,w)*road*step(cl,hx-2.2);
      float flow=smoothstep(.3,.8,vn(vec2(along*.02-uT*3.*sign(lc.x+lc.y),cl)))*(art>.5?1.:.15)*min(1.,.6/w);
      L+=mix(vec3(1.,.15,.06),vec3(1.,.95,.8),step(0.,dX<dZ?lc.x:lc.y))*trail*flow*1.4;
      // day traffic: a fixed pattern of cars sliding along each lane at street speed (one direction per side), on the film clock
      float aS=along-uT*(art>.5?13.:8.)*sign(dX<dZ?lc.x:lc.y), slot=floor(aS/9.), ln=floor(cl/3.6);
      float car=step(art>.5?.55:.88,h21(vec2(slot,ln)))*cov(sdBox(vec2(mod(aS,9.)-4.5,fract(cl/3.6)*3.6-1.8),vec2(0.),vec2(2.2,.9)),w)*road*step(cl,hx-2.5);
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
  }`,Le=Z(new e.MeshStandardMaterial({roughness:1,metalness:0,polygonOffset:!0,polygonOffsetFactor:2,polygonOffsetUnits:2}),"","",ie+`
vec3 gA; float gR; vec3 gE;`,`if(abs(vLoc.x)<74.8&&abs(vLoc.z)<54.8) discard; // the lot mesh owns this patch (the pit goes below the ground plane)
  float gw=max(length(fwidth(vLoc.xz)),1e-3); groundShade(vLoc.xz,gw,gA,gR,gE);
  { vec2 gq=toGeo(vLoc.xz); vec4 ph=photoLayers(gq); if(ph.a>0.){ gA=mix(gA,ph.rgb,ph.a); gR=mix(gR,.95,ph.a); }
    float ow=uOrthoOn*circW(gq,400.); if(ow>0.) gE=mix(gE,orthoNight(gq,gw)*uNight,ow*(1.-smoothstep(1.,3.,gw))); }
  diffuseColor.rgb=gA;`,"roughnessFactor=gR;","totalEmissiveRadiance+=gE;",null,Jn(.35)),me=new e.Mesh(new e.PlaneGeometry(1,1).rotateX(-Math.PI/2),Le);me.position.y=-.06,me.receiveShadow=!0,me.frustumCulled=!1,B.add(me);let X=`
  float pitH(vec2 p){
    vec2 q=abs(p)-vec2(32.,20.); float dr=max(q.x,q.y);
    float m=1.-smoothstep(-3.,0.,dr);
    float xf=-32.+uDig*76.;                             // the dig face sweeps west to east
    float f=smoothstep(xf,xf-7.,p.x);
    float h=-${ma}.*m*f;
    // haul ramp up the east side
    float rx=clamp((p.x-30.)/22.,0.,1.), rm=(1.-smoothstep(4.5,7.,abs(p.y)))*step(29.,p.x)*step(p.x,52.);
    h=min(h,-${ma}.*(1.-rx)*rm*smoothstep(.55,.9,uDig)*(1.-uBack));
    // ground topography outside the dig: gentle swales, a few windrows from grading, all easing to 0 at the lot edge
    float edge=(1.-smoothstep(62.,74.,abs(p.x)))*(1.-smoothstep(42.,54.,abs(p.y)));
    float topo=(fb(p*.022+3.)-.47)*1.6+(vn(p*.11)-.5)*.35+smoothstep(.55,1.,sin(p.y*.42+fb(p*.05)*4.))*.22;
    h+=topo*edge*(1.-m*f);
    // spoil pile
    float r=length((p-vec2(-52.,-38.))*vec2(1.,1.3));
    h+=uPile*7.*exp(-r*r/160.)*(.8+.4*vn(p*.15));
    return h;
  }`,re=Z(new e.MeshStandardMaterial({roughness:1,metalness:0}),X,"transformed.y+=pitH(position.xz);",`
    float bayOf(vec2 p){ return floor((p.x+32.)/16.)*2.+(p.y<0.?0.:1.); }
    float pourT(float b){ return .47+b*.028; }
    vec3 lA; float lR; vec3 lE;`,`
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
    if(abs(p.x)<31.&&abs(p.y)<19.&&y<-${ma-.4}){
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
    diffuseColor.rgb=lA;`,"roughnessFactor=lR;","totalEmissiveRadiance+=lE;",`vec3 objectNormal; { float e=.6; vec2 p=position.xz;
      objectNormal=normalize(vec3(-(pitH(p+vec2(e,0.))-pitH(p-vec2(e,0.)))/(2.*e),1.,-(pitH(p+vec2(0.,e))-pitH(p-vec2(0.,e)))/(2.*e))); }
    #ifdef USE_TANGENT
      vec3 objectTangent = vec3( tangent.xyz );
    #endif`,Jn(.9)),We=new e.Mesh(new e.PlaneGeometry(150,110,150,110).rotateX(-Math.PI/2),re);We.receiveShadow=!0,B.add(We);let xe=(v,m=.7,c=0,M)=>new e.MeshStandardMaterial({color:v,roughness:m,metalness:c,...M?{emissive:M}:{}}),Me={yel:xe(15774218,.5,.1),dark:xe(1842204,.85),glass:xe(1450540,.15,.4),white:xe(15328991,.55),conc:xe(12038824,.9),grey:xe(8223607,.6,.3),orange:xe(15229980,.5),blue:xe(2775720,.6),ply:xe(12613434,.8),rust:xe(8010524,.9),green:xe(2242602,.9),lamp:new e.MeshBasicMaterial({color:16777215}),drum:xe(14210252,.4,.3)},le=(v,m,c,M,f=0,F=0,E=0,I)=>{let Q=new e.Mesh(new e.BoxGeometry(v,m,c),M);return Q.position.set(f,F,E),Q.castShadow=Q.receiveShadow=!0,(I||B).add(Q),Q},ce=(v,m,c,M,f,F,E,I="z")=>{let Q=new e.CylinderGeometry(v,v,m,14);I==="z"?Q.rotateX(Math.PI/2):I==="x"&&Q.rotateZ(Math.PI/2);let ye=new e.Mesh(Q,c);return ye.position.set(M,f,F),ye.castShadow=!0,E.add(ye),ye},P=new e.Matrix4,H=new e.Quaternion,Se=new e.Vector3,pe=new e.Vector3,we=new e.Vector3(0,1,0),Ce=new e.Vector3(1e-4,1e-4,1e-4),ue=(v,m,c)=>{let M=Math.min(1,Math.max(0,(v-m)/(c-m)));return M*M*(3-2*M)},De=[],Be=new e.InstancedMesh(new e.IcosahedronGeometry(1,1),xe(2044692,.95),De.length);Be.castShadow=Be.receiveShadow=!0,B.add(Be);{let v=[];for(let c=-75;c<75;c+=3)v.push([c+1.5,-55,0],[c+1.5,55,0]);for(let c=-55;c<55;c+=3)v.push([-75,c+1.5,1]),c>-32&&c<-6||c>18&&c<42||v.push([75,c+1.5,1]);let m=new e.InstancedMesh(new e.BoxGeometry(3,1.8,.08).translate(0,.9,0),Me.green,v.length);v.forEach(([c,M,f],F)=>{P.compose(Se.set(c,0,M),H.setFromAxisAngle(we,f?Math.PI/2:0),pe.set(1,1,1)),m.setMatrixAt(F,P)}),m.castShadow=!0,B.add(m)}let _e=[new e.PointLight(16773336,0,90,1.6),new e.PointLight(16773336,0,90,1.6)];_e[0].position.set(-30,14,-10),_e[1].position.set(30,14,10),_e.forEach(v=>B.add(v));let{exA:ee,exB:V,trucks:C,dozer:A,pump:b,mixers:j,crane:te,crew:w,towers:J,roofs:_}=gn({THREE:e,group:B,D:ma}),K=Qn(),D=K.M,h=[];for(let v=-28;v<=28;v+=8)for(let m=-16;m<=16;m+=8)h.push([v,m]);let $=new e.InstancedMesh(new e.BoxGeometry(.75,1,.75).translate(0,.5,0),Me.conc,h.length);$.castShadow=$.receiveShadow=!0,B.add($);let O=[[-12,-4,8,6],[14,5,6,6]].map(([v,m,c,M])=>{let f=le(c,1,M,Me.conc,v,-ma,m);return f.geometry.translate(0,.5,0),f}),Y=[];for(let v=-28;v<28;v+=8)for(let m=-18;m<18;m+=9)Y.push([v+4,m+4.5]);let ae=new e.InstancedMesh(new e.BoxGeometry(7.8,.35,8.8),Me.ply,Y.length);ae.castShadow=ae.receiveShadow=!0,B.add(ae);let fe={},Ge=new e.Vector3,rt=new e.Color,Oe=new e.Color,Ue=J[0].material.color.clone(),Xe=e.MathUtils.degToRad(.1),zt=e.MathUtils.degToRad(2.5),xt=.45,Nt=.09,Bt=new e.Vector3,jt=new e.Vector3(1,0,0),wt=(v,m,c)=>{Bt.subVectors(c,m);let M=Bt.length();v.position.copy(m).add(c).multiplyScalar(.5),v.scale.set(M,1,1),v.quaternion.setFromUnitVectors(jt,Bt.normalize())},ct=new e.Vector3,Ot=new e.Vector3,Mt=new e.Vector3,de=new e.Vector3,Ne=new e.Vector3,et=new e.Vector3(0,1,0),Ze=v=>qo(u,n,v,400,de,Ne);function He({g:v,t:m,hour:c}){for(let ve in T){let tt=Math.min(1,(performance.now()-T[ve])/W);z[ve].value=tt*tt*(3-2*tt),tt>=1&&delete T[ve]}let M=v,{sinE:f,el:F,az:E}=Qo(c,fe),I=Math.round(.5*(F+zt+Math.sqrt((F-zt)**2+4e-4))/Xe)*Xe,Q=Math.round(E/Xe)*Xe;Ge.set(Math.cos(I)*Math.sin(Q),Math.sin(I),-Math.cos(I)*Math.cos(Q));let ye=ue(f,-.1,.12),Qe=1-ye,Ve=1-ue(f,.05,.5);z.uSunL.value.copy(Ge),z.uNight.value=ue(-f,-.02,.12),z.uT.value=m,z.uG.value=v,z.uProg.value=M,z.uWork.value=z.uNight.value*ue(M,.03,.06),u.color.setRGB(1,.93-Ve*.25,.85-Ve*.45),u.intensity=3.2*ue(f,-.02,.1),Ze(Ge),a.color.copy(rt.setRGB(.42,.58,1).lerp(Oe.setRGB(.06,.07,.12),Qe)),a.groundColor.setRGB(.42*ye+.02,.34*ye+.02,.24*ye+.03),a.intensity=.6+.95*ye;let ze=z.uWork.value;_e.forEach(ve=>ve.intensity=140*ze),J[0].material.color.copy(Ue).multiplyScalar(ze),J.forEach(ve=>ve.visible=ze>.002),z.uClear.value=ue(M,0,.07),z.uDig.value=ue(M,.07,.36),z.uPile.value=ue(M,.08,.24)*(1-ue(M,.3,.46))*.9+.1*ue(M,.3,.46),z.uBack.value=ue(M,.8,.93),De.forEach(([ve,tt,Je],it)=>{let vt=1-ue(M,.005+it*.004,.02+it*.004);P.compose(Se.set(ve,Je*.55+1.6,tt),H.setFromAxisAngle(we,it),vt>.01?pe.set(Je*vt,Je*.55*vt,Je*vt):Ce),Be.setMatrixAt(it,P)}),Be.instanceMatrix.needsUpdate=!0,K.machines(m,M),[[ee,-1],[V,1]].forEach(([ve,tt],Je)=>{let it=D.ex[Je],vt=it.ph,p=it.sw;ve.g.visible=it.on,ve.up.rotation.y=p*tt*1.9,ve.boom.rotation.z=e.MathUtils.lerp(.35-ue(vt,0,.3)*.55,.62,p),ve.stick.rotation.z=-e.MathUtils.lerp(1.05+ue(vt,.05,.33)*.9,.9-ue(vt,.55,.68)*.5,p),ve.g.position.set(it.x,it.y,it.z),ve.g.rotation.y=0}),C.forEach((ve,tt)=>{let Je=D.tr[tt];ve.g.visible=Je.on,ve.g.position.set(Je.x,0,Je.z),ve.g.rotation.y=Je.yaw,ve.load.visible=Je.load});{let ve=D.dz;A.visible=ve.on,ve.on&&(A.position.set(ve.x,ve.y,ve.z),A.rotation.y=ve.yaw)}let he=D.bay,ke=D.pouring;if(b.g.visible=ke,j.forEach(ve=>ve.g.visible=ke),ke){let ve=D.pump.bx,tt=he%2?9.5:-9.5;b.g.position.set(ve,0,-29),ct.set(ve,3.2,-29),Mt.set(ve+Math.sin(m*xt)*3,-ma+3.5,tt+Math.cos(m*xt*.8)*2),Ot.copy(ct).lerp(Mt,.45),Ot.y=16,wt(b.s1,ct,Ot),wt(b.s2,Ot,Mt),wt(b.hose,Mt,Se.copy(Mt).setY(-ma+.2)),[b.s1,b.s2,b.hose].forEach(Je=>Je.visible=!0),j.forEach((Je,it)=>{Je.g.position.set(ve+12+it*11,0,-29),Je.d.rotation.x=m*3+it})}else[b.s1,b.s2,b.hose].forEach(ve=>ve.visible=!1);{let ve=ue(M,.4,.47),tt=40*ve+.01;te.g.visible=ve>.01,te.mast.scale.y=tt,te.top.position.y=tt,te.top.visible=ve>.95;let Je=m*Nt;te.top.rotation.y=Math.sin(Je)*1.6+Math.sin(Je*2.3)*.7;let it=12+(Math.sin(m*.13)*.5+.5)*36,vt=10+(Math.sin(m*.21)*.5+.5)*22;te.trolley.position.x=it,te.line.scale.y=vt,te.line.position.y=-.8-vt/2,te.hook.position.y=-1.2-vt}h.forEach(([ve,tt],Je)=>{let it=Math.floor((ve+32)/16)*2+(tt<0?0:1),vt=ue(M,.47+it*.028+.07,.47+it*.028+.12);P.compose(Se.set(ve,-ma,tt),H.identity(),vt>.01?pe.set(1,3.6*vt,1):Ce),$.setMatrixAt(Je,P)}),$.instanceMatrix.needsUpdate=!0,O.forEach((ve,tt)=>{let Je=ue(M,.56+tt*.03,.98);ve.visible=Je>.01,ve.scale.y=Math.max(.01,13*Je)}),Y.forEach(([ve,tt],Je)=>{let it=ue(M,.8+(ve+28)/56*.15+Je%4*.01,.84+(ve+28)/56*.15+Je%4*.01);P.compose(Se.set(ve,-.25,tt),H.identity(),it>.5?pe.set(1,1,1):Ce),ae.setMatrixAt(Je,P)}),ae.instanceMatrix.needsUpdate=!0,K.crewStep(m,M);let Re=K.crew;for(let ve=0;ve<44;ve++){let tt=ve*5,Je=Re[tt+4];P.compose(Se.set(Re[tt],Re[tt+1],Re[tt+2]),H.setFromAxisAngle(we,Re[tt+3]),Je>.01?pe.set(Je,Je,Je):Ce),w.setMatrixAt(ve,P)}return w.instanceMatrix.needsUpdate=!0,{hour:c,prog:M,sinE:f,sunL:Ge,night:z.uNight.value}}function Ee(v,m){let c=Math.max(4e3,m*12);me.scale.set(c,1,c),me.position.x=v.x,me.position.z=v.z}let s=.05;async function d({next:v=()=>Promise.resolve(),alive:m=()=>!0}={}){let c=await vn();if(!m())return null;let M=xn(e,pn(c,s)),f=0,F=0;try{for(let E of _){if(await v(),!m())return null;f+=bn(E,M),F++}}finally{for(let E in M)M[E].dispose()}return{machines:F,tris:f}}return{group:B,update:He,follow:Ee,uniforms:z,D:ma,ready:N,readyAll:U,addShrouds:d}}var Br=Math.log,Ro=(e,t,r)=>{let u=Math.min(1,Math.max(0,(e-t)/(r-t)));return u*u*(3-2*u)},_o=17*Math.PI/180,Wi=(e,t,r)=>r.set(e*Math.cos(_o)+t*Math.sin(_o),0,-e*Math.sin(_o)+t*Math.cos(_o)),_n=[{D:3900,nx:-.34,ny:.3,r:260,turn:240,v:3200,span:36,drift:50,T:7.5},{D:6800,nx:.34,ny:0,r:420,turn:-70,v:3200,span:60,drift:50,T:8.5},{D:5e3,nx:.5,ny:.55,alt:1600,hdg:172,v:1800,span:36,land:!0,drift:300,T:14},{D:7e3,nx:.75,ny:.8,alt:2300,hdg:175,v:1800,span:34,land:!0,drift:300,T:16},{D:4500,nx:-.6,ny:-.5,alt:2e3,hdg:352,v:2e3,span:36,drift:300,T:15,hi:!0},{D:14e3,nx:-.5,ny:.4,alt:9500,hdg:62,v:3e3,span:60,drift:300,T:13,hi:!0},{D:18e3,nx:.45,ny:-.3,alt:11300,hdg:258,v:3200,span:64,drift:300,T:12,hi:!0},{D:11e3,nx:-.2,ny:.6,alt:7200,hdg:128,v:2600,span:36,drift:300,T:15,hi:!0}],Hn=[[-.5,0,-.12,0],[.5,0,-.12,1],[0,.03,-.52,2],[-.5,0,-.135,3],[.5,0,-.135,3],[0,.07,.02,4],[0,-.06,.06,4]],ji=[[-.11,-.04,.14,5],[.11,-.04,.14,5]],qi=`
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
}`,Xi=`float ss2(float x,float a,float b){ return clamp((x-a)/max(b-a,1e-4),0.,1.); }
`,Ki=`
varying vec3 vCol; varying float vK;
void main(){
  vec2 q=gl_PointCoord*2.-1.; float d2=dot(q,q); if(d2>1.) discard;
  float g=mix(exp(-d2*2.5)*(1.-d2),exp(-d2*40.)+.12*exp(-d2*6.)*(1.-d2),vK); // a soft dot when it is a point; hot core + halo up close
  gl_FragColor=vec4(vCol*g,1.);
}`;function En({THREE:e,parent:t,high:r=!0}){let u=r?_n:_n.filter(le=>!le.hi),a=u.length,n=[],L=[],x=[];u.forEach((le,ce)=>{for(let[P,H,Se,pe]of le.land?Hn.concat(ji):Hn)n.push(ce),L.push(pe),x.push(P*le.span,H*le.span,Se*le.span)});let k=new e.BufferGeometry;k.setAttribute("position",new e.BufferAttribute(new Float32Array(n.length*3),3)),k.setAttribute("aId",new e.BufferAttribute(new Float32Array(n),1)),k.setAttribute("aKind",new e.BufferAttribute(new Float32Array(L),1)),k.setAttribute("aOff",new e.BufferAttribute(new Float32Array(x),3));let S=()=>new e.Vector3,B={uC:{value:Array.from({length:8},S)},uF:{value:Array.from({length:8},()=>new e.Vector3(0,0,-1))},uA:{value:new Array(8).fill(0)},uPh:{value:u.map((le,ce)=>ce*.618034%1).concat(new Array(8-a).fill(0))},uT:{value:0},uProj:{value:1e3},uMin:{value:2},uMax:{value:72}},z=new e.ShaderMaterial({uniforms:B,vertexShader:qi.replace("void main(){",Xi+"void main(){"),fragmentShader:Ki,transparent:!0,depthWrite:!1,depthTest:!0,blending:e.AdditiveBlending,fog:!1}),T=new e.Points(k,z);T.frustumCulled=!1,T.renderOrder=2,T.name="aircraft",t.add(T);let W=u.map((le,ce)=>({spec:le,i:ce,p0:S(),fwd:new e.Vector3(0,0,-1),lam0:Br(le.D),pos:S(),a:0})),l={pos:S(),look:S(),up:S(),fov:38},N=S(),U=S(),R=S(),Z=S(),ie=S(),Le=(le,ce)=>{let P=le*Math.PI/180;return Wi(Math.sin(P),-Math.cos(P),ce).normalize()};function me(le,ce){for(let P of W){let H=P.spec;le(H.D,l),N.copy(l.look).sub(l.pos).normalize(),U.crossVectors(N,l.up).normalize(),R.crossVectors(U,N);let Se=Math.tan(l.fov*Math.PI/360),pe=Se*ce;if(Z.copy(N).addScaledVector(U,H.nx*pe).addScaledVector(R,H.ny*Se).normalize(),P.p0.copy(l.pos).addScaledVector(Z,H.r!=null?H.r:(H.alt-l.pos.y)/Z.y),H.hdg!=null)Le(H.hdg,P.fwd);else{let we=H.turn*Math.PI/180;ie.copy(R).setY(0).normalize(),P.fwd.copy(U).setY(0).normalize().multiplyScalar(Math.cos(we)).addScaledVector(ie,Math.sin(we)).normalize()}}}function X(le,ce,P){let H=le.spec,Se=((P/H.T+B.uPh.value[le.i]*3.7)%1+1)%1;return le.pos.copy(le.p0).addScaledVector(le.fwd,H.v*(ce-le.lam0)+H.drift*(2*Se-1)),Ro(Se,0,.07)*(1-Ro(Se,.93,1))}let re=0;function We({lam:le,t:ce,sinE:P,proj:H,pr:Se=1}){if(re=Ro(-P,-.035,.03)*(1-Ro(le,Br(6e4),Br(25e4))),T.visible=re>.001,!T.visible){for(let pe of W)pe.a=0;return re}return B.uT.value=ce,B.uProj.value=H,B.uMin.value=3*Se,B.uMax.value=96*Se,W.forEach((pe,we)=>{pe.a=re*X(pe,le,ce),B.uC.value[we].copy(pe.pos),B.uF.value[we].copy(pe.fwd),B.uA.value[we]=pe.a}),re}function xe(le,ce,P,H){let Se=W[le],pe=X(Se,ce,P);return H.copy(Se.pos),pe}function Me(){t.remove(T),k.dispose(),z.dispose()}return{points:T,layout:me,update:We,at:xe,fleet:W,dispose:Me}}var oa=.46,Jt=.4,xo=.6;function $n({THREE:e}){let t=(ne,se,qe)=>new e.Vector3(ne,se,qe),r=Math.PI/180,u=t(0,1,0),a=11.25,n=-52,L=17.5,x=-22,k=11.8,S=18,B=11.65,z=-.7,T=.018,W=54,l=-.745,N=-.725,U=-.66,R=-.45,Z=-.9,ie=-.16,Le=25,me=.65,X=-35*r,re=.19,We=.002,xe=t(-.6543,.2642,-.7086),Me=t(.5744,-.4358,-.6929),le=2,ce=t(-1,.22,-.55).normalize(),P=t(0,0,0),H=t(0,1,0).addScaledVector(ce,-ce.y).normalize(),Se=P.clone().addScaledVector(ce,-23).addScaledVector(H,10.4),pe=Se.clone().addScaledVector(ce,60).addScaledVector(H,-9),we=t(.0106681,.002613,.0218856),Ce=we.clone().normalize(),ue=we.length(),De=t(25.216,6.526,17.498),Be=De.clone().negate().normalize(),_e=Be.clone().cross(u).normalize(),ee=_e.clone().cross(Be),V=(ne,se)=>t().addScaledVector(Be,se*Math.sin(ne*r)).addScaledVector(ee,se*Math.cos(ne*r)),C=(ne,se=t())=>se.set(0,0,0).addScaledVector(Be,Math.cos(ne*r)).addScaledVector(ee,Math.sin(ne*r)),A=ne=>Math.atan2(ne.dot(ee),ne.dot(Be))/r,b=4,j=480,te=C(b).multiplyScalar(j),w=(ne,se,qe)=>t(ne,se,qe).add(te),J=t(70,20,100),_=t(J.x,0,J.z).normalize(),K=J.clone().cross(u).normalize(),D=(ne,se)=>_.clone().multiplyScalar(ne*Math.cos(se*r)).addScaledVector(u,ne*Math.sin(se*r)).add(te),h=w(70,20,100),$=D(49.5,10.6),O=D(41.67,11.8),Y=O.clone().sub(te),ae=Y.length();Y.normalize();let fe=Le*r,Ge=Math.sin(fe),rt=u.clone().addScaledVector(Y,-Y.y).normalize(),Oe=t(),Ue=t(),Xe=t();{let ne=ut=>(Oe.copy(Y).multiplyScalar(ut).addScaledVector(rt,Math.sqrt(1-ut*ut)),Xe.copy(Y).multiplyScalar(ae).addScaledVector(Oe,-(6+me)),Xe.dot(Oe)/Xe.length()-Ge),se=-.95,qe=.95;for(let ut=0;ut<60;ut++){let $e=(se+qe)/2;ne($e)<0?se=$e:qe=$e}ne((se+qe)/2),Xe.normalize().negate(),Ue.copy(te).addScaledVector(Oe,6+me)}let zt=O.distanceTo(Ue),xt=O.clone().addScaledVector(Xe,.55*zt),Nt=new e.Quaternion().setFromAxisAngle(J.clone().normalize(),X),Bt=(ne,se)=>se.setFromAxisAngle(u,re+ne*We).premultiply(Nt),jt=V(0,a),wt=V(S,B),ct=te.clone().sub(wt).normalize(),Ot=te.clone().addScaledVector(te.clone().negate().normalize().lerp(J.clone().normalize(),.62).normalize(),270),Mt=(ne,se)=>ne.addScaledVector(se,-ne.dot(se)).normalize(),de=t(-.13013639750678707,.2577593941984025,.9574051455608686),Ne=V(n,L),et=De.clone().addScaledVector(Mt(de.clone(),_e).add(Ne.clone().sub(De).normalize()).normalize(),1.5),Ze=[[-1,Se,Ce],[-.9,De,de],[null,et,null],[null,Ne,null],[null,V(x,k),null],[null,jt,Be.clone()],[null,wt,ct],[null,wt.clone().addScaledVector(ct,70),ct],[null,Ot,null],[0,h,null],[.16,$,null],[.34,O,Xe],[Jt,xt,Xe],[oa,Ue,Xe]],He=Ze.length,Ee=Ze.map(ne=>ne[1]),s=[];for(let ne=0;ne<He;ne++){if(Ze[ne][2]){s.push(Ze[ne][2].clone());continue}let se=ne>0?Ee[ne].clone().sub(Ee[ne-1]).normalize():t(),qe=ne<He-1?Ee[ne+1].clone().sub(Ee[ne]).normalize():t();s.push(se.add(qe).normalize())}Mt(s[2],_e),Mt(s[9],K);let d=Ee.slice(0,-1).map((ne,se)=>ne.distanceTo(Ee[se+1])),v=new e.Curve;v.getPoint=(ne,se=new e.Vector3)=>{let qe=Math.min(Math.max(ne,0),1)*(He-1),ut=Math.min(He-2,Math.floor(qe)),$e=qe-ut,Ft=$e*$e,Pe=Ft*$e,pt=d[ut];return se.copy(Ee[ut]).multiplyScalar(2*Pe-3*Ft+1).addScaledVector(s[ut],(Pe-2*Ft+$e)*pt).addScaledVector(Ee[ut+1],3*Ft-2*Pe).addScaledVector(s[ut+1],(Pe-Ft)*pt)},v.arcLengthDivisions=(He-1)*800;let m=v.getLengths(),c=ne=>{let se=ne*(m.length-1),qe=Math.floor(se);return qe>=m.length-1?m[m.length-1]:m[qe]+(m[qe+1]-m[qe])*(se-qe)},M=Ee.map((ne,se)=>c(se/(He-1))),f=[[-1,0,ue,-3e-5],[-.9,1,.0022,0],[z,5,T,0],[0,9,.075,-4e-5],[.16,10,.012,-1e-5],[.34,11,.006,0],[Jt,12,.11,-1e-4],[oa,13,.04,-1e-4]],F=[[2.181,-1],[2.781,-.9],[3.481,-.64],[4.25,-.15],[4.75,0],[8.5,.26],[10.5,.62],[13.5,.9],[15,1.12]],E=jo(F),I=f.length,Q=new Float64Array(I),ye=new Float64Array(I),Qe=new Float64Array(I),Ve=new Float64Array(I),ze=null,he=0,ke=1,Re=ne=>{let se=he,qe=ke;for(let ut=0;ut<40;ut++){let $e=(se+qe)/2;ze($e)<ne?se=$e:qe=$e}return(se+qe)/2},ve=(ne,se,qe)=>(ne(se+qe)-ne(se-qe))/(2*qe);function tt({S:ne,yE:se,y1:qe,vh:ut=900}){ze=ne,he=se,ke=qe;let $e=F[0][0],Ft=F[F.length-1][0];for(let Pe=0;Pe<I;Pe++){let pt=f[Pe][0];Q[Pe]=pt<=-1?se:Re(pt);let Yt=1;if(pt>-1){let Qt=$e,At=Ft;for(let Et=0;Et<50;Et++){let va=(Qt+At)/2;E(va)<pt?Qt=va:At=va}Yt=ve(ne,Q[Pe],.5)*ut/Math.max(1e-9,ve(E,(Qt+At)/2,1e-4))}Qe[Pe]=f[Pe][2]*Yt,Ve[Pe]=f[Pe][3]*Yt*Yt}for(let Pe=0;Pe<I-1;Pe++){let pt=Q[Pe+1]-Q[Pe],Yt=Qe[Pe],Qt=Qe[Pe+1],At=Ve[Pe]*pt,Et=Ve[Pe+1]*pt;ye[Pe]=(M[f[Pe+1][1]]-M[f[Pe][1]])/pt-((Yt+Qt)/2+(At-Et)/12)}}function Je(ne){if(ne<=Q[0])return 0;if(ne>=Q[I-1])return M[f[I-1][1]];let se=0;for(;ne>Q[se+1];)se++;let qe=Q[se+1]-Q[se],ut=(ne-Q[se])/qe,$e=ut*ut,Ft=$e*ut,Pe=Ft*ut,pt=Qe[se],Yt=Qe[se+1],Qt=Ve[se]*qe,At=Ve[se+1]*qe,Et=pt*(ut-Ft+Pe/2)+Qt*($e/2-2*Ft/3+Pe/4)+Yt*(Ft-Pe/2)+At*(Pe/4-Ft/3)+ye[se]*Ft*(10-15*ut+6*$e);return M[f[se][1]]+qe*Et}let it=[0,1,2].map(ne=>kr([-1,-.9],[pe.getComponent(ne),P.getComponent(ne)],[0,0])),vt=ne=>Kt(Lt((ne+.9)/(l+.9))),p=ne=>Kt(Lt((ne+.9)/(U+.9))),oe=ne=>Kt(Lt((ne-N)/(R-N))),ge=.34,Te=Jt-.005,Ae=kr([-1,-.9,z,-.5,-.25,0,.16,.34,Jt,oa],[38,48,W,38,31,30,30,32,42,52],[0,0,null,null,null,null,null,null,null,null]),at=31.26,kt=xe,Tt=Me,It=le,Ct=(ne,se)=>{let qe=ne+1,ut=qe<.08?qe*qe/.16:qe-.04,$e=It*(ut-.06);return se.copy(kt).multiplyScalar(at*Math.cos($e)).addScaledVector(Tt,at*Math.sin($e)).add(P)},Vt=ne=>1+15*(1-Kt(Lt((ne-Z)/(ie-Z)))),je=ne=>Kt(Lt((ne+.9)/.04))*(1-Kt(Lt((ne-U)/.06))),Ie=ne=>Kt(Lt((ne+.06)/.06));function Ut(ne,se,qe){let ut=se.length()-10;qe.multiplyScalar(Lt((ut-1)/6));let $e=je(ne),Ft=Ie(ne);return $e>0&&qe.addScaledVector(_e,-$e*qe.dot(_e)),Ft>0&&qe.addScaledVector(K,-Ft*qe.dot(K)),qe}let Xt=t(),ra=t();function ua(ne,se,qe,ut){let $e=Math.min(Math.max(ne,-1),oa),Ft=$e<=-1?Q[0]:$e>=oa?Q[I-1]:Re($e),Pe=Je(Ft);if(v.getPoint(v.getUtoTmapping(0,Math.max(0,Math.min(m[m.length-1],Pe))),se),$e<=-.9)qe.set(it[0]($e),it[1]($e),it[2]($e));else if($e>=R)qe.copy(te);else{let Yt=vt($e),Qt=se.length(),At=Math.log(Qt+(Math.sqrt(Math.max(0,Qt*Qt-100))-Qt)*Yt),Et=oe($e),va=Math.exp(At+(Math.log(te.distanceTo(se))-At)*Et);$e>=U?qe.copy(te).sub(se).normalize().multiplyScalar(va).add(se):qe.copy(se).add(C(p($e)*A(ra.copy(te).sub(se)),ra).multiplyScalar(va))}let pt=Kt(Lt(($e-ge)/(Te-ge)));return pt>0&&qe.lerp(Xt.copy(se).addScaledVector(Xe,40),pt),ut&&ut.set(0,1,0),Ae($e)}return{toSun:ce,EARTH:P,MARS:te,C0:Se,L0:pe,P1:De,H2:O,EN1:Oe,ENP:Ue,LCA:Xe,PN:_e,QN:K,CA:oa,E0:Jt,E1:xo,MOON_R:at,layout:tt,spaceCam:ua,moonAt:Ct,marsFar:Vt,marsQ:Bt,drift:Ut}}var Yi=.45,Va=(e,t,r)=>Kt(Lt((e-t)/(r-t)));function Vr(e,t,r){if(!(r<1))return t;let u=1-(1-Yi)*Va(e,-.86,-.74),a=Math.min(2.2,(1.12/r)**u),n=Va(e,-1,-.9);return 2*Math.atan(Math.tan(t*Math.PI/360)*(1+n*(a-1)))*180/Math.PI}function Ur(e,t){let r=1-Va(t,.6,.8);if(r<=0)return 0;let u=Va(e,-1,-.93)*(1-Va(e,-.84,-.74)),a=Va(e,.5,.6)*(1-Va(e,.88,.98));return r*(.2*u+.14*a)}function es({high:e=!0,rockets:t=!0}={}){let r=(()=>{let l=7;return()=>(l=l*16807%2147483647)/2147483647})(),u=[62,132,204],a=8,n={land:[[55,-150],[15,-168]],build:[-25,-100]},L=[{x:0,z:0,r:20,bt:.02,kind:"hub"}],x=[];for(let l=0;l<4;l++){let N=Math.PI/8+l*Math.PI/2;L.push({x:Math.cos(N)*96,z:Math.sin(N)*96,r:15,bt:.26+l*.08,kind:"outer"}),x.push({a:N,r0:19,len:62,y:2.6,radius:2.4,bt:.12+l*.07})}let k=(l,N)=>Math.abs(((l-N)%(Math.PI*2)+Math.PI*3)%(Math.PI*2)-Math.PI),S=[],B=[];for(let l=34;l<238;l+=14){let N=l*.11;for(;N<l*.11+Math.PI*2-.05;){let U=Math.min(6.6,2.6+r()*3.2+5*Math.exp(-l/70)),R=Math.cos(N)*l,Z=Math.sin(N)*l,ie=[...Array(a)].some((X,re)=>k(N,re*Math.PI/4)*l<U+4),Le=l<86&&x.some(X=>k(N,X.a)*l<U+3.5);if(!(ie||Le||u.some(X=>Math.abs(l-X)<U+3.5)||L.some(X=>Math.hypot(R-X.x,Z-X.z)<X.r+U+3))&&r()>.1){let X=.06+l/238*.58+r()*.08;l>175&&r()<.28?B.push({x:R,z:Z,w:8+r()*4,d:5,h:2.5+r()*2.5,rot:N,bt:X}):S.push({x:R,z:Z,r:U,ys:.72+r()*.35,rot:r()*6.28,bt:X,seed:r()*50})}N+=(2*U+2.6)/l}}let z=[...S].sort((l,N)=>l.bt-N.bt);e||z.forEach((l,N)=>l.skip=N%2===1),t&&z.forEach(l=>{(n.land.some(([N,U])=>Math.hypot(l.x-N,l.z-U)<l.r+16)||Math.hypot(l.x-n.build[0],l.z-n.build[1])<l.r+30)&&(l.skip=!0)});let T=(l,N)=>{let U=Math.sin(l*.1271+N*.3117+1.7)*43758.5453;return U-Math.floor(U)};S.forEach(l=>{let N=T(l.x,l.z);l.type=N<.26?0:N<.56?1:N<.8?2:3,l.h=l.r*l.ys});let W=[];for(let l=262;l<345;l+=4.2)for(let N=.25;N<1.35;N+=3.2/l)W.push({x:Math.cos(N)*l,z:Math.sin(N)*l,bt:.22+(l-262)/83*.22+(N-.25)*.12});return{units:"m, colony space (+y up); bt = build start in city progress 0..1",rings:u.map(l=>({r:l,bt:.02+l/236*.55})),avenues:[...Array(a)].map((l,N)=>({a:N*Math.PI/4,r0:20,r1:250,bt:0})),domes:L,tubes:x,habs:S.filter(l=>!l.skip),fabs:B,solar:{r0:262,r1:345,a0:.25,a1:1.35,panel:[3,2.2],tilt:.5,cells:W},oldPad:{x:Math.cos(-.55)*300,z:Math.sin(-.55)*300,r:26},ships:n.land.map(([l,N])=>({x:l,z:N})),buildPad:{x:n.build[0],z:n.build[1],r:16.5,tower:{x:n.build[0]-12,z:n.build[1]+10}}}}var Ma=`
float habInstHash(){
#ifdef USE_INSTANCING
  vec2 t = instanceMatrix[3].xz;
#else
  vec2 t = modelMatrix[3].xz;
#endif
  return fract(sin(dot(t, vec2(0.1271, 0.3117)) + 1.7) * 43758.5453);
}
// four dome types: frac = share of panels that are glass, w = weights for the (crown, band, random) panel scores
void habType(float h, out float frac, out vec3 w){
  if (h < 0.26)      { frac = 0.80; w = vec3(0.50, 0.00, 0.50); } // mostly glass
  else if (h < 0.56) { frac = 0.15; w = vec3(0.85, 0.00, 0.15); } // opaque, skylight crown
  else if (h < 0.80) { frac = 0.22; w = vec3(0.10, 0.75, 0.15); } // opaque, eye-level window band
  else               { frac = 0.44; w = vec3(0.20, 0.20, 0.60); } // mixed
}
float habHasVest(float h){ return step(0.42, fract(h * 7.31)); }
float habHasAnt(float h){ return step(0.62, fract(h * 3.77)); }
`,ts=`
float habLit(float h, float j){ float t0 = 0.03 + 0.6 * fract(h * 13.7 + j); return smoothstep(t0, t0 + 0.04, night) * (0.55 + 0.45 * night); }
`,bo=ts,Ua=`#include <lights_fragment_maps>
  iblIrradiance *= 1. - 0.9 * night; radiance *= 1. - 0.9 * night;`;function as({THREE:e,renderer:t,sunDir:r,night:u=0}){let a=(r?r.clone():new e.Vector3(-.95,.24,-.21)).normalize(),n=new e.Scene,L=new e.SphereGeometry(10,64,32),x=new e.ShaderMaterial({side:e.BackSide,depthWrite:!1,uniforms:{sunDir:{value:a},night:{value:u}},vertexShader:"varying vec3 vD; void main(){ vD = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }",fragmentShader:`uniform vec3 sunDir; uniform float night; varying vec3 vD;
    void main(){
      vec3 d = normalize(vD); float e = d.y, eu = clamp(e, 0., 1.), sd = max(dot(d, sunDir), 0.);
      float az = max(dot(normalize(d.xz + 1e-5), normalize(sunDir.xz + 1e-5)), 0.);
      vec3 sky = mix(vec3(0.92, 0.58, 0.33), vec3(0.30, 0.17, 0.10), pow(eu, 0.55));
      sky += vec3(1.0, 0.62, 0.34) * exp(-eu * 13.) * (0.30 + 0.70 * az * az);     // dusty horizon, brightest under the sun
      sky += vec3(1.0, 0.72, 0.46) * pow(sd, 6.) * 0.55;                            // forward scatter
      sky += vec3(0.32, 0.55, 1.0) * pow(sd, 48.) * 1.8;                            // blue halo
      sky += vec3(1.0, 0.95, 0.88) * smoothstep(0.99955, 0.99985, sd) * 90.;       // sun disc
      vec3 gnd = mix(vec3(0.46, 0.24, 0.13), vec3(0.13, 0.065, 0.035), smoothstep(0., 0.3, -e));
      gnd += vec3(1., 0.62, 0.35) * exp(min(e, 0.) * 22.) * 0.25 * (0.4 + 0.6 * az);
      vec3 c = mix(gnd, sky, smoothstep(-0.01, 0.01, e));
      vec3 nsky = mix(vec3(0.06, 0.045, 0.05), vec3(0.008, 0.009, 0.016), pow(eu, 0.45)) + vec3(0.2, 0.35, 0.7) * pow(sd, 10.) * 0.12;
      c = mix(c, mix(vec3(0.01, 0.007, 0.005), nsky, smoothstep(-0.01, 0.01, e)), night);
      gl_FragColor = vec4(c, 1.);
    }`});n.add(new e.Mesh(L,x));let k=new e.PMREMGenerator(t),S=k.fromScene(n,0,.1,100);return k.dispose(),L.dispose(),x.dispose(),S.texture.userData.renderTarget=S,S.texture}function os({THREE:e,renderer:t,envMap:r=null,frameDetail:u="high"}={}){let a=e.Vector3,n={value:0},L={},x=[];function k(s){let d=[],v=[],m={};for(let I in s)m[I]=[];let c=new a,M=new a,f=new a,F=(I,Q,ye,Qe)=>{d.push(I.x,I.y,I.z),v.push(Q.x,Q.y,Q.z);for(let Ve in s){let ze=s[Ve],he=ye[Ve];if(typeof he=="function"&&(he=he(I,Q)),he===void 0&&(he=ze===1?0:[0,0,0]),ze===1)m[Ve].push(Array.isArray(he)?he[Qe]:he);else{let ke=Array.isArray(he[0])?he[Qe]:he;for(let Re=0;Re<ze;Re++)m[Ve].push(ke[Re]||0)}}},E={tri(I,Q,ye,Qe={},Ve=null,ze=null){c.subVectors(Q,I),M.subVectors(ye,I),f.crossVectors(c,M).normalize();let he=[0,1,2];Ve&&f.dot(Ve)<0&&(he=[0,2,1],f.negate());let ke=[I,Q,ye];for(let Re of he)F(ke[Re],ze?ze[Re]:f,Qe,Re)},quad(I,Q,ye,Qe,Ve={},ze=null){E.tri(I,Q,ye,Ve,ze),E.tri(I,ye,Qe,Ve,ze)},box(I,Q,ye,Qe,Ve,ze,he={},ke=!0){let Re=new e.BoxGeometry(Qe,Ve,ze);Re.translate(I,Q,ye),E.geo(Re,he,ke?ve=>ve.y<-.5:null),Re.dispose()},geo(I,Q={},ye=null,Qe=!1){let Ve=I.index?I.toNonIndexed():I,ze=Ve.attributes.position,he=Ve.attributes.normal,ke=new a,Re=new a,ve=new a,tt=new a,Je=new a,it=new a;for(let vt=0;vt<ze.count;vt+=3)ke.fromBufferAttribute(ze,vt),Re.fromBufferAttribute(ze,vt+1),ve.fromBufferAttribute(ze,vt+2),tt.fromBufferAttribute(he,vt),Je.fromBufferAttribute(he,vt+1),it.fromBufferAttribute(he,vt+2),!(ye&&ye(tt.clone().add(Je).add(it).normalize()))&&(Qe?(c.subVectors(Re,ke),M.subVectors(ve,ke),f.crossVectors(c,M).normalize(),F(ke,f,Q,0),F(Re,f,Q,1),F(ve,f,Q,2)):(F(ke,tt,Q,0),F(Re,Je,Q,1),F(ve,it,Q,2)));Ve!==I&&Ve.dispose()},build(){let I=new e.BufferGeometry;I.setAttribute("position",new e.Float32BufferAttribute(d,3)),I.setAttribute("normal",new e.Float32BufferAttribute(v,3));for(let Q in s)I.setAttribute(Q,new e.Float32BufferAttribute(m[Q],s[Q]));return I.computeBoundingSphere(),I.computeBoundingBox(),I}};return E}let S=s=>(s.index?s.index.count:s.attributes.position.count)/3,B=(s=>()=>(s=s*16807%2147483647)/2147483647)(11);function z(s){let d=new e.IcosahedronGeometry(1,s-1),v=(1+Math.sqrt(5))/2;d.applyQuaternion(new e.Quaternion().setFromUnitVectors(new a(-1,v,0).normalize(),new a(0,1,0)));let m=d.attributes.position,c=[],M=new Map,f=[],F=new Map,E=I=>{let Q=`${Math.round(I.x*1e4)},${Math.round(I.y*1e4)},${Math.round(I.z*1e4)}`,ye=M.get(Q);return ye===void 0&&(ye=f.length,f.push(I.clone()),M.set(Q,ye)),ye};for(let I=0;I<m.count;I+=3){let Q=[0,1,2].map(Ve=>{let ze=new a().fromBufferAttribute(m,I+Ve);return Math.abs(ze.y)<1e-4&&(ze.y=0),ze}),ye=Q[0].clone().add(Q[1]).add(Q[2]).divideScalar(3);if(ye.y<=1e-4)continue;new a().subVectors(Q[1],Q[0]).cross(new a().subVectors(Q[2],Q[0])).dot(ye)<0&&Q.reverse();let Qe=Q.map(E);c.push({v:Q,c:ye});for(let Ve=0;Ve<3;Ve++){let ze=Qe[Ve],he=Qe[(Ve+1)%3],ke=ze<he?ze+"_"+he:he+"_"+ze;F.has(ke)||F.set(ke,[ze,he])}}return d.dispose(),{faces:c,verts:f,edges:[...F.values()]}}function T(s,d,v,m,c,M,f,F,E=!1){let I=d.clone().multiplyScalar(m),Q=v.clone().multiplyScalar(m),ye=Q.clone().sub(I).normalize(),Qe=I.clone().add(Q).normalize(),Ve=new a().crossVectors(ye,Qe).normalize(),ze=new a().crossVectors(Ve,ye).normalize(),he=E?[ze.clone().multiplyScalar(-f).addScaledVector(Ve,c),ze.clone().multiplyScalar(M),ze.clone().multiplyScalar(-f).addScaledVector(Ve,-c)]:[ze.clone().multiplyScalar(-f).addScaledVector(Ve,c),ze.clone().multiplyScalar(M).addScaledVector(Ve,c*.5),ze.clone().multiplyScalar(M).addScaledVector(Ve,-c*.5),ze.clone().multiplyScalar(-f).addScaledVector(Ve,-c)];for(let ke=0;ke<he.length-1;ke++)s.quad(I.clone().add(he[ke]),Q.clone().add(he[ke]),Q.clone().add(he[ke+1]),I.clone().add(he[ke+1]),F,he[ke].clone().add(he[ke+1]))}function W(s,d,v,m,c,M,f=4){let F=d.clone().normalize(),E=F.clone().multiplyScalar(v-.004),I=new a(0,1,0);Math.abs(F.y)>.9&&I.set(1,0,0),I.cross(F).normalize();let Q=F.clone().cross(I),ye=F.clone().multiplyScalar(v+c),Qe=B()*6.28,Ve=[...Array(f)].map((ze,he)=>{let ke=Qe+he/f*Math.PI*2;return E.clone().addScaledVector(I,Math.cos(ke)*m).addScaledVector(Q,Math.sin(ke)*m)});for(let ze=0;ze<f;ze++)s.tri(Ve[ze],Ve[(ze+1)%f],ye,M,F)}let l=(s,d)=>s.clone().add(new a(B()-.5,B()-.5,B()-.5).multiplyScalar(d)).normalize(),N=[[1,0,0],[0,1,0],[0,0,1]];function U(s,d,v){return s.onBeforeCompile=m=>{m.uniforms.night=n,v(m),m.fragmentShader=m.fragmentShader.replace("#include <normal_fragment_maps>",`#include <normal_fragment_maps>
        { vec3 dnx = dFdx(normal), dny = dFdy(normal); float k = min(.18, 2. * max(dot(dnx, dnx), dot(dny, dny))); roughnessFactor = sqrt(roughnessFactor * roughnessFactor + k); }`)},s.customProgramCacheKey=()=>"hab-"+d,x.push(s),s}function R(s,d,v){let m=new e.MeshDepthMaterial({depthPacking:e.RGBADepthPacking});return m.onBeforeCompile=c=>{c.vertexShader=d+Ma+c.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
`+v)},m.customProgramCacheKey=()=>"habdepth-"+s,m}let Z=z(4),ie=.995,Le=.9,me=.985,X=s=>[1-s.y,Math.min(1,Math.abs(s.y-.36)*2.6),B()],re=k({sel:3,bary:3,kind:1}),We=k({sel:3,bary:3,kind:1}),xe=k({sel:3,bary:3,kind:1}),Me=k({sel:3,bary:3,kind:1}),le=s=>s.clone().normalize(),ce=(s,d)=>s.clone().addScaledVector(d,1).normalize(),P=[[.5,.5,0],[0,.5,.5],[.5,0,.5]];Z.faces.forEach(s=>{let d=s.v.map(f=>s.c.clone().lerp(f,Le).multiplyScalar(ie)),v=X(s.c),m=l(s.c.clone().normalize(),.03).sub(s.c.clone().normalize());re.tri(d[0],d[1],d[2],{sel:v,bary:N,kind:0},s.c,d.map(le)),We.tri(d[0],d[1],d[2],{sel:v,bary:N,kind:0},s.c,d.map(f=>ce(le(f),m)));let c=[[0,1],[1,2],[0,2]].map(([f,F])=>d[f].clone().add(d[F]).normalize().multiplyScalar(ie*.997)),M=[[d[0],c[0],c[2],[N[0],P[0],P[2]]],[c[0],d[1],c[1],[P[0],N[1],P[1]]],[c[2],c[1],d[2],[P[2],P[1],N[2]]],[c[0],c[1],c[2],[P[0],P[1],P[2]]]];for(let[f,F,E,I]of M)xe.tri(f,F,E,{sel:v,bary:I,kind:0},s.c,[f,F,E].map(le)),Me.tri(f,F,E,{sel:v,bary:I,kind:0},s.c,[f,F,E].map(Q=>ce(le(Q),m)))});for(let s of[xe,re]){let d=[[.2,0]];for(let f=0;f<=6;f++){let F=f/6*Math.PI;d.push([.2*Math.cos(F),.2+.2*Math.sin(F)])}d.push([-.2,0]);let v=.7,m=1.2,c=(f,[F,E])=>new a(f,E,F);for(let f=0;f<d.length-1;f++){let F=[(d[f][0]+d[f+1][0])/2,(d[f][1]+d[f+1][1])/2-.15];s.quad(c(v,d[f]),c(m,d[f]),c(m,d[f+1]),c(v,d[f+1]),{kind:1,bary:[.3,.3,.3]},new a(0,F[1],F[0]))}let M=new a(m,.17,0);for(let f=0;f<d.length;f++)s.tri(M,c(m,d[f]),c(m,d[(f+1)%d.length]),{kind:1,bary:[.3,.3,.3]},new a(1,0,0));s.quad(new a(m+.006,.02,.11),new a(m+.006,.02,-.11),new a(m+.006,.31,-.11),new a(m+.006,.31,.11),{kind:2,bary:[.3,.3,.3]},new a(1,0,0)),s.quad(new a(m+.01,.2,.05),new a(m+.01,.2,-.05),new a(m+.01,.27,-.05),new a(m+.01,.27,.05),{kind:3,bary:[.3,.3,.3]},new a(1,0,0)),s.quad(new a(.98,.18,.203),new a(1.06,.18,.203),new a(1.06,.26,.203),new a(.98,.26,.203),{kind:3,bary:[.3,.3,.3]},new a(0,0,1))}let H=re.build(),Se=We.build(),pe=xe.build(),we=Me.build(),Ce=k({kind:1}),ue=k({kind:1}),De=u==="low";Z.edges.forEach(([s,d])=>T(Ce,Z.verts[s],Z.verts[d],me,.017,.019,.014,{kind:0},De)),Z.verts.forEach(s=>W(Ce,s,me,.03,.03,{kind:1},De?3:4));for(let s of[ue,Ce]){let d=new e.CylinderGeometry(.075,.085,.05,8,1,!1);d.translate(0,me+.02,0),s.geo(d,{kind:4},M=>M.y<-.5,!0),d.dispose();let v=.3,m=Math.sqrt(1-v*v)*me;s.box(v,m+.17,.05,.016,.36,.016,{kind:2});let c=new e.ConeGeometry(.09,.04,9,1,!0);c.rotateX(Math.PI),c.rotateZ(-.9),c.translate(v+.03,m+.3,.05),s.geo(c,{kind:2},null,!0),c.dispose(),s.box(v,m+.36,.05,.03,.03,.03,{kind:3}),s.box(1.2/1.015+.012,.345/1.015,0,.03,.025,.06,{kind:5})}let Be=Ce.build(),_e=ue.build(),ee=`#ifdef HAB_FAR
      { float re = min(min(vBary.x, vBary.y), vBary.z), fw = max(fwidth(re), 1e-4), w0 = 0.046;
        float rib = mix(1. - smoothstep(w0 - .5 * fw, w0 + .5 * fw, re), min(1., 5.4 * w0), smoothstep(.6 * w0, 2.5 * w0, fw));
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(.55, .5, .44), rib * .85); habRib = rib; }
      #endif`,V=s=>U(new e.MeshStandardMaterial({color:16777215,roughness:.55,metalness:.08,envMap:r,envMapIntensity:.45}),s?"shell-far":"shell",d=>{d.vertexShader=`attribute vec3 sel; attribute vec3 bary; attribute float kind; varying vec3 vSel; varying vec3 vBary; varying float vKind; varying float vIh; varying float vY; varying float vFrac;
`+Ma+d.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
      float ih = habInstHash(), frac; vec3 hw; habType(ih, frac, hw);
      transformed *= kind < 0.5 ? step(frac, dot(hw, sel)) : habHasVest(ih);
      vSel = sel; vBary = bary; vKind = kind; vIh = ih; vY = position.y; vFrac = frac;`),d.fragmentShader=(s?`#define HAB_FAR
`:"")+`uniform float night; varying vec3 vSel; varying vec3 vBary; varying float vKind; varying float vIh; varying float vY; varying float vFrac; float habRib = 0.;
`+bo+d.fragmentShader.replace("#include <color_fragment>",`#include <color_fragment>
      float pr = fract(vSel.z * 17.3 + vIh * 5.1), edge = min(min(vBary.x, vBary.y), vBary.z), seam = smoothstep(0.012, 0.075, edge);
      float solar = vKind < 0.5 ? step(0.9, vSel.z) * step(vFrac, 0.3) * step(0.22, vY) * step(vY, 0.86) : 0.;
      float win = step(2.5, vKind);
      if (vKind < 0.5) {
        diffuseColor.rgb *= vec3(0.93 + 0.12 * pr, 0.92 + 0.1 * pr, 0.9 + 0.08 * fract(pr * 7.));  // per-panel tint variance
        vec3 cell = abs(fract(vBary * 5.) - 0.5);
        vec3 sc = vec3(0.06, 0.09, 0.17) + 0.05 * (1. - smoothstep(0.42, 0.48, max(max(cell.x, cell.y), cell.z)));
        diffuseColor.rgb = mix(diffuseColor.rgb, sc, solar);
        diffuseColor.rgb *= mix(0.42, 1., seam);                                                         // panel gasket groove
      } else if (vKind < 1.5) { diffuseColor.rgb *= 0.97; }
      else if (vKind < 2.5) { diffuseColor.rgb *= vec3(0.36, 0.34, 0.33); }
      else { diffuseColor.rgb = vec3(0.03, 0.035, 0.04); }
      diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(0.93, 0.66, 0.48), (1. - smoothstep(0.0, 0.32, vY)) * 0.55 * (1. - solar)); // regolith dust creeping up from the base
      if (vKind < 0.5) {
      ${ee}
      }`).replace("#include <roughnessmap_fragment>",`#include <roughnessmap_fragment>
      roughnessFactor = mix(roughnessFactor + 0.1 * (pr - 0.5), 0.22, max(solar, win));`).replace("#include <metalnessmap_fragment>",`#include <metalnessmap_fragment>
      metalnessFactor = mix(metalnessFactor, 0.55, max(solar, win));`).replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>
      totalEmissiveRadiance += vec3(1., 0.62, 0.3) * win * (0.15 + 2.6 * habLit(vIh, 0.));`).replace("#include <lights_fragment_maps>",Ua)}),C=V(!1),A=V(!0),b=s=>U(new e.MeshStandardMaterial({color:16777215,roughness:.05,metalness:.92,envMap:r,envMapIntensity:1.5}),s?"glass-far":"glass",d=>{d.vertexShader=`attribute vec3 sel; attribute vec3 bary; attribute float kind; varying vec3 vSel; varying vec3 vBary; varying float vIh; varying float vY;
`+Ma+d.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
      float ih = habInstHash(), frac; vec3 hw; habType(ih, frac, hw);
      transformed *= 1. - step(frac, dot(hw, sel));
      vSel = sel; vBary = bary; vIh = ih; vY = position.y;`),d.fragmentShader=(s?`#define HAB_FAR
`:"")+`uniform float night; varying vec3 vSel; varying vec3 vBary; varying float vIh; varying float vY; float habRib = 0.;
`+bo+d.fragmentShader.replace("#include <color_fragment>",`#include <color_fragment>
      float pr = fract(vSel.z * 23.7 + vIh * 3.3), edge = min(min(vBary.x, vBary.y), vBary.z), mull = 1. - smoothstep(0.03, 0.07, edge);
      diffuseColor.rgb = mix(mix(vec3(0.30, 0.34, 0.39), vec3(0.42, 0.33, 0.24), step(0.62, pr)), vec3(0.2, 0.19, 0.18), mull);
      ${ee}
      mull = max(mull, habRib);`).replace("#include <roughnessmap_fragment>",`#include <roughnessmap_fragment>
      roughnessFactor = mix(roughnessFactor + 0.05 * pr, 0.55, mull);
      roughnessFactor = max(roughnessFactor, 0.05 + 0.25 * smoothstep(40., 300., length(vViewPosition))); // distance floor: far facets stop sparkling`).replace("#include <metalnessmap_fragment>",`#include <metalnessmap_fragment>
      metalnessFactor = mix(metalnessFactor, 0.4, mull);`).replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>
      float on = 0.45 + 0.55 * step(0.3, fract(vIh * 11.3)), lit = 0.35 + 0.65 * step(0.38, fract(pr * 5.7 + vIh));
      totalEmissiveRadiance += vec3(1., 0.56, 0.24) * habLit(vIh, floor(pr * 4.) * 0.17) * on * lit * (1. - mull) * (0.7 + 0.9 * (1. - vY)) * 1.7;`).replace("#include <lights_fragment_maps>",Ua)}),j=b(!1),te=b(!0);j.userData.night=n;let w=U(new e.MeshStandardMaterial({color:12761517,roughness:.38,metalness:.55,envMap:r,envMapIntensity:.7}),"frame",s=>{s.vertexShader=`attribute float kind; varying float vKind; varying float vHs;
`+Ma+s.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
      float ih = habInstHash();
      transformed *= kind > 1.5 && kind < 3.5 ? habHasAnt(ih) : (kind > 4.5 ? habHasVest(ih) : 1.);
      vKind = kind;
      #ifdef USE_INSTANCING
        vHs = length(instanceMatrix[0].xyz);
      #else
        vHs = length(modelMatrix[0].xyz);
      #endif`),s.fragmentShader=`uniform float night; varying float vKind; varying float vHs;
`+s.fragmentShader.replace("#include <color_fragment>",`#include <color_fragment>
      float lamp = step(2.5, vKind) * (1. - step(3.5, vKind)) + step(4.5, vKind);
      diffuseColor.rgb *= vKind > 0.5 && vKind < 1.5 ? 0.62 : (vKind > 3.5 && vKind < 4.5 ? 0.5 : 1.);
      // struts/hubs narrower than a pixel: blend toward the shell's colour and finish so they stop shimmering
      float thin = (1. - clamp(0.034 * vHs / max(length(fwidth(vViewPosition)), 1e-5), 0., 1.)) * step(vKind, 1.5);
      diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.62, 0.58, 0.54), thin * 0.7);`).replace("#include <roughnessmap_fragment>",`#include <roughnessmap_fragment>
      roughnessFactor = mix(roughnessFactor, 0.6, thin);`).replace("#include <metalnessmap_fragment>",`#include <metalnessmap_fragment>
      metalnessFactor = mix(metalnessFactor, 0.1, thin);`).replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>
      totalEmissiveRadiance += (vKind < 4. ? vec3(1., 0.15, 0.08) : vec3(1., 0.8, 0.55)) * lamp * (0.4 + 4. * night);`).replace("#include <lights_fragment_maps>",Ua)}),J=R("shell",`attribute float kind;
`,"transformed *= kind < 0.5 ? 1. : habHasVest(habInstHash());"),_=R("frame",`attribute float kind;
`,"float ih0 = habInstHash(); transformed *= kind > 1.5 && kind < 3.5 ? habHasAnt(ih0) : (kind > 4.5 ? habHasVest(ih0) : 1.);"),K=s=>{let d=[[0,.5,0],[.9,.5,0],[1,.5,1],[1.035,.47,1],[1.08,.42,2],[1.16,.29,2],[1.24,.13,2],[1.31,.03,2],[1.37,0,3]],v=[],m=[],c=[],M=(he,ke,Re)=>{let ve=Math.sin(he*12.9898+ke*78.233+Re*37.719)*43758.5453;return ve-Math.floor(ve)};for(let he=0;he<d.length;he++)for(let ke=0;ke<=s;ke++){let Re=ke%s,ve=Re/s*Math.PI*2,[tt,Je,it]=d[he],vt=it===2?M(Re,he,1)-.5+.6*(Math.sin(ve*3+1.3)*.5):0,p=tt+vt*.05,oe=Math.max(0,Je+(it===2?(M(Re,he,2)-.5)*.07+vt*.03:0));v.push(Math.cos(ve)*p,oe,Math.sin(ve)*p);let ge=M(Re,he,3),Te=it===0?[.5+ge*.03,.42+ge*.03,.35+ge*.02]:it===1?[.36,.32,.28]:it===2?[.4+ge*.1,.18+ge*.05,.085+ge*.025]:[.38,.17,.08];m.push(...Te)}for(let he=0;he<d.length-1;he++)for(let ke=0;ke<s;ke++){let Re=he*(s+1)+ke,ve=Re+s+1;c.push(Re,Re+1,ve,Re+1,ve+1,ve)}let f=new e.BufferGeometry;f.setAttribute("position",new e.Float32BufferAttribute(v,3)),f.setAttribute("color",new e.Float32BufferAttribute(m,3)),f.setIndex(c),f.computeVertexNormals();let F=f.toNonIndexed(),E=k({color:3,kind:1}),I=F.attributes.color,Q=F.attributes.position,ye=F.attributes.normal,Qe=new a,Ve=new a,ze=new a;for(let he=0;he<Q.count;he+=3)Qe.fromBufferAttribute(Q,he),Ve.fromBufferAttribute(Q,he+1),ze.fromBufferAttribute(Q,he+2),!(Qe.distanceTo(Ve)<1e-6||Ve.distanceTo(ze)<1e-6||Qe.distanceTo(ze)<1e-6)&&E.tri(Qe,Ve,ze,{color:[0,1,2].map(ke=>[I.getX(he+ke),I.getY(he+ke),I.getZ(he+ke)]),kind:0},null,[0,1,2].map(ke=>new a().fromBufferAttribute(ye,he+ke)));f.dispose(),F.dispose();for(let he=0;he<6;he++){let ke=he/6*Math.PI*2+.26;E.box(Math.cos(ke)*1,.565,Math.sin(ke)*1,.03,.13,.03,{color:[.25,.24,.23],kind:1})}return E.build()},D=K(30),h=K(14),$=U(new e.MeshStandardMaterial({color:16777215,vertexColors:!0,roughness:.95,metalness:0}),"pad",s=>{s.vertexShader=`attribute float kind; varying float vKind; varying float vPY;
`+s.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
      vKind = kind; vPY = position.y;`),s.fragmentShader=`uniform float night; varying float vKind; varying float vPY;
`+s.fragmentShader.replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>
      totalEmissiveRadiance += vec3(1., 0.72, 0.42) * step(0.5, vKind) * step(0.6, vPY) * (0.3 + 5. * night);`)}),O=(()=>{let d=[],v=[],m=[],c=[[.95,.62],[1.3,.38],[1.75,0]];c.forEach(([f,F])=>{for(let E=0;E<=30;E++){let I=E/30*Math.PI*2;d.push(Math.cos(I)*f,.025,Math.sin(I)*f),v.push(F)}});for(let f=0;f<c.length-1;f++)for(let F=0;F<30;F++){let E=f*31+F,I=E+30+1;m.push(E,E+1,I,E+1,I+1,I)}let M=new e.BufferGeometry;return M.setAttribute("position",new e.Float32BufferAttribute(d,3)),M.setAttribute("alpha",new e.Float32BufferAttribute(v,1)),M.setIndex(m),M.computeBoundingSphere(),M})(),Y=new e.ShaderMaterial({transparent:!0,depthWrite:!1,polygonOffset:!0,polygonOffsetFactor:-2,polygonOffsetUnits:-2,uniforms:{strength:{value:.75}},vertexShader:`attribute float alpha; varying float vA; void main(){ vA = alpha;
      #ifdef USE_INSTANCING
        vec4 p = modelMatrix * instanceMatrix * vec4(position, 1.);
      #else
        vec4 p = modelMatrix * vec4(position, 1.);
      #endif
      gl_Position = projectionMatrix * viewMatrix * p; }`,fragmentShader:"uniform float strength; varying float vA; void main(){ gl_FragColor = vec4(0.06, 0.025, 0.012, vA * vA * strength); }"}),ae=(()=>{let s=k({kind:1,variant:1});s.box(0,.03,0,1.04,.06,1.06,{kind:6,variant:0});let d=.42,v=12,m=[...Array(v+1)].map((f,F)=>{let E=F/v*Math.PI;return[.5*Math.cos(E),d+.58*Math.sin(E)]}),c=(f,F,E)=>new a(f,E,F);for(let f of[-1,1])s.quad(c(-.5,.5*f,.06),c(.5,.5*f,.06),c(.5,.5*f,d),c(-.5,.5*f,d),{kind:0,variant:1},new a(0,0,f));for(let f=0;f<v;f++){let[F,E]=m[f],[I,Q]=m[f+1],ye=new a(0,(E+Q)/2-d,(F+I)/2);s.quad(c(-.5,F,E),c(.5,F,E),c(.5,I,Q),c(-.5,I,Q),{kind:0,variant:1},ye)}for(let f of[-1,1]){s.quad(c(.5*f,-.5,.06),c(.5*f,.5,.06),c(.5*f,.5,d),c(.5*f,-.5,d),{kind:0,variant:1},new a(f,0,0));for(let F=0;F<v;F++)s.tri(c(.5*f,0,d),c(.5*f,m[F][0],m[F][1]),c(.5*f,m[F+1][0],m[F+1][1]),{kind:0,variant:1},new a(f,0,0))}s.quad(c(.506,-.32,.06),c(.506,.32,.06),c(.506,.32,.66),c(.506,-.32,.66),{kind:1,variant:1},new a(1,0,0)),s.box(.51,.69,0,.012,.03,.7,{kind:3,variant:1});for(let f of[-1,1])s.quad(c(-.44,.506*f,.24),c(.44,.506*f,.24),c(.44,.506*f,.34),c(-.44,.506*f,.34),{kind:2,variant:1},new a(0,0,f));s.quad(c(.2,.507,.06),c(.3,.507,.06),c(.3,.507,.22),c(.2,.507,.22),{kind:1,variant:1},new a(0,0,1)),s.box(-.22,1.02,0,.12,.06,.16,{kind:3,variant:1}),s.box(.12,1.015,0,.08,.05,.1,{kind:3,variant:1}),s.box(-.38,.98,.12,.04,.09,.04,{kind:3,variant:1}),s.box(.515,.74,0,.012,.025,.06,{kind:4,variant:1}),s.box(0,.43,0,1,.74,1,{kind:0,variant:2});for(let[f,F,E,I]of[[0,.49,1,.025],[0,-.49,1,.025],[.49,0,.025,1],[-.49,0,.025,1]])s.box(f,.83,F,E,.06,I,{kind:0,variant:2});s.box(-.25,.86,.1,.18,.12,.3,{kind:3,variant:2}),s.box(.05,.84,-.18,.1,.08,.12,{kind:3,variant:2});let M=new e.PlaneGeometry(.34,.5);M.rotateX(-Math.PI/2),M.rotateZ(.25),M.translate(.28,.86,.05),s.geo(M,{kind:5,variant:2},null,!0),M.dispose(),s.quad(c(.504,-.22,.06),c(.504,.22,.06),c(.504,.22,.56),c(.504,-.22,.56),{kind:1,variant:2},new a(1,0,0));for(let f of[-1,1])s.quad(c(-.45,.504*f,.46),c(.45,.504*f,.46),c(.45,.504*f,.6),c(-.45,.504*f,.6),{kind:2,variant:2},new a(0,0,f));return s.quad(c(-.504,-.4,.46),c(-.504,.4,.46),c(-.504,.4,.6),c(-.504,-.4,.6),{kind:2,variant:2},new a(-1,0,0)),s.box(.512,.6,0,.012,.025,.06,{kind:4,variant:2}),s.build()})(),fe=`attribute float kind; attribute float variant;
`,Ge="float shv = fract(habInstHash() * 5.7) < 0.55 ? 1. : 2.; transformed *= (variant < 0.5 || abs(variant - shv) < 0.5) ? 1. : 0.;",rt=U(new e.MeshStandardMaterial({color:16777215,roughness:.62,metalness:.18,envMap:r,envMapIntensity:.5}),"shed",s=>{s.vertexShader=fe+`varying float vKind; varying vec3 vLP; varying vec3 vSc; varying vec3 vN0;
`+Ma+s.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
      ${Ge}
      vKind = kind; vLP = position; vN0 = normal;
      #ifdef USE_INSTANCING
        vSc = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz));
      #else
        vSc = vec3(length(modelMatrix[0].xyz), length(modelMatrix[1].xyz), length(modelMatrix[2].xyz));
      #endif`),s.fragmentShader=`uniform float night; varying float vKind; varying vec3 vLP; varying vec3 vSc; varying vec3 vN0;
`+bo+s.fragmentShader.replace("#include <color_fragment>",`#include <color_fragment>
      vec3 m = vLP * vSc; float ax = abs(vN0.x) > 0.5 ? m.z : m.x;
      float win = 0., lamp = 0., solar = 0.;
      if (vKind < 0.5) {
        diffuseColor.rgb *= 1. - 0.24 * (1. - smoothstep(0.015, 0.05, abs(fract(ax / 1.6) - 0.5) - 0.44));       // rib / panel seams
        diffuseColor.rgb *= 1. - 0.07 * (1. - smoothstep(0.004, 0.03, abs(fract(m.y / 0.9) - 0.5) - 0.46)) * step(abs(vN0.y), 0.5);
      } else if (vKind < 1.5) {
        diffuseColor.rgb *= 0.52 * (0.82 + 0.18 * smoothstep(0.06, 0.2, abs(fract(m.y / 0.3) - 0.5)));            // roller door slats
      } else if (vKind < 2.5) {
        float mu = step(0.44, abs(fract(m.x / 1.4) - 0.5)); win = 1. - mu;
        diffuseColor.rgb = mix(vec3(0.05, 0.055, 0.065), vec3(0.3), mu);
      } else if (vKind < 3.5) { diffuseColor.rgb *= 0.55; }
      else if (vKind < 4.5) { lamp = 1.; }
      else if (vKind < 5.5) { solar = 1.; diffuseColor.rgb = vec3(0.03, 0.045, 0.09); }
      else { diffuseColor.rgb *= vec3(0.42, 0.38, 0.34); }
      diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(0.92, 0.66, 0.48), (1. - smoothstep(0.1, 1.3, m.y)) * 0.6 * step(vKind, 1.5));`).replace("#include <roughnessmap_fragment>",`#include <roughnessmap_fragment>
      roughnessFactor = mix(roughnessFactor, 0.15, max(win, solar));`).replace("#include <metalnessmap_fragment>",`#include <metalnessmap_fragment>
      metalnessFactor = mix(metalnessFactor, 0.6, max(win, solar));`).replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>
      float bay = step(0.3, fract(floor(m.x / 1.4) * 0.618 + vSc.x * 0.37));
      totalEmissiveRadiance += vec3(1., 0.66, 0.36) * win * habLit(fract(vSc.x * 0.37 + vSc.y * 1.31), floor(m.x / 1.4) * 0.11) * (0.4 + 1.8 * bay) + vec3(1., 0.85, 0.6) * lamp * (0.4 + 4. * night);`).replace("#include <lights_fragment_maps>",Ua)}),Oe=R("shed",fe,Ge);function Ue(s,{remap:d=0,baryMull:v=!0,color:m=9082530}={}){return U(new e.MeshStandardMaterial({color:m,roughness:.035,metalness:.9,envMap:r,envMapIntensity:1.4,transparent:!0,depthWrite:!1,emissive:16777215,emissiveIntensity:0}),s,c=>{c.vertexShader=(v?`attribute vec3 bary; varying vec3 vBary;
`:"")+`varying float vGY;
`+(`varying float vOh;
`+Ma)+c.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
        ${v?"vBary = bary;":""} vGY = position.y; vOh = habInstHash();`),c.fragmentShader=(v?`varying vec3 vBary;
`:"")+`uniform float night; varying float vGY;
varying float vOh;
`+bo+c.fragmentShader.replace("#include <color_fragment>",`#include <color_fragment>
        float mull = ${v?"1. - smoothstep(0.035, 0.08, min(min(vBary.x, vBary.y), vBary.z))":"0."};
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.16, 0.15, 0.14), mull);`).replace("#include <roughnessmap_fragment>",`#include <roughnessmap_fragment>
        roughnessFactor = mix(roughnessFactor, 0.5, mull);`).replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>
        totalEmissiveRadiance = emissive * vec3(1., 0.6, 0.3) * (1. - mull);
        totalEmissiveRadiance += vec3(1., 0.58, 0.26) * habLit(vOh, 0.31) * 0.22 * (1. - mull) * (1.2 - vGY);`).replace("#include <lights_fragment_maps>",Ua).replace("#include <opaque_fragment>",`
        // the sun glint on near-mirror glass overflows half float (inf), which bloom/DOF smear into a hard square: cap it
        outgoingLight = min(outgoingLight, vec3(12.));
        float fr = pow(1. - clamp(abs(dot(normalize(vViewPosition), normal)), 0., 1.), 2.2);
        float lum = dot(outgoingLight, vec3(0.3, 0.59, 0.11));
        diffuseColor.a = ${d?`clamp(opacity / ${d.toFixed(3)}, 0., 1.)`:"opacity"} * clamp(max(max(mix(0.5, 1., fr), lum * 1.4), mull), 0., 1.);
        #include <opaque_fragment>`)})}let Xe=z(8),zt=(()=>{let s=k({kind:1});return Xe.edges.forEach(([d,v])=>T(s,Xe.verts[d],Xe.verts[v],1,.0042,.006,.005,{kind:0})),Xe.verts.forEach(d=>W(s,d,1,.009,.008,{kind:1},5)),s.build()})(),xt=(()=>{let s=k({bary:3});return Xe.faces.forEach(d=>{let v=d.v.map(M=>d.c.clone().lerp(M,.97).multiplyScalar(.994)),m=d.c.clone().normalize(),c=l(m,.02).sub(m);s.tri(v[0],v[1],v[2],{bary:N},d.c,v.map(M=>M.clone().normalize().add(c).normalize()))}),s.build()})(),Nt=new e.SphereGeometry(.975,28,10,0,Math.PI*2,0,Math.PI/2),Bt=(()=>{let s=k({color:3,kind:1}),d=(m,c,M=!0)=>{s.geo(m,c,f=>f.y<-.5,M),m.dispose()};{let m=new e.CircleGeometry(.985,40);m.rotateX(-Math.PI/2),m.translate(0,.004,0),d(m,{color:[.5,.43,.36]})}let v=[[.62,.05],[.48,.1],[.34,.15]];v.forEach(([m,c])=>{let M=new e.CylinderGeometry(m,m*1.02,c,28);M.translate(0,c/2,0),d(M,{color:(f,F)=>F.y>.5?[.16+B()*.05,.22+B()*.05,.07]:[.62,.57,.5]})});{let m=new e.CylinderGeometry(.065,.085,.6,10);m.translate(0,.3,0),d(m,{color:[.82,.8,.76]})}for(let m of[.24,.36,.48]){let c=new e.CylinderGeometry(.083-m*.03,.083-m*.03,.035,10,1,!0);c.translate(0,m,0),d(c,{color:[.05,.05,.06],kind:1})}for(let m=0;m<7;m++){let c=m/7*Math.PI*2+.3,M=.78+m%2*.06,f=.08+m%3*.05,F=Math.cos(c)*M,E=Math.sin(c)*M,I=new e.BoxGeometry(.11,f,.09);I.rotateY(-c),I.translate(F,f/2,E),d(I,{color:[.84,.82,.78]});let Q=new e.BoxGeometry(.114,.02,.094);Q.rotateY(-c),Q.translate(F,f*.62,E),d(Q,{color:[.05,.05,.06],kind:1})}for(let m=0;m<44;m++){let c=m%3,[M,f]=v[c],F=(c===2?.12:v[c+1][0]+.03)+B()*(M-(c===2?.16:v[c+1][0]+.06)),E=B()*6.28,I=.018+B()*.016,Q=new e.IcosahedronGeometry(I,0);Q.scale(1,1.4,1),Q.translate(Math.cos(E)*F,f+I*1.2,Math.sin(E)*F);let ye=B();s.geo(Q,{color:[.12+ye*.08,.2+ye*.08,.06]},null,!0),Q.dispose()}return s.build()})(),jt=(()=>{let s=k({color:3});{let d=new e.CylinderGeometry(1.03,1.03,.03,64,1,!0);d.translate(0,.015,0),s.geo(d,{color:[.4,.36,.31]}),d.dispose()}{let d=new e.RingGeometry(.99,1.03,64);d.rotateX(-Math.PI/2),d.translate(0,.03,0),s.geo(d,{color:[.48,.42,.35]}),d.dispose()}{let d=new e.CylinderGeometry(1.035,1.11,.026,64,1,!0);d.translate(0,.013,0),s.geo(d,{color:()=>[.42+B()*.06,.2+B()*.03,.09]}),d.dispose()}return s.build()})(),wt=U(new e.MeshStandardMaterial({color:14209220,roughness:.34,metalness:.6,envMap:r,envMapIntensity:.7}),"lattice",s=>{s.vertexShader=`attribute float kind; varying float vKind;
`+s.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
      vKind = kind;`),s.fragmentShader=`uniform float night; varying float vKind;
`+s.fragmentShader.replace("#include <color_fragment>",`#include <color_fragment>
      diffuseColor.rgb *= vKind > 0.5 ? 0.6 : 1.;`).replace("#include <lights_fragment_maps>",Ua)}),ct=U(new e.MeshStandardMaterial({color:16777215,vertexColors:!0,roughness:.85,metalness:.05}),"interior",s=>{s.vertexShader=`attribute float kind; varying float vKind;${` varying float vOh;
`+Ma}
`+s.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
      vKind = kind; vOh = habInstHash();`),s.fragmentShader=`uniform float night; varying float vKind; varying float vOh;
`+bo+s.fragmentShader.replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>
      totalEmissiveRadiance += vec3(1., 0.66, 0.36) * step(0.5, vKind) * (0.2 + 3.2 * habLit(vOh, 0.31));`)}),Ot=new e.MeshStandardMaterial({color:16777215,vertexColors:!0,roughness:.95});x.push(Ot);function Mt(){let s=new e.Group;s.name="bigDome";let d=new e.Mesh(zt,wt);d.name="lattice",d.castShadow=d.receiveShadow=!0,d.customDepthMaterial=new e.MeshDepthMaterial({depthPacking:e.RGBADepthPacking});let v=new e.Mesh(Bt,ct);v.name="interior",v.castShadow=v.receiveShadow=!0;let m=new e.Mesh(jt,Ot);m.name="base",m.receiveShadow=!0;let c=new e.Mesh(O,Y);c.name="skirt",c.scale.set(.9,1,.9),c.renderOrder=-1,d.add(v,m,c);let M=Ue("bigglass",{remap:.28}),f=new e.Mesh(xt,M);f.name="glass",f.receiveShadow=!0,f.castShadow=!0;let F=new e.MeshDepthMaterial({depthPacking:e.RGBADepthPacking,alphaHash:!0,opacity:0,side:e.DoubleSide});f.customDepthMaterial=F;let E=0;Object.defineProperty(M,"opacity",{get:()=>E,set:ye=>{E=ye,F.opacity=.45*Math.min(1,Math.max(0,ye/.28))},configurable:!0}),M.opacity=0;let I=new e.MeshBasicMaterial({color:16751184,transparent:!0,opacity:0,side:e.BackSide,blending:e.AdditiveBlending,depthWrite:!1});I.onBeforeCompile=ye=>{ye.uniforms.night=n,ye.vertexShader=`varying float vGY; varying float vOh;
`+Ma+ye.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
vGY = position.y; vOh = habInstHash();`),ye.fragmentShader=`uniform float night; varying float vGY; varying float vOh;
`+ts+ye.fragmentShader.replace("#include <color_fragment>",`#include <color_fragment>
diffuseColor.rgb *= 2.6 * (0.35 + 1.1 * (1. - vGY)) * habLit(vOh, 0.31) / max(night, 0.02);`)},I.customProgramCacheKey=()=>"hab-bigglow";let Q=new e.Mesh(Nt,I);return Q.name="glow",s.add(d,f,Q),s}let de=16,Ne=(()=>{let s=new e.CylinderGeometry(2.4,2.4,1,de,1,!0).rotateZ(Math.PI/2).translate(.5,0,0),d=s.toNonIndexed();return s.dispose(),d.computeVertexNormals(),d.computeBoundingSphere(),d})(),et=Ue("tube",{baryMull:!1,color:8227478});et.emissive.setRGB(1.6,1.6,1.6);let Ze=(()=>{let s=k({kind:1}),d=16,v=.11/62,m=M=>M/de*Math.PI*2,c=(M,f,F)=>new a(M,f*Math.sin(F),f*Math.cos(F));for(let M=0;M<=d;M++){let f=Math.min(1-v,Math.max(v,M/d)),F=2.53,E=2.41;for(let I=0;I<de;I++){let Q=m(I),ye=m(I+1),Qe=(Q+ye)/2,Ve=c(0,1,Qe);s.quad(c(f-v,F,Q),c(f+v,F,Q),c(f+v,F,ye),c(f-v,F,ye),{kind:0},Ve),s.quad(c(f-v,E,Q),c(f+v,E,Q),c(f+v,E,ye),c(f-v,E,ye),{kind:0},Ve.clone().negate());for(let ze of[-1,1])s.quad(c(f+ze*v,E,Q),c(f+ze*v,F,Q),c(f+ze*v,F,ye),c(f+ze*v,E,ye),{kind:0},new a(ze,0,0))}if(M%2===0||M===d)for(let I of[-1.1,1.1])s.box(f,-2.52,I,v*5,.16,.7,{kind:3})}s.box(.5,-1.8,0,1,.12,3.1,{kind:1});for(let M of[-1.42,1.42])s.box(.5,-1.72,M,1,.04,.08,{kind:2});for(let M of[-2.1,2.1])s.box(.5,-1.05,M,1,.08,.08,{kind:0});return s.build()})(),He=U(new e.MeshStandardMaterial({color:13814462,roughness:.4,metalness:.55,envMap:r,envMapIntensity:.7}),"rib",s=>{s.vertexShader=`attribute float kind; varying float vKind;
`+s.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
      vKind = kind;`),s.fragmentShader=`uniform float night; varying float vKind;
`+s.fragmentShader.replace("#include <color_fragment>",`#include <color_fragment>
      diffuseColor.rgb *= vKind > 0.5 && vKind < 1.5 ? vec3(0.55, 0.5, 0.45) : (vKind > 2.5 ? vec3(0.45, 0.4, 0.36) : vec3(1.));`).replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>
      totalEmissiveRadiance += vec3(1., 0.72, 0.45) * step(1.5, vKind) * (1. - step(2.5, vKind)) * (0.2 + 3. * night);`).replace("#include <lights_fragment_maps>",Ua)});[H,Se,pe,we,Be,_e,D,h,O,ae,Ne,Ze,zt,xt,Bt,jt].forEach(s=>s.computeBoundingSphere()),Object.assign(L,{habShell:S(H),habGlass:S(Se),habFrame:S(Be),ringPad:S(D),skirt:S(O),shed:S(ae),tube:S(Ne),rib:S(Ze),bigDome:{lattice:S(zt),glass:S(xt),glow:S(Nt),interior:S(Bt),base:S(jt)}});function Ee(s){[...x,et].forEach(d=>{"envMap"in d&&d!==Ot&&d!==$&&d!==ct&&(d.envMap=s,d.needsUpdate=!0)})}return{night:n,tris:L,setEnv:Ee,habShellGeo:H,habShellMat:C,habShellDepthMat:J,habShellGeoHi:pe,habShellMatFar:A,habGlassGeo:Se,habGlassMat:j,habGlassGeoHi:we,habGlassMatFar:te,habFrameGeo:Be,habFrameMat:w,habFrameDepthMat:_,habFrameGeoFar:_e,ringPadGeo:D,ringPadGeoFar:h,ringPadMat:$,skirtGeo:O,skirtMat:Y,bigDome:Mt,shedGeo:ae,shedMat:rt,shedDepthMat:Oe,tubeGeo:Ne,tubeMat:et,ribGeo:Ze,ribMat:He}}var la={x:0,y:-6e3,z:0},Nr=.1,_t={land:[[55,-150],[15,-168]],build:[-25,-100]},rs=`
float h3(vec3 p){p=fract(p*0.3183099+.1);p*=17.0;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float n3(vec3 x){vec3 i=floor(x);vec3 f=fract(x);f=f*f*(3.0-2.0*f);
return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),
mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n3(p);p*=2.03;a*=.5;}return v;}`;function ns({THREE:e,renderer:t,scene:r,cam:u,planets:a,sunLight:n,ambient:L,hemi:x,files:k,HIGH:S,lateRockets:B,lodPath:z}){let T=new e.Vector3(la.x,la.y,la.z),W=k.dtmN||512,l=new e.Group;l.position.copy(T),l.visible=!1,r.add(l),n.castShadow=!0;{let we=n.shadow,Ce=we.camera;we.mapSize.set(S?4096:2048,S?2048:1024),we.bias=-5e-4,we.normalBias=.35,Ce.left=-390,Ce.right=390,Ce.near=60,Ce.far=1300}r.fog=new e.Fog(0,1e8,1e9);let N=(()=>{let we=7;return()=>(we=we*16807%2147483647)/2147483647})(),U=new e.Vector3,R=0,Z=null,ie=null,Le=Promise.all([import("./rockets-NJ46RRYQ.js"),import("./foot-model-starship-NEVPLWKG.js"),import("./foot-model-kit-OAHIXROD.js")]).then(([we,Ce,ue])=>ie={createRockets:we.createRockets,foot:{buildStarships:Ce.buildStarships,mergeAll:ue.mergeAll,steel:{STEEL_FLAT:Ce.STEEL_FLAT,steelUniforms:Ce.steelUniforms,steelShader:Ce.steelShader}}}).catch(we=>console.warn("film rockets:",we)),me={tDtm:{value:null},tHi:{value:null},tCtx:{value:null},uOn:{value:new e.Vector3(0,0,0)},uHB0:{value:0},tMars:a.mars.material.uniforms.tMap},X=a.air&&a.air.uniforms.dome||{uSun:{value:new e.Vector3(0,1,0)},uK:{value:1},uAmb:{value:1},uOrigin:{value:T.clone()}},re=[0,0,0],We=500;{let we=(Ce,ue,De)=>{let Be=new e.DataTexture(new Uint8Array([Ce,ue,De,255]),1,1);return Be.needsUpdate=!0,Be};me.tDtm.value=we(128,0,0),me.tHi.value=we(128,128,128),me.tCtx.value=we(128,128,128)}function xe(we){let Ce=new e.WebGLRenderTarget(4,1,{depthBuffer:!1,minFilter:e.NearestFilter,magFilter:e.NearestFilter,generateMipmaps:!1}),ue=new e.ShaderMaterial({uniforms:{tDtm:{value:we}},toneMapped:!1,depthTest:!1,depthWrite:!1,vertexShader:"void main(){ gl_Position=vec4(position.xy,0.,1.); }",fragmentShader:`uniform sampler2D tDtm; void main(){ float k=floor(gl_FragCoord.x); vec2 o=vec2(mod(k,2.),floor(k*.5));
      vec2 uv=(vec2(${W/2-.5})+o)/${W}.; gl_FragColor=texture2D(tDtm,vec2(uv.x*.5+.5,uv.y)); }`}),De=new e.Mesh(new e.PlaneGeometry(2,2),ue),Be=new e.Scene;De.frustumCulled=!1,Be.add(De);let _e=new Uint8Array(16),ee=t.getRenderTarget();t.setRenderTarget(Ce),t.render(Be,u),t.readRenderTargetPixels(Ce,0,0,4,1,_e),t.setRenderTarget(ee),Ce.dispose(),ue.dispose(),De.geometry.dispose();let V=A=>(_e[A*4]*256+_e[A*4+1])/65535;return-2664.712+352.3924*(((V(0)+V(1))/2+(V(2)+V(3))/2)/2)}let Me=null;function le(){if(Me)return Me;let we=t.capabilities.getMaxAnisotropy(),Ce=De=>{try{t.initTexture(De)}catch{}},ue=(De,Be,_e)=>new Promise(ee=>{if(!De)return ee();xa(e,De,{flipY:!0}).then(V=>{_e(V),Ce(V),re[Be]=performance.now(),ee()},()=>ee())});return Me=Promise.all([ue(k.dtm,0,De=>{De.colorSpace=e.NoColorSpace,De.magFilter=De.minFilter=e.NearestFilter,De.generateMipmaps=!1,De.flipY=!0,me.tDtm.value=De,me.uHB0.value=xe(De)}),ue(k.hiBump,1,De=>{De.colorSpace=e.NoColorSpace,De.anisotropy=we,me.tHi.value=De}),ue(k.ctxBump,2,De=>{De.colorSpace=e.NoColorSpace,De.anisotropy=we,me.tCtx.value=De})])}let ce=()=>{let we=performance.now(),Ce=ue=>ue?mt(we-ue,0,We):0;me.uOn.value.set(Ce(re[0]),Ce(re[1]),Ce(re[2]))};function*P(){le();let we=`
uniform sampler2D tDtm, tHi, tCtx, tMars; uniform vec3 uOn; uniform float uHB0; // uHB0 = hB(vec2(0.)), read back once after the DTM loads
// 16-bit heights live in R (hi byte) and G (lo byte); filter by hand so the bytes never blend across a carry
float dtmTap(vec2 uv, float side){ vec2 t=vec2(uv.x*.5+side*.5, uv.y); vec4 c=texture2D(tDtm,t); return (c.r*255.*256.+c.g*255.)/65535.; }
float dtmBil(vec2 uv, float side){ vec2 p=uv*${W}.-.5, f=fract(p), i=floor(p);
  float a=dtmTap((i+vec2(.5,.5))/${W}.,side), b=dtmTap((i+vec2(1.5,.5))/${W}.,side), c=dtmTap((i+vec2(.5,1.5))/${W}.,side), d=dtmTap((i+vec2(1.5,1.5))/${W}.,side);
  return mix(mix(a,b,f.x),mix(c,d,f.x),f.y); }
float hA(vec2 p){ return -2621.547+62.5074*dtmBil(vec2(p.x/1600.+.5,.5-p.y/1600.),0.); }   // HiRISE DTM, metres (areoid)
float hB(vec2 p){ return -2664.712+352.3924*dtmBil(vec2(p.x/12000.+.5,.5-p.y/12000.),1.); } // CTX DTM
float terrH(vec2 p){
  float b=hB(p), a=hA(p), wa=1.-smoothstep(560.,780.,max(abs(p.x),abs(p.y)));
  float h=mix(b,a,wa)-uHB0;
  float d=length(p);
  return uOn.x*h*smoothstep(330.,620.,d)            // the city's graded pad eases back into the real ground
    *(1.-smoothstep(JF0,JF1,d));                      // and the far band flattens onto the sky dome's ground (no step at the mesh edge)
}`,Ce=`const float JF0=3300., JF1=4400.;
`;{let p=S?420:210,oe=p+1,ge=9e3,Te=ge/p,Ae=new Float32Array(oe*oe*3),at=new Uint32Array(p*p*6);for(let Ct=0,Vt=0;Ct<oe;Ct++){let je=-ge/2+Ct*Te;for(let Ie=0;Ie<oe;Ie++,Vt+=3)Ae[Vt]=-ge/2+Ie*Te,Ae[Vt+2]=je}for(let Ct=0,Vt=0;Ct<p;Ct++)for(let je=0;je<p;je++,Vt+=6){let Ie=je+oe*Ct,Ut=Ie+oe,Xt=Ut+1,ra=Ie+1;at[Vt]=Ie,at[Vt+1]=Ut,at[Vt+2]=ra,at[Vt+3]=Ut,at[Vt+4]=Xt,at[Vt+5]=ra}let kt=new e.BufferGeometry;kt.setIndex(new e.BufferAttribute(at,1)),kt.setAttribute("position",new e.BufferAttribute(Ae,3)),kt.boundingSphere=new e.Sphere(new e.Vector3,ge*.7072),kt.boundingBox=new e.Box3(new e.Vector3(-ge/2,0,-ge/2),new e.Vector3(ge/2,0,ge/2));let Tt=new e.MeshStandardMaterial({roughness:.95,metalness:0});Tt.customProgramCacheKey=()=>"jezeroTerrain",Tt.onBeforeCompile=Ct=>{Object.assign(Ct.uniforms,me),Object.assign(Ct.uniforms,{uJSun:X.uSun,uJK:X.uK,uJAmb:X.uAmb,uJOrigin:X.uOrigin}),Ct.vertexShader=Ce+we+`
varying vec3 vTP; varying vec3 vTN;
`+Ct.vertexShader.replace("#include <beginnormal_vertex>",`vec3 objectNormal; { vec2 p=position.xz; float e=8.;
          objectNormal=normalize(vec3(-(terrH(p+vec2(e,0.))-terrH(p-vec2(e,0.)))/(2.*e),1.,-(terrH(p+vec2(0.,e))-terrH(p-vec2(0.,e)))/(2.*e))); vTN=objectNormal; }
        #ifdef USE_TANGENT
          vec3 objectTangent = vec3( tangent.xyz );
        #endif`).replace("#include <begin_vertex>",`#include <begin_vertex>
transformed.y+=terrH(position.xz)-dot(position.xz,position.xz)/(2.*3389500.); vTP=transformed;`),Ct.fragmentShader=Ce+we+`
varying vec3 vTP; varying vec3 vTN;
uniform vec3 uJSun, uJOrigin; uniform float uJK, uJAmb;
`+rs+Lr+`
      // greyscale orbital images -> height for shading only
      float bumpL(vec2 p){ float a=uOn.y*(1.-smoothstep(640.,790.,max(abs(p.x),abs(p.y)))), b=uOn.z*(1.-smoothstep(5000.,5900.,max(abs(p.x),abs(p.y))));
        float hb=texture2D(tCtx,vec2(p.x/12000.+.5,.5-p.y/12000.)).r, ha=texture2D(tHi,vec2(p.x/1600.+.5,.5-p.y/1600.)).r;
        return mix(.5,mix(hb,ha,a),max(a,b)); }
      // fbm with each octave faded to its mean once it nears a pixel (fw = base-octave cycles per pixel): no far shimmer
      float fbmBL(vec3 p, float fw){ float v=0.,a=.5; for(int i=0;i<5;i++){ float k=1.-smoothstep(.3,.6,fw); v+=a*(k>0.? mix(.5,n3(p),k) : .5); p*=2.03; fw*=2.03; a*=.5; } return v; }
      vec3 tA; float tR;
    `+Ct.fragmentShader.replace("#include <color_fragment>",`#include <color_fragment>
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
          diffuseColor.rgb=tA; }`).replace("#include <roughnessmap_fragment>",`#include <roughnessmap_fragment>
roughnessFactor=tR;`).replace("#include <fog_fragment>",`#ifdef USE_FOG
        { vec3 roF=cameraPosition-uJOrigin, dvF=vTP-roF; float dF=length(dvF);           // sky.js jezHaze: the dome's floor hazes the same way
          gl_FragColor.rgb=mix(gl_FragColor.rgb,jezHazeCol(dvF/dF,normalize(uJSun),uJK),jezHaze(dF,roF.y,fogNear,fogFar)); }
        #endif`).replace("#include <dithering_fragment>",`#include <dithering_fragment>
        { float fwJ=max(length(fwidth(vTP.xz)),1.), wJ=smoothstep(JF0,JF1,length(vTP.xz));   // fwidth in uniform flow
          if(wJ>0.){ vec3 ro=cameraPosition-uJOrigin, dv=vTP-ro, sJ=normalize(uJSun); float dJ=length(dv);
            vec3 gJ=mix(jezLit(vec3(vTP.x,0.,vTP.z),fwJ,sJ,uJAmb),jezHazeCol(dv/dJ,sJ,uJK),jezHaze(dJ,ro.y,fogNear,fogFar)); // the same haze as the mesh: only the ground shading blends
            gl_FragColor.rgb=mix(gl_FragColor.rgb,gJ,wJ); } }`).replace("#include <normal_fragment_maps>",`#include <normal_fragment_maps>
        { vec2 p=vTP.xz; float w=max(length(fwidth(p)),1e-3), e=max(.3,w*.7);
          float gx=(bumpL(p+vec2(e,0.))-bumpL(p-vec2(e,0.)))/(2.*e), gz=(bumpL(p+vec2(0.,e))-bumpL(p-vec2(0.,e)))/(2.*e);
          float k=mix(9.,2.5,smoothstep(1.,6.,w));                          // metres of relief per unit brightness, gentler when far
          // pebbles + wind ripples up close
          float fade=1.-smoothstep(.15,.8,w);
          if(fade>.001){ float r=sin(dot(p,vec2(.9,.43))*2.6+fbm(vec3(p*.2,2.))*6.)*.5+.5;
            gx+=fade*(fbm(vec3(p*3.,5.))-.5)*.6+fade*r*.08; gz+=fade*(fbm(vec3(p*3.+9.,5.))-.5)*.6; }
          normal=normalize(normal+(viewMatrix*vec4(-gx*k*.1,0.,-gz*k*.1,0.)).xyz); }`)};let It=new e.Mesh(kt,Tt);It.receiveShadow=!0,l.add(It)}let ue={sunDir:{value:new e.Vector3},night:{value:0}},De=new e.Mesh(new e.SphereGeometry(7e3,48,24),new e.ShaderMaterial({side:e.BackSide,depthWrite:!1,fog:!1,uniforms:ue,vertexShader:"varying vec3 vD; void main(){ vD=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }",fragmentShader:`uniform vec3 sunDir; uniform float night; varying vec3 vD; ${rs}
  void main(){ float e=clamp(vD.y,0.,1.), sd=max(dot(vD,sunDir),0.);
    vec3 dayC=mix(vec3(0.78,0.54,0.36),vec3(0.36,0.22,0.15),pow(e,0.6));
    vec3 duskC=mix(vec3(0.2,0.14,0.13),vec3(0.015,0.015,0.03),pow(e,0.45));
    vec3 c=mix(dayC,duskC,night)+vec3(0.3,0.5,0.9)*pow(sd,22.)*(0.2+night*0.55)+vec3(0.5,0.6,0.8)*pow(sd,160.)*0.6;
    c+=vec3(0.9)*step(0.9975,h3(floor(vD*500.)))*smoothstep(0.5,1.,night)*smoothstep(0.05,0.3,e);
    gl_FragColor=vec4(c,1.); }`}));l.add(De),yield;let Be=[62,132,204],_e=8,ee=[[0,0,20,.02]],V=[];for(let p=0;p<4;p++){let oe=Math.PI/8+p*Math.PI/2;ee.push([Math.cos(oe)*96,Math.sin(oe)*96,15,.26+p*.08]),V.push(oe)}let C=(p,oe)=>Math.abs(((p-oe)%(Math.PI*2)+Math.PI*3)%(Math.PI*2)-Math.PI),A=[],b=[];for(let p=34;p<238;p+=14){let oe=p*.11;for(;oe<p*.11+Math.PI*2-.05;){let ge=Math.min(6.6,2.6+N()*3.2+5*Math.exp(-p/70)),Te=Math.cos(oe)*p,Ae=Math.sin(oe)*p,at=[...Array(_e)].some((It,Ct)=>C(oe,Ct*Math.PI/4)*p<ge+4),kt=p<86&&V.some(It=>C(oe,It)*p<ge+3.5);if(!(at||kt||Be.some(It=>Math.abs(p-It)<ge+3.5)||ee.some(([It,Ct,Vt])=>Math.hypot(Te-It,Ae-Ct)<Vt+ge+3))&&N()>.1){let It=.06+p/238*.58+N()*.08;p>175&&N()<.28?b.push({x:Te,z:Ae,w:8+N()*4,d:5,h:2.5+N()*2.5,rot:oe,bt:It}):A.push({x:Te,z:Ae,r:ge,ys:.72+N()*.35,rot:N()*6.28,bt:It,seed:N()*50})}oe+=(2*ge+2.6)/p}}let j={night:{value:0}},te=as({THREE:e,renderer:t});yield;let w=os({THREE:e,renderer:t,envMap:te,frameDetail:"low"});yield,A.forEach(p=>p.col=new e.Color().setHSL(.08,.06+N()*.06,.72+N()*.16)),b.forEach(p=>p.col=new e.Color().setHSL(.07,.08,.55+N()*.15));let J=(p,oe)=>p.bt-oe.bt,_=[...A].sort(J),K=[...b].sort(J);S||_.forEach((p,oe)=>p.skip=oe%2===1),_.forEach(p=>{(_t.land.some(([oe,ge])=>Math.hypot(p.x-oe,p.z-ge)<p.r+16)||Math.hypot(p.x-_t.build[0],p.z-_t.build[1])<p.r+30)&&(p.skip=!0)});let D=_.filter(p=>!p.skip),h=.028,$=z?z():[];D.forEach(p=>{let oe=1/0;for(let ge of $)oe=Math.min(oe,Math.hypot(ge.x-p.x,ge.y,ge.z-p.z));p.near=!$.length||p.r/oe>h});let O=(p,oe)=>{let ge=Math.max(1,p.length),Te=(at,kt)=>{let Tt=new e.InstancedMesh(at,kt,ge);return Tt.count=0,Tt},Ae={list:p,shell:Te(oe?w.habShellGeoHi:w.habShellGeo,oe?w.habShellMat:w.habShellMatFar),glass:Te(oe?w.habGlassGeoHi:w.habGlassGeo,oe?w.habGlassMat:w.habGlassMatFar),frame:Te(oe?w.habFrameGeo:w.habFrameGeoFar,w.habFrameMat),pad:Te(oe?w.ringPadGeo:w.ringPadGeoFar,w.ringPadMat)};return Ae.shell.customDepthMaterial=w.habShellDepthMat,Ae.glass.receiveShadow=Ae.frame.receiveShadow=!0,Ae.frame.castShadow=!1,Ae.shell.castShadow=Ae.shell.receiveShadow=Ae.pad.castShadow=Ae.pad.receiveShadow=!0,p.forEach((at,kt)=>Ae.shell.setColorAt(kt,at.col)),Ae},Y=[O(D.filter(p=>p.near),!0),O(D.filter(p=>!p.near),!1)],ae=new e.InstancedMesh(w.skirtGeo,w.skirtMat,D.length),fe=new e.InstancedMesh(w.shedGeo,w.shedMat,b.length);fe.customDepthMaterial=w.shedDepthMat,K.forEach((p,oe)=>fe.setColorAt(oe,p.col));let Ge=p=>new e.Sphere(new e.Vector3(0,10,0),p),rt=Y.flatMap(p=>[p.shell,p.glass,p.frame,p.pad]);[...rt,ae,fe].forEach(p=>p.boundingSphere=Ge(270)),yield,l.add(...rt,ae,fe),fe.castShadow=fe.receiveShadow=!0;let Oe=[],Ue=[],Xe=[];Be.forEach(p=>{let oe=[];for(let ge=0;ge<=200;ge++){let Te=ge/200*Math.PI*2;if(oe.push(new e.Vector3(Math.cos(Te)*p,.4,Math.sin(Te)*p)),ge%2===0)for(let Ae of[-2.6,2.6])Oe.push(Math.cos(Te)*(p+Ae),1.6,Math.sin(Te)*(p+Ae)),Ue.push(.04+p/236*.55+ge/200*.08)}Xe.push([oe,.02+p/236*.55])});for(let p=0;p<_e;p++){let oe=p*Math.PI/4,ge=[new e.Vector3(Math.cos(oe)*20,.4,Math.sin(oe)*20),new e.Vector3(Math.cos(oe)*250,.4,Math.sin(oe)*250)];Xe.push([ge,0]);for(let Te=24;Te<250;Te+=4)for(let Ae of[-3,3])Oe.push(Math.cos(oe)*Te+Math.cos(oe+1.5708)*Ae,1.6,Math.sin(oe)*Te+Math.sin(oe+1.5708)*Ae),Ue.push(.02+Te/250*.62)}let zt=Xe.map(([p,oe])=>{let ge=new e.Line(new e.BufferGeometry().setFromPoints(p),new e.LineBasicMaterial({color:16756848,transparent:!0,opacity:0}));return ge.userData.bt=oe,l.add(ge),ge}),xt={g:{value:0},night:{value:0},t:{value:0}},Nt=(p,oe)=>new e.ShaderMaterial({transparent:!0,depthWrite:!1,blending:e.AdditiveBlending,uniforms:xt,vertexShader:p,fragmentShader:oe}),Bt="varying vec3 vC; varying float vA; void main(){ float d=length(gl_PointCoord-.5); gl_FragColor=vec4(vC*vA*smoothstep(.5,.05,d)*2.4,1.); }";{let p=new e.BufferGeometry;p.setAttribute("position",new e.Float32BufferAttribute(Oe,3)),p.setAttribute("bt",new e.Float32BufferAttribute(Ue,1)),l.add(new e.Points(p,Nt("attribute float bt; uniform float g; uniform float night; varying vec3 vC; varying float vA; void main(){ vec4 mv=modelViewMatrix*vec4(position,1.); vC=vec3(1.,0.66,0.3); vA=smoothstep(bt,bt+0.025,g)*(0.15+0.85*night); gl_PointSize=clamp(520./-mv.z,1.2,6.); gl_Position=projectionMatrix*mv; }",Bt)))}{let p=[],oe=[];A.filter(Te=>Te.r>5).forEach(Te=>{let Ae=N();Te.skip||(p.push(Te.x,Te.r*Te.ys+.6,Te.z),oe.push(Te.bt+.16,Ae))});let ge=new e.BufferGeometry;ge.setAttribute("position",new e.Float32BufferAttribute(p,3)),ge.setAttribute("bs",new e.Float32BufferAttribute(oe,2)),l.add(new e.Points(ge,Nt("attribute vec2 bs; uniform float g; uniform float t; uniform float night; varying vec3 vC; varying float vA; void main(){ vec4 mv=modelViewMatrix*vec4(position,1.); vC=vec3(1.,0.12,0.06); vA=step(bs.x,g)*step(0.55,fract(t*0.7+bs.y))*(0.3+0.7*night)*1.6; gl_PointSize=clamp(900./-mv.z,2.,9.); gl_Position=projectionMatrix*mv; }",Bt)))}let jt=new e.SphereGeometry(1,32,14,0,Math.PI*2,0,Math.PI/2),wt=ee.map(([p,oe,ge,Te])=>{let Ae=w.bigDome();return Ae.position.set(p,0,oe),Ae.scale.setScalar(ge),l.add(Ae),{g:Ae,lattice:Ae.getObjectByName("lattice"),glass:Ae.getObjectByName("glass"),glow:Ae.getObjectByName("glow"),bt:Te}}),ct=V.map((p,oe)=>{let ge=new e.Group;ge.position.set(Math.cos(p)*19,2.6,Math.sin(p)*19),ge.rotation.y=-p;let Te=new e.Mesh(w.ribGeo,w.ribMat);return Te.castShadow=Te.receiveShadow=!0,ge.add(new e.Mesh(w.tubeGeo,w.tubeMat),Te),l.add(ge),{g:ge,bt:.12+oe*.07}}),Ot=[];for(let p=262;p<345;p+=4.2)for(let oe=.25;oe<1.35;oe+=3.2/p)Ot.push({x:Math.cos(oe)*p,z:Math.sin(oe)*p,bt:.22+(p-262)/83*.22+(oe-.25)*.12});Ot.sort(J);let Mt=new e.InstancedMesh(new e.BoxGeometry(3,.1,2.2).translate(0,1.2,0),new e.MeshStandardMaterial({color:1451068,metalness:.85,roughness:.22,emissive:330260}),Ot.length);Mt.castShadow=Mt.receiveShadow=!0,Mt.boundingSphere=Ge(360),l.add(Mt),yield;let de=new e.MeshStandardMaterial({color:15770458,emissive:3807744,roughness:.6}),Ne=A.filter(p=>p.r>4.2&&!p.skip),et=Ne.filter((p,oe)=>oe%Math.max(1,Math.floor(Ne.length/20))===3).slice(0,20).map((p,oe)=>{let ge=new e.Group;ge.position.set(p.x+p.r+2,0,p.z+2);let Te=Math.max(22,p.r*p.ys+16),Ae=new e.Mesh(new e.BoxGeometry(1,Te,1).translate(0,Te/2,0),de),at=new e.Group;return at.position.y=Te,at.add(new e.Mesh(new e.BoxGeometry(30,.8,.8).translate(8,0,0),de),new e.Mesh(new e.BoxGeometry(3,2.2,2).translate(-6,-.8,0),de),new e.Mesh(new e.BoxGeometry(.08,10,.08).translate(18,-5,0),de)),ge.add(Ae,at),ge.traverse(kt=>{kt.isMesh&&(kt.castShadow=!0)}),l.add(ge),{g:ge,jib:at,bt:p.bt,ph:oe*1.7}}),Ze=null,He=(p=!0)=>Ze=ie.createRockets({THREE:e,foot:ie.foot,colony:l,envMap:te,high:S,sites:_t,light:p});yield,ie?He():Le.then(()=>{ie&&(He(!1),B(Ze))}),yield;let Ee=yn({THREE:e,colony:l,layout:es({high:S,rockets:!0}),envMap:te,high:S,arrive:Nr,hideLines:zt,solar:Mt}),s=-1,d=new e.Matrix4,v=new e.Quaternion,m=new e.Vector3(0,1,0),c=new e.Vector3,M=new e.Vector3,f=new e.Quaternion,F=new e.Color,E=new e.Color(.78,.54,.36),I=new e.Color(.2,.14,.13),Q=new e.Quaternion().setFromEuler(new e.Euler(0,0,.5)),ye=(p,oe)=>{let ge=0;for(;ge<p.length&&p[ge].bt<oe;)ge++;return ge},Qe=e.MathUtils.degToRad(.1),Ve=new e.Color(16773596),ze=new e.Color(1,.66,.42),he=new e.Vector3,ke=new e.Vector3,Re=new e.Vector3,ve=new e.Vector3,tt=new e.Vector3,Je=1;function it(){let p=Ze&&Ze.launch,oe=p?p.light.k:0;he.copy(U),oe>.001&&(tt.copy(p.light.pos),tt.y=Math.max(tt.y,4),he.lerp(tt.normalize(),mt(oe,0,1))),he.y=Math.max(he.y,.035),he.normalize();let ge=Math.round(Math.asin(he.y)/Qe)*Qe,Te=Math.round(Math.atan2(he.x,he.z)/Qe)*Qe;if(he.set(Math.cos(ge)*Math.sin(Te),Math.sin(ge),Math.cos(ge)*Math.cos(Te)),n.color.copy(Ve).lerp(ze,oe),n.intensity=e.MathUtils.lerp(Je,.28*(p?p.light.i:0),oe),he.equals(ke))return!1;ke.copy(he);let Ae=n.shadow.camera,at=390*Math.max(he.y,.06)+80;return Ae.top!==at&&(Ae.top=at,Ae.bottom=-at,Ae.updateProjectionMatrix()),qo(n,T,he,600,Re,ve),!0}function vt(p,oe,ge=p){ce();let Te=Math.min(p,1),Ae=Math.max(0,(Te-Nr)/(1-Nr)),at=R=mt(Ae,.35,.95),kt=e.MathUtils.lerp(.34,-.05,mt(Ae,.05,1));De.visible=!1,U.set(-Math.cos(kt),Math.sin(kt),-Math.cos(kt)*.22).normalize(),ue.sunDir.value.copy(U),ue.night.value=at,xt.g.value=Ae,xt.night.value=at,xt.t.value=oe,j.night.value=at,w.night.value=at,r.fog.color.copy(F.copy(E).lerp(I,at)),r.fog.near=500,r.fog.far=4200,Je=e.MathUtils.lerp(2.2,.1,at),L.intensity=e.MathUtils.lerp(.5,.1,at),x.intensity=e.MathUtils.lerp(1.5,.12,at),x.color.copy(F),a.air&&a.air.hemi&&a.air.hemi(x.color),w.tubeMat.emissiveIntensity=at*.35,Ze&&Ze.update(ge,oe,at),Ee.update(Ae,oe,at,Te);for(let je=0;je<et.length;je++){let Ie=et[je];Ie.jib.rotation.y=Ie.ph+Ae*46+oe*.15}let Tt=it();if(Math.abs(Te-s)<1e-4)return Tt;s=Te;for(let je=0;je<Y.length;je++){let Ie=Y[je],Ut=Ie.list,Xt=ye(Ut,Ae),ra=ye(Ut,Ae-.02),ua=ye(Ut,Ae-.07);for(let ne=0;ne<Xt;ne++){let se=Ut[ne],qe=aa((Ae-se.bt)/.03),ut=aa((Ae-se.bt-.02)/.06),$e=aa((Ae-se.bt-.07)/.08);v.setFromAxisAngle(m,se.rot),d.compose(c.set(se.x,0,se.z),v,M.set(se.r,qe,se.r)),Ie.pad.setMatrixAt(ne,d),ne<ra&&(d.compose(c.set(se.x,.45,se.z),v,M.set(se.r*1.015,se.r*se.ys*ut*1.015,se.r*1.015)),Ie.frame.setMatrixAt(ne,d)),ne<ua&&(d.compose(c.set(se.x,.45,se.z),v,M.set(se.r,se.r*se.ys*$e,se.r)),Ie.shell.setMatrixAt(ne,d),Ie.glass.setMatrixAt(ne,d))}Ie.pad.count=Xt,Ie.frame.count=ra,Ie.shell.count=Ie.glass.count=ua,Ie.shell.instanceMatrix.needsUpdate=Ie.glass.instanceMatrix.needsUpdate=Ie.frame.instanceMatrix.needsUpdate=Ie.pad.instanceMatrix.needsUpdate=!0}let It=ye(D,Ae);for(let je=0;je<It;je++){let Ie=D[je];v.setFromAxisAngle(m,Ie.rot),d.compose(c.set(Ie.x,0,Ie.z),v,M.set(Ie.r,aa((Ae-Ie.bt)/.03),Ie.r)),ae.setMatrixAt(je,d)}ae.count=It;let Ct=ye(K,Ae-.04);for(let je=0;je<Ct;je++){let Ie=K[je],Ut=aa((Ae-Ie.bt-.04)/.07);v.setFromAxisAngle(m,-Ie.rot),d.compose(c.set(Ie.x,0,Ie.z),v,M.set(Ie.w,Ie.h*Ut,Ie.d)),fe.setMatrixAt(je,d)}fe.count=Ct,ae.instanceMatrix.needsUpdate=fe.instanceMatrix.needsUpdate=!0;let Vt=ye(Ot,Ae);for(let je=0;je<Vt;je++){let Ie=Ot[je],Ut=aa((Ae-Ie.bt)/.04);d.compose(c.set(Ie.x,0,Ie.z),Q,M.set(1,Ut,1)),Mt.setMatrixAt(je,d)}return Mt.count=Vt,Mt.instanceMatrix.needsUpdate=!0,zt.forEach(je=>je.material.opacity=mt(Ae,je.userData.bt,je.userData.bt+.06)*(.15+.85*at)),wt.forEach(je=>{let Ie=aa((Ae-je.bt)/.1),Ut=mt(Ae,je.bt+.1,je.bt+.18);je.lattice.scale.set(1,Math.max(.001,Ie),1),je.g.visible=Ie>0,je.glass.material.opacity=Ut*.28,je.glow.material.opacity=Ut*at*.28}),ct.forEach(je=>{let Ie=aa((Ae-je.bt)/.08);je.g.scale.set(Math.max(.001,Ie*62),1,1),je.g.visible=Ie>0}),et.forEach(je=>{let Ie=Math.min(aa((Ae-je.bt+.08)/.04),1-aa((Ae-je.bt-.2)/.04));je.g.scale.set(1,Math.max(.001,Ie),1),je.g.visible=Ie>.01}),!0}Z={build:vt,cranes:et,get rockets(){return Ze}}}let H=null;function Se(){return Z?!0:(H=H||P(),H.next().done)}function pe(){for(;!Se(););}return{group:l,step:Se,ensure:pe,loadMaps:le,rockReady:Le,get api(){return Z},get sun(){return U},get night(){return R},get done(){return!!Z}}}var Ir={grade:{exposure:-.7,contrast:1.08,saturation:.96,warmth:.12,tint:.01,lift:.005,gamma:.98,gain:1.11},lens:{bloomStrength:.89,bloomThreshold:1.26,vignette:.61,grain:.084},beats:{austin:{exposure:.11,warmth:.62},space:{exposure:1.1,warmth:-.53},marsOrbit:{exposure:.76,warmth:.09},colony:{exposure:.45,warmth:.69}}};var Tr=[{pr:.75,post:0,trails:!1,shadow:1024,every:3,keep:.4},{pr:1,post:1,trails:!1,shadow:2048,every:2,keep:.6},{pr:1,post:2,trails:!0,shadow:2048,every:1,keep:1},{pr:1,post:3,trails:!0,shadow:4096,every:1,keep:1},{pr:1.25,post:3,trails:!0,shadow:4096,every:1,keep:1},{pr:1.5,post:3,trails:!0,shadow:4096,every:1,keep:1}],ss=Tr.length-1,is=14,Qi=9,Gr=20,Zi=250,ca=40,Ji=1500,Ri=4e3,_i=15e3,Hi=6e4,Ei=600,ls=33;function cs({high:e=!0,top:t=null,start:r=null,apply:u,hold:a=()=>!1,holdUp:n=()=>!1,capOK:L=()=>!1,gpu:x=()=>null}={}){let S=(typeof location<"u"?new URLSearchParams(location.search):new URLSearchParams).get("perf"),B=S==="log"||Oo,z=S==="off"||dn,T=/^[0-5]$/.test(S||"")?+S:null,W=t!=null?Math.max(0,Math.min(ss,t)):e?ss:2,l=T??(r!=null?Math.max(0,Math.min(W,r)):W),N=W,U=0,R=0,Z=0,ie=0,Le=-1e9,me=0,X=-1,re=new Float32Array(ca),We=new Float32Array(ca),xe=0,Me=0,le=0,ce=0,P=0,H={level:l,ceil:N,p90:0,med:0,steps:0,gpu:null,capped:!1,coarse:!1},Se=(...A)=>{B&&console.log("[film perf]",...A)},pe=new Float32Array(8),we=0,Ce=0,ue=0,De=-1e9,Be=!1;function _e(A){if(ue++,A<2&&(De=ue),Be=ue-De<120,!Be)return we=0,A;if(pe[Ce]=A,Ce=Ce+1&7,we<8&&we++,we<8)return null;let b=0,j=1e9;for(let te=0;te<8;te++)b+=pe[te],pe[te]>=2&&pe[te]<j&&(j=pe[te]);return j>=50?null:b/8}function ee(A,b){A=Math.max(0,Math.min(N,A)),A!==l&&(A<l&&U-Le<_i&&(N=l-1,me=U,Le=-1e9,Se("ceiling",N)),A>l&&(Le=U),l=A,Z=U+Ji,ie=0,xe=0,Me=0,le=0,ce=0,H.steps++,Se("level",A,b,"gpu",H.gpu,"med",H.med,"coarse",H.coarse),V(b))}function V(A=""){X!==l&&(X=l,H.level=l,H.ceil=N,u(Tr[l],l,/^(emergency|sustained|pinned|start)/.test(A)))}function C(A){if(X<0&&V("start"),z||T!=null)return;if(U+=Math.min(A,100),A>Zi){R=U,++P>=8&&l>0&&(P=0,ee(l-1,"sustained stalls"));return}if(P=0,U-R<Ei||(A=_e(A),A==null))return;if(xe===ca){let _=re[Me];_>Gr&&le--,_>ls&&ce--}else xe++;if(re[Me]=A,Me=(Me+1)%ca,A>Gr&&le++,A>ls&&ce++,xe<ca)return;We.set(re),We.sort();let b=We[Math.floor(ca*.9)],j=We[Math.floor(ca*.1)];H.p90=+b.toFixed(1),H.med=+We[ca>>1].toFixed(1),H.coarse=Be;let te=L()&&j>25&&b-j<3;H.capped=te;let w=x(),J=w!=null&&isFinite(w);if(H.gpu=J?+w.toFixed(1):null,te&&!J&&l<=W-1){ie=0;return}if(ce>ca*.6&&l>0&&(!J||w>is)){ee(l-1,"emergency p90 "+b.toFixed(1));return}if(N<W&&U-me>Hi&&(N=W,H.ceil=N,Se("ceiling lifted")),!(U<Z||a())){if(J?w>is:b>Gr||le>ca*.12){ee(l-1,"p90 "+b.toFixed(1)+" misses "+le+" gpu "+H.gpu+" capped "+te);return}l<N&&(J?w<Qi&&(te||le===0&&b<17.6):le===0&&b<17.6)&&!n()?ie?U-ie>Ri&&ee(l+1,"headroom p90 "+b.toFixed(1)):ie=U:ie=0}}return{frame:C,LADDER:Tr,get level(){return l},get ceil(){return N},get state(){return H},pin(A){A!=null&&(N=W,ee(Math.max(0,Math.min(W,A)),"pinned"))},reset(){xe=0,Me=0,le=0,ce=0,R=U}}}var $i=.14,el=.175,Wr=48/157.5,Qa=[.04,.12,.32,.4],us=.3,Sa=1.12,fs=.03,hs=.4,tl=.6,ds=-.02,al=[[-1,-.9],[-.3,-.1],[.43,.49]],ms=(e,t,r,u,a)=>gt(gt(gt(e.austin[t],e.space[t],r),e.marsOrbit[t],u),e.colony[t],a);function Gc({THREE:e,host:t,section:r,scenes:u,sol:a,quality:n,files:L}){let x=n==="high",k=new URLSearchParams(location.search).get("touch"),S=!x&&(k?k==="1":matchMedia("(pointer: coarse)").matches),B=[.75,1,1.25,1.5,1.75,2],z=Math.min(x?1.5:S?2:1,mn),T=new e.WebGLRenderer({antialias:!1,powerPreference:"high-performance"});T.setPixelRatio(Math.min(devicePixelRatio,z));let W=Math.max(1,t.clientWidth),l=Math.max(1,t.clientHeight);T.setSize(W,l,!1),T.toneMapping=e.ACESFilmicToneMapping,T.toneMappingExposure=1.05,T.shadowMap.enabled=!0,T.shadowMap.type=e.PCFSoftShadowMap,T.shadowMap.autoUpdate=!1;let N=T.domElement;Object.assign(N.style,{position:"absolute",inset:"0",width:"100%",height:"100%",display:"block"}),t.insertBefore(N,t.firstChild);let U=new e.Scene;U.background=new e.Color(65795);let R=new e.PerspectiveCamera(42,W/l,.1,9e3),Z=Bn({THREE:e,renderer:T,scene:U,cam:R,low:!x}),{bloom:ie}=Z,Le=JSON.parse(JSON.stringify(Ir)),me=!1,X=()=>{let o=Pt==="colony"&&K.api&&K.api.rockets;return o?o.launch.exp:0},re=()=>{let o=K.api.cranes;for(let i=0;i<o.length;i++)if(o[i].g.visible)return!0;return!1};function We(){let o=Le.grade,i=Le.lens,g=Le.beats,y=al,G=Z.look,q=Z.grade;if(G&&(G.bloom=i.bloomStrength,G.threshold=i.bloomThreshold,G.vignette=i.vignette,G.grain=i.grain),!q)return;let be=mt(Ye,y[0][0],y[0][1]),ft=mt(Ye,y[1][0],y[1][1]),Ke=mt(Ye,y[2][0],y[2][1]),nt=o.warmth+ms(g,"warmth",be,ft,Ke),lt=o.tint;if(q.expK=2**(o.exposure+ms(g,"exposure",be,ft,Ke)-.55*X()),nt===0&&lt===0)q.wr=q.wg=q.wb=1;else{let dt=2**(.25*nt),ht=2**(-.2*lt),bt=2**(-.25*nt),Fe=1/(.2126*dt+.7152*ht+.0722*bt);q.wr=dt*Fe,q.wg=ht*Fe,q.wb=bt*Fe}q.contrast=o.contrast,q.saturation=o.saturation,q.lift=o.lift,q.gamma=o.gamma,q.gain=o.gain}let xe=!0,Me=1,le=(()=>{let o=T.getContext(),i=o&&o.createQuery&&o.getExtension("EXT_disjoint_timer_query_webgl2"),g=new Float32Array(30),y=new Float32Array(30),G=[],q=[],be=0,ft=0,Ke=null,nt=null,lt=!i,dt=()=>{be=0,ft=0,nt=null},ht=Fe=>{try{o.deleteQuery(Fe)}catch{}};function bt(){if(!lt)try{for(;G.length&&o.getQueryParameter(G[0],o.QUERY_RESULT_AVAILABLE);){let Fe=G.shift();if(o.getParameter(i.GPU_DISJOINT_EXT)){ht(Fe);for(let Dt of G)ht(Dt);G.length=0,dt();break}let st=o.getQueryParameter(Fe,o.QUERY_RESULT)/1e6;q.push(Fe),st>=0&&st<1e3&&(g[ft]=st,ft=(ft+1)%30,be<30&&be++,nt=null)}}catch{lt=!0,dt()}}return{poll:bt,begin(){if(!(lt||Ke||G.length>=4))try{let Fe=q.pop()||o.createQuery();o.beginQuery(i.TIME_ELAPSED_EXT,Fe),Ke=Fe}catch{lt=!0}},end(){if(Ke){try{o.endQuery(i.TIME_ELAPSED_EXT),G.push(Ke)}catch{lt=!0}Ke=null}},get p90(){return lt||be<20?null:(nt==null&&(y.set(g),nt=y.subarray(0,be).sort()[Math.floor(be*.9)]),nt)},reset(){dt()},dispose(){for(let Fe of[...G,...q,Ke])Fe&&ht(Fe);G.length=q.length=0,Ke=null,lt=!0}}})(),ce=cs({high:x,top:S?B.length-1:null,start:xr&&x?3:null,hold:()=>Ye>Jt&&Ye<.52,holdUp:()=>Pa,capOK:()=>!xr,gpu:()=>le.p90,apply:(o,i,g)=>{xe=o.trails,Mo=o.every,Me=o.keep;let y=K.api&&K.api.rockets;y&&y.setKeep&&y.setKeep(Me),H=null;let G=Math.min(devicePixelRatio||1,z,S?B[i]:o.pr),q=Math.min(x?o.post:Math.min(o.post,1),br??3),be=x?o.shadow:Math.min(o.shadow,2048);if((T.getPixelRatio()!==G||Z.getQuality()!==q||w.shadow.mapSize.x!==be)&&!g&&!ue()){H={q:o,lv:i},Se=performance.now(),pe=0;return}P(o,i,G,q,be)}});function P(o,i,g,y,G){T.getPixelRatio()!==g&&(T.setPixelRatio(g),Z.setSize(W,l),Z.resetMotion()),Z.setQuality(y),Z.setDofHalf(x&&i<5),le.reset();let q=w.shadow;q.mapSize.x!==G&&(q.mapSize.set(G,G/2),q.map&&(q.map.dispose(),q.map=null),Ca=!0)}let H=null,Se=0,pe=0,we=-1,Ce=0,ue=()=>performance.now()-Ce>300||Ye>Jt&&Ye<.52;function De(o){pe=o>.04?pe+o*1e3:0;let i=performance.now();if(ue()||pe>=1e3||i-Se>3e3){let g=H;H=null,P(g.q,g.lv,Math.min(devicePixelRatio||1,z,S?B[g.lv]:g.q.pr),Math.min(x?g.q.post:Math.min(g.q.post,1),br??3),x?g.q.shadow:Math.min(g.q.shadow,2048))}}(ie.separableBlurMaterials||[]).forEach(o=>{let i=o.uniforms.gaussianCoefficients?.value;if(!i)return;let g=i.length,y=g/2.6;for(let G=0;G<g;G++)i[G]=.39894*Math.exp(-.5*G*G/(y*y))/y});let Be=$n({THREE:e}),{toSun:_e,EARTH:ee,MARS:V,C0:C,L0:A}=Be,b=Gn({THREE:e,scene:U,renderer:T,toSun:_e,EARTH:ee,MOON:Be.moonAt(-1,new e.Vector3),MARS:V,files:L.tex});b.moon.material.uniforms.uRelief.value=.35,b.mars.material.uniforms.uRelief.value=.4;let j=null,te=Vn({THREE:e,scene:U,starsUrl:L.stars,milkyUrl:L.milky,milkyWayIntensity:.14}).then(o=>{j=o}).catch(()=>{}),w=new e.DirectionalLight(16773596,2.4);w.position.copy(_e).multiplyScalar(100);let J=new e.AmbientLight(2240580,.35),_=new e.HemisphereLight(16763030,5909012,1.4);_.intensity=0,U.add(w,w.target,J,_);let K=ns({THREE:e,renderer:T,scene:U,cam:R,planets:b,sunLight:w,ambient:J,hemi:_,files:L.jezero,HIGH:x,lateRockets:o=>ro("colony",()=>oo(o.group)),lodPath:()=>{let o=[];for(let i=0;i<=48;i++){let g=new e.Vector3,y=.6+(Sa-.6)*i/48;s.getPoint(m(y),g),at(y,g,!0),o.push(g.sub(h))}return o}}),D=K.group,h=new e.Vector3(la.x,la.y,la.z),$=o=>{let i=document.createElement("canvas");i.width=i.height=256;let g=i.getContext("2d"),y=g.createRadialGradient(128,128,0,128,128,128);return o.forEach(([G,q])=>y.addColorStop(G,q)),g.fillStyle=y,g.fillRect(0,0,256,256),new e.CanvasTexture(i)},O=new e.Sprite(new e.SpriteMaterial({map:$([[0,"rgba(255,255,255,1)"],[.12,"rgba(255,236,200,0.9)"],[.35,"rgba(255,170,80,0.25)"],[1,"rgba(0,0,0,0)"]]),color:16777215,blending:e.AdditiveBlending,depthWrite:!1,transparent:!0,fog:!1}));U.add(O);let Y=()=>Z.resetMotion(),ae=new e.Vector3(0,4e4,0),fe=Rn({THREE:e,scene:U,renderer:T,sunLight:w,hemi:_,ORIGIN:ae,earthU:b.earth.material.uniforms,ortho:L.ortho}),Ge=En({THREE:e,parent:fe.group,high:x}),rt=.012,Oe=10/6371e3,Ue=e.MathUtils.degToRad(go.lat),Xe=(go.lon+180)/360,zt=new e.Vector3(-Math.cos(2*Math.PI*Xe)*Math.cos(Ue),Math.sin(Ue),Math.sin(2*Math.PI*Xe)*Math.cos(Ue)),xt=Math.atan2(zt.z,zt.x)-Math.atan2(C.z,C.x),Nt=zt.clone().applyAxisAngle(new e.Vector3(0,1,0),xt).multiplyScalar(10),Bt=Nt.clone().normalize(),jt=Be.spaceCam,wt=Tn({THREE:e,SITE_ROT:Jo,AUS:Nt,U_PER_M:Oe,C0:C,L0:A,spaceCam:jt}),ct={pos:new e.Vector3,look:new e.Vector3,up:new e.Vector3},Ot=wt.LAMH,Mt=wt.LAM1,de={},Ne={pos:new e.Vector3,look:new e.Vector3,up:new e.Vector3},et=(o,i)=>{let g=Math.log(o),y=wt.k.yA,G=wt.k.yH;for(let q=0;q<50;q++){let be=(y+G)/2;wt.at(be,Ne),Ne.lam<g?y=be:G=be}return wt.at((y+G)/2,i)},Ze=[15,0,-135],He=(o,i,g)=>[Ze[0]+o*Math.sin(i*Math.PI/180),g,Ze[2]+o*Math.cos(i*Math.PI/180)],Ee=[[oa,[2200,2600,900],[-3200,0,-200],50],[.52,[1400,1500,700],[-1400,0,-300],48],[.57,[750,700,550],[-250,0,-250],46],[.62,He(600,28,260),[15,30,-135],42],[.72,He(500,32,190),[15,34,-135],40],[.8,He(420,24,130),[10,38,-130],40],[.88,He(350,15,80),[-5,44,-125],42],[1,He(450,13,85),[-15,52,-118],45],[1.12,He(600,14,115),[-20,60,-115],50]].map(([o,i,g,y])=>({p:o,pos:new e.Vector3(...i).add(h),look:new e.Vector3(...g).add(h),fov:y})),s=new e.CatmullRomCurve3(Ee.map(o=>o.pos),!1,"centripetal"),d=new e.CatmullRomCurve3(Ee.map(o=>o.look),!1,"centripetal"),v=Ee.map(o=>o.p),m=Or(s,v,void 0,0),c=Or(d,v,void 0,0),M=da(v,Ee.map(o=>o.fov),void 0,0),f=(()=>{let o=da([.49,.62,.88,.9,1.12],[0,.1,.8,.83,1]);return i=>i<=.49?0:i>=1.12?1:Lt(o(i))})(),F=.83,E=new e.Vector3,I=new e.Vector3,Q=new e.Vector3(_t.build[0],0,_t.build[1]).add(h),ye=new e.Vector3;function Qe(o,i){let g=K.api&&K.api.rockets,y=g&&g.launch;if(y&&y.pos)return i.copy(y.pos);let G=Math.max(0,o-F),q=4800*G*G*(1+4*G),be=25e-5*q*q;return i.set(_t.build[0]-.952*be,26+q,_t.build[1]-.305*be).add(h)}let Ve=o=>Math.asin(e.MathUtils.clamp(o.y/Math.max(1e-6,o.length()),-1,1)),ze=o=>Math.atan2(Math.sin(o),Math.cos(o));function he(o,i,g,y){let G=Math.min(Math.max(o,oa),Sa);s.getPoint(m(G),i),d.getPoint(c(G),g);let q=Vr(G,M(G),R.aspect),be=mt(y,F+.002,F+.045);if(be>0){let ft=e.MathUtils.degToRad(q/2),Ke=E.copy(g).sub(i),nt=Ke.length();Qe(y,I).sub(i);let lt=Ve(Ke),dt=Ve(I),ht=Ve(ye.copy(Q).sub(i)),bt=.3+1.1*mt(za,0,hs*.6),Fe=gt(lt,Math.min(Math.max(lt,dt-.5*ft),ht+bt*ft),be),st=Math.atan2(Ke.x,Ke.z),Dt=st+ze(Math.atan2(I.x,I.z)-st)*.55*be;g.set(Math.cos(Fe)*Math.sin(Dt),Math.sin(Fe),Math.cos(Fe)*Math.cos(Dt)).multiplyScalar(nt).add(i)}return q}let ke=document.querySelector("[data-foot-canvas]")||document.querySelector("[data-foot]"),Re=[.86,Sa],ve=[.98,Sa],tt=[.86,.95],Je=[1,Sa],it=.5,vt=-.3,p=ke?(()=>{let o=yr(0,0),i=yr(_t.build[0],_t.build[1]),g=Math.atan2(i[1]-o[1],i[0]-o[0])-Math.atan2(_t.build[1],_t.build[0]),y=Math.cos(g),G=Math.sin(g),q=-wn(o[0],o[1]),be=(dt,ht,bt,Fe)=>{let st=dt-o[0],Dt=bt-o[1];return Fe.set(st*y+Dt*G,ht+q,-st*G+Dt*y).add(h)},ft=wr(16,9),Ke={toCol:be,eye:be(...ft.eye,new e.Vector3),look:new e.Vector3,q:new e.Quaternion,c:0,e:1,ok:!1},nt=Math.sin(ft.sunAz),lt=-Math.cos(ft.sunAz);return Ke.sunAz=Math.atan2(-nt*G+lt*y,nt*y+lt*G),Ke.rE=Math.hypot(Ke.eye.x-h.x,Ke.eye.z-h.z),Ke.aE=Math.atan2(Ke.eye.z-h.z,Ke.eye.x-h.x),Ke})():null,oe=(o,i,g=!1)=>p&&(g||p.ok)?to(o,i[0],i[1]):0,ge=new e.Matrix4,Te=new e.Vector3(0,1,0);function Ae(){if(!p)return;let o=ke.clientWidth,i=ke.clientHeight;if(p.ok=o>0&&i>0,!p.ok)return;let g=wr(o,i),y=Math.tan(g.vfov*Math.PI/360);p.toCol(...g.look,p.look),ge.lookAt(p.eye,p.look,Te),p.q.setFromRotationMatrix(ge),p.e=2*y*l/i,p.c=y+p.e/2}function at(o,i,g=!1){let y=oe(o,Re,g);if(y<=0)return i;let G=i.x-h.x,q=i.z-h.z,be=Math.atan2(q,G),ft=gt(Math.hypot(G,q),p.rE,y),Ke=be+ze(p.aE-be)*y;return i.set(h.x+ft*Math.cos(Ke),gt(i.y,p.eye.y,oe(o,ve,g)),h.z+ft*Math.sin(Ke))}let kt=new e.Quaternion,Tt=new e.Vector3;function It(o,i){let g=oe(o,tt),y=oe(o,Je);at(o,yt),R.position.copy(yt);let G=2*Math.tan(i*Math.PI/360),q=gt(gt(-Ur(o,R.aspect)*G,0,g),p.c,y),be=G**(1-y)*p.e**y;Qe(na,Tt).sub(yt);let ft=Ve(Tt)-Math.atan(q-be/2+it*be),Ke=Math.atan2(Tt.x,Tt.z);Tt.set(Math.cos(ft)*Math.sin(Ke),Math.sin(ft),Math.cos(ft)*Math.cos(Ke)).add(yt),ge.lookAt(yt,Tt,Te),kt.setFromRotationMatrix(ge),R.quaternion.slerp(kt,g).slerp(p.q,y),Vt(q,be),eo(e.MathUtils.clamp((yt.y-la.y)*.08,.1,30),9e3)}function Ct(o){let i=oe(o,Re);if(i<=0)return;let g=K.sun,y=gt(Math.asin(e.MathUtils.clamp(g.y,-1,1)),vt,oe(o,Je)),G=Math.atan2(g.z,g.x),q=G+ze(p.sunAz-G)*i;g.set(Math.cos(y)*Math.cos(q),Math.sin(y),Math.cos(y)*Math.sin(q))}function Vt(o,i){let g=Math.abs(o)+i/2,y=2*g/i,G=W*y,q=l*y;R.fov=2*Math.atan(g)*180/Math.PI,R.setViewOffset(G,q,(G-W)/2,(g-o-i/2)*l/i,W,l),Oa=!0}let je=new e.Vector3(-.78,.42,.46).normalize(),Ie=new e.Vector3,Ut=new e.Quaternion,Xt=new e.Mesh(new e.PlaneGeometry(30,30),new e.ShaderMaterial({uniforms:{uR:{value:6},uL2:{value:new e.Vector2(je.x,je.y).normalize()},uI:{value:1.5}},vertexShader:"varying vec2 vQ; void main(){ vQ = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }",fragmentShader:`uniform float uR, uI; uniform vec2 uL2; varying vec2 vQ;
    void main(){ float q = length(vQ), d = max(q / uR - 1., 0.); vec2 dir = vQ / max(q, 1e-4);
      float side = smoothstep(-0.6, 1., dot(dir, uL2));
      // a thin dusty atmosphere hugging the limb (Mars' dust haze tops out ~1% of its radius up), much stronger on the lit side:
      // a narrow warm rim, not a soft disc. The inner term sits over the geometric edge so the limb never reads as a cut-out
      float g = exp(-d * 120.) * 0.75 + exp(-d * 34.) * 0.16 + exp(-d * 9.) * 0.012;
      float edge = 1. - smoothstep(11., 15., max(abs(vQ.x), abs(vQ.y))); // fade before the plane's edge: its square never shows on black
      gl_FragColor = vec4(vec3(1.0, 0.56, 0.28) * g * side * side * uI * edge, 0.); }`,transparent:!0,depthWrite:!1,blending:e.CustomBlending,blendSrc:e.OneFactor,blendDst:e.OneFactor}));{let o=b.marsAtmo.material.uniforms;o.uBetaR.value.multiplyScalar(.25),o.uSunCol.value.set(1,.86,.66),o.uK.value=15}Xt.position.copy(V),Xt.renderOrder=3,Xt.frustumCulled=!1,U.add(Xt);function ra(o,i){Be.marsQ(o,b.mars.quaternion),Ie.copy(je).applyQuaternion(R.quaternion),b.marsAtmo.material.uniforms.uSun.value.copy(Ie),Ut.copy(b.mars.quaternion).invert(),b.mars.material.uniforms.uSun.value.copy(Ie).applyQuaternion(Ut);let g=R.position.distanceTo(se);Xt.quaternion.copy(R.quaternion),Xt.material.uniforms.uR.value=6/Math.sqrt(Math.max(.05,1-36/(g*g)))}let ua={uPx:{value:1},uI:{value:0}},ne=new e.Points(new e.BufferGeometry().setAttribute("position",new e.BufferAttribute(new Float32Array(3),3)),new e.ShaderMaterial({uniforms:ua,vertexShader:"uniform float uPx; void main(){ gl_PointSize = uPx; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }",fragmentShader:`uniform float uI; void main(){ vec2 q = gl_PointCoord * 2. - 1.; float r2 = dot(q, q); if (r2 > 1.) discard;
      gl_FragColor = vec4(vec3(1.0, 0.52, 0.3) * (exp(-r2 * 10.) + exp(-r2 * 3.) * 0.1) * uI, 1.); }`,transparent:!0,depthWrite:!1,blending:e.AdditiveBlending}));ne.frustumCulled=!1,ne.renderOrder=1,U.add(ne);let se=V.clone(),qe=[b.mars,b.marsAtmo,Xt];function ut(o,i){let g=i?Be.marsFar(o):1;se.copy(V).sub(R.position).multiplyScalar(g).add(R.position),b.mars.position.copy(se),b.marsAtmo.position.copy(se),b.marsAtmo.material.uniforms.uCenter.value.copy(se),Xt.position.copy(se),ne.position.copy(se);let y=6/se.distanceTo(R.position)*l/2/Math.tan(R.fov*Math.PI/360),G=i?1-mt(y,1.2,4):0;for(let q of qe)q.visible=i&&y>.9;return ne.visible=G>.001,ua.uI.value=5*G,ua.uPx.value=9*T.getPixelRatio(),y}let $e=[b.earth,b.clouds,b.moon,b.mars,b.earthAtmo,b.marsAtmo,Xt,ne],Ft=[b.earth,b.clouds,b.moon,b.earthAtmo],Pe=null,pt=o=>o.getBoundingClientRect();function Yt(){W=Math.max(1,t.clientWidth),l=Math.max(1,t.clientHeight);let o=pt(r),i=l,g={};for(let Fe in u){if(!u[Fe])continue;let st=pt(u[Fe]),Dt=u[Fe].firstElementChild,ta=Dt?pt(Dt):st;g[Fe]={top:st.top-o.top,h:st.height,tc:(ta.top+ta.bottom)/2-o.top}}let y=(Fe,st=0)=>g[Fe].tc-i/2+st*i,G=(Fe,st)=>g[Fe].top+st*g[Fe].h-i/2,q=Math.max(1,o.height-i),be=W<768&&l>W?-.12:0,ft=1.9,Ke=(y("title",0)-y("earth",be))/i,nt=Math.min(1,Ke/ft),lt=nt**.6,dt=Math.max(0,Math.min(Math.sqrt(nt),(Ke-.5*lt-.15*nt)/.7)),ht=[[y("earth",be-.6),-1],[y("earth",be),-.9],[y("earth",be+.7*dt),-.64],[y("title",-.5*lt),-.15],[y("title",0),0],[y("reind",0),.26],[G("colony",0),.62],[G("colony",1),.9],[q,Sa]];for(let Fe=1;Fe<ht.length;Fe++)ht[Fe][0]<=ht[Fe-1][0]+1&&(ht[Fe][0]=ht[Fe-1][0]+1);Pe={vh:i,yEnd:q,S:jo(ht),sc:g};{let Fe=ht[0][0],st=q;for(let Dt=0;Dt<50;Dt++){let ta=(Fe+st)/2;Pe.S(ta)<ds?Fe=ta:st=ta}Pe.ySol=(Fe+st)/2}Be.layout({S:Pe.S,yE:ht[0][0],y1:q,vh:i});let bt=[g.austin.top-i,y("austin",0),y("austin",.5),ht[0][0]];for(let Fe=bt.length-2;Fe>=0;Fe--)bt[Fe]>=bt[Fe+1]-1&&(bt[Fe]=bt[Fe+1]-Math.max(1,.25*i));wt.layout({yA:bt[0],yT:bt[1],yX:bt[2],yE:bt[3],S:Pe.S}),Ge.layout(et,W/l),va(),vs(),Qt(),Ae()}function Qt(){let o=r.nextElementSibling;for(;o&&(o.offsetHeight===0||getComputedStyle(o).display==="none");)o=o.nextElementSibling;let i=y=>{let G=y&&getComputedStyle(y).backgroundColor.match(/[\d.]+/g);return G&&(G.length<4||+G[3]>.5)?G:null},g=null;for(let y=o,G=0;y&&!g&&G<3;y=y.firstElementChild,G++)g=i(y);for(let y=r.parentElement;y&&!g;y=y.parentElement)g=i(y);g=g||[0,0,0],fa.el=o,fa.col[0]=g[0]/255,fa.col[1]=g[1]/255,fa.col[2]=g[2]/255}let At=null,Et=()=>W<768?24:40;function va(){At=null;let o=u.title,i=o&&o.querySelector('[data-split="left"]'),g=o&&o.querySelector('[data-split="right"]');if(!i||!g)return;let y=i.parentElement;i.style.transform=g.style.transform="";let G=pt(y),q=pt(i),be=pt(g),ft=Math.abs((q.top+q.bottom)/2-(be.top+be.bottom)/2)<q.height*.5,Ke=W>=768,nt=(Ke?el:$i)*l;if(ft){let lt=be.left-q.right,dt;if(Ke){dt=Math.max(.05*l,Math.min(nt,lt/2/(1+Wr)));let ht=Math.max(0,lt/2-dt*(1+Wr));i.style.transform=`translate3d(${ht}px,0,0)`,g.style.transform=`translate3d(${-ht}px,0,0)`}else dt=Math.max(.05*l,Math.min(nt,(lt/2-Et())/1.08));At={Ls:i,Rs:g,h2:y,x:(q.right+be.left)/2-G.left,y:(q.top+q.bottom+be.top+be.bottom)/4-G.top,r:dt}}else{let lt=Math.min(nt,.4*W),dt=Ke?lt*(1+Wr):lt*1.08+Et(),ht=be.top-q.bottom,bt=Ke?dt-ht/2:Math.max(0,dt-ht/2);i.style.transform=`translate3d(0,${-bt}px,0)`,g.style.transform=`translate3d(0,${bt}px,0)`,At={Ls:i,Rs:g,h2:y,x:((q.left+q.right)/2+(be.left+be.right)/2)/2-G.left,y:(q.bottom+be.top)/2-G.top,r:lt}}}let $t=null;function vs(){$t=null;let o=u.reind&&u.reind.firstElementChild;if(!o)return;let i=document.createRange();i.selectNodeContents(o);let g=0;for(let be of i.getClientRects())be.width>1&&(g=Math.max(g,be.right));let y=pt(t),G=W-(g-y.left),q=Math.min(.21*l,.4*W);if(W>=768&&G>2.2*q){let be=Math.min(q,(G/2-24)/1.08);$t={x:g-y.left+G/2,y:l/2,r:be}}else{let be=pt(o).height,ft=l<500?12:24,Ke=l/2-be/2-24-.04*l,nt=At?At.r*(1+us*Qa[1]):0,lt=Math.max(.05*l,Math.min(q,.16*l,Ke/2.38),Math.min(nt,(W>=768?.2:.16)*l));$t={x:W/2,y:Math.max(1.12*lt,Math.min(.3*l,l/2-be/2-ft-1.19*lt)),r:lt}}}let Gt=0,Ho=0,Ye=-1,Aa=0,Pt="site",Na="",ol=!1,Za=!0,yo=!1,ps=!1,Ja=0,wo=0,Ra=0,Eo=null,jr=0,$o=0,Ca=!0,qr=!1,Da=!1,za=0,_a=0,Ha=0,na=0,Mo=1,Pa=!1,Ea=null,gs=3,xs=3,fa={k:0,col:[0,0,0],el:null},er=new e.Vector3,tr=new e.Vector3,Xr=new e.Vector3,So={x:0,y:0},sa={x:0,y:0},bs=.05,ar=new URLSearchParams(location.search).get("touch"),Ao=matchMedia("(pointer: coarse)"),or={on:ar?ar==="1":Ao.matches},La=0,Kr=()=>{ar||(or.on=Ao.matches,La=0)};Ao.addEventListener?.("change",Kr);let Yr=o=>{So.x=o.clientX/innerWidth-.5,So.y=o.clientY/innerHeight-.5};addEventListener("mousemove",Yr,{passive:!0});let yt=new e.Vector3,Ht=new e.Vector3,ea=new e.Vector3,ys=new e.Vector3,Co=new e.Vector3,$a=new e.Vector3(0,1,0),ka=new e.Vector3,ws=new e.Color(16773596),eo=(o,i)=>{(R.near!==o||R.far!==i)&&(R.near=o,R.far=i,R.updateProjectionMatrix())},Do={g:0,t:0},Ia={lam:0,t:0,sinE:1,proj:1,pr:1},rr={t:0,intro:1,camPos:yt,spin:0,hole:Bt},pa={dt:0,t:0,focus:0,aperture:0,maxblur:0,ca:0},Ms=new e.Vector3,zo={k:0,mb:0};function nr(o){let i=w.shadow.camera;w.shadow.normalBias=o?.1:.35,o?(i.left=-160,i.right=160,i.top=80,i.bottom=-80,i.near=50,i.far=900,J.intensity=.03):(i.left=-390,i.right=390,i.near=60,i.far=1300,w.color.copy(ws)),i.updateProjectionMatrix()}let Oa=!1,to=(o,i,g)=>Kt(Lt((o-i)/(g-i)));function Ss(o,i){let g=o&&At?to(Ye,-.15,-.02)*(1-to(Ye,.04,.12)):0,y=o&&$t?to(Ye,Qa[0],Qa[1])*(1-to(Ye,Qa[2],Qa[3])):0,G=()=>{i?(R.setViewOffset(W,l,0,i*l,W,l),Oa=!0):Oa&&(Oa=!1,R.clearViewOffset())};if(g<=0&&y<=0)return G();let q=Math.tan(R.fov*Math.PI/360);R.updateMatrixWorld(),ka.copy(V).applyMatrix4(R.matrixWorldInverse);let be=ka.length();if(ka.z>-6.2||be<6.2)return G();let ft=ka.x/-ka.z/(q*R.aspect),Ke=ka.y/-ka.z/q,nt=W/2+ft*W/2,lt=l/2-Ke*l/2,dt=Math.tan(Math.asin(6.05/be))/q*l/2,ht=nt,bt=lt-i*l,Fe=1+us*Ye;if(g>0&&y>0){let st=Math.min(1,g+y),Dt=y/(g+y),ta=pt(At.h2),ko=pt(t);dt=gt(dt,gt(At.r,$t.r,Dt)*Fe,st),ht=gt(ht,gt(ta.left-ko.left+At.x,$t.x,Dt),st),bt=gt(bt,gt(l/2,$t.y,Dt),st)}else{if(W<992&&y>0&&Ye>Qa[2]){let st=$t.r*Fe,Dt=dt-st;dt=.5*(dt+st+Math.sqrt(Dt*Dt+.01*st*st*y))}if(g>0){let st=pt(At.h2),Dt=pt(t);dt=gt(dt,At.r*Fe,g),ht=gt(ht,st.left-Dt.left+At.x,g),bt=gt(bt,l/2,g)}y>0&&(dt=gt(dt,$t.r*Fe,y),ht=gt(ht,$t.x,y),bt=gt(bt,$t.y,y))}{let st=Math.max(6.6/be,6.05/Math.sin(Math.atan(dt*2*q/l))/be);yt.sub(V).multiplyScalar(st).add(V),R.position.sub(V).multiplyScalar(st).add(V),R.updateMatrixWorld()}R.setViewOffset(W,l,-(ht-nt),-(bt-lt),W,l),Oa=!0}let ha={inCol:!1,cam:R,t:0,dt:0,alt:0,fog:U.fog,e:0};function As(o,i,g){let y=Lt((Ye-Jt)/(xo-Jt));ha.inCol=o,ha.sunDir=K.sun,ha.night=K.night,ha.t=i,ha.dt=g,ha.e=y,ha.fog=U.fog,ha.alt=o?R.position.y-la.y:R.position.distanceTo(V),b.entry(y,ha)}let sr=[0,0],ao={entry:-1,gR:-1,plume:null};function Cs(o){let i=o&&K.api&&K.api.rockets,g=i&&i.launch,y=o?na:-1;ao.entry=Ye>Jt&&Ye<xo?(Ye-Jt)/(xo-Jt):-1,ao.gR=y,ao.plume=null,g&&g.base&&y>=.78&&(Co.copy(g.base).project(R),Co.z<1&&(sr[0]=Co.x*.5+.5,sr[1]=Co.y*.5+.5,ao.plume=sr)),Z.lensFrame(ao);let G=g&&g.fx,q=Z.fx;G&&q&&(G.flash>q.flash&&(q.flash=G.flash),G.heat>q.heat&&(q.heat=G.heat),G.bloom>q.bloom&&(q.bloom=G.bloom))}let Qr="",Zr="",Jr=a&&a.root&&+a.root.dataset.solFrom||1,Ds=a&&a.root&&+a.root.dataset.solTo||206;function zs(){if(!a||!a.root)return;let o=mt(Ye,.4,.43)*(1-mt(Ye,.57,.61)),i=mt(Gt,Pe.yEnd,Pe.yEnd+.25*Pe.vh),g=mt(Ye,ds,.06)*(1-o)*(1-i),y=g.toFixed(3);y!==Zr&&(Zr=y,a.root.style.opacity=y,a.root.style.visibility=g>.005?"":"hidden");let G=Lt((Gt-Pe.ySol)/Math.max(1,Pe.yEnd-1-Pe.ySol)),q=String(Jr+Math.floor((Ds-Jr)*G+1e-6)).padStart(4,"0");q!==Qr&&a.value&&(Qr=q,a.value.textContent=q)}let Rr=-1,_r="",ir={p:0,beat:""},Ps=new CustomEvent("tf:film",{detail:ir}),Hr=()=>Ye<-.55?Aa<1?"austin":"earth":Ye<.12?"mars-title":Ye<.42?"reindustrialize":Ye<.88?"colony":"launch";function Ls(o){Pe||Yt();let i=Ra,g=-pt(r).top;if(Za||Math.abs(g-Gt)>2*Pe.vh)Gt=g,Ho=0,La=0,Za=!1,Y();else{let ot=Gt;if(or.on){let St=2/bs,Wt=St*o,ia=1/(1+Wt+.48*Wt*Wt+.235*Wt*Wt*Wt),no=Gt-g,so=(La+St*no)*o;La=(La-St*so)*ia,Gt=g+(no+so)*ia,Math.abs(Gt-g)<.5&&Math.abs(La)<20&&(Gt=g,La=0)}else window.lenis?Gt=g:Gt+=(g-Gt)*(1-Math.exp(-o/.05));Ho=o>0?(Gt-ot)/o:0}sa.x+=(So.x-sa.x)*o*2,sa.y+=(So.y-sa.y)*o*2,wt.at(Gt,ct),Aa=ct.s,Ye=Math.min(Sa,Math.max(-1,Pe.S(Gt))),Aa<1&&(Ye=-1);let y=Aa<1,G=ct.lam;Pt=y?ct.world:Ye>=oa?"colony":"space";{let ot=Gt>=Pe.yEnd-2,St=ot?fs:za>0?-2.5*fs:0;_a+=(St-_a)*(1-Math.exp(-o/tl)),za=Math.min(hs,Math.max(0,za+_a*o)),za<=0&&_a<0&&(_a=0),Ha=f(Ye),na=Ha+za*mt(Ha,.95,1)}fa.k=mt(Gt-Pe.yEnd,-.3*Pe.vh,0),Aa>.6&&b.loadDeferred("moon"),Ye>-.9&&b.loadDeferred("mars"),Pt==="colony"?K.ensure():Ye>.3&&$r();let q=Pt==="colony",be=Pt==="site",ft=y?0:mt(Ye,-1,-.92),Ke=46,nt=30;if($a.set(0,1,0),be){let ot=ct.dist,St=1-ct.upk;ea.copy(ct.pos),ea.x+=sa.x*3*St,ea.z+=sa.y*2*St,yt.copy(ea).add(ae),Ht.copy(ct.look).add(ae),$a.copy(ct.up),Ke=ct.fov,nt=ot,jr=ot,eo(Math.max(.3,ot*.004),ot*8+3e3),Do.g=ct.g,Do.hour=ct.hour,Do.t=i,Eo=fe.update(Do);{let ia=T.getPixelRatio();Ia.lam=G,Ia.t=i,Ia.sinE=Eo.sinE,Ia.pr=ia,Ia.proj=l*ia/(2*Math.tan(e.MathUtils.degToRad(Ke)/2)),Ge.update(Ia)}fe.follow(ea,ot),U.fog.near=1e8,U.fog.far=1e9,_.intensity*=1-mt(G,Math.log(3e3),Math.log(6e4));let Wt=Eo.night;Z.trails.enabled=x&&xe&&Wt>.02,Z.trails.amount=.65*Wt}else if(Pt==="globe")yt.copy(ct.pos),Ht.copy(ct.look),Ke=ct.fov,nt=ct.dist*Oe,eo(Math.min(.1,Math.max(5e-4,nt*.04)),9e3);else if(q){Ke=he(Ye,yt,Ht,na),yt.x+=sa.x*8*ft,yt.y-=sa.y*5*ft,nt=yt.distanceTo(Ht);let ot=K.api&&K.api.rockets&&K.api.rockets.launch;if(ot&&ot.burn>.004){nt=gt(nt,yt.distanceTo(ot.pos),mt(na,F,F+.03));let St=ot.shake*yt.distanceTo(Ht)*.0022;if(St>1e-4){er.copy(Ht).sub(yt).normalize(),tr.crossVectors(er,$a).normalize(),Xr.crossVectors(tr,er);let Wt=Math.sin(i*31)*.6+Math.sin(i*57+1.7)*.4,ia=Math.sin(i*37+.6)*.6+Math.sin(i*71+2.9)*.4;Ht.addScaledVector(tr,Wt*St).addScaledVector(Xr,ia*St)}}eo(e.MathUtils.clamp((yt.y-la.y)*.08,.1,30),9e3)}else Ke=jt(Ye,yt,Ht,$a),Ke=Vr(Ye,Ke,R.aspect),nt=gt(yt.distanceTo(Nt),yt.distanceTo(Ht),mt(Ye,-1,-.92)),eo(.1,12e3);be||(Z.trails.enabled=!1);{let ot=y?mt(G,Math.log(450),Math.log(3600))*(1-mt(G,14,15.9)):0;Z.motion.shutter=.6+2.4*ot,Z.motion.maxLen=.035+.11*ot}if(Z.auto.enabled=!y,y?(T.toneMappingExposure=Wn(Qo(ct.hour,de).sinE,G),Z.snapExposure()):(T.toneMappingExposure=1.05,Z.auto.min=.55),Pt!==Na){fe.group.visible=be,D.visible=q;let ot=!be&&!q;$e.forEach(St=>St.visible=ot),nr(be),Z.motion.cutDist=Pt==="site"||Pt==="globe"?1e12:400,Z.ao.enabled=be&&x,(Na==="site"&&Pt==="globe"||Na==="")&&Z.resetMotion(),Na=Pt,Ca=!0,T.compile(lr,R,U)}if(Pt==="space"){let ot=Ye>-.12;for(let St of Ft)St.visible=!ot}let lt=q?K.sun:_e,dt=q&&K.api.build(Ha,i,na);if(q&&Ct(Ye),q){let ot=K.api.rockets;ot&&ot.setKeep&&ot.keep!==Me&&(ot.keep=Me,ot.setKeep(Me))}if(Pt!=="site"&&Pt!=="globe"&&As(q,i,o),!q&&!be&&(U.fog.near=1e8,U.fog.far=1e9,w.intensity=2.4,J.intensity=.35,_.intensity=0),$o++,be)(Ca||w.intensity>.01&&(jr<2500||$o%10===0))&&(T.shadowMap.needsUpdate=!0,Ca=!1);else if(q){let ot=Pa?Math.max(Mo,xs):Mo,St=!dt&&re(),Wt=St?Math.max(ot,gs):ot;(Ca||(dt||St)&&$o%Wt===0||!Pa&&dt)&&(T.shadowMap.needsUpdate=!0,Ca=!1)}else w.target.position.set(0,0,0),w.position.copy(lt).multiplyScalar(100);let ht=yt.distanceTo(Ht);y||(ea.set(Math.sin(i*.21)*.6+Math.sin(i*.53+1.3)*.25,Math.sin(i*.17+2.1)*.5+Math.sin(i*.41)*.2,Math.sin(i*.13+4)*.4).multiplyScalar(ht*.002*ft),Pt==="space"&&(ea.x+=sa.x*2.2*ft,ea.y-=sa.y*1.4*ft,Be.drift(Ye,yt,ea)),yt.add(ea)),R.up.copy($a),Math.abs(R.fov-Ke)>5e-4&&(R.fov=Ke,R.updateProjectionMatrix()),R.position.copy(yt),R.lookAt(Ht),q&&oe(Ye,Re)>0?(It(Ye,Ke),nt=gt(nt,yt.distanceTo(Qe(na,ys)),oe(Ye,Re))):Ss(Pt==="space",Pt==="globe"||Pt==="site"?0:Ur(Ye,R.aspect)),!be&&!q&&ut(Ye,Pt==="space"),rr.t=i,rr.spin=xt-i*rt+(y?0:(Ye+1)*.5),b.update(rr),(Pt==="space"||Pt==="globe")&&Ye<-.12&&b.moon.position.copy(Be.moonAt(Ye,Ms)),Pt==="space"&&ra(i,Ye),b.mars.material.uniforms.uDomes.value=1-mt(yt.distanceTo(V),14,30),j&&(j.update(yt),j.group.visible=!q&&!be);let bt=Pt==="globe"?Lt((G-Ot)/(Mt-Ot)):1;O.visible=!be,O.position.copy(yt).addScaledVector(lt,1600);let Fe=Math.max(0,ea.copy(Ht).sub(yt).normalize().dot(lt)),st=mt(bt,.55,1)*(.25+Fe*.9)*(q?.22*(1-mt(K.sun.y,.02,-.04)):0);O.scale.setScalar(260*st+40),O.material.opacity=Math.min(1,st*1.3),ie.strength=.6+st*.3;{let ot=1-mt(nt,2,4),St=y?0:mt(Ye,-1,-.92),Wt=q?1:mt(Ye,Jt,oa),ia=q?mt(na,F-.01,F+.03):0,no=gt(gt(4e-4,.003+.017*ot,St),gt(.006,.0022,ia),Wt),so=gt(gt(8e-4,.0018+.0032*ot,St),gt(.0042,.0024,ia),Wt);pa.dt=o,pa.t=i,pa.focus=nt,pa.aperture=no/nt,pa.maxblur=x?so:0,pa.ca=.012,zo.k=no,zo.mb=so}if(Cs(q),be&&u.austin&&u.austin.firstElementChild){let ot=pt(u.austin.firstElementChild),St=pt(t),Wt=ot.bottom>St.top&&ot.top<St.bottom;Z.scrim(((ot.left+ot.right)/2-St.left)/W,1-((ot.top+ot.bottom)/2-St.top)/l,.66*ot.width/W+.05,.8*ot.height/l+.07,Wt?.45*(1-ct.upk):0)}else Z.scrim(.5,.5,1,1,0);We();let Dt=q?oe(Ye,Re):0;Z.edge(fa.k,Ea||fa.col,gt(Math.max(.3,160/l),Math.max(.15,120/l),Dt),q?(Ea?.42:.3)*fa.k*mt(na,F,F+.05)*(1-Dt):0),Z.update(pa),zs(),Z.render();let ta=Lt(Gt/Pe.yEnd),ko=Math.round(ta*1e4),gr=Hr();(ko!==Rr||gr!==_r)&&(Rr=ko,_r=gr,ir.p=ta,ir.beat=gr,window.dispatchEvent(Ps))}let Fa=window.requestIdleCallback?(o,i=700)=>requestIdleCallback(o,{timeout:i}):o=>setTimeout(o,120),Ga=300,Er=!1;function $r(){if(Er||K.done)return;Er=!0;let o=i=>{if(!Da){if(i&&!i.didTimeout&&i.timeRemaining&&i.timeRemaining()<8)return Fa(o,Ga);K.step()?Fa(Vs,Ga):Fa(o,Ga)}};Fa(o,Ga)}function ks(){Da||(b.loadDeferred("mars"),K.loadMaps(),$r(),x&&(en=fe.addShrouds({next:()=>new Promise(o=>Fa(o,Ga)),alive:()=>!Da}).catch(o=>(console.warn("TerraFirma film: no shroud.",o),null))))}let en=null,Os=new e.WebGLRenderTarget(4,4,{type:e.HalfFloatType}),tn=o=>new Promise(i=>setTimeout(i,o)),Fs=T.extensions.has("KHR_parallel_shader_compile"),lr=new e.Object3D,oo=o=>{let i=o.parent,g=i?i.children.indexOf(o):-1;g>=0&&i.children.splice(g,1);try{if(Fs)return T.compileAsync(o,R,U);let y=performance.now();return T.compile(o,R,U),Oo&&console.log("[film warm] blocking compile",o.name||o.type,(performance.now()-y).toFixed(0)+" ms"),Promise.resolve()}finally{g>=0&&i.children.splice(g,0,o)}},Po=()=>[...$e,O,...j?[j.group]:[],...b.entryRoots()];function ro(o,i){let g=[fe.group,D,...Po()],y=g.map(q=>q.visible),G=T.getRenderTarget();fe.group.visible=o==="site",D.visible=o==="colony";for(let q of Po())q.visible=o==="space";T.setRenderTarget(Os);try{return i()}finally{g.forEach((q,be)=>q.visible=y[be]),T.setRenderTarget(G),T.compile(lr,R,U)}}function cr(o){let i=[],g=Na;ro(o,()=>{o==="colony"&&K.api.build(0,0);for(let y of o==="site"?[fe.group]:o==="colony"?[D,...b.entryRoots()]:Po())y.traverse(G=>{i.push([G,G.visible,G.frustumCulled]),G.visible=!0,G.frustumCulled=!1});try{nr(o==="site"),T.compile(lr,R,U),T.shadowMap.needsUpdate=o!=="space",T.render(U,R)}finally{for(let[y,G,q]of i)y.visible=G,y.frustumCulled=q}}),g&&nr(g==="site"),Ca=!0}async function Bs(){let o=[];await te,ro("site",()=>o.push(oo(fe.group))),ro("space",()=>{for(let i of Po())o.push(oo(i))}),await Promise.race([Promise.all(o),tn(1500)]),cr("site"),cr("space"),Z.warm({fx:x})}async function Vs(){if(Da)return;let o;ro("colony",()=>{K.api.build(0,0);let i=[];for(let g of[D,...b.entryRoots()])g.traverse(y=>{i.push([y,y.visible]),y.visible=!0});try{o=Promise.all([oo(D),...b.entryRoots().map(oo)])}finally{for(let[g,y]of i)g.visible=y}}),await Promise.race([o,tn(1500)]),await new Promise(i=>Fa(i,Ga)),!Da&&Na!=="colony"&&cr("colony")}let Us=Promise.all([b.ready,fe.ready,te]).then(()=>Bs()).then(()=>{qr=!0,Fa(ks)}),Ta=null;function an(){W=Math.max(1,t.clientWidth),l=Math.max(1,t.clientHeight),T.setSize(W,l,!1),Z.setSize(W,l),R.aspect=W/l,R.updateProjectionMatrix(),Pe=null,Oa&&(Oa=!1,R.clearViewOffset()),ce.reset()}Ta=new ResizeObserver(()=>{an()}),Ta.observe(t),Ta.observe(r),ke&&Ta.observe(ke),document.fonts?.ready.then(()=>{Pe=null});let ur=()=>{Pe=null};addEventListener("load",ur);let on=new URLSearchParams(location.search),rn=on.get("fps"),nn=rn==null?-1:Math.max(0,+rn||0),fr=Math.max(0,+on.get("idle")||0),sn=new Float32Array(31),ln=new Float32Array(31),Lo=0,hr=0,Ns=0,dr=0,ga=0,cn=-1,mr=0,vr=0;function un(o,i){o>0&&o<.1&&(sn[Ns++%31]=o,++dr>=30&&dr%15===0&&(ln.set(sn),ga=ln.sort()[15]));let g=scrollY;g!==cn&&(cn=g,mr=i);let y=fr&&i-mr>400?fr:0,G=nn>=0?nn:ga>0&&1/ga>=110?1/(2*ga):0;return y&&(!G||y<G)&&(G=y),G&&ga>0?Math.max(1,Math.round(1/(ga*G))):1}function fn(o){if(!(!yo||!qr||Da)){o=Math.max(0,o||0);{let i=scrollY;i!==we&&(we=i,Ce=performance.now())}if(!Pa&&!Za){let i=performance.now(),g=un(o,i);if(Lo+=o,hr++,++vr<g)return;vr=0,o=Lo,Lo=0,hr=0,me||(Ra+=Math.min(o,1/15)),fr&&i-mr>400||ce.frame(o*1e3)}else Lo=0,hr=0,vr=0,me||(Ra+=Math.min(o,1/15)),ce.frame(o*1e3/(Pa?2:1));H&&De(o),le.poll(),le.begin();try{Ls(Math.min(.05,o))}finally{le.end()}}}let pr=null,hn=o=>{if(Ja=requestAnimationFrame(hn),pr){pr();return}let i=wo?(o-wo)/1e3:1/60;wo=o,fn(i)};return{ready:Us,canvas:N,renderer:T,post:Z,scene:U,cam:R,aircraft:Ge,flight:Be,perf:ce,get shrouds(){return en},start(o=!1,i=null){yo||(yo=!0,ps=o,pr=i,Za=!0,wo=0,o||(Ja=requestAnimationFrame(hn)))},stop(){yo=!1,Ja&&(cancelAnimationFrame(Ja),Ja=0)},step:fn,resize:an,relayout:ur,setOverlap(o){Pa=!!o},setSeam(o){Ea=o&&o.length>=3?o:null},snap(){Za=!0},get pace(){return{hz:ga?+(1/ga).toFixed(1):0,every:Math.max(1,dr<30?1:un(0,performance.now()))}},tune:Le,look:Ir,get freeze(){return me},set freeze(o){me=!!o},yOfClock(o){Pe||Yt();let i=wt.k;return o<=-1?gt(i.yA,i.yE,Lt(o+2)):this.yOf(Math.min(o,Sa))},setClock(o){Ra=o},yOf(o){Pe||Yt();let i=0,g=Pe.yEnd;for(let y=0;y<50;y++){let G=(i+g)/2;Pe.S(G)<o?i=G:g=G}return(i+g)/2},get state(){return{y:Gt,v:Ho,t:Ra,s:Aa,S:Ye,mode:Pt,beat:Hr(),colonyDone:K.done,programs:T.info.programs.length,layout:Pe&&{yEnd:Pe.yEnd,vh:Pe.vh},touch:or.on,yT:Pe?-pt(r).top:0,dof:{k:zo.k,maxblur:zo.mb,focus:pa.focus},g:+Ha.toFixed(4),gL:+na.toFixed(4),over:+za.toFixed(4),edge:+fa.k.toFixed(3),end:+oe(Ye,Re).toFixed(4),overlap:Pa,seam:Ea&&Ea.map(o=>+o.toFixed(3)),perf:{level:ce.level,ceil:ce.ceil,p90:ce.state.p90,gpu:ce.state.gpu,capped:ce.state.capped,steps:ce.state.steps,pr:T.getPixelRatio(),post:Z.getQuality(),shadow:w.shadow.mapSize.x,every:Mo,keep:Me},mars:{star:ne.visible?+ua.uI.value.toFixed(3):0,disc:b.mars.visible},site:Aa<1?{hour:+ct.hour.toFixed(2),g:+ct.g.toFixed(3),dist:Math.round(ct.dist),world:ct.world,exp:+T.toneMappingExposure.toFixed(3)}:null}},dispose(){Da=!0,this.stop(),Ta&&Ta.disconnect(),removeEventListener("mousemove",Yr),Ao.removeEventListener?.("change",Kr),removeEventListener("load",ur);for(let o of["Ls","Rs"])At&&At[o]&&(At[o].style.transform="");Ge.dispose(),U.traverse(o=>{o.geometry&&o.geometry.dispose()}),le.dispose(),T.dispose(),N.remove()}}}export{Gc as createFilm};
