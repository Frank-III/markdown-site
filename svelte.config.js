import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';

/** @type {import('mdsvex').MdsvexOptions} */
const mdsvexOptions = {
	extensions: ['.svx', '.md'],
	highlight: {
		alias: {
			ts: 'typescript',
			js: 'javascript',
			sh: 'bash'
		}
	},
	layout: {
		_: './src/lib/components/mdsvex/Layout.svelte'
	}
};

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', '.svx', '.md'],
	preprocess: [vitePreprocess(), mdsvex(mdsvexOptions)],

	kit: {
		adapter: adapter({
			out: 'build',
			precompress: true
		}),
		alias: {
			$convex: 'src/convex'
		}
	}
};

export default config;
