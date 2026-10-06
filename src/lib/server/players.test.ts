import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { DatabaseSync } from 'node:sqlite';
import { NAME_MAX, nameError, playerId, savedId } from '#lib/players.ts';
import { migrate, openDb } from './db.ts';
import { addPlayer, deletePlayer, listPlayers, renamePlayer } from './players.ts';

let db: DatabaseSync;

beforeEach(() => {
	db = openDb(':memory:');
	migrate(db);
});

afterEach(() => db.close());

function names(): string[] {
	return listPlayers(db).map((p) => p.name);
}

function added(name: string) {
	const saved = addPlayer(db, name);
	if (!saved.ok) throw new Error(saved.message);
	return saved.player;
}

describe('saved players', () => {
	it('Scenario: Add, rename, delete and list saved players', () => {
		const cleo = added('Cleo');
		added(' alex ');
		const bo = added('Bo');

		const renamed = renamePlayer(db, bo.id, 'Bea');
		const gone = deletePlayer(db, cleo.id);

		expect(renamed).toEqual({ ok: true, player: { id: bo.id, name: 'Bea' } });
		expect(gone).toEqual({ ok: true });
		expect(names()).toEqual(['alex', 'Bea']);
		expect(listPlayers(db).every((p) => typeof p.id === 'number')).toBe(true);
	});

	it('Scenario: Empty or whitespace saved name rejected', () => {
		const alex = added('Alex');

		for (const result of [
			addPlayer(db, ''),
			addPlayer(db, '   '),
			renamePlayer(db, alex.id, '   ')
		])
			expect(result).toEqual({ ok: false, status: 400, message: 'Bitte gib einen Namen ein.' });
		expect(names()).toEqual(['Alex']);
	});

	it('Scenario: Overlong saved name rejected', () => {
		const alex = added('Alex');
		const long = 'x'.repeat(41);

		for (const result of [addPlayer(db, long), renamePlayer(db, alex.id, long)]) {
			expect(result).toMatchObject({ ok: false, status: 400 });
			expect(result.ok === false && result.message).toContain('40');
		}
		expect(addPlayer(db, 'x'.repeat(40)).ok).toBe(true);
		expect(names()).toEqual(['Alex', 'x'.repeat(40)]);
	});

	it('Scenario: Duplicate saved name rejected', () => {
		added('Alex');
		const bo = added('Bo');
		added('Özlem');

		const dup = addPlayer(db, 'ALEX ');
		const renamed = renamePlayer(db, bo.id, 'alex');
		const umlaut = addPlayer(db, 'özlem');

		for (const result of [dup, renamed, umlaut]) expect(result).toMatchObject({ ok: false, status: 409 });
		expect(dup.ok === false && dup.message).toBe('„ALEX“ ist schon gespeichert.');
		expect(names()).toEqual(['Alex', 'Bo', 'Özlem']);
	});

	it('renaming a player to its own name in another case is allowed', () => {
		const alex = added('Alex');

		expect(renamePlayer(db, alex.id, 'alex')).toEqual({ ok: true, player: { id: alex.id, name: 'alex' } });
	});

	it('Scenario: Unknown saved player id', () => {
		added('Alex');
		const gone = { ok: false, status: 404, message: 'Diesen Spieler gibt es nicht mehr.' };

		expect(renamePlayer(db, 999, 'Bo')).toEqual(gone);
		expect(deletePlayer(db, 999)).toEqual(gone);
		expect(names()).toEqual(['Alex']);
	});

	it('lists alphabetically ignoring case and umlauts', () => {
		for (const n of ['zoe', 'Ärger', 'bo', 'Anna']) added(n);

		expect(names()).toEqual(['Anna', 'Ärger', 'bo', 'zoe']);
	});

	it('nameError names the two limits', () => {
		expect(nameError('Alex')).toBeNull();
		expect(nameError('x'.repeat(NAME_MAX))).toBeNull();
		expect(nameError('')).toBe('Bitte gib einen Namen ein.');
		expect(nameError('x'.repeat(NAME_MAX + 1))).toBe('Höchstens 40 Zeichen.');
	});

	it('savedId reads only player-<digits>', () => {
		expect(savedId(playerId(7))).toBe(7);
		for (const id of ['p1', 'player-', 'player-x', 'player-1a', '1-player-1']) expect(savedId(id)).toBeNull();
	});
});
