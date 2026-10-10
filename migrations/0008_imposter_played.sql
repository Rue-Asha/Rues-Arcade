ALTER TABLE imposter_pairs ADD COLUMN interchangeable INTEGER NOT NULL DEFAULT 0;

CREATE TABLE imposter_played (
	pair_id INTEGER NOT NULL REFERENCES imposter_pairs(id) ON DELETE CASCADE,
	player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
	PRIMARY KEY (pair_id, player_id)
);
