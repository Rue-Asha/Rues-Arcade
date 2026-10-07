import { describe, expect, it } from 'vitest';
import { start } from '#lib/demo/runner.ts';
import { demo } from './demo.ts';
import { modeOf, psychic, wavelength, type WavelengthState } from './engine.ts';

function run() {
	const states: WavelengthState[] = [start(wavelength, demo).state as WavelengthState];
	for (const step of demo.steps) states.push(wavelength.reduce(states.at(-1)!, step.action));
	return states;
}

// [state before, action type, state after] for every step
function walk() {
	const a = run();
	return demo.steps.map((step, i) => ({ before: a[i], type: step.action.type, after: a[i + 1] }));
}

describe('wavelength demo', () => {
	it('Scenario: Wavelength demo script plays to the end', () => {
		const a = run();
		expect(run()).toEqual(a);
		for (let i = 0; i < demo.steps.length; i++) expect(a[i + 1], `step ${i + 1} changes the state`).not.toEqual(a[i]);
		expect(demo.steps.at(-1)!.action.type).toBe('again');
	});

	it('Scenario: Wavelength demo stays the Versus demo', () => {
		const s = run()[0];
		expect(modeOf(s)).toBe('versus');
		expect(s.teams.map((t) => t.players.map((p) => p.name))).toEqual([['Alex', 'Bo'], ['Cleo', 'Dani']]);
		expect(demo.config.mode).toBeUndefined();
		expect(demo.config.rounds).toBe(2);
	});

	it('Scenario: Wavelength demo tips read neutral', () => {
		expect(demo.steps.filter((s) => s.tip.includes('!') || /\p{Extended_Pictographic}/u.test(s.tip))).toEqual([]);
		expect(demo.steps.filter((s) => !s.tip.trim())).toEqual([]);
		const results = demo.steps.filter((s) => s.action.type === 'next').slice(0, 4);
		const openers = ['Genau getroffen, 4 Punkte', 'Knapp daneben, 3 Punkte', 'In der Nähe, 2 Punkte', 'Kein Punkt'];
		results.forEach((s, i) => expect(s.tip.startsWith(openers[i]), s.tip).toBe(true));
	});

	it('Scenario: Wavelength demo covers every outcome branch', () => {
		const steps = walk();

		// scores 4, 3, 2 and 0, one each
		const locks = steps.filter((s) => s.type === 'lockIn');
		expect(locks.map((s) => s.after.lastScore)).toEqual([4, 3, 2, 0]);

		// one redraw in prep and one after "Ziel anzeigen", each keeps team and psychic and changes the spectrum
		const redraws = steps.filter((s) => s.type === 'redraw');
		expect(redraws.map((s) => s.before.phase)).toEqual(['prep', 'reveal']);
		for (const s of redraws) {
			expect(s.after.spectrum.id).not.toBe(s.before.spectrum.id);
			expect(s.after.teamIndex).toBe(s.before.teamIndex);
			expect(psychic(s.after)).toEqual(psychic(s.before));
		}

		// both teams play both rounds, the psychic in round 2 is the other player
		const turns = steps.filter((s) => s.type === 'show').map((s) => [s.before.roundIndex, s.before.teamIndex, psychic(s.before).name]);
		expect(turns).toEqual([
			[0, 0, 'Alex'],
			[0, 1, 'Cleo'],
			[1, 0, 'Bo'],
			[1, 1, 'Dani']
		]);

		// game over with one winning team, then a new game with both scores 0
		const over = steps.find((s) => s.after.phase === 'gameOver')!.after;
		const best = Math.max(...over.teams.map((t) => t.score));
		expect(over.teams.filter((t) => t.score === best)).toHaveLength(1);
		const again = steps.at(-1)!;
		expect(again.type).toBe('again');
		expect(again.before.phase).toBe('gameOver');
		expect(again.after.teams.map((t) => t.score)).toEqual([0, 0]);

		// Koop is named as the other mode
		expect(demo.steps.some((s) => s.tip.includes('Koop'))).toBe(true);
	});
});
