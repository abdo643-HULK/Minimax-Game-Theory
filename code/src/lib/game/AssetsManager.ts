import { images } from '$lib/utils/assets';

export class AssentsManager extends EventTarget {
	private readonly images: ImageBitmap[] = [];

	constructor() {
		super();
	}

	async loadAssets() {
		await this.loadImages();
	}

	async loadImages() {
		const loadedImages = await Promise.all(
			images.map(async (src, i) => {
				const res = await fetch(src);
				const blob = await res.blob();
				return await self.createImageBitmap(blob);
			})
		);

		this.images.push.apply(this.images, loadedImages);

		// let count = images.length;

		// images.forEach((src, i) => {
		// 	const img = new Image();
		// 	img.src = src;
		// 	img.decoding = 'async';
		// 	img.addEventListener('load', () => {
		// 		--count;
		// 		if (count === 0) this.dispatchEvent(new CustomEvent('assets-loaded'));
		// 	});
		// });
	}

	get(id: number) {}

	getImage(id: number) {
		return this.images[id];
	}

	getImages(...ids: number[]) {
		return ids.map((id) => this.images[id]);
	}

	getAsBitmap() {}
}

export const assetsManager = new AssentsManager();
