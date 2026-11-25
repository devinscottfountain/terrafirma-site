import{a as rr}from"./chunk-E5WEMQM4.js";import{a as nr}from"./chunk-PSG3CONO.js";import{a as Zr,b as Jr,c as Rr,e as _r}from"./chunk-TAKKMMN3.js";import{a as vo}from"./chunk-4CI7YULG.js";import"./chunk-4C5RVMER.js";import{a as ar,b as qr,c as Sa,e as Xr,f as Kr}from"./chunk-5SWZIP3G.js";import{a as Yr,b as Qr}from"./chunk-M5U4GD3X.js";import"./chunk-FCTCDFK5.js";import{m as Hr}from"./chunk-VSEMZT6Q.js";import{Clock as bs,HalfFloatType as ys,NoBlending as ws,Vector2 as en,WebGLRenderTarget as Ms}from"three";var Aa={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

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


		}`};import{ShaderMaterial as $r,UniformsUtils as xs}from"three";import{BufferGeometry as ds,Float32BufferAttribute as Er,OrthographicCamera as vs,Mesh as ms}from"three";var jt=class{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}},ps=new vs(-1,1,1,-1,0,1),sr=class extends ds{constructor(){super(),this.setAttribute("position",new Er([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new Er([0,2,0,0,2,0],2))}},gs=new sr,Yt=class{constructor(t){this._mesh=new ms(gs,t)}dispose(){this._mesh.geometry.dispose()}render(t){t.render(this._mesh,ps)}get material(){return this._mesh.material}set material(t){this._mesh.material=t}};var Vo=class extends jt{constructor(t,r){super(),this.textureID=r!==void 0?r:"tDiffuse",t instanceof $r?(this.uniforms=t.uniforms,this.material=t):t&&(this.uniforms=xs.clone(t.uniforms),this.material=new $r({name:t.name!==void 0?t.name:"unspecified",defines:Object.assign({},t.defines),uniforms:this.uniforms,vertexShader:t.vertexShader,fragmentShader:t.fragmentShader})),this.fsQuad=new Yt(this.material)}render(t,r,c){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=c.texture),this.fsQuad.material=this.material,this.renderToScreen?(t.setRenderTarget(null),this.fsQuad.render(t)):(t.setRenderTarget(r),this.clear&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),this.fsQuad.render(t))}dispose(){this.material.dispose(),this.fsQuad.dispose()}};var $o=class extends jt{constructor(t,r){super(),this.scene=t,this.camera=r,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(t,r,c){let o=t.getContext(),n=t.state;n.buffers.color.setMask(!1),n.buffers.depth.setMask(!1),n.buffers.color.setLocked(!0),n.buffers.depth.setLocked(!0);let P,b;this.inverse?(P=0,b=1):(P=1,b=0),n.buffers.stencil.setTest(!0),n.buffers.stencil.setOp(o.REPLACE,o.REPLACE,o.REPLACE),n.buffers.stencil.setFunc(o.ALWAYS,P,4294967295),n.buffers.stencil.setClear(b),n.buffers.stencil.setLocked(!0),t.setRenderTarget(c),this.clear&&t.clear(),t.render(this.scene,this.camera),t.setRenderTarget(r),this.clear&&t.clear(),t.render(this.scene,this.camera),n.buffers.color.setLocked(!1),n.buffers.depth.setLocked(!1),n.buffers.color.setMask(!0),n.buffers.depth.setMask(!0),n.buffers.stencil.setLocked(!1),n.buffers.stencil.setFunc(o.EQUAL,1,4294967295),n.buffers.stencil.setOp(o.KEEP,o.KEEP,o.KEEP),n.buffers.stencil.setLocked(!0)}},Ca=class extends jt{constructor(){super(),this.needsSwap=!1}render(t){t.state.buffers.stencil.setLocked(!1),t.state.buffers.stencil.setTest(!1)}};var za=class{constructor(t,r){if(this.renderer=t,this._pixelRatio=t.getPixelRatio(),r===void 0){let c=t.getSize(new en);this._width=c.width,this._height=c.height,r=new Ms(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:ys}),r.texture.name="EffectComposer.rt1"}else this._width=r.width,this._height=r.height;this.renderTarget1=r,this.renderTarget2=r.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new Vo(Aa),this.copyPass.material.blending=ws,this.clock=new bs}swapBuffers(){let t=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=t}addPass(t){this.passes.push(t),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(t,r){this.passes.splice(r,0,t),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(t){let r=this.passes.indexOf(t);r!==-1&&this.passes.splice(r,1)}isLastEnabledPass(t){for(let r=t+1;r<this.passes.length;r++)if(this.passes[r].enabled)return!1;return!0}render(t){t===void 0&&(t=this.clock.getDelta());let r=this.renderer.getRenderTarget(),c=!1;for(let o=0,n=this.passes.length;o<n;o++){let P=this.passes[o];if(P.enabled!==!1){if(P.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(o),P.render(this.renderer,this.writeBuffer,this.readBuffer,t,c),P.needsSwap){if(c){let b=this.renderer.getContext(),z=this.renderer.state.buffers.stencil;z.setFunc(b.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,t),z.setFunc(b.EQUAL,1,4294967295)}this.swapBuffers()}$o!==void 0&&(P instanceof $o?c=!0:P instanceof Ca&&(c=!1))}}this.renderer.setRenderTarget(r)}reset(t){if(t===void 0){let r=this.renderer.getSize(new en);this._pixelRatio=this.renderer.getPixelRatio(),this._width=r.width,this._height=r.height,t=this.renderTarget1.clone(),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=t,this.renderTarget2=t.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(t,r){this._width=t,this._height=r;let c=this._width*this._pixelRatio,o=this._height*this._pixelRatio;this.renderTarget1.setSize(c,o),this.renderTarget2.setSize(c,o);for(let n=0;n<this.passes.length;n++)this.passes[n].setSize(c,o)}setPixelRatio(t){this._pixelRatio=t,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}};import{AdditiveBlending as As,Color as on,HalfFloatType as ir,MeshBasicMaterial as Cs,ShaderMaterial as Da,UniformsUtils as an,Vector2 as mo,Vector3 as ea,WebGLRenderTarget as lr}from"three";import{Color as Ss}from"three";var tn={name:"LuminosityHighPassShader",shaderID:"luminosityHighPass",uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new Ss(0)},defaultOpacity:{value:0}},vertexShader:`

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

		}`};var Uo=class e extends jt{constructor(t,r,c,o){super(),this.strength=r!==void 0?r:1,this.radius=c,this.threshold=o,this.resolution=t!==void 0?new mo(t.x,t.y):new mo(256,256),this.clearColor=new on(0,0,0),this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let n=Math.round(this.resolution.x/2),P=Math.round(this.resolution.y/2);this.renderTargetBright=new lr(n,P,{type:ir}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let A=0;A<this.nMips;A++){let U=new lr(n,P,{type:ir});U.texture.name="UnrealBloomPass.h"+A,U.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(U);let N=new lr(n,P,{type:ir});N.texture.name="UnrealBloomPass.v"+A,N.texture.generateMipmaps=!1,this.renderTargetsVertical.push(N),n=Math.round(n/2),P=Math.round(P/2)}let b=tn;this.highPassUniforms=an.clone(b.uniforms),this.highPassUniforms.luminosityThreshold.value=o,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new Da({uniforms:this.highPassUniforms,vertexShader:b.vertexShader,fragmentShader:b.fragmentShader}),this.separableBlurMaterials=[];let z=[3,5,7,9,11];n=Math.round(this.resolution.x/2),P=Math.round(this.resolution.y/2);for(let A=0;A<this.nMips;A++)this.separableBlurMaterials.push(this.getSeperableBlurMaterial(z[A])),this.separableBlurMaterials[A].uniforms.invSize.value=new mo(1/n,1/P),n=Math.round(n/2),P=Math.round(P/2);this.compositeMaterial=this.getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=r,this.compositeMaterial.uniforms.bloomRadius.value=.1;let y=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=y,this.bloomTintColors=[new ea(1,1,1),new ea(1,1,1),new ea(1,1,1),new ea(1,1,1),new ea(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors;let V=Aa;this.copyUniforms=an.clone(V.uniforms),this.blendMaterial=new Da({uniforms:this.copyUniforms,vertexShader:V.vertexShader,fragmentShader:V.fragmentShader,blending:As,depthTest:!1,depthWrite:!1,transparent:!0}),this.enabled=!0,this.needsSwap=!1,this._oldClearColor=new on,this.oldClearAlpha=1,this.basic=new Cs,this.fsQuad=new Yt(null)}dispose(){for(let t=0;t<this.renderTargetsHorizontal.length;t++)this.renderTargetsHorizontal[t].dispose();for(let t=0;t<this.renderTargetsVertical.length;t++)this.renderTargetsVertical[t].dispose();this.renderTargetBright.dispose();for(let t=0;t<this.separableBlurMaterials.length;t++)this.separableBlurMaterials[t].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this.basic.dispose(),this.fsQuad.dispose()}setSize(t,r){let c=Math.round(t/2),o=Math.round(r/2);this.renderTargetBright.setSize(c,o);for(let n=0;n<this.nMips;n++)this.renderTargetsHorizontal[n].setSize(c,o),this.renderTargetsVertical[n].setSize(c,o),this.separableBlurMaterials[n].uniforms.invSize.value=new mo(1/c,1/o),c=Math.round(c/2),o=Math.round(o/2)}render(t,r,c,o,n){t.getClearColor(this._oldClearColor),this.oldClearAlpha=t.getClearAlpha();let P=t.autoClear;t.autoClear=!1,t.setClearColor(this.clearColor,0),n&&t.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this.fsQuad.material=this.basic,this.basic.map=c.texture,t.setRenderTarget(null),t.clear(),this.fsQuad.render(t)),this.highPassUniforms.tDiffuse.value=c.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this.fsQuad.material=this.materialHighPassFilter,t.setRenderTarget(this.renderTargetBright),t.clear(),this.fsQuad.render(t);let b=this.renderTargetBright;for(let z=0;z<this.nMips;z++)this.fsQuad.material=this.separableBlurMaterials[z],this.separableBlurMaterials[z].uniforms.colorTexture.value=b.texture,this.separableBlurMaterials[z].uniforms.direction.value=e.BlurDirectionX,t.setRenderTarget(this.renderTargetsHorizontal[z]),t.clear(),this.fsQuad.render(t),this.separableBlurMaterials[z].uniforms.colorTexture.value=this.renderTargetsHorizontal[z].texture,this.separableBlurMaterials[z].uniforms.direction.value=e.BlurDirectionY,t.setRenderTarget(this.renderTargetsVertical[z]),t.clear(),this.fsQuad.render(t),b=this.renderTargetsVertical[z];this.fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,t.setRenderTarget(this.renderTargetsHorizontal[0]),t.clear(),this.fsQuad.render(t),this.fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,n&&t.state.buffers.stencil.setTest(!0),this.renderToScreen?(t.setRenderTarget(null),this.fsQuad.render(t)):(t.setRenderTarget(c),this.fsQuad.render(t)),t.setClearColor(this._oldClearColor,this.oldClearAlpha),t.autoClear=P}getSeperableBlurMaterial(t){let r=[];for(let c=0;c<t;c++)r.push(.39894*Math.exp(-.5*c*c/(t*t))/t);return new Da({defines:{KERNEL_RADIUS:t},uniforms:{colorTexture:{value:null},invSize:{value:new mo(.5,.5)},direction:{value:new mo(.5,.5)},gaussianCoefficients:{value:r}},vertexShader:`varying vec2 vUv;
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
				}`})}getCompositeMaterial(t){return new Da({defines:{NUM_MIPS:t},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`varying vec2 vUv;
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
				}`})}};Uo.BlurDirectionX=new mo(1,0);Uo.BlurDirectionY=new mo(0,1);import{Color as zs,HalfFloatType as Ds,MeshDepthMaterial as Ps,NearestFilter as nn,NoBlending as Ls,RGBADepthPacking as ks,ShaderMaterial as Os,UniformsUtils as Fs,WebGLRenderTarget as Bs}from"three";var rn={name:"BokehShader",defines:{DEPTH_PACKING:1,PERSPECTIVE_CAMERA:1},uniforms:{tColor:{value:null},tDepth:{value:null},focus:{value:1},aspect:{value:1},aperture:{value:.025},maxblur:{value:.01},nearClip:{value:1},farClip:{value:1e3}},vertexShader:`

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

		}`};var Pa=class extends jt{constructor(t,r,c){super(),this.scene=t,this.camera=r;let o=c.focus!==void 0?c.focus:1,n=c.aperture!==void 0?c.aperture:.025,P=c.maxblur!==void 0?c.maxblur:1;this.renderTargetDepth=new Bs(1,1,{minFilter:nn,magFilter:nn,type:Ds}),this.renderTargetDepth.texture.name="BokehPass.depth",this.materialDepth=new Ps,this.materialDepth.depthPacking=ks,this.materialDepth.blending=Ls;let b=rn,z=Fs.clone(b.uniforms);z.tDepth.value=this.renderTargetDepth.texture,z.focus.value=o,z.aspect.value=r.aspect,z.aperture.value=n,z.maxblur.value=P,z.nearClip.value=r.near,z.farClip.value=r.far,this.materialBokeh=new Os({defines:Object.assign({},b.defines),uniforms:z,vertexShader:b.vertexShader,fragmentShader:b.fragmentShader}),this.uniforms=z,this.fsQuad=new Yt(this.materialBokeh),this._oldClearColor=new zs}render(t,r,c){this.scene.overrideMaterial=this.materialDepth,t.getClearColor(this._oldClearColor);let o=t.getClearAlpha(),n=t.autoClear;t.autoClear=!1,t.setClearColor(16777215),t.setClearAlpha(1),t.setRenderTarget(this.renderTargetDepth),t.clear(),t.render(this.scene,this.camera),this.uniforms.tColor.value=c.texture,this.uniforms.nearClip.value=this.camera.near,this.uniforms.farClip.value=this.camera.far,this.renderToScreen?(t.setRenderTarget(null),this.fsQuad.render(t)):(t.setRenderTarget(r),t.clear(),this.fsQuad.render(t)),this.scene.overrideMaterial=null,t.setClearColor(this._oldClearColor),t.setClearAlpha(o),t.autoClear=n}setSize(t,r){this.materialBokeh.uniforms.aspect.value=t/r,this.renderTargetDepth.setSize(t,r)}dispose(){this.renderTargetDepth.dispose(),this.materialDepth.dispose(),this.materialBokeh.dispose(),this.fsQuad.dispose()}};import{HalfFloatType as sn,LinearFilter as Vs,NearestFilter as ln,ShaderMaterial as ur,Texture as cn,UniformsUtils as fr,WebGLRenderTarget as un}from"three";import{Vector2 as cr}from"three";var ta={name:"SMAAEdgesShader",defines:{SMAA_THRESHOLD:"0.1"},uniforms:{tDiffuse:{value:null},resolution:{value:new cr(1/1024,1/512)}},vertexShader:`

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

		}`},oa={name:"SMAAWeightsShader",defines:{SMAA_MAX_SEARCH_STEPS:"8",SMAA_AREATEX_MAX_DISTANCE:"16",SMAA_AREATEX_PIXEL_SIZE:"( 1.0 / vec2( 160.0, 560.0 ) )",SMAA_AREATEX_SUBTEX_SIZE:"( 1.0 / 7.0 )"},uniforms:{tDiffuse:{value:null},tArea:{value:null},tSearch:{value:null},resolution:{value:new cr(1/1024,1/512)}},vertexShader:`

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

		}`},La={name:"SMAABlendShader",uniforms:{tDiffuse:{value:null},tColor:{value:null},resolution:{value:new cr(1/1024,1/512)}},vertexShader:`

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

		}`};var ka=class extends jt{constructor(t,r){super(),this.edgesRT=new un(t,r,{depthBuffer:!1,type:sn}),this.edgesRT.texture.name="SMAAPass.edges",this.weightsRT=new un(t,r,{depthBuffer:!1,type:sn}),this.weightsRT.texture.name="SMAAPass.weights";let c=this,o=new Image;o.src=this.getAreaTexture(),o.onload=function(){c.areaTexture.needsUpdate=!0},this.areaTexture=new cn,this.areaTexture.name="SMAAPass.area",this.areaTexture.image=o,this.areaTexture.minFilter=Vs,this.areaTexture.generateMipmaps=!1,this.areaTexture.flipY=!1;let n=new Image;n.src=this.getSearchTexture(),n.onload=function(){c.searchTexture.needsUpdate=!0},this.searchTexture=new cn,this.searchTexture.name="SMAAPass.search",this.searchTexture.image=n,this.searchTexture.magFilter=ln,this.searchTexture.minFilter=ln,this.searchTexture.generateMipmaps=!1,this.searchTexture.flipY=!1,this.uniformsEdges=fr.clone(ta.uniforms),this.uniformsEdges.resolution.value.set(1/t,1/r),this.materialEdges=new ur({defines:Object.assign({},ta.defines),uniforms:this.uniformsEdges,vertexShader:ta.vertexShader,fragmentShader:ta.fragmentShader}),this.uniformsWeights=fr.clone(oa.uniforms),this.uniformsWeights.resolution.value.set(1/t,1/r),this.uniformsWeights.tDiffuse.value=this.edgesRT.texture,this.uniformsWeights.tArea.value=this.areaTexture,this.uniformsWeights.tSearch.value=this.searchTexture,this.materialWeights=new ur({defines:Object.assign({},oa.defines),uniforms:this.uniformsWeights,vertexShader:oa.vertexShader,fragmentShader:oa.fragmentShader}),this.uniformsBlend=fr.clone(La.uniforms),this.uniformsBlend.resolution.value.set(1/t,1/r),this.uniformsBlend.tDiffuse.value=this.weightsRT.texture,this.materialBlend=new ur({uniforms:this.uniformsBlend,vertexShader:La.vertexShader,fragmentShader:La.fragmentShader}),this.fsQuad=new Yt(null)}render(t,r,c){this.uniformsEdges.tDiffuse.value=c.texture,this.fsQuad.material=this.materialEdges,t.setRenderTarget(this.edgesRT),this.clear&&t.clear(),this.fsQuad.render(t),this.fsQuad.material=this.materialWeights,t.setRenderTarget(this.weightsRT),this.clear&&t.clear(),this.fsQuad.render(t),this.uniformsBlend.tColor.value=c.texture,this.fsQuad.material=this.materialBlend,this.renderToScreen?(t.setRenderTarget(null),this.fsQuad.render(t)):(t.setRenderTarget(r),this.clear&&t.clear(),this.fsQuad.render(t))}setSize(t,r){this.edgesRT.setSize(t,r),this.weightsRT.setSize(t,r),this.materialEdges.uniforms.resolution.value.set(1/t,1/r),this.materialWeights.uniforms.resolution.value.set(1/t,1/r),this.materialBlend.uniforms.resolution.value.set(1/t,1/r)}getAreaTexture(){return"data:image/png;base64,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"}getSearchTexture(){return"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAAAhCAAAAABIXyLAAAAAOElEQVRIx2NgGAWjYBSMglEwEICREYRgFBZBqDCSLA2MGPUIVQETE9iNUAqLR5gIeoQKRgwXjwAAGn4AtaFeYLEAAAAASUVORK5CYII="}dispose(){this.edgesRT.dispose(),this.weightsRT.dispose(),this.areaTexture.dispose(),this.searchTexture.dispose(),this.materialEdges.dispose(),this.materialWeights.dispose(),this.materialBlend.dispose(),this.fsQuad.dispose()}};var aa="varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }";function hn({THREE:e,renderer:t,scene:r,cam:c,cine:o=!0,low:n=!1}){let P=t.getPixelRatio(),b=t.getSize(new e.Vector2),z=Math.max(1,Math.floor(b.x*P)),y=Math.max(1,Math.floor(b.y*P)),V={enabled:!0,shutter:.6,maxLen:.035,minPx:.35,cutDist:400,cutAngle:.7,active:!1},A={enabled:!0,min:.55,max:1.35,ref:-2.4,strength:.5,rateToBright:2.4,rateToDark:.7,linear:1,lumMin:.03,lumMax:24},U={enabled:!1,amount:.65,clamp:.15,depthTol:.06,cutAngle:.5,active:!1},N={enabled:!1,radius:.03,intensity:1,bias:.12,maxPx:48,debug:!1,active:!1},s=new za(t);class G extends jt{constructor(){super(),this.needsSwap=!1,this.useRT=!1,this.jx=0,this.jy=0,this.rt=new e.WebGLRenderTarget(z,y,{type:e.HalfFloatType,depthTexture:new e.DepthTexture(z,y)})}render(i,p,O){let D=i.autoClear;if(i.autoClear=!1,i.setRenderTarget(this.useRT?this.rt:O),i.clear(!0,!0,!0),this.jx||this.jy){let te=c.projectionMatrix.elements,Ce=te[8],E=te[9],fe=this.rt;te[8]+=2*this.jx/fe.width,te[9]+=2*this.jy/fe.height;try{i.render(r,c)}finally{te[8]=Ce,te[9]=E}}else i.render(r,c);i.autoClear=D}setSize(i,p){this.rt.setSize(i,p),this.rt.depthTexture.image.width=i,this.rt.depthTexture.image.height=p}}let k=new G;s.addPass(k);let K=`
    uniform float near; uniform float far;
    float viewZ(float d){ return (near*far)/((far-near)*d-far); } // perspective depth -> view z (negative)`,H="float ign(vec2 p){ return fract(52.9829189*fract(dot(p,vec2(0.06711056,0.00583715)))); }";class ce extends jt{constructor(){super(),this.blur=!1,this.histOk=!1,this.histVP=new e.Matrix4,this.histRel=new e.Matrix4,this.invVP=new e.Matrix4,this.w=z,this.h=y,this.hist=null,this.tmp=null,this.aoA=null,this.aoB=null;let i=(p,O)=>new e.ShaderMaterial({uniforms:p,vertexShader:aa,depthTest:!1,depthWrite:!1,fragmentShader:O});this.u={tColor:{value:null},tDepth:{value:null},invVP:{value:new e.Matrix4},prevVP:{value:new e.Matrix4},scale:{value:.5},maxLen:{value:.035},res:{value:new e.Vector2(z,y)}},this.mBlur=i(this.u,`
        uniform sampler2D tColor; uniform sampler2D tDepth; uniform mat4 invVP; uniform mat4 prevVP; uniform float scale; uniform float maxLen; uniform vec2 res; varying vec2 vUv;
        ${H}
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
          gl_FragColor=vec4(acc/n,1.); }`),this.mCopy=i({tColor:{value:null}},"uniform sampler2D tColor; varying vec2 vUv; void main(){ gl_FragColor=vec4(texture2D(tColor,vUv).rgb,1.); }"),this.uT={tColor:{value:null},tDepth:{value:null},tHist:{value:null},invVP:{value:null},histVP:{value:null},res:{value:new e.Vector2(z,y)},near:{value:1},far:{value:1e3},w:{value:.65},clampK:{value:.15},tol:{value:.06},valid:{value:0}},this.mTrail=i(this.uT,`
        uniform sampler2D tColor; uniform sampler2D tDepth; uniform sampler2D tHist; uniform mat4 invVP; uniform mat4 histVP; uniform vec2 res;
        uniform float w, clampK, tol, valid; varying vec2 vUv;
        ${K}
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
          gl_FragColor=vec4(mix(c,h,w*(1.-disocc)),zl); }`),this.uAO={tDepth:{value:null},res:{value:new e.Vector2(z,y)},near:{value:1},far:{value:1e3},pInv:{value:new e.Vector2(1,1)},projScale:{value:500},radius:{value:.02},intensity:{value:1},bias:{value:.12},maxPx:{value:48}},this.mAO=i(this.uAO,`
        uniform sampler2D tDepth; uniform vec2 res; uniform vec2 pInv; uniform float projScale, radius, intensity, bias, maxPx; varying vec2 vUv;
        ${K}
        ${H}
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
          gl_FragColor=vec4(clamp(1.-intensity*occ/3.,0.,1.),-P.z,0.,1.); }`),this.uAOB={tAO:{value:null},dir:{value:new e.Vector2(1,0)},hres:{value:new e.Vector2(z>>1,y>>1)}},this.mAOBlur=i(this.uAOB,`
        uniform sampler2D tAO; uniform vec2 dir; uniform vec2 hres; varying vec2 vUv;
        void main(){
          ivec2 p=ivec2(gl_FragCoord.xy), mx=ivec2(hres)-1; vec2 c=texelFetch(tAO,p,0).xy; float s=c.x, ws=1., k=1./(.03*c.y);
          for(int i=-4;i<=4;i++){ if(i==0) continue;
            vec2 t=texelFetch(tAO,clamp(p+ivec2(dir)*i,ivec2(0),mx),0).xy;
            float wt=exp(-float(i*i)*.125)*max(0.,1.-abs(t.y-c.y)*k); s+=t.x*wt; ws+=wt; }
          gl_FragColor=vec4(s/ws,c.y,0.,1.); }`),this.uAOC={tColor:{value:null},tDepth:{value:null},tAO:{value:null},hres:{value:new e.Vector2(z>>1,y>>1)},near:{value:1},far:{value:1e3},dbg:{value:0}},this.mAOComp=i(this.uAOC,`
        uniform sampler2D tColor; uniform sampler2D tDepth; uniform sampler2D tAO; uniform vec2 hres; uniform float dbg; varying vec2 vUv;
        ${K}
        void main(){
          vec4 c=texture2D(tColor,vUv); float d=texture2D(tDepth,vUv).x;
          if(d>=.999999){ gl_FragColor=vec4(c.rgb,1.); return; }
          float z=-viewZ(d), k=1./(.03*z);
          vec2 hp=vUv*hres-.5, f=fract(hp); ivec2 b=ivec2(floor(hp)), mx=ivec2(hres)-1;
          float s=0., ws=1e-4;                                    // joint bilateral upsample: bilinear weights x depth similarity
          for(int y=0;y<2;y++) for(int x=0;x<2;x++){
            vec2 t=texelFetch(tAO,clamp(b+ivec2(x,y),ivec2(0),mx),0).xy;
            float wt=(x==0?1.-f.x:f.x)*(y==0?1.-f.y:f.y)*max(1e-3,1.-abs(t.y-z)*k); s+=t.x*wt; ws+=wt; }
          gl_FragColor=vec4(dbg>.5 ? vec3(.6*s/ws) : c.rgb*(s/ws),1.); }`),this.fsQuad=new Yt(this.mCopy),this.taa=!1,this.direct=!1,this.outTex=null,this.mTaa=null}draw(i,p,O){this.fsQuad.material=p,i.setRenderTarget(O),this.fsQuad.render(i)}alloc(){let i=(D,te,Ce)=>new e.WebGLRenderTarget(D,te,{type:e.HalfFloatType,depthBuffer:!1,minFilter:Ce,magFilter:Ce}),p=Math.max(1,this.w>>1),O=Math.max(1,this.h>>1);(U.enabled||this.taa)&&!this.hist&&(this.hist=[i(this.w,this.h,e.LinearFilter),i(this.w,this.h,e.LinearFilter)],this.histOk=!1),N.enabled&&!this.aoA&&(this.aoA=i(p,O,e.NearestFilter),this.aoB=i(p,O,e.NearestFilter)),N.enabled&&(U.enabled||this.taa||this.blur)&&!this.tmp&&(this.tmp=i(this.w,this.h,e.LinearFilter))}render(i,p){this.alloc();let O=k.rt.depthTexture,D=k.rt.texture,te=!1,Ce=c.near,E=c.far,fe=!U.enabled&&!this.taa&&!this.blur;if(this.outTex=p?p.texture:null,N.enabled){let oe=c.projectionMatrix.elements;this.uAO.tDepth.value=O,this.uAO.near.value=Ce,this.uAO.far.value=E,this.uAO.pInv.value.set(1/oe[0],1/oe[5]),this.uAO.projScale.value=.5*this.h*oe[5],this.uAO.radius.value=N.radius,this.uAO.intensity.value=N.intensity,this.uAO.bias.value=N.bias,this.uAO.maxPx.value=N.maxPx,this.draw(i,this.mAO,this.aoA),this.uAOB.tAO.value=this.aoA.texture,this.uAOB.dir.value.set(1,0),this.draw(i,this.mAOBlur,this.aoB),this.uAOB.tAO.value=this.aoB.texture,this.uAOB.dir.value.set(0,1),this.draw(i,this.mAOBlur,this.aoA);let ze=this.uAOC;ze.tColor.value=D,ze.tDepth.value=O,ze.tAO.value=this.aoA.texture,ze.near.value=Ce,ze.far.value=E,ze.dbg.value=N.debug?1:0,this.draw(i,this.mAOComp,fe?p:this.tmp),fe?te=!0:D=this.tmp.texture}if(U.enabled){let oe=this.uT,ze=this.hist[0],Ze=this.hist[1];oe.tColor.value=D,oe.tDepth.value=O,oe.tHist.value=ze.texture,oe.invVP.value=this.invVP,oe.histVP.value=this.histRel,oe.near.value=Ce,oe.far.value=E,oe.valid.value=this.histOk?1:0,oe.w.value=Math.pow(e.MathUtils.clamp(U.amount,0,.98),e.MathUtils.clamp(Le*60,.25,4)),oe.clampK.value=U.clamp,oe.tol.value=U.depthTol,this.draw(i,this.mTrail,Ze),this.hist[0]=Ze,this.hist[1]=ze,this.histVP.copy(le),this.histOk=!0,D=Ze.texture}else if(this.taa){let oe=this.mTaa.uniforms,ze=this.hist[0],Ze=this.hist[1];oe.tColor.value=D,oe.tDepth.value=O,oe.tHist.value=ze.texture,oe.invVP.value=this.invVP,oe.histVP.value=this.histRel,oe.valid.value=this.histOk?1:0,this.draw(i,this.mTaa,Ze),this.hist[0]=Ze,this.hist[1]=ze,this.histVP.copy(le),this.histOk=!0,D=Ze.texture}this.blur?(this.u.tColor.value=D,this.u.tDepth.value=O,this.draw(i,this.mBlur,p)):!te&&this.direct?this.outTex=D:te||(this.mCopy.uniforms.tColor.value=D,this.draw(i,this.mCopy,p))}setSize(i,p){this.w=i,this.h=p,this.u.res.value.set(i,p),this.uT.res.value.set(i,p),this.uAO.res.value.set(i,p);let O=Math.max(1,i>>1),D=Math.max(1,p>>1);this.uAOB.hres.value.set(O,D),this.uAOC.hres.value.set(O,D);for(let te of[this.tmp,...this.hist||[]])te&&te.setSize(i,p);for(let te of[this.aoA,this.aoB])te&&te.setSize(O,D);this.mTaa&&this.mTaa.uniforms.res.value.set(i,p),this.histOk=!1}dispose(){for(let i of[this.tmp,this.aoA,this.aoB,...this.hist||[]])i&&i.dispose();this.hist=this.tmp=this.aoA=this.aoB=null}}let ne=new ce;ne.enabled=!1,s.addPass(ne);let $=new Pa(r,c,{focus:30,aperture:1e-4,maxblur:.002});$.materialBokeh.defines.DEPTH_PACKING=0,$.materialBokeh.needsUpdate=!0,$.renderTargetDepth.dispose(),$.render=function(d,i,p){let O=this.uniforms;O.tColor.value=ne.enabled?p.texture:k.rt.texture,O.tDepth.value=k.rt.depthTexture,O.nearClip.value=c.near,O.farClip.value=c.far,d.setRenderTarget(this.renderToScreen?null:i),this.fsQuad.render(d)},$.setSize=function(d,i){this.uniforms.aspect.value=d/i},s.addPass($);let be=o?{strength:.6,radius:.5,threshold:.72,separableBlurMaterials:[]}:new Uo(new e.Vector2(z,y),.8,.5,.72);o||s.addPass(be);class de extends jt{constructor(){super();let i=(p,O)=>new e.WebGLRenderTarget(p,p,{type:O,depthBuffer:!1,magFilter:e.NearestFilter,minFilter:e.NearestFilter});this.t64=i(64,e.HalfFloatType),this.t8=i(8,e.HalfFloatType),this.t1=i(1,e.HalfFloatType),this.sA=i(1,e.FloatType),this.sB=i(1,e.FloatType),this.first=!0,this.snap=!0,this.mDown=new e.ShaderMaterial({uniforms:{tSrc:{value:null},lumMax:{value:24},lumMin:{value:.03}},vertexShader:aa,depthTest:!1,fragmentShader:`
        uniform sampler2D tSrc; uniform float lumMax; uniform float lumMin; varying vec2 vUv;
        void main(){ vec2 base=floor(gl_FragCoord.xy)/64.; vec3 acc=vec3(0.);
          for(int y=0;y<4;y++) for(int x=0;x<4;x++){
            vec2 uv=base+(vec2(float(x),float(y))+.5)/256.;
            vec3 c=texture2D(tSrc,uv).rgb; float l=clamp(dot(c,vec3(.2126,.7152,.0722)),lumMin,lumMax);
            float k=length(uv-.5)*2.; float wt=mix(1.,.35,smoothstep(.2,1.1,k)); // centre-weighted metering
            acc+=vec3(log(l)*wt,wt,l*l*wt); }
          gl_FragColor=vec4(acc/16.,1.); }`}),this.mReduce=new e.ShaderMaterial({uniforms:{tSrc:{value:null}},vertexShader:aa,depthTest:!1,fragmentShader:`
        uniform sampler2D tSrc; varying vec2 vUv;
        void main(){ ivec2 b=ivec2(gl_FragCoord.xy)*8; vec3 acc=vec3(0.);
          for(int y=0;y<8;y++) for(int x=0;x<8;x++) acc+=texelFetch(tSrc,b+ivec2(x,y),0).rgb;
          gl_FragColor=vec4(acc/64.,1.); }`}),this.mAdapt=new e.ShaderMaterial({uniforms:{tAvg:{value:null},tPrev:{value:null},dt:{value:.016},base:{value:1.05},ref:{value:-3.2},strength:{value:.5},eMin:{value:.55},eMax:{value:1.35},up:{value:2.4},down:{value:.7},snap:{value:1},on:{value:1},lin:{value:1}},vertexShader:aa,depthTest:!1,fragmentShader:`
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
        }`}),this.fsQuad=new Yt(this.mDown),this.dt=1/60,this._cs=null,this._tm=null}pass(i,p,O){this.fsQuad.material=p,i.setRenderTarget(O),this.fsQuad.render(i)}render(i,p,O){if(this._cs!==i.outputColorSpace||this._tm!==i.toneMapping){this._cs=i.outputColorSpace,this._tm=i.toneMapping;let Ce={};e.ColorManagement.getTransfer(this._cs)===e.SRGBTransfer&&(Ce.SRGB_TRANSFER="");let E={[e.LinearToneMapping]:"LINEAR_TONE_MAPPING",[e.ReinhardToneMapping]:"REINHARD_TONE_MAPPING",[e.CineonToneMapping]:"CINEON_TONE_MAPPING",[e.ACESFilmicToneMapping]:"ACES_FILMIC_TONE_MAPPING",[e.AgXToneMapping]:"AGX_TONE_MAPPING"}[this._tm];E&&(Ce[E]=""),this.mTone.defines=Ce,this.mTone.needsUpdate=!0}A.enabled&&(this.mDown.uniforms.tSrc.value=O.texture,this.mDown.uniforms.lumMax.value=A.lumMax,this.mDown.uniforms.lumMin.value=A.lumMin,this.pass(i,this.mDown,this.t64),this.mReduce.uniforms.tSrc.value=this.t64.texture,this.pass(i,this.mReduce,this.t8),this.mReduce.uniforms.tSrc.value=this.t8.texture,this.pass(i,this.mReduce,this.t1));let D=this.mAdapt.uniforms;D.tAvg.value=this.t1.texture,D.tPrev.value=this.sA.texture,D.dt.value=Math.min(this.dt,.1),D.base.value=i.toneMappingExposure,D.ref.value=A.ref,D.strength.value=A.strength,D.eMin.value=A.min,D.eMax.value=A.max,D.up.value=A.rateToBright,D.down.value=A.rateToDark,D.lin.value=A.linear,D.snap.value=this.snap?1:0,D.on.value=A.enabled?1:0,this.snap=!1,this.pass(i,this.mAdapt,this.sB);let te=this.sA;this.sA=this.sB,this.sB=te,this.mTone.uniforms.tDiffuse.value=O.texture,this.mTone.uniforms.tExp.value=this.sA.texture,this.pass(i,this.mTone,this.renderToScreen?null:p)}}let Oe=new de;s.addPass(Oe);let we=new ka(z,y);s.addPass(we);let Ae=new Vo({uniforms:{tDiffuse:{value:null},ca:{value:.012},time:{value:0},grain:{value:.045},res:{value:new e.Vector2(z,y)}},vertexShader:"varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }",fragmentShader:`uniform sampler2D tDiffuse; uniform float ca; uniform float time; uniform float grain; uniform vec2 res; varying vec2 vUv;
    void main(){
      vec2 c=vUv-.5; float r2=dot(c,c);
      vec2 uv=.5+c*(1.-0.035*r2);              // barrel, pulls the corners in a touch
      vec2 o=c*r2*ca;                           // fringing grows toward the edges, zero at center
      vec3 col=vec3(texture2D(tDiffuse,uv+o).r, texture2D(tDiffuse,uv).g, texture2D(tDiffuse,uv-o).b);
      col*=mix(1.,smoothstep(0.75,0.12,r2*1.6),0.55); // vignette
      float n=fract(sin(dot(floor(vUv*res)+fract(time*7.31)*91.7,vec2(12.9898,78.233)))*43758.5453);
      col+=(n-.5)*grain*(1.-dot(col,vec3(.33))*0.6); // grain sits mostly in the shadows, like film
      gl_FragColor=vec4(col,1.); }`});o||s.addPass(Ae);let B=o?Ns({THREE:e,renderer:t,cam:c,composer:s,scenePass:k,mbPass:ne,dof:$,tonePass:Oe,smaa:we,bloom:be,FS_VERT:aa,low:n}):null,le=new e.Matrix4,Q=new e.Matrix4,j=new e.Matrix4,Me=new e.Matrix4,ue=new e.Matrix4,pe=new e.Vector3,De=new e.Vector3,J=new e.Quaternion,he=!1,Le=1/60,Ie=!1,ee=z;function I(d,i){t.setSize(d,i),c.aspect=d/i,c.updateProjectionMatrix();let p=t.getPixelRatio();ee=Math.max(1,Math.floor(d*p)),s.setSize(d,i),Ae.uniforms.res.value.set(d,i),Ie=!0,B&&B.setSize()}function g({dt:d=1/60,t:i=0,ca:p,focus:O,aperture:D,maxblur:te}={}){Le=Math.max(d,1e-4),Oe.dt=Le,O!==void 0&&($.uniforms.focus.value=O),D!==void 0&&($.uniforms.aperture.value=D),te!==void 0&&($.uniforms.maxblur.value=te),p!==void 0&&(Ae.uniforms.ca.value=p),Ae.uniforms.time.value=i,B&&(B.time=i);let Ce=!!B&&B.taaOn()&&!U.enabled;c.updateMatrixWorld(),le.multiplyMatrices(c.projectionMatrix,c.matrixWorldInverse),pe.setFromMatrixPosition(c.matrixWorld),Me.makeTranslation(pe.x,pe.y,pe.z),j.copy(le).invert().premultiply(ue.makeTranslation(-pe.x,-pe.y,-pe.z));let E=!1,fe=he?c.position.distanceTo(De):0,oe=he?J.angleTo(c.quaternion):0;if(he&&!Ie&&V.enabled){let et=Math.min(Math.max(O===void 0?$.uniforms.focus.value:O,3),60),Ue=c.fov*Math.PI/180,re=(oe+fe/et)/Ue*y,Be=e.MathUtils.clamp(V.shutter*(1/60)/Le,.15,2);if(fe<V.cutDist&&oe<V.cutAngle&&re*Be>V.minPx){E=!0;let Te=ne.u;Te.prevVP.value.multiplyMatrices(Q,Me),Te.invVP.value.copy(j),Te.scale.value=Be,Te.maxLen.value=V.maxLen}}let ze=U.enabled||Ce;(!ze||!he||Ie||fe>=V.cutDist||oe>=Math.min(V.cutAngle,U.cutAngle))&&(ne.histOk=!1),ze?(ne.invVP.copy(j),ne.histRel.multiplyMatrices(ne.histVP,Me)):ne.hist&&(ne.hist.forEach(et=>et.dispose()),ne.hist=null),!N.enabled&&ne.aoA&&(ne.aoA.dispose(),ne.aoB.dispose(),ne.aoA=ne.aoB=null),!N.enabled&&ne.tmp&&(ne.tmp.dispose(),ne.tmp=null),ne.blur=E,ne.taa=Ce;let Ze=E||U.enabled||N.enabled||Ce;V.active=E,U.active=U.enabled,N.active=N.enabled;let Dt=.4*$.uniforms.maxblur.value*ee>=.5;ne.enabled=Ze,$.enabled=Dt,k.useRT=Ze||Dt||!!B,B&&B.jitter(Ce),Q.copy(le),De.copy(c.position),J.copy(c.quaternion),he=!0,Ie=!1}function w(){B?B.render():s.render(Le)}function L({fx:d=!0}={}){if(B){let p=[k.enabled,ne.enabled,ne.blur,ne.taa,$.enabled,U.enabled,N.enabled];try{k.enabled=!1,ne.enabled=!0,$.enabled=!0,U.enabled=!1,N.enabled=d,ne.blur=!0,ne.taa=!0,B.render(!0,0),ne.blur=!1,ne.taa=!1,N.enabled=!1,U.enabled=d,B.render(!0,1)}finally{[k.enabled,ne.enabled,ne.blur,ne.taa,$.enabled,U.enabled,N.enabled]=p,ne.histOk=!1,Oe.snap=!0,Ie=!0}return}let i=[k.enabled,k.useRT,ne.enabled,ne.blur,$.enabled,U.enabled,N.enabled];try{k.enabled=!1,k.useRT=!0,ne.enabled=!0,$.enabled=!0,ne.blur=!0,U.enabled=N.enabled=d,s.render(1/60),ne.blur=!1,U.enabled=N.enabled=!1,s.render(1/60)}finally{[k.enabled,k.useRT,ne.enabled,ne.blur,$.enabled,U.enabled,N.enabled]=i,ne.histOk=!1,Oe.snap=!0,Ie=!0}}let R=new Float32Array(4);function X(){return t.readRenderTargetPixels(Oe.sA,0,0,1,1,R),{exposure:R[0],lnLum:R[1]}}return{composer:s,dof:$,lens:Ae,bloom:be,smaa:we,setSize:I,update:g,render:w,warm:L,motion:V,auto:A,trails:U,ao:N,resetMotion(){Ie=!0},snapExposure(){Oe.snap=!0},getExposure:X,cine:!!B,fx:B?B.fx:null,look:B?B.look:null,grade:B?B.grade:null,lensFrame:B?d=>B.lensFrame(d):()=>{},scrim:B?(d,i,p,O,D)=>B.scrim(d,i,p,O,D):()=>{},edge:B?(d,i,p,O)=>B.edge(d,i,p,O):()=>{},setQuality:B?d=>B.setQuality(d):()=>{},setPostQuality:B?d=>B.setQuality(d):()=>{},getQuality:()=>B?B.level:-1,gpuTimes:B?()=>B.gpuTimes():()=>null}}var fn=`
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
`,Us=new Set;function Ns({THREE:e,renderer:t,cam:r,composer:c,scenePass:o,mbPass:n,dof:P,tonePass:b,smaa:z,bloom:y,FS_VERT:V,low:A=!1}){let U=e.HalfFloatType,N=e.LinearFilter,s=()=>new e.WebGLRenderTarget(1,1,{type:U,depthBuffer:!1,minFilter:N,magFilter:N,generateMipmaps:!1}),G=new Yt(null),k=(re,Be)=>new e.ShaderMaterial({uniforms:Be,vertexShader:V,fragmentShader:re,depthTest:!1,depthWrite:!1}),K=(re,Be)=>{G.material=re,t.setRenderTarget(Be),G.render(t)},H={flash:0,heat:0,heatAt:null,dirt:0,streak:1,streakAdd:0,bloom:0},ce={bloom:.5,threshold:1,knee:.6,streakThr:6,streak:0,streakTint:new e.Color(.86,.92,1),vignette:.3,grain:.04,taaStill:.9,taaMove:.7},ne={expK:1,wr:1,wg:1,wb:1,contrast:1,saturation:1,lift:0,gamma:1,gain:1},$=[{aa:0,div:2,lv:3,streak:!1},{aa:1,div:2,lv:4,streak:!0},{aa:2,div:1,lv:5,streak:!0},{aa:3,div:1,lv:5,streak:!0}],be=[.46,.3,.15,.06,.03],de=-1,Oe=$[3],we=!1,Ae=0,B=s(),le=[],Q=[],j=[s(),s()];for(let re=0;re<5;re++)le.push(s()),Q.push(s());let Me=k(`
    uniform sampler2D tSrc; uniform vec2 uTexel; uniform float uThr, uKnee; varying vec2 vUv;
    vec3 tap(vec2 o){ vec3 c=texture2D(tSrc,vUv+o*uTexel).rgb; return any(isnan(c)) ? vec3(0.) : min(c,vec3(6e4)); }
    float lum(vec3 c){ return dot(c,vec3(.2126,.7152,.0722)); }
    void main(){
      vec3 a=tap(vec2(-1,-1)), b=tap(vec2(1,-1)), c=tap(vec2(-1,1)), e=tap(vec2(1,1));
      float wa=1./(1.+lum(a)), wb=1./(1.+lum(b)), wc=1./(1.+lum(c)), we=1./(1.+lum(e));   // Karis average: no fireflies
      vec3 m=(a*wa+b*wb+c*wc+e*we)/(wa+wb+wc+we);
      float l=lum(m), s=clamp(l-uThr+uKnee,0.,2.*uKnee); s=s*s/(4.*uKnee+1e-5);
      gl_FragColor=vec4(m*max(s,l-uThr)/max(l,1e-4),1.); }`,{tSrc:{value:null},uTexel:{value:new e.Vector2},uThr:{value:1},uKnee:{value:.6}}),ue=k(`
    uniform sampler2D tSrc; uniform vec2 uDir; varying vec2 vUv;
    void main(){
      vec3 c=texture2D(tSrc,vUv).rgb*.227027;
      c+=(texture2D(tSrc,vUv+uDir*1.3846154).rgb+texture2D(tSrc,vUv-uDir*1.3846154).rgb)*.3162162;
      c+=(texture2D(tSrc,vUv+uDir*3.2307692).rgb+texture2D(tSrc,vUv-uDir*3.2307692).rgb)*.0702703;
      gl_FragColor=vec4(c,1.); }`,{tSrc:{value:null},uDir:{value:new e.Vector2}}),pe=k(`
    uniform sampler2D tSrc; uniform vec2 uTexel; uniform float uThr; varying vec2 vUv;
    void main(){
      vec3 c=(texture2D(tSrc,vUv+vec2(-.5,-1.)*uTexel).rgb+texture2D(tSrc,vUv+vec2(.5,-1.)*uTexel).rgb
             +texture2D(tSrc,vUv+vec2(-.5,1.)*uTexel).rgb+texture2D(tSrc,vUv+vec2(.5,1.)*uTexel).rgb)*.25;
      float l=dot(c,vec3(.2126,.7152,.0722));
      gl_FragColor=vec4(c*max(l-uThr,0.)/max(l,1e-4),1.); }`,{tSrc:{value:null},uTexel:{value:new e.Vector2},uThr:{value:6}}),De=k(`
    uniform sampler2D tSrc; uniform float uStep; uniform float uTx; varying vec2 vUv;
    void main(){ vec3 c=texture2D(tSrc,vUv).rgb; float ws=1.;
      for(int i=1;i<=6;i++){ float w=exp(-float(i)*.42); vec2 o=vec2(float(i)*uStep*uTx,0.);
        c+=(texture2D(tSrc,vUv+o).rgb+texture2D(tSrc,vUv-o).rgb)*w; ws+=2.*w; }
      gl_FragColor=vec4(c/ws,1.); }`,{tSrc:{value:null},uStep:{value:1},uTx:{value:1}});n.mTaa=k(`
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
      gl_FragColor=vec4(max((c*wc+h*wh)/(wc+wh),vec3(0.)),1.); }`,{tColor:{value:null},tDepth:{value:null},tHist:{value:null},invVP:{value:null},histVP:{value:null},res:{value:new e.Vector2(1,1)},valid:{value:0},wStill:{value:.9},wMove:{value:.7}}),n.direct=!0;let J=Is(e),he={tDiffuse:{value:null},tExp:{value:null},tB0:{value:Q[0].texture},tB1:{value:Q[1].texture},tB2:{value:Q[2].texture},tB3:{value:Q[3].texture},tB4:{value:Q[4].texture},tS:{value:j[1].texture},tDirt:{value:J},uBw:{value:new e.Vector4},uBw4:{value:0},uBloom:{value:.3},uStreak:{value:0},uSTint:{value:ce.streakTint},uFlash:{value:0},uDirt:{value:0},uDial:{value:0},uExpK:{value:1},uWB:{value:new e.Vector3(1,1,1)},uCon:{value:1},uSat:{value:1},uLift:{value:0},uGam:{value:1},uGain:{value:1}};b.mTone=k(`
    uniform sampler2D tDiffuse, tExp, tB0, tB1, tB2, tB3, tB4, tS, tDirt; uniform vec4 uBw; uniform float uBw4, uBloom, uStreak, uFlash, uDirt; uniform vec3 uSTint;
    uniform float uDial, uExpK, uCon, uSat, uLift, uGam, uGain; uniform vec3 uWB;
    varying vec2 vUv;
    ${fn}
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
      gl_FragColor=vec4(o,1.); }`,he);let Le={tDiffuse:{value:null},res:{value:new e.Vector2(1,1)},time:{value:0},grain:{value:ce.grain},vig:{value:ce.vignette},heat:{value:0},heatAt:{value:new e.Vector2(.5,.5)},heatLocal:{value:0},fxaa:{value:0},scrim:{value:new e.Vector4(.5,.5,1,1)},scrimK:{value:0},edgeC:{value:new e.Vector3},edgeK:{value:0},edgeH:{value:.3},edgeG:{value:0}},Ie=k(`
    uniform sampler2D tDiffuse; uniform vec2 res, heatAt; uniform vec4 scrim; uniform vec3 edgeC; uniform float time, grain, vig, heat, heatLocal, fxaa, scrimK, edgeK, edgeH, edgeG; varying vec2 vUv;
    ${fn}
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
      gl_FragColor=vec4(col,1.); }`,Le),ee=1,I=1,g=1,w=1;function L(){ee=c.renderTarget1.width,I=c.renderTarget1.height,Le.res.value.set(ee,I),g=Math.max(1,ee>>Oe.div),w=Math.max(1,I>>Oe.div),B.setSize(g,w),Me.uniforms.uTexel.value.set(.5*(1<<Oe.div)/ee,.5*(1<<Oe.div)/I);let re=g,Be=w;for(let _e=0;_e<5;_e++){let Pt=Math.max(1,_e?re>>1:re),zt=Math.max(1,_e?Be>>1:Be);le[_e].setSize(Pt,zt),Q[_e].setSize(Pt,zt),re=Pt,Be=zt}let Te=Math.max(1,g>>1),tt=Math.max(1,w>>2);j[0].setSize(Te,tt),j[1].setSize(Te,tt),pe.uniforms.uTexel.value.set(1/g,1/w);let st=0;for(let _e=0;_e<Oe.lv;_e++)st+=be[_e];let mt=_e=>_e<Oe.lv?be[_e]/st:0;he.uBw.value.set(mt(0),mt(1),mt(2),mt(3)),he.uBw4.value=mt(4),n.histOk=!1}function R(re){we=!0,re=Math.max(0,Math.min(3,Math.round(+re||0))),re!==de&&(de=re,Oe=$[re],Ue.level=re,L(),Oe.aa!==3&&n.hist&&(n.hist.forEach(Be=>Be.dispose()),n.hist=null,n.histOk=!1))}let X=t.getContext(),d=X.getExtension&&X.getExtension("EXT_disjoint_timer_query_webgl2"),i={},p=[],O=!1,D=re=>{if(!O||!d)return null;let Be=X.createQuery();return X.beginQuery(d.TIME_ELAPSED_EXT,Be),[re,Be]},te=re=>{re&&(X.endQuery(d.TIME_ELAPSED_EXT),p.push(re))};function Ce(){if(!d||!p.length)return;let re=X.getParameter(d.GPU_DISJOINT_EXT);for(let Be=p.length-1;Be>=0;Be--){let[Te,tt]=p[Be];if(X.getQueryParameter(tt,X.QUERY_RESULT_AVAILABLE)){if(!re){let st=X.getQueryParameter(tt,X.QUERY_RESULT)/1e6;i[Te]=i[Te]==null?st:i[Te]*.9+st*.1}X.deleteQuery(tt),p.splice(Be,1)}}}let E=()=>c.renderTarget1,fe=()=>c.renderTarget2,oe=re=>re===E().texture?fe():E(),ze={texture:null},Ze=(re,Be)=>{let Te=1,tt=0;for(;re>0;)Te/=Be,tt+=Te*(re%Be),re=Math.floor(re/Be);return tt};function Dt(re){if(!re){o.jx=o.jy=0;return}let Be=Ae%8+1;o.jx=Ze(Be,2)-.5,o.jy=Ze(Be,3)-.5}function et(re=!1,Be=0){de<0&&(R(A?1:3),we=!1),Ae++,Ce();let Te=t,tt=re?Be?{aa:1,lv:5,streak:!0}:{aa:2,lv:5,streak:!0}:Oe,st=D("scene");o.enabled&&(o.useRT=!0,o.render(Te)),te(st);let mt=o.rt.texture;if(st=D("hdrfx"),n.enabled){let Ye=n.mTaa.uniforms;Ye.wStill.value=ce.taaStill,Ye.wMove.value=ce.taaMove,n.render(Te,E()),mt=n.outTex||E().texture}if(te(st),st=D("dof"),P.enabled){let Ye=P.uniforms,Ft=oe(mt);Ye.tColor.value=mt,Ye.tDepth.value=o.rt.depthTexture,Ye.nearClip.value=r.near,Ye.farClip.value=r.far,Te.setRenderTarget(Ft),P.fsQuad.render(Te),mt=Ft.texture}te(st),st=D("bloom"),Me.uniforms.tSrc.value=mt,Me.uniforms.uThr.value=ce.threshold,Me.uniforms.uKnee.value=ce.knee,K(Me,B);for(let Ye=0;Ye<tt.lv;Ye++){let Ft=le[Ye].width,yt=le[Ye].height;ue.uniforms.tSrc.value=Ye?Q[Ye-1].texture:B.texture,ue.uniforms.uDir.value.set(1/Ft,0),K(ue,le[Ye]),ue.uniforms.tSrc.value=le[Ye].texture,ue.uniforms.uDir.value.set(0,1/yt),K(ue,Q[Ye])}let _e=ce.streak+H.streakAdd,Pt=tt.streak&&(re||H.streak>0&&_e>0);if(Pt){pe.uniforms.tSrc.value=B.texture,pe.uniforms.uThr.value=Math.max(0,ce.streakThr-ce.threshold),K(pe,j[1]);let Ye=1/j[0].width;De.uniforms.uTx.value=Ye,De.uniforms.tSrc.value=j[1].texture,De.uniforms.uStep.value=1,K(De,j[0]),De.uniforms.tSrc.value=j[0].texture,De.uniforms.uStep.value=4,K(De,j[1]),De.uniforms.tSrc.value=j[1].texture,De.uniforms.uStep.value=16,K(De,j[0]),he.tS.value=j[0].texture}te(st),st=D("tone");let zt=y.strength;he.uBloom.value=ce.bloom*zt*(1+H.bloom),he.uStreak.value=Pt?_e*H.streak:0,he.uFlash.value=re?.5:Math.min(1,Math.max(0,H.flash)),he.uDirt.value=re?1:Math.max(0,H.dirt);let Je=ne,Ut=Je.expK!==1||Je.wr!==1||Je.wg!==1||Je.wb!==1||Je.contrast!==1||Je.saturation!==1||Je.lift!==0||Je.gamma!==1||Je.gain!==1;he.uDial.value=Ut?1:0,Ut&&(he.uExpK.value=Je.expK,he.uWB.value.set(Je.wr,Je.wg,Je.wb),he.uCon.value=Je.contrast,he.uSat.value=Je.saturation,he.uLift.value=Je.lift,he.uGam.value=1/Math.max(.05,Je.gamma),he.uGain.value=Je.gain);let kt=oe(mt);if(ze.texture=mt,b.render(Te,kt,ze),mt=kt.texture,te(st),st=D("aa"),tt.aa===2){let Ye=oe(mt);z.renderToScreen=!1,z.render(Te,Ye,kt),mt=Ye.texture}te(st),st=D("lens"),Le.tDiffuse.value=mt,Le.time.value=Ue.time,Le.fxaa.value=tt.aa===1?1:0,Le.grain.value=ce.grain,Le.vig.value=ce.vignette;let Wt=re?.5:Math.max(0,H.heat);Le.heat.value=Wt,H.heatAt?(Le.heatAt.value.set(H.heatAt[0],H.heatAt[1]),Le.heatLocal.value=1):Le.heatLocal.value=0,K(Ie,null),te(st)}let Ue={fx:H,look:ce,grade:ne,level:de,time:0,taaOn:()=>de<0?!A:Oe.aa===3,jitter:Dt,render:et,setSize:L,setQuality:R,profile(re=!0){return O=!!re&&!!d,O},scrim(re,Be,Te,tt,st){Le.scrim.value.set(re,Be,Math.max(.001,Te),Math.max(.001,tt)),Le.scrimK.value=Math.max(0,st)},edge(re,Be,Te,tt){Le.edgeK.value=Math.max(0,Math.min(1,re)),Le.edgeC.value.set(Be[0],Be[1],Be[2]),Le.edgeH.value=Math.max(.05,Te),Le.edgeG.value=Math.max(0,tt)},lensFrame({entry:re=-1,gR:Be=-1,plume:Te=null}={}){let tt=(Ye,Ft,yt)=>{let f=Math.min(1,Math.max(0,(yt-Ye)/(Ft-Ye)));return f*f*(3-2*f)},st=(Ye,Ft,yt)=>Math.exp(-(((Ye-Ft)/yt)**2)),mt=re>0&&re<1?1:0,_e=re,Pt=mt*.9*tt(.05,.22,_e)*(1-tt(.42,.62,_e)),zt=mt*.85*st(_e,.3,.045),Je=mt*.7*tt(.16,.3,_e)*(1-tt(.3,.52,_e)),Ut=mt*.6*tt(.1,.3,_e)*(1-tt(.3,.55,_e)),kt=Be>=.78?tt(.79,.83,Be):0,Wt=Be>=.78?.25*st(Be,.835,.012):0;H.heat=Math.max(Pt,Te?.55*kt:0),H.heatAt=Pt>=.55*kt||!Te?null:[Te[0],Te[1]],H.flash=Math.max(zt,Wt),H.dirt=Math.max(Je,.45*kt),H.bloom=Math.max(Ut,.25*kt),H.streak=1+.3*kt,H.streakAdd=.3*kt},gpuTimes(){O=!!d;let re={},Be=0;for(let Te in i)re[Te]=+i[Te].toFixed(3),Be+=i[Te];return re.total=+Be.toFixed(3),re.supported=!!d,re}};return L(),Us.add(Ue),Ue}function Is(e){if(typeof document>"u")return null;let t=document.createElement("canvas");t.width=512,t.height=288;let r=t.getContext("2d"),c=7,o=()=>(c=c*16807%2147483647)/2147483647;r.fillStyle="#000",r.fillRect(0,0,512,288),r.globalCompositeOperation="lighter";for(let P=0;P<90;P++){let b=o()*512,z=o()*288,y=3+o()*o()*46,V=.03+o()*.09,A=r.createRadialGradient(b,z,0,b,z,y);A.addColorStop(0,`rgba(255,238,214,${V})`),A.addColorStop(.6,`rgba(255,232,206,${V*.45})`),A.addColorStop(1,"rgba(0,0,0,0)"),r.fillStyle=A,r.beginPath(),r.arc(b,z,y,0,6.2832),r.fill()}r.lineWidth=2;for(let P=0;P<7;P++){let b=o()*512,z=o()*288,y=14+o()*30,V=.05+o()*.05;r.strokeStyle=`rgba(255,236,220,${V})`,r.beginPath();for(let A=0;A<=6;A++){let U=A/6*6.2832+.3;r[A?"lineTo":"moveTo"](b+y*Math.cos(U),z+y*Math.sin(U))}r.stroke()}let n=new e.CanvasTexture(t);return n.colorSpace=e.NoColorSpace,n}var Do=7e3,Gs=[-1,.22,-.55];function ra(e,t,r){let c=e*Math.PI/180,o=t*Math.PI/180;return new r(Math.cos(o)*Math.cos(c),Math.sin(o),-Math.cos(o)*Math.sin(c))}function Ts(e,t,r){let c=e.Vector3,o=ra(266.40499,-28.93617,c),n=ra(192.85948,27.12825,c),P=new c().crossVectors(n,o),b=t.clone().normalize(),z=r.clone().sub(b.clone().multiplyScalar(r.dot(b))).normalize(),y=new c().crossVectors(z,b),V=new e.Matrix4().makeBasis(o,P,n),U=new e.Matrix4().makeBasis(b,y,z).multiply(V.transpose());return new e.Quaternion().setFromRotationMatrix(U)}function Ws(e){let t=e.Vector3,r=new t(...Gs).normalize(),c=new t(0,1,0).addScaledVector(r,-r.y).normalize(),o=new t().crossVectors(r,c).normalize(),n=30*Math.PI/180,P=72*Math.PI/180,b=o.clone().multiplyScalar(Math.cos(n)).addScaledVector(c,Math.sin(n)),z=new t().crossVectors(r,b).normalize(),y=r.clone().multiplyScalar(Math.cos(P)).addScaledVector(b,Math.sin(P));return Ts(e,y,z)}var js=`
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
}`,qs=`
uniform float uGain; varying vec3 vCol; varying float vI;
void main(){
  float d = length(gl_PointCoord - 0.5) * 2.;
  float core = 1. - smoothstep(0., 1., d);     // round falloff (same curve as before, written with ordered edges)
  float a = core * core;
  if (a < 0.003) discard;
  gl_FragColor = vec4(vCol * vI * a * uGain, 1.);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`,Xs="varying vec3 vDir; void main(){ vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }",Ks=`
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
}`,Ys=js.replace("gl_PointSize = s * uPx;","float ps = s * uPx, pw = max(ps, 2.2); vI *= (ps * ps) / (pw * pw) * 1.25; gl_PointSize = pw;"),Qs=qs.replace(`float core = 1. - smoothstep(0., 1., d);     // round falloff (same curve as before, written with ordered edges)
  float a = core * core;`,"float a = exp(-d * d * 4.5);"),Zs=`
attribute float aI; uniform float uPx; varying float vI;
void main(){ vI = aI; gl_PointSize = 2.0 * uPx; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,Js=`
varying float vI;
void main(){ float d = length(gl_PointCoord - 0.5) * 2.; float a = exp(-d * d * 3.); if (a < 0.01) discard;
  gl_FragColor = vec4(vec3(1., 0.93, 0.86) * vI * a, 1.);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;async function dn({THREE:e,scene:t,starsUrl:r,milkyUrl:c,rotation:o=null,milkyWay:n=!0,milkyWayIntensity:P=.3,starGain:b=1,pixelRatio:z=null}={}){P*=1.7;let V=e.Vector3,A=new e.Group;A.name="sky",A.frustumCulled=!1,o&&o.isQuaternion?A.quaternion.copy(o):o&&o.isEuler?A.setRotationFromEuler(o):Array.isArray(o)?A.rotation.set(o[0],o[1],o[2]):A.quaternion.copy(Ws(e));let U=await(await fetch(r)).arrayBuffer(),N=new Float32Array(U),s=N.length/5,G=new Float32Array(s*3),k=new Float32Array(s),K=new Float32Array(s);for(let de=0;de<s;de++)G[de*3]=N[de*5]*Do,G[de*3+1]=N[de*5+1]*Do,G[de*3+2]=N[de*5+2]*Do,k[de]=N[de*5+3],K[de]=N[de*5+4];let H=new e.BufferGeometry;H.setAttribute("position",new e.BufferAttribute(G,3)),H.setAttribute("aMag",new e.BufferAttribute(k,1)),H.setAttribute("aBV",new e.BufferAttribute(K,1));let ce=new e.ShaderMaterial({vertexShader:Ys,fragmentShader:Qs,uniforms:{uPx:{value:z||Math.min(window.devicePixelRatio||1,2)},uGain:{value:b}},transparent:!0,blending:e.AdditiveBlending,depthWrite:!1,depthTest:!0,fog:!1}),ne=new e.Points(H,ce);ne.frustumCulled=!1,ne.renderOrder=-9,ne.name="sky-stars",A.add(ne);{let de=ra(192.85948,27.12825,V),Oe=26e3,we=new Float32Array(Oe*3),Ae=new Float32Array(Oe),B=new V,le=99,Q=()=>(le=le*16807%2147483647)/2147483647;for(let ue=0,pe=0;ue<Oe;pe++){B.set(Q()*2-1,Q()*2-1,Q()*2-1);let De=B.length();if(De>1||De<.05)continue;B.divideScalar(De);let J=Math.abs(B.dot(de));Q()>.12+.88*Math.exp(-J*J/.02)||(we[ue*3]=B.x*Do*.995,we[ue*3+1]=B.y*Do*.995,we[ue*3+2]=B.z*Do*.995,Ae[ue]=.035+.11*Math.pow(Q(),3),ue++)}let j=new e.BufferGeometry;j.setAttribute("position",new e.BufferAttribute(we,3)),j.setAttribute("aI",new e.BufferAttribute(Ae,1));let Me=new e.Points(j,new e.ShaderMaterial({vertexShader:Zs,fragmentShader:Js,uniforms:{uPx:ce.uniforms.uPx},transparent:!0,blending:e.AdditiveBlending,depthWrite:!1,depthTest:!0,fog:!1}));Me.frustumCulled=!1,Me.renderOrder=-9,Me.name="sky-starhaze",A.add(Me)}let $=null;if(n){let de=await vo(e,c,{flipY:!0}).catch(()=>null);if(de){de.colorSpace=e.SRGBColorSpace,de.anisotropy=4,de.wrapS=e.RepeatWrapping;let Oe=ra(192.85948,27.12825,V),we=ra(266.40499,-28.93617,V),Ae=new V().crossVectors(Oe,we),B=new e.ShaderMaterial({vertexShader:Xs,fragmentShader:Ks,side:e.BackSide,uniforms:{map:{value:de},gc:{value:we},gy:{value:Ae},ngp:{value:Oe},uInt:{value:P},uSat:{value:.8},uTexel:{value:new e.Vector2(1/de.image.width,1/de.image.height)}},depthWrite:!1,depthTest:!1,fog:!1});$=new e.Mesh(new e.SphereGeometry(Do*.99,64,32),B),$.frustumCulled=!1,$.renderOrder=-10,$.name="sky-milkyway",A.add($)}}return t.add(A),{group:A,stars:ne,milkyWay:$,update:de=>{A.position.copy(de)},starCount:s,starMaterial:ce}}var Rs=`
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
`,vn=`
float ah(vec2 p){ p = fract(p * vec2(443.897, 441.423)); p += dot(p, p.yx + 19.19); return fract((p.x + p.y) * p.x); }
float ah3(vec3 p){ p = fract(p * 0.3183099 + .1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float an(vec2 x){ vec2 i = floor(x), f = fract(x); f = f * f * (3. - 2. * f);
  return mix(mix(ah(i), ah(i + vec2(1, 0)), f.x), mix(ah(i + vec2(0, 1)), ah(i + vec2(1, 1)), f.x), f.y); }
// fbm with each octave faded to its mean as it nears the pixel footprint (fw = footprint in units of the base octave): no shimmer
float afbm(vec2 p, float fw){ float v = 0., a = .5; for (int i = 0; i < 5; i++){ float k = 1. - smoothstep(.25, .6, fw); v += a * mix(.5, an(p), k); p = p * 2.03 + 17.1; fw *= 2.03; a *= .5; } return v; }
`,_s=`
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
}`,Hs="varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }",hr=`
${vn}
${Rs}
${_s}
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
}`,Es=`
uniform vec3 uSun, uOrigin; uniform float uK, uNight, uT, uAmb, uFogN, uFogF;
varying vec3 vW;
${hr}
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
}`,$s="varying vec2 vS; void main(){ vS = position.xy; gl_Position = vec4(position.xy, 0., 1.); }",ei=`
uniform float uE, uT, uAsp, uFlow; uniform vec3 uSky, uLit; uniform vec2 uSunS;
varying vec2 vS;
${vn}
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
}`;function mn({THREE:e,origin:t=new e.Vector3(0,-6e3,0)}={}){let r=e.MathUtils.smoothstep,c=ce=>Math.min(1,Math.max(0,ce)),o={uSun:{value:new e.Vector3(-.9,.33,-.2).normalize()},uOrigin:{value:t.clone()},uK:{value:1},uNight:{value:0},uT:{value:0},uAmb:{value:1},uFogN:{value:500},uFogF:{value:4200}},n=new e.Mesh(new e.SphereGeometry(6e3,64,32),new e.ShaderMaterial({vertexShader:Hs,fragmentShader:Es,uniforms:o,side:e.BackSide,depthWrite:!1,depthTest:!1,fog:!1}));n.frustumCulled=!1,n.renderOrder=-20,n.visible=!1,n.name="mars-air-dome";let P={uE:{value:0},uT:{value:0},uAsp:{value:1},uFlow:{value:0},uSky:{value:new e.Color(.9,.6,.38)},uLit:{value:new e.Color(1.2,.8,.5)},uSunS:{value:new e.Vector2(-1,.4)}},b=new e.BufferGeometry;b.setAttribute("position",new e.BufferAttribute(new Float32Array([-1,-1,0,3,-1,0,-1,3,0]),3));let z=new e.Mesh(b,new e.ShaderMaterial({vertexShader:$s,fragmentShader:ei,uniforms:P,transparent:!0,depthWrite:!1,depthTest:!1,fog:!1,blending:e.CustomBlending,blendEquation:e.AddEquation,blendSrc:e.OneFactor,blendDst:e.OneMinusSrcAlphaFactor}));z.frustumCulled=!1,z.renderOrder=999,z.visible=!1,z.name="mars-air-veil";let y=new e.Color,V=(ce,ne,$,be)=>{let de=$.y,Oe=ne.x*$.x+ne.y*$.y+ne.z*$.z,we=Math.max(ne.y,0),Ae=Math.max(Oe,0),B=r(de,-.1,.12),le=r(de,-.32,0),Q=r(Math.pow(we,.42),0,1);ce.setRGB(.9+(.34-.9)*Q,.62+(.205-.62)*Q,.4+(.13-.4)*Q);let j=.68+.55*Ae**4+.4*Ae**30;j*=.38+.62*r(Oe,-.7,.7)+(1-(.38+.62*r(Oe,-.7,.7)))*r(de,.08,.45),j*=.11*le+(1-.11*le)*B,j*=.75+.25*r(de,-.3,.6),ce.multiplyScalar(j);let Me=(Ae**90*2.2+Ae**16*.45+Ae**5*.08)*le*(.95+(.3-.95)*B);ce.r+=.3*Me+.0022,ce.g+=.5*Me+.0028,ce.b+=.98*Me+.0055;let ue=Math.pow(be,2.6)+(Math.pow(be,.6)-Math.pow(be,2.6))*Math.exp(-we*7);return ce.multiplyScalar(ue),ce},A=new e.Vector3,U=new e.Vector3,N=new e.Vector3,s=(ce,ne=o.uSun.value,$=o.uK.value,be=null)=>{ce.setRGB(0,0,0);let de=0;for(let Oe=0;Oe<8;Oe++){let we=Oe/8*Math.PI*2;A.set(Math.cos(we),.03,Math.sin(we)).normalize();let Ae=be?1+Math.max(0,A.x*be.x+A.z*be.z)*2:1;V(y,A,ne,$),ce.r+=y.r*Ae,ce.g+=y.g*Ae,ce.b+=y.b*Ae,de+=Ae}return ce.multiplyScalar(1/de)},G=ce=>(A.set(0,1,0),V(ce,A,o.uSun.value,1),s(y),ce.lerp(y,.5)),k={e:0,flow:0,prevE:0};function K(ce,ne={}){ce=c(ce);let{inCol:$=!1,cam:be=null,t:de=0,dt:Oe=0,alt:we=0,fog:Ae=null,sunDir:B=null,night:le=0}=ne;if(k.flow+=(Oe||0)*.12+Math.abs(ce-k.prevE)*4,k.prevE=ce,k.e=ce,P.uE.value=ce,P.uT.value=de,P.uFlow.value=k.flow,be&&(P.uAsp.value=be.aspect||1),z.visible=ce>.005&&ce<.7,B&&o.uSun.value.copy(B).normalize(),o.uNight.value=le,o.uT.value=de,o.uK.value=$?.35+.65*r(ce,.3,.52):0,o.uAmb.value=1-.85*le,n.visible=!!$,be&&$&&(n.position.copy(be.position),n.updateMatrixWorld()),s(P.uSky.value,o.uSun.value,1),P.uSky.value.lerp(y.setRGB(.55,.22,.12),1-r(ce,.22,.4)),P.uLit.value.copy(P.uSky.value).multiplyScalar(1.9),be&&(U.copy(o.uSun.value).transformDirection(be.matrixWorldInverse),P.uSunS.value.set(U.x,U.y).normalize()),Ae&&$){be&&be.getWorldDirection(N),s(Ae.color,o.uSun.value,o.uK.value,be?N:null);let Q=Math.max(0,we),j=r(ce,.45,1);Ae.near=500+Q*1.5*(1-j*.5),Ae.far=Math.max(4200,(4200+Q*6)*(.55+.45*j)),o.uFogN.value=Ae.near,o.uFogF.value=Ae.far}}return{dome:n,veil:z,entry:K,roots:()=>[z,n],hemi:G,horizon:s,skyAt:V,state:k,uniforms:{dome:o,veil:P}}}var na=`
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
`,Oa=`
varying vec3 vP; varying vec2 vUv; varying vec3 vV;
void main(){
  vP = position; vUv = uv;
  mat3 M = mat3(modelMatrix); vec4 w = modelMatrix * vec4(position, 1.);
  vV = transpose(M) * (cameraPosition - w.xyz);           // view vector in object space (meshes only rotate)
  gl_Position = projectionMatrix * viewMatrix * w;
}`,ti=`
uniform sampler2D tMap, tSpec, tNorm, tLights, tClouds;
uniform vec3 uSun; uniform float uGrow, uCloudOff, uCloudH, uSunI;
varying vec3 vP; varying vec2 vUv; varying vec3 vV;
${na}
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
}`,oi=`
uniform sampler2D tClouds; uniform vec3 uSun; uniform float uSunI; uniform sampler2D tLights; uniform vec4 uHole;
varying vec3 vP; varying vec2 vUv; varying vec3 vV;
${na}
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
}`,ai=`
uniform sampler2D tMap, tNorm; uniform vec3 uSun; uniform float uSunI, uAlbedo, uRelief;
varying vec3 vP; varying vec2 vUv; varying vec3 vV;
${na}
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
}`,ri=`
uniform sampler2D tMap, tNorm; uniform vec3 uSun; uniform float uSunI, uRelief, uDomes, uBump, uR;
varying vec3 vP; varying vec2 vUv; varying vec3 vV;
${na}
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
}`,ni=`
varying vec3 vN; varying vec3 vO;
void main(){ vN = normal; vO = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,si=`
uniform vec3 uSun; uniform float uSunI, uA;
varying vec3 vN; varying vec3 vO;
${na}
void main(){
  vec3 N = normalize(vN), L = normalize(uSun);
  float n = fbm3(vO * 9.);
  vec3 alb = vec3(0.075, 0.064, 0.056) * (0.8 + 0.4 * n);
  float m0 = max(dot(N, L), 0.);
  vec3 col = alb * m0 * uSunI * 2.2 + alb * 0.02;
  gl_FragColor = vec4(col * uA, uA);
}`,ii=`
varying vec3 vW;
void main(){ vec4 w = modelMatrix * vec4(position, 1.); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,pn=`
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
}`;function gn({THREE:e,scene:t,renderer:r,toSun:c,EARTH:o,MOON:n,MARS:P,files:b}){let A=Math.min(8,r.capabilities.getMaxAnisotropy()),U=[],N={moon:[],mars:[]},s={},G=(d,i,p,O)=>{let D=new e.DataTexture(new Uint8Array([d,i,p,255]),1,1);return D.colorSpace=O?e.SRGBColorSpace:e.NoColorSpace,D.needsUpdate=!0,D},k=(d,i)=>vo(e,d,{flipY:!0,colorSpace:i?e.SRGBColorSpace:e.NoColorSpace}).then(p=>(p.anisotropy=A,p.wrapS=e.RepeatWrapping,p.needsUpdate=!0,p),()=>null),K=d=>{if(d&&r&&r.initTexture)try{r.initTexture(d)}catch{}},H=(d,i,p,O)=>{let D={value:p},te=b[d];if(!te)return D;let Ce=E=>{E&&(K(E),D.value=E)};return O?N[O].push(()=>k(te,i).then(E=>({t:E,swap:Ce}))):U.push(k(te,i).then(Ce)),D},ce=()=>new Promise(d=>typeof requestAnimationFrame=="function"?requestAnimationFrame(()=>d()):setTimeout(d,0));function ne(d){return s[d]?s[d]:s[d]=Promise.all(N[d].map(i=>i())).then(async i=>{for(let{t:p,swap:O}of i)p&&(O(p),await ce())})}let $=()=>({value:new e.Vector3().copy(c)}),be={tMap:H("earth",!0,G(10,30,70,!0)),tSpec:H("earthSpec",!1,G(255,255,255)),tNorm:H("earthNorm",!1,G(128,128,255)),tLights:H("earthLights",!1,G(0,0,0)),tClouds:H("clouds",!1,G(0,0,0)),uSun:$(),uGrow:{value:.03},uCloudOff:{value:0},uCloudH:{value:.0085},uSunI:{value:3.3}},de=new e.Mesh(new e.SphereGeometry(10,192,96),new e.ShaderMaterial({vertexShader:Oa,fragmentShader:ti,uniforms:be}));de.position.copy(o),t.add(de);let Oe={tClouds:be.tClouds,tLights:be.tLights,uSun:$(),uSunI:be.uSunI,uHole:{value:new e.Vector4(0,1,0,0)}},we=new e.Mesh(new e.SphereGeometry(10*1.0085,160,80),new e.ShaderMaterial({vertexShader:Oa,fragmentShader:oi,uniforms:Oe,transparent:!0,depthWrite:!1}));we.position.copy(o),we.renderOrder=1,t.add(we);let Ae={tMap:H("moon",!0,G(150,150,150,!0),"moon"),tNorm:H("moonNorm",!1,G(128,128,255),"moon"),uSun:$(),uSunI:{value:3.3},uAlbedo:{value:.3},uRelief:{value:1.35}},B=new e.Mesh(new e.SphereGeometry(2.7,128,64),new e.ShaderMaterial({vertexShader:Oa,fragmentShader:ai,uniforms:Ae}));B.position.copy(n),t.add(B);let le={tMap:H("mars",!0,G(150,70,40,!0),"mars"),tNorm:H("marsNorm",!1,G(128,128,255),"mars"),uSun:$(),uSunI:{value:2.2},uRelief:{value:1.25},uDomes:{value:1}};le.uBump={value:11},le.uR={value:6};let Q=new e.Mesh(new e.SphereGeometry(6*1.015,192,96),new e.ShaderMaterial({vertexShader:Oa,fragmentShader:ri,uniforms:le,transparent:!0,blending:e.CustomBlending,blendEquation:e.AddEquation,blendSrc:e.OneFactor,blendDst:e.OneMinusSrcAlphaFactor}));Q.position.copy(P),t.add(Q),Q.renderOrder=1;let j=null;{let d=new e.IcosahedronGeometry(1,4),i=d.attributes.position,p=new e.Vector3,O=(Ue,re,Be)=>{let Te=Math.sin(Ue*12.9898+re*78.233+Be*37.719)*43758.5453;return Te-Math.floor(Te)};for(let Ue=0;Ue<i.count;Ue++){p.fromBufferAttribute(i,Ue);let re=1+.1*Math.sin(p.x*3.1+1)*Math.cos(p.y*2.3)+.06*Math.sin(p.z*5.3+p.x*2);re-=.22*Math.exp(-p.distanceToSquared({x:.85,y:.25,z:.46})/.09),re-=.05*O(Math.round(p.x*6),Math.round(p.y*6),Math.round(p.z*6)),p.multiplyScalar(re),p.x*=1.25,p.z*=.88,i.setXYZ(Ue,p.x,p.y,p.z)}d.computeVertexNormals();let D={uSun:{value:new e.Vector3(1,0,0)},uSunI:le.uSunI,uA:{value:1}};j=new e.Mesh(d,new e.ShaderMaterial({vertexShader:ni,fragmentShader:si,uniforms:D,transparent:!0,blending:e.CustomBlending,blendEquation:e.AddEquation,blendSrc:e.OneFactor,blendDst:e.OneMinusSrcAlphaFactor})),j.frustumCulled=!1,j.renderOrder=1,j.matrixAutoUpdate=!1,Q.add(j);let te=new e.Vector3(30,10,38).normalize(),Ce=new e.Vector3(0,1,0).addScaledVector(te,-te.y).normalize(),E=new e.Vector3().crossVectors(Ce,te),fe=Ce.clone().multiplyScalar(.85).addScaledVector(E,.55).normalize(),oe=new e.Quaternion,ze=new e.Vector3,Ze=new e.Vector3,Dt=new e.Euler,et=new e.Quaternion;j.alpha=1,j.size=.12,j.orbit=1.75*6,j.phase=null,j.onBeforeRender=(Ue,re,Be)=>{let Te=j.phase??.3+.18*Math.sin(Me*.011);Ze.copy(fe).multiplyScalar(Math.cos(Te)).addScaledVector(te,Math.sin(Te)).multiplyScalar(j.orbit).add(Q.position),Dt.set(.3,Me*.05,.2),oe.setFromEuler(Dt),j.matrixWorld.compose(Ze,oe,ze.setScalar(j.size)),et.copy(oe).invert(),D.uSun.value.copy(le.uSun.value).applyQuaternion(Q.quaternion).applyQuaternion(et);let tt=Be.position.distanceTo(Q.position);D.uA.value=j.alpha*e.MathUtils.smoothstep(tt,13,20)}}let Me=0,ue=(d,i,p)=>{let O={uCenter:{value:d.clone()},uSun:{value:new e.Vector3().copy(c)},uRp:{value:i},uRa:{value:i*p.top},uBetaR:{value:new e.Vector3(...p.bR).divideScalar(i)},uBetaM:{value:new e.Vector3(...p.bM).divideScalar(i)},uBetaMe:{value:new e.Vector3(...p.bMe).divideScalar(i)},uG:{value:new e.Vector3(...p.g)},uSunCol:{value:new e.Vector3(...p.sun)},uHr:{value:p.Hr*i},uHm:{value:p.Hm*i},uK:{value:p.k}},D=new e.Mesh(new e.SphereGeometry(i*p.top,128,64),new e.ShaderMaterial({vertexShader:ii,fragmentShader:p.frag||pn,uniforms:O,transparent:!0,depthWrite:!1,blending:e.CustomBlending,blendEquation:e.AddEquation,blendSrc:e.OneFactor,blendDst:e.OneMinusSrcAlphaFactor}));return D.position.copy(d),D.renderOrder=2,t.add(D),D},pe=ue(o,10,{top:1.1,Hr:.0085,Hm:.0034,bR:[8,19,48],bM:[24,24,24],bMe:[27,27,27],g:[.8,.8,.8],sun:[1,.97,.92],k:15}),De=ue(P,6,{top:1.07,Hr:.0075,Hm:.012,bR:[3,7,18],bM:[5,3.4,1.8],bMe:[6,5,4.4],g:[.55,.72,.9],sun:[1,.95,.88],k:12,frag:pn.replace("clamp(1. - tr, 0., 1.) * 0.85","clamp(1. - tr, 0., 1.) * 0.25")}),J=[pe,De],he=new e.Quaternion,Le=new e.Vector3,Ie=(d,i)=>{he.copy(d.quaternion).invert(),i.value.copy(c).applyQuaternion(he)},ee=.012,I=.0158,g=new e.Quaternion,w=new e.Vector3;function L({t:d=0,intro:i=1,camPos:p,spin:O=0,hole:D}={}){if(de.rotation.y=O+d*ee,we.rotation.y=O+d*I,D&&(we.updateMatrixWorld(),g.copy(we.quaternion).invert(),w.copy(D).applyQuaternion(g),Oe.uHole.value.set(w.x,w.y,w.z,1)),B.rotation.y=d*.01,Q.rotation.y=d*.02,Me=d,Ie(de,be.uSun),Ie(we,Oe.uSun),Ie(B,Ae.uSun),Ie(Q,le.uSun),be.uCloudOff.value=(de.rotation.y-we.rotation.y)/(2*Math.PI),be.uGrow.value=.03+.97*i,p)for(let te of J){let E=Le.copy(p).sub(te.position).length()<te.material.uniforms.uRa.value*1.002?e.BackSide:e.FrontSide;te.material.side!==E&&(te.material.side=E,te.material.needsUpdate=!0)}}let R=null;return R=mn({THREE:e}),t.add(R.dome,R.veil),{earth:de,moon:B,mars:Q,clouds:we,earthAtmo:pe,marsAtmo:De,phobos:j,air:R,entry:R?(d,i)=>R.entry(d,i):void 0,entryRoots:R?R.roots:void 0,ready:Promise.all(U),loadDeferred:ne,update:L}}var Vt=e=>Math.min(1,Math.max(0,e)),gt=(e,t,r)=>e<=t?0:e>=r?1:(e=(e-t)/(r-t),e*e*(3-2*e)),eo=e=>1-Math.pow(1-Vt(e),3),Xt=e=>e*e*e*(e*(e*6-15)+10),bt=(e,t,r)=>e+(t-e)*r;function co(e,t,r,c){let o=e.length,n=[],P=[],b=new Array(o);if(o===2){let y=(t[1]-t[0])/(e[1]-e[0]||1);return V=>V>=e[1]?t[1]:t[0]+y*(V-e[0])}for(let y=0;y<o-1;y++)n[y]=e[y+1]-e[y],P[y]=(t[y+1]-t[y])/n[y];for(let y=1;y<o-1;y++)if(P[y-1]*P[y]<=0)b[y]=0;else{let V=2*n[y]+n[y-1],A=n[y]+2*n[y-1];b[y]=(V+A)/(V/P[y-1]+A/P[y])}let z=(y,V,A,U)=>{let N=((2*y+V)*A-y*U)/(y+V);return Math.sign(N)!==Math.sign(A)?N=0:Math.sign(A)!==Math.sign(U)&&Math.abs(N)>3*Math.abs(A)&&(N=3*A),N};return b[0]=r!==void 0?r*P[0]:z(n[0],n[1],P[0],P[1]),b[o-1]=c!==void 0?c*P[o-2]:z(n[o-2],n[o-3],P[o-2],P[o-3]),y=>{if(y<=e[0])return t[0]+b[0]*(y-e[0]);if(y>=e[o-1])return t[o-1];let V=0;for(;y>e[V+1];)V++;let A=(y-e[V])/n[V],U=A*A,N=U*A;return(2*N-3*U+1)*t[V]+(N-2*U+A)*n[V]*b[V]+(-2*N+3*U)*t[V+1]+(N-U)*n[V]*b[V+1]}}function dr(e,t,r){let c=e.length,o=[],n=[],P=r?r.slice():new Array(c).fill(null);for(let b=0;b<c-1;b++)o[b]=e[b+1]-e[b],n[b]=(t[b+1]-t[b])/o[b];for(let b=0;b<c;b++)if(P[b]==null){if(b===0||b===c-1){P[b]=0;continue}if(n[b-1]*n[b]<=0)P[b]=0;else{let z=2*o[b]+o[b-1],y=o[b]+2*o[b-1];P[b]=(z+y)/(z/n[b-1]+y/n[b])}}return b=>{if(b<=e[0])return t[0];if(b>=e[c-1])return t[c-1];let z=0;for(;b>e[z+1];)z++;let y=(b-e[z])/o[z],V=y*y,A=V*y;return(2*A-3*V+1)*t[z]+(A-2*V+y)*o[z]*P[z]+(-2*A+3*V)*t[z+1]+(A-V)*o[z]*P[z+1]}}function Fa(e){return co(e.map(t=>t[0]),e.map(t=>t[1]))}function vr(e,t,r,c){e.arcLengthDivisions=Math.max(e.arcLengthDivisions,4e3),e.needsUpdate=!0;let o=e.getLengths(),n=t.length,P=o[o.length-1],b=y=>{let V=y*(o.length-1),A=Math.floor(V);return A>=o.length-1?P:o[A]+(o[A+1]-o[A])*(V-A)},z=co(t,t.map((y,V)=>b(V/(n-1))),r,c);return y=>e.getUtoTmapping(0,Math.min(P,Math.max(0,z(y))))}function Ba(e,t,r,c,o,n){let P=e.shadow.camera,b=e.shadow.mapSize,z=(P.right-P.left)/b.x,y=(P.top-P.bottom)/b.y;o.set(0,1,0).cross(r).normalize(),n.copy(r).cross(o);let V=t.dot(o),A=t.dot(n);e.target.position.copy(t).addScaledVector(o,Math.round(V/z)*z-V).addScaledVector(n,Math.round(A/y)*y-A),e.position.copy(e.target.position).addScaledVector(r,c)}function xn({THREE:e,SITE_ROT:t,AUS:r,U_PER_M:c,C0:o,L0:n,spaceCam:P}){let s=Math.log(65e4),G=Math.log(o.distanceTo(r)/c),k=s,K=r.clone().normalize(),H=K.clone().negate(),ce=o.clone().sub(r).normalize(),ne=o.distanceTo(r),$=()=>new e.Vector3,be=new e.Quaternion,de=new e.Quaternion,Oe=$(),we=$(),Ae=$(),B=$(),le=$(),Q=$(),j=$(),Me=$(),ue={},pe=null,De=null,J=null,he=null,Le=(I,g,w,L)=>{for(let R=0;R<60;R++){let X=(w+L)/2;I(X)<g?w=X:L=X}return(w+L)/2};function Ie(I){he=I;let{yA:g,yT:w,yX:L,yE:R,S:X}=he,d=.5,i=(-3*X(R)+4*X(R+d)-X(R+2*d))/(2*d);P(-1,Oe,B),P(X(R+d),we,B),P(X(R+2*d),Ae,B);let p=Oe.clone().multiplyScalar(-3).addScaledVector(we,4).addScaledVector(Ae,-1).divideScalar(2*d),O=p.dot(ce),D=Math.max(O,1e-6);ue.dSdy=i,ue.v0=p.length(),ue.r0=O,ue.r=D;let te=L+.46*(R-L),Ce=L+.64*(R-L),E=L+.82*(R-L),fe=D/ne,oe=.4/(R-E);pe=co([g,w,L,te,Ce,E,R],[125,170,290,4e4].map(Math.log).concat(G-1.4,G-.4,G),.7,fe/oe),ue.yH=Le(pe,s,g,R),Me.copy(p).addScaledVector(ce,-O),Q.copy(Me).multiplyScalar((R-ue.yH)/ne);let ze=Ze=>Le(pe,Math.log(Ze),g,R);De=co([g,w,L,ze(1600),ze(7e3),ze(4e4)],[7.9,10.2,13.4,17.9,18.95,19.6],void 0,0),J=co([g,w,L,ze(1600),ze(3e4)],[0,.3,.52,.8,1],void 0,0),Object.assign(ue,{yA:g,yT:w,yX:L,yM:te,yE:R,LAMH:s,LAM1:G,lamA:pe(g),yNight:ze(4e4),yG1:ze(3e4)})}function ee(I,g){let{yA:w,yE:L}=he,R=Math.min(Math.max(I,w),L),X=pe(R),d=Math.exp(X);if(g.lam=X,g.s=Vt((I-w)/(L-w)),g.fov=38,g.hour=De(R),g.g=Math.min(1,J(R)),R<ue.yH){let D=Xt(Vt((X-ue.lamA)/(k-ue.lamA))),te=e.MathUtils.lerp(-.08+.16*(R-w)/(L-w),t,D),Ce=e.MathUtils.degToRad(56+34*D);return g.look.set(0,0,-10*(1-D)),g.pos.set(Math.sin(te)*Math.cos(Ce),Math.sin(Ce),Math.cos(te)*Math.cos(Ce)).multiplyScalar(d).add(g.look),g.up.set(-Math.sin(te),0,-Math.cos(te)),g.world="site",g.dist=g.pos.length(),g.upk=D,g}let i=Vt((R-ue.yH)/(L-ue.yH)),p=i*i,O=p*i;return le.copy(K).multiplyScalar(2*O-3*p+1).addScaledVector(ce,3*p-2*O).addScaledVector(Q,O-p).normalize(),g.pos.copy(r).addScaledVector(le,d*c),j.copy(n).sub(g.pos).normalize(),be.setFromUnitVectors(H,j),de.identity().slerp(be,Xt(Math.min(1,i*1.1))),g.look.copy(H).applyQuaternion(de).multiplyScalar(d*c).add(g.pos),g.up.set(0,1,0),g.world="globe",g.dist=d,g.upk=1,g}return{layout:Ie,at:ee,k:ue,LAMH:s,LAM1:G}}var Va=30.250453*Math.PI/180,mr=-13*Math.PI/180;function Ia(e,t={}){let r=(e-13.1)*15*Math.PI/180,c=Math.sin(Va)*Math.sin(mr)+Math.cos(Va)*Math.cos(mr)*Math.cos(r),o=Math.asin(c),n=Math.atan2(-Math.sin(r),Math.tan(mr)*Math.cos(Va)-Math.sin(Va)*Math.cos(r));return t.sinE=c,t.el=o,t.az=n,t.x=Math.cos(o)*Math.sin(n),t.y=c,t.z=-Math.cos(o)*Math.cos(n),t}var li=.79,Ua=(e,t,r)=>{let c=Math.min(1,Math.max(0,(e-t)/(r-t)));return c*c*(3-2*c)},Na=Math.log;function bn(e,t){let r=1+.3*(1-Ua(e,.02,.45)),c=Ua(-e,-.02,.12),o=1-.78*Ua(t,Na(2e3),Na(4e4))*c,n=1+.66*Math.exp(-(((e-.0115)/(e>.0115?.016:.0135))**2)),P=1.05*r*o*n;return P+(li-P)*Ua(t,Na(2e6),Na(9e6))}var No=e=>{let t=(e%1009+1009)%1009;return(t*t*7+t*31+13)%1009/1009},po=(e,t,r)=>{let c=Math.min(1,Math.max(0,(e-t)/(r-t)));return c*c*(3-2*c)};var sa=[[86,-420],[86,-30],[74,-24],[40,-25.5],[-20,-25.5],[-44,-25.5],[-50,0],[-44,25.5],[-10,25.5],[40,25.5],[74,30],[86,36],[86,420]],Go=sa.slice(1).map((e,t)=>{let r=Math.hypot(e[0]-sa[t][0],e[1]-sa[t][1]),c=r>200?12:4.5;return{L:r,T:r/c,v:c}}),yn=Go.reduce((e,t)=>e+t.T,0),Io=.5,wn=.6,Mn=2,Sn=12,ci=.6,ui=.3,Jt=10,fi=24,An=[.06,.07,.1,.3,.404,.42,.44,.455,.46,.484,.512,.54,.568,.596,.624,.652,.69,.72,.8,.85,.86,.95],hi=8e-4,di=.0025;function Cn(){let e=[0,1].map(()=>({on:!1,x:0,y:0,z:0,ph:0,sw:0})),t=[0,1,2,3].map(()=>({on:!1,x:0,z:0,yaw:0,load:!1,v:0})),r=[0,1].map(()=>({x:0,z:-29})),c={x:0,z:0,v:0},o={ex:e,tr:t,mix:r,dz:{on:!1,x:0,y:0,z:0,yaw:0,v:0},pump:{on:!1,bx:0},digOn:!1,xf:0,bay:0,pouring:!1,craneOn:!1,up:0},n=new Float64Array(fi*Jt),P=new Float64Array(220),b=0,z=0;function y(ee){let I=ee*yn,g=0;for(;g<Go.length-1&&I>Go[g].T;)I-=Go[g].T,g++;let w=Math.min(1,I/Go[g].T),L=sa[g],R=sa[g+1];return c.x=L[0]+(R[0]-L[0])*w,c.z=L[1]+(R[1]-L[1])*w,c.v=Go[g].v,Math.atan2(-(R[1]-L[1]),R[0]-L[0])}let V=(ee,I,g)=>{let w=b++*Jt;n[w]=1,n[w+1]=ee,n[w+2]=I,n[w+8]=n[w+9]=g},A=(ee,I,g,w,L,R,X,d=0)=>{let i=b++*Jt;n[i]=2,n[i+1]=ee,n[i+2]=I,n[i+3]=Math.cos(g),n[i+4]=-Math.sin(g),n[i+5]=w+X+d,n[i+6]=L+X+d,n[i+7]=R+X,n[i+9]=Math.hypot(Math.max(n[i+5],n[i+6]),n[i+7])},U=(ee,I,g,w,L,R,X,d)=>{A(ee,I,g,w,L,R,X),n[(b-1)*Jt+5]+=d,n[(b-1)*Jt+9]=Math.hypot(Math.max(n[(b-1)*Jt+5],n[(b-1)*Jt+6]),n[(b-1)*Jt+7])};function N(ee,I){let g=I>.06&&I<.42,w=-32+po(I,.07,.36)*76;o.digOn=g,o.xf=w,b=0,A(52,-45,0,9.15,9.15,3.6,Io),A(62,44,0,3.1,3.1,1.2,Io);for(let[E,fe]of[[-60,-42],[60,-42],[-60,42],[20,30]])V(E,fe,2.7+Io);let L=po(I,.4,.47);o.up=L,o.craneOn=L>.01,o.craneOn&&A(-4,4,0,3,3,3,Io);let R=Math.min(7,Math.max(0,Math.floor((I-.47)/.028+.5))),X=I>.455&&I<.69;if(o.bay=R,o.pouring=X,o.pump.on=X,X){let E=-32+Math.floor(R/2)*16+8;o.pump.bx=E,A(E,-29,0,6.5,6.4,4.4,Io);for(let fe=0;fe<2;fe++)r[fe].x=E+12+fe*11,r[fe].z=-29,A(r[fe].x,-29,0,5.05,4.85,1.25,Io)}for(let E=0;E<2;E++){let fe=e[E],oe=E===1&&I>.8,ze=(ee/7+E*.37)%1;fe.on=g||E===1&&I>.8&&I<.95,fe.ph=ze,fe.sw=po(ze,.35,.55)*(1-po(ze,.7,.95)),fe.x=oe?40:Math.min(26,Math.max(-28,w-6)),fe.y=oe?-1:-4*po(I,.07,.12),fe.z=E?13:-13,fe.on&&V(fe.x,fe.z,Sn)}z=b;for(let E=0;E<4;E++){let fe=t[E],oe=(ee/yn+E/4)%1;fe.on=I>.07&&I<.46,fe.yaw=y(oe),fe.x=c.x,fe.z=c.z,fe.v=c.v,fe.load=oe>.5,fe.on&&U(fe.x,fe.z,fe.yaw,4.95,4.7,1.25,wn,Mn*fe.v+2)}let d=o.dz,i,p,O=0,D=!0,te,Ce;I<.1?(te=ee/80,i=-60+Math.abs(te%1*2-1)*110,p=-40+Math.floor(te)%4*20,Ce=2.75):I>.3&&I<.44?(te=ee/40,i=-26+Math.abs(te%1*2-1)*52,p=-12+Math.floor(te)%3*12,O=-4,Ce=2.6):I>.86?(te=ee/40,i=-60+Math.abs(te%1*2-1)*40,p=40,Ce=2):(D=!1,te=0,i=p=Ce=0),d.on=D,d.x=i,d.y=O,d.z=p,d.v=Ce,d.yaw=te%1<.5?0:Math.PI,D&&A(i,p,d.yaw,3,3,1.7,wn,Mn*Ce+2)}function s(ee,I,g){let w=ee*Jt,L=I-n[w+1],R=g-n[w+2];if(n[w]===1)return Math.hypot(L,R)-n[w+8];let X=n[w+3],d=n[w+4],i=L*X+R*d,p=R*X-L*d,O=Math.max(-n[w+6]-i,i-n[w+5]),D=Math.abs(p)-n[w+7];return Math.hypot(Math.max(O,0),Math.max(D,0))+Math.min(Math.max(O,D),0)}let G=(ee,I,g,w)=>{let L=ee*Jt,R=n[L+9]+w;return Math.abs(I-n[L+1])<R&&Math.abs(g-n[L+2])<R},k=0,K=0;function H(ee,I){let g=ee*Jt,w=k-n[g+1],L=K-n[g+2];if(n[g]===1){let E=Math.hypot(w,L),fe=E>1e-6?(n[g+8]+I)/E:0;k=n[g+1]+(E>1e-6?w*fe:n[g+8]+I),K=n[g+2]+L*fe;return}let R=n[g+3],X=n[g+4],d=n[g+5],i=n[g+6],p=n[g+7],O=w*R+L*X,D=L*R-w*X,te,Ce;if(O<-i||O>d||Math.abs(D)>p){let E=Math.min(d,Math.max(-i,O)),fe=Math.min(p,Math.max(-p,D)),oe=Math.hypot(O-E,D-fe)||1;te=E+(O-E)/oe*I,Ce=fe+(D-fe)/oe*I}else{let E=d-O,fe=O+i,oe=p-D,ze=D+p,Ze=Math.min(E,fe,oe,ze);te=O,Ce=D,Ze===E?te=d+I:Ze===fe?te=-i-I:Ze===oe?Ce=p+I:Ce=-p-I}k=n[g+1]+te*R-Ce*X,K=n[g+2]+te*X+Ce*R}function ce(ee){for(let I=0;I<4;I++){let g=!1;for(let w=0;w<z;w++)G(w,k,K,ee)&&s(w,k,K)<ee&&(H(w,ee),g=!0);if(!g)break}}function ne(ee){for(let I=0;I<6;I++){let g=!1;for(let w=0;w<b;w++)G(w,k,K,ee)&&s(w,k,K)<ee&&(H(w,ee),g=!0);if(!g)break}}let $=new Float64Array(5),be=new Float64Array(5),de=46,Oe=-33.25;function we(ee,I,g,w){let L=No(ee*31+I*7),R=No(ee*17+I*3+5),X,d,i=0,p=No(ee*29+I*11)*6.2832;if(ee<26&&g>.44&&g<.72){let O=Math.min(7,o.bay+(ee%3===0?1:0));X=-32+Math.floor(O/2)*16+2+L*12,d=(O%2?2:-17)+R*15,i=-4}else if(ee<26&&g>=.72){let O=((ee*7+I)%78+78)%78;O>39&&(O=78-O);let D=Math.floor(O/5),te=D%2?4-O%5:O%5;X=-28+D*8+(L-.5)*3,d=-16+te*8+(R-.5)*3,i=-4+(g>.85&&X<0?3.75:0)}else if(ee<34&&o.digOn){let O=e[ee%2?0:1],D=(L-.5)*1.222,te=Sn+1.5+R*2;X=O.x+Math.cos(D)*te,d=O.z+Math.sin(D)*te,p=Math.atan2(-(O.z-d),O.x-X)}else X=de+(No(ee*5+9)-.5)*13+(L-.5)*12+6.5,d=Oe+(R-.5)*6.5;k=X,K=d,ce(ci),w[0]=k,w[1]=i,w[2]=K,w[3]=p}let Ae=ee=>ee-Math.round(ee/6.2832)*6.2832;function B(ee){let I=1;for(let g=0;g<An.length;g++)I=Math.min(I,po(Math.abs(ee-An[g]),hi,di));return I}let le=new Float64Array(12),Q=new Float64Array(12),j=new Float64Array(12),Me=new Float64Array(8),ue=new Float64Array(8),pe=new Uint8Array(8),De=new Uint8Array(8),J=2;function he(ee,I,g,w,L,R){let X=ee*Jt,d=n[X+9]+R,i=n[X+1],p=n[X+2];if(Math.max(I,w)<i-d||Math.min(I,w)>i+d||Math.max(g,L)<p-d||Math.min(g,L)>p+d)return!1;let O=Math.min(160,Math.ceil(Math.hypot(w-I,L-g)*4));for(let D=0;D<=O;D++)if(s(ee,I+(w-I)*D/O,g+(L-g)*D/O)<R)return!0;return!1}function Le(ee,I,g,w){J=2,le[0]=ee,Q[0]=I,le[1]=g,Q[1]=w;for(let L=0;L<z;L++){if(!he(L,ee,I,g,w,.45))continue;let R=L*Jt,X=n[R+1],d=n[R+2],i=((n[R]===1?n[R+8]:Math.hypot(Math.max(n[R+5],n[R+6]),n[R+7]))+1)/.9239,p=2*i*.3827;for(let oe=0;oe<8;oe++){let ze=oe*.7854+.3927;Me[oe]=X+Math.cos(ze)*i,ue[oe]=d+Math.sin(ze)*i,pe[oe]=he(L,ee,I,Me[oe],ue[oe],.45)?0:1,De[oe]=he(L,Me[oe],ue[oe],g,w,.45)?0:1}let O=1e9,D=-1,te=0,Ce=1;for(let oe=0;oe<8;oe++)if(pe[oe]){for(let ze=0;ze<8;ze++)if(De[ze])for(let Ze=-1;Ze<=1;Ze+=2){let Dt=Ze>0?(ze-oe+8)%8:(oe-ze+8)%8,et=Math.hypot(Me[oe]-ee,ue[oe]-I)+Dt*p+Math.hypot(g-Me[ze],w-ue[ze]);et<O&&(O=et,D=oe,te=ze,Ce=Ze)}}if(D<0)return;let E=1,fe=D;for(le[0]=ee,Q[0]=I;le[E]=Me[fe],Q[E]=ue[fe],E++,fe!==te;)fe=(fe+Ce+8)%8;le[E]=g,Q[E]=w,J=E+1;return}}function Ie(ee,I){let g=B(I);for(let w=0;w<44;w++){let L=6+6*No(w*13+3),R=No(w*7+1),X=Math.floor(ee/L+R),d=(ee/L+R-X)*L;we(w,X-1,I,$),we(w,X,I,be),Le($[0],$[2],be[0],be[2]),j[0]=0;for(let Ue=1;Ue<J;Ue++)j[Ue]=j[Ue-1]+Math.hypot(le[Ue]-le[Ue-1],Q[Ue]-Q[Ue-1]);let i=be[1]-$[1],p=Math.hypot(j[J-1],i),O=Math.min(5,Math.max(1.3,p/(.7*L))),D=p>.02?Math.min(p/O,.95*L):0,te=D>0?Math.min(1,d/D):1,Ce=te*j[J-1],E=1;for(;E<J-1&&j[E]<Ce;)E++;let fe=j[E]-j[E-1],oe=fe>1e-9?(Ce-j[E-1])/fe:1,ze=le[E]-le[E-1],Ze=Q[E]-Q[E-1],Dt=D>0?Math.atan2(-Ze,ze):be[3];D>0&&d<.5&&(Dt+=Ae($[3]-Dt)*(1-po(d,0,.5))),d>D&&(Dt+=Ae(be[3]-Dt)*po(d-D,0,.8)),k=le[E-1]+ze*oe,K=Q[E-1]+Ze*oe,ne(ui);let et=w*5;P[et]=k,P[et+1]=$[1]+i*te,P[et+2]=K,P[et+3]=Dt,P[et+4]=g}}return{M:o,Z:n,crew:P,machines:N,crewStep:Ie,zsd:s,get nZ(){return b},get nS(){return z}}}var la={lat:30.250453,lon:-97.719913},Ta=17*Math.PI/180,ia=400,To=180,go=140,Ga=164/11,uo=4;var zn=`
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
`,mi=e=>`
vec2 toGeo(vec2 p){ return vec2(p.x*uRot.x-p.y*uRot.y, p.x*uRot.y+p.y*uRot.x); }
float orthoW(vec2 g){ vec2 a=abs(g); return uOrthoOn*(1.-smoothstep(${ia-90}.,${ia-4}.,max(a.x,a.y))); }
vec3 ortho(vec2 g){ vec3 c=texture2D(tOrtho,vec2(g.x/${2*ia}.+.5,.5-g.y/${2*ia}.)).rgb;
  vec3 l=texture2D(tOrthoL,vec2(g.x/${2*e}.+.5,.5-g.y/${2*e}.)).rgb; vec2 a=abs(g);
  return mix(c,l,uOrthoLOn*(1.-smoothstep(${(e*.85).toFixed(1)},${e-2}.,max(a.x,a.y)))); }
// round feathers, never square: each photo hands over to the next one out well inside its own edge
float circW(vec2 g, float hf){ return 1.-smoothstep(.55*hf,.95*hf,length(g)); }
vec4 photoLayers(vec2 g){
  float wc=uOrthoCOn*circW(g,40000.), wb=uOrthoBOn*circW(g,4000.), wa=uOrthoOn*circW(g,${ia}.);
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
}`,Dn=e=>`{
  vec2 bp=vLoc.xz; float bw=max(length(fwidth(bp)),1e-3), fade=1.-smoothstep(.15,.9,bw);   // only where it can resolve
  if(fade>0.){
    float e=.18; vec2 ex=vec2(e,0.), ez=vec2(0.,e);
    #define BH(q) (dot(ortho(toGeo(q)),vec3(.3,.5,.2))*.9*uOrthoOn+fb((q)*1.6)*.1+vn((q)*6.)*.025)
    float gx=(BH(bp+ex)-BH(bp-ex))/(2.*e), gz=(BH(bp+ez)-BH(bp-ez))/(2.*e);
    #undef BH
    normal=normalize(normal+(viewMatrix*vec4(-gx,0.,-gz,0.)).xyz*${e}*fade);
  } }`;function Pn({THREE:e,scene:t,renderer:r,sunLight:c,hemi:o,ORIGIN:n,earthU:P,ortho:b={}}){let z=b.lotHalf||200,y=mi(z),V=new e.Group;V.position.copy(n),V.visible=!1,t.add(V);let A={uG:{value:0},uNight:{value:0},uT:{value:0},uWork:{value:0},uSunL:{value:new e.Vector3(0,1,0)},uOrigin:{value:n.clone()},tMap:P.tMap,tLights:P.tLights,uLL:{value:new e.Vector2(la.lat,la.lon)},uDig:{value:0},uPile:{value:0},uBack:{value:0},uClear:{value:0},uProg:{value:0},tOrtho:{value:null},uOrthoOn:{value:0},tOrthoL:{value:null},uOrthoLOn:{value:0},tOrthoB:{value:null},uOrthoBOn:{value:0},tOrthoC:{value:null},uOrthoCOn:{value:0},uRot:{value:new e.Vector2(Math.cos(Ta),Math.sin(Ta))}};{let x=new e.DataTexture(new Uint8Array([90,80,66,255]),1,1);x.needsUpdate=!0,A.tOrtho.value=x,A.tOrthoL.value=x}{let x=new e.DataTexture(new Uint8Array([70,72,60,255]),1,1);x.needsUpdate=!0,A.tOrthoB.value=x,A.tOrthoC.value=x}let U={},N=500,s=(x,m,l,F=!1)=>x?vo(e,x,{flipY:!0,colorSpace:e.SRGBColorSpace}).then(h=>{if(h.anisotropy=8,h.needsUpdate=!0,r&&r.initTexture)try{r.initTexture(h)}catch{}return A[m].value=h,F?U[l]=performance.now():A[l].value=1,!0},()=>!1):Promise.resolve(!1),G=Promise.all([s(b.lot,"tOrthoL","uOrthoLOn"),s(b.site,"tOrtho","uOrthoOn")]),k=Promise.all([G,s(b.km8,"tOrthoB","uOrthoBOn",!0),s(b.km80,"tOrthoC","uOrthoCOn",!0)]),K=0,H=(x,m,l,F,h,Y,me,T,Z)=>{let ge="tfsite"+K++;return x.customProgramCacheKey=()=>ge,x.onBeforeCompile=Ke=>{Object.assign(Ke.uniforms,A),Ke.vertexShader=`uniform vec3 uOrigin; uniform float uDig,uPile,uBack; varying vec3 vLoc;
`+zn+m+`
`+Ke.vertexShader,T&&(Ke.vertexShader=Ke.vertexShader.replace("#include <beginnormal_vertex>",T)),Ke.vertexShader=Ke.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
`+l+`
vLoc=(modelMatrix*vec4(transformed,1.)).xyz-uOrigin;`),Ke.fragmentShader=`uniform float uG,uNight,uT,uWork,uClear,uProg,uOrthoOn,uOrthoLOn,uOrthoBOn,uOrthoCOn; uniform vec3 uSunL; uniform sampler2D tMap,tLights,tOrtho,tOrthoL,tOrthoB,tOrthoC; uniform vec2 uLL,uRot; varying vec3 vLoc;
`+zn+y+F+`
`+Ke.fragmentShader.replace("#include <color_fragment>",`#include <color_fragment>
`+h).replace("#include <roughnessmap_fragment>",`#include <roughnessmap_fragment>
`+Y).replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>
`+me).replace("#include <normal_fragment_maps>",`#include <normal_fragment_maps>
`+(Z||""))},x},ce=`
  vec3 SOD=vec3(1.,.58,.24);
  vec2 llUv(vec2 p){ float lat=uLL.x-p.y/110574., lon=uLL.y+p.x/(111320.*cos(radians(uLL.x))); return vec2((lon+180.)/360.,(lat+90.)/180.); }
  // one house slot: returns roof coverage and fills colour/height; painted only outside the 3D ring
  float house(vec2 lc, float ci, float cj, float row, out vec3 roof, out float ht, out vec2 porch, out float pool, out vec2 poolC, float w){
    float s=floor((lc.x+82.)/${Ga.toFixed(6)}); roof=vec3(0.); ht=0.; pool=0.; porch=vec2(1e5); poolC=vec2(1e5);
    if(s<0.||s>10.) return 0.;
    float n=ci*157.+cj*311.+row*71.+s*13.+500.;
    if(Hh(n)>0.92) return 0.;
    float cx=-82.+(s+.5)*${Ga.toFixed(6)}, front=row<.5? -70.+hwZ(cj-1.) : 70.-hwZ(cj), dir=row<.5?1.:-1.;
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
    vec2 uS=p/vec2(${To}.,${go}.), dS=abs(fract(uS)-.5)*vec2(${To}.,${go}.);
    float hS=3., sgS=max(hS,sg0), sa=max(1.5,sg0);
    float gX=h21(vec2(floor(uS.x),floor(uS.y+.5))+.37), gZ=h21(vec2(floor(uS.x+.5),floor(uS.y))+5.71);
    float segX=step(.18,gX)*(.4+1.2*fract(gX*13.1)), segZ=step(.18,gZ)*(.4+1.2*fract(gZ*13.1));
    float ddX=mod(p.y,36.)-18., ddZ=mod(p.x,36.)-18., fa=smoothstep(4.,9.,sa), dn=36.*1.5/(1.7725*sa);
    float dotX=mix(exp(-ddX*ddX/(sa*sa))*dn,1.,fa), dotZ=mix(exp(-ddZ*ddZ/(sa*sa))*dn,1.,fa);
    float Lst=(exp(-dS.x*dS.x/(sgS*sgS))*segX*dotX+exp(-dS.y*dS.y/(sgS*sgS))*segZ*dotZ)*hS/sgS;
    float mSt=1.7725*hS*(1./${To}.+1./${go}.)*.82;
    float fS=smoothstep(.05*${go}.,.13*${go}.,sgS), aS=.14*(1.-.92*fS); S+=aS*mix(Lst/mSt,1.,fS); W+=aS;
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
    float ci=floor(p.x/${To}.+.5), cj=floor(p.y/${go}.+.5);
    vec2 lc=p-vec2(ci*${To}.,cj*${go}.);
    float kx=lc.x>0.?ci:ci-1., kz=lc.y>0.?cj:cj-1.;
    float dX=${To/2}.-abs(lc.x), dZ=${go/2}.-abs(lc.y);          // distance to the street centrelines
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
        float s=floor((lc.x+82.)/${Ga.toFixed(6)}), cxs=-82.+(s+.5)*${Ga.toFixed(6)};
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
  }`,ne=H(new e.MeshStandardMaterial({roughness:1,metalness:0,polygonOffset:!0,polygonOffsetFactor:2,polygonOffsetUnits:2}),"","",ce+`
vec3 gA; float gR; vec3 gE;`,`if(abs(vLoc.x)<74.8&&abs(vLoc.z)<54.8) discard; // the lot mesh owns this patch (the pit goes below the ground plane)
  float gw=max(length(fwidth(vLoc.xz)),1e-3); groundShade(vLoc.xz,gw,gA,gR,gE);
  { vec2 gq=toGeo(vLoc.xz); vec4 ph=photoLayers(gq); if(ph.a>0.){ gA=mix(gA,ph.rgb,ph.a); gR=mix(gR,.95,ph.a); }
    float ow=uOrthoOn*circW(gq,400.); if(ow>0.) gE=mix(gE,orthoNight(gq,gw)*uNight,ow*(1.-smoothstep(1.,3.,gw))); }
  diffuseColor.rgb=gA;`,"roughnessFactor=gR;","totalEmissiveRadiance+=gE;",null,Dn(.35)),$=new e.Mesh(new e.PlaneGeometry(1,1).rotateX(-Math.PI/2),ne);$.position.y=-.06,$.receiveShadow=!0,$.frustumCulled=!1,V.add($);let be=`
  float pitH(vec2 p){
    vec2 q=abs(p)-vec2(32.,20.); float dr=max(q.x,q.y);
    float m=1.-smoothstep(-3.,0.,dr);
    float xf=-32.+uDig*76.;                             // the dig face sweeps west to east
    float f=smoothstep(xf,xf-7.,p.x);
    float h=-${uo}.*m*f;
    // haul ramp up the east side
    float rx=clamp((p.x-30.)/22.,0.,1.), rm=(1.-smoothstep(4.5,7.,abs(p.y)))*step(29.,p.x)*step(p.x,52.);
    h=min(h,-${uo}.*(1.-rx)*rm*smoothstep(.55,.9,uDig)*(1.-uBack));
    // ground topography outside the dig: gentle swales, a few windrows from grading, all easing to 0 at the lot edge
    float edge=(1.-smoothstep(62.,74.,abs(p.x)))*(1.-smoothstep(42.,54.,abs(p.y)));
    float topo=(fb(p*.022+3.)-.47)*1.6+(vn(p*.11)-.5)*.35+smoothstep(.55,1.,sin(p.y*.42+fb(p*.05)*4.))*.22;
    h+=topo*edge*(1.-m*f);
    // spoil pile
    float r=length((p-vec2(-52.,-38.))*vec2(1.,1.3));
    h+=uPile*7.*exp(-r*r/160.)*(.8+.4*vn(p*.15));
    return h;
  }`,de=H(new e.MeshStandardMaterial({roughness:1,metalness:0}),be,"transformed.y+=pitH(position.xz);",`
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
    if(abs(p.x)<31.&&abs(p.y)<19.&&y<-${uo-.4}){
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
    #endif`,Dn(.9)),Oe=new e.Mesh(new e.PlaneGeometry(150,110,150,110).rotateX(-Math.PI/2),de);Oe.receiveShadow=!0,V.add(Oe);let we=(x,m=.7,l=0,F)=>new e.MeshStandardMaterial({color:x,roughness:m,metalness:l,...F?{emissive:F}:{}}),Ae={yel:we(15774218,.5,.1),dark:we(1842204,.85),glass:we(1450540,.15,.4),white:we(15328991,.55),conc:we(12038824,.9),grey:we(8223607,.6,.3),orange:we(15229980,.5),blue:we(2775720,.6),ply:we(12613434,.8),rust:we(8010524,.9),green:we(2242602,.9),lamp:new e.MeshBasicMaterial({color:16777215}),drum:we(14210252,.4,.3)},B=(x,m,l,F,h=0,Y=0,me=0,T)=>{let Z=new e.Mesh(new e.BoxGeometry(x,m,l),F);return Z.position.set(h,Y,me),Z.castShadow=Z.receiveShadow=!0,(T||V).add(Z),Z},le=(x,m,l,F,h,Y,me,T="z")=>{let Z=new e.CylinderGeometry(x,x,m,14);T==="z"?Z.rotateX(Math.PI/2):T==="x"&&Z.rotateZ(Math.PI/2);let ge=new e.Mesh(Z,l);return ge.position.set(F,h,Y),ge.castShadow=!0,me.add(ge),ge},Q=new e.Matrix4,j=new e.Quaternion,Me=new e.Vector3,ue=new e.Vector3,pe=new e.Vector3(0,1,0),De=new e.Vector3(1e-4,1e-4,1e-4),J=(x,m,l)=>{let F=Math.min(1,Math.max(0,(x-m)/(l-m)));return F*F*(3-2*F)},he=[],Le=new e.InstancedMesh(new e.IcosahedronGeometry(1,1),we(2044692,.95),he.length);Le.castShadow=Le.receiveShadow=!0,V.add(Le);{let x=[];for(let l=-75;l<75;l+=3)x.push([l+1.5,-55,0],[l+1.5,55,0]);for(let l=-55;l<55;l+=3)x.push([-75,l+1.5,1]),l>-32&&l<-6||l>18&&l<42||x.push([75,l+1.5,1]);let m=new e.InstancedMesh(new e.BoxGeometry(3,1.8,.08).translate(0,.9,0),Ae.green,x.length);x.forEach(([l,F,h],Y)=>{Q.compose(Me.set(l,0,F),j.setFromAxisAngle(pe,h?Math.PI/2:0),ue.set(1,1,1)),m.setMatrixAt(Y,Q)}),m.castShadow=!0,V.add(m)}let Ie=[new e.PointLight(16773336,0,90,1.6),new e.PointLight(16773336,0,90,1.6)];Ie[0].position.set(-30,14,-10),Ie[1].position.set(30,14,10),Ie.forEach(x=>V.add(x));let{exA:ee,exB:I,trucks:g,dozer:w,pump:L,mixers:R,crane:X,crew:d,towers:i,roofs:p}=Zr({THREE:e,group:V,D:uo}),O=Cn(),D=O.M,te=[];for(let x=-28;x<=28;x+=8)for(let m=-16;m<=16;m+=8)te.push([x,m]);let Ce=new e.InstancedMesh(new e.BoxGeometry(.75,1,.75).translate(0,.5,0),Ae.conc,te.length);Ce.castShadow=Ce.receiveShadow=!0,V.add(Ce);let E=[[-12,-4,8,6],[14,5,6,6]].map(([x,m,l,F])=>{let h=B(l,1,F,Ae.conc,x,-uo,m);return h.geometry.translate(0,.5,0),h}),fe=[];for(let x=-28;x<28;x+=8)for(let m=-18;m<18;m+=9)fe.push([x+4,m+4.5]);let oe=new e.InstancedMesh(new e.BoxGeometry(7.8,.35,8.8),Ae.ply,fe.length);oe.castShadow=oe.receiveShadow=!0,V.add(oe);let ze={},Ze=new e.Vector3,Dt=new e.Color,et=new e.Color,Ue=i[0].material.color.clone(),re=e.MathUtils.degToRad(.1),Be=e.MathUtils.degToRad(2.5),Te=.45,tt=.09,st=new e.Vector3,mt=new e.Vector3(1,0,0),_e=(x,m,l)=>{st.subVectors(l,m);let F=st.length();x.position.copy(m).add(l).multiplyScalar(.5),x.scale.set(F,1,1),x.quaternion.setFromUnitVectors(mt,st.normalize())},Pt=new e.Vector3,zt=new e.Vector3,Je=new e.Vector3,Ut=new e.Vector3,kt=new e.Vector3,Wt=new e.Vector3(0,1,0),Ye=x=>Ba(c,n,x,400,Ut,kt);function Ft({g:x,t:m,hour:l}){for(let ve in U){let He=Math.min(1,(performance.now()-U[ve])/N);A[ve].value=He*He*(3-2*He),He>=1&&delete U[ve]}let F=x,{sinE:h,el:Y,az:me}=Ia(l,ze),T=Math.round(.5*(Y+Be+Math.sqrt((Y-Be)**2+4e-4))/re)*re,Z=Math.round(me/re)*re;Ze.set(Math.cos(T)*Math.sin(Z),Math.sin(T),-Math.cos(T)*Math.cos(Z));let ge=J(h,-.1,.12),Ke=1-ge,We=1-J(h,.05,.5);A.uSunL.value.copy(Ze),A.uNight.value=J(-h,-.02,.12),A.uT.value=m,A.uG.value=x,A.uProg.value=F,A.uWork.value=A.uNight.value*J(F,.03,.06),c.color.setRGB(1,.93-We*.25,.85-We*.45),c.intensity=3.2*J(h,-.02,.1),Ye(Ze),o.color.copy(Dt.setRGB(.42,.58,1).lerp(et.setRGB(.06,.07,.12),Ke)),o.groundColor.setRGB(.42*ge+.02,.34*ge+.02,.24*ge+.03),o.intensity=.6+.95*ge;let Ve=A.uWork.value;Ie.forEach(ve=>ve.intensity=140*Ve),i[0].material.color.copy(Ue).multiplyScalar(Ve),i.forEach(ve=>ve.visible=Ve>.002),A.uClear.value=J(F,0,.07),A.uDig.value=J(F,.07,.36),A.uPile.value=J(F,.08,.24)*(1-J(F,.3,.46))*.9+.1*J(F,.3,.46),A.uBack.value=J(F,.8,.93),he.forEach(([ve,He,Qe],at)=>{let it=1-J(F,.005+at*.004,.02+at*.004);Q.compose(Me.set(ve,Qe*.55+1.6,He),j.setFromAxisAngle(pe,at),it>.01?ue.set(Qe*it,Qe*.55*it,Qe*it):De),Le.setMatrixAt(at,Q)}),Le.instanceMatrix.needsUpdate=!0,O.machines(m,F),[[ee,-1],[I,1]].forEach(([ve,He],Qe)=>{let at=D.ex[Qe],it=at.ph,S=at.sw;ve.g.visible=at.on,ve.up.rotation.y=S*He*1.9,ve.boom.rotation.z=e.MathUtils.lerp(.35-J(it,0,.3)*.55,.62,S),ve.stick.rotation.z=-e.MathUtils.lerp(1.05+J(it,.05,.33)*.9,.9-J(it,.55,.68)*.5,S),ve.g.position.set(at.x,at.y,at.z),ve.g.rotation.y=0}),g.forEach((ve,He)=>{let Qe=D.tr[He];ve.g.visible=Qe.on,ve.g.position.set(Qe.x,0,Qe.z),ve.g.rotation.y=Qe.yaw,ve.load.visible=Qe.load});{let ve=D.dz;w.visible=ve.on,ve.on&&(w.position.set(ve.x,ve.y,ve.z),w.rotation.y=ve.yaw)}let _=D.bay,ke=D.pouring;if(L.g.visible=ke,R.forEach(ve=>ve.g.visible=ke),ke){let ve=D.pump.bx,He=_%2?9.5:-9.5;L.g.position.set(ve,0,-29),Pt.set(ve,3.2,-29),Je.set(ve+Math.sin(m*Te)*3,-uo+3.5,He+Math.cos(m*Te*.8)*2),zt.copy(Pt).lerp(Je,.45),zt.y=16,_e(L.s1,Pt,zt),_e(L.s2,zt,Je),_e(L.hose,Je,Me.copy(Je).setY(-uo+.2)),[L.s1,L.s2,L.hose].forEach(Qe=>Qe.visible=!0),R.forEach((Qe,at)=>{Qe.g.position.set(ve+12+at*11,0,-29),Qe.d.rotation.x=m*3+at})}else[L.s1,L.s2,L.hose].forEach(ve=>ve.visible=!1);{let ve=J(F,.4,.47),He=40*ve+.01;X.g.visible=ve>.01,X.mast.scale.y=He,X.top.position.y=He,X.top.visible=ve>.95;let Qe=m*tt;X.top.rotation.y=Math.sin(Qe)*1.6+Math.sin(Qe*2.3)*.7;let at=12+(Math.sin(m*.13)*.5+.5)*36,it=10+(Math.sin(m*.21)*.5+.5)*22;X.trolley.position.x=at,X.line.scale.y=it,X.line.position.y=-.8-it/2,X.hook.position.y=-1.2-it}te.forEach(([ve,He],Qe)=>{let at=Math.floor((ve+32)/16)*2+(He<0?0:1),it=J(F,.47+at*.028+.07,.47+at*.028+.12);Q.compose(Me.set(ve,-uo,He),j.identity(),it>.01?ue.set(1,3.6*it,1):De),Ce.setMatrixAt(Qe,Q)}),Ce.instanceMatrix.needsUpdate=!0,E.forEach((ve,He)=>{let Qe=J(F,.56+He*.03,.98);ve.visible=Qe>.01,ve.scale.y=Math.max(.01,13*Qe)}),fe.forEach(([ve,He],Qe)=>{let at=J(F,.8+(ve+28)/56*.15+Qe%4*.01,.84+(ve+28)/56*.15+Qe%4*.01);Q.compose(Me.set(ve,-.25,He),j.identity(),at>.5?ue.set(1,1,1):De),oe.setMatrixAt(Qe,Q)}),oe.instanceMatrix.needsUpdate=!0,O.crewStep(m,F);let Re=O.crew;for(let ve=0;ve<44;ve++){let He=ve*5,Qe=Re[He+4];Q.compose(Me.set(Re[He],Re[He+1],Re[He+2]),j.setFromAxisAngle(pe,Re[He+3]),Qe>.01?ue.set(Qe,Qe,Qe):De),d.setMatrixAt(ve,Q)}return d.instanceMatrix.needsUpdate=!0,{hour:l,prog:F,sinE:h,sunL:Ze,night:A.uNight.value}}function yt(x,m){let l=Math.max(4e3,m*12);$.scale.set(l,1,l),$.position.x=x.x,$.position.z=x.z}let f=.05;async function v({next:x=()=>Promise.resolve(),alive:m=()=>!0}={}){let l=await Yr();if(!m())return null;let F=Jr(e,Qr(l,f)),h=0,Y=0;try{for(let me of p){if(await x(),!m())return null;h+=Rr(me,F),Y++}}finally{for(let me in F)F[me].dispose()}return{machines:Y,tris:h}}return{group:V,update:Ft,follow:yt,uniforms:A,D:uo,ready:G,readyAll:k,addShrouds:v}}var pr=Math.log,Wa=(e,t,r)=>{let c=Math.min(1,Math.max(0,(e-t)/(r-t)));return c*c*(3-2*c)},ja=17*Math.PI/180,pi=(e,t,r)=>r.set(e*Math.cos(ja)+t*Math.sin(ja),0,-e*Math.sin(ja)+t*Math.cos(ja)),Ln=[{D:3900,nx:-.34,ny:.3,r:260,turn:240,v:3200,span:36,drift:50,T:7.5},{D:6800,nx:.34,ny:0,r:420,turn:-70,v:3200,span:60,drift:50,T:8.5},{D:5e3,nx:.5,ny:.55,alt:1600,hdg:172,v:1800,span:36,land:!0,drift:300,T:14},{D:7e3,nx:.75,ny:.8,alt:2300,hdg:175,v:1800,span:34,land:!0,drift:300,T:16},{D:4500,nx:-.6,ny:-.5,alt:2e3,hdg:352,v:2e3,span:36,drift:300,T:15,hi:!0},{D:14e3,nx:-.5,ny:.4,alt:9500,hdg:62,v:3e3,span:60,drift:300,T:13,hi:!0},{D:18e3,nx:.45,ny:-.3,alt:11300,hdg:258,v:3200,span:64,drift:300,T:12,hi:!0},{D:11e3,nx:-.2,ny:.6,alt:7200,hdg:128,v:2600,span:36,drift:300,T:15,hi:!0}],kn=[[-.5,0,-.12,0],[.5,0,-.12,1],[0,.03,-.52,2],[-.5,0,-.135,3],[.5,0,-.135,3],[0,.07,.02,4],[0,-.06,.06,4]],gi=[[-.11,-.04,.14,5],[.11,-.04,.14,5]],xi=`
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
}`,bi=`float ss2(float x,float a,float b){ return clamp((x-a)/max(b-a,1e-4),0.,1.); }
`,yi=`
varying vec3 vCol; varying float vK;
void main(){
  vec2 q=gl_PointCoord*2.-1.; float d2=dot(q,q); if(d2>1.) discard;
  float g=mix(exp(-d2*2.5)*(1.-d2),exp(-d2*40.)+.12*exp(-d2*6.)*(1.-d2),vK); // a soft dot when it is a point; hot core + halo up close
  gl_FragColor=vec4(vCol*g,1.);
}`;function On({THREE:e,parent:t,high:r=!0}){let c=r?Ln:Ln.filter(B=>!B.hi),o=c.length,n=[],P=[],b=[];c.forEach((B,le)=>{for(let[Q,j,Me,ue]of B.land?kn.concat(gi):kn)n.push(le),P.push(ue),b.push(Q*B.span,j*B.span,Me*B.span)});let z=new e.BufferGeometry;z.setAttribute("position",new e.BufferAttribute(new Float32Array(n.length*3),3)),z.setAttribute("aId",new e.BufferAttribute(new Float32Array(n),1)),z.setAttribute("aKind",new e.BufferAttribute(new Float32Array(P),1)),z.setAttribute("aOff",new e.BufferAttribute(new Float32Array(b),3));let y=()=>new e.Vector3,V={uC:{value:Array.from({length:8},y)},uF:{value:Array.from({length:8},()=>new e.Vector3(0,0,-1))},uA:{value:new Array(8).fill(0)},uPh:{value:c.map((B,le)=>le*.618034%1).concat(new Array(8-o).fill(0))},uT:{value:0},uProj:{value:1e3},uMin:{value:2},uMax:{value:72}},A=new e.ShaderMaterial({uniforms:V,vertexShader:xi.replace("void main(){",bi+"void main(){"),fragmentShader:yi,transparent:!0,depthWrite:!1,depthTest:!0,blending:e.AdditiveBlending,fog:!1}),U=new e.Points(z,A);U.frustumCulled=!1,U.renderOrder=2,U.name="aircraft",t.add(U);let N=c.map((B,le)=>({spec:B,i:le,p0:y(),fwd:new e.Vector3(0,0,-1),lam0:pr(B.D),pos:y(),a:0})),s={pos:y(),look:y(),up:y(),fov:38},G=y(),k=y(),K=y(),H=y(),ce=y(),ne=(B,le)=>{let Q=B*Math.PI/180;return pi(Math.sin(Q),-Math.cos(Q),le).normalize()};function $(B,le){for(let Q of N){let j=Q.spec;B(j.D,s),G.copy(s.look).sub(s.pos).normalize(),k.crossVectors(G,s.up).normalize(),K.crossVectors(k,G);let Me=Math.tan(s.fov*Math.PI/360),ue=Me*le;if(H.copy(G).addScaledVector(k,j.nx*ue).addScaledVector(K,j.ny*Me).normalize(),Q.p0.copy(s.pos).addScaledVector(H,j.r!=null?j.r:(j.alt-s.pos.y)/H.y),j.hdg!=null)ne(j.hdg,Q.fwd);else{let pe=j.turn*Math.PI/180;ce.copy(K).setY(0).normalize(),Q.fwd.copy(k).setY(0).normalize().multiplyScalar(Math.cos(pe)).addScaledVector(ce,Math.sin(pe)).normalize()}}}function be(B,le,Q){let j=B.spec,Me=((Q/j.T+V.uPh.value[B.i]*3.7)%1+1)%1;return B.pos.copy(B.p0).addScaledVector(B.fwd,j.v*(le-B.lam0)+j.drift*(2*Me-1)),Wa(Me,0,.07)*(1-Wa(Me,.93,1))}let de=0;function Oe({lam:B,t:le,sinE:Q,proj:j,pr:Me=1}){if(de=Wa(-Q,-.035,.03)*(1-Wa(B,pr(6e4),pr(25e4))),U.visible=de>.001,!U.visible){for(let ue of N)ue.a=0;return de}return V.uT.value=le,V.uProj.value=j,V.uMin.value=3*Me,V.uMax.value=96*Me,N.forEach((ue,pe)=>{ue.a=de*be(ue,B,le),V.uC.value[pe].copy(ue.pos),V.uF.value[pe].copy(ue.fwd),V.uA.value[pe]=ue.a}),de}function we(B,le,Q,j){let Me=N[B],ue=be(Me,le,Q);return j.copy(Me.pos),ue}function Ae(){t.remove(U),z.dispose(),A.dispose()}return{points:U,layout:$,update:Oe,at:we,fleet:N,dispose:Ae}}var to=.46,Rt=.4,ca=.6;function Fn({THREE:e}){let t=(ae,ie,Pe)=>new e.Vector3(ae,ie,Pe),r=Math.PI/180,c=t(0,1,0),o=11.25,n=-52,P=17.5,b=-22,z=11.8,y=18,V=11.65,A=-.7,U=.018,N=54,s=-.745,G=-.725,k=-.66,K=-.45,H=-.9,ce=-.16,ne=25,$=.65,be=-35*r,de=.19,Oe=.002,we=t(-.6543,.2642,-.7086),Ae=t(.5744,-.4358,-.6929),B=2,le=t(-1,.22,-.55).normalize(),Q=t(0,0,0),j=t(0,1,0).addScaledVector(le,-le.y).normalize(),Me=Q.clone().addScaledVector(le,-23).addScaledVector(j,10.4),ue=Me.clone().addScaledVector(le,60).addScaledVector(j,-9),pe=t(.0106681,.002613,.0218856),De=pe.clone().normalize(),J=pe.length(),he=t(25.216,6.526,17.498),Le=he.clone().negate().normalize(),Ie=Le.clone().cross(c).normalize(),ee=Ie.clone().cross(Le),I=(ae,ie)=>t().addScaledVector(Le,ie*Math.sin(ae*r)).addScaledVector(ee,ie*Math.cos(ae*r)),g=(ae,ie=t())=>ie.set(0,0,0).addScaledVector(Le,Math.cos(ae*r)).addScaledVector(ee,Math.sin(ae*r)),w=ae=>Math.atan2(ae.dot(ee),ae.dot(Le))/r,L=4,R=480,X=g(L).multiplyScalar(R),d=(ae,ie,Pe)=>t(ae,ie,Pe).add(X),i=t(70,20,100),p=t(i.x,0,i.z).normalize(),O=i.clone().cross(c).normalize(),D=(ae,ie)=>p.clone().multiplyScalar(ae*Math.cos(ie*r)).addScaledVector(c,ae*Math.sin(ie*r)).add(X),te=d(70,20,100),Ce=D(49.5,10.6),E=D(41.67,11.8),fe=E.clone().sub(X),oe=fe.length();fe.normalize();let ze=ne*r,Ze=Math.sin(ze),Dt=c.clone().addScaledVector(fe,-fe.y).normalize(),et=t(),Ue=t(),re=t();{let ae=ut=>(et.copy(fe).multiplyScalar(ut).addScaledVector(Dt,Math.sqrt(1-ut*ut)),re.copy(fe).multiplyScalar(oe).addScaledVector(et,-(6+$)),re.dot(et)/re.length()-Ze),ie=-.95,Pe=.95;for(let ut=0;ut<60;ut++){let $e=(ie+Pe)/2;ae($e)<0?ie=$e:Pe=$e}ae((ie+Pe)/2),re.normalize().negate(),Ue.copy(X).addScaledVector(et,6+$)}let Be=E.distanceTo(Ue),Te=E.clone().addScaledVector(re,.55*Be),tt=new e.Quaternion().setFromAxisAngle(i.clone().normalize(),be),st=(ae,ie)=>ie.setFromAxisAngle(c,de+ae*Oe).premultiply(tt),mt=I(0,o),_e=I(y,V),Pt=X.clone().sub(_e).normalize(),zt=X.clone().addScaledVector(X.clone().negate().normalize().lerp(i.clone().normalize(),.62).normalize(),270),Je=(ae,ie)=>ae.addScaledVector(ie,-ae.dot(ie)).normalize(),Ut=t(-.13013639750678707,.2577593941984025,.9574051455608686),kt=I(n,P),Wt=he.clone().addScaledVector(Je(Ut.clone(),Ie).add(kt.clone().sub(he).normalize()).normalize(),1.5),Ye=[[-1,Me,De],[-.9,he,Ut],[null,Wt,null],[null,kt,null],[null,I(b,z),null],[null,mt,Le.clone()],[null,_e,Pt],[null,_e.clone().addScaledVector(Pt,70),Pt],[null,zt,null],[0,te,null],[.16,Ce,null],[.34,E,re],[Rt,Te,re],[to,Ue,re]],Ft=Ye.length,yt=Ye.map(ae=>ae[1]),f=[];for(let ae=0;ae<Ft;ae++){if(Ye[ae][2]){f.push(Ye[ae][2].clone());continue}let ie=ae>0?yt[ae].clone().sub(yt[ae-1]).normalize():t(),Pe=ae<Ft-1?yt[ae+1].clone().sub(yt[ae]).normalize():t();f.push(ie.add(Pe).normalize())}Je(f[2],Ie),Je(f[9],O);let v=yt.slice(0,-1).map((ae,ie)=>ae.distanceTo(yt[ie+1])),x=new e.Curve;x.getPoint=(ae,ie=new e.Vector3)=>{let Pe=Math.min(Math.max(ae,0),1)*(Ft-1),ut=Math.min(Ft-2,Math.floor(Pe)),$e=Pe-ut,Mt=$e*$e,dt=Mt*$e,ft=v[ut];return ie.copy(yt[ut]).multiplyScalar(2*dt-3*Mt+1).addScaledVector(f[ut],(dt-2*Mt+$e)*ft).addScaledVector(yt[ut+1],3*Mt-2*dt).addScaledVector(f[ut+1],(dt-Mt)*ft)},x.arcLengthDivisions=(Ft-1)*800;let m=x.getLengths(),l=ae=>{let ie=ae*(m.length-1),Pe=Math.floor(ie);return Pe>=m.length-1?m[m.length-1]:m[Pe]+(m[Pe+1]-m[Pe])*(ie-Pe)},F=yt.map((ae,ie)=>l(ie/(Ft-1))),h=[[-1,0,J,-3e-5],[-.9,1,.0022,0],[A,5,U,0],[0,9,.075,-4e-5],[.16,10,.012,-1e-5],[.34,11,.006,0],[Rt,12,.11,-1e-4],[to,13,.04,-1e-4]],Y=[[2.181,-1],[2.781,-.9],[3.481,-.64],[4.25,-.15],[4.75,0],[8.5,.26],[10.5,.62],[13.5,.9],[15,1.12]],me=Fa(Y),T=h.length,Z=new Float64Array(T),ge=new Float64Array(T),Ke=new Float64Array(T),We=new Float64Array(T),Ve=null,_=0,ke=1,Re=ae=>{let ie=_,Pe=ke;for(let ut=0;ut<40;ut++){let $e=(ie+Pe)/2;Ve($e)<ae?ie=$e:Pe=$e}return(ie+Pe)/2},ve=(ae,ie,Pe)=>(ae(ie+Pe)-ae(ie-Pe))/(2*Pe);function He({S:ae,yE:ie,y1:Pe,vh:ut=900}){Ve=ae,_=ie,ke=Pe;let $e=Y[0][0],Mt=Y[Y.length-1][0];for(let dt=0;dt<T;dt++){let ft=h[dt][0];Z[dt]=ft<=-1?ie:Re(ft);let Kt=1;if(ft>-1){let Fe=$e,Tt=Mt;for(let xt=0;xt<50;xt++){let Zt=(Fe+Tt)/2;me(Zt)<ft?Fe=Zt:Tt=Zt}Kt=ve(ae,Z[dt],.5)*ut/Math.max(1e-9,ve(me,(Fe+Tt)/2,1e-4))}Ke[dt]=h[dt][2]*Kt,We[dt]=h[dt][3]*Kt*Kt}for(let dt=0;dt<T-1;dt++){let ft=Z[dt+1]-Z[dt],Kt=Ke[dt],Fe=Ke[dt+1],Tt=We[dt]*ft,xt=We[dt+1]*ft;ge[dt]=(F[h[dt+1][1]]-F[h[dt][1]])/ft-((Kt+Fe)/2+(Tt-xt)/12)}}function Qe(ae){if(ae<=Z[0])return 0;if(ae>=Z[T-1])return F[h[T-1][1]];let ie=0;for(;ae>Z[ie+1];)ie++;let Pe=Z[ie+1]-Z[ie],ut=(ae-Z[ie])/Pe,$e=ut*ut,Mt=$e*ut,dt=Mt*ut,ft=Ke[ie],Kt=Ke[ie+1],Fe=We[ie]*Pe,Tt=We[ie+1]*Pe,xt=ft*(ut-Mt+dt/2)+Fe*($e/2-2*Mt/3+dt/4)+Kt*(Mt-dt/2)+Tt*(dt/4-Mt/3)+ge[ie]*Mt*(10-15*ut+6*$e);return F[h[ie][1]]+Pe*xt}let at=[0,1,2].map(ae=>dr([-1,-.9],[ue.getComponent(ae),Q.getComponent(ae)],[0,0])),it=ae=>Xt(Vt((ae+.9)/(s+.9))),S=ae=>Xt(Vt((ae+.9)/(k+.9))),se=ae=>Xt(Vt((ae-G)/(K-G))),xe=.34,Ge=Rt-.005,Se=dr([-1,-.9,A,-.5,-.25,0,.16,.34,Rt,to],[38,48,N,38,31,30,30,32,42,52],[0,0,null,null,null,null,null,null,null,null]),Ee=31.26,At=we,Qt=Ae,Nt=B,wt=(ae,ie)=>{let Pe=ae+1,ut=Pe<.08?Pe*Pe/.16:Pe-.04,$e=Nt*(ut-.06);return ie.copy(At).multiplyScalar(Ee*Math.cos($e)).addScaledVector(Qt,Ee*Math.sin($e)).add(Q)},Lt=ae=>1+15*(1-Xt(Vt((ae-H)/(ce-H)))),qe=ae=>Xt(Vt((ae+.9)/.04))*(1-Xt(Vt((ae-k)/.06))),je=ae=>Xt(Vt((ae+.06)/.06));function Gt(ae,ie,Pe){let ut=ie.length()-10;Pe.multiplyScalar(Vt((ut-1)/6));let $e=qe(ae),Mt=je(ae);return $e>0&&Pe.addScaledVector(Ie,-$e*Pe.dot(Ie)),Mt>0&&Pe.addScaledVector(O,-Mt*Pe.dot(O)),Pe}let fo=t(),lt=t();function It(ae,ie,Pe,ut){let $e=Math.min(Math.max(ae,-1),to),Mt=$e<=-1?Z[0]:$e>=to?Z[T-1]:Re($e),dt=Qe(Mt);if(x.getPoint(x.getUtoTmapping(0,Math.max(0,Math.min(m[m.length-1],dt))),ie),$e<=-.9)Pe.set(at[0]($e),at[1]($e),at[2]($e));else if($e>=K)Pe.copy(X);else{let Kt=it($e),Fe=ie.length(),Tt=Math.log(Fe+(Math.sqrt(Math.max(0,Fe*Fe-100))-Fe)*Kt),xt=se($e),Zt=Math.exp(Tt+(Math.log(X.distanceTo(ie))-Tt)*xt);$e>=k?Pe.copy(X).sub(ie).normalize().multiplyScalar(Zt).add(ie):Pe.copy(ie).add(g(S($e)*w(lt.copy(X).sub(ie)),lt).multiplyScalar(Zt))}let ft=Xt(Vt(($e-xe)/(Ge-xe)));return ft>0&&Pe.lerp(fo.copy(ie).addScaledVector(re,40),ft),ut&&ut.set(0,1,0),Se($e)}return{toSun:le,EARTH:Q,MARS:X,C0:Me,L0:ue,P1:he,H2:E,EN1:et,ENP:Ue,LCA:re,PN:Ie,QN:O,CA:to,E0:Rt,E1:ca,MOON_R:Ee,layout:He,spaceCam:It,moonAt:wt,marsFar:Lt,marsQ:st,drift:Gt}}var wi=.45,Po=(e,t,r)=>Xt(Vt((e-t)/(r-t)));function gr(e,t,r){if(!(r<1))return t;let c=1-(1-wi)*Po(e,-.86,-.74),o=Math.min(2.2,(1.12/r)**c),n=Po(e,-1,-.9);return 2*Math.atan(Math.tan(t*Math.PI/360)*(1+n*(o-1)))*180/Math.PI}function xr(e,t){let r=1-Po(t,.6,.8);if(r<=0)return 0;let c=Po(e,-1,-.93)*(1-Po(e,-.84,-.74)),o=Po(e,.5,.6)*(1-Po(e,.88,.98));return r*(.2*c+.14*o)}function Bn({high:e=!0,rockets:t=!0}={}){let r=(()=>{let s=7;return()=>(s=s*16807%2147483647)/2147483647})(),c=[62,132,204],o=8,n={land:[[55,-150],[15,-168]],build:[-25,-100]},P=[{x:0,z:0,r:20,bt:.02,kind:"hub"}],b=[];for(let s=0;s<4;s++){let G=Math.PI/8+s*Math.PI/2;P.push({x:Math.cos(G)*96,z:Math.sin(G)*96,r:15,bt:.26+s*.08,kind:"outer"}),b.push({a:G,r0:19,len:62,y:2.6,radius:2.4,bt:.12+s*.07})}let z=(s,G)=>Math.abs(((s-G)%(Math.PI*2)+Math.PI*3)%(Math.PI*2)-Math.PI),y=[],V=[];for(let s=34;s<238;s+=14){let G=s*.11;for(;G<s*.11+Math.PI*2-.05;){let k=Math.min(6.6,2.6+r()*3.2+5*Math.exp(-s/70)),K=Math.cos(G)*s,H=Math.sin(G)*s,ce=[...Array(o)].some((be,de)=>z(G,de*Math.PI/4)*s<k+4),ne=s<86&&b.some(be=>z(G,be.a)*s<k+3.5);if(!(ce||ne||c.some(be=>Math.abs(s-be)<k+3.5)||P.some(be=>Math.hypot(K-be.x,H-be.z)<be.r+k+3))&&r()>.1){let be=.06+s/238*.58+r()*.08;s>175&&r()<.28?V.push({x:K,z:H,w:8+r()*4,d:5,h:2.5+r()*2.5,rot:G,bt:be}):y.push({x:K,z:H,r:k,ys:.72+r()*.35,rot:r()*6.28,bt:be,seed:r()*50})}G+=(2*k+2.6)/s}}let A=[...y].sort((s,G)=>s.bt-G.bt);e||A.forEach((s,G)=>s.skip=G%2===1),t&&A.forEach(s=>{(n.land.some(([G,k])=>Math.hypot(s.x-G,s.z-k)<s.r+16)||Math.hypot(s.x-n.build[0],s.z-n.build[1])<s.r+30)&&(s.skip=!0)});let U=(s,G)=>{let k=Math.sin(s*.1271+G*.3117+1.7)*43758.5453;return k-Math.floor(k)};y.forEach(s=>{let G=U(s.x,s.z);s.type=G<.26?0:G<.56?1:G<.8?2:3,s.h=s.r*s.ys});let N=[];for(let s=262;s<345;s+=4.2)for(let G=.25;G<1.35;G+=3.2/s)N.push({x:Math.cos(G)*s,z:Math.sin(G)*s,bt:.22+(s-262)/83*.22+(G-.25)*.12});return{units:"m, colony space (+y up); bt = build start in city progress 0..1",rings:c.map(s=>({r:s,bt:.02+s/236*.55})),avenues:[...Array(o)].map((s,G)=>({a:G*Math.PI/4,r0:20,r1:250,bt:0})),domes:P,tubes:b,habs:y.filter(s=>!s.skip),fabs:V,solar:{r0:262,r1:345,a0:.25,a1:1.35,panel:[3,2.2],tilt:.5,cells:N},oldPad:{x:Math.cos(-.55)*300,z:Math.sin(-.55)*300,r:26},ships:n.land.map(([s,G])=>({x:s,z:G})),buildPad:{x:n.build[0],z:n.build[1],r:16.5,tower:{x:n.build[0]-12,z:n.build[1]+10}}}}var xo=`
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
`,Vn=`
float habLit(float h, float j){ float t0 = 0.03 + 0.6 * fract(h * 13.7 + j); return smoothstep(t0, t0 + 0.04, night) * (0.55 + 0.45 * night); }
`,ua=Vn,Lo=`#include <lights_fragment_maps>
  iblIrradiance *= 1. - 0.9 * night; radiance *= 1. - 0.9 * night;`;function Un({THREE:e,renderer:t,sunDir:r,night:c=0}){let o=(r?r.clone():new e.Vector3(-.95,.24,-.21)).normalize(),n=new e.Scene,P=new e.SphereGeometry(10,64,32),b=new e.ShaderMaterial({side:e.BackSide,depthWrite:!1,uniforms:{sunDir:{value:o},night:{value:c}},vertexShader:"varying vec3 vD; void main(){ vD = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }",fragmentShader:`uniform vec3 sunDir; uniform float night; varying vec3 vD;
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
    }`});n.add(new e.Mesh(P,b));let z=new e.PMREMGenerator(t),y=z.fromScene(n,0,.1,100);return z.dispose(),P.dispose(),b.dispose(),y.texture.userData.renderTarget=y,y.texture}function Nn({THREE:e,renderer:t,envMap:r=null,frameDetail:c="high"}={}){let o=e.Vector3,n={value:0},P={},b=[];function z(f){let v=[],x=[],m={};for(let T in f)m[T]=[];let l=new o,F=new o,h=new o,Y=(T,Z,ge,Ke)=>{v.push(T.x,T.y,T.z),x.push(Z.x,Z.y,Z.z);for(let We in f){let Ve=f[We],_=ge[We];if(typeof _=="function"&&(_=_(T,Z)),_===void 0&&(_=Ve===1?0:[0,0,0]),Ve===1)m[We].push(Array.isArray(_)?_[Ke]:_);else{let ke=Array.isArray(_[0])?_[Ke]:_;for(let Re=0;Re<Ve;Re++)m[We].push(ke[Re]||0)}}},me={tri(T,Z,ge,Ke={},We=null,Ve=null){l.subVectors(Z,T),F.subVectors(ge,T),h.crossVectors(l,F).normalize();let _=[0,1,2];We&&h.dot(We)<0&&(_=[0,2,1],h.negate());let ke=[T,Z,ge];for(let Re of _)Y(ke[Re],Ve?Ve[Re]:h,Ke,Re)},quad(T,Z,ge,Ke,We={},Ve=null){me.tri(T,Z,ge,We,Ve),me.tri(T,ge,Ke,We,Ve)},box(T,Z,ge,Ke,We,Ve,_={},ke=!0){let Re=new e.BoxGeometry(Ke,We,Ve);Re.translate(T,Z,ge),me.geo(Re,_,ke?ve=>ve.y<-.5:null),Re.dispose()},geo(T,Z={},ge=null,Ke=!1){let We=T.index?T.toNonIndexed():T,Ve=We.attributes.position,_=We.attributes.normal,ke=new o,Re=new o,ve=new o,He=new o,Qe=new o,at=new o;for(let it=0;it<Ve.count;it+=3)ke.fromBufferAttribute(Ve,it),Re.fromBufferAttribute(Ve,it+1),ve.fromBufferAttribute(Ve,it+2),He.fromBufferAttribute(_,it),Qe.fromBufferAttribute(_,it+1),at.fromBufferAttribute(_,it+2),!(ge&&ge(He.clone().add(Qe).add(at).normalize()))&&(Ke?(l.subVectors(Re,ke),F.subVectors(ve,ke),h.crossVectors(l,F).normalize(),Y(ke,h,Z,0),Y(Re,h,Z,1),Y(ve,h,Z,2)):(Y(ke,He,Z,0),Y(Re,Qe,Z,1),Y(ve,at,Z,2)));We!==T&&We.dispose()},build(){let T=new e.BufferGeometry;T.setAttribute("position",new e.Float32BufferAttribute(v,3)),T.setAttribute("normal",new e.Float32BufferAttribute(x,3));for(let Z in f)T.setAttribute(Z,new e.Float32BufferAttribute(m[Z],f[Z]));return T.computeBoundingSphere(),T.computeBoundingBox(),T}};return me}let y=f=>(f.index?f.index.count:f.attributes.position.count)/3,V=(f=>()=>(f=f*16807%2147483647)/2147483647)(11);function A(f){let v=new e.IcosahedronGeometry(1,f-1),x=(1+Math.sqrt(5))/2;v.applyQuaternion(new e.Quaternion().setFromUnitVectors(new o(-1,x,0).normalize(),new o(0,1,0)));let m=v.attributes.position,l=[],F=new Map,h=[],Y=new Map,me=T=>{let Z=`${Math.round(T.x*1e4)},${Math.round(T.y*1e4)},${Math.round(T.z*1e4)}`,ge=F.get(Z);return ge===void 0&&(ge=h.length,h.push(T.clone()),F.set(Z,ge)),ge};for(let T=0;T<m.count;T+=3){let Z=[0,1,2].map(We=>{let Ve=new o().fromBufferAttribute(m,T+We);return Math.abs(Ve.y)<1e-4&&(Ve.y=0),Ve}),ge=Z[0].clone().add(Z[1]).add(Z[2]).divideScalar(3);if(ge.y<=1e-4)continue;new o().subVectors(Z[1],Z[0]).cross(new o().subVectors(Z[2],Z[0])).dot(ge)<0&&Z.reverse();let Ke=Z.map(me);l.push({v:Z,c:ge});for(let We=0;We<3;We++){let Ve=Ke[We],_=Ke[(We+1)%3],ke=Ve<_?Ve+"_"+_:_+"_"+Ve;Y.has(ke)||Y.set(ke,[Ve,_])}}return v.dispose(),{faces:l,verts:h,edges:[...Y.values()]}}function U(f,v,x,m,l,F,h,Y,me=!1){let T=v.clone().multiplyScalar(m),Z=x.clone().multiplyScalar(m),ge=Z.clone().sub(T).normalize(),Ke=T.clone().add(Z).normalize(),We=new o().crossVectors(ge,Ke).normalize(),Ve=new o().crossVectors(We,ge).normalize(),_=me?[Ve.clone().multiplyScalar(-h).addScaledVector(We,l),Ve.clone().multiplyScalar(F),Ve.clone().multiplyScalar(-h).addScaledVector(We,-l)]:[Ve.clone().multiplyScalar(-h).addScaledVector(We,l),Ve.clone().multiplyScalar(F).addScaledVector(We,l*.5),Ve.clone().multiplyScalar(F).addScaledVector(We,-l*.5),Ve.clone().multiplyScalar(-h).addScaledVector(We,-l)];for(let ke=0;ke<_.length-1;ke++)f.quad(T.clone().add(_[ke]),Z.clone().add(_[ke]),Z.clone().add(_[ke+1]),T.clone().add(_[ke+1]),Y,_[ke].clone().add(_[ke+1]))}function N(f,v,x,m,l,F,h=4){let Y=v.clone().normalize(),me=Y.clone().multiplyScalar(x-.004),T=new o(0,1,0);Math.abs(Y.y)>.9&&T.set(1,0,0),T.cross(Y).normalize();let Z=Y.clone().cross(T),ge=Y.clone().multiplyScalar(x+l),Ke=V()*6.28,We=[...Array(h)].map((Ve,_)=>{let ke=Ke+_/h*Math.PI*2;return me.clone().addScaledVector(T,Math.cos(ke)*m).addScaledVector(Z,Math.sin(ke)*m)});for(let Ve=0;Ve<h;Ve++)f.tri(We[Ve],We[(Ve+1)%h],ge,F,Y)}let s=(f,v)=>f.clone().add(new o(V()-.5,V()-.5,V()-.5).multiplyScalar(v)).normalize(),G=[[1,0,0],[0,1,0],[0,0,1]];function k(f,v,x){return f.onBeforeCompile=m=>{m.uniforms.night=n,x(m),m.fragmentShader=m.fragmentShader.replace("#include <normal_fragment_maps>",`#include <normal_fragment_maps>
        { vec3 dnx = dFdx(normal), dny = dFdy(normal); float k = min(.18, 2. * max(dot(dnx, dnx), dot(dny, dny))); roughnessFactor = sqrt(roughnessFactor * roughnessFactor + k); }`)},f.customProgramCacheKey=()=>"hab-"+v,b.push(f),f}function K(f,v,x){let m=new e.MeshDepthMaterial({depthPacking:e.RGBADepthPacking});return m.onBeforeCompile=l=>{l.vertexShader=v+xo+l.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
`+x)},m.customProgramCacheKey=()=>"habdepth-"+f,m}let H=A(4),ce=.995,ne=.9,$=.985,be=f=>[1-f.y,Math.min(1,Math.abs(f.y-.36)*2.6),V()],de=z({sel:3,bary:3,kind:1}),Oe=z({sel:3,bary:3,kind:1}),we=z({sel:3,bary:3,kind:1}),Ae=z({sel:3,bary:3,kind:1}),B=f=>f.clone().normalize(),le=(f,v)=>f.clone().addScaledVector(v,1).normalize(),Q=[[.5,.5,0],[0,.5,.5],[.5,0,.5]];H.faces.forEach(f=>{let v=f.v.map(h=>f.c.clone().lerp(h,ne).multiplyScalar(ce)),x=be(f.c),m=s(f.c.clone().normalize(),.03).sub(f.c.clone().normalize());de.tri(v[0],v[1],v[2],{sel:x,bary:G,kind:0},f.c,v.map(B)),Oe.tri(v[0],v[1],v[2],{sel:x,bary:G,kind:0},f.c,v.map(h=>le(B(h),m)));let l=[[0,1],[1,2],[0,2]].map(([h,Y])=>v[h].clone().add(v[Y]).normalize().multiplyScalar(ce*.997)),F=[[v[0],l[0],l[2],[G[0],Q[0],Q[2]]],[l[0],v[1],l[1],[Q[0],G[1],Q[1]]],[l[2],l[1],v[2],[Q[2],Q[1],G[2]]],[l[0],l[1],l[2],[Q[0],Q[1],Q[2]]]];for(let[h,Y,me,T]of F)we.tri(h,Y,me,{sel:x,bary:T,kind:0},f.c,[h,Y,me].map(B)),Ae.tri(h,Y,me,{sel:x,bary:T,kind:0},f.c,[h,Y,me].map(Z=>le(B(Z),m)))});for(let f of[we,de]){let v=[[.2,0]];for(let h=0;h<=6;h++){let Y=h/6*Math.PI;v.push([.2*Math.cos(Y),.2+.2*Math.sin(Y)])}v.push([-.2,0]);let x=.7,m=1.2,l=(h,[Y,me])=>new o(h,me,Y);for(let h=0;h<v.length-1;h++){let Y=[(v[h][0]+v[h+1][0])/2,(v[h][1]+v[h+1][1])/2-.15];f.quad(l(x,v[h]),l(m,v[h]),l(m,v[h+1]),l(x,v[h+1]),{kind:1,bary:[.3,.3,.3]},new o(0,Y[1],Y[0]))}let F=new o(m,.17,0);for(let h=0;h<v.length;h++)f.tri(F,l(m,v[h]),l(m,v[(h+1)%v.length]),{kind:1,bary:[.3,.3,.3]},new o(1,0,0));f.quad(new o(m+.006,.02,.11),new o(m+.006,.02,-.11),new o(m+.006,.31,-.11),new o(m+.006,.31,.11),{kind:2,bary:[.3,.3,.3]},new o(1,0,0)),f.quad(new o(m+.01,.2,.05),new o(m+.01,.2,-.05),new o(m+.01,.27,-.05),new o(m+.01,.27,.05),{kind:3,bary:[.3,.3,.3]},new o(1,0,0)),f.quad(new o(.98,.18,.203),new o(1.06,.18,.203),new o(1.06,.26,.203),new o(.98,.26,.203),{kind:3,bary:[.3,.3,.3]},new o(0,0,1))}let j=de.build(),Me=Oe.build(),ue=we.build(),pe=Ae.build(),De=z({kind:1}),J=z({kind:1}),he=c==="low";H.edges.forEach(([f,v])=>U(De,H.verts[f],H.verts[v],$,.017,.019,.014,{kind:0},he)),H.verts.forEach(f=>N(De,f,$,.03,.03,{kind:1},he?3:4));for(let f of[J,De]){let v=new e.CylinderGeometry(.075,.085,.05,8,1,!1);v.translate(0,$+.02,0),f.geo(v,{kind:4},F=>F.y<-.5,!0),v.dispose();let x=.3,m=Math.sqrt(1-x*x)*$;f.box(x,m+.17,.05,.016,.36,.016,{kind:2});let l=new e.ConeGeometry(.09,.04,9,1,!0);l.rotateX(Math.PI),l.rotateZ(-.9),l.translate(x+.03,m+.3,.05),f.geo(l,{kind:2},null,!0),l.dispose(),f.box(x,m+.36,.05,.03,.03,.03,{kind:3}),f.box(1.2/1.015+.012,.345/1.015,0,.03,.025,.06,{kind:5})}let Le=De.build(),Ie=J.build(),ee=`#ifdef HAB_FAR
      { float re = min(min(vBary.x, vBary.y), vBary.z), fw = max(fwidth(re), 1e-4), w0 = 0.046;
        float rib = mix(1. - smoothstep(w0 - .5 * fw, w0 + .5 * fw, re), min(1., 5.4 * w0), smoothstep(.6 * w0, 2.5 * w0, fw));
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(.55, .5, .44), rib * .85); habRib = rib; }
      #endif`,I=f=>k(new e.MeshStandardMaterial({color:16777215,roughness:.55,metalness:.08,envMap:r,envMapIntensity:.45}),f?"shell-far":"shell",v=>{v.vertexShader=`attribute vec3 sel; attribute vec3 bary; attribute float kind; varying vec3 vSel; varying vec3 vBary; varying float vKind; varying float vIh; varying float vY; varying float vFrac;
`+xo+v.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
      float ih = habInstHash(), frac; vec3 hw; habType(ih, frac, hw);
      transformed *= kind < 0.5 ? step(frac, dot(hw, sel)) : habHasVest(ih);
      vSel = sel; vBary = bary; vKind = kind; vIh = ih; vY = position.y; vFrac = frac;`),v.fragmentShader=(f?`#define HAB_FAR
`:"")+`uniform float night; varying vec3 vSel; varying vec3 vBary; varying float vKind; varying float vIh; varying float vY; varying float vFrac; float habRib = 0.;
`+ua+v.fragmentShader.replace("#include <color_fragment>",`#include <color_fragment>
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
      totalEmissiveRadiance += vec3(1., 0.62, 0.3) * win * (0.15 + 2.6 * habLit(vIh, 0.));`).replace("#include <lights_fragment_maps>",Lo)}),g=I(!1),w=I(!0),L=f=>k(new e.MeshStandardMaterial({color:16777215,roughness:.05,metalness:.92,envMap:r,envMapIntensity:1.5}),f?"glass-far":"glass",v=>{v.vertexShader=`attribute vec3 sel; attribute vec3 bary; attribute float kind; varying vec3 vSel; varying vec3 vBary; varying float vIh; varying float vY;
`+xo+v.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
      float ih = habInstHash(), frac; vec3 hw; habType(ih, frac, hw);
      transformed *= 1. - step(frac, dot(hw, sel));
      vSel = sel; vBary = bary; vIh = ih; vY = position.y;`),v.fragmentShader=(f?`#define HAB_FAR
`:"")+`uniform float night; varying vec3 vSel; varying vec3 vBary; varying float vIh; varying float vY; float habRib = 0.;
`+ua+v.fragmentShader.replace("#include <color_fragment>",`#include <color_fragment>
      float pr = fract(vSel.z * 23.7 + vIh * 3.3), edge = min(min(vBary.x, vBary.y), vBary.z), mull = 1. - smoothstep(0.03, 0.07, edge);
      diffuseColor.rgb = mix(mix(vec3(0.30, 0.34, 0.39), vec3(0.42, 0.33, 0.24), step(0.62, pr)), vec3(0.2, 0.19, 0.18), mull);
      ${ee}
      mull = max(mull, habRib);`).replace("#include <roughnessmap_fragment>",`#include <roughnessmap_fragment>
      roughnessFactor = mix(roughnessFactor + 0.05 * pr, 0.55, mull);
      roughnessFactor = max(roughnessFactor, 0.05 + 0.25 * smoothstep(40., 300., length(vViewPosition))); // distance floor: far facets stop sparkling`).replace("#include <metalnessmap_fragment>",`#include <metalnessmap_fragment>
      metalnessFactor = mix(metalnessFactor, 0.4, mull);`).replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>
      float on = 0.45 + 0.55 * step(0.3, fract(vIh * 11.3)), lit = 0.35 + 0.65 * step(0.38, fract(pr * 5.7 + vIh));
      totalEmissiveRadiance += vec3(1., 0.56, 0.24) * habLit(vIh, floor(pr * 4.) * 0.17) * on * lit * (1. - mull) * (0.7 + 0.9 * (1. - vY)) * 1.7;`).replace("#include <lights_fragment_maps>",Lo)}),R=L(!1),X=L(!0);R.userData.night=n;let d=k(new e.MeshStandardMaterial({color:12761517,roughness:.38,metalness:.55,envMap:r,envMapIntensity:.7}),"frame",f=>{f.vertexShader=`attribute float kind; varying float vKind; varying float vHs;
`+xo+f.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
      float ih = habInstHash();
      transformed *= kind > 1.5 && kind < 3.5 ? habHasAnt(ih) : (kind > 4.5 ? habHasVest(ih) : 1.);
      vKind = kind;
      #ifdef USE_INSTANCING
        vHs = length(instanceMatrix[0].xyz);
      #else
        vHs = length(modelMatrix[0].xyz);
      #endif`),f.fragmentShader=`uniform float night; varying float vKind; varying float vHs;
`+f.fragmentShader.replace("#include <color_fragment>",`#include <color_fragment>
      float lamp = step(2.5, vKind) * (1. - step(3.5, vKind)) + step(4.5, vKind);
      diffuseColor.rgb *= vKind > 0.5 && vKind < 1.5 ? 0.62 : (vKind > 3.5 && vKind < 4.5 ? 0.5 : 1.);
      // struts/hubs narrower than a pixel: blend toward the shell's colour and finish so they stop shimmering
      float thin = (1. - clamp(0.034 * vHs / max(length(fwidth(vViewPosition)), 1e-5), 0., 1.)) * step(vKind, 1.5);
      diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.62, 0.58, 0.54), thin * 0.7);`).replace("#include <roughnessmap_fragment>",`#include <roughnessmap_fragment>
      roughnessFactor = mix(roughnessFactor, 0.6, thin);`).replace("#include <metalnessmap_fragment>",`#include <metalnessmap_fragment>
      metalnessFactor = mix(metalnessFactor, 0.1, thin);`).replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>
      totalEmissiveRadiance += (vKind < 4. ? vec3(1., 0.15, 0.08) : vec3(1., 0.8, 0.55)) * lamp * (0.4 + 4. * night);`).replace("#include <lights_fragment_maps>",Lo)}),i=K("shell",`attribute float kind;
`,"transformed *= kind < 0.5 ? 1. : habHasVest(habInstHash());"),p=K("frame",`attribute float kind;
`,"float ih0 = habInstHash(); transformed *= kind > 1.5 && kind < 3.5 ? habHasAnt(ih0) : (kind > 4.5 ? habHasVest(ih0) : 1.);"),O=f=>{let v=[[0,.5,0],[.9,.5,0],[1,.5,1],[1.035,.47,1],[1.08,.42,2],[1.16,.29,2],[1.24,.13,2],[1.31,.03,2],[1.37,0,3]],x=[],m=[],l=[],F=(_,ke,Re)=>{let ve=Math.sin(_*12.9898+ke*78.233+Re*37.719)*43758.5453;return ve-Math.floor(ve)};for(let _=0;_<v.length;_++)for(let ke=0;ke<=f;ke++){let Re=ke%f,ve=Re/f*Math.PI*2,[He,Qe,at]=v[_],it=at===2?F(Re,_,1)-.5+.6*(Math.sin(ve*3+1.3)*.5):0,S=He+it*.05,se=Math.max(0,Qe+(at===2?(F(Re,_,2)-.5)*.07+it*.03:0));x.push(Math.cos(ve)*S,se,Math.sin(ve)*S);let xe=F(Re,_,3),Ge=at===0?[.5+xe*.03,.42+xe*.03,.35+xe*.02]:at===1?[.36,.32,.28]:at===2?[.4+xe*.1,.18+xe*.05,.085+xe*.025]:[.38,.17,.08];m.push(...Ge)}for(let _=0;_<v.length-1;_++)for(let ke=0;ke<f;ke++){let Re=_*(f+1)+ke,ve=Re+f+1;l.push(Re,Re+1,ve,Re+1,ve+1,ve)}let h=new e.BufferGeometry;h.setAttribute("position",new e.Float32BufferAttribute(x,3)),h.setAttribute("color",new e.Float32BufferAttribute(m,3)),h.setIndex(l),h.computeVertexNormals();let Y=h.toNonIndexed(),me=z({color:3,kind:1}),T=Y.attributes.color,Z=Y.attributes.position,ge=Y.attributes.normal,Ke=new o,We=new o,Ve=new o;for(let _=0;_<Z.count;_+=3)Ke.fromBufferAttribute(Z,_),We.fromBufferAttribute(Z,_+1),Ve.fromBufferAttribute(Z,_+2),!(Ke.distanceTo(We)<1e-6||We.distanceTo(Ve)<1e-6||Ke.distanceTo(Ve)<1e-6)&&me.tri(Ke,We,Ve,{color:[0,1,2].map(ke=>[T.getX(_+ke),T.getY(_+ke),T.getZ(_+ke)]),kind:0},null,[0,1,2].map(ke=>new o().fromBufferAttribute(ge,_+ke)));h.dispose(),Y.dispose();for(let _=0;_<6;_++){let ke=_/6*Math.PI*2+.26;me.box(Math.cos(ke)*1,.565,Math.sin(ke)*1,.03,.13,.03,{color:[.25,.24,.23],kind:1})}return me.build()},D=O(30),te=O(14),Ce=k(new e.MeshStandardMaterial({color:16777215,vertexColors:!0,roughness:.95,metalness:0}),"pad",f=>{f.vertexShader=`attribute float kind; varying float vKind; varying float vPY;
`+f.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
      vKind = kind; vPY = position.y;`),f.fragmentShader=`uniform float night; varying float vKind; varying float vPY;
`+f.fragmentShader.replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>
      totalEmissiveRadiance += vec3(1., 0.72, 0.42) * step(0.5, vKind) * step(0.6, vPY) * (0.3 + 5. * night);`)}),E=(()=>{let v=[],x=[],m=[],l=[[.95,.62],[1.3,.38],[1.75,0]];l.forEach(([h,Y])=>{for(let me=0;me<=30;me++){let T=me/30*Math.PI*2;v.push(Math.cos(T)*h,.025,Math.sin(T)*h),x.push(Y)}});for(let h=0;h<l.length-1;h++)for(let Y=0;Y<30;Y++){let me=h*31+Y,T=me+30+1;m.push(me,me+1,T,me+1,T+1,T)}let F=new e.BufferGeometry;return F.setAttribute("position",new e.Float32BufferAttribute(v,3)),F.setAttribute("alpha",new e.Float32BufferAttribute(x,1)),F.setIndex(m),F.computeBoundingSphere(),F})(),fe=new e.ShaderMaterial({transparent:!0,depthWrite:!1,polygonOffset:!0,polygonOffsetFactor:-2,polygonOffsetUnits:-2,uniforms:{strength:{value:.75}},vertexShader:`attribute float alpha; varying float vA; void main(){ vA = alpha;
      #ifdef USE_INSTANCING
        vec4 p = modelMatrix * instanceMatrix * vec4(position, 1.);
      #else
        vec4 p = modelMatrix * vec4(position, 1.);
      #endif
      gl_Position = projectionMatrix * viewMatrix * p; }`,fragmentShader:"uniform float strength; varying float vA; void main(){ gl_FragColor = vec4(0.06, 0.025, 0.012, vA * vA * strength); }"}),oe=(()=>{let f=z({kind:1,variant:1});f.box(0,.03,0,1.04,.06,1.06,{kind:6,variant:0});let v=.42,x=12,m=[...Array(x+1)].map((h,Y)=>{let me=Y/x*Math.PI;return[.5*Math.cos(me),v+.58*Math.sin(me)]}),l=(h,Y,me)=>new o(h,me,Y);for(let h of[-1,1])f.quad(l(-.5,.5*h,.06),l(.5,.5*h,.06),l(.5,.5*h,v),l(-.5,.5*h,v),{kind:0,variant:1},new o(0,0,h));for(let h=0;h<x;h++){let[Y,me]=m[h],[T,Z]=m[h+1],ge=new o(0,(me+Z)/2-v,(Y+T)/2);f.quad(l(-.5,Y,me),l(.5,Y,me),l(.5,T,Z),l(-.5,T,Z),{kind:0,variant:1},ge)}for(let h of[-1,1]){f.quad(l(.5*h,-.5,.06),l(.5*h,.5,.06),l(.5*h,.5,v),l(.5*h,-.5,v),{kind:0,variant:1},new o(h,0,0));for(let Y=0;Y<x;Y++)f.tri(l(.5*h,0,v),l(.5*h,m[Y][0],m[Y][1]),l(.5*h,m[Y+1][0],m[Y+1][1]),{kind:0,variant:1},new o(h,0,0))}f.quad(l(.506,-.32,.06),l(.506,.32,.06),l(.506,.32,.66),l(.506,-.32,.66),{kind:1,variant:1},new o(1,0,0)),f.box(.51,.69,0,.012,.03,.7,{kind:3,variant:1});for(let h of[-1,1])f.quad(l(-.44,.506*h,.24),l(.44,.506*h,.24),l(.44,.506*h,.34),l(-.44,.506*h,.34),{kind:2,variant:1},new o(0,0,h));f.quad(l(.2,.507,.06),l(.3,.507,.06),l(.3,.507,.22),l(.2,.507,.22),{kind:1,variant:1},new o(0,0,1)),f.box(-.22,1.02,0,.12,.06,.16,{kind:3,variant:1}),f.box(.12,1.015,0,.08,.05,.1,{kind:3,variant:1}),f.box(-.38,.98,.12,.04,.09,.04,{kind:3,variant:1}),f.box(.515,.74,0,.012,.025,.06,{kind:4,variant:1}),f.box(0,.43,0,1,.74,1,{kind:0,variant:2});for(let[h,Y,me,T]of[[0,.49,1,.025],[0,-.49,1,.025],[.49,0,.025,1],[-.49,0,.025,1]])f.box(h,.83,Y,me,.06,T,{kind:0,variant:2});f.box(-.25,.86,.1,.18,.12,.3,{kind:3,variant:2}),f.box(.05,.84,-.18,.1,.08,.12,{kind:3,variant:2});let F=new e.PlaneGeometry(.34,.5);F.rotateX(-Math.PI/2),F.rotateZ(.25),F.translate(.28,.86,.05),f.geo(F,{kind:5,variant:2},null,!0),F.dispose(),f.quad(l(.504,-.22,.06),l(.504,.22,.06),l(.504,.22,.56),l(.504,-.22,.56),{kind:1,variant:2},new o(1,0,0));for(let h of[-1,1])f.quad(l(-.45,.504*h,.46),l(.45,.504*h,.46),l(.45,.504*h,.6),l(-.45,.504*h,.6),{kind:2,variant:2},new o(0,0,h));return f.quad(l(-.504,-.4,.46),l(-.504,.4,.46),l(-.504,.4,.6),l(-.504,-.4,.6),{kind:2,variant:2},new o(-1,0,0)),f.box(.512,.6,0,.012,.025,.06,{kind:4,variant:2}),f.build()})(),ze=`attribute float kind; attribute float variant;
`,Ze="float shv = fract(habInstHash() * 5.7) < 0.55 ? 1. : 2.; transformed *= (variant < 0.5 || abs(variant - shv) < 0.5) ? 1. : 0.;",Dt=k(new e.MeshStandardMaterial({color:16777215,roughness:.62,metalness:.18,envMap:r,envMapIntensity:.5}),"shed",f=>{f.vertexShader=ze+`varying float vKind; varying vec3 vLP; varying vec3 vSc; varying vec3 vN0;
`+xo+f.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
      ${Ze}
      vKind = kind; vLP = position; vN0 = normal;
      #ifdef USE_INSTANCING
        vSc = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz));
      #else
        vSc = vec3(length(modelMatrix[0].xyz), length(modelMatrix[1].xyz), length(modelMatrix[2].xyz));
      #endif`),f.fragmentShader=`uniform float night; varying float vKind; varying vec3 vLP; varying vec3 vSc; varying vec3 vN0;
`+ua+f.fragmentShader.replace("#include <color_fragment>",`#include <color_fragment>
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
      totalEmissiveRadiance += vec3(1., 0.66, 0.36) * win * habLit(fract(vSc.x * 0.37 + vSc.y * 1.31), floor(m.x / 1.4) * 0.11) * (0.4 + 1.8 * bay) + vec3(1., 0.85, 0.6) * lamp * (0.4 + 4. * night);`).replace("#include <lights_fragment_maps>",Lo)}),et=K("shed",ze,Ze);function Ue(f,{remap:v=0,baryMull:x=!0,color:m=9082530}={}){return k(new e.MeshStandardMaterial({color:m,roughness:.035,metalness:.9,envMap:r,envMapIntensity:1.4,transparent:!0,depthWrite:!1,emissive:16777215,emissiveIntensity:0}),f,l=>{l.vertexShader=(x?`attribute vec3 bary; varying vec3 vBary;
`:"")+`varying float vGY;
`+(`varying float vOh;
`+xo)+l.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
        ${x?"vBary = bary;":""} vGY = position.y; vOh = habInstHash();`),l.fragmentShader=(x?`varying vec3 vBary;
`:"")+`uniform float night; varying float vGY;
varying float vOh;
`+ua+l.fragmentShader.replace("#include <color_fragment>",`#include <color_fragment>
        float mull = ${x?"1. - smoothstep(0.035, 0.08, min(min(vBary.x, vBary.y), vBary.z))":"0."};
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.16, 0.15, 0.14), mull);`).replace("#include <roughnessmap_fragment>",`#include <roughnessmap_fragment>
        roughnessFactor = mix(roughnessFactor, 0.5, mull);`).replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>
        totalEmissiveRadiance = emissive * vec3(1., 0.6, 0.3) * (1. - mull);
        totalEmissiveRadiance += vec3(1., 0.58, 0.26) * habLit(vOh, 0.31) * 0.22 * (1. - mull) * (1.2 - vGY);`).replace("#include <lights_fragment_maps>",Lo).replace("#include <opaque_fragment>",`
        // the sun glint on near-mirror glass overflows half float (inf), which bloom/DOF smear into a hard square: cap it
        outgoingLight = min(outgoingLight, vec3(12.));
        float fr = pow(1. - clamp(abs(dot(normalize(vViewPosition), normal)), 0., 1.), 2.2);
        float lum = dot(outgoingLight, vec3(0.3, 0.59, 0.11));
        diffuseColor.a = ${v?`clamp(opacity / ${v.toFixed(3)}, 0., 1.)`:"opacity"} * clamp(max(max(mix(0.5, 1., fr), lum * 1.4), mull), 0., 1.);
        #include <opaque_fragment>`)})}let re=A(8),Be=(()=>{let f=z({kind:1});return re.edges.forEach(([v,x])=>U(f,re.verts[v],re.verts[x],1,.0042,.006,.005,{kind:0})),re.verts.forEach(v=>N(f,v,1,.009,.008,{kind:1},5)),f.build()})(),Te=(()=>{let f=z({bary:3});return re.faces.forEach(v=>{let x=v.v.map(F=>v.c.clone().lerp(F,.97).multiplyScalar(.994)),m=v.c.clone().normalize(),l=s(m,.02).sub(m);f.tri(x[0],x[1],x[2],{bary:G},v.c,x.map(F=>F.clone().normalize().add(l).normalize()))}),f.build()})(),tt=new e.SphereGeometry(.975,28,10,0,Math.PI*2,0,Math.PI/2),st=(()=>{let f=z({color:3,kind:1}),v=(m,l,F=!0)=>{f.geo(m,l,h=>h.y<-.5,F),m.dispose()};{let m=new e.CircleGeometry(.985,40);m.rotateX(-Math.PI/2),m.translate(0,.004,0),v(m,{color:[.5,.43,.36]})}let x=[[.62,.05],[.48,.1],[.34,.15]];x.forEach(([m,l])=>{let F=new e.CylinderGeometry(m,m*1.02,l,28);F.translate(0,l/2,0),v(F,{color:(h,Y)=>Y.y>.5?[.16+V()*.05,.22+V()*.05,.07]:[.62,.57,.5]})});{let m=new e.CylinderGeometry(.065,.085,.6,10);m.translate(0,.3,0),v(m,{color:[.82,.8,.76]})}for(let m of[.24,.36,.48]){let l=new e.CylinderGeometry(.083-m*.03,.083-m*.03,.035,10,1,!0);l.translate(0,m,0),v(l,{color:[.05,.05,.06],kind:1})}for(let m=0;m<7;m++){let l=m/7*Math.PI*2+.3,F=.78+m%2*.06,h=.08+m%3*.05,Y=Math.cos(l)*F,me=Math.sin(l)*F,T=new e.BoxGeometry(.11,h,.09);T.rotateY(-l),T.translate(Y,h/2,me),v(T,{color:[.84,.82,.78]});let Z=new e.BoxGeometry(.114,.02,.094);Z.rotateY(-l),Z.translate(Y,h*.62,me),v(Z,{color:[.05,.05,.06],kind:1})}for(let m=0;m<44;m++){let l=m%3,[F,h]=x[l],Y=(l===2?.12:x[l+1][0]+.03)+V()*(F-(l===2?.16:x[l+1][0]+.06)),me=V()*6.28,T=.018+V()*.016,Z=new e.IcosahedronGeometry(T,0);Z.scale(1,1.4,1),Z.translate(Math.cos(me)*Y,h+T*1.2,Math.sin(me)*Y);let ge=V();f.geo(Z,{color:[.12+ge*.08,.2+ge*.08,.06]},null,!0),Z.dispose()}return f.build()})(),mt=(()=>{let f=z({color:3});{let v=new e.CylinderGeometry(1.03,1.03,.03,64,1,!0);v.translate(0,.015,0),f.geo(v,{color:[.4,.36,.31]}),v.dispose()}{let v=new e.RingGeometry(.99,1.03,64);v.rotateX(-Math.PI/2),v.translate(0,.03,0),f.geo(v,{color:[.48,.42,.35]}),v.dispose()}{let v=new e.CylinderGeometry(1.035,1.11,.026,64,1,!0);v.translate(0,.013,0),f.geo(v,{color:()=>[.42+V()*.06,.2+V()*.03,.09]}),v.dispose()}return f.build()})(),_e=k(new e.MeshStandardMaterial({color:14209220,roughness:.34,metalness:.6,envMap:r,envMapIntensity:.7}),"lattice",f=>{f.vertexShader=`attribute float kind; varying float vKind;
`+f.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
      vKind = kind;`),f.fragmentShader=`uniform float night; varying float vKind;
`+f.fragmentShader.replace("#include <color_fragment>",`#include <color_fragment>
      diffuseColor.rgb *= vKind > 0.5 ? 0.6 : 1.;`).replace("#include <lights_fragment_maps>",Lo)}),Pt=k(new e.MeshStandardMaterial({color:16777215,vertexColors:!0,roughness:.85,metalness:.05}),"interior",f=>{f.vertexShader=`attribute float kind; varying float vKind;${` varying float vOh;
`+xo}
`+f.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
      vKind = kind; vOh = habInstHash();`),f.fragmentShader=`uniform float night; varying float vKind; varying float vOh;
`+ua+f.fragmentShader.replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>
      totalEmissiveRadiance += vec3(1., 0.66, 0.36) * step(0.5, vKind) * (0.2 + 3.2 * habLit(vOh, 0.31));`)}),zt=new e.MeshStandardMaterial({color:16777215,vertexColors:!0,roughness:.95});b.push(zt);function Je(){let f=new e.Group;f.name="bigDome";let v=new e.Mesh(Be,_e);v.name="lattice",v.castShadow=v.receiveShadow=!0,v.customDepthMaterial=new e.MeshDepthMaterial({depthPacking:e.RGBADepthPacking});let x=new e.Mesh(st,Pt);x.name="interior",x.castShadow=x.receiveShadow=!0;let m=new e.Mesh(mt,zt);m.name="base",m.receiveShadow=!0;let l=new e.Mesh(E,fe);l.name="skirt",l.scale.set(.9,1,.9),l.renderOrder=-1,v.add(x,m,l);let F=Ue("bigglass",{remap:.28}),h=new e.Mesh(Te,F);h.name="glass",h.receiveShadow=!0,h.castShadow=!0;let Y=new e.MeshDepthMaterial({depthPacking:e.RGBADepthPacking,alphaHash:!0,opacity:0,side:e.DoubleSide});h.customDepthMaterial=Y;let me=0;Object.defineProperty(F,"opacity",{get:()=>me,set:ge=>{me=ge,Y.opacity=.45*Math.min(1,Math.max(0,ge/.28))},configurable:!0}),F.opacity=0;let T=new e.MeshBasicMaterial({color:16751184,transparent:!0,opacity:0,side:e.BackSide,blending:e.AdditiveBlending,depthWrite:!1});T.onBeforeCompile=ge=>{ge.uniforms.night=n,ge.vertexShader=`varying float vGY; varying float vOh;
`+xo+ge.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
vGY = position.y; vOh = habInstHash();`),ge.fragmentShader=`uniform float night; varying float vGY; varying float vOh;
`+Vn+ge.fragmentShader.replace("#include <color_fragment>",`#include <color_fragment>
diffuseColor.rgb *= 2.6 * (0.35 + 1.1 * (1. - vGY)) * habLit(vOh, 0.31) / max(night, 0.02);`)},T.customProgramCacheKey=()=>"hab-bigglow";let Z=new e.Mesh(tt,T);return Z.name="glow",f.add(v,h,Z),f}let Ut=16,kt=(()=>{let f=new e.CylinderGeometry(2.4,2.4,1,Ut,1,!0).rotateZ(Math.PI/2).translate(.5,0,0),v=f.toNonIndexed();return f.dispose(),v.computeVertexNormals(),v.computeBoundingSphere(),v})(),Wt=Ue("tube",{baryMull:!1,color:8227478});Wt.emissive.setRGB(1.6,1.6,1.6);let Ye=(()=>{let f=z({kind:1}),v=16,x=.11/62,m=F=>F/Ut*Math.PI*2,l=(F,h,Y)=>new o(F,h*Math.sin(Y),h*Math.cos(Y));for(let F=0;F<=v;F++){let h=Math.min(1-x,Math.max(x,F/v)),Y=2.53,me=2.41;for(let T=0;T<Ut;T++){let Z=m(T),ge=m(T+1),Ke=(Z+ge)/2,We=l(0,1,Ke);f.quad(l(h-x,Y,Z),l(h+x,Y,Z),l(h+x,Y,ge),l(h-x,Y,ge),{kind:0},We),f.quad(l(h-x,me,Z),l(h+x,me,Z),l(h+x,me,ge),l(h-x,me,ge),{kind:0},We.clone().negate());for(let Ve of[-1,1])f.quad(l(h+Ve*x,me,Z),l(h+Ve*x,Y,Z),l(h+Ve*x,Y,ge),l(h+Ve*x,me,ge),{kind:0},new o(Ve,0,0))}if(F%2===0||F===v)for(let T of[-1.1,1.1])f.box(h,-2.52,T,x*5,.16,.7,{kind:3})}f.box(.5,-1.8,0,1,.12,3.1,{kind:1});for(let F of[-1.42,1.42])f.box(.5,-1.72,F,1,.04,.08,{kind:2});for(let F of[-2.1,2.1])f.box(.5,-1.05,F,1,.08,.08,{kind:0});return f.build()})(),Ft=k(new e.MeshStandardMaterial({color:13814462,roughness:.4,metalness:.55,envMap:r,envMapIntensity:.7}),"rib",f=>{f.vertexShader=`attribute float kind; varying float vKind;
`+f.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
      vKind = kind;`),f.fragmentShader=`uniform float night; varying float vKind;
`+f.fragmentShader.replace("#include <color_fragment>",`#include <color_fragment>
      diffuseColor.rgb *= vKind > 0.5 && vKind < 1.5 ? vec3(0.55, 0.5, 0.45) : (vKind > 2.5 ? vec3(0.45, 0.4, 0.36) : vec3(1.));`).replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>
      totalEmissiveRadiance += vec3(1., 0.72, 0.45) * step(1.5, vKind) * (1. - step(2.5, vKind)) * (0.2 + 3. * night);`).replace("#include <lights_fragment_maps>",Lo)});[j,Me,ue,pe,Le,Ie,D,te,E,oe,kt,Ye,Be,Te,st,mt].forEach(f=>f.computeBoundingSphere()),Object.assign(P,{habShell:y(j),habGlass:y(Me),habFrame:y(Le),ringPad:y(D),skirt:y(E),shed:y(oe),tube:y(kt),rib:y(Ye),bigDome:{lattice:y(Be),glass:y(Te),glow:y(tt),interior:y(st),base:y(mt)}});function yt(f){[...b,Wt].forEach(v=>{"envMap"in v&&v!==zt&&v!==Ce&&v!==Pt&&(v.envMap=f,v.needsUpdate=!0)})}return{night:n,tris:P,setEnv:yt,habShellGeo:j,habShellMat:g,habShellDepthMat:i,habShellGeoHi:ue,habShellMatFar:w,habGlassGeo:Me,habGlassMat:R,habGlassGeoHi:pe,habGlassMatFar:X,habFrameGeo:Le,habFrameMat:d,habFrameDepthMat:p,habFrameGeoFar:Ie,ringPadGeo:D,ringPadGeoFar:te,ringPadMat:Ce,skirtGeo:E,skirtMat:fe,bigDome:Je,shedGeo:oe,shedMat:Dt,shedDepthMat:et,tubeGeo:kt,tubeMat:Wt,ribGeo:Ye,ribMat:Ft}}var no={x:0,y:-6e3,z:0},br=.1,_t={land:[[55,-150],[15,-168]],build:[-25,-100]},In=`
float h3(vec3 p){p=fract(p*0.3183099+.1);p*=17.0;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float n3(vec3 x){vec3 i=floor(x);vec3 f=fract(x);f=f*f*(3.0-2.0*f);
return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),
mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n3(p);p*=2.03;a*=.5;}return v;}`;function Gn({THREE:e,renderer:t,scene:r,cam:c,planets:o,sunLight:n,ambient:P,hemi:b,files:z,HIGH:y,lateRockets:V,lodPath:A}){let U=new e.Vector3(no.x,no.y,no.z),N=z.dtmN||512,s=new e.Group;s.position.copy(U),s.visible=!1,r.add(s),n.castShadow=!0;{let pe=n.shadow,De=pe.camera;pe.mapSize.set(y?4096:2048,y?2048:1024),pe.bias=-5e-4,pe.normalBias=.35,De.left=-390,De.right=390,De.near=60,De.far=1300}r.fog=new e.Fog(0,1e8,1e9);let G=(()=>{let pe=7;return()=>(pe=pe*16807%2147483647)/2147483647})(),k=new e.Vector3,K=0,H=null,ce=null,ne=Promise.all([import("./rockets-NJ46RRYQ.js"),import("./foot-model-starship-KKNUMIYN.js"),import("./foot-model-kit-2C76GDRH.js")]).then(([pe,De,J])=>ce={createRockets:pe.createRockets,foot:{buildStarships:De.buildStarships,mergeAll:J.mergeAll,steel:{STEEL_FLAT:De.STEEL_FLAT,steelUniforms:De.steelUniforms,steelShader:De.steelShader}}}).catch(pe=>console.warn("film rockets:",pe)),$={tDtm:{value:null},tHi:{value:null},tCtx:{value:null},uOn:{value:new e.Vector3(0,0,0)},uHB0:{value:0},tMars:o.mars.material.uniforms.tMap},be=o.air&&o.air.uniforms.dome||{uSun:{value:new e.Vector3(0,1,0)},uK:{value:1},uAmb:{value:1},uOrigin:{value:U.clone()}},de=[0,0,0],Oe=500;{let pe=(De,J,he)=>{let Le=new e.DataTexture(new Uint8Array([De,J,he,255]),1,1);return Le.needsUpdate=!0,Le};$.tDtm.value=pe(128,0,0),$.tHi.value=pe(128,128,128),$.tCtx.value=pe(128,128,128)}function we(pe){let De=new e.WebGLRenderTarget(4,1,{depthBuffer:!1,minFilter:e.NearestFilter,magFilter:e.NearestFilter,generateMipmaps:!1}),J=new e.ShaderMaterial({uniforms:{tDtm:{value:pe}},toneMapped:!1,depthTest:!1,depthWrite:!1,vertexShader:"void main(){ gl_Position=vec4(position.xy,0.,1.); }",fragmentShader:`uniform sampler2D tDtm; void main(){ float k=floor(gl_FragCoord.x); vec2 o=vec2(mod(k,2.),floor(k*.5));
      vec2 uv=(vec2(${N/2-.5})+o)/${N}.; gl_FragColor=texture2D(tDtm,vec2(uv.x*.5+.5,uv.y)); }`}),he=new e.Mesh(new e.PlaneGeometry(2,2),J),Le=new e.Scene;he.frustumCulled=!1,Le.add(he);let Ie=new Uint8Array(16),ee=t.getRenderTarget();t.setRenderTarget(De),t.render(Le,c),t.readRenderTargetPixels(De,0,0,4,1,Ie),t.setRenderTarget(ee),De.dispose(),J.dispose(),he.geometry.dispose();let I=w=>(Ie[w*4]*256+Ie[w*4+1])/65535;return-2664.712+352.3924*(((I(0)+I(1))/2+(I(2)+I(3))/2)/2)}let Ae=null;function B(){if(Ae)return Ae;let pe=t.capabilities.getMaxAnisotropy(),De=he=>{try{t.initTexture(he)}catch{}},J=(he,Le,Ie)=>new Promise(ee=>{if(!he)return ee();vo(e,he,{flipY:!0}).then(I=>{Ie(I),De(I),de[Le]=performance.now(),ee()},()=>ee())});return Ae=Promise.all([J(z.dtm,0,he=>{he.colorSpace=e.NoColorSpace,he.magFilter=he.minFilter=e.NearestFilter,he.generateMipmaps=!1,he.flipY=!0,$.tDtm.value=he,$.uHB0.value=we(he)}),J(z.hiBump,1,he=>{he.colorSpace=e.NoColorSpace,he.anisotropy=pe,$.tHi.value=he}),J(z.ctxBump,2,he=>{he.colorSpace=e.NoColorSpace,he.anisotropy=pe,$.tCtx.value=he})])}let le=()=>{let pe=performance.now(),De=J=>J?gt(pe-J,0,Oe):0;$.uOn.value.set(De(de[0]),De(de[1]),De(de[2]))};function*Q(){B();let pe=`
uniform sampler2D tDtm, tHi, tCtx, tMars; uniform vec3 uOn; uniform float uHB0; // uHB0 = hB(vec2(0.)), read back once after the DTM loads
// 16-bit heights live in R (hi byte) and G (lo byte); filter by hand so the bytes never blend across a carry
float dtmTap(vec2 uv, float side){ vec2 t=vec2(uv.x*.5+side*.5, uv.y); vec4 c=texture2D(tDtm,t); return (c.r*255.*256.+c.g*255.)/65535.; }
float dtmBil(vec2 uv, float side){ vec2 p=uv*${N}.-.5, f=fract(p), i=floor(p);
  float a=dtmTap((i+vec2(.5,.5))/${N}.,side), b=dtmTap((i+vec2(1.5,.5))/${N}.,side), c=dtmTap((i+vec2(.5,1.5))/${N}.,side), d=dtmTap((i+vec2(1.5,1.5))/${N}.,side);
  return mix(mix(a,b,f.x),mix(c,d,f.x),f.y); }
float hA(vec2 p){ return -2621.547+62.5074*dtmBil(vec2(p.x/1600.+.5,.5-p.y/1600.),0.); }   // HiRISE DTM, metres (areoid)
float hB(vec2 p){ return -2664.712+352.3924*dtmBil(vec2(p.x/12000.+.5,.5-p.y/12000.),1.); } // CTX DTM
float terrH(vec2 p){
  float b=hB(p), a=hA(p), wa=1.-smoothstep(560.,780.,max(abs(p.x),abs(p.y)));
  float h=mix(b,a,wa)-uHB0;
  float d=length(p);
  return uOn.x*h*smoothstep(330.,620.,d)            // the city's graded pad eases back into the real ground
    *(1.-smoothstep(JF0,JF1,d));                      // and the far band flattens onto the sky dome's ground (no step at the mesh edge)
}`,De=`const float JF0=3300., JF1=4400.;
`;{let S=y?420:210,se=S+1,xe=9e3,Ge=xe/S,Se=new Float32Array(se*se*3),Ee=new Uint32Array(S*S*6);for(let wt=0,Lt=0;wt<se;wt++){let qe=-xe/2+wt*Ge;for(let je=0;je<se;je++,Lt+=3)Se[Lt]=-xe/2+je*Ge,Se[Lt+2]=qe}for(let wt=0,Lt=0;wt<S;wt++)for(let qe=0;qe<S;qe++,Lt+=6){let je=qe+se*wt,Gt=je+se,fo=Gt+1,lt=je+1;Ee[Lt]=je,Ee[Lt+1]=Gt,Ee[Lt+2]=lt,Ee[Lt+3]=Gt,Ee[Lt+4]=fo,Ee[Lt+5]=lt}let At=new e.BufferGeometry;At.setIndex(new e.BufferAttribute(Ee,1)),At.setAttribute("position",new e.BufferAttribute(Se,3)),At.boundingSphere=new e.Sphere(new e.Vector3,xe*.7072),At.boundingBox=new e.Box3(new e.Vector3(-xe/2,0,-xe/2),new e.Vector3(xe/2,0,xe/2));let Qt=new e.MeshStandardMaterial({roughness:.95,metalness:0});Qt.customProgramCacheKey=()=>"jezeroTerrain",Qt.onBeforeCompile=wt=>{Object.assign(wt.uniforms,$),Object.assign(wt.uniforms,{uJSun:be.uSun,uJK:be.uK,uJAmb:be.uAmb,uJOrigin:be.uOrigin}),wt.vertexShader=De+pe+`
varying vec3 vTP; varying vec3 vTN;
`+wt.vertexShader.replace("#include <beginnormal_vertex>",`vec3 objectNormal; { vec2 p=position.xz; float e=8.;
          objectNormal=normalize(vec3(-(terrH(p+vec2(e,0.))-terrH(p-vec2(e,0.)))/(2.*e),1.,-(terrH(p+vec2(0.,e))-terrH(p-vec2(0.,e)))/(2.*e))); vTN=objectNormal; }
        #ifdef USE_TANGENT
          vec3 objectTangent = vec3( tangent.xyz );
        #endif`).replace("#include <begin_vertex>",`#include <begin_vertex>
transformed.y+=terrH(position.xz)-dot(position.xz,position.xz)/(2.*3389500.); vTP=transformed;`),wt.fragmentShader=De+pe+`
varying vec3 vTP; varying vec3 vTN;
uniform vec3 uJSun, uJOrigin; uniform float uJK, uJAmb;
`+In+hr+`
      // greyscale orbital images -> height for shading only
      float bumpL(vec2 p){ float a=uOn.y*(1.-smoothstep(640.,790.,max(abs(p.x),abs(p.y)))), b=uOn.z*(1.-smoothstep(5000.,5900.,max(abs(p.x),abs(p.y))));
        float hb=texture2D(tCtx,vec2(p.x/12000.+.5,.5-p.y/12000.)).r, ha=texture2D(tHi,vec2(p.x/1600.+.5,.5-p.y/1600.)).r;
        return mix(.5,mix(hb,ha,a),max(a,b)); }
      // fbm with each octave faded to its mean once it nears a pixel (fw = base-octave cycles per pixel): no far shimmer
      float fbmBL(vec3 p, float fw){ float v=0.,a=.5; for(int i=0;i<5;i++){ float k=1.-smoothstep(.3,.6,fw); v+=a*(k>0.? mix(.5,n3(p),k) : .5); p*=2.03; fw*=2.03; a*=.5; } return v; }
      vec3 tA; float tR;
    `+wt.fragmentShader.replace("#include <color_fragment>",`#include <color_fragment>
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
          normal=normalize(normal+(viewMatrix*vec4(-gx*k*.1,0.,-gz*k*.1,0.)).xyz); }`)};let Nt=new e.Mesh(At,Qt);Nt.receiveShadow=!0,s.add(Nt)}let J={sunDir:{value:new e.Vector3},night:{value:0}},he=new e.Mesh(new e.SphereGeometry(7e3,48,24),new e.ShaderMaterial({side:e.BackSide,depthWrite:!1,fog:!1,uniforms:J,vertexShader:"varying vec3 vD; void main(){ vD=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }",fragmentShader:`uniform vec3 sunDir; uniform float night; varying vec3 vD; ${In}
  void main(){ float e=clamp(vD.y,0.,1.), sd=max(dot(vD,sunDir),0.);
    vec3 dayC=mix(vec3(0.78,0.54,0.36),vec3(0.36,0.22,0.15),pow(e,0.6));
    vec3 duskC=mix(vec3(0.2,0.14,0.13),vec3(0.015,0.015,0.03),pow(e,0.45));
    vec3 c=mix(dayC,duskC,night)+vec3(0.3,0.5,0.9)*pow(sd,22.)*(0.2+night*0.55)+vec3(0.5,0.6,0.8)*pow(sd,160.)*0.6;
    c+=vec3(0.9)*step(0.9975,h3(floor(vD*500.)))*smoothstep(0.5,1.,night)*smoothstep(0.05,0.3,e);
    gl_FragColor=vec4(c,1.); }`}));s.add(he),yield;let Le=[62,132,204],Ie=8,ee=[[0,0,20,.02]],I=[];for(let S=0;S<4;S++){let se=Math.PI/8+S*Math.PI/2;ee.push([Math.cos(se)*96,Math.sin(se)*96,15,.26+S*.08]),I.push(se)}let g=(S,se)=>Math.abs(((S-se)%(Math.PI*2)+Math.PI*3)%(Math.PI*2)-Math.PI),w=[],L=[];for(let S=34;S<238;S+=14){let se=S*.11;for(;se<S*.11+Math.PI*2-.05;){let xe=Math.min(6.6,2.6+G()*3.2+5*Math.exp(-S/70)),Ge=Math.cos(se)*S,Se=Math.sin(se)*S,Ee=[...Array(Ie)].some((Nt,wt)=>g(se,wt*Math.PI/4)*S<xe+4),At=S<86&&I.some(Nt=>g(se,Nt)*S<xe+3.5);if(!(Ee||At||Le.some(Nt=>Math.abs(S-Nt)<xe+3.5)||ee.some(([Nt,wt,Lt])=>Math.hypot(Ge-Nt,Se-wt)<Lt+xe+3))&&G()>.1){let Nt=.06+S/238*.58+G()*.08;S>175&&G()<.28?L.push({x:Ge,z:Se,w:8+G()*4,d:5,h:2.5+G()*2.5,rot:se,bt:Nt}):w.push({x:Ge,z:Se,r:xe,ys:.72+G()*.35,rot:G()*6.28,bt:Nt,seed:G()*50})}se+=(2*xe+2.6)/S}}let R={night:{value:0}},X=Un({THREE:e,renderer:t});yield;let d=Nn({THREE:e,renderer:t,envMap:X,frameDetail:"low"});yield,w.forEach(S=>S.col=new e.Color().setHSL(.08,.06+G()*.06,.72+G()*.16)),L.forEach(S=>S.col=new e.Color().setHSL(.07,.08,.55+G()*.15));let i=(S,se)=>S.bt-se.bt,p=[...w].sort(i),O=[...L].sort(i);y||p.forEach((S,se)=>S.skip=se%2===1),p.forEach(S=>{(_t.land.some(([se,xe])=>Math.hypot(S.x-se,S.z-xe)<S.r+16)||Math.hypot(S.x-_t.build[0],S.z-_t.build[1])<S.r+30)&&(S.skip=!0)});let D=p.filter(S=>!S.skip),te=.028,Ce=A?A():[];D.forEach(S=>{let se=1/0;for(let xe of Ce)se=Math.min(se,Math.hypot(xe.x-S.x,xe.y,xe.z-S.z));S.near=!Ce.length||S.r/se>te});let E=(S,se)=>{let xe=Math.max(1,S.length),Ge=(Ee,At)=>{let Qt=new e.InstancedMesh(Ee,At,xe);return Qt.count=0,Qt},Se={list:S,shell:Ge(se?d.habShellGeoHi:d.habShellGeo,se?d.habShellMat:d.habShellMatFar),glass:Ge(se?d.habGlassGeoHi:d.habGlassGeo,se?d.habGlassMat:d.habGlassMatFar),frame:Ge(se?d.habFrameGeo:d.habFrameGeoFar,d.habFrameMat),pad:Ge(se?d.ringPadGeo:d.ringPadGeoFar,d.ringPadMat)};return Se.shell.customDepthMaterial=d.habShellDepthMat,Se.glass.receiveShadow=Se.frame.receiveShadow=!0,Se.frame.castShadow=!1,Se.shell.castShadow=Se.shell.receiveShadow=Se.pad.castShadow=Se.pad.receiveShadow=!0,S.forEach((Ee,At)=>Se.shell.setColorAt(At,Ee.col)),Se},fe=[E(D.filter(S=>S.near),!0),E(D.filter(S=>!S.near),!1)],oe=new e.InstancedMesh(d.skirtGeo,d.skirtMat,D.length),ze=new e.InstancedMesh(d.shedGeo,d.shedMat,L.length);ze.customDepthMaterial=d.shedDepthMat,O.forEach((S,se)=>ze.setColorAt(se,S.col));let Ze=S=>new e.Sphere(new e.Vector3(0,10,0),S),Dt=fe.flatMap(S=>[S.shell,S.glass,S.frame,S.pad]);[...Dt,oe,ze].forEach(S=>S.boundingSphere=Ze(270)),yield,s.add(...Dt,oe,ze),ze.castShadow=ze.receiveShadow=!0;let et=[],Ue=[],re=[];Le.forEach(S=>{let se=[];for(let xe=0;xe<=200;xe++){let Ge=xe/200*Math.PI*2;if(se.push(new e.Vector3(Math.cos(Ge)*S,.4,Math.sin(Ge)*S)),xe%2===0)for(let Se of[-2.6,2.6])et.push(Math.cos(Ge)*(S+Se),1.6,Math.sin(Ge)*(S+Se)),Ue.push(.04+S/236*.55+xe/200*.08)}re.push([se,.02+S/236*.55])});for(let S=0;S<Ie;S++){let se=S*Math.PI/4,xe=[new e.Vector3(Math.cos(se)*20,.4,Math.sin(se)*20),new e.Vector3(Math.cos(se)*250,.4,Math.sin(se)*250)];re.push([xe,0]);for(let Ge=24;Ge<250;Ge+=4)for(let Se of[-3,3])et.push(Math.cos(se)*Ge+Math.cos(se+1.5708)*Se,1.6,Math.sin(se)*Ge+Math.sin(se+1.5708)*Se),Ue.push(.02+Ge/250*.62)}let Be=re.map(([S,se])=>{let xe=new e.Line(new e.BufferGeometry().setFromPoints(S),new e.LineBasicMaterial({color:16756848,transparent:!0,opacity:0}));return xe.userData.bt=se,s.add(xe),xe}),Te={g:{value:0},night:{value:0},t:{value:0}},tt=(S,se)=>new e.ShaderMaterial({transparent:!0,depthWrite:!1,blending:e.AdditiveBlending,uniforms:Te,vertexShader:S,fragmentShader:se}),st="varying vec3 vC; varying float vA; void main(){ float d=length(gl_PointCoord-.5); gl_FragColor=vec4(vC*vA*smoothstep(.5,.05,d)*2.4,1.); }";{let S=new e.BufferGeometry;S.setAttribute("position",new e.Float32BufferAttribute(et,3)),S.setAttribute("bt",new e.Float32BufferAttribute(Ue,1)),s.add(new e.Points(S,tt("attribute float bt; uniform float g; uniform float night; varying vec3 vC; varying float vA; void main(){ vec4 mv=modelViewMatrix*vec4(position,1.); vC=vec3(1.,0.66,0.3); vA=smoothstep(bt,bt+0.025,g)*(0.15+0.85*night); gl_PointSize=clamp(520./-mv.z,1.2,6.); gl_Position=projectionMatrix*mv; }",st)))}{let S=[],se=[];w.filter(Ge=>Ge.r>5).forEach(Ge=>{let Se=G();Ge.skip||(S.push(Ge.x,Ge.r*Ge.ys+.6,Ge.z),se.push(Ge.bt+.16,Se))});let xe=new e.BufferGeometry;xe.setAttribute("position",new e.Float32BufferAttribute(S,3)),xe.setAttribute("bs",new e.Float32BufferAttribute(se,2)),s.add(new e.Points(xe,tt("attribute vec2 bs; uniform float g; uniform float t; uniform float night; varying vec3 vC; varying float vA; void main(){ vec4 mv=modelViewMatrix*vec4(position,1.); vC=vec3(1.,0.12,0.06); vA=step(bs.x,g)*step(0.55,fract(t*0.7+bs.y))*(0.3+0.7*night)*1.6; gl_PointSize=clamp(900./-mv.z,2.,9.); gl_Position=projectionMatrix*mv; }",st)))}let mt=new e.SphereGeometry(1,32,14,0,Math.PI*2,0,Math.PI/2),_e=ee.map(([S,se,xe,Ge])=>{let Se=d.bigDome();return Se.position.set(S,0,se),Se.scale.setScalar(xe),s.add(Se),{g:Se,lattice:Se.getObjectByName("lattice"),glass:Se.getObjectByName("glass"),glow:Se.getObjectByName("glow"),bt:Ge}}),Pt=I.map((S,se)=>{let xe=new e.Group;xe.position.set(Math.cos(S)*19,2.6,Math.sin(S)*19),xe.rotation.y=-S;let Ge=new e.Mesh(d.ribGeo,d.ribMat);return Ge.castShadow=Ge.receiveShadow=!0,xe.add(new e.Mesh(d.tubeGeo,d.tubeMat),Ge),s.add(xe),{g:xe,bt:.12+se*.07}}),zt=[];for(let S=262;S<345;S+=4.2)for(let se=.25;se<1.35;se+=3.2/S)zt.push({x:Math.cos(se)*S,z:Math.sin(se)*S,bt:.22+(S-262)/83*.22+(se-.25)*.12});zt.sort(i);let Je=new e.InstancedMesh(new e.BoxGeometry(3,.1,2.2).translate(0,1.2,0),new e.MeshStandardMaterial({color:1451068,metalness:.85,roughness:.22,emissive:330260}),zt.length);Je.castShadow=Je.receiveShadow=!0,Je.boundingSphere=Ze(360),s.add(Je),yield;let Ut=new e.MeshStandardMaterial({color:15770458,emissive:3807744,roughness:.6}),kt=w.filter(S=>S.r>4.2&&!S.skip),Wt=kt.filter((S,se)=>se%Math.max(1,Math.floor(kt.length/20))===3).slice(0,20).map((S,se)=>{let xe=new e.Group;xe.position.set(S.x+S.r+2,0,S.z+2);let Ge=Math.max(22,S.r*S.ys+16),Se=new e.Mesh(new e.BoxGeometry(1,Ge,1).translate(0,Ge/2,0),Ut),Ee=new e.Group;return Ee.position.y=Ge,Ee.add(new e.Mesh(new e.BoxGeometry(30,.8,.8).translate(8,0,0),Ut),new e.Mesh(new e.BoxGeometry(3,2.2,2).translate(-6,-.8,0),Ut),new e.Mesh(new e.BoxGeometry(.08,10,.08).translate(18,-5,0),Ut)),xe.add(Se,Ee),xe.traverse(At=>{At.isMesh&&(At.castShadow=!0)}),s.add(xe),{g:xe,jib:Ee,bt:S.bt,ph:se*1.7}}),Ye=null,Ft=(S=!0)=>Ye=ce.createRockets({THREE:e,foot:ce.foot,colony:s,envMap:X,high:y,sites:_t,light:S});yield,ce?Ft():ne.then(()=>{ce&&(Ft(!1),V(Ye))}),yield;let yt=_r({THREE:e,colony:s,layout:Bn({high:y,rockets:!0}),envMap:X,high:y,arrive:br,hideLines:Be,solar:Je}),f=-1,v=new e.Matrix4,x=new e.Quaternion,m=new e.Vector3(0,1,0),l=new e.Vector3,F=new e.Vector3,h=new e.Quaternion,Y=new e.Color,me=new e.Color(.78,.54,.36),T=new e.Color(.2,.14,.13),Z=new e.Quaternion().setFromEuler(new e.Euler(0,0,.5)),ge=(S,se)=>{let xe=0;for(;xe<S.length&&S[xe].bt<se;)xe++;return xe},Ke=e.MathUtils.degToRad(.1),We=new e.Color(16773596),Ve=new e.Color(1,.66,.42),_=new e.Vector3,ke=new e.Vector3,Re=new e.Vector3,ve=new e.Vector3,He=new e.Vector3,Qe=1;function at(){let S=Ye&&Ye.launch,se=S?S.light.k:0;_.copy(k),se>.001&&(He.copy(S.light.pos),He.y=Math.max(He.y,4),_.lerp(He.normalize(),gt(se,0,1))),_.y=Math.max(_.y,.035),_.normalize();let xe=Math.round(Math.asin(_.y)/Ke)*Ke,Ge=Math.round(Math.atan2(_.x,_.z)/Ke)*Ke;if(_.set(Math.cos(xe)*Math.sin(Ge),Math.sin(xe),Math.cos(xe)*Math.cos(Ge)),n.color.copy(We).lerp(Ve,se),n.intensity=e.MathUtils.lerp(Qe,.28*(S?S.light.i:0),se),_.equals(ke))return!1;ke.copy(_);let Se=n.shadow.camera,Ee=390*Math.max(_.y,.06)+80;return Se.top!==Ee&&(Se.top=Ee,Se.bottom=-Ee,Se.updateProjectionMatrix()),Ba(n,U,_,600,Re,ve),!0}function it(S,se,xe=S){le();let Ge=Math.min(S,1),Se=Math.max(0,(Ge-br)/(1-br)),Ee=K=gt(Se,.35,.95),At=e.MathUtils.lerp(.34,-.05,gt(Se,.05,1));he.visible=!1,k.set(-Math.cos(At),Math.sin(At),-Math.cos(At)*.22).normalize(),J.sunDir.value.copy(k),J.night.value=Ee,Te.g.value=Se,Te.night.value=Ee,Te.t.value=se,R.night.value=Ee,d.night.value=Ee,r.fog.color.copy(Y.copy(me).lerp(T,Ee)),r.fog.near=500,r.fog.far=4200,Qe=e.MathUtils.lerp(2.2,.1,Ee),P.intensity=e.MathUtils.lerp(.5,.1,Ee),b.intensity=e.MathUtils.lerp(1.5,.12,Ee),b.color.copy(Y),o.air&&o.air.hemi&&o.air.hemi(b.color),d.tubeMat.emissiveIntensity=Ee*.35,Ye&&Ye.update(xe,se,Ee),yt.update(Se,se,Ee,Ge);for(let qe=0;qe<Wt.length;qe++){let je=Wt[qe];je.jib.rotation.y=je.ph+Se*46+se*.15}let Qt=at();if(Math.abs(Ge-f)<1e-4)return Qt;f=Ge;for(let qe=0;qe<fe.length;qe++){let je=fe[qe],Gt=je.list,fo=ge(Gt,Se),lt=ge(Gt,Se-.02),It=ge(Gt,Se-.07);for(let ae=0;ae<fo;ae++){let ie=Gt[ae],Pe=eo((Se-ie.bt)/.03),ut=eo((Se-ie.bt-.02)/.06),$e=eo((Se-ie.bt-.07)/.08);x.setFromAxisAngle(m,ie.rot),v.compose(l.set(ie.x,0,ie.z),x,F.set(ie.r,Pe,ie.r)),je.pad.setMatrixAt(ae,v),ae<lt&&(v.compose(l.set(ie.x,.45,ie.z),x,F.set(ie.r*1.015,ie.r*ie.ys*ut*1.015,ie.r*1.015)),je.frame.setMatrixAt(ae,v)),ae<It&&(v.compose(l.set(ie.x,.45,ie.z),x,F.set(ie.r,ie.r*ie.ys*$e,ie.r)),je.shell.setMatrixAt(ae,v),je.glass.setMatrixAt(ae,v))}je.pad.count=fo,je.frame.count=lt,je.shell.count=je.glass.count=It,je.shell.instanceMatrix.needsUpdate=je.glass.instanceMatrix.needsUpdate=je.frame.instanceMatrix.needsUpdate=je.pad.instanceMatrix.needsUpdate=!0}let Nt=ge(D,Se);for(let qe=0;qe<Nt;qe++){let je=D[qe];x.setFromAxisAngle(m,je.rot),v.compose(l.set(je.x,0,je.z),x,F.set(je.r,eo((Se-je.bt)/.03),je.r)),oe.setMatrixAt(qe,v)}oe.count=Nt;let wt=ge(O,Se-.04);for(let qe=0;qe<wt;qe++){let je=O[qe],Gt=eo((Se-je.bt-.04)/.07);x.setFromAxisAngle(m,-je.rot),v.compose(l.set(je.x,0,je.z),x,F.set(je.w,je.h*Gt,je.d)),ze.setMatrixAt(qe,v)}ze.count=wt,oe.instanceMatrix.needsUpdate=ze.instanceMatrix.needsUpdate=!0;let Lt=ge(zt,Se);for(let qe=0;qe<Lt;qe++){let je=zt[qe],Gt=eo((Se-je.bt)/.04);v.compose(l.set(je.x,0,je.z),Z,F.set(1,Gt,1)),Je.setMatrixAt(qe,v)}return Je.count=Lt,Je.instanceMatrix.needsUpdate=!0,Be.forEach(qe=>qe.material.opacity=gt(Se,qe.userData.bt,qe.userData.bt+.06)*(.15+.85*Ee)),_e.forEach(qe=>{let je=eo((Se-qe.bt)/.1),Gt=gt(Se,qe.bt+.1,qe.bt+.18);qe.lattice.scale.set(1,Math.max(.001,je),1),qe.g.visible=je>0,qe.glass.material.opacity=Gt*.28,qe.glow.material.opacity=Gt*Ee*.28}),Pt.forEach(qe=>{let je=eo((Se-qe.bt)/.08);qe.g.scale.set(Math.max(.001,je*62),1,1),qe.g.visible=je>0}),Wt.forEach(qe=>{let je=Math.min(eo((Se-qe.bt+.08)/.04),1-eo((Se-qe.bt-.2)/.04));qe.g.scale.set(1,Math.max(.001,je),1),qe.g.visible=je>.01}),!0}H={build:it,cranes:Wt,get rockets(){return Ye}}}let j=null;function Me(){return H?!0:(j=j||Q(),j.next().done)}function ue(){for(;!Me(););}return{group:s,step:Me,ensure:ue,loadMaps:B,rockReady:ne,get api(){return H},get sun(){return k},get night(){return K},get done(){return!!H}}}var yr={grade:{exposure:-.7,contrast:1.08,saturation:.96,warmth:.12,tint:.01,lift:.005,gamma:.98,gain:1.11},lens:{bloomStrength:.89,bloomThreshold:1.26,vignette:.61,grain:.084},beats:{austin:{exposure:.11,warmth:.62},space:{exposure:1.1,warmth:-.53},marsOrbit:{exposure:.76,warmth:.09},colony:{exposure:.45,warmth:.69}}};var Mr=[{pr:.75,post:0,trails:!1,shadow:1024,every:3,keep:.4},{pr:1,post:1,trails:!1,shadow:2048,every:2,keep:.6},{pr:1,post:2,trails:!0,shadow:2048,every:1,keep:1},{pr:1,post:3,trails:!0,shadow:4096,every:1,keep:1},{pr:1.25,post:3,trails:!0,shadow:4096,every:1,keep:1},{pr:1.5,post:3,trails:!0,shadow:4096,every:1,keep:1}],Tn=Mr.length-1,Wn=14,Mi=9,wr=20,Si=250,so=40,Ai=1500,Ci=4e3,zi=15e3,Di=6e4,Pi=600,jn=33;function qn({high:e=!0,top:t=null,start:r=null,apply:c,hold:o=()=>!1,holdUp:n=()=>!1,capOK:P=()=>!1,gpu:b=()=>null}={}){let y=(typeof location<"u"?new URLSearchParams(location.search):new URLSearchParams).get("perf"),V=y==="log"||Sa,A=y==="off"||qr,U=/^[0-5]$/.test(y||"")?+y:null,N=t!=null?Math.max(0,Math.min(Tn,t)):e?Tn:2,s=U??(r!=null?Math.max(0,Math.min(N,r)):N),G=N,k=0,K=0,H=0,ce=0,ne=-1e9,$=0,be=-1,de=new Float32Array(so),Oe=new Float32Array(so),we=0,Ae=0,B=0,le=0,Q=0,j={level:s,ceil:G,p90:0,med:0,steps:0,gpu:null,capped:!1,coarse:!1},Me=(...w)=>{V&&console.log("[film perf]",...w)},ue=new Float32Array(8),pe=0,De=0,J=0,he=-1e9,Le=!1;function Ie(w){if(J++,w<2&&(he=J),Le=J-he<120,!Le)return pe=0,w;if(ue[De]=w,De=De+1&7,pe<8&&pe++,pe<8)return null;let L=0,R=1e9;for(let X=0;X<8;X++)L+=ue[X],ue[X]>=2&&ue[X]<R&&(R=ue[X]);return R>=50?null:L/8}function ee(w,L){w=Math.max(0,Math.min(G,w)),w!==s&&(w<s&&k-ne<zi&&(G=s-1,$=k,ne=-1e9,Me("ceiling",G)),w>s&&(ne=k),s=w,H=k+Ai,ce=0,we=0,Ae=0,B=0,le=0,j.steps++,Me("level",w,L,"gpu",j.gpu,"med",j.med,"coarse",j.coarse),I())}function I(){be!==s&&(be=s,j.level=s,j.ceil=G,c(Mr[s],s))}function g(w){if(be<0&&I(),A||U!=null)return;if(k+=Math.min(w,100),w>Si){K=k,++Q>=8&&s>0&&(Q=0,ee(s-1,"sustained stalls"));return}if(Q=0,k-K<Pi||(w=Ie(w),w==null))return;if(we===so){let p=de[Ae];p>wr&&B--,p>jn&&le--}else we++;if(de[Ae]=w,Ae=(Ae+1)%so,w>wr&&B++,w>jn&&le++,we<so)return;Oe.set(de),Oe.sort();let L=Oe[Math.floor(so*.9)],R=Oe[Math.floor(so*.1)];j.p90=+L.toFixed(1),j.med=+Oe[so>>1].toFixed(1),j.coarse=Le;let X=P()&&R>25&&L-R<3;j.capped=X;let d=b(),i=d!=null&&isFinite(d);if(j.gpu=i?+d.toFixed(1):null,X&&!i&&s<=N-1){ce=0;return}if(le>so*.6&&s>0&&(!i||d>Wn)){ee(s-1,"emergency p90 "+L.toFixed(1));return}if(G<N&&k-$>Di&&(G=N,j.ceil=G,Me("ceiling lifted")),!(k<H||o())){if(i?d>Wn:L>wr||B>so*.12){ee(s-1,"p90 "+L.toFixed(1)+" misses "+B+" gpu "+j.gpu+" capped "+X);return}s<G&&(i?d<Mi&&(X||B===0&&L<17.6):B===0&&L<17.6)&&!n()?ce?k-ce>Ci&&ee(s+1,"headroom p90 "+L.toFixed(1)):ce=k:ce=0}}return{frame:g,LADDER:Mr,get level(){return s},get ceil(){return G},get state(){return j},pin(w){w!=null&&(G=N,ee(Math.max(0,Math.min(N,w)),"pinned"))},reset(){we=0,Ae=0,B=0,le=0,K=k}}}var Li=.14,ki=.175,Sr=48/157.5,Wo=[.04,.12,.32,.4],Xn=.3,bo=1.12,Kn=.03,Yn=.4,Oi=.6,Qn=-.02,Fi=[[-1,-.9],[-.3,-.1],[.43,.49]],Zn=(e,t,r,c,o)=>bt(bt(bt(e.austin[t],e.space[t],r),e.marsOrbit[t],c),e.colony[t],o);function dc({THREE:e,host:t,section:r,scenes:c,sol:o,quality:n,files:P}){let b=n==="high",z=new URLSearchParams(location.search).get("touch"),y=!b&&(z?z==="1":matchMedia("(pointer: coarse)").matches),V=[.75,1,1.25,1.5,1.75,2],A=Math.min(b?1.5:y?2:1,Kr),U=new e.WebGLRenderer({antialias:!1,powerPreference:"high-performance"});U.setPixelRatio(Math.min(devicePixelRatio,A));let N=Math.max(1,t.clientWidth),s=Math.max(1,t.clientHeight);U.setSize(N,s,!1),U.toneMapping=e.ACESFilmicToneMapping,U.toneMappingExposure=1.05,U.shadowMap.enabled=!0,U.shadowMap.type=e.PCFSoftShadowMap,U.shadowMap.autoUpdate=!1;let G=U.domElement;Object.assign(G.style,{position:"absolute",inset:"0",width:"100%",height:"100%",display:"block"}),t.insertBefore(G,t.firstChild);let k=new e.Scene;k.background=new e.Color(65795);let K=new e.PerspectiveCamera(42,N/s,.1,9e3),H=hn({THREE:e,renderer:U,scene:k,cam:K,low:!b}),{bloom:ce}=H,ne=JSON.parse(JSON.stringify(yr)),$=!1,be=()=>{let a=xt==="colony"&&g.api&&g.api.rockets;return a?a.launch.exp:0},de=()=>{let a=g.api.cranes;for(let u=0;u<a.length;u++)if(a[u].g.visible)return!0;return!1};function Oe(){let a=ne.grade,u=ne.lens,C=ne.beats,M=Fi,q=H.look,W=H.grade;if(q&&(q.bloom=u.bloomStrength,q.threshold=u.bloomThreshold,q.vignette=u.vignette,q.grain=u.grain),!W)return;let ye=gt(Fe,M[0][0],M[0][1]),vt=gt(Fe,M[1][0],M[1][1]),Xe=gt(Fe,M[2][0],M[2][1]),rt=a.warmth+Zn(C,"warmth",ye,vt,Xe),ct=a.tint;if(W.expK=2**(a.exposure+Zn(C,"exposure",ye,vt,Xe)-.55*be()),rt===0&&ct===0)W.wr=W.wg=W.wb=1;else{let pt=2**(.25*rt),ht=2**(-.2*ct),St=2**(-.25*rt),Ne=1/(.2126*pt+.7152*ht+.0722*St);W.wr=pt*Ne,W.wg=ht*Ne,W.wb=St*Ne}W.contrast=a.contrast,W.saturation=a.saturation,W.lift=a.lift,W.gamma=a.gamma,W.gain=a.gain}let we=!0,Ae=1,B=(()=>{let a=U.getContext(),u=a&&a.createQuery&&a.getExtension("EXT_disjoint_timer_query_webgl2"),C=new Float32Array(30),M=new Float32Array(30),q=[],W=[],ye=0,vt=0,Xe=null,rt=null,ct=!u,pt=()=>{ye=0,vt=0,rt=null},ht=Ne=>{try{a.deleteQuery(Ne)}catch{}};function St(){if(!ct)try{for(;q.length&&a.getQueryParameter(q[0],a.QUERY_RESULT_AVAILABLE);){let Ne=q.shift();if(a.getParameter(u.GPU_DISJOINT_EXT)){ht(Ne);for(let Ot of q)ht(Ot);q.length=0,pt();break}let nt=a.getQueryParameter(Ne,a.QUERY_RESULT)/1e6;W.push(Ne),nt>=0&&nt<1e3&&(C[vt]=nt,vt=(vt+1)%30,ye<30&&ye++,rt=null)}}catch{ct=!0,pt()}}return{poll:St,begin(){if(!(ct||Xe||q.length>=4))try{let Ne=W.pop()||a.createQuery();a.beginQuery(u.TIME_ELAPSED_EXT,Ne),Xe=Ne}catch{ct=!0}},end(){if(Xe){try{a.endQuery(u.TIME_ELAPSED_EXT),q.push(Xe)}catch{ct=!0}Xe=null}},get p90(){return ct||ye<20?null:(rt==null&&(M.set(C),rt=M.subarray(0,ye).sort()[Math.floor(ye*.9)]),rt)},reset(){pt()},dispose(){for(let Ne of[...q,...W,Xe])Ne&&ht(Ne);q.length=W.length=0,Xe=null,ct=!0}}})(),le=qn({high:b,top:y?V.length-1:null,start:ar&&b?3:null,hold:()=>Fe>Rt&&Fe<.52,holdUp:()=>ko,capOK:()=>!ar,gpu:()=>B.p90,apply:(a,u)=>{let C=Math.min(devicePixelRatio||1,A,y?V[u]:a.pr);U.getPixelRatio()!==C&&(U.setPixelRatio(C),H.setSize(N,s),H.resetMotion()),H.setQuality(Math.min(b?a.post:Math.min(a.post,1),Xr??3)),we=a.trails,ma=a.every,Ae=a.keep,B.reset();let M=Ie.shadow,q=b?a.shadow:Math.min(a.shadow,2048);M.mapSize.x!==q&&(M.mapSize.set(q,q/2),M.map&&(M.map.dispose(),M.map=null),yo=!0);let W=g.api&&g.api.rockets;W&&W.setKeep&&W.setKeep(Ae)}});(ce.separableBlurMaterials||[]).forEach(a=>{let u=a.uniforms.gaussianCoefficients?.value;if(!u)return;let C=u.length,M=C/2.6;for(let q=0;q<C;q++)u[q]=.39894*Math.exp(-.5*q*q/(M*M))/M});let Q=Fn({THREE:e}),{toSun:j,EARTH:Me,MARS:ue,C0:pe,L0:De}=Q,J=gn({THREE:e,scene:k,renderer:U,toSun:j,EARTH:Me,MOON:Q.moonAt(-1,new e.Vector3),MARS:ue,files:P.tex});J.moon.material.uniforms.uRelief.value=.35,J.mars.material.uniforms.uRelief.value=.4;let he=null,Le=dn({THREE:e,scene:k,starsUrl:P.stars,milkyUrl:P.milky,milkyWayIntensity:.14}).then(a=>{he=a}).catch(()=>{}),Ie=new e.DirectionalLight(16773596,2.4);Ie.position.copy(j).multiplyScalar(100);let ee=new e.AmbientLight(2240580,.35),I=new e.HemisphereLight(16763030,5909012,1.4);I.intensity=0,k.add(Ie,Ie.target,ee,I);let g=Gn({THREE:e,renderer:U,scene:k,cam:K,planets:J,sunLight:Ie,ambient:ee,hemi:I,files:P.jezero,HIGH:b,lateRockets:a=>_o("colony",()=>Ro(a.group)),lodPath:()=>{let a=[];for(let u=0;u<=48;u++){let C=new e.Vector3,M=.6+(bo-.6)*u/48;zt.getPoint(kt(M),C),Qe(M,C,!0),a.push(C.sub(L))}return a}}),w=g.group,L=new e.Vector3(no.x,no.y,no.z),R=a=>{let u=document.createElement("canvas");u.width=u.height=256;let C=u.getContext("2d"),M=C.createRadialGradient(128,128,0,128,128,128);return a.forEach(([q,W])=>M.addColorStop(q,W)),C.fillStyle=M,C.fillRect(0,0,256,256),new e.CanvasTexture(u)},X=new e.Sprite(new e.SpriteMaterial({map:R([[0,"rgba(255,255,255,1)"],[.12,"rgba(255,236,200,0.9)"],[.35,"rgba(255,170,80,0.25)"],[1,"rgba(0,0,0,0)"]]),color:16777215,blending:e.AdditiveBlending,depthWrite:!1,transparent:!0,fog:!1}));k.add(X);let d=()=>H.resetMotion(),i=new e.Vector3(0,4e4,0),p=Pn({THREE:e,scene:k,renderer:U,sunLight:Ie,hemi:I,ORIGIN:i,earthU:J.earth.material.uniforms,ortho:P.ortho}),O=On({THREE:e,parent:p.group,high:b}),D=.012,te=10/6371e3,Ce=e.MathUtils.degToRad(la.lat),E=(la.lon+180)/360,fe=new e.Vector3(-Math.cos(2*Math.PI*E)*Math.cos(Ce),Math.sin(Ce),Math.sin(2*Math.PI*E)*Math.cos(Ce)),oe=Math.atan2(fe.z,fe.x)-Math.atan2(pe.z,pe.x),ze=fe.clone().applyAxisAngle(new e.Vector3(0,1,0),oe).multiplyScalar(10),Ze=ze.clone().normalize(),Dt=Q.spaceCam,et=xn({THREE:e,SITE_ROT:Ta,AUS:ze,U_PER_M:te,C0:pe,L0:De,spaceCam:Dt}),Ue={pos:new e.Vector3,look:new e.Vector3,up:new e.Vector3},re=et.LAMH,Be=et.LAM1,Te={},tt={pos:new e.Vector3,look:new e.Vector3,up:new e.Vector3},st=(a,u)=>{let C=Math.log(a),M=et.k.yA,q=et.k.yH;for(let W=0;W<50;W++){let ye=(M+q)/2;et.at(ye,tt),tt.lam<C?M=ye:q=ye}return et.at((M+q)/2,u)},mt=[15,0,-135],_e=(a,u,C)=>[mt[0]+a*Math.sin(u*Math.PI/180),C,mt[2]+a*Math.cos(u*Math.PI/180)],Pt=[[to,[2200,2600,900],[-3200,0,-200],50],[.52,[1400,1500,700],[-1400,0,-300],48],[.57,[750,700,550],[-250,0,-250],46],[.62,_e(600,28,260),[15,30,-135],42],[.72,_e(500,32,190),[15,34,-135],40],[.8,_e(420,24,130),[10,38,-130],40],[.88,_e(350,15,80),[-5,44,-125],42],[1,_e(450,13,85),[-15,52,-118],45],[1.12,_e(600,14,115),[-20,60,-115],50]].map(([a,u,C,M])=>({p:a,pos:new e.Vector3(...u).add(L),look:new e.Vector3(...C).add(L),fov:M})),zt=new e.CatmullRomCurve3(Pt.map(a=>a.pos),!1,"centripetal"),Je=new e.CatmullRomCurve3(Pt.map(a=>a.look),!1,"centripetal"),Ut=Pt.map(a=>a.p),kt=vr(zt,Ut,void 0,0),Wt=vr(Je,Ut,void 0,0),Ye=co(Ut,Pt.map(a=>a.fov),void 0,0),Ft=(()=>{let a=co([.49,.62,.88,.9,1.12],[0,.1,.8,.83,1]);return u=>u<=.49?0:u>=1.12?1:Vt(a(u))})(),yt=.83,f=new e.Vector3,v=new e.Vector3,x=new e.Vector3(_t.build[0],0,_t.build[1]).add(L),m=new e.Vector3;function l(a,u){let C=g.api&&g.api.rockets,M=C&&C.launch;if(M&&M.pos)return u.copy(M.pos);let q=Math.max(0,a-yt),W=4800*q*q*(1+4*q),ye=25e-5*W*W;return u.set(_t.build[0]-.952*ye,26+W,_t.build[1]-.305*ye).add(L)}let F=a=>Math.asin(e.MathUtils.clamp(a.y/Math.max(1e-6,a.length()),-1,1)),h=a=>Math.atan2(Math.sin(a),Math.cos(a));function Y(a,u,C,M){let q=Math.min(Math.max(a,to),bo);zt.getPoint(kt(q),u),Je.getPoint(Wt(q),C);let W=gr(q,Ye(q),K.aspect),ye=gt(M,yt+.002,yt+.045);if(ye>0){let vt=e.MathUtils.degToRad(W/2),Xe=f.copy(C).sub(u),rt=Xe.length();l(M,v).sub(u);let ct=F(Xe),pt=F(v),ht=F(m.copy(x).sub(u)),St=.3+1.1*gt(Mo,0,Yn*.6),Ne=bt(ct,Math.min(Math.max(ct,pt-.5*vt),ht+St*vt),ye),nt=Math.atan2(Xe.x,Xe.z),Ot=nt+h(Math.atan2(v.x,v.z)-nt)*.55*ye;C.set(Math.cos(Ne)*Math.sin(Ot),Math.sin(Ne),Math.cos(Ne)*Math.cos(Ot)).multiplyScalar(rt).add(u)}return W}let me=document.querySelector("[data-foot-canvas]")||document.querySelector("[data-foot]"),T=[.86,bo],Z=[.98,bo],ge=[.86,.95],Ke=[1,bo],We=.5,Ve=-.3,_=me?(()=>{let a=rr(0,0),u=rr(_t.build[0],_t.build[1]),C=Math.atan2(u[1]-a[1],u[0]-a[0])-Math.atan2(_t.build[1],_t.build[0]),M=Math.cos(C),q=Math.sin(C),W=-Hr(a[0],a[1]),ye=(pt,ht,St,Ne)=>{let nt=pt-a[0],Ot=St-a[1];return Ne.set(nt*M+Ot*q,ht+W,-nt*q+Ot*M).add(L)},vt=nr(16,9),Xe={toCol:ye,eye:ye(...vt.eye,new e.Vector3),look:new e.Vector3,q:new e.Quaternion,c:0,e:1,ok:!1},rt=Math.sin(vt.sunAz),ct=-Math.cos(vt.sunAz);return Xe.sunAz=Math.atan2(-rt*q+ct*M,rt*M+ct*q),Xe.rE=Math.hypot(Xe.eye.x-L.x,Xe.eye.z-L.z),Xe.aE=Math.atan2(Xe.eye.z-L.z,Xe.eye.x-L.x),Xe})():null,ke=(a,u,C=!1)=>_&&(C||_.ok)?Zo(a,u[0],u[1]):0,Re=new e.Matrix4,ve=new e.Vector3(0,1,0);function He(){if(!_)return;let a=me.clientWidth,u=me.clientHeight;if(_.ok=a>0&&u>0,!_.ok)return;let C=nr(a,u),M=Math.tan(C.vfov*Math.PI/360);_.toCol(...C.look,_.look),Re.lookAt(_.eye,_.look,ve),_.q.setFromRotationMatrix(Re),_.e=2*M*s/u,_.c=M+_.e/2}function Qe(a,u,C=!1){let M=ke(a,T,C);if(M<=0)return u;let q=u.x-L.x,W=u.z-L.z,ye=Math.atan2(W,q),vt=bt(Math.hypot(q,W),_.rE,M),Xe=ye+h(_.aE-ye)*M;return u.set(L.x+vt*Math.cos(Xe),bt(u.y,_.eye.y,ke(a,Z,C)),L.z+vt*Math.sin(Xe))}let at=new e.Quaternion,it=new e.Vector3;function S(a,u){let C=ke(a,ge),M=ke(a,Ke);Qe(a,Ct),K.position.copy(Ct);let q=2*Math.tan(u*Math.PI/360),W=bt(bt(-xr(a,K.aspect)*q,0,C),_.c,M),ye=q**(1-M)*_.e**M;l(oo,it).sub(Ct);let vt=F(it)-Math.atan(W-ye/2+We*ye),Xe=Math.atan2(it.x,it.z);it.set(Math.cos(vt)*Math.sin(Xe),Math.sin(vt),Math.cos(vt)*Math.cos(Xe)).add(Ct),Re.lookAt(Ct,it,ve),at.setFromRotationMatrix(Re),K.quaternion.slerp(at,C).slerp(_.q,M),xe(W,ye),Qo(e.MathUtils.clamp((Ct.y-no.y)*.08,.1,30),9e3)}function se(a){let u=ke(a,T);if(u<=0)return;let C=g.sun,M=bt(Math.asin(e.MathUtils.clamp(C.y,-1,1)),Ve,ke(a,Ke)),q=Math.atan2(C.z,C.x),W=q+h(_.sunAz-q)*u;C.set(Math.cos(M)*Math.cos(W),Math.sin(M),Math.cos(M)*Math.sin(W))}function xe(a,u){let C=Math.abs(a)+u/2,M=2*C/u,q=N*M,W=s*M;K.fov=2*Math.atan(C)*180/Math.PI,K.setViewOffset(q,W,(q-N)/2,(C-a-u/2)*s/u,N,s),Co=!0}let Ge=new e.Vector3(-.78,.42,.46).normalize(),Se=new e.Vector3,Ee=new e.Quaternion,At=new e.Mesh(new e.PlaneGeometry(30,30),new e.ShaderMaterial({uniforms:{uR:{value:6},uL2:{value:new e.Vector2(Ge.x,Ge.y).normalize()},uI:{value:1.5}},vertexShader:"varying vec2 vQ; void main(){ vQ = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }",fragmentShader:`uniform float uR, uI; uniform vec2 uL2; varying vec2 vQ;
    void main(){ float q = length(vQ), d = max(q / uR - 1., 0.); vec2 dir = vQ / max(q, 1e-4);
      float side = smoothstep(-0.6, 1., dot(dir, uL2));
      // a thin dusty atmosphere hugging the limb (Mars' dust haze tops out ~1% of its radius up), much stronger on the lit side:
      // a narrow warm rim, not a soft disc. The inner term sits over the geometric edge so the limb never reads as a cut-out
      float g = exp(-d * 120.) * 0.75 + exp(-d * 34.) * 0.16 + exp(-d * 9.) * 0.012;
      float edge = 1. - smoothstep(11., 15., max(abs(vQ.x), abs(vQ.y))); // fade before the plane's edge: its square never shows on black
      gl_FragColor = vec4(vec3(1.0, 0.56, 0.28) * g * side * side * uI * edge, 0.); }`,transparent:!0,depthWrite:!1,blending:e.CustomBlending,blendSrc:e.OneFactor,blendDst:e.OneFactor}));{let a=J.marsAtmo.material.uniforms;a.uBetaR.value.multiplyScalar(.25),a.uSunCol.value.set(1,.86,.66),a.uK.value=15}At.position.copy(ue),At.renderOrder=3,At.frustumCulled=!1,k.add(At);function Qt(a,u){Q.marsQ(a,J.mars.quaternion),Se.copy(Ge).applyQuaternion(K.quaternion),J.marsAtmo.material.uniforms.uSun.value.copy(Se),Ee.copy(J.mars.quaternion).invert(),J.mars.material.uniforms.uSun.value.copy(Se).applyQuaternion(Ee);let C=K.position.distanceTo(Lt);At.quaternion.copy(K.quaternion),At.material.uniforms.uR.value=6/Math.sqrt(Math.max(.05,1-36/(C*C)))}let Nt={uPx:{value:1},uI:{value:0}},wt=new e.Points(new e.BufferGeometry().setAttribute("position",new e.BufferAttribute(new Float32Array(3),3)),new e.ShaderMaterial({uniforms:Nt,vertexShader:"uniform float uPx; void main(){ gl_PointSize = uPx; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }",fragmentShader:`uniform float uI; void main(){ vec2 q = gl_PointCoord * 2. - 1.; float r2 = dot(q, q); if (r2 > 1.) discard;
      gl_FragColor = vec4(vec3(1.0, 0.52, 0.3) * (exp(-r2 * 10.) + exp(-r2 * 3.) * 0.1) * uI, 1.); }`,transparent:!0,depthWrite:!1,blending:e.AdditiveBlending}));wt.frustumCulled=!1,wt.renderOrder=1,k.add(wt);let Lt=ue.clone(),qe=[J.mars,J.marsAtmo,At];function je(a,u){let C=u?Q.marsFar(a):1;Lt.copy(ue).sub(K.position).multiplyScalar(C).add(K.position),J.mars.position.copy(Lt),J.marsAtmo.position.copy(Lt),J.marsAtmo.material.uniforms.uCenter.value.copy(Lt),At.position.copy(Lt),wt.position.copy(Lt);let M=6/Lt.distanceTo(K.position)*s/2/Math.tan(K.fov*Math.PI/360),q=u?1-gt(M,1.2,4):0;for(let W of qe)W.visible=u&&M>.9;return wt.visible=q>.001,Nt.uI.value=5*q,Nt.uPx.value=9*U.getPixelRatio(),M}let Gt=[J.earth,J.clouds,J.moon,J.mars,J.earthAtmo,J.marsAtmo,At,wt],fo=[J.earth,J.clouds,J.moon,J.earthAtmo],lt=null,It=a=>a.getBoundingClientRect();function ae(){N=Math.max(1,t.clientWidth),s=Math.max(1,t.clientHeight);let a=It(r),u=s,C={};for(let Ne in c){if(!c[Ne])continue;let nt=It(c[Ne]),Ot=c[Ne].firstElementChild,$t=Ot?It(Ot):nt;C[Ne]={top:nt.top-a.top,h:nt.height,tc:($t.top+$t.bottom)/2-a.top}}let M=(Ne,nt=0)=>C[Ne].tc-u/2+nt*u,q=(Ne,nt)=>C[Ne].top+nt*C[Ne].h-u/2,W=Math.max(1,a.height-u),ye=N<768&&s>N?-.12:0,vt=1.9,Xe=(M("title",0)-M("earth",ye))/u,rt=Math.min(1,Xe/vt),ct=rt**.6,pt=Math.max(0,Math.min(Math.sqrt(rt),(Xe-.5*ct-.15*rt)/.7)),ht=[[M("earth",ye-.6),-1],[M("earth",ye),-.9],[M("earth",ye+.7*pt),-.64],[M("title",-.5*ct),-.15],[M("title",0),0],[M("reind",0),.26],[q("colony",0),.62],[q("colony",1),.9],[W,bo]];for(let Ne=1;Ne<ht.length;Ne++)ht[Ne][0]<=ht[Ne-1][0]+1&&(ht[Ne][0]=ht[Ne-1][0]+1);lt={vh:u,yEnd:W,S:Fa(ht),sc:C};{let Ne=ht[0][0],nt=W;for(let Ot=0;Ot<50;Ot++){let $t=(Ne+nt)/2;lt.S($t)<Qn?Ne=$t:nt=$t}lt.ySol=(Ne+nt)/2}Q.layout({S:lt.S,yE:ht[0][0],y1:W,vh:u});let St=[C.austin.top-u,M("austin",0),M("austin",.5),ht[0][0]];for(let Ne=St.length-2;Ne>=0;Ne--)St[Ne]>=St[Ne+1]-1&&(St[Ne]=St[Ne+1]-Math.max(1,.25*u));et.layout({yA:St[0],yT:St[1],yX:St[2],yE:St[3],S:lt.S}),O.layout(st,N/s),$e(),dt(),ie(),He()}function ie(){let a=r.nextElementSibling;for(;a&&(a.offsetHeight===0||getComputedStyle(a).display==="none");)a=a.nextElementSibling;let u=M=>{let q=M&&getComputedStyle(M).backgroundColor.match(/[\d.]+/g);return q&&(q.length<4||+q[3]>.5)?q:null},C=null;for(let M=a,q=0;M&&!C&&q<3;M=M.firstElementChild,q++)C=u(M);for(let M=r.parentElement;M&&!C;M=M.parentElement)C=u(M);C=C||[0,0,0],io.el=a,io.col[0]=C[0]/255,io.col[1]=C[1]/255,io.col[2]=C[2]/255}let Pe=null,ut=()=>N<768?24:40;function $e(){Pe=null;let a=c.title,u=a&&a.querySelector('[data-split="left"]'),C=a&&a.querySelector('[data-split="right"]');if(!u||!C)return;let M=u.parentElement;u.style.transform=C.style.transform="";let q=It(M),W=It(u),ye=It(C),vt=Math.abs((W.top+W.bottom)/2-(ye.top+ye.bottom)/2)<W.height*.5,Xe=N>=768,rt=(Xe?ki:Li)*s;if(vt){let ct=ye.left-W.right,pt;if(Xe){pt=Math.max(.05*s,Math.min(rt,ct/2/(1+Sr)));let ht=Math.max(0,ct/2-pt*(1+Sr));u.style.transform=`translate3d(${ht}px,0,0)`,C.style.transform=`translate3d(${-ht}px,0,0)`}else pt=Math.max(.05*s,Math.min(rt,(ct/2-ut())/1.08));Pe={Ls:u,Rs:C,h2:M,x:(W.right+ye.left)/2-q.left,y:(W.top+W.bottom+ye.top+ye.bottom)/4-q.top,r:pt}}else{let ct=Math.min(rt,.4*N),pt=Xe?ct*(1+Sr):ct*1.08+ut(),ht=ye.top-W.bottom,St=Xe?pt-ht/2:Math.max(0,pt-ht/2);u.style.transform=`translate3d(0,${-St}px,0)`,C.style.transform=`translate3d(0,${St}px,0)`,Pe={Ls:u,Rs:C,h2:M,x:((W.left+W.right)/2+(ye.left+ye.right)/2)/2-q.left,y:(W.bottom+ye.top)/2-q.top,r:ct}}}let Mt=null;function dt(){Mt=null;let a=c.reind&&c.reind.firstElementChild;if(!a)return;let u=document.createRange();u.selectNodeContents(a);let C=0;for(let ye of u.getClientRects())ye.width>1&&(C=Math.max(C,ye.right));let M=It(t),q=N-(C-M.left),W=Math.min(.21*s,.4*N);if(N>=768&&q>2.2*W){let ye=Math.min(W,(q/2-24)/1.08);Mt={x:C-M.left+q/2,y:s/2,r:ye}}else{let ye=It(a).height,vt=s<500?12:24,Xe=s/2-ye/2-24-.04*s,rt=Pe?Pe.r*(1+Xn*Wo[1]):0,ct=Math.max(.05*s,Math.min(W,.16*s,Xe/2.38),Math.min(rt,(N>=768?.2:.16)*s));Mt={x:N/2,y:Math.max(1.12*ct,Math.min(.3*s,s/2-ye/2-vt-1.19*ct)),r:ct}}}let ft=0,Kt=0,Fe=-1,Tt=0,xt="site",Zt="",Bi=!1,fa=!0,ha=!1,Jn=!1,jo=0,da=0,va=0,qa=null,Ar=0,Xa=0,yo=!0,Cr=!1,wo=!1,Mo=0,qo=0,Xo=0,oo=0,ma=1,ko=!1,Ko=null,Rn=3,io={k:0,col:[0,0,0],el:null},Ka=new e.Vector3,Ya=new e.Vector3,zr=new e.Vector3,pa={x:0,y:0},ao={x:0,y:0},_n=.05,Qa=new URLSearchParams(location.search).get("touch"),ga=matchMedia("(pointer: coarse)"),Za={on:Qa?Qa==="1":ga.matches},So=0,Dr=()=>{Qa||(Za.on=ga.matches,So=0)};ga.addEventListener?.("change",Dr);let Pr=a=>{pa.x=a.clientX/innerWidth-.5,pa.y=a.clientY/innerHeight-.5};addEventListener("mousemove",Pr,{passive:!0});let Ct=new e.Vector3,Ht=new e.Vector3,Et=new e.Vector3,Hn=new e.Vector3,xa=new e.Vector3,Yo=new e.Vector3(0,1,0),Ao=new e.Vector3,En=new e.Color(16773596),Qo=(a,u)=>{(K.near!==a||K.far!==u)&&(K.near=a,K.far=u,K.updateProjectionMatrix())},ba={g:0,t:0},Oo={lam:0,t:0,sinE:1,proj:1,pr:1},Ja={t:0,intro:1,camPos:Ct,spin:0,hole:Ze},ho={dt:0,t:0,focus:0,aperture:0,maxblur:0,ca:0},$n=new e.Vector3,ya={k:0,mb:0};function Ra(a){let u=Ie.shadow.camera;Ie.shadow.normalBias=a?.1:.35,a?(u.left=-160,u.right=160,u.top=80,u.bottom=-80,u.near=50,u.far=900,ee.intensity=.03):(u.left=-390,u.right=390,u.near=60,u.far=1300,Ie.color.copy(En)),u.updateProjectionMatrix()}let Co=!1,Zo=(a,u,C)=>Xt(Vt((a-u)/(C-u)));function es(a,u){let C=a&&Pe?Zo(Fe,-.15,-.02)*(1-Zo(Fe,.04,.12)):0,M=a&&Mt?Zo(Fe,Wo[0],Wo[1])*(1-Zo(Fe,Wo[2],Wo[3])):0,q=()=>{u?(K.setViewOffset(N,s,0,u*s,N,s),Co=!0):Co&&(Co=!1,K.clearViewOffset())};if(C<=0&&M<=0)return q();let W=Math.tan(K.fov*Math.PI/360);K.updateMatrixWorld(),Ao.copy(ue).applyMatrix4(K.matrixWorldInverse);let ye=Ao.length();if(Ao.z>-6.2||ye<6.2)return q();let vt=Ao.x/-Ao.z/(W*K.aspect),Xe=Ao.y/-Ao.z/W,rt=N/2+vt*N/2,ct=s/2-Xe*s/2,pt=Math.tan(Math.asin(6.05/ye))/W*s/2,ht=rt,St=ct-u*s,Ne=1+Xn*Fe;if(C>0&&M>0){let nt=Math.min(1,C+M),Ot=M/(C+M),$t=It(Pe.h2),Ma=It(t);pt=bt(pt,bt(Pe.r,Mt.r,Ot)*Ne,nt),ht=bt(ht,bt($t.left-Ma.left+Pe.x,Mt.x,Ot),nt),St=bt(St,bt(s/2,Mt.y,Ot),nt)}else{if(N<992&&M>0&&Fe>Wo[2]){let nt=Mt.r*Ne,Ot=pt-nt;pt=.5*(pt+nt+Math.sqrt(Ot*Ot+.01*nt*nt*M))}if(C>0){let nt=It(Pe.h2),Ot=It(t);pt=bt(pt,Pe.r*Ne,C),ht=bt(ht,nt.left-Ot.left+Pe.x,C),St=bt(St,s/2,C)}M>0&&(pt=bt(pt,Mt.r*Ne,M),ht=bt(ht,Mt.x,M),St=bt(St,Mt.y,M))}{let nt=Math.max(6.6/ye,6.05/Math.sin(Math.atan(pt*2*W/s))/ye);Ct.sub(ue).multiplyScalar(nt).add(ue),K.position.sub(ue).multiplyScalar(nt).add(ue),K.updateMatrixWorld()}K.setViewOffset(N,s,-(ht-rt),-(St-ct),N,s),Co=!0}let lo={inCol:!1,cam:K,t:0,dt:0,alt:0,fog:k.fog,e:0};function ts(a,u,C){let M=Vt((Fe-Rt)/(ca-Rt));lo.inCol=a,lo.sunDir=g.sun,lo.night=g.night,lo.t=u,lo.dt=C,lo.e=M,lo.fog=k.fog,lo.alt=a?K.position.y-no.y:K.position.distanceTo(ue),J.entry(M,lo)}let _a=[0,0],Jo={entry:-1,gR:-1,plume:null};function os(a){let u=a&&g.api&&g.api.rockets,C=u&&u.launch,M=a?oo:-1;Jo.entry=Fe>Rt&&Fe<ca?(Fe-Rt)/(ca-Rt):-1,Jo.gR=M,Jo.plume=null,C&&C.base&&M>=.78&&(xa.copy(C.base).project(K),xa.z<1&&(_a[0]=xa.x*.5+.5,_a[1]=xa.y*.5+.5,Jo.plume=_a)),H.lensFrame(Jo);let q=C&&C.fx,W=H.fx;q&&W&&(q.flash>W.flash&&(W.flash=q.flash),q.heat>W.heat&&(W.heat=q.heat),q.bloom>W.bloom&&(W.bloom=q.bloom))}let Lr="",kr="",Or=o&&o.root&&+o.root.dataset.solFrom||1,as=o&&o.root&&+o.root.dataset.solTo||206;function rs(){if(!o||!o.root)return;let a=gt(Fe,.4,.43)*(1-gt(Fe,.57,.61)),u=gt(ft,lt.yEnd,lt.yEnd+.25*lt.vh),C=gt(Fe,Qn,.06)*(1-a)*(1-u),M=C.toFixed(3);M!==kr&&(kr=M,o.root.style.opacity=M,o.root.style.visibility=C>.005?"":"hidden");let q=Vt((ft-lt.ySol)/Math.max(1,lt.yEnd-1-lt.ySol)),W=String(Or+Math.floor((as-Or)*q+1e-6)).padStart(4,"0");W!==Lr&&o.value&&(Lr=W,o.value.textContent=W)}let Fr=-1,Br="",Ha={p:0,beat:""},ns=new CustomEvent("tf:film",{detail:Ha}),Vr=()=>Fe<-.55?Tt<1?"austin":"earth":Fe<.12?"mars-title":Fe<.42?"reindustrialize":Fe<.88?"colony":"launch";function ss(a){lt||ae();let u=va,C=-It(r).top;if(fa||Math.abs(C-ft)>2*lt.vh)ft=C,Kt=0,So=0,fa=!1,d();else{let ot=ft;if(Za.on){let Bt=2/_n,qt=Bt*a,ro=1/(1+qt+.48*qt*qt+.235*qt*qt*qt),Ho=ft-C,Eo=(So+Bt*Ho)*a;So=(So-Bt*Eo)*ro,ft=C+(Ho+Eo)*ro,Math.abs(ft-C)<.5&&Math.abs(So)<20&&(ft=C,So=0)}else window.lenis?ft=C:ft+=(C-ft)*(1-Math.exp(-a/.05));Kt=a>0?(ft-ot)/a:0}ao.x+=(pa.x-ao.x)*a*2,ao.y+=(pa.y-ao.y)*a*2,et.at(ft,Ue),Tt=Ue.s,Fe=Math.min(bo,Math.max(-1,lt.S(ft))),Tt<1&&(Fe=-1);let M=Tt<1,q=Ue.lam;xt=M?Ue.world:Fe>=to?"colony":"space";{let ot=ft>=lt.yEnd-2,Bt=ot?Kn:Mo>0?-2.5*Kn:0;qo+=(Bt-qo)*(1-Math.exp(-a/Oi)),Mo=Math.min(Yn,Math.max(0,Mo+qo*a)),Mo<=0&&qo<0&&(qo=0),Xo=Ft(Fe),oo=Xo+Mo*gt(Xo,.95,1)}io.k=gt(ft-lt.yEnd,-.3*lt.vh,0),Tt>.6&&J.loadDeferred("moon"),Fe>-.9&&J.loadDeferred("mars"),xt==="colony"?g.ensure():Fe>.3&&Nr();let W=xt==="colony",ye=xt==="site",vt=M?0:gt(Fe,-1,-.92),Xe=46,rt=30;if(Yo.set(0,1,0),ye){let ot=Ue.dist,Bt=1-Ue.upk;Et.copy(Ue.pos),Et.x+=ao.x*3*Bt,Et.z+=ao.y*2*Bt,Ct.copy(Et).add(i),Ht.copy(Ue.look).add(i),Yo.copy(Ue.up),Xe=Ue.fov,rt=ot,Ar=ot,Qo(Math.max(.3,ot*.004),ot*8+3e3),ba.g=Ue.g,ba.hour=Ue.hour,ba.t=u,qa=p.update(ba);{let ro=U.getPixelRatio();Oo.lam=q,Oo.t=u,Oo.sinE=qa.sinE,Oo.pr=ro,Oo.proj=s*ro/(2*Math.tan(e.MathUtils.degToRad(Xe)/2)),O.update(Oo)}p.follow(Et,ot),k.fog.near=1e8,k.fog.far=1e9,I.intensity*=1-gt(q,Math.log(3e3),Math.log(6e4));let qt=qa.night;H.trails.enabled=b&&we&&qt>.02,H.trails.amount=.65*qt}else if(xt==="globe")Ct.copy(Ue.pos),Ht.copy(Ue.look),Xe=Ue.fov,rt=Ue.dist*te,Qo(Math.min(.1,Math.max(5e-4,rt*.04)),9e3);else if(W){Xe=Y(Fe,Ct,Ht,oo),Ct.x+=ao.x*8*vt,Ct.y-=ao.y*5*vt,rt=Ct.distanceTo(Ht);let ot=g.api&&g.api.rockets&&g.api.rockets.launch;if(ot&&ot.burn>.004){rt=bt(rt,Ct.distanceTo(ot.pos),gt(oo,yt,yt+.03));let Bt=ot.shake*Ct.distanceTo(Ht)*.0022;if(Bt>1e-4){Ka.copy(Ht).sub(Ct).normalize(),Ya.crossVectors(Ka,Yo).normalize(),zr.crossVectors(Ya,Ka);let qt=Math.sin(u*31)*.6+Math.sin(u*57+1.7)*.4,ro=Math.sin(u*37+.6)*.6+Math.sin(u*71+2.9)*.4;Ht.addScaledVector(Ya,qt*Bt).addScaledVector(zr,ro*Bt)}}Qo(e.MathUtils.clamp((Ct.y-no.y)*.08,.1,30),9e3)}else Xe=Dt(Fe,Ct,Ht,Yo),Xe=gr(Fe,Xe,K.aspect),rt=bt(Ct.distanceTo(ze),Ct.distanceTo(Ht),gt(Fe,-1,-.92)),Qo(.1,12e3);ye||(H.trails.enabled=!1);{let ot=M?gt(q,Math.log(450),Math.log(3600))*(1-gt(q,14,15.9)):0;H.motion.shutter=.6+2.4*ot,H.motion.maxLen=.035+.11*ot}if(H.auto.enabled=!M,M?(U.toneMappingExposure=bn(Ia(Ue.hour,Te).sinE,q),H.snapExposure()):(U.toneMappingExposure=1.05,H.auto.min=.55),xt!==Zt){p.group.visible=ye,w.visible=W;let ot=!ye&&!W;Gt.forEach(Bt=>Bt.visible=ot),Ra(ye),H.motion.cutDist=xt==="site"||xt==="globe"?1e12:400,H.ao.enabled=ye&&b,(Zt==="site"&&xt==="globe"||Zt==="")&&H.resetMotion(),Zt=xt,yo=!0,U.compile(Ea,K,k)}if(xt==="space"){let ot=Fe>-.12;for(let Bt of fo)Bt.visible=!ot}let ct=W?g.sun:j,pt=W&&g.api.build(Xo,u,oo);if(W&&se(Fe),W){let ot=g.api.rockets;ot&&ot.setKeep&&ot.keep!==Ae&&(ot.keep=Ae,ot.setKeep(Ae))}if(xt!=="site"&&xt!=="globe"&&ts(W,u,a),!W&&!ye&&(k.fog.near=1e8,k.fog.far=1e9,Ie.intensity=2.4,ee.intensity=.35,I.intensity=0),Xa++,ye)(yo||Ie.intensity>.01&&(Ar<2500||Xa%10===0))&&(U.shadowMap.needsUpdate=!0,yo=!1);else if(W){let ot=ko?Math.max(ma,Rn):ma;(yo||(pt||de())&&Xa%ot===0||!ko&&pt)&&(U.shadowMap.needsUpdate=!0,yo=!1)}else Ie.target.position.set(0,0,0),Ie.position.copy(ct).multiplyScalar(100);let ht=Ct.distanceTo(Ht);M||(Et.set(Math.sin(u*.21)*.6+Math.sin(u*.53+1.3)*.25,Math.sin(u*.17+2.1)*.5+Math.sin(u*.41)*.2,Math.sin(u*.13+4)*.4).multiplyScalar(ht*.002*vt),xt==="space"&&(Et.x+=ao.x*2.2*vt,Et.y-=ao.y*1.4*vt,Q.drift(Fe,Ct,Et)),Ct.add(Et)),K.up.copy(Yo),Math.abs(K.fov-Xe)>5e-4&&(K.fov=Xe,K.updateProjectionMatrix()),K.position.copy(Ct),K.lookAt(Ht),W&&ke(Fe,T)>0?(S(Fe,Xe),rt=bt(rt,Ct.distanceTo(l(oo,Hn)),ke(Fe,T))):es(xt==="space",xt==="globe"||xt==="site"?0:xr(Fe,K.aspect)),!ye&&!W&&je(Fe,xt==="space"),Ja.t=u,Ja.spin=oe-u*D+(M?0:(Fe+1)*.5),J.update(Ja),(xt==="space"||xt==="globe")&&Fe<-.12&&J.moon.position.copy(Q.moonAt(Fe,$n)),xt==="space"&&Qt(u,Fe),J.mars.material.uniforms.uDomes.value=1-gt(Ct.distanceTo(ue),14,30),he&&(he.update(Ct),he.group.visible=!W&&!ye);let St=xt==="globe"?Vt((q-re)/(Be-re)):1;X.visible=!ye,X.position.copy(Ct).addScaledVector(ct,1600);let Ne=Math.max(0,Et.copy(Ht).sub(Ct).normalize().dot(ct)),nt=gt(St,.55,1)*(.25+Ne*.9)*(W?.22*(1-gt(g.sun.y,.02,-.04)):0);X.scale.setScalar(260*nt+40),X.material.opacity=Math.min(1,nt*1.3),ce.strength=.6+nt*.3;{let ot=1-gt(rt,2,4),Bt=M?0:gt(Fe,-1,-.92),qt=W?1:gt(Fe,Rt,to),ro=W?gt(oo,yt-.01,yt+.03):0,Ho=bt(bt(4e-4,.003+.017*ot,Bt),bt(.006,.0022,ro),qt),Eo=bt(bt(8e-4,.0018+.0032*ot,Bt),bt(.0042,.0024,ro),qt);ho.dt=a,ho.t=u,ho.focus=rt,ho.aperture=Ho/rt,ho.maxblur=b?Eo:0,ho.ca=.012,ya.k=Ho,ya.mb=Eo}if(os(W),ye&&c.austin&&c.austin.firstElementChild){let ot=It(c.austin.firstElementChild),Bt=It(t),qt=ot.bottom>Bt.top&&ot.top<Bt.bottom;H.scrim(((ot.left+ot.right)/2-Bt.left)/N,1-((ot.top+ot.bottom)/2-Bt.top)/s,.66*ot.width/N+.05,.8*ot.height/s+.07,qt?.45*(1-Ue.upk):0)}else H.scrim(.5,.5,1,1,0);Oe();let Ot=W?ke(Fe,T):0;H.edge(io.k,Ko||io.col,bt(Math.max(.3,160/s),Math.max(.15,120/s),Ot),W?(Ko?.42:.3)*io.k*gt(oo,yt,yt+.05)*(1-Ot):0),H.update(ho),rs(),H.render();let $t=Vt(ft/lt.yEnd),Ma=Math.round($t*1e4),or=Vr();(Ma!==Fr||or!==Br)&&(Fr=Ma,Br=or,Ha.p=$t,Ha.beat=or,window.dispatchEvent(ns))}let zo=window.requestIdleCallback?(a,u=700)=>requestIdleCallback(a,{timeout:u}):a=>setTimeout(a,120),Fo=300,Ur=!1;function Nr(){if(Ur||g.done)return;Ur=!0;let a=u=>{if(!wo){if(u&&!u.didTimeout&&u.timeRemaining&&u.timeRemaining()<8)return zo(a,Fo);g.step()?zo(fs,Fo):zo(a,Fo)}};zo(a,Fo)}function is(){wo||(J.loadDeferred("mars"),g.loadMaps(),Nr(),b&&(Ir=p.addShrouds({next:()=>new Promise(a=>zo(a,Fo)),alive:()=>!wo}).catch(a=>(console.warn("TerraFirma film: no shroud.",a),null))))}let Ir=null,ls=new e.WebGLRenderTarget(4,4,{type:e.HalfFloatType}),Gr=a=>new Promise(u=>setTimeout(u,a)),cs=U.extensions.has("KHR_parallel_shader_compile"),Ea=new e.Object3D,Ro=a=>{if(cs)return U.compileAsync(a,K,k);let u=performance.now();return U.compile(a,K,k),Sa&&console.log("[film warm] blocking compile",a.name||a.type,(performance.now()-u).toFixed(0)+" ms"),Promise.resolve()},wa=()=>[...Gt,X,...he?[he.group]:[],...J.entryRoots()];function _o(a,u){let C=[p.group,w,...wa()],M=C.map(W=>W.visible),q=U.getRenderTarget();p.group.visible=a==="site",w.visible=a==="colony";for(let W of wa())W.visible=a==="space";U.setRenderTarget(ls);try{return u()}finally{C.forEach((W,ye)=>W.visible=M[ye]),U.setRenderTarget(q),U.compile(Ea,K,k)}}function $a(a){let u=[],C=Zt;_o(a,()=>{a==="colony"&&g.api.build(0,0);for(let M of a==="site"?[p.group]:a==="colony"?[w,...J.entryRoots()]:wa())M.traverse(q=>{u.push([q,q.visible,q.frustumCulled]),q.visible=!0,q.frustumCulled=!1});try{Ra(a==="site"),U.compile(Ea,K,k),U.shadowMap.needsUpdate=a!=="space",U.render(k,K)}finally{for(let[M,q,W]of u)M.visible=q,M.frustumCulled=W}}),C&&Ra(C==="site"),yo=!0}async function us(){let a=[];await Le,_o("site",()=>a.push(Ro(p.group))),_o("space",()=>{for(let u of wa())a.push(Ro(u))}),await Promise.race([Promise.all(a),Gr(1500)]),$a("site"),$a("space"),H.warm({fx:b})}async function fs(){if(wo)return;let a;_o("colony",()=>{g.api.build(0,0);let u=[];for(let C of[w,...J.entryRoots()])C.traverse(M=>{u.push([M,M.visible]),M.visible=!0});try{a=Promise.all([Ro(w),...J.entryRoots().map(Ro)])}finally{for(let[C,M]of u)C.visible=M}}),await Promise.race([a,Gr(1500)]),await new Promise(u=>zo(u,Fo)),!wo&&Zt!=="colony"&&$a("colony")}let hs=Promise.all([J.ready,p.ready,Le]).then(()=>us()).then(()=>{Cr=!0,zo(is)}),Bo=null;function Tr(){N=Math.max(1,t.clientWidth),s=Math.max(1,t.clientHeight),U.setSize(N,s,!1),H.setSize(N,s),K.aspect=N/s,K.updateProjectionMatrix(),lt=null,Co&&(Co=!1,K.clearViewOffset()),le.reset()}Bo=new ResizeObserver(()=>{Tr()}),Bo.observe(t),Bo.observe(r),me&&Bo.observe(me),document.fonts?.ready.then(()=>{lt=null});let er=()=>{lt=null};addEventListener("load",er);function Wr(a){if(!(!ha||!Cr||wo)){a=Math.max(0,a||0),$||(va+=Math.min(a,1/15)),le.frame(a*1e3/(ko?2:1)),B.poll(),B.begin();try{ss(Math.min(.05,a))}finally{B.end()}}}let tr=null,jr=a=>{if(jo=requestAnimationFrame(jr),tr){tr();return}let u=da?(a-da)/1e3:1/60;da=a,Wr(u)};return{ready:hs,canvas:G,renderer:U,post:H,scene:k,cam:K,aircraft:O,flight:Q,perf:le,get shrouds(){return Ir},start(a=!1,u=null){ha||(ha=!0,Jn=a,tr=u,fa=!0,da=0,a||(jo=requestAnimationFrame(jr)))},stop(){ha=!1,jo&&(cancelAnimationFrame(jo),jo=0)},step:Wr,resize:Tr,relayout:er,setOverlap(a){ko=!!a},setSeam(a){Ko=a&&a.length>=3?a:null},snap(){fa=!0},tune:ne,look:yr,get freeze(){return $},set freeze(a){$=!!a},yOfClock(a){lt||ae();let u=et.k;return a<=-1?bt(u.yA,u.yE,Vt(a+2)):this.yOf(Math.min(a,bo))},setClock(a){va=a},yOf(a){lt||ae();let u=0,C=lt.yEnd;for(let M=0;M<50;M++){let q=(u+C)/2;lt.S(q)<a?u=q:C=q}return(u+C)/2},get state(){return{y:ft,v:Kt,t:va,s:Tt,S:Fe,mode:xt,beat:Vr(),colonyDone:g.done,programs:U.info.programs.length,layout:lt&&{yEnd:lt.yEnd,vh:lt.vh},touch:Za.on,yT:lt?-It(r).top:0,dof:{k:ya.k,maxblur:ya.mb,focus:ho.focus},g:+Xo.toFixed(4),gL:+oo.toFixed(4),over:+Mo.toFixed(4),edge:+io.k.toFixed(3),end:+ke(Fe,T).toFixed(4),overlap:ko,seam:Ko&&Ko.map(a=>+a.toFixed(3)),perf:{level:le.level,ceil:le.ceil,p90:le.state.p90,gpu:le.state.gpu,capped:le.state.capped,steps:le.state.steps,pr:U.getPixelRatio(),post:H.getQuality(),shadow:Ie.shadow.mapSize.x,every:ma,keep:Ae},mars:{star:wt.visible?+Nt.uI.value.toFixed(3):0,disc:J.mars.visible},site:Tt<1?{hour:+Ue.hour.toFixed(2),g:+Ue.g.toFixed(3),dist:Math.round(Ue.dist),world:Ue.world,exp:+U.toneMappingExposure.toFixed(3)}:null}},dispose(){wo=!0,this.stop(),Bo&&Bo.disconnect(),removeEventListener("mousemove",Pr),ga.removeEventListener?.("change",Dr),removeEventListener("load",er);for(let a of["Ls","Rs"])Pe&&Pe[a]&&(Pe[a].style.transform="");O.dispose(),k.traverse(a=>{a.geometry&&a.geometry.dispose()}),B.dispose(),U.dispose(),G.remove()}}}export{dc as createFilm};
