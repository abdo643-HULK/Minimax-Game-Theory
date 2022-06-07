import { Cell } from '../entities';

import type { IBoard } from '$lib/core';
import { getActions, result, type State } from './alphaBeta';

// two-player sequential games: ply is one turn taken by one of the players
// In computing: the concept of ply is important because one ply corresponds to one level of the game tree
// possible positions for 7x6: 4_531_985_219_092, https://tromp.github.io/c4/c4.html
// https://towardsdatascience.com/creating-the-perfect-connect-four-ai-bot-c165115557b0

/**
 * We will be showing this version first to show the shortcomings of the
 * algorithm without any heuristics.
 * Depth First Algorithm
 *
 * The effective branching factor of the tree is the average number of children of each node
 * (i.e., the average number of legal moves in a position)
 *
 * Question: Time Complexity?  Answer: O(b^d) b = branching factor, d = depth
 * Additional Question: Space Complexity?  Answer: O(b*m)
 */
export function minimax(state: State): number {
	const player = state.player;

	const checkIsTerminal = (state: State): boolean =>
		state.utility !== 0 || state.moves.length === 0;

	const evalFn = (state: State): number =>
		player === Cell.PLAYER ? state.utility : -state.utility;

	function maximizer(state: State): number {
		if (checkIsTerminal(state)) return evalFn(state);
		// let best = -Infinity;
		// for (const action of getActions(state)) {
		// 	best = Math.max(best, minimizer(result(state, action)));
		// }
		// return best;

		return getActions(state).reduce((prev, action) => {
			return Math.max(prev, minimizer(result(state, action)));
		}, -Infinity);
	}

	function minimizer(state: State): number {
		if (checkIsTerminal(state)) return evalFn(state);

		// let best = Infinity;
		// for (const action of getActions(state)) {
		// 	best = Math.min(best, maximizer(result(state, action)));
		// }
		// return best;

		return getActions(state).reduce((prev, action): number => {
			return Math.min(prev, maximizer(result(state, action)));
		}, Infinity);
	}

	return Math.max.apply(
		Math,
		getActions(state).map((action) => minimizer(result(state, action)))
	);
}
