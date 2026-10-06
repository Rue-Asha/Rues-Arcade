import type { DatabaseSync } from 'node:sqlite';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { migrate, openDb } from './db.ts';
import { addPlayed, listPlayed, removePlayed } from './played.ts';
import { addPlayer, deletePlayer } from './players.ts';
import { listSurveys } from './surveys.ts';

let db: DatabaseSync;

beforeEach(() => {
	db = openDb(':memory:');
	migrate(db);
});

afterEach(() => db.close());

function player(name: string): number {
	const saved = addPlayer(db, name);
	if (!saved.ok) throw new Error(saved.message);
	return saved.player.id;
}

describe('played-with store', () => {
	it('Scenario: Feud played-with has no duplicates', () => {
		const [survey] = listSurveys(db);
		const alex = player('Alex');
		const bo = player('Bo');

		addPlayed(db, survey.id, [alex]);
		addPlayed(db, survey.id, [alex, bo, bo]);

		expect(listPlayed(db)).toEqual([{ surveyId: survey.id, playerIds: [alex, bo] }]);
	});

	it('Scenario: Feud played-with follows a deleted player', () => {
		const [first, second, third] = listSurveys(db);
		const alex = player('Alex');
		const bo = player('Bo');
		addPlayed(db, first.id, [alex, bo]);
		addPlayed(db, second.id, [alex]);
		addPlayed(db, third.id, [bo]);

		deletePlayer(db, alex);

		expect(listPlayed(db)).toEqual([
			{ surveyId: first.id, playerIds: [bo] },
			{ surveyId: third.id, playerIds: [bo] }
		]);
	});

	it('skips surveys and players that are gone, and removes one entry', () => {
		const [survey] = listSurveys(db);
		const alex = player('Alex');

		addPlayed(db, 99999, [alex]);
		addPlayed(db, survey.id, [alex, 99999]);
		expect(listPlayed(db)).toEqual([{ surveyId: survey.id, playerIds: [alex] }]);

		expect(removePlayed(db, survey.id, alex)).toBe(true);
		expect(removePlayed(db, survey.id, alex)).toBe(false);
		expect(listPlayed(db)).toEqual([]);
	});
});
