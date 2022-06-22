import { Cell } from './entities';

import type { IBoard } from '$lib/core';

export function getValidLocations(board: IBoard): [number, number][] {
	const validLocations: [number, number][] = [];

	for (const [i, row] of board.entries()) {
		for (const [j, cell] of row.entries()) {
			if (cell === Cell.EMPTY) validLocations.push([i, j]);
		}
	}

	return validLocations;
}

/**
 * This function checks if a column is full if not we save it.
 * This allows for checking if the game is over or if a column has playable
 * rows
 *
 * @param board
 * @returns
 */
export function getPlayableColumns(board: IBoard): number[] {
	// const rowCnt = board.length;
	const columnCnt = board[0]?.length ?? 0;

	const validLocations: number[] = [];
	for (let i = 0; i < columnCnt; i++) {
		if (board[0][i] === Cell.EMPTY) {
			validLocations.push(i);
		}
	}

	return validLocations;
}

export function getPlayableRow(board: IBoard, col: number): number | undefined {
	for (let i = 0; i < board.length; i++) {
		if (board[i][col] === Cell.EMPTY) return i;
	}

	return undefined;
}
