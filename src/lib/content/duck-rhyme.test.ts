import { describe, expect, it } from 'vitest';
import { rhymeKey, syllables } from './duck-rhyme.ts';

describe('duck rhyme heuristic', () => {
	it('Scenario: Rhyme and syllable heuristic recognises known cases', () => {
		for (const [a, b] of [
			['Katze', 'Tatze'],
			['Gedicht', 'Licht'],
			['Zeitung', 'Leitung'],
			['Haustür', 'Gebühr'],
			['Bär', 'Meer'],
			['Regen', 'Segen']
		]) {
			expect(rhymeKey(a), `${a} / ${b}`).toBe(rhymeKey(b));
		}
		expect(rhymeKey('Katze')).not.toBe(rhymeKey('Mauer'));
		expect(syllables('Haus')).toBe(1);
		expect(syllables('Ei')).toBe(1);
		expect(syllables('Haustür')).toBe(2);
		expect(syllables('Känguru')).toBe(3);
	});

	it('counts a diphthong before a schwa as two syllables', () => {
		expect(syllables('Mauer')).toBe(2);
		expect(syllables('Feuer')).toBe(2);
		expect(syllables('Quark')).toBe(1);
	});

	it('folds spellings of the same sound', () => {
		expect(rhymeKey('Saite')).toBe(rhymeKey('Seite'));
		expect(rhymeKey('Igel')).toBe(rhymeKey('Spiegel'));
		expect(rhymeKey('Hexe')).toBe(rhymeKey('Echse'));
		expect(rhymeKey('Kehle')).toBe(rhymeKey('Seele'));
		expect(rhymeKey('Mauer')).toBe(rhymeKey('sauer'));
		expect(rhymeKey('Gabel')).not.toBe(rhymeKey('Nebel'));
	});
});
