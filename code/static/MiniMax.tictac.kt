import kotlin.math.max
import kotlin.math.min

data class Move(
	var row: Int,
	var col: Int,
)

const val PLAYER = 'X'
const val OPPONENT = 'O'
const val EMPTY_CELL = ' '

fun isMovesLeft(board: Array<Array<Char>>): Boolean {
	for (i in 0 until 3) {
		for (j in 0 until 3) {
			if (board[i][j] == EMPTY_CELL)
				return true
		}
	}
	return false
}

fun evaluate(board: Array<Array<Char>>): Int {
	// Checking for Rows for X or O victory.
	board.forEach {
		if (it[0] == it[1] && it[1] == it[2]) {
			return when (it[0]) {
				PLAYER -> 10
				OPPONENT -> -10
				else -> 0
			}
		}
	}

	// Checking for Columns for X or O victory.
	board.forEachIndexed { i, _ ->
		if (board[0][i] == board[1][i] && board[1][i] == board[2][i]) {
			return when (board[0][i]) {
				PLAYER -> 10
				OPPONENT -> -10
				else -> 0
			}
		}
	}

	// Checking for Diagonals for X or O victory.
	if (board[0][0] == board[1][1] && board[1][1] == board[2][2]) {
		return when (board[0][0]) {
			PLAYER -> 10
			OPPONENT -> -10
			else -> 0
		}
	}

	if (board[0][2] == board[1][1] && board[1][1] == board[2][0]) {
		return when (board[0][2]) {
			PLAYER -> 10
			OPPONENT -> -10
			else -> 0
		}
	}

	// Else if none of them have won then return 0
	return 0
}

fun minimax(board: Array<Array<Char>>, depth: UInt, isMax: Boolean): Int {
	when (val score = evaluate(board)) {
		// If Maximizer/Minimizer has won the game
		// return his/her evaluated score
		10, -10 -> return score
	}

	// If there are no more moves and
	// no winner then it is a tie
	if (!isMovesLeft(board)) return 0


	return when (isMax) {
		// If this maximizer's move
		true -> {
			var best = -1000

			board.forEachIndexed { i, row ->
				row.forEachIndexed { j, cell ->
					if (cell != EMPTY_CELL) return@forEachIndexed
					// Make the move
					board[i][j] = PLAYER
					// Call minimax recursively and choose
					// the maximum value
					best = max(best, minimax(board, depth + 1u, false))
					// Undo the move
					board[i][j] = EMPTY_CELL
				}
			}

			best
		}
		// If this minimizer's move
		false -> {
			var best = 1000

			board.forEachIndexed { i, row ->
				row.forEachIndexed { j, cell ->
					if (cell != EMPTY_CELL) return@forEachIndexed
					// Make the move
					board[i][j] = OPPONENT
					// Call minimax recursively and choose
					// the minimum value
					best = min(best, minimax(board, depth + 1u, true))
					// Undo the move
					board[i][j] = EMPTY_CELL
				}
			}

			best
		}
	}
}

fun findBestMove(board: Array<Array<Char>>): Move {
	var bestVal = -1000
	val bestMove = Move(-1, -1)

	for (i in 0 until 3) {
		for (j in 0 until 3) {
			if (board[i][j] != EMPTY_CELL) continue

			// Make the move
			board[i][j] = PLAYER

			// compute evaluation function for this
			// move.
			val moveVal = minimax(board, 6u, false)

			// Undo the move
			board[i][j] = EMPTY_CELL

			// If the value of the current move is
			// more than the best value, then update
			// best/
			if (moveVal > bestVal) {
				bestVal = moveVal
				bestMove.apply {
					row = i + 1
					col = j + 1
				}
			}
		}
	}

	return bestMove
}

fun main() {
	val board = arrayOf(
		arrayOf(PLAYER, OPPONENT, PLAYER),
		arrayOf(OPPONENT, OPPONENT, PLAYER),
		arrayOf(EMPTY_CELL, EMPTY_CELL, EMPTY_CELL),
	)

	val move = findBestMove(board)

	println("Best Move: $move")
}