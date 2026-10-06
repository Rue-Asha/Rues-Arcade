import { expect, test, type Locator, type Page } from '@playwright/test';
import { deleteSurvey, shot, surveyByQuestion } from './helpers.ts';

const inhalte = '/spiele/family-feud/inhalte';

// phone and desktop share one database and run in parallel, so each project gets its own question text
const card = (page: Page, question: string): Locator =>
	page.getByRole('listitem').filter({ has: page.getByText(question, { exact: true }) });

const answers = (c: Locator) => c.getByRole('list', { name: 'Antworten' }).getByRole('listitem');

test('Scenario: Add, edit and delete a survey', async ({ page }, info) => {
	const question = `Nenne ein Obst (${info.project.name})`;
	await page.goto(inhalte);
	const add = page.getByRole('form', { name: 'Neue Umfrage' });

	await add.getByLabel('Frage', { exact: true }).fill(question);
	for (const [i, [text, points]] of [['Apfel', '40'], ['Birne', '30'], ['Kiwi', '20']].entries()) {
		await add.getByLabel(`Antwort ${i + 1}`, { exact: true }).fill(text);
		await add.getByLabel(`Punkte ${i + 1}`, { exact: true }).fill(points);
	}
	await add.getByRole('button', { name: 'Hinzufügen', exact: true }).click();

	await expect(card(page, question)).toHaveCount(1);
	await expect(answers(card(page, question))).toHaveText([/Apfel\s*40/, /Birne\s*30/, /Kiwi\s*20/]);
	await shot(page, info, 'inhalte-family-feud');

	await page.getByRole('button', { name: `${question} bearbeiten` }).click();
	const edit = page.getByRole('form', { name: `${question} bearbeiten` });
	await edit.getByRole('button', { name: 'Antwort hinzufügen' }).click();
	await edit.getByLabel('Antwort 4', { exact: true }).fill('Mango');
	await edit.getByLabel('Punkte 4', { exact: true }).fill('5');
	await edit.getByLabel('Punkte 1', { exact: true }).fill('45');
	await edit.getByRole('button', { name: 'Speichern' }).click();

	await expect(answers(card(page, question))).toHaveText([/Apfel\s*45/, /Birne\s*30/, /Kiwi\s*20/, /Mango\s*5/]);
	await page.reload();
	await expect(answers(card(page, question))).toHaveCount(4);

	await page.getByRole('button', { name: `${question} löschen` }).click();
	await page.getByRole('dialog').getByRole('button', { name: 'Löschen' }).click();
	await expect(page.getByRole('dialog')).toBeHidden();
	await expect(card(page, question)).toHaveCount(0);
	await page.reload();
	await expect(card(page, question)).toHaveCount(0);
});

test('Scenario: Bulk import of surveys on the Inhalte page', async ({ page, request }, info) => {
	const one = `Nenne eine Farbe (${info.project.name})`;
	const two = `Nenne ein Tier (${info.project.name})`;
	await page.goto(inhalte);

	await page
		.getByLabel('Mehrere auf einmal')
		.fill([`${one} | Rot : 40 | Blau : 30 | Grün : 20`, `${two} | Hund : 50 | Katze : 30 | Maus : 10`].join('\n'));
	await page.getByRole('button', { name: 'Importieren' }).click();

	await expect(page.getByRole('status')).toContainText('2 importiert');
	await expect(card(page, one)).toHaveCount(1);
	await expect(card(page, two)).toHaveCount(1);
	await expect(answers(card(page, two))).toHaveText([/Hund\s*50/, /Katze\s*30/, /Maus\s*10/]);

	for (const q of [one, two]) await deleteSurvey(request, (await surveyByQuestion(request, q)).id);
});

test('an invalid survey shows the server message and is kept in the form', async ({ page }, info) => {
	const question = `Ungültig (${info.project.name})`;
	await page.goto(inhalte);
	const add = page.getByRole('form', { name: 'Neue Umfrage' });

	await add.getByLabel('Frage', { exact: true }).fill(question);
	for (const i of [1, 2, 3]) {
		await add.getByLabel(`Antwort ${i}`, { exact: true }).fill(`Eins ${i}`);
		await add.getByLabel(`Punkte ${i}`, { exact: true }).fill(i === 3 ? '0' : '10');
	}
	await add.getByRole('button', { name: 'Hinzufügen', exact: true }).click();

	await expect(add.getByRole('alert')).toContainText('ganze Zahlen über 0');
	await expect(add.getByLabel('Frage', { exact: true })).toHaveValue(question);
	await expect(card(page, question)).toHaveCount(0);
});
