import { Cell } from '../entities';
import { result } from '../result';
import { getActions } from '../getActions';

import type { State } from '../State';

export function alphaBeta(state: State, depth: number): Move | undefined {
	function checkIsTerminal(state: State, currentDepth: number): boolean {
		return currentDepth > depth || state.utility !== 0 || state.moves.length === 0;
	}

	const { player } = state;

	function evalFn(state: State): number {
		return -state.utility;
		// return player === Cell.PLAYER ? state.utility : -state.utility;
	}

	function maximizer(state: State, depth: number, alpha: number, beta: number): number {
		if (checkIsTerminal(state, depth)) return evalFn(state);

		let best = -Infinity;
		const { board } = state;

		for (const move of getActions(state)) {
			const [row, col] = move;

			best = Math.max(best, minimizer(result(state, move), depth + 1, alpha, beta));
			board[row][col] = Cell.EMPTY;

			if (best >= beta) return best;
			alpha = Math.max(alpha, best);
		}

		return best;
	}

	function minimizer(state: State, depth: number, alpha: number, beta: number): number {
		if (checkIsTerminal(state, depth)) return evalFn(state);

		let best = Infinity;
		const { board } = state;

		for (const move of getActions(state)) {
			const [row, col] = move;

			best = Math.min(best, maximizer(result(state, move), depth + 1, alpha, beta));
			board[row][col] = Cell.EMPTY;

			if (best <= alpha) return best;
			beta = Math.min(beta, best);
		}

		return best;
	}

	const { board } = state;

	let best = -Infinity;
	let bestMove: Move | undefined = undefined;

	for (const move of getActions(state)) {
		const [row, col] = move;

		const value = minimizer(result(state, move), 1, best, Infinity);
		board[row][col] = Cell.EMPTY;

		if (value > best) {
			best = value;
			bestMove = move;
		}
	}

	return bestMove;
}
