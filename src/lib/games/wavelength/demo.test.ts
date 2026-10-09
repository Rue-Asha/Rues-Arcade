import { describe, expect, it } from 'vitest';
import { start } from '#lib/demo/runner.ts';
import { demo } from './demo.ts';
import { modeOf, psychic, wavelength, type WavelengthState } from './engine.ts';

const states_last = (a: WavelengthState[]) => a.at(-1)!;

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
		expect(states_last(a).phase).toBe('gameOver');
	});

	it('Regression: Wavelength demo plays two turns and the second is a miss with 0 points', () => {
		const steps = walk();
		expect(demo.steps).toHaveLength(12);
		expect(demo.config.rounds).toBe(1);
		expect(steps.filter((s) => s.type === 'lockIn').map((s) => s.after.lastScore)).toEqual([4, 0]);
		expect(steps.at(-1)!.type).toBe('next');
		expect(steps.at(-1)!.after.phase).toBe('gameOver');
		expect(steps.at(-1)!.after.teams.map((t) => t.score)).toEqual([4, 0]);
		expect(steps.filter((s) => s.type === 'show')).toHaveLength(2);
	});

	it('Scenario: Wavelength demo stays the Versus demo', () => {
		const s = run()[0];
		expect(modeOf(s)).toBe('versus');
		expect(s.teams.map((t) => t.players.map((p) => p.name))).toEqual([['Alex', 'Bo'], ['Cleo', 'Dani']]);
		expect(demo.config.mode).toBeUndefined();
		expect(demo.config.rounds).toBe(1);
	});

	it('Scenario: Wavelength demo tips read neutral', () => {
		expect(demo.steps.filter((s) => s.tip.includes('!') || /\p{Extended_Pictographic}/u.test(s.tip))).toEqual([]);
		expect(demo.steps.filter((s) => !s.tip.trim())).toEqual([]);
		const results = demo.steps.filter((s) => s.action.type === 'next').slice(0, 2);
		const openers = ['Genau getroffen, 4 Punkte', 'Kein Punkt'];
		results.forEach((s, i) => expect(s.tip.startsWith(openers[i]), s.tip).toBe(true));
	});

	it('Scenario: Wavelength demo covers every outcome branch', () => {
		const steps = walk();

		// scores 4 and 0
		const locks = steps.filter((s) => s.type === 'lockIn');
		expect(locks.map((s) => s.after.lastScore)).toEqual([4, 0]);

		// one redraw in prep and one after "Ziel anzeigen", each keeps team and psychic and changes the spectrum
		const redraws = steps.filter((s) => s.type === 'redraw');
		expect(redraws.map((s) => s.before.phase)).toEqual(['prep', 'reveal']);
		for (const s of redraws) {
			expect(s.after.spectrum.id).not.toBe(s.before.spectrum.id);
			expect(s.after.teamIndex).toBe(s.before.teamIndex);
			expect(psychic(s.after)).toEqual(psychic(s.before));
		}

		// each team plays one turn
		const turns = steps.filter((s) => s.type === 'show').map((s) => [s.before.roundIndex, s.before.teamIndex, psychic(s.before).name]);
		expect(turns).toEqual([
			[0, 0, 'Alex'],
			[0, 1, 'Cleo']
		]);

		// game over with one winning team
		const over = steps.find((s) => s.after.phase === 'gameOver')!.after;
		const best = Math.max(...over.teams.map((t) => t.score));
		expect(over.teams.filter((t) => t.score === best)).toHaveLength(1);

		// Koop is named as the other mode
		expect(demo.steps.some((s) => s.tip.includes('Koop'))).toBe(true);
	});
});
