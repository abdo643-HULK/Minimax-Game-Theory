<script lang="ts">
	import { onMount } from 'svelte';

	import { sleep } from '$lib/utils';
	import { Game } from '$lib/game/Game';
	import { Board } from '$lib/game/Board';

	import MiniMax from '$lib/workers/MiniMax.worker?worker';
	import { WorkerEvent } from '$lib/workers';

	let canvas: HTMLCanvasElement;
	let game: Game;

	onMount(() => {
		game = new Game(canvas);
		game.addEventListener('ready', readyHandler);
	});

	function readyHandler() {
		game.removeEventListener('ready', readyHandler);
		game.render();

		const worker = new MiniMax();
		const board = new Board();
		const ctx = canvas.getContext('2d')!!;

		board.render(ctx, canvas.width, canvas.height);
		// console.debug(canvas.clientWidth, canvas.clientHeight);

		worker.addEventListener('message', (e) => {
			board.board = e.data;
			board.render(ctx, canvas.width, canvas.height);
		});

		(async function () {
			worker.postMessage(
				new WorkerEvent('calculate', board.board),
				board.board.map((row) => row.buffer)
			);

			await sleep(2000);

			worker.postMessage(new WorkerEvent('close'));
		})();
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
