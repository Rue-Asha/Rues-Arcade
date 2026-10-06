import type { DatabaseSync } from 'node:sqlite';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { playerId, playersApi, savedId } from '#lib/players.ts';
import { migrate, openDb } from '#lib/server/db.ts';
import { addPlayer, deletePlayer, listPlayers, renamePlayer } from '#lib/server/players.ts';
import { loadSession, saveSession } from '#lib/session.ts';

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

// the real store on a real migrated database behind the fetch the client uses
function serve(db: DatabaseSync): typeof fetch {
	return async (input, init) => {
		const match = /^\/api\/players(?:\/(\d+))?$/.exec(String(input));
		if (!match) return new Response(null, { status: 404 });
		const method = init?.method ?? 'GET';
		const id = match[1];
		const name = init?.body ? JSON.parse(String(init.body)).name : '';
		const reply = (r: { ok: true; player?: unknown } | { ok: false; status: number; message: string }, ok = 200) =>
			r.ok
				? new Response(r.player ? JSON.stringify(r.player) : null, { status: r.player ? ok : 204 })
				: new Response(JSON.stringify({ message: r.message }), { status: r.status });
		if (method === 'GET') return new Response(JSON.stringify(listPlayers(db)));
		if (method === 'POST') return reply(addPlayer(db, name), 201);
		if (method === 'PATCH') return reply(renamePlayer(db, Number(id), name));
		return reply(deletePlayer(db, Number(id)));
	};
}

const unreachable: typeof fetch = () => Promise.reject(new TypeError('Failed to fetch'));

const names = (players: { name: string }[]) => players.map((p) => p.name);

describe('roster', () => {
	let storage: FakeStorage;
	let db: DatabaseSync;

	beforeEach(() => {
		storage = new FakeStorage();
		vi.stubGlobal('window', { localStorage: storage });
		db = openDb(':memory:');
		migrate(db);
		vi.stubGlobal('fetch', serve(db));
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('talks to the real store through the stubbed fetch', async () => {
		expect(await playersApi.add('Alex')).toMatchObject({ ok: true, player: { name: 'Alex' } });
		expect((await playersApi.add('alex')).ok).toBe(false);
		expect(listPlayers(db).map((p) => p.name)).toEqual(['Alex']);
		vi.stubGlobal('fetch', unreachable);
		await expect(playersApi.list()).rejects.toThrow();
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

	const stored = (...list: string[]) =>
		storage.setItem('arcade:roster', JSON.stringify(list.map((name, i) => ({ id: `p${i + 1}`, name }))));

	it('Scenario: Matching guests become linked on load', async () => {
		stored('alex', 'Gustav', 'Bo');
		const alex = addPlayer(db, 'Alex');
		const bo = addPlayer(db, 'Bo');
		const roster = await fresh();

		await roster.ready();

		expect(roster.players).toEqual([
			{ id: playerId(alex.ok ? alex.player.id : 0), name: 'Alex' },
			{ id: 'p2', name: 'Gustav' },
			{ id: playerId(bo.ok ? bo.player.id : 0), name: 'Bo' }
		]);
		expect(roster.players.map((p) => savedId(p.id) === null)).toEqual([false, true, false]);
		expect(roster.saved.map((p) => p.name)).toEqual(['Alex', 'Bo']);
		expect(names(JSON.parse(storage.getItem('arcade:roster')!))).toEqual(['Alex', 'Gustav', 'Bo']);
	});

	it('refreshes the name of a linked entry on load', async () => {
		const alex = addPlayer(db, 'Alex');
		const id = alex.ok ? alex.player.id : 0;
		storage.setItem('arcade:roster', JSON.stringify([{ id: playerId(id), name: 'Alex' }]));
		renamePlayer(db, id, 'Alexander');
		const roster = await fresh();

		await roster.ready();

		expect(roster.players).toEqual([{ id: playerId(id), name: 'Alexander' }]);
	});

	it('Scenario: Two entries matching one saved player', async () => {
		stored('Alex', 'alex ');
		const alex = addPlayer(db, 'Alex');
		const roster = await fresh();

		await roster.ready();

		expect(roster.players).toEqual([
			{ id: playerId(alex.ok ? alex.player.id : 0), name: 'Alex' },
			{ id: 'p2', name: 'alex ' }
		]);
	});

	it('refuses to save a guest whose saved player is already in the roster', async () => {
		stored('Alex', 'alex ');
		addPlayer(db, 'Alex');
		const roster = await fresh();
		await roster.ready();
		const before = roster.players;

		const result = await roster.promote(before[1].id);

		expect(result).toEqual({ ok: false, message: '„Alex“ ist schon dabei.' });
		expect(roster.players).toEqual(before);
		expect(new Set(roster.players.map((p) => p.id)).size).toBe(2);
	});

	it('Scenario: Linked entry whose saved player is gone becomes a guest', async () => {
		const rita = addPlayer(db, 'Rita');
		const id = rita.ok ? rita.player.id : 0;
		storage.setItem('arcade:roster', JSON.stringify([{ id: playerId(id), name: 'Rita' }, { id: 'p2', name: 'Bo' }]));
		deletePlayer(db, id);
		addPlayer(db, 'Tom');
		const roster = await fresh();

		await roster.ready();

		expect(names(roster.players)).toEqual(['Rita', 'Bo']);
		expect(roster.players.every((p) => roster.isGuest(p))).toBe(true);
		expect(roster.players[1].id).toBe('p2');
		expect(roster.rename(roster.players[0].id, 'Rita B')).toEqual({ ok: true });
	});

	it('refuses to rename a saved player to the name of a roster guest', async () => {
		addPlayer(db, 'Alex');
		const roster = await fresh();
		await roster.ready();
		roster.add('Alex');
		roster.add('Gustav');

		const result = await roster.renameSaved(dbId('Alex'), 'gustav');

		expect(result).toEqual({ ok: false, message: '„Gustav“ ist schon dabei.' });
		expect(names(roster.players)).toEqual(['Alex', 'Gustav']);
		expect(roster.saved.map((s) => s.name)).toEqual(['Alex']);
		expect(listPlayers(db).map((p) => p.name)).toEqual(['Alex']);
	});

	it('Scenario: Server unreachable leaves the roster unchanged', async () => {
		stored('alex', 'Bo');
		const alex = addPlayer(db, 'Alex');
		vi.stubGlobal('fetch', unreachable);
		const down = await fresh();

		await down.ready();

		expect(down.players).toEqual([
			{ id: 'p1', name: 'alex' },
			{ id: 'p2', name: 'Bo' }
		]);
		expect(down.savedError).toBeTruthy();
		expect(down.saved).toEqual([]);

		vi.stubGlobal('fetch', serve(db));
		const up = await fresh();
		await up.ready();

		expect(up.players[0]).toEqual({ id: playerId(alex.ok ? alex.player.id : 0), name: 'Alex' });
		expect(up.savedError).toBe('');
	});

	it('syncs once and hands out the same promise', async () => {
		const roster = await fresh();
		const first = roster.ready();

		expect(roster.ready()).toBe(first);
		await first;
		expect(roster.ready()).toBe(first);
	});

	const dbId = (name: string) => listPlayers(db).find((p) => p.name === name)!.id;

	it('Scenario: Typed name matching a saved player adds the saved player', async () => {
		addPlayer(db, 'Alex');
		const roster = await fresh();
		await roster.ready();

		expect(roster.add(' alex ')).toEqual({ ok: true });

		expect(roster.players).toEqual([{ id: playerId(dbId('Alex')), name: 'Alex' }]);
		expect(roster.isGuest(roster.players[0])).toBe(false);
	});

	it('Scenario: Saved player already in the roster is not added twice', async () => {
		addPlayer(db, 'Alex');
		const roster = await fresh();
		await roster.ready();
		roster.addSaved(dbId('Alex'));

		for (const result of [roster.addSaved(dbId('Alex')), roster.add('alex')]) {
			expect(result.ok).toBe(false);
			expect(result.ok === false && result.message).toBe('„Alex“ ist schon dabei.');
		}
		expect(names(roster.players)).toEqual(['Alex']);
	});

	it('Scenario: Guest named like a roster entry rejected', async () => {
		const roster = await fresh();
		await roster.ready();
		roster.add('Gustav');

		const result = roster.add('gustav');

		expect(result.ok).toBe(false);
		expect(result.ok === false && result.message).toBe('„Gustav“ ist schon dabei.');
		expect(names(roster.players)).toEqual(['Gustav']);
		expect(roster.isGuest(roster.players[0])).toBe(true);
	});

	it('rejects a saved player it does not know', async () => {
		const roster = await fresh();
		await roster.ready();

		expect(roster.addSaved(99).ok).toBe(false);
		expect(roster.players).toEqual([]);
	});

	it('only guests are renamed in the roster', async () => {
		addPlayer(db, 'Alex');
		const roster = await fresh();
		await roster.ready();
		roster.addSaved(dbId('Alex'));
		roster.add('Gustav');

		const saved = roster.rename(roster.players[0].id, 'Ali');
		expect(saved.ok).toBe(false);
		expect(roster.rename(roster.players[1].id, 'Gus')).toEqual({ ok: true });
		expect(names(roster.players)).toEqual(['Alex', 'Gus']);
	});

	it('Scenario: Removing a saved player\'s entry keeps the saved player', async () => {
		addPlayer(db, 'Alex');
		const roster = await fresh();
		await roster.ready();
		roster.addSaved(dbId('Alex'));

		roster.remove(roster.players[0].id);

		expect(roster.players).toEqual([]);
		expect(roster.saved.map((p) => p.name)).toEqual(['Alex']);
		expect(listPlayers(db).map((p) => p.name)).toEqual(['Alex']);
	});

	it('Scenario: Saved player id is the same on every device', async () => {
		addPlayer(db, 'Alex');
		const rosters = [];
		for (let device = 0; device < 2; device++) {
			vi.stubGlobal('window', { localStorage: new FakeStorage() });
			const roster = await fresh();
			await roster.ready();
			roster.add('Alex');
			roster.add('Gustav');
			rosters.push(roster.players);
		}

		const [a, b] = rosters;
		expect(a[0].id).toBe(playerId(dbId('Alex')));
		expect(b[0].id).toBe(a[0].id);
		expect(a[1].id).not.toBe(b[1].id);
		expect(savedId(a[1].id)).toBeNull();
	});

	it('Scenario: Saving a guest links it in place', async () => {
		const roster = await fresh();
		await roster.ready();
		for (const name of ['Bo', 'Gustav', 'Cleo']) roster.add(name);
		const [bo, gustav, cleo] = roster.players;

		expect(await roster.promote(gustav.id)).toEqual({ ok: true });

		expect(roster.saved.map((p) => p.name)).toEqual(['Gustav']);
		expect(listPlayers(db).map((p) => p.name)).toEqual(['Gustav']);
		expect(roster.players).toEqual([bo, { id: playerId(dbId('Gustav')), name: 'Gustav' }, cleo]);
		expect(roster.isGuest(roster.players[1])).toBe(false);
		expect(names(JSON.parse(storage.getItem('arcade:roster')!))).toEqual(['Bo', 'Gustav', 'Cleo']);
	});

	it('Scenario: Saving a guest whose name is already saved links to it', async () => {
		const roster = await fresh();
		await roster.ready();
		roster.add('Bo');
		roster.add('alex');
		expect(await roster.createSaved('Alex')).toEqual({ ok: true });

		expect(await roster.promote(roster.players[1].id)).toEqual({ ok: true });

		expect(listPlayers(db).map((p) => p.name)).toEqual(['Alex']);
		expect(roster.players[1]).toEqual({ id: playerId(dbId('Alex')), name: 'Alex' });
		expect(roster.players).toHaveLength(2);
	});

	it('creates saved players without touching the roster, and reports the server message', async () => {
		const roster = await fresh();
		await roster.ready();

		expect(await roster.createSaved('Ute')).toEqual({ ok: true });
		const again = await roster.createSaved('ute');

		expect(again.ok).toBe(false);
		expect(again.ok === false && again.message).toContain('schon gespeichert');
		expect(roster.saved.map((p) => p.name)).toEqual(['Ute']);
		expect(roster.players).toEqual([]);
	});

	it('keeps guests working when the server is gone mid-change', async () => {
		const roster = await fresh();
		await roster.ready();
		roster.add('Gustav');
		vi.stubGlobal('fetch', unreachable);

		for (const result of [
			await roster.promote(roster.players[0].id),
			await roster.createSaved('Ute'),
			await roster.renameSaved(1, 'Uta'),
			await roster.deleteSaved(1)
		]) {
			expect(result.ok).toBe(false);
			expect(result.ok === false && result.message).toBeTruthy();
		}
		expect(roster.players).toEqual([{ id: roster.players[0].id, name: 'Gustav' }]);
		expect(roster.isGuest(roster.players[0])).toBe(true);
	});

	it('Scenario: Renaming a saved player renames its roster entry', async () => {
		addPlayer(db, 'Alex');
		const roster = await fresh();
		await roster.ready();
		roster.add('Bo');
		roster.add('Alex');
		roster.add('Cleo');
		const id = roster.players[1].id;

		expect(await roster.renameSaved(dbId('Alex'), 'Alexander')).toEqual({ ok: true });

		expect(roster.players[1]).toEqual({ id, name: 'Alexander' });
		expect(names(roster.players)).toEqual(['Bo', 'Alexander', 'Cleo']);
		expect(roster.saved.map((p) => p.name)).toEqual(['Alexander']);
		expect(names(JSON.parse(storage.getItem('arcade:roster')!))).toEqual(['Bo', 'Alexander', 'Cleo']);
	});

	it('shows the server message when a saved rename is refused', async () => {
		addPlayer(db, 'Alex');
		addPlayer(db, 'Bo');
		const roster = await fresh();
		await roster.ready();

		const result = await roster.renameSaved(dbId('Bo'), 'alex');

		expect(result.ok).toBe(false);
		expect(result.ok === false && result.message).toContain('schon gespeichert');
		expect(roster.saved.map((p) => p.name)).toEqual(['Alex', 'Bo']);
	});

	it('deletes a saved player and its roster entry', async () => {
		addPlayer(db, 'Rita');
		const roster = await fresh();
		await roster.ready();
		roster.add('Rita');
		roster.add('Bo');

		expect(await roster.deleteSaved(dbId('Rita'))).toEqual({ ok: true });

		expect(names(roster.players)).toEqual(['Bo']);
		expect(roster.saved).toEqual([]);
		expect(listPlayers(db)).toEqual([]);
	});

	it('Scenario: Deleting a saved player mid-game keeps the session snapshot', async () => {
		addPlayer(db, 'Alex');
		const roster = await fresh();
		await roster.ready();
		roster.add('Alex');
		const alex = roster.players[0];
		saveSession('quiz', 1, { players: [alex], phase: 'play' });

		await roster.deleteSaved(dbId('Alex'));

		expect(roster.players).toEqual([]);
		expect(loadSession('quiz', 1)).toEqual({ state: { players: [alex], phase: 'play' } });
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
