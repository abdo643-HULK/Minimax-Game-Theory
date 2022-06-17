export class Handle<T> {
	constructor(readonly id: string) {}
}

export class AssentsManager {
	private readonly resources: string[] = [];
	private readonly images = new Map<string, ImageBitmap>();

	async loadAssets(): Promise<void> {
		await this.loadImages();
	}

	async loadImages(): Promise<void> {
		await Promise.all(
			this.resources.map(async (src, i) => {
				const res = await fetch(src);
				const blob = await res.blob();
				const bitmap = await self.createImageBitmap(blob);
				this.images.set(src, bitmap);
			})
		);
	}

	load<T>(resource: string): Handle<T> {
		this.resources.push(resource);
		return new Handle(resource);
	}

	get<T>(handle: Handle<T>): T {
		return this.images.get(handle.id) as unknown as T;
	}

	getImage(handle: Handle<ImageBitmap>): ImageBitmap {
		return this.images.get(handle.id)!;
	}

	getImages(...ids: Handle<ImageBitmap>[]): ImageBitmap[] {
		return ids.map(({ id }) => this.images.get(id)!);
	}
}

export const assetsManager = new AssentsManager();
