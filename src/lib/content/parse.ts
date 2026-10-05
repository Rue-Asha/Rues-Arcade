import { MAX_TEXT, type ImportError } from './types.ts';

export interface ParsedBulk {
	rows: { a: string; b: string }[];
	skipped: number;
	errors: ImportError[];
}

export function pairError(a: string, b: string): string | null {
	if (!a || !b) return 'Beide Seiten brauchen Text.';
	if (a.length > MAX_TEXT || b.length > MAX_TEXT) return `Höchstens ${MAX_TEXT} Zeichen pro Seite.`;
	return null;
}

export function singleError(a: string): string | null {
	if (!a) return 'Der Eintrag braucht Text.';
	if (a.length > MAX_TEXT) return `Höchstens ${MAX_TEXT} Zeichen.`;
	return null;
}

export function parseBulk(text: string, single = false): ParsedBulk {
	const out: ParsedBulk = { rows: [], skipped: 0, errors: [] };
	text.split(/\r?\n/).forEach((raw, i) => {
		const line = i + 1;
		if (!raw.trim()) {
			out.skipped++;
			return;
		}
		if (single) {
			const a = raw.trim();
			const message = singleError(a);
			if (message) out.errors.push({ line, message });
			else out.rows.push({ a, b: '' });
			return;
		}
		const parts = raw.split('|');
		if (parts.length !== 2) {
			const message =
				parts.length < 2 ? 'Kein „|“ in der Zeile (Format: a | b).' : 'Mehr als ein „|“ in der Zeile.';
			out.errors.push({ line, message });
			return;
		}
		const [a, b] = parts.map((p) => p.trim());
		const message = pairError(a, b);
		if (message) out.errors.push({ line, message });
		else out.rows.push({ a, b });
	});
	return out;
}
