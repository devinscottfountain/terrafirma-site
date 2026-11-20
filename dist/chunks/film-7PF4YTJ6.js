import{a as Ha}from"./chunk-E5WEMQM4.js";import{a as Ea}from"./chunk-ECMF7PTV.js";import{a as Ir,b as Gr,c as Tr,e as Wr}from"./chunk-TAKKMMN3.js";import{a as ho}from"./chunk-4CI7YULG.js";import"./chunk-4C5RVMER.js";import{a as Ur,b as Nr}from"./chunk-M5U4GD3X.js";import"./chunk-FCTCDFK5.js";import{m as jr}from"./chunk-VSEMZT6Q.js";import{Clock as as,HalfFloatType as rs,NoBlending as ns,Vector2 as Kr,WebGLRenderTarget as ss}from"three";var ga={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

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


		}`};import{ShaderMaterial as Xr,UniformsUtils as os}from"three";import{BufferGeometry as Hn,Float32BufferAttribute as qr,OrthographicCamera as En,Mesh as $n}from"three";var Xt=class{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}},es=new En(-1,1,1,-1,0,1),$a=class extends Hn{constructor(){super(),this.setAttribute("position",new qr([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new qr([0,2,0,0,2,0],2))}},ts=new $a,Zt=class{constructor(t){this._mesh=new $n(ts,t)}dispose(){this._mesh.geometry.dispose()}render(t){t.render(this._mesh,es)}get material(){return this._mesh.material}set material(t){this._mesh.material=t}};var Bo=class extends Xt{constructor(t,r){super(),this.textureID=r!==void 0?r:"tDiffuse",t instanceof Xr?(this.uniforms=t.uniforms,this.material=t):t&&(this.uniforms=os.clone(t.uniforms),this.material=new Xr({name:t.name!==void 0?t.name:"unspecified",defines:Object.assign({},t.defines),uniforms:this.uniforms,vertexShader:t.vertexShader,fragmentShader:t.fragmentShader})),this.fsQuad=new Zt(this.material)}render(t,r,l){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=l.texture),this.fsQuad.material=this.material,this.renderToScreen?(t.setRenderTarget(null),this.fsQuad.render(t)):(t.setRenderTarget(r),this.clear&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),this.fsQuad.render(t))}dispose(){this.material.dispose(),this.fsQuad.dispose()}};var Jo=class extends Xt{constructor(t,r){super(),this.scene=t,this.camera=r,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(t,r,l){let o=t.getContext(),c=t.state;c.buffers.color.setMask(!1),c.buffers.depth.setMask(!1),c.buffers.color.setLocked(!0),c.buffers.depth.setLocked(!0);let z,x;this.inverse?(z=0,x=1):(z=1,x=0),c.buffers.stencil.setTest(!0),c.buffers.stencil.setOp(o.REPLACE,o.REPLACE,o.REPLACE),c.buffers.stencil.setFunc(o.ALWAYS,z,4294967295),c.buffers.stencil.setClear(x),c.buffers.stencil.setLocked(!0),t.setRenderTarget(l),this.clear&&t.clear(),t.render(this.scene,this.camera),t.setRenderTarget(r),this.clear&&t.clear(),t.render(this.scene,this.camera),c.buffers.color.setLocked(!1),c.buffers.depth.setLocked(!1),c.buffers.color.setMask(!0),c.buffers.depth.setMask(!0),c.buffers.stencil.setLocked(!1),c.buffers.stencil.setFunc(o.EQUAL,1,4294967295),c.buffers.stencil.setOp(o.KEEP,o.KEEP,o.KEEP),c.buffers.stencil.setLocked(!0)}},xa=class extends Xt{constructor(){super(),this.needsSwap=!1}render(t){t.state.buffers.stencil.setLocked(!1),t.state.buffers.stencil.setTest(!1)}};var ba=class{constructor(t,r){if(this.renderer=t,this._pixelRatio=t.getPixelRatio(),r===void 0){let l=t.getSize(new Kr);this._width=l.width,this._height=l.height,r=new ss(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:rs}),r.texture.name="EffectComposer.rt1"}else this._width=r.width,this._height=r.height;this.renderTarget1=r,this.renderTarget2=r.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new Bo(ga),this.copyPass.material.blending=ns,this.clock=new as}swapBuffers(){let t=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=t}addPass(t){this.passes.push(t),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(t,r){this.passes.splice(r,0,t),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(t){let r=this.passes.indexOf(t);r!==-1&&this.passes.splice(r,1)}isLastEnabledPass(t){for(let r=t+1;r<this.passes.length;r++)if(this.passes[r].enabled)return!1;return!0}render(t){t===void 0&&(t=this.clock.getDelta());let r=this.renderer.getRenderTarget(),l=!1;for(let o=0,c=this.passes.length;o<c;o++){let z=this.passes[o];if(z.enabled!==!1){if(z.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(o),z.render(this.renderer,this.writeBuffer,this.readBuffer,t,l),z.needsSwap){if(l){let x=this.renderer.getContext(),y=this.renderer.state.buffers.stencil;y.setFunc(x.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,t),y.setFunc(x.EQUAL,1,4294967295)}this.swapBuffers()}Jo!==void 0&&(z instanceof Jo?l=!0:z instanceof xa&&(l=!1))}}this.renderer.setRenderTarget(r)}reset(t){if(t===void 0){let r=this.renderer.getSize(new Kr);this._pixelRatio=this.renderer.getPixelRatio(),this._width=r.width,this._height=r.height,t=this.renderTarget1.clone(),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=t,this.renderTarget2=t.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(t,r){this._width=t,this._height=r;let l=this._width*this._pixelRatio,o=this._height*this._pixelRatio;this.renderTarget1.setSize(l,o),this.renderTarget2.setSize(l,o);for(let c=0;c<this.passes.length;c++)this.passes[c].setSize(l,o)}setPixelRatio(t){this._pixelRatio=t,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}};import{AdditiveBlending as ls,Color as Qr,HalfFloatType as er,MeshBasicMaterial as cs,ShaderMaterial as ya,UniformsUtils as Zr,Vector2 as vo,Vector3 as Ro,WebGLRenderTarget as tr}from"three";import{Color as is}from"three";var Yr={name:"LuminosityHighPassShader",shaderID:"luminosityHighPass",uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new is(0)},defaultOpacity:{value:0}},vertexShader:`

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

		}`};var Fo=class e extends Xt{constructor(t,r,l,o){super(),this.strength=r!==void 0?r:1,this.radius=l,this.threshold=o,this.resolution=t!==void 0?new vo(t.x,t.y):new vo(256,256),this.clearColor=new Qr(0,0,0),this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let c=Math.round(this.resolution.x/2),z=Math.round(this.resolution.y/2);this.renderTargetBright=new tr(c,z,{type:er}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let b=0;b<this.nMips;b++){let C=new tr(c,z,{type:er});C.texture.name="UnrealBloomPass.h"+b,C.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(C);let w=new tr(c,z,{type:er});w.texture.name="UnrealBloomPass.v"+b,w.texture.generateMipmaps=!1,this.renderTargetsVertical.push(w),c=Math.round(c/2),z=Math.round(z/2)}let x=Yr;this.highPassUniforms=Zr.clone(x.uniforms),this.highPassUniforms.luminosityThreshold.value=o,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new ya({uniforms:this.highPassUniforms,vertexShader:x.vertexShader,fragmentShader:x.fragmentShader}),this.separableBlurMaterials=[];let y=[3,5,7,9,11];c=Math.round(this.resolution.x/2),z=Math.round(this.resolution.y/2);for(let b=0;b<this.nMips;b++)this.separableBlurMaterials.push(this.getSeperableBlurMaterial(y[b])),this.separableBlurMaterials[b].uniforms.invSize.value=new vo(1/c,1/z),c=Math.round(c/2),z=Math.round(z/2);this.compositeMaterial=this.getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=r,this.compositeMaterial.uniforms.bloomRadius.value=.1;let m=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=m,this.bloomTintColors=[new Ro(1,1,1),new Ro(1,1,1),new Ro(1,1,1),new Ro(1,1,1),new Ro(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors;let L=ga;this.copyUniforms=Zr.clone(L.uniforms),this.blendMaterial=new ya({uniforms:this.copyUniforms,vertexShader:L.vertexShader,fragmentShader:L.fragmentShader,blending:ls,depthTest:!1,depthWrite:!1,transparent:!0}),this.enabled=!0,this.needsSwap=!1,this._oldClearColor=new Qr,this.oldClearAlpha=1,this.basic=new cs,this.fsQuad=new Zt(null)}dispose(){for(let t=0;t<this.renderTargetsHorizontal.length;t++)this.renderTargetsHorizontal[t].dispose();for(let t=0;t<this.renderTargetsVertical.length;t++)this.renderTargetsVertical[t].dispose();this.renderTargetBright.dispose();for(let t=0;t<this.separableBlurMaterials.length;t++)this.separableBlurMaterials[t].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this.basic.dispose(),this.fsQuad.dispose()}setSize(t,r){let l=Math.round(t/2),o=Math.round(r/2);this.renderTargetBright.setSize(l,o);for(let c=0;c<this.nMips;c++)this.renderTargetsHorizontal[c].setSize(l,o),this.renderTargetsVertical[c].setSize(l,o),this.separableBlurMaterials[c].uniforms.invSize.value=new vo(1/l,1/o),l=Math.round(l/2),o=Math.round(o/2)}render(t,r,l,o,c){t.getClearColor(this._oldClearColor),this.oldClearAlpha=t.getClearAlpha();let z=t.autoClear;t.autoClear=!1,t.setClearColor(this.clearColor,0),c&&t.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this.fsQuad.material=this.basic,this.basic.map=l.texture,t.setRenderTarget(null),t.clear(),this.fsQuad.render(t)),this.highPassUniforms.tDiffuse.value=l.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this.fsQuad.material=this.materialHighPassFilter,t.setRenderTarget(this.renderTargetBright),t.clear(),this.fsQuad.render(t);let x=this.renderTargetBright;for(let y=0;y<this.nMips;y++)this.fsQuad.material=this.separableBlurMaterials[y],this.separableBlurMaterials[y].uniforms.colorTexture.value=x.texture,this.separableBlurMaterials[y].uniforms.direction.value=e.BlurDirectionX,t.setRenderTarget(this.renderTargetsHorizontal[y]),t.clear(),this.fsQuad.render(t),this.separableBlurMaterials[y].uniforms.colorTexture.value=this.renderTargetsHorizontal[y].texture,this.separableBlurMaterials[y].uniforms.direction.value=e.BlurDirectionY,t.setRenderTarget(this.renderTargetsVertical[y]),t.clear(),this.fsQuad.render(t),x=this.renderTargetsVertical[y];this.fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,t.setRenderTarget(this.renderTargetsHorizontal[0]),t.clear(),this.fsQuad.render(t),this.fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,c&&t.state.buffers.stencil.setTest(!0),this.renderToScreen?(t.setRenderTarget(null),this.fsQuad.render(t)):(t.setRenderTarget(l),this.fsQuad.render(t)),t.setClearColor(this._oldClearColor,this.oldClearAlpha),t.autoClear=z}getSeperableBlurMaterial(t){let r=[];for(let l=0;l<t;l++)r.push(.39894*Math.exp(-.5*l*l/(t*t))/t);return new ya({defines:{KERNEL_RADIUS:t},uniforms:{colorTexture:{value:null},invSize:{value:new vo(.5,.5)},direction:{value:new vo(.5,.5)},gaussianCoefficients:{value:r}},vertexShader:`varying vec2 vUv;
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
				}`})}getCompositeMaterial(t){return new ya({defines:{NUM_MIPS:t},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`varying vec2 vUv;
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
				}`})}};Fo.BlurDirectionX=new vo(1,0);Fo.BlurDirectionY=new vo(0,1);import{Color as us,HalfFloatType as fs,MeshDepthMaterial as hs,NearestFilter as Rr,NoBlending as ds,RGBADepthPacking as vs,ShaderMaterial as ms,UniformsUtils as ps,WebGLRenderTarget as gs}from"three";var Jr={name:"BokehShader",defines:{DEPTH_PACKING:1,PERSPECTIVE_CAMERA:1},uniforms:{tColor:{value:null},tDepth:{value:null},focus:{value:1},aspect:{value:1},aperture:{value:.025},maxblur:{value:.01},nearClip:{value:1},farClip:{value:1e3}},vertexShader:`

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

		}`};var wa=class extends Xt{constructor(t,r,l){super(),this.scene=t,this.camera=r;let o=l.focus!==void 0?l.focus:1,c=l.aperture!==void 0?l.aperture:.025,z=l.maxblur!==void 0?l.maxblur:1;this.renderTargetDepth=new gs(1,1,{minFilter:Rr,magFilter:Rr,type:fs}),this.renderTargetDepth.texture.name="BokehPass.depth",this.materialDepth=new hs,this.materialDepth.depthPacking=vs,this.materialDepth.blending=ds;let x=Jr,y=ps.clone(x.uniforms);y.tDepth.value=this.renderTargetDepth.texture,y.focus.value=o,y.aspect.value=r.aspect,y.aperture.value=c,y.maxblur.value=z,y.nearClip.value=r.near,y.farClip.value=r.far,this.materialBokeh=new ms({defines:Object.assign({},x.defines),uniforms:y,vertexShader:x.vertexShader,fragmentShader:x.fragmentShader}),this.uniforms=y,this.fsQuad=new Zt(this.materialBokeh),this._oldClearColor=new us}render(t,r,l){this.scene.overrideMaterial=this.materialDepth,t.getClearColor(this._oldClearColor);let o=t.getClearAlpha(),c=t.autoClear;t.autoClear=!1,t.setClearColor(16777215),t.setClearAlpha(1),t.setRenderTarget(this.renderTargetDepth),t.clear(),t.render(this.scene,this.camera),this.uniforms.tColor.value=l.texture,this.uniforms.nearClip.value=this.camera.near,this.uniforms.farClip.value=this.camera.far,this.renderToScreen?(t.setRenderTarget(null),this.fsQuad.render(t)):(t.setRenderTarget(r),t.clear(),this.fsQuad.render(t)),this.scene.overrideMaterial=null,t.setClearColor(this._oldClearColor),t.setClearAlpha(o),t.autoClear=c}setSize(t,r){this.materialBokeh.uniforms.aspect.value=t/r,this.renderTargetDepth.setSize(t,r)}dispose(){this.renderTargetDepth.dispose(),this.materialDepth.dispose(),this.materialBokeh.dispose(),this.fsQuad.dispose()}};import{HalfFloatType as _r,LinearFilter as xs,NearestFilter as Hr,ShaderMaterial as ar,Texture as Er,UniformsUtils as rr,WebGLRenderTarget as $r}from"three";import{Vector2 as or}from"three";var _o={name:"SMAAEdgesShader",defines:{SMAA_THRESHOLD:"0.1"},uniforms:{tDiffuse:{value:null},resolution:{value:new or(1/1024,1/512)}},vertexShader:`

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

		}`},Ho={name:"SMAAWeightsShader",defines:{SMAA_MAX_SEARCH_STEPS:"8",SMAA_AREATEX_MAX_DISTANCE:"16",SMAA_AREATEX_PIXEL_SIZE:"( 1.0 / vec2( 160.0, 560.0 ) )",SMAA_AREATEX_SUBTEX_SIZE:"( 1.0 / 7.0 )"},uniforms:{tDiffuse:{value:null},tArea:{value:null},tSearch:{value:null},resolution:{value:new or(1/1024,1/512)}},vertexShader:`

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

		}`},Ma={name:"SMAABlendShader",uniforms:{tDiffuse:{value:null},tColor:{value:null},resolution:{value:new or(1/1024,1/512)}},vertexShader:`

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

		}`};var Sa=class extends Xt{constructor(t,r){super(),this.edgesRT=new $r(t,r,{depthBuffer:!1,type:_r}),this.edgesRT.texture.name="SMAAPass.edges",this.weightsRT=new $r(t,r,{depthBuffer:!1,type:_r}),this.weightsRT.texture.name="SMAAPass.weights";let l=this,o=new Image;o.src=this.getAreaTexture(),o.onload=function(){l.areaTexture.needsUpdate=!0},this.areaTexture=new Er,this.areaTexture.name="SMAAPass.area",this.areaTexture.image=o,this.areaTexture.minFilter=xs,this.areaTexture.generateMipmaps=!1,this.areaTexture.flipY=!1;let c=new Image;c.src=this.getSearchTexture(),c.onload=function(){l.searchTexture.needsUpdate=!0},this.searchTexture=new Er,this.searchTexture.name="SMAAPass.search",this.searchTexture.image=c,this.searchTexture.magFilter=Hr,this.searchTexture.minFilter=Hr,this.searchTexture.generateMipmaps=!1,this.searchTexture.flipY=!1,this.uniformsEdges=rr.clone(_o.uniforms),this.uniformsEdges.resolution.value.set(1/t,1/r),this.materialEdges=new ar({defines:Object.assign({},_o.defines),uniforms:this.uniformsEdges,vertexShader:_o.vertexShader,fragmentShader:_o.fragmentShader}),this.uniformsWeights=rr.clone(Ho.uniforms),this.uniformsWeights.resolution.value.set(1/t,1/r),this.uniformsWeights.tDiffuse.value=this.edgesRT.texture,this.uniformsWeights.tArea.value=this.areaTexture,this.uniformsWeights.tSearch.value=this.searchTexture,this.materialWeights=new ar({defines:Object.assign({},Ho.defines),uniforms:this.uniformsWeights,vertexShader:Ho.vertexShader,fragmentShader:Ho.fragmentShader}),this.uniformsBlend=rr.clone(Ma.uniforms),this.uniformsBlend.resolution.value.set(1/t,1/r),this.uniformsBlend.tDiffuse.value=this.weightsRT.texture,this.materialBlend=new ar({uniforms:this.uniformsBlend,vertexShader:Ma.vertexShader,fragmentShader:Ma.fragmentShader}),this.fsQuad=new Zt(null)}render(t,r,l){this.uniformsEdges.tDiffuse.value=l.texture,this.fsQuad.material=this.materialEdges,t.setRenderTarget(this.edgesRT),this.clear&&t.clear(),this.fsQuad.render(t),this.fsQuad.material=this.materialWeights,t.setRenderTarget(this.weightsRT),this.clear&&t.clear(),this.fsQuad.render(t),this.uniformsBlend.tColor.value=l.texture,this.fsQuad.material=this.materialBlend,this.renderToScreen?(t.setRenderTarget(null),this.fsQuad.render(t)):(t.setRenderTarget(r),this.clear&&t.clear(),this.fsQuad.render(t))}setSize(t,r){this.edgesRT.setSize(t,r),this.weightsRT.setSize(t,r),this.materialEdges.uniforms.resolution.value.set(1/t,1/r),this.materialWeights.uniforms.resolution.value.set(1/t,1/r),this.materialBlend.uniforms.resolution.value.set(1/t,1/r)}getAreaTexture(){return"data:image/png;base64,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"}getSearchTexture(){return"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAAAhCAAAAABIXyLAAAAAOElEQVRIx2NgGAWjYBSMglEwEICREYRgFBZBqDCSLA2MGPUIVQETE9iNUAqLR5gIeoQKRgwXjwAAGn4AtaFeYLEAAAAASUVORK5CYII="}dispose(){this.edgesRT.dispose(),this.weightsRT.dispose(),this.areaTexture.dispose(),this.searchTexture.dispose(),this.materialEdges.dispose(),this.materialWeights.dispose(),this.materialBlend.dispose(),this.fsQuad.dispose()}};var Eo="varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }";function tn({THREE:e,renderer:t,scene:r,cam:l,cine:o=!0,low:c=!1}){let z=t.getPixelRatio(),x=t.getSize(new e.Vector2),y=Math.max(1,Math.floor(x.x*z)),m=Math.max(1,Math.floor(x.y*z)),L={enabled:!0,shutter:.6,maxLen:.035,minPx:.35,cutDist:400,cutAngle:.7,active:!1},b={enabled:!0,min:.55,max:1.35,ref:-2.4,strength:.5,rateToBright:2.4,rateToDark:.7,linear:1,lumMin:.03,lumMax:24},C={enabled:!1,amount:.65,clamp:.15,depthTol:.06,cutAngle:.5,active:!1},w={enabled:!1,radius:.03,intensity:1,bias:.12,maxPx:48,debug:!1,active:!1},n=new ba(t);class F extends Xt{constructor(){super(),this.needsSwap=!1,this.useRT=!1,this.jx=0,this.jy=0,this.rt=new e.WebGLRenderTarget(y,m,{type:e.HalfFloatType,depthTexture:new e.DepthTexture(y,m)})}render(h,D,te){let Z=h.autoClear;if(h.autoClear=!1,h.setRenderTarget(this.useRT?this.rt:te),h.clear(!0,!0,!0),this.jx||this.jy){let ge=l.projectionMatrix.elements,Je=ge[8],Te=ge[9],rt=this.rt;ge[8]+=2*this.jx/rt.width,ge[9]+=2*this.jy/rt.height;try{h.render(r,l)}finally{ge[8]=Je,ge[9]=Te}}else h.render(r,l);h.autoClear=Z}setSize(h,D){this.rt.setSize(h,D),this.rt.depthTexture.image.width=h,this.rt.depthTexture.image.height=D}}let N=new F;n.addPass(N);let j=`
    uniform float near; uniform float far;
    float viewZ(float d){ return (near*far)/((far-near)*d-far); } // perspective depth -> view z (negative)`,W="float ign(vec2 p){ return fract(52.9829189*fract(dot(p,vec2(0.06711056,0.00583715)))); }";class ne extends Xt{constructor(){super(),this.blur=!1,this.histOk=!1,this.histVP=new e.Matrix4,this.histRel=new e.Matrix4,this.invVP=new e.Matrix4,this.w=y,this.h=m,this.hist=null,this.tmp=null,this.aoA=null,this.aoB=null;let h=(D,te)=>new e.ShaderMaterial({uniforms:D,vertexShader:Eo,depthTest:!1,depthWrite:!1,fragmentShader:te});this.u={tColor:{value:null},tDepth:{value:null},invVP:{value:new e.Matrix4},prevVP:{value:new e.Matrix4},scale:{value:.5},maxLen:{value:.035},res:{value:new e.Vector2(y,m)}},this.mBlur=h(this.u,`
        uniform sampler2D tColor; uniform sampler2D tDepth; uniform mat4 invVP; uniform mat4 prevVP; uniform float scale; uniform float maxLen; uniform vec2 res; varying vec2 vUv;
        ${W}
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
          gl_FragColor=vec4(acc/n,1.); }`),this.mCopy=h({tColor:{value:null}},"uniform sampler2D tColor; varying vec2 vUv; void main(){ gl_FragColor=vec4(texture2D(tColor,vUv).rgb,1.); }"),this.uT={tColor:{value:null},tDepth:{value:null},tHist:{value:null},invVP:{value:null},histVP:{value:null},res:{value:new e.Vector2(y,m)},near:{value:1},far:{value:1e3},w:{value:.65},clampK:{value:.15},tol:{value:.06},valid:{value:0}},this.mTrail=h(this.uT,`
        uniform sampler2D tColor; uniform sampler2D tDepth; uniform sampler2D tHist; uniform mat4 invVP; uniform mat4 histVP; uniform vec2 res;
        uniform float w, clampK, tol, valid; varying vec2 vUv;
        ${j}
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
          gl_FragColor=vec4(mix(c,h,w*(1.-disocc)),zl); }`),this.uAO={tDepth:{value:null},res:{value:new e.Vector2(y,m)},near:{value:1},far:{value:1e3},pInv:{value:new e.Vector2(1,1)},projScale:{value:500},radius:{value:.02},intensity:{value:1},bias:{value:.12},maxPx:{value:48}},this.mAO=h(this.uAO,`
        uniform sampler2D tDepth; uniform vec2 res; uniform vec2 pInv; uniform float projScale, radius, intensity, bias, maxPx; varying vec2 vUv;
        ${j}
        ${W}
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
          gl_FragColor=vec4(clamp(1.-intensity*occ/3.,0.,1.),-P.z,0.,1.); }`),this.uAOB={tAO:{value:null},dir:{value:new e.Vector2(1,0)},hres:{value:new e.Vector2(y>>1,m>>1)}},this.mAOBlur=h(this.uAOB,`
        uniform sampler2D tAO; uniform vec2 dir; uniform vec2 hres; varying vec2 vUv;
        void main(){
          ivec2 p=ivec2(gl_FragCoord.xy), mx=ivec2(hres)-1; vec2 c=texelFetch(tAO,p,0).xy; float s=c.x, ws=1., k=1./(.03*c.y);
          for(int i=-4;i<=4;i++){ if(i==0) continue;
            vec2 t=texelFetch(tAO,clamp(p+ivec2(dir)*i,ivec2(0),mx),0).xy;
            float wt=exp(-float(i*i)*.125)*max(0.,1.-abs(t.y-c.y)*k); s+=t.x*wt; ws+=wt; }
          gl_FragColor=vec4(s/ws,c.y,0.,1.); }`),this.uAOC={tColor:{value:null},tDepth:{value:null},tAO:{value:null},hres:{value:new e.Vector2(y>>1,m>>1)},near:{value:1},far:{value:1e3},dbg:{value:0}},this.mAOComp=h(this.uAOC,`
        uniform sampler2D tColor; uniform sampler2D tDepth; uniform sampler2D tAO; uniform vec2 hres; uniform float dbg; varying vec2 vUv;
        ${j}
        void main(){
          vec4 c=texture2D(tColor,vUv); float d=texture2D(tDepth,vUv).x;
          if(d>=.999999){ gl_FragColor=vec4(c.rgb,1.); return; }
          float z=-viewZ(d), k=1./(.03*z);
          vec2 hp=vUv*hres-.5, f=fract(hp); ivec2 b=ivec2(floor(hp)), mx=ivec2(hres)-1;
          float s=0., ws=1e-4;                                    // joint bilateral upsample: bilinear weights x depth similarity
          for(int y=0;y<2;y++) for(int x=0;x<2;x++){
            vec2 t=texelFetch(tAO,clamp(b+ivec2(x,y),ivec2(0),mx),0).xy;
            float wt=(x==0?1.-f.x:f.x)*(y==0?1.-f.y:f.y)*max(1e-3,1.-abs(t.y-z)*k); s+=t.x*wt; ws+=wt; }
          gl_FragColor=vec4(dbg>.5 ? vec3(.6*s/ws) : c.rgb*(s/ws),1.); }`),this.fsQuad=new Zt(this.mCopy),this.taa=!1,this.direct=!1,this.outTex=null,this.mTaa=null}draw(h,D,te){this.fsQuad.material=D,h.setRenderTarget(te),this.fsQuad.render(h)}alloc(){let h=(Z,ge,Je)=>new e.WebGLRenderTarget(Z,ge,{type:e.HalfFloatType,depthBuffer:!1,minFilter:Je,magFilter:Je}),D=Math.max(1,this.w>>1),te=Math.max(1,this.h>>1);(C.enabled||this.taa)&&!this.hist&&(this.hist=[h(this.w,this.h,e.LinearFilter),h(this.w,this.h,e.LinearFilter)],this.histOk=!1),w.enabled&&!this.aoA&&(this.aoA=h(D,te,e.NearestFilter),this.aoB=h(D,te,e.NearestFilter)),w.enabled&&(C.enabled||this.taa||this.blur)&&!this.tmp&&(this.tmp=h(this.w,this.h,e.LinearFilter))}render(h,D){this.alloc();let te=N.rt.depthTexture,Z=N.rt.texture,ge=!1,Je=l.near,Te=l.far,rt=!C.enabled&&!this.taa&&!this.blur;if(this.outTex=D?D.texture:null,w.enabled){let We=l.projectionMatrix.elements;this.uAO.tDepth.value=te,this.uAO.near.value=Je,this.uAO.far.value=Te,this.uAO.pInv.value.set(1/We[0],1/We[5]),this.uAO.projScale.value=.5*this.h*We[5],this.uAO.radius.value=w.radius,this.uAO.intensity.value=w.intensity,this.uAO.bias.value=w.bias,this.uAO.maxPx.value=w.maxPx,this.draw(h,this.mAO,this.aoA),this.uAOB.tAO.value=this.aoA.texture,this.uAOB.dir.value.set(1,0),this.draw(h,this.mAOBlur,this.aoB),this.uAOB.tAO.value=this.aoB.texture,this.uAOB.dir.value.set(0,1),this.draw(h,this.mAOBlur,this.aoA);let Xe=this.uAOC;Xe.tColor.value=Z,Xe.tDepth.value=te,Xe.tAO.value=this.aoA.texture,Xe.near.value=Je,Xe.far.value=Te,Xe.dbg.value=w.debug?1:0,this.draw(h,this.mAOComp,rt?D:this.tmp),rt?ge=!0:Z=this.tmp.texture}if(C.enabled){let We=this.uT,Xe=this.hist[0],St=this.hist[1];We.tColor.value=Z,We.tDepth.value=te,We.tHist.value=Xe.texture,We.invVP.value=this.invVP,We.histVP.value=this.histRel,We.near.value=Je,We.far.value=Te,We.valid.value=this.histOk?1:0,We.w.value=Math.pow(e.MathUtils.clamp(C.amount,0,.98),e.MathUtils.clamp(Ce*60,.25,4)),We.clampK.value=C.clamp,We.tol.value=C.depthTol,this.draw(h,this.mTrail,St),this.hist[0]=St,this.hist[1]=Xe,this.histVP.copy(de),this.histOk=!0,Z=St.texture}else if(this.taa){let We=this.mTaa.uniforms,Xe=this.hist[0],St=this.hist[1];We.tColor.value=Z,We.tDepth.value=te,We.tHist.value=Xe.texture,We.invVP.value=this.invVP,We.histVP.value=this.histRel,We.valid.value=this.histOk?1:0,this.draw(h,this.mTaa,St),this.hist[0]=St,this.hist[1]=Xe,this.histVP.copy(de),this.histOk=!0,Z=St.texture}this.blur?(this.u.tColor.value=Z,this.u.tDepth.value=te,this.draw(h,this.mBlur,D)):!ge&&this.direct?this.outTex=Z:ge||(this.mCopy.uniforms.tColor.value=Z,this.draw(h,this.mCopy,D))}setSize(h,D){this.w=h,this.h=D,this.u.res.value.set(h,D),this.uT.res.value.set(h,D),this.uAO.res.value.set(h,D);let te=Math.max(1,h>>1),Z=Math.max(1,D>>1);this.uAOB.hres.value.set(te,Z),this.uAOC.hres.value.set(te,Z);for(let ge of[this.tmp,...this.hist||[]])ge&&ge.setSize(h,D);for(let ge of[this.aoA,this.aoB])ge&&ge.setSize(te,Z);this.mTaa&&this.mTaa.uniforms.res.value.set(h,D),this.histOk=!1}dispose(){for(let h of[this.tmp,this.aoA,this.aoB,...this.hist||[]])h&&h.dispose();this.hist=this.tmp=this.aoA=this.aoB=null}}let ee=new ne;ee.enabled=!1,n.addPass(ee);let J=new wa(r,l,{focus:30,aperture:1e-4,maxblur:.002});J.materialBokeh.defines.DEPTH_PACKING=0,J.materialBokeh.needsUpdate=!0,J.renderTargetDepth.dispose(),J.render=function(P,h,D){let te=this.uniforms;te.tColor.value=ee.enabled?D.texture:N.rt.texture,te.tDepth.value=N.rt.depthTexture,te.nearClip.value=l.near,te.farClip.value=l.far,P.setRenderTarget(this.renderToScreen?null:h),this.fsQuad.render(P)},J.setSize=function(P,h){this.uniforms.aspect.value=P/h},n.addPass(J);let we=o?{strength:.6,radius:.5,threshold:.72,separableBlurMaterials:[]}:new Fo(new e.Vector2(y,m),.8,.5,.72);o||n.addPass(we);class se extends Xt{constructor(){super();let h=(D,te)=>new e.WebGLRenderTarget(D,D,{type:te,depthBuffer:!1,magFilter:e.NearestFilter,minFilter:e.NearestFilter});this.t64=h(64,e.HalfFloatType),this.t8=h(8,e.HalfFloatType),this.t1=h(1,e.HalfFloatType),this.sA=h(1,e.FloatType),this.sB=h(1,e.FloatType),this.first=!0,this.snap=!0,this.mDown=new e.ShaderMaterial({uniforms:{tSrc:{value:null},lumMax:{value:24},lumMin:{value:.03}},vertexShader:Eo,depthTest:!1,fragmentShader:`
        uniform sampler2D tSrc; uniform float lumMax; uniform float lumMin; varying vec2 vUv;
        void main(){ vec2 base=floor(gl_FragCoord.xy)/64.; vec3 acc=vec3(0.);
          for(int y=0;y<4;y++) for(int x=0;x<4;x++){
            vec2 uv=base+(vec2(float(x),float(y))+.5)/256.;
            vec3 c=texture2D(tSrc,uv).rgb; float l=clamp(dot(c,vec3(.2126,.7152,.0722)),lumMin,lumMax);
            float k=length(uv-.5)*2.; float wt=mix(1.,.35,smoothstep(.2,1.1,k)); // centre-weighted metering
            acc+=vec3(log(l)*wt,wt,l*l*wt); }
          gl_FragColor=vec4(acc/16.,1.); }`}),this.mReduce=new e.ShaderMaterial({uniforms:{tSrc:{value:null}},vertexShader:Eo,depthTest:!1,fragmentShader:`
        uniform sampler2D tSrc; varying vec2 vUv;
        void main(){ ivec2 b=ivec2(gl_FragCoord.xy)*8; vec3 acc=vec3(0.);
          for(int y=0;y<8;y++) for(int x=0;x<8;x++) acc+=texelFetch(tSrc,b+ivec2(x,y),0).rgb;
          gl_FragColor=vec4(acc/64.,1.); }`}),this.mAdapt=new e.ShaderMaterial({uniforms:{tAvg:{value:null},tPrev:{value:null},dt:{value:.016},base:{value:1.05},ref:{value:-3.2},strength:{value:.5},eMin:{value:.55},eMax:{value:1.35},up:{value:2.4},down:{value:.7},snap:{value:1},on:{value:1},lin:{value:1}},vertexShader:Eo,depthTest:!1,fragmentShader:`
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
        }`}),this.fsQuad=new Zt(this.mDown),this.dt=1/60,this._cs=null,this._tm=null}pass(h,D,te){this.fsQuad.material=D,h.setRenderTarget(te),this.fsQuad.render(h)}render(h,D,te){if(this._cs!==h.outputColorSpace||this._tm!==h.toneMapping){this._cs=h.outputColorSpace,this._tm=h.toneMapping;let Je={};e.ColorManagement.getTransfer(this._cs)===e.SRGBTransfer&&(Je.SRGB_TRANSFER="");let Te={[e.LinearToneMapping]:"LINEAR_TONE_MAPPING",[e.ReinhardToneMapping]:"REINHARD_TONE_MAPPING",[e.CineonToneMapping]:"CINEON_TONE_MAPPING",[e.ACESFilmicToneMapping]:"ACES_FILMIC_TONE_MAPPING",[e.AgXToneMapping]:"AGX_TONE_MAPPING"}[this._tm];Te&&(Je[Te]=""),this.mTone.defines=Je,this.mTone.needsUpdate=!0}b.enabled&&(this.mDown.uniforms.tSrc.value=te.texture,this.mDown.uniforms.lumMax.value=b.lumMax,this.mDown.uniforms.lumMin.value=b.lumMin,this.pass(h,this.mDown,this.t64),this.mReduce.uniforms.tSrc.value=this.t64.texture,this.pass(h,this.mReduce,this.t8),this.mReduce.uniforms.tSrc.value=this.t8.texture,this.pass(h,this.mReduce,this.t1));let Z=this.mAdapt.uniforms;Z.tAvg.value=this.t1.texture,Z.tPrev.value=this.sA.texture,Z.dt.value=Math.min(this.dt,.1),Z.base.value=h.toneMappingExposure,Z.ref.value=b.ref,Z.strength.value=b.strength,Z.eMin.value=b.min,Z.eMax.value=b.max,Z.up.value=b.rateToBright,Z.down.value=b.rateToDark,Z.lin.value=b.linear,Z.snap.value=this.snap?1:0,Z.on.value=b.enabled?1:0,this.snap=!1,this.pass(h,this.mAdapt,this.sB);let ge=this.sA;this.sA=this.sB,this.sB=ge,this.mTone.uniforms.tDiffuse.value=te.texture,this.mTone.uniforms.tExp.value=this.sA.texture,this.pass(h,this.mTone,this.renderToScreen?null:D)}}let Le=new se;n.addPass(Le);let be=new Sa(y,m);n.addPass(be);let ye=new Bo({uniforms:{tDiffuse:{value:null},ca:{value:.012},time:{value:0},grain:{value:.045},res:{value:new e.Vector2(y,m)}},vertexShader:"varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }",fragmentShader:`uniform sampler2D tDiffuse; uniform float ca; uniform float time; uniform float grain; uniform vec2 res; varying vec2 vUv;
    void main(){
      vec2 c=vUv-.5; float r2=dot(c,c);
      vec2 uv=.5+c*(1.-0.035*r2);              // barrel, pulls the corners in a touch
      vec2 o=c*r2*ca;                           // fringing grows toward the edges, zero at center
      vec3 col=vec3(texture2D(tDiffuse,uv+o).r, texture2D(tDiffuse,uv).g, texture2D(tDiffuse,uv-o).b);
      col*=mix(1.,smoothstep(0.75,0.12,r2*1.6),0.55); // vignette
      float n=fract(sin(dot(floor(vUv*res)+fract(time*7.31)*91.7,vec2(12.9898,78.233)))*43758.5453);
      col+=(n-.5)*grain*(1.-dot(col,vec3(.33))*0.6); // grain sits mostly in the shadows, like film
      gl_FragColor=vec4(col,1.); }`});o||n.addPass(ye);let k=o?ys({THREE:e,renderer:t,cam:l,composer:n,scenePass:N,mbPass:ee,dof:J,tonePass:Le,smaa:be,bloom:we,FS_VERT:Eo,low:c}):null,de=new e.Matrix4,G=new e.Matrix4,R=new e.Matrix4,Ae=new e.Matrix4,he=new e.Matrix4,pe=new e.Vector3,le=new e.Vector3,U=new e.Quaternion,ie=!1,Ce=1/60,ke=!1,$e=y;function Qe(P,h){t.setSize(P,h),l.aspect=P/h,l.updateProjectionMatrix();let D=t.getPixelRatio();$e=Math.max(1,Math.floor(P*D)),n.setSize(P,h),ye.uniforms.res.value.set(P,h),ke=!0,k&&k.setSize()}function ae({dt:P=1/60,t:h=0,ca:D,focus:te,aperture:Z,maxblur:ge}={}){Ce=Math.max(P,1e-4),Le.dt=Ce,te!==void 0&&(J.uniforms.focus.value=te),Z!==void 0&&(J.uniforms.aperture.value=Z),ge!==void 0&&(J.uniforms.maxblur.value=ge),D!==void 0&&(ye.uniforms.ca.value=D),ye.uniforms.time.value=h,k&&(k.time=h);let Je=!!k&&k.taaOn()&&!C.enabled;l.updateMatrixWorld(),de.multiplyMatrices(l.projectionMatrix,l.matrixWorldInverse),pe.setFromMatrixPosition(l.matrixWorld),Ae.makeTranslation(pe.x,pe.y,pe.z),R.copy(de).invert().premultiply(he.makeTranslation(-pe.x,-pe.y,-pe.z));let Te=!1,rt=ie?l.position.distanceTo(le):0,We=ie?U.angleTo(l.quaternion):0;if(ie&&!ke&&L.enabled){let bt=Math.min(Math.max(te===void 0?J.uniforms.focus.value:te,3),60),Ie=l.fov*Math.PI/180,E=(We+rt/bt)/Ie*m,Be=e.MathUtils.clamp(L.shutter*(1/60)/Ce,.15,2);if(rt<L.cutDist&&We<L.cutAngle&&E*Be>L.minPx){Te=!0;let Ue=ee.u;Ue.prevVP.value.multiplyMatrices(G,Ae),Ue.invVP.value.copy(R),Ue.scale.value=Be,Ue.maxLen.value=L.maxLen}}let Xe=C.enabled||Je;(!Xe||!ie||ke||rt>=L.cutDist||We>=Math.min(L.cutAngle,C.cutAngle))&&(ee.histOk=!1),Xe?(ee.invVP.copy(R),ee.histRel.multiplyMatrices(ee.histVP,Ae)):ee.hist&&(ee.hist.forEach(bt=>bt.dispose()),ee.hist=null),!w.enabled&&ee.aoA&&(ee.aoA.dispose(),ee.aoB.dispose(),ee.aoA=ee.aoB=null),!w.enabled&&ee.tmp&&(ee.tmp.dispose(),ee.tmp=null),ee.blur=Te,ee.taa=Je;let St=Te||C.enabled||w.enabled||Je;L.active=Te,C.active=C.enabled,w.active=w.enabled;let jt=.4*J.uniforms.maxblur.value*$e>=.5;ee.enabled=St,J.enabled=jt,N.useRT=St||jt||!!k,k&&k.jitter(Je),G.copy(de),le.copy(l.position),U.copy(l.quaternion),ie=!0,ke=!1}function Ke(){k?k.render():n.render(Ce)}function De({fx:P=!0}={}){if(k){let D=[N.enabled,ee.enabled,ee.blur,ee.taa,J.enabled,C.enabled,w.enabled];try{N.enabled=!1,ee.enabled=!0,J.enabled=!0,C.enabled=!1,w.enabled=P,ee.blur=!0,ee.taa=!0,k.render(!0,0),ee.blur=!1,ee.taa=!1,w.enabled=!1,C.enabled=P,k.render(!0,1)}finally{[N.enabled,ee.enabled,ee.blur,ee.taa,J.enabled,C.enabled,w.enabled]=D,ee.histOk=!1,Le.snap=!0,ke=!0}return}let h=[N.enabled,N.useRT,ee.enabled,ee.blur,J.enabled,C.enabled,w.enabled];try{N.enabled=!1,N.useRT=!0,ee.enabled=!0,J.enabled=!0,ee.blur=!0,C.enabled=w.enabled=P,n.render(1/60),ee.blur=!1,C.enabled=w.enabled=!1,n.render(1/60)}finally{[N.enabled,N.useRT,ee.enabled,ee.blur,J.enabled,C.enabled,w.enabled]=h,ee.histOk=!1,Le.snap=!0,ke=!0}}let qe=new Float32Array(4);function ze(){return t.readRenderTargetPixels(Le.sA,0,0,1,1,qe),{exposure:qe[0],lnLum:qe[1]}}return{composer:n,dof:J,lens:ye,bloom:we,smaa:be,setSize:Qe,update:ae,render:Ke,warm:De,motion:L,auto:b,trails:C,ao:w,resetMotion(){ke=!0},snapExposure(){Le.snap=!0},getExposure:ze,cine:!!k,fx:k?k.fx:null,look:k?k.look:null,grade:k?k.grade:null,lensFrame:k?P=>k.lensFrame(P):()=>{},scrim:k?(P,h,D,te,Z)=>k.scrim(P,h,D,te,Z):()=>{},edge:k?(P,h,D,te)=>k.edge(P,h,D,te):()=>{},setQuality:k?P=>k.setQuality(P):()=>{},setPostQuality:k?P=>k.setQuality(P):()=>{},getQuality:()=>k?k.level:-1,gpuTimes:k?()=>k.gpuTimes():()=>null}}var en=`
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
`,bs=new Set;function ys({THREE:e,renderer:t,cam:r,composer:l,scenePass:o,mbPass:c,dof:z,tonePass:x,smaa:y,bloom:m,FS_VERT:L,low:b=!1}){let C=e.HalfFloatType,w=e.LinearFilter,n=()=>new e.WebGLRenderTarget(1,1,{type:C,depthBuffer:!1,minFilter:w,magFilter:w,generateMipmaps:!1}),F=new Zt(null),N=(E,Be)=>new e.ShaderMaterial({uniforms:Be,vertexShader:L,fragmentShader:E,depthTest:!1,depthWrite:!1}),j=(E,Be)=>{F.material=E,t.setRenderTarget(Be),F.render(t)},W={flash:0,heat:0,heatAt:null,dirt:0,streak:1,streakAdd:0,bloom:0},ne={bloom:.5,threshold:1,knee:.6,streakThr:6,streak:0,streakTint:new e.Color(.86,.92,1),vignette:.3,grain:.04,taaStill:.9,taaMove:.7},ee={expK:1,wr:1,wg:1,wb:1,contrast:1,saturation:1,lift:0,gamma:1,gain:1},J=[{aa:0,div:2,lv:3,streak:!1},{aa:1,div:2,lv:4,streak:!0},{aa:2,div:1,lv:5,streak:!0},{aa:3,div:1,lv:5,streak:!0}],we=[.46,.3,.15,.06,.03],se=-1,Le=J[3],be=!1,ye=0,k=n(),de=[],G=[],R=[n(),n()];for(let E=0;E<5;E++)de.push(n()),G.push(n());let Ae=N(`
    uniform sampler2D tSrc; uniform vec2 uTexel; uniform float uThr, uKnee; varying vec2 vUv;
    vec3 tap(vec2 o){ vec3 c=texture2D(tSrc,vUv+o*uTexel).rgb; return any(isnan(c)) ? vec3(0.) : min(c,vec3(6e4)); }
    float lum(vec3 c){ return dot(c,vec3(.2126,.7152,.0722)); }
    void main(){
      vec3 a=tap(vec2(-1,-1)), b=tap(vec2(1,-1)), c=tap(vec2(-1,1)), e=tap(vec2(1,1));
      float wa=1./(1.+lum(a)), wb=1./(1.+lum(b)), wc=1./(1.+lum(c)), we=1./(1.+lum(e));   // Karis average: no fireflies
      vec3 m=(a*wa+b*wb+c*wc+e*we)/(wa+wb+wc+we);
      float l=lum(m), s=clamp(l-uThr+uKnee,0.,2.*uKnee); s=s*s/(4.*uKnee+1e-5);
      gl_FragColor=vec4(m*max(s,l-uThr)/max(l,1e-4),1.); }`,{tSrc:{value:null},uTexel:{value:new e.Vector2},uThr:{value:1},uKnee:{value:.6}}),he=N(`
    uniform sampler2D tSrc; uniform vec2 uDir; varying vec2 vUv;
    void main(){
      vec3 c=texture2D(tSrc,vUv).rgb*.227027;
      c+=(texture2D(tSrc,vUv+uDir*1.3846154).rgb+texture2D(tSrc,vUv-uDir*1.3846154).rgb)*.3162162;
      c+=(texture2D(tSrc,vUv+uDir*3.2307692).rgb+texture2D(tSrc,vUv-uDir*3.2307692).rgb)*.0702703;
      gl_FragColor=vec4(c,1.); }`,{tSrc:{value:null},uDir:{value:new e.Vector2}}),pe=N(`
    uniform sampler2D tSrc; uniform vec2 uTexel; uniform float uThr; varying vec2 vUv;
    void main(){
      vec3 c=(texture2D(tSrc,vUv+vec2(-.5,-1.)*uTexel).rgb+texture2D(tSrc,vUv+vec2(.5,-1.)*uTexel).rgb
             +texture2D(tSrc,vUv+vec2(-.5,1.)*uTexel).rgb+texture2D(tSrc,vUv+vec2(.5,1.)*uTexel).rgb)*.25;
      float l=dot(c,vec3(.2126,.7152,.0722));
      gl_FragColor=vec4(c*max(l-uThr,0.)/max(l,1e-4),1.); }`,{tSrc:{value:null},uTexel:{value:new e.Vector2},uThr:{value:6}}),le=N(`
    uniform sampler2D tSrc; uniform float uStep; uniform float uTx; varying vec2 vUv;
    void main(){ vec3 c=texture2D(tSrc,vUv).rgb; float ws=1.;
      for(int i=1;i<=6;i++){ float w=exp(-float(i)*.42); vec2 o=vec2(float(i)*uStep*uTx,0.);
        c+=(texture2D(tSrc,vUv+o).rgb+texture2D(tSrc,vUv-o).rgb)*w; ws+=2.*w; }
      gl_FragColor=vec4(c/ws,1.); }`,{tSrc:{value:null},uStep:{value:1},uTx:{value:1}});c.mTaa=N(`
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
      gl_FragColor=vec4(max((c*wc+h*wh)/(wc+wh),vec3(0.)),1.); }`,{tColor:{value:null},tDepth:{value:null},tHist:{value:null},invVP:{value:null},histVP:{value:null},res:{value:new e.Vector2(1,1)},valid:{value:0},wStill:{value:.9},wMove:{value:.7}}),c.direct=!0;let U=ws(e),ie={tDiffuse:{value:null},tExp:{value:null},tB0:{value:G[0].texture},tB1:{value:G[1].texture},tB2:{value:G[2].texture},tB3:{value:G[3].texture},tB4:{value:G[4].texture},tS:{value:R[1].texture},tDirt:{value:U},uBw:{value:new e.Vector4},uBw4:{value:0},uBloom:{value:.3},uStreak:{value:0},uSTint:{value:ne.streakTint},uFlash:{value:0},uDirt:{value:0},uDial:{value:0},uExpK:{value:1},uWB:{value:new e.Vector3(1,1,1)},uCon:{value:1},uSat:{value:1},uLift:{value:0},uGam:{value:1},uGain:{value:1}};x.mTone=N(`
    uniform sampler2D tDiffuse, tExp, tB0, tB1, tB2, tB3, tB4, tS, tDirt; uniform vec4 uBw; uniform float uBw4, uBloom, uStreak, uFlash, uDirt; uniform vec3 uSTint;
    uniform float uDial, uExpK, uCon, uSat, uLift, uGam, uGain; uniform vec3 uWB;
    varying vec2 vUv;
    ${en}
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
      gl_FragColor=vec4(o,1.); }`,ie);let Ce={tDiffuse:{value:null},res:{value:new e.Vector2(1,1)},time:{value:0},grain:{value:ne.grain},vig:{value:ne.vignette},heat:{value:0},heatAt:{value:new e.Vector2(.5,.5)},heatLocal:{value:0},fxaa:{value:0},scrim:{value:new e.Vector4(.5,.5,1,1)},scrimK:{value:0},edgeC:{value:new e.Vector3},edgeK:{value:0},edgeH:{value:.3},edgeG:{value:0}},ke=N(`
    uniform sampler2D tDiffuse; uniform vec2 res, heatAt; uniform vec4 scrim; uniform vec3 edgeC; uniform float time, grain, vig, heat, heatLocal, fxaa, scrimK, edgeK, edgeH, edgeG; varying vec2 vUv;
    ${en}
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
      gl_FragColor=vec4(col,1.); }`,Ce),$e=1,Qe=1,ae=1,Ke=1;function De(){$e=l.renderTarget1.width,Qe=l.renderTarget1.height,Ce.res.value.set($e,Qe),ae=Math.max(1,$e>>Le.div),Ke=Math.max(1,Qe>>Le.div),k.setSize(ae,Ke),Ae.uniforms.uTexel.value.set(.5*(1<<Le.div)/$e,.5*(1<<Le.div)/Qe);let E=ae,Be=Ke;for(let _e=0;_e<5;_e++){let Dt=Math.max(1,_e?E>>1:E),kt=Math.max(1,_e?Be>>1:Be);de[_e].setSize(Dt,kt),G[_e].setSize(Dt,kt),E=Dt,Be=kt}let Ue=Math.max(1,ae>>1),He=Math.max(1,Ke>>2);R[0].setSize(Ue,He),R[1].setSize(Ue,He),pe.uniforms.uTexel.value.set(1/ae,1/Ke);let nt=0;for(let _e=0;_e<Le.lv;_e++)nt+=we[_e];let vt=_e=>_e<Le.lv?we[_e]/nt:0;ie.uBw.value.set(vt(0),vt(1),vt(2),vt(3)),ie.uBw4.value=vt(4),c.histOk=!1}function qe(E){be=!0,E=Math.max(0,Math.min(3,Math.round(+E||0))),E!==se&&(se=E,Le=J[E],Ie.level=E,De(),Le.aa!==3&&c.hist&&(c.hist.forEach(Be=>Be.dispose()),c.hist=null,c.histOk=!1))}let ze=t.getContext(),P=ze.getExtension&&ze.getExtension("EXT_disjoint_timer_query_webgl2"),h={},D=[],te=!1,Z=E=>{if(!te||!P)return null;let Be=ze.createQuery();return ze.beginQuery(P.TIME_ELAPSED_EXT,Be),[E,Be]},ge=E=>{E&&(ze.endQuery(P.TIME_ELAPSED_EXT),D.push(E))};function Je(){if(!P||!D.length)return;let E=ze.getParameter(P.GPU_DISJOINT_EXT);for(let Be=D.length-1;Be>=0;Be--){let[Ue,He]=D[Be];if(ze.getQueryParameter(He,ze.QUERY_RESULT_AVAILABLE)){if(!E){let nt=ze.getQueryParameter(He,ze.QUERY_RESULT)/1e6;h[Ue]=h[Ue]==null?nt:h[Ue]*.9+nt*.1}ze.deleteQuery(He),D.splice(Be,1)}}}let Te=()=>l.renderTarget1,rt=()=>l.renderTarget2,We=E=>E===Te().texture?rt():Te(),Xe={texture:null},St=(E,Be)=>{let Ue=1,He=0;for(;E>0;)Ue/=Be,He+=Ue*(E%Be),E=Math.floor(E/Be);return He};function jt(E){if(!E){o.jx=o.jy=0;return}let Be=ye%8+1;o.jx=St(Be,2)-.5,o.jy=St(Be,3)-.5}function bt(E=!1,Be=0){se<0&&(qe(b?1:3),be=!1),ye++,Je();let Ue=t,He=E?Be?{aa:1,lv:5,streak:!0}:{aa:2,lv:5,streak:!0}:Le,nt=Z("scene");o.enabled&&(o.useRT=!0,o.render(Ue)),ge(nt);let vt=o.rt.texture;if(nt=Z("hdrfx"),c.enabled){let Ye=c.mTaa.uniforms;Ye.wStill.value=ne.taaStill,Ye.wMove.value=ne.taaMove,c.render(Ue,Te()),vt=c.outTex||Te().texture}if(ge(nt),nt=Z("dof"),z.enabled){let Ye=z.uniforms,Pt=We(vt);Ye.tColor.value=vt,Ye.tDepth.value=o.rt.depthTexture,Ye.nearClip.value=r.near,Ye.farClip.value=r.far,Ue.setRenderTarget(Pt),z.fsQuad.render(Ue),vt=Pt.texture}ge(nt),nt=Z("bloom"),Ae.uniforms.tSrc.value=vt,Ae.uniforms.uThr.value=ne.threshold,Ae.uniforms.uKnee.value=ne.knee,j(Ae,k);for(let Ye=0;Ye<He.lv;Ye++){let Pt=de[Ye].width,ft=de[Ye].height;he.uniforms.tSrc.value=Ye?G[Ye-1].texture:k.texture,he.uniforms.uDir.value.set(1/Pt,0),j(he,de[Ye]),he.uniforms.tSrc.value=de[Ye].texture,he.uniforms.uDir.value.set(0,1/ft),j(he,G[Ye])}let _e=ne.streak+W.streakAdd,Dt=He.streak&&(E||W.streak>0&&_e>0);if(Dt){pe.uniforms.tSrc.value=k.texture,pe.uniforms.uThr.value=Math.max(0,ne.streakThr-ne.threshold),j(pe,R[1]);let Ye=1/R[0].width;le.uniforms.uTx.value=Ye,le.uniforms.tSrc.value=R[1].texture,le.uniforms.uStep.value=1,j(le,R[0]),le.uniforms.tSrc.value=R[0].texture,le.uniforms.uStep.value=4,j(le,R[1]),le.uniforms.tSrc.value=R[1].texture,le.uniforms.uStep.value=16,j(le,R[0]),ie.tS.value=R[0].texture}ge(nt),nt=Z("tone");let kt=m.strength;ie.uBloom.value=ne.bloom*kt*(1+W.bloom),ie.uStreak.value=Dt?_e*W.streak:0,ie.uFlash.value=E?.5:Math.min(1,Math.max(0,W.flash)),ie.uDirt.value=E?1:Math.max(0,W.dirt);let tt=ee,Nt=tt.expK!==1||tt.wr!==1||tt.wg!==1||tt.wb!==1||tt.contrast!==1||tt.saturation!==1||tt.lift!==0||tt.gamma!==1||tt.gain!==1;ie.uDial.value=Nt?1:0,Nt&&(ie.uExpK.value=tt.expK,ie.uWB.value.set(tt.wr,tt.wg,tt.wb),ie.uCon.value=tt.contrast,ie.uSat.value=tt.saturation,ie.uLift.value=tt.lift,ie.uGam.value=1/Math.max(.05,tt.gamma),ie.uGain.value=tt.gain);let Bt=We(vt);if(Xe.texture=vt,x.render(Ue,Bt,Xe),vt=Bt.texture,ge(nt),nt=Z("aa"),He.aa===2){let Ye=We(vt);y.renderToScreen=!1,y.render(Ue,Ye,Bt),vt=Ye.texture}ge(nt),nt=Z("lens"),Ce.tDiffuse.value=vt,Ce.time.value=Ie.time,Ce.fxaa.value=He.aa===1?1:0,Ce.grain.value=ne.grain,Ce.vig.value=ne.vignette;let Wt=E?.5:Math.max(0,W.heat);Ce.heat.value=Wt,W.heatAt?(Ce.heatAt.value.set(W.heatAt[0],W.heatAt[1]),Ce.heatLocal.value=1):Ce.heatLocal.value=0,j(ke,null),ge(nt)}let Ie={fx:W,look:ne,grade:ee,level:se,time:0,taaOn:()=>se<0?!b:Le.aa===3,jitter:jt,render:bt,setSize:De,setQuality:qe,profile(E=!0){return te=!!E&&!!P,te},scrim(E,Be,Ue,He,nt){Ce.scrim.value.set(E,Be,Math.max(.001,Ue),Math.max(.001,He)),Ce.scrimK.value=Math.max(0,nt)},edge(E,Be,Ue,He){Ce.edgeK.value=Math.max(0,Math.min(1,E)),Ce.edgeC.value.set(Be[0],Be[1],Be[2]),Ce.edgeH.value=Math.max(.05,Ue),Ce.edgeG.value=Math.max(0,He)},lensFrame({entry:E=-1,gR:Be=-1,plume:Ue=null}={}){let He=(Ye,Pt,ft)=>{let s=Math.min(1,Math.max(0,(ft-Ye)/(Pt-Ye)));return s*s*(3-2*s)},nt=(Ye,Pt,ft)=>Math.exp(-(((Ye-Pt)/ft)**2)),vt=E>0&&E<1?1:0,_e=E,Dt=vt*.9*He(.05,.22,_e)*(1-He(.42,.62,_e)),kt=vt*.85*nt(_e,.3,.045),tt=vt*.7*He(.16,.3,_e)*(1-He(.3,.52,_e)),Nt=vt*.6*He(.1,.3,_e)*(1-He(.3,.55,_e)),Bt=Be>=.78?He(.79,.83,Be):0,Wt=Be>=.78?.25*nt(Be,.835,.012):0;W.heat=Math.max(Dt,Ue?.55*Bt:0),W.heatAt=Dt>=.55*Bt||!Ue?null:[Ue[0],Ue[1]],W.flash=Math.max(kt,Wt),W.dirt=Math.max(tt,.45*Bt),W.bloom=Math.max(Nt,.25*Bt),W.streak=1+.3*Bt,W.streakAdd=.3*Bt},gpuTimes(){te=!!P;let E={},Be=0;for(let Ue in h)E[Ue]=+h[Ue].toFixed(3),Be+=h[Ue];return E.total=+Be.toFixed(3),E.supported=!!P,E}};return De(),bs.add(Ie),Ie}function ws(e){if(typeof document>"u")return null;let t=document.createElement("canvas");t.width=512,t.height=288;let r=t.getContext("2d"),l=7,o=()=>(l=l*16807%2147483647)/2147483647;r.fillStyle="#000",r.fillRect(0,0,512,288),r.globalCompositeOperation="lighter";for(let z=0;z<90;z++){let x=o()*512,y=o()*288,m=3+o()*o()*46,L=.03+o()*.09,b=r.createRadialGradient(x,y,0,x,y,m);b.addColorStop(0,`rgba(255,238,214,${L})`),b.addColorStop(.6,`rgba(255,232,206,${L*.45})`),b.addColorStop(1,"rgba(0,0,0,0)"),r.fillStyle=b,r.beginPath(),r.arc(x,y,m,0,6.2832),r.fill()}r.lineWidth=2;for(let z=0;z<7;z++){let x=o()*512,y=o()*288,m=14+o()*30,L=.05+o()*.05;r.strokeStyle=`rgba(255,236,220,${L})`,r.beginPath();for(let b=0;b<=6;b++){let C=b/6*6.2832+.3;r[b?"lineTo":"moveTo"](x+m*Math.cos(C),y+m*Math.sin(C))}r.stroke()}let c=new e.CanvasTexture(t);return c.colorSpace=e.NoColorSpace,c}var Co=7e3,Ms=[-1,.22,-.55];function $o(e,t,r){let l=e*Math.PI/180,o=t*Math.PI/180;return new r(Math.cos(o)*Math.cos(l),Math.sin(o),-Math.cos(o)*Math.sin(l))}function Ss(e,t,r){let l=e.Vector3,o=$o(266.40499,-28.93617,l),c=$o(192.85948,27.12825,l),z=new l().crossVectors(c,o),x=t.clone().normalize(),y=r.clone().sub(x.clone().multiplyScalar(r.dot(x))).normalize(),m=new l().crossVectors(y,x),L=new e.Matrix4().makeBasis(o,z,c),C=new e.Matrix4().makeBasis(x,m,y).multiply(L.transpose());return new e.Quaternion().setFromRotationMatrix(C)}function As(e){let t=e.Vector3,r=new t(...Ms).normalize(),l=new t(0,1,0).addScaledVector(r,-r.y).normalize(),o=new t().crossVectors(r,l).normalize(),c=30*Math.PI/180,z=72*Math.PI/180,x=o.clone().multiplyScalar(Math.cos(c)).addScaledVector(l,Math.sin(c)),y=new t().crossVectors(r,x).normalize(),m=r.clone().multiplyScalar(Math.cos(z)).addScaledVector(x,Math.sin(z));return Ss(e,m,y)}var Cs=`
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
}`,Ds=`
uniform float uGain; varying vec3 vCol; varying float vI;
void main(){
  float d = length(gl_PointCoord - 0.5) * 2.;
  float core = 1. - smoothstep(0., 1., d);     // round falloff (same curve as before, written with ordered edges)
  float a = core * core;
  if (a < 0.003) discard;
  gl_FragColor = vec4(vCol * vI * a * uGain, 1.);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`,zs="varying vec3 vDir; void main(){ vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }",Ps=`
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
}`,Ls=Cs.replace("gl_PointSize = s * uPx;","float ps = s * uPx, pw = max(ps, 2.2); vI *= (ps * ps) / (pw * pw) * 1.25; gl_PointSize = pw;"),ks=Ds.replace(`float core = 1. - smoothstep(0., 1., d);     // round falloff (same curve as before, written with ordered edges)
  float a = core * core;`,"float a = exp(-d * d * 4.5);"),Os=`
attribute float aI; uniform float uPx; varying float vI;
void main(){ vI = aI; gl_PointSize = 2.0 * uPx; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,Bs=`
varying float vI;
void main(){ float d = length(gl_PointCoord - 0.5) * 2.; float a = exp(-d * d * 3.); if (a < 0.01) discard;
  gl_FragColor = vec4(vec3(1., 0.93, 0.86) * vI * a, 1.);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;async function on({THREE:e,scene:t,starsUrl:r,milkyUrl:l,rotation:o=null,milkyWay:c=!0,milkyWayIntensity:z=.3,starGain:x=1,pixelRatio:y=null}={}){z*=1.7;let L=e.Vector3,b=new e.Group;b.name="sky",b.frustumCulled=!1,o&&o.isQuaternion?b.quaternion.copy(o):o&&o.isEuler?b.setRotationFromEuler(o):Array.isArray(o)?b.rotation.set(o[0],o[1],o[2]):b.quaternion.copy(As(e));let C=await(await fetch(r)).arrayBuffer(),w=new Float32Array(C),n=w.length/5,F=new Float32Array(n*3),N=new Float32Array(n),j=new Float32Array(n);for(let se=0;se<n;se++)F[se*3]=w[se*5]*Co,F[se*3+1]=w[se*5+1]*Co,F[se*3+2]=w[se*5+2]*Co,N[se]=w[se*5+3],j[se]=w[se*5+4];let W=new e.BufferGeometry;W.setAttribute("position",new e.BufferAttribute(F,3)),W.setAttribute("aMag",new e.BufferAttribute(N,1)),W.setAttribute("aBV",new e.BufferAttribute(j,1));let ne=new e.ShaderMaterial({vertexShader:Ls,fragmentShader:ks,uniforms:{uPx:{value:y||Math.min(window.devicePixelRatio||1,2)},uGain:{value:x}},transparent:!0,blending:e.AdditiveBlending,depthWrite:!1,depthTest:!0,fog:!1}),ee=new e.Points(W,ne);ee.frustumCulled=!1,ee.renderOrder=-9,ee.name="sky-stars",b.add(ee);{let se=$o(192.85948,27.12825,L),Le=26e3,be=new Float32Array(Le*3),ye=new Float32Array(Le),k=new L,de=99,G=()=>(de=de*16807%2147483647)/2147483647;for(let he=0,pe=0;he<Le;pe++){k.set(G()*2-1,G()*2-1,G()*2-1);let le=k.length();if(le>1||le<.05)continue;k.divideScalar(le);let U=Math.abs(k.dot(se));G()>.12+.88*Math.exp(-U*U/.02)||(be[he*3]=k.x*Co*.995,be[he*3+1]=k.y*Co*.995,be[he*3+2]=k.z*Co*.995,ye[he]=.035+.11*Math.pow(G(),3),he++)}let R=new e.BufferGeometry;R.setAttribute("position",new e.BufferAttribute(be,3)),R.setAttribute("aI",new e.BufferAttribute(ye,1));let Ae=new e.Points(R,new e.ShaderMaterial({vertexShader:Os,fragmentShader:Bs,uniforms:{uPx:ne.uniforms.uPx},transparent:!0,blending:e.AdditiveBlending,depthWrite:!1,depthTest:!0,fog:!1}));Ae.frustumCulled=!1,Ae.renderOrder=-9,Ae.name="sky-starhaze",b.add(Ae)}let J=null;if(c){let se=await ho(e,l,{flipY:!0}).catch(()=>null);if(se){se.colorSpace=e.SRGBColorSpace,se.anisotropy=4,se.wrapS=e.RepeatWrapping;let Le=$o(192.85948,27.12825,L),be=$o(266.40499,-28.93617,L),ye=new L().crossVectors(Le,be),k=new e.ShaderMaterial({vertexShader:zs,fragmentShader:Ps,side:e.BackSide,uniforms:{map:{value:se},gc:{value:be},gy:{value:ye},ngp:{value:Le},uInt:{value:z},uSat:{value:.8},uTexel:{value:new e.Vector2(1/se.image.width,1/se.image.height)}},depthWrite:!1,depthTest:!1,fog:!1});J=new e.Mesh(new e.SphereGeometry(Co*.99,64,32),k),J.frustumCulled=!1,J.renderOrder=-10,J.name="sky-milkyway",b.add(J)}}return t.add(b),{group:b,stars:ee,milkyWay:J,update:se=>{b.position.copy(se)},starCount:n,starMaterial:ne}}var Fs=`
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
`,an=`
float ah(vec2 p){ p = fract(p * vec2(443.897, 441.423)); p += dot(p, p.yx + 19.19); return fract((p.x + p.y) * p.x); }
float ah3(vec3 p){ p = fract(p * 0.3183099 + .1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float an(vec2 x){ vec2 i = floor(x), f = fract(x); f = f * f * (3. - 2. * f);
  return mix(mix(ah(i), ah(i + vec2(1, 0)), f.x), mix(ah(i + vec2(0, 1)), ah(i + vec2(1, 1)), f.x), f.y); }
// fbm with each octave faded to its mean as it nears the pixel footprint (fw = footprint in units of the base octave): no shimmer
float afbm(vec2 p, float fw){ float v = 0., a = .5; for (int i = 0; i < 5; i++){ float k = 1. - smoothstep(.25, .6, fw); v += a * mix(.5, an(p), k); p = p * 2.03 + 17.1; fw *= 2.03; a *= .5; } return v; }
`,Vs=`
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
}`,Us="varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }",nr=`
${an}
${Fs}
${Vs}
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
}`,Ns=`
uniform vec3 uSun, uOrigin; uniform float uK, uNight, uT, uAmb, uFogN, uFogF;
varying vec3 vW;
${nr}
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
}`,Is="varying vec2 vS; void main(){ vS = position.xy; gl_Position = vec4(position.xy, 0., 1.); }",Gs=`
uniform float uE, uT, uAsp, uFlow; uniform vec3 uSky, uLit; uniform vec2 uSunS;
varying vec2 vS;
${an}
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
}`;function rn({THREE:e,origin:t=new e.Vector3(0,-6e3,0)}={}){let r=e.MathUtils.smoothstep,l=ne=>Math.min(1,Math.max(0,ne)),o={uSun:{value:new e.Vector3(-.9,.33,-.2).normalize()},uOrigin:{value:t.clone()},uK:{value:1},uNight:{value:0},uT:{value:0},uAmb:{value:1},uFogN:{value:500},uFogF:{value:4200}},c=new e.Mesh(new e.SphereGeometry(6e3,64,32),new e.ShaderMaterial({vertexShader:Us,fragmentShader:Ns,uniforms:o,side:e.BackSide,depthWrite:!1,depthTest:!1,fog:!1}));c.frustumCulled=!1,c.renderOrder=-20,c.visible=!1,c.name="mars-air-dome";let z={uE:{value:0},uT:{value:0},uAsp:{value:1},uFlow:{value:0},uSky:{value:new e.Color(.9,.6,.38)},uLit:{value:new e.Color(1.2,.8,.5)},uSunS:{value:new e.Vector2(-1,.4)}},x=new e.BufferGeometry;x.setAttribute("position",new e.BufferAttribute(new Float32Array([-1,-1,0,3,-1,0,-1,3,0]),3));let y=new e.Mesh(x,new e.ShaderMaterial({vertexShader:Is,fragmentShader:Gs,uniforms:z,transparent:!0,depthWrite:!1,depthTest:!1,fog:!1,blending:e.CustomBlending,blendEquation:e.AddEquation,blendSrc:e.OneFactor,blendDst:e.OneMinusSrcAlphaFactor}));y.frustumCulled=!1,y.renderOrder=999,y.visible=!1,y.name="mars-air-veil";let m=new e.Color,L=(ne,ee,J,we)=>{let se=J.y,Le=ee.x*J.x+ee.y*J.y+ee.z*J.z,be=Math.max(ee.y,0),ye=Math.max(Le,0),k=r(se,-.1,.12),de=r(se,-.32,0),G=r(Math.pow(be,.42),0,1);ne.setRGB(.9+(.34-.9)*G,.62+(.205-.62)*G,.4+(.13-.4)*G);let R=.68+.55*ye**4+.4*ye**30;R*=.38+.62*r(Le,-.7,.7)+(1-(.38+.62*r(Le,-.7,.7)))*r(se,.08,.45),R*=.11*de+(1-.11*de)*k,R*=.75+.25*r(se,-.3,.6),ne.multiplyScalar(R);let Ae=(ye**90*2.2+ye**16*.45+ye**5*.08)*de*(.95+(.3-.95)*k);ne.r+=.3*Ae+.0022,ne.g+=.5*Ae+.0028,ne.b+=.98*Ae+.0055;let he=Math.pow(we,2.6)+(Math.pow(we,.6)-Math.pow(we,2.6))*Math.exp(-be*7);return ne.multiplyScalar(he),ne},b=new e.Vector3,C=new e.Vector3,w=new e.Vector3,n=(ne,ee=o.uSun.value,J=o.uK.value,we=null)=>{ne.setRGB(0,0,0);let se=0;for(let Le=0;Le<8;Le++){let be=Le/8*Math.PI*2;b.set(Math.cos(be),.03,Math.sin(be)).normalize();let ye=we?1+Math.max(0,b.x*we.x+b.z*we.z)*2:1;L(m,b,ee,J),ne.r+=m.r*ye,ne.g+=m.g*ye,ne.b+=m.b*ye,se+=ye}return ne.multiplyScalar(1/se)},F=ne=>(b.set(0,1,0),L(ne,b,o.uSun.value,1),n(m),ne.lerp(m,.5)),N={e:0,flow:0,prevE:0};function j(ne,ee={}){ne=l(ne);let{inCol:J=!1,cam:we=null,t:se=0,dt:Le=0,alt:be=0,fog:ye=null,sunDir:k=null,night:de=0}=ee;if(N.flow+=(Le||0)*.12+Math.abs(ne-N.prevE)*4,N.prevE=ne,N.e=ne,z.uE.value=ne,z.uT.value=se,z.uFlow.value=N.flow,we&&(z.uAsp.value=we.aspect||1),y.visible=ne>.005&&ne<.7,k&&o.uSun.value.copy(k).normalize(),o.uNight.value=de,o.uT.value=se,o.uK.value=J?.35+.65*r(ne,.3,.52):0,o.uAmb.value=1-.85*de,c.visible=!!J,we&&J&&(c.position.copy(we.position),c.updateMatrixWorld()),n(z.uSky.value,o.uSun.value,1),z.uSky.value.lerp(m.setRGB(.55,.22,.12),1-r(ne,.22,.4)),z.uLit.value.copy(z.uSky.value).multiplyScalar(1.9),we&&(C.copy(o.uSun.value).transformDirection(we.matrixWorldInverse),z.uSunS.value.set(C.x,C.y).normalize()),ye&&J){we&&we.getWorldDirection(w),n(ye.color,o.uSun.value,o.uK.value,we?w:null);let G=Math.max(0,be),R=r(ne,.45,1);ye.near=500+G*1.5*(1-R*.5),ye.far=Math.max(4200,(4200+G*6)*(.55+.45*R)),o.uFogN.value=ye.near,o.uFogF.value=ye.far}}return{dome:c,veil:y,entry:j,roots:()=>[y,c],hemi:F,horizon:n,skyAt:L,state:N,uniforms:{dome:o,veil:z}}}var ea=`
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
`,Aa=`
varying vec3 vP; varying vec2 vUv; varying vec3 vV;
void main(){
  vP = position; vUv = uv;
  mat3 M = mat3(modelMatrix); vec4 w = modelMatrix * vec4(position, 1.);
  vV = transpose(M) * (cameraPosition - w.xyz);           // view vector in object space (meshes only rotate)
  gl_Position = projectionMatrix * viewMatrix * w;
}`,Ts=`
uniform sampler2D tMap, tSpec, tNorm, tLights, tClouds;
uniform vec3 uSun; uniform float uGrow, uCloudOff, uCloudH, uSunI;
varying vec3 vP; varying vec2 vUv; varying vec3 vV;
${ea}
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
}`,Ws=`
uniform sampler2D tClouds; uniform vec3 uSun; uniform float uSunI; uniform sampler2D tLights; uniform vec4 uHole;
varying vec3 vP; varying vec2 vUv; varying vec3 vV;
${ea}
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
}`,js=`
uniform sampler2D tMap, tNorm; uniform vec3 uSun; uniform float uSunI, uAlbedo, uRelief;
varying vec3 vP; varying vec2 vUv; varying vec3 vV;
${ea}
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
}`,qs=`
uniform sampler2D tMap, tNorm; uniform vec3 uSun; uniform float uSunI, uRelief, uDomes, uBump, uR;
varying vec3 vP; varying vec2 vUv; varying vec3 vV;
${ea}
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
}`,Xs=`
varying vec3 vN; varying vec3 vO;
void main(){ vN = normal; vO = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,Ks=`
uniform vec3 uSun; uniform float uSunI, uA;
varying vec3 vN; varying vec3 vO;
${ea}
void main(){
  vec3 N = normalize(vN), L = normalize(uSun);
  float n = fbm3(vO * 9.);
  vec3 alb = vec3(0.075, 0.064, 0.056) * (0.8 + 0.4 * n);
  float m0 = max(dot(N, L), 0.);
  vec3 col = alb * m0 * uSunI * 2.2 + alb * 0.02;
  gl_FragColor = vec4(col * uA, uA);
}`,Ys=`
varying vec3 vW;
void main(){ vec4 w = modelMatrix * vec4(position, 1.); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,nn=`
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
}`;function sn({THREE:e,scene:t,renderer:r,toSun:l,EARTH:o,MOON:c,MARS:z,files:x}){let b=Math.min(8,r.capabilities.getMaxAnisotropy()),C=[],w={moon:[],mars:[]},n={},F=(P,h,D,te)=>{let Z=new e.DataTexture(new Uint8Array([P,h,D,255]),1,1);return Z.colorSpace=te?e.SRGBColorSpace:e.NoColorSpace,Z.needsUpdate=!0,Z},N=(P,h)=>ho(e,P,{flipY:!0,colorSpace:h?e.SRGBColorSpace:e.NoColorSpace}).then(D=>(D.anisotropy=b,D.wrapS=e.RepeatWrapping,D.needsUpdate=!0,D),()=>null),j=P=>{if(P&&r&&r.initTexture)try{r.initTexture(P)}catch{}},W=(P,h,D,te)=>{let Z={value:D},ge=x[P];if(!ge)return Z;let Je=Te=>{Te&&(j(Te),Z.value=Te)};return te?w[te].push(()=>N(ge,h).then(Te=>({t:Te,swap:Je}))):C.push(N(ge,h).then(Je)),Z},ne=()=>new Promise(P=>typeof requestAnimationFrame=="function"?requestAnimationFrame(()=>P()):setTimeout(P,0));function ee(P){return n[P]?n[P]:n[P]=Promise.all(w[P].map(h=>h())).then(async h=>{for(let{t:D,swap:te}of h)D&&(te(D),await ne())})}let J=()=>({value:new e.Vector3().copy(l)}),we={tMap:W("earth",!0,F(10,30,70,!0)),tSpec:W("earthSpec",!1,F(255,255,255)),tNorm:W("earthNorm",!1,F(128,128,255)),tLights:W("earthLights",!1,F(0,0,0)),tClouds:W("clouds",!1,F(0,0,0)),uSun:J(),uGrow:{value:.03},uCloudOff:{value:0},uCloudH:{value:.0085},uSunI:{value:3.3}},se=new e.Mesh(new e.SphereGeometry(10,192,96),new e.ShaderMaterial({vertexShader:Aa,fragmentShader:Ts,uniforms:we}));se.position.copy(o),t.add(se);let Le={tClouds:we.tClouds,tLights:we.tLights,uSun:J(),uSunI:we.uSunI,uHole:{value:new e.Vector4(0,1,0,0)}},be=new e.Mesh(new e.SphereGeometry(10*1.0085,160,80),new e.ShaderMaterial({vertexShader:Aa,fragmentShader:Ws,uniforms:Le,transparent:!0,depthWrite:!1}));be.position.copy(o),be.renderOrder=1,t.add(be);let ye={tMap:W("moon",!0,F(150,150,150,!0),"moon"),tNorm:W("moonNorm",!1,F(128,128,255),"moon"),uSun:J(),uSunI:{value:3.3},uAlbedo:{value:.3},uRelief:{value:1.35}},k=new e.Mesh(new e.SphereGeometry(2.7,128,64),new e.ShaderMaterial({vertexShader:Aa,fragmentShader:js,uniforms:ye}));k.position.copy(c),t.add(k);let de={tMap:W("mars",!0,F(150,70,40,!0),"mars"),tNorm:W("marsNorm",!1,F(128,128,255),"mars"),uSun:J(),uSunI:{value:2.2},uRelief:{value:1.25},uDomes:{value:1}};de.uBump={value:11},de.uR={value:6};let G=new e.Mesh(new e.SphereGeometry(6*1.015,192,96),new e.ShaderMaterial({vertexShader:Aa,fragmentShader:qs,uniforms:de,transparent:!0,blending:e.CustomBlending,blendEquation:e.AddEquation,blendSrc:e.OneFactor,blendDst:e.OneMinusSrcAlphaFactor}));G.position.copy(z),t.add(G),G.renderOrder=1;let R=null;{let P=new e.IcosahedronGeometry(1,4),h=P.attributes.position,D=new e.Vector3,te=(Ie,E,Be)=>{let Ue=Math.sin(Ie*12.9898+E*78.233+Be*37.719)*43758.5453;return Ue-Math.floor(Ue)};for(let Ie=0;Ie<h.count;Ie++){D.fromBufferAttribute(h,Ie);let E=1+.1*Math.sin(D.x*3.1+1)*Math.cos(D.y*2.3)+.06*Math.sin(D.z*5.3+D.x*2);E-=.22*Math.exp(-D.distanceToSquared({x:.85,y:.25,z:.46})/.09),E-=.05*te(Math.round(D.x*6),Math.round(D.y*6),Math.round(D.z*6)),D.multiplyScalar(E),D.x*=1.25,D.z*=.88,h.setXYZ(Ie,D.x,D.y,D.z)}P.computeVertexNormals();let Z={uSun:{value:new e.Vector3(1,0,0)},uSunI:de.uSunI,uA:{value:1}};R=new e.Mesh(P,new e.ShaderMaterial({vertexShader:Xs,fragmentShader:Ks,uniforms:Z,transparent:!0,blending:e.CustomBlending,blendEquation:e.AddEquation,blendSrc:e.OneFactor,blendDst:e.OneMinusSrcAlphaFactor})),R.frustumCulled=!1,R.renderOrder=1,R.matrixAutoUpdate=!1,G.add(R);let ge=new e.Vector3(30,10,38).normalize(),Je=new e.Vector3(0,1,0).addScaledVector(ge,-ge.y).normalize(),Te=new e.Vector3().crossVectors(Je,ge),rt=Je.clone().multiplyScalar(.85).addScaledVector(Te,.55).normalize(),We=new e.Quaternion,Xe=new e.Vector3,St=new e.Vector3,jt=new e.Euler,bt=new e.Quaternion;R.alpha=1,R.size=.12,R.orbit=1.75*6,R.phase=null,R.onBeforeRender=(Ie,E,Be)=>{let Ue=R.phase??.3+.18*Math.sin(Ae*.011);St.copy(rt).multiplyScalar(Math.cos(Ue)).addScaledVector(ge,Math.sin(Ue)).multiplyScalar(R.orbit).add(G.position),jt.set(.3,Ae*.05,.2),We.setFromEuler(jt),R.matrixWorld.compose(St,We,Xe.setScalar(R.size)),bt.copy(We).invert(),Z.uSun.value.copy(de.uSun.value).applyQuaternion(G.quaternion).applyQuaternion(bt);let He=Be.position.distanceTo(G.position);Z.uA.value=R.alpha*e.MathUtils.smoothstep(He,13,20)}}let Ae=0,he=(P,h,D)=>{let te={uCenter:{value:P.clone()},uSun:{value:new e.Vector3().copy(l)},uRp:{value:h},uRa:{value:h*D.top},uBetaR:{value:new e.Vector3(...D.bR).divideScalar(h)},uBetaM:{value:new e.Vector3(...D.bM).divideScalar(h)},uBetaMe:{value:new e.Vector3(...D.bMe).divideScalar(h)},uG:{value:new e.Vector3(...D.g)},uSunCol:{value:new e.Vector3(...D.sun)},uHr:{value:D.Hr*h},uHm:{value:D.Hm*h},uK:{value:D.k}},Z=new e.Mesh(new e.SphereGeometry(h*D.top,128,64),new e.ShaderMaterial({vertexShader:Ys,fragmentShader:D.frag||nn,uniforms:te,transparent:!0,depthWrite:!1,blending:e.CustomBlending,blendEquation:e.AddEquation,blendSrc:e.OneFactor,blendDst:e.OneMinusSrcAlphaFactor}));return Z.position.copy(P),Z.renderOrder=2,t.add(Z),Z},pe=he(o,10,{top:1.1,Hr:.0085,Hm:.0034,bR:[8,19,48],bM:[24,24,24],bMe:[27,27,27],g:[.8,.8,.8],sun:[1,.97,.92],k:15}),le=he(z,6,{top:1.07,Hr:.0075,Hm:.012,bR:[3,7,18],bM:[5,3.4,1.8],bMe:[6,5,4.4],g:[.55,.72,.9],sun:[1,.95,.88],k:12,frag:nn.replace("clamp(1. - tr, 0., 1.) * 0.85","clamp(1. - tr, 0., 1.) * 0.25")}),U=[pe,le],ie=new e.Quaternion,Ce=new e.Vector3,ke=(P,h)=>{ie.copy(P.quaternion).invert(),h.value.copy(l).applyQuaternion(ie)},$e=.012,Qe=.0158,ae=new e.Quaternion,Ke=new e.Vector3;function De({t:P=0,intro:h=1,camPos:D,spin:te=0,hole:Z}={}){if(se.rotation.y=te+P*$e,be.rotation.y=te+P*Qe,Z&&(be.updateMatrixWorld(),ae.copy(be.quaternion).invert(),Ke.copy(Z).applyQuaternion(ae),Le.uHole.value.set(Ke.x,Ke.y,Ke.z,1)),k.rotation.y=P*.01,G.rotation.y=P*.02,Ae=P,ke(se,we.uSun),ke(be,Le.uSun),ke(k,ye.uSun),ke(G,de.uSun),we.uCloudOff.value=(se.rotation.y-be.rotation.y)/(2*Math.PI),we.uGrow.value=.03+.97*h,D)for(let ge of U){let Te=Ce.copy(D).sub(ge.position).length()<ge.material.uniforms.uRa.value*1.002?e.BackSide:e.FrontSide;ge.material.side!==Te&&(ge.material.side=Te,ge.material.needsUpdate=!0)}}let qe=null;return qe=rn({THREE:e}),t.add(qe.dome,qe.veil),{earth:se,moon:k,mars:G,clouds:be,earthAtmo:pe,marsAtmo:le,phobos:R,air:qe,entry:qe?(P,h)=>qe.entry(P,h):void 0,entryRoots:qe?qe.roots:void 0,ready:Promise.all(C),loadDeferred:ee,update:De}}var Tt=e=>Math.min(1,Math.max(0,e)),pt=(e,t,r)=>e<=t?0:e>=r?1:(e=(e-t)/(r-t),e*e*(3-2*e)),to=e=>1-Math.pow(1-Tt(e),3),Yt=e=>e*e*e*(e*(e*6-15)+10),xt=(e,t,r)=>e+(t-e)*r;function co(e,t,r,l){let o=e.length,c=[],z=[],x=new Array(o);if(o===2){let m=(t[1]-t[0])/(e[1]-e[0]||1);return L=>L>=e[1]?t[1]:t[0]+m*(L-e[0])}for(let m=0;m<o-1;m++)c[m]=e[m+1]-e[m],z[m]=(t[m+1]-t[m])/c[m];for(let m=1;m<o-1;m++)if(z[m-1]*z[m]<=0)x[m]=0;else{let L=2*c[m]+c[m-1],b=c[m]+2*c[m-1];x[m]=(L+b)/(L/z[m-1]+b/z[m])}let y=(m,L,b,C)=>{let w=((2*m+L)*b-m*C)/(m+L);return Math.sign(w)!==Math.sign(b)?w=0:Math.sign(b)!==Math.sign(C)&&Math.abs(w)>3*Math.abs(b)&&(w=3*b),w};return x[0]=r!==void 0?r*z[0]:y(c[0],c[1],z[0],z[1]),x[o-1]=l!==void 0?l*z[o-2]:y(c[o-2],c[o-3],z[o-2],z[o-3]),m=>{if(m<=e[0])return t[0]+x[0]*(m-e[0]);if(m>=e[o-1])return t[o-1];let L=0;for(;m>e[L+1];)L++;let b=(m-e[L])/c[L],C=b*b,w=C*b;return(2*w-3*C+1)*t[L]+(w-2*C+b)*c[L]*x[L]+(-2*w+3*C)*t[L+1]+(w-C)*c[L]*x[L+1]}}function sr(e,t,r){let l=e.length,o=[],c=[],z=r?r.slice():new Array(l).fill(null);for(let x=0;x<l-1;x++)o[x]=e[x+1]-e[x],c[x]=(t[x+1]-t[x])/o[x];for(let x=0;x<l;x++)if(z[x]==null){if(x===0||x===l-1){z[x]=0;continue}if(c[x-1]*c[x]<=0)z[x]=0;else{let y=2*o[x]+o[x-1],m=o[x]+2*o[x-1];z[x]=(y+m)/(y/c[x-1]+m/c[x])}}return x=>{if(x<=e[0])return t[0];if(x>=e[l-1])return t[l-1];let y=0;for(;x>e[y+1];)y++;let m=(x-e[y])/o[y],L=m*m,b=L*m;return(2*b-3*L+1)*t[y]+(b-2*L+m)*o[y]*z[y]+(-2*b+3*L)*t[y+1]+(b-L)*o[y]*z[y+1]}}function Ca(e){return co(e.map(t=>t[0]),e.map(t=>t[1]))}function ir(e,t,r,l){e.arcLengthDivisions=Math.max(e.arcLengthDivisions,4e3),e.needsUpdate=!0;let o=e.getLengths(),c=t.length,z=o[o.length-1],x=m=>{let L=m*(o.length-1),b=Math.floor(L);return b>=o.length-1?z:o[b]+(o[b+1]-o[b])*(L-b)},y=co(t,t.map((m,L)=>x(L/(c-1))),r,l);return m=>e.getUtoTmapping(0,Math.min(z,Math.max(0,y(m))))}function Da(e,t,r,l,o,c){let z=e.shadow.camera,x=e.shadow.mapSize,y=(z.right-z.left)/x.x,m=(z.top-z.bottom)/x.y;o.set(0,1,0).cross(r).normalize(),c.copy(r).cross(o);let L=t.dot(o),b=t.dot(c);e.target.position.copy(t).addScaledVector(o,Math.round(L/y)*y-L).addScaledVector(c,Math.round(b/m)*m-b),e.position.copy(e.target.position).addScaledVector(r,l)}function ln({THREE:e,SITE_ROT:t,AUS:r,U_PER_M:l,C0:o,L0:c,spaceCam:z}){let n=Math.log(65e4),F=Math.log(o.distanceTo(r)/l),N=n,j=r.clone().normalize(),W=j.clone().negate(),ne=o.clone().sub(r).normalize(),ee=o.distanceTo(r),J=()=>new e.Vector3,we=new e.Quaternion,se=new e.Quaternion,Le=J(),be=J(),ye=J(),k=J(),de=J(),G=J(),R=J(),Ae=J(),he={},pe=null,le=null,U=null,ie=null,Ce=(Qe,ae,Ke,De)=>{for(let qe=0;qe<60;qe++){let ze=(Ke+De)/2;Qe(ze)<ae?Ke=ze:De=ze}return(Ke+De)/2};function ke(Qe){ie=Qe;let{yA:ae,yT:Ke,yX:De,yE:qe,S:ze}=ie,P=.5,h=(-3*ze(qe)+4*ze(qe+P)-ze(qe+2*P))/(2*P);z(-1,Le,k),z(ze(qe+P),be,k),z(ze(qe+2*P),ye,k);let D=Le.clone().multiplyScalar(-3).addScaledVector(be,4).addScaledVector(ye,-1).divideScalar(2*P),te=D.dot(ne),Z=Math.max(te,1e-6);he.dSdy=h,he.v0=D.length(),he.r0=te,he.r=Z;let ge=De+.46*(qe-De),Je=De+.64*(qe-De),Te=De+.82*(qe-De),rt=Z/ee,We=.4/(qe-Te);pe=co([ae,Ke,De,ge,Je,Te,qe],[125,170,290,4e4].map(Math.log).concat(F-1.4,F-.4,F),.7,rt/We),he.yH=Ce(pe,n,ae,qe),Ae.copy(D).addScaledVector(ne,-te),G.copy(Ae).multiplyScalar((qe-he.yH)/ee);let Xe=St=>Ce(pe,Math.log(St),ae,qe);le=co([ae,Ke,De,Xe(1600),Xe(7e3),Xe(4e4)],[7.9,10.2,13.4,17.9,18.95,19.6],void 0,0),U=co([ae,Ke,De,Xe(1600),Xe(3e4)],[0,.3,.52,.8,1],void 0,0),Object.assign(he,{yA:ae,yT:Ke,yX:De,yM:ge,yE:qe,LAMH:n,LAM1:F,lamA:pe(ae),yNight:Xe(4e4),yG1:Xe(3e4)})}function $e(Qe,ae){let{yA:Ke,yE:De}=ie,qe=Math.min(Math.max(Qe,Ke),De),ze=pe(qe),P=Math.exp(ze);if(ae.lam=ze,ae.s=Tt((Qe-Ke)/(De-Ke)),ae.fov=38,ae.hour=le(qe),ae.g=Math.min(1,U(qe)),qe<he.yH){let Z=Yt(Tt((ze-he.lamA)/(N-he.lamA))),ge=e.MathUtils.lerp(-.08+.16*(qe-Ke)/(De-Ke),t,Z),Je=e.MathUtils.degToRad(56+34*Z);return ae.look.set(0,0,-10*(1-Z)),ae.pos.set(Math.sin(ge)*Math.cos(Je),Math.sin(Je),Math.cos(ge)*Math.cos(Je)).multiplyScalar(P).add(ae.look),ae.up.set(-Math.sin(ge),0,-Math.cos(ge)),ae.world="site",ae.dist=ae.pos.length(),ae.upk=Z,ae}let h=Tt((qe-he.yH)/(De-he.yH)),D=h*h,te=D*h;return de.copy(j).multiplyScalar(2*te-3*D+1).addScaledVector(ne,3*D-2*te).addScaledVector(G,te-D).normalize(),ae.pos.copy(r).addScaledVector(de,P*l),R.copy(c).sub(ae.pos).normalize(),we.setFromUnitVectors(W,R),se.identity().slerp(we,Yt(Math.min(1,h*1.1))),ae.look.copy(W).applyQuaternion(se).multiplyScalar(P*l).add(ae.pos),ae.up.set(0,1,0),ae.world="globe",ae.dist=P,ae.upk=1,ae}return{layout:ke,at:$e,k:he,LAMH:n,LAM1:F}}var za=30.250453*Math.PI/180,lr=-13*Math.PI/180;function ka(e,t={}){let r=(e-13.1)*15*Math.PI/180,l=Math.sin(za)*Math.sin(lr)+Math.cos(za)*Math.cos(lr)*Math.cos(r),o=Math.asin(l),c=Math.atan2(-Math.sin(r),Math.tan(lr)*Math.cos(za)-Math.sin(za)*Math.cos(r));return t.sinE=l,t.el=o,t.az=c,t.x=Math.cos(o)*Math.sin(c),t.y=l,t.z=-Math.cos(o)*Math.cos(c),t}var Qs=.79,Pa=(e,t,r)=>{let l=Math.min(1,Math.max(0,(e-t)/(r-t)));return l*l*(3-2*l)},La=Math.log;function cn(e,t){let r=1+.3*(1-Pa(e,.02,.45)),l=Pa(-e,-.02,.12),o=1-.78*Pa(t,La(2e3),La(4e4))*l,c=1+.66*Math.exp(-(((e-.0115)/(e>.0115?.016:.0135))**2)),z=1.05*r*o*c;return z+(Qs-z)*Pa(t,La(2e6),La(9e6))}var oa={lat:30.250453,lon:-97.719913},Fa=17*Math.PI/180,ta=400,Oa=e=>{let t=(e%1009+1009)%1009;return(t*t*7+t*31+13)%1009/1009},Vo=180,mo=140,Ba=164/11,Rt=4;var un=`
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
`,Zs=e=>`
vec2 toGeo(vec2 p){ return vec2(p.x*uRot.x-p.y*uRot.y, p.x*uRot.y+p.y*uRot.x); }
float orthoW(vec2 g){ vec2 a=abs(g); return uOrthoOn*(1.-smoothstep(${ta-90}.,${ta-4}.,max(a.x,a.y))); }
vec3 ortho(vec2 g){ vec3 c=texture2D(tOrtho,vec2(g.x/${2*ta}.+.5,.5-g.y/${2*ta}.)).rgb;
  vec3 l=texture2D(tOrthoL,vec2(g.x/${2*e}.+.5,.5-g.y/${2*e}.)).rgb; vec2 a=abs(g);
  return mix(c,l,uOrthoLOn*(1.-smoothstep(${(e*.85).toFixed(1)},${e-2}.,max(a.x,a.y)))); }
// round feathers, never square: each photo hands over to the next one out well inside its own edge
float circW(vec2 g, float hf){ return 1.-smoothstep(.55*hf,.95*hf,length(g)); }
vec4 photoLayers(vec2 g){
  float wc=uOrthoCOn*circW(g,40000.), wb=uOrthoBOn*circW(g,4000.), wa=uOrthoOn*circW(g,${ta}.);
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
}`,fn=e=>`{
  vec2 bp=vLoc.xz; float bw=max(length(fwidth(bp)),1e-3), fade=1.-smoothstep(.15,.9,bw);   // only where it can resolve
  if(fade>0.){
    float e=.18; vec2 ex=vec2(e,0.), ez=vec2(0.,e);
    #define BH(q) (dot(ortho(toGeo(q)),vec3(.3,.5,.2))*.9*uOrthoOn+fb((q)*1.6)*.1+vn((q)*6.)*.025)
    float gx=(BH(bp+ex)-BH(bp-ex))/(2.*e), gz=(BH(bp+ez)-BH(bp-ez))/(2.*e);
    #undef BH
    normal=normalize(normal+(viewMatrix*vec4(-gx,0.,-gz,0.)).xyz*${e}*fade);
  } }`;function hn({THREE:e,scene:t,renderer:r,sunLight:l,hemi:o,ORIGIN:c,earthU:z,ortho:x={}}){let y=x.lotHalf||200,m=Zs(y),L=new e.Group;L.position.copy(c),L.visible=!1,t.add(L);let b={uG:{value:0},uNight:{value:0},uT:{value:0},uWork:{value:0},uSunL:{value:new e.Vector3(0,1,0)},uOrigin:{value:c.clone()},tMap:z.tMap,tLights:z.tLights,uLL:{value:new e.Vector2(oa.lat,oa.lon)},uDig:{value:0},uPile:{value:0},uBack:{value:0},uClear:{value:0},uProg:{value:0},tOrtho:{value:null},uOrthoOn:{value:0},tOrthoL:{value:null},uOrthoLOn:{value:0},tOrthoB:{value:null},uOrthoBOn:{value:0},tOrthoC:{value:null},uOrthoCOn:{value:0},uRot:{value:new e.Vector2(Math.cos(Fa),Math.sin(Fa))}};{let M=new e.DataTexture(new Uint8Array([90,80,66,255]),1,1);M.needsUpdate=!0,b.tOrtho.value=M,b.tOrthoL.value=M}{let M=new e.DataTexture(new Uint8Array([70,72,60,255]),1,1);M.needsUpdate=!0,b.tOrthoB.value=M,b.tOrthoC.value=M}let C={},w=500,n=(M,Q,T,A=!1)=>M?ho(e,M,{flipY:!0,colorSpace:e.SRGBColorSpace}).then(S=>{if(S.anisotropy=8,S.needsUpdate=!0,r&&r.initTexture)try{r.initTexture(S)}catch{}return b[Q].value=S,A?C[T]=performance.now():b[T].value=1,!0},()=>!1):Promise.resolve(!1),F=Promise.all([n(x.lot,"tOrthoL","uOrthoLOn"),n(x.site,"tOrtho","uOrthoOn")]),N=Promise.all([F,n(x.km8,"tOrthoB","uOrthoBOn",!0),n(x.km80,"tOrthoC","uOrthoCOn",!0)]),j=0,W=(M,Q,T,A,S,re,Ne,lt,zt)=>{let Ot="tfsite"+j++;return M.customProgramCacheKey=()=>Ot,M.onBeforeCompile=At=>{Object.assign(At.uniforms,b),At.vertexShader=`uniform vec3 uOrigin; uniform float uDig,uPile,uBack; varying vec3 vLoc;
`+un+Q+`
`+At.vertexShader,lt&&(At.vertexShader=At.vertexShader.replace("#include <beginnormal_vertex>",lt)),At.vertexShader=At.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
`+T+`
vLoc=(modelMatrix*vec4(transformed,1.)).xyz-uOrigin;`),At.fragmentShader=`uniform float uG,uNight,uT,uWork,uClear,uProg,uOrthoOn,uOrthoLOn,uOrthoBOn,uOrthoCOn; uniform vec3 uSunL; uniform sampler2D tMap,tLights,tOrtho,tOrthoL,tOrthoB,tOrthoC; uniform vec2 uLL,uRot; varying vec3 vLoc;
`+un+m+A+`
`+At.fragmentShader.replace("#include <color_fragment>",`#include <color_fragment>
`+S).replace("#include <roughnessmap_fragment>",`#include <roughnessmap_fragment>
`+re).replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>
`+Ne).replace("#include <normal_fragment_maps>",`#include <normal_fragment_maps>
`+(zt||""))},M},ne=`
  vec3 SOD=vec3(1.,.58,.24);
  vec2 llUv(vec2 p){ float lat=uLL.x-p.y/110574., lon=uLL.y+p.x/(111320.*cos(radians(uLL.x))); return vec2((lon+180.)/360.,(lat+90.)/180.); }
  // one house slot: returns roof coverage and fills colour/height; painted only outside the 3D ring
  float house(vec2 lc, float ci, float cj, float row, out vec3 roof, out float ht, out vec2 porch, out float pool, out vec2 poolC, float w){
    float s=floor((lc.x+82.)/${Ba.toFixed(6)}); roof=vec3(0.); ht=0.; pool=0.; porch=vec2(1e5); poolC=vec2(1e5);
    if(s<0.||s>10.) return 0.;
    float n=ci*157.+cj*311.+row*71.+s*13.+500.;
    if(Hh(n)>0.92) return 0.;
    float cx=-82.+(s+.5)*${Ba.toFixed(6)}, front=row<.5? -70.+hwZ(cj-1.) : 70.-hwZ(cj), dir=row<.5?1.:-1.;
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
    vec2 uS=p/vec2(${Vo}.,${mo}.), dS=abs(fract(uS)-.5)*vec2(${Vo}.,${mo}.);
    float hS=3., sgS=max(hS,sg0), sa=max(1.5,sg0);
    float gX=h21(vec2(floor(uS.x),floor(uS.y+.5))+.37), gZ=h21(vec2(floor(uS.x+.5),floor(uS.y))+5.71);
    float segX=step(.18,gX)*(.4+1.2*fract(gX*13.1)), segZ=step(.18,gZ)*(.4+1.2*fract(gZ*13.1));
    float ddX=mod(p.y,36.)-18., ddZ=mod(p.x,36.)-18., fa=smoothstep(4.,9.,sa), dn=36.*1.5/(1.7725*sa);
    float dotX=mix(exp(-ddX*ddX/(sa*sa))*dn,1.,fa), dotZ=mix(exp(-ddZ*ddZ/(sa*sa))*dn,1.,fa);
    float Lst=(exp(-dS.x*dS.x/(sgS*sgS))*segX*dotX+exp(-dS.y*dS.y/(sgS*sgS))*segZ*dotZ)*hS/sgS;
    float mSt=1.7725*hS*(1./${Vo}.+1./${mo}.)*.82;
    float fS=smoothstep(.05*${mo}.,.13*${mo}.,sgS), aS=.14*(1.-.92*fS); S+=aS*mix(Lst/mSt,1.,fS); W+=aS;
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
    float ci=floor(p.x/${Vo}.+.5), cj=floor(p.y/${mo}.+.5);
    vec2 lc=p-vec2(ci*${Vo}.,cj*${mo}.);
    float kx=lc.x>0.?ci:ci-1., kz=lc.y>0.?cj:cj-1.;
    float dX=${Vo/2}.-abs(lc.x), dZ=${mo/2}.-abs(lc.y);          // distance to the street centrelines
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
        float s=floor((lc.x+82.)/${Ba.toFixed(6)}), cxs=-82.+(s+.5)*${Ba.toFixed(6)};
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
  }`,ee=W(new e.MeshStandardMaterial({roughness:1,metalness:0,polygonOffset:!0,polygonOffsetFactor:2,polygonOffsetUnits:2}),"","",ne+`
vec3 gA; float gR; vec3 gE;`,`if(abs(vLoc.x)<74.8&&abs(vLoc.z)<54.8) discard; // the lot mesh owns this patch (the pit goes below the ground plane)
  float gw=max(length(fwidth(vLoc.xz)),1e-3); groundShade(vLoc.xz,gw,gA,gR,gE);
  { vec2 gq=toGeo(vLoc.xz); vec4 ph=photoLayers(gq); if(ph.a>0.){ gA=mix(gA,ph.rgb,ph.a); gR=mix(gR,.95,ph.a); }
    float ow=uOrthoOn*circW(gq,400.); if(ow>0.) gE=mix(gE,orthoNight(gq,gw)*uNight,ow*(1.-smoothstep(1.,3.,gw))); }
  diffuseColor.rgb=gA;`,"roughnessFactor=gR;","totalEmissiveRadiance+=gE;",null,fn(.35)),J=new e.Mesh(new e.PlaneGeometry(1,1).rotateX(-Math.PI/2),ee);J.position.y=-.06,J.receiveShadow=!0,J.frustumCulled=!1,L.add(J);let we=`
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
  }`,se=W(new e.MeshStandardMaterial({roughness:1,metalness:0}),we,"transformed.y+=pitH(position.xz);",`
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
    #endif`,fn(.9)),Le=new e.Mesh(new e.PlaneGeometry(150,110,150,110).rotateX(-Math.PI/2),se);Le.receiveShadow=!0,L.add(Le);let be=(M,Q=.7,T=0,A)=>new e.MeshStandardMaterial({color:M,roughness:Q,metalness:T,...A?{emissive:A}:{}}),ye={yel:be(15774218,.5,.1),dark:be(1842204,.85),glass:be(1450540,.15,.4),white:be(15328991,.55),conc:be(12038824,.9),grey:be(8223607,.6,.3),orange:be(15229980,.5),blue:be(2775720,.6),ply:be(12613434,.8),rust:be(8010524,.9),green:be(2242602,.9),lamp:new e.MeshBasicMaterial({color:16777215}),drum:be(14210252,.4,.3)},k=(M,Q,T,A,S=0,re=0,Ne=0,lt)=>{let zt=new e.Mesh(new e.BoxGeometry(M,Q,T),A);return zt.position.set(S,re,Ne),zt.castShadow=zt.receiveShadow=!0,(lt||L).add(zt),zt},de=(M,Q,T,A,S,re,Ne,lt="z")=>{let zt=new e.CylinderGeometry(M,M,Q,14);lt==="z"?zt.rotateX(Math.PI/2):lt==="x"&&zt.rotateZ(Math.PI/2);let Ot=new e.Mesh(zt,T);return Ot.position.set(A,S,re),Ot.castShadow=!0,Ne.add(Ot),Ot},G=new e.Matrix4,R=new e.Quaternion,Ae=new e.Vector3,he=new e.Vector3,pe=new e.Vector3(0,1,0),le=new e.Vector3(1e-4,1e-4,1e-4),U=(M,Q,T)=>{let A=Math.min(1,Math.max(0,(M-Q)/(T-Q)));return A*A*(3-2*A)},ie=[],Ce=new e.InstancedMesh(new e.IcosahedronGeometry(1,1),be(2044692,.95),ie.length);Ce.castShadow=Ce.receiveShadow=!0,L.add(Ce);{let M=[];for(let T=-75;T<75;T+=3)M.push([T+1.5,-55,0],[T+1.5,55,0]);for(let T=-55;T<55;T+=3)M.push([-75,T+1.5,1]),T>-32&&T<-6||T>18&&T<42||M.push([75,T+1.5,1]);let Q=new e.InstancedMesh(new e.BoxGeometry(3,1.8,.08).translate(0,.9,0),ye.green,M.length);M.forEach(([T,A,S],re)=>{G.compose(Ae.set(T,0,A),R.setFromAxisAngle(pe,S?Math.PI/2:0),he.set(1,1,1)),Q.setMatrixAt(re,G)}),Q.castShadow=!0,L.add(Q)}let ke=[new e.PointLight(16773336,0,90,1.6),new e.PointLight(16773336,0,90,1.6)];ke[0].position.set(-30,14,-10),ke[1].position.set(30,14,10),ke.forEach(M=>L.add(M));let{exA:$e,exB:Qe,trucks:ae,dozer:Ke,pump:De,mixers:qe,crane:ze,crew:P,towers:h,roofs:D}=Ir({THREE:e,group:L,D:Rt}),te=44,Z=[];for(let M=-28;M<=28;M+=8)for(let Q=-16;Q<=16;Q+=8)Z.push([M,Q]);let ge=new e.InstancedMesh(new e.BoxGeometry(.75,1,.75).translate(0,.5,0),ye.conc,Z.length);ge.castShadow=ge.receiveShadow=!0,L.add(ge);let Je=[[-12,-4,8,6],[14,5,6,6]].map(([M,Q,T,A])=>{let S=k(T,1,A,ye.conc,M,-Rt,Q);return S.geometry.translate(0,.5,0),S}),Te=[];for(let M=-28;M<28;M+=8)for(let Q=-18;Q<18;Q+=9)Te.push([M+4,Q+4.5]);let rt=new e.InstancedMesh(new e.BoxGeometry(7.8,.35,8.8),ye.ply,Te.length);rt.castShadow=rt.receiveShadow=!0,L.add(rt);let We={},Xe=new e.Vector3,St=new e.Color,jt=new e.Color,bt=h[0].material.color.clone(),Ie=e.MathUtils.degToRad(.1),E=e.MathUtils.degToRad(2.5),Be=7,Ue=80,He=40,nt=.45,vt=.09,_e=[[86,-420],[86,-30],[74,-24],[40,-25.5],[-20,-25.5],[-44,-25.5],[-50,0],[-44,25.5],[-10,25.5],[40,25.5],[74,30],[86,36],[86,420]],Dt=_e.slice(1).map((M,Q)=>{let T=Math.hypot(M[0]-_e[Q][0],M[1]-_e[Q][1]);return{L:T,T:T/(T>200?12:4.5)}}),kt=Dt.reduce((M,Q)=>M+Q.T,0),tt=(M,Q)=>{let T=M*kt,A=0;for(;A<Dt.length-1&&T>Dt[A].T;)T-=Dt[A].T,A++;let S=Math.min(1,T/Dt[A].T),re=_e[A],Ne=_e[A+1];return Q.set(re[0]+(Ne[0]-re[0])*S,0,re[1]+(Ne[1]-re[1])*S),Math.atan2(-(Ne[1]-re[1]),Ne[0]-re[0])},Nt=new e.Vector3,Bt=new e.Vector3(1,0,0),Wt=(M,Q,T)=>{Nt.subVectors(T,Q);let A=Nt.length();M.position.copy(Q).add(T).multiplyScalar(.5),M.scale.set(A,1,1),M.quaternion.setFromUnitVectors(Bt,Nt.normalize())},Ye=new e.Vector3,Pt=new e.Vector3,ft=new e.Vector3,s=Array.from({length:te},()=>({x:0,y:0,z:0,yaw:0})),u=-1,K=-1,V=new e.Vector3,d=new e.Vector3,oe=new e.Vector3(0,1,0),f=M=>Da(l,c,M,400,V,d);function Y({g:M,t:Q,hour:T}){for(let fe in C){let Ge=Math.min(1,(performance.now()-C[fe])/w);b[fe].value=Ge*Ge*(3-2*Ge),Ge>=1&&delete C[fe]}let A=M,{sinE:S,el:re,az:Ne}=ka(T,We),lt=Math.round(.5*(re+E+Math.sqrt((re-E)**2+4e-4))/Ie)*Ie,zt=Math.round(Ne/Ie)*Ie;Xe.set(Math.cos(lt)*Math.sin(zt),Math.sin(lt),-Math.cos(lt)*Math.cos(zt));let Ot=U(S,-.1,.12),At=1-Ot,Ft=1-U(S,.05,.5);b.uSunL.value.copy(Xe),b.uNight.value=U(-S,-.02,.12),b.uT.value=Q,b.uG.value=M,b.uProg.value=A,b.uWork.value=b.uNight.value*U(A,.03,.06),l.color.setRGB(1,.93-Ft*.25,.85-Ft*.45),l.intensity=3.2*U(S,-.02,.1),f(Xe),o.color.copy(St.setRGB(.42,.58,1).lerp(jt.setRGB(.06,.07,.12),At)),o.groundColor.setRGB(.42*Ot+.02,.34*Ot+.02,.24*Ot+.03),o.intensity=.6+.95*Ot;let p=b.uWork.value;ke.forEach(fe=>fe.intensity=140*p),h[0].material.color.copy(bt).multiplyScalar(p),h.forEach(fe=>fe.visible=p>.002),b.uClear.value=U(A,0,.07),b.uDig.value=U(A,.07,.36),b.uPile.value=U(A,.08,.24)*(1-U(A,.3,.46))*.9+.1*U(A,.3,.46),b.uBack.value=U(A,.8,.93),ie.forEach(([fe,Ge,Me],Ve)=>{let $=1-U(A,.005+Ve*.004,.02+Ve*.004);G.compose(Ae.set(fe,Me*.55+1.6,Ge),R.setFromAxisAngle(pe,Ve),$>.01?he.set(Me*$,Me*.55*$,Me*$):le),Ce.setMatrixAt(Ve,G)}),Ce.instanceMatrix.needsUpdate=!0;let H=A>.06&&A<.42,ce=-32+b.uDig.value*76;[[$e,-13,-1],[Qe,13,1]].forEach(([fe,Ge,Me],Ve)=>{fe.g.visible=H||Ve===1&&A>.8&&A<.95;let $=(Q/Be+Ve*.37)%1,Se=U($,.35,.55)*(1-U($,.7,.95));fe.up.rotation.y=Se*Me*1.9,fe.boom.rotation.z=e.MathUtils.lerp(.35-U($,0,.3)*.55,.62,Se),fe.stick.rotation.z=-e.MathUtils.lerp(1.05+U($,.05,.33)*.9,.9-U($,.55,.68)*.5,Se);let Lt=Ve===1&&A>.8?40:Math.min(26,Math.max(-28,ce-6));fe.g.position.set(Lt,Ve===1&&A>.8?-1:-Rt*U(A,.07,.12),Ge),fe.g.rotation.y=0}),ae.forEach((fe,Ge)=>{let Me=(Q/kt+Ge/ae.length)%1;fe.g.visible=A>.07&&A<.46,fe.g.rotation.y=tt(Me,fe.g.position),fe.load.visible=Me>.5});{let fe,Ge,Me=0,Ve=!0,$;A<.1?($=Q/Ue,fe=-60+Math.abs($%1*2-1)*110,Ge=-40+Math.floor($)%4*20):A>.3&&A<.44?($=Q/He,fe=-26+Math.abs($%1*2-1)*52,Ge=-12+Math.floor($)%3*12,Me=-Rt):A>.86?($=Q/He,fe=-60+Math.abs($%1*2-1)*40,Ge=40):Ve=!1,Ke.visible=Ve,Ve&&(Ke.position.set(fe,Me,Ge),Ke.rotation.y=$%1<.5?0:Math.PI)}let Oe=Math.min(7,Math.max(0,Math.floor((A-.47)/.028+.5))),ve=A>.455&&A<.69;if(De.g.visible=ve,qe.forEach(fe=>fe.g.visible=ve),ve){let fe=-32+Math.floor(Oe/2)*16+8,Ge=Oe%2?9.5:-9.5;De.g.position.set(fe,0,-29),Ye.set(fe,3.2,-29),ft.set(fe+Math.sin(Q*nt)*3,-Rt+3.5,Ge+Math.cos(Q*nt*.8)*2),Pt.copy(Ye).lerp(ft,.45),Pt.y=16,Wt(De.s1,Ye,Pt),Wt(De.s2,Pt,ft),Wt(De.hose,ft,Ae.copy(ft).setY(-Rt+.2)),[De.s1,De.s2,De.hose].forEach(Me=>Me.visible=!0),qe.forEach((Me,Ve)=>{Me.g.position.set(fe+12+Ve*11,0,-29),Me.d.rotation.x=Q*3+Ve})}else[De.s1,De.s2,De.hose].forEach(fe=>fe.visible=!1);{let fe=U(A,.4,.47),Ge=40*fe+.01;ze.g.visible=fe>.01,ze.mast.scale.y=Ge,ze.top.position.y=Ge,ze.top.visible=fe>.95;let Me=Q*vt;ze.top.rotation.y=Math.sin(Me)*1.6+Math.sin(Me*2.3)*.7;let Ve=12+(Math.sin(Q*.13)*.5+.5)*36,$=10+(Math.sin(Q*.21)*.5+.5)*22;ze.trolley.position.x=Ve,ze.line.scale.y=$,ze.line.position.y=-.8-$/2,ze.hook.position.y=-1.2-$}Z.forEach(([fe,Ge],Me)=>{let Ve=Math.floor((fe+32)/16)*2+(Ge<0?0:1),$=U(A,.47+Ve*.028+.07,.47+Ve*.028+.12);G.compose(Ae.set(fe,-Rt,Ge),R.identity(),$>.01?he.set(1,3.6*$,1):le),ge.setMatrixAt(Me,G)}),ge.instanceMatrix.needsUpdate=!0,Je.forEach((fe,Ge)=>{let Me=U(A,.56+Ge*.03,.98);fe.visible=Me>.01,fe.scale.y=Math.max(.01,13*Me)}),Te.forEach(([fe,Ge],Me)=>{let Ve=U(A,.8+(fe+28)/56*.15+Me%4*.01,.84+(fe+28)/56*.15+Me%4*.01);G.compose(Ae.set(fe,-.25,Ge),R.identity(),Ve>.5?he.set(1,1,1):le),rt.setMatrixAt(Me,G)}),rt.instanceMatrix.needsUpdate=!0;let Re=u<0?0:Math.min(.1,Math.max(0,Q-u)),yt=u<0||Math.abs(M-K)>.08;u=Q,K=M;for(let fe=0;fe<te;fe++){let Ge=Math.floor(Q/(6+6*Oa(fe*13+3))+Oa(fe*7+1)),Me=Oa(fe*31+Ge*7),Ve=Oa(fe*17+Ge*3+5),$,Se,Lt=0;if(fe<26&&A>.38&&A<.72){let ue=Math.min(7,Oe+(fe%3===0?1:0));$=-32+Math.floor(ue/2)*16+2+Me*12,Se=(ue%2?2:-17)+Ve*15,Lt=-Rt}else if(fe<26&&A>=.72){let ue=Z[(fe*7+Ge)%Z.length];$=ue[0]+(Me-.5)*3,Se=ue[1]+(Ve-.5)*3,Lt=-Rt+(A>.85&&$<0?3.75:0)}else fe<34&&H?($=ce-2+Me*8,Se=(fe%2?-1:1)*(20+Ve*4)):($=40+Me*25,Se=-40+Ve*10);let Vt=s[fe],Ee=$-Vt.x,It=Lt-Vt.y,q=Se-Vt.z,X=Math.hypot(Ee,It,q);if(yt||X>90)Vt.x=$,Vt.y=Lt,Vt.z=Se,Vt.yaw=Me*6;else if(X>.02){let ue=Math.min(X,Re*Math.min(5,Math.max(1.3,X*.5)));Vt.x+=Ee/X*ue,Vt.y+=It/X*ue,Vt.z+=q/X*ue;let Ze=Math.atan2(-q,Ee)-Vt.yaw;Ze-=Math.round(Ze/(2*Math.PI))*2*Math.PI,Vt.yaw+=Ze*Math.min(1,Re*6)}G.compose(Ae.set(Vt.x,Vt.y,Vt.z),R.setFromAxisAngle(pe,Vt.yaw),he.set(1,1,1)),P.setMatrixAt(fe,G)}return P.instanceMatrix.needsUpdate=!0,{hour:T,prog:A,sinE:S,sunL:Xe,night:b.uNight.value}}function xe(M,Q){let T=Math.max(4e3,Q*12);J.scale.set(T,1,T),J.position.x=M.x,J.position.z=M.z}let I=.05;async function _({next:M=()=>Promise.resolve(),alive:Q=()=>!0}={}){let T=await Ur();if(!Q())return null;let A=Gr(e,Nr(T,I)),S=0,re=0;try{for(let Ne of D){if(await M(),!Q())return null;S+=Tr(Ne,A),re++}}finally{for(let Ne in A)A[Ne].dispose()}return{machines:re,tris:S}}return{group:L,update:Y,follow:xe,uniforms:b,D:Rt,ready:F,readyAll:N,addShrouds:_}}var cr=Math.log,Va=(e,t,r)=>{let l=Math.min(1,Math.max(0,(e-t)/(r-t)));return l*l*(3-2*l)},Ua=17*Math.PI/180,Js=(e,t,r)=>r.set(e*Math.cos(Ua)+t*Math.sin(Ua),0,-e*Math.sin(Ua)+t*Math.cos(Ua)),dn=[{D:3900,nx:-.34,ny:.3,r:260,turn:240,v:3200,span:36,drift:50,T:7.5},{D:6800,nx:.34,ny:0,r:420,turn:-70,v:3200,span:60,drift:50,T:8.5},{D:5e3,nx:.5,ny:.55,alt:1600,hdg:172,v:1800,span:36,land:!0,drift:300,T:14},{D:7e3,nx:.75,ny:.8,alt:2300,hdg:175,v:1800,span:34,land:!0,drift:300,T:16},{D:4500,nx:-.6,ny:-.5,alt:2e3,hdg:352,v:2e3,span:36,drift:300,T:15,hi:!0},{D:14e3,nx:-.5,ny:.4,alt:9500,hdg:62,v:3e3,span:60,drift:300,T:13,hi:!0},{D:18e3,nx:.45,ny:-.3,alt:11300,hdg:258,v:3200,span:64,drift:300,T:12,hi:!0},{D:11e3,nx:-.2,ny:.6,alt:7200,hdg:128,v:2600,span:36,drift:300,T:15,hi:!0}],vn=[[-.5,0,-.12,0],[.5,0,-.12,1],[0,.03,-.52,2],[-.5,0,-.135,3],[.5,0,-.135,3],[0,.07,.02,4],[0,-.06,.06,4]],Rs=[[-.11,-.04,.14,5],[.11,-.04,.14,5]],_s=`
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
}`,Hs=`float ss2(float x,float a,float b){ return clamp((x-a)/max(b-a,1e-4),0.,1.); }
`,Es=`
varying vec3 vCol; varying float vK;
void main(){
  vec2 q=gl_PointCoord*2.-1.; float d2=dot(q,q); if(d2>1.) discard;
  float g=mix(exp(-d2*2.5)*(1.-d2),exp(-d2*40.)+.12*exp(-d2*6.)*(1.-d2),vK); // a soft dot when it is a point; hot core + halo up close
  gl_FragColor=vec4(vCol*g,1.);
}`;function mn({THREE:e,parent:t,high:r=!0}){let l=r?dn:dn.filter(k=>!k.hi),o=l.length,c=[],z=[],x=[];l.forEach((k,de)=>{for(let[G,R,Ae,he]of k.land?vn.concat(Rs):vn)c.push(de),z.push(he),x.push(G*k.span,R*k.span,Ae*k.span)});let y=new e.BufferGeometry;y.setAttribute("position",new e.BufferAttribute(new Float32Array(c.length*3),3)),y.setAttribute("aId",new e.BufferAttribute(new Float32Array(c),1)),y.setAttribute("aKind",new e.BufferAttribute(new Float32Array(z),1)),y.setAttribute("aOff",new e.BufferAttribute(new Float32Array(x),3));let m=()=>new e.Vector3,L={uC:{value:Array.from({length:8},m)},uF:{value:Array.from({length:8},()=>new e.Vector3(0,0,-1))},uA:{value:new Array(8).fill(0)},uPh:{value:l.map((k,de)=>de*.618034%1).concat(new Array(8-o).fill(0))},uT:{value:0},uProj:{value:1e3},uMin:{value:2},uMax:{value:72}},b=new e.ShaderMaterial({uniforms:L,vertexShader:_s.replace("void main(){",Hs+"void main(){"),fragmentShader:Es,transparent:!0,depthWrite:!1,depthTest:!0,blending:e.AdditiveBlending,fog:!1}),C=new e.Points(y,b);C.frustumCulled=!1,C.renderOrder=2,C.name="aircraft",t.add(C);let w=l.map((k,de)=>({spec:k,i:de,p0:m(),fwd:new e.Vector3(0,0,-1),lam0:cr(k.D),pos:m(),a:0})),n={pos:m(),look:m(),up:m(),fov:38},F=m(),N=m(),j=m(),W=m(),ne=m(),ee=(k,de)=>{let G=k*Math.PI/180;return Js(Math.sin(G),-Math.cos(G),de).normalize()};function J(k,de){for(let G of w){let R=G.spec;k(R.D,n),F.copy(n.look).sub(n.pos).normalize(),N.crossVectors(F,n.up).normalize(),j.crossVectors(N,F);let Ae=Math.tan(n.fov*Math.PI/360),he=Ae*de;if(W.copy(F).addScaledVector(N,R.nx*he).addScaledVector(j,R.ny*Ae).normalize(),G.p0.copy(n.pos).addScaledVector(W,R.r!=null?R.r:(R.alt-n.pos.y)/W.y),R.hdg!=null)ee(R.hdg,G.fwd);else{let pe=R.turn*Math.PI/180;ne.copy(j).setY(0).normalize(),G.fwd.copy(N).setY(0).normalize().multiplyScalar(Math.cos(pe)).addScaledVector(ne,Math.sin(pe)).normalize()}}}function we(k,de,G){let R=k.spec,Ae=((G/R.T+L.uPh.value[k.i]*3.7)%1+1)%1;return k.pos.copy(k.p0).addScaledVector(k.fwd,R.v*(de-k.lam0)+R.drift*(2*Ae-1)),Va(Ae,0,.07)*(1-Va(Ae,.93,1))}let se=0;function Le({lam:k,t:de,sinE:G,proj:R,pr:Ae=1}){if(se=Va(-G,-.035,.03)*(1-Va(k,cr(6e4),cr(25e4))),C.visible=se>.001,!C.visible){for(let he of w)he.a=0;return se}return L.uT.value=de,L.uProj.value=R,L.uMin.value=3*Ae,L.uMax.value=96*Ae,w.forEach((he,pe)=>{he.a=se*we(he,k,de),L.uC.value[pe].copy(he.pos),L.uF.value[pe].copy(he.fwd),L.uA.value[pe]=he.a}),se}function be(k,de,G,R){let Ae=w[k],he=we(Ae,de,G);return R.copy(Ae.pos),he}function ye(){t.remove(C),y.dispose(),b.dispose()}return{points:C,layout:J,update:Le,at:be,fleet:w,dispose:ye}}var oo=.46,_t=.4,aa=.6;function pn({THREE:e}){let t=(q,X,ue)=>new e.Vector3(q,X,ue),r=Math.PI/180,l=t(0,1,0),o=11.25,c=-52,z=17.5,x=-22,y=11.8,m=18,L=11.65,b=-.7,C=.018,w=54,n=-.745,F=-.725,N=-.66,j=-.45,W=-.9,ne=-.16,ee=25,J=.65,we=-35*r,se=.19,Le=.002,be=t(-.6543,.2642,-.7086),ye=t(.5744,-.4358,-.6929),k=2,de=t(-1,.22,-.55).normalize(),G=t(0,0,0),R=t(0,1,0).addScaledVector(de,-de.y).normalize(),Ae=G.clone().addScaledVector(de,-23).addScaledVector(R,10.4),he=Ae.clone().addScaledVector(de,60).addScaledVector(R,-9),pe=t(.0106681,.002613,.0218856),le=pe.clone().normalize(),U=pe.length(),ie=t(25.216,6.526,17.498),Ce=ie.clone().negate().normalize(),ke=Ce.clone().cross(l).normalize(),$e=ke.clone().cross(Ce),Qe=(q,X)=>t().addScaledVector(Ce,X*Math.sin(q*r)).addScaledVector($e,X*Math.cos(q*r)),ae=(q,X=t())=>X.set(0,0,0).addScaledVector(Ce,Math.cos(q*r)).addScaledVector($e,Math.sin(q*r)),Ke=q=>Math.atan2(q.dot($e),q.dot(Ce))/r,De=4,qe=480,ze=ae(De).multiplyScalar(qe),P=(q,X,ue)=>t(q,X,ue).add(ze),h=t(70,20,100),D=t(h.x,0,h.z).normalize(),te=h.clone().cross(l).normalize(),Z=(q,X)=>D.clone().multiplyScalar(q*Math.cos(X*r)).addScaledVector(l,q*Math.sin(X*r)).add(ze),ge=P(70,20,100),Je=Z(49.5,10.6),Te=Z(41.67,11.8),rt=Te.clone().sub(ze),We=rt.length();rt.normalize();let Xe=ee*r,St=Math.sin(Xe),jt=l.clone().addScaledVector(rt,-rt.y).normalize(),bt=t(),Ie=t(),E=t();{let q=st=>(bt.copy(rt).multiplyScalar(st).addScaledVector(jt,Math.sqrt(1-st*st)),E.copy(rt).multiplyScalar(We).addScaledVector(bt,-(6+J)),E.dot(bt)/E.length()-St),X=-.95,ue=.95;for(let st=0;st<60;st++){let Ze=(X+ue)/2;q(Ze)<0?X=Ze:ue=Ze}q((X+ue)/2),E.normalize().negate(),Ie.copy(ze).addScaledVector(bt,6+J)}let Be=Te.distanceTo(Ie),Ue=Te.clone().addScaledVector(E,.55*Be),He=new e.Quaternion().setFromAxisAngle(h.clone().normalize(),we),nt=(q,X)=>X.setFromAxisAngle(l,se+q*Le).premultiply(He),vt=Qe(0,o),_e=Qe(m,L),Dt=ze.clone().sub(_e).normalize(),kt=ze.clone().addScaledVector(ze.clone().negate().normalize().lerp(h.clone().normalize(),.62).normalize(),270),tt=(q,X)=>q.addScaledVector(X,-q.dot(X)).normalize(),Nt=t(-.13013639750678707,.2577593941984025,.9574051455608686),Bt=Qe(c,z),Wt=ie.clone().addScaledVector(tt(Nt.clone(),ke).add(Bt.clone().sub(ie).normalize()).normalize(),1.5),Ye=[[-1,Ae,le],[-.9,ie,Nt],[null,Wt,null],[null,Bt,null],[null,Qe(x,y),null],[null,vt,Ce.clone()],[null,_e,Dt],[null,_e.clone().addScaledVector(Dt,70),Dt],[null,kt,null],[0,ge,null],[.16,Je,null],[.34,Te,E],[_t,Ue,E],[oo,Ie,E]],Pt=Ye.length,ft=Ye.map(q=>q[1]),s=[];for(let q=0;q<Pt;q++){if(Ye[q][2]){s.push(Ye[q][2].clone());continue}let X=q>0?ft[q].clone().sub(ft[q-1]).normalize():t(),ue=q<Pt-1?ft[q+1].clone().sub(ft[q]).normalize():t();s.push(X.add(ue).normalize())}tt(s[2],ke),tt(s[9],te);let u=ft.slice(0,-1).map((q,X)=>q.distanceTo(ft[X+1])),K=new e.Curve;K.getPoint=(q,X=new e.Vector3)=>{let ue=Math.min(Math.max(q,0),1)*(Pt-1),st=Math.min(Pt-2,Math.floor(ue)),Ze=ue-st,wt=Ze*Ze,ht=wt*Ze,ct=u[st];return X.copy(ft[st]).multiplyScalar(2*ht-3*wt+1).addScaledVector(s[st],(ht-2*wt+Ze)*ct).addScaledVector(ft[st+1],3*wt-2*ht).addScaledVector(s[st+1],(ht-wt)*ct)},K.arcLengthDivisions=(Pt-1)*800;let V=K.getLengths(),d=q=>{let X=q*(V.length-1),ue=Math.floor(X);return ue>=V.length-1?V[V.length-1]:V[ue]+(V[ue+1]-V[ue])*(X-ue)},oe=ft.map((q,X)=>d(X/(Pt-1))),f=[[-1,0,U,-3e-5],[-.9,1,.0022,0],[b,5,C,0],[0,9,.075,-4e-5],[.16,10,.012,-1e-5],[.34,11,.006,0],[_t,12,.11,-1e-4],[oo,13,.04,-1e-4]],Y=[[2.181,-1],[2.781,-.9],[3.481,-.64],[4.25,-.15],[4.75,0],[8.5,.26],[10.5,.62],[13.5,.9],[15,1.12]],xe=Ca(Y),I=f.length,_=new Float64Array(I),M=new Float64Array(I),Q=new Float64Array(I),T=new Float64Array(I),A=null,S=0,re=1,Ne=q=>{let X=S,ue=re;for(let st=0;st<40;st++){let Ze=(X+ue)/2;A(Ze)<q?X=Ze:ue=Ze}return(X+ue)/2},lt=(q,X,ue)=>(q(X+ue)-q(X-ue))/(2*ue);function zt({S:q,yE:X,y1:ue,vh:st=900}){A=q,S=X,re=ue;let Ze=Y[0][0],wt=Y[Y.length-1][0];for(let ht=0;ht<I;ht++){let ct=f[ht][0];_[ht]=ct<=-1?X:Ne(ct);let Qt=1;if(ct>-1){let Pe=Ze,qt=wt;for(let gt=0;gt<50;gt++){let Jt=(Pe+qt)/2;xe(Jt)<ct?Pe=Jt:qt=Jt}Qt=lt(q,_[ht],.5)*st/Math.max(1e-9,lt(xe,(Pe+qt)/2,1e-4))}Q[ht]=f[ht][2]*Qt,T[ht]=f[ht][3]*Qt*Qt}for(let ht=0;ht<I-1;ht++){let ct=_[ht+1]-_[ht],Qt=Q[ht],Pe=Q[ht+1],qt=T[ht]*ct,gt=T[ht+1]*ct;M[ht]=(oe[f[ht+1][1]]-oe[f[ht][1]])/ct-((Qt+Pe)/2+(qt-gt)/12)}}function Ot(q){if(q<=_[0])return 0;if(q>=_[I-1])return oe[f[I-1][1]];let X=0;for(;q>_[X+1];)X++;let ue=_[X+1]-_[X],st=(q-_[X])/ue,Ze=st*st,wt=Ze*st,ht=wt*st,ct=Q[X],Qt=Q[X+1],Pe=T[X]*ue,qt=T[X+1]*ue,gt=ct*(st-wt+ht/2)+Pe*(Ze/2-2*wt/3+ht/4)+Qt*(wt-ht/2)+qt*(ht/4-wt/3)+M[X]*wt*(10-15*st+6*Ze);return oe[f[X][1]]+ue*gt}let At=[0,1,2].map(q=>sr([-1,-.9],[he.getComponent(q),G.getComponent(q)],[0,0])),Ft=q=>Yt(Tt((q+.9)/(n+.9))),p=q=>Yt(Tt((q+.9)/(N+.9))),H=q=>Yt(Tt((q-F)/(j-F))),ce=.34,Oe=_t-.005,ve=sr([-1,-.9,b,-.5,-.25,0,.16,.34,_t,oo],[38,48,w,38,31,30,30,32,42,52],[0,0,null,null,null,null,null,null,null,null]),Re=31.26,yt=be,fe=ye,Ge=k,Me=(q,X)=>{let ue=q+1,st=ue<.08?ue*ue/.16:ue-.04,Ze=Ge*(st-.06);return X.copy(yt).multiplyScalar(Re*Math.cos(Ze)).addScaledVector(fe,Re*Math.sin(Ze)).add(G)},Ve=q=>1+15*(1-Yt(Tt((q-W)/(ne-W)))),$=q=>Yt(Tt((q+.9)/.04))*(1-Yt(Tt((q-N)/.06))),Se=q=>Yt(Tt((q+.06)/.06));function Lt(q,X,ue){let st=X.length()-10;ue.multiplyScalar(Tt((st-1)/6));let Ze=$(q),wt=Se(q);return Ze>0&&ue.addScaledVector(ke,-Ze*ue.dot(ke)),wt>0&&ue.addScaledVector(te,-wt*ue.dot(te)),ue}let Vt=t(),Ee=t();function It(q,X,ue,st){let Ze=Math.min(Math.max(q,-1),oo),wt=Ze<=-1?_[0]:Ze>=oo?_[I-1]:Ne(Ze),ht=Ot(wt);if(K.getPoint(K.getUtoTmapping(0,Math.max(0,Math.min(V[V.length-1],ht))),X),Ze<=-.9)ue.set(At[0](Ze),At[1](Ze),At[2](Ze));else if(Ze>=j)ue.copy(ze);else{let Qt=Ft(Ze),Pe=X.length(),qt=Math.log(Pe+(Math.sqrt(Math.max(0,Pe*Pe-100))-Pe)*Qt),gt=H(Ze),Jt=Math.exp(qt+(Math.log(ze.distanceTo(X))-qt)*gt);Ze>=N?ue.copy(ze).sub(X).normalize().multiplyScalar(Jt).add(X):ue.copy(X).add(ae(p(Ze)*Ke(Ee.copy(ze).sub(X)),Ee).multiplyScalar(Jt))}let ct=Yt(Tt((Ze-ce)/(Oe-ce)));return ct>0&&ue.lerp(Vt.copy(X).addScaledVector(E,40),ct),st&&st.set(0,1,0),ve(Ze)}return{toSun:de,EARTH:G,MARS:ze,C0:Ae,L0:he,P1:ie,H2:Te,EN1:bt,ENP:Ie,LCA:E,PN:ke,QN:te,CA:oo,E0:_t,E1:aa,MOON_R:Re,layout:zt,spaceCam:It,moonAt:Me,marsFar:Ve,marsQ:nt,drift:Lt}}var $s=.45,Do=(e,t,r)=>Yt(Tt((e-t)/(r-t)));function ur(e,t,r){if(!(r<1))return t;let l=1-(1-$s)*Do(e,-.86,-.74),o=Math.min(2.2,(1.12/r)**l),c=Do(e,-1,-.9);return 2*Math.atan(Math.tan(t*Math.PI/360)*(1+c*(o-1)))*180/Math.PI}function fr(e,t){let r=1-Do(t,.6,.8);if(r<=0)return 0;let l=Do(e,-1,-.93)*(1-Do(e,-.84,-.74)),o=Do(e,.5,.6)*(1-Do(e,.88,.98));return r*(.2*l+.14*o)}function gn({high:e=!0,rockets:t=!0}={}){let r=(()=>{let n=7;return()=>(n=n*16807%2147483647)/2147483647})(),l=[62,132,204],o=8,c={land:[[55,-150],[15,-168]],build:[-25,-100]},z=[{x:0,z:0,r:20,bt:.02,kind:"hub"}],x=[];for(let n=0;n<4;n++){let F=Math.PI/8+n*Math.PI/2;z.push({x:Math.cos(F)*96,z:Math.sin(F)*96,r:15,bt:.26+n*.08,kind:"outer"}),x.push({a:F,r0:19,len:62,y:2.6,radius:2.4,bt:.12+n*.07})}let y=(n,F)=>Math.abs(((n-F)%(Math.PI*2)+Math.PI*3)%(Math.PI*2)-Math.PI),m=[],L=[];for(let n=34;n<238;n+=14){let F=n*.11;for(;F<n*.11+Math.PI*2-.05;){let N=Math.min(6.6,2.6+r()*3.2+5*Math.exp(-n/70)),j=Math.cos(F)*n,W=Math.sin(F)*n,ne=[...Array(o)].some((we,se)=>y(F,se*Math.PI/4)*n<N+4),ee=n<86&&x.some(we=>y(F,we.a)*n<N+3.5);if(!(ne||ee||l.some(we=>Math.abs(n-we)<N+3.5)||z.some(we=>Math.hypot(j-we.x,W-we.z)<we.r+N+3))&&r()>.1){let we=.06+n/238*.58+r()*.08;n>175&&r()<.28?L.push({x:j,z:W,w:8+r()*4,d:5,h:2.5+r()*2.5,rot:F,bt:we}):m.push({x:j,z:W,r:N,ys:.72+r()*.35,rot:r()*6.28,bt:we,seed:r()*50})}F+=(2*N+2.6)/n}}let b=[...m].sort((n,F)=>n.bt-F.bt);e||b.forEach((n,F)=>n.skip=F%2===1),t&&b.forEach(n=>{(c.land.some(([F,N])=>Math.hypot(n.x-F,n.z-N)<n.r+16)||Math.hypot(n.x-c.build[0],n.z-c.build[1])<n.r+30)&&(n.skip=!0)});let C=(n,F)=>{let N=Math.sin(n*.1271+F*.3117+1.7)*43758.5453;return N-Math.floor(N)};m.forEach(n=>{let F=C(n.x,n.z);n.type=F<.26?0:F<.56?1:F<.8?2:3,n.h=n.r*n.ys});let w=[];for(let n=262;n<345;n+=4.2)for(let F=.25;F<1.35;F+=3.2/n)w.push({x:Math.cos(F)*n,z:Math.sin(F)*n,bt:.22+(n-262)/83*.22+(F-.25)*.12});return{units:"m, colony space (+y up); bt = build start in city progress 0..1",rings:l.map(n=>({r:n,bt:.02+n/236*.55})),avenues:[...Array(o)].map((n,F)=>({a:F*Math.PI/4,r0:20,r1:250,bt:0})),domes:z,tubes:x,habs:m.filter(n=>!n.skip),fabs:L,solar:{r0:262,r1:345,a0:.25,a1:1.35,panel:[3,2.2],tilt:.5,cells:w},oldPad:{x:Math.cos(-.55)*300,z:Math.sin(-.55)*300,r:26},ships:c.land.map(([n,F])=>({x:n,z:F})),buildPad:{x:c.build[0],z:c.build[1],r:16.5,tower:{x:c.build[0]-12,z:c.build[1]+10}}}}var po=`
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
`,xn=`
float habLit(float h, float j){ float t0 = 0.03 + 0.6 * fract(h * 13.7 + j); return smoothstep(t0, t0 + 0.04, night) * (0.55 + 0.45 * night); }
`,ra=xn,zo=`#include <lights_fragment_maps>
  iblIrradiance *= 1. - 0.9 * night; radiance *= 1. - 0.9 * night;`;function bn({THREE:e,renderer:t,sunDir:r,night:l=0}){let o=(r?r.clone():new e.Vector3(-.95,.24,-.21)).normalize(),c=new e.Scene,z=new e.SphereGeometry(10,64,32),x=new e.ShaderMaterial({side:e.BackSide,depthWrite:!1,uniforms:{sunDir:{value:o},night:{value:l}},vertexShader:"varying vec3 vD; void main(){ vD = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }",fragmentShader:`uniform vec3 sunDir; uniform float night; varying vec3 vD;
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
    }`});c.add(new e.Mesh(z,x));let y=new e.PMREMGenerator(t),m=y.fromScene(c,0,.1,100);return y.dispose(),z.dispose(),x.dispose(),m.texture.userData.renderTarget=m,m.texture}function yn({THREE:e,renderer:t,envMap:r=null,frameDetail:l="high"}={}){let o=e.Vector3,c={value:0},z={},x=[];function y(s){let u=[],K=[],V={};for(let I in s)V[I]=[];let d=new o,oe=new o,f=new o,Y=(I,_,M,Q)=>{u.push(I.x,I.y,I.z),K.push(_.x,_.y,_.z);for(let T in s){let A=s[T],S=M[T];if(typeof S=="function"&&(S=S(I,_)),S===void 0&&(S=A===1?0:[0,0,0]),A===1)V[T].push(Array.isArray(S)?S[Q]:S);else{let re=Array.isArray(S[0])?S[Q]:S;for(let Ne=0;Ne<A;Ne++)V[T].push(re[Ne]||0)}}},xe={tri(I,_,M,Q={},T=null,A=null){d.subVectors(_,I),oe.subVectors(M,I),f.crossVectors(d,oe).normalize();let S=[0,1,2];T&&f.dot(T)<0&&(S=[0,2,1],f.negate());let re=[I,_,M];for(let Ne of S)Y(re[Ne],A?A[Ne]:f,Q,Ne)},quad(I,_,M,Q,T={},A=null){xe.tri(I,_,M,T,A),xe.tri(I,M,Q,T,A)},box(I,_,M,Q,T,A,S={},re=!0){let Ne=new e.BoxGeometry(Q,T,A);Ne.translate(I,_,M),xe.geo(Ne,S,re?lt=>lt.y<-.5:null),Ne.dispose()},geo(I,_={},M=null,Q=!1){let T=I.index?I.toNonIndexed():I,A=T.attributes.position,S=T.attributes.normal,re=new o,Ne=new o,lt=new o,zt=new o,Ot=new o,At=new o;for(let Ft=0;Ft<A.count;Ft+=3)re.fromBufferAttribute(A,Ft),Ne.fromBufferAttribute(A,Ft+1),lt.fromBufferAttribute(A,Ft+2),zt.fromBufferAttribute(S,Ft),Ot.fromBufferAttribute(S,Ft+1),At.fromBufferAttribute(S,Ft+2),!(M&&M(zt.clone().add(Ot).add(At).normalize()))&&(Q?(d.subVectors(Ne,re),oe.subVectors(lt,re),f.crossVectors(d,oe).normalize(),Y(re,f,_,0),Y(Ne,f,_,1),Y(lt,f,_,2)):(Y(re,zt,_,0),Y(Ne,Ot,_,1),Y(lt,At,_,2)));T!==I&&T.dispose()},build(){let I=new e.BufferGeometry;I.setAttribute("position",new e.Float32BufferAttribute(u,3)),I.setAttribute("normal",new e.Float32BufferAttribute(K,3));for(let _ in s)I.setAttribute(_,new e.Float32BufferAttribute(V[_],s[_]));return I.computeBoundingSphere(),I.computeBoundingBox(),I}};return xe}let m=s=>(s.index?s.index.count:s.attributes.position.count)/3,L=(s=>()=>(s=s*16807%2147483647)/2147483647)(11);function b(s){let u=new e.IcosahedronGeometry(1,s-1),K=(1+Math.sqrt(5))/2;u.applyQuaternion(new e.Quaternion().setFromUnitVectors(new o(-1,K,0).normalize(),new o(0,1,0)));let V=u.attributes.position,d=[],oe=new Map,f=[],Y=new Map,xe=I=>{let _=`${Math.round(I.x*1e4)},${Math.round(I.y*1e4)},${Math.round(I.z*1e4)}`,M=oe.get(_);return M===void 0&&(M=f.length,f.push(I.clone()),oe.set(_,M)),M};for(let I=0;I<V.count;I+=3){let _=[0,1,2].map(T=>{let A=new o().fromBufferAttribute(V,I+T);return Math.abs(A.y)<1e-4&&(A.y=0),A}),M=_[0].clone().add(_[1]).add(_[2]).divideScalar(3);if(M.y<=1e-4)continue;new o().subVectors(_[1],_[0]).cross(new o().subVectors(_[2],_[0])).dot(M)<0&&_.reverse();let Q=_.map(xe);d.push({v:_,c:M});for(let T=0;T<3;T++){let A=Q[T],S=Q[(T+1)%3],re=A<S?A+"_"+S:S+"_"+A;Y.has(re)||Y.set(re,[A,S])}}return u.dispose(),{faces:d,verts:f,edges:[...Y.values()]}}function C(s,u,K,V,d,oe,f,Y,xe=!1){let I=u.clone().multiplyScalar(V),_=K.clone().multiplyScalar(V),M=_.clone().sub(I).normalize(),Q=I.clone().add(_).normalize(),T=new o().crossVectors(M,Q).normalize(),A=new o().crossVectors(T,M).normalize(),S=xe?[A.clone().multiplyScalar(-f).addScaledVector(T,d),A.clone().multiplyScalar(oe),A.clone().multiplyScalar(-f).addScaledVector(T,-d)]:[A.clone().multiplyScalar(-f).addScaledVector(T,d),A.clone().multiplyScalar(oe).addScaledVector(T,d*.5),A.clone().multiplyScalar(oe).addScaledVector(T,-d*.5),A.clone().multiplyScalar(-f).addScaledVector(T,-d)];for(let re=0;re<S.length-1;re++)s.quad(I.clone().add(S[re]),_.clone().add(S[re]),_.clone().add(S[re+1]),I.clone().add(S[re+1]),Y,S[re].clone().add(S[re+1]))}function w(s,u,K,V,d,oe,f=4){let Y=u.clone().normalize(),xe=Y.clone().multiplyScalar(K-.004),I=new o(0,1,0);Math.abs(Y.y)>.9&&I.set(1,0,0),I.cross(Y).normalize();let _=Y.clone().cross(I),M=Y.clone().multiplyScalar(K+d),Q=L()*6.28,T=[...Array(f)].map((A,S)=>{let re=Q+S/f*Math.PI*2;return xe.clone().addScaledVector(I,Math.cos(re)*V).addScaledVector(_,Math.sin(re)*V)});for(let A=0;A<f;A++)s.tri(T[A],T[(A+1)%f],M,oe,Y)}let n=(s,u)=>s.clone().add(new o(L()-.5,L()-.5,L()-.5).multiplyScalar(u)).normalize(),F=[[1,0,0],[0,1,0],[0,0,1]];function N(s,u,K){return s.onBeforeCompile=V=>{V.uniforms.night=c,K(V),V.fragmentShader=V.fragmentShader.replace("#include <normal_fragment_maps>",`#include <normal_fragment_maps>
        { vec3 dnx = dFdx(normal), dny = dFdy(normal); float k = min(.18, 2. * max(dot(dnx, dnx), dot(dny, dny))); roughnessFactor = sqrt(roughnessFactor * roughnessFactor + k); }`)},s.customProgramCacheKey=()=>"hab-"+u,x.push(s),s}function j(s,u,K){let V=new e.MeshDepthMaterial({depthPacking:e.RGBADepthPacking});return V.onBeforeCompile=d=>{d.vertexShader=u+po+d.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
`+K)},V.customProgramCacheKey=()=>"habdepth-"+s,V}let W=b(4),ne=.995,ee=.9,J=.985,we=s=>[1-s.y,Math.min(1,Math.abs(s.y-.36)*2.6),L()],se=y({sel:3,bary:3,kind:1}),Le=y({sel:3,bary:3,kind:1}),be=y({sel:3,bary:3,kind:1}),ye=y({sel:3,bary:3,kind:1}),k=s=>s.clone().normalize(),de=(s,u)=>s.clone().addScaledVector(u,1).normalize(),G=[[.5,.5,0],[0,.5,.5],[.5,0,.5]];W.faces.forEach(s=>{let u=s.v.map(f=>s.c.clone().lerp(f,ee).multiplyScalar(ne)),K=we(s.c),V=n(s.c.clone().normalize(),.03).sub(s.c.clone().normalize());se.tri(u[0],u[1],u[2],{sel:K,bary:F,kind:0},s.c,u.map(k)),Le.tri(u[0],u[1],u[2],{sel:K,bary:F,kind:0},s.c,u.map(f=>de(k(f),V)));let d=[[0,1],[1,2],[0,2]].map(([f,Y])=>u[f].clone().add(u[Y]).normalize().multiplyScalar(ne*.997)),oe=[[u[0],d[0],d[2],[F[0],G[0],G[2]]],[d[0],u[1],d[1],[G[0],F[1],G[1]]],[d[2],d[1],u[2],[G[2],G[1],F[2]]],[d[0],d[1],d[2],[G[0],G[1],G[2]]]];for(let[f,Y,xe,I]of oe)be.tri(f,Y,xe,{sel:K,bary:I,kind:0},s.c,[f,Y,xe].map(k)),ye.tri(f,Y,xe,{sel:K,bary:I,kind:0},s.c,[f,Y,xe].map(_=>de(k(_),V)))});for(let s of[be,se]){let u=[[.2,0]];for(let f=0;f<=6;f++){let Y=f/6*Math.PI;u.push([.2*Math.cos(Y),.2+.2*Math.sin(Y)])}u.push([-.2,0]);let K=.7,V=1.2,d=(f,[Y,xe])=>new o(f,xe,Y);for(let f=0;f<u.length-1;f++){let Y=[(u[f][0]+u[f+1][0])/2,(u[f][1]+u[f+1][1])/2-.15];s.quad(d(K,u[f]),d(V,u[f]),d(V,u[f+1]),d(K,u[f+1]),{kind:1,bary:[.3,.3,.3]},new o(0,Y[1],Y[0]))}let oe=new o(V,.17,0);for(let f=0;f<u.length;f++)s.tri(oe,d(V,u[f]),d(V,u[(f+1)%u.length]),{kind:1,bary:[.3,.3,.3]},new o(1,0,0));s.quad(new o(V+.006,.02,.11),new o(V+.006,.02,-.11),new o(V+.006,.31,-.11),new o(V+.006,.31,.11),{kind:2,bary:[.3,.3,.3]},new o(1,0,0)),s.quad(new o(V+.01,.2,.05),new o(V+.01,.2,-.05),new o(V+.01,.27,-.05),new o(V+.01,.27,.05),{kind:3,bary:[.3,.3,.3]},new o(1,0,0)),s.quad(new o(.98,.18,.203),new o(1.06,.18,.203),new o(1.06,.26,.203),new o(.98,.26,.203),{kind:3,bary:[.3,.3,.3]},new o(0,0,1))}let R=se.build(),Ae=Le.build(),he=be.build(),pe=ye.build(),le=y({kind:1}),U=y({kind:1}),ie=l==="low";W.edges.forEach(([s,u])=>C(le,W.verts[s],W.verts[u],J,.017,.019,.014,{kind:0},ie)),W.verts.forEach(s=>w(le,s,J,.03,.03,{kind:1},ie?3:4));for(let s of[U,le]){let u=new e.CylinderGeometry(.075,.085,.05,8,1,!1);u.translate(0,J+.02,0),s.geo(u,{kind:4},oe=>oe.y<-.5,!0),u.dispose();let K=.3,V=Math.sqrt(1-K*K)*J;s.box(K,V+.17,.05,.016,.36,.016,{kind:2});let d=new e.ConeGeometry(.09,.04,9,1,!0);d.rotateX(Math.PI),d.rotateZ(-.9),d.translate(K+.03,V+.3,.05),s.geo(d,{kind:2},null,!0),d.dispose(),s.box(K,V+.36,.05,.03,.03,.03,{kind:3}),s.box(1.2/1.015+.012,.345/1.015,0,.03,.025,.06,{kind:5})}let Ce=le.build(),ke=U.build(),$e=`#ifdef HAB_FAR
      { float re = min(min(vBary.x, vBary.y), vBary.z), fw = max(fwidth(re), 1e-4), w0 = 0.046;
        float rib = mix(1. - smoothstep(w0 - .5 * fw, w0 + .5 * fw, re), min(1., 5.4 * w0), smoothstep(.6 * w0, 2.5 * w0, fw));
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(.55, .5, .44), rib * .85); habRib = rib; }
      #endif`,Qe=s=>N(new e.MeshStandardMaterial({color:16777215,roughness:.55,metalness:.08,envMap:r,envMapIntensity:.45}),s?"shell-far":"shell",u=>{u.vertexShader=`attribute vec3 sel; attribute vec3 bary; attribute float kind; varying vec3 vSel; varying vec3 vBary; varying float vKind; varying float vIh; varying float vY; varying float vFrac;
`+po+u.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
      float ih = habInstHash(), frac; vec3 hw; habType(ih, frac, hw);
      transformed *= kind < 0.5 ? step(frac, dot(hw, sel)) : habHasVest(ih);
      vSel = sel; vBary = bary; vKind = kind; vIh = ih; vY = position.y; vFrac = frac;`),u.fragmentShader=(s?`#define HAB_FAR
`:"")+`uniform float night; varying vec3 vSel; varying vec3 vBary; varying float vKind; varying float vIh; varying float vY; varying float vFrac; float habRib = 0.;
`+ra+u.fragmentShader.replace("#include <color_fragment>",`#include <color_fragment>
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
      ${$e}
      }`).replace("#include <roughnessmap_fragment>",`#include <roughnessmap_fragment>
      roughnessFactor = mix(roughnessFactor + 0.1 * (pr - 0.5), 0.22, max(solar, win));`).replace("#include <metalnessmap_fragment>",`#include <metalnessmap_fragment>
      metalnessFactor = mix(metalnessFactor, 0.55, max(solar, win));`).replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>
      totalEmissiveRadiance += vec3(1., 0.62, 0.3) * win * (0.15 + 2.6 * habLit(vIh, 0.));`).replace("#include <lights_fragment_maps>",zo)}),ae=Qe(!1),Ke=Qe(!0),De=s=>N(new e.MeshStandardMaterial({color:16777215,roughness:.05,metalness:.92,envMap:r,envMapIntensity:1.5}),s?"glass-far":"glass",u=>{u.vertexShader=`attribute vec3 sel; attribute vec3 bary; attribute float kind; varying vec3 vSel; varying vec3 vBary; varying float vIh; varying float vY;
`+po+u.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
      float ih = habInstHash(), frac; vec3 hw; habType(ih, frac, hw);
      transformed *= 1. - step(frac, dot(hw, sel));
      vSel = sel; vBary = bary; vIh = ih; vY = position.y;`),u.fragmentShader=(s?`#define HAB_FAR
`:"")+`uniform float night; varying vec3 vSel; varying vec3 vBary; varying float vIh; varying float vY; float habRib = 0.;
`+ra+u.fragmentShader.replace("#include <color_fragment>",`#include <color_fragment>
      float pr = fract(vSel.z * 23.7 + vIh * 3.3), edge = min(min(vBary.x, vBary.y), vBary.z), mull = 1. - smoothstep(0.03, 0.07, edge);
      diffuseColor.rgb = mix(mix(vec3(0.30, 0.34, 0.39), vec3(0.42, 0.33, 0.24), step(0.62, pr)), vec3(0.2, 0.19, 0.18), mull);
      ${$e}
      mull = max(mull, habRib);`).replace("#include <roughnessmap_fragment>",`#include <roughnessmap_fragment>
      roughnessFactor = mix(roughnessFactor + 0.05 * pr, 0.55, mull);
      roughnessFactor = max(roughnessFactor, 0.05 + 0.25 * smoothstep(40., 300., length(vViewPosition))); // distance floor: far facets stop sparkling`).replace("#include <metalnessmap_fragment>",`#include <metalnessmap_fragment>
      metalnessFactor = mix(metalnessFactor, 0.4, mull);`).replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>
      float on = 0.45 + 0.55 * step(0.3, fract(vIh * 11.3)), lit = 0.35 + 0.65 * step(0.38, fract(pr * 5.7 + vIh));
      totalEmissiveRadiance += vec3(1., 0.56, 0.24) * habLit(vIh, floor(pr * 4.) * 0.17) * on * lit * (1. - mull) * (0.7 + 0.9 * (1. - vY)) * 1.7;`).replace("#include <lights_fragment_maps>",zo)}),qe=De(!1),ze=De(!0);qe.userData.night=c;let P=N(new e.MeshStandardMaterial({color:12761517,roughness:.38,metalness:.55,envMap:r,envMapIntensity:.7}),"frame",s=>{s.vertexShader=`attribute float kind; varying float vKind; varying float vHs;
`+po+s.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
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
      totalEmissiveRadiance += (vKind < 4. ? vec3(1., 0.15, 0.08) : vec3(1., 0.8, 0.55)) * lamp * (0.4 + 4. * night);`).replace("#include <lights_fragment_maps>",zo)}),h=j("shell",`attribute float kind;
`,"transformed *= kind < 0.5 ? 1. : habHasVest(habInstHash());"),D=j("frame",`attribute float kind;
`,"float ih0 = habInstHash(); transformed *= kind > 1.5 && kind < 3.5 ? habHasAnt(ih0) : (kind > 4.5 ? habHasVest(ih0) : 1.);"),te=s=>{let u=[[0,.5,0],[.9,.5,0],[1,.5,1],[1.035,.47,1],[1.08,.42,2],[1.16,.29,2],[1.24,.13,2],[1.31,.03,2],[1.37,0,3]],K=[],V=[],d=[],oe=(S,re,Ne)=>{let lt=Math.sin(S*12.9898+re*78.233+Ne*37.719)*43758.5453;return lt-Math.floor(lt)};for(let S=0;S<u.length;S++)for(let re=0;re<=s;re++){let Ne=re%s,lt=Ne/s*Math.PI*2,[zt,Ot,At]=u[S],Ft=At===2?oe(Ne,S,1)-.5+.6*(Math.sin(lt*3+1.3)*.5):0,p=zt+Ft*.05,H=Math.max(0,Ot+(At===2?(oe(Ne,S,2)-.5)*.07+Ft*.03:0));K.push(Math.cos(lt)*p,H,Math.sin(lt)*p);let ce=oe(Ne,S,3),Oe=At===0?[.5+ce*.03,.42+ce*.03,.35+ce*.02]:At===1?[.36,.32,.28]:At===2?[.4+ce*.1,.18+ce*.05,.085+ce*.025]:[.38,.17,.08];V.push(...Oe)}for(let S=0;S<u.length-1;S++)for(let re=0;re<s;re++){let Ne=S*(s+1)+re,lt=Ne+s+1;d.push(Ne,Ne+1,lt,Ne+1,lt+1,lt)}let f=new e.BufferGeometry;f.setAttribute("position",new e.Float32BufferAttribute(K,3)),f.setAttribute("color",new e.Float32BufferAttribute(V,3)),f.setIndex(d),f.computeVertexNormals();let Y=f.toNonIndexed(),xe=y({color:3,kind:1}),I=Y.attributes.color,_=Y.attributes.position,M=Y.attributes.normal,Q=new o,T=new o,A=new o;for(let S=0;S<_.count;S+=3)Q.fromBufferAttribute(_,S),T.fromBufferAttribute(_,S+1),A.fromBufferAttribute(_,S+2),!(Q.distanceTo(T)<1e-6||T.distanceTo(A)<1e-6||Q.distanceTo(A)<1e-6)&&xe.tri(Q,T,A,{color:[0,1,2].map(re=>[I.getX(S+re),I.getY(S+re),I.getZ(S+re)]),kind:0},null,[0,1,2].map(re=>new o().fromBufferAttribute(M,S+re)));f.dispose(),Y.dispose();for(let S=0;S<6;S++){let re=S/6*Math.PI*2+.26;xe.box(Math.cos(re)*1,.565,Math.sin(re)*1,.03,.13,.03,{color:[.25,.24,.23],kind:1})}return xe.build()},Z=te(30),ge=te(14),Je=N(new e.MeshStandardMaterial({color:16777215,vertexColors:!0,roughness:.95,metalness:0}),"pad",s=>{s.vertexShader=`attribute float kind; varying float vKind; varying float vPY;
`+s.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
      vKind = kind; vPY = position.y;`),s.fragmentShader=`uniform float night; varying float vKind; varying float vPY;
`+s.fragmentShader.replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>
      totalEmissiveRadiance += vec3(1., 0.72, 0.42) * step(0.5, vKind) * step(0.6, vPY) * (0.3 + 5. * night);`)}),Te=(()=>{let u=[],K=[],V=[],d=[[.95,.62],[1.3,.38],[1.75,0]];d.forEach(([f,Y])=>{for(let xe=0;xe<=30;xe++){let I=xe/30*Math.PI*2;u.push(Math.cos(I)*f,.025,Math.sin(I)*f),K.push(Y)}});for(let f=0;f<d.length-1;f++)for(let Y=0;Y<30;Y++){let xe=f*31+Y,I=xe+30+1;V.push(xe,xe+1,I,xe+1,I+1,I)}let oe=new e.BufferGeometry;return oe.setAttribute("position",new e.Float32BufferAttribute(u,3)),oe.setAttribute("alpha",new e.Float32BufferAttribute(K,1)),oe.setIndex(V),oe.computeBoundingSphere(),oe})(),rt=new e.ShaderMaterial({transparent:!0,depthWrite:!1,polygonOffset:!0,polygonOffsetFactor:-2,polygonOffsetUnits:-2,uniforms:{strength:{value:.75}},vertexShader:`attribute float alpha; varying float vA; void main(){ vA = alpha;
      #ifdef USE_INSTANCING
        vec4 p = modelMatrix * instanceMatrix * vec4(position, 1.);
      #else
        vec4 p = modelMatrix * vec4(position, 1.);
      #endif
      gl_Position = projectionMatrix * viewMatrix * p; }`,fragmentShader:"uniform float strength; varying float vA; void main(){ gl_FragColor = vec4(0.06, 0.025, 0.012, vA * vA * strength); }"}),We=(()=>{let s=y({kind:1,variant:1});s.box(0,.03,0,1.04,.06,1.06,{kind:6,variant:0});let u=.42,K=12,V=[...Array(K+1)].map((f,Y)=>{let xe=Y/K*Math.PI;return[.5*Math.cos(xe),u+.58*Math.sin(xe)]}),d=(f,Y,xe)=>new o(f,xe,Y);for(let f of[-1,1])s.quad(d(-.5,.5*f,.06),d(.5,.5*f,.06),d(.5,.5*f,u),d(-.5,.5*f,u),{kind:0,variant:1},new o(0,0,f));for(let f=0;f<K;f++){let[Y,xe]=V[f],[I,_]=V[f+1],M=new o(0,(xe+_)/2-u,(Y+I)/2);s.quad(d(-.5,Y,xe),d(.5,Y,xe),d(.5,I,_),d(-.5,I,_),{kind:0,variant:1},M)}for(let f of[-1,1]){s.quad(d(.5*f,-.5,.06),d(.5*f,.5,.06),d(.5*f,.5,u),d(.5*f,-.5,u),{kind:0,variant:1},new o(f,0,0));for(let Y=0;Y<K;Y++)s.tri(d(.5*f,0,u),d(.5*f,V[Y][0],V[Y][1]),d(.5*f,V[Y+1][0],V[Y+1][1]),{kind:0,variant:1},new o(f,0,0))}s.quad(d(.506,-.32,.06),d(.506,.32,.06),d(.506,.32,.66),d(.506,-.32,.66),{kind:1,variant:1},new o(1,0,0)),s.box(.51,.69,0,.012,.03,.7,{kind:3,variant:1});for(let f of[-1,1])s.quad(d(-.44,.506*f,.24),d(.44,.506*f,.24),d(.44,.506*f,.34),d(-.44,.506*f,.34),{kind:2,variant:1},new o(0,0,f));s.quad(d(.2,.507,.06),d(.3,.507,.06),d(.3,.507,.22),d(.2,.507,.22),{kind:1,variant:1},new o(0,0,1)),s.box(-.22,1.02,0,.12,.06,.16,{kind:3,variant:1}),s.box(.12,1.015,0,.08,.05,.1,{kind:3,variant:1}),s.box(-.38,.98,.12,.04,.09,.04,{kind:3,variant:1}),s.box(.515,.74,0,.012,.025,.06,{kind:4,variant:1}),s.box(0,.43,0,1,.74,1,{kind:0,variant:2});for(let[f,Y,xe,I]of[[0,.49,1,.025],[0,-.49,1,.025],[.49,0,.025,1],[-.49,0,.025,1]])s.box(f,.83,Y,xe,.06,I,{kind:0,variant:2});s.box(-.25,.86,.1,.18,.12,.3,{kind:3,variant:2}),s.box(.05,.84,-.18,.1,.08,.12,{kind:3,variant:2});let oe=new e.PlaneGeometry(.34,.5);oe.rotateX(-Math.PI/2),oe.rotateZ(.25),oe.translate(.28,.86,.05),s.geo(oe,{kind:5,variant:2},null,!0),oe.dispose(),s.quad(d(.504,-.22,.06),d(.504,.22,.06),d(.504,.22,.56),d(.504,-.22,.56),{kind:1,variant:2},new o(1,0,0));for(let f of[-1,1])s.quad(d(-.45,.504*f,.46),d(.45,.504*f,.46),d(.45,.504*f,.6),d(-.45,.504*f,.6),{kind:2,variant:2},new o(0,0,f));return s.quad(d(-.504,-.4,.46),d(-.504,.4,.46),d(-.504,.4,.6),d(-.504,-.4,.6),{kind:2,variant:2},new o(-1,0,0)),s.box(.512,.6,0,.012,.025,.06,{kind:4,variant:2}),s.build()})(),Xe=`attribute float kind; attribute float variant;
`,St="float shv = fract(habInstHash() * 5.7) < 0.55 ? 1. : 2.; transformed *= (variant < 0.5 || abs(variant - shv) < 0.5) ? 1. : 0.;",jt=N(new e.MeshStandardMaterial({color:16777215,roughness:.62,metalness:.18,envMap:r,envMapIntensity:.5}),"shed",s=>{s.vertexShader=Xe+`varying float vKind; varying vec3 vLP; varying vec3 vSc; varying vec3 vN0;
`+po+s.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
      ${St}
      vKind = kind; vLP = position; vN0 = normal;
      #ifdef USE_INSTANCING
        vSc = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz));
      #else
        vSc = vec3(length(modelMatrix[0].xyz), length(modelMatrix[1].xyz), length(modelMatrix[2].xyz));
      #endif`),s.fragmentShader=`uniform float night; varying float vKind; varying vec3 vLP; varying vec3 vSc; varying vec3 vN0;
`+ra+s.fragmentShader.replace("#include <color_fragment>",`#include <color_fragment>
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
      totalEmissiveRadiance += vec3(1., 0.66, 0.36) * win * habLit(fract(vSc.x * 0.37 + vSc.y * 1.31), floor(m.x / 1.4) * 0.11) * (0.4 + 1.8 * bay) + vec3(1., 0.85, 0.6) * lamp * (0.4 + 4. * night);`).replace("#include <lights_fragment_maps>",zo)}),bt=j("shed",Xe,St);function Ie(s,{remap:u=0,baryMull:K=!0,color:V=9082530}={}){return N(new e.MeshStandardMaterial({color:V,roughness:.035,metalness:.9,envMap:r,envMapIntensity:1.4,transparent:!0,depthWrite:!1,emissive:16777215,emissiveIntensity:0}),s,d=>{d.vertexShader=(K?`attribute vec3 bary; varying vec3 vBary;
`:"")+`varying float vGY;
`+(`varying float vOh;
`+po)+d.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
        ${K?"vBary = bary;":""} vGY = position.y; vOh = habInstHash();`),d.fragmentShader=(K?`varying vec3 vBary;
`:"")+`uniform float night; varying float vGY;
varying float vOh;
`+ra+d.fragmentShader.replace("#include <color_fragment>",`#include <color_fragment>
        float mull = ${K?"1. - smoothstep(0.035, 0.08, min(min(vBary.x, vBary.y), vBary.z))":"0."};
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.16, 0.15, 0.14), mull);`).replace("#include <roughnessmap_fragment>",`#include <roughnessmap_fragment>
        roughnessFactor = mix(roughnessFactor, 0.5, mull);`).replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>
        totalEmissiveRadiance = emissive * vec3(1., 0.6, 0.3) * (1. - mull);
        totalEmissiveRadiance += vec3(1., 0.58, 0.26) * habLit(vOh, 0.31) * 0.22 * (1. - mull) * (1.2 - vGY);`).replace("#include <lights_fragment_maps>",zo).replace("#include <opaque_fragment>",`
        // the sun glint on near-mirror glass overflows half float (inf), which bloom/DOF smear into a hard square: cap it
        outgoingLight = min(outgoingLight, vec3(12.));
        float fr = pow(1. - clamp(abs(dot(normalize(vViewPosition), normal)), 0., 1.), 2.2);
        float lum = dot(outgoingLight, vec3(0.3, 0.59, 0.11));
        diffuseColor.a = ${u?`clamp(opacity / ${u.toFixed(3)}, 0., 1.)`:"opacity"} * clamp(max(max(mix(0.5, 1., fr), lum * 1.4), mull), 0., 1.);
        #include <opaque_fragment>`)})}let E=b(8),Be=(()=>{let s=y({kind:1});return E.edges.forEach(([u,K])=>C(s,E.verts[u],E.verts[K],1,.0042,.006,.005,{kind:0})),E.verts.forEach(u=>w(s,u,1,.009,.008,{kind:1},5)),s.build()})(),Ue=(()=>{let s=y({bary:3});return E.faces.forEach(u=>{let K=u.v.map(oe=>u.c.clone().lerp(oe,.97).multiplyScalar(.994)),V=u.c.clone().normalize(),d=n(V,.02).sub(V);s.tri(K[0],K[1],K[2],{bary:F},u.c,K.map(oe=>oe.clone().normalize().add(d).normalize()))}),s.build()})(),He=new e.SphereGeometry(.975,28,10,0,Math.PI*2,0,Math.PI/2),nt=(()=>{let s=y({color:3,kind:1}),u=(V,d,oe=!0)=>{s.geo(V,d,f=>f.y<-.5,oe),V.dispose()};{let V=new e.CircleGeometry(.985,40);V.rotateX(-Math.PI/2),V.translate(0,.004,0),u(V,{color:[.5,.43,.36]})}let K=[[.62,.05],[.48,.1],[.34,.15]];K.forEach(([V,d])=>{let oe=new e.CylinderGeometry(V,V*1.02,d,28);oe.translate(0,d/2,0),u(oe,{color:(f,Y)=>Y.y>.5?[.16+L()*.05,.22+L()*.05,.07]:[.62,.57,.5]})});{let V=new e.CylinderGeometry(.065,.085,.6,10);V.translate(0,.3,0),u(V,{color:[.82,.8,.76]})}for(let V of[.24,.36,.48]){let d=new e.CylinderGeometry(.083-V*.03,.083-V*.03,.035,10,1,!0);d.translate(0,V,0),u(d,{color:[.05,.05,.06],kind:1})}for(let V=0;V<7;V++){let d=V/7*Math.PI*2+.3,oe=.78+V%2*.06,f=.08+V%3*.05,Y=Math.cos(d)*oe,xe=Math.sin(d)*oe,I=new e.BoxGeometry(.11,f,.09);I.rotateY(-d),I.translate(Y,f/2,xe),u(I,{color:[.84,.82,.78]});let _=new e.BoxGeometry(.114,.02,.094);_.rotateY(-d),_.translate(Y,f*.62,xe),u(_,{color:[.05,.05,.06],kind:1})}for(let V=0;V<44;V++){let d=V%3,[oe,f]=K[d],Y=(d===2?.12:K[d+1][0]+.03)+L()*(oe-(d===2?.16:K[d+1][0]+.06)),xe=L()*6.28,I=.018+L()*.016,_=new e.IcosahedronGeometry(I,0);_.scale(1,1.4,1),_.translate(Math.cos(xe)*Y,f+I*1.2,Math.sin(xe)*Y);let M=L();s.geo(_,{color:[.12+M*.08,.2+M*.08,.06]},null,!0),_.dispose()}return s.build()})(),vt=(()=>{let s=y({color:3});{let u=new e.CylinderGeometry(1.03,1.03,.03,64,1,!0);u.translate(0,.015,0),s.geo(u,{color:[.4,.36,.31]}),u.dispose()}{let u=new e.RingGeometry(.99,1.03,64);u.rotateX(-Math.PI/2),u.translate(0,.03,0),s.geo(u,{color:[.48,.42,.35]}),u.dispose()}{let u=new e.CylinderGeometry(1.035,1.11,.026,64,1,!0);u.translate(0,.013,0),s.geo(u,{color:()=>[.42+L()*.06,.2+L()*.03,.09]}),u.dispose()}return s.build()})(),_e=N(new e.MeshStandardMaterial({color:14209220,roughness:.34,metalness:.6,envMap:r,envMapIntensity:.7}),"lattice",s=>{s.vertexShader=`attribute float kind; varying float vKind;
`+s.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
      vKind = kind;`),s.fragmentShader=`uniform float night; varying float vKind;
`+s.fragmentShader.replace("#include <color_fragment>",`#include <color_fragment>
      diffuseColor.rgb *= vKind > 0.5 ? 0.6 : 1.;`).replace("#include <lights_fragment_maps>",zo)}),Dt=N(new e.MeshStandardMaterial({color:16777215,vertexColors:!0,roughness:.85,metalness:.05}),"interior",s=>{s.vertexShader=`attribute float kind; varying float vKind;${` varying float vOh;
`+po}
`+s.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
      vKind = kind; vOh = habInstHash();`),s.fragmentShader=`uniform float night; varying float vKind; varying float vOh;
`+ra+s.fragmentShader.replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>
      totalEmissiveRadiance += vec3(1., 0.66, 0.36) * step(0.5, vKind) * (0.2 + 3.2 * habLit(vOh, 0.31));`)}),kt=new e.MeshStandardMaterial({color:16777215,vertexColors:!0,roughness:.95});x.push(kt);function tt(){let s=new e.Group;s.name="bigDome";let u=new e.Mesh(Be,_e);u.name="lattice",u.castShadow=u.receiveShadow=!0,u.customDepthMaterial=new e.MeshDepthMaterial({depthPacking:e.RGBADepthPacking});let K=new e.Mesh(nt,Dt);K.name="interior",K.castShadow=K.receiveShadow=!0;let V=new e.Mesh(vt,kt);V.name="base",V.receiveShadow=!0;let d=new e.Mesh(Te,rt);d.name="skirt",d.scale.set(.9,1,.9),d.renderOrder=-1,u.add(K,V,d);let oe=Ie("bigglass",{remap:.28}),f=new e.Mesh(Ue,oe);f.name="glass",f.receiveShadow=!0,f.castShadow=!0;let Y=new e.MeshDepthMaterial({depthPacking:e.RGBADepthPacking,alphaHash:!0,opacity:0,side:e.DoubleSide});f.customDepthMaterial=Y;let xe=0;Object.defineProperty(oe,"opacity",{get:()=>xe,set:M=>{xe=M,Y.opacity=.45*Math.min(1,Math.max(0,M/.28))},configurable:!0}),oe.opacity=0;let I=new e.MeshBasicMaterial({color:16751184,transparent:!0,opacity:0,side:e.BackSide,blending:e.AdditiveBlending,depthWrite:!1});I.onBeforeCompile=M=>{M.uniforms.night=c,M.vertexShader=`varying float vGY; varying float vOh;
`+po+M.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
vGY = position.y; vOh = habInstHash();`),M.fragmentShader=`uniform float night; varying float vGY; varying float vOh;
`+xn+M.fragmentShader.replace("#include <color_fragment>",`#include <color_fragment>
diffuseColor.rgb *= 2.6 * (0.35 + 1.1 * (1. - vGY)) * habLit(vOh, 0.31) / max(night, 0.02);`)},I.customProgramCacheKey=()=>"hab-bigglow";let _=new e.Mesh(He,I);return _.name="glow",s.add(u,f,_),s}let Nt=16,Bt=(()=>{let s=new e.CylinderGeometry(2.4,2.4,1,Nt,1,!0).rotateZ(Math.PI/2).translate(.5,0,0),u=s.toNonIndexed();return s.dispose(),u.computeVertexNormals(),u.computeBoundingSphere(),u})(),Wt=Ie("tube",{baryMull:!1,color:8227478});Wt.emissive.setRGB(1.6,1.6,1.6);let Ye=(()=>{let s=y({kind:1}),u=16,K=.11/62,V=oe=>oe/Nt*Math.PI*2,d=(oe,f,Y)=>new o(oe,f*Math.sin(Y),f*Math.cos(Y));for(let oe=0;oe<=u;oe++){let f=Math.min(1-K,Math.max(K,oe/u)),Y=2.53,xe=2.41;for(let I=0;I<Nt;I++){let _=V(I),M=V(I+1),Q=(_+M)/2,T=d(0,1,Q);s.quad(d(f-K,Y,_),d(f+K,Y,_),d(f+K,Y,M),d(f-K,Y,M),{kind:0},T),s.quad(d(f-K,xe,_),d(f+K,xe,_),d(f+K,xe,M),d(f-K,xe,M),{kind:0},T.clone().negate());for(let A of[-1,1])s.quad(d(f+A*K,xe,_),d(f+A*K,Y,_),d(f+A*K,Y,M),d(f+A*K,xe,M),{kind:0},new o(A,0,0))}if(oe%2===0||oe===u)for(let I of[-1.1,1.1])s.box(f,-2.52,I,K*5,.16,.7,{kind:3})}s.box(.5,-1.8,0,1,.12,3.1,{kind:1});for(let oe of[-1.42,1.42])s.box(.5,-1.72,oe,1,.04,.08,{kind:2});for(let oe of[-2.1,2.1])s.box(.5,-1.05,oe,1,.08,.08,{kind:0});return s.build()})(),Pt=N(new e.MeshStandardMaterial({color:13814462,roughness:.4,metalness:.55,envMap:r,envMapIntensity:.7}),"rib",s=>{s.vertexShader=`attribute float kind; varying float vKind;
`+s.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
      vKind = kind;`),s.fragmentShader=`uniform float night; varying float vKind;
`+s.fragmentShader.replace("#include <color_fragment>",`#include <color_fragment>
      diffuseColor.rgb *= vKind > 0.5 && vKind < 1.5 ? vec3(0.55, 0.5, 0.45) : (vKind > 2.5 ? vec3(0.45, 0.4, 0.36) : vec3(1.));`).replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>
      totalEmissiveRadiance += vec3(1., 0.72, 0.45) * step(1.5, vKind) * (1. - step(2.5, vKind)) * (0.2 + 3. * night);`).replace("#include <lights_fragment_maps>",zo)});[R,Ae,he,pe,Ce,ke,Z,ge,Te,We,Bt,Ye,Be,Ue,nt,vt].forEach(s=>s.computeBoundingSphere()),Object.assign(z,{habShell:m(R),habGlass:m(Ae),habFrame:m(Ce),ringPad:m(Z),skirt:m(Te),shed:m(We),tube:m(Bt),rib:m(Ye),bigDome:{lattice:m(Be),glass:m(Ue),glow:m(He),interior:m(nt),base:m(vt)}});function ft(s){[...x,Wt].forEach(u=>{"envMap"in u&&u!==kt&&u!==Je&&u!==Dt&&(u.envMap=s,u.needsUpdate=!0)})}return{night:c,tris:z,setEnv:ft,habShellGeo:R,habShellMat:ae,habShellDepthMat:h,habShellGeoHi:he,habShellMatFar:Ke,habGlassGeo:Ae,habGlassMat:qe,habGlassGeoHi:pe,habGlassMatFar:ze,habFrameGeo:Ce,habFrameMat:P,habFrameDepthMat:D,habFrameGeoFar:ke,ringPadGeo:Z,ringPadGeoFar:ge,ringPadMat:Je,skirtGeo:Te,skirtMat:rt,bigDome:tt,shedGeo:We,shedMat:jt,shedDepthMat:bt,tubeGeo:Bt,tubeMat:Wt,ribGeo:Ye,ribMat:Pt}}var so={x:0,y:-6e3,z:0},hr=.1,Ht={land:[[55,-150],[15,-168]],build:[-25,-100]},wn=`
float h3(vec3 p){p=fract(p*0.3183099+.1);p*=17.0;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float n3(vec3 x){vec3 i=floor(x);vec3 f=fract(x);f=f*f*(3.0-2.0*f);
return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),
mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n3(p);p*=2.03;a*=.5;}return v;}`;function Mn({THREE:e,renderer:t,scene:r,cam:l,planets:o,sunLight:c,ambient:z,hemi:x,files:y,HIGH:m,lateRockets:L,lodPath:b}){let C=new e.Vector3(so.x,so.y,so.z),w=y.dtmN||512,n=new e.Group;n.position.copy(C),n.visible=!1,r.add(n),c.castShadow=!0;{let pe=c.shadow,le=pe.camera;pe.mapSize.set(m?4096:2048,m?2048:1024),pe.bias=-5e-4,pe.normalBias=.35,le.left=-390,le.right=390,le.near=60,le.far=1300}r.fog=new e.Fog(0,1e8,1e9);let F=(()=>{let pe=7;return()=>(pe=pe*16807%2147483647)/2147483647})(),N=new e.Vector3,j=0,W=null,ne=null,ee=Promise.all([import("./rockets-NJ46RRYQ.js"),import("./foot-model-starship-KKNUMIYN.js"),import("./foot-model-kit-2C76GDRH.js")]).then(([pe,le,U])=>ne={createRockets:pe.createRockets,foot:{buildStarships:le.buildStarships,mergeAll:U.mergeAll,steel:{STEEL_FLAT:le.STEEL_FLAT,steelUniforms:le.steelUniforms,steelShader:le.steelShader}}}).catch(pe=>console.warn("film rockets:",pe)),J={tDtm:{value:null},tHi:{value:null},tCtx:{value:null},uOn:{value:new e.Vector3(0,0,0)},uHB0:{value:0},tMars:o.mars.material.uniforms.tMap},we=o.air&&o.air.uniforms.dome||{uSun:{value:new e.Vector3(0,1,0)},uK:{value:1},uAmb:{value:1},uOrigin:{value:C.clone()}},se=[0,0,0],Le=500;{let pe=(le,U,ie)=>{let Ce=new e.DataTexture(new Uint8Array([le,U,ie,255]),1,1);return Ce.needsUpdate=!0,Ce};J.tDtm.value=pe(128,0,0),J.tHi.value=pe(128,128,128),J.tCtx.value=pe(128,128,128)}function be(pe){let le=new e.WebGLRenderTarget(4,1,{depthBuffer:!1,minFilter:e.NearestFilter,magFilter:e.NearestFilter,generateMipmaps:!1}),U=new e.ShaderMaterial({uniforms:{tDtm:{value:pe}},toneMapped:!1,depthTest:!1,depthWrite:!1,vertexShader:"void main(){ gl_Position=vec4(position.xy,0.,1.); }",fragmentShader:`uniform sampler2D tDtm; void main(){ float k=floor(gl_FragCoord.x); vec2 o=vec2(mod(k,2.),floor(k*.5));
      vec2 uv=(vec2(${w/2-.5})+o)/${w}.; gl_FragColor=texture2D(tDtm,vec2(uv.x*.5+.5,uv.y)); }`}),ie=new e.Mesh(new e.PlaneGeometry(2,2),U),Ce=new e.Scene;ie.frustumCulled=!1,Ce.add(ie);let ke=new Uint8Array(16),$e=t.getRenderTarget();t.setRenderTarget(le),t.render(Ce,l),t.readRenderTargetPixels(le,0,0,4,1,ke),t.setRenderTarget($e),le.dispose(),U.dispose(),ie.geometry.dispose();let Qe=Ke=>(ke[Ke*4]*256+ke[Ke*4+1])/65535;return-2664.712+352.3924*(((Qe(0)+Qe(1))/2+(Qe(2)+Qe(3))/2)/2)}let ye=null;function k(){if(ye)return ye;let pe=t.capabilities.getMaxAnisotropy(),le=ie=>{try{t.initTexture(ie)}catch{}},U=(ie,Ce,ke)=>new Promise($e=>{if(!ie)return $e();ho(e,ie,{flipY:!0}).then(Qe=>{ke(Qe),le(Qe),se[Ce]=performance.now(),$e()},()=>$e())});return ye=Promise.all([U(y.dtm,0,ie=>{ie.colorSpace=e.NoColorSpace,ie.magFilter=ie.minFilter=e.NearestFilter,ie.generateMipmaps=!1,ie.flipY=!0,J.tDtm.value=ie,J.uHB0.value=be(ie)}),U(y.hiBump,1,ie=>{ie.colorSpace=e.NoColorSpace,ie.anisotropy=pe,J.tHi.value=ie}),U(y.ctxBump,2,ie=>{ie.colorSpace=e.NoColorSpace,ie.anisotropy=pe,J.tCtx.value=ie})])}let de=()=>{let pe=performance.now(),le=U=>U?pt(pe-U,0,Le):0;J.uOn.value.set(le(se[0]),le(se[1]),le(se[2]))};function*G(){k();let pe=`
uniform sampler2D tDtm, tHi, tCtx, tMars; uniform vec3 uOn; uniform float uHB0; // uHB0 = hB(vec2(0.)), read back once after the DTM loads
// 16-bit heights live in R (hi byte) and G (lo byte); filter by hand so the bytes never blend across a carry
float dtmTap(vec2 uv, float side){ vec2 t=vec2(uv.x*.5+side*.5, uv.y); vec4 c=texture2D(tDtm,t); return (c.r*255.*256.+c.g*255.)/65535.; }
float dtmBil(vec2 uv, float side){ vec2 p=uv*${w}.-.5, f=fract(p), i=floor(p);
  float a=dtmTap((i+vec2(.5,.5))/${w}.,side), b=dtmTap((i+vec2(1.5,.5))/${w}.,side), c=dtmTap((i+vec2(.5,1.5))/${w}.,side), d=dtmTap((i+vec2(1.5,1.5))/${w}.,side);
  return mix(mix(a,b,f.x),mix(c,d,f.x),f.y); }
float hA(vec2 p){ return -2621.547+62.5074*dtmBil(vec2(p.x/1600.+.5,.5-p.y/1600.),0.); }   // HiRISE DTM, metres (areoid)
float hB(vec2 p){ return -2664.712+352.3924*dtmBil(vec2(p.x/12000.+.5,.5-p.y/12000.),1.); } // CTX DTM
float terrH(vec2 p){
  float b=hB(p), a=hA(p), wa=1.-smoothstep(560.,780.,max(abs(p.x),abs(p.y)));
  float h=mix(b,a,wa)-uHB0;
  float d=length(p);
  return uOn.x*h*smoothstep(330.,620.,d)            // the city's graded pad eases back into the real ground
    *(1.-smoothstep(JF0,JF1,d));                      // and the far band flattens onto the sky dome's ground (no step at the mesh edge)
}`,le=`const float JF0=3300., JF1=4400.;
`;{let p=m?420:210,H=p+1,ce=9e3,Oe=ce/p,ve=new Float32Array(H*H*3),Re=new Uint32Array(p*p*6);for(let Me=0,Ve=0;Me<H;Me++){let $=-ce/2+Me*Oe;for(let Se=0;Se<H;Se++,Ve+=3)ve[Ve]=-ce/2+Se*Oe,ve[Ve+2]=$}for(let Me=0,Ve=0;Me<p;Me++)for(let $=0;$<p;$++,Ve+=6){let Se=$+H*Me,Lt=Se+H,Vt=Lt+1,Ee=Se+1;Re[Ve]=Se,Re[Ve+1]=Lt,Re[Ve+2]=Ee,Re[Ve+3]=Lt,Re[Ve+4]=Vt,Re[Ve+5]=Ee}let yt=new e.BufferGeometry;yt.setIndex(new e.BufferAttribute(Re,1)),yt.setAttribute("position",new e.BufferAttribute(ve,3)),yt.boundingSphere=new e.Sphere(new e.Vector3,ce*.7072),yt.boundingBox=new e.Box3(new e.Vector3(-ce/2,0,-ce/2),new e.Vector3(ce/2,0,ce/2));let fe=new e.MeshStandardMaterial({roughness:.95,metalness:0});fe.customProgramCacheKey=()=>"jezeroTerrain",fe.onBeforeCompile=Me=>{Object.assign(Me.uniforms,J),Object.assign(Me.uniforms,{uJSun:we.uSun,uJK:we.uK,uJAmb:we.uAmb,uJOrigin:we.uOrigin}),Me.vertexShader=le+pe+`
varying vec3 vTP; varying vec3 vTN;
`+Me.vertexShader.replace("#include <beginnormal_vertex>",`vec3 objectNormal; { vec2 p=position.xz; float e=8.;
          objectNormal=normalize(vec3(-(terrH(p+vec2(e,0.))-terrH(p-vec2(e,0.)))/(2.*e),1.,-(terrH(p+vec2(0.,e))-terrH(p-vec2(0.,e)))/(2.*e))); vTN=objectNormal; }
        #ifdef USE_TANGENT
          vec3 objectTangent = vec3( tangent.xyz );
        #endif`).replace("#include <begin_vertex>",`#include <begin_vertex>
transformed.y+=terrH(position.xz)-dot(position.xz,position.xz)/(2.*3389500.); vTP=transformed;`),Me.fragmentShader=le+pe+`
varying vec3 vTP; varying vec3 vTN;
uniform vec3 uJSun, uJOrigin; uniform float uJK, uJAmb;
`+wn+nr+`
      // greyscale orbital images -> height for shading only
      float bumpL(vec2 p){ float a=uOn.y*(1.-smoothstep(640.,790.,max(abs(p.x),abs(p.y)))), b=uOn.z*(1.-smoothstep(5000.,5900.,max(abs(p.x),abs(p.y))));
        float hb=texture2D(tCtx,vec2(p.x/12000.+.5,.5-p.y/12000.)).r, ha=texture2D(tHi,vec2(p.x/1600.+.5,.5-p.y/1600.)).r;
        return mix(.5,mix(hb,ha,a),max(a,b)); }
      // fbm with each octave faded to its mean once it nears a pixel (fw = base-octave cycles per pixel): no far shimmer
      float fbmBL(vec3 p, float fw){ float v=0.,a=.5; for(int i=0;i<5;i++){ float k=1.-smoothstep(.3,.6,fw); v+=a*(k>0.? mix(.5,n3(p),k) : .5); p*=2.03; fw*=2.03; a*=.5; } return v; }
      vec3 tA; float tR;
    `+Me.fragmentShader.replace("#include <color_fragment>",`#include <color_fragment>
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
          normal=normalize(normal+(viewMatrix*vec4(-gx*k*.1,0.,-gz*k*.1,0.)).xyz); }`)};let Ge=new e.Mesh(yt,fe);Ge.receiveShadow=!0,n.add(Ge)}let U={sunDir:{value:new e.Vector3},night:{value:0}},ie=new e.Mesh(new e.SphereGeometry(7e3,48,24),new e.ShaderMaterial({side:e.BackSide,depthWrite:!1,fog:!1,uniforms:U,vertexShader:"varying vec3 vD; void main(){ vD=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }",fragmentShader:`uniform vec3 sunDir; uniform float night; varying vec3 vD; ${wn}
  void main(){ float e=clamp(vD.y,0.,1.), sd=max(dot(vD,sunDir),0.);
    vec3 dayC=mix(vec3(0.78,0.54,0.36),vec3(0.36,0.22,0.15),pow(e,0.6));
    vec3 duskC=mix(vec3(0.2,0.14,0.13),vec3(0.015,0.015,0.03),pow(e,0.45));
    vec3 c=mix(dayC,duskC,night)+vec3(0.3,0.5,0.9)*pow(sd,22.)*(0.2+night*0.55)+vec3(0.5,0.6,0.8)*pow(sd,160.)*0.6;
    c+=vec3(0.9)*step(0.9975,h3(floor(vD*500.)))*smoothstep(0.5,1.,night)*smoothstep(0.05,0.3,e);
    gl_FragColor=vec4(c,1.); }`}));n.add(ie),yield;let Ce=[62,132,204],ke=8,$e=[[0,0,20,.02]],Qe=[];for(let p=0;p<4;p++){let H=Math.PI/8+p*Math.PI/2;$e.push([Math.cos(H)*96,Math.sin(H)*96,15,.26+p*.08]),Qe.push(H)}let ae=(p,H)=>Math.abs(((p-H)%(Math.PI*2)+Math.PI*3)%(Math.PI*2)-Math.PI),Ke=[],De=[];for(let p=34;p<238;p+=14){let H=p*.11;for(;H<p*.11+Math.PI*2-.05;){let ce=Math.min(6.6,2.6+F()*3.2+5*Math.exp(-p/70)),Oe=Math.cos(H)*p,ve=Math.sin(H)*p,Re=[...Array(ke)].some((Ge,Me)=>ae(H,Me*Math.PI/4)*p<ce+4),yt=p<86&&Qe.some(Ge=>ae(H,Ge)*p<ce+3.5);if(!(Re||yt||Ce.some(Ge=>Math.abs(p-Ge)<ce+3.5)||$e.some(([Ge,Me,Ve])=>Math.hypot(Oe-Ge,ve-Me)<Ve+ce+3))&&F()>.1){let Ge=.06+p/238*.58+F()*.08;p>175&&F()<.28?De.push({x:Oe,z:ve,w:8+F()*4,d:5,h:2.5+F()*2.5,rot:H,bt:Ge}):Ke.push({x:Oe,z:ve,r:ce,ys:.72+F()*.35,rot:F()*6.28,bt:Ge,seed:F()*50})}H+=(2*ce+2.6)/p}}let qe={night:{value:0}},ze=bn({THREE:e,renderer:t});yield;let P=yn({THREE:e,renderer:t,envMap:ze,frameDetail:"low"});yield,Ke.forEach(p=>p.col=new e.Color().setHSL(.08,.06+F()*.06,.72+F()*.16)),De.forEach(p=>p.col=new e.Color().setHSL(.07,.08,.55+F()*.15));let h=(p,H)=>p.bt-H.bt,D=[...Ke].sort(h),te=[...De].sort(h);m||D.forEach((p,H)=>p.skip=H%2===1),D.forEach(p=>{(Ht.land.some(([H,ce])=>Math.hypot(p.x-H,p.z-ce)<p.r+16)||Math.hypot(p.x-Ht.build[0],p.z-Ht.build[1])<p.r+30)&&(p.skip=!0)});let Z=D.filter(p=>!p.skip),ge=.028,Je=b?b():[];Z.forEach(p=>{let H=1/0;for(let ce of Je)H=Math.min(H,Math.hypot(ce.x-p.x,ce.y,ce.z-p.z));p.near=!Je.length||p.r/H>ge});let Te=(p,H)=>{let ce=Math.max(1,p.length),Oe=(Re,yt)=>{let fe=new e.InstancedMesh(Re,yt,ce);return fe.count=0,fe},ve={list:p,shell:Oe(H?P.habShellGeoHi:P.habShellGeo,H?P.habShellMat:P.habShellMatFar),glass:Oe(H?P.habGlassGeoHi:P.habGlassGeo,H?P.habGlassMat:P.habGlassMatFar),frame:Oe(H?P.habFrameGeo:P.habFrameGeoFar,P.habFrameMat),pad:Oe(H?P.ringPadGeo:P.ringPadGeoFar,P.ringPadMat)};return ve.shell.customDepthMaterial=P.habShellDepthMat,ve.glass.receiveShadow=ve.frame.receiveShadow=!0,ve.frame.castShadow=!1,ve.shell.castShadow=ve.shell.receiveShadow=ve.pad.castShadow=ve.pad.receiveShadow=!0,p.forEach((Re,yt)=>ve.shell.setColorAt(yt,Re.col)),ve},rt=[Te(Z.filter(p=>p.near),!0),Te(Z.filter(p=>!p.near),!1)],We=new e.InstancedMesh(P.skirtGeo,P.skirtMat,Z.length),Xe=new e.InstancedMesh(P.shedGeo,P.shedMat,De.length);Xe.customDepthMaterial=P.shedDepthMat,te.forEach((p,H)=>Xe.setColorAt(H,p.col));let St=p=>new e.Sphere(new e.Vector3(0,10,0),p),jt=rt.flatMap(p=>[p.shell,p.glass,p.frame,p.pad]);[...jt,We,Xe].forEach(p=>p.boundingSphere=St(270)),yield,n.add(...jt,We,Xe),Xe.castShadow=Xe.receiveShadow=!0;let bt=[],Ie=[],E=[];Ce.forEach(p=>{let H=[];for(let ce=0;ce<=200;ce++){let Oe=ce/200*Math.PI*2;if(H.push(new e.Vector3(Math.cos(Oe)*p,.4,Math.sin(Oe)*p)),ce%2===0)for(let ve of[-2.6,2.6])bt.push(Math.cos(Oe)*(p+ve),1.6,Math.sin(Oe)*(p+ve)),Ie.push(.04+p/236*.55+ce/200*.08)}E.push([H,.02+p/236*.55])});for(let p=0;p<ke;p++){let H=p*Math.PI/4,ce=[new e.Vector3(Math.cos(H)*20,.4,Math.sin(H)*20),new e.Vector3(Math.cos(H)*250,.4,Math.sin(H)*250)];E.push([ce,0]);for(let Oe=24;Oe<250;Oe+=4)for(let ve of[-3,3])bt.push(Math.cos(H)*Oe+Math.cos(H+1.5708)*ve,1.6,Math.sin(H)*Oe+Math.sin(H+1.5708)*ve),Ie.push(.02+Oe/250*.62)}let Be=E.map(([p,H])=>{let ce=new e.Line(new e.BufferGeometry().setFromPoints(p),new e.LineBasicMaterial({color:16756848,transparent:!0,opacity:0}));return ce.userData.bt=H,n.add(ce),ce}),Ue={g:{value:0},night:{value:0},t:{value:0}},He=(p,H)=>new e.ShaderMaterial({transparent:!0,depthWrite:!1,blending:e.AdditiveBlending,uniforms:Ue,vertexShader:p,fragmentShader:H}),nt="varying vec3 vC; varying float vA; void main(){ float d=length(gl_PointCoord-.5); gl_FragColor=vec4(vC*vA*smoothstep(.5,.05,d)*2.4,1.); }";{let p=new e.BufferGeometry;p.setAttribute("position",new e.Float32BufferAttribute(bt,3)),p.setAttribute("bt",new e.Float32BufferAttribute(Ie,1)),n.add(new e.Points(p,He("attribute float bt; uniform float g; uniform float night; varying vec3 vC; varying float vA; void main(){ vec4 mv=modelViewMatrix*vec4(position,1.); vC=vec3(1.,0.66,0.3); vA=smoothstep(bt,bt+0.025,g)*(0.15+0.85*night); gl_PointSize=clamp(520./-mv.z,1.2,6.); gl_Position=projectionMatrix*mv; }",nt)))}{let p=[],H=[];Ke.filter(Oe=>Oe.r>5).forEach(Oe=>{let ve=F();Oe.skip||(p.push(Oe.x,Oe.r*Oe.ys+.6,Oe.z),H.push(Oe.bt+.16,ve))});let ce=new e.BufferGeometry;ce.setAttribute("position",new e.Float32BufferAttribute(p,3)),ce.setAttribute("bs",new e.Float32BufferAttribute(H,2)),n.add(new e.Points(ce,He("attribute vec2 bs; uniform float g; uniform float t; uniform float night; varying vec3 vC; varying float vA; void main(){ vec4 mv=modelViewMatrix*vec4(position,1.); vC=vec3(1.,0.12,0.06); vA=step(bs.x,g)*step(0.55,fract(t*0.7+bs.y))*(0.3+0.7*night)*1.6; gl_PointSize=clamp(900./-mv.z,2.,9.); gl_Position=projectionMatrix*mv; }",nt)))}let vt=new e.SphereGeometry(1,32,14,0,Math.PI*2,0,Math.PI/2),_e=$e.map(([p,H,ce,Oe])=>{let ve=P.bigDome();return ve.position.set(p,0,H),ve.scale.setScalar(ce),n.add(ve),{g:ve,lattice:ve.getObjectByName("lattice"),glass:ve.getObjectByName("glass"),glow:ve.getObjectByName("glow"),bt:Oe}}),Dt=Qe.map((p,H)=>{let ce=new e.Group;ce.position.set(Math.cos(p)*19,2.6,Math.sin(p)*19),ce.rotation.y=-p;let Oe=new e.Mesh(P.ribGeo,P.ribMat);return Oe.castShadow=Oe.receiveShadow=!0,ce.add(new e.Mesh(P.tubeGeo,P.tubeMat),Oe),n.add(ce),{g:ce,bt:.12+H*.07}}),kt=[];for(let p=262;p<345;p+=4.2)for(let H=.25;H<1.35;H+=3.2/p)kt.push({x:Math.cos(H)*p,z:Math.sin(H)*p,bt:.22+(p-262)/83*.22+(H-.25)*.12});kt.sort(h);let tt=new e.InstancedMesh(new e.BoxGeometry(3,.1,2.2).translate(0,1.2,0),new e.MeshStandardMaterial({color:1451068,metalness:.85,roughness:.22,emissive:330260}),kt.length);tt.castShadow=tt.receiveShadow=!0,tt.boundingSphere=St(360),n.add(tt),yield;let Nt=new e.MeshStandardMaterial({color:15770458,emissive:3807744,roughness:.6}),Bt=Ke.filter(p=>p.r>4.2&&!p.skip),Wt=Bt.filter((p,H)=>H%Math.max(1,Math.floor(Bt.length/20))===3).slice(0,20).map((p,H)=>{let ce=new e.Group;ce.position.set(p.x+p.r+2,0,p.z+2);let Oe=Math.max(22,p.r*p.ys+16),ve=new e.Mesh(new e.BoxGeometry(1,Oe,1).translate(0,Oe/2,0),Nt),Re=new e.Group;return Re.position.y=Oe,Re.add(new e.Mesh(new e.BoxGeometry(30,.8,.8).translate(8,0,0),Nt),new e.Mesh(new e.BoxGeometry(3,2.2,2).translate(-6,-.8,0),Nt),new e.Mesh(new e.BoxGeometry(.08,10,.08).translate(18,-5,0),Nt)),ce.add(ve,Re),ce.traverse(yt=>{yt.isMesh&&(yt.castShadow=!0)}),n.add(ce),{g:ce,jib:Re,bt:p.bt,ph:H*1.7}}),Ye=null,Pt=(p=!0)=>Ye=ne.createRockets({THREE:e,foot:ne.foot,colony:n,envMap:ze,high:m,sites:Ht,light:p});yield,ne?Pt():ee.then(()=>{ne&&(Pt(!1),L(Ye))}),yield;let ft=Wr({THREE:e,colony:n,layout:gn({high:m,rockets:!0}),envMap:ze,high:m,arrive:hr,hideLines:Be,solar:tt}),s=-1,u=new e.Matrix4,K=new e.Quaternion,V=new e.Vector3(0,1,0),d=new e.Vector3,oe=new e.Vector3,f=new e.Quaternion,Y=new e.Color,xe=new e.Color(.78,.54,.36),I=new e.Color(.2,.14,.13),_=new e.Quaternion().setFromEuler(new e.Euler(0,0,.5)),M=(p,H)=>{let ce=0;for(;ce<p.length&&p[ce].bt<H;)ce++;return ce},Q=e.MathUtils.degToRad(.1),T=new e.Color(16773596),A=new e.Color(1,.66,.42),S=new e.Vector3,re=new e.Vector3,Ne=new e.Vector3,lt=new e.Vector3,zt=new e.Vector3,Ot=1;function At(){let p=Ye&&Ye.launch,H=p?p.light.k:0;S.copy(N),H>.001&&(zt.copy(p.light.pos),zt.y=Math.max(zt.y,4),S.lerp(zt.normalize(),pt(H,0,1))),S.y=Math.max(S.y,.035),S.normalize();let ce=Math.round(Math.asin(S.y)/Q)*Q,Oe=Math.round(Math.atan2(S.x,S.z)/Q)*Q;if(S.set(Math.cos(ce)*Math.sin(Oe),Math.sin(ce),Math.cos(ce)*Math.cos(Oe)),c.color.copy(T).lerp(A,H),c.intensity=e.MathUtils.lerp(Ot,.28*(p?p.light.i:0),H),S.equals(re))return!1;re.copy(S);let ve=c.shadow.camera,Re=390*Math.max(S.y,.06)+80;return ve.top!==Re&&(ve.top=Re,ve.bottom=-Re,ve.updateProjectionMatrix()),Da(c,C,S,600,Ne,lt),!0}function Ft(p,H,ce=p){de();let Oe=Math.min(p,1),ve=Math.max(0,(Oe-hr)/(1-hr)),Re=j=pt(ve,.35,.95),yt=e.MathUtils.lerp(.34,-.05,pt(ve,.05,1));ie.visible=!1,N.set(-Math.cos(yt),Math.sin(yt),-Math.cos(yt)*.22).normalize(),U.sunDir.value.copy(N),U.night.value=Re,Ue.g.value=ve,Ue.night.value=Re,Ue.t.value=H,qe.night.value=Re,P.night.value=Re,r.fog.color.copy(Y.copy(xe).lerp(I,Re)),r.fog.near=500,r.fog.far=4200,Ot=e.MathUtils.lerp(2.2,.1,Re),z.intensity=e.MathUtils.lerp(.5,.1,Re),x.intensity=e.MathUtils.lerp(1.5,.12,Re),x.color.copy(Y),o.air&&o.air.hemi&&o.air.hemi(x.color),P.tubeMat.emissiveIntensity=Re*.35,Ye&&Ye.update(ce,H,Re),ft.update(ve,H,Re,Oe);for(let $=0;$<Wt.length;$++){let Se=Wt[$];Se.jib.rotation.y=Se.ph+ve*46+H*.15}let fe=At();if(Math.abs(Oe-s)<1e-4)return fe;s=Oe;for(let $=0;$<rt.length;$++){let Se=rt[$],Lt=Se.list,Vt=M(Lt,ve),Ee=M(Lt,ve-.02),It=M(Lt,ve-.07);for(let q=0;q<Vt;q++){let X=Lt[q],ue=to((ve-X.bt)/.03),st=to((ve-X.bt-.02)/.06),Ze=to((ve-X.bt-.07)/.08);K.setFromAxisAngle(V,X.rot),u.compose(d.set(X.x,0,X.z),K,oe.set(X.r,ue,X.r)),Se.pad.setMatrixAt(q,u),q<Ee&&(u.compose(d.set(X.x,.45,X.z),K,oe.set(X.r*1.015,X.r*X.ys*st*1.015,X.r*1.015)),Se.frame.setMatrixAt(q,u)),q<It&&(u.compose(d.set(X.x,.45,X.z),K,oe.set(X.r,X.r*X.ys*Ze,X.r)),Se.shell.setMatrixAt(q,u),Se.glass.setMatrixAt(q,u))}Se.pad.count=Vt,Se.frame.count=Ee,Se.shell.count=Se.glass.count=It,Se.shell.instanceMatrix.needsUpdate=Se.glass.instanceMatrix.needsUpdate=Se.frame.instanceMatrix.needsUpdate=Se.pad.instanceMatrix.needsUpdate=!0}let Ge=M(Z,ve);for(let $=0;$<Ge;$++){let Se=Z[$];K.setFromAxisAngle(V,Se.rot),u.compose(d.set(Se.x,0,Se.z),K,oe.set(Se.r,to((ve-Se.bt)/.03),Se.r)),We.setMatrixAt($,u)}We.count=Ge;let Me=M(te,ve-.04);for(let $=0;$<Me;$++){let Se=te[$],Lt=to((ve-Se.bt-.04)/.07);K.setFromAxisAngle(V,-Se.rot),u.compose(d.set(Se.x,0,Se.z),K,oe.set(Se.w,Se.h*Lt,Se.d)),Xe.setMatrixAt($,u)}Xe.count=Me,We.instanceMatrix.needsUpdate=Xe.instanceMatrix.needsUpdate=!0;let Ve=M(kt,ve);for(let $=0;$<Ve;$++){let Se=kt[$],Lt=to((ve-Se.bt)/.04);u.compose(d.set(Se.x,0,Se.z),_,oe.set(1,Lt,1)),tt.setMatrixAt($,u)}return tt.count=Ve,tt.instanceMatrix.needsUpdate=!0,Be.forEach($=>$.material.opacity=pt(ve,$.userData.bt,$.userData.bt+.06)*(.15+.85*Re)),_e.forEach($=>{let Se=to((ve-$.bt)/.1),Lt=pt(ve,$.bt+.1,$.bt+.18);$.lattice.scale.set(1,Math.max(.001,Se),1),$.g.visible=Se>0,$.glass.material.opacity=Lt*.28,$.glow.material.opacity=Lt*Re*.28}),Dt.forEach($=>{let Se=to((ve-$.bt)/.08);$.g.scale.set(Math.max(.001,Se*62),1,1),$.g.visible=Se>0}),Wt.forEach($=>{let Se=Math.min(to((ve-$.bt+.08)/.04),1-to((ve-$.bt-.2)/.04));$.g.scale.set(1,Math.max(.001,Se),1),$.g.visible=Se>.01}),!0}W={build:Ft,cranes:Wt,get rockets(){return Ye}}}let R=null;function Ae(){return W?!0:(R=R||G(),R.next().done)}function he(){for(;!Ae(););}return{group:n,step:Ae,ensure:he,loadMaps:k,rockReady:ee,get api(){return W},get sun(){return N},get night(){return j},get done(){return!!W}}}var dr={grade:{exposure:-.7,contrast:1.08,saturation:.96,warmth:.12,tint:.01,lift:.005,gamma:.98,gain:1.11},lens:{bloomStrength:.89,bloomThreshold:1.26,vignette:.61,grain:.084},beats:{austin:{exposure:.11,warmth:.62},space:{exposure:1.1,warmth:-.53},marsOrbit:{exposure:.76,warmth:.09},colony:{exposure:.45,warmth:.69}}};var mr=[{pr:.75,post:0,trails:!1,shadow:1024,every:3,keep:.4},{pr:1,post:1,trails:!1,shadow:2048,every:2,keep:.6},{pr:1,post:2,trails:!0,shadow:2048,every:1,keep:1},{pr:1,post:3,trails:!0,shadow:4096,every:1,keep:1},{pr:1.25,post:3,trails:!0,shadow:4096,every:1,keep:1},{pr:1.5,post:3,trails:!0,shadow:4096,every:1,keep:1}],Sn=mr.length-1,An=14,ei=9,vr=20,ti=250,uo=40,oi=1500,ai=4e3,ri=15e3,ni=6e4,si=600,Cn=33;function Dn({high:e=!0,top:t=null,apply:r,hold:l=()=>!1,holdUp:o=()=>!1,capOK:c=()=>!1,gpu:z=()=>null}={}){let y=(typeof location<"u"?new URLSearchParams(location.search):new URLSearchParams).get("perf"),m=y==="log",L=y==="off",b=/^[0-5]$/.test(y||"")?+y:null,C=t!=null?Math.max(0,Math.min(Sn,t)):e?Sn:2,w=b??C,n=C,F=0,N=0,j=0,W=0,ne=-1e9,ee=0,J=-1,we=new Float32Array(uo),se=new Float32Array(uo),Le=0,be=0,ye=0,k=0,de=0,G={level:w,ceil:n,p90:0,steps:0,gpu:null,capped:!1},R=(...le)=>{m&&console.log("[film perf]",...le)};function Ae(le,U){le=Math.max(0,Math.min(n,le)),le!==w&&(le<w&&F-ne<ri&&(n=w-1,ee=F,ne=-1e9,R("ceiling",n)),le>w&&(ne=F),w=le,j=F+oi,W=0,Le=0,be=0,ye=0,k=0,G.steps++,R("level",le,U,"gpu",G.gpu),he())}function he(){J!==w&&(J=w,G.level=w,G.ceil=n,r(mr[w],w))}function pe(le){if(J<0&&he(),L||b!=null)return;if(F+=Math.min(le,100),le>ti){N=F,++de>=8&&w>0&&(de=0,Ae(w-1,"sustained stalls"));return}if(de=0,F-N<si)return;if(Le===uo){let Qe=we[be];Qe>vr&&ye--,Qe>Cn&&k--}else Le++;if(we[be]=le,be=(be+1)%uo,le>vr&&ye++,le>Cn&&k++,Le<uo)return;se.set(we),se.sort();let U=se[Math.floor(uo*.9)],ie=se[Math.floor(uo*.1)];G.p90=+U.toFixed(1);let Ce=c()&&ie>25&&U-ie<3;G.capped=Ce;let ke=z(),$e=ke!=null&&isFinite(ke);if(G.gpu=$e?+ke.toFixed(1):null,Ce&&!$e&&w<=C-1){W=0;return}if(k>uo*.6&&w>0&&(!$e||ke>An)){Ae(w-1,"emergency p90 "+U.toFixed(1));return}if(n<C&&F-ee>ni&&(n=C,G.ceil=n,R("ceiling lifted")),!(F<j||l())){if($e?ke>An:U>vr||ye>uo*.12){Ae(w-1,"p90 "+U.toFixed(1)+" misses "+ye+" gpu "+G.gpu+" capped "+Ce);return}w<n&&($e?ke<ei&&(Ce||ye===0&&U<17.6):ye===0&&U<17.6)&&!o()?W?F-W>ai&&Ae(w+1,"headroom p90 "+U.toFixed(1)):W=F:W=0}}return{frame:pe,LADDER:mr,get level(){return w},get ceil(){return n},get state(){return G},pin(le){le!=null&&(n=C,Ae(Math.max(0,Math.min(C,le)),"pinned"))},reset(){Le=0,be=0,ye=0,k=0,N=F}}}var ii=.14,li=.175,pr=48/157.5,Uo=[.04,.12,.32,.4],zn=.3,go=1.12,Pn=.03,Ln=.4,ci=.6,kn=-.02,ui=[[-1,-.9],[-.3,-.1],[.43,.49]],On=(e,t,r,l,o)=>xt(xt(xt(e.austin[t],e.space[t],r),e.marsOrbit[t],l),e.colony[t],o);function jl({THREE:e,host:t,section:r,scenes:l,sol:o,quality:c,files:z}){let x=c==="high",y=new URLSearchParams(location.search).get("touch"),m=!x&&(y?y==="1":matchMedia("(pointer: coarse)").matches),L=[.75,1,1.25,1.5,1.75,2],b=x?1.5:m?2:1,C=new e.WebGLRenderer({antialias:!1,powerPreference:"high-performance"});C.setPixelRatio(Math.min(devicePixelRatio,b));let w=Math.max(1,t.clientWidth),n=Math.max(1,t.clientHeight);C.setSize(w,n,!1),C.toneMapping=e.ACESFilmicToneMapping,C.toneMappingExposure=1.05,C.shadowMap.enabled=!0,C.shadowMap.type=e.PCFSoftShadowMap,C.shadowMap.autoUpdate=!1;let F=C.domElement;Object.assign(F.style,{position:"absolute",inset:"0",width:"100%",height:"100%",display:"block"}),t.insertBefore(F,t.firstChild);let N=new e.Scene;N.background=new e.Color(65795);let j=new e.PerspectiveCamera(42,w/n,.1,9e3),W=tn({THREE:e,renderer:C,scene:N,cam:j,low:!x}),{bloom:ne}=W,ee=JSON.parse(JSON.stringify(dr)),J=!1,we=()=>{let a=gt==="colony"&&ae.api&&ae.api.rockets;return a?a.launch.exp:0},se=()=>{let a=ae.api.cranes;for(let i=0;i<a.length;i++)if(a[i].g.visible)return!0;return!1};function Le(){let a=ee.grade,i=ee.lens,g=ee.beats,v=ui,B=W.look,O=W.grade;if(B&&(B.bloom=i.bloomStrength,B.threshold=i.bloomThreshold,B.vignette=i.vignette,B.grain=i.grain),!O)return;let me=pt(Pe,v[0][0],v[0][1]),dt=pt(Pe,v[1][0],v[1][1]),je=pt(Pe,v[2][0],v[2][1]),ot=a.warmth+On(g,"warmth",me,dt,je),it=a.tint;if(O.expK=2**(a.exposure+On(g,"exposure",me,dt,je)-.55*we()),ot===0&&it===0)O.wr=O.wg=O.wb=1;else{let mt=2**(.25*ot),ut=2**(-.2*it),Mt=2**(-.25*ot),Fe=1/(.2126*mt+.7152*ut+.0722*Mt);O.wr=mt*Fe,O.wg=ut*Fe,O.wb=Mt*Fe}O.contrast=a.contrast,O.saturation=a.saturation,O.lift=a.lift,O.gamma=a.gamma,O.gain=a.gain}let be=!0,ye=1,k=(()=>{let a=C.getContext(),i=a&&a.createQuery&&a.getExtension("EXT_disjoint_timer_query_webgl2"),g=new Float32Array(30),v=new Float32Array(30),B=[],O=[],me=0,dt=0,je=null,ot=null,it=!i,mt=()=>{me=0,dt=0,ot=null},ut=Fe=>{try{a.deleteQuery(Fe)}catch{}};function Mt(){if(!it)try{for(;B.length&&a.getQueryParameter(B[0],a.QUERY_RESULT_AVAILABLE);){let Fe=B.shift();if(a.getParameter(i.GPU_DISJOINT_EXT)){ut(Fe);for(let Ut of B)ut(Ut);B.length=0,mt();break}let at=a.getQueryParameter(Fe,a.QUERY_RESULT)/1e6;O.push(Fe),at>=0&&at<1e3&&(g[dt]=at,dt=(dt+1)%30,me<30&&me++,ot=null)}}catch{it=!0,mt()}}return{poll:Mt,begin(){if(!(it||je||B.length>=4))try{let Fe=O.pop()||a.createQuery();a.beginQuery(i.TIME_ELAPSED_EXT,Fe),je=Fe}catch{it=!0}},end(){if(je){try{a.endQuery(i.TIME_ELAPSED_EXT),B.push(je)}catch{it=!0}je=null}},get p90(){return it||me<20?null:(ot==null&&(v.set(g),ot=v.subarray(0,me).sort()[Math.floor(me*.9)]),ot)},reset(){mt()},dispose(){for(let Fe of[...B,...O,je])Fe&&ut(Fe);B.length=O.length=0,je=null,it=!0}}})(),de=Dn({high:x,top:m?L.length-1:null,hold:()=>Pe>_t&&Pe<.52,holdUp:()=>Po,capOK:()=>!0,gpu:()=>k.p90,apply:(a,i)=>{let g=Math.min(devicePixelRatio||1,b,m?L[i]:a.pr);C.getPixelRatio()!==g&&(C.setPixelRatio(g),W.setSize(w,n),W.resetMotion()),W.setQuality(x?a.post:Math.min(a.post,1)),be=a.trails,ca=a.every,ye=a.keep,k.reset();let v=ke.shadow,B=x?a.shadow:Math.min(a.shadow,2048);v.mapSize.x!==B&&(v.mapSize.set(B,B/2),v.map&&(v.map.dispose(),v.map=null),xo=!0);let O=ae.api&&ae.api.rockets;O&&O.setKeep&&O.setKeep(ye)}});(ne.separableBlurMaterials||[]).forEach(a=>{let i=a.uniforms.gaussianCoefficients?.value;if(!i)return;let g=i.length,v=g/2.6;for(let B=0;B<g;B++)i[B]=.39894*Math.exp(-.5*B*B/(v*v))/v});let G=pn({THREE:e}),{toSun:R,EARTH:Ae,MARS:he,C0:pe,L0:le}=G,U=sn({THREE:e,scene:N,renderer:C,toSun:R,EARTH:Ae,MOON:G.moonAt(-1,new e.Vector3),MARS:he,files:z.tex});U.moon.material.uniforms.uRelief.value=.35,U.mars.material.uniforms.uRelief.value=.4;let ie=null,Ce=on({THREE:e,scene:N,starsUrl:z.stars,milkyUrl:z.milky,milkyWayIntensity:.14}).then(a=>{ie=a}).catch(()=>{}),ke=new e.DirectionalLight(16773596,2.4);ke.position.copy(R).multiplyScalar(100);let $e=new e.AmbientLight(2240580,.35),Qe=new e.HemisphereLight(16763030,5909012,1.4);Qe.intensity=0,N.add(ke,ke.target,$e,Qe);let ae=Mn({THREE:e,renderer:C,scene:N,cam:j,planets:U,sunLight:ke,ambient:$e,hemi:Qe,files:z.jezero,HIGH:x,lateRockets:a=>Yo("colony",()=>Ko(a.group)),lodPath:()=>{let a=[];for(let i=0;i<=48;i++){let g=new e.Vector3,v=.6+(go-.6)*i/48;kt.getPoint(Bt(v),g),Ot(v,g,!0),a.push(g.sub(De))}return a}}),Ke=ae.group,De=new e.Vector3(so.x,so.y,so.z),qe=a=>{let i=document.createElement("canvas");i.width=i.height=256;let g=i.getContext("2d"),v=g.createRadialGradient(128,128,0,128,128,128);return a.forEach(([B,O])=>v.addColorStop(B,O)),g.fillStyle=v,g.fillRect(0,0,256,256),new e.CanvasTexture(i)},ze=new e.Sprite(new e.SpriteMaterial({map:qe([[0,"rgba(255,255,255,1)"],[.12,"rgba(255,236,200,0.9)"],[.35,"rgba(255,170,80,0.25)"],[1,"rgba(0,0,0,0)"]]),color:16777215,blending:e.AdditiveBlending,depthWrite:!1,transparent:!0,fog:!1}));N.add(ze);let P=()=>W.resetMotion(),h=new e.Vector3(0,4e4,0),D=hn({THREE:e,scene:N,renderer:C,sunLight:ke,hemi:Qe,ORIGIN:h,earthU:U.earth.material.uniforms,ortho:z.ortho}),te=mn({THREE:e,parent:D.group,high:x}),Z=.012,ge=10/6371e3,Je=e.MathUtils.degToRad(oa.lat),Te=(oa.lon+180)/360,rt=new e.Vector3(-Math.cos(2*Math.PI*Te)*Math.cos(Je),Math.sin(Je),Math.sin(2*Math.PI*Te)*Math.cos(Je)),We=Math.atan2(rt.z,rt.x)-Math.atan2(pe.z,pe.x),Xe=rt.clone().applyAxisAngle(new e.Vector3(0,1,0),We).multiplyScalar(10),St=Xe.clone().normalize(),jt=G.spaceCam,bt=ln({THREE:e,SITE_ROT:Fa,AUS:Xe,U_PER_M:ge,C0:pe,L0:le,spaceCam:jt}),Ie={pos:new e.Vector3,look:new e.Vector3,up:new e.Vector3},E=bt.LAMH,Be=bt.LAM1,Ue={},He={pos:new e.Vector3,look:new e.Vector3,up:new e.Vector3},nt=(a,i)=>{let g=Math.log(a),v=bt.k.yA,B=bt.k.yH;for(let O=0;O<50;O++){let me=(v+B)/2;bt.at(me,He),He.lam<g?v=me:B=me}return bt.at((v+B)/2,i)},vt=[15,0,-135],_e=(a,i,g)=>[vt[0]+a*Math.sin(i*Math.PI/180),g,vt[2]+a*Math.cos(i*Math.PI/180)],Dt=[[oo,[2200,2600,900],[-3200,0,-200],50],[.52,[1400,1500,700],[-1400,0,-300],48],[.57,[750,700,550],[-250,0,-250],46],[.62,_e(600,28,260),[15,30,-135],42],[.72,_e(500,32,190),[15,34,-135],40],[.8,_e(420,24,130),[10,38,-130],40],[.88,_e(350,15,80),[-5,44,-125],42],[1,_e(450,13,85),[-15,52,-118],45],[1.12,_e(600,14,115),[-20,60,-115],50]].map(([a,i,g,v])=>({p:a,pos:new e.Vector3(...i).add(De),look:new e.Vector3(...g).add(De),fov:v})),kt=new e.CatmullRomCurve3(Dt.map(a=>a.pos),!1,"centripetal"),tt=new e.CatmullRomCurve3(Dt.map(a=>a.look),!1,"centripetal"),Nt=Dt.map(a=>a.p),Bt=ir(kt,Nt,void 0,0),Wt=ir(tt,Nt,void 0,0),Ye=co(Nt,Dt.map(a=>a.fov),void 0,0),Pt=(()=>{let a=co([.49,.62,.88,.9,1.12],[0,.1,.8,.83,1]);return i=>i<=.49?0:i>=1.12?1:Tt(a(i))})(),ft=.83,s=new e.Vector3,u=new e.Vector3,K=new e.Vector3(Ht.build[0],0,Ht.build[1]).add(De),V=new e.Vector3;function d(a,i){let g=ae.api&&ae.api.rockets,v=g&&g.launch;if(v&&v.pos)return i.copy(v.pos);let B=Math.max(0,a-ft),O=4800*B*B*(1+4*B),me=25e-5*O*O;return i.set(Ht.build[0]-.952*me,26+O,Ht.build[1]-.305*me).add(De)}let oe=a=>Math.asin(e.MathUtils.clamp(a.y/Math.max(1e-6,a.length()),-1,1)),f=a=>Math.atan2(Math.sin(a),Math.cos(a));function Y(a,i,g,v){let B=Math.min(Math.max(a,oo),go);kt.getPoint(Bt(B),i),tt.getPoint(Wt(B),g);let O=ur(B,Ye(B),j.aspect),me=pt(v,ft+.002,ft+.045);if(me>0){let dt=e.MathUtils.degToRad(O/2),je=s.copy(g).sub(i),ot=je.length();d(v,u).sub(i);let it=oe(je),mt=oe(u),ut=oe(V.copy(K).sub(i)),Mt=.3+1.1*pt(yo,0,Ln*.6),Fe=xt(it,Math.min(Math.max(it,mt-.5*dt),ut+Mt*dt),me),at=Math.atan2(je.x,je.z),Ut=at+f(Math.atan2(u.x,u.z)-at)*.55*me;g.set(Math.cos(Fe)*Math.sin(Ut),Math.sin(Fe),Math.cos(Fe)*Math.cos(Ut)).multiplyScalar(ot).add(i)}return O}let xe=document.querySelector("[data-foot-canvas]")||document.querySelector("[data-foot]"),I=[.86,go],_=[.98,go],M=[.86,.95],Q=[1,go],T=.5,A=-.3,S=xe?(()=>{let a=Ha(0,0),i=Ha(Ht.build[0],Ht.build[1]),g=Math.atan2(i[1]-a[1],i[0]-a[0])-Math.atan2(Ht.build[1],Ht.build[0]),v=Math.cos(g),B=Math.sin(g),O=-jr(a[0],a[1]),me=(mt,ut,Mt,Fe)=>{let at=mt-a[0],Ut=Mt-a[1];return Fe.set(at*v+Ut*B,ut+O,-at*B+Ut*v).add(De)},dt=Ea(16,9),je={toCol:me,eye:me(...dt.eye,new e.Vector3),look:new e.Vector3,q:new e.Quaternion,c:0,e:1,ok:!1},ot=Math.sin(dt.sunAz),it=-Math.cos(dt.sunAz);return je.sunAz=Math.atan2(-ot*B+it*v,ot*v+it*B),je.rE=Math.hypot(je.eye.x-De.x,je.eye.z-De.z),je.aE=Math.atan2(je.eye.z-De.z,je.eye.x-De.x),je})():null,re=(a,i,g=!1)=>S&&(g||S.ok)?qo(a,i[0],i[1]):0,Ne=new e.Matrix4,lt=new e.Vector3(0,1,0);function zt(){if(!S)return;let a=xe.clientWidth,i=xe.clientHeight;if(S.ok=a>0&&i>0,!S.ok)return;let g=Ea(a,i),v=Math.tan(g.vfov*Math.PI/360);S.toCol(...g.look,S.look),Ne.lookAt(S.eye,S.look,lt),S.q.setFromRotationMatrix(Ne),S.e=2*v*n/i,S.c=v+S.e/2}function Ot(a,i,g=!1){let v=re(a,I,g);if(v<=0)return i;let B=i.x-De.x,O=i.z-De.z,me=Math.atan2(O,B),dt=xt(Math.hypot(B,O),S.rE,v),je=me+f(S.aE-me)*v;return i.set(De.x+dt*Math.cos(je),xt(i.y,S.eye.y,re(a,_,g)),De.z+dt*Math.sin(je))}let At=new e.Quaternion,Ft=new e.Vector3;function p(a,i){let g=re(a,M),v=re(a,Q);Ot(a,Ct),j.position.copy(Ct);let B=2*Math.tan(i*Math.PI/360),O=xt(xt(-fr(a,j.aspect)*B,0,g),S.c,v),me=B**(1-v)*S.e**v;d(ao,Ft).sub(Ct);let dt=oe(Ft)-Math.atan(O-me/2+T*me),je=Math.atan2(Ft.x,Ft.z);Ft.set(Math.cos(dt)*Math.sin(je),Math.sin(dt),Math.cos(dt)*Math.cos(je)).add(Ct),Ne.lookAt(Ct,Ft,lt),At.setFromRotationMatrix(Ne),j.quaternion.slerp(At,g).slerp(S.q,v),ce(O,me),jo(e.MathUtils.clamp((Ct.y-so.y)*.08,.1,30),9e3)}function H(a){let i=re(a,I);if(i<=0)return;let g=ae.sun,v=xt(Math.asin(e.MathUtils.clamp(g.y,-1,1)),A,re(a,Q)),B=Math.atan2(g.z,g.x),O=B+f(S.sunAz-B)*i;g.set(Math.cos(v)*Math.cos(O),Math.sin(v),Math.cos(v)*Math.sin(O))}function ce(a,i){let g=Math.abs(a)+i/2,v=2*g/i,B=w*v,O=n*v;j.fov=2*Math.atan(g)*180/Math.PI,j.setViewOffset(B,O,(B-w)/2,(g-a-i/2)*n/i,w,n),So=!0}let Oe=new e.Vector3(-.78,.42,.46).normalize(),ve=new e.Vector3,Re=new e.Quaternion,yt=new e.Mesh(new e.PlaneGeometry(30,30),new e.ShaderMaterial({uniforms:{uR:{value:6},uL2:{value:new e.Vector2(Oe.x,Oe.y).normalize()},uI:{value:1.5}},vertexShader:"varying vec2 vQ; void main(){ vQ = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }",fragmentShader:`uniform float uR, uI; uniform vec2 uL2; varying vec2 vQ;
    void main(){ float q = length(vQ), d = max(q / uR - 1., 0.); vec2 dir = vQ / max(q, 1e-4);
      float side = smoothstep(-0.6, 1., dot(dir, uL2));
      // a thin dusty atmosphere hugging the limb (Mars' dust haze tops out ~1% of its radius up), much stronger on the lit side:
      // a narrow warm rim, not a soft disc. The inner term sits over the geometric edge so the limb never reads as a cut-out
      float g = exp(-d * 120.) * 0.75 + exp(-d * 34.) * 0.16 + exp(-d * 9.) * 0.012;
      float edge = 1. - smoothstep(11., 15., max(abs(vQ.x), abs(vQ.y))); // fade before the plane's edge: its square never shows on black
      gl_FragColor = vec4(vec3(1.0, 0.56, 0.28) * g * side * side * uI * edge, 0.); }`,transparent:!0,depthWrite:!1,blending:e.CustomBlending,blendSrc:e.OneFactor,blendDst:e.OneFactor}));{let a=U.marsAtmo.material.uniforms;a.uBetaR.value.multiplyScalar(.25),a.uSunCol.value.set(1,.86,.66),a.uK.value=15}yt.position.copy(he),yt.renderOrder=3,yt.frustumCulled=!1,N.add(yt);function fe(a,i){G.marsQ(a,U.mars.quaternion),ve.copy(Oe).applyQuaternion(j.quaternion),U.marsAtmo.material.uniforms.uSun.value.copy(ve),Re.copy(U.mars.quaternion).invert(),U.mars.material.uniforms.uSun.value.copy(ve).applyQuaternion(Re);let g=j.position.distanceTo(Ve);yt.quaternion.copy(j.quaternion),yt.material.uniforms.uR.value=6/Math.sqrt(Math.max(.05,1-36/(g*g)))}let Ge={uPx:{value:1},uI:{value:0}},Me=new e.Points(new e.BufferGeometry().setAttribute("position",new e.BufferAttribute(new Float32Array(3),3)),new e.ShaderMaterial({uniforms:Ge,vertexShader:"uniform float uPx; void main(){ gl_PointSize = uPx; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }",fragmentShader:`uniform float uI; void main(){ vec2 q = gl_PointCoord * 2. - 1.; float r2 = dot(q, q); if (r2 > 1.) discard;
      gl_FragColor = vec4(vec3(1.0, 0.52, 0.3) * (exp(-r2 * 10.) + exp(-r2 * 3.) * 0.1) * uI, 1.); }`,transparent:!0,depthWrite:!1,blending:e.AdditiveBlending}));Me.frustumCulled=!1,Me.renderOrder=1,N.add(Me);let Ve=he.clone(),$=[U.mars,U.marsAtmo,yt];function Se(a,i){let g=i?G.marsFar(a):1;Ve.copy(he).sub(j.position).multiplyScalar(g).add(j.position),U.mars.position.copy(Ve),U.marsAtmo.position.copy(Ve),U.marsAtmo.material.uniforms.uCenter.value.copy(Ve),yt.position.copy(Ve),Me.position.copy(Ve);let v=6/Ve.distanceTo(j.position)*n/2/Math.tan(j.fov*Math.PI/360),B=i?1-pt(v,1.2,4):0;for(let O of $)O.visible=i&&v>.9;return Me.visible=B>.001,Ge.uI.value=5*B,Ge.uPx.value=9*C.getPixelRatio(),v}let Lt=[U.earth,U.clouds,U.moon,U.mars,U.earthAtmo,U.marsAtmo,yt,Me],Vt=[U.earth,U.clouds,U.moon,U.earthAtmo],Ee=null,It=a=>a.getBoundingClientRect();function q(){w=Math.max(1,t.clientWidth),n=Math.max(1,t.clientHeight);let a=It(r),i=n,g={};for(let Fe in l){if(!l[Fe])continue;let at=It(l[Fe]),Ut=l[Fe].firstElementChild,eo=Ut?It(Ut):at;g[Fe]={top:at.top-a.top,h:at.height,tc:(eo.top+eo.bottom)/2-a.top}}let v=(Fe,at=0)=>g[Fe].tc-i/2+at*i,B=(Fe,at)=>g[Fe].top+at*g[Fe].h-i/2,O=Math.max(1,a.height-i),me=w<768&&n>w?-.12:0,dt=1.9,je=(v("title",0)-v("earth",me))/i,ot=Math.min(1,je/dt),it=ot**.6,mt=Math.max(0,Math.min(Math.sqrt(ot),(je-.5*it-.15*ot)/.7)),ut=[[v("earth",me-.6),-1],[v("earth",me),-.9],[v("earth",me+.7*mt),-.64],[v("title",-.5*it),-.15],[v("title",0),0],[v("reind",0),.26],[B("colony",0),.62],[B("colony",1),.9],[O,go]];for(let Fe=1;Fe<ut.length;Fe++)ut[Fe][0]<=ut[Fe-1][0]+1&&(ut[Fe][0]=ut[Fe-1][0]+1);Ee={vh:i,yEnd:O,S:Ca(ut),sc:g};{let Fe=ut[0][0],at=O;for(let Ut=0;Ut<50;Ut++){let eo=(Fe+at)/2;Ee.S(eo)<kn?Fe=eo:at=eo}Ee.ySol=(Fe+at)/2}G.layout({S:Ee.S,yE:ut[0][0],y1:O,vh:i});let Mt=[g.austin.top-i,v("austin",0),v("austin",.5),ut[0][0]];for(let Fe=Mt.length-2;Fe>=0;Fe--)Mt[Fe]>=Mt[Fe+1]-1&&(Mt[Fe]=Mt[Fe+1]-Math.max(1,.25*i));bt.layout({yA:Mt[0],yT:Mt[1],yX:Mt[2],yE:Mt[3],S:Ee.S}),te.layout(nt,w/n),Ze(),ht(),X(),zt()}function X(){let a=r.nextElementSibling;for(;a&&(a.offsetHeight===0||getComputedStyle(a).display==="none");)a=a.nextElementSibling;let i=v=>{let B=v&&getComputedStyle(v).backgroundColor.match(/[\d.]+/g);return B&&(B.length<4||+B[3]>.5)?B:null},g=null;for(let v=a,B=0;v&&!g&&B<3;v=v.firstElementChild,B++)g=i(v);for(let v=r.parentElement;v&&!g;v=v.parentElement)g=i(v);g=g||[0,0,0],io.el=a,io.col[0]=g[0]/255,io.col[1]=g[1]/255,io.col[2]=g[2]/255}let ue=null,st=()=>w<768?24:40;function Ze(){ue=null;let a=l.title,i=a&&a.querySelector('[data-split="left"]'),g=a&&a.querySelector('[data-split="right"]');if(!i||!g)return;let v=i.parentElement;i.style.transform=g.style.transform="";let B=It(v),O=It(i),me=It(g),dt=Math.abs((O.top+O.bottom)/2-(me.top+me.bottom)/2)<O.height*.5,je=w>=768,ot=(je?li:ii)*n;if(dt){let it=me.left-O.right,mt;if(je){mt=Math.max(.05*n,Math.min(ot,it/2/(1+pr)));let ut=Math.max(0,it/2-mt*(1+pr));i.style.transform=`translate3d(${ut}px,0,0)`,g.style.transform=`translate3d(${-ut}px,0,0)`}else mt=Math.max(.05*n,Math.min(ot,(it/2-st())/1.08));ue={Ls:i,Rs:g,h2:v,x:(O.right+me.left)/2-B.left,y:(O.top+O.bottom+me.top+me.bottom)/4-B.top,r:mt}}else{let it=Math.min(ot,.4*w),mt=je?it*(1+pr):it*1.08+st(),ut=me.top-O.bottom,Mt=je?mt-ut/2:Math.max(0,mt-ut/2);i.style.transform=`translate3d(0,${-Mt}px,0)`,g.style.transform=`translate3d(0,${Mt}px,0)`,ue={Ls:i,Rs:g,h2:v,x:((O.left+O.right)/2+(me.left+me.right)/2)/2-B.left,y:(O.bottom+me.top)/2-B.top,r:it}}}let wt=null;function ht(){wt=null;let a=l.reind&&l.reind.firstElementChild;if(!a)return;let i=document.createRange();i.selectNodeContents(a);let g=0;for(let me of i.getClientRects())me.width>1&&(g=Math.max(g,me.right));let v=It(t),B=w-(g-v.left),O=Math.min(.21*n,.4*w);if(w>=768&&B>2.2*O){let me=Math.min(O,(B/2-24)/1.08);wt={x:g-v.left+B/2,y:n/2,r:me}}else{let me=It(a).height,dt=n<500?12:24,je=n/2-me/2-24-.04*n,ot=ue?ue.r*(1+zn*Uo[1]):0,it=Math.max(.05*n,Math.min(O,.16*n,je/2.38),Math.min(ot,(w>=768?.2:.16)*n));wt={x:w/2,y:Math.max(1.12*it,Math.min(.3*n,n/2-me/2-dt-1.19*it)),r:it}}}let ct=0,Qt=0,Pe=-1,qt=0,gt="site",Jt="",fi=!1,na=!0,sa=!1,Bn=!1,No=0,ia=0,la=0,Na=null,gr=0,Ia=0,xo=!0,xr=!1,bo=!1,yo=0,Io=0,Go=0,ao=0,ca=1,Po=!1,To=null,Fn=3,io={k:0,col:[0,0,0],el:null},Ga=new e.Vector3,Ta=new e.Vector3,br=new e.Vector3,ua={x:0,y:0},ro={x:0,y:0},Vn=.05,Wa=new URLSearchParams(location.search).get("touch"),fa=matchMedia("(pointer: coarse)"),ja={on:Wa?Wa==="1":fa.matches},wo=0,yr=()=>{Wa||(ja.on=fa.matches,wo=0)};fa.addEventListener?.("change",yr);let wr=a=>{ua.x=a.clientX/innerWidth-.5,ua.y=a.clientY/innerHeight-.5};addEventListener("mousemove",wr,{passive:!0});let Ct=new e.Vector3,Et=new e.Vector3,$t=new e.Vector3,Un=new e.Vector3,ha=new e.Vector3,Wo=new e.Vector3(0,1,0),Mo=new e.Vector3,Nn=new e.Color(16773596),jo=(a,i)=>{(j.near!==a||j.far!==i)&&(j.near=a,j.far=i,j.updateProjectionMatrix())},da={g:0,t:0},Lo={lam:0,t:0,sinE:1,proj:1,pr:1},qa={t:0,intro:1,camPos:Ct,spin:0,hole:St},fo={dt:0,t:0,focus:0,aperture:0,maxblur:0,ca:0},In=new e.Vector3,va={k:0,mb:0};function Xa(a){let i=ke.shadow.camera;ke.shadow.normalBias=a?.1:.35,a?(i.left=-160,i.right=160,i.top=80,i.bottom=-80,i.near=50,i.far=900,$e.intensity=.03):(i.left=-390,i.right=390,i.near=60,i.far=1300,ke.color.copy(Nn)),i.updateProjectionMatrix()}let So=!1,qo=(a,i,g)=>Yt(Tt((a-i)/(g-i)));function Gn(a,i){let g=a&&ue?qo(Pe,-.15,-.02)*(1-qo(Pe,.04,.12)):0,v=a&&wt?qo(Pe,Uo[0],Uo[1])*(1-qo(Pe,Uo[2],Uo[3])):0,B=()=>{i?(j.setViewOffset(w,n,0,i*n,w,n),So=!0):So&&(So=!1,j.clearViewOffset())};if(g<=0&&v<=0)return B();let O=Math.tan(j.fov*Math.PI/360);j.updateMatrixWorld(),Mo.copy(he).applyMatrix4(j.matrixWorldInverse);let me=Mo.length();if(Mo.z>-6.2||me<6.2)return B();let dt=Mo.x/-Mo.z/(O*j.aspect),je=Mo.y/-Mo.z/O,ot=w/2+dt*w/2,it=n/2-je*n/2,mt=Math.tan(Math.asin(6.05/me))/O*n/2,ut=ot,Mt=it-i*n,Fe=1+zn*Pe;if(g>0&&v>0){let at=Math.min(1,g+v),Ut=v/(g+v),eo=It(ue.h2),pa=It(t);mt=xt(mt,xt(ue.r,wt.r,Ut)*Fe,at),ut=xt(ut,xt(eo.left-pa.left+ue.x,wt.x,Ut),at),Mt=xt(Mt,xt(n/2,wt.y,Ut),at)}else{if(w<992&&v>0&&Pe>Uo[2]){let at=wt.r*Fe,Ut=mt-at;mt=.5*(mt+at+Math.sqrt(Ut*Ut+.01*at*at*v))}if(g>0){let at=It(ue.h2),Ut=It(t);mt=xt(mt,ue.r*Fe,g),ut=xt(ut,at.left-Ut.left+ue.x,g),Mt=xt(Mt,n/2,g)}v>0&&(mt=xt(mt,wt.r*Fe,v),ut=xt(ut,wt.x,v),Mt=xt(Mt,wt.y,v))}{let at=Math.max(6.6/me,6.05/Math.sin(Math.atan(mt*2*O/n))/me);Ct.sub(he).multiplyScalar(at).add(he),j.position.sub(he).multiplyScalar(at).add(he),j.updateMatrixWorld()}j.setViewOffset(w,n,-(ut-ot),-(Mt-it),w,n),So=!0}let lo={inCol:!1,cam:j,t:0,dt:0,alt:0,fog:N.fog,e:0};function Tn(a,i,g){let v=Tt((Pe-_t)/(aa-_t));lo.inCol=a,lo.sunDir=ae.sun,lo.night=ae.night,lo.t=i,lo.dt=g,lo.e=v,lo.fog=N.fog,lo.alt=a?j.position.y-so.y:j.position.distanceTo(he),U.entry(v,lo)}let Ka=[0,0],Xo={entry:-1,gR:-1,plume:null};function Wn(a){let i=a&&ae.api&&ae.api.rockets,g=i&&i.launch,v=a?ao:-1;Xo.entry=Pe>_t&&Pe<aa?(Pe-_t)/(aa-_t):-1,Xo.gR=v,Xo.plume=null,g&&g.base&&v>=.78&&(ha.copy(g.base).project(j),ha.z<1&&(Ka[0]=ha.x*.5+.5,Ka[1]=ha.y*.5+.5,Xo.plume=Ka)),W.lensFrame(Xo);let B=g&&g.fx,O=W.fx;B&&O&&(B.flash>O.flash&&(O.flash=B.flash),B.heat>O.heat&&(O.heat=B.heat),B.bloom>O.bloom&&(O.bloom=B.bloom))}let Mr="",Sr="",Ar=o&&o.root&&+o.root.dataset.solFrom||1,jn=o&&o.root&&+o.root.dataset.solTo||206;function qn(){if(!o||!o.root)return;let a=pt(Pe,.4,.43)*(1-pt(Pe,.57,.61)),i=pt(ct,Ee.yEnd,Ee.yEnd+.25*Ee.vh),g=pt(Pe,kn,.06)*(1-a)*(1-i),v=g.toFixed(3);v!==Sr&&(Sr=v,o.root.style.opacity=v,o.root.style.visibility=g>.005?"":"hidden");let B=Tt((ct-Ee.ySol)/Math.max(1,Ee.yEnd-1-Ee.ySol)),O=String(Ar+Math.floor((jn-Ar)*B+1e-6)).padStart(4,"0");O!==Mr&&o.value&&(Mr=O,o.value.textContent=O)}let Cr=-1,Dr="",Ya={p:0,beat:""},Xn=new CustomEvent("tf:film",{detail:Ya}),zr=()=>Pe<-.55?qt<1?"austin":"earth":Pe<.12?"mars-title":Pe<.42?"reindustrialize":Pe<.88?"colony":"launch";function Kn(a){Ee||q();let i=la,g=-It(r).top;if(na||Math.abs(g-ct)>2*Ee.vh)ct=g,Qt=0,wo=0,na=!1,P();else{let et=ct;if(ja.on){let Gt=2/Vn,Kt=Gt*a,no=1/(1+Kt+.48*Kt*Kt+.235*Kt*Kt*Kt),Qo=ct-g,Zo=(wo+Gt*Qo)*a;wo=(wo-Gt*Zo)*no,ct=g+(Qo+Zo)*no,Math.abs(ct-g)<.5&&Math.abs(wo)<20&&(ct=g,wo=0)}else window.lenis?ct=g:ct+=(g-ct)*(1-Math.exp(-a/.05));Qt=a>0?(ct-et)/a:0}ro.x+=(ua.x-ro.x)*a*2,ro.y+=(ua.y-ro.y)*a*2,bt.at(ct,Ie),qt=Ie.s,Pe=Math.min(go,Math.max(-1,Ee.S(ct))),qt<1&&(Pe=-1);let v=qt<1,B=Ie.lam;gt=v?Ie.world:Pe>=oo?"colony":"space";{let et=ct>=Ee.yEnd-2,Gt=et?Pn:yo>0?-2.5*Pn:0;Io+=(Gt-Io)*(1-Math.exp(-a/ci)),yo=Math.min(Ln,Math.max(0,yo+Io*a)),yo<=0&&Io<0&&(Io=0),Go=Pt(Pe),ao=Go+yo*pt(Go,.95,1)}io.k=pt(ct-Ee.yEnd,-.3*Ee.vh,0),qt>.6&&U.loadDeferred("moon"),Pe>-.9&&U.loadDeferred("mars"),gt==="colony"?ae.ensure():Pe>.3&&Lr();let O=gt==="colony",me=gt==="site",dt=v?0:pt(Pe,-1,-.92),je=46,ot=30;if(Wo.set(0,1,0),me){let et=Ie.dist,Gt=1-Ie.upk;$t.copy(Ie.pos),$t.x+=ro.x*3*Gt,$t.z+=ro.y*2*Gt,Ct.copy($t).add(h),Et.copy(Ie.look).add(h),Wo.copy(Ie.up),je=Ie.fov,ot=et,gr=et,jo(Math.max(.3,et*.004),et*8+3e3),da.g=Ie.g,da.hour=Ie.hour,da.t=i,Na=D.update(da);{let no=C.getPixelRatio();Lo.lam=B,Lo.t=i,Lo.sinE=Na.sinE,Lo.pr=no,Lo.proj=n*no/(2*Math.tan(e.MathUtils.degToRad(je)/2)),te.update(Lo)}D.follow($t,et),N.fog.near=1e8,N.fog.far=1e9,Qe.intensity*=1-pt(B,Math.log(3e3),Math.log(6e4));let Kt=Na.night;W.trails.enabled=x&&be&&Kt>.02,W.trails.amount=.65*Kt}else if(gt==="globe")Ct.copy(Ie.pos),Et.copy(Ie.look),je=Ie.fov,ot=Ie.dist*ge,jo(Math.min(.1,Math.max(5e-4,ot*.04)),9e3);else if(O){je=Y(Pe,Ct,Et,ao),Ct.x+=ro.x*8*dt,Ct.y-=ro.y*5*dt,ot=Ct.distanceTo(Et);let et=ae.api&&ae.api.rockets&&ae.api.rockets.launch;if(et&&et.burn>.004){ot=xt(ot,Ct.distanceTo(et.pos),pt(ao,ft,ft+.03));let Gt=et.shake*Ct.distanceTo(Et)*.0022;if(Gt>1e-4){Ga.copy(Et).sub(Ct).normalize(),Ta.crossVectors(Ga,Wo).normalize(),br.crossVectors(Ta,Ga);let Kt=Math.sin(i*31)*.6+Math.sin(i*57+1.7)*.4,no=Math.sin(i*37+.6)*.6+Math.sin(i*71+2.9)*.4;Et.addScaledVector(Ta,Kt*Gt).addScaledVector(br,no*Gt)}}jo(e.MathUtils.clamp((Ct.y-so.y)*.08,.1,30),9e3)}else je=jt(Pe,Ct,Et,Wo),je=ur(Pe,je,j.aspect),ot=xt(Ct.distanceTo(Xe),Ct.distanceTo(Et),pt(Pe,-1,-.92)),jo(.1,12e3);me||(W.trails.enabled=!1);{let et=v?pt(B,Math.log(450),Math.log(3600))*(1-pt(B,14,15.9)):0;W.motion.shutter=.6+2.4*et,W.motion.maxLen=.035+.11*et}if(W.auto.enabled=!v,v?(C.toneMappingExposure=cn(ka(Ie.hour,Ue).sinE,B),W.snapExposure()):(C.toneMappingExposure=1.05,W.auto.min=.55),gt!==Jt){D.group.visible=me,Ke.visible=O;let et=!me&&!O;Lt.forEach(Gt=>Gt.visible=et),Xa(me),W.motion.cutDist=gt==="site"||gt==="globe"?1e12:400,W.ao.enabled=me&&x,(Jt==="site"&&gt==="globe"||Jt==="")&&W.resetMotion(),Jt=gt,xo=!0,C.compile(Qa,j,N)}if(gt==="space"){let et=Pe>-.12;for(let Gt of Vt)Gt.visible=!et}let it=O?ae.sun:R,mt=O&&ae.api.build(Go,i,ao);if(O&&H(Pe),O){let et=ae.api.rockets;et&&et.setKeep&&et.keep!==ye&&(et.keep=ye,et.setKeep(ye))}if(gt!=="site"&&gt!=="globe"&&Tn(O,i,a),!O&&!me&&(N.fog.near=1e8,N.fog.far=1e9,ke.intensity=2.4,$e.intensity=.35,Qe.intensity=0),Ia++,me)(xo||ke.intensity>.01&&(gr<2500||Ia%10===0))&&(C.shadowMap.needsUpdate=!0,xo=!1);else if(O){let et=Po?Math.max(ca,Fn):ca;(xo||(mt||se())&&Ia%et===0||!Po&&mt)&&(C.shadowMap.needsUpdate=!0,xo=!1)}else ke.target.position.set(0,0,0),ke.position.copy(it).multiplyScalar(100);let ut=Ct.distanceTo(Et);v||($t.set(Math.sin(i*.21)*.6+Math.sin(i*.53+1.3)*.25,Math.sin(i*.17+2.1)*.5+Math.sin(i*.41)*.2,Math.sin(i*.13+4)*.4).multiplyScalar(ut*.002*dt),gt==="space"&&($t.x+=ro.x*2.2*dt,$t.y-=ro.y*1.4*dt,G.drift(Pe,Ct,$t)),Ct.add($t)),j.up.copy(Wo),Math.abs(j.fov-je)>5e-4&&(j.fov=je,j.updateProjectionMatrix()),j.position.copy(Ct),j.lookAt(Et),O&&re(Pe,I)>0?(p(Pe,je),ot=xt(ot,Ct.distanceTo(d(ao,Un)),re(Pe,I))):Gn(gt==="space",gt==="globe"||gt==="site"?0:fr(Pe,j.aspect)),!me&&!O&&Se(Pe,gt==="space"),qa.t=i,qa.spin=We-i*Z+(v?0:(Pe+1)*.5),U.update(qa),(gt==="space"||gt==="globe")&&Pe<-.12&&U.moon.position.copy(G.moonAt(Pe,In)),gt==="space"&&fe(i,Pe),U.mars.material.uniforms.uDomes.value=1-pt(Ct.distanceTo(he),14,30),ie&&(ie.update(Ct),ie.group.visible=!O&&!me);let Mt=gt==="globe"?Tt((B-E)/(Be-E)):1;ze.visible=!me,ze.position.copy(Ct).addScaledVector(it,1600);let Fe=Math.max(0,$t.copy(Et).sub(Ct).normalize().dot(it)),at=pt(Mt,.55,1)*(.25+Fe*.9)*(O?.22*(1-pt(ae.sun.y,.02,-.04)):0);ze.scale.setScalar(260*at+40),ze.material.opacity=Math.min(1,at*1.3),ne.strength=.6+at*.3;{let et=1-pt(ot,2,4),Gt=v?0:pt(Pe,-1,-.92),Kt=O?1:pt(Pe,_t,oo),no=O?pt(ao,ft-.01,ft+.03):0,Qo=xt(xt(4e-4,.003+.017*et,Gt),xt(.006,.0022,no),Kt),Zo=xt(xt(8e-4,.0018+.0032*et,Gt),xt(.0042,.0024,no),Kt);fo.dt=a,fo.t=i,fo.focus=ot,fo.aperture=Qo/ot,fo.maxblur=x?Zo:0,fo.ca=.012,va.k=Qo,va.mb=Zo}if(Wn(O),me&&l.austin&&l.austin.firstElementChild){let et=It(l.austin.firstElementChild),Gt=It(t),Kt=et.bottom>Gt.top&&et.top<Gt.bottom;W.scrim(((et.left+et.right)/2-Gt.left)/w,1-((et.top+et.bottom)/2-Gt.top)/n,.66*et.width/w+.05,.8*et.height/n+.07,Kt?.45*(1-Ie.upk):0)}else W.scrim(.5,.5,1,1,0);Le();let Ut=O?re(Pe,I):0;W.edge(io.k,To||io.col,xt(Math.max(.3,160/n),Math.max(.15,120/n),Ut),O?(To?.42:.3)*io.k*pt(ao,ft,ft+.05)*(1-Ut):0),W.update(fo),qn(),W.render();let eo=Tt(ct/Ee.yEnd),pa=Math.round(eo*1e4),_a=zr();(pa!==Cr||_a!==Dr)&&(Cr=pa,Dr=_a,Ya.p=eo,Ya.beat=_a,window.dispatchEvent(Xn))}let Ao=window.requestIdleCallback?(a,i=700)=>requestIdleCallback(a,{timeout:i}):a=>setTimeout(a,120),ko=300,Pr=!1;function Lr(){if(Pr||ae.done)return;Pr=!0;let a=i=>{if(!bo){if(i&&!i.didTimeout&&i.timeRemaining&&i.timeRemaining()<8)return Ao(a,ko);ae.step()?Ao(Rn,ko):Ao(a,ko)}};Ao(a,ko)}function Yn(){bo||(U.loadDeferred("mars"),ae.loadMaps(),Lr(),x&&(kr=D.addShrouds({next:()=>new Promise(a=>Ao(a,ko)),alive:()=>!bo}).catch(a=>(console.warn("TerraFirma film: no shroud.",a),null))))}let kr=null,Qn=new e.WebGLRenderTarget(4,4,{type:e.HalfFloatType}),Or=a=>new Promise(i=>setTimeout(i,a)),Zn=C.extensions.has("KHR_parallel_shader_compile"),Qa=new e.Object3D,Ko=a=>Zn?C.compileAsync(a,j,N):(C.compile(a,j,N),Promise.resolve()),ma=()=>[...Lt,ze,...ie?[ie.group]:[],...U.entryRoots()];function Yo(a,i){let g=[D.group,Ke,...ma()],v=g.map(O=>O.visible),B=C.getRenderTarget();D.group.visible=a==="site",Ke.visible=a==="colony";for(let O of ma())O.visible=a==="space";C.setRenderTarget(Qn);try{return i()}finally{g.forEach((O,me)=>O.visible=v[me]),C.setRenderTarget(B),C.compile(Qa,j,N)}}function Za(a){let i=[],g=Jt;Yo(a,()=>{a==="colony"&&ae.api.build(0,0);for(let v of a==="site"?[D.group]:a==="colony"?[Ke,...U.entryRoots()]:ma())v.traverse(B=>{i.push([B,B.visible,B.frustumCulled]),B.visible=!0,B.frustumCulled=!1});try{Xa(a==="site"),C.compile(Qa,j,N),C.shadowMap.needsUpdate=a!=="space",C.render(N,j)}finally{for(let[v,B,O]of i)v.visible=B,v.frustumCulled=O}}),g&&Xa(g==="site"),xo=!0}async function Jn(){let a=[];await Ce,Yo("site",()=>a.push(Ko(D.group))),Yo("space",()=>{for(let i of ma())a.push(Ko(i))}),await Promise.race([Promise.all(a),Or(1500)]),Za("site"),Za("space"),W.warm({fx:x})}async function Rn(){if(bo)return;let a;Yo("colony",()=>{ae.api.build(0,0);let i=[];for(let g of[Ke,...U.entryRoots()])g.traverse(v=>{i.push([v,v.visible]),v.visible=!0});try{a=Promise.all([Ko(Ke),...U.entryRoots().map(Ko)])}finally{for(let[g,v]of i)g.visible=v}}),await Promise.race([a,Or(1500)]),await new Promise(i=>Ao(i,ko)),!bo&&Jt!=="colony"&&Za("colony")}let _n=Promise.all([U.ready,D.ready,Ce]).then(()=>Jn()).then(()=>{xr=!0,Ao(Yn)}),Oo=null;function Br(){w=Math.max(1,t.clientWidth),n=Math.max(1,t.clientHeight),C.setSize(w,n,!1),W.setSize(w,n),j.aspect=w/n,j.updateProjectionMatrix(),Ee=null,So&&(So=!1,j.clearViewOffset()),de.reset()}Oo=new ResizeObserver(()=>{Br()}),Oo.observe(t),Oo.observe(r),xe&&Oo.observe(xe),document.fonts?.ready.then(()=>{Ee=null});let Ja=()=>{Ee=null};addEventListener("load",Ja);function Fr(a){if(!(!sa||!xr||bo)){a=Math.max(0,a||0),J||(la+=Math.min(a,1/15)),de.frame(a*1e3/(Po?2:1)),k.poll(),k.begin();try{Kn(Math.min(.05,a))}finally{k.end()}}}let Ra=null,Vr=a=>{if(No=requestAnimationFrame(Vr),Ra){Ra();return}let i=ia?(a-ia)/1e3:1/60;ia=a,Fr(i)};return{ready:_n,canvas:F,renderer:C,post:W,scene:N,cam:j,aircraft:te,flight:G,perf:de,get shrouds(){return kr},start(a=!1,i=null){sa||(sa=!0,Bn=a,Ra=i,na=!0,ia=0,a||(No=requestAnimationFrame(Vr)))},stop(){sa=!1,No&&(cancelAnimationFrame(No),No=0)},step:Fr,resize:Br,relayout:Ja,setOverlap(a){Po=!!a},setSeam(a){To=a&&a.length>=3?a:null},snap(){na=!0},tune:ee,look:dr,get freeze(){return J},set freeze(a){J=!!a},yOfClock(a){Ee||q();let i=bt.k;return a<=-1?xt(i.yA,i.yE,Tt(a+2)):this.yOf(Math.min(a,go))},setClock(a){la=a},yOf(a){Ee||q();let i=0,g=Ee.yEnd;for(let v=0;v<50;v++){let B=(i+g)/2;Ee.S(B)<a?i=B:g=B}return(i+g)/2},get state(){return{y:ct,v:Qt,t:la,s:qt,S:Pe,mode:gt,beat:zr(),colonyDone:ae.done,programs:C.info.programs.length,layout:Ee&&{yEnd:Ee.yEnd,vh:Ee.vh},touch:ja.on,yT:Ee?-It(r).top:0,dof:{k:va.k,maxblur:va.mb,focus:fo.focus},g:+Go.toFixed(4),gL:+ao.toFixed(4),over:+yo.toFixed(4),edge:+io.k.toFixed(3),end:+re(Pe,I).toFixed(4),overlap:Po,seam:To&&To.map(a=>+a.toFixed(3)),perf:{level:de.level,ceil:de.ceil,p90:de.state.p90,gpu:de.state.gpu,capped:de.state.capped,steps:de.state.steps,pr:C.getPixelRatio(),post:W.getQuality(),shadow:ke.shadow.mapSize.x,every:ca,keep:ye},mars:{star:Me.visible?+Ge.uI.value.toFixed(3):0,disc:U.mars.visible},site:qt<1?{hour:+Ie.hour.toFixed(2),g:+Ie.g.toFixed(3),dist:Math.round(Ie.dist),world:Ie.world,exp:+C.toneMappingExposure.toFixed(3)}:null}},dispose(){bo=!0,this.stop(),Oo&&Oo.disconnect(),removeEventListener("mousemove",wr),fa.removeEventListener?.("change",yr),removeEventListener("load",Ja);for(let a of["Ls","Rs"])ue&&ue[a]&&(ue[a].style.transform="");te.dispose(),N.traverse(a=>{a.geometry&&a.geometry.dispose()}),k.dispose(),C.dispose(),F.remove()}}}export{jl as createFilm};
