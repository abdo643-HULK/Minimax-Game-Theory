import { Cell } from '.';
import { checkForWin } from './checkForWin';

import type { IBoard } from '.';

export function computeUtility(board: IBoard, move: Move, player: Cell.PLAYER | Cell.OPPONENT) {
	if (checkForWin(board, move, player) !== null) return player === Cell.PLAYER ? 1 : -1;
	return 0;
}
