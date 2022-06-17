import type { Cell } from '$lib/core';

export const FILL_STYLES = ['transparent', 'red', 'yellow', 'transparent'] as const;

export class Disc {
	constructor(
		readonly radius: number,
		readonly type: Cell,
		readonly fillStyle: string | CanvasGradient | CanvasPattern = FILL_STYLES[type]
	) {}

	draw(ctx: CanvasRenderingContext2D, x: number, y: number) {
		this.drawCoin(ctx, x, y);
	}

	private drawCoin(ctx: CanvasRenderingContext2D, x: number, y: number) {
		ctx.fillStyle = this.fillStyle;
		ctx.beginPath();
		ctx.arc(x, y, this.radius, 0, 2 * Math.PI);
		ctx.fill();
	}
}
