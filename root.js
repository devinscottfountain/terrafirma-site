// root.js: the repo root URL (with trailing slash), the one place that knows where this code runs from.
// Source files sit at their repo paths; the bundle sits in dist/ (entries) and dist/chunks/ (shared chunks, where this file
// ends up), so cut the URL back to the last '/dist/'. Assets are then resolved from here with a repo-root path.
const U = import.meta.url, i = U.lastIndexOf('/dist/');
export const ROOT = new URL(i < 0 ? './' : U.slice(0, i + 1), U).href;
