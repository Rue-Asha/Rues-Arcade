export type ContentType =
	| 'imposter_pairs'
	| 'wavelength_spectra'
	| 'codes_words'
	| 'duck_words'
	| 'most_likely_prompts';

const singles: ContentType[] = ['codes_words', 'duck_words', 'most_likely_prompts'];

export function isSingle(type: ContentType): boolean {
	return singles.includes(type);
}

export interface ContentItem {
	id: number;
	a: string;
	b: string;
}

export const MAX_TEXT = 200;

export interface ImportError {
	line: number;
	message: string;
}

export interface ImportReport {
	imported: number;
	duplicates: number;
	skipped: number;
	errors: ImportError[];
}
