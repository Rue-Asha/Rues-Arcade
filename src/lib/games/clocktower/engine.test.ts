import { describe, expect, it } from 'vitest';
import { alignment, byId } from './characters.ts';
import { clocktower } from './engine.ts';
import { F7 } from './fixtures.ts';
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
