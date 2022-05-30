import { images } from '$lib/utils/assets';

export class AssentsManager extends EventTarget {
	constructor() {
		super();
	}

	loadAssets() {}

	async loadImages() {
		let count = images.length;

		images.forEach(async (src, i) => {
			const res = await fetch(src);
			const blob = res.blob();

			const img = new Image();

			img.src = src;
			img.decoding = 'async';
			img.addEventListener('load', () => {
				--count;
				if (count === 0) this.dispatchEvent(new CustomEvent('assets-loaded'));
			});
		});
	}

	get() {}

	getAsBitmap() {}
}
