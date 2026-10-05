import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { imposter } from '#lib/games/imposter/engine.ts';

class FakeStorage {
	items = new Map<string, string>();
	getItem(key: string) {
		return this.items.get(key) ?? null;
	}
	setItem(key: string, value: string) {
		this.items.set(key, value);
	}
	removeItem(key: string) {
		this.items.delete(key);
	}
}

async function fresh() {
	vi.resetModules();
	return {
		session: await import('./session.ts'),
		roster: (await import('./roster.svelte.ts')).roster
	};
}

describe('session', () => {
	let storage: FakeStorage;

	beforeEach(() => {
		storage = new FakeStorage();
		vi.stubGlobal('window', { localStorage: storage });
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('discards an older version, invalid JSON and a state without the game shape', async () => {
		const { session } = await fresh();

		session.saveSession('imposter', 1, { phase: 'view' });
		expect(session.loadSession('imposter', 2)).toEqual({ discarded: true });
		expect(storage.getItem('arcade:session:imposter')).toBeNull();
		expect(session.loadSession('imposter', 2)).toBeNull();

		for (const raw of ['{not json', 'null', '[]', '{"v":1}', '"text"']) {
			storage.setItem('arcade:session:imposter', raw);
			expect(session.loadSession('imposter', 1)).toEqual({ discarded: true });
			expect(storage.getItem('arcade:session:imposter')).toBeNull();
		}

		const valid = imposter.init({
			players: [
				{ id: 'a', name: 'Alex' },
				{ id: 'b', name: 'Bo' },
				{ id: 'c', name: 'Cleo' }
			],
			config: {},
			content: [{ id: 1, a: 'Crew?', b: 'Imposter?' }],
			seed: 7
		});
		for (const state of [
			{},
			{ ...valid, players: undefined },
			{ ...valid, revealIndex: '0' },
			{ ...valid, players: [] },
			{ ...valid, players: [{ id: 'a' }] },
			{ ...valid, used: ['1'] }
		]) {
			session.saveSession('imposter', 1, state);
			expect(session.loadSession('imposter', 1, valid)).toEqual({ discarded: true });
			expect(storage.getItem('arcade:session:imposter')).toBeNull();
		}
		session.saveSession('imposter', 1, valid);
		expect(session.loadSession('imposter', 1, valid)).toEqual({ state: valid });
	});

	it('Scenario: Two tabs last write wins', async () => {
		const tabA = (await fresh()).session;
		const tabB = (await fresh()).session;

		tabA.saveSession('wavelength', 1, { tab: 'A' });
		tabB.saveSession('wavelength', 1, { tab: 'B' });

		expect(tabA.loadSession('wavelength', 1)).toEqual({ state: { tab: 'B' } });
		expect(tabB.loadSession('wavelength', 1)).toEqual({ state: { tab: 'B' } });
	});

	it('Scenario: Roster edit mid-game keeps the session snapshot', async () => {
		const { session, roster } = await fresh();
		for (const name of ['Alex', 'Bo', 'Cleo']) roster.add(name);

		const state = imposter.init({
			players: roster.players,
			config: {},
			content: [{ id: 1, a: 'Crew?', b: 'Imposter?' }],
			seed: 7
		});
		session.saveSession('imposter', imposter.stateVersion, state);
		roster.remove(roster.players[1].id);

		const loaded = session.loadSession<typeof state>('imposter', imposter.stateVersion);
		expect(loaded && 'state' in loaded && loaded.state.players.map((p) => p.name)).toEqual([
			'Alex',
			'Bo',
			'Cleo'
		]);
		expect(roster.players.map((p) => p.name)).toEqual(['Alex', 'Cleo']);
	});

	it('keeps sessions per game and clears one', async () => {
		const { session } = await fresh();
		session.saveSession('imposter', 1, { n: 1 });
		session.saveSession('wavelength', 1, { n: 2 });

		session.clearSession('imposter');

		expect(session.loadSession('imposter', 1)).toBeNull();
		expect(session.loadSession('wavelength', 1)).toEqual({ state: { n: 2 } });
	});
});
