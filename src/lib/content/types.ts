export type ContentType = 'imposter_pairs' | 'wavelength_spectra';

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
