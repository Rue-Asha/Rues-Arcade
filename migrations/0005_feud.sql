CREATE TABLE feud_surveys (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	question TEXT NOT NULL UNIQUE COLLATE NOCASE,
	answers TEXT NOT NULL,
	created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE feud_played (
	survey_id INTEGER NOT NULL REFERENCES feud_surveys(id) ON DELETE CASCADE,
	player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
	PRIMARY KEY (survey_id, player_id)
);
