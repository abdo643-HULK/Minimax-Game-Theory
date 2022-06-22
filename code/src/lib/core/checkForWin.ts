import type { Cell } from './entities';
import type { IBoard } from '$lib/core';

// export const enum Player {
//     AI,
//     USER
// }

const WINNING_COUNT = 4;
export function checkForWin(
	board: IBoard,
	move: Move = [0, 0],
	playerType: Cell.PLAYER | Cell.OPPONENT
): Move[] | null {
	const winningPositions: Move[] = [];

	function checkLine(deltaXY: Readonly<Move>): boolean {
		let [deltaX, deltaY] = deltaXY;

		let n = 0;
		let [row, col] = move;
		while (board[row]?.[col] === playerType) {
			++n;
			winningPositions.push([row, col]);
			[row, col] = [row + deltaX, col + deltaY];
		}

		[row, col] = move;
		while (board[row]?.[col] === playerType) {
			++n;
			winningPositions.push([row, col]);
			[row, col] = [row - deltaX, col - deltaY];
		}

		--n; // Because we counted move itself twice

		return n >= WINNING_COUNT;
	}

	// these 4 funtions can run in parellel but for now we will run them in one Thread
	// because Workers have a really cumbersome API and this will appear in a recursive function where a
	// Worker Pool would be the best approach

	// checks for 4 in column
	if (checkLine([0, 1])) return winningPositions;
	winningPositions.splice(0);
	// checks for 4 in row
	if (checkLine([1, 0])) return winningPositions;
	winningPositions.splice(0);
	// checks for 4 in negative slope
	if (checkLine([1, -1])) return winningPositions;
	winningPositions.splice(0);
	// checks for 4 in positive slope
	if (checkLine([1, 1])) return winningPositions;

	return null;
}

export function winningMove(board: IBoard, playerType: Cell.PLAYER | Cell.OPPONENT) {
	for (let col = 0; col < board[0].length - 3; ++col) {
		for (const row of board) {
			if (
				row[col] === playerType &&
				row[col + 1] === playerType &&
				row[col + 2] === playerType &&
				row[col + 3] === playerType
			) {
				return true;
			}
		}
	}

	for (let col = 0; col < board[0].length; ++col) {
		for (let row = 0; col < board.length - 3; ++col) {
			if (
				board[row][col] === playerType &&
				board[row + 1][col] === playerType &&
				board[row + 2][col] === playerType &&
				board[row + 3][col] === playerType
			) {
				return true;
			}
		}
	}

	for (let col = 0; col < board[0].length - 3; ++col) {
		for (let row = 0; col < board.length - 3; ++col) {
			if (
				board[row][col] === playerType &&
				board[row + 1][col + 1] === playerType &&
				board[row + 2][col + 2] === playerType &&
				board[row + 3][col + 3] === playerType
			) {
				return true;
			}
		}
	}

	for (let col = 0; col < board[0].length - 3; ++col) {
		for (let row = 3; col < board.length; ++col) {
			if (
				board[row][col] === playerType &&
				board[row - 1][col + 1] === playerType &&
				board[row - 2][col + 2] === playerType &&
				board[row - 3][col + 3] === playerType
			) {
				return true;
			}
		}
	}

	return false;
}
