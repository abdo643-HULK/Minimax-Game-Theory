import { images } from '$lib/utils/assets';

export class Game extends EventTarget {
	private _canvas: HTMLCanvasElement;
	private _ctx: CanvasRenderingContext2D;

	constructor(canvas: HTMLCanvasElement) {
		super();
		this._canvas = canvas;
		this._ctx = canvas.getContext('2d')!!;

		this.loadAssets();

		this.addEventListener('assets-loaded', () => {
			this.dispatchEvent(new Event('ready'));
		});
	}

	loadAssets() {
		let count = images.length;

		images.forEach((src, i) => {
			const img = new Image();
			img.src = src;
			img.decoding = 'async';
			img.addEventListener('load', () => {
				--count;
				if (count === 0) this.dispatchEvent(new CustomEvent('assets-loaded'));
			});
		});
	}

	render() {}
}
