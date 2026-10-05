import type { DemoScript, GameDef } from '#lib/engine/types.ts';
import type { DemoState } from './context.ts';

export interface DemoRun<S = unknown> {
	state: S;
	index: number;
}

export const END_TIP = 'Demo beendet';

export function start<S>(def: GameDef<S, any, any>, script: DemoScript<any, any>): DemoRun<S> {
	const players = script.players.map((name) => ({ id: name, name }));
	const state = def.init({ players, config: script.config, content: script.content, seed: script.seed });
	return { state, index: 0 };
}

export function done(script: DemoScript<any, any>, run: DemoRun<unknown>): boolean {
	return run.index >= script.steps.length;
}

export function view(script: DemoScript<any, any>, run: DemoRun<unknown>): DemoState {
	const total = script.steps.length;
	const step = script.steps[run.index];
	if (!step) return { expected: null, step: total, total, tip: END_TIP };
	return { expected: step.action.type, step: run.index + 1, total, tip: step.tip };
}

// the tapped action only picks the step; the scripted one is applied, so a dial lands where the script says
export function next<S>(
	def: GameDef<S, any, any>,
	script: DemoScript<any, any>,
	run: DemoRun<S>,
	tapped: { type: string }
): DemoRun<S> {
	const step = script.steps[run.index];
	if (!step || step.action.type !== tapped.type) return run;
	return { state: def.reduce(run.state, step.action), index: run.index + 1 };
}
