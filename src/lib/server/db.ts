import { mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

export interface Migration {
	name: string;
	sql: string;
}

let instance: DatabaseSync | null = null;

export function openDb(path: string): DatabaseSync {
	mkdirSync(dirname(resolve(path)), { recursive: true });
	return new DatabaseSync(path);
}

export function loadMigrations(dir = 'migrations'): Migration[] {
	return readdirSync(dir)
		.filter((f) => f.endsWith('.sql'))
		.sort()
		.map((name) => ({ name, sql: readFileSync(join(dir, name), 'utf8') }));
}

export function migrate(db: DatabaseSync, migrations: Migration[] = loadMigrations()): void {
	db.exec('CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TEXT)');
	const done = new Set(
		db
			.prepare('SELECT name FROM schema_migrations')
			.all()
			.map((r) => String(r.name))
	);
	const record = db.prepare(
		"INSERT INTO schema_migrations (name, applied_at) VALUES (?, datetime('now'))"
	);
	for (const m of migrations) {
		if (done.has(m.name)) continue;
		db.exec('BEGIN');
		try {
			db.exec(m.sql);
			record.run(m.name);
			db.exec('COMMIT');
		} catch (e) {
			db.exec('ROLLBACK');
			throw new Error(`Migration ${m.name} failed: ${(e as Error).message}`, { cause: e });
		}
	}
}

export function getDb(): DatabaseSync {
	if (!instance) {
		const db = openDb(process.env.DATABASE_PATH ?? 'rues-arcade.db');
		migrate(db);
		instance = db;
	}
	return instance;
}

export function closeDb(): void {
	if (instance?.isOpen) instance.close();
	instance = null;
}
