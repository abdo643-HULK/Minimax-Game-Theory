import preprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-static';

/** @type {import('vite').PluginOption} */
const StaticPlugin = {
	name: 'static-server',
	configureServer(server) {
		server.middlewares.use('/', (req, res, next) => {
			if (req.url?.includes('png')) {
				res.setHeader('cache-control', 'max-age=31536000,immutable');
			}

			res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp').setHeader(
				'Cross-Origin-Opener-Policy',
				'same-origin'
			);

			next();
		});
	}
};

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess(),

	kit: {
		adapter: adapter(),
		prerender: {
			default: true,
			entries: ['*']
		},
		vite: {
			// @ts-ignore
			plugins: [StaticPlugin],
			build: {
				target: 'ES2020'
			}
		}
	}
};

export default config;
