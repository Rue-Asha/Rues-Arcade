CREATE TABLE schema_migrations (
	version TEXT PRIMARY KEY,
	applied_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE imposter_prompts (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	crew_question TEXT NOT NULL,
	imposter_question TEXT NOT NULL,
	created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE wavelength_prompts (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	left_text TEXT NOT NULL,
	right_text TEXT NOT NULL,
	created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO imposter_prompts (crew_question, imposter_question) VALUES
	('Wie groß darf dein Partner maximal sein?', 'Wie groß wärst du gerne?'),
	('Was würde {NAME} nie essen?', 'Was isst du am liebsten?'),
	('Wer gewinnt im Armdrücken, {NAME} oder {NAME2}?', 'Wer ist hier am stärksten?');

INSERT INTO wavelength_prompts (left_text, right_text) VALUES
	('Green Flag', 'Red Flag'),
	('Unterbewertet', 'Überbewertet');
