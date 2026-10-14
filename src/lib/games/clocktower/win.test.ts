import { describe, expect, it } from 'vitest';
import { dead, F5, firstDay, seated, step, voted } from './fixtures.ts';
import type { CharacterId, ClocktowerAction, ClocktowerState } from './types.ts';

// seat numbers in the comments are 1-based, indices 0-based
const SW: CharacterId[] = ['chef', 'investigator', 'monk', 'ravenkeeper', 'slayer', 'scarlet-woman', 'imp'];
const SAINT: CharacterId[] = ['chef', 'investigator', 'monk', 'ravenkeeper', 'saint', 'poisoner', 'imp'];
const MAYOR: CharacterId[] = ['chef', 'investigator', 'monk', 'ravenkeeper', 'mayor', 'poisoner', 'imp'];
const RECLUSE: CharacterId[] = ['chef', 'investigator', 'monk', 'ravenkeeper', 'recluse', 'spy', 'imp'];

const alive = (s: ClocktowerState) => s.seats.filter((x) => x.alive).length;
const screen = (s: ClocktowerState) => s.night!.screens[s.night!.at];
const next: ClocktowerAction = { type: 'next' };

// Tag beenden with `seat` on the block, the announcement, then dusk
function execute(s: ClocktowerState, seat: number): ClocktowerState {
	const votes = Math.ceil(alive(s) / 2);
	return step(voted(s, seat, s.seats.findIndex((x) => x.alive), votes), { type: 'endDay' });
}

// from a night's dusk past its steps to dawn, `deaths` at the death step, through dawn without a timer
function throughNight(s: ClocktowerState, deaths: number[] = []): ClocktowerState {
	let n = s;
	while (n.phase.kind === 'night' && screen(n).screen !== 'deaths') n = step(n, next);
	if (n.phase.kind === 'night') n = step(n, { type: 'deaths', seats: deaths });
	return step(n, next, next, { type: 'timer', minutes: null, now: 0 });
}

describe('clocktower win detection', () => {
	it('Scenario: Good wins when the Demon dies', () => {
		const s = execute(firstDay(seated(SAINT)), 6);
		expect(s.winner).toBe('good');
		expect(s.phase).toEqual({ kind: 'day', screen: 'execution' });
		expect(step(s, next).phase).toEqual({ kind: 'over', revealed: false });
	});

	it('Scenario: Evil wins at two alive', () => {
		// F5 night 2 with seats 1 and 2 dead: Poisoner, Imp and Fortune Teller alive
		let n = step(firstDay(dead(seated(F5), 0, 1)), { type: 'endDay' }, next);
		expect(n.phase).toEqual({ kind: 'night' });
		while (screen(n).screen !== 'deaths') n = step(n, next);
		const s = step(n, { type: 'deaths', seats: [4] });
		expect(s.seats[3].alive).toBe(true);
		expect(s.winner).toBe('evil');
	});

	it('Scenario: Both at once good wins', () => {
		const s = execute(firstDay(dead(seated(F5), 0, 1)), 3);
		expect(alive(s)).toBe(2);
		expect(s.winner).toBe('good');
	});

	it('Scenario: Recluse never counts as the Demon', () => {
		const day = firstDay(seated(RECLUSE));
		const s = step(day, { type: 'died', seat: 4 });
		expect(s.winner).toBeNull();
		expect(s.phase).toEqual({ kind: 'day', screen: 'grimoire' });
		const three = firstDay(dead(seated(RECLUSE), 0, 1, 2, 3));
		expect(step(three, { type: 'died', seat: 4 }).winner).toBe('evil');
	});

	it('Scenario: New Demon checked after a starpass', () => {
		// F5 night 2: the Imp (seat 4) passes to the Poisoner (seat 3)
		let n = step(firstDay(seated(F5)), { type: 'endDay' }, next);
		while (!('step' in screen(n) && n.night!.steps[(screen(n) as { step: number }).step].kind === 'imp')) n = step(n, next);
		n = step(n, { type: 'starpass', seat: 2 });
		const day2 = throughNight(n, [3]);
		expect(day2.seats[3].alive).toBe(false);
		expect(day2.winner).toBeNull();
		expect(day2.phase).toEqual({ kind: 'day', screen: 'grimoire' });
		expect(execute(day2, 2).winner).toBe('good');
	});
});

describe('clocktower dusk questions', () => {
	// day 1 with seat 1 dead: 6 alive, the Scarlet Woman on seat 6, the Imp on seat 7
	const swDay = () => firstDay(dead(seated(SW), 0));

	it('Scenario: Scarlet Woman question at the next dusk', () => {
		const executed = execute(swDay(), 6);
		expect(executed.winner).toBeNull();
		expect(executed.questions).toEqual([{ kind: 'scarlet-woman', seat: 5 }]);
		const dusk = step(executed, next);
		expect(screen(dusk)).toEqual({ screen: 'dusk' });
		const asked = step(dusk, next);
		expect(screen(asked)).toEqual({ screen: 'question', question: { kind: 'scarlet-woman', seat: 5 } });
		expect(step(asked, next)).toBe(asked);
		expect(step(asked, { type: 'skip' })).toBe(asked);

		const yes = step(asked, { type: 'answer', yes: true });
		expect(yes.winner).toBeNull();
		expect(yes.demon).toBe(5);
		expect(yes.seats[5].character).toBe('imp');
		expect(yes.history).toEqual([{ night: 2, from: 6, to: 5, was: 'scarlet-woman', kind: 'scarlet-woman' }]);
		expect(yes.questions).toEqual([]);
		expect(yes.night!.steps.map((x) => x.kind)).toContain('scarlet-woman');
		expect(yes.night!.steps.find((x) => x.kind === 'scarlet-woman')!.seats).toEqual([5]);
		expect(screen(yes)).toEqual({ screen: 'wake', step: 0 });
		expect(step(yes, { type: 'back' }, { type: 'answer', yes: false })).toEqual(step(yes, { type: 'back' }));

		const no = step(asked, { type: 'answer', yes: false });
		expect(no.winner).toBe('good');
		expect(no.phase).toEqual({ kind: 'over', revealed: false });
	});

	it('Scenario: Scarlet Woman needs five alive before the death', () => {
		const five = execute(firstDay(dead(seated(SW), 0, 1)), 6);
		expect(alive(five)).toBe(4);
		expect(five.winner).toBeNull();
		expect(screen(step(five, next, next))).toEqual({ screen: 'question', question: { kind: 'scarlet-woman', seat: 5 } });

		const four = execute(firstDay(dead(seated(SW), 0, 1, 2)), 6);
		expect(four.questions).toEqual([]);
		expect(four.winner).toBe('good');
	});

	it('Scenario: Saint executed asks at dusk', () => {
		const executed = execute(firstDay(seated(SAINT)), 4);
		expect(executed.winner).toBeNull();
		const asked = step(executed, next, next);
		expect(screen(asked)).toEqual({ screen: 'question', question: { kind: 'saint', seat: 4 } });

		const yes = step(asked, { type: 'answer', yes: true });
		expect(yes.winner).toBe('evil');
		expect(yes.phase).toEqual({ kind: 'over', revealed: false });

		const no = step(asked, { type: 'answer', yes: false });
		expect(no.winner).toBeNull();
		expect(no.phase).toEqual({ kind: 'night' });
		expect(screen(no)).toEqual({ screen: 'wake', step: 0 });
	});

	it('a dead Saint executed asks nothing', () => {
		const s = execute(firstDay(dead(seated(SAINT), 4)), 4);
		expect(s.today!.executed).toBe(4);
		expect(s.questions).toEqual([]);
	});

	it('Scenario: Mayor question at dusk', () => {
		// Mayor, Poisoner and Imp alive
		const ended = step(firstDay(dead(seated(MAYOR), 0, 1, 2, 3)), { type: 'endDay' });
		expect(ended.today!.executed).toBeNull();
		const asked = step(ended, next, next);
		expect(screen(asked)).toEqual({ screen: 'question', question: { kind: 'mayor', seat: 4 } });
		const yes = step(asked, { type: 'answer', yes: true });
		expect(yes.winner).toBe('good');
		expect(yes.phase).toEqual({ kind: 'over', revealed: false });
		expect(step(asked, { type: 'answer', yes: false }).winner).toBeNull();

		const executedToday = step(firstDay(dead(seated(MAYOR), 0, 1, 2)), { type: 'execute', seat: 3 });
		expect(alive(executedToday)).toBe(3);
		expect(step(executedToday, next, next).night!.screens.some((x) => x.screen === 'question')).toBe(false);
	});

	it('Scenario: Drunk Mayor or Saint never asks', () => {
		const drunk = (believed: CharacterId) => seated(['chef', 'investigator', 'monk', 'ravenkeeper', 'drunk', 'poisoner', 'imp'], { believed });
		const saint = execute(firstDay(drunk('saint')), 4);
		expect(saint.questions).toEqual([]);
		expect(step(saint, next).night!.screens.some((x) => x.screen === 'question')).toBe(false);

		const mayor = step(firstDay(dead(drunk('mayor'), 0, 1, 2, 3)), { type: 'endDay' }, next);
		expect(mayor.night!.screens.some((x) => x.screen === 'question')).toBe(false);
	});

	it('Scenario: Winner for every ending', () => {
		const winners: (string | null)[] = [];

		winners.push(execute(firstDay(seated(SAINT)), 6).winner);

		let starpass = step(firstDay(seated(F5)), { type: 'endDay' }, next, next, next, next, next, next);
		starpass = throughNight(step(starpass, { type: 'starpass', seat: 2 }), [3]);
		winners.push(execute(starpass, 2).winner);

		const taken = step(execute(swDay(), 6), next, next, { type: 'answer', yes: true });
		const day2 = throughNight(taken, [1]);
		expect(alive(day2)).toBe(4);
		winners.push(execute(day2, 5).winner);

		winners.push(step(execute(firstDay(seated(SAINT)), 4), next, next, { type: 'answer', yes: true }).winner);

		winners.push(step(firstDay(dead(seated(MAYOR), 0, 1, 2, 3)), { type: 'endDay' }, next, next, { type: 'answer', yes: true }).winner);

		const two = step(firstDay(dead(seated(F5), 0, 1)), { type: 'endDay' }, next);
		winners.push(throughNight(two, [4]).winner);

		expect(winners).toEqual(['good', 'good', 'good', 'evil', 'good', 'evil']);
	});
});
