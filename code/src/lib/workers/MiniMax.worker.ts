declare const self: DedicatedWorkerGlobalScope;

import { browser } from '$app/env';
import { minimax, alphaBeta, State, getValidLocations, Cell, result } from '$lib/core';

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

	const board = data.map((row) => [...row]);
	// state = new State(board, getValidLocations(board), state.utility, state.toMove);
	state.board = board;
	state = result(state, playerMove);
	console.time('alphaBeta');
	const move = alphaBeta(state, 7);
	console.timeEnd('alphaBeta');
	if (move) state = result(state, move);

	// console.time('minimax');
	// const move = minimax(state);
	// console.timeEnd('minimax');
	// if (move) state = result(state, move);

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
