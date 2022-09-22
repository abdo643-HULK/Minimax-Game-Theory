import { sveltekit } from '@sveltejs/kit/vite';

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

/** @type {import('vite').UserConfig} */
export default {
	plugins: [sveltekit(), StaticPlugin],
	build: {
		target: 'ES2020'
	}
};
