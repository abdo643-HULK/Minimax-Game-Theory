import { Disc } from './Disc';
import { assetsManager } from './AssetsManager';
import { Cell } from '$lib/core/entities';
import { ImageAssets } from '$lib/utils/assets';

export const DISC_SIZE = 78;
export const DISC_RADIUS = DISC_SIZE / 2;
export const GAP = 13.8;
export const DISC_X_OFFSET = DISC_RADIUS + DISC_SIZE - 3;
export const DISC_Y_OFFSET = DISC_SIZE - 5.7;

const coinXOffset = DISC_RADIUS + DISC_SIZE - 3;
const coinYOffset = DISC_SIZE - 5.7;
const styles = ['transparent', 'red', 'yellow'] as const;

// const ROW_COUNT = 6;
// const COLUMN_COUNT = 7;

export class Board {
	private _buffer: ArrayBuffer;

	private _board: Uint8Array[];

	private readonly _chips: Disc[];
	private readonly _images = new Array<ImageBitmap>(2);
	private readonly _positionsX: number[];
	private readonly _positionsY: number[];

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

		assetsManager
			.getImages(ImageAssets.BOARD_BACK, ImageAssets.BOARD_FRONT)
			.forEach((img, i) => (this._images[i] = img));

		this._positionsX = new Array<number>(columns).fill(0);
		this._positionsX.forEach((_, i, arr) => (arr[i] = coinXOffset + DISC_SIZE * i + GAP * i));

		this._positionsY = new Array<number>(rows).fill(0);
		this._positionsY.forEach((_, i, arr) => (arr[i] = coinYOffset + DISC_SIZE * i + GAP * i));
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

	get rows(): number {
		return this._board.length;
	}

	get columns(): number {
		return this._board[0]?.length ?? 0;
	}

	*[Symbol.iterator](): Generator<Uint8Array, void> {
		for (const row of this.board) {
			yield row;
		}
	}

	getEmptyRow(col: number) {
		for (let row = this._board.length - 1; row >= 0; --row) {
			if (this._board[row][col] === Cell.EMPTY) return row;
		}

		// for (let row = 0; row < this._board.length; ++row) {
		// 	if (this._board[row][col] === Cell.EMPTY) return row;
		// }
	}

	drawBack(ctx: CanvasRenderingContext2D) {
		ctx.drawImage(this._images[0], 32, 4, this._images[0].width, this._images[0].height);
		// , width * 0.9167, height * 0.9
	}

	drawFront(ctx: CanvasRenderingContext2D) {
		ctx.drawImage(this._images[1], 0, 0, this._images[1].width, this._images[1].height);
	}

	draw(ctx: CanvasRenderingContext2D) {
		this._board
			// .slice()
			// .reverse()
			.forEach((row, i) => {
				row.forEach((cell, j) => {
					this._chips[cell].draw(ctx, this._positionsX[j], this._positionsY[i]);
				});
			});
	}
}

interface Coin {
	px: number;
	py: number;
	fillStyle: string;
}

function drawCoin(ctx: CanvasRenderingContext2D, coin: Coin) {
	const { px, py, fillStyle } = coin;
	ctx.fillStyle = fillStyle;
	ctx.beginPath();
	ctx.arc(px, py, DISC_RADIUS, 0, 2 * Math.PI);
	ctx.fill();
}
