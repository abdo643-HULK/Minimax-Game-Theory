export class WorkerEvent<T> {
	readonly type: string;
	readonly data: T | undefined;

	constructor(type: string, payload?: T) {
		this.type = type;
		this.data = payload;
	}
}
