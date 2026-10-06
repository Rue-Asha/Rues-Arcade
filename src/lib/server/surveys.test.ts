import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { DatabaseSync } from 'node:sqlite';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { board } from '#lib/content/survey.ts';
import type { Survey } from '#lib/content/types.ts';
import { loadMigrations, migrate, openDb } from './db.ts';
import { addPlayer } from './players.ts';
import { listSurveys, removeSurvey } from './surveys.ts';

let dir: string;
let db: DatabaseSync;

beforeEach(() => {
	dir = mkdtempSync(join(tmpdir(), 'arcade-surveys-'));
	db = openDb(join(dir, 'arcade.db'));
});

afterEach(() => db.close());

function surveyCount(): number {
	return Number(db.prepare('SELECT count(*) AS n FROM feud_surveys').get()?.n);
}

describe('surveys', () => {
	it('Scenario: Survey board order by points', () => {
		const survey: Survey = {
			id: 1,
			question: 'Nenne einen Buchstaben',
			answers: [
				{ text: 'A', points: 10 },
				{ text: 'B', points: 30 },
				{ text: 'C', points: 10 },
				{ text: 'D', points: 20 }
			]
		};

		expect(board(survey).map((a) => a.text)).toEqual(['B', 'D', 'A', 'C']);
		expect(survey.answers.map((a) => a.text)).toEqual(['A', 'B', 'C', 'D']);
	});

	it('Scenario: Surveys seeded once', () => {
		migrate(db, loadMigrations().filter((m) => m.name <= '0004_players.sql'));
		expect(db.prepare("SELECT 1 FROM sqlite_master WHERE name = 'feud_surveys'").get()).toBeUndefined();

		migrate(db);
		expect(surveyCount()).toBe(26);
		migrate(db);

		expect(surveyCount()).toBe(26);
		const first = listSurveys(db)[0];
		expect(first.answers.length).toBeGreaterThanOrEqual(3);
		expect(first.answers[0]).toEqual({ text: expect.any(String), points: expect.any(Number) });
	});

	it('Scenario: Deleted seed surveys stay deleted', () => {
		migrate(db);
		const [seed] = listSurveys(db);
		expect(removeSurvey(db, seed.id)).toBe(true);

		migrate(db);

		expect(listSurveys(db).some((s) => s.question === seed.question)).toBe(false);
		expect(surveyCount()).toBe(25);
	});

	it('Scenario: Deleting a survey removes its played-with entries', () => {
		migrate(db);
		const [survey, other] = listSurveys(db);
		const alex = addPlayer(db, 'Alex');
		const bo = addPlayer(db, 'Bo');
		if (!alex.ok || !bo.ok) throw new Error('players not saved');
		const played = db.prepare('INSERT INTO feud_played (survey_id, player_id) VALUES (?, ?)');
		for (const p of [alex.player, bo.player]) played.run(survey.id, p.id);
		played.run(other.id, alex.player.id);

		removeSurvey(db, survey.id);

		expect(db.prepare('SELECT * FROM feud_played WHERE survey_id = ?').all(survey.id)).toEqual([]);
		expect(db.prepare('SELECT survey_id FROM feud_played').all()).toEqual([{ survey_id: other.id }]);
		expect(db.prepare('SELECT count(*) AS n FROM players').get()?.n).toBe(2);
	});
});
