// planets.js: physically motivated Earth / Moon / Mars for the TerraFirma film.
// createPlanets({ THREE, scene, renderer, toSun, EARTH, MOON, MARS, files })
//   -> { earth, moon, mars, clouds, earthAtmo, marsAtmo, ready, loadDeferred, update({ t, intro, camPos }) }
// ready: Earth maps decoded + uploaded. loadDeferred('moon'|'mars'): idempotent, fetches that body's maps, resolves when swapped in
import { createMarsAir } from './sky.js';
// All shaders output LINEAR HDR (the composer's OutputPass does ACES + sRGB). Colour maps are sRGB textures,
// so the GPU decodes them to linear on sampling. No per-frame allocations.

// ---------------------------------------------------------------------------------------------
// shared GLSL
// ---------------------------------------------------------------------------------------------
const GLSL_COMMON = /* glsl */ `
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
`;

const PLANET_VERT = /* glsl */ `
varying vec3 vP; varying vec2 vUv; varying vec3 vV;
void main(){
  vP = position; vUv = uv;
  mat3 M = mat3(modelMatrix); vec4 w = modelMatrix * vec4(position, 1.);
  vV = transpose(M) * (cameraPosition - w.xyz);           // view vector in object space (meshes only rotate)
  gl_Position = projectionMatrix * viewMatrix * w;
}`;

// ---------------------------------------------------------------------------------------------
// Earth surface
// ---------------------------------------------------------------------------------------------
const EARTH_FRAG = /* glsl */ `
uniform sampler2D tMap, tSpec, tNorm, tLights, tClouds;
uniform vec3 uSun; uniform float uGrow, uCloudOff, uCloudH, uSunI;
varying vec3 vP; varying vec2 vUv; varying vec3 vV;
${GLSL_COMMON}
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
}`;

// ---------------------------------------------------------------------------------------------
// Earth cloud deck
// ---------------------------------------------------------------------------------------------
const CLOUD_FRAG = /* glsl */ `
uniform sampler2D tClouds; uniform vec3 uSun; uniform float uSunI; uniform sampler2D tLights; uniform vec4 uHole;
varying vec3 vP; varying vec2 vUv; varying vec3 vV;
${GLSL_COMMON}
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
}`;

// ---------------------------------------------------------------------------------------------
// Moon: albedo map, Lommel-Seeliger/Lambert mix, crater relief normal map
// ---------------------------------------------------------------------------------------------
const MOON_FRAG = /* glsl */ `
uniform sampler2D tMap, tNorm; uniform vec3 uSun; uniform float uSunI, uAlbedo, uRelief;
varying vec3 vP; varying vec2 vUv; varying vec3 vV;
${GLSL_COMMON}
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
}`;

// ---------------------------------------------------------------------------------------------
// Mars surface
// ---------------------------------------------------------------------------------------------
// Mars hero: front-left key light on the full disc (a camera-space light, see film.js), real shaded relief from the colour map, plus
// - analytic silhouette: the mesh is 1.5% oversize, every pixel ray-casts the true sphere and the limb gets exact pixel coverage
//   (alpha), so the edge never stair-steps or shimmers at any size
// - albedo: map local contrast (unsharp against a blurred mip) + sub-texel regolith detail faded by footprint (no shimmer)
// - polar caps: the map's white cap kept cool and bright (the warm grade no longer turns it orange), edge broken by noise
// - terminator: crisp but soft (a few degrees of penumbra + dust twilight), not the wide feather
// - limb: thin dust haze over the disc toward the edge, brighter on the lit side, meets the atmosphere shell
const MARS_CINE_FRAG = /* glsl */ `
uniform sampler2D tMap, tNorm; uniform vec3 uSun; uniform float uSunI, uRelief, uDomes, uBump, uR;
varying vec3 vP; varying vec2 vUv; varying vec3 vV;
${GLSL_COMMON}
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
}`;

// Phobos (cine): tiny dark potato for scale and parallax. Lit by the same key light as Mars (copied in onBeforeRender).
const PHOBOS_VERT = /* glsl */ `
varying vec3 vN; varying vec3 vO;
void main(){ vN = normal; vO = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`;
const PHOBOS_FRAG = /* glsl */ `
uniform vec3 uSun; uniform float uSunI, uA;
varying vec3 vN; varying vec3 vO;
${GLSL_COMMON}
void main(){
  vec3 N = normalize(vN), L = normalize(uSun);
  float n = fbm3(vO * 9.);
  vec3 alb = vec3(0.075, 0.064, 0.056) * (0.8 + 0.4 * n);
  float m0 = max(dot(N, L), 0.);
  vec3 col = alb * m0 * uSunI * 2.2 + alb * 0.02;
  gl_FragColor = vec4(col * uA, uA);
}`;

// ---------------------------------------------------------------------------------------------
// Atmosphere shell: single scattering (Rayleigh + Mie), analytic ray/sphere, 16 view samples x 3 light samples.
// Samples cluster around the ray's lowest point so a thin limb is resolved. Premultiplied output.
// ---------------------------------------------------------------------------------------------
const ATMO_VERT = /* glsl */ `
varying vec3 vW;
void main(){ vec4 w = modelMatrix * vec4(position, 1.); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`;

const ATMO_FRAG = /* glsl */ `
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
}`;

// ---------------------------------------------------------------------------------------------
// files: { earth, earthSpec, earthNorm, earthLights, clouds, moon, moonNorm, mars, marsNorm } -> urls. A missing key keeps the 1x1 fallback.
// Earth maps load at once; Moon and Mars wait for loadDeferred() (film.js calls it when the camera is leaving Earth).
export function createPlanets({ THREE, scene, renderer, toSun, EARTH, MOON, MARS, files }) {
  const R_EARTH = 10, R_MOON = 2.7, R_MARS = 6;
  const anis = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const loader = new THREE.TextureLoader(); loader.setCrossOrigin('anonymous');
  const pending = [], deferredJobs = { moon: [], mars: [] }, deferredP = {};
  // 1x1 fallbacks so shaders run before maps land. Swapping a sampler's texture never changes a ShaderMaterial's
  // program key, so the real maps drop in without a recompile.
  const dot1 = (r, g, b, srgb) => { const t = new THREE.DataTexture(new Uint8Array([r, g, b, 255]), 1, 1); t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace; t.needsUpdate = true; return t; };
  // load -> decode off the main thread -> configure; callers upload before swapping so the first frame that samples it doesn't stall
  const fetchTex = (url, srgb) => new Promise(res => loader.load(url, t => {
    const img = t.image, dec = img && img.decode ? Promise.race([img.decode().catch(() => {}), new Promise(r => setTimeout(r, 400))]) : Promise.resolve(); // decode can stall in a background tab: cap it
    dec.then(() => {
      t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace; t.anisotropy = anis; t.wrapS = THREE.RepeatWrapping; t.needsUpdate = true;
      res(t);
    });
  }, undefined, () => res(null)));
  const upload = t => { if (t && renderer && renderer.initTexture) try { renderer.initTexture(t); } catch (e) { /* first draw uploads it instead */ } };
  const U = (key, srgb, fb, group) => { // returns a uniform whose value is swapped when the file loads
    const u = { value: fb }, name = files[key];
    if (!name) return u;                                           // keeps its 1x1 fallback
    const swap = t => { if (t) { upload(t); u.value = t; } };   // upload first, then swap: the next draw doesn't stall on it
    if (group) deferredJobs[group].push(() => fetchTex(name, srgb).then(t => ({ t, swap })));
    else pending.push(fetchTex(name, srgb).then(swap));
    return u;
  };
  const nextFrame = () => new Promise(r => (typeof requestAnimationFrame === 'function' ? requestAnimationFrame(() => r()) : setTimeout(r, 0)));
  function loadDeferred(group) { // 'moon' | 'mars', idempotent
    if (deferredP[group]) return deferredP[group];
    return (deferredP[group] = Promise.all(deferredJobs[group].map(j => j())).then(async texs => {
      for (const { t, swap } of texs) if (t) { swap(t); await nextFrame(); }   // one GPU upload per frame
    }));
  }
  const sunVec = () => ({ value: new THREE.Vector3().copy(toSun) });

  // ---------- Earth ----------
  const earthU = {
    tMap: U('earth', true, dot1(10, 30, 70, true)), tSpec: U('earthSpec', false, dot1(255, 255, 255)),
    tNorm: U('earthNorm', false, dot1(128, 128, 255)), tLights: U('earthLights', false, dot1(0, 0, 0)),
    tClouds: U('clouds', false, dot1(0, 0, 0)),
    uSun: sunVec(), uGrow: { value: 0.03 }, uCloudOff: { value: 0 }, uCloudH: { value: 0.0085 }, uSunI: { value: 3.3 }
  };
  const earth = new THREE.Mesh(new THREE.SphereGeometry(R_EARTH, 192, 96),
    new THREE.ShaderMaterial({ vertexShader: PLANET_VERT, fragmentShader: EARTH_FRAG, uniforms: earthU }));
  earth.position.copy(EARTH); scene.add(earth);

  const cloudU = { tClouds: earthU.tClouds, tLights: earthU.tLights, uSun: sunVec(), uSunI: earthU.uSunI, uHole: { value: new THREE.Vector4(0, 1, 0, 0) } };
  const clouds = new THREE.Mesh(new THREE.SphereGeometry(R_EARTH * 1.0085, 160, 80),
    new THREE.ShaderMaterial({ vertexShader: PLANET_VERT, fragmentShader: CLOUD_FRAG, uniforms: cloudU, transparent: true, depthWrite: false }));
  clouds.position.copy(EARTH); clouds.renderOrder = 1; scene.add(clouds);

  // ---------- Moon ----------
  const moonU = {
    tMap: U('moon', true, dot1(150, 150, 150, true), 'moon'), tNorm: U('moonNorm', false, dot1(128, 128, 255), 'moon'),
    uSun: sunVec(), uSunI: { value: 3.3 }, uAlbedo: { value: 0.30 }, uRelief: { value: 1.35 }
  };
  const moon = new THREE.Mesh(new THREE.SphereGeometry(R_MOON, 128, 64),
    new THREE.ShaderMaterial({ vertexShader: PLANET_VERT, fragmentShader: MOON_FRAG, uniforms: moonU }));
  moon.position.copy(MOON); scene.add(moon);

  // ---------- Mars ----------
  const marsU = {
    tMap: U('mars', true, dot1(150, 70, 40, true), 'mars'), tNorm: U('marsNorm', false, dot1(128, 128, 255), 'mars'),
    uSun: sunVec(), uSunI: { value: 2.2 }, uRelief: { value: 1.25 }, uDomes: { value: 1 }
  };
  marsU.uBump = { value: 11 }; marsU.uR = { value: R_MARS };
  const mars = new THREE.Mesh(new THREE.SphereGeometry(R_MARS * 1.015, 192, 96), // oversize: the shader cuts the true limb with pixel coverage
    new THREE.ShaderMaterial({ vertexShader: PLANET_VERT, fragmentShader: MARS_CINE_FRAG, uniforms: marsU, transparent: true,
      blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor }));
  mars.position.copy(MARS); scene.add(mars);
  mars.renderOrder = 1; // transparent: after the sky (-10/-9), before the atmosphere shell (2)

  // ---------- Phobos ----------
  // Rides as a child of Mars so it hides and compiles with it, but its world matrix is written in onBeforeRender: it sits on a fixed
  // arc above and a little right of the disc as seen down the approach line, so it never lands in the title gap or the beat-2 copy.
  let phobos = null;
  {
    const g = new THREE.IcosahedronGeometry(1, 4), pa = g.attributes.position, v = new THREE.Vector3();
    const h = (x, y, z) => { const s = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453; return s - Math.floor(s); };
    for (let i = 0; i < pa.count; i++) {
      v.fromBufferAttribute(pa, i);
      let r = 1 + 0.10 * Math.sin(v.x * 3.1 + 1) * Math.cos(v.y * 2.3) + 0.06 * Math.sin(v.z * 5.3 + v.x * 2);
      r -= 0.22 * Math.exp(-v.distanceToSquared({ x: 0.85, y: 0.25, z: 0.46 }) / 0.09);            // Stickney
      r -= 0.05 * h(Math.round(v.x * 6), Math.round(v.y * 6), Math.round(v.z * 6));
      v.multiplyScalar(r); v.x *= 1.25; v.z *= 0.88; pa.setXYZ(i, v.x, v.y, v.z);
    }
    g.computeVertexNormals();
    const pu = { uSun: { value: new THREE.Vector3(1, 0, 0) }, uSunI: marsU.uSunI, uA: { value: 1 } };
    phobos = new THREE.Mesh(g, new THREE.ShaderMaterial({ vertexShader: PHOBOS_VERT, fragmentShader: PHOBOS_FRAG, uniforms: pu, transparent: true,
      blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor }));
    phobos.frustumCulled = false; phobos.renderOrder = 1; phobos.matrixAutoUpdate = false; mars.add(phobos);
    const app = new THREE.Vector3(30, 10, 38).normalize(), up = new THREE.Vector3(0, 1, 0).addScaledVector(app, -app.y).normalize(), rt = new THREE.Vector3().crossVectors(up, app);
    const ax = up.clone().multiplyScalar(0.85).addScaledVector(rt, 0.55).normalize(); // screen 'up and a little right' as seen down the approach line
    const pq = new THREE.Quaternion(), ps = new THREE.Vector3(), pp = new THREE.Vector3(), pe = new THREE.Euler(), mq = new THREE.Quaternion();
    phobos.alpha = 1; phobos.size = 0.12; phobos.orbit = 1.75 * R_MARS; phobos.phase = null; // phase: null = drifts with time
    phobos.onBeforeRender = (r, sc, camera) => {
      const a = phobos.phase ?? (0.3 + 0.18 * Math.sin(phobosT * 0.011));   // a slow drift on its arc (depth changes, so it parallaxes against Mars)
      pp.copy(ax).multiplyScalar(Math.cos(a)).addScaledVector(app, Math.sin(a)).multiplyScalar(phobos.orbit).add(mars.position);
      pe.set(0.3, phobosT * 0.05, 0.2); pq.setFromEuler(pe);
      phobos.matrixWorld.compose(pp, pq, ps.setScalar(phobos.size));
      mq.copy(pq).invert(); pu.uSun.value.copy(marsU.uSun.value).applyQuaternion(mars.quaternion).applyQuaternion(mq);
      const dc = camera.position.distanceTo(mars.position);
      pu.uA.value = phobos.alpha * THREE.MathUtils.smoothstep(dc, 13, 20); // gone before the approach turns the camera onto the limb
    };
  }
  let phobosT = 0;

  // ---------- atmospheres ----------
  // betas are per planet radius (physical Earth values: R 5.8/13.5/33.1e-6 per m * 6371 km); heights are fractions of the radius, stretched ~3x for the camera
  const atmo = (center, Rp, o) => {
    const u = {
      uCenter: { value: center.clone() }, uSun: { value: new THREE.Vector3().copy(toSun) }, uRp: { value: Rp }, uRa: { value: Rp * o.top },
      uBetaR: { value: new THREE.Vector3(...o.bR).divideScalar(Rp) }, uBetaM: { value: new THREE.Vector3(...o.bM).divideScalar(Rp) },
      uBetaMe: { value: new THREE.Vector3(...o.bMe).divideScalar(Rp) }, uG: { value: new THREE.Vector3(...o.g) },
      uSunCol: { value: new THREE.Vector3(...o.sun) }, uHr: { value: o.Hr * Rp }, uHm: { value: o.Hm * Rp }, uK: { value: o.k }
    };
    const m = new THREE.Mesh(new THREE.SphereGeometry(Rp * o.top, 128, 64), new THREE.ShaderMaterial({
      vertexShader: ATMO_VERT, fragmentShader: o.frag || ATMO_FRAG, uniforms: u, transparent: true, depthWrite: false,
      blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor
    }));
    m.position.copy(center); m.renderOrder = 2; scene.add(m); return m;
  };
  const earthAtmo = atmo(EARTH, R_EARTH, {
    top: 1.10, Hr: 0.0085, Hm: 0.0034, bR: [8, 19, 48], bM: [24, 24, 24], bMe: [27, 27, 27], g: [0.80, 0.80, 0.80], sun: [1, 0.97, 0.92], k: 15
  });
  // Mars: dust-dominated. Scatter is butterscotch, extinction lets red through, and the forward lobe is tighter in blue (bluish glow around the sun).
  const marsAtmo = atmo(MARS, R_MARS, {
    top: 1.07, Hr: 0.0075, Hm: 0.0120, bR: [3, 7, 18], bM: [5.0, 3.4, 1.8], bMe: [6.0, 5.0, 4.4], g: [0.55, 0.72, 0.90], sun: [1, 0.95, 0.88], k: 12,
    frag: ATMO_FRAG.replace('clamp(1. - tr, 0., 1.) * 0.85', 'clamp(1. - tr, 0., 1.) * 0.25') // the limb's own shader carries the haze; a dithered dark grazing band read as a dashed outline
  });
  const atmos = [earthAtmo, marsAtmo];

  // ---------- per-frame ----------
  const qi = new THREE.Quaternion(), tv = new THREE.Vector3();
  const sunInto = (mesh, uni) => { qi.copy(mesh.quaternion).invert(); uni.value.copy(toSun).applyQuaternion(qi); };
  const EARTH_SPIN = 0.012, CLOUD_SPIN = 0.0158;
  const hq = new THREE.Quaternion(), hv = new THREE.Vector3();
  // spin: extra yaw so main.js can park a given city under the camera; hole: world direction kept free of cloud
  function update({ t = 0, intro = 1, camPos, spin = 0, hole } = {}) {
    earth.rotation.y = spin + t * EARTH_SPIN; clouds.rotation.y = spin + t * CLOUD_SPIN;
    if (hole) { clouds.updateMatrixWorld(); hq.copy(clouds.quaternion).invert(); hv.copy(hole).applyQuaternion(hq); cloudU.uHole.value.set(hv.x, hv.y, hv.z, 1); } moon.rotation.y = t * 0.01; mars.rotation.y = t * 0.02; phobosT = t;
    sunInto(earth, earthU.uSun); sunInto(clouds, cloudU.uSun); sunInto(moon, moonU.uSun); sunInto(mars, marsU.uSun);
    earthU.uCloudOff.value = (earth.rotation.y - clouds.rotation.y) / (2 * Math.PI);   // cloud deck slides over the ground
    earthU.uGrow.value = 0.03 + 0.97 * intro;                                          // city lights spread on load
    if (camPos) for (const a of atmos) { // flip to the inside face if the camera ever enters a shell
      const inside = tv.copy(camPos).sub(a.position).length() < a.material.uniforms.uRa.value * 1.002;
      const side = inside ? THREE.BackSide : THREE.FrontSide; if (a.material.side !== side) { a.material.side = side; a.material.needsUpdate = true; }
    }
  }
  // ---------- cine: Mars air (entry veil + colony sky dome with the Jezero far ground), driven by main.js through entry(e, ctx) ----------
  let air = null;
  air = createMarsAir({ THREE }); scene.add(air.dome, air.veil);
  const entry = air ? (e, ctx) => air.entry(e, ctx) : undefined;
  return { earth, moon, mars, clouds, earthAtmo, marsAtmo, phobos, air, entry, entryRoots: air ? air.roots : undefined,
    ready: Promise.all(pending), loadDeferred, update };
}
