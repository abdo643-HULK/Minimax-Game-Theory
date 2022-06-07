type ArrayLike = Uint8Array | Int8Array | Uint8ClampedArray | number[];

export type IBoard = ArrayLike[];

export * from './algorithms/alphaBeta';
export * from './algorithms/minimax';
export * from './getValidLocation';
export * from './entities';
