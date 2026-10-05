import { existsSync, statSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';
import { loadMigrations, migrate, openDb } from '../src/lib/server/db.ts';

const copies = [
	{
		from: 'imposter_prompts',
		cols: ['crew_question', 'imposter_question'],
		to: 'imposter_pairs',
		into: ['crew', 'imposter']
	},
	{
		from: 'wavelength_prompts',
		cols: ['left_text', 'right_text'],
		to: 'wavelength_spectra',
		into: ['left_text', 'right_text']
	}
];

const { positionals, values } = parseArgs({
	allowPositionals: true,
	options: { into: { type: 'string' } }
});
if (positionals.length !== 1 || !values.into) {
	console.error('usage: npm run import -- <old-db> --into <new.db>');
	process.exit(1);
}

const path = positionals[0];
if (!existsSync(path)) fail(`${path} does not exist`);
// SQLite opens a zero-byte file as an empty database
if (statSync(path).size === 0) fail(`${path} is not a SQLite database`);
const source = new DatabaseSync(path, { readOnly: true });
let tables;
try {
	const rows = source.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all();
	tables = new Set(rows.map((r) => r.name));
} catch {
	fail(`${path} is not a SQLite database`);
}
if (!copies.some((c) => tables.has(c.from)))
	fail(`${path} has neither ${copies.map((c) => c.from).join(' nor ')}`);

const target = openDb(values.into);
migrate(target, loadMigrations(fileURLToPath(new URL('../migrations', import.meta.url))));

let missing = 0;
target.exec('BEGIN');
for (const c of copies) {
	if (!tables.has(c.from)) {
		console.error(`${c.to}: skipped, table ${c.from} is missing in ${path}`);
		missing++;
		continue;
	}
	const rows = source.prepare(`SELECT ${c.cols.join(', ')} FROM ${c.from} ORDER BY id`).all();
	const insert = target.prepare(
		`INSERT OR IGNORE INTO ${c.to} (${c.into.join(', ')}) VALUES (?, ?)`
	);
	let imported = 0;
	for (const r of rows) imported += Number(insert.run(r[c.cols[0]], r[c.cols[1]]).changes);
	console.log(`${c.to}: ${imported} imported, ${rows.length - imported} already present`);
}
target.exec('COMMIT');
if (missing) process.exit(1);

function fail(message) {
	console.error(message);
	process.exit(1);
}
