import type { Board } from '$lib/game/Board';

export function evaluate(board: Board): Number {
	for (const key of Array(5).keys()) {
		for (const value of Array(5).keys()) {
			console.log(key);
		}
	}

	return 0;
}
