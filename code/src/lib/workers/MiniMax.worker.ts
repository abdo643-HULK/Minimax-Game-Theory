declare const self: DedicatedWorkerGlobalScope;

import { minimax } from '$lib/core/minimax';

import type { Board } from '$lib/game/Board';

self.addEventListener('message', (e) => {
	const { type, data } = e.data as Message;

	self.dispatchEvent(new CustomEvent(type, { detail: data }));
});

self.addEventListener('calculate', (e) => {
	const data = e.detail;

	data.slice(3).forEach((row, i) => {
		row.forEach((_, j) => {
			data[i + 3][j] = randomIntFromInterval(0, 2);
		});
	});

	minimax(data, 0, true);

	self.postMessage(
		data,
		data.map((row) => row.buffer)
	);
});

self.addEventListener('close', (e) => {
	console.debug('Worker closing');
	self.close();
});

function randomIntFromInterval(min: number, max: number) {
	// min and max included
	return Math.floor(Math.random() * (max - min + 1) + min);
}
