## MODIFIED Requirements

### Requirement: Start screens of the new games
The Codes, What Rhymes with Duck and Most Likely To start screens SHALL carry their own "So geht's" rules (three
lines each, neutral German) and count their content with their own nouns: Codes and Duck "Wort" / "Wörter", Most
Likely To "Spruch" / "Sprüche". Most Likely To's rules SHALL describe the team game: a team per turn, pointing on
three, points for the largest group that pointed at the same person, the team with the most points wins.

#### Scenario: So geht's for the new games
- **WHEN** the Codes, Duck and Most Likely To start screens are opened
- **THEN** each "So geht's" holds three rules, the first reading "In Teams: pro Runde kennen alle Erklärer dasselbe geheime Wort.", "Ein Wort wird für alle aufgedeckt, alle suchen gleichzeitig einen Reim darauf." and "Reihum ist ein Team dran und bekommt einen Spruch: Wer würde am ehesten …?" respectively, Most Likely To's rules name the team points and the winning team, and none contains "!"
- **proof:** e2e

#### Scenario: Inhalte card counts the seeded content
- **WHEN** on a fresh database the Codes, Duck and Most Likely To start screens are opened
- **THEN** the Inhalte cards read "91 Wörter ansehen und bearbeiten", "750 Wörter ansehen und bearbeiten" and "60 Sprüche ansehen und bearbeiten"
- **proof:** e2e

#### Scenario: New start banners carry title, badge and range
- **WHEN** the Codes, Duck and Most Likely To start screens are opened
- **THEN** the banners show "Codes" with badge "C" and "4–20 Spieler", "What Rhymes with Duck" with badge "W" and "4–16 Spieler", and "Most Likely To" with badge "M" and "4–20 Spieler", each with its pitch
- **proof:** e2e
