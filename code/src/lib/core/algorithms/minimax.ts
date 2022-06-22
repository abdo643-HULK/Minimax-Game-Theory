import { Cell } from '../entities';
import { getActions } from '../getActions';
import { result } from '../result';

import type { State } from '../State';

// two-player sequential games: ply is one turn taken by one of the players
// In computing: the concept of ply is important because one ply corresponds to one level of the game tree
// possible positions for 7x6: 4_531_985_219_092, https://tromp.github.io/c4/c4.html
// https://towardsdatascience.com/creating-the-perfect-connect-four-ai-bot-c165115557b0

export function minimax(state: State, depth = Infinity): Move | undefined {
	const player = state.player;

	function checkIsTerminal(state: State, currentDepth: number): boolean {
		return currentDepth === 0 || state.utility !== 0 || state.moves.length === 0;
	}

	function evalFn(state: State): number {
		return player === Cell.PLAYER ? state.utility : -state.utility;
	}

	function maximizer(state: State, depth: number) {
		let best = -Infinity;
		if (checkIsTerminal(state, depth)) return evalFn(state);

		for (const action of getActions(state)) {
			const [row, col] = action;
			best = Math.max(best, minimizer(result(state, action), depth - 1));
			state.board[row][col] = Cell.EMPTY;
		}

		return best;
	}

	function minimizer(state: State, depth: number): number {
		let best = Infinity;
		if (checkIsTerminal(state, depth)) return evalFn(state);

		for (const action of getActions(state)) {
			const [row, col] = action;
			best = Math.min(best, maximizer(result(state, action), depth - 1));
			state.board[row][col] = Cell.EMPTY;
		}

		return best;
	}

	let best = Infinity;
	let bestMove: Move | undefined = undefined;

	for (const move of getActions(state)) {
		const [row, col] = move;
		const value = minimizer(result(state, move), depth - 1);
		state.board[row][col] = Cell.EMPTY;

		if (value > best) {
			best = value;
			bestMove = move;
		}
	}

	return bestMove;
}
