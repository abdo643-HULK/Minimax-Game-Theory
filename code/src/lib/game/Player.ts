import { Disc, FILL_STYLES } from './Disc';
import { DISC_RADIUS, DISC_SIZE, DISC_X_OFFSET, DISC_Y_OFFSET, GAP } from './Board';

import type { Cell } from '$lib/core';

export class Player {
	// readonly name: string;

	private readonly _disc;
	private _pos: number = 0;

	move: [number, number] | undefined = undefined;

	constructor(
		readonly name: string,
		cell: Exclude<Cell, Cell.EMPTY>,
		private _x: number = 0,
		private _y: number = 0
	) {
		this._disc = new Disc(DISC_RADIUS, cell);
	}

	set pos(pos: number) {
		this._pos = pos;
		this._x = DISC_X_OFFSET + DISC_SIZE * pos + GAP * pos;
	}

	get pos() {
		return this._pos;
	}

	set y(y: number) {
		this._y = y;
	}

	get cellType(): Exclude<Cell, Cell.EMPTY | Cell.WIN> {
		return this._disc.type as Exclude<Cell, Cell.EMPTY | Cell.WIN>;
	}

	resetY() {
		this._y = DISC_Y_OFFSET;
	}

	draw(ctx: CanvasRenderingContext2D) {
		this._disc.draw(ctx, this._x, this._y);
	}
}
