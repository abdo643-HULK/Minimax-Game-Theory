export class WorkerEvent<T> {
	type: string;
	data: T | undefined;

	constructor(type: string, data?: T) {
		this.type = type;
		this.data = data;
	}
}
