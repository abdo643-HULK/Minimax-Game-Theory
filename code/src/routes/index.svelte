<script lang="ts">
	import { onMount } from 'svelte';
	import { elasticOut } from 'svelte/easing';
	import { fly, type FlyParams } from 'svelte/transition';

	import { Game } from '$lib/game/Game';
	import type { Player } from '$lib/game/Player';

	type SpinParams = { duration: number };

	// https://github.com/LiteTJ/connect-four

	let canvas: HTMLCanvasElement;

	let game: Game;
	let isHidden = true;
	let gameOutput = '';

	let inAnimation: typeof spin | typeof fly;
	let inAnimationOptions: FlyParams & SpinParams;

	onMount(() => {
		bootGame().catch((_e) => console.error(_e));
		if (window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
			inAnimation = spin;
			inAnimationOptions = { duration: 1500 };
		} else {
			inAnimation = fly;
			inAnimationOptions = { y: -200, duration: 700 };
		}
	});

	async function bootGame() {
		game = await new Game(canvas).load();
		await game.start();
		game.addEventListener('gameover', gameOverHandler as EventListener);
	}

	function gameOverHandler(e: CustomEvent<Player | null>) {
		const winner = e.detail;
		isHidden = false;
		gameOutput = winner ? `Winner: ${winner.name}` : `Tie`;
	}

	function playAgain() {
		isHidden = true;
		game.start();
	}

	function spin(_: HTMLElement, { duration }: SpinParams) {
		return {
			duration,
			css: (t: number) => {
				const eased = elasticOut(t);
				return `
					transform: scale(${eased}) rotate(${eased * 1080}deg);
					color: hsl(
						${Math.trunc(t * 360)},
						${Math.min(100, 1000 - 1000 * t)}%,
						${Math.min(50, 500 - 500 * t)}%
					);`;
			}
		};
	}
</script>

<h1>Connect 4</h1>
<div>
	<canvas bind:this={canvas} id="game-canvas" width="780" height="650" />
	{#key !isHidden}
		<div
			class="result"
			in:inAnimation={inAnimationOptions}
			out:fly={{ y: -200, duration: 700 }}
		>
			<output for="game-canvas" hidden={isHidden}>{gameOutput}</output>
			<button hidden={isHidden} on:click={playAgain}>Play again</button>
		</div>
	{/key}
</div>

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

	div {
		position: relative;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	.result {
		position: absolute;
	}

	button {
		padding: 0.8em;
		border-radius: 0.8em;
		font-size: 1.2em;
		cursor: pointer;
	}

	output {
		font-size: 4em;
		font-weight: bold;
	}
</style>
