import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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
	return (await import('./roster.svelte.ts')).roster;
}

const names = (players: { name: string }[]) => players.map((p) => p.name);

describe('roster', () => {
	let storage: FakeStorage;

	beforeEach(() => {
		storage = new FakeStorage();
		vi.stubGlobal('window', { localStorage: storage });
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('Scenario: Rename and remove a player', async () => {
		const roster = await fresh();
		roster.add('Alex');
		roster.add('Bo');

		const alex = roster.players[0];
		expect(roster.rename(alex.id, 'Ali')).toEqual({ ok: true });
		roster.remove(roster.players[1].id);

		expect(names(roster.players)).toEqual(['Ali']);
		expect(names(JSON.parse(storage.getItem('arcade:roster')!))).toEqual(['Ali']);
	});

	it('Scenario: Empty or whitespace name rejected', async () => {
		const roster = await fresh();

		for (const name of ['', '   ']) {
			const result = roster.add(name);
			expect(result.ok).toBe(false);
			expect(result.ok === false && result.message).toBeTruthy();
		}
		expect(roster.players).toEqual([]);

		roster.add('Alex');
		const rename = roster.rename(roster.players[0].id, '  ');
		expect(rename.ok).toBe(false);
		expect(names(roster.players)).toEqual(['Alex']);
	});

	it('Scenario: Duplicate name rejected', async () => {
		const roster = await fresh();
		roster.add('Alex');
		roster.add('Bo');

		const add = roster.add('alex');
		expect(add.ok).toBe(false);
		expect(add.ok === false && add.message).toBeTruthy();

		const rename = roster.rename(roster.players[1].id, 'alex');
		expect(rename.ok).toBe(false);
		expect(rename.ok === false && rename.message).toBeTruthy();

		expect(names(roster.players)).toEqual(['Alex', 'Bo']);
		expect(roster.rename(roster.players[0].id, 'ALEX')).toEqual({ ok: true });
	});

	it('Scenario: Storage unavailable works for the session', async () => {
		vi.stubGlobal('window', {
			get localStorage(): Storage {
				throw new DOMException('denied', 'SecurityError');
			}
		});
		const roster = await fresh();

		expect(roster.add('Alex')).toEqual({ ok: true });
		expect(roster.add('Bo')).toEqual({ ok: true });
		roster.move(roster.players[1].id, 0);

		expect(roster.rename(roster.players[1].id, 'Ali')).toEqual({ ok: true });
		expect(names(roster.players)).toEqual(['Bo', 'Ali']);
	});

	it('reloads the stored order and trims names', async () => {
		const roster = await fresh();
		roster.add('  Alex ');
		roster.add('Bo');
		roster.add('Cleo');
		roster.move(roster.players[2].id, 0);

		expect(names((await fresh()).players)).toEqual(['Cleo', 'Alex', 'Bo']);
	});

	it('ignores a corrupt stored roster', async () => {
		storage.setItem('arcade:roster', '{nope');
		expect((await fresh()).players).toEqual([]);
	});
});
