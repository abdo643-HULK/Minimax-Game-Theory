import { assetsManager } from './AssetsManager';
import { DISC_SIZE, GAP } from './Board';

export class Game extends EventTarget {
	private _canvas: HTMLCanvasElement;

	private _assetsManager = assetsManager;

	constructor(canvas: HTMLCanvasElement) {
		super();
		// We need this arrow function because of how JS `this` works
		canvas.addEventListener('mousemove', (e) => this.mouseMoveHandler(e));
		canvas.addEventListener('click', (e) => this.dispatchEvent(new CustomEvent('drop')));

		this._canvas = canvas;

		this.loadAssets();

		// this.addEventListener('assets-loaded', () => {
		// 	this.dispatchEvent(new Event('ready'));
		// });
	}

	get ctx(): CanvasRenderingContext2D {
		return this._canvas.getContext('2d')!!;
	}

	mouseMoveHandler(e: MouseEvent) {
		// We need to know the position on the canvas itself and by subtracting the canavs left from the current position
		// we get the x position on the canvas itself
		const posX = e.clientX - this._canvas.getBoundingClientRect().left - DISC_SIZE;
		const idx = Math.floor(posX / (DISC_SIZE + GAP - 3));
		// console.debug(idx);
		this.dispatchEvent(
			new CustomEvent('draw', {
				detail: idx
			})
		);
	}

	async start() {
		await this.loadAssets();
	}

	private async loadAssets() {
		await this._assetsManager.loadImages();

		// this.dispatchEvent(
		// 	new CustomEvent('assets-loaded', {
		// 		bubbles: false,
		// 		cancelable: false
		// 	})
		// );
	}

	render() {}
}
