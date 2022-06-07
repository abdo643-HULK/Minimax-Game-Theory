import { Disc, FILL_STYLES } from './Disc';
import { DISC_RADIUS, DISC_SIZE, DISC_X_OFFSET, DISC_Y_OFFSET, GAP } from './Board';

import type { Cell } from '$lib/core';

export class Player {
	private _x: number = 0;
	private _y: number = 0;

	private readonly _disc;
	private _playerPos: number = 0;

	move: [number, number] = [0, 0];

	constructor(x: number, y: number, cell: Exclude<Cell, Cell.EMPTY>) {
		this._x = x;
		this._y = y;
		this._disc = new Disc(DISC_RADIUS, cell);
	}

	set playerPos(pos: number) {
		this._playerPos = pos;
		this._x = DISC_X_OFFSET + DISC_SIZE * pos + GAP * pos;
	}

	get playerPos() {
		return this._playerPos;
	}

	set y(y: number) {
		this._y = y;
	}

	get cellType() {
		return this._disc.type;
	}

	resetY() {
		this._y = DISC_Y_OFFSET;
	}

	draw(ctx: CanvasRenderingContext2D) {
		this._disc.draw(ctx, this._x, this._y);
	}
}
