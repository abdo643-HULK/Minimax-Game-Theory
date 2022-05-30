declare module '*.worker.ts' {
	// note how you load the file vs how file is loaded in the example
	declare const self: DedicatedWorkerGlobalScope;
}

interface Message<T = any> {
	type: string;
	data: T;
}

type CalculateEvent = CustomEvent<Uint8Array[]>;

interface DedicatedWorkerGlobalScopeEventMap {
	calculate: CalculateEvent;
}
