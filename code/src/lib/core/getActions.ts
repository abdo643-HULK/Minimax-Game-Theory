import { Cell } from './entities';

import type { State } from './State';

export function getActions(state: State) {
	const actions = [];
	for (const move of state.moves) {
		const [row, col] = move;

		if (
			row === state.board.length - 1 ||
			(row + 1 < state.board.length && state.board[row + 1][col] !== Cell.EMPTY)
		) {
			actions.push(move);
		}
	}

	return actions;
}
