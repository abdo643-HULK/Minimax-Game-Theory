import type { Cell } from '$lib/core';

export const FILL_STYLES = ['transparent', 'red', 'yellow'] as const;

export class Disc {
	readonly radius: number;
	readonly fillStyle: string;
	readonly type: Cell;

	constructor(radius: number, type: Cell) {
		this.radius = radius;
		this.fillStyle = FILL_STYLES[type];
		this.type = type;
	}

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
