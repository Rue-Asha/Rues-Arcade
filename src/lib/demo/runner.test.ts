import { describe, expect, it } from 'vitest';
import { games } from '#lib/games/registry.ts';
import { getDemo, setDemo } from './context.ts';
import { done, next, start, view, type DemoRun } from './runner.ts';

describe.each(games.map((g) => [g.def.slug, g] as const))('demo runner: %s', (_, { def, demo }) => {
	const total = demo.steps.length;

	function playThrough() {
		let run: DemoRun = start(def, demo);
		const seen = [view(demo, run)];
		while (!done(demo, run)) {
			run = next(def, demo, run, { type: view(demo, run).expected! });
			seen.push(view(demo, run));
		}
		return { run, seen };
	}

	it('starts on step 1 with the fixed players and the first scripted action expected', () => {
		const run = start(def, demo);
		expect(run.index).toBe(0);
		expect(view(demo, run)).toEqual({ expected: demo.steps[0].action.type, step: 1, total, tip: demo.steps[0].tip });
		expect(JSON.stringify(run.state)).toContain('Alex');
	});

	it('applies the scripted action, not the tapped one, through the real reducer', () => {
		const run = start(def, demo);
		const tapped = { ...demo.steps[0].action, value: -1 };
		const after = next(def, demo, run, tapped);
		expect(after.index).toBe(1);
		expect(after.state).toEqual(def.reduce(run.state, demo.steps[0].action));
	});

	it('ignores any action other than the expected one', () => {
		const run = start(def, demo);
		expect(next(def, demo, run, { type: 'nope' })).toBe(run);
	});

	it('plays every step to the end the same way twice', () => {
		const a = playThrough();
		const b = playThrough();
		expect(a.run.state).toEqual(b.run.state);
		expect(a.seen.map((s) => s.step)).toEqual([...Array.from({ length: total }, (_, i) => i + 1), total]);
		expect(a.seen.at(-1)).toEqual({ expected: null, step: total, total, tip: 'Demo beendet' });
		expect(next(def, demo, a.run, { type: demo.steps[0].action.type })).toBe(a.run);
	});
});

describe('demo context', () => {
	it('reads through the getter the demo route sets', () => {
		expect(getDemo()).toBeNull();
		let on = true;
		const state = { expected: 'show', step: 1, total: 2, tip: 'x' };
		setDemo(() => (on ? state : null));
		expect(getDemo()).toBe(state);
		on = false;
		expect(getDemo()).toBeNull();
	});
});
