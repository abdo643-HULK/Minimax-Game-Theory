import { getPlayableColumns, getPlayableRow, getValidLocations } from '../getValidLocation';

import { State } from '../State';
import { Cell } from '../entities';
import { getActions } from '../getActions';
import { checkForWin, winningMove } from '../checkForWin';

import type { IBoard } from '$lib/core';

export function alphaBeta(state: State, depth: number): Move | undefined {
	return undefined;
}
