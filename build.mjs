// Bundles the two page entries into dist/ (minified ESM, shared chunks). Run: npm run build
// Only the bare `three` stays external (the page's importmap supplies the single shared instance); three/addons/* is bundled
// from node_modules, and the addons' own `from 'three'` imports stay bare too, so there is exactly one three at runtime.
// (esbuild's `external: ['three']` would also match every `three/...` subpath, hence the exact-match plugin.)
import { build } from 'esbuild';
import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

rmSync('dist', { recursive: true, force: true });
const res = await build({
  entryPoints: ['home3d.js', 'careers.js'],
  bundle: true, splitting: true, format: 'esm', minify: true, target: 'es2020',
  outdir: 'dist', chunkNames: 'chunks/[name]-[hash]',
  plugins: [{ name: 'three-external', setup(b) { b.onResolve({ filter: /^three$/ }, () => ({ path: 'three', external: true })); } }],
  legalComments: 'none', metafile: true,
});

const out = res.metafile.outputs, rel = p => p.replace(/^dist\//, '');
const size = p => out[p].bytes;
// static closure of an output (entry + the chunks it imports statically) and the dynamic chunks reachable from it
function walk(p, seen = new Set(), dyn = new Set()) {
  if (seen.has(p)) return { seen, dyn };
  seen.add(p);
  for (const i of out[p].imports) {
    if (i.external || !out[i.path]) continue;
    if (i.kind === 'import-statement') walk(i.path, seen, dyn); else if (i.kind === 'dynamic-import') dyn.add(i.path);
  }
  return { seen, dyn };
}
const manifest = {};
const ENTRIES = ['home3d.js', 'careers.js'];
for (const [p, o] of Object.entries(out)) {
  if (!ENTRIES.includes(o.entryPoint)) continue;
  const { seen, dyn } = walk(p);
  seen.delete(p);
  const dynAll = new Set(), q = [...dyn];   // dynamic chunks, plus whatever each one statically pulls in
  while (q.length) { const d = q.pop(); if (dynAll.has(d)) continue; dynAll.add(d); const w = walk(d); for (const s of w.seen) dynAll.add(s); for (const x of w.dyn) q.push(x); }
  for (const s of seen) dynAll.delete(s);
  const ent = c => ({ file: rel(c), bytes: size(c) });
  manifest[o.entryPoint] = { file: rel(p), bytes: size(p), static: [...seen].map(ent), dynamic: [...dynAll].map(ent) };
}
writeFileSync('dist/manifest.json', JSON.stringify(manifest, null, 2) + '\n');

console.log('file'.padEnd(46) + 'raw'.padStart(10) + 'gzip'.padStart(10));
for (const p of Object.keys(out).sort()) {
  const gz = gzipSync(readFileSync(p)).length;
  console.log(rel(p).padEnd(46) + String(size(p)).padStart(10) + String(gz).padStart(10));
}
