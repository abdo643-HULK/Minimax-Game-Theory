declare module '*.worker.ts' {
	// note how you load the file vs how file is loaded in the example
	declare const self: DedicatedWorkerGlobalScope;
}

interface Message<T = any> {
	type: string;
	data: T;
}

type InitEvent = CustomEvent<Uint8Array[]>;

type CalculateEvent = CustomEvent<{ move: [number, number]; board: Uint8Array[] }>;

interface DedicatedWorkerGlobalScopeEventMap {
	calculate: CalculateEvent;
	init: InitEvent;
}
