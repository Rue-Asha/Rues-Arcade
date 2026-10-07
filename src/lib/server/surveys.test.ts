import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { DatabaseSync } from 'node:sqlite';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { board, surveyError } from '#lib/content/survey.ts';
import { MAX_TEXT, type Survey, type SurveyAnswer } from '#lib/content/types.ts';
import { loadMigrations, migrate, openDb } from './db.ts';
import { addPlayer } from './players.ts';
import { addSurvey, importSurveys, listSurveys, removeSurvey, updateSurvey } from './surveys.ts';

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
		expect(surveyCount()).toBe(247);
		migrate(db);

		expect(surveyCount()).toBe(247);
		const first = listSurveys(db)[0];
		expect(first.answers.length).toBeGreaterThanOrEqual(3);
		expect(first.answers[0]).toEqual({ text: expect.any(String), points: expect.any(Number) });
	});

	it('Scenario: Show surveys replace the placeholders', () => {
		migrate(db, loadMigrations().filter((m) => m.name <= '0006_seed_surveys.sql'));
		const fridge = listSurveys(db).find((s) => s.question === 'Nenne etwas, das man in einem Kühlschrank findet');
		const alex = addPlayer(db, 'Alex');
		const own = addSurvey(db, 'Nenne etwas mit Zähnen', [
			{ text: 'Hai', points: 50 },
			{ text: 'Kamm', points: 30 },
			{ text: 'Säge', points: 20 }
		]);
		if (!fridge || !alex.ok || !own.ok) throw new Error('setup failed');
		db.prepare('INSERT INTO feud_played (survey_id, player_id) VALUES (?, ?)').run(fridge.id, alex.player.id);

		migrate(db);

		const surveys = listSurveys(db);
		expect(surveys.some((s) => s.id === fridge.id)).toBe(false);
		expect(db.prepare('SELECT count(*) AS n FROM feud_played').get()?.n).toBe(0);
		expect(surveys.find((s) => s.question === 'Nenne etwas mit Zähnen')?.answers[0]).toEqual({ text: 'Hai', points: 50 });
		expect(surveys.some((s) => s.question === 'Nenne etwas, das man mit ins Badezimmer nimmt')).toBe(true);
		expect(surveyCount()).toBe(247);
	});

	it('Scenario: Deleted seed surveys stay deleted', () => {
		migrate(db);
		const [seed] = listSurveys(db);
		expect(removeSurvey(db, seed.id)).toBe(true);

		migrate(db);

		expect(listSurveys(db).some((s) => s.question === seed.question)).toBe(false);
		expect(surveyCount()).toBe(246);
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

	it('Scenario: Duplicate survey question rejected', () => {
		migrate(db);
		const answers = [
			{ text: 'Apfel', points: 40 },
			{ text: 'Birne', points: 30 },
			{ text: 'Kiwi', points: 20 }
		];
		const first = addSurvey(db, 'Nenne ein Obst', answers);
		const other = addSurvey(db, 'Nenne ein Tier', answers);
		if (!first.ok || !other.ok) throw new Error('surveys not saved');

		expect(addSurvey(db, 'nenne ein obst ', answers)).toEqual({
			ok: false,
			status: 409,
			message: 'Diese Frage gibt es schon.'
		});
		expect(updateSurvey(db, other.survey.id, 'NENNE EIN OBST', answers)).toEqual({
			ok: false,
			status: 409,
			message: 'Diese Frage gibt es schon.'
		});
		expect(listSurveys(db).filter((s) => /^nenne ein obst$/i.test(s.question))).toHaveLength(1);
		expect(listSurveys(db).find((s) => s.id === other.survey.id)?.question).toBe('Nenne ein Tier');
	});

	describe('validation reaches the caller as status 400', () => {
		const points = (...p: number[]): SurveyAnswer[] => p.map((x, i) => ({ text: `A${i + 1}`, points: x }));
		const rejected = (message: RegExp) => ({ ok: false, status: 400, message: expect.stringMatching(message) });

		it('Scenario: Duplicate answer within a survey rejected', () => {
			migrate(db);
			const before = surveyCount();

			expect(
				addSurvey(db, 'Nenne ein Obst', [
					{ text: 'Apfel', points: 10 },
					{ text: 'apfel', points: 10 },
					{ text: 'Birne', points: 10 }
				])
			).toEqual(rejected(/nur einmal/));
			expect(surveyCount()).toBe(before);
		});

		it('Scenario: Survey points must be whole numbers above zero', () => {
			migrate(db);
			const before = surveyCount();
			for (const p of [0, -3, 2.5, 'x' as unknown as number]) {
				const result = addSurvey(db, 'Frage', [{ text: 'A', points: p }, ...points(10, 10)]);

				expect(result, String(p)).toEqual(rejected(/ganze Zahlen über 0/));
			}
			expect(surveyCount()).toBe(before);
		});

		it('Scenario: Survey points sum at most 100', () => {
			migrate(db);

			expect(addSurvey(db, 'Zu viel', points(50, 30, 21))).toEqual(rejected(/100/));
			expect(addSurvey(db, 'Genau richtig', points(50, 30, 20))).toMatchObject({ ok: true });
			expect(listSurveys(db).map((s) => s.question)).not.toContain('Zu viel');
		});

		it('Scenario: Survey needs three to eight answers', () => {
			migrate(db);
			const save = (n: number) => addSurvey(db, `Mit ${n}`, points(...Array(n).fill(5)));

			expect(save(2)).toEqual(rejected(/3 bis 8/));
			expect(save(9)).toEqual(rejected(/3 bis 8/));
			expect(save(3)).toMatchObject({ ok: true });
			expect(save(8)).toMatchObject({ ok: true });
			expect(listSurveys(db).map((s) => s.question)).not.toContain('Mit 2');
		});

		it('Scenario: Overlong survey text rejected', () => {
			migrate(db);
			const long = 'x'.repeat(MAX_TEXT + 1);
			const before = surveyCount();

			expect(addSurvey(db, long, points(10, 10, 10))).toEqual(rejected(/200 Zeichen/));
			expect(addSurvey(db, 'Frage', [{ text: long, points: 10 }, ...points(10, 10)])).toEqual(rejected(/200 Zeichen/));
			expect(surveyCount()).toBe(before);
			expect(
				addSurvey(db, 'x'.repeat(MAX_TEXT), [{ text: 'y'.repeat(MAX_TEXT), points: 10 }, ...points(10, 10)])
			).toMatchObject({ ok: true });
		});
	});

	it('treats umlaut case variants of a question as duplicates on add, update and import', () => {
		migrate(db);
		const answers = [
			{ text: 'Apfel', points: 40 },
			{ text: 'Birne', points: 30 },
			{ text: 'Kiwi', points: 20 }
		];
		const first = addSurvey(db, 'Äpfel nennen', answers);
		const other = addSurvey(db, 'Nenne ein Tier', answers);
		if (!first.ok || !other.ok) throw new Error('surveys not saved');
		const before = surveyCount();
		const dup = { ok: false, status: 409, message: 'Diese Frage gibt es schon.' };

		expect(addSurvey(db, 'äpfel nennen', answers)).toEqual(dup);
		expect(updateSurvey(db, other.survey.id, 'ÄPFEL NENNEN', answers)).toEqual(dup);
		expect(updateSurvey(db, first.survey.id, 'äpfel nennen', answers)).toMatchObject({ ok: true });
		const report = importSurveys(db, 'ÄPFEL NENNEN | A : 10 | B : 10 | C : 10\nÖl | A : 10 | B : 10 | C : 10\nöl | A : 10 | B : 10 | C : 10');

		expect(report).toMatchObject({ imported: 1, duplicates: 2 });
		expect(surveyCount()).toBe(before + 1);
	});

	it('adds, updates and lists a survey in entry order, trimmed', () => {
		migrate(db);
		const added = addSurvey(db, ' Frage ', [
			{ text: ' A ', points: 10 },
			{ text: 'B', points: 30 },
			{ text: 'C', points: 20 }
		]);
		expect(added).toEqual({
			ok: true,
			survey: {
				id: expect.any(Number),
				question: 'Frage',
				answers: [
					{ text: 'A', points: 10 },
					{ text: 'B', points: 30 },
					{ text: 'C', points: 20 }
				]
			}
		});
		if (!added.ok) return;
		const id = added.survey.id;
		const four = [...added.survey.answers, { text: 'D', points: 5 }];

		expect(updateSurvey(db, id, 'Frage', four)).toEqual({ ok: true, survey: { id, question: 'Frage', answers: four } });
		expect(listSurveys(db).find((s) => s.id === id)?.answers).toEqual(four);
		expect(updateSurvey(db, 99999, 'Frage 2', four)).toMatchObject({ ok: false, status: 404 });
		expect(addSurvey(db, 'Zu wenig', four.slice(0, 2))).toMatchObject({ ok: false, status: 400 });
		expect(updateSurvey(db, id, 'Frage', four.slice(0, 2))).toMatchObject({ ok: false, status: 400 });
	});

	it('Scenario: Survey bulk import reports per line', () => {
		migrate(db);
		const before = surveyCount();
		expect(addSurvey(db, 'Schon da', [
			{ text: 'A', points: 10 },
			{ text: 'B', points: 10 },
			{ text: 'C', points: 10 }
		]).ok).toBe(true);
		const text = [
			'Nenne eine Uhrzeit | Uhr: 12:00 : 30 | Mittag : 20 | Abend : 10',
			'',
			'kaputt ohne Trenner',
			'Zwei Antworten | A : 10 | B : 20',
			'schon DA | A : 10 | B : 10 | C : 10'
		].join('\n');

		const report = importSurveys(db, text);

		expect(report).toEqual({
			imported: 1,
			duplicates: 1,
			skipped: 1,
			errors: [
				{ line: 3, message: expect.any(String) },
				{ line: 4, message: expect.stringMatching(/3 bis 8/) }
			]
		});
		expect(surveyCount()).toBe(before + 2);
		expect(listSurveys(db).find((s) => s.question === 'Nenne eine Uhrzeit')?.answers[0]).toEqual({
			text: 'Uhr: 12:00',
			points: 30
		});
	});

	it('Scenario: Seed surveys are valid', () => {
		migrate(db);

		const surveys = listSurveys(db);

		expect(surveys).toHaveLength(247);
		for (const s of surveys) expect(surveyError(s.question, s.answers), s.question).toBeNull();
		expect(new Set(surveys.map((s) => s.question.toLowerCase())).size).toBe(247);
	});
});
