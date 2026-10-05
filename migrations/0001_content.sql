CREATE TABLE imposter_pairs (
	id INTEGER PRIMARY KEY,
	crew TEXT NOT NULL,
	imposter TEXT NOT NULL,
	created_at TEXT NOT NULL DEFAULT (datetime('now')),
	UNIQUE (crew, imposter)
);

CREATE TABLE wavelength_spectra (
	id INTEGER PRIMARY KEY,
	left_text TEXT NOT NULL,
	right_text TEXT NOT NULL,
	created_at TEXT NOT NULL DEFAULT (datetime('now')),
	UNIQUE (left_text, right_text)
);
