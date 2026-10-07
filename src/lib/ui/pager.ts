export const PAGE = { narrow: 6, wide: 12, query: '(min-width: 1024px)' } as const;

export function pageCount(total: number, size: number): number {
	return Math.max(1, Math.ceil(total / size));
}

export function clampPage(page: number, total: number, size: number): number {
	return Math.min(Math.max(page, 0), pageCount(total, size) - 1);
}

export function pageItems<T>(list: T[], page: number, size: number): T[] {
	const current = clampPage(page, list.length, size);
	return list.slice(current * size, (current + 1) * size);
}

export function pageOf(index: number, size: number): number {
	return Math.floor(index / size);
}
