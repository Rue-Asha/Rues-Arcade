CREATE TABLE codes_words (
	id INTEGER PRIMARY KEY,
	word TEXT NOT NULL UNIQUE,
	created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE duck_words (
	id INTEGER PRIMARY KEY,
	word TEXT NOT NULL UNIQUE,
	created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE most_likely_prompts (
	id INTEGER PRIMARY KEY,
	text TEXT NOT NULL UNIQUE,
	created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
