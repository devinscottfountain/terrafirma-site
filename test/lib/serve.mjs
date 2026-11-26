// serve.mjs: serve the worktree to a playwright context without a listening process (page.route fulfils from disk).
import fs from 'node:fs'; import path from 'node:path';
const ROOT = new URL('../../', import.meta.url).pathname.replace(/\/$/, '');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.svg': 'image/svg+xml', '.css': 'text/css', '.woff2': 'font/woff2' };
export const ORIGIN = 'http://tf.test';
// det: three's generateUUID eats Math.random: with a seeded Math.random that shifts the sim whenever an object is created, so uuids get their own stream
export async function serve(ctx, { det = false } = {}) {
  await ctx.route(ORIGIN + '/**', route => {
    const u = new URL(route.request().url()); let p = path.join(ROOT, decodeURIComponent(u.pathname));
    if (!p.startsWith(ROOT)) return route.fulfill({ status: 403, body: '' });
    try { let b = fs.readFileSync(p); if (det && /three\.module\.js$/.test(p)) b = Buffer.from(b.toString().replaceAll('Math.random() * 0xffffffff | 0', '(globalThis.__uu = ((globalThis.__uu || 1) * 1664525 + 1013904223) >>> 0) | 0')); route.fulfill({ status: 200, body: b, headers: { 'content-type': TYPES[path.extname(p)] || 'application/octet-stream', 'access-control-allow-origin': '*' } }); }
    catch (_) { route.fulfill({ status: 404, body: '' }); }
  });
}
