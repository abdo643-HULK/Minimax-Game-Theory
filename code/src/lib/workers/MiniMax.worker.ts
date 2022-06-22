declare const self: DedicatedWorkerGlobalScope;

import { browser } from '$app/env';
import { Cell, State, minimax, getValidLocations, result, alphaBeta } from '$lib/core';

if (browser) {
	self.addEventListener('init', init);
	self.addEventListener('message', messageHandler);
	self.addEventListener('calculate', calculateHandler);
	self.addEventListener('close', closeHandler);
}

function messageHandler(e: MessageEvent<Message>) {
	const { type, data } = e.data;
	// browser extension have a source while direct messages don't
	if (e.source !== null) return;

	self.dispatchEvent(new CustomEvent(type, { detail: data }));
}

let state: State;

function init(e: InitEvent) {
	const board = e.detail;
	state = new State([], getValidLocations(board), 0, Cell.PLAYER);
	self.postMessage(board, [board[0].buffer]);
}

function calculateHandler(e: CalculateEvent) {
	const { move: playerMove, board: data } = e.detail;

	// const board = data.map((row) => [...row]);
	state.board = data;
	if (playerMove !== undefined) state = result(state, playerMove);

	const alphaBetaStart = performance.now();
	const move = alphaBeta(state, 7);
	const alphaBetaEnd = performance.now();
	const alphaBetaDur = alphaBetaEnd - alphaBetaStart;
	console.debug('AlphaBeta', move, `${alphaBetaDur}ms`);

	// const minimaxStart = performance.now();
	// const minimaxMove = minimax(state, 7);
	// const minimaxEnd = performance.now();
	// const minimaxDur = minimaxEnd - minimaxStart;
	// console.debug('Minimax', minimaxMove, `${minimaxDur}ms`);
	// console.debug('Difference', minimaxDur / alphaBetaDur);

	console.debug('------------------------------------------------------');

	if (move) {
		state = result(state, move);
		// We need to remove the bestmove because we
		// want to animate the drop to position
		data[move[0]][move[1]] = Cell.EMPTY;
	}

	self.postMessage({ move, data }, [data[0].buffer]);
}

function closeHandler(e: Event) {
	console.debug('Worker closing');
	self.removeEventListener('init', init);
	self.removeEventListener('message', messageHandler);
	self.removeEventListener('calculate', calculateHandler);
	self.removeEventListener('close', closeHandler);
	self.close();
}

function randomIntFromInterval(min: number, max: number) {
	// min and max included
	return Math.floor(Math.random() * (max - min + 1) + min);
}
