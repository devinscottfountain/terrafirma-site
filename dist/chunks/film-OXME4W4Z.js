import{a as Ra}from"./chunk-E5WEMQM4.js";import{a as _a}from"./chunk-YXDGKJ7S.js";import{a as Ur,b as Nr,c as Ir,e as Gr}from"./chunk-TAKKMMN3.js";import"./chunk-4C5RVMER.js";import{a as Fr,b as Vr}from"./chunk-M5U4GD3X.js";import"./chunk-FCTCDFK5.js";import{m as Tr}from"./chunk-VSEMZT6Q.js";import{Clock as ts,HalfFloatType as os,NoBlending as as,Vector2 as qr,WebGLRenderTarget as rs}from"three";var ma={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

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


		}`};import{ShaderMaterial as jr,UniformsUtils as es}from"three";import{BufferGeometry as Rn,Float32BufferAttribute as Wr,OrthographicCamera as _n,Mesh as Hn}from"three";var jt=class{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}},En=new _n(-1,1,1,-1,0,1),Ha=class extends Rn{constructor(){super(),this.setAttribute("position",new Wr([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new Wr([0,2,0,0,2,0],2))}},$n=new Ha,Zt=class{constructor(t){this._mesh=new Hn($n,t)}dispose(){this._mesh.geometry.dispose()}render(t){t.render(this._mesh,En)}get material(){return this._mesh.material}set material(t){this._mesh.material=t}};var ko=class extends jt{constructor(t,r){super(),this.textureID=r!==void 0?r:"tDiffuse",t instanceof jr?(this.uniforms=t.uniforms,this.material=t):t&&(this.uniforms=es.clone(t.uniforms),this.material=new jr({name:t.name!==void 0?t.name:"unspecified",defines:Object.assign({},t.defines),uniforms:this.uniforms,vertexShader:t.vertexShader,fragmentShader:t.fragmentShader})),this.fsQuad=new Zt(this.material)}render(t,r,l){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=l.texture),this.fsQuad.material=this.material,this.renderToScreen?(t.setRenderTarget(null),this.fsQuad.render(t)):(t.setRenderTarget(r),this.clear&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),this.fsQuad.render(t))}dispose(){this.material.dispose(),this.fsQuad.dispose()}};var Qo=class extends jt{constructor(t,r){super(),this.scene=t,this.camera=r,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(t,r,l){let o=t.getContext(),u=t.state;u.buffers.color.setMask(!1),u.buffers.depth.setMask(!1),u.buffers.color.setLocked(!0),u.buffers.depth.setLocked(!0);let S,w;this.inverse?(S=0,w=1):(S=1,w=0),u.buffers.stencil.setTest(!0),u.buffers.stencil.setOp(o.REPLACE,o.REPLACE,o.REPLACE),u.buffers.stencil.setFunc(o.ALWAYS,S,4294967295),u.buffers.stencil.setClear(w),u.buffers.stencil.setLocked(!0),t.setRenderTarget(l),this.clear&&t.clear(),t.render(this.scene,this.camera),t.setRenderTarget(r),this.clear&&t.clear(),t.render(this.scene,this.camera),u.buffers.color.setLocked(!1),u.buffers.depth.setLocked(!1),u.buffers.color.setMask(!0),u.buffers.depth.setMask(!0),u.buffers.stencil.setLocked(!1),u.buffers.stencil.setFunc(o.EQUAL,1,4294967295),u.buffers.stencil.setOp(o.KEEP,o.KEEP,o.KEEP),u.buffers.stencil.setLocked(!0)}},pa=class extends jt{constructor(){super(),this.needsSwap=!1}render(t){t.state.buffers.stencil.setLocked(!1),t.state.buffers.stencil.setTest(!1)}};var ga=class{constructor(t,r){if(this.renderer=t,this._pixelRatio=t.getPixelRatio(),r===void 0){let l=t.getSize(new qr);this._width=l.width,this._height=l.height,r=new rs(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:os}),r.texture.name="EffectComposer.rt1"}else this._width=r.width,this._height=r.height;this.renderTarget1=r,this.renderTarget2=r.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new ko(ma),this.copyPass.material.blending=as,this.clock=new ts}swapBuffers(){let t=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=t}addPass(t){this.passes.push(t),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(t,r){this.passes.splice(r,0,t),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(t){let r=this.passes.indexOf(t);r!==-1&&this.passes.splice(r,1)}isLastEnabledPass(t){for(let r=t+1;r<this.passes.length;r++)if(this.passes[r].enabled)return!1;return!0}render(t){t===void 0&&(t=this.clock.getDelta());let r=this.renderer.getRenderTarget(),l=!1;for(let o=0,u=this.passes.length;o<u;o++){let S=this.passes[o];if(S.enabled!==!1){if(S.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(o),S.render(this.renderer,this.writeBuffer,this.readBuffer,t,l),S.needsSwap){if(l){let w=this.renderer.getContext(),M=this.renderer.state.buffers.stencil;M.setFunc(w.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,t),M.setFunc(w.EQUAL,1,4294967295)}this.swapBuffers()}Qo!==void 0&&(S instanceof Qo?l=!0:S instanceof pa&&(l=!1))}}this.renderer.setRenderTarget(r)}reset(t){if(t===void 0){let r=this.renderer.getSize(new qr);this._pixelRatio=this.renderer.getPixelRatio(),this._width=r.width,this._height=r.height,t=this.renderTarget1.clone(),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=t,this.renderTarget2=t.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(t,r){this._width=t,this._height=r;let l=this._width*this._pixelRatio,o=this._height*this._pixelRatio;this.renderTarget1.setSize(l,o),this.renderTarget2.setSize(l,o);for(let u=0;u<this.passes.length;u++)this.passes[u].setSize(l,o)}setPixelRatio(t){this._pixelRatio=t,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}};import{AdditiveBlending as ss,Color as Kr,HalfFloatType as Ea,MeshBasicMaterial as is,ShaderMaterial as xa,UniformsUtils as Yr,Vector2 as ho,Vector3 as Zo,WebGLRenderTarget as $a}from"three";import{Color as ns}from"three";var Xr={name:"LuminosityHighPassShader",shaderID:"luminosityHighPass",uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new ns(0)},defaultOpacity:{value:0}},vertexShader:`

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

		}`};var Oo=class e extends jt{constructor(t,r,l,o){super(),this.strength=r!==void 0?r:1,this.radius=l,this.threshold=o,this.resolution=t!==void 0?new ho(t.x,t.y):new ho(256,256),this.clearColor=new Kr(0,0,0),this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let u=Math.round(this.resolution.x/2),S=Math.round(this.resolution.y/2);this.renderTargetBright=new $a(u,S,{type:Ea}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let y=0;y<this.nMips;y++){let A=new $a(u,S,{type:Ea});A.texture.name="UnrealBloomPass.h"+y,A.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(A);let b=new $a(u,S,{type:Ea});b.texture.name="UnrealBloomPass.v"+y,b.texture.generateMipmaps=!1,this.renderTargetsVertical.push(b),u=Math.round(u/2),S=Math.round(S/2)}let w=Xr;this.highPassUniforms=Yr.clone(w.uniforms),this.highPassUniforms.luminosityThreshold.value=o,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new xa({uniforms:this.highPassUniforms,vertexShader:w.vertexShader,fragmentShader:w.fragmentShader}),this.separableBlurMaterials=[];let M=[3,5,7,9,11];u=Math.round(this.resolution.x/2),S=Math.round(this.resolution.y/2);for(let y=0;y<this.nMips;y++)this.separableBlurMaterials.push(this.getSeperableBlurMaterial(M[y])),this.separableBlurMaterials[y].uniforms.invSize.value=new ho(1/u,1/S),u=Math.round(u/2),S=Math.round(S/2);this.compositeMaterial=this.getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=r,this.compositeMaterial.uniforms.bloomRadius.value=.1;let p=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=p,this.bloomTintColors=[new Zo(1,1,1),new Zo(1,1,1),new Zo(1,1,1),new Zo(1,1,1),new Zo(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors;let C=ma;this.copyUniforms=Yr.clone(C.uniforms),this.blendMaterial=new xa({uniforms:this.copyUniforms,vertexShader:C.vertexShader,fragmentShader:C.fragmentShader,blending:ss,depthTest:!1,depthWrite:!1,transparent:!0}),this.enabled=!0,this.needsSwap=!1,this._oldClearColor=new Kr,this.oldClearAlpha=1,this.basic=new is,this.fsQuad=new Zt(null)}dispose(){for(let t=0;t<this.renderTargetsHorizontal.length;t++)this.renderTargetsHorizontal[t].dispose();for(let t=0;t<this.renderTargetsVertical.length;t++)this.renderTargetsVertical[t].dispose();this.renderTargetBright.dispose();for(let t=0;t<this.separableBlurMaterials.length;t++)this.separableBlurMaterials[t].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this.basic.dispose(),this.fsQuad.dispose()}setSize(t,r){let l=Math.round(t/2),o=Math.round(r/2);this.renderTargetBright.setSize(l,o);for(let u=0;u<this.nMips;u++)this.renderTargetsHorizontal[u].setSize(l,o),this.renderTargetsVertical[u].setSize(l,o),this.separableBlurMaterials[u].uniforms.invSize.value=new ho(1/l,1/o),l=Math.round(l/2),o=Math.round(o/2)}render(t,r,l,o,u){t.getClearColor(this._oldClearColor),this.oldClearAlpha=t.getClearAlpha();let S=t.autoClear;t.autoClear=!1,t.setClearColor(this.clearColor,0),u&&t.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this.fsQuad.material=this.basic,this.basic.map=l.texture,t.setRenderTarget(null),t.clear(),this.fsQuad.render(t)),this.highPassUniforms.tDiffuse.value=l.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this.fsQuad.material=this.materialHighPassFilter,t.setRenderTarget(this.renderTargetBright),t.clear(),this.fsQuad.render(t);let w=this.renderTargetBright;for(let M=0;M<this.nMips;M++)this.fsQuad.material=this.separableBlurMaterials[M],this.separableBlurMaterials[M].uniforms.colorTexture.value=w.texture,this.separableBlurMaterials[M].uniforms.direction.value=e.BlurDirectionX,t.setRenderTarget(this.renderTargetsHorizontal[M]),t.clear(),this.fsQuad.render(t),this.separableBlurMaterials[M].uniforms.colorTexture.value=this.renderTargetsHorizontal[M].texture,this.separableBlurMaterials[M].uniforms.direction.value=e.BlurDirectionY,t.setRenderTarget(this.renderTargetsVertical[M]),t.clear(),this.fsQuad.render(t),w=this.renderTargetsVertical[M];this.fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,t.setRenderTarget(this.renderTargetsHorizontal[0]),t.clear(),this.fsQuad.render(t),this.fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,u&&t.state.buffers.stencil.setTest(!0),this.renderToScreen?(t.setRenderTarget(null),this.fsQuad.render(t)):(t.setRenderTarget(l),this.fsQuad.render(t)),t.setClearColor(this._oldClearColor,this.oldClearAlpha),t.autoClear=S}getSeperableBlurMaterial(t){let r=[];for(let l=0;l<t;l++)r.push(.39894*Math.exp(-.5*l*l/(t*t))/t);return new xa({defines:{KERNEL_RADIUS:t},uniforms:{colorTexture:{value:null},invSize:{value:new ho(.5,.5)},direction:{value:new ho(.5,.5)},gaussianCoefficients:{value:r}},vertexShader:`varying vec2 vUv;
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
				}`})}getCompositeMaterial(t){return new xa({defines:{NUM_MIPS:t},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`varying vec2 vUv;
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
				}`})}};Oo.BlurDirectionX=new ho(1,0);Oo.BlurDirectionY=new ho(0,1);import{Color as ls,HalfFloatType as cs,MeshDepthMaterial as us,NearestFilter as Zr,NoBlending as fs,RGBADepthPacking as hs,ShaderMaterial as ds,UniformsUtils as vs,WebGLRenderTarget as ms}from"three";var Qr={name:"BokehShader",defines:{DEPTH_PACKING:1,PERSPECTIVE_CAMERA:1},uniforms:{tColor:{value:null},tDepth:{value:null},focus:{value:1},aspect:{value:1},aperture:{value:.025},maxblur:{value:.01},nearClip:{value:1},farClip:{value:1e3}},vertexShader:`

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

		}`};var ba=class extends jt{constructor(t,r,l){super(),this.scene=t,this.camera=r;let o=l.focus!==void 0?l.focus:1,u=l.aperture!==void 0?l.aperture:.025,S=l.maxblur!==void 0?l.maxblur:1;this.renderTargetDepth=new ms(1,1,{minFilter:Zr,magFilter:Zr,type:cs}),this.renderTargetDepth.texture.name="BokehPass.depth",this.materialDepth=new us,this.materialDepth.depthPacking=hs,this.materialDepth.blending=fs;let w=Qr,M=vs.clone(w.uniforms);M.tDepth.value=this.renderTargetDepth.texture,M.focus.value=o,M.aspect.value=r.aspect,M.aperture.value=u,M.maxblur.value=S,M.nearClip.value=r.near,M.farClip.value=r.far,this.materialBokeh=new ds({defines:Object.assign({},w.defines),uniforms:M,vertexShader:w.vertexShader,fragmentShader:w.fragmentShader}),this.uniforms=M,this.fsQuad=new Zt(this.materialBokeh),this._oldClearColor=new ls}render(t,r,l){this.scene.overrideMaterial=this.materialDepth,t.getClearColor(this._oldClearColor);let o=t.getClearAlpha(),u=t.autoClear;t.autoClear=!1,t.setClearColor(16777215),t.setClearAlpha(1),t.setRenderTarget(this.renderTargetDepth),t.clear(),t.render(this.scene,this.camera),this.uniforms.tColor.value=l.texture,this.uniforms.nearClip.value=this.camera.near,this.uniforms.farClip.value=this.camera.far,this.renderToScreen?(t.setRenderTarget(null),this.fsQuad.render(t)):(t.setRenderTarget(r),t.clear(),this.fsQuad.render(t)),this.scene.overrideMaterial=null,t.setClearColor(this._oldClearColor),t.setClearAlpha(o),t.autoClear=u}setSize(t,r){this.materialBokeh.uniforms.aspect.value=t/r,this.renderTargetDepth.setSize(t,r)}dispose(){this.renderTargetDepth.dispose(),this.materialDepth.dispose(),this.materialBokeh.dispose(),this.fsQuad.dispose()}};import{HalfFloatType as Jr,LinearFilter as ps,NearestFilter as Rr,ShaderMaterial as tr,Texture as _r,UniformsUtils as or,WebGLRenderTarget as Hr}from"three";import{Vector2 as er}from"three";var Jo={name:"SMAAEdgesShader",defines:{SMAA_THRESHOLD:"0.1"},uniforms:{tDiffuse:{value:null},resolution:{value:new er(1/1024,1/512)}},vertexShader:`

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

		}`},Ro={name:"SMAAWeightsShader",defines:{SMAA_MAX_SEARCH_STEPS:"8",SMAA_AREATEX_MAX_DISTANCE:"16",SMAA_AREATEX_PIXEL_SIZE:"( 1.0 / vec2( 160.0, 560.0 ) )",SMAA_AREATEX_SUBTEX_SIZE:"( 1.0 / 7.0 )"},uniforms:{tDiffuse:{value:null},tArea:{value:null},tSearch:{value:null},resolution:{value:new er(1/1024,1/512)}},vertexShader:`

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

		}`},wa={name:"SMAABlendShader",uniforms:{tDiffuse:{value:null},tColor:{value:null},resolution:{value:new er(1/1024,1/512)}},vertexShader:`

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

		}`};var ya=class extends jt{constructor(t,r){super(),this.edgesRT=new Hr(t,r,{depthBuffer:!1,type:Jr}),this.edgesRT.texture.name="SMAAPass.edges",this.weightsRT=new Hr(t,r,{depthBuffer:!1,type:Jr}),this.weightsRT.texture.name="SMAAPass.weights";let l=this,o=new Image;o.src=this.getAreaTexture(),o.onload=function(){l.areaTexture.needsUpdate=!0},this.areaTexture=new _r,this.areaTexture.name="SMAAPass.area",this.areaTexture.image=o,this.areaTexture.minFilter=ps,this.areaTexture.generateMipmaps=!1,this.areaTexture.flipY=!1;let u=new Image;u.src=this.getSearchTexture(),u.onload=function(){l.searchTexture.needsUpdate=!0},this.searchTexture=new _r,this.searchTexture.name="SMAAPass.search",this.searchTexture.image=u,this.searchTexture.magFilter=Rr,this.searchTexture.minFilter=Rr,this.searchTexture.generateMipmaps=!1,this.searchTexture.flipY=!1,this.uniformsEdges=or.clone(Jo.uniforms),this.uniformsEdges.resolution.value.set(1/t,1/r),this.materialEdges=new tr({defines:Object.assign({},Jo.defines),uniforms:this.uniformsEdges,vertexShader:Jo.vertexShader,fragmentShader:Jo.fragmentShader}),this.uniformsWeights=or.clone(Ro.uniforms),this.uniformsWeights.resolution.value.set(1/t,1/r),this.uniformsWeights.tDiffuse.value=this.edgesRT.texture,this.uniformsWeights.tArea.value=this.areaTexture,this.uniformsWeights.tSearch.value=this.searchTexture,this.materialWeights=new tr({defines:Object.assign({},Ro.defines),uniforms:this.uniformsWeights,vertexShader:Ro.vertexShader,fragmentShader:Ro.fragmentShader}),this.uniformsBlend=or.clone(wa.uniforms),this.uniformsBlend.resolution.value.set(1/t,1/r),this.uniformsBlend.tDiffuse.value=this.weightsRT.texture,this.materialBlend=new tr({uniforms:this.uniformsBlend,vertexShader:wa.vertexShader,fragmentShader:wa.fragmentShader}),this.fsQuad=new Zt(null)}render(t,r,l){this.uniformsEdges.tDiffuse.value=l.texture,this.fsQuad.material=this.materialEdges,t.setRenderTarget(this.edgesRT),this.clear&&t.clear(),this.fsQuad.render(t),this.fsQuad.material=this.materialWeights,t.setRenderTarget(this.weightsRT),this.clear&&t.clear(),this.fsQuad.render(t),this.uniformsBlend.tColor.value=l.texture,this.fsQuad.material=this.materialBlend,this.renderToScreen?(t.setRenderTarget(null),this.fsQuad.render(t)):(t.setRenderTarget(r),this.clear&&t.clear(),this.fsQuad.render(t))}setSize(t,r){this.edgesRT.setSize(t,r),this.weightsRT.setSize(t,r),this.materialEdges.uniforms.resolution.value.set(1/t,1/r),this.materialWeights.uniforms.resolution.value.set(1/t,1/r),this.materialBlend.uniforms.resolution.value.set(1/t,1/r)}getAreaTexture(){return"data:image/png;base64,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"}getSearchTexture(){return"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAAAhCAAAAABIXyLAAAAAOElEQVRIx2NgGAWjYBSMglEwEICREYRgFBZBqDCSLA2MGPUIVQETE9iNUAqLR5gIeoQKRgwXjwAAGn4AtaFeYLEAAAAASUVORK5CYII="}dispose(){this.edgesRT.dispose(),this.weightsRT.dispose(),this.areaTexture.dispose(),this.searchTexture.dispose(),this.materialEdges.dispose(),this.materialWeights.dispose(),this.materialBlend.dispose(),this.fsQuad.dispose()}};var _o="varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }";function $r({THREE:e,renderer:t,scene:r,cam:l,cine:o=!0,low:u=!1}){let S=t.getPixelRatio(),w=t.getSize(new e.Vector2),M=Math.max(1,Math.floor(w.x*S)),p=Math.max(1,Math.floor(w.y*S)),C={enabled:!0,shutter:.6,maxLen:.035,minPx:.35,cutDist:400,cutAngle:.7,active:!1},y={enabled:!0,min:.55,max:1.35,ref:-2.4,strength:.5,rateToBright:2.4,rateToDark:.7,linear:1,lumMin:.03,lumMax:24},A={enabled:!1,amount:.65,clamp:.15,depthTol:.06,cutAngle:.5,active:!1},b={enabled:!1,radius:.03,intensity:1,bias:.12,maxPx:48,debug:!1,active:!1},n=new ga(t);class V extends jt{constructor(){super(),this.needsSwap=!1,this.useRT=!1,this.jx=0,this.jy=0,this.rt=new e.WebGLRenderTarget(M,p,{type:e.HalfFloatType,depthTexture:new e.DepthTexture(M,p)})}render(d,O,B){let R=d.autoClear;if(d.autoClear=!1,d.setRenderTarget(this.useRT?this.rt:B),d.clear(!0,!0,!0),this.jx||this.jy){let de=l.projectionMatrix.elements,Ue=de[8],Ke=de[9],Re=this.rt;de[8]+=2*this.jx/Re.width,de[9]+=2*this.jy/Re.height;try{d.render(r,l)}finally{de[8]=Ue,de[9]=Ke}}else d.render(r,l);d.autoClear=R}setSize(d,O){this.rt.setSize(d,O),this.rt.depthTexture.image.width=d,this.rt.depthTexture.image.height=O}}let P=new V;n.addPass(P);let G=`
    uniform float near; uniform float far;
    float viewZ(float d){ return (near*far)/((far-near)*d-far); } // perspective depth -> view z (negative)`,K="float ign(vec2 p){ return fract(52.9829189*fract(dot(p,vec2(0.06711056,0.00583715)))); }";class H extends jt{constructor(){super(),this.blur=!1,this.histOk=!1,this.histVP=new e.Matrix4,this.histRel=new e.Matrix4,this.invVP=new e.Matrix4,this.w=M,this.h=p,this.hist=null,this.tmp=null,this.aoA=null,this.aoB=null;let d=(O,B)=>new e.ShaderMaterial({uniforms:O,vertexShader:_o,depthTest:!1,depthWrite:!1,fragmentShader:B});this.u={tColor:{value:null},tDepth:{value:null},invVP:{value:new e.Matrix4},prevVP:{value:new e.Matrix4},scale:{value:.5},maxLen:{value:.035},res:{value:new e.Vector2(M,p)}},this.mBlur=d(this.u,`
        uniform sampler2D tColor; uniform sampler2D tDepth; uniform mat4 invVP; uniform mat4 prevVP; uniform float scale; uniform float maxLen; uniform vec2 res; varying vec2 vUv;
        ${K}
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
          gl_FragColor=vec4(acc/n,1.); }`),this.mCopy=d({tColor:{value:null}},"uniform sampler2D tColor; varying vec2 vUv; void main(){ gl_FragColor=vec4(texture2D(tColor,vUv).rgb,1.); }"),this.uT={tColor:{value:null},tDepth:{value:null},tHist:{value:null},invVP:{value:null},histVP:{value:null},res:{value:new e.Vector2(M,p)},near:{value:1},far:{value:1e3},w:{value:.65},clampK:{value:.15},tol:{value:.06},valid:{value:0}},this.mTrail=d(this.uT,`
        uniform sampler2D tColor; uniform sampler2D tDepth; uniform sampler2D tHist; uniform mat4 invVP; uniform mat4 histVP; uniform vec2 res;
        uniform float w, clampK, tol, valid; varying vec2 vUv;
        ${G}
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
          gl_FragColor=vec4(mix(c,h,w*(1.-disocc)),zl); }`),this.uAO={tDepth:{value:null},res:{value:new e.Vector2(M,p)},near:{value:1},far:{value:1e3},pInv:{value:new e.Vector2(1,1)},projScale:{value:500},radius:{value:.02},intensity:{value:1},bias:{value:.12},maxPx:{value:48}},this.mAO=d(this.uAO,`
        uniform sampler2D tDepth; uniform vec2 res; uniform vec2 pInv; uniform float projScale, radius, intensity, bias, maxPx; varying vec2 vUv;
        ${G}
        ${K}
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
          gl_FragColor=vec4(clamp(1.-intensity*occ/3.,0.,1.),-P.z,0.,1.); }`),this.uAOB={tAO:{value:null},dir:{value:new e.Vector2(1,0)},hres:{value:new e.Vector2(M>>1,p>>1)}},this.mAOBlur=d(this.uAOB,`
        uniform sampler2D tAO; uniform vec2 dir; uniform vec2 hres; varying vec2 vUv;
        void main(){
          ivec2 p=ivec2(gl_FragCoord.xy), mx=ivec2(hres)-1; vec2 c=texelFetch(tAO,p,0).xy; float s=c.x, ws=1., k=1./(.03*c.y);
          for(int i=-4;i<=4;i++){ if(i==0) continue;
            vec2 t=texelFetch(tAO,clamp(p+ivec2(dir)*i,ivec2(0),mx),0).xy;
            float wt=exp(-float(i*i)*.125)*max(0.,1.-abs(t.y-c.y)*k); s+=t.x*wt; ws+=wt; }
          gl_FragColor=vec4(s/ws,c.y,0.,1.); }`),this.uAOC={tColor:{value:null},tDepth:{value:null},tAO:{value:null},hres:{value:new e.Vector2(M>>1,p>>1)},near:{value:1},far:{value:1e3},dbg:{value:0}},this.mAOComp=d(this.uAOC,`
        uniform sampler2D tColor; uniform sampler2D tDepth; uniform sampler2D tAO; uniform vec2 hres; uniform float dbg; varying vec2 vUv;
        ${G}
        void main(){
          vec4 c=texture2D(tColor,vUv); float d=texture2D(tDepth,vUv).x;
          if(d>=.999999){ gl_FragColor=vec4(c.rgb,1.); return; }
          float z=-viewZ(d), k=1./(.03*z);
          vec2 hp=vUv*hres-.5, f=fract(hp); ivec2 b=ivec2(floor(hp)), mx=ivec2(hres)-1;
          float s=0., ws=1e-4;                                    // joint bilateral upsample: bilinear weights x depth similarity
          for(int y=0;y<2;y++) for(int x=0;x<2;x++){
            vec2 t=texelFetch(tAO,clamp(b+ivec2(x,y),ivec2(0),mx),0).xy;
            float wt=(x==0?1.-f.x:f.x)*(y==0?1.-f.y:f.y)*max(1e-3,1.-abs(t.y-z)*k); s+=t.x*wt; ws+=wt; }
          gl_FragColor=vec4(dbg>.5 ? vec3(.6*s/ws) : c.rgb*(s/ws),1.); }`),this.fsQuad=new Zt(this.mCopy),this.taa=!1,this.direct=!1,this.outTex=null,this.mTaa=null}draw(d,O,B){this.fsQuad.material=O,d.setRenderTarget(B),this.fsQuad.render(d)}alloc(){let d=(R,de,Ue)=>new e.WebGLRenderTarget(R,de,{type:e.HalfFloatType,depthBuffer:!1,minFilter:Ue,magFilter:Ue}),O=Math.max(1,this.w>>1),B=Math.max(1,this.h>>1);(A.enabled||this.taa)&&!this.hist&&(this.hist=[d(this.w,this.h,e.LinearFilter),d(this.w,this.h,e.LinearFilter)],this.histOk=!1),b.enabled&&!this.aoA&&(this.aoA=d(O,B,e.NearestFilter),this.aoB=d(O,B,e.NearestFilter)),b.enabled&&(A.enabled||this.taa||this.blur)&&!this.tmp&&(this.tmp=d(this.w,this.h,e.LinearFilter))}render(d,O){this.alloc();let B=P.rt.depthTexture,R=P.rt.texture,de=!1,Ue=l.near,Ke=l.far,Re=!A.enabled&&!this.taa&&!this.blur;if(this.outTex=O?O.texture:null,b.enabled){let Ne=l.projectionMatrix.elements;this.uAO.tDepth.value=B,this.uAO.near.value=Ue,this.uAO.far.value=Ke,this.uAO.pInv.value.set(1/Ne[0],1/Ne[5]),this.uAO.projScale.value=.5*this.h*Ne[5],this.uAO.radius.value=b.radius,this.uAO.intensity.value=b.intensity,this.uAO.bias.value=b.bias,this.uAO.maxPx.value=b.maxPx,this.draw(d,this.mAO,this.aoA),this.uAOB.tAO.value=this.aoA.texture,this.uAOB.dir.value.set(1,0),this.draw(d,this.mAOBlur,this.aoB),this.uAOB.tAO.value=this.aoB.texture,this.uAOB.dir.value.set(0,1),this.draw(d,this.mAOBlur,this.aoA);let qe=this.uAOC;qe.tColor.value=R,qe.tDepth.value=B,qe.tAO.value=this.aoA.texture,qe.near.value=Ue,qe.far.value=Ke,qe.dbg.value=b.debug?1:0,this.draw(d,this.mAOComp,Re?O:this.tmp),Re?de=!0:R=this.tmp.texture}if(A.enabled){let Ne=this.uT,qe=this.hist[0],yt=this.hist[1];Ne.tColor.value=R,Ne.tDepth.value=B,Ne.tHist.value=qe.texture,Ne.invVP.value=this.invVP,Ne.histVP.value=this.histRel,Ne.near.value=Ue,Ne.far.value=Ke,Ne.valid.value=this.histOk?1:0,Ne.w.value=Math.pow(e.MathUtils.clamp(A.amount,0,.98),e.MathUtils.clamp(fe*60,.25,4)),Ne.clampK.value=A.clamp,Ne.tol.value=A.depthTol,this.draw(d,this.mTrail,yt),this.hist[0]=yt,this.hist[1]=qe,this.histVP.copy(ge),this.histOk=!0,R=yt.texture}else if(this.taa){let Ne=this.mTaa.uniforms,qe=this.hist[0],yt=this.hist[1];Ne.tColor.value=R,Ne.tDepth.value=B,Ne.tHist.value=qe.texture,Ne.invVP.value=this.invVP,Ne.histVP.value=this.histRel,Ne.valid.value=this.histOk?1:0,this.draw(d,this.mTaa,yt),this.hist[0]=yt,this.hist[1]=qe,this.histVP.copy(ge),this.histOk=!0,R=yt.texture}this.blur?(this.u.tColor.value=R,this.u.tDepth.value=B,this.draw(d,this.mBlur,O)):!de&&this.direct?this.outTex=R:de||(this.mCopy.uniforms.tColor.value=R,this.draw(d,this.mCopy,O))}setSize(d,O){this.w=d,this.h=O,this.u.res.value.set(d,O),this.uT.res.value.set(d,O),this.uAO.res.value.set(d,O);let B=Math.max(1,d>>1),R=Math.max(1,O>>1);this.uAOB.hres.value.set(B,R),this.uAOC.hres.value.set(B,R);for(let de of[this.tmp,...this.hist||[]])de&&de.setSize(d,O);for(let de of[this.aoA,this.aoB])de&&de.setSize(B,R);this.mTaa&&this.mTaa.uniforms.res.value.set(d,O),this.histOk=!1}dispose(){for(let d of[this.tmp,this.aoA,this.aoB,...this.hist||[]])d&&d.dispose();this.hist=this.tmp=this.aoA=this.aoB=null}}let ee=new H;ee.enabled=!1,n.addPass(ee);let se=new ba(r,l,{focus:30,aperture:1e-4,maxblur:.002});se.materialBokeh.defines.DEPTH_PACKING=0,se.materialBokeh.needsUpdate=!0,se.renderTargetDepth.dispose(),se.render=function(q,d,O){let B=this.uniforms;B.tColor.value=ee.enabled?O.texture:P.rt.texture,B.tDepth.value=P.rt.depthTexture,B.nearClip.value=l.near,B.farClip.value=l.far,q.setRenderTarget(this.renderToScreen?null:d),this.fsQuad.render(q)},se.setSize=function(q,d){this.uniforms.aspect.value=q/d},n.addPass(se);let ye=o?{strength:.6,radius:.5,threshold:.72,separableBlurMaterials:[]}:new Oo(new e.Vector2(M,p),.8,.5,.72);o||n.addPass(ye);class le extends jt{constructor(){super();let d=(O,B)=>new e.WebGLRenderTarget(O,O,{type:B,depthBuffer:!1,magFilter:e.NearestFilter,minFilter:e.NearestFilter});this.t64=d(64,e.HalfFloatType),this.t8=d(8,e.HalfFloatType),this.t1=d(1,e.HalfFloatType),this.sA=d(1,e.FloatType),this.sB=d(1,e.FloatType),this.first=!0,this.snap=!0,this.mDown=new e.ShaderMaterial({uniforms:{tSrc:{value:null},lumMax:{value:24},lumMin:{value:.03}},vertexShader:_o,depthTest:!1,fragmentShader:`
        uniform sampler2D tSrc; uniform float lumMax; uniform float lumMin; varying vec2 vUv;
        void main(){ vec2 base=floor(gl_FragCoord.xy)/64.; vec3 acc=vec3(0.);
          for(int y=0;y<4;y++) for(int x=0;x<4;x++){
            vec2 uv=base+(vec2(float(x),float(y))+.5)/256.;
            vec3 c=texture2D(tSrc,uv).rgb; float l=clamp(dot(c,vec3(.2126,.7152,.0722)),lumMin,lumMax);
            float k=length(uv-.5)*2.; float wt=mix(1.,.35,smoothstep(.2,1.1,k)); // centre-weighted metering
            acc+=vec3(log(l)*wt,wt,l*l*wt); }
          gl_FragColor=vec4(acc/16.,1.); }`}),this.mReduce=new e.ShaderMaterial({uniforms:{tSrc:{value:null}},vertexShader:_o,depthTest:!1,fragmentShader:`
        uniform sampler2D tSrc; varying vec2 vUv;
        void main(){ ivec2 b=ivec2(gl_FragCoord.xy)*8; vec3 acc=vec3(0.);
          for(int y=0;y<8;y++) for(int x=0;x<8;x++) acc+=texelFetch(tSrc,b+ivec2(x,y),0).rgb;
          gl_FragColor=vec4(acc/64.,1.); }`}),this.mAdapt=new e.ShaderMaterial({uniforms:{tAvg:{value:null},tPrev:{value:null},dt:{value:.016},base:{value:1.05},ref:{value:-3.2},strength:{value:.5},eMin:{value:.55},eMax:{value:1.35},up:{value:2.4},down:{value:.7},snap:{value:1},on:{value:1},lin:{value:1}},vertexShader:_o,depthTest:!1,fragmentShader:`
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
        }`}),this.fsQuad=new Zt(this.mDown),this.dt=1/60,this._cs=null,this._tm=null}pass(d,O,B){this.fsQuad.material=O,d.setRenderTarget(B),this.fsQuad.render(d)}render(d,O,B){if(this._cs!==d.outputColorSpace||this._tm!==d.toneMapping){this._cs=d.outputColorSpace,this._tm=d.toneMapping;let Ue={};e.ColorManagement.getTransfer(this._cs)===e.SRGBTransfer&&(Ue.SRGB_TRANSFER="");let Ke={[e.LinearToneMapping]:"LINEAR_TONE_MAPPING",[e.ReinhardToneMapping]:"REINHARD_TONE_MAPPING",[e.CineonToneMapping]:"CINEON_TONE_MAPPING",[e.ACESFilmicToneMapping]:"ACES_FILMIC_TONE_MAPPING",[e.AgXToneMapping]:"AGX_TONE_MAPPING"}[this._tm];Ke&&(Ue[Ke]=""),this.mTone.defines=Ue,this.mTone.needsUpdate=!0}y.enabled&&(this.mDown.uniforms.tSrc.value=B.texture,this.mDown.uniforms.lumMax.value=y.lumMax,this.mDown.uniforms.lumMin.value=y.lumMin,this.pass(d,this.mDown,this.t64),this.mReduce.uniforms.tSrc.value=this.t64.texture,this.pass(d,this.mReduce,this.t8),this.mReduce.uniforms.tSrc.value=this.t8.texture,this.pass(d,this.mReduce,this.t1));let R=this.mAdapt.uniforms;R.tAvg.value=this.t1.texture,R.tPrev.value=this.sA.texture,R.dt.value=Math.min(this.dt,.1),R.base.value=d.toneMappingExposure,R.ref.value=y.ref,R.strength.value=y.strength,R.eMin.value=y.min,R.eMax.value=y.max,R.up.value=y.rateToBright,R.down.value=y.rateToDark,R.lin.value=y.linear,R.snap.value=this.snap?1:0,R.on.value=y.enabled?1:0,this.snap=!1,this.pass(d,this.mAdapt,this.sB);let de=this.sA;this.sA=this.sB,this.sB=de,this.mTone.uniforms.tDiffuse.value=B.texture,this.mTone.uniforms.tExp.value=this.sA.texture,this.pass(d,this.mTone,this.renderToScreen?null:O)}}let Se=new le;n.addPass(Se);let Ge=new ya(M,p);n.addPass(Ge);let re=new ko({uniforms:{tDiffuse:{value:null},ca:{value:.012},time:{value:0},grain:{value:.045},res:{value:new e.Vector2(M,p)}},vertexShader:"varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }",fragmentShader:`uniform sampler2D tDiffuse; uniform float ca; uniform float time; uniform float grain; uniform vec2 res; varying vec2 vUv;
    void main(){
      vec2 c=vUv-.5; float r2=dot(c,c);
      vec2 uv=.5+c*(1.-0.035*r2);              // barrel, pulls the corners in a touch
      vec2 o=c*r2*ca;                           // fringing grows toward the edges, zero at center
      vec3 col=vec3(texture2D(tDiffuse,uv+o).r, texture2D(tDiffuse,uv).g, texture2D(tDiffuse,uv-o).b);
      col*=mix(1.,smoothstep(0.75,0.12,r2*1.6),0.55); // vignette
      float n=fract(sin(dot(floor(vUv*res)+fract(time*7.31)*91.7,vec2(12.9898,78.233)))*43758.5453);
      col+=(n-.5)*grain*(1.-dot(col,vec3(.33))*0.6); // grain sits mostly in the shadows, like film
      gl_FragColor=vec4(col,1.); }`});o||n.addPass(re);let D=o?xs({THREE:e,renderer:t,cam:l,composer:n,scenePass:P,mbPass:ee,dof:se,tonePass:Se,smaa:Ge,bloom:ye,FS_VERT:_o,low:u}):null,ge=new e.Matrix4,E=new e.Matrix4,J=new e.Matrix4,me=new e.Matrix4,he=new e.Matrix4,be=new e.Vector3,ue=new e.Vector3,te=new e.Quaternion,ie=!1,fe=1/60,Oe=!1,Ee=M;function Ye(q,d){t.setSize(q,d),l.aspect=q/d,l.updateProjectionMatrix();let O=t.getPixelRatio();Ee=Math.max(1,Math.floor(q*O)),n.setSize(q,d),re.uniforms.res.value.set(q,d),Oe=!0,D&&D.setSize()}function ne({dt:q=1/60,t:d=0,ca:O,focus:B,aperture:R,maxblur:de}={}){fe=Math.max(q,1e-4),Se.dt=fe,B!==void 0&&(se.uniforms.focus.value=B),R!==void 0&&(se.uniforms.aperture.value=R),de!==void 0&&(se.uniforms.maxblur.value=de),O!==void 0&&(re.uniforms.ca.value=O),re.uniforms.time.value=d,D&&(D.time=d);let Ue=!!D&&D.taaOn()&&!A.enabled;l.updateMatrixWorld(),ge.multiplyMatrices(l.projectionMatrix,l.matrixWorldInverse),be.setFromMatrixPosition(l.matrixWorld),me.makeTranslation(be.x,be.y,be.z),J.copy(ge).invert().premultiply(he.makeTranslation(-be.x,-be.y,-be.z));let Ke=!1,Re=ie?l.position.distanceTo(ue):0,Ne=ie?te.angleTo(l.quaternion):0;if(ie&&!Oe&&C.enabled){let Mt=Math.min(Math.max(B===void 0?se.uniforms.focus.value:B,3),60),_e=l.fov*Math.PI/180,Y=(Ne+Re/Mt)/_e*p,ze=e.MathUtils.clamp(C.shutter*(1/60)/fe,.15,2);if(Re<C.cutDist&&Ne<C.cutAngle&&Y*ze>C.minPx){Ke=!0;let We=ee.u;We.prevVP.value.multiplyMatrices(E,me),We.invVP.value.copy(J),We.scale.value=ze,We.maxLen.value=C.maxLen}}let qe=A.enabled||Ue;(!qe||!ie||Oe||Re>=C.cutDist||Ne>=Math.min(C.cutAngle,A.cutAngle))&&(ee.histOk=!1),qe?(ee.invVP.copy(J),ee.histRel.multiplyMatrices(ee.histVP,me)):ee.hist&&(ee.hist.forEach(Mt=>Mt.dispose()),ee.hist=null),!b.enabled&&ee.aoA&&(ee.aoA.dispose(),ee.aoB.dispose(),ee.aoA=ee.aoB=null),!b.enabled&&ee.tmp&&(ee.tmp.dispose(),ee.tmp=null),ee.blur=Ke,ee.taa=Ue;let yt=Ke||A.enabled||b.enabled||Ue;C.active=Ke,A.active=A.enabled,b.active=b.enabled;let Gt=.4*se.uniforms.maxblur.value*Ee>=.5;ee.enabled=yt,se.enabled=Gt,P.useRT=yt||Gt||!!D,D&&D.jitter(Ue),E.copy(ge),ue.copy(l.position),te.copy(l.quaternion),ie=!0,Oe=!1}function Qe(){D?D.render():n.render(fe)}function Ve({fx:q=!0}={}){if(D){let O=[P.enabled,ee.enabled,ee.blur,ee.taa,se.enabled,A.enabled,b.enabled];try{P.enabled=!1,ee.enabled=!0,se.enabled=!0,A.enabled=!1,b.enabled=q,ee.blur=!0,ee.taa=!0,D.render(!0,0),ee.blur=!1,ee.taa=!1,b.enabled=!1,A.enabled=q,D.render(!0,1)}finally{[P.enabled,ee.enabled,ee.blur,ee.taa,se.enabled,A.enabled,b.enabled]=O,ee.histOk=!1,Se.snap=!0,Oe=!0}return}let d=[P.enabled,P.useRT,ee.enabled,ee.blur,se.enabled,A.enabled,b.enabled];try{P.enabled=!1,P.useRT=!0,ee.enabled=!0,se.enabled=!0,ee.blur=!0,A.enabled=b.enabled=q,n.render(1/60),ee.blur=!1,A.enabled=b.enabled=!1,n.render(1/60)}finally{[P.enabled,P.useRT,ee.enabled,ee.blur,se.enabled,A.enabled,b.enabled]=d,ee.histOk=!1,Se.snap=!0,Oe=!0}}let Te=new Float32Array(4);function Ce(){return t.readRenderTargetPixels(Se.sA,0,0,1,1,Te),{exposure:Te[0],lnLum:Te[1]}}return{composer:n,dof:se,lens:re,bloom:ye,smaa:Ge,setSize:Ye,update:ne,render:Qe,warm:Ve,motion:C,auto:y,trails:A,ao:b,resetMotion(){Oe=!0},snapExposure(){Se.snap=!0},getExposure:Ce,cine:!!D,fx:D?D.fx:null,look:D?D.look:null,grade:D?D.grade:null,lensFrame:D?q=>D.lensFrame(q):()=>{},scrim:D?(q,d,O,B,R)=>D.scrim(q,d,O,B,R):()=>{},edge:D?(q,d,O,B)=>D.edge(q,d,O,B):()=>{},setQuality:D?q=>D.setQuality(q):()=>{},setPostQuality:D?q=>D.setQuality(q):()=>{},getQuality:()=>D?D.level:-1,gpuTimes:D?()=>D.gpuTimes():()=>null}}var Er=`
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
`,gs=new Set;function xs({THREE:e,renderer:t,cam:r,composer:l,scenePass:o,mbPass:u,dof:S,tonePass:w,smaa:M,bloom:p,FS_VERT:C,low:y=!1}){let A=e.HalfFloatType,b=e.LinearFilter,n=()=>new e.WebGLRenderTarget(1,1,{type:A,depthBuffer:!1,minFilter:b,magFilter:b,generateMipmaps:!1}),V=new Zt(null),P=(Y,ze)=>new e.ShaderMaterial({uniforms:ze,vertexShader:C,fragmentShader:Y,depthTest:!1,depthWrite:!1}),G=(Y,ze)=>{V.material=Y,t.setRenderTarget(ze),V.render(t)},K={flash:0,heat:0,heatAt:null,dirt:0,streak:1,streakAdd:0,bloom:0},H={bloom:.5,threshold:1,knee:.6,streakThr:6,streak:0,streakTint:new e.Color(.86,.92,1),vignette:.3,grain:.04,taaStill:.9,taaMove:.7},ee={expK:1,wr:1,wg:1,wb:1,contrast:1,saturation:1,lift:0,gamma:1,gain:1},se=[{aa:0,div:2,lv:3,streak:!1},{aa:1,div:2,lv:4,streak:!0},{aa:2,div:1,lv:5,streak:!0},{aa:3,div:1,lv:5,streak:!0}],ye=[.46,.3,.15,.06,.03],le=-1,Se=se[3],Ge=!1,re=0,D=n(),ge=[],E=[],J=[n(),n()];for(let Y=0;Y<5;Y++)ge.push(n()),E.push(n());let me=P(`
    uniform sampler2D tSrc; uniform vec2 uTexel; uniform float uThr, uKnee; varying vec2 vUv;
    vec3 tap(vec2 o){ vec3 c=texture2D(tSrc,vUv+o*uTexel).rgb; return any(isnan(c)) ? vec3(0.) : min(c,vec3(6e4)); }
    float lum(vec3 c){ return dot(c,vec3(.2126,.7152,.0722)); }
    void main(){
      vec3 a=tap(vec2(-1,-1)), b=tap(vec2(1,-1)), c=tap(vec2(-1,1)), e=tap(vec2(1,1));
      float wa=1./(1.+lum(a)), wb=1./(1.+lum(b)), wc=1./(1.+lum(c)), we=1./(1.+lum(e));   // Karis average: no fireflies
      vec3 m=(a*wa+b*wb+c*wc+e*we)/(wa+wb+wc+we);
      float l=lum(m), s=clamp(l-uThr+uKnee,0.,2.*uKnee); s=s*s/(4.*uKnee+1e-5);
      gl_FragColor=vec4(m*max(s,l-uThr)/max(l,1e-4),1.); }`,{tSrc:{value:null},uTexel:{value:new e.Vector2},uThr:{value:1},uKnee:{value:.6}}),he=P(`
    uniform sampler2D tSrc; uniform vec2 uDir; varying vec2 vUv;
    void main(){
      vec3 c=texture2D(tSrc,vUv).rgb*.227027;
      c+=(texture2D(tSrc,vUv+uDir*1.3846154).rgb+texture2D(tSrc,vUv-uDir*1.3846154).rgb)*.3162162;
      c+=(texture2D(tSrc,vUv+uDir*3.2307692).rgb+texture2D(tSrc,vUv-uDir*3.2307692).rgb)*.0702703;
      gl_FragColor=vec4(c,1.); }`,{tSrc:{value:null},uDir:{value:new e.Vector2}}),be=P(`
    uniform sampler2D tSrc; uniform vec2 uTexel; uniform float uThr; varying vec2 vUv;
    void main(){
      vec3 c=(texture2D(tSrc,vUv+vec2(-.5,-1.)*uTexel).rgb+texture2D(tSrc,vUv+vec2(.5,-1.)*uTexel).rgb
             +texture2D(tSrc,vUv+vec2(-.5,1.)*uTexel).rgb+texture2D(tSrc,vUv+vec2(.5,1.)*uTexel).rgb)*.25;
      float l=dot(c,vec3(.2126,.7152,.0722));
      gl_FragColor=vec4(c*max(l-uThr,0.)/max(l,1e-4),1.); }`,{tSrc:{value:null},uTexel:{value:new e.Vector2},uThr:{value:6}}),ue=P(`
    uniform sampler2D tSrc; uniform float uStep; uniform float uTx; varying vec2 vUv;
    void main(){ vec3 c=texture2D(tSrc,vUv).rgb; float ws=1.;
      for(int i=1;i<=6;i++){ float w=exp(-float(i)*.42); vec2 o=vec2(float(i)*uStep*uTx,0.);
        c+=(texture2D(tSrc,vUv+o).rgb+texture2D(tSrc,vUv-o).rgb)*w; ws+=2.*w; }
      gl_FragColor=vec4(c/ws,1.); }`,{tSrc:{value:null},uStep:{value:1},uTx:{value:1}});u.mTaa=P(`
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
      gl_FragColor=vec4(max((c*wc+h*wh)/(wc+wh),vec3(0.)),1.); }`,{tColor:{value:null},tDepth:{value:null},tHist:{value:null},invVP:{value:null},histVP:{value:null},res:{value:new e.Vector2(1,1)},valid:{value:0},wStill:{value:.9},wMove:{value:.7}}),u.direct=!0;let te=bs(e),ie={tDiffuse:{value:null},tExp:{value:null},tB0:{value:E[0].texture},tB1:{value:E[1].texture},tB2:{value:E[2].texture},tB3:{value:E[3].texture},tB4:{value:E[4].texture},tS:{value:J[1].texture},tDirt:{value:te},uBw:{value:new e.Vector4},uBw4:{value:0},uBloom:{value:.3},uStreak:{value:0},uSTint:{value:H.streakTint},uFlash:{value:0},uDirt:{value:0},uDial:{value:0},uExpK:{value:1},uWB:{value:new e.Vector3(1,1,1)},uCon:{value:1},uSat:{value:1},uLift:{value:0},uGam:{value:1},uGain:{value:1}};w.mTone=P(`
    uniform sampler2D tDiffuse, tExp, tB0, tB1, tB2, tB3, tB4, tS, tDirt; uniform vec4 uBw; uniform float uBw4, uBloom, uStreak, uFlash, uDirt; uniform vec3 uSTint;
    uniform float uDial, uExpK, uCon, uSat, uLift, uGam, uGain; uniform vec3 uWB;
    varying vec2 vUv;
    ${Er}
    // dial grade on display values: lift raises the blacks, gain scales, uGam = 1/gamma, contrast about mid grey, then saturation
    vec3 dialGrade(vec3 o){
      o=max((o+uLift*(1.-o))*uGain,0.);
      o=pow(o,vec3(uGam));
      o=max((o-.46)*uCon+.46,0.);
      float l=dot(o,vec3(.2126,.7152,.0722)); o=max(mix(vec3(l),o,uSat),0.);
      return clamp(o,0.,1.); }
    void main(){
      vec3 c=texture2D(tDiffuse,vUv).rgb; c=any(isnan(c)) ? vec3(0.) : min(c,vec3(6e4));
      vec3 b=texture2D(tB0,vUv).rgb*uBw.x+texture2D(tB1,vUv).rgb*uBw.y+texture2D(tB2,vUv).rgb*uBw.z+texture2D(tB3,vUv).rgb*uBw.w+texture2D(tB4,vUv).rgb*uBw4;
      float f2=uFlash*uFlash;
      c+=b*(uBloom+2.5*uFlash);                                       // the flash is the lens flooding: bloom swells first
      c+=texture2D(tS,vUv).rgb*uSTint*uStreak;
      if(uDirt>0.) c+=texture2D(tDirt,vUv).rgb*(texture2D(tB2,vUv).rgb*.3+texture2D(tB3,vUv).rgb+texture2D(tB4,vUv).rgb)*uDirt*1.6;
      c+=f2*vec3(1.,.72,.5)*.9;                                       // warm wash in HDR: the tone curve rolls it to cream, never flat orange
      float e=texture2D(tExp,vec2(.5)).r*(1.+1.6*f2);
      if(uDial>.5){ e*=uExpK; c*=uWB; }                              // dial exposure and white balance (scene linear)
      vec3 o=cineGrade(cineOETF(cineTone(c*e/.6)));
      if(uDial>.5) o=dialGrade(o);
      gl_FragColor=vec4(o,1.); }`,ie);let fe={tDiffuse:{value:null},res:{value:new e.Vector2(1,1)},time:{value:0},grain:{value:H.grain},vig:{value:H.vignette},heat:{value:0},heatAt:{value:new e.Vector2(.5,.5)},heatLocal:{value:0},fxaa:{value:0},scrim:{value:new e.Vector4(.5,.5,1,1)},scrimK:{value:0},edgeC:{value:new e.Vector3},edgeK:{value:0},edgeH:{value:.3},edgeG:{value:0}},Oe=P(`
    uniform sampler2D tDiffuse; uniform vec2 res, heatAt; uniform vec4 scrim; uniform vec3 edgeC; uniform float time, grain, vig, heat, heatLocal, fxaa, scrimK, edgeK, edgeH, edgeG; varying vec2 vUv;
    ${Er}
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
      float ey=vUv.y/edgeH;
      col+=edgeG*vec3(1.,.6,.32)*exp(-(ey-.8)*(ey-.8)*2.5);                   // warm haze rising off the bottom of the frame, just above the fade
      col=clamp(cineGrain(col,gl_FragCoord.xy,time,grain),0.,1.);
      if(edgeK>0.){ float m=1.-smoothstep(0.,1.,ey); col=mix(col,edgeC,edgeK*m*m*(3.-2.*m)); } // after the grain: the last rows are the next section's colour exactly
      gl_FragColor=vec4(col,1.); }`,fe),Ee=1,Ye=1,ne=1,Qe=1;function Ve(){Ee=l.renderTarget1.width,Ye=l.renderTarget1.height,fe.res.value.set(Ee,Ye),ne=Math.max(1,Ee>>Se.div),Qe=Math.max(1,Ye>>Se.div),D.setSize(ne,Qe),me.uniforms.uTexel.value.set(.5*(1<<Se.div)/Ee,.5*(1<<Se.div)/Ye);let Y=ne,ze=Qe;for(let tt=0;tt<5;tt++){let Pt=Math.max(1,tt?Y>>1:Y),Lt=Math.max(1,tt?ze>>1:ze);ge[tt].setSize(Pt,Lt),E[tt].setSize(Pt,Lt),Y=Pt,ze=Lt}let We=Math.max(1,ne>>1),$e=Math.max(1,Qe>>2);J[0].setSize(We,$e),J[1].setSize(We,$e),be.uniforms.uTexel.value.set(1/ne,1/Qe);let rt=0;for(let tt=0;tt<Se.lv;tt++)rt+=ye[tt];let ut=tt=>tt<Se.lv?ye[tt]/rt:0;ie.uBw.value.set(ut(0),ut(1),ut(2),ut(3)),ie.uBw4.value=ut(4),u.histOk=!1}function Te(Y){Ge=!0,Y=Math.max(0,Math.min(3,Math.round(+Y||0))),Y!==le&&(le=Y,Se=se[Y],_e.level=Y,Ve(),Se.aa!==3&&u.hist&&(u.hist.forEach(ze=>ze.dispose()),u.hist=null,u.histOk=!1))}let Ce=t.getContext(),q=Ce.getExtension&&Ce.getExtension("EXT_disjoint_timer_query_webgl2"),d={},O=[],B=!1,R=Y=>{if(!B||!q)return null;let ze=Ce.createQuery();return Ce.beginQuery(q.TIME_ELAPSED_EXT,ze),[Y,ze]},de=Y=>{Y&&(Ce.endQuery(q.TIME_ELAPSED_EXT),O.push(Y))};function Ue(){if(!q||!O.length)return;let Y=Ce.getParameter(q.GPU_DISJOINT_EXT);for(let ze=O.length-1;ze>=0;ze--){let[We,$e]=O[ze];if(Ce.getQueryParameter($e,Ce.QUERY_RESULT_AVAILABLE)){if(!Y){let rt=Ce.getQueryParameter($e,Ce.QUERY_RESULT)/1e6;d[We]=d[We]==null?rt:d[We]*.9+rt*.1}Ce.deleteQuery($e),O.splice(ze,1)}}}let Ke=()=>l.renderTarget1,Re=()=>l.renderTarget2,Ne=Y=>Y===Ke().texture?Re():Ke(),qe={texture:null},yt=(Y,ze)=>{let We=1,$e=0;for(;Y>0;)We/=ze,$e+=We*(Y%ze),Y=Math.floor(Y/ze);return $e};function Gt(Y){if(!Y){o.jx=o.jy=0;return}let ze=re%8+1;o.jx=yt(ze,2)-.5,o.jy=yt(ze,3)-.5}function Mt(Y=!1,ze=0){le<0&&(Te(y?1:3),Ge=!1),re++,Ue();let We=t,$e=Y?ze?{aa:1,lv:5,streak:!0}:{aa:2,lv:5,streak:!0}:Se,rt=R("scene");o.enabled&&(o.useRT=!0,o.render(We)),de(rt);let ut=o.rt.texture;if(rt=R("hdrfx"),u.enabled){let Xe=u.mTaa.uniforms;Xe.wStill.value=H.taaStill,Xe.wMove.value=H.taaMove,u.render(We,Ke()),ut=u.outTex||Ke().texture}if(de(rt),rt=R("dof"),S.enabled){let Xe=S.uniforms,Bt=Ne(ut);Xe.tColor.value=ut,Xe.tDepth.value=o.rt.depthTexture,Xe.nearClip.value=r.near,Xe.farClip.value=r.far,We.setRenderTarget(Bt),S.fsQuad.render(We),ut=Bt.texture}de(rt),rt=R("bloom"),me.uniforms.tSrc.value=ut,me.uniforms.uThr.value=H.threshold,me.uniforms.uKnee.value=H.knee,G(me,D);for(let Xe=0;Xe<$e.lv;Xe++){let Bt=ge[Xe].width,vt=ge[Xe].height;he.uniforms.tSrc.value=Xe?E[Xe-1].texture:D.texture,he.uniforms.uDir.value.set(1/Bt,0),G(he,ge[Xe]),he.uniforms.tSrc.value=ge[Xe].texture,he.uniforms.uDir.value.set(0,1/vt),G(he,E[Xe])}let tt=H.streak+K.streakAdd,Pt=$e.streak&&(Y||K.streak>0&&tt>0);if(Pt){be.uniforms.tSrc.value=D.texture,be.uniforms.uThr.value=Math.max(0,H.streakThr-H.threshold),G(be,J[1]);let Xe=1/J[0].width;ue.uniforms.uTx.value=Xe,ue.uniforms.tSrc.value=J[1].texture,ue.uniforms.uStep.value=1,G(ue,J[0]),ue.uniforms.tSrc.value=J[0].texture,ue.uniforms.uStep.value=4,G(ue,J[1]),ue.uniforms.tSrc.value=J[1].texture,ue.uniforms.uStep.value=16,G(ue,J[0]),ie.tS.value=J[0].texture}de(rt),rt=R("tone");let Lt=p.strength;ie.uBloom.value=H.bloom*Lt*(1+K.bloom),ie.uStreak.value=Pt?tt*K.streak:0,ie.uFlash.value=Y?.5:Math.min(1,Math.max(0,K.flash)),ie.uDirt.value=Y?1:Math.max(0,K.dirt);let ot=ee,It=ot.expK!==1||ot.wr!==1||ot.wg!==1||ot.wb!==1||ot.contrast!==1||ot.saturation!==1||ot.lift!==0||ot.gamma!==1||ot.gain!==1;ie.uDial.value=It?1:0,It&&(ie.uExpK.value=ot.expK,ie.uWB.value.set(ot.wr,ot.wg,ot.wb),ie.uCon.value=ot.contrast,ie.uSat.value=ot.saturation,ie.uLift.value=ot.lift,ie.uGam.value=1/Math.max(.05,ot.gamma),ie.uGain.value=ot.gain);let kt=Ne(ut);if(qe.texture=ut,w.render(We,kt,qe),ut=kt.texture,de(rt),rt=R("aa"),$e.aa===2){let Xe=Ne(ut);M.renderToScreen=!1,M.render(We,Xe,kt),ut=Xe.texture}de(rt),rt=R("lens"),fe.tDiffuse.value=ut,fe.time.value=_e.time,fe.fxaa.value=$e.aa===1?1:0,fe.grain.value=H.grain,fe.vig.value=H.vignette;let Tt=Y?.5:Math.max(0,K.heat);fe.heat.value=Tt,K.heatAt?(fe.heatAt.value.set(K.heatAt[0],K.heatAt[1]),fe.heatLocal.value=1):fe.heatLocal.value=0,G(Oe,null),de(rt)}let _e={fx:K,look:H,grade:ee,level:le,time:0,taaOn:()=>le<0?!y:Se.aa===3,jitter:Gt,render:Mt,setSize:Ve,setQuality:Te,profile(Y=!0){return B=!!Y&&!!q,B},scrim(Y,ze,We,$e,rt){fe.scrim.value.set(Y,ze,Math.max(.001,We),Math.max(.001,$e)),fe.scrimK.value=Math.max(0,rt)},edge(Y,ze,We,$e){fe.edgeK.value=Math.max(0,Math.min(1,Y)),fe.edgeC.value.set(ze[0],ze[1],ze[2]),fe.edgeH.value=Math.max(.05,We),fe.edgeG.value=Math.max(0,$e)},lensFrame({entry:Y=-1,gR:ze=-1,plume:We=null}={}){let $e=(Xe,Bt,vt)=>{let s=Math.min(1,Math.max(0,(vt-Xe)/(Bt-Xe)));return s*s*(3-2*s)},rt=(Xe,Bt,vt)=>Math.exp(-(((Xe-Bt)/vt)**2)),ut=Y>0&&Y<1?1:0,tt=Y,Pt=ut*.9*$e(.05,.22,tt)*(1-$e(.42,.62,tt)),Lt=ut*.85*rt(tt,.3,.045),ot=ut*.7*$e(.16,.3,tt)*(1-$e(.3,.52,tt)),It=ut*.6*$e(.1,.3,tt)*(1-$e(.3,.55,tt)),kt=ze>=.78?$e(.79,.83,ze):0,Tt=ze>=.78?.25*rt(ze,.835,.012):0;K.heat=Math.max(Pt,We?.55*kt:0),K.heatAt=Pt>=.55*kt||!We?null:[We[0],We[1]],K.flash=Math.max(Lt,Tt),K.dirt=Math.max(ot,.45*kt),K.bloom=Math.max(It,.25*kt),K.streak=1+.3*kt,K.streakAdd=.3*kt},gpuTimes(){B=!!q;let Y={},ze=0;for(let We in d)Y[We]=+d[We].toFixed(3),ze+=d[We];return Y.total=+ze.toFixed(3),Y.supported=!!q,Y}};return Ve(),gs.add(_e),_e}function bs(e){if(typeof document>"u")return null;let t=document.createElement("canvas");t.width=512,t.height=288;let r=t.getContext("2d"),l=7,o=()=>(l=l*16807%2147483647)/2147483647;r.fillStyle="#000",r.fillRect(0,0,512,288),r.globalCompositeOperation="lighter";for(let S=0;S<90;S++){let w=o()*512,M=o()*288,p=3+o()*o()*46,C=.03+o()*.09,y=r.createRadialGradient(w,M,0,w,M,p);y.addColorStop(0,`rgba(255,238,214,${C})`),y.addColorStop(.6,`rgba(255,232,206,${C*.45})`),y.addColorStop(1,"rgba(0,0,0,0)"),r.fillStyle=y,r.beginPath(),r.arc(w,M,p,0,6.2832),r.fill()}r.lineWidth=2;for(let S=0;S<7;S++){let w=o()*512,M=o()*288,p=14+o()*30,C=.05+o()*.05;r.strokeStyle=`rgba(255,236,220,${C})`,r.beginPath();for(let y=0;y<=6;y++){let A=y/6*6.2832+.3;r[y?"lineTo":"moveTo"](w+p*Math.cos(A),M+p*Math.sin(A))}r.stroke()}let u=new e.CanvasTexture(t);return u.colorSpace=e.NoColorSpace,u}var ws=[-1,.22,-.55];function Ho(e,t,r){let l=e*Math.PI/180,o=t*Math.PI/180;return new r(Math.cos(o)*Math.cos(l),Math.sin(o),-Math.cos(o)*Math.sin(l))}function ys(e,t,r){let l=e.Vector3,o=Ho(266.40499,-28.93617,l),u=Ho(192.85948,27.12825,l),S=new l().crossVectors(u,o),w=t.clone().normalize(),M=r.clone().sub(w.clone().multiplyScalar(r.dot(w))).normalize(),p=new l().crossVectors(M,w),C=new e.Matrix4().makeBasis(o,S,u),A=new e.Matrix4().makeBasis(w,p,M).multiply(C.transpose());return new e.Quaternion().setFromRotationMatrix(A)}function Ms(e){let t=e.Vector3,r=new t(...ws).normalize(),l=new t(0,1,0).addScaledVector(r,-r.y).normalize(),o=new t().crossVectors(r,l).normalize(),u=30*Math.PI/180,S=72*Math.PI/180,w=o.clone().multiplyScalar(Math.cos(u)).addScaledVector(l,Math.sin(u)),M=new t().crossVectors(r,w).normalize(),p=r.clone().multiplyScalar(Math.cos(S)).addScaledVector(w,Math.sin(S));return ys(e,p,M)}var Ss=`
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
}`,As=`
uniform float uGain; varying vec3 vCol; varying float vI;
void main(){
  float d = length(gl_PointCoord - 0.5) * 2.;
  float core = 1. - smoothstep(0., 1., d);     // round falloff (same curve as before, written with ordered edges)
  float a = core * core;
  if (a < 0.003) discard;
  gl_FragColor = vec4(vCol * vI * a * uGain, 1.);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`,Cs="varying vec3 vDir; void main(){ vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }",Ds=`
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
}`,zs=Ss.replace("gl_PointSize = s * uPx;","float ps = s * uPx, pw = max(ps, 2.2); vI *= (ps * ps) / (pw * pw) * 1.25; gl_PointSize = pw;"),Ps=As.replace(`float core = 1. - smoothstep(0., 1., d);     // round falloff (same curve as before, written with ordered edges)
  float a = core * core;`,"float a = exp(-d * d * 4.5);"),Ls=`
attribute float aI; uniform float uPx; varying float vI;
void main(){ vI = aI; gl_PointSize = 2.0 * uPx; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,ks=`
varying float vI;
void main(){ float d = length(gl_PointCoord - 0.5) * 2.; float a = exp(-d * d * 3.); if (a < 0.01) discard;
  gl_FragColor = vec4(vec3(1., 0.93, 0.86) * vI * a, 1.);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;async function en({THREE:e,scene:t,starsUrl:r,milkyUrl:l,rotation:o=null,milkyWay:u=!0,milkyWayIntensity:S=.3,starGain:w=1,pixelRatio:M=null}={}){S*=1.7;let C=e.Vector3,y=new e.Group;y.name="sky",y.frustumCulled=!1,o&&o.isQuaternion?y.quaternion.copy(o):o&&o.isEuler?y.setRotationFromEuler(o):Array.isArray(o)?y.rotation.set(o[0],o[1],o[2]):y.quaternion.copy(Ms(e));let A=await(await fetch(r)).arrayBuffer(),b=new Float32Array(A),n=b.length/5,V=new Float32Array(n*3),P=new Float32Array(n),G=new Float32Array(n);for(let le=0;le<n;le++)V[le*3]=b[le*5]*7e3,V[le*3+1]=b[le*5+1]*7e3,V[le*3+2]=b[le*5+2]*7e3,P[le]=b[le*5+3],G[le]=b[le*5+4];let K=new e.BufferGeometry;K.setAttribute("position",new e.BufferAttribute(V,3)),K.setAttribute("aMag",new e.BufferAttribute(P,1)),K.setAttribute("aBV",new e.BufferAttribute(G,1));let H=new e.ShaderMaterial({vertexShader:zs,fragmentShader:Ps,uniforms:{uPx:{value:M||Math.min(window.devicePixelRatio||1,2)},uGain:{value:w}},transparent:!0,blending:e.AdditiveBlending,depthWrite:!1,depthTest:!0,fog:!1}),ee=new e.Points(K,H);ee.frustumCulled=!1,ee.renderOrder=-9,ee.name="sky-stars",y.add(ee);{let le=Ho(192.85948,27.12825,C),Se=26e3,Ge=new Float32Array(Se*3),re=new Float32Array(Se),D=new C,ge=99,E=()=>(ge=ge*16807%2147483647)/2147483647;for(let he=0,be=0;he<Se;be++){D.set(E()*2-1,E()*2-1,E()*2-1);let ue=D.length();if(ue>1||ue<.05)continue;D.divideScalar(ue);let te=Math.abs(D.dot(le));E()>.12+.88*Math.exp(-te*te/.02)||(Ge[he*3]=D.x*7e3*.995,Ge[he*3+1]=D.y*7e3*.995,Ge[he*3+2]=D.z*7e3*.995,re[he]=.035+.11*Math.pow(E(),3),he++)}let J=new e.BufferGeometry;J.setAttribute("position",new e.BufferAttribute(Ge,3)),J.setAttribute("aI",new e.BufferAttribute(re,1));let me=new e.Points(J,new e.ShaderMaterial({vertexShader:Ls,fragmentShader:ks,uniforms:{uPx:H.uniforms.uPx},transparent:!0,blending:e.AdditiveBlending,depthWrite:!1,depthTest:!0,fog:!1}));me.frustumCulled=!1,me.renderOrder=-9,me.name="sky-starhaze",y.add(me)}let se=null;if(u){let le=await new Promise((Se,Ge)=>new e.TextureLoader().load(l,Se,void 0,Ge)).catch(()=>null);if(le){le.colorSpace=e.SRGBColorSpace,le.anisotropy=4,le.wrapS=e.RepeatWrapping;let Se=Ho(192.85948,27.12825,C),Ge=Ho(266.40499,-28.93617,C),re=new C().crossVectors(Se,Ge),D=new e.ShaderMaterial({vertexShader:Cs,fragmentShader:Ds,side:e.BackSide,uniforms:{map:{value:le},gc:{value:Ge},gy:{value:re},ngp:{value:Se},uInt:{value:S},uSat:{value:.8},uTexel:{value:new e.Vector2(1/le.image.width,1/le.image.height)}},depthWrite:!1,depthTest:!1,fog:!1});se=new e.Mesh(new e.SphereGeometry(7e3*.99,64,32),D),se.frustumCulled=!1,se.renderOrder=-10,se.name="sky-milkyway",y.add(se)}}return t.add(y),{group:y,stars:ee,milkyWay:se,update:le=>{y.position.copy(le)},starCount:n,starMaterial:H}}var Os=`
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
`,tn=`
float ah(vec2 p){ p = fract(p * vec2(443.897, 441.423)); p += dot(p, p.yx + 19.19); return fract((p.x + p.y) * p.x); }
float ah3(vec3 p){ p = fract(p * 0.3183099 + .1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float an(vec2 x){ vec2 i = floor(x), f = fract(x); f = f * f * (3. - 2. * f);
  return mix(mix(ah(i), ah(i + vec2(1, 0)), f.x), mix(ah(i + vec2(0, 1)), ah(i + vec2(1, 1)), f.x), f.y); }
// fbm with each octave faded to its mean as it nears the pixel footprint (fw = footprint in units of the base octave): no shimmer
float afbm(vec2 p, float fw){ float v = 0., a = .5; for (int i = 0; i < 5; i++){ float k = 1. - smoothstep(.25, .6, fw); v += a * mix(.5, an(p), k); p = p * 2.03 + 17.1; fw *= 2.03; a *= .5; } return v; }
`,Bs=`
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
}`,Fs="varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }",ar=`
${tn}
${Os}
${Bs}
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
}`,Vs=`
uniform vec3 uSun, uOrigin; uniform float uK, uNight, uT, uAmb, uFogN, uFogF;
varying vec3 vW;
${ar}
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
}`,Us="varying vec2 vS; void main(){ vS = position.xy; gl_Position = vec4(position.xy, 0., 1.); }",Ns=`
uniform float uE, uT, uAsp, uFlow; uniform vec3 uSky, uLit; uniform vec2 uSunS;
varying vec2 vS;
${tn}
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
}`;function on({THREE:e,origin:t=new e.Vector3(0,-6e3,0)}={}){let r=e.MathUtils.smoothstep,l=H=>Math.min(1,Math.max(0,H)),o={uSun:{value:new e.Vector3(-.9,.33,-.2).normalize()},uOrigin:{value:t.clone()},uK:{value:1},uNight:{value:0},uT:{value:0},uAmb:{value:1},uFogN:{value:500},uFogF:{value:4200}},u=new e.Mesh(new e.SphereGeometry(6e3,64,32),new e.ShaderMaterial({vertexShader:Fs,fragmentShader:Vs,uniforms:o,side:e.BackSide,depthWrite:!1,depthTest:!1,fog:!1}));u.frustumCulled=!1,u.renderOrder=-20,u.visible=!1,u.name="mars-air-dome";let S={uE:{value:0},uT:{value:0},uAsp:{value:1},uFlow:{value:0},uSky:{value:new e.Color(.9,.6,.38)},uLit:{value:new e.Color(1.2,.8,.5)},uSunS:{value:new e.Vector2(-1,.4)}},w=new e.BufferGeometry;w.setAttribute("position",new e.BufferAttribute(new Float32Array([-1,-1,0,3,-1,0,-1,3,0]),3));let M=new e.Mesh(w,new e.ShaderMaterial({vertexShader:Us,fragmentShader:Ns,uniforms:S,transparent:!0,depthWrite:!1,depthTest:!1,fog:!1,blending:e.CustomBlending,blendEquation:e.AddEquation,blendSrc:e.OneFactor,blendDst:e.OneMinusSrcAlphaFactor}));M.frustumCulled=!1,M.renderOrder=999,M.visible=!1,M.name="mars-air-veil";let p=new e.Color,C=(H,ee,se,ye)=>{let le=se.y,Se=ee.x*se.x+ee.y*se.y+ee.z*se.z,Ge=Math.max(ee.y,0),re=Math.max(Se,0),D=r(le,-.1,.12),ge=r(le,-.32,0),E=r(Math.pow(Ge,.42),0,1);H.setRGB(.9+(.34-.9)*E,.62+(.205-.62)*E,.4+(.13-.4)*E);let J=.68+.55*re**4+.4*re**30;J*=.38+.62*r(Se,-.7,.7)+(1-(.38+.62*r(Se,-.7,.7)))*r(le,.08,.45),J*=.11*ge+(1-.11*ge)*D,J*=.75+.25*r(le,-.3,.6),H.multiplyScalar(J);let me=(re**90*2.2+re**16*.45+re**5*.08)*ge*(.95+(.3-.95)*D);H.r+=.3*me+.0022,H.g+=.5*me+.0028,H.b+=.98*me+.0055;let he=Math.pow(ye,2.6)+(Math.pow(ye,.6)-Math.pow(ye,2.6))*Math.exp(-Ge*7);return H.multiplyScalar(he),H},y=new e.Vector3,A=new e.Vector3,b=new e.Vector3,n=(H,ee=o.uSun.value,se=o.uK.value,ye=null)=>{H.setRGB(0,0,0);let le=0;for(let Se=0;Se<8;Se++){let Ge=Se/8*Math.PI*2;y.set(Math.cos(Ge),.03,Math.sin(Ge)).normalize();let re=ye?1+Math.max(0,y.x*ye.x+y.z*ye.z)*2:1;C(p,y,ee,se),H.r+=p.r*re,H.g+=p.g*re,H.b+=p.b*re,le+=re}return H.multiplyScalar(1/le)},V=H=>(y.set(0,1,0),C(H,y,o.uSun.value,1),n(p),H.lerp(p,.5)),P={e:0,flow:0,prevE:0};function G(H,ee={}){H=l(H);let{inCol:se=!1,cam:ye=null,t:le=0,dt:Se=0,alt:Ge=0,fog:re=null,sunDir:D=null,night:ge=0}=ee;if(P.flow+=(Se||0)*.12+Math.abs(H-P.prevE)*4,P.prevE=H,P.e=H,S.uE.value=H,S.uT.value=le,S.uFlow.value=P.flow,ye&&(S.uAsp.value=ye.aspect||1),M.visible=H>.005&&H<.7,D&&o.uSun.value.copy(D).normalize(),o.uNight.value=ge,o.uT.value=le,o.uK.value=se?.35+.65*r(H,.3,.52):0,o.uAmb.value=1-.85*ge,u.visible=!!se,ye&&se&&(u.position.copy(ye.position),u.updateMatrixWorld()),n(S.uSky.value,o.uSun.value,1),S.uSky.value.lerp(p.setRGB(.55,.22,.12),1-r(H,.22,.4)),S.uLit.value.copy(S.uSky.value).multiplyScalar(1.9),ye&&(A.copy(o.uSun.value).transformDirection(ye.matrixWorldInverse),S.uSunS.value.set(A.x,A.y).normalize()),re&&se){ye&&ye.getWorldDirection(b),n(re.color,o.uSun.value,o.uK.value,ye?b:null);let E=Math.max(0,Ge),J=r(H,.45,1);re.near=500+E*1.5*(1-J*.5),re.far=Math.max(4200,(4200+E*6)*(.55+.45*J)),o.uFogN.value=re.near,o.uFogF.value=re.far}}return{dome:u,veil:M,entry:G,roots:()=>[M,u],hemi:V,horizon:n,skyAt:C,state:P,uniforms:{dome:o,veil:S}}}var Eo=`
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
`,Ma=`
varying vec3 vP; varying vec2 vUv; varying vec3 vV;
void main(){
  vP = position; vUv = uv;
  mat3 M = mat3(modelMatrix); vec4 w = modelMatrix * vec4(position, 1.);
  vV = transpose(M) * (cameraPosition - w.xyz);           // view vector in object space (meshes only rotate)
  gl_Position = projectionMatrix * viewMatrix * w;
}`,Is=`
uniform sampler2D tMap, tSpec, tNorm, tLights, tClouds;
uniform vec3 uSun; uniform float uGrow, uCloudOff, uCloudH, uSunI;
varying vec3 vP; varying vec2 vUv; varying vec3 vV;
${Eo}
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
}`,Gs=`
uniform sampler2D tClouds; uniform vec3 uSun; uniform float uSunI; uniform sampler2D tLights; uniform vec4 uHole;
varying vec3 vP; varying vec2 vUv; varying vec3 vV;
${Eo}
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
}`,Ts=`
uniform sampler2D tMap, tNorm; uniform vec3 uSun; uniform float uSunI, uAlbedo, uRelief;
varying vec3 vP; varying vec2 vUv; varying vec3 vV;
${Eo}
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
}`,Ws=`
uniform sampler2D tMap, tNorm; uniform vec3 uSun; uniform float uSunI, uRelief, uDomes, uBump, uR;
varying vec3 vP; varying vec2 vUv; varying vec3 vV;
${Eo}
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
}`,js=`
varying vec3 vN; varying vec3 vO;
void main(){ vN = normal; vO = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,qs=`
uniform vec3 uSun; uniform float uSunI, uA;
varying vec3 vN; varying vec3 vO;
${Eo}
void main(){
  vec3 N = normalize(vN), L = normalize(uSun);
  float n = fbm3(vO * 9.);
  vec3 alb = vec3(0.075, 0.064, 0.056) * (0.8 + 0.4 * n);
  float m0 = max(dot(N, L), 0.);
  vec3 col = alb * m0 * uSunI * 2.2 + alb * 0.02;
  gl_FragColor = vec4(col * uA, uA);
}`,Xs=`
varying vec3 vW;
void main(){ vec4 w = modelMatrix * vec4(position, 1.); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,an=`
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
}`;function rn({THREE:e,scene:t,renderer:r,toSun:l,EARTH:o,MOON:u,MARS:S,files:w}){let y=Math.min(8,r.capabilities.getMaxAnisotropy()),A=new e.TextureLoader;A.setCrossOrigin("anonymous");let b=[],n={moon:[],mars:[]},V={},P=(d,O,B,R)=>{let de=new e.DataTexture(new Uint8Array([d,O,B,255]),1,1);return de.colorSpace=R?e.SRGBColorSpace:e.NoColorSpace,de.needsUpdate=!0,de},G=(d,O)=>new Promise(B=>A.load(d,R=>{let de=R.image;(de&&de.decode?Promise.race([de.decode().catch(()=>{}),new Promise(Ke=>setTimeout(Ke,400))]):Promise.resolve()).then(()=>{R.colorSpace=O?e.SRGBColorSpace:e.NoColorSpace,R.anisotropy=y,R.wrapS=e.RepeatWrapping,R.needsUpdate=!0,B(R)})},void 0,()=>B(null))),K=d=>{if(d&&r&&r.initTexture)try{r.initTexture(d)}catch{}},H=(d,O,B,R)=>{let de={value:B},Ue=w[d];if(!Ue)return de;let Ke=Re=>{Re&&(K(Re),de.value=Re)};return R?n[R].push(()=>G(Ue,O).then(Re=>({t:Re,swap:Ke}))):b.push(G(Ue,O).then(Ke)),de},ee=()=>new Promise(d=>typeof requestAnimationFrame=="function"?requestAnimationFrame(()=>d()):setTimeout(d,0));function se(d){return V[d]?V[d]:V[d]=Promise.all(n[d].map(O=>O())).then(async O=>{for(let{t:B,swap:R}of O)B&&(R(B),await ee())})}let ye=()=>({value:new e.Vector3().copy(l)}),le={tMap:H("earth",!0,P(10,30,70,!0)),tSpec:H("earthSpec",!1,P(255,255,255)),tNorm:H("earthNorm",!1,P(128,128,255)),tLights:H("earthLights",!1,P(0,0,0)),tClouds:H("clouds",!1,P(0,0,0)),uSun:ye(),uGrow:{value:.03},uCloudOff:{value:0},uCloudH:{value:.0085},uSunI:{value:3.3}},Se=new e.Mesh(new e.SphereGeometry(10,192,96),new e.ShaderMaterial({vertexShader:Ma,fragmentShader:Is,uniforms:le}));Se.position.copy(o),t.add(Se);let Ge={tClouds:le.tClouds,tLights:le.tLights,uSun:ye(),uSunI:le.uSunI,uHole:{value:new e.Vector4(0,1,0,0)}},re=new e.Mesh(new e.SphereGeometry(10*1.0085,160,80),new e.ShaderMaterial({vertexShader:Ma,fragmentShader:Gs,uniforms:Ge,transparent:!0,depthWrite:!1}));re.position.copy(o),re.renderOrder=1,t.add(re);let D={tMap:H("moon",!0,P(150,150,150,!0),"moon"),tNorm:H("moonNorm",!1,P(128,128,255),"moon"),uSun:ye(),uSunI:{value:3.3},uAlbedo:{value:.3},uRelief:{value:1.35}},ge=new e.Mesh(new e.SphereGeometry(2.7,128,64),new e.ShaderMaterial({vertexShader:Ma,fragmentShader:Ts,uniforms:D}));ge.position.copy(u),t.add(ge);let E={tMap:H("mars",!0,P(150,70,40,!0),"mars"),tNorm:H("marsNorm",!1,P(128,128,255),"mars"),uSun:ye(),uSunI:{value:2.2},uRelief:{value:1.25},uDomes:{value:1}};E.uBump={value:11},E.uR={value:6};let J=new e.Mesh(new e.SphereGeometry(6*1.015,192,96),new e.ShaderMaterial({vertexShader:Ma,fragmentShader:Ws,uniforms:E,transparent:!0,blending:e.CustomBlending,blendEquation:e.AddEquation,blendSrc:e.OneFactor,blendDst:e.OneMinusSrcAlphaFactor}));J.position.copy(S),t.add(J),J.renderOrder=1;let me=null;{let d=new e.IcosahedronGeometry(1,4),O=d.attributes.position,B=new e.Vector3,R=(Y,ze,We)=>{let $e=Math.sin(Y*12.9898+ze*78.233+We*37.719)*43758.5453;return $e-Math.floor($e)};for(let Y=0;Y<O.count;Y++){B.fromBufferAttribute(O,Y);let ze=1+.1*Math.sin(B.x*3.1+1)*Math.cos(B.y*2.3)+.06*Math.sin(B.z*5.3+B.x*2);ze-=.22*Math.exp(-B.distanceToSquared({x:.85,y:.25,z:.46})/.09),ze-=.05*R(Math.round(B.x*6),Math.round(B.y*6),Math.round(B.z*6)),B.multiplyScalar(ze),B.x*=1.25,B.z*=.88,O.setXYZ(Y,B.x,B.y,B.z)}d.computeVertexNormals();let de={uSun:{value:new e.Vector3(1,0,0)},uSunI:E.uSunI,uA:{value:1}};me=new e.Mesh(d,new e.ShaderMaterial({vertexShader:js,fragmentShader:qs,uniforms:de,transparent:!0,blending:e.CustomBlending,blendEquation:e.AddEquation,blendSrc:e.OneFactor,blendDst:e.OneMinusSrcAlphaFactor})),me.frustumCulled=!1,me.renderOrder=1,me.matrixAutoUpdate=!1,J.add(me);let Ue=new e.Vector3(30,10,38).normalize(),Ke=new e.Vector3(0,1,0).addScaledVector(Ue,-Ue.y).normalize(),Re=new e.Vector3().crossVectors(Ke,Ue),Ne=Ke.clone().multiplyScalar(.85).addScaledVector(Re,.55).normalize(),qe=new e.Quaternion,yt=new e.Vector3,Gt=new e.Vector3,Mt=new e.Euler,_e=new e.Quaternion;me.alpha=1,me.size=.12,me.orbit=1.75*6,me.phase=null,me.onBeforeRender=(Y,ze,We)=>{let $e=me.phase??.3+.18*Math.sin(he*.011);Gt.copy(Ne).multiplyScalar(Math.cos($e)).addScaledVector(Ue,Math.sin($e)).multiplyScalar(me.orbit).add(J.position),Mt.set(.3,he*.05,.2),qe.setFromEuler(Mt),me.matrixWorld.compose(Gt,qe,yt.setScalar(me.size)),_e.copy(qe).invert(),de.uSun.value.copy(E.uSun.value).applyQuaternion(J.quaternion).applyQuaternion(_e);let rt=We.position.distanceTo(J.position);de.uA.value=me.alpha*e.MathUtils.smoothstep(rt,13,20)}}let he=0,be=(d,O,B)=>{let R={uCenter:{value:d.clone()},uSun:{value:new e.Vector3().copy(l)},uRp:{value:O},uRa:{value:O*B.top},uBetaR:{value:new e.Vector3(...B.bR).divideScalar(O)},uBetaM:{value:new e.Vector3(...B.bM).divideScalar(O)},uBetaMe:{value:new e.Vector3(...B.bMe).divideScalar(O)},uG:{value:new e.Vector3(...B.g)},uSunCol:{value:new e.Vector3(...B.sun)},uHr:{value:B.Hr*O},uHm:{value:B.Hm*O},uK:{value:B.k}},de=new e.Mesh(new e.SphereGeometry(O*B.top,128,64),new e.ShaderMaterial({vertexShader:Xs,fragmentShader:B.frag||an,uniforms:R,transparent:!0,depthWrite:!1,blending:e.CustomBlending,blendEquation:e.AddEquation,blendSrc:e.OneFactor,blendDst:e.OneMinusSrcAlphaFactor}));return de.position.copy(d),de.renderOrder=2,t.add(de),de},ue=be(o,10,{top:1.1,Hr:.0085,Hm:.0034,bR:[8,19,48],bM:[24,24,24],bMe:[27,27,27],g:[.8,.8,.8],sun:[1,.97,.92],k:15}),te=be(S,6,{top:1.07,Hr:.0075,Hm:.012,bR:[3,7,18],bM:[5,3.4,1.8],bMe:[6,5,4.4],g:[.55,.72,.9],sun:[1,.95,.88],k:12,frag:an.replace("clamp(1. - tr, 0., 1.) * 0.85","clamp(1. - tr, 0., 1.) * 0.25")}),ie=[ue,te],fe=new e.Quaternion,Oe=new e.Vector3,Ee=(d,O)=>{fe.copy(d.quaternion).invert(),O.value.copy(l).applyQuaternion(fe)},Ye=.012,ne=.0158,Qe=new e.Quaternion,Ve=new e.Vector3;function Te({t:d=0,intro:O=1,camPos:B,spin:R=0,hole:de}={}){if(Se.rotation.y=R+d*Ye,re.rotation.y=R+d*ne,de&&(re.updateMatrixWorld(),Qe.copy(re.quaternion).invert(),Ve.copy(de).applyQuaternion(Qe),Ge.uHole.value.set(Ve.x,Ve.y,Ve.z,1)),ge.rotation.y=d*.01,J.rotation.y=d*.02,he=d,Ee(Se,le.uSun),Ee(re,Ge.uSun),Ee(ge,D.uSun),Ee(J,E.uSun),le.uCloudOff.value=(Se.rotation.y-re.rotation.y)/(2*Math.PI),le.uGrow.value=.03+.97*O,B)for(let Ue of ie){let Re=Oe.copy(B).sub(Ue.position).length()<Ue.material.uniforms.uRa.value*1.002?e.BackSide:e.FrontSide;Ue.material.side!==Re&&(Ue.material.side=Re,Ue.material.needsUpdate=!0)}}let Ce=null;return Ce=on({THREE:e}),t.add(Ce.dome,Ce.veil),{earth:Se,moon:ge,mars:J,clouds:re,earthAtmo:ue,marsAtmo:te,phobos:me,air:Ce,entry:Ce?(d,O)=>Ce.entry(d,O):void 0,entryRoots:Ce?Ce.roots:void 0,ready:Promise.all(b),loadDeferred:se,update:Te}}var Nt=e=>Math.min(1,Math.max(0,e)),gt=(e,t,r)=>e<=t?0:e>=r?1:(e=(e-t)/(r-t),e*e*(3-2*e)),to=e=>1-Math.pow(1-Nt(e),3),Yt=e=>e*e*e*(e*(e*6-15)+10),wt=(e,t,r)=>e+(t-e)*r;function co(e,t,r,l){let o=e.length,u=[],S=[],w=new Array(o);if(o===2){let p=(t[1]-t[0])/(e[1]-e[0]||1);return C=>C>=e[1]?t[1]:t[0]+p*(C-e[0])}for(let p=0;p<o-1;p++)u[p]=e[p+1]-e[p],S[p]=(t[p+1]-t[p])/u[p];for(let p=1;p<o-1;p++)if(S[p-1]*S[p]<=0)w[p]=0;else{let C=2*u[p]+u[p-1],y=u[p]+2*u[p-1];w[p]=(C+y)/(C/S[p-1]+y/S[p])}let M=(p,C,y,A)=>{let b=((2*p+C)*y-p*A)/(p+C);return Math.sign(b)!==Math.sign(y)?b=0:Math.sign(y)!==Math.sign(A)&&Math.abs(b)>3*Math.abs(y)&&(b=3*y),b};return w[0]=r!==void 0?r*S[0]:M(u[0],u[1],S[0],S[1]),w[o-1]=l!==void 0?l*S[o-2]:M(u[o-2],u[o-3],S[o-2],S[o-3]),p=>{if(p<=e[0])return t[0]+w[0]*(p-e[0]);if(p>=e[o-1])return t[o-1];let C=0;for(;p>e[C+1];)C++;let y=(p-e[C])/u[C],A=y*y,b=A*y;return(2*b-3*A+1)*t[C]+(b-2*A+y)*u[C]*w[C]+(-2*b+3*A)*t[C+1]+(b-A)*u[C]*w[C+1]}}function rr(e,t,r){let l=e.length,o=[],u=[],S=r?r.slice():new Array(l).fill(null);for(let w=0;w<l-1;w++)o[w]=e[w+1]-e[w],u[w]=(t[w+1]-t[w])/o[w];for(let w=0;w<l;w++)if(S[w]==null){if(w===0||w===l-1){S[w]=0;continue}if(u[w-1]*u[w]<=0)S[w]=0;else{let M=2*o[w]+o[w-1],p=o[w]+2*o[w-1];S[w]=(M+p)/(M/u[w-1]+p/u[w])}}return w=>{if(w<=e[0])return t[0];if(w>=e[l-1])return t[l-1];let M=0;for(;w>e[M+1];)M++;let p=(w-e[M])/o[M],C=p*p,y=C*p;return(2*y-3*C+1)*t[M]+(y-2*C+p)*o[M]*S[M]+(-2*y+3*C)*t[M+1]+(y-C)*o[M]*S[M+1]}}function Sa(e){return co(e.map(t=>t[0]),e.map(t=>t[1]))}function nr(e,t,r,l){e.arcLengthDivisions=Math.max(e.arcLengthDivisions,4e3),e.needsUpdate=!0;let o=e.getLengths(),u=t.length,S=o[o.length-1],w=p=>{let C=p*(o.length-1),y=Math.floor(C);return y>=o.length-1?S:o[y]+(o[y+1]-o[y])*(C-y)},M=co(t,t.map((p,C)=>w(C/(u-1))),r,l);return p=>e.getUtoTmapping(0,Math.min(S,Math.max(0,M(p))))}function Aa(e,t,r,l,o,u){let S=e.shadow.camera,w=e.shadow.mapSize,M=(S.right-S.left)/w.x,p=(S.top-S.bottom)/w.y;o.set(0,1,0).cross(r).normalize(),u.copy(r).cross(o);let C=t.dot(o),y=t.dot(u);e.target.position.copy(t).addScaledVector(o,Math.round(C/M)*M-C).addScaledVector(u,Math.round(y/p)*p-y),e.position.copy(e.target.position).addScaledVector(r,l)}function nn({THREE:e,SITE_ROT:t,AUS:r,U_PER_M:l,C0:o,L0:u,spaceCam:S}){let n=Math.log(65e4),V=Math.log(o.distanceTo(r)/l),P=n,G=r.clone().normalize(),K=G.clone().negate(),H=o.clone().sub(r).normalize(),ee=o.distanceTo(r),se=()=>new e.Vector3,ye=new e.Quaternion,le=new e.Quaternion,Se=se(),Ge=se(),re=se(),D=se(),ge=se(),E=se(),J=se(),me=se(),he={},be=null,ue=null,te=null,ie=null,fe=(Ye,ne,Qe,Ve)=>{for(let Te=0;Te<60;Te++){let Ce=(Qe+Ve)/2;Ye(Ce)<ne?Qe=Ce:Ve=Ce}return(Qe+Ve)/2};function Oe(Ye){ie=Ye;let{yA:ne,yT:Qe,yX:Ve,yE:Te,S:Ce}=ie,q=.5,d=(-3*Ce(Te)+4*Ce(Te+q)-Ce(Te+2*q))/(2*q);S(-1,Se,D),S(Ce(Te+q),Ge,D),S(Ce(Te+2*q),re,D);let O=Se.clone().multiplyScalar(-3).addScaledVector(Ge,4).addScaledVector(re,-1).divideScalar(2*q),B=O.dot(H),R=Math.max(B,1e-6);he.dSdy=d,he.v0=O.length(),he.r0=B,he.r=R;let de=Ve+.46*(Te-Ve),Ue=Ve+.64*(Te-Ve),Ke=Ve+.82*(Te-Ve),Re=R/ee,Ne=.4/(Te-Ke);be=co([ne,Qe,Ve,de,Ue,Ke,Te],[125,170,290,4e4].map(Math.log).concat(V-1.4,V-.4,V),.7,Re/Ne),he.yH=fe(be,n,ne,Te),me.copy(O).addScaledVector(H,-B),E.copy(me).multiplyScalar((Te-he.yH)/ee);let qe=yt=>fe(be,Math.log(yt),ne,Te);ue=co([ne,Qe,Ve,qe(1600),qe(7e3),qe(4e4)],[7.9,10.2,13.4,17.9,18.95,19.6],void 0,0),te=co([ne,Qe,Ve,qe(1600),qe(3e4)],[0,.3,.52,.8,1],void 0,0),Object.assign(he,{yA:ne,yT:Qe,yX:Ve,yM:de,yE:Te,LAMH:n,LAM1:V,lamA:be(ne),yNight:qe(4e4),yG1:qe(3e4)})}function Ee(Ye,ne){let{yA:Qe,yE:Ve}=ie,Te=Math.min(Math.max(Ye,Qe),Ve),Ce=be(Te),q=Math.exp(Ce);if(ne.lam=Ce,ne.s=Nt((Ye-Qe)/(Ve-Qe)),ne.fov=38,ne.hour=ue(Te),ne.g=Math.min(1,te(Te)),Te<he.yH){let R=Yt(Nt((Ce-he.lamA)/(P-he.lamA))),de=e.MathUtils.lerp(-.08+.16*(Te-Qe)/(Ve-Qe),t,R),Ue=e.MathUtils.degToRad(56+34*R);return ne.look.set(0,0,-10*(1-R)),ne.pos.set(Math.sin(de)*Math.cos(Ue),Math.sin(Ue),Math.cos(de)*Math.cos(Ue)).multiplyScalar(q).add(ne.look),ne.up.set(-Math.sin(de),0,-Math.cos(de)),ne.world="site",ne.dist=ne.pos.length(),ne.upk=R,ne}let d=Nt((Te-he.yH)/(Ve-he.yH)),O=d*d,B=O*d;return ge.copy(G).multiplyScalar(2*B-3*O+1).addScaledVector(H,3*O-2*B).addScaledVector(E,B-O).normalize(),ne.pos.copy(r).addScaledVector(ge,q*l),J.copy(u).sub(ne.pos).normalize(),ye.setFromUnitVectors(K,J),le.identity().slerp(ye,Yt(Math.min(1,d*1.1))),ne.look.copy(K).applyQuaternion(le).multiplyScalar(q*l).add(ne.pos),ne.up.set(0,1,0),ne.world="globe",ne.dist=q,ne.upk=1,ne}return{layout:Oe,at:Ee,k:he,LAMH:n,LAM1:V}}var Ca=30.250453*Math.PI/180,sr=-13*Math.PI/180;function Pa(e,t={}){let r=(e-13.1)*15*Math.PI/180,l=Math.sin(Ca)*Math.sin(sr)+Math.cos(Ca)*Math.cos(sr)*Math.cos(r),o=Math.asin(l),u=Math.atan2(-Math.sin(r),Math.tan(sr)*Math.cos(Ca)-Math.sin(Ca)*Math.cos(r));return t.sinE=l,t.el=o,t.az=u,t.x=Math.cos(o)*Math.sin(u),t.y=l,t.z=-Math.cos(o)*Math.cos(u),t}var Ks=.79,Da=(e,t,r)=>{let l=Math.min(1,Math.max(0,(e-t)/(r-t)));return l*l*(3-2*l)},za=Math.log;function sn(e,t){let r=1+.3*(1-Da(e,.02,.45)),l=Da(-e,-.02,.12),o=1-.78*Da(t,za(2e3),za(4e4))*l,u=1+.66*Math.exp(-(((e-.0115)/(e>.0115?.016:.0135))**2)),S=1.05*r*o*u;return S+(Ks-S)*Da(t,za(2e6),za(9e6))}var ea={lat:30.250453,lon:-97.719913},Oa=17*Math.PI/180,$o=400,La=e=>{let t=(e%1009+1009)%1009;return(t*t*7+t*31+13)%1009/1009},Bo=180,vo=140,ka=164/11,Rt=4;var ln=`
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
`,Ys=e=>`
vec2 toGeo(vec2 p){ return vec2(p.x*uRot.x-p.y*uRot.y, p.x*uRot.y+p.y*uRot.x); }
float orthoW(vec2 g){ vec2 a=abs(g); return uOrthoOn*(1.-smoothstep(${$o-90}.,${$o-4}.,max(a.x,a.y))); }
vec3 ortho(vec2 g){ vec3 c=texture2D(tOrtho,vec2(g.x/${2*$o}.+.5,.5-g.y/${2*$o}.)).rgb;
  vec3 l=texture2D(tOrthoL,vec2(g.x/${2*e}.+.5,.5-g.y/${2*e}.)).rgb; vec2 a=abs(g);
  return mix(c,l,uOrthoLOn*(1.-smoothstep(${(e*.85).toFixed(1)},${e-2}.,max(a.x,a.y)))); }
// round feathers, never square: each photo hands over to the next one out well inside its own edge
float circW(vec2 g, float hf){ return 1.-smoothstep(.55*hf,.95*hf,length(g)); }
vec4 photoLayers(vec2 g){
  float wc=uOrthoCOn*circW(g,40000.), wb=uOrthoBOn*circW(g,4000.), wa=uOrthoOn*circW(g,${$o}.);
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
}`,cn=e=>`{
  vec2 bp=vLoc.xz; float bw=max(length(fwidth(bp)),1e-3), fade=1.-smoothstep(.15,.9,bw);   // only where it can resolve
  if(fade>0.){
    float e=.18; vec2 ex=vec2(e,0.), ez=vec2(0.,e);
    #define BH(q) (dot(ortho(toGeo(q)),vec3(.3,.5,.2))*.9*uOrthoOn+fb((q)*1.6)*.1+vn((q)*6.)*.025)
    float gx=(BH(bp+ex)-BH(bp-ex))/(2.*e), gz=(BH(bp+ez)-BH(bp-ez))/(2.*e);
    #undef BH
    normal=normalize(normal+(viewMatrix*vec4(-gx,0.,-gz,0.)).xyz*${e}*fade);
  } }`;function un({THREE:e,scene:t,renderer:r,sunLight:l,hemi:o,ORIGIN:u,earthU:S,ortho:w={}}){let M=w.lotHalf||200,p=Ys(M),C=new e.Group;C.position.copy(u),C.visible=!1,t.add(C);let y={uG:{value:0},uNight:{value:0},uT:{value:0},uWork:{value:0},uSunL:{value:new e.Vector3(0,1,0)},uOrigin:{value:u.clone()},tMap:S.tMap,tLights:S.tLights,uLL:{value:new e.Vector2(ea.lat,ea.lon)},uDig:{value:0},uPile:{value:0},uBack:{value:0},uClear:{value:0},uProg:{value:0},tOrtho:{value:null},uOrthoOn:{value:0},tOrthoL:{value:null},uOrthoLOn:{value:0},tOrthoB:{value:null},uOrthoBOn:{value:0},tOrthoC:{value:null},uOrthoCOn:{value:0},uRot:{value:new e.Vector2(Math.cos(Oa),Math.sin(Oa))}};{let I=new e.DataTexture(new Uint8Array([90,80,66,255]),1,1);I.needsUpdate=!0,y.tOrtho.value=I,y.tOrthoL.value=I}{let I=new e.DataTexture(new Uint8Array([70,72,60,255]),1,1);I.needsUpdate=!0,y.tOrthoB.value=I,y.tOrthoC.value=I}let A=new e.TextureLoader;A.setCrossOrigin("anonymous");let b={},n=500,V=(I,F,U,c=!1)=>new Promise($=>{if(!I)return $(!1);A.load(I,Ae=>{let He=Ae.image;(He&&He.decode?Promise.race([He.decode().catch(()=>{}),new Promise(St=>setTimeout(St,400))]):Promise.resolve()).then(()=>{if(Ae.colorSpace=e.SRGBColorSpace,Ae.anisotropy=8,Ae.needsUpdate=!0,r&&r.initTexture)try{r.initTexture(Ae)}catch{}y[F].value=Ae,c?b[U]=performance.now():y[U].value=1,$(!0)})},void 0,()=>$(!1))}),P=Promise.all([V(w.lot,"tOrthoL","uOrthoLOn"),V(w.site,"tOrtho","uOrthoOn")]),G=Promise.all([P,V(w.km8,"tOrthoB","uOrthoBOn",!0),V(w.km80,"tOrthoC","uOrthoCOn",!0)]),K=0,H=(I,F,U,c,$,Ae,He,Ot,St)=>{let At="tfsite"+K++;return I.customProgramCacheKey=()=>At,I.onBeforeCompile=mt=>{Object.assign(mt.uniforms,y),mt.vertexShader=`uniform vec3 uOrigin; uniform float uDig,uPile,uBack; varying vec3 vLoc;
`+ln+F+`
`+mt.vertexShader,Ot&&(mt.vertexShader=mt.vertexShader.replace("#include <beginnormal_vertex>",Ot)),mt.vertexShader=mt.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
`+U+`
vLoc=(modelMatrix*vec4(transformed,1.)).xyz-uOrigin;`),mt.fragmentShader=`uniform float uG,uNight,uT,uWork,uClear,uProg,uOrthoOn,uOrthoLOn,uOrthoBOn,uOrthoCOn; uniform vec3 uSunL; uniform sampler2D tMap,tLights,tOrtho,tOrthoL,tOrthoB,tOrthoC; uniform vec2 uLL,uRot; varying vec3 vLoc;
`+ln+p+c+`
`+mt.fragmentShader.replace("#include <color_fragment>",`#include <color_fragment>
`+$).replace("#include <roughnessmap_fragment>",`#include <roughnessmap_fragment>
`+Ae).replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>
`+He).replace("#include <normal_fragment_maps>",`#include <normal_fragment_maps>
`+(St||""))},I},ee=`
  vec3 SOD=vec3(1.,.58,.24);
  vec2 llUv(vec2 p){ float lat=uLL.x-p.y/110574., lon=uLL.y+p.x/(111320.*cos(radians(uLL.x))); return vec2((lon+180.)/360.,(lat+90.)/180.); }
  // one house slot: returns roof coverage and fills colour/height; painted only outside the 3D ring
  float house(vec2 lc, float ci, float cj, float row, out vec3 roof, out float ht, out vec2 porch, out float pool, out vec2 poolC, float w){
    float s=floor((lc.x+82.)/${ka.toFixed(6)}); roof=vec3(0.); ht=0.; pool=0.; porch=vec2(1e5); poolC=vec2(1e5);
    if(s<0.||s>10.) return 0.;
    float n=ci*157.+cj*311.+row*71.+s*13.+500.;
    if(Hh(n)>0.92) return 0.;
    float cx=-82.+(s+.5)*${ka.toFixed(6)}, front=row<.5? -70.+hwZ(cj-1.) : 70.-hwZ(cj), dir=row<.5?1.:-1.;
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
    vec2 uS=p/vec2(${Bo}.,${vo}.), dS=abs(fract(uS)-.5)*vec2(${Bo}.,${vo}.);
    float hS=3., sgS=max(hS,sg0), sa=max(1.5,sg0);
    float gX=h21(vec2(floor(uS.x),floor(uS.y+.5))+.37), gZ=h21(vec2(floor(uS.x+.5),floor(uS.y))+5.71);
    float segX=step(.18,gX)*(.4+1.2*fract(gX*13.1)), segZ=step(.18,gZ)*(.4+1.2*fract(gZ*13.1));
    float ddX=mod(p.y,36.)-18., ddZ=mod(p.x,36.)-18., fa=smoothstep(4.,9.,sa), dn=36.*1.5/(1.7725*sa);
    float dotX=mix(exp(-ddX*ddX/(sa*sa))*dn,1.,fa), dotZ=mix(exp(-ddZ*ddZ/(sa*sa))*dn,1.,fa);
    float Lst=(exp(-dS.x*dS.x/(sgS*sgS))*segX*dotX+exp(-dS.y*dS.y/(sgS*sgS))*segZ*dotZ)*hS/sgS;
    float mSt=1.7725*hS*(1./${Bo}.+1./${vo}.)*.82;
    float fS=smoothstep(.05*${vo}.,.13*${vo}.,sgS), aS=.14*(1.-.92*fS); S+=aS*mix(Lst/mSt,1.,fS); W+=aS;
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
    float ci=floor(p.x/${Bo}.+.5), cj=floor(p.y/${vo}.+.5);
    vec2 lc=p-vec2(ci*${Bo}.,cj*${vo}.);
    float kx=lc.x>0.?ci:ci-1., kz=lc.y>0.?cj:cj-1.;
    float dX=${Bo/2}.-abs(lc.x), dZ=${vo/2}.-abs(lc.y);          // distance to the street centrelines
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
        float s=floor((lc.x+82.)/${ka.toFixed(6)}), cxs=-82.+(s+.5)*${ka.toFixed(6)};
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
  }`,se=H(new e.MeshStandardMaterial({roughness:1,metalness:0,polygonOffset:!0,polygonOffsetFactor:2,polygonOffsetUnits:2}),"","",ee+`
vec3 gA; float gR; vec3 gE;`,`if(abs(vLoc.x)<74.8&&abs(vLoc.z)<54.8) discard; // the lot mesh owns this patch (the pit goes below the ground plane)
  float gw=max(length(fwidth(vLoc.xz)),1e-3); groundShade(vLoc.xz,gw,gA,gR,gE);
  { vec2 gq=toGeo(vLoc.xz); vec4 ph=photoLayers(gq); if(ph.a>0.){ gA=mix(gA,ph.rgb,ph.a); gR=mix(gR,.95,ph.a); }
    float ow=uOrthoOn*circW(gq,400.); if(ow>0.) gE=mix(gE,orthoNight(gq,gw)*uNight,ow*(1.-smoothstep(1.,3.,gw))); }
  diffuseColor.rgb=gA;`,"roughnessFactor=gR;","totalEmissiveRadiance+=gE;",null,cn(.35)),ye=new e.Mesh(new e.PlaneGeometry(1,1).rotateX(-Math.PI/2),se);ye.position.y=-.06,ye.receiveShadow=!0,ye.frustumCulled=!1,C.add(ye);let le=`
  float pitH(vec2 p){
    vec2 q=abs(p)-vec2(32.,20.); float dr=max(q.x,q.y);
    float m=1.-smoothstep(-3.,0.,dr);
    float xf=-32.+uDig*76.;                             // the dig face sweeps west to east
    float f=smoothstep(xf,xf-7.,p.x);
    float h=-${Rt}.*m*f;
    // haul ramp up the east side
    float rx=clamp((p.x-30.)/22.,0.,1.), rm=(1.-smoothstep(4.5,7.,abs(p.y)))*step(29.,p.x)*step(p.x,52.);
    h=min(h,-${Rt}.*(1.-rx)*rm*smoothstep(.55,.9,uDig)*(1.-uBack));
    // ground topography outside the dig: gentle swales, a few windrows from grading, all easing to 0 at the lot edge
    float edge=(1.-smoothstep(62.,74.,abs(p.x)))*(1.-smoothstep(42.,54.,abs(p.y)));
    float topo=(fb(p*.022+3.)-.47)*1.6+(vn(p*.11)-.5)*.35+smoothstep(.55,1.,sin(p.y*.42+fb(p*.05)*4.))*.22;
    h+=topo*edge*(1.-m*f);
    // spoil pile
    float r=length((p-vec2(-52.,-38.))*vec2(1.,1.3));
    h+=uPile*7.*exp(-r*r/160.)*(.8+.4*vn(p*.15));
    return h;
  }`,Se=H(new e.MeshStandardMaterial({roughness:1,metalness:0}),le,"transformed.y+=pitH(position.xz);",`
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
    if(abs(p.x)<31.&&abs(p.y)<19.&&y<-${Rt-.4}){
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
    #endif`,cn(.9)),Ge=new e.Mesh(new e.PlaneGeometry(150,110,150,110).rotateX(-Math.PI/2),Se);Ge.receiveShadow=!0,C.add(Ge);let re=(I,F=.7,U=0,c)=>new e.MeshStandardMaterial({color:I,roughness:F,metalness:U,...c?{emissive:c}:{}}),D={yel:re(15774218,.5,.1),dark:re(1842204,.85),glass:re(1450540,.15,.4),white:re(15328991,.55),conc:re(12038824,.9),grey:re(8223607,.6,.3),orange:re(15229980,.5),blue:re(2775720,.6),ply:re(12613434,.8),rust:re(8010524,.9),green:re(2242602,.9),lamp:new e.MeshBasicMaterial({color:16777215}),drum:re(14210252,.4,.3)},ge=(I,F,U,c,$=0,Ae=0,He=0,Ot)=>{let St=new e.Mesh(new e.BoxGeometry(I,F,U),c);return St.position.set($,Ae,He),St.castShadow=St.receiveShadow=!0,(Ot||C).add(St),St},E=(I,F,U,c,$,Ae,He,Ot="z")=>{let St=new e.CylinderGeometry(I,I,F,14);Ot==="z"?St.rotateX(Math.PI/2):Ot==="x"&&St.rotateZ(Math.PI/2);let At=new e.Mesh(St,U);return At.position.set(c,$,Ae),At.castShadow=!0,He.add(At),At},J=new e.Matrix4,me=new e.Quaternion,he=new e.Vector3,be=new e.Vector3,ue=new e.Vector3(0,1,0),te=new e.Vector3(1e-4,1e-4,1e-4),ie=(I,F,U)=>{let c=Math.min(1,Math.max(0,(I-F)/(U-F)));return c*c*(3-2*c)},fe=[],Oe=new e.InstancedMesh(new e.IcosahedronGeometry(1,1),re(2044692,.95),fe.length);Oe.castShadow=Oe.receiveShadow=!0,C.add(Oe);{let I=[];for(let U=-75;U<75;U+=3)I.push([U+1.5,-55,0],[U+1.5,55,0]);for(let U=-55;U<55;U+=3)I.push([-75,U+1.5,1]),U>-32&&U<-6||U>18&&U<42||I.push([75,U+1.5,1]);let F=new e.InstancedMesh(new e.BoxGeometry(3,1.8,.08).translate(0,.9,0),D.green,I.length);I.forEach(([U,c,$],Ae)=>{J.compose(he.set(U,0,c),me.setFromAxisAngle(ue,$?Math.PI/2:0),be.set(1,1,1)),F.setMatrixAt(Ae,J)}),F.castShadow=!0,C.add(F)}let Ee=[new e.PointLight(16773336,0,90,1.6),new e.PointLight(16773336,0,90,1.6)];Ee[0].position.set(-30,14,-10),Ee[1].position.set(30,14,10),Ee.forEach(I=>C.add(I));let{exA:Ye,exB:ne,trucks:Qe,dozer:Ve,pump:Te,mixers:Ce,crane:q,crew:d,towers:O,roofs:B}=Ur({THREE:e,group:C,D:Rt}),R=44,de=[];for(let I=-28;I<=28;I+=8)for(let F=-16;F<=16;F+=8)de.push([I,F]);let Ue=new e.InstancedMesh(new e.BoxGeometry(.75,1,.75).translate(0,.5,0),D.conc,de.length);Ue.castShadow=Ue.receiveShadow=!0,C.add(Ue);let Ke=[[-12,-4,8,6],[14,5,6,6]].map(([I,F,U,c])=>{let $=ge(U,1,c,D.conc,I,-Rt,F);return $.geometry.translate(0,.5,0),$}),Re=[];for(let I=-28;I<28;I+=8)for(let F=-18;F<18;F+=9)Re.push([I+4,F+4.5]);let Ne=new e.InstancedMesh(new e.BoxGeometry(7.8,.35,8.8),D.ply,Re.length);Ne.castShadow=Ne.receiveShadow=!0,C.add(Ne);let qe={},yt=new e.Vector3,Gt=new e.Color,Mt=new e.Color,_e=O[0].material.color.clone(),Y=e.MathUtils.degToRad(.1),ze=e.MathUtils.degToRad(2.5),We=7,$e=80,rt=40,ut=.45,tt=.09,Pt=[[86,-420],[86,-30],[74,-24],[40,-25.5],[-20,-25.5],[-44,-25.5],[-50,0],[-44,25.5],[-10,25.5],[40,25.5],[74,30],[86,36],[86,420]],Lt=Pt.slice(1).map((I,F)=>{let U=Math.hypot(I[0]-Pt[F][0],I[1]-Pt[F][1]);return{L:U,T:U/(U>200?12:4.5)}}),ot=Lt.reduce((I,F)=>I+F.T,0),It=(I,F)=>{let U=I*ot,c=0;for(;c<Lt.length-1&&U>Lt[c].T;)U-=Lt[c].T,c++;let $=Math.min(1,U/Lt[c].T),Ae=Pt[c],He=Pt[c+1];return F.set(Ae[0]+(He[0]-Ae[0])*$,0,Ae[1]+(He[1]-Ae[1])*$),Math.atan2(-(He[1]-Ae[1]),He[0]-Ae[0])},kt=new e.Vector3,Tt=new e.Vector3(1,0,0),Xe=(I,F,U)=>{kt.subVectors(U,F);let c=kt.length();I.position.copy(F).add(U).multiplyScalar(.5),I.scale.set(c,1,1),I.quaternion.setFromUnitVectors(Tt,kt.normalize())},Bt=new e.Vector3,vt=new e.Vector3,s=new e.Vector3,f=Array.from({length:R},()=>({x:0,y:0,z:0,yaw:0})),T=-1,L=-1,v=new e.Vector3,ae=new e.Vector3,h=new e.Vector3(0,1,0),W=I=>Aa(l,u,I,400,v,ae);function Me({g:I,t:F,hour:U}){for(let oe in b){let Pe=Math.min(1,(performance.now()-b[oe])/n);y[oe].value=Pe*Pe*(3-2*Pe),Pe>=1&&delete b[oe]}let c=I,{sinE:$,el:Ae,az:He}=Pa(U,qe),Ot=Math.round(.5*(Ae+ze+Math.sqrt((Ae-ze)**2+4e-4))/Y)*Y,St=Math.round(He/Y)*Y;yt.set(Math.cos(Ot)*Math.sin(St),Math.sin(Ot),-Math.cos(Ot)*Math.cos(St));let At=ie($,-.1,.12),mt=1-At,g=1-ie($,.05,.5);y.uSunL.value.copy(yt),y.uNight.value=ie(-$,-.02,.12),y.uT.value=F,y.uG.value=I,y.uProg.value=c,y.uWork.value=y.uNight.value*ie(c,.03,.06),l.color.setRGB(1,.93-g*.25,.85-g*.45),l.intensity=3.2*ie($,-.02,.1),W(yt),o.color.copy(Gt.setRGB(.42,.58,1).lerp(Mt.setRGB(.06,.07,.12),mt)),o.groundColor.setRGB(.42*At+.02,.34*At+.02,.24*At+.03),o.intensity=.6+.95*At;let X=y.uWork.value;Ee.forEach(oe=>oe.intensity=140*X),O[0].material.color.copy(_e).multiplyScalar(X),O.forEach(oe=>oe.visible=X>.002),y.uClear.value=ie(c,0,.07),y.uDig.value=ie(c,.07,.36),y.uPile.value=ie(c,.08,.24)*(1-ie(c,.3,.46))*.9+.1*ie(c,.3,.46),y.uBack.value=ie(c,.8,.93),fe.forEach(([oe,Pe,Le],ce)=>{let _=1-ie(c,.005+ce*.004,.02+ce*.004);J.compose(he.set(oe,Le*.55+1.6,Pe),me.setFromAxisAngle(ue,ce),_>.01?be.set(Le*_,Le*.55*_,Le*_):te),Oe.setMatrixAt(ce,J)}),Oe.instanceMatrix.needsUpdate=!0;let ve=c>.06&&c<.42,Be=-32+y.uDig.value*76;[[Ye,-13,-1],[ne,13,1]].forEach(([oe,Pe,Le],ce)=>{oe.g.visible=ve||ce===1&&c>.8&&c<.95;let _=(F/We+ce*.37)%1,Ct=ie(_,.35,.55)*(1-ie(_,.7,.95));oe.up.rotation.y=Ct*Le*1.9,oe.boom.rotation.z=e.MathUtils.lerp(.35-ie(_,0,.3)*.55,.62,Ct),oe.stick.rotation.z=-e.MathUtils.lerp(1.05+ie(_,.05,.33)*.9,.9-ie(_,.55,.68)*.5,Ct);let Kt=ce===1&&c>.8?40:Math.min(26,Math.max(-28,Be-6));oe.g.position.set(Kt,ce===1&&c>.8?-1:-Rt*ie(c,.07,.12),Pe),oe.g.rotation.y=0}),Qe.forEach((oe,Pe)=>{let Le=(F/ot+Pe/Qe.length)%1;oe.g.visible=c>.07&&c<.46,oe.g.rotation.y=It(Le,oe.g.position),oe.load.visible=Le>.5});{let oe,Pe,Le=0,ce=!0,_;c<.1?(_=F/$e,oe=-60+Math.abs(_%1*2-1)*110,Pe=-40+Math.floor(_)%4*20):c>.3&&c<.44?(_=F/rt,oe=-26+Math.abs(_%1*2-1)*52,Pe=-12+Math.floor(_)%3*12,Le=-Rt):c>.86?(_=F/rt,oe=-60+Math.abs(_%1*2-1)*40,Pe=40):ce=!1,Ve.visible=ce,ce&&(Ve.position.set(oe,Le,Pe),Ve.rotation.y=_%1<.5?0:Math.PI)}let xe=Math.min(7,Math.max(0,Math.floor((c-.47)/.028+.5))),Ze=c>.455&&c<.69;if(Te.g.visible=Ze,Ce.forEach(oe=>oe.g.visible=Ze),Ze){let oe=-32+Math.floor(xe/2)*16+8,Pe=xe%2?9.5:-9.5;Te.g.position.set(oe,0,-29),Bt.set(oe,3.2,-29),s.set(oe+Math.sin(F*ut)*3,-Rt+3.5,Pe+Math.cos(F*ut*.8)*2),vt.copy(Bt).lerp(s,.45),vt.y=16,Xe(Te.s1,Bt,vt),Xe(Te.s2,vt,s),Xe(Te.hose,s,he.copy(s).setY(-Rt+.2)),[Te.s1,Te.s2,Te.hose].forEach(Le=>Le.visible=!0),Ce.forEach((Le,ce)=>{Le.g.position.set(oe+12+ce*11,0,-29),Le.d.rotation.x=F*3+ce})}else[Te.s1,Te.s2,Te.hose].forEach(oe=>oe.visible=!1);{let oe=ie(c,.4,.47),Pe=40*oe+.01;q.g.visible=oe>.01,q.mast.scale.y=Pe,q.top.position.y=Pe,q.top.visible=oe>.95;let Le=F*tt;q.top.rotation.y=Math.sin(Le)*1.6+Math.sin(Le*2.3)*.7;let ce=12+(Math.sin(F*.13)*.5+.5)*36,_=10+(Math.sin(F*.21)*.5+.5)*22;q.trolley.position.x=ce,q.line.scale.y=_,q.line.position.y=-.8-_/2,q.hook.position.y=-1.2-_}de.forEach(([oe,Pe],Le)=>{let ce=Math.floor((oe+32)/16)*2+(Pe<0?0:1),_=ie(c,.47+ce*.028+.07,.47+ce*.028+.12);J.compose(he.set(oe,-Rt,Pe),me.identity(),_>.01?be.set(1,3.6*_,1):te),Ue.setMatrixAt(Le,J)}),Ue.instanceMatrix.needsUpdate=!0,Ke.forEach((oe,Pe)=>{let Le=ie(c,.56+Pe*.03,.98);oe.visible=Le>.01,oe.scale.y=Math.max(.01,13*Le)}),Re.forEach(([oe,Pe],Le)=>{let ce=ie(c,.8+(oe+28)/56*.15+Le%4*.01,.84+(oe+28)/56*.15+Le%4*.01);J.compose(he.set(oe,-.25,Pe),me.identity(),ce>.5?be.set(1,1,1):te),Ne.setMatrixAt(Le,J)}),Ne.instanceMatrix.needsUpdate=!0;let xt=T<0?0:Math.min(.1,Math.max(0,F-T)),Xt=T<0||Math.abs(I-L)>.08;T=F,L=I;for(let oe=0;oe<R;oe++){let Pe=Math.floor(F/(6+6*La(oe*13+3))+La(oe*7+1)),Le=La(oe*31+Pe*7),ce=La(oe*17+Pe*3+5),_,Ct,Kt=0;if(oe<26&&c>.38&&c<.72){let Je=Math.min(7,xe+(oe%3===0?1:0));_=-32+Math.floor(Je/2)*16+2+Le*12,Ct=(Je%2?2:-17)+ce*15,Kt=-Rt}else if(oe<26&&c>=.72){let Je=de[(oe*7+Pe)%de.length];_=Je[0]+(Le-.5)*3,Ct=Je[1]+(ce-.5)*3,Kt=-Rt+(c>.85&&_<0?3.75:0)}else oe<34&&ve?(_=Be-2+Le*8,Ct=(oe%2?-1:1)*(20+ce*4)):(_=40+Le*25,Ct=-40+ce*10);let Ie=f[oe],Ft=_-Ie.x,j=Kt-Ie.y,Z=Ct-Ie.z,pe=Math.hypot(Ft,j,Z);if(Xt||pe>90)Ie.x=_,Ie.y=Kt,Ie.z=Ct,Ie.yaw=Le*6;else if(pe>.02){let Je=Math.min(pe,xt*Math.min(5,Math.max(1.3,pe*.5)));Ie.x+=Ft/pe*Je,Ie.y+=j/pe*Je,Ie.z+=Z/pe*Je;let ft=Math.atan2(-Z,Ft)-Ie.yaw;ft-=Math.round(ft/(2*Math.PI))*2*Math.PI,Ie.yaw+=ft*Math.min(1,xt*6)}J.compose(he.set(Ie.x,Ie.y,Ie.z),me.setFromAxisAngle(ue,Ie.yaw),be.set(1,1,1)),d.setMatrixAt(oe,J)}return d.instanceMatrix.needsUpdate=!0,{hour:U,prog:c,sinE:$,sunL:yt,night:y.uNight.value}}function N(I,F){let U=Math.max(4e3,F*12);ye.scale.set(U,1,U),ye.position.x=I.x,ye.position.z=I.z}let Q=.05;async function De({next:I=()=>Promise.resolve(),alive:F=()=>!0}={}){let U=await Fr();if(!F())return null;let c=Nr(e,Vr(U,Q)),$=0,Ae=0;try{for(let He of B){if(await I(),!F())return null;$+=Ir(He,c),Ae++}}finally{for(let He in c)c[He].dispose()}return{machines:Ae,tris:$}}return{group:C,update:Me,follow:N,uniforms:y,D:Rt,ready:P,readyAll:G,addShrouds:De}}var ir=Math.log,Ba=(e,t,r)=>{let l=Math.min(1,Math.max(0,(e-t)/(r-t)));return l*l*(3-2*l)},Fa=17*Math.PI/180,Qs=(e,t,r)=>r.set(e*Math.cos(Fa)+t*Math.sin(Fa),0,-e*Math.sin(Fa)+t*Math.cos(Fa)),fn=[{D:3900,nx:-.34,ny:.3,r:260,turn:240,v:3200,span:36,drift:50,T:7.5},{D:6800,nx:.34,ny:0,r:420,turn:-70,v:3200,span:60,drift:50,T:8.5},{D:5e3,nx:.5,ny:.55,alt:1600,hdg:172,v:1800,span:36,land:!0,drift:300,T:14},{D:7e3,nx:.75,ny:.8,alt:2300,hdg:175,v:1800,span:34,land:!0,drift:300,T:16},{D:4500,nx:-.6,ny:-.5,alt:2e3,hdg:352,v:2e3,span:36,drift:300,T:15,hi:!0},{D:14e3,nx:-.5,ny:.4,alt:9500,hdg:62,v:3e3,span:60,drift:300,T:13,hi:!0},{D:18e3,nx:.45,ny:-.3,alt:11300,hdg:258,v:3200,span:64,drift:300,T:12,hi:!0},{D:11e3,nx:-.2,ny:.6,alt:7200,hdg:128,v:2600,span:36,drift:300,T:15,hi:!0}],hn=[[-.5,0,-.12,0],[.5,0,-.12,1],[0,.03,-.52,2],[-.5,0,-.135,3],[.5,0,-.135,3],[0,.07,.02,4],[0,-.06,.06,4]],Zs=[[-.11,-.04,.14,5],[.11,-.04,.14,5]],Js=`
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
}`,Rs=`float ss2(float x,float a,float b){ return clamp((x-a)/max(b-a,1e-4),0.,1.); }
`,_s=`
varying vec3 vCol; varying float vK;
void main(){
  vec2 q=gl_PointCoord*2.-1.; float d2=dot(q,q); if(d2>1.) discard;
  float g=mix(exp(-d2*2.5)*(1.-d2),exp(-d2*40.)+.12*exp(-d2*6.)*(1.-d2),vK); // a soft dot when it is a point; hot core + halo up close
  gl_FragColor=vec4(vCol*g,1.);
}`;function dn({THREE:e,parent:t,high:r=!0}){let l=r?fn:fn.filter(D=>!D.hi),o=l.length,u=[],S=[],w=[];l.forEach((D,ge)=>{for(let[E,J,me,he]of D.land?hn.concat(Zs):hn)u.push(ge),S.push(he),w.push(E*D.span,J*D.span,me*D.span)});let M=new e.BufferGeometry;M.setAttribute("position",new e.BufferAttribute(new Float32Array(u.length*3),3)),M.setAttribute("aId",new e.BufferAttribute(new Float32Array(u),1)),M.setAttribute("aKind",new e.BufferAttribute(new Float32Array(S),1)),M.setAttribute("aOff",new e.BufferAttribute(new Float32Array(w),3));let p=()=>new e.Vector3,C={uC:{value:Array.from({length:8},p)},uF:{value:Array.from({length:8},()=>new e.Vector3(0,0,-1))},uA:{value:new Array(8).fill(0)},uPh:{value:l.map((D,ge)=>ge*.618034%1).concat(new Array(8-o).fill(0))},uT:{value:0},uProj:{value:1e3},uMin:{value:2},uMax:{value:72}},y=new e.ShaderMaterial({uniforms:C,vertexShader:Js.replace("void main(){",Rs+"void main(){"),fragmentShader:_s,transparent:!0,depthWrite:!1,depthTest:!0,blending:e.AdditiveBlending,fog:!1}),A=new e.Points(M,y);A.frustumCulled=!1,A.renderOrder=2,A.name="aircraft",t.add(A);let b=l.map((D,ge)=>({spec:D,i:ge,p0:p(),fwd:new e.Vector3(0,0,-1),lam0:ir(D.D),pos:p(),a:0})),n={pos:p(),look:p(),up:p(),fov:38},V=p(),P=p(),G=p(),K=p(),H=p(),ee=(D,ge)=>{let E=D*Math.PI/180;return Qs(Math.sin(E),-Math.cos(E),ge).normalize()};function se(D,ge){for(let E of b){let J=E.spec;D(J.D,n),V.copy(n.look).sub(n.pos).normalize(),P.crossVectors(V,n.up).normalize(),G.crossVectors(P,V);let me=Math.tan(n.fov*Math.PI/360),he=me*ge;if(K.copy(V).addScaledVector(P,J.nx*he).addScaledVector(G,J.ny*me).normalize(),E.p0.copy(n.pos).addScaledVector(K,J.r!=null?J.r:(J.alt-n.pos.y)/K.y),J.hdg!=null)ee(J.hdg,E.fwd);else{let be=J.turn*Math.PI/180;H.copy(G).setY(0).normalize(),E.fwd.copy(P).setY(0).normalize().multiplyScalar(Math.cos(be)).addScaledVector(H,Math.sin(be)).normalize()}}}function ye(D,ge,E){let J=D.spec,me=((E/J.T+C.uPh.value[D.i]*3.7)%1+1)%1;return D.pos.copy(D.p0).addScaledVector(D.fwd,J.v*(ge-D.lam0)+J.drift*(2*me-1)),Ba(me,0,.07)*(1-Ba(me,.93,1))}let le=0;function Se({lam:D,t:ge,sinE:E,proj:J,pr:me=1}){if(le=Ba(-E,-.035,.03)*(1-Ba(D,ir(6e4),ir(25e4))),A.visible=le>.001,!A.visible){for(let he of b)he.a=0;return le}return C.uT.value=ge,C.uProj.value=J,C.uMin.value=3*me,C.uMax.value=96*me,b.forEach((he,be)=>{he.a=le*ye(he,D,ge),C.uC.value[be].copy(he.pos),C.uF.value[be].copy(he.fwd),C.uA.value[be]=he.a}),le}function Ge(D,ge,E,J){let me=b[D],he=ye(me,ge,E);return J.copy(me.pos),he}function re(){t.remove(A),M.dispose(),y.dispose()}return{points:A,layout:se,update:Se,at:Ge,fleet:b,dispose:re}}var oo=.46,_t=.4,ta=.6;function vn({THREE:e}){let t=(j,Z,pe)=>new e.Vector3(j,Z,pe),r=Math.PI/180,l=t(0,1,0),o=11.25,u=-52,S=17.5,w=-22,M=11.8,p=18,C=11.65,y=-.7,A=.018,b=54,n=-.745,V=-.725,P=-.66,G=-.45,K=-.9,H=-.16,ee=25,se=.65,ye=-35*r,le=.19,Se=.002,Ge=t(-.6543,.2642,-.7086),re=t(.5744,-.4358,-.6929),D=2,ge=t(-1,.22,-.55).normalize(),E=t(0,0,0),J=t(0,1,0).addScaledVector(ge,-ge.y).normalize(),me=E.clone().addScaledVector(ge,-23).addScaledVector(J,10.4),he=me.clone().addScaledVector(ge,60).addScaledVector(J,-9),be=t(.0106681,.002613,.0218856),ue=be.clone().normalize(),te=be.length(),ie=t(25.216,6.526,17.498),fe=ie.clone().negate().normalize(),Oe=fe.clone().cross(l).normalize(),Ee=Oe.clone().cross(fe),Ye=(j,Z)=>t().addScaledVector(fe,Z*Math.sin(j*r)).addScaledVector(Ee,Z*Math.cos(j*r)),ne=(j,Z=t())=>Z.set(0,0,0).addScaledVector(fe,Math.cos(j*r)).addScaledVector(Ee,Math.sin(j*r)),Qe=j=>Math.atan2(j.dot(Ee),j.dot(fe))/r,Ve=4,Te=480,Ce=ne(Ve).multiplyScalar(Te),q=(j,Z,pe)=>t(j,Z,pe).add(Ce),d=t(70,20,100),O=t(d.x,0,d.z).normalize(),B=d.clone().cross(l).normalize(),R=(j,Z)=>O.clone().multiplyScalar(j*Math.cos(Z*r)).addScaledVector(l,j*Math.sin(Z*r)).add(Ce),de=q(70,20,100),Ue=R(49.5,10.6),Ke=R(41.67,11.8),Re=Ke.clone().sub(Ce),Ne=Re.length();Re.normalize();let qe=ee*r,yt=Math.sin(qe),Gt=l.clone().addScaledVector(Re,-Re.y).normalize(),Mt=t(),_e=t(),Y=t();{let j=Je=>(Mt.copy(Re).multiplyScalar(Je).addScaledVector(Gt,Math.sqrt(1-Je*Je)),Y.copy(Re).multiplyScalar(Ne).addScaledVector(Mt,-(6+se)),Y.dot(Mt)/Y.length()-yt),Z=-.95,pe=.95;for(let Je=0;Je<60;Je++){let et=(Z+pe)/2;j(et)<0?Z=et:pe=et}j((Z+pe)/2),Y.normalize().negate(),_e.copy(Ce).addScaledVector(Mt,6+se)}let ze=Ke.distanceTo(_e),We=Ke.clone().addScaledVector(Y,.55*ze),$e=new e.Quaternion().setFromAxisAngle(d.clone().normalize(),ye),rt=(j,Z)=>Z.setFromAxisAngle(l,le+j*Se).premultiply($e),ut=Ye(0,o),tt=Ye(p,C),Pt=Ce.clone().sub(tt).normalize(),Lt=Ce.clone().addScaledVector(Ce.clone().negate().normalize().lerp(d.clone().normalize(),.62).normalize(),270),ot=(j,Z)=>j.addScaledVector(Z,-j.dot(Z)).normalize(),It=t(-.13013639750678707,.2577593941984025,.9574051455608686),kt=Ye(u,S),Tt=ie.clone().addScaledVector(ot(It.clone(),Oe).add(kt.clone().sub(ie).normalize()).normalize(),1.5),Xe=[[-1,me,ue],[-.9,ie,It],[null,Tt,null],[null,kt,null],[null,Ye(w,M),null],[null,ut,fe.clone()],[null,tt,Pt],[null,tt.clone().addScaledVector(Pt,70),Pt],[null,Lt,null],[0,de,null],[.16,Ue,null],[.34,Ke,Y],[_t,We,Y],[oo,_e,Y]],Bt=Xe.length,vt=Xe.map(j=>j[1]),s=[];for(let j=0;j<Bt;j++){if(Xe[j][2]){s.push(Xe[j][2].clone());continue}let Z=j>0?vt[j].clone().sub(vt[j-1]).normalize():t(),pe=j<Bt-1?vt[j+1].clone().sub(vt[j]).normalize():t();s.push(Z.add(pe).normalize())}ot(s[2],Oe),ot(s[9],B);let f=vt.slice(0,-1).map((j,Z)=>j.distanceTo(vt[Z+1])),T=new e.Curve;T.getPoint=(j,Z=new e.Vector3)=>{let pe=Math.min(Math.max(j,0),1)*(Bt-1),Je=Math.min(Bt-2,Math.floor(pe)),et=pe-Je,ft=et*et,ht=ft*et,lt=f[Je];return Z.copy(vt[Je]).multiplyScalar(2*ht-3*ft+1).addScaledVector(s[Je],(ht-2*ft+et)*lt).addScaledVector(vt[Je+1],3*ft-2*ht).addScaledVector(s[Je+1],(ht-ft)*lt)},T.arcLengthDivisions=(Bt-1)*800;let L=T.getLengths(),v=j=>{let Z=j*(L.length-1),pe=Math.floor(Z);return pe>=L.length-1?L[L.length-1]:L[pe]+(L[pe+1]-L[pe])*(Z-pe)},ae=vt.map((j,Z)=>v(Z/(Bt-1))),h=[[-1,0,te,-3e-5],[-.9,1,.0022,0],[y,5,A,0],[0,9,.075,-4e-5],[.16,10,.012,-1e-5],[.34,11,.006,0],[_t,12,.11,-1e-4],[oo,13,.04,-1e-4]],W=[[2.181,-1],[2.781,-.9],[3.481,-.64],[4.25,-.15],[4.75,0],[8.5,.26],[10.5,.62],[13.5,.9],[15,1.12]],Me=Sa(W),N=h.length,Q=new Float64Array(N),De=new Float64Array(N),I=new Float64Array(N),F=new Float64Array(N),U=null,c=0,$=1,Ae=j=>{let Z=c,pe=$;for(let Je=0;Je<40;Je++){let et=(Z+pe)/2;U(et)<j?Z=et:pe=et}return(Z+pe)/2},He=(j,Z,pe)=>(j(Z+pe)-j(Z-pe))/(2*pe);function Ot({S:j,yE:Z,y1:pe,vh:Je=900}){U=j,c=Z,$=pe;let et=W[0][0],ft=W[W.length-1][0];for(let ht=0;ht<N;ht++){let lt=h[ht][0];Q[ht]=lt<=-1?Z:Ae(lt);let Qt=1;if(lt>-1){let ke=et,Wt=ft;for(let bt=0;bt<50;bt++){let Jt=(ke+Wt)/2;Me(Jt)<lt?ke=Jt:Wt=Jt}Qt=He(j,Q[ht],.5)*Je/Math.max(1e-9,He(Me,(ke+Wt)/2,1e-4))}I[ht]=h[ht][2]*Qt,F[ht]=h[ht][3]*Qt*Qt}for(let ht=0;ht<N-1;ht++){let lt=Q[ht+1]-Q[ht],Qt=I[ht],ke=I[ht+1],Wt=F[ht]*lt,bt=F[ht+1]*lt;De[ht]=(ae[h[ht+1][1]]-ae[h[ht][1]])/lt-((Qt+ke)/2+(Wt-bt)/12)}}function St(j){if(j<=Q[0])return 0;if(j>=Q[N-1])return ae[h[N-1][1]];let Z=0;for(;j>Q[Z+1];)Z++;let pe=Q[Z+1]-Q[Z],Je=(j-Q[Z])/pe,et=Je*Je,ft=et*Je,ht=ft*Je,lt=I[Z],Qt=I[Z+1],ke=F[Z]*pe,Wt=F[Z+1]*pe,bt=lt*(Je-ft+ht/2)+ke*(et/2-2*ft/3+ht/4)+Qt*(ft-ht/2)+Wt*(ht/4-ft/3)+De[Z]*ft*(10-15*Je+6*et);return ae[h[Z][1]]+pe*bt}let At=[0,1,2].map(j=>rr([-1,-.9],[he.getComponent(j),E.getComponent(j)],[0,0])),mt=j=>Yt(Nt((j+.9)/(n+.9))),g=j=>Yt(Nt((j+.9)/(P+.9))),X=j=>Yt(Nt((j-V)/(G-V))),ve=.34,Be=_t-.005,xe=rr([-1,-.9,y,-.5,-.25,0,.16,.34,_t,oo],[38,48,b,38,31,30,30,32,42,52],[0,0,null,null,null,null,null,null,null,null]),Ze=31.26,xt=Ge,Xt=re,oe=D,Pe=(j,Z)=>{let pe=j+1,Je=pe<.08?pe*pe/.16:pe-.04,et=oe*(Je-.06);return Z.copy(xt).multiplyScalar(Ze*Math.cos(et)).addScaledVector(Xt,Ze*Math.sin(et)).add(E)},Le=j=>1+15*(1-Yt(Nt((j-K)/(H-K)))),ce=j=>Yt(Nt((j+.9)/.04))*(1-Yt(Nt((j-P)/.06))),_=j=>Yt(Nt((j+.06)/.06));function Ct(j,Z,pe){let Je=Z.length()-10;pe.multiplyScalar(Nt((Je-1)/6));let et=ce(j),ft=_(j);return et>0&&pe.addScaledVector(Oe,-et*pe.dot(Oe)),ft>0&&pe.addScaledVector(B,-ft*pe.dot(B)),pe}let Kt=t(),Ie=t();function Ft(j,Z,pe,Je){let et=Math.min(Math.max(j,-1),oo),ft=et<=-1?Q[0]:et>=oo?Q[N-1]:Ae(et),ht=St(ft);if(T.getPoint(T.getUtoTmapping(0,Math.max(0,Math.min(L[L.length-1],ht))),Z),et<=-.9)pe.set(At[0](et),At[1](et),At[2](et));else if(et>=G)pe.copy(Ce);else{let Qt=mt(et),ke=Z.length(),Wt=Math.log(ke+(Math.sqrt(Math.max(0,ke*ke-100))-ke)*Qt),bt=X(et),Jt=Math.exp(Wt+(Math.log(Ce.distanceTo(Z))-Wt)*bt);et>=P?pe.copy(Ce).sub(Z).normalize().multiplyScalar(Jt).add(Z):pe.copy(Z).add(ne(g(et)*Qe(Ie.copy(Ce).sub(Z)),Ie).multiplyScalar(Jt))}let lt=Yt(Nt((et-ve)/(Be-ve)));return lt>0&&pe.lerp(Kt.copy(Z).addScaledVector(Y,40),lt),Je&&Je.set(0,1,0),xe(et)}return{toSun:ge,EARTH:E,MARS:Ce,C0:me,L0:he,P1:ie,H2:Ke,EN1:Mt,ENP:_e,LCA:Y,PN:Oe,QN:B,CA:oo,E0:_t,E1:ta,MOON_R:Ze,layout:Ot,spaceCam:Ft,moonAt:Pe,marsFar:Le,marsQ:rt,drift:Ct}}var Hs=.45,Ao=(e,t,r)=>Yt(Nt((e-t)/(r-t)));function lr(e,t,r){if(!(r<1))return t;let l=1-(1-Hs)*Ao(e,-.86,-.74),o=Math.min(2.2,(1.12/r)**l),u=Ao(e,-1,-.9);return 2*Math.atan(Math.tan(t*Math.PI/360)*(1+u*(o-1)))*180/Math.PI}function cr(e,t){let r=1-Ao(t,.6,.8);if(r<=0)return 0;let l=Ao(e,-1,-.93)*(1-Ao(e,-.84,-.74)),o=Ao(e,.5,.6)*(1-Ao(e,.88,.98));return r*(.2*l+.14*o)}function mn({high:e=!0,rockets:t=!0}={}){let r=(()=>{let n=7;return()=>(n=n*16807%2147483647)/2147483647})(),l=[62,132,204],o=8,u={land:[[55,-150],[15,-168]],build:[-25,-100]},S=[{x:0,z:0,r:20,bt:.02,kind:"hub"}],w=[];for(let n=0;n<4;n++){let V=Math.PI/8+n*Math.PI/2;S.push({x:Math.cos(V)*96,z:Math.sin(V)*96,r:15,bt:.26+n*.08,kind:"outer"}),w.push({a:V,r0:19,len:62,y:2.6,radius:2.4,bt:.12+n*.07})}let M=(n,V)=>Math.abs(((n-V)%(Math.PI*2)+Math.PI*3)%(Math.PI*2)-Math.PI),p=[],C=[];for(let n=34;n<238;n+=14){let V=n*.11;for(;V<n*.11+Math.PI*2-.05;){let P=Math.min(6.6,2.6+r()*3.2+5*Math.exp(-n/70)),G=Math.cos(V)*n,K=Math.sin(V)*n,H=[...Array(o)].some((ye,le)=>M(V,le*Math.PI/4)*n<P+4),ee=n<86&&w.some(ye=>M(V,ye.a)*n<P+3.5);if(!(H||ee||l.some(ye=>Math.abs(n-ye)<P+3.5)||S.some(ye=>Math.hypot(G-ye.x,K-ye.z)<ye.r+P+3))&&r()>.1){let ye=.06+n/238*.58+r()*.08;n>175&&r()<.28?C.push({x:G,z:K,w:8+r()*4,d:5,h:2.5+r()*2.5,rot:V,bt:ye}):p.push({x:G,z:K,r:P,ys:.72+r()*.35,rot:r()*6.28,bt:ye,seed:r()*50})}V+=(2*P+2.6)/n}}let y=[...p].sort((n,V)=>n.bt-V.bt);e||y.forEach((n,V)=>n.skip=V%2===1),t&&y.forEach(n=>{(u.land.some(([V,P])=>Math.hypot(n.x-V,n.z-P)<n.r+16)||Math.hypot(n.x-u.build[0],n.z-u.build[1])<n.r+30)&&(n.skip=!0)});let A=(n,V)=>{let P=Math.sin(n*.1271+V*.3117+1.7)*43758.5453;return P-Math.floor(P)};p.forEach(n=>{let V=A(n.x,n.z);n.type=V<.26?0:V<.56?1:V<.8?2:3,n.h=n.r*n.ys});let b=[];for(let n=262;n<345;n+=4.2)for(let V=.25;V<1.35;V+=3.2/n)b.push({x:Math.cos(V)*n,z:Math.sin(V)*n,bt:.22+(n-262)/83*.22+(V-.25)*.12});return{units:"m, colony space (+y up); bt = build start in city progress 0..1",rings:l.map(n=>({r:n,bt:.02+n/236*.55})),avenues:[...Array(o)].map((n,V)=>({a:V*Math.PI/4,r0:20,r1:250,bt:0})),domes:S,tubes:w,habs:p.filter(n=>!n.skip),fabs:C,solar:{r0:262,r1:345,a0:.25,a1:1.35,panel:[3,2.2],tilt:.5,cells:b},oldPad:{x:Math.cos(-.55)*300,z:Math.sin(-.55)*300,r:26},ships:u.land.map(([n,V])=>({x:n,z:V})),buildPad:{x:u.build[0],z:u.build[1],r:16.5,tower:{x:u.build[0]-12,z:u.build[1]+10}}}}var mo=`
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
`,pn=`
float habLit(float h, float j){ float t0 = 0.03 + 0.6 * fract(h * 13.7 + j); return smoothstep(t0, t0 + 0.04, night) * (0.55 + 0.45 * night); }
`,oa=pn,Co=`#include <lights_fragment_maps>
  iblIrradiance *= 1. - 0.9 * night; radiance *= 1. - 0.9 * night;`;function gn({THREE:e,renderer:t,sunDir:r,night:l=0}){let o=(r?r.clone():new e.Vector3(-.95,.24,-.21)).normalize(),u=new e.Scene,S=new e.SphereGeometry(10,64,32),w=new e.ShaderMaterial({side:e.BackSide,depthWrite:!1,uniforms:{sunDir:{value:o},night:{value:l}},vertexShader:"varying vec3 vD; void main(){ vD = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }",fragmentShader:`uniform vec3 sunDir; uniform float night; varying vec3 vD;
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
    }`});u.add(new e.Mesh(S,w));let M=new e.PMREMGenerator(t),p=M.fromScene(u,0,.1,100);return M.dispose(),S.dispose(),w.dispose(),p.texture.userData.renderTarget=p,p.texture}function xn({THREE:e,renderer:t,envMap:r=null,frameDetail:l="high"}={}){let o=e.Vector3,u={value:0},S={},w=[];function M(s){let f=[],T=[],L={};for(let N in s)L[N]=[];let v=new o,ae=new o,h=new o,W=(N,Q,De,I)=>{f.push(N.x,N.y,N.z),T.push(Q.x,Q.y,Q.z);for(let F in s){let U=s[F],c=De[F];if(typeof c=="function"&&(c=c(N,Q)),c===void 0&&(c=U===1?0:[0,0,0]),U===1)L[F].push(Array.isArray(c)?c[I]:c);else{let $=Array.isArray(c[0])?c[I]:c;for(let Ae=0;Ae<U;Ae++)L[F].push($[Ae]||0)}}},Me={tri(N,Q,De,I={},F=null,U=null){v.subVectors(Q,N),ae.subVectors(De,N),h.crossVectors(v,ae).normalize();let c=[0,1,2];F&&h.dot(F)<0&&(c=[0,2,1],h.negate());let $=[N,Q,De];for(let Ae of c)W($[Ae],U?U[Ae]:h,I,Ae)},quad(N,Q,De,I,F={},U=null){Me.tri(N,Q,De,F,U),Me.tri(N,De,I,F,U)},box(N,Q,De,I,F,U,c={},$=!0){let Ae=new e.BoxGeometry(I,F,U);Ae.translate(N,Q,De),Me.geo(Ae,c,$?He=>He.y<-.5:null),Ae.dispose()},geo(N,Q={},De=null,I=!1){let F=N.index?N.toNonIndexed():N,U=F.attributes.position,c=F.attributes.normal,$=new o,Ae=new o,He=new o,Ot=new o,St=new o,At=new o;for(let mt=0;mt<U.count;mt+=3)$.fromBufferAttribute(U,mt),Ae.fromBufferAttribute(U,mt+1),He.fromBufferAttribute(U,mt+2),Ot.fromBufferAttribute(c,mt),St.fromBufferAttribute(c,mt+1),At.fromBufferAttribute(c,mt+2),!(De&&De(Ot.clone().add(St).add(At).normalize()))&&(I?(v.subVectors(Ae,$),ae.subVectors(He,$),h.crossVectors(v,ae).normalize(),W($,h,Q,0),W(Ae,h,Q,1),W(He,h,Q,2)):(W($,Ot,Q,0),W(Ae,St,Q,1),W(He,At,Q,2)));F!==N&&F.dispose()},build(){let N=new e.BufferGeometry;N.setAttribute("position",new e.Float32BufferAttribute(f,3)),N.setAttribute("normal",new e.Float32BufferAttribute(T,3));for(let Q in s)N.setAttribute(Q,new e.Float32BufferAttribute(L[Q],s[Q]));return N.computeBoundingSphere(),N.computeBoundingBox(),N}};return Me}let p=s=>(s.index?s.index.count:s.attributes.position.count)/3,C=(s=>()=>(s=s*16807%2147483647)/2147483647)(11);function y(s){let f=new e.IcosahedronGeometry(1,s-1),T=(1+Math.sqrt(5))/2;f.applyQuaternion(new e.Quaternion().setFromUnitVectors(new o(-1,T,0).normalize(),new o(0,1,0)));let L=f.attributes.position,v=[],ae=new Map,h=[],W=new Map,Me=N=>{let Q=`${Math.round(N.x*1e4)},${Math.round(N.y*1e4)},${Math.round(N.z*1e4)}`,De=ae.get(Q);return De===void 0&&(De=h.length,h.push(N.clone()),ae.set(Q,De)),De};for(let N=0;N<L.count;N+=3){let Q=[0,1,2].map(F=>{let U=new o().fromBufferAttribute(L,N+F);return Math.abs(U.y)<1e-4&&(U.y=0),U}),De=Q[0].clone().add(Q[1]).add(Q[2]).divideScalar(3);if(De.y<=1e-4)continue;new o().subVectors(Q[1],Q[0]).cross(new o().subVectors(Q[2],Q[0])).dot(De)<0&&Q.reverse();let I=Q.map(Me);v.push({v:Q,c:De});for(let F=0;F<3;F++){let U=I[F],c=I[(F+1)%3],$=U<c?U+"_"+c:c+"_"+U;W.has($)||W.set($,[U,c])}}return f.dispose(),{faces:v,verts:h,edges:[...W.values()]}}function A(s,f,T,L,v,ae,h,W,Me=!1){let N=f.clone().multiplyScalar(L),Q=T.clone().multiplyScalar(L),De=Q.clone().sub(N).normalize(),I=N.clone().add(Q).normalize(),F=new o().crossVectors(De,I).normalize(),U=new o().crossVectors(F,De).normalize(),c=Me?[U.clone().multiplyScalar(-h).addScaledVector(F,v),U.clone().multiplyScalar(ae),U.clone().multiplyScalar(-h).addScaledVector(F,-v)]:[U.clone().multiplyScalar(-h).addScaledVector(F,v),U.clone().multiplyScalar(ae).addScaledVector(F,v*.5),U.clone().multiplyScalar(ae).addScaledVector(F,-v*.5),U.clone().multiplyScalar(-h).addScaledVector(F,-v)];for(let $=0;$<c.length-1;$++)s.quad(N.clone().add(c[$]),Q.clone().add(c[$]),Q.clone().add(c[$+1]),N.clone().add(c[$+1]),W,c[$].clone().add(c[$+1]))}function b(s,f,T,L,v,ae,h=4){let W=f.clone().normalize(),Me=W.clone().multiplyScalar(T-.004),N=new o(0,1,0);Math.abs(W.y)>.9&&N.set(1,0,0),N.cross(W).normalize();let Q=W.clone().cross(N),De=W.clone().multiplyScalar(T+v),I=C()*6.28,F=[...Array(h)].map((U,c)=>{let $=I+c/h*Math.PI*2;return Me.clone().addScaledVector(N,Math.cos($)*L).addScaledVector(Q,Math.sin($)*L)});for(let U=0;U<h;U++)s.tri(F[U],F[(U+1)%h],De,ae,W)}let n=(s,f)=>s.clone().add(new o(C()-.5,C()-.5,C()-.5).multiplyScalar(f)).normalize(),V=[[1,0,0],[0,1,0],[0,0,1]];function P(s,f,T){return s.onBeforeCompile=L=>{L.uniforms.night=u,T(L),L.fragmentShader=L.fragmentShader.replace("#include <normal_fragment_maps>",`#include <normal_fragment_maps>
        { vec3 dnx = dFdx(normal), dny = dFdy(normal); float k = min(.18, 2. * max(dot(dnx, dnx), dot(dny, dny))); roughnessFactor = sqrt(roughnessFactor * roughnessFactor + k); }`)},s.customProgramCacheKey=()=>"hab-"+f,w.push(s),s}function G(s,f,T){let L=new e.MeshDepthMaterial({depthPacking:e.RGBADepthPacking});return L.onBeforeCompile=v=>{v.vertexShader=f+mo+v.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
`+T)},L.customProgramCacheKey=()=>"habdepth-"+s,L}let K=y(4),H=.995,ee=.9,se=.985,ye=s=>[1-s.y,Math.min(1,Math.abs(s.y-.36)*2.6),C()],le=M({sel:3,bary:3,kind:1}),Se=M({sel:3,bary:3,kind:1}),Ge=M({sel:3,bary:3,kind:1}),re=M({sel:3,bary:3,kind:1}),D=s=>s.clone().normalize(),ge=(s,f)=>s.clone().addScaledVector(f,1).normalize(),E=[[.5,.5,0],[0,.5,.5],[.5,0,.5]];K.faces.forEach(s=>{let f=s.v.map(h=>s.c.clone().lerp(h,ee).multiplyScalar(H)),T=ye(s.c),L=n(s.c.clone().normalize(),.03).sub(s.c.clone().normalize());le.tri(f[0],f[1],f[2],{sel:T,bary:V,kind:0},s.c,f.map(D)),Se.tri(f[0],f[1],f[2],{sel:T,bary:V,kind:0},s.c,f.map(h=>ge(D(h),L)));let v=[[0,1],[1,2],[0,2]].map(([h,W])=>f[h].clone().add(f[W]).normalize().multiplyScalar(H*.997)),ae=[[f[0],v[0],v[2],[V[0],E[0],E[2]]],[v[0],f[1],v[1],[E[0],V[1],E[1]]],[v[2],v[1],f[2],[E[2],E[1],V[2]]],[v[0],v[1],v[2],[E[0],E[1],E[2]]]];for(let[h,W,Me,N]of ae)Ge.tri(h,W,Me,{sel:T,bary:N,kind:0},s.c,[h,W,Me].map(D)),re.tri(h,W,Me,{sel:T,bary:N,kind:0},s.c,[h,W,Me].map(Q=>ge(D(Q),L)))});for(let s of[Ge,le]){let f=[[.2,0]];for(let h=0;h<=6;h++){let W=h/6*Math.PI;f.push([.2*Math.cos(W),.2+.2*Math.sin(W)])}f.push([-.2,0]);let T=.7,L=1.2,v=(h,[W,Me])=>new o(h,Me,W);for(let h=0;h<f.length-1;h++){let W=[(f[h][0]+f[h+1][0])/2,(f[h][1]+f[h+1][1])/2-.15];s.quad(v(T,f[h]),v(L,f[h]),v(L,f[h+1]),v(T,f[h+1]),{kind:1,bary:[.3,.3,.3]},new o(0,W[1],W[0]))}let ae=new o(L,.17,0);for(let h=0;h<f.length;h++)s.tri(ae,v(L,f[h]),v(L,f[(h+1)%f.length]),{kind:1,bary:[.3,.3,.3]},new o(1,0,0));s.quad(new o(L+.006,.02,.11),new o(L+.006,.02,-.11),new o(L+.006,.31,-.11),new o(L+.006,.31,.11),{kind:2,bary:[.3,.3,.3]},new o(1,0,0)),s.quad(new o(L+.01,.2,.05),new o(L+.01,.2,-.05),new o(L+.01,.27,-.05),new o(L+.01,.27,.05),{kind:3,bary:[.3,.3,.3]},new o(1,0,0)),s.quad(new o(.98,.18,.203),new o(1.06,.18,.203),new o(1.06,.26,.203),new o(.98,.26,.203),{kind:3,bary:[.3,.3,.3]},new o(0,0,1))}let J=le.build(),me=Se.build(),he=Ge.build(),be=re.build(),ue=M({kind:1}),te=M({kind:1}),ie=l==="low";K.edges.forEach(([s,f])=>A(ue,K.verts[s],K.verts[f],se,.017,.019,.014,{kind:0},ie)),K.verts.forEach(s=>b(ue,s,se,.03,.03,{kind:1},ie?3:4));for(let s of[te,ue]){let f=new e.CylinderGeometry(.075,.085,.05,8,1,!1);f.translate(0,se+.02,0),s.geo(f,{kind:4},ae=>ae.y<-.5,!0),f.dispose();let T=.3,L=Math.sqrt(1-T*T)*se;s.box(T,L+.17,.05,.016,.36,.016,{kind:2});let v=new e.ConeGeometry(.09,.04,9,1,!0);v.rotateX(Math.PI),v.rotateZ(-.9),v.translate(T+.03,L+.3,.05),s.geo(v,{kind:2},null,!0),v.dispose(),s.box(T,L+.36,.05,.03,.03,.03,{kind:3}),s.box(1.2/1.015+.012,.345/1.015,0,.03,.025,.06,{kind:5})}let fe=ue.build(),Oe=te.build(),Ee=`#ifdef HAB_FAR
      { float re = min(min(vBary.x, vBary.y), vBary.z), fw = max(fwidth(re), 1e-4), w0 = 0.046;
        float rib = mix(1. - smoothstep(w0 - .5 * fw, w0 + .5 * fw, re), min(1., 5.4 * w0), smoothstep(.6 * w0, 2.5 * w0, fw));
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(.55, .5, .44), rib * .85); habRib = rib; }
      #endif`,Ye=s=>P(new e.MeshStandardMaterial({color:16777215,roughness:.55,metalness:.08,envMap:r,envMapIntensity:.45}),s?"shell-far":"shell",f=>{f.vertexShader=`attribute vec3 sel; attribute vec3 bary; attribute float kind; varying vec3 vSel; varying vec3 vBary; varying float vKind; varying float vIh; varying float vY; varying float vFrac;
`+mo+f.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
      float ih = habInstHash(), frac; vec3 hw; habType(ih, frac, hw);
      transformed *= kind < 0.5 ? step(frac, dot(hw, sel)) : habHasVest(ih);
      vSel = sel; vBary = bary; vKind = kind; vIh = ih; vY = position.y; vFrac = frac;`),f.fragmentShader=(s?`#define HAB_FAR
`:"")+`uniform float night; varying vec3 vSel; varying vec3 vBary; varying float vKind; varying float vIh; varying float vY; varying float vFrac; float habRib = 0.;
`+oa+f.fragmentShader.replace("#include <color_fragment>",`#include <color_fragment>
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
      ${Ee}
      }`).replace("#include <roughnessmap_fragment>",`#include <roughnessmap_fragment>
      roughnessFactor = mix(roughnessFactor + 0.1 * (pr - 0.5), 0.22, max(solar, win));`).replace("#include <metalnessmap_fragment>",`#include <metalnessmap_fragment>
      metalnessFactor = mix(metalnessFactor, 0.55, max(solar, win));`).replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>
      totalEmissiveRadiance += vec3(1., 0.62, 0.3) * win * (0.15 + 2.6 * habLit(vIh, 0.));`).replace("#include <lights_fragment_maps>",Co)}),ne=Ye(!1),Qe=Ye(!0),Ve=s=>P(new e.MeshStandardMaterial({color:16777215,roughness:.05,metalness:.92,envMap:r,envMapIntensity:1.5}),s?"glass-far":"glass",f=>{f.vertexShader=`attribute vec3 sel; attribute vec3 bary; attribute float kind; varying vec3 vSel; varying vec3 vBary; varying float vIh; varying float vY;
`+mo+f.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
      float ih = habInstHash(), frac; vec3 hw; habType(ih, frac, hw);
      transformed *= 1. - step(frac, dot(hw, sel));
      vSel = sel; vBary = bary; vIh = ih; vY = position.y;`),f.fragmentShader=(s?`#define HAB_FAR
`:"")+`uniform float night; varying vec3 vSel; varying vec3 vBary; varying float vIh; varying float vY; float habRib = 0.;
`+oa+f.fragmentShader.replace("#include <color_fragment>",`#include <color_fragment>
      float pr = fract(vSel.z * 23.7 + vIh * 3.3), edge = min(min(vBary.x, vBary.y), vBary.z), mull = 1. - smoothstep(0.03, 0.07, edge);
      diffuseColor.rgb = mix(mix(vec3(0.30, 0.34, 0.39), vec3(0.42, 0.33, 0.24), step(0.62, pr)), vec3(0.2, 0.19, 0.18), mull);
      ${Ee}
      mull = max(mull, habRib);`).replace("#include <roughnessmap_fragment>",`#include <roughnessmap_fragment>
      roughnessFactor = mix(roughnessFactor + 0.05 * pr, 0.55, mull);
      roughnessFactor = max(roughnessFactor, 0.05 + 0.25 * smoothstep(40., 300., length(vViewPosition))); // distance floor: far facets stop sparkling`).replace("#include <metalnessmap_fragment>",`#include <metalnessmap_fragment>
      metalnessFactor = mix(metalnessFactor, 0.4, mull);`).replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>
      float on = 0.45 + 0.55 * step(0.3, fract(vIh * 11.3)), lit = 0.35 + 0.65 * step(0.38, fract(pr * 5.7 + vIh));
      totalEmissiveRadiance += vec3(1., 0.56, 0.24) * habLit(vIh, floor(pr * 4.) * 0.17) * on * lit * (1. - mull) * (0.7 + 0.9 * (1. - vY)) * 1.7;`).replace("#include <lights_fragment_maps>",Co)}),Te=Ve(!1),Ce=Ve(!0);Te.userData.night=u;let q=P(new e.MeshStandardMaterial({color:12761517,roughness:.38,metalness:.55,envMap:r,envMapIntensity:.7}),"frame",s=>{s.vertexShader=`attribute float kind; varying float vKind; varying float vHs;
`+mo+s.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
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
      totalEmissiveRadiance += (vKind < 4. ? vec3(1., 0.15, 0.08) : vec3(1., 0.8, 0.55)) * lamp * (0.4 + 4. * night);`).replace("#include <lights_fragment_maps>",Co)}),d=G("shell",`attribute float kind;
`,"transformed *= kind < 0.5 ? 1. : habHasVest(habInstHash());"),O=G("frame",`attribute float kind;
`,"float ih0 = habInstHash(); transformed *= kind > 1.5 && kind < 3.5 ? habHasAnt(ih0) : (kind > 4.5 ? habHasVest(ih0) : 1.);"),B=s=>{let f=[[0,.5,0],[.9,.5,0],[1,.5,1],[1.035,.47,1],[1.08,.42,2],[1.16,.29,2],[1.24,.13,2],[1.31,.03,2],[1.37,0,3]],T=[],L=[],v=[],ae=(c,$,Ae)=>{let He=Math.sin(c*12.9898+$*78.233+Ae*37.719)*43758.5453;return He-Math.floor(He)};for(let c=0;c<f.length;c++)for(let $=0;$<=s;$++){let Ae=$%s,He=Ae/s*Math.PI*2,[Ot,St,At]=f[c],mt=At===2?ae(Ae,c,1)-.5+.6*(Math.sin(He*3+1.3)*.5):0,g=Ot+mt*.05,X=Math.max(0,St+(At===2?(ae(Ae,c,2)-.5)*.07+mt*.03:0));T.push(Math.cos(He)*g,X,Math.sin(He)*g);let ve=ae(Ae,c,3),Be=At===0?[.5+ve*.03,.42+ve*.03,.35+ve*.02]:At===1?[.36,.32,.28]:At===2?[.4+ve*.1,.18+ve*.05,.085+ve*.025]:[.38,.17,.08];L.push(...Be)}for(let c=0;c<f.length-1;c++)for(let $=0;$<s;$++){let Ae=c*(s+1)+$,He=Ae+s+1;v.push(Ae,Ae+1,He,Ae+1,He+1,He)}let h=new e.BufferGeometry;h.setAttribute("position",new e.Float32BufferAttribute(T,3)),h.setAttribute("color",new e.Float32BufferAttribute(L,3)),h.setIndex(v),h.computeVertexNormals();let W=h.toNonIndexed(),Me=M({color:3,kind:1}),N=W.attributes.color,Q=W.attributes.position,De=W.attributes.normal,I=new o,F=new o,U=new o;for(let c=0;c<Q.count;c+=3)I.fromBufferAttribute(Q,c),F.fromBufferAttribute(Q,c+1),U.fromBufferAttribute(Q,c+2),!(I.distanceTo(F)<1e-6||F.distanceTo(U)<1e-6||I.distanceTo(U)<1e-6)&&Me.tri(I,F,U,{color:[0,1,2].map($=>[N.getX(c+$),N.getY(c+$),N.getZ(c+$)]),kind:0},null,[0,1,2].map($=>new o().fromBufferAttribute(De,c+$)));h.dispose(),W.dispose();for(let c=0;c<6;c++){let $=c/6*Math.PI*2+.26;Me.box(Math.cos($)*1,.565,Math.sin($)*1,.03,.13,.03,{color:[.25,.24,.23],kind:1})}return Me.build()},R=B(30),de=B(14),Ue=P(new e.MeshStandardMaterial({color:16777215,vertexColors:!0,roughness:.95,metalness:0}),"pad",s=>{s.vertexShader=`attribute float kind; varying float vKind; varying float vPY;
`+s.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
      vKind = kind; vPY = position.y;`),s.fragmentShader=`uniform float night; varying float vKind; varying float vPY;
`+s.fragmentShader.replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>
      totalEmissiveRadiance += vec3(1., 0.72, 0.42) * step(0.5, vKind) * step(0.6, vPY) * (0.3 + 5. * night);`)}),Ke=(()=>{let f=[],T=[],L=[],v=[[.95,.62],[1.3,.38],[1.75,0]];v.forEach(([h,W])=>{for(let Me=0;Me<=30;Me++){let N=Me/30*Math.PI*2;f.push(Math.cos(N)*h,.025,Math.sin(N)*h),T.push(W)}});for(let h=0;h<v.length-1;h++)for(let W=0;W<30;W++){let Me=h*31+W,N=Me+30+1;L.push(Me,Me+1,N,Me+1,N+1,N)}let ae=new e.BufferGeometry;return ae.setAttribute("position",new e.Float32BufferAttribute(f,3)),ae.setAttribute("alpha",new e.Float32BufferAttribute(T,1)),ae.setIndex(L),ae.computeBoundingSphere(),ae})(),Re=new e.ShaderMaterial({transparent:!0,depthWrite:!1,polygonOffset:!0,polygonOffsetFactor:-2,polygonOffsetUnits:-2,uniforms:{strength:{value:.75}},vertexShader:`attribute float alpha; varying float vA; void main(){ vA = alpha;
      #ifdef USE_INSTANCING
        vec4 p = modelMatrix * instanceMatrix * vec4(position, 1.);
      #else
        vec4 p = modelMatrix * vec4(position, 1.);
      #endif
      gl_Position = projectionMatrix * viewMatrix * p; }`,fragmentShader:"uniform float strength; varying float vA; void main(){ gl_FragColor = vec4(0.06, 0.025, 0.012, vA * vA * strength); }"}),Ne=(()=>{let s=M({kind:1,variant:1});s.box(0,.03,0,1.04,.06,1.06,{kind:6,variant:0});let f=.42,T=12,L=[...Array(T+1)].map((h,W)=>{let Me=W/T*Math.PI;return[.5*Math.cos(Me),f+.58*Math.sin(Me)]}),v=(h,W,Me)=>new o(h,Me,W);for(let h of[-1,1])s.quad(v(-.5,.5*h,.06),v(.5,.5*h,.06),v(.5,.5*h,f),v(-.5,.5*h,f),{kind:0,variant:1},new o(0,0,h));for(let h=0;h<T;h++){let[W,Me]=L[h],[N,Q]=L[h+1],De=new o(0,(Me+Q)/2-f,(W+N)/2);s.quad(v(-.5,W,Me),v(.5,W,Me),v(.5,N,Q),v(-.5,N,Q),{kind:0,variant:1},De)}for(let h of[-1,1]){s.quad(v(.5*h,-.5,.06),v(.5*h,.5,.06),v(.5*h,.5,f),v(.5*h,-.5,f),{kind:0,variant:1},new o(h,0,0));for(let W=0;W<T;W++)s.tri(v(.5*h,0,f),v(.5*h,L[W][0],L[W][1]),v(.5*h,L[W+1][0],L[W+1][1]),{kind:0,variant:1},new o(h,0,0))}s.quad(v(.506,-.32,.06),v(.506,.32,.06),v(.506,.32,.66),v(.506,-.32,.66),{kind:1,variant:1},new o(1,0,0)),s.box(.51,.69,0,.012,.03,.7,{kind:3,variant:1});for(let h of[-1,1])s.quad(v(-.44,.506*h,.24),v(.44,.506*h,.24),v(.44,.506*h,.34),v(-.44,.506*h,.34),{kind:2,variant:1},new o(0,0,h));s.quad(v(.2,.507,.06),v(.3,.507,.06),v(.3,.507,.22),v(.2,.507,.22),{kind:1,variant:1},new o(0,0,1)),s.box(-.22,1.02,0,.12,.06,.16,{kind:3,variant:1}),s.box(.12,1.015,0,.08,.05,.1,{kind:3,variant:1}),s.box(-.38,.98,.12,.04,.09,.04,{kind:3,variant:1}),s.box(.515,.74,0,.012,.025,.06,{kind:4,variant:1}),s.box(0,.43,0,1,.74,1,{kind:0,variant:2});for(let[h,W,Me,N]of[[0,.49,1,.025],[0,-.49,1,.025],[.49,0,.025,1],[-.49,0,.025,1]])s.box(h,.83,W,Me,.06,N,{kind:0,variant:2});s.box(-.25,.86,.1,.18,.12,.3,{kind:3,variant:2}),s.box(.05,.84,-.18,.1,.08,.12,{kind:3,variant:2});let ae=new e.PlaneGeometry(.34,.5);ae.rotateX(-Math.PI/2),ae.rotateZ(.25),ae.translate(.28,.86,.05),s.geo(ae,{kind:5,variant:2},null,!0),ae.dispose(),s.quad(v(.504,-.22,.06),v(.504,.22,.06),v(.504,.22,.56),v(.504,-.22,.56),{kind:1,variant:2},new o(1,0,0));for(let h of[-1,1])s.quad(v(-.45,.504*h,.46),v(.45,.504*h,.46),v(.45,.504*h,.6),v(-.45,.504*h,.6),{kind:2,variant:2},new o(0,0,h));return s.quad(v(-.504,-.4,.46),v(-.504,.4,.46),v(-.504,.4,.6),v(-.504,-.4,.6),{kind:2,variant:2},new o(-1,0,0)),s.box(.512,.6,0,.012,.025,.06,{kind:4,variant:2}),s.build()})(),qe=`attribute float kind; attribute float variant;
`,yt="float shv = fract(habInstHash() * 5.7) < 0.55 ? 1. : 2.; transformed *= (variant < 0.5 || abs(variant - shv) < 0.5) ? 1. : 0.;",Gt=P(new e.MeshStandardMaterial({color:16777215,roughness:.62,metalness:.18,envMap:r,envMapIntensity:.5}),"shed",s=>{s.vertexShader=qe+`varying float vKind; varying vec3 vLP; varying vec3 vSc; varying vec3 vN0;
`+mo+s.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
      ${yt}
      vKind = kind; vLP = position; vN0 = normal;
      #ifdef USE_INSTANCING
        vSc = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz));
      #else
        vSc = vec3(length(modelMatrix[0].xyz), length(modelMatrix[1].xyz), length(modelMatrix[2].xyz));
      #endif`),s.fragmentShader=`uniform float night; varying float vKind; varying vec3 vLP; varying vec3 vSc; varying vec3 vN0;
`+oa+s.fragmentShader.replace("#include <color_fragment>",`#include <color_fragment>
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
      totalEmissiveRadiance += vec3(1., 0.66, 0.36) * win * habLit(fract(vSc.x * 0.37 + vSc.y * 1.31), floor(m.x / 1.4) * 0.11) * (0.4 + 1.8 * bay) + vec3(1., 0.85, 0.6) * lamp * (0.4 + 4. * night);`).replace("#include <lights_fragment_maps>",Co)}),Mt=G("shed",qe,yt);function _e(s,{remap:f=0,baryMull:T=!0,color:L=9082530}={}){return P(new e.MeshStandardMaterial({color:L,roughness:.035,metalness:.9,envMap:r,envMapIntensity:1.4,transparent:!0,depthWrite:!1,emissive:16777215,emissiveIntensity:0}),s,v=>{v.vertexShader=(T?`attribute vec3 bary; varying vec3 vBary;
`:"")+`varying float vGY;
`+(`varying float vOh;
`+mo)+v.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
        ${T?"vBary = bary;":""} vGY = position.y; vOh = habInstHash();`),v.fragmentShader=(T?`varying vec3 vBary;
`:"")+`uniform float night; varying float vGY;
varying float vOh;
`+oa+v.fragmentShader.replace("#include <color_fragment>",`#include <color_fragment>
        float mull = ${T?"1. - smoothstep(0.035, 0.08, min(min(vBary.x, vBary.y), vBary.z))":"0."};
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.16, 0.15, 0.14), mull);`).replace("#include <roughnessmap_fragment>",`#include <roughnessmap_fragment>
        roughnessFactor = mix(roughnessFactor, 0.5, mull);`).replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>
        totalEmissiveRadiance = emissive * vec3(1., 0.6, 0.3) * (1. - mull);
        totalEmissiveRadiance += vec3(1., 0.58, 0.26) * habLit(vOh, 0.31) * 0.22 * (1. - mull) * (1.2 - vGY);`).replace("#include <lights_fragment_maps>",Co).replace("#include <opaque_fragment>",`
        // the sun glint on near-mirror glass overflows half float (inf), which bloom/DOF smear into a hard square: cap it
        outgoingLight = min(outgoingLight, vec3(12.));
        float fr = pow(1. - clamp(abs(dot(normalize(vViewPosition), normal)), 0., 1.), 2.2);
        float lum = dot(outgoingLight, vec3(0.3, 0.59, 0.11));
        diffuseColor.a = ${f?`clamp(opacity / ${f.toFixed(3)}, 0., 1.)`:"opacity"} * clamp(max(max(mix(0.5, 1., fr), lum * 1.4), mull), 0., 1.);
        #include <opaque_fragment>`)})}let Y=y(8),ze=(()=>{let s=M({kind:1});return Y.edges.forEach(([f,T])=>A(s,Y.verts[f],Y.verts[T],1,.0042,.006,.005,{kind:0})),Y.verts.forEach(f=>b(s,f,1,.009,.008,{kind:1},5)),s.build()})(),We=(()=>{let s=M({bary:3});return Y.faces.forEach(f=>{let T=f.v.map(ae=>f.c.clone().lerp(ae,.97).multiplyScalar(.994)),L=f.c.clone().normalize(),v=n(L,.02).sub(L);s.tri(T[0],T[1],T[2],{bary:V},f.c,T.map(ae=>ae.clone().normalize().add(v).normalize()))}),s.build()})(),$e=new e.SphereGeometry(.975,28,10,0,Math.PI*2,0,Math.PI/2),rt=(()=>{let s=M({color:3,kind:1}),f=(L,v,ae=!0)=>{s.geo(L,v,h=>h.y<-.5,ae),L.dispose()};{let L=new e.CircleGeometry(.985,40);L.rotateX(-Math.PI/2),L.translate(0,.004,0),f(L,{color:[.5,.43,.36]})}let T=[[.62,.05],[.48,.1],[.34,.15]];T.forEach(([L,v])=>{let ae=new e.CylinderGeometry(L,L*1.02,v,28);ae.translate(0,v/2,0),f(ae,{color:(h,W)=>W.y>.5?[.16+C()*.05,.22+C()*.05,.07]:[.62,.57,.5]})});{let L=new e.CylinderGeometry(.065,.085,.6,10);L.translate(0,.3,0),f(L,{color:[.82,.8,.76]})}for(let L of[.24,.36,.48]){let v=new e.CylinderGeometry(.083-L*.03,.083-L*.03,.035,10,1,!0);v.translate(0,L,0),f(v,{color:[.05,.05,.06],kind:1})}for(let L=0;L<7;L++){let v=L/7*Math.PI*2+.3,ae=.78+L%2*.06,h=.08+L%3*.05,W=Math.cos(v)*ae,Me=Math.sin(v)*ae,N=new e.BoxGeometry(.11,h,.09);N.rotateY(-v),N.translate(W,h/2,Me),f(N,{color:[.84,.82,.78]});let Q=new e.BoxGeometry(.114,.02,.094);Q.rotateY(-v),Q.translate(W,h*.62,Me),f(Q,{color:[.05,.05,.06],kind:1})}for(let L=0;L<44;L++){let v=L%3,[ae,h]=T[v],W=(v===2?.12:T[v+1][0]+.03)+C()*(ae-(v===2?.16:T[v+1][0]+.06)),Me=C()*6.28,N=.018+C()*.016,Q=new e.IcosahedronGeometry(N,0);Q.scale(1,1.4,1),Q.translate(Math.cos(Me)*W,h+N*1.2,Math.sin(Me)*W);let De=C();s.geo(Q,{color:[.12+De*.08,.2+De*.08,.06]},null,!0),Q.dispose()}return s.build()})(),ut=(()=>{let s=M({color:3});{let f=new e.CylinderGeometry(1.03,1.03,.03,64,1,!0);f.translate(0,.015,0),s.geo(f,{color:[.4,.36,.31]}),f.dispose()}{let f=new e.RingGeometry(.99,1.03,64);f.rotateX(-Math.PI/2),f.translate(0,.03,0),s.geo(f,{color:[.48,.42,.35]}),f.dispose()}{let f=new e.CylinderGeometry(1.035,1.11,.026,64,1,!0);f.translate(0,.013,0),s.geo(f,{color:()=>[.42+C()*.06,.2+C()*.03,.09]}),f.dispose()}return s.build()})(),tt=P(new e.MeshStandardMaterial({color:14209220,roughness:.34,metalness:.6,envMap:r,envMapIntensity:.7}),"lattice",s=>{s.vertexShader=`attribute float kind; varying float vKind;
`+s.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
      vKind = kind;`),s.fragmentShader=`uniform float night; varying float vKind;
`+s.fragmentShader.replace("#include <color_fragment>",`#include <color_fragment>
      diffuseColor.rgb *= vKind > 0.5 ? 0.6 : 1.;`).replace("#include <lights_fragment_maps>",Co)}),Pt=P(new e.MeshStandardMaterial({color:16777215,vertexColors:!0,roughness:.85,metalness:.05}),"interior",s=>{s.vertexShader=`attribute float kind; varying float vKind;${` varying float vOh;
`+mo}
`+s.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
      vKind = kind; vOh = habInstHash();`),s.fragmentShader=`uniform float night; varying float vKind; varying float vOh;
`+oa+s.fragmentShader.replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>
      totalEmissiveRadiance += vec3(1., 0.66, 0.36) * step(0.5, vKind) * (0.2 + 3.2 * habLit(vOh, 0.31));`)}),Lt=new e.MeshStandardMaterial({color:16777215,vertexColors:!0,roughness:.95});w.push(Lt);function ot(){let s=new e.Group;s.name="bigDome";let f=new e.Mesh(ze,tt);f.name="lattice",f.castShadow=f.receiveShadow=!0,f.customDepthMaterial=new e.MeshDepthMaterial({depthPacking:e.RGBADepthPacking});let T=new e.Mesh(rt,Pt);T.name="interior",T.castShadow=T.receiveShadow=!0;let L=new e.Mesh(ut,Lt);L.name="base",L.receiveShadow=!0;let v=new e.Mesh(Ke,Re);v.name="skirt",v.scale.set(.9,1,.9),v.renderOrder=-1,f.add(T,L,v);let ae=_e("bigglass",{remap:.28}),h=new e.Mesh(We,ae);h.name="glass",h.receiveShadow=!0,h.castShadow=!0;let W=new e.MeshDepthMaterial({depthPacking:e.RGBADepthPacking,alphaHash:!0,opacity:0,side:e.DoubleSide});h.customDepthMaterial=W;let Me=0;Object.defineProperty(ae,"opacity",{get:()=>Me,set:De=>{Me=De,W.opacity=.45*Math.min(1,Math.max(0,De/.28))},configurable:!0}),ae.opacity=0;let N=new e.MeshBasicMaterial({color:16751184,transparent:!0,opacity:0,side:e.BackSide,blending:e.AdditiveBlending,depthWrite:!1});N.onBeforeCompile=De=>{De.uniforms.night=u,De.vertexShader=`varying float vGY; varying float vOh;
`+mo+De.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
vGY = position.y; vOh = habInstHash();`),De.fragmentShader=`uniform float night; varying float vGY; varying float vOh;
`+pn+De.fragmentShader.replace("#include <color_fragment>",`#include <color_fragment>
diffuseColor.rgb *= 2.6 * (0.35 + 1.1 * (1. - vGY)) * habLit(vOh, 0.31) / max(night, 0.02);`)},N.customProgramCacheKey=()=>"hab-bigglow";let Q=new e.Mesh($e,N);return Q.name="glow",s.add(f,h,Q),s}let It=16,kt=(()=>{let s=new e.CylinderGeometry(2.4,2.4,1,It,1,!0).rotateZ(Math.PI/2).translate(.5,0,0),f=s.toNonIndexed();return s.dispose(),f.computeVertexNormals(),f.computeBoundingSphere(),f})(),Tt=_e("tube",{baryMull:!1,color:8227478});Tt.emissive.setRGB(1.6,1.6,1.6);let Xe=(()=>{let s=M({kind:1}),f=16,T=.11/62,L=ae=>ae/It*Math.PI*2,v=(ae,h,W)=>new o(ae,h*Math.sin(W),h*Math.cos(W));for(let ae=0;ae<=f;ae++){let h=Math.min(1-T,Math.max(T,ae/f)),W=2.53,Me=2.41;for(let N=0;N<It;N++){let Q=L(N),De=L(N+1),I=(Q+De)/2,F=v(0,1,I);s.quad(v(h-T,W,Q),v(h+T,W,Q),v(h+T,W,De),v(h-T,W,De),{kind:0},F),s.quad(v(h-T,Me,Q),v(h+T,Me,Q),v(h+T,Me,De),v(h-T,Me,De),{kind:0},F.clone().negate());for(let U of[-1,1])s.quad(v(h+U*T,Me,Q),v(h+U*T,W,Q),v(h+U*T,W,De),v(h+U*T,Me,De),{kind:0},new o(U,0,0))}if(ae%2===0||ae===f)for(let N of[-1.1,1.1])s.box(h,-2.52,N,T*5,.16,.7,{kind:3})}s.box(.5,-1.8,0,1,.12,3.1,{kind:1});for(let ae of[-1.42,1.42])s.box(.5,-1.72,ae,1,.04,.08,{kind:2});for(let ae of[-2.1,2.1])s.box(.5,-1.05,ae,1,.08,.08,{kind:0});return s.build()})(),Bt=P(new e.MeshStandardMaterial({color:13814462,roughness:.4,metalness:.55,envMap:r,envMapIntensity:.7}),"rib",s=>{s.vertexShader=`attribute float kind; varying float vKind;
`+s.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
      vKind = kind;`),s.fragmentShader=`uniform float night; varying float vKind;
`+s.fragmentShader.replace("#include <color_fragment>",`#include <color_fragment>
      diffuseColor.rgb *= vKind > 0.5 && vKind < 1.5 ? vec3(0.55, 0.5, 0.45) : (vKind > 2.5 ? vec3(0.45, 0.4, 0.36) : vec3(1.));`).replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>
      totalEmissiveRadiance += vec3(1., 0.72, 0.45) * step(1.5, vKind) * (1. - step(2.5, vKind)) * (0.2 + 3. * night);`).replace("#include <lights_fragment_maps>",Co)});[J,me,he,be,fe,Oe,R,de,Ke,Ne,kt,Xe,ze,We,rt,ut].forEach(s=>s.computeBoundingSphere()),Object.assign(S,{habShell:p(J),habGlass:p(me),habFrame:p(fe),ringPad:p(R),skirt:p(Ke),shed:p(Ne),tube:p(kt),rib:p(Xe),bigDome:{lattice:p(ze),glass:p(We),glow:p($e),interior:p(rt),base:p(ut)}});function vt(s){[...w,Tt].forEach(f=>{"envMap"in f&&f!==Lt&&f!==Ue&&f!==Pt&&(f.envMap=s,f.needsUpdate=!0)})}return{night:u,tris:S,setEnv:vt,habShellGeo:J,habShellMat:ne,habShellDepthMat:d,habShellGeoHi:he,habShellMatFar:Qe,habGlassGeo:me,habGlassMat:Te,habGlassGeoHi:be,habGlassMatFar:Ce,habFrameGeo:fe,habFrameMat:q,habFrameDepthMat:O,habFrameGeoFar:Oe,ringPadGeo:R,ringPadGeoFar:de,ringPadMat:Ue,skirtGeo:Ke,skirtMat:Re,bigDome:ot,shedGeo:Ne,shedMat:Gt,shedDepthMat:Mt,tubeGeo:kt,tubeMat:Tt,ribGeo:Xe,ribMat:Bt}}var so={x:0,y:-6e3,z:0},ur=.1,Ht={land:[[55,-150],[15,-168]],build:[-25,-100]},bn=`
float h3(vec3 p){p=fract(p*0.3183099+.1);p*=17.0;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float n3(vec3 x){vec3 i=floor(x);vec3 f=fract(x);f=f*f*(3.0-2.0*f);
return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),
mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n3(p);p*=2.03;a*=.5;}return v;}`;function wn({THREE:e,renderer:t,scene:r,cam:l,planets:o,sunLight:u,ambient:S,hemi:w,files:M,HIGH:p,lateRockets:C,lodPath:y}){let A=new e.Vector3(so.x,so.y,so.z),b=M.dtmN||512,n=new e.Group;n.position.copy(A),n.visible=!1,r.add(n),u.castShadow=!0;{let be=u.shadow,ue=be.camera;be.mapSize.set(p?4096:2048,p?2048:1024),be.bias=-5e-4,be.normalBias=.35,ue.left=-390,ue.right=390,ue.near=60,ue.far=1300}r.fog=new e.Fog(0,1e8,1e9);let V=(()=>{let be=7;return()=>(be=be*16807%2147483647)/2147483647})(),P=new e.Vector3,G=0,K=null,H=null,ee=Promise.all([import("./rockets-NJ46RRYQ.js"),import("./foot-model-starship-KKNUMIYN.js"),import("./foot-model-kit-2C76GDRH.js")]).then(([be,ue,te])=>H={createRockets:be.createRockets,foot:{buildStarships:ue.buildStarships,mergeAll:te.mergeAll,steel:{STEEL_FLAT:ue.STEEL_FLAT,steelUniforms:ue.steelUniforms,steelShader:ue.steelShader}}}).catch(be=>console.warn("film rockets:",be)),se={tDtm:{value:null},tHi:{value:null},tCtx:{value:null},uOn:{value:new e.Vector3(0,0,0)},uHB0:{value:0},tMars:o.mars.material.uniforms.tMap},ye=o.air&&o.air.uniforms.dome||{uSun:{value:new e.Vector3(0,1,0)},uK:{value:1},uAmb:{value:1},uOrigin:{value:A.clone()}},le=[0,0,0],Se=500;{let be=(ue,te,ie)=>{let fe=new e.DataTexture(new Uint8Array([ue,te,ie,255]),1,1);return fe.needsUpdate=!0,fe};se.tDtm.value=be(128,0,0),se.tHi.value=be(128,128,128),se.tCtx.value=be(128,128,128)}function Ge(be){let ue=new e.WebGLRenderTarget(4,1,{depthBuffer:!1,minFilter:e.NearestFilter,magFilter:e.NearestFilter,generateMipmaps:!1}),te=new e.ShaderMaterial({uniforms:{tDtm:{value:be}},toneMapped:!1,depthTest:!1,depthWrite:!1,vertexShader:"void main(){ gl_Position=vec4(position.xy,0.,1.); }",fragmentShader:`uniform sampler2D tDtm; void main(){ float k=floor(gl_FragCoord.x); vec2 o=vec2(mod(k,2.),floor(k*.5));
      vec2 uv=(vec2(${b/2-.5})+o)/${b}.; gl_FragColor=texture2D(tDtm,vec2(uv.x*.5+.5,uv.y)); }`}),ie=new e.Mesh(new e.PlaneGeometry(2,2),te),fe=new e.Scene;ie.frustumCulled=!1,fe.add(ie);let Oe=new Uint8Array(16),Ee=t.getRenderTarget();t.setRenderTarget(ue),t.render(fe,l),t.readRenderTargetPixels(ue,0,0,4,1,Oe),t.setRenderTarget(Ee),ue.dispose(),te.dispose(),ie.geometry.dispose();let Ye=Qe=>(Oe[Qe*4]*256+Oe[Qe*4+1])/65535;return-2664.712+352.3924*(((Ye(0)+Ye(1))/2+(Ye(2)+Ye(3))/2)/2)}let re=null;function D(){if(re)return re;let be=new e.TextureLoader;be.setCrossOrigin("anonymous");let ue=t.capabilities.getMaxAnisotropy(),te=fe=>{try{t.initTexture(fe)}catch{}},ie=(fe,Oe,Ee)=>new Promise(Ye=>{if(!fe)return Ye();be.load(fe,ne=>{Ee(ne),te(ne),le[Oe]=performance.now(),Ye()},void 0,()=>Ye())});return re=Promise.all([ie(M.dtm,0,fe=>{fe.colorSpace=e.NoColorSpace,fe.magFilter=fe.minFilter=e.NearestFilter,fe.generateMipmaps=!1,fe.flipY=!0,se.tDtm.value=fe,se.uHB0.value=Ge(fe)}),ie(M.hiBump,1,fe=>{fe.colorSpace=e.NoColorSpace,fe.anisotropy=ue,se.tHi.value=fe}),ie(M.ctxBump,2,fe=>{fe.colorSpace=e.NoColorSpace,fe.anisotropy=ue,se.tCtx.value=fe})])}let ge=()=>{let be=performance.now(),ue=te=>te?gt(be-te,0,Se):0;se.uOn.value.set(ue(le[0]),ue(le[1]),ue(le[2]))};function*E(){D();let be=`
uniform sampler2D tDtm, tHi, tCtx, tMars; uniform vec3 uOn; uniform float uHB0; // uHB0 = hB(vec2(0.)), read back once after the DTM loads
// 16-bit heights live in R (hi byte) and G (lo byte); filter by hand so the bytes never blend across a carry
float dtmTap(vec2 uv, float side){ vec2 t=vec2(uv.x*.5+side*.5, uv.y); vec4 c=texture2D(tDtm,t); return (c.r*255.*256.+c.g*255.)/65535.; }
float dtmBil(vec2 uv, float side){ vec2 p=uv*${b}.-.5, f=fract(p), i=floor(p);
  float a=dtmTap((i+vec2(.5,.5))/${b}.,side), b=dtmTap((i+vec2(1.5,.5))/${b}.,side), c=dtmTap((i+vec2(.5,1.5))/${b}.,side), d=dtmTap((i+vec2(1.5,1.5))/${b}.,side);
  return mix(mix(a,b,f.x),mix(c,d,f.x),f.y); }
float hA(vec2 p){ return -2621.547+62.5074*dtmBil(vec2(p.x/1600.+.5,.5-p.y/1600.),0.); }   // HiRISE DTM, metres (areoid)
float hB(vec2 p){ return -2664.712+352.3924*dtmBil(vec2(p.x/12000.+.5,.5-p.y/12000.),1.); } // CTX DTM
float terrH(vec2 p){
  float b=hB(p), a=hA(p), wa=1.-smoothstep(560.,780.,max(abs(p.x),abs(p.y)));
  float h=mix(b,a,wa)-uHB0;
  float d=length(p);
  return uOn.x*h*smoothstep(330.,620.,d)            // the city's graded pad eases back into the real ground
    *(1.-smoothstep(JF0,JF1,d));                      // and the far band flattens onto the sky dome's ground (no step at the mesh edge)
}`,ue=`const float JF0=3300., JF1=4400.;
`;{let g=p?420:210,X=g+1,ve=9e3,Be=ve/g,xe=new Float32Array(X*X*3),Ze=new Uint32Array(g*g*6);for(let Pe=0,Le=0;Pe<X;Pe++){let ce=-ve/2+Pe*Be;for(let _=0;_<X;_++,Le+=3)xe[Le]=-ve/2+_*Be,xe[Le+2]=ce}for(let Pe=0,Le=0;Pe<g;Pe++)for(let ce=0;ce<g;ce++,Le+=6){let _=ce+X*Pe,Ct=_+X,Kt=Ct+1,Ie=_+1;Ze[Le]=_,Ze[Le+1]=Ct,Ze[Le+2]=Ie,Ze[Le+3]=Ct,Ze[Le+4]=Kt,Ze[Le+5]=Ie}let xt=new e.BufferGeometry;xt.setIndex(new e.BufferAttribute(Ze,1)),xt.setAttribute("position",new e.BufferAttribute(xe,3)),xt.boundingSphere=new e.Sphere(new e.Vector3,ve*.7072),xt.boundingBox=new e.Box3(new e.Vector3(-ve/2,0,-ve/2),new e.Vector3(ve/2,0,ve/2));let Xt=new e.MeshStandardMaterial({roughness:.95,metalness:0});Xt.customProgramCacheKey=()=>"jezeroTerrain",Xt.onBeforeCompile=Pe=>{Object.assign(Pe.uniforms,se),Object.assign(Pe.uniforms,{uJSun:ye.uSun,uJK:ye.uK,uJAmb:ye.uAmb,uJOrigin:ye.uOrigin}),Pe.vertexShader=ue+be+`
varying vec3 vTP; varying vec3 vTN;
`+Pe.vertexShader.replace("#include <beginnormal_vertex>",`vec3 objectNormal; { vec2 p=position.xz; float e=8.;
          objectNormal=normalize(vec3(-(terrH(p+vec2(e,0.))-terrH(p-vec2(e,0.)))/(2.*e),1.,-(terrH(p+vec2(0.,e))-terrH(p-vec2(0.,e)))/(2.*e))); vTN=objectNormal; }
        #ifdef USE_TANGENT
          vec3 objectTangent = vec3( tangent.xyz );
        #endif`).replace("#include <begin_vertex>",`#include <begin_vertex>
transformed.y+=terrH(position.xz)-dot(position.xz,position.xz)/(2.*3389500.); vTP=transformed;`),Pe.fragmentShader=ue+be+`
varying vec3 vTP; varying vec3 vTN;
uniform vec3 uJSun, uJOrigin; uniform float uJK, uJAmb;
`+bn+ar+`
      // greyscale orbital images -> height for shading only
      float bumpL(vec2 p){ float a=uOn.y*(1.-smoothstep(640.,790.,max(abs(p.x),abs(p.y)))), b=uOn.z*(1.-smoothstep(5000.,5900.,max(abs(p.x),abs(p.y))));
        float hb=texture2D(tCtx,vec2(p.x/12000.+.5,.5-p.y/12000.)).r, ha=texture2D(tHi,vec2(p.x/1600.+.5,.5-p.y/1600.)).r;
        return mix(.5,mix(hb,ha,a),max(a,b)); }
      // fbm with each octave faded to its mean once it nears a pixel (fw = base-octave cycles per pixel): no far shimmer
      float fbmBL(vec3 p, float fw){ float v=0.,a=.5; for(int i=0;i<5;i++){ float k=1.-smoothstep(.3,.6,fw); v+=a*(k>0.? mix(.5,n3(p),k) : .5); p*=2.03; fw*=2.03; a*=.5; } return v; }
      vec3 tA; float tR;
    `+Pe.fragmentShader.replace("#include <color_fragment>",`#include <color_fragment>
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
          normal=normalize(normal+(viewMatrix*vec4(-gx*k*.1,0.,-gz*k*.1,0.)).xyz); }`)};let oe=new e.Mesh(xt,Xt);oe.receiveShadow=!0,n.add(oe)}let te={sunDir:{value:new e.Vector3},night:{value:0}},ie=new e.Mesh(new e.SphereGeometry(7e3,48,24),new e.ShaderMaterial({side:e.BackSide,depthWrite:!1,fog:!1,uniforms:te,vertexShader:"varying vec3 vD; void main(){ vD=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }",fragmentShader:`uniform vec3 sunDir; uniform float night; varying vec3 vD; ${bn}
  void main(){ float e=clamp(vD.y,0.,1.), sd=max(dot(vD,sunDir),0.);
    vec3 dayC=mix(vec3(0.78,0.54,0.36),vec3(0.36,0.22,0.15),pow(e,0.6));
    vec3 duskC=mix(vec3(0.2,0.14,0.13),vec3(0.015,0.015,0.03),pow(e,0.45));
    vec3 c=mix(dayC,duskC,night)+vec3(0.3,0.5,0.9)*pow(sd,22.)*(0.2+night*0.55)+vec3(0.5,0.6,0.8)*pow(sd,160.)*0.6;
    c+=vec3(0.9)*step(0.9975,h3(floor(vD*500.)))*smoothstep(0.5,1.,night)*smoothstep(0.05,0.3,e);
    gl_FragColor=vec4(c,1.); }`}));n.add(ie),yield;let fe=[62,132,204],Oe=8,Ee=[[0,0,20,.02]],Ye=[];for(let g=0;g<4;g++){let X=Math.PI/8+g*Math.PI/2;Ee.push([Math.cos(X)*96,Math.sin(X)*96,15,.26+g*.08]),Ye.push(X)}let ne=(g,X)=>Math.abs(((g-X)%(Math.PI*2)+Math.PI*3)%(Math.PI*2)-Math.PI),Qe=[],Ve=[];for(let g=34;g<238;g+=14){let X=g*.11;for(;X<g*.11+Math.PI*2-.05;){let ve=Math.min(6.6,2.6+V()*3.2+5*Math.exp(-g/70)),Be=Math.cos(X)*g,xe=Math.sin(X)*g,Ze=[...Array(Oe)].some((oe,Pe)=>ne(X,Pe*Math.PI/4)*g<ve+4),xt=g<86&&Ye.some(oe=>ne(X,oe)*g<ve+3.5);if(!(Ze||xt||fe.some(oe=>Math.abs(g-oe)<ve+3.5)||Ee.some(([oe,Pe,Le])=>Math.hypot(Be-oe,xe-Pe)<Le+ve+3))&&V()>.1){let oe=.06+g/238*.58+V()*.08;g>175&&V()<.28?Ve.push({x:Be,z:xe,w:8+V()*4,d:5,h:2.5+V()*2.5,rot:X,bt:oe}):Qe.push({x:Be,z:xe,r:ve,ys:.72+V()*.35,rot:V()*6.28,bt:oe,seed:V()*50})}X+=(2*ve+2.6)/g}}let Te={night:{value:0}},Ce=gn({THREE:e,renderer:t});yield;let q=xn({THREE:e,renderer:t,envMap:Ce,frameDetail:"low"});yield,Qe.forEach(g=>g.col=new e.Color().setHSL(.08,.06+V()*.06,.72+V()*.16)),Ve.forEach(g=>g.col=new e.Color().setHSL(.07,.08,.55+V()*.15));let d=(g,X)=>g.bt-X.bt,O=[...Qe].sort(d),B=[...Ve].sort(d);p||O.forEach((g,X)=>g.skip=X%2===1),O.forEach(g=>{(Ht.land.some(([X,ve])=>Math.hypot(g.x-X,g.z-ve)<g.r+16)||Math.hypot(g.x-Ht.build[0],g.z-Ht.build[1])<g.r+30)&&(g.skip=!0)});let R=O.filter(g=>!g.skip),de=.028,Ue=y?y():[];R.forEach(g=>{let X=1/0;for(let ve of Ue)X=Math.min(X,Math.hypot(ve.x-g.x,ve.y,ve.z-g.z));g.near=!Ue.length||g.r/X>de});let Ke=(g,X)=>{let ve=Math.max(1,g.length),Be=(Ze,xt)=>{let Xt=new e.InstancedMesh(Ze,xt,ve);return Xt.count=0,Xt},xe={list:g,shell:Be(X?q.habShellGeoHi:q.habShellGeo,X?q.habShellMat:q.habShellMatFar),glass:Be(X?q.habGlassGeoHi:q.habGlassGeo,X?q.habGlassMat:q.habGlassMatFar),frame:Be(X?q.habFrameGeo:q.habFrameGeoFar,q.habFrameMat),pad:Be(X?q.ringPadGeo:q.ringPadGeoFar,q.ringPadMat)};return xe.shell.customDepthMaterial=q.habShellDepthMat,xe.glass.receiveShadow=xe.frame.receiveShadow=!0,xe.frame.castShadow=!1,xe.shell.castShadow=xe.shell.receiveShadow=xe.pad.castShadow=xe.pad.receiveShadow=!0,g.forEach((Ze,xt)=>xe.shell.setColorAt(xt,Ze.col)),xe},Re=[Ke(R.filter(g=>g.near),!0),Ke(R.filter(g=>!g.near),!1)],Ne=new e.InstancedMesh(q.skirtGeo,q.skirtMat,R.length),qe=new e.InstancedMesh(q.shedGeo,q.shedMat,Ve.length);qe.customDepthMaterial=q.shedDepthMat,B.forEach((g,X)=>qe.setColorAt(X,g.col));let yt=g=>new e.Sphere(new e.Vector3(0,10,0),g),Gt=Re.flatMap(g=>[g.shell,g.glass,g.frame,g.pad]);[...Gt,Ne,qe].forEach(g=>g.boundingSphere=yt(270)),yield,n.add(...Gt,Ne,qe),qe.castShadow=qe.receiveShadow=!0;let Mt=[],_e=[],Y=[];fe.forEach(g=>{let X=[];for(let ve=0;ve<=200;ve++){let Be=ve/200*Math.PI*2;if(X.push(new e.Vector3(Math.cos(Be)*g,.4,Math.sin(Be)*g)),ve%2===0)for(let xe of[-2.6,2.6])Mt.push(Math.cos(Be)*(g+xe),1.6,Math.sin(Be)*(g+xe)),_e.push(.04+g/236*.55+ve/200*.08)}Y.push([X,.02+g/236*.55])});for(let g=0;g<Oe;g++){let X=g*Math.PI/4,ve=[new e.Vector3(Math.cos(X)*20,.4,Math.sin(X)*20),new e.Vector3(Math.cos(X)*250,.4,Math.sin(X)*250)];Y.push([ve,0]);for(let Be=24;Be<250;Be+=4)for(let xe of[-3,3])Mt.push(Math.cos(X)*Be+Math.cos(X+1.5708)*xe,1.6,Math.sin(X)*Be+Math.sin(X+1.5708)*xe),_e.push(.02+Be/250*.62)}let ze=Y.map(([g,X])=>{let ve=new e.Line(new e.BufferGeometry().setFromPoints(g),new e.LineBasicMaterial({color:16756848,transparent:!0,opacity:0}));return ve.userData.bt=X,n.add(ve),ve}),We={g:{value:0},night:{value:0},t:{value:0}},$e=(g,X)=>new e.ShaderMaterial({transparent:!0,depthWrite:!1,blending:e.AdditiveBlending,uniforms:We,vertexShader:g,fragmentShader:X}),rt="varying vec3 vC; varying float vA; void main(){ float d=length(gl_PointCoord-.5); gl_FragColor=vec4(vC*vA*smoothstep(.5,.05,d)*2.4,1.); }";{let g=new e.BufferGeometry;g.setAttribute("position",new e.Float32BufferAttribute(Mt,3)),g.setAttribute("bt",new e.Float32BufferAttribute(_e,1)),n.add(new e.Points(g,$e("attribute float bt; uniform float g; uniform float night; varying vec3 vC; varying float vA; void main(){ vec4 mv=modelViewMatrix*vec4(position,1.); vC=vec3(1.,0.66,0.3); vA=smoothstep(bt,bt+0.025,g)*(0.15+0.85*night); gl_PointSize=clamp(520./-mv.z,1.2,6.); gl_Position=projectionMatrix*mv; }",rt)))}{let g=[],X=[];Qe.filter(Be=>Be.r>5).forEach(Be=>{let xe=V();Be.skip||(g.push(Be.x,Be.r*Be.ys+.6,Be.z),X.push(Be.bt+.16,xe))});let ve=new e.BufferGeometry;ve.setAttribute("position",new e.Float32BufferAttribute(g,3)),ve.setAttribute("bs",new e.Float32BufferAttribute(X,2)),n.add(new e.Points(ve,$e("attribute vec2 bs; uniform float g; uniform float t; uniform float night; varying vec3 vC; varying float vA; void main(){ vec4 mv=modelViewMatrix*vec4(position,1.); vC=vec3(1.,0.12,0.06); vA=step(bs.x,g)*step(0.55,fract(t*0.7+bs.y))*(0.3+0.7*night)*1.6; gl_PointSize=clamp(900./-mv.z,2.,9.); gl_Position=projectionMatrix*mv; }",rt)))}let ut=new e.SphereGeometry(1,32,14,0,Math.PI*2,0,Math.PI/2),tt=Ee.map(([g,X,ve,Be])=>{let xe=q.bigDome();return xe.position.set(g,0,X),xe.scale.setScalar(ve),n.add(xe),{g:xe,lattice:xe.getObjectByName("lattice"),glass:xe.getObjectByName("glass"),glow:xe.getObjectByName("glow"),bt:Be}}),Pt=Ye.map((g,X)=>{let ve=new e.Group;ve.position.set(Math.cos(g)*19,2.6,Math.sin(g)*19),ve.rotation.y=-g;let Be=new e.Mesh(q.ribGeo,q.ribMat);return Be.castShadow=Be.receiveShadow=!0,ve.add(new e.Mesh(q.tubeGeo,q.tubeMat),Be),n.add(ve),{g:ve,bt:.12+X*.07}}),Lt=[];for(let g=262;g<345;g+=4.2)for(let X=.25;X<1.35;X+=3.2/g)Lt.push({x:Math.cos(X)*g,z:Math.sin(X)*g,bt:.22+(g-262)/83*.22+(X-.25)*.12});Lt.sort(d);let ot=new e.InstancedMesh(new e.BoxGeometry(3,.1,2.2).translate(0,1.2,0),new e.MeshStandardMaterial({color:1451068,metalness:.85,roughness:.22,emissive:330260}),Lt.length);ot.castShadow=ot.receiveShadow=!0,ot.boundingSphere=yt(360),n.add(ot),yield;let It=new e.MeshStandardMaterial({color:15770458,emissive:3807744,roughness:.6}),kt=Qe.filter(g=>g.r>4.2&&!g.skip),Tt=kt.filter((g,X)=>X%Math.max(1,Math.floor(kt.length/20))===3).slice(0,20).map((g,X)=>{let ve=new e.Group;ve.position.set(g.x+g.r+2,0,g.z+2);let Be=Math.max(22,g.r*g.ys+16),xe=new e.Mesh(new e.BoxGeometry(1,Be,1).translate(0,Be/2,0),It),Ze=new e.Group;return Ze.position.y=Be,Ze.add(new e.Mesh(new e.BoxGeometry(30,.8,.8).translate(8,0,0),It),new e.Mesh(new e.BoxGeometry(3,2.2,2).translate(-6,-.8,0),It),new e.Mesh(new e.BoxGeometry(.08,10,.08).translate(18,-5,0),It)),ve.add(xe,Ze),ve.traverse(xt=>{xt.isMesh&&(xt.castShadow=!0)}),n.add(ve),{g:ve,jib:Ze,bt:g.bt,ph:X*1.7}}),Xe=null,Bt=(g=!0)=>Xe=H.createRockets({THREE:e,foot:H.foot,colony:n,envMap:Ce,high:p,sites:Ht,light:g});yield,H?Bt():ee.then(()=>{H&&(Bt(!1),C(Xe))}),yield;let vt=Gr({THREE:e,colony:n,layout:mn({high:p,rockets:!0}),envMap:Ce,high:p,arrive:ur,hideLines:ze,solar:ot}),s=-1,f=new e.Matrix4,T=new e.Quaternion,L=new e.Vector3(0,1,0),v=new e.Vector3,ae=new e.Vector3,h=new e.Quaternion,W=new e.Color,Me=new e.Color(.78,.54,.36),N=new e.Color(.2,.14,.13),Q=new e.Quaternion().setFromEuler(new e.Euler(0,0,.5)),De=(g,X)=>{let ve=0;for(;ve<g.length&&g[ve].bt<X;)ve++;return ve},I=e.MathUtils.degToRad(.1),F=new e.Color(16773596),U=new e.Color(1,.66,.42),c=new e.Vector3,$=new e.Vector3,Ae=new e.Vector3,He=new e.Vector3,Ot=new e.Vector3,St=1;function At(){let g=Xe&&Xe.launch,X=g?g.light.k:0;c.copy(P),X>.001&&(Ot.copy(g.light.pos),Ot.y=Math.max(Ot.y,4),c.lerp(Ot.normalize(),gt(X,0,1))),c.y=Math.max(c.y,.035),c.normalize();let ve=Math.round(Math.asin(c.y)/I)*I,Be=Math.round(Math.atan2(c.x,c.z)/I)*I;if(c.set(Math.cos(ve)*Math.sin(Be),Math.sin(ve),Math.cos(ve)*Math.cos(Be)),u.color.copy(F).lerp(U,X),u.intensity=e.MathUtils.lerp(St,.28*(g?g.light.i:0),X),c.equals($))return!1;$.copy(c);let xe=u.shadow.camera,Ze=390*Math.max(c.y,.06)+80;return xe.top!==Ze&&(xe.top=Ze,xe.bottom=-Ze,xe.updateProjectionMatrix()),Aa(u,A,c,600,Ae,He),!0}function mt(g,X,ve=g){ge();let Be=Math.min(g,1),xe=Math.max(0,(Be-ur)/(1-ur)),Ze=G=gt(xe,.35,.95),xt=e.MathUtils.lerp(.34,-.05,gt(xe,.05,1));ie.visible=!1,P.set(-Math.cos(xt),Math.sin(xt),-Math.cos(xt)*.22).normalize(),te.sunDir.value.copy(P),te.night.value=Ze,We.g.value=xe,We.night.value=Ze,We.t.value=X,Te.night.value=Ze,q.night.value=Ze,r.fog.color.copy(W.copy(Me).lerp(N,Ze)),r.fog.near=500,r.fog.far=4200,St=e.MathUtils.lerp(2.2,.1,Ze),S.intensity=e.MathUtils.lerp(.5,.1,Ze),w.intensity=e.MathUtils.lerp(1.5,.12,Ze),w.color.copy(W),o.air&&o.air.hemi&&o.air.hemi(w.color),q.tubeMat.emissiveIntensity=Ze*.35,Xe&&Xe.update(ve,X,Ze),vt.update(xe,X,Ze,Be);for(let ce=0;ce<Tt.length;ce++){let _=Tt[ce];_.jib.rotation.y=_.ph+xe*46+X*.15}let Xt=At();if(Math.abs(Be-s)<1e-4)return Xt;s=Be;for(let ce=0;ce<Re.length;ce++){let _=Re[ce],Ct=_.list,Kt=De(Ct,xe),Ie=De(Ct,xe-.02),Ft=De(Ct,xe-.07);for(let j=0;j<Kt;j++){let Z=Ct[j],pe=to((xe-Z.bt)/.03),Je=to((xe-Z.bt-.02)/.06),et=to((xe-Z.bt-.07)/.08);T.setFromAxisAngle(L,Z.rot),f.compose(v.set(Z.x,0,Z.z),T,ae.set(Z.r,pe,Z.r)),_.pad.setMatrixAt(j,f),j<Ie&&(f.compose(v.set(Z.x,.45,Z.z),T,ae.set(Z.r*1.015,Z.r*Z.ys*Je*1.015,Z.r*1.015)),_.frame.setMatrixAt(j,f)),j<Ft&&(f.compose(v.set(Z.x,.45,Z.z),T,ae.set(Z.r,Z.r*Z.ys*et,Z.r)),_.shell.setMatrixAt(j,f),_.glass.setMatrixAt(j,f))}_.pad.count=Kt,_.frame.count=Ie,_.shell.count=_.glass.count=Ft,_.shell.instanceMatrix.needsUpdate=_.glass.instanceMatrix.needsUpdate=_.frame.instanceMatrix.needsUpdate=_.pad.instanceMatrix.needsUpdate=!0}let oe=De(R,xe);for(let ce=0;ce<oe;ce++){let _=R[ce];T.setFromAxisAngle(L,_.rot),f.compose(v.set(_.x,0,_.z),T,ae.set(_.r,to((xe-_.bt)/.03),_.r)),Ne.setMatrixAt(ce,f)}Ne.count=oe;let Pe=De(B,xe-.04);for(let ce=0;ce<Pe;ce++){let _=B[ce],Ct=to((xe-_.bt-.04)/.07);T.setFromAxisAngle(L,-_.rot),f.compose(v.set(_.x,0,_.z),T,ae.set(_.w,_.h*Ct,_.d)),qe.setMatrixAt(ce,f)}qe.count=Pe,Ne.instanceMatrix.needsUpdate=qe.instanceMatrix.needsUpdate=!0;let Le=De(Lt,xe);for(let ce=0;ce<Le;ce++){let _=Lt[ce],Ct=to((xe-_.bt)/.04);f.compose(v.set(_.x,0,_.z),Q,ae.set(1,Ct,1)),ot.setMatrixAt(ce,f)}return ot.count=Le,ot.instanceMatrix.needsUpdate=!0,ze.forEach(ce=>ce.material.opacity=gt(xe,ce.userData.bt,ce.userData.bt+.06)*(.15+.85*Ze)),tt.forEach(ce=>{let _=to((xe-ce.bt)/.1),Ct=gt(xe,ce.bt+.1,ce.bt+.18);ce.lattice.scale.set(1,Math.max(.001,_),1),ce.g.visible=_>0,ce.glass.material.opacity=Ct*.28,ce.glow.material.opacity=Ct*Ze*.28}),Pt.forEach(ce=>{let _=to((xe-ce.bt)/.08);ce.g.scale.set(Math.max(.001,_*62),1,1),ce.g.visible=_>0}),Tt.forEach(ce=>{let _=Math.min(to((xe-ce.bt+.08)/.04),1-to((xe-ce.bt-.2)/.04));ce.g.scale.set(1,Math.max(.001,_),1),ce.g.visible=_>.01}),!0}K={build:mt,cranes:Tt,get rockets(){return Xe}}}let J=null;function me(){return K?!0:(J=J||E(),J.next().done)}function he(){for(;!me(););}return{group:n,step:me,ensure:he,loadMaps:D,rockReady:ee,get api(){return K},get sun(){return P},get night(){return G},get done(){return!!K}}}var fr={grade:{exposure:-.7,contrast:1.08,saturation:.96,warmth:.12,tint:.01,lift:.005,gamma:.98,gain:1.11},lens:{bloomStrength:.89,bloomThreshold:1.26,vignette:.61,grain:.084},beats:{austin:{exposure:.11,warmth:.62},space:{exposure:1.1,warmth:-.53},marsOrbit:{exposure:.76,warmth:.09},colony:{exposure:.45,warmth:.69}}};var dr=[{pr:.75,post:0,trails:!1,shadow:1024,every:3,keep:.4},{pr:1,post:1,trails:!1,shadow:2048,every:2,keep:.6},{pr:1,post:2,trails:!0,shadow:2048,every:1,keep:1},{pr:1,post:3,trails:!0,shadow:4096,every:1,keep:1},{pr:1.25,post:3,trails:!0,shadow:4096,every:1,keep:1},{pr:1.5,post:3,trails:!0,shadow:4096,every:1,keep:1}],yn=dr.length-1,Mn=14,Es=9,hr=20,$s=250,uo=40,ei=1500,ti=4e3,oi=15e3,ai=6e4,ri=600,Sn=33;function An({high:e=!0,top:t=null,apply:r,hold:l=()=>!1,holdUp:o=()=>!1,capOK:u=()=>!1,gpu:S=()=>null}={}){let M=(typeof location<"u"?new URLSearchParams(location.search):new URLSearchParams).get("perf"),p=M==="log",C=M==="off",y=/^[0-5]$/.test(M||"")?+M:null,A=t!=null?Math.max(0,Math.min(yn,t)):e?yn:2,b=y??A,n=A,V=0,P=0,G=0,K=0,H=-1e9,ee=0,se=-1,ye=new Float32Array(uo),le=new Float32Array(uo),Se=0,Ge=0,re=0,D=0,ge=0,E={level:b,ceil:n,p90:0,steps:0,gpu:null,capped:!1},J=(...ue)=>{p&&console.log("[film perf]",...ue)};function me(ue,te){ue=Math.max(0,Math.min(n,ue)),ue!==b&&(ue<b&&V-H<oi&&(n=b-1,ee=V,H=-1e9,J("ceiling",n)),ue>b&&(H=V),b=ue,G=V+ei,K=0,Se=0,Ge=0,re=0,D=0,E.steps++,J("level",ue,te,"gpu",E.gpu),he())}function he(){se!==b&&(se=b,E.level=b,E.ceil=n,r(dr[b],b))}function be(ue){if(se<0&&he(),C||y!=null)return;if(V+=Math.min(ue,100),ue>$s){P=V,++ge>=8&&b>0&&(ge=0,me(b-1,"sustained stalls"));return}if(ge=0,V-P<ri)return;if(Se===uo){let Ye=ye[Ge];Ye>hr&&re--,Ye>Sn&&D--}else Se++;if(ye[Ge]=ue,Ge=(Ge+1)%uo,ue>hr&&re++,ue>Sn&&D++,Se<uo)return;le.set(ye),le.sort();let te=le[Math.floor(uo*.9)],ie=le[Math.floor(uo*.1)];E.p90=+te.toFixed(1);let fe=u()&&ie>25&&te-ie<3;E.capped=fe;let Oe=S(),Ee=Oe!=null&&isFinite(Oe);if(E.gpu=Ee?+Oe.toFixed(1):null,fe&&!Ee&&b<=A-1){K=0;return}if(D>uo*.6&&b>0&&(!Ee||Oe>Mn)){me(b-1,"emergency p90 "+te.toFixed(1));return}if(n<A&&V-ee>ai&&(n=A,E.ceil=n,J("ceiling lifted")),!(V<G||l())){if(Ee?Oe>Mn:te>hr||re>uo*.12){me(b-1,"p90 "+te.toFixed(1)+" misses "+re+" gpu "+E.gpu+" capped "+fe);return}b<n&&(Ee?Oe<Es&&(fe||re===0&&te<17.6):re===0&&te<17.6)&&!o()?K?V-K>ti&&me(b+1,"headroom p90 "+te.toFixed(1)):K=V:K=0}}return{frame:be,LADDER:dr,get level(){return b},get ceil(){return n},get state(){return E},pin(ue){ue!=null&&(n=A,me(Math.max(0,Math.min(A,ue)),"pinned"))},reset(){Se=0,Ge=0,re=0,D=0,P=V}}}var ni=.14,si=.175,vr=48/157.5,Fo=[.04,.12,.32,.4],Cn=.3,po=1.12,Dn=.03,zn=.4,ii=.6,Pn=-.02,li=[[-1,-.9],[-.3,-.1],[.43,.49]],Ln=(e,t,r,l,o)=>wt(wt(wt(e.austin[t],e.space[t],r),e.marsOrbit[t],l),e.colony[t],o);function Ul({THREE:e,host:t,section:r,scenes:l,sol:o,quality:u,files:S}){let w=u==="high",M=new URLSearchParams(location.search).get("touch"),p=!w&&(M?M==="1":matchMedia("(pointer: coarse)").matches),C=[.75,1,1.25,1.5,1.75,2],y=w?1.5:p?2:1,A=new e.WebGLRenderer({antialias:!1,powerPreference:"high-performance"});A.setPixelRatio(Math.min(devicePixelRatio,y));let b=Math.max(1,t.clientWidth),n=Math.max(1,t.clientHeight);A.setSize(b,n,!1),A.toneMapping=e.ACESFilmicToneMapping,A.toneMappingExposure=1.05,A.shadowMap.enabled=!0,A.shadowMap.type=e.PCFSoftShadowMap,A.shadowMap.autoUpdate=!1;let V=A.domElement;Object.assign(V.style,{position:"absolute",inset:"0",width:"100%",height:"100%",display:"block"}),t.insertBefore(V,t.firstChild);let P=new e.Scene;P.background=new e.Color(65795);let G=new e.PerspectiveCamera(42,b/n,.1,9e3),K=$r({THREE:e,renderer:A,scene:P,cam:G,low:!w}),{bloom:H}=K,ee=JSON.parse(JSON.stringify(fr)),se=!1,ye=()=>{let a=bt==="colony"&&ne.api&&ne.api.rockets;return a?a.launch.exp:0},le=()=>{let a=ne.api.cranes;for(let i=0;i<a.length;i++)if(a[i].g.visible)return!0;return!1};function Se(){let a=ee.grade,i=ee.lens,x=ee.beats,m=li,k=K.look,z=K.grade;if(k&&(k.bloom=i.bloomStrength,k.threshold=i.bloomThreshold,k.vignette=i.vignette,k.grain=i.grain),!z)return;let we=gt(ke,m[0][0],m[0][1]),dt=gt(ke,m[1][0],m[1][1]),je=gt(ke,m[2][0],m[2][1]),nt=a.warmth+Ln(x,"warmth",we,dt,je),it=a.tint;if(z.expK=2**(a.exposure+Ln(x,"exposure",we,dt,je)-.55*ye()),nt===0&&it===0)z.wr=z.wg=z.wb=1;else{let pt=2**(.25*nt),ct=2**(-.2*it),Dt=2**(-.25*nt),Fe=1/(.2126*pt+.7152*ct+.0722*Dt);z.wr=pt*Fe,z.wg=ct*Fe,z.wb=Dt*Fe}z.contrast=a.contrast,z.saturation=a.saturation,z.lift=a.lift,z.gamma=a.gamma,z.gain=a.gain}let Ge=!0,re=1,D=(()=>{let a=A.getContext(),i=a&&a.createQuery&&a.getExtension("EXT_disjoint_timer_query_webgl2"),x=new Float32Array(30),m=new Float32Array(30),k=[],z=[],we=0,dt=0,je=null,nt=null,it=!i,pt=()=>{we=0,dt=0,nt=null},ct=Fe=>{try{a.deleteQuery(Fe)}catch{}};function Dt(){if(!it)try{for(;k.length&&a.getQueryParameter(k[0],a.QUERY_RESULT_AVAILABLE);){let Fe=k.shift();if(a.getParameter(i.GPU_DISJOINT_EXT)){ct(Fe);for(let Vt of k)ct(Vt);k.length=0,pt();break}let st=a.getQueryParameter(Fe,a.QUERY_RESULT)/1e6;z.push(Fe),st>=0&&st<1e3&&(x[dt]=st,dt=(dt+1)%30,we<30&&we++,nt=null)}}catch{it=!0,pt()}}return{poll:Dt,begin(){if(!(it||je||k.length>=4))try{let Fe=z.pop()||a.createQuery();a.beginQuery(i.TIME_ELAPSED_EXT,Fe),je=Fe}catch{it=!0}},end(){if(je){try{a.endQuery(i.TIME_ELAPSED_EXT),k.push(je)}catch{it=!0}je=null}},get p90(){return it||we<20?null:(nt==null&&(m.set(x),nt=m.subarray(0,we).sort()[Math.floor(we*.9)]),nt)},reset(){pt()},dispose(){for(let Fe of[...k,...z,je])Fe&&ct(Fe);k.length=z.length=0,je=null,it=!0}}})(),ge=An({high:w,top:p?C.length-1:null,hold:()=>ke>_t&&ke<.52,holdUp:()=>Do,capOK:()=>!0,gpu:()=>D.p90,apply:(a,i)=>{let x=Math.min(devicePixelRatio||1,y,p?C[i]:a.pr);A.getPixelRatio()!==x&&(A.setPixelRatio(x),K.setSize(b,n),K.resetMotion()),K.setQuality(w?a.post:Math.min(a.post,1)),Ge=a.trails,ia=a.every,re=a.keep,D.reset();let m=Oe.shadow,k=w?a.shadow:Math.min(a.shadow,2048);m.mapSize.x!==k&&(m.mapSize.set(k,k/2),m.map&&(m.map.dispose(),m.map=null),go=!0);let z=ne.api&&ne.api.rockets;z&&z.setKeep&&z.setKeep(re)}});(H.separableBlurMaterials||[]).forEach(a=>{let i=a.uniforms.gaussianCoefficients?.value;if(!i)return;let x=i.length,m=x/2.6;for(let k=0;k<x;k++)i[k]=.39894*Math.exp(-.5*k*k/(m*m))/m});let E=vn({THREE:e}),{toSun:J,EARTH:me,MARS:he,C0:be,L0:ue}=E,te=rn({THREE:e,scene:P,renderer:A,toSun:J,EARTH:me,MOON:E.moonAt(-1,new e.Vector3),MARS:he,files:S.tex});te.moon.material.uniforms.uRelief.value=.35,te.mars.material.uniforms.uRelief.value=.4;let ie=null,fe=en({THREE:e,scene:P,starsUrl:S.stars,milkyUrl:S.milky,milkyWayIntensity:.14}).then(a=>{ie=a}).catch(()=>{}),Oe=new e.DirectionalLight(16773596,2.4);Oe.position.copy(J).multiplyScalar(100);let Ee=new e.AmbientLight(2240580,.35),Ye=new e.HemisphereLight(16763030,5909012,1.4);Ye.intensity=0,P.add(Oe,Oe.target,Ee,Ye);let ne=wn({THREE:e,renderer:A,scene:P,cam:G,planets:te,sunLight:Oe,ambient:Ee,hemi:Ye,files:S.jezero,HIGH:w,lateRockets:a=>Xo("colony",()=>qo(a.group)),lodPath:()=>{let a=[];for(let i=0;i<=48;i++){let x=new e.Vector3,m=.6+(po-.6)*i/48;Lt.getPoint(kt(m),x),St(m,x,!0),a.push(x.sub(Ve))}return a}}),Qe=ne.group,Ve=new e.Vector3(so.x,so.y,so.z),Te=a=>{let i=document.createElement("canvas");i.width=i.height=256;let x=i.getContext("2d"),m=x.createRadialGradient(128,128,0,128,128,128);return a.forEach(([k,z])=>m.addColorStop(k,z)),x.fillStyle=m,x.fillRect(0,0,256,256),new e.CanvasTexture(i)},Ce=new e.Sprite(new e.SpriteMaterial({map:Te([[0,"rgba(255,255,255,1)"],[.12,"rgba(255,236,200,0.9)"],[.35,"rgba(255,170,80,0.25)"],[1,"rgba(0,0,0,0)"]]),color:16777215,blending:e.AdditiveBlending,depthWrite:!1,transparent:!0,fog:!1}));P.add(Ce);let q=()=>K.resetMotion(),d=new e.Vector3(0,4e4,0),O=un({THREE:e,scene:P,renderer:A,sunLight:Oe,hemi:Ye,ORIGIN:d,earthU:te.earth.material.uniforms,ortho:S.ortho}),B=dn({THREE:e,parent:O.group,high:w}),R=.012,de=10/6371e3,Ue=e.MathUtils.degToRad(ea.lat),Ke=(ea.lon+180)/360,Re=new e.Vector3(-Math.cos(2*Math.PI*Ke)*Math.cos(Ue),Math.sin(Ue),Math.sin(2*Math.PI*Ke)*Math.cos(Ue)),Ne=Math.atan2(Re.z,Re.x)-Math.atan2(be.z,be.x),qe=Re.clone().applyAxisAngle(new e.Vector3(0,1,0),Ne).multiplyScalar(10),yt=qe.clone().normalize(),Gt=E.spaceCam,Mt=nn({THREE:e,SITE_ROT:Oa,AUS:qe,U_PER_M:de,C0:be,L0:ue,spaceCam:Gt}),_e={pos:new e.Vector3,look:new e.Vector3,up:new e.Vector3},Y=Mt.LAMH,ze=Mt.LAM1,We={},$e={pos:new e.Vector3,look:new e.Vector3,up:new e.Vector3},rt=(a,i)=>{let x=Math.log(a),m=Mt.k.yA,k=Mt.k.yH;for(let z=0;z<50;z++){let we=(m+k)/2;Mt.at(we,$e),$e.lam<x?m=we:k=we}return Mt.at((m+k)/2,i)},ut=[15,0,-135],tt=(a,i,x)=>[ut[0]+a*Math.sin(i*Math.PI/180),x,ut[2]+a*Math.cos(i*Math.PI/180)],Pt=[[oo,[2200,2600,900],[-3200,0,-200],50],[.52,[1400,1500,700],[-1400,0,-300],48],[.57,[750,700,550],[-250,0,-250],46],[.62,tt(600,28,260),[15,30,-135],42],[.72,tt(500,32,190),[15,34,-135],40],[.8,tt(420,24,130),[10,38,-130],40],[.88,tt(350,15,80),[-5,44,-125],42],[1,tt(450,13,85),[-15,52,-118],45],[1.12,tt(600,14,115),[-20,60,-115],50]].map(([a,i,x,m])=>({p:a,pos:new e.Vector3(...i).add(Ve),look:new e.Vector3(...x).add(Ve),fov:m})),Lt=new e.CatmullRomCurve3(Pt.map(a=>a.pos),!1,"centripetal"),ot=new e.CatmullRomCurve3(Pt.map(a=>a.look),!1,"centripetal"),It=Pt.map(a=>a.p),kt=nr(Lt,It,void 0,0),Tt=nr(ot,It,void 0,0),Xe=co(It,Pt.map(a=>a.fov),void 0,0),Bt=(()=>{let a=co([.49,.62,.88,.9,1.12],[0,.1,.8,.83,1]);return i=>i<=.49?0:i>=1.12?1:Nt(a(i))})(),vt=.83,s=new e.Vector3,f=new e.Vector3,T=new e.Vector3(Ht.build[0],0,Ht.build[1]).add(Ve),L=new e.Vector3;function v(a,i){let x=ne.api&&ne.api.rockets,m=x&&x.launch;if(m&&m.pos)return i.copy(m.pos);let k=Math.max(0,a-vt),z=4800*k*k*(1+4*k),we=25e-5*z*z;return i.set(Ht.build[0]-.952*we,26+z,Ht.build[1]-.305*we).add(Ve)}let ae=a=>Math.asin(e.MathUtils.clamp(a.y/Math.max(1e-6,a.length()),-1,1)),h=a=>Math.atan2(Math.sin(a),Math.cos(a));function W(a,i,x,m){let k=Math.min(Math.max(a,oo),po);Lt.getPoint(kt(k),i),ot.getPoint(Tt(k),x);let z=lr(k,Xe(k),G.aspect),we=gt(m,vt+.002,vt+.045);if(we>0){let dt=e.MathUtils.degToRad(z/2),je=s.copy(x).sub(i),nt=je.length();v(m,f).sub(i);let it=ae(je),pt=ae(f),ct=ae(L.copy(T).sub(i)),Dt=.3+1.1*gt(bo,0,zn*.6),Fe=wt(it,Math.min(Math.max(it,pt-.5*dt),ct+Dt*dt),we),st=Math.atan2(je.x,je.z),Vt=st+h(Math.atan2(f.x,f.z)-st)*.55*we;x.set(Math.cos(Fe)*Math.sin(Vt),Math.sin(Fe),Math.cos(Fe)*Math.cos(Vt)).multiplyScalar(nt).add(i)}return z}let Me=document.querySelector("[data-foot-canvas]")||document.querySelector("[data-foot]"),N=[.86,po],Q=[.98,po],De=[.86,.95],I=[1,po],F=.5,U=-.3,c=Me?(()=>{let a=Ra(0,0),i=Ra(Ht.build[0],Ht.build[1]),x=Math.atan2(i[1]-a[1],i[0]-a[0])-Math.atan2(Ht.build[1],Ht.build[0]),m=Math.cos(x),k=Math.sin(x),z=-Tr(a[0],a[1]),we=(pt,ct,Dt,Fe)=>{let st=pt-a[0],Vt=Dt-a[1];return Fe.set(st*m+Vt*k,ct+z,-st*k+Vt*m).add(Ve)},dt=_a(16,9),je={toCol:we,eye:we(...dt.eye,new e.Vector3),look:new e.Vector3,q:new e.Quaternion,c:0,e:1,ok:!1},nt=Math.sin(dt.sunAz),it=-Math.cos(dt.sunAz);return je.sunAz=Math.atan2(-nt*k+it*m,nt*m+it*k),je.rE=Math.hypot(je.eye.x-Ve.x,je.eye.z-Ve.z),je.aE=Math.atan2(je.eye.z-Ve.z,je.eye.x-Ve.x),je})():null,$=(a,i,x=!1)=>c&&(x||c.ok)?Wo(a,i[0],i[1]):0,Ae=new e.Matrix4,He=new e.Vector3(0,1,0);function Ot(){if(!c)return;let a=Me.clientWidth,i=Me.clientHeight;if(c.ok=a>0&&i>0,!c.ok)return;let x=_a(a,i),m=Math.tan(x.vfov*Math.PI/360);c.toCol(...x.look,c.look),Ae.lookAt(c.eye,c.look,He),c.q.setFromRotationMatrix(Ae),c.e=2*m*n/i,c.c=m+c.e/2}function St(a,i,x=!1){let m=$(a,N,x);if(m<=0)return i;let k=i.x-Ve.x,z=i.z-Ve.z,we=Math.atan2(z,k),dt=wt(Math.hypot(k,z),c.rE,m),je=we+h(c.aE-we)*m;return i.set(Ve.x+dt*Math.cos(je),wt(i.y,c.eye.y,$(a,Q,x)),Ve.z+dt*Math.sin(je))}let At=new e.Quaternion,mt=new e.Vector3;function g(a,i){let x=$(a,De),m=$(a,I);St(a,zt),G.position.copy(zt);let k=2*Math.tan(i*Math.PI/360),z=wt(wt(-cr(a,G.aspect)*k,0,x),c.c,m),we=k**(1-m)*c.e**m;v(ao,mt).sub(zt);let dt=ae(mt)-Math.atan(z-we/2+F*we),je=Math.atan2(mt.x,mt.z);mt.set(Math.cos(dt)*Math.sin(je),Math.sin(dt),Math.cos(dt)*Math.cos(je)).add(zt),Ae.lookAt(zt,mt,He),At.setFromRotationMatrix(Ae),G.quaternion.slerp(At,x).slerp(c.q,m),ve(z,we),To(e.MathUtils.clamp((zt.y-so.y)*.08,.1,30),9e3)}function X(a){let i=$(a,N);if(i<=0)return;let x=ne.sun,m=wt(Math.asin(e.MathUtils.clamp(x.y,-1,1)),U,$(a,I)),k=Math.atan2(x.z,x.x),z=k+h(c.sunAz-k)*i;x.set(Math.cos(m)*Math.cos(z),Math.sin(m),Math.cos(m)*Math.sin(z))}function ve(a,i){let x=Math.abs(a)+i/2,m=2*x/i,k=b*m,z=n*m;G.fov=2*Math.atan(x)*180/Math.PI,G.setViewOffset(k,z,(k-b)/2,(x-a-i/2)*n/i,b,n),Mo=!0}let Be=new e.Vector3(-.78,.42,.46).normalize(),xe=new e.Vector3,Ze=new e.Quaternion,xt=new e.Mesh(new e.PlaneGeometry(30,30),new e.ShaderMaterial({uniforms:{uR:{value:6},uL2:{value:new e.Vector2(Be.x,Be.y).normalize()},uI:{value:1.5}},vertexShader:"varying vec2 vQ; void main(){ vQ = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }",fragmentShader:`uniform float uR, uI; uniform vec2 uL2; varying vec2 vQ;
    void main(){ float q = length(vQ), d = max(q / uR - 1., 0.); vec2 dir = vQ / max(q, 1e-4);
      float side = smoothstep(-0.6, 1., dot(dir, uL2));
      // a thin dusty atmosphere hugging the limb (Mars' dust haze tops out ~1% of its radius up), much stronger on the lit side:
      // a narrow warm rim, not a soft disc. The inner term sits over the geometric edge so the limb never reads as a cut-out
      float g = exp(-d * 120.) * 0.75 + exp(-d * 34.) * 0.16 + exp(-d * 9.) * 0.012;
      float edge = 1. - smoothstep(11., 15., max(abs(vQ.x), abs(vQ.y))); // fade before the plane's edge: its square never shows on black
      gl_FragColor = vec4(vec3(1.0, 0.56, 0.28) * g * side * side * uI * edge, 0.); }`,transparent:!0,depthWrite:!1,blending:e.CustomBlending,blendSrc:e.OneFactor,blendDst:e.OneFactor}));{let a=te.marsAtmo.material.uniforms;a.uBetaR.value.multiplyScalar(.25),a.uSunCol.value.set(1,.86,.66),a.uK.value=15}xt.position.copy(he),xt.renderOrder=3,xt.frustumCulled=!1,P.add(xt);function Xt(a,i){E.marsQ(a,te.mars.quaternion),xe.copy(Be).applyQuaternion(G.quaternion),te.marsAtmo.material.uniforms.uSun.value.copy(xe),Ze.copy(te.mars.quaternion).invert(),te.mars.material.uniforms.uSun.value.copy(xe).applyQuaternion(Ze);let x=G.position.distanceTo(Le);xt.quaternion.copy(G.quaternion),xt.material.uniforms.uR.value=6/Math.sqrt(Math.max(.05,1-36/(x*x)))}let oe={uPx:{value:1},uI:{value:0}},Pe=new e.Points(new e.BufferGeometry().setAttribute("position",new e.BufferAttribute(new Float32Array(3),3)),new e.ShaderMaterial({uniforms:oe,vertexShader:"uniform float uPx; void main(){ gl_PointSize = uPx; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }",fragmentShader:`uniform float uI; void main(){ vec2 q = gl_PointCoord * 2. - 1.; float r2 = dot(q, q); if (r2 > 1.) discard;
      gl_FragColor = vec4(vec3(1.0, 0.52, 0.3) * (exp(-r2 * 10.) + exp(-r2 * 3.) * 0.1) * uI, 1.); }`,transparent:!0,depthWrite:!1,blending:e.AdditiveBlending}));Pe.frustumCulled=!1,Pe.renderOrder=1,P.add(Pe);let Le=he.clone(),ce=[te.mars,te.marsAtmo,xt];function _(a,i){let x=i?E.marsFar(a):1;Le.copy(he).sub(G.position).multiplyScalar(x).add(G.position),te.mars.position.copy(Le),te.marsAtmo.position.copy(Le),te.marsAtmo.material.uniforms.uCenter.value.copy(Le),xt.position.copy(Le),Pe.position.copy(Le);let m=6/Le.distanceTo(G.position)*n/2/Math.tan(G.fov*Math.PI/360),k=i?1-gt(m,1.2,4):0;for(let z of ce)z.visible=i&&m>.9;return Pe.visible=k>.001,oe.uI.value=5*k,oe.uPx.value=9*A.getPixelRatio(),m}let Ct=[te.earth,te.clouds,te.moon,te.mars,te.earthAtmo,te.marsAtmo,xt,Pe],Kt=[te.earth,te.clouds,te.moon,te.earthAtmo],Ie=null,Ft=a=>a.getBoundingClientRect();function j(){b=Math.max(1,t.clientWidth),n=Math.max(1,t.clientHeight);let a=Ft(r),i=n,x={};for(let Fe in l){if(!l[Fe])continue;let st=Ft(l[Fe]),Vt=l[Fe].firstElementChild,eo=Vt?Ft(Vt):st;x[Fe]={top:st.top-a.top,h:st.height,tc:(eo.top+eo.bottom)/2-a.top}}let m=(Fe,st=0)=>x[Fe].tc-i/2+st*i,k=(Fe,st)=>x[Fe].top+st*x[Fe].h-i/2,z=Math.max(1,a.height-i),we=b<768&&n>b?-.12:0,dt=1.9,je=(m("title",0)-m("earth",we))/i,nt=Math.min(1,je/dt),it=nt**.6,pt=Math.max(0,Math.min(Math.sqrt(nt),(je-.5*it-.15*nt)/.7)),ct=[[m("earth",we-.6),-1],[m("earth",we),-.9],[m("earth",we+.7*pt),-.64],[m("title",-.5*it),-.15],[m("title",0),0],[m("reind",0),.26],[k("colony",0),.62],[k("colony",1),.9],[z,po]];for(let Fe=1;Fe<ct.length;Fe++)ct[Fe][0]<=ct[Fe-1][0]+1&&(ct[Fe][0]=ct[Fe-1][0]+1);Ie={vh:i,yEnd:z,S:Sa(ct),sc:x};{let Fe=ct[0][0],st=z;for(let Vt=0;Vt<50;Vt++){let eo=(Fe+st)/2;Ie.S(eo)<Pn?Fe=eo:st=eo}Ie.ySol=(Fe+st)/2}E.layout({S:Ie.S,yE:ct[0][0],y1:z,vh:i});let Dt=[x.austin.top-i,m("austin",0),m("austin",.5),ct[0][0]];for(let Fe=Dt.length-2;Fe>=0;Fe--)Dt[Fe]>=Dt[Fe+1]-1&&(Dt[Fe]=Dt[Fe+1]-Math.max(1,.25*i));Mt.layout({yA:Dt[0],yT:Dt[1],yX:Dt[2],yE:Dt[3],S:Ie.S}),B.layout(rt,b/n),et(),ht(),Z(),Ot()}function Z(){let a=r.nextElementSibling;for(;a&&(a.offsetHeight===0||getComputedStyle(a).display==="none");)a=a.nextElementSibling;let i=m=>{let k=m&&getComputedStyle(m).backgroundColor.match(/[\d.]+/g);return k&&(k.length<4||+k[3]>.5)?k:null},x=null;for(let m=a,k=0;m&&!x&&k<3;m=m.firstElementChild,k++)x=i(m);for(let m=r.parentElement;m&&!x;m=m.parentElement)x=i(m);x=x||[0,0,0],io.el=a,io.col[0]=x[0]/255,io.col[1]=x[1]/255,io.col[2]=x[2]/255}let pe=null,Je=()=>b<768?24:40;function et(){pe=null;let a=l.title,i=a&&a.querySelector('[data-split="left"]'),x=a&&a.querySelector('[data-split="right"]');if(!i||!x)return;let m=i.parentElement;i.style.transform=x.style.transform="";let k=Ft(m),z=Ft(i),we=Ft(x),dt=Math.abs((z.top+z.bottom)/2-(we.top+we.bottom)/2)<z.height*.5,je=b>=768,nt=(je?si:ni)*n;if(dt){let it=we.left-z.right,pt;if(je){pt=Math.max(.05*n,Math.min(nt,it/2/(1+vr)));let ct=Math.max(0,it/2-pt*(1+vr));i.style.transform=`translate3d(${ct}px,0,0)`,x.style.transform=`translate3d(${-ct}px,0,0)`}else pt=Math.max(.05*n,Math.min(nt,(it/2-Je())/1.08));pe={Ls:i,Rs:x,h2:m,x:(z.right+we.left)/2-k.left,y:(z.top+z.bottom+we.top+we.bottom)/4-k.top,r:pt}}else{let it=Math.min(nt,.4*b),pt=je?it*(1+vr):it*1.08+Je(),ct=we.top-z.bottom,Dt=je?pt-ct/2:Math.max(0,pt-ct/2);i.style.transform=`translate3d(0,${-Dt}px,0)`,x.style.transform=`translate3d(0,${Dt}px,0)`,pe={Ls:i,Rs:x,h2:m,x:((z.left+z.right)/2+(we.left+we.right)/2)/2-k.left,y:(z.bottom+we.top)/2-k.top,r:it}}}let ft=null;function ht(){ft=null;let a=l.reind&&l.reind.firstElementChild;if(!a)return;let i=document.createRange();i.selectNodeContents(a);let x=0;for(let we of i.getClientRects())we.width>1&&(x=Math.max(x,we.right));let m=Ft(t),k=b-(x-m.left),z=Math.min(.21*n,.4*b);if(b>=768&&k>2.2*z){let we=Math.min(z,(k/2-24)/1.08);ft={x:x-m.left+k/2,y:n/2,r:we}}else{let we=Ft(a).height,dt=n<500?12:24,je=n/2-we/2-24-.04*n,nt=pe?pe.r*(1+Cn*Fo[1]):0,it=Math.max(.05*n,Math.min(z,.16*n,je/2.38),Math.min(nt,(b>=768?.2:.16)*n));ft={x:b/2,y:Math.max(1.12*it,Math.min(.3*n,n/2-we/2-dt-1.19*it)),r:it}}}let lt=0,Qt=0,ke=-1,Wt=0,bt="site",Jt="",ci=!1,aa=!0,ra=!1,kn=!1,Vo=0,na=0,sa=0,Va=null,mr=0,Ua=0,go=!0,pr=!1,xo=!1,bo=0,Uo=0,No=0,ao=0,ia=1,Do=!1,Io=null,On=3,io={k:0,col:[0,0,0],el:null},Na=new e.Vector3,Ia=new e.Vector3,gr=new e.Vector3,la={x:0,y:0},ro={x:0,y:0},Bn=.05,Ga=new URLSearchParams(location.search).get("touch"),ca=matchMedia("(pointer: coarse)"),Ta={on:Ga?Ga==="1":ca.matches},wo=0,xr=()=>{Ga||(Ta.on=ca.matches,wo=0)};ca.addEventListener?.("change",xr);let br=a=>{la.x=a.clientX/innerWidth-.5,la.y=a.clientY/innerHeight-.5};addEventListener("mousemove",br,{passive:!0});let zt=new e.Vector3,Et=new e.Vector3,$t=new e.Vector3,Fn=new e.Vector3,ua=new e.Vector3,Go=new e.Vector3(0,1,0),yo=new e.Vector3,Vn=new e.Color(16773596),To=(a,i)=>{(G.near!==a||G.far!==i)&&(G.near=a,G.far=i,G.updateProjectionMatrix())},fa={g:0,t:0},zo={lam:0,t:0,sinE:1,proj:1,pr:1},Wa={t:0,intro:1,camPos:zt,spin:0,hole:yt},fo={dt:0,t:0,focus:0,aperture:0,maxblur:0,ca:0},Un=new e.Vector3,ha={k:0,mb:0};function ja(a){let i=Oe.shadow.camera;Oe.shadow.normalBias=a?.1:.35,a?(i.left=-160,i.right=160,i.top=80,i.bottom=-80,i.near=50,i.far=900,Ee.intensity=.03):(i.left=-390,i.right=390,i.near=60,i.far=1300,Oe.color.copy(Vn)),i.updateProjectionMatrix()}let Mo=!1,Wo=(a,i,x)=>Yt(Nt((a-i)/(x-i)));function Nn(a,i){let x=a&&pe?Wo(ke,-.15,-.02)*(1-Wo(ke,.04,.12)):0,m=a&&ft?Wo(ke,Fo[0],Fo[1])*(1-Wo(ke,Fo[2],Fo[3])):0,k=()=>{i?(G.setViewOffset(b,n,0,i*n,b,n),Mo=!0):Mo&&(Mo=!1,G.clearViewOffset())};if(x<=0&&m<=0)return k();let z=Math.tan(G.fov*Math.PI/360);G.updateMatrixWorld(),yo.copy(he).applyMatrix4(G.matrixWorldInverse);let we=yo.length();if(yo.z>-6.2||we<6.2)return k();let dt=yo.x/-yo.z/(z*G.aspect),je=yo.y/-yo.z/z,nt=b/2+dt*b/2,it=n/2-je*n/2,pt=Math.tan(Math.asin(6.05/we))/z*n/2,ct=nt,Dt=it-i*n,Fe=1+Cn*ke;if(x>0&&m>0){let st=Math.min(1,x+m),Vt=m/(x+m),eo=Ft(pe.h2),va=Ft(t);pt=wt(pt,wt(pe.r,ft.r,Vt)*Fe,st),ct=wt(ct,wt(eo.left-va.left+pe.x,ft.x,Vt),st),Dt=wt(Dt,wt(n/2,ft.y,Vt),st)}else{if(b<992&&m>0&&ke>Fo[2]){let st=ft.r*Fe,Vt=pt-st;pt=.5*(pt+st+Math.sqrt(Vt*Vt+.01*st*st*m))}if(x>0){let st=Ft(pe.h2),Vt=Ft(t);pt=wt(pt,pe.r*Fe,x),ct=wt(ct,st.left-Vt.left+pe.x,x),Dt=wt(Dt,n/2,x)}m>0&&(pt=wt(pt,ft.r*Fe,m),ct=wt(ct,ft.x,m),Dt=wt(Dt,ft.y,m))}{let st=Math.max(6.6/we,6.05/Math.sin(Math.atan(pt*2*z/n))/we);zt.sub(he).multiplyScalar(st).add(he),G.position.sub(he).multiplyScalar(st).add(he),G.updateMatrixWorld()}G.setViewOffset(b,n,-(ct-nt),-(Dt-it),b,n),Mo=!0}let lo={inCol:!1,cam:G,t:0,dt:0,alt:0,fog:P.fog,e:0};function In(a,i,x){let m=Nt((ke-_t)/(ta-_t));lo.inCol=a,lo.sunDir=ne.sun,lo.night=ne.night,lo.t=i,lo.dt=x,lo.e=m,lo.fog=P.fog,lo.alt=a?G.position.y-so.y:G.position.distanceTo(he),te.entry(m,lo)}let qa=[0,0],jo={entry:-1,gR:-1,plume:null};function Gn(a){let i=a&&ne.api&&ne.api.rockets,x=i&&i.launch,m=a?ao:-1;jo.entry=ke>_t&&ke<ta?(ke-_t)/(ta-_t):-1,jo.gR=m,jo.plume=null,x&&x.base&&m>=.78&&(ua.copy(x.base).project(G),ua.z<1&&(qa[0]=ua.x*.5+.5,qa[1]=ua.y*.5+.5,jo.plume=qa)),K.lensFrame(jo);let k=x&&x.fx,z=K.fx;k&&z&&(k.flash>z.flash&&(z.flash=k.flash),k.heat>z.heat&&(z.heat=k.heat),k.bloom>z.bloom&&(z.bloom=k.bloom))}let wr="",yr="",Mr=o&&o.root&&+o.root.dataset.solFrom||1,Tn=o&&o.root&&+o.root.dataset.solTo||206;function Wn(){if(!o||!o.root)return;let a=gt(ke,.4,.43)*(1-gt(ke,.57,.61)),i=gt(lt,Ie.yEnd,Ie.yEnd+.25*Ie.vh),x=gt(ke,Pn,.06)*(1-a)*(1-i),m=x.toFixed(3);m!==yr&&(yr=m,o.root.style.opacity=m,o.root.style.visibility=x>.005?"":"hidden");let k=Nt((lt-Ie.ySol)/Math.max(1,Ie.yEnd-1-Ie.ySol)),z=String(Mr+Math.floor((Tn-Mr)*k+1e-6)).padStart(4,"0");z!==wr&&o.value&&(wr=z,o.value.textContent=z)}let Sr=-1,Ar="",Xa={p:0,beat:""},jn=new CustomEvent("tf:film",{detail:Xa}),Cr=()=>ke<-.55?Wt<1?"austin":"earth":ke<.12?"mars-title":ke<.42?"reindustrialize":ke<.88?"colony":"launch";function qn(a){Ie||j();let i=sa,x=-Ft(r).top;if(aa||Math.abs(x-lt)>2*Ie.vh)lt=x,Qt=0,wo=0,aa=!1,q();else{let at=lt;if(Ta.on){let Ut=2/Bn,qt=Ut*a,no=1/(1+qt+.48*qt*qt+.235*qt*qt*qt),Ko=lt-x,Yo=(wo+Ut*Ko)*a;wo=(wo-Ut*Yo)*no,lt=x+(Ko+Yo)*no,Math.abs(lt-x)<.5&&Math.abs(wo)<20&&(lt=x,wo=0)}else window.lenis?lt=x:lt+=(x-lt)*(1-Math.exp(-a/.05));Qt=a>0?(lt-at)/a:0}ro.x+=(la.x-ro.x)*a*2,ro.y+=(la.y-ro.y)*a*2,Mt.at(lt,_e),Wt=_e.s,ke=Math.min(po,Math.max(-1,Ie.S(lt))),Wt<1&&(ke=-1);let m=Wt<1,k=_e.lam;bt=m?_e.world:ke>=oo?"colony":"space";{let at=lt>=Ie.yEnd-2,Ut=at?Dn:bo>0?-2.5*Dn:0;Uo+=(Ut-Uo)*(1-Math.exp(-a/ii)),bo=Math.min(zn,Math.max(0,bo+Uo*a)),bo<=0&&Uo<0&&(Uo=0),No=Bt(ke),ao=No+bo*gt(No,.95,1)}io.k=gt(lt-Ie.yEnd,-.3*Ie.vh,0),Wt>.6&&te.loadDeferred("moon"),ke>-.9&&te.loadDeferred("mars"),bt==="colony"?ne.ensure():ke>.3&&zr();let z=bt==="colony",we=bt==="site",dt=m?0:gt(ke,-1,-.92),je=46,nt=30;if(Go.set(0,1,0),we){let at=_e.dist,Ut=1-_e.upk;$t.copy(_e.pos),$t.x+=ro.x*3*Ut,$t.z+=ro.y*2*Ut,zt.copy($t).add(d),Et.copy(_e.look).add(d),Go.copy(_e.up),je=_e.fov,nt=at,mr=at,To(Math.max(.3,at*.004),at*8+3e3),fa.g=_e.g,fa.hour=_e.hour,fa.t=i,Va=O.update(fa);{let no=A.getPixelRatio();zo.lam=k,zo.t=i,zo.sinE=Va.sinE,zo.pr=no,zo.proj=n*no/(2*Math.tan(e.MathUtils.degToRad(je)/2)),B.update(zo)}O.follow($t,at),P.fog.near=1e8,P.fog.far=1e9,Ye.intensity*=1-gt(k,Math.log(3e3),Math.log(6e4));let qt=Va.night;K.trails.enabled=w&&Ge&&qt>.02,K.trails.amount=.65*qt}else if(bt==="globe")zt.copy(_e.pos),Et.copy(_e.look),je=_e.fov,nt=_e.dist*de,To(Math.min(.1,Math.max(5e-4,nt*.04)),9e3);else if(z){je=W(ke,zt,Et,ao),zt.x+=ro.x*8*dt,zt.y-=ro.y*5*dt,nt=zt.distanceTo(Et);let at=ne.api&&ne.api.rockets&&ne.api.rockets.launch;if(at&&at.burn>.004){nt=wt(nt,zt.distanceTo(at.pos),gt(ao,vt,vt+.03));let Ut=at.shake*zt.distanceTo(Et)*.0022;if(Ut>1e-4){Na.copy(Et).sub(zt).normalize(),Ia.crossVectors(Na,Go).normalize(),gr.crossVectors(Ia,Na);let qt=Math.sin(i*31)*.6+Math.sin(i*57+1.7)*.4,no=Math.sin(i*37+.6)*.6+Math.sin(i*71+2.9)*.4;Et.addScaledVector(Ia,qt*Ut).addScaledVector(gr,no*Ut)}}To(e.MathUtils.clamp((zt.y-so.y)*.08,.1,30),9e3)}else je=Gt(ke,zt,Et,Go),je=lr(ke,je,G.aspect),nt=wt(zt.distanceTo(qe),zt.distanceTo(Et),gt(ke,-1,-.92)),To(.1,12e3);we||(K.trails.enabled=!1);{let at=m?gt(k,Math.log(450),Math.log(3600))*(1-gt(k,14,15.9)):0;K.motion.shutter=.6+2.4*at,K.motion.maxLen=.035+.11*at}if(K.auto.enabled=!m,m?(A.toneMappingExposure=sn(Pa(_e.hour,We).sinE,k),K.snapExposure()):(A.toneMappingExposure=1.05,K.auto.min=.55),bt!==Jt){O.group.visible=we,Qe.visible=z;let at=!we&&!z;Ct.forEach(Ut=>Ut.visible=at),ja(we),K.motion.cutDist=bt==="site"||bt==="globe"?1e12:400,K.ao.enabled=we&&w,(Jt==="site"&&bt==="globe"||Jt==="")&&K.resetMotion(),Jt=bt,go=!0,A.compile(Ka,G,P)}if(bt==="space"){let at=ke>-.12;for(let Ut of Kt)Ut.visible=!at}let it=z?ne.sun:J,pt=z&&ne.api.build(No,i,ao);if(z&&X(ke),z){let at=ne.api.rockets;at&&at.setKeep&&at.keep!==re&&(at.keep=re,at.setKeep(re))}if(bt!=="site"&&bt!=="globe"&&In(z,i,a),!z&&!we&&(P.fog.near=1e8,P.fog.far=1e9,Oe.intensity=2.4,Ee.intensity=.35,Ye.intensity=0),Ua++,we)(go||Oe.intensity>.01&&(mr<2500||Ua%10===0))&&(A.shadowMap.needsUpdate=!0,go=!1);else if(z){let at=Do?Math.max(ia,On):ia;(go||(pt||le())&&Ua%at===0||!Do&&pt)&&(A.shadowMap.needsUpdate=!0,go=!1)}else Oe.target.position.set(0,0,0),Oe.position.copy(it).multiplyScalar(100);let ct=zt.distanceTo(Et);m||($t.set(Math.sin(i*.21)*.6+Math.sin(i*.53+1.3)*.25,Math.sin(i*.17+2.1)*.5+Math.sin(i*.41)*.2,Math.sin(i*.13+4)*.4).multiplyScalar(ct*.002*dt),bt==="space"&&($t.x+=ro.x*2.2*dt,$t.y-=ro.y*1.4*dt,E.drift(ke,zt,$t)),zt.add($t)),G.up.copy(Go),Math.abs(G.fov-je)>5e-4&&(G.fov=je,G.updateProjectionMatrix()),G.position.copy(zt),G.lookAt(Et),z&&$(ke,N)>0?(g(ke,je),nt=wt(nt,zt.distanceTo(v(ao,Fn)),$(ke,N))):Nn(bt==="space",bt==="globe"||bt==="site"?0:cr(ke,G.aspect)),!we&&!z&&_(ke,bt==="space"),Wa.t=i,Wa.spin=Ne-i*R+(m?0:(ke+1)*.5),te.update(Wa),(bt==="space"||bt==="globe")&&ke<-.12&&te.moon.position.copy(E.moonAt(ke,Un)),bt==="space"&&Xt(i,ke),te.mars.material.uniforms.uDomes.value=1-gt(zt.distanceTo(he),14,30),ie&&(ie.update(zt),ie.group.visible=!z&&!we);let Dt=bt==="globe"?Nt((k-Y)/(ze-Y)):1;Ce.visible=!we,Ce.position.copy(zt).addScaledVector(it,1600);let Fe=Math.max(0,$t.copy(Et).sub(zt).normalize().dot(it)),st=gt(Dt,.55,1)*(.25+Fe*.9)*(z?.22*(1-gt(ne.sun.y,.02,-.04)):0);Ce.scale.setScalar(260*st+40),Ce.material.opacity=Math.min(1,st*1.3),H.strength=.6+st*.3;{let at=1-gt(nt,2,4),Ut=m?0:gt(ke,-1,-.92),qt=z?1:gt(ke,_t,oo),no=z?gt(ao,vt-.01,vt+.03):0,Ko=wt(wt(4e-4,.003+.017*at,Ut),wt(.006,.0022,no),qt),Yo=wt(wt(8e-4,.0018+.0032*at,Ut),wt(.0042,.0024,no),qt);fo.dt=a,fo.t=i,fo.focus=nt,fo.aperture=Ko/nt,fo.maxblur=w?Yo:0,fo.ca=.012,ha.k=Ko,ha.mb=Yo}if(Gn(z),we&&l.austin&&l.austin.firstElementChild){let at=Ft(l.austin.firstElementChild),Ut=Ft(t),qt=at.bottom>Ut.top&&at.top<Ut.bottom;K.scrim(((at.left+at.right)/2-Ut.left)/b,1-((at.top+at.bottom)/2-Ut.top)/n,.66*at.width/b+.05,.8*at.height/n+.07,qt?.45*(1-_e.upk):0)}else K.scrim(.5,.5,1,1,0);Se();let Vt=z?$(ke,N):0;K.edge(io.k,Io||io.col,wt(Math.max(.3,160/n),Math.max(.15,120/n),Vt),z?(Io?.42:.3)*io.k*gt(ao,vt,vt+.05)*(1-Vt):0),K.update(fo),Wn(),K.render();let eo=Nt(lt/Ie.yEnd),va=Math.round(eo*1e4),Ja=Cr();(va!==Sr||Ja!==Ar)&&(Sr=va,Ar=Ja,Xa.p=eo,Xa.beat=Ja,window.dispatchEvent(jn))}let So=window.requestIdleCallback?(a,i=700)=>requestIdleCallback(a,{timeout:i}):a=>setTimeout(a,120),Po=300,Dr=!1;function zr(){if(Dr||ne.done)return;Dr=!0;let a=i=>{if(!xo){if(i&&!i.didTimeout&&i.timeRemaining&&i.timeRemaining()<8)return So(a,Po);ne.step()?So(Zn,Po):So(a,Po)}};So(a,Po)}function Xn(){xo||(te.loadDeferred("mars"),ne.loadMaps(),zr(),w&&(Pr=O.addShrouds({next:()=>new Promise(a=>So(a,Po)),alive:()=>!xo}).catch(a=>(console.warn("TerraFirma film: no shroud.",a),null))))}let Pr=null,Kn=new e.WebGLRenderTarget(4,4,{type:e.HalfFloatType}),Lr=a=>new Promise(i=>setTimeout(i,a)),Yn=A.extensions.has("KHR_parallel_shader_compile"),Ka=new e.Object3D,qo=a=>Yn?A.compileAsync(a,G,P):(A.compile(a,G,P),Promise.resolve()),da=()=>[...Ct,Ce,...ie?[ie.group]:[],...te.entryRoots()];function Xo(a,i){let x=[O.group,Qe,...da()],m=x.map(z=>z.visible),k=A.getRenderTarget();O.group.visible=a==="site",Qe.visible=a==="colony";for(let z of da())z.visible=a==="space";A.setRenderTarget(Kn);try{return i()}finally{x.forEach((z,we)=>z.visible=m[we]),A.setRenderTarget(k),A.compile(Ka,G,P)}}function Ya(a){let i=[],x=Jt;Xo(a,()=>{a==="colony"&&ne.api.build(0,0);for(let m of a==="site"?[O.group]:a==="colony"?[Qe,...te.entryRoots()]:da())m.traverse(k=>{i.push([k,k.visible,k.frustumCulled]),k.visible=!0,k.frustumCulled=!1});try{ja(a==="site"),A.compile(Ka,G,P),A.shadowMap.needsUpdate=a!=="space",A.render(P,G)}finally{for(let[m,k,z]of i)m.visible=k,m.frustumCulled=z}}),x&&ja(x==="site"),go=!0}async function Qn(){let a=[];await fe,Xo("site",()=>a.push(qo(O.group))),Xo("space",()=>{for(let i of da())a.push(qo(i))}),await Promise.race([Promise.all(a),Lr(1500)]),Ya("site"),Ya("space"),K.warm({fx:w})}async function Zn(){if(xo)return;let a;Xo("colony",()=>{ne.api.build(0,0);let i=[];for(let x of[Qe,...te.entryRoots()])x.traverse(m=>{i.push([m,m.visible]),m.visible=!0});try{a=Promise.all([qo(Qe),...te.entryRoots().map(qo)])}finally{for(let[x,m]of i)x.visible=m}}),await Promise.race([a,Lr(1500)]),await new Promise(i=>So(i,Po)),!xo&&Jt!=="colony"&&Ya("colony")}let Jn=Promise.all([te.ready,O.ready,fe]).then(()=>Qn()).then(()=>{pr=!0,So(Xn)}),Lo=null;function kr(){b=Math.max(1,t.clientWidth),n=Math.max(1,t.clientHeight),A.setSize(b,n,!1),K.setSize(b,n),G.aspect=b/n,G.updateProjectionMatrix(),Ie=null,Mo&&(Mo=!1,G.clearViewOffset()),ge.reset()}Lo=new ResizeObserver(()=>{kr()}),Lo.observe(t),Lo.observe(r),Me&&Lo.observe(Me),document.fonts?.ready.then(()=>{Ie=null});let Qa=()=>{Ie=null};addEventListener("load",Qa);function Or(a){if(!(!ra||!pr||xo)){a=Math.max(0,a||0),se||(sa+=Math.min(a,1/15)),ge.frame(a*1e3/(Do?2:1)),D.poll(),D.begin();try{qn(Math.min(.05,a))}finally{D.end()}}}let Za=null,Br=a=>{if(Vo=requestAnimationFrame(Br),Za){Za();return}let i=na?(a-na)/1e3:1/60;na=a,Or(i)};return{ready:Jn,canvas:V,renderer:A,post:K,scene:P,cam:G,aircraft:B,flight:E,perf:ge,get shrouds(){return Pr},start(a=!1,i=null){ra||(ra=!0,kn=a,Za=i,aa=!0,na=0,a||(Vo=requestAnimationFrame(Br)))},stop(){ra=!1,Vo&&(cancelAnimationFrame(Vo),Vo=0)},step:Or,resize:kr,relayout:Qa,setOverlap(a){Do=!!a},setSeam(a){Io=a&&a.length>=3?a:null},snap(){aa=!0},tune:ee,look:fr,get freeze(){return se},set freeze(a){se=!!a},yOfClock(a){Ie||j();let i=Mt.k;return a<=-1?wt(i.yA,i.yE,Nt(a+2)):this.yOf(Math.min(a,po))},setClock(a){sa=a},yOf(a){Ie||j();let i=0,x=Ie.yEnd;for(let m=0;m<50;m++){let k=(i+x)/2;Ie.S(k)<a?i=k:x=k}return(i+x)/2},get state(){return{y:lt,v:Qt,t:sa,s:Wt,S:ke,mode:bt,beat:Cr(),colonyDone:ne.done,programs:A.info.programs.length,layout:Ie&&{yEnd:Ie.yEnd,vh:Ie.vh},touch:Ta.on,yT:Ie?-Ft(r).top:0,dof:{k:ha.k,maxblur:ha.mb,focus:fo.focus},g:+No.toFixed(4),gL:+ao.toFixed(4),over:+bo.toFixed(4),edge:+io.k.toFixed(3),end:+$(ke,N).toFixed(4),overlap:Do,seam:Io&&Io.map(a=>+a.toFixed(3)),perf:{level:ge.level,ceil:ge.ceil,p90:ge.state.p90,gpu:ge.state.gpu,capped:ge.state.capped,steps:ge.state.steps,pr:A.getPixelRatio(),post:K.getQuality(),shadow:Oe.shadow.mapSize.x,every:ia,keep:re},mars:{star:Pe.visible?+oe.uI.value.toFixed(3):0,disc:te.mars.visible},site:Wt<1?{hour:+_e.hour.toFixed(2),g:+_e.g.toFixed(3),dist:Math.round(_e.dist),world:_e.world,exp:+A.toneMappingExposure.toFixed(3)}:null}},dispose(){xo=!0,this.stop(),Lo&&Lo.disconnect(),removeEventListener("mousemove",br),ca.removeEventListener?.("change",xr),removeEventListener("load",Qa);for(let a of["Ls","Rs"])pe&&pe[a]&&(pe[a].style.transform="");B.dispose(),P.traverse(a=>{a.geometry&&a.geometry.dispose()}),D.dispose(),A.dispose(),V.remove()}}}export{Ul as createFilm};
