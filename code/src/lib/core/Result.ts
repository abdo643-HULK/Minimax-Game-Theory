import { State } from '$lib/core/State';
import { Cell } from '$lib/core/entities';
import { computeUtility } from '$lib/core/computeUtility';

export function result(state: State, move: Move) {
	const { board, player: toMove } = state;
	const [row, col] = move;

	board[row][col] = state.player;
	const moves = state.moves.filter(([row, col]) => !(row === move[0] && col === move[1]));

	return new State(
		board,
		moves,
		computeUtility(board, move, state.player),
		toMove === Cell.PLAYER ? Cell.OPPONENT : Cell.PLAYER
	);
}
