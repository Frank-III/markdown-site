import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');
	const convexUrl = env.VITE_CONVEX_URL || '';
	const convexSiteUrl = convexUrl.replace('.cloud', '.site');

	return {
		plugins: [sveltekit()],
		server: {
			proxy: {
				'/rss.xml': {
					target: convexSiteUrl,
					changeOrigin: true
				},
				'/rss-full.xml': {
					target: convexSiteUrl,
					changeOrigin: true
				},
				'/sitemap.xml': {
					target: convexSiteUrl,
					changeOrigin: true
				},
				'/api/posts': {
					target: convexSiteUrl,
					changeOrigin: true
				},
				'/api/post': {
					target: convexSiteUrl,
					changeOrigin: true
				},
				'/meta/post': {
					target: convexSiteUrl,
					changeOrigin: true
				}
			}
		}
	};
});
