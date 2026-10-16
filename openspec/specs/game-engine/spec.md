# game-engine Specification

## Purpose
TBD - created by archiving change party-games-rebuild. Update Purpose after archive.
## Requirements
### Requirement: Pure reducer with seeded RNG
Each game SHALL be implemented as a pure reducer `(state, action) → state`; all randomness SHALL come from a
seeded RNG whose state is part of the game state.

#### Scenario: Same seed and actions give the same state
- **WHEN** a game is initialised twice with the same players, config, content and seed and given the same actions
- **THEN** both resulting states are deeply equal
- **proof:** unit

#### Scenario: Reducer does not mutate its input
- **WHEN** an action is applied to a frozen state
- **THEN** a new state is returned and no error is thrown
- **proof:** unit

### Requirement: Session save and resume
A running session SHALL be saved on the device after every action and restored on reload; "Spiel beenden"
SHALL clear it. A saved session SHALL be checked against its game's shape template before it is resumed: the opening
state of the game's demo script, or, for a game without a demo (Blood on the Clocktower), the explicit template its
registry entry supplies. The template SHALL use `null` for fields that are sometimes null and placeholders for
nullable fields, so that a valid state in any phase fits it.

#### Scenario: Reload mid-game resumes the same phase
- **WHEN** a game is in progress and the page is reloaded
- **THEN** the same phase with the same players and content is shown
- **proof:** e2e

#### Scenario: Spiel beenden clears the session
- **WHEN** the user chooses "Spiel beenden" and reopens the game
- **THEN** the start screen is shown and no session is restored
- **proof:** e2e

#### Scenario: Old or corrupt saved state discarded
- **WHEN** the stored session has an older version, is not valid JSON, or lacks the shape of the game's state
- **THEN** it is discarded, a notice is shown, and the app does not crash
- **proof:** e2e

#### Scenario: Two tabs last write wins
- **WHEN** two tabs write the same game's session
- **THEN** the stored session is the one written last
- **proof:** unit

#### Scenario: Roster edit mid-game keeps the session snapshot
- **WHEN** a player is removed from the roster while a session is running
- **THEN** the running session still contains its original players
- **proof:** unit

#### Scenario: Game without a demo checks its explicit template
- **WHEN** a Blood on the Clocktower session is loaded that is valid, one that lacks its `seats` field and one whose seats lack `alive`
- **THEN** the valid one is resumed and the other two are discarded, and the check never calls a demo script
- **proof:** unit

### Requirement: Play header
During play (`/spiele/<slug>/spielen`) the header SHALL show the game's name, its round status (see "Round status in
the play header") and, once the session is loaded, "Spiel beenden" as the red `danger` Button with that full label. It
SHALL offer no Demo control; the demo is reached from the start screen's Demo card only. "Spiel beenden" SHALL open the
arcade Modal "Spiel beenden?" whose "Beenden" is a `danger` Button and whose "Weiterspielen" closes it and keeps the
game; confirming SHALL clear the session and return to the start screen. A stale or discarded session SHALL show its
notice with no Demo control and no round status. The demo route's header SHALL show the same round status under the
label "Demo", without "Spiel beenden".

#### Scenario: Play header has no Demo
- **WHEN** a running game of each of the six games is opened at `/spielen` at 390px and at 1280px
- **THEN** the page holds no button or link named "Demo", and the header holds "Spiel beenden" with that full label and the `--imposter` background
- **proof:** e2e

#### Scenario: Ending asks with a red Beenden
- **WHEN** "Spiel beenden" is tapped, the Modal is dismissed with "Weiterspielen", then "Spiel beenden" is tapped again and "Beenden" confirmed
- **THEN** the Modal "Spiel beenden?" shows "Beenden" with the `--imposter` background, after "Weiterspielen" the same phase is shown, and after "Beenden" the start screen is shown and reopening the game restores no session
- **proof:** e2e

#### Scenario: Discarded session shows no Demo and no status
- **WHEN** `/spielen` is opened with a stored session of an older version
- **THEN** the discard notice is shown, and the page holds no "Demo" control, no round status and no progress line
- **proof:** e2e

### Requirement: Round status in the play header
Each game SHALL supply `status(state)`: the parts of its round status and a progress fraction, or no progress. The play
and demo headers SHALL render the parts joined by " · " in the game's UI font (Sora, or Alegreya Sans inside Blood on
the Clocktower; never Press Start 2P) and, when progress is given, a thin line in the game colour filled to that
fraction; no Screen SHALL render its own round label. The formats SHALL be:
Imposter "Runde n" without progress; Wavelength Versus "Runde r / R · <Team>", Koop "Runde r / R · Zug t / T"; Codes
"Runde r / R · <Aufdecken | Spiel | Rundenergebnis>"; What Rhymes with Duck "Ziel T Punkte" with progress = the
leading score / T, clamped to 1; Most
Likely To "Runde r / R · Team k / n"; Family Feud "Runde r / R · <Duell | Tafel | Stehlen | Ergebnis>" and in sudden
death "Stichfrage · <step>"; Blood on the Clocktower without progress: "Aufbau" during setup, "Rollen · Platz s / N"
during the role reveal, "Nacht k · a von N leben" at night, "Tag k · a von N leben" from dawn to the end of the day,
and "Spielende" once the game is over. At game over a game with rounds SHALL read "Runde R / R". Progress SHALL be
r / R, and 1 at game over and in sudden death. On a 390px phone the header SHALL wrap without horizontal scroll.

#### Scenario: Round status per game
- **WHEN** `status` is computed for each game in a mid-game state, at game over, for Wavelength in Versus and Koop, and for Feud in sudden death
- **THEN** each returns the parts and progress of the formats above, Imposter with no progress
- **proof:** unit

#### Scenario: Last round fills the progress line
- **WHEN** `status` is computed in the last round of Wavelength, Codes, Most Likely To and Family Feud, and at their game over
- **THEN** the progress is 1 in each case
- **proof:** unit ("Scenario: Round status per game")

#### Scenario: Duck progress follows the leading score
- **WHEN** Duck `status` is computed with target 10 for top scores 0, 4 and 12 (a score past the target after the last word)
- **THEN** the parts read "Ziel 10 Punkte" and the progress is 0, 0.4 and 1
- **proof:** unit

#### Scenario: Status and progress in the header
- **WHEN** a Most Likely To session in round 2 of 5 with the first of two teams on turn is opened at `/spielen`
- **THEN** the header reads "Runde 2 / 5 · Team 1 / 2" in Sora, a progress line in `--most-likely` is filled to 40%, and no element inside the stage reads "Runde 2 / 5"
- **proof:** e2e

#### Scenario: Status without a total has no progress line
- **WHEN** an Imposter session in round 2 is opened at `/spielen` and in the demo
- **THEN** each header reads "Runde 2" and shows no progress line
- **proof:** e2e

#### Scenario: Header wraps on a phone
- **WHEN** a Wavelength Versus session whose team is named "Die unglaublich langen Teamnamen" is opened at 390px
- **THEN** the header shows name, status and "Spiel beenden" without horizontal scroll and every header control is at least 44px
- **proof:** e2e

#### Scenario: Clocktower status per phase
- **WHEN** Blood on the Clocktower `status` is computed for 8 players in setup, at the reveal of seat 3, in night 2 with 7 alive, on day 2 with 6 alive and at the end
- **THEN** the parts are ["Aufbau"], ["Rollen", "Platz 3 / 8"], ["Nacht 2", "7 von 8 leben"], ["Tag 2", "6 von 8 leben"] and ["Spielende"], each with no progress
- **proof:** unit

### Requirement: Games without content
A game SHALL be able to declare that it has no content pool: `contentType: 'none'` with `minContent: 0`. For such a game
the start screen SHALL show no content check line and no Inhalte card, the lobby SHALL start the game without fetching
content (`init` receives an empty `content` list), and `/spiele/<slug>/inhalte` SHALL answer 404. Games with content
keep their checks, cards and fetch unchanged.

#### Scenario: Game without content starts without a content fetch
- **WHEN** a Blood on the Clocktower game is started from the lobby
- **THEN** no request to `/api/content/` is made and the play screen opens
- **proof:** e2e

#### Scenario: Games with content keep their content gate
- **WHEN** the Imposter content pool of a fresh database is empty and its start screen is opened
- **THEN** "Los geht's" is disabled with "Für Imposter gibt es noch keine Inhalte." as before
- **proof:** e2e ("Scenario: Empty pool blocks start")

