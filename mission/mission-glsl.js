// Mission planets and engine plume: shaders.
// Each planet is a screen-space quad in the orthographic section camera. The fragment shader ray-casts the true sphere
// analytically (ortho view: z = sqrt(1 - |q|^2)), so the disc is exactly the box (diameter = box width), the limb gets
// exact pixel coverage (no mesh, no stair-steps, no sparkle), and the thin atmosphere rim is evaluated in the same pass.
// Output is premultiplied, tone mapped (ACES) and sRGB encoded here; the renderer does no tone mapping for these.
// q is in planet radii, origin at the planet centre, +y up, camera looks down -z. uRot maps world -> object space.

export const PLANET_VERT = /* glsl */ `
uniform float uQ;
varying vec2 vQ;
void main(){ vQ = (uv - 0.5) * 2.0 * uQ; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`;

const COMMON = /* glsl */ `
uniform mat3 uRot; uniform vec3 uSun; uniform float uSunI, uExp, uGlow;
varying vec2 vQ;
const float PI = 3.14159265;
float hash13(vec3 p){ p = fract(p * 0.3183099 + .1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float vnoise(vec3 x){ vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash13(i), hash13(i + vec3(1,0,0)), f.x), mix(hash13(i + vec3(0,1,0)), hash13(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(hash13(i + vec3(0,0,1)), hash13(i + vec3(1,0,1)), f.x), mix(hash13(i + vec3(0,1,1)), hash13(i + vec3(1,1,1)), f.x), f.y), f.z); }
float fbm3(vec3 p){ float v = 0., a = .5; for(int i = 0; i < 3; i++){ v += a * vnoise(p); p *= 2.07; a *= .5; } return v; }
// object-space direction on the unit sphere -> three.js SphereGeometry uv
vec2 dirToUv(vec3 p){ return vec2(fract(atan(p.z, -p.x) / (2. * PI)), 0.5 + asin(clamp(p.y, -1., 1.)) / PI); }
void sphFrame(vec3 p, out vec3 e, out vec3 n){ vec3 c = cross(vec3(0,1,0), p); e = length(c) < 1e-4 ? vec3(0,0,1) : normalize(c); n = cross(p, e); }
vec3 perturb(vec3 p, vec3 nt, float k){ vec3 e, n; sphFrame(p, e, n); nt.xy *= k; return normalize(e * nt.x + n * nt.y + p * max(nt.z, 0.05)); }
// sunlight colour after the air column at sun cosine mu (Kasten-Young airmass), tau = zenith optical depth per channel
vec3 sunTrans(float mu, vec3 tau){ float el = degrees(asin(clamp(mu, -1., 1.))); el = max(el, 0.3);
  float am = 1. / (sin(radians(el)) + 0.50572 * pow(el + 6.07995, -1.6364)); return exp(-tau * am); }
vec3 aces(vec3 x){ return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0., 1.); }
vec3 oetf(vec3 c){ return mix(c * 12.92, 1.055 * pow(c, vec3(1. / 2.4)) - 0.055, step(0.0031308, c)); }
// world-facing sphere point for a disc coordinate (clamped just inside the limb), rotated into object space
vec3 dirAt(vec2 qq){ float l = length(qq); if (l > 0.9995) qq *= 0.9995 / l; return uRot * vec3(qq, sqrt(1. - dot(qq, qq))); }
// premultiplied, tone mapped output from linear surface radiance (already scaled by coverage) and linear atmosphere glow
vec4 pack(vec3 surf, float cov, vec3 glow){
  vec3 o = oetf(aces(surf * uExp)) + oetf(aces(glow * uExp));
  float a = clamp(max(cov, max(o.r, max(o.g, o.b))), 0., 1.);
  return vec4(min(o, vec3(a)), a);
}
`;

// shared disc setup: coverage, tangent/hit direction, uv and its gradients (analytic, seam-safe)
const DISC = /* glsl */ `
  vec2 q = vQ; float r = length(q);
  vec2 dqx = dFdx(q), dqy = dFdy(q);
  float fw = max(length(vec2(dFdx(r), dFdy(r))), 1e-4);
  float cov = clamp((1. - r) / fw + 0.5, 0., 1.);
  vec2 qn = r > 1. ? q / r : q;                    // outside the disc: the tangent point of the grazing ray
  float z = sqrt(max(1. - dot(qn, qn), 0.));
  vec3 p = uRot * vec3(qn, z), L = normalize(uSun);
  float mu = dot(p, L);
  vec2 uv = dirToUv(p);
  vec2 gx = dirToUv(dirAt(q + dqx)) - uv, gy = dirToUv(dirAt(q + dqy)) - uv;
  gx.x -= floor(gx.x + .5); gy.x -= floor(gy.x + .5);
  gx = clamp(gx, vec2(-0.006), vec2(0.006)); gy = clamp(gy, vec2(-0.006), vec2(0.006));
`;

// ---------------------------------------------------------------------------------------------
// Earth: map, ocean from the map's own near-black sea, glint and Fresnel sheen, normal relief on land,
// a cloud deck (high tier) that slides over the ground and shades it, thin blue-white atmosphere rim.
// ---------------------------------------------------------------------------------------------
export const EARTH_FRAG = /* glsl */ `
uniform sampler2D tMap, tNorm, tClouds;
uniform float uCloudOff, uCloudH; uniform vec2 uCloudRot;
${COMMON}
void main(){
${DISC}
  vec3 col = vec3(0.);
  if (cov > 0.) {
    vec3 alb = textureGrad(tMap, uv, gx, gy).rgb;
    float ocean = 1. - smoothstep(0.004, 0.02, max(alb.r, alb.g));
    vec3 seaAlb = max(alb, vec3(0.010, 0.036, 0.100)) + vec3(0., 0.01, 0.03) * smoothstep(0., 0.2, alb.b);
    vec3 base = mix(alb, seaAlb, ocean);
    vec3 N = p;
    #ifdef HAS_NORM
    N = perturb(p, textureGrad(tNorm, uv, gx, gy).rgb * 2. - 1., 0.8 * (1. - ocean));
    #endif
    float dens = 0., shadow = 1., cover = 0.; vec3 Nc = p;
    #ifdef HAS_CLOUDS
    vec2 cuv = vec2(uv.x + uCloudOff, uv.y);
    float d0 = textureGrad(tClouds, cuv, gx, gy).r;
    float dx = textureGrad(tClouds, cuv + vec2(1. / 1024., 0.), gx, gy).r, dy = textureGrad(tClouds, cuv + vec2(0., 1. / 512.), gx, gy).r;
    vec3 pc = vec3(p.x * uCloudRot.x - p.z * uCloudRot.y, p.y, p.x * uCloudRot.y + p.z * uCloudRot.x);   // noise rides with the deck, not the ground
    float nz = fbm3(pc * 26.) - 0.5;
    cover = d0;
    dens = smoothstep(0.06, 0.78, clamp(d0 + nz * 0.55 * smoothstep(0.03, 0.4, d0) * (1.1 - d0), 0., 1.));
    vec3 e, n; sphFrame(p, e, n);
    Nc = normalize(p - (e * (dx - d0) + n * (dy - d0)) * 3.);
    float mus = max(mu, 0.12);
    vec2 uq = dirToUv(normalize(p + L * (uCloudH / mus))); uq.x += uCloudOff;
    float sh = textureLod(tClouds, uq, 2.2).r;
    shadow = 1. - 0.6 * smoothstep(0.15, 0.85, sh) * smoothstep(0., 0.25, mu + 0.05);
    #endif
    vec3 sunCol = sunTrans(mu, vec3(0.034, 0.075, 0.175));
    float gate = smoothstep(-0.02, 0.07, mu);
    float NL = max(dot(N, L), 0.) * gate;
    col = base * sunCol * NL * uSunI * shadow;
    col += base * vec3(0.10, 0.17, 0.34) * 0.55 * smoothstep(-0.12, 0.6, mu);                       // blue sky fill, day side
    col += vec3(0.95, 0.42, 0.22) * 0.04 * exp(-pow((mu + 0.015) / 0.07, 2.)) * (0.35 + 0.65 * (1. - ocean * 0.5)); // twilight band
    // ocean glint (tight + broad) and Fresnel sky reflection toward the limb; V is the constant ortho view in object space
    vec3 V = uRot * vec3(0., 0., 1.), H = normalize(L + V);
    float nh = max(dot(p, H), 0.);
    float F = 0.02 + 0.98 * pow(1. - z, 5.);
    float glint = pow(nh, 3000.) * 3. + pow(nh, 500.) * 0.5 + pow(nh, 90.) * 0.02;
    col += ocean * smoothstep(0., 0.12, mu) * (1. - smoothstep(0.1, 0.8, cover)) * vec3(1., 0.93, 0.82) * sunCol * glint * (0.35 + 1.6 * F);
    col += ocean * vec3(0.10, 0.20, 0.42) * F * 1.4 * smoothstep(-0.2, 0.5, mu);
    #ifdef HAS_CLOUDS
    vec3 cloudCol = vec3(0.93, 0.95, 0.98) * sunCol * max(dot(Nc, L), 0.) * smoothstep(-0.03, 0.1, mu) * uSunI * mix(1., 0.78, dens);
    cloudCol += vec3(0.10, 0.17, 0.34) * 0.5 * smoothstep(-0.12, 0.6, mu);
    cloudCol += vec3(0.95, 0.5, 0.3) * 0.04 * exp(-pow((mu + 0.01) / 0.08, 2.)) * dens;
    col = mix(col, cloudCol, dens * 0.96);
    #endif
    col += vec3(0.02, 0.03, 0.06) * 0.025 + base * vec3(0.03, 0.05, 0.10) * 0.05;                                                      // whisper of earthshine on the night side
    // limb: haze over the disc, thin and blue, brighter on the lit side
    col = mix(col, col * 0.7, smoothstep(0.55, 1., 1. - z) * smoothstep(-0.2, 0.3, mu) * 0.4);
  }
  // atmosphere: thin blue-white rim, e-folds in ~4 px outside the limb, a short haze inside it
  float H0 = 0.011;
  float lim = r > 1. ? exp(-(r - 1.) / H0) : exp(-z / 0.16);
  float lit = smoothstep(-0.28, 0.30, mu);
  vec3 rimC = mix(vec3(0.20, 0.46, 1.0), vec3(0.72, 0.88, 1.0), smoothstep(0.3, 1., lim));
  vec3 glow = rimC * lim * lit * 0.85 + vec3(1., 0.45, 0.2) * lim * exp(-pow(mu / 0.09, 2.)) * 0.16;
  glow *= uGlow * (r < 1. ? 0.55 : 1.);
  if (cov <= 0. && max(glow.r, max(glow.g, glow.b)) < 0.002) discard;
  gl_FragColor = pack(col * cov, cov, glow);
}`;

// ---------------------------------------------------------------------------------------------
// Mars, lit cine look: colour map with local contrast, its luminance as bump under the light, polar caps kept pale,
// crisp-but-soft terminator, dust limb haze. Rim: thin dusty butterscotch (no creamy outer glow).
// ---------------------------------------------------------------------------------------------
export const MARS_FRAG = /* glsl */ `
uniform sampler2D tMap, tNorm; uniform float uRelief, uBump;
${COMMON}
float lumA(vec2 uv, vec2 gx, vec2 gy){ return dot(textureGrad(tMap, uv, gx, gy).rgb, vec3(.35, .5, .15)); }
void main(){
${DISC}
  vec3 col = vec3(0.);
  if (cov > 0.) {
    vec3 alb = textureGrad(tMap, uv, gx, gy).rgb;
    vec3 blur = textureGrad(tMap, uv, gx * 6., gy * 6.).rgb;
    float slant = 1. - z;
    alb = max(alb + (alb - blur) * 0.55 * (1. - smoothstep(0.5, 0.85, slant)), 0.);   // crater rims, chasma walls, dune fields
    vec2 fwu = max(abs(gx), abs(gy));
    vec2 st = clamp(fwu * 1.2, vec2(1. / 2048., 1. / 1024.), vec2(0.004));
    float hx = lumA(uv + vec2(st.x, 0.), gx, gy) - lumA(uv - vec2(st.x, 0.), gx, gy), hy = lumA(uv + vec2(0., st.y), gx, gy) - lumA(uv - vec2(0., st.y), gx, gy);
    vec3 nt = vec3(0., 0., 1.);
    #ifdef HAS_NORM
    nt = textureGrad(tNorm, uv, gx, gy).rgb * 2. - 1.;
    #endif
    nt.xy *= uRelief;
    nt.xy -= vec2(hx, hy) * uBump * (1.5 / 4096.) / st.x;      // gradient per texel, so relief holds at every zoom
    vec3 N = perturb(p, normalize(nt), 1.);
    // ice: the map's own caps (bright, unsaturated), edge broken up
    float lat = asin(clamp(p.y, -1., 1.)), mx = max(alb.r, max(alb.g, alb.b)), sat = (mx - min(alb.b, min(alb.r, alb.g))) / max(mx, 1e-3);
    float ice = smoothstep(0.62, 0.85, mx) * (1. - smoothstep(0.18, 0.42, sat));
    ice = max(ice, smoothstep(1.39, 1.45, abs(lat) + (fbm3(p * 22.) - 0.5) * 0.07)) * smoothstep(1.05, 1.25, abs(lat));
    vec3 rust = pow(alb, vec3(1.22)) * 1.32; float l = dot(rust, vec3(.3, .55, .15));
    rust = max(mix(vec3(l), rust, 1.0), 0.) * vec3(1.0, 0.93, 0.74);                  // butterscotch rust
    vec3 A = mix(rust, vec3(0.80, 0.78, 0.76) * (0.7 + 0.2 * l), ice * 0.85);
    vec3 sunCol = sunTrans(mu, vec3(0.05, 0.085, 0.15));
    float gate = smoothstep(-0.035, 0.09, mu);                                           // a few degrees of penumbra, then near black
    float m0 = max(dot(N, L) + 0.04, 0.) / 1.04 * gate, m1 = max(z, 0.05);
    float val = mix(m0, 2. * m0 / (m0 + m1), 0.12);
    col = A * sunCol * val * uSunI;
    col += A * vec3(0.95, 0.60, 0.36) * 0.03 * smoothstep(-0.05, 0.6, mu);               // dust fill, day side only
    col += vec3(0.95, 0.45, 0.22) * 0.016 * exp(-pow((mu - 0.01) / 0.07, 2.));          // thin warm twilight band
    col += A * vec3(0.5, 0.3, 0.25) * 0.004 * (1. - smoothstep(-0.2, 0.05, mu));         // whisper of night so the dark side keeps shape
    float hz = clamp(pow(slant, 5.) * 0.45 + pow(slant, 16.) * 0.5, 0., 0.7);           // thin dust column grows as 1/cos toward the edge
    vec3 haze = vec3(1.0, 0.70, 0.46) * 0.55 * uSunI * sunCol * smoothstep(-0.06, 0.45, mu);
    col = mix(col, haze, hz * smoothstep(-0.1, 0.2, mu));
  }
  // atmosphere rim: thin and dusty, lit side only, falls off in ~3 px
  float H0 = 0.0075;
  float lim = r > 1. ? exp(-(r - 1.) / H0) : exp(-z / 0.10);
  float lit = smoothstep(-0.12, 0.35, mu);
  vec3 glow = mix(vec3(1.0, 0.52, 0.26), vec3(1.0, 0.72, 0.46), smoothstep(0.4, 1., lim)) * lim * lit * 0.42;
  glow *= uGlow * (r < 1. ? 0.6 : 1.);
  if (cov <= 0. && max(glow.r, max(glow.g, glow.b)) < 0.002) discard;
  gl_FragColor = pack(col * cov, cov, glow);
}`;

// ---------------------------------------------------------------------------------------------
// Engine plume: a tapering flame on a plane (uv.y = 1 at the nozzle), additive, premultiplied canvas friendly.
// ---------------------------------------------------------------------------------------------
export const PLUME_VERT = /* glsl */ `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`;

export const PLUME_FRAG = /* glsl */ `
uniform float uT, uA;
varying vec2 vUv;
void main(){
  float v = 1. - vUv.y, x = (vUv.x - .5) * 2.;           // v: 0 at the nozzle, 1 at the tip
  float n = .5 * sin(uT * 37. + v * 9.) + .5 * sin(uT * 23. - v * 14. + 1.7);
  float w = max(mix(.64, .07, pow(v, .85)) * (1. + .10 * n * v), 1e-3);
  float d = abs(x) / w;
  float body = smoothstep(1., .12, d), fall = pow(1. - v, 1.7);
  float core = smoothstep(.6, 0., d) * smoothstep(.5, 0., v);
  float I = (body * fall * .8 + core * 1.1) * (.9 + .1 * n);
  vec3 c = mix(vec3(1., .40, .10), vec3(1., .86, .58), clamp(core * 1.3 + fall * .3 - v * .2, 0., 1.)) * I * uA;
  gl_FragColor = vec4(c, max(c.r, max(c.g, c.b)));
}`;

// ---------------------------------------------------------------------------------------------
// Environment for the ship's steel: a dark blue-grey room with a warm key front-left, a cool back rim and warm Mars bounce below.
// ---------------------------------------------------------------------------------------------
export const ENV_VERT = /* glsl */ `varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`;
export const ENV_FRAG = /* glsl */ `
varying vec3 vD; uniform vec3 uL;
void main(){
  vec3 d = normalize(vD); float k = max(dot(d, uL), 0.);
  vec3 c = vec3(0.02, 0.024, 0.04);
  c += vec3(1.0, 0.86, 0.68) * (pow(k, 28.) * 10. + pow(k, 4.) * 0.55);                      // key
  c += vec3(0.45, 0.60, 1.0) * pow(max(dot(d, normalize(vec3(0.7, 0.3, -0.5))), 0.), 5.) * 1.8; // cool rim from behind
  c += vec3(0.95, 0.52, 0.26) * smoothstep(0.1, -0.9, d.y) * 0.45;                           // warm bounce from below
  c += vec3(0.62, 0.68, 0.8) * smoothstep(-0.2, 1., d.y) * 0.5;                               // top
  gl_FragColor = vec4(c, 1.);
}`;
