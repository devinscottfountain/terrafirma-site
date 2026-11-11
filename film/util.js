// util.js: small math helpers shared by the film modules.
export const clamp01 = v => Math.min(1, Math.max(0, v));
export const sstep = (x, a, b) => { if (x <= a) return 0; if (x >= b) return 1; x = (x - a) / (b - a); return x * x * (3 - 2 * x); }; // same as THREE.MathUtils.smoothstep
export const easeOut = v => 1 - Math.pow(1 - clamp01(v), 3);
export const smoother = x => x * x * x * (x * (x * 6 - 15) + 10);
export const lerp = (a, b, t) => a + (b - a) * t;

// monotone cubic (Fritsch-Carlson). Velocity stays continuous through every key and never overshoots,
// so the camera can't stop dead on a key, fire off again, or swing past a framing and come back.
export function pchip(xs, ys, m0, mN) {
  const n = xs.length, h = [], d = [], m = new Array(n);
  for (let i = 0; i < n - 1; i++) { h[i] = xs[i + 1] - xs[i]; d[i] = (ys[i + 1] - ys[i]) / h[i]; }
  for (let i = 1; i < n - 1; i++) { if (d[i - 1] * d[i] <= 0) m[i] = 0; else { const w1 = 2 * h[i] + h[i - 1], w2 = h[i] + 2 * h[i - 1]; m[i] = (w1 + w2) / (w1 / d[i - 1] + w2 / d[i]); } }
  const end = (h0, h1, d0, d1) => { let v = ((2 * h0 + h1) * d0 - h0 * d1) / (h0 + h1); if (Math.sign(v) !== Math.sign(d0)) v = 0; else if (Math.sign(d0) !== Math.sign(d1) && Math.abs(v) > 3 * Math.abs(d0)) v = 3 * d0; return v; };
  m[0] = m0 !== undefined ? m0 * d[0] : end(h[0], h[1], d[0], d[1]);
  m[n - 1] = mN !== undefined ? mN * d[n - 2] : end(h[n - 2], h[n - 3], d[n - 2], d[n - 3]);
  return x => {
    if (x <= xs[0]) return ys[0] + m[0] * (x - xs[0]); if (x >= xs[n - 1]) return ys[n - 1];
    let i = 0; while (x > xs[i + 1]) i++;
    const t = (x - xs[i]) / h[i], t2 = t * t, t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * ys[i] + (t3 - 2 * t2 + t) * h[i] * m[i] + (-2 * t3 + 3 * t2) * ys[i + 1] + (t3 - t2) * h[i] * m[i + 1];
  };
}

// piecewise-linear map through [x, y] keys (x ascending), extrapolating the end segments
export function plin(keys) {
  return x => {
    let i = 0; while (i < keys.length - 2 && x > keys[i + 1][0]) i++;
    const [x0, y0] = keys[i], [x1, y1] = keys[i + 1]; return y0 + (y1 - y0) * (x - x0) / (x1 - x0 || 1);
  };
}
