import adapter from '@sveltejs/adapter-auto';
import preprocess from 'svelte-preprocess';

/** @type {import('vite').PluginOption} */
const StaticPlugin = {
	name: 'static-server',
	configureServer(server) {
		server.middlewares.use('/', (req, res, next) => {
			if (req.url?.includes('png')) {
				res.setHeader('cache-control', 'max-age=31536000,immutable');
			}

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
		vite: {
			plugins: [StaticPlugin],
			build: {
				target: 'ES2020'
			}
		}
	}
};

export default config;
