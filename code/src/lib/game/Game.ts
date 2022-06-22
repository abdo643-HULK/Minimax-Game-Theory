import { tweened } from 'svelte/motion';
import { bounceOut } from 'svelte/easing';

import { Cell } from '$lib/core';
import { Player } from '$lib/game/Player';
import { WorkerEvent } from '$lib/workers';
import { assetsManager } from '$lib/game/AssetsManager';
import { Board, DISC_SIZE, DISC_X_OFFSET, DISC_Y_OFFSET, GAP } from '$lib/game/Board';

import MiniMax from '$lib/workers/MiniMax.worker?worker';

const ANIMATION_STEP = 5;

export class Game extends EventTarget {
	readonly ctx: CanvasRenderingContext2D;

	private _currentPlayer!: Player;

	readonly board: Board;
	readonly player: Player;
	readonly opponent: Player;
	readonly worker!: Worker;

	constructor(readonly canvas: HTMLCanvasElement) {
		super();

		this.ctx = canvas.getContext('2d')!!;

		this.board = new Board();
		this.player = new Player('PLAYER', Cell.PLAYER, DISC_X_OFFSET, DISC_Y_OFFSET);
		this.opponent = new Player('AI', Cell.OPPONENT, DISC_X_OFFSET, DISC_Y_OFFSET);
		this.worker = new MiniMax();
	}

	private getCurrentIndex(e: PointerEvent): number {
		// We need to know the position on the canvas itself and by subtracting the canavs left from the current position
		// we get the x position on the canvas itself
		const posX = e.clientX - this.canvas.getBoundingClientRect().left - DISC_SIZE;
		return Math.floor(posX / (DISC_SIZE + GAP - 3));
	}

	private clickHandler = async (e: MouseEvent): Promise<void> => {
		const { board } = this;

		const idx = this.getCurrentIndex(e as PointerEvent);
		if (!board.getPlayableColumns().includes(idx)) return;

		await this.dropAnimation();
		if (this.checkForWin(this._currentPlayer)) return;

		this.changePlayer();

		await this.dropAI();
		if (this.checkForWin(this._currentPlayer)) return;

		requestAnimationFrame(() => {
			this.changePlayer();
			this.reset(idx);
		});
	};

	private mouseMoveHandler = (e: MouseEvent): void => {
		const { board, _currentPlayer: currentPlayer } = this;

		const idx = this.getCurrentIndex(e as PointerEvent);
		if (!board.getPlayableColumns().includes(idx)) return;
		currentPlayer.pos = idx;
		this.draw();
	};

	private async dropAI() {
		const { move, data } = await this.calculateAIPosition(this.player.move);

		this.board.board = data;
		if (move === undefined) return;
		this._currentPlayer.pos = move[1];
		await this.dropAnimation();
	}

	private changePlayer() {
		this._currentPlayer = this._currentPlayer.name === 'PLAYER' ? this.opponent : this.player;
	}

	async dropAnimation() {
		const { canvas, _currentPlayer: currentPlayer } = this;

		canvas.style.pointerEvents = 'none';
		const colIndex = this._currentPlayer.pos;
		const rowIndex = this.board.getEmptyRow(colIndex);
		if (rowIndex === undefined) return;

		const stopPoint = createStopPoint(rowIndex);
		const animation = tweened(DISC_Y_OFFSET / stopPoint, {
			duration: 700,
			easing: bounceOut
		});

		animation.subscribe((v) => {
			currentPlayer.y = v * stopPoint;
			this.draw();
		});

		await animation.set(1);

		this.board.board[rowIndex][colIndex] = currentPlayer.cellType;
		this._currentPlayer.move = [rowIndex, colIndex];

		this.draw();
	}

	private checkForWin(player: Player) {
		const positions = this.board.checkForWin(player.move, player.cellType);
		if (positions === null) return false;
		this.stop(positions);
		return true;
	}

	private reset(col?: number) {
		const { canvas, board, _currentPlayer: currentPlayer } = this;

		canvas.style.pointerEvents = '';
		currentPlayer.resetY();

		const columns = board.getPlayableColumns();
		if (col) {
			currentPlayer.pos = columns.includes(col)
				? col
				: columns.reduce((prev, curr) => {
						return Math.abs(curr - col) < Math.abs(prev - col) ? curr : prev;
				  }, 0);
		}

		this.draw();
	}

	private calculateAIPosition(move: [number, number] | undefined) {
		dipatchWorkerEvent(
			this.worker,
			new WorkerEvent('calculate', { move, board: this.board.workerData() }),
			this.board.buffer
		);

		return getFromWorker<{ move: Move; data: Uint8Array[] }>(this.worker);
	}

	private draw() {
		const { ctx, canvas, board, _currentPlayer: currentPlayer } = this;

		ctx.clearRect(0, 0, canvas.width, canvas.height);

		board.drawBack(ctx);
		board.draw(ctx);
		currentPlayer.draw(ctx);
		board.drawFront(ctx);
	}

	async load(): Promise<this> {
		await assetsManager.loadAssets();
		return this;
	}

	async start(): Promise<this> {
		const { worker, board, canvas } = this;

		board.clear();
		dipatchWorkerEvent(worker, new WorkerEvent('init', board.workerData()), board.transferable);
		this.board.board = await getFromWorker(worker);

		this._currentPlayer = this.player;
		this.reset();
		// We need this arrow function because of how JS `this` works
		canvas.addEventListener('mousemove', this.mouseMoveHandler);
		canvas.addEventListener('click', this.clickHandler);

		this.draw();

		return this;
	}

	stop(winPositions: Move[] = []) {
		this.canvas.removeEventListener('mousemove', this.mouseMoveHandler);
		this.canvas.removeEventListener('click', this.clickHandler);

		winPositions.sort(([x1, y1], [x2, y2]) => (x1 === x2 ? y1 - y2 : x1 - x2));

		const { positionsX, positionsY } = this.board;
		const [rowStart = 0, colStart = 0] = winPositions[0] ?? [];
		const [rowEnd = 0, colEnd = 0] = winPositions[winPositions.length - 1] ?? [];

		const gradient = this.ctx.createLinearGradient(
			positionsX[colStart],
			positionsY[rowStart],
			positionsX[colEnd],
			positionsY[rowEnd]
		);
		gradient.addColorStop(0, 'green');
		gradient.addColorStop(0.5, 'cyan');
		gradient.addColorStop(1, 'green');

		const deltaX =
			colStart === colEnd ? 0 : colEnd > colStart ? ANIMATION_STEP : -ANIMATION_STEP;
		const deltaY = rowStart === rowEnd ? 0 : ANIMATION_STEP;
		const endX = colEnd > colStart ? positionsX[colEnd] : positionsX[colStart];
		const endY = positionsY[rowEnd];
		const evalFn =
			colEnd > colStart
				? () => currentXPos >= endX && currentYPos >= endY
				: () => currentXPos <= endX && currentYPos >= endY;

		let currentXPos = positionsX[colStart];
		let currentYPos = positionsY[rowStart];

		this.ctx.beginPath();
		this.ctx.moveTo(currentXPos, currentYPos);
		this.ctx.lineWidth = 10;
		this.ctx.lineCap = 'round';
		this.ctx.strokeStyle = gradient;

		let done = false;
		const animate = () => {
			currentXPos += deltaX;
			currentYPos += deltaY;

			this.ctx.lineTo(currentXPos, currentYPos);
			this.ctx.stroke();

			if (evalFn()) {
				this.ctx.closePath();
				done = true;
			}

			if (!done) requestAnimationFrame(animate);
		};

		animate();

		this.dispatchEvent(
			new CustomEvent('gameover', {
				detail: winPositions.length > 4 ? this._currentPlayer : null
			})
		);
	}
}

function dipatchWorkerEvent<T>(
	worker: Worker,
	event: WorkerEvent<T>,
	...transfarable: Transferable[]
) {
	worker.postMessage(event, transfarable);
}

function getFromWorker<T = any>(worker: Worker) {
	return new Promise<T>((res, rej) => {
		worker.addEventListener('message', receiver);
		worker.addEventListener('error', errHandler);
		worker.addEventListener('messageerror', errHandler);

		function errHandler(e: ErrorEvent | MessageEvent) {
			worker.removeEventListener('error', errHandler);
			rej(e);
		}
		function receiver(e: MessageEvent<T>) {
			worker.removeEventListener('message', receiver);
			res(e.data);
		}
	});
}

function createStopPoint(rowIndex: number) {
	return DISC_Y_OFFSET + DISC_SIZE * rowIndex + GAP * rowIndex;
}
