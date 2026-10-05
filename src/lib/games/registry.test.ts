import { describe, expect, it } from 'vitest';
import { comingSoon, games, playerRange } from './registry.ts';

describe('registry', () => {
	it('Scenario: Player range derived from engine limits', () => {
		for (const { def } of games)
			expect(playerRange(def)).toBe(`${def.minPlayers}–${def.maxPlayers} Spieler`);

		const imposter = games.find((g) => g.def.slug === 'imposter')!;
		expect(playerRange(imposter.def)).toBe('3–12 Spieler');
	});

	it('lists the five locked games and unique slugs', () => {
		expect(comingSoon).toEqual(['Duck', 'Family Feud', 'Codes', 'Most Likely To', 'Charade']);
		const slugs = games.map((g) => g.def.slug);
		expect(new Set(slugs).size).toBe(slugs.length);
	});
});
