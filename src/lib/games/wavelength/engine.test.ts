import { describe, expect, it } from 'vitest';
import type { ContentItem } from '#lib/content/types.ts';
import type { Player } from '#lib/engine/types.ts';
import { demo } from './demo.ts';
import {
	BAND_DEGREES,
	DIAL_DEGREES,
	formatAverage,
	koopResult,
	modeOf,
	psychic,
	scoreFor,
	wavelength,
	winners,
	type WavelengthAction,
	type WavelengthState
} from './engine.ts';

const names = ['Alex', 'Bo', 'Cleo', 'Dani', 'Eli', 'Fynn'];
const players: Player[] = names.map((name) => ({ id: name.toLowerCase(), name }));

const spectra = (n: number): ContentItem[] =>
	Array.from({ length: n }, (_, i) => ({ id: i + 1, a: `links ${i + 1}`, b: `rechts ${i + 1}` }));

const start = (teams: string[][], rounds = 1, content = spectra(4), seed = 3) =>
	wavelength.init({ players, config: { teams, rounds }, content, seed });

const step = (s: WavelengthState, ...actions: WavelengthAction[]) =>
	actions.reduce((acc, a) => wavelength.reduce(acc, a), s);

const turn = (s: WavelengthState, value: number) =>
	step(s, { type: 'show' }, { type: 'guess' }, { type: 'dial', value }, { type: 'lockIn' }, { type: 'next' });

const MIN_TARGET = 2.5 * BAND_DEGREES;
const MAX_TARGET = DIAL_DEGREES - 2.5 * BAND_DEGREES;

function freeze<T>(v: T): T {
	if (v && typeof v === 'object') {
		Object.values(v).forEach(freeze);
		Object.freeze(v);
	}
	return v;
}

const allActions: WavelengthAction[] = [
	{ type: 'redraw' },
	{ type: 'show' },
	{ type: 'redraw' },
	{ type: 'guess' },
	{ type: 'dial', value: 120 },
	{ type: 'lockIn' },
	{ type: 'next' },
	{ type: 'show' },
	{ type: 'guess' },
	{ type: 'dial', value: 30 },
	{ type: 'lockIn' },
	{ type: 'next' },
	{ type: 'again' }
];

describe('wavelength engine contract', () => {
	it('Scenario: Same seed and actions give the same state', () => {
		const a = step(start([['alex', 'bo'], ['cleo', 'dani']], 1, spectra(4), 42), ...allActions);
		const b = step(start([['alex', 'bo'], ['cleo', 'dani']], 1, spectra(4), 42), ...allActions);
		expect(a).toEqual(b);
		expect(wavelength.phase(a)).toBe('prep');
	});

	it('Scenario: Reducer does not mutate its input', () => {
		let s = freeze(start([['alex', 'bo'], ['cleo', 'dani']]));
		for (const action of allActions) {
			const n = wavelength.reduce(s, action);
			expect(n).not.toBe(s);
			s = freeze(n);
		}
	});
});

describe('wavelength engine', () => {
	it('Scenario: Scoring bands', () => {
		const at = (offset: number) => {
			let s = step(start([['alex', 'bo'], ['cleo', 'dani']]), { type: 'show' }, { type: 'guess' });
			s = { ...s, target: 90 };
			s = step(s, { type: 'dial', value: 90 + offset * BAND_DEGREES }, { type: 'lockIn' });
			return [s.lastScore, s.teams[0].score];
		};
		expect([0, 1, 2, 3].map(at)).toEqual([
			[4, 4],
			[3, 3],
			[2, 2],
			[0, 0]
		]);
		expect(scoreFor(90, 90 - 2 * BAND_DEGREES)).toBe(2);
	});

	it('Scenario: Target at the extremes scores correctly', () => {
		for (let seed = 1; seed <= 200; seed++) {
			const { target } = start([['alex', 'bo'], ['cleo', 'dani']], 1, spectra(4), seed);
			expect(target).toBeGreaterThanOrEqual(MIN_TARGET);
			expect(target).toBeLessThanOrEqual(MAX_TARGET);
		}
		const lockAt = (target: number, value: number) => {
			const s = { ...step(start([['alex', 'bo'], ['cleo', 'dani']]), { type: 'show' }, { type: 'guess' }), target };
			return step(s, { type: 'dial', value }, { type: 'lockIn' });
		};
		expect(lockAt(MIN_TARGET, 0).lastScore).toBe(2);
		expect(lockAt(MAX_TARGET, 180).lastScore).toBe(2);
		expect(lockAt(MIN_TARGET, -40).dial).toBe(0);
		expect(lockAt(MAX_TARGET, 400).dial).toBe(180);
		expect(lockAt(MAX_TARGET, 400).lastScore).toBe(2);
	});

	it('Scenario: Psychic rotates within the team', () => {
		let s = start([['alex', 'bo', 'cleo'], ['dani', 'eli']], 3);
		const seen: string[] = [];
		for (let round = 0; round < 3; round++) {
			seen.push(psychic(s).name);
			s = turn(s, 90);
			s = turn(s, 90);
		}
		expect(seen.sort()).toEqual(['Alex', 'Bo', 'Cleo']);
		expect(wavelength.phase(s)).toBe('gameOver');
	});

	it('winners returns every team tied for first', () => {
		let s = start([['alex', 'bo'], ['cleo', 'dani'], ['eli', 'fynn']]);
		const lock = (st: WavelengthState, value: number) =>
			step(st, { type: 'show' }, { type: 'guess' }, { type: 'dial', value: st.target + value }, { type: 'lockIn' }, { type: 'next' });
		s = lock(s, 0);
		s = lock(s, 0);
		s = lock(s, 3 * BAND_DEGREES);
		expect(wavelength.phase(s)).toBe('gameOver');
		expect(winners(s).map((t) => t.name)).toEqual(['Team 1', 'Team 2']);
	});

	it('Scenario: Redraw changes spectrum and target', () => {
		let s = start([['alex', 'bo'], ['cleo', 'dani']], 1, spectra(2));
		for (let i = 0; i < 5; i++) {
			const before = s;
			s = step(s, { type: 'redraw' });
			expect(s.spectrum.id).not.toBe(before.spectrum.id);
			expect(s.target).not.toBe(before.target);
		}
		s = step(s, { type: 'show' }, { type: 'redraw' });
		expect(wavelength.phase(s)).toBe('reveal');
		s = step(s, { type: 'guess' });
		expect(step(s, { type: 'redraw' })).toBe(s);
	});

	it('a full game: 2 teams × 1 round, winner at game over', () => {
		let s = start([['alex', 'bo'], ['cleo', 'dani']]);
		expect(wavelength.phase(s)).toBe('prep');
		expect(s.dial).toBe(90);
		s = step(s, { type: 'show' }, { type: 'guess' }, { type: 'dial', value: s.target }, { type: 'lockIn' });
		expect(wavelength.phase(s)).toBe('result');
		s = step(s, { type: 'next' });
		expect(s.teamIndex).toBe(1);
		expect(wavelength.phase(s)).toBe('prep');
		s = turn(s, s.target > 90 ? 0 : 180);
		expect(wavelength.phase(s)).toBe('gameOver');
		expect(winners(s).map((t) => t.name)).toEqual(['Team 1']);
		s = step(s, { type: 'again' });
		expect(wavelength.phase(s)).toBe('prep');
		expect(s.teams.map((t) => t.score)).toEqual([0, 0]);
		expect(s.roundIndex).toBe(0);
	});

	it('Scenario: Play again keeps the teams', () => {
		let s = start([['alex', 'bo', 'eli'], ['cleo', 'dani']], 2);
		s = turn(turn(turn(turn(s, s.target), 0), 180), 90);
		expect(wavelength.phase(s)).toBe('gameOver');
		expect(s.teams.some((t) => t.score > 0)).toBe(true);
		const teams = s.teams.map((t) => ({ name: t.name, players: t.players }));

		const again = step(s, { type: 'again' });
		expect(wavelength.phase(again)).toBe('prep');
		expect(again.teams.map((t) => ({ name: t.name, players: t.players }))).toEqual(teams);
		expect(again.teams.map((t) => t.score)).toEqual([0, 0]);
		expect(again.roundIndex).toBe(0);
		expect(again.teamIndex).toBe(0);
		expect(psychic(again).id).toBe('alex');
	});
});

describe('wavelength koop', () => {
	const koop = (ids: string[], rounds = 1, content = spectra(4), seed = 3) =>
		wavelength.init({ players, config: { mode: 'koop', teams: [ids], rounds }, content, seed });

	it('Scenario: Koop psychic order', () => {
		let s = koop(['alex', 'bo', 'cleo'], 2);
		const seen: string[] = [];
		for (let i = 0; i < 6; i++) {
			expect(wavelength.phase(s)).toBe('prep');
			seen.push(psychic(s).name);
			s = turn(s, 90);
		}
		expect(seen).toEqual(['Alex', 'Bo', 'Cleo', 'Alex', 'Bo', 'Cleo']);
		expect(wavelength.phase(s)).toBe('gameOver');
	});

	it('Scenario: Koop keeps one shared score', () => {
		let s = koop(['alex', 'bo', 'cleo']);
		const scores: number[] = [];
		for (const offset of [0, 3 * BAND_DEGREES, 2 * BAND_DEGREES]) {
			s = step(s, { type: 'show' }, { type: 'guess' });
			s = step(s, { type: 'dial', value: s.target + (s.target > 90 ? -offset : offset) }, { type: 'lockIn' });
			scores.push(s.lastScore!);
			s = step(s, { type: 'next' });
		}
		expect(scores).toEqual([4, 0, 2]);
		expect(s.teams).toHaveLength(1);
		expect(s.teams[0].score).toBe(6);
		expect(s.teams[0].players.map((p) => Object.keys(p).sort())).toEqual([
			['id', 'name'],
			['id', 'name'],
			['id', 'name']
		]);
		expect(modeOf(s)).toBe('koop');
	});

	it('Scenario: Koop play again keeps players and mode', () => {
		let s = koop(['cleo', 'alex', 'bo']);
		s = turn(turn(turn(s, s.target), 90), 0);
		expect(wavelength.phase(s)).toBe('gameOver');
		expect(s.teams[0].score).toBeGreaterThan(0);

		const again = step(s, { type: 'again' });
		expect(wavelength.phase(again)).toBe('prep');
		expect(modeOf(again)).toBe('koop');
		expect(again.teams[0].players.map((p) => p.name)).toEqual(['Cleo', 'Alex', 'Bo']);
		expect(again.teams[0].score).toBe(0);
		expect(again.roundIndex).toBe(0);
		expect(again.turn).toBe(0);
		expect(psychic(again).name).toBe('Cleo');
	});

	it('Scenario: Koop rating tiers', () => {
		const solo = koop(['alex'], 100);
		const at = (average: number) =>
			koopResult({ ...solo, phase: 'gameOver', teams: [{ ...solo.teams[0], score: Math.round(average * 100) }] });
		const results = [4, 3.5, 3.49, 2.5, 1.5, 0.5, 0.49, 0].map(at);
		expect(results.map((r) => r.average)).toEqual([4, 3.5, 3.49, 2.5, 1.5, 0.5, 0.49, 0]);
		expect(results.map((r) => r.tier)).toEqual([
			'Sehr genau',
			'Sehr genau',
			'Genau',
			'Genau',
			'Solide',
			'Ungenau',
			'Weit daneben',
			'Weit daneben'
		]);
	});

	it('Scenario: Koop average per turn', () => {
		let s = koop(['alex', 'bo', 'cleo']);
		const offsets = [0, 0, 3 * BAND_DEGREES];
		for (const offset of offsets) {
			s = step(s, { type: 'show' }, { type: 'guess' });
			s = step(s, { type: 'dial', value: s.target + (s.target > 90 ? -offset : offset) }, { type: 'lockIn' }, { type: 'next' });
		}
		expect(wavelength.phase(s)).toBe('gameOver');
		const r = koopResult(s);
		expect(r).toMatchObject({ turns: 3, total: 8 });
		expect(r.average).toBeCloseTo(2.67, 2);
		expect(formatAverage(r.average)).toBe('2,7');
	});

	it('versus states carry no mode or turn', () => {
		const s = step(start([['alex', 'bo'], ['cleo', 'dani']]), ...allActions);
		expect('mode' in s).toBe(false);
		expect('turn' in s).toBe(false);
		expect(modeOf(s)).toBe('versus');
	});
});

describe('wavelength demo', () => {
	const play = () => {
		let s = wavelength.init({
			players: demo.players.map((name) => ({ id: name, name })),
			config: demo.config,
			content: demo.content,
			seed: demo.seed
		});
		const states = [s];
		for (const { action } of demo.steps) {
			const n = wavelength.reduce(s, action);
			expect(n, `step ${states.length}: ${action.type}`).not.toBe(s);
			states.push((s = n));
		}
		return states;
	};

	it('Scenario: Wavelength demo script plays to the end', () => {
		expect(demo.players).toEqual(['Alex', 'Bo', 'Cleo', 'Dani']);
		expect(demo.config.teams).toHaveLength(2);
		expect(demo.config.rounds).toBe(1);
		const a = play();
		const b = play();
		expect(a).toEqual(b);
		const end = a[a.length - 1];
		expect(wavelength.phase(end)).toBe('gameOver');
		expect(a.filter((s) => s.phase === 'result').map((s) => s.lastScore)).toEqual([4, 3]);
		expect(winners(end).map((t) => t.name)).toEqual(['Team 1']);
		expect(demo.steps.every((st) => st.tip.length > 0)).toBe(true);
	});
});
