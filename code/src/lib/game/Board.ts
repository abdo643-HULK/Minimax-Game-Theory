import { Disc } from './Disc';
import { assetsManager, Handle } from './AssetsManager';

import { Cell } from '$lib/core/entities';
import { getPlayableColumns } from '$lib/core';
import { ImageAssets, images } from '$lib/utils/assets';
import { checkForWin } from '$lib/core/checkForWin';

export const DISC_SIZE = 78;
export const DISC_RADIUS = DISC_SIZE / 2;
export const GAP = 13.8;
export const DISC_X_OFFSET = DISC_RADIUS + DISC_SIZE - 3;
export const DISC_Y_OFFSET = DISC_SIZE - 5.7;

const coinXOffset = DISC_RADIUS + DISC_SIZE - 3;
const coinYOffset = DISC_SIZE - 5.7;

export class Board {
	private _buffer: ArrayBuffer;
	private _board: Uint8Array[];

	readonly positionsX: number[];
	readonly positionsY: number[];
	private readonly _chips: Disc[];
	private readonly _images = new Array<Handle<ImageBitmap>>(2);

	constructor(rows = 6, columns = 7) {
		const buffer = new ArrayBuffer(rows * columns);
		const board = new Array<Uint8Array>(rows);
		// fill(new Uint8Array(buffer)).map((v, i) => new Uint8Array(v.buffer, i * 7, 7).fill(0));

		for (let i = 0; i < board.length; i++) {
			board[i] = new Uint8Array(buffer, i * 7, 7).fill(0);
		}

		this._board = board;
		this._buffer = buffer;
		this._chips = [
			new Disc(DISC_RADIUS, Cell.EMPTY),
			new Disc(DISC_RADIUS, Cell.PLAYER),
			new Disc(DISC_RADIUS, Cell.OPPONENT)
		];

		[ImageAssets.BOARD_BACK, ImageAssets.BOARD_FRONT].forEach((img) => {
			this._images[img] = assetsManager.load<ImageBitmap>(images[img]);
		});

		this.positionsX = new Array<number>(columns).fill(0);
		this.positionsX.forEach((_, i, arr) => (arr[i] = coinXOffset + DISC_SIZE * i + GAP * i));

		this.positionsY = new Array<number>(rows).fill(0);
		this.positionsY.forEach((_, i, arr) => (arr[i] = coinYOffset + DISC_SIZE * i + GAP * i));
	}

	set board(board: Uint8Array[]) {
		this._board = board;
		this._buffer = board?.[0].buffer ?? new ArrayBuffer(this.rows * this.columns);
	}

	get board(): Uint8Array[] {
		return this._board;
	}

	get buffer(): ArrayBuffer {
		return this._buffer;
	}

	get transferable(): ArrayBuffer {
		return this._buffer;
	}

	get rows(): number {
		return this._board.length;
	}

	get columns(): number {
		return this._board[0]?.length ?? 0;
	}

	checkForWin(move: Move = [0, 0], playerType: Cell.PLAYER | Cell.OPPONENT): Move[] | null {
		return checkForWin(this._board, move, playerType);
	}

	getEmptyRow(col: number) {
		for (let row = this._board.length - 1; row >= 0; --row) {
			if (this._board[row][col] === Cell.EMPTY) return row;
		}
	}

	getPlayableColumns() {
		return getPlayableColumns(this._board);
	}

	workerData() {
		return this.board;
	}

	*[Symbol.iterator](): Generator<Uint8Array, void> {
		for (const row of this.board) {
			yield row;
		}
	}

	clear() {
		this.board.forEach((row) => row.fill(Cell.EMPTY));
	}

	drawBack(ctx: CanvasRenderingContext2D) {
		const back = assetsManager.getImage(this._images[ImageAssets.BOARD_BACK]);
		ctx.drawImage(back, 32, 4, back.width, back.height);
	}

	drawFront(ctx: CanvasRenderingContext2D) {
		const front = assetsManager.getImage(this._images[ImageAssets.BOARD_FRONT]);
		ctx.drawImage(front, 0, 0, front.width, front.height);
	}

	draw(ctx: CanvasRenderingContext2D) {
		this._board.forEach((row, i) => {
			row.forEach((cell, j) => {
				this._chips[cell].draw(ctx, this.positionsX[j], this.positionsY[i]);
			});
		});
	}
}
