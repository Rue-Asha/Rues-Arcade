import { describe, expect, it } from 'vitest';
import { start } from '#lib/demo/runner.ts';
import { demo } from './demo.ts';
import { feud, type FeudState } from './engine.ts';

function run() {
	const states: FeudState[] = [start(feud, demo).state as FeudState];
	for (const step of demo.steps) states.push(feud.reduce(states.at(-1)!, step.action));
	return states;
}

describe('feud demo', () => {
	it('Scenario: Feud demo script plays to the end', () => {
		const a = run();
		expect(run()).toEqual(a);
		for (let i = 0; i < demo.steps.length; i++) expect(a[i + 1], `step ${i + 1} changes the state`).not.toEqual(a[i]);

		const phases = a.map((s) => s.phase);
		expect(phases.slice(0, 2)).toEqual(['faceoff', 'faceoff']);
		expect(phases).toContain('choose');
		expect(phases).toContain('board');
		expect(phases).toContain('steal');
		expect(phases).toContain('result');
		const steal = demo.steps.findIndex((s) => s.action.type === 'steal');
		expect(steal).toBeGreaterThan(-1);
		expect(a[steal].strikes).toBe(3);
		expect(demo.steps.filter((s) => s.action.type === 'strike')).toHaveLength(3);
		expect(demo.steps.filter((s) => s.action.type === 'reveal').length).toBeGreaterThanOrEqual(1);

		const end = a.at(-1)!;
		expect(end.phase).toBe('gameOver');
		expect(end.gain).toMatchObject({ stolen: true });
		expect(end.winner).toBe(end.gain!.team);
		expect(end.scores[end.winner!]).toBeGreaterThan(0);
		expect(end.config.teams.map((t) => t.players)).toEqual([['Alex', 'Bo'], ['Cleo', 'Dani']]);
	});

	it('keeps the tips neutral', () => {
		expect(demo.steps.filter((s) => s.tip.includes('!'))).toEqual([]);
		expect(demo.steps.every((s) => s.tip.length > 0)).toBe(true);
	});
});
