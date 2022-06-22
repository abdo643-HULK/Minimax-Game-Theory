import { Cell } from '../entities';

import type { State } from '../State';

// two-player sequential games: ply is one turn taken by one of the players
// In computing: the concept of ply is important because one ply corresponds to one level of the game tree
// possible positions for 7x6: 4_531_985_219_092, https://tromp.github.io/c4/c4.html
// https://towardsdatascience.com/creating-the-perfect-connect-four-ai-bot-c165115557b0

export function minimax(state: State, depth = Infinity): Move | undefined {
	return undefined;
}
