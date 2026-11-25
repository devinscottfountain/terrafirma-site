// lib-route.mjs: headless Chrome (software GL) that serves the worktree through page.route (no listening port).
// Software GL timings are NOT GPU numbers: only counts, buffer sizes and the JS time of a frame (CPU side) mean anything here.
import { chromium } from '/opt/npm-tools/node_modules/playwright/index.mjs';
import fs from 'node:fs';
import path from 'node:path';

export const ROOT = path.resolve(new URL('..', import.meta.url).pathname);
export const ORIGIN = 'http://tf.local';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.json': 'application/json', '.hdr': 'application/octet-stream', '.glb': 'model/gltf-binary', '.bin': 'application/octet-stream', '.css': 'text/css' };

export async function launch() {
  return chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-precise-memory-info', '--js-flags=--expose-gc'] });
}

// serve ORIGIN/<path> from the worktree; counts bytes per request in `net` (url -> bytes)
export async function serve(ctxOrPage, net = {}) {
  await ctxOrPage.route(ORIGIN + '/**', route => {
    const u = new URL(route.request().url()), rel = decodeURIComponent(u.pathname);
    const f = path.join(ROOT, rel);
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) return route.fulfill({ status: 404, body: 'nf' });
    const body = fs.readFileSync(f); net[rel] = body.length;
    route.fulfill({ status: 200, contentType: MIME[path.extname(f)] || 'application/octet-stream', body, headers: { 'access-control-allow-origin': '*' } });
  });
  return net;
}
