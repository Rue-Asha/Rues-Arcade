import type { ImportError } from './types';

export interface ParsedBulk {
	rows: { a: string; b: string }[];
	skipped: number;
	errors: ImportError[];
}

export function parseBulk(text: string): ParsedBulk {
	void text;
	throw new Error('not implemented');
}
