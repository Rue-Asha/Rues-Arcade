import { describe, expect, it } from 'vitest';
import { alignment, byId } from './characters.ts';
import { clocktower, dusk, heirs } from './engine.ts';
import { F15, F5, F7, seated } from './fixtures.ts';
import { believable, counts, herringOptions, problems, required } from './setup.ts';
import type { CharacterId, ClocktowerAction, ClocktowerState } from './types.ts';

const NAMES = ['Alex', 'Bo', 'Cleo', 'Dani', 'Eli', 'Fey', 'Gus', 'Hana', 'Ida', 'Jo', 'Kai', 'Lu', 'Mo', 'Nia', 'Ole'];

const start = (n: number, seed = 1) =>
	clocktower.init({ players: NAMES.slice(0, n).map((name) => ({ id: name.toLowerCase(), name })), config: {}, content: [], seed });

const step = (s: ClocktowerState, ...actions: ClocktowerAction[]) => actions.reduce((acc, a) => clocktower.reduce(acc, a), s);

const assign = (s: ClocktowerState, list: (CharacterId | null)[]) =>
	step(s, ...list.map((character, seat): ClocktowerAction => ({ type: 'assign', seat, character })));

const names = (s: ClocktowerState) => s.seats.map((seat) => seat.player.name);
const ids = (s: ClocktowerState) => s.seats.map((seat) => seat.character);

// every seat shown and hidden in turn
const reveal = (s: ClocktowerState) => step(s, ...s.seats.flatMap((): ClocktowerAction[] => [{ type: 'show' }, { type: 'hide' }]));

function complete(s: ClocktowerState) {
	const list = ids(s);
	expect(list).not.toContain(null);
	expect(new Set(list).size).toBe(list.length);
	expect(counts(s.seats)).toEqual(required(s.seats.length, list.includes('baron')));
}

describe('clocktower setup', () => {
	it('Scenario: Seat order carries into the game', () => {
		const moved = step(start(7), { type: 'swap', a: 1, b: 4 }, { type: 'move', from: 0, to: 3 });
		const order = ['Eli', 'Cleo', 'Dani', 'Alex', 'Bo', 'Fey', 'Gus'];
		expect(names(moved)).toEqual(order);

		const locked = step(assign(moved, F7), { type: 'lock' });
		expect(locked.locked).toBe(true);
		expect(names(locked)).toEqual(order);
		expect(locked.phase).toEqual({ kind: 'reveal', seat: 0, shown: false });

		const shown = step(locked, { type: 'show' }, { type: 'hide' }, { type: 'show' });
		expect(shown.phase).toEqual({ kind: 'reveal', seat: 1, shown: true });
		expect(shown.seats[1].player.name).toBe('Cleo');

		const night = reveal(locked);
		expect(night.phase).toEqual({ kind: 'night' });
		expect(night.night?.number).toBe(1);
		expect(names(night)).toEqual(order);
		expect(ids(night)).toEqual(F7);
	});

	it('moves keep the clockwise order and the picks on their players', () => {
		const s = step(assign(start(5), ['washerwoman', 'empath', 'poisoner', 'imp', 'fortune-teller']), { type: 'herring', seat: 1 });
		const back = step(s, { type: 'move', from: 4, to: 0 });
		expect(names(back)).toEqual(['Eli', 'Alex', 'Bo', 'Cleo', 'Dani']);
		expect(ids(back)).toEqual(['fortune-teller', 'washerwoman', 'empath', 'poisoner', 'imp']);
		expect(back.redHerring).toBe(2);
		expect(step(back, { type: 'swap', a: 2, b: 0 }).redHerring).toBe(0);
		for (const bad of [{ type: 'swap', a: 1, b: 1 }, { type: 'swap', a: 0, b: 5 }, { type: 'move', from: 2, to: 2 }, { type: 'move', from: -1, to: 2 }] as ClocktowerAction[])
			expect(step(s, bad)).toBe(s);
	});

	it('Scenario: Each character at most once', () => {
		const s = step(start(7), { type: 'assign', seat: 1, character: 'empath' });
		expect(s.seats[1].character).toBe('empath');
		expect(step(s, { type: 'assign', seat: 3, character: 'empath' })).toBe(s);
		const freed = step(s, { type: 'assign', seat: 1, character: null }, { type: 'assign', seat: 3, character: 'empath' });
		expect(ids(freed)).toEqual([null, null, null, 'empath', null, null, null]);
	});

	it('Scenario: Random fill keeps manual choices', () => {
		for (let seed = 1; seed <= 10; seed++) {
			const s = step(start(10, seed), { type: 'assign', seat: 2, character: 'empath' }, { type: 'fill' });
			expect(s.seats[2].character).toBe('empath');
			complete(s);
		}
	});

	it('Scenario: Random fill with a manual Baron', () => {
		for (let seed = 1; seed <= 10; seed++) {
			const s = step(start(7, seed), { type: 'assign', seat: 0, character: 'baron' }, { type: 'fill' });
			expect(counts(s.seats)).toEqual({ townsfolk: 3, outsider: 2, minion: 1, demon: 1 });
			expect(s.seats.filter((seat) => seat.character && byId[seat.character].team === 'minion').map((seat) => seat.character)).toEqual(['baron']);
		}
	});

	it('fill leaves an impossible set as it is', () => {
		const s = assign(start(5), ['poisoner', 'spy']);
		expect(step(s, { type: 'fill' })).toBe(s);
	});

	it('Scenario: Alles neu rerolls every seat', () => {
		const manual = assign(start(7, 3), F7);
		const a = step(manual, { type: 'reroll' });
		const b = step(manual, { type: 'reroll' });
		complete(a);
		expect(problems(a.seats, a.redHerring)).toEqual([]);
		expect(a).toEqual(b);
		expect(ids(a)).not.toEqual(F7);
	});

	it('Scenario: Random distribution is seeded', () => {
		const actions: ClocktowerAction[] = [{ type: 'fill' }, { type: 'lock' }];
		const picks = (s: ClocktowerState) => ({ ids: ids(s), believed: s.seats.map((seat) => seat.believed), redHerring: s.redHerring, bluffs: s.bluffs });
		const one = step(start(9, 5), ...actions);
		expect(one.locked).toBe(true);
		expect(picks(step(start(9, 5), ...actions))).toEqual(picks(one));
		const others = Array.from({ length: 20 }, (_, i) => ids(step(start(9, 100 + i), ...actions)));
		expect(others.some((list) => JSON.stringify(list) !== JSON.stringify(ids(one)))).toBe(true);
	});

	it('Scenario: Believed role is a Townsfolk not in play', () => {
		const s = assign(start(8), ['drunk', 'chef']);
		expect(step(s, { type: 'believe', character: 'chef' })).toBe(s);
		expect(step(s, { type: 'believe', character: 'saint' })).toBe(s);
		expect(step(s, { type: 'believe', character: 'monk' }).seats[0].believed).toBe('monk');
		for (let seed = 1; seed <= 30; seed++) {
			const r = step(assign(start(8, seed), ['drunk', 'chef', 'empath']), { type: 'believe', character: null });
			expect(believable(r.seats)).toContain(r.seats[0].believed);
		}
		const sober = assign(start(8), ['chef']);
		expect(step(sober, { type: 'believe', character: 'monk' })).toBe(sober);
	});

	it('Scenario: Red herring is a good player', () => {
		const s = assign(start(5), ['washerwoman', 'empath', 'poisoner', 'imp', 'fortune-teller']);
		expect(step(s, { type: 'herring', seat: 3 })).toBe(s);
		expect(step(s, { type: 'herring', seat: 0 }).redHerring).toBe(0);
		expect(step(s, { type: 'herring', seat: 4 }).redHerring).toBe(4);
		for (let seed = 1; seed <= 20; seed++) {
			const r = step(assign(start(5, seed), ['washerwoman', 'empath', 'poisoner', 'imp', 'fortune-teller']), { type: 'herring', seat: null });
			expect(herringOptions(r.seats)).toContain(r.redHerring);
		}
		const none = assign(start(5), ['washerwoman', 'empath', 'poisoner', 'imp', 'chef']);
		expect(step(none, { type: 'herring', seat: 0 })).toBe(none);
	});

	it('Scenario: Drunk Fortune Teller gets a red herring', () => {
		const s = step(assign(start(6), ['washerwoman', 'chef', 'empath', 'drunk', 'poisoner', 'imp']), { type: 'believe', character: 'fortune-teller' });
		expect(problems(s.seats, s.redHerring)).toEqual(['Der Fortune Teller braucht einen Red Herring.']);
		expect(step(s, { type: 'lock' })).toBe(s);
		expect(step(s, { type: 'herring', seat: 3 }).redHerring).toBe(3);
		const random = step(s, { type: 'herring', seat: null });
		expect(herringOptions(random.seats)).toContain(random.redHerring);
		expect(step(random, { type: 'lock' }).locked).toBe(true);
	});

	it('Scenario: Reassigning clears stale picks', () => {
		const drunk = step(assign(start(8), ['drunk', 'chef']), { type: 'believe', character: 'monk' });
		expect(drunk.seats[0].believed).toBe('monk');
		expect(step(drunk, { type: 'assign', seat: 0, character: 'empath' }).seats[0].believed).toBeNull();
		expect(step(drunk, { type: 'assign', seat: 2, character: 'monk' }).seats[0].believed).toBeNull();

		const ft = step(assign(start(5), ['washerwoman', 'empath', 'poisoner', 'imp', 'fortune-teller']), { type: 'herring', seat: 1 });
		expect(ft.redHerring).toBe(1);
		expect(step(ft, { type: 'assign', seat: 4, character: null }).redHerring).toBeNull();
		expect(step(ft, { type: 'assign', seat: 1, character: 'spy' }).redHerring).toBeNull();

		const believer = step(drunk, { type: 'believe', character: 'fortune-teller' }, { type: 'herring', seat: 1 });
		expect(believer.redHerring).toBe(1);
		expect(step(believer, { type: 'believe', character: 'monk' }).redHerring).toBeNull();
	});

	it('Scenario: Locked distribution cannot change', () => {
		const s = step(assign(start(7), F7), { type: 'lock' });
		expect(s.locked).toBe(true);
		expect(s.demon).toBe(6);
		expect(s.bluffs).toHaveLength(3);
		for (const c of s.bluffs) expect(alignment(c)).toBe('good');
		for (const action of [
			{ type: 'assign', seat: 0, character: null },
			{ type: 'assign', seat: 0, character: 'mayor' },
			{ type: 'swap', a: 0, b: 1 },
			{ type: 'move', from: 0, to: 3 },
			{ type: 'fill' },
			{ type: 'reroll' },
			{ type: 'believe', character: null },
			{ type: 'herring', seat: null },
			{ type: 'lock' }
		] as ClocktowerAction[])
			expect(step(s, action), action.type).toBe(s);
	});

	it('lock needs a complete valid distribution', () => {
		const open = assign(start(7), F7.slice(0, 6));
		expect(step(open, { type: 'lock' })).toBe(open);
		const over = assign(start(5), ['washerwoman', 'empath', 'poisoner', 'spy', 'imp']);
		expect(step(over, { type: 'lock' })).toBe(over);
	});
});

describe('clocktower reveal', () => {
	it('shows and hides each seat in turn, then starts night 1', () => {
		const s = step(assign(start(5), ['washerwoman', 'empath', 'poisoner', 'imp', 'chef']), { type: 'lock' });
		expect(step(s, { type: 'hide' })).toBe(s);
		const shown = step(s, { type: 'show' });
		expect(shown.phase).toEqual({ kind: 'reveal', seat: 0, shown: true });
		expect(step(shown, { type: 'show' })).toBe(shown);
		const last = step(s, ...Array.from({ length: 4 }, (): ClocktowerAction[] => [{ type: 'show' }, { type: 'hide' }]).flat(), { type: 'show' });
		expect(last.phase).toEqual({ kind: 'reveal', seat: 4, shown: true });
		const night = step(last, { type: 'hide' });
		expect(night.phase).toEqual({ kind: 'night' });
		expect(night.night).toMatchObject({ number: 1, at: 0, target: null, starpass: null, deaths: [] });
		expect(night.night?.screens[0]).toEqual({ screen: 'dusk' });
	});
});

const dead = (s: ClocktowerState, ...seats: number[]): ClocktowerState => ({
	...s,
	seats: s.seats.map((seat, i) => (seats.includes(i) ? { ...seat, alive: false } : seat))
});

const screen = (s: ClocktowerState) => s.night!.screens[s.night!.at];
const next = (s: ClocktowerState, n: number) => step(s, ...Array.from({ length: n }, (): ClocktowerAction => ({ type: 'next' })));

// F5 night 2: dusk, poisoner (1–4), imp (5–8), empath (9–12), fortune-teller (13–16), deaths (17)
const f5night2 = (s = seated(F5)) => dusk(s, 2);

describe('clocktower night', () => {
	it('builds the screens at dusk and moves screen by screen', () => {
		const s = f5night2();
		expect(s.phase).toEqual({ kind: 'night' });
		expect(s.night!.steps.map((x) => x.kind)).toEqual(['poisoner', 'imp', 'empath', 'fortune-teller']);
		expect(s.night!.screens).toHaveLength(18);
		expect(screen(next(s, 5))).toEqual({ screen: 'wake', step: 1 });
		expect(step(s, { type: 'back' })).toBe(s);
		const end = next(s, 17);
		expect(screen(end)).toEqual({ screen: 'deaths' });
		expect(step(end, { type: 'next' })).toBe(end);
	});

	it('night 1 ends at dawn after the last step', () => {
		const s = dusk(seated(F5), 1);
		const last = next(s, s.night!.screens.length - 1);
		expect(screen(last)).toEqual({ screen: 'sleep', step: 3 });
		const dawn = step(last, { type: 'next' });
		expect(dawn.phase).toEqual({ kind: 'dawn', screen: 'wake' });
		expect(dawn.today).toEqual({ number: 1, deadline: null, pending: null, nominations: [], high: 0, block: null, executed: null, closed: false, deaths: [] });
	});

	it('Scenario: Skip and back keep state', () => {
		// F7 night 2: dusk, monk (1–4), imp (5–8), ravenkeeper (9–12), spy (13–16), deaths (17)
		const imp = next(dusk(seated(F7), 2), 5);
		expect(screen(imp)).toEqual({ screen: 'wake', step: 1 });
		const noted = step(imp, { type: 'target', seat: 0 });
		expect(noted.night!.target).toBe(0);
		const raven = next(noted, 4);
		expect(screen(raven)).toEqual({ screen: 'wake', step: 2 });
		const skipped = step(raven, { type: 'skip' });
		expect(screen(skipped)).toEqual({ screen: 'wake', step: 3 });
		const once = step(skipped, { type: 'back' });
		expect(screen(once)).toEqual({ screen: 'sleep', step: 2 });
		const twice = step(once, { type: 'back' });
		expect(screen(twice)).toEqual({ screen: 'circle', step: 2 });
		expect(twice.night!.target).toBe(0);
		expect(screen(step(next(raven, 1), { type: 'skip' }))).toEqual({ screen: 'wake', step: 3 });
		expect(screen(step(skipped, { type: 'skip' }))).toEqual({ screen: 'deaths' });
		const atDusk = dusk(seated(F7), 2);
		expect(step(atDusk, { type: 'skip' })).toBe(atDusk);
	});

	it('notes the target only at the Imp step and only on a living seat', () => {
		const s = f5night2(dead(seated(F5), 0));
		const poisoner = next(s, 1);
		expect(step(poisoner, { type: 'target', seat: 1 })).toBe(poisoner);
		const imp = next(s, 6);
		expect(step(imp, { type: 'target', seat: 0 })).toBe(imp);
		expect(step(imp, { type: 'target', seat: 1 }).night!.target).toBe(1);
		expect(step(imp, { type: 'target', seat: 1 }, { type: 'target', seat: null }).night!.target).toBeNull();
	});

	it('Scenario: Starpass makes a living Minion the Imp', () => {
		const imp = next(f5night2(), 5);
		const passed = step(imp, { type: 'starpass', seat: 2 });
		expect(passed.demon).toBe(2);
		expect(passed.seats[2].character).toBe('imp');
		expect(passed.history).toEqual([{ night: 2, from: 3, to: 2, was: 'poisoner', kind: 'starpass' }]);
		expect(passed.night!.starpass).toBe(2);
		expect(passed.night!.target).toBe(3);
		expect(passed.night!.steps.map((x) => x.kind)).toEqual(['poisoner', 'imp', 'new-imp', 'empath', 'fortune-teller']);
		expect(passed.night!.steps[2]).toEqual({ kind: 'new-imp', seats: [2], as: 'imp', note: null });
		expect(passed.night!.at).toBe(5);
		expect(screen(next(passed, 4))).toEqual({ screen: 'wake', step: 2 });
		expect(step(passed, { type: 'starpass', seat: 2 })).toBe(passed);
		expect(step(imp, { type: 'starpass', seat: 0 })).toBe(imp);
		expect(step(imp, { type: 'starpass', seat: 3 })).toBe(imp);
	});

	it('Scenario: Scarlet Woman forced on a starpass', () => {
		// F15: poisoner 11, spy 12, scarlet-woman 13, imp 14
		const six = dusk(dead(seated(F15), 0, 1, 2, 3, 4, 5, 6, 7, 12), 2);
		const imp = { ...six, night: { ...six.night!, at: six.night!.screens.findIndex((x) => 'step' in x && six.night!.steps[x.step].kind === 'imp') } };
		expect(heirs(imp)).toEqual([13]);
		expect(step(imp, { type: 'starpass', seat: 11 })).toBe(imp);
		expect(step(imp, { type: 'starpass', seat: 13 }).demon).toBe(13);

		const four = { ...imp, seats: dead(imp, 8, 9).seats };
		expect(heirs(four)).toEqual([11, 13]);
		expect(step(four, { type: 'starpass', seat: 11 }).demon).toBe(11);
	});

	it('Scenario: Starpass without a living Minion', () => {
		const imp = next(f5night2(dead(seated(F5), 2)), 1);
		expect(screen(imp)).toEqual({ screen: 'wake', step: 0 });
		expect(imp.night!.steps[0].kind).toBe('imp');
		expect(heirs(imp)).toEqual([]);
		const self = step(imp, { type: 'starpass', seat: null });
		expect(self.demon).toBe(3);
		expect(self.history).toEqual([]);
		expect(self.night!.target).toBe(3);
		expect(self.night!.steps.map((x) => x.kind)).toEqual(['imp', 'empath', 'fortune-teller']);
		const end = step(self, { type: 'skip' }, { type: 'skip' }, { type: 'skip' }, { type: 'deaths', seats: [3] });
		expect(end.winner).toBe('good');

		const minion = next(f5night2(), 5);
		expect(step(minion, { type: 'starpass', seat: null })).toBe(minion);
	});

	it("Scenario: Death step records the night's deaths", () => {
		const end = next(dusk(seated(F7), 2), 17);
		const s = step(end, { type: 'deaths', seats: [1, 4] });
		expect(s.seats.map((x) => x.alive)).toEqual([true, false, true, true, false, true, true]);
		expect(s.seats[1].ghostVote && s.seats[4].ghostVote).toBe(true);
		expect(s.night!.deaths).toEqual([1, 4]);
		expect(s.phase).toEqual({ kind: 'dawn', screen: 'wake' });
		expect(s.today!.deaths).toEqual([1, 4]);
		expect(s.winner).toBeNull();

		const nobody = step(end, { type: 'deaths', seats: [] });
		expect(nobody.seats.every((x) => x.alive)).toBe(true);
		expect(nobody.today!.deaths).toEqual([]);

		const gone = next(dusk(dead(seated(F7), 5), 2), 13);
		expect(screen(gone)).toEqual({ screen: 'deaths' });
		for (const seats of [[5], [1, 1], [7], [-1]]) expect(step(gone, { type: 'deaths', seats })).toBe(gone);
		expect(step(next(end, 0), { type: 'back' }, { type: 'deaths', seats: [1] }).phase).toEqual({ kind: 'night' });
	});

	it('Scenario: Win check after the death step', () => {
		const end = next(f5night2(dead(seated(F5), 0, 1)), 13);
		expect(screen(end)).toEqual({ screen: 'deaths' });
		const s = step(end, { type: 'deaths', seats: [4] });
		expect(s.winner).toBe('evil');
		expect(s.phase).toEqual({ kind: 'dawn', screen: 'wake' });
		const deaths = step(s, { type: 'next' });
		expect(deaths.phase).toEqual({ kind: 'dawn', screen: 'deaths' });
		expect(step(deaths, { type: 'next' }).phase).toEqual({ kind: 'over', revealed: false });

		const calm = step(next(f5night2(), 17), { type: 'deaths', seats: [0] }, { type: 'next' }, { type: 'next' });
		expect(calm.phase).toEqual({ kind: 'dawn', screen: 'timer' });
	});

	it('rerolls the bluffs at night', () => {
		const s = dusk(seated(F7), 1);
		const r = step(s, { type: 'bluffs' });
		expect(r.bluffs).not.toEqual(s.bluffs);
		for (const c of r.bluffs) {
			expect(alignment(c)).toBe('good');
			expect(ids(r)).not.toContain(c);
		}
	});

	it('the storyteller declares the winner at night', () => {
		const s = step(dusk(seated(F7), 2), { type: 'declare', winner: 'evil' });
		expect(s.winner).toBe('evil');
		expect(s.phase).toEqual({ kind: 'over', revealed: false });
	});
});

describe('clocktower phase keys', () => {
	it('gives every screen its own key', () => {
		const s = start(5);
		expect(clocktower.phase(s)).toBe('setup');
		const locked = seated(F5);
		expect(clocktower.phase(locked)).toBe('reveal-0-name');
		expect(clocktower.phase(step(locked, { type: 'show' }))).toBe('reveal-0-card');
		const n2 = f5night2();
		expect(clocktower.phase(n2)).toBe('night-2-0');
		expect(clocktower.phase(next(n2, 7))).toBe('night-2-7');
		const dawn = step(next(n2, 17), { type: 'deaths', seats: [] });
		expect(clocktower.phase(dawn)).toBe('dawn-2-wake');
		const over = step(n2, { type: 'declare', winner: 'good' });
		expect(clocktower.phase(over)).toBe('over');
		expect(clocktower.phase(step(over, { type: 'reveal' }))).toBe('over-reveal');
	});
});
