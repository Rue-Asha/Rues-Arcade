import { describe, expect, it } from 'vitest';
import { write } from '#lib/storage.ts';
import { comingSoon, games, loadGameSession, playerRange } from './registry.ts';
import { modeOf, wavelength as def, type WavelengthState } from './wavelength/engine.ts';

describe('registry', () => {
	it('Scenario: Player range derived from engine limits', () => {
		for (const { def } of games)
			expect(playerRange(def)).toBe(`${def.minPlayers}–${def.maxPlayers} Spieler`);

		const range = (slug: string) => playerRange(games.find((g) => g.def.slug === slug)!.def);
		expect(range('imposter')).toBe('3–12 Spieler');
		expect(range('codes')).toBe('4–20 Spieler');
		expect(range('duck')).toBe('4–16 Spieler');
		expect(range('most-likely')).toBe('3–20 Spieler');
		expect(range('family-feud')).toBe('4–20 Spieler');
	});

	it('Scenario: Wavelength player range reads 2–18', () => {
		const wavelength = games.find((g) => g.def.slug === 'wavelength')!;
		expect(playerRange(wavelength.def)).toBe('2–18 Spieler');
	});

	it('lists six games in order, one locked one and unique slugs', () => {
		expect(games.map((g) => g.def.slug)).toEqual([
			'imposter',
			'wavelength',
			'codes',
			'duck',
			'most-likely',
			'family-feud'
		]);
		expect(comingSoon).toEqual(['Charade']);
		const slugs = games.map((g) => g.def.slug);
		expect(new Set(slugs).size).toBe(slugs.length);
	});

	it('new games carry their contract: colour, content type, minContent 1, state version 1', () => {
		const contract = games.slice(2).map(({ def }) => ({
			slug: def.slug,
			name: def.name,
			colour: def.colour,
			contentType: def.contentType,
			minContent: def.minContent,
			stateVersion: def.stateVersion
		}));
		expect(contract).toEqual([
			{ slug: 'codes', name: 'Codes', colour: 'codes', contentType: 'codes_words', minContent: 1, stateVersion: 1 },
			{ slug: 'duck', name: 'What Rhymes with Duck', colour: 'duck', contentType: 'duck_words', minContent: 1, stateVersion: 1 },
			{
				slug: 'most-likely',
				name: 'Most Likely To',
				colour: 'most-likely',
				contentType: 'most_likely_prompts',
				minContent: 1,
				stateVersion: 1
			},
			{
				slug: 'family-feud',
				name: 'Family Feud',
				colour: 'feud',
				contentType: 'feud_surveys',
				minContent: 2,
				stateVersion: 1
			}
		]);
	});

	it('Family Feud is saved-only and the other games are not', () => {
		expect(games.filter((g) => g.savedOnly).map((g) => g.def.slug)).toEqual(['family-feud']);
		expect(games.find((g) => g.def.slug === 'family-feud')!.pitch).toBe(
			'Zwei Teams suchen die häufigsten Antworten einer Umfrage.'
		);
	});

	it('every demo starts from four players and fixture content', () => {
		for (const { def, demo } of games.slice(2)) {
			expect(demo.players, def.slug).toEqual(['Alex', 'Bo', 'Cleo', 'Dani']);
			expect(demo.content.length, def.slug).toBeGreaterThan(0);
			expect(loadGameSession(games.find((g) => g.def.slug === def.slug)!), def.slug).toBeNull();
		}
	});
});

// as saved before Koop existed: version 1, no mode, no turn, Team 2 about to lock in
const preKoop = {
	v: 1,
	state: {
		rng: { state: 2840029234 },
		pool: [
			{ id: 1, a: 'Kalt', b: 'Heiß' },
			{ id: 2, a: 'Langweilig', b: 'Spannend' }
		],
		used: [1, 2],
		teams: [
			{ name: 'Team 1', players: [{ id: 'p1', name: 'Alex' }, { id: 'p2', name: 'Bo' }], score: 4 },
			{ name: 'Team 2', players: [{ id: 'p3', name: 'Cleo' }, { id: 'p4', name: 'Dani' }], score: 0 }
		],
		rounds: 1,
		roundIndex: 0,
		teamIndex: 1,
		spectrum: { id: 2, a: 'Langweilig', b: 'Spannend' },
		target: 120,
		dial: 120,
		phase: 'guess',
		lastScore: null
	}
};

describe('wavelength saved sessions', () => {
	it('Scenario: Saved Versus session from before resumes', () => {
		write('arcade:session:wavelength', JSON.stringify(preKoop));
		const session = loadGameSession(games.find((g) => g.def.slug === 'wavelength')!);
		expect(session).toEqual({ state: preKoop.state });

		const state = (session as { state: WavelengthState }).state;
		expect(modeOf(state)).toBe('versus');
		const locked = def.reduce(state, { type: 'lockIn' });
		expect(locked.lastScore).toBe(4);
		expect(locked.teams.map((t) => t.score)).toEqual([4, 4]);
		expect(def.phase(def.reduce(locked, { type: 'next' }))).toBe('gameOver');
	});
});
