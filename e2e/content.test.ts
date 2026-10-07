import { expect, test, type Locator, type TestInfo } from '@playwright/test';
import { emptyServer, shot } from './helpers.ts';

// phone and desktop share one database and run in parallel; giving each project its own game keeps
// the scenario's literal entries from colliding as duplicates.
const game = (info: TestInfo) =>
	info.project.name === 'phone'
		? { slug: 'imposter', type: 'imposter_pairs', a: 'Crew-Frage', b: 'Imposter-Frage' }
		: { slug: 'wavelength', type: 'wavelength_spectra', a: 'Links', b: 'Rechts' };

// hasText matches case-insensitive substrings, so 'Tag' would also catch another test's '…Mittag?'.
const entry = (entries: Locator, a: string) =>
	entries.filter({ has: entries.page().getByText(a, { exact: true }) });

test('Scenario: Add, edit and delete an entry', async ({ page }, info) => {
	const g = game(info);
	await page.goto(`/spiele/${g.slug}/inhalte`);
	const add = page.getByRole('form', { name: 'Neuer Eintrag' });

	await add.getByLabel(g.a).fill('Hund');
	await add.getByLabel(g.b).fill('Katze');
	await add.getByRole('button', { name: 'Hinzufügen' }).click();
	const entries = page.getByRole('list', { name: 'Einträge' }).getByRole('listitem');
	await expect(entry(entries, 'Hund')).toHaveText([/Hund\s*Katze/]);
	await expect(add.getByLabel(g.a)).toHaveValue('');
	await shot(page, info, `inhalte-${g.slug}`);

	await page.getByRole('button', { name: 'Hund | Katze bearbeiten' }).click();
	const edit = page.getByRole('form', { name: 'Hund | Katze bearbeiten' });
	await edit.getByLabel(g.b).fill('Maus');
	await edit.getByRole('button', { name: 'Speichern' }).click();
	await expect(entry(entries, 'Hund')).toHaveText([/Hund\s*Maus/]);

	await page.reload();
	await expect(entry(entries, 'Hund')).toHaveText([/Hund\s*Maus/]);

	await page.getByRole('button', { name: 'Hund | Maus löschen' }).click();
	await page.getByRole('dialog').getByRole('button', { name: 'Löschen' }).click();
	await expect(page.getByRole('dialog')).toBeHidden();
	await expect(entry(entries, 'Hund')).toHaveCount(0);

	await page.reload();
	await expect(page.getByRole('list', { name: 'Einträge' }).getByText('Hund')).toHaveCount(0);
});

test('Scenario: Delete asks for confirmation', async ({ page, request }, info) => {
	const g = game(info);
	const res = await request.post(`/api/content/${g.type}`, { data: { a: 'Bleibt', b: 'Hier' } });
	expect(res.status()).toBe(201);
	const { id } = await res.json();

	await page.goto(`/spiele/${g.slug}/inhalte`);
	await page.getByRole('button', { name: 'Bleibt | Hier löschen' }).click();
	const dialog = page.getByRole('dialog');
	await expect(dialog).toContainText('Bleibt');
	await shot(page, info, `inhalte-loeschen-${g.slug}`);
	await dialog.getByRole('button', { name: 'Abbrechen' }).click();

	await expect(dialog).toBeHidden();
	const entries = page.getByRole('list', { name: 'Einträge' }).getByRole('listitem');
	await expect(entry(entries, 'Bleibt')).toHaveCount(1);
	await page.reload();
	await expect(entry(entries, 'Bleibt')).toHaveCount(1);

	await request.delete(`/api/content/${g.type}/${id}`);
});

test('bulk import shows the report and lists the new entries', async ({ page, request }, info) => {
	const g = game(info);
	await request.post(`/api/content/${g.type}`, { data: { a: 'Schon', b: 'Da' } });
	await page.goto(`/spiele/${g.slug}/inhalte`);

	await page
		.getByLabel('Mehrere auf einmal')
		.fill(['Sonne | Mond', '', 'kaputt ohne Trenner', 'Schon | Da', 'Tag | Nacht'].join('\n'));
	await page.getByRole('button', { name: 'Importieren' }).click();

	const report = page.getByRole('status');
	await expect(report).toContainText('2 importiert');
	await expect(report).toContainText('1 doppelt');
	await expect(report).toContainText('1 leer');
	await expect(report).toContainText('Zeile 3');
	const entries = page.getByRole('list', { name: 'Einträge' }).getByRole('listitem');
	await expect(entry(entries, 'Sonne')).toHaveCount(1);
	await expect(entry(entries, 'Tag')).toHaveCount(1);
	await expect(page.getByLabel('Mehrere auf einmal')).toHaveValue('');
});

test('a rejected entry shows the server message', async ({ page }, info) => {
	const g = game(info);
	await page.goto(`/spiele/${g.slug}/inhalte`);
	const add = page.getByRole('form', { name: 'Neuer Eintrag' });

	await add.getByLabel(g.a).fill('x'.repeat(201));
	await add.getByLabel(g.b).fill('y');
	await add.getByRole('button', { name: 'Hinzufügen' }).click();
	await expect(add.getByRole('alert')).toContainText('Höchstens 200 Zeichen');
});

// phone and desktop would collide on the shared DB with the scenario's literal words, so each gets its own server
test('Scenario: Add, edit and delete a single entry', async ({ page }, info) => {
	const server = await emptyServer(info, 'inhalte-codes');
	try {
		await page.goto(`${server.origin}/spiele/codes/inhalte`);
		const add = page.getByRole('form', { name: 'Neuer Eintrag' });
		await expect(add.getByRole('textbox')).toHaveCount(1);

		await add.getByLabel('Wort').fill('Laterne');
		await add.getByRole('button', { name: 'Hinzufügen' }).click();
		const entries = page.getByRole('list', { name: 'Einträge' }).getByRole('listitem');
		await expect(entry(entries, 'Laterne')).toHaveText(['Laterne']);
		await expect(add.getByLabel('Wort')).toHaveValue('');
		await shot(page, info, 'inhalte-codes');

		await page.getByRole('button', { name: 'Laterne bearbeiten' }).click();
		const edit = page.getByRole('form', { name: 'Laterne bearbeiten' });
		await expect(edit.getByRole('textbox')).toHaveCount(1);
		await edit.getByLabel('Wort').fill('Leuchtturm-Laterne');
		await edit.getByRole('button', { name: 'Speichern' }).click();
		await expect(entry(entries, 'Leuchtturm-Laterne')).toHaveText(['Leuchtturm-Laterne']);
		await expect(entry(entries, 'Laterne')).toHaveCount(0);

		await page.reload();
		await expect(entry(entries, 'Leuchtturm-Laterne')).toHaveCount(1);

		await page.getByRole('button', { name: 'Leuchtturm-Laterne löschen' }).click();
		const dialog = page.getByRole('dialog');
		await expect(dialog).toContainText('Leuchtturm-Laterne');
		await dialog.getByRole('button', { name: 'Löschen' }).click();
		await expect(dialog).toBeHidden();
		await expect(entry(entries, 'Leuchtturm-Laterne')).toHaveCount(0);

		await page.reload();
		await expect(page.getByRole('list', { name: 'Einträge' }).getByText('Laterne')).toHaveCount(0);
	} finally {
		server.close();
	}
});

test('Scenario: Bulk import of single entries on the Inhalte page', async ({ page }, info) => {
	const server = await emptyServer(info, 'inhalte-duck');
	try {
		await page.goto(`${server.origin}/spiele/duck/inhalte`);
		await expect(page.getByText('Eine Zeile pro Eintrag.', { exact: true })).toBeVisible();
		const words = ['Pinsel', 'Kiste', 'Kerze'];
		await page.getByLabel('Mehrere auf einmal').fill(words.join('\n'));
		await page.getByRole('button', { name: 'Importieren' }).click();

		const report = page.getByRole('status');
		await expect(report).toContainText('3 importiert');
		await expect(report).toContainText('0 doppelt');
		const entries = page.getByRole('list', { name: 'Einträge' }).getByRole('listitem');
		for (const word of words) await expect(entry(entries, word)).toHaveText([word]);
		await expect(page.getByLabel('Mehrere auf einmal')).toHaveValue('');
	} finally {
		server.close();
	}
});
