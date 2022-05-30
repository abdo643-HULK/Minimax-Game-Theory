import { EMPTY_CELL } from './entities';

interface NumberIter extends ArrayLike<number>, Iterable<number> {
	entries(): IterableIterator<[number, number]>;
}

interface Board extends ArrayLike<NumberIter>, Iterable<NumberIter> {
	entries(): IterableIterator<[number, NumberIter]>;
}

export function minimax(board: Board, depth: number, isMax: boolean) {
	switch (isMax) {
		case true: {
			let best = -1000;

			for (const [i, row] of board.entries()) {
				for (const [j, cell] of row.entries()) {
					if (cell !== EMPTY_CELL) continue;
					console.debug(findOpenRow(board, j));
					// const result = minimax(board, depth, false);
				}
			}

			return best;
		}
		case false: {
			let best = 1000;

			// const result = minimax(board, depth, true);

			// board.board.forEach((row, i) => {
			// 	console.log(row);
			// });

			return best;
		}
	}
}

function findOpenRow(board: Board, col: number) {
	for (const [i, row] of board.entries()) {
		if (row[col] === EMPTY_CELL) return i;
	}
}
