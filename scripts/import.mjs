import { parseArgs } from 'node:util';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';
import { loadMigrations, migrate, openDb } from '../src/lib/server/db.ts';

const copies = [
	{ from: 'imposter_prompts', cols: ['crew_question', 'imposter_question'], to: 'imposter_pairs', into: ['crew', 'imposter'] },
	{ from: 'wavelength_prompts', cols: ['left_text', 'right_text'], to: 'wavelength_spectra', into: ['left_text', 'right_text'] }
];

const { positionals, values } = parseArgs({ allowPositionals: true, options: { into: { type: 'string' } } });
if (positionals.length !== 1 || !values.into) {
	console.error('usage: npm run import -- <old-db> --into <new.db>');
	process.exit(1);
}

const source = new DatabaseSync(positionals[0], { readOnly: true });
const target = openDb(values.into);
migrate(target, loadMigrations(fileURLToPath(new URL('../migrations', import.meta.url))));

target.exec('BEGIN');
for (const c of copies) {
	const rows = source.prepare(`SELECT ${c.cols.join(', ')} FROM ${c.from} ORDER BY id`).all();
	const insert = target.prepare(`INSERT OR IGNORE INTO ${c.to} (${c.into.join(', ')}) VALUES (?, ?)`);
	let imported = 0;
	for (const r of rows) imported += Number(insert.run(r[c.cols[0]], r[c.cols[1]]).changes);
	console.log(`${c.to}: ${imported} imported, ${rows.length - imported} already present`);
}
target.exec('COMMIT');
