import { describe, expect, it } from 'vitest';
import { write } from '#lib/storage.ts';
import { comingSoon, games, loadGameSession, playerRange } from './registry.ts';
import { modeOf, wavelength as def, type WavelengthState } from './wavelength/engine.ts';

describe('registry', () => {
	it('Scenario: Player range derived from engine limits', () => {
		for (const { def } of games)
			expect(playerRange(def)).toBe(`${def.minPlayers}–${def.maxPlayers} Spieler`);

		const imposter = games.find((g) => g.def.slug === 'imposter')!;
		expect(playerRange(imposter.def)).toBe('3–12 Spieler');
	});

	it('Scenario: Wavelength player range reads 2–18', () => {
		const wavelength = games.find((g) => g.def.slug === 'wavelength')!;
		expect(playerRange(wavelength.def)).toBe('2–18 Spieler');
	});

	it('lists the five locked games and unique slugs', () => {
		expect(comingSoon).toEqual(['Duck', 'Family Feud', 'Codes', 'Most Likely To', 'Charade']);
		const slugs = games.map((g) => g.def.slug);
		expect(new Set(slugs).size).toBe(slugs.length);
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
