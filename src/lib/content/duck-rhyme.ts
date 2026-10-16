// Stress can't be read from spelling, so both helpers approximate: syllables are vowel groups, and a rhyme
// key runs from the last vowel group to the end, reaching back one group when the last syllable is a schwa
// (-e, -el, -en, -er), since the stress then sits on the syllable before.

const UNIT = /äu|ei|ai|au|eu|ie|aa|ee|oo|[aeiouäöüy]/g;
const SCHWA_TAIL = ['', 'l', 'n', 'r'];
const SAME_VOWEL: Record<string, string> = {
	ä: 'e',
	äu: 'eu',
	ai: 'ei',
	ie: 'i',
	aa: 'a',
	ee: 'e',
	oo: 'o',
	y: 'i'
};

function split(word: string): { vowels: string[]; gaps: string[] } {
	const s = word.toLocaleLowerCase('de').replace(/qu/g, 'kw');
	const vowels: string[] = [];
	const gaps: string[] = [];
	let at = 0;
	for (const m of s.matchAll(UNIT)) {
		gaps.push(s.slice(at, m.index));
		vowels.push(m[0]);
		at = m.index + m[0].length;
	}
	gaps.push(s.slice(at));
	return { vowels, gaps };
}

export function syllables(word: string): number {
	return split(word).vowels.length;
}

export function rhymeKey(word: string): string {
	const { vowels, gaps } = split(word);
	if (!vowels.length) return word.toLocaleLowerCase('de');
	const v = vowels.map((u) => SAME_VOWEL[u] ?? u);
	const g = gaps.map((c, i) => {
		const last = i === gaps.length - 1;
		let out = c.replace(/chs|cks|ks/g, 'x').replace(/ph/g, 'f').replace(/tz|zz|z/g, 'ts');
		// a silent lengthening h (Gebühr, Kuh), but not the spoken one between two vowels (Ehe)
		if (i > 0 && out.startsWith('h') && (last || out.length > 1)) out = out.slice(1);
		if (last) {
			out = out.replace(/dt$/, 't').replace(/d$/, 't').replace(/b$/, 'p');
			out = out.replace(/(?<!n)g$/, v.at(-1) === 'i' ? 'ch' : 'k');
		}
		return out;
	});
	let from = v.length - 1;
	if (from > 0 && vowels[from] === 'e' && SCHWA_TAIL.includes(g[g.length - 1])) from--;
	let key = '';
	for (let i = from; i < v.length; i++) key += v[i] + g[i + 1];
	return key;
}
