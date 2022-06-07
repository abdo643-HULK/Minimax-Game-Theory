<script lang="ts">
	import MiniMax from '$lib/workers/MiniMax.worker?worker';

	import { onMount } from 'svelte';
	import { tweened } from 'svelte/motion';
	import { bounceOut } from 'svelte/easing';

	import { Cell, getPlayableColumns, getPlayableRow, type IBoard } from '$lib/core';
	import { Disc } from '$lib/game/Disc';
	import { Game } from '$lib/game/Game';
	import { Player } from '$lib/game/Player';
	import { WorkerEvent } from '$lib/workers';
	import {
		Board,
		DISC_RADIUS,
		DISC_SIZE,
		DISC_X_OFFSET,
		DISC_Y_OFFSET,
		GAP
	} from '$lib/game/Board';
	import { sleep } from '$lib/utils';

	function dipatchWorkerEvent<T>(
		worker: Worker,
		event: WorkerEvent<T>,
		...transfarable: Transferable[]
	) {
		worker.postMessage(event, transfarable);
	}
	// https://github.com/LiteTJ/connect-four

	let canvas: HTMLCanvasElement;
	let game: Game;

	onMount(() => {
		bootGame().catch((_e) => console.error(_e));
	});

	async function bootGame() {
		game = new Game(canvas);
		await game.start();
		readyHandler();
	}

	function createStopPoint(rowIndex: number) {
		return DISC_Y_OFFSET + DISC_SIZE * rowIndex + GAP * rowIndex;
	}

	async function readyHandler() {
		const ctx = game.ctx;

		const player = new Player(DISC_X_OFFSET, DISC_Y_OFFSET, Cell.PLAYER);
		const opponent = new Player(DISC_X_OFFSET, DISC_Y_OFFSET, Cell.OPPONENT);

		const worker = new MiniMax();
		const board = new Board();

		dipatchWorkerEvent(worker, new WorkerEvent('init', board.board), board.buffer);
		board.board = await getFromWorker();

		draw(player);

		function draw(player: Player) {
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			board.drawBack(ctx);

			board.draw(ctx);

			player.draw(ctx);

			board.drawFront(ctx);
		}

		const isPlayerStarting = true; // Math.random() <= 0.5;

		let current: Player;
		let turn: 'player' | 'opponent';
		let currentCol: number;

		if (isPlayerStarting) {
			current = player;
			turn = 'player';
		} else {
			current = opponent;
			turn = 'opponent';
		}

		game.addEventListener('draw', (event) => {
			const { detail: idx } = event as CustomEvent<number>;
			if (!getPlayableColumns(board.board).includes(idx)) return;
			currentCol = current.playerPos = idx;
			draw(current);
		});

		async function dropAnimation(player: Player) {
			canvas.style.pointerEvents = 'none';
			const colIndex = player.playerPos;
			const rowIndex = board.getEmptyRow(colIndex);
			if (rowIndex === undefined) return;

			// const stopPoint = createStopPoint(board.rows - rowIndex - 1);
			const stopPoint = createStopPoint(rowIndex);
			const animation = tweened(DISC_Y_OFFSET / stopPoint, {
				duration: 700,
				easing: bounceOut
			});

			animation.subscribe((v) => {
				player.y = v * stopPoint;
				draw(player);
			});

			await animation.set(1);

			board.board[rowIndex][colIndex] = player.cellType;
			player.move = [rowIndex, colIndex];

			// player.move = [board.rows - rowIndex - 1, colIndex];
			draw(player);
		}

		function reset(player: Player) {
			canvas.style.pointerEvents = '';
			player.resetY();

			const columns = getPlayableColumns(board.board);
			player.playerPos = columns.includes(currentCol)
				? currentCol
				: columns.reduce((prev, curr) => {
						return Math.abs(curr - currentCol) < Math.abs(prev - currentCol)
							? curr
							: prev;
				  }, 0);

			draw(player);
		}

		game.addEventListener('drop', async (_) => {
			await dropAnimation(current);
			changePlayer();

			const { move, data } = await calculateAIPosition(player.move);

			board.board = data;
			if (move === undefined) return;
			current.playerPos = move[1];
			await dropAnimation(current);
			requestAnimationFrame(() => {
				changePlayer();
				reset(current);
			});
		});

		function changePlayer() {
			if (turn === 'opponent') {
				current = player;
				turn = 'player';
			} else {
				current = opponent;
				turn = 'opponent';
			}
		}

		function getFromWorker<T = any>() {
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

		function calculateAIPosition<T = any>(move: [number, number]) {
			dipatchWorkerEvent(
				worker,
				new WorkerEvent('calculate', { move, board: board.board }),
				board.buffer
			);
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
	}

	function playRandomSong() {
		const context = new AudioContext();
		const osc = context.createOscillator();
		osc.connect(context.destination);
		osc.start(setInterval((_) => (osc.frequency.value = 300 + Math.random() * 300), 192));
	}
</script>

<h1>Connect 4</h1>
<canvas width="780" height="650" bind:this={canvas} />

<style global>
	* {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}

	body {
		text-align: center;
		background-color: #cacaca;
		/* font-family: 'Fira Sans'; */
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial,
			sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
	}

	h1 {
		text-align: center;
		margin-block: 0.5em;
		font-size: 3em;
	}

	canvas {
		width: min(100%, 780px);
		height: auto;
		padding: 0 0.6em;
	}
</style>
