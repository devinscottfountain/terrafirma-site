import{a as Pr}from"./chunk-76JC7EWI.js";import{a as Lr}from"./chunk-LM5OH3CR.js";import{a as Pn,b as Ln,c as kn,e as Fn}from"./chunk-XLAB3GI6.js";import{a as bo}from"./chunk-4CI7YULG.js";import"./chunk-4C5RVMER.js";import{a as Dn,b as zn}from"./chunk-M5U4GD3X.js";import{a as Dr,b as An,c as Va,e as zr,f as Cn}from"./chunk-SKKE744E.js";import"./chunk-FCTCDFK5.js";import{m as On}from"./chunk-IPFIGNCI.js";import{Clock as ii,HalfFloatType as li,NoBlending as ci,Vector2 as Nn,WebGLRenderTarget as ui}from"three";var Na={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

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


		}`};import{ShaderMaterial as Vn,UniformsUtils as si}from"three";import{BufferGeometry as ti,Float32BufferAttribute as Bn,OrthographicCamera as oi,Mesh as ai}from"three";var qt=class{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}},ri=new oi(-1,1,1,-1,0,1),kr=class extends ti{constructor(){super(),this.setAttribute("position",new Bn([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new Bn([0,2,0,0,2,0],2))}},ni=new kr,Zt=class{constructor(t){this._mesh=new ai(ni,t)}dispose(){this._mesh.geometry.dispose()}render(t){t.render(this._mesh,ri)}get material(){return this._mesh.material}set material(t){this._mesh.material=t}};var qo=class extends qt{constructor(t,a){super(),this.textureID=a!==void 0?a:"tDiffuse",t instanceof Vn?(this.uniforms=t.uniforms,this.material=t):t&&(this.uniforms=si.clone(t.uniforms),this.material=new Vn({name:t.name!==void 0?t.name:"unspecified",defines:Object.assign({},t.defines),uniforms:this.uniforms,vertexShader:t.vertexShader,fragmentShader:t.fragmentShader})),this.fsQuad=new Zt(this.material)}render(t,a,s){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=s.texture),this.fsQuad.material=this.material,this.renderToScreen?(t.setRenderTarget(null),this.fsQuad.render(t)):(t.setRenderTarget(a),this.clear&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),this.fsQuad.render(t))}dispose(){this.material.dispose(),this.fsQuad.dispose()}};var fa=class extends qt{constructor(t,a){super(),this.scene=t,this.camera=a,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(t,a,s){let o=t.getContext(),u=t.state;u.buffers.color.setMask(!1),u.buffers.depth.setMask(!1),u.buffers.color.setLocked(!0),u.buffers.depth.setLocked(!0);let S,g;this.inverse?(S=0,g=1):(S=1,g=0),u.buffers.stencil.setTest(!0),u.buffers.stencil.setOp(o.REPLACE,o.REPLACE,o.REPLACE),u.buffers.stencil.setFunc(o.ALWAYS,S,4294967295),u.buffers.stencil.setClear(g),u.buffers.stencil.setLocked(!0),t.setRenderTarget(s),this.clear&&t.clear(),t.render(this.scene,this.camera),t.setRenderTarget(a),this.clear&&t.clear(),t.render(this.scene,this.camera),u.buffers.color.setLocked(!1),u.buffers.depth.setLocked(!1),u.buffers.color.setMask(!0),u.buffers.depth.setMask(!0),u.buffers.stencil.setLocked(!1),u.buffers.stencil.setFunc(o.EQUAL,1,4294967295),u.buffers.stencil.setOp(o.KEEP,o.KEEP,o.KEEP),u.buffers.stencil.setLocked(!0)}},Ua=class extends qt{constructor(){super(),this.needsSwap=!1}render(t){t.state.buffers.stencil.setLocked(!1),t.state.buffers.stencil.setTest(!1)}};var Ia=class{constructor(t,a){if(this.renderer=t,this._pixelRatio=t.getPixelRatio(),a===void 0){let s=t.getSize(new Nn);this._width=s.width,this._height=s.height,a=new ui(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:li}),a.texture.name="EffectComposer.rt1"}else this._width=a.width,this._height=a.height;this.renderTarget1=a,this.renderTarget2=a.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new qo(Na),this.copyPass.material.blending=ci,this.clock=new ii}swapBuffers(){let t=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=t}addPass(t){this.passes.push(t),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(t,a){this.passes.splice(a,0,t),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(t){let a=this.passes.indexOf(t);a!==-1&&this.passes.splice(a,1)}isLastEnabledPass(t){for(let a=t+1;a<this.passes.length;a++)if(this.passes[a].enabled)return!1;return!0}render(t){t===void 0&&(t=this.clock.getDelta());let a=this.renderer.getRenderTarget(),s=!1;for(let o=0,u=this.passes.length;o<u;o++){let S=this.passes[o];if(S.enabled!==!1){if(S.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(o),S.render(this.renderer,this.writeBuffer,this.readBuffer,t,s),S.needsSwap){if(s){let g=this.renderer.getContext(),L=this.renderer.state.buffers.stencil;L.setFunc(g.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,t),L.setFunc(g.EQUAL,1,4294967295)}this.swapBuffers()}fa!==void 0&&(S instanceof fa?s=!0:S instanceof Ua&&(s=!1))}}this.renderer.setRenderTarget(a)}reset(t){if(t===void 0){let a=this.renderer.getSize(new Nn);this._pixelRatio=this.renderer.getPixelRatio(),this._width=a.width,this._height=a.height,t=this.renderTarget1.clone(),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=t,this.renderTarget2=t.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(t,a){this._width=t,this._height=a;let s=this._width*this._pixelRatio,o=this._height*this._pixelRatio;this.renderTarget1.setSize(s,o),this.renderTarget2.setSize(s,o);for(let u=0;u<this.passes.length;u++)this.passes[u].setSize(s,o)}setPixelRatio(t){this._pixelRatio=t,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}};import{AdditiveBlending as hi,Color as In,HalfFloatType as Fr,MeshBasicMaterial as di,ShaderMaterial as Ga,UniformsUtils as Gn,Vector2 as yo,Vector3 as ha,WebGLRenderTarget as Or}from"three";import{Color as fi}from"three";var Un={name:"LuminosityHighPassShader",shaderID:"luminosityHighPass",uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new fi(0)},defaultOpacity:{value:0}},vertexShader:`

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

		}`};var Xo=class e extends qt{constructor(t,a,s,o){super(),this.strength=a!==void 0?a:1,this.radius=s,this.threshold=o,this.resolution=t!==void 0?new yo(t.x,t.y):new yo(256,256),this.clearColor=new In(0,0,0),this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let u=Math.round(this.resolution.x/2),S=Math.round(this.resolution.y/2);this.renderTargetBright=new Or(u,S,{type:Fr}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let P=0;P<this.nMips;P++){let U=new Or(u,S,{type:Fr});U.texture.name="UnrealBloomPass.h"+P,U.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(U);let f=new Or(u,S,{type:Fr});f.texture.name="UnrealBloomPass.v"+P,f.texture.generateMipmaps=!1,this.renderTargetsVertical.push(f),u=Math.round(u/2),S=Math.round(S/2)}let g=Un;this.highPassUniforms=Gn.clone(g.uniforms),this.highPassUniforms.luminosityThreshold.value=o,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new Ga({uniforms:this.highPassUniforms,vertexShader:g.vertexShader,fragmentShader:g.fragmentShader}),this.separableBlurMaterials=[];let L=[3,5,7,9,11];u=Math.round(this.resolution.x/2),S=Math.round(this.resolution.y/2);for(let P=0;P<this.nMips;P++)this.separableBlurMaterials.push(this.getSeperableBlurMaterial(L[P])),this.separableBlurMaterials[P].uniforms.invSize.value=new yo(1/u,1/S),u=Math.round(u/2),S=Math.round(S/2);this.compositeMaterial=this.getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=a,this.compositeMaterial.uniforms.bloomRadius.value=.1;let m=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=m,this.bloomTintColors=[new ha(1,1,1),new ha(1,1,1),new ha(1,1,1),new ha(1,1,1),new ha(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors;let O=Na;this.copyUniforms=Gn.clone(O.uniforms),this.blendMaterial=new Ga({uniforms:this.copyUniforms,vertexShader:O.vertexShader,fragmentShader:O.fragmentShader,blending:hi,depthTest:!1,depthWrite:!1,transparent:!0}),this.enabled=!0,this.needsSwap=!1,this._oldClearColor=new In,this.oldClearAlpha=1,this.basic=new di,this.fsQuad=new Zt(null)}dispose(){for(let t=0;t<this.renderTargetsHorizontal.length;t++)this.renderTargetsHorizontal[t].dispose();for(let t=0;t<this.renderTargetsVertical.length;t++)this.renderTargetsVertical[t].dispose();this.renderTargetBright.dispose();for(let t=0;t<this.separableBlurMaterials.length;t++)this.separableBlurMaterials[t].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this.basic.dispose(),this.fsQuad.dispose()}setSize(t,a){let s=Math.round(t/2),o=Math.round(a/2);this.renderTargetBright.setSize(s,o);for(let u=0;u<this.nMips;u++)this.renderTargetsHorizontal[u].setSize(s,o),this.renderTargetsVertical[u].setSize(s,o),this.separableBlurMaterials[u].uniforms.invSize.value=new yo(1/s,1/o),s=Math.round(s/2),o=Math.round(o/2)}render(t,a,s,o,u){t.getClearColor(this._oldClearColor),this.oldClearAlpha=t.getClearAlpha();let S=t.autoClear;t.autoClear=!1,t.setClearColor(this.clearColor,0),u&&t.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this.fsQuad.material=this.basic,this.basic.map=s.texture,t.setRenderTarget(null),t.clear(),this.fsQuad.render(t)),this.highPassUniforms.tDiffuse.value=s.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this.fsQuad.material=this.materialHighPassFilter,t.setRenderTarget(this.renderTargetBright),t.clear(),this.fsQuad.render(t);let g=this.renderTargetBright;for(let L=0;L<this.nMips;L++)this.fsQuad.material=this.separableBlurMaterials[L],this.separableBlurMaterials[L].uniforms.colorTexture.value=g.texture,this.separableBlurMaterials[L].uniforms.direction.value=e.BlurDirectionX,t.setRenderTarget(this.renderTargetsHorizontal[L]),t.clear(),this.fsQuad.render(t),this.separableBlurMaterials[L].uniforms.colorTexture.value=this.renderTargetsHorizontal[L].texture,this.separableBlurMaterials[L].uniforms.direction.value=e.BlurDirectionY,t.setRenderTarget(this.renderTargetsVertical[L]),t.clear(),this.fsQuad.render(t),g=this.renderTargetsVertical[L];this.fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,t.setRenderTarget(this.renderTargetsHorizontal[0]),t.clear(),this.fsQuad.render(t),this.fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,u&&t.state.buffers.stencil.setTest(!0),this.renderToScreen?(t.setRenderTarget(null),this.fsQuad.render(t)):(t.setRenderTarget(s),this.fsQuad.render(t)),t.setClearColor(this._oldClearColor,this.oldClearAlpha),t.autoClear=S}getSeperableBlurMaterial(t){let a=[];for(let s=0;s<t;s++)a.push(.39894*Math.exp(-.5*s*s/(t*t))/t);return new Ga({defines:{KERNEL_RADIUS:t},uniforms:{colorTexture:{value:null},invSize:{value:new yo(.5,.5)},direction:{value:new yo(.5,.5)},gaussianCoefficients:{value:a}},vertexShader:`varying vec2 vUv;
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
				}`})}getCompositeMaterial(t){return new Ga({defines:{NUM_MIPS:t},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`varying vec2 vUv;
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
				}`})}};Xo.BlurDirectionX=new yo(1,0);Xo.BlurDirectionY=new yo(0,1);import{Color as mi,HalfFloatType as vi,MeshDepthMaterial as pi,NearestFilter as Tn,NoBlending as gi,RGBADepthPacking as xi,ShaderMaterial as bi,UniformsUtils as yi,WebGLRenderTarget as wi}from"three";var Ta={name:"BokehShader",defines:{DEPTH_PACKING:1,PERSPECTIVE_CAMERA:1},uniforms:{tColor:{value:null},tDepth:{value:null},focus:{value:1},aspect:{value:1},aperture:{value:.025},maxblur:{value:.01},nearClip:{value:1},farClip:{value:1e3}},vertexShader:`

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

		}`};var Wa=class extends qt{constructor(t,a,s){super(),this.scene=t,this.camera=a;let o=s.focus!==void 0?s.focus:1,u=s.aperture!==void 0?s.aperture:.025,S=s.maxblur!==void 0?s.maxblur:1;this.renderTargetDepth=new wi(1,1,{minFilter:Tn,magFilter:Tn,type:vi}),this.renderTargetDepth.texture.name="BokehPass.depth",this.materialDepth=new pi,this.materialDepth.depthPacking=xi,this.materialDepth.blending=gi;let g=Ta,L=yi.clone(g.uniforms);L.tDepth.value=this.renderTargetDepth.texture,L.focus.value=o,L.aspect.value=a.aspect,L.aperture.value=u,L.maxblur.value=S,L.nearClip.value=a.near,L.farClip.value=a.far,this.materialBokeh=new bi({defines:Object.assign({},g.defines),uniforms:L,vertexShader:g.vertexShader,fragmentShader:g.fragmentShader}),this.uniforms=L,this.fsQuad=new Zt(this.materialBokeh),this._oldClearColor=new mi}render(t,a,s){this.scene.overrideMaterial=this.materialDepth,t.getClearColor(this._oldClearColor);let o=t.getClearAlpha(),u=t.autoClear;t.autoClear=!1,t.setClearColor(16777215),t.setClearAlpha(1),t.setRenderTarget(this.renderTargetDepth),t.clear(),t.render(this.scene,this.camera),this.uniforms.tColor.value=s.texture,this.uniforms.nearClip.value=this.camera.near,this.uniforms.farClip.value=this.camera.far,this.renderToScreen?(t.setRenderTarget(null),this.fsQuad.render(t)):(t.setRenderTarget(a),t.clear(),this.fsQuad.render(t)),this.scene.overrideMaterial=null,t.setClearColor(this._oldClearColor),t.setClearAlpha(o),t.autoClear=u}setSize(t,a){this.materialBokeh.uniforms.aspect.value=t/a,this.renderTargetDepth.setSize(t,a)}dispose(){this.renderTargetDepth.dispose(),this.materialDepth.dispose(),this.materialBokeh.dispose(),this.fsQuad.dispose()}};import{HalfFloatType as Wn,LinearFilter as Mi,NearestFilter as jn,ShaderMaterial as Vr,Texture as qn,UniformsUtils as Nr,WebGLRenderTarget as Xn}from"three";import{Vector2 as Br}from"three";var da={name:"SMAAEdgesShader",defines:{SMAA_THRESHOLD:"0.1"},uniforms:{tDiffuse:{value:null},resolution:{value:new Br(1/1024,1/512)}},vertexShader:`

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

		}`},ma={name:"SMAAWeightsShader",defines:{SMAA_MAX_SEARCH_STEPS:"8",SMAA_AREATEX_MAX_DISTANCE:"16",SMAA_AREATEX_PIXEL_SIZE:"( 1.0 / vec2( 160.0, 560.0 ) )",SMAA_AREATEX_SUBTEX_SIZE:"( 1.0 / 7.0 )"},uniforms:{tDiffuse:{value:null},tArea:{value:null},tSearch:{value:null},resolution:{value:new Br(1/1024,1/512)}},vertexShader:`

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

		}`},ja={name:"SMAABlendShader",uniforms:{tDiffuse:{value:null},tColor:{value:null},resolution:{value:new Br(1/1024,1/512)}},vertexShader:`

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

		}`};var qa=class extends qt{constructor(t,a){super(),this.edgesRT=new Xn(t,a,{depthBuffer:!1,type:Wn}),this.edgesRT.texture.name="SMAAPass.edges",this.weightsRT=new Xn(t,a,{depthBuffer:!1,type:Wn}),this.weightsRT.texture.name="SMAAPass.weights";let s=this,o=new Image;o.src=this.getAreaTexture(),o.onload=function(){s.areaTexture.needsUpdate=!0},this.areaTexture=new qn,this.areaTexture.name="SMAAPass.area",this.areaTexture.image=o,this.areaTexture.minFilter=Mi,this.areaTexture.generateMipmaps=!1,this.areaTexture.flipY=!1;let u=new Image;u.src=this.getSearchTexture(),u.onload=function(){s.searchTexture.needsUpdate=!0},this.searchTexture=new qn,this.searchTexture.name="SMAAPass.search",this.searchTexture.image=u,this.searchTexture.magFilter=jn,this.searchTexture.minFilter=jn,this.searchTexture.generateMipmaps=!1,this.searchTexture.flipY=!1,this.uniformsEdges=Nr.clone(da.uniforms),this.uniformsEdges.resolution.value.set(1/t,1/a),this.materialEdges=new Vr({defines:Object.assign({},da.defines),uniforms:this.uniformsEdges,vertexShader:da.vertexShader,fragmentShader:da.fragmentShader}),this.uniformsWeights=Nr.clone(ma.uniforms),this.uniformsWeights.resolution.value.set(1/t,1/a),this.uniformsWeights.tDiffuse.value=this.edgesRT.texture,this.uniformsWeights.tArea.value=this.areaTexture,this.uniformsWeights.tSearch.value=this.searchTexture,this.materialWeights=new Vr({defines:Object.assign({},ma.defines),uniforms:this.uniformsWeights,vertexShader:ma.vertexShader,fragmentShader:ma.fragmentShader}),this.uniformsBlend=Nr.clone(ja.uniforms),this.uniformsBlend.resolution.value.set(1/t,1/a),this.uniformsBlend.tDiffuse.value=this.weightsRT.texture,this.materialBlend=new Vr({uniforms:this.uniformsBlend,vertexShader:ja.vertexShader,fragmentShader:ja.fragmentShader}),this.fsQuad=new Zt(null)}render(t,a,s){this.uniformsEdges.tDiffuse.value=s.texture,this.fsQuad.material=this.materialEdges,t.setRenderTarget(this.edgesRT),this.clear&&t.clear(),this.fsQuad.render(t),this.fsQuad.material=this.materialWeights,t.setRenderTarget(this.weightsRT),this.clear&&t.clear(),this.fsQuad.render(t),this.uniformsBlend.tColor.value=s.texture,this.fsQuad.material=this.materialBlend,this.renderToScreen?(t.setRenderTarget(null),this.fsQuad.render(t)):(t.setRenderTarget(a),this.clear&&t.clear(),this.fsQuad.render(t))}setSize(t,a){this.edgesRT.setSize(t,a),this.weightsRT.setSize(t,a),this.materialEdges.uniforms.resolution.value.set(1/t,1/a),this.materialWeights.uniforms.resolution.value.set(1/t,1/a),this.materialBlend.uniforms.resolution.value.set(1/t,1/a)}getAreaTexture(){return"data:image/png;base64,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"}getSearchTexture(){return"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAAAhCAAAAABIXyLAAAAAOElEQVRIx2NgGAWjYBSMglEwEICREYRgFBZBqDCSLA2MGPUIVQETE9iNUAqLR5gIeoQKRgwXjwAAGn4AtaFeYLEAAAAASUVORK5CYII="}dispose(){this.edgesRT.dispose(),this.weightsRT.dispose(),this.areaTexture.dispose(),this.searchTexture.dispose(),this.materialEdges.dispose(),this.materialWeights.dispose(),this.materialBlend.dispose(),this.fsQuad.dispose()}};var va="varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }";function Kn({THREE:e,renderer:t,scene:a,cam:s,cine:o=!0,low:u=!1}){let S=t.getPixelRatio(),g=t.getSize(new e.Vector2),L=Math.max(1,Math.floor(g.x*S)),m=Math.max(1,Math.floor(g.y*S)),O={enabled:!0,shutter:.6,maxLen:.035,minPx:.35,cutDist:400,cutAngle:.7,active:!1},P={enabled:!0,min:.55,max:1.35,ref:-2.4,strength:.5,rateToBright:2.4,rateToDark:.7,linear:1,lumMin:.03,lumMax:24},U={enabled:!1,amount:.65,clamp:.15,depthTol:.06,cutAngle:.5,active:!1},f={enabled:!1,radius:.03,intensity:1,bias:.12,maxPx:48,debug:!1,active:!1},i=new URLSearchParams(location.search).get("hdr")==="rg11b10",F=z=>(i&&(z.texture.internalFormat="R11F_G11F_B10F"),z);if(i){let z=t.getContext(),p=z.texImage2D;z.texImage2D=function(){return arguments.length>=9&&arguments[2]===z.R11F_G11F_B10F&&arguments[6]===z.RGBA&&(arguments[6]=z.RGB),p.apply(z,arguments)}}let I=new Ia(t);F(I.renderTarget1),F(I.renderTarget2),I.renderTarget1.depthBuffer=I.renderTarget2.depthBuffer=!1;class $ extends qt{constructor(){super(),this.needsSwap=!1,this.useRT=!1,this.jx=0,this.jy=0,this.rt=F(new e.WebGLRenderTarget(L,m,{type:e.HalfFloatType,depthTexture:new e.DepthTexture(L,m)}))}render(p,B,Y){let Q=p.autoClear;if(p.autoClear=!1,p.setRenderTarget(this.useRT?this.rt:Y),p.clear(!0,!0,!0),this.jx||this.jy){let j=s.projectionMatrix.elements,Z=j[8],ye=j[9],ze=this.rt;j[8]+=2*this.jx/ze.width,j[9]+=2*this.jy/ze.height;try{p.render(a,s)}finally{j[8]=Z,j[9]=ye}}else p.render(a,s);p.autoClear=Q}setSize(p,B){this.rt.setSize(p,B),this.rt.depthTexture.image.width=p,this.rt.depthTexture.image.height=B}}let K=new $;I.addPass(K);let R=`
    uniform float near; uniform float far;
    float viewZ(float d){ return (near*far)/((far-near)*d-far); } // perspective depth -> view z (negative)`,Me="float ign(vec2 p){ return fract(52.9829189*fract(dot(p,vec2(0.06711056,0.00583715)))); }";class pe extends qt{constructor(){super(),this.blur=!1,this.histOk=!1,this.histVP=new e.Matrix4,this.histRel=new e.Matrix4,this.invVP=new e.Matrix4,this.w=L,this.h=m,this.hist=null,this.tmp=null,this.aoA=null,this.aoB=null;let p=(B,Y)=>new e.ShaderMaterial({uniforms:B,vertexShader:va,depthTest:!1,depthWrite:!1,fragmentShader:Y});this.u={tColor:{value:null},tDepth:{value:null},invVP:{value:new e.Matrix4},prevVP:{value:new e.Matrix4},scale:{value:.5},maxLen:{value:.035},res:{value:new e.Vector2(L,m)}},this.mBlur=p(this.u,`
        uniform sampler2D tColor; uniform sampler2D tDepth; uniform mat4 invVP; uniform mat4 prevVP; uniform float scale; uniform float maxLen; uniform vec2 res; varying vec2 vUv;
        ${Me}
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
          gl_FragColor=vec4(acc/n,1.); }`),this.mCopy=p({tColor:{value:null}},"uniform sampler2D tColor; varying vec2 vUv; void main(){ gl_FragColor=vec4(texture2D(tColor,vUv).rgb,1.); }"),this.uT={tColor:{value:null},tDepth:{value:null},tHist:{value:null},invVP:{value:null},histVP:{value:null},res:{value:new e.Vector2(L,m)},near:{value:1},far:{value:1e3},w:{value:.65},clampK:{value:.15},tol:{value:.06},valid:{value:0}},this.mTrail=p(this.uT,`
        uniform sampler2D tColor; uniform sampler2D tDepth; uniform sampler2D tHist; uniform mat4 invVP; uniform mat4 histVP; uniform vec2 res;
        uniform float w, clampK, tol, valid; varying vec2 vUv;
        ${R}
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
          gl_FragColor=vec4(mix(c,h,w*(1.-disocc)),zl); }`),this.uAO={tDepth:{value:null},res:{value:new e.Vector2(L,m)},near:{value:1},far:{value:1e3},pInv:{value:new e.Vector2(1,1)},projScale:{value:500},radius:{value:.02},intensity:{value:1},bias:{value:.12},maxPx:{value:48}},this.mAO=p(this.uAO,`
        uniform sampler2D tDepth; uniform vec2 res; uniform vec2 pInv; uniform float projScale, radius, intensity, bias, maxPx; varying vec2 vUv;
        ${R}
        ${Me}
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
          gl_FragColor=vec4(clamp(1.-intensity*occ/3.,0.,1.),-P.z,0.,1.); }`),this.uAOB={tAO:{value:null},dir:{value:new e.Vector2(1,0)},hres:{value:new e.Vector2(L>>1,m>>1)}},this.mAOBlur=p(this.uAOB,`
        uniform sampler2D tAO; uniform vec2 dir; uniform vec2 hres; varying vec2 vUv;
        void main(){
          ivec2 p=ivec2(gl_FragCoord.xy), mx=ivec2(hres)-1; vec2 c=texelFetch(tAO,p,0).xy; float s=c.x, ws=1., k=1./(.03*c.y);
          for(int i=-4;i<=4;i++){ if(i==0) continue;
            vec2 t=texelFetch(tAO,clamp(p+ivec2(dir)*i,ivec2(0),mx),0).xy;
            float wt=exp(-float(i*i)*.125)*max(0.,1.-abs(t.y-c.y)*k); s+=t.x*wt; ws+=wt; }
          gl_FragColor=vec4(s/ws,c.y,0.,1.); }`),this.uAOC={tColor:{value:null},tDepth:{value:null},tAO:{value:null},hres:{value:new e.Vector2(L>>1,m>>1)},near:{value:1},far:{value:1e3},dbg:{value:0}},this.mAOComp=p(this.uAOC,`
        uniform sampler2D tColor; uniform sampler2D tDepth; uniform sampler2D tAO; uniform vec2 hres; uniform float dbg; varying vec2 vUv;
        ${R}
        void main(){
          vec4 c=texture2D(tColor,vUv); float d=texture2D(tDepth,vUv).x;
          if(d>=.999999){ gl_FragColor=vec4(c.rgb,1.); return; }
          float z=-viewZ(d), k=1./(.03*z);
          vec2 hp=vUv*hres-.5, f=fract(hp); ivec2 b=ivec2(floor(hp)), mx=ivec2(hres)-1;
          float s=0., ws=1e-4;                                    // joint bilateral upsample: bilinear weights x depth similarity
          for(int y=0;y<2;y++) for(int x=0;x<2;x++){
            vec2 t=texelFetch(tAO,clamp(b+ivec2(x,y),ivec2(0),mx),0).xy;
            float wt=(x==0?1.-f.x:f.x)*(y==0?1.-f.y:f.y)*max(1e-3,1.-abs(t.y-z)*k); s+=t.x*wt; ws+=wt; }
          gl_FragColor=vec4(dbg>.5 ? vec3(.6*s/ws) : c.rgb*(s/ws),1.); }`),this.fsQuad=new Zt(this.mCopy),this.taa=!1,this.direct=!1,this.outTex=null,this.mTaa=null}draw(p,B,Y){this.fsQuad.material=B,p.setRenderTarget(Y),this.fsQuad.render(p)}alloc(){let p=(Q,j,Z,ye=!0)=>{let ze=new e.WebGLRenderTarget(Q,j,{type:e.HalfFloatType,depthBuffer:!1,minFilter:Z,magFilter:Z});return ye?F(ze):ze},B=Math.max(1,this.w>>1),Y=Math.max(1,this.h>>1);(U.enabled||this.taa)&&!this.hist&&(this.hist=[p(this.w,this.h,e.LinearFilter),p(this.w,this.h,e.LinearFilter)],this.histOk=!1),f.enabled&&!this.aoA&&(this.aoA=p(B,Y,e.NearestFilter,!1),this.aoB=p(B,Y,e.NearestFilter,!1)),f.enabled&&(U.enabled||this.taa||this.blur)&&!this.tmp&&(this.tmp=p(this.w,this.h,e.LinearFilter))}render(p,B){this.alloc();let Y=K.rt.depthTexture,Q=K.rt.texture,j=!1,Z=s.near,ye=s.far,ze=!U.enabled&&!this.taa&&!this.blur;if(this.outTex=B?B.texture:null,f.enabled){let we=s.projectionMatrix.elements;this.uAO.tDepth.value=Y,this.uAO.near.value=Z,this.uAO.far.value=ye,this.uAO.pInv.value.set(1/we[0],1/we[5]),this.uAO.projScale.value=.5*this.h*we[5],this.uAO.radius.value=f.radius,this.uAO.intensity.value=f.intensity,this.uAO.bias.value=f.bias,this.uAO.maxPx.value=f.maxPx,this.draw(p,this.mAO,this.aoA),this.uAOB.tAO.value=this.aoA.texture,this.uAOB.dir.value.set(1,0),this.draw(p,this.mAOBlur,this.aoB),this.uAOB.tAO.value=this.aoB.texture,this.uAOB.dir.value.set(0,1),this.draw(p,this.mAOBlur,this.aoA);let Pe=this.uAOC;Pe.tColor.value=Q,Pe.tDepth.value=Y,Pe.tAO.value=this.aoA.texture,Pe.near.value=Z,Pe.far.value=ye,Pe.dbg.value=f.debug?1:0,this.draw(p,this.mAOComp,ze?B:this.tmp),ze?j=!0:Q=this.tmp.texture}if(U.enabled){let we=this.uT,Pe=this.hist[0],ue=this.hist[1];we.tColor.value=Q,we.tDepth.value=Y,we.tHist.value=Pe.texture,we.invVP.value=this.invVP,we.histVP.value=this.histRel,we.near.value=Z,we.far.value=ye,we.valid.value=this.histOk?1:0,we.w.value=Math.pow(e.MathUtils.clamp(U.amount,0,.98),e.MathUtils.clamp(ge*60,.25,4)),we.clampK.value=U.clamp,we.tol.value=U.depthTol,this.draw(p,this.mTrail,ue),this.hist[0]=ue,this.hist[1]=Pe,this.histVP.copy(oe),this.histOk=!0,Q=ue.texture}else if(this.taa){let we=this.mTaa.uniforms,Pe=this.hist[0],ue=this.hist[1];we.tColor.value=Q,we.tDepth.value=Y,we.tHist.value=Pe.texture,we.invVP.value=this.invVP,we.histVP.value=this.histRel,we.valid.value=this.histOk?1:0,this.draw(p,this.mTaa,ue),this.hist[0]=ue,this.hist[1]=Pe,this.histVP.copy(oe),this.histOk=!0,Q=ue.texture}this.blur?(this.u.tColor.value=Q,this.u.tDepth.value=Y,this.draw(p,this.mBlur,B)):!j&&this.direct?this.outTex=Q:j||(this.mCopy.uniforms.tColor.value=Q,this.draw(p,this.mCopy,B))}setSize(p,B){this.w=p,this.h=B,this.u.res.value.set(p,B),this.uT.res.value.set(p,B),this.uAO.res.value.set(p,B);let Y=Math.max(1,p>>1),Q=Math.max(1,B>>1);this.uAOB.hres.value.set(Y,Q),this.uAOC.hres.value.set(Y,Q);for(let j of[this.tmp,...this.hist||[]])j&&j.setSize(p,B);for(let j of[this.aoA,this.aoB])j&&j.setSize(Y,Q);this.mTaa&&this.mTaa.uniforms.res.value.set(p,B),this.histOk=!1}dispose(){for(let p of[this.tmp,this.aoA,this.aoB,...this.hist||[]])p&&p.dispose();this.hist=this.tmp=this.aoA=this.aoB=null}}let H=new pe;H.enabled=!1,I.addPass(H);let re=new Wa(a,s,{focus:30,aperture:1e-4,maxblur:.002});re.materialBokeh.defines.DEPTH_PACKING=0,re.materialBokeh.needsUpdate=!0,re.renderTargetDepth.dispose(),re.render=function(z,p,B){let Y=this.uniforms;Y.tColor.value=H.enabled?B.texture:K.rt.texture,Y.tDepth.value=K.rt.depthTexture,Y.nearClip.value=s.near,Y.farClip.value=s.far,z.setRenderTarget(this.renderToScreen?null:p),this.fsQuad.render(z)},re.setSize=function(z,p){this.uniforms.aspect.value=z/p},I.addPass(re);let Ne=o?{strength:.6,radius:.5,threshold:.72,separableBlurMaterials:[]}:new Xo(new e.Vector2(L,m),.8,.5,.72);o||I.addPass(Ne);class me extends qt{constructor(){super();let p=(B,Y)=>new e.WebGLRenderTarget(B,B,{type:Y,depthBuffer:!1,magFilter:e.NearestFilter,minFilter:e.NearestFilter});this.t64=p(64,e.HalfFloatType),this.t8=p(8,e.HalfFloatType),this.t1=p(1,e.HalfFloatType),this.sA=p(1,e.FloatType),this.sB=p(1,e.FloatType),this.first=!0,this.snap=!0,this.mDown=new e.ShaderMaterial({uniforms:{tSrc:{value:null},lumMax:{value:24},lumMin:{value:.03}},vertexShader:va,depthTest:!1,fragmentShader:`
        uniform sampler2D tSrc; uniform float lumMax; uniform float lumMin; varying vec2 vUv;
        void main(){ vec2 base=floor(gl_FragCoord.xy)/64.; vec3 acc=vec3(0.);
          for(int y=0;y<4;y++) for(int x=0;x<4;x++){
            vec2 uv=base+(vec2(float(x),float(y))+.5)/256.;
            vec3 c=texture2D(tSrc,uv).rgb; float l=clamp(dot(c,vec3(.2126,.7152,.0722)),lumMin,lumMax);
            float k=length(uv-.5)*2.; float wt=mix(1.,.35,smoothstep(.2,1.1,k)); // centre-weighted metering
            acc+=vec3(log(l)*wt,wt,l*l*wt); }
          gl_FragColor=vec4(acc/16.,1.); }`}),this.mReduce=new e.ShaderMaterial({uniforms:{tSrc:{value:null}},vertexShader:va,depthTest:!1,fragmentShader:`
        uniform sampler2D tSrc; varying vec2 vUv;
        void main(){ ivec2 b=ivec2(gl_FragCoord.xy)*8; vec3 acc=vec3(0.);
          for(int y=0;y<8;y++) for(int x=0;x<8;x++) acc+=texelFetch(tSrc,b+ivec2(x,y),0).rgb;
          gl_FragColor=vec4(acc/64.,1.); }`}),this.mAdapt=new e.ShaderMaterial({uniforms:{tAvg:{value:null},tPrev:{value:null},dt:{value:.016},base:{value:1.05},ref:{value:-3.2},strength:{value:.5},eMin:{value:.55},eMax:{value:1.35},up:{value:2.4},down:{value:.7},snap:{value:1},on:{value:1},lin:{value:1}},vertexShader:va,depthTest:!1,fragmentShader:`
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
        }`}),this.fsQuad=new Zt(this.mDown),this.dt=1/60,this._cs=null,this._tm=null}pass(p,B,Y){this.fsQuad.material=B,p.setRenderTarget(Y),this.fsQuad.render(p)}render(p,B,Y){if(this._cs!==p.outputColorSpace||this._tm!==p.toneMapping){this._cs=p.outputColorSpace,this._tm=p.toneMapping;let Z={};e.ColorManagement.getTransfer(this._cs)===e.SRGBTransfer&&(Z.SRGB_TRANSFER="");let ye={[e.LinearToneMapping]:"LINEAR_TONE_MAPPING",[e.ReinhardToneMapping]:"REINHARD_TONE_MAPPING",[e.CineonToneMapping]:"CINEON_TONE_MAPPING",[e.ACESFilmicToneMapping]:"ACES_FILMIC_TONE_MAPPING",[e.AgXToneMapping]:"AGX_TONE_MAPPING"}[this._tm];ye&&(Z[ye]=""),this.mTone.defines=Z,this.mTone.needsUpdate=!0}P.enabled&&(this.mDown.uniforms.tSrc.value=Y.texture,this.mDown.uniforms.lumMax.value=P.lumMax,this.mDown.uniforms.lumMin.value=P.lumMin,this.pass(p,this.mDown,this.t64),this.mReduce.uniforms.tSrc.value=this.t64.texture,this.pass(p,this.mReduce,this.t8),this.mReduce.uniforms.tSrc.value=this.t8.texture,this.pass(p,this.mReduce,this.t1));let Q=this.mAdapt.uniforms;Q.tAvg.value=this.t1.texture,Q.tPrev.value=this.sA.texture,Q.dt.value=Math.min(this.dt,.1),Q.base.value=p.toneMappingExposure,Q.ref.value=P.ref,Q.strength.value=P.strength,Q.eMin.value=P.min,Q.eMax.value=P.max,Q.up.value=P.rateToBright,Q.down.value=P.rateToDark,Q.lin.value=P.linear,Q.snap.value=this.snap?1:0,Q.on.value=P.enabled?1:0,this.snap=!1,this.pass(p,this.mAdapt,this.sB);let j=this.sA;this.sA=this.sB,this.sB=j,this.mTone.uniforms.tDiffuse.value=Y.texture,this.mTone.uniforms.tExp.value=this.sA.texture,this.pass(p,this.merge?this.mMerge:this.mTone,this.merge||this.renderToScreen?null:B)}}let De=new me;I.addPass(De);let le=new qa(L,m);I.addPass(le);let be=new qo({uniforms:{tDiffuse:{value:null},ca:{value:.012},time:{value:0},grain:{value:.045},res:{value:new e.Vector2(L,m)}},vertexShader:"varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }",fragmentShader:`uniform sampler2D tDiffuse; uniform float ca; uniform float time; uniform float grain; uniform vec2 res; varying vec2 vUv;
    void main(){
      vec2 c=vUv-.5; float r2=dot(c,c);
      vec2 uv=.5+c*(1.-0.035*r2);              // barrel, pulls the corners in a touch
      vec2 o=c*r2*ca;                           // fringing grows toward the edges, zero at center
      vec3 col=vec3(texture2D(tDiffuse,uv+o).r, texture2D(tDiffuse,uv).g, texture2D(tDiffuse,uv-o).b);
      col*=mix(1.,smoothstep(0.75,0.12,r2*1.6),0.55); // vignette
      float n=fract(sin(dot(floor(vUv*res)+fract(time*7.31)*91.7,vec2(12.9898,78.233)))*43758.5453);
      col+=(n-.5)*grain*(1.-dot(col,vec3(.33))*0.6); // grain sits mostly in the shadows, like film
      gl_FragColor=vec4(col,1.); }`});o||I.addPass(be);let V=o?Ai({THREE:e,renderer:t,cam:s,composer:I,scenePass:K,mbPass:H,dof:re,tonePass:De,smaa:le,bloom:Ne,FS_VERT:va,low:u,hdr:F}):null,oe=new e.Matrix4,Ae=new e.Matrix4,fe=new e.Matrix4,de=new e.Matrix4,Ce=new e.Matrix4,ve=new e.Vector3,Fe=new e.Vector3,Ue=new e.Quaternion,Ze=1,Re=new URLSearchParams(location.search).get("postpr")!=="0",je=!1,ge=1/60,M=!1,h=L;function k(z,p){t.setSize(z,p),s.aspect=z/p,s.updateProjectionMatrix();let B=t.getPixelRatio();h=Math.max(1,Math.floor(z*B)),Re&&I.setPixelRatio(B),I.setSize(z,p),be.uniforms.res.value.set(z,p),M=!0,V&&V.setSize()}function A({dt:z=1/60,t:p=0,ca:B,focus:Y,aperture:Q,maxblur:j}={}){ge=Math.max(z,1e-4),De.dt=ge,Y!==void 0&&(re.uniforms.focus.value=Y),Q!==void 0&&(re.uniforms.aperture.value=Q),j!==void 0&&(re.uniforms.maxblur.value=j),B!==void 0&&(be.uniforms.ca.value=B),be.uniforms.time.value=p,V&&(V.time=p);let Z=!!V&&V.taaOn()&&!U.enabled;s.updateMatrixWorld(),oe.multiplyMatrices(s.projectionMatrix,s.matrixWorldInverse),ve.setFromMatrixPosition(s.matrixWorld),de.makeTranslation(ve.x,ve.y,ve.z),fe.copy(oe).invert().premultiply(Ce.makeTranslation(-ve.x,-ve.y,-ve.z));let ye=!1,ze=je?s.position.distanceTo(Fe):0,we=je?Ue.angleTo(s.quaternion):0;if(je&&!M&&O.enabled){let _e=Math.min(Math.max(Y===void 0?re.uniforms.focus.value:Y,3),60),rt=s.fov*Math.PI/180,yt=(we+ze/_e)/rt*m,kt=e.MathUtils.clamp(O.shutter*(1/60)/ge,.15,2);if(ze<O.cutDist&&we<O.cutAngle&&yt*kt>O.minPx){ye=!0;let mt=H.u;mt.prevVP.value.multiplyMatrices(Ae,de),mt.invVP.value.copy(fe),mt.scale.value=kt,mt.maxLen.value=O.maxLen}}let Pe=U.enabled||Z;(!Pe||!je||M||ze>=O.cutDist||we>=Math.min(O.cutAngle,U.cutAngle))&&(H.histOk=!1),Pe?(H.invVP.copy(fe),H.histRel.multiplyMatrices(H.histVP,de)):H.hist&&(H.hist.forEach(_e=>_e.dispose()),H.hist=null),!f.enabled&&H.aoA&&(H.aoA.dispose(),H.aoB.dispose(),H.aoA=H.aoB=null),!f.enabled&&H.tmp&&(H.tmp.dispose(),H.tmp=null),H.blur=ye,H.taa=Z;let ue=ye||U.enabled||f.enabled||Z;O.active=ye,U.active=U.enabled,f.active=f.enabled;let Ee=.4*re.uniforms.maxblur.value*h>=Ze;H.enabled=ue,re.enabled=Ee,K.useRT=ue||Ee||!!V,V&&V.jitter(Z),Ae.copy(oe),Fe.copy(s.position),Ue.copy(s.quaternion),je=!0,M=!1}function w(){V?V.render():I.render(ge)}function ee({fx:z=!0}={}){if(V){let B=[K.enabled,H.enabled,H.blur,H.taa,re.enabled,U.enabled,f.enabled];try{K.enabled=!1,H.enabled=!0,re.enabled=!0,U.enabled=!1,f.enabled=z,H.blur=!0,H.taa=!0,V.render(!0,0),H.blur=!1,H.taa=!1,f.enabled=!1,U.enabled=z,V.render(!0,1)}finally{[K.enabled,H.enabled,H.blur,H.taa,re.enabled,U.enabled,f.enabled]=B,H.histOk=!1,De.snap=!0,M=!0}return}let p=[K.enabled,K.useRT,H.enabled,H.blur,re.enabled,U.enabled,f.enabled];try{K.enabled=!1,K.useRT=!0,H.enabled=!0,re.enabled=!0,H.blur=!0,U.enabled=f.enabled=z,I.render(1/60),H.blur=!1,U.enabled=f.enabled=!1,I.render(1/60)}finally{[K.enabled,K.useRT,H.enabled,H.blur,re.enabled,U.enabled,f.enabled]=p,H.histOk=!1,De.snap=!0,M=!0}}let J=new Float32Array(4);function _(){return t.readRenderTargetPixels(De.sA,0,0,1,1,J),{exposure:J[0],lnLum:J[1]}}return{composer:I,dof:re,lens:be,bloom:Ne,smaa:le,setSize:k,update:A,render:w,warm:ee,motion:O,auto:P,trails:U,ao:f,resetMotion(){M=!0},snapExposure(){De.snap=!0},getExposure:_,cine:!!V,fx:V?V.fx:null,look:V?V.look:null,grade:V?V.grade:null,lensFrame:V?z=>V.lensFrame(z):()=>{},scrim:V?(z,p,B,Y,Q)=>V.scrim(z,p,B,Y,Q):()=>{},edge:V?(z,p,B,Y)=>V.edge(z,p,B,Y):()=>{},setDofHalf:V?z=>V.setDofHalf(z):()=>{},setQuality:V?z=>V.setQuality(z):()=>{},setPostQuality:V?z=>V.setQuality(z):()=>{},getQuality:()=>V?V.level:-1,get toneMerge(){return V?V.toneMerge:!1},set toneMerge(z){V&&(V.toneMerge=z)},get frame(){return V?V.frame:0},set frame(z){V&&(V.frame=z)},gpuTimes:V?()=>V.gpuTimes():()=>null}}var Ur=`
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
`,Si=new Set;function Ai({THREE:e,renderer:t,cam:a,composer:s,scenePass:o,mbPass:u,dof:S,tonePass:g,smaa:L,bloom:m,FS_VERT:O,low:P=!1,hdr:U=f=>f}){let f=e.HalfFloatType,i=e.LinearFilter,F=(he=!0)=>{let Ve=new e.WebGLRenderTarget(1,1,{type:f,depthBuffer:!1,minFilter:i,magFilter:i,generateMipmaps:!1});return he?U(Ve):Ve},I=new Zt(null),$=(he,Ve)=>new e.ShaderMaterial({uniforms:Ve,vertexShader:O,fragmentShader:he,depthTest:!1,depthWrite:!1}),K=(he,Ve)=>{I.material=he,t.setRenderTarget(Ve),I.render(t)},R={flash:0,heat:0,heatAt:null,dirt:0,streak:1,streakAdd:0,bloom:0},Me={bloom:.5,threshold:1,knee:.6,streakThr:6,streak:0,streakTint:new e.Color(.86,.92,1),vignette:.3,grain:.04,taaStill:.9,taaMove:.7},pe={expK:1,wr:1,wg:1,wb:1,contrast:1,saturation:1,lift:0,gamma:1,gain:1},H=[{aa:0,div:2,lv:3,streak:!1},{aa:1,div:2,lv:4,streak:!0},{aa:2,div:1,lv:5,streak:!0},{aa:3,div:1,lv:5,streak:!0}],re=[.46,.3,.15,.06,.03],Ne=-1,me=H[3],De=!1,le=0,be=F(!1),V=!1;S.uniforms.uW={value:1};let oe=new e.ShaderMaterial({uniforms:S.uniforms,defines:{...S.materialBokeh.defines},vertexShader:O,depthTest:!1,depthWrite:!1,fragmentShader:Ta.fragmentShader.replace("uniform float aspect;","uniform float aspect; uniform float uW;").replace(/gl_FragColor = col \/ 41\.0;\s*gl_FragColor\.a = 1\.0;/,"gl_FragColor = vec4( col.rgb / 41.0, clamp( dofblur.x * 0.4 * uW / 1.5, 0.0, 1.0 ) );")}),Ae=new e.ShaderMaterial({uniforms:{tSharp:{value:null},tBlur:{value:null}},vertexShader:O,depthTest:!1,depthWrite:!1,fragmentShader:"uniform sampler2D tSharp, tBlur; varying vec2 vUv; void main(){ vec4 b = texture2D(tBlur, vUv); gl_FragColor = vec4(mix(texture2D(tSharp, vUv).rgb, b.rgb, b.a), 1.); }"}),fe=F(),de=[],Ce=[],ve=[F(),F()];for(let he=0;he<5;he++)de.push(F()),Ce.push(F());let Fe=$(`
    uniform sampler2D tSrc; uniform vec2 uTexel; uniform float uThr, uKnee; varying vec2 vUv;
    vec3 tap(vec2 o){ vec3 c=texture2D(tSrc,vUv+o*uTexel).rgb; return any(isnan(c)) ? vec3(0.) : min(c,vec3(6e4)); }
    float lum(vec3 c){ return dot(c,vec3(.2126,.7152,.0722)); }
    void main(){
      vec3 a=tap(vec2(-1,-1)), b=tap(vec2(1,-1)), c=tap(vec2(-1,1)), e=tap(vec2(1,1));
      float wa=1./(1.+lum(a)), wb=1./(1.+lum(b)), wc=1./(1.+lum(c)), we=1./(1.+lum(e));   // Karis average: no fireflies
      vec3 m=(a*wa+b*wb+c*wc+e*we)/(wa+wb+wc+we);
      float l=lum(m), s=clamp(l-uThr+uKnee,0.,2.*uKnee); s=s*s/(4.*uKnee+1e-5);
      gl_FragColor=vec4(m*max(s,l-uThr)/max(l,1e-4),1.); }`,{tSrc:{value:null},uTexel:{value:new e.Vector2},uThr:{value:1},uKnee:{value:.6}}),Ue=$(`
    uniform sampler2D tSrc; uniform vec2 uDir; varying vec2 vUv;
    void main(){
      vec3 c=texture2D(tSrc,vUv).rgb*.227027;
      c+=(texture2D(tSrc,vUv+uDir*1.3846154).rgb+texture2D(tSrc,vUv-uDir*1.3846154).rgb)*.3162162;
      c+=(texture2D(tSrc,vUv+uDir*3.2307692).rgb+texture2D(tSrc,vUv-uDir*3.2307692).rgb)*.0702703;
      gl_FragColor=vec4(c,1.); }`,{tSrc:{value:null},uDir:{value:new e.Vector2}}),Ze=$(`
    uniform sampler2D tSrc; uniform vec2 uTexel; uniform float uThr; varying vec2 vUv;
    void main(){
      vec3 c=(texture2D(tSrc,vUv+vec2(-.5,-1.)*uTexel).rgb+texture2D(tSrc,vUv+vec2(.5,-1.)*uTexel).rgb
             +texture2D(tSrc,vUv+vec2(-.5,1.)*uTexel).rgb+texture2D(tSrc,vUv+vec2(.5,1.)*uTexel).rgb)*.25;
      float l=dot(c,vec3(.2126,.7152,.0722));
      gl_FragColor=vec4(c*max(l-uThr,0.)/max(l,1e-4),1.); }`,{tSrc:{value:null},uTexel:{value:new e.Vector2},uThr:{value:6}}),Re=$(`
    uniform sampler2D tSrc; uniform float uStep; uniform float uTx; varying vec2 vUv;
    void main(){ vec3 c=texture2D(tSrc,vUv).rgb; float ws=1.;
      for(int i=1;i<=6;i++){ float w=exp(-float(i)*.42); vec2 o=vec2(float(i)*uStep*uTx,0.);
        c+=(texture2D(tSrc,vUv+o).rgb+texture2D(tSrc,vUv-o).rgb)*w; ws+=2.*w; }
      gl_FragColor=vec4(c/ws,1.); }`,{tSrc:{value:null},uStep:{value:1},uTx:{value:1}});u.mTaa=$(`
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
      gl_FragColor=vec4(max((c*wc+h*wh)/(wc+wh),vec3(0.)),1.); }`,{tColor:{value:null},tDepth:{value:null},tHist:{value:null},invVP:{value:null},histVP:{value:null},res:{value:new e.Vector2(1,1)},valid:{value:0},wStill:{value:.9},wMove:{value:.7}}),u.direct=!0;let je=Ci(e),ge={tDiffuse:{value:null},tExp:{value:null},tB0:{value:Ce[0].texture},tB1:{value:Ce[1].texture},tB2:{value:Ce[2].texture},tB3:{value:Ce[3].texture},tB4:{value:Ce[4].texture},tS:{value:ve[1].texture},tDirt:{value:je},uBw:{value:new e.Vector4},uBw4:{value:0},uBloom:{value:.3},uStreak:{value:0},uSTint:{value:Me.streakTint},uFlash:{value:0},uDirt:{value:0},uDial:{value:0},uExpK:{value:1},uWB:{value:new e.Vector3(1,1,1)},uCon:{value:1},uSat:{value:1},uLift:{value:0},uGam:{value:1},uGain:{value:1}},M=`uniform sampler2D tDiffuse, tExp, tB0, tB1, tB2, tB3, tB4, tS, tDirt; uniform vec4 uBw; uniform float uBw4, uBloom, uStreak, uFlash, uDirt; uniform vec3 uSTint;
    uniform float uDial, uExpK, uCon, uSat, uLift, uGam, uGain; uniform vec3 uWB;`,h=`
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
      return o; }`;g.mTone=$(`
    ${M}
    varying vec2 vUv;
    ${Ur}
    ${h}
    void main(){ gl_FragColor=vec4(toneAt(vUv),1.); }`,ge);let k={tDiffuse:{value:null},res:{value:new e.Vector2(1,1)},time:{value:0},grain:{value:Me.grain},vig:{value:Me.vignette},heat:{value:0},heatAt:{value:new e.Vector2(.5,.5)},heatLocal:{value:0},fxaa:{value:0},scrim:{value:new e.Vector4(.5,.5,1,1)},scrimK:{value:0},edgeC:{value:new e.Vector3},edgeK:{value:0},edgeH:{value:.3},edgeG:{value:0}},A="uniform vec4 scrim; uniform vec3 edgeC; uniform float time, grain, vig, scrimK, edgeK, edgeH, edgeG;",w=`
    float vh(vec2 p){ return cH12(p*1.17+.31); }
    vec3 lensFinish(vec3 col){
      vec2 c=vUv-.5; float r2=dot(c,c);
      col*=mix(1.,smoothstep(.75,.12,r2*1.6),vig);
      if(scrimK>0.){ vec2 q=(vUv-scrim.xy)/scrim.zw; col*=1.-scrimK*exp(-dot(q,q)); } // a printer's burn under the copy, never a box
      float ey=vUv.y/edgeH;
      col+=edgeG*vec3(1.,.6,.32)*exp(-(ey-.8)*(ey-.8)*2.5);                   // warm haze rising off the bottom of the frame, just above the fade
      col=clamp(cineGrain(col,gl_FragCoord.xy,time,grain),0.,1.);
      if(edgeK>0.){ float m=1.-smoothstep(0.,1.,ey); col=mix(col,edgeC,edgeK*m*m*(3.-2.*m)); } // after the grain: the last rows are the next section's colour exactly
      return col; }`,ee=$(`
    uniform sampler2D tDiffuse; uniform vec2 res, heatAt; uniform float heat, heatLocal, fxaa; ${A} varying vec2 vUv;
    ${Ur}
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
      gl_FragColor=vec4(lensFinish(col),1.); }`,k),J=new URLSearchParams(location.search).get("tonemerge")!=="0";g.mMerge=$(`
    ${M} ${A} varying vec2 vUv;
    ${Ur}
    ${h}
    ${w}
    void main(){ gl_FragColor=vec4(lensFinish(toneAt(vUv)),1.); }`,Object.assign({},k,ge)),g.merge=!1;let _=1,z=1,p=1,B=1;function Y(){_=s.renderTarget1.width,z=s.renderTarget1.height,k.res.value.set(_,z),p=Math.max(1,_>>me.div),B=Math.max(1,z>>me.div),be.setSize(Math.max(1,_>>1),Math.max(1,z>>1)),fe.setSize(p,B),Fe.uniforms.uTexel.value.set(.5*(1<<me.div)/_,.5*(1<<me.div)/z);let he=p,Ve=B;for(let r=0;r<5;r++){let l=Math.max(1,r?he>>1:he),C=Math.max(1,r?Ve>>1:Ve);de[r].setSize(l,C),Ce[r].setSize(l,C),he=l,Ve=C}let $e=Math.max(1,p>>1),Ye=Math.max(1,B>>2);ve[0].setSize($e,Ye),ve[1].setSize($e,Ye),Ze.uniforms.uTexel.value.set(1/p,1/B);let Je=0;for(let r=0;r<me.lv;r++)Je+=re[r];let He=r=>r<me.lv?re[r]/Je:0;ge.uBw.value.set(He(0),He(1),He(2),He(3)),ge.uBw4.value=He(4),u.histOk=!1}function Q(he){De=!0,he=Math.max(0,Math.min(3,Math.round(+he||0))),he!==Ne&&(Ne=he,me=H[he],Mt.level=he,Y(),me.aa!==3&&u.hist&&(u.hist.forEach(Ve=>Ve.dispose()),u.hist=null,u.histOk=!1))}let j=t.getContext(),Z=j.getExtension&&j.getExtension("EXT_disjoint_timer_query_webgl2"),ye={},ze=[],we=!1,Pe=he=>{if(!we||!Z)return null;let Ve=j.createQuery();return j.beginQuery(Z.TIME_ELAPSED_EXT,Ve),[he,Ve]},ue=he=>{he&&(j.endQuery(Z.TIME_ELAPSED_EXT),ze.push(he))};function Ee(){if(!Z||!ze.length)return;let he=j.getParameter(Z.GPU_DISJOINT_EXT);for(let Ve=ze.length-1;Ve>=0;Ve--){let[$e,Ye]=ze[Ve];if(j.getQueryParameter(Ye,j.QUERY_RESULT_AVAILABLE)){if(!he){let Je=j.getQueryParameter(Ye,j.QUERY_RESULT)/1e6;ye[$e]=ye[$e]==null?Je:ye[$e]*.9+Je*.1}j.deleteQuery(Ye),ze.splice(Ve,1)}}}let _e=()=>s.renderTarget1,rt=()=>s.renderTarget2,yt=he=>he===_e().texture?rt():_e(),kt={texture:null},mt=(he,Ve)=>{let $e=1,Ye=0;for(;he>0;)$e/=Ve,Ye+=$e*(he%Ve),he=Math.floor(he/Ve);return Ye};function tt(he){if(!he){o.jx=o.jy=0;return}let Ve=le%8+1;o.jx=mt(Ve,2)-.5,o.jy=mt(Ve,3)-.5}function Pt(he=!1,Ve=0){Ne<0&&(Q(P?1:3),De=!1),le++,Ee();let $e=t,Ye=he?Ve?{aa:1,lv:5,streak:!0}:{aa:2,lv:5,streak:!0}:me,Je=Pe("scene");o.enabled&&(o.useRT=!0,o.render($e)),ue(Je);let He=o.rt.texture;if(Je=Pe("hdrfx"),u.enabled){let te=u.mTaa.uniforms;te.wStill.value=Me.taaStill,te.wMove.value=Me.taaMove,u.render($e,_e()),He=u.outTex||_e().texture}if(ue(Je),Je=Pe("dof"),S.enabled){let te=S.uniforms,G=yt(He);te.tColor.value=He,te.tDepth.value=o.rt.depthTexture,te.nearClip.value=a.near,te.farClip.value=a.far,(V||he)&&(te.uW.value=_,K(oe,be),Ae.uniforms.tSharp.value=He,Ae.uniforms.tBlur.value=be.texture,K(Ae,G)),(!V||he)&&($e.setRenderTarget(G),S.fsQuad.render($e)),He=G.texture}ue(Je),Je=Pe("bloom"),Fe.uniforms.tSrc.value=He,Fe.uniforms.uThr.value=Me.threshold,Fe.uniforms.uKnee.value=Me.knee,K(Fe,fe);for(let te=0;te<Ye.lv;te++){let G=de[te].width,E=de[te].height;Ue.uniforms.tSrc.value=te?Ce[te-1].texture:fe.texture,Ue.uniforms.uDir.value.set(1/G,0),K(Ue,de[te]),Ue.uniforms.tSrc.value=de[te].texture,Ue.uniforms.uDir.value.set(0,1/E),K(Ue,Ce[te])}let r=Me.streak+R.streakAdd,l=Ye.streak&&(he||R.streak>0&&r>0);if(l){Ze.uniforms.tSrc.value=fe.texture,Ze.uniforms.uThr.value=Math.max(0,Me.streakThr-Me.threshold),K(Ze,ve[1]);let te=1/ve[0].width;Re.uniforms.uTx.value=te,Re.uniforms.tSrc.value=ve[1].texture,Re.uniforms.uStep.value=1,K(Re,ve[0]),Re.uniforms.tSrc.value=ve[0].texture,Re.uniforms.uStep.value=4,K(Re,ve[1]),Re.uniforms.tSrc.value=ve[1].texture,Re.uniforms.uStep.value=16,K(Re,ve[0]),ge.tS.value=ve[0].texture}ue(Je);let C=he?.5:Math.max(0,R.heat),x=J&&!he&&C<=0&&(Ye.aa===0||Ye.aa===3);k.time.value=Mt.time,k.fxaa.value=Ye.aa===1?1:0,k.grain.value=Me.grain,k.vig.value=Me.vignette,k.heat.value=C,R.heatAt?(k.heatAt.value.set(R.heatAt[0],R.heatAt[1]),k.heatLocal.value=1):k.heatLocal.value=0,Je=Pe("tone");let d=m.strength;ge.uBloom.value=Me.bloom*d*(1+R.bloom),ge.uStreak.value=l?r*R.streak:0,ge.uFlash.value=he?.5:Math.min(1,Math.max(0,R.flash)),ge.uDirt.value=he?1:Math.max(0,R.dirt);let q=pe,v=q.expK!==1||q.wr!==1||q.wg!==1||q.wb!==1||q.contrast!==1||q.saturation!==1||q.lift!==0||q.gamma!==1||q.gain!==1;ge.uDial.value=v?1:0,v&&(ge.uExpK.value=q.expK,ge.uWB.value.set(q.wr,q.wg,q.wb),ge.uCon.value=q.contrast,ge.uSat.value=q.saturation,ge.uLift.value=q.lift,ge.uGam.value=1/Math.max(.05,q.gamma),ge.uGain.value=q.gain),g.merge=x;let T=yt(He);if(kt.texture=He,g.render($e,T,kt),He=T.texture,ue(Je),!x){if(Je=Pe("aa"),Ye.aa===2){let te=yt(He);L.renderToScreen=!1,L.render($e,te,T),He=te.texture}ue(Je),Je=Pe("lens"),k.tDiffuse.value=He,K(ee,null),he&&K(g.mMerge,null),ue(Je)}}let Mt={fx:R,look:Me,grade:pe,level:Ne,time:0,taaOn:()=>Ne<0?!P:me.aa===3,get toneMerge(){return J},set toneMerge(he){J=!!he},get frame(){return le},set frame(he){le=he|0},jitter:tt,render:Pt,setSize:Y,setQuality:Q,setDofHalf(he){V=!!he},profile(he=!0){return we=!!he&&!!Z,we},scrim(he,Ve,$e,Ye,Je){k.scrim.value.set(he,Ve,Math.max(.001,$e),Math.max(.001,Ye)),k.scrimK.value=Math.max(0,Je)},edge(he,Ve,$e,Ye){k.edgeK.value=Math.max(0,Math.min(1,he)),k.edgeC.value.set(Ve[0],Ve[1],Ve[2]),k.edgeH.value=Math.max(.05,$e),k.edgeG.value=Math.max(0,Ye)},lensFrame({entry:he=-1,gR:Ve=-1,plume:$e=null}={}){let Ye=(T,te,G)=>{let E=Math.min(1,Math.max(0,(G-T)/(te-T)));return E*E*(3-2*E)},Je=(T,te,G)=>Math.exp(-(((T-te)/G)**2)),He=he>0&&he<1?1:0,r=he,l=He*.9*Ye(.05,.22,r)*(1-Ye(.42,.62,r)),C=He*.85*Je(r,.3,.045),x=He*.7*Ye(.16,.3,r)*(1-Ye(.3,.52,r)),d=He*.6*Ye(.1,.3,r)*(1-Ye(.3,.55,r)),q=Ve>=.78?Ye(.79,.83,Ve):0,v=Ve>=.78?.25*Je(Ve,.835,.012):0;R.heat=Math.max(l,$e?.55*q:0),R.heatAt=l>=.55*q||!$e?null:[$e[0],$e[1]],R.flash=Math.max(C,v),R.dirt=Math.max(x,.45*q),R.bloom=Math.max(d,.25*q),R.streak=1+.3*q,R.streakAdd=.3*q},gpuTimes(){we=!!Z;let he={},Ve=0;for(let $e in ye)he[$e]=+ye[$e].toFixed(3),Ve+=ye[$e];return he.total=+Ve.toFixed(3),he.supported=!!Z,he}};return Y(),Si.add(Mt),Mt}function Ci(e){if(typeof document>"u")return null;let t=document.createElement("canvas");t.width=512,t.height=288;let a=t.getContext("2d"),s=7,o=()=>(s=s*16807%2147483647)/2147483647;a.fillStyle="#000",a.fillRect(0,0,512,288),a.globalCompositeOperation="lighter";for(let S=0;S<90;S++){let g=o()*512,L=o()*288,m=3+o()*o()*46,O=.03+o()*.09,P=a.createRadialGradient(g,L,0,g,L,m);P.addColorStop(0,`rgba(255,238,214,${O})`),P.addColorStop(.6,`rgba(255,232,206,${O*.45})`),P.addColorStop(1,"rgba(0,0,0,0)"),a.fillStyle=P,a.beginPath(),a.arc(g,L,m,0,6.2832),a.fill()}a.lineWidth=2;for(let S=0;S<7;S++){let g=o()*512,L=o()*288,m=14+o()*30,O=.05+o()*.05;a.strokeStyle=`rgba(255,236,220,${O})`,a.beginPath();for(let P=0;P<=6;P++){let U=P/6*6.2832+.3;a[P?"lineTo":"moveTo"](g+m*Math.cos(U),L+m*Math.sin(U))}a.stroke()}let u=new e.CanvasTexture(t);return u.colorSpace=e.NoColorSpace,u}var Vo=7e3,Di=[-1,.22,-.55];function pa(e,t,a){let s=e*Math.PI/180,o=t*Math.PI/180;return new a(Math.cos(o)*Math.cos(s),Math.sin(o),-Math.cos(o)*Math.sin(s))}function zi(e,t,a){let s=e.Vector3,o=pa(266.40499,-28.93617,s),u=pa(192.85948,27.12825,s),S=new s().crossVectors(u,o),g=t.clone().normalize(),L=a.clone().sub(g.clone().multiplyScalar(a.dot(g))).normalize(),m=new s().crossVectors(L,g),O=new e.Matrix4().makeBasis(o,S,u),U=new e.Matrix4().makeBasis(g,m,L).multiply(O.transpose());return new e.Quaternion().setFromRotationMatrix(U)}function Pi(e){let t=e.Vector3,a=new t(...Di).normalize(),s=new t(0,1,0).addScaledVector(a,-a.y).normalize(),o=new t().crossVectors(a,s).normalize(),u=30*Math.PI/180,S=72*Math.PI/180,g=o.clone().multiplyScalar(Math.cos(u)).addScaledVector(s,Math.sin(u)),L=new t().crossVectors(a,g).normalize(),m=a.clone().multiplyScalar(Math.cos(S)).addScaledVector(g,Math.sin(S));return zi(e,m,L)}var Li=`
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
}`,ki=`
uniform float uGain; varying vec3 vCol; varying float vI;
void main(){
  float d = length(gl_PointCoord - 0.5) * 2.;
  float core = 1. - smoothstep(0., 1., d);     // round falloff (same curve as before, written with ordered edges)
  float a = core * core;
  if (a < 0.003) discard;
  gl_FragColor = vec4(vCol * vI * a * uGain, 1.);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`,Fi="varying vec3 vDir; void main(){ vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }",Oi=`
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
}`,Bi=Li.replace("gl_PointSize = s * uPx;","float ps = s * uPx, pw = max(ps, 2.2); vI *= (ps * ps) / (pw * pw) * 1.25; gl_PointSize = pw;"),Vi=ki.replace(`float core = 1. - smoothstep(0., 1., d);     // round falloff (same curve as before, written with ordered edges)
  float a = core * core;`,"float a = exp(-d * d * 4.5);"),Ni=`
attribute float aI; uniform float uPx; varying float vI;
void main(){ vI = aI; gl_PointSize = 2.0 * uPx; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,Ui=`
varying float vI;
void main(){ float d = length(gl_PointCoord - 0.5) * 2.; float a = exp(-d * d * 3.); if (a < 0.01) discard;
  gl_FragColor = vec4(vec3(1., 0.93, 0.86) * vI * a, 1.);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;async function Yn({THREE:e,scene:t,starsUrl:a,milkyUrl:s,rotation:o=null,milkyWay:u=!0,milkyWayIntensity:S=.3,starGain:g=1,pixelRatio:L=null}={}){S*=1.7;let O=e.Vector3,P=new e.Group;P.name="sky",P.frustumCulled=!1,o&&o.isQuaternion?P.quaternion.copy(o):o&&o.isEuler?P.setRotationFromEuler(o):Array.isArray(o)?P.rotation.set(o[0],o[1],o[2]):P.quaternion.copy(Pi(e));let U=await(await fetch(a)).arrayBuffer(),f=new Float32Array(U),i=f.length/5,F=new Float32Array(i*3),I=new Float32Array(i),$=new Float32Array(i);for(let re=0;re<i;re++)F[re*3]=f[re*5]*Vo,F[re*3+1]=f[re*5+1]*Vo,F[re*3+2]=f[re*5+2]*Vo,I[re]=f[re*5+3],$[re]=f[re*5+4];let K=new e.BufferGeometry;K.setAttribute("position",new e.BufferAttribute(F,3)),K.setAttribute("aMag",new e.BufferAttribute(I,1)),K.setAttribute("aBV",new e.BufferAttribute($,1));let R=new e.ShaderMaterial({vertexShader:Bi,fragmentShader:Vi,uniforms:{uPx:{value:L||Math.min(window.devicePixelRatio||1,2)},uGain:{value:g}},transparent:!0,blending:e.AdditiveBlending,depthWrite:!1,depthTest:!0,fog:!1}),Me=new e.Points(K,R);Me.frustumCulled=!1,Me.renderOrder=-9,Me.name="sky-stars",P.add(Me);{let re=pa(192.85948,27.12825,O),Ne=26e3,me=new Float32Array(Ne*3),De=new Float32Array(Ne),le=new O,be=99,V=()=>(be=be*16807%2147483647)/2147483647;for(let fe=0,de=0;fe<Ne;de++){le.set(V()*2-1,V()*2-1,V()*2-1);let Ce=le.length();if(Ce>1||Ce<.05)continue;le.divideScalar(Ce);let ve=Math.abs(le.dot(re));V()>.12+.88*Math.exp(-ve*ve/.02)||(me[fe*3]=le.x*Vo*.995,me[fe*3+1]=le.y*Vo*.995,me[fe*3+2]=le.z*Vo*.995,De[fe]=.035+.11*Math.pow(V(),3),fe++)}let oe=new e.BufferGeometry;oe.setAttribute("position",new e.BufferAttribute(me,3)),oe.setAttribute("aI",new e.BufferAttribute(De,1));let Ae=new e.Points(oe,new e.ShaderMaterial({vertexShader:Ni,fragmentShader:Ui,uniforms:{uPx:R.uniforms.uPx},transparent:!0,blending:e.AdditiveBlending,depthWrite:!1,depthTest:!0,fog:!1}));Ae.frustumCulled=!1,Ae.renderOrder=-9,Ae.name="sky-starhaze",P.add(Ae)}let pe=null;if(u){let re=await bo(e,s,{flipY:!0}).catch(()=>null);if(re){re.colorSpace=e.SRGBColorSpace,re.anisotropy=4,re.wrapS=e.RepeatWrapping;let Ne=pa(192.85948,27.12825,O),me=pa(266.40499,-28.93617,O),De=new O().crossVectors(Ne,me),le=new e.ShaderMaterial({vertexShader:Fi,fragmentShader:Oi,side:e.BackSide,uniforms:{map:{value:re},gc:{value:me},gy:{value:De},ngp:{value:Ne},uInt:{value:S},uSat:{value:.8},uTexel:{value:new e.Vector2(1/re.image.width,1/re.image.height)}},depthWrite:!1,depthTest:!1,fog:!1});pe=new e.Mesh(new e.SphereGeometry(Vo*.99,64,32),le),pe.frustumCulled=!1,pe.renderOrder=-10,pe.name="sky-milkyway",P.add(pe)}}return t.add(P),{group:P,stars:Me,milkyWay:pe,update:re=>{P.position.copy(re)},starCount:i,starMaterial:R}}var Ii=`
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
`,Qn=`
float ah(vec2 p){ p = fract(p * vec2(443.897, 441.423)); p += dot(p, p.yx + 19.19); return fract((p.x + p.y) * p.x); }
float ah3(vec3 p){ p = fract(p * 0.3183099 + .1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float an(vec2 x){ vec2 i = floor(x), f = fract(x); f = f * f * (3. - 2. * f);
  return mix(mix(ah(i), ah(i + vec2(1, 0)), f.x), mix(ah(i + vec2(0, 1)), ah(i + vec2(1, 1)), f.x), f.y); }
// fbm with each octave faded to its mean as it nears the pixel footprint (fw = footprint in units of the base octave): no shimmer
float afbm(vec2 p, float fw){ float v = 0., a = .5; for (int i = 0; i < 5; i++){ float k = 1. - smoothstep(.25, .6, fw); v += a * mix(.5, an(p), k); p = p * 2.03 + 17.1; fw *= 2.03; a *= .5; } return v; }
`,Gi=`
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
}`,Ti="varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }",Ir=`
${Qn}
${Ii}
${Gi}
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
}`,Wi=`
uniform vec3 uSun, uOrigin; uniform float uK, uNight, uT, uAmb, uFogN, uFogF;
varying vec3 vW;
${Ir}
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
}`,ji="varying vec2 vS; void main(){ vS = position.xy; gl_Position = vec4(position.xy, 0., 1.); }",qi=`
uniform float uE, uT, uAsp, uFlow; uniform vec3 uSky, uLit; uniform vec2 uSunS;
varying vec2 vS;
${Qn}
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
}`;function Zn({THREE:e,origin:t=new e.Vector3(0,-6e3,0)}={}){let a=e.MathUtils.smoothstep,s=R=>Math.min(1,Math.max(0,R)),o={uSun:{value:new e.Vector3(-.9,.33,-.2).normalize()},uOrigin:{value:t.clone()},uK:{value:1},uNight:{value:0},uT:{value:0},uAmb:{value:1},uFogN:{value:500},uFogF:{value:4200}},u=new e.Mesh(new e.SphereGeometry(6e3,64,32),new e.ShaderMaterial({vertexShader:Ti,fragmentShader:Wi,uniforms:o,side:e.BackSide,depthWrite:!1,depthTest:!1,fog:!1}));u.frustumCulled=!1,u.renderOrder=-20,u.visible=!1,u.name="mars-air-dome";let S={uE:{value:0},uT:{value:0},uAsp:{value:1},uFlow:{value:0},uSky:{value:new e.Color(.9,.6,.38)},uLit:{value:new e.Color(1.2,.8,.5)},uSunS:{value:new e.Vector2(-1,.4)}},g=new e.BufferGeometry;g.setAttribute("position",new e.BufferAttribute(new Float32Array([-1,-1,0,3,-1,0,-1,3,0]),3));let L=new e.Mesh(g,new e.ShaderMaterial({vertexShader:ji,fragmentShader:qi,uniforms:S,transparent:!0,depthWrite:!1,depthTest:!1,fog:!1,blending:e.CustomBlending,blendEquation:e.AddEquation,blendSrc:e.OneFactor,blendDst:e.OneMinusSrcAlphaFactor}));L.frustumCulled=!1,L.renderOrder=999,L.visible=!1,L.name="mars-air-veil";let m=new e.Color,O=(R,Me,pe,H)=>{let re=pe.y,Ne=Me.x*pe.x+Me.y*pe.y+Me.z*pe.z,me=Math.max(Me.y,0),De=Math.max(Ne,0),le=a(re,-.1,.12),be=a(re,-.32,0),V=a(Math.pow(me,.42),0,1);R.setRGB(.9+(.34-.9)*V,.62+(.205-.62)*V,.4+(.13-.4)*V);let oe=.68+.55*De**4+.4*De**30;oe*=.38+.62*a(Ne,-.7,.7)+(1-(.38+.62*a(Ne,-.7,.7)))*a(re,.08,.45),oe*=.11*be+(1-.11*be)*le,oe*=.75+.25*a(re,-.3,.6),R.multiplyScalar(oe);let Ae=(De**90*2.2+De**16*.45+De**5*.08)*be*(.95+(.3-.95)*le);R.r+=.3*Ae+.0022,R.g+=.5*Ae+.0028,R.b+=.98*Ae+.0055;let fe=Math.pow(H,2.6)+(Math.pow(H,.6)-Math.pow(H,2.6))*Math.exp(-me*7);return R.multiplyScalar(fe),R},P=new e.Vector3,U=new e.Vector3,f=new e.Vector3,i=(R,Me=o.uSun.value,pe=o.uK.value,H=null)=>{R.setRGB(0,0,0);let re=0;for(let Ne=0;Ne<8;Ne++){let me=Ne/8*Math.PI*2;P.set(Math.cos(me),.03,Math.sin(me)).normalize();let De=H?1+Math.max(0,P.x*H.x+P.z*H.z)*2:1;O(m,P,Me,pe),R.r+=m.r*De,R.g+=m.g*De,R.b+=m.b*De,re+=De}return R.multiplyScalar(1/re)},F=R=>(P.set(0,1,0),O(R,P,o.uSun.value,1),i(m),R.lerp(m,.5)),I={e:0,flow:0,prevE:0};function $(R,Me={}){R=s(R);let{inCol:pe=!1,cam:H=null,t:re=0,dt:Ne=0,alt:me=0,fog:De=null,sunDir:le=null,night:be=0}=Me;if(I.flow+=(Ne||0)*.12+Math.abs(R-I.prevE)*4,I.prevE=R,I.e=R,S.uE.value=R,S.uT.value=re,S.uFlow.value=I.flow,H&&(S.uAsp.value=H.aspect||1),L.visible=R>.005&&R<.7,le&&o.uSun.value.copy(le).normalize(),o.uNight.value=be,o.uT.value=re,o.uK.value=pe?.35+.65*a(R,.3,.52):0,o.uAmb.value=1-.85*be,u.visible=!!pe,H&&pe&&(u.position.copy(H.position),u.updateMatrixWorld()),i(S.uSky.value,o.uSun.value,1),S.uSky.value.lerp(m.setRGB(.55,.22,.12),1-a(R,.22,.4)),S.uLit.value.copy(S.uSky.value).multiplyScalar(1.9),H&&(U.copy(o.uSun.value).transformDirection(H.matrixWorldInverse),S.uSunS.value.set(U.x,U.y).normalize()),De&&pe){H&&H.getWorldDirection(f),i(De.color,o.uSun.value,o.uK.value,H?f:null);let V=Math.max(0,me),oe=a(R,.45,1);De.near=500+V*1.5*(1-oe*.5),De.far=Math.max(4200,(4200+V*6)*(.55+.45*oe)),o.uFogN.value=De.near,o.uFogF.value=De.far}}return{dome:u,veil:L,entry:$,roots:()=>[L,u],hemi:F,horizon:i,skyAt:O,state:I,uniforms:{dome:o,veil:S}}}var ga=`
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
`,Xa=`
varying vec3 vP; varying vec2 vUv; varying vec3 vV;
void main(){
  vP = position; vUv = uv;
  mat3 M = mat3(modelMatrix); vec4 w = modelMatrix * vec4(position, 1.);
  vV = transpose(M) * (cameraPosition - w.xyz);           // view vector in object space (meshes only rotate)
  gl_Position = projectionMatrix * viewMatrix * w;
}`,Xi=`
uniform sampler2D tMap, tSpec, tNorm, tLights, tClouds;
uniform vec3 uSun; uniform float uGrow, uCloudOff, uCloudH, uSunI;
varying vec3 vP; varying vec2 vUv; varying vec3 vV;
${ga}
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
}`,Ki=`
uniform sampler2D tClouds; uniform vec3 uSun; uniform float uSunI; uniform sampler2D tLights; uniform vec4 uHole;
varying vec3 vP; varying vec2 vUv; varying vec3 vV;
${ga}
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
}`,Yi=`
uniform sampler2D tMap, tNorm; uniform vec3 uSun; uniform float uSunI, uAlbedo, uRelief;
varying vec3 vP; varying vec2 vUv; varying vec3 vV;
${ga}
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
}`,Qi=`
uniform sampler2D tMap, tNorm; uniform vec3 uSun; uniform float uSunI, uRelief, uDomes, uBump, uR;
varying vec3 vP; varying vec2 vUv; varying vec3 vV;
${ga}
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
}`,Zi=`
varying vec3 vN; varying vec3 vO;
void main(){ vN = normal; vO = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,Ji=`
uniform vec3 uSun; uniform float uSunI, uA;
varying vec3 vN; varying vec3 vO;
${ga}
void main(){
  vec3 N = normalize(vN), L = normalize(uSun);
  float n = fbm3(vO * 9.);
  vec3 alb = vec3(0.075, 0.064, 0.056) * (0.8 + 0.4 * n);
  float m0 = max(dot(N, L), 0.);
  vec3 col = alb * m0 * uSunI * 2.2 + alb * 0.02;
  gl_FragColor = vec4(col * uA, uA);
}`,Ri=`
varying vec3 vW;
void main(){ vec4 w = modelMatrix * vec4(position, 1.); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,Jn=`
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
}`;function Rn({THREE:e,scene:t,renderer:a,toSun:s,EARTH:o,MOON:u,MARS:S,files:g}){let P=Math.min(8,a.capabilities.getMaxAnisotropy()),U=[],f={moon:[],mars:[]},i={},F=(w,ee,J,_)=>{let z=new e.DataTexture(new Uint8Array([w,ee,J,255]),1,1);return z.colorSpace=_?e.SRGBColorSpace:e.NoColorSpace,z.needsUpdate=!0,z},I=(w,ee)=>bo(e,w,{flipY:!0,colorSpace:ee?e.SRGBColorSpace:e.NoColorSpace}).then(J=>(J.anisotropy=P,J.wrapS=e.RepeatWrapping,J.needsUpdate=!0,J),()=>null),$=w=>{if(w&&a&&a.initTexture)try{a.initTexture(w)}catch{}},K=(w,ee,J,_)=>{let z={value:J},p=g[w];if(!p)return z;let B=Y=>{Y&&($(Y),z.value=Y)};return _?f[_].push(()=>I(p,ee).then(Y=>({t:Y,swap:B}))):U.push(I(p,ee).then(B)),z},R=()=>new Promise(w=>typeof requestAnimationFrame=="function"?requestAnimationFrame(()=>w()):setTimeout(w,0));function Me(w){return i[w]?i[w]:i[w]=Promise.all(f[w].map(ee=>ee())).then(async ee=>{for(let{t:J,swap:_}of ee)J&&(_(J),await R())})}let pe=()=>({value:new e.Vector3().copy(s)}),H={tMap:K("earth",!0,F(10,30,70,!0)),tSpec:K("earthSpec",!1,F(255,255,255)),tNorm:K("earthNorm",!1,F(128,128,255)),tLights:K("earthLights",!1,F(0,0,0)),tClouds:K("clouds",!1,F(0,0,0)),uSun:pe(),uGrow:{value:.03},uCloudOff:{value:0},uCloudH:{value:.0085},uSunI:{value:3.3}},re=new e.Mesh(new e.SphereGeometry(10,192,96),new e.ShaderMaterial({vertexShader:Xa,fragmentShader:Xi,uniforms:H}));re.position.copy(o),t.add(re);let Ne={tClouds:H.tClouds,tLights:H.tLights,uSun:pe(),uSunI:H.uSunI,uHole:{value:new e.Vector4(0,1,0,0)}},me=new e.Mesh(new e.SphereGeometry(10*1.0085,160,80),new e.ShaderMaterial({vertexShader:Xa,fragmentShader:Ki,uniforms:Ne,transparent:!0,depthWrite:!1}));me.position.copy(o),me.renderOrder=1,t.add(me);let De={tMap:K("moon",!0,F(150,150,150,!0),"moon"),tNorm:K("moonNorm",!1,F(128,128,255),"moon"),uSun:pe(),uSunI:{value:3.3},uAlbedo:{value:.3},uRelief:{value:1.35}},le=new e.Mesh(new e.SphereGeometry(2.7,128,64),new e.ShaderMaterial({vertexShader:Xa,fragmentShader:Yi,uniforms:De}));le.position.copy(u),t.add(le);let be={tMap:K("mars",!0,F(150,70,40,!0),"mars"),tNorm:K("marsNorm",!1,F(128,128,255),"mars"),uSun:pe(),uSunI:{value:2.2},uRelief:{value:1.25},uDomes:{value:1}};be.uBump={value:11},be.uR={value:6};let V=new e.Mesh(new e.SphereGeometry(6*1.015,192,96),new e.ShaderMaterial({vertexShader:Xa,fragmentShader:Qi,uniforms:be,transparent:!0,blending:e.CustomBlending,blendEquation:e.AddEquation,blendSrc:e.OneFactor,blendDst:e.OneMinusSrcAlphaFactor}));V.position.copy(S),t.add(V),V.renderOrder=1;let oe=null;{let w=new e.IcosahedronGeometry(1,4),ee=w.attributes.position,J=new e.Vector3,_=(Pe,ue,Ee)=>{let _e=Math.sin(Pe*12.9898+ue*78.233+Ee*37.719)*43758.5453;return _e-Math.floor(_e)};for(let Pe=0;Pe<ee.count;Pe++){J.fromBufferAttribute(ee,Pe);let ue=1+.1*Math.sin(J.x*3.1+1)*Math.cos(J.y*2.3)+.06*Math.sin(J.z*5.3+J.x*2);ue-=.22*Math.exp(-J.distanceToSquared({x:.85,y:.25,z:.46})/.09),ue-=.05*_(Math.round(J.x*6),Math.round(J.y*6),Math.round(J.z*6)),J.multiplyScalar(ue),J.x*=1.25,J.z*=.88,ee.setXYZ(Pe,J.x,J.y,J.z)}w.computeVertexNormals();let z={uSun:{value:new e.Vector3(1,0,0)},uSunI:be.uSunI,uA:{value:1}};oe=new e.Mesh(w,new e.ShaderMaterial({vertexShader:Zi,fragmentShader:Ji,uniforms:z,transparent:!0,blending:e.CustomBlending,blendEquation:e.AddEquation,blendSrc:e.OneFactor,blendDst:e.OneMinusSrcAlphaFactor})),oe.frustumCulled=!1,oe.renderOrder=1,oe.matrixAutoUpdate=!1,V.add(oe);let p=new e.Vector3(30,10,38).normalize(),B=new e.Vector3(0,1,0).addScaledVector(p,-p.y).normalize(),Y=new e.Vector3().crossVectors(B,p),Q=B.clone().multiplyScalar(.85).addScaledVector(Y,.55).normalize(),j=new e.Quaternion,Z=new e.Vector3,ye=new e.Vector3,ze=new e.Euler,we=new e.Quaternion;oe.alpha=1,oe.size=.12,oe.orbit=1.75*6,oe.phase=null,oe.onBeforeRender=(Pe,ue,Ee)=>{let _e=oe.phase??.3+.18*Math.sin(Ae*.011);ye.copy(Q).multiplyScalar(Math.cos(_e)).addScaledVector(p,Math.sin(_e)).multiplyScalar(oe.orbit).add(V.position),ze.set(.3,Ae*.05,.2),j.setFromEuler(ze),oe.matrixWorld.compose(ye,j,Z.setScalar(oe.size)),we.copy(j).invert(),z.uSun.value.copy(be.uSun.value).applyQuaternion(V.quaternion).applyQuaternion(we);let rt=Ee.position.distanceTo(V.position);z.uA.value=oe.alpha*e.MathUtils.smoothstep(rt,13,20)}}let Ae=0,fe=(w,ee,J)=>{let _={uCenter:{value:w.clone()},uSun:{value:new e.Vector3().copy(s)},uRp:{value:ee},uRa:{value:ee*J.top},uBetaR:{value:new e.Vector3(...J.bR).divideScalar(ee)},uBetaM:{value:new e.Vector3(...J.bM).divideScalar(ee)},uBetaMe:{value:new e.Vector3(...J.bMe).divideScalar(ee)},uG:{value:new e.Vector3(...J.g)},uSunCol:{value:new e.Vector3(...J.sun)},uHr:{value:J.Hr*ee},uHm:{value:J.Hm*ee},uK:{value:J.k}},z=new e.Mesh(new e.SphereGeometry(ee*J.top,128,64),new e.ShaderMaterial({vertexShader:Ri,fragmentShader:J.frag||Jn,uniforms:_,transparent:!0,depthWrite:!1,blending:e.CustomBlending,blendEquation:e.AddEquation,blendSrc:e.OneFactor,blendDst:e.OneMinusSrcAlphaFactor}));return z.position.copy(w),z.renderOrder=2,t.add(z),z},de=fe(o,10,{top:1.1,Hr:.0085,Hm:.0034,bR:[8,19,48],bM:[24,24,24],bMe:[27,27,27],g:[.8,.8,.8],sun:[1,.97,.92],k:15}),Ce=fe(S,6,{top:1.07,Hr:.0075,Hm:.012,bR:[3,7,18],bM:[5,3.4,1.8],bMe:[6,5,4.4],g:[.55,.72,.9],sun:[1,.95,.88],k:12,frag:Jn.replace("clamp(1. - tr, 0., 1.) * 0.85","clamp(1. - tr, 0., 1.) * 0.25")}),ve=[de,Ce],Fe=new e.Quaternion,Ue=new e.Vector3,Ze=(w,ee)=>{Fe.copy(w.quaternion).invert(),ee.value.copy(s).applyQuaternion(Fe)},Re=.012,je=.0158,ge=new e.Quaternion,M=new e.Vector3;function h({t:w=0,intro:ee=1,camPos:J,spin:_=0,hole:z}={}){if(re.rotation.y=_+w*Re,me.rotation.y=_+w*je,z&&(me.updateMatrixWorld(),ge.copy(me.quaternion).invert(),M.copy(z).applyQuaternion(ge),Ne.uHole.value.set(M.x,M.y,M.z,1)),le.rotation.y=w*.01,V.rotation.y=w*.02,Ae=w,Ze(re,H.uSun),Ze(me,Ne.uSun),Ze(le,De.uSun),Ze(V,be.uSun),H.uCloudOff.value=(re.rotation.y-me.rotation.y)/(2*Math.PI),H.uGrow.value=.03+.97*ee,J)for(let p of ve){let Y=Ue.copy(J).sub(p.position).length()<p.material.uniforms.uRa.value*1.002?e.BackSide:e.FrontSide;p.material.side!==Y&&(p.material.side=Y,p.material.needsUpdate=!0)}}let k=null;return k=Zn({THREE:e}),t.add(k.dome,k.veil),{earth:re,moon:le,mars:V,clouds:me,earthAtmo:de,marsAtmo:Ce,phobos:oe,air:k,entry:k?(w,ee)=>k.entry(w,ee):void 0,entryRoots:k?k.roots:void 0,ready:Promise.all(U),loadDeferred:Me,update:h}}var zt=e=>Math.min(1,Math.max(0,e)),vt=(e,t,a)=>e<=t?0:e>=a?1:(e=(e-t)/(a-t),e*e*(3-2*e)),ao=e=>1-Math.pow(1-zt(e),3),Kt=e=>e*e*e*(e*(e*6-15)+10),gt=(e,t,a)=>e+(t-e)*a;function vo(e,t,a,s){let o=e.length,u=[],S=[],g=new Array(o);if(o===2){let m=(t[1]-t[0])/(e[1]-e[0]||1);return O=>O>=e[1]?t[1]:t[0]+m*(O-e[0])}for(let m=0;m<o-1;m++)u[m]=e[m+1]-e[m],S[m]=(t[m+1]-t[m])/u[m];for(let m=1;m<o-1;m++)if(S[m-1]*S[m]<=0)g[m]=0;else{let O=2*u[m]+u[m-1],P=u[m]+2*u[m-1];g[m]=(O+P)/(O/S[m-1]+P/S[m])}let L=(m,O,P,U)=>{let f=((2*m+O)*P-m*U)/(m+O);return Math.sign(f)!==Math.sign(P)?f=0:Math.sign(P)!==Math.sign(U)&&Math.abs(f)>3*Math.abs(P)&&(f=3*P),f};return g[0]=a!==void 0?a*S[0]:L(u[0],u[1],S[0],S[1]),g[o-1]=s!==void 0?s*S[o-2]:L(u[o-2],u[o-3],S[o-2],S[o-3]),m=>{if(m<=e[0])return t[0]+g[0]*(m-e[0]);if(m>=e[o-1])return t[o-1];let O=0;for(;m>e[O+1];)O++;let P=(m-e[O])/u[O],U=P*P,f=U*P;return(2*f-3*U+1)*t[O]+(f-2*U+P)*u[O]*g[O]+(-2*f+3*U)*t[O+1]+(f-U)*u[O]*g[O+1]}}function Gr(e,t,a){let s=e.length,o=[],u=[],S=a?a.slice():new Array(s).fill(null);for(let g=0;g<s-1;g++)o[g]=e[g+1]-e[g],u[g]=(t[g+1]-t[g])/o[g];for(let g=0;g<s;g++)if(S[g]==null){if(g===0||g===s-1){S[g]=0;continue}if(u[g-1]*u[g]<=0)S[g]=0;else{let L=2*o[g]+o[g-1],m=o[g]+2*o[g-1];S[g]=(L+m)/(L/u[g-1]+m/u[g])}}return g=>{if(g<=e[0])return t[0];if(g>=e[s-1])return t[s-1];let L=0;for(;g>e[L+1];)L++;let m=(g-e[L])/o[L],O=m*m,P=O*m;return(2*P-3*O+1)*t[L]+(P-2*O+m)*o[L]*S[L]+(-2*P+3*O)*t[L+1]+(P-O)*o[L]*S[L+1]}}function Ka(e){return vo(e.map(t=>t[0]),e.map(t=>t[1]))}function Tr(e,t,a,s){e.arcLengthDivisions=Math.max(e.arcLengthDivisions,4e3),e.needsUpdate=!0;let o=e.getLengths(),u=t.length,S=o[o.length-1],g=m=>{let O=m*(o.length-1),P=Math.floor(O);return P>=o.length-1?S:o[P]+(o[P+1]-o[P])*(O-P)},L=vo(t,t.map((m,O)=>g(O/(u-1))),a,s);return m=>e.getUtoTmapping(0,Math.min(S,Math.max(0,L(m))))}function Ya(e,t,a,s,o,u){let S=e.shadow.camera,g=e.shadow.mapSize,L=(S.right-S.left)/g.x,m=(S.top-S.bottom)/g.y;o.set(0,1,0).cross(a).normalize(),u.copy(a).cross(o);let O=t.dot(o),P=t.dot(u);e.target.position.copy(t).addScaledVector(o,Math.round(O/L)*L-O).addScaledVector(u,Math.round(P/m)*m-P),e.position.copy(e.target.position).addScaledVector(a,s)}function _n({THREE:e,SITE_ROT:t,AUS:a,U_PER_M:s,C0:o,L0:u,spaceCam:S}){let i=Math.log(65e4),F=Math.log(o.distanceTo(a)/s),I=i,$=a.clone().normalize(),K=$.clone().negate(),R=o.clone().sub(a).normalize(),Me=o.distanceTo(a),pe=()=>new e.Vector3,H=new e.Quaternion,re=new e.Quaternion,Ne=pe(),me=pe(),De=pe(),le=pe(),be=pe(),V=pe(),oe=pe(),Ae=pe(),fe={},de=null,Ce=null,ve=null,Fe=null,Ue=(je,ge,M,h)=>{for(let k=0;k<60;k++){let A=(M+h)/2;je(A)<ge?M=A:h=A}return(M+h)/2};function Ze(je){Fe=je;let{yA:ge,yT:M,yX:h,yE:k,S:A}=Fe,w=.5,ee=(-3*A(k)+4*A(k+w)-A(k+2*w))/(2*w);S(-1,Ne,le),S(A(k+w),me,le),S(A(k+2*w),De,le);let J=Ne.clone().multiplyScalar(-3).addScaledVector(me,4).addScaledVector(De,-1).divideScalar(2*w),_=J.dot(R),z=Math.max(_,1e-6);fe.dSdy=ee,fe.v0=J.length(),fe.r0=_,fe.r=z;let p=h+.46*(k-h),B=h+.64*(k-h),Y=h+.82*(k-h),Q=z/Me,j=.4/(k-Y);de=vo([ge,M,h,p,B,Y,k],[125,170,290,4e4].map(Math.log).concat(F-1.4,F-.4,F),.7,Q/j),fe.yH=Ue(de,i,ge,k),Ae.copy(J).addScaledVector(R,-_),V.copy(Ae).multiplyScalar((k-fe.yH)/Me);let Z=ye=>Ue(de,Math.log(ye),ge,k);Ce=vo([ge,M,h,Z(1600),Z(7e3),Z(4e4)],[7.9,10.2,13.4,17.9,18.95,19.6],void 0,0),ve=vo([ge,M,h,Z(1600),Z(3e4)],[0,.3,.52,.8,1],void 0,0),Object.assign(fe,{yA:ge,yT:M,yX:h,yM:p,yE:k,LAMH:i,LAM1:F,lamA:de(ge),yNight:Z(4e4),yG1:Z(3e4)})}function Re(je,ge){let{yA:M,yE:h}=Fe,k=Math.min(Math.max(je,M),h),A=de(k),w=Math.exp(A);if(ge.lam=A,ge.s=zt((je-M)/(h-M)),ge.fov=38,ge.hour=Ce(k),ge.g=Math.min(1,ve(k)),k<fe.yH){let z=Kt(zt((A-fe.lamA)/(I-fe.lamA))),p=e.MathUtils.lerp(-.08+.16*(k-M)/(h-M),t,z),B=e.MathUtils.degToRad(56+34*z);return ge.look.set(0,0,-10*(1-z)),ge.pos.set(Math.sin(p)*Math.cos(B),Math.sin(B),Math.cos(p)*Math.cos(B)).multiplyScalar(w).add(ge.look),ge.up.set(-Math.sin(p),0,-Math.cos(p)),ge.world="site",ge.dist=ge.pos.length(),ge.upk=z,ge}let ee=zt((k-fe.yH)/(h-fe.yH)),J=ee*ee,_=J*ee;return be.copy($).multiplyScalar(2*_-3*J+1).addScaledVector(R,3*J-2*_).addScaledVector(V,_-J).normalize(),ge.pos.copy(a).addScaledVector(be,w*s),oe.copy(u).sub(ge.pos).normalize(),H.setFromUnitVectors(K,oe),re.identity().slerp(H,Kt(Math.min(1,ee*1.1))),ge.look.copy(K).applyQuaternion(re).multiplyScalar(w*s).add(ge.pos),ge.up.set(0,1,0),ge.world="globe",ge.dist=w,ge.upk=1,ge}return{layout:Ze,at:Re,k:fe,LAMH:i,LAM1:F}}var Qa=30.250453*Math.PI/180,Wr=-13*Math.PI/180;function Ra(e,t={}){let a=(e-13.1)*15*Math.PI/180,s=Math.sin(Qa)*Math.sin(Wr)+Math.cos(Qa)*Math.cos(Wr)*Math.cos(a),o=Math.asin(s),u=Math.atan2(-Math.sin(a),Math.tan(Wr)*Math.cos(Qa)-Math.sin(Qa)*Math.cos(a));return t.sinE=s,t.el=o,t.az=u,t.x=Math.cos(o)*Math.sin(u),t.y=s,t.z=-Math.cos(o)*Math.cos(u),t}var _i=.79,Za=(e,t,a)=>{let s=Math.min(1,Math.max(0,(e-t)/(a-t)));return s*s*(3-2*s)},Ja=Math.log;function Hn(e,t){let a=1+.3*(1-Za(e,.02,.45)),s=Za(-e,-.02,.12),o=1-.78*Za(t,Ja(2e3),Ja(4e4))*s,u=1+.66*Math.exp(-(((e-.0115)/(e>.0115?.016:.0135))**2)),S=1.05*a*o*u;return S+(_i-S)*Za(t,Ja(2e6),Ja(9e6))}var Ko=e=>{let t=(e%1009+1009)%1009;return(t*t*7+t*31+13)%1009/1009},Bt=(e,t,a)=>{let s=Math.min(1,Math.max(0,(e-t)/(a-t)));return s*s*(3-2*s)},_a=(e,t,a)=>e+(t-e)*a;var Hi=Math.PI/2,Ei=1.9,En=.25,xa=4.5,jr=12,$n=1.2,Qo=(()=>{let e=[],t=0,a=0,s=(f,i,F,I,$)=>{let K=Math.max(1,Math.round(Math.hypot(F-f,I-i)/En));for(let R=0;R<K;R++)e.push(f+(F-f)*R/K,i+(I-i)*R/K,$)},o=(f,i,F,I,$,K)=>{let R=Math.max(1,Math.round(Math.abs($-I)*F/En));for(let Me=0;Me<R;Me++){let pe=I+($-I)*Me/R;e.push(f+Math.cos(pe)*F,i+Math.sin(pe)*F,K)}};s(86,-420,86,-35,jr),o(78,-35,8,0,Math.PI/2,xa),t=e.length/3,s(78,-27,-40,-27,xa),o(-40,0,27,-Math.PI/2,-1.5*Math.PI,xa),a=e.length/3,s(-40,27,78,27,xa),o(78,35,8,-Math.PI/2,0,xa),s(86,35,86,420,jr),e.push(86,420,jr);let u=e.length/3,S=new Float64Array(u),g=new Float64Array(u),L=new Float64Array(u),m=new Float64Array(u),O=new Float64Array(u),P=new Float64Array(u),U=new Float64Array(u);for(let f=0;f<u;f++)S[f]=e[f*3],g[f]=e[f*3+1],L[f]=e[f*3+2],f&&(m[f]=m[f-1]+Math.hypot(S[f]-S[f-1],g[f]-g[f-1]));for(let f=1;f<u;f++)L[f]=Math.min(L[f],Math.sqrt(L[f-1]**2+2*$n*(m[f]-m[f-1])));for(let f=u-2;f>=0;f--)L[f]=Math.min(L[f],Math.sqrt(L[f+1]**2+2*$n*(m[f+1]-m[f])));for(let f=1;f<u;f++)O[f]=O[f-1]+2*(m[f]-m[f-1])/(L[f]+L[f-1]);for(let f=0;f<u;f++){let i=Math.max(0,f-1),F=Math.min(u-1,f+1),I=Math.hypot(S[F]-S[i],g[F]-g[i]);P[f]=(S[F]-S[i])/I,U[f]=(g[F]-g[i])/I}return{n:u,X:S,Z:g,V:L,S:m,T:O,HX:P,HZ:U,sN:m[t],sS:m[a],len:m[u-1],T_DRIVE:O[u-1]}})(),Zo=2,No=66,Ha=No+2*Zo,is=Qo.T_DRIVE+Ha,Ea=is/4;Ha>Ea+14&&Ha<2*Ea-6||console.warn("yard.js: truck timetable out of its window",{DW:Ha,HW:Ea});var es=e=>{let t=Qo,a=0,s=t.n-1;for(e=Math.min(t.len,Math.max(0,e));s-a>1;){let u=a+s>>1;t.S[u]<=e?a=u:s=u}let o=(e-t.S[a])/(t.S[s]-t.S[a]);return t.T[a]+(t.T[s]-t.T[a])*o},ls=0,Xr=0,$i=e=>{let t=Qo,a=0,s=t.n-1;for(e=Math.min(t.T_DRIVE,Math.max(0,e));s-a>1;){let o=a+s>>1;t.T[o]<=e?a=o:s=o}return ls=a,Xr=(e-t.T[a])/(t.T[s]-t.T[a]),t.S[a]+(t.S[s]-t.S[a])*Xr};function el(e,t){let a=Zo,s=e-(t-a);if(s<0)return e;if(s<2*a)return t-a+s-s*s/(4*a);let o=e-(t+a+No);return o<0?t:o<2*a?t+o*o/(4*a):e-No-2*a}var tl=(e,t)=>{let a=Zo,s=e-(t-a);if(s<0)return 1;if(s<2*a)return 1-s/(2*a);let o=e-(t+a+No);return o<0?0:o<2*a?o/(2*a):1},cs=(e,t)=>(e%t+t)%t,$a=(e,t,a)=>{let s=(e-t)/(a-t);return s<=0||s>=1?0:6*s*(1-s)/(a-t)},ol=2.2,al=3,ts=1.2,er=(e,t)=>{let a=e.length,s=2*a-2,o=cs(t,s);return e[o<a?o:s-o]},os=(e,t,a)=>Math.atan2(-(er(e,t)-er(e,t+1)),a);function qr(e,t,a,s,o){let u=s-a,S=t[1]-t[0],g=u/ol,L=Math.hypot(u,S)/al,m=g+L,O=Math.floor(e/m),P=e-O*m,U=er(t,O),f=er(t,O+1);if(P<g){let i=P/g;o.x=a+u*Bt(i,0,1),o.z=U,o.yaw=os(t,O-1,u)*(1-Bt(P,0,ts)),o.v=u*$a(i,0,1)/g}else{let i=(P-g)/L,F=Bt(i,0,1);o.x=s-u*F,o.z=U+(f-U)*F,o.yaw=os(t,O,u)*Bt(P-g,0,ts),o.v=Math.hypot(u,S)*$a(i,0,1)/L}}var rl=[-14,-7,0,7,14],nl=[-14.5,-9.5,-4.5],sl=[27,32,37],as=.45,il=.09,ll=[[0,3,-9.5],[0,3,9.5],[4,3,-12],[-2,1.5,9.5],[0,3,-9.5],[-2,3,11],[0,3,-9.5],[0,3,9.5]],Yo=.5,rs=.6,cl=2,ul=1,fl=.6,ns=.35,hl=.3,_t=10,dl=24,ss=[.06,.07,.1,.3,.404,.42,.44,.455,.46,.484,.512,.54,.568,.596,.624,.652,.69,.72,.8,.85,.86,.95],ml=8e-4,vl=.0025,Jo=[[-60,-42],[60,-42],[-60,42],[20,33]];function us(){let e=[0,1].map(()=>({on:!1,x:0,y:0,z:0,ph:0,sw:0,slew:0,boom:0,stick:0,load:!1,bayTruck:-1})),t=[0,1,2,3].map(()=>({on:!1,x:0,z:0,yaw:0,load:!1,fill:0,v:0,bay:!1})),a=[0,1].map(()=>({x:0,z:-29})),s={ex:e,tr:t,mix:a,dz:{on:!1,x:0,y:0,z:0,yaw:0,v:0},pump:{on:!1,bx:0,z:-29,C:[0,0,0]},crane:{slew:0,tr:0,drop:0},digOn:!1,xf:0,bay:0,pouring:!1,craneOn:!1,up:0,trucksOn:!1},o=new Float64Array(dl*_t),u=new Float64Array(220),S=0,g=0,L=(M,h,k)=>{let A=S++*_t;o[A]=1,o[A+1]=M,o[A+2]=h,o[A+8]=o[A+9]=k},m=(M,h,k,A,w,ee,J,_=0)=>{let z=S++*_t;o[z]=2,o[z+1]=M,o[z+2]=h,o[z+3]=Math.cos(k),o[z+4]=-Math.sin(k),o[z+5]=A+J+_,o[z+6]=w+J+_,o[z+7]=ee+J,o[z+9]=Math.hypot(Math.max(o[z+5],o[z+6]),o[z+7])},O=(M,h,k,A,w,ee,J,_)=>{m(M,h,k,A,w,ee,J),o[(S-1)*_t+5]+=_,o[(S-1)*_t+9]=Math.hypot(Math.max(o[(S-1)*_t+5],o[(S-1)*_t+6]),o[(S-1)*_t+7])},P=[new Float64Array(5),new Float64Array(5)];function U(M){let h=Qo.sN+78,k=Qo.sS- -40,A=P[0];A[0]=h-(M-1.64),A[2]=h-(M+15.5),A[1]=A[2]-22,A[3]=h-(M-15.5),A[4]=A[3]+22,A=P[1],A[0]=k+M+1.64,A[2]=k+M-15.5,A[1]=A[2]-22,A[3]=k+M+15.5,A[4]=A[3]+22}let f=(M,h)=>cs(h-M*Ea,is);function i(M,h,k){if(!s.trucksOn)return-1;for(let A=M;A<4;A+=2){let w=f(A,h);if(w>=k+Zo+.2&&w+7<=k+Zo+No-.2)return A}return-1}let F=M=>M*.37;function I(M,h){let k=h>.06&&h<.42,A=-32+Bt(h,.07,.36)*76;s.digOn=k,s.xf=A,S=0,s.trucksOn=h>.07&&h<.42,m(52,-45,0,9.15,9.15,3.6,Yo),m(62,44,0,3.1,3.1,1.2,Yo);for(let Q=0;Q<Jo.length;Q++)L(Jo[Q][0],Jo[Q][1],2.7+Yo);let w=Bt(h,.4,.47);s.up=w,s.craneOn=w>.01,s.craneOn&&m(-4,4,0,3,3,3,Yo);let ee=Math.min(7,Math.max(0,Math.floor((h-.47)/.028+.5))),J=h>.455&&h<.69;if(s.bay=ee,s.pouring=J,s.pump.on=J,J){let Q=-32+Math.floor(ee/2)*16+8,j=ll[ee];s.pump.bx=Q;let Z=s.pump.C;Z[0]=Q+j[0]+Math.sin(M*as)*j[1],Z[1]=-4+3.5,Z[2]=j[2]+Math.cos(M*as*.8)*2,m(Q,-29,0,6.5,6.38,4.9,Yo);for(let ye=0;ye<2;ye++)a[ye].x=Q+12+ye*11,a[ye].z=-29,m(a[ye].x,-29,0,5.05,5.04,1.43,Yo)}{let Q=M*il,j=s.crane;j.slew=-Math.PI/2+.5*(Math.sin(Q)*.7+Math.sin(Q*2.3)*.3),j.tr=12+(Math.sin(M*.13)*.5+.5)*36,j.drop=10+(Math.sin(M*.21)*.5+.5)*20}let _=Math.min(26,Math.max(-28,A-6));U(_);let z=es(P[0][0]),p=es(P[1][0]);for(let Q=0;Q<2;Q++){let j=e[Q],Z=Q===1&&h>.8,ye=M/7+F(Q),ze=Math.floor(ye),we=ye-ze;j.on=k||Q===1&&h>.8&&h<.95,j.ph=we,j.sw=Bt(we,.35,.55)*(1-Bt(we,.7,.95)),j.x=Z?41:_,j.y=Z?-1:-4*Bt(h,.07,.12),j.z=Q?13:-13;let Pe=Z?-1:i(Q,(ze-F(Q))*7,Q?p:z),ue=j.sw,Ee=Q?-1:1;j.load=Pe>=0,j.bayTruck=-1;let _e=.35-Bt(we,0,.3)*.55,rt=1.05+Bt(we,.05,.33)*.9;if(j.load){let yt=Bt(ue,0,.4);j.slew=ue*Ee*Hi,j.boom=_a(_e,1,yt),j.stick=-_a(rt,.6-Bt(we,.55,.68)*.25,yt)}else j.slew=-ue*Ee*Ei,j.boom=_a(_e,.62,ue),j.stick=-_a(rt,.9-Bt(we,.55,.68)*.5,ue);j.on&&L(j.x,j.z,12)}g=S;for(let Q=0;Q<4;Q++){let j=t[Q],Z=P[Q%2],ye=Q%2?p:z,ze=f(Q,M),we=el(ze,ye),Pe=$i(we),ue=Qo,Ee=ls,_e=Math.min(ue.n-1,Ee+1),rt=Xr;j.on=s.trucksOn;let yt=5.5*Bt(Pe,Z[1],Z[2])*(1-Bt(Pe,Z[3],Z[4])),kt=5.5*($a(Pe,Z[1],Z[2])*(1-Bt(Pe,Z[3],Z[4]))-Bt(Pe,Z[1],Z[2])*$a(Pe,Z[3],Z[4])),mt=ue.HX[Ee]+(ue.HX[_e]-ue.HX[Ee])*rt,tt=ue.HZ[Ee]+(ue.HZ[_e]-ue.HZ[Ee])*rt,Pt=Math.hypot(mt,tt)||1,Mt=tt/Pt,he=-mt/Pt;j.x=ue.X[Ee]+(ue.X[_e]-ue.X[Ee])*rt+Mt*yt,j.z=ue.Z[Ee]+(ue.Z[_e]-ue.Z[Ee])*rt+he*yt,j.yaw=Math.atan2(-(tt/Pt+he*kt),mt/Pt+Mt*kt),j.v=(ue.V[Ee]+(ue.V[_e]-ue.V[Ee])*rt)*tl(ze,ye),j.bay=yt>.01;let Ve=ye+Zo,$e=Ve+No;if(ze<Ve)j.fill=0;else if(ze>$e)j.fill=1;else{let Ye=Q%2,Je=F(Ye),He=M-(ze-Ve),r=Math.ceil((He+.2)/7+Je),l=Math.floor((He+No-.2)/7+Je)-1,C=Math.floor(M/7+Je-.62);j.fill=l>=r?Math.min(1,Math.max(0,(C-r+1)/(l-r+1))):1}j.load=j.fill>.01,j.bay&&e[Q%2].on&&(e[Q%2].bayTruck=Q),j.on&&O(j.x,j.z,j.yaw,4.95,4.84,1.43,rs,ul*j.v+1.5)}let B=s.dz,Y=!0;h<.1?(qr(M,rl,-3,27,B),B.y=0):h>.3&&h<.44?(qr(M,nl,-26,9,B),B.y=-4):h>.86?(qr(M,sl,-42,6,B),B.y=0):(Y=!1,B.x=B.z=B.v=B.y=B.yaw=0),B.on=Y,Y&&m(B.x,B.z,B.yaw,2.92,2.45,1.76,rs,cl*B.v+2)}function $(M,h,k){let A=M*_t,w=h-o[A+1],ee=k-o[A+2];if(o[A]===1)return Math.hypot(w,ee)-o[A+8];let J=o[A+3],_=o[A+4],z=w*J+ee*_,p=ee*J-w*_,B=Math.max(-o[A+6]-z,z-o[A+5]),Y=Math.abs(p)-o[A+7];return Math.hypot(Math.max(B,0),Math.max(Y,0))+Math.min(Math.max(B,Y),0)}let K=(M,h,k,A)=>{let w=M*_t,ee=o[w+9]+A;return Math.abs(h-o[w+1])<ee&&Math.abs(k-o[w+2])<ee},R=0,Me=0;function pe(M,h){let k=M*_t,A=R-o[k+1],w=Me-o[k+2];if(o[k]===1){let Z=Math.hypot(A,w),ye=Z>1e-6?(o[k+8]+h)/Z:0;R=o[k+1]+(Z>1e-6?A*ye:o[k+8]+h),Me=o[k+2]+w*ye;return}let ee=o[k+3],J=o[k+4],_=o[k+5],z=o[k+6],p=o[k+7],B=A*ee+w*J,Y=w*ee-A*J,Q,j;if(B<-z||B>_||Math.abs(Y)>p){let Z=Math.min(_,Math.max(-z,B)),ye=Math.min(p,Math.max(-p,Y)),ze=Math.hypot(B-Z,Y-ye)||1;Q=Z+(B-Z)/ze*h,j=ye+(Y-ye)/ze*h}else{let Z=_-B,ye=B+z,ze=p-Y,we=Y+p,Pe=Math.min(Z,ye,ze,we);Q=B,j=Y,Pe===Z?Q=_+h:Pe===ye?Q=-z-h:Pe===ze?j=p+h:j=-p-h}R=o[k+1]+Q*ee-j*J,Me=o[k+2]+Q*J+j*ee}function H(M){for(let h=0;h<4;h++){let k=!1;for(let A=0;A<g;A++)K(A,R,Me,M)&&$(A,R,Me)<M&&(pe(A,M),k=!0);if(!k)break}}function re(M){for(let h=0;h<6;h++){let k=!1;for(let A=0;A<S;A++)K(A,R,Me,M)&&$(A,R,Me)<M&&(pe(A,M),k=!0);if(!k)break}}let Ne=new Float64Array(5),me=new Float64Array(5),De=46,le=-33.25;function be(M,h,k,A){let w=Ko(M*31+h*7),ee=Ko(M*17+h*3+5),J,_,z=0,p=Ko(M*29+h*11)*6.2832;if(M<26&&k>.44&&k<.72){let B=Math.min(7,s.bay+(M%3===0?1:0));J=-32+Math.floor(B/2)*16+2+w*12,_=(B%2?2:-17)+ee*15,z=-4}else if(M<26&&k>=.72){let B=((M*7+h)%78+78)%78;B>39&&(B=78-B);let Y=Math.floor(B/5),Q=Y%2?4-B%5:B%5;J=-28+Y*8+(w-.5)*3,_=-16+Q*8+(ee-.5)*3,z=-4+(k>.85&&J<0?3.75:0)}else if(M<34&&s.digOn){let B=e[M%2?0:1],Y=(B.z<0?1:-1)*(.05+w*.55),Q=12+1.5+ee*3.5;J=B.x+Math.cos(Y)*Q,_=B.z+Math.sin(Y)*Q,p=Math.atan2(-(B.z-_),B.x-J)}else J=De+(Ko(M*5+9)-.5)*13+(w-.5)*12+6.5,_=le+(ee-.5)*6.5;R=J,Me=_,H(fl),A[0]=R,A[1]=z,A[2]=Me,A[3]=p}let V=M=>M-Math.round(M/6.2832)*6.2832;function oe(M){let h=1;for(let k=0;k<ss.length;k++)h=Math.min(h,Bt(Math.abs(M-ss[k]),ml,vl));return h}let Ae=new Float64Array(12),fe=new Float64Array(12),de=new Float64Array(12),Ce=new Float64Array(8),ve=new Float64Array(8),Fe=new Uint8Array(8),Ue=new Uint8Array(8),Ze=2;function Re(M,h,k,A,w,ee){let J=M*_t,_=o[J+9]+ee,z=o[J+1],p=o[J+2];if(Math.max(h,A)<z-_||Math.min(h,A)>z+_||Math.max(k,w)<p-_||Math.min(k,w)>p+_)return!1;let B=Math.min(160,Math.ceil(Math.hypot(A-h,w-k)*4));for(let Y=0;Y<=B;Y++)if($(M,h+(A-h)*Y/B,k+(w-k)*Y/B)<ee)return!0;return!1}function je(M,h,k,A){Ze=2,Ae[0]=M,fe[0]=h,Ae[1]=k,fe[1]=A;for(let w=0;w<g;w++){if(!Re(w,M,h,k,A,.45))continue;let ee=w*_t,J=o[ee+1],_=o[ee+2],z=((o[ee]===1?o[ee+8]:Math.hypot(Math.max(o[ee+5],o[ee+6]),o[ee+7]))+1)/.9239,p=2*z*.3827;for(let ze=0;ze<8;ze++){let we=ze*.7854+.3927;Ce[ze]=J+Math.cos(we)*z,ve[ze]=_+Math.sin(we)*z,Fe[ze]=Re(w,M,h,Ce[ze],ve[ze],.45)?0:1,Ue[ze]=Re(w,Ce[ze],ve[ze],k,A,.45)?0:1}let B=1e9,Y=-1,Q=0,j=1;for(let ze=0;ze<8;ze++)if(Fe[ze]){for(let we=0;we<8;we++)if(Ue[we])for(let Pe=-1;Pe<=1;Pe+=2){let ue=Pe>0?(we-ze+8)%8:(ze-we+8)%8,Ee=Math.hypot(Ce[ze]-M,ve[ze]-h)+ue*p+Math.hypot(k-Ce[we],A-ve[we]);Ee<B&&(B=Ee,Y=ze,Q=we,j=Pe)}}if(Y<0)return;let Z=1,ye=Y;for(Ae[0]=M,fe[0]=h;Ae[Z]=Ce[ye],fe[Z]=ve[ye],Z++,ye!==Q;)ye=(ye+j+8)%8;Ae[Z]=k,fe[Z]=A,Ze=Z+1;return}}function ge(M,h){let k=oe(h);for(let A=0;A<44;A++){let w=6+6*Ko(A*13+3),ee=Ko(A*7+1),J=Math.floor(M/w+ee),_=(M/w+ee-J)*w;be(A,J-1,h,Ne),be(A,J,h,me),je(Ne[0],Ne[2],me[0],me[2]),de[0]=0;for(let rt=1;rt<Ze;rt++)de[rt]=de[rt-1]+Math.hypot(Ae[rt]-Ae[rt-1],fe[rt]-fe[rt-1]);let z=me[1]-Ne[1],p=Math.hypot(de[Ze-1],z),B=Math.min(5,Math.max(1.3,p/(.7*w))),Y=p>.02?Math.min(p/B,.95*w):0,Q=Y>0?Math.min(1,_/Y):1,j=Q*de[Ze-1],Z=1;for(;Z<Ze-1&&de[Z]<j;)Z++;let ye=de[Z]-de[Z-1],ze=ye>1e-9?(j-de[Z-1])/ye:1,we=Ae[Z]-Ae[Z-1],Pe=fe[Z]-fe[Z-1],ue=Y>0?Math.atan2(-Pe,we):me[3];Y>0&&_<.5&&(ue+=V(Ne[3]-ue)*(1-Bt(_,0,.5))),_>Y&&(ue+=V(me[3]-ue)*Bt(_-Y,0,.8)),R=Ae[Z-1]+we*ze,Me=fe[Z-1]+Pe*ze,re(ns);let Ee=k;for(let rt=0;rt<S&&Ee>0;rt++)K(rt,R,Me,ns)&&$(rt,R,Me)<hl&&(Ee=0);let _e=A*5;u[_e]=R,u[_e+1]=Ne[1]+z*Q,u[_e+2]=Me,u[_e+3]=ue,u[_e+4]=Ee}}return{M:s,Z:o,crew:u,machines:I,crewStep:ge,zsd:$,get nZ(){return S},get nS(){return g}}}var ya={lat:30.250453,lon:-97.719913},or=17*Math.PI/180,ba=400,Ro=180,wo=140,tr=164/11,Mo=4;var fs=`
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
`,gl=e=>`
vec2 toGeo(vec2 p){ return vec2(p.x*uRot.x-p.y*uRot.y, p.x*uRot.y+p.y*uRot.x); }
float orthoW(vec2 g){ vec2 a=abs(g); return uOrthoOn*(1.-smoothstep(${ba-90}.,${ba-4}.,max(a.x,a.y))); }
vec3 ortho(vec2 g){ vec3 c=texture2D(tOrtho,vec2(g.x/${2*ba}.+.5,.5-g.y/${2*ba}.)).rgb;
  vec3 l=texture2D(tOrthoL,vec2(g.x/${2*e}.+.5,.5-g.y/${2*e}.)).rgb; vec2 a=abs(g);
  return mix(c,l,uOrthoLOn*(1.-smoothstep(${(e*.85).toFixed(1)},${e-2}.,max(a.x,a.y)))); }
// round feathers, never square: each photo hands over to the next one out well inside its own edge
float circW(vec2 g, float hf){ return 1.-smoothstep(.55*hf,.95*hf,length(g)); }
vec4 photoLayers(vec2 g){
  float wc=uOrthoCOn*circW(g,40000.), wb=uOrthoBOn*circW(g,4000.), wa=uOrthoOn*circW(g,${ba}.);
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
}`,hs=e=>`{
  vec2 bp=vLoc.xz; float bw=max(length(fwidth(bp)),1e-3), fade=1.-smoothstep(.15,.9,bw);   // only where it can resolve
  if(fade>0.){
    float e=.18; vec2 ex=vec2(e,0.), ez=vec2(0.,e);
    #define BH(q) (dot(ortho(toGeo(q)),vec3(.3,.5,.2))*.9*uOrthoOn+fb((q)*1.6)*.1+vn((q)*6.)*.025)
    float gx=(BH(bp+ex)-BH(bp-ex))/(2.*e), gz=(BH(bp+ez)-BH(bp-ez))/(2.*e);
    #undef BH
    normal=normalize(normal+(viewMatrix*vec4(-gx,0.,-gz,0.)).xyz*${e}*fade);
  } }`;function ds({THREE:e,scene:t,renderer:a,sunLight:s,hemi:o,ORIGIN:u,earthU:S,ortho:g={}}){let L=g.lotHalf||200,m=gl(L),O=new e.Group;O.position.copy(u),O.visible=!1,t.add(O);let P={uG:{value:0},uNight:{value:0},uT:{value:0},uWork:{value:0},uSunL:{value:new e.Vector3(0,1,0)},uOrigin:{value:u.clone()},tMap:S.tMap,tLights:S.tLights,uLL:{value:new e.Vector2(ya.lat,ya.lon)},uDig:{value:0},uPile:{value:0},uBack:{value:0},uClear:{value:0},uProg:{value:0},tOrtho:{value:null},uOrthoOn:{value:0},tOrthoL:{value:null},uOrthoLOn:{value:0},tOrthoB:{value:null},uOrthoBOn:{value:0},tOrthoC:{value:null},uOrthoCOn:{value:0},uRot:{value:new e.Vector2(Math.cos(or),Math.sin(or))}};{let r=new e.DataTexture(new Uint8Array([90,80,66,255]),1,1);r.needsUpdate=!0,P.tOrtho.value=r,P.tOrthoL.value=r}{let r=new e.DataTexture(new Uint8Array([70,72,60,255]),1,1);r.needsUpdate=!0,P.tOrthoB.value=r,P.tOrthoC.value=r}let U={},f=500,i=(r,l,C,x=!1)=>r?bo(e,r,{flipY:!0,colorSpace:e.SRGBColorSpace}).then(d=>{if(d.anisotropy=8,d.needsUpdate=!0,a&&a.initTexture)try{a.initTexture(d)}catch{}return P[l].value=d,x?U[C]=performance.now():P[C].value=1,!0},()=>!1):Promise.resolve(!1),F=Promise.all([i(g.lot,"tOrthoL","uOrthoLOn"),i(g.site,"tOrtho","uOrthoOn")]),I=Promise.all([F,i(g.km8,"tOrthoB","uOrthoBOn",!0),i(g.km80,"tOrthoC","uOrthoCOn",!0)]),$=0,K=(r,l,C,x,d,q,v,T,te)=>{let G="tfsite"+$++;return r.customProgramCacheKey=()=>G,r.onBeforeCompile=E=>{Object.assign(E.uniforms,P),E.vertexShader=`uniform vec3 uOrigin; uniform float uDig,uPile,uBack; varying vec3 vLoc;
`+fs+l+`
`+E.vertexShader,T&&(E.vertexShader=E.vertexShader.replace("#include <beginnormal_vertex>",T)),E.vertexShader=E.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
`+C+`
vLoc=(modelMatrix*vec4(transformed,1.)).xyz-uOrigin;`),E.fragmentShader=`uniform float uG,uNight,uT,uWork,uClear,uProg,uOrthoOn,uOrthoLOn,uOrthoBOn,uOrthoCOn; uniform vec3 uSunL; uniform sampler2D tMap,tLights,tOrtho,tOrthoL,tOrthoB,tOrthoC; uniform vec2 uLL,uRot; varying vec3 vLoc;
`+fs+m+x+`
`+E.fragmentShader.replace("#include <color_fragment>",`#include <color_fragment>
`+d).replace("#include <roughnessmap_fragment>",`#include <roughnessmap_fragment>
`+q).replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>
`+v).replace("#include <normal_fragment_maps>",`#include <normal_fragment_maps>
`+(te||""))},r},R=`
  vec3 SOD=vec3(1.,.58,.24);
  vec2 llUv(vec2 p){ float lat=uLL.x-p.y/110574., lon=uLL.y+p.x/(111320.*cos(radians(uLL.x))); return vec2((lon+180.)/360.,(lat+90.)/180.); }
  // one house slot: returns roof coverage and fills colour/height; painted only outside the 3D ring
  float house(vec2 lc, float ci, float cj, float row, out vec3 roof, out float ht, out vec2 porch, out float pool, out vec2 poolC, float w){
    float s=floor((lc.x+82.)/${tr.toFixed(6)}); roof=vec3(0.); ht=0.; pool=0.; porch=vec2(1e5); poolC=vec2(1e5);
    if(s<0.||s>10.) return 0.;
    float n=ci*157.+cj*311.+row*71.+s*13.+500.;
    if(Hh(n)>0.92) return 0.;
    float cx=-82.+(s+.5)*${tr.toFixed(6)}, front=row<.5? -70.+hwZ(cj-1.) : 70.-hwZ(cj), dir=row<.5?1.:-1.;
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
    vec2 uS=p/vec2(${Ro}.,${wo}.), dS=abs(fract(uS)-.5)*vec2(${Ro}.,${wo}.);
    float hS=3., sgS=max(hS,sg0), sa=max(1.5,sg0);
    float gX=h21(vec2(floor(uS.x),floor(uS.y+.5))+.37), gZ=h21(vec2(floor(uS.x+.5),floor(uS.y))+5.71);
    float segX=step(.18,gX)*(.4+1.2*fract(gX*13.1)), segZ=step(.18,gZ)*(.4+1.2*fract(gZ*13.1));
    float ddX=mod(p.y,36.)-18., ddZ=mod(p.x,36.)-18., fa=smoothstep(4.,9.,sa), dn=36.*1.5/(1.7725*sa);
    float dotX=mix(exp(-ddX*ddX/(sa*sa))*dn,1.,fa), dotZ=mix(exp(-ddZ*ddZ/(sa*sa))*dn,1.,fa);
    float Lst=(exp(-dS.x*dS.x/(sgS*sgS))*segX*dotX+exp(-dS.y*dS.y/(sgS*sgS))*segZ*dotZ)*hS/sgS;
    float mSt=1.7725*hS*(1./${Ro}.+1./${wo}.)*.82;
    float fS=smoothstep(.05*${wo}.,.13*${wo}.,sgS), aS=.14*(1.-.92*fS); S+=aS*mix(Lst/mSt,1.,fS); W+=aS;
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
    float ci=floor(p.x/${Ro}.+.5), cj=floor(p.y/${wo}.+.5);
    vec2 lc=p-vec2(ci*${Ro}.,cj*${wo}.);
    float kx=lc.x>0.?ci:ci-1., kz=lc.y>0.?cj:cj-1.;
    float dX=${Ro/2}.-abs(lc.x), dZ=${wo/2}.-abs(lc.y);          // distance to the street centrelines
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
        float s=floor((lc.x+82.)/${tr.toFixed(6)}), cxs=-82.+(s+.5)*${tr.toFixed(6)};
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
  }`,Me=K(new e.MeshStandardMaterial({roughness:1,metalness:0,polygonOffset:!0,polygonOffsetFactor:2,polygonOffsetUnits:2}),"","",R+`
vec3 gA; float gR; vec3 gE;`,`if(abs(vLoc.x)<74.8&&abs(vLoc.z)<54.8) discard; // the lot mesh owns this patch (the pit goes below the ground plane)
  float gw=max(length(fwidth(vLoc.xz)),1e-3); groundShade(vLoc.xz,gw,gA,gR,gE);
  { vec2 gq=toGeo(vLoc.xz); vec4 ph=photoLayers(gq); if(ph.a>0.){ gA=mix(gA,ph.rgb,ph.a); gR=mix(gR,.95,ph.a); }
    float ow=uOrthoOn*circW(gq,400.); if(ow>0.) gE=mix(gE,orthoNight(gq,gw)*uNight,ow*(1.-smoothstep(1.,3.,gw))); }
  diffuseColor.rgb=gA;`,"roughnessFactor=gR;","totalEmissiveRadiance+=gE;",null,hs(.35)),pe=new e.Mesh(new e.PlaneGeometry(1,1).rotateX(-Math.PI/2),Me);pe.position.y=-.06,pe.receiveShadow=!0,pe.frustumCulled=!1,O.add(pe);let H=`
  float pitH(vec2 p){
    vec2 q=abs(p)-vec2(32.,20.); float dr=max(q.x,q.y);
    float m=1.-smoothstep(-3.,0.,dr);
    float xf=-32.+uDig*76.;                             // the dig face sweeps west to east
    float f=smoothstep(xf,xf-7.,p.x);
    float h=-${Mo}.*m*f;
    // haul ramp up the east side
    float rx=clamp((p.x-30.)/22.,0.,1.), rm=(1.-smoothstep(4.5,7.,abs(p.y)))*step(29.,p.x)*step(p.x,52.);
    h=min(h,-${Mo}.*(1.-rx)*rm*smoothstep(.55,.9,uDig)*(1.-uBack));
    // ground topography outside the dig: gentle swales, a few windrows from grading, all easing to 0 at the lot edge
    float edge=(1.-smoothstep(62.,74.,abs(p.x)))*(1.-smoothstep(42.,54.,abs(p.y)));
    float topo=(fb(p*.022+3.)-.47)*1.6+(vn(p*.11)-.5)*.35+smoothstep(.55,1.,sin(p.y*.42+fb(p*.05)*4.))*.22;
    h+=topo*edge*(1.-m*f);
    // spoil pile
    float r=length((p-vec2(-52.,-38.))*vec2(1.,1.3));
    h+=uPile*7.*exp(-r*r/160.)*(.8+.4*vn(p*.15));
    return h;
  }`,re=K(new e.MeshStandardMaterial({roughness:1,metalness:0}),H,"transformed.y+=pitH(position.xz);",`
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
    if(abs(p.x)<31.&&abs(p.y)<19.&&y<-${Mo-.4}){
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
    vec2 LT[4]; ${Jo.map(([r,l],C)=>`LT[${C}]=vec2(${r}.,${l}.);`).join(" ")}
    for(int i=0;i<4;i++){ float d=length(p-LT[i]); E+=col*vec3(1.,.93,.8)*.25*exp(-d*d/700.)*uWork; }
    lA=col; lR=rough; lE=E;
    diffuseColor.rgb=lA;`,"roughnessFactor=lR;","totalEmissiveRadiance+=lE;",`vec3 objectNormal; { float e=.6; vec2 p=position.xz;
      objectNormal=normalize(vec3(-(pitH(p+vec2(e,0.))-pitH(p-vec2(e,0.)))/(2.*e),1.,-(pitH(p+vec2(0.,e))-pitH(p-vec2(0.,e)))/(2.*e))); }
    #ifdef USE_TANGENT
      vec3 objectTangent = vec3( tangent.xyz );
    #endif`,hs(.9)),Ne=new e.Mesh(new e.PlaneGeometry(150,110,150,110).rotateX(-Math.PI/2),re);Ne.receiveShadow=!0,O.add(Ne);let me=(r,l=.7,C=0,x)=>new e.MeshStandardMaterial({color:r,roughness:l,metalness:C,...x?{emissive:x}:{}}),De={yel:me(15774218,.5,.1),dark:me(1842204,.85),glass:me(1450540,.15,.4),white:me(15328991,.55),conc:me(12038824,.9),grey:me(8223607,.6,.3),orange:me(15229980,.5),blue:me(2775720,.6),ply:me(12613434,.8),rust:me(8010524,.9),green:me(2242602,.9),lamp:new e.MeshBasicMaterial({color:16777215}),drum:me(14210252,.4,.3)},le=(r,l,C,x,d=0,q=0,v=0,T)=>{let te=new e.Mesh(new e.BoxGeometry(r,l,C),x);return te.position.set(d,q,v),te.castShadow=te.receiveShadow=!0,(T||O).add(te),te},be=(r,l,C,x,d,q,v,T="z")=>{let te=new e.CylinderGeometry(r,r,l,14);T==="z"?te.rotateX(Math.PI/2):T==="x"&&te.rotateZ(Math.PI/2);let G=new e.Mesh(te,C);return G.position.set(x,d,q),G.castShadow=!0,v.add(G),G},V=new e.Matrix4,oe=new e.Quaternion,Ae=new e.Vector3,fe=new e.Vector3,de=new e.Vector3(0,1,0),Ce=new e.Vector3(1e-4,1e-4,1e-4),ve=(r,l,C)=>{let x=Math.min(1,Math.max(0,(r-l)/(C-l)));return x*x*(3-2*x)},Fe=[],Ue=new e.InstancedMesh(new e.IcosahedronGeometry(1,1),me(2044692,.95),Fe.length);Ue.castShadow=Ue.receiveShadow=!0,O.add(Ue);{let r=[];for(let C=-75;C<75;C+=3)r.push([C+1.5,-55,0],[C+1.5,55,0]);for(let C=-55;C<55;C+=3)r.push([-75,C+1.5,1]),C>-32&&C<-6||C>18&&C<42||r.push([75,C+1.5,1]);let l=new e.InstancedMesh(new e.BoxGeometry(3,1.8,.08).translate(0,.9,0),De.green,r.length);r.forEach(([C,x,d],q)=>{V.compose(Ae.set(C,0,x),oe.setFromAxisAngle(de,d?Math.PI/2:0),fe.set(1,1,1)),l.setMatrixAt(q,V)}),l.castShadow=!0,O.add(l)}let Ze=[new e.PointLight(16773336,0,90,1.6),new e.PointLight(16773336,0,90,1.6)];Ze[0].position.set(-30,14,-10),Ze[1].position.set(30,14,10),Ze.forEach(r=>O.add(r));let{exA:Re,exB:je,trucks:ge,dozer:M,pump:h,mixers:k,crane:A,crew:w,towers:ee,roofs:J}=Pn({THREE:e,group:O,D:Mo,towers:Jo}),_=us(),z=_.M,p=[];for(let r=-28;r<=28;r+=8)for(let l=-16;l<=16;l+=8)p.push([r,l]);let B=new e.InstancedMesh(new e.BoxGeometry(.75,1,.75).translate(0,.5,0),De.conc,p.length);B.castShadow=B.receiveShadow=!0,O.add(B);let Y=[[-12,-4,8,6],[14,5,6,6]].map(([r,l,C,x])=>{let d=le(C,1,x,De.conc,r,-Mo,l);return d.geometry.translate(0,.5,0),d}),Q=[];for(let r=-28;r<28;r+=8)for(let l=-18;l<18;l+=9)Q.push([r+4,l+4.5]);let j=new e.InstancedMesh(new e.BoxGeometry(7.8,.35,8.8),De.ply,Q.length);j.castShadow=j.receiveShadow=!0,O.add(j);let Z={},ye=new e.Vector3,ze=new e.Color,we=new e.Color,Pe=ee[0].material.color.clone(),ue=e.MathUtils.degToRad(.1),Ee=e.MathUtils.degToRad(2.5),_e=new e.Vector3,rt=new e.Vector3(1,0,0),yt=(r,l,C)=>{_e.subVectors(C,l);let x=_e.length();r.position.copy(l).add(C).multiplyScalar(.5),r.scale.set(x,1,1),r.quaternion.setFromUnitVectors(rt,_e.normalize())},kt=new e.Vector3,mt=new e.Vector3,tt=new e.Vector3,Pt=new e.Vector3,Mt=new e.Vector3,he=new e.Vector3(0,1,0),Ve=r=>Ya(s,u,r,400,Pt,Mt);function $e({g:r,t:l,hour:C}){for(let N in U){let ne=Math.min(1,(performance.now()-U[N])/f);P[N].value=ne*ne*(3-2*ne),ne>=1&&delete U[N]}let x=r,{sinE:d,el:q,az:v}=Ra(C,Z),T=Math.round(.5*(q+Ee+Math.sqrt((q-Ee)**2+4e-4))/ue)*ue,te=Math.round(v/ue)*ue;ye.set(Math.cos(T)*Math.sin(te),Math.sin(T),-Math.cos(T)*Math.cos(te));let G=ve(d,-.1,.12),E=1-G,ke=1-ve(d,.05,.5);P.uSunL.value.copy(ye),P.uNight.value=ve(-d,-.02,.12),P.uT.value=l,P.uG.value=r,P.uProg.value=x,P.uWork.value=P.uNight.value*ve(x,.03,.06),s.color.setRGB(1,.93-ke*.25,.85-ke*.45),s.intensity=3.2*ve(d,-.02,.1),Ve(ye),o.color.copy(ze.setRGB(.42,.58,1).lerp(we.setRGB(.06,.07,.12),E)),o.groundColor.setRGB(.42*G+.02,.34*G+.02,.24*G+.03),o.intensity=.6+.95*G;let ot=P.uWork.value;Ze.forEach(N=>N.intensity=140*ot),ee[0].material.color.copy(Pe).multiplyScalar(ot),ee.forEach(N=>N.visible=ot>.002),P.uClear.value=ve(x,0,.07),P.uDig.value=ve(x,.07,.36),P.uPile.value=ve(x,.08,.24)*(1-ve(x,.3,.46))*.9+.1*ve(x,.3,.46),P.uBack.value=ve(x,.8,.93),Fe.forEach(([N,ne,ce],ct)=>{let Ft=1-ve(x,.005+ct*.004,.02+ct*.004);V.compose(Ae.set(N,ce*.55+1.6,ne),oe.setFromAxisAngle(de,ct),Ft>.01?fe.set(ce*Ft,ce*.55*Ft,ce*Ft):Ce),Ue.setMatrixAt(ct,V)}),Ue.instanceMatrix.needsUpdate=!0,_.machines(l,x);for(let N=0;N<2;N++){let ne=N?je:Re,ce=z.ex[N];ne.g.visible=ce.on,ne.up.rotation.y=ce.slew,ne.boom.rotation.z=ce.boom,ne.stick.rotation.z=ce.stick,ne.g.position.set(ce.x,ce.y,ce.z),ne.g.rotation.y=0}for(let N=0;N<4;N++){let ne=ge[N],ce=z.tr[N];ne.g.visible=ce.on,ne.g.position.set(ce.x,0,ce.z),ne.g.rotation.y=ce.yaw,ne.load.visible=ce.load,ne.load.scale.y=.6+.4*ce.fill}{let N=z.dz;M.visible=N.on,N.on&&(M.position.set(N.x,N.y,N.z),M.rotation.y=N.yaw)}let Ge=z.pouring;if(h.g.visible=h.s1.visible=h.s2.visible=h.hose.visible=k[0].g.visible=k[1].g.visible=Ge,Ge){let N=z.pump.bx,ne=z.pump.C;h.g.position.set(N,0,-29),kt.set(N,3.2,-29),tt.set(ne[0],ne[1],ne[2]),mt.copy(kt).lerp(tt,.45),mt.y=16,yt(h.s1,kt,mt),yt(h.s2,mt,tt),yt(h.hose,tt,Ae.copy(tt).setY(-Mo+.2));for(let ce=0;ce<2;ce++){let ct=k[ce];ct.g.position.set(z.mix[ce].x,0,z.mix[ce].z),ct.d.rotation.x=l*3+ce}}{let N=z.up,ne=40*N+.01,ce=z.crane;A.g.visible=N>.01,A.mast.scale.y=ne,A.top.position.y=ne,A.top.visible=N>.95,A.top.rotation.y=ce.slew,A.trolley.position.x=ce.tr,A.line.scale.y=ce.drop,A.line.position.y=-.8-ce.drop/2,A.hook.position.y=-1.2-ce.drop}p.forEach(([N,ne],ce)=>{let ct=Math.floor((N+32)/16)*2+(ne<0?0:1),Ft=ve(x,.47+ct*.028+.07,.47+ct*.028+.12);V.compose(Ae.set(N,-Mo,ne),oe.identity(),Ft>.01?fe.set(1,3.6*Ft,1):Ce),B.setMatrixAt(ce,V)}),B.instanceMatrix.needsUpdate=!0,Y.forEach((N,ne)=>{let ce=ve(x,.56+ne*.03,.98);N.visible=ce>.01,N.scale.y=Math.max(.01,13*ce)}),Q.forEach(([N,ne],ce)=>{let ct=ve(x,.8+(N+28)/56*.15+ce%4*.01,.84+(N+28)/56*.15+ce%4*.01);V.compose(Ae.set(N,-.25,ne),oe.identity(),ct>.5?fe.set(1,1,1):Ce),j.setMatrixAt(ce,V)}),j.instanceMatrix.needsUpdate=!0,_.crewStep(l,x);let Oe=_.crew;for(let N=0;N<44;N++){let ne=N*5,ce=Oe[ne+4];V.compose(Ae.set(Oe[ne],Oe[ne+1],Oe[ne+2]),oe.setFromAxisAngle(de,Oe[ne+3]),ce>.01?fe.set(ce,ce,ce):Ce),w.setMatrixAt(N,V)}return w.instanceMatrix.needsUpdate=!0,{hour:C,prog:x,sinE:d,sunL:ye,night:P.uNight.value}}function Ye(r,l){let C=Math.max(4e3,l*12);pe.scale.set(C,1,C),pe.position.x=r.x,pe.position.z=r.z}let Je=.05;async function He({next:r=()=>Promise.resolve(),alive:l=()=>!0}={}){let C=await Dn();if(!l())return null;let x=Ln(e,zn(C,Je)),d=0,q=0;try{for(let v of J){if(await r(),!l())return null;d+=kn(v,x),q++}}finally{for(let v in x)x[v].dispose()}return{machines:q,tris:d}}return{group:O,update:$e,follow:Ye,uniforms:P,D:Mo,ready:F,readyAll:I,addShrouds:He}}var Kr=Math.log,ar=(e,t,a)=>{let s=Math.min(1,Math.max(0,(e-t)/(a-t)));return s*s*(3-2*s)},rr=17*Math.PI/180,xl=(e,t,a)=>a.set(e*Math.cos(rr)+t*Math.sin(rr),0,-e*Math.sin(rr)+t*Math.cos(rr)),ms=[{D:3900,nx:-.34,ny:.3,r:260,turn:240,v:3200,span:36,drift:50,T:7.5},{D:6800,nx:.34,ny:0,r:420,turn:-70,v:3200,span:60,drift:50,T:8.5},{D:5e3,nx:.5,ny:.55,alt:1600,hdg:172,v:1800,span:36,land:!0,drift:300,T:14},{D:7e3,nx:.75,ny:.8,alt:2300,hdg:175,v:1800,span:34,land:!0,drift:300,T:16},{D:4500,nx:-.6,ny:-.5,alt:2e3,hdg:352,v:2e3,span:36,drift:300,T:15,hi:!0},{D:14e3,nx:-.5,ny:.4,alt:9500,hdg:62,v:3e3,span:60,drift:300,T:13,hi:!0},{D:18e3,nx:.45,ny:-.3,alt:11300,hdg:258,v:3200,span:64,drift:300,T:12,hi:!0},{D:11e3,nx:-.2,ny:.6,alt:7200,hdg:128,v:2600,span:36,drift:300,T:15,hi:!0}],vs=[[-.5,0,-.12,0],[.5,0,-.12,1],[0,.03,-.52,2],[-.5,0,-.135,3],[.5,0,-.135,3],[0,.07,.02,4],[0,-.06,.06,4]],bl=[[-.11,-.04,.14,5],[.11,-.04,.14,5]],yl=`
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
}`,wl=`float ss2(float x,float a,float b){ return clamp((x-a)/max(b-a,1e-4),0.,1.); }
`,Ml=`
varying vec3 vCol; varying float vK;
void main(){
  vec2 q=gl_PointCoord*2.-1.; float d2=dot(q,q); if(d2>1.) discard;
  float g=mix(exp(-d2*2.5)*(1.-d2),exp(-d2*40.)+.12*exp(-d2*6.)*(1.-d2),vK); // a soft dot when it is a point; hot core + halo up close
  gl_FragColor=vec4(vCol*g,1.);
}`;function ps({THREE:e,parent:t,high:a=!0}){let s=a?ms:ms.filter(le=>!le.hi),o=s.length,u=[],S=[],g=[];s.forEach((le,be)=>{for(let[V,oe,Ae,fe]of le.land?vs.concat(bl):vs)u.push(be),S.push(fe),g.push(V*le.span,oe*le.span,Ae*le.span)});let L=new e.BufferGeometry;L.setAttribute("position",new e.BufferAttribute(new Float32Array(u.length*3),3)),L.setAttribute("aId",new e.BufferAttribute(new Float32Array(u),1)),L.setAttribute("aKind",new e.BufferAttribute(new Float32Array(S),1)),L.setAttribute("aOff",new e.BufferAttribute(new Float32Array(g),3));let m=()=>new e.Vector3,O={uC:{value:Array.from({length:8},m)},uF:{value:Array.from({length:8},()=>new e.Vector3(0,0,-1))},uA:{value:new Array(8).fill(0)},uPh:{value:s.map((le,be)=>be*.618034%1).concat(new Array(8-o).fill(0))},uT:{value:0},uProj:{value:1e3},uMin:{value:2},uMax:{value:72}},P=new e.ShaderMaterial({uniforms:O,vertexShader:yl.replace("void main(){",wl+"void main(){"),fragmentShader:Ml,transparent:!0,depthWrite:!1,depthTest:!0,blending:e.AdditiveBlending,fog:!1}),U=new e.Points(L,P);U.frustumCulled=!1,U.renderOrder=2,U.name="aircraft",t.add(U);let f=s.map((le,be)=>({spec:le,i:be,p0:m(),fwd:new e.Vector3(0,0,-1),lam0:Kr(le.D),pos:m(),a:0})),i={pos:m(),look:m(),up:m(),fov:38},F=m(),I=m(),$=m(),K=m(),R=m(),Me=(le,be)=>{let V=le*Math.PI/180;return xl(Math.sin(V),-Math.cos(V),be).normalize()};function pe(le,be){for(let V of f){let oe=V.spec;le(oe.D,i),F.copy(i.look).sub(i.pos).normalize(),I.crossVectors(F,i.up).normalize(),$.crossVectors(I,F);let Ae=Math.tan(i.fov*Math.PI/360),fe=Ae*be;if(K.copy(F).addScaledVector(I,oe.nx*fe).addScaledVector($,oe.ny*Ae).normalize(),V.p0.copy(i.pos).addScaledVector(K,oe.r!=null?oe.r:(oe.alt-i.pos.y)/K.y),oe.hdg!=null)Me(oe.hdg,V.fwd);else{let de=oe.turn*Math.PI/180;R.copy($).setY(0).normalize(),V.fwd.copy(I).setY(0).normalize().multiplyScalar(Math.cos(de)).addScaledVector(R,Math.sin(de)).normalize()}}}function H(le,be,V){let oe=le.spec,Ae=((V/oe.T+O.uPh.value[le.i]*3.7)%1+1)%1;return le.pos.copy(le.p0).addScaledVector(le.fwd,oe.v*(be-le.lam0)+oe.drift*(2*Ae-1)),ar(Ae,0,.07)*(1-ar(Ae,.93,1))}let re=0;function Ne({lam:le,t:be,sinE:V,proj:oe,pr:Ae=1}){if(re=ar(-V,-.035,.03)*(1-ar(le,Kr(6e4),Kr(25e4))),U.visible=re>.001,!U.visible){for(let fe of f)fe.a=0;return re}return O.uT.value=be,O.uProj.value=oe,O.uMin.value=3*Ae,O.uMax.value=96*Ae,f.forEach((fe,de)=>{fe.a=re*H(fe,le,be),O.uC.value[de].copy(fe.pos),O.uF.value[de].copy(fe.fwd),O.uA.value[de]=fe.a}),re}function me(le,be,V,oe){let Ae=f[le],fe=H(Ae,be,V);return oe.copy(Ae.pos),fe}function De(){t.remove(U),L.dispose(),P.dispose()}return{points:U,layout:pe,update:Ne,at:me,fleet:f,dispose:De}}var ro=.46,Jt=.4,wa=.6;function gs({THREE:e}){let t=(se,ie,Xe)=>new e.Vector3(se,ie,Xe),a=Math.PI/180,s=t(0,1,0),o=11.25,u=-52,S=17.5,g=-22,L=11.8,m=18,O=11.65,P=-.7,U=.018,f=54,i=-.745,F=-.725,I=-.66,$=-.45,K=-.9,R=-.16,Me=25,pe=.65,H=-35*a,re=.19,Ne=.002,me=t(-.6543,.2642,-.7086),De=t(.5744,-.4358,-.6929),le=2,be=t(-1,.22,-.55).normalize(),V=t(0,0,0),oe=t(0,1,0).addScaledVector(be,-be.y).normalize(),Ae=V.clone().addScaledVector(be,-23).addScaledVector(oe,10.4),fe=Ae.clone().addScaledVector(be,60).addScaledVector(oe,-9),de=t(.0106681,.002613,.0218856),Ce=de.clone().normalize(),ve=de.length(),Fe=t(25.216,6.526,17.498),Ue=Fe.clone().negate().normalize(),Ze=Ue.clone().cross(s).normalize(),Re=Ze.clone().cross(Ue),je=(se,ie)=>t().addScaledVector(Ue,ie*Math.sin(se*a)).addScaledVector(Re,ie*Math.cos(se*a)),ge=(se,ie=t())=>ie.set(0,0,0).addScaledVector(Ue,Math.cos(se*a)).addScaledVector(Re,Math.sin(se*a)),M=se=>Math.atan2(se.dot(Re),se.dot(Ue))/a,h=4,k=480,A=ge(h).multiplyScalar(k),w=(se,ie,Xe)=>t(se,ie,Xe).add(A),ee=t(70,20,100),J=t(ee.x,0,ee.z).normalize(),_=ee.clone().cross(s).normalize(),z=(se,ie)=>J.clone().multiplyScalar(se*Math.cos(ie*a)).addScaledVector(s,se*Math.sin(ie*a)).add(A),p=w(70,20,100),B=z(49.5,10.6),Y=z(41.67,11.8),Q=Y.clone().sub(A),j=Q.length();Q.normalize();let Z=Me*a,ye=Math.sin(Z),ze=s.clone().addScaledVector(Q,-Q.y).normalize(),we=t(),Pe=t(),ue=t();{let se=ut=>(we.copy(Q).multiplyScalar(ut).addScaledVector(ze,Math.sqrt(1-ut*ut)),ue.copy(Q).multiplyScalar(j).addScaledVector(we,-(6+pe)),ue.dot(we)/ue.length()-ye),ie=-.95,Xe=.95;for(let ut=0;ut<60;ut++){let et=(ie+Xe)/2;se(et)<0?ie=et:Xe=et}se((ie+Xe)/2),ue.normalize().negate(),Pe.copy(A).addScaledVector(we,6+pe)}let Ee=Y.distanceTo(Pe),_e=Y.clone().addScaledVector(ue,.55*Ee),rt=new e.Quaternion().setFromAxisAngle(ee.clone().normalize(),H),yt=(se,ie)=>ie.setFromAxisAngle(s,re+se*Ne).premultiply(rt),kt=je(0,o),mt=je(m,O),tt=A.clone().sub(mt).normalize(),Pt=A.clone().addScaledVector(A.clone().negate().normalize().lerp(ee.clone().normalize(),.62).normalize(),270),Mt=(se,ie)=>se.addScaledVector(ie,-se.dot(ie)).normalize(),he=t(-.13013639750678707,.2577593941984025,.9574051455608686),Ve=je(u,S),$e=Fe.clone().addScaledVector(Mt(he.clone(),Ze).add(Ve.clone().sub(Fe).normalize()).normalize(),1.5),Ye=[[-1,Ae,Ce],[-.9,Fe,he],[null,$e,null],[null,Ve,null],[null,je(g,L),null],[null,kt,Ue.clone()],[null,mt,tt],[null,mt.clone().addScaledVector(tt,70),tt],[null,Pt,null],[0,p,null],[.16,B,null],[.34,Y,ue],[Jt,_e,ue],[ro,Pe,ue]],Je=Ye.length,He=Ye.map(se=>se[1]),r=[];for(let se=0;se<Je;se++){if(Ye[se][2]){r.push(Ye[se][2].clone());continue}let ie=se>0?He[se].clone().sub(He[se-1]).normalize():t(),Xe=se<Je-1?He[se+1].clone().sub(He[se]).normalize():t();r.push(ie.add(Xe).normalize())}Mt(r[2],Ze),Mt(r[9],_);let l=He.slice(0,-1).map((se,ie)=>se.distanceTo(He[ie+1])),C=new e.Curve;C.getPoint=(se,ie=new e.Vector3)=>{let Xe=Math.min(Math.max(se,0),1)*(Je-1),ut=Math.min(Je-2,Math.floor(Xe)),et=Xe-ut,Ot=et*et,Be=Ot*et,pt=l[ut];return ie.copy(He[ut]).multiplyScalar(2*Be-3*Ot+1).addScaledVector(r[ut],(Be-2*Ot+et)*pt).addScaledVector(He[ut+1],3*Ot-2*Be).addScaledVector(r[ut+1],(Be-Ot)*pt)},C.arcLengthDivisions=(Je-1)*800;let x=C.getLengths(),d=se=>{let ie=se*(x.length-1),Xe=Math.floor(ie);return Xe>=x.length-1?x[x.length-1]:x[Xe]+(x[Xe+1]-x[Xe])*(ie-Xe)},q=He.map((se,ie)=>d(ie/(Je-1))),v=[[-1,0,ve,-3e-5],[-.9,1,.0022,0],[P,5,U,0],[0,9,.075,-4e-5],[.16,10,.012,-1e-5],[.34,11,.006,0],[Jt,12,.11,-1e-4],[ro,13,.04,-1e-4]],T=[[2.181,-1],[2.781,-.9],[3.481,-.64],[4.25,-.15],[4.75,0],[8.5,.26],[10.5,.62],[13.5,.9],[15,1.12]],te=Ka(T),G=v.length,E=new Float64Array(G),ke=new Float64Array(G),ot=new Float64Array(G),Ge=new Float64Array(G),Oe=null,N=0,ne=1,ce=se=>{let ie=N,Xe=ne;for(let ut=0;ut<40;ut++){let et=(ie+Xe)/2;Oe(et)<se?ie=et:Xe=et}return(ie+Xe)/2},ct=(se,ie,Xe)=>(se(ie+Xe)-se(ie-Xe))/(2*Xe);function Ft({S:se,yE:ie,y1:Xe,vh:ut=900}){Oe=se,N=ie,ne=Xe;let et=T[0][0],Ot=T[T.length-1][0];for(let Be=0;Be<G;Be++){let pt=v[Be][0];E[Be]=pt<=-1?ie:ce(pt);let Yt=1;if(pt>-1){let Qt=et,St=Ot;for(let $t=0;$t<50;$t++){let po=(Qt+St)/2;te(po)<pt?Qt=po:St=po}Yt=ct(se,E[Be],.5)*ut/Math.max(1e-9,ct(te,(Qt+St)/2,1e-4))}ot[Be]=v[Be][2]*Yt,Ge[Be]=v[Be][3]*Yt*Yt}for(let Be=0;Be<G-1;Be++){let pt=E[Be+1]-E[Be],Yt=ot[Be],Qt=ot[Be+1],St=Ge[Be]*pt,$t=Ge[Be+1]*pt;ke[Be]=(q[v[Be+1][1]]-q[v[Be][1]])/pt-((Yt+Qt)/2+(St-$t)/12)}}function Rt(se){if(se<=E[0])return 0;if(se>=E[G-1])return q[v[G-1][1]];let ie=0;for(;se>E[ie+1];)ie++;let Xe=E[ie+1]-E[ie],ut=(se-E[ie])/Xe,et=ut*ut,Ot=et*ut,Be=Ot*ut,pt=ot[ie],Yt=ot[ie+1],Qt=Ge[ie]*Xe,St=Ge[ie+1]*Xe,$t=pt*(ut-Ot+Be/2)+Qt*(et/2-2*Ot/3+Be/4)+Yt*(Ot-Be/2)+St*(Be/4-Ot/3)+ke[ie]*Ot*(10-15*ut+6*et);return q[v[ie][1]]+Xe*$t}let Wt=[0,1,2].map(se=>Gr([-1,-.9],[fe.getComponent(se),V.getComponent(se)],[0,0])),jt=se=>Kt(zt((se+.9)/(i+.9))),b=se=>Kt(zt((se+.9)/(I+.9))),ae=se=>Kt(zt((se-F)/($-F))),xe=.34,We=Jt-.005,Le=Gr([-1,-.9,P,-.5,-.25,0,.16,.34,Jt,ro],[38,48,f,38,31,30,30,32,42,52],[0,0,null,null,null,null,null,null,null,null]),at=31.26,Lt=me,Gt=De,Ut=le,At=(se,ie)=>{let Xe=se+1,ut=Xe<.08?Xe*Xe/.16:Xe-.04,et=Ut*(ut-.06);return ie.copy(Lt).multiplyScalar(at*Math.cos(et)).addScaledVector(Gt,at*Math.sin(et)).add(V)},Vt=se=>1+15*(1-Kt(zt((se-K)/(R-K)))),qe=se=>Kt(zt((se+.9)/.04))*(1-Kt(zt((se-I)/.06))),Te=se=>Kt(zt((se+.06)/.06));function Nt(se,ie,Xe){let ut=ie.length()-10;Xe.multiplyScalar(zt((ut-1)/6));let et=qe(se),Ot=Te(se);return et>0&&Xe.addScaledVector(Ze,-et*Xe.dot(Ze)),Ot>0&&Xe.addScaledVector(_,-Ot*Xe.dot(_)),Xe}let Xt=t(),no=t();function fo(se,ie,Xe,ut){let et=Math.min(Math.max(se,-1),ro),Ot=et<=-1?E[0]:et>=ro?E[G-1]:ce(et),Be=Rt(Ot);if(C.getPoint(C.getUtoTmapping(0,Math.max(0,Math.min(x[x.length-1],Be))),ie),et<=-.9)Xe.set(Wt[0](et),Wt[1](et),Wt[2](et));else if(et>=$)Xe.copy(A);else{let Yt=jt(et),Qt=ie.length(),St=Math.log(Qt+(Math.sqrt(Math.max(0,Qt*Qt-100))-Qt)*Yt),$t=ae(et),po=Math.exp(St+(Math.log(A.distanceTo(ie))-St)*$t);et>=I?Xe.copy(A).sub(ie).normalize().multiplyScalar(po).add(ie):Xe.copy(ie).add(ge(b(et)*M(no.copy(A).sub(ie)),no).multiplyScalar(po))}let pt=Kt(zt((et-xe)/(We-xe)));return pt>0&&Xe.lerp(Xt.copy(ie).addScaledVector(ue,40),pt),ut&&ut.set(0,1,0),Le(et)}return{toSun:be,EARTH:V,MARS:A,C0:Ae,L0:fe,P1:Fe,H2:Y,EN1:we,ENP:Pe,LCA:ue,PN:Ze,QN:_,CA:ro,E0:Jt,E1:wa,MOON_R:at,layout:Ft,spaceCam:fo,moonAt:At,marsFar:Vt,marsQ:yt,drift:Nt}}var Sl=.45,Uo=(e,t,a)=>Kt(zt((e-t)/(a-t)));function Yr(e,t,a){if(!(a<1))return t;let s=1-(1-Sl)*Uo(e,-.86,-.74),o=Math.min(2.2,(1.12/a)**s),u=Uo(e,-1,-.9);return 2*Math.atan(Math.tan(t*Math.PI/360)*(1+u*(o-1)))*180/Math.PI}function Qr(e,t){let a=1-Uo(t,.6,.8);if(a<=0)return 0;let s=Uo(e,-1,-.93)*(1-Uo(e,-.84,-.74)),o=Uo(e,.5,.6)*(1-Uo(e,.88,.98));return a*(.2*s+.14*o)}function xs({high:e=!0,rockets:t=!0}={}){let a=(()=>{let i=7;return()=>(i=i*16807%2147483647)/2147483647})(),s=[62,132,204],o=8,u={land:[[55,-150],[15,-168]],build:[-25,-100]},S=[{x:0,z:0,r:20,bt:.02,kind:"hub"}],g=[];for(let i=0;i<4;i++){let F=Math.PI/8+i*Math.PI/2;S.push({x:Math.cos(F)*96,z:Math.sin(F)*96,r:15,bt:.26+i*.08,kind:"outer"}),g.push({a:F,r0:19,len:62,y:2.6,radius:2.4,bt:.12+i*.07})}let L=(i,F)=>Math.abs(((i-F)%(Math.PI*2)+Math.PI*3)%(Math.PI*2)-Math.PI),m=[],O=[];for(let i=34;i<238;i+=14){let F=i*.11;for(;F<i*.11+Math.PI*2-.05;){let I=Math.min(6.6,2.6+a()*3.2+5*Math.exp(-i/70)),$=Math.cos(F)*i,K=Math.sin(F)*i,R=[...Array(o)].some((H,re)=>L(F,re*Math.PI/4)*i<I+4),Me=i<86&&g.some(H=>L(F,H.a)*i<I+3.5);if(!(R||Me||s.some(H=>Math.abs(i-H)<I+3.5)||S.some(H=>Math.hypot($-H.x,K-H.z)<H.r+I+3))&&a()>.1){let H=.06+i/238*.58+a()*.08;i>175&&a()<.28?O.push({x:$,z:K,w:8+a()*4,d:5,h:2.5+a()*2.5,rot:F,bt:H}):m.push({x:$,z:K,r:I,ys:.72+a()*.35,rot:a()*6.28,bt:H,seed:a()*50})}F+=(2*I+2.6)/i}}let P=[...m].sort((i,F)=>i.bt-F.bt);e||P.forEach((i,F)=>i.skip=F%2===1),t&&P.forEach(i=>{(u.land.some(([F,I])=>Math.hypot(i.x-F,i.z-I)<i.r+16)||Math.hypot(i.x-u.build[0],i.z-u.build[1])<i.r+30)&&(i.skip=!0)});let U=(i,F)=>{let I=Math.sin(i*.1271+F*.3117+1.7)*43758.5453;return I-Math.floor(I)};m.forEach(i=>{let F=U(i.x,i.z);i.type=F<.26?0:F<.56?1:F<.8?2:3,i.h=i.r*i.ys});let f=[];for(let i=262;i<345;i+=4.2)for(let F=.25;F<1.35;F+=3.2/i)f.push({x:Math.cos(F)*i,z:Math.sin(F)*i,bt:.22+(i-262)/83*.22+(F-.25)*.12});return{units:"m, colony space (+y up); bt = build start in city progress 0..1",rings:s.map(i=>({r:i,bt:.02+i/236*.55})),avenues:[...Array(o)].map((i,F)=>({a:F*Math.PI/4,r0:20,r1:250,bt:0})),domes:S,tubes:g,habs:m.filter(i=>!i.skip),fabs:O,solar:{r0:262,r1:345,a0:.25,a1:1.35,panel:[3,2.2],tilt:.5,cells:f},oldPad:{x:Math.cos(-.55)*300,z:Math.sin(-.55)*300,r:26},ships:u.land.map(([i,F])=>({x:i,z:F})),buildPad:{x:u.build[0],z:u.build[1],r:16.5,tower:{x:u.build[0]-12,z:u.build[1]+10}}}}var So=`
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
`,bs=`
float habLit(float h, float j){ float t0 = 0.03 + 0.6 * fract(h * 13.7 + j); return smoothstep(t0, t0 + 0.04, night) * (0.55 + 0.45 * night); }
`,Ma=bs,Io=`#include <lights_fragment_maps>
  iblIrradiance *= 1. - 0.9 * night; radiance *= 1. - 0.9 * night;`;function ys({THREE:e,renderer:t,sunDir:a,night:s=0}){let o=(a?a.clone():new e.Vector3(-.95,.24,-.21)).normalize(),u=new e.Scene,S=new e.SphereGeometry(10,64,32),g=new e.ShaderMaterial({side:e.BackSide,depthWrite:!1,uniforms:{sunDir:{value:o},night:{value:s}},vertexShader:"varying vec3 vD; void main(){ vD = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }",fragmentShader:`uniform vec3 sunDir; uniform float night; varying vec3 vD;
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
    }`});u.add(new e.Mesh(S,g));let L=new e.PMREMGenerator(t),m=L.fromScene(u,0,.1,100);return L.dispose(),S.dispose(),g.dispose(),m.texture.userData.renderTarget=m,m.texture}function ws({THREE:e,renderer:t,envMap:a=null,frameDetail:s="high"}={}){let o=e.Vector3,u={value:0},S={},g=[];function L(r){let l=[],C=[],x={};for(let G in r)x[G]=[];let d=new o,q=new o,v=new o,T=(G,E,ke,ot)=>{l.push(G.x,G.y,G.z),C.push(E.x,E.y,E.z);for(let Ge in r){let Oe=r[Ge],N=ke[Ge];if(typeof N=="function"&&(N=N(G,E)),N===void 0&&(N=Oe===1?0:[0,0,0]),Oe===1)x[Ge].push(Array.isArray(N)?N[ot]:N);else{let ne=Array.isArray(N[0])?N[ot]:N;for(let ce=0;ce<Oe;ce++)x[Ge].push(ne[ce]||0)}}},te={tri(G,E,ke,ot={},Ge=null,Oe=null){d.subVectors(E,G),q.subVectors(ke,G),v.crossVectors(d,q).normalize();let N=[0,1,2];Ge&&v.dot(Ge)<0&&(N=[0,2,1],v.negate());let ne=[G,E,ke];for(let ce of N)T(ne[ce],Oe?Oe[ce]:v,ot,ce)},quad(G,E,ke,ot,Ge={},Oe=null){te.tri(G,E,ke,Ge,Oe),te.tri(G,ke,ot,Ge,Oe)},box(G,E,ke,ot,Ge,Oe,N={},ne=!0){let ce=new e.BoxGeometry(ot,Ge,Oe);ce.translate(G,E,ke),te.geo(ce,N,ne?ct=>ct.y<-.5:null),ce.dispose()},geo(G,E={},ke=null,ot=!1){let Ge=G.index?G.toNonIndexed():G,Oe=Ge.attributes.position,N=Ge.attributes.normal,ne=new o,ce=new o,ct=new o,Ft=new o,Rt=new o,Wt=new o;for(let jt=0;jt<Oe.count;jt+=3)ne.fromBufferAttribute(Oe,jt),ce.fromBufferAttribute(Oe,jt+1),ct.fromBufferAttribute(Oe,jt+2),Ft.fromBufferAttribute(N,jt),Rt.fromBufferAttribute(N,jt+1),Wt.fromBufferAttribute(N,jt+2),!(ke&&ke(Ft.clone().add(Rt).add(Wt).normalize()))&&(ot?(d.subVectors(ce,ne),q.subVectors(ct,ne),v.crossVectors(d,q).normalize(),T(ne,v,E,0),T(ce,v,E,1),T(ct,v,E,2)):(T(ne,Ft,E,0),T(ce,Rt,E,1),T(ct,Wt,E,2)));Ge!==G&&Ge.dispose()},build(){let G=new e.BufferGeometry;G.setAttribute("position",new e.Float32BufferAttribute(l,3)),G.setAttribute("normal",new e.Float32BufferAttribute(C,3));for(let E in r)G.setAttribute(E,new e.Float32BufferAttribute(x[E],r[E]));return G.computeBoundingSphere(),G.computeBoundingBox(),G}};return te}let m=r=>(r.index?r.index.count:r.attributes.position.count)/3,O=(r=>()=>(r=r*16807%2147483647)/2147483647)(11);function P(r){let l=new e.IcosahedronGeometry(1,r-1),C=(1+Math.sqrt(5))/2;l.applyQuaternion(new e.Quaternion().setFromUnitVectors(new o(-1,C,0).normalize(),new o(0,1,0)));let x=l.attributes.position,d=[],q=new Map,v=[],T=new Map,te=G=>{let E=`${Math.round(G.x*1e4)},${Math.round(G.y*1e4)},${Math.round(G.z*1e4)}`,ke=q.get(E);return ke===void 0&&(ke=v.length,v.push(G.clone()),q.set(E,ke)),ke};for(let G=0;G<x.count;G+=3){let E=[0,1,2].map(Ge=>{let Oe=new o().fromBufferAttribute(x,G+Ge);return Math.abs(Oe.y)<1e-4&&(Oe.y=0),Oe}),ke=E[0].clone().add(E[1]).add(E[2]).divideScalar(3);if(ke.y<=1e-4)continue;new o().subVectors(E[1],E[0]).cross(new o().subVectors(E[2],E[0])).dot(ke)<0&&E.reverse();let ot=E.map(te);d.push({v:E,c:ke});for(let Ge=0;Ge<3;Ge++){let Oe=ot[Ge],N=ot[(Ge+1)%3],ne=Oe<N?Oe+"_"+N:N+"_"+Oe;T.has(ne)||T.set(ne,[Oe,N])}}return l.dispose(),{faces:d,verts:v,edges:[...T.values()]}}function U(r,l,C,x,d,q,v,T,te=!1){let G=l.clone().multiplyScalar(x),E=C.clone().multiplyScalar(x),ke=E.clone().sub(G).normalize(),ot=G.clone().add(E).normalize(),Ge=new o().crossVectors(ke,ot).normalize(),Oe=new o().crossVectors(Ge,ke).normalize(),N=te?[Oe.clone().multiplyScalar(-v).addScaledVector(Ge,d),Oe.clone().multiplyScalar(q),Oe.clone().multiplyScalar(-v).addScaledVector(Ge,-d)]:[Oe.clone().multiplyScalar(-v).addScaledVector(Ge,d),Oe.clone().multiplyScalar(q).addScaledVector(Ge,d*.5),Oe.clone().multiplyScalar(q).addScaledVector(Ge,-d*.5),Oe.clone().multiplyScalar(-v).addScaledVector(Ge,-d)];for(let ne=0;ne<N.length-1;ne++)r.quad(G.clone().add(N[ne]),E.clone().add(N[ne]),E.clone().add(N[ne+1]),G.clone().add(N[ne+1]),T,N[ne].clone().add(N[ne+1]))}function f(r,l,C,x,d,q,v=4){let T=l.clone().normalize(),te=T.clone().multiplyScalar(C-.004),G=new o(0,1,0);Math.abs(T.y)>.9&&G.set(1,0,0),G.cross(T).normalize();let E=T.clone().cross(G),ke=T.clone().multiplyScalar(C+d),ot=O()*6.28,Ge=[...Array(v)].map((Oe,N)=>{let ne=ot+N/v*Math.PI*2;return te.clone().addScaledVector(G,Math.cos(ne)*x).addScaledVector(E,Math.sin(ne)*x)});for(let Oe=0;Oe<v;Oe++)r.tri(Ge[Oe],Ge[(Oe+1)%v],ke,q,T)}let i=(r,l)=>r.clone().add(new o(O()-.5,O()-.5,O()-.5).multiplyScalar(l)).normalize(),F=[[1,0,0],[0,1,0],[0,0,1]];function I(r,l,C){return r.onBeforeCompile=x=>{x.uniforms.night=u,C(x),x.fragmentShader=x.fragmentShader.replace("#include <normal_fragment_maps>",`#include <normal_fragment_maps>
        { vec3 dnx = dFdx(normal), dny = dFdy(normal); float k = min(.18, 2. * max(dot(dnx, dnx), dot(dny, dny))); roughnessFactor = sqrt(roughnessFactor * roughnessFactor + k); }`)},r.customProgramCacheKey=()=>"hab-"+l,g.push(r),r}function $(r,l,C){let x=new e.MeshDepthMaterial({depthPacking:e.RGBADepthPacking});return x.onBeforeCompile=d=>{d.vertexShader=l+So+d.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
`+C)},x.customProgramCacheKey=()=>"habdepth-"+r,x}let K=P(4),R=.995,Me=.9,pe=.985,H=r=>[1-r.y,Math.min(1,Math.abs(r.y-.36)*2.6),O()],re=L({sel:3,bary:3,kind:1}),Ne=L({sel:3,bary:3,kind:1}),me=L({sel:3,bary:3,kind:1}),De=L({sel:3,bary:3,kind:1}),le=r=>r.clone().normalize(),be=(r,l)=>r.clone().addScaledVector(l,1).normalize(),V=[[.5,.5,0],[0,.5,.5],[.5,0,.5]];K.faces.forEach(r=>{let l=r.v.map(v=>r.c.clone().lerp(v,Me).multiplyScalar(R)),C=H(r.c),x=i(r.c.clone().normalize(),.03).sub(r.c.clone().normalize());re.tri(l[0],l[1],l[2],{sel:C,bary:F,kind:0},r.c,l.map(le)),Ne.tri(l[0],l[1],l[2],{sel:C,bary:F,kind:0},r.c,l.map(v=>be(le(v),x)));let d=[[0,1],[1,2],[0,2]].map(([v,T])=>l[v].clone().add(l[T]).normalize().multiplyScalar(R*.997)),q=[[l[0],d[0],d[2],[F[0],V[0],V[2]]],[d[0],l[1],d[1],[V[0],F[1],V[1]]],[d[2],d[1],l[2],[V[2],V[1],F[2]]],[d[0],d[1],d[2],[V[0],V[1],V[2]]]];for(let[v,T,te,G]of q)me.tri(v,T,te,{sel:C,bary:G,kind:0},r.c,[v,T,te].map(le)),De.tri(v,T,te,{sel:C,bary:G,kind:0},r.c,[v,T,te].map(E=>be(le(E),x)))});for(let r of[me,re]){let l=[[.2,0]];for(let v=0;v<=6;v++){let T=v/6*Math.PI;l.push([.2*Math.cos(T),.2+.2*Math.sin(T)])}l.push([-.2,0]);let C=.7,x=1.2,d=(v,[T,te])=>new o(v,te,T);for(let v=0;v<l.length-1;v++){let T=[(l[v][0]+l[v+1][0])/2,(l[v][1]+l[v+1][1])/2-.15];r.quad(d(C,l[v]),d(x,l[v]),d(x,l[v+1]),d(C,l[v+1]),{kind:1,bary:[.3,.3,.3]},new o(0,T[1],T[0]))}let q=new o(x,.17,0);for(let v=0;v<l.length;v++)r.tri(q,d(x,l[v]),d(x,l[(v+1)%l.length]),{kind:1,bary:[.3,.3,.3]},new o(1,0,0));r.quad(new o(x+.006,.02,.11),new o(x+.006,.02,-.11),new o(x+.006,.31,-.11),new o(x+.006,.31,.11),{kind:2,bary:[.3,.3,.3]},new o(1,0,0)),r.quad(new o(x+.01,.2,.05),new o(x+.01,.2,-.05),new o(x+.01,.27,-.05),new o(x+.01,.27,.05),{kind:3,bary:[.3,.3,.3]},new o(1,0,0)),r.quad(new o(.98,.18,.203),new o(1.06,.18,.203),new o(1.06,.26,.203),new o(.98,.26,.203),{kind:3,bary:[.3,.3,.3]},new o(0,0,1))}let oe=re.build(),Ae=Ne.build(),fe=me.build(),de=De.build(),Ce=L({kind:1}),ve=L({kind:1}),Fe=s==="low";K.edges.forEach(([r,l])=>U(Ce,K.verts[r],K.verts[l],pe,.017,.019,.014,{kind:0},Fe)),K.verts.forEach(r=>f(Ce,r,pe,.03,.03,{kind:1},Fe?3:4));for(let r of[ve,Ce]){let l=new e.CylinderGeometry(.075,.085,.05,8,1,!1);l.translate(0,pe+.02,0),r.geo(l,{kind:4},q=>q.y<-.5,!0),l.dispose();let C=.3,x=Math.sqrt(1-C*C)*pe;r.box(C,x+.17,.05,.016,.36,.016,{kind:2});let d=new e.ConeGeometry(.09,.04,9,1,!0);d.rotateX(Math.PI),d.rotateZ(-.9),d.translate(C+.03,x+.3,.05),r.geo(d,{kind:2},null,!0),d.dispose(),r.box(C,x+.36,.05,.03,.03,.03,{kind:3}),r.box(1.2/1.015+.012,.345/1.015,0,.03,.025,.06,{kind:5})}let Ue=Ce.build(),Ze=ve.build(),Re=`#ifdef HAB_FAR
      { float re = min(min(vBary.x, vBary.y), vBary.z), fw = max(fwidth(re), 1e-4), w0 = 0.046;
        float rib = mix(1. - smoothstep(w0 - .5 * fw, w0 + .5 * fw, re), min(1., 5.4 * w0), smoothstep(.6 * w0, 2.5 * w0, fw));
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(.55, .5, .44), rib * .85); habRib = rib; }
      #endif`,je=r=>I(new e.MeshStandardMaterial({color:16777215,roughness:.55,metalness:.08,envMap:a,envMapIntensity:.45}),r?"shell-far":"shell",l=>{l.vertexShader=`attribute vec3 sel; attribute vec3 bary; attribute float kind; varying vec3 vSel; varying vec3 vBary; varying float vKind; varying float vIh; varying float vY; varying float vFrac;
`+So+l.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
      float ih = habInstHash(), frac; vec3 hw; habType(ih, frac, hw);
      transformed *= kind < 0.5 ? step(frac, dot(hw, sel)) : habHasVest(ih);
      vSel = sel; vBary = bary; vKind = kind; vIh = ih; vY = position.y; vFrac = frac;`),l.fragmentShader=(r?`#define HAB_FAR
`:"")+`uniform float night; varying vec3 vSel; varying vec3 vBary; varying float vKind; varying float vIh; varying float vY; varying float vFrac; float habRib = 0.;
`+Ma+l.fragmentShader.replace("#include <color_fragment>",`#include <color_fragment>
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
      ${Re}
      }`).replace("#include <roughnessmap_fragment>",`#include <roughnessmap_fragment>
      roughnessFactor = mix(roughnessFactor + 0.1 * (pr - 0.5), 0.22, max(solar, win));`).replace("#include <metalnessmap_fragment>",`#include <metalnessmap_fragment>
      metalnessFactor = mix(metalnessFactor, 0.55, max(solar, win));`).replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>
      totalEmissiveRadiance += vec3(1., 0.62, 0.3) * win * (0.15 + 2.6 * habLit(vIh, 0.));`).replace("#include <lights_fragment_maps>",Io)}),ge=je(!1),M=je(!0),h=r=>I(new e.MeshStandardMaterial({color:16777215,roughness:.05,metalness:.92,envMap:a,envMapIntensity:1.5}),r?"glass-far":"glass",l=>{l.vertexShader=`attribute vec3 sel; attribute vec3 bary; attribute float kind; varying vec3 vSel; varying vec3 vBary; varying float vIh; varying float vY;
`+So+l.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
      float ih = habInstHash(), frac; vec3 hw; habType(ih, frac, hw);
      transformed *= 1. - step(frac, dot(hw, sel));
      vSel = sel; vBary = bary; vIh = ih; vY = position.y;`),l.fragmentShader=(r?`#define HAB_FAR
`:"")+`uniform float night; varying vec3 vSel; varying vec3 vBary; varying float vIh; varying float vY; float habRib = 0.;
`+Ma+l.fragmentShader.replace("#include <color_fragment>",`#include <color_fragment>
      float pr = fract(vSel.z * 23.7 + vIh * 3.3), edge = min(min(vBary.x, vBary.y), vBary.z), mull = 1. - smoothstep(0.03, 0.07, edge);
      diffuseColor.rgb = mix(mix(vec3(0.30, 0.34, 0.39), vec3(0.42, 0.33, 0.24), step(0.62, pr)), vec3(0.2, 0.19, 0.18), mull);
      ${Re}
      mull = max(mull, habRib);`).replace("#include <roughnessmap_fragment>",`#include <roughnessmap_fragment>
      roughnessFactor = mix(roughnessFactor + 0.05 * pr, 0.55, mull);
      roughnessFactor = max(roughnessFactor, 0.05 + 0.25 * smoothstep(40., 300., length(vViewPosition))); // distance floor: far facets stop sparkling`).replace("#include <metalnessmap_fragment>",`#include <metalnessmap_fragment>
      metalnessFactor = mix(metalnessFactor, 0.4, mull);`).replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>
      float on = 0.45 + 0.55 * step(0.3, fract(vIh * 11.3)), lit = 0.35 + 0.65 * step(0.38, fract(pr * 5.7 + vIh));
      totalEmissiveRadiance += vec3(1., 0.56, 0.24) * habLit(vIh, floor(pr * 4.) * 0.17) * on * lit * (1. - mull) * (0.7 + 0.9 * (1. - vY)) * 1.7;`).replace("#include <lights_fragment_maps>",Io)}),k=h(!1),A=h(!0);k.userData.night=u;let w=I(new e.MeshStandardMaterial({color:12761517,roughness:.38,metalness:.55,envMap:a,envMapIntensity:.7}),"frame",r=>{r.vertexShader=`attribute float kind; varying float vKind; varying float vHs;
`+So+r.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
      float ih = habInstHash();
      transformed *= kind > 1.5 && kind < 3.5 ? habHasAnt(ih) : (kind > 4.5 ? habHasVest(ih) : 1.);
      vKind = kind;
      #ifdef USE_INSTANCING
        vHs = length(instanceMatrix[0].xyz);
      #else
        vHs = length(modelMatrix[0].xyz);
      #endif`),r.fragmentShader=`uniform float night; varying float vKind; varying float vHs;
`+r.fragmentShader.replace("#include <color_fragment>",`#include <color_fragment>
      float lamp = step(2.5, vKind) * (1. - step(3.5, vKind)) + step(4.5, vKind);
      diffuseColor.rgb *= vKind > 0.5 && vKind < 1.5 ? 0.62 : (vKind > 3.5 && vKind < 4.5 ? 0.5 : 1.);
      // struts/hubs narrower than a pixel: blend toward the shell's colour and finish so they stop shimmering
      float thin = (1. - clamp(0.034 * vHs / max(length(fwidth(vViewPosition)), 1e-5), 0., 1.)) * step(vKind, 1.5);
      diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.62, 0.58, 0.54), thin * 0.7);`).replace("#include <roughnessmap_fragment>",`#include <roughnessmap_fragment>
      roughnessFactor = mix(roughnessFactor, 0.6, thin);`).replace("#include <metalnessmap_fragment>",`#include <metalnessmap_fragment>
      metalnessFactor = mix(metalnessFactor, 0.1, thin);`).replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>
      totalEmissiveRadiance += (vKind < 4. ? vec3(1., 0.15, 0.08) : vec3(1., 0.8, 0.55)) * lamp * (0.4 + 4. * night);`).replace("#include <lights_fragment_maps>",Io)}),ee=$("shell",`attribute float kind;
`,"transformed *= kind < 0.5 ? 1. : habHasVest(habInstHash());"),J=$("frame",`attribute float kind;
`,"float ih0 = habInstHash(); transformed *= kind > 1.5 && kind < 3.5 ? habHasAnt(ih0) : (kind > 4.5 ? habHasVest(ih0) : 1.);"),_=r=>{let l=[[0,.5,0],[.9,.5,0],[1,.5,1],[1.035,.47,1],[1.08,.42,2],[1.16,.29,2],[1.24,.13,2],[1.31,.03,2],[1.37,0,3]],C=[],x=[],d=[],q=(N,ne,ce)=>{let ct=Math.sin(N*12.9898+ne*78.233+ce*37.719)*43758.5453;return ct-Math.floor(ct)};for(let N=0;N<l.length;N++)for(let ne=0;ne<=r;ne++){let ce=ne%r,ct=ce/r*Math.PI*2,[Ft,Rt,Wt]=l[N],jt=Wt===2?q(ce,N,1)-.5+.6*(Math.sin(ct*3+1.3)*.5):0,b=Ft+jt*.05,ae=Math.max(0,Rt+(Wt===2?(q(ce,N,2)-.5)*.07+jt*.03:0));C.push(Math.cos(ct)*b,ae,Math.sin(ct)*b);let xe=q(ce,N,3),We=Wt===0?[.5+xe*.03,.42+xe*.03,.35+xe*.02]:Wt===1?[.36,.32,.28]:Wt===2?[.4+xe*.1,.18+xe*.05,.085+xe*.025]:[.38,.17,.08];x.push(...We)}for(let N=0;N<l.length-1;N++)for(let ne=0;ne<r;ne++){let ce=N*(r+1)+ne,ct=ce+r+1;d.push(ce,ce+1,ct,ce+1,ct+1,ct)}let v=new e.BufferGeometry;v.setAttribute("position",new e.Float32BufferAttribute(C,3)),v.setAttribute("color",new e.Float32BufferAttribute(x,3)),v.setIndex(d),v.computeVertexNormals();let T=v.toNonIndexed(),te=L({color:3,kind:1}),G=T.attributes.color,E=T.attributes.position,ke=T.attributes.normal,ot=new o,Ge=new o,Oe=new o;for(let N=0;N<E.count;N+=3)ot.fromBufferAttribute(E,N),Ge.fromBufferAttribute(E,N+1),Oe.fromBufferAttribute(E,N+2),!(ot.distanceTo(Ge)<1e-6||Ge.distanceTo(Oe)<1e-6||ot.distanceTo(Oe)<1e-6)&&te.tri(ot,Ge,Oe,{color:[0,1,2].map(ne=>[G.getX(N+ne),G.getY(N+ne),G.getZ(N+ne)]),kind:0},null,[0,1,2].map(ne=>new o().fromBufferAttribute(ke,N+ne)));v.dispose(),T.dispose();for(let N=0;N<6;N++){let ne=N/6*Math.PI*2+.26;te.box(Math.cos(ne)*1,.565,Math.sin(ne)*1,.03,.13,.03,{color:[.25,.24,.23],kind:1})}return te.build()},z=_(30),p=_(14),B=I(new e.MeshStandardMaterial({color:16777215,vertexColors:!0,roughness:.95,metalness:0}),"pad",r=>{r.vertexShader=`attribute float kind; varying float vKind; varying float vPY;
`+r.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
      vKind = kind; vPY = position.y;`),r.fragmentShader=`uniform float night; varying float vKind; varying float vPY;
`+r.fragmentShader.replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>
      totalEmissiveRadiance += vec3(1., 0.72, 0.42) * step(0.5, vKind) * step(0.6, vPY) * (0.3 + 5. * night);`)}),Y=(()=>{let l=[],C=[],x=[],d=[[.95,.62],[1.3,.38],[1.75,0]];d.forEach(([v,T])=>{for(let te=0;te<=30;te++){let G=te/30*Math.PI*2;l.push(Math.cos(G)*v,.025,Math.sin(G)*v),C.push(T)}});for(let v=0;v<d.length-1;v++)for(let T=0;T<30;T++){let te=v*31+T,G=te+30+1;x.push(te,te+1,G,te+1,G+1,G)}let q=new e.BufferGeometry;return q.setAttribute("position",new e.Float32BufferAttribute(l,3)),q.setAttribute("alpha",new e.Float32BufferAttribute(C,1)),q.setIndex(x),q.computeBoundingSphere(),q})(),Q=new e.ShaderMaterial({transparent:!0,depthWrite:!1,polygonOffset:!0,polygonOffsetFactor:-2,polygonOffsetUnits:-2,uniforms:{strength:{value:.75}},vertexShader:`attribute float alpha; varying float vA; void main(){ vA = alpha;
      #ifdef USE_INSTANCING
        vec4 p = modelMatrix * instanceMatrix * vec4(position, 1.);
      #else
        vec4 p = modelMatrix * vec4(position, 1.);
      #endif
      gl_Position = projectionMatrix * viewMatrix * p; }`,fragmentShader:"uniform float strength; varying float vA; void main(){ gl_FragColor = vec4(0.06, 0.025, 0.012, vA * vA * strength); }"}),j=(()=>{let r=L({kind:1,variant:1});r.box(0,.03,0,1.04,.06,1.06,{kind:6,variant:0});let l=.42,C=12,x=[...Array(C+1)].map((v,T)=>{let te=T/C*Math.PI;return[.5*Math.cos(te),l+.58*Math.sin(te)]}),d=(v,T,te)=>new o(v,te,T);for(let v of[-1,1])r.quad(d(-.5,.5*v,.06),d(.5,.5*v,.06),d(.5,.5*v,l),d(-.5,.5*v,l),{kind:0,variant:1},new o(0,0,v));for(let v=0;v<C;v++){let[T,te]=x[v],[G,E]=x[v+1],ke=new o(0,(te+E)/2-l,(T+G)/2);r.quad(d(-.5,T,te),d(.5,T,te),d(.5,G,E),d(-.5,G,E),{kind:0,variant:1},ke)}for(let v of[-1,1]){r.quad(d(.5*v,-.5,.06),d(.5*v,.5,.06),d(.5*v,.5,l),d(.5*v,-.5,l),{kind:0,variant:1},new o(v,0,0));for(let T=0;T<C;T++)r.tri(d(.5*v,0,l),d(.5*v,x[T][0],x[T][1]),d(.5*v,x[T+1][0],x[T+1][1]),{kind:0,variant:1},new o(v,0,0))}r.quad(d(.506,-.32,.06),d(.506,.32,.06),d(.506,.32,.66),d(.506,-.32,.66),{kind:1,variant:1},new o(1,0,0)),r.box(.51,.69,0,.012,.03,.7,{kind:3,variant:1});for(let v of[-1,1])r.quad(d(-.44,.506*v,.24),d(.44,.506*v,.24),d(.44,.506*v,.34),d(-.44,.506*v,.34),{kind:2,variant:1},new o(0,0,v));r.quad(d(.2,.507,.06),d(.3,.507,.06),d(.3,.507,.22),d(.2,.507,.22),{kind:1,variant:1},new o(0,0,1)),r.box(-.22,1.02,0,.12,.06,.16,{kind:3,variant:1}),r.box(.12,1.015,0,.08,.05,.1,{kind:3,variant:1}),r.box(-.38,.98,.12,.04,.09,.04,{kind:3,variant:1}),r.box(.515,.74,0,.012,.025,.06,{kind:4,variant:1}),r.box(0,.43,0,1,.74,1,{kind:0,variant:2});for(let[v,T,te,G]of[[0,.49,1,.025],[0,-.49,1,.025],[.49,0,.025,1],[-.49,0,.025,1]])r.box(v,.83,T,te,.06,G,{kind:0,variant:2});r.box(-.25,.86,.1,.18,.12,.3,{kind:3,variant:2}),r.box(.05,.84,-.18,.1,.08,.12,{kind:3,variant:2});let q=new e.PlaneGeometry(.34,.5);q.rotateX(-Math.PI/2),q.rotateZ(.25),q.translate(.28,.86,.05),r.geo(q,{kind:5,variant:2},null,!0),q.dispose(),r.quad(d(.504,-.22,.06),d(.504,.22,.06),d(.504,.22,.56),d(.504,-.22,.56),{kind:1,variant:2},new o(1,0,0));for(let v of[-1,1])r.quad(d(-.45,.504*v,.46),d(.45,.504*v,.46),d(.45,.504*v,.6),d(-.45,.504*v,.6),{kind:2,variant:2},new o(0,0,v));return r.quad(d(-.504,-.4,.46),d(-.504,.4,.46),d(-.504,.4,.6),d(-.504,-.4,.6),{kind:2,variant:2},new o(-1,0,0)),r.box(.512,.6,0,.012,.025,.06,{kind:4,variant:2}),r.build()})(),Z=`attribute float kind; attribute float variant;
`,ye="float shv = fract(habInstHash() * 5.7) < 0.55 ? 1. : 2.; transformed *= (variant < 0.5 || abs(variant - shv) < 0.5) ? 1. : 0.;",ze=I(new e.MeshStandardMaterial({color:16777215,roughness:.62,metalness:.18,envMap:a,envMapIntensity:.5}),"shed",r=>{r.vertexShader=Z+`varying float vKind; varying vec3 vLP; varying vec3 vSc; varying vec3 vN0;
`+So+r.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
      ${ye}
      vKind = kind; vLP = position; vN0 = normal;
      #ifdef USE_INSTANCING
        vSc = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz));
      #else
        vSc = vec3(length(modelMatrix[0].xyz), length(modelMatrix[1].xyz), length(modelMatrix[2].xyz));
      #endif`),r.fragmentShader=`uniform float night; varying float vKind; varying vec3 vLP; varying vec3 vSc; varying vec3 vN0;
`+Ma+r.fragmentShader.replace("#include <color_fragment>",`#include <color_fragment>
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
      totalEmissiveRadiance += vec3(1., 0.66, 0.36) * win * habLit(fract(vSc.x * 0.37 + vSc.y * 1.31), floor(m.x / 1.4) * 0.11) * (0.4 + 1.8 * bay) + vec3(1., 0.85, 0.6) * lamp * (0.4 + 4. * night);`).replace("#include <lights_fragment_maps>",Io)}),we=$("shed",Z,ye);function Pe(r,{remap:l=0,baryMull:C=!0,color:x=9082530}={}){return I(new e.MeshStandardMaterial({color:x,roughness:.035,metalness:.9,envMap:a,envMapIntensity:1.4,transparent:!0,depthWrite:!1,emissive:16777215,emissiveIntensity:0}),r,d=>{d.vertexShader=(C?`attribute vec3 bary; varying vec3 vBary;
`:"")+`varying float vGY;
`+(`varying float vOh;
`+So)+d.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
        ${C?"vBary = bary;":""} vGY = position.y; vOh = habInstHash();`),d.fragmentShader=(C?`varying vec3 vBary;
`:"")+`uniform float night; varying float vGY;
varying float vOh;
`+Ma+d.fragmentShader.replace("#include <color_fragment>",`#include <color_fragment>
        float mull = ${C?"1. - smoothstep(0.035, 0.08, min(min(vBary.x, vBary.y), vBary.z))":"0."};
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.16, 0.15, 0.14), mull);`).replace("#include <roughnessmap_fragment>",`#include <roughnessmap_fragment>
        roughnessFactor = mix(roughnessFactor, 0.5, mull);`).replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>
        totalEmissiveRadiance = emissive * vec3(1., 0.6, 0.3) * (1. - mull);
        totalEmissiveRadiance += vec3(1., 0.58, 0.26) * habLit(vOh, 0.31) * 0.22 * (1. - mull) * (1.2 - vGY);`).replace("#include <lights_fragment_maps>",Io).replace("#include <opaque_fragment>",`
        // the sun glint on near-mirror glass overflows half float (inf), which bloom/DOF smear into a hard square: cap it
        outgoingLight = min(outgoingLight, vec3(12.));
        float fr = pow(1. - clamp(abs(dot(normalize(vViewPosition), normal)), 0., 1.), 2.2);
        float lum = dot(outgoingLight, vec3(0.3, 0.59, 0.11));
        diffuseColor.a = ${l?`clamp(opacity / ${l.toFixed(3)}, 0., 1.)`:"opacity"} * clamp(max(max(mix(0.5, 1., fr), lum * 1.4), mull), 0., 1.);
        #include <opaque_fragment>`)})}let ue=P(8),Ee=(()=>{let r=L({kind:1});return ue.edges.forEach(([l,C])=>U(r,ue.verts[l],ue.verts[C],1,.0042,.006,.005,{kind:0})),ue.verts.forEach(l=>f(r,l,1,.009,.008,{kind:1},5)),r.build()})(),_e=(()=>{let r=L({bary:3});return ue.faces.forEach(l=>{let C=l.v.map(q=>l.c.clone().lerp(q,.97).multiplyScalar(.994)),x=l.c.clone().normalize(),d=i(x,.02).sub(x);r.tri(C[0],C[1],C[2],{bary:F},l.c,C.map(q=>q.clone().normalize().add(d).normalize()))}),r.build()})(),rt=new e.SphereGeometry(.975,28,10,0,Math.PI*2,0,Math.PI/2),yt=(()=>{let r=L({color:3,kind:1}),l=(x,d,q=!0)=>{r.geo(x,d,v=>v.y<-.5,q),x.dispose()};{let x=new e.CircleGeometry(.985,40);x.rotateX(-Math.PI/2),x.translate(0,.004,0),l(x,{color:[.5,.43,.36]})}let C=[[.62,.05],[.48,.1],[.34,.15]];C.forEach(([x,d])=>{let q=new e.CylinderGeometry(x,x*1.02,d,28);q.translate(0,d/2,0),l(q,{color:(v,T)=>T.y>.5?[.16+O()*.05,.22+O()*.05,.07]:[.62,.57,.5]})});{let x=new e.CylinderGeometry(.065,.085,.6,10);x.translate(0,.3,0),l(x,{color:[.82,.8,.76]})}for(let x of[.24,.36,.48]){let d=new e.CylinderGeometry(.083-x*.03,.083-x*.03,.035,10,1,!0);d.translate(0,x,0),l(d,{color:[.05,.05,.06],kind:1})}for(let x=0;x<7;x++){let d=x/7*Math.PI*2+.3,q=.78+x%2*.06,v=.08+x%3*.05,T=Math.cos(d)*q,te=Math.sin(d)*q,G=new e.BoxGeometry(.11,v,.09);G.rotateY(-d),G.translate(T,v/2,te),l(G,{color:[.84,.82,.78]});let E=new e.BoxGeometry(.114,.02,.094);E.rotateY(-d),E.translate(T,v*.62,te),l(E,{color:[.05,.05,.06],kind:1})}for(let x=0;x<44;x++){let d=x%3,[q,v]=C[d],T=(d===2?.12:C[d+1][0]+.03)+O()*(q-(d===2?.16:C[d+1][0]+.06)),te=O()*6.28,G=.018+O()*.016,E=new e.IcosahedronGeometry(G,0);E.scale(1,1.4,1),E.translate(Math.cos(te)*T,v+G*1.2,Math.sin(te)*T);let ke=O();r.geo(E,{color:[.12+ke*.08,.2+ke*.08,.06]},null,!0),E.dispose()}return r.build()})(),kt=(()=>{let r=L({color:3});{let l=new e.CylinderGeometry(1.03,1.03,.03,64,1,!0);l.translate(0,.015,0),r.geo(l,{color:[.4,.36,.31]}),l.dispose()}{let l=new e.RingGeometry(.99,1.03,64);l.rotateX(-Math.PI/2),l.translate(0,.03,0),r.geo(l,{color:[.48,.42,.35]}),l.dispose()}{let l=new e.CylinderGeometry(1.035,1.11,.026,64,1,!0);l.translate(0,.013,0),r.geo(l,{color:()=>[.42+O()*.06,.2+O()*.03,.09]}),l.dispose()}return r.build()})(),mt=I(new e.MeshStandardMaterial({color:14209220,roughness:.34,metalness:.6,envMap:a,envMapIntensity:.7}),"lattice",r=>{r.vertexShader=`attribute float kind; varying float vKind;
`+r.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
      vKind = kind;`),r.fragmentShader=`uniform float night; varying float vKind;
`+r.fragmentShader.replace("#include <color_fragment>",`#include <color_fragment>
      diffuseColor.rgb *= vKind > 0.5 ? 0.6 : 1.;`).replace("#include <lights_fragment_maps>",Io)}),tt=I(new e.MeshStandardMaterial({color:16777215,vertexColors:!0,roughness:.85,metalness:.05}),"interior",r=>{r.vertexShader=`attribute float kind; varying float vKind;${` varying float vOh;
`+So}
`+r.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
      vKind = kind; vOh = habInstHash();`),r.fragmentShader=`uniform float night; varying float vKind; varying float vOh;
`+Ma+r.fragmentShader.replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>
      totalEmissiveRadiance += vec3(1., 0.66, 0.36) * step(0.5, vKind) * (0.2 + 3.2 * habLit(vOh, 0.31));`)}),Pt=new e.MeshStandardMaterial({color:16777215,vertexColors:!0,roughness:.95});g.push(Pt);function Mt(){let r=new e.Group;r.name="bigDome";let l=new e.Mesh(Ee,mt);l.name="lattice",l.castShadow=l.receiveShadow=!0,l.customDepthMaterial=new e.MeshDepthMaterial({depthPacking:e.RGBADepthPacking});let C=new e.Mesh(yt,tt);C.name="interior",C.castShadow=C.receiveShadow=!0;let x=new e.Mesh(kt,Pt);x.name="base",x.receiveShadow=!0;let d=new e.Mesh(Y,Q);d.name="skirt",d.scale.set(.9,1,.9),d.renderOrder=-1,l.add(C,x,d);let q=Pe("bigglass",{remap:.28}),v=new e.Mesh(_e,q);v.name="glass",v.receiveShadow=!0,v.castShadow=!0;let T=new e.MeshDepthMaterial({depthPacking:e.RGBADepthPacking,alphaHash:!0,opacity:0,side:e.DoubleSide});v.customDepthMaterial=T;let te=0;Object.defineProperty(q,"opacity",{get:()=>te,set:ke=>{te=ke,T.opacity=.45*Math.min(1,Math.max(0,ke/.28))},configurable:!0}),q.opacity=0;let G=new e.MeshBasicMaterial({color:16751184,transparent:!0,opacity:0,side:e.BackSide,blending:e.AdditiveBlending,depthWrite:!1});G.onBeforeCompile=ke=>{ke.uniforms.night=u,ke.vertexShader=`varying float vGY; varying float vOh;
`+So+ke.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
vGY = position.y; vOh = habInstHash();`),ke.fragmentShader=`uniform float night; varying float vGY; varying float vOh;
`+bs+ke.fragmentShader.replace("#include <color_fragment>",`#include <color_fragment>
diffuseColor.rgb *= 2.6 * (0.35 + 1.1 * (1. - vGY)) * habLit(vOh, 0.31) / max(night, 0.02);`)},G.customProgramCacheKey=()=>"hab-bigglow";let E=new e.Mesh(rt,G);return E.name="glow",r.add(l,v,E),r}let he=16,Ve=(()=>{let r=new e.CylinderGeometry(2.4,2.4,1,he,1,!0).rotateZ(Math.PI/2).translate(.5,0,0),l=r.toNonIndexed();return r.dispose(),l.computeVertexNormals(),l.computeBoundingSphere(),l})(),$e=Pe("tube",{baryMull:!1,color:8227478});$e.emissive.setRGB(1.6,1.6,1.6);let Ye=(()=>{let r=L({kind:1}),l=16,C=.11/62,x=q=>q/he*Math.PI*2,d=(q,v,T)=>new o(q,v*Math.sin(T),v*Math.cos(T));for(let q=0;q<=l;q++){let v=Math.min(1-C,Math.max(C,q/l)),T=2.53,te=2.41;for(let G=0;G<he;G++){let E=x(G),ke=x(G+1),ot=(E+ke)/2,Ge=d(0,1,ot);r.quad(d(v-C,T,E),d(v+C,T,E),d(v+C,T,ke),d(v-C,T,ke),{kind:0},Ge),r.quad(d(v-C,te,E),d(v+C,te,E),d(v+C,te,ke),d(v-C,te,ke),{kind:0},Ge.clone().negate());for(let Oe of[-1,1])r.quad(d(v+Oe*C,te,E),d(v+Oe*C,T,E),d(v+Oe*C,T,ke),d(v+Oe*C,te,ke),{kind:0},new o(Oe,0,0))}if(q%2===0||q===l)for(let G of[-1.1,1.1])r.box(v,-2.52,G,C*5,.16,.7,{kind:3})}r.box(.5,-1.8,0,1,.12,3.1,{kind:1});for(let q of[-1.42,1.42])r.box(.5,-1.72,q,1,.04,.08,{kind:2});for(let q of[-2.1,2.1])r.box(.5,-1.05,q,1,.08,.08,{kind:0});return r.build()})(),Je=I(new e.MeshStandardMaterial({color:13814462,roughness:.4,metalness:.55,envMap:a,envMapIntensity:.7}),"rib",r=>{r.vertexShader=`attribute float kind; varying float vKind;
`+r.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
      vKind = kind;`),r.fragmentShader=`uniform float night; varying float vKind;
`+r.fragmentShader.replace("#include <color_fragment>",`#include <color_fragment>
      diffuseColor.rgb *= vKind > 0.5 && vKind < 1.5 ? vec3(0.55, 0.5, 0.45) : (vKind > 2.5 ? vec3(0.45, 0.4, 0.36) : vec3(1.));`).replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>
      totalEmissiveRadiance += vec3(1., 0.72, 0.45) * step(1.5, vKind) * (1. - step(2.5, vKind)) * (0.2 + 3. * night);`).replace("#include <lights_fragment_maps>",Io)});[oe,Ae,fe,de,Ue,Ze,z,p,Y,j,Ve,Ye,Ee,_e,yt,kt].forEach(r=>r.computeBoundingSphere()),Object.assign(S,{habShell:m(oe),habGlass:m(Ae),habFrame:m(Ue),ringPad:m(z),skirt:m(Y),shed:m(j),tube:m(Ve),rib:m(Ye),bigDome:{lattice:m(Ee),glass:m(_e),glow:m(rt),interior:m(yt),base:m(kt)}});function He(r){[...g,$e].forEach(l=>{"envMap"in l&&l!==Pt&&l!==B&&l!==tt&&(l.envMap=r,l.needsUpdate=!0)})}return{night:u,tris:S,setEnv:He,habShellGeo:oe,habShellMat:ge,habShellDepthMat:ee,habShellGeoHi:fe,habShellMatFar:M,habGlassGeo:Ae,habGlassMat:k,habGlassGeoHi:de,habGlassMatFar:A,habFrameGeo:Ue,habFrameMat:w,habFrameDepthMat:J,habFrameGeoFar:Ze,ringPadGeo:z,ringPadGeoFar:p,ringPadMat:B,skirtGeo:Y,skirtMat:Q,bigDome:Mt,shedGeo:j,shedMat:ze,shedDepthMat:we,tubeGeo:Ve,tubeMat:$e,ribGeo:Ye,ribMat:Je}}var co={x:0,y:-6e3,z:0},Zr=.1,Ht={land:[[55,-150],[15,-168]],build:[-25,-100]},Ms=`
float h3(vec3 p){p=fract(p*0.3183099+.1);p*=17.0;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float n3(vec3 x){vec3 i=floor(x);vec3 f=fract(x);f=f*f*(3.0-2.0*f);
return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),
mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n3(p);p*=2.03;a*=.5;}return v;}`;function Ss({THREE:e,renderer:t,scene:a,cam:s,planets:o,sunLight:u,ambient:S,hemi:g,files:L,HIGH:m,lateRockets:O,lodPath:P}){let U=new e.Vector3(co.x,co.y,co.z),f=L.dtmN||512,i=new e.Group;i.position.copy(U),i.visible=!1,a.add(i),u.castShadow=!0;{let de=u.shadow,Ce=de.camera;de.mapSize.set(m?4096:2048,m?2048:1024),de.bias=-5e-4,de.normalBias=.35,Ce.left=-390,Ce.right=390,Ce.near=60,Ce.far=1300}a.fog=new e.Fog(0,1e8,1e9);let F=(()=>{let de=7;return()=>(de=de*16807%2147483647)/2147483647})(),I=new e.Vector3,$=0,K=null,R=null,Me=Promise.all([import("./rockets-NJ46RRYQ.js"),import("./foot-model-starship-NEVPLWKG.js"),import("./foot-model-kit-OAHIXROD.js")]).then(([de,Ce,ve])=>R={createRockets:de.createRockets,foot:{buildStarships:Ce.buildStarships,mergeAll:ve.mergeAll,steel:{STEEL_FLAT:Ce.STEEL_FLAT,steelUniforms:Ce.steelUniforms,steelShader:Ce.steelShader}}}).catch(de=>console.warn("film rockets:",de)),pe={tDtm:{value:null},tHi:{value:null},tCtx:{value:null},uOn:{value:new e.Vector3(0,0,0)},uHB0:{value:0},tMars:o.mars.material.uniforms.tMap},H=o.air&&o.air.uniforms.dome||{uSun:{value:new e.Vector3(0,1,0)},uK:{value:1},uAmb:{value:1},uOrigin:{value:U.clone()}},re=[0,0,0],Ne=500;{let de=(Ce,ve,Fe)=>{let Ue=new e.DataTexture(new Uint8Array([Ce,ve,Fe,255]),1,1);return Ue.needsUpdate=!0,Ue};pe.tDtm.value=de(128,0,0),pe.tHi.value=de(128,128,128),pe.tCtx.value=de(128,128,128)}function me(de){let Ce=new e.WebGLRenderTarget(4,1,{depthBuffer:!1,minFilter:e.NearestFilter,magFilter:e.NearestFilter,generateMipmaps:!1}),ve=new e.ShaderMaterial({uniforms:{tDtm:{value:de}},toneMapped:!1,depthTest:!1,depthWrite:!1,vertexShader:"void main(){ gl_Position=vec4(position.xy,0.,1.); }",fragmentShader:`uniform sampler2D tDtm; void main(){ float k=floor(gl_FragCoord.x); vec2 o=vec2(mod(k,2.),floor(k*.5));
      vec2 uv=(vec2(${f/2-.5})+o)/${f}.; gl_FragColor=texture2D(tDtm,vec2(uv.x*.5+.5,uv.y)); }`}),Fe=new e.Mesh(new e.PlaneGeometry(2,2),ve),Ue=new e.Scene;Fe.frustumCulled=!1,Ue.add(Fe);let Ze=new Uint8Array(16),Re=t.getRenderTarget();t.setRenderTarget(Ce),t.render(Ue,s),t.readRenderTargetPixels(Ce,0,0,4,1,Ze),t.setRenderTarget(Re),Ce.dispose(),ve.dispose(),Fe.geometry.dispose();let je=M=>(Ze[M*4]*256+Ze[M*4+1])/65535;return-2664.712+352.3924*(((je(0)+je(1))/2+(je(2)+je(3))/2)/2)}let De=null;function le(){if(De)return De;let de=t.capabilities.getMaxAnisotropy(),Ce=Fe=>{try{t.initTexture(Fe)}catch{}},ve=(Fe,Ue,Ze)=>new Promise(Re=>{if(!Fe)return Re();bo(e,Fe,{flipY:!0}).then(je=>{Ze(je),Ce(je),re[Ue]=performance.now(),Re()},()=>Re())});return De=Promise.all([ve(L.dtm,0,Fe=>{Fe.colorSpace=e.NoColorSpace,Fe.magFilter=Fe.minFilter=e.NearestFilter,Fe.generateMipmaps=!1,Fe.flipY=!0,pe.tDtm.value=Fe,pe.uHB0.value=me(Fe)}),ve(L.hiBump,1,Fe=>{Fe.colorSpace=e.NoColorSpace,Fe.anisotropy=de,pe.tHi.value=Fe}),ve(L.ctxBump,2,Fe=>{Fe.colorSpace=e.NoColorSpace,Fe.anisotropy=de,pe.tCtx.value=Fe})])}let be=()=>{let de=performance.now(),Ce=ve=>ve?vt(de-ve,0,Ne):0;pe.uOn.value.set(Ce(re[0]),Ce(re[1]),Ce(re[2]))};function*V(){le();let de=`
uniform sampler2D tDtm, tHi, tCtx, tMars; uniform vec3 uOn; uniform float uHB0; // uHB0 = hB(vec2(0.)), read back once after the DTM loads
// 16-bit heights live in R (hi byte) and G (lo byte); filter by hand so the bytes never blend across a carry
float dtmTap(vec2 uv, float side){ vec2 t=vec2(uv.x*.5+side*.5, uv.y); vec4 c=texture2D(tDtm,t); return (c.r*255.*256.+c.g*255.)/65535.; }
float dtmBil(vec2 uv, float side){ vec2 p=uv*${f}.-.5, f=fract(p), i=floor(p);
  float a=dtmTap((i+vec2(.5,.5))/${f}.,side), b=dtmTap((i+vec2(1.5,.5))/${f}.,side), c=dtmTap((i+vec2(.5,1.5))/${f}.,side), d=dtmTap((i+vec2(1.5,1.5))/${f}.,side);
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
`;{let b=m?420:210,ae=b+1,xe=9e3,We=xe/b,Le=new Float32Array(ae*ae*3),at=new Uint32Array(b*b*6);for(let At=0,Vt=0;At<ae;At++){let qe=-xe/2+At*We;for(let Te=0;Te<ae;Te++,Vt+=3)Le[Vt]=-xe/2+Te*We,Le[Vt+2]=qe}for(let At=0,Vt=0;At<b;At++)for(let qe=0;qe<b;qe++,Vt+=6){let Te=qe+ae*At,Nt=Te+ae,Xt=Nt+1,no=Te+1;at[Vt]=Te,at[Vt+1]=Nt,at[Vt+2]=no,at[Vt+3]=Nt,at[Vt+4]=Xt,at[Vt+5]=no}let Lt=new e.BufferGeometry;Lt.setIndex(new e.BufferAttribute(at,1)),Lt.setAttribute("position",new e.BufferAttribute(Le,3)),Lt.boundingSphere=new e.Sphere(new e.Vector3,xe*.7072),Lt.boundingBox=new e.Box3(new e.Vector3(-xe/2,0,-xe/2),new e.Vector3(xe/2,0,xe/2));let Gt=new e.MeshStandardMaterial({roughness:.95,metalness:0});Gt.customProgramCacheKey=()=>"jezeroTerrain",Gt.onBeforeCompile=At=>{Object.assign(At.uniforms,pe),Object.assign(At.uniforms,{uJSun:H.uSun,uJK:H.uK,uJAmb:H.uAmb,uJOrigin:H.uOrigin}),At.vertexShader=Ce+de+`
varying vec3 vTP; varying vec3 vTN;
`+At.vertexShader.replace("#include <beginnormal_vertex>",`vec3 objectNormal; { vec2 p=position.xz; float e=8.;
          objectNormal=normalize(vec3(-(terrH(p+vec2(e,0.))-terrH(p-vec2(e,0.)))/(2.*e),1.,-(terrH(p+vec2(0.,e))-terrH(p-vec2(0.,e)))/(2.*e))); vTN=objectNormal; }
        #ifdef USE_TANGENT
          vec3 objectTangent = vec3( tangent.xyz );
        #endif`).replace("#include <begin_vertex>",`#include <begin_vertex>
transformed.y+=terrH(position.xz)-dot(position.xz,position.xz)/(2.*3389500.); vTP=transformed;`),At.fragmentShader=Ce+de+`
varying vec3 vTP; varying vec3 vTN;
uniform vec3 uJSun, uJOrigin; uniform float uJK, uJAmb;
`+Ms+Ir+`
      // greyscale orbital images -> height for shading only
      float bumpL(vec2 p){ float a=uOn.y*(1.-smoothstep(640.,790.,max(abs(p.x),abs(p.y)))), b=uOn.z*(1.-smoothstep(5000.,5900.,max(abs(p.x),abs(p.y))));
        float hb=texture2D(tCtx,vec2(p.x/12000.+.5,.5-p.y/12000.)).r, ha=texture2D(tHi,vec2(p.x/1600.+.5,.5-p.y/1600.)).r;
        return mix(.5,mix(hb,ha,a),max(a,b)); }
      // fbm with each octave faded to its mean once it nears a pixel (fw = base-octave cycles per pixel): no far shimmer
      float fbmBL(vec3 p, float fw){ float v=0.,a=.5; for(int i=0;i<5;i++){ float k=1.-smoothstep(.3,.6,fw); v+=a*(k>0.? mix(.5,n3(p),k) : .5); p*=2.03; fw*=2.03; a*=.5; } return v; }
      vec3 tA; float tR;
    `+At.fragmentShader.replace("#include <color_fragment>",`#include <color_fragment>
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
          normal=normalize(normal+(viewMatrix*vec4(-gx*k*.1,0.,-gz*k*.1,0.)).xyz); }`)};let Ut=new e.Mesh(Lt,Gt);Ut.receiveShadow=!0,i.add(Ut)}let ve={sunDir:{value:new e.Vector3},night:{value:0}},Fe=new e.Mesh(new e.SphereGeometry(7e3,48,24),new e.ShaderMaterial({side:e.BackSide,depthWrite:!1,fog:!1,uniforms:ve,vertexShader:"varying vec3 vD; void main(){ vD=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }",fragmentShader:`uniform vec3 sunDir; uniform float night; varying vec3 vD; ${Ms}
  void main(){ float e=clamp(vD.y,0.,1.), sd=max(dot(vD,sunDir),0.);
    vec3 dayC=mix(vec3(0.78,0.54,0.36),vec3(0.36,0.22,0.15),pow(e,0.6));
    vec3 duskC=mix(vec3(0.2,0.14,0.13),vec3(0.015,0.015,0.03),pow(e,0.45));
    vec3 c=mix(dayC,duskC,night)+vec3(0.3,0.5,0.9)*pow(sd,22.)*(0.2+night*0.55)+vec3(0.5,0.6,0.8)*pow(sd,160.)*0.6;
    c+=vec3(0.9)*step(0.9975,h3(floor(vD*500.)))*smoothstep(0.5,1.,night)*smoothstep(0.05,0.3,e);
    gl_FragColor=vec4(c,1.); }`}));i.add(Fe),yield;let Ue=[62,132,204],Ze=8,Re=[[0,0,20,.02]],je=[];for(let b=0;b<4;b++){let ae=Math.PI/8+b*Math.PI/2;Re.push([Math.cos(ae)*96,Math.sin(ae)*96,15,.26+b*.08]),je.push(ae)}let ge=(b,ae)=>Math.abs(((b-ae)%(Math.PI*2)+Math.PI*3)%(Math.PI*2)-Math.PI),M=[],h=[];for(let b=34;b<238;b+=14){let ae=b*.11;for(;ae<b*.11+Math.PI*2-.05;){let xe=Math.min(6.6,2.6+F()*3.2+5*Math.exp(-b/70)),We=Math.cos(ae)*b,Le=Math.sin(ae)*b,at=[...Array(Ze)].some((Ut,At)=>ge(ae,At*Math.PI/4)*b<xe+4),Lt=b<86&&je.some(Ut=>ge(ae,Ut)*b<xe+3.5);if(!(at||Lt||Ue.some(Ut=>Math.abs(b-Ut)<xe+3.5)||Re.some(([Ut,At,Vt])=>Math.hypot(We-Ut,Le-At)<Vt+xe+3))&&F()>.1){let Ut=.06+b/238*.58+F()*.08;b>175&&F()<.28?h.push({x:We,z:Le,w:8+F()*4,d:5,h:2.5+F()*2.5,rot:ae,bt:Ut}):M.push({x:We,z:Le,r:xe,ys:.72+F()*.35,rot:F()*6.28,bt:Ut,seed:F()*50})}ae+=(2*xe+2.6)/b}}let k={night:{value:0}},A=ys({THREE:e,renderer:t});yield;let w=ws({THREE:e,renderer:t,envMap:A,frameDetail:"low"});yield,M.forEach(b=>b.col=new e.Color().setHSL(.08,.06+F()*.06,.72+F()*.16)),h.forEach(b=>b.col=new e.Color().setHSL(.07,.08,.55+F()*.15));let ee=(b,ae)=>b.bt-ae.bt,J=[...M].sort(ee),_=[...h].sort(ee);m||J.forEach((b,ae)=>b.skip=ae%2===1),J.forEach(b=>{(Ht.land.some(([ae,xe])=>Math.hypot(b.x-ae,b.z-xe)<b.r+16)||Math.hypot(b.x-Ht.build[0],b.z-Ht.build[1])<b.r+30)&&(b.skip=!0)});let z=J.filter(b=>!b.skip),p=.028,B=P?P():[];z.forEach(b=>{let ae=1/0;for(let xe of B)ae=Math.min(ae,Math.hypot(xe.x-b.x,xe.y,xe.z-b.z));b.near=!B.length||b.r/ae>p});let Y=(b,ae)=>{let xe=Math.max(1,b.length),We=(at,Lt)=>{let Gt=new e.InstancedMesh(at,Lt,xe);return Gt.count=0,Gt},Le={list:b,shell:We(ae?w.habShellGeoHi:w.habShellGeo,ae?w.habShellMat:w.habShellMatFar),glass:We(ae?w.habGlassGeoHi:w.habGlassGeo,ae?w.habGlassMat:w.habGlassMatFar),frame:We(ae?w.habFrameGeo:w.habFrameGeoFar,w.habFrameMat),pad:We(ae?w.ringPadGeo:w.ringPadGeoFar,w.ringPadMat)};return Le.shell.customDepthMaterial=w.habShellDepthMat,Le.glass.receiveShadow=Le.frame.receiveShadow=!0,Le.frame.castShadow=!1,Le.shell.castShadow=Le.shell.receiveShadow=Le.pad.castShadow=Le.pad.receiveShadow=!0,b.forEach((at,Lt)=>Le.shell.setColorAt(Lt,at.col)),Le},Q=[Y(z.filter(b=>b.near),!0),Y(z.filter(b=>!b.near),!1)],j=new e.InstancedMesh(w.skirtGeo,w.skirtMat,z.length),Z=new e.InstancedMesh(w.shedGeo,w.shedMat,h.length);Z.customDepthMaterial=w.shedDepthMat,_.forEach((b,ae)=>Z.setColorAt(ae,b.col));let ye=b=>new e.Sphere(new e.Vector3(0,10,0),b),ze=Q.flatMap(b=>[b.shell,b.glass,b.frame,b.pad]);[...ze,j,Z].forEach(b=>b.boundingSphere=ye(270)),yield,i.add(...ze,j,Z),Z.castShadow=Z.receiveShadow=!0;let we=[],Pe=[],ue=[];Ue.forEach(b=>{let ae=[];for(let xe=0;xe<=200;xe++){let We=xe/200*Math.PI*2;if(ae.push(new e.Vector3(Math.cos(We)*b,.4,Math.sin(We)*b)),xe%2===0)for(let Le of[-2.6,2.6])we.push(Math.cos(We)*(b+Le),1.6,Math.sin(We)*(b+Le)),Pe.push(.04+b/236*.55+xe/200*.08)}ue.push([ae,.02+b/236*.55])});for(let b=0;b<Ze;b++){let ae=b*Math.PI/4,xe=[new e.Vector3(Math.cos(ae)*20,.4,Math.sin(ae)*20),new e.Vector3(Math.cos(ae)*250,.4,Math.sin(ae)*250)];ue.push([xe,0]);for(let We=24;We<250;We+=4)for(let Le of[-3,3])we.push(Math.cos(ae)*We+Math.cos(ae+1.5708)*Le,1.6,Math.sin(ae)*We+Math.sin(ae+1.5708)*Le),Pe.push(.02+We/250*.62)}let Ee=ue.map(([b,ae])=>{let xe=new e.Line(new e.BufferGeometry().setFromPoints(b),new e.LineBasicMaterial({color:16756848,transparent:!0,opacity:0}));return xe.userData.bt=ae,i.add(xe),xe}),_e={g:{value:0},night:{value:0},t:{value:0}},rt=(b,ae)=>new e.ShaderMaterial({transparent:!0,depthWrite:!1,blending:e.AdditiveBlending,uniforms:_e,vertexShader:b,fragmentShader:ae}),yt="varying vec3 vC; varying float vA; void main(){ float d=length(gl_PointCoord-.5); gl_FragColor=vec4(vC*vA*smoothstep(.5,.05,d)*2.4,1.); }";{let b=new e.BufferGeometry;b.setAttribute("position",new e.Float32BufferAttribute(we,3)),b.setAttribute("bt",new e.Float32BufferAttribute(Pe,1)),i.add(new e.Points(b,rt("attribute float bt; uniform float g; uniform float night; varying vec3 vC; varying float vA; void main(){ vec4 mv=modelViewMatrix*vec4(position,1.); vC=vec3(1.,0.66,0.3); vA=smoothstep(bt,bt+0.025,g)*(0.15+0.85*night); gl_PointSize=clamp(520./-mv.z,1.2,6.); gl_Position=projectionMatrix*mv; }",yt)))}{let b=[],ae=[];M.filter(We=>We.r>5).forEach(We=>{let Le=F();We.skip||(b.push(We.x,We.r*We.ys+.6,We.z),ae.push(We.bt+.16,Le))});let xe=new e.BufferGeometry;xe.setAttribute("position",new e.Float32BufferAttribute(b,3)),xe.setAttribute("bs",new e.Float32BufferAttribute(ae,2)),i.add(new e.Points(xe,rt("attribute vec2 bs; uniform float g; uniform float t; uniform float night; varying vec3 vC; varying float vA; void main(){ vec4 mv=modelViewMatrix*vec4(position,1.); vC=vec3(1.,0.12,0.06); vA=step(bs.x,g)*step(0.55,fract(t*0.7+bs.y))*(0.3+0.7*night)*1.6; gl_PointSize=clamp(900./-mv.z,2.,9.); gl_Position=projectionMatrix*mv; }",yt)))}let kt=new e.SphereGeometry(1,32,14,0,Math.PI*2,0,Math.PI/2),mt=Re.map(([b,ae,xe,We])=>{let Le=w.bigDome();return Le.position.set(b,0,ae),Le.scale.setScalar(xe),i.add(Le),{g:Le,lattice:Le.getObjectByName("lattice"),glass:Le.getObjectByName("glass"),glow:Le.getObjectByName("glow"),bt:We}}),tt=je.map((b,ae)=>{let xe=new e.Group;xe.position.set(Math.cos(b)*19,2.6,Math.sin(b)*19),xe.rotation.y=-b;let We=new e.Mesh(w.ribGeo,w.ribMat);return We.castShadow=We.receiveShadow=!0,xe.add(new e.Mesh(w.tubeGeo,w.tubeMat),We),i.add(xe),{g:xe,bt:.12+ae*.07}}),Pt=[];for(let b=262;b<345;b+=4.2)for(let ae=.25;ae<1.35;ae+=3.2/b)Pt.push({x:Math.cos(ae)*b,z:Math.sin(ae)*b,bt:.22+(b-262)/83*.22+(ae-.25)*.12});Pt.sort(ee);let Mt=new e.InstancedMesh(new e.BoxGeometry(3,.1,2.2).translate(0,1.2,0),new e.MeshStandardMaterial({color:1451068,metalness:.85,roughness:.22,emissive:330260}),Pt.length);Mt.castShadow=Mt.receiveShadow=!0,Mt.boundingSphere=ye(360),i.add(Mt),yield;let he=new e.MeshStandardMaterial({color:15770458,emissive:3807744,roughness:.6}),Ve=M.filter(b=>b.r>4.2&&!b.skip),$e=Ve.filter((b,ae)=>ae%Math.max(1,Math.floor(Ve.length/20))===3).slice(0,20).map((b,ae)=>{let xe=new e.Group;xe.position.set(b.x+b.r+2,0,b.z+2);let We=Math.max(22,b.r*b.ys+16),Le=new e.Mesh(new e.BoxGeometry(1,We,1).translate(0,We/2,0),he),at=new e.Group;return at.position.y=We,at.add(new e.Mesh(new e.BoxGeometry(30,.8,.8).translate(8,0,0),he),new e.Mesh(new e.BoxGeometry(3,2.2,2).translate(-6,-.8,0),he),new e.Mesh(new e.BoxGeometry(.08,10,.08).translate(18,-5,0),he)),xe.add(Le,at),xe.traverse(Lt=>{Lt.isMesh&&(Lt.castShadow=!0)}),i.add(xe),{g:xe,jib:at,bt:b.bt,ph:ae*1.7}}),Ye=null,Je=(b=!0)=>Ye=R.createRockets({THREE:e,foot:R.foot,colony:i,envMap:A,high:m,sites:Ht,light:b});yield,R?Je():Me.then(()=>{R&&(Je(!1),O(Ye))}),yield;let He=Fn({THREE:e,colony:i,layout:xs({high:m,rockets:!0}),envMap:A,high:m,arrive:Zr,hideLines:Ee,solar:Mt}),r=-1,l=new e.Matrix4,C=new e.Quaternion,x=new e.Vector3(0,1,0),d=new e.Vector3,q=new e.Vector3,v=new e.Quaternion,T=new e.Color,te=new e.Color(.78,.54,.36),G=new e.Color(.2,.14,.13),E=new e.Quaternion().setFromEuler(new e.Euler(0,0,.5)),ke=(b,ae)=>{let xe=0;for(;xe<b.length&&b[xe].bt<ae;)xe++;return xe},ot=e.MathUtils.degToRad(.1),Ge=new e.Color(16773596),Oe=new e.Color(1,.66,.42),N=new e.Vector3,ne=new e.Vector3,ce=new e.Vector3,ct=new e.Vector3,Ft=new e.Vector3,Rt=1;function Wt(){let b=Ye&&Ye.launch,ae=b?b.light.k:0;N.copy(I),ae>.001&&(Ft.copy(b.light.pos),Ft.y=Math.max(Ft.y,4),N.lerp(Ft.normalize(),vt(ae,0,1))),N.y=Math.max(N.y,.035),N.normalize();let xe=Math.round(Math.asin(N.y)/ot)*ot,We=Math.round(Math.atan2(N.x,N.z)/ot)*ot;if(N.set(Math.cos(xe)*Math.sin(We),Math.sin(xe),Math.cos(xe)*Math.cos(We)),u.color.copy(Ge).lerp(Oe,ae),u.intensity=e.MathUtils.lerp(Rt,.28*(b?b.light.i:0),ae),N.equals(ne))return!1;ne.copy(N);let Le=u.shadow.camera,at=390*Math.max(N.y,.06)+80;return Le.top!==at&&(Le.top=at,Le.bottom=-at,Le.updateProjectionMatrix()),Ya(u,U,N,600,ce,ct),!0}function jt(b,ae,xe=b){be();let We=Math.min(b,1),Le=Math.max(0,(We-Zr)/(1-Zr)),at=$=vt(Le,.35,.95),Lt=e.MathUtils.lerp(.34,-.05,vt(Le,.05,1));Fe.visible=!1,I.set(-Math.cos(Lt),Math.sin(Lt),-Math.cos(Lt)*.22).normalize(),ve.sunDir.value.copy(I),ve.night.value=at,_e.g.value=Le,_e.night.value=at,_e.t.value=ae,k.night.value=at,w.night.value=at,a.fog.color.copy(T.copy(te).lerp(G,at)),a.fog.near=500,a.fog.far=4200,Rt=e.MathUtils.lerp(2.2,.1,at),S.intensity=e.MathUtils.lerp(.5,.1,at),g.intensity=e.MathUtils.lerp(1.5,.12,at),g.color.copy(T),o.air&&o.air.hemi&&o.air.hemi(g.color),w.tubeMat.emissiveIntensity=at*.35,Ye&&Ye.update(xe,ae,at),He.update(Le,ae,at,We);for(let qe=0;qe<$e.length;qe++){let Te=$e[qe];Te.jib.rotation.y=Te.ph+Le*46+ae*.15}let Gt=Wt();if(Math.abs(We-r)<1e-4)return Gt;r=We;for(let qe=0;qe<Q.length;qe++){let Te=Q[qe],Nt=Te.list,Xt=ke(Nt,Le),no=ke(Nt,Le-.02),fo=ke(Nt,Le-.07);for(let se=0;se<Xt;se++){let ie=Nt[se],Xe=ao((Le-ie.bt)/.03),ut=ao((Le-ie.bt-.02)/.06),et=ao((Le-ie.bt-.07)/.08);C.setFromAxisAngle(x,ie.rot),l.compose(d.set(ie.x,0,ie.z),C,q.set(ie.r,Xe,ie.r)),Te.pad.setMatrixAt(se,l),se<no&&(l.compose(d.set(ie.x,.45,ie.z),C,q.set(ie.r*1.015,ie.r*ie.ys*ut*1.015,ie.r*1.015)),Te.frame.setMatrixAt(se,l)),se<fo&&(l.compose(d.set(ie.x,.45,ie.z),C,q.set(ie.r,ie.r*ie.ys*et,ie.r)),Te.shell.setMatrixAt(se,l),Te.glass.setMatrixAt(se,l))}Te.pad.count=Xt,Te.frame.count=no,Te.shell.count=Te.glass.count=fo,Te.shell.instanceMatrix.needsUpdate=Te.glass.instanceMatrix.needsUpdate=Te.frame.instanceMatrix.needsUpdate=Te.pad.instanceMatrix.needsUpdate=!0}let Ut=ke(z,Le);for(let qe=0;qe<Ut;qe++){let Te=z[qe];C.setFromAxisAngle(x,Te.rot),l.compose(d.set(Te.x,0,Te.z),C,q.set(Te.r,ao((Le-Te.bt)/.03),Te.r)),j.setMatrixAt(qe,l)}j.count=Ut;let At=ke(_,Le-.04);for(let qe=0;qe<At;qe++){let Te=_[qe],Nt=ao((Le-Te.bt-.04)/.07);C.setFromAxisAngle(x,-Te.rot),l.compose(d.set(Te.x,0,Te.z),C,q.set(Te.w,Te.h*Nt,Te.d)),Z.setMatrixAt(qe,l)}Z.count=At,j.instanceMatrix.needsUpdate=Z.instanceMatrix.needsUpdate=!0;let Vt=ke(Pt,Le);for(let qe=0;qe<Vt;qe++){let Te=Pt[qe],Nt=ao((Le-Te.bt)/.04);l.compose(d.set(Te.x,0,Te.z),E,q.set(1,Nt,1)),Mt.setMatrixAt(qe,l)}return Mt.count=Vt,Mt.instanceMatrix.needsUpdate=!0,Ee.forEach(qe=>qe.material.opacity=vt(Le,qe.userData.bt,qe.userData.bt+.06)*(.15+.85*at)),mt.forEach(qe=>{let Te=ao((Le-qe.bt)/.1),Nt=vt(Le,qe.bt+.1,qe.bt+.18);qe.lattice.scale.set(1,Math.max(.001,Te),1),qe.g.visible=Te>0,qe.glass.material.opacity=Nt*.28,qe.glow.material.opacity=Nt*at*.28}),tt.forEach(qe=>{let Te=ao((Le-qe.bt)/.08);qe.g.scale.set(Math.max(.001,Te*62),1,1),qe.g.visible=Te>0}),$e.forEach(qe=>{let Te=Math.min(ao((Le-qe.bt+.08)/.04),1-ao((Le-qe.bt-.2)/.04));qe.g.scale.set(1,Math.max(.001,Te),1),qe.g.visible=Te>.01}),!0}K={build:jt,cranes:$e,get rockets(){return Ye}}}let oe=null;function Ae(){return K?!0:(oe=oe||V(),oe.next().done)}function fe(){for(;!Ae(););}return{group:i,step:Ae,ensure:fe,loadMaps:le,rockReady:Me,get api(){return K},get sun(){return I},get night(){return $},get done(){return!!K}}}var Jr={grade:{exposure:-.7,contrast:1.08,saturation:.96,warmth:.12,tint:.01,lift:.005,gamma:.98,gain:1.11},lens:{bloomStrength:.89,bloomThreshold:1.26,vignette:.61,grain:.084},beats:{austin:{exposure:.11,warmth:.62},space:{exposure:1.1,warmth:-.53},marsOrbit:{exposure:.76,warmth:.09},colony:{exposure:.45,warmth:.69}}};var _r=[{pr:.75,post:0,trails:!1,shadow:1024,every:3,keep:.4},{pr:1,post:1,trails:!1,shadow:2048,every:2,keep:.6},{pr:1,post:2,trails:!0,shadow:2048,every:1,keep:1},{pr:1,post:3,trails:!0,shadow:4096,every:1,keep:1},{pr:1.25,post:3,trails:!0,shadow:4096,every:1,keep:1},{pr:1.5,post:3,trails:!0,shadow:4096,every:1,keep:1}],As=_r.length-1,Cs=14,Al=9,Rr=20,Cl=250,uo=40,Dl=1500,zl=4e3,Pl=15e3,Ll=6e4,kl=600,Ds=33;function zs({high:e=!0,top:t=null,start:a=null,apply:s,hold:o=()=>!1,holdUp:u=()=>!1,capOK:S=()=>!1,gpu:g=()=>null}={}){let m=(typeof location<"u"?new URLSearchParams(location.search):new URLSearchParams).get("perf"),O=m==="log"||Va,P=m==="off"||An,U=/^[0-5]$/.test(m||"")?+m:null,f=t!=null?Math.max(0,Math.min(As,t)):e?As:2,i=U??(a!=null?Math.max(0,Math.min(f,a)):f),F=f,I=0,$=0,K=0,R=0,Me=-1e9,pe=0,H=-1,re=new Float32Array(uo),Ne=new Float32Array(uo),me=0,De=0,le=0,be=0,V=0,oe={level:i,ceil:F,p90:0,med:0,steps:0,gpu:null,capped:!1,coarse:!1},Ae=(...M)=>{O&&console.log("[film perf]",...M)},fe=new Float32Array(8),de=0,Ce=0,ve=0,Fe=-1e9,Ue=!1;function Ze(M){if(ve++,M<2&&(Fe=ve),Ue=ve-Fe<120,!Ue)return de=0,M;if(fe[Ce]=M,Ce=Ce+1&7,de<8&&de++,de<8)return null;let h=0,k=1e9;for(let A=0;A<8;A++)h+=fe[A],fe[A]>=2&&fe[A]<k&&(k=fe[A]);return k>=50?null:h/8}function Re(M,h){M=Math.max(0,Math.min(F,M)),M!==i&&(M<i&&I-Me<Pl&&(F=i-1,pe=I,Me=-1e9,Ae("ceiling",F)),M>i&&(Me=I),i=M,K=I+Dl,R=0,me=0,De=0,le=0,be=0,oe.steps++,Ae("level",M,h,"gpu",oe.gpu,"med",oe.med,"coarse",oe.coarse),je(h))}function je(M=""){H!==i&&(H=i,oe.level=i,oe.ceil=F,s(_r[i],i,/^(emergency|sustained|pinned|start)/.test(M)))}function ge(M){if(H<0&&je("start"),P||U!=null)return;if(I+=Math.min(M,100),M>Cl){$=I,++V>=8&&i>0&&(V=0,Re(i-1,"sustained stalls"));return}if(V=0,I-$<kl||(M=Ze(M),M==null))return;if(me===uo){let J=re[De];J>Rr&&le--,J>Ds&&be--}else me++;if(re[De]=M,De=(De+1)%uo,M>Rr&&le++,M>Ds&&be++,me<uo)return;Ne.set(re),Ne.sort();let h=Ne[Math.floor(uo*.9)],k=Ne[Math.floor(uo*.1)];oe.p90=+h.toFixed(1),oe.med=+Ne[uo>>1].toFixed(1),oe.coarse=Ue;let A=S()&&k>25&&h-k<3;oe.capped=A;let w=g(),ee=w!=null&&isFinite(w);if(oe.gpu=ee?+w.toFixed(1):null,A&&!ee&&i<=f-1){R=0;return}if(be>uo*.6&&i>0&&(!ee||w>Cs)){Re(i-1,"emergency p90 "+h.toFixed(1));return}if(F<f&&I-pe>Ll&&(F=f,oe.ceil=F,Ae("ceiling lifted")),!(I<K||o())){if(ee?w>Cs:h>Rr||le>uo*.12){Re(i-1,"p90 "+h.toFixed(1)+" misses "+le+" gpu "+oe.gpu+" capped "+A);return}i<F&&(ee?w<Al&&(A||le===0&&h<17.6):le===0&&h<17.6)&&!u()?R?I-R>zl&&Re(i+1,"headroom p90 "+h.toFixed(1)):R=I:R=0}}return{frame:ge,LADDER:_r,get level(){return i},get ceil(){return F},get state(){return oe},pin(M){M!=null&&(F=f,Re(Math.max(0,Math.min(f,M)),"pinned"))},reset(){me=0,De=0,le=0,be=0,$=I}}}var Fl=.14,Ol=.175,Hr=48/157.5,_o=[.04,.12,.32,.4],Ps=.3,Ao=1.12,Ls=.03,ks=.4,Bl=.6,Fs=-.02,Vl=[[-1,-.9],[-.3,-.1],[.43,.49]],Os=(e,t,a,s,o)=>gt(gt(gt(e.austin[t],e.space[t],a),e.marsOrbit[t],s),e.colony[t],o);function p0({THREE:e,host:t,section:a,scenes:s,sol:o,quality:u,files:S}){let g=u==="high",L=new URLSearchParams(location.search).get("touch"),m=!g&&(L?L==="1":matchMedia("(pointer: coarse)").matches),O=[.75,1,1.25,1.5,1.75,2],P=Math.min(g?1.5:m?2:1,Cn),U=new e.WebGLRenderer({antialias:!1,powerPreference:"high-performance"});U.setPixelRatio(Math.min(devicePixelRatio,P));let f=Math.max(1,t.clientWidth),i=Math.max(1,t.clientHeight);U.setSize(f,i,!1),U.toneMapping=e.ACESFilmicToneMapping,U.toneMappingExposure=1.05,U.shadowMap.enabled=!0,U.shadowMap.type=e.PCFSoftShadowMap,U.shadowMap.autoUpdate=!1;let F=U.domElement;Object.assign(F.style,{position:"absolute",inset:"0",width:"100%",height:"100%",display:"block"}),t.insertBefore(F,t.firstChild);let I=new e.Scene;I.background=new e.Color(65795);let $=new e.PerspectiveCamera(42,f/i,.1,9e3),K=Kn({THREE:e,renderer:U,scene:I,cam:$,low:!g}),{bloom:R}=K,Me=JSON.parse(JSON.stringify(Jr)),pe=!1,H=()=>{let n=Dt==="colony"&&_.api&&_.api.rockets;return n?n.launch.exp:0},re=()=>{let n=_.api.cranes;for(let c=0;c<n.length;c++)if(n[c].g.visible)return!0;return!1};function Ne(){let n=Me.grade,c=Me.lens,y=Me.beats,D=Vl,W=K.look,X=K.grade;if(W&&(W.bloom=c.bloomStrength,W.threshold=c.bloomThreshold,W.vignette=c.vignette,W.grain=c.grain),!X)return;let Se=vt(Qe,D[0][0],D[0][1]),ft=vt(Qe,D[1][0],D[1][1]),Ke=vt(Qe,D[2][0],D[2][1]),st=n.warmth+Os(y,"warmth",Se,ft,Ke),lt=n.tint;if(X.expK=2**(n.exposure+Os(y,"exposure",Se,ft,Ke)-.55*H()),st===0&&lt===0)X.wr=X.wg=X.wb=1;else{let dt=2**(.25*st),ht=2**(-.2*lt),xt=2**(-.25*st),Ie=1/(.2126*dt+.7152*ht+.0722*xt);X.wr=dt*Ie,X.wg=ht*Ie,X.wb=xt*Ie}X.contrast=n.contrast,X.saturation=n.saturation,X.lift=n.lift,X.gamma=n.gamma,X.gain=n.gain}let me=!0,De=1,le=(()=>{let n=U.getContext(),c=n&&n.createQuery&&n.getExtension("EXT_disjoint_timer_query_webgl2"),y=new Float32Array(30),D=new Float32Array(30),W=[],X=[],Se=0,ft=0,Ke=null,st=null,lt=!c,dt=()=>{Se=0,ft=0,st=null},ht=Ie=>{try{n.deleteQuery(Ie)}catch{}};function xt(){if(!lt)try{for(;W.length&&n.getQueryParameter(W[0],n.QUERY_RESULT_AVAILABLE);){let Ie=W.shift();if(n.getParameter(c.GPU_DISJOINT_EXT)){ht(Ie);for(let Ct of W)ht(Ct);W.length=0,dt();break}let it=n.getQueryParameter(Ie,n.QUERY_RESULT)/1e6;X.push(Ie),it>=0&&it<1e3&&(y[ft]=it,ft=(ft+1)%30,Se<30&&Se++,st=null)}}catch{lt=!0,dt()}}return{poll:xt,begin(){if(!(lt||Ke||W.length>=4))try{let Ie=X.pop()||n.createQuery();n.beginQuery(c.TIME_ELAPSED_EXT,Ie),Ke=Ie}catch{lt=!0}},end(){if(Ke){try{n.endQuery(c.TIME_ELAPSED_EXT),W.push(Ke)}catch{lt=!0}Ke=null}},get p90(){return lt||Se<20?null:(st==null&&(D.set(y),st=D.subarray(0,Se).sort()[Math.floor(Se*.9)]),st)},reset(){dt()},dispose(){for(let Ie of[...W,...X,Ke])Ie&&ht(Ie);W.length=X.length=0,Ke=null,lt=!0}}})(),be=zs({high:g,top:m?O.length-1:null,start:Dr&&g?3:null,hold:()=>Qe>Jt&&Qe<.52,holdUp:()=>Lo,capOK:()=>!Dr,gpu:()=>le.p90,apply:(n,c,y)=>{me=n.trails,Ca=n.every,De=n.keep;let D=_.api&&_.api.rockets;D&&D.setKeep&&D.setKeep(De),oe=null;let W=Math.min(devicePixelRatio||1,P,m?O[c]:n.pr),X=Math.min(g?n.post:Math.min(n.post,1),zr??3),Se=g?n.shadow:Math.min(n.shadow,2048);if((U.getPixelRatio()!==W||K.getQuality()!==X||w.shadow.mapSize.x!==Se)&&!y&&!ve()){oe={q:n,lv:c},Ae=performance.now(),fe=0;return}V(n,c,W,X,Se)}});function V(n,c,y,D,W){U.getPixelRatio()!==y&&(U.setPixelRatio(y),K.setSize(f,i),K.resetMotion()),K.setQuality(D),K.setDofHalf(g&&c<5),le.reset();let X=w.shadow;X.mapSize.x!==W&&(X.mapSize.set(W,W/2),X.map&&(X.map.dispose(),X.map=null),Do=!0)}let oe=null,Ae=0,fe=0,de=-1,Ce=0,ve=()=>performance.now()-Ce>300||Qe>Jt&&Qe<.52;function Fe(n){fe=n>.04?fe+n*1e3:0;let c=performance.now();if(ve()||fe>=1e3||c-Ae>3e3){let y=oe;oe=null,V(y.q,y.lv,Math.min(devicePixelRatio||1,P,m?O[y.lv]:y.q.pr),Math.min(g?y.q.post:Math.min(y.q.post,1),zr??3),g?y.q.shadow:Math.min(y.q.shadow,2048))}}(R.separableBlurMaterials||[]).forEach(n=>{let c=n.uniforms.gaussianCoefficients?.value;if(!c)return;let y=c.length,D=y/2.6;for(let W=0;W<y;W++)c[W]=.39894*Math.exp(-.5*W*W/(D*D))/D});let Ue=gs({THREE:e}),{toSun:Ze,EARTH:Re,MARS:je,C0:ge,L0:M}=Ue,h=Rn({THREE:e,scene:I,renderer:U,toSun:Ze,EARTH:Re,MOON:Ue.moonAt(-1,new e.Vector3),MARS:je,files:S.tex});h.moon.material.uniforms.uRelief.value=.35,h.mars.material.uniforms.uRelief.value=.4;let k=null,A=Yn({THREE:e,scene:I,starsUrl:S.stars,milkyUrl:S.milky,milkyWayIntensity:.14}).then(n=>{k=n}).catch(()=>{}),w=new e.DirectionalLight(16773596,2.4);w.position.copy(Ze).multiplyScalar(100);let ee=new e.AmbientLight(2240580,.35),J=new e.HemisphereLight(16763030,5909012,1.4);J.intensity=0,I.add(w,w.target,ee,J);let _=Ss({THREE:e,renderer:U,scene:I,cam:$,planets:h,sunLight:w,ambient:ee,hemi:J,files:S.jezero,HIGH:g,lateRockets:n=>la("colony",()=>ia(n.group)),lodPath:()=>{let n=[];for(let c=0;c<=48;c++){let y=new e.Vector3,D=.6+(Ao-.6)*c/48;r.getPoint(x(D),y),at(D,y,!0),n.push(y.sub(p))}return n}}),z=_.group,p=new e.Vector3(co.x,co.y,co.z),B=n=>{let c=document.createElement("canvas");c.width=c.height=256;let y=c.getContext("2d"),D=y.createRadialGradient(128,128,0,128,128,128);return n.forEach(([W,X])=>D.addColorStop(W,X)),y.fillStyle=D,y.fillRect(0,0,256,256),new e.CanvasTexture(c)},Y=new e.Sprite(new e.SpriteMaterial({map:B([[0,"rgba(255,255,255,1)"],[.12,"rgba(255,236,200,0.9)"],[.35,"rgba(255,170,80,0.25)"],[1,"rgba(0,0,0,0)"]]),color:16777215,blending:e.AdditiveBlending,depthWrite:!1,transparent:!0,fog:!1}));I.add(Y);let Q=()=>K.resetMotion(),j=new e.Vector3(0,4e4,0),Z=ds({THREE:e,scene:I,renderer:U,sunLight:w,hemi:J,ORIGIN:j,earthU:h.earth.material.uniforms,ortho:S.ortho}),ye=ps({THREE:e,parent:Z.group,high:g}),ze=.012,we=10/6371e3,Pe=e.MathUtils.degToRad(ya.lat),ue=(ya.lon+180)/360,Ee=new e.Vector3(-Math.cos(2*Math.PI*ue)*Math.cos(Pe),Math.sin(Pe),Math.sin(2*Math.PI*ue)*Math.cos(Pe)),_e=Math.atan2(Ee.z,Ee.x)-Math.atan2(ge.z,ge.x),rt=Ee.clone().applyAxisAngle(new e.Vector3(0,1,0),_e).multiplyScalar(10),yt=rt.clone().normalize(),kt=Ue.spaceCam,mt=_n({THREE:e,SITE_ROT:or,AUS:rt,U_PER_M:we,C0:ge,L0:M,spaceCam:kt}),tt={pos:new e.Vector3,look:new e.Vector3,up:new e.Vector3},Pt=mt.LAMH,Mt=mt.LAM1,he={},Ve={pos:new e.Vector3,look:new e.Vector3,up:new e.Vector3},$e=(n,c)=>{let y=Math.log(n),D=mt.k.yA,W=mt.k.yH;for(let X=0;X<50;X++){let Se=(D+W)/2;mt.at(Se,Ve),Ve.lam<y?D=Se:W=Se}return mt.at((D+W)/2,c)},Ye=[15,0,-135],Je=(n,c,y)=>[Ye[0]+n*Math.sin(c*Math.PI/180),y,Ye[2]+n*Math.cos(c*Math.PI/180)],He=[[ro,[2200,2600,900],[-3200,0,-200],50],[.52,[1400,1500,700],[-1400,0,-300],48],[.57,[750,700,550],[-250,0,-250],46],[.62,Je(600,28,260),[15,30,-135],42],[.72,Je(500,32,190),[15,34,-135],40],[.8,Je(420,24,130),[10,38,-130],40],[.88,Je(350,15,80),[-5,44,-125],42],[1,Je(450,13,85),[-15,52,-118],45],[1.12,Je(600,14,115),[-20,60,-115],50]].map(([n,c,y,D])=>({p:n,pos:new e.Vector3(...c).add(p),look:new e.Vector3(...y).add(p),fov:D})),r=new e.CatmullRomCurve3(He.map(n=>n.pos),!1,"centripetal"),l=new e.CatmullRomCurve3(He.map(n=>n.look),!1,"centripetal"),C=He.map(n=>n.p),x=Tr(r,C,void 0,0),d=Tr(l,C,void 0,0),q=vo(C,He.map(n=>n.fov),void 0,0),v=(()=>{let n=vo([.49,.62,.88,.9,1.12],[0,.1,.8,.83,1]);return c=>c<=.49?0:c>=1.12?1:zt(n(c))})(),T=.83,te=new e.Vector3,G=new e.Vector3,E=new e.Vector3(Ht.build[0],0,Ht.build[1]).add(p),ke=new e.Vector3;function ot(n,c){let y=_.api&&_.api.rockets,D=y&&y.launch;if(D&&D.pos)return c.copy(D.pos);let W=Math.max(0,n-T),X=4800*W*W*(1+4*W),Se=25e-5*X*X;return c.set(Ht.build[0]-.952*Se,26+X,Ht.build[1]-.305*Se).add(p)}let Ge=n=>Math.asin(e.MathUtils.clamp(n.y/Math.max(1e-6,n.length()),-1,1)),Oe=n=>Math.atan2(Math.sin(n),Math.cos(n));function N(n,c,y,D){let W=Math.min(Math.max(n,ro),Ao);r.getPoint(x(W),c),l.getPoint(d(W),y);let X=Yr(W,q(W),$.aspect),Se=vt(D,T+.002,T+.045);if(Se>0){let ft=e.MathUtils.degToRad(X/2),Ke=te.copy(y).sub(c),st=Ke.length();ot(D,G).sub(c);let lt=Ge(Ke),dt=Ge(G),ht=Ge(ke.copy(E).sub(c)),xt=.3+1.1*vt(Po,0,ks*.6),Ie=gt(lt,Math.min(Math.max(lt,dt-.5*ft),ht+xt*ft),Se),it=Math.atan2(Ke.x,Ke.z),Ct=it+Oe(Math.atan2(G.x,G.z)-it)*.55*Se;y.set(Math.cos(Ie)*Math.sin(Ct),Math.sin(Ie),Math.cos(Ie)*Math.cos(Ct)).multiplyScalar(st).add(c)}return X}let ne=document.querySelector("[data-foot-canvas]")||document.querySelector("[data-foot]"),ce=[.86,Ao],ct=[.98,Ao],Ft=[.86,.95],Rt=[1,Ao],Wt=.5,jt=-.3,b=ne?(()=>{let n=Pr(0,0),c=Pr(Ht.build[0],Ht.build[1]),y=Math.atan2(c[1]-n[1],c[0]-n[0])-Math.atan2(Ht.build[1],Ht.build[0]),D=Math.cos(y),W=Math.sin(y),X=-On(n[0],n[1]),Se=(dt,ht,xt,Ie)=>{let it=dt-n[0],Ct=xt-n[1];return Ie.set(it*D+Ct*W,ht+X,-it*W+Ct*D).add(p)},ft=Lr(16,9),Ke={toCol:Se,eye:Se(...ft.eye,new e.Vector3),look:new e.Vector3,q:new e.Quaternion,c:0,e:1,ok:!1},st=Math.sin(ft.sunAz),lt=-Math.cos(ft.sunAz);return Ke.sunAz=Math.atan2(-st*W+lt*D,st*D+lt*W),Ke.rE=Math.hypot(Ke.eye.x-p.x,Ke.eye.z-p.z),Ke.aE=Math.atan2(Ke.eye.z-p.z,Ke.eye.x-p.x),Ke})():null,ae=(n,c,y=!1)=>b&&(y||b.ok)?na(n,c[0],c[1]):0,xe=new e.Matrix4,We=new e.Vector3(0,1,0);function Le(){if(!b)return;let n=ne.clientWidth,c=ne.clientHeight;if(b.ok=n>0&&c>0,!b.ok)return;let y=Lr(n,c),D=Math.tan(y.vfov*Math.PI/360);b.toCol(...y.look,b.look),xe.lookAt(b.eye,b.look,We),b.q.setFromRotationMatrix(xe),b.e=2*D*i/c,b.c=D+b.e/2}function at(n,c,y=!1){let D=ae(n,ce,y);if(D<=0)return c;let W=c.x-p.x,X=c.z-p.z,Se=Math.atan2(X,W),ft=gt(Math.hypot(W,X),b.rE,D),Ke=Se+Oe(b.aE-Se)*D;return c.set(p.x+ft*Math.cos(Ke),gt(c.y,b.eye.y,ae(n,ct,y)),p.z+ft*Math.sin(Ke))}let Lt=new e.Quaternion,Gt=new e.Vector3;function Ut(n,c){let y=ae(n,Ft),D=ae(n,Rt);at(n,bt),$.position.copy(bt);let W=2*Math.tan(c*Math.PI/360),X=gt(gt(-Qr(n,$.aspect)*W,0,y),b.c,D),Se=W**(1-D)*b.e**D;ot(so,Gt).sub(bt);let ft=Ge(Gt)-Math.atan(X-Se/2+Wt*Se),Ke=Math.atan2(Gt.x,Gt.z);Gt.set(Math.cos(ft)*Math.sin(Ke),Math.sin(ft),Math.cos(ft)*Math.cos(Ke)).add(bt),xe.lookAt(bt,Gt,We),Lt.setFromRotationMatrix(xe),$.quaternion.slerp(Lt,y).slerp(b.q,D),Vt(X,Se),ra(e.MathUtils.clamp((bt.y-co.y)*.08,.1,30),9e3)}function At(n){let c=ae(n,ce);if(c<=0)return;let y=_.sun,D=gt(Math.asin(e.MathUtils.clamp(y.y,-1,1)),jt,ae(n,Rt)),W=Math.atan2(y.z,y.x),X=W+Oe(b.sunAz-W)*c;y.set(Math.cos(D)*Math.cos(X),Math.sin(D),Math.cos(D)*Math.sin(X))}function Vt(n,c){let y=Math.abs(n)+c/2,D=2*y/c,W=f*D,X=i*D;$.fov=2*Math.atan(y)*180/Math.PI,$.setViewOffset(W,X,(W-f)/2,(y-n-c/2)*i/c,f,i),Oo=!0}let qe=new e.Vector3(-.78,.42,.46).normalize(),Te=new e.Vector3,Nt=new e.Quaternion,Xt=new e.Mesh(new e.PlaneGeometry(30,30),new e.ShaderMaterial({uniforms:{uR:{value:6},uL2:{value:new e.Vector2(qe.x,qe.y).normalize()},uI:{value:1.5}},vertexShader:"varying vec2 vQ; void main(){ vQ = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }",fragmentShader:`uniform float uR, uI; uniform vec2 uL2; varying vec2 vQ;
    void main(){ float q = length(vQ), d = max(q / uR - 1., 0.); vec2 dir = vQ / max(q, 1e-4);
      float side = smoothstep(-0.6, 1., dot(dir, uL2));
      // a thin dusty atmosphere hugging the limb (Mars' dust haze tops out ~1% of its radius up), much stronger on the lit side:
      // a narrow warm rim, not a soft disc. The inner term sits over the geometric edge so the limb never reads as a cut-out
      float g = exp(-d * 120.) * 0.75 + exp(-d * 34.) * 0.16 + exp(-d * 9.) * 0.012;
      float edge = 1. - smoothstep(11., 15., max(abs(vQ.x), abs(vQ.y))); // fade before the plane's edge: its square never shows on black
      gl_FragColor = vec4(vec3(1.0, 0.56, 0.28) * g * side * side * uI * edge, 0.); }`,transparent:!0,depthWrite:!1,blending:e.CustomBlending,blendSrc:e.OneFactor,blendDst:e.OneFactor}));{let n=h.marsAtmo.material.uniforms;n.uBetaR.value.multiplyScalar(.25),n.uSunCol.value.set(1,.86,.66),n.uK.value=15}Xt.position.copy(je),Xt.renderOrder=3,Xt.frustumCulled=!1,I.add(Xt);function no(n,c){Ue.marsQ(n,h.mars.quaternion),Te.copy(qe).applyQuaternion($.quaternion),h.marsAtmo.material.uniforms.uSun.value.copy(Te),Nt.copy(h.mars.quaternion).invert(),h.mars.material.uniforms.uSun.value.copy(Te).applyQuaternion(Nt);let y=$.position.distanceTo(ie);Xt.quaternion.copy($.quaternion),Xt.material.uniforms.uR.value=6/Math.sqrt(Math.max(.05,1-36/(y*y)))}let fo={uPx:{value:1},uI:{value:0}},se=new e.Points(new e.BufferGeometry().setAttribute("position",new e.BufferAttribute(new Float32Array(3),3)),new e.ShaderMaterial({uniforms:fo,vertexShader:"uniform float uPx; void main(){ gl_PointSize = uPx; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }",fragmentShader:`uniform float uI; void main(){ vec2 q = gl_PointCoord * 2. - 1.; float r2 = dot(q, q); if (r2 > 1.) discard;
      gl_FragColor = vec4(vec3(1.0, 0.52, 0.3) * (exp(-r2 * 10.) + exp(-r2 * 3.) * 0.1) * uI, 1.); }`,transparent:!0,depthWrite:!1,blending:e.AdditiveBlending}));se.frustumCulled=!1,se.renderOrder=1,I.add(se);let ie=je.clone(),Xe=[h.mars,h.marsAtmo,Xt];function ut(n,c){let y=c?Ue.marsFar(n):1;ie.copy(je).sub($.position).multiplyScalar(y).add($.position),h.mars.position.copy(ie),h.marsAtmo.position.copy(ie),h.marsAtmo.material.uniforms.uCenter.value.copy(ie),Xt.position.copy(ie),se.position.copy(ie);let D=6/ie.distanceTo($.position)*i/2/Math.tan($.fov*Math.PI/360),W=c?1-vt(D,1.2,4):0;for(let X of Xe)X.visible=c&&D>.9;return se.visible=W>.001,fo.uI.value=5*W,fo.uPx.value=9*U.getPixelRatio(),D}let et=[h.earth,h.clouds,h.moon,h.mars,h.earthAtmo,h.marsAtmo,Xt,se],Ot=[h.earth,h.clouds,h.moon,h.earthAtmo],Be=null,pt=n=>n.getBoundingClientRect();function Yt(){f=Math.max(1,t.clientWidth),i=Math.max(1,t.clientHeight);let n=pt(a),c=i,y={};for(let Ie in s){if(!s[Ie])continue;let it=pt(s[Ie]),Ct=s[Ie].firstElementChild,oo=Ct?pt(Ct):it;y[Ie]={top:it.top-n.top,h:it.height,tc:(oo.top+oo.bottom)/2-n.top}}let D=(Ie,it=0)=>y[Ie].tc-c/2+it*c,W=(Ie,it)=>y[Ie].top+it*y[Ie].h-c/2,X=Math.max(1,n.height-c),Se=f<768&&i>f?-.12:0,ft=1.9,Ke=(D("title",0)-D("earth",Se))/c,st=Math.min(1,Ke/ft),lt=st**.6,dt=Math.max(0,Math.min(Math.sqrt(st),(Ke-.5*lt-.15*st)/.7)),ht=[[D("earth",Se-.6),-1],[D("earth",Se),-.9],[D("earth",Se+.7*dt),-.64],[D("title",-.5*lt),-.15],[D("title",0),0],[D("reind",0),.26],[W("colony",0),.62],[W("colony",1),.9],[X,Ao]];for(let Ie=1;Ie<ht.length;Ie++)ht[Ie][0]<=ht[Ie-1][0]+1&&(ht[Ie][0]=ht[Ie-1][0]+1);Be={vh:c,yEnd:X,S:Ka(ht),sc:y};{let Ie=ht[0][0],it=X;for(let Ct=0;Ct<50;Ct++){let oo=(Ie+it)/2;Be.S(oo)<Fs?Ie=oo:it=oo}Be.ySol=(Ie+it)/2}Ue.layout({S:Be.S,yE:ht[0][0],y1:X,vh:c});let xt=[y.austin.top-c,D("austin",0),D("austin",.5),ht[0][0]];for(let Ie=xt.length-2;Ie>=0;Ie--)xt[Ie]>=xt[Ie+1]-1&&(xt[Ie]=xt[Ie+1]-Math.max(1,.25*c));mt.layout({yA:xt[0],yT:xt[1],yX:xt[2],yE:xt[3],S:Be.S}),ye.layout($e,f/i),po(),Bs(),Qt(),Le()}function Qt(){let n=a.nextElementSibling;for(;n&&(n.offsetHeight===0||getComputedStyle(n).display==="none");)n=n.nextElementSibling;let c=D=>{let W=D&&getComputedStyle(D).backgroundColor.match(/[\d.]+/g);return W&&(W.length<4||+W[3]>.5)?W:null},y=null;for(let D=n,W=0;D&&!y&&W<3;D=D.firstElementChild,W++)y=c(D);for(let D=a.parentElement;D&&!y;D=D.parentElement)y=c(D);y=y||[0,0,0],ho.el=n,ho.col[0]=y[0]/255,ho.col[1]=y[1]/255,ho.col[2]=y[2]/255}let St=null,$t=()=>f<768?24:40;function po(){St=null;let n=s.title,c=n&&n.querySelector('[data-split="left"]'),y=n&&n.querySelector('[data-split="right"]');if(!c||!y)return;let D=c.parentElement;c.style.transform=y.style.transform="";let W=pt(D),X=pt(c),Se=pt(y),ft=Math.abs((X.top+X.bottom)/2-(Se.top+Se.bottom)/2)<X.height*.5,Ke=f>=768,st=(Ke?Ol:Fl)*i;if(ft){let lt=Se.left-X.right,dt;if(Ke){dt=Math.max(.05*i,Math.min(st,lt/2/(1+Hr)));let ht=Math.max(0,lt/2-dt*(1+Hr));c.style.transform=`translate3d(${ht}px,0,0)`,y.style.transform=`translate3d(${-ht}px,0,0)`}else dt=Math.max(.05*i,Math.min(st,(lt/2-$t())/1.08));St={Ls:c,Rs:y,h2:D,x:(X.right+Se.left)/2-W.left,y:(X.top+X.bottom+Se.top+Se.bottom)/4-W.top,r:dt}}else{let lt=Math.min(st,.4*f),dt=Ke?lt*(1+Hr):lt*1.08+$t(),ht=Se.top-X.bottom,xt=Ke?dt-ht/2:Math.max(0,dt-ht/2);c.style.transform=`translate3d(0,${-xt}px,0)`,y.style.transform=`translate3d(0,${xt}px,0)`,St={Ls:c,Rs:y,h2:D,x:((X.left+X.right)/2+(Se.left+Se.right)/2)/2-W.left,y:(X.bottom+Se.top)/2-W.top,r:lt}}}let eo=null;function Bs(){eo=null;let n=s.reind&&s.reind.firstElementChild;if(!n)return;let c=document.createRange();c.selectNodeContents(n);let y=0;for(let Se of c.getClientRects())Se.width>1&&(y=Math.max(y,Se.right));let D=pt(t),W=f-(y-D.left),X=Math.min(.21*i,.4*f);if(f>=768&&W>2.2*X){let Se=Math.min(X,(W/2-24)/1.08);eo={x:y-D.left+W/2,y:i/2,r:Se}}else{let Se=pt(n).height,ft=i<500?12:24,Ke=i/2-Se/2-24-.04*i,st=St?St.r*(1+Ps*_o[1]):0,lt=Math.max(.05*i,Math.min(X,.16*i,Ke/2.38),Math.min(st,(f>=768?.2:.16)*i));eo={x:f/2,y:Math.max(1.12*lt,Math.min(.3*i,i/2-Se/2-ft-1.19*lt)),r:lt}}}let It=0,nr=0,Qe=-1,Co=0,Dt="site",Go="",Nl=!1,Ho=!0,Sa=!1,Vs=!1,Eo=0,Aa=0,$o=0,sr=null,Er=0,ir=0,Do=!0,$r=!1,zo=!1,Po=0,ea=0,ta=0,so=0,Ca=1,Lo=!1,oa=null,Ns=3,Us=3,ho={k:0,col:[0,0,0],el:null},lr=new e.Vector3,cr=new e.Vector3,en=new e.Vector3,Da={x:0,y:0},io={x:0,y:0},Is=.05,ur=new URLSearchParams(location.search).get("touch"),za=matchMedia("(pointer: coarse)"),fr={on:ur?ur==="1":za.matches},ko=0,tn=()=>{ur||(fr.on=za.matches,ko=0)};za.addEventListener?.("change",tn);let on=n=>{Da.x=n.clientX/innerWidth-.5,Da.y=n.clientY/innerHeight-.5};addEventListener("mousemove",on,{passive:!0});let bt=new e.Vector3,Et=new e.Vector3,to=new e.Vector3,Gs=new e.Vector3,Pa=new e.Vector3,aa=new e.Vector3(0,1,0),Fo=new e.Vector3,Ts=new e.Color(16773596),ra=(n,c)=>{($.near!==n||$.far!==c)&&($.near=n,$.far=c,$.updateProjectionMatrix())},La={g:0,t:0},To={lam:0,t:0,sinE:1,proj:1,pr:1},hr={t:0,intro:1,camPos:bt,spin:0,hole:yt},go={dt:0,t:0,focus:0,aperture:0,maxblur:0,ca:0},Ws=new e.Vector3,ka={k:0,mb:0};function dr(n){let c=w.shadow.camera;w.shadow.normalBias=n?.1:.35,n?(c.left=-160,c.right=160,c.top=80,c.bottom=-80,c.near=50,c.far=900,ee.intensity=.03):(c.left=-390,c.right=390,c.near=60,c.far=1300,w.color.copy(Ts)),c.updateProjectionMatrix()}let Oo=!1,na=(n,c,y)=>Kt(zt((n-c)/(y-c)));function js(n,c){let y=n&&St?na(Qe,-.15,-.02)*(1-na(Qe,.04,.12)):0,D=n&&eo?na(Qe,_o[0],_o[1])*(1-na(Qe,_o[2],_o[3])):0,W=()=>{c?($.setViewOffset(f,i,0,c*i,f,i),Oo=!0):Oo&&(Oo=!1,$.clearViewOffset())};if(y<=0&&D<=0)return W();let X=Math.tan($.fov*Math.PI/360);$.updateMatrixWorld(),Fo.copy(je).applyMatrix4($.matrixWorldInverse);let Se=Fo.length();if(Fo.z>-6.2||Se<6.2)return W();let ft=Fo.x/-Fo.z/(X*$.aspect),Ke=Fo.y/-Fo.z/X,st=f/2+ft*f/2,lt=i/2-Ke*i/2,dt=Math.tan(Math.asin(6.05/Se))/X*i/2,ht=st,xt=lt-c*i,Ie=1+Ps*Qe;if(y>0&&D>0){let it=Math.min(1,y+D),Ct=D/(y+D),oo=pt(St.h2),Ba=pt(t);dt=gt(dt,gt(St.r,eo.r,Ct)*Ie,it),ht=gt(ht,gt(oo.left-Ba.left+St.x,eo.x,Ct),it),xt=gt(xt,gt(i/2,eo.y,Ct),it)}else{if(f<992&&D>0&&Qe>_o[2]){let it=eo.r*Ie,Ct=dt-it;dt=.5*(dt+it+Math.sqrt(Ct*Ct+.01*it*it*D))}if(y>0){let it=pt(St.h2),Ct=pt(t);dt=gt(dt,St.r*Ie,y),ht=gt(ht,it.left-Ct.left+St.x,y),xt=gt(xt,i/2,y)}D>0&&(dt=gt(dt,eo.r*Ie,D),ht=gt(ht,eo.x,D),xt=gt(xt,eo.y,D))}{let it=Math.max(6.6/Se,6.05/Math.sin(Math.atan(dt*2*X/i))/Se);bt.sub(je).multiplyScalar(it).add(je),$.position.sub(je).multiplyScalar(it).add(je),$.updateMatrixWorld()}$.setViewOffset(f,i,-(ht-st),-(xt-lt),f,i),Oo=!0}let mo={inCol:!1,cam:$,t:0,dt:0,alt:0,fog:I.fog,e:0};function qs(n,c,y){let D=zt((Qe-Jt)/(wa-Jt));mo.inCol=n,mo.sunDir=_.sun,mo.night=_.night,mo.t=c,mo.dt=y,mo.e=D,mo.fog=I.fog,mo.alt=n?$.position.y-co.y:$.position.distanceTo(je),h.entry(D,mo)}let mr=[0,0],sa={entry:-1,gR:-1,plume:null};function Xs(n){let c=n&&_.api&&_.api.rockets,y=c&&c.launch,D=n?so:-1;sa.entry=Qe>Jt&&Qe<wa?(Qe-Jt)/(wa-Jt):-1,sa.gR=D,sa.plume=null,y&&y.base&&D>=.78&&(Pa.copy(y.base).project($),Pa.z<1&&(mr[0]=Pa.x*.5+.5,mr[1]=Pa.y*.5+.5,sa.plume=mr)),K.lensFrame(sa);let W=y&&y.fx,X=K.fx;W&&X&&(W.flash>X.flash&&(X.flash=W.flash),W.heat>X.heat&&(X.heat=W.heat),W.bloom>X.bloom&&(X.bloom=W.bloom))}let an="",rn="",nn=o&&o.root&&+o.root.dataset.solFrom||1,Ks=o&&o.root&&+o.root.dataset.solTo||206;function Ys(){if(!o||!o.root)return;let n=vt(Qe,.4,.43)*(1-vt(Qe,.57,.61)),c=vt(It,Be.yEnd,Be.yEnd+.25*Be.vh),y=vt(Qe,Fs,.06)*(1-n)*(1-c),D=y.toFixed(3);D!==rn&&(rn=D,o.root.style.opacity=D,o.root.style.visibility=y>.005?"":"hidden");let W=zt((It-Be.ySol)/Math.max(1,Be.yEnd-1-Be.ySol)),X=String(nn+Math.floor((Ks-nn)*W+1e-6)).padStart(4,"0");X!==an&&o.value&&(an=X,o.value.textContent=X)}let sn=-1,ln="",vr={p:0,beat:""},Qs=new CustomEvent("tf:film",{detail:vr}),cn=()=>Qe<-.55?Co<1?"austin":"earth":Qe<.12?"mars-title":Qe<.42?"reindustrialize":Qe<.88?"colony":"launch";function Zs(n){Be||Yt();let c=$o,y=-pt(a).top;if(Ho||Math.abs(y-It)>2*Be.vh)It=y,nr=0,ko=0,Ho=!1,Q();else{let nt=It;if(fr.on){let wt=2/Is,Tt=wt*n,lo=1/(1+Tt+.48*Tt*Tt+.235*Tt*Tt*Tt),ca=It-y,ua=(ko+wt*ca)*n;ko=(ko-wt*ua)*lo,It=y+(ca+ua)*lo,Math.abs(It-y)<.5&&Math.abs(ko)<20&&(It=y,ko=0)}else window.lenis?It=y:It+=(y-It)*(1-Math.exp(-n/.05));nr=n>0?(It-nt)/n:0}io.x+=(Da.x-io.x)*n*2,io.y+=(Da.y-io.y)*n*2,mt.at(It,tt),Co=tt.s,Qe=Math.min(Ao,Math.max(-1,Be.S(It))),Co<1&&(Qe=-1);let D=Co<1,W=tt.lam;Dt=D?tt.world:Qe>=ro?"colony":"space";{let nt=It>=Be.yEnd-2,wt=nt?Ls:Po>0?-2.5*Ls:0;ea+=(wt-ea)*(1-Math.exp(-n/Bl)),Po=Math.min(ks,Math.max(0,Po+ea*n)),Po<=0&&ea<0&&(ea=0),ta=v(Qe),so=ta+Po*vt(ta,.95,1)}ho.k=vt(It-Be.yEnd,-.3*Be.vh,0),Co>.6&&h.loadDeferred("moon"),Qe>-.9&&h.loadDeferred("mars"),Dt==="colony"?_.ensure():Qe>.3&&fn();let X=Dt==="colony",Se=Dt==="site",ft=D?0:vt(Qe,-1,-.92),Ke=46,st=30;if(aa.set(0,1,0),Se){let nt=tt.dist,wt=1-tt.upk;to.copy(tt.pos),to.x+=io.x*3*wt,to.z+=io.y*2*wt,bt.copy(to).add(j),Et.copy(tt.look).add(j),aa.copy(tt.up),Ke=tt.fov,st=nt,Er=nt,ra(Math.max(.3,nt*.004),nt*8+3e3),La.g=tt.g,La.hour=tt.hour,La.t=c,sr=Z.update(La);{let lo=U.getPixelRatio();To.lam=W,To.t=c,To.sinE=sr.sinE,To.pr=lo,To.proj=i*lo/(2*Math.tan(e.MathUtils.degToRad(Ke)/2)),ye.update(To)}Z.follow(to,nt),I.fog.near=1e8,I.fog.far=1e9,J.intensity*=1-vt(W,Math.log(3e3),Math.log(6e4));let Tt=sr.night;K.trails.enabled=g&&me&&Tt>.02,K.trails.amount=.65*Tt}else if(Dt==="globe")bt.copy(tt.pos),Et.copy(tt.look),Ke=tt.fov,st=tt.dist*we,ra(Math.min(.1,Math.max(5e-4,st*.04)),9e3);else if(X){Ke=N(Qe,bt,Et,so),bt.x+=io.x*8*ft,bt.y-=io.y*5*ft,st=bt.distanceTo(Et);let nt=_.api&&_.api.rockets&&_.api.rockets.launch;if(nt&&nt.burn>.004){st=gt(st,bt.distanceTo(nt.pos),vt(so,T,T+.03));let wt=nt.shake*bt.distanceTo(Et)*.0022;if(wt>1e-4){lr.copy(Et).sub(bt).normalize(),cr.crossVectors(lr,aa).normalize(),en.crossVectors(cr,lr);let Tt=Math.sin(c*31)*.6+Math.sin(c*57+1.7)*.4,lo=Math.sin(c*37+.6)*.6+Math.sin(c*71+2.9)*.4;Et.addScaledVector(cr,Tt*wt).addScaledVector(en,lo*wt)}}ra(e.MathUtils.clamp((bt.y-co.y)*.08,.1,30),9e3)}else Ke=kt(Qe,bt,Et,aa),Ke=Yr(Qe,Ke,$.aspect),st=gt(bt.distanceTo(rt),bt.distanceTo(Et),vt(Qe,-1,-.92)),ra(.1,12e3);Se||(K.trails.enabled=!1);{let nt=D?vt(W,Math.log(450),Math.log(3600))*(1-vt(W,14,15.9)):0;K.motion.shutter=.6+2.4*nt,K.motion.maxLen=.035+.11*nt}if(K.auto.enabled=!D,D?(U.toneMappingExposure=Hn(Ra(tt.hour,he).sinE,W),K.snapExposure()):(U.toneMappingExposure=1.05,K.auto.min=.55),Dt!==Go){Z.group.visible=Se,z.visible=X;let nt=!Se&&!X;et.forEach(wt=>wt.visible=nt),dr(Se),K.motion.cutDist=Dt==="site"||Dt==="globe"?1e12:400,K.ao.enabled=Se&&g,(Go==="site"&&Dt==="globe"||Go==="")&&K.resetMotion(),Go=Dt,Do=!0,U.compile(pr,$,I)}if(Dt==="space"){let nt=Qe>-.12;for(let wt of Ot)wt.visible=!nt}let lt=X?_.sun:Ze,dt=X&&_.api.build(ta,c,so);if(X&&At(Qe),X){let nt=_.api.rockets;nt&&nt.setKeep&&nt.keep!==De&&(nt.keep=De,nt.setKeep(De))}if(Dt!=="site"&&Dt!=="globe"&&qs(X,c,n),!X&&!Se&&(I.fog.near=1e8,I.fog.far=1e9,w.intensity=2.4,ee.intensity=.35,J.intensity=0),ir++,Se)(Do||w.intensity>.01&&(Er<2500||ir%10===0))&&(U.shadowMap.needsUpdate=!0,Do=!1);else if(X){let nt=Lo?Math.max(Ca,Us):Ca,wt=!dt&&re(),Tt=wt?Math.max(nt,Ns):nt;(Do||(dt||wt)&&ir%Tt===0||!Lo&&dt)&&(U.shadowMap.needsUpdate=!0,Do=!1)}else w.target.position.set(0,0,0),w.position.copy(lt).multiplyScalar(100);let ht=bt.distanceTo(Et);D||(to.set(Math.sin(c*.21)*.6+Math.sin(c*.53+1.3)*.25,Math.sin(c*.17+2.1)*.5+Math.sin(c*.41)*.2,Math.sin(c*.13+4)*.4).multiplyScalar(ht*.002*ft),Dt==="space"&&(to.x+=io.x*2.2*ft,to.y-=io.y*1.4*ft,Ue.drift(Qe,bt,to)),bt.add(to)),$.up.copy(aa),Math.abs($.fov-Ke)>5e-4&&($.fov=Ke,$.updateProjectionMatrix()),$.position.copy(bt),$.lookAt(Et),X&&ae(Qe,ce)>0?(Ut(Qe,Ke),st=gt(st,bt.distanceTo(ot(so,Gs)),ae(Qe,ce))):js(Dt==="space",Dt==="globe"||Dt==="site"?0:Qr(Qe,$.aspect)),!Se&&!X&&ut(Qe,Dt==="space"),hr.t=c,hr.spin=_e-c*ze+(D?0:(Qe+1)*.5),h.update(hr),(Dt==="space"||Dt==="globe")&&Qe<-.12&&h.moon.position.copy(Ue.moonAt(Qe,Ws)),Dt==="space"&&no(c,Qe),h.mars.material.uniforms.uDomes.value=1-vt(bt.distanceTo(je),14,30),k&&(k.update(bt),k.group.visible=!X&&!Se);let xt=Dt==="globe"?zt((W-Pt)/(Mt-Pt)):1;Y.visible=!Se,Y.position.copy(bt).addScaledVector(lt,1600);let Ie=Math.max(0,to.copy(Et).sub(bt).normalize().dot(lt)),it=vt(xt,.55,1)*(.25+Ie*.9)*(X?.22*(1-vt(_.sun.y,.02,-.04)):0);Y.scale.setScalar(260*it+40),Y.material.opacity=Math.min(1,it*1.3),R.strength=.6+it*.3;{let nt=1-vt(st,2,4),wt=D?0:vt(Qe,-1,-.92),Tt=X?1:vt(Qe,Jt,ro),lo=X?vt(so,T-.01,T+.03):0,ca=gt(gt(4e-4,.003+.017*nt,wt),gt(.006,.0022,lo),Tt),ua=gt(gt(8e-4,.0018+.0032*nt,wt),gt(.0042,.0024,lo),Tt);go.dt=n,go.t=c,go.focus=st,go.aperture=ca/st,go.maxblur=g?ua:0,go.ca=.012,ka.k=ca,ka.mb=ua}if(Xs(X),Se&&s.austin&&s.austin.firstElementChild){let nt=pt(s.austin.firstElementChild),wt=pt(t),Tt=nt.bottom>wt.top&&nt.top<wt.bottom;K.scrim(((nt.left+nt.right)/2-wt.left)/f,1-((nt.top+nt.bottom)/2-wt.top)/i,.66*nt.width/f+.05,.8*nt.height/i+.07,Tt?.45*(1-tt.upk):0)}else K.scrim(.5,.5,1,1,0);Ne();let Ct=X?ae(Qe,ce):0;K.edge(ho.k,oa||ho.col,gt(Math.max(.3,160/i),Math.max(.15,120/i),Ct),X?(oa?.42:.3)*ho.k*vt(so,T,T+.05)*(1-Ct):0),K.update(go),Ys(),K.render();let oo=zt(It/Be.yEnd),Ba=Math.round(oo*1e4),Cr=cn();(Ba!==sn||Cr!==ln)&&(sn=Ba,ln=Cr,vr.p=oo,vr.beat=Cr,window.dispatchEvent(Qs))}let Bo=window.requestIdleCallback?(n,c=700)=>requestIdleCallback(n,{timeout:c}):n=>setTimeout(n,120),Wo=300,un=!1;function fn(){if(un||_.done)return;un=!0;let n=c=>{if(!zo){if(c&&!c.didTimeout&&c.timeRemaining&&c.timeRemaining()<8)return Bo(n,Wo);_.step()?Bo(Es,Wo):Bo(n,Wo)}};Bo(n,Wo)}function Js(){zo||(h.loadDeferred("mars"),_.loadMaps(),fn(),g&&(hn=Z.addShrouds({next:()=>new Promise(n=>Bo(n,Wo)),alive:()=>!zo}).catch(n=>(console.warn("TerraFirma film: no shroud.",n),null))))}let hn=null,Rs=new e.WebGLRenderTarget(4,4,{type:e.HalfFloatType}),dn=n=>new Promise(c=>setTimeout(c,n)),_s=U.extensions.has("KHR_parallel_shader_compile"),pr=new e.Object3D,ia=n=>{let c=n.parent,y=c?c.children.indexOf(n):-1;y>=0&&c.children.splice(y,1);try{if(_s)return U.compileAsync(n,$,I);let D=performance.now();return U.compile(n,$,I),Va&&console.log("[film warm] blocking compile",n.name||n.type,(performance.now()-D).toFixed(0)+" ms"),Promise.resolve()}finally{y>=0&&c.children.splice(y,0,n)}},Fa=()=>[...et,Y,...k?[k.group]:[],...h.entryRoots()];function la(n,c){let y=[Z.group,z,...Fa()],D=y.map(X=>X.visible),W=U.getRenderTarget();Z.group.visible=n==="site",z.visible=n==="colony";for(let X of Fa())X.visible=n==="space";U.setRenderTarget(Rs);try{return c()}finally{y.forEach((X,Se)=>X.visible=D[Se]),U.setRenderTarget(W),U.compile(pr,$,I)}}function gr(n){let c=[],y=Go;la(n,()=>{n==="colony"&&_.api.build(0,0);for(let D of n==="site"?[Z.group]:n==="colony"?[z,...h.entryRoots()]:Fa())D.traverse(W=>{c.push([W,W.visible,W.frustumCulled]),W.visible=!0,W.frustumCulled=!1});try{dr(n==="site"),U.compile(pr,$,I),U.shadowMap.needsUpdate=n!=="space",U.render(I,$)}finally{for(let[D,W,X]of c)D.visible=W,D.frustumCulled=X}}),y&&dr(y==="site"),Do=!0}async function Hs(){let n=[];await A,la("site",()=>n.push(ia(Z.group))),la("space",()=>{for(let c of Fa())n.push(ia(c))}),await Promise.race([Promise.all(n),dn(1500)]),gr("site"),gr("space"),K.warm({fx:g})}async function Es(){if(zo)return;let n;la("colony",()=>{_.api.build(0,0);let c=[];for(let y of[z,...h.entryRoots()])y.traverse(D=>{c.push([D,D.visible]),D.visible=!0});try{n=Promise.all([ia(z),...h.entryRoots().map(ia)])}finally{for(let[y,D]of c)y.visible=D}}),await Promise.race([n,dn(1500)]),await new Promise(c=>Bo(c,Wo)),!zo&&Go!=="colony"&&gr("colony")}let $s=Promise.all([h.ready,Z.ready,A]).then(()=>Hs()).then(()=>{$r=!0,Bo(Js)}),jo=null;function mn(){f=Math.max(1,t.clientWidth),i=Math.max(1,t.clientHeight),U.setSize(f,i,!1),K.setSize(f,i),$.aspect=f/i,$.updateProjectionMatrix(),Be=null,Oo&&(Oo=!1,$.clearViewOffset()),be.reset()}jo=new ResizeObserver(()=>{mn()}),jo.observe(t),jo.observe(a),ne&&jo.observe(ne),document.fonts?.ready.then(()=>{Be=null});let xr=()=>{Be=null};addEventListener("load",xr);let vn=new URLSearchParams(location.search),pn=vn.get("fps"),gn=pn==null?-1:Math.max(0,+pn||0),br=Math.max(0,+vn.get("idle")||0),xn=new Float32Array(31),bn=new Float32Array(31),Oa=0,yr=0,ei=0,wr=0,xo=0,yn=-1,Mr=0,Sr=0;function wn(n,c){n>0&&n<.1&&(xn[ei++%31]=n,++wr>=30&&wr%15===0&&(bn.set(xn),xo=bn.sort()[15]));let y=scrollY;y!==yn&&(yn=y,Mr=c);let D=br&&c-Mr>400?br:0,W=gn>=0?gn:xo>0&&1/xo>=110?1/(2*xo):0;return D&&(!W||D<W)&&(W=D),W&&xo>0?Math.max(1,Math.round(1/(xo*W))):1}function Mn(n){if(!(!Sa||!$r||zo)){n=Math.max(0,n||0);{let c=scrollY;c!==de&&(de=c,Ce=performance.now())}if(!Lo&&!Ho){let c=performance.now(),y=wn(n,c);if(Oa+=n,yr++,++Sr<y)return;Sr=0,n=Oa,Oa=0,yr=0,pe||($o+=Math.min(n,1/15)),br&&c-Mr>400||be.frame(n*1e3)}else Oa=0,yr=0,Sr=0,pe||($o+=Math.min(n,1/15)),be.frame(n*1e3/(Lo?2:1));oe&&Fe(n),le.poll(),le.begin();try{Zs(Math.min(.05,n))}finally{le.end()}}}let Ar=null,Sn=n=>{if(Eo=requestAnimationFrame(Sn),Ar){Ar();return}let c=Aa?(n-Aa)/1e3:1/60;Aa=n,Mn(c)};return{ready:$s,canvas:F,renderer:U,post:K,scene:I,cam:$,aircraft:ye,flight:Ue,perf:be,get shrouds(){return hn},start(n=!1,c=null){Sa||(Sa=!0,Vs=n,Ar=c,Ho=!0,Aa=0,n||(Eo=requestAnimationFrame(Sn)))},stop(){Sa=!1,Eo&&(cancelAnimationFrame(Eo),Eo=0)},step:Mn,resize:mn,relayout:xr,setOverlap(n){Lo=!!n},setSeam(n){oa=n&&n.length>=3?n:null},snap(){Ho=!0},get pace(){return{hz:xo?+(1/xo).toFixed(1):0,every:Math.max(1,wr<30?1:wn(0,performance.now()))}},tune:Me,look:Jr,get freeze(){return pe},set freeze(n){pe=!!n},yOfClock(n){Be||Yt();let c=mt.k;return n<=-1?gt(c.yA,c.yE,zt(n+2)):this.yOf(Math.min(n,Ao))},setClock(n){$o=n},yOf(n){Be||Yt();let c=0,y=Be.yEnd;for(let D=0;D<50;D++){let W=(c+y)/2;Be.S(W)<n?c=W:y=W}return(c+y)/2},get state(){return{y:It,v:nr,t:$o,s:Co,S:Qe,mode:Dt,beat:cn(),colonyDone:_.done,programs:U.info.programs.length,layout:Be&&{yEnd:Be.yEnd,vh:Be.vh},touch:fr.on,yT:Be?-pt(a).top:0,dof:{k:ka.k,maxblur:ka.mb,focus:go.focus},g:+ta.toFixed(4),gL:+so.toFixed(4),over:+Po.toFixed(4),edge:+ho.k.toFixed(3),end:+ae(Qe,ce).toFixed(4),overlap:Lo,seam:oa&&oa.map(n=>+n.toFixed(3)),perf:{level:be.level,ceil:be.ceil,p90:be.state.p90,gpu:be.state.gpu,capped:be.state.capped,steps:be.state.steps,pr:U.getPixelRatio(),post:K.getQuality(),shadow:w.shadow.mapSize.x,every:Ca,keep:De},mars:{star:se.visible?+fo.uI.value.toFixed(3):0,disc:h.mars.visible},site:Co<1?{hour:+tt.hour.toFixed(2),g:+tt.g.toFixed(3),dist:Math.round(tt.dist),world:tt.world,exp:+U.toneMappingExposure.toFixed(3)}:null}},dispose(){zo=!0,this.stop(),jo&&jo.disconnect(),removeEventListener("mousemove",on),za.removeEventListener?.("change",tn),removeEventListener("load",xr);for(let n of["Ls","Rs"])St&&St[n]&&(St[n].style.transform="");ye.dispose(),I.traverse(n=>{n.geometry&&n.geometry.dispose()}),le.dispose(),U.dispose(),F.remove()}}}export{p0 as createFilm};
