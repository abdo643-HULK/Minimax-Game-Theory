import { EMPTY_CELL } from '$lib/core/entities';
import { ImageAssets, images } from '$lib/utils/assets';

const ROW_COUNT = 6;
const COLUMN_COUNT = 7;

const DISC_IMAGE_SIZE = 78;
const DISC_RADIUS = DISC_IMAGE_SIZE / 2;
const GAP = 13.8;

const styles = ['transparent', 'red', 'yellow'];

export class Board {
	private _board: Uint8Array[];
	private _images = new Array<HTMLImageElement>(2);

	constructor(rows = ROW_COUNT, columns = COLUMN_COUNT) {
		const cols = new Uint8Array(columns).fill(EMPTY_CELL);
		this._board = new Array<Uint8Array>(rows).fill(cols).map(() => cols.slice());

		[images[ImageAssets.BOARD_BACK], images[ImageAssets.BOARD_FRONT]].forEach((src, i) => {
			const img = new Image();
			img.src = src;
			img.decoding = 'async';
			this._images[i] = img;
		});
	}

	set board(board: Uint8Array[]) {
		this._board = board;
	}

	get board() {
		return this._board;
	}

	get rows() {
		return this._board.length;
	}

	get columns() {
		return this._board[0]?.length ?? 0;
	}

	*[Symbol.iterator]() {
		for (const row of this.board) {
			yield row;
		}
	}

	render(ctx: CanvasRenderingContext2D, width: number, height: number) {
		// draw the back of the image
		ctx.drawImage(this._images[0], 30, 4); // , width * 0.9167, height * 0.9

		const coinXOffset = DISC_RADIUS + DISC_IMAGE_SIZE - 3;
		const coinYOffset = DISC_IMAGE_SIZE - 5.7;

		this._board.forEach((row, i) => {
			row.forEach((cell, j) => {
				const px = coinXOffset + DISC_IMAGE_SIZE * j + GAP * j;
				const py = coinYOffset + DISC_IMAGE_SIZE * i + GAP * i;
				const fillStyle = styles[cell];

				setTimeout(() => {
					requestAnimationFrame(() => {
						drawCoin(ctx, { fillStyle, px, py });
						ctx.drawImage(this._images[1], 0, 0); // , width, height
					});
				}, (i + j) * 100);
			});
		});

		ctx.drawImage(this._images[1], 0, 0); // , width, height
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
