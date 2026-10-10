export type ContentType =
	| 'imposter_pairs'
	| 'wavelength_spectra'
	| 'codes_words'
	| 'duck_words'
	| 'most_likely_prompts'
	| 'feud_surveys';

// every type stored as { id, a, b } rows; surveys have their own shape and table
export type ItemType = Exclude<ContentType, 'feud_surveys'>;

const singles: ContentType[] = ['codes_words', 'duck_words', 'most_likely_prompts'];

export function isSingle(type: ContentType): boolean {
	return singles.includes(type);
}

export function isSurvey(type: ContentType): type is 'feud_surveys' {
	return type === 'feud_surveys';
}

export interface SurveyAnswer {
	text: string;
	points: number;
}

// answers in entry order
export interface Survey {
	id: number;
	question: string;
	answers: SurveyAnswer[];
}

export const MIN_ANSWERS = 3;
export const MAX_ANSWERS = 8;
export const MAX_POINTS = 100;

export interface ContentItem {
	id: number;
	a: string;
	b: string;
	interchangeable?: boolean;
}

export interface PairPlayed {
	pairId: number;
	playerIds: number[];
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
