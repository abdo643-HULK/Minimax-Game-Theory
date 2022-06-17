import { getPlayableColumns, getPlayableRow, getValidLocations } from '../getValidLocation';

import { Cell } from '../entities';
import { checkForWin, winningMove } from '../checkForWin';

import type { IBoard } from '$lib/core';

type Utility = 1 | 0 | -1;

export class State {
	board: IBoard;
	readonly moves: Move[];
	readonly utility: Utility;
	readonly player: Cell.PLAYER | Cell.OPPONENT;

	constructor(
		board: IBoard,
		moves: Move[],
		utility: Utility,
		player: Cell.PLAYER | Cell.OPPONENT
	) {
		this.board = board;
		this.moves = moves;
		this.utility = utility;
		this.player = player;
	}
}

/**
 * Time Complexity: O(b^(d/2)) This means, within the same amount of time,
 * alpha-beta pruning search can search twice as deeply
 *
 * Additional Question: Space Complexity?  Answer: O(b*d)
 * @param state
 * @param depth
 * @returns
 */
export function alphaBeta(
	state: State,
	depth: number
	// alpha: number = -Infinity,
	// beta: number = Infinity
): Move | undefined {
	return alphaBetaBook(state, depth);
	// return alphaBetaArticle(board, depth) as unknown as Move;
}

function alphaBetaBook(state: State, depth: number) {
	function checkIsTerminal(state: State, currentDepth: number): boolean {
		return currentDepth > depth || state.utility !== 0 || state.moves.length === 0;
	}

	const { player } = state;

	function evalFn(state: State): number {
		// Because our AI is always Cell.OPPONENT we can just return -state.utility
		return -state.utility;
		// return player === Cell.PLAYER ? state.utility : -state.utility;
	}

	function maximizer(state: State, depth: number, alpha: number, beta: number): number {
		if (checkIsTerminal(state, depth)) return evalFn(state);

		let best = -Infinity;
		const { board } = state;

		for (const move of getActions(state)) {
			const [row, col] = move;

			// board[row][col] = Cell.OPPONENT;
			// const newMoves = moves.slice();
			// newMoves.splice(moves.indexOf(move), 1);
			// const utility = checkForWin(state.board, move, Cell.OPPONENT);
			// const nextState = new State(board, newMoves, utility[0] ? -1 : 0);

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

			// board[row][col] = Cell.PLAYER;
			// const newMoves = moves.slice();
			// newMoves.splice(i, 1);
			// const utility = checkForWin(state.board, move, Cell.PLAYER);
			// const nextState = new State(board, newMoves, utility[0] ? 1 : 0);

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

		// const boardCopy = board.map((row) => row.slice()) as IBoard;
		// board[row][col] = Cell.OPPONENT;
		// const newMoves = moves.slice();
		// newMoves.splice(i, 1);
		// const utility = checkForWin(board, move, Cell.OPPONENT);
		// const state = new State(board, newMoves, utility[0] ? -1 : 0);
		const value = minimizer(result(state, move), 1, best, Infinity);
		board[row][col] = Cell.EMPTY;

		if (value > best) {
			best = value;
			bestMove = move;
		}
	}

	return bestMove;
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

/**************************************************/
/**************************************************/
/***************** MEDIUM ARTICLE *****************/
/**************************************************/
/**************************************************/
function alphaBetaArticle(board: IBoard, depth: number) {
	function checkIsTerminal(board: IBoard, currentDepth: number): [boolean, number] {
		if (currentDepth === 0) return [true, 0];
		if (winningMove(board, Cell.PLAYER)) return [true, 1];
		if (winningMove(board, Cell.OPPONENT)) return [true, -1];
		if (getPlayableColumns(board).length === 0) return [true, 0];

		return [false, 0];
	}

	function maximizer(
		board: IBoard,
		depth: number,
		alpha: number,
		beta: number
	): [number | undefined, number] {
		const [isTerminal, value] = checkIsTerminal(board, depth);
		if (isTerminal) return [undefined, value];
		let best = -Infinity;
		let column: number | undefined = undefined;
		for (const col of getPlayableColumns(board)) {
			const row = getPlayableRow(board, col)!!;
			board[row][col] = Cell.OPPONENT;
			// best = Math.max(best, minimizer(board, depth - 1, alpha, beta));
			const result = minimizer(board, depth - 1, alpha, beta)[1];
			board[row][col] = Cell.EMPTY;
			if (result > best) {
				best = result;
				column = col;
			}
			alpha = Math.max(alpha, best);
			if (alpha >= beta) break;
		}

		return [column, best];
	}

	function minimizer(
		board: IBoard,
		depth: number,
		alpha: number,
		beta: number
	): [number | undefined, number] {
		const [isTerminal, value] = checkIsTerminal(board, depth);
		if (isTerminal) return [undefined, value];

		let best = Infinity;
		let column: number | undefined = undefined;
		for (const col of getPlayableColumns(board)) {
			const row = getPlayableRow(board, col)!!;

			board[row][col] = Cell.PLAYER;
			// best = Math.min(best, maximizer(board, depth - 1, alpha, beta));
			const result = maximizer(board, depth - 1, alpha, beta)[1];
			board[row][col] = Cell.EMPTY;
			if (result < best) {
				best = result;
				column = col;
			}
			beta = Math.min(beta, best);
			if (alpha >= beta) break;
		}

		return [column, best];
	}

	// let best = -Infinity;
	// let bestMove: Move | undefined = undefined;
	// for (const col of getPlayableColumns(board)) {
	// 	const row = getPlayableRow(board, col)!!;
	// 	console.debug(row, col);

	// 	board[row][col] = Cell.OPPONENT;
	// 	const result = minimizer(board, depth - 1, best, Infinity)[1];
	// 	board[row][col] = Cell.EMPTY;

	// 	if (result > best) {
	// 		best = result;
	// 		bestMove = [row, col];
	// 	}
	// }
	return maximizer(board, depth, -Infinity, Infinity);
}
