type ArrayLike = Uint8Array | Int8Array | Uint8ClampedArray | number[];

export type IBoard = ArrayLike[];

export * from './State';
export * from './result';
export * from './entities';
export * from './checkForWin';
export * from './getValidLocation';
export * from './algorithms/alphaBeta';
export * from './algorithms/minimax';
