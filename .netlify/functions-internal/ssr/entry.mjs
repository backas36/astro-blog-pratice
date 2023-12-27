import * as adapter from '@astrojs/netlify/ssr-function.js';
import { renderers } from './renderers.mjs';
import { manifest } from './manifest_QBRGGE5q.mjs';

const _page0  = () => import('./chunks/generic_2oHM9xbN.mjs');
const _page1  = () => import('./chunks/index_-W5TZk9b.mjs');
const _page2  = () => import('./chunks/_slug__1PSCFLFV.mjs');
const _page3  = () => import('./chunks/blog_0QXGp6SW.mjs');
const _page4  = () => import('./chunks/test_9s94PXJE.mjs');const pageMap = new Map([["node_modules/.pnpm/astro@4.0.7_typescript@5.3.3/node_modules/astro/dist/assets/endpoint/generic.js", _page0],["src/pages/index.astro", _page1],["src/pages/blog/[slug].astro", _page2],["src/pages/blog.astro", _page3],["src/pages/api/test.ts", _page4]]);
const _manifest = Object.assign(manifest, {
	pageMap,
	renderers,
});
const _args = undefined;

const _exports = adapter.createExports(_manifest, _args);
const _default = _exports['default'];

const _start = 'start';
if(_start in adapter) {
	adapter[_start](_manifest, _args);
}

export { _default as default, pageMap };
