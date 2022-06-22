import { getPlayableColumns, getPlayableRow, getValidLocations } from '../getValidLocation';

import { State } from '../State';
import { Cell } from '../entities';
import { getActions } from '../getActions';
import { checkForWin, winningMove } from '../checkForWin';

import type { IBoard } from '$lib/core';

export function alphaBeta(state: State, depth: number): Move | undefined {
	return undefined;
}

function computeUtility(board: IBoard, move: Move, player: Cell.PLAYER | Cell.OPPONENT) {
	if (checkForWin(board, move, player) !== null) return player === Cell.PLAYER ? 1 : -1;
	return 0;
}

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
