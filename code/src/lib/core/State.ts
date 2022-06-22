import type { IBoard } from '$lib/core';
import type { Cell } from '$lib/core/entities';

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
